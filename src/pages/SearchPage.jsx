import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search as SearchIcon, Home, ChevronRight, Filter, SlidersHorizontal } from 'lucide-react'
import NewsCard from '../components/NewsCard.jsx'
import SEO from '../components/SEO.jsx'
import { CATEGORIES_BN, CATEGORIES_EN, toBengaliNumber } from '../utils.js'

export default function SearchPage({ articles = [], settings = null, lang = 'bn' }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('latest') // 'latest' | 'views'

  useEffect(() => {
    setQuery(searchParams.get('q') || '')
  }, [searchParams])

  const filteredArticles = useMemo(() => {
    const q = query.trim().toLowerCase()
    return articles
      .filter((art) => {
        // Query match
        const matchTitleBn = (art.title_bn || '').toLowerCase().includes(q)
        const matchTitleEn = (art.title_en || '').toLowerCase().includes(q)
        const matchSummaryBn = (art.summary_bn || '').toLowerCase().includes(q)
        const matchSummaryEn = (art.summary_en || '').toLowerCase().includes(q)
        const matchContentBn = (art.content_bn || '').toLowerCase().includes(q)
        const matchContentEn = (art.content_en || '').toLowerCase().includes(q)
        const matchTags = (art.tags_bn || []).some((t) => t.toLowerCase().includes(q))

        const matchesQuery = !q || matchTitleBn || matchTitleEn || matchSummaryBn || matchSummaryEn || matchContentBn || matchContentEn || matchTags

        // Category match (supports multiple categories per article)
        const matchesCategory =
          selectedCategory === 'all' ||
          (art.category || '').toLowerCase() === selectedCategory.toLowerCase() ||
          (Array.isArray(art.categories) && art.categories.some((c) => String(c).toLowerCase().trim() === selectedCategory.toLowerCase()))

        return matchesQuery && matchesCategory
      })
      .sort((a, b) => {
        if (sortBy === 'views') {
          return (b.views || 0) - (a.views || 0)
        }
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
  }, [query, selectedCategory, sortBy, articles])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setSearchParams(query.trim() ? { q: query.trim() } : {})
  }

  const resultCount = lang === 'bn' ? toBengaliNumber(filteredArticles.length) : filteredArticles.length

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-bengali">
      <SEO
        title={query ? (lang === 'bn' ? `"${query}" এর অনুসন্ধান ফলাফল` : `Search Results for "${query}"`) : (lang === 'bn' ? 'সংবাদ অনুসন্ধান' : 'Search News')}
        noindex={true}
        lang={lang}
        settings={settings}
      />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 pb-2 border-b border-gray-200">
        <Link to="/" className="hover:text-red-600 flex items-center gap-1">
          <Home size={13} />
          <span>{lang === 'bn' ? 'প্রচ্ছদ' : 'Home'}</span>
        </Link>
        <ChevronRight size={12} className="text-gray-400" />
        <span className="font-bold text-[#e30613]">{lang === 'bn' ? 'সংবাদ অনুসন্ধান' : 'Search News'}</span>
      </nav>

      {/* Search Input Box Header */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-3xl mx-auto mb-4">
          <div className="relative flex-1">
            <SearchIcon size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === 'bn' ? 'সংবাদ শিরোনাম বা বিষয়বস্তু খুঁজুন...' : 'Search news headlines or content...'}
              className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-bengali"
            />
          </div>
          <button
            type="submit"
            className="bg-[#e30613] hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg text-sm transition-colors shadow-sm"
          >
            {lang === 'bn' ? 'অনুসন্ধান' : 'Search'}
          </button>
        </form>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <span className="font-semibold text-gray-700">{lang === 'bn' ? 'বিভাগ:' : 'Category:'}</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded px-2.5 py-1.5 outline-none font-bengali"
            >
              <option value="all">{lang === 'bn' ? 'সকল বিভাগ' : 'All Categories'}</option>
              {Object.keys(CATEGORIES_BN).map((cat) => (
                <option key={cat} value={cat}>
                  {lang === 'bn' ? CATEGORIES_BN[cat] : CATEGORIES_EN[cat]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-gray-400" />
            <span className="font-semibold text-gray-700">{lang === 'bn' ? 'বাছাই:' : 'Sort By:'}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded px-2.5 py-1.5 outline-none font-bengali"
            >
              <option value="latest">{lang === 'bn' ? 'সর্বশেষ প্রকাশিত' : 'Latest Published'}</option>
              <option value="views">{lang === 'bn' ? 'সর্বাধিক পঠিত' : 'Most Read'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count Banner */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">
          {query ? (
            lang === 'bn' ? (
              <span>"{query}" এর জন্য <span className="text-red-600 font-extrabold">{resultCount}</span> টি সংবাদ পাওয়া গেছে</span>
            ) : (
              <span>Found <span className="text-red-600 font-extrabold">{resultCount}</span> results for "{query}"</span>
            )
          ) : (
            lang === 'bn' ? (
              <span>মোট <span className="text-red-600 font-extrabold">{resultCount}</span> টি সংবাদ প্রদর্শিত হচ্ছে</span>
            ) : (
              <span>Displaying <span className="text-red-600 font-extrabold">{resultCount}</span> articles</span>
            )
          )}
        </h2>
      </div>

      {/* Results Grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map((art) => (
            <NewsCard key={art.id} article={art} variant="grid" lang={lang} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
          <SearchIcon size={40} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-bold text-gray-700 mb-1">
            {lang === 'bn' ? 'কোনো সংবাদ খুঁজে পাওয়া যায়নি' : 'No news found'}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {lang === 'bn'
              ? 'আপনার অনুসন্ধান শব্দ পরিবর্তন করে বা অন্য কোনো বিভাগ নির্বাচন করে আবার চেষ্টা করুন।'
              : 'Try checking your spelling or adjusting your search filters to find what you need.'}
          </p>
        </div>
      )}
    </div>
  )
}

