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

The SQL dump is intentionally kept outside the web root. Import the project-root `backend/cpanel-database.sql` using phpMyAdmin before uploading the site.

## Before upload

1. Rotate the database password in the hosting control panel.
2. Set `DB_HOST`, `DB_NAME`, `DB_USER`, and `DB_PASS` in the hosting environment. If the host does not support environment variables, enter the values in the deployed `backend/config.php` only; keep that file private and never commit it.
3. Generate an admin password hash locally:

   ```sh
   php -r "echo password_hash('YOUR_NEW_ADMIN_PASSWORD', PASSWORD_DEFAULT), PHP_EOL;"
   ```

   After importing the SQL file, create an admin account in phpMyAdmin using the generated hash:

   ```sql
   INSERT INTO admins (email, password_hash)
   VALUES ('admin@YOUR-DOMAIN.com', 'PASTE_THE_GENERATED_HASH_HERE');
   ```

   The API validates passwords with `password_verify()`; the SQL seed intentionally does not create an account with a shared default password.
4. Build the React site and refresh the deployment directory:

   ```sh
   npm run build
   ```

   The deploy folder must contain the files from `dist/` plus the provided `.htaccess` and `backend/` PHP files.

## Upload and verify

1. For a **new database only**, select it in phpMyAdmin and import `backend/cpanel-database.sql`. This import recreates the tables. For an existing installation, back up the database and run `backend/migrate-bilingual.sql` once instead; do not reimport the dump over live data.
2. In the hosting file manager, upload the contents of `cpanel-deploy/` into the document root. Do not upload `node_modules/`, the SQL dump, or the project source tree.
3. Confirm Apache `.htaccess` overrides are enabled and HTTPS is active.
4. Open `https://YOUR-DOMAIN/api/health`. A working response includes `"status": "ok"` and `"database": "connected"`.
5. Open the homepage and `/admin`; sign in with the admin account and the password chosen in step 3.
6. Publish and delete a test article, then verify both changes remain after reloading the site.
7. Remove any temporary SQL dumps or exported backups from the web root.

## Notes

- The API and frontend use same-origin `/api` routes, so no domain-specific CORS setting is required.
- `backend/config.php` is denied as a direct web request by Apache rules.
- If the health endpoint fails, check the database host, database name, user privileges, password, and whether the hosting plan permits connections to that MySQL host.
- PHP needs PDO MySQL enabled. URL rewriting must be enabled for the SPA routes and `/api` endpoints.
