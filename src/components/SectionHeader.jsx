import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export default function SectionHeader({
  title_bn,
  title_en,
  lang = 'bn',
  link,
  subcategories = [],
  className = '',
}) {
  const title = lang === 'bn' ? title_bn : title_en

  return (
    <div className={`flex items-center justify-between border-b-2 border-[#e30613] pb-1.5 mb-4 font-bengali ${className}`}>
      {/* Title with Red Accent Marker */}
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-5 bg-[#e30613] rounded-sm inline-block"></span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#1a1a1a] tracking-tight">
          {title}
        </h2>
      </div>

      {/* Subcategory Pills or "See more" Link */}
      <div className="flex items-center gap-3">
        {subcategories.length > 0 && (
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-gray-500">
            {subcategories.map((sub, i) => (
              <span key={i} className="hover:text-red-600 cursor-pointer">
                {lang === 'bn' ? sub.bn : sub.en}
                {i < subcategories.length - 1 && <span className="ml-2 text-gray-300">/</span>}
              </span>
            ))}
          </div>
        )}

        {link && (
          <Link
            to={link}
            className="flex items-center gap-0.5 text-xs font-bold text-[#e30613] hover:text-[#b80010] transition-colors"
          >
            <span>{lang === 'bn' ? 'আরও দেখুন' : 'See More'}</span>
            <ChevronRight size={14} />
          </Link>
        )}
      </div>
    </div>
  )
}
