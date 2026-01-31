import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
    prismaService = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/health (GET)', () => {
      return request(app.getHttpServer()).get('/health').expect(200);
    });
  });

  describe('User Flow: Registration to Game Play', () => {
    let accessToken: string;
    let userId: string;

    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'e2e-user@test.com',
          password: 'E2ePassword123!',
          username: 'e2euser',
          firstName: 'E2E',
          lastName: 'User',
          dateOfBirth: '1990-01-01',
          countryCode: 'US',
        })
        .expect(201);

      accessToken = response.body.accessToken;
      userId = response.body.user.id;

      expect(accessToken).toBeDefined();
      expect(userId).toBeDefined();
    });

    it('should get wallet with initial balance', async () => {
      const response = await request(app.getHttpServer())
        .get('/wallet')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.gcBalance).toBeDefined();
      expect(response.body.scBalance).toBeDefined();
    });

    it('should claim daily bonus', async () => {
      const response = await request(app.getHttpServer())
        .post('/wallet/bonuses/daily/claim')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body.gcAmount).toBeDefined();
      expect(response.body.scAmount).toBeDefined();
    });

    it('should not allow claiming daily bonus twice', async () => {
      await request(app.getHttpServer())
        .post('/wallet/bonuses/daily/claim')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('should get available games', async () => {
      const response = await request(app.getHttpServer())
        .get('/games')
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get VIP status', async () => {
      const response = await request(app.getHttpServer())
        .get('/vip/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.tier).toBeDefined();
      expect(response.body.xpCurrent).toBeDefined();
    });

    it('should get promotions', async () => {
      const response = await request(app.getHttpServer())
        .get('/promotions')
        .expect(200);

      expect(response.body.data).toBeDefined();
    });

    it('should get notifications', async () => {
      const response = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toBeDefined();
    });

    it('should update user settings', async () => {
      const response = await request(app.getHttpServer())
        .patch('/users/me/settings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          theme: 'dark',
          soundEnabled: true,
        })
        .expect(200);

      expect(response.body.theme).toBe('dark');
    });

    it('should get leaderboards', async () => {
      const response = await request(app.getHttpServer())
        .get('/leaderboards')
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should logout successfully', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    // Cleanup
    afterAll(async () => {
      if (userId) {
        await prismaService.user.delete({ where: { id: userId } }).catch(() => {});
      }
    });
  });

  describe('Public Endpoints', () => {
    it('should get coin packages without auth', async () => {
      const response = await request(app.getHttpServer())
        .get('/wallet/packages')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get payment methods without auth', async () => {
      const response = await request(app.getHttpServer())
        .get('/wallet/payment-methods')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get FAQs without auth', async () => {
      const response = await request(app.getHttpServer())
        .get('/help/faqs')
        .expect(200);

      expect(response.body.data).toBeDefined();
    });

    it('should get static page content', async () => {
      const response = await request(app.getHttpServer())
        .get('/content/pages/terms')
        .expect(200);

      expect(response.body.content).toBeDefined();
    });

    it('should get jackpots', async () => {
      const response = await request(app.getHttpServer())
        .get('/jackpots')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get recent activity', async () => {
      const response = await request(app.getHttpServer())
        .get('/activity/recent-wins')
        .expect(200);

      expect(response.body.data).toBeDefined();
    });

    it('should get game categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/games/categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get hero banners', async () => {
      const response = await request(app.getHttpServer())
        .get('/content/hero-banners')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
