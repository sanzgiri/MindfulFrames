# MindfulFrames

A full-stack web application built with React, TypeScript, Express, and PostgreSQL.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Radix UI, shadcn/ui
- **Authentication**: Passport.js

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
Create a `.env` file in the root directory:
```env
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret
NODE_ENV=development
```

4. Push database schema:
```bash
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Deployment

### Render Deployment (Recommended)

This app is designed for full-stack deployment and works best on Render.

1. **Push your code to GitHub** (already done!)

2. **Go to [Render](https://render.com)** and sign up/login with GitHub

3. **Create a new Web Service**:
   - Click "New +" → "Web Service"
   - Connect your `MindfulFrames` repository
   
4. **Configure the service**:
   - **Name**: `mindful-frames`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   
5. **Add Environment Variables**:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `SESSION_SECRET`: A secure random string (use `openssl rand -base64 32`)
   - `NODE_ENV`: `production`
   
6. Click **"Create Web Service"**

Your app will be live at `https://mindful-frames.onrender.com` (or your custom URL).

**Note**: Free tier spins down after 15 minutes of inactivity, so the first request after inactivity may take 30-60 seconds.

### Database Setup

Use [Neon](https://neon.tech) for PostgreSQL (0.5 GB free tier):
1. Create a Neon account
2. Create a new project
3. Copy the connection string
4. Add it as `DATABASE_URL` in Render

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type check
- `npm run db:push` - Push database schema

## License

MIT
