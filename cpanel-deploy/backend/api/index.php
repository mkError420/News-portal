<?php
require_once __DIR__ . '/../config.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

function json_response($payload, $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

set_exception_handler(function (Throwable $exception): void {
    error_log('MK News API error: ' . $exception->getMessage());
    json_response(['message' => 'The service is temporarily unavailable'], 500);
});

function is_admin(): bool
{
    return !empty($_SESSION['admin_authenticated']);
}

function db(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }

    return $pdo;
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
    db()->query('SELECT 1');
    json_response(['status' => 'ok', 'php' => PHP_VERSION, 'database' => 'ok']);
}

if ($resource === 'categories' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $statement = db()->query('SELECT name FROM categories ORDER BY id ASC');
    $categories = array_map(fn ($row) => $row['name'], $statement->fetchAll());
    json_response(['categories' => $categories]);
}

if ($resource === 'breaking-news' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $statement = db()->query('SELECT id, title, slug FROM breaking_news ORDER BY id ASC');
    $items = array_map(fn ($row) => ['id' => (int) $row['id'], 'title' => $row['title'], 'slug' => $row['slug']], $statement->fetchAll());
    json_response(['breakingNews' => $items]);
}

if ($resource === 'articles' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $statement = db()->query('SELECT * FROM articles ORDER BY published_at DESC');
    $items = array_map(fn ($row) => serialize_article($row), $statement->fetchAll());
    json_response(['articles' => $items]);
}

if ($resource === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $email = strtolower(trim((string) ($input['email'] ?? '')));
    $password = (string) ($input['password'] ?? '');

    $statement = db()->prepare('SELECT id, password_hash FROM admins WHERE email = ? LIMIT 1');
    $statement->execute([$email]);
    $admin = $statement->fetch();

    if ($admin && $email === strtolower(ADMIN_EMAIL) && password_verify($password, $admin['password_hash'])) {
        session_regenerate_id(true);
        $_SESSION['admin_authenticated'] = true;
        $_SESSION['admin_id'] = (int) $admin['id'];
        json_response(['success' => true, 'message' => 'Authentication successful']);
    }

    json_response(['success' => false, 'message' => 'Invalid admin credentials'], 401);
}

if ($resource === 'me' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    json_response(['authenticated' => is_admin()]);
}

if ($resource === 'logout' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $_SESSION = [];
    session_destroy();
    json_response(['success' => true]);
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
