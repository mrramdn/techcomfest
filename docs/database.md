# Database

## Stack
- PostgreSQL
- Prisma ORM (`prisma/schema.prisma`)

## Environment
Required:
- `DATABASE_URL`
- `JWT_SECRET`

## Common commands
Use the `package.json` scripts:

- Generate client: `pnpm db:generate`
- Apply migrations (dev): `pnpm db:migrate`
- Push schema (no migrations): `pnpm db:push`
- Seed: `pnpm db:seed`
- Prisma Studio: `pnpm db:studio`

## Migrations
Migration SQL files are stored in `prisma/migrations/*/migration.sql`.

When adding a new model, prefer using Prisma migrations so the schema and DB stay aligned.

## Seeded data (dev)
`pnpm db:seed` creates:
- `admin@example.com` / `admin123` (ADMIN)
- `user@example.com` / `user12345` (USER)
- Sample recipes, articles, forum posts/comments
- One sample child, a few meal logs, and one weekly report for the sample user
