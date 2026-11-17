import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Eye, Share2 } from 'lucide-react'
import {
  formatRelativeTime,
  formatViews,
  formatBengaliDate,
  formatEnglishDate,
  CATEGORIES_BN,
  CATEGORIES_EN,
  toBengaliNumber,
} from '../utils.js'

export default function NewsCard({ article, variant = 'grid', lang = 'bn', rank }) {
  if (!article) return null

  // Live timer tick every 30s so publish time is fully functional and live updates
  const [, setTick] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30000)
    return () => clearInterval(timer)
  }, [])

  const title = (lang === 'bn' ? article.title_bn : article.title_en) || article.title_bn || article.title
  const summary = (lang === 'bn' ? article.summary_bn : article.summary_en) || article.summary_bn || article.summary
  const catKey = (article.category || 'national').toLowerCase()
  const catLabel = lang === 'bn' ? (CATEGORIES_BN[catKey] || article.category) : (CATEGORIES_EN[catKey] || article.category)
  const timeStr = formatRelativeTime(article.date, lang)
  const fullDateTooltip = lang === 'bn' ? formatBengaliDate(article.date, true) : formatEnglishDate(article.date, true)
  const viewsCount = Math.max(0, parseInt(article.views, 10) || 0)
  const viewsStr = formatViews(viewsCount, lang)
  const targetUrl = `/article/${article.slug}`

  // Category Tag Badge
  const CategoryTag = () => (
    <Link
      to={`/category/${catKey}`}
      onClick={(e) => e.stopPropagation()}
      className="inline-block text-[11px] font-bold text-[#e30613] hover:text-[#b80010] uppercase tracking-wider mb-1"
    >
      {catLabel}
    </Link>
  )

  // Metadata snippet
  const MetaRow = () => (
    <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-2 font-bengali">
      <span className="flex items-center gap-1 hover:text-gray-700 transition-colors" title={fullDateTooltip}>
        <Clock size={11} className="text-gray-400" />
        <span>{timeStr}</span>
      </span>
      <span
        className="flex items-center gap-1 hover:text-gray-700 transition-colors"
        title={lang === 'bn' ? `${toBengaliNumber(viewsCount)} বার পড়া হয়েছে` : `${viewsCount} views`}
      >
        <Eye size={11} className="text-gray-400" />
        <span>{viewsStr}</span>
      </span>
    </div>
  )

  /* ================= 1. HERO LEAD STORY ================= */
  if (variant === 'hero') {
    return (
      <article className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col font-bengali">
        <Link to={targetUrl} className="block relative overflow-hidden aspect-[16/9] max-h-[460px] bg-gray-100">
          <img
            src={article.image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="eager"
          />
          <div className="absolute top-3 left-3 bg-[#e30613] text-white text-xs font-bold px-2.5 py-1 rounded shadow">
            {catLabel}
          </div>
        </Link>
        <div className="p-5 flex flex-col justify-between flex-1">
          <div>
            <Link to={targetUrl}>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a] group-hover:text-[#e30613] transition-colors leading-tight mb-2.5">
                {title}
              </h1>
            </Link>
            {summary && (
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed line-clamp-3">
                {summary}
              </p>
            )}
          </div>
          <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span className="font-semibold text-gray-700">
              {lang === 'bn' ? article.author_bn || article.author : article.author_en || article.author}
            </span>
            <MetaRow />
          </div>
        </div>
      </article>
    )
  }

  /* ================= 2. GRID 3-COLUMN CARD ================= */
  if (variant === 'grid') {
    return (
      <article className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group flex flex-col font-bengali h-full">
        <Link to={targetUrl} className="block relative overflow-hidden aspect-[16/10] bg-gray-100">
          <img
            src={article.image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>
        <div className="p-3.5 flex flex-col justify-between flex-1">
          <div>
            <CategoryTag />
            <Link to={targetUrl}>
              <h2 className="text-[16px] font-bold text-[#1a1a1a] group-hover:text-[#e30613] transition-colors leading-snug line-clamp-2 mb-1.5">
                {title}
              </h2>
            </Link>
            {summary && (
              <p className="text-gray-500 text-xs leading-normal line-clamp-2">
                {summary}
              </p>
            )}
          </div>
          <MetaRow />
        </div>
      </article>
    )
  }

  /* ================= 3. HORIZONTAL LIST CARD ================= */
  if (variant === 'list') {
    return (
      <article className="bg-white rounded p-3 border border-gray-200 hover:border-red-200 hover:shadow-sm transition-all group font-bengali flex gap-3.5 items-start">
        <Link to={targetUrl} className="flex-shrink-0 w-28 sm:w-36 aspect-[16/10] rounded overflow-hidden bg-gray-100 relative">
          <img
            src={article.image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <CategoryTag />
          <Link to={targetUrl}>
            <h3 className="text-sm sm:text-base font-bold text-[#1a1a1a] group-hover:text-[#e30613] transition-colors leading-snug line-clamp-2 mb-1">
              {title}
            </h3>
          </Link>
          <MetaRow />
        </div>
      </article>
    )
  }

  /* ================= 4. TEXT ONLY (MINIMAL DIVIDER) ================= */
  if (variant === 'text') {
    return (
      <article className="py-2.5 border-b border-gray-100 last:border-b-0 group font-bengali">
        <CategoryTag />
        <Link to={targetUrl}>
          <h4 className="text-sm font-bold text-[#1a1a1a] group-hover:text-[#e30613] transition-colors leading-snug line-clamp-2">
            {title}
          </h4>
        </Link>
        <MetaRow />
      </article>
    )
  }

  /* ================= 5. SIDEBAR NUMBERED RANK CARD ================= */
  if (variant === 'sidebar') {
    const displayRank = lang === 'bn' ? toBengaliNumber(rank) : rank
    return (
      <article className="py-3 border-b border-gray-100 last:border-b-0 flex gap-3 items-start group font-bengali">
        <span
          className="text-2xl font-black text-[#e30613] leading-none w-6 flex-shrink-0 text-center select-none"
          style={{ fontFamily: 'Impact, sans-serif' }}
        >
          {displayRank}
        </span>
        <div className="flex-1 min-w-0">
          <Link to={targetUrl}>
            <h4 className="text-[13px] font-bold text-[#1a1a1a] group-hover:text-[#e30613] transition-colors leading-snug line-clamp-2">
              {title}
            </h4>
          </Link>
          <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-2.5">
            <span className="flex items-center gap-1" title={fullDateTooltip}>
              <Clock size={10} className="text-gray-400" />
              <span>{timeStr}</span>
            </span>
            <span
              className="flex items-center gap-1"
              title={lang === 'bn' ? `${toBengaliNumber(viewsCount)} বার পড়া হয়েছে` : `${viewsCount} views`}
            >
              <Eye size={10} className="text-gray-400" />
              <span>{viewsStr}</span>
            </span>
          </div>
        </div>
        {article.image && (
          <Link to={targetUrl} className="w-14 h-12 flex-shrink-0 rounded overflow-hidden bg-gray-100">
            <img src={article.image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          </Link>
        )}
      </article>
    )
  }

  return null
}
