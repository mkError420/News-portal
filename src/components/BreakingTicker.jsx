import { Link } from 'react-router-dom'
import { Flame } from 'lucide-react'

export default function BreakingTicker({ items = [], lang = 'bn', articles = [] }) {
  // Only show active items
  const activeItems = (items || []).filter((it) => it && it.active !== false && it.active !== 0)
  if (activeItems.length === 0) return null

  // Ensure enough items to span wide screens seamlessly
  const baseItems = activeItems.length < 3
    ? [...activeItems, ...activeItems, ...activeItems]
    : activeItems

  // Exactly two identical halves for mathematically seamless -50% infinite TV loop
  const marqueeItems = [...baseItems, ...baseItems]

  // Calculated comfortable TV reading speed: ~8-9 seconds per headline (min 30s)
  const durationSeconds = Math.max(30, baseItems.length * 8.5)

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
    <div className="bg-[#b80010] border-y border-red-800/40 text-white overflow-hidden py-1.5 shadow-md select-none font-bengali relative">
      <div className="max-w-7xl mx-auto px-4 flex items-center">
        {/* TV Style Live Badge */}
        <div className="flex-shrink-0 flex items-center gap-2 bg-black/35 border border-white/20 text-white px-3 py-1 rounded text-xs font-black uppercase tracking-wider shadow-sm z-20 mr-3.5 backdrop-blur-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,1)]"></span>
          </span>
          <span className="text-white font-extrabold tracking-wide">
            {lang === 'bn' ? 'ব্রেকিং নিউজ' : 'BREAKING'}
          </span>
        </div>

        {/* Ticker Animation Strip with TV broadcast gradient fade on edges */}
        <div className="flex-1 overflow-hidden relative group">
          {/* Subtle edge fades for TV aesthetic */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#b80010] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#b80010] to-transparent z-10 pointer-events-none" />

          <div
            className="tv-ticker-track ticker-track flex items-center whitespace-nowrap text-sm font-medium text-white/95"
            style={{
              animationDuration: `${durationSeconds}s`,
            }}
          >
            {marqueeItems.map((item, index) => {
              const headline = (lang === 'bn' ? item.title_bn : item.title_en) ||
                item.title_bn ||
                item.title_en ||
                item.title ||
                ''
              const targetUrl = resolveTargetUrl(item)
              const isExternal = targetUrl.startsWith('http://') || targetUrl.startsWith('https://')

              const itemContent = (
                <span className="inline-flex items-center hover:text-yellow-200 transition-colors py-0.5 group/item cursor-pointer">
                  <span className="font-semibold text-white/95 hover:text-yellow-200 tracking-wide">
                    {headline}
                  </span>
                  <span className="mx-6 text-yellow-300 text-xs font-bold inline-flex items-center justify-center opacity-85 select-none">
                    ●
                  </span>
                </span>
              )

              if (isExternal) {
                return (
                  <a
                    key={`${item.id || index}-${index}`}
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {itemContent}
                  </a>
                )
              }

              return (
                <Link
                  key={`${item.id || index}-${index}`}
                  to={targetUrl}
                >
                  {itemContent}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
