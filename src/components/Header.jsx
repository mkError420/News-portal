import { useState, useEffect, useRef } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Menu, X, Search, Globe, User, Bell, ChevronDown, Sparkles } from 'lucide-react'
import { NAV_ITEMS, formatBengaliDate, formatEnglishDate, UI_TEXT } from '../utils.js'

export default function Header({ lang = 'bn', onLangChange, onSearch }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState('')
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginMsg, setLoginMsg] = useState('')
  const searchInputRef = useRef(null)
  const navigate = useNavigate()

  const t = UI_TEXT[lang] || UI_TEXT.bn
  const todayStr = lang === 'bn' ? formatBengaliDate(new Date().toISOString()) : formatEnglishDate(new Date().toISOString())

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
      onSearch && onSearch(localSearch.trim())
      navigate(`/search?q=${encodeURIComponent(localSearch.trim())}`)
      setSearchOpen(false)
      setMobileOpen(false)
    }
  }

  const handleQuickLogin = (e) => {
    e.preventDefault()
    if (loginForm.username && loginForm.password) {
      setLoginMsg(lang === 'bn' ? 'সফলভাবে লগইন হয়েছে!' : 'Logged in successfully!')
      setTimeout(() => {
        setLoginModalOpen(false)
        setLoginMsg('')
      }, 1000)
    }
  }

  return (
    <>
      {/* 1. TOP UTILITY BAR (Prothom Alo Navy Blue #1a3a5c) */}
      <div className="bg-[#1a3a5c] text-white text-xs border-b border-[#224b75]">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between gap-3 font-bengali">
          {/* Left: Date & City Weather */}
          <div className="flex items-center gap-4 text-gray-200">
            <span className="font-medium tracking-wide">{todayStr}</span>
            <span className="hidden sm:inline-block text-gray-400">|</span>
            <span className="hidden sm:flex items-center gap-1 text-gray-300">
              <span>🌤</span>
              <span>{lang === 'bn' ? '২৭° সে., ঢাকা' : '27°C, Dhaka'}</span>
            </span>
          </div>

          {/* Right: Edition, Language Switcher, Notifications, Login */}
          <div className="flex items-center gap-3">
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

            {/* Login / Profile */}
            <button
              onClick={() => setLoginModalOpen(true)}
              className="flex items-center gap-1 text-gray-200 hover:text-yellow-300 transition-colors"
            >
              <User size={12} />
              <span>{t.login}</span>
            </button>

            {/* Admin shortcut */}
            <Link
              to="/admin"
              className="hidden md:inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded text-[11px] font-semibold transition-colors"
            >
              <Sparkles size={11} />
              <span>{lang === 'bn' ? 'অ্যাডমিন' : 'Admin'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER ROW (Logo, Header Leaderboard Ad, Search trigger) */}
      <header className="bg-white border-b border-gray-200 py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex flex-col group">
              <span
                className="font-extrabold tracking-tight leading-none text-[#e30613] group-hover:opacity-95 transition-opacity"
                style={{
                  fontSize: 'clamp(2rem, 4vw, 2.7rem)',
                  fontFamily: "'Hind Siliguri', 'Noto Serif Bengali', serif",
                }}
              >
                {lang === 'bn' ? 'প্রথম আলো' : 'Prothom Alo'}
              </span>
              <span className="text-[11px] font-medium text-gray-500 tracking-wider mt-0.5">
                {lang === 'bn' ? 'অনলাইন সংস্করণ • সত্যের সন্ধানে নির্ভীক' : 'Online Edition • Fearless in Pursuit of Truth'}
              </span>
            </Link>
          </div>

          {/* Leaderboard Ad Placeholder (Desktop 728x90) */}
          <div className="hidden lg:flex items-center justify-center flex-1 max-w-[728px] h-[75px] bg-[#f8f9fa] border border-dashed border-gray-300 rounded text-center px-4">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                {lang === 'bn' ? 'বিজ্ঞাপন' : 'Advertisement'}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {lang === 'bn' ? 'বিজ্ঞাপনের জন্য যোগাযোগ করুন: ads@prothomalo.com' : 'For advertisement queries: ads@prothomalo.com'}
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

      {/* LOGIN QUICK MODAL */}
      {loginModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={(e) => { if (e.target === e.currentTarget) setLoginModalOpen(false) }}
        >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative border border-gray-100 font-bengali">
            <button
              onClick={() => setLoginModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1"
            >
              <X size={20} />
            </button>
            <div className="text-center mb-5">
              <span className="text-2xl font-bold text-[#e30613] block">
                {lang === 'bn' ? 'প্রথম আলো' : 'Prothom Alo'}
              </span>
              <p className="text-sm text-gray-500 mt-1">
                {lang === 'bn' ? 'আপনার অ্যাকাউন্টে প্রবেশ করুন' : 'Sign in to your account'}
              </p>
            </div>

            {loginMsg && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center">
                {loginMsg}
              </div>
            )}

            <form onSubmit={handleQuickLogin} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {lang === 'bn' ? 'ইমেইল বা ফোন নম্বর' : 'Email or Phone'}
                </label>
                <input
                  type="text"
                  required
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                </label>
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#e30613] hover:bg-red-700 text-white font-bold py-2.5 rounded-lg transition-colors shadow-sm"
              >
                {t.login}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t text-center text-xs text-gray-500">
              <Link to="/admin" onClick={() => setLoginModalOpen(false)} className="text-red-600 font-semibold hover:underline">
                {lang === 'bn' ? 'অ্যাডমিন প্যানেলে প্রবেশ করুন →' : 'Go to Admin CMS →'}
              </Link>
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
              {lang === 'bn' ? 'প্রথম আলো' : 'Prothom Alo'}
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
          <NavLink
            to="/admin"
            onClick={() => setMobileOpen(false)}
            className="block px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            ⚡ {lang === 'bn' ? 'অ্যাডমিন প্যানেল (সংবাদ পরিচালনা)' : 'Admin CMS Portal'}
          </NavLink>
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              onLangChange && onLangChange(lang === 'bn' ? 'en' : 'bn')
              setMobileOpen(false)
            }}
            className="flex items-center gap-1 font-semibold text-blue-700"
          >
            <Globe size={13} />
            <span>{lang === 'bn' ? 'Switch to English' : 'বাংলা সংস্করণ'}</span>
          </button>
          <button onClick={() => { setMobileOpen(false); setLoginModalOpen(true) }} className="text-gray-700 font-medium">
            {t.login}
          </button>
        </div>
      </aside>
    </>
  )
}
