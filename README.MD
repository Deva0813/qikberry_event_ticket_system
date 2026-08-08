# QikBerry Event & Ticket System API

A RESTful backend for an event management system, built to handle two very
different kinds of data side by side: high-integrity transactional data
(user accounts, ticket bookings) and flexible, schema-light data (event
details, system logs). Rather than force both into one database, the two
concerns are split across two engines behind a single Express API.

## Tech stack

- **Node.js + Express 5**, TypeScript, MVC-style layering (routes →
  controllers → services)
- **MySQL** — Users and Bookings, where relational integrity and ACID
  transactions matter
- **MongoDB** — Events and System Logs, where the schema is more flexible
  (event `metadata` is an open JSON object)
- **Prisma** — one generated client per database (Prisma doesn't support
  two datasource providers in a single schema, so MySQL and MongoDB each
  have their own `schema.prisma` and their own generated client)
- **Joi** for request validation, **JWT** for auth, **bcryptjs** for
  password hashing
- **helmet**, **cors**, **express-rate-limit** for the non-functional
  security requirements
- **pnpm** as the package manager, **tsx** for running TypeScript directly
  in development

## Project structure

```bash
qikberry_event_ticket_system/
├── docs/
│   ├── diagrams                   # ER,Architecture,Flow Diagrams
│   ├── postman                    # Postman Collection
├── prisma/
│   ├── mysql/
│   │   ├── schema.prisma          # MySQL datasource — Users, Bookings
│   │   └── migrations/            # Prisma Migrate history (currently one: ..._prod)
│   └── mongodb/
│       └── schema.prisma          # MongoDB datasource — Events, SystemLog
│
├── src/
│   ├── config/
│   │   ├── env.ts                 # Loads & validates .env (fail fast on missing vars)
│   │   ├── prismaClient.ts        # Exports BOTH clients: mysqlClient, mongoClient
│   │   └── db/
│   │       └── seed.ts            # Seeds a default admin user on server startup
│   │
│   ├── routes/
│   │   ├── auth.routes.ts         # POST /register, POST /login
│   │   ├── event.routes.ts        # GET /events, GET /events/:id, POST /events (admin)
│   │   ├── booking.routes.ts      # POST /bookings, GET /bookings/me, PATCH /bookings/cancel
│   │   ├── user.routes.ts         # PATCH /user_role/:id — no auth middleware currently
│   │   └── index.ts               # Mounts all four routers on /api/v1
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── event.controller.ts
│   │   ├── booking.controller.ts  # Thin — parses req, calls service, shapes res
│   │   └── user.controller.ts     # makeAdmin
│   │
│   ├── services/
│   │   ├── auth.service.ts        # Hashing, JWT signing/verification
│   │   ├── event.service.ts       # Event CRUD, pagination
│   │   ├── booking.service.ts     # Concurrency-safe booking + cancellation transactions
│   │   └── user.service.ts        # makeAdmin — role update
│   │
│   ├── middleware/                # singular, not "middlewares"
│   │   ├── auth.middleware.ts     # Verifies JWT, attaches req.user
│   │   ├── admin.middleware.ts    # Role check, used on POST /events
│   │   ├── validate.middleware.ts # Runs Joi schemas against body/query/params
│   │   ├── sanitize.middleware.ts # Strips script tags + Mongo operator keys
│   │   ├── rateLimiter.middleware.ts
│   │   └── errorHandler.middleware.ts  # Global — last middleware in the chain
│   │
│   ├── validators/
│   │   ├── auth.validator.ts      # Joi schemas: register, login, paramId
│   │   ├── event.validator.ts
│   │   └── booking.validator.ts
│   │
│   ├── utils/
│   │   ├── error.ts               # ApiError class → errorHandler formats it
│   │   ├── catchAsync.ts          # Wraps async controllers, forwards errors
│   │   └── logger.ts              # Writes to MongoDB "system_logs" collection + console
│   │
│   ├── generated/                 # gitignored — output of `pnpm prisma:generate`
│   │   ├── mysql-client/
│   │   └── mongodb-client/
│   │
│   ├── app.ts                     # Express app: helmet, cors, rate limit, sanitize, routes, error handler
│   └── server.ts                  # Boots the app, runs seed() in the listen callback
│
├── .gitignore
├── .prettierrc
├── README.MD
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml            # onlyBuiltDependencies allowlist, not a monorepo
└── tsconfig.json
```

## Architecture Diagram
![Architecture](docs/diagrams/Architecture.jpg)

## ER Diagram
![ER](docs/diagrams/ER_Diagram.jpg)

## Setup

```bash
pnpm install
```

Create a `.env` file in the project root with:
Sample [.env.example](.env.example)

```bash
PORT=4000
NODE_ENV=development

CORS_ORIGIN="http://localhost:<PORT>"

MYSQL_DATABASE_URL="mysql://user:password@localhost:3306/<DATABASE_NAME>"
MONGODB_DATABASE_URL="<MONGO_DB_CLOUD>" # Ues cloud mongo uri 

JWT_SECRET="<RANDOM TEXT>"
JWT_EXPIRES_IN=1d

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

`MYSQL_DATABASE_URL`, `MONGODB_DATABASE_URL`, and `JWT_SECRET` are required
— the app exits immediately on startup if any are missing.


Generate both Prisma clients (required before anything else will type-check
or run — nothing imports until this has run once):

```bash
pnpm prisma:generate
```

Set up the databases:

```bash
pnpm prisma:migrate       # applies MySQL migrations
pnpm prisma:mongo:push    # syncs the MongoDB schema shape (no migrations for Mongo)
```

Run it:

```bash
pnpm dev                  # tsx watch, http://localhost:4000
```

On every startup the server seeds a default admin account
(`admin@qikberry.com` / `12345678`) if one doesn't already exist yet —
useful for hitting the admin-only endpoints locally without a manual
promotion step. Change or remove this before deploying anywhere real.

## API reference

All routes are prefixed with `/api/v1`. Send the JWT as
`Authorization: Bearer <token>`.

| Method | Path | Auth | Body / Query | Description |
|---|---|---|---|---|
| POST | `/auth/register` | none | `name, email, password` | Creates a user, returns `{ user, token }` |
| POST | `/auth/login` | none | `email, password` | Returns `{ user, token }` |
| GET | `/events` | none | `?page&limit&search` | Paginated event list |
| GET | `/events/:id` | none | — | Fetch one event by id |
| POST | `/events` | JWT + admin | `title, description, date, location, totalTickets, metadata` | Creates an event; `ticketsRemaining` starts equal to `totalTickets` |
| POST | `/bookings` | JWT (USER role only) | `eventId, quantity` | Books a ticket — atomic, concurrency-safe decrement against `ticketsRemaining` |
| GET | `/bookings/me` | JWT | — | Lists the caller's bookings, joined with event details |
| PATCH | `/bookings/cancel` | JWT | `bookingId` | Cancels a booking if more than 48h before the event; restores ticket count |
| PATCH | `/user/user_role/:id` | none | — | Promotes a user to `ADMIN` |

## Design notes

**Two databases, one API.** Routes and controllers stay thin; only the
services layer imports a Prisma client, and each service only ever talks
to the database it owns. `Booking.eventId` is a plain string pointing at a
MongoDB document — a logical foreign key, not a physical one, since MySQL
can't enforce a constraint into a different database engine.

**Booking concurrency.** The classic "two users book the last ticket at
the same time" race is handled by putting the availability check inside
the update filter itself
(`mongoClient.event.updateMany({ where: { ticketsRemaining: { gte: quantity } } })`)
rather than reading the count and writing it back. Only one concurrent
request can match once the count drops below what's requested.

**Cross-database consistency.** Since MySQL and MongoDB can't share a
single ACID transaction, both `bookTicket` and `cancelTicket` use a
compensating-write pattern: if the second database's write fails after the
first one succeeded, the first write is reverted rather than left
inconsistent.
