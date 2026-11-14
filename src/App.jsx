import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

// Components
import Header from './components/Header.jsx'
import BreakingTicker from './components/BreakingTicker.jsx'
import Footer from './components/Footer.jsx'
import AdSenseScript from './components/AdSenseScript.jsx'

// Pages
import HomePage from './pages/HomePage.jsx'
import CategoryPage from './pages/CategoryPage.jsx'
import ArticlePage from './pages/ArticlePage.jsx'
import OpinionPage from './pages/OpinionPage.jsx'
import PhotosPage from './pages/PhotosPage.jsx'
import VideoPage from './pages/VideoPage.jsx'
import SearchPage from './pages/SearchPage.jsx'
import EPaperPage from './pages/EPaperPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import StaticPage from './pages/StaticPage.jsx'

// Data & API
import { defaultData } from './data.js'
import { api } from './api.js'

const STORAGE_KEY = 'prothom_alo_portal_data'
const LANG_STORAGE_KEY = 'prothom_alo_portal_lang'

export default function App() {
  const location = useLocation()

  // 1. Language State ('bn' | 'en')
  const [lang, setLang] = useState(() => {
    return localStorage.getItem(LANG_STORAGE_KEY) || 'bn'
  })

  const handleLangChange = (newLang) => {
    setLang(newLang)
    localStorage.setItem(LANG_STORAGE_KEY, newLang)
    document.documentElement.lang = newLang
  }

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // 2. Data State (Loaded from LocalStorage with fallback to defaultData)
  const [newsData, setNewsData] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed && Array.isArray(parsed.articles) && parsed.articles.length > 0) {
          return {
            ...defaultData,
            ...parsed,
          }
        }
      }
    } catch (err) {
      console.warn('Failed to parse cached portal data:', err)
    }
    return defaultData
  })

  // 3. Load authoritative news from the backend when it is available.
  useEffect(() => {
    let active = true
    const syncData = async () => {
      const results = await Promise.allSettled([
        api.getArticles(),
        api.getBreakingNews(),
        api.getCategories(),
        api.getSettings(),
      ])
      if (!active) return

      const updates = {}
      if (results[0].status === 'fulfilled') {
        updates.articles = results[0].value
      } else {
        console.error('Unable to load articles from the database:', results[0].reason)
      }
      if (results[1].status === 'fulfilled') {
        updates.breakingNews = results[1].value
      } else {
        console.error('Unable to load breaking news from the database:', results[1].reason)
      }
      if (results[2].status === 'fulfilled' && Array.isArray(results[2].value) && results[2].value.length > 0) {
        updates.categories = results[2].value
      }
      if (results[3].status === 'fulfilled' && results[3].value && typeof results[3].value === 'object') {
        updates.settings = results[3].value
      }

      setNewsData((prev) => {
        const updated = { ...prev, ...updates }
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        } catch (err) {
          console.error('LocalStorage save error:', err)
        }
        return updated
      })
    }

    syncData()
    return () => { active = false }
  }, [])

  // Persist data updates to LocalStorage
  const persistData = (updated) => {
    setNewsData(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (err) {
      console.error('LocalStorage save error:', err)
    }
  }

  // --- Article CRUD Handlers ---
  const handleAddArticle = (newArticle) => {
    const updated = {
      ...newsData,
      articles: [newArticle, ...newsData.articles],
    }
    persistData(updated)
  }

  const handleUpdateArticle = (updatedArticle) => {
    const updated = {
      ...newsData,
      articles: newsData.articles.map((a) => (a.id === updatedArticle.id ? updatedArticle : a)),
    }
    persistData(updated)
  }

  const handleDeleteArticle = (articleId) => {
    const updated = {
      ...newsData,
      articles: newsData.articles.filter((a) => a.id !== articleId),
    }
    persistData(updated)
  }

  // --- Breaking News CRUD Handlers ---
  const handleAddBreaking = (newItem) => {
    const updated = {
      ...newsData,
      breakingNews: [newItem, ...(newsData.breakingNews || [])],
    }
    persistData(updated)
  }

  const handleDeleteBreaking = (id) => {
    const updated = {
      ...newsData,
      breakingNews: (newsData.breakingNews || []).filter((item) => item.id !== id),
    }
    persistData(updated)
  }

  // --- Categories CRUD Handlers ---
  const handleAddCategory = (newCat) => {
    const updated = {
      ...newsData,
      categories: [...(newsData.categories || []), newCat],
    }
    persistData(updated)
  }

  const handleUpdateCategory = (updatedCat) => {
    const updated = {
      ...newsData,
      categories: (newsData.categories || []).map((c) =>
        c.id === updatedCat.id || c.slug === updatedCat.slug ? { ...c, ...updatedCat } : c
      ),
    }
    persistData(updated)
  }

  const handleDeleteCategory = (catIdOrSlug) => {
    const updated = {
      ...newsData,
      categories: (newsData.categories || []).filter((c) => c.id !== catIdOrSlug && c.slug !== catIdOrSlug),
    }
    persistData(updated)
  }

  // --- Opinions CRUD Handlers ---
  const handleAddOpinion = (newOpinion) => {
    const updated = {
      ...newsData,
      opinions: [newOpinion, ...(newsData.opinions || [])],
    }
    persistData(updated)
  }

  const handleDeleteOpinion = (id) => {
    const updated = {
      ...newsData,
      opinions: (newsData.opinions || []).filter((item) => item.id !== id),
    }
    persistData(updated)
  }

  // --- Photos CRUD Handlers ---
  const handleAddPhoto = (newPhoto) => {
    const updated = {
      ...newsData,
      photos: [newPhoto, ...(newsData.photos || [])],
    }
    persistData(updated)
  }

  const handleDeletePhoto = (id) => {
    const updated = {
      ...newsData,
      photos: (newsData.photos || []).filter((item) => item.id !== id),
    }
    persistData(updated)
  }

  // --- Videos CRUD Handlers ---
  const handleAddVideo = (newVideo) => {
    const updated = {
      ...newsData,
      videos: [newVideo, ...(newsData.videos || [])],
    }
    persistData(updated)
  }

  const handleDeleteVideo = (id) => {
    const updated = {
      ...newsData,
      videos: (newsData.videos || []).filter((item) => item.id !== id),
    }
    persistData(updated)
  }

  // --- Website Settings Handler ---
  const handleUpdateSettings = async (newSettings) => {
    try {
      await api.saveSettings(newSettings)
    } catch (err) {
      console.warn('Backend settings update notice:', err)
    }
    const updated = {
      ...newsData,
      settings: {
        ...(newsData.settings || {}),
        ...newSettings,
      },
    }
    persistData(updated)
  }

  const handleResetData = () => {
    localStorage.removeItem(STORAGE_KEY)
    window.location.reload()
  }

  const dynamicSiteName = (lang === 'bn' ? newsData.settings?.site_name_bn : newsData.settings?.site_name_en) ||
    (lang === 'bn' ? 'প্রথম আলো' : 'Prothom Alo')
  const dynamicTagline = (lang === 'bn' ? newsData.settings?.tagline_bn : newsData.settings?.tagline_en) ||
    (lang === 'bn' ? 'সংবাদ, বিশ্লেষণ, বিনোদন ও আন্তর্জাতিক খবর' : 'Latest Bangladesh and World News')

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff] text-[#1a1a1a]">
      <AdSenseScript settings={newsData.settings} />
      <Helmet>
        <html lang={lang} />
        <title>{`${dynamicSiteName} | ${dynamicTagline}`}</title>
      </Helmet>

      {/* Top Header (Hide only on admin dashboard for clean CMS view) */}
      {!location.pathname.startsWith('/admin') && (
        <>
          <Header
            lang={lang}
            onLangChange={handleLangChange}
            settings={newsData.settings}
            categories={newsData.categories}
            articles={newsData.articles}
          />

          {/* Breaking News Ticker (Hide on login page) */}
          {location.pathname !== '/login' && (
            <BreakingTicker
              items={newsData.breakingNews}
              lang={lang}
            />
          )}
        </>
      )}

      {/* Main Multi-page Routes */}
      <main className="flex-1">
        <Routes>
          {/* 1. Home Page */}
          <Route
            path="/"
            element={
              <HomePage
                articles={newsData.articles}
                opinions={newsData.opinions}
                photos={newsData.photos}
                videos={newsData.videos}
                categories={newsData.categories}
                settings={newsData.settings}
                lang={lang}
              />
            }
          />

          {/* 2. Login Page */}
          <Route
            path="/login"
            element={
              <LoginPage
                lang={lang}
                settings={newsData.settings}
              />
            }
          />

          {/* 3. Category Pages */}
          <Route
            path="/category/:slug"
            element={
              <CategoryPage
                articles={newsData.articles}
                categories={newsData.categories}
                settings={newsData.settings}
                lang={lang}
              />
            }
          />

          {/* 4. Article Details Page */}
          <Route
            path="/article/:slug"
            element={
              <ArticlePage
                articles={newsData.articles}
                categories={newsData.categories}
                settings={newsData.settings}
                lang={lang}
              />
            }
          />

          {/* 5. Opinion & Editorial Page */}
          <Route
            path="/opinion"
            element={
              <OpinionPage
                opinions={newsData.opinions}
                settings={newsData.settings}
                lang={lang}
              />
            }
          />

          {/* 6. Photo Gallery Page */}
          <Route
            path="/photos"
            element={
              <PhotosPage
                photos={newsData.photos}
                settings={newsData.settings}
                lang={lang}
              />
            }
          />

          {/* 7. Video News Page */}
          <Route
            path="/video"
            element={
              <VideoPage
                videos={newsData.videos}
                settings={newsData.settings}
                lang={lang}
              />
            }
          />

          {/* 8. Search Page */}
          <Route
            path="/search"
            element={
              <SearchPage
                articles={newsData.articles}
                settings={newsData.settings}
                lang={lang}
              />
            }
          />

          {/* 9. ePaper Digital Reader */}
          <Route
            path="/epaper"
            element={<EPaperPage lang={lang} settings={newsData.settings} />}
          />

          {/* 10. Admin CMS Dashboard */}
          <Route
            path="/admin"
            element={
              <AdminPage
                articles={newsData.articles}
                breakingNews={newsData.breakingNews}
                categories={newsData.categories}
                opinions={newsData.opinions}
                photos={newsData.photos}
                videos={newsData.videos}
                onAddArticle={handleAddArticle}
                onUpdateArticle={handleUpdateArticle}
                onDeleteArticle={handleDeleteArticle}
                onAddBreaking={handleAddBreaking}
                onDeleteBreaking={handleDeleteBreaking}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                onAddOpinion={handleAddOpinion}
                onDeleteOpinion={handleDeleteOpinion}
                onAddPhoto={handleAddPhoto}
                onDeletePhoto={handleDeletePhoto}
                onAddVideo={handleAddVideo}
                onDeleteVideo={handleDeleteVideo}
                onResetData={handleResetData}
                settings={newsData.settings}
                onUpdateSettings={handleUpdateSettings}
                lang={lang}
              />
            }
          />

          {/* 11. Static Pages */}
          <Route path="/about" element={<StaticPage lang={lang} settings={newsData.settings} />} />
          <Route path="/privacy" element={<StaticPage lang={lang} settings={newsData.settings} />} />
          <Route path="/terms" element={<StaticPage lang={lang} settings={newsData.settings} />} />
          <Route path="/contact" element={<StaticPage lang={lang} settings={newsData.settings} />} />
          <Route path="/advertise" element={<StaticPage lang={lang} settings={newsData.settings} />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer (Hide on admin dashboard) */}
      {!location.pathname.startsWith('/admin') && (
        <Footer
          lang={lang}
          settings={newsData.settings}
          categories={newsData.categories}
        />
      )}
    </div>
  )
}
