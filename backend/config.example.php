<?php
/**
 * Example Database Configuration File
 *
 * For local development or cPanel hosting:
 * 1. Copy this file to 'config.php' in the same folder.
 * 2. Put your database credentials in config.php or .env.
 * 3. 'config.php' and '.env' are ignored by Git and will NEVER be pushed to GitHub.
 */

// Auto-load .env file if present in backend or root
$envFiles = [__DIR__ . '/.env', dirname(__DIR__) . '/.env'];
foreach ($envFiles as $envFile) {
    if (file_exists($envFile)) {
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) continue;
            if (strpos($line, '=') !== false) {
                [$k, $v] = explode('=', $line, 2);
                $k = trim($k);
                $v = trim(trim($v), "\"'");
                if (getenv($k) === false) {
                    putenv("$k=$v");
                    $_ENV[$k] = $v;
                    $_SERVER[$k] = $v;
                }
            }
        }
        break;
    }
}

define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_NAME', getenv('DB_NAME') ?: 'news_portal');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
