# Forum API

Text-only forum posts (no titles), with comments, up/down votes, likes, and Today Trending.

## Models (conceptual)
- Post: `content`, `author`, `createdAt`
- Comment: `content`, `user`, `createdAt`
- Vote: per-user per-post (`value` is `1` or `-1`)
- Like: per-user per-post

## Endpoints

### List posts
`GET /api/forum`

Returns posts ordered by newest first, with:
- `commentsCount`
- `likesCount`
- `score` (sum of votes)
- `isLiked` / `userVote` for the current user

Query params:
- `mine=true` - only posts authored by the current user

### Create post
`POST /api/forum`

Body:
```json
{ "content": "..." }
```

### Post detail
`GET /api/forum/:id`

### Update post (author/admin)
`PUT /api/forum/:id`

Body:
```json
{ "content": "..." }
```

### Delete post (author/admin)
`DELETE /api/forum/:id`

### Comments
- `GET /api/forum/:id/comments`
- `POST /api/forum/:id/comments`

Body:
```json
{ "content": "..." }
```

### Vote (up/down)
`POST /api/forum/:id/vote`

Body:
```json
{ "value": 1 }
```
or
```json
{ "value": -1 }
```

Sending the same value again toggles it off.

### Like
`POST /api/forum/:id/like`

Toggles like for the current user.

### Today trending
`GET /api/forum/trending`

Returns top posts by number of comments created today.
