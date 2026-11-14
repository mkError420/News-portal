import { Link } from 'react-router-dom'

export default function ProthomAloLogo({ lang = 'bn', size = 'default' }) {
  const isSmall = size === 'small'

  return (
    <Link to="/" className="inline-flex items-center gap-2.5 group select-none">
      {/* Authentic Prothom Alo Red Circular Sun/Flame Emblem */}
      <div className={`relative flex-shrink-0 ${isSmall ? 'w-8 h-8' : 'w-10 h-10 sm:w-11 sm:h-11'}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm group-hover:scale-105 transition-transform duration-300">
          {/* Red background disc */}
          <circle cx="50" cy="50" r="48" fill="#e30613" />
          {/* Inner white glow ring */}
          <circle cx="50" cy="50" r="32" fill="#ffffff" />
          {/* Inner red core */}
          <circle cx="50" cy="50" r="20" fill="#e30613" />
          {/* Sun center radiant white dot */}
          <circle cx="50" cy="50" r="9" fill="#ffffff" />
          {/* Stylized flame ray arc */}
          <path
            d="M 50 14 Q 58 26 50 36 Q 42 26 50 14 Z"
            fill="#ffffff"
            opacity="0.9"
          />
        </svg>
      </div>

      {/* Typography Calligraphy */}
      <div className="flex flex-col">
        <span
          className="font-extrabold tracking-tight leading-none text-[#e30613] group-hover:text-[#b80010] transition-colors"
          style={{
            fontSize: isSmall ? '1.5rem' : 'clamp(1.9rem, 3.5vw, 2.5rem)',
            fontFamily: "'Shurjo', 'Anek Bangla', 'SolaimanLipi', 'Noto Serif Bengali', serif",
            letterSpacing: '-0.02em',
          }}
        >
          {lang === 'bn' ? 'প্রথম আলো' : 'Prothom Alo'}
        </span>
        {!isSmall && (
          <span className="text-[10px] sm:text-[11px] font-medium text-gray-500 tracking-wider mt-0.5">
            {lang === 'bn' ? 'অনলাইন সংস্করণ • সত্যের সন্ধানে নির্ভীক' : 'Online Edition • Fearless in Pursuit of Truth'}
          </span>
        )}
      </div>
    </Link>
  )
}
