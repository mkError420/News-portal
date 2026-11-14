import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Home, ChevronRight, PlayCircle, Eye, Clock, X } from 'lucide-react'
import SEO from '../components/SEO.jsx'
import { formatRelativeTime, formatViews } from '../utils.js'

export default function VideoPage({ videos = [], settings = null, lang = 'bn' }) {
  const [activeVideo, setActiveVideo] = useState(videos[0] || null)
  const [isPlayingModal, setIsPlayingModal] = useState(false)

  const siteName = (lang === 'bn' ? settings?.site_name_bn : settings?.site_name_en) ||
    (lang === 'bn' ? 'প্রথম কালো' : 'Prothom kalo')

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-bengali">
      <SEO
        title={lang === 'bn' ? 'ভিডিও সংবাদ ও বিশেষ প্রতিবেদন' : 'Video News & Reports'}
        description={lang === 'bn' ? `${siteName}-এর বিশেষ ভিডিও প্রতিবেদন ও সরাসরি বিশ্লেষণ` : 'Video reports and special coverages'}
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
        <span className="font-bold text-[#e30613]">{lang === 'bn' ? 'ভিডিও সংবাদ' : 'Video News'}</span>
      </nav>

      {/* Featured Big Video Player */}
      {activeVideo && (
        <div className="bg-black rounded-xl overflow-hidden shadow-xl mb-10 text-white border border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Player Area (8 cols) */}
            <div className="lg:col-span-8 aspect-[16/9] bg-black">
              <iframe
                src={`${activeVideo.videoUrl}?autoplay=0`}
                title={activeVideo.title_bn}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {/* Video Meta Info (4 cols) */}
            <div className="lg:col-span-4 p-6 flex flex-col justify-between bg-[#111]">
              <div>
                <span className="inline-block bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-3">
                  {lang === 'bn' ? 'বিশেষ ভিডিও' : 'Featured Video'}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold leading-tight mb-3">
                  {lang === 'bn' ? activeVideo.title_bn : activeVideo.title_en}
                </h2>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock size={13} />
                    <span>{formatRelativeTime(activeVideo.date, lang)}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={13} />
                    <span>{formatViews(activeVideo.views, lang)} {lang === 'bn' ? 'ভিউ' : 'views'}</span>
                  </span>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-800 text-xs text-gray-400">
                {lang === 'bn' ? `${siteName} মাল্টিমিডিয়া ডেস্ক` : `${siteName} Multimedia Desk`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Videos Grid */}
      <div className="mb-6">
        <h3 className="text-xl font-extrabold text-[#1a1a1a] border-b-2 border-red-600 pb-2 mb-6">
          {lang === 'bn' ? 'সকল ভিডিও প্রতিবেদন' : 'All Video Reports'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {videos.map((v) => (
            <div
              key={v.id}
              onClick={() => {
                setActiveVideo(v)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="bg-white rounded overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col"
            >
              <div className="relative aspect-[16/9] bg-black overflow-hidden">
                <img
                  src={v.thumb}
                  alt={v.title_bn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform opacity-90"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    ▶
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 bg-black/85 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
                  {v.duration}
                </span>
              </div>
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <h4 className="font-bold text-sm text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug mb-2">
                  {lang === 'bn' ? v.title_bn : v.title_en}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                  <span>{formatRelativeTime(v.date, lang)}</span>
                  <span>{formatViews(v.views, lang)} {lang === 'bn' ? 'ভিউ' : 'views'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

