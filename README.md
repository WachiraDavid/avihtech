# AVIHTECH AGENCIES

Real estate website on Cloudflare: static pages + a vanilla-JS Worker API, **D1** for properties and blog posts, **R2** for images, and a built-in dashboard at `/admin`.

```
public/        static site (HTML, CSS, client JS) and the dashboard (public/admin)
src/           Worker: public API, admin API, auth, image serving
migrations/    D1 schema
seed.sql       sample content for local development
```

## Local development

Needs Node 22+ for the newest Wrangler (this repo pins 4.86.0, which works on Node 20).

```bash
npm install
cp .dev.vars.example .dev.vars     # local admin password + session secret
npm run db:migrate:local
npm run db:seed                    # optional sample data
npm run dev                        # http://localhost:8787  (dashboard: /admin)
```

Local D1 and R2 are simulated in `.wrangler/` — nothing touches your Cloudflare account.

## First deploy

```bash
npx wrangler login
npx wrangler d1 create avihtech-db          # copy the database_id into wrangler.jsonc
npx wrangler r2 bucket create avihtech-images
npm run db:migrate:remote
npx wrangler secret put ADMIN_PASSWORD      # the dashboard password
npx wrangler secret put SESSION_SECRET      # any long random string, e.g. `openssl rand -hex 32`
npm run deploy
```

Then add the custom domain under Workers & Pages → avihtech → Settings → Domains.

Pushing to `main` deploys automatically via `.github/workflows/deploy.yml`; add the repo secrets
`CLOUDFLARE_API_TOKEN` (Edit Workers + D1 + R2 permissions) and `CLOUDFLARE_ACCOUNT_ID`.

## Dashboard

`/admin` — sign in with `ADMIN_PASSWORD`.

- **Properties**: photos (drag to reorder, first is the cover), for sale / rent, type, location, price, details, highlight tags, description, show/hide, feature on home page.
- **Blog**: cover photo, title, topic, a simple editor (headings, lists, links, photos), summary, show/hide.

Hidden items stay in the database but are not returned by the public API.
Photos are resized in the browser before upload and stored in R2, served from `/images/…`.

For stronger protection you can also put `/admin*` and `/api/admin/*` behind Cloudflare Access.

## Routes

| Path | |
|---|---|
| `/properties/:slug`, `/blog/:slug` | detail pages (share one static template each) |
| `GET /api/properties?q=&type=&tag=&featured=1&limit=` | published properties |
| `GET /api/properties/:slug`, `GET /api/tags` | |
| `GET /api/posts`, `GET /api/posts/:slug` | published posts |
| `/api/admin/*` | dashboard API (cookie session) |
