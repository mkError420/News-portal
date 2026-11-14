# MK News Portal

A responsive Bangladeshi news portal built with React, Vite, and Tailwind CSS. The app includes:

- Newspaper-style homepage with breaking news ticker
- Dynamic category pages and article detail view
- Search-driven content discovery
- Admin dashboard with database-backed login, article editing, and breaking-news management
- MySQL-backed public news feed with a local cache for read-only fallback

## Run locally

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 4173
```

Then open http://localhost:4173/

## Admin account

Create an admin row in the `admins` table using a password hash generated locally with PHP's `password_hash()`. The database seed intentionally creates no default admin account.

## Production build

```bash
npm run build
```

## Live hosting setup

The deployable web root is `cpanel-deploy/`. For InfinityFree, upload its contents into `htdocs/`; on standard cPanel hosting, use the domain's document root (usually `public_html/`).

1. Import `backend/cpanel-database.sql` into the database already created in your hosting panel.
2. Before upload, set the database connection environment variables in the hosting control panel. If environment variables are unavailable, edit only the deployed `cpanel-deploy/backend/config.php`; never commit database credentials.
3. Upload the contents of `cpanel-deploy/` (not the folder itself) into the web root.
4. Confirm HTTPS is enabled, then check `https://YOUR-DOMAIN/api/health`.
5. Create an admin account with a locally generated password hash before publishing. See [CPANEL_DEPLOYMENT.md](./CPANEL_DEPLOYMENT.md) for the upload map and full checklist.

Do not publish database credentials in GitHub or source control. Rotate any database password that may have been committed before deployment.
