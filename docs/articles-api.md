# Articles API

## Categories
`ArticleCategory` (enum):
- `FEEDING`
- `NUTRITION`
- `HEALTH`
- `DEVELOPMENT`
- `TIPS`

## Status
`ArticleStatus` (enum):
- `DRAFT`
- `PUBLISHED`
- `ARCHIVED`

## Endpoints

### List articles
`GET /api/articles`

Query params:
- `category`: single or comma-separated (e.g. `FEEDING` or `FEEDING,TIPS`)
- `search`: full-text-ish match on title/content
- `from`: `YYYY-MM-DD` (createdAt start date, inclusive)
- `to`: `YYYY-MM-DD` (createdAt end date, inclusive)
- `favorites=true`: only returns the current user's favorites (requires login)

Non-admin users only see `PUBLISHED` articles.

### Create article (admin only)
`POST /api/articles`

Accepts JSON or `multipart/form-data`.

Required:
- `title` (string)
- `content` (string) – store HTML or Markdown as a string
- `category` (one of `ArticleCategory`)

Optional:
- `status` (defaults to `DRAFT`)
- `thumbnailImage` (string URL) or `thumbnail` (file)
- `heroImage` (string URL) or `hero` (file)

Author and timestamps are set automatically from the logged-in user.

### Article detail (public)
`GET /api/articles/:id`

Increments `views` on each request. Non-admin users can only open `PUBLISHED`.

### Update article (admin only)
`PUT /api/articles/:id`

Accepts JSON or `multipart/form-data` with the same fields as create (all optional).

### Delete article (admin only)
`DELETE /api/articles/:id`

### Toggle favorite (logged-in users)
`POST /api/articles/:id/favorite`

Non-admin users can only favorite `PUBLISHED` articles.
