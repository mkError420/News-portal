import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Home, ChevronRight, PenTool, MessageSquare, Quote } from 'lucide-react'
import SectionHeader from '../components/SectionHeader.jsx'
import AdBanner from '../components/AdBanner.jsx'
import SEO from '../components/SEO.jsx'
import { formatBengaliDate, formatEnglishDate } from '../utils.js'

export default function OpinionPage({ opinions = [], settings = null, lang = 'bn' }) {
  const [activeOpinion, setActiveOpinion] = useState(opinions[0])

  const siteName = (lang === 'bn' ? settings?.site_name_bn : settings?.site_name_en) ||
    (lang === 'bn' ? 'প্রথম আলো' : 'Prothom Alo')

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-bengali">
      <SEO
        title={lang === 'bn' ? 'মতামত, কলাম ও সম্পাদকীয়' : 'Opinion & Editorial'}
        description={lang === 'bn' ? 'সমাজ, রাষ্ট্র, অর্থনীতি ও আন্তর্জাতিক রাজনীতির নানা বিষয়ে বিশিষ্ট চিন্তাবিদদের গভীর বিশ্লেষণ।' : 'In-depth perspectives and critical analyses by distinguished writers.'}
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
        <span className="font-bold text-[#e30613]">{lang === 'bn' ? 'মতামত ও সম্পাদকীয়' : 'Opinion & Columns'}</span>
      </nav>

      {/* Hero Banner */}
      <div className="bg-[#1a3a5c] text-white p-6 rounded-lg shadow mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2">
            <PenTool size={24} className="text-red-400" />
            <span>{lang === 'bn' ? 'মতামত, কলাম ও সম্পাদকীয়' : 'Opinions, Columns & Editorials'}</span>
          </h1>
          <p className="text-xs text-gray-300 mt-1 max-w-xl leading-relaxed">
            {lang === 'bn'
              ? 'সমাজ, রাষ্ট্র, অর্থনীতি ও আন্তর্জাতিক রাজনীতির নানা বিষয়ে বিশিষ্ট চিন্তাবিদদের গভীর বিশ্লেষণ।'
              : 'In-depth perspectives and critical analyses on politics, economy, and society by distinguished thinkers.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Column (8 cols): Featured Read & All Opinions */}
        <div className="lg:col-span-8 space-y-8">
          {/* Active Featured Columnist Article */}
          {activeOpinion && (
            <div className="bg-white p-6 sm:p-8 rounded border border-gray-200 shadow-sm">
              <div className="flex items-center gap-4 mb-5 pb-4 border-b border-gray-100">
                <img
                  src={activeOpinion.author_image}
                  alt={activeOpinion.author_bn}
                  className="w-20 h-20 rounded-full object-cover border-4 border-red-500 shadow"
                />
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {lang === 'bn' ? activeOpinion.author_bn : activeOpinion.author_en}
                  </h3>
                  <p className="text-xs font-semibold text-red-600">
                    {lang === 'bn' ? activeOpinion.author_role_bn : activeOpinion.author_role_en}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {lang === 'bn' ? formatBengaliDate(activeOpinion.date) : formatEnglishDate(activeOpinion.date)}
                  </p>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a] mb-4 leading-tight">
                {lang === 'bn' ? activeOpinion.title_bn : activeOpinion.title_en}
              </h2>

              <blockquote className="bg-red-50/70 border-l-4 border-red-600 p-4 my-4 rounded text-sm sm:text-base font-semibold text-gray-700 italic">
                "{lang === 'bn' ? activeOpinion.summary_bn : activeOpinion.summary_en}"
              </blockquote>

              <div
                className="news-prose text-sm sm:text-base text-gray-800 leading-loose space-y-4 pt-2"
                dangerouslySetInnerHTML={{
                  __html: lang === 'bn' ? activeOpinion.content_bn : activeOpinion.content_en,
                }}
              />
            </div>
          )}

          {/* List of Other Columnists */}
          <div>
            <SectionHeader
              title_bn="আরও কলাম ও মতামত"
              title_en="More Opinion Articles"
              lang={lang}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {opinions.map((op) => (
                <div
                  key={op.id}
                  onClick={() => setActiveOpinion(op)}
                  className={`p-4 rounded border cursor-pointer transition-all ${
                    activeOpinion?.id === op.id
                      ? 'border-red-500 bg-red-50/40 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <img src={op.author_image} alt={op.author_bn} className="w-10 h-10 rounded-full object-cover border" />
                    <div>
                      <h4 className="font-bold text-xs text-gray-900 leading-tight">
                        {lang === 'bn' ? op.author_bn : op.author_en}
                      </h4>
                      <p className="text-[10px] text-gray-500">{lang === 'bn' ? op.author_role_bn : op.author_role_en}</p>
                    </div>
                  </div>
                  <h3 className="font-bold text-sm text-[#1a1a1a] leading-snug line-clamp-2 hover:text-red-600 transition-colors">
                    {lang === 'bn' ? op.title_bn : op.title_en}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                    {lang === 'bn' ? op.summary_bn : op.summary_en}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar (4 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
            <h3 className="font-bold text-sm text-gray-900 border-b pb-2 mb-3">
              {lang === 'bn' ? 'সম্পাদকীয় নীতিমালা' : 'Editorial Guidelines'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {lang === 'bn'
                ? `${siteName}-এর সম্পাদকীয় পাতায় প্রকাশিত লেখকদের মতামত সম্পূর্ণ তাদের নিজস্ব। আমরা মতের বৈচিত্র্য ও মুক্তচিন্তাকে প্রাধান্য দিই।`
                : `Views expressed in ${siteName} opinion pieces belong solely to the authors. We champion constructive diversity of perspectives and free expression.`}
            </p>
          </div>
          <AdBanner size="rectangle" lang={lang} settings={settings} />
          <AdBanner size="halfpage" lang={lang} settings={settings} />
        </aside>
      </div>
    </div>
  )
}

