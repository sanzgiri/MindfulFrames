# Settings Not Persisting — RESOLVED

> **Status: ✅ Resolved.** This document is kept for historical context only.
> The settings-persistence issue described below has been fixed. If settings
> ever stop persisting again, the debugging steps further down are still useful.

## What the issue was
Settings (start date and location preference) appeared to save but reset on
page refresh.

## How it was fixed
1. ✅ Single shared user (`main-user`) instead of session-based unique users.
2. ✅ The Settings component reads directly from user data (no stale local state).
3. ✅ React Query `staleTime` is `0` (always refetches fresh) — see
   `client/src/lib/queryClient.ts`. (An earlier version used `staleTime: Infinity`,
   which caused the stale-cache symptom.)
4. ✅ `/api/auth/user` sends `Cache-Control: no-store` and the client fetches
   with `cache: "no-store"`.

So both the backend write **and** the frontend read are now consistent.

---

## If it regresses: debugging steps

### 1. Verify which app you're using
DevTools (F12) → Network → refresh → inspect the `/api/auth/user` request:
- `localhost:3000` → local
- `mindful-frames...onrender.com` → production

A very common cause of "it didn't save" is editing on **local** but viewing
**production** (or vice versa) — they use different databases.

### 2. Check the local database
```bash
npm run dev          # local server on :3000
# visit http://localhost:3000, change settings, refresh
```

### 3. Check / seed the production database
Render Dashboard → service → **Shell**:
```bash
npm run db:seed
```

### 4. Clear browser cache
Hard refresh (Cmd/Ctrl+Shift+R) or use a private window.

## Files that matter
- `server/routes.ts` — API endpoints (uses `SHARED_USER_ID = "main-user"`)
- `client/src/pages/Settings.tsx` — Settings UI (reads `user.locationPreference`)
- `client/src/hooks/use-auth.tsx` — user data fetching
- `client/src/lib/queryClient.ts` — React Query config (`staleTime: 0`)
- `.env.local` — database connection (local only)
