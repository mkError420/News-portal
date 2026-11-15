import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, Home } from 'lucide-react'
import SEO from '../components/SEO.jsx'
import { api } from '../api.js'

export default function LoginPage({ lang = 'bn', onLoginSuccess, settings = null }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const navigate = useNavigate()

  const siteName = (lang === 'bn' ? settings?.site_name_bn : settings?.site_name_en) ||
    (lang === 'bn' ? 'প্রথম কালো' : 'Prothom kalo')

  // If already logged in, redirect to admin
  useEffect(() => {
    api.checkAuth().then((user) => {
      if (user) {
        navigate('/admin', { replace: true })
      }
    }).catch((err) => console.error('Unable to verify the admin session:', err))
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    setLoading(true)

    try {
      const res = await api.login(email, password)
      if (res && res.success) {
        setSuccessMsg(lang === 'bn' ? 'লগইন সফল হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...' : 'Login successful! Redirecting to dashboard...')
        if (onLoginSuccess) onLoginSuccess(res.user)
        setTimeout(() => {
          navigate('/admin', { replace: true })
        }, 800)
      } else {
        setErrorMsg(res?.message || (lang === 'bn' ? 'ভুল ইমেইল বা পাসওয়ার্ড' : 'Invalid email or password'))
      }
    } catch (err) {
      setErrorMsg(err.message || (lang === 'bn' ? 'লগইন ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।' : 'Login failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12 font-bengali">
      <SEO
        title={lang === 'bn' ? 'অ্যাডমিন লগইন' : 'Admin Login'}
        noindex={true}
        lang={lang}
        settings={settings}
      />
      {/* Return to Home link */}
      <div className="w-full max-w-md mb-4 flex justify-between items-center text-xs text-gray-500">
        <Link to="/" className="flex items-center gap-1 hover:text-red-600 transition-colors">
          <Home size={13} />
          <span>{lang === 'bn' ? '← প্রচ্ছদে ফিরে যান' : '← Back to Homepage'}</span>
        </Link>
        {/*         <span className="text-gray-400">
          {lang === 'bn' ? 'নিরাপদ অ্যাডমিন পোর্টাল' : 'Secure Admin Portal'}
        </span> */}
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header Strip with Prothom Alo Red Top Border */}
        <div className="bg-[#1a3a5c] p-6 text-white text-center border-b-4 border-[#e30613]">
          <Link to="/" className="inline-block mb-1">
            <span
              className="text-3xl font-extrabold tracking-tight text-white block"
              style={{ color: '#ff4d4d', fontFamily: "'Hind Siliguri', 'Noto Serif Bengali', serif" }}
            >
              {siteName}
            </span>
          </Link>
          <h2 className="text-sm font-semibold text-gray-200 mt-1">
            {lang === 'bn' ? 'অ্যাডমিন কন্ট্রোল প্যানেল লগইন' : 'Admin Control Panel Sign In'}
          </h2>
        </div>

        <div className="p-6 sm:p-8">
          {/* Success Message Banner */}
          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Message Banner */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {lang === 'bn' ? 'অ্যাডমিন ইমেইল বা ইউজারনেম' : 'Admin Email or Username'}
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full text-xs pl-10 pr-3.5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-sans"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  {lang === 'bn' ? 'গোপন পাসওয়ার্ড' : 'Secret Password'}
                </label>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-10 pr-3.5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-sans"
                />
              </div>
            </div>

            {/* Remember & Notice */}
            <div className="flex items-center justify-between text-xs text-gray-600 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-red-600 focus:ring-red-500" />
                <span>{lang === 'bn' ? 'লগইন মনে রাখুন' : 'Remember me'}</span>
              </label>
              <span className="text-[11px] text-gray-400">
                {lang === 'bn' ? 'রক্ষণাবেক্ষণ পোর্টাল' : 'CMS Portal'}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#e30613] hover:bg-red-700 disabled:opacity-60 text-white font-bold py-3 rounded-lg text-sm transition-colors shadow flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>{lang === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...'}</span>
              ) : (
                <>
                  <span>{lang === 'bn' ? 'লগইন করে ড্যাশবোর্ডে প্রবেশ করুন' : 'Sign In to Dashboard'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          {/*       <div className="mt-6 p-3.5 bg-gray-50 border border-gray-200 rounded-lg text-xs space-y-2">
            <div className="flex items-center justify-between text-gray-700 font-bold">
              <span>{lang === 'bn' ? '🔑 ডিফল্ট অ্যাডমিন তথ্য:' : '🔑 Default Admin Credentials:'}</span>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@prothomalo.com')
                  setPassword('admin123')
                }}
                className="text-[11px] text-red-600 hover:text-red-700 font-semibold underline cursor-pointer"
              >
                {lang === 'bn' ? 'তথ্য পূরণ করুন (Auto-fill)' : 'Auto-fill'}
              </button>
            </div>
            <div className="text-[11px] text-gray-600 space-y-0.5 font-mono">
              <p><span className="text-gray-400 font-sans">ইমেইল / User:</span> admin@prothomalo.com</p>
              <p><span className="text-gray-400 font-sans">পাসওয়ার্ড / Pass:</span> admin123</p>
            </div>
          </div> */}

        </div>
      </div>
    </div>
  )
}

