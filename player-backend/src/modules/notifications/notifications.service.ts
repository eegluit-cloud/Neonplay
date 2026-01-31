import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import {
  createPaginatedResult,
  getPaginationParams,
} from '../../common/utils/pagination.util';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-preferences.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(userId: string, query: GetNotificationsDto) {
    const { skip, take } = getPaginationParams(query);

    const where: any = { userId };

    if (query.isRead !== undefined) {
      where.isRead = query.isRead;
    }

    if (query.type) {
      where.type = query.type;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          actionUrl: true,
          imageUrl: true,
          data: true,
          isRead: true,
          readAt: true,
          createdAt: true,
        },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return createPaginatedResult(
      notifications,
      total,
      query.page || 1,
      query.limit || 20,
    );
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return { unreadCount: count };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('You do not have access to this notification');
    }

    if (notification.isRead) {
      return notification;
    }

    const updatedNotification = await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        actionUrl: true,
        imageUrl: true,
        data: true,
        isRead: true,
        readAt: true,
        createdAt: true,
      },
    });

    return updatedNotification;
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      success: true,
      markedAsRead: result.count,
    };
  }

  async deleteNotification(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('You do not have access to this notification');
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });

    return { success: true };
  }

  async getPreferences(userId: string) {
    let preferences = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Create default preferences if they don't exist
      preferences = await this.prisma.notificationPreference.create({
        data: { userId },
      });
    }

    return {
      emailPromotions: preferences.emailPromotions,
      emailTransactions: preferences.emailTransactions,
      pushEnabled: preferences.pushEnabled,
      pushPromotions: preferences.pushPromotions,
      pushTransactions: preferences.pushTransactions,
      smsEnabled: preferences.smsEnabled,
    };
  }

  async updatePreferences(userId: string, dto: UpdateNotificationPreferencesDto) {
    const preferences = await this.prisma.notificationPreference.upsert({
      where: { userId },
      update: {
        emailPromotions: dto.emailPromotions,
        emailTransactions: dto.emailTransactions,
        pushEnabled: dto.pushEnabled,
        pushPromotions: dto.pushPromotions,
        pushTransactions: dto.pushTransactions,
        smsEnabled: dto.smsEnabled,
      },
      create: {
        userId,
        emailPromotions: dto.emailPromotions ?? true,
        emailTransactions: dto.emailTransactions ?? true,
        pushEnabled: dto.pushEnabled ?? true,
        pushPromotions: dto.pushPromotions ?? true,
        pushTransactions: dto.pushTransactions ?? true,
        smsEnabled: dto.smsEnabled ?? false,
      },
    });

    return {
      emailPromotions: preferences.emailPromotions,
      emailTransactions: preferences.emailTransactions,
      pushEnabled: preferences.pushEnabled,
      pushPromotions: preferences.pushPromotions,
      pushTransactions: preferences.pushTransactions,
      smsEnabled: preferences.smsEnabled,
    };
  }

  /**
   * Internal method to create a notification for a user
   * Used by other services to send notifications
   */
  async createNotification(userId: string, data: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type: data.type,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl,
        imageUrl: data.imageUrl,
        data: data.data,
      },
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        actionUrl: true,
        imageUrl: true,
        data: true,
        isRead: true,
        createdAt: true,
      },
    });

    return notification;
  }

  /**
   * Internal method to send bulk notifications to multiple users
   * Used for system-wide announcements or group notifications
   */
  async sendBulkNotification(
    userIds: string[],
    data: Omit<CreateNotificationDto, 'data'> & { data?: Record<string, any> },
  ) {
    if (userIds.length === 0) {
      return { success: true, created: 0 };
    }

    const notificationsData = userIds.map((userId) => ({
      userId,
      type: data.type,
      title: data.title,
      message: data.message,
      actionUrl: data.actionUrl,
      imageUrl: data.imageUrl,
      data: data.data,
    }));

    const result = await this.prisma.notification.createMany({
      data: notificationsData,
      skipDuplicates: true,
    });

    return {
      success: true,
      created: result.count,
    };
  }

  /**
   * Internal method to send notification to all users
   * Use with caution - for system-wide announcements only
   */
  async sendNotificationToAllUsers(
    data: Omit<CreateNotificationDto, 'data'> & { data?: Record<string, any> },
  ) {
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    const userIds = users.map((u) => u.id);
    return this.sendBulkNotification(userIds, data);
  }

  /**
   * Internal method to check if user has notifications enabled for a specific type
   */
  async shouldSendNotification(
    userId: string,
    channel: 'email' | 'push' | 'sms',
    notificationType: 'promotions' | 'transactions',
  ): Promise<boolean> {
    const preferences = await this.prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Default to enabled if no preferences set
      return true;
    }

    if (channel === 'email') {
      return notificationType === 'promotions'
        ? preferences.emailPromotions
        : preferences.emailTransactions;
    }

    if (channel === 'push') {
      if (!preferences.pushEnabled) return false;
      return notificationType === 'promotions'
        ? preferences.pushPromotions
        : preferences.pushTransactions;
    }

    if (channel === 'sms') {
      return preferences.smsEnabled;
    }

    return true;
  }

  /**
   * Delete old notifications (cleanup job)
   * Keeps notifications for the last 90 days by default
   */
  async cleanupOldNotifications(daysToKeep: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.prisma.notification.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        isRead: true, // Only delete read notifications
      },
    });

    return {
      success: true,
      deleted: result.count,
    };
  }
}
