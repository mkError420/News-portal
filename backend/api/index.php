<?php
/**
 * Modern REST API for Prothom Alo Clone News Portal
 * Supports Articles CRUD, Breaking News, Authentication, Stats, and Health checks.
 * Resilient schema handling for both legacy and bilingual MySQL databases.
 */

require_once __DIR__ . '/../config.php';

// --- Response Headers ---
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Session configuration for auth
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 86400 * 7, // 7 days
        'path' => '/',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function json_response($payload, $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

// Global exception handler
set_exception_handler(function (Throwable $exception): void {
    error_log('News Portal API Error: ' . $exception->getMessage());
    json_response([
        'success' => false,
        'message' => 'The server could not complete the request.'
    ], 500);
});

// Database connection helper
function db(): ?PDO
{
    static $pdo = null;
    static $failed = false;

    if ($failed) return null;

    if ($pdo === null) {
        if (trim(DB_HOST) === '' || trim(DB_NAME) === '' || trim(DB_USER) === '') {
            $failed = true;
            return null;
        }

        try {
            $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_TIMEOUT => 3,
            ]);
        } catch (Throwable $e) {
            $failed = true;
            return null;
        }
    }

    return $pdo;
}

function require_db(): PDO
{
    $connection = db();
    if (!$connection) {
        json_response([
            'success' => false,
            'message' => 'The database is unavailable. Check the server configuration and try again.'
        ], 503);
    }
    return $connection;
}

function has_column(PDO $pdo, string $table, string $column): bool
{
    static $columnsCache = [];
    if (!isset($columnsCache[$table])) {
        try {
            $stmt = $pdo->query("SHOW COLUMNS FROM `$table`");
            $columnsCache[$table] = array_column($stmt->fetchAll(), 'Field');
        } catch (Throwable $e) {
            $columnsCache[$table] = [];
        }
    }
    return in_array($column, $columnsCache[$table], true);
}

function auto_migrate_seo(PDO $pdo): void
{
    static $done = false;
    if ($done) return;
    $done = true;

    $seoCols = [
        'seo_title' => "VARCHAR(255) NULL DEFAULT ''",
        'seo_description' => "TEXT NULL",
        'focus_keyword' => "VARCHAR(150) NULL DEFAULT ''",
        'canonical_url' => "VARCHAR(500) NULL DEFAULT ''",
        'og_image' => "VARCHAR(500) NULL DEFAULT ''",
        'schema_type' => "VARCHAR(50) NULL DEFAULT 'NewsArticle'"
    ];
    foreach ($seoCols as $colName => $colDef) {
        if (!has_column($pdo, 'articles', $colName)) {
            try {
                $pdo->exec("ALTER TABLE `articles` ADD COLUMN `$colName` $colDef");
            } catch (Throwable $e) {
                // Ignore if lacks ALTER permissions
            }
        }
    }
}

function get_auth_token(): string
{
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? '');
    if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
        return trim($matches[1]);
    }
    return trim($headers['X-Admin-Token'] ?? $headers['x-admin-token'] ?? ($_SERVER['HTTP_X_ADMIN_TOKEN'] ?? ''));
}

function verify_admin_token(string $token): ?array
{
    if (empty($token)) return null;
    $parts = explode('.', $token);
    if (count($parts) !== 2) return null;
    [$payloadB64, $signature] = $parts;
    $payloadJson = base64_decode(strtr($payloadB64, '-_', '+/'));
    if (!$payloadJson) return null;
    $payload = json_decode($payloadJson, true);
    if (!is_array($payload) || empty($payload['id']) || empty($payload['email'])) return null;
    $secret = 'newsportal_auth_secret_token_key_2026';
    $expectedSig = hash_hmac('sha256', $payloadB64, $secret);
    if (!hash_equals($expectedSig, $signature)) return null;
    return $payload;
}

function create_admin_token(int $id, string $email): string
{
    $payload = [
        'id' => $id,
        'email' => $email,
        'time' => time(),
    ];
    $payloadB64 = rtrim(strtr(base64_encode(json_encode($payload)), '+/', '-_'), '=');
    $secret = 'newsportal_auth_secret_token_key_2026';
    $signature = hash_hmac('sha256', $payloadB64, $secret);
    return $payloadB64 . '.' . $signature;
}

function is_admin(): bool
{
    if (!empty($_SESSION['admin_authenticated'])) {
        return true;
    }
    $token = get_auth_token();
    if (!empty($token)) {
        $verified = verify_admin_token($token);
        if ($verified) {
            $_SESSION['admin_authenticated'] = true;
            $_SESSION['admin_id'] = (int) $verified['id'];
            $_SESSION['admin_email'] = $verified['email'];
            return true;
        }
        if (session_id() && $token === session_id()) {
            return true;
        }
    }
    return false;
}

function normalize_tags($tags): array
{
    if (is_array($tags)) {
        return array_values(array_filter(array_map('trim', $tags), fn ($tag) => $tag !== ''));
    }
    if (is_string($tags)) {
        return array_values(array_filter(array_map('trim', explode(',', $tags)), fn ($tag) => $tag !== ''));
    }
    return [];
}

function serialize_article(array $row): array
{
    $tagsBn = json_decode($row['tags_bn'] ?? ($row['tags'] ?? '[]'), true) ?: [];
    $tagsEn = json_decode($row['tags_en'] ?? ($row['tags'] ?? '[]'), true) ?: [];

    return [
        'id' => (int) $row['id'],
        'slug' => $row['slug'] ?? ('news-' . $row['id']),
        'title_bn' => $row['title_bn'] ?? ($row['title'] ?? ''),
        'title_en' => $row['title_en'] ?? ($row['title'] ?? ''),
        'category' => $row['category'] ?? 'national',
        'subheadline_bn' => $row['subheadline_bn'] ?? ($row['subheadline'] ?? ''),
        'subheadline_en' => $row['subheadline_en'] ?? ($row['subheadline'] ?? ''),
        'summary_bn' => $row['summary_bn'] ?? ($row['summary'] ?? ''),
        'summary_en' => $row['summary_en'] ?? ($row['summary'] ?? ''),
        'author_bn' => $row['author_bn'] ?? ($row['author'] ?? 'প্রথম আলো ডেস্ক'),
        'author_en' => $row['author_en'] ?? ($row['author'] ?? 'Staff Reporter'),
        'author_role_bn' => $row['author_role_bn'] ?? ($row['author_role'] ?? 'প্রতিবেদক'),
        'author_role_en' => $row['author_role_en'] ?? 'Reporter',
        'image' => $row['image'] ?? 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=80',
        'imageCaption' => $row['image_caption'] ?? '',
        'imageCredit' => $row['image_credit'] ?? '',
        'date' => $row['published_at'] ?? date('c'),
        'readTime' => $row['read_time'] ?? '4 min read',
        'views' => (int) ($row['views'] ?? 0),
        'featured' => (bool) ($row['featured'] ?? 0),
        'tags_bn' => $tagsBn,
        'tags_en' => $tagsEn,
        'content_bn' => $row['content_bn'] ?? ($row['content'] ?? ''),
        'content_en' => $row['content_en'] ?? ($row['content'] ?? ''),
        'seo_title' => $row['seo_title'] ?? '',
        'seo_description' => $row['seo_description'] ?? '',
        'focus_keyword' => $row['focus_keyword'] ?? '',
        'canonical_url' => $row['canonical_url'] ?? '',
        'og_image' => $row['og_image'] ?? '',
        'schema_type' => !empty($row['schema_type']) ? $row['schema_type'] : 'NewsArticle',
    ];
}

// Parse request route
$route = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$route = preg_replace('#/+#', '/', $route);
$segments = array_values(array_filter(explode('/', trim($route, '/')), fn ($s) => $s !== ''));

$apiIndex = array_search('api', $segments);
if ($apiIndex === false) {
    if (isset($_GET['endpoint'])) {
        $resource = trim($_GET['endpoint']);
    } else {
        $lastSeg = end($segments);
        if (in_array($lastSeg, ['sitemap.xml', 'sitemap', 'rss.xml', 'rss', 'feed', 'ads.txt', 'ads-txt'], true)) {
            $resource = str_replace(['.xml', '.txt'], '', $lastSeg);
        } else {
            json_response(['message' => 'Invalid route'], 404);
        }
    }
} else {
    $resource = $segments[$apiIndex + 1] ?? null;
}

$method = $_SERVER['REQUEST_METHOD'];

// ----------------------------------------------------
// ROUTE: Dynamic XML Sitemap (/sitemap.xml or /api/sitemap)
// ----------------------------------------------------
if ($resource === 'sitemap' || $resource === 'sitemap.xml') {
    header('Content-Type: application/xml; charset=utf-8');
    $dbConn = db();
    $articles = [];
    if ($dbConn) {
        try {
            auto_migrate_seo($dbConn);
            $stmt = $dbConn->query("SELECT slug, published_at, updated_at, image, title_bn, title_en FROM articles ORDER BY published_at DESC LIMIT 1000");
            $articles = $stmt->fetchAll();
        } catch (Throwable $e) {}
    }

    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
    $baseUrl = rtrim($protocol . ($_SERVER['HTTP_HOST'] ?? 'localhost'), '/');

    echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' . "\n";

    // 1. Homepage
    echo "  <url>\n";
    echo "    <loc>" . htmlspecialchars($baseUrl . '/') . "</loc>\n";
    echo "    <changefreq>always</changefreq>\n";
    echo "    <priority>1.0</priority>\n";
    echo "  </url>\n";

    // 2. Main Categories
    $categories = ['national', 'politics', 'international', 'economy', 'business', 'sports', 'entertainment', 'technology', 'education', 'health', 'lifestyle', 'opinion', 'photos', 'video', 'epaper'];
    foreach ($categories as $cat) {
        echo "  <url>\n";
        echo "    <loc>" . htmlspecialchars($baseUrl . '/category/' . $cat) . "</loc>\n";
        echo "    <changefreq>hourly</changefreq>\n";
        echo "    <priority>0.8</priority>\n";
        echo "  </url>\n";
    }

    // 3. Static Pages
    foreach (['about', 'contact', 'privacy', 'terms', 'advertise'] as $sp) {
        echo "  <url>\n";
        echo "    <loc>" . htmlspecialchars($baseUrl . '/' . $sp) . "</loc>\n";
        echo "    <changefreq>monthly</changefreq>\n";
        echo "    <priority>0.5</priority>\n";
        echo "  </url>\n";
    }

    // 4. Articles
    foreach ($articles as $art) {
        $slug = $art['slug'];
        $lastmod = !empty($art['updated_at']) ? date('c', strtotime($art['updated_at'])) : (!empty($art['published_at']) ? date('c', strtotime($art['published_at'])) : date('c'));
        $title = htmlspecialchars(!empty($art['title_bn']) ? $art['title_bn'] : ($art['title_en'] ?? ''));
        $img = !empty($art['image']) ? htmlspecialchars($art['image']) : '';
        echo "  <url>\n";
        echo "    <loc>" . htmlspecialchars($baseUrl . '/article/' . $slug) . "</loc>\n";
        echo "    <lastmod>" . $lastmod . "</lastmod>\n";
        echo "    <changefreq>daily</changefreq>\n";
        echo "    <priority>0.9</priority>\n";
        if ($img !== '') {
            echo "    <image:image>\n";
            echo "      <image:loc>" . $img . "</image:loc>\n";
            echo "      <image:title>" . $title . "</image:title>\n";
            echo "    </image:image>\n";
        }
        echo "  </url>\n";
    }

    echo '</urlset>';
    exit;
}

// ----------------------------------------------------
// ROUTE: Dynamic RSS Feed (/rss.xml or /feed or /api/rss)
// ----------------------------------------------------
if ($resource === 'rss' || $resource === 'rss.xml' || $resource === 'feed') {
    header('Content-Type: application/rss+xml; charset=utf-8');
    $dbConn = db();
    $articles = [];
    if ($dbConn) {
        try {
            $stmt = $dbConn->query("SELECT * FROM articles ORDER BY published_at DESC LIMIT 50");
            $articles = $stmt->fetchAll();
        } catch (Throwable $e) {}
    }
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
    $baseUrl = rtrim($protocol . ($_SERVER['HTTP_HOST'] ?? 'localhost'), '/');

    echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    echo '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">' . "\n";
    echo '<channel>' . "\n";
    echo '  <title>প্রথম আলো | Prothom Alo</title>' . "\n";
    echo '  <link>' . htmlspecialchars($baseUrl) . '</link>' . "\n";
    echo '  <description>অনলাইন সংস্করণ • সত্যের সন্ধানে নির্ভীক</description>' . "\n";
    echo '  <language>bn</language>' . "\n";
    echo '  <atom:link href="' . htmlspecialchars($baseUrl . '/rss.xml') . '" rel="self" type="application/rss+xml" />' . "\n";

    foreach ($articles as $art) {
        $title = htmlspecialchars($art['title_bn'] ?? ($art['title'] ?? ''));
        $summary = htmlspecialchars($art['summary_bn'] ?? ($art['summary'] ?? ''));
        $link = htmlspecialchars($baseUrl . '/article/' . $art['slug']);
        $pubDate = !empty($art['published_at']) ? date(DATE_RSS, strtotime($art['published_at'])) : date(DATE_RSS);
        $author = htmlspecialchars($art['author_bn'] ?? 'প্রথম আলো');

        echo "  <item>\n";
        echo "    <title><![CDATA[" . $title . "]]></title>\n";
        echo "    <link>" . $link . "</link>\n";
        echo "    <guid isPermaLink=\"true\">" . $link . "</guid>\n";
        echo "    <pubDate>" . $pubDate . "</pubDate>\n";
        echo "    <author>" . $author . "</author>\n";
        echo "    <description><![CDATA[" . $summary . "]]></description>\n";
        if (!empty($art['image'])) {
            echo "    <enclosure url=\"" . htmlspecialchars($art['image']) . "\" type=\"image/jpeg\" />\n";
        }
        echo "  </item>\n";
    }
    echo '</channel>' . "\n";
    echo '</rss>';
    exit;
}

// ----------------------------------------------------
// ROUTE: Dynamic Google AdSense ads.txt (/ads.txt or /api/ads-txt)
// ----------------------------------------------------
if ($resource === 'ads-txt' || $resource === 'ads.txt') {
    header('Content-Type: text/plain; charset=utf-8');
    $dbConn = db();
    $content = '';
    if ($dbConn) {
        try {
            $stmt = $dbConn->prepare("SELECT setting_value FROM settings WHERE setting_key = 'ads_txt_content' LIMIT 1");
            $stmt->execute();
            $content = (string) $stmt->fetchColumn();
        } catch (Throwable $e) {}
    }
    if (trim($content) === '') {
        $clientId = '';
        if ($dbConn) {
            try {
                $stmt = $dbConn->prepare("SELECT setting_value FROM settings WHERE setting_key = 'adsense_client_id' LIMIT 1");
                $stmt->execute();
                $clientId = trim((string) $stmt->fetchColumn());
            } catch (Throwable $e) {}
        }
        if ($clientId !== '') {
            $pubId = str_replace('ca-', '', $clientId);
            $content = "google.com, " . $pubId . ", DIRECT, f08c47fec0942fa0";
        } else {
            $content = "# Google AdSense ads.txt\n# Example: google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0";
        }
    }
    echo $content;
    exit;
}

// ----------------------------------------------------
// ROUTE: GET /api/health
// ----------------------------------------------------
if ($resource === 'health') {
    $dbConn = db();
    $dbOk = false;
    if ($dbConn) {
        $dbConn->query('SELECT 1');
        $dbOk = true;
    }

    json_response([
        'status' => $dbOk ? 'ok' : 'degraded',
        'php' => PHP_VERSION,
        'database' => $dbOk ? 'connected' : 'unavailable',
        'authenticated' => is_admin(),
        'server_time' => date('c'),
    ]);
}

// ----------------------------------------------------
// ROUTE: POST /api/login
// ----------------------------------------------------
if ($resource === 'login' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $email = strtolower(trim((string) ($input['email'] ?? ($input['username'] ?? ''))));
    $password = (string) ($input['password'] ?? '');

    $dbConn = require_db();

    // Auto-seed default admin if table is empty
    try {
        $count = (int) $dbConn->query('SELECT COUNT(*) FROM admins')->fetchColumn();
        if ($count === 0) {
            $defaultHash = password_hash('admin123', PASSWORD_BCRYPT);
            $seedStmt = $dbConn->prepare('INSERT INTO admins (email, password_hash) VALUES (?, ?)');
            $seedStmt->execute(['admin@prothomalo.com', $defaultHash]);
        }
    } catch (Throwable $e) {}

    // Allow 'admin' as an alias for 'admin@prothomalo.com'
    $lookupEmail = ($email === 'admin') ? 'admin@prothomalo.com' : $email;

    $stmt = $dbConn->prepare('SELECT id, email, password_hash FROM admins WHERE email = ? LIMIT 1');
    $stmt->execute([$lookupEmail]);
    $adminUser = $stmt->fetch();

    // If still not found and default credentials provided, auto-create
    if (!$adminUser && in_array($email, ['admin@prothomalo.com', 'admin', 'admin@example.com'], true) && $password === 'admin123') {
        $defaultHash = password_hash('admin123', PASSWORD_BCRYPT);
        $ins = $dbConn->prepare('INSERT INTO admins (email, password_hash) VALUES (?, ?)');
        $ins->execute([$lookupEmail, $defaultHash]);
        $adminUser = ['id' => (int)$dbConn->lastInsertId(), 'email' => $lookupEmail, 'password_hash' => $defaultHash];
    }

    if ($adminUser && password_verify($password, $adminUser['password_hash'])) {
        session_regenerate_id(true);
        $_SESSION['admin_authenticated'] = true;
        $_SESSION['admin_id'] = (int) $adminUser['id'];
        $_SESSION['admin_email'] = $adminUser['email'];

        $token = create_admin_token((int) $adminUser['id'], $adminUser['email']);

        json_response([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $_SESSION['admin_id'],
                'email' => $_SESSION['admin_email'],
                'name' => 'Administrator',
                'role' => 'superadmin',
            ],
            'token' => $token,
        ]);
    }

    json_response(['success' => false, 'message' => 'Invalid email or password'], 401);
}

// ----------------------------------------------------
// ROUTE: GET /api/me
// ----------------------------------------------------
if ($resource === 'me' && $method === 'GET') {
    $auth = is_admin();
    json_response([
        'authenticated' => $auth,
        'user' => $auth ? [
            'id' => $_SESSION['admin_id'] ?? 1,
            'email' => $_SESSION['admin_email'] ?? '',
            'name' => 'Administrator',
            'role' => 'superadmin',
        ] : null,
    ]);
}

// ----------------------------------------------------
// ROUTE: POST /api/logout
// ----------------------------------------------------
if ($resource === 'logout' && $method === 'POST') {
    $_SESSION = [];
    if (session_id()) session_destroy();
    json_response(['success' => true, 'message' => 'Logged out successfully']);
}

// ----------------------------------------------------
// ROUTE: /api/categories (Full Dynamic Categories CRUD)
// ----------------------------------------------------
if ($resource === 'categories') {
    $dbConn = require_db();

    // Auto-migrate categories table if name_bn / name_en columns are missing
    $hasNameBn = false;
    try {
        $hasNameBn = has_column($dbConn, 'categories', 'name_bn');
        if (!$hasNameBn) {
            $dbConn->exec("ALTER TABLE `categories` ADD COLUMN `name_bn` VARCHAR(150) NULL AFTER `name`, ADD COLUMN `name_en` VARCHAR(150) NULL AFTER `name_bn`");
            $hasNameBn = true;
        }
    } catch (Throwable $e) {
        $hasNameBn = has_column($dbConn, 'categories', 'name_bn');
    }

    $defaultCatDict = [
        'national'      => ['bn' => 'বাংলাদেশ', 'en' => 'National'],
        'politics'      => ['bn' => 'রাজনীতি', 'en' => 'Politics'],
        'international' => ['bn' => 'আন্তর্জাতিক', 'en' => 'International'],
        'economy'       => ['bn' => 'অর্থনীতি', 'en' => 'Economy'],
        'business'      => ['bn' => 'বাণিজ্য', 'en' => 'Business'],
        'sports'        => ['bn' => 'খেলা', 'en' => 'Sports'],
        'entertainment' => ['bn' => 'বিনোদন', 'en' => 'Entertainment'],
        'technology'    => ['bn' => 'প্রযুক্তি', 'en' => 'Technology'],
        'education'     => ['bn' => 'শিক্ষা', 'en' => 'Education'],
        'health'        => ['bn' => 'স্বাস্থ্য', 'en' => 'Health'],
        'lifestyle'     => ['bn' => 'জীবনযাপন', 'en' => 'Lifestyle'],
        'opinion'       => ['bn' => 'মতামত', 'en' => 'Opinion'],
        'photos'        => ['bn' => 'আলোকচিত্র', 'en' => 'Photos'],
        'photo'         => ['bn' => 'আলোকচিত্র', 'en' => 'Photos'],
        'video'         => ['bn' => 'ভিডিও', 'en' => 'Video'],
        'videos'        => ['bn' => 'ভিডিও', 'en' => 'Video'],
        'epaper'        => ['bn' => 'ই-পেপার', 'en' => 'ePaper'],
    ];

    if ($method === 'GET') {
        $stmt = $dbConn->query('SELECT * FROM categories ORDER BY id ASC');
        $rows = $stmt->fetchAll();
        $cats = array_map(function ($r) use ($hasNameBn, $defaultCatDict, $dbConn) {
            $slug = strtolower(trim((string) ($r['slug'] ?? '')));
            $rawBn = (string) ($hasNameBn ? ($r['name_bn'] ?? '') : '');
            $rawEn = (string) ($hasNameBn ? ($r['name_en'] ?? '') : '');
            $rawName = (string) ($r['name'] ?? '');

            $hasBnChars = preg_match('/[\x{0980}-\x{09FF}]/u', $rawBn);
            $nameHasBnChars = preg_match('/[\x{0980}-\x{09FF}]/u', $rawName);

            if ($hasBnChars) {
                $nameBn = $rawBn;
            } elseif ($nameHasBnChars) {
                $nameBn = $rawName;
            } elseif (isset($defaultCatDict[$slug])) {
                $nameBn = $defaultCatDict[$slug]['bn'];
            } else {
                $nameBn = $rawBn ?: ($rawName ?: $slug);
            }

            if (!empty($rawEn) && !preg_match('/[\x{0980}-\x{09FF}]/u', $rawEn)) {
                $nameEn = $rawEn;
            } elseif (isset($defaultCatDict[$slug])) {
                $nameEn = $defaultCatDict[$slug]['en'];
            } elseif (!empty($rawName) && !preg_match('/[\x{0980}-\x{09FF}]/u', $rawName)) {
                $nameEn = $rawName;
            } else {
                $nameEn = $rawEn ?: $slug;
            }

            // Proactively update DB row if name_bn was missing or English
            if ($hasNameBn && !$hasBnChars && isset($defaultCatDict[$slug]) && !empty($r['id'])) {
                try {
                    $up = $dbConn->prepare('UPDATE categories SET name_bn = ?, name_en = ?, name = ? WHERE id = ?');
                    $up->execute([$nameBn, $nameEn, $nameBn, $r['id']]);
                } catch (Throwable $e) {}
            }

            return [
                'id' => (int) $r['id'],
                'name_bn' => $nameBn,
                'name_en' => $nameEn,
                'name' => $nameBn,
                'slug' => $slug,
            ];
        }, $rows);
        json_response(['categories' => $cats]);
    }

    if ($method === 'POST') {
        if (!is_admin()) json_response(['message' => 'Unauthorized'], 401);
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $nameBn = trim((string) ($input['name_bn'] ?? ($input['name'] ?? '')));
        $nameEn = trim((string) ($input['name_en'] ?? ''));
        $slug = strtolower(trim((string) ($input['slug'] ?? '')));

        if ($nameEn === '' && isset($defaultCatDict[$slug])) {
            $nameEn = $defaultCatDict[$slug]['en'];
        }
        if ($nameEn === '') {
            $nameEn = $nameBn;
        }

        if ($slug === '') {
            $slug = preg_replace('/[^a-z0-9]+/i', '-', strtolower($nameEn ?: $nameBn));
            $slug = trim($slug, '-');
        }
        if ($nameBn === '' || $slug === '') {
            json_response(['success' => false, 'message' => 'Category name and slug are required.'], 400);
        }

        if ($hasNameBn) {
            $stmt = $dbConn->prepare('INSERT INTO categories (name, name_bn, name_en, slug) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), name_bn = VALUES(name_bn), name_en = VALUES(name_en)');
            $stmt->execute([$nameBn, $nameBn, $nameEn, $slug]);
        } else {
            $stmt = $dbConn->prepare('INSERT INTO categories (name, slug) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)');
            $stmt->execute([$nameBn, $slug]);
        }
        $id = (int) $dbConn->lastInsertId();
        json_response([
            'success' => true,
            'category' => [
                'id' => $id > 0 ? $id : time(),
                'name_bn' => $nameBn,
                'name_en' => $nameEn,
                'name' => $nameBn,
                'slug' => $slug,
            ]
        ]);
    }

    if ($method === 'DELETE') {
        if (!is_admin()) json_response(['message' => 'Unauthorized'], 401);
        $id = (int) ($_GET['id'] ?? 0);
        $slug = trim((string) ($_GET['slug'] ?? ''));
        if ($id > 0) {
            $stmt = $dbConn->prepare('DELETE FROM categories WHERE id = ?');
            $stmt->execute([$id]);
        } elseif ($slug !== '') {
            $stmt = $dbConn->prepare('DELETE FROM categories WHERE slug = ?');
            $stmt->execute([$slug]);
        } else {
            json_response(['success' => false, 'message' => 'Valid category ID or slug required.'], 400);
        }
        json_response(['success' => true, 'message' => 'Category deleted successfully.']);
    }
}

// ----------------------------------------------------
// ROUTE: /api/settings (Dynamic Website Name & Details)
// ----------------------------------------------------
if ($resource === 'settings') {
    $defaultSettings = [
        'site_name_bn' => 'প্রথম আলো',
        'site_name_en' => 'Prothom Alo',
        'tagline_bn' => 'অনলাইন সংস্করণ • সত্যের সন্ধানে নির্ভীক',
        'tagline_en' => 'Online Edition • Fearless in Pursuit of Truth',
        'logo_url' => '',
        'favicon_url' => '',
        'editor_bn' => 'সম্পাদক ও প্রকাশক: মতিউর রহমান',
        'editor_en' => 'Editor & Publisher: Matiur Rahman',
        'about_bn' => 'প্রথম আলো বাংলাদেশের সর্বাধিক পঠিত ও জনপ্রিয় বাংলা দৈনিক ও অনলাইন সংবাদমাধ্যম। নিরপেক্ষ ও বস্তুনিষ্ঠ সাংবাদিকতাই আমাদের মূল শক্তি।',
        'about_en' => 'Prothom Alo is the leading and most trusted news publication in Bangladesh, delivering impartial and accurate news 24/7.',
        'address_bn' => 'প্রগতি ইনস্যুরেন্স ভবন, ২০-২১ কারওয়ান বাজার, ঢাকা ১২১৫, বাংলাদেশ',
        'address_en' => 'Pragati Insurance Bhaban, 20-21 Karwan Bazar, Dhaka 1215, Bangladesh',
        'phone' => '+৮৮০ ২ ৮১৮০০৭৮-৮১',
        'email' => 'info@prothomalo.com',
        'ad_email' => 'ads@prothomalo.com',
        'facebook_url' => 'https://facebook.com/DailyProthomAlo',
        'twitter_url' => 'https://twitter.com/ProthomAlo',
        'youtube_url' => 'https://youtube.com/c/ProthomAlo',
        'instagram_url' => 'https://instagram.com/prothomalo',
        'linkedin_url' => 'https://linkedin.com/company/prothom-alo',
        'copyright_bn' => 'স্বত্ব © ২০২৬ প্রথম আলো | সর্বস্বত্ব সংরক্ষিত।',
        'copyright_en' => 'Copyright © 2026 Prothom Alo | All rights reserved.',
        'edition_bn' => 'বাংলাদেশ',
        'edition_en' => 'Bangladesh',
        'adsense_enabled' => '0',
        'adsense_client_id' => '',
        'adsense_auto_ads' => '1',
        'adsense_header_slot' => '',
        'adsense_article_slot' => '',
        'adsense_sidebar_slot' => '',
        'adsense_footer_slot' => '',
        'ads_txt_content' => "google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0",
        'google_site_verification' => '',
        'bing_site_verification' => '',
        'canonical_base_url' => '',
        'meta_keywords_default' => 'সংবাদ, বাংলাদেশ, প্রথম আলো, খবর, ব্রেকিং নিউজ, News, Bangladesh',
        'og_image_default' => '',
    ];

    $cacheFile = __DIR__ . '/settings.json';
    $dbConn = db();

    if ($method === 'GET') {
        $loadedSettings = $defaultSettings;

        if ($dbConn) {
            try {
                $dbConn->exec("CREATE TABLE IF NOT EXISTS `settings` (
                    `setting_key` VARCHAR(100) NOT NULL PRIMARY KEY,
                    `setting_value` TEXT NOT NULL,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

                $stmt = $dbConn->query("SELECT setting_key, setting_value FROM `settings`");
                $rows = $stmt->fetchAll();
                if (!empty($rows)) {
                    foreach ($rows as $r) {
                        $loadedSettings[$r['setting_key']] = $r['setting_value'];
                    }
                } else {
                    // Seed defaults into settings table
                    $ins = $dbConn->prepare("INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`)");
                    foreach ($defaultSettings as $k => $v) {
                        $ins->execute([$k, (string) $v]);
                    }
                }
            } catch (Throwable $e) {
                // Ignore DB error, fall back to cache
            }
        } elseif (file_exists($cacheFile)) {
            $cached = json_decode(file_get_contents($cacheFile), true);
            if (is_array($cached)) {
                $loadedSettings = array_merge($loadedSettings, $cached);
            }
        }

        json_response([
            'success' => true,
            'settings' => $loadedSettings
        ]);
    }

    if ($method === 'POST' || $method === 'PUT') {
        if (!is_admin()) json_response(['message' => 'Unauthorized'], 401);
        $input = json_decode(file_get_contents('php://input'), true) ?: [];

        $settingsToSave = [];
        foreach ($defaultSettings as $key => $defaultVal) {
            if (isset($input[$key])) {
                $settingsToSave[$key] = trim((string) $input[$key]);
            }
        }

        foreach ($input as $k => $v) {
            if (is_scalar($v) && strlen($k) < 100 && !isset($settingsToSave[$k])) {
                $settingsToSave[$k] = trim((string) $v);
            }
        }

        if ($dbConn) {
            try {
                $dbConn->exec("CREATE TABLE IF NOT EXISTS `settings` (
                    `setting_key` VARCHAR(100) NOT NULL PRIMARY KEY,
                    `setting_value` TEXT NOT NULL,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

                $stmt = $dbConn->prepare("INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`)");
                foreach ($settingsToSave as $k => $v) {
                    $stmt->execute([$k, (string) $v]);
                }
            } catch (Throwable $e) {
                // Log and continue
            }
        }

        @file_put_contents($cacheFile, json_encode($settingsToSave, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        json_response([
            'success' => true,
            'message' => 'Website settings saved successfully.',
            'settings' => array_merge($defaultSettings, $settingsToSave)
        ]);
    }
}

// ----------------------------------------------------
// ROUTE: /api/breaking-news
// ----------------------------------------------------
if ($resource === 'breaking-news') {
    $dbConn = require_db();

    if ($method === 'GET') {
        $hasActive = has_column($dbConn, 'breaking_news', 'active');
        $hasTitleBn = has_column($dbConn, 'breaking_news', 'title_bn');

        $where = $hasActive ? 'WHERE active = 1' : '';
        $stmt = $dbConn->query("SELECT * FROM breaking_news $where ORDER BY id DESC");
        $items = array_map(function ($r) use ($hasTitleBn) {
            $titleBn = $hasTitleBn ? ($r['title_bn'] ?? '') : ($r['title'] ?? '');
            $titleEn = $hasTitleBn ? ($r['title_en'] ?? $titleBn) : ($r['title'] ?? '');
            return [
                'id' => (int) $r['id'],
                'title_bn' => $titleBn,
                'title_en' => $titleEn,
                'slug' => $r['slug'] ?? ('breaking-' . $r['id']),
            ];
        }, $stmt->fetchAll());
        json_response(['breakingNews' => $items]);
    }

    if ($method === 'POST') {
        if (!is_admin()) json_response(['message' => 'Unauthorized'], 401);
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $titleBn = trim((string) ($input['title_bn'] ?? ($input['title'] ?? '')));
        $titleEn = trim((string) ($input['title_en'] ?? $titleBn));
        if ($titleBn === '' && $titleEn === '') {
            json_response(['success' => false, 'message' => 'A breaking-news headline is required.'], 400);
        }
        $slug = 'breaking-' . time();

        $hasTitleBn = has_column($dbConn, 'breaking_news', 'title_bn');
        $hasActive = has_column($dbConn, 'breaking_news', 'active');

        if ($hasTitleBn) {
            $sql = $hasActive
                ? 'INSERT INTO breaking_news (title_bn, title_en, slug, active) VALUES (?, ?, ?, 1)'
                : 'INSERT INTO breaking_news (title_bn, title_en, slug) VALUES (?, ?, ?)';
            $stmt = $dbConn->prepare($sql);
            $stmt->execute([$titleBn, $titleEn, $slug]);
        } else {
            $stmt = $dbConn->prepare('INSERT INTO breaking_news (title, slug) VALUES (?, ?)');
            $stmt->execute([$titleBn, $slug]);
        }
        $id = (int) $dbConn->lastInsertId();
        json_response([
            'success' => true,
            'item' => ['id' => $id, 'title_bn' => $titleBn, 'title_en' => $titleEn, 'slug' => $slug]
        ]);
    }

    if ($method === 'DELETE') {
        if (!is_admin()) json_response(['message' => 'Unauthorized'], 401);
        $id = (int) ($_GET['id'] ?? 0);
        if ($id < 1) {
            json_response(['success' => false, 'message' => 'A valid breaking-news ID is required.'], 400);
        }
        $stmt = $dbConn->prepare('DELETE FROM breaking_news WHERE id = ?');
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            json_response(['success' => false, 'message' => 'Breaking news was not found.'], 404);
        }
        json_response(['success' => true, 'deletedId' => $id]);
    }
}

// ----------------------------------------------------
// ROUTE: /api/articles
// ----------------------------------------------------
if ($resource === 'articles') {
    $dbConn = require_db();

    // GET ALL ARTICLES
    if ($method === 'GET') {
        $stmt = $dbConn->query('SELECT * FROM articles ORDER BY published_at DESC');
        $items = array_map(fn ($row) => serialize_article($row), $stmt->fetchAll());
        json_response(['articles' => $items]);
    }

    // INCREMENT ARTICLE VIEW COUNT
    if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'view') {
        $id = (int) ($_GET['id'] ?? 0);
        if ($id > 0) {
            $stmt = $dbConn->prepare('UPDATE articles SET views = views + 1 WHERE id = ?');
            $stmt->execute([$id]);
        }
        json_response(['success' => true]);
    }

    // CREATE OR UPDATE ARTICLE
    if ($method === 'POST' || $method === 'PUT') {
        if (!is_admin()) json_response(['message' => 'Unauthorized'], 401);

        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $titleBn = trim((string) ($input['title_bn'] ?? ($input['title'] ?? '')));
        $titleEn = trim((string) ($input['title_en'] ?? $titleBn));
        $titleBn = $titleBn !== '' ? $titleBn : $titleEn;
        $titleEn = $titleEn !== '' ? $titleEn : $titleBn;
        $category = trim((string) ($input['category'] ?? 'national'));
        $summaryBn = trim((string) ($input['summary_bn'] ?? ($input['summary'] ?? '')));
        $summaryEn = trim((string) ($input['summary_en'] ?? $summaryBn));

        if ($titleBn === '') {
            json_response(['message' => 'Title is required'], 400);
        }

        $id = (int) ($input['id'] ?? 0);
        if ($method === 'PUT' && $id < 1) {
            json_response(['success' => false, 'message' => 'A valid article ID is required.'], 400);
        }
        $slug = trim((string) ($input['slug'] ?? ''));
        if ($slug === '') {
            $slug = 'news-' . time() . '-' . rand(100, 999);
        }

        auto_migrate_seo($dbConn);
        $hasBilingualCols = has_column($dbConn, 'articles', 'title_bn');
        $hasSeoCols = has_column($dbConn, 'articles', 'seo_title');

        $seoTitle = trim((string) ($input['seo_title'] ?? ''));
        $seoDescription = trim((string) ($input['seo_description'] ?? ''));
        $focusKeyword = trim((string) ($input['focus_keyword'] ?? ''));
        $canonicalUrl = trim((string) ($input['canonical_url'] ?? ''));
        $ogImage = trim((string) ($input['og_image'] ?? ''));
        $schemaType = trim((string) ($input['schema_type'] ?? 'NewsArticle'));
        if ($schemaType === '') $schemaType = 'NewsArticle';

        if ($method === 'PUT') {
            $exists = $dbConn->prepare('SELECT id FROM articles WHERE id = ?');
            $exists->execute([$id]);
            if (!$exists->fetch()) {
                json_response(['success' => false, 'message' => 'Article was not found.'], 404);
            }
                    if ($hasBilingualCols && $hasSeoCols) {
                        $sql = 'UPDATE articles SET title_bn = ?, title_en = ?, category = ?, subheadline_bn = ?, subheadline_en = ?,
                                summary_bn = ?, summary_en = ?, author_bn = ?, author_en = ?, author_role_bn = ?, author_role_en = ?,
                                image = ?, image_caption = ?, image_credit = ?, tags_bn = ?, tags_en = ?, featured = ?, content_bn = ?, content_en = ?,
                                seo_title = ?, seo_description = ?, focus_keyword = ?, canonical_url = ?, og_image = ?, schema_type = ?
                                WHERE id = ?';
                        $stmt = $dbConn->prepare($sql);
                        $stmt->execute([
                            $titleBn, $titleEn, $category,
                            (string) ($input['subheadline_bn'] ?? ''), (string) ($input['subheadline_en'] ?? ''),
                            $summaryBn, $summaryEn,
                            (string) ($input['author_bn'] ?? 'প্রথম আলো ডেস্ক'), (string) ($input['author_en'] ?? 'Staff Reporter'),
                            (string) ($input['author_role_bn'] ?? 'প্রতিবেদক'), (string) ($input['author_role_en'] ?? 'Reporter'),
                            (string) ($input['image'] ?? ''), (string) ($input['imageCaption'] ?? ''), (string) ($input['imageCredit'] ?? ''),
                            json_encode(normalize_tags($input['tags_bn'] ?? []), JSON_UNESCAPED_UNICODE),
                            json_encode(normalize_tags($input['tags_en'] ?? []), JSON_UNESCAPED_UNICODE),
                            !empty($input['featured']) ? 1 : 0,
                            (string) ($input['content_bn'] ?? ''), (string) ($input['content_en'] ?? ''),
                            $seoTitle, $seoDescription, $focusKeyword, $canonicalUrl, $ogImage, $schemaType,
                            $id
                        ]);
                    } elseif ($hasBilingualCols) {
                        $sql = 'UPDATE articles SET title_bn = ?, title_en = ?, category = ?, subheadline_bn = ?, subheadline_en = ?,
                                summary_bn = ?, summary_en = ?, author_bn = ?, author_en = ?, author_role_bn = ?, author_role_en = ?,
                                image = ?, image_caption = ?, image_credit = ?, tags_bn = ?, tags_en = ?, featured = ?, content_bn = ?, content_en = ?
                                WHERE id = ?';
                        $stmt = $dbConn->prepare($sql);
                        $stmt->execute([
                            $titleBn, $titleEn, $category,
                            (string) ($input['subheadline_bn'] ?? ''), (string) ($input['subheadline_en'] ?? ''),
                            $summaryBn, $summaryEn,
                            (string) ($input['author_bn'] ?? 'প্রথম আলো ডেস্ক'), (string) ($input['author_en'] ?? 'Staff Reporter'),
                            (string) ($input['author_role_bn'] ?? 'প্রতিবেদক'), (string) ($input['author_role_en'] ?? 'Reporter'),
                            (string) ($input['image'] ?? ''), (string) ($input['imageCaption'] ?? ''), (string) ($input['imageCredit'] ?? ''),
                            json_encode(normalize_tags($input['tags_bn'] ?? []), JSON_UNESCAPED_UNICODE),
                            json_encode(normalize_tags($input['tags_en'] ?? []), JSON_UNESCAPED_UNICODE),
                            !empty($input['featured']) ? 1 : 0,
                            (string) ($input['content_bn'] ?? ''), (string) ($input['content_en'] ?? ''),
                            $id
                        ]);
                    } else {
                        // Legacy schema
                        $sql = 'UPDATE articles SET title = ?, category = ?, subheadline = ?, summary = ?, author = ?,
                                author_role = ?, image = ?, image_caption = ?, image_credit = ?, tags = ?, featured = ?, content = ?
                                WHERE id = ?';
                        $stmt = $dbConn->prepare($sql);
                        $stmt->execute([
                            $titleBn, $category,
                            (string) ($input['subheadline_bn'] ?? ($input['subheadline'] ?? '')),
                            $summaryBn,
                            (string) ($input['author_bn'] ?? ($input['author'] ?? 'Staff Reporter')),
                            (string) ($input['author_role_bn'] ?? ($input['authorRole'] ?? 'Reporter')),
                            (string) ($input['image'] ?? ''), (string) ($input['imageCaption'] ?? ''), (string) ($input['imageCredit'] ?? ''),
                            json_encode(normalize_tags($input['tags_bn'] ?? ($input['tags'] ?? [])), JSON_UNESCAPED_UNICODE),
                            !empty($input['featured']) ? 1 : 0,
                            (string) ($input['content_bn'] ?? ($input['content'] ?? '')),
                            $id
                        ]);
                    }
            json_response(['success' => true, 'id' => $id]);
        } else {
                    // INSERT
                    if ($hasBilingualCols && $hasSeoCols) {
                        $sql = 'INSERT INTO articles (slug, title_bn, title_en, category, subheadline_bn, subheadline_en,
                                summary_bn, summary_en, author_bn, author_en, author_role_bn, author_role_en, image,
                                image_caption, image_credit, published_at, read_time, tags_bn, tags_en, featured, content_bn, content_en,
                                seo_title, seo_description, focus_keyword, canonical_url, og_image, schema_type)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                        $stmt = $dbConn->prepare($sql);
                        $stmt->execute([
                            $slug, $titleBn, $titleEn, $category,
                            (string) ($input['subheadline_bn'] ?? ''), (string) ($input['subheadline_en'] ?? ''),
                            $summaryBn, $summaryEn,
                            (string) ($input['author_bn'] ?? 'প্রথম আলো ডেস্ক'), (string) ($input['author_en'] ?? 'Staff Reporter'),
                            (string) ($input['author_role_bn'] ?? 'প্রতিবেদক'), (string) ($input['author_role_en'] ?? 'Reporter'),
                            (string) ($input['image'] ?? ''), (string) ($input['imageCaption'] ?? ''), (string) ($input['imageCredit'] ?? ''),
                            date('Y-m-d H:i:s'),
                            '4 min read',
                            json_encode(normalize_tags($input['tags_bn'] ?? []), JSON_UNESCAPED_UNICODE),
                            json_encode(normalize_tags($input['tags_en'] ?? []), JSON_UNESCAPED_UNICODE),
                            !empty($input['featured']) ? 1 : 0,
                            (string) ($input['content_bn'] ?? ''), (string) ($input['content_en'] ?? ''),
                            $seoTitle, $seoDescription, $focusKeyword, $canonicalUrl, $ogImage, $schemaType
                        ]);
                    } elseif ($hasBilingualCols) {
                        $sql = 'INSERT INTO articles (slug, title_bn, title_en, category, subheadline_bn, subheadline_en,
                                summary_bn, summary_en, author_bn, author_en, author_role_bn, author_role_en, image,
                                image_caption, image_credit, published_at, read_time, tags_bn, tags_en, featured, content_bn, content_en)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                        $stmt = $dbConn->prepare($sql);
                        $stmt->execute([
                            $slug, $titleBn, $titleEn, $category,
                            (string) ($input['subheadline_bn'] ?? ''), (string) ($input['subheadline_en'] ?? ''),
                            $summaryBn, $summaryEn,
                            (string) ($input['author_bn'] ?? 'প্রথম আলো ডেস্ক'), (string) ($input['author_en'] ?? 'Staff Reporter'),
                            (string) ($input['author_role_bn'] ?? 'প্রতিবেদক'), (string) ($input['author_role_en'] ?? 'Reporter'),
                            (string) ($input['image'] ?? ''), (string) ($input['imageCaption'] ?? ''), (string) ($input['imageCredit'] ?? ''),
                            date('Y-m-d H:i:s'),
                            '4 min read',
                            json_encode(normalize_tags($input['tags_bn'] ?? []), JSON_UNESCAPED_UNICODE),
                            json_encode(normalize_tags($input['tags_en'] ?? []), JSON_UNESCAPED_UNICODE),
                            !empty($input['featured']) ? 1 : 0,
                            (string) ($input['content_bn'] ?? ''), (string) ($input['content_en'] ?? '')
                        ]);
                    } else {
                        // Legacy schema insert
                        $sql = 'INSERT INTO articles (slug, title, category, subheadline, summary, author, author_role, image,
                                image_caption, image_credit, published_at, read_time, tags, featured, content)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                        $stmt = $dbConn->prepare($sql);
                        $stmt->execute([
                            $slug, $titleBn, $category,
                            (string) ($input['subheadline_bn'] ?? ($input['subheadline'] ?? '')),
                            $summaryBn,
                            (string) ($input['author_bn'] ?? ($input['author'] ?? 'Staff Reporter')),
                            (string) ($input['author_role_bn'] ?? ($input['authorRole'] ?? 'Reporter')),
                            (string) ($input['image'] ?? ''), (string) ($input['imageCaption'] ?? ''), (string) ($input['imageCredit'] ?? ''),
                            date('Y-m-d H:i:s'),
                            '4 min read',
                            json_encode(normalize_tags($input['tags_bn'] ?? ($input['tags'] ?? [])), JSON_UNESCAPED_UNICODE),
                            !empty($input['featured']) ? 1 : 0,
                            (string) ($input['content_bn'] ?? ($input['content'] ?? ''))
                        ]);
                    }
            $id = (int) $dbConn->lastInsertId();
            json_response(['success' => true, 'id' => $id, 'slug' => $slug]);
        }
    }

    // DELETE ARTICLE
    if ($method === 'DELETE') {
        if (!is_admin()) json_response(['message' => 'Unauthorized'], 401);
        $id = (int) ($_GET['id'] ?? 0);
        if ($id < 1) {
            json_response(['success' => false, 'message' => 'A valid article ID is required.'], 400);
        }
        $stmt = $dbConn->prepare('DELETE FROM articles WHERE id = ?');
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            json_response(['success' => false, 'message' => 'Article was not found.'], 404);
        }
        json_response(['success' => true, 'deletedId' => $id]);
    }
}

// ----------------------------------------------------
// ROUTE: GET /api/stats
// ----------------------------------------------------
if ($resource === 'stats' && $method === 'GET') {
    if (!is_admin()) json_response(['message' => 'Unauthorized'], 401);
    $dbConn = require_db();
    $totalArticles = (int) $dbConn->query('SELECT COUNT(*) FROM articles')->fetchColumn();
    $totalViews = (int) $dbConn->query('SELECT COALESCE(SUM(views), 0) FROM articles')->fetchColumn();
    $hasActive = has_column($dbConn, 'breaking_news', 'active');
    $where = $hasActive ? 'WHERE active = 1' : '';
    $totalBreaking = (int) $dbConn->query("SELECT COUNT(*) FROM breaking_news $where")->fetchColumn();
    $categoriesCount = (int) $dbConn->query('SELECT COUNT(*) FROM categories')->fetchColumn();

    json_response([
        'totalArticles' => $totalArticles,
        'totalViews' => $totalViews,
        'totalBreaking' => $totalBreaking,
        'categoriesCount' => $categoriesCount,
    ]);
}

json_response(['message' => 'API endpoint not found'], 404);
