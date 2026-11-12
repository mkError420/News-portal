# InfinityFree / cPanel deployment checklist

## What goes on the server

Upload the **contents** of `cpanel-deploy/` into the hosting document root:

```text
htdocs/                         # InfinityFree document root
  .htaccess
  index.html
  assets/
  backend/
    .htaccess
    config.php                  # add privately in the hosting file manager
    api/
      index.php
```

For regular cPanel hosting, the document root is commonly `public_html/` instead of `htdocs/`.

The SQL dump is intentionally not inside the web root. Import `backend/cpanel-database.sql` using phpMyAdmin before uploading the site.

## Before upload

1. Rotate the database password in the hosting control panel. Do not reuse the password shared in chat.
2. Edit `cpanel-deploy/backend/config.php` and enter the database connection details in the existing constants. Keep this file private and do not commit it.
3. Replace the seeded admin password hash in `backend/cpanel-database.sql` with a new hash generated locally, then import the SQL file. One way to generate a hash with PHP installed locally:

   ```sh
   php -r "echo password_hash('YOUR_NEW_ADMIN_PASSWORD', PASSWORD_DEFAULT), PHP_EOL;"
   ```

   Put the resulting hash in the `password_hash` value for `admin@mknews.com` in the SQL file. The API validates passwords with `password_verify()`.
4. Build the React site and refresh the deployment directory:

   ```sh
   npm run build
   ```

   The deploy folder must contain the files from `dist/` plus the provided `.htaccess` and `backend/` PHP files.

## Upload and verify

1. In phpMyAdmin, select the existing MySQL database and import `backend/cpanel-database.sql`.
2. In the hosting file manager, upload the contents of `cpanel-deploy/` into the document root. Do not upload `node_modules/`, the SQL dump, or the project source tree.
3. Confirm Apache `.htaccess` overrides are enabled and HTTPS is active.
4. Open `https://YOUR-DOMAIN/api/health`. A working response includes `"status": "ok"` and `"database": "ok"`.
5. Open the homepage and `/admin`; sign in with the admin account and the password chosen in step 3.
6. Publish and delete a test article, then verify both changes remain after reloading the site.
7. Remove any temporary SQL dumps or exported backups from the web root.

## Notes

- The API and frontend use same-origin `/api` routes, so no domain-specific CORS setting is required.
- `backend/config.php` is denied as a direct web request by Apache rules.
- If the health endpoint fails, check the database host, database name, user privileges, password, and whether the hosting plan permits connections to that MySQL host.
- PHP needs PDO MySQL enabled. URL rewriting must be enabled for the SPA routes and `/api` endpoints.
