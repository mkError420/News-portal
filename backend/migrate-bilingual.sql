-- ========================================================
-- Safe Bilingual Migration Script for News Portal
-- Enables bilingual article and ticker fields safely
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ========================================================

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS title_bn VARCHAR(500) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS title_en VARCHAR(500) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS subheadline_bn VARCHAR(500) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS subheadline_en VARCHAR(500) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS summary_bn TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS summary_en TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS author_bn VARCHAR(150) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS author_en VARCHAR(150) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS author_role_bn VARCHAR(150) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS author_role_en VARCHAR(150) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tags_bn JSON DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tags_en JSON DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS content_bn LONGTEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS content_en LONGTEXT DEFAULT NULL;

-- Populate bilingual fields from legacy columns if empty
UPDATE articles
SET title_bn = CASE WHEN title_bn = '' OR title_bn IS NULL THEN title ELSE title_bn END,
    title_en = CASE WHEN title_en = '' OR title_en IS NULL THEN title ELSE title_en END,
    subheadline_bn = COALESCE(subheadline_bn, subheadline),
    subheadline_en = COALESCE(subheadline_en, subheadline),
    summary_bn = COALESCE(summary_bn, summary),
    summary_en = COALESCE(summary_en, summary),
    author_bn = CASE WHEN author_bn = '' OR author_bn IS NULL THEN author ELSE author_bn END,
    author_en = CASE WHEN author_en = '' OR author_en IS NULL THEN author ELSE author_en END,
    author_role_bn = COALESCE(author_role_bn, author_role),
    author_role_en = COALESCE(author_role_en, author_role),
    tags_bn = COALESCE(tags_bn, tags),
    tags_en = COALESCE(tags_en, tags),
    content_bn = COALESCE(content_bn, content),
    content_en = COALESCE(content_en, content);

ALTER TABLE breaking_news
  ADD COLUMN IF NOT EXISTS title_bn VARCHAR(500) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS title_en VARCHAR(500) NOT NULL DEFAULT '';

UPDATE breaking_news
SET title_bn = CASE WHEN title_bn = '' OR title_bn IS NULL THEN title ELSE title_bn END,
    title_en = CASE WHEN title_en = '' OR title_en IS NULL THEN title ELSE title_en END;
