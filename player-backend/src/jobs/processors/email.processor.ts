import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../database/redis/redis.service';
import { ConfigService } from '@nestjs/config';

interface EmailJob {
  id: string;
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
  priority?: number;
  retries?: number;
}

@Injectable()
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);
  private readonly QUEUE_KEY = 'email:queue';
  private readonly FAILED_KEY = 'email:failed';
  private readonly MAX_RETRIES = 3;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Process email queue every 10 seconds
   */
  @Cron('*/10 * * * * *')
  async processEmailQueue() {
    try {
      // Get up to 10 emails from the queue
      const emails = await this.redis.lrange<EmailJob>(this.QUEUE_KEY, 0, 9);

      if (emails.length === 0) return;

      this.logger.log(`Processing ${emails.length} emails from queue`);

      for (const email of emails) {
        try {
          await this.sendEmail(email);
          // Remove from queue after successful send
          await this.redis.getClient().lpop(this.QUEUE_KEY);
          this.logger.log(`Email sent successfully to ${email.to}`);
        } catch (error: any) {
          this.logger.error(`Failed to send email to ${email.to}:`, error);
          await this.handleFailedEmail(email);
        }
      }
    } catch (error: any) {
      this.logger.error('Error processing email queue:', error);
    }
  }

  /**
   * Retry failed emails every 5 minutes
   */
  @Cron('*/5 * * * *')
  async retryFailedEmails() {
    try {
      const failedEmails = await this.redis.lrange<EmailJob>(this.FAILED_KEY, 0, -1);

      if (failedEmails.length === 0) return;

      this.logger.log(`Retrying ${failedEmails.length} failed emails`);

      for (const email of failedEmails) {
        if ((email.retries || 0) < this.MAX_RETRIES) {
          // Re-queue for retry
          await this.queueEmail({
            ...email,
            retries: (email.retries || 0) + 1,
          });
          await this.redis.getClient().lrem(this.FAILED_KEY, 1, JSON.stringify(email));
        }
      }
    } catch (error: any) {
      this.logger.error('Error retrying failed emails:', error);
    }
  }

  /**
   * Clean up old failed emails weekly
   */
  @Cron(CronExpression.EVERY_WEEK)
  async cleanupFailedEmails() {
    try {
      const failedEmails = await this.redis.lrange<EmailJob>(this.FAILED_KEY, 0, -1);
      const cleaned = failedEmails.filter((e) => (e.retries || 0) >= this.MAX_RETRIES);

      for (const email of cleaned) {
        await this.redis.getClient().lrem(this.FAILED_KEY, 1, JSON.stringify(email));
        // Log permanently failed emails
        this.logger.warn(`Permanently failed email removed: ${email.to} - ${email.subject}`);
      }

      this.logger.log(`Cleaned up ${cleaned.length} permanently failed emails`);
    } catch (error: any) {
      this.logger.error('Error cleaning up failed emails:', error);
    }
  }

  /**
   * Queue an email for sending
   */
  async queueEmail(job: Omit<EmailJob, 'id'>): Promise<string> {
    const id = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const emailJob: EmailJob = { ...job, id };

    await this.redis.rpush(this.QUEUE_KEY, emailJob);
    this.logger.log(`Email queued: ${job.to} - ${job.subject}`);

    return id;
  }

  /**
   * Send an email using configured provider
   */
  private async sendEmail(email: EmailJob): Promise<void> {
    const emailProvider = this.configService.get<string>('email.provider', 'console');

    switch (emailProvider) {
      case 'sendgrid':
        await this.sendViaSendGrid(email);
        break;
      case 'ses':
        await this.sendViaSES(email);
        break;
      case 'smtp':
        await this.sendViaSMTP(email);
        break;
      default:
        // Console logging for development
        this.logger.log(`[DEV EMAIL] To: ${email.to}, Subject: ${email.subject}`);
        this.logger.log(`[DEV EMAIL] Template: ${email.template}, Data:`, email.data);
    }

    // Log email sent
    await this.prisma.emailLog.create({
      data: {
        toEmail: email.to,
        subject: email.subject,
        templateId: email.template,
        status: 'sent',
        metadata: email.data,
      },
    });
  }

  /**
   * Send via SendGrid
   */
  private async sendViaSendGrid(email: EmailJob): Promise<void> {
    // TODO: Implement SendGrid integration
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(this.configService.get('SENDGRID_API_KEY'));
    // await sgMail.send({ to: email.to, from: 'noreply@wsb.com', subject: email.subject, ... });
    this.logger.log(`SendGrid: Would send to ${email.to}`);
  }

  /**
   * Send via AWS SES
   */
  private async sendViaSES(email: EmailJob): Promise<void> {
    // TODO: Implement AWS SES integration
    // const ses = new AWS.SES();
    // await ses.sendEmail({ ... }).promise();
    this.logger.log(`SES: Would send to ${email.to}`);
  }

  /**
   * Send via SMTP
   */
  private async sendViaSMTP(email: EmailJob): Promise<void> {
    // TODO: Implement SMTP integration
    // const nodemailer = require('nodemailer');
    // const transporter = nodemailer.createTransport({ ... });
    // await transporter.sendMail({ ... });
    this.logger.log(`SMTP: Would send to ${email.to}`);
  }

  /**
   * Handle failed email
   */
  private async handleFailedEmail(email: EmailJob): Promise<void> {
    // Remove from main queue
    await this.redis.getClient().lpop(this.QUEUE_KEY);

    // Add to failed queue
    await this.redis.rpush(this.FAILED_KEY, email);

    // Log failure
    await this.prisma.emailLog.create({
      data: {
        toEmail: email.to,
        subject: email.subject,
        templateId: email.template,
        status: 'failed',
        metadata: { ...email.data, retries: email.retries || 0 },
      },
    });
  }

  /**
   * Common email templates
   */
  async sendWelcomeEmail(userId: string, email: string, username: string): Promise<void> {
    await this.queueEmail({
      to: email,
      subject: 'Welcome to WSB Casino!',
      template: 'welcome',
      data: { username, loginUrl: `${this.configService.get('APP_URL')}/login` },
    });
  }

  async sendVerificationEmail(userId: string, email: string, code: string): Promise<void> {
    await this.queueEmail({
      to: email,
      subject: 'Verify Your Email',
      template: 'email_verification',
      data: { code, expiresIn: '24 hours' },
      priority: 1,
    });
  }

  async sendPasswordResetEmail(email: string, code: string): Promise<void> {
    await this.queueEmail({
      to: email,
      subject: 'Password Reset Request',
      template: 'password_reset',
      data: { code, expiresIn: '1 hour' },
      priority: 1,
    });
  }

  async sendRedemptionApprovedEmail(email: string, amount: number, method: string): Promise<void> {
    await this.queueEmail({
      to: email,
      subject: 'Redemption Approved!',
      template: 'redemption_approved',
      data: { amount, method },
    });
  }

  async sendRedemptionRejectedEmail(email: string, amount: number, reason: string): Promise<void> {
    await this.queueEmail({
      to: email,
      subject: 'Redemption Update',
      template: 'redemption_rejected',
      data: { amount, reason },
    });
  }
}
