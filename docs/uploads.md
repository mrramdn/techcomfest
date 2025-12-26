# Uploads

## Where files are stored
Some API routes accept `multipart/form-data` file uploads and store them on disk:
- Directory: `public/uploads`
- Public URL: `/uploads/<filename>`

This is used for:
- Recipe image upload (`photo`)
- Article thumbnail/hero uploads (`thumbnail`, `hero`)

## Notes
- Filenames are sanitized and prefixed with `Date.now()` to reduce collisions.
- In production/serverless environments, writing to disk may not be durable; consider moving to S3/R2/Supabase Storage later and store the resulting URL in the DB.

