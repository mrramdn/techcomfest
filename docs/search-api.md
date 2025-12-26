# Search API

The app header uses this endpoint to power the global search dropdown for Recipes, Articles, and Forum.

## Endpoint

`GET /api/search`

## Auth

Requires a valid `session-token` cookie (any logged-in user).

## Query Params

- `q` (string, required): Search text. Must be at least 2 characters.
- `scope` (string, optional): `all` | `recipes` | `articles` | `forum` (default: `all`)
- `limit` (number, optional): Per-scope limit (min 1, max 10, default 5)

## Permissions

- `ADMIN`: can search all recipes/articles (any status).
- `USER`: recipes/articles are limited to `PUBLISHED`.
- Forum search is always available to logged-in users.

## Response

```json
{
  "recipes": [
    { "id": "…", "title": "…", "subtitle": "…", "image": "/uploads/…", "href": "/recipes/…" }
  ],
  "articles": [
    { "id": "…", "title": "…", "subtitle": "FEEDING", "image": "/uploads/…", "href": "/articles/…" }
  ],
  "forum": [
    { "id": "…", "title": "…", "subtitle": "by …", "image": null, "href": "/forum/…" }
  ]
}
```

