# Recipes API

This documents the existing recipe endpoints under `app/api/recipes/*`.

## Endpoints

### List recipes
`GET /api/recipes`

Query params:
- `category`
- `search`
- `favorites=true` (requires login)

Non-admin users only see `PUBLISHED` recipes.

### Create recipe (admin only)
`POST /api/recipes`

Accepts JSON or `multipart/form-data` (with `photo`).

### Recipe detail (public)
`GET /api/recipes/:id`

Increments `views` on each request. Non-admin users can only open `PUBLISHED`.

### Update recipe (admin only)
`PUT /api/recipes/:id`

### Delete recipe (admin only)
`DELETE /api/recipes/:id`

### Toggle favorite (logged-in users)
`POST /api/recipes/:id/favorite`

