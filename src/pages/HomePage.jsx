import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Camera,
  PlayCircle,
  TrendingUp,
  Vote,
  CheckCircle2,
  CloudSun,
  Clock,
  Flame,
  Newspaper,
  DollarSign,
  Award,
} from 'lucide-react'
import NewsCard from '../components/NewsCard.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import AdBanner from '../components/AdBanner.jsx'
import SEO from '../components/SEO.jsx'
import CurrencyWidget from '../components/CurrencyWidget.jsx'
import PrayerTimesWidget from '../components/PrayerTimesWidget.jsx'
import ReaderPollWidget from '../components/ReaderPollWidget.jsx'
import { PRAYER_TIMES, CURRENCY_RATES, formatRelativeTime } from '../utils.js'

export default function HomePage({
  articles = [],
  opinions = [],
  photos = [],
  videos = [],
  categories = [],
  settings = null,
  lang = 'bn',
}) {
  // Sidebar tab state: 'latest' | 'mostRead'
  const [sidebarTab, setSidebarTab] = useState('latest')
  // Poll state
  const [pollVoted, setPollVoted] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  // Media modals
  const [activePhoto, setActivePhoto] = useState(null)
  const [activeVideo, setActiveVideo] = useState(null)

  // Segregate articles (sorted latest first)
  const sortedArticles = [...articles].sort(
    (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
  )
  const leadArticle = articles.find((a) => a.featured) || sortedArticles[0] || articles[0]
  const otherLeadArticles = sortedArticles.filter((a) => a.id !== leadArticle?.id).slice(0, 3)
  const leadIds = new Set([leadArticle?.id, ...otherLeadArticles.map((article) => article.id)])

  // Dynamic Last 20 News for "আজকের নির্বাচিত সংবাদ"
  const availableAfterHero = sortedArticles.filter((article) => !leadIds.has(article.id))
  const topStories = availableAfterHero.length >= 20
    ? availableAfterHero.slice(0, 20)
    : sortedArticles.filter((a) => a.id !== leadArticle?.id).slice(0, 20)

  // Categorized articles helper
  const getCatArticles = (slug) => {
    const s = (slug || '').toLowerCase().trim()
    return articles.filter((a) => {
      const c = (a.category || '').toLowerCase().trim()
      return c === s
    })
  }

  const nationalArticles = getCatArticles('national')
  const politicsArticles = getCatArticles('politics')
  const sportsArticles = getCatArticles('sports')
  const economyArticles = getCatArticles('economy')
  const entertainmentArticles = getCatArticles('entertainment')
  const techArticles = getCatArticles('technology')
  const internationalArticles = getCatArticles('international')
  const healthArticles = getCatArticles('health')
  const lifestyleArticles = getCatArticles('lifestyle')
  const educationArticles = getCatArticles('education')

  // Identify custom categories created dynamically in dashboard
  const standardSlugs = new Set([
    'national',
    'politics',
    'sports',
    'economy',
    'entertainment',
    'technology',
    'international',
    'health',
    'lifestyle',
    'education',
    'opinion',
    'photos',
    'video',
  ])
  const customCategorySections = (categories || []).filter((cat) => {
    const s = (cat.slug || '').toLowerCase().trim()
    return !standardSlugs.has(s) && articles.some((a) => (a.category || '').toLowerCase().trim() === s)
  })

  // Latest articles (sorted by date descending)
  const latestArticles = [...articles].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 5)
  // Most Read sorted by views
  const mostRead = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5)

  const handleVote = (e) => {
    e.preventDefault()
    if (selectedOption !== null) {
      setPollVoted(true)
    }
  }

  const siteName = (lang === 'bn' ? settings?.site_name_bn : settings?.site_name_en) ||
    (lang === 'bn' ? 'আলোর পথে' : 'Prothom kalo')
  const siteTagline = (lang === 'bn' ? settings?.tagline_bn : settings?.tagline_en) ||
    (lang === 'bn' ? 'অনলাইন সংস্করণ • সত্যের সন্ধানে নির্ভীক' : 'Online Edition • Fearless in Pursuit of Truth')
  const originUrl = typeof window !== 'undefined' ? window.location.origin : ''

  const sameAsLinks = [
    settings?.facebook_url,
    settings?.twitter_url,
    settings?.youtube_url,
    settings?.instagram_url,
    settings?.linkedin_url,
  ].filter(Boolean)

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: siteName,
    url: originUrl || '/',
    logo: {
      '@type': 'ImageObject',
      url: settings?.logo_url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
    },
    sameAs: sameAsLinks,
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: originUrl || '/',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${originUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-bengali">
      <SEO
        title=""
        description={lang === 'bn' ? settings?.about_bn : settings?.about_en}
        schema={[organizationSchema, websiteSchema]}
        lang={lang}
        settings={settings}
      />
      {/* ================= 1. HERO TOP SECTION (প্রধান শীর্ষ সংবাদ) ================= */}
      {articles.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center my-8 shadow-xs">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center text-[#e30613]">
            <Newspaper size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {lang === 'bn' ? 'ডাটাবেজে বর্তমানে কোনো সংবাদ পাওয়া যায়নি' : 'No articles published yet in the database'}
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            {lang === 'bn'
              ? 'অ্যাডমিন ড্যাশবোর্ড থেকে নতুন সংবাদ প্রকাশ করুন অথবা ডাটাবেজ সংযোগ চেক করুন।'
              : 'Publish news from the Admin Dashboard or check database connection.'}
          </p>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e30613] text-white rounded font-medium text-sm hover:bg-[#b80010] transition-colors"
          >
            <span>{lang === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ডে যান' : 'Go to Admin Dashboard'}</span>
          </Link>
        </div>
      ) : (
        <>
          <section className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Main Big Lead Story (7 cols) */}
              <div className="lg:col-span-7">
                {leadArticle && <NewsCard article={leadArticle} variant="hero" lang={lang} />}
              </div>

              {/* Secondary Top Stories (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-3 justify-between">
                {otherLeadArticles.map((art) => (
                  <NewsCard key={art.id} article={art} variant="list" lang={lang} />
                ))}
                {/* Quick in-feed banner */}
                <div className="mt-1">
                  <AdBanner size="infeed" lang={lang} settings={settings} />
                </div>
              </div>
            </div>
          </section>

          {/* ================= 2. FOUR-COLUMN CURATED HIGHLIGHTS (আজকের নির্বাচিত) ================= */}
          {topStories.length > 0 && (
            <section className="mb-8">
              <SectionHeader
                title_bn="আজকের নির্বাচিত সংবাদ"
                title_en="Today's Curated Stories"
                lang={lang}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {topStories.map((art) => (
                  <NewsCard key={art.id} article={art} variant="grid" lang={lang} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Leaderboard Mid Ad */}
      <div className="my-8">
        <AdBanner size="leaderboard" lang={lang} settings={settings} />
      </div>

      {/* ================= 3. MAIN CONTENT (8 cols) + SIDEBAR (4 cols) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT / CENTER CONTENT AREA (8 cols) */}
        <div className="lg:col-span-8 space-y-10">
          {/* Section: বাংলাদেশ (National) */}
          {nationalArticles.length > 0 && (
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
                  { bn: 'অপরাধ', en: 'Crime' },
                ]}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {nationalArticles[0] && (
                  <NewsCard article={nationalArticles[0]} variant="grid" lang={lang} />
                )}
                <div className="space-y-1 divide-y divide-gray-100 bg-white p-3.5 rounded border border-gray-200 shadow-2xs">
                  {nationalArticles.slice(1, 5).map((art) => (
                    <NewsCard key={art.id} article={art} variant="text" lang={lang} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Section: রাজনীতি (Politics) */}
          {politicsArticles.length > 0 && (
            <section>
              <SectionHeader
                title_bn="রাজনীতি"
                title_en="Politics"
                lang={lang}
                link="/category/politics"
                subcategories={[
                  { bn: 'সরকার', en: 'Government' },
                  { bn: 'নির্বাচন', en: 'Election' },
                  { bn: 'সংসদ', en: 'Parliament' },
                ]}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {politicsArticles.slice(0, 2).map((art) => (
                  <NewsCard key={art.id} article={art} variant="grid" lang={lang} />
                ))}
              </div>
            </section>
          )}

          {/* Section: খেলা (Sports) */}
          {sportsArticles.length > 0 && (
            <section>
              <SectionHeader
                title_bn="খেলাধুলা"
                title_en="Sports"
                lang={lang}
                link="/category/sports"
                subcategories={[
                  { bn: 'ক্রিকেট', en: 'Cricket' },
                  { bn: 'ফুটবল', en: 'Football' },
                  { bn: 'বিশ্বকাপ', en: 'World Cup' },
                ]}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sportsArticles.slice(0, 3).map((art) => (
                  <NewsCard key={art.id} article={art} variant="grid" lang={lang} />
                ))}
              </div>
            </section>
          )}

          {/* Section: অর্থনীতি ও বাণিজ্য (Economy) with Currency Rate Strip */}
          {economyArticles.length > 0 && (
            <section>
              <SectionHeader
                title_bn="অর্থনীতি ও ব্যবসা"
                title_en="Economy & Business"
                lang={lang}
                link="/category/economy"
                subcategories={[
                  { bn: 'ব্যাংক', en: 'Banking' },
                  { bn: 'শেয়ারবাজার', en: 'Stock Market' },
                  { bn: 'রপ্তানি', en: 'Exports' },
                ]}
              />

              {/* Live Auto-Changing Exchange Rates & Market Widget */}
              <CurrencyWidget lang={lang} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {economyArticles.slice(0, 2).map((art) => (
                  <NewsCard key={art.id} article={art} variant="list" lang={lang} />
                ))}
              </div>
            </section>
          )}

          {/* Section: আন্তর্জাতিক (World) */}
          {internationalArticles.length > 0 && (
            <section>
              <SectionHeader
                title_bn="আন্তর্জাতিক"
                title_en="International"
                lang={lang}
                link="/category/international"
                subcategories={[
                  { bn: 'এশিয়া', en: 'Asia' },
                  { bn: 'আমেরিকা', en: 'America' },
                  { bn: 'মধ্যপ্রাচ্য', en: 'Middle East' },
                ]}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {internationalArticles.slice(0, 2).map((art) => (
                  <NewsCard key={art.id} article={art} variant="list" lang={lang} />
                ))}
              </div>
            </section>
          )}

          {/* Section: বিনোদন (Entertainment) */}
          {entertainmentArticles.length > 0 && (
            <section>
              <SectionHeader
                title_bn="বিনোদন"
                title_en="Entertainment"
                lang={lang}
                link="/category/entertainment"
                subcategories={[
                  { bn: 'সিনেমা', en: 'Cinema' },
                  { bn: 'নাটক', en: 'Drama' },
                  { bn: 'ওটিটি', en: 'OTT' },
                ]}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {entertainmentArticles.slice(0, 2).map((art) => (
                  <NewsCard key={art.id} article={art} variant="grid" lang={lang} />
                ))}
              </div>
            </section>
          )}

          {/* Section: বিজ্ঞান ও প্রযুক্তি (Science & Tech) */}
          {techArticles.length > 0 && (
            <section>
              <SectionHeader
                title_bn="বিজ্ঞান ও প্রযুক্তি"
                title_en="Science & Technology"
                lang={lang}
                link="/category/technology"
                subcategories={[
                  { bn: 'কৃত্রিম বুদ্ধিমত্তা', en: 'AI' },
                  { bn: 'গ্যাজেট', en: 'Gadgets' },
                  { bn: 'ইন্টারনেট', en: 'Internet' },
                ]}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {techArticles.slice(0, 2).map((art) => (
                  <NewsCard key={art.id} article={art} variant="list" lang={lang} />
                ))}
              </div>
            </section>
          )}

          {/* Section: শিক্ষা ও চাকরি */}
          {educationArticles.length > 0 && (
            <section>
              <SectionHeader
                title_bn="শিক্ষা ও চাকরি"
                title_en="Education & Jobs"
                lang={lang}
                link="/category/education"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {educationArticles.slice(0, 2).map((art) => (
                  <NewsCard key={art.id} article={art} variant="list" lang={lang} />
                ))}
              </div>
            </section>
          )}

          {/* Section: স্বাস্থ্য ও জীবনযাপন */}
          {(lifestyleArticles.length > 0 || healthArticles.length > 0) && (
            <section>
              <SectionHeader
                title_bn="স্বাস্থ্য ও জীবনযাপন"
                title_en="Health & Lifestyle"
                lang={lang}
                link="/category/lifestyle"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...lifestyleArticles, ...healthArticles].slice(0, 4).map((art) => (
                  <NewsCard key={art.id} article={art} variant="list" lang={lang} />
                ))}
              </div>
            </section>
          )}

          {/* Section: মতামত ও সম্পাদকীয় (Opinion Columnists) */}
          {opinions.length > 0 && (
            <section className="bg-white p-5 rounded border border-gray-200 shadow-sm">
              <SectionHeader
                title_bn="মতামত ও সম্পাদকীয়"
                title_en="Opinion & Editorials"
                lang={lang}
                link="/opinion"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {opinions.map((op) => (
                  <div
                    key={op.id}
                    className="flex flex-col items-center text-center p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                  >
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
          )}

          {/* Dynamic Extra Custom Categories Created in Dashboard */}
          {customCategorySections.map((cat) => {
            const catArticles = getCatArticles(cat.slug)
            if (catArticles.length === 0) return null
            return (
              <section key={cat.slug}>
                <SectionHeader
                  title_bn={cat.name_bn || cat.name || cat.slug}
                  title_en={cat.name_en || cat.name || cat.slug}
                  lang={lang}
                  link={`/category/${cat.slug}`}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {catArticles.slice(0, 4).map((art) => (
                    <NewsCard key={art.id} article={art} variant="list" lang={lang} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>

        {/* ================= RIGHT SIDEBAR (4 cols) ================= */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Widget 1: Signature Prothom Alo Tabbed Widget [সর্বশেষ | সর্বাধিক পঠিত] */}
          <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-gray-200 text-sm font-bold">
              <button
                onClick={() => setSidebarTab('latest')}
                className={`flex-1 py-3 text-center transition-colors flex items-center justify-center gap-1.5 border-b-2 ${
                  sidebarTab === 'latest'
                    ? 'border-[#e30613] text-[#e30613] bg-red-50/40'
                    : 'border-transparent text-gray-600 hover:text-gray-900 bg-gray-50'
                }`}
              >
                <Clock size={15} />
                <span>{lang === 'bn' ? 'সর্বশেষ' : 'Latest'}</span>
              </button>
              <button
                onClick={() => setSidebarTab('mostRead')}
                className={`flex-1 py-3 text-center transition-colors flex items-center justify-center gap-1.5 border-b-2 ${
                  sidebarTab === 'mostRead'
                    ? 'border-[#e30613] text-[#e30613] bg-red-50/40'
                    : 'border-transparent text-gray-600 hover:text-gray-900 bg-gray-50'
                }`}
              >
                <TrendingUp size={15} />
                <span>{lang === 'bn' ? 'সর্বাধিক পঠিত' : 'Most Read'}</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-3.5 divide-y divide-gray-100">
              {sidebarTab === 'latest' ? (
                latestArticles.map((art) => (
                  <article key={art.id} className="py-2.5 first:pt-1 last:pb-1 group">
                    <Link to={`/article/${art.slug}`}>
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#e30613] transition-colors leading-snug line-clamp-2">
                        {lang === 'bn' ? art.title_bn : art.title_en}
                      </h4>
                    </Link>
                    <span className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                      <Clock size={10} />
                      <span>{formatRelativeTime(art.date, lang)}</span>
                    </span>
                  </article>
                ))
              ) : (
                mostRead.map((art, idx) => (
                  <NewsCard key={art.id} article={art} variant="sidebar" lang={lang} rank={idx + 1} />
                ))
              )}
            </div>
          </div>

          {/* Widget 2: Medium Rectangle Ad (300x250) */}
          <AdBanner size="rectangle" lang={lang} settings={settings} />

          {/* Widget 3: আজকের ই-পেপার (Today's e-Paper Front Page Preview) */}
          <div className="bg-gradient-to-br from-[#1a3a5c] to-[#0f2540] text-white p-4 rounded-lg shadow-md">
            <div className="flex items-center gap-2 mb-2 text-yellow-300">
              <Newspaper size={18} />
              <span className="font-bold text-xs uppercase tracking-wider">
                {lang === 'bn' ? 'আজকের মুদ্রিত পত্রিকা' : "Today's Printed Paper"}
              </span>
            </div>
            <p className="text-xs text-gray-200 mb-3 leading-relaxed">
              {lang === 'bn'
                ? 'অনলাইন ই-পেপারের মাধ্যমে আসল ছাপা পত্রিকার প্রতিটি পাতা ডিজিটাল অভিজ্ঞতায় পড়ুন।'
                : 'Read every printed page of today’s physical newspaper with an authentic digital facsimile.'}
            </p>
            <Link
              to="/epaper"
              className="inline-flex items-center gap-1.5 bg-[#e30613] hover:bg-red-700 text-white font-bold text-xs px-3.5 py-1.5 rounded transition-colors shadow"
            >
              <span>{lang === 'bn' ? 'ই-পেপার পড়ুন →' : 'Read ePaper →'}</span>
            </Link>
          </div>

          {/* Widget 4: নামাজের সময়সূচি ও আবহাওয়া (Prayer Times & Weather - Dynamic & Multi-Division) */}
          <PrayerTimesWidget lang={lang} />

          {/* Widget 5: পাঠক জরিপ / Online Poll (Dynamic from Admin & Database) */}
          <ReaderPollWidget lang={lang} />

          {/* Widget 6: Half Page Ad (300x600) */}
          <AdBanner size="halfpage" lang={lang} settings={settings} />
        </aside>
      </div>

      {/* ================= 4. MULTIMEDIA ROW: PHOTOS & VIDEOS ================= */}
      {(photos.length > 0 || videos.length > 0) && (
        <section className="mt-12 pt-8 border-t-2 border-gray-300">
          <div className={`grid grid-cols-1 ${photos.length > 0 && videos.length > 0 ? 'lg:grid-cols-2' : ''} gap-8`}>
            {/* Photo Gallery Block */}
            {photos.length > 0 && (
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
            )}

            {/* Video News Block */}
            {videos.length > 0 && (
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
            )}
          </div>
        </section>
      )}

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
