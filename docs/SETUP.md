# Full-Stack Application Setup Commands

## Prerequisites
Ensure you have installed:
- Node.js (v18 or higher)
- npm or yarn
- Git
- PostgreSQL client (optional, for local testing)
- Redis (optional, for local testing)

---

## Step 1: Create Project Root Directory

```bash
mkdir my-fullstack-app
cd my-fullstack-app
git init
```

---

## Step 2: Frontend Setup (Next.js)

```bash
# Create Next.js app with TypeScript
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd frontend

# Install dependencies
npm install next-auth@latest
npm install @prisma/client
npm install axios
npm install react-hot-toast
npm install @tanstack/react-query
npm install zustand
npm install date-fns
npm install @sentry/nextjs
npm install cloudinary
npm install resend

# Install dev dependencies
npm install -D @types/node
npm install -D prisma

# Initialize Sentry
npx @sentry/wizard@latest -i nextjs

cd ..
```

---

## Step 3: Backend Setup (Node.js + Express)

```bash
# Create backend directory
mkdir backend
cd backend

# Initialize Node.js project
npm init -y

# Install production dependencies
npm install express
npm install @prisma/client
npm install dotenv
npm install cors
npm install helmet
npm install express-rate-limit
npm install express-validator
npm install bcryptjs
npm install jsonwebtoken
npm install cookie-parser
npm install morgan
npm install redis
npm install ioredis
npm install cloudinary
npm install resend
npm install razorpay
npm install @sentry/node
npm install compression

# Install dev dependencies
npm install -D typescript
npm install -D @types/node
npm install -D @types/express
npm install -D @types/cors
npm install -D @types/bcryptjs
npm install -D @types/jsonwebtoken
npm install -D @types/cookie-parser
npm install -D @types/morgan
npm install -D ts-node
npm install -D nodemon
npm install -D prisma

# Initialize TypeScript
npx tsc --init

# Initialize Prisma
npx prisma init

cd ..
```

---

## Step 4: Database Setup (Prisma + PostgreSQL)

```bash
cd backend

# Prisma will create a prisma folder with schema.prisma
# After configuring your Neon database URL in .env, run:
# npx prisma generate
# npx prisma db push

cd ..
```

---

## Step 5: Create Root-Level Files

```bash
# Create .gitignore
touch .gitignore

# Create README
touch README.md

# Create docker-compose (optional for local dev)
touch docker-compose.yml

# Create root package.json for monorepo scripts
npm init -y
```

---

## Step 6: Git Setup

```bash
git add .
git commit -m "Initial project setup with Next.js frontend and Express backend"

# Add remote repository (replace with your repo URL)
# git remote add origin https://github.com/yourusername/your-repo.git
# git branch -M main
# git push -u origin main
```

---

## Step 7: Environment Variables Setup

```bash
# Create .env files for both frontend and backend
touch frontend/.env.local
touch backend/.env

# Add .env files to .gitignore
echo "*.env*" >> .gitignore
echo "!*.env.example" >> .gitignore

# Create .env.example templates
touch frontend/.env.example
touch backend/.env.example
```

---

## Step 8: Install Concurrent Runner (Optional - for monorepo)

```bash
# In root directory
npm install -D concurrently

# This allows running frontend and backend simultaneously
```

---

## Team Onboarding Commands

Once your team clones the repository:

```bash
# Clone the repository
git clone <repository-url>
cd my-fullstack-app

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install

# Setup environment variables
# Copy .env.example to .env and fill in values
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Generate Prisma client
cd backend
npx prisma generate
cd ..

# Run database migrations (after configuring Neon URL)
cd backend
npx prisma db push
cd ..
```

---

## Running the Application

### Development Mode

```bash
# From root directory - run both frontend and backend
npm run dev

# OR run separately:

# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev
```

### Production Build

```bash
# Frontend
cd frontend
npm run build
npm start

# Backend
cd backend
npm run build
npm start
```

---

## Useful Commands Reference

### Prisma Commands
```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Push schema to database (no migration)
npx prisma db push

# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset
```

### Git Commands
```bash
# Create new branch
git checkout -b feature/your-feature-name

# Commit changes
git add .
git commit -m "Your commit message"

# Push to remote
git push origin feature/your-feature-name
```

### Docker Commands (if using docker-compose)
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

---

## Deployment Checklist

### Frontend (Vercel)
- [ ] Push code to GitHub
- [ ] Connect repository to Vercel
- [ ] Configure environment variables in Vercel dashboard
- [ ] Deploy

### Backend (Render)
- [ ] Push code to GitHub
- [ ] Create new Web Service on Render
- [ ] Configure environment variables
- [ ] Set build command: `npm install && npm run build`
- [ ] Set start command: `npm start`
- [ ] Configure health check endpoint
- [ ] Add cron job or external monitor to prevent sleep

### Database (Neon)
- [ ] Create Neon project
- [ ] Copy connection string
- [ ] Add to backend .env as DATABASE_URL
- [ ] Run migrations: `npx prisma db push`

---

## Notes
- Replace `my-fullstack-app` with your actual project name
- Update all placeholder URLs and tokens in .env files
- Ensure all team members have access to shared credentials (use a password manager)
- Set up CI/CD pipelines after initial setup
- Configure Sentry projects for both frontend and backend