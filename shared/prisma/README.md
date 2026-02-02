# Shared Prisma Schema

This directory contains the **single source of truth** for the database schema used by both:
- **Player Backend** (NestJS)
- **Admin Backend** (Express.js)

## Why Shared Schema?

Both backends connect to the same PostgreSQL database and need identical table structures. Instead of maintaining two separate schemas that can drift apart, we use one shared schema.

## How It Works

Both `player-backend/package.json` and `admin-backend/package.json` reference this schema:

```json
{
  "prisma": {
    "schema": "../shared/prisma/schema.prisma"
  }
}
```

## Making Schema Changes

1. **Edit the schema**:
   ```bash
   # Edit the shared schema
   vim shared/prisma/schema.prisma
   ```

2. **Push changes to database** (development):
   ```bash
   # From player-backend directory
   cd player-backend
   npx prisma db push
   npx prisma generate

   # From admin-backend directory
   cd admin-backend
   npx prisma generate
   ```

3. **Or restart Docker containers**:
   ```bash
   docker-compose restart migrations admin-migrations
   docker-compose restart player-backend admin-backend
   ```

## Key Benefits

✅ Single source of truth - no schema drift
✅ Changes automatically apply to both backends
✅ Easier to maintain Pay247 and other shared models
✅ Prevents accidental schema mismatches

## Seed Files

Seed files remain separate in each backend:
- `player-backend/prisma/seed.ts` - Player data
- `admin-backend/prisma/seed.js` - Admin data
