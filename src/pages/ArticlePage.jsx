import { useState, useEffect, useRef, useCallback } from 'react'
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
  Play,
  Pause,
  Square,
  RotateCcw,
  SkipBack,
  SkipForward,
  X,
} from 'lucide-react'
import { FacebookIcon, TwitterIcon } from '../components/SocialIcons.jsx'
import NewsCard from '../components/NewsCard.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import AdBanner from '../components/AdBanner.jsx'
import SEO from '../components/SEO.jsx'
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

// Helper to extract clean plain text from HTML content
function stripHtmlToPlainText(html) {
  if (!html) return ''
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    doc.querySelectorAll('script, style, figure, figcaption, img, audio, video, iframe, svg').forEach((el) => el.remove())
    const text = doc.body.textContent || doc.body.innerText || ''
    return text.replace(/[\u00a0\u1680\u180e\u2000-\u200b\u202f\u205f\u3000\ufeff]/g, ' ').replace(/\s+/g, ' ').trim()
  } catch {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }
}

// Split into clean, natural sentence chunks (<110 chars) for seamless playback
function extractSpeechChunks(title, subhead, content) {
  const chunks = []
  if (title && title.trim()) chunks.push(title.trim())
  if (subhead && subhead.trim()) chunks.push(subhead.trim())

  const plain = stripHtmlToPlainText(content)
  if (plain) {
    const rawSentences = plain.split(/([।?!.\n\r]+)/)
    for (let i = 0; i < rawSentences.length; i += 2) {
      const sentence = (rawSentences[i] || '').trim()
      const punctuation = (rawSentences[i + 1] || '').trim()
      const full = `${sentence} ${punctuation}`.replace(/\s+/g, ' ').trim()
      if (!full || full.length < 2) continue

      if (full.length <= 110) {
        chunks.push(full)
      } else {
        // Break long sentences at natural word boundaries
        const words = full.split(/\s+/)
        let curr = ''
        for (const w of words) {
          if ((curr + ' ' + w).trim().length > 100 && curr) {
            chunks.push(curr.trim())
            curr = w
          } else {
            curr = (curr + ' ' + w).trim()
          }
        }
        if (curr.trim()) chunks.push(curr.trim())
      }
    }
  }
  return chunks
}

// Select best voice for language
function selectBestVoice(voices, lang) {
  if (!voices || !voices.length) return null
  if (lang === 'bn') {
    const bengaliVoices = voices.filter((v) => /^(bn-|bn$)/i.test(v.lang || ''))
    return bengaliVoices.find((v) => (v.lang || '').toLowerCase() === 'bn-bd') ||
      bengaliVoices.find((v) => (v.lang || '').toLowerCase() === 'bn-in') ||
      bengaliVoices[0] ||
      null
  } else {
    const enVoice = voices.find((v) => {
      const c = (v.lang || '').toLowerCase()
      return c.startsWith('en') && (c.includes('us') || c.includes('gb') || c === 'en')
    })
    if (enVoice) return enVoice
  }
  return voices.find((v) => v.default) || voices[0] || null
}

export default function ArticlePage({
  articles = [],
  breakingNews = [],
  categories = [],
  ads = [],
  settings = null,
  lang = 'bn',
  onRecordView = null,
}) {
  const { slug } = useParams()

  // Live timer tick every 30s so publish relative time updates dynamically
  const [, setTick] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30000)
    return () => clearInterval(timer)
  }, [])
  const article = articles.find((a) => a.slug === slug || String(a.id) === String(slug)) ||
    articles.find((a) => a.slug === slug) ||
    (() => {
      const matchedBreaking = (breakingNews || []).find((b) => b.slug === slug)
      if (matchedBreaking) {
        if (matchedBreaking.article_id) {
          const art = articles.find((a) => a.id === matchedBreaking.article_id)
          if (art) return art
        }
        return {
          id: matchedBreaking.id,
          slug: matchedBreaking.slug,
          title_bn: matchedBreaking.title_bn,
          title_en: matchedBreaking.title_en || matchedBreaking.title_bn,
          category: 'national',
          subheadline_bn: 'বিশেষ ব্রেকিং বুলেটিন',
          subheadline_en: 'Breaking News Bulletin',
          summary_bn: matchedBreaking.title_bn,
          summary_en: matchedBreaking.title_en || matchedBreaking.title_bn,
          author_bn: (lang === 'bn' ? settings?.site_name_bn : settings?.site_name_en) ? `${lang === 'bn' ? settings?.site_name_bn : settings?.site_name_en} অনলাইন` : 'অনলাইন ডেস্ক',
          author_en: 'Online Desk',
          author_role_bn: 'সর্বশেষ লাইভ আপডেট',
          author_role_en: 'Live Updates',
          image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
          imageCaption: matchedBreaking.title_bn,
          imageCredit: (lang === 'bn' ? settings?.site_name_bn : settings?.site_name_en) ? `ছবি: ${(lang === 'bn' ? settings?.site_name_bn : settings?.site_name_en)}` : 'ছবি: আলোর পথে',
          published_at: matchedBreaking.created_at || new Date().toISOString(),
          read_time: '১ মিনিট পাঠ',
          views: 120,
          content_bn: `<p><strong>${matchedBreaking.title_bn}</strong></p><p>এই বিষয়ে বিস্তারিত তথ্য ও সর্বশেষ আপডেট সংগ্রহ করা হচ্ছে। বিস্তারিত প্রতিবেদন কিছুক্ষণের মধ্যেই সংযুক্ত করা হবে। সঙ্গে থাকুন।</p>`,
          content_en: `<p><strong>${matchedBreaking.title_en || matchedBreaking.title_bn}</strong></p><p>More details and live developments are incoming on this breaking story. Please stay tuned.</p>`,
        }
      }
      return null
    })()

  const siteName = (lang === 'bn' ? settings?.site_name_bn : settings?.site_name_en) ||
    (lang === 'bn' ? 'আলোর পথে' : 'Prothom kalo')

  // Font scale (default 100%, restored from localStorage if valid)
  const [fontScale, setFontScale] = useState(() => {
    try {
      const saved = localStorage.getItem('news_article_font_scale')
      if (saved) {
        const num = parseInt(saved, 10)
        if (!isNaN(num) && num >= 80 && num <= 160) return num
      }
    } catch {}
    return 100
  })

  const handleDecreaseFont = () => {
    setFontScale((prev) => {
      const next = Math.max(80, prev - 10)
      try { localStorage.setItem('news_article_font_scale', String(next)) } catch {}
      return next
    })
  }

  const handleIncreaseFont = () => {
    setFontScale((prev) => {
      const next = Math.min(160, prev + 10)
      try { localStorage.setItem('news_article_font_scale', String(next)) } catch {}
      return next
    })
  }

  const handleResetFont = () => {
    setFontScale(100)
    try { localStorage.setItem('news_article_font_scale', '100') } catch {}
  }

  // Audio Reader state (Dual-Engine: High-quality TTS Audio stream + Web Speech API fallback)
  const audioRef = useRef(null)
  const [audioStatus, setAudioStatus] = useState('idle') // 'idle' | 'playing' | 'paused'
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0)
  const [totalChunksCount, setTotalChunksCount] = useState(0)
  const [speechSpeed, setSpeechSpeed] = useState(1) // 0.9, 1.0, 1.25
  const [activeSentenceText, setActiveSentenceText] = useState('')
  const [engineMode, setEngineMode] = useState('cloud') // 'cloud' | 'native'

  const chunksRef = useRef([])
  const currentChunkIndexRef = useRef(0)
  const isSpeakingRef = useRef(false)
  const isPausedRef = useRef(false)
  const speechSpeedRef = useRef(1)
  const currentUtteranceRef = useRef(null)

  const handleStopAudio = useCallback(() => {
    isSpeakingRef.current = false
    isPausedRef.current = false
    if (audioRef.current) {
      try {
        audioRef.current.pause()
        audioRef.current.removeAttribute('src')
        audioRef.current.load()
      } catch {}
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel() } catch {}
    }
    currentUtteranceRef.current = null
    try { window.__agyCurrentUtterance = null } catch {}
    setAudioStatus('idle')
    setCurrentChunkIndex(0)
    currentChunkIndexRef.current = 0
    setActiveSentenceText('')
  }, [])

  const playWithNativeSpeech = useCallback((index) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      handleStopAudio()
      return
    }

    const chunks = chunksRef.current
    if (!chunks || index >= chunks.length || !isSpeakingRef.current) {
      handleStopAudio()
      return
    }

    try { window.speechSynthesis.cancel() } catch {}

    const text = chunks[index]
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = speechSpeedRef.current || 1
    utterance.pitch = 1

    const voices = window.speechSynthesis.getVoices() || []
    const bestVoice = selectBestVoice(voices, lang)
    if (bestVoice) {
      utterance.voice = bestVoice
      utterance.lang = bestVoice.lang
    } else {
      utterance.lang = lang === 'bn' ? 'bn-BD' : 'en-US'
    }

    // Keep reference so Chrome garbage collector does not kill active speech
    currentUtteranceRef.current = utterance
    try { window.__agyCurrentUtterance = utterance } catch {}

    utterance.onend = () => {
      if (isSpeakingRef.current && !isPausedRef.current) {
        // Advance to next chunk
        const nextIndex = index + 1
        if (nextIndex < chunksRef.current.length) {
          currentChunkIndexRef.current = nextIndex
          setCurrentChunkIndex(nextIndex)
          setActiveSentenceText(chunksRef.current[nextIndex])
          playWithNativeSpeech(nextIndex)
        } else {
          handleStopAudio()
        }
      }
    }

    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') return
      console.warn('Native speech warning:', e)
      if (isSpeakingRef.current && !isPausedRef.current && index + 1 < chunks.length) {
        const nextIndex = index + 1
        currentChunkIndexRef.current = nextIndex
        setCurrentChunkIndex(nextIndex)
        setActiveSentenceText(chunksRef.current[nextIndex])
        playWithNativeSpeech(nextIndex)
      } else {
        handleStopAudio()
      }
    }

    // Short timeout to guarantee cancel finished in Chrome
    setTimeout(() => {
      if (isSpeakingRef.current && !isPausedRef.current) {
        window.speechSynthesis.speak(utterance)
        setAudioStatus('playing')
      }
    }, 25)
  }, [lang, handleStopAudio])

  const playChunk = useCallback((index) => {
    const chunks = chunksRef.current
    if (!chunks || index >= chunks.length || !isSpeakingRef.current) {
      handleStopAudio()
      return
    }

    currentChunkIndexRef.current = index
    setCurrentChunkIndex(index)
    setActiveSentenceText(chunks[index])

    const text = chunks[index]

    // 1. Try High-Quality Audio Stream First
    if (audioRef.current && engineMode !== 'native') {
      try {
        const langCode = lang === 'bn' ? 'bn-BD' : 'en'
        const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${langCode}&q=${encodeURIComponent(text)}`
        
        const audio = audioRef.current
        audio.src = audioUrl
        audio.playbackRate = speechSpeedRef.current || 1
        
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setAudioStatus('playing')
            })
            .catch((err) => {
              console.warn('HTML5 Audio playback error, switching to SpeechSynthesis:', err)
              setEngineMode('native')
              playWithNativeSpeech(index)
            })
        }
        return
      } catch (err) {
        console.warn('Audio stream error, switching to SpeechSynthesis:', err)
        setEngineMode('native')
        playWithNativeSpeech(index)
        return
      }
    }

    // 2. Fallback to Web Speech API
    playWithNativeSpeech(index)
  }, [engineMode, lang, handleStopAudio, playWithNativeSpeech])

  const handleAudioEnded = () => {
    if (isSpeakingRef.current && !isPausedRef.current) {
      playChunk(currentChunkIndexRef.current + 1)
    }
  }

  const handleAudioError = () => {
    console.warn('HTML5 Audio onError, falling back to Native Web Speech')
    setEngineMode('native')
    playWithNativeSpeech(currentChunkIndexRef.current)
  }

  const handleStartAudio = (articleTitle, articleSubhead, articleContent) => {
    if (audioStatus === 'paused') {
      handleResumeAudio()
      return
    }

    // Stop any existing playback
    handleStopAudio()

    const chunks = extractSpeechChunks(articleTitle, articleSubhead, articleContent)
    if (!chunks.length) return

    chunksRef.current = chunks
    setTotalChunksCount(chunks.length)
    currentChunkIndexRef.current = 0
    setCurrentChunkIndex(0)
    isSpeakingRef.current = true
    isPausedRef.current = false
    setAudioStatus('playing')

    playChunk(0)
  }

  const handlePauseAudio = () => {
    isPausedRef.current = true
    if (audioRef.current && !audioRef.current.paused) {
      try { audioRef.current.pause() } catch {}
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.pause() } catch {}
    }
    setAudioStatus('paused')
  }

  const handleResumeAudio = () => {
    isPausedRef.current = false
    if (audioRef.current && audioRef.current.src && engineMode !== 'native') {
      audioRef.current.play().then(() => {
        setAudioStatus('playing')
      }).catch(() => {
        playChunk(currentChunkIndexRef.current)
      })
      return
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
      } else {
        playWithNativeSpeech(currentChunkIndexRef.current)
      }
    }
    setAudioStatus('playing')
  }

  const handleNextSentence = () => {
    const nextIdx = currentChunkIndexRef.current + 1
    if (nextIdx < chunksRef.current.length) {
      if (audioRef.current) {
        try { audioRef.current.pause() } catch {}
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try { window.speechSynthesis.cancel() } catch {}
      }
      playChunk(nextIdx)
    } else {
      handleStopAudio()
    }
  }

  const handlePrevSentence = () => {
    const prevIdx = Math.max(0, currentChunkIndexRef.current - 1)
    if (audioRef.current) {
      try { audioRef.current.pause() } catch {}
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel() } catch {}
    }
    playChunk(prevIdx)
  }

  const handleSpeedChange = (newSpeed) => {
    speechSpeedRef.current = newSpeed
    setSpeechSpeed(newSpeed)
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.playbackRate = newSpeed
    }
    if (audioStatus === 'playing' && engineMode === 'native') {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        playWithNativeSpeech(currentChunkIndexRef.current)
      }
    }
  }

  // Cancel audio on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Cancel audio on article change
  useEffect(() => {
    handleStopAudio()
  }, [slug, article?.id, handleStopAudio])

  const [copied, setCopied] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  // Comments state (dynamic, starts empty)
  const [comments, setComments] = useState([])
  const [authorName, setAuthorName] = useState('')
  const [commentText, setCommentText] = useState('')

  // Live Views state (instant optimistic count + server synchronization)
  const [liveViews, setLiveViews] = useState(() => Math.max(0, parseInt(article?.views, 10) || 0))

  useEffect(() => {
    if (article?.views !== undefined && article?.views !== null) {
      setLiveViews(Math.max(0, parseInt(article.views, 10) || 0))
    }
  }, [article?.id, article?.views])

  // Scroll to top and record view
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    const target = article?.id || slug
    if (target) {
      // Optimistic increment so the live count immediately advances for the reader
      setLiveViews((prev) => prev + 1)
      onRecordView?.(target)

      api.recordArticleView(target).then((res) => {
        if (res && res.views !== undefined && res.views !== null) {
          const finalCount = Number(res.views)
          setLiveViews(finalCount)
          onRecordView?.(target, finalCount)
        }
      }).catch(() => {})
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
  const authorRole = (lang === 'bn' ? article.author_role_bn : article.author_role_en) || article.author_role_bn || siteName
  const catKey = (article.category || 'national').toLowerCase()
  const matchedCat = (categories || []).find(
    (c) => (c.slug || '').toLowerCase() === catKey || (c.name || '').toLowerCase() === catKey
  )
  const catTitle = lang === 'bn'
    ? (matchedCat?.name_bn || CATEGORIES_BN[catKey] || article.category)
    : (matchedCat?.name_en || CATEGORIES_EN[catKey] || article.category)

  const pubDateStr = lang === 'bn' ? formatBengaliDate(article.date, true) : formatEnglishDate(article.date, true)
  const relativeTime = formatRelativeTime(article.date, lang)
  const viewsStr = formatViews(liveViews, lang)

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
  const mostRead = [...articles].sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0)).slice(0, 5)

  // SEO & Structured Data calculation
  const seoTitle = article.seo_title || title
  const seoDesc = article.seo_description || (lang === 'bn' ? article.summary_bn : article.summary_en) || article.summary || subhead || ''
  const ogImg = article.og_image || article.image
  const tagsList = (lang === 'bn' ? article.tags_bn : article.tags_en) || article.tags_bn || article.tags || []
  const schemaType = article.schema_type || 'NewsArticle'
  const originUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const articleUrl = typeof window !== 'undefined' ? window.location.href : (article.canonical_url || `${originUrl}/article/${article.slug}`)

  const newsArticleSchema = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    headline: seoTitle,
    description: seoDesc,
    image: [ogImg],
    datePublished: article.date || article.published_at,
    dateModified: article.updated_at || article.date || article.published_at,
    author: [{
      '@type': 'Person',
      name: author,
      jobTitle: authorRole,
    }],
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: settings?.logo_url || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    articleSection: catTitle,
    keywords: Array.isArray(tagsList) ? tagsList.join(', ') : tagsList,
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: lang === 'bn' ? 'প্রচ্ছদ' : 'Home',
        item: originUrl || '/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: catTitle,
        item: `${originUrl}/category/${catKey}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: articleUrl,
      },
    ],
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-bengali">
      <SEO
        title={seoTitle}
        description={seoDesc}
        canonical={article.canonical_url}
        ogImage={ogImg}
        ogType="article"
        publishedTime={article.date || article.published_at}
        modifiedTime={article.updated_at || article.date}
        author={author}
        section={catTitle}
        tags={Array.isArray(tagsList) ? tagsList : []}
        schema={[newsArticleSchema, breadcrumbSchema]}
        lang={lang}
        settings={settings}
      />
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
              <span className="flex items-center gap-1.5" title={pubDateStr}>
                <Clock size={12} className="text-gray-400" />
                <span>{pubDateStr} <span className="text-gray-400 font-normal">({relativeTime})</span></span>
              </span>
              <span>•</span>
              <span
                className="flex items-center gap-1.5 bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full font-semibold text-xs border border-red-100"
                title={lang === 'bn' ? `মোট ${toBengaliNumber(liveViews)} বার পড়া হয়েছে` : `Read ${liveViews} times`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                <Eye size={12} className="text-red-500" />
                <span>{viewsStr} {lang === 'bn' ? 'বার পড়া হয়েছে' : 'views'}</span>
              </span>
            </div>
          </div>

          {/* Reader Controls & Social Share Toolbar */}
          <div className="py-2.5 my-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-gray-50/70 px-3 rounded">
            {/* Left: Font size adjuster & Audio preview */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-gray-500 font-medium">{lang === 'bn' ? 'হরফ:' : 'Font:'}</span>
              <button
                type="button"
                onClick={handleDecreaseFont}
                disabled={fontScale <= 80}
                className={`px-2 py-0.5 bg-white border rounded text-xs font-bold transition-colors ${
                  fontScale <= 80
                    ? 'opacity-40 cursor-not-allowed text-gray-400 border-gray-200'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-red-600 border-gray-300'
                }`}
                title={lang === 'bn' ? 'হরফ ছোট করুন (A-)' : 'Decrease font size (A-)'}
              >
                A-
              </button>
              <button
                type="button"
                onClick={handleResetFont}
                className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
                  fontScale === 100
                    ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                    : 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 font-bold'
                }`}
                title={lang === 'bn' ? 'স্বাভাবিক আকার (১০০%)' : 'Reset to default size (100%)'}
              >
                {lang === 'bn' ? `${toBengaliNumber(fontScale)}%` : `${fontScale}%`}
              </button>
              <button
                type="button"
                onClick={handleIncreaseFont}
                disabled={fontScale >= 160}
                className={`px-2 py-0.5 bg-white border rounded text-xs font-bold transition-colors ${
                  fontScale >= 160
                    ? 'opacity-40 cursor-not-allowed text-gray-400 border-gray-200'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-red-600 border-gray-300'
                }`}
                title={lang === 'bn' ? 'হরফ বড় করুন (A+)' : 'Increase font size (A+)'}
              >
                A+
              </button>

              {/* Audio Listen / Player Controls */}
              {audioStatus === 'idle' ? (
                <button
                  type="button"
                  onClick={() => handleStartAudio(title, subhead, content)}
                  className="ml-2 sm:ml-3 flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm"
                  title={lang === 'bn' ? 'সংবাদটি অডিও শুনুন' : 'Listen to this article'}
                >
                  <Volume2 size={13} className="text-red-600" />
                  <span>{lang === 'bn' ? 'শুনুন' : 'Listen'}</span>
                </button>
              ) : (
                <div className="ml-2 sm:ml-3 flex items-center gap-1">
                  {audioStatus === 'playing' ? (
                    <button
                      type="button"
                      onClick={handlePauseAudio}
                      className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm animate-pulse"
                      title={lang === 'bn' ? 'বিরতি দিন' : 'Pause audio'}
                    >
                      <Pause size={12} />
                      <span>{lang === 'bn' ? 'বিরতি' : 'Pause'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResumeAudio}
                      className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-sm"
                      title={lang === 'bn' ? 'চালিয়ে যান' : 'Resume audio'}
                    >
                      <Play size={12} className="fill-current" />
                      <span>{lang === 'bn' ? 'চালান' : 'Resume'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleStopAudio}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                    title={lang === 'bn' ? 'বন্ধ করুন' : 'Stop audio'}
                  >
                    <Square size={10} className="fill-current text-gray-600" />
                    <span>{lang === 'bn' ? 'থামান' : 'Stop'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right: Social Share Buttons */}
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 font-medium mr-1">{lang === 'bn' ? 'শেয়ার:' : 'Share:'}</span>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-[#1877f2] text-white flex items-center justify-center hover:opacity-90"
                title="Share on Facebook"
              >
                <FacebookIcon size={13} />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(title)}`}
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full bg-[#1da1f2] text-white flex items-center justify-center hover:opacity-90"
                title="Share on X"
              >
                <TwitterIcon size={13} />
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + (typeof window !== 'undefined' ? window.location.href : ''))}`}
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

          {/* Hidden HTML5 Audio Element for High Quality Cloud TTS */}
          <audio
            ref={audioRef}
            referrerPolicy="no-referrer"
            onEnded={handleAudioEnded}
            onError={handleAudioError}
            preload="auto"
            className="hidden"
          />

          {/* Active Audio Player Floating / Inline Bar */}
          {audioStatus !== 'idle' && (
            <div className="my-2.5 p-3.5 bg-gradient-to-r from-red-50 via-white to-red-50/70 border border-red-200 rounded-lg shadow-sm transition-all animate-fadeIn">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                {/* Left: Wave animation & Reading status */}
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-0.5 h-4">
                    <span className={`w-1 bg-red-600 rounded-full transition-all ${audioStatus === 'playing' ? 'h-4 animate-bounce' : 'h-2'}`}></span>
                    <span className={`w-1 bg-red-600 rounded-full transition-all ${audioStatus === 'playing' ? 'h-3 animate-bounce [animation-delay:0.15s]' : 'h-2'}`}></span>
                    <span className={`w-1 bg-red-600 rounded-full transition-all ${audioStatus === 'playing' ? 'h-4 animate-bounce [animation-delay:0.3s]' : 'h-2'}`}></span>
                    <span className={`w-1 bg-red-600 rounded-full transition-all ${audioStatus === 'playing' ? 'h-2 animate-bounce [animation-delay:0.45s]' : 'h-2'}`}></span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <span>{lang === 'bn' ? 'অডিও সংবাদ পাঠ চলছে' : 'Audio Article Player'}</span>
                      {audioStatus === 'paused' && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-normal">
                          {lang === 'bn' ? 'স্থগিত' : 'Paused'}
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {lang === 'bn'
                        ? `বাক্য ${toBengaliNumber(currentChunkIndex + 1)} / ${toBengaliNumber(totalChunksCount || 1)}`
                        : `Sentence ${currentChunkIndex + 1} of ${totalChunksCount || 1}`}
                    </p>
                  </div>
                </div>

                {/* Right: Sentence skip, Play/Pause, Stop, Speed */}
                <div className="flex items-center gap-1.5">
                  {/* Previous Sentence */}
                  <button
                    type="button"
                    onClick={handlePrevSentence}
                    disabled={currentChunkIndex <= 0}
                    className="p-1 rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title={lang === 'bn' ? 'পূর্ববর্তী বাক্য' : 'Previous sentence'}
                  >
                    <SkipBack size={13} />
                  </button>

                  {/* Play / Pause Toggle */}
                  {audioStatus === 'playing' ? (
                    <button
                      type="button"
                      onClick={handlePauseAudio}
                      className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors shadow-sm"
                      title={lang === 'bn' ? 'বিরতি দিন' : 'Pause'}
                    >
                      <Pause size={12} className="text-red-600" />
                      <span>{lang === 'bn' ? 'বিরতি' : 'Pause'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResumeAudio}
                      className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition-colors shadow-sm"
                      title={lang === 'bn' ? 'চালিয়ে যান' : 'Resume'}
                    >
                      <Play size={12} className="fill-current" />
                      <span>{lang === 'bn' ? 'চালান' : 'Resume'}</span>
                    </button>
                  )}

                  {/* Next Sentence */}
                  <button
                    type="button"
                    onClick={handleNextSentence}
                    disabled={currentChunkIndex >= totalChunksCount - 1}
                    className="p-1 rounded bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title={lang === 'bn' ? 'পরবর্তী বাক্য' : 'Next sentence'}
                  >
                    <SkipForward size={13} />
                  </button>

                  {/* Stop */}
                  <button
                    type="button"
                    onClick={handleStopAudio}
                    className="flex items-center gap-1 px-2.5 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-semibold text-gray-700 transition-colors"
                    title={lang === 'bn' ? 'বন্ধ করুন' : 'Stop'}
                  >
                    <Square size={10} className="fill-current text-gray-600" />
                    <span>{lang === 'bn' ? 'থামান' : 'Stop'}</span>
                  </button>

                  {/* Speed Controls */}
                  <div className="flex items-center gap-0.5 text-[11px] bg-white border border-gray-200 rounded px-1 py-0.5 ml-1">
                    {[1, 1.25, 0.9].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => handleSpeedChange(rate)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                          speechSpeed === rate ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {rate === 1 ? '1x' : `${rate}x`}
                      </button>
                    ))}
                  </div>

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={handleStopAudio}
                    className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200 transition-colors ml-1"
                    title={lang === 'bn' ? 'বন্ধ' : 'Close'}
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* Progress Bar & Current Sentence Preview */}
              <div className="space-y-1.5 pt-1.5 border-t border-red-100">
                <div className="w-full bg-red-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-red-600 h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (((currentChunkIndex + 1) / Math.max(1, totalChunksCount)) * 100))}%` }}
                  ></div>
                </div>
                {activeSentenceText && (
                  <p className="text-[11px] text-gray-700 italic truncate" title={activeSentenceText}>
                    &ldquo;{activeSentenceText}&rdquo;
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Featured Image with Caption */}
          <div className="my-5">
            <div className="rounded overflow-hidden bg-gray-100 aspect-[16/10]">
              <img src={article.image} alt={title} className="w-full h-full object-cover" />
            </div>
            <div className="mt-2 text-xs text-gray-500 flex justify-between items-center px-1">
              <span>{lang === 'bn' ? (article.imageCaption || 'ফাইল ছবি') : 'File photo'}</span>
              <span className="font-semibold">{article.imageCredit || (lang === 'bn' ? `ছবি: ${siteName}` : `Photo: ${siteName}`)}</span>
            </div>
          </div>

          {/* Main Article Body Text */}
          <div
            className="news-prose text-gray-900 my-6 space-y-4 font-bengali transition-all duration-150"
            style={{
              '--article-font-size': `${(fontScale / 100) * 1.0625}rem`,
              fontSize: `${(fontScale / 100) * 1.0625}rem`,
              lineHeight: fontScale >= 130 ? '2.1' : '1.95',
            }}
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
            <AdBanner slotKey="article_infeed" ads={ads} size="infeed" lang={lang} settings={settings} />
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
          <AdBanner slotKey="article_sidebar_1" ads={ads} size="rectangle" lang={lang} settings={settings} />

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
          <AdBanner slotKey="article_sidebar_2" ads={ads} size="halfpage" lang={lang} settings={settings} />
        </aside>
      </div>
    </div>
  )
}
