# Influencer Management Web App - Development Plan

## Application Overview
A web platform for managing influencer social media posts through link submissions with quality control and reward system.

## User Roles

### 1. Influencer
- Register/Login with email & password
- Submit social media post links (Instagram, TikTok, YouTube, etc.)
- Track submission status
- View earned rewards

### 2. Admin
- Review submitted social media posts via links
- Approve/Reject submissions
- Assign reward values
- Manage influencer accounts

## Pages & Routes

### Public Pages
- **Landing Page** (`/`) - App introduction
- **Login** (`/login`) - JWT authentication
- **Register** (`/register`) - New influencer signup

### Influencer Pages
- **Dashboard** (`/influencer/dashboard`) - Overview of submissions & rewards
- **Submit Post** (`/influencer/submit`) - Social media link submission form
- **My Submissions** (`/influencer/submissions`) - List with status tracking
- **Rewards** (`/influencer/rewards`) - Points/money earned

### Admin Pages
- **Admin Dashboard** (`/admin/dashboard`) - Overview stats
- **Content Review** (`/admin/review`) - Approve/reject submissions
- **Manage Influencers** (`/admin/influencers`) - User management
- **Rewards Management** (`/admin/rewards`) - Set reward values

## Core Features

### 1. Authentication System
- **JWT-based auth** with access/refresh tokens
- **Password hashing** using bcrypt
- **Protected routes** for role-based access
- **Session management** with token expiry

### 2. Post Submission System
- **Link validation** (supported platforms: Instagram, TikTok, YouTube, Twitter/X)
- **Platform detection** from URL pattern
- **Post metadata** storage (title, description, submission date)
- **Submission form** with link input and optional description

### 3. Review Workflow
- **Status tracking**: Pending → Approved/Rejected
- **Admin comments** on rejections
- **Bulk actions** for efficiency
- **Direct link** to view post on original platform

### 4. Reward System
- **Points allocation** per approved content
- **Monetary value** conversion
- **Transaction history** tracking
- **Withdrawal threshold** system

### 5. Dashboard Analytics
- **Submission stats** (total, approved, rejected)
- **Earnings overview** (current balance, total earned)
- **Performance metrics** (approval rate)

## Database Schema

### Tables
1. **users** - id, email, password, role, created_at
2. **submissions** - id, user_id, post_url, platform, title, description, status, created_at
3. **rewards** - id, submission_id, user_id, points, money_value, created_at
4. **transactions** - id, user_id, amount, type, status, created_at

## Tech Implementation

### Backend (Node.js + Express)
- **API Structure**: RESTful endpoints
- **Middleware**: Auth, link validation, error handling
- **ORM**: Prisma for PostgreSQL
- **Validation**: Express-validator for URLs and platform detection

### Frontend (React + Tailwind)
- **State Management**: Context API/Redux Toolkit
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **UI Components**: Custom with Tailwind CSS

### External Integration
- **Link validation** for social media platforms
- **Platform detection** from URL patterns
- **Optional**: Social media APIs for engagement metrics

## Development Phases

### Phase 1: Foundation (Days 1-2)
- Project setup & dependencies
- Database schema & migrations
- Basic authentication

### Phase 2: Core Features (Days 3-5)
- Post link submission system
- Social media link validation
- Admin review panel

### Phase 3: Rewards & Polish (Days 6-7)
- Reward calculation system
- Dashboard analytics
- UI refinements & testing

## Security Considerations
- URL validation & sanitization
- SQL injection prevention
- XSS protection
- Rate limiting
- Link verification for supported platforms

## Ready to Start?
This plan provides a clear roadmap for building the Influencer Management Web App with all requested features.