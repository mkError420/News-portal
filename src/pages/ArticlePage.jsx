import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Home,
  ChevronRight,
  Clock,
  Eye,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Type,
  Printer,
  MessageCircle,
  Copy,
  Check,
  Send,
  User,
  Heart,
} from 'lucide-react'
import { FacebookIcon, TwitterIcon } from '../components/SocialIcons.jsx'
import NewsCard from '../components/NewsCard.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import AdBanner from '../components/AdBanner.jsx'
import { api } from '../api.js'
import {
  formatBengaliDate,
  formatEnglishDate,
  formatRelativeTime,
  formatViews,
  CATEGORIES_BN,
  CATEGORIES_EN,
  toBengaliNumber,
} from '../utils.js'

export default function ArticlePage({ articles = [], categories = [], lang = 'bn' }) {
  const { slug } = useParams()
  const article = articles.find((a) => a.slug === slug || String(a.id) === String(slug)) ||
    articles.find((a) => a.slug === slug) ||
    articles[0]

  // Reader state
  const [fontSizeLevel, setFontSizeLevel] = useState(1) // 0: small, 1: normal, 2: large
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [copied, setCopied] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  // Comments state
  const [comments, setComments] = useState([
    {
      id: 1,
      author: lang === 'bn' ? 'মাহমুদুল হাসান' : 'Mahmudul Hasan',
      date: '2026-11-14T09:00:00.000Z',
      text: lang === 'bn' ? 'খুবই তথ্যবহুল ও সময়োপযোগী প্রতিবেদন। ধন্যবাদ প্রথম আলোকে।' : 'Very informative and timely report. Thanks to Prothom Alo.',
      likes: 12,
    },
    {
      id: 2,
      author: lang === 'bn' ? 'তানিয়া সুলতানা' : 'Tania Sultana',
      date: '2026-11-14T08:30:00.000Z',
      text: lang === 'bn' ? 'এই উদ্যোগ দ্রুত বাস্তবায়িত হলে সাধারণ মানুষের অনেক উপকার হবে।' : 'If this initiative is implemented quickly, it will benefit ordinary citizens immensely.',
      likes: 8,
    },
  ])
  const [authorName, setAuthorName] = useState('')
  const [commentText, setCommentText] = useState('')

  // Scroll to top and record view
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (article?.id) {
      api.recordArticleView(article.id)
    }
  }, [slug, article?.id])

  if (!article) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center font-bengali">
        <h2 className="text-2xl font-bold text-gray-800">
          {lang === 'bn' ? 'সংবাদটি পাওয়া যায়নি' : 'Article Not Found'}
        </h2>
        <Link to="/" className="mt-4 inline-block text-red-600 hover:underline">
          {lang === 'bn' ? '← প্রচ্ছদে ফিরে যান' : '← Back to Home'}
        </Link>
      </div>
    )
  }

  const title = (lang === 'bn' ? article.title_bn : article.title_en) || article.title_bn || article.title
  const subhead = (lang === 'bn' ? article.subheadline_bn : article.subheadline_en) || article.subheadline_bn
  const content = (lang === 'bn' ? article.content_bn : article.content_en) || article.content_bn || article.summary_bn
  const author = (lang === 'bn' ? article.author_bn : article.author_en) || article.author_bn || article.author || 'প্রতিবেদক'
  const authorRole = (lang === 'bn' ? article.author_role_bn : article.author_role_en) || article.author_role_bn || 'প্রথম আলো'
  const catKey = (article.category || 'national').toLowerCase()
  const matchedCat = (categories || []).find(
    (c) => (c.slug || '').toLowerCase() === catKey || (c.name || '').toLowerCase() === catKey
  )
  const catTitle = lang === 'bn'
    ? (matchedCat?.name_bn || CATEGORIES_BN[catKey] || article.category)
    : (matchedCat?.name_en || CATEGORIES_EN[catKey] || article.category)

  const pubDateStr = lang === 'bn' ? formatBengaliDate(article.date) : formatEnglishDate(article.date)
  const relativeTime = formatRelativeTime(article.date, lang)
  const viewsStr = formatViews(article.views || 25400, lang)

  // Font size classes
  const fontSizes = ['text-base leading-relaxed', 'text-lg leading-loose', 'text-xl leading-loose']

  // Copy URL
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Handle comment submission
  const handleAddComment = (e) => {
    e.preventDefault()
    if (commentText.trim()) {
      const newComment = {
        id: Date.now(),
        author: authorName.trim() || (lang === 'bn' ? 'পাঠক' : 'Anonymous Reader'),
        date: new Date().toISOString(),
        text: commentText.trim(),
        likes: 0,
      }
      setComments([newComment, ...comments])
      setCommentText('')
    }
  }

  // Related stories (exclude current)
  const relatedArticles = articles.filter((a) => a.id !== article.id).slice(0, 3)
  const mostRead = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-bengali">
      {/* 1. Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 pb-2 border-b border-gray-200">
        <Link to="/" className="hover:text-red-600 flex items-center gap-1">
          <Home size={13} />
          <span>{lang === 'bn' ? 'প্রচ্ছদ' : 'Home'}</span>
        </Link>
        <ChevronRight size={12} className="text-gray-400" />
        <Link to={`/category/${catKey}`} className="hover:text-red-600 font-semibold">
          {catTitle}
        </Link>
        <ChevronRight size={12} className="text-gray-400" />
        <span className="text-gray-400 truncate max-w-xs">{title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ================= MAIN ARTICLE COLUMN (8 cols) ================= */}
        <article className="lg:col-span-8 bg-white p-5 sm:p-8 rounded border border-gray-200 shadow-sm">
          {/* Category Pill */}
          <Link
            to={`/category/${catKey}`}
            className="inline-block text-xs font-bold text-[#e30613] hover:text-[#b80010] uppercase tracking-wider mb-2"
          >
            {catTitle}
          </Link>

          {/* Headline */}
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1a1a1a] leading-tight mb-3">
            {title}
          </h1>

          {/* Subheadline */}
          {subhead && (
            <h2 className="text-base sm:text-xl font-medium text-gray-600 leading-snug mb-4">
              {subhead}
            </h2>
          )}

          {/* Author & Timestamp Bar */}
          <div className="pt-3 pb-3 border-y border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
                {author.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm leading-tight">{author}</p>
                <p className="text-[11px] text-gray-500">{authorRole}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                <span>{pubDateStr}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye size={12} />
                <span>{viewsStr} {lang === 'bn' ? 'বার পড়া হয়েছে' : 'views'}</span>
              </span>
            </div>
          </div>

          {/* Reader Controls & Social Share Toolbar */}
          <div className="py-2.5 my-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-gray-50/70 px-3 rounded">
            {/* Left: Font size adjuster & Audio preview */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">{lang === 'bn' ? 'হরফ:' : 'Font:'}</span>
              <button
                onClick={() => setFontSizeLevel(Math.max(0, fontSizeLevel - 1))}
                className="px-2 py-0.5 bg-white border rounded text-xs hover:bg-gray-100 font-bold"
                title="Decrease font"
              >
                A-
              </button>
              <button
                onClick={() => setFontSizeLevel(1)}
                className="px-2 py-0.5 bg-white border rounded text-xs hover:bg-gray-100 font-semibold"
                title="Default font"
              >
                100%
              </button>
              <button
                onClick={() => setFontSizeLevel(Math.min(2, fontSizeLevel + 1))}
                className="px-2 py-0.5 bg-white border rounded text-xs hover:bg-gray-100 font-bold"
                title="Increase font"
              >
                A+
              </button>

              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className={`ml-3 flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${isPlayingAudio ? 'bg-red-600 text-white' : 'bg-white border text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {isPlayingAudio ? <VolumeX size={13} /> : <Volume2 size={13} />}
                <span>{isPlayingAudio ? (lang === 'bn' ? 'থামান' : 'Stop') : (lang === 'bn' ? 'শুনুন' : 'Listen')}</span>
              </button>
            </div>

            {/* Right: Social Share Buttons */}
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 font-medium mr-1">{lang === 'bn' ? 'শেয়ার:' : 'Share:'}</span>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-[#1877f2] text-white flex items-center justify-center hover:opacity-90"
                title="Share on Facebook"
              >
                <FacebookIcon size={13} />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(title)}`}
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-[#1da1f2] text-white flex items-center justify-center hover:opacity-90"
                title="Share on X"
              >
                <TwitterIcon size={13} />
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + window.location.href)}`}
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-[#25d366] text-white flex items-center justify-center hover:opacity-90"
                title="Share on WhatsApp"
              >
                <MessageCircle size={13} />
              </a>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors"
                title="Copy Link"
              >
                {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                <span>{copied ? (lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (lang === 'bn' ? 'কপি' : 'Copy')}</span>
              </button>
            </div>
          </div>

          {/* Featured Image with Caption */}
          <div className="my-5">
            <div className="rounded overflow-hidden bg-gray-100 aspect-[16/10]">
              <img src={article.image} alt={title} className="w-full h-full object-cover" />
            </div>
            <div className="mt-2 text-xs text-gray-500 flex justify-between items-center px-1">
              <span>{lang === 'bn' ? (article.imageCaption || 'ফাইল ছবি') : 'File photo'}</span>
              <span className="font-semibold">{lang === 'bn' ? 'ছবি: প্রথম আলো' : 'Photo: Prothom Alo'}</span>
            </div>
          </div>

          {/* Main Article Body Text */}
          <div
            className={`news-prose text-gray-900 ${fontSizes[fontSizeLevel]} my-6 space-y-4 font-bengali`}
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Tags Cloud */}
          <div className="pt-4 border-t border-gray-200 mt-8">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
              {lang === 'bn' ? 'সম্পর্কিত বিষয়:' : 'Related Topics:'}
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {(lang === 'bn' ? article.tags_bn : article.tags_en || ['বাংলাদেশ', 'সংবাদ']).map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded-full text-gray-700 cursor-pointer transition-colors font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Mid-Article In-feed Ad Banner */}
          <div className="my-8">
            <AdBanner size="infeed" lang={lang} />
          </div>

          {/* Comments Section */}
          <section className="mt-10 pt-6 border-t-2 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-extrabold text-gray-900">
                {lang === 'bn' ? `পাঠকের মন্তব্য (${toBengaliNumber(comments.length)})` : `Reader Comments (${comments.length})`}
              </h3>
            </div>

            {/* Post Comment Form */}
            <form onSubmit={handleAddComment} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
              <div className="mb-3">
                <input
                  type="text"
                  placeholder={lang === 'bn' ? 'আপনার নাম (ঐচ্ছিক)' : 'Your Name (optional)'}
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded bg-white outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
              <div className="mb-3">
                <textarea
                  rows="3"
                  required
                  placeholder={lang === 'bn' ? 'এই প্রতিবেদন সম্পর্কে আপনার মতামত লিখুন...' : 'Write your comment on this story...'}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full text-xs p-3 border rounded bg-white outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-[#e30613] hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded transition-colors shadow-sm"
                >
                  <Send size={12} />
                  <span>{lang === 'bn' ? 'মন্তব্য প্রকাশ করুন' : 'Submit Comment'}</span>
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3.5">
              {comments.map((c) => (
                <div key={c.id} className="p-3.5 bg-white rounded border border-gray-100 shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold">
                        <User size={12} />
                      </div>
                      <span className="font-bold text-xs text-gray-900">{c.author}</span>
                    </div>
                    <span className="text-[11px] text-gray-400">{formatRelativeTime(c.date, lang)}</span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed pl-8">{c.text}</p>
                </div>
              ))}
            </div>
          </section>
        </article>

        {/* ================= RIGHT SIDEBAR (4 cols) ================= */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Most Read Sidebar */}
          <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
            <SectionHeader
              title_bn="সর্বাধিক পঠিত"
              title_en="Most Read"
              lang={lang}
            />
            <div className="divide-y divide-gray-100">
              {mostRead.map((art, idx) => (
                <NewsCard key={art.id} article={art} variant="sidebar" lang={lang} rank={idx + 1} />
              ))}
            </div>
          </div>

          {/* Ad 300x250 */}
          <AdBanner size="rectangle" lang={lang} />

          {/* Related Articles Box */}
          <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
            <SectionHeader
              title_bn="আরও পড়ুন"
              title_en="Related Reads"
              lang={lang}
            />
            <div className="space-y-3">
              {relatedArticles.map((art) => (
                <NewsCard key={art.id} article={art} variant="list" lang={lang} />
              ))}
            </div>
          </div>

          {/* Ad 300x600 Skyscraper */}
          <AdBanner size="halfpage" lang={lang} />
        </aside>
      </div>
    </div>
  )
}
