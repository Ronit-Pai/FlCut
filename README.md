# FLCut

FLCut is an event-focused URL shortener built with Next.js, Prisma, PostgreSQL, and TypeScript.
It supports short link creation, custom aliases, scheduled publishing, link expiry, analytics, and an admin dashboard.

## Tech Stack

- Next.js 16
- TypeScript
- Prisma ORM
- PostgreSQL (Neon)
- Tailwind CSS

## Features

- Short URL generation
- Custom aliases
- Scheduled links
- Expiring links
- Admin auth
- Dashboard analytics
- Click tracking
- Enable / Disable links
- Delete links

## Setup

Create a `.env` file:

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=your-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=password
BASE_URL=http://localhost:3000
```

Install dependencies:

```bash
npm install
```

Run migrations:

```bash
npx prisma migrate dev
```

Seed reserved slugs:

```bash
npm run db:seed
```

Start development server:

```bash
npm run dev
```

## API

| Method | Endpoint | Description |
|----------|----------|----------|
| POST | `/api/links` | Create short link |
| POST | `/api/auth/login` | Admin login |
| POST | `/api/auth/logout` | Admin logout |
| PATCH | `/api/links/[id]/toggle` | Enable / Disable link |
| DELETE | `/api/links/[id]` | Delete link |

## Data Model

### Link

Stores the short URL and its lifecycle state.

| Field |
|---------|
| id |
| slug |
| targetUrl |
| goLiveAt |
| expiresAt |
| isDisabled |
| createdAt |
| updatedAt |

### ClickEvent

Stores analytics for each redirect.

| Field |
|---------|
| id |
| linkId |
| ipHash |
| userAgent |
| deviceType |
| referrer |
| country |
| createdAt |

### ReservedSlug

Stores blocked aliases such as:

- admin
- api
- dashboard
- login
- (and a few more)

The model is centered around Link, ClickEvent, and ReservedSlug. Links remain small while analytics data grows independently.

## Architecture

```text
Create Link
     ↓
Store Link
     ↓
Visit Short URL
     ↓
Validate Status
     ↓
Track Click
     ↓
Redirect
```

## Assumptions
- Authentication requirements
- Bot filtering (idk how well it works)
- Custom domains / alias

I assumed a only a single admin managing all links so only 1 (login creds in .env itself).

## Tradeoff

used server-side click tracking using Prisma and PostgreSQL.

Its easy but not prefered when scaling

## If I Only Had 4 Hours

I would build:

1. Link creation
2. Redirect handling
3. Dashboard listing (basic details only)

Idk if i can do these in 4 hours:
1. Scheduling
2. Expiry
3. Advanced analytics
4. Authentication improvements

## Why This Data Model?

Link contains everything required to resolve a short URL.

ClickEvent is stored separately because analytics data grows much faster than link metadata.

ReservedSlug prevents collisions with application routes and reserved keywords.

## Deployment

- Vercel
- Neon PostgreSQL

Required environment variables:

```env
DATABASE_URL=
AUTH_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
BASE_URL=
```
## Future features
- QR code generation 
- graph based analytics 
