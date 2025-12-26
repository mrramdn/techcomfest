# Permissions (RBAC)

## Roles
The database `User.role` is an enum:
- `ADMIN`
- `USER`

## General rules
- Public read: list/detail routes usually return only `PUBLISHED` content for non-admins.
- Admin write: create/update/delete for managed content is restricted to `ADMIN`.

## Recipes
- `GET /api/recipes`: public (non-admin sees `PUBLISHED` only)
- `GET /api/recipes/:id`: public (non-admin can only open `PUBLISHED`); increments `views`
- `POST /api/recipes`: `ADMIN` only
- `PUT /api/recipes/:id`: `ADMIN` only
- `DELETE /api/recipes/:id`: `ADMIN` only
- `POST /api/recipes/:id/favorite`: authenticated users

## Articles
- `GET /api/articles`: public (non-admin sees `PUBLISHED` only)
- `GET /api/articles/:id`: public (non-admin can only open `PUBLISHED`); increments `views`
- `POST /api/articles`: `ADMIN` only
- `PUT /api/articles/:id`: `ADMIN` only
- `DELETE /api/articles/:id`: `ADMIN` only
- `POST /api/articles/:id/favorite`: authenticated users (non-admin can only favorite `PUBLISHED`)

## Forum
- `GET /api/forum`: authenticated users
- `POST /api/forum`: authenticated users
- `GET /api/forum/:id`: authenticated users
- `GET /api/forum/:id/comments`: authenticated users
- `POST /api/forum/:id/comments`: authenticated users
- `POST /api/forum/:id/vote`: authenticated users
- `POST /api/forum/:id/like`: authenticated users
- `GET /api/forum/trending`: authenticated users
