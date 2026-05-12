# kreathur-landing

Production static site for **https://kreathur.agency**.

This repo contains the **build output** — Next.js static export from the
source repo (private CRM/landing).

## How it deploys
1. Build locally: `bash scripts/build-static.sh` → `/out`
2. Copy `/out` content into this repo's `main`
3. Push main → cPanel Git™ Version Control auto-pulls
4. `.cpanel.yml` copies files to `/home/kreathur/public_html`

## Branches
- `main` — current production (Next.js static export)
- `static-html-backup` — previous single-page HTML site (rollback)

## Routes
- `/` → redirects to `/inicio/`
- `/inicio/` — main landing
- `/blog/` + `/blog/<slug>/` — knowledge hub

## Rollback
```bash
git push origin static-html-backup:main --force
```
