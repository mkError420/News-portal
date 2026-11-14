import { Link } from 'react-router-dom'
import { Flame } from 'lucide-react'

export default function BreakingTicker({ items = [], lang = 'bn' }) {
  if (!items || items.length === 0) return null

  // Duplicate list to achieve continuous infinite marquee loop
  const marqueeItems = [...items, ...items, ...items]

  return (
    <div className="bg-[#e30613] text-white overflow-hidden py-1.5 shadow-inner select-none font-bengali">
      <div className="max-w-7xl mx-auto px-4 flex items-center">
        {/* Badge Label */}
        <div className="flex-shrink-0 flex items-center gap-1.5 bg-white text-[#e30613] px-2.5 py-1 rounded-sm text-xs font-bold uppercase tracking-wider shadow-sm z-10 mr-3">
          <Flame size={14} className="fill-current text-red-600 animate-pulse" />
          <span>{lang === 'bn' ? 'সর্বশেষ' : 'Breaking'}</span>
        </div>

        {/* Ticker Animation Strip */}
        <div className="flex-1 overflow-hidden relative group">
          <div className="ticker-track flex items-center whitespace-nowrap text-sm font-medium group-hover:[animation-play-state:paused]">
            {marqueeItems.map((item, index) => (
              <Link
                key={`${item.id}-${index}`}
                to={`/article/${item.slug}`}
                className="inline-flex items-center hover:underline hover:text-yellow-200 transition-colors mr-8 group/link"
              >
                <span>{lang === 'bn' ? item.title_bn : item.title_en}</span>
                <span className="mx-4 text-white/40 text-xs">◆</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
