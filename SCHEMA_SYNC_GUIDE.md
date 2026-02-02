# 🔄 Database Schema Synchronization Guide

## Problem

Your project has **two backends** (Player + Admin) that need to share the **same database schema**:
- Player Backend: NestJS with Pay247 integration
- Admin Backend: Express.js for admin panel

**Without sync**, schema changes in one backend won't reflect in the other → database errors.

---

## ✅ Solution Implemented: Shared Schema

Both backends now use a **single source of truth** located at:
```
shared/prisma/schema.prisma
```

### What Was Changed

1. **Created shared schema directory**:
   ```
   shared/
   └── prisma/
       ├── schema.prisma      (Single source of truth)
       ├── README.md          (Documentation)
       └── sync-schema.sh     (Helper script)
   ```

2. **Updated both package.json files** to reference shared schema:
   - `player-backend/package.json`
   - `admin-backend/package.json`

3. **Updated docker-compose.yml** to mount shared directory in all services

---

## 📋 How to Use (Development)

### Option A: Using Docker (Easiest)

**1. Rebuild containers to apply changes:**
```bash
cd /Users/ujjwalsharma/Desktop/neonplay/neonplay
docker-compose down
docker-compose up -d --build
```

**2. Check if schema is synced:**
```bash
docker-compose logs migrations | tail -20
docker-compose logs admin-migrations | tail -20
```

### Option B: Using Helper Script (Local Development)

**1. After editing the schema:**
```bash
cd shared
./sync-schema.sh push      # Push changes to database
./sync-schema.sh generate  # Regenerate Prisma clients
```

**2. Open Prisma Studio:**
```bash
./sync-schema.sh studio
```

**3. Format schema:**
```bash
./sync-schema.sh format
```

---

## 🛠️ Making Schema Changes

### Step 1: Edit the Shared Schema
```bash
# Edit the single source of truth
vim shared/prisma/schema.prisma

# For example, adding a new Pay247 field:
model Deposit {
  // ... existing fields ...
  pay247NewField  String?   @map("pay247_new_field")  // Add this
}
```

### Step 2: Apply Changes

**If using Docker:**
```bash
docker-compose restart migrations admin-migrations
docker-compose restart player-backend admin-backend
```

**If using local development:**
```bash
cd shared
./sync-schema.sh push
./sync-schema.sh generate
```

### Step 3: Verify
```bash
# Check player-backend
docker-compose logs player-backend | grep -i "prisma\|error"

# Check admin-backend
docker-compose logs admin-backend | grep -i "prisma\|error"
```

---

## 🚀 Current Pay247 Integration Status

**Backend:**
- ✅ All Pay247 routes working
- ✅ Database schema synced with Pay247 fields
- ✅ Both backends can access Pay247 models

**Frontend:**
- ✅ WalletModal integrated with Pay247
- ✅ Deposit/withdrawal flows complete

**Shared Models (Both backends have access):**
- ✅ `Deposit` with Pay247 fields (merchantOrderId, pay247OrderId, paymentUrl, pay247Metadata)
- ✅ `Withdrawal` with Pay247 fields
- ✅ `Pay247WebhookLog`
- ✅ `UserPaymentStats`
- ✅ `DailyPaymentStats`
- ✅ `GlobalPaymentStats`

---

## 🔍 Troubleshooting

### Issue: "Column does not exist"
**Cause:** Schema changes not applied to database
**Fix:**
```bash
docker exec neonplay-player-backend npx prisma db push
docker-compose restart player-backend admin-backend
```

### Issue: "Cannot find module '@prisma/client'"
**Cause:** Prisma client not generated
**Fix:**
```bash
docker exec neonplay-player-backend npx prisma generate
docker exec neonplay-admin-backend npx prisma generate
docker-compose restart player-backend admin-backend
```

### Issue: Changes in shared schema not reflected
**Cause:** Containers using old cached schema
**Fix:**
```bash
docker-compose down
docker-compose up -d --build
```

---

## 📁 File Structure

```
neonplay/
├── shared/
│   └── prisma/
│       ├── schema.prisma          ← Single source of truth
│       ├── README.md
│       └── sync-schema.sh
├── player-backend/
│   ├── package.json               ← References ../shared/prisma/schema.prisma
│   └── prisma/
│       └── seed.ts                ← Player-specific seed data
├── admin-backend/
│   ├── package.json               ← References ../shared/prisma/schema.prisma
│   └── prisma/
│       └── seed.js                ← Admin-specific seed data
└── docker-compose.yml             ← Mounts ./shared in all services
```

---

## ⚡ Quick Commands Reference

```bash
# Rebuild everything
docker-compose up -d --build

# Push schema changes (in container)
docker exec neonplay-player-backend npx prisma db push

# Generate Prisma clients (in containers)
docker exec neonplay-player-backend npx prisma generate
docker exec neonplay-admin-backend npx prisma generate

# View migrations logs
docker-compose logs migrations admin-migrations

# Restart backends after schema changes
docker-compose restart player-backend admin-backend

# Open Prisma Studio
cd player-backend && npx prisma studio
```

---

## ✅ Benefits

1. **No Schema Drift**: Changes in one place affect both backends
2. **Easier Pay247 Updates**: Add fields once, available everywhere
3. **Single Migration Process**: One schema push updates entire database
4. **Reduced Errors**: No more "column doesn't exist" between backends
5. **Better Maintainability**: Clear single source of truth

---

## 🎯 Next Steps

1. Test the current setup by making a small schema change
2. Verify both backends can access the change
3. Always use `shared/prisma/schema.prisma` for future changes
4. Never edit `player-backend/prisma/schema.prisma` or `admin-backend/prisma/schema.prisma` directly

---

**Need help?** Check `shared/prisma/README.md` for more details.
