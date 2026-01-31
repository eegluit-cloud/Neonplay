import {
  Injectable,
  Logger,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../database/redis/redis.service';
import { CryptoUtil } from '../../common/utils/crypto.util';
import {
  createPaginatedResult,
  getPaginationParams,
  PaginationDto,
} from '../../common/utils/pagination.util';

export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface AdminTokenResponse {
  accessToken: string;
  expiresIn: number;
  admin: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface UsersQueryDto extends PaginationDto {
  search?: string;
  status?: 'active' | 'suspended' | 'inactive';
  sortBy?: 'createdAt' | 'username' | 'email' | 'lastLoginAt';
  sortOrder?: 'asc' | 'desc';
}

export interface RedemptionsQueryDto extends PaginationDto {
  status?: 'pending' | 'processing' | 'completed' | 'rejected';
  sortBy?: 'createdAt' | 'scAmount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface AuditLogsQueryDto extends PaginationDto {
  adminId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
}

export interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  activeUsersToday: number;
  totalRevenue: number;
  revenueToday: number;
  pendingRedemptions: number;
  totalRedemptionsValue: number;
  activeGames: number;
  onlineUsers: number;
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private readonly BCRYPT_ROUNDS = 12;
  private readonly SESSION_EXPIRY_HOURS = 8;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Admin login
   */
  async login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AdminTokenResponse> {
    const admin = await this.prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!admin) {
      this.logger.warn(`Failed admin login attempt for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Admin account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      this.logger.warn(`Invalid password for admin: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate admin JWT token
    const payload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin',
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret:
        this.configService.get<string>('jwt.adminSecret') ||
        this.configService.get<string>('jwt.accessSecret'),
      expiresIn: `${this.SESSION_EXPIRY_HOURS}h`,
    });

    // Store session
    const tokenHash = CryptoUtil.hashToken(accessToken);
    await this.prisma.adminSession.create({
      data: {
        adminId: admin.id,
        tokenHash,
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + this.SESSION_EXPIRY_HOURS * 60 * 60 * 1000),
      },
    });

    // Update last login
    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    });

    // Log activity
    await this.logAudit(admin.id, 'admin_login', 'admin_user', admin.id, null, null, ipAddress);

    return {
      accessToken,
      expiresIn: this.SESSION_EXPIRY_HOURS * 3600,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    };
  }

  /**
   * Admin logout
   */
  async logout(adminId: string, token?: string): Promise<void> {
    if (token) {
      const tokenHash = CryptoUtil.hashToken(token);
      await this.prisma.adminSession.deleteMany({
        where: {
          adminId,
          tokenHash,
        },
      });
    } else {
      // Logout all sessions
      await this.prisma.adminSession.deleteMany({
        where: { adminId },
      });
    }

    await this.logAudit(adminId, 'admin_logout', 'admin_user', adminId);
  }

  /**
   * Get current admin user
   */
  async getMe(adminId: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return admin;
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      newUsersToday,
      activeUsersToday,
      pendingRedemptions,
      totalRedemptionsValue,
      activeGames,
      revenueData,
      revenueTodayData,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { createdAt: { gte: today } },
      }),
      this.prisma.user.count({
        where: { lastLoginAt: { gte: today } },
      }),
      this.prisma.redemption.count({
        where: { status: 'pending' },
      }),
      this.prisma.redemption.aggregate({
        where: { status: 'pending' },
        _sum: { usdValue: true },
      }),
      this.prisma.game.count({
        where: { isActive: true },
      }),
      this.prisma.purchase.aggregate({
        where: { status: 'completed' },
        _sum: { amountUsd: true },
      }),
      this.prisma.purchase.aggregate({
        where: {
          status: 'completed',
          completedAt: { gte: today },
        },
        _sum: { amountUsd: true },
      }),
    ]);

    // Get online users from Redis (if tracked)
    const onlineUsers = await this.redis.get<number>('stats:online_users') || 0;

    return {
      totalUsers,
      newUsersToday,
      activeUsersToday,
      totalRevenue: Number(revenueData._sum.amountUsd || 0),
      revenueToday: Number(revenueTodayData._sum.amountUsd || 0),
      pendingRedemptions,
      totalRedemptionsValue: Number(totalRedemptionsValue._sum.usdValue || 0),
      activeGames,
      onlineUsers,
    };
  }

  /**
   * List users with pagination and filtering
   */
  async listUsers(query: UsersQueryDto) {
    const { skip, take } = getPaginationParams(query);

    const where: any = {};

    // Search filter
    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { username: { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Status filter
    if (query.status === 'active') {
      where.isActive = true;
      where.isSuspended = false;
    } else if (query.status === 'suspended') {
      where.isSuspended = true;
    } else if (query.status === 'inactive') {
      where.isActive = false;
    }

    // Sort
    const orderBy: any = {};
    const sortField = query.sortBy || 'createdAt';
    const sortDirection = query.sortOrder || 'desc';
    orderBy[sortField] = sortDirection;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          isActive: true,
          isSuspended: true,
          suspendedReason: true,
          emailVerifiedAt: true,
          identityVerifiedAt: true,
          lastLoginAt: true,
          createdAt: true,
          wallet: {
            select: {
              gcBalance: true,
              scBalance: true,
            },
          },
          vip: {
            select: {
              tier: {
                select: {
                  name: true,
                  level: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return createPaginatedResult(users, total, query.page || 1, query.limit || 20);
  }

  /**
   * Get user by ID with full details
   */
  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        countryCode: true,
        stateCode: true,
        avatarUrl: true,
        isActive: true,
        isSuspended: true,
        suspendedReason: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
        identityVerifiedAt: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        lastLoginIp: true,
        createdAt: true,
        wallet: {
          select: {
            gcBalance: true,
            scBalance: true,
            gcLifetimePurchased: true,
            scLifetimeEarned: true,
            scLifetimeRedeemed: true,
          },
        },
        vip: {
          select: {
            xpCurrent: true,
            xpLifetime: true,
            tier: {
              select: {
                name: true,
                level: true,
              },
            },
          },
        },
        referralCode: {
          select: {
            code: true,
          },
        },
        _count: {
          select: {
            transactions: true,
            purchases: true,
            redemptions: true,
            gameSessions: true,
            supportTickets: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Suspend a user
   */
  async suspendUser(
    adminId: string,
    userId: string,
    reason: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isSuspended: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isSuspended) {
      throw new BadRequestException('User is already suspended');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: true,
        suspendedReason: reason,
      },
    });

    // Invalidate all user sessions
    await this.prisma.userSession.deleteMany({
      where: { userId },
    });

    // Log audit
    await this.logAudit(
      adminId,
      'user_suspended',
      'user',
      userId,
      { isSuspended: false },
      { isSuspended: true, reason },
    );

    return { message: 'User suspended successfully' };
  }

  /**
   * Unsuspend a user
   */
  async unsuspendUser(adminId: string, userId: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isSuspended: true, suspendedReason: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isSuspended) {
      throw new BadRequestException('User is not suspended');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isSuspended: false,
        suspendedReason: null,
      },
    });

    // Log audit
    await this.logAudit(
      adminId,
      'user_unsuspended',
      'user',
      userId,
      { isSuspended: true, reason: user.suspendedReason },
      { isSuspended: false },
    );

    return { message: 'User unsuspended successfully' };
  }

  /**
   * List redemptions with pagination and filtering
   */
  async listRedemptions(query: RedemptionsQueryDto) {
    const { skip, take } = getPaginationParams(query);

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    // Sort
    const orderBy: any = {};
    const sortField = query.sortBy || 'createdAt';
    const sortDirection = query.sortOrder || 'desc';
    orderBy[sortField] = sortDirection;

    const [redemptions, total] = await Promise.all([
      this.prisma.redemption.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          scAmount: true,
          usdValue: true,
          method: true,
          status: true,
          rejectionReason: true,
          processedBy: true,
          processedAt: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              identityVerifiedAt: true,
            },
          },
        },
      }),
      this.prisma.redemption.count({ where }),
    ]);

    return createPaginatedResult(redemptions, total, query.page || 1, query.limit || 20);
  }

  /**
   * Approve a redemption
   */
  async approveRedemption(
    adminId: string,
    redemptionId: string,
  ): Promise<{ message: string }> {
    const redemption = await this.prisma.redemption.findUnique({
      where: { id: redemptionId },
      select: { id: true, status: true, userId: true },
    });

    if (!redemption) {
      throw new NotFoundException('Redemption not found');
    }

    if (redemption.status !== 'pending') {
      throw new BadRequestException('Redemption is not in pending status');
    }

    await this.prisma.redemption.update({
      where: { id: redemptionId },
      data: {
        status: 'processing',
        processedBy: adminId,
        processedAt: new Date(),
      },
    });

    // Log audit
    await this.logAudit(
      adminId,
      'redemption_approved',
      'redemption',
      redemptionId,
      { status: 'pending' },
      { status: 'processing' },
    );

    return { message: 'Redemption approved and is now processing' };
  }

  /**
   * Reject a redemption
   */
  async rejectRedemption(
    adminId: string,
    redemptionId: string,
    reason: string,
  ): Promise<{ message: string }> {
    const redemption = await this.prisma.redemption.findUnique({
      where: { id: redemptionId },
      select: { id: true, status: true, userId: true, scAmount: true },
    });

    if (!redemption) {
      throw new NotFoundException('Redemption not found');
    }

    if (redemption.status !== 'pending') {
      throw new BadRequestException('Redemption is not in pending status');
    }

    // Return SC to user's wallet
    await this.prisma.$transaction([
      this.prisma.redemption.update({
        where: { id: redemptionId },
        data: {
          status: 'rejected',
          rejectionReason: reason,
          processedBy: adminId,
          processedAt: new Date(),
        },
      }),
      this.prisma.wallet.update({
        where: { userId: redemption.userId },
        data: {
          scBalance: { increment: redemption.scAmount },
        },
      }),
    ]);

    // Log audit
    await this.logAudit(
      adminId,
      'redemption_rejected',
      'redemption',
      redemptionId,
      { status: 'pending' },
      { status: 'rejected', reason },
    );

    return { message: 'Redemption rejected and SC returned to user' };
  }

  /**
   * Get audit logs with pagination and filtering
   */
  async getAuditLogs(query: AuditLogsQueryDto) {
    const { skip, take } = getPaginationParams(query);

    const where: any = {};

    if (query.adminId) {
      where.adminId = query.adminId;
    }

    if (query.action) {
      where.action = { contains: query.action, mode: 'insensitive' };
    }

    if (query.entityType) {
      where.entityType = query.entityType;
    }

    if (query.entityId) {
      where.entityId = query.entityId;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.adminAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          oldValues: true,
          newValues: true,
          ipAddress: true,
          reason: true,
          createdAt: true,
          admin: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.adminAuditLog.count({ where }),
    ]);

    return createPaginatedResult(logs, total, query.page || 1, query.limit || 20);
  }

  // ==========================================
  // USER MANAGEMENT (Extended)
  // ==========================================

  /**
   * Update user details
   */
  async updateUser(adminId: string, userId: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const oldValues = { ...user };
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        countryCode: data.countryCode,
        stateCode: data.stateCode,
      },
    });

    await this.logAudit(adminId, 'user_updated', 'user', userId, oldValues, data);
    return updated;
  }

  /**
   * Manually verify a user
   */
  async verifyUser(adminId: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerifiedAt: user.emailVerifiedAt || new Date(),
        identityVerifiedAt: new Date(),
      },
    });

    await this.logAudit(adminId, 'user_verified', 'user', userId);
    return { message: 'User verified successfully' };
  }

  /**
   * Force password reset for user
   */
  async forcePasswordReset(adminId: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Generate reset token
    const resetToken = CryptoUtil.generateToken(32);
    const resetTokenHash = CryptoUtil.hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.prisma.verificationCode.create({
      data: {
        userId,
        type: 'password_reset',
        codeHash: resetTokenHash,
        identifier: user.email, // Required field
        expiresAt,
      },
    });

    // Invalidate all sessions
    await this.prisma.userSession.deleteMany({ where: { userId } });

    await this.logAudit(adminId, 'force_password_reset', 'user', userId);
    return { message: 'Password reset initiated', resetToken };
  }

  /**
   * Get user transaction history
   */
  async getUserTransactions(userId: string, query: PaginationDto) {
    const { skip, take } = getPaginationParams(query);

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.transaction.count({ where: { userId } }),
    ]);

    return createPaginatedResult(transactions, total, query.page || 1, query.limit || 20);
  }

  /**
   * Get user activity log
   */
  async getUserActivity(userId: string, query: PaginationDto) {
    const { skip, take } = getPaginationParams(query);

    // Use GameRound as activity log since activityLog model doesn't exist
    const [activities, total] = await Promise.all([
      this.prisma.gameRound.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          gameId: true,
          coinType: true,
          betAmount: true,
          winAmount: true,
          createdAt: true,
          game: { select: { name: true, slug: true } },
        },
      }),
      this.prisma.gameRound.count({ where: { userId } }),
    ]);

    return createPaginatedResult(activities, total, query.page || 1, query.limit || 20);
  }

  // ==========================================
  // GAME MANAGEMENT
  // ==========================================

  /**
   * List all games
   */
  async listGames(query: any) {
    const { skip, take } = getPaginationParams(query);

    const where: any = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.providerId) where.providerId = query.providerId;
    if (query.category) where.category = query.category;
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

    const [games, total] = await Promise.all([
      this.prisma.game.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          provider: { select: { id: true, name: true } },
        },
      }),
      this.prisma.game.count({ where }),
    ]);

    return createPaginatedResult(games, total, query.page || 1, query.limit || 20);
  }

  /**
   * Create a new game
   */
  async createGame(adminId: string, data: any) {
    const game = await this.prisma.game.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        providerId: data.providerId,
        categoryId: data.categoryId || data.category, // Use categoryId
        thumbnailUrl: data.thumbnailUrl,
        bannerUrl: data.bannerUrl,
        rtp: data.rtp,
        volatility: data.volatility,
        minBet: data.minBet,
        maxBet: data.maxBet,
        isFeatured: data.isFeatured || false,
        isNew: data.isNew || false,
        isActive: data.isActive ?? true,
      },
    });

    await this.logAudit(adminId, 'game_created', 'game', game.id, undefined, data);
    return game;
  }

  /**
   * Get game details
   */
  async getGame(id: string) {
    const game = await this.prisma.game.findUnique({
      where: { id },
      include: {
        provider: true,
        _count: {
          select: { sessions: true },
        },
      },
    });

    if (!game) throw new NotFoundException('Game not found');
    return game;
  }

  /**
   * Update game
   */
  async updateGame(adminId: string, gameId: string, data: any) {
    const game = await this.prisma.game.findUnique({ where: { id: gameId } });
    if (!game) throw new NotFoundException('Game not found');

    const oldValues = { ...game };
    const updated = await this.prisma.game.update({
      where: { id: gameId },
      data,
    });

    await this.logAudit(adminId, 'game_updated', 'game', gameId, oldValues, data);
    return updated;
  }

  /**
   * Delete game (soft delete)
   */
  async deleteGame(adminId: string, gameId: string) {
    const game = await this.prisma.game.findUnique({ where: { id: gameId } });
    if (!game) throw new NotFoundException('Game not found');

    await this.prisma.game.update({
      where: { id: gameId },
      data: { isActive: false },
    });

    await this.logAudit(adminId, 'game_deleted', 'game', gameId);
    return { message: 'Game deleted successfully' };
  }

  /**
   * Toggle game active status
   */
  async toggleGame(adminId: string, gameId: string) {
    const game = await this.prisma.game.findUnique({ where: { id: gameId } });
    if (!game) throw new NotFoundException('Game not found');

    const updated = await this.prisma.game.update({
      where: { id: gameId },
      data: { isActive: !game.isActive },
    });

    await this.logAudit(adminId, 'game_toggled', 'game', gameId, { isActive: game.isActive }, { isActive: !game.isActive });
    return updated;
  }

  /**
   * Bulk import games
   */
  async bulkImportGames(adminId: string, games: any[]) {
    const created = await this.prisma.game.createMany({
      data: games.map((g) => ({
        name: g.name,
        slug: g.slug,
        description: g.description,
        providerId: g.providerId,
        categoryId: g.categoryId || g.category,
        thumbnailUrl: g.thumbnailUrl,
        isActive: true,
      })),
      skipDuplicates: true,
    });

    await this.logAudit(adminId, 'games_bulk_imported', 'game', undefined, undefined, { count: created.count });
    return { imported: created.count };
  }

  // ==========================================
  // PROVIDER MANAGEMENT
  // ==========================================

  /**
   * List game providers
   */
  async listProviders(query: any) {
    const { skip, take } = getPaginationParams(query);

    const [providers, total] = await Promise.all([
      this.prisma.gameProvider.findMany({
        orderBy: { name: 'asc' },
        skip,
        take,
        include: {
          _count: { select: { games: true } },
        },
      }),
      this.prisma.gameProvider.count(),
    ]);

    return createPaginatedResult(providers, total, query.page || 1, query.limit || 20);
  }

  /**
   * Create game provider
   */
  async createProvider(adminId: string, data: any) {
    const provider = await this.prisma.gameProvider.create({
      data: {
        name: data.name,
        slug: data.slug,
        logoUrl: data.logoUrl,
        config: data.description ? { description: data.description } : undefined, // Store description in config
        isActive: data.isActive ?? true,
      },
    });

    await this.logAudit(adminId, 'provider_created', 'provider', provider.id, undefined, data);
    return provider;
  }

  /**
   * Update game provider
   */
  async updateProvider(adminId: string, providerId: string, data: any) {
    const provider = await this.prisma.gameProvider.findUnique({ where: { id: providerId } });
    if (!provider) throw new NotFoundException('Provider not found');

    const updated = await this.prisma.gameProvider.update({
      where: { id: providerId },
      data,
    });

    await this.logAudit(adminId, 'provider_updated', 'provider', providerId, provider, data);
    return updated;
  }

  // ==========================================
  // TRANSACTION MANAGEMENT
  // ==========================================

  /**
   * List all transactions
   */
  async listTransactions(query: any) {
    const { skip, take } = getPaginationParams(query);

    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.coinType) where.coinType = query.coinType;
    if (query.userId) where.userId = query.userId;
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          user: { select: { id: true, email: true, username: true } },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return createPaginatedResult(transactions, total, query.page || 1, query.limit || 20);
  }

  /**
   * Get transaction details
   */
  async getTransaction(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, username: true } },
      },
    });

    if (!transaction) throw new NotFoundException('Transaction not found');
    return transaction;
  }

  /**
   * Create manual balance adjustment
   */
  async createAdjustment(adminId: string, data: { userId: string; coinType: string; amount: number; reason: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
      include: { wallet: true },
    });

    if (!user || !user.wallet) throw new NotFoundException('User or wallet not found');

    const balanceField = data.coinType === 'GC' ? 'gcBalance' : 'scBalance';

    const [wallet, transaction] = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { userId: data.userId },
        data: { [balanceField]: { increment: data.amount } },
      }),
      this.prisma.transaction.create({
        data: {
          userId: data.userId,
          walletId: user.wallet.id,
          type: data.amount > 0 ? 'adjustment' : 'adjustment',
          coinType: data.coinType as any,
          amount: Math.abs(data.amount),
          balanceBefore: Number(user.wallet[balanceField]),
          balanceAfter: Number(user.wallet[balanceField]) + data.amount,
          status: 'completed',
          metadata: { adminId, reason: data.reason },
        },
      }),
    ]);

    await this.logAudit(adminId, 'balance_adjustment', 'wallet', user.wallet.id, null, data);
    return { wallet, transaction };
  }

  /**
   * Get transaction summary stats
   */
  async getTransactionSummary(query: any) {
    const where: any = {};
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [purchases, redemptions, bets, wins] = await Promise.all([
      this.prisma.purchase.aggregate({
        where: { ...where, status: 'completed' },
        _sum: { amountUsd: true },
        _count: true,
      }),
      this.prisma.redemption.aggregate({
        where: { ...where, status: 'completed' },
        _sum: { usdValue: true },
        _count: true,
      }),
      this.prisma.transaction.aggregate({
        where: { ...where, type: 'bet' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.transaction.aggregate({
        where: { ...where, type: 'win' },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      purchases: { total: Number(purchases._sum.amountUsd || 0), count: purchases._count },
      redemptions: { total: Number(redemptions._sum.usdValue || 0), count: redemptions._count },
      bets: { total: Number(bets._sum.amount || 0), count: bets._count },
      wins: { total: Number(wins._sum.amount || 0), count: wins._count },
    };
  }

  // ==========================================
  // REDEMPTION MANAGEMENT (Extended)
  // ==========================================

  /**
   * Get redemption details
   */
  async getRedemption(id: string) {
    const redemption = await this.prisma.redemption.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            identityVerifiedAt: true,
          },
        },
      },
    });

    if (!redemption) throw new NotFoundException('Redemption not found');
    return redemption;
  }

  /**
   * Process redemption (mark as processing)
   */
  async processRedemption(adminId: string, redemptionId: string) {
    const redemption = await this.prisma.redemption.findUnique({ where: { id: redemptionId } });
    if (!redemption) throw new NotFoundException('Redemption not found');
    if (redemption.status !== 'pending') throw new BadRequestException('Redemption must be pending');

    await this.prisma.redemption.update({
      where: { id: redemptionId },
      data: {
        status: 'processing',
        processedBy: adminId,
        processedAt: new Date(),
      },
    });

    await this.logAudit(adminId, 'redemption_processing', 'redemption', redemptionId);
    return { message: 'Redemption marked as processing' };
  }

  /**
   * Complete redemption
   */
  async completeRedemption(adminId: string, redemptionId: string) {
    const redemption = await this.prisma.redemption.findUnique({ where: { id: redemptionId } });
    if (!redemption) throw new NotFoundException('Redemption not found');
    if (redemption.status !== 'processing') throw new BadRequestException('Redemption must be processing');

    await this.prisma.redemption.update({
      where: { id: redemptionId },
      data: {
        status: 'completed',
        processedAt: new Date(),
      },
    });

    // Update user wallet lifetime redeemed
    await this.prisma.wallet.update({
      where: { userId: redemption.userId },
      data: { scLifetimeRedeemed: { increment: redemption.scAmount } },
    });

    await this.logAudit(adminId, 'redemption_completed', 'redemption', redemptionId);
    return { message: 'Redemption completed successfully' };
  }

  // ==========================================
  // AMOE MANAGEMENT
  // ==========================================

  /**
   * List AMOE entries
   */
  async listAmoeEntries(query: any) {
    const { skip, take } = getPaginationParams(query);

    const where: any = {};
    if (query.status) where.status = query.status;

    const [entries, total] = await Promise.all([
      this.prisma.amoeEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          user: { select: { id: true, email: true, username: true } },
        },
      }),
      this.prisma.amoeEntry.count({ where }),
    ]);

    return createPaginatedResult(entries, total, query.page || 1, query.limit || 20);
  }

  /**
   * Approve AMOE entry
   */
  async approveAmoeEntry(adminId: string, entryId: string) {
    const entry = await this.prisma.amoeEntry.findUnique({ where: { id: entryId } });
    if (!entry) throw new NotFoundException('AMOE entry not found');
    if (entry.status !== 'pending') throw new BadRequestException('Entry must be pending');

    if (!entry.userId) throw new BadRequestException('Entry has no associated user');

    const wallet = await this.prisma.wallet.findUnique({ where: { userId: entry.userId } });
    if (!wallet) throw new NotFoundException('User wallet not found');

    await this.prisma.$transaction([
      this.prisma.amoeEntry.update({
        where: { id: entryId },
        data: {
          status: 'approved',
          reviewedAt: new Date(),
          reviewedBy: adminId,
        },
      }),
      this.prisma.wallet.update({
        where: { userId: entry.userId },
        data: { scBalance: { increment: entry.scAmount } },
      }),
      this.prisma.transaction.create({
        data: {
          userId: entry.userId,
          walletId: wallet.id,
          type: 'bonus',
          coinType: 'SC',
          amount: entry.scAmount,
          balanceBefore: wallet.scBalance,
          balanceAfter: wallet.scBalance.plus(entry.scAmount),
          status: 'completed',
          referenceType: 'amoe_entry',
          referenceId: entryId,
          metadata: { reason: 'AMOE entry approved' },
        },
      }),
    ]);

    await this.logAudit(adminId, 'amoe_approved', 'amoe_entry', entryId);
    return { message: 'AMOE entry approved' };
  }

  /**
   * Reject AMOE entry
   */
  async rejectAmoeEntry(adminId: string, entryId: string, reason: string) {
    const entry = await this.prisma.amoeEntry.findUnique({ where: { id: entryId } });
    if (!entry) throw new NotFoundException('AMOE entry not found');
    if (entry.status !== 'pending') throw new BadRequestException('Entry must be pending');

    await this.prisma.amoeEntry.update({
      where: { id: entryId },
      data: {
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy: adminId,
      },
    });

    await this.logAudit(adminId, 'amoe_rejected', 'amoe_entry', entryId, undefined, { reason });
    return { message: 'AMOE entry rejected' };
  }

  // ==========================================
  // PROMOTION MANAGEMENT
  // ==========================================

  /**
   * List promotions
   */
  async listPromotions(query: any) {
    const { skip, take } = getPaginationParams(query);

    const [promotions, total] = await Promise.all([
      this.prisma.promotion.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.promotion.count(),
    ]);

    return createPaginatedResult(promotions, total, query.page || 1, query.limit || 20);
  }

  /**
   * Create promotion
   */
  async createPromotion(adminId: string, data: any) {
    const promotion = await this.prisma.promotion.create({
      data: {
        code: data.code,
        name: data.name,
        slug: data.slug || data.code?.toLowerCase().replace(/\s+/g, '-') || `promo-${Date.now()}`,
        description: data.description,
        type: data.type,
        gcAmount: data.gcAmount,
        scAmount: data.scAmount,
        percentageBonus: data.bonusPercent || data.percentageBonus,
        minDeposit: data.minPurchase || data.minDeposit,
        maxClaims: data.maxUsesTotal || data.maxClaims,
        maxClaimsPerUser: data.maxUsesPerUser || data.maxClaimsPerUser,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.expiresAt || data.endsAt ? new Date(data.expiresAt || data.endsAt) : null,
        isActive: data.isActive ?? true,
      },
    });

    await this.logAudit(adminId, 'promotion_created', 'promotion', promotion.id, undefined, data);
    return promotion;
  }

  /**
   * Update promotion
   */
  async updatePromotion(adminId: string, promotionId: string, data: any) {
    const promotion = await this.prisma.promotion.findUnique({ where: { id: promotionId } });
    if (!promotion) throw new NotFoundException('Promotion not found');

    const updated = await this.prisma.promotion.update({
      where: { id: promotionId },
      data,
    });

    await this.logAudit(adminId, 'promotion_updated', 'promotion', promotionId, promotion, data);
    return updated;
  }

  /**
   * Delete promotion
   */
  async deletePromotion(adminId: string, promotionId: string) {
    const promotion = await this.prisma.promotion.findUnique({ where: { id: promotionId } });
    if (!promotion) throw new NotFoundException('Promotion not found');

    await this.prisma.promotion.delete({ where: { id: promotionId } });
    await this.logAudit(adminId, 'promotion_deleted', 'promotion', promotionId);
    return { message: 'Promotion deleted successfully' };
  }

  // ==========================================
  // TICKET MANAGEMENT
  // ==========================================

  /**
   * List support tickets
   */
  async listTickets(query: any) {
    const { skip, take } = getPaginationParams(query);

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.assignedTo) where.assignedTo = query.assignedTo;

    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          user: { select: { id: true, email: true, username: true } },
        },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return createPaginatedResult(tickets, total, query.page || 1, query.limit || 20);
  }

  /**
   * Get ticket details
   */
  async getTicket(id: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, username: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  /**
   * Assign ticket to admin
   */
  async assignTicket(adminId: string, ticketId: string, assigneeId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { assignedTo: assigneeId },
    });

    await this.logAudit(adminId, 'ticket_assigned', 'support_ticket', ticketId, null, { assigneeId });
    return { message: 'Ticket assigned successfully' };
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(adminId: string, ticketId: string, status: string) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const data: any = { status };
    if (status === 'resolved' || status === 'closed') data.resolvedAt = new Date();

    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data,
    });

    await this.logAudit(adminId, 'ticket_status_updated', 'support_ticket', ticketId, { status: ticket.status }, { status });
    return { message: 'Ticket status updated' };
  }

  /**
   * Add admin message to ticket
   */
  async addTicketMessage(adminId: string, ticketId: string, data: { message: string; isInternal?: boolean }) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const message = await this.prisma.supportMessage.create({
      data: {
        ticketId,
        senderType: 'admin',
        senderId: adminId,
        message: data.message,
        isInternal: data.isInternal || false,
      },
    });

    // Update ticket's updatedAt timestamp
    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  // ==========================================
  // ANALYTICS & REPORTING
  // ==========================================

  /**
   * Get user analytics
   */
  async getUserAnalytics(query: any) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    const [newUsers, activeUsers, totalUsers, usersByCountry] = await Promise.all([
      this.prisma.user.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      this.prisma.user.count({
        where: { lastLoginAt: { gte: startDate, lte: endDate } },
      }),
      this.prisma.user.count(),
      this.prisma.user.groupBy({
        by: ['countryCode'],
        _count: true,
        orderBy: { _count: { countryCode: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      newUsers,
      activeUsers,
      totalUsers,
      usersByCountry: usersByCountry.map((c) => ({ country: c.countryCode, count: c._count })),
    };
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(query: any) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    const [purchases, redemptions] = await Promise.all([
      this.prisma.purchase.aggregate({
        where: {
          status: 'completed',
          completedAt: { gte: startDate, lte: endDate },
        },
        _sum: { amountUsd: true },
        _count: true,
      }),
      this.prisma.redemption.aggregate({
        where: {
          status: 'completed',
          processedAt: { gte: startDate, lte: endDate },
        },
        _sum: { usdValue: true },
        _count: true,
      }),
    ]);

    return {
      totalRevenue: Number(purchases._sum.amountUsd || 0),
      purchaseCount: purchases._count,
      totalRedemptions: Number(redemptions._sum.usdValue || 0),
      redemptionCount: redemptions._count,
      netRevenue: Number(purchases._sum.amountUsd || 0) - Number(redemptions._sum.usdValue || 0),
    };
  }

  /**
   * Get game analytics
   */
  async getGameAnalytics(query: any) {
    const [topGames, gamesByCategory] = await Promise.all([
      this.prisma.gameSession.groupBy({
        by: ['gameId'],
        _count: true,
        _sum: { totalBet: true, totalWin: true },
        orderBy: { _count: { gameId: 'desc' } },
        take: 10,
      }),
      this.prisma.game.groupBy({
        by: ['categoryId'],
        _count: true,
      }),
    ]);

    // Get game names
    const gameIds = topGames.map((g) => g.gameId);
    const games = await this.prisma.game.findMany({
      where: { id: { in: gameIds } },
      select: { id: true, name: true },
    });
    const gameMap = new Map(games.map((g) => [g.id, g.name]));

    return {
      topGames: topGames.map((g) => ({
        gameId: g.gameId,
        gameName: gameMap.get(g.gameId),
        sessions: g._count,
        totalBet: Number(g._sum.totalBet || 0),
        totalWin: Number(g._sum.totalWin || 0),
      })),
      gamesByCategory: gamesByCategory.map((c: any) => ({ category: c.categoryId, count: c._count })),
    };
  }

  /**
   * Get retention metrics
   */
  async getRetentionMetrics(query: any) {
    const today = new Date();
    const day1 = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000);
    const day7 = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const day30 = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [d1Users, d7Users, d30Users, totalUsers] = await Promise.all([
      this.prisma.user.count({ where: { createdAt: { gte: day1 }, lastLoginAt: { gte: day1 } } }),
      this.prisma.user.count({ where: { createdAt: { gte: day7, lt: day1 }, lastLoginAt: { gte: day7 } } }),
      this.prisma.user.count({ where: { createdAt: { gte: day30, lt: day7 }, lastLoginAt: { gte: day30 } } }),
      this.prisma.user.count(),
    ]);

    return {
      day1Retention: totalUsers > 0 ? (d1Users / totalUsers) * 100 : 0,
      day7Retention: totalUsers > 0 ? (d7Users / totalUsers) * 100 : 0,
      day30Retention: totalUsers > 0 ? (d30Users / totalUsers) * 100 : 0,
    };
  }

  /**
   * Export transaction report
   */
  async exportTransactionReport(query: any) {
    const where: any = {};
    if (query.startDate) where.createdAt = { gte: new Date(query.startDate) };
    if (query.endDate) where.createdAt = { ...where.createdAt, lte: new Date(query.endDate) };

    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10000,
      include: {
        user: { select: { email: true, username: true } },
      },
    });

    return {
      data: transactions,
      generatedAt: new Date(),
      count: transactions.length,
    };
  }

  /**
   * Export user report
   */
  async exportUserReport(query: any) {
    const where: any = {};
    if (query.startDate) where.createdAt = { gte: new Date(query.startDate) };
    if (query.endDate) where.createdAt = { ...where.createdAt, lte: new Date(query.endDate) };

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10000,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        countryCode: true,
        createdAt: true,
        lastLoginAt: true,
        wallet: { select: { gcBalance: true, scBalance: true } },
      },
    });

    return {
      data: users,
      generatedAt: new Date(),
      count: users.length,
    };
  }

  // ==========================================
  // ADMIN USER MANAGEMENT
  // ==========================================

  /**
   * List admin users
   */
  async listAdmins(query: any) {
    const { skip, take } = getPaginationParams(query);

    const [admins, total] = await Promise.all([
      this.prisma.adminUser.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          permissions: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
      }),
      this.prisma.adminUser.count(),
    ]);

    return createPaginatedResult(admins, total, query.page || 1, query.limit || 20);
  }

  /**
   * Create admin user
   */
  async createAdmin(adminId: string, data: any) {
    const passwordHash = await bcrypt.hash(data.password, this.BCRYPT_ROUNDS);

    const admin = await this.prisma.adminUser.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name,
        role: data.role || 'admin',
        permissions: data.permissions || [],
        isActive: true,
      },
    });

    await this.logAudit(adminId, 'admin_created', 'admin_user', admin.id, null, { email: data.email, role: data.role });
    return { id: admin.id, email: admin.email, name: admin.name, role: admin.role };
  }

  /**
   * Update admin user
   */
  async updateAdmin(adminId: string, targetAdminId: string, data: any) {
    const admin = await this.prisma.adminUser.findUnique({ where: { id: targetAdminId } });
    if (!admin) throw new NotFoundException('Admin not found');

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.role) updateData.role = data.role;
    if (data.permissions) updateData.permissions = data.permissions;
    if (data.password) updateData.passwordHash = await bcrypt.hash(data.password, this.BCRYPT_ROUNDS);

    const updated = await this.prisma.adminUser.update({
      where: { id: targetAdminId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        isActive: true,
      },
    });

    await this.logAudit(adminId, 'admin_updated', 'admin_user', targetAdminId, admin, updateData);
    return updated;
  }

  /**
   * Deactivate admin user
   */
  async deleteAdmin(adminId: string, targetAdminId: string) {
    if (adminId === targetAdminId) {
      throw new BadRequestException('Cannot deactivate yourself');
    }

    const admin = await this.prisma.adminUser.findUnique({ where: { id: targetAdminId } });
    if (!admin) throw new NotFoundException('Admin not found');

    await this.prisma.adminUser.update({
      where: { id: targetAdminId },
      data: { isActive: false },
    });

    // Invalidate all sessions
    await this.prisma.adminSession.deleteMany({ where: { adminId: targetAdminId } });

    await this.logAudit(adminId, 'admin_deactivated', 'admin_user', targetAdminId);
    return { message: 'Admin deactivated successfully' };
  }

  // ==========================================
  // CMS MANAGEMENT
  // ==========================================

  /**
   * List static pages
   */
  async listPages(query: any) {
    const { skip, take } = getPaginationParams(query);

    const [pages, total] = await Promise.all([
      this.prisma.staticPage.findMany({
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.staticPage.count(),
    ]);

    return createPaginatedResult(pages, total, query.page || 1, query.limit || 20);
  }

  /**
   * Create static page
   */
  async createPage(adminId: string, data: any) {
    const page = await this.prisma.staticPage.create({
      data: {
        slug: data.slug,
        title: data.title,
        content: data.content,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        isPublished: data.isPublished ?? true,
      },
    });

    await this.logAudit(adminId, 'page_created', 'static_page', page.id, null, data);
    return page;
  }

  /**
   * Update static page
   */
  async updatePage(adminId: string, slug: string, data: any) {
    const page = await this.prisma.staticPage.findUnique({ where: { slug } });
    if (!page) throw new NotFoundException('Page not found');

    const updated = await this.prisma.staticPage.update({
      where: { slug },
      data,
    });

    await this.logAudit(adminId, 'page_updated', 'static_page', page.id, page, data);
    return updated;
  }

  /**
   * Delete static page
   */
  async deletePage(adminId: string, slug: string) {
    const page = await this.prisma.staticPage.findUnique({ where: { slug } });
    if (!page) throw new NotFoundException('Page not found');

    await this.prisma.staticPage.delete({ where: { slug } });
    await this.logAudit(adminId, 'page_deleted', 'static_page', page.id);
    return { message: 'Page deleted successfully' };
  }

  /**
   * List announcements
   */
  async listAnnouncements(query: any) {
    const { skip, take } = getPaginationParams(query);

    const [announcements, total] = await Promise.all([
      this.prisma.announcement.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.announcement.count(),
    ]);

    return createPaginatedResult(announcements, total, query.page || 1, query.limit || 20);
  }

  /**
   * Create announcement
   */
  async createAnnouncement(adminId: string, data: any) {
    const announcement = await this.prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type || 'general',
        priority: data.priority || 'medium',
        isPublished: data.isActive ?? true,
        publishedAt: data.startsAt ? new Date(data.startsAt) : new Date(),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    await this.logAudit(adminId, 'announcement_created', 'announcement', announcement.id, undefined, data);
    return announcement;
  }

  /**
   * Update announcement
   */
  async updateAnnouncement(adminId: string, announcementId: string, data: any) {
    const announcement = await this.prisma.announcement.findUnique({ where: { id: announcementId } });
    if (!announcement) throw new NotFoundException('Announcement not found');

    const updated = await this.prisma.announcement.update({
      where: { id: announcementId },
      data,
    });

    await this.logAudit(adminId, 'announcement_updated', 'announcement', announcementId, announcement, data);
    return updated;
  }

  /**
   * Delete announcement
   */
  async deleteAnnouncement(adminId: string, announcementId: string) {
    const announcement = await this.prisma.announcement.findUnique({ where: { id: announcementId } });
    if (!announcement) throw new NotFoundException('Announcement not found');

    await this.prisma.announcement.delete({ where: { id: announcementId } });
    await this.logAudit(adminId, 'announcement_deleted', 'announcement', announcementId);
    return { message: 'Announcement deleted successfully' };
  }

  /**
   * List hero banners
   */
  async listHeroBanners(query: any) {
    const { skip, take } = getPaginationParams(query);

    const [banners, total] = await Promise.all([
      this.prisma.heroBanner.findMany({
        orderBy: { sortOrder: 'asc' },
        skip,
        take,
      }),
      this.prisma.heroBanner.count(),
    ]);

    return createPaginatedResult(banners, total, query.page || 1, query.limit || 20);
  }

  /**
   * Create hero banner
   */
  async createHeroBanner(adminId: string, data: any) {
    const maxOrder = await this.prisma.heroBanner.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (maxOrder._max.sortOrder || 0) + 1;

    const banner = await this.prisma.heroBanner.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        imageUrl: data.imageUrl,
        ctaText: data.ctaText,
        ctaLink: data.ctaLink,
        sortOrder,
        startsAt: data.startsAt ? new Date(data.startsAt) : new Date(),
        endsAt: data.expiresAt || data.endsAt ? new Date(data.expiresAt || data.endsAt) : null,
        isActive: data.isActive ?? true,
      },
    });

    await this.logAudit(adminId, 'banner_created', 'hero_banner', banner.id, undefined, data);
    return banner;
  }

  /**
   * Update hero banner
   */
  async updateHeroBanner(adminId: string, bannerId: string, data: any) {
    const banner = await this.prisma.heroBanner.findUnique({ where: { id: bannerId } });
    if (!banner) throw new NotFoundException('Banner not found');

    const updated = await this.prisma.heroBanner.update({
      where: { id: bannerId },
      data,
    });

    await this.logAudit(adminId, 'banner_updated', 'hero_banner', bannerId, banner, data);
    return updated;
  }

  /**
   * Delete hero banner
   */
  async deleteHeroBanner(adminId: string, bannerId: string) {
    const banner = await this.prisma.heroBanner.findUnique({ where: { id: bannerId } });
    if (!banner) throw new NotFoundException('Banner not found');

    await this.prisma.heroBanner.delete({ where: { id: bannerId } });
    await this.logAudit(adminId, 'banner_deleted', 'hero_banner', bannerId);
    return { message: 'Banner deleted successfully' };
  }

  /**
   * Reorder hero banners
   */
  async reorderHeroBanners(adminId: string, bannerIds: string[]) {
    const updates = bannerIds.map((id, index) =>
      this.prisma.heroBanner.update({
        where: { id },
        data: { sortOrder: index },
      }),
    );

    await this.prisma.$transaction(updates);
    await this.logAudit(adminId, 'banners_reordered', 'hero_banner', undefined, undefined, { bannerIds });
    return { message: 'Banners reordered successfully' };
  }

  /**
   * Log admin audit action
   */
  private async logAudit(
    adminId: string,
    action: string,
    entityType: string,
    entityId?: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    reason?: string,
  ): Promise<void> {
    try {
      await this.prisma.adminAuditLog.create({
        data: {
          adminId,
          action,
          entityType,
          entityId,
          oldValues,
          newValues,
          ipAddress,
          reason,
        },
      });
    } catch (error: any) {
      this.logger.error(`Failed to log admin audit: ${error}`);
    }
  }
}
