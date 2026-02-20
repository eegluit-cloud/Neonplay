import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BonusService } from '../../modules/bonus/bonus.service';

/**
 * Bonus Expiry & Birthday Processor
 * Runs daily to:
 * 1. Expire stale user bonuses past their expiresAt date
 * 2. Grant birthday bonuses to users with today's DOB
 */
@Injectable()
export class BonusExpiryProcessor {
    private readonly logger = new Logger(BonusExpiryProcessor.name);

    constructor(private readonly bonusService: BonusService) { }

    /**
     * Run daily at midnight UTC.
     */
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleBonusExpiry() {
        this.logger.log('🕐 Running daily bonus expiry check...');
        try {
            const expired = await this.bonusService.expireStaleUserBonuses();
            this.logger.log(`Bonus expiry check complete: ${expired} bonuses expired.`);
        } catch (error) {
            this.logger.error('Failed to run bonus expiry check', error);
        }
    }

    /**
     * Run daily at 6 AM UTC — process birthday bonuses.
     */
    @Cron('0 6 * * *')
    async handleBirthdayBonuses() {
        this.logger.log('🎂 Running daily birthday bonus check...');
        try {
            const granted = await this.bonusService.processDailyBirthdayBonuses();
            this.logger.log(`Birthday bonus check complete: ${granted} users processed.`);
        } catch (error) {
            this.logger.error('Failed to run birthday bonus check', error);
        }
    }
}
