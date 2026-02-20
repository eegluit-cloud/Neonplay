import {
    Injectable,
    Logger,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

// Currency balance field mapping
const CURRENCY_BALANCE_FIELDS: Record<string, string> = {
    USD: 'usdBalance',
    EUR: 'eurBalance',
    GBP: 'gbpBalance',
    CAD: 'cadBalance',
    AUD: 'audBalance',
    PHP: 'phpBalance',
    INR: 'inrBalance',
    THB: 'thbBalance',
    CNY: 'cnyBalance',
    JPY: 'jpyBalance',
    USDC: 'usdcBalance',
    USDT: 'usdtBalance',
    BTC: 'btcBalance',
    ETH: 'ethBalance',
    SOL: 'solBalance',
    DOGE: 'dogeBalance',
};

@Injectable()
export class BonusService {
    private readonly logger = new Logger(BonusService.name);

    constructor(private readonly prisma: PrismaService) { }

    // ============================================================================
    // WAGERING PROGRESS — Called after every game round
    // ============================================================================

    /**
     * Process a game round bet for all active bonuses with wagering requirements.
     * Called from GamesService.recordGameRound() after the main transaction.
     *
     * Whitelist model: only games with an explicit BonusGameContribution entry
     * count toward wagering (0% default for unregistered games).
     */
    async processWagerForBonuses(
        userId: string,
        gameId: string,
        betAmountUsdc: Decimal,
        gameRoundId: string,
    ): Promise<void> {
        try {
            // 1. Find all active (claimed, non-expired) bonuses for this user that have wagering targets
            const now = new Date();
            const activeBonuses = await this.prisma.userPromotion.findMany({
                where: {
                    userId,
                    status: 'claimed',
                    wageringTarget: { not: null },
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gte: now } },
                    ],
                },
                include: {
                    promotion: {
                        include: {
                            gameContributions: {
                                where: { gameId },
                            },
                        },
                    },
                },
            });

            if (activeBonuses.length === 0) return;

            for (const userPromo of activeBonuses) {
                // 2. Check if game is whitelisted for this bonus
                const contribution = userPromo.promotion.gameContributions[0];
                if (!contribution) {
                    // Game not in whitelist — 0% contribution, skip
                    continue;
                }

                const contributionPercent = new Decimal(contribution.contributionPercent);
                if (contributionPercent.lte(0)) continue;

                // 3. Calculate counted amount
                const countedAmount = betAmountUsdc.mul(contributionPercent).div(100);

                // 4. Create wager log (gameRoundId is unique, so this is idempotent)
                try {
                    await this.prisma.userBonusWagerLog.create({
                        data: {
                            userPromotionId: userPromo.id,
                            gameRoundId,
                            gameId,
                            betAmount: betAmountUsdc,
                            contributionPercent,
                            countedAmount,
                        },
                    });
                } catch (error: any) {
                    // Unique constraint violation = already processed (idempotent)
                    if (error?.code === 'P2002') {
                        this.logger.debug(
                            `Wager log already exists for gameRound ${gameRoundId} / bonus ${userPromo.id} — skipping`,
                        );
                        continue;
                    }
                    throw error;
                }

                // 5. Update UserPromotion.wageredAmount
                const newWagered = new Decimal(userPromo.wageredAmount).plus(countedAmount);

                // 6. Check if wagering is now complete
                const wageringTarget = new Decimal(userPromo.wageringTarget!);
                const isComplete = newWagered.gte(wageringTarget);

                await this.prisma.userPromotion.update({
                    where: { id: userPromo.id },
                    data: {
                        wageredAmount: newWagered,
                        ...(isComplete
                            ? {
                                status: 'completed',
                                completedAt: new Date(),
                            }
                            : {}),
                    },
                });

                if (isComplete) {
                    this.logger.log(
                        `🎉 User ${userId} completed wagering for bonus ${userPromo.promotion.name} ` +
                        `(wagered ${newWagered.toFixed(2)} / target ${wageringTarget.toFixed(2)})`,
                    );
                } else {
                    this.logger.debug(
                        `User ${userId} wagering progress: ${newWagered.toFixed(2)} / ${wageringTarget.toFixed(2)} ` +
                        `for bonus ${userPromo.promotion.name} (game contribution: ${contributionPercent}%)`,
                    );
                }
            }
        } catch (error) {
            // Don't fail the game round if bonus tracking fails
            this.logger.error(
                `Failed to process wager for bonuses: userId=${userId} gameRound=${gameRoundId}`,
                error,
            );
        }
    }

    // ============================================================================
    // DEPOSIT BONUS — Called after deposit confirmation
    // ============================================================================

    /**
     * Process a completed deposit to check/update deposit bonus eligibility.
     * Called from WalletService.confirmDeposit() after the deposit is credited.
     *
     * For deposit bonuses:
     * 1. Find UserPromotions in "available" status with type=deposit
     * 2. Increment depositProgress
     * 3. If depositProgress >= minDepositUsdc, auto-credit or mark claimable
     */
    async processDepositForBonuses(
        userId: string,
        depositUsdcAmount: Decimal,
    ): Promise<void> {
        try {
            // Find available deposit bonuses for this user
            const availableDepositBonuses = await this.prisma.userPromotion.findMany({
                where: {
                    userId,
                    status: 'available',
                    promotion: {
                        type: 'deposit',
                        isActive: true,
                    },
                },
                include: {
                    promotion: true,
                },
            });

            for (const userPromo of availableDepositBonuses) {
                const promo = userPromo.promotion;
                const minDeposit = promo.minDepositUsdc
                    ? new Decimal(promo.minDepositUsdc)
                    : new Decimal(0);

                // Update cumulative deposit progress
                const newProgress = new Decimal(userPromo.depositProgress).plus(depositUsdcAmount);

                await this.prisma.userPromotion.update({
                    where: { id: userPromo.id },
                    data: { depositProgress: newProgress },
                });

                // Check if minimum deposit requirement is met
                if (newProgress.gte(minDeposit)) {
                    if (promo.isAutoCredit) {
                        // Auto-credit the bonus
                        await this.creditBonus(userId, userPromo.id);
                        this.logger.log(
                            `Auto-credited deposit bonus "${promo.name}" for user ${userId} ` +
                            `(deposited ${newProgress.toFixed(2)} / min ${minDeposit.toFixed(2)})`,
                        );
                    } else {
                        this.logger.log(
                            `Deposit bonus "${promo.name}" now claimable for user ${userId} ` +
                            `(deposited ${newProgress.toFixed(2)} / min ${minDeposit.toFixed(2)})`,
                        );
                        // Status stays "available" — user needs to manually claim
                    }
                }
            }
        } catch (error) {
            this.logger.error(
                `Failed to process deposit for bonuses: userId=${userId}`,
                error,
            );
        }
    }

    // ============================================================================
    // JOINING BONUS — Called after registration + email verification
    // ============================================================================

    /**
     * Grant joining bonus to a newly registered user.
     * Finds active joining bonuses, checks eligibility, and auto-credits or makes available.
     */
    async grantJoiningBonus(userId: string): Promise<void> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { countryCode: true, emailVerifiedAt: true },
            });

            if (!user) return;

            // Find all active joining bonuses
            const joiningBonuses = await this.prisma.promotion.findMany({
                where: {
                    type: 'joining',
                    isActive: true,
                    OR: [
                        { startsAt: null },
                        { startsAt: { lte: new Date() } },
                    ],
                    AND: [
                        {
                            OR: [
                                { endsAt: null },
                                { endsAt: { gte: new Date() } },
                            ],
                        },
                    ],
                },
            });

            for (const promo of joiningBonuses) {
                // Country restriction check
                if (promo.countryRestrictions && user.countryCode) {
                    const allowed = promo.countryRestrictions as string[];
                    if (allowed.length > 0 && !allowed.includes(user.countryCode)) {
                        continue;
                    }
                }

                // Check max claims
                if (promo.maxClaims) {
                    const totalClaims = await this.prisma.userPromotion.count({
                        where: {
                            promotionId: promo.id,
                            status: { in: ['claimed', 'completed'] },
                        },
                    });
                    if (totalClaims >= promo.maxClaims) continue;
                }

                // Check if user already has this bonus
                const existing = await this.prisma.userPromotion.findFirst({
                    where: { userId, promotionId: promo.id },
                });
                if (existing) continue;

                // Calculate expiry
                const expiresAt = promo.expiryDaysAfterClaim
                    ? new Date(Date.now() + promo.expiryDaysAfterClaim * 24 * 60 * 60 * 1000)
                    : null;

                // Calculate wagering target
                const bonusAmountUsdc = promo.bonusAmountUsdc
                    ? new Decimal(promo.bonusAmountUsdc)
                    : new Decimal(0);
                const wageringTarget = promo.wageringRequirement
                    ? bonusAmountUsdc.mul(promo.wageringRequirement)
                    : null;

                // Create user promotion instance
                const userPromo = await this.prisma.userPromotion.create({
                    data: {
                        userId,
                        promotionId: promo.id,
                        status: promo.isAutoCredit ? 'claimed' : 'available',
                        bonusAmount: bonusAmountUsdc,
                        currency: promo.bonusCurrency || 'USDC',
                        wageringTarget,
                        claimedAt: promo.isAutoCredit ? new Date() : null,
                        expiresAt,
                    },
                });

                if (promo.isAutoCredit && bonusAmountUsdc.gt(0)) {
                    await this.creditBonusToWallet(userId, userPromo.id, promo);
                }

                this.logger.log(
                    `Joining bonus "${promo.name}" ${promo.isAutoCredit ? 'auto-credited' : 'made available'} for user ${userId}`,
                );
            }
        } catch (error) {
            this.logger.error(
                `Failed to grant joining bonus: userId=${userId}`,
                error,
            );
        }
    }

    // ============================================================================
    // BIRTHDAY BONUS — Called by cron or on login
    // ============================================================================

    /**
     * Check and grant birthday bonus for a user.
     * Called by the daily cron job for all users with today's DOB,
     * or on user login.
     */
    async checkAndGrantBirthdayBonus(userId: string): Promise<void> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { dateOfBirth: true, countryCode: true },
            });

            if (!user?.dateOfBirth) return;

            const today = new Date();
            const dob = new Date(user.dateOfBirth);

            // Check if today is the user's birthday (month + day)
            if (
                dob.getMonth() !== today.getMonth() ||
                dob.getDate() !== today.getDate()
            ) {
                return;
            }

            // Find active birthday bonuses
            const birthdayBonuses = await this.prisma.promotion.findMany({
                where: {
                    type: 'birthday',
                    isActive: true,
                },
            });

            const yearStart = new Date(today.getFullYear(), 0, 1);

            for (const promo of birthdayBonuses) {
                // Check country restrictions
                if (promo.countryRestrictions && user.countryCode) {
                    const allowed = promo.countryRestrictions as string[];
                    if (allowed.length > 0 && !allowed.includes(user.countryCode)) {
                        continue;
                    }
                }

                // Check if already granted this year
                const existingThisYear = await this.prisma.userPromotion.findFirst({
                    where: {
                        userId,
                        promotionId: promo.id,
                        claimedAt: { gte: yearStart },
                    },
                });
                if (existingThisYear) continue;

                // Calculate expiry and wagering
                const expiresAt = promo.expiryDaysAfterClaim
                    ? new Date(Date.now() + promo.expiryDaysAfterClaim * 24 * 60 * 60 * 1000)
                    : null;

                const bonusAmountUsdc = promo.bonusAmountUsdc
                    ? new Decimal(promo.bonusAmountUsdc)
                    : new Decimal(0);
                const wageringTarget = promo.wageringRequirement
                    ? bonusAmountUsdc.mul(promo.wageringRequirement)
                    : null;

                const userPromo = await this.prisma.userPromotion.create({
                    data: {
                        userId,
                        promotionId: promo.id,
                        status: promo.isAutoCredit ? 'claimed' : 'available',
                        bonusAmount: bonusAmountUsdc,
                        currency: promo.bonusCurrency || 'USDC',
                        wageringTarget,
                        claimedAt: promo.isAutoCredit ? new Date() : null,
                        expiresAt,
                    },
                });

                if (promo.isAutoCredit && bonusAmountUsdc.gt(0)) {
                    await this.creditBonusToWallet(userId, userPromo.id, promo);
                }

                this.logger.log(
                    `🎂 Birthday bonus "${promo.name}" granted to user ${userId}`,
                );
            }
        } catch (error) {
            this.logger.error(
                `Failed to check/grant birthday bonus: userId=${userId}`,
                error,
            );
        }
    }

    // ============================================================================
    // CLAIM BONUS — User-initiated claim
    // ============================================================================

    /**
     * Claim an available bonus. Used for non-auto-credit bonuses.
     * For deposit bonuses, verifies that deposit requirement is met.
     */
    async claimBonus(userId: string, userPromotionId: string) {
        const userPromo = await this.prisma.userPromotion.findFirst({
            where: { id: userPromotionId, userId },
            include: { promotion: true },
        });

        if (!userPromo) {
            throw new NotFoundException('Bonus not found');
        }

        if (userPromo.status !== 'available') {
            throw new BadRequestException(
                `Bonus cannot be claimed (current status: ${userPromo.status})`,
            );
        }

        // For deposit bonuses, check if deposit requirement is met
        if (userPromo.promotion.type === 'deposit') {
            const minDeposit = userPromo.promotion.minDepositUsdc
                ? new Decimal(userPromo.promotion.minDepositUsdc)
                : new Decimal(0);

            if (new Decimal(userPromo.depositProgress).lt(minDeposit)) {
                throw new BadRequestException(
                    `Minimum deposit requirement not met. ` +
                    `Deposited: ${new Decimal(userPromo.depositProgress).toFixed(2)} USDC, ` +
                    `Required: ${minDeposit.toFixed(2)} USDC`,
                );
            }
        }

        return this.creditBonus(userId, userPromotionId);
    }

    /**
     * Internal: credit a bonus to the user's wallet and update the UserPromotion status.
     */
    private async creditBonus(userId: string, userPromotionId: string) {
        const userPromo = await this.prisma.userPromotion.findUnique({
            where: { id: userPromotionId },
            include: { promotion: true },
        });

        if (!userPromo) {
            throw new NotFoundException('User bonus not found');
        }

        const promo = userPromo.promotion;
        const expiresAt = promo.expiryDaysAfterClaim
            ? new Date(Date.now() + promo.expiryDaysAfterClaim * 24 * 60 * 60 * 1000)
            : userPromo.expiresAt;

        const bonusAmountUsdc = promo.bonusAmountUsdc
            ? new Decimal(promo.bonusAmountUsdc)
            : new Decimal(0);
        const wageringTarget = promo.wageringRequirement
            ? bonusAmountUsdc.mul(promo.wageringRequirement)
            : null;

        // Update UserPromotion to claimed
        await this.prisma.userPromotion.update({
            where: { id: userPromotionId },
            data: {
                status: 'claimed',
                claimedAt: new Date(),
                expiresAt,
                bonusAmount: bonusAmountUsdc,
                wageringTarget,
            },
        });

        // Credit to wallet
        if (bonusAmountUsdc.gt(0)) {
            await this.creditBonusToWallet(userId, userPromotionId, promo);
        }

        return {
            success: true,
            bonus: {
                name: promo.name,
                type: promo.type,
                amount: bonusAmountUsdc,
                currency: promo.bonusCurrency || 'USDC',
            },
            wageringTarget,
            expiresAt,
        };
    }

    /**
     * Internal: credit bonus amount to the user's wallet and create a transaction.
     */
    private async creditBonusToWallet(
        userId: string,
        userPromotionId: string,
        promo: any,
    ) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
        });

        if (!wallet) {
            this.logger.error(`Wallet not found for user ${userId} when crediting bonus`);
            return;
        }

        const bonusCurrency = promo.bonusCurrency || 'USDC';
        const bonusAmount = promo.bonusAmount
            ? new Decimal(promo.bonusAmount)
            : new Decimal(promo.bonusAmountUsdc || 0);
        const bonusAmountUsdc = promo.bonusAmountUsdc
            ? new Decimal(promo.bonusAmountUsdc)
            : bonusAmount;

        if (bonusAmount.lte(0)) return;

        const balanceField = CURRENCY_BALANCE_FIELDS[bonusCurrency] || 'usdcBalance';
        const currentBalance = new Decimal((wallet as any)[balanceField] || 0);
        const newBalance = currentBalance.plus(bonusAmount);

        await this.prisma.$transaction(async (tx) => {
            // Create transaction record
            await tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    type: 'bonus',
                    currency: bonusCurrency,
                    amount: bonusAmount,
                    usdcAmount: bonusAmountUsdc,
                    exchangeRate: bonusAmount.gt(0)
                        ? bonusAmountUsdc.div(bonusAmount)
                        : new Decimal(1),
                    balanceBefore: currentBalance,
                    balanceAfter: newBalance,
                    referenceType: 'promotion',
                    referenceId: userPromotionId,
                    status: 'completed',
                    metadata: {
                        bonusType: promo.type,
                        promotionName: promo.name,
                        promotionSlug: promo.slug,
                    },
                },
            });

            // Update wallet
            await tx.wallet.update({
                where: { id: wallet.id, version: wallet.version },
                data: {
                    [balanceField]: newBalance,
                    lifetimeBonuses: new Decimal(wallet.lifetimeBonuses).plus(bonusAmountUsdc),
                    version: { increment: 1 },
                },
            });
        });
    }

    // ============================================================================
    // CANCEL BONUS — On withdrawal before wagering completion
    // ============================================================================

    /**
     * Cancel active bonuses when user requests withdrawal before wagering is complete.
     * Forfeits the bonus amount by deducting it from the wallet.
     */
    async cancelBonusOnWithdrawal(
        userId: string,
        userPromotionId?: string,
    ): Promise<void> {
        const where: any = {
            userId,
            status: 'claimed',
        };
        if (userPromotionId) {
            where.id = userPromotionId;
        }

        const activeBonuses = await this.prisma.userPromotion.findMany({
            where,
            include: { promotion: true },
        });

        for (const userPromo of activeBonuses) {
            await this.prisma.userPromotion.update({
                where: { id: userPromo.id },
                data: {
                    status: 'cancelled',
                },
            });

            this.logger.log(
                `Cancelled bonus "${userPromo.promotion.name}" for user ${userId} due to withdrawal`,
            );
        }
    }

    // ============================================================================
    // EXPIRE STALE BONUSES — Cron job
    // ============================================================================

    /**
     * Expire all bonuses past their expiresAt date.
     * Called by the daily cron job.
     */
    async expireStaleUserBonuses(): Promise<number> {
        const now = new Date();

        const result = await this.prisma.userPromotion.updateMany({
            where: {
                status: { in: ['available', 'claimed'] },
                expiresAt: { lt: now },
            },
            data: {
                status: 'expired',
            },
        });

        if (result.count > 0) {
            this.logger.log(`Expired ${result.count} stale user bonuses`);
        }

        return result.count;
    }

    // ============================================================================
    // QUERY METHODS — For API endpoints
    // ============================================================================

    /**
     * Get available (claimable) bonuses for a user.
     * Returns promotions that the user is eligible for but hasn't claimed yet.
     */
    async getAvailableBonuses(userId: string) {
        const now = new Date();

        // Get user info for eligibility checks
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { countryCode: true },
        });

        // Find active promotions that the user doesn't already have
        const existingPromotions = await this.prisma.userPromotion.findMany({
            where: { userId },
            select: { promotionId: true },
        });
        const existingIds = existingPromotions.map((p) => p.promotionId);

        const availablePromotions = await this.prisma.promotion.findMany({
            where: {
                isActive: true,
                type: { in: ['deposit', 'joining', 'birthday'] },
                id: { notIn: existingIds },
                OR: [
                    { startsAt: null },
                    { startsAt: { lte: now } },
                ],
                AND: [
                    {
                        OR: [
                            { endsAt: null },
                            { endsAt: { gte: now } },
                        ],
                    },
                ],
            },
            include: {
                gameContributions: {
                    include: {
                        game: {
                            select: { id: true, name: true, slug: true, thumbnailUrl: true },
                        },
                    },
                },
            },
        });

        // Also get already-created-but-unclaimed user promotions
        const userAvailable = await this.prisma.userPromotion.findMany({
            where: {
                userId,
                status: 'available',
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gte: now } },
                ],
            },
            include: {
                promotion: {
                    include: {
                        gameContributions: {
                            include: {
                                game: {
                                    select: { id: true, name: true, slug: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        return {
            newPromotions: availablePromotions.map((p) => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                type: p.type,
                description: p.description,
                bonusAmount: p.bonusAmountUsdc,
                bonusCurrency: p.bonusCurrency || 'USDC',
                bonusValueType: p.bonusValueType,
                percentageBonus: p.percentageBonus,
                wageringRequirement: p.wageringRequirement,
                minDepositUsdc: p.minDepositUsdc,
                imageUrl: p.imageUrl,
                eligibleGames: p.gameContributions.map((gc) => ({
                    gameId: gc.game.id,
                    gameName: gc.game.name,
                    contributionPercent: gc.contributionPercent,
                })),
            })),
            claimable: userAvailable.map((up) => ({
                userPromotionId: up.id,
                promotionName: up.promotion.name,
                promotionType: up.promotion.type,
                bonusAmount: up.bonusAmount,
                depositProgress: up.depositProgress,
                minDepositRequired: up.promotion.minDepositUsdc,
                isDepositMet: up.promotion.minDepositUsdc
                    ? new Decimal(up.depositProgress).gte(new Decimal(up.promotion.minDepositUsdc))
                    : true,
                expiresAt: up.expiresAt,
            })),
        };
    }

    /**
     * Get active (claimed, in-progress) bonuses with wagering progress.
     */
    async getActiveBonuses(userId: string) {
        const now = new Date();

        const activeBonuses = await this.prisma.userPromotion.findMany({
            where: {
                userId,
                status: 'claimed',
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gte: now } },
                ],
            },
            include: {
                promotion: {
                    select: {
                        name: true,
                        slug: true,
                        type: true,
                        imageUrl: true,
                        wageringRequirement: true,
                    },
                },
            },
            orderBy: { claimedAt: 'desc' },
        });

        return activeBonuses.map((up) => {
            const wageringProgress = up.wageringTarget
                ? Math.min(
                    100,
                    (Number(up.wageredAmount) / Number(up.wageringTarget)) * 100,
                )
                : null;

            const remainingWager = up.wageringTarget
                ? Math.max(0, Number(up.wageringTarget) - Number(up.wageredAmount))
                : null;

            return {
                id: up.id,
                promotionName: up.promotion.name,
                promotionSlug: up.promotion.slug,
                promotionType: up.promotion.type,
                imageUrl: up.promotion.imageUrl,
                bonusAmount: up.bonusAmount,
                currency: up.currency,
                wageredAmount: up.wageredAmount,
                wageringTarget: up.wageringTarget,
                wageringRequirement: up.promotion.wageringRequirement,
                wageringProgress,
                remainingWager,
                claimedAt: up.claimedAt,
                expiresAt: up.expiresAt,
                daysRemaining: up.expiresAt
                    ? Math.max(
                        0,
                        Math.ceil(
                            (up.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
                        ),
                    )
                    : null,
            };
        });
    }

    /**
     * Get bonus history (completed, expired, cancelled).
     */
    async getBonusHistory(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [bonuses, total] = await Promise.all([
            this.prisma.userPromotion.findMany({
                where: {
                    userId,
                    status: { in: ['completed', 'expired', 'cancelled'] },
                },
                include: {
                    promotion: {
                        select: {
                            name: true,
                            slug: true,
                            type: true,
                            imageUrl: true,
                        },
                    },
                },
                orderBy: { claimedAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.userPromotion.count({
                where: {
                    userId,
                    status: { in: ['completed', 'expired', 'cancelled'] },
                },
            }),
        ]);

        return {
            items: bonuses.map((up) => ({
                id: up.id,
                promotionName: up.promotion.name,
                promotionType: up.promotion.type,
                status: up.status,
                bonusAmount: up.bonusAmount,
                currency: up.currency,
                wageredAmount: up.wageredAmount,
                wageringTarget: up.wageringTarget,
                claimedAt: up.claimedAt,
                completedAt: up.completedAt,
                expiresAt: up.expiresAt,
            })),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    // ============================================================================
    // ADMIN METHODS
    // ============================================================================

    /**
     * Get contribution percentage for a specific game under a promotion.
     */
    async getGameContribution(
        promotionId: string,
        gameId: string,
    ): Promise<Decimal | null> {
        const contribution = await this.prisma.bonusGameContribution.findUnique({
            where: {
                promotionId_gameId: { promotionId, gameId },
            },
        });

        return contribution ? new Decimal(contribution.contributionPercent) : null;
    }

    /**
     * Set game contributions for a bonus.
     * Replaces all existing contributions with the provided list.
     */
    async setGameContributions(
        promotionId: string,
        contributions: Array<{ gameId: string; contributionPercent: number }>,
    ) {
        // Verify promotion exists
        const promo = await this.prisma.promotion.findUnique({
            where: { id: promotionId },
        });
        if (!promo) {
            throw new NotFoundException('Promotion not found');
        }

        // Delete existing and recreate
        await this.prisma.$transaction(async (tx) => {
            await tx.bonusGameContribution.deleteMany({
                where: { promotionId },
            });

            if (contributions.length > 0) {
                await tx.bonusGameContribution.createMany({
                    data: contributions.map((c) => ({
                        promotionId,
                        gameId: c.gameId,
                        contributionPercent: new Decimal(c.contributionPercent),
                    })),
                });
            }
        });

        return {
            success: true,
            promotionId,
            gamesConfigured: contributions.length,
        };
    }

    /**
     * Create a deposit bonus and auto-assign it to all active users.
     * (or targeted users based on segment)
     */
    async assignBonusToUser(userId: string, promotionId: string) {
        const promo = await this.prisma.promotion.findUnique({
            where: { id: promotionId },
        });

        if (!promo) {
            throw new NotFoundException('Promotion not found');
        }

        // Check if user already has this bonus
        const existing = await this.prisma.userPromotion.findFirst({
            where: { userId, promotionId },
        });

        if (existing) {
            throw new ConflictException('User already has this bonus');
        }

        const expiresAt = promo.expiryDaysAfterClaim
            ? new Date(Date.now() + promo.expiryDaysAfterClaim * 24 * 60 * 60 * 1000)
            : null;

        return this.prisma.userPromotion.create({
            data: {
                userId,
                promotionId,
                status: 'available',
                expiresAt,
            },
        });
    }

    /**
     * Process birthday bonuses for all users (called by cron daily).
     */
    async processDailyBirthdayBonuses(): Promise<number> {
        const today = new Date();
        const month = today.getMonth() + 1; // 1-indexed
        const day = today.getDate();

        // Find users with today's birthday
        // Using raw query for month/day extraction from dateOfBirth
        const users = await this.prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM users 
      WHERE date_of_birth IS NOT NULL 
        AND EXTRACT(MONTH FROM date_of_birth) = ${month}
        AND EXTRACT(DAY FROM date_of_birth) = ${day}
        AND is_active = true
        AND is_suspended = false
    `;

        let granted = 0;
        for (const user of users) {
            await this.checkAndGrantBirthdayBonus(user.id);
            granted++;
        }

        if (granted > 0) {
            this.logger.log(`Processed birthday bonuses for ${granted} users`);
        }

        return granted;
    }
}
