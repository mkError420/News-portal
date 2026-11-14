import { useState, useEffect, useRef } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Menu, X, Search, Globe, User, Bell, LogOut, Flame } from 'lucide-react'
import ProthomAloLogo from './ProthomAloLogo.jsx'
import {
  NAV_ITEMS,
  TRENDING_TOPICS,
  formatBengaliDate,
  formatEnglishDate,
  formatBengaliSolarDate,
  UI_TEXT,
} from '../utils.js'
import { api } from '../api.js'

export default function Header({ lang = 'bn', onLangChange, onSearch, settings = null }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState('')
  const [isAuth, setIsAuth] = useState(false)
  const searchInputRef = useRef(null)
  const navigate = useNavigate()

  const t = UI_TEXT[lang] || UI_TEXT.bn
  const todayStr = lang === 'bn' ? formatBengaliDate(new Date().toISOString()) : formatEnglishDate(new Date().toISOString())
  const bengaliSolarStr = formatBengaliSolarDate(new Date())

  useEffect(() => {
    api.checkAuth()
      .then((user) => setIsAuth(!!user))
      .catch((err) => console.error('Unable to verify the admin session:', err))
  }, [])

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }, [searchOpen])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (localSearch.trim()) {
      onSearch?.(localSearch.trim())
      navigate(`/search?q=${encodeURIComponent(localSearch.trim())}`)
      setSearchOpen(false)
      setMobileOpen(false)
    }
  }

  const handleLogout = async () => {
    try {
      await api.logout()
      setIsAuth(false)
      navigate('/')
    } catch (err) {
      console.error('Unable to end the admin session:', err)
      alert(lang === 'bn' ? 'লগআউট করা যায়নি। আবার চেষ্টা করুন।' : 'Unable to log out. Please try again.')
    }
  }

  return (
    <>
      {/* 1. TOP UTILITY BAR (Prothom Alo Navy Blue #1a3a5c) */}
      <div className="bg-[#1a3a5c] text-white text-xs border-b border-[#224b75]">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between gap-3 font-bengali">
          {/* Left: Date, Bengali Calendar & City Weather */}
          <div className="flex items-center gap-3 sm:gap-4 text-gray-200 overflow-x-auto scrollbar-none py-0.5">
            <span className="font-medium tracking-wide whitespace-nowrap">{todayStr}</span>
            {lang === 'bn' && (
              <>
                <span className="hidden md:inline-block text-gray-400">|</span>
                <span className="hidden md:inline-block text-yellow-300 font-medium whitespace-nowrap">
                  {bengaliSolarStr}
                </span>
              </>
            )}
            <span className="hidden sm:inline-block text-gray-400">|</span>
            <span className="hidden sm:flex items-center gap-1 text-gray-300 whitespace-nowrap">
              <span>🌤</span>
              <span>{lang === 'bn' ? 'ঢাকা ২৭° সে., আংশিক মেঘলা' : 'Dhaka 27°C, Partly Cloudy'}</span>
            </span>
            <span className="hidden lg:inline-block text-gray-400">|</span>
            <span className="hidden lg:inline-block text-gray-300 text-[11px] whitespace-nowrap">
              {lang === 'bn' ? (settings?.edition_bn ? `সংস্করণ: ${settings.edition_bn}` : 'সংস্করণ: বাংলাদেশ') : (settings?.edition_en ? `Edition: ${settings.edition_en}` : 'Edition: Bangladesh')}
            </span>
          </div>

          {/* Right: Language Switcher, Notifications, Login */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Language Switch Pill */}
            <button
              onClick={() => onLangChange && onLangChange(lang === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-white/30 hover:border-white bg-white/10 hover:bg-white/20 transition-all font-semibold text-[11px]"
              title={lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
            >
              <Globe size={12} className="text-red-400" />
              <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>

            {/* Notification Bell */}
            <button
              className="p-1 text-gray-300 hover:text-white transition-colors relative"
              title={lang === 'bn' ? 'বিজ্ঞপ্তি' : 'Notifications'}
              onClick={() => alert(lang === 'bn' ? 'আপনার কোনো নতুন বিজ্ঞপ্তি নেই।' : 'No new notifications.')}
            >
              <Bell size={13} />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>

            <span className="text-gray-500 hidden sm:inline">|</span>

            {/* Login / Auth State (Prothom Alo standard: Clean Login when logged out, Dashboard/Logout when logged in) */}
            {isAuth ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1 bg-[#e30613] hover:bg-red-700 text-white px-2.5 py-0.5 rounded text-[11px] font-semibold transition-colors shadow-sm"
                  title={lang === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Admin Dashboard'}
                >
                  <User size={11} />
                  <span>{lang === 'bn' ? 'অ্যাডমিন' : 'Admin'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors font-medium text-xs ml-1"
                  title={lang === 'bn' ? 'লগআউট করুন' : 'Logout'}
                >
                  <LogOut size={12} />
                  <span className="hidden sm:inline">{lang === 'bn' ? 'লগআউট' : 'Logout'}</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 text-gray-200 hover:text-white transition-colors font-medium text-xs px-2 py-0.5 rounded hover:bg-white/10"
              >
                <User size={12} />
                <span>{t.login}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER ROW (Logo, Header Leaderboard Ad, Search trigger) */}
      <header className="bg-white border-b border-gray-200 py-3.5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
          {/* Logo Brand with Authentic Prothom Alo Calligraphy & Symbol */}
          <div className="flex items-center gap-3">
            <ProthomAloLogo lang={lang} settings={settings} />
          </div>

          {/* Leaderboard Ad Placeholder (Desktop 728x90) */}
          <div className="hidden lg:flex items-center justify-center flex-1 max-w-[728px] h-[75px] bg-[#f8f9fa] border border-dashed border-gray-300 rounded text-center px-4">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                {lang === 'bn' ? 'বিজ্ঞাপন' : 'Advertisement'}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {lang === 'bn'
                  ? `বিজ্ঞাপনের জন্য যোগাযোগ করুন: ${settings?.ad_email || 'ads@prothomalo.com'}`
                  : `For advertisement queries: ${settings?.ad_email || 'ads@prothomalo.com'}`}
              </span>
            </div>
          </div>

          {/* Right Action Icons: Search + Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-gray-200 hover:border-red-500 hover:text-red-600 bg-gray-50 text-gray-700 text-xs font-semibold transition-all"
              title={t.search}
            >
              <Search size={15} />
              <span className="hidden sm:inline">{t.search}</span>
            </button>

            <Link
              to="/epaper"
              className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-full border border-blue-200 text-blue-800 bg-blue-50 hover:bg-blue-100 text-xs font-semibold transition-all"
            >
              📰 <span>{lang === 'bn' ? 'ই-পেপার' : 'ePaper'}</span>
            </Link>

            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* 3. STICKY HORIZONTAL CATEGORY NAVIGATION BAR */}
      <nav className="bg-white border-b-2 border-[#e30613] shadow-sm sticky top-0 z-30 font-bengali">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center overflow-x-auto scrollbar-none py-0">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `px-3 py-2.5 text-[14px] font-semibold whitespace-nowrap border-b-2 transition-all flex items-center gap-1 ${
                    isActive
                      ? 'text-[#e30613] border-[#e30613] bg-red-50/50'
                      : 'text-[#1a1a1a] border-transparent hover:text-[#e30613] hover:border-red-300'
                  }`
                }
              >
                {lang === 'bn' ? item.label_bn : item.label_en}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* 4. TRENDING TOPICS STRIP (আলোচিত বিষয় / Trending Topics Bar) */}
      <div className="bg-[#fcfcfc] border-b border-gray-200 py-1.5 font-bengali text-xs">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="flex-shrink-0 font-bold text-[#e30613] flex items-center gap-1">
            <Flame size={13} className="text-red-600 fill-current" />
            <span>{lang === 'bn' ? 'আলোচিত বিষয়:' : 'Trending Topics:'}</span>
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {TRENDING_TOPICS.map((topic, i) => (
              <button
                key={i}
                onClick={() => {
                  onSearch?.(topic.query)
                  navigate(`/search?q=${encodeURIComponent(topic.query)}`)
                }}
                className="px-2.5 py-0.5 rounded-full bg-white hover:bg-red-50 text-gray-700 hover:text-[#e30613] border border-gray-200 hover:border-red-300 transition-colors whitespace-nowrap text-[12px] font-medium shadow-2xs"
              >
                #{lang === 'bn' ? topic.bn : topic.en}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SEARCH MODAL OVERLAY */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false) }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100">
            <form onSubmit={handleSearchSubmit} className="flex items-center p-2">
              <Search size={22} className="ml-3 text-red-600 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="flex-1 px-3 py-3 text-base text-gray-800 placeholder-gray-400 outline-none font-bengali"
              />
              <button
                type="submit"
                className="bg-[#e30613] hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors mr-2"
              >
                {t.search}
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </form>
            <div className="bg-gray-50 border-t border-gray-100 px-5 py-2.5 flex items-center justify-between text-xs text-gray-500">
              <span>{lang === 'bn' ? 'দ্রুত খুঁজুন: রাজনীতি, ক্রিকেট, বাজেট, আবহাওয়া' : 'Quick search: Politics, Cricket, Budget, Weather'}</span>
              <kbd className="bg-white border px-1.5 py-0.5 rounded text-[11px] shadow-sm">ESC</kbd>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE DRAWER */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity lg:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 lg:hidden flex flex-col font-bengali ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 bg-[#1a3a5c] text-white flex items-center justify-between">
          <div>
            <span className="text-xl font-bold tracking-tight text-red-400 block">
              {(lang === 'bn' ? settings?.site_name_bn : settings?.site_name_en) || (lang === 'bn' ? 'প্রথম আলো' : 'Prothom Alo')}
            </span>
            <span className="text-[11px] text-gray-300">{todayStr}</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-1 text-gray-300 hover:text-white">
            <X size={22} />
          </button>
        </div>

        {/* Mobile Search */}
        <div className="p-3 border-b border-gray-100 bg-gray-50">
          <form onSubmit={handleSearchSubmit} className="flex items-center bg-white border rounded-lg px-2.5 py-1.5">
            <Search size={16} className="text-gray-400 mr-2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full text-xs outline-none bg-transparent"
            />
          </form>
        </div>

        {/* Category Links */}
        <div className="flex-1 overflow-y-auto py-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 text-sm font-semibold border-b border-gray-50 transition-colors ${
                  isActive ? 'text-[#e30613] bg-red-50/70 border-l-4 border-l-[#e30613]' : 'text-gray-800 hover:text-[#e30613]'
                }`
              }
            >
              {lang === 'bn' ? item.label_bn : item.label_en}
            </NavLink>
          ))}
          {isAuth ? (
            <NavLink
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              {lang === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Admin Dashboard'}
            </NavLink>
          ) : (
            <NavLink
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {lang === 'bn' ? 'লগইন' : 'Login'}
            </NavLink>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              onLangChange?.(lang === 'bn' ? 'en' : 'bn')
              setMobileOpen(false)
            }}
            className="flex items-center gap-1 font-semibold text-blue-700"
          >
            <Globe size={13} />
            <span>{lang === 'bn' ? 'Switch to English' : 'বাংলা সংস্করণ'}</span>
          </button>
          {isAuth ? (
            <button
              onClick={() => {
                handleLogout()
                setMobileOpen(false)
              }}
              className="text-red-600 font-bold hover:underline"
            >
              {lang === 'bn' ? 'লগআউট' : 'Logout'}
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="text-red-600 font-bold hover:underline"
            >
              {t.login}
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}
