# Backend Development Directive (SOP and Style Guide)

This document defines the strict standard operating procedures (SOP) and style guide for the backend development of the KYK Laundry Tracking System. All backend code must strictly adhere to these rules.

## 1. Core Technologies
- **Framework:** Node.js with Express.js
- **Language:** TypeScript (`.ts`)
- **Database:** PostgreSQL (hosted on Supabase)
- **ORM:** Prisma
- **Notifications:** MVP phase excludes notifications. To be implemented later.

## 2. Directory and File Architecture
The following directory hierarchy will be used for a modular and clean structure within the project:

```text
backend/
├── prisma/               # Prisma schema and migrations
│   └── schema.prisma
├── src/
│   ├── controllers/      # Route handlers (logic for HTTP requests)
│   ├── routes/           # Express route definitions
│   ├── services/         # Core business logic and database interactions
│   ├── middlewares/      # Express middlewares (error handling, validation, etc.)
│   ├── types/            # TypeScript interfaces
│   ├── utils/            # Helper functions
│   └── index.ts          # Application entry point
├── .env                  # Environment variables (DATABASE_URL)
└── tsconfig.json         # TypeScript configuration
```

## 3. Database Rules
- **No manual SQL:** Do not write manual SQL queries. Always use Prisma Client.
- **Initialization:** Database migrations and seeding must be done using execution scripts located in the root `execution/` directory (e.g., `execution/seed_db.ts`).
- **Models:**
  - `User`: Uses an auto-generated UUID as the primary key. `phone` is unique.
  - `Machine`: Has a `status` enum (`BOS`, `DOLU`, `BITTI`, `BOZUK`).
  - `Log`: Tracks all events for gamification/penalties. 10+ reports auto-trigger `BOZUK` status.
  - `Queue`: Manages waiting lines. Requires a 10-minute timeout mechanism.

## 4. Coding Standards
- Use RESTful API design principles.
- Use `try/catch` blocks in all asynchronous route handlers or a wrapper utility.
- Keep controllers thin and move business logic to `services/`. 
