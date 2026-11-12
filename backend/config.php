<?php

define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'mknews_portal');
define('DB_USER', getenv('DB_USER') ?: 'mknews_user');
define('DB_PASS', getenv('DB_PASS') ?: 'StrongPassword123!');
define('CORS_ORIGIN', getenv('CORS_ORIGIN') ?: 'http://localhost:4173');
define('ADMIN_EMAIL', getenv('ADMIN_EMAIL') ?: 'admin@mknews.com');
define('ADMIN_PASSWORD', getenv('ADMIN_PASSWORD') ?: 'MKNews@2026');
