CREATE DATABASE IF NOT EXISTS news_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE news_portal;

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  subheadline VARCHAR(255) DEFAULT NULL,
  summary TEXT NOT NULL,
  author VARCHAR(150) NOT NULL,
  author_role VARCHAR(150) DEFAULT NULL,
  image VARCHAR(500) NOT NULL,
  image_caption VARCHAR(255) DEFAULT NULL,
  image_credit VARCHAR(255) DEFAULT NULL,
  published_at DATETIME NOT NULL,
  updated_at DATETIME DEFAULT NULL,
  read_time VARCHAR(50) DEFAULT '4 min read',
  views INT NOT NULL DEFAULT 0,
  tags JSON DEFAULT NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  content LONGTEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS breaking_news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admins (email, password_hash)
VALUES ('admin@mknews.com', '$2y$10$Yxq2M0JdWj0tM1M2kH0XW.7rZ7xXRu0XTEj3p1VgP2wJ9xH2wVC2K')
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);

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
('Lifestyle', 'lifestyle')
ON DUPLICATE KEY UPDATE slug = VALUES(slug);

INSERT INTO breaking_news (title, slug) VALUES
('বরিশাল ও বরগুনায় বৃষ্টির সঙ্গে বজ্রপাতের সতর্কতা জারি', 'rain-warning-barisal'),
('স্থলবন্দর, সেতু ও রেললাইনে উন্নয়নের নতুন চুক্তি', 'new-transport-pact'),
('বাংলাদেশের অর্থনীতিতে রফতানি খাতে নতুন উল্লম্ফন', 'export-growth-bangladesh')
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO articles (
  slug, title, category, subheadline, summary, author, author_role, image,
  image_caption, image_credit, published_at, read_time, views, tags, featured, content
) VALUES
(
  'bangladesh-flood-relief-response-grows',
  'বন্যা কবলিত এলাকায় সহায়তা বাড়াচ্ছে বাংলাদেশ',
  'National',
  'নদীর পানি বৃদ্ধির সঙ্গে সঙ্গে জরুরি ত্রাণ ও স্বাস্থ্যসেবা সম্প্রসারণ',
  'বন্যা-আক্রান্ত গ্রামগুলোতে খাবার, ত্রাণসামগ্রী ও চিকিৎসা সহায়তা বাড়িয়ে দিয়েছে সরকার ও নাগরিক সমাজ।',
  'শাহরিয়ার হোসেন',
  'সংবাদদাতা',
  'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=80',
  'নদীর পানির উপরে চলমান ত্রাণ কার্যক্রম',
  'ফাইল ছবি',
  '2026-11-11 09:30:00',
  '4 min read',
  18420,
  JSON_ARRAY('বন্যা', 'ত্রাণ'),
  1,
  '<p>বাংলাদেশের উত্তর ও দক্ষিণাঞ্চলের কিছু অংশে বন্যা পরিস্থিতি নাজুক হয়ে উঠেছে। সরকারী ও বেসরকারি সংস্থাগুলো পানি উন্নয়ন ও মন্ত্রণালয়ের সঙ্গে সমন্বয় করে ত্রাণ কার্যক্রম দ্রুত বাড়িয়েছে।</p><p>কৃষি জমিতে পানির কারণে ফসলের ক্ষতি হলেও স্থানীয় প্রশাসন দ্রুত সেচ ও খাদ্য সহায়তা পৌঁছে দিচ্ছে। বিশেষ করে শিশু ও বয়স্কদের জন্য ডায়রিয়া প্রতিরোধ ও পানি শুদ্ধিকরণের ব্যবস্থা নেওয়া হচ্ছে।</p><p>এদিকে, শিক্ষাপ্রতিষ্ঠান ও সামাজিক সংগঠনগুলোও ত্রাণ শিবিরে সহযোগিতা জোরদার করেছে। আবহাওয়া দপ্তর বলেছে, আগামী কয়েক দিনে বৃষ্টিপাত অব্যাহত থাকতে পারে।</p>'
),
(
  'economic-policy-boosts-export-sector',
  'রফতানিমুখী নীতি নিয়ে নতুন আস্থা ফিরছে',
  'Economy',
  'গার্মেন্টস ও কৃষি-ভিত্তিক রফতানি বৃদ্ধির পথে নতুন পদক্ষেপ',
  'বৈশ্বিক বাজারে চাহিদা বৃদ্ধির সঙ্গে রফতানিবান্ধব নীতিতে নতুন করে আস্থা দেখা যাচ্ছে।',
  'মেহেদী হাসান',
  'অর্থনীতি সম্পাদক',
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
  'অর্থনৈতিক কার্যক্রমে নতুন বিনিয়োগের প্রত্যাশা',
  'স্টক ছবি',
  '2026-11-10 10:00:00',
  '5 min read',
  14680,
  JSON_ARRAY('অর্থনীতি', 'রফতানি'),
  0,
  '<p>চীনের বাজারে নতুন চাহিদা এবং দেশের অভ্যন্তরীণ উৎপাদন বৃদ্ধির মাধ্যমে রফতানি আয় বাড়ছে।</p><p>কৃষিজাত ও পোশাক খাতে অর্ডারের সংখ্যা বেড়েছে, যা শ্রমিকদের কর্মসংস্থান ফিরিয়ে আনছে।</p><p>পর্যটন ও তথ্যপ্রযুক্তি খাতেও নতুন বিনিয়োগের সম্ভাবনা দেখা দিয়েছে।</p>'
),
(
  'bangladesh-cricket-team-asia-cup-prep',
  'এশিয়া কাপে প্রস্তুতি ত্বরান্বিত করছে বাংলাদেশ',
  'Sports',
  'নতুন কোচ ও পরিকল্পনার সঙ্গেই শক্তিশালী অনুশীলন',
  'ক্রিকেট দলটি তাদের প্রস্তুতির মান উন্নত করতে ঘরোয়া ও আন্তর্জাতিক ম্যাচের তালিকা জোরদার করেছে।',
  'তৌহিদুর রহমান',
  'খেলাধুলা সম্পাদক',
  'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80',
  'মাঠে অস্বস্তি কাটিয়ে উঠছে দল',
  'সরাসরি',
  '2026-11-12 07:20:00',
  '4 min read',
  16600,
  JSON_ARRAY('ক্রিকেট', 'এশিয়া কাপ'),
  0,
  '<p>বাংলাদেশ ক্রিকেট দল শারীরিক প্রস্তুতি ও ট্যাকটিক্যাল অনুশীলনে জোর দিচ্ছে।</p><p>নতুন কোচের নেতৃত্বে ব্যাটিং অর্ডার ও বোলিং ওভারের বিকল্প নিয়ে আলোচনা চলছে।</p>'
),
(
  'tech-startups-raise-innovation-funding',
  'স্টার্টআপ খাতে বিনিয়োগ বাড়ছে, উদ্ভাবন দারুণ',
  'Technology',
  'স্মার্ট টেকসই পণ্য ও ডিজিটাল পরিষেবায় নতুন বিনিয়োগ',
  'বাংলাদেশের প্রযুক্তি খাত আরও দ্রুত এগোচ্ছে, নতুন স্টার্টআপে বিনিয়োগ এবং উদ্যোক্তা শক্তি বাড়ছে।',
  'নাজমুল ইসলাম',
  'টেক রিপোর্টার',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  'টেকনোলজি স্টার্টআপের মডেল এলাকায় কর্মপরিকল্পনা',
  'ডিজিটাল',
  '2026-11-08 12:10:00',
  '5 min read',
  20110,
  JSON_ARRAY('স্টার্টআপ', 'টেকনোলজি'),
  0,
  '<p>বাংলাদেশের টেক স্টার্টআপগুলো সফ্টওয়্যার, ইকমার্স ও স্বাস্থ্যসেবা প্রযুক্তিতে নতুন উদ্ভাবন করছে।</p><p>বিনিয়োগকারীদের আগ্রহ বাড়ায় দ্রুত করে প্রবৃদ্ধির পথ খুলে গেছে।</p>'
)
ON DUPLICATE KEY UPDATE title = VALUES(title);
