# Admin Dashboard - Next.js

A modern, full-featured admin dashboard built with Next.js 15, Prisma, and TypeScript. This application provides comprehensive team management, user administration, and audit logging capabilities.

## 🚀 Features

### Core Functionality
- **User Management**: Create, view, and manage users with role-based access control
- **Team Management**: Create teams, invite members, and manage team roles
- **Role-Based Access Control**: Four user roles (SUPER_ADMIN, ADMIN, MANAGER, USER)
- **Team Invitations**: Send and manage team invitations
- **Join Requests**: Users can request to join teams
- **Audit Logging**: Comprehensive activity tracking for all actions
- **Real-time Notifications**: Notification center for team activities

### Technical Features
- **Modern UI**: Built with Tailwind CSS and Radix UI components
- **Type Safety**: Full TypeScript support
- **Database**: SQLite with Prisma ORM
- **Authentication**: Session-based authentication with bcrypt
- **Form Validation**: Zod schema validation with React Hook Form
- **State Management**: React Query for server state management

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + Custom components
- **Forms**: React Hook Form + Zod validation
- **State Management**: TanStack Query
- **Authentication**: Session-based with bcrypt
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ 
- pnpm (recommended) or npm
- Git

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd admin-dashboard-next
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup

Initialize the database and run migrations:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with initial data
pnpm db:seed
```

### 5. Start Development Server

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

```
admin-dashboard-next/
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── api/           # API routes
│   │   ├── dashboard/     # Dashboard page
│   │   ├── login/         # Login page
│   │   └── signup/        # Signup page
│   ├── components/        # React components
│   │   └── ui/           # Reusable UI components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   └── services/         # API service functions
└── package.json
```

## 🔐 Authentication & Authorization

### User Roles
- **SUPER_ADMIN**: Full system access, can manage all teams and users
- **ADMIN**: Can manage team members, view audit logs, create users
- **MANAGER**: Can view team members and manage team requests
- **USER**: Basic access to view team information

### Session Management
- Session-based authentication using cookies
- Automatic session expiration
- Secure password hashing with bcrypt

## 🗄️ Database Schema

### Core Models
- **User**: User accounts with roles and team associations
- **Team**: Team information and management
- **TeamRole**: Custom roles within teams
- **TeamInvite**: Team invitation system
- **TeamRequest**: Join request system
- **Session**: User session management
- **AuditLog**: Comprehensive activity logging

## 🎨 UI Components

The application uses a custom component library built on top of Radix UI primitives:

- **Button**: Various button styles and variants
- **Card**: Content containers with headers
- **Dialog**: Modal dialogs and popovers
- **Form**: Form components with validation
- **Table**: Data display tables
- **Badge**: Status and role indicators

## 📊 Key Features Explained

### Dashboard
- **Statistics Cards**: Display team member count and key metrics
- **Quick Actions**: User management and audit log access
- **Team Information**: Current team details and user role
- **Pending Requests**: Manage team join requests
- **Created Teams**: View teams created by the user

### User Management
- **Add Users**: Create new team members (Admin+ only)
- **User List**: View all team members
- **Role Management**: Assign and manage user roles
- **User Status**: Active/inactive user management

### Team Features
- **Team Creation**: Create new teams
- **Invitation System**: Send and manage team invitations
- **Join Requests**: Handle user requests to join teams
- **Team Roles**: Custom role system within teams

### Audit System
- **Activity Logging**: Track all user actions
- **Audit Viewer**: View and filter audit logs (Admin+ only)
- **Metadata Storage**: Store additional context for actions

## 🚀 Deployment

### Production Build

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"
```

## 🧪 Development

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm db:seed      # Seed database with sample data
```

### Database Commands

```bash
npx prisma generate    # Generate Prisma client
npx prisma migrate dev # Run migrations
npx prisma studio     # Open Prisma Studio
npx prisma db push    # Push schema changes
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing issues in the repository
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

## 🔄 Updates

Stay updated with the latest changes by:

- Following the repository
- Checking the releases page
- Reading the changelog

---

Built with ❤️ using Next.js, Prisma, and TypeScript
