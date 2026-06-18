# Hostinger Shared Hosting Deployment

This deployment model fits your setup:

- `backend/` is uploaded or cloned separately as a Laravel app on Hostinger shared hosting
- `frontend/` is exported as static files and uploaded manually to a separate folder or domain

This works because your Nuxt app is now configured as a client-side app and can be exported statically.

## Architecture

- Frontend:
  - Static Nuxt export
  - Upload contents to the frontend subdomain web root
- Backend:
  - Laravel app hosted separately
  - API endpoints served from a separate subdomain

Example:

- `https://bg-remover.salidumay.com` -> static Nuxt frontend
- `https://bgremover-api.salidumay.com` -> Laravel backend

## 1. Prepare the frontend for static upload

From `frontend/`:

```bash
cp .env.example .env
```

Set your real API URL:

```env
NUXT_PUBLIC_BACKEND_API_BASE=https://bgremover-api.salidumay.com/api
```

Build the static frontend:

```bash
npm install
npm run export
```

Upload this folder's contents:

```text
frontend/.output/public/
```

If you are deploying the frontend into a subfolder instead of the domain root, tell me and I can adjust Nuxt's base URL for that.

## 2. Prepare the Laravel backend

Hostinger shared hosting supports Laravel, but you usually need to place:

- the Laravel project above `public_html`
- the contents of Laravel `public/` into the web-facing folder, or point the domain/subdomain document root to `public/`

Use Hostinger's current Laravel instructions for shared hosting as reference:

- Laravel support: https://www.hostinger.com/support/1583301-which-laravel-versions-are-supported-at-hostinger/
- Manual Laravel deployment example: https://www.hostinger.com/support/6152127-how-to-deploy-laravel-8-at-hostinger/

## 3. Configure backend env

In `backend/.env` set at least:

```env
APP_NAME="BG Remover API"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://bgremover-api.salidumay.com

FRONTEND_URL=https://bg-remover.salidumay.com
FRONTEND_URLS=https://bg-remover.salidumay.com
```

Set your real database values too.

## 4. Enable CORS for the frontend

This project now reads allowed frontend origins from:

```env
FRONTEND_URLS
```

So if your frontend is hosted at:

```text
https://bg-remover.salidumay.com
```

then use:

```env
FRONTEND_URLS=https://bg-remover.salidumay.com
```

If the frontend is in a subdomain like `https://app.example.com`, use that instead.

## 5. Backend install steps

After upload/clone, in `backend/` run:

```bash
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Before testing the frontend, verify the API subdomain is really serving Laravel and not a hosting placeholder page:

```text
https://bgremover-api.salidumay.com/api/health
```

Expected result:

```json
{"status":"ok", ...}
```

If you get Hostinger's "This Page Does Not Exist" page instead, the subdomain is not pointing at Laravel's `public/` entrypoint yet, so frontend Google sign-in will fail with CORS errors even if your `.env` values are correct.

## 6. Important limitation

This shared-hosting approach is for:

- static Nuxt frontend
- Laravel API backend

It is not for:

- running Nuxt SSR
- running a persistent Node process

That is why the correct frontend command here is:

```bash
npm run export
```

not `npm run start`.

## 7. Recommended folder split

One practical layout is:

- frontend subdomain:
  - upload `frontend/.output/public/*` into `/home/u867165545/domains/salidumay.com/public_html/bg-remover.com/`
- API subdomain backend:
  - use `bgremover-api.salidumay.com`
  - point it to Laravel public entry, or use the Hostinger Laravel structure

## 8. What to upload

Frontend:

- Upload only the contents of `frontend/.output/public/`

Backend:

- Upload the Laravel project files for `backend/`
- Do not expose `.env`, `vendor/`, `storage/`, or the whole app directly inside a public web root unless Hostinger's Laravel structure specifically requires a safe public folder split

## 9. If you want, next step

I can tailor this further if you tell me:

1. Your frontend domain or path
2. Your backend domain or subdomain
3. Whether Hostinger lets you set the document root to Laravel `public/`
