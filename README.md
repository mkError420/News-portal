# MK News Portal

A responsive Bangladeshi news portal built with React, Vite, and Tailwind CSS. The app includes:

- Newspaper-style homepage with breaking news ticker
- Dynamic category pages and article detail view
- Search-driven content discovery
- Secure admin dashboard with login and content management
- Local persistence using browser storage for demo CMS data

## Run locally

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 4173
```

Then open http://localhost:4173/

## Admin access

The database seed creates the admin account `admin@mknews.com`. Change its password before launch by replacing the seeded password hash in `backend/cpanel-database.sql` with a hash generated locally using PHP's `password_hash()`.

## Production build

```bash
npm run build
```

## Live hosting setup

The deployable web root is `cpanel-deploy/`. For InfinityFree, upload its contents into `htdocs/`; on standard cPanel hosting, use the domain's document root (usually `public_html/`).

1. Import `backend/cpanel-database.sql` into the database already created in your hosting panel.
2. Before upload, edit `cpanel-deploy/backend/config.php` and enter the database host, database name, user, and password in the matching constants.
3. Upload the contents of `cpanel-deploy/` (not the folder itself) into the web root.
4. Confirm HTTPS is enabled, then check `https://YOUR-DOMAIN/api/health`.
5. Change the seeded admin password before publishing. See [CPANEL_DEPLOYMENT.md](./CPANEL_DEPLOYMENT.md) for the upload map and full checklist.

Do not publish database credentials in GitHub or source control. Rotate the database password before deployment because it was shared in this conversation.
