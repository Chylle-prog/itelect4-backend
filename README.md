# ITElect4 Lost & Found Backend

Node.js, Express, TypeScript, MongoDB, and JWT API for the GT4 Lost & Found application.

## Live deployment

- Frontend: https://itelect4-project-it-4-b-magbuhat.vercel.app/
- Backend health: https://itelect4-project-it-4-b-magbuhat.vercel.app/api/health

The frontend and API currently share one Vercel deployment. The API is exposed under `/api` on the same domain.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` and a private `JWT_SECRET`.
3. Run `npm run dev`; the API listens on port 4000.

Run `npm run build` to type-check the backend. Never commit `.env`.

## Routes

| Method | Path | Access |
| --- | --- | --- |
| GET | `/api/health` | Public |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/users` | Bearer token |
| GET | `/api/items` | Bearer token |
| GET | `/api/items/:id` | Bearer token; owner only |
| POST | `/api/items` | Bearer token |
| PATCH | `/api/items/:id` | Bearer token; owner only |
| DELETE | `/api/items/:id` | Bearer token; owner only |
| GET | `/api/claims` | Bearer token; claimant or item owner |
| POST | `/api/claims` | Bearer token |
| PATCH | `/api/claims/:id` | Bearer token; item owner or staff |

The items and claims collections use MongoDB ObjectIds. Demo users, items, and claims are present in the configured Atlas database. New demo accounts have random passwords and are not login accounts.