# thisisprince.com

Prince's personal website and writing, built with Astro and deployed on
Netlify.

## Local development

Requires Node.js 22 or newer.

```sh
npm install
npm run dev
```

Useful checks:

```sh
npm run format
npm run check
npm test
npm run build
```

`npm run validate` runs all non-mutating checks together.

## Publishing a post

Add a Markdown file to `src/content/blog/`. The filename becomes the URL slug:

```md
---
title: "Post title"
description: "A concise description for search and sharing."
publishedAt: "2026-08-01T12:00:00Z"
draft: false
---

Post content.
```

The `/blog/` archive, post route, sitemap, and RSS feed update automatically
at build time. Set `draft: true` to exclude an unfinished post.

## Likes

The pages are static, while `/api/likes/[slug]` runs on a Netlify Function and
stores counts in Supabase Postgres. A signed, first-party, HttpOnly cookie
allows one irreversible like per browser. Only HMAC-derived visitor and daily
network identifiers are stored; raw IP addresses are not stored.

To provision the backend:

1. Create separate Supabase projects for development/previews and production.
2. Run `supabase/migrations/0001_blog_likes.sql` in each project's SQL editor.
3. Run `npm run capture:likes` immediately before launch.
4. Run the generated `supabase/seed.sql` once in production.
5. Configure these server-only environment variables in Netlify:
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY` (the current `sb_secret_...` key, not the
     publishable key)
   - `LIKE_COOKIE_SECRET` (at least 32 random characters)

Never prefix the secret key with `PUBLIC_` or expose it to browser code.
The database tables have Row Level Security enabled and are accessed only by
the server route.

Bear Blog remains online and independent. `npm run capture:likes` takes a
one-time aggregate snapshot; likes made on either site after launch do not
synchronize.

## Content migration

`npm run import:bear` reproducibly imports the nine public Bear posts, removes
Bear-specific chrome/scripts, preserves MathML, converts Python snippets to
fenced code blocks, and downloads remote article images into `public/media`.

## Deployment

Netlify builds with `npm run build` and publishes `dist`. Deploy previews must
use development Supabase credentials so tests cannot change production counts.
The legacy `/pages/Volution.html` URL permanently redirects to
`/pages/volution/`.
