import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../database/redis/redis.service';
import { ConfigService } from '@nestjs/config';

interface SmsJob {
  id: string;
  to: string;
  message: string;
  type: 'verification' | 'notification' | 'alert';
  priority?: number;
  retries?: number;
}

@Injectable()
export class SmsProcessor {
  private readonly logger = new Logger(SmsProcessor.name);
  private readonly QUEUE_KEY = 'sms:queue';
  private readonly FAILED_KEY = 'sms:failed';
  private readonly MAX_RETRIES = 3;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Process SMS queue every 5 seconds
   */
  @Cron('*/5 * * * * *')
  async processSmsQueue() {
    try {
      // Get up to 10 SMS from the queue
      const messages = await this.redis.lrange<SmsJob>(this.QUEUE_KEY, 0, 9);

      if (messages.length === 0) return;

      this.logger.log(`Processing ${messages.length} SMS from queue`);

      for (const sms of messages) {
        try {
          await this.sendSms(sms);
          // Remove from queue after successful send
          await this.redis.getClient().lpop(this.QUEUE_KEY);
          this.logger.log(`SMS sent successfully to ${sms.to}`);
        } catch (error: any) {
          this.logger.error(`Failed to send SMS to ${sms.to}:`, error);
          await this.handleFailedSms(sms);
        }
      }
    } catch (error: any) {
      this.logger.error('Error processing SMS queue:', error);
    }
  }

  /**
   * Retry failed SMS every 2 minutes
   */
  @Cron('*/2 * * * *')
  async retryFailedSms() {
    try {
      const failedSms = await this.redis.lrange<SmsJob>(this.FAILED_KEY, 0, -1);

      if (failedSms.length === 0) return;

      this.logger.log(`Retrying ${failedSms.length} failed SMS`);

      for (const sms of failedSms) {
        if ((sms.retries || 0) < this.MAX_RETRIES) {
          // Re-queue for retry
          await this.queueSms({
            ...sms,
            retries: (sms.retries || 0) + 1,
          });
          await this.redis.getClient().lrem(this.FAILED_KEY, 1, JSON.stringify(sms));
        }
      }
    } catch (error: any) {
      this.logger.error('Error retrying failed SMS:', error);
    }
  }

  /**
   * Queue an SMS for sending
   */
  async queueSms(job: Omit<SmsJob, 'id'>): Promise<string> {
    const id = `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const smsJob: SmsJob = { ...job, id };

    // High priority SMS go to front of queue
    if (job.priority === 1) {
      await this.redis.lpush(this.QUEUE_KEY, smsJob);
    } else {
      await this.redis.rpush(this.QUEUE_KEY, smsJob);
    }

    this.logger.log(`SMS queued: ${job.to} - ${job.type}`);
    return id;
  }

  /**
   * Send SMS using configured provider
   */
  private async sendSms(sms: SmsJob): Promise<void> {
    const smsProvider = this.configService.get<string>('sms.provider', 'console');

    switch (smsProvider) {
      case 'twilio':
        await this.sendViaTwilio(sms);
        break;
      case 'nexmo':
        await this.sendViaNexmo(sms);
        break;
      case 'aws_sns':
        await this.sendViaSNS(sms);
        break;
      default:
        // Console logging for development
        this.logger.log(`[DEV SMS] To: ${sms.to}, Type: ${sms.type}`);
        this.logger.log(`[DEV SMS] Message: ${sms.message}`);
    }

    // Log SMS sent
    await this.prisma.smsLog.create({
      data: {
        toPhone: sms.to,
        message: sms.message,
        status: 'sent',
        metadata: { type: sms.type },
      },
    });
  }

  /**
   * Send via Twilio
   */
  private async sendViaTwilio(sms: SmsJob): Promise<void> {
    // TODO: Implement Twilio integration
    // const client = require('twilio')(accountSid, authToken);
    // await client.messages.create({
    //   body: sms.message,
    //   from: this.configService.get('TWILIO_PHONE'),
    //   to: sms.to
    // });
    this.logger.log(`Twilio: Would send to ${sms.to}`);
  }

  /**
   * Send via Vonage/Nexmo
   */
  private async sendViaNexmo(sms: SmsJob): Promise<void> {
    // TODO: Implement Nexmo integration
    this.logger.log(`Nexmo: Would send to ${sms.to}`);
  }

  /**
   * Send via AWS SNS
   */
  private async sendViaSNS(sms: SmsJob): Promise<void> {
    // TODO: Implement AWS SNS integration
    // const sns = new AWS.SNS();
    // await sns.publish({ PhoneNumber: sms.to, Message: sms.message }).promise();
    this.logger.log(`SNS: Would send to ${sms.to}`);
  }

  /**
   * Handle failed SMS
   */
  private async handleFailedSms(sms: SmsJob): Promise<void> {
    // Remove from main queue
    await this.redis.getClient().lpop(this.QUEUE_KEY);

    // Add to failed queue
    await this.redis.rpush(this.FAILED_KEY, sms);

    // Log failure
    await this.prisma.smsLog.create({
      data: {
        toPhone: sms.to,
        message: sms.message,
        status: 'failed',
        metadata: { type: sms.type, retries: sms.retries || 0 },
      },
    });
  }

  /**
   * Common SMS methods
   */
  async sendVerificationCode(phone: string, code: string): Promise<void> {
    await this.queueSms({
      to: phone,
      message: `Your WSB Casino verification code is: ${code}. Valid for 10 minutes.`,
      type: 'verification',
      priority: 1,
    });
  }

  async sendLoginAlert(phone: string, location: string, device: string): Promise<void> {
    await this.queueSms({
      to: phone,
      message: `New login to your WSB Casino account from ${device} in ${location}. If this wasn't you, please secure your account immediately.`,
      type: 'alert',
      priority: 1,
    });
  }

  async sendRedemptionNotification(phone: string, amount: number, status: string): Promise<void> {
    await this.queueSms({
      to: phone,
      message: `Your redemption of $${amount} has been ${status}. Check your account for details.`,
      type: 'notification',
    });
  }

  async sendBigWinNotification(phone: string, amount: number, game: string): Promise<void> {
    await this.queueSms({
      to: phone,
      message: `Congratulations! You won ${amount} on ${game}!`,
      type: 'notification',
    });
  }
}
