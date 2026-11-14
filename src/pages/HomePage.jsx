import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, PlayCircle, TrendingUp, Vote, CheckCircle2, DollarSign, CloudSun } from 'lucide-react'
import NewsCard from '../components/NewsCard.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import AdBanner from '../components/AdBanner.jsx'
import { CATEGORIES_BN, CATEGORIES_EN, toBengaliNumber } from '../utils.js'

export default function HomePage({ articles = [], opinions = [], photos = [], videos = [], lang = 'bn' }) {
  // Poll state
  const [pollVoted, setPollVoted] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  // Media modals
  const [activePhoto, setActivePhoto] = useState(null)
  const [activeVideo, setActiveVideo] = useState(null)

  // Segregate articles
  const leadArticle = articles.find((a) => a.featured) || articles[0]
  const otherLeadArticles = articles.filter((a) => a.id !== leadArticle?.id).slice(0, 2)
  const topStories = articles.slice(3, 9)

  // By category
  const nationalArticles = articles.filter((a) => a.category === 'national' || a.category === 'National')
  const politicsArticles = articles.filter((a) => a.category === 'politics' || a.category === 'Politics')
  const sportsArticles = articles.filter((a) => a.category === 'sports' || a.category === 'Sports')
  const economyArticles = articles.filter((a) => a.category === 'economy' || a.category === 'Economy')
  const entertainmentArticles = articles.filter((a) => a.category === 'entertainment' || a.category === 'Entertainment')
  const techArticles = articles.filter((a) => a.category === 'technology' || a.category === 'Technology')

  // Most Read sorted by views
  const mostRead = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5)

  const handleVote = (e) => {
    e.preventDefault()
    if (selectedOption !== null) {
      setPollVoted(true)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-bengali">
      {/* ================= 1. HERO TOP SECTION ================= */}
      <section className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Big Lead Story (7 cols) */}
          <div className="lg:col-span-7">
            {leadArticle && <NewsCard article={leadArticle} variant="hero" lang={lang} />}
          </div>

          {/* Secondary Top Stories (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
            {otherLeadArticles.map((art) => (
              <NewsCard key={art.id} article={art} variant="list" lang={lang} />
            ))}
            {/* Quick in-feed banner */}
            <div className="mt-2">
              <AdBanner size="infeed" lang={lang} />
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. THREE-COLUMN TOP STORIES ================= */}
      <section className="mb-10">
        <SectionHeader
          title_bn="আজকের নির্বাচিত সংবাদ"
          title_en="Today's Selected Stories"
          lang={lang}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {topStories.map((art) => (
            <NewsCard key={art.id} article={art} variant="grid" lang={lang} />
          ))}
        </div>
      </section>

      {/* Leaderboard Mid Ad */}
      <div className="my-8">
        <AdBanner size="leaderboard" lang={lang} />
      </div>

      {/* ================= 3. MAIN CONTENT (8 cols) + SIDEBAR (4 cols) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT / CENTER CONTENT AREA (8 cols) */}
        <div className="lg:col-span-8 space-y-10">
          {/* Section: বাংলাদেশ (National) */}
          <section>
            <SectionHeader
              title_bn="বাংলাদেশ"
              title_en="Bangladesh"
              lang={lang}
              link="/category/national"
              subcategories={[
                { bn: 'সারাদেশ', en: 'Nationwide' },
                { bn: 'রাজধানী', en: 'Capital' },
                { bn: 'প্রশাসন', en: 'Governance' },
              ]}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {nationalArticles[0] && (
                <NewsCard article={nationalArticles[0]} variant="grid" lang={lang} />
              )}
              <div className="space-y-1 divide-y divide-gray-100 bg-white p-3 rounded border border-gray-200">
                {nationalArticles.slice(1, 5).map((art) => (
                  <NewsCard key={art.id} article={art} variant="text" lang={lang} />
                ))}
              </div>
            </div>
          </section>

          {/* Section: রাজনীতি (Politics) */}
          <section>
            <SectionHeader
              title_bn="রাজনীতি"
              title_en="Politics"
              lang={lang}
              link="/category/politics"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {politicsArticles.slice(0, 2).map((art) => (
                <NewsCard key={art.id} article={art} variant="grid" lang={lang} />
              ))}
            </div>
          </section>

          {/* Section: খেলা (Sports) */}
          <section>
            <SectionHeader
              title_bn="খেলাধুলা"
              title_en="Sports"
              lang={lang}
              link="/category/sports"
              subcategories={[
                { bn: 'ক্রিকেট', en: 'Cricket' },
                { bn: 'ফুটবল', en: 'Football' },
              ]}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sportsArticles.slice(0, 3).map((art) => (
                <NewsCard key={art.id} article={art} variant="grid" lang={lang} />
              ))}
            </div>
          </section>

          {/* Section: অর্থনীতি ও বাণিজ্য (Economy) */}
          <section>
            <SectionHeader
              title_bn="অর্থনীতি ও ব্যবসা"
              title_en="Economy & Business"
              lang={lang}
              link="/category/economy"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {economyArticles.slice(0, 2).map((art) => (
                <NewsCard key={art.id} article={art} variant="list" lang={lang} />
              ))}
            </div>
          </section>

          {/* Section: বিনোদন (Entertainment) */}
          <section>
            <SectionHeader
              title_bn="বিনোদন"
              title_en="Entertainment"
              lang={lang}
              link="/category/entertainment"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {entertainmentArticles.slice(0, 2).map((art) => (
                <NewsCard key={art.id} article={art} variant="grid" lang={lang} />
              ))}
            </div>
          </section>

          {/* Section: প্রযুক্তি (Technology) */}
          <section>
            <SectionHeader
              title_bn="বিজ্ঞান ও প্রযুক্তি"
              title_en="Science & Technology"
              lang={lang}
              link="/category/technology"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {techArticles.slice(0, 2).map((art) => (
                <NewsCard key={art.id} article={art} variant="list" lang={lang} />
              ))}
            </div>
          </section>

          {/* Section: মতামত ও কলাম (Opinion Columnists) */}
          <section className="bg-white p-5 rounded border border-gray-200 shadow-sm">
            <SectionHeader
              title_bn="মতামত ও সম্পাদকীয়"
              title_en="Opinion & Editorials"
              lang={lang}
              link="/opinion"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {opinions.map((op) => (
                <div key={op.id} className="flex flex-col items-center text-center p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                  <img
                    src={op.author_image}
                    alt={op.author_bn}
                    className="w-16 h-16 rounded-full object-cover border-2 border-red-500 shadow mb-3"
                  />
                  <h4 className="font-bold text-sm text-gray-900 leading-snug hover:text-red-600 transition-colors line-clamp-2">
                    <Link to={`/opinion#${op.slug}`}>
                      {lang === 'bn' ? op.title_bn : op.title_en}
                    </Link>
                  </h4>
                  <span className="text-xs font-semibold text-red-600 mt-1">
                    {lang === 'bn' ? op.author_bn : op.author_en}
                  </span>
                  <span className="text-[11px] text-gray-500 line-clamp-1">
                    {lang === 'bn' ? op.author_role_bn : op.author_role_en}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT SIDEBAR (4 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Widget 1: সর্বাধিক পঠিত (Most Read) */}
          <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 border-b-2 border-[#e30613] pb-2 mb-3">
              <TrendingUp size={18} className="text-[#e30613]" />
              <h3 className="font-extrabold text-lg text-gray-900">
                {lang === 'bn' ? 'সর্বাধিক পঠিত' : 'Most Read'}
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {mostRead.map((art, idx) => (
                <NewsCard key={art.id} article={art} variant="sidebar" lang={lang} rank={idx + 1} />
              ))}
            </div>
          </div>

          {/* Widget 2: Medium Rectangle Ad (300x250) */}
          <AdBanner size="rectangle" lang={lang} />

          {/* Widget 3: আবহাওয়া ও মুদ্রা বিনিময় হার (Weather & Currency) */}
          <div className="bg-white p-4 rounded border border-gray-200 shadow-sm text-xs">
            <h4 className="font-bold text-sm text-gray-900 border-b pb-2 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CloudSun size={16} className="text-orange-500" />
                {lang === 'bn' ? 'আজকের তথ্য' : 'Daily Info'}
              </span>
              <span className="text-gray-400 font-normal">ঢাকা</span>
            </h4>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span className="text-gray-600">{lang === 'bn' ? 'আবহাওয়া:' : 'Weather:'}</span>
                <span className="font-bold text-gray-900">{lang === 'bn' ? '২৭° সে. (রৌদ্রোজ্জ্বল)' : '27°C (Sunny)'}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span className="text-gray-600">{lang === 'bn' ? '১ মার্কিন ডলার:' : '1 USD:'}</span>
                <span className="font-bold text-red-600">৳ ১২১.৫০</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span className="text-gray-600">{lang === 'bn' ? '১ ইউরো:' : '1 EUR:'}</span>
                <span className="font-bold text-blue-700">৳ ১৩১.২০</span>
              </div>
            </div>
          </div>

          {/* Widget 4: পাঠক জরিপ / Opinion Poll */}
          <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
            <div className="flex items-center gap-1.5 border-b pb-2 mb-3 text-red-600">
              <Vote size={18} />
              <h4 className="font-bold text-sm text-gray-900">
                {lang === 'bn' ? 'পাঠক জরিপ' : 'Reader Poll'}
              </h4>
            </div>
            <p className="text-xs font-semibold text-gray-800 leading-relaxed mb-3">
              {lang === 'bn'
                ? 'আপনি কি মনে করেন এআই নিয়ন্ত্রিত ট্র্যাফিক সিগন্যাল ঢাকায় যানজট নিরসনে ফলপ্রসূ হবে?'
                : 'Do you believe AI-driven adaptive traffic signals will solve congestion in Dhaka?'}
            </p>

            {!pollVoted ? (
              <form onSubmit={handleVote} className="space-y-2 text-xs">
                {['হ্যাঁ', 'না', 'মন্তব্য নেই'].map((opt, i) => {
                  const optEn = ['Yes', 'No', 'No Opinion'][i]
                  return (
                    <label key={i} className="flex items-center gap-2 p-2 rounded border border-gray-100 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="poll"
                        value={i}
                        checked={selectedOption === i}
                        onChange={() => setSelectedOption(i)}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span>{lang === 'bn' ? opt : optEn}</span>
                    </label>
                  )
                })}
                <button
                  type="submit"
                  disabled={selectedOption === null}
                  className="w-full mt-2 bg-[#e30613] disabled:opacity-50 text-white font-bold py-1.5 rounded transition-colors text-xs"
                >
                  {lang === 'bn' ? 'ভোট দিন' : 'Vote'}
                </button>
              </form>
            ) : (
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-green-50 text-green-800 rounded font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={15} />
                  <span>{lang === 'bn' ? 'আপনার মতামত গৃহীত হয়েছে!' : 'Thank you for voting!'}</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span>{lang === 'bn' ? 'হ্যাঁ' : 'Yes'}</span>
                      <span className="font-bold">৭৬%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-green-600 h-full w-[76%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span>{lang === 'bn' ? 'না' : 'No'}</span>
                      <span className="font-bold">১৮%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-red-600 h-full w-[18%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span>{lang === 'bn' ? 'মন্তব্য নেই' : 'No opinion'}</span>
                      <span className="font-bold">৬%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-gray-400 h-full w-[6%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Widget 5: Half Page Ad (300x600) */}
          <AdBanner size="halfpage" lang={lang} />
        </aside>
      </div>

      {/* ================= 4. MULTIMEDIA ROW: PHOTOS & VIDEOS ================= */}
      <section className="mt-12 pt-8 border-t-2 border-gray-300">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Photo Gallery Block */}
          <div className="bg-white p-5 rounded border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between border-b-2 border-[#e30613] pb-2 mb-4">
              <div className="flex items-center gap-2">
                <Camera size={20} className="text-[#e30613]" />
                <h3 className="font-extrabold text-xl text-gray-900">
                  {lang === 'bn' ? 'আলোকচিত্র' : 'Photo Gallery'}
                </h3>
              </div>
              <Link to="/photos" className="text-xs font-bold text-red-600 hover:underline">
                {lang === 'bn' ? 'সব ছবি →' : 'All Photos →'}
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.slice(0, 6).map((ph) => (
                <div
                  key={ph.id}
                  onClick={() => setActivePhoto(ph)}
                  className="aspect-[4/3] rounded overflow-hidden relative group cursor-pointer bg-gray-100"
                >
                  <img
                    src={ph.image}
                    alt={ph.title_bn}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <p className="text-[11px] text-white font-semibold line-clamp-1">
                      {lang === 'bn' ? ph.title_bn : ph.title_en}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video News Block */}
          <div className="bg-white p-5 rounded border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between border-b-2 border-[#e30613] pb-2 mb-4">
              <div className="flex items-center gap-2">
                <PlayCircle size={20} className="text-[#e30613]" />
                <h3 className="font-extrabold text-xl text-gray-900">
                  {lang === 'bn' ? 'ভিডিও সংবাদ' : 'Video News'}
                </h3>
              </div>
              <Link to="/video" className="text-xs font-bold text-red-600 hover:underline">
                {lang === 'bn' ? 'সব ভিডিও →' : 'All Videos →'}
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videos.slice(0, 4).map((v) => (
                <div
                  key={v.id}
                  onClick={() => setActiveVideo(v)}
                  className="group cursor-pointer bg-gray-50 rounded overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
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
                    <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {v.duration}
                    </span>
                  </div>
                  <div className="p-2.5">
                    <h4 className="text-xs font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2">
                      {lang === 'bn' ? v.title_bn : v.title_en}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PHOTO PREVIEW MODAL */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setActivePhoto(null)}
        >
          <div className="max-w-4xl w-full bg-black rounded-lg overflow-hidden border border-gray-800 text-white" onClick={(e) => e.stopPropagation()}>
            <img src={activePhoto.image} alt={activePhoto.title_bn} className="w-full max-h-[70vh] object-contain" />
            <div className="p-4 bg-gray-900 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">{lang === 'bn' ? activePhoto.title_bn : activePhoto.title_en}</h3>
                <p className="text-xs text-gray-400 mt-1">{lang === 'bn' ? activePhoto.credit_bn : activePhoto.credit_en}</p>
              </div>
              <button onClick={() => setActivePhoto(null)} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs">
                {lang === 'bn' ? 'বন্ধ করুন ✕' : 'Close ✕'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO PLAYER MODAL */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setActiveVideo(null)}
        >
          <div className="max-w-3xl w-full bg-black rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-[16/9] w-full">
              <iframe
                src={`${activeVideo.videoUrl}?autoplay=1`}
                title={activeVideo.title_bn}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-3 bg-gray-900 text-white flex justify-between items-center">
              <span className="font-bold text-sm line-clamp-1">{lang === 'bn' ? activeVideo.title_bn : activeVideo.title_en}</span>
              <button onClick={() => setActiveVideo(null)} className="text-xs text-gray-400 hover:text-white px-2 py-1">
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

