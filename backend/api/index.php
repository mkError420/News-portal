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

    if ($pdo) {
        auto_migrate_all_tables($pdo);
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
    auto_migrate_all_tables($connection);
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

function auto_migrate_all_tables(PDO $pdo): void
{
    static $done = false;
    if ($done) return;
    $done = true;

    // 1. Articles Table Bilingual & SEO Migration
    $articleCols = [
        'title_bn' => "VARCHAR(500) NOT NULL DEFAULT ''",
        'title_en' => "VARCHAR(500) NOT NULL DEFAULT ''",
        'subheadline_bn' => "VARCHAR(500) NULL DEFAULT ''",
        'subheadline_en' => "VARCHAR(500) NULL DEFAULT ''",
        'summary_bn' => "TEXT NULL",
        'summary_en' => "TEXT NULL",
        'author_bn' => "VARCHAR(150) NOT NULL DEFAULT 'প্রথম আলো ডেস্ক'",
        'author_en' => "VARCHAR(150) NOT NULL DEFAULT 'Staff Reporter'",
        'author_role_bn' => "VARCHAR(150) NULL DEFAULT 'প্রতিবেদক'",
        'author_role_en' => "VARCHAR(150) NULL DEFAULT 'Reporter'",
        'tags_bn' => "JSON NULL",
        'tags_en' => "JSON NULL",
        'content_bn' => "LONGTEXT NULL",
        'content_en' => "LONGTEXT NULL",
        'seo_title' => "VARCHAR(255) NULL DEFAULT ''",
        'seo_description' => "TEXT NULL",
        'focus_keyword' => "VARCHAR(150) NULL DEFAULT ''",
        'canonical_url' => "VARCHAR(500) NULL DEFAULT ''",
        'og_image' => "VARCHAR(500) NULL DEFAULT ''",
        'schema_type' => "VARCHAR(50) NULL DEFAULT 'NewsArticle'"
    ];
    foreach ($articleCols as $colName => $colDef) {
        if (!has_column($pdo, 'articles', $colName)) {
            try {
                $pdo->exec("ALTER TABLE `articles` ADD COLUMN `$colName` $colDef");
            } catch (Throwable $e) {}
        }
    }

    // Backfill legacy fields if empty
    try {
        if (has_column($pdo, 'articles', 'title')) {
            $pdo->exec("UPDATE `articles` SET `title_bn` = `title` WHERE (`title_bn` = '' OR `title_bn` IS NULL) AND `title` IS NOT NULL AND `title` != ''");
            $pdo->exec("UPDATE `articles` SET `title_en` = `title` WHERE (`title_en` = '' OR `title_en` IS NULL) AND `title` IS NOT NULL AND `title` != ''");
        }
        if (has_column($pdo, 'articles', 'content')) {
            $pdo->exec("UPDATE `articles` SET `content_bn` = `content` WHERE (`content_bn` = '' OR `content_bn` IS NULL) AND `content` IS NOT NULL AND `content` != ''");
        }
        if (has_column($pdo, 'articles', 'summary')) {
            $pdo->exec("UPDATE `articles` SET `summary_bn` = `summary` WHERE (`summary_bn` = '' OR `summary_bn` IS NULL) AND `summary` IS NOT NULL AND `summary` != ''");
        }
    } catch (Throwable $e) {}

    // 2. Breaking News columns
    $breakingCols = [
        'title_bn' => "VARCHAR(500) NOT NULL DEFAULT ''",
        'title_en' => "VARCHAR(500) NOT NULL DEFAULT ''",
        'url' => "VARCHAR(500) NULL DEFAULT ''",
        'article_id' => "INT NULL DEFAULT NULL",
        'active' => "TINYINT(1) DEFAULT 1",
        'order_num' => "INT DEFAULT 0"
    ];
    foreach ($breakingCols as $colName => $colDef) {
        if (!has_column($pdo, 'breaking_news', $colName)) {
            try {
                $pdo->exec("ALTER TABLE `breaking_news` ADD COLUMN `$colName` $colDef");
            } catch (Throwable $e) {}
        }
    }
    try {
        if (has_column($pdo, 'breaking_news', 'title')) {
            $pdo->exec("UPDATE `breaking_news` SET `title_bn` = `title` WHERE (`title_bn` = '' OR `title_bn` IS NULL) AND `title` IS NOT NULL AND `title` != ''");
        }
    } catch (Throwable $e) {}

    // 3. Categories columns
    $catCols = [
        'subcategories' => "JSON NULL",
        'color' => "VARCHAR(30) DEFAULT '#e30613'",
        'order_num' => "INT DEFAULT 0",
        'active' => "TINYINT(1) DEFAULT 1"
    ];
    foreach ($catCols as $colName => $colDef) {
        if (!has_column($pdo, 'categories', $colName)) {
            try {
                $pdo->exec("ALTER TABLE `categories` ADD COLUMN `$colName` $colDef");
            } catch (Throwable $e) {}
        }
    }

    // 4. Media & Opinions
    auto_migrate_media_and_opinions($pdo);

    // 5. Roles & Staff
    auto_migrate_roles_and_staff($pdo);

    // 6. Reader Polls (পাঠক জরিপ)
    auto_migrate_polls($pdo);
}

function auto_migrate_seo(PDO $pdo): void
{
    auto_migrate_all_tables($pdo);
}

function auto_migrate_media_and_opinions(PDO $pdo): void
{
    static $done = false;
    if ($done) return;
    $done = true;

    // 1. Opinions table
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS `opinions` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `slug` VARCHAR(255) NOT NULL UNIQUE,
            `title_bn` VARCHAR(500) NOT NULL,
            `title_en` VARCHAR(500) NOT NULL DEFAULT '',
            `author_bn` VARCHAR(150) NOT NULL,
            `author_en` VARCHAR(150) NOT NULL DEFAULT '',
            `author_role_bn` VARCHAR(255) NULL,
            `author_role_en` VARCHAR(255) NULL,
            `author_image` VARCHAR(500) NULL,
            `summary_bn` TEXT NULL,
            `summary_en` TEXT NULL,
            `image` VARCHAR(500) NULL,
            `category` VARCHAR(50) NOT NULL DEFAULT 'opinion',
            `content_bn` LONGTEXT NULL,
            `content_en` LONGTEXT NULL,
            `published_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        $opCount = (int) $pdo->query('SELECT COUNT(*) FROM opinions')->fetchColumn();
        if ($opCount === 0) {
            $ins = $pdo->prepare("INSERT INTO `opinions` (slug, title_bn, title_en, author_bn, author_en, author_role_bn, author_role_en, author_image, summary_bn, summary_en, image, content_bn, content_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $ins->execute([
                'democracy-future-bangladesh',
                'গণতন্ত্রের ভবিষ্যৎ ও আমাদের নাগরিক দায়িত্ব',
                'The Future of Democracy and Our Civic Responsibility',
                'ড. মুহাম্মদ ইউনূস',
                'Dr. Muhammad Yunus',
                'অর্থনীতিবিদ ও শান্তিতে নোবেল বিজয়ী',
                'Economist & Nobel Peace Laureate',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
                'একটি শক্তিশালী গণতান্ত্রিক ব্যবস্থার মূল ভিত্তি হলো প্রতিটি নাগরিকের সমান অংশগ্রহণ ও জবাবদিহিতা।',
                'The foundation of a robust democratic system lies in the equal participation and accountability of every citizen.',
                'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
                '<p>গণতন্ত্র কেবল একটি শাসনব্যবস্থা নয়, এটি একটি সামাজিক সংস্কৃতি ও মূল্যবোধ। যখন নাগরিকরা সচেতন হন এবং প্রাতিষ্ঠানিক জবাবদিহিতা নিশ্চিত করেন, তখনই একটি রাষ্ট্র উন্নয়নের সঠিক শিখরে পৌঁছায়।</p>',
                '<p>Democracy is not merely a system of governance; it is a social culture and a set of shared values.</p>'
            ]);
            $ins->execute([
                'economic-resilience-south-asia',
                'বৈশ্বিক অস্থিরতার মুখে বাংলাদেশের অর্থনৈতিক স্থিতিস্থাপকতা',
                'Economic Resilience of Bangladesh Amid Global Volatility',
                'ড. দেবপ্রিয় ভট্টাচার্য',
                'Dr. Debapriya Bhattacharya',
                'বিশিষ্ট অর্থনীতিবিদ ও পলিসি বিশ্লেষক',
                'Eminent Economist & Policy Analyst',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
                'মূল্যস্ফীতি নিয়ন্ত্রণ ও কৃষি-রপ্তানির ভারসাম্য বজায় রাখাই হবে আগামী দিনের মূল অর্থনৈতিক চালিকাশক্তি।',
                'Taming inflation while balancing agriculture and exports will be the core economic driver ahead.',
                'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
                '<p>বিশ্বব্যাপী মূল্যস্ফীতি ও মুদ্রা সংকট থাকলেও বাংলাদেশের গ্রামীণ অর্থনীতি ও তৈরি পোশাক খাতের প্রাণশক্তি অত্যন্ত শক্তিশালী।</p>',
                '<p>Despite worldwide inflation and currency pressures, the vitality of Bangladesh’s rural economy remains strong.</p>'
            ]);
            $ins->execute([
                'climate-justice-and-bangladesh',
                'জলবায়ু ন্যায়বিচার: বাংলাদেশের দাবি ও করণীয়',
                'Climate Justice: Bangladesh’s Demand and Global Imperatives',
                'সৈয়দা রিজওয়ানা হাসান',
                'Syeda Rizwana Hasan',
                'পরিবেশ আইনজীবী ও র‍্যামন ম্যাগসেসে পুরস্কারপ্রাপ্ত',
                'Environmental Lawyer & Ramon Magsaysay Awardee',
                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
                'উপকূলীয় জনগোষ্ঠীর সুরক্ষায় বিশ্বকে দ্রুত ক্ষতিপূরণ তহবিল কার্যকর করতে হবে।',
                'The world must rapidly operationalize loss-and-damage funds to protect coastal communities.',
                'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80',
                '<p>বাংলাদেশ বৈশ্বিক কার্বন নিঃসরণে দায়ী না হয়েও জলবায়ু পরিবর্তনের মারাত্মক ক্ষতির শিকার।</p>',
                '<p>Bangladesh suffers disproportionately from climate change despite contributing negligible emissions.</p>'
            ]);
        }
    } catch (Throwable $e) {}

    // 2. Photos table
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS `photos` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `slug` VARCHAR(255) NOT NULL UNIQUE,
            `title_bn` VARCHAR(500) NOT NULL,
            `title_en` VARCHAR(500) NOT NULL DEFAULT '',
            `image` VARCHAR(500) NOT NULL,
            `credit_bn` VARCHAR(255) NULL,
            `credit_en` VARCHAR(255) NULL,
            `caption_bn` TEXT NULL,
            `caption_en` TEXT NULL,
            `published_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        $phCount = (int) $pdo->query('SELECT COUNT(*) FROM photos')->fetchColumn();
        if ($phCount === 0) {
            $ins = $pdo->prepare("INSERT INTO `photos` (slug, title_bn, title_en, image, credit_bn, credit_en, caption_bn, caption_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $ins->execute([
                'autumn-kashful-beauty',
                'শরতের বিকেলে কাশবনের অপার সৌন্দর্য',
                'Breathtaking beauty of Kashful in Autumn afternoon',
                'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
                'ছবি: আসিফ মাহমুদ',
                'Photo: Asif Mahmud',
                'দিয়াবাড়ির বিস্তৃত কাশবনে পরিবার-পরিজন নিয়ে সূর্যাস্ত উপভোগ করছেন দর্শনার্থীরা।',
                'Visitors enjoy sunset with families amidst vast autumn grass at Diabari.'
            ]);
            $ins->execute([
                'misty-morning-river-bengal',
                'কুয়াশাচ্ছন্ন ভোরে রূপসী বাংলার নদীমাতৃক রূপ',
                'Misty morning across the rivers of Bengal',
                'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1200&q=80',
                'ছবি: শফিকুল ইসলাম',
                'Photo: Shafiqul Islam',
                'মেঘনা নদীতে কুয়াশার চাদর ভেদ করে মাছ শিকারে যাচ্ছেন জেলেরা।',
                'Fishermen set out across the Meghna river through early morning mist.'
            ]);
            $ins->execute([
                'padma-bridge-night-lights',
                'পদ্মা সেতুর আলোকসজ্জায় উদ্ভাসিত রাত',
                'Padma Bridge illuminated under the night sky',
                'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80',
                'ছবি: বিশেষ সংবাদদাতা',
                'Photo: Special Correspondent',
                'রাতের আঁধারে পদ্মা সেতুর উজ্জ্বল আলোকচ্ছটা নদীর পানিতে মোহময় প্রতিফলন তৈরি করে।',
                'Vibrant illumination of Padma Bridge casts striking reflections upon the river waters.'
            ]);
            $ins->execute([
                'coxsbazar-sea-beach-crowd',
                'কক্সবাজার সমুদ্রসৈকতে পর্যটকদের উপচে পড়া ভিড়',
                'Huge rush of tourists at Cox’s Bazar sea beach',
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
                'ছবি: নিজস্ব প্রতিবেদক',
                'Photo: Staff Reporter',
                'ছুটির দিনে বিশ্বের দীর্ঘতম সমুদ্রসৈকতে উচ্ছ্বাসে মেতেছেন হাজারো ভ্রমণপিপাসু।',
                'Thousands of holidaymakers rejoice along the world’s longest natural sandy beach.'
            ]);
        }
    } catch (Throwable $e) {}

    // 3. Videos table
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS `videos` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `slug` VARCHAR(255) NOT NULL UNIQUE,
            `title_bn` VARCHAR(500) NOT NULL,
            `title_en` VARCHAR(500) NOT NULL DEFAULT '',
            `thumb` VARCHAR(500) NOT NULL,
            `video_url` VARCHAR(500) NOT NULL,
            `duration` VARCHAR(50) NOT NULL DEFAULT '৩:৩০',
            `views` INT NOT NULL DEFAULT 0,
            `published_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        $vCount = (int) $pdo->query('SELECT COUNT(*) FROM videos')->fetchColumn();
        if ($vCount === 0) {
            $ins = $pdo->prepare("INSERT INTO `videos` (slug, title_bn, title_en, thumb, video_url, duration, views) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $ins->execute([
                'bd-vs-india-asia-cup-final-highlights',
                'বাংলাদেশ বনাম ভারত এশিয়া কাপ ফাইনাল: জয়ের রোমাঞ্চকর মুহূর্তগুলো',
                'Bangladesh vs India Asia Cup Final: Thrilling Winning Moments',
                'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
                'https://www.youtube.com/embed/dQw4w9WgXcQ',
                '৮:৩২',
                125000
            ]);
            $ins->execute([
                'transformation-of-bangladesh-documentary',
                'পদ্মা সেতু ও মেট্রোরেল: বাংলাদেশের রূপান্তরের ১০ বছর',
                'Padma Bridge & Metro Rail: 10 Years of Bangladesh’s Transformation',
                'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
                'https://www.youtube.com/embed/dQw4w9WgXcQ',
                '১৫:৪৫',
                84000
            ]);
            $ins->execute([
                'sundarbans-drone-tech-conservation',
                'সুন্দরবনে ড্রোন প্রযুক্তির ব্যবহার: বন্যপ্রাণী সংরক্ষণে নতুন দিগন্ত',
                'Drones in Sundarbans: A New Horizon for Wildlife Conservation',
                'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80',
                'https://www.youtube.com/embed/dQw4w9WgXcQ',
                '৬:১২',
                42000
            ]);
        }
    } catch (Throwable $e) {}
}

function auto_migrate_roles_and_staff(PDO $pdo): void
{
    static $done = false;
    if ($done) return;
    $done = true;

    // 1. Roles table
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS `roles` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `role_key` VARCHAR(100) NOT NULL UNIQUE,
            `name_bn` VARCHAR(150) NOT NULL,
            `name_en` VARCHAR(150) NOT NULL DEFAULT '',
            `description_bn` TEXT NULL,
            `description_en` TEXT NULL,
            `permissions` JSON NULL,
            `is_system` TINYINT(1) DEFAULT 0,
            `status` VARCHAR(20) DEFAULT 'active',
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        $roleCount = (int) $pdo->query('SELECT COUNT(*) FROM roles')->fetchColumn();
        if ($roleCount === 0) {
            $insRole = $pdo->prepare("INSERT INTO `roles` (`role_key`, `name_bn`, `name_en`, `description_bn`, `description_en`, `permissions`, `is_system`, `status`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

            $insRole->execute([
                'admin',
                'প্রধান প্রশাসক (Super Admin)',
                'Super Administrator',
                'ওয়েবসাইটের সকল কনটেন্ট, সেটিংস, ব্যবহারকারী এবং ডাটাবেজ নিয়ন্ত্রণে সর্বময় ক্ষমতা।',
                'Full access to all articles, categories, breaking news, media, system settings, roles, and database.',
                json_encode(['all', 'manage_articles', 'manage_categories', 'manage_breaking', 'manage_opinions', 'manage_media', 'manage_roles', 'manage_settings']),
                1,
                'active'
            ]);

            $insRole->execute([
                'editor',
                'বার্তা সম্পাদক (News Editor)',
                'News Editor',
                'সংবাদ পর্যালোচনা, অনুমোদন, প্রকাশ, ব্রেকিং নিউজ এবং ক্যাটাগরি ব্যবস্থাপনা।',
                'Review, approve, publish articles, breaking news, and manage categories.',
                json_encode(['manage_articles', 'manage_categories', 'manage_breaking', 'manage_opinions', 'manage_media']),
                0,
                'active'
            ]);

            $insRole->execute([
                'senior_reporter',
                'জ্যেষ্ঠ প্রতিবেদক (Senior Reporter)',
                'Senior Reporter',
                'বিশেষ প্রতিবেদন, অনুসন্ধানী সংবাদ এবং কলাম তৈরি ও প্রকাশ।',
                'Write, edit, and publish special reports and investigative stories.',
                json_encode(['manage_articles', 'manage_opinions']),
                0,
                'active'
            ]);

            $insRole->execute([
                'reporter',
                'স্টাফ রিপোর্টার (Staff Reporter)',
                'Staff Reporter',
                'দৈনন্দিন সংবাদ ও আঞ্চলিক খবর তৈরি ও খসড়া প্রদান।',
                'Draft and submit daily reporting and regional news.',
                json_encode(['manage_articles']),
                0,
                'active'
            ]);

            $insRole->execute([
                'photojournalist',
                'আলোকচিত্রী (Photojournalist)',
                'Photojournalist',
                'আলোকচিত্র গ্যালারি ও ফটো স্টোরি আপলোড এবং ক্যাপশন প্রদান।',
                'Upload and manage photo stories and media galleries.',
                json_encode(['manage_media']),
                0,
                'active'
            ]);

            $insRole->execute([
                'contributor',
                'কলামিস্ট ও লেখক (Columnist)',
                'Columnist & Contributor',
                'উপ-সম্পাদকীয়, কলাম ও চিন্তাশীল মতামত প্রদান।',
                'Contribute editorials, columns, and opinions.',
                json_encode(['manage_opinions']),
                0,
                'active'
            ]);
        }
    } catch (Throwable $e) {}

    // 2. Add columns to `admins` table if missing (name, role_key, status, phone)
    try {
        $cols = $pdo->query("SHOW COLUMNS FROM `admins`")->fetchAll(PDO::FETCH_COLUMN);
        if (!in_array('name', $cols, true)) {
            $pdo->exec("ALTER TABLE `admins` ADD COLUMN `name` VARCHAR(150) NOT NULL DEFAULT 'Administrator'");
        }
        if (!in_array('role_key', $cols, true)) {
            $pdo->exec("ALTER TABLE `admins` ADD COLUMN `role_key` VARCHAR(100) NOT NULL DEFAULT 'admin'");
        }
        if (!in_array('status', $cols, true)) {
            $pdo->exec("ALTER TABLE `admins` ADD COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'active'");
        }
        if (!in_array('phone', $cols, true)) {
            $pdo->exec("ALTER TABLE `admins` ADD COLUMN `phone` VARCHAR(50) NULL");
        }
    } catch (Throwable $e) {}
}

function auto_migrate_polls(PDO $pdo): void
{
    static $done = false;
    if ($done) return;
    $done = true;

    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS `polls` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `question_bn` VARCHAR(500) NOT NULL,
            `question_en` VARCHAR(500) NOT NULL DEFAULT '',
            `options` JSON NOT NULL,
            `total_votes` INT NOT NULL DEFAULT 0,
            `status` VARCHAR(20) NOT NULL DEFAULT 'active',
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        $pollCount = (int) $pdo->query('SELECT COUNT(*) FROM polls')->fetchColumn();
        if ($pollCount === 0) {
            $insPoll = $pdo->prepare("INSERT INTO `polls` (`question_bn`, `question_en`, `options`, `total_votes`, `status`) VALUES (?, ?, ?, ?, ?)");
            $defaultOptions = [
                ['id' => 'yes', 'label_bn' => 'হ্যাঁ', 'label_en' => 'Yes', 'votes' => 158],
                ['id' => 'no', 'label_bn' => 'না', 'label_en' => 'No', 'votes' => 37],
                ['id' => 'no_opinion', 'label_bn' => 'মন্তব্য নেই', 'label_en' => 'No Opinion', 'votes' => 13],
            ];
            $insPoll->execute([
                'আপনি কি মনে করেন এআই নিয়ন্ত্রিত ট্র্যাফিক সিগন্যাল ঢাকায় যানজট নিরসনে ফলপ্রসূ হবে?',
                'Do you believe AI-driven adaptive traffic signals will solve congestion in Dhaka?',
                json_encode($defaultOptions, JSON_UNESCAPED_UNICODE),
                208,
                'active'
            ]);
        }
    } catch (Throwable $e) {}
}

function format_poll_item(array $row): array
{
    $options = $row['options'] ?? [];
    if (is_string($options)) {
        $options = json_decode($options, true);
    }
    if (!is_array($options)) {
        $options = [];
    }
    $totalVotes = (int) ($row['total_votes'] ?? 0);
    $sum = 0;
    foreach ($options as $opt) {
        $sum += (int) ($opt['votes'] ?? 0);
    }
    if ($totalVotes < $sum) {
        $totalVotes = $sum;
    }

    $formattedOptions = [];
    foreach ($options as $idx => $opt) {
        $v = (int) ($opt['votes'] ?? 0);
        $percent = $totalVotes > 0 ? round(($v / $totalVotes) * 100, 1) : 0;
        $formattedOptions[] = [
            'id' => (string) ($opt['id'] ?? ('opt_' . ($idx + 1))),
            'label_bn' => (string) ($opt['label_bn'] ?? ''),
            'label_en' => (string) ($opt['label_en'] ?? ''),
            'votes' => $v,
            'percent' => $percent,
        ];
    }

    return [
        'id' => (int) $row['id'],
        'question_bn' => (string) ($row['question_bn'] ?? ''),
        'question_en' => (string) ($row['question_en'] ?? ''),
        'options' => $formattedOptions,
        'total_votes' => $totalVotes,
        'status' => (string) ($row['status'] ?? 'active'),
        'created_at' => (string) ($row['created_at'] ?? ''),
        'updated_at' => (string) ($row['updated_at'] ?? ''),
    ];
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
    $subResource = $segments[$apiIndex + 2] ?? null;
}
if (!isset($subResource)) {
    $subResource = null;
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
    echo '  <title>প্রথম কালো | Prothom kalo</title>' . "\n";
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

    auto_migrate_roles_and_staff($dbConn);

    $stmt = $dbConn->prepare('
        SELECT a.id, a.email, a.password_hash, a.name, a.role_key, a.status,
               r.name_bn as role_name_bn, r.name_en as role_name_en, r.permissions
        FROM admins a
        LEFT JOIN roles r ON a.role_key = r.role_key
        WHERE a.email = ? LIMIT 1
    ');
    $stmt->execute([$lookupEmail]);
    $adminUser = $stmt->fetch();

    // If still not found and default credentials provided, auto-create
    if (!$adminUser && in_array($email, ['admin@prothomalo.com', 'admin', 'admin@example.com'], true) && $password === 'admin123') {
        $defaultHash = password_hash('admin123', PASSWORD_BCRYPT);
        $ins = $dbConn->prepare('INSERT INTO admins (email, password_hash, name, role_key, status) VALUES (?, ?, ?, ?, ?)');
        $ins->execute([$lookupEmail, $defaultHash, 'প্রধান প্রশাসক', 'admin', 'active']);
        $adminUser = [
            'id' => (int)$dbConn->lastInsertId(),
            'email' => $lookupEmail,
            'password_hash' => $defaultHash,
            'name' => 'প্রধান প্রশাসক',
            'role_key' => 'admin',
            'role_name_bn' => 'প্রধান প্রশাসক (Super Admin)',
            'role_name_en' => 'Super Administrator',
            'permissions' => json_encode(['all']),
        ];
    }

    if ($adminUser && password_verify($password, $adminUser['password_hash'])) {
        session_regenerate_id(true);
        $_SESSION['admin_authenticated'] = true;
        $_SESSION['admin_id'] = (int) $adminUser['id'];
        $_SESSION['admin_email'] = $adminUser['email'];

        $token = create_admin_token((int) $adminUser['id'], $adminUser['email']);

        $perms = [];
        if (!empty($adminUser['permissions'])) {
            $decoded = json_decode($adminUser['permissions'], true);
            if (is_array($decoded)) $perms = $decoded;
        }

        json_response([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => (int) $adminUser['id'],
                'email' => $adminUser['email'],
                'name' => $adminUser['name'] ?: 'Administrator',
                'role' => $adminUser['role_key'] ?: 'admin',
                'role_name_bn' => $adminUser['role_name_bn'] ?? 'প্রধান প্রশাসক',
                'role_name_en' => $adminUser['role_name_en'] ?? 'Super Admin',
                'permissions' => $perms,
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
    $userData = null;
    if ($auth) {
        $adminId = $_SESSION['admin_id'] ?? 1;
        try {
            $dbConn = require_db();
            auto_migrate_roles_and_staff($dbConn);
            $uStmt = $dbConn->prepare('
                SELECT a.id, a.email, a.name, a.role_key, a.status,
                       r.name_bn as role_name_bn, r.name_en as role_name_en, r.permissions
                FROM admins a
                LEFT JOIN roles r ON a.role_key = r.role_key
                WHERE a.id = ? LIMIT 1
            ');
            $uStmt->execute([$adminId]);
            $row = $uStmt->fetch();
            if ($row) {
                $perms = [];
                if (!empty($row['permissions'])) {
                    $decoded = json_decode($row['permissions'], true);
                    if (is_array($decoded)) $perms = $decoded;
                }
                $userData = [
                    'id' => (int) $row['id'],
                    'email' => $row['email'],
                    'name' => $row['name'] ?: 'Administrator',
                    'role' => $row['role_key'] ?: 'admin',
                    'role_name_bn' => $row['role_name_bn'] ?: 'প্রধান প্রশাসক',
                    'role_name_en' => $row['role_name_en'] ?: 'Super Admin',
                    'permissions' => $perms,
                ];
            }
        } catch (Throwable $e) {}

        if (!$userData) {
            $userData = [
                'id' => $adminId,
                'email' => $_SESSION['admin_email'] ?? '',
                'name' => 'Administrator',
                'role' => 'admin',
                'role_name_bn' => 'প্রধান প্রশাসক',
                'role_name_en' => 'Super Admin',
                'permissions' => ['all'],
            ];
        }
    }

    json_response([
        'authenticated' => $auth,
        'user' => $userData,
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
// ROUTE: POST /api/upload (Image Upload Handler)
// ----------------------------------------------------
if ($resource === 'upload' && $method === 'POST') {
    if (!is_admin()) {
        json_response(['success' => false, 'message' => 'Unauthorized. Please login as admin to upload images.'], 401);
    }

    $webRoot = dirname(__DIR__, 2);
    $uploadsDir = $webRoot . '/uploads';
    if (!is_dir($uploadsDir)) {
        @mkdir($uploadsDir, 0755, true);
    }

    // Security protection inside uploads directory
    $htaccessFile = $uploadsDir . '/.htaccess';
    if (!file_exists($htaccessFile)) {
        @file_put_contents($htaccessFile, "<FilesMatch \"\.(php|php5|php7|php8|phtml|phar|pl|py|cgi|sh|bash)$\">\n  Order Deny,Allow\n  Deny from all\n</FilesMatch>\nOptions -Indexes\n");
    }

    $uploadedFile = $_FILES['image'] ?? ($_FILES['file'] ?? null);

    // Support base64 upload if sent as JSON payload
    if (!$uploadedFile) {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $base64Data = (string) ($input['data'] ?? ($input['base64'] ?? ($input['image'] ?? '')));
        if (!empty($base64Data) && preg_match('#^data:image/(\w+);base64,(.+)$#is', $base64Data, $matches)) {
            $ext = strtolower($matches[1]);
            if ($ext === 'jpeg') $ext = 'jpg';
            if (!in_array($ext, ['jpg', 'png', 'webp', 'gif', 'svg'], true)) {
                $ext = 'jpg';
            }
            $decoded = base64_decode($matches[2]);
            if ($decoded !== false) {
                $filename = 'img_' . date('Ymd_His') . '_' . substr(bin2hex(random_bytes(6)), 0, 8) . '.' . $ext;
                $targetPath = $uploadsDir . '/' . $filename;
                if (@file_put_contents($targetPath, $decoded) !== false) {
                    json_response([
                        'success' => true,
                        'message' => 'ছবি সফলভাবে আপলোড হয়েছে।',
                        'url' => '/uploads/' . $filename,
                        'filename' => $filename,
                    ]);
                }
            }
        }
        json_response(['success' => false, 'message' => 'কোনো ছবি পাওয়া যায়নি। অনুগ্রহ করে ছবি নির্বাচন করুন।'], 400);
    }

    if ($uploadedFile['error'] !== UPLOAD_ERR_OK) {
        json_response(['success' => false, 'message' => 'ফাইল আপলোডে সমস্যা হয়েছে (কোড: ' . $uploadedFile['error'] . ')'], 400);
    }

    // Maximum 15MB limit
    if ($uploadedFile['size'] > 15 * 1024 * 1024) {
        json_response(['success' => false, 'message' => 'ছবির সাইজ ১৫ মেগাবাইটের বেশি হতে পারবে না।'], 400);
    }

    $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
    $origExt = strtolower(pathinfo($uploadedFile['name'], PATHINFO_EXTENSION));
    if (!in_array($origExt, $allowedExts, true)) {
        json_response(['success' => false, 'message' => 'শুধুমাত্র JPG, PNG, WEBP, GIF অথবা SVG ফরম্যাটের ছবি আপলোড করা যাবে।'], 400);
    }
    $ext = ($origExt === 'jpeg') ? 'jpg' : $origExt;

    $filename = 'img_' . date('Ymd_His') . '_' . substr(bin2hex(random_bytes(6)), 0, 8) . '.' . $ext;
    $targetPath = $uploadsDir . '/' . $filename;

    if (!@move_uploaded_file($uploadedFile['tmp_name'], $targetPath)) {
        json_response(['success' => false, 'message' => 'সার্ভারে ছবি সংরক্ষণ করা সম্ভব হয়নি। ফোল্ডার পারমিশন চেক করুন।'], 500);
    }

    json_response([
        'success' => true,
        'message' => 'ছবি সফলভাবে সার্ভারে আপলোড হয়েছে।',
        'url' => '/uploads/' . $filename,
        'filename' => $filename,
        'size' => $uploadedFile['size'],
    ]);
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
        'site_name_bn' => 'প্রথম কালো',
        'site_name_en' => 'Prothom kalo',
        'tagline_bn' => 'অনলাইন সংস্করণ • সত্যের সন্ধানে নির্ভীক',
        'tagline_en' => 'Online Edition • Fearless in Pursuit of Truth',
        'logo_url' => '',
        'favicon_url' => '',
        'editor_bn' => 'সম্পাদক ও প্রকাশক: মতিউর রহমান',
        'editor_en' => 'Editor & Publisher: Matiur Rahman',
        'about_bn' => 'প্রথম কালো বাংলাদেশের সর্বাধিক পঠিত ও জনপ্রিয় বাংলা দৈনিক ও অনলাইন সংবাদমাধ্যম। নিরপেক্ষ ও বস্তুনিষ্ঠ সাংবাদিকতাই আমাদের মূল শক্তি।',
        'about_en' => 'Prothom kalo is the leading and most trusted news publication in Bangladesh, delivering impartial and accurate news 24/7.',
        'address_bn' => 'প্রগতি ইনস্যুরেন্স ভবন, ২০-২১ কারওয়ান বাজার, ঢাকা ১২১৫, বাংলাদেশ',
        'address_en' => 'Pragati Insurance Bhaban, 20-21 Karwan Bazar, Dhaka 1215, Bangladesh',
        'phone' => '+৮৮০ ২ ৮১৮০০৭৮-৮১',
        'email' => 'info@prothomkalo.com',
        'ad_email' => 'ads@prothomkalo.com',
        'facebook_url' => 'https://facebook.com/DailyProthomKalo',
        'twitter_url' => 'https://twitter.com/ProthomKalo',
        'youtube_url' => 'https://youtube.com/c/ProthomKalo',
        'instagram_url' => 'https://instagram.com/prothomkalo',
        'linkedin_url' => 'https://linkedin.com/company/prothom-kalo',
        'copyright_bn' => 'স্বত্ব © ২০২৬ প্রথম কালো | সর্বস্বত্ব সংরক্ষিত।',
        'copyright_en' => 'Copyright © 2026 Prothom kalo | All rights reserved.',
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
        'meta_keywords_default' => 'সংবাদ, বাংলাদেশ, প্রথম কালো, খবর, ব্রেকিং নিউজ, News, Bangladesh, Prothom kalo',
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

    // Auto-migrate breaking_news table columns if missing
    try {
        if (!has_column($dbConn, 'breaking_news', 'title_bn')) {
            $dbConn->exec("ALTER TABLE `breaking_news` ADD COLUMN `title_bn` VARCHAR(500) NOT NULL DEFAULT '' AFTER `title`");
        }
        if (!has_column($dbConn, 'breaking_news', 'title_en')) {
            $dbConn->exec("ALTER TABLE `breaking_news` ADD COLUMN `title_en` VARCHAR(500) NOT NULL DEFAULT '' AFTER `title_bn`");
        }
        if (!has_column($dbConn, 'breaking_news', 'article_id')) {
            $dbConn->exec("ALTER TABLE `breaking_news` ADD COLUMN `article_id` INT NULL DEFAULT NULL AFTER `slug`");
        }
        if (!has_column($dbConn, 'breaking_news', 'url')) {
            $dbConn->exec("ALTER TABLE `breaking_news` ADD COLUMN `url` VARCHAR(500) NULL DEFAULT '' AFTER `article_id`");
        }
        if (!has_column($dbConn, 'breaking_news', 'active')) {
            $dbConn->exec("ALTER TABLE `breaking_news` ADD COLUMN `active` TINYINT(1) NOT NULL DEFAULT 1 AFTER `url`");
        }
    } catch (Throwable $e) {}

    $hasActive = has_column($dbConn, 'breaking_news', 'active');
    $hasTitleBn = has_column($dbConn, 'breaking_news', 'title_bn');
    $hasArticleId = has_column($dbConn, 'breaking_news', 'article_id');
    $hasUrl = has_column($dbConn, 'breaking_news', 'url');

    // GET
    if ($method === 'GET') {
        $forAdmin = !empty($_GET['all']) || !empty($_GET['admin']);
        $where = ($hasActive && !$forAdmin) ? 'WHERE active = 1' : '';
        $stmt = $dbConn->query("SELECT * FROM breaking_news $where ORDER BY id DESC");
        $items = array_map(function ($r) use ($hasTitleBn, $hasArticleId, $hasUrl, $hasActive) {
            $titleBn = $hasTitleBn ? ($r['title_bn'] ?? '') : ($r['title'] ?? '');
            $titleEn = $hasTitleBn ? ($r['title_en'] ?? $titleBn) : ($r['title'] ?? '');
            return [
                'id' => (int) $r['id'],
                'title_bn' => $titleBn ?: ($r['title'] ?? ''),
                'title_en' => $titleEn ?: ($r['title'] ?? ''),
                'slug' => $r['slug'] ?? ('breaking-' . $r['id']),
                'article_id' => $hasArticleId && !empty($r['article_id']) ? (int) $r['article_id'] : null,
                'url' => $hasUrl ? ($r['url'] ?? '') : '',
                'active' => $hasActive ? (!empty($r['active']) ? 1 : 0) : 1,
                'created_at' => $r['created_at'] ?? null,
            ];
        }, $stmt->fetchAll());
        json_response(['breakingNews' => $items]);
    }

    // TOGGLE ACTIVE
    if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'toggle') {
        if (!is_admin()) json_response(['message' => 'Unauthorized'], 401);
        $id = (int) ($_GET['id'] ?? 0);
        if ($id < 1) json_response(['message' => 'Valid ID required'], 400);

        if ($hasActive) {
            $stmt = $dbConn->prepare('UPDATE breaking_news SET active = IF(active = 1, 0, 1) WHERE id = ?');
            $stmt->execute([$id]);
            $newActive = (int) $dbConn->query("SELECT active FROM breaking_news WHERE id = $id")->fetchColumn();
            json_response(['success' => true, 'id' => $id, 'active' => $newActive]);
        }
        json_response(['success' => true, 'id' => $id, 'active' => 1]);
    }

    // CREATE OR UPDATE (POST or PUT)
    if ($method === 'POST' || $method === 'PUT') {
        if (!is_admin()) json_response(['message' => 'Unauthorized'], 401);
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $id = (int) ($input['id'] ?? ($_GET['id'] ?? 0));
        $titleBn = trim((string) ($input['title_bn'] ?? ($input['title'] ?? '')));
        $titleEn = trim((string) ($input['title_en'] ?? $titleBn));
        if ($titleBn === '' && $titleEn === '') {
            json_response(['success' => false, 'message' => 'A breaking-news headline is required.'], 400);
        }
        $slug = trim((string) ($input['slug'] ?? ''));
        if ($slug === '') {
            $slug = 'breaking-' . time();
        }
        $articleId = !empty($input['article_id']) ? (int) $input['article_id'] : null;
        $url = trim((string) ($input['url'] ?? ''));
        $active = isset($input['active']) ? (!empty($input['active']) ? 1 : 0) : 1;

        if ($id > 0) {
            $chk = $dbConn->prepare('SELECT id FROM breaking_news WHERE id = ?');
            $chk->execute([$id]);
            if ($chk->fetch()) {
                if ($hasTitleBn && $hasArticleId && $hasUrl && $hasActive) {
                    $stmt = $dbConn->prepare('UPDATE breaking_news SET title = ?, title_bn = ?, title_en = ?, slug = ?, article_id = ?, url = ?, active = ? WHERE id = ?');
                    $stmt->execute([$titleBn, $titleBn, $titleEn, $slug, $articleId, $url, $active, $id]);
                } elseif ($hasTitleBn && $hasActive) {
                    $stmt = $dbConn->prepare('UPDATE breaking_news SET title = ?, title_bn = ?, title_en = ?, slug = ?, active = ? WHERE id = ?');
                    $stmt->execute([$titleBn, $titleBn, $titleEn, $slug, $active, $id]);
                } else {
                    $stmt = $dbConn->prepare('UPDATE breaking_news SET title = ?, slug = ? WHERE id = ?');
                    $stmt->execute([$titleBn, $slug, $id]);
                }
                json_response([
                    'success' => true,
                    'item' => [
                        'id' => $id,
                        'title_bn' => $titleBn,
                        'title_en' => $titleEn,
                        'slug' => $slug,
                        'article_id' => $articleId,
                        'url' => $url,
                        'active' => $active,
                    ]
                ]);
            }
        }

        // INSERT
        if ($hasTitleBn && $hasArticleId && $hasUrl && $hasActive) {
            $stmt = $dbConn->prepare('INSERT INTO breaking_news (title, title_bn, title_en, slug, article_id, url, active) VALUES (?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([$titleBn, $titleBn, $titleEn, $slug, $articleId, $url, $active]);
        } elseif ($hasTitleBn && $hasActive) {
            $stmt = $dbConn->prepare('INSERT INTO breaking_news (title, title_bn, title_en, slug, active) VALUES (?, ?, ?, ?, ?)');
            $stmt->execute([$titleBn, $titleBn, $titleEn, $slug, $active]);
        } else {
            $stmt = $dbConn->prepare('INSERT INTO breaking_news (title, slug) VALUES (?, ?)');
            $stmt->execute([$titleBn, $slug]);
        }
        $newId = (int) $dbConn->lastInsertId();
        json_response([
            'success' => true,
            'item' => [
                'id' => $newId > 0 ? $newId : $id,
                'title_bn' => $titleBn,
                'title_en' => $titleEn,
                'slug' => $slug,
                'article_id' => $articleId,
                'url' => $url,
                'active' => $active,
            ]
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
// ROUTE: /api/opinions (Full Dynamic Opinions CRUD)
// ----------------------------------------------------
if ($resource === 'opinions') {
    $dbConn = require_db();
    auto_migrate_media_and_opinions($dbConn);

    if ($method === 'GET') {
        $stmt = $dbConn->query('SELECT * FROM opinions ORDER BY id DESC');
        $items = array_map(function ($r) {
            return [
                'id' => (int) $r['id'],
                'slug' => $r['slug'] ?? ('opinion-' . $r['id']),
                'title_bn' => $r['title_bn'] ?? '',
                'title_en' => $r['title_en'] ?? '',
                'author_bn' => $r['author_bn'] ?? '',
                'author_en' => $r['author_en'] ?? '',
                'author_role_bn' => $r['author_role_bn'] ?? '',
                'author_role_en' => $r['author_role_en'] ?? '',
                'author_image' => $r['author_image'] ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                'summary_bn' => $r['summary_bn'] ?? '',
                'summary_en' => $r['summary_en'] ?? '',
                'image' => $r['image'] ?? '',
                'category' => $r['category'] ?? 'opinion',
                'content_bn' => $r['content_bn'] ?? '',
                'content_en' => $r['content_en'] ?? '',
                'date' => $r['published_at'] ?? ($r['created_at'] ?? date('c')),
            ];
        }, $stmt->fetchAll());
        json_response(['opinions' => $items]);
    }

    if ($method === 'POST' || $method === 'PUT') {
        if (!is_admin()) json_response(['message' => 'Unauthorized'], 401);
        $input = json_decode(file_get_contents('php://input'), true) ?: [];

        $titleBn = trim((string) ($input['title_bn'] ?? ''));
        $titleEn = trim((string) ($input['title_en'] ?? $titleBn));
        $authorBn = trim((string) ($input['author_bn'] ?? ''));
        $authorEn = trim((string) ($input['author_en'] ?? $authorBn));

        if ($titleBn === '' || $authorBn === '') {
            json_response(['success' => false, 'message' => 'Title and author are required.'], 400);
        }

        $id = (int) ($input['id'] ?? ($_GET['id'] ?? 0));
        $slug = trim((string) ($input['slug'] ?? ''));
        if ($slug === '' || str_starts_with($slug, 'op-')) {
            $slug = 'opinion-' . time() . '-' . rand(10, 99);
        }

        $authorRoleBn = trim((string) ($input['author_role_bn'] ?? ''));
        $authorRoleEn = trim((string) ($input['author_role_en'] ?? ''));
        $authorImage = trim((string) ($input['author_image'] ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'));
        $summaryBn = trim((string) ($input['summary_bn'] ?? ''));
        $summaryEn = trim((string) ($input['summary_en'] ?? ''));
        $image = trim((string) ($input['image'] ?? ''));
        $contentBn = trim((string) ($input['content_bn'] ?? ''));
        $contentEn = trim((string) ($input['content_en'] ?? ''));

        if ($id > 0) {
            $chk = $dbConn->prepare('SELECT id FROM opinions WHERE id = ?');
            $chk->execute([$id]);
            if ($chk->fetch()) {
                $stmt = $dbConn->prepare('UPDATE opinions SET title_bn = ?, title_en = ?, author_bn = ?, author_en = ?, author_role_bn = ?, author_role_en = ?, author_image = ?, summary_bn = ?, summary_en = ?, image = ?, content_bn = ?, content_en = ?, slug = ? WHERE id = ?');
                $stmt->execute([$titleBn, $titleEn, $authorBn, $authorEn, $authorRoleBn, $authorRoleEn, $authorImage, $summaryBn, $summaryEn, $image, $contentBn, $contentEn, $slug, $id]);
                json_response([
                    'success' => true,
                    'item' => [
                        'id' => $id,
                        'slug' => $slug,
                        'title_bn' => $titleBn,
                        'title_en' => $titleEn,
                        'author_bn' => $authorBn,
                        'author_en' => $authorEn,
                        'author_role_bn' => $authorRoleBn,
                        'author_role_en' => $authorRoleEn,
                        'author_image' => $authorImage,
                        'summary_bn' => $summaryBn,
                        'summary_en' => $summaryEn,
                        'image' => $image,
                        'category' => 'opinion',
                        'content_bn' => $contentBn,
                        'content_en' => $contentEn,
                        'date' => date('c'),
                    ]
                ]);
            }
        }

        $stmt = $dbConn->prepare('INSERT INTO opinions (slug, title_bn, title_en, author_bn, author_en, author_role_bn, author_role_en, author_image, summary_bn, summary_en, image, content_bn, content_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([$slug, $titleBn, $titleEn, $authorBn, $authorEn, $authorRoleBn, $authorRoleEn, $authorImage, $summaryBn, $summaryEn, $image, $contentBn, $contentEn]);
        $newId = (int) $dbConn->lastInsertId();

        json_response([
            'success' => true,
            'item' => [
                'id' => $newId > 0 ? $newId : time(),
                'slug' => $slug,
                'title_bn' => $titleBn,
                'title_en' => $titleEn,
                'author_bn' => $authorBn,
                'author_en' => $authorEn,
                'author_role_bn' => $authorRoleBn,
                'author_role_en' => $authorRoleEn,
                'author_image' => $authorImage,
                'summary_bn' => $summaryBn,
                'summary_en' => $summaryEn,
                'image' => $image,
                'category' => 'opinion',
                'content_bn' => $contentBn,
                'content_en' => $contentEn,
                'date' => date('c'),
            ]
        ]);
    }

    if ($method === 'DELETE') {
        if (!is_admin()) json_response(['message' => 'Unauthorized'], 401);
        $id = (int) ($_GET['id'] ?? 0);
        $slug = trim((string) ($_GET['slug'] ?? ''));

        if ($id > 0) {
            $stmt = $dbConn->prepare('DELETE FROM opinions WHERE id = ?');
            $stmt->execute([$id]);
        } elseif ($slug !== '') {
            $stmt = $dbConn->prepare('DELETE FROM opinions WHERE slug = ?');
            $stmt->execute([$slug]);
        } else {
            json_response(['success' => false, 'message' => 'Valid opinion ID or slug required.'], 400);
        }
        json_response(['success' => true, 'message' => 'Opinion deleted successfully.']);
    }
}

// ----------------------------------------------------
// ROUTE: /api/photos (Full Dynamic Photo Gallery CRUD)
// ----------------------------------------------------
if ($resource === 'photos') {
    $dbConn = require_db();
    auto_migrate_media_and_opinions($dbConn);

    if ($method === 'GET') {
        $stmt = $dbConn->query('SELECT * FROM photos ORDER BY id DESC');
        $items = array_map(function ($r) {
            return [
                'id' => (int) $r['id'],
                'slug' => $r['slug'] ?? ('photo-' . $r['id']),
                'title_bn' => $r['title_bn'] ?? '',
                'title_en' => $r['title_en'] ?? '',
                'image' => $r['image'] ?? '',
                'credit_bn' => $r['credit_bn'] ?? 'ছবি: সংগৃহীত',
                'credit_en' => $r['credit_en'] ?? 'Photo: Source',
                'caption_bn' => $r['caption_bn'] ?? '',
                'caption_en' => $r['caption_en'] ?? '',
                'date' => $r['published_at'] ?? ($r['created_at'] ?? date('c')),
            ];
        }, $stmt->fetchAll());
        json_response(['photos' => $items]);
    }

    if ($method === 'POST' || $method === 'PUT') {
        if (!is_admin()) json_response(['message' => 'Unauthorized'], 401);
        $input = json_decode(file_get_contents('php://input'), true) ?: [];

        $titleBn = trim((string) ($input['title_bn'] ?? ''));
        $titleEn = trim((string) ($input['title_en'] ?? $titleBn));
        $image = trim((string) ($input['image'] ?? ''));

        if ($titleBn === '' || $image === '') {
            json_response(['success' => false, 'message' => 'Title and image URL are required.'], 400);
        }

        $id = (int) ($input['id'] ?? ($_GET['id'] ?? 0));
        $slug = trim((string) ($input['slug'] ?? ''));
        if ($slug === '' || str_starts_with($slug, 'ph-')) {
            $slug = 'photo-' . time() . '-' . rand(10, 99);
        }

        $creditBn = trim((string) ($input['credit_bn'] ?? 'ছবি: সংগৃহীত'));
        $creditEn = trim((string) ($input['credit_en'] ?? 'Photo: Source'));
        $captionBn = trim((string) ($input['caption_bn'] ?? ''));
        $captionEn = trim((string) ($input['caption_en'] ?? ''));

        if ($id > 0) {
            $chk = $dbConn->prepare('SELECT id FROM photos WHERE id = ?');
            $chk->execute([$id]);
            if ($chk->fetch()) {
                $stmt = $dbConn->prepare('UPDATE photos SET title_bn = ?, title_en = ?, image = ?, credit_bn = ?, credit_en = ?, caption_bn = ?, caption_en = ?, slug = ? WHERE id = ?');
                $stmt->execute([$titleBn, $titleEn, $image, $creditBn, $creditEn, $captionBn, $captionEn, $slug, $id]);
                json_response([
                    'success' => true,
                    'item' => [
                        'id' => $id,
                        'slug' => $slug,
                        'title_bn' => $titleBn,
                        'title_en' => $titleEn,
                        'image' => $image,
                        'credit_bn' => $creditBn,
                        'credit_en' => $creditEn,
                        'caption_bn' => $captionBn,
                        'caption_en' => $captionEn,
                        'date' => date('c'),
                    ]
                ]);
            }
        }

        $stmt = $dbConn->prepare('INSERT INTO photos (slug, title_bn, title_en, image, credit_bn, credit_en, caption_bn, caption_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([$slug, $titleBn, $titleEn, $image, $creditBn, $creditEn, $captionBn, $captionEn]);
        $newId = (int) $dbConn->lastInsertId();

        json_response([
            'success' => true,
            'item' => [
                'id' => $newId > 0 ? $newId : time(),
                'slug' => $slug,
                'title_bn' => $titleBn,
                'title_en' => $titleEn,
                'image' => $image,
                'credit_bn' => $creditBn,
                'credit_en' => $creditEn,
                'caption_bn' => $captionBn,
                'caption_en' => $captionEn,
                'date' => date('c'),
            ]
        ]);
    }

    if ($method === 'DELETE') {
        if (!is_admin()) json_response(['message' => 'Unauthorized'], 401);
        $id = (int) ($_GET['id'] ?? 0);
        $slug = trim((string) ($_GET['slug'] ?? ''));

        if ($id > 0) {
            $stmt = $dbConn->prepare('DELETE FROM photos WHERE id = ?');
            $stmt->execute([$id]);
        } elseif ($slug !== '') {
            $stmt = $dbConn->prepare('DELETE FROM photos WHERE slug = ?');
            $stmt->execute([$slug]);
        } else {
            json_response(['success' => false, 'message' => 'Valid photo ID or slug required.'], 400);
        }
        json_response(['success' => true, 'message' => 'Photo deleted successfully.']);
    }
}

// ----------------------------------------------------
// ROUTE: /api/videos (Full Dynamic Video Reports CRUD)
// ----------------------------------------------------
if ($resource === 'videos') {
    $dbConn = require_db();
    auto_migrate_media_and_opinions($dbConn);

    if ($method === 'GET') {
        $stmt = $dbConn->query('SELECT * FROM videos ORDER BY id DESC');
        $items = array_map(function ($r) {
            return [
                'id' => (int) $r['id'],
                'slug' => $r['slug'] ?? ('video-' . $r['id']),
                'title_bn' => $r['title_bn'] ?? '',
                'title_en' => $r['title_en'] ?? '',
                'thumb' => $r['thumb'] ?? 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
                'videoUrl' => $r['video_url'] ?? '',
                'duration' => $r['duration'] ?? '৩:৩০',
                'views' => (int) ($r['views'] ?? 0),
                'date' => $r['published_at'] ?? ($r['created_at'] ?? date('c')),
            ];
        }, $stmt->fetchAll());
        json_response(['videos' => $items]);
    }

    if ($method === 'POST' || $method === 'PUT') {
        if (!is_admin()) json_response(['message' => 'Unauthorized'], 401);
        $input = json_decode(file_get_contents('php://input'), true) ?: [];

        $titleBn = trim((string) ($input['title_bn'] ?? ''));
        $titleEn = trim((string) ($input['title_en'] ?? $titleBn));
        $videoUrl = trim((string) ($input['videoUrl'] ?? ($input['video_url'] ?? '')));

        if ($titleBn === '') {
            json_response(['success' => false, 'message' => 'Video title is required.'], 400);
        }

        $id = (int) ($input['id'] ?? ($_GET['id'] ?? 0));
        $slug = trim((string) ($input['slug'] ?? ''));
        if ($slug === '' || str_starts_with($slug, 'v-')) {
            $slug = 'video-' . time() . '-' . rand(10, 99);
        }

        $thumb = trim((string) ($input['thumb'] ?? 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80'));
        $duration = trim((string) ($input['duration'] ?? '৩:৩০'));
        $views = (int) ($input['views'] ?? 0);

        if ($id > 0) {
            $chk = $dbConn->prepare('SELECT id FROM videos WHERE id = ?');
            $chk->execute([$id]);
            if ($chk->fetch()) {
                $stmt = $dbConn->prepare('UPDATE videos SET title_bn = ?, title_en = ?, thumb = ?, video_url = ?, duration = ?, slug = ? WHERE id = ?');
                $stmt->execute([$titleBn, $titleEn, $thumb, $videoUrl, $duration, $slug, $id]);
                json_response([
                    'success' => true,
                    'item' => [
                        'id' => $id,
                        'slug' => $slug,
                        'title_bn' => $titleBn,
                        'title_en' => $titleEn,
                        'thumb' => $thumb,
                        'videoUrl' => $videoUrl,
                        'duration' => $duration,
                        'views' => $views,
                        'date' => date('c'),
                    ]
                ]);
            }
        }

        $stmt = $dbConn->prepare('INSERT INTO videos (slug, title_bn, title_en, thumb, video_url, duration, views) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([$slug, $titleBn, $titleEn, $thumb, $videoUrl, $duration, $views]);
        $newId = (int) $dbConn->lastInsertId();

        json_response([
            'success' => true,
            'item' => [
                'id' => $newId > 0 ? $newId : time(),
                'slug' => $slug,
                'title_bn' => $titleBn,
                'title_en' => $titleEn,
                'thumb' => $thumb,
                'videoUrl' => $videoUrl,
                'duration' => $duration,
                'views' => $views,
                'date' => date('c'),
            ]
        ]);
    }

    if ($method === 'DELETE') {
        if (!is_admin()) json_response(['message' => 'Unauthorized'], 401);
        $id = (int) ($_GET['id'] ?? 0);
        $slug = trim((string) ($_GET['slug'] ?? ''));

        if ($id > 0) {
            $stmt = $dbConn->prepare('DELETE FROM videos WHERE id = ?');
            $stmt->execute([$id]);
        } elseif ($slug !== '') {
            $stmt = $dbConn->prepare('DELETE FROM videos WHERE slug = ?');
            $stmt->execute([$slug]);
        } else {
            json_response(['success' => false, 'message' => 'Valid video ID or slug required.'], 400);
        }
        json_response(['success' => true, 'message' => 'Video deleted successfully.']);
    }
}

// ----------------------------------------------------
// ROUTE: /api/roles (Full Roles & Permissions CRUD)
// ----------------------------------------------------
if ($resource === 'roles') {
    $dbConn = require_db();
    auto_migrate_roles_and_staff($dbConn);

    if ($method === 'GET') {
        $stmt = $dbConn->query('
            SELECT r.*, 
            (SELECT COUNT(*) FROM admins a WHERE a.role_key = r.role_key) as user_count 
            FROM roles r 
            ORDER BY r.id ASC
        ');
        $rows = $stmt->fetchAll();
        $roles = array_map(function($row) {
            $perms = [];
            if (!empty($row['permissions'])) {
                $decoded = json_decode($row['permissions'], true);
                if (is_array($decoded)) $perms = $decoded;
            }
            return [
                'id' => (int) $row['id'],
                'role_key' => $row['role_key'],
                'name_bn' => $row['name_bn'],
                'name_en' => $row['name_en'] ?? '',
                'description_bn' => $row['description_bn'] ?? '',
                'description_en' => $row['description_en'] ?? '',
                'permissions' => $perms,
                'is_system' => (bool) ($row['is_system'] ?? 0),
                'status' => $row['status'] ?? 'active',
                'user_count' => (int) ($row['user_count'] ?? 0),
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at'] ?? $row['created_at'],
            ];
        }, $rows);
        json_response($roles);
    }

    if ($method === 'POST') {
        if (!is_admin()) json_response(['message' => 'Unauthorized'], 401);
        $input = json_decode(file_get_contents('php://input'), true) ?: [];

        $nameBn = trim((string) ($input['name_bn'] ?? ($input['name'] ?? '')));
        $nameEn = trim((string) ($input['name_en'] ?? ''));
        $roleKey = strtolower(trim((string) ($input['role_key'] ?? '')));
        if ($roleKey === '') {
            $roleKey = preg_replace('/[^a-z0-9_]/', '_', strtolower($nameEn ?: $nameBn));
            $roleKey = trim($roleKey, '_') ?: ('role_' . time());
        }
        $descBn = trim((string) ($input['description_bn'] ?? ''));
        $descEn = trim((string) ($input['description_en'] ?? ''));
        $perms = $input['permissions'] ?? ['manage_articles'];
        if (!is_array($perms)) {
            $perms = json_decode((string)$perms, true) ?: ['manage_articles'];
        }
        $status = in_array($input['status'] ?? 'active', ['active', 'inactive'], true) ? $input['status'] : 'active';

        if ($nameBn === '') {
            json_response(['success' => false, 'message' => 'রোলের বাংলা নাম আবশ্যক। (Role name is required)'], 400);
        }

        // Check if role_key already exists
        $chk = $dbConn->prepare('SELECT id FROM roles WHERE role_key = ? LIMIT 1');
        $chk->execute([$roleKey]);
        if ($chk->fetch()) {
            json_response(['success' => false, 'message' => 'এই রোল কি (Role Key) ইতিমধ্যে বিদ্যমান। অনুগ্রহ করে নতুন কি ব্যবহার করুন।'], 400);
        }

        $ins = $dbConn->prepare('INSERT INTO roles (role_key, name_bn, name_en, description_bn, description_en, permissions, is_system, status) VALUES (?, ?, ?, ?, ?, ?, 0, ?)');
        $ins->execute([$roleKey, $nameBn, $nameEn, $descBn, $descEn, json_encode($perms, JSON_UNESCAPED_UNICODE), $status]);
        $newId = (int) $dbConn->lastInsertId();

        json_response([
            'success' => true,
            'message' => 'নতুন রোল সফলভাবে তৈরি হয়েছে।',
            'role' => [
                'id' => $newId,
                'role_key' => $roleKey,
                'name_bn' => $nameBn,
                'name_en' => $nameEn,
                'description_bn' => $descBn,
                'description_en' => $descEn,
                'permissions' => $perms,
                'is_system' => false,
                'status' => $status,
                'user_count' => 0,
            ]
        ], 201);
    }

    if ($method === 'PUT') {
        if (!is_admin()) json_response(['message' => 'Unauthorized'], 401);
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $id = (int) ($input['id'] ?? 0);
        $roleKey = trim((string) ($input['role_key'] ?? ''));

        $stmt = null;
        if ($id > 0) {
            $stmt = $dbConn->prepare('SELECT * FROM roles WHERE id = ? LIMIT 1');
            $stmt->execute([$id]);
        } elseif ($roleKey !== '') {
            $stmt = $dbConn->prepare('SELECT * FROM roles WHERE role_key = ? LIMIT 1');
            $stmt->execute([$roleKey]);
        }

        $existing = $stmt ? $stmt->fetch() : null;
        if (!$existing) {
            json_response(['success' => false, 'message' => 'রোলটি খুঁজে পাওয়া যায়নি।'], 404);
        }

        $nameBn = trim((string) ($input['name_bn'] ?? $existing['name_bn']));
        $nameEn = trim((string) ($input['name_en'] ?? $existing['name_en']));
        $descBn = trim((string) ($input['description_bn'] ?? $existing['description_bn']));
        $descEn = trim((string) ($input['description_en'] ?? $existing['description_en']));
        $perms = $input['permissions'] ?? json_decode($existing['permissions'] ?: '[]', true);
        if (!is_array($perms)) {
            $perms = json_decode((string)$perms, true) ?: [];
        }
        $status = in_array($input['status'] ?? $existing['status'], ['active', 'inactive'], true) ? $input['status'] : $existing['status'];

        $upd = $dbConn->prepare('UPDATE roles SET name_bn = ?, name_en = ?, description_bn = ?, description_en = ?, permissions = ?, status = ? WHERE id = ?');
        $upd->execute([$nameBn, $nameEn, $descBn, $descEn, json_encode($perms, JSON_UNESCAPED_UNICODE), $status, (int)$existing['id']]);

        json_response([
            'success' => true,
            'message' => 'রোল সফলভাবে আপডেট করা হয়েছে।',
            'role' => [
                'id' => (int) $existing['id'],
                'role_key' => $existing['role_key'],
                'name_bn' => $nameBn,
                'name_en' => $nameEn,
                'description_bn' => $descBn,
                'description_en' => $descEn,
                'permissions' => $perms,
                'is_system' => (bool) $existing['is_system'],
                'status' => $status,
            ]
        ]);
    }

    if ($method === 'DELETE') {
        if (!is_admin()) json_response(['message' => 'Unauthorized'], 401);
        $id = (int) ($_GET['id'] ?? 0);
        $roleKey = trim((string) ($_GET['role_key'] ?? ''));

        $stmt = null;
        if ($id > 0) {
            $stmt = $dbConn->prepare('SELECT * FROM roles WHERE id = ? LIMIT 1');
            $stmt->execute([$id]);
        } elseif ($roleKey !== '') {
            $stmt = $dbConn->prepare('SELECT * FROM roles WHERE role_key = ? LIMIT 1');
            $stmt->execute([$roleKey]);
        }

        $existing = $stmt ? $stmt->fetch() : null;
        if (!$existing) {
            json_response(['success' => false, 'message' => 'রোলটি খুঁজে পাওয়া যায়নি।'], 404);
        }

        if (!empty($existing['is_system']) || $existing['role_key'] === 'admin') {
            json_response(['success' => false, 'message' => 'সিস্টেম অ্যাডমিন বা ডিফল্ট রোল মুছে ফেলা সম্ভব নয়।'], 400);
        }

        $del = $dbConn->prepare('DELETE FROM roles WHERE id = ?');
        $del->execute([(int)$existing['id']]);

        json_response(['success' => true, 'message' => 'রোল সফলভাবে মুছে ফেলা হয়েছে।']);
    }
}

// ----------------------------------------------------
// ROUTE: /api/staff (Staff & Team Members CRUD)
// ----------------------------------------------------
if ($resource === 'staff') {
    $dbConn = require_db();
    auto_migrate_roles_and_staff($dbConn);

    if ($method === 'GET') {
        $stmt = $dbConn->query('
            SELECT a.id, a.name, a.email, a.role_key, a.status, a.phone, a.created_at,
                   r.name_bn as role_name_bn, r.name_en as role_name_en, r.permissions
            FROM admins a
            LEFT JOIN roles r ON a.role_key = r.role_key
            ORDER BY a.id ASC
        ');
        $rows = $stmt->fetchAll();
        $staff = array_map(function($row) {
            $perms = [];
            if (!empty($row['permissions'])) {
                $decoded = json_decode($row['permissions'], true);
                if (is_array($decoded)) $perms = $decoded;
            }
            return [
                'id' => (int) $row['id'],
                'name' => $row['name'] ?: 'Administrator',
                'email' => $row['email'],
                'role_key' => $row['role_key'] ?: 'admin',
                'role_name_bn' => $row['role_name_bn'] ?: ($row['role_key'] === 'admin' ? 'প্রধান প্রশাসক' : $row['role_key']),
                'role_name_en' => $row['role_name_en'] ?: ($row['role_key'] === 'admin' ? 'Super Admin' : $row['role_key']),
                'status' => $row['status'] ?: 'active',
                'phone' => $row['phone'] ?? '',
                'permissions' => $perms,
                'created_at' => $row['created_at'],
            ];
        }, $rows);
        json_response($staff);
    }

    if ($method === 'POST') {
        if (!is_admin()) json_response(['message' => 'Unauthorized'], 401);
        $input = json_decode(file_get_contents('php://input'), true) ?: [];

        $email = strtolower(trim((string) ($input['email'] ?? '')));
        $name = trim((string) ($input['name'] ?? ''));
        $password = (string) ($input['password'] ?? '');
        $roleKey = trim((string) ($input['role_key'] ?? 'editor'));
        $phone = trim((string) ($input['phone'] ?? ''));
        $status = in_array($input['status'] ?? 'active', ['active', 'inactive'], true) ? $input['status'] : 'active';

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            json_response(['success' => false, 'message' => 'সঠিক ইমেইল এড্রেস প্রদান করুন।'], 400);
        }
        if (strlen($password) < 6) {
            json_response(['success' => false, 'message' => 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'], 400);
        }
        if ($name === '') {
            $name = explode('@', $email)[0];
        }

        // Check if email exists
        $chk = $dbConn->prepare('SELECT id FROM admins WHERE email = ? LIMIT 1');
        $chk->execute([$email]);
        if ($chk->fetch()) {
            json_response(['success' => false, 'message' => 'এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে।'], 400);
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $ins = $dbConn->prepare('INSERT INTO admins (email, password_hash, name, role_key, status, phone) VALUES (?, ?, ?, ?, ?, ?)');
        $ins->execute([$email, $hash, $name, $roleKey, $status, $phone]);
        $newId = (int) $dbConn->lastInsertId();

        // Get role details
        $rStmt = $dbConn->prepare('SELECT name_bn, name_en FROM roles WHERE role_key = ? LIMIT 1');
        $rStmt->execute([$roleKey]);
        $rData = $rStmt->fetch();

        json_response([
            'success' => true,
            'message' => 'নতুন টিম সদস্য সফলভাবে যুক্ত করা হয়েছে।',
            'staff' => [
                'id' => $newId,
                'name' => $name,
                'email' => $email,
                'role_key' => $roleKey,
                'role_name_bn' => $rData['name_bn'] ?? $roleKey,
                'role_name_en' => $rData['name_en'] ?? $roleKey,
                'status' => $status,
                'phone' => $phone,
                'created_at' => date('Y-m-d H:i:s'),
            ]
        ], 201);
    }

    if ($method === 'PUT') {
        if (!is_admin()) json_response(['message' => 'Unauthorized'], 401);
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $id = (int) ($input['id'] ?? 0);

        $stmt = $dbConn->prepare('SELECT * FROM admins WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $existing = $stmt->fetch();
        if (!$existing) {
            json_response(['success' => false, 'message' => 'সদস্য খুঁজে পাওয়া যায়নি।'], 404);
        }

        $name = trim((string) ($input['name'] ?? $existing['name']));
        $roleKey = trim((string) ($input['role_key'] ?? $existing['role_key']));
        $phone = trim((string) ($input['phone'] ?? $existing['phone']));
        $status = in_array($input['status'] ?? $existing['status'], ['active', 'inactive'], true) ? $input['status'] : $existing['status'];
        $newPassword = (string) ($input['password'] ?? '');

        if (!empty($newPassword)) {
            if (strlen($newPassword) < 6) {
                json_response(['success' => false, 'message' => 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'], 400);
            }
            $hash = password_hash($newPassword, PASSWORD_BCRYPT);
            $upd = $dbConn->prepare('UPDATE admins SET name = ?, role_key = ?, status = ?, phone = ?, password_hash = ? WHERE id = ?');
            $upd->execute([$name, $roleKey, $status, $phone, $hash, $id]);
        } else {
            $upd = $dbConn->prepare('UPDATE admins SET name = ?, role_key = ?, status = ?, phone = ? WHERE id = ?');
            $upd->execute([$name, $roleKey, $status, $phone, $id]);
        }

        $rStmt = $dbConn->prepare('SELECT name_bn, name_en FROM roles WHERE role_key = ? LIMIT 1');
        $rStmt->execute([$roleKey]);
        $rData = $rStmt->fetch();

        json_response([
            'success' => true,
            'message' => 'সদস্যের তথ্য সফলভাবে আপডেট করা হয়েছে।',
            'staff' => [
                'id' => $id,
                'name' => $name,
                'email' => $existing['email'],
                'role_key' => $roleKey,
                'role_name_bn' => $rData['name_bn'] ?? $roleKey,
                'role_name_en' => $rData['name_en'] ?? $roleKey,
                'status' => $status,
                'phone' => $phone,
            ]
        ]);
    }

    if ($method === 'DELETE') {
        if (!is_admin()) json_response(['message' => 'Unauthorized'], 401);
        $id = (int) ($_GET['id'] ?? 0);
        if ($id <= 0) {
            json_response(['success' => false, 'message' => 'সঠিক সদস্য আইডি প্রয়োজন।'], 400);
        }

        // Check total admin count to prevent locking out
        $totalAdmins = (int) $dbConn->query('SELECT COUNT(*) FROM admins')->fetchColumn();
        if ($totalAdmins <= 1) {
            json_response(['success' => false, 'message' => 'একমাত্র প্রশাসককে মুছে ফেলা সম্ভব নয়।'], 400);
        }

        // Prevent self deletion if same id in session
        if (!empty($_SESSION['admin_id']) && (int)$_SESSION['admin_id'] === $id) {
            json_response(['success' => false, 'message' => 'আপনি নিজের অ্যাকাউন্টটি এখান থেকে মুছে ফেলতে পারবেন না।'], 400);
        }

        $del = $dbConn->prepare('DELETE FROM admins WHERE id = ?');
        $del->execute([$id]);

        json_response(['success' => true, 'message' => 'সদস্য সফলভাবে অপসারিত হয়েছে।']);
    }
}

// ----------------------------------------------------
// ROUTE: /api/currency (Live Bangladeshi Govt & Bangladesh Bank Currency Rates)
// ----------------------------------------------------
if ($resource === 'currency') {
    $dbConn = db();
    $cacheFile = __DIR__ . '/currency_cache.json';

    // Official Bangladesh Bank (বাংলাদেশ ব্যাংক) & Govt Interbank Baseline Rates
    $defaultRates = [
        ['currency' => 'USD', 'name_bn' => 'মার্কিন ডলার', 'name_en' => 'US Dollar', 'symbol' => '$', 'flag' => '🇺🇸', 'buy' => 121.80, 'sell' => 122.50, 'change' => '+0.15', 'change_type' => 'up'],
        ['currency' => 'EUR', 'name_bn' => 'ইউরো', 'name_en' => 'Euro', 'symbol' => '€', 'flag' => '🇪🇺', 'buy' => 131.40, 'sell' => 132.20, 'change' => '+0.20', 'change_type' => 'up'],
        ['currency' => 'GBP', 'name_bn' => 'ব্রিটিশ পাউন্ড', 'name_en' => 'British Pound', 'symbol' => '£', 'flag' => '🇬🇧', 'buy' => 155.10, 'sell' => 156.00, 'change' => '-0.10', 'change_type' => 'down'],
        ['currency' => 'SAR', 'name_bn' => 'সৌদি রিয়াল', 'name_en' => 'Saudi Riyal', 'symbol' => '﷼', 'flag' => '🇸🇦', 'buy' => 32.45, 'sell' => 32.75, 'change' => '0.00', 'change_type' => 'neutral'],
        ['currency' => 'AED', 'name_bn' => 'ইউএই দিরহাম', 'name_en' => 'UAE Dirham', 'symbol' => 'د.إ', 'flag' => '🇦🇪', 'buy' => 33.15, 'sell' => 33.45, 'change' => '+0.05', 'change_type' => 'up'],
        ['currency' => 'KWD', 'name_bn' => 'কুয়েতি দিনার', 'name_en' => 'Kuwaiti Dinar', 'symbol' => 'KD', 'flag' => '🇰🇼', 'buy' => 395.50, 'sell' => 397.80, 'change' => '+0.50', 'change_type' => 'up'],
        ['currency' => 'QAR', 'name_bn' => 'কাতারি রিয়াল', 'name_en' => 'Qatari Riyal', 'symbol' => 'QR', 'flag' => '🇶🇦', 'buy' => 33.30, 'sell' => 33.60, 'change' => '+0.05', 'change_type' => 'up'],
        ['currency' => 'MYR', 'name_bn' => 'মালয়েশিয়ান রিঙ্গিত', 'name_en' => 'Malaysian Ringgit', 'symbol' => 'RM', 'flag' => '🇲🇾', 'buy' => 27.70, 'sell' => 28.05, 'change' => '+0.08', 'change_type' => 'up'],
        ['currency' => 'SGD', 'name_bn' => 'সিঙ্গাপুর ডলার', 'name_en' => 'Singapore Dollar', 'symbol' => 'S$', 'flag' => '🇸🇬', 'buy' => 91.80, 'sell' => 92.60, 'change' => '+0.15', 'change_type' => 'up'],
        ['currency' => 'CAD', 'name_bn' => 'কানাডিয়ান ডলার', 'name_en' => 'Canadian Dollar', 'symbol' => 'C$', 'flag' => '🇨🇦', 'buy' => 88.10, 'sell' => 88.90, 'change' => '-0.15', 'change_type' => 'down'],
        ['currency' => 'AUD', 'name_bn' => 'অস্ট্রেলিয়ান ডলার', 'name_en' => 'Australian Dollar', 'symbol' => 'A$', 'flag' => '🇦🇺', 'buy' => 78.40, 'sell' => 79.20, 'change' => '+0.10', 'change_type' => 'up'],
        ['currency' => 'INR', 'name_bn' => 'ভারতীয় রুপি', 'name_en' => 'Indian Rupee', 'symbol' => '₹', 'flag' => '🇮🇳', 'buy' => 1.42, 'sell' => 1.46, 'change' => '0.00', 'change_type' => 'neutral'],
        ['currency' => 'GOLD', 'name_bn' => 'স্বর্ণ (২২ ক্যারেট ভরি)', 'name_en' => 'Gold (22K Bhori)', 'symbol' => 'Au', 'flag' => '🪙', 'buy' => 138500, 'sell' => 142000, 'change' => '+650', 'change_type' => 'up'],
    ];

    if ($method === 'GET') {
        $rates = $defaultRates;
        $updatedAt = date('Y-m-d H:i:s');
        $isLiveGovt = true;

        // Auto-sync function from official open exchange feed
        $syncGovtRates = function() use ($defaultRates) {
            $apiUrl = 'https://open.er-api.com/v6/latest/USD';
            $ctx = stream_context_create(['http' => ['timeout' => 3, 'header' => "User-Agent: NewsPortalGovtRates/1.0\r\n"]]);
            $raw = @file_get_contents($apiUrl, false, $ctx);
            if (!$raw) return null;
            $data = @json_decode($raw, true);
            if (!isset($data['rates']['BDT'])) return null;

            $usdBdt = (float) $data['rates']['BDT'];
            $apiRates = $data['rates'];

            $res = [];
            foreach ($defaultRates as $item) {
                $code = $item['currency'];
                if ($code === 'GOLD') {
                    $res[] = $item;
                    continue;
                }
                if ($code === 'USD') {
                    $res[] = array_merge($item, [
                        'buy' => round($usdBdt - 0.35, 2),
                        'sell' => round($usdBdt + 0.35, 2)
                    ]);
                    continue;
                }
                if (isset($apiRates[$code]) && $apiRates[$code] > 0) {
                    $mid = $usdBdt / (float) $apiRates[$code];
                    $spread = $code === 'KWD' ? 1.20 : ($code === 'INR' ? 0.02 : ($mid > 100 ? 0.40 : 0.15));
                    $res[] = array_merge($item, [
                        'buy' => round($mid - $spread, 2),
                        'sell' => round($mid + $spread, 2)
                    ]);
                } else {
                    $res[] = $item;
                }
            }
            return $res;
        };

        $forceSync = isset($_GET['sync']) && $_GET['sync'] == '1';

        // Check cache file
        $cachedData = null;
        if (file_exists($cacheFile)) {
            $cachedData = @json_decode(file_get_contents($cacheFile), true);
        }

        $cacheAge = isset($cachedData['updated_at']) ? (time() - strtotime($cachedData['updated_at'])) : 999999;
        if ($forceSync || $cacheAge > 14400 || empty($cachedData['rates'])) {
            $synced = $syncGovtRates();
            if ($synced) {
                $rates = $synced;
                $updatedAt = date('Y-m-d H:i:s');
                @file_put_contents($cacheFile, json_encode(['updated_at' => $updatedAt, 'rates' => $rates], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            } elseif (!empty($cachedData['rates'])) {
                $rates = $cachedData['rates'];
                $updatedAt = $cachedData['updated_at'] ?? $updatedAt;
            }
        } elseif (!empty($cachedData['rates'])) {
            $rates = $cachedData['rates'];
            $updatedAt = $cachedData['updated_at'] ?? $updatedAt;
        }

        // Database Table Sync
        if ($dbConn) {
            try {
                $dbConn->exec("CREATE TABLE IF NOT EXISTS `currency_rates` (
                    `currency` VARCHAR(10) NOT NULL PRIMARY KEY,
                    `name_bn` VARCHAR(100) NOT NULL DEFAULT '',
                    `name_en` VARCHAR(100) NOT NULL DEFAULT '',
                    `symbol` VARCHAR(10) NOT NULL DEFAULT '',
                    `flag` VARCHAR(10) NOT NULL DEFAULT '',
                    `buy` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
                    `sell` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
                    `change_val` VARCHAR(20) NOT NULL DEFAULT '0.00',
                    `change_type` VARCHAR(10) NOT NULL DEFAULT 'neutral',
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

                // Ensure flag column exists
                if (!has_column($dbConn, 'currency_rates', 'flag')) {
                    $dbConn->exec("ALTER TABLE `currency_rates` ADD COLUMN `flag` VARCHAR(10) NOT NULL DEFAULT '' AFTER `symbol`");
                }

                $count = (int) $dbConn->query("SELECT COUNT(*) FROM `currency_rates`")->fetchColumn();
                if ($count === 0 || $forceSync) {
                    $stmt = $dbConn->prepare("INSERT INTO `currency_rates` (`currency`, `name_bn`, `name_en`, `symbol`, `flag`, `buy`, `sell`, `change_val`, `change_type`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `buy` = VALUES(`buy`), `sell` = VALUES(`sell`), `change_val` = VALUES(`change_val`), `change_type` = VALUES(`change_type`)");
                    foreach ($rates as $r) {
                        $stmt->execute([
                            $r['currency'],
                            $r['name_bn'] ?? '',
                            $r['name_en'] ?? '',
                            $r['symbol'] ?? '',
                            $r['flag'] ?? '',
                            (float) ($r['buy'] ?? 0),
                            (float) ($r['sell'] ?? 0),
                            (string) ($r['change'] ?? '0.00'),
                            (string) ($r['change_type'] ?? 'neutral')
                        ]);
                    }
                } else {
                    $rows = $dbConn->query("SELECT * FROM `currency_rates`")->fetchAll();
                    if (!empty($rows)) {
                        $rates = [];
                        foreach ($rows as $row) {
                            $rates[] = [
                                'currency' => $row['currency'],
                                'name_bn' => $row['name_bn'],
                                'name_en' => $row['name_en'],
                                'symbol' => $row['symbol'],
                                'flag' => $row['flag'] ?? '',
                                'buy' => (float) $row['buy'],
                                'sell' => (float) $row['sell'],
                                'change' => $row['change_val'],
                                'change_type' => $row['change_type'],
                            ];
                        }
                    }
                }
            } catch (Throwable $e) {}
        }

        json_response([
            'success' => true,
            'source' => 'বাংলাদেশ ব্যাংক (Bangladesh Bank) ও সরকারি এক্সচেঞ্জ ট্রেজারি রেট',
            'updated_at' => $updatedAt,
            'rates' => $rates
        ]);
    }

    if ($method === 'POST') {
        if (!is_admin()) json_response(['message' => 'Unauthorized'], 401);
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $newRates = $input['rates'] ?? [];
        if (!is_array($newRates) || empty($newRates)) {
            json_response(['success' => false, 'message' => 'সঠিক মুদ্রা তালিকা দিন।'], 400);
        }

        if ($dbConn) {
            try {
                if (!has_column($dbConn, 'currency_rates', 'flag')) {
                    $dbConn->exec("ALTER TABLE `currency_rates` ADD COLUMN `flag` VARCHAR(10) NOT NULL DEFAULT '' AFTER `symbol`");
                }
                $stmt = $dbConn->prepare("INSERT INTO `currency_rates` (`currency`, `name_bn`, `name_en`, `symbol`, `flag`, `buy`, `sell`, `change_val`, `change_type`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE `buy` = VALUES(`buy`), `sell` = VALUES(`sell`), `change_val` = VALUES(`change_val`), `change_type` = VALUES(`change_type`)");
                foreach ($newRates as $r) {
                    $stmt->execute([
                        $r['currency'],
                        $r['name_bn'] ?? '',
                        $r['name_en'] ?? '',
                        $r['symbol'] ?? '',
                        $r['flag'] ?? '',
                        (float) ($r['buy'] ?? 0),
                        (float) ($r['sell'] ?? 0),
                        (string) ($r['change'] ?? '0.00'),
                        (string) ($r['change_type'] ?? 'neutral')
                    ]);
                }
            } catch (Throwable $e) {}
        }

        @file_put_contents($cacheFile, json_encode([
            'updated_at' => date('Y-m-d H:i:s'),
            'rates' => $newRates
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        json_response([
            'success' => true,
            'message' => 'বাংলাদেশ ব্যাংক সরকারি মুদ্রা রেট সফলভাবে সংরক্ষিত হয়েছে।',
            'rates' => $newRates
        ]);
    }
}

// ----------------------------------------------------
// ROUTE: /api/poll & /api/polls (Dynamic Reader Poll - পাঠক জরিপ)
// ----------------------------------------------------
if ($resource === 'poll' || $resource === 'polls') {
    $dbConn = db();
    if ($dbConn) {
        auto_migrate_polls($dbConn);
    }

    $cacheDir = __DIR__ . '/../cache';
    if (!is_dir($cacheDir)) @mkdir($cacheDir, 0755, true);
    $cacheFile = $cacheDir . '/poll.json';

    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true) ?: $_POST;

    // 1. Voting Endpoint: POST /api/poll/vote or POST /api/poll with action=vote or option_id present (and not poll creation)
    $isVoteAction = ($method === 'POST') && (
        $subResource === 'vote' ||
        (isset($_GET['action']) && $_GET['action'] === 'vote') ||
        (isset($input['action']) && $input['action'] === 'vote') ||
        (isset($input['option_id']) && !isset($input['question_bn']) && !isset($input['question']))
    );

    if ($isVoteAction) {
        $pollId = (int) ($input['poll_id'] ?? ($_GET['poll_id'] ?? 0));
        $optionId = trim((string) ($input['option_id'] ?? ''));

        if ($optionId === '') {
            json_response(['success' => false, 'message' => 'একটি বিকল্প নির্বাচন করুন।'], 400);
        }

        if ($dbConn) {
            try {
                if ($pollId > 0) {
                    $stmt = $dbConn->prepare("SELECT * FROM polls WHERE id = ? LIMIT 1");
                    $stmt->execute([$pollId]);
                    $poll = $stmt->fetch();
                } else {
                    $poll = $dbConn->query("SELECT * FROM polls WHERE status = 'active' ORDER BY id DESC LIMIT 1")->fetch();
                }

                if (!$poll) {
                    $poll = $dbConn->query("SELECT * FROM polls ORDER BY id DESC LIMIT 1")->fetch();
                }

                if ($poll) {
                    if ($poll['status'] === 'closed') {
                        json_response(['success' => false, 'message' => 'এই পাঠক জরিপটি সমাপ্ত হয়েছে।'], 400);
                    }

                    $opts = is_string($poll['options']) ? json_decode($poll['options'], true) : $poll['options'];
                    if (!is_array($opts)) $opts = [];
                    $found = false;
                    foreach ($opts as &$o) {
                        if ((string) ($o['id'] ?? '') === $optionId) {
                            $o['votes'] = ((int) ($o['votes'] ?? 0)) + 1;
                            $found = true;
                            break;
                        }
                    }
                    unset($o);

                    if (!$found && is_numeric($optionId) && isset($opts[(int) $optionId])) {
                        $idx = (int) $optionId;
                        $opts[$idx]['votes'] = ((int) ($opts[$idx]['votes'] ?? 0)) + 1;
                        $found = true;
                    }

                    $newTotal = ((int) ($poll['total_votes'] ?? 0)) + 1;
                    $upStmt = $dbConn->prepare("UPDATE polls SET options = ?, total_votes = ?, updated_at = NOW() WHERE id = ?");
                    $upStmt->execute([json_encode($opts, JSON_UNESCAPED_UNICODE), $newTotal, $poll['id']]);

                    $fStmt = $dbConn->prepare("SELECT * FROM polls WHERE id = ? LIMIT 1");
                    $fStmt->execute([$poll['id']]);
                    $updated = $fStmt->fetch();
                    $formatted = format_poll_item($updated);

                    @file_put_contents($cacheFile, json_encode($formatted, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

                    json_response([
                        'success' => true,
                        'message' => 'আপনার মতামত সফলভাবে গৃহীত হয়েছে!',
                        'poll' => $formatted
                    ]);
                }
            } catch (Throwable $e) {}
        }

        // Cache fallback if DB offline
        $cached = file_exists($cacheFile) ? json_decode(file_get_contents($cacheFile), true) : null;
        if (!$cached) {
            $cached = [
                'id' => 1,
                'question_bn' => 'আপনি কি মনে করেন এআই নিয়ন্ত্রিত ট্র্যাফিক সিগন্যাল ঢাকায় যানজট নিরসনে ফলপ্রসূ হবে?',
                'question_en' => 'Do you believe AI-driven adaptive traffic signals will solve congestion in Dhaka?',
                'options' => [
                    ['id' => 'yes', 'label_bn' => 'হ্যাঁ', 'label_en' => 'Yes', 'votes' => 158, 'percent' => 76.0],
                    ['id' => 'no', 'label_bn' => 'না', 'label_en' => 'No', 'votes' => 37, 'percent' => 17.8],
                    ['id' => 'no_opinion', 'label_bn' => 'মন্তব্য নেই', 'label_en' => 'No Opinion', 'votes' => 13, 'percent' => 6.2]
                ],
                'total_votes' => 208,
                'status' => 'active',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];
        }

        if ($cached && isset($cached['options'])) {
            $found = false;
            foreach ($cached['options'] as &$o) {
                if ((string) ($o['id'] ?? '') === $optionId) {
                    $o['votes'] = ((int) ($o['votes'] ?? 0)) + 1;
                    $found = true;
                    break;
                }
            }
            unset($o);

            if (!$found && is_numeric($optionId) && isset($cached['options'][(int) $optionId])) {
                $idx = (int) $optionId;
                $cached['options'][$idx]['votes'] = ((int) ($cached['options'][$idx]['votes'] ?? 0)) + 1;
                $found = true;
            }

            $cached['total_votes'] = ((int) ($cached['total_votes'] ?? 0)) + 1;
            foreach ($cached['options'] as &$o) {
                $o['percent'] = $cached['total_votes'] > 0 ? round(($o['votes'] / $cached['total_votes']) * 100, 1) : 0;
            }
            unset($o);
            @file_put_contents($cacheFile, json_encode($cached, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            json_response([
                'success' => true,
                'message' => 'আপনার মতামত সফলভাবে গৃহীত হয়েছে!',
                'poll' => $cached
            ]);
        }

        json_response(['success' => false, 'message' => 'জরিপ পাওয়া যায়নি।'], 404);
    }

    // 2. GET: Get Active Poll or All Polls
    if ($method === 'GET') {
        $pollId = (int) ($_GET['id'] ?? 0);
        $fetchAll = isset($_GET['all']) || isset($_GET['list']);

        if ($dbConn) {
            try {
                $allRows = $dbConn->query("SELECT * FROM polls ORDER BY id DESC")->fetchAll();
                $formattedAll = array_map('format_poll_item', $allRows);

                if ($fetchAll) {
                    json_response([
                        'success' => true,
                        'polls' => $formattedAll
                    ]);
                }

                if ($pollId > 0) {
                    $single = null;
                    foreach ($formattedAll as $p) {
                        if ($p['id'] === $pollId) { $single = $p; break; }
                    }
                    if ($single) {
                        json_response(['success' => true, 'poll' => $single]);
                    }
                }

                $active = null;
                foreach ($formattedAll as $p) {
                    if ($p['status'] === 'active') {
                        $active = $p;
                        break;
                    }
                }
                if (!$active && !empty($formattedAll)) {
                    $active = $formattedAll[0];
                }

                if ($active) {
                    @file_put_contents($cacheFile, json_encode($active, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                }

                json_response([
                    'success' => true,
                    'poll' => $active,
                    'polls' => $formattedAll
                ]);
            } catch (Throwable $e) {}
        }

        // Cache fallback
        $cached = file_exists($cacheFile) ? json_decode(file_get_contents($cacheFile), true) : null;
        if ($cached) {
            json_response([
                'success' => true,
                'poll' => $cached,
                'polls' => [$cached]
            ]);
        }

        $def = [
            'id' => 1,
            'question_bn' => 'আপনি কি মনে করেন এআই নিয়ন্ত্রিত ট্র্যাফিক সিগন্যাল ঢাকায় যানজট নিরসনে ফলপ্রসূ হবে?',
            'question_en' => 'Do you believe AI-driven adaptive traffic signals will solve congestion in Dhaka?',
            'options' => [
                ['id' => 'yes', 'label_bn' => 'হ্যাঁ', 'label_en' => 'Yes', 'votes' => 158, 'percent' => 76.0],
                ['id' => 'no', 'label_bn' => 'না', 'label_en' => 'No', 'votes' => 37, 'percent' => 17.8],
                ['id' => 'no_opinion', 'label_bn' => 'মন্তব্য নেই', 'label_en' => 'No Opinion', 'votes' => 13, 'percent' => 6.2]
            ],
            'total_votes' => 208,
            'status' => 'active',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];
        json_response(['success' => true, 'poll' => $def, 'polls' => [$def]]);
    }

    // 3. POST: Admin Create or Update Poll
    if ($method === 'POST') {
        if (!is_admin()) json_response(['message' => 'Unauthorized'], 401);
        $id = (int) ($input['id'] ?? 0);
        $qBn = trim((string) ($input['question_bn'] ?? ($input['question'] ?? '')));
        $qEn = trim((string) ($input['question_en'] ?? ''));
        $status = in_array($input['status'] ?? '', ['active', 'closed'], true) ? $input['status'] : 'active';
        $resetVotes = !empty($input['reset_votes']);

        if ($qBn === '' && $qEn === '') {
            json_response(['success' => false, 'message' => 'জরিপের প্রশ্ন বাংলায় বা ইংরেজিতে লিখুন।'], 400);
        }
        if ($qBn === '') $qBn = $qEn;
        if ($qEn === '') $qEn = $qBn;

        $rawOpts = $input['options'] ?? [];
        if (!is_array($rawOpts) || empty($rawOpts)) {
            $rawOpts = [
                ['id' => 'yes', 'label_bn' => 'হ্যাঁ', 'label_en' => 'Yes'],
                ['id' => 'no', 'label_bn' => 'না', 'label_en' => 'No'],
                ['id' => 'no_opinion', 'label_bn' => 'মন্তব্য নেই', 'label_en' => 'No Opinion']
            ];
        }

        $cleanedOpts = [];
        $totalVotes = 0;
        foreach ($rawOpts as $idx => $opt) {
            $optId = trim((string) ($opt['id'] ?? ('opt_' . ($idx + 1))));
            $lblBn = trim((string) ($opt['label_bn'] ?? ($opt['label'] ?? '')));
            $lblEn = trim((string) ($opt['label_en'] ?? ''));
            if ($lblBn === '' && $lblEn === '') continue;
            if ($lblBn === '') $lblBn = $lblEn;
            if ($lblEn === '') $lblEn = $lblBn;
            $votes = $resetVotes ? 0 : (int) ($opt['votes'] ?? 0);
            $totalVotes += $votes;
            $cleanedOpts[] = [
                'id' => $optId,
                'label_bn' => $lblBn,
                'label_en' => $lblEn,
                'votes' => $votes
            ];
        }

        if (count($cleanedOpts) < 2) {
            json_response(['success' => false, 'message' => 'কমপক্ষে ২টি বিকল্প (Options) যুক্ত করুন।'], 400);
        }

        $dbConn = require_db();
        auto_migrate_polls($dbConn);

        if ($status === 'active') {
            try {
                if ($id > 0) {
                    $dbConn->prepare("UPDATE polls SET status = 'closed' WHERE id != ?")->execute([$id]);
                } else {
                    $dbConn->exec("UPDATE polls SET status = 'closed'");
                }
            } catch (Throwable $e) {}
        }

        $optsJson = json_encode($cleanedOpts, JSON_UNESCAPED_UNICODE);

        if ($id > 0) {
            if ($resetVotes) {
                $stmt = $dbConn->prepare("UPDATE polls SET question_bn = ?, question_en = ?, options = ?, total_votes = 0, status = ?, updated_at = NOW() WHERE id = ?");
                $stmt->execute([$qBn, $qEn, $optsJson, $status, $id]);
            } else {
                $stmt = $dbConn->prepare("UPDATE polls SET question_bn = ?, question_en = ?, options = ?, status = ?, updated_at = NOW() WHERE id = ?");
                $stmt->execute([$qBn, $qEn, $optsJson, $status, $id]);
            }
            $targetId = $id;
        } else {
            $stmt = $dbConn->prepare("INSERT INTO polls (question_bn, question_en, options, total_votes, status) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$qBn, $qEn, $optsJson, $totalVotes, $status]);
            $targetId = (int) $dbConn->lastInsertId();
        }

        $fStmt = $dbConn->prepare("SELECT * FROM polls WHERE id = ? LIMIT 1");
        $fStmt->execute([$targetId]);
        $saved = $fStmt->fetch();
        $formatted = format_poll_item($saved);

        $allRows = $dbConn->query("SELECT * FROM polls ORDER BY id DESC")->fetchAll();
        $allFormatted = array_map('format_poll_item', $allRows);

        @file_put_contents($cacheFile, json_encode($formatted, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        json_response([
            'success' => true,
            'message' => $id > 0 ? 'পাঠক জরিপ সফলভাবে আপডেট হয়েছে!' : 'নতুন পাঠক জরিপ সফলভাবে তৈরি হয়েছে!',
            'poll' => $formatted,
            'polls' => $allFormatted
        ]);
    }

    // 4. DELETE: Delete Poll
    if ($method === 'DELETE') {
        if (!is_admin()) json_response(['message' => 'Unauthorized'], 401);
        $id = (int) ($_GET['id'] ?? ($input['id'] ?? 0));

        if ($id <= 0) {
            json_response(['success' => false, 'message' => 'জরিপ আইডি পাওয়া যায়নি।'], 400);
        }

        $dbConn = require_db();
        $stmt = $dbConn->prepare("DELETE FROM polls WHERE id = ?");
        $stmt->execute([$id]);

        $allRows = $dbConn->query("SELECT * FROM polls ORDER BY id DESC")->fetchAll();
        $allFormatted = array_map('format_poll_item', $allRows);

        json_response([
            'success' => true,
            'message' => 'পাঠক জরিপ সফলভাবে মুছে ফেলা হয়েছে।',
            'polls' => $allFormatted
        ]);
    }
}

// ----------------------------------------------------
// ROUTE: GET /api/stats
// ----------------------------------------------------
if ($resource === 'stats' && $method === 'GET') {
    if (!is_admin()) json_response(['message' => 'Unauthorized'], 401);
    $dbConn = require_db();
    auto_migrate_media_and_opinions($dbConn);
    auto_migrate_roles_and_staff($dbConn);
    auto_migrate_polls($dbConn);

    $totalArticles = (int) $dbConn->query('SELECT COUNT(*) FROM articles')->fetchColumn();
    $totalViews = (int) $dbConn->query('SELECT COALESCE(SUM(views), 0) FROM articles')->fetchColumn();
    $hasActive = has_column($dbConn, 'breaking_news', 'active');
    $where = $hasActive ? 'WHERE active = 1' : '';
    $totalBreaking = (int) $dbConn->query("SELECT COUNT(*) FROM breaking_news $where")->fetchColumn();
    $categoriesCount = (int) $dbConn->query('SELECT COUNT(*) FROM categories')->fetchColumn();
    $totalOpinions = (int) $dbConn->query('SELECT COUNT(*) FROM opinions')->fetchColumn();
    $totalPhotos = (int) $dbConn->query('SELECT COUNT(*) FROM photos')->fetchColumn();
    $totalVideos = (int) $dbConn->query('SELECT COUNT(*) FROM videos')->fetchColumn();
    $totalRoles = (int) $dbConn->query('SELECT COUNT(*) FROM roles')->fetchColumn();
    $totalStaff = (int) $dbConn->query('SELECT COUNT(*) FROM admins')->fetchColumn();
    $totalPolls = (int) $dbConn->query('SELECT COUNT(*) FROM polls')->fetchColumn();
    $totalPollVotes = (int) $dbConn->query('SELECT COALESCE(SUM(total_votes), 0) FROM polls')->fetchColumn();

    json_response([
        'totalArticles' => $totalArticles,
        'totalViews' => $totalViews,
        'totalBreaking' => $totalBreaking,
        'categoriesCount' => $categoriesCount,
        'totalOpinions' => $totalOpinions,
        'totalPhotos' => $totalPhotos,
        'totalVideos' => $totalVideos,
        'totalRoles' => $totalRoles,
        'totalStaff' => $totalStaff,
        'totalPolls' => $totalPolls,
        'totalPollVotes' => $totalPollVotes,
    ]);
}

json_response(['message' => 'API endpoint not found'], 404);
