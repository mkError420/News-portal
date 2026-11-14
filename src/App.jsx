import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

// Components
import Header from './components/Header.jsx'
import BreakingTicker from './components/BreakingTicker.jsx'
import Footer from './components/Footer.jsx'

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
import StaticPage from './pages/StaticPage.jsx'

// Data
import { defaultData } from './data.js'

const STORAGE_KEY = 'prothom_alo_portal_data'
const LANG_STORAGE_KEY = 'prothom_alo_portal_lang'

export default function App() {
  // 1. Language State ('bn' | 'en')
  const [lang, setLang] = useState(() => {
    return localStorage.getItem(LANG_STORAGE_KEY) || 'bn'
  })

  // Save language preference
  const handleLangChange = (newLang) => {
    setLang(newLang)
    localStorage.setItem(LANG_STORAGE_KEY, newLang)
    document.documentElement.lang = newLang
  }

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // 2. Data State (Loaded from LocalStorage with default fallback)
  const [newsData, setNewsData] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed && Array.isArray(parsed.articles) && parsed.articles.length > 0) {
          return parsed
        }
      }
    } catch (err) {
      console.warn('Failed to parse cached portal data:', err)
    }
    return defaultData
  })

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

  // --- Reset Data Handler ---
  const handleResetData = () => {
    persistData(defaultData)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f4f4] text-[#1a1a1a]">
      <Helmet>
        <html lang={lang} />
        <title>
          {lang === 'bn'
            ? 'প্রথম আলো | সংবাদ, বিশ্লেষণ, বিনোদন ও আন্তর্জাতিক খবর'
            : 'Prothom Alo | Latest Bangladesh and World News'}
        </title>
      </Helmet>

      {/* Top Header */}
      <Header
        lang={lang}
        onLangChange={handleLangChange}
      />

      {/* Breaking News Ticker */}
      <BreakingTicker
        items={newsData.breakingNews}
        lang={lang}
      />

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
                lang={lang}
              />
            }
          />

          {/* 2. Category Pages */}
          <Route
            path="/category/:slug"
            element={
              <CategoryPage
                articles={newsData.articles}
                lang={lang}
              />
            }
          />

          {/* 3. Article Details Page */}
          <Route
            path="/article/:slug"
            element={
              <ArticlePage
                articles={newsData.articles}
                lang={lang}
              />
            }
          />

          {/* 4. Opinion & Editorial Page */}
          <Route
            path="/opinion"
            element={
              <OpinionPage
                opinions={newsData.opinions}
                lang={lang}
              />
            }
          />

          {/* 5. Photo Gallery Page */}
          <Route
            path="/photos"
            element={
              <PhotosPage
                photos={newsData.photos}
                lang={lang}
              />
            }
          />

          {/* 6. Video News Page */}
          <Route
            path="/video"
            element={
              <VideoPage
                videos={newsData.videos}
                lang={lang}
              />
            }
          />

          {/* 7. Search Page */}
          <Route
            path="/search"
            element={
              <SearchPage
                articles={newsData.articles}
                lang={lang}
              />
            }
          />

          {/* 8. ePaper Digital Reader */}
          <Route
            path="/epaper"
            element={<EPaperPage lang={lang} />}
          />

          {/* 9. Admin CMS Dashboard */}
          <Route
            path="/admin"
            element={
              <AdminPage
                articles={newsData.articles}
                breakingNews={newsData.breakingNews}
                onAddArticle={handleAddArticle}
                onUpdateArticle={handleUpdateArticle}
                onDeleteArticle={handleDeleteArticle}
                onAddBreaking={handleAddBreaking}
                onDeleteBreaking={handleDeleteBreaking}
                onResetData={handleResetData}
                lang={lang}
              />
            }
          />

          {/* 10. Static Pages */}
          <Route path="/about" element={<StaticPage lang={lang} />} />
          <Route path="/privacy" element={<StaticPage lang={lang} />} />
          <Route path="/terms" element={<StaticPage lang={lang} />} />
          <Route path="/contact" element={<StaticPage lang={lang} />} />
          <Route path="/advertise" element={<StaticPage lang={lang} />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer lang={lang} />
    </div>
  )
}
