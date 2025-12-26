# Lahap

Lahap is a child nutrition monitoring app for parents: manage child profiles, log meals, and track feeding patterns over time.

## Getting Started

### Prerequisites
- Node.js + pnpm
- PostgreSQL

### Environment variables
Create `.env.local`:
```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME"
JWT_SECRET="change-me"
```

### Install
```bash
pnpm install
```

### Run locally
Generate Prisma client, apply migrations, then start the dev server:

```bash
pnpm db:generate
pnpm db:migrate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Database
To seed an admin/user for development:
```bash
pnpm db:seed
```

## App Areas
- `/recipes` (public read; admin CRUD; favorites + view count)
- `/track` (user-only child meal tracking)
- `/articles` (public read; admin CRUD; favorites + view count)
- `/forum` (user posts + comments; trending; likes/votes)

## Documentation
- Docs index: `docs/README.md`
- Articles API: `docs/articles-api.md`
- Forum API: `docs/forum-api.md`
- Recipes API: `docs/recipes-api.md`
- Search API: `docs/search-api.md`

## Notes
- Authentication uses a JWT stored in the `session-token` cookie.
- Some endpoints accept `multipart/form-data` uploads and write to `public/uploads` (served as `/uploads/...`).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
