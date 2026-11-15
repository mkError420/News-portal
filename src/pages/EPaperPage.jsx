import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Home, ChevronRight, FileText, ChevronLeft, ZoomIn, ZoomOut, Download, Calendar } from 'lucide-react'
import SEO from '../components/SEO.jsx'
import { formatBengaliDate, formatEnglishDate, toBengaliNumber } from '../utils.js'

export default function EPaperPage({ lang = 'bn', settings = null }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [zoomLevel, setZoomLevel] = useState(1)
  const totalPages = 12

  const siteName = (lang === 'bn' ? settings?.site_name_bn : settings?.site_name_en) ||
    (lang === 'bn' ? 'আলোর পথে' : 'Prothom kalo')

  const pages = [
    { page: 1, title: '১ম পাতা - প্রধান শিরোনাম', en: 'Page 1 - Front Page', img: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80' },
    { page: 2, title: '২য় পাতা - রাজধানী', en: 'Page 2 - Capital', img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80' },
    { page: 3, title: '৩য় পাতা - সারাদেশ', en: 'Page 3 - National', img: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80' },
    { page: 4, title: '৪র্থ পাতা - সম্পাদকীয়', en: 'Page 4 - Editorial', img: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80' },
    { page: 5, title: '৫ম পাতা - বাণিজ্য', en: 'Page 5 - Business', img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80' },
    { page: 6, title: '৬ষ্ঠ পাতা - খেলাধুলা', en: 'Page 6 - Sports', img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80' },
  ]

  const active = pages.find((p) => p.page === currentPage) || pages[0]

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-bengali">
      <SEO
        title={lang === 'bn' ? 'অনলাইন ই-পেপার সংস্করণ' : 'Online ePaper Edition'}
        description={lang === 'bn' ? `${siteName}-এর ছাপা পত্রিকার ডিজিটাল পাতা ব্রাউজ ও পড়ুন` : 'Browse and read digital pages of the daily newspaper'}
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
        <span className="font-bold text-[#e30613]">{lang === 'bn' ? 'ই-পেপার সংস্করণ' : 'ePaper Edition'}</span>
      </nav>

      {/* Control Bar */}
      <div className="bg-[#1a3a5c] text-white p-4 rounded-t-lg shadow flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-bold text-sm">
          <FileText size={18} className="text-red-400" />
          <span>{lang === 'bn' ? `${siteName} ই-পেপার` : `${siteName} ePaper`}</span>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-normal">
            {lang === 'bn' ? formatBengaliDate(new Date()) : formatEnglishDate(new Date())}
          </span>
        </div>

        {/* Page Switcher */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-40 rounded"
          >
            <ChevronLeft size={16} />
          </button>
          <span>
            {lang === 'bn'
              ? `পাতা ${toBengaliNumber(currentPage)} / ${toBengaliNumber(pages.length)}`
              : `Page ${currentPage} of ${pages.length}`}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(pages.length, currentPage + 1))}
            disabled={currentPage === pages.length}
            className="p-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-40 rounded"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel(Math.max(0.8, zoomLevel - 0.2))}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="text-xs font-semibold px-2 py-1 bg-white/10 hover:bg-white/20 rounded"
          >
            100%
          </button>
          <button
            onClick={() => setZoomLevel(Math.min(1.6, zoomLevel + 0.2))}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      {/* ePaper Viewer Area */}
      <div className="bg-[#2a2a2a] p-4 sm:p-8 flex justify-center overflow-auto rounded-b-lg border border-gray-700 min-h-[600px]">
        <div
          className="bg-white shadow-2xl transition-transform duration-200 origin-top rounded overflow-hidden max-w-4xl w-full"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Replica Header */}
          <div className="border-b-4 border-black p-4 text-center bg-amber-50/20">
            <h1 className="text-4xl sm:text-6xl font-black text-[#e30613] tracking-tight">
              {siteName}
            </h1>
            <div className="flex justify-between items-center text-xs text-gray-700 font-bold border-t border-b border-gray-300 py-1 mt-2">
              <span>{lang === 'bn' ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh'}</span>
              <span>{lang === 'bn' ? active.title : active.en}</span>
              <span>{lang === 'bn' ? 'মূল্য: ৳ ১২.০০' : 'Price: BDT 12.00'}</span>
            </div>
          </div>

          {/* Page Image */}
          <div className="p-4">
            <img src={active.img} alt={active.title} className="w-full object-cover rounded shadow" />
            <div className="mt-4 p-4 bg-gray-50 rounded border text-xs text-gray-700 leading-relaxed">
              <h3 className="font-bold text-sm text-gray-900 mb-2">
                {lang === 'bn' ? 'ই-পেপার নির্দেশিকা' : 'ePaper Navigation'}
              </h3>
              <p>
                {lang === 'bn'
                  ? 'কাগজের পত্রিকার হুবহু ডিজিটাল সংস্করণ। পাতায় ক্লিক করে বড় আকারে পড়া যাবে। পরবর্তী পাতায় যেতে উপরের তীর চিহ্ন ব্যবহার করুন।'
                  : 'Digital replica of the print daily newspaper. Use the controls above to zoom, browse pages, or switch sections.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Page Thumbnails Bar */}
      <div
        className="mt-6 flex gap-3 overflow-x-auto pb-4 scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {pages.map((p) => (
          <div
            key={p.page}
            onClick={() => setCurrentPage(p.page)}
            className={`flex-shrink-0 w-28 cursor-pointer rounded overflow-hidden border-2 transition-all ${
              currentPage === p.page ? 'border-red-600 shadow-md scale-105' : 'border-gray-200 opacity-70 hover:opacity-100'
            }`}
          >
            <img src={p.img} alt={p.title} className="w-full h-20 object-cover" />
            <div className="p-1 bg-white text-[10px] text-center font-bold text-gray-800 truncate">
              {lang === 'bn' ? p.title : p.en}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

