# MindfulFrames

A 10-week mindfulness and photography journey combining meditation practices with creative photography exercises. Built as a full-stack web application with React, TypeScript, Express, and PostgreSQL.

## Overview

An experiential program integrating mindfulness practices with photography exercises to foster attentive, reflective, and conscious seeing. Features include:

- **10 Weekly "Pauses"**: Themed weeks combining mindfulness and photography
- **Daily Activities**: Meditation practices and photography assignments
- **Journaling**: Reflection prompts for each pause
- **Photo Gallery**: Upload and organize your journey photos
- **Progress Tracking**: Monitor completion across all pauses
- **Location-Based Content**: Curated locations for Portland and Murrayhill/Beaverton areas

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Object Storage**: Pluggable — local filesystem (dev) or any S3-compatible bucket such as Cloudflare R2 / AWS S3 (prod)
- **UI Components**: Radix UI, shadcn/ui
- **Deployment**: Render.com (free tier)

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sanzgiri/MindfulFrames.git
cd MindfulFrames
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
DATABASE_URL=your_postgresql_connection_string
PORT=3000
NODE_ENV=development
# Photo storage: defaults to the local filesystem in dev (no config needed).
# To use an S3-compatible bucket locally, see "Photo Storage" below.
```

4. Push database schema:
```bash
npm run db:push
```

5. Seed the database (10 pauses + activities):
```bash
npm run db:seed
```

6. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Deployment

### Prerequisites: Neon PostgreSQL Database Setup

1. **Create Neon Account**: Go to [neon.tech](https://neon.tech) and sign up (free tier: 0.5 GB storage)

2. **Create a New Project**:
   - Click "New Project"
   - Name it (e.g., "mindfulframes-db")
   - Choose a region close to your users
   - Select PostgreSQL version (latest recommended)

3. **Get Connection String**:
   - Go to project Dashboard
   - Copy the connection string (format: `postgresql://username:password@host/database?sslmode=require`)
   - Save this for later - you'll need it for both local dev and production

4. **Important**: Keep your connection string secure! Never commit it to git.

### Render Deployment

This app is deployed on Render's free tier, which provides:
- Automatic deployments from GitHub
- Free hosting (spins down after 15min inactivity)
- HTTPS by default
- Easy environment variable management

#### Step 1: Prepare Repository

1. **Ensure code is on GitHub**:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

2. **Verify render.yaml exists** (already included in repo):
   - Defines service configuration
   - Sets build and start commands
   - Specifies Node environment

#### Step 2: Create Render Web Service

1. **Go to [dashboard.render.com](https://dashboard.render.com)**
   - Sign up/login with GitHub

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your `MindfulFrames` GitHub repository
   - Render will auto-detect the `render.yaml` config

3. **Configure Service** (if not auto-detected):
   - **Name**: `mindful-frames` (or your preferred name)
   - **Region**: Oregon (or closest to users)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

#### Step 3: Set Environment Variables

In Render Dashboard → Your Service → Environment:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | Your Neon connection string | From Neon dashboard |
| `NODE_ENV` | `production` | Enables production optimizations |
| `PORT` | `3000` | Server port (optional, Render sets this) |
| `STORAGE_DRIVER` | `s3` | Use an S3-compatible bucket in prod (see below) |
| `S3_BUCKET` | Your bucket name | e.g. `mindfulframes` |
| `S3_ENDPOINT` | Bucket endpoint | R2: `https://<account-id>.r2.cloudflarestorage.com` |
| `S3_ACCESS_KEY_ID` | Access key | From R2/S3 credentials |
| `S3_SECRET_ACCESS_KEY` | Secret key | From R2/S3 credentials |
| `S3_REGION` | `auto` | `auto` for R2; the AWS region for S3 |

> **Why S3 and not local disk?** Render's free tier has an **ephemeral** filesystem —
> uploaded photos would be wiped on every redeploy/restart. An S3-compatible
> bucket keeps them durable. Cloudflare R2 is recommended: 10 GB storage free
> with **zero egress fees**.

#### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repo
   - Install dependencies
   - Build the app
   - Push database schema
   - Start the server

3. **First deployment takes 2-3 minutes**

4. Your app will be live at: `https://mindful-frames.onrender.com`

#### Step 5: Seed Production Database

After first successful deployment:

1. Go to Render Dashboard → Your Service → **Shell** tab
2. Run the seed command:
```bash
npm run db:seed
```

This populates the database with:
- 10 pauses (weekly themes)
- Activities for each pause
- Location data
- Photographer information

#### Post-Deployment

**Automatic Updates**: Render auto-deploys when you push to `main` branch:
```bash
git add .
git commit -m "Update features"
git push origin main
```

**Monitor Deployments**: Check build logs in Render Dashboard → Logs tab

**Free Tier Limitations**:
- Service spins down after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- 750 hours/month free (sufficient for personal projects)

### Alternative Deployment Options

While this app is optimized for Render, you can also deploy to:
- **Railway**: Similar to Render, also has free tier
- **Fly.io**: Good for global distribution
- **DigitalOcean App Platform**: $5/month minimum
- **Self-hosted**: VPS with Node.js and PostgreSQL

## Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type check with TypeScript
- `npm run db:push` - Push database schema to PostgreSQL
- `npm run db:seed` - Seed database with 10 pauses and activities

## Development Notes

### Photo Storage

Photo storage is **pluggable** via a small driver interface (`server/storageProvider.ts`),
so the app is not tied to any one host. The driver is chosen by env:

- **`local`** (default in dev): writes files under `.data/uploads/`. Zero config.
- **`s3`**: any S3-compatible bucket (Cloudflare R2, AWS S3, Backblaze B2, MinIO).

Uploads are streamed **through the app server** (the browser PUTs to our own
origin), so **no bucket CORS configuration is required**.

#### Setting up Cloudflare R2 (recommended for Render)

1. In the Cloudflare dashboard, go to **R2** → **Create bucket** (e.g. `mindfulframes`).
2. **R2** → **Manage R2 API Tokens** → **Create API Token** (Object Read & Write).
   Copy the **Access Key ID**, **Secret Access Key**, and your **endpoint**
   (`https://<account-id>.r2.cloudflarestorage.com`).
3. On Render, set the env vars from the table above
   (`STORAGE_DRIVER=s3`, `S3_BUCKET`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`,
   `S3_SECRET_ACCESS_KEY`, `S3_REGION=auto`).
4. Redeploy. Photos now persist across restarts.

To test the `s3` driver locally, set the same vars in `.env.local`.

### Authentication
- App uses a single shared user (`main-user`) — no login required (personal use).
- All sessions share the same data and settings.

### Database Schema
- **users**: User profile and preferences
- **pauses**: 10 weekly themes
- **activities**: Daily practices for each pause
- **journal_entries**: User reflections
- **photos**: Uploaded images with metadata
- **user_progress**: Activity completion tracking
- **locations**: Photography location recommendations
- **photographers**: Recommended photographers to study

### Known Issues & Fixes

This project was originally scaffolded on Replit. It has since been **decoupled
from Replit-specific infrastructure** so it runs on any host:

1. **Object storage** no longer depends on the Replit storage sidecar; it uses
   a pluggable local/S3 driver (see "Photo Storage").
2. **Authentication** scaffolding (Replit OIDC/Passport/sessions) was removed in
   favor of the single shared user, so no `SESSION_SECRET` is needed.
3. **Deployment** is standardized on Render (`render.yaml`); the unused
   Vercel/Replit configs were removed.
4. **Caching**: `/api/auth/user` sends `no-store` and React Query uses
   `staleTime: 0` so settings changes are reflected immediately.

### Architecture
- **Frontend**: React SPA with Vite dev server (HMR enabled)
- **Backend**: Express API server with TypeScript
- **Database**: PostgreSQL via Drizzle ORM
- **Build**: Vite bundles frontend, tsc compiles backend
- **Production**: Single Node.js process serves both API and static files

## Project Structure

```
MindfulFrames/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── hooks/       # Custom React hooks (auth, etc.)
│   │   ├── lib/         # Utilities (queryClient, etc.)
│   │   └── pages/       # Route pages
├── server/              # Express backend
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # Database operations
│   ├── db.ts            # Drizzle connection
│   └── seed.ts          # Database seeding script
├── db/
│   └── schema.ts        # Database schema definitions
├── render.yaml          # Render deployment config
└── .env.local           # Local environment variables (not committed)
```

## Contributing

This is a personal project, but suggestions and improvements are welcome! Please open an issue or submit a pull request.

## License

MIT
