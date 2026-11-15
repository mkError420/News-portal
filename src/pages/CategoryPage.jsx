import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Home, ChevronRight, Filter, TrendingUp } from 'lucide-react'
import NewsCard from '../components/NewsCard.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import AdBanner from '../components/AdBanner.jsx'
import SEO from '../components/SEO.jsx'
import { CATEGORIES_BN, CATEGORIES_EN } from '../utils.js'

export default function CategoryPage({ articles = [], categories = [], settings = null, lang = 'bn' }) {
  const { slug } = useParams()
  const catKey = (slug || 'national').toLowerCase()
  const [selectedSubcat, setSelectedSubcat] = useState('all')
  const [visibleCount, setVisibleCount] = useState(9)

  const matchedCat = (categories || []).find(
    (c) => (c.slug || '').toLowerCase() === catKey || (c.name || '').toLowerCase() === catKey
  )

  const catTitleBn = matchedCat?.name_bn || CATEGORIES_BN[catKey] || matchedCat?.name || slug
  const catTitleEn = matchedCat?.name_en || CATEGORIES_EN[catKey] || matchedCat?.name || slug
  const categoryTitle = lang === 'bn' ? catTitleBn : catTitleEn

  // Filter articles by category (slug, en name, or bn name)
  const filtered = articles.filter((a) => {
    const artCat = (a.category || '').toLowerCase().trim()
    return (
      artCat === catKey ||
      (matchedCat && (
        artCat === (matchedCat.slug || '').toLowerCase() ||
        artCat === (matchedCat.name_en || '').toLowerCase() ||
        artCat === (matchedCat.name_bn || '').toLowerCase()
      ))
    )
  })

  const hasArticles = filtered.length > 0
  const lead = hasArticles ? filtered[0] : null
  const rest = hasArticles ? filtered.slice(1, visibleCount) : []
  const mostReadCategory = [...filtered].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5)

  // Subcategory filters by category
  const subcategoryMap = {
    national: [
      { id: 'all', bn: 'সব সংবাদ', en: 'All' },
      { id: 'dhaka', bn: 'ঢাকা', en: 'Dhaka' },
      { id: 'chittagong', bn: 'চট্টগ্রাম', en: 'Chittagong' },
      { id: 'countrywide', bn: 'সারাদেশ', en: 'Countrywide' },
      { id: 'crime', bn: 'আইন-আদালত', en: 'Crime & Law' },
    ],
    politics: [
      { id: 'all', bn: 'সব রাজনীতি', en: 'All' },
      { id: 'election', bn: 'নির্বাচন', en: 'Elections' },
      { id: 'govt', bn: 'সরকার', en: 'Government' },
      { id: 'parliament', bn: 'সংসদ', en: 'Parliament' },
    ],
    sports: [
      { id: 'all', bn: 'সব খেলা', en: 'All' },
      { id: 'cricket', bn: 'ক্রিকেট', en: 'Cricket' },
      { id: 'football', bn: 'ফুটবল', en: 'Football' },
      { id: 'other', bn: 'অন্যান্য', en: 'Other' },
    ],
    economy: [
      { id: 'all', bn: 'সব অর্থনীতি', en: 'All' },
      { id: 'business', bn: 'বাণিজ্য', en: 'Business' },
      { id: 'bank', bn: 'ব্যাংক ও বিমা', en: 'Banking' },
      { id: 'market', bn: 'শেয়ারবাজার', en: 'Stock Market' },
    ],
  }

  const subcategories = subcategoryMap[catKey] || [
    { id: 'all', bn: 'সব সংবাদ', en: 'All News' },
    { id: 'latest', bn: 'সর্বশেষ', en: 'Latest' },
    { id: 'analysis', bn: 'বিশ্লেষণ', en: 'Analysis' },
  ]

  const originUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const catUrl = `${originUrl}/category/${catKey}`

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: lang === 'bn' ? 'প্রচ্ছদ' : 'Home',
        item: originUrl || '/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoryTitle,
        item: catUrl,
      },
    ],
  }

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${categoryTitle} সংবাদ`,
    url: catUrl,
    description: `${categoryTitle} বিভাগের সর্বশেষ ও ব্রেকিং নিউজ সরাসরি আমাদের পোর্টালে পড়ুন।`,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-bengali">
      <SEO
        title={`${categoryTitle} সংবাদ ও খবর`}
        description={`${categoryTitle} বিভাগের সর্বশেষ ও ব্রেকিং নিউজ, ছবি ও বিশ্লেষণ।`}
        canonical={catUrl}
        schema={[breadcrumbSchema, collectionSchema]}
        lang={lang}
        settings={settings}
      />
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 pb-2 border-b border-gray-200">
        <Link to="/" className="hover:text-red-600 flex items-center gap-1">
          <Home size={13} />
          <span>{lang === 'bn' ? 'প্রচ্ছদ' : 'Home'}</span>
        </Link>
        <ChevronRight size={12} className="text-gray-400" />
        <span className="font-bold text-[#e30613]">{categoryTitle}</span>
      </nav>

      {/* Category Header Banner */}
      <div className="bg-white p-5 rounded border-l-4 border-l-[#e30613] border border-gray-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a]">
            {categoryTitle}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {lang === 'bn'
              ? `${categoryTitle} বিভাগের সর্বশেষ তাজা খবর ও বিশ্লেষণ`
              : `Latest news and updates in ${categoryTitle}`}
          </p>
        </div>

        {/* Subcategory Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {subcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubcat(sub.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${selectedSubcat === sub.id
                  ? 'bg-[#e30613] text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {lang === 'bn' ? sub.bn : sub.en}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {!hasArticles ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center my-4 shadow-xs">
              <h3 className="text-lg font-bold text-gray-800">
                {lang === 'bn'
                  ? `"${categoryTitle}" বিভাগে বর্তমানে কোনো সংবাদ পাওয়া যায়নি।`
                  : `No articles found in "${categoryTitle}".`}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {lang === 'bn'
                  ? 'নতুন সংবাদ প্রকাশিত হলে তা এখানে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।'
                  : 'New stories will appear here as soon as they are published.'}
              </p>
              <Link to="/" className="inline-block mt-4 text-xs font-semibold text-red-600 hover:underline">
                {lang === 'bn' ? '← প্রচ্ছদে ফিরে যান' : '← Back to Home'}
              </Link>
            </div>
          ) : (
            <>
              {/* Category Lead Story */}
              {lead && (
                <div>
                  <NewsCard article={lead} variant="hero" lang={lang} />
                </div>
              )}

              {/* Grid of Other Category Stories */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {rest.map((art) => (
                    <NewsCard key={art.id} article={art} variant="grid" lang={lang} />
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {visibleCount < filtered.length && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 6)}
                    className="px-6 py-2.5 bg-white border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold text-sm rounded transition-colors shadow-sm"
                  >
                    {lang === 'bn' ? 'আরও সংবাদ লোড করুন' : 'Load More News'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar (4 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Most Read in Category */}
          <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 border-b-2 border-[#e30613] pb-2 mb-3">
              <TrendingUp size={18} className="text-[#e30613]" />
              <h3 className="font-extrabold text-base text-gray-900">
                {lang === 'bn' ? `${categoryTitle}ের সর্বাধিক পঠিত` : `Most Read in ${categoryTitle}`}
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {mostReadCategory.map((art, idx) => (
                <NewsCard key={art.id} article={art} variant="sidebar" lang={lang} rank={idx + 1} />
              ))}
            </div>
          </div>

          {/* Ad Banner */}
          <AdBanner size="rectangle" lang={lang} settings={settings} />

          {/* Popular Category Tags */}
          <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
            <h4 className="font-bold text-sm text-gray-900 border-b pb-2 mb-3">
              {lang === 'bn' ? 'সম্পর্কিত টপিক' : 'Related Topics'}
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {(lead?.tags_bn || ['বাংলাদেশ', 'সংবাদ', 'উন্নয়ন', 'প্রশাসন']).map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded text-gray-700 cursor-pointer transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

