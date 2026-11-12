<?php
require_once __DIR__ . '/../config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . CORS_ORIGIN);
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_start();

function json_response($payload, $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

function is_admin(): bool
{
    return !empty($_SESSION['admin_authenticated']);
}

function db(): ?PDO
{
    static $pdo = null;

    if ($pdo === null) {
        try {
            $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } catch (Throwable $exception) {
            $pdo = false;
        }
    }

    return $pdo === false ? null : $pdo;
}

function default_news_payload(): array
{
    return [
        'categories' => ['National', 'Politics', 'International', 'Economy', 'Business', 'Sports', 'Entertainment', 'Technology', 'Education', 'Health', 'Lifestyle'],
        'breakingNews' => [
            ['id' => 1, 'title' => 'বরিশাল ও বরগুনায় বৃষ্টির সঙ্গে বজ্রপাতের সতর্কতা জারি', 'slug' => 'rain-warning-barisal'],
            ['id' => 2, 'title' => 'স্থলবন্দর, সেতু ও রেললাইনে উন্নয়নের নতুন চুক্তি', 'slug' => 'new-transport-pact'],
            ['id' => 3, 'title' => 'বাংলাদেশের অর্থনীতিতে রফতানি খাতে নতুন উল্লম্ফন', 'slug' => 'export-growth-bangladesh'],
        ],
        'articles' => [
            [
                'id' => 1,
                'slug' => 'bangladesh-flood-relief-response-grows',
                'title' => 'বন্যা কবলিত এলাকায় সহায়তা বাড়াচ্ছে বাংলাদেশ',
                'category' => 'National',
                'subheadline' => 'নদীর পানি বৃদ্ধির সঙ্গে সঙ্গে জরুরি ত্রাণ ও স্বাস্থ্যসেবা সম্প্রসারণ',
                'summary' => 'বন্যা-আক্রান্ত গ্রামগুলোতে খাবার, ত্রাণসামগ্রী ও চিকিৎসা সহায়তা বাড়িয়ে দিয়েছে সরকার ও নাগরিক সমাজ।',
                'author' => 'শাহরিয়ার হোসেন',
                'author_role' => 'সংবাদদাতা',
                'image' => 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=80',
                'image_caption' => 'নদীর পানির উপরে চলমান ত্রাণ কার্যক্রম',
                'image_credit' => 'ফাইল ছবি',
                'published_at' => '2026-11-11 09:30:00',
                'read_time' => '4 min read',
                'views' => 18420,
                'featured' => 1,
                'tags' => json_encode(['বন্যা', 'ত্রাণ'], JSON_UNESCAPED_UNICODE),
                'content' => '<p>বাংলাদেশের উত্তর ও দক্ষিণাঞ্চলের কিছু অংশে বন্যা পরিস্থিতি নাজুক হয়ে উঠেছে। সরকারী ও বেসরকারি সংস্থাগুলো পানি উন্নয়ন ও মন্ত্রণালয়ের সঙ্গে সমন্বয় করে ত্রাণ কার্যক্রম দ্রুত বাড়িয়েছে।</p><p>কৃষি জমিতে পানির কারণে ফসলের ক্ষতি হলেও স্থানীয় প্রশাসন দ্রুত সেচ ও খাদ্য সহায়তা পৌঁছে দিচ্ছে। বিশেষ করে শিশু ও বয়স্কদের জন্য ডায়রিয়া প্রতিরোধ ও পানি শুদ্ধিকরণের ব্যবস্থা নেওয়া হচ্ছে।</p><p>এদিকে, শিক্ষাপ্রতিষ্ঠান ও সামাজিক সংগঠনগুলোও ত্রাণ শিবিরে সহযোগিতা জোরদার করেছে। আবহাওয়া দপ্তর বলেছে, আগামী কয়েক দিনে বৃষ্টিপাত অব্যাহত থাকতে পারে।</p>',
            ],
            [
                'id' => 2,
                'slug' => 'economic-policy-boosts-export-sector',
                'title' => 'রফতানিমুখী নীতি নিয়ে নতুন আস্থা ফিরছে',
                'category' => 'Economy',
                'subheadline' => 'গার্মেন্টস ও কৃষি-ভিত্তিক রফতানি বৃদ্ধির পথে নতুন পদক্ষেপ',
                'summary' => 'বৈশ্বিক বাজারে চাহিদা বৃদ্ধির সঙ্গে রফতানিবান্ধব নীতিতে নতুন করে আস্থা দেখা যাচ্ছে।',
                'author' => 'মেহেদী হাসান',
                'author_role' => 'অর্থনীতি সম্পাদক',
                'image' => 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
                'image_caption' => 'অর্থনৈতিক কার্যক্রমে নতুন বিনিয়োগের প্রত্যাশা',
                'image_credit' => 'স্টক ছবি',
                'published_at' => '2026-11-10 10:00:00',
                'read_time' => '5 min read',
                'views' => 14680,
                'featured' => 0,
                'tags' => json_encode(['অর্থনীতি', 'রফতানি'], JSON_UNESCAPED_UNICODE),
                'content' => '<p>চীনের বাজারে নতুন চাহিদা এবং দেশের অভ্যন্তরীণ উৎপাদন বৃদ্ধির মাধ্যমে রফতানি আয় বাড়ছে।</p><p>কৃষিজাত ও পোশাক খাতে অর্ডারের সংখ্যা বেড়েছে, যা শ্রমিকদের কর্মসংস্থান ফিরিয়ে আনছে।</p><p>পর্যটন ও তথ্যপ্রযুক্তি খাতেও নতুন বিনিয়োগের সম্ভাবনা দেখা দিয়েছে।</p>',
            ],
        ],
    ];
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
    return [
        'id' => (int) $row['id'],
        'slug' => $row['slug'],
        'title' => $row['title'],
        'category' => $row['category'],
        'subheadline' => $row['subheadline'],
        'summary' => $row['summary'],
        'author' => $row['author'],
        'authorRole' => $row['author_role'],
        'image' => $row['image'],
        'imageCaption' => $row['image_caption'],
        'imageCredit' => $row['image_credit'],
        'date' => $row['published_at'],
        'readTime' => $row['read_time'],
        'views' => (int) $row['views'],
        'featured' => (bool) $row['featured'],
        'tags' => json_decode($row['tags'] ?? '[]', true) ?: [],
        'content' => $row['content'],
    ];
}

$route = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$route = preg_replace('#/+#', '/', $route);
$segments = array_values(array_filter(explode('/', trim($route, '/')), fn ($segment) => $segment !== ''));

if (count($segments) === 0 || $segments[0] !== 'api') {
    json_response(['message' => 'Invalid route'], 404);
}

$resource = $segments[1] ?? null;

if ($resource === 'health') {
    json_response(['status' => 'ok', 'php' => PHP_VERSION]);
}

if ($resource === 'categories' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $pdo = db();
    if ($pdo === null) {
        json_response(['categories' => default_news_payload()['categories']]);
    }

    $statement = $pdo->query('SELECT name FROM categories ORDER BY id ASC');
    $categories = array_map(fn ($row) => $row['name'], $statement->fetchAll());
    json_response(['categories' => $categories]);
}

if ($resource === 'breaking-news' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $pdo = db();
    if ($pdo === null) {
        json_response(['breakingNews' => default_news_payload()['breakingNews']]);
    }

    $statement = $pdo->query('SELECT id, title, slug FROM breaking_news ORDER BY id ASC');
    $items = array_map(fn ($row) => ['id' => (int) $row['id'], 'title' => $row['title'], 'slug' => $row['slug']], $statement->fetchAll());
    json_response(['breakingNews' => $items]);
}

if ($resource === 'articles' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $pdo = db();
    if ($pdo === null) {
        $items = array_map(fn ($row) => serialize_article($row), default_news_payload()['articles']);
        json_response(['articles' => $items]);
    }

    $statement = $pdo->query('SELECT * FROM articles ORDER BY published_at DESC');
    $items = array_map(fn ($row) => serialize_article($row), $statement->fetchAll());
    json_response(['articles' => $items]);
}

if ($resource === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $email = strtolower(trim((string) ($input['email'] ?? '')));
    $password = (string) ($input['password'] ?? '');

    if ($email === strtolower(ADMIN_EMAIL) && $password === ADMIN_PASSWORD) {
        $_SESSION['admin_authenticated'] = true;
        json_response(['success' => true, 'message' => 'Authentication successful']);
    }

    json_response(['success' => false, 'message' => 'Invalid admin credentials'], 401);
}

if ($resource === 'me' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response(['authenticated' => is_admin()]);
}

if ($resource === 'articles' && ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT')) {
    if (!is_admin()) {
        json_response(['message' => 'Unauthorized'], 401);
    }

    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $title = trim((string) ($input['title'] ?? ''));
    $category = trim((string) ($input['category'] ?? 'National'));
    $summary = trim((string) ($input['summary'] ?? ''));

    if ($title === '' || $summary === '') {
        json_response(['message' => 'Title and summary are required'], 400);
    }

    $slug = trim((string) ($input['slug'] ?? ''));
    if ($slug === '') {
        $slug = strtolower(trim(preg_replace('/[^a-z0-9]+/i', '-', $title), '-')) ?: 'news-' . time();
    }

    $values = [
        $slug,
        $title,
        $category,
        (string) ($input['subheadline'] ?? ''),
        $summary,
        (string) ($input['author'] ?? 'Staff Reporter'),
        (string) ($input['authorRole'] ?? 'Reporter'),
        (string) ($input['image'] ?? 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80'),
        (string) ($input['imageCaption'] ?? 'MK News Desk'),
        (string) ($input['imageCredit'] ?? 'MK News Desk'),
        (string) ($input['date'] ?? date('Y-m-d H:i:s')),
        (string) ($input['readTime'] ?? '4 min read'),
        json_encode(normalize_tags($input['tags'] ?? ($input['tagsList'] ?? [])), JSON_UNESCAPED_UNICODE),
        !empty($input['featured']) ? 1 : 0,
        (string) ($input['content'] ?? '<p>Story content goes here.</p>'),
    ];

    $sql = 'INSERT INTO articles (slug, title, category, subheadline, summary, author, author_role, image, image_caption, image_credit, published_at, read_time, tags, featured, content)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    $statement = db()->prepare($sql);
    $statement->execute($values);

    $id = (int) db()->lastInsertId();
    $created = db()->prepare('SELECT * FROM articles WHERE id = ?');
    $created->execute([$id]);
    $row = $created->fetch();

    json_response(['success' => true, 'article' => serialize_article($row)]);
}

if ($resource === 'articles' && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (!is_admin()) {
        json_response(['message' => 'Unauthorized'], 401);
    }

    $id = (int) ($_GET['id'] ?? 0);
    if ($id <= 0) {
        json_response(['message' => 'Article ID is required'], 400);
    }

    $statement = db()->prepare('DELETE FROM articles WHERE id = ?');
    $statement->execute([$id]);
    json_response(['success' => true, 'deletedId' => $id]);
}

json_response(['message' => 'Route not found'], 404);
