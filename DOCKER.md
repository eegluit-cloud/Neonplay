# NeonPlay Docker Setup Guide

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v2+
- Make (usually pre-installed on macOS/Linux)

## Quick Start

```bash
# Full setup - starts everything and seeds demo data
make setup
```

This single command will:
1. Start PostgreSQL and Redis databases
2. Wait for databases to be ready
3. Run Prisma migrations
4. Seed database with 50+ games, demo users, and all demo data
5. Start the player frontend

---

## Available Commands

### 🚀 Quick Start Commands

| Command | Description |
|---------|-------------|
| `make setup` | **Recommended** - Full setup with migrations and seed data |
| `make dev` | Start databases + player frontend (no backend) |
| `make all` | Start all services including backends |

### 🗄️ Database Commands

| Command | Description |
|---------|-------------|
| `make db-up` | Start PostgreSQL + Redis only |
| `make db-down` | Stop databases |
| `make migrate` | Run Prisma schema migrations |
| `make seed` | Seed database with demo data |
| `make db-reset` | Drop database, recreate, migrate, and reseed |
| `make studio` | Start Prisma Studio (database viewer) |
| `make studio-stop` | Stop Prisma Studio |

### 🖥️ Service Commands

| Command | Description |
|---------|-------------|
| `make up` | Start frontends (player + admin) |
| `make down` | Stop all containers |
| `make backend` | Start backends only (requires databases) |
| `make player` | Start player frontend only |
| `make admin` | Start admin frontend only |

### 🛠️ Development Commands

| Command | Description |
|---------|-------------|
| `make dev-tools` | Start Adminer + Redis Commander |
| `make build` | Build all Docker images |
| `make logs` | View logs from all containers |
| `make logs-frontend` | View frontend logs only |
| `make logs-db` | View database logs |
| `make clean` | Remove all containers, volumes, and images |
| `make install` | Install npm dependencies locally (for IDE) |

---

## Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| Player Frontend | http://localhost:8000 | Main player-facing app |
| Player Backend API | http://localhost:4000 | REST API |
| API Documentation | http://localhost:4000/api/docs | Swagger UI |
| Admin Frontend | http://localhost:8003 | Admin dashboard |
| Admin Backend | http://localhost:8002 | Admin API |
| Prisma Studio | http://localhost:5555 | Database viewer |
| Adminer | http://localhost:8080 | Database admin (dev tools) |
| Redis Commander | http://localhost:8081 | Redis viewer (dev tools) |

### Database Connections

| Service | Host | Port | Credentials |
|---------|------|------|-------------|
| PostgreSQL | localhost | 5432 | postgres / password |
| Redis | localhost | 6379 | (no password) |

---

## Demo Credentials

| Account | Email | Password |
|---------|-------|----------|
| Test User | test@example.com | Test123! |
| Admin | admin@wbc2026.com | Admin123! |

---

## Common Workflows

### First Time Setup
```bash
# Clone and enter directory
cd NeonPlay2

# Run full setup
make setup

# Open browser
open http://localhost:8000
```

### Daily Development
```bash
# Start everything
make dev

# Or with backend API
make all

# View logs
make logs
```

### Reset Database
```bash
# Completely reset and reseed
make db-reset
```

### View Database
```bash
# Start Prisma Studio
make studio

# Open browser
open http://localhost:5555

# When done
make studio-stop
```

### Clean Everything
```bash
# Stop and remove all containers, volumes, images
make clean

# Fresh start
make setup
```

---

## Troubleshooting

### Games not showing on frontend
```bash
# Restart the backend to sync Prisma client
docker-compose restart player-backend

# Or reset database
make db-reset
```

### Database connection errors
```bash
# Check if databases are running
docker ps | grep neonplay

# Restart databases
make db-down
make db-up
```

### Port already in use
```bash
# Find what's using the port
lsof -i :4000  # or :8000, :5432, etc.

# Stop all containers
make down
```

### Clear everything and start fresh
```bash
make clean
make setup
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Network                          │
│                   (neonplay-network)                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Player     │  │   Player     │  │    Admin     │       │
│  │  Frontend    │  │   Backend    │  │   Frontend   │       │
│  │  (Vite)      │  │  (NestJS)    │  │   (React)    │       │
│  │  :8000       │  │  :4000       │  │   :8003      │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                │                  │                │
│         └────────────────┼──────────────────┘                │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │  PostgreSQL  │  │    Redis     │                         │
│  │  :5432       │  │    :6379     │                         │
│  └──────────────┘  └──────────────┘                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Demo Data Included

After running `make setup`, the database contains:

### Games & Content
- **51 games** across 5 categories (Slots, Crash, Live Casino, Table Games, Instant Win)
- **40 game providers** (Pragmatic Play, NetEnt, Evolution, etc.)
- **14 NeonPlay TV videos**
- **3 hero banners**

### Users & Activity
- **12 demo players** with realistic activity
- **VIP levels** from Bronze to Diamond
- **30+ game sessions** with history
- **10 featured big wins** for social proof

### Sports Betting
- **5 sports** (Football, Basketball, Tennis, Soccer, Esports)
- **12 leagues** (NFL, NBA, Premier League, etc.)
- **17 teams**
- **8 matches** (live and upcoming)

### Promotions & Rewards
- **5 promotions** (Welcome, Daily, Weekly, Monthly, Reload)
- **8 spin wheel segments**
- **4 jackpots** with winner history
- **8 prizes** in redemption store
- **Leaderboards** with rankings

### Support & CMS
- **12 FAQs** across 5 categories
- **4 static pages**
- **3 announcements**
