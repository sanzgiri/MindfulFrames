# Photography & Mindfulness Course Application

## Overview

This is a 10-week experiential learning platform that combines mindfulness practices with photography exercises. The application guides users through structured "pauses" (weekly modules) featuring meditation exercises, photography projects, journaling prompts, location suggestions, and curated Spotify playlists. The course is location-aware, offering both Portland-specific and Murrayhill/Beaverton-specific versions of activities and locations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, built using Vite as the build tool and development server.

**UI Component System**: Radix UI primitives with shadcn/ui styling conventions, following the Apple Human Interface Guidelines design philosophy. The design emphasizes content-first presentation with clean, distraction-free interfaces optimized for photography content and contemplative experiences.

**Styling**: Tailwind CSS with custom design tokens for spacing, typography, and color. The theme system supports both light and dark modes with HSL-based color definitions for flexible theming.

**State Management**: TanStack Query (React Query) for server state management, providing automatic caching, background refetching, and optimistic updates. Custom hooks encapsulate data fetching logic for different entities (photos, journal entries, user progress, authentication).

**Routing**: Wouter for lightweight client-side routing with five main routes: Welcome/landing page, Dashboard (home), Pause Detail pages, Gallery, and Settings.

**Key Design Patterns**:
- Component composition with reusable UI primitives
- Custom hooks for data access (useAuth, usePhotos, useJournal, useProgress)
- Context-based authentication state
- Mobile-first responsive design with breakpoint-aware layouts

### Backend Architecture

**Runtime**: Node.js with Express.js web framework using ES modules.

**API Structure**: RESTful endpoints organized by resource type (auth, user, pauses, activities, photos, journal, progress). All API routes are prefixed with `/api/` and protected with authentication middleware where appropriate.

**Authentication**: OpenID Connect integration with Replit Auth using Passport.js strategy. Session management uses PostgreSQL-backed session storage (connect-pg-simple) with 7-day session TTL. Authentication state is handled through HTTP-only cookies with environment-aware secure settings.

**Database Layer**: Drizzle ORM with Neon serverless PostgreSQL connection pooling. The storage abstraction pattern (IStorage interface) provides a clean separation between business logic and data access.

**File Storage**: Pluggable object storage (`server/storageProvider.ts`) with a local-filesystem driver for development and an S3-compatible driver (Cloudflare R2 / AWS S3 / Backblaze B2 / MinIO) for production. Uploads stream through the app server, so no bucket CORS config is required. *(Originally the Replit Object Storage sidecar — now removed.)*

**Request Lifecycle**:
1. Session middleware validates authentication
2. JSON body parsing with raw body preservation for webhooks
3. Route handlers with typed request/response
4. Structured error handling with appropriate HTTP status codes
5. Request logging for API endpoints

### Data Storage Solutions

**Primary Database**: PostgreSQL (via Neon serverless) with connection pooling for concurrent request handling.

**Schema Design**:
- **Users**: Authentication data, profile information, course preferences (start date, location preference)
- **Course Content**: Pauses (weekly modules), Activities (tasks within pauses), Locations (suggested photography spots), Photographers (reference artists)
- **User Progress**: Many-to-many relationship tracking activity completion
- **User-Generated Content**: Journal entries and photos linked to users and pauses

**Session Storage**: PostgreSQL table managed by connect-pg-simple for production-ready session persistence.

**Object Storage**: Local filesystem (dev) or any S3-compatible bucket (prod), selected via the `STORAGE_DRIVER` env var.

**Migrations**: Drizzle Kit manages schema migrations with files stored in `/migrations` directory.

### Authentication and Authorization

> **⚠️ Current state (updated):** Authentication has been **removed**. The app
> now runs **single-user**: every request uses a shared user id (`main-user`)
> defined in `server/routes.ts`, and the client always treats itself as
> authenticated. There is no login, no Passport/OpenID, and no session store.
> The `sessions` table remains in the schema only to avoid a destructive
> migration and is unused. The description below documents the *original*
> Replit Auth design and is retained for historical context.

**Provider** *(original design)*: Replit Auth (OpenID Connect) for zero-configuration user authentication.

**Session Management**: Server-side sessions stored in PostgreSQL with configurable TTL and automatic cleanup. Sessions use cryptographically secure secrets and HTTP-only cookies.

**Authorization Pattern**: Middleware-based authentication checks (`isAuthenticated`) on protected routes. User identity extracted from session claims (sub field) for all authenticated operations.

**User Flow**:
1. Unauthenticated users redirected to `/api/login`
2. OIDC flow handled by Passport.js
3. Successful authentication creates database user record (upsert pattern)
4. Session established with user claims
5. Frontend queries `/api/auth/user` to retrieve authenticated state

**Security Considerations**: 
- Environment-aware cookie security (secure flag in production only)
- SameSite cookie protection against CSRF
- Credential validation before database operations
- Session expiration and renewal

### External Dependencies

**Authentication**: None at runtime (single shared `main-user`). *(Originally Replit Auth / OpenID Connect — now removed.)*

**Database**: Neon serverless PostgreSQL for relational data storage with WebSocket connection support.

**Object Storage**: Local filesystem (dev) or an S3-compatible bucket such as Cloudflare R2 (prod). Configured via `STORAGE_DRIVER` / `S3_*` env vars.

**Music Integration**: Spotify playlist embedding through external links (no API integration).

**UI Components**: Radix UI headless components for accessible, composable primitives.

**Development Tools**:
- Vite plugins for development (runtime error overlay, cartographer, dev banner)
- TypeScript for type safety across frontend, backend, and shared schema
- Drizzle Kit for database schema management

**Third-party Libraries**:
- date-fns for date manipulation and formatting
- zod for runtime schema validation
- wouter for lightweight routing
- class-variance-authority and clsx for dynamic styling