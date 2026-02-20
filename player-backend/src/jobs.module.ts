import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LeaderboardProcessor } from './processors/leaderboard.processor';
import { CleanupProcessor } from './processors/cleanup.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { EmailProcessor } from './processors/email.processor';
import { SmsProcessor } from './processors/sms.processor';
import { SettlementProcessor } from './processors/settlement.processor';
import { PayoutProcessor } from './processors/payout.processor';
import { StatsProcessor } from './processors/stats.processor';
import { JackpotProcessor } from './processors/jackpot.processor';
import { BonusExpiryProcessor } from './processors/bonus-expiry.processor';
import { BonusModule } from '../modules/bonus/bonus.module';

@Module({
  imports: [ScheduleModule.forRoot(), BonusModule],
  providers: [
    LeaderboardProcessor,
    CleanupProcessor,
    NotificationProcessor,
    EmailProcessor,
    SmsProcessor,
    SettlementProcessor,
    PayoutProcessor,
    StatsProcessor,
    JackpotProcessor,
    BonusExpiryProcessor,
  ],
  exports: [
    EmailProcessor,
    SmsProcessor,
    SettlementProcessor,
    PayoutProcessor,
  ],
})
export class JobsModule { }
