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

## Admin credentials

- Email: admin@mknews.com
- Password: MKNews@2026

## Production build

```bash
npm run build
```

## cPanel MySQL setup

1. In cPanel, open MySQL Database Wizard.
2. Create a database such as `mknews_portal`.
3. Create a MySQL user such as `mknews_user`.
4. Assign the user full privileges to that database.
5. Import the SQL file at `backend/cpanel-database.sql` from phpMyAdmin or the cPanel SQL import tool.
6. In `backend/config.php`, update the values to match your cPanel database credentials:

```php
<?php
define('DB_HOST', 'localhost');
define('DB_NAME', 'mknews_portal');
define('DB_USER', 'mknews_user');
define('DB_PASS', 'StrongPassword123!');
define('CORS_ORIGIN', 'https://yourdomain.com');
define('ADMIN_EMAIL', 'admin@mknews.com');
define('ADMIN_PASSWORD', 'MKNews@2026');
```

7. Upload the contents of the `backend` folder to your cPanel document root or a subfolder and make sure Apache rewrites to the PHP router.

