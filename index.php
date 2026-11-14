<?php
/**
 * Server-Side SEO Pre-Renderer & Dynamic Meta Injector
 * Powers 100% Google SEO, WhatsApp, Facebook, and Twitter link previews for React SPA.
 */

// Determine base URL
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$baseUrl = rtrim($protocol . $host, '/');
$requestUri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$requestUri = preg_replace('#/+#', '/', $requestUri);

// Load settings from backend cache or database
$settings = [];
$settingsFile = __DIR__ . '/backend/api/settings.json';
if (file_exists($settingsFile)) {
    $settings = json_decode(@file_get_contents($settingsFile), true) ?: [];
}

// Database helper for fast article lookup
function get_seo_article($slug) {
    $configFile = __DIR__ . '/backend/config.php';
    if (!file_exists($configFile)) return null;
    require_once $configFile;
    if (!defined('DB_HOST') || trim(DB_HOST) === '') return null;

    try {
        $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 2,
        ]);
        $stmt = $pdo->prepare('SELECT * FROM articles WHERE slug = ? OR id = ? LIMIT 1');
        $stmt->execute([$slug, is_numeric($slug) ? (int)$slug : -1]);
        return $stmt->fetch() ?: null;
    } catch (Throwable $e) {
        return null;
    }
}

// Default Fallback Metadata
$siteNameBn = $settings['site_name_bn'] ?? 'প্রথম আলো';
$siteNameEn = $settings['site_name_en'] ?? 'Prothom Alo';
$taglineBn = $settings['tagline_bn'] ?? 'অনলাইন সংস্করণ • সত্যের সন্ধানে নির্ভীক';
$defaultTitle = $siteNameBn . ' | ' . $taglineBn;
$defaultDesc = $settings['about_bn'] ?? 'সর্বশেষ সংবাদ, রাজনীতি, অর্থনীতি, খেলাধুলা, বিনোদন ও আন্তর্জাতিক খবরের বিশ্বস্ত মাধ্যম।';
$defaultImage = $settings['og_image_default'] ?? ($settings['logo_url'] ?? 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80');

$pageTitle = $defaultTitle;
$pageDesc = $defaultDesc;
$pageImage = $defaultImage;
$canonicalUrl = $baseUrl . $requestUri;
$ogType = 'website';
$extraMeta = '';
$schemaJson = '';

// Check if visiting an article: /article/{slug}
if (preg_match('#^/article/([^/]+)#', $requestUri, $matches)) {
    $slug = urldecode($matches[1]);
    $art = get_seo_article($slug);

    if ($art) {
        $artTitle = !empty($art['seo_title']) ? $art['seo_title'] : (!empty($art['title_bn']) ? $art['title_bn'] : ($art['title_en'] ?? 'সংবাদ'));
        $artSummary = !empty($art['seo_description']) ? $art['seo_description'] : (!empty($art['summary_bn']) ? $art['summary_bn'] : ($art['summary_en'] ?? $defaultDesc));
        $artImage = !empty($art['og_image']) ? $art['og_image'] : (!empty($art['image']) ? $art['image'] : $defaultImage);
        $artAuthor = !empty($art['author_bn']) ? $art['author_bn'] : ($art['author_en'] ?? $siteNameBn);
        $schemaType = !empty($art['schema_type']) ? $art['schema_type'] : 'NewsArticle';
        $pubDate = !empty($art['published_at']) ? date('c', strtotime($art['published_at'])) : date('c');
        $modDate = !empty($art['updated_at']) ? date('c', strtotime($art['updated_at'])) : $pubDate;

        $pageTitle = htmlspecialchars($artTitle . ' | ' . $siteNameBn);
        $pageDesc = htmlspecialchars($artSummary);
        $pageImage = htmlspecialchars($artImage);
        $ogType = 'article';

        $extraMeta .= '<meta property="article:published_time" content="' . $pubDate . '">' . "\n  ";
        $extraMeta .= '<meta property="article:modified_time" content="' . $modDate . '">' . "\n  ";
        $extraMeta .= '<meta property="article:author" content="' . htmlspecialchars($artAuthor) . '">' . "\n  ";
        $extraMeta .= '<meta property="article:section" content="' . htmlspecialchars($art['category'] ?? 'national') . '">' . "\n  ";

        // JSON-LD NewsArticle Structured Data
        $schema = [
            '@context' => 'https://schema.org',
            '@type' => $schemaType,
            'headline' => $artTitle,
            'description' => $artSummary,
            'image' => [$artImage],
            'datePublished' => $pubDate,
            'dateModified' => $modDate,
            'author' => [
                '@type' => 'Person',
                'name' => $artAuthor
            ],
            'publisher' => [
                '@type' => 'NewsMediaOrganization',
                'name' => $siteNameBn,
                'url' => $baseUrl,
                'logo' => [
                    '@type' => 'ImageObject',
                    'url' => $settings['logo_url'] ?? $defaultImage
                ]
            ],
            'mainEntityOfPage' => [
                '@type' => 'WebPage',
                '@id' => $canonicalUrl
            ]
        ];
        $schemaJson = '<script type="application/ld+json">' . json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>';
    }
} elseif (preg_match('#^/category/([^/]+)#', $requestUri, $matches)) {
    $catSlug = urldecode($matches[1]);
    $catName = ucfirst($catSlug);
    $pageTitle = htmlspecialchars($catName . ' সংবাদ ও খবর | ' . $siteNameBn);
    $pageDesc = htmlspecialchars($catName . ' বিভাগের সর্বশেষ ও ব্রেকিং নিউজ সরাসরি ' . $siteNameBn . ' থেকে।');
}

// Google AdSense & Verification Meta
$adsenseSnippet = '';
$adsenseEnabled = !empty($settings['adsense_enabled']) && $settings['adsense_enabled'] !== '0';
$adsenseClientId = trim($settings['adsense_client_id'] ?? '');
if ($adsenseEnabled && $adsenseClientId !== '') {
    $pubId = strpos($adsenseClientId, 'ca-pub-') === 0 ? $adsenseClientId : 'ca-pub-' . $adsenseClientId;
    $adsenseSnippet = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' . htmlspecialchars($pubId) . '" crossorigin="anonymous"></script>' . "\n  ";
}

$verificationSnippet = '';
if (!empty($settings['google_site_verification'])) {
    $verificationSnippet .= '<meta name="google-site-verification" content="' . htmlspecialchars($settings['google_site_verification']) . '">' . "\n  ";
}
if (!empty($settings['bing_site_verification'])) {
    $verificationSnippet .= '<meta name="msvalidate.01" content="' . htmlspecialchars($settings['bing_site_verification']) . '">' . "\n  ";
}

// Read template index.html (check dist/index.html first if built, else root index.html)
$templatePath = file_exists(__DIR__ . '/dist/index.html') ? __DIR__ . '/dist/index.html' : __DIR__ . '/index.html';
$html = @file_get_contents($templatePath);

if (!$html) {
    $html = '<!doctype html><html lang="bn"><head><title>' . $pageTitle . '</title></head><body><div id="root"></div></body></html>';
}

// Build SEO Head Block
$seoBlock = <<<HTML
  <title>{$pageTitle}</title>
  <meta name="description" content="{$pageDesc}">
  <link rel="canonical" href="{$canonicalUrl}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  {$verificationSnippet}
  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="{$ogType}">
  <meta property="og:site_name" content="{$siteNameBn}">
  <meta property="og:title" content="{$pageTitle}">
  <meta property="og:description" content="{$pageDesc}">
  <meta property="og:url" content="{$canonicalUrl}">
  <meta property="og:image" content="{$pageImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  {$extraMeta}
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{$pageTitle}">
  <meta name="twitter:description" content="{$pageDesc}">
  <meta name="twitter:image" content="{$pageImage}">
  {$adsenseSnippet}
  {$schemaJson}
HTML;

// Replace <title>...</title> and existing meta description with the SEO block
if (preg_match('#<title>.*?</title>#is', $html)) {
    $html = preg_replace('#<title>.*?</title>#is', $seoBlock, $html, 1);
} else {
    $html = str_replace('<head>', "<head>\n" . $seoBlock, $html);
}

// Output final SEO optimized HTML
header('Content-Type: text/html; charset=utf-8');
echo $html;
exit;
