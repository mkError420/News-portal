-- ========================================================
-- Prothom Alo Style News Portal Database Schema
-- Safe for Shared Hosting (cPanel / phpMyAdmin / InfinityFree)
-- UTF-8mb4 character set for complete Bengali script support
-- Note: Do NOT add CREATE DATABASE or USE statements here.
-- In phpMyAdmin, click your database name on the left first,
-- then click "Import" or paste this into the "SQL" tab.
-- ========================================================

-- 1. Admins Table
DROP TABLE IF EXISTS admins;
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Categories Table
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  name_bn VARCHAR(150) NOT NULL DEFAULT '',
  name_en VARCHAR(150) NOT NULL DEFAULT '',
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO categories (name, name_bn, name_en, slug) VALUES
('বাংলাদেশ', 'বাংলাদেশ', 'National', 'national'),
('রাজনীতি', 'রাজনীতি', 'Politics', 'politics'),
('আন্তর্জাতিক', 'আন্তর্জাতিক', 'International', 'international'),
('অর্থনীতি', 'অর্থনীতি', 'Economy', 'economy'),
('বাণিজ্য', 'বাণিজ্য', 'Business', 'business'),
('খেলাধুলা', 'খেলাধুলা', 'Sports', 'sports'),
('বিনোদন', 'বিনোদন', 'Entertainment', 'entertainment'),
('বিজ্ঞান ও প্রযুক্তি', 'বিজ্ঞান ও প্রযুক্তি', 'Technology', 'technology'),
('শিক্ষা ও চাকরি', 'শিক্ষা ও চাকরি', 'Education', 'education'),
('স্বাস্থ্য ও চিকিৎসা', 'স্বাস্থ্য ও চিকিৎসা', 'Health', 'health'),
('জীবনযাপন', 'জীবনযাপন', 'Lifestyle', 'lifestyle'),
('মতামত', 'মতামত', 'Opinion', 'opinion'),
('আলোকচিত্র', 'আলোকচিত্র', 'Photos', 'photos'),
('ভিডিও', 'ভিডিও', 'Video', 'video'),
('ই-পেপার', 'ই-পেপার', 'ePaper', 'epaper');

-- 3. Breaking News Table
DROP TABLE IF EXISTS breaking_news;
CREATE TABLE breaking_news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  title_bn VARCHAR(500) NOT NULL DEFAULT '',
  title_en VARCHAR(500) NOT NULL DEFAULT '',
  slug VARCHAR(255) NOT NULL UNIQUE,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO breaking_news (title, slug, active) VALUES
('ঢাকায় আজ থেকে মেট্রোরেলের মতিঝিল-উত্তরা পূর্ণাঙ্গ সেবা চালু', 'dhaka-metro-full-service', 1),
('এশিয়া কাপের ফাইনালে শ্বাসরুদ্ধকর ম্যাচে বাংলাদেশ চ্যাম্পিয়ন', 'bangladesh-asia-cup-champions', 1),
('রেমিট্যান্স প্রবাহে নতুন রেকর্ড, রিজার্ভ আবারও ঊর্ধ্বমুখী', 'remittance-record-reserves', 1),
('আগামী তিন দিন সারাদেশে ভারী বৃষ্টির সতর্কতা জারি করেছে আবহাওয়া অধিদপ্তর', 'rain-alert-bangladesh', 1);

-- 4. Articles Table
DROP TABLE IF EXISTS articles;
CREATE TABLE articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  title_bn VARCHAR(500) NOT NULL DEFAULT '',
  title_en VARCHAR(500) NOT NULL DEFAULT '',
  category VARCHAR(100) NOT NULL DEFAULT 'national',
  subheadline VARCHAR(500) DEFAULT NULL,
  subheadline_bn VARCHAR(500) DEFAULT NULL,
  subheadline_en VARCHAR(500) DEFAULT NULL,
  summary TEXT NOT NULL,
  summary_bn TEXT DEFAULT NULL,
  summary_en TEXT DEFAULT NULL,
  author VARCHAR(150) NOT NULL DEFAULT 'প্রথম আলো ডেস্ক',
  author_bn VARCHAR(150) NOT NULL DEFAULT '',
  author_en VARCHAR(150) NOT NULL DEFAULT '',
  author_role VARCHAR(150) DEFAULT 'প্রতিবেদক',
  author_role_bn VARCHAR(150) DEFAULT NULL,
  author_role_en VARCHAR(150) DEFAULT NULL,
  image VARCHAR(500) NOT NULL,
  image_caption VARCHAR(255) DEFAULT NULL,
  image_credit VARCHAR(255) DEFAULT NULL,
  published_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  read_time VARCHAR(50) DEFAULT '4 min read',
  views INT NOT NULL DEFAULT 0,
  tags JSON DEFAULT NULL,
  tags_bn JSON DEFAULT NULL,
  tags_en JSON DEFAULT NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  content LONGTEXT NOT NULL,
  content_bn LONGTEXT DEFAULT NULL,
  content_en LONGTEXT DEFAULT NULL,
  seo_title VARCHAR(255) DEFAULT NULL,
  seo_description TEXT DEFAULT NULL,
  focus_keyword VARCHAR(150) DEFAULT NULL,
  canonical_url VARCHAR(500) DEFAULT NULL,
  og_image VARCHAR(500) DEFAULT NULL,
  schema_type VARCHAR(50) DEFAULT 'NewsArticle'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO articles (
  slug, title, category, subheadline, summary, author, author_role, image,
  image_caption, image_credit, published_at, read_time, views, tags, featured, content
) VALUES
(
  'bangladesh-flood-relief-grows',
  'বন্যা কবলিত এলাকায় ত্রাণ ও চিকিৎসা সহায়তা দ্বিগুণ করল সরকার',
  'national',
  'নদীর পানি বিপদসীমার নিচে নামতে শুরু করায় পুনর্বাসন পরিকল্পনা দ্রুত প্রস্তুত হচ্ছে',
  'উত্তরাঞ্চল ও পূর্বাঞ্চলের প্লাবিত জেলাগুলোতে শুকনো খাবার, নিরাপদ পানি এবং জরুরি ভ্রাম্যমাণ মেডিকেল ক্যাম্প পরিচালনা শুরু হয়েছে।',
  'শাহরিয়ার হোসেন',
  'সিনিয়র স্টাফ রিপোর্টার',
  'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=80',
  'নদীর ওপর ত্রাণ বিতরণ কর্মসূচি',
  'ছবি: প্রথম আলো',
  '2026-11-14 08:30:00',
  '4 min read',
  48920,
  JSON_ARRAY('বন্যা', 'ত্রাণ', 'জাতীয়'),
  1,
  '<p>দেশের উত্তর ও দক্ষিণ-পূর্বাঞ্চলের কয়েকটি জেলায় সাম্প্রতিক বন্যায় ক্ষতিগ্রস্ত জনগোষ্ঠীর কাছে পর্যাপ্ত খাদ্যসামগ্রী ও জরুরি ওষুধ পৌঁছে দিতে সর্বাত্মক উদ্যোগ গ্রহণ করেছে সংশ্লিষ্ট মন্ত্রণালয় ও দুর্যোগ ব্যবস্থাপনা অধিদপ্তর।</p><p>স্থানীয় প্রশাসনের সঙ্গে সমন্বয় করে জেলায় জেলায় ২৪ ঘণ্টার জরুরি কন্ট্রোল রুম খোলা হয়েছে। পানি নেমে যাওয়ার সঙ্গে সঙ্গে ডায়রিয়া ও অন্যান্য পানিবাহিত রোগ প্রতিরোধে প্রয়োজনীয় বিশুদ্ধকরণ ট্যাবলেট ও স্যালাইন বিনামূল্যে বিতরণ করা হচ্ছে।</p>'
),
(
  'economic-policy-export-boost',
  'রপ্তানিমুখী নতুন শিল্পনীতিতে শিল্পোদ্যোক্তাদের ব্যাপক আস্থা',
  'economy',
  'তৈরি পোশাক ও কৃষি প্রক্রিয়াজাত পণ্যের বৈশ্বিক বাজার সম্প্রসারণে কর রেয়াত ঘোষণা',
  'আন্তর্জাতিক বাজারে প্রতিযোগিতামূলক সক্ষমতা বাড়াতে প্রযুক্তিগত আধুনিকায়ন ও সহজ শর্তে ঋণের ঘোষণা দিয়েছে বাণিজ্য মন্ত্রণালয়।',
  'মেহেদী হাসান',
  'বাণিজ্য ও অর্থনীতি সম্পাদক',
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
  'রপ্তানি বাণিজ্যের দৃশ্য',
  'ছবি: প্রথম আলো',
  '2026-11-13 10:00:00',
  '5 min read',
  32680,
  JSON_ARRAY('অর্থনীতি', 'রপ্তানি', 'বাণিজ্য'),
  1,
  '<p>বাংলাদেশের রপ্তানি আয়কে নতুন উচ্চতায় নিয়ে যেতে আধুনিক ডিজিটাল প্রণোদনা প্যাকেজ উন্মোচন করেছে সরকার। ইউরোপ ও উত্তর আমেরিকার পাশাপাশি এশিয়া ও ল্যাটিন আমেরিকার নতুন বাজারে দেশীয় পণ্যের বিস্তার ঘটাতে এই কৌশল গ্রহণ করা হয়েছে।</p>'
),
(
  'bangladesh-cricket-asia-cup-prep',
  'এশিয়া কাপে অবিস্মরণীয় পারফরম্যান্সে টাইগারদের বিশ্বকাপ স্বপ্ন আরও উজ্জ্বল',
  'sports',
  'তরুণ অলরাউন্ডারদের নৈপুণ্যে টিম ম্যানেজমেন্টের নতুন পরিকল্পনা সফল',
  'ব্যাটিং ও বোলিং উভয় বিভাগেই দায়িত্বশীল আচরণে ক্রিকেটপ্রেমীদের প্রত্যাশা পূরণ করেছে জাতীয় ক্রিকেট দল।',
  'তৌহিদুর রহমান',
  'ক্রীড়া সম্পাদক',
  'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
  'মাঠে টাইগারদের উচ্ছ্বাস',
  'ছবি: প্রথম আলো',
  '2026-11-14 07:20:00',
  '4 min read',
  56600,
  JSON_ARRAY('ক্রিকেট', 'টাইগার্স', 'খেলা'),
  0,
  '<p>আন্তর্জাতিক ক্রিকেট মঞ্চে নিজেদের আধিপত্যের প্রমাণ রেখে আরও একটি স্মরণীয় সিরিজ শেষ করল বাংলাদেশ জাতীয় দল। দলের জ্যেষ্ঠ ও তরুণ খেলোয়াড়দের চমৎকার রসায়ন টিম স্পিরিটকে অনন্য উচ্চতায় নিয়ে গেছে।</p>'
),
(
  'tech-startups-funding-rise',
  'বাংলাদেশি প্রযুক্তি স্টার্টআপে আন্তর্জাতিক ভেঞ্চার ক্যাপিটালের কোটি ডলার বিনিয়োগ',
  'technology',
  'ফিনটেক, এগ্রিটেক ও স্বাস্থ্য প্রযুক্তিতে স্থানীয় তরুণদের উদ্ভাবন বৈশ্বিক নজর কাড়ছে',
  'স্থানীয় ডিজিটাল সেবাগুলোর উচ্চ প্রবৃদ্ধি দেখে সিলিকন ভ্যালি ও সিঙ্গাপুরের শীর্ষ বিনিয়োগকারীরা বিনিয়োগে এগিয়ে এসেছেন।',
  'নাজমুল ইসলাম',
  'প্রযুক্তি বিশ্লেষক',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  'টেক ইনোভেশন হাব',
  'ছবি: প্রথম আলো',
  '2026-11-13 12:10:00',
  '5 min read',
  38110,
  JSON_ARRAY('প্রযুক্তি', 'স্টার্টআপ', 'বিনিয়োগ'),
  0,
  '<p>বাংলাদেশের প্রযুক্তি উদ্ভাবকদের জন্য এক গৌরবময় মুহূর্ত। মোবাইল ফিন্যান্সিয়াল সার্ভিস এবং এগ্রিকালচারাল সাপ্লাই চেইন নিয়ে কাজ করা দুটি স্থানীয় স্টার্টআপ সফলভাবে সিরিজ-বি ফান্ডিং সম্পন্ন করেছে।</p>'
);

UPDATE breaking_news SET title_bn = title, title_en = title;

UPDATE articles
SET title_bn = title,
    title_en = title,
    subheadline_bn = subheadline,
    subheadline_en = subheadline,
    summary_bn = summary,
    summary_en = summary,
    author_bn = author,
    author_en = author,
    author_role_bn = author_role,
    author_role_en = author_role,
    tags_bn = tags,
    tags_en = tags,
    content_bn = content,
    content_en = content;

-- 5. Website Settings Table (Dynamic Name & Details)
DROP TABLE IF EXISTS settings;
CREATE TABLE settings (
  setting_key VARCHAR(100) NOT NULL PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO settings (setting_key, setting_value) VALUES
('site_name_bn', 'প্রথম আলো'),
('site_name_en', 'Prothom Alo'),
('tagline_bn', 'অনলাইন সংস্করণ • সত্যের সন্ধানে নির্ভীক'),
('tagline_en', 'Online Edition • Fearless in Pursuit of Truth'),
('logo_url', ''),
('favicon_url', ''),
('editor_bn', 'সম্পাদক ও প্রকাশক: মতিউর রহমান'),
('editor_en', 'Editor & Publisher: Matiur Rahman'),
('about_bn', 'প্রথম আলো বাংলাদেশের সর্বাধিক পঠিত ও জনপ্রিয় বাংলা দৈনিক ও অনলাইন সংবাদমাধ্যম। নিরপেক্ষ ও বস্তুনিষ্ঠ সাংবাদিকতাই আমাদের মূল শক্তি।'),
('about_en', 'Prothom Alo is the leading and most trusted news publication in Bangladesh, delivering impartial and accurate news 24/7.'),
('address_bn', 'প্রগতি ইনস্যুরেন্স ভবন, ২০-২১ কারওয়ান বাজার, ঢাকা ১২১৫, বাংলাদেশ'),
('address_en', 'Pragati Insurance Bhaban, 20-21 Karwan Bazar, Dhaka 1215, Bangladesh'),
('phone', '+৮৮০ ২ ৮১৮০০৭৮-৮১'),
('email', 'info@prothomalo.com'),
('ad_email', 'ads@prothomalo.com'),
('facebook_url', 'https://facebook.com/DailyProthomAlo'),
('twitter_url', 'https://twitter.com/ProthomAlo'),
('youtube_url', 'https://youtube.com/c/ProthomAlo'),
('instagram_url', 'https://instagram.com/prothomalo'),
('linkedin_url', 'https://linkedin.com/company/prothom-alo'),
('copyright_bn', 'স্বত্ব © ২০২৬ প্রথম আলো | সর্বস্বত্ব সংরক্ষিত।'),
('copyright_en', 'Copyright © 2026 Prothom Alo | All rights reserved.'),
('edition_bn', 'বাংলাদেশ'),
('edition_en', 'Bangladesh'),
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
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
