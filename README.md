# Full-Stack Application

A production-ready full-stack web application with Next.js frontend and Express backend.

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: Axios + TanStack Query
- **Authentication**: NextAuth.js
- **Forms**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Caching**: Redis
- **Authentication**: JWT + OTP via Resend
- **Payment**: Razorpay

### Infrastructure
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Database**: Neon (PostgreSQL)
- **File Storage**: Cloudinary
- **Monitoring**: Sentry
- **Analytics**: Google Analytics

## 📁 Project Structure

```
my-fullstack-app/
├── frontend/          # Next.js frontend application
├── backend/           # Express backend API
├── shared/            # Shared types and utilities
├── docs/              # Documentation
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- Docker (optional, for local PostgreSQL and Redis)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd my-fullstack-app
```

### Step 2: Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 3: Environment Variables

#### Backend (.env)
```bash
cd backend
cp .env.example .env
# Edit .env with your actual values
```

#### Frontend (.env.local)
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your actual values
```

### Step 4: Database Setup

#### Option A: Using Neon (Production-like)
1. Create a Neon account at https://neon.tech
2. Create a new project and database
3. Copy the connection string to `DATABASE_URL` in backend/.env

#### Option B: Using Docker (Local Development)
```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Use this connection string in backend/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fullstack_db?sslmode=disable"
REDIS_URL="redis://localhost:6379"
```

### Step 5: Run Prisma Migrations

```bash
cd backend
npx prisma generate
npx prisma db push
cd ..
```

### Step 6: Start Development Servers

```bash
# From root directory - runs both frontend and backend
npm run dev

# OR run separately:

# Terminal 1 - Frontend (http://localhost:3000)
cd frontend
npm run dev

# Terminal 2 - Backend (http://localhost:5000)
cd backend
npm run dev
```

## 🔧 Available Scripts

### Root Level
- `npm run dev` - Run both frontend and backend
- `npm run build` - Build both applications
- `npm run start` - Start both in production mode
- `npm run install:all` - Install all dependencies
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema to database
- `npm run prisma:studio` - Open Prisma Studio
- `npm run clean` - Clean all build artifacts and node_modules

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🔑 Environment Variables

See `.env.example` files in both `frontend/` and `backend/` directories for all required environment variables.

### Critical Variables to Configure:

#### Backend
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret for JWT tokens
- `RESEND_API_KEY` - For sending emails
- `RAZORPAY_KEY_ID` - Payment gateway
- `CLOUDINARY_*` - File upload configuration
- `SENTRY_DSN` - Error monitoring

#### Frontend
- `NEXTAUTH_SECRET` - NextAuth secret
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Razorpay public key
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN

## 📦 Database Schema

The Prisma schema includes:
- **User** - User accounts with authentication
- **Session** - User sessions (NextAuth)
- **Account** - OAuth accounts (NextAuth)
- **OTP** - Email verification codes
- **Payment** - Razorpay payment records

To modify the schema:
1. Edit `backend/prisma/schema.prisma`
2. Run `npx prisma generate`
3. Run `npx prisma db push` (dev) or `npx prisma migrate dev` (production)

## 🚀 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Backend (Render)
1. Create new Web Service on Render
2. Connect to your repository
3. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment variables
4. Add health check endpoint: `/health`
5. Enable auto-deploy on push

### Database (Neon)
1. Already set up in development
2. Use the same connection string for production
3. Run migrations before deploying backend

### Keep Backend Active on Render
The backend includes auto-ping functionality to prevent Render free tier from sleeping. This is configured in `server.ts` and uses the `RENDER_EXTERNAL_URL` environment variable.

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 API Documentation

API documentation is available at `/api/v1` when running the backend server.

Endpoints:
- `/api/v1/health` - Health check
- `/api/v1/auth/*` - Authentication
- `/api/v1/users/*` - User management
- `/api/v1/payment/*` - Payments
- `/api/v1/upload/*` - File uploads

## 🔒 Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- JWT authentication
- Password hashing with bcrypt
- Input validation
- XSS protection
- SQL injection prevention (Prisma)

## 🐛 Debugging

### View Database
```bash
cd backend
npx prisma studio
```

### View Redis Data
Access Redis Commander at http://localhost:8081 (if using Docker)

### View Logs
- Backend: Console logs in terminal
- Frontend: Browser console and Next.js terminal
- Production: Check Sentry dashboard

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Create a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Team

Isarion - Manan Bagga, Rakshit Vyas, Sanskar Sahu

## 🆘 Support

For issues and questions:
- Open an issue on GitHub
- Contact: isarionteam@gmail.com

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Razorpay Documentation](https://razorpay.com/docs/)

---

Built with ❤️ by Isarion