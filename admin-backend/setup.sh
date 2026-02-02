#!/bin/bash

# Admin Backend Setup Script
# This script will install dependencies, generate Prisma client, and seed the database

set -e  # Exit on any error

echo "========================================="
echo "Admin Backend Setup"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo "ℹ $1"
}

# Step 1: Check for package manager
echo "Step 1: Checking for package manager..."
PACKAGE_MANAGER=""

if command -v npm &> /dev/null; then
    PACKAGE_MANAGER="npm"
    print_success "Found npm"
elif command -v yarn &> /dev/null; then
    PACKAGE_MANAGER="yarn"
    print_success "Found yarn"
elif command -v pnpm &> /dev/null; then
    PACKAGE_MANAGER="pnpm"
    print_success "Found pnpm"
elif command -v bun &> /dev/null; then
    PACKAGE_MANAGER="bun"
    print_success "Found bun"
else
    print_error "No package manager found (npm, yarn, pnpm, or bun)"
    echo ""
    echo "Please install Node.js and npm first:"
    echo "  brew install node    (macOS)"
    echo "  Or visit: https://nodejs.org/"
    exit 1
fi

echo ""

# Step 2: Install dependencies
echo "Step 2: Installing dependencies..."
if [ "$PACKAGE_MANAGER" = "npm" ]; then
    npm install
elif [ "$PACKAGE_MANAGER" = "yarn" ]; then
    yarn install
elif [ "$PACKAGE_MANAGER" = "pnpm" ]; then
    pnpm install
elif [ "$PACKAGE_MANAGER" = "bun" ]; then
    bun install
fi

if [ $? -eq 0 ]; then
    print_success "Dependencies installed"
else
    print_error "Failed to install dependencies"
    exit 1
fi

echo ""

# Step 3: Generate Prisma Client
echo "Step 3: Generating Prisma Client..."
if [ "$PACKAGE_MANAGER" = "npm" ]; then
    npx prisma generate
elif [ "$PACKAGE_MANAGER" = "yarn" ]; then
    yarn prisma generate
elif [ "$PACKAGE_MANAGER" = "pnpm" ]; then
    pnpm prisma generate
elif [ "$PACKAGE_MANAGER" = "bun" ]; then
    bunx prisma generate
fi

if [ $? -eq 0 ]; then
    print_success "Prisma Client generated"
else
    print_error "Failed to generate Prisma Client"
    exit 1
fi

echo ""

# Step 4: Check database connection
echo "Step 4: Checking database connection..."
print_info "Database URL: $DATABASE_URL"

if [ -z "$DATABASE_URL" ]; then
    print_warning "DATABASE_URL not set in environment"
    print_info "Using .env file configuration"
fi

echo ""

# Step 5: Push database schema
echo "Step 5: Creating database tables..."
if [ "$PACKAGE_MANAGER" = "npm" ]; then
    npx prisma db push --skip-generate
elif [ "$PACKAGE_MANAGER" = "yarn" ]; then
    yarn prisma db push --skip-generate
elif [ "$PACKAGE_MANAGER" = "pnpm" ]; then
    pnpm prisma db push --skip-generate
elif [ "$PACKAGE_MANAGER" = "bun" ]; then
    bunx prisma db push --skip-generate
fi

if [ $? -eq 0 ]; then
    print_success "Database tables created"
else
    print_error "Failed to create database tables"
    print_warning "Make sure PostgreSQL is running and DATABASE_URL is correct in .env"
    exit 1
fi

echo ""

# Step 6: Seed database
echo "Step 6: Seeding database with admin users and initial data..."
if [ "$PACKAGE_MANAGER" = "npm" ]; then
    npx prisma db seed
elif [ "$PACKAGE_MANAGER" = "yarn" ]; then
    yarn prisma db seed
elif [ "$PACKAGE_MANAGER" = "pnpm" ]; then
    pnpm prisma db seed
elif [ "$PACKAGE_MANAGER" = "bun" ]; then
    bunx prisma db seed
fi

if [ $? -eq 0 ]; then
    print_success "Database seeded successfully"
else
    print_warning "Database seeding failed (may already be seeded)"
fi

echo ""
echo "========================================="
echo ""
print_success "Setup completed successfully!"
echo ""
echo "Admin Login Credentials:"
echo "------------------------"
echo "Email: super@casino.com"
echo "Password: Admin@123"
echo "Role: Super Admin"
echo ""
echo "Email: admin@casino.com"
echo "Password: Admin@123"
echo "Role: Admin"
echo ""
echo "Email: support@casino.com"
echo "Password: Admin@123"
echo "Role: Support"
echo ""
echo "========================================="
echo ""
echo "To start the server:"
if [ "$PACKAGE_MANAGER" = "npm" ]; then
    echo "  npm run dev"
elif [ "$PACKAGE_MANAGER" = "yarn" ]; then
    echo "  yarn dev"
elif [ "$PACKAGE_MANAGER" = "pnpm" ]; then
    echo "  pnpm dev"
elif [ "$PACKAGE_MANAGER" = "bun" ]; then
    echo "  bun run dev"
fi
echo ""
echo "Server will run on: http://localhost:8002"
echo "========================================="
