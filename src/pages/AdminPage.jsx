import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Flame,
  PenTool,
  Camera,
  Settings,
  LogOut,
  ExternalLink,
  Eye,
  Trash2,
  Edit,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Database,
  Save,
} from 'lucide-react'
import { api } from '../api.js'
import { CATEGORIES_BN, CATEGORIES_EN, toBengaliNumber, formatRelativeTime } from '../utils.js'

export default function AdminPage({
  articles = [],
  breakingNews = [],
  opinions = [],
  photos = [],
  videos = [],
  onAddArticle,
  onUpdateArticle,
  onDeleteArticle,
  onAddBreaking,
  onDeleteBreaking,
  lang = 'bn',
}) {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'articles' | 'add' | 'breaking' | 'opinions' | 'media' | 'settings'

  // Server health state
  const [serverHealth, setServerHealth] = useState({ status: 'checking', database: 'checking' })
  const [serverStats, setServerStats] = useState(null)

  // Notification Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  const refreshStats = async () => {
    try {
      setServerStats(await api.getStats())
    } catch (err) {
      console.error('Unable to refresh dashboard statistics:', err)
    }
  }

  // --- Check Authentication on Load ---
  useEffect(() => {
    api.checkAuth().then((user) => {
      if (!user) {
        navigate('/login', { replace: true })
      } else {
        setCurrentUser(typeof user === 'object' ? user : { role: 'superadmin' })
        setAuthChecking(false)
        api.getStats()
          .then(setServerStats)
          .catch((err) => console.error('Unable to load dashboard statistics:', err))
      }
    }).catch((err) => {
      console.error('Unable to verify the admin session:', err)
      navigate('/login', { replace: true })
      setAuthChecking(false)
    })

    api.getHealth().then(setServerHealth).catch((err) => {
      console.error('Unable to check database health:', err)
      setServerHealth({ status: 'offline', database: 'unavailable' })
    })
  }, [navigate])

  // --- Article Form State ---
  const emptyArticleForm = {
    id: null,
    title_bn: '',
    title_en: '',
    subheadline_bn: '',
    subheadline_en: '',
    summary_bn: '',
    summary_en: '',
    category: 'national',
    author_bn: 'প্রথম আলো ডেস্ক',
    author_en: 'Prothom Alo Desk',
    author_role_bn: 'প্রতিবেদক',
    author_role_en: 'Staff Reporter',
    image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
    imageCaption: '',
    imageCredit: 'ছবি: প্রথম আলো',
    content_bn: '',
    content_en: '',
    featured: false,
    tags_bn: 'বাংলাদেশ, সংবাদ',
    tags_en: 'Bangladesh, News',
  }

  const [formData, setFormData] = useState(emptyArticleForm)
  const [isEditing, setIsEditing] = useState(false)

  // --- Articles List Filters ---
  const [articleSearch, setArticleSearch] = useState('')
  const [articleCategoryFilter, setArticleCategoryFilter] = useState('all')

  // --- Breaking News Form ---
  const [newBreakingBn, setNewBreakingBn] = useState('')
  const [newBreakingEn, setNewBreakingEn] = useState('')

  // Handle Logout
  const handleLogout = async () => {
    try {
      await api.logout()
      navigate('/login', { replace: true })
    } catch (err) {
      triggerToast(err.message || 'Logout failed. Please try again.', 'error')
    }
  }

  // Handle Submit Article (Add or Update)
  const handleSubmitArticle = async (e) => {
    e.preventDefault()
    if (!formData.title_bn.trim() && !formData.title_en.trim()) {
      alert(lang === 'bn' ? 'দয়া করে অন্তত একটি শিরোনাম লিখুন।' : 'Please enter at least one headline.')
      return
    }

    const tagsArrayBn = typeof formData.tags_bn === 'string'
      ? formData.tags_bn.split(',').map((t) => t.trim()).filter(Boolean)
      : formData.tags_bn
    const tagsArrayEn = typeof formData.tags_en === 'string'
      ? formData.tags_en.split(',').map((t) => t.trim()).filter(Boolean)
      : formData.tags_en

    try {
      const article = {
        ...formData,
        tags_bn: tagsArrayBn,
        tags_en: tagsArrayEn,
      }

      if (isEditing && formData.id) {
        await api.saveArticle(article, true)
        onUpdateArticle(article)
        refreshStats()
        triggerToast(lang === 'bn' ? 'সংবাদ সফলভাবে আপডেট হয়েছে!' : 'Article updated successfully!')
      } else {
        const newArticle = {
          ...article,
          slug: `news-${Date.now()}`,
          date: new Date().toISOString(),
          views: 0,
        }
        const saved = await api.saveArticle(newArticle)
        onAddArticle({ ...newArticle, id: saved.id, slug: saved.slug || newArticle.slug })
        refreshStats()
        triggerToast(lang === 'bn' ? 'নতুন সংবাদ সফলভাবে প্রকাশিত হয়েছে!' : 'New article published successfully!')
      }

      setFormData(emptyArticleForm)
      setIsEditing(false)
      setActiveTab('articles')
    } catch (err) {
      triggerToast(err.message || (lang === 'bn' ? 'সংবাদ সংরক্ষণ করা যায়নি।' : 'Unable to save article.'), 'error')
    }
  }

  // Handle Edit Action
  const handleEditClick = (article) => {
    setFormData({
      ...article,
      tags_bn: Array.isArray(article.tags_bn) ? article.tags_bn.join(', ') : (article.tags_bn || ''),
      tags_en: Array.isArray(article.tags_en) ? article.tags_en.join(', ') : (article.tags_en || ''),
    })
    setIsEditing(true)
    setActiveTab('add')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle Delete Action
  const handleDeleteArticleClick = async (id) => {
    if (confirm(lang === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই সংবাদটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this article?')) {
      try {
        await api.deleteArticle(id)
        onDeleteArticle(id)
        refreshStats()
        triggerToast(lang === 'bn' ? 'সংবাদটি মুছে ফেলা হয়েছে।' : 'Article deleted.', 'info')
      } catch (err) {
        triggerToast(err.message || (lang === 'bn' ? 'সংবাদ মুছে ফেলা যায়নি।' : 'Unable to delete article.'), 'error')
      }
    }
  }

  // Handle Breaking News Add
  const handleAddBreakingSubmit = async (e) => {
    e.preventDefault()
    if (!newBreakingBn.trim() && !newBreakingEn.trim()) return

    const newItem = {
      title_bn: newBreakingBn.trim() || newBreakingEn.trim(),
      title_en: newBreakingEn.trim() || newBreakingBn.trim(),
    }
    try {
      const saved = await api.saveBreakingNews(newItem)
      onAddBreaking(saved.item)
      refreshStats()
      setNewBreakingBn('')
      setNewBreakingEn('')
      triggerToast(lang === 'bn' ? 'ব্রেকিং নিউজ যুক্ত হয়েছে!' : 'Breaking news added!')
    } catch (err) {
      triggerToast(err.message || (lang === 'bn' ? 'ব্রেকিং নিউজ সংরক্ষণ করা যায়নি।' : 'Unable to save breaking news.'), 'error')
    }
  }

  // Handle Breaking News Delete
  const handleDeleteBreakingClick = async (id) => {
    try {
      await api.deleteBreakingNews(id)
      onDeleteBreaking(id)
      refreshStats()
      triggerToast(lang === 'bn' ? 'ব্রেকিং নিউজ সরানো হয়েছে।' : 'Breaking news item removed.', 'info')
    } catch (err) {
      triggerToast(err.message || (lang === 'bn' ? 'ব্রেকিং নিউজ সরানো যায়নি।' : 'Unable to remove breaking news.'), 'error')
    }
  }

  // Filtered Articles for Management Table
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchQ =
        !articleSearch ||
        (art.title_bn || '').toLowerCase().includes(articleSearch.toLowerCase()) ||
        (art.title_en || '').toLowerCase().includes(articleSearch.toLowerCase()) ||
        (art.author_bn || '').toLowerCase().includes(articleSearch.toLowerCase())

      const matchCat =
        articleCategoryFilter === 'all' ||
        (art.category || '').toLowerCase() === articleCategoryFilter.toLowerCase()

      return matchQ && matchCat
    })
  }, [articles, articleSearch, articleCategoryFilter])

  // Total Views Aggregation
  const totalViews = useMemo(() => {
    return articles.reduce((sum, a) => sum + (Number(a.views) || 0), 0)
  }, [articles])

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bengali text-gray-500">
        <span>যাচাই করা হচ্ছে...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-[#1a1a1a] font-bengali flex flex-col">
      {/* ================= 1. ADMIN TOP NAVBAR ================= */}
      <header className="bg-[#1a3a5c] text-white border-b-4 border-[#e30613] sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          {/* Logo & Portal title */}
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-white block" style={{ color: '#ff4d4d' }}>
                {lang === 'bn' ? 'প্রথম আলো' : 'Prothom Alo'}
              </span>
              <span className="text-[11px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded uppercase">
                CMS Admin
              </span>
            </Link>
          </div>

          {/* Center: Live Database Connection Status */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15">
              <Database size={13} className={serverHealth.database === 'connected' ? 'text-green-400' : 'text-amber-400'} />
              <span>
                {serverHealth.database === 'connected' ? (
                  <span className="text-green-300 font-semibold">MySQL Database: সংযুক্ত (Online)</span>
                ) : (
                  <span className="text-amber-300 font-semibold">Database: Offline / Unavailable</span>
                )}
              </span>
            </div>
          </div>

          {/* Right Actions: User info, View Site, Logout */}
          <div className="flex items-center gap-3 text-xs">
            {/* View Site */}
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ExternalLink size={13} />
              <span>{lang === 'bn' ? 'ওয়েবসাইট দেখুন' : 'View Site'}</span>
            </Link>

            {/* User Pill */}
            <div className="hidden sm:flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full border border-white/10">
              <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center font-bold text-[10px]">
                A
              </div>
              <span className="font-semibold text-gray-200">{currentUser?.email || 'Administrator'}</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-bold transition-colors"
              title="Logout"
            >
              <LogOut size={13} />
              <span>{lang === 'bn' ? 'লগআউট' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toast Alert */}
      {toast.show && (
        <div className="fixed top-16 right-4 z-50 p-4 bg-white border border-gray-200 rounded-lg shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-2">
          {toast.type === 'error' ? (
            <AlertCircle size={16} className="text-red-600" />
          ) : toast.type === 'info' ? (
            <AlertCircle size={16} className="text-amber-500" />
          ) : (
            <CheckCircle2 size={16} className="text-green-600" />
          )}
          <span className={toast.type === 'error' ? 'text-red-800' : 'text-gray-800'}>{toast.message}</span>
        </div>
      )}

      {/* ================= 2. DASHBOARD BODY (SIDEBAR + CONTENT) ================= */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT NAVIGATION SIDEBAR (3 cols) */}
        <aside className="lg:col-span-3 space-y-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 space-y-1">
            {[
              { id: 'overview', icon: <LayoutDashboard size={16} />, bn: 'ড্যাশবোর্ড ওভারভিউ', en: 'Dashboard Overview' },
              { id: 'articles', icon: <FileText size={16} />, bn: `সংবাদ তালিকা (${toBengaliNumber(articles.length)})`, en: `Articles (${articles.length})` },
              { id: 'add', icon: <PlusCircle size={16} />, bn: isEditing ? 'সংবাদ সম্পাদনা' : 'নতুন সংবাদ লিখুন', en: isEditing ? 'Edit Article' : 'Write New Article' },
              { id: 'breaking', icon: <Flame size={16} />, bn: `ব্রেকিং নিউজ (${toBengaliNumber(breakingNews.length)})`, en: `Breaking Ticker (${breakingNews.length})` },
              { id: 'opinions', icon: <PenTool size={16} />, bn: `কলাম ও মতামত (${toBengaliNumber(opinions.length)})`, en: `Opinions (${opinions.length})` },
              { id: 'media', icon: <Camera size={16} />, bn: 'ছবি ও ভিডিও গ্যালারি', en: 'Photos & Videos' },
              { id: 'settings', icon: <Settings size={16} />, bn: 'সেটিংস ও ব্যাকআপ', en: 'Settings & DB Backup' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'add' && activeTab !== 'add') {
                    setIsEditing(false)
                    setFormData(emptyArticleForm)
                  }
                  setActiveTab(tab.id)
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all text-left ${
                  activeTab === tab.id
                    ? 'bg-red-50 text-[#e30613] border-l-4 border-l-[#e30613] shadow-2xs'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-red-600'
                }`}
              >
                <span className={activeTab === tab.id ? 'text-[#e30613]' : 'text-gray-400'}>{tab.icon}</span>
                <span>{lang === 'bn' ? tab.bn : tab.en}</span>
              </button>
            ))}
          </div>

          {/* Quick Help Card */}
          <div className="bg-[#1a3a5c] text-white p-4 rounded-xl text-xs space-y-2 shadow-sm">
            <h4 className="font-bold flex items-center gap-1.5 text-red-400">
              <Sparkles size={14} />
              <span>{lang === 'bn' ? 'সিস্টেম সহায়তা' : 'System Quick Guide'}</span>
            </h4>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              {lang === 'bn'
                ? 'সংবাদ বা ব্রেকিং নিউজ সংরক্ষণ করলে তা সরাসরি ডাটাবেজ এবং লোকালস্টোরেজে সিঙ্ক হয়ে ফ্রন্টএন্ডে প্রদর্শিত হবে।'
                : 'Saving changes immediately synchronizes with the database and local storage for instant frontend reflection.'}
            </p>
          </div>
        </aside>

        {/* RIGHT MAIN WORKSPACE (9 cols) */}
        <main className="lg:col-span-9 space-y-6">
          {/* ================= TAB 1: OVERVIEW METRICS ================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block">{lang === 'bn' ? 'মোট সংবাদ' : 'Total Articles'}</span>
                    <span className="text-2xl font-black text-gray-900 mt-1 block">{toBengaliNumber(serverStats?.totalArticles ?? articles.length)}</span>
                  </div>
                  <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileText size={22} />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block">{lang === 'bn' ? 'মোট পাঠক ভিউ' : 'Total Views'}</span>
                    <span className="text-2xl font-black text-[#e30613] mt-1 block">{toBengaliNumber(serverStats?.totalViews ?? totalViews)}</span>
                  </div>
                  <div className="w-11 h-11 rounded-lg bg-red-50 text-[#e30613] flex items-center justify-center">
                    <TrendingUp size={22} />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block">{lang === 'bn' ? 'ব্রেকিং নিউজ' : 'Breaking Tickers'}</span>
                    <span className="text-2xl font-black text-amber-600 mt-1 block">{toBengaliNumber(serverStats?.totalBreaking ?? breakingNews.length)}</span>
                  </div>
                  <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Flame size={22} />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block">{lang === 'bn' ? 'সংবাদ বিভাগ' : 'Active Categories'}</span>
                    <span className="text-2xl font-black text-green-600 mt-1 block">{toBengaliNumber(serverStats?.categoriesCount ?? 12)}</span>
                  </div>
                  <div className="w-11 h-11 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                    <Database size={22} />
                  </div>
                </div>
              </div>

              {/* Quick Launch Buttons */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{lang === 'bn' ? 'তাত্ক্ষণিক অ্যাকশন' : 'Quick Actions'}</h3>
                  <p className="text-xs text-gray-500">{lang === 'bn' ? 'সরাসরি নতুন সংবাদ তৈরি করুন বা ব্রেকিং স্ট্রিপ আপডেট করুন' : 'Create new story or update breaking news ticker'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setIsEditing(false); setFormData(emptyArticleForm); setActiveTab('add') }}
                    className="flex items-center gap-1.5 bg-[#e30613] hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    <PlusCircle size={14} />
                    <span>{lang === 'bn' ? 'নতুন সংবাদ লিখুন' : 'New Article'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('breaking')}
                    className="flex items-center gap-1.5 bg-[#1a3a5c] hover:bg-[#132840] text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    <Flame size={14} />
                    <span>{lang === 'bn' ? 'ব্রেকিং আপডেট' : 'Breaking News'}</span>
                  </button>
                </div>
              </div>

              {/* Recent 5 Articles Table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                  <h3 className="font-bold text-sm text-gray-800">{lang === 'bn' ? 'সর্বশেষ প্রকাশিত সংবাদ' : 'Recent Articles'}</h3>
                  <button onClick={() => setActiveTab('articles')} className="text-xs text-red-600 font-bold hover:underline">
                    {lang === 'bn' ? 'সব সংবাদ দেখুন →' : 'View All →'}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-600">
                    <thead className="bg-gray-100 text-gray-700 uppercase font-bold border-b">
                      <tr>
                        <th className="p-3 w-14">ছবি</th>
                        <th className="p-3">শিরোনাম</th>
                        <th className="p-3 w-28">বিভাগ</th>
                        <th className="p-3 w-20 text-center">ভিউ</th>
                        <th className="p-3 w-24 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {articles.slice(0, 5).map((art) => (
                        <tr key={art.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3">
                            <img src={art.image} alt="" className="w-10 h-8 object-cover rounded bg-gray-100" />
                          </td>
                          <td className="p-3 font-semibold text-gray-900">
                            <Link to={`/article/${art.slug}`} target="_blank" className="hover:text-red-600 line-clamp-1">
                              {lang === 'bn' ? art.title_bn : art.title_en}
                            </Link>
                          </td>
                          <td className="p-3">
                            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded font-bold">
                              {lang === 'bn' ? (CATEGORIES_BN[art.category] || art.category) : art.category}
                            </span>
                          </td>
                          <td className="p-3 text-center font-bold text-gray-800">{toBengaliNumber(art.views || 0)}</td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => handleEditClick(art)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                                <Edit size={14} />
                              </button>
                              <button onClick={() => handleDeleteArticleClick(art.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: ARTICLES MANAGEMENT LIST ================= */}
          {activeTab === 'articles' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Header and filters */}
              <div className="p-4 border-b bg-gray-50 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-gray-800">{lang === 'bn' ? 'সকল সংবাদের তালিকা' : 'All Published Articles'}</h3>
                  <span className="text-[11px] text-gray-500">
                    {lang === 'bn' ? `মোট ${toBengaliNumber(filteredArticles.length)} টি সংবাদ পাওয়া গেছে` : `Total ${filteredArticles.length} articles found`}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* Category Filter */}
                  <select
                    value={articleCategoryFilter}
                    onChange={(e) => setArticleCategoryFilter(e.target.value)}
                    className="p-2 border rounded bg-white font-bengali"
                  >
                    <option value="all">{lang === 'bn' ? 'সকল বিভাগ' : 'All Categories'}</option>
                    {Object.keys(CATEGORIES_BN).map((cat) => (
                      <option key={cat} value={cat}>
                        {lang === 'bn' ? CATEGORIES_BN[cat] : CATEGORIES_EN[cat]}
                      </option>
                    ))}
                  </select>

                  {/* Search box */}
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder={lang === 'bn' ? 'খুঁজুন...' : 'Search...'}
                      value={articleSearch}
                      onChange={(e) => setArticleSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 border rounded text-xs bg-white focus:ring-1 focus:ring-red-500 outline-none"
                    />
                  </div>

                  {/* Add button */}
                  <button
                    onClick={() => { setIsEditing(false); setFormData(emptyArticleForm); setActiveTab('add') }}
                    className="flex items-center gap-1 bg-[#e30613] hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded transition-colors"
                  >
                    <PlusCircle size={14} />
                    <span>{lang === 'bn' ? 'নতুন যোগ' : 'Add New'}</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-100 text-gray-700 uppercase font-bold border-b">
                    <tr>
                      <th className="p-3 w-16">ছবি</th>
                      <th className="p-3">শিরোনাম (বাংলা / English)</th>
                      <th className="p-3 w-28">বিভাগ</th>
                      <th className="p-3 w-28">তারিখ</th>
                      <th className="p-3 w-20 text-center">ভিউ</th>
                      <th className="p-3 w-24 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredArticles.map((art) => (
                      <tr key={art.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3">
                          <img src={art.image} alt="" className="w-12 h-9 object-cover rounded bg-gray-100" />
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-gray-900 leading-snug line-clamp-1">{art.title_bn}</p>
                          {art.title_en && <p className="text-[11px] text-gray-400 font-sans line-clamp-1">{art.title_en}</p>}
                          {art.featured && (
                            <span className="inline-block mt-1 text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded">
                              ⭐ Lead Story
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="bg-red-50 text-[#e30613] px-2 py-0.5 rounded font-bold">
                            {lang === 'bn' ? (CATEGORIES_BN[art.category] || art.category) : art.category}
                          </span>
                        </td>
                        <td className="p-3 text-gray-400">{formatRelativeTime(art.date, lang)}</td>
                        <td className="p-3 text-center font-bold text-gray-800">{toBengaliNumber(art.views || 0)}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Link to={`/article/${art.slug}`} target="_blank" className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="View Article">
                              <Eye size={14} />
                            </Link>
                            <button onClick={() => handleEditClick(art)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteArticleClick(art.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 3: WRITE OR EDIT ARTICLE ================= */}
          {activeTab === 'add' && (
            <form onSubmit={handleSubmitArticle} className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {isEditing ? (lang === 'bn' ? 'সংবাদ সম্পাদনা' : 'Edit Article') : (lang === 'bn' ? 'নতুন সংবাদ তৈরি করুন' : 'Create New Article')}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {lang === 'bn' ? 'বাংলা এবং ইংরেজি উভয় ভাষায় সংবাদ যোগ করতে পারেন।' : 'Fill in both Bengali and English content for full bilingual support.'}
                  </p>
                </div>
                {isEditing && (
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded">
                    Editing ID #{formData.id}
                  </span>
                )}
              </div>

              {/* Title BN & EN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'bn' ? 'সংবাদ শিরোনাম (বাংলা) *' : 'Headline (Bangla) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title_bn}
                    onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
                    placeholder="বাংলা শিরোনাম লিখুন..."
                    className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'bn' ? 'সংবাদ শিরোনাম (English)' : 'Headline (English)'}
                  </label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    placeholder="Headline in English..."
                    className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-sans"
                  />
                </div>
              </div>

              {/* Subheadline BN & EN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'bn' ? 'উপ-শিরোনাম (বাংলা)' : 'Sub-headline (Bangla)'}
                  </label>
                  <input
                    type="text"
                    value={formData.subheadline_bn}
                    onChange={(e) => setFormData({ ...formData, subheadline_bn: e.target.value })}
                    placeholder="সংক্ষিপ্ত উপ-শিরোনাম..."
                    className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'bn' ? 'উপ-শিরোনাম (English)' : 'Sub-headline (English)'}
                  </label>
                  <input
                    type="text"
                    value={formData.subheadline_en}
                    onChange={(e) => setFormData({ ...formData, subheadline_en: e.target.value })}
                    placeholder="Sub-headline in English..."
                    className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-sans"
                  />
                </div>
              </div>

              {/* Category, Author & Featured */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'bn' ? 'বিভাগ নির্বাচন করুন *' : 'Select Category *'}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white font-bengali"
                  >
                    {Object.keys(CATEGORIES_BN).map((cat) => (
                      <option key={cat} value={cat}>
                        {lang === 'bn' ? CATEGORIES_BN[cat] : CATEGORIES_EN[cat]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'bn' ? 'প্রতিবেদক / লেখকের নাম' : 'Author Name'}
                  </label>
                  <input
                    type="text"
                    value={formData.author_bn}
                    onChange={(e) => setFormData({ ...formData, author_bn: e.target.value })}
                    placeholder="প্রথম আলো ডেস্ক"
                    className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'bn' ? 'প্রতিবেদকের পদবী' : 'Author Role'}
                  </label>
                  <input
                    type="text"
                    value={formData.author_role_bn}
                    onChange={(e) => setFormData({ ...formData, author_role_bn: e.target.value })}
                    placeholder="প্রতিবেদক"
                    className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>

              {/* Image URL & Preview */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {lang === 'bn' ? 'ছবির লিঙ্ক (Image URL) *' : 'Image URL *'}
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="url"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-sans"
                  />
                  {formData.image && (
                    <img src={formData.image} alt="Preview" className="w-16 h-12 object-cover rounded border flex-shrink-0" />
                  )}
                </div>
              </div>

              {/* Summary BN & EN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'bn' ? 'সংক্ষিপ্ত সারসংক্ষেপ (বাংলা)' : 'Summary / Excerpt (Bangla)'}
                  </label>
                  <textarea
                    rows="3"
                    value={formData.summary_bn}
                    onChange={(e) => setFormData({ ...formData, summary_bn: e.target.value })}
                    placeholder="১-২ লাইনের সারসংক্ষেপ..."
                    className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'bn' ? 'সংক্ষিপ্ত সারসংক্ষেপ (English)' : 'Summary / Excerpt (English)'}
                  </label>
                  <textarea
                    rows="3"
                    value={formData.summary_en}
                    onChange={(e) => setFormData({ ...formData, summary_en: e.target.value })}
                    placeholder="Summary in English..."
                    className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-sans"
                  />
                </div>
              </div>

              {/* Full Content BN */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {lang === 'bn' ? 'মূল সংবাদ বিস্তারিত (বাংলা) *' : 'Full Content Body (Bangla) *'}
                </label>
                <textarea
                  rows="7"
                  required
                  value={formData.content_bn}
                  onChange={(e) => setFormData({ ...formData, content_bn: e.target.value })}
                  placeholder="<p>এখানে অনুচ্ছেদ ও বিস্তারিত বিবরণ লিখুন...</p>"
                  className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-bengali leading-relaxed"
                />
              </div>

              {/* Full Content EN */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {lang === 'bn' ? 'মূল সংবাদ বিস্তারিত (English)' : 'Full Content Body (English)'}
                </label>
                <textarea
                  rows="6"
                  value={formData.content_en}
                  onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                  placeholder="<p>Full article body in English...</p>"
                  className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-sans leading-relaxed"
                />
              </div>

              {/* Tags & Featured Lead Toggle */}
              <div className="p-4 bg-gray-50 rounded-lg border flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 min-w-[260px]">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === 'bn' ? 'ট্যাগসমূহ (কমা দিয়ে পৃথক করুন)' : 'Tags (comma separated)'}
                  </label>
                  <input
                    type="text"
                    value={formData.tags_bn}
                    onChange={(e) => setFormData({ ...formData, tags_bn: e.target.value })}
                    placeholder="বন্যা, ত্রাণ, জাতীয়"
                    className="w-full text-xs p-2.5 border rounded bg-white outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featLead"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <label htmlFor="featLead" className="text-xs font-bold text-gray-800 cursor-pointer">
                    {lang === 'bn' ? '⭐ প্রধান সংবাদ (Lead Story) হিসেবে দেখান' : '⭐ Display as Lead Story'}
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-[#e30613] hover:bg-red-700 text-white font-bold text-sm px-6 py-3 rounded-lg transition-colors shadow"
                >
                  <Save size={16} />
                  <span>{isEditing ? (lang === 'bn' ? 'আপডেট সংরক্ষণ করুন' : 'Save Updates') : (lang === 'bn' ? 'সংবাদ প্রকাশ করুন' : 'Publish Article')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setFormData(emptyArticleForm); setActiveTab('articles') }}
                  className="px-5 py-3 rounded-lg border text-xs font-semibold text-gray-700 hover:bg-gray-100"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
              </div>
            </form>
          )}

          {/* ================= TAB 4: BREAKING NEWS TICKER MANAGER ================= */}
          {activeTab === 'breaking' && (
            <div className="space-y-6">
              {/* Form */}
              <form onSubmit={handleAddBreakingSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b pb-3 text-red-600 font-bold">
                  <Flame size={18} />
                  <span>{lang === 'bn' ? 'নতুন ব্রেকিং নিউজ যোগ করুন' : 'Add New Breaking News'}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {lang === 'bn' ? 'ব্রেকিং হেডলাইন (বাংলা) *' : 'Breaking Headline (Bangla) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newBreakingBn}
                      onChange={(e) => setNewBreakingBn(e.target.value)}
                      placeholder="ব্রেকিং নিউজ লিখুন..."
                      className="w-full text-xs p-3 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {lang === 'bn' ? 'ব্রেকিং হেডলাইন (English)' : 'Breaking Headline (English)'}
                    </label>
                    <input
                      type="text"
                      value={newBreakingEn}
                      onChange={(e) => setNewBreakingEn(e.target.value)}
                      placeholder="Breaking news headline in English..."
                      className="w-full text-xs p-3 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none font-sans"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-[#e30613] hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors shadow"
                >
                  {lang === 'bn' ? 'ব্রেকিং প্রকাশ করুন' : 'Publish Breaking News'}
                </button>
              </form>

              {/* Active Items */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold text-sm text-gray-800 mb-4 border-b pb-2">
                  {lang === 'bn' ? `চলমান ব্রেকিং স্ট্রিপ (${toBengaliNumber(breakingNews.length)} টি)` : `Active Breaking Items (${breakingNews.length})`}
                </h4>
                <div className="divide-y divide-gray-100">
                  {breakingNews.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse flex-shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900">{item.title_bn}</p>
                          {item.title_en && <p className="text-[11px] text-gray-400 font-sans">{item.title_en}</p>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteBreakingClick(item.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: OPINIONS MANAGEMENT ================= */}
          {activeTab === 'opinions' && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-sm text-gray-800">{lang === 'bn' ? 'কলাম ও মতামত তালিকা' : 'Opinion & Columnist Articles'}</h3>
                <span className="text-xs text-gray-500">{lang === 'bn' ? `মোট ${toBengaliNumber(opinions.length)} টি মতামত` : `Total ${opinions.length} pieces`}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {opinions.map((op) => (
                  <div key={op.id} className="p-4 rounded-lg border border-gray-200 flex gap-3 items-start">
                    <img src={op.author_image} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-red-500" />
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">{lang === 'bn' ? op.author_bn : op.author_en}</h4>
                      <p className="text-[10px] text-red-600 font-semibold">{lang === 'bn' ? op.author_role_bn : op.author_role_en}</p>
                      <h5 className="font-bold text-xs text-gray-800 mt-1 line-clamp-1">{lang === 'bn' ? op.title_bn : op.title_en}</h5>
                      <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{lang === 'bn' ? op.summary_bn : op.summary_en}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 6: MULTIMEDIA ================= */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              {/* Photos */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-sm text-gray-800 border-b pb-2 mb-4">{lang === 'bn' ? 'আলোকচিত্র গ্যালারি' : 'Photo Gallery Items'}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {photos.map((ph) => (
                    <div key={ph.id} className="rounded-lg overflow-hidden border">
                      <img src={ph.image} alt="" className="w-full h-24 object-cover" />
                      <div className="p-2 text-[11px]">
                        <p className="font-bold text-gray-900 truncate">{lang === 'bn' ? ph.title_bn : ph.title_en}</p>
                        <p className="text-gray-400 text-[10px] truncate">{lang === 'bn' ? ph.credit_bn : ph.credit_en}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Videos */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-sm text-gray-800 border-b pb-2 mb-4">{lang === 'bn' ? 'ভিডিও প্রতিবেদন' : 'Video Reports'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {videos.map((v) => (
                    <div key={v.id} className="rounded-lg overflow-hidden border p-3 flex gap-3">
                      <img src={v.thumb} alt="" className="w-20 h-14 object-cover rounded" />
                      <div className="text-xs">
                        <p className="font-bold text-gray-900 line-clamp-2">{lang === 'bn' ? v.title_bn : v.title_en}</p>
                        <span className="text-[10px] text-red-600 font-bold block mt-1">Duration: {v.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 7: SETTINGS & BACKUP ================= */}
          {activeTab === 'settings' && (
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-3">
                {lang === 'bn' ? 'সিস্টেম সেটিংস ও ডাটাবেজ তথ্য' : 'System Settings & Database Config'}
              </h3>

              {/* Database Status Card */}
              <div className="p-4 bg-gray-50 rounded-lg border space-y-2 text-xs">
                <h4 className="font-bold text-gray-800 text-sm">{lang === 'bn' ? 'ডাটাবেজ ও সার্ভার স্ট্যাটাস' : 'Database & Server Status'}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-white rounded border">
                    <span className="text-gray-500 block">Database Status:</span>
                    <span className={`font-bold text-sm ${serverHealth.database === 'connected' ? 'text-green-700' : 'text-red-700'}`}>
                      {serverHealth.database === 'connected' ? 'Connected (MySQL)' : 'Not connected'}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <span className="text-gray-500 block">PHP Engine Version:</span>
                    <span className="font-bold text-gray-800 text-sm">{serverHealth.php || 'Unavailable'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
