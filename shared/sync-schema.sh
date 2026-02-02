#!/bin/bash

# Shared Schema Management Script
# This script helps manage the shared Prisma schema

set -e

echo "🔄 Shared Schema Manager"
echo "======================="
echo ""

# Change to the root directory
cd "$(dirname "$0")/.."

case "${1:-help}" in
  "generate")
    echo "📦 Generating Prisma Client for both backends..."
    echo ""

    echo "➡️  Player Backend..."
    cd player-backend
    npx prisma generate
    echo "✅ Player Backend client generated"
    echo ""

    echo "➡️  Admin Backend..."
    cd ../admin-backend
    npx prisma generate
    echo "✅ Admin Backend client generated"
    echo ""

    echo "✅ All clients generated successfully!"
    ;;

  "push")
    echo "🚀 Pushing schema to database..."
    echo ""

    cd player-backend
    npx prisma db push
    echo ""

    echo "✅ Schema pushed successfully!"
    echo ""
    echo "💡 Run '$0 generate' to regenerate clients"
    ;;

  "studio")
    echo "🎨 Opening Prisma Studio..."
    cd player-backend
    npx prisma studio
    ;;

  "format")
    echo "✨ Formatting schema..."
    cd player-backend
    npx prisma format
    echo "✅ Schema formatted!"
    ;;

  "validate")
    echo "🔍 Validating schema..."
    cd player-backend
    npx prisma validate
    echo "✅ Schema is valid!"
    ;;

  *)
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  generate  - Generate Prisma Client for both backends"
    echo "  push      - Push schema changes to database"
    echo "  studio    - Open Prisma Studio"
    echo "  format    - Format the schema file"
    echo "  validate  - Validate the schema"
    echo ""
    echo "Examples:"
    echo "  $0 generate           # Regenerate clients after schema changes"
    echo "  $0 push              # Push schema to database and generate"
    echo "  $0 studio            # Open database GUI"
    echo ""
    ;;
esac
