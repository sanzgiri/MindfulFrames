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

### Vercel Deployment

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `SESSION_SECRET`
5. Deploy!

For the database, use [Neon](https://neon.tech) or [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (both have free tiers).

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type check
- `npm run db:push` - Push database schema

## License

MIT
