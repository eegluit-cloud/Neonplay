# NeonPlay Casino Platform

A full-stack social casino gaming platform with sweepstakes functionality.

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Player Frontend** | React + Vite + TypeScript + TailwindCSS |
| **Player Backend** | NestJS + Prisma + PostgreSQL |
| **Admin Frontend** | React (vanilla JS) |
| **Admin Backend** | Express.js |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis 7 |
| **Container** | Docker + Docker Compose |

## Quick Start

```bash
# One command to start everything
make setup
```

This will:
- Start PostgreSQL and Redis
- Run database migrations
- Seed demo data (50+ games, users, activity)
- Start the player frontend

**Then open:** http://localhost:8000

## Documentation

| Document | Description |
|----------|-------------|
| [DOCKER.md](./DOCKER.md) | Docker setup guide with all commands |
| [player-backend/docs/DATABASE_SCHEMA.md](./player-backend/docs/DATABASE_SCHEMA.md) | Database schema documentation |
| [player-backend/docs/FOLDER_STRUCTURE.md](./player-backend/docs/FOLDER_STRUCTURE.md) | Project structure guide |

## Common Commands

```bash
make setup      # Full setup with demo data
make dev        # Start databases + frontend
make all        # Start all services
make studio     # Open database viewer
make db-reset   # Reset and reseed database
make down       # Stop all containers
make clean      # Remove everything
```

See [DOCKER.md](./DOCKER.md) for full command reference.

## Demo Credentials

| Account | Email | Password |
|---------|-------|----------|
| Test User | test@example.com | Test123! |
| Admin | admin@wbc2026.com | Admin123! |

## Service URLs

| Service | URL |
|---------|-----|
| Player Frontend | http://localhost:8000 |
| Player API | http://localhost:4000 |
| API Docs | http://localhost:4000/api/docs |
| Admin Frontend | http://localhost:8003 |
| Prisma Studio | http://localhost:5555 |

## Project Structure

```
NeonPlay2/
├── player-frontend/     # React + Vite player app
├── player-backend/      # NestJS API server
│   ├── prisma/          # Database schema & migrations
│   ├── src/
│   │   ├── modules/     # Feature modules
│   │   ├── common/      # Shared utilities
│   │   └── jobs/        # Background processors
│   └── docs/            # API documentation
├── admin-frontend/      # Admin dashboard
├── admin-backend/       # Admin API
├── docker-compose.yml   # Container orchestration
├── Makefile             # Development commands
└── DOCKER.md            # Setup documentation
```

## Features

### Player Platform
- 50+ Casino games (Slots, Crash, Live Casino, Table Games)
- Sports betting with live matches
- VIP tier system with rewards
- Daily/Weekly/Monthly bonuses
- Leaderboards and competitions
- Prize redemption store
- Real-time notifications
- Responsible gaming controls

### Admin Platform
- User management
- Game management
- Promotion configuration
- Transaction monitoring
- Analytics dashboard

## Development

```bash
# Install dependencies locally (for IDE support)
make install

# View logs
make logs

# Start dev tools (Adminer, Redis Commander)
make dev-tools
```

## License

Proprietary - All rights reserved
