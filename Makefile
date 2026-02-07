.PHONY: up down build logs clean help frontend backend all seed db-up db-down migrate dev setup studio

# Default target
help:
	@echo "NeonPlay Casino Platform - Docker Commands"
	@echo ""
	@echo "Quick Start:"
	@echo "  make setup       - Full setup: start DBs, run migrations, seed data"
	@echo "  make dev         - Start databases + player frontend (development)"
	@echo "  make all         - Start all services (databases + all frontends + backends)"
	@echo ""
	@echo "Services:"
	@echo "  make up          - Start frontends only (admin uses static data)"
	@echo "  make down        - Stop all containers"
	@echo "  make build       - Build all images"
	@echo "  make logs        - View logs from all containers"
	@echo "  make clean       - Remove all containers, images, and volumes"
	@echo ""
	@echo "Database:"
	@echo "  make db-up       - Start PostgreSQL + Redis"
	@echo "  make db-down     - Stop databases"
	@echo "  make migrate     - Run Prisma migrations"
	@echo "  make seed        - Seed backend databases"
	@echo "  make studio      - Start Prisma Studio (DB viewer)"
	@echo "  make db-reset    - Reset and reseed database"
	@echo ""
	@echo "Individual Services:"
	@echo "  make player      - Start player frontend only"
	@echo "  make admin       - Start admin frontend only"
	@echo "  make backend     - Start backends only (requires databases)"
	@echo ""
	@echo "Development Tools:"
	@echo "  make dev-tools   - Start Adminer + Redis Commander"
	@echo ""
	@echo "Access URLs:"
	@echo "  Player Frontend: http://localhost:8000"
	@echo "  Player Backend:  http://localhost:4000 (API)"
	@echo "  Admin Frontend:  http://localhost:8003"
	@echo "  Admin Backend:   http://localhost:8002"
	@echo "  PostgreSQL:      localhost:5432"
	@echo "  Redis:           localhost:6379"
	@echo "  Prisma Studio:   http://localhost:5555"
	@echo "  Adminer:         http://localhost:8080 (dev tools)"
	@echo "  Redis Commander: http://localhost:8081 (dev tools)"

# ============================================
# FULL SETUP - One command to rule them all
# ============================================
setup:
	@echo "🚀 Starting full setup..."
	@echo ""
	@echo "Step 1/4: Starting databases..."
	@docker compose up -d postgres redis
	@echo "Waiting for PostgreSQL to be ready..."
	@sleep 5
	@until docker exec neonplay-postgres pg_isready -U postgres > /dev/null 2>&1; do \
		echo "Waiting for PostgreSQL..."; \
		sleep 2; \
	done
	@echo "✅ Databases started!"
	@echo ""
	@echo "Step 2/4: Running Prisma migrations..."
	@docker run --rm --network neonplay-main_neonplay-network \
		-v $(shell pwd)/player-backend:/app -w /app node:20 \
		sh -c "npm install prisma @prisma/client && DATABASE_URL='postgresql://postgres:password@postgres:5432/neonplay' npx prisma db push --accept-data-loss"
	@echo "✅ Migrations complete!"
	@echo ""
	@echo "Step 3/4: Seeding database with demo data..."
	@docker run --rm --network neonplay-main_neonplay-network \
		-v $(shell pwd)/player-backend:/app -w /app node:20 \
		sh -c "rm -rf node_modules/bcrypt && npm install bcrypt && DATABASE_URL='postgresql://postgres:password@postgres:5432/neonplay' npx prisma db seed"
	@echo "✅ Database seeded!"
	@echo ""
	@echo "Step 4/4: Starting frontend..."
	@docker compose up -d player-frontend
	@echo ""
	@echo "============================================"
	@echo "🎉 Setup Complete!"
	@echo "============================================"
	@echo ""
	@echo "Services running:"
	@echo "  Player Frontend: http://localhost:8000"
	@echo "  PostgreSQL:      localhost:5432"
	@echo "  Redis:           localhost:6379"
	@echo ""
	@echo "Demo Credentials:"
	@echo "  Test User: test@example.com / Test123!"
	@echo "  Admin:     admin@wbc2026.com / Admin123!"
	@echo ""
	@echo "To view database: make studio"
	@echo "To start backend: make backend"
	@echo ""

# Development mode - databases + player frontend
dev:
	@echo "Starting development environment..."
	docker compose up -d postgres redis player-frontend
	@echo ""
	@echo "Development environment started!"
	@echo "  Player Frontend: http://localhost:8000"
	@echo "  PostgreSQL:      localhost:5432"
	@echo "  Redis:           localhost:6379"
	@echo ""
	@echo "Run 'make migrate' to setup database schema"

# Start frontends only (default - static data mode for admin)
up:
	@echo "Starting frontends..."
	docker compose up -d postgres redis player-frontend admin-frontend
	@echo ""
	@echo "Services started!"
	@echo "  Player Frontend: http://localhost:8000"
	@echo "  Admin Frontend:  http://localhost:8003"

# Start all services including backends
all:
	@echo "Starting all services..."
	docker compose --profile with-backend up -d
	@echo ""
	@echo "All services started!"
	@echo "  Player Frontend: http://localhost:8000"
	@echo "  Player Backend:  http://localhost:4000"
	@echo "  Admin Frontend:  http://localhost:8003"
	@echo "  Admin Backend:   http://localhost:8002"
	@echo "  PostgreSQL:      localhost:5432"
	@echo "  Redis:           localhost:6379"

# Start databases only
db-up:
	@echo "Starting databases..."
	docker compose up -d postgres redis
	@echo "PostgreSQL: localhost:5432"
	@echo "Redis: localhost:6379"

# Stop databases
db-down:
	@echo "Stopping databases..."
	docker compose stop postgres redis

# Start backends only
backend:
	@echo "Starting backends..."
	docker compose --profile with-backend up -d postgres redis player-backend admin-backend
	@echo "Player Backend: http://localhost:4000"
	@echo "Admin Backend: http://localhost:8002"

# Start player frontend only
player:
	@echo "Starting player frontend..."
	docker compose up -d postgres redis player-frontend
	@echo "Player Frontend: http://localhost:8000"

# Start admin frontend only
admin:
	@echo "Starting admin frontend..."
	docker compose up -d admin-frontend
	@echo "Admin Frontend: http://localhost:8003"

# Stop all containers
down:
	@echo "Stopping all containers..."
	docker compose --profile with-backend --profile dev down

# Build all images
build:
	@echo "Building all images..."
	docker compose --profile with-backend build

# View logs
logs:
	docker compose --profile with-backend logs -f

# View frontend logs only
logs-frontend:
	docker compose logs -f player-frontend admin-frontend

# View database logs
logs-db:
	docker compose logs -f postgres redis

# Clean everything
clean:
	@echo "Cleaning up..."
	docker compose --profile with-backend --profile dev down -v --rmi all --remove-orphans
	@echo "Cleanup complete!"

# Run Prisma migrations (via Docker)
migrate:
	@echo "Running Prisma migrations..."
	@docker run --rm --network neonplay-main_neonplay-network \
		-v $(shell pwd)/player-backend:/app -w /app node:20 \
		sh -c "npm install prisma @prisma/client && DATABASE_URL='postgresql://postgres:password@postgres:5432/neonplay' npx prisma db push --accept-data-loss"
	@echo "Migrations complete!"

# Generate Prisma client
prisma-generate:
	@echo "Generating Prisma client..."
	cd player-backend && npx prisma generate

# Seed databases (via Docker)
seed:
	@echo "Seeding databases..."
	@docker run --rm --network neonplay-main_neonplay-network \
		-v $(shell pwd)/player-backend:/app -w /app node:20 \
		sh -c "rm -rf node_modules/bcrypt && npm install bcrypt && DATABASE_URL='postgresql://postgres:password@postgres:5432/neonplay' npx prisma db seed"
	@echo "Database seeded!"

# Start Prisma Studio (database viewer)
studio:
	@echo "Starting Prisma Studio..."
	@docker rm -f prisma-studio 2>/dev/null || true
	@docker run -d --name prisma-studio --network neonplay-main_neonplay-network \
		-p 5555:5555 -v $(shell pwd)/player-backend:/app -w /app node:20 \
		sh -c "npm install -g prisma && DATABASE_URL='postgresql://postgres:password@postgres:5432/neonplay' npx prisma studio --port 5555 --hostname 0.0.0.0"
	@echo "Waiting for Prisma Studio to start..."
	@sleep 8
	@echo "✅ Prisma Studio is running at: http://localhost:5555"

# Stop Prisma Studio
studio-stop:
	@echo "Stopping Prisma Studio..."
	@docker rm -f prisma-studio 2>/dev/null || true
	@echo "Prisma Studio stopped."

# Reset database (drop and recreate)
db-reset:
	@echo "Resetting database..."
	@docker exec neonplay-postgres psql -U postgres -c "DROP DATABASE IF EXISTS neonplay;"
	@docker exec neonplay-postgres psql -U postgres -c "CREATE DATABASE neonplay;"
	@echo "Database dropped and recreated."
	@make migrate
	@make seed
	@echo "Database reset complete!"

# Start development tools (Adminer, Redis Commander)
dev-tools:
	@echo "Starting development tools..."
	docker compose --profile dev up -d adminer redis-commander
	@echo "Adminer: http://localhost:8080"
	@echo "Redis Commander: http://localhost:8081"

# Rebuild and restart
restart: down build up

# Restart all services
restart-all: down build all

# Install dependencies locally (for IDE support)
install:
	@echo "Installing dependencies..."
	cd player-frontend && npm install
	cd player-backend && npm install
	cd admin-frontend && npm install
	cd admin-backend && npm install
	@echo "Dependencies installed!"

# Type check
typecheck:
	@echo "Running type checks..."
	cd player-frontend && npm run lint
	cd player-backend && npm run lint
