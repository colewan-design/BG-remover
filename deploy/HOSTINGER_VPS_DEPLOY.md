# Hostinger VPS Deployment

This project is ready to deploy to a Hostinger VPS as a split app:

- `frontend/` runs the Nuxt server
- `backend/` runs Laravel behind PHP-FPM
- Nginx routes:
  - `example.com` -> Nuxt
  - `api.example.com` -> Laravel

## Recommended server shape

- Ubuntu VPS
- Node.js `20.x` or newer
- PHP `8.2`
- Nginx
- MySQL or MariaDB
- Composer
- PM2

## Suggested directory layout

```text
/var/www/bgremover/
  backend/
  frontend/
```

## 1. Upload the project

Clone or upload the repository into:

```bash
/var/www/bgremover
```

## 2. Configure Laravel

Go to:

```bash
cd /var/www/bgremover/backend
```

Create the production env file:

```bash
cp .env.example .env
```

Update at least these values:

```env
APP_NAME="BG Remover API"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.example.com
FRONTEND_URL=https://example.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bgremover
DB_USERNAME=bgremover_user
DB_PASSWORD=your_real_password
```

Install dependencies and optimize:

```bash
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Set write permissions for Laravel runtime directories:

```bash
chmod -R 775 storage bootstrap/cache
```

## 3. Configure Nuxt

Go to:

```bash
cd /var/www/bgremover/frontend
```

Create the frontend env file:

```bash
cp .env.example .env
```

Set the backend API base URL:

```env
NUXT_PUBLIC_BACKEND_API_BASE=https://api.example.com/api
```

Install and build:

```bash
npm install
npm run build
```

The production server starts with:

```bash
npm run start
```

## 4. Run Nuxt with PM2

Install PM2 globally if needed:

```bash
npm install -g pm2
```

From `frontend/`:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Before starting, edit [frontend/ecosystem.config.cjs](C:/xampp/htdocs/bgremover/frontend/ecosystem.config.cjs:1) and replace:

- `cwd`
- `NUXT_PUBLIC_BACKEND_API_BASE`

with your real server paths and domains.

## 5. Configure Nginx

Use [deploy/nginx-hostinger-vps.conf.example](C:/xampp/htdocs/bgremover/deploy/nginx-hostinger-vps.conf.example:1) as your template.

You should replace:

- `example.com`
- `www.example.com`
- `api.example.com`
- PHP-FPM socket path if your server uses a different PHP version

After editing:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 6. Enable SSL

After DNS points to your VPS, issue certificates with Certbot:

```bash
sudo certbot --nginx -d example.com -d www.example.com -d api.example.com
```

## 7. DNS setup

Point these records to your VPS public IP:

- `A` record for `example.com`
- `A` record for `www.example.com`
- `A` record for `api.example.com`

## 8. Useful production commands

Laravel:

```bash
php artisan optimize
php artisan migrate --force
php artisan queue:work
```

Nuxt:

```bash
npm run build
pm2 restart bgremover-nuxt
pm2 logs bgremover-nuxt
```

## 9. Deployment flow for updates

For each release:

```bash
cd /var/www/bgremover
git pull
cd backend && composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan optimize
cd ../frontend && npm install
npm run build
pm2 restart bgremover-nuxt
```

## Notes

- This app does not currently require Laravel API auth for the Nuxt UI.
- The background removal work happens in the browser, so server load is mostly normal app delivery.
- If you want one single domain instead of `example.com` + `api.example.com`, I can rework the Nginx layout for that next.
