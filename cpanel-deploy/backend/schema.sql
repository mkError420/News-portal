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

-- Admin Login: admin@mknews.com / Password: admin123
INSERT INTO admins (email, password_hash)
VALUES ('admin@mknews.com', '$2y$12$705b7AB1U6/IggUzxuVjSu01oiNtH7MGt4z437dwBoM0dB6hFQSTq');

-- 2. Categories Table
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO categories (name, slug) VALUES
('National', 'national'),
('Politics', 'politics'),
('International', 'international'),
('Economy', 'economy'),
('Business', 'business'),
('Sports', 'sports'),
('Entertainment', 'entertainment'),
('Technology', 'technology'),
('Education', 'education'),
('Health', 'health'),
('Lifestyle', 'lifestyle'),
('Opinion', 'opinion');

-- 3. Breaking News Table
DROP TABLE IF EXISTS breaking_news;
CREATE TABLE breaking_news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
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
  category VARCHAR(100) NOT NULL DEFAULT 'national',
  subheadline VARCHAR(500) DEFAULT NULL,
  summary TEXT NOT NULL,
  author VARCHAR(150) NOT NULL DEFAULT 'প্রথম আলো ডেস্ক',
  author_role VARCHAR(150) DEFAULT 'প্রতিবেদক',
  image VARCHAR(500) NOT NULL,
  image_caption VARCHAR(255) DEFAULT NULL,
  image_credit VARCHAR(255) DEFAULT NULL,
  published_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  read_time VARCHAR(50) DEFAULT '4 min read',
  views INT NOT NULL DEFAULT 0,
  tags JSON DEFAULT NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  content LONGTEXT NOT NULL
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
