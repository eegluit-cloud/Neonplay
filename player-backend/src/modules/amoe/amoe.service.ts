import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { randomBytes } from 'crypto';

export interface AmoeConfigDto {
  isEnabled: boolean;
  maxEntriesPerDay: number;
  maxEntriesPerWeek: number;
  scRewardPerEntry: number;
  termsAndConditions: string | null;
  mailingAddress: any;
}

export interface PostalAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface SubmitEntryDto {
  code: string;
  postalAddress: PostalAddress;
}

@Injectable()
export class AmoeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get AMOE configuration
   */
  async getConfig(): Promise<AmoeConfigDto> {
    const config = await this.prisma.amoeConfig.findFirst({
      where: { isActive: true },
    });

    if (!config) {
      // Return default configuration
      return {
        isEnabled: true,
        maxEntriesPerDay: 1,
        maxEntriesPerWeek: 5,
        scRewardPerEntry: 1,
        termsAndConditions: 'Standard AMOE terms and conditions apply.',
        mailingAddress: null,
      };
    }

    return {
      isEnabled: config.isActive,
      maxEntriesPerDay: config.dailyLimitPerUser,
      maxEntriesPerWeek: config.weeklyLimitPerUser,
      scRewardPerEntry: Number(config.amountUsdcPerEntry),
      termsAndConditions: config.termsText,
      mailingAddress: config.mailingAddress,
    };
  }

  /**
   * Generate an AMOE code for a user
   */
  async generateCode(userId: string, email: string) {
    const config = await this.getConfig();

    if (!config.isEnabled) {
      throw new BadRequestException('AMOE is currently not available');
    }

    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyEntries = await this.prisma.amoeEntry.count({
      where: {
        userId,
        createdAt: { gte: today },
      },
    });

    if (dailyEntries >= config.maxEntriesPerDay) {
      throw new BadRequestException(
        `You have reached the daily limit of ${config.maxEntriesPerDay} AMOE entries`,
      );
    }

    // Check weekly limit
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const weeklyEntries = await this.prisma.amoeEntry.count({
      where: {
        userId,
        createdAt: { gte: startOfWeek },
      },
    });

    if (weeklyEntries >= config.maxEntriesPerWeek) {
      throw new BadRequestException(
        `You have reached the weekly limit of ${config.maxEntriesPerWeek} AMOE entries`,
      );
    }

    // Check for existing generated (unused) code
    const existingEntry = await this.prisma.amoeEntry.findFirst({
      where: {
        userId,
        status: 'generated',
      },
    });

    if (existingEntry) {
      return {
        code: existingEntry.code,
        message: 'You already have an active AMOE code',
      };
    }

    // Generate new unique code (15-char alphanumeric)
    const code = this.generateUniqueCode();

    // Create AMOE entry with 'generated' status
    const entry = await this.prisma.amoeEntry.create({
      data: {
        userId,
        email,
        code,
        amountUsdc: config.scRewardPerEntry,
        currency: 'USDC',
        status: 'generated',
      },
    });

    return {
      code: entry.code,
      instructions: this.getMailInstructions(entry.code, config.mailingAddress),
    };
  }

  /**
   * Submit an AMOE entry (mail-in verification)
   */
  async submitEntry(userId: string, code: string, postalAddress: PostalAddress) {
    const config = await this.getConfig();

    if (!config.isEnabled) {
      throw new BadRequestException('AMOE is currently not available');
    }

    // Find the entry by code
    const entry = await this.prisma.amoeEntry.findFirst({
      where: {
        code: code.toUpperCase(),
        userId,
        status: 'generated',
      },
    });

    if (!entry) {
      throw new NotFoundException('Invalid or already used AMOE code');
    }

    // Update entry with postal address and mark as submitted
    const updatedEntry = await this.prisma.amoeEntry.update({
      where: { id: entry.id },
      data: {
        postalAddress: postalAddress as any,
        status: 'submitted',
        submittedAt: new Date(),
      },
    });

    return {
      success: true,
      entry: {
        id: updatedEntry.id,
        code: updatedEntry.code,
        status: updatedEntry.status,
        amountUsdc: Number(updatedEntry.amountUsdc),
        submittedAt: updatedEntry.submittedAt,
      },
      message: 'Your AMOE entry has been submitted and is pending review.',
    };
  }

  /**
   * Get user's AMOE entry history
   */
  async getUserEntries(userId: string) {
    const entries = await this.prisma.amoeEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      entries: entries.map((entry) => ({
        id: entry.id,
        code: entry.code,
        status: entry.status,
        amountUsdc: Number(entry.amountUsdc),
        postalAddress: entry.postalAddress,
        submittedAt: entry.submittedAt,
        reviewedAt: entry.reviewedAt,
        redeemedAt: entry.redeemedAt,
        createdAt: entry.createdAt,
      })),
      summary: {
        totalEntries: entries.length,
        totalUsdcEarned: entries
          .filter((e) => e.status === 'redeemed')
          .reduce((sum, e) => sum + Number(e.amountUsdc), 0),
      },
    };
  }

  /**
   * Redeem an approved AMOE entry (credit wallet)
   * Called after admin approval
   */
  async redeemEntry(userId: string, entryId: string) {
    const entry = await this.prisma.amoeEntry.findFirst({
      where: {
        id: entryId,
        userId,
        status: 'approved',
      },
    });

    if (!entry) {
      throw new NotFoundException('Entry not found or not approved');
    }

    // Get user's wallet
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const usdcAmount = new Decimal(entry.amountUsdc);
    const newUsdcBalance = new Decimal(wallet.usdcBalance).plus(usdcAmount);

    return this.prisma.$transaction(async (tx) => {
      // Update entry to redeemed
      await tx.amoeEntry.update({
        where: { id: entryId },
        data: {
          status: 'redeemed',
          redeemedAt: new Date(),
        },
      });

      // Create transaction
      await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type: 'bonus',
          currency: 'USDC',
          amount: usdcAmount,
          usdcAmount: usdcAmount,
          exchangeRate: 1,
          balanceBefore: wallet.usdcBalance,
          balanceAfter: newUsdcBalance,
          referenceType: 'amoe',
          referenceId: entryId,
          status: 'completed',
          metadata: { entryType: 'amoe', code: entry.code },
        },
      });

      // Update wallet
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id, version: wallet.version },
        data: {
          usdcBalance: newUsdcBalance,
          lifetimeWon: new Decimal(wallet.lifetimeWon).plus(usdcAmount),
          version: { increment: 1 },
        },
      });

      return {
        success: true,
        entry: {
          id: entry.id,
          usdcAwarded: Number(usdcAmount),
        },
        wallet: {
          usdcBalance: Number(updatedWallet.usdcBalance),
        },
      };
    });
  }

  /**
   * Generate a unique 15-character alphanumeric AMOE code
   */
  private generateUniqueCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar chars (O,0,I,1)
    let code = '';
    const bytes = randomBytes(15);
    for (let i = 0; i < 15; i++) {
      code += chars[bytes[i] % chars.length];
    }
    return code;
  }

  /**
   * Get mail-in instructions for AMOE
   */
  private getMailInstructions(code: string, mailingAddress: any): string {
    const address = mailingAddress || {
      street: 'AMOE Entry Department',
      city: 'Las Vegas',
      state: 'NV',
      postalCode: '89101',
    };

    return `
To complete your Alternative Method of Entry (AMOE):

1. Hand-write your AMOE code: ${code}
2. Include your full name and email address
3. Mail to:
   ${address.street}
   ${address.city}, ${address.state} ${address.postalCode}

Your entry must be postmarked within 7 days.
    `.trim();
  }
}
