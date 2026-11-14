import { Helmet } from 'react-helmet-async'

/**
 * Universal SEO & Social Meta Tags Component
 * Generates OpenGraph, Twitter Cards, Canonical URLs, Meta Robots, and JSON-LD Structured Data
 */
export default function SEO({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
  schema = null,
  lang = 'bn',
  settings = null,
  noindex = false,
}) {
  const siteName = (lang === 'bn' ? settings?.site_name_bn : settings?.site_name_en) ||
    (lang === 'bn' ? 'প্রথম কালো' : 'Prothom kalo')
  
  const siteTagline = (lang === 'bn' ? settings?.tagline_bn : settings?.tagline_en) ||
    (lang === 'bn' ? 'অনলাইন সংস্করণ • সত্যের সন্ধানে নির্ভীক' : 'Online Edition • Fearless in Pursuit of Truth')

  const defaultDescription = (lang === 'bn' ? settings?.about_bn : settings?.about_en) ||
    'সর্বশেষ সংবাদ, রাজনীতি, অর্থনীতি, খেলাধুলা, বিনোদন ও আন্তর্জাতিক খবরের বিশ্বস্ত মাধ্যম।'

  const baseUrl = (settings?.canonical_base_url || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '')
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
  const canonicalUrl = canonical || (baseUrl ? `${baseUrl}${currentPath}` : '')

  const fullTitle = title
    ? `${title} | ${siteName}`
    : `${siteName} - ${siteTagline}`

  const metaDesc = description || defaultDescription

  const defaultImage = settings?.og_image_default || settings?.logo_url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80'
  const resolvedOgImage = ogImage || defaultImage

  const metaKeywords = Array.isArray(keywords)
    ? keywords.join(', ')
    : keywords || settings?.meta_keywords_default || 'সংবাদ, বাংলাদেশ, প্রথম কালো, খবর, ব্রেকিং নিউজ, News, Bangladesh, Prothom kalo'

  const twitterHandle = settings?.twitter_handle || '@ProthomKalo'

  // Prepare standard JSON-LD Schema
  let jsonLdList = []
  if (schema) {
    if (Array.isArray(schema)) {
      jsonLdList = schema
    } else {
      jsonLdList = [schema]
    }
  }

  return (
    <Helmet>
      {/* Basic HTML Meta */}
      <html lang={lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      <meta name="keywords" content={metaKeywords} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Crawlers & Indexing Directives */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <>
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
          <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
          <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        </>
      )}

      {/* Verification tags for Search Consoles */}
      {settings?.google_site_verification && (
        <meta name="google-site-verification" content={settings.google_site_verification} />
      )}
      {settings?.bing_site_verification && (
        <meta name="msvalidate.01" content={settings.bing_site_verification} />
      )}

      {/* Open Graph (Facebook, WhatsApp, LinkedIn) */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title || fullTitle} />
      <meta property="og:description" content={metaDesc} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={lang === 'bn' ? 'bn_BD' : 'en_US'} />

      {/* Article Specific Open Graph */}
      {ogType === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {Array.isArray(tags) &&
            tags.map((tag, idx) => (
              <meta key={`tag-${idx}`} property="article:tag" content={tag} />
            ))}
        </>
      )}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={title || fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={resolvedOgImage} />

      {/* JSON-LD Structured Data */}
      {jsonLdList.map((item, idx) => (
        <script key={`schema-${idx}`} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  )
}
