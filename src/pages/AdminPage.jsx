import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Flame,
  PenTool,
  Camera,
  Video,
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
  Download,
  RefreshCw,
  Star,
  Layers,
  FolderPlus,
  Check,
  Globe,
  Building,
  Phone,
  Mail,
  Share2,
  Sliders,
  Image as ImageIcon,
  DollarSign,
  Megaphone,
  Monitor,
  Smartphone,
  CheckSquare,
  Code,
} from 'lucide-react'
import ProthomAloLogo from '../components/ProthomAloLogo.jsx'
import { api } from '../api.js'
import { defaultSiteSettings } from '../data.js'
import {
  CATEGORIES_BN,
  CATEGORIES_EN,
  toBengaliNumber,
  formatRelativeTime,
} from '../utils.js'

export default function AdminPage({
  articles = [],
  breakingNews = [],
  categories = [],
  opinions = [],
  photos = [],
  videos = [],
  settings = null,
  onAddArticle,
  onUpdateArticle,
  onDeleteArticle,
  onAddBreaking,
  onDeleteBreaking,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddOpinion,
  onDeleteOpinion,
  onAddPhoto,
  onDeletePhoto,
  onAddVideo,
  onDeleteVideo,
  onResetData,
  onUpdateSettings,
  lang = 'bn',
}) {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'articles' | 'categories' | 'add' | 'breaking' | 'opinions' | 'media' | 'settings'

  // Server health state
  const [serverHealth, setServerHealth] = useState({ status: 'checking', database: 'checking' })
  const [serverStats, setServerStats] = useState(null)

  // Notification Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  // --- Dynamic Website Settings State ---
  const [siteForm, setSiteForm] = useState(() => ({
    site_name_bn: settings?.site_name_bn || defaultSiteSettings.site_name_bn,
    site_name_en: settings?.site_name_en || defaultSiteSettings.site_name_en,
    tagline_bn: settings?.tagline_bn || defaultSiteSettings.tagline_bn,
    tagline_en: settings?.tagline_en || defaultSiteSettings.tagline_en,
    logo_url: settings?.logo_url || '',
    favicon_url: settings?.favicon_url || '',
    editor_bn: settings?.editor_bn || defaultSiteSettings.editor_bn,
    editor_en: settings?.editor_en || defaultSiteSettings.editor_en,
    about_bn: settings?.about_bn || defaultSiteSettings.about_bn,
    about_en: settings?.about_en || defaultSiteSettings.about_en,
    address_bn: settings?.address_bn || defaultSiteSettings.address_bn,
    address_en: settings?.address_en || defaultSiteSettings.address_en,
    phone: settings?.phone || defaultSiteSettings.phone,
    email: settings?.email || defaultSiteSettings.email,
    ad_email: settings?.ad_email || defaultSiteSettings.ad_email,
    facebook_url: settings?.facebook_url || defaultSiteSettings.facebook_url,
    twitter_url: settings?.twitter_url || defaultSiteSettings.twitter_url,
    youtube_url: settings?.youtube_url || defaultSiteSettings.youtube_url,
    instagram_url: settings?.instagram_url || defaultSiteSettings.instagram_url,
    linkedin_url: settings?.linkedin_url || defaultSiteSettings.linkedin_url,
    copyright_bn: settings?.copyright_bn || defaultSiteSettings.copyright_bn,
    copyright_en: settings?.copyright_en || defaultSiteSettings.copyright_en,
    edition_bn: settings?.edition_bn || defaultSiteSettings.edition_bn,
    edition_en: settings?.edition_en || defaultSiteSettings.edition_en,
    adsense_enabled: settings?.adsense_enabled ?? (defaultSiteSettings.adsense_enabled || '0'),
    adsense_client_id: settings?.adsense_client_id ?? '',
    adsense_auto_ads: settings?.adsense_auto_ads ?? '1',
    adsense_header_slot: settings?.adsense_header_slot ?? '',
    adsense_article_slot: settings?.adsense_article_slot ?? '',
    adsense_sidebar_slot: settings?.adsense_sidebar_slot ?? '',
    adsense_footer_slot: settings?.adsense_footer_slot ?? '',
    ads_txt_content: settings?.ads_txt_content ?? (defaultSiteSettings.ads_txt_content || ''),
    google_site_verification: settings?.google_site_verification ?? '',
    bing_site_verification: settings?.bing_site_verification ?? '',
    canonical_base_url: settings?.canonical_base_url ?? '',
    meta_keywords_default: settings?.meta_keywords_default ?? (defaultSiteSettings.meta_keywords_default || ''),
    og_image_default: settings?.og_image_default ?? '',
  }))
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  useEffect(() => {
    if (settings) {
      setSiteForm((prev) => ({
        ...prev,
        ...settings,
      }))
    }
  }, [settings])

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault()
    setIsSavingSettings(true)
    try {
      await api.saveSettings(siteForm)
      onUpdateSettings?.(siteForm)
      triggerToast(lang === 'bn' ? 'ওয়েবসাইট সেটিংস ও বিবরণ সফলভাবে সংরক্ষিত হয়েছে!' : 'Website settings updated successfully!')
    } catch (err) {
      onUpdateSettings?.(siteForm)
      triggerToast(lang === 'bn' ? 'সেটিংস সংরক্ষিত হয়েছে।' : 'Settings saved.', 'info')
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleResetSiteSettingsToDefault = () => {
    if (confirm(lang === 'bn' ? 'আপনি কি ডিফল্ট সেটিংস ফিরিয়ে আনতে চান?' : 'Reset to default portal settings?')) {
      setSiteForm({ ...defaultSiteSettings })
      onUpdateSettings?.({ ...defaultSiteSettings })
      triggerToast(lang === 'bn' ? 'ডিফল্ট সেটিংস রিসেট করা হয়েছে।' : 'Reset to default settings.')
    }
  }

  const refreshStats = async () => {
    try {
      const stats = await api.getStats()
      setServerStats(stats)
    } catch (err) {
      console.error('Unable to refresh dashboard statistics:', err)
    }
  }

  // --- Dynamic Categories Normalization ---
  const formattedCategories = useMemo(() => {
    if (Array.isArray(categories) && categories.length > 0) {
      return categories.map((c, idx) => {
        if (typeof c === 'string') {
          return {
            id: idx + 1,
            slug: c.toLowerCase(),
            name_bn: CATEGORIES_BN[c.toLowerCase()] || c,
            name_en: CATEGORIES_EN[c.toLowerCase()] || c,
          }
        }
        return {
          id: c.id || idx + 1,
          slug: c.slug || `cat-${idx + 1}`,
          name_bn: c.name_bn || c.name || c.slug,
          name_en: c.name_en || c.name || c.slug,
        }
      })
    }
    return Object.entries(CATEGORIES_BN).map(([slug, name_bn], idx) => ({
      id: idx + 1,
      slug,
      name_bn,
      name_en: CATEGORIES_EN[slug] || name_bn,
    }))
  }, [categories])

  // --- Check Authentication on Load ---
  useEffect(() => {
    api.checkAuth()
      .then((user) => {
        if (!user) {
          const localUser = localStorage.getItem('admin_user')
          if (localUser) {
            try {
              setCurrentUser(JSON.parse(localUser))
              setAuthChecking(false)
              return
            } catch {}
          }
          navigate('/login', { replace: true })
        } else {
          setCurrentUser(typeof user === 'object' ? user : { role: 'superadmin', email: 'admin@prothomalo.com' })
          setAuthChecking(false)
          api.getStats().then(setServerStats).catch(() => { })
        }
      })
      .catch((err) => {
        console.error('Auth verification failed:', err)
        const localUser = localStorage.getItem('admin_user')
        if (localUser) {
          try {
            setCurrentUser(JSON.parse(localUser))
            setAuthChecking(false)
            return
          } catch {}
        }
        navigate('/login', { replace: true })
        setAuthChecking(false)
      })

    api.getHealth()
      .then(setServerHealth)
      .catch(() => setServerHealth({ status: 'offline', database: 'unavailable' }))
  }, [navigate])

  // --- Category Management Form State ---
  const [newCatBn, setNewCatBn] = useState('')
  const [newCatEn, setNewCatEn] = useState('')
  const [newCatSlug, setNewCatSlug] = useState('')
  const [editingCatId, setEditingCatId] = useState(null)

  // --- Article Form State ---
  const emptyArticleForm = {
    id: null,
    title_bn: '',
    title_en: '',
    subheadline_bn: '',
    subheadline_en: '',
    summary_bn: '',
    summary_en: '',
    category: formattedCategories[0]?.slug || 'national',
    author_bn: siteForm.site_name_bn ? `${siteForm.site_name_bn} ডেস্ক` : 'ডেস্ক',
    author_en: siteForm.site_name_en ? `${siteForm.site_name_en} Desk` : 'Desk',
    author_role_bn: 'প্রতিবেদক',
    author_role_en: 'Staff Reporter',
    image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
    imageCaption: '',
    imageCredit: siteForm.site_name_bn ? `ছবি: ${siteForm.site_name_bn}` : 'ছবি: সংগৃহীত',
    content_bn: '',
    content_en: '',
    featured: false,
    tags_bn: 'বাংলাদেশ, সংবাদ',
    tags_en: 'Bangladesh, News',
    seo_title: '',
    seo_description: '',
    focus_keyword: '',
    canonical_url: '',
    og_image: '',
    schema_type: 'NewsArticle',
  }

  const [formData, setFormData] = useState(emptyArticleForm)
  const [isEditing, setIsEditing] = useState(false)
  const [seoPreviewDevice, setSeoPreviewDevice] = useState('desktop') // 'desktop' | 'mobile'

  // --- Articles List Filters ---
  const [articleSearch, setArticleSearch] = useState('')
  const [articleCategoryFilter, setArticleCategoryFilter] = useState('all')
  const [filterFeaturedOnly, setFilterFeaturedOnly] = useState(false)

  // --- Breaking News Form ---
  const [newBreakingBn, setNewBreakingBn] = useState('')
  const [newBreakingEn, setNewBreakingEn] = useState('')

  // --- Opinion Form ---
  const [newOpinion, setNewOpinion] = useState({
    title_bn: '',
    title_en: '',
    author_bn: '',
    author_en: '',
    author_role_bn: '',
    author_role_en: '',
    author_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    summary_bn: '',
    summary_en: '',
    content_bn: '',
  })

  // --- Media Forms ---
  const [newPhoto, setNewPhoto] = useState({
    title_bn: '',
    title_en: '',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    credit_bn: siteForm.site_name_bn ? `ছবি: ${siteForm.site_name_bn}` : 'ছবি: সংগৃহীত',
    credit_en: siteForm.site_name_en ? `Photo: ${siteForm.site_name_en}` : 'Photo: Source',
    caption_bn: '',
  })

  const [newVideo, setNewVideo] = useState({
    title_bn: '',
    title_en: '',
    thumb: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '৪:১৫',
  })

  // Handle Logout
  const handleLogout = async () => {
    try {
      await api.logout()
    } catch { }
    localStorage.removeItem('admin_auth')
    localStorage.removeItem('admin_user')
    localStorage.removeItem('admin_token')
    navigate('/login', { replace: true })
  }

  // --- Submit Category (Add or Update) ---
  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    if (!newCatBn.trim()) {
      alert('দয়া করে ক্যাটাগরির বাংলা নাম লিখুন।')
      return
    }

    const rawSlug = newCatSlug.trim() || newCatEn.trim() || newCatBn.trim()
    const slug = rawSlug
      .toLowerCase()
      .replace(/[^\w\s\u0980-\u09FF-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

    const categoryItem = {
      id: editingCatId || Date.now(),
      name_bn: newCatBn.trim(),
      name_en: newCatEn.trim() || newCatBn.trim(),
      name: newCatBn.trim(),
      slug,
    }

    try {
      await api.saveCategory(categoryItem)
    } catch (err) {
      console.warn('API saveCategory error, saving locally:', err)
    }

    if (editingCatId) {
      onUpdateCategory?.(categoryItem)
      triggerToast(lang === 'bn' ? 'ক্যাটাগরি আপডেট হয়েছে!' : 'Category updated!')
    } else {
      onAddCategory?.(categoryItem)
      triggerToast(lang === 'bn' ? 'নতুন ক্যাটাগরি যুক্ত হয়েছে!' : 'New category created!')
    }

    setNewCatBn('')
    setNewCatEn('')
    setNewCatSlug('')
    setEditingCatId(null)
  }

  // --- Edit Category Click ---
  const handleEditCategoryClick = (cat) => {
    setNewCatBn(cat.name_bn || cat.name || '')
    setNewCatEn(cat.name_en || cat.name || '')
    setNewCatSlug(cat.slug || '')
    setEditingCatId(cat.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // --- Delete Category Click ---
  const handleDeleteCategoryClick = async (cat) => {
    if (confirm(`আপনি কি নিশ্চিতভাবে "${cat.name_bn}" ক্যাটাগরি মুছে ফেলতে চান?`)) {
      try {
        await api.deleteCategory(cat.id || cat.slug)
      } catch (err) {
        console.warn('API deleteCategory error, deleting locally:', err)
      }
      onDeleteCategory?.(cat.id || cat.slug)
      triggerToast(lang === 'bn' ? 'ক্যাটাগরি মুছে ফেলা হয়েছে।' : 'Category deleted.', 'info')
    }
  }

  // --- Submit Article (Add or Update) ---
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

    const articlePayload = {
      ...formData,
      tags_bn: tagsArrayBn,
      tags_en: tagsArrayEn,
    }

    try {
      if (isEditing && formData.id) {
        try {
          await api.saveArticle(articlePayload, true)
        } catch (apiErr) {
          console.warn('API update article returned error, falling back to local state:', apiErr)
        }
        onUpdateArticle?.(articlePayload)
        refreshStats()
        triggerToast(lang === 'bn' ? 'সংবাদ সফলভাবে আপডেট হয়েছে!' : 'Article updated successfully!')
      } else {
        const newArt = {
          ...articlePayload,
          id: Date.now(),
          slug: formData.slug || `news-${Date.now()}`,
          date: new Date().toISOString(),
          views: 0,
        }
        let saved = null
        try {
          saved = await api.saveArticle(newArt)
        } catch (apiErr) {
          console.warn('API save article returned error, falling back to local state:', apiErr)
        }
        onAddArticle?.({ ...newArt, id: saved?.id || newArt.id, slug: saved?.slug || newArt.slug })
        refreshStats()
        triggerToast(lang === 'bn' ? 'নতুন সংবাদ সফলভাবে প্রকাশিত হয়েছে!' : 'New article published successfully!')
      }

      setFormData(emptyArticleForm)
      setIsEditing(false)
      setActiveTab('articles')
    } catch (err) {
      triggerToast(err.message || 'Error saving article', 'error')
    }
  }

  // Handle Edit Article Action
  const handleEditClick = (article) => {
    setFormData({
      ...article,
      seo_title: article.seo_title || '',
      seo_description: article.seo_description || '',
      focus_keyword: article.focus_keyword || '',
      canonical_url: article.canonical_url || '',
      og_image: article.og_image || '',
      schema_type: article.schema_type || 'NewsArticle',
      tags_bn: Array.isArray(article.tags_bn) ? article.tags_bn.join(', ') : (article.tags_bn || ''),
      tags_en: Array.isArray(article.tags_en) ? article.tags_en.join(', ') : (article.tags_en || ''),
    })
    setIsEditing(true)
    setActiveTab('add')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle Toggle Featured Lead
  const handleToggleFeatured = async (art) => {
    const updated = { ...art, featured: !art.featured }
    try {
      await api.saveArticle(updated, true)
      onUpdateArticle?.(updated)
      triggerToast(updated.featured ? 'Lead story set' : 'Removed from Lead story')
    } catch {
      onUpdateArticle?.(updated)
    }
  }

  // Handle Delete Article
  const handleDeleteArticleClick = async (id) => {
    if (confirm(lang === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই সংবাদটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this article?')) {
      try {
        await api.deleteArticle(id)
      } catch (err) {
        console.warn('API delete article returned error, deleting locally:', err)
      }
      onDeleteArticle?.(id)
      refreshStats()
      triggerToast(lang === 'bn' ? 'সংবাদটি মুছে ফেলা হয়েছে।' : 'Article deleted.', 'info')
    }
  }

  // Handle Breaking News Add
  const handleAddBreakingSubmit = async (e) => {
    e.preventDefault()
    if (!newBreakingBn.trim() && !newBreakingEn.trim()) return

    const newItem = {
      id: Date.now(),
      title_bn: newBreakingBn.trim() || newBreakingEn.trim(),
      title_en: newBreakingEn.trim() || newBreakingBn.trim(),
      slug: `breaking-${Date.now()}`,
    }
    try {
      const saved = await api.saveBreakingNews(newItem)
      onAddBreaking?.(saved?.item || newItem)
      refreshStats()
      setNewBreakingBn('')
      setNewBreakingEn('')
      triggerToast(lang === 'bn' ? 'ব্রেকিং নিউজ যুক্ত হয়েছে!' : 'Breaking news added!')
    } catch {
      onAddBreaking?.(newItem)
      setNewBreakingBn('')
      setNewBreakingEn('')
      triggerToast(lang === 'bn' ? 'ব্রেকিং নিউজ যুক্ত হয়েছে!' : 'Breaking news added!')
    }
  }

  // Handle Breaking News Delete
  const handleDeleteBreakingClick = async (id) => {
    try {
      await api.deleteBreakingNews(id)
    } catch { }
    onDeleteBreaking?.(id)
    refreshStats()
    triggerToast(lang === 'bn' ? 'ব্রেকিং নিউজ সরানো হয়েছে।' : 'Breaking news item removed.', 'info')
  }

  // Handle Add Opinion Submit
  const handleAddOpinionSubmit = (e) => {
    e.preventDefault()
    if (!newOpinion.title_bn.trim() || !newOpinion.author_bn.trim()) {
      alert('দয়া করে লেখকের নাম ও শিরোনাম লিখুন।')
      return
    }
    const item = {
      ...newOpinion,
      id: `op-${Date.now()}`,
      slug: `opinion-${Date.now()}`,
      date: new Date().toISOString(),
    }
    onAddOpinion?.(item)
    triggerToast(lang === 'bn' ? 'নতুন কলাম যুক্ত হয়েছে!' : 'Opinion column added!')
    setNewOpinion({
      title_bn: '',
      title_en: '',
      author_bn: '',
      author_en: '',
      author_role_bn: '',
      author_role_en: '',
      author_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      summary_bn: '',
      summary_en: '',
      content_bn: '',
    })
  }

  // Handle Add Photo Submit
  const handleAddPhotoSubmit = (e) => {
    e.preventDefault()
    if (!newPhoto.title_bn.trim() || !newPhoto.image.trim()) return
    const item = {
      ...newPhoto,
      id: `ph-${Date.now()}`,
      slug: `photo-${Date.now()}`,
      date: new Date().toISOString(),
    }
    onAddPhoto?.(item)
    triggerToast(lang === 'bn' ? 'ছবি যুক্ত হয়েছে!' : 'Photo added!')
    setNewPhoto({
      title_bn: '',
      title_en: '',
      image: '',
      credit_bn: siteForm.site_name_bn ? `ছবি: ${siteForm.site_name_bn}` : 'ছবি: সংগৃহীত',
      credit_en: siteForm.site_name_en ? `Photo: ${siteForm.site_name_en}` : 'Photo: Source',
      caption_bn: '',
    })
  }

  // Handle Add Video Submit
  const handleAddVideoSubmit = (e) => {
    e.preventDefault()
    if (!newVideo.title_bn.trim()) return
    const item = {
      ...newVideo,
      id: `v-${Date.now()}`,
      slug: `video-${Date.now()}`,
      date: new Date().toISOString(),
    }
    onAddVideo?.(item)
    triggerToast(lang === 'bn' ? 'ভিডিও প্রতিবেদন যুক্ত হয়েছে!' : 'Video added!')
    setNewVideo({
      title_bn: '',
      title_en: '',
      thumb: '',
      videoUrl: '',
      duration: '৩:৩০',
    })
  }

  // Download Database SQL
  const handleDownloadSQL = () => {
    const element = document.createElement('a')
    element.setAttribute('href', '/backend/cpanel-database.sql')
    element.setAttribute('download', 'cpanel-database.sql')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    triggerToast(lang === 'bn' ? 'SQL ডাউনলোড শুরু হয়েছে।' : 'SQL download started.')
  }

  // Handle Delete Opinion Click
  const handleDeleteOpinionClick = (id) => {
    if (confirm(lang === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই মতামতটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this opinion?')) {
      onDeleteOpinion?.(id)
      triggerToast(lang === 'bn' ? 'মতামতটি মুছে ফেলা হয়েছে।' : 'Opinion deleted.', 'info')
    }
  }

  // Handle Delete Photo Click
  const handleDeletePhotoClick = (id) => {
    if (confirm(lang === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই ছবিটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this photo?')) {
      onDeletePhoto?.(id)
      triggerToast(lang === 'bn' ? 'ছবিটি মুছে ফেলা হয়েছে।' : 'Photo deleted.', 'info')
    }
  }

  // Handle Delete Video Click
  const handleDeleteVideoClick = (id) => {
    if (confirm(lang === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই ভিডিওটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this video?')) {
      onDeleteVideo?.(id)
      triggerToast(lang === 'bn' ? 'ভিডিওটি মুছে ফেলা হয়েছে।' : 'Video deleted.', 'info')
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

      const matchFeat = !filterFeaturedOnly || art.featured

      return matchQ && matchCat && matchFeat
    })
  }, [articles, articleSearch, articleCategoryFilter, filterFeaturedOnly])

  // Total Views Aggregation
  const totalViews = useMemo(() => {
    return articles.reduce((sum, a) => sum + (Number(a.views) || 0), 0)
  }, [articles])

  // Category Distribution Counts
  const categoryCounts = useMemo(() => {
    const map = {}
    articles.forEach((a) => {
      const cat = (a.category || 'national').toLowerCase()
      map[cat] = (map[cat] || 0) + 1
    })
    return map
  }, [articles])

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bengali text-gray-500 bg-gray-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <span className="text-sm font-semibold">যাচাই করা হচ্ছে...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1a1a1a] font-bengali flex flex-col antialiased">
      {/* ================= 1. ADMIN TOP NAVBAR (Prothom Alo Navy & Red) ================= */}
      <header className="bg-[#1a3a5c] text-white border-b-4 border-[#e30613] sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          {/* Logo & Portal Branding */}
          <div className="flex items-center gap-3">
            <ProthomAloLogo lang={lang} size="small" settings={siteForm} />
            <span className="hidden sm:inline-block bg-[#e30613] text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider shadow-xs">
              CMS ড্যাশবোর্ড
            </span>
          </div>

          {/* Center: Live Database Connection Badge */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15">
              <span
                className={`w-2 h-2 rounded-full ${serverHealth.database === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-amber-400'
                  }`}
              />
              <span className="text-gray-200">
                {serverHealth.database === 'connected' ? (
                  <span className="text-green-300 font-semibold">MySQL Live: সংযুক্ত (Online)</span>
                ) : (
                  <span className="text-amber-300 font-semibold">Local Sync: সক্রিয়</span>
                )}
              </span>
            </div>
          </div>

          {/* Right Actions: View Website, User profile, Logout */}
          <div className="flex items-center gap-3 text-xs">
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all font-semibold border border-white/20 text-gray-100 hover:text-white"
            >
              <ExternalLink size={13} />
              <span>{lang === 'bn' ? 'ওয়েবসাইট দেখুন' : 'View Portal'}</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 bg-black/25 px-3 py-1 rounded-full border border-white/10">
              <div className="w-5 h-5 rounded-full bg-[#e30613] flex items-center justify-center font-bold text-[10px] text-white">
                A
              </div>
              <span className="font-semibold text-gray-200 text-xs">
                {currentUser?.email || 'admin@mknews.com'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-[#e30613] hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-bold transition-colors shadow-xs"
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

      {/* ================= 2. DASHBOARD BODY (SIDEBAR + WORKSPACE) ================= */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT NAVIGATION SIDEBAR (3 cols) */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 space-y-1">
            {[
              { id: 'overview', icon: <LayoutDashboard size={16} />, bn: 'ড্যাশবোর্ড ওভারভিউ', en: 'Dashboard Overview', count: null },
              { id: 'articles', icon: <FileText size={16} />, bn: 'সংবাদ তালিকা', en: 'Articles Management', count: articles.length },
              { id: 'categories', icon: <Layers size={16} />, bn: 'ক্যাটাগরি তালিকা', en: 'Categories', count: formattedCategories.length },
              { id: 'add', icon: <PlusCircle size={16} />, bn: isEditing ? 'সংবাদ সম্পাদনা' : 'নতুন সংবাদ লিখুন', en: isEditing ? 'Edit Article' : 'Write New Article', count: null },
              { id: 'breaking', icon: <Flame size={16} />, bn: 'ব্রেকিং নিউজ টিকার', en: 'Breaking Ticker', count: breakingNews.length },
              { id: 'opinions', icon: <PenTool size={16} />, bn: 'কলাম ও মতামত', en: 'Opinions & Editorials', count: opinions.length },
              { id: 'media', icon: <Camera size={16} />, bn: 'ছবি ও ভিডিও গ্যালারি', en: 'Photos & Videos', count: photos.length + videos.length },
              { id: 'settings', icon: <Globe size={16} />, bn: 'ওয়েবসাইট সেটিংস ও বিবরণ', en: 'Website Settings & Details', count: null },
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all text-left ${activeTab === tab.id
                    ? 'bg-red-50 text-[#e30613] border-l-4 border-l-[#e30613] shadow-xs'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-red-600'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={activeTab === tab.id ? 'text-[#e30613]' : 'text-gray-400'}>{tab.icon}</span>
                  <span>{lang === 'bn' ? tab.bn : tab.en}</span>
                </div>
                {tab.count !== null && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab.id ? 'bg-[#e30613] text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                  >
                    {toBengaliNumber(tab.count)}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Quick System Status Card */}
          <div className="bg-[#1a3a5c] text-white p-4 rounded-xl text-xs space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#2a4d74] pb-2">
              <span className="font-bold flex items-center gap-1.5 text-yellow-300">
                <Database size={13} />
                <span>সিস্টেম লাইভ স্ট্যাটাস</span>
              </span>
              <span className="text-[10px] bg-green-500/20 text-green-300 font-bold px-1.5 py-0.5 rounded border border-green-500/30">
                Active
              </span>
            </div>
            <div className="space-y-1.5 text-[11px] text-gray-300">
              <div className="flex justify-between">
                <span>ডাটাবেজ:</span>
                <span className="font-semibold text-white">MySQL (cPanel Ready)</span>
              </div>
              <div className="flex justify-between">
                <span>সক্রিয় ক্যাটাগরি:</span>
                <span className="font-semibold text-yellow-300">{toBengaliNumber(formattedCategories.length)} টি</span>
              </div>
              <div className="flex justify-between">
                <span>এনকোডিং:</span>
                <span className="font-semibold text-white">utf8mb4_unicode_ci</span>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN WORKSPACE (9 cols) */}
        <main className="lg:col-span-9 space-y-6">
          {/* ================= TAB 1: OVERVIEW METRICS ================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top 4 KPI Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between border-t-4 border-t-blue-600">
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block">{lang === 'bn' ? 'মোট সংবাদ' : 'Total Articles'}</span>
                    <span className="text-2xl font-black text-gray-900 mt-1 block">
                      {toBengaliNumber(articles.length)}
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileText size={22} />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between border-t-4 border-t-[#e30613]">
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block">{lang === 'bn' ? 'মোট পাঠক ভিউ' : 'Total Views'}</span>
                    <span className="text-2xl font-black text-[#e30613] mt-1 block">
                      {toBengaliNumber(totalViews)}
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-lg bg-red-50 text-[#e30613] flex items-center justify-center">
                    <TrendingUp size={22} />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between border-t-4 border-t-amber-500">
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block">{lang === 'bn' ? 'মোট ক্যাটাগরি' : 'Total Categories'}</span>
                    <span className="text-2xl font-black text-amber-600 mt-1 block">
                      {toBengaliNumber(formattedCategories.length)}
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Layers size={22} />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between border-t-4 border-t-emerald-600">
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block">{lang === 'bn' ? 'সক্রিয় ব্রেকিং' : 'Active Breaking'}</span>
                    <span className="text-2xl font-black text-emerald-600 mt-1 block">
                      {toBengaliNumber(breakingNews.length)}
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Flame size={22} />
                  </div>
                </div>
              </div>

              {/* Category Breakdown Pill Grid */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#e30613] rounded-full"></span>
                    <span>বিভাগভিত্তিক সংবাদ সংখ্যা (Category Breakdown)</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('categories')}
                    className="text-xs text-red-600 font-bold hover:underline"
                  >
                    ক্যাটাগরি ম্যানেজমেন্ট →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-1 text-xs">
                  {formattedCategories.map((cat) => {
                    const count = categoryCounts[cat.slug.toLowerCase()] || 0
                    return (
                      <button
                        key={cat.slug}
                        onClick={() => {
                          setArticleCategoryFilter(cat.slug)
                          setActiveTab('articles')
                        }}
                        className="p-2 rounded-lg bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-300 transition-colors text-left flex items-center justify-between group"
                      >
                        <span className="font-semibold text-gray-700 group-hover:text-red-700 truncate mr-1">
                          {cat.name_bn}
                        </span>
                        <span className="bg-white group-hover:bg-red-600 group-hover:text-white px-2 py-0.5 rounded text-[11px] font-bold text-gray-600 shadow-2xs">
                          {toBengaliNumber(count)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Quick Launch Action Bar */}
              <div className="bg-gradient-to-r from-[#1a3a5c] to-[#0f2540] text-white p-5 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-yellow-300 flex items-center gap-2">
                    <Sparkles size={16} />
                    <span>দ্রুত সংবাদ প্রকাশ ও বিভাগীয় ব্যবস্থাপনা</span>
                  </h3>
                  <p className="text-xs text-gray-300 mt-1">
                    নতুন সংবাদ লিখুন, নতুন ক্যাটাগরি তৈরি করুন অথবা ব্রেকিং নিউজ টিকার পরিচালনা করুন।
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setFormData(emptyArticleForm)
                      setActiveTab('add')
                    }}
                    className="flex items-center gap-1.5 bg-[#e30613] hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors shadow"
                  >
                    <PlusCircle size={15} />
                    <span>নতুন সংবাদ লিখুন</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('categories')}
                    className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors border border-white/20"
                  >
                    <Layers size={15} className="text-yellow-300" />
                    <span>ক্যাটাগরি তৈরি করুন</span>
                  </button>
                </div>
              </div>

              {/* Recent 5 Articles Table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                  <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                    <FileText size={16} className="text-[#e30613]" />
                    <span>সর্বশেষ প্রকাশিত সংবাদসমূহ</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('articles')}
                    className="text-xs text-red-600 font-bold hover:underline"
                  >
                    সব সংবাদ দেখুন ({toBengaliNumber(articles.length)}) →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-600">
                    <thead className="bg-gray-100 text-gray-700 uppercase font-bold border-b">
                      <tr>
                        <th className="p-3 w-14">ছবি</th>
                        <th className="p-3">শিরোনাম (Headline)</th>
                        <th className="p-3 w-28">বিভাগ</th>
                        <th className="p-3 w-24 text-center">ভিউ সংখ্যা</th>
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
                              {CATEGORIES_BN[art.category] || art.category}
                            </span>
                          </td>
                          <td className="p-3 text-center font-bold text-gray-800">
                            {toBengaliNumber(art.views || 0)}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleEditClick(art)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteArticleClick(art.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Delete"
                              >
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
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden space-y-0">
              {/* Filter and Search Bar */}
              <div className="p-4 border-b bg-gray-50 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-gray-800">সকল সংবাদের তালিকা</h3>
                  <span className="text-[11px] text-gray-500">
                    মোট {toBengaliNumber(filteredArticles.length)} টি সংবাদ পাওয়া গেছে
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* Category Filter */}
                  <select
                    value={articleCategoryFilter}
                    onChange={(e) => setArticleCategoryFilter(e.target.value)}
                    className="p-2 border rounded bg-white font-bengali outline-none"
                  >
                    <option value="all">সকল বিভাগ (All Categories)</option>
                    {formattedCategories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name_bn}
                      </option>
                    ))}
                  </select>

                  {/* Featured Only Toggle */}
                  <button
                    onClick={() => setFilterFeaturedOnly(!filterFeaturedOnly)}
                    className={`px-3 py-1.5 rounded border text-xs font-bold transition-colors flex items-center gap-1 ${filterFeaturedOnly
                        ? 'bg-[#e30613] text-white border-[#e30613]'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                  >
                    <Star size={13} className={filterFeaturedOnly ? 'fill-current' : ''} />
                    <span>শীর্ষ সংবাদ</span>
                  </button>

                  {/* Search box */}
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="শিরোনাম বা লেখক দিয়ে খুঁজুন..."
                      value={articleSearch}
                      onChange={(e) => setArticleSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 border rounded text-xs bg-white focus:ring-1 focus:ring-red-500 outline-none w-48 sm:w-56"
                    />
                  </div>

                  {/* Write new button */}
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setFormData(emptyArticleForm)
                      setActiveTab('add')
                    }}
                    className="flex items-center gap-1 bg-[#e30613] hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded transition-colors shadow-xs"
                  >
                    <PlusCircle size={14} />
                    <span>নতুন সংবাদ</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-100 text-gray-700 uppercase font-bold border-b">
                    <tr>
                      <th className="p-3 w-16">ছবি</th>
                      <th className="p-3">শিরোনাম (বাংলা ও ইংরেজি)</th>
                      <th className="p-3 w-28">বিভাগ</th>
                      <th className="p-3 w-28">লেখক</th>
                      <th className="p-3 w-20 text-center">ভিউ</th>
                      <th className="p-3 w-20 text-center">শীর্ষ সংবাদ</th>
                      <th className="p-3 w-28 text-center">অ্যাকশন</th>
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
                        </td>
                        <td className="p-3">
                          <span className="bg-red-50 text-[#e30613] px-2 py-0.5 rounded font-bold">
                            {CATEGORIES_BN[art.category] || art.category}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600 font-medium">
                          {art.author_bn || (siteForm.site_name_bn ? `${siteForm.site_name_bn} ডেস্ক` : 'ডেস্ক')}
                        </td>
                        <td className="p-3 text-center font-bold text-gray-800">
                          {toBengaliNumber(art.views || 0)}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleToggleFeatured(art)}
                            className={`p-1 rounded transition-colors ${art.featured ? 'text-amber-500 hover:text-gray-400' : 'text-gray-300 hover:text-amber-500'
                              }`}
                            title="Toggle Lead Story"
                          >
                            <Star size={16} className={art.featured ? 'fill-current' : ''} />
                          </button>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Link
                              to={`/article/${art.slug}`}
                              target="_blank"
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                              title="View Article"
                            >
                              <Eye size={14} />
                            </Link>
                            <button
                              onClick={() => handleEditClick(art)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit Article"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteArticleClick(art.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Delete Article"
                            >
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

          {/* ================= TAB 3: CATEGORIES MANAGEMENT (NEW DEDICATED TAB) ================= */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              {/* Add / Edit Category Form */}
              <form onSubmit={handleCategorySubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2 text-[#e30613] font-bold">
                    <FolderPlus size={18} />
                    <span>{editingCatId ? 'ক্যাটাগরি সম্পাদনা করুন' : 'নতুন ক্যাটাগরি / বিভাগ যোগ করুন'}</span>
                  </div>
                  {editingCatId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCatId(null)
                        setNewCatBn('')
                        setNewCatEn('')
                        setNewCatSlug('')
                      }}
                      className="text-xs text-gray-500 hover:text-red-600 font-semibold"
                    >
                      বাতিল করুন
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      ক্যাটাগরির নাম (বাংলা) *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCatBn}
                      onChange={(e) => {
                        setNewCatBn(e.target.value)
                        if (!editingCatId && !newCatSlug) {
                          setNewCatSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))
                        }
                      }}
                      placeholder="যেমন: বিজ্ঞান ও প্রযুক্তি"
                      className="w-full text-xs p-3 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      ক্যাটাগরির নাম (English)
                    </label>
                    <input
                      type="text"
                      value={newCatEn}
                      onChange={(e) => {
                        setNewCatEn(e.target.value)
                        if (!editingCatId) {
                          setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
                        }
                      }}
                      placeholder="e.g. Science & Technology"
                      className="w-full text-xs p-3 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      স্লাগ / URL Slug (যেমন: `technology`) *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCatSlug}
                      onChange={(e) => setNewCatSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      placeholder="URL-friendly slug..."
                      className="w-full text-xs p-3 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="bg-[#e30613] hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors shadow"
                  >
                    {editingCatId ? 'ক্যাটাগরি আপডেট করুন' : 'ক্যাটাগরি সংরক্ষণ করুন'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('add')}
                    className="text-xs text-blue-600 hover:underline font-semibold ml-2"
                  >
                    সংবাদ লেখার ফর্মে ফিরে যান →
                  </button>
                </div>
              </form>

              {/* Categories Management Table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                  <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                    <Layers size={16} className="text-[#e30613]" />
                    <span>সকল সক্রিয় ক্যাটাগরি তালিকা ({toBengaliNumber(formattedCategories.length)} টি)</span>
                  </h3>
                  <span className="text-xs text-gray-500">ডাটাবেজ ও ফ্রন্টএন্ডে সরাসরি সক্রিয়</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-600">
                    <thead className="bg-gray-100 text-gray-700 uppercase font-bold border-b">
                      <tr>
                        <th className="p-3 w-12 text-center">#</th>
                        <th className="p-3">ক্যাটাগরি নাম (বাংলা)</th>
                        <th className="p-3">English Name</th>
                        <th className="p-3">স্লাগ (URL Path)</th>
                        <th className="p-3 w-28 text-center">সংবাদ সংখ্যা</th>
                        <th className="p-3 w-32 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {formattedCategories.map((cat, idx) => {
                        const count = articles.filter(
                          (a) => (a.category || '').toLowerCase() === cat.slug.toLowerCase()
                        ).length

                        return (
                          <tr key={cat.slug} className="hover:bg-gray-50 transition-colors">
                            <td className="p-3 text-center text-gray-400 font-semibold">{toBengaliNumber(idx + 1)}</td>
                            <td className="p-3 font-bold text-gray-900 text-sm">
                              {cat.name_bn}
                            </td>
                            <td className="p-3 font-sans text-gray-600">
                              {cat.name_en}
                            </td>
                            <td className="p-3 font-mono text-gray-500 text-[11px]">
                              /category/{cat.slug}
                            </td>
                            <td className="p-3 text-center">
                              <span className="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-full text-xs">
                                {toBengaliNumber(count)} টি
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Link
                                  to={`/category/${cat.slug}`}
                                  target="_blank"
                                  className="p-1 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded"
                                  title="View on Frontend"
                                >
                                  <ExternalLink size={14} />
                                </Link>
                                <button
                                  onClick={() => handleEditCategoryClick(cat)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                  title="Edit Category"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategoryClick(cat)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="Delete Category"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: WRITE OR EDIT ARTICLE ================= */}
          {activeTab === 'add' && (
            <form onSubmit={handleSubmitArticle} className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#e30613] rounded-full"></span>
                    <span>{isEditing ? 'সংবাদ সম্পাদনা করুন (Edit Article)' : 'নতুন সংবাদ লিখুন ও প্রকাশ করুন'}</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    সম্পূর্ণ দ্বিভাষিক (বাংলা ও ইংরেজি) তথ্য ও ক্যাটাগরি নির্বাচন করে সংবাদ প্রকাশ করুন।
                  </p>
                </div>
                {isEditing && (
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-300">
                    Editing ID #{formData.id}
                  </span>
                )}
              </div>

              {/* Title BN & EN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    সংবাদ শিরোনাম (বাংলা) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title_bn}
                    onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
                    placeholder="যেমন: পদ্মা সেতুতে ২৪ ঘণ্টায় সর্বোচ্চ টোল আদায়..."
                    className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    সংবাদ শিরোনাম (English Headline)
                  </label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    placeholder="English headline for international edition..."
                    className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-sans"
                  />
                </div>
              </div>

              {/* Subheadline BN & EN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    উপ-শিরোনাম (বাংলা)
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
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    উপ-শিরোনাম (English Subheadline)
                  </label>
                  <input
                    type="text"
                    value={formData.subheadline_en}
                    onChange={(e) => setFormData({ ...formData, subheadline_en: e.target.value })}
                    placeholder="Subheadline in English..."
                    className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-sans"
                  />
                </div>
              </div>

              {/* ================= CATEGORY SELECTION OPTION (HIGHLY REQUESTED) ================= */}
              <div className="p-4 bg-red-50/50 rounded-xl border border-red-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Layers size={16} className="text-[#e30613]" />
                    <span>সংবাদের বিভাগ নির্বাচন করুন (Select Category) *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('categories')}
                    className="text-xs font-bold text-[#e30613] hover:underline flex items-center gap-1"
                  >
                    <span>+ ক্যাটাগরি পরিচালনা ও নতুন বিভাগ তৈরি</span>
                  </button>
                </div>

                {/* Primary Category Dropdown */}
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full text-sm p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white font-bengali font-bold text-gray-900 shadow-2xs"
                >
                  {formattedCategories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name_bn} ({cat.name_en})
                    </option>
                  ))}
                </select>

                {/* Quick Interactive Category Pills */}
                <div>
                  <span className="block text-[11px] font-semibold text-gray-500 mb-1.5">
                    অথবা দ্রুত নির্বাচন করতে নিচের যেকোনো বিভাগে ক্লিক করুন:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {formattedCategories.map((cat) => {
                      const isSelected = (formData.category || '').toLowerCase() === cat.slug.toLowerCase()
                      return (
                        <button
                          key={cat.slug}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: cat.slug })}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${isSelected
                              ? 'bg-[#e30613] text-white shadow-xs scale-102 ring-2 ring-red-400'
                              : 'bg-white text-gray-700 border border-gray-200 hover:border-red-300 hover:bg-gray-50'
                            }`}
                        >
                          {isSelected && <Check size={12} className="stroke-[3]" />}
                          <span>{cat.name_bn}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Author and Role */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    প্রতিবেদক / লেখকের নাম
                  </label>
                  <input
                    type="text"
                    value={formData.author_bn}
                    onChange={(e) => setFormData({ ...formData, author_bn: e.target.value })}
                    placeholder={siteForm.site_name_bn ? `${siteForm.site_name_bn} ডেস্ক` : 'ডেস্ক'}
                    className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    প্রতিবেদকের পদবি
                  </label>
                  <input
                    type="text"
                    value={formData.author_role_bn}
                    onChange={(e) => setFormData({ ...formData, author_role_bn: e.target.value })}
                    placeholder="স্টাফ রিপোর্টার"
                    className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>

              {/* Image URL & Live Preview */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  ছবির ওয়েব লিঙ্ক (Image URL) *
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="url"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-sans"
                  />
                  {formData.image && (
                    <div className="w-20 h-14 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0 bg-gray-100">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Summary BN & EN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    সারসংক্ষেপ (বাংলা)
                  </label>
                  <textarea
                    rows="3"
                    value={formData.summary_bn}
                    onChange={(e) => setFormData({ ...formData, summary_bn: e.target.value })}
                    placeholder="১-২ লাইনের মূল সারসংক্ষেপ..."
                    className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    সারসংক্ষেপ (English Summary)
                  </label>
                  <textarea
                    rows="3"
                    value={formData.summary_en}
                    onChange={(e) => setFormData({ ...formData, summary_en: e.target.value })}
                    placeholder="1-2 lines summary in English..."
                    className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-sans"
                  />
                </div>
              </div>

              {/* Full Content BN */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  মূল সংবাদ বিস্তারিত বিবরণ (বাংলা) *
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

              {/* Tags & Featured Lead Toggle */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 min-w-[260px]">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ট্যাগসমূহ (কমা দিয়ে পৃথক করুন)
                  </label>
                  <input
                    type="text"
                    value={formData.tags_bn}
                    onChange={(e) => setFormData({ ...formData, tags_bn: e.target.value })}
                    placeholder="বন্যা, ত্রাণ, জাতীয়"
                    className="w-full text-xs p-2.5 border rounded bg-white outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-3 sm:pt-0">
                  <input
                    type="checkbox"
                    id="featLeadCheck"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500 cursor-pointer"
                  />
                  <label htmlFor="featLeadCheck" className="text-xs font-bold text-gray-800 cursor-pointer select-none">
                    ⭐ প্রধান সংবাদ (Lead Story) হিসেবে ফ্রন্টপেজে দেখান
                  </label>
                </div>
              </div>

              {/* ================= 6. SEARCH ENGINE OPTIMIZATION (SEO) STUDIO ================= */}
              {(() => {
                const effectiveTitle = (formData.seo_title || formData.title_bn || formData.title_en || 'সংবাদের শিরোনাম এখানে প্রদর্শিত হবে').trim()
                const effectiveDesc = (formData.seo_description || formData.summary_bn || formData.summary_en || formData.subheadline_bn || 'এখানে সার্চ রেজাল্টের মেটা বিবরণ ও সারসংক্ষেপ দেখা যাবে...').trim()
                const focusKw = (formData.focus_keyword || '').trim().toLowerCase()
                const contentText = (formData.content_bn || '').replace(/<[^>]*>/g, ' ')
                const wordCount = contentText.trim().split(/\s+/).filter(Boolean).length

                // Live SEO Checks
                const checks = [
                  {
                    label: 'শিরোনামের দৈর্ঘ্য আদর্শ (৪০-৭০ অক্ষরের মধ্যে)',
                    passed: effectiveTitle.length >= 40 && effectiveTitle.length <= 70,
                    detail: `${effectiveTitle.length} অক্ষর (লক্ষ্য: ৪০-৭০)`,
                  },
                  {
                    label: 'মেটা বিবরণের দৈর্ঘ্য আদর্শ (১০০-১৬০ অক্ষরের মধ্যে)',
                    passed: effectiveDesc.length >= 100 && effectiveDesc.length <= 165,
                    detail: `${effectiveDesc.length} অক্ষর (লক্ষ্য: ১২০-১৬০)`,
                  },
                  {
                    label: 'ফোকাস কিওয়ার্ড প্রধান শিরোনামে রয়েছে',
                    passed: focusKw ? effectiveTitle.toLowerCase().includes(focusKw) : false,
                    detail: focusKw ? (effectiveTitle.toLowerCase().includes(focusKw) ? 'মিলেছে' : 'শিরোনামে কিওয়ার্ড পাওয়া যায়নি') : 'ফোকাস কিওয়ার্ড প্রদান করুন',
                  },
                  {
                    label: 'ফোকাস কিওয়ার্ড মেটা বর্ণনায় রয়েছে',
                    passed: focusKw ? effectiveDesc.toLowerCase().includes(focusKw) : false,
                    detail: focusKw ? (effectiveDesc.toLowerCase().includes(focusKw) ? 'মিলেছে' : 'মেটা বর্ণনায় কিওয়ার্ড নেই') : 'ফোকাস কিওয়ার্ড প্রদান করুন',
                  },
                  {
                    label: 'ফিচার্ড বা সোশ্যাল শেয়ার ছবি উপস্থিত',
                    passed: Boolean(formData.image || formData.og_image),
                    detail: formData.image ? 'ছবি যুক্ত আছে' : 'ছবি দিন',
                  },
                  {
                    label: 'বিস্তারিত বিষয়বস্তুর গভীরতা (> ১৫০ শব্দ)',
                    passed: wordCount >= 150,
                    detail: `${wordCount} শব্দ`,
                  },
                ]

                const passedCount = checks.filter(c => c.passed).length
                const scorePercent = Math.round((passedCount / checks.length) * 100)

                const scoreColor = scorePercent >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-300' :
                                   scorePercent >= 50 ? 'text-amber-700 bg-amber-50 border-amber-300' :
                                   'text-red-700 bg-red-50 border-red-300'

                const scoreText = scorePercent >= 80 ? 'চমৎকার এসইও (Excellent SEO)' :
                                  scorePercent >= 50 ? 'চলতি এসইও (Average SEO)' :
                                  'উন্নতি প্রয়োজন (Needs Improvement)'

                const slugPreview = formData.slug || 'news-article-slug'
                const catSlug = formData.category || 'national'

                return (
                  <div className="bg-slate-50/80 rounded-xl border-2 border-indigo-100 p-5 sm:p-7 space-y-6">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-indigo-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-xs">
                            <Sparkles size={18} />
                          </span>
                          <h4 className="text-base font-extrabold text-gray-900 font-bengali">
                            সার্চ ইঞ্জিন অপ্টিমাইজেশন ও মেটা সেটিংস (SEO Studio)
                          </h4>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 font-bengali">
                          গুগল সার্চ ও সোশ্যাল মিডিয়ায় আপনার সংবাদটিকে সবার উপরে প্রদর্শন করানোর জন্য প্রয়োজনীয় সেটিংস।
                        </p>
                      </div>

                      {/* Real-time SEO Score Badge */}
                      <div className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 font-bold text-xs shadow-2xs ${scoreColor}`}>
                        <div className="w-2.5 h-2.5 rounded-full bg-current animate-pulse"></div>
                        <div>
                          <span className="text-sm font-black">{scorePercent}/১০০</span> • <span>{scoreText}</span>
                        </div>
                      </div>
                    </div>

                    {/* Live Google Search Result Simulator (SERP Preview) */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                          <Globe size={15} className="text-blue-600" />
                          <span>গুগল সার্চ রেজাল্ট প্রিভিউ (Google Search Preview)</span>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs">
                          <button
                            type="button"
                            onClick={() => setSeoPreviewDevice('desktop')}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded font-bold transition-all ${
                              seoPreviewDevice === 'desktop' ? 'bg-white text-blue-700 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                            }`}
                          >
                            <Monitor size={13} />
                            <span>ডেস্কটপ</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSeoPreviewDevice('mobile')}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded font-bold transition-all ${
                              seoPreviewDevice === 'mobile' ? 'bg-white text-blue-700 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                            }`}
                          >
                            <Smartphone size={13} />
                            <span>মোবাইল</span>
                          </button>
                        </div>
                      </div>

                      {/* Google SERP Card Preview */}
                      <div className={`p-4 bg-white border border-gray-200 rounded-lg transition-all ${
                        seoPreviewDevice === 'mobile' ? 'max-w-md mx-auto shadow-sm ring-1 ring-gray-200' : 'w-full'
                      }`}>
                        {/* Google URL Line */}
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center">
                            প্র
                          </div>
                          <div className="text-[11px] leading-tight overflow-hidden text-ellipsis whitespace-nowrap text-[#202124]">
                            <span className="font-medium text-gray-800">{siteForm.site_name_bn || 'প্রথম আলো'}</span>
                            <span className="text-gray-400 mx-1">›</span>
                            <span className="text-gray-500">{catSlug}</span>
                            <span className="text-gray-400 mx-1">›</span>
                            <span className="text-gray-500">{slugPreview}</span>
                          </div>
                        </div>

                        {/* Google Blue Link Title */}
                        <h3 className="text-[#1a0dab] hover:underline font-normal text-base sm:text-lg leading-snug cursor-pointer font-sans line-clamp-2">
                          {effectiveTitle}
                        </h3>

                        {/* Snippet Description */}
                        <p className="text-xs text-[#4d5156] leading-relaxed mt-1 font-sans line-clamp-2">
                          {effectiveDesc}
                        </p>
                      </div>
                    </div>

                    {/* SEO Form Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* 1. SEO Title Override */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-gray-700">
                            সার্চ ইঞ্জিন মেটা টাইটেল (SEO Title)
                          </label>
                          <span className={`text-[11px] font-bold ${
                            formData.seo_title.length >= 40 && formData.seo_title.length <= 70 ? 'text-emerald-600' : 'text-gray-400'
                          }`}>
                            {formData.seo_title.length} / ৬০ অক্ষর
                          </span>
                        </div>
                        <input
                          type="text"
                          value={formData.seo_title}
                          onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                          placeholder={formData.title_bn || 'কাস্টম এসইও শিরোনাম (ফাঁকা রাখলে মূল শিরোনাম ব্যবহৃত হবে)...'}
                          className="w-full text-xs p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-bengali"
                        />
                        <p className="text-[11px] text-gray-500">
                          গুগল সার্চ ফলাফলে যে শিরোনামটি সবার আগে প্রদর্শিত হবে।
                        </p>
                      </div>

                      {/* 2. Focus Keyword */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700">
                          মূল ফোকাস কিওয়ার্ড (Focus Target Keyword)
                        </label>
                        <input
                          type="text"
                          value={formData.focus_keyword}
                          onChange={(e) => setFormData({ ...formData, focus_keyword: e.target.value })}
                          placeholder="যেমন: মেট্রোরেল, এশিয়া কাপ, রেমিট্যান্স"
                          className="w-full text-xs p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-bengali"
                        />
                        <p className="text-[11px] text-gray-500">
                          যে নির্দিষ্ট শব্দ বা বাক্যাংশের জন্য আপনি গুগলে ১ নম্বরে র‍্যাংক করতে চান।
                        </p>
                      </div>
                    </div>

                    {/* 3. SEO Meta Description */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-gray-700">
                          সার্চ ইঞ্জিন মেটা ডেসক্রিপশন (Meta Description for Google SERP)
                        </label>
                        <span className={`text-[11px] font-bold ${
                          formData.seo_description.length >= 100 && formData.seo_description.length <= 165 ? 'text-emerald-600' : 'text-gray-400'
                        }`}>
                          {formData.seo_description.length} / ১৬০ অক্ষর
                        </span>
                      </div>
                      <textarea
                        rows="2"
                        value={formData.seo_description}
                        onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                        placeholder={formData.summary_bn || 'গুগল সার্চ রেজাল্টের শিরোনামের নিচে প্রদর্শিত সারসংক্ষেপ...'}
                        className="w-full text-xs p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-bengali"
                      />
                      <p className="text-[11px] text-gray-500">
                        পাঠকদের আকৃষ্ট করতে আকর্ষণীয় ১-২ লাইনের বিবরণ লিখুন যাতে তারা ক্লিক করে।
                      </p>
                    </div>

                    {/* Advanced Technical SEO Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      {/* Schema Type */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Schema.org কাঠামোগত ডেটা টাইপ
                        </label>
                        <select
                          value={formData.schema_type || 'NewsArticle'}
                          onChange={(e) => setFormData({ ...formData, schema_type: e.target.value })}
                          className="w-full text-xs p-2.5 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="NewsArticle">NewsArticle (সংবাদ প্রতিবেদন)</option>
                          <option value="OpinionNewsArticle">OpinionNewsArticle (মতামত / সম্পাদকীয়)</option>
                          <option value="AnalysisNewsArticle">AnalysisNewsArticle (গভীর বিশ্লেষণ)</option>
                          <option value="ReviewNewsArticle">ReviewNewsArticle (রিভিউ / মূল্যায়ন)</option>
                          <option value="Report">Report (বিশেষ রিপোর্ট)</option>
                          <option value="BlogPosting">BlogPosting (ব্লগ নিবন্ধ)</option>
                        </select>
                      </div>

                      {/* Social Share OG Image */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          সোশ্যাল শেয়ার ছবি (OG Image URL)
                        </label>
                        <input
                          type="url"
                          value={formData.og_image}
                          onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                          placeholder="ফাঁকা রাখলে মূল ফিচার্ড ছবি ব্যবহৃত হবে"
                          className="w-full text-xs p-2.5 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                        />
                      </div>

                      {/* Canonical URL */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          ক্যানোনিকাল ইউআরএল (Canonical URL)
                        </label>
                        <input
                          type="url"
                          value={formData.canonical_url}
                          onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                          placeholder="স্বয়ংক্রিয় তৈরি (প্রয়োজনে ওভাররাইড করুন)"
                          className="w-full text-xs p-2.5 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                        />
                      </div>
                    </div>

                    {/* SEO Checklist */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2.5">
                      <span className="block text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        <CheckSquare size={14} className="text-indigo-600" />
                        <span>রিয়েল-টাইম এসইও চেকলিস্ট (SEO Optimization Audit):</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {checks.map((chk, i) => (
                          <div
                            key={i}
                            className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${
                              chk.passed ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-600'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                ch.passed ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-700'
                              }`}>
                                {chk.passed ? '✓' : '×'}
                              </span>
                              <span className="font-medium font-bengali">{chk.label}</span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-500">{chk.detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-[#e30613] hover:bg-red-700 text-white font-bold text-sm px-6 py-3 rounded-lg transition-colors shadow"
                >
                  <Save size={16} />
                  <span>{isEditing ? 'আপডেট সংরক্ষণ করুন' : 'সংবাদ প্রকাশ করুন'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setFormData(emptyArticleForm)
                    setActiveTab('articles')
                  }}
                  className="px-5 py-3 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  বাতিল
                </button>
              </div>
            </form>
          )}

          {/* ================= TAB 5: BREAKING NEWS TICKER ================= */}
          {activeTab === 'breaking' && (
            <div className="space-y-6">
              {/* Form */}
              <form onSubmit={handleAddBreakingSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b pb-3 text-[#e30613] font-bold">
                  <Flame size={18} />
                  <span>নতুন ব্রেকিং নিউজ টিকার যোগ করুন</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      ব্রেকিং হেডলাইন (বাংলা) *
                    </label>
                    <input
                      type="text"
                      required
                      value={newBreakingBn}
                      onChange={(e) => setNewBreakingBn(e.target.value)}
                      placeholder="ঢাকায় আজ থেকে মেট্রোরেলের পূর্ণাঙ্গ সেবা চালু..."
                      className="w-full text-xs p-3 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      ব্রেকিং হেডলাইন (English)
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
                  ব্রেকিং টিকার প্রকাশ করুন
                </button>
              </form>

              {/* Active Items */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold text-sm text-gray-800 mb-4 border-b pb-2 flex items-center justify-between">
                  <span>চলমান ব্রেকিং স্ট্রিপ ({toBengaliNumber(breakingNews.length)} টি)</span>
                  <span className="text-xs font-normal text-gray-400">ওয়েবসাইটের লাল টিকারে স্লাইড হচ্ছে</span>
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

          {/* ================= TAB 6: OPINIONS MANAGEMENT ================= */}
          {activeTab === 'opinions' && (
            <div className="space-y-6">
              {/* Add Opinion Form */}
              <form onSubmit={handleAddOpinionSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b pb-3 text-[#e30613] font-bold">
                  <PenTool size={18} />
                  <span>নতুন কলাম ও সম্পাদকীয় প্রকাশ করুন</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">কলামিস্টের নাম (বাংলা) *</label>
                    <input
                      type="text"
                      required
                      value={newOpinion.author_bn}
                      onChange={(e) => setNewOpinion({ ...newOpinion, author_bn: e.target.value })}
                      placeholder="ড. মুহাম্মদ ইউনূস"
                      className="w-full text-xs p-2.5 border rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">পদবি ও পরিচিতি *</label>
                    <input
                      type="text"
                      required
                      value={newOpinion.author_role_bn}
                      onChange={(e) => setNewOpinion({ ...newOpinion, author_role_bn: e.target.value })}
                      placeholder="অর্থনীতিবিদ ও শান্তিতে নোবেল বিজয়ী"
                      className="w-full text-xs p-2.5 border rounded-lg outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">কলামের শিরোনাম (বাংলা) *</label>
                    <input
                      type="text"
                      required
                      value={newOpinion.title_bn}
                      onChange={(e) => setNewOpinion({ ...newOpinion, title_bn: e.target.value })}
                      placeholder="গণতন্ত্রের ভবিষ্যৎ ও আমাদের নাগরিক দায়িত্ব..."
                      className="w-full text-xs p-2.5 border rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">কলামিস্টের ছবি URL</label>
                    <input
                      type="url"
                      value={newOpinion.author_image}
                      onChange={(e) => setNewOpinion({ ...newOpinion, author_image: e.target.value })}
                      className="w-full text-xs p-2.5 border rounded-lg outline-none font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">সারসংক্ষেপ</label>
                  <textarea
                    rows="2"
                    value={newOpinion.summary_bn}
                    onChange={(e) => setNewOpinion({ ...newOpinion, summary_bn: e.target.value })}
                    placeholder="মতামতের মূল কথা..."
                    className="w-full text-xs p-2.5 border rounded-lg outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#e30613] hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors shadow"
                >
                  কলাম প্রকাশ করুন
                </button>
              </form>

              {/* Opinions List */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-sm text-gray-800">কলাম ও মতামত তালিকা</h3>
                  <span className="text-xs text-gray-500">মোট {toBengaliNumber(opinions.length)} টি মতামত</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {opinions.map((op) => (
                    <div key={op.id} className="p-4 rounded-lg border border-gray-200 flex gap-3 items-start justify-between">
                      <div className="flex gap-3 items-start">
                        <img src={op.author_image} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-red-500 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-xs text-gray-900">{op.author_bn}</h4>
                          <p className="text-[10px] text-red-600 font-semibold">{op.author_role_bn}</p>
                          <h5 className="font-bold text-xs text-gray-800 mt-1 line-clamp-1">{op.title_bn}</h5>
                          <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{op.summary_bn}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteOpinionClick(op.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 7: MULTIMEDIA ================= */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              {/* Add Photo Form */}
              <form onSubmit={handleAddPhotoSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b pb-2 text-[#e30613] font-bold">
                  <Camera size={18} />
                  <span>নতুন আলোকচিত্র (Photo Story) যোগ করুন</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">ছবির শিরোনাম (বাংলা) *</label>
                    <input
                      type="text"
                      required
                      value={newPhoto.title_bn}
                      onChange={(e) => setNewPhoto({ ...newPhoto, title_bn: e.target.value })}
                      placeholder="শরতের বিকেলে কাশবনের অপার সৌন্দর্য..."
                      className="w-full text-xs p-2.5 border rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">ছবির লিঙ্ক (Image URL) *</label>
                    <input
                      type="url"
                      required
                      value={newPhoto.image}
                      onChange={(e) => setNewPhoto({ ...newPhoto, image: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full text-xs p-2.5 border rounded-lg outline-none font-sans"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-[#e30613] hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors shadow"
                >
                  ছবি যোগ করুন
                </button>
              </form>

              {/* Photos List */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-sm text-gray-800 border-b pb-2 mb-4">আলোকচিত্র গ্যালারি ({toBengaliNumber(photos.length)} টি)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {photos.map((ph) => (
                    <div key={ph.id} className="rounded-lg overflow-hidden border border-gray-200 group relative">
                      <img src={ph.image} alt="" className="w-full h-28 object-cover" />
                      <div className="p-2 text-[11px] flex justify-between items-center">
                        <div className="truncate flex-1">
                          <p className="font-bold text-gray-900 truncate">{ph.title_bn}</p>
                          <p className="text-gray-400 text-[10px] truncate">{ph.credit_bn}</p>
                        </div>
                        <button
                          onClick={() => handleDeletePhotoClick(ph.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Video Form */}
              <form onSubmit={handleAddVideoSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b pb-2 text-[#e30613] font-bold">
                  <Video size={18} />
                  <span>নতুন ভিডিও প্রতিবেদন যোগ করুন</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">ভিডিও শিরোনাম (বাংলা) *</label>
                    <input
                      type="text"
                      required
                      value={newVideo.title_bn}
                      onChange={(e) => setNewVideo({ ...newVideo, title_bn: e.target.value })}
                      placeholder="এশিয়া কাপ ফাইনাল: জয়ের রোমাঞ্চকর মুহূর্তগুলো..."
                      className="w-full text-xs p-2.5 border rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">সময়কাল (Duration)</label>
                    <input
                      type="text"
                      value={newVideo.duration}
                      onChange={(e) => setNewVideo({ ...newVideo, duration: e.target.value })}
                      placeholder="৪:১৫"
                      className="w-full text-xs p-2.5 border rounded-lg outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">YouTube Embed লিঙ্ক</label>
                    <input
                      type="url"
                      value={newVideo.videoUrl}
                      onChange={(e) => setNewVideo({ ...newVideo, videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/embed/..."
                      className="w-full text-xs p-2.5 border rounded-lg outline-none font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">থাম্বনেইল ছবি URL</label>
                    <input
                      type="url"
                      value={newVideo.thumb}
                      onChange={(e) => setNewVideo({ ...newVideo, thumb: e.target.value })}
                      className="w-full text-xs p-2.5 border rounded-lg outline-none font-sans"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-[#e30613] hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors shadow"
                >
                  ভিডিও যোগ করুন
                </button>
              </form>

              {/* Videos List */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-sm text-gray-800 border-b pb-2 mb-4">ভিডিও প্রতিবেদন ({toBengaliNumber(videos.length)} টি)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {videos.map((v) => (
                    <div key={v.id} className="rounded-lg overflow-hidden border border-gray-200 p-3 flex gap-3 items-center justify-between">
                      <div className="flex gap-3 items-center">
                        <img src={v.thumb} alt="" className="w-20 h-14 object-cover rounded" />
                        <div className="text-xs">
                          <p className="font-bold text-gray-900 line-clamp-2">{v.title_bn}</p>
                          <span className="text-[10px] text-red-600 font-bold block mt-1">সময়কাল: {v.duration}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteVideoClick(v.id)}
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

          {/* ================= TAB 8: WEBSITE SETTINGS & DETAILS ================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Header Title & Top Save Button */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Globe size={22} className="text-[#e30613]" />
                    <span>ওয়েবসাইট সেটিংস ও বিবরণ (Website Settings & Details)</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    ওয়েবসাইটের নাম, লোগো, স্লোগান, সম্পাদকীয় তথ্য, যোগাযোগের ঠিকানা ও সোশ্যাল লিংক সরাসরি পরিচালনা করুন।
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetSiteSettingsToDefault}
                    className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    ডিফল্ট ফিরিয়ে আনুন
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                    className="flex items-center gap-2 bg-[#e30613] hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                  >
                    <Save size={15} />
                    <span>{isSavingSettings ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}</span>
                  </button>
                </div>
              </div>

              {/* 🌟 Interactive Live Header & Logo Preview Card */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b pb-2.5">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" />
                    <span>লাইভ ব্র্যান্ডিং প্রিভিউ (Live Header Preview)</span>
                  </span>
                  <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2.5 py-0.5 rounded-full">
                    সরাসরি দৃশ্যমান
                  </span>
                </div>
                <div className="p-4 bg-[#f8f9fa] border rounded-lg flex flex-wrap items-center justify-between gap-4">
                  <div className="bg-white p-3 rounded-lg border shadow-xs">
                    <ProthomAloLogo lang={lang} size="default" settings={siteForm} />
                  </div>
                  <div className="text-right space-y-1 text-xs">
                    <span className="inline-block bg-[#1a3a5c] text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                      {lang === 'bn' ? `সংস্করণ: ${siteForm.edition_bn || 'বাংলাদেশ'}` : `Edition: ${siteForm.edition_en || 'Bangladesh'}`}
                    </span>
                    <p className="text-[11px] text-gray-500">
                      বিজ্ঞাপন: <span className="font-semibold text-gray-700">{siteForm.ad_email || 'ads@prothomalo.com'}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Settings Form */}
              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* 1. Brand & Identity */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 border-b pb-2.5 flex items-center gap-2">
                    <Building size={16} className="text-[#e30613]" />
                    <span>১. ব্র্যান্ড ও ওয়েবসাইটের নাম (Branding, Name & Logo)</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        ওয়েবসাইটের নাম (বাংলা) *
                      </label>
                      <input
                        type="text"
                        required
                        value={siteForm.site_name_bn}
                        onChange={(e) => setSiteForm({ ...siteForm, site_name_bn: e.target.value })}
                        placeholder="যেমন: শীর্ষ সংবাদ"
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none font-semibold text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Website Name (English) *
                      </label>
                      <input
                        type="text"
                        required
                        value={siteForm.site_name_en}
                        onChange={(e) => setSiteForm({ ...siteForm, site_name_en: e.target.value })}
                        placeholder="e.g. Daily News"
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none font-semibold text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        স্লোগান / মূল বার্তা (বাংলা)
                      </label>
                      <input
                        type="text"
                        value={siteForm.tagline_bn}
                        onChange={(e) => setSiteForm({ ...siteForm, tagline_bn: e.target.value })}
                        placeholder="অনলাইন সংস্করণ • সত্যের সন্ধানে নির্ভীক"
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Tagline / Slogan (English)
                      </label>
                      <input
                        type="text"
                        value={siteForm.tagline_en}
                        onChange={(e) => setSiteForm({ ...siteForm, tagline_en: e.target.value })}
                        placeholder="Online Edition • Fearless in Pursuit of Truth"
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1 flex items-center justify-between">
                        <span>কাস্টম লোগো ছবির লিংক (Custom Logo Image URL)</span>
                        <span className="text-[10px] text-gray-400 font-normal">ঐচ্ছিক</span>
                      </label>
                      <input
                        type="url"
                        value={siteForm.logo_url}
                        onChange={(e) => setSiteForm({ ...siteForm, logo_url: e.target.value })}
                        placeholder="https://... (খালি রাখলে মূল ভেক্টর সূর্য প্রতীক ব্যবহৃত হবে)"
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">
                        টিপ: কোনো কাস্টম লোগোর ইমেজ URL বসালে তা দৃশ্যমান হবে, খালি রাখলে ডিফল্ট প্রতীক থাকবে।
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">সংস্করণ (বাংলা)</label>
                        <input
                          type="text"
                          value={siteForm.edition_bn}
                          onChange={(e) => setSiteForm({ ...siteForm, edition_bn: e.target.value })}
                          placeholder="বাংলাদেশ"
                          className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Edition (English)</label>
                        <input
                          type="text"
                          value={siteForm.edition_en}
                          onChange={(e) => setSiteForm({ ...siteForm, edition_en: e.target.value })}
                          placeholder="Bangladesh"
                          className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Editorial & Leadership */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 border-b pb-2.5 flex items-center gap-2">
                    <PenTool size={16} className="text-[#e30613]" />
                    <span>২. সম্পাদকীয় ও প্রকাশক পরিচিতি (Editorial & Publisher Details)</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        সম্পাদক ও প্রকাশক (বাংলা)
                      </label>
                      <input
                        type="text"
                        value={siteForm.editor_bn}
                        onChange={(e) => setSiteForm({ ...siteForm, editor_bn: e.target.value })}
                        placeholder="সম্পাদক ও প্রকাশক: মতিউর রহমান"
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Editor & Publisher (English)
                      </label>
                      <input
                        type="text"
                        value={siteForm.editor_en}
                        onChange={(e) => setSiteForm({ ...siteForm, editor_en: e.target.value })}
                        placeholder="Editor & Publisher: Matiur Rahman"
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        পোর্টাল সংক্ষিপ্ত বিবরণ / বায়ো (বাংলা)
                      </label>
                      <textarea
                        rows={2}
                        value={siteForm.about_bn}
                        onChange={(e) => setSiteForm({ ...siteForm, about_bn: e.target.value })}
                        placeholder="অনলাইন সংবাদ পোর্টালের বিস্তারিত পরিচিতি..."
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Portal Brief Bio (English)
                      </label>
                      <textarea
                        rows={2}
                        value={siteForm.about_en}
                        onChange={(e) => setSiteForm({ ...siteForm, about_en: e.target.value })}
                        placeholder="A leading and trusted 24/7 digital news publication..."
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Office & Contact Details */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 border-b pb-2.5 flex items-center gap-2">
                    <Phone size={16} className="text-[#e30613]" />
                    <span>৩. যোগাযোগের তথ্য ও অফিসের ঠিকানা (Office & Contact Info)</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        প্রধান কার্যালয় ঠিকানা (বাংলা)
                      </label>
                      <input
                        type="text"
                        value={siteForm.address_bn}
                        onChange={(e) => setSiteForm({ ...siteForm, address_bn: e.target.value })}
                        placeholder="প্রগতি ইনস্যুরেন্স ভবন, ২০-২১ কারওয়ান বাজার, ঢাকা ১২১৫"
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Head Office Address (English)
                      </label>
                      <input
                        type="text"
                        value={siteForm.address_en}
                        onChange={(e) => setSiteForm({ ...siteForm, address_en: e.target.value })}
                        placeholder="Pragati Insurance Bhaban, 20-21 Karwan Bazar, Dhaka 1215"
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        ফোন / হেল্পলাইন নম্বর
                      </label>
                      <input
                        type="text"
                        value={siteForm.phone}
                        onChange={(e) => setSiteForm({ ...siteForm, phone: e.target.value })}
                        placeholder="+৮৮০ ২ ৮১৮০০৭৮-৮১"
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        সাধারণ যোগাযোগ ইমেইল
                      </label>
                      <input
                        type="email"
                        value={siteForm.email}
                        onChange={(e) => setSiteForm({ ...siteForm, email: e.target.value })}
                        placeholder="info@prothomalo.com"
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        বিজ্ঞাপনের যোগাযোগ ইমেইল
                      </label>
                      <input
                        type="email"
                        value={siteForm.ad_email}
                        onChange={(e) => setSiteForm({ ...siteForm, ad_email: e.target.value })}
                        placeholder="ads@prothomalo.com"
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Social Media Links */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 border-b pb-2.5 flex items-center gap-2">
                    <Share2 size={16} className="text-[#e30613]" />
                    <span>৪. সামাজিক যোগাযোগ লিংক (Social Media Links)</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Facebook URL</label>
                      <input
                        type="url"
                        value={siteForm.facebook_url}
                        onChange={(e) => setSiteForm({ ...siteForm, facebook_url: e.target.value })}
                        placeholder="https://facebook.com/..."
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Twitter / X URL</label>
                      <input
                        type="url"
                        value={siteForm.twitter_url}
                        onChange={(e) => setSiteForm({ ...siteForm, twitter_url: e.target.value })}
                        placeholder="https://twitter.com/..."
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">YouTube URL</label>
                      <input
                        type="url"
                        value={siteForm.youtube_url}
                        onChange={(e) => setSiteForm({ ...siteForm, youtube_url: e.target.value })}
                        placeholder="https://youtube.com/..."
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Instagram URL</label>
                      <input
                        type="url"
                        value={siteForm.instagram_url}
                        onChange={(e) => setSiteForm({ ...siteForm, instagram_url: e.target.value })}
                        placeholder="https://instagram.com/..."
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">LinkedIn URL</label>
                      <input
                        type="url"
                        value={siteForm.linkedin_url}
                        onChange={(e) => setSiteForm({ ...siteForm, linkedin_url: e.target.value })}
                        placeholder="https://linkedin.com/..."
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Copyright Notices */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 border-b pb-2.5 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#e30613]" />
                    <span>৫. কপিরাইট ও ফুটার টেক্সট (Copyright Notice)</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        কপিরাইট টেক্সট (বাংলা)
                      </label>
                      <input
                        type="text"
                        value={siteForm.copyright_bn}
                        onChange={(e) => setSiteForm({ ...siteForm, copyright_bn: e.target.value })}
                        placeholder="স্বত্ব © ২০২৬ | সর্বস্বত্ব সংরক্ষিত।"
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Copyright Notice (English)
                      </label>
                      <input
                        type="text"
                        value={siteForm.copyright_en}
                        onChange={(e) => setSiteForm({ ...siteForm, copyright_en: e.target.value })}
                        placeholder="Copyright © 2026 | All rights reserved."
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Google AdSense ও অটো-বিজ্ঞাপন সেটিংস */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-amber-500 text-white rounded-lg">
                        <DollarSign size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">
                          ৬. গুগল অ্যাডসেন্স ও অটো বিজ্ঞাপন (Google AdSense & Auto Ads)
                        </h4>
                        <p className="text-xs text-gray-500">
                          আপনার Google AdSense একাউন্ট যুক্ত করুন এবং সাইটে স্বয়ংক্রিয় বিজ্ঞাপন চালু করুন।
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="adsenseEnableCheck"
                        checked={siteForm.adsense_enabled === '1' || siteForm.adsense_enabled === true || siteForm.adsense_enabled === 'true'}
                        onChange={(e) => setSiteForm({ ...siteForm, adsense_enabled: e.target.checked ? '1' : '0' })}
                        className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                      />
                      <label htmlFor="adsenseEnableCheck" className="text-xs font-bold text-gray-800 cursor-pointer">
                        AdSense চালু রাখুন
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Google AdSense Publisher ID (Client ID) *
                      </label>
                      <input
                        type="text"
                        value={siteForm.adsense_client_id}
                        onChange={(e) => setSiteForm({ ...siteForm, adsense_client_id: e.target.value })}
                        placeholder="ca-pub-1234567890123456"
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-amber-500 outline-none font-sans"
                      />
                      <span className="text-[11px] text-gray-500 mt-0.5 block">
                        আপনার গুগল অ্যাডসেন্স একাউন্ট থেকে প্রাপ্ত ca-pub-XXXXXXXXXXXXXXXX আইডি।
                      </span>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Google Auto Ads (স্বয়ংক্রিয় বিজ্ঞাপন)
                      </label>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          id="autoAdsCheck"
                          checked={siteForm.adsense_auto_ads === '1' || siteForm.adsense_auto_ads === true}
                          onChange={(e) => setSiteForm({ ...siteForm, adsense_auto_ads: e.target.checked ? '1' : '0' })}
                          className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                        />
                        <label htmlFor="autoAdsCheck" className="text-xs font-semibold text-gray-700 cursor-pointer">
                          গুগল এআই দ্বারা স্বয়ংক্রিয়ভাবে বিজ্ঞাপনের স্থান নির্বাচন করুন
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Ad Slots */}
                  <div className="border-t pt-4">
                    <span className="block font-bold text-xs text-gray-800 mb-3">
                      নির্দিষ্ট বিজ্ঞাপন স্লট আইডি (Responsive Ad Unit Slot IDs):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-gray-600 mb-1">হেডার লিডারবোর্ড স্লট আইডি</label>
                        <input
                          type="text"
                          value={siteForm.adsense_header_slot}
                          onChange={(e) => setSiteForm({ ...siteForm, adsense_header_slot: e.target.value })}
                          placeholder="যেমন: 1234567890"
                          className="w-full p-2 border rounded font-sans"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 mb-1">ইন-আর্টিকেল স্লট আইডি</label>
                        <input
                          type="text"
                          value={siteForm.adsense_article_slot}
                          onChange={(e) => setSiteForm({ ...siteForm, adsense_article_slot: e.target.value })}
                          placeholder="যেমন: 2345678901"
                          className="w-full p-2 border rounded font-sans"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 mb-1">সাইডবার স্লট আইডি</label>
                        <input
                          type="text"
                          value={siteForm.adsense_sidebar_slot}
                          onChange={(e) => setSiteForm({ ...siteForm, adsense_sidebar_slot: e.target.value })}
                          placeholder="যেমন: 3456789012"
                          className="w-full p-2 border rounded font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ads.txt Editor */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-xs text-gray-800">
                        Google AdSense ads.txt ফাইল কনটেন্ট
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const pub = (siteForm.adsense_client_id || '').replace('ca-', '').trim() || 'pub-XXXXXXXXXXXXXXXX'
                            setSiteForm({
                              ...siteForm,
                              ads_txt_content: `google.com, ${pub}, DIRECT, f08c47fec0942fa0`
                            })
                          }}
                          className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 hover:bg-amber-100"
                        >
                          + অটো লাইন তৈরি
                        </button>
                        <a
                          href="/ads.txt"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                        >
                          <ExternalLink size={12} />
                          <span>লাইভ ads.txt</span>
                        </a>
                      </div>
                    </div>
                    <textarea
                      rows="2"
                      value={siteForm.ads_txt_content}
                      onChange={(e) => setSiteForm({ ...siteForm, ads_txt_content: e.target.value })}
                      placeholder="google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0"
                      className="w-full p-2.5 border rounded font-mono text-xs outline-none bg-slate-50"
                    />
                  </div>
                </div>

                {/* 7. সার্চ ইঞ্জিন এসইও ও সাইট ভেরিফিকেশন (Global SEO) */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b pb-3">
                    <div className="p-2 bg-blue-600 text-white rounded-lg">
                      <Globe size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">
                        ৭. সার্চ ইঞ্জিন এসইও ও সাইট ভেরিফিকেশন (Search Console & Global SEO)
                      </h4>
                      <p className="text-xs text-gray-500">
                        Google Search Console এবং Bing Webmaster ভেরিফিকেশন কোড ও সাইটের ক্যানোনিকাল ডোমেন সেট করুন।
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Google Search Console ভেরিফিকেশন কোড
                      </label>
                      <input
                        type="text"
                        value={siteForm.google_site_verification}
                        onChange={(e) => setSiteForm({ ...siteForm, google_site_verification: e.target.value })}
                        placeholder="যেমন: abc123XYZ_sample_code"
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                      />
                      <span className="text-[11px] text-gray-500 mt-0.5 block">
                        গুগল সার্চ কনসোল HTML Tag মেথডের content এর মান দিন।
                      </span>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        Bing Webmaster Tools ভেরিফিকেশন কোড
                      </label>
                      <input
                        type="text"
                        value={siteForm.bing_site_verification}
                        onChange={(e) => setSiteForm({ ...siteForm, bing_site_verification: e.target.value })}
                        placeholder="যেমন: BING_VERIFICATION_KEY"
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                      />
                      <span className="text-[11px] text-gray-500 mt-0.5 block">
                        মাইক্রোসফট বিং ওয়েবমাস্টার মেটা ট্যাগের কোড।
                      </span>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        সাইটের মূল ক্যানোনিকাল ইউআরএল (Canonical Base URL)
                      </label>
                      <input
                        type="url"
                        value={siteForm.canonical_base_url}
                        onChange={(e) => setSiteForm({ ...siteForm, canonical_base_url: e.target.value })}
                        placeholder="https://www.yourdomain.com"
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-sans"
                      />
                      <span className="text-[11px] text-gray-500 mt-0.5 block">
                        আপনার পোর্টালের আসল ডোমেন অ্যাড্রেস (SSL সহ https://)।
                      </span>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        ডিফল্ট মেটা কিওয়ার্ডসমূহ (Meta Keywords)
                      </label>
                      <input
                        type="text"
                        value={siteForm.meta_keywords_default}
                        onChange={(e) => setSiteForm({ ...siteForm, meta_keywords_default: e.target.value })}
                        placeholder="সংবাদ, খবর, বাংলাদেশ, প্রথম আলো, ব্রেকিং নিউজ"
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Quick SEO Links Bar */}
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="font-bold text-gray-700">গুগল ও সার্চ ইঞ্জিনের প্রয়োজনীয় ফাইলসমূহ:</span>
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href="/sitemap.xml"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-white border border-gray-300 rounded font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 shadow-2xs"
                      >
                        <ExternalLink size={12} />
                        <span>🗺️ সাইটম্যাপ (/sitemap.xml)</span>
                      </a>
                      <a
                        href="/rss.xml"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-white border border-gray-300 rounded font-bold text-orange-600 hover:text-orange-800 flex items-center gap-1 shadow-2xs"
                      >
                        <ExternalLink size={12} />
                        <span>📰 আরএসএস ফিড (/rss.xml)</span>
                      </a>
                      <a
                        href="/robots.txt"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-white border border-gray-300 rounded font-bold text-gray-700 hover:text-black flex items-center gap-1 shadow-2xs"
                      >
                        <ExternalLink size={12} />
                        <span>🤖 রোবটস (/robots.txt)</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Save Bar */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="flex items-center gap-2 bg-[#e30613] hover:bg-red-700 text-white px-7 py-3 rounded-lg text-sm font-bold transition-all shadow-md disabled:opacity-50"
                  >
                    <Save size={16} />
                    <span>{isSavingSettings ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}</span>
                  </button>
                </div>
              </form>

              {/* Database Status, 1-Click Backup Export & Reset Card */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
                <h4 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                  <Database size={16} className="text-[#1a3a5c]" />
                  <span>ডাটাবেজ সিস্টেম হেলথ ও ব্যাকআপ টুলস</span>
                </h4>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-white rounded-lg border">
                      <span className="text-gray-500 block">ডাটাবেজ স্ট্যাটাস:</span>
                      <span className={`font-bold text-sm ${serverHealth.database === 'connected' ? 'text-green-700' : 'text-amber-700'}`}>
                        {serverHealth.database === 'connected' ? 'Connected (MySQL Online)' : 'Standalone Sync'}
                      </span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border">
                      <span className="text-gray-500 block">হোস্টিং কনফিগ:</span>
                      <span className="font-bold text-gray-800 text-sm">sql201.infinityfree.com</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border">
                      <span className="text-gray-500 block">অ্যাডমিন ইউজার:</span>
                      <span className="font-bold text-gray-800 text-sm">admin@mknews.com</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Database 1-Click Backup Export */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <h5 className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                        <Download size={14} />
                        <span>cPanel / phpMyAdmin SQL ব্যাকআপ ফাইল</span>
                      </h5>
                      <p className="text-[11px] text-blue-700 mt-0.5">
                        নিরাপদ `cpanel-database.sql` ফাইলটি ডাউনলোড করুন।
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadSQL}
                      className="flex items-center gap-1.5 bg-[#1a3a5c] hover:bg-[#122942] text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <Download size={13} />
                      <span>SQL ডাউনলোড</span>
                    </button>
                  </div>

                  {/* Reset to Sample Data */}
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <h5 className="font-bold text-xs text-red-900 flex items-center gap-1.5">
                        <RefreshCw size={14} />
                        <span>ডাটা রিসেট (Sample Data)</span>
                      </h5>
                      <p className="text-[11px] text-red-700 mt-0.5">
                        লোকাল ক্যাশ মুছে ডিফল্ট ডেমো ডেটায় ফিরুন।
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('আপনি কি সমস্ত ডেটা রিসেট করতে চান?')) {
                          onResetData?.()
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap"
                    >
                      ডেটা রিসেট
                    </button>
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
