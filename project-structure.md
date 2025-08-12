# Project Structure - Influencer Management Platform

## Directory Structure Overview

```
influencer-platform/
├── backend/                    # Node.js Express API
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Custom middleware
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Helper functions
│   │   ├── validators/       # Input validation
│   │   └── app.js           # Express app setup
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── migrations/       # Database migrations
│   ├── tests/               # Backend tests
│   ├── .env.example         # Environment variables template
│   ├── package.json
│   └── server.js           # Server entry point
│
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── features/      # Feature-specific modules
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   ├── store/         # Redux store
│   │   ├── utils/         # Helper functions
│   │   ├── styles/        # Global styles
│   │   ├── App.jsx        # Main App component
│   │   └── main.jsx       # Entry point
│   ├── public/           # Static assets
│   ├── index.html
│   ├── vite.config.js    # Vite configuration
│   ├── tailwind.config.js # Tailwind CSS config
│   └── package.json
│
├── docker-compose.yml    # Docker configuration
├── .gitignore
├── README.md
└── development-plan.md
```

## Backend Structure Details

### `/backend/src/config/`
```
config/
├── database.js        # PostgreSQL connection
├── redis.js          # Redis client setup
├── stripe.js         # Stripe configuration
├── instagram.js      # Instagram API config
├── tiktok.js        # TikTok API config
└── constants.js     # App constants
```

### `/backend/src/controllers/`
```
controllers/
├── auth.controller.js         # Login, register, refresh
├── campaign.controller.js     # Campaign CRUD
├── application.controller.js  # Campaign applications
├── submission.controller.js   # Content submissions
├── user.controller.js        # User management
├── payment.controller.js     # Payment processing
├── analytics.controller.js   # Analytics data
└── admin.controller.js      # Admin operations
```

### `/backend/src/middleware/`
```
middleware/
├── auth.middleware.js       # JWT verification
├── role.middleware.js       # Role-based access
├── validation.middleware.js # Request validation
├── rateLimit.middleware.js  # Rate limiting
├── error.middleware.js      # Error handling
└── upload.middleware.js     # File upload handling
```

### `/backend/src/models/`
```
models/
├── user.model.js
├── influencerProfile.model.js
├── campaign.model.js
├── campaignApplication.model.js
├── submission.model.js
├── transaction.model.js
├── notification.model.js
└── analytics.model.js
```

### `/backend/src/routes/`
```
routes/
├── index.js              # Route aggregator
├── auth.routes.js        # /api/auth/*
├── campaign.routes.js    # /api/campaigns/*
├── influencer.routes.js  # /api/influencer/*
├── brand.routes.js       # /api/brand/*
├── admin.routes.js       # /api/admin/*
├── payment.routes.js     # /api/payments/*
└── webhook.routes.js     # /api/webhooks/*
```

### `/backend/src/services/`
```
services/
├── auth.service.js          # Authentication logic
├── campaign.service.js      # Campaign operations
├── matching.service.js      # Influencer-campaign matching
├── instagram.service.js     # Instagram API integration
├── tiktok.service.js       # TikTok API integration
├── payment.service.js      # Stripe/PayPal logic
├── email.service.js        # SendGrid integration
├── notification.service.js  # Push notifications
└── analytics.service.js    # Metrics calculation
```

### `/backend/src/utils/`
```
utils/
├── logger.js           # Winston logger
├── validators.js       # Custom validators
├── urlParser.js       # Social media URL parsing
├── tokenGenerator.js  # JWT token generation
├── encryption.js      # Data encryption
└── scheduler.js       # Cron job scheduler
```

## Frontend Structure Details

### `/frontend/src/components/`
```
components/
├── common/
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Modal.jsx
│   ├── Card.jsx
│   ├── Table.jsx
│   ├── Dropdown.jsx
│   └── LoadingSpinner.jsx
├── campaign/
│   ├── CampaignCard.jsx
│   ├── CampaignList.jsx
│   ├── CampaignFilter.jsx
│   ├── CampaignDetails.jsx
│   └── CampaignForm.jsx
├── influencer/
│   ├── ProfileCard.jsx
│   ├── StatsWidget.jsx
│   ├── EarningsChart.jsx
│   └── SubmissionForm.jsx
└── admin/
    ├── ReviewQueue.jsx
    ├── ApplicationList.jsx
    ├── PaymentTable.jsx
    └── AnalyticsDashboard.jsx
```

### `/frontend/src/pages/`
```
pages/
├── public/
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── CampaignBrowse.jsx
├── influencer/
│   ├── Dashboard.jsx
│   ├── Campaigns.jsx
│   ├── MyCampaigns.jsx
│   ├── SubmitContent.jsx
│   ├── Earnings.jsx
│   └── Profile.jsx
├── brand/
│   ├── BrandDashboard.jsx
│   ├── CreateCampaign.jsx
│   ├── ManageCampaigns.jsx
│   ├── Applications.jsx
│   ├── ContentReview.jsx
│   ├── Analytics.jsx
│   └── Payments.jsx
└── NotFound.jsx
```

### `/frontend/src/features/`
```
features/
├── auth/
│   ├── authSlice.js
│   ├── authAPI.js
│   └── AuthGuard.jsx
├── campaigns/
│   ├── campaignsSlice.js
│   ├── campaignsAPI.js
│   └── campaignHooks.js
├── submissions/
│   ├── submissionsSlice.js
│   └── submissionsAPI.js
├── payments/
│   ├── paymentsSlice.js
│   └── paymentsAPI.js
└── notifications/
    ├── notificationsSlice.js
    └── NotificationProvider.jsx
```

### `/frontend/src/store/`
```
store/
├── store.js           # Redux store configuration
├── rootReducer.js     # Combine reducers
└── middleware.js      # Custom middleware
```

### `/frontend/src/services/`
```
services/
├── api.js            # Axios instance & interceptors
├── auth.service.js   # Auth API calls
├── campaign.service.js
├── submission.service.js
├── payment.service.js
└── analytics.service.js
```

### `/frontend/src/hooks/`
```
hooks/
├── useAuth.js         # Authentication hook
├── useCampaigns.js    # Campaign data hook
├── useDebounce.js     # Debounce hook
├── useInfiniteScroll.js
├── useNotification.js
└── useWebSocket.js    # Real-time updates
```

## Database Schema Files

### `/backend/prisma/schema.prisma`
```prisma
// User Management
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  passwordHash    String
  role            Role     @default(INFLUENCER)
  username        String   @unique
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  influencerProfile InfluencerProfile?
  brandProfile      BrandProfile?
  campaigns         Campaign[]
  applications      CampaignApplication[]
  submissions       Submission[]
  transactions      Transaction[]
  notifications     Notification[]
}

model InfluencerProfile {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id])
  
  instagramHandle   String?
  instagramFollowers Int     @default(0)
  instagramEngagement Float  @default(0)
  
  tiktokHandle      String?
  tiktokFollowers   Int     @default(0)
  tiktokEngagement  Float   @default(0)
  
  niche             String[]
  bio               String?
  reputationScore   Float    @default(0)
  verified          Boolean  @default(false)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model Campaign {
  id                String   @id @default(cuid())
  brandId           String
  brand             User     @relation(fields: [brandId], references: [id])
  
  title             String
  description       String
  platforms         Platform[]
  budget            Float
  slotsAvailable    Int
  
  minIgFollowers    Int?
  minTiktokFollowers Int?
  minEngagementRate Float?
  niche             String[]
  hashtags          String[]
  mentions          String[]
  
  startDate         DateTime
  endDate           DateTime
  status            CampaignStatus @default(DRAFT)
  
  applications      CampaignApplication[]
  submissions       Submission[]
  analytics         CampaignAnalytics?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

// Enums
enum Role {
  INFLUENCER
  BRAND
  ADMIN
}

enum Platform {
  INSTAGRAM
  TIKTOK
}

enum CampaignStatus {
  DRAFT
  ACTIVE
  PAUSED
  COMPLETED
  CANCELLED
}
```

## API Endpoints Structure

### Authentication Endpoints
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
POST   /api/auth/verify-email
POST   /api/auth/reset-password
```

### Campaign Endpoints
```
GET    /api/campaigns              # Public listing
GET    /api/campaigns/:id          # Campaign details
POST   /api/campaigns              # Create campaign (Brand)
PUT    /api/campaigns/:id          # Update campaign
DELETE /api/campaigns/:id          # Delete campaign
GET    /api/campaigns/:id/metrics  # Campaign analytics
```

### Application Endpoints
```
POST   /api/campaigns/:id/apply    # Apply to campaign
GET    /api/applications          # My applications (Influencer)
GET    /api/applications/:id      # Application details
PUT    /api/applications/:id      # Update application status (Brand)
```

### Submission Endpoints
```
POST   /api/submissions            # Submit content
GET    /api/submissions           # My submissions
GET    /api/submissions/:id       # Submission details
PUT    /api/submissions/:id       # Review submission (Brand)
```

### Payment Endpoints
```
POST   /api/payments/payout        # Request payout
GET    /api/payments/history      # Payment history
POST   /api/payments/webhook      # Stripe webhook
GET    /api/payments/balance      # Current balance
```

## Environment Variables

### Backend `.env`
```env
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/influencer_db
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Instagram API
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret

# TikTok API
TIKTOK_CLIENT_KEY=your-tiktok-client-key
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@influencer-platform.com

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_BUCKET_NAME=influencer-platform
AWS_REGION=us-east-1
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_WEBSOCKET_URL=ws://localhost:5000
VITE_STRIPE_PUBLIC_KEY=your-stripe-public-key
VITE_INSTAGRAM_APP_ID=your-instagram-app-id
VITE_TIKTOK_CLIENT_KEY=your-tiktok-client-key
```

## Package Dependencies

### Backend `package.json`
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "express-validator": "^7.0.1",
    "@prisma/client": "^5.7.0",
    "prisma": "^5.7.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "redis": "^4.6.11",
    "bull": "^4.11.5",
    "stripe": "^14.10.0",
    "@sendgrid/mail": "^8.1.0",
    "axios": "^1.6.2",
    "winston": "^3.11.0",
    "dotenv": "^16.3.1",
    "multer": "^1.4.5-lts.1",
    "socket.io": "^4.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  }
}
```

### Frontend `package.json`
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.0.4",
    "axios": "^1.6.2",
    "react-hook-form": "^7.48.2",
    "@headlessui/react": "^1.7.17",
    "@heroicons/react": "^2.0.18",
    "framer-motion": "^10.16.16",
    "recharts": "^2.10.3",
    "react-table": "^7.8.0",
    "socket.io-client": "^4.6.0",
    "react-hot-toast": "^2.4.1",
    "date-fns": "^3.0.6"
  },
  "devDependencies": {
    "vite": "^5.0.10",
    "@vitejs/plugin-react": "^4.2.1",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1"
  }
}
```

## Development Scripts

### Backend Scripts
```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "test": "jest",
    "migrate": "prisma migrate dev",
    "generate": "prisma generate",
    "seed": "node prisma/seed.js",
    "studio": "prisma studio"
  }
}
```

### Frontend Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext js,jsx",
    "format": "prettier --write src/**/*.{js,jsx,css}"
  }
}
```

## Docker Configuration

### `docker-compose.yml`
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: influencer_user
      POSTGRES_PASSWORD: influencer_pass
      POSTGRES_DB: influencer_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://influencer_user:influencer_pass@postgres:5432/influencer_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
  redis_data:
```

## Git Workflow

### Branch Structure
```
main              # Production-ready code
├── develop       # Development branch
├── feature/*     # Feature branches
├── bugfix/*      # Bug fixes
└── hotfix/*      # Emergency fixes
```

### Commit Convention
```
feat: Add campaign creation API
fix: Resolve payment processing issue
docs: Update API documentation
style: Format code with prettier
refactor: Restructure auth middleware
test: Add campaign service tests
chore: Update dependencies
```

## Testing Structure

### Backend Tests
```
tests/
├── unit/
│   ├── services/
│   ├── utils/
│   └── validators/
├── integration/
│   ├── auth.test.js
│   ├── campaigns.test.js
│   └── payments.test.js
└── e2e/
    └── userFlow.test.js
```

### Frontend Tests
```
src/__tests__/
├── components/
├── pages/
├── hooks/
└── utils/
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Redis configured
- [ ] Stripe webhooks configured
- [ ] Social media APIs configured
- [ ] SSL certificates installed
- [ ] Domain configured
- [ ] CDN setup (optional)
- [ ] Monitoring configured
- [ ] Backup strategy implemented

## Next Steps

1. Initialize backend with `npm init`
2. Set up Prisma with `npx prisma init`
3. Create React app with Vite
4. Configure Tailwind CSS
5. Set up Redux store
6. Implement authentication
7. Build campaign system
8. Integrate payment processing
9. Add social media APIs
10. Deploy to production