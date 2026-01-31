# Folder Structure Documentation

## Overview

The NeonPlay2 Player Backend follows **NestJS best practices** with a modular architecture. The codebase is organized into logical domains with clear separation of concerns.

## Project Root Structure

```
player-backend/
├── src/                    # Source code
├── prisma/                 # Database schema & migrations
│   ├── schema.prisma       # Prisma schema (70+ models)
│   ├── seed.ts             # Database seeder
│   └── migrations/         # Migration files
├── test/                   # Test files
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/                # End-to-end tests
├── docs/                   # Documentation
├── docker/                 # Docker configuration
├── dist/                   # Compiled output
├── node_modules/           # Dependencies
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
├── nest-cli.json           # NestJS CLI configuration
├── .env                    # Environment variables
├── .env.example            # Environment template
├── Dockerfile              # Docker build file
└── README.md               # Project readme
```

---

## Source Code Structure (`src/`)

```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
│
├── common/                 # Shared utilities & decorators
│   ├── decorators/         # Custom decorators
│   ├── filters/            # Exception filters
│   ├── guards/             # Auth guards
│   ├── interceptors/       # Response interceptors
│   ├── middleware/         # HTTP middleware
│   ├── pipes/              # Validation pipes
│   └── utils/              # Utility functions
│
├── config/                 # Configuration management
│   └── configuration.ts    # Config factory
│
├── database/               # Database services
│   ├── prisma/             # Prisma service
│   └── redis/              # Redis service
│
├── modules/                # Feature modules (19 modules)
│   ├── auth/               # Authentication
│   ├── users/              # User management
│   ├── wallet/             # Wallet & transactions
│   ├── games/              # Game catalog
│   ├── sports/             # Sports betting
│   ├── leaderboard/        # Leaderboards
│   ├── promotions/         # Promotions & bonuses
│   ├── vip/                # VIP loyalty program
│   ├── referrals/          # Referral system
│   ├── notifications/      # Notifications
│   ├── verification/       # Email/phone verification
│   ├── jackpot/            # Jackpot system
│   ├── prizes/             # Prizes & store
│   ├── amoe/               # Alternative method of entry
│   ├── content/            # WBCTV videos
│   ├── activity/           # Activity feed
│   ├── help/               # FAQ & support
│   ├── settings/           # User settings
│   ├── cms/                # Content management
│   ├── media/              # Media library
│   ├── providers/          # Game providers
│   └── admin/              # Admin panel
│
├── shared/                 # Shared types & interfaces
│   ├── constants/          # Application constants
│   ├── interfaces/         # TypeScript interfaces
│   └── types/              # Type definitions
│
├── jobs/                   # Background jobs (BullMQ)
│   ├── processors/         # Job processors
│   └── queues/             # Queue definitions
│
├── websockets/             # WebSocket real-time features
│   ├── adapters/           # Socket.IO adapters
│   └── gateways/           # WebSocket gateways
│
└── health/                 # Health check endpoints
```

---

## Module Structure Pattern

Each feature module follows a consistent structure:

```
modules/[module-name]/
├── [module-name].module.ts      # Module definition
├── [module-name].controller.ts  # HTTP endpoints
├── [module-name].service.ts     # Business logic
├── dto/                         # Data Transfer Objects
│   ├── create-[entity].dto.ts   # Create DTOs
│   ├── update-[entity].dto.ts   # Update DTOs
│   └── [query].dto.ts           # Query DTOs
├── strategies/                  # (auth only) Passport strategies
└── guards/                      # (admin only) Custom guards
```

### Example: Auth Module Structure

```
modules/auth/
├── auth.module.ts               # Module definition
├── auth.controller.ts           # 15 endpoints
├── auth.service.ts              # Authentication logic
├── dto/
│   ├── register.dto.ts          # Registration DTO
│   ├── login.dto.ts             # Login DTO
│   ├── refresh-token.dto.ts     # Token refresh DTO
│   ├── forgot-password.dto.ts   # Password reset request
│   ├── reset-password.dto.ts    # Password reset confirm
│   ├── verify-email.dto.ts      # Email verification
│   └── change-password.dto.ts   # Password change
└── strategies/
    ├── jwt.strategy.ts          # JWT access token validation
    ├── jwt-refresh.strategy.ts  # JWT refresh token validation
    ├── local.strategy.ts        # Email/password validation
    └── google.strategy.ts       # Google OAuth
```

---

## Common Folder (`src/common/`)

### Decorators (`common/decorators/`)

| File | Description |
|------|-------------|
| `current-user.decorator.ts` | Extract user from request |
| `public.decorator.ts` | Mark endpoint as public (no auth) |

### Filters (`common/filters/`)

| File | Description |
|------|-------------|
| `http-exception.filter.ts` | Global exception handling |

### Guards (`common/guards/`)

| File | Description |
|------|-------------|
| `jwt-auth.guard.ts` | JWT authentication guard |
| `csrf.guard.ts` | CSRF protection guard |

### Interceptors (`common/interceptors/`)

| File | Description |
|------|-------------|
| `transform.interceptor.ts` | Response transformation |

### Middleware (`common/middleware/`)

| File | Description |
|------|-------------|
| `csrf.middleware.ts` | CSRF token middleware |

### Utils (`common/utils/`)

| File | Description |
|------|-------------|
| `pagination.util.ts` | Pagination helpers |
| `crypto.util.ts` | Encryption/decryption utilities |

---

## Database Folder (`src/database/`)

### Prisma (`database/prisma/`)

| File | Description |
|------|-------------|
| `prisma.module.ts` | Prisma module |
| `prisma.service.ts` | Prisma client service |

### Redis (`database/redis/`)

| File | Description |
|------|-------------|
| `redis.module.ts` | Redis module |
| `redis.service.ts` | Redis client service |

---

## Jobs Folder (`src/jobs/`)

### Processors (`jobs/processors/`)

| File | Description |
|------|-------------|
| `email.processor.ts` | Email sending queue |
| `sms.processor.ts` | SMS sending queue |
| `notification.processor.ts` | Push notifications |
| `leaderboard.processor.ts` | Leaderboard calculations |
| `settlement.processor.ts` | Bet settlement |
| `payout.processor.ts` | Payout processing |
| `cleanup.processor.ts` | Data cleanup tasks |

### Queues (`jobs/queues/`)

| File | Description |
|------|-------------|
| `queues.module.ts` | Queue module definition |

---

## Shared Folder (`src/shared/`)

### Constants (`shared/constants/`)

| File | Description |
|------|-------------|
| `app.constants.ts` | Application constants |

### Interfaces (`shared/interfaces/`)

| File | Description |
|------|-------------|
| `user.interface.ts` | User-related interfaces |
| `auth.interface.ts` | Authentication interfaces |

### Types (`shared/types/`)

| File | Description |
|------|-------------|
| `common.types.ts` | Common type definitions |

---

## WebSockets Folder (`src/websockets/`)

### Adapters (`websockets/adapters/`)

| File | Description |
|------|-------------|
| `redis.adapter.ts` | Redis adapter for Socket.IO |

### Gateways (`websockets/gateways/`)

| File | Description |
|------|-------------|
| `activity.gateway.ts` | Live activity feed |
| `leaderboard.gateway.ts` | Real-time leaderboard updates |
| `notifications.gateway.ts` | Push notifications |

---

## Configuration Files

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### `nest-cli.json`

```json
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

---

## Module List & Responsibilities

| Module | Endpoints | Description |
|--------|-----------|-------------|
| `auth` | 15 | Authentication, OAuth, sessions, 2FA |
| `users` | 10 | Profile, avatar, privacy, addresses |
| `wallet` | 12 | Balances, transactions, purchases |
| `games` | 15 | Game catalog, favorites, sessions |
| `sports` | 15 | Sports betting, matches, bets |
| `leaderboard` | 7 | Rankings, prizes, history |
| `promotions` | 9 | Bonuses, spin wheel, promo codes |
| `vip` | 6 | Tiers, XP, cashback |
| `referrals` | 5 | Referral codes, rewards |
| `notifications` | 7 | Notifications, preferences |
| `verification` | 7 | Email, phone, 2FA verification |
| `jackpot` | 4 | Jackpots, wins |
| `prizes` | 6 | Prize store, redemptions |
| `amoe` | 5 | Alternative method of entry |
| `content` | 7 | WBCTV videos, watch history |
| `activity` | 7 | Recent wins, live bets, social proof |
| `help` | 10 | FAQs, support tickets |
| `settings` | 9 | User settings, responsible gaming |
| `cms` | 6 | Static pages, announcements, banners |
| `media` | 2 | Media library |
| `providers` | 2 | Game providers |
| `admin` | 40+ | Admin panel operations |

---

## Code Patterns

### Controller Pattern

```typescript
@ApiTags('ModuleName')
@Controller('route-prefix')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Public() // For public endpoints
  @Get()
  @ApiOperation({ summary: 'Description' })
  @ApiResponse({ status: 200, description: 'Success' })
  async getItems(@Query() query: QueryDto) {
    return this.moduleService.getItems(query);
  }

  @UseGuards(JwtAuthGuard) // For protected endpoints
  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  async getItem(@Param('id') id: string, @CurrentUser() user: User) {
    return this.moduleService.getItem(id, user.id);
  }
}
```

### Service Pattern

```typescript
@Injectable()
export class ModuleService {
  private readonly logger = new Logger(ModuleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getItems(query: QueryDto) {
    const { skip, take } = getPaginationParams(query);

    const [items, total] = await Promise.all([
      this.prisma.model.findMany({ skip, take }),
      this.prisma.model.count(),
    ]);

    return createPaginatedResult(items, total, query.page, query.limit);
  }
}
```

### DTO Pattern

```typescript
export class CreateItemDto {
  @ApiProperty({ example: 'value' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
```

---

## Environment Variables

```bash
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/neonplay

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

# Email
SENDGRID_API_KEY=

# SMS
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=

# Storage
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Encryption
ENCRYPTION_KEY=32-byte-hex-key

# Frontend
FRONTEND_URL=http://localhost:3001
```

---

## NPM Scripts

```json
{
  "build": "nest build",
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:debug": "nest start --debug --watch",
  "start:prod": "node dist/main",
  "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
  "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage",
  "test:e2e": "jest --config ./test/jest-e2e.json",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:migrate:prod": "prisma migrate deploy",
  "prisma:seed": "npx prisma db seed",
  "prisma:studio": "prisma studio",
  "db:reset": "prisma migrate reset --force && npm run prisma:seed"
}
```

---

## Import Order Convention

```typescript
// 1. NestJS core imports
import { Module, Controller, Injectable } from '@nestjs/common';

// 2. NestJS feature imports
import { ConfigService } from '@nestjs/config';

// 3. Third-party imports
import { Prisma } from '@prisma/client';

// 4. Absolute imports (from src/)
import { PrismaService } from '@/database/prisma/prisma.service';

// 5. Relative imports
import { ModuleService } from './module.service';
import { CreateDto } from './dto/create.dto';
```

---

## Testing Structure

```
test/
├── unit/
│   └── services/
│       ├── auth.service.spec.ts
│       └── wallet.service.spec.ts
├── integration/
│   └── controllers/
│       ├── auth.controller.spec.ts
│       └── games.controller.spec.ts
├── e2e/
│   ├── app.e2e-spec.ts
│   ├── auth.e2e-spec.ts
│   └── wallet.e2e-spec.ts
└── setup.ts
```
