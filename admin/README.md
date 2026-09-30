# She Said Pretty — Admin Dashboard

This folder is a standalone Vite/React admin app. It can be pushed to its own GitHub repository and deployed independently from the client booking site.

## Run locally

1. Install a supported Node.js version (20.19+ or 22.12+).
2. Copy `.env.example` to `.env` and set the Supabase URL, publishable/anon key, and API URL.
3. Run `npm install` and `npm run dev`.

Vite proxies `/api` to `http://localhost:5000` during local development. Admin sign-in uses Supabase Auth; create admin accounts in Supabase Authentication.

## Deploy

Deploy this folder as its own static site on Netlify, Vercel, Cloudflare Pages, or similar:

- Build command: `npm run build`
- Output directory: `dist`
- `VITE_SUPABASE_URL`: Supabase project URL.
- `VITE_SUPABASE_ANON_KEY`: Supabase publishable/anon key. This is a public browser key; never use a service-role/secret key here.
- `VITE_API_BASE_URL`: deployed Express API URL ending in `/api`.
- Configure the host's SPA fallback to serve `index.html` for the site root.

The API must allow this site's origin through CORS and validate the Supabase access token against its server-side admin-email allowlist before permitting admin reads or changes. The Supabase service key and API server belong in a separate private backend deployment/repository, not this dashboard.
