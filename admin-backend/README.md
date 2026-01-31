# Admin Backend API

Backend API server for the casino admin backoffice.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (better-sqlite3)
- **Authentication**: JWT with role-based access

## Features

- Admin authentication with role-based access control
- Player management (view, edit, block, adjust balances)
- KYC document review and approval
- Transaction management (approve/reject withdrawals)
- Bonus management (create, edit, deactivate)
- Game and provider management
- Comprehensive reporting with CSV export
- Admin audit logging

## Roles

- **super_admin**: Full access including admin management
- **manager**: Player management, KYC approval, bonus management, balance adjustments
- **support**: View players, add notes, view KYC (read-only)

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Initialize and seed database
npm run seed

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with:

```env
PORT=3002
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current admin info
- `POST /api/auth/change-password` - Change password

### Admin Management (super_admin only)
- `GET /api/admins` - List all admins
- `POST /api/admins` - Create new admin
- `PUT /api/admins/:id` - Update admin
- `PUT /api/admins/:id/status` - Change admin status
- `POST /api/admins/:id/reset-password` - Reset admin password

### Players
- `GET /api/players` - List players with filters
- `GET /api/players/:id` - Get player details
- `PUT /api/players/:id` - Update player info
- `PUT /api/players/:id/status` - Change player status
- `POST /api/players/:id/adjust-balance` - Adjust balance (manager+)
- `POST /api/players/:id/notes` - Add player note
- `PUT /api/players/:id/tags` - Update player tags

### KYC
- `GET /api/kyc` - List KYC submissions
- `GET /api/kyc/:id` - Get KYC details
- `PUT /api/kyc/:id/review` - Approve/reject KYC (manager+)

### Transactions
- `GET /api/transactions` - List transactions
- `GET /api/transactions/:id` - Get transaction details
- `PUT /api/transactions/:id/process` - Process withdrawal (manager+)

### Bonuses
- `GET /api/bonuses` - List all bonuses
- `POST /api/bonuses` - Create bonus (manager+)
- `PUT /api/bonuses/:id` - Update bonus (manager+)
- `DELETE /api/bonuses/:id` - Deactivate bonus (manager+)

### Games
- `GET /api/games` - List games
- `PUT /api/games/:id` - Update game (toggle status)
- `GET /api/providers` - List providers
- `PUT /api/providers/:id` - Update provider

### Reports
- `GET /api/reports/dashboard` - Dashboard summary
- `GET /api/reports/transactions` - Transaction report
- `GET /api/reports/banking` - Banking report
- `GET /api/reports/bonuses` - Bonus report
- `GET /api/reports/players` - Player report
- `GET /api/reports/games` - Game report
- `GET /api/reports/export/:type` - Export report as CSV

## Database Schema

Shared with player-backend, plus:
- `admins` - Admin user accounts
- `admin_logs` - Audit trail for admin actions
- `player_notes` - Notes added by admins

## Test Accounts

After seeding:
- **Super Admin**: super@casino.com / admin123
- **Manager**: manager@casino.com / admin123
- **Support**: support@casino.com / admin123

## Scripts

```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm run seed     # Seed database with test data
```
