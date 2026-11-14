-- Run once on an existing legacy database to enable bilingual article and ticker fields.
-- Back up the database before applying this migration.

ALTER TABLE articles
  ADD COLUMN title_bn VARCHAR(500) NOT NULL DEFAULT '',
  ADD COLUMN title_en VARCHAR(500) NOT NULL DEFAULT '',
  ADD COLUMN subheadline_bn VARCHAR(500) DEFAULT NULL,
  ADD COLUMN subheadline_en VARCHAR(500) DEFAULT NULL,
  ADD COLUMN summary_bn TEXT DEFAULT NULL,
  ADD COLUMN summary_en TEXT DEFAULT NULL,
  ADD COLUMN author_bn VARCHAR(150) NOT NULL DEFAULT '',
  ADD COLUMN author_en VARCHAR(150) NOT NULL DEFAULT '',
  ADD COLUMN author_role_bn VARCHAR(150) DEFAULT NULL,
  ADD COLUMN author_role_en VARCHAR(150) DEFAULT NULL,
  ADD COLUMN tags_bn JSON DEFAULT NULL,
  ADD COLUMN tags_en JSON DEFAULT NULL,
  ADD COLUMN content_bn LONGTEXT DEFAULT NULL,
  ADD COLUMN content_en LONGTEXT DEFAULT NULL;

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

ALTER TABLE breaking_news
  ADD COLUMN title_bn VARCHAR(500) NOT NULL DEFAULT '',
  ADD COLUMN title_en VARCHAR(500) NOT NULL DEFAULT '';

UPDATE breaking_news
SET title_bn = title,
    title_en = title;
