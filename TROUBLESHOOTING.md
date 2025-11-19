# Settings Not Persisting - Troubleshooting Guide

## The Problem
Settings (start date and location preference) are not persisting when you refresh the browser.

## What We Fixed
1. ✅ Replaced session-based unique users with a single shared user (`main-user`)
2. ✅ Removed local React state in Settings component - now reads directly from user data
3. ✅ Database updates ARE working (we can see in logs that settings are saved)

## What's Still Wrong
The settings appear to save but reset on page refresh.

## Root Cause Hypothesis
The issue is likely that **the production database and local database are different**. You might be:
- Testing locally (connects to Neon database)
- But the browser might be showing the production app from Render
- OR there's a caching issue in the browser/React Query

## Next Steps to Debug (When You're Ready)

### 1. Verify Which App You're Using
Open browser DevTools (F12) → Network tab → Refresh page → Look at the request to `/api/auth/user`
- If it goes to `localhost:3000` → you're on local
- If it goes to `mindful-frames...onrender.com` → you're on production

### 2. Check Local Database
Run: `npm run dev` (starts local server on port 3000)
Then visit: http://localhost:3000
Change settings, refresh, see if they stick.

### 3. Check Production Database
The production app needs database seeding:
1. Go to https://dashboard.render.com
2. Find "mindful-frames" service
3. Click "Shell" tab
4. Run: `npm run db:seed`

### 4. Clear Browser Cache
Sometimes React Query or browser cache causes issues:
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Or open in Incognito/Private window

### 5. Check React Query Cache
The query client has `staleTime: Infinity` which means it never refetches automatically.
This could cause the old cached data to persist.

## Quick Fix to Try
In `client/src/lib/queryClient.ts`, change line 48:
```typescript
staleTime: Infinity,  // Change this to: staleTime: 0,
```

This will make React Query always fetch fresh data from the server.

## Files That Matter
- `/server/routes.ts` - API endpoints (uses SHARED_USER_ID = "main-user")
- `/client/src/pages/Settings.tsx` - Settings UI (now reads from user.locationPreference)
- `/client/src/hooks/use-auth.tsx` - User data fetching
- `/client/src/lib/queryClient.ts` - React Query config (staleTime setting)
- `/.env.local` - Database connection (local only)

## Database Info
- Database: Neon PostgreSQL (serverless)
- Connection: In `.env.local` (DATABASE_URL)
- Single user ID: `main-user`
- Tables: users, pauses, activities, journal_entries, photos, user_progress, locations, photographers

## Contact Points
The system logs show updates ARE happening:
```
Updating settings for user: main-user
Updated user: {
  locationPreference: 'murrayhill',
  startDate: 2025-11-18T08:00:00.000Z,
  ...
}
```

So the backend IS working. The issue is frontend not displaying the saved values.
