# Traveloop

Full-stack travel planning app for your hackathon: **React (Vite) + Tailwind** client and **Node.js (Express) + PostgreSQL** API, with JWT auth, trip itineraries, budget charts (Recharts), packing lists, and public share links.

## Prerequisites

- **Node.js** 18+
- **PostgreSQL** 14+ (local or cloud)

## 1. Database

Create a database and apply the schema:

```bash
createdb traveloop
psql $DATABASE_URL -f server/schema.sql
```

On Windows (PowerShell), if `psql` is on your PATH:

```powershell
psql "postgresql://postgres:postgres@localhost:5432/traveloop" -f server/schema.sql
```

## 2. Server

```bash
cd server
cp .env.example .env
# Edit .env: set DATABASE_URL and JWT_SECRET
npm install
npm run dev
```

The API defaults to **http://localhost:4000**. Health check: `GET http://localhost:4000/api/health`.

## 3. Client

In a new terminal:

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` to the backend, so you do not need a client `.env` for local development.

For production, build the client and set `VITE_API_URL` to your API origin if the app is not served from the same host (see `client/.env.example`).

```bash
cd client
npm run build
npm run preview
```

## API routes (summary)

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET/POST /api/trips`, `GET/PUT/DELETE /api/trips/:id`
- `GET /api/trips/:id/budget`, `GET/POST /api/trips/:id/packing`
- `POST /api/trips/:id/stops`, `POST /api/trips/:id/share`
- `PUT/DELETE /api/stops/:id`, `POST /api/stops/:id/activities`
- `PUT/DELETE /api/activities/:id`
- `PATCH /api/packing/:id/toggle`
- `GET /api/share/:token` (public read-only trip)

## Design tokens

- Primary: `#0D9488` (teal)
- Accent: `#F59E0B` (amber)

## Project layout

- `client/` — React + Vite + Tailwind
- `server/` — Express API (`server/schema.sql` is runnable PostgreSQL DDL)
