import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from '../../src/modules/wallet/wallet.service';
import { PrismaService } from '../../src/database/prisma/prisma.service';
import { RedisService } from '../../src/database/redis/redis.service';
import { Decimal } from '@prisma/client/runtime/library';

describe('WalletService', () => {
  let service: WalletService;
  let prismaService: PrismaService;
  let redisService: RedisService;

  const mockPrismaService = {
    wallet: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    coinPackage: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    purchase: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    bonusClaim: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    publish: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    prismaService = module.get<PrismaService>(PrismaService);
    redisService = module.get<RedisService>(RedisService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWallet', () => {
    it('should return wallet for existing user', async () => {
      const mockWallet = {
        id: 'wallet-123',
        userId: 'user-123',
        gcBalance: new Decimal(1000),
        scBalance: new Decimal(100),
        gcLifetimePurchased: new Decimal(5000),
        scLifetimeEarned: new Decimal(500),
        scLifetimeRedeemed: new Decimal(0),
      };

      mockPrismaService.wallet.findUnique.mockResolvedValue(mockWallet);

      const result = await service.getWallet('user-123');

      expect(result).toBeDefined();
      expect(result.gcBalance).toEqual(new Decimal(1000));
      expect(result.scBalance).toEqual(new Decimal(100));
    });

    it('should create wallet if not exists', async () => {
      mockPrismaService.wallet.findUnique.mockResolvedValue(null);

      const newWallet = {
        id: 'wallet-new',
        userId: 'user-123',
        gcBalance: new Decimal(0),
        scBalance: new Decimal(0),
        gcLifetimePurchased: new Decimal(0),
        scLifetimeEarned: new Decimal(0),
        scLifetimeRedeemed: new Decimal(0),
      };

      mockPrismaService.wallet.create.mockResolvedValue(newWallet);

      const result = await service.getWallet('user-123');

      expect(result).toBeDefined();
      expect(mockPrismaService.wallet.create).toHaveBeenCalled();
    });
  });

  describe('getCoinPackages', () => {
    it('should return active coin packages sorted by sort order', async () => {
      const mockPackages = [
        {
          id: 'pkg-1',
          name: 'Starter',
          gcAmount: new Decimal(10000),
          scBonusAmount: new Decimal(1),
          priceUsd: new Decimal(4.99),
          isActive: true,
          sortOrder: 1,
        },
        {
          id: 'pkg-2',
          name: 'Basic',
          gcAmount: new Decimal(25000),
          scBonusAmount: new Decimal(2.5),
          priceUsd: new Decimal(9.99),
          isActive: true,
          sortOrder: 2,
        },
      ];

      mockPrismaService.coinPackage.findMany.mockResolvedValue(mockPackages);

      const result = await service.getCoinPackages();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Starter');
    });
  });

  describe('claimBonus', () => {
    it('should allow claiming daily bonus if not claimed today', async () => {
      const mockWallet = {
        id: 'wallet-123',
        userId: 'user-123',
        gcBalance: new Decimal(0),
        scBalance: new Decimal(0),
        version: 1,
      };

      mockPrismaService.bonusClaim.findFirst.mockResolvedValue(null);
      mockPrismaService.wallet.findUnique.mockResolvedValue(mockWallet);
      mockPrismaService.wallet.update.mockResolvedValue({
        ...mockWallet,
        gcBalance: new Decimal(1000),
        scBalance: new Decimal(0.5),
      });
      mockPrismaService.transaction.create.mockResolvedValue({});
      mockPrismaService.bonusClaim.create.mockResolvedValue({});

      const result = await service.claimBonus('user-123', 'daily');

      expect(result).toBeDefined();
      expect(result.gcAmount).toBeDefined();
      expect(result.scAmount).toBeDefined();
    });

    it('should throw error if daily bonus already claimed', async () => {
      mockPrismaService.bonusClaim.findFirst.mockResolvedValue({
        id: 'claim-123',
        bonusType: 'daily',
        claimedAt: new Date(),
      });

      await expect(service.claimBonus('user-123', 'daily')).rejects.toThrow();
    });
  });
});
