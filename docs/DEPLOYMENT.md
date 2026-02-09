# Deployment Guide

Complete guide for deploying the full-stack application to production.

## 🎯 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                    Vercel (Next.js)                          │
│                  https://yourdomain.com                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ API Calls
                         │
┌────────────────────────▼────────────────────────────────────┐
│                         Backend                              │
│                   Render (Express)                           │
│              https://api.yourdomain.com                      │
└────────┬────────────────┬───────────────┬────────────────────┘
         │                │               │
         │                │               │
    ┌────▼────┐     ┌────▼────┐    ┌────▼────┐
    │  Neon   │     │  Redis  │    │Cloudinary│
    │Database │     │  Cache  │    │  Files  │
    └─────────┘     └─────────┘    └─────────┘
```

## 📋 Pre-Deployment Checklist

### Code Preparation
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Environment variables documented
- [ ] API documentation updated
- [ ] Database migrations ready
- [ ] No console.logs in production code
- [ ] Error handling implemented
- [ ] Loading states added

### Security
- [ ] All secrets in environment variables
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma)
- [ ] XSS protection enabled

### Services Setup
- [ ] Neon database created
- [ ] Redis instance ready
- [ ] Cloudinary account configured
- [ ] Razorpay production keys obtained
- [ ] Resend API key ready
- [ ] Sentry projects created
- [ ] Google Analytics configured

---

## 1️⃣ Database Deployment (Neon)

### Step 1: Create Neon Project

1. Go to https://neon.tech
2. Sign up or log in
3. Click "Create Project"
4. Choose:
   - Region: Closest to your users
   - PostgreSQL version: 15 or latest
   - Project name: Your project name

### Step 2: Get Connection String

1. After project creation, copy the connection string
2. It looks like:
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

### Step 3: Run Migrations

```bash
# Set DATABASE_URL in backend/.env
DATABASE_URL="your-neon-connection-string"

# Generate Prisma Client
cd backend
npx prisma generate

# Push schema to database
npx prisma db push

# Or create migration for production
npx prisma migrate deploy
```

### Step 4: Verify Database

```bash
# Open Prisma Studio to verify
npx prisma studio
```

---

## 2️⃣ Backend Deployment (Render)

### Step 1: Prepare Backend for Render

Ensure `backend/package.json` has:
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

### Step 2: Create Render Web Service

1. Go to https://render.com
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:

**Basic Settings:**
- Name: `your-app-backend`
- Region: Same as Neon database
- Branch: `main`
- Root Directory: `backend`
- Runtime: `Node`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

**Environment:**
- Node Version: `18.x` or higher

### Step 3: Add Environment Variables

Add all variables from `backend/.env.example`:

```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=your-neon-connection-string
REDIS_URL=your-redis-connection-string
JWT_SECRET=your-super-secret-key
FRONTEND_URL=https://yourdomain.com
RESEND_API_KEY=your-resend-key
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
SENTRY_DSN=your-sentry-dsn
RENDER_EXTERNAL_URL=https://your-backend.onrender.com
```

### Step 4: Configure Health Check

- Health Check Path: `/health`
- Health Check Timeout: 30 seconds

### Step 5: Deploy

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Note your backend URL: `https://your-app.onrender.com`

### Step 6: Prevent Sleep (Free Tier)

For Render free tier, add external monitoring:

**Option A: Using UptimeRobot**
1. Go to https://uptimerobot.com
2. Create monitor:
   - Type: HTTP(S)
   - URL: `https://your-backend.onrender.com/health`
   - Interval: 5 minutes

**Option B: Using Cron-Job.org**
1. Go to https://cron-job.org
2. Create job:
   - URL: `https://your-backend.onrender.com/health`
   - Schedule: Every 14 minutes

The backend already has internal keep-alive (see `server.ts`).

---

## 3️⃣ Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

Ensure `frontend/next.config.js` has production settings:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
}

module.exports = nextConfig
```

### Step 2: Connect to Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Configure:

**Framework Preset:** Next.js
**Root Directory:** `frontend`
**Build Command:** `npm run build` (default)
**Output Directory:** `.next` (default)

### Step 3: Add Environment Variables

```bash
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-nextauth-secret
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
DATABASE_URL=your-neon-connection-string
RESEND_API_KEY=your-resend-key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxx
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-preset
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### Step 4: Deploy

1. Click "Deploy"
2. Wait for deployment (2-5 minutes)
3. Your app is live!

### Step 5: Add Custom Domain (Optional)

1. Go to project settings → Domains
2. Add your domain: `yourdomain.com`
3. Configure DNS:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (5-60 minutes)

---

## 4️⃣ Redis Setup

### Option 1: Upstash (Recommended)

1. Go to https://upstash.com
2. Create database:
   - Name: your-app-redis
   - Region: Same as backend
   - Type: Regional
3. Copy connection string:
   ```
   redis://default:password@region.upstash.io:6379
   ```
4. Add to backend environment variables

### Option 2: Redis Cloud

1. Go to https://redis.com/cloud
2. Create subscription (Free tier available)
3. Create database
4. Copy connection string
5. Add to backend environment variables

---

## 5️⃣ File Storage (Cloudinary)

### Setup Cloudinary

1. Go to https://cloudinary.com
2. Sign up for free account
3. Go to Dashboard
4. Copy:
   - Cloud Name
   - API Key
   - API Secret

### Create Upload Preset

1. Go to Settings → Upload
2. Click "Add upload preset"
3. Configure:
   - Name: `your-app-uploads`
   - Signing Mode: `Unsigned`
   - Folder: `production`

### Add to Environment Variables

**Backend:**
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=production
```

**Frontend:**
```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-app-uploads
```

---

## 6️⃣ Monitoring (Sentry)

### Setup Sentry

1. Go to https://sentry.io
2. Create organization
3. Create two projects:
   - `your-app-frontend` (Next.js)
   - `your-app-backend` (Node.js)

### Configure Frontend

```bash
# Frontend .env.local
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-org
SENTRY_PROJECT=your-app-frontend
```

### Configure Backend

```bash
# Backend .env
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ENVIRONMENT=production
```

---

## 7️⃣ Analytics (Google Analytics)

### Setup GA4

1. Go to https://analytics.google.com
2. Create property
3. Get Measurement ID (G-XXXXXXXXXX)

### Add to Frontend

```bash
# Frontend .env.local
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Implement Tracking

Already configured in `src/config/analytics.ts`

---

## 8️⃣ Payment Gateway (Razorpay)

### Get Production Keys

1. Go to https://dashboard.razorpay.com
2. Complete KYC verification
3. Go to Settings → API Keys
4. Generate production keys

### Add to Environment

**Backend:**
```bash
RAZORPAY_KEY_ID=rzp_live_xxxx
RAZORPAY_KEY_SECRET=your-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
```

**Frontend:**
```bash
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxx
```

### Setup Webhook

1. Go to Razorpay Dashboard → Webhooks
2. Create webhook:
   - URL: `https://your-backend.onrender.com/api/v1/payment/webhook`
   - Events: Select payment events
   - Secret: Copy and add to backend env

---

## 🔍 Post-Deployment Verification

### 1. Health Checks

```bash
# Backend health
curl https://your-backend.onrender.com/health

# Should return:
{
  "status": "ok",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### 2. Frontend Checks

- [ ] Homepage loads
- [ ] Login/Register works
- [ ] OTP emails received
- [ ] File uploads work
- [ ] Payments process correctly

### 3. Monitoring Checks

- [ ] Sentry capturing errors
- [ ] Google Analytics tracking
- [ ] Backend stays active (no sleep)

---

## 🚨 Troubleshooting

### Backend Won't Start on Render

1. Check build logs
2. Verify `package.json` scripts
3. Ensure TypeScript compiles: `npm run build`
4. Check environment variables

### Database Connection Fails

1. Verify `DATABASE_URL` format
2. Check Neon IP allowlist (should be 0.0.0.0/0)
3. Test connection locally first

### Frontend Can't Connect to Backend

1. Verify `NEXT_PUBLIC_API_URL`
2. Check CORS settings in backend
3. Check network tab in browser DevTools

### Redis Connection Issues

1. Verify connection string format
2. Check Redis instance is running
3. Test with Redis CLI

---

## 📊 Monitoring Production

### Key Metrics to Watch

1. **Uptime**: Backend should be 99%+ available
2. **Response Time**: API calls < 500ms
3. **Error Rate**: < 1% of requests
4. **Database Connections**: Monitor Neon dashboard

### Tools

- **Sentry**: Error tracking
- **Google Analytics**: User behavior
- **Render Dashboard**: Resource usage
- **Neon Dashboard**: Database metrics

---

## 🔄 Continuous Deployment

### Auto-Deploy on Push

**Vercel:**
- Automatically deploys on push to `main`
- Preview deployments for PRs

**Render:**
1. Go to Settings → Auto-Deploy
2. Enable "Auto-Deploy"
3. Select branch: `main`

### Deployment Pipeline

```
1. Developer pushes to GitHub
   ↓
2. GitHub Actions run tests (optional)
   ↓
3. Vercel deploys frontend
   ↓
4. Render deploys backend
   ↓
5. Health checks verify deployment
   ↓
6. Sentry monitors for errors
```

---

## 📝 Deployment Checklist Summary

- [ ] Neon database created and migrated
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Redis configured
- [ ] Cloudinary setup complete
- [ ] Sentry monitoring active
- [ ] Google Analytics tracking
- [ ] Razorpay production keys configured
- [ ] Custom domain configured (optional)
- [ ] SSL certificates active
- [ ] All health checks passing
- [ ] Team notified of deployment

---

## 🎉 You're Live!

Your application is now running in production!

**Next Steps:**
- Monitor Sentry for errors
- Check Google Analytics for traffic
- Set up alerts for downtime
- Plan regular backups
- Document any issues

Happy deploying! 🚀