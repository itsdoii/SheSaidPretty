# She Said Pretty — Client Booking Site

This folder is a standalone Vite/React app. It contains the public appointment booking experience and can be pushed to its own GitHub repository.

## Run locally

1. Install a supported Node.js version (20.19+ or 22.12+).
2. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` if your API is not running on `http://localhost:5000/api`.
3. Run `npm install` and `npm run dev`.

Vite proxies `/api` to `http://localhost:5000` during local development. The backend is still required: it provides availability, reservation creation, and schedule lookup.

## Deploy

Deploy this folder as its own static site on Netlify, Vercel, Cloudflare Pages, or similar:

- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL=https://YOUR-API-HOST/api`
- Configure the host's SPA fallback to serve `index.html` for the site root.

Payment QR codes and brand assets are in `public/` and are bundled with the site. Never add backend secrets to this project. `VITE_` variables are visible in the browser bundle.

The API's CORS configuration must allow the production client-site origin. The Express backend and its Supabase database remain separate from this frontend repository.
