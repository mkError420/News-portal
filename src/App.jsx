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

const STORAGE_KEY = 'prothom_portal_data_v3'
const LANG_STORAGE_KEY = 'prothom_alo_portal_lang'
const GLOBE_FAVICON_DATA_URI = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9Imdsb2JlLWJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZTMwNjEzIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjYjgwMDEwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSIyMiIgZmlsbD0idXJsKCNnbG9iZS1iZykiLz48ZyBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMzMiIHN0cm9rZS13aWR0aD0iNi41Ii8+PGxpbmUgeDE9IjE3IiB5MT0iNTAiIHgyPSI4MyIgeTI9IjUwIiBzdHJva2Utd2lkdGg9IjYuNSIvPjxsaW5lIHgxPSI1MCIgeTE9IjE3IiB4Mj0iNTAiIHkyPSI4MyIgc3Ryb2tlLXdpZHRoPSI1Ii8+PGVsbGlwc2UgY3g9IjUwIiBjeT0iNTAiIHJ4PSIxNiIgcnk9IjMzIiBzdHJva2Utd2lkdGg9IjYuNSIvPjwvZz48L3N2Zz4='

export default function App() {
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(true)

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

  // 2. Data State (Loaded dynamically from database with clean empty baseline)
  const [newsData, setNewsData] = useState(() => {
    try {
      localStorage.removeItem('prothom_alo_portal_data') // Clear old static mock data cache
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed && typeof parsed === 'object') {
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

  // 3. Load authoritative news from the backend database dynamically
  const syncData = async () => {
    try {
      const results = await Promise.allSettled([
        api.getArticles(),
        api.getBreakingNews(),
        api.getCategories(),
        api.getSettings(),
        api.getOpinions(),
        api.getPhotos(),
        api.getVideos(),
        api.getRoles(),
        api.getStaff(),
        api.getPoll(),
        api.getPolls(),
      ])

      const updates = {}
      if (results[0].status === 'fulfilled' && Array.isArray(results[0].value)) {
        updates.articles = results[0].value
      } else {
        console.error('Unable to load articles from the database:', results[0].reason)
      }
      if (results[1].status === 'fulfilled' && Array.isArray(results[1].value)) {
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
      if (results[4].status === 'fulfilled' && Array.isArray(results[4].value)) {
        updates.opinions = results[4].value
      }
      if (results[5].status === 'fulfilled' && Array.isArray(results[5].value)) {
        updates.photos = results[5].value
      }
      if (results[6].status === 'fulfilled' && Array.isArray(results[6].value)) {
        updates.videos = results[6].value
      }
      if (results[7].status === 'fulfilled' && Array.isArray(results[7].value)) {
        updates.roles = results[7].value
      }
      if (results[8].status === 'fulfilled' && Array.isArray(results[8].value)) {
        updates.staff = results[8].value
      }
      if (results[9].status === 'fulfilled') {
        updates.poll = results[9].value || null
      }
      if (results[10].status === 'fulfilled' && Array.isArray(results[10].value)) {
        updates.polls = results[10].value
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
      return updates
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    syncData()
    return () => { active = false }
  }, [])

  // Sync favicon if custom setting is present, else default globe data URI
  useEffect(() => {
    const faviconHref = newsData.settings?.favicon_url?.trim() || GLOBE_FAVICON_DATA_URI
    const links = document.querySelectorAll("link[rel*='icon']")
    if (links.length > 0) {
      links.forEach((l) => {
        l.href = faviconHref
      })
    } else {
      const link = document.createElement('link')
      link.rel = 'icon'
      link.type = 'image/svg+xml'
      link.href = faviconHref
      document.head.appendChild(link)
    }
  }, [newsData.settings?.favicon_url])

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

  const handleUpdateBreaking = (updatedItem) => {
    const updated = {
      ...newsData,
      breakingNews: (newsData.breakingNews || []).map((item) =>
        item.id === updatedItem.id ? { ...item, ...updatedItem } : item
      ),
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
    const currentCats = Array.isArray(newsData.categories) ? newsData.categories : []
    const filtered = currentCats.filter(
      (c) => c.id !== newCat.id && (c.slug || '').toLowerCase() !== (newCat.slug || '').toLowerCase()
    )
    const updated = {
      ...newsData,
      categories: [...filtered, newCat],
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

  const handleUpdateOpinion = (updatedOpinion) => {
    const updated = {
      ...newsData,
      opinions: (newsData.opinions || []).map((item) =>
        item.id === updatedOpinion.id || item.slug === updatedOpinion.slug ? { ...item, ...updatedOpinion } : item
      ),
    }
    persistData(updated)
  }

  const handleDeleteOpinion = (id) => {
    const updated = {
      ...newsData,
      opinions: (newsData.opinions || []).filter((item) => item.id !== id && item.slug !== id),
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

  const handleUpdatePhoto = (updatedPhoto) => {
    const updated = {
      ...newsData,
      photos: (newsData.photos || []).map((item) =>
        item.id === updatedPhoto.id || item.slug === updatedPhoto.slug ? { ...item, ...updatedPhoto } : item
      ),
    }
    persistData(updated)
  }

  const handleDeletePhoto = (id) => {
    const updated = {
      ...newsData,
      photos: (newsData.photos || []).filter((item) => item.id !== id && item.slug !== id),
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

  const handleUpdateVideo = (updatedVideo) => {
    const updated = {
      ...newsData,
      videos: (newsData.videos || []).map((item) =>
        item.id === updatedVideo.id || item.slug === updatedVideo.slug ? { ...item, ...updatedVideo } : item
      ),
    }
    persistData(updated)
  }

  const handleDeleteVideo = (id) => {
    const updated = {
      ...newsData,
      videos: (newsData.videos || []).filter((item) => item.id !== id && item.slug !== id),
    }
    persistData(updated)
  }

  // --- Roles CRUD Handlers ---
  const handleAddRole = (newRole) => {
    const updated = {
      ...newsData,
      roles: [...(newsData.roles || []), newRole],
    }
    persistData(updated)
  }

  const handleUpdateRole = (updatedRole) => {
    const updated = {
      ...newsData,
      roles: (newsData.roles || []).map((item) =>
        item.id === updatedRole.id || item.role_key === updatedRole.role_key ? { ...item, ...updatedRole } : item
      ),
    }
    persistData(updated)
  }

  const handleDeleteRole = (idOrKey) => {
    const updated = {
      ...newsData,
      roles: (newsData.roles || []).filter((item) => item.id !== idOrKey && item.role_key !== idOrKey),
    }
    persistData(updated)
  }

  // --- Staff CRUD Handlers ---
  const handleAddStaff = (newStaff) => {
    const updated = {
      ...newsData,
      staff: [...(newsData.staff || []), newStaff],
    }
    persistData(updated)
  }

  const handleUpdateStaff = (updatedStaff) => {
    const updated = {
      ...newsData,
      staff: (newsData.staff || []).map((item) =>
        item.id === updatedStaff.id || item.email === updatedStaff.email ? { ...item, ...updatedStaff } : item
      ),
    }
    persistData(updated)
  }

  const handleDeleteStaff = (id) => {
    const updated = {
      ...newsData,
      staff: (newsData.staff || []).filter((item) => item.id !== id),
    }
    persistData(updated)
  }

  // --- Poll CRUD Handler ---
  const handleUpdatePoll = (updatedPoll) => {
    if (!updatedPoll) return
    const currentPolls = Array.isArray(newsData.polls) ? newsData.polls : []
    const exists = currentPolls.some((p) => p.id === updatedPoll.id)
    const newPollsList = exists
      ? currentPolls.map((p) => (p.id === updatedPoll.id ? { ...p, ...updatedPoll } : p))
      : [updatedPoll, ...currentPolls]

    const updated = {
      ...newsData,
      poll: updatedPoll.status === 'active' || !newsData.poll ? updatedPoll : newsData.poll,
      polls: newPollsList,
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
              articles={newsData.articles}
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
                poll={newsData.poll}
                onVote={handleUpdatePoll}
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
                breakingNews={newsData.breakingNews}
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
                roles={newsData.roles || []}
                staff={newsData.staff || []}
                poll={newsData.poll}
                polls={newsData.polls || []}
                onAddArticle={handleAddArticle}
                onUpdateArticle={handleUpdateArticle}
                onDeleteArticle={handleDeleteArticle}
                onAddBreaking={handleAddBreaking}
                onUpdateBreaking={handleUpdateBreaking}
                onDeleteBreaking={handleDeleteBreaking}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                onAddOpinion={handleAddOpinion}
                onUpdateOpinion={handleUpdateOpinion}
                onDeleteOpinion={handleDeleteOpinion}
                onAddPhoto={handleAddPhoto}
                onUpdatePhoto={handleUpdatePhoto}
                onDeletePhoto={handleDeletePhoto}
                onAddVideo={handleAddVideo}
                onUpdateVideo={handleUpdateVideo}
                onDeleteVideo={handleDeleteVideo}
                onAddRole={handleAddRole}
                onUpdateRole={handleUpdateRole}
                onDeleteRole={handleDeleteRole}
                onAddStaff={handleAddStaff}
                onUpdateStaff={handleUpdateStaff}
                onDeleteStaff={handleDeleteStaff}
                onUpdatePoll={handleUpdatePoll}
                onResetData={handleResetData}
                onRefreshAll={syncData}
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
