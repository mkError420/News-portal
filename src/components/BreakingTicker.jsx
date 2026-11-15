import { Link } from 'react-router-dom'
import { Flame } from 'lucide-react'

export default function BreakingTicker({ items = [], lang = 'bn', articles = [] }) {
  // Only show active items
  const activeItems = (items || []).filter((it) => it && it.active !== false && it.active !== 0)
  if (activeItems.length === 0) return null

  // Duplicate list to achieve continuous infinite marquee loop
  const marqueeItems = [...activeItems, ...activeItems, ...activeItems]

  const resolveTargetUrl = (item) => {
    // 1. Explicit custom URL
    if (item.url && typeof item.url === 'string' && item.url.trim()) {
      return item.url.trim()
    }

    // 2. Explicit article ID link
    if (item.article_id) {
      const matchedArt = (articles || []).find(
        (a) => a.id === item.article_id || String(a.id) === String(item.article_id)
      )
      if (matchedArt?.slug) {
        return `/article/${matchedArt.slug}`
      }
      return `/article/${item.article_id}`
    }

    // 3. Slug matching
    if (item.slug && typeof item.slug === 'string' && item.slug.trim()) {
      const cleanSlug = item.slug.trim()
      if (cleanSlug.startsWith('/')) {
        return cleanSlug
      }
      const matched = (articles || []).find((a) => a.slug === cleanSlug)
      if (matched) {
        return `/article/${matched.slug}`
      }
      return `/article/${cleanSlug}`
    }

    // 4. Try matching article by headline keywords
    const titleToSearch = (item.title_bn || item.title_en || item.title || '').trim().toLowerCase()
    if (titleToSearch && Array.isArray(articles) && articles.length > 0) {
      const matched = articles.find(
        (a) =>
          (a.title_bn && a.title_bn.toLowerCase().includes(titleToSearch)) ||
          (a.title_en && a.title_en.toLowerCase().includes(titleToSearch)) ||
          titleToSearch.includes((a.title_bn || '').toLowerCase())
      )
      if (matched?.slug) {
        return `/article/${matched.slug}`
      }
    }

    // 5. Fallback to latest article or home
    return (articles && articles[0]?.slug) ? `/article/${articles[0].slug}` : '/'
  }

  return (
    <div className="bg-[#e30613] text-white overflow-hidden py-1.5 shadow-inner select-none font-bengali">
      <div className="max-w-7xl mx-auto px-4 flex items-center">
        {/* Badge Label */}
        <div className="flex-shrink-0 flex items-center gap-1.5 bg-white text-[#e30613] px-2.5 py-1 rounded-sm text-xs font-bold uppercase tracking-wider shadow-sm z-10 mr-3">
          <span>{lang === 'bn' ? 'সর্বশেষ' : 'Breaking'}</span>
        </div>

        {/* Ticker Animation Strip */}
        <div className="flex-1 overflow-hidden relative group">
          <div className="ticker-track flex items-center whitespace-nowrap text-sm font-medium group-hover:[animation-play-state:paused]">
            {marqueeItems.map((item, index) => {
              const headline = (lang === 'bn' ? item.title_bn : item.title_en) ||
                item.title_bn ||
                item.title_en ||
                item.title ||
                ''
              const targetUrl = resolveTargetUrl(item)
              const isExternal = targetUrl.startsWith('http://') || targetUrl.startsWith('https://')

              if (isExternal) {
                return (
                  <a
                    key={`${item.id || index}-${index}`}
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center hover:underline hover:text-yellow-200 transition-colors mr-8 group/link cursor-pointer"
                  >
                    <span>{headline}</span>
                    <span className="mx-4 text-white/40 text-xs">◆</span>
                  </a>
                )
              }

              return (
                <Link
                  key={`${item.id || index}-${index}`}
                  to={targetUrl}
                  className="inline-flex items-center hover:underline hover:text-yellow-200 transition-colors mr-8 group/link cursor-pointer"
                >
                  <span>{headline}</span>
                  <span className="mx-4 text-white/40 text-xs">◆</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
