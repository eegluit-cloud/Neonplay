import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL') || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  });

  // API Versioning - use 'api' as prefix, versioning handles the version number
  app.setGlobalPrefix(configService.get<string>('API_PREFIX') || 'api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Documentation
  if (configService.get<string>('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('WBC 2026 API')
      .setDescription('WBC 2026 Social Casino Platform API Documentation')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Auth', 'Authentication endpoints')
      .addTag('Users', 'User management endpoints')
      .addTag('Wallet', 'Wallet and transaction endpoints')
      .addTag('Games', 'Game catalog endpoints')
      .addTag('Leaderboard', 'Leaderboard endpoints')
      .addTag('Sports', 'Sports betting endpoints')
      .addTag('Promotions', 'Promotions and bonuses endpoints')
      .addTag('VIP', 'VIP and loyalty endpoints')
      .addTag('Referrals', 'Referral program endpoints')
      .addTag('Notifications', 'Notification endpoints')
      .addTag('Jackpot', 'Jackpot endpoints')
      .addTag('Prizes', 'Prizes and rewards endpoints')
      .addTag('AMOE', 'Alternative Method of Entry endpoints')
      .addTag('Content', 'Content and WBCTV endpoints')
      .addTag('Activity', 'Activity feed endpoints')
      .addTag('Help', 'FAQ and support endpoints')
      .addTag('Settings', 'User settings endpoints')
      .addTag('CMS', 'Content management endpoints')
      .addTag('Admin', 'Admin panel endpoints')
      .addTag('Media', 'Media library endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
