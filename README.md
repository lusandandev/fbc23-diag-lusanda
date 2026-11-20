# Mini Task Tracker

A small task-management application with a Next.js/TypeScript front end, an Express/TypeScript API, and a local SQLite database. The API owns all database access; the browser communicates with it over JSON HTTP endpoints.

## Requirements

- Node.js 22
- npm

No external database server or hosted service is required.

## Run locally

Use two terminals from the repository root.

### 1. Configure and start the API

```bash
cd api
npm install
```

The API folder includes `.env.example`. Copy it to `.env` and replace the example `JWT_SECRET` with a private random value. The command below is run from inside `api/`:

```bash
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead. Then start the API:

```bash
npm run dev
```

The API listens on `http://localhost:3001` by default. It creates `api/dev.db` and its tables on first start. In development, it seeds two demo accounts:

| Email | Password |
|---|---|
| `lusanda@example.com` | `password123` |
| `alex@example.com` | `password123` |

Both accounts use the same demo password so that task ownership and user isolation can be checked. Demo accounts are seeded only when `NODE_ENV=development`; they are not created in production.

### 2. Start the web app

In a second terminal, from the repository root:

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:3000`. The front end uses `http://localhost:3001` unless `NEXT_PUBLIC_API_URL` is set.

## API configuration

The API loads `.env` from the `api` working directory. `JWT_SECRET` is required; the API will not start without it. The other settings are:

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3001` | API listening port |
| `JWT_SECRET` | Required | Secret used to sign and verify 24-hour JWTs |
| `WEB_ORIGIN` | `http://localhost:3000` | Allowed browser origin for CORS |
| `DATABASE_PATH` | `./dev.db` | SQLite file path, relative to the API working directory |
| `NODE_ENV` | `development` | Controls development-only demo seeding |

Keep `.env` private and do not commit it. The token is stored in browser `localStorage` for this exercise. JavaScript running on the page can access it, so this is a documented trade-off rather than a production recommendation.

## API contract

Base URL: `http://localhost:3001`. Protected task requests use `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose | Success |
|---|---|---|---|
| `GET` | `/health` | Health check | `200 { "status": "API is running" }` |
| `POST` | `/login` | Sign in with email and password | `200 { "success": true, "token": "..." }` |
| `GET` | `/tasks` | List the signed-in user's tasks | `200 { "success": true, "data": [...] }` |
| `GET` | `/tasks?status=pending` | Filter by status (`pending` or `completed`) | `200` with the matching tasks |
| `POST` | `/tasks` | Create a task | `201` with the created Task |
| `PATCH` | `/tasks/:id` | Partially update a task | `200 { "success": true, "message": "Task updated successfully" }` |
| `DELETE` | `/tasks/:id` | Delete a task | `204`, no response body |

Task titles are trimmed, required and limited to 255 characters. Descriptions are optional and limited to 2,000 characters. Due dates are optional calendar dates from `1900-01-01` through `2100-12-31`; past dates are allowed. New tasks start as `pending`.

JSON API errors use `{ "success": false, "error": "..." }`. Validation responses may also include a `fields` object so the front end can show a message beside the relevant form field. A missing task and a task owned by another user both return the same `404` response. Request bodies are limited to 10 KB.

`GET /health` is intentionally the documented exception to the normal success/error envelope and returns `{ "status": "API is running" }`.

## Project structure

```text
api/
  src/
    config.ts              Environment validation
    app.ts                 Express middleware and route registration
    server.ts              Startup and dependency composition root
    schemas/               Zod request and Task schemas
    types/                 Types inferred from the shared Task schema
    db/                    SQLite connection, schema and development seed
    repositories/          Repository interfaces and SQLite implementations
    services/              Authentication and task business rules
    controllers/           HTTP request/response handling
    routes/                Route-to-controller mappings
    middleware/            JWT authentication and central error handling
  tests/                   Schema, service, authentication and repository tests
  scripts/                 Cross-platform test discovery runner
web/
  app/                     Next.js page and global styles
  components/              Login, task form/list/item, filter and error banner
  hooks/                   Authentication and task state/fetching
  lib/                     API client
  types/                   Front-end Task types, independent of API dependencies
```

The dependency direction is controllers → services → repository interfaces. The composition root (`api/src/server.ts`) creates the SQLite repositories and injects them. `JwtService` centralises token signing and verification. Services contain no HTTP or SQL logic, and repositories are the only application layer that queries task and user records. The front end maintains its own small Task type so `web/` does not depend on API source files or API packages.

## Checks

The API test script discovers all TypeScript test files recursively, so adding a new `*.test.ts` file does not require editing `package.json`.

From `api/`:

```bash
npm test
npm run typecheck
npm run build
```

The **15 automated tests** are discovered from every `*.test.ts` file under `api/tests`, including tests added later. They cover Zod validation, authentication behaviour, service rules and repository SQL ownership filters. Tests use fake repositories/database adapters and do not require a running SQLite file or network connection. From `web/`, run `npm run lint` and `npm run build` for front-end checks.

## Database and ERD

The logical relationship is one user to zero or many tasks. Each task belongs to exactly one user. The SQLite schema enforces a unique user email, a task status check, and `ON DELETE CASCADE` from users to tasks. The updated logical ERD is included at [`tracker-logical-erd.pdf`](./tracker-logical-erd.pdf).

The refactor does not include database migrations. If you have a Week 1 `api/dev.db`, stop the API and delete that file once before starting the refactored version; the updated schema will then be created. Task and user data in that old local database will be lost.

## Scope

This project includes sign-in, private per-user tasks, task creation/listing/editing/completion/deletion, status filtering, validation, consistent API errors, service-level tests and the layered API structure. Self-registration, roles, password reset, refresh tokens, search, sorting, pagination, deployment, a database migration, HTTP/repository/front-end automated tests, and httpOnly-cookie authentication remain out of scope.
