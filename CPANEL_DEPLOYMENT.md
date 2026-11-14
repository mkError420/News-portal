# InfinityFree / cPanel deployment checklist

## What goes on the server

Upload the **contents** of `cpanel-deploy/` into the hosting document root:

```text
htdocs/ or public_html/         # Document root
  .htaccess                     # Handles SPA routes, SEO rewrite rules, & caching
  index.php                     # Server-Side Pre-Renderer & Dynamic Meta Injector for Crawlers
  index.html                    # React SPA bundle template
  robots.txt                    # Search crawler instructions & Sitemap reference
  favicon.svg
  assets/                       # Built JS, CSS, and media bundles
  backend/
    .htaccess
    config.php                  # Add database credentials here (kept private)
    api/
      index.php                 # REST API, Sitemap, RSS, and ads.txt handler
```

For regular cPanel hosting, the document root is commonly `public_html/` instead of `htdocs/`.

The SQL dumps are kept in `backend/`.
- For **fresh installations**: import `backend/cpanel-database.sql`.
- For **existing live databases**: run `backend/migrate-seo.sql` once in phpMyAdmin.

---

## 🌟 Complete SEO & Google AdSense Features Included

1. **Google AdSense & Auto-Ads**:
   - In Admin Dashboard -> Settings (`/admin`), set your **AdSense Publisher ID** (`ca-pub-XXXXXXXXXXXXXXXX`).
   - Enable **Auto-Ads** with one click.
   - Configure individual responsive ad unit slots for Header, In-Article, and Sidebar.
   - Live `/ads.txt` is served dynamically at `https://yourdomain.com/ads.txt`.

2. **Article Dashboard SEO Studio**:
   - When writing or editing news in the Admin Dashboard, use the **SEO Studio**:
     - Custom **SEO Meta Title** with character meter (40-60 characters)
     - Custom **SEO Meta Description** with character meter (120-160 characters)
     - **Focus Target Keyword** optimization
     - **Schema.org Type** selection (`NewsArticle`, `OpinionNewsArticle`, `AnalysisNewsArticle`, `Report`)
     - **Real-Time Google SERP Simulator** (Live Desktop & Mobile preview)
     - **Real-time SEO Score & Checklist** (RankMath / Yoast style audit)

3. **Universal Search Engine & Social Media Crawlability**:
   - Server-Side Meta Tag Injection via `index.php` for WhatsApp, Facebook, Twitter, LinkedIn, and Googlebot.
   - **Dynamic XML Sitemap**: `https://yourdomain.com/sitemap.xml`
   - **Google News RSS Feed**: `https://yourdomain.com/rss.xml`
   - **Search Console Verification**: Set Google and Bing site verification codes in Settings.
   - **JSON-LD Structured Data**: `NewsArticle`, `WebSite` (SearchAction), `BreadcrumbList`, and `NewsMediaOrganization`.

---

## Before upload

1. Rotate the database password in the hosting control panel.
2. Set `DB_HOST`, `DB_NAME`, `DB_USER`, and `DB_PASS` in the hosting environment or in `backend/config.php`.
3. Generate an admin password hash locally:

   ```sh
   php -r "echo password_hash('YOUR_NEW_ADMIN_PASSWORD', PASSWORD_DEFAULT), PHP_EOL;"
   ```

   After importing the SQL file, create an admin account in phpMyAdmin using the generated hash:

   ```sql
   INSERT INTO admins (email, password_hash)
   VALUES ('admin@YOUR-DOMAIN.com', 'PASTE_THE_GENERATED_HASH_HERE');
   ```

4. Build the React site and refresh the deployment directory:

   ```sh
   npm run build
   ```

## Upload and verify

1. For a **new database**, import `backend/cpanel-database.sql`. For an existing installation, run `backend/migrate-seo.sql` in phpMyAdmin.
2. In the hosting file manager, upload the contents of `cpanel-deploy/` into the document root.
3. Open `https://YOUR-DOMAIN/api/health`. A working response includes `"status": "ok"` and `"database": "connected"`.
4. Open `https://YOUR-DOMAIN/sitemap.xml` and `https://YOUR-DOMAIN/ads.txt` to verify dynamic SEO endpoints.
5. Open the homepage and `/admin`; sign in with the admin account to manage news and configure your AdSense ID and SEO settings.

