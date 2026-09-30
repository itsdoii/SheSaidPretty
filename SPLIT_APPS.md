# Separate client and admin apps

The frontend is now duplicated into two independently buildable folders. Each folder can be copied into a separate GitHub repository:

- `client/` — public appointment booking app. See [client/README.md](client/README.md).
- `admin/` — admin dashboard app. See [admin/README.md](admin/README.md).

Both app folders contain their own Vite entry, package files, source, styles, static assets, and `.gitignore`. They share the same API and Supabase project, but use separate frontend deployment URLs and `VITE_API_BASE_URL` settings. Set each static host's build root/base directory to its corresponding folder.

## Backend

The root `server.js` remains the shared API backend and should be deployed separately as a Node service (or placed in a third private repository with its package files and required migrations). Configure these server environment variables:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY` (server-only secret/service key)
- `ADMIN_EMAILS` (comma-separated allowlisted admin login email addresses)
- `CORS_ORIGINS` (comma-separated exact production client/admin origins, e.g. `https://booking.example.com,https://admin.example.com`)
- `PORT` (provided by most hosting services)

Set the API host's CORS allowlist to the deployed client and admin website origins before production. The admin frontend sends the Supabase session access token; the backend validates it and enforces `ADMIN_EMAILS` for reservation and schedule administration. Public availability and booking submission remain available to customers.

For either frontend's local development, Vite proxies `/api` to `http://localhost:5000`. For deployment, set `VITE_API_BASE_URL` to the full deployed backend URL ending in `/api`. Supabase browser settings belong only in `admin/.env`; never place the server secret there.

## Create two GitHub repositories

1. Create an empty client repository and an empty admin repository on GitHub.
2. Copy the contents of `client/` into the client repository and push that folder's files from its own repository root.
3. Copy the contents of `admin/` into the admin repository and push that folder's files from its own repository root.
4. Configure each host to build with `npm run build` and publish `dist/`.
5. Configure a SPA fallback to `index.html`, then add `VITE_API_BASE_URL` to both site's build environment variables.
6. Configure the API CORS allowlist and admin allowlist as described above.

Do not publish `.env` files, Supabase server secret keys, `node_modules`, or `dist`.
