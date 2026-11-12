import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Helmet } from 'react-helmet-async'
import {
  ArrowRight,
  BellRing,
  Camera,
  Clock3,
  Globe,
  Menu,
  Newspaper,
  PlayCircle,
  Search,
  Send,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Link, NavLink, Route, Routes, useParams } from 'react-router-dom'

const STORAGE_KEY = 'mk-news-portal-data'
const AUTH_KEY = 'mk-news-admin-auth'
const API_BASE = '/api'

const categoryList = [
  'National',
  'Politics',
  'International',
  'Economy',
  'Business',
  'Sports',
  'Entertainment',
  'Technology',
  'Education',
  'Health',
  'Lifestyle',
]

const defaultNews = {
  categories: categoryList,
  breakingNews: [
    { id: 1, title: 'বরিশাল ও বরগুনায় বৃষ্টির সঙ্গে বজ্রপাতের সতর্কতা জারি', slug: 'rain-warning-barisal' },
    { id: 2, title: 'স্থলবন্দর, সেতু ও রেললাইনে উন্নয়নের নতুন চুক্তি', slug: 'new-transport-pact' },
    { id: 3, title: 'বাংলাদেশের অর্থনীতিতে রফতানি খাতে নতুন উল্লম্ফন', slug: 'export-growth-bangladesh' },
  ],
  articles: [
    {
      id: 1,
      slug: 'bangladesh-flood-relief-response-grows',
      title: 'বন্যা কবলিত এলাকায় সহায়তা বাড়াচ্ছে বাংলাদেশ',
      subheadline: 'নদীর পানি বৃদ্ধির সঙ্গে সঙ্গে জরুরি ত্রাণ ও স্বাস্থ্যসেবা সম্প্রসারণ',
      summary: 'বন্যা-আক্রান্ত গ্রামগুলোতে খাবার, ত্রাণসামগ্রী ও চিকিৎসা সহায়তা বাড়িয়ে দিয়েছে সরকার ও নাগরিক সমাজ।',
      category: 'National',
      author: 'শাহরিয়ার হোসেন',
      authorRole: 'সংবাদদাতা',
      image: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=80',
      date: '2026-11-11T09:30:00.000Z',
      imageCaption: 'নদীর পানির উপরে চলমান ত্রাণ কার্যক্রম',
      imageCredit: 'ফাইল ছবি',
      views: 18420,
      readTime: '4 min read',
      tags: ['বন্যা', 'ত্রাণ'],
      featured: true,
      content: '<p>বাংলাদেশের উত্তর ও দক্ষিণাঞ্চলের কিছু অংশে বন্যা পরিস্থিতি নাজুক হয়ে উঠেছে। সরকারী ও বেসরকারি সংস্থাগুলো পানি উন্নয়ন ও মন্ত্রণালয়ের সঙ্গে সমন্বয় করে ত্রাণ কার্যক্রম দ্রুত বাড়িয়েছে।</p><p>কৃষি জমিতে পানির কারণে ফসলের ক্ষতি হলেও স্থানীয় প্রশাসন দ্রুত সেচ ও খাদ্য সহায়তা পৌঁছে দিচ্ছে। বিশেষ করে শিশু ও বয়স্কদের জন্য ডায়রিয়া প্রতিরোধ ও পানি শুদ্ধিকরণের ব্যবস্থা নেওয়া হচ্ছে।</p><p>এদিকে, শিক্ষাপ্রতিষ্ঠান ও সামাজিক সংগঠনগুলোও ত্রাণ শিবিরে সহযোগিতা জোরদার করেছে। আবহাওয়া দপ্তর বলেছে, আগামী কয়েক দিনে বৃষ্টিপাত অব্যাহত থাকতে পারে।</p>',
    },
    {
      id: 2,
      slug: 'economic-policy-boosts-export-sector',
      title: 'রফতানিমুখী নীতি নিয়ে নতুন আস্থা ফিরছে',
      subheadline: 'গার্মেন্টস ও কৃষি-ভিত্তিক রফতানি বৃদ্ধির পথে নতুন পদক্ষেপ',
      summary: 'বৈশ্বিক বাজারে চাহিদা বৃদ্ধির সঙ্গে রফতানিবান্ধব নীতিতে নতুন করে আস্থা দেখা যাচ্ছে।',
      category: 'Economy',
      author: 'মেহেদী হাসান',
      authorRole: 'অর্থনীতি সম্পাদক',
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
      date: '2026-11-10T10:00:00.000Z',
      imageCaption: 'অর্থনৈতিক কার্যক্রমে নতুন বিনিয়োগের প্রত্যাশা',
      imageCredit: 'স্টক ছবি',
      views: 14680,
      readTime: '5 min read',
      tags: ['অর্থনীতি', 'রফতানি'],
      featured: false,
      content: '<p>চীনের বাজারে নতুন চাহিদা এবং দেশের অভ্যন্তরীণ উৎপাদন বৃদ্ধির মাধ্যমে রফতানি আয় বাড়ছে।</p><p>কৃষিজাত ও পোশাক খাতে অর্ডারের সংখ্যা বেড়েছে, যা শ্রমিকদের কর্মসংস্থান ফিরিয়ে আনছে।</p><p>পর্যটন ও তথ্যপ্রযুক্তি খাতেও নতুন বিনিয়োগের সম্ভাবনা দেখা দিয়েছে।</p>',
    },
    {
      id: 3,
      slug: 'dhaka-traffic-system-modernization',
      title: 'ঢাকার ট্রাফিক ব্যবস্থায় স্মার্ট সিস্টেমের আগমন',
      subheadline: 'কৌশলগত সড়ক ও গাড়ি-নিয়ন্ত্রণ প্রকল্পের নতুন ধাপ',
      summary: 'সড়কদূর্ঘটনা কমাতে শহরের ট্রাফিক ব্যবস্থাকে স্মার্ট ব্যবস্থা দিয়ে সাজানোর উদ্যোগ নেওয়া হচ্ছে।',
      category: 'Politics',
      author: 'আনিকা রহমান',
      authorRole: 'রাজনৈতিক সংবাদদাতা',
      image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
      date: '2026-11-09T14:55:00.000Z',
      imageCaption: 'স্মার্ট ট্রাফিক ব্যবস্থাপনার জন্য সড়ক নকশা',
      imageCredit: 'শহুরে ছবি',
      views: 13240,
      readTime: '6 min read',
      tags: ['ট্রাফিক', 'রাজনীতি'],
      featured: false,
      content: '<p>ঢাকার মূল সড়কগুলোতে ইলেকট্রনিক ট্রাফিক ম্যানেজমেন্ট সিস্টেমের পরীক্ষামূলক rollout শুরু হয়েছে।</p><p>সবুজ সংকেত, জোনভিত্তিক পর্যবেক্ষণ ও দ্রুত নোটিশের মাধ্যমে যানজট কমানো সম্ভব হবে বলে সংশ্লিষ্টরা মনে করছেন।</p>',
    },
    {
      id: 4,
      slug: 'bangladesh-cricket-team-asia-cup-prep',
      title: 'এশিয়া কাপে প্রস্তুতি ত্বরান্বিত করছে বাংলাদেশ',
      subheadline: 'নতুন কোচ ও পরিকল্পনার সঙ্গেই শক্তিশালী অনুশীলন',
      summary: 'ক্রিকেট দলটি তাদের প্রস্তুতির মান উন্নত করতে ঘরোয়া ও আন্তর্জাতিক ম্যাচের তালিকা জোরদার করেছে।',
      category: 'Sports',
      author: 'তৌহিদুর রহমান',
      authorRole: 'খেলাধুলা সম্পাদক',
      image: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80',
      date: '2026-11-12T07:20:00.000Z',
      imageCaption: 'মাঠে অস্বস্তি কাটিয়ে উঠছে দল',
      imageCredit: 'সরাসরি',
      views: 16600,
      readTime: '4 min read',
      tags: ['ক্রিকেট', 'এশিয়া কাপ'],
      featured: false,
      content: '<p>বাংলাদেশ ক্রিকেট দল শারীরিক প্রস্তুতি ও ট্যাকটিক্যাল অনুশীলনে জোর দিচ্ছে।</p><p>নতুন কোচের নেতৃত্বে ব্যাটিং অর্ডার ও বোলিং ওভারের বিকল্প নিয়ে আলোচনা চলছে।</p>',
    },
    {
      id: 5,
      slug: 'tech-startups-raise-innovation-funding',
      title: 'স্টার্টআপ খাতে বিনিয়োগ বাড়ছে, উদ্ভাবন দারুণ',
      subheadline: 'স্মার্ট টেকসই পণ্য ও ডিজিটাল পরিষেবায় নতুন বিনিয়োগ',
      summary: 'বাংলাদেশের প্রযুক্তি খাত আরও দ্রুত এগোচ্ছে, নতুন স্টার্টআপে বিনিয়োগ এবং উদ্যোক্তা শক্তি বাড়ছে।',
      category: 'Technology',
      author: 'নাজমুল ইসলাম',
      authorRole: 'টেক রিপোর্টার',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      date: '2026-11-08T12:10:00.000Z',
      imageCaption: 'টেকনোলজি স্টার্টআপের মডেল এলাকায় কর্মপরিকল্পনা',
      imageCredit: 'ডিজিটাল',
      views: 20110,
      readTime: '5 min read',
      tags: ['স্টার্টআপ', 'টেকনোলজি'],
      featured: false,
      content: '<p>বাংলাদেশের টেক স্টার্টআপগুলো সফ্টওয়্যার, ইকমার্স ও স্বাস্থ্যসেবা প্রযুক্তিতে নতুন উদ্ভাবন করছে।</p><p>বিনিয়োগকারীদের আগ্রহ বাড়ায় দ্রুত করে প্রবৃদ্ধির পথ খুলে গেছে।</p>',
    },
    {
      id: 6,
      slug: 'fashion-lifestyle-shifts',
      title: 'শহুরে জীবনযাত্রায় নতুন ফ্যাশন ও লাইফস্টাইল',
      subheadline: 'স্বাস্থ্যের সঙ্গে মানানসই নতুন পোশাক ও রুটিনের ধারা',
      summary: 'ঢাকার তরুণদের পছন্দ বদলাচ্ছে, মিশ্র সংস্কৃতি ও স্বাস্থ্যকর জীবনযাত্রায় ফ্যাশনও বদলে যাচ্ছে।',
      category: 'Lifestyle',
      author: 'নুসরাত জাহান',
      authorRole: 'লাইফস্টাইল সম্পাদক',
      image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80',
      date: '2026-11-07T18:15:00.000Z',
      imageCaption: 'টেকসই ও সুন্দর জীবনধারার নতুন ধারার চিত্র',
      imageCredit: 'স্টাইল ফটো',
      views: 8705,
      readTime: '3 min read',
      tags: ['ফ্যাশন', 'লাইফস্টাইল'],
      featured: false,
      content: '<p>শহুরে নারীদের পছন্দেই এখন কমফর্ট ও স্টাইলিশ পোশাকের চাহিদা বেশি।</p><p>স্বাস্থ্যকর জীবনধারার সঙ্গে ফ্যাশন মেলানোর প্রবণতা বাড়ছে।</p>',
    },
    {
      id: 7,
      slug: 'education-access-expands',
      title: 'শিক্ষা খাতে নতুন সুযোগের দরজা খুলছে',
      subheadline: 'এইচএসসি ও বিশ্ববিদ্যালয় পর্যায়ে অনলাইন ও সেমিস্টার ভিত্তিক মূল্যায়ন',
      summary: 'শিক্ষা খাতে ডিজিটাল লার্নিং ও স্নাতকোত্তর প্রবেশে নতুন সংস্কার বাস্তবায়নের উদ্যোগ চলমান।',
      category: 'Education',
      author: 'রুমি আক্তার',
      authorRole: 'শিক্ষা রিপোর্টার',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
      date: '2026-11-05T08:42:00.000Z',
      imageCaption: 'শিক্ষার্থীদের জন্য আধুনিক পর্যায়ক্রমিক ব্যবস্থা',
      imageCredit: 'শিক্ষা ডেস্ক',
      views: 11030,
      readTime: '4 min read',
      tags: ['শিক্ষা', 'ডিজিটাল'],
      featured: false,
      content: '<p>শিক্ষা ব্যবস্থায় ডিজিটাল ও অনলাইন প্রশিক্ষণকে গুরুত্ব দেওয়া হচ্ছে।</p><p>বিভিন্ন প্রতিষ্ঠানে নির্ভরযোগ্য অনলাইন প্ল্যাটফর্ম তৈরি করা হচ্ছে।</p>',
    },
    {
      id: 8,
      slug: 'healthcare-initiatives-urban-centers',
      title: 'শহরাঞ্চলে স্বাস্থ্যসেবা সহজ করতে নতুন উদ্যোগ',
      subheadline: 'দ্রুত পরীক্ষা ও কম খরচে চিকিৎসা পরিষেবা বাড়াতে কর্মসূচি',
      summary: 'নতুন ক্লিনিক ও টেলিমেডিসিন উদ্যোগের মাধ্যমে অগ্রাধিকারভিত্তিক স্বাস্থ্যসেবা নিশ্চিত করা হচ্ছে।',
      category: 'Health',
      author: 'আসিফ মাহমুদ',
      authorRole: 'স্বাস্থ্য রিপোর্টার',
      image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80',
      date: '2026-11-04T11:20:00.000Z',
      imageCaption: 'স্বাস্থ্য পরিষেবা মডেল ও অগ্রাধিকারভিত্তিক সহায়তা',
      imageCredit: 'স্বাস্থ্য রিপোর্ট',
      views: 9450,
      readTime: '5 min read',
      tags: ['স্বাস্থ্য', 'চিকিৎসা'],
      featured: false,
      content: '<p>নতুন স্বাস্থ্য প্রকল্পের মাধ্যমে বিশেষভাবে হাই রিস্ক রোগী ও বয়স্কদের জন্য সেবা সহজ করার লক্ষ্য রয়েছে।</p><p>নির্বাচিত প্রতিষ্ঠানে টেলিমেডিসিন ও দ্রুত পরীক্ষা সেন্টার চালু হচ্ছে।</p>',
    },
    {
      id: 9,
      slug: 'entertainment-festival-calendar',
      title: 'শীতকালীন বিনোদন উৎসবের পরিকল্পনা নিয়ে চর্চা',
      subheadline: 'গান, সিনেমা ও সাংস্কৃতিক অনুষ্ঠান নিয়ে শহরের প্রস্তুতি',
      summary: 'শহরজুড়ে বিনোদন উৎসবের সময়সূচি জারি হয়েছে, দর্শকদের জন্য নানা আয়োজনের পরিকল্পনা।',
      category: 'Entertainment',
      author: 'ফারহানা নাসরিন',
      authorRole: 'বিনোদন প্রতিবেদক',
      image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
      date: '2026-11-02T16:05:00.000Z',
      imageCaption: 'বিনোদন উৎসবের প্রস্তুতির দৃশ্য',
      imageCredit: 'মিডিয়া',
      views: 12340,
      readTime: '3 min read',
      tags: ['ফিল্ম', 'বিনোদন'],
      featured: false,
      content: '<p>বিনোদন উৎসবের আলোচনায় চলচ্চিত্র, ফটোগ্রাফি ও নৃত্যধর্মী অনুষ্ঠানকে গুরুত্ব সহকারে গ্রহণ করা হচ্ছে।</p><p>শহরের তরুণ সমাজের অংশগ্রহণের জন্য বিশেষ সেলাই করা হচ্ছে।</p>',
    },
  ],
}

const shareButtons = [
  { label: 'Share', icon: Send, color: 'bg-blue-600' },
  { label: 'World', icon: Globe, color: 'bg-sky-500' },
  { label: 'Gallery', icon: Camera, color: 'bg-pink-600' },
  { label: 'Video', icon: PlayCircle, color: 'bg-red-600' },
]

function normalizeArticle(article) {
  return {
    ...article,
    authorRole: article.authorRole || article.author_role || 'Reporter',
    imageCaption: article.imageCaption || article.image_caption || 'MK News Desk',
    imageCredit: article.imageCredit || article.image_credit || 'MK News Desk',
    date: article.date || article.published_at || new Date().toISOString(),
    readTime: article.readTime || article.read_time || '4 min read',
    tags: Array.isArray(article.tags) ? article.tags : [],
    summary: article.summary || '',
    category: article.category || 'National',
  }
}

function getStoredNews() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return defaultNews
    const parsed = JSON.parse(saved)
    if (!parsed.articles || !parsed.breakingNews) return defaultNews
    return parsed
  } catch {
    return defaultNews
  }
}

async function fetchPortalData() {
  try {
    const [categoriesRes, breakingRes, articlesRes] = await Promise.all([
      axios.get(`${API_BASE}/categories`),
      axios.get(`${API_BASE}/breaking-news`),
      axios.get(`${API_BASE}/articles`),
    ])

    const categories = categoriesRes.data?.categories?.length ? categoriesRes.data.categories : defaultNews.categories
    const breakingNews = breakingRes.data?.breakingNews?.length ? breakingRes.data.breakingNews : defaultNews.breakingNews
    const articles = (articlesRes.data?.articles ?? []).map(normalizeArticle)

    return { categories, breakingNews, articles: articles.length ? articles : defaultNews.articles }
  } catch {
    return getStoredNews()
  }
}

function formatReadableDate(dateString) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString))
}

function formatBanglaDate(dateString) {
  return new Intl.DateTimeFormat('bn-BD', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString))
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value)
}

function formatHeroDate() {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
}

function App() {
  const [newsData, setNewsData] = useState(getStoredNews)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [adminAuthenticated, setAdminAuthenticated] = useState(() => localStorage.getItem(AUTH_KEY) === 'true')

  useEffect(() => {
    let ignore = false

    fetchPortalData().then((data) => {
      if (!ignore) {
        setNewsData(data)
      }
    })

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newsData))
  }, [newsData])

  useEffect(() => {
    localStorage.setItem(AUTH_KEY, adminAuthenticated ? 'true' : 'false')
  }, [adminAuthenticated])

  const articles = newsData.articles
  const featuredArticle = articles.find((article) => article.featured) || articles[0]
  const latestArticles = [...articles].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
  const topStories = [...articles].sort((a, b) => b.views - a.views).slice(0, 4)

  const filteredArticles = useMemo(() => {
    if (!searchTerm.trim()) return articles
    const term = searchTerm.toLowerCase()
    return articles.filter((article) => {
      return (
        article.title.toLowerCase().includes(term) ||
        article.summary.toLowerCase().includes(term) ||
        article.category.toLowerCase().includes(term) ||
        article.tags.some((tag) => tag.toLowerCase().includes(term))
      )
    })
  }, [articles, searchTerm])

  const handleSaveArticle = (newArticle) => {
    setNewsData((prev) => ({
      ...prev,
      articles: [normalizeArticle(newArticle), ...prev.articles.filter((article) => article.id !== newArticle.id)],
    }))
  }

  const handleDeleteArticle = async (id) => {
    try {
      await axios.delete(`${API_BASE}/articles`, { params: { id } })
    } catch {
      // Ignore backend errors; the UI still removes the article locally to keep the demo usable.
    }

    setNewsData((prev) => ({
      ...prev,
      articles: prev.articles.filter((article) => article.id !== id),
    }))
  }

  return (
    <div className="min-h-screen bg-gray-100 text-brand-text">
      <Header
        categories={newsData.categories}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              featuredArticle={featuredArticle}
              latestArticles={latestArticles}
              topStories={topStories}
              articles={filteredArticles}
              newsData={newsData}
              searchTerm={searchTerm}
            />
          }
        />
        <Route path="/category/:categoryName" element={<CategoryPage articles={articles} />} />
        <Route path="/article/:slug" element={<NewsDetailsPage articles={articles} />} />
        <Route
          path="/admin"
          element={
            <AdminDashboard
              adminAuthenticated={adminAuthenticated}
              setAdminAuthenticated={setAdminAuthenticated}
              articles={articles}
              categories={newsData.categories}
              onSaveArticle={handleSaveArticle}
              onDeleteArticle={handleDeleteArticle}
            />
          }
        />
      </Routes>
      <Footer />
    </div>
  )
}

function Header({ categories, mobileMenuOpen, setMobileMenuOpen, searchTerm, setSearchTerm }) {
  return (
    <header className="bg-white shadow-md">
      <div className="border-b border-brand-border bg-brand-blue text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 text-xs md:text-sm">
          <div className="flex items-center gap-3">
            <Newspaper className="h-4 w-4" />
            <span>{formatBanglaDate(new Date().toISOString())}</span>
          </div>
          <div className="hidden items-center gap-4 lg:flex">
            <span className="font-medium">{formatHeroDate()}</span>
            <span className="text-brand-light">|</span>
            <span>বাংলাদেশ</span>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="rounded-full border border-white/20 p-2 transition hover:bg-white/10" aria-label="Search">
              <Search className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 text-white/90">
              <Globe className="h-4 w-4" />
              <Send className="h-4 w-4" />
              <Camera className="h-4 w-4" />
              <PlayCircle className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="rounded border border-brand-border p-2 lg:hidden"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue text-xl font-black text-white">MK</div>
              <div>
                <div className="text-2xl font-black tracking-tight text-brand-blue md:text-3xl">MK News</div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-brand-muted">Bangladesh</div>
              </div>
            </Link>
          </div>

          <div className="hidden flex-1 justify-end lg:flex">
            <div className="flex w-full max-w-md items-center gap-2 rounded border border-brand-border bg-brand-gray px-3 py-2">
              <Search className="h-4 w-4 text-brand-muted" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full bg-transparent text-sm placeholder:text-brand-muted focus:outline-none"
                placeholder="Search stories..."
              />
            </div>
          </div>

          <Link to="/admin" className="hidden rounded bg-brand-blue px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark md:inline-flex">
            Admin Panel
          </Link>
        </div>
      </div>

      <div className="border-t border-brand-border bg-brand-gray">
        <nav className="mx-auto max-w-7xl px-4">
          <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} flex-col gap-3 py-4 lg:flex lg:flex-row lg:items-center lg:justify-between lg:py-0`}>
            <div className="flex flex-wrap items-center gap-1 lg:gap-2">
              {categories.map((category) => (
                <NavLink
                  key={category}
                  to={category === 'National' ? '/' : `/category/${category.toLowerCase()}`}
                  className={({ isActive }) =>
                    `inline-flex items-center border-b-2 px-3 py-3 text-sm font-semibold transition ${
                      isActive ? 'border-brand-blue text-brand-blue' : 'border-transparent text-brand-text hover:border-brand-blue/40 hover:text-brand-blue'
                    }`
                  }
                >
                  {category}
                </NavLink>
              ))}
              <a href="#" className="inline-flex items-center border-b-2 border-transparent px-3 py-3 text-sm font-semibold text-brand-text hover:border-brand-blue/40 hover:text-brand-blue">
                More
              </a>
            </div>

            <div className="flex items-center justify-between gap-3 lg:hidden">
              <div className="flex w-full items-center gap-2 rounded border border-brand-border bg-white px-3 py-2">
                <Search className="h-4 w-4 text-brand-muted" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full bg-transparent text-sm placeholder:text-brand-muted focus:outline-none"
                  placeholder="Search..."
                />
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}

function HomePage({ featuredArticle, latestArticles, topStories, articles, newsData, searchTerm }) {
  const categories = newsData.categories || []

  return (
    <>
      <div className="border-b border-brand-border bg-brand-dark text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 text-sm">
          <div className="inline-flex items-center gap-2 rounded bg-brand-yellow px-3 py-1 font-bold text-brand-text">
            <BellRing className="h-4 w-4" />
            Breaking
          </div>
          <div className="ticker-wrap overflow-hidden whitespace-nowrap">
            <div className="ticker-track flex gap-8">
              {[...newsData.breakingNews, ...newsData.breakingNews].map((item, index) => (
                <span key={`${item.id}-${index}`} className="text-sm text-white/90">{item.title}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 rounded border border-brand-border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-blue">Advertisement</p>
              <p className="text-sm text-brand-muted">Top banner</p>
            </div>
            <div className="h-16 flex-1 rounded bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
          </div>
        </div>

        <section className="mb-8 grid gap-6 lg:grid-cols-[1.5fr_0.75fr]">
          <Link to={`/article/${featuredArticle.slug}`} className="group overflow-hidden rounded border border-brand-border bg-white shadow-news">
            <div className="relative h-[400px] overflow-hidden">
              <img src={featuredArticle.image} alt={featuredArticle.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <span className="mb-3 inline-flex rounded bg-brand-blue px-3 py-1 text-xs font-semibold uppercase tracking-wide">{featuredArticle.category}</span>
                <h1 className="text-3xl font-black leading-tight md:text-5xl">{featuredArticle.title}</h1>
                <p className="mt-3 max-w-2xl text-sm text-gray-200 md:text-base">{featuredArticle.summary}</p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs md:text-sm">
                  <span>{formatReadableDate(featuredArticle.date)}</span>
                  <span>{featuredArticle.author}</span>
                  <span>{featuredArticle.readTime}</span>
                </div>
              </div>
            </div>
          </Link>

          <div className="space-y-4">
            <SidebarStoryComponent title="Top stories" items={topStories} />
            <div className="rounded border border-brand-border bg-white p-4 shadow-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-brand-blue">Sponsored</p>
              <div className="h-44 rounded bg-gradient-to-br from-cyan-100 via-white to-sky-100 flex items-center justify-center text-xl font-bold text-brand-dark">Advertise Here</div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
          <div className="rounded border border-brand-border bg-white p-5 shadow-sm">
            <SectionTitle title="Latest News" action="View all" />
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {latestArticles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded border border-brand-border bg-white p-5 shadow-sm">
              <SectionTitle title="Most Viewed" action="Trending" />
              <div className="mt-4 space-y-4">
                {topStories.map((story, index) => (
                  <div key={story.id} className="flex gap-3 border-b border-brand-border pb-3 last:border-b-0 last:pb-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-blue text-sm font-bold text-white">{index + 1}</div>
                    <div>
                      <p className="text-sm font-bold leading-snug text-brand-text hover:text-brand-blue"><Link to={`/article/${story.slug}`}>{story.title}</Link></p>
                      <p className="mt-1 text-xs text-brand-muted">{formatNumber(story.views)} views</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded border border-brand-border bg-white p-5 shadow-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-brand-blue">Editorial</p>
              <p className="text-lg font-bold text-brand-text">A stronger, safer, and smarter Bangladesh begins with informed citizens.</p>
            </div>
          </div>
        </section>

        {searchTerm && (
          <div className="mb-5 rounded border border-brand-border bg-white px-4 py-3 text-sm text-brand-muted shadow-sm">
            Showing {articles.length} result{articles.length !== 1 ? 's' : ''} for “{searchTerm}”
          </div>
        )}

        {categories.map((category) => {
          const categoryArticles = articles.filter((article) => article.category === category).slice(0, 3)
          if (!categoryArticles.length) return null

          return (
            <section key={category} className="mb-8 rounded border border-brand-border bg-white p-5 shadow-sm">
              <SectionTitle title={category} action="Read more" link={`/category/${category.toLowerCase()}`} />
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {categoryArticles.map((article) => (
                  <NewsCard key={article.id} article={article} compact />
                ))}
              </div>
            </section>
          )
        })}

        <section className="mb-8 grid gap-6 lg:grid-cols-4">
          <SpecialFeature title="Editor's Choice" items={latestArticles.slice(0, 3)} />
          <SpecialFeature title="Photo Gallery" items={latestArticles.slice(1, 4)} />
          <SpecialFeature title="Video News" items={topStories.slice(0, 3)} />
          <SpecialFeature title="Opinion" items={latestArticles.slice(2, 5)} />
        </section>

        <div className="mb-8 rounded border border-brand-border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-center text-center text-sm text-brand-muted">
            <span className="rounded bg-slate-100 px-4 py-12 text-lg font-semibold text-brand-text">Homepage banner advertisement</span>
          </div>
        </div>
      </main>
    </>
  )
}

function CategoryPage({ articles }) {
  const { categoryName } = useParams()
  const title = categoryName
    ? categoryName.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
    : 'News'

  const items = articles.filter((article) => article.category.toLowerCase() === title.toLowerCase())

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <Helmet>
        <title>{title} | MK News</title>
      </Helmet>
      <div className="mb-6 rounded border border-brand-border bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-black text-brand-blue">{title}</h1>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </main>
  )
}

function NewsDetailsPage({ articles }) {
  const { slug } = useParams()
  const article = articles.find((item) => item.slug === slug) || articles[0]

  if (!article) {
    return <main className="mx-auto max-w-4xl px-4 py-20 text-center text-xl text-brand-muted">Article not found.</main>
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Helmet>
        <title>{article.title} | MK News</title>
      </Helmet>
      <article className="overflow-hidden rounded border border-brand-border bg-white shadow-news">
        <div className="p-6 md:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-blue">
            <span>{article.category}</span>
            <span className="text-brand-muted">•</span>
            <span>{article.readTime}</span>
          </div>
          <h1 className="text-3xl font-black leading-tight text-brand-text md:text-5xl">{article.title}</h1>
          <p className="mt-3 text-lg text-brand-muted">{article.subheadline}</p>

          <div className="mt-6 flex flex-wrap items-center gap-4 border-y border-brand-border py-4 text-sm text-brand-muted">
            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-brand-blue" /> {article.author}</div>
            <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-brand-blue" /> {formatReadableDate(article.date)}</div>
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-blue" /> {formatNumber(article.views)} views</div>
          </div>

          <div className="mt-6 overflow-hidden rounded-lg border border-brand-border">
            <img src={article.image} alt={article.title} className="h-[360px] w-full object-cover md:h-[520px]" />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-brand-muted">
            <span>{article.imageCaption}</span>
            <span>{article.imageCredit}</span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {shareButtons.map(({ label, icon: Icon, color }) => (
              <button key={label} type="button" className={`${color} inline-flex items-center gap-2 rounded px-3 py-2 text-xs font-semibold text-white`}>
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>

          <div className="prose prose-lg mt-8 max-w-none text-brand-text" dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
      </article>
    </main>
  )
}

function AdminDashboard({ adminAuthenticated, setAdminAuthenticated, articles, categories, onSaveArticle, onDeleteArticle }) {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [formError, setFormError] = useState('')
  const [draft, setDraft] = useState({
    id: '',
    slug: '',
    title: '',
    category: 'National',
    subheadline: '',
    summary: '',
    author: '',
    authorRole: 'Reporter',
    image: '',
    date: new Date().toISOString(),
    readTime: '4 min read',
    tags: 'news, update',
    content: '<p>Write your story here...</p>',
  })

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const response = await axios.post(`${API_BASE}/login`, {
        email: loginForm.email,
        password: loginForm.password,
      })

      if (response.data.success) {
        setAdminAuthenticated(true)
        setFormError('')
        return
      }
    } catch {
      // Fall through to backend validation message below.
    }

    setFormError('Invalid admin credentials. Use admin@mknews.com / MKNews@2026')
  }

  const handleDraftChange = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveDraft = async () => {
    const slug = (draft.slug || draft.title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `news-${Date.now()}`

    const article = {
      id: draft.id || Date.now(),
      slug,
      title: draft.title || 'Untitled Story',
      category: draft.category,
      subheadline: draft.subheadline,
      summary: draft.summary,
      author: draft.author || 'Staff Reporter',
      authorRole: draft.authorRole,
      image: draft.image || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80',
      date: draft.date || new Date().toISOString(),
      imageCaption: 'Administrative preview image',
      imageCredit: 'MK News Desk',
      views: 0,
      readTime: draft.readTime || '4 min read',
      tags: (draft.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean),
      featured: false,
      content: draft.content || '<p>Story content goes here.</p>',
    }

    try {
      const response = await axios.post(`${API_BASE}/articles`, article)
      const savedArticle = normalizeArticle(response.data.article || article)
      onSaveArticle(savedArticle)
    } catch {
      onSaveArticle(article)
    }

    setDraft({
      id: '',
      slug: '',
      title: '',
      category: 'National',
      subheadline: '',
      summary: '',
      author: '',
      authorRole: 'Reporter',
      image: '',
      date: new Date().toISOString(),
      readTime: '4 min read',
      tags: 'news, update',
      content: '<p>Write your story here...</p>',
    })
  }

  if (!adminAuthenticated) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20">
        <div className="rounded border border-brand-border bg-white p-8 shadow-news">
          <div className="mb-6 flex items-center gap-3 text-brand-blue">
            <ShieldCheck className="h-10 w-10" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em]">Secure Access</p>
              <h1 className="text-3xl font-black">Admin Login</h1>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-brand-text">Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                className="w-full rounded border border-brand-border bg-brand-gray px-3 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                placeholder="admin@mknews.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-brand-text">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                className="w-full rounded border border-brand-border bg-brand-gray px-3 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                placeholder="••••••••"
              />
            </div>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <button type="submit" className="w-full rounded bg-brand-blue px-4 py-3 font-bold text-white transition hover:bg-brand-dark">
              Sign In
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-3 rounded border border-brand-border bg-white p-5 shadow-sm">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-blue">Dashboard</p>
          <h1 className="text-3xl font-black text-brand-text">MK News Admin</h1>
        </div>
        <button type="button" onClick={() => setAdminAuthenticated(false)} className="rounded border border-brand-border px-3 py-2 text-sm font-semibold text-brand-text">
          Logout
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded border border-brand-border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-2xl font-black text-brand-text">Create update</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title" value={draft.title} onChange={(value) => handleDraftChange('title', value)} />
            <Field label="Slug" value={draft.slug} onChange={(value) => handleDraftChange('slug', value)} />
            <SelectField label="Category" value={draft.category} options={categories} onChange={(value) => handleDraftChange('category', value)} />
            <Field label="Author" value={draft.author} onChange={(value) => handleDraftChange('author', value)} />
            <Field label="Author Role" value={draft.authorRole} onChange={(value) => handleDraftChange('authorRole', value)} />
            <Field label="Read Time" value={draft.readTime} onChange={(value) => handleDraftChange('readTime', value)} />
            <Field label="Image URL" value={draft.image} onChange={(value) => handleDraftChange('image', value)} className="md:col-span-2" />
            <Field label="Subheadline" value={draft.subheadline} onChange={(value) => handleDraftChange('subheadline', value)} className="md:col-span-2" />
            <Field label="Summary" value={draft.summary} onChange={(value) => handleDraftChange('summary', value)} className="md:col-span-2" />
            <Field label="Tags" value={draft.tags} onChange={(value) => handleDraftChange('tags', value)} className="md:col-span-2" />
            <textarea
              value={draft.content}
              onChange={(event) => handleDraftChange('content', event.target.value)}
              className="md:col-span-2 min-h-32 w-full rounded border border-brand-border bg-brand-gray px-3 py-3 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-blue"
              placeholder="Article HTML content"
            />
          </div>

          <button type="button" onClick={handleSaveDraft} className="mt-5 rounded bg-brand-blue px-5 py-3 font-bold text-white transition hover:bg-brand-dark">
            Save Article
          </button>
        </section>

        <aside className="rounded border border-brand-border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-2xl font-black text-brand-text">Published stories</h2>
          <div className="space-y-3">
            {articles.map((article) => (
              <div key={article.id} className="rounded border border-brand-border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-brand-text">{article.title}</p>
                    <p className="text-xs text-brand-muted">{article.category}</p>
                  </div>
                  <button type="button" onClick={() => onDeleteArticle(article.id)} className="text-xs font-semibold text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  )
}

function NewsCard({ article, compact = false }) {
  return (
    <Link to={`/article/${article.slug}`} className="group overflow-hidden rounded border border-brand-border bg-white transition hover:-translate-y-1 hover:shadow-news">
      <div className="overflow-hidden">
        <img src={article.image} alt={article.title} className={`${compact ? 'h-48' : 'h-52'} w-full object-cover transition duration-300 group-hover:scale-105`} />
      </div>
      <div className="p-4">
        <div className="mb-2 inline-flex rounded bg-brand-blue px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">{article.category}</div>
        <h3 className={`font-black text-brand-text ${compact ? 'text-lg' : 'text-xl'} leading-tight`}>{article.title}</h3>
        <p className="mt-2 text-sm leading-6 text-brand-muted">{article.summary}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-brand-muted">
          <span>{article.author}</span>
          <span>{formatReadableDate(article.date)}</span>
        </div>
      </div>
    </Link>
  )
}

function SidebarStoryComponent({ title, items }) {
  return (
    <div className="rounded border border-brand-border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-black text-brand-text">{title}</h2>
        <ArrowRight className="h-4 w-4 text-brand-blue" />
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <Link key={item.id} to={`/article/${item.slug}`} className="flex gap-3">
            <img src={item.image} alt={item.title} className="h-20 w-24 rounded object-cover" />
            <div>
              <p className="text-sm font-bold leading-snug text-brand-text hover:text-brand-blue">{item.title}</p>
              <p className="mt-2 text-xs text-brand-muted">{formatReadableDate(item.date)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function SpecialFeature({ title, items }) {
  return (
    <div className="rounded border border-brand-border bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-xl font-black text-brand-text">{title}</h3>
      <div className="space-y-4">
        {items.map((item) => (
          <Link key={item.id} to={`/article/${item.slug}`} className="block border-b border-brand-border pb-3 last:border-b-0 last:pb-0">
            <p className="text-sm font-bold leading-snug text-brand-text hover:text-brand-blue">{item.title}</p>
            <p className="mt-1 text-xs text-brand-muted">{item.category}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

function SectionTitle({ title, action, link }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-brand-border pb-3">
      <h2 className="text-2xl font-black text-brand-text">{title}</h2>
      {link ? (
        <Link to={link} className="text-sm font-semibold text-brand-blue hover:text-brand-dark">{action}</Link>
      ) : (
        <span className="text-sm font-semibold text-brand-blue">{action}</span>
      )}
    </div>
  )
}

function Field({ label, value, onChange, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-semibold text-brand-text">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded border border-brand-border bg-brand-gray px-3 py-3 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-blue"
      />
    </label>
  )
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-brand-text">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded border border-brand-border bg-brand-gray px-3 py-3 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-blue"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

function Footer() {
  return (
    <footer className="mt-10 border-t border-brand-border bg-brand-dark text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
        <div>
          <h3 className="mb-4 text-xl font-black">MK News</h3>
          <p className="text-sm text-gray-300">Independent reporting for Bangladesh, covering national priorities, civic life, and major developments across the country.</p>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-brand-light">Quick links</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/category/politics">Politics</Link></li>
            <li><Link to="/category/business">Business</Link></li>
            <li><Link to="/category/sports">Sports</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-brand-light">Policies</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>About Us</li>
            <li>Privacy Policy</li>
            <li>Terms</li>
            <li>Cookie Policy</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-brand-light">Contact</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>Dhaka, Bangladesh</li>
            <li>hello@mknews.com</li>
            <li>+880 1700-000000</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-sm text-gray-300">
        © 2026 MK News. All rights reserved.
      </div>
    </footer>
  )
}

export default App
