-- ========================================================
-- Prothom Alo Style News Portal Database Schema
-- Safe for Shared Hosting (cPanel / phpMyAdmin / InfinityFree)
-- UTF-8mb4 character set for complete Bengali script support
-- Note: Do NOT add CREATE DATABASE or USE statements here.
-- In phpMyAdmin, click your database name on the left first,
-- then click "Import" or paste this into the "SQL" tab.
-- ========================================================

-- 1. Roles & Permissions Table
DROP TABLE IF EXISTS roles;
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_key VARCHAR(100) NOT NULL UNIQUE,
  name_bn VARCHAR(150) NOT NULL,
  name_en VARCHAR(150) NOT NULL DEFAULT '',
  description_bn TEXT DEFAULT NULL,
  description_en TEXT DEFAULT NULL,
  permissions JSON DEFAULT NULL,
  is_system TINYINT(1) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO roles (role_key, name_bn, name_en, description_bn, description_en, permissions, is_system, status) VALUES
('admin', 'প্রধান প্রশাসক (Super Admin)', 'Super Administrator', 'ওয়েবসাইটের সকল কনটেন্ট, সেটিংস, ব্যবহারকারী এবং ডাটাবেজ নিয়ন্ত্রণে সর্বময় ক্ষমতা।', 'Full access to all articles, categories, breaking news, media, system settings, roles, and database.', '["all", "manage_articles", "manage_categories", "manage_breaking", "manage_opinions", "manage_media", "manage_roles", "manage_settings"]', 1, 'active'),
('editor', 'বার্তা সম্পাদক (News Editor)', 'News Editor', 'সংবাদ পর্যালোচনা, অনুমোদন, প্রকাশ, ব্রেকিং নিউজ এবং ক্যাটাগরি ব্যবস্থাপনা।', 'Review, approve, publish articles, breaking news, and manage categories.', '["manage_articles", "manage_categories", "manage_breaking", "manage_opinions", "manage_media"]', 0, 'active'),
('senior_reporter', 'জ্যেষ্ঠ প্রতিবেদক (Senior Reporter)', 'Senior Reporter', 'বিশেষ প্রতিবেদন, অনুসন্ধানী সংবাদ এবং কলাম তৈরি ও প্রকাশ।', 'Write, edit, and publish special reports and investigative stories.', '["manage_articles", "manage_opinions"]', 0, 'active'),
('reporter', 'স্টাফ রিপোর্টার (Staff Reporter)', 'Staff Reporter', 'দৈনন্দিন সংবাদ ও আঞ্চলিক খবর তৈরি ও খসড়া প্রদান।', 'Draft and submit daily reporting and regional news.', '["manage_articles"]', 0, 'active'),
('photojournalist', 'আলোকচিত্রী (Photojournalist)', 'Photojournalist', 'আলোকচিত্র গ্যালারি ও ফটো স্টোরি আপলোড এবং ক্যাপশন প্রদান।', 'Upload and manage photo stories and media galleries.', '["manage_media"]', 0, 'active'),
('contributor', 'কলামিস্ট ও লেখক (Columnist)', 'Columnist & Contributor', 'উপ-সম্পাদকীয়, কলাম ও চিন্তাশীল মতামত প্রদান।', 'Contribute editorials, columns, and opinions.', '["manage_opinions"]', 0, 'active');

-- 2. Admins & Staff Users Table
DROP TABLE IF EXISTS admins;
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL DEFAULT 'Administrator',
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_key VARCHAR(100) NOT NULL DEFAULT 'admin',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  phone VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO admins (name, email, password_hash, role_key, status) VALUES
('প্রধান প্রশাসক', 'admin@prothomalo.com', '$2y$12$Affak3Sszb7sr/z.E7qTjerisPxOQ.RmPyjvwrwydRHcDWnvtwvAG', 'admin', 'active');

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
  slug VARCHAR(255) NOT NULL,
  article_id INT NULL DEFAULT NULL,
  url VARCHAR(500) NULL DEFAULT '',
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO breaking_news (title, title_bn, title_en, slug, url, active) VALUES
('ঢাকায় আজ থেকে মেট্রোরেলের মতিঝিল-উত্তরা পূর্ণাঙ্গ সেবা চালু', 'ঢাকায় আজ থেকে মেট্রোরেলের মতিঝিল-উত্তরা পূর্ণাঙ্গ সেবা চালু', 'Full Motijheel-Uttara Metro Rail service begins in Dhaka today', 'dhaka-traffic-smart-system', '/article/dhaka-traffic-smart-system', 1),
('এশিয়া কাপের ফাইনালে শ্বাসরুদ্ধকর ম্যাচে বাংলাদেশ চ্যাম্পিয়ন', 'এশিয়া কাপের ফাইনালে শ্বাসরুদ্ধকর ম্যাচে বাংলাদেশ চ্যাম্পিয়ন', 'Bangladesh crowned Asia Cup champions in thrilling final', 'bangladesh-cricket-asia-cup-prep', '/article/bangladesh-cricket-asia-cup-prep', 1),
('রেমিট্যান্স প্রবাহে নতুন রেকর্ড, রিজার্ভ আবারও ঊর্ধ্বমুখী', 'রেমিট্যান্স প্রবাহে নতুন রেকর্ড, রিজার্ভ আবারও ঊর্ধ্বমুখী', 'Remittance hits new record as foreign reserves climb again', 'economic-policy-export-boost', '/article/economic-policy-export-boost', 1),
('আগামী তিন দিন সারাদেশে ভারী বৃষ্টির সতর্কতা জারি করেছে আবহাওয়া অধিদপ্তর', 'আগামী তিন দিন সারাদেশে ভারী বৃষ্টির সতর্কতা জারি করেছে আবহাওয়া অধিদপ্তর', 'Meteorological department issues heavy rain warning across country for next 3 days', 'bangladesh-flood-relief-grows', '/article/bangladesh-flood-relief-grows', 1);

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
('site_name_bn', 'আলোর পথে'),
('site_name_en', 'Alor Pothe'),
('tagline_bn', 'অনলাইন সংস্করণ • সত্যের সন্ধানে নির্ভীক'),
('tagline_en', 'Online Edition • Fearless in Pursuit of Truth'),
('logo_url', ''),
('favicon_url', ''),
('editor_bn', 'সম্পাদক ও প্রকাশক: '),
('editor_en', 'Editor & Publisher: '),
('about_bn', 'আলোর পথে বাংলাদেশের সর্বাধিক পঠিত ও জনপ্রিয় বাংলা দৈনিক ও অনলাইন সংবাদমাধ্যম। নিরপেক্ষ ও বস্তুনিষ্ঠ সাংবাদিকতাই আমাদের মূল শক্তি।'),
('about_en', 'Alor pothe is the leading and most trusted news publication in Bangladesh, delivering impartial and accurate news 24/7.'),
('address_bn', 'রংপুর, বাংলাদেশ'),
('address_en', 'Rangpur, Bangladesh'),
('phone', '+৮৮০ ২ ৮১৮০০৭৮-৮১'),
('email', 'info@alorpothe.com'),
('ad_email', 'ads@alorpothe.com'),
('facebook_url', 'https://facebook.com/DailyProthomKalo'),
('twitter_url', 'https://twitter.com/ProthomKalo'),
('youtube_url', 'https://youtube.com/c/ProthomKalo'),
('instagram_url', 'https://instagram.com/prothomkalo'),
('linkedin_url', 'https://linkedin.com/company/prothom-kalo'),
('copyright_bn', 'স্বত্ব © ২০২৬ আলোর পথে | সর্বস্বত্ব সংরক্ষিত।'),
('copyright_en', 'Copyright © 2026 Alor Pothe | All rights reserved.'),
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
('meta_keywords_default', 'সংবাদ, বাংলাদেশ, আলোর পথে, খবর, ব্রেকিং নিউজ, News, Bangladesh, Prothom kalo'),
('og_image_default', '')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- 6. Opinions Table
DROP TABLE IF EXISTS opinions;
CREATE TABLE opinions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title_bn VARCHAR(500) NOT NULL,
  title_en VARCHAR(500) NOT NULL DEFAULT '',
  author_bn VARCHAR(150) NOT NULL,
  author_en VARCHAR(150) NOT NULL DEFAULT '',
  author_role_bn VARCHAR(255) NULL,
  author_role_en VARCHAR(255) NULL,
  author_image VARCHAR(500) NULL,
  summary_bn TEXT NULL,
  summary_en TEXT NULL,
  image VARCHAR(500) NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'opinion',
  content_bn LONGTEXT NULL,
  content_en LONGTEXT NULL,
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO opinions (slug, title_bn, title_en, author_bn, author_en, author_role_bn, author_role_en, author_image, summary_bn, summary_en, image, content_bn, content_en) VALUES
('democracy-future-bangladesh', 'গণতন্ত্রের ভবিষ্যৎ ও আমাদের নাগরিক দায়িত্ব', 'The Future of Democracy and Our Civic Responsibility', 'ড. মুহাম্মদ ইউনূস', 'Dr. Muhammad Yunus', 'অর্থনীতিবিদ ও শান্তিতে নোবেল বিজয়ী', 'Economist & Nobel Peace Laureate', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 'একটি শক্তিশালী গণতান্ত্রিক ব্যবস্থার মূল ভিত্তি হলো প্রতিটি নাগরিকের সমান অংশগ্রহণ ও জবাবদিহিতা।', 'The foundation of a robust democratic system lies in the equal participation and accountability of every citizen.', 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80', '<p>গণতন্ত্র কেবল একটি শাসনব্যবস্থা নয়, এটি একটি সামাজিক সংস্কৃতি ও মূল্যবোধ।</p>', '<p>Democracy is not merely a system of governance; it is a social culture and a set of shared values.</p>'),
('economic-resilience-south-asia', 'বৈশ্বিক অস্থিরতার মুখে বাংলাদেশের অর্থনৈতিক স্থিতিস্থাপকতা', 'Economic Resilience of Bangladesh Amid Global Volatility', 'ড. দেবপ্রিয় ভট্টাচার্য', 'Dr. Debapriya Bhattacharya', 'বিশিষ্ট অর্থনীতিবিদ ও পলিসি বিশ্লেষক', 'Eminent Economist & Policy Analyst', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', 'মূল্যস্ফীতি নিয়ন্ত্রণ ও কৃষি-রপ্তানির ভারসাম্য বজায় রাখাই হবে আগামী দিনের মূল অর্থনৈতিক চালিকাশক্তি।', 'Taming inflation while balancing agriculture and exports will be the core economic driver ahead.', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80', '<p>বিশ্বব্যাপী মূল্যস্ফীতি ও মুদ্রা সংকট থাকলেও বাংলাদেশের গ্রামীণ অর্থনীতি ও তৈরি পোশাক খাতের প্রাণশক্তি অত্যন্ত শক্তিশালী।</p>', '<p>Despite worldwide inflation and currency pressures, the vitality of Bangladesh’s rural economy remains strong.</p>'),
('climate-justice-and-bangladesh', 'জলবায়ু ন্যায়বিচার: বাংলাদেশের দাবি ও করণীয়', 'Climate Justice: Bangladesh’s Demand and Global Imperatives', 'সৈয়দা রিজওয়ানা হাসান', 'Syeda Rizwana Hasan', 'পরিবেশ আইনজীবী ও র‍্যামন ম্যাগসেসে পুরস্কারপ্রাপ্ত', 'Environmental Lawyer & Ramon Magsaysay Awardee', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80', 'উপকূলীয় জনগোষ্ঠীর সুরক্ষায় বিশ্বকে দ্রুত ক্ষতিপূরণ তহবিল কার্যকর করতে হবে।', 'The world must rapidly operationalize loss-and-damage funds to protect coastal communities.', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80', '<p>বাংলাদেশ বৈশ্বিক কার্বন নিঃসরণে দায়ী না হয়েও জলবায়ু পরিবর্তনের মারাত্মক ক্ষতির শিকার।</p>', '<p>Bangladesh suffers disproportionately from climate change despite contributing negligible emissions.</p>');

-- 7. Photos Table
DROP TABLE IF EXISTS photos;
CREATE TABLE photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title_bn VARCHAR(500) NOT NULL,
  title_en VARCHAR(500) NOT NULL DEFAULT '',
  image VARCHAR(500) NOT NULL,
  credit_bn VARCHAR(255) NULL,
  credit_en VARCHAR(255) NULL,
  caption_bn TEXT NULL,
  caption_en TEXT NULL,
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO photos (slug, title_bn, title_en, image, credit_bn, credit_en, caption_bn, caption_en) VALUES
('autumn-kashful-beauty', 'শরতের বিকেলে কাশবনের অপার সৌন্দর্য', 'Breathtaking beauty of Kashful in Autumn afternoon', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', 'ছবি: আসিফ মাহমুদ', 'Photo: Asif Mahmud', 'দিয়াবাড়ির বিস্তৃত কাশবনে পরিবার-পরিজন নিয়ে সূর্যাস্ত উপভোগ করছেন দর্শনার্থীরা।', 'Visitors enjoy sunset with families amidst vast autumn grass at Diabari.'),
('misty-morning-river-bengal', 'কুয়াশাচ্ছন্ন ভোরে রূপসী বাংলার নদীমাতৃক রূপ', 'Misty morning across the rivers of Bengal', 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1200&q=80', 'ছবি: শফিকুল ইসলাম', 'Photo: Shafiqul Islam', 'মেঘনা নদীতে কুয়াশার চাদর ভেদ করে মাছ শিকারে যাচ্ছেন জেলেরা।', 'Fishermen set out across the Meghna river through early morning mist.'),
('padma-bridge-night-lights', 'পদ্মা সেতুর আলোকসজ্জায় উদ্ভাসিত রাত', 'Padma Bridge illuminated under the night sky', 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80', 'ছবি: বিশেষ সংবাদদাতা', 'Photo: Special Correspondent', 'রাতের আঁধারে পদ্মা সেতুর উজ্জ্বল আলোকচ্ছটা নদীর পানিতে মোহময় প্রতিফলন তৈরি করে।', 'Vibrant illumination of Padma Bridge casts striking reflections upon the river waters.'),
('coxsbazar-sea-beach-crowd', 'কক্সবাজার সমুদ্রসৈকতে পর্যটকদের উপচে পড়া ভিড়', 'Huge rush of tourists at Cox’s Bazar sea beach', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', 'ছবি: নিজস্ব প্রতিবেদক', 'Photo: Staff Reporter', 'ছুটির দিনে বিশ্বের দীর্ঘতম সমুদ্রসৈকতে উচ্ছ্বাসে মেতেছেন হাজারো ভ্রমণপিপাসু।', 'Thousands of holidaymakers rejoice along the world’s longest natural sandy beach.');

-- 8. Videos Table
DROP TABLE IF EXISTS videos;
CREATE TABLE videos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title_bn VARCHAR(500) NOT NULL,
  title_en VARCHAR(500) NOT NULL DEFAULT '',
  thumb VARCHAR(500) NOT NULL,
  video_url VARCHAR(500) NOT NULL,
  duration VARCHAR(50) NOT NULL DEFAULT '৩:৩০',
  views INT NOT NULL DEFAULT 0,
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO videos (slug, title_bn, title_en, thumb, video_url, duration, views) VALUES
('bd-vs-india-asia-cup-final-highlights', 'বাংলাদেশ বনাম ভারত এশিয়া কাপ ফাইনাল: জয়ের রোমাঞ্চকর মুহূর্তগুলো', 'Bangladesh vs India Asia Cup Final: Thrilling Winning Moments', 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '৮:৩২', 125000),
('transformation-of-bangladesh-documentary', 'পদ্মা সেতু ও মেট্রোরেল: বাংলাদেশের রূপান্তরের ১০ বছর', 'Padma Bridge & Metro Rail: 10 Years of Bangladesh’s Transformation', 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '১৫:৪৫', 84000),
('sundarbans-drone-tech-conservation', 'সুন্দরবনে ড্রোন প্রযুক্তির ব্যবহার: বন্যপ্রাণী সংরক্ষণে নতুন দিগন্ত', 'Drones in Sundarbans: A New Horizon for Wildlife Conservation', 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '৬:১২', 42000);

-- 9. Currency Rates Table (Bangladesh Bank & Govt Forex Rates)
DROP TABLE IF EXISTS currency_rates;
CREATE TABLE currency_rates (
  currency VARCHAR(10) NOT NULL PRIMARY KEY,
  name_bn VARCHAR(100) NOT NULL DEFAULT '',
  name_en VARCHAR(100) NOT NULL DEFAULT '',
  symbol VARCHAR(10) NOT NULL DEFAULT '',
  flag VARCHAR(10) NOT NULL DEFAULT '',
  buy DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  sell DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  change_val VARCHAR(20) NOT NULL DEFAULT '0.00',
  change_type VARCHAR(10) NOT NULL DEFAULT 'neutral',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO currency_rates (currency, name_bn, name_en, symbol, flag, buy, sell, change_val, change_type) VALUES
('USD', 'মার্কিন ডলার', 'US Dollar', '$', '🇺🇸', 121.80, 122.50, '+0.15', 'up'),
('EUR', 'ইউরো', 'Euro', '€', '🇪🇺', 131.40, 132.20, '+0.20', 'up'),
('GBP', 'ব্রিটিশ পাউন্ড', 'British Pound', '£', '🇬🇧', 155.10, 156.00, '-0.10', 'down'),
('SAR', 'সৌদি রিয়াল', 'Saudi Riyal', '﷼', '🇸🇦', 32.45, 32.75, '0.00', 'neutral'),
('AED', 'ইউএই দিরহাম', 'UAE Dirham', 'د.إ', '🇦🇪', 33.15, 33.45, '+0.05', 'up'),
('KWD', 'কুয়েতি দিনার', 'Kuwaiti Dinar', 'KD', '🇰🇼', 395.50, 397.80, '+0.50', 'up'),
('QAR', 'কাতারি রিয়াল', 'Qatari Riyal', 'QR', '🇶🇦', 33.30, 33.60, '+0.05', 'up'),
('MYR', 'মালয়েশিয়ান রিঙ্গিত', 'Malaysian Ringgit', 'RM', '🇲🇾', 27.70, 28.05, '+0.08', 'up'),
('SGD', 'সিঙ্গাপুর ডলার', 'Singapore Dollar', 'S$', '🇸🇬', 91.80, 92.60, '+0.15', 'up'),
('CAD', 'কানাডিয়ান ডলার', 'Canadian Dollar', 'C$', '🇨🇦', 88.10, 88.90, '-0.15', 'down'),
('AUD', 'অস্ট্রেলিয়ান ডলার', 'Australian Dollar', 'A$', '🇦🇺', 78.40, 79.20, '+0.10', 'up'),
('INR', 'ভারতীয় রুপি', 'Indian Rupee', '₹', '🇮🇳', 1.42, 1.46, '0.00', 'neutral'),
('GOLD', 'স্বর্ণ (২২ ক্যারেট ভরি)', 'Gold (22K Bhori)', 'Au', '🪙', 138500, 142000, '+650', 'up')
ON DUPLICATE KEY UPDATE buy = VALUES(buy), sell = VALUES(sell);

-- 10. Polls Table (পাঠক জরিপ)
DROP TABLE IF EXISTS polls;
CREATE TABLE polls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_bn VARCHAR(500) NOT NULL,
  question_en VARCHAR(500) NOT NULL DEFAULT '',
  options JSON NOT NULL,
  total_votes INT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO polls (question_bn, question_en, options, total_votes, status) VALUES
('আপনি কি মনে করেন এআই নিয়ন্ত্রিত ট্র্যাফিক সিগন্যাল ঢাকায় যানজট নিরসনে ফলপ্রসূ হবে?', 'Do you believe AI-driven adaptive traffic signals will solve congestion in Dhaka?', '[{"id":"yes","label_bn":"হ্যাঁ","label_en":"Yes","votes":158},{"id":"no","label_bn":"না","label_en":"No","votes":37},{"id":"no_opinion","label_bn":"মন্তব্য নেই","label_en":"No Opinion","votes":13}]', 208, 'active');

