-- ========================================================
-- SEO & Google AdSense Migration for News Portal
-- Run this in phpMyAdmin if you have an existing database
-- Safe to run multiple times
-- ========================================================

-- 1. Add SEO Columns to articles table
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255) DEFAULT NULL AFTER content_en,
  ADD COLUMN IF NOT EXISTS seo_description TEXT DEFAULT NULL AFTER seo_title,
  ADD COLUMN IF NOT EXISTS focus_keyword VARCHAR(150) DEFAULT NULL AFTER seo_description,
  ADD COLUMN IF NOT EXISTS canonical_url VARCHAR(500) DEFAULT NULL AFTER focus_keyword,
  ADD COLUMN IF NOT EXISTS og_image VARCHAR(500) DEFAULT NULL AFTER canonical_url,
  ADD COLUMN IF NOT EXISTS schema_type VARCHAR(50) DEFAULT 'NewsArticle' AFTER og_image;

-- 2. Add Google AdSense & SEO Default Settings
INSERT INTO settings (setting_key, setting_value) VALUES
('adsense_enabled', '0'),
('adsense_client_id', ''),
('adsense_auto_ads', '1'),
('adsense_header_slot', ''),
('adsense_article_slot', ''),
('adsense_sidebar_slot', ''),
('adsense_footer_slot', ''),
('ads_txt_content', 'google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0'),
('google_site_verification', ''),
('bing_site_verification', ''),
('canonical_base_url', ''),
('meta_keywords_default', 'সংবাদ, বাংলাদেশ, প্রথম আলো, খবর, ব্রেকিং নিউজ, News, Bangladesh'),
('og_image_default', '')
ON DUPLICATE KEY UPDATE setting_value = setting_value;
