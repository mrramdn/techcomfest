# Authentication

## Overview
The app uses a signed JWT stored in the `session-token` cookie.

- Cookie name: `session-token`
- JWT signing secret: `JWT_SECRET`
- Payload includes:
  - `sub` (user id)
  - `email`
  - `role` (`ADMIN` or `USER`)

Most API routes decode the cookie using `jose` (`jwtVerify`) and then apply role-based authorization.

## Endpoints
All routes are under `app/api/auth/*`.

- `POST /api/auth/register` - Create a user account
- `POST /api/auth/login` - Sign in; sets `session-token`
- `POST /api/auth/logout` - Clears session cookie
- `GET /api/auth/me` - Returns current user data (requires cookie)
- `POST /api/auth/request-reset` - Request password reset token
- `POST /api/auth/reset/:token` - Reset password using token
- `POST /api/auth/complete` - (if used) finalize onboarding flow

## Roles
- `ADMIN`: can create/update/delete admin-managed content (recipes/articles)
- `USER`: can only read public content and create user-owned records (children, meal logs, etc.)

