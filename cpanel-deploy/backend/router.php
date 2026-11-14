<?php
$uri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($uri, PHP_URL_PATH) ?: '/';

if ($path === '/' || strpos($path, '/api') === 0) {
    require __DIR__ . '/api/index.php';
    return;
}

return false;
