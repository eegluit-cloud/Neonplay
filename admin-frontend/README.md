# Admin Frontend

Admin backoffice web application for the casino platform.

## Tech Stack

- **Framework**: React 18
- **Routing**: React Router v6
- **State Management**: React Context API
- **Styling**: Custom CSS with CSS variables
- **HTTP Client**: Fetch API

## Features

- Admin authentication with role-based UI
- Dashboard with key metrics and trends
- Player management and detail views
- KYC document review and approval
- Transaction management
- Bonus configuration
- Game and provider management
- Comprehensive reporting with CSV export
- Admin user management (super_admin only)

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Admin Backend API running on port 3002

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will run on http://localhost:3003

### Environment Variables

Create a `.env` file (optional):

```env
REACT_APP_API_URL=http://localhost:3002/api
PORT=3003
```

## Project Structure

```
src/
├── components/
│   ├── Layout.js          # Admin layout with sidebar
│   └── ProtectedRoute.js  # Auth guard component
├── context/
│   └── AuthContext.js     # Authentication state
├── pages/
│   ├── Login.js           # Admin login
│   ├── Dashboard.js       # Admin dashboard
│   ├── Players.js         # Player list
│   ├── PlayerDetail.js    # Player detail view
│   ├── KYC.js             # KYC management
│   ├── Transactions.js    # Transaction management
│   ├── Bonuses.js         # Bonus management
│   ├── Games.js           # Game management
│   ├── Reports.js         # Reporting dashboard
│   └── Admins.js          # Admin management
├── services/
│   └── api.js             # API client
├── App.js                 # App routes
├── App.css                # Global styles
└── index.js               # Entry point
```

## Pages

### Dashboard
- Today's stats: deposits, withdrawals, GGR, new players
- Pending items: withdrawals, KYC reviews
- 7-day trend visualization
- Quick action links

### Players
- Searchable player list
- Filter by status, KYC status
- View player details
- Pagination

### Player Detail
- Full player profile
- Balance adjustment (manager+)
- Status changes
- Transaction history
- Notes and tags
- Process pending withdrawals

### KYC
- Pending KYC submissions
- Document viewing
- Approve/reject with notes (manager+)

### Transactions
- All transactions list
- Filter by type, status, date
- Process withdrawals (manager+)

### Bonuses
- List all bonus configurations
- Create new bonuses (manager+)
- Edit/deactivate bonuses
- View bonus statistics

### Games
- Game list with status toggle
- Provider management
- Game statistics

### Reports
- Transaction reports
- Banking summary
- Bonus reports
- Player reports
- Game performance
- Date range filtering
- CSV export

### Admins (super_admin only)
- Admin user list
- Create new admins
- Edit roles
- Enable/disable accounts
- Reset passwords

## Role-Based Access

The UI adapts based on admin role:

| Feature | Support | Manager | Super Admin |
|---------|---------|---------|-------------|
| View Players | ✓ | ✓ | ✓ |
| Add Notes | ✓ | ✓ | ✓ |
| Adjust Balance | ✗ | ✓ | ✓ |
| Approve KYC | ✗ | ✓ | ✓ |
| Process Withdrawals | ✗ | ✓ | ✓ |
| Manage Bonuses | ✗ | ✓ | ✓ |
| Manage Admins | ✗ | ✗ | ✓ |

## Test Accounts

After backend seeding:
- **Super Admin**: super@casino.com / admin123
- **Manager**: manager@casino.com / admin123
- **Support**: support@casino.com / admin123

## Scripts

```bash
npm start        # Start development server
npm run build    # Build for production
npm test         # Run tests
```

## Connecting to Backend

The frontend expects the admin backend API at `http://localhost:3002/api`. Make sure the backend is running before starting the frontend.

## Styling

The app uses a dark theme matching the player frontend. CSS variables in `App.css`:

```css
:root {
  --bg-dark: #0a0a0f;
  --bg-card: #12121a;
  --primary: #6366f1;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
}
```
