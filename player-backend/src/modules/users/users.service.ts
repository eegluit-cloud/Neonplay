import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
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
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
        identityVerifiedAt: true,
        twoFactorEnabled: true,
        createdAt: true,
        wallet: {
          select: {
            gcBalance: true,
            scBalance: true,
          },
        },
        vip: {
          include: {
            tier: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // Check username uniqueness if changing
    if (dto.username) {
      const existing = await this.prisma.user.findFirst({
        where: {
          username: dto.username.toLowerCase(),
          NOT: { id: userId },
        },
      });

      if (existing) {
        throw new BadRequestException('Username already taken');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        username: dto.username?.toLowerCase(),
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        countryCode: dto.countryCode,
        stateCode: dto.stateCode,
      },
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
      },
    });

    return user;
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        avatarUrl: true,
      },
    });
  }

  async removeAvatar(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
      select: {
        id: true,
        avatarUrl: true,
      },
    });
  }

  async getPrivacySettings(userId: string) {
    const settings = await this.prisma.userPrivacySetting.findUnique({
      where: { userId },
    });

    if (!settings) {
      return this.prisma.userPrivacySetting.create({
        data: { userId },
      });
    }

    return settings;
  }

  async updatePrivacySettings(userId: string, dto: any) {
    return this.prisma.userPrivacySetting.upsert({
      where: { userId },
      update: dto,
      create: {
        userId,
        ...dto,
      },
    });
  }

  async getAddresses(userId: string) {
    return this.prisma.userAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async addAddress(userId: string, dto: any) {
    // If setting as default, unset other defaults
    if (dto.isDefault) {
      await this.prisma.userAddress.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.userAddress.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async updateAddress(userId: string, addressId: string, dto: any) {
    const address = await this.prisma.userAddress.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (dto.isDefault) {
      await this.prisma.userAddress.updateMany({
        where: { userId, NOT: { id: addressId } },
        data: { isDefault: false },
      });
    }

    return this.prisma.userAddress.update({
      where: { id: addressId },
      data: dto,
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.userAddress.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.prisma.userAddress.delete({
      where: { id: addressId },
    });
  }

  async getActivityLog(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.userActivityLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.userActivityLog.count({ where: { userId } }),
    ]);

    return {
      items: logs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async logActivity(userId: string, action: string, metadata?: any, req?: any) {
    await this.prisma.userActivityLog.create({
      data: {
        userId,
        action,
        ipAddress: req?.ip,
        userAgent: req?.headers?.['user-agent'],
        metadata,
      },
    });
  }
}
