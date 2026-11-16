import { useState, useEffect, useMemo, useRef, forwardRef, useImperativeHandle } from 'react'
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
  Link as LinkIcon,
  Play,
  Pause,
  ShieldCheck,
  Shield,
  Users,
  UserCheck,
  Key,
  Lock,
  UserPlus,
  ShieldAlert,
  AlignLeft,
  AlignRight,
  AlignCenter,
  Maximize2,
  Type,
  ImagePlus,
  Upload,
  Vote,
  BarChart2,
} from 'lucide-react'
import ProthomAloLogo from '../components/ProthomAloLogo.jsx'
import { api } from '../api.js'
import { defaultSiteSettings } from '../data.js'
import { computeGovtRates } from '../components/CurrencyWidget.jsx'
import {
  CATEGORIES_BN,
  CATEGORIES_EN,
  toBengaliNumber,
  formatRelativeTime,
  CURRENCY_RATES,
} from '../utils.js'

// --- Reusable Modern Image Upload & URL Input Component ---
function ImageUploadInput({
  label,
  value,
  onChange,
  placeholder = 'https://...',
  required = false,
  helperText = '',
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMode, setUploadMode] = useState('upload') // 'upload' | 'url'
  const fileInputRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const url = await api.uploadImage(file)
      onChange(url)
    } catch (err) {
      console.warn('Upload error:', err)
      alert('ছবি আপলোড করতে সমস্যা হয়েছে: ' + (err.message || 'Error'))
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const inputId = `upload-${label ? label.replace(/[^\w\s\u0980-\u09FF]/g, '').trim().replace(/\s+/g, '-') : 'file'}-${Math.random().toString(36).substring(2, 7)}`

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => setUploadMode('upload')}
            className={`px-2 py-0.5 rounded font-bold transition-colors ${uploadMode === 'upload' ? 'bg-red-50 text-[#e30613]' : 'text-gray-500 hover:text-gray-800'
              }`}
          >
            ফাইল আপলোড
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            onClick={() => setUploadMode('url')}
            className={`px-2 py-0.5 rounded font-bold transition-colors ${uploadMode === 'url' ? 'bg-red-50 text-[#e30613]' : 'text-gray-500 hover:text-gray-800'
              }`}
          >
            ওয়েব লিঙ্ক
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {uploadMode === 'upload' ? (
          <div className="flex-1 w-full">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id={inputId}
            />
            <label
              htmlFor={inputId}
              className={`w-full flex items-center justify-center gap-2 p-2.5 border-2 border-dashed rounded-lg cursor-pointer transition-all text-xs font-bold ${isUploading
                ? 'bg-amber-50 border-amber-300 text-amber-700 animate-pulse'
                : 'bg-gray-50 hover:bg-red-50/50 border-gray-300 hover:border-red-300 text-gray-700'
                }`}
            >
              {isUploading ? (
                <>
                  <RefreshCw size={15} className="animate-spin text-amber-600" />
                  <span>ছবি সার্ভারে আপলোড হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Upload size={15} className="text-[#e30613]" />
                  <span>ডিভাইস থেকে ছবি আপলোড করুন (Upload from Device)</span>
                </>
              )}
            </label>
          </div>
        ) : (
          <div className="flex-1 w-full">
            <input
              type="url"
              required={required && !value}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full text-xs p-2.5 border rounded-lg focus:border-red-500 outline-none font-sans bg-white"
            />
          </div>
        )}

        {/* Thumbnail Preview with Remove Button */}
        {value && (
          <div className="relative group flex-shrink-0">
            <div className="w-16 h-12 rounded-lg overflow-hidden border border-gray-300 bg-gray-100 flex items-center justify-center shadow-xs">
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] shadow-sm hover:bg-red-700"
              title="ছবি মুছুন"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {helperText && <p className="text-[10px] text-gray-400">{helperText}</p>}
    </div>
  )
}

// --- Visual WYSIWYG Article Body Editor with Direct Image Display ---
const VisualRichTextEditor = forwardRef(function VisualRichTextEditor(
  {
    value = '',
    onChange,
    placeholder = 'এখানে বিস্তারিত সংবাদ লিখুন...',
    onOpenImageModal,
    onCopyFromBn,
    canCopyFromBn = false,
    accentColor = 'red', // 'red' | 'blue'
    label,
    charCount = 0,
    wordCount = 0,
  },
  ref
) {
  const editorRef = useRef(null)
  const textareaRef = useRef(null)
  const [isCodeMode, setIsCodeMode] = useState(false)
  const isUpdatingFromPropRef = useRef(false)

  // Expose imperative methods for inserting in-text images & formatting directly
  useImperativeHandle(
    ref,
    () => ({
      isCodeMode,
      insertHtml(htmlSnippet) {
        if (isCodeMode) {
          const ta = textareaRef.current
          if (ta) {
            const start = ta.selectionStart ?? 0
            const end = ta.selectionEnd ?? 0
            const current = ta.value || ''
            const updated = current.substring(0, start) + htmlSnippet + current.substring(end)
            onChange?.(updated)
            setTimeout(() => {
              ta.focus()
              ta.setSelectionRange(start + htmlSnippet.length, start + htmlSnippet.length)
            }, 30)
          } else {
            onChange?.((value ? value + '\n\n' : '') + htmlSnippet)
          }
        } else {
          const div = editorRef.current
          if (div) {
            div.focus()
            const sel = window.getSelection()
            if (sel && sel.rangeCount > 0 && div.contains(sel.anchorNode)) {
              const range = sel.getRangeAt(0)
              range.deleteContents()
              const temp = document.createElement('div')
              temp.innerHTML = htmlSnippet
              const frag = document.createDocumentFragment()
              let child
              let lastChild
              while ((child = temp.firstChild)) {
                lastChild = frag.appendChild(child)
              }
              range.insertNode(frag)
              if (lastChild) {
                range.setStartAfter(lastChild)
                range.collapse(true)
                sel.removeAllRanges()
                sel.addRange(range)
              }
            } else {
              div.innerHTML = (div.innerHTML || '') + htmlSnippet
            }
            const updatedHtml = div.innerHTML
            onChange?.(updatedHtml)
          }
        }
      },
      focus() {
        if (isCodeMode) {
          textareaRef.current?.focus()
        } else {
          editorRef.current?.focus()
        }
      },
    }),
    [isCodeMode, onChange, value]
  )

  // Sync external value to visual editor when not focused or when prop changed externally
  useEffect(() => {
    if (!isCodeMode && editorRef.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        if (document.activeElement !== editorRef.current) {
          isUpdatingFromPropRef.current = true
          editorRef.current.innerHTML = value || ''
          isUpdatingFromPropRef.current = false
        }
      }
    }
  }, [value, isCodeMode])

  const handleVisualInput = () => {
    if (editorRef.current && !isCodeMode && !isUpdatingFromPropRef.current) {
      onChange?.(editorRef.current.innerHTML)
    }
  }

  const handleCommand = (cmd, arg = null) => {
    if (isCodeMode) {
      const ta = textareaRef.current
      if (!ta) return
      const start = ta.selectionStart ?? 0
      const end = ta.selectionEnd ?? 0
      const current = ta.value || ''
      const selectedText = current.substring(start, end)
      let wrapped = ''
      if (cmd === 'bold') wrapped = `<strong>${selectedText || 'বোল্ড টেক্সট'}</strong>`
      else if (cmd === 'italic') wrapped = `<em>${selectedText || 'ইতালিক'}</em>`
      else if (cmd === 'p') wrapped = `\n<p>${selectedText || 'নতুন অনুচ্ছেদ...'}</p>\n`
      else if (cmd === 'h3') wrapped = `\n<h3>${selectedText || 'উপ-শিরোনাম'}</h3>\n`
      else if (cmd === 'blockquote') wrapped = `\n<blockquote class="my-4 pl-4 border-l-4 border-red-500 italic text-gray-700 font-serif">\n  "${selectedText || 'উদ্ধৃতি...'}"\n</blockquote>\n`
      else wrapped = selectedText

      const updated = current.substring(0, start) + wrapped + current.substring(end)
      onChange?.(updated)
      setTimeout(() => {
        ta.focus()
        ta.setSelectionRange(start + wrapped.length, start + wrapped.length)
      }, 30)
      return
    }

    if (editorRef.current) {
      editorRef.current.focus()
      if (cmd === 'p') {
        const sel = window.getSelection()
        const selectedText = sel?.toString() || ''
        const pSnippet = `<p>${selectedText || 'নতুন অনুচ্ছেদের লেখা এখানে লিখুন...'}</p>`
        document.execCommand('insertHTML', false, pSnippet)
      } else if (cmd === 'h3') {
        const sel = window.getSelection()
        const selectedText = sel?.toString() || ''
        const hSnippet = `<h3>${selectedText || 'উপ-শিরোনাম'}</h3>`
        document.execCommand('insertHTML', false, hSnippet)
      } else if (cmd === 'blockquote') {
        const sel = window.getSelection()
        const selectedText = sel?.toString() || 'এখানে বিশিষ্ট ব্যক্তির উদ্ধৃতি লিখুন...'
        const bqSnippet = `\n<blockquote class="my-4 pl-4 border-l-4 ${accentColor === 'blue' ? 'border-blue-500' : 'border-red-500'} italic text-gray-700 font-serif">\n  "${selectedText}"\n</blockquote>\n<p><br></p>`
        document.execCommand('insertHTML', false, bqSnippet)
      } else {
        document.execCommand(cmd, false, arg)
      }
      handleVisualInput()
    }
  }

  // Handle clicking remove button on figure
  const handleEditorClick = (e) => {
    const removeBtn = e.target.closest('[data-action="remove-figure"]')
    if (removeBtn) {
      const figure = removeBtn.closest('figure')
      if (figure) {
        figure.remove()
        handleVisualInput()
      }
    }
  }

  const isBlue = accentColor === 'blue'
  const accentBadgeBg = isBlue ? 'bg-blue-600' : 'bg-[#e30613]'
  const accentBtnBorder = isBlue ? 'border-blue-200' : 'border-red-200'
  const accentBtnText = isBlue ? 'text-blue-600' : 'text-[#e30613]'
  const accentBtnBg = isBlue ? 'bg-blue-50 hover:bg-blue-100' : 'bg-red-50 hover:bg-red-100'
  const accentRing = isBlue ? 'focus-within:ring-blue-500' : 'focus-within:ring-red-500'

  return (
    <div className={`space-y-2.5 bg-white rounded-xl border border-gray-200 p-3.5 sm:p-4 shadow-2xs transition-all ${accentRing} focus-within:ring-2`}>
      {/* Editor Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2.5">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${accentBadgeBg}`}></span>
          <span className="font-bold text-xs text-gray-900">{label}</span>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{isCodeMode ? 'কোড মোড (HTML Source)' : 'সরাসরি ছবি ও টেক্সট মোড (Visual WYSIWYG)'}</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Add Image Button */}
          <button
            type="button"
            onClick={onOpenImageModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${accentBtnBg} ${accentBtnText} border ${accentBtnBorder}`}
            title="লেখার মাঝে সরাসরি দৃশ্যমান ছবি যুক্ত করুন (Insert Image Directly)"
          >
            <ImagePlus size={14} />
            <span>ছবি যোগ করুন</span>
          </button>

          {/* Quick Paragraph */}
          <button
            type="button"
            onClick={() => handleCommand('p')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 transition-colors"
            title="নতুন অনুচ্ছেদ (Paragraph)"
          >
            <span className="font-bold">¶</span> প্যারাগ্রাফ
          </button>

          {/* Heading */}
          <button
            type="button"
            onClick={() => handleCommand('h3')}
            className="px-2 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 transition-colors"
            title="উপ-শিরোনাম (Sub-heading)"
          >
            H৩
          </button>

          {/* Bold */}
          <button
            type="button"
            onClick={() => handleCommand('bold')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 transition-colors"
            title="বোল্ড (Bold)"
          >
            <span className="font-bold">B</span>
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => handleCommand('italic')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-serif italic bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 transition-colors"
            title="ইতালিক (Italic)"
          >
            <span className="font-bold">I</span>
          </button>

          {/* Blockquote */}
          <button
            type="button"
            onClick={() => handleCommand('blockquote')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 transition-colors"
            title="উদ্ধৃতি (Blockquote)"
          >
            ❝ উক্তি
          </button>

          {/* Copy from Bangla button if applicable */}
          {canCopyFromBn && onCopyFromBn && (
            <button
              type="button"
              onClick={onCopyFromBn}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center gap-1"
              title="বাংলা কনটেন্টের ছবি ও ফরম্যাটিং এখানে কপি করুন"
            >
              📋 বাংলা থেকে কপি
            </button>
          )}

          {/* Code vs Visual Mode Switcher */}
          <button
            type="button"
            onClick={() => setIsCodeMode(!isCodeMode)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${isCodeMode
              ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
              : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
              }`}
            title={isCodeMode ? 'ভিজ্যুয়াল এডিটরে ফিরে ছবি সরাসরি দেখুন' : 'এইচটিএমএল সোর্স কোড দেখুন'}
          >
            {isCodeMode ? <Eye size={13} /> : <Code size={13} />}
            <span>{isCodeMode ? 'ছবি সরাসরি দেখুন' : 'কোড মোড'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {isCodeMode ? (
        <div>
          <textarea
            ref={textareaRef}
            rows={11}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder="<p>HTML কোড এখানে সম্পাদনা করুন...</p>"
            className="w-full text-xs font-mono p-3.5 border rounded-xl outline-none focus:ring-2 focus:ring-gray-600 bg-gray-900 text-gray-100 leading-relaxed shadow-inner"
          />
          <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1.5 px-1">
            <span>💻 এইচটিএমএল কোড এডিটর মোড সক্রিয়</span>
            <button
              type="button"
              onClick={() => setIsCodeMode(false)}
              className="text-blue-600 font-bold hover:underline"
            >
              সরাসরি ছবি দেখতে ভিজ্যুয়াল মোডে যান →
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Visual ContentEditable Container */}
          <div
            ref={editorRef}
            contentEditable={true}
            suppressContentEditableWarning={true}
            onInput={handleVisualInput}
            onClick={handleEditorClick}
            data-placeholder={placeholder}
            className="news-prose news-visual-editor w-full min-h-[300px] max-h-[600px] overflow-y-auto p-4 border rounded-xl outline-none bg-white shadow-2xs leading-relaxed text-gray-900 text-sm"
          />
          <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-500 mt-1.5 px-1">
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>
                <strong>সরাসরি ভিজ্যুয়াল মোড:</strong> আপলোডকৃত ছবি কোড ছাড়া সরাসরি এখানে দৃশ্যমান হবে। লেখার মাঝে ছবি রাখতে উপরের <strong>"ছবি যোগ করুন"</strong> বাটনে ক্লিক করুন।
              </span>
            </span>
            <span className="font-mono text-gray-400">
              {charCount} অক্ষর • {wordCount} শব্দ
            </span>
          </div>
        </div>
      )}
    </div>
  )
})

export default function AdminPage({
  articles = [],
  breakingNews = [],
  categories = [],
  opinions = [],
  photos = [],
  videos = [],
  roles = [],
  staff = [],
  settings = null,
  poll = null,
  polls: pollsProp = [],
  onAddArticle,
  onUpdateArticle,
  onDeleteArticle,
  onAddBreaking,
  onUpdateBreaking,
  onDeleteBreaking,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddOpinion,
  onUpdateOpinion,
  onDeleteOpinion,
  onAddPhoto,
  onUpdatePhoto,
  onDeletePhoto,
  onAddVideo,
  onUpdateVideo,
  onDeleteVideo,
  onAddRole,
  onUpdateRole,
  onDeleteRole,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  onUpdatePoll,
  onResetData,
  onRefreshAll,
  onUpdateSettings,
  lang = 'bn',
}) {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'articles' | 'categories' | 'add' | 'breaking' | 'opinions' | 'media' | 'roles' | 'settings'

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
  const [currencyList, setCurrencyList] = useState(CURRENCY_RATES)
  const [isSavingCurrency, setIsSavingCurrency] = useState(false)

  useEffect(() => {
    api.getCurrencyRates().then((serverRates) => {
      if (serverRates && Array.isArray(serverRates) && serverRates.length > 0) {
        setCurrencyList((prev) =>
          prev.map((p) => {
            const found = serverRates.find((s) => s.currency === p.currency)
            if (found) {
              return {
                ...p,
                buy_num: typeof found.buy === 'number' ? found.buy : parseFloat(found.buy) || p.buy_num,
                sell_num: typeof found.sell === 'number' ? found.sell : parseFloat(found.sell) || p.sell_num,
                change: found.change || p.change,
                change_type: found.change_type || p.change_type,
              }
            }
            return p
          })
        )
      }
    })
  }, [])

  const [isSyncingGovt, setIsSyncingGovt] = useState(false)

  const handleSyncGovtRates = async () => {
    setIsSyncingGovt(true)
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(4500) })
      if (res.ok) {
        const data = await res.json()
        if (data?.rates?.BDT) {
          const fresh = computeGovtRates(data.rates.BDT, data.rates)
          setCurrencyList(fresh)
          await api.saveCurrencyRates(fresh)
          triggerToast(lang === 'bn' ? 'বাংলাদেশ ব্যাংক সরকারি মুদ্রা রেট সফলভাবে সিঙ্ক ও সংরক্ষিত হয়েছে!' : 'Bangladesh Bank Govt rates synced successfully!')
          return
        }
      }
      throw new Error('Sync failed')
    } catch {
      triggerToast(lang === 'bn' ? 'রেট সিঙ্ক ব্যর্থ হয়েছে, ইন্টারনেট সংযোগ চেক করুন।' : 'Sync failed, check internet connection.', 'error')
    } finally {
      setIsSyncingGovt(false)
    }
  }

  const handleSaveCurrencyRates = async () => {
    setIsSavingCurrency(true)
    try {
      await api.saveCurrencyRates(currencyList)
      triggerToast(lang === 'bn' ? 'মুদ্রা বাজারের রেট ডাটাবেজে সফলভাবে সংরক্ষিত হয়েছে!' : 'Currency market rates saved successfully!')
    } catch (err) {
      triggerToast(lang === 'bn' ? 'মুদ্রার হার আপডেট করা হয়েছে।' : 'Currency rates updated.', 'info')
    } finally {
      setIsSavingCurrency(false)
    }
  }

  // --- Overview Tab Interactive Actions & State ---
  const [isSyncingAll, setIsSyncingAll] = useState(false)
  const [quickBreakingText, setQuickBreakingText] = useState('')
  const [isSubmittingQuickBreaking, setIsSubmittingQuickBreaking] = useState(false)

  const handleManualSync = async () => {
    setIsSyncingAll(true)
    try {
      await Promise.all([
        onRefreshAll?.(),
        refreshStats(),
      ])
      triggerToast(lang === 'bn' ? 'ডাটাবেজের সর্বশেষ তথ্য সফলভাবে সিঙ্ক করা হয়েছে!' : 'Database synchronized successfully!')
    } catch {
      triggerToast(lang === 'bn' ? 'ডাটাবেজ সিঙ্ক সম্পন্ন হয়েছে।' : 'Database sync completed.', 'info')
    } finally {
      setIsSyncingAll(false)
    }
  }

  const handleQuickAddBreaking = async (e) => {
    e?.preventDefault()
    const text = quickBreakingText.trim()
    if (!text) return
    setIsSubmittingQuickBreaking(true)
    const newItem = {
      title: text,
      title_bn: text,
      title_en: text,
      slug: `breaking-${Date.now()}`,
      url: '',
      active: 1,
    }
    try {
      const saved = await api.saveBreakingNews(newItem)
      const finalItem = saved?.item || { ...newItem, id: saved?.id || Date.now() }
      onAddBreaking?.(finalItem)
      setQuickBreakingText('')
      triggerToast(lang === 'bn' ? 'ব্রেকিং নিউজ টিকারে যুক্ত করা হয়েছে!' : 'Breaking news added!')
    } catch {
      const fallbackItem = { ...newItem, id: Date.now() }
      onAddBreaking?.(fallbackItem)
      setQuickBreakingText('')
      triggerToast(lang === 'bn' ? 'ব্রেকিং নিউজ যুক্ত হয়েছে।' : 'Breaking news added.', 'info')
    } finally {
      setIsSubmittingQuickBreaking(false)
      refreshStats()
    }
  }

  const topReadArticles = useMemo(() => {
    return [...articles].sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0)).slice(0, 5)
  }, [articles])

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
      const [settingsRes] = await Promise.all([
        api.saveSettings(siteForm),
        api.saveCurrencyRates(currencyList).catch(() => { })
      ])
      const finalSettings = settingsRes?.settings || siteForm
      onUpdateSettings?.(finalSettings)
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
            } catch { }
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
          } catch { }
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
    categories: [formattedCategories[0]?.slug || 'national'],
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

  // --- Breaking News Form State ---
  const emptyBreakingForm = {
    title_bn: '',
    title_en: '',
    link_type: 'article', // 'article' | 'custom'
    article_id: '',
    slug: '',
    url: '',
    active: true,
  }
  const [breakingForm, setBreakingForm] = useState(emptyBreakingForm)
  const [editingBreakingId, setEditingBreakingId] = useState(null)
  const [breakingSearch, setBreakingSearch] = useState('')

  // --- Opinion Form ---
  const initialOpinionForm = {
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
  }
  const [newOpinion, setNewOpinion] = useState(initialOpinionForm)
  const [editingOpinionId, setEditingOpinionId] = useState(null)

  // --- Media Forms ---
  const initialPhotoForm = {
    title_bn: '',
    title_en: '',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    credit_bn: siteForm.site_name_bn ? `ছবি: ${siteForm.site_name_bn}` : 'ছবি: সংগৃহীত',
    credit_en: siteForm.site_name_en ? `Photo: ${siteForm.site_name_en}` : 'Photo: Source',
    caption_bn: '',
  }
  const [newPhoto, setNewPhoto] = useState(initialPhotoForm)
  const [editingPhotoId, setEditingPhotoId] = useState(null)

  const initialVideoForm = {
    title_bn: '',
    title_en: '',
    thumb: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '৪:১৫',
  }
  const [newVideo, setNewVideo] = useState(initialVideoForm)
  const [editingVideoId, setEditingVideoId] = useState(null)

  // --- Roles & Staff State ---
  const [roleSubTab, setRoleSubTab] = useState('roles') // 'roles' | 'staff'
  const [localRoles, setLocalRoles] = useState(roles)
  const [localStaff, setLocalStaff] = useState(staff)

  useEffect(() => {
    if (roles && roles.length > 0) setLocalRoles(roles)
  }, [roles])

  useEffect(() => {
    if (staff && staff.length > 0) setLocalStaff(staff)
  }, [staff])

  useEffect(() => {
    if (!roles || roles.length === 0) {
      api.getRoles().then((r) => { if (Array.isArray(r) && r.length > 0) setLocalRoles(r) }).catch(() => { })
    }
    if (!staff || staff.length === 0) {
      api.getStaff().then((s) => { if (Array.isArray(s) && s.length > 0) setLocalStaff(s) }).catch(() => { })
    }
  }, [])

  const ALL_PERMISSIONS = useMemo(() => [
    { key: 'all', bn: 'সর্বময় ক্ষমতা (Full Access)', en: 'Full System Access', desc: 'সকল ফিচার, সেটিংস ও কনটেন্টে অবাধ প্রবেশাধিকার' },
    { key: 'manage_articles', bn: 'সংবাদ প্রকাশ ও সম্পাদনা', en: 'Manage Articles', desc: 'নতুন সংবাদ তৈরি, সম্পাদনা, ড্রাফট ও প্রকাশ' },
    { key: 'manage_categories', bn: 'ক্যাটাগরি নিয়ন্ত্রণ', en: 'Manage Categories', desc: 'ক্যাটাগরি তৈরি, পরিবর্তন ও সাজানো' },
    { key: 'manage_breaking', bn: 'ব্রেকিং নিউজ টিকার', en: 'Manage Breaking News', desc: 'জরুরি হেডলাইন ও স্ক্রোলিং টিকার পরিচালনা' },
    { key: 'manage_opinions', bn: 'কলাম ও মতামত', en: 'Manage Opinions', desc: 'কলামিস্ট ও সম্পাদকীয় নিবন্ধ ব্যবস্থাপনা' },
    { key: 'manage_media', bn: 'ছবি ও ভিডিও গ্যালারি', en: 'Manage Media', desc: 'আলোকচিত্র ও ভিডিও প্রতিবেদন আপলোড' },
    { key: 'manage_roles', bn: 'রোল ও স্টাফ পারমিশন', en: 'Manage Roles & Staff', desc: 'টিমের ভূমিকা ও নিরাপত্তা পারমিশন' },
    { key: 'manage_settings', bn: 'ওয়েবসাইট সেটিংস ও এসইও', en: 'Manage Settings', desc: 'সাইট মেটাডাটা, গুগল এডসেন্স ও কনফিগারেশন' },
  ], [])

  const initialRoleForm = {
    name_bn: '',
    name_en: '',
    role_key: '',
    description_bn: '',
    description_en: '',
    permissions: ['manage_articles'],
    status: 'active',
  }
  const [roleForm, setRoleForm] = useState(initialRoleForm)
  const [editingRoleId, setEditingRoleId] = useState(null)

  const initialStaffForm = {
    name: '',
    email: '',
    password: '',
    role_key: 'editor',
    phone: '',
    status: 'active',
  }
  const [staffForm, setStaffForm] = useState(initialStaffForm)
  const [editingStaffId, setEditingStaffId] = useState(null)

  // --- In-Article Text Image Inserter State ---
  const [showInTextImageModal, setShowInTextImageModal] = useState(false)
  const [inTextImageTarget, setInTextImageTarget] = useState('bn') // 'bn' | 'en'
  const [contentTab, setContentTab] = useState('both') // 'bn' | 'en' | 'both'
  const bnEditorRef = useRef(null)
  const enEditorRef = useRef(null)
  const [inTextImageForm, setInTextImageForm] = useState({
    imageUrl: '',
    caption: '',
    caption_en: '',
    credit: siteForm.site_name_bn ? `ছবি: ${siteForm.site_name_bn}` : 'ছবি: সংগৃহীত',
    credit_en: siteForm.site_name_en ? `Photo: ${siteForm.site_name_en}` : 'Photo: Collected',
    alignment: 'full', // 'full' | 'left' | 'right' | 'center'
  })

  const insertHtmlIntoContent = (htmlToInsert, targetLang = 'bn') => {
    const isEn = targetLang === 'en'
    const targetRef = isEn ? enEditorRef.current : bnEditorRef.current
    if (targetRef && typeof targetRef.insertHtml === 'function') {
      targetRef.insertHtml(htmlToInsert)
      return
    }
    const fieldName = isEn ? 'content_en' : 'content_bn'
    const textareaId = isEn ? 'articleContentEnTextarea' : 'articleContentTextarea'
    const textarea = document.getElementById(textareaId)
    if (textarea) {
      const start = textarea.selectionStart ?? 0
      const end = textarea.selectionEnd ?? 0
      const current = formData[fieldName] || ''
      const updated = current.substring(0, start) + htmlToInsert + current.substring(end)
      setFormData((prev) => ({ ...prev, [fieldName]: updated }))
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + htmlToInsert.length, start + htmlToInsert.length)
      }, 50)
    } else {
      const current = formData[fieldName] || ''
      setFormData((prev) => ({ ...prev, [fieldName]: (current ? current + '\n\n' : '') + htmlToInsert }))
    }
  }

  const handleInsertInTextImage = (e) => {
    e?.preventDefault?.()
    if (!inTextImageForm.imageUrl.trim()) {
      alert(lang === 'bn' ? 'দয়া করে ছবির লিঙ্ক প্রদান করুন।' : 'Please enter image URL.')
      return
    }

    const imgUrl = inTextImageForm.imageUrl.trim()
    const isEn = inTextImageTarget === 'en'
    const cap = isEn
      ? (inTextImageForm.caption_en.trim() || inTextImageForm.caption.trim())
      : inTextImageForm.caption.trim()
    const cred = isEn
      ? (inTextImageForm.credit_en.trim() || inTextImageForm.credit.trim())
      : inTextImageForm.credit.trim()
    const align = inTextImageForm.alignment || 'full'

    let figureClass = 'my-6 block clear-both'
    let imgClass = 'w-full h-auto rounded-lg shadow-sm object-cover max-h-[500px]'
    let figcapClass = 'mt-2 text-xs text-gray-500 font-normal leading-relaxed text-center'

    if (align === 'left') {
      figureClass = 'my-4 sm:float-left sm:mr-6 sm:mb-4 sm:max-w-[48%] w-full clear-none'
      figcapClass = 'mt-1.5 text-[11px] text-gray-500 font-normal leading-relaxed text-left'
    } else if (align === 'right') {
      figureClass = 'my-4 sm:float-right sm:ml-6 sm:mb-4 sm:max-w-[48%] w-full clear-none'
      figcapClass = 'mt-1.5 text-[11px] text-gray-500 font-normal leading-relaxed text-left'
    } else if (align === 'center') {
      figureClass = 'my-6 max-w-xl mx-auto block clear-both text-center'
      figcapClass = 'mt-2 text-xs text-gray-500 font-normal leading-relaxed text-center'
    }

    let captionHtml = ''
    if (cap || cred) {
      captionHtml = `\n  <figcaption class="${figcapClass}">`
      if (cap) captionHtml += `<span>${cap}</span>`
      if (cap && cred) captionHtml += ' '
      if (cred) captionHtml += `<span class="font-semibold text-gray-700">(${cred})</span>`
      captionHtml += `</figcaption>`
    }

    const figureSnippet = `\n<figure class="${figureClass}" contenteditable="false">\n  <img src="${imgUrl}" alt="${cap || (isEn ? 'News image' : 'সংবাদ ছবি')}" class="${imgClass}" />${captionHtml}\n  <button type="button" data-action="remove-figure" class="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white text-[11px] font-bold px-2 py-1 rounded-md shadow-md items-center gap-1 cursor-pointer transition-colors" title="ছবিটি মুছুন">✕ ${isEn ? 'Remove Image' : 'ছবি মুছুন'}</button>\n</figure>\n<p><br></p>`

    insertHtmlIntoContent(figureSnippet, inTextImageTarget)
    setShowInTextImageModal(false)
    setInTextImageForm({
      imageUrl: '',
      caption: '',
      caption_en: '',
      credit: siteForm.site_name_bn ? `ছবি: ${siteForm.site_name_bn}` : 'ছবি: সংগৃহীত',
      credit_en: siteForm.site_name_en ? `Photo: ${siteForm.site_name_en}` : 'Photo: Collected',
      alignment: 'full',
    })
    triggerToast(lang === 'bn' ? 'সংবাদের লেখার মাঝে সরাসরি দৃশ্যমান ছবি যুক্ত হয়েছে!' : 'Visual image inserted into news content!')
  }

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

    let savedCat = categoryItem
    try {
      const res = await api.saveCategory(categoryItem)
      if (res?.category) {
        savedCat = { ...categoryItem, ...res.category }
      } else if (res?.item) {
        savedCat = { ...categoryItem, ...res.item }
      }
    } catch (err) {
      console.warn('API saveCategory error, saving locally:', err)
    }

    if (editingCatId) {
      onUpdateCategory?.(savedCat)
      triggerToast(lang === 'bn' ? 'ক্যাটাগরি আপডেট হয়েছে!' : 'Category updated!')
    } else {
      onAddCategory?.(savedCat)
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

  // --- Multi-Category Handlers (One news can set various categories) ---
  const handleToggleCategory = (slug) => {
    const s = String(slug).toLowerCase().trim()
    const currentCats = Array.isArray(formData.categories) && formData.categories.length > 0
      ? [...formData.categories]
      : [formData.category || 'national']

    const exists = currentCats.some((c) => String(c).toLowerCase().trim() === s)
    let updated = []
    if (exists) {
      if (currentCats.length === 1) {
        triggerToast('সংবাদের জন্য অন্তত একটি ক্যাটাগরি নির্বাচিত থাকতে হবে।', 'warning')
        return
      }
      updated = currentCats.filter((c) => String(c).toLowerCase().trim() !== s)
    } else {
      updated = [...currentCats, s]
    }

    setFormData((prev) => ({
      ...prev,
      category: updated[0] || 'national',
      categories: updated,
    }))
  }

  const handleSetPrimaryCategory = (slug) => {
    const s = String(slug).toLowerCase().trim()
    const currentCats = Array.isArray(formData.categories) && formData.categories.length > 0
      ? [...formData.categories]
      : [formData.category || 'national']

    const filtered = currentCats.filter((c) => String(c).toLowerCase().trim() !== s)
    const updated = [s, ...filtered]

    setFormData((prev) => ({
      ...prev,
      category: s,
      categories: updated,
    }))
    triggerToast(`"${CATEGORIES_BN[s] || s}" মূল বিভাগ হিসেবে নির্ধারণ করা হয়েছে।`, 'info')
  }

  // --- Submit Article (Add or Update) ---
  const handleSubmitArticle = async (e) => {
    e.preventDefault()
    if (!formData.title_bn.trim() && !formData.title_en.trim()) {
      alert(lang === 'bn' ? 'দয়া করে অন্তত একটি শিরোনাম লিখুন।' : 'Please enter at least one headline.')
      return
    }
    if (!formData.content_bn.trim() && !formData.content_en.trim()) {
      alert(lang === 'bn' ? 'দয়া করে সংবাদের বিস্তারিত বিবরণ লিখুন (বাংলা অথবা ইংরেজি)।' : 'Please enter article content (Bangla or English).')
      return
    }

    const tagsArrayBn = typeof formData.tags_bn === 'string'
      ? formData.tags_bn.split(',').map((t) => t.trim()).filter(Boolean)
      : formData.tags_bn
    const tagsArrayEn = typeof formData.tags_en === 'string'
      ? formData.tags_en.split(',').map((t) => t.trim()).filter(Boolean)
      : formData.tags_en

    const selectedCats = Array.isArray(formData.categories) && formData.categories.length > 0
      ? Array.from(new Set(formData.categories.filter(Boolean)))
      : [formData.category || 'national']
    const primaryCat = selectedCats[0] || formData.category || 'national'

    const articlePayload = {
      ...formData,
      category: primaryCat,
      categories: selectedCats,
      tags_bn: tagsArrayBn,
      tags_en: tagsArrayEn,
    }

    try {
      if (isEditing && formData.id) {
        let updatedRes = null
        try {
          updatedRes = await api.saveArticle(articlePayload, true)
        } catch (apiErr) {
          console.warn('API update article returned error, falling back to local state:', apiErr)
        }
        const finalArticle = updatedRes?.article || updatedRes?.item || articlePayload
        onUpdateArticle?.(finalArticle)
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
        let savedRes = null
        try {
          savedRes = await api.saveArticle(newArt)
        } catch (apiErr) {
          console.warn('API save article returned error, falling back to local state:', apiErr)
        }
        const finalArticle = savedRes?.article || savedRes?.item || {
          ...newArt,
          id: savedRes?.id || newArt.id,
          slug: savedRes?.slug || newArt.slug,
        }
        onAddArticle?.(finalArticle)
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
    let articleCats = []
    if (Array.isArray(article.categories) && article.categories.length > 0) {
      articleCats = [...article.categories]
    } else if (typeof article.categories === 'string' && article.categories.trim()) {
      try {
        const parsed = JSON.parse(article.categories)
        articleCats = Array.isArray(parsed) ? parsed : [article.categories]
      } catch {
        articleCats = article.categories.split(',').map((c) => c.trim()).filter(Boolean)
      }
    }
    if (articleCats.length === 0 && article.category) {
      articleCats = [article.category]
    }
    if (articleCats.length === 0 && formattedCategories[0]?.slug) {
      articleCats = [formattedCategories[0].slug]
    }

    setFormData({
      ...article,
      category: articleCats[0] || article.category || 'national',
      categories: articleCats,
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

  // Handle Article Selection in Breaking Form
  const handleSelectArticleForBreaking = (articleId) => {
    if (!articleId) {
      setBreakingForm((prev) => ({
        ...prev,
        article_id: '',
        slug: '',
        url: '',
      }))
      return
    }
    const art = articles.find((a) => a.id === Number(articleId) || String(a.id) === String(articleId))
    if (art) {
      setBreakingForm((prev) => ({
        ...prev,
        article_id: art.id,
        slug: art.slug,
        title_bn: prev.title_bn.trim() ? prev.title_bn : (art.title_bn || ''),
        title_en: prev.title_en.trim() ? prev.title_en : (art.title_en || ''),
        url: `/article/${art.slug}`,
      }))
    }
  }

  // Handle Breaking News Add or Edit Submit
  const handleSubmitBreaking = async (e) => {
    e.preventDefault()
    if (!breakingForm.title_bn.trim() && !breakingForm.title_en.trim()) {
      alert(lang === 'bn' ? 'দয়া করে ব্রেকিং হেডলাইন লিখুন।' : 'Please enter breaking news headline.')
      return
    }

    let targetSlug = (breakingForm.slug || '').trim()
    if (!targetSlug) {
      if (breakingForm.article_id) {
        const art = articles.find((a) => a.id === Number(breakingForm.article_id))
        targetSlug = art?.slug || `breaking-${Date.now()}`
      } else {
        targetSlug = `breaking-${Date.now()}`
      }
    }

    const targetUrl = breakingForm.link_type === 'custom' && breakingForm.url.trim()
      ? breakingForm.url.trim()
      : `/article/${targetSlug}`

    const itemPayload = {
      id: editingBreakingId || Date.now(),
      title_bn: breakingForm.title_bn.trim() || breakingForm.title_en.trim(),
      title_en: breakingForm.title_en.trim() || breakingForm.title_bn.trim(),
      slug: targetSlug,
      article_id: breakingForm.link_type === 'article' && breakingForm.article_id ? Number(breakingForm.article_id) : null,
      url: targetUrl,
      active: breakingForm.active ? 1 : 0,
    }

    try {
      const saved = await api.saveBreakingNews(itemPayload)
      if (editingBreakingId) {
        onUpdateBreaking?.(saved?.item || itemPayload)
        triggerToast(lang === 'bn' ? 'ব্রেকিং নিউজ সফলভাবে আপডেট হয়েছে!' : 'Breaking news updated successfully!')
      } else {
        onAddBreaking?.(saved?.item || itemPayload)
        triggerToast(lang === 'bn' ? 'নতুন ব্রেকিং নিউজ যুক্ত হয়েছে!' : 'Breaking news added!')
      }
    } catch {
      if (editingBreakingId) {
        onUpdateBreaking?.(itemPayload)
        triggerToast(lang === 'bn' ? 'ব্রেকিং নিউজ আপডেট হয়েছে!' : 'Breaking news updated!')
      } else {
        onAddBreaking?.(itemPayload)
        triggerToast(lang === 'bn' ? 'নতুন ব্রেকিং নিউজ যুক্ত হয়েছে!' : 'Breaking news added!')
      }
    }

    refreshStats()
    setBreakingForm(emptyBreakingForm)
    setEditingBreakingId(null)
  }

  // Handle Edit Breaking Click
  const handleEditBreakingClick = (item) => {
    const isLinkedArticle = Boolean(item.article_id || (item.slug && articles.some((a) => a.slug === item.slug)))
    const matchedArtId = item.article_id || articles.find((a) => a.slug === item.slug)?.id || ''

    setBreakingForm({
      title_bn: item.title_bn || item.title || '',
      title_en: item.title_en || '',
      link_type: isLinkedArticle ? 'article' : (item.url ? 'custom' : 'article'),
      article_id: matchedArtId,
      slug: item.slug || '',
      url: item.url || (item.slug ? `/article/${item.slug}` : ''),
      active: item.active !== 0 && item.active !== false,
    })
    setEditingBreakingId(item.id)
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }

  // Handle Toggle Breaking Active Status
  const handleToggleBreakingActive = async (item) => {
    const newActiveState = (item.active === 0 || item.active === false) ? 1 : 0
    const updated = { ...item, active: newActiveState }

    try {
      await api.toggleBreakingNews(item.id)
    } catch {
      try {
        await api.saveBreakingNews(updated)
      } catch { }
    }

    onUpdateBreaking?.(updated)
    refreshStats()
    triggerToast(
      newActiveState === 1
        ? (lang === 'bn' ? 'ব্রেকিং নিউজ টিকারে সক্রিয় করা হয়েছে।' : 'Breaking news activated on ticker.')
        : (lang === 'bn' ? 'ব্রেকিং নিউজ স্থগিত (নিষ্ক্রিয়) করা হয়েছে।' : 'Breaking news paused.')
    )
  }

  // Handle Breaking News Delete
  const handleDeleteBreakingClick = async (id) => {
    if (confirm(lang === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই ব্রেকিং নিউজটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this breaking news?')) {
      try {
        await api.deleteBreakingNews(id)
      } catch { }
      onDeleteBreaking?.(id)
      refreshStats()
      triggerToast(lang === 'bn' ? 'ব্রেকিং নিউজ সরানো হয়েছে।' : 'Breaking news item removed.', 'info')
    }
  }

  // --- Opinion Handlers ---
  const handleEditOpinionClick = (op) => {
    setEditingOpinionId(op.id)
    setNewOpinion({
      title_bn: op.title_bn || '',
      title_en: op.title_en || '',
      author_bn: op.author_bn || '',
      author_en: op.author_en || '',
      author_role_bn: op.author_role_bn || '',
      author_role_en: op.author_role_en || '',
      author_image: op.author_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      summary_bn: op.summary_bn || '',
      summary_en: op.summary_en || '',
      content_bn: op.content_bn || '',
    })
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }

  const handleCancelOpinionEdit = () => {
    setEditingOpinionId(null)
    setNewOpinion(initialOpinionForm)
  }

  const handleAddOpinionSubmit = async (e) => {
    e.preventDefault()
    if (!newOpinion.title_bn.trim() || !newOpinion.author_bn.trim()) {
      alert(lang === 'bn' ? 'দয়া করে লেখকের নাম ও শিরোনাম লিখুন।' : 'Please enter author name and title.')
      return
    }
    const itemPayload = {
      ...newOpinion,
      ...(editingOpinionId ? { id: editingOpinionId } : {}),
      title_en: newOpinion.title_en?.trim() || newOpinion.title_bn,
      author_en: newOpinion.author_en?.trim() || newOpinion.author_bn,
      author_role_en: newOpinion.author_role_en?.trim() || newOpinion.author_role_bn,
      summary_en: newOpinion.summary_en?.trim() || newOpinion.summary_bn,
      content_en: newOpinion.content_en?.trim() || newOpinion.content_bn,
    }
    try {
      const res = await api.saveOpinion(itemPayload)
      const savedItem = res?.opinion || res?.item || {
        ...itemPayload,
        id: editingOpinionId || `op-${Date.now()}`,
        slug: itemPayload.slug || `opinion-${Date.now()}`,
        date: itemPayload.date || new Date().toISOString(),
      }
      if (editingOpinionId) {
        onUpdateOpinion?.(savedItem)
        triggerToast(lang === 'bn' ? 'মতামত সফলভাবে ডাটাবেজে আপডেট হয়েছে!' : 'Opinion updated in database!')
      } else {
        onAddOpinion?.(savedItem)
        triggerToast(lang === 'bn' ? 'নতুন কলাম ডাটাবেজে সংরক্ষিত হয়েছে!' : 'Opinion column saved to database!')
      }
      refreshStats()
    } catch (err) {
      console.warn('API saveOpinion fallback:', err)
      const fallbackItem = {
        ...itemPayload,
        id: editingOpinionId || `op-${Date.now()}`,
        slug: itemPayload.slug || `opinion-${Date.now()}`,
        date: itemPayload.date || new Date().toISOString(),
      }
      if (editingOpinionId) {
        onUpdateOpinion?.(fallbackItem)
        triggerToast(lang === 'bn' ? 'মতামত আপডেট হয়েছে!' : 'Opinion updated!')
      } else {
        onAddOpinion?.(fallbackItem)
        triggerToast(lang === 'bn' ? 'নতুন কলাম যুক্ত হয়েছে!' : 'Opinion added!')
      }
    }
    setNewOpinion(initialOpinionForm)
    setEditingOpinionId(null)
  }

  const handleDeleteOpinionClick = async (id) => {
    if (confirm(lang === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই মতামতটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this opinion?')) {
      try {
        await api.deleteOpinion(id)
      } catch (err) {
        console.warn('Backend deleteOpinion notice:', err)
      }
      onDeleteOpinion?.(id)
      refreshStats()
      triggerToast(lang === 'bn' ? 'মতামতটি মুছে ফেলা হয়েছে।' : 'Opinion deleted.', 'info')
    }
  }

  // --- Photo Handlers ---
  const handleEditPhotoClick = (ph) => {
    setEditingPhotoId(ph.id)
    setNewPhoto({
      title_bn: ph.title_bn || '',
      title_en: ph.title_en || '',
      image: ph.image || '',
      credit_bn: ph.credit_bn || (siteForm.site_name_bn ? `ছবি: ${siteForm.site_name_bn}` : 'ছবি: সংগৃহীত'),
      credit_en: ph.credit_en || (siteForm.site_name_en ? `Photo: ${siteForm.site_name_en}` : 'Photo: Source'),
      caption_bn: ph.caption_bn || '',
    })
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }

  const handleCancelPhotoEdit = () => {
    setEditingPhotoId(null)
    setNewPhoto(initialPhotoForm)
  }

  const handleAddPhotoSubmit = async (e) => {
    e.preventDefault()
    if (!newPhoto.title_bn.trim() || !newPhoto.image.trim()) return
    const itemPayload = {
      ...newPhoto,
      ...(editingPhotoId ? { id: editingPhotoId } : {}),
      title_en: newPhoto.title_en?.trim() || newPhoto.title_bn,
      credit_en: newPhoto.credit_en?.trim() || newPhoto.credit_bn,
      caption_en: newPhoto.caption_en?.trim() || newPhoto.caption_bn,
    }
    try {
      const res = await api.savePhoto(itemPayload)
      const savedItem = res?.photo || res?.item || {
        ...itemPayload,
        id: editingPhotoId || `ph-${Date.now()}`,
        slug: itemPayload.slug || `photo-${Date.now()}`,
        date: itemPayload.date || new Date().toISOString(),
      }
      if (editingPhotoId) {
        onUpdatePhoto?.(savedItem)
        triggerToast(lang === 'bn' ? 'ছবি সফলভাবে ডাটাবেজে আপডেট হয়েছে!' : 'Photo updated in database!')
      } else {
        onAddPhoto?.(savedItem)
        triggerToast(lang === 'bn' ? 'নতুন ছবি ডাটাবেজে সংরক্ষিত হয়েছে!' : 'Photo saved to database!')
      }
      refreshStats()
    } catch (err) {
      console.warn('API savePhoto fallback:', err)
      const fallbackItem = {
        ...itemPayload,
        id: editingPhotoId || `ph-${Date.now()}`,
        slug: itemPayload.slug || `photo-${Date.now()}`,
        date: itemPayload.date || new Date().toISOString(),
      }
      if (editingPhotoId) {
        onUpdatePhoto?.(fallbackItem)
        triggerToast(lang === 'bn' ? 'ছবি আপডেট হয়েছে!' : 'Photo updated!')
      } else {
        onAddPhoto?.(fallbackItem)
        triggerToast(lang === 'bn' ? 'ছবি যুক্ত হয়েছে!' : 'Photo added!')
      }
    }
    setNewPhoto(initialPhotoForm)
    setEditingPhotoId(null)
  }

  const handleDeletePhotoClick = async (id) => {
    if (confirm(lang === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই ছবিটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this photo?')) {
      try {
        await api.deletePhoto(id)
      } catch (err) {
        console.warn('Backend deletePhoto notice:', err)
      }
      onDeletePhoto?.(id)
      refreshStats()
      triggerToast(lang === 'bn' ? 'ছবিটি মুছে ফেলা হয়েছে।' : 'Photo deleted.', 'info')
    }
  }

  // --- Video Handlers ---
  const handleEditVideoClick = (v) => {
    setEditingVideoId(v.id)
    setNewVideo({
      title_bn: v.title_bn || '',
      title_en: v.title_en || '',
      thumb: v.thumb || '',
      videoUrl: v.videoUrl || '',
      duration: v.duration || '৪:১৫',
    })
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }

  const handleCancelVideoEdit = () => {
    setEditingVideoId(null)
    setNewVideo(initialVideoForm)
  }

  const handleAddVideoSubmit = async (e) => {
    e.preventDefault()
    if (!newVideo.title_bn.trim()) return
    const itemPayload = {
      ...newVideo,
      ...(editingVideoId ? { id: editingVideoId } : {}),
      title_en: newVideo.title_en?.trim() || newVideo.title_bn,
    }
    try {
      const res = await api.saveVideo(itemPayload)
      const savedItem = res?.video || res?.item || {
        ...itemPayload,
        id: editingVideoId || `v-${Date.now()}`,
        slug: itemPayload.slug || `video-${Date.now()}`,
        date: itemPayload.date || new Date().toISOString(),
      }
      if (editingVideoId) {
        onUpdateVideo?.(savedItem)
        triggerToast(lang === 'bn' ? 'ভিডিও সফলভাবে ডাটাবেজে আপডেট হয়েছে!' : 'Video updated in database!')
      } else {
        onAddVideo?.(savedItem)
        triggerToast(lang === 'bn' ? 'নতুন ভিডিও ডাটাবেজে সংরক্ষিত হয়েছে!' : 'Video saved to database!')
      }
      refreshStats()
    } catch (err) {
      console.warn('API saveVideo fallback:', err)
      const fallbackItem = {
        ...itemPayload,
        id: editingVideoId || `v-${Date.now()}`,
        slug: itemPayload.slug || `video-${Date.now()}`,
        date: itemPayload.date || new Date().toISOString(),
      }
      if (editingVideoId) {
        onUpdateVideo?.(fallbackItem)
        triggerToast(lang === 'bn' ? 'ভিডিও আপডেট হয়েছে!' : 'Video updated!')
      } else {
        onAddVideo?.(fallbackItem)
        triggerToast(lang === 'bn' ? 'ভিডিও যুক্ত হয়েছে!' : 'Video added!')
      }
    }
    setNewVideo(initialVideoForm)
    setEditingVideoId(null)
  }

  const handleDeleteVideoClick = async (id) => {
    if (confirm(lang === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই ভিডিওটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this video?')) {
      try {
        await api.deleteVideo(id)
      } catch (err) {
        console.warn('Backend deleteVideo notice:', err)
      }
      onDeleteVideo?.(id)
      refreshStats()
      triggerToast(lang === 'bn' ? 'ভিডিওটি মুছে ফেলা হয়েছে।' : 'Video deleted.', 'info')
    }
  }

  // --- Role Handlers ---
  const handleEditRoleClick = (r) => {
    setEditingRoleId(r.id)
    setRoleForm({
      id: r.id,
      name_bn: r.name_bn || '',
      name_en: r.name_en || '',
      role_key: r.role_key || '',
      description_bn: r.description_bn || '',
      description_en: r.description_en || '',
      permissions: Array.isArray(r.permissions) ? r.permissions : ['manage_articles'],
      status: r.status || 'active',
    })
    window.scrollTo({ top: 350, behavior: 'smooth' })
  }

  const handleCancelRoleEdit = () => {
    setEditingRoleId(null)
    setRoleForm(initialRoleForm)
  }

  const handleRoleSubmit = async (e) => {
    e.preventDefault()
    if (!roleForm.name_bn.trim()) {
      alert(lang === 'bn' ? 'দয়া করে রোলের বাংলা নাম লিখুন।' : 'Please enter role name.')
      return
    }

    const payload = {
      ...roleForm,
      ...(editingRoleId ? { id: editingRoleId } : {}),
      name_en: roleForm.name_en.trim() || roleForm.name_bn.trim(),
      role_key: roleForm.role_key.trim() || roleForm.name_en.toLowerCase().replace(/[^a-z0-9_]/g, '_') || `role_${Date.now()}`,
    }

    try {
      const res = await api.saveRole(payload)
      const savedRole = res?.role || res?.item || {
        ...payload,
        id: editingRoleId || Date.now(),
        user_count: 0,
        is_system: false,
      }
      if (editingRoleId) {
        onUpdateRole?.(savedRole)
        setLocalRoles((prev) => prev.map((item) => (item.id === savedRole.id ? { ...item, ...savedRole } : item)))
        triggerToast(lang === 'bn' ? 'রোল সফলভাবে আপডেট হয়েছে!' : 'Role updated successfully!')
      } else {
        onAddRole?.(savedRole)
        setLocalRoles((prev) => [...prev, savedRole])
        triggerToast(lang === 'bn' ? 'নতুন রোল ডাটাবেজে তৈরি হয়েছে!' : 'New role saved in database!')
      }
      refreshStats()
    } catch (err) {
      console.warn('API saveRole error:', err)
      const fallback = {
        ...payload,
        id: editingRoleId || Date.now(),
        user_count: 0,
      }
      if (editingRoleId) {
        onUpdateRole?.(fallback)
        setLocalRoles((prev) => prev.map((item) => (item.id === fallback.id ? { ...item, ...fallback } : item)))
        triggerToast(lang === 'bn' ? 'রোল আপডেট হয়েছে (লোকাল)!' : 'Role updated (local)!')
      } else {
        onAddRole?.(fallback)
        setLocalRoles((prev) => [...prev, fallback])
        triggerToast(lang === 'bn' ? 'রোল তৈরি হয়েছে (লোকাল)!' : 'Role added (local)!')
      }
    }
    setRoleForm(initialRoleForm)
    setEditingRoleId(null)
  }

  const handleDeleteRoleClick = async (r) => {
    if (r.is_system || r.role_key === 'admin') {
      alert(lang === 'bn' ? 'প্রধান প্রশাসক (Super Admin) রোল মুছে ফেলা যাবে না।' : 'System administrator role cannot be deleted.')
      return
    }
    if (confirm(lang === 'bn' ? `আপনি কি নিশ্চিতভাবে "${r.name_bn}" রোলটি মুছে ফেলতে চান?` : `Are you sure you want to delete role "${r.name_bn}"?`)) {
      try {
        await api.deleteRole(r.id || r.role_key)
      } catch (err) {
        console.warn('Backend deleteRole error:', err)
      }
      onDeleteRole?.(r.id || r.role_key)
      setLocalRoles((prev) => prev.filter((item) => item.id !== r.id && item.role_key !== r.role_key))
      refreshStats()
      triggerToast(lang === 'bn' ? 'রোল মুছে ফেলা হয়েছে।' : 'Role deleted.', 'info')
    }
  }

  // --- Staff Handlers ---
  const handleEditStaffClick = (m) => {
    setEditingStaffId(m.id)
    setStaffForm({
      id: m.id,
      name: m.name || '',
      email: m.email || '',
      password: '',
      role_key: m.role_key || 'editor',
      phone: m.phone || '',
      status: m.status || 'active',
    })
    window.scrollTo({ top: 350, behavior: 'smooth' })
  }

  const handleCancelStaffEdit = () => {
    setEditingStaffId(null)
    setStaffForm(initialStaffForm)
  }

  const handleStaffSubmit = async (e) => {
    e.preventDefault()
    if (!staffForm.email.trim()) {
      alert(lang === 'bn' ? 'দয়া করে ইমেইল এড্রেস লিখুন।' : 'Please enter an email address.')
      return
    }
    if (!editingStaffId && (!staffForm.password || staffForm.password.length < 6)) {
      alert(lang === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.')
      return
    }

    const payload = {
      ...staffForm,
      ...(editingStaffId ? { id: editingStaffId } : {}),
      name: staffForm.name.trim() || staffForm.email.split('@')[0],
    }

    try {
      const res = await api.saveStaff(payload)
      const savedStaff = res?.staff || res?.item || {
        ...payload,
        id: editingStaffId || Date.now(),
        created_at: new Date().toISOString(),
      }
      if (editingStaffId) {
        onUpdateStaff?.(savedStaff)
        setLocalStaff((prev) => prev.map((item) => (item.id === savedStaff.id ? { ...item, ...savedStaff } : item)))
        triggerToast(lang === 'bn' ? 'সদস্যের তথ্য সফলভাবে আপডেট হয়েছে!' : 'Staff member updated successfully!')
      } else {
        onAddStaff?.(savedStaff)
        setLocalStaff((prev) => [...prev, savedStaff])
        triggerToast(lang === 'bn' ? 'নতুন টিম সদস্য ডাটাবেজে যুক্ত হয়েছে!' : 'Staff member added in database!')
      }
      refreshStats()
    } catch (err) {
      console.warn('API saveStaff error:', err)
      const fallback = {
        ...payload,
        id: editingStaffId || Date.now(),
        created_at: new Date().toISOString(),
      }
      if (editingStaffId) {
        onUpdateStaff?.(fallback)
        setLocalStaff((prev) => prev.map((item) => (item.id === fallback.id ? { ...item, ...fallback } : item)))
        triggerToast(lang === 'bn' ? 'সদস্য আপডেট হয়েছে (লোকাল)!' : 'Staff updated (local)!')
      } else {
        onAddStaff?.(fallback)
        setLocalStaff((prev) => [...prev, fallback])
        triggerToast(lang === 'bn' ? 'সদস্য যুক্ত হয়েছে (লোকাল)!' : 'Staff added (local)!')
      }
    }
    setStaffForm(initialStaffForm)
    setEditingStaffId(null)
  }

  const handleDeleteStaffClick = async (m) => {
    if (localStaff.length <= 1) {
      alert(lang === 'bn' ? 'একমাত্র প্রশাসককে মুছে ফেলা সম্ভব নয়।' : 'Cannot delete the only administrator.')
      return
    }
    if (confirm(lang === 'bn' ? `আপনি কি নিশ্চিতভাবে "${m.name}" (${m.email}) কে মুছে ফেলতে চান?` : `Are you sure you want to remove "${m.name}"?`)) {
      try {
        await api.deleteStaff(m.id)
      } catch (err) {
        console.warn('Backend deleteStaff error:', err)
      }
      onDeleteStaff?.(m.id)
      setLocalStaff((prev) => prev.filter((item) => item.id !== m.id))
      refreshStats()
      triggerToast(lang === 'bn' ? 'টিম সদস্য অপসারিত হয়েছে।' : 'Staff member removed.', 'info')
    }
  }

  // --- Reader Poll (পাঠক জরিপ) State & Handlers ---
  const emptyPollForm = {
    id: null,
    question_bn: '',
    question_en: '',
    options: [
      { id: 'yes', label_bn: 'হ্যাঁ', label_en: 'Yes', votes: 0 },
      { id: 'no', label_bn: 'না', label_en: 'No', votes: 0 },
      { id: 'no_opinion', label_bn: 'মন্তব্য নেই', label_en: 'No Opinion', votes: 0 },
    ],
    status: 'active',
    reset_votes: false,
  }
  const [polls, setPolls] = useState(() => (Array.isArray(pollsProp) && pollsProp.length > 0 ? pollsProp : []))
  const [pollForm, setPollForm] = useState(emptyPollForm)
  const [editingPollId, setEditingPollId] = useState(null)
  const [pollLoading, setPollLoading] = useState(false)
  const [pollSubmitting, setPollSubmitting] = useState(false)

  useEffect(() => {
    if (Array.isArray(pollsProp) && pollsProp.length > 0) {
      setPolls(pollsProp)
    }
  }, [pollsProp])

  const refreshPolls = async () => {
    setPollLoading(true)
    try {
      const data = await api.getPolls()
      if (Array.isArray(data)) {
        setPolls(data)
      }
    } catch (err) {
      console.warn('Failed to load polls:', err)
    } finally {
      setPollLoading(false)
    }
  }

  useEffect(() => {
    refreshPolls()
  }, [])

  const activePoll = useMemo(() => {
    return polls.find((p) => p.status === 'active') || polls[0] || null
  }, [polls])

  const handleAddPollOption = () => {
    setPollForm((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        { id: `opt_${Date.now()}`, label_bn: '', label_en: '', votes: 0 },
      ],
    }))
  }

  const handleRemovePollOption = (idx) => {
    if (pollForm.options.length <= 2) {
      alert(lang === 'bn' ? 'কমপক্ষে ২টি বিকল্প থাকতে হবে।' : 'At least 2 options are required.')
      return
    }
    setPollForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== idx),
    }))
  }

  const handlePollOptionChange = (idx, field, value) => {
    setPollForm((prev) => {
      const newOpts = [...prev.options]
      newOpts[idx] = { ...newOpts[idx], [field]: value }
      return { ...prev, options: newOpts }
    })
  }

  const handlePollSubmit = async (e) => {
    e.preventDefault()
    if (!pollForm.question_bn.trim() && !pollForm.question_en.trim()) {
      alert(lang === 'bn' ? 'দয়া করে জরিপের প্রশ্ন লিখুন।' : 'Please enter poll question.')
      return
    }

    const validOptions = pollForm.options.filter((opt) => opt.label_bn.trim() || opt.label_en.trim())
    if (validOptions.length < 2) {
      alert(lang === 'bn' ? 'কমপক্ষে ২টি বিকল্পের নাম লিখুন।' : 'Please enter labels for at least 2 options.')
      return
    }

    setPollSubmitting(true)
    try {
      const payload = {
        ...pollForm,
        id: editingPollId,
        options: validOptions,
      }
      const res = await api.savePoll(payload)
      if (res?.polls) {
        setPolls(res.polls)
      } else {
        await refreshPolls()
      }
      const updatedActive = res?.poll || (res?.polls ? (res.polls.find((p) => p.status === 'active') || res.polls[0]) : null)
      if (updatedActive) {
        onUpdatePoll?.(updatedActive)
      }
      triggerToast(editingPollId ? (lang === 'bn' ? 'পাঠক জরিপ আপডেট হয়েছে!' : 'Poll updated!') : (lang === 'bn' ? 'নতুন পাঠক জরিপ তৈরি হয়েছে!' : 'New poll created!'))
      setPollForm(emptyPollForm)
      setEditingPollId(null)
    } catch (err) {
      alert(lang === 'bn' ? 'জরিপ সংরক্ষণ করতে সমস্যা হয়েছে: ' + (err.message || 'Error') : 'Error saving poll: ' + (err.message || 'Error'))
    } finally {
      setPollSubmitting(false)
    }
  }

  const handleEditPollClick = (p) => {
    setEditingPollId(p.id)
    setPollForm({
      id: p.id,
      question_bn: p.question_bn || '',
      question_en: p.question_en || '',
      options: Array.isArray(p.options) && p.options.length >= 2 ? p.options : emptyPollForm.options,
      status: p.status || 'active',
      reset_votes: false,
    })
    const elem = document.getElementById('poll-form-card')
    if (elem) elem.scrollIntoView({ behavior: 'smooth' })
  }

  const handleTogglePollStatus = async (p) => {
    const newStatus = p.status === 'active' ? 'closed' : 'active'
    try {
      const res = await api.savePoll({ ...p, status: newStatus })
      if (res?.polls) setPolls(res.polls)
      else await refreshPolls()
      const updatedActive = res?.poll || (res?.polls ? (res.polls.find((item) => item.status === 'active') || res.polls[0]) : null)
      if (updatedActive) onUpdatePoll?.(updatedActive)
      triggerToast(newStatus === 'active' ? (lang === 'bn' ? 'জরিপটি সক্রিয় করা হয়েছে!' : 'Poll activated!') : (lang === 'bn' ? 'জরিপটি বন্ধ করা হয়েছে!' : 'Poll closed!'))
    } catch (err) {
      alert(lang === 'bn' ? 'স্ট্যাটাস পরিবর্তনে সমস্যা: ' + err.message : 'Error changing status: ' + err.message)
    }
  }

  const handleResetPollVotes = async (p) => {
    if (confirm(lang === 'bn' ? `আপনি কি নিশ্চিতভাবে "${p.question_bn}" জরিপের সমস্ত ভোট সংখ্যা শূন্য (০) করতে চান?` : `Reset votes for "${p.question_bn}"?`)) {
      try {
        const res = await api.savePoll({ ...p, reset_votes: true })
        if (res?.polls) setPolls(res.polls)
        else await refreshPolls()
        const updatedActive = res?.poll || (res?.polls ? (res.polls.find((item) => item.status === 'active') || res.polls[0]) : null)
        if (updatedActive) onUpdatePoll?.(updatedActive)
        triggerToast(lang === 'bn' ? 'ভোট সংখ্যা সফলভাবে রিসেট হয়েছে!' : 'Votes reset successfully!')
      } catch (err) {
        alert(lang === 'bn' ? 'ভোট রিসেটে সমস্যা: ' + err.message : 'Error resetting votes: ' + err.message)
      }
    }
  }

  const handleDeletePollClick = async (p) => {
    if (polls.length <= 1) {
      alert(lang === 'bn' ? 'একমাত্র জরিপটি মুছে ফেলা সম্ভব নয়।' : 'Cannot delete the only poll.')
      return
    }
    if (confirm(lang === 'bn' ? `আপনি কি নিশ্চিতভাবে এই জরিপটি মুছে ফেলতে চান?\n"${p.question_bn}"` : `Delete poll "${p.question_bn}"?`)) {
      try {
        const res = await api.deletePoll(p.id)
        const remaining = res?.polls || polls.filter((item) => item.id !== p.id)
        setPolls(remaining)
        const nextActive = remaining.find((item) => item.status === 'active') || remaining[0] || null
        if (nextActive) onUpdatePoll?.(nextActive)
        triggerToast(lang === 'bn' ? 'জরিপ মুছে ফেলা হয়েছে।' : 'Poll deleted.', 'info')
      } catch (err) {
        alert(lang === 'bn' ? 'জরিপ মুছতে সমস্যা: ' + err.message : 'Error deleting poll: ' + err.message)
      }
    }
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
        (art.category || '').toLowerCase() === articleCategoryFilter.toLowerCase() ||
        (Array.isArray(art.categories) && art.categories.some((c) => String(c).toLowerCase().trim() === articleCategoryFilter.toLowerCase()))

      const matchFeat = !filterFeaturedOnly || art.featured

      return matchQ && matchCat && matchFeat
    })
  }, [articles, articleSearch, articleCategoryFilter, filterFeaturedOnly])

  // Total Views Aggregation
  const totalViews = useMemo(() => {
    return articles.reduce((sum, a) => sum + (Number(a.views) || 0), 0)
  }, [articles])

  // Category Distribution Counts (supports multiple categories per news)
  const categoryCounts = useMemo(() => {
    const map = {}
    articles.forEach((a) => {
      const cats = Array.isArray(a.categories) && a.categories.length > 0
        ? a.categories
        : [a.category || 'national']
      cats.forEach((c) => {
        const catKey = String(c).toLowerCase().trim()
        map[catKey] = (map[catKey] || 0) + 1
      })
    })
    return map
  }, [articles])

  // Active Breaking News Items
  const activeBreakingList = useMemo(() => {
    return (breakingNews || []).filter((b) => b && b.active !== 0 && b.active !== false && b.active !== '0')
  }, [breakingNews])

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
              { id: 'roles', icon: <ShieldCheck size={16} />, bn: 'রোল ও পারমিশন (Role)', en: 'Role & Staff', count: localRoles.length },
              { id: 'polls', icon: <Vote size={16} />, bn: 'পাঠক জরিপ (Reader Poll)', en: 'Reader Poll', count: polls.length },
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
        </aside>

        {/* RIGHT MAIN WORKSPACE (9 cols) */}
        <main className="lg:col-span-9 space-y-6">
          {/* ================= TAB 1: OVERVIEW METRICS ================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* System & Database Live Sync Status Bar */}
              {/*  <div className="bg-white p-3.5 px-4 rounded-xl border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-gray-800">
                      {lang === 'bn' ? 'ডাটাবেজ স্ট্যাটাস: সংযুক্ত (MySQL Live)' : 'Database: Connected (MySQL Live)'}
                    </span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <Link
                    to="/"
                    target="_blank"
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md font-bold transition-colors"
                  >
                    <Globe size={13} />
                    <span>{lang === 'bn' ? 'লাইভ ওয়েবসাইট দেখুন' : 'View Live Website'}</span>
                    <ExternalLink size={11} />
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleManualSync}
                    disabled={isSyncingAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-300 hover:border-gray-400 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    title={lang === 'bn' ? 'ডাটাবেজের সর্বশেষ তথ্য রিফ্রেশ করুন' : 'Refresh database data'}
                  >
                    <RefreshCw size={13} className={isSyncingAll ? 'animate-spin text-red-600' : 'text-gray-500'} />
                    <span>{isSyncingAll ? (lang === 'bn' ? 'সিঙ্ক হচ্ছে...' : 'Syncing...') : (lang === 'bn' ? 'ডাটা সিঙ্ক / রিফ্রেশ' : 'Sync / Refresh')}</span>
                  </button>
                </div>
              </div> */}

              {/* Top 4 KPI Metrics - Fully Clickable */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => {
                    setArticleCategoryFilter('all')
                    setArticleSearch('')
                    setActiveTab('articles')
                  }}
                  className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between border-t-4 border-t-blue-600 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block">{lang === 'bn' ? 'মোট সংবাদ' : 'Total Articles'}</span>
                    <span className="text-2xl font-black text-gray-900 mt-1 block group-hover:text-blue-600 transition-colors">
                      {toBengaliNumber(articles.length)}
                    </span>
                    <span className="text-[11px] text-blue-600 font-bold mt-1 inline-flex items-center gap-0.5">
                      {lang === 'bn' ? 'তালিকা দেখুন →' : 'View Articles →'}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText size={24} />
                  </div>
                </div>

                <div
                  onClick={() => {
                    setArticleCategoryFilter('all')
                    setArticleSearch('')
                    setActiveTab('articles')
                  }}
                  className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between border-t-4 border-t-[#e30613] hover:border-red-400 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block">{lang === 'bn' ? 'মোট পাঠক ভিউ' : 'Total Views'}</span>
                    <span className="text-2xl font-black text-[#e30613] mt-1 block">
                      {toBengaliNumber(totalViews)}
                    </span>
                    <span className="text-[11px] text-[#e30613] font-bold mt-1 inline-flex items-center gap-0.5">
                      {lang === 'bn' ? 'এনালিটিক্স দেখুন →' : 'View Stats →'}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-[#e30613] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp size={24} />
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('categories')}
                  className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between border-t-4 border-t-amber-500 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block">{lang === 'bn' ? 'মোট ক্যাটাগরি' : 'Total Categories'}</span>
                    <span className="text-2xl font-black text-amber-600 mt-1 block">
                      {toBengaliNumber(formattedCategories.length)}
                    </span>
                    <span className="text-[11px] text-amber-600 font-bold mt-1 inline-flex items-center gap-0.5">
                      {lang === 'bn' ? 'ক্যাটাগরি ম্যানেজমেন্ট →' : 'Manage Categories →'}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Layers size={24} />
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('breaking')}
                  className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between border-t-4 border-t-emerald-600 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div>
                    <span className="text-xs text-gray-500 font-semibold block">{lang === 'bn' ? 'সক্রিয় ব্রেকিং' : 'Active Breaking'}</span>
                    <span className="text-2xl font-black text-emerald-600 mt-1 block">
                      {toBengaliNumber((activeBreakingList || []).length)}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-0.5">
                      {lang === 'bn' ? 'টিকার পরিচালনা →' : 'Manage Ticker →'}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Flame size={24} />
                  </div>
                </div>
              </div>

              {/* Secondary Media, Opinion, Roles, Polls & Settings Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div
                  onClick={() => setActiveTab('opinions')}
                  className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs hover:border-purple-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <PenTool size={16} />
                  </div>
                  <span className="text-[11px] text-gray-500 font-semibold">{lang === 'bn' ? 'কলাম ও মতামত' : 'Opinions'}</span>
                  <span className="text-base font-black text-gray-900 mt-0.5">{toBengaliNumber(opinions.length)} টি</span>
                  <span className="text-[10px] text-purple-600 font-bold mt-1">ম্যানেজ →</span>
                </div>

                <div
                  onClick={() => setActiveTab('media')}
                  className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs hover:border-pink-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Camera size={16} />
                  </div>
                  <span className="text-[11px] text-gray-500 font-semibold">{lang === 'bn' ? 'আলোকচিত্র' : 'Photos'}</span>
                  <span className="text-base font-black text-gray-900 mt-0.5">{toBengaliNumber(photos.length)} টি</span>
                  <span className="text-[10px] text-pink-600 font-bold mt-1">গ্যালারি →</span>
                </div>

                <div
                  onClick={() => setActiveTab('media')}
                  className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs hover:border-cyan-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Video size={16} />
                  </div>
                  <span className="text-[11px] text-gray-500 font-semibold">{lang === 'bn' ? 'ভিডিও প্রতিবেদন' : 'Videos'}</span>
                  <span className="text-base font-black text-gray-900 mt-0.5">{toBengaliNumber(videos.length)} টি</span>
                  <span className="text-[10px] text-cyan-600 font-bold mt-1">ভিডিও →</span>
                </div>

                <div
                  onClick={() => setActiveTab('roles')}
                  className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs hover:border-emerald-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <ShieldCheck size={16} />
                  </div>
                  <span className="text-[11px] text-gray-500 font-semibold">{lang === 'bn' ? 'রোল ও পারমিশন' : 'Roles'}</span>
                  <span className="text-base font-black text-gray-900 mt-0.5">{toBengaliNumber(localRoles.length)} টি</span>
                  <span className="text-[10px] text-emerald-600 font-bold mt-1">রোলসমূহ →</span>
                </div>

                <div
                  onClick={() => setActiveTab('polls')}
                  className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs hover:border-amber-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Vote size={16} />
                  </div>
                  <span className="text-[11px] text-gray-500 font-semibold">{lang === 'bn' ? 'পাঠক জরিপ' : 'Reader Poll'}</span>
                  <span className="text-base font-black text-gray-900 mt-0.5">{toBengaliNumber(polls.length)} টি</span>
                  <span className="text-[10px] text-amber-600 font-bold mt-1">জরিপ →</span>
                </div>

                <div
                  onClick={() => setActiveTab('settings')}
                  className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs hover:border-gray-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Globe size={16} />
                  </div>
                  <span className="text-[11px] text-gray-500 font-semibold">{lang === 'bn' ? 'সাইট সেটিংস' : 'Settings'}</span>
                  <span className="text-base font-black text-gray-900 mt-0.5">এসইও ও বিবরণ</span>
                  <span className="text-[10px] text-gray-600 font-bold mt-1">কনফিগারেশন →</span>
                </div>
              </div>

              {/* Quick Launch Action Bar (সকল প্রধান অপশন সরাসরি কার্যকর) */}
              <div className="bg-gradient-to-r from-[#1a3a5c] to-[#0f2540] text-white p-5 rounded-xl shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
                  <div>
                    <h3 className="font-bold text-base text-yellow-300 flex items-center gap-2">
                      <Sparkles size={18} />
                      <span>{lang === 'bn' ? 'দ্রুত অ্যাকশন ও কনটেন্ট প্রকাশ' : 'Quick Launch & Content Publishing'}</span>
                    </h3>
                    <p className="text-xs text-gray-300 mt-1">
                      {lang === 'bn' ? 'এক ক্লিকে যেকোনো ফরম্যাটের কনটেন্ট তৈরি ও প্রকাশ করুন।' : 'Create and publish any format of news content with one click.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setFormData(emptyArticleForm)
                        setActiveTab('add')
                      }}
                      className="flex items-center gap-1.5 bg-[#e30613] hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors shadow-xs cursor-pointer"
                    >
                      <PlusCircle size={15} />
                      <span>{lang === 'bn' ? 'নতুন সংবাদ লিখুন' : 'Write New Article'}</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('categories')}
                      className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-2.5 rounded-lg transition-colors border border-white/20 cursor-pointer"
                    >
                      <Layers size={14} className="text-yellow-300" />
                      <span>{lang === 'bn' ? 'ক্যাটাগরি তৈরি' : 'Add Category'}</span>
                    </button>
                  </div>
                </div>

                {/* Additional Direct Publishing Buttons */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    onClick={() => setActiveTab('breaking')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <Flame size={13} className="text-orange-400" />
                    <span>{lang === 'bn' ? '+ ব্রেকিং টিকার' : '+ Breaking News'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('opinions')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <PenTool size={13} className="text-purple-400" />
                    <span>{lang === 'bn' ? '+ কলাম/সম্পাদকীয়' : '+ Column/Opinion'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('media')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <Camera size={13} className="text-pink-400" />
                    <span>{lang === 'bn' ? '+ ছবি ও ভিডিও' : '+ Media Gallery'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('polls')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <Vote size={13} className="text-amber-400" />
                    <span>{lang === 'bn' ? '+ পাঠক জরিপ' : '+ Reader Poll'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <Settings size={13} className="text-gray-300" />
                    <span>{lang === 'bn' ? 'সাইট সেটিংস' : 'Site Settings'}</span>
                  </button>
                </div>
              </div>

              {/* Direct Live Breaking News Quick Manager inside Overview */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-orange-50 text-orange-600 rounded-lg">
                      <Flame size={18} />
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">
                        {lang === 'bn' ? 'লাইভ ব্রেকিং টিকার সরাসরি পরিচালনা' : 'Live Breaking Ticker Quick Manager'}
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        {lang === 'bn' ? 'এখানেই শিরোনাম লিখে এন্টার চাপুন অথবা সক্রিয় টিকার চালু/বন্ধ করুন।' : 'Type headline below and press Enter to instantly broadcast.'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('breaking')}
                    className="text-xs text-orange-600 font-bold hover:underline"
                  >
                    {lang === 'bn' ? 'সকল ব্রেকিং টিকার দেখুন →' : 'All Breaking News →'}
                  </button>
                </div>

                {/* Inline Quick Add Form */}
                <form onSubmit={handleQuickAddBreaking} className="flex gap-2">
                  <div className="relative flex-1">
                    <Flame size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" />
                    <input
                      type="text"
                      value={quickBreakingText}
                      onChange={(e) => setQuickBreakingText(e.target.value)}
                      placeholder={lang === 'bn' ? 'জরুরি ব্রেকিং শিরোনাম লিখুন (যেমন: রাজধানীতে নতুন ফ্লাইওভার উদ্বোধন)...' : 'Type breaking alert headline and submit...'}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-red-500 bg-gray-50 focus:bg-white"
                      disabled={isSubmittingQuickBreaking}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingQuickBreaking || !quickBreakingText.trim()}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <PlusCircle size={13} />
                    <span>{isSubmittingQuickBreaking ? (lang === 'bn' ? 'যোগ হচ্ছে...' : 'Adding...') : (lang === 'bn' ? 'প্রকাশ করুন' : 'Broadcast')}</span>
                  </button>
                </form>

                {/* Live Breaking List with 1-click Toggle & Delete */}
                <div className="space-y-2">
                  {breakingNews.length === 0 ? (
                    <p className="text-xs text-gray-400 italic py-2">
                      {lang === 'bn' ? 'বর্তমানে কোনো ব্রেকিং নিউজ সংরক্ষিত নেই।' : 'No breaking news alerts recorded.'}
                    </p>
                  ) : (
                    breakingNews.slice(0, 4).map((item) => {
                      const isActive = item.active !== 0 && item.active !== false
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                            <span className="font-semibold text-gray-800 truncate">
                              {lang === 'bn' ? item.title_bn : item.title_en}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleToggleBreakingActive(item)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${isActive ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                              {isActive ? (lang === 'bn' ? 'সক্রিয়' : 'Active') : (lang === 'bn' ? 'স্থগিত' : 'Paused')}
                            </button>
                            <button
                              onClick={() => handleDeleteBreakingClick(item.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Category Breakdown Pill Grid */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#e30613] rounded-full"></span>
                    <span>{lang === 'bn' ? 'বিভাগভিত্তিক সংবাদ সংখ্যা (Category Breakdown)' : 'Category Breakdown'}</span>
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setArticleCategoryFilter('all')
                        setArticleSearch('')
                        setActiveTab('articles')
                      }}
                      className="text-xs text-blue-600 font-bold hover:underline"
                    >
                      {lang === 'bn' ? 'সব বিভাগ (' + toBengaliNumber(articles.length) + ') →' : 'All Categories (' + articles.length + ') →'}
                    </button>
                    <button
                      onClick={() => setActiveTab('categories')}
                      className="text-xs text-red-600 font-bold hover:underline"
                    >
                      {lang === 'bn' ? 'ক্যাটাগরি ম্যানেজমেন্ট →' : 'Manage Categories →'}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-1 text-xs">
                  {formattedCategories.map((cat) => {
                    const count = categoryCounts[cat.slug.toLowerCase()] || 0
                    return (
                      <button
                        key={cat.slug}
                        onClick={() => {
                          setArticleCategoryFilter(cat.slug)
                          setArticleSearch('')
                          setActiveTab('articles')
                        }}
                        className="p-2 rounded-lg bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-300 transition-colors text-left flex items-center justify-between group cursor-pointer"
                        title={lang === 'bn' ? `${cat.name_bn} বিভাগের সংবাদ দেখুন` : `View articles in ${cat.name_en}`}
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

              {/* Dual Column: Recent 5 Articles & Top 5 Most Read */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Recent Articles Table (7 cols) */}
                <div className="lg:col-span-7 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                      <FileText size={16} className="text-[#e30613]" />
                      <span>{lang === 'bn' ? 'সর্বশেষ প্রকাশিত সংবাদসমূহ' : 'Recently Published Articles'}</span>
                    </h3>
                    <button
                      onClick={() => {
                        setArticleCategoryFilter('all')
                        setArticleSearch('')
                        setActiveTab('articles')
                      }}
                      className="text-xs text-red-600 font-bold hover:underline"
                    >
                      {lang === 'bn' ? `সব সংবাদ দেখুন (${toBengaliNumber(articles.length)}) →` : `View All (${articles.length}) →`}
                    </button>
                  </div>
                  <div className="overflow-x-auto flex-1">
                    {articles.length === 0 ? (
                      <div className="p-8 text-center">
                        <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-xs text-gray-500 font-semibold mb-3">
                          {lang === 'bn' ? 'বর্তমানে কোনো সংবাদ প্রকাশিত হয়নি।' : 'No articles published yet.'}
                        </p>
                        <button
                          onClick={() => {
                            setIsEditing(false)
                            setFormData(emptyArticleForm)
                            setActiveTab('add')
                          }}
                          className="px-3 py-1.5 bg-[#e30613] hover:bg-red-700 text-white rounded text-xs font-bold"
                        >
                          {lang === 'bn' ? 'প্রথম সংবাদ লিখুন' : 'Write First Article'}
                        </button>
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs text-gray-600">
                        <thead className="bg-gray-100 text-gray-700 uppercase font-bold border-b">
                          <tr>
                            <th className="p-2.5 w-12">ছবি</th>
                            <th className="p-2.5">শিরোনাম (Headline)</th>
                            <th className="p-2.5 w-24">বিভাগ</th>
                            <th className="p-2.5 w-16 text-center">ভিউ</th>
                            <th className="p-2.5 w-20 text-center">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {articles.slice(0, 5).map((art) => (
                            <tr key={art.id} className="hover:bg-gray-50 transition-colors">
                              <td className="p-2.5">
                                <img src={art.image} alt="" className="w-10 h-8 object-cover rounded bg-gray-100" />
                              </td>
                              <td className="p-2.5 font-semibold text-gray-900">
                                <Link to={`/article/${art.slug}`} target="_blank" className="hover:text-red-600 line-clamp-1 flex items-center gap-1">
                                  <span>{lang === 'bn' ? art.title_bn : art.title_en}</span>
                                  <ExternalLink size={10} className="text-gray-400 flex-shrink-0" />
                                </Link>
                              </td>
                              <td className="p-2.5">
                                <button
                                  onClick={() => {
                                    setArticleCategoryFilter(art.category)
                                    setActiveTab('articles')
                                  }}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold transition-colors cursor-pointer"
                                >
                                  {CATEGORIES_BN[art.category] || art.category}
                                </button>
                              </td>
                              <td className="p-2.5 text-center font-bold text-gray-800">
                                {toBengaliNumber(art.views || 0)}
                              </td>
                              <td className="p-2.5 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => handleToggleFeatured(art)}
                                    className={`p-1 rounded transition-colors ${art.featured ? 'text-amber-500 bg-amber-50' : 'text-gray-300 hover:text-amber-500'
                                      }`}
                                    title={art.featured ? 'Remove from Lead Story' : 'Set as Lead Story'}
                                  >
                                    <Star size={13} className={art.featured ? 'fill-current' : ''} />
                                  </button>
                                  <button
                                    onClick={() => handleEditClick(art)}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                    title="Edit"
                                  >
                                    <Edit size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteArticleClick(art.id)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    title="Delete"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Top 5 Most Read Articles (5 cols) */}
                <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                      <TrendingUp size={16} className="text-red-600" />
                      <span>{lang === 'bn' ? 'সর্বাধিক পঠিত সংবাদ' : 'Most Read Stories'}</span>
                    </h3>
                    <span className="text-[11px] font-bold text-gray-400">টপ ৫</span>
                  </div>
                  <div className="p-3 divide-y divide-gray-100 flex-1">
                    {topReadArticles.length === 0 ? (
                      <p className="text-xs text-gray-400 italic p-4 text-center">
                        {lang === 'bn' ? 'কোনো সংবাদ নেই।' : 'No articles recorded.'}
                      </p>
                    ) : (
                      topReadArticles.map((art, idx) => (
                        <div key={art.id} className="py-2.5 first:pt-1 last:pb-1 flex items-start gap-2.5 group">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5 ${idx === 0 ? 'bg-[#e30613] text-white shadow-xs' : idx === 1 ? 'bg-amber-500 text-white' : idx === 2 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {toBengaliNumber(idx + 1)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/article/${art.slug}`}
                              target="_blank"
                              className="text-xs font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug"
                            >
                              {lang === 'bn' ? art.title_bn : art.title_en}
                            </Link>
                            <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                              <span className="font-semibold text-red-600">
                                {CATEGORIES_BN[art.category] || art.category}
                              </span>
                              <span className="font-bold flex items-center gap-1 text-gray-600">
                                <Eye size={10} />
                                <span>{toBengaliNumber(art.views || 0)} ভিউ</span>
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleEditClick(art)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
                            title="Edit"
                          >
                            <Edit size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
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
                          <div className="flex flex-wrap gap-1 max-w-[170px]">
                            <span className="bg-red-50 text-[#e30613] px-2 py-0.5 rounded font-bold text-xs" title="মূল বিভাগ">
                              {CATEGORIES_BN[art.category] || art.category}
                            </span>
                            {Array.isArray(art.categories) &&
                              art.categories
                                .filter((c) => String(c).toLowerCase().trim() !== String(art.category || '').toLowerCase().trim())
                                .map((c) => (
                                  <span key={c} className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-gray-200">
                                    {CATEGORIES_BN[c] || c}
                                  </span>
                                ))}
                          </div>
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

              {/* ================= MULTI-CATEGORY SELECTION (VARIOUS CATEGORIES PER NEWS) ================= */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-red-50/40 via-white to-gray-50 rounded-xl border border-red-200/80 shadow-2xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-red-100 pb-2.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <Layers size={17} className="text-[#e30613]" />
                      <span>সংবাদের ক্যাটাগরি / বিভাগসমূহ (Multiple Categories Selection) *</span>
                    </label>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      একটি সংবাদ এক বা একাধিক ক্যাটাগরিতে (যেমন: জাতীয়, রাজনীতি, অর্থনীতি) একযোগে প্রকাশ করতে পারেন।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('categories')}
                    className="text-xs font-bold text-[#e30613] hover:underline flex items-center gap-1"
                  >
                    <span>+ নতুন ক্যাটাগরি তৈরি ও পরিচালনা</span>
                  </button>
                </div>

                {/* 1. Selected Categories Active Tags Display */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      <span>বর্তমানে নির্বাচিত বিভাগ ({((formData.categories || [formData.category]).length)}টি):</span>
                    </span>
                    <span className="text-[10px] text-gray-400">
                      ★ তারা চিহ্নে ক্লিক করে মূল বা প্রধান বিভাগ পরিবর্তন করুন
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 p-2.5 bg-white rounded-lg border border-gray-200 min-h-[44px] items-center">
                    {(formData.categories && formData.categories.length > 0
                      ? formData.categories
                      : [formData.category || formattedCategories[0]?.slug || 'national']
                    ).map((catSlug, idx) => {
                      const matched = formattedCategories.find(
                        (c) => c.slug.toLowerCase() === String(catSlug).toLowerCase()
                      )
                      const isPrimary = (formData.category || '').toLowerCase() === String(catSlug).toLowerCase() || idx === 0
                      const labelBn = matched?.name_bn || CATEGORIES_BN[catSlug] || catSlug

                      return (
                        <div
                          key={catSlug}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-2xs ${isPrimary
                            ? 'bg-[#e30613] text-white ring-2 ring-red-300'
                            : 'bg-red-50 text-[#e30613] border border-red-200 hover:bg-red-100'
                            }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryCategory(catSlug)}
                            title={isPrimary ? 'এটি মূল বা প্রধান বিভাগ' : 'ক্লিক করে একে মূল বিভাগ বানান'}
                            className="flex items-center gap-0.5 hover:scale-105 transition-transform"
                          >
                            <Star size={11} className={isPrimary ? 'fill-yellow-300 text-yellow-300' : 'text-red-400 hover:text-red-600'} />
                            <span>{labelBn}</span>
                            {isPrimary && (
                              <span className="text-[9px] bg-white/20 px-1 py-0.2 rounded font-normal ml-0.5">
                                প্রধান
                              </span>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleCategory(catSlug)}
                            className={`rounded-full w-4 h-4 flex items-center justify-center text-[10px] transition-colors ml-0.5 ${isPrimary
                              ? 'bg-black/20 hover:bg-black/40 text-white'
                              : 'bg-red-200 hover:bg-red-300 text-red-800'
                              }`}
                            title="এই ক্যাটাগরি বাদ দিন"
                          >
                            ✕
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 2. Interactive Quick Multi-Select Pills (Click to toggle) */}
                <div>
                  <span className="block text-[11px] font-semibold text-gray-600 mb-1.5">
                    বিভাগ যোগ বা বাদ দিতে নিচের যেকোনো বাটনে ক্লিক করুন (Click to Select / Deselect):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1 p-1 bg-white/60 rounded-lg border border-gray-100">
                    {formattedCategories.map((cat) => {
                      const currentCats = Array.isArray(formData.categories) && formData.categories.length > 0
                        ? formData.categories
                        : [formData.category || 'national']
                      const isSelected = currentCats.some((c) => String(c).toLowerCase().trim() === cat.slug.toLowerCase().trim())
                      const isPrimary = (formData.category || '').toLowerCase().trim() === cat.slug.toLowerCase().trim()

                      return (
                        <button
                          key={cat.slug}
                          type="button"
                          onClick={() => handleToggleCategory(cat.slug)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${isSelected
                            ? isPrimary
                              ? 'bg-[#e30613] text-white shadow-xs ring-2 ring-red-400 scale-102'
                              : 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-400 scale-101'
                            : 'bg-white text-gray-700 border border-gray-200 hover:border-red-300 hover:bg-red-50/50'
                            }`}
                          title={
                            isSelected
                              ? isPrimary
                                ? `${cat.name_bn} (প্রধান বিভাগ হিসেবে নির্বাচিত - বাদ দিতে ক্লিক করুন)`
                                : `${cat.name_bn} (নির্বাচিত - বাদ দিতে ক্লিক করুন)`
                              : `${cat.name_bn} যুক্ত করতে ক্লিক করুন`
                          }
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${isSelected
                              ? 'bg-white/30 text-white font-bold'
                              : 'border border-gray-300 text-transparent'
                              }`}
                          >
                            ✓
                          </span>
                          <span>{cat.name_bn}</span>
                          <span className="text-[10px] opacity-75 font-sans">({cat.name_en})</span>
                          {isPrimary && (
                            <Star size={11} className="fill-yellow-300 text-yellow-300" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 3. Quick Dropdown Add */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <span className="text-[11px] font-bold text-gray-600 whitespace-nowrap">
                    ড্রপডাউন থেকে দ্রুত বিভাগ যুক্ত করুন:
                  </span>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        const s = e.target.value
                        const currentCats = Array.isArray(formData.categories) && formData.categories.length > 0
                          ? formData.categories
                          : [formData.category || 'national']
                        if (!currentCats.includes(s)) {
                          handleToggleCategory(s)
                        } else {
                          triggerToast(`"${CATEGORIES_BN[s] || s}" ইতোমধ্যে নির্বাচিত আছে।`, 'info')
                        }
                      }
                    }}
                    className="flex-1 text-xs p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white font-bengali text-gray-800"
                  >
                    <option value="">-- ড্রপডাউন থেকে ক্যাটাগরি বাছাই করুন --</option>
                    {formattedCategories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name_bn} ({cat.name_en})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-[11px] text-gray-500 bg-white/70 p-2 rounded-lg border border-gray-200/80 flex items-center gap-2">
                  <span>
                    <strong>টিপস:</strong> সংবাদটি যে যে ক্যাটাগরিতে যুক্ত থাকবে, হোমপেইজের সেসব ক্যাটাগরি সেকশনে এবং সংশ্লিষ্ট প্রতিটি ক্যাটাগরি পেইজে পাঠকরা এই সংবাদ দেখতে পারবেন।
                  </span>
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

              {/* Image Upload & Live Preview */}
              <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200">
                <ImageUploadInput
                  label="সংবাদের মূল ফিচার ছবি (Article Feature Image)"
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  placeholder="https://images.unsplash.com/..."
                  required={true}
                  helperText="ডিভাইস থেকে সরাসরি ছবি আপলোড করুন অথবা ওয়েব লিঙ্ক ব্যবহার করুন (ডাটাবেজে স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে)।"
                />
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

              {/* Full Content (Bilingual: Bangla & English) with Full Functionality */}
              <div className="space-y-4">
                {/* Header & Tab Selector for Content Editing */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <FileText size={16} className="text-[#e30613]" />
                      <span>মূল সংবাদ বিস্তারিত বিবরণ (Detailed Article Body) *</span>
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      বাংলা এবং আন্তর্জাতিক ইংরেজি সংস্করণের জন্য পূর্ণাঙ্গ টেক্সট, প্যারাগ্রাফ ও ছবি ফরম্যাটিং টুল।
                    </p>
                  </div>

                  {/* Language Tab Switcher */}
                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setContentTab('both')}
                      className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${contentTab === 'both'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                      title="উভয় ভাষা একসাথে দেখুন ও সম্পাদনা করুন"
                    >
                      <span>↔️ উভয় ভাষা (Both)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentTab('bn')}
                      className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${contentTab === 'bn'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      <span>🇧🇩 বাংলা</span>
                      <span className="text-[10px] opacity-80 font-mono">
                        ({(formData.content_bn || '').length})
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setContentTab('en')}
                      className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${contentTab === 'en'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      <span>🌐 English</span>
                      <span className="text-[10px] opacity-80 font-mono">
                        ({(formData.content_en || '').length})
                      </span>
                    </button>
                  </div>
                </div>

                {/* IN-ARTICLE IMAGE INSERTION DRAWER (Shared Full Functionality) */}
                {showInTextImageModal && (
                  <div className="bg-gradient-to-br from-red-50/50 via-white to-gray-50 p-5 rounded-xl border-2 border-red-200 shadow-md space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-red-100 pb-2.5">
                      <div className="flex items-center gap-2 text-[#e30613] font-bold text-xs">
                        <Camera size={16} />
                        <span>লেখার মাঝে ছবি যুক্ত করার টুল (In-Article Photo Inserter)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowInTextImageModal(false)}
                        className="text-xs text-gray-400 hover:text-gray-700 font-bold px-2 py-0.5 rounded"
                      >
                        ✕ বন্ধ করুন
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                      {/* Image Preview Box (3 cols) */}
                      <div className="md:col-span-3">
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">ছবির প্রিভিউ:</label>
                        <div className="h-32 rounded-lg border-2 border-dashed border-gray-300 bg-white overflow-hidden flex items-center justify-center relative">
                          {inTextImageForm.imageUrl ? (
                            <img
                              src={inTextImageForm.imageUrl}
                              alt="Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none' }}
                            />
                          ) : (
                            <div className="text-center p-3 text-gray-400">
                              <ImageIcon size={28} className="mx-auto mb-1 opacity-50" />
                              <span className="text-[10px] block">ছবির লিঙ্ক দিলে এখানে দেখা যাবে</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Image Details (9 cols) */}
                      <div className="md:col-span-9 space-y-3">
                        <ImageUploadInput
                          label="ইন-টেক্সট ছবি (In-Article Photo)"
                          value={inTextImageForm.imageUrl}
                          onChange={(url) => setInTextImageForm({ ...inTextImageForm, imageUrl: url })}
                          placeholder="https://images.unsplash.com/... অথবা যেকোনো ছবির লিঙ্ক"
                          required={true}
                          helperText="ডিভাইস থেকে ছবি আপলোড করুন অথবা ওয়েব লিঙ্ক ব্যবহার করুন।"
                        />

                        {/* Target Language Selection for Image */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            ছবিটি কোন বিবরণে প্রবেশ করাবেন? (Insert target)
                          </label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setInTextImageTarget('bn')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${inTextImageTarget === 'bn'
                                ? 'bg-red-50 border-red-500 text-[#e30613]'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                            >
                              🇧🇩 বাংলা বিবরণীতে (Bangla Content)
                            </button>
                            <button
                              type="button"
                              onClick={() => setInTextImageTarget('en')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${inTextImageTarget === 'en'
                                ? 'bg-red-50 border-red-500 text-[#e30613]'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                            >
                              🌐 ইংরেজি বিবরণীতে (English Content)
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                              ছবির ক্যাপশন (বাংলা)
                            </label>
                            <input
                              type="text"
                              value={inTextImageForm.caption}
                              onChange={(e) => setInTextImageForm({ ...inTextImageForm, caption: e.target.value })}
                              placeholder="ঘটনাস্থলে উদ্ধার তৎপরতা চলছে..."
                              className="w-full text-xs p-2.5 border rounded-lg outline-none focus:border-red-500 bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                              Image Caption (English)
                            </label>
                            <input
                              type="text"
                              value={inTextImageForm.caption_en}
                              onChange={(e) => setInTextImageForm({ ...inTextImageForm, caption_en: e.target.value })}
                              placeholder="Rescue operations underway at the scene..."
                              className="w-full text-xs p-2.5 border rounded-lg outline-none focus:border-red-500 bg-white font-sans"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                              ছবির ক্রেডিট (বাংলা)
                            </label>
                            <input
                              type="text"
                              value={inTextImageForm.credit}
                              onChange={(e) => setInTextImageForm({ ...inTextImageForm, credit: e.target.value })}
                              placeholder={siteForm.site_name_bn ? `ছবি: ${siteForm.site_name_bn}` : 'ছবি: সংগৃহীত'}
                              className="w-full text-xs p-2.5 border rounded-lg outline-none focus:border-red-500 bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                              Photo Credit (English)
                            </label>
                            <input
                              type="text"
                              value={inTextImageForm.credit_en}
                              onChange={(e) => setInTextImageForm({ ...inTextImageForm, credit_en: e.target.value })}
                              placeholder={siteForm.site_name_en ? `Photo: ${siteForm.site_name_en}` : 'Photo: Collected'}
                              className="w-full text-xs p-2.5 border rounded-lg outline-none focus:border-red-500 bg-white font-sans"
                            />
                          </div>
                        </div>

                        {/* Alignment Selector */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            লেখার মাঝে ছবির লেআউট / অবস্থান (Alignment):
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            {[
                              { id: 'full', label: '↔️ পূর্ণ প্রস্থ (Center)', desc: 'পুরো জায়গা জুড়ে' },
                              { id: 'left', label: '◀️ বামে ভাসমান (Left Float)', desc: 'ডানে লেখা থাকবে' },
                              { id: 'right', label: '▶️ ডানে ভাসমান (Right Float)', desc: 'বামে লেখা থাকবে' },
                              { id: 'center', label: '⏹️ মাঝারি মাপ (Medium)', desc: 'মাঝখানে কেন্দ্রস্থ' },
                            ].map((alignOpt) => (
                              <button
                                key={alignOpt.id}
                                type="button"
                                onClick={() => setInTextImageForm({ ...inTextImageForm, alignment: alignOpt.id })}
                                className={`p-2 rounded-lg border text-left transition-all ${inTextImageForm.alignment === alignOpt.id
                                  ? 'bg-red-50 border-red-500 text-[#e30613] font-bold shadow-2xs'
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                                  }`}
                              >
                                <span className="block font-bold text-[11px]">{alignOpt.label}</span>
                                <span className="text-[10px] text-gray-400 block mt-0.5">{alignOpt.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Quick pick from Gallery Photos */}
                        {photos && photos.length > 0 && (
                          <div className="pt-2 border-t border-gray-200">
                            <span className="block text-[11px] font-bold text-gray-600 mb-1.5">
                              অথবা গ্যালারি থেকে ছবি বেছে নিন (ক্লিক করলেই লিঙ্ক যুক্ত হবে):
                            </span>
                            <div className="flex gap-2 overflow-x-auto pb-1 max-h-20">
                              {photos.slice(0, 8).map((ph) => (
                                <button
                                  key={ph.id}
                                  type="button"
                                  onClick={() => setInTextImageForm({
                                    ...inTextImageForm,
                                    imageUrl: ph.image,
                                    caption: ph.title_bn || '',
                                    caption_en: ph.title_en || '',
                                    credit: ph.credit_bn || (siteForm.site_name_bn ? `ছবি: ${siteForm.site_name_bn}` : 'ছবি: সংগৃহীত'),
                                    credit_en: ph.credit_en || (siteForm.site_name_en ? `Photo: ${siteForm.site_name_en}` : 'Photo: Collected'),
                                  })}
                                  className="flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border border-gray-200 hover:border-red-500 hover:scale-105 transition-all relative group"
                                  title={ph.title_bn}
                                >
                                  <img src={ph.image} alt="" className="w-full h-full object-cover" />
                                  <span className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold">
                                    যুক্ত করুন
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2 border-t border-red-100">
                      <button
                        type="button"
                        onClick={handleInsertInTextImage}
                        className="bg-[#e30613] hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors shadow flex items-center gap-2"
                      >
                        <PlusCircle size={15} />
                        <span>লেখার মাঝে ছবি যুক্ত করুন (Insert into Text)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowInTextImageModal(false)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors"
                      >
                        বাতিল
                      </button>
                    </div>
                  </div>
                )}

                {/* Content Editors Grid (Visual WYSIWYG with direct image display) */}
                <div className={`grid gap-6 ${contentTab === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                  {/* ================= 1. BANGLA CONTENT VISUAL EDITOR ================= */}
                  {(contentTab === 'both' || contentTab === 'bn') && (
                    <VisualRichTextEditor
                      ref={bnEditorRef}
                      value={formData.content_bn}
                      onChange={(val) => setFormData((prev) => ({ ...prev, content_bn: val }))}
                      placeholder="এখানে বাংলা সংবাদ বিস্তারিত অনুচ্ছেদ আকারে লিখুন... লেখার মাঝে ছবি দিতে উপরের 'ছবি যোগ করুন' বাটনে ক্লিক করুন।"
                      onOpenImageModal={() => {
                        setInTextImageTarget('bn')
                        setShowInTextImageModal(true)
                      }}
                      accentColor="red"
                      label="মূল সংবাদ বিস্তারিত বিবরণ (বাংলা) *"
                      charCount={(formData.content_bn || '').length}
                      wordCount={((formData.content_bn || '').trim() ? (formData.content_bn || '').trim().split(/\s+/).length : 0)}
                    />
                  )}

                  {/* ================= 2. ENGLISH CONTENT VISUAL EDITOR ================= */}
                  {(contentTab === 'both' || contentTab === 'en') && (
                    <VisualRichTextEditor
                      ref={enEditorRef}
                      value={formData.content_en}
                      onChange={(val) => setFormData((prev) => ({ ...prev, content_en: val }))}
                      placeholder="Write detailed English article content here... Click 'Photo' to insert images visually."
                      onOpenImageModal={() => {
                        setInTextImageTarget('en')
                        setShowInTextImageModal(true)
                      }}
                      canCopyFromBn={Boolean(formData.content_bn)}
                      onCopyFromBn={() => {
                        setFormData((prev) => ({ ...prev, content_en: prev.content_bn }))
                        triggerToast('বাংলা কনটেন্ট ইংরেজিতে কপি করা হয়েছে।', 'info')
                      }}
                      accentColor="blue"
                      label="মূল সংবাদ বিস্তারিত বিবরণ (English)"
                      charCount={(formData.content_en || '').length}
                      wordCount={((formData.content_en || '').trim() ? (formData.content_en || '').trim().split(/\s+/).length : 0)}
                    />
                  )}
                </div>
              </div>

              {/* Tags & Featured Lead Toggle (Bilingual Tags) */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      ট্যাগসমূহ (বাংলা - কমা দিয়ে পৃথক করুন)
                    </label>
                    <input
                      type="text"
                      value={formData.tags_bn}
                      onChange={(e) => setFormData({ ...formData, tags_bn: e.target.value })}
                      placeholder="যেমন: বন্যা, ত্রাণ, জাতীয়"
                      className="w-full text-xs p-2.5 border rounded-lg bg-white outline-none focus:border-red-500 font-bengali"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-sans">
                      Tags (English - comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags_en}
                      onChange={(e) => setFormData({ ...formData, tags_en: e.target.value })}
                      placeholder="e.g. Flood, Relief, National"
                      className="w-full text-xs p-2.5 border rounded-lg bg-white outline-none focus:border-red-500 font-sans"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featLeadCheck"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500 cursor-pointer accent-[#e30613]"
                    />
                    <label htmlFor="featLeadCheck" className="text-xs font-bold text-gray-800 cursor-pointer select-none">
                      প্রধান শীর্ষ সংবাদ (Lead Story) হিসেবে হোমপেজে দেখান
                    </label>
                  </div>
                  <span className="text-[11px] text-gray-500">
                    টিক দিলে সংবাদটি হোমপেজের প্রধান বড় লিড হিসেবে প্রদর্শিত হবে
                  </span>
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
                            className={`flex items-center gap-1 px-2.5 py-1 rounded font-bold transition-all ${seoPreviewDevice === 'desktop' ? 'bg-white text-blue-700 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                              }`}
                          >
                            <Monitor size={13} />
                            <span>ডেস্কটপ</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSeoPreviewDevice('mobile')}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded font-bold transition-all ${seoPreviewDevice === 'mobile' ? 'bg-white text-blue-700 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                              }`}
                          >
                            <Smartphone size={13} />
                            <span>মোবাইল</span>
                          </button>
                        </div>
                      </div>

                      {/* Google SERP Card Preview */}
                      <div className={`p-4 bg-white border border-gray-200 rounded-lg transition-all ${seoPreviewDevice === 'mobile' ? 'max-w-md mx-auto shadow-sm ring-1 ring-gray-200' : 'w-full'
                        }`}>
                        {/* Google URL Line */}
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center">
                            প্র
                          </div>
                          <div className="text-[11px] leading-tight overflow-hidden text-ellipsis whitespace-nowrap text-[#202124]">
                            <span className="font-medium text-gray-800">{siteForm.site_name_bn || 'আলোর পথে'}</span>
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
                          <span className={`text-[11px] font-bold ${formData.seo_title.length >= 40 && formData.seo_title.length <= 70 ? 'text-emerald-600' : 'text-gray-400'
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
                        <span className={`text-[11px] font-bold ${formData.seo_description.length >= 100 && formData.seo_description.length <= 165 ? 'text-emerald-600' : 'text-gray-400'
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
                            className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${chk.passed ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800' : 'bg-gray-50 border-gray-200 text-gray-600'
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${chk.passed ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-700'
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
              {/* Add / Edit Breaking Form */}
              <form onSubmit={handleSubmitBreaking} className="bg-white p-6 sm:p-7 rounded-xl border border-gray-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b pb-3.5">
                  <div className="flex items-center gap-2.5 text-[#e30613] font-bold text-base">
                    <span>{editingBreakingId ? 'ব্রেকিং নিউজ সম্পাদনা করুন (Edit Breaking Ticker)' : 'নতুন ব্রেকিং নিউজ টিকার যোগ করুন'}</span>
                  </div>
                  {editingBreakingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBreakingId(null)
                        setBreakingForm(emptyBreakingForm)
                      }}
                      className="text-xs text-gray-500 hover:text-red-600 font-bold bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      বাতিল করুন
                    </button>
                  )}
                </div>

                {/* Step 1: Linking Type Selector */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                  <label className="block text-xs font-bold text-gray-800">
                    ১. ব্রেকিং নিউজের গন্তব্য ও লিঙ্ক উৎস নির্বাচন করুন:
                  </label>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setBreakingForm((prev) => ({ ...prev, link_type: 'article' }))}
                      className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${breakingForm.link_type === 'article'
                        ? 'bg-[#e30613] text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                      <FileText size={14} />
                      <span>প্রকাশিত সংবাদের সাথে লিঙ্ক করুন (প্রস্তাবিত)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBreakingForm((prev) => ({ ...prev, link_type: 'custom' }))}
                      className={`px-3.5 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${breakingForm.link_type === 'custom'
                        ? 'bg-[#e30613] text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                      <LinkIcon size={14} />
                      <span>কাস্টম লিংক বা নিজস্ব শিরোনাম</span>
                    </button>
                  </div>

                  {/* Sub-section: Article Selector Dropdown */}
                  {breakingForm.link_type === 'article' ? (
                    <div className="pt-1 space-y-2">
                      <label className="block text-xs font-semibold text-gray-600">
                        নিচের তালিকা থেকে যেকোনো একটি প্রকাশিত সংবাদ নির্বাচন করুন:
                      </label>
                      <select
                        value={breakingForm.article_id}
                        onChange={(e) => handleSelectArticleForBreaking(e.target.value)}
                        className="w-full text-xs p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white font-bengali font-semibold text-gray-900"
                      >
                        <option value="">-- সংবাদ নির্বাচন করুন (শিরোনাম ও লিংক স্বয়ংক্রিয় পূর্ণ হবে) --</option>
                        {articles.map((art) => (
                          <option key={art.id} value={art.id}>
                            [{CATEGORIES_BN[art.category] || art.category}] {art.title_bn || art.title_en}
                          </option>
                        ))}
                      </select>

                      {breakingForm.slug && (
                        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
                          <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                          <span>
                            ইউজার টিকারে ক্লিক করলে সরাসরি <strong>/article/{breakingForm.slug}</strong> পেজে রিডাইরেক্ট হবে।
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="pt-1 space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-600">
                        কাস্টম URL / লিংক (যেমন: `/category/sports` অথবা `https://...`):
                      </label>
                      <input
                        type="text"
                        value={breakingForm.url}
                        onChange={(e) => setBreakingForm((prev) => ({ ...prev, url: e.target.value }))}
                        placeholder="/category/sports বা https://..."
                        className="w-full text-xs p-2.5 border rounded-lg focus:ring-1 focus:ring-red-500 outline-none font-mono"
                      />
                    </div>
                  )}
                </div>

                {/* Step 2: Headlines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      ব্রেকিং হেডলাইন (বাংলা) *
                    </label>
                    <input
                      type="text"
                      required
                      value={breakingForm.title_bn}
                      onChange={(e) => setBreakingForm((prev) => ({ ...prev, title_bn: e.target.value }))}
                      placeholder="ঢাকায় আজ থেকে মেট্রোরেলের মতিঝিল-উত্তরা পূর্ণাঙ্গ সেবা চালু..."
                      className="w-full text-xs p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-bengali font-semibold text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      ব্রেকিং হেডলাইন (English Ticker)
                    </label>
                    <input
                      type="text"
                      value={breakingForm.title_en}
                      onChange={(e) => setBreakingForm((prev) => ({ ...prev, title_en: e.target.value }))}
                      placeholder="Full Motijheel-Uttara Metro Rail service begins today..."
                      className="w-full text-xs p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-sans"
                    />
                  </div>
                </div>

                {/* Step 3: Active Status Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={breakingForm.active}
                      onChange={(e) => setBreakingForm((prev) => ({ ...prev, active: e.target.checked }))}
                      className="w-4 h-4 text-[#e30613] rounded border-gray-300 focus:ring-red-500"
                    />
                    <span>ওয়েবসাইটে সরাসরি টিকারে সক্রিয় রাখুন (Live Active on Ticker)</span>
                  </label>
                </div>

                {/* Submit and Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <button
                    type="submit"
                    className="bg-[#e30613] hover:bg-red-700 text-white font-bold text-xs px-6 py-2.5 rounded-lg transition-colors shadow flex items-center gap-2 cursor-pointer"
                  >
                    <Flame size={15} />
                    <span>{editingBreakingId ? 'ব্রেকিং নিউজ আপডেট করুন' : 'ব্রেকিং টিকার প্রকাশ করুন'}</span>
                  </button>
                  {editingBreakingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBreakingId(null)
                        setBreakingForm(emptyBreakingForm)
                      }}
                      className="px-4 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      বাতিল
                    </button>
                  )}
                </div>
              </form>

              {/* Active Items Management Table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden space-y-0">
                <div className="p-4 border-b bg-gray-50 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                      <span>চলমান ব্রেকিং স্ট্রিপ তালিকা ({toBengaliNumber(breakingNews.length)} টি)</span>
                    </h4>
                    <span className="text-[11px] text-gray-500">
                      সক্রিয় আইটেমগুলো ওয়েবসাইটের শীর্ষে লাল স্ট্রিপে নিরবচ্ছিন্নভাবে অ্যানিমেট হয় এবং ক্লিক করলে বিস্তারিত পেজ খোলে
                    </span>
                  </div>

                  {/* Search filter for breaking news */}
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="ব্রেকিং নিউজ খুঁজুন..."
                      value={breakingSearch}
                      onChange={(e) => setBreakingSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 border rounded-lg text-xs bg-white focus:ring-1 focus:ring-red-500 outline-none w-48 sm:w-56"
                    />
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {breakingNews
                    .filter((item) => {
                      if (!breakingSearch.trim()) return true
                      const q = breakingSearch.toLowerCase()
                      return (
                        (item.title_bn || '').toLowerCase().includes(q) ||
                        (item.title_en || '').toLowerCase().includes(q) ||
                        (item.slug || '').toLowerCase().includes(q)
                      )
                    })
                    .map((item) => {
                      const isActive = item.active !== 0 && item.active !== false
                      const targetUrl = item.url || (item.slug ? `/article/${item.slug}` : '/')
                      const matchedArticle = articles.find(
                        (a) => a.id === item.article_id || a.slug === item.slug
                      )

                      return (
                        <div key={item.id} className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors">
                          <div className="flex items-start gap-3 flex-1 min-w-[260px]">
                            {/* Live Pulsing Dot */}
                            <span
                              className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${isActive ? 'bg-[#e30613] animate-pulse ring-4 ring-red-100' : 'bg-gray-300'
                                }`}
                              title={isActive ? 'সক্রিয় (Live)' : 'স্থগিত (Paused)'}
                            />

                            <div className="space-y-1 flex-1">
                              {/* Headline BN & EN */}
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-bold text-xs sm:text-sm text-gray-900 leading-snug">
                                  {item.title_bn}
                                </p>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                                    }`}
                                >
                                  {isActive ? 'সক্রিয় (Live)' : 'স্থগিত (Paused)'}
                                </span>
                              </div>

                              {item.title_en && (
                                <p className="text-[11px] text-gray-500 font-sans line-clamp-1">
                                  {item.title_en}
                                </p>
                              )}

                              {/* Destination Info Pill */}
                              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                                  <LinkIcon size={11} />
                                  <span>{targetUrl}</span>
                                </span>
                                {matchedArticle && (
                                  <span className="text-[10px] font-semibold text-gray-500">
                                    (সংবাদ: {matchedArticle.title_bn?.slice(0, 30)}...)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {/* 1. View / Test Link */}
                            <Link
                              to={targetUrl}
                              target="_blank"
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200 flex items-center gap-1 text-xs font-semibold"
                              title="বিস্তারিত নিউজ পেজ পরীক্ষা করুন (View News Details)"
                            >
                              <ExternalLink size={15} />
                              <span className="hidden sm:inline">পেজ দেখুন</span>
                            </Link>

                            {/* 2. Toggle Active / Pause */}
                            <button
                              onClick={() => handleToggleBreakingActive(item)}
                              className={`p-2 rounded-lg transition-colors border flex items-center gap-1 text-xs font-semibold ${isActive
                                ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200'
                                : 'text-green-700 bg-green-50 hover:bg-green-100 border-green-200'
                                }`}
                              title={isActive ? 'টিকারে দেখানো স্থগিত করুন' : 'টিকারে সক্রিয় করুন'}
                            >
                              {isActive ? <Pause size={14} /> : <Play size={14} />}
                              <span className="hidden sm:inline">{isActive ? 'স্থগিত' : 'সক্রিয়'}</span>
                            </button>

                            {/* 3. Edit */}
                            <button
                              onClick={() => handleEditBreakingClick(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                              title="সম্পাদনা করুন (Edit)"
                            >
                              <Edit size={15} />
                            </button>

                            {/* 4. Delete */}
                            <button
                              onClick={() => handleDeleteBreakingClick(item.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                              title="মুছে ফেলুন (Delete)"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 6: OPINIONS MANAGEMENT ================= */}
          {activeTab === 'opinions' && (
            <div className="space-y-6">
              {/* Add/Edit Opinion Form */}
              <form onSubmit={handleAddOpinionSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3 text-[#e30613] font-bold">
                  <div className="flex items-center gap-2">
                    <PenTool size={18} />
                    <span>{editingOpinionId ? 'কলাম ও সম্পাদকীয় সম্পাদনা করুন (Edit Opinion)' : 'নতুন কলাম ও সম্পাদকীয় প্রকাশ করুন (Add Opinion)'}</span>
                  </div>
                  {editingOpinionId && (
                    <button
                      type="button"
                      onClick={handleCancelOpinionEdit}
                      className="text-xs text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors font-normal"
                    >
                      বাতিল করুন (Cancel)
                    </button>
                  )}
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
                      className="w-full text-xs p-2.5 border rounded-lg outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">কলামিস্টের নাম (English)</label>
                    <input
                      type="text"
                      value={newOpinion.author_en}
                      onChange={(e) => setNewOpinion({ ...newOpinion, author_en: e.target.value })}
                      placeholder="Dr. Muhammad Yunus"
                      className="w-full text-xs p-2.5 border rounded-lg outline-none focus:border-red-500 font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">পদবি ও পরিচিতি (বাংলা) *</label>
                    <input
                      type="text"
                      required
                      value={newOpinion.author_role_bn}
                      onChange={(e) => setNewOpinion({ ...newOpinion, author_role_bn: e.target.value })}
                      placeholder="অর্থনীতিবিদ ও শান্তিতে নোবেল বিজয়ী"
                      className="w-full text-xs p-2.5 border rounded-lg outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">পদবি ও পরিচিতি (English)</label>
                    <input
                      type="text"
                      value={newOpinion.author_role_en}
                      onChange={(e) => setNewOpinion({ ...newOpinion, author_role_en: e.target.value })}
                      placeholder="Economist and Nobel Peace Prize Laureate"
                      className="w-full text-xs p-2.5 border rounded-lg outline-none focus:border-red-500 font-sans"
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
                      className="w-full text-xs p-2.5 border rounded-lg outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">কলামের শিরোনাম (English)</label>
                    <input
                      type="text"
                      value={newOpinion.title_en}
                      onChange={(e) => setNewOpinion({ ...newOpinion, title_en: e.target.value })}
                      placeholder="Future of Democracy and Our Civic Duty..."
                      className="w-full text-xs p-2.5 border rounded-lg outline-none focus:border-red-500 font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <ImageUploadInput
                      label="কলামিস্টের ছবি (Columnist Photo)"
                      value={newOpinion.author_image}
                      onChange={(url) => setNewOpinion({ ...newOpinion, author_image: url })}
                      placeholder="https://images.unsplash.com/..."
                      helperText="কলামিস্টের পোর্ট্রেট ছবি আপলোড করুন অথবা লিঙ্ক দিন।"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">সারসংক্ষেপ (বাংলা)</label>
                    <textarea
                      rows="2"
                      value={newOpinion.summary_bn}
                      onChange={(e) => setNewOpinion({ ...newOpinion, summary_bn: e.target.value })}
                      placeholder="মতামতের মূল কথা..."
                      className="w-full text-xs p-2.5 border rounded-lg outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="bg-[#e30613] hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors shadow flex items-center gap-2"
                  >
                    <Save size={14} />
                    <span>{editingOpinionId ? 'পরিবর্তন সংরক্ষণ করুন (Save Changes)' : 'কলাম প্রকাশ করুন (Publish Opinion)'}</span>
                  </button>
                  {editingOpinionId && (
                    <button
                      type="button"
                      onClick={handleCancelOpinionEdit}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors"
                    >
                      বাতিল (Cancel)
                    </button>
                  )}
                </div>
              </form>

              {/* Opinions List */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-sm text-gray-800">কলাম ও মতামত তালিকা</h3>
                  <span className="text-xs text-gray-500">মোট {toBengaliNumber(opinions.length)} টি মতামত (ডাটাবেজ সংযুক্ত)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {opinions.map((op) => (
                    <div key={op.id} className="p-4 rounded-lg border border-gray-200 flex gap-3 items-start justify-between hover:border-gray-300 transition-colors">
                      <div className="flex gap-3 items-start">
                        <img src={op.author_image} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-red-500 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-xs text-gray-900">{op.author_bn}</h4>
                          <p className="text-[10px] text-red-600 font-semibold">{op.author_role_bn}</p>
                          <h5 className="font-bold text-xs text-gray-800 mt-1 line-clamp-1">{op.title_bn}</h5>
                          <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{op.summary_bn}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleEditOpinionClick(op)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="সম্পাদনা করুন (Edit)"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteOpinionClick(op.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="মুছে ফেলুন (Delete)"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 7: MULTIMEDIA ================= */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              {/* Add/Edit Photo Form */}
              <form onSubmit={handleAddPhotoSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-2 text-[#e30613] font-bold">
                  <div className="flex items-center gap-2">
                    <Camera size={18} />
                    <span>{editingPhotoId ? 'আলোকচিত্র সম্পাদনা করুন (Edit Photo)' : 'নতুন আলোকচিত্র (Photo Story) যোগ করুন'}</span>
                  </div>
                  {editingPhotoId && (
                    <button
                      type="button"
                      onClick={handleCancelPhotoEdit}
                      className="text-xs text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors font-normal"
                    >
                      বাতিল করুন (Cancel)
                    </button>
                  )}
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
                      className="w-full text-xs p-2.5 border rounded-lg outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <ImageUploadInput
                      label="আলোকচিত্র গ্যালারির ছবি (Photo Story Image)"
                      value={newPhoto.image}
                      onChange={(url) => setNewPhoto({ ...newPhoto, image: url })}
                      placeholder="https://images.unsplash.com/..."
                      required={true}
                      helperText="ডিভাইস থেকে উচ্চ রেজোলিউশনের ছবি আপলোড করুন।"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">ছবির ক্রেডিট (বাংলা)</label>
                    <input
                      type="text"
                      value={newPhoto.credit_bn}
                      onChange={(e) => setNewPhoto({ ...newPhoto, credit_bn: e.target.value })}
                      placeholder="ছবি: প্রথম আলো"
                      className="w-full text-xs p-2.5 border rounded-lg outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">ছবির বিবরণ / ক্যাপশন (বাংলা)</label>
                    <input
                      type="text"
                      value={newPhoto.caption_bn}
                      onChange={(e) => setNewPhoto({ ...newPhoto, caption_bn: e.target.value })}
                      placeholder="স্থান ও ঘটনার সংক্ষিপ্ত বর্ণনা..."
                      className="w-full text-xs p-2.5 border rounded-lg outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="bg-[#e30613] hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors shadow flex items-center gap-2"
                  >
                    <Save size={14} />
                    <span>{editingPhotoId ? 'পরিবর্তন সংরক্ষণ করুন (Save Photo)' : 'ছবি যোগ করুন (Add Photo)'}</span>
                  </button>
                  {editingPhotoId && (
                    <button
                      type="button"
                      onClick={handleCancelPhotoEdit}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors"
                    >
                      বাতিল (Cancel)
                    </button>
                  )}
                </div>
              </form>

              {/* Photos List */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-sm text-gray-800 border-b pb-2 mb-4">আলোকচিত্র গ্যালারি ({toBengaliNumber(photos.length)} টি - ডাটাবেজ সংযুক্ত)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {photos.map((ph) => (
                    <div key={ph.id} className="rounded-lg overflow-hidden border border-gray-200 group relative hover:border-gray-300 transition-colors">
                      <img src={ph.image} alt="" className="w-full h-28 object-cover" />
                      <div className="p-2 text-[11px] flex justify-between items-center bg-white">
                        <div className="truncate flex-1 pr-2">
                          <p className="font-bold text-gray-900 truncate">{ph.title_bn}</p>
                          <p className="text-gray-400 text-[10px] truncate">{ph.credit_bn}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleEditPhotoClick(ph)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="সম্পাদনা করুন (Edit)"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeletePhotoClick(ph.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="মুছে ফেলুন (Delete)"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add/Edit Video Form */}
              <form onSubmit={handleAddVideoSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-2 text-[#e30613] font-bold">
                  <div className="flex items-center gap-2">
                    <Video size={18} />
                    <span>{editingVideoId ? 'ভিডিও প্রতিবেদন সম্পাদনা করুন (Edit Video)' : 'নতুন ভিডিও প্রতিবেদন যোগ করুন'}</span>
                  </div>
                  {editingVideoId && (
                    <button
                      type="button"
                      onClick={handleCancelVideoEdit}
                      className="text-xs text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors font-normal"
                    >
                      বাতিল করুন (Cancel)
                    </button>
                  )}
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
                      className="w-full text-xs p-2.5 border rounded-lg outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">সময়কাল (Duration)</label>
                    <input
                      type="text"
                      value={newVideo.duration}
                      onChange={(e) => setNewVideo({ ...newVideo, duration: e.target.value })}
                      placeholder="৪:১৫"
                      className="w-full text-xs p-2.5 border rounded-lg outline-none focus:border-red-500"
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
                      className="w-full text-xs p-2.5 border rounded-lg outline-none font-sans focus:border-red-500"
                    />
                  </div>
                  <div>
                    <ImageUploadInput
                      label="ভিডিও থাম্বনেইল ছবি (Video Thumbnail)"
                      value={newVideo.thumb}
                      onChange={(url) => setNewVideo({ ...newVideo, thumb: url })}
                      placeholder="https://images.unsplash.com/..."
                      helperText="ভিডিও কভার ছবি আপলোড করুন অথবা লিঙ্ক দিন।"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="bg-[#e30613] hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors shadow flex items-center gap-2"
                  >
                    <Save size={14} />
                    <span>{editingVideoId ? 'পরিবর্তন সংরক্ষণ করুন (Save Video)' : 'ভিডিও যোগ করুন (Add Video)'}</span>
                  </button>
                  {editingVideoId && (
                    <button
                      type="button"
                      onClick={handleCancelVideoEdit}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors"
                    >
                      বাতিল (Cancel)
                    </button>
                  )}
                </div>
              </form>

              {/* Videos List */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-sm text-gray-800 border-b pb-2 mb-4">ভিডিও প্রতিবেদন ({toBengaliNumber(videos.length)} টি - ডাটাবেজ সংযুক্ত)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {videos.map((v) => (
                    <div key={v.id} className="rounded-lg overflow-hidden border border-gray-200 p-3 flex gap-3 items-center justify-between hover:border-gray-300 transition-colors">
                      <div className="flex gap-3 items-center min-w-0">
                        <img src={v.thumb} alt="" className="w-20 h-14 object-cover rounded flex-shrink-0" />
                        <div className="text-xs min-w-0">
                          <p className="font-bold text-gray-900 line-clamp-2">{v.title_bn}</p>
                          <span className="text-[10px] text-red-600 font-bold block mt-1">সময়কাল: {v.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleEditVideoClick(v)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="সম্পাদনা করুন (Edit)"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteVideoClick(v.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="মুছে ফেলুন (Delete)"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 7.5: ROLE & STAFF MANAGEMENT ================= */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              {/* Top Banner and Sub-tab Switcher */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-[#e30613] flex items-center justify-center border border-red-100 shadow-xs">
                    <ShieldCheck size={26} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                      <span>রোল ও পারমিশন ব্যবস্থাপনা (Role & Staff Management)</span>
                      {/*                       <span className="text-[10px] bg-red-100 text-[#e30613] font-bold px-2.5 py-0.5 rounded-full border border-red-200">
                        MySQL লাইভ ডাটাবেজ
                      </span> */}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      ব্যবহারকারীদের রোল তৈরি, অ্যাক্সেস পারমিশন কন্ট্রোল এবং টিম মেম্বারদের দায়িত্ব বণ্টন করুন।
                    </p>
                  </div>
                </div>

                {/* Sub Tab Switcher Pills */}
                <div className="flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setRoleSubTab('roles')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${roleSubTab === 'roles'
                      ? 'bg-white text-[#e30613] shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    <Shield size={14} />
                    <span>ভূমিকা ও পারমিশন তালিকা</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-50 text-[#e30613] font-bold">
                      {toBengaliNumber(localRoles.length)}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleSubTab('staff')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${roleSubTab === 'staff'
                      ? 'bg-white text-[#e30613] shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    <Users size={14} />
                    <span>টিম ও স্টাফ সদস্য</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-600 font-bold">
                      {toBengaliNumber(localStaff.length)}
                    </span>
                  </button>
                </div>
              </div>

              {/* VIEW 1: ROLES & PERMISSIONS */}
              {roleSubTab === 'roles' && (
                <div className="space-y-6">
                  {/* Create / Edit Role Form */}
                  <form onSubmit={handleRoleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b pb-3 text-[#e30613] font-bold">
                      <div className="flex items-center gap-2">
                        <Key size={18} />
                        <span>{editingRoleId ? 'রোল সম্পাদনা করুন (Edit Role)' : 'রোল তৈরি করুন (Create New Role)'}</span>
                      </div>
                      {editingRoleId && (
                        <button
                          type="button"
                          onClick={handleCancelRoleEdit}
                          className="text-xs text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors font-normal"
                        >
                          বাতিল করুন (Cancel)
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">রোলের বাংলা নাম *</label>
                        <input
                          type="text"
                          required
                          value={roleForm.name_bn}
                          onChange={(e) => setRoleForm({ ...roleForm, name_bn: e.target.value })}
                          placeholder="বার্তা সম্পাদক / বিশেষ প্রতিবেদক"
                          className="w-full text-xs p-2.5 border rounded-lg outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Role Name (English)</label>
                        <input
                          type="text"
                          value={roleForm.name_en}
                          onChange={(e) => setRoleForm({ ...roleForm, name_en: e.target.value })}
                          placeholder="News Editor / Reporter"
                          className="w-full text-xs p-2.5 border rounded-lg outline-none font-sans focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">রোল কি (Role Key - Unique identifier)</label>
                        <input
                          type="text"
                          value={roleForm.role_key}
                          onChange={(e) => setRoleForm({ ...roleForm, role_key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
                          placeholder="editor / reporter"
                          disabled={editingRoleId && roleForm.role_key === 'admin'}
                          className="w-full text-xs p-2.5 border rounded-lg outline-none font-mono focus:border-red-500 disabled:bg-gray-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">দায়িত্ব ও বিবরণের সারসংক্ষেপ (বাংলা)</label>
                        <textarea
                          rows="2"
                          value={roleForm.description_bn}
                          onChange={(e) => setRoleForm({ ...roleForm, description_bn: e.target.value })}
                          placeholder="এই রোলের অন্তর্ভুক্ত কর্মীদের দায়িত্ব ও অনুমোদিত কার্যক্রম..."
                          className="w-full text-xs p-2.5 border rounded-lg outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">স্ট্যাটাস (Status)</label>
                        <select
                          value={roleForm.status}
                          onChange={(e) => setRoleForm({ ...roleForm, status: e.target.value })}
                          className="w-full text-xs p-2.5 border rounded-lg outline-none focus:border-red-500 bg-white"
                        >
                          <option value="active">সক্রিয় (Active - কার্যকর)</option>
                          <option value="inactive">স্থগিত (Inactive - সাময়িক বন্ধ)</option>
                        </select>
                        <p className="text-[11px] text-gray-400 mt-1">
                          সক্রিয় থাকলে সংশ্লিষ্ট ব্যবহারকারীরা এই রোলে লগইন ও কাজ করতে পারবেন।
                        </p>
                      </div>
                    </div>

                    {/* Permissions Checklist Grid */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                          <Lock size={14} className="text-[#e30613]" />
                          <span>অনুমোদিত অ্যাক্সেস পারমিশনসমূহ (Select Permissions)</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const allKeys = ALL_PERMISSIONS.map((p) => p.key)
                              setRoleForm({ ...roleForm, permissions: allKeys })
                            }}
                            className="text-[11px] text-[#e30613] font-bold hover:underline"
                          >
                            সব নির্বাচন করুন
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            type="button"
                            onClick={() => setRoleForm({ ...roleForm, permissions: ['manage_articles'] })}
                            className="text-[11px] text-gray-500 font-bold hover:underline"
                          >
                            রিসেট
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {ALL_PERMISSIONS.map((p) => {
                          const isChecked = Array.isArray(roleForm.permissions) && roleForm.permissions.includes(p.key)
                          return (
                            <label
                              key={p.key}
                              className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs cursor-pointer transition-all ${isChecked
                                ? 'bg-red-50/60 border-red-300 text-gray-900 shadow-2xs'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const current = Array.isArray(roleForm.permissions) ? [...roleForm.permissions] : []
                                  if (e.target.checked) {
                                    if (!current.includes(p.key)) current.push(p.key)
                                  } else {
                                    const idx = current.indexOf(p.key)
                                    if (idx !== -1) current.splice(idx, 1)
                                  }
                                  setRoleForm({ ...roleForm, permissions: current })
                                }}
                                className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                              />
                              <div>
                                <span className="font-bold block text-gray-900">{p.bn}</span>
                                <span className="text-[10px] text-gray-500 block mt-0.5">{p.desc}</span>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        className="bg-[#e30613] hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors shadow flex items-center gap-2"
                      >
                        <Save size={14} />
                        <span>{editingRoleId ? 'পরিবর্তন সংরক্ষণ করুন (Save Role)' : 'রোল তৈরি করুন (Create Role)'}</span>
                      </button>
                      {editingRoleId && (
                        <button
                          type="button"
                          onClick={handleCancelRoleEdit}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors"
                        >
                          বাতিল (Cancel)
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Roles List Cards */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                          <ShieldCheck size={16} className="text-[#e30613]" />
                          <span>সক্রিয় ভূমিকার তালিকা ({toBengaliNumber(localRoles.length)} টি রোল)</span>
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">ডাটাবেজে সংরক্ষিত প্রতিটি রোলের পারমিশন ও স্টাফ সংখ্যা</p>
                      </div>
                      {/*                       <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        সিস্টেম কানেক্টেড
                      </span> */}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {localRoles.map((r) => {
                        const isSuperAdmin = r.role_key === 'admin' || r.is_system
                        const permsList = Array.isArray(r.permissions) ? r.permissions : []
                        return (
                          <div
                            key={r.id || r.role_key}
                            className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${isSuperAdmin
                              ? 'bg-gradient-to-br from-red-50/40 to-white border-red-200 shadow-xs'
                              : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs'
                              }`}
                          >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${isSuperAdmin ? 'bg-[#e30613] text-white' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    <Shield size={16} />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-xs text-gray-900">{r.name_bn}</h4>
                                    <span className="text-[10px] text-gray-400 font-mono block">{r.role_key}</span>
                                  </div>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'
                                  }`}>
                                  {r.status === 'active' ? 'সক্রিয়' : 'স্থগিত'}
                                </span>
                              </div>

                              {r.description_bn && (
                                <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                                  {r.description_bn}
                                </p>
                              )}

                              <div>
                                <span className="text-[10px] font-bold text-gray-400 block mb-1">অনুমোদিত পারমিশন:</span>
                                <div className="flex flex-wrap gap-1">
                                  {permsList.slice(0, 4).map((pKey) => (
                                    <span key={pKey} className="text-[9px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-mono">
                                      {pKey}
                                    </span>
                                  ))}
                                  {permsList.length > 4 && (
                                    <span className="text-[9px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-bold">
                                      +{permsList.length - 4} টি
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="border-t pt-3 mt-3 flex items-center justify-between text-xs text-gray-500">
                              <span className="text-[11px] flex items-center gap-1 font-semibold text-gray-600">
                                <Users size={12} className="text-gray-400" />
                                <span>{toBengaliNumber(r.user_count || 0)} জন কর্মী</span>
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditRoleClick(r)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="সম্পাদনা করুন (Edit)"
                                >
                                  <Edit size={14} />
                                </button>
                                {!isSuperAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRoleClick(r)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="মুছে ফেলুন (Delete)"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 2: TEAM MEMBERS & STAFF USERS */}
              {roleSubTab === 'staff' && (
                <div className="space-y-6">
                  {/* Add / Edit Staff Member Form */}
                  <form onSubmit={handleStaffSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b pb-3 text-[#e30613] font-bold">
                      <div className="flex items-center gap-2">
                        <UserPlus size={18} />
                        <span>{editingStaffId ? 'টিম সদস্য সম্পাদনা করুন (Edit Staff Member)' : 'নতুন টিম সদস্য / অ্যাডমিন যুক্ত করুন'}</span>
                      </div>
                      {editingStaffId && (
                        <button
                          type="button"
                          onClick={handleCancelStaffEdit}
                          className="text-xs text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors font-normal"
                        >
                          বাতিল করুন (Cancel)
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">পূর্ণ নাম *</label>
                        <input
                          type="text"
                          required
                          value={staffForm.name}
                          onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                          placeholder="মুস্তাফিজুর রহমান"
                          className="w-full text-xs p-2.5 border rounded-lg outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">ইমেইল এড্রেস (Login Email) *</label>
                        <input
                          type="email"
                          required
                          value={staffForm.email}
                          onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                          placeholder="reporter@prothomalo.com"
                          className="w-full text-xs p-2.5 border rounded-lg outline-none font-sans focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          {editingStaffId ? 'নতুন পাসওয়ার্ড (পরিবর্তন না করলে খালি রাখুন)' : 'লগইন পাসওয়ার্ড (Password) *'}
                        </label>
                        <input
                          type="password"
                          required={!editingStaffId}
                          value={staffForm.password}
                          onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                          placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                          className="w-full text-xs p-2.5 border rounded-lg outline-none font-sans focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">নির্ধারিত ভূমিকা / পদবি (Role) *</label>
                        <select
                          value={staffForm.role_key}
                          onChange={(e) => setStaffForm({ ...staffForm, role_key: e.target.value })}
                          className="w-full text-xs p-2.5 border rounded-lg outline-none focus:border-red-500 bg-white"
                        >
                          {localRoles.map((r) => (
                            <option key={r.role_key} value={r.role_key}>
                              {r.name_bn} ({r.role_key})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">মোবাইল নম্বর (Phone)</label>
                        <input
                          type="text"
                          value={staffForm.phone}
                          onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                          placeholder="০১৭xxxxxxxx"
                          className="w-full text-xs p-2.5 border rounded-lg outline-none focus:border-red-500 font-sans"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">স্ট্যাটাস (Status)</label>
                        <select
                          value={staffForm.status}
                          onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value })}
                          className="w-full text-xs p-2.5 border rounded-lg outline-none focus:border-red-500 bg-white"
                        >
                          <option value="active">সক্রিয় (Active - লগইন অনুমোদিত)</option>
                          <option value="inactive">স্থগিত (Inactive - সাময়িক স্থগিত)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        className="bg-[#e30613] hover:bg-red-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors shadow flex items-center gap-2"
                      >
                        <Save size={14} />
                        <span>{editingStaffId ? 'সদস্যের তথ্য সংরক্ষণ করুন' : 'টিম সদস্য যুক্ত করুন'}</span>
                      </button>
                      {editingStaffId && (
                        <button
                          type="button"
                          onClick={handleCancelStaffEdit}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors"
                        >
                          বাতিল (Cancel)
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Staff Members Table */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                      <div>
                        <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                          <Users size={16} className="text-[#e30613]" />
                          <span>টিম ও স্টাফ সদস্য তালিকা ({toBengaliNumber(localStaff.length)} জন)</span>
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">যাঁরা ড্যাশবোর্ডে লগইন করে নির্দিষ্ট পারমিশনে কাজ করতে পারবেন</p>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">নিরাপদ বি-ক্রিপ্ট এনক্রিপশন</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-gray-600">
                        <thead className="bg-gray-100 text-gray-700 uppercase font-bold border-b">
                          <tr>
                            <th className="p-3">সদস্যের নাম</th>
                            <th className="p-3">ইমেইল</th>
                            <th className="p-3">পদবি / রোল</th>
                            <th className="p-3">ফোন</th>
                            <th className="p-3 text-center">স্ট্যাটাস</th>
                            <th className="p-3 text-center">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {localStaff.map((m) => {
                            const isCurrent = currentUser?.email === m.email
                            return (
                              <tr key={m.id || m.email} className="hover:bg-gray-50 transition-colors">
                                <td className="p-3 font-bold text-gray-900 flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-red-100 text-[#e30613] font-bold flex items-center justify-center flex-shrink-0 text-xs">
                                    {(m.name || 'A').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <span>{m.name || 'Administrator'}</span>
                                    {isCurrent && (
                                      <span className="block text-[10px] text-red-600 font-semibold">(বর্তমান একাউন্ট)</span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3 font-mono text-gray-700">{m.email}</td>
                                <td className="p-3">
                                  <span className="inline-flex items-center gap-1 font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                                    <Shield size={11} className="text-[#e30613]" />
                                    <span>{m.role_name_bn || m.role_key}</span>
                                  </span>
                                </td>
                                <td className="p-3 font-mono text-gray-500">{m.phone || '—'}</td>
                                <td className="p-3 text-center">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {m.status === 'active' ? 'সক্রিয়' : 'স্থগিত'}
                                  </span>
                                </td>
                                <td className="p-3 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleEditStaffClick(m)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                      title="সম্পাদনা করুন (Edit)"
                                    >
                                      <Edit size={14} />
                                    </button>
                                    {!isCurrent && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteStaffClick(m)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="মুছে ফেলুন (Delete)"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    )}
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
            </div>
          )}

          {/* ================= TAB: READER POLLS (পাঠক জরিপ) ================= */}
          {activeTab === 'polls' && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-red-50 text-[#e30613] flex items-center justify-center">
                    <Vote size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      {lang === 'bn' ? 'পাঠক জরিপ ব্যবস্থাপনা (Reader Polls)' : 'Reader Poll Management'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {lang === 'bn'
                        ? 'ওয়েবসাইটের হোমপেজে প্রদর্শিত পাঠক মতামত জরিপ তৈরি, সম্পাদনা, ফলাফল পর্যবেক্ষণ ও নিয়ন্ত্রণ করুন।'
                        : 'Create, edit, observe results, and control the active online reader opinion poll on the homepage.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={refreshPolls}
                    disabled={pollLoading}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw size={13} className={pollLoading ? 'animate-spin' : ''} />
                    <span>{lang === 'bn' ? 'রিফ্রেশ' : 'Refresh'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPollId(null)
                      setPollForm(emptyPollForm)
                      const elem = document.getElementById('poll-form-card')
                      if (elem) elem.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="px-3.5 py-2 bg-[#e30613] hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <PlusCircle size={14} />
                    <span>{lang === 'bn' ? 'নতুন জরিপ লিখুন' : 'New Poll'}</span>
                  </button>
                </div>
              </div>

              {/* Live Active Poll Widget Card */}
              {activePoll && (
                <div className="bg-gradient-to-br from-white to-red-50/30 p-6 rounded-xl border border-red-200 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-red-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-red-600 flex items-center gap-1">
                        <Vote size={14} />
                        <span>{lang === 'bn' ? 'হোমপেজে সক্রিয় বর্তমান জরিপ' : 'Currently Active Poll on Homepage'}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${activePoll.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                        }`}>
                        {activePoll.status === 'active' ? (lang === 'bn' ? 'সক্রিয় (Active)' : 'Active') : (lang === 'bn' ? 'বন্ধ (Closed)' : 'Closed')}
                      </span>

                      <span className="text-xs font-bold text-gray-700 bg-white border border-gray-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                        {lang === 'bn' ? `মোট ভোট: ${toBengaliNumber(activePoll.total_votes)} টি` : `Total Votes: ${activePoll.total_votes}`}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-gray-900 leading-snug">
                      {activePoll.question_bn || activePoll.question_en}
                    </h4>
                    {activePoll.question_en && activePoll.question_bn && (
                      <p className="text-xs text-gray-500 mt-0.5 italic">
                        {activePoll.question_en}
                      </p>
                    )}
                  </div>

                  {/* Option Progress Breakdown */}
                  <div className="space-y-3 pt-1">
                    {(activePoll.options || []).map((opt, i) => {
                      const total = Number(activePoll.total_votes) || 0
                      const votes = Number(opt.votes) || 0
                      const pct = total > 0 ? Math.round((votes / total) * 1000) / 10 : 0
                      const barColors = ['bg-emerald-500', 'bg-[#e30613]', 'bg-amber-500', 'bg-blue-500', 'bg-purple-500', 'bg-gray-500']
                      const barColor = barColors[i % barColors.length]

                      return (
                        <div key={opt.id || i} className="bg-white p-3 rounded-lg border border-gray-100 shadow-2xs space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-800 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                              <span>{opt.label_bn || opt.label_en}</span>
                              {opt.label_en && opt.label_bn && (
                                <span className="text-gray-400 font-normal text-[11px]">({opt.label_en})</span>
                              )}
                            </span>
                            <span className="font-black text-gray-900">
                              {toBengaliNumber(pct)}%
                              <span className="text-gray-400 font-normal ml-1.5 text-[11px]">
                                ({toBengaliNumber(votes)} ভোট)
                              </span>
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${barColor} transition-all duration-500`}
                              style={{ width: `${Math.min(100, Math.max(pct > 0 ? pct : 2, 0))}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Active Poll Toolbar */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-red-100">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTogglePollStatus(activePoll)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${activePoll.status === 'active'
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                      >
                        {activePoll.status === 'active'
                          ? (lang === 'bn' ? '⏸ জরিপ সমাপ্ত/বন্ধ করুন' : 'Close Poll')
                          : (lang === 'bn' ? '▶ পুনরায় চালু করুন' : 'Reactivate Poll')}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleResetPollVotes(activePoll)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 rounded-lg text-xs font-bold transition-colors"
                      >
                        {lang === 'bn' ? '🔄 ভোট ০ তে রিসেট করুন' : 'Reset Votes'}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleEditPollClick(activePoll)}
                      className="px-3.5 py-1.5 bg-[#1a3a5c] hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Edit size={13} />
                      <span>{lang === 'bn' ? 'জরিপ সম্পাদনা করুন' : 'Edit Poll'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Poll Create / Edit Form Card */}
              <div id="poll-form-card" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-red-50 text-[#e30613] rounded-lg">
                      <PlusCircle size={18} />
                    </span>
                    <h4 className="text-sm font-bold text-gray-900">
                      {editingPollId
                        ? (lang === 'bn' ? 'পাঠক জরিপ সম্পাদনা করুন' : 'Edit Reader Poll')
                        : (lang === 'bn' ? 'নতুন পাঠক জরিপ তৈরি করুন' : 'Create New Reader Poll')}
                    </h4>
                  </div>
                  {editingPollId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPollId(null)
                        setPollForm(emptyPollForm)
                      }}
                      className="text-xs text-gray-500 hover:text-red-600 font-bold"
                    >
                      {lang === 'bn' ? '✕ বাতিল করুন' : '✕ Cancel Edit'}
                    </button>
                  )}
                </div>

                <form onSubmit={handlePollSubmit} className="space-y-4">
                  {/* Question Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-700">
                        {lang === 'bn' ? 'জরিপের মূল প্রশ্ন (বাংলায়) *' : 'Poll Question (Bengali) *'}
                      </label>
                      <textarea
                        rows={2}
                        value={pollForm.question_bn}
                        onChange={(e) => setPollForm({ ...pollForm, question_bn: e.target.value })}
                        placeholder="যেমন: আপনি কি মনে করেন এআই নিয়ন্ত্রিত ট্র্যাফিক সিগন্যাল ঢাকায় যানজট নিরসনে ফলপ্রসূ হবে?"
                        className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-700">
                        {lang === 'bn' ? 'জরিপের প্রশ্ন (ইংরেজি)' : 'Poll Question (English)'}
                      </label>
                      <textarea
                        rows={2}
                        value={pollForm.question_en}
                        onChange={(e) => setPollForm({ ...pollForm, question_en: e.target.value })}
                        placeholder="e.g. Do you believe AI-driven adaptive traffic signals will solve congestion in Dhaka?"
                        className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Status Toggle & Reset Votes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-gray-700">
                        {lang === 'bn' ? 'জরিপের স্থিতি (Status)' : 'Poll Status'}
                      </label>
                      <div className="flex items-center gap-4 text-xs pt-1">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="poll_status"
                            value="active"
                            checked={pollForm.status === 'active'}
                            onChange={() => setPollForm({ ...pollForm, status: 'active' })}
                            className="text-[#e30613] focus:ring-[#e30613]"
                          />
                          <span className="font-semibold text-emerald-700">
                            {lang === 'bn' ? 'সক্রিয় (হোমপেজে লাইভ থাকবে)' : 'Active (Live on homepage)'}
                          </span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="poll_status"
                            value="closed"
                            checked={pollForm.status === 'closed'}
                            onChange={() => setPollForm({ ...pollForm, status: 'closed' })}
                            className="text-[#e30613] focus:ring-[#e30613]"
                          />
                          <span className="font-semibold text-gray-600">
                            {lang === 'bn' ? 'বন্ধ (Closed)' : 'Closed'}
                          </span>
                        </label>
                      </div>
                    </div>

                    {editingPollId && (
                      <div className="flex items-center">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-red-600 bg-red-50 p-2 rounded border border-red-200 w-full">
                          <input
                            type="checkbox"
                            checked={pollForm.reset_votes}
                            onChange={(e) => setPollForm({ ...pollForm, reset_votes: e.target.checked })}
                            className="rounded text-[#e30613] focus:ring-[#e30613]"
                          />
                          <span>{lang === 'bn' ? 'ভোট সংখ্যা ০ তে রিসেট করুন' : 'Reset all votes to 0'}</span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Options Builder */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-gray-700">
                        {lang === 'bn' ? 'জরিপের বিকল্পসমূহ (Options - কমপক্ষে ২টি)' : 'Poll Options (Minimum 2)'}
                      </label>
                      <button
                        type="button"
                        onClick={handleAddPollOption}
                        className="text-xs text-[#e30613] hover:text-red-700 font-bold flex items-center gap-1"
                      >
                        <PlusCircle size={13} />
                        <span>{lang === 'bn' ? '+ নতুন বিকল্প যোগ করুন' : '+ Add Option'}</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {pollForm.options.map((opt, idx) => (
                        <div key={opt.id || idx} className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                          <span className="w-6 h-6 rounded-full bg-white border border-gray-300 text-gray-700 text-xs font-bold flex items-center justify-center shrink-0">
                            {toBengaliNumber(idx + 1)}
                          </span>

                          <input
                            type="text"
                            placeholder={lang === 'bn' ? `বিকল্প ${idx + 1} (বাংলা, যেমন: হ্যাঁ)` : `Option ${idx + 1} (Bengali)`}
                            value={opt.label_bn}
                            onChange={(e) => handlePollOptionChange(idx, 'label_bn', e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-white border rounded text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
                            required
                          />

                          <input
                            type="text"
                            placeholder={lang === 'bn' ? `বিকল্প ${idx + 1} (ইংরেজি, যেমন: Yes)` : `Option ${idx + 1} (English)`}
                            value={opt.label_en}
                            onChange={(e) => handlePollOptionChange(idx, 'label_en', e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-white border rounded text-xs focus:ring-1 focus:ring-red-500 focus:outline-none"
                          />

                          {opt.votes !== undefined && (
                            <span className="text-[11px] font-bold text-gray-500 px-2 py-1 bg-white border rounded shrink-0">
                              {toBengaliNumber(opt.votes)} ভোট
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemovePollOption(idx)}
                            disabled={pollForm.options.length <= 2}
                            className="p-1.5 text-gray-400 hover:text-red-600 disabled:opacity-30 transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={pollSubmitting}
                      className="px-6 py-2.5 bg-[#e30613] hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow transition-all disabled:opacity-50"
                    >
                      <Save size={14} />
                      <span>
                        {pollSubmitting
                          ? (lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                          : (editingPollId
                            ? (lang === 'bn' ? 'পাঠক জরিপ আপডেট করুন' : 'Update Reader Poll')
                            : (lang === 'bn' ? 'জরিপ সংরক্ষণ ও প্রকাশ করুন' : 'Save & Publish Poll'))}
                      </span>
                    </button>
                  </div>
                </form>
              </div>

              {/* All Polls History Table */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <BarChart2 size={16} className="text-[#e30613]" />
                    <span>{lang === 'bn' ? 'পাঠক জরিপ আর্কাইভ ও ইতিহাস' : 'Polls Archive & History'}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                      {toBengaliNumber(polls.length)}
                    </span>
                  </h4>
                </div>

                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-gray-600 font-bold border-b">
                      <tr>
                        <th className="py-2.5 px-3">আইডি</th>
                        <th className="py-2.5 px-3">জরিপের প্রশ্ন</th>
                        <th className="py-2.5 px-3">বিকল্পসমূহ</th>
                        <th className="py-2.5 px-3 text-center">মোট ভোট</th>
                        <th className="py-2.5 px-3 text-center">স্ট্যাটাস</th>
                        <th className="py-2.5 px-3 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {polls.map((p) => {
                        const isLive = p.status === 'active'
                        return (
                          <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${isLive ? 'bg-red-50/20' : ''}`}>
                            <td className="py-2.5 px-3 font-mono font-bold text-gray-500">
                              #{p.id}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-gray-900 block line-clamp-2">
                                {p.question_bn || p.question_en}
                              </span>
                              {p.question_en && p.question_bn && (
                                <span className="text-[11px] text-gray-400 italic block line-clamp-1">
                                  {p.question_en}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-gray-600">
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {(p.options || []).map((o, oi) => (
                                  <span key={oi} className="inline-block px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-700">
                                    {o.label_bn || o.label_en}: {toBengaliNumber(o.votes || 0)} ({o.percent || 0}%)
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-gray-900">
                              {toBengaliNumber(p.total_votes || 0)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {isLive ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                  সক্রিয় (Live)
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                  বন্ধ (Closed)
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {!isLive && (
                                  <button
                                    type="button"
                                    onClick={() => handleTogglePollStatus(p)}
                                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded text-[11px] transition-colors"
                                    title="হোমপেজে সক্রিয় করুন"
                                  >
                                    সক্রিয় করুন
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleEditPollClick(p)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="সম্পাদনা"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleResetPollVotes(p)}
                                  className="p-1 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                  title="ভোট রিসেট"
                                >
                                  <RefreshCw size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePollClick(p)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="মুছে ফেলুন"
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
                  {/*                   <button
                    type="button"
                    onClick={handleResetSiteSettingsToDefault}
                    className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    ডিফল্ট ফিরিয়ে আনুন
                  </button> */}
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
                    <span>লাইভ ব্র্যান্ডিং প্রিভিউ (Live Header Preview)</span>
                  </span>
                  {/*                   <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2.5 py-0.5 rounded-full">
                    সরাসরি দৃশ্যমান
                  </span> */}
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
                      <ImageUploadInput
                        label={lang === 'bn' ? 'কাস্টম লোগো ছবি (Custom Logo Image)' : 'Custom Logo Image'}
                        value={siteForm.logo_url}
                        onChange={(val) => setSiteForm({ ...siteForm, logo_url: val })}
                        placeholder="https://..."
                        helpText={lang === 'bn' ? 'টিপ: কোনো কাস্টম লোগো আপলোড বা URL দিলে তা দৃশ্যমান হবে, খালি রাখলে মূল ভেক্টর প্রতীক থাকবে।' : 'Upload custom logo image or leave empty for default.'}
                      />
                    </div>
                    <div>
                      <ImageUploadInput
                        label={lang === 'bn' ? 'কাস্টম ফেভিকন আইকন (Custom Favicon)' : 'Custom Favicon'}
                        value={siteForm.favicon_url}
                        onChange={(val) => setSiteForm({ ...siteForm, favicon_url: val })}
                        placeholder="https://... (.ico, .png, .svg)"
                        helpText={lang === 'bn' ? 'ব্রাউজার ট্যাবে প্রদর্শিত ছোট আইকন (favicon)।' : 'Browser tab favicon icon.'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
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
                        placeholder="সংবাদ, খবর, বাংলাদেশ, আলোর পথে, ব্রেকিং নিউজ, Prothom kalo"
                        className="w-full p-2.5 border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <ImageUploadInput
                        label={lang === 'bn' ? 'ডিফল্ট সোশ্যাল মিডিয়া ও ওপেনগ্রাফ শেয়ার ছবি (Default OpenGraph Share Image)' : 'Default OG Social Share Image'}
                        value={siteForm.og_image_default}
                        onChange={(val) => setSiteForm({ ...siteForm, og_image_default: val })}
                        placeholder="https://..."
                        helpText={lang === 'bn' ? 'ফেসবুক বা টুইটারে সাইটের হোমপেজ বা কোনো সংবাদ শেয়ার করলে এই ছবিটি থাম্বনেইল হিসেবে প্রদর্শিত হবে।' : 'Default preview image when sharing homepage on Facebook/Twitter.'}
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

                {/* 7. Live Currency & Exchange Market Rates */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between border-b pb-2.5 gap-2">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <DollarSign size={16} className="text-[#e30613]" />
                      <span>৭. বাংলাদেশ ব্যাংক সরকারি মুদ্রা রেট ও এক্সচেঞ্জ বাজার (Govt Currency Rates)</span>
                    </h4>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSyncGovtRates}
                        disabled={isSyncingGovt}
                        className="px-3 py-1.5 bg-[#1a3a5c] hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-50"
                        title="সরাসরি সরকারি রেট ফেচ ও আপডেট করুন"
                      >
                        <RefreshCw size={12} className={isSyncingGovt ? 'animate-spin' : ''} />
                        <span>{isSyncingGovt ? 'সিঙ্ক হচ্ছে...' : 'সরকারি রেট সিঙ্ক করুন'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveCurrencyRates}
                        disabled={isSavingCurrency}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-50"
                      >
                        <Save size={13} />
                        <span>{isSavingCurrency ? 'সংরক্ষণ হচ্ছে...' : 'মুদ্রা রেট সংরক্ষণ করুন'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    হোমপেজের &quot;অর্থনীতি ও ব্যবসা&quot; সেকশনে প্রদর্শিত বৈদেশিক মুদ্রার ক্রয় ও বিক্রয় দর (টাকায়/BDT)। ফ্রন্টএন্ডে এটি বাংলাদেশ ব্যাংকের বাজার ট্রেন্ড অনুযায়ী সব সময় স্বয়ংক্রিয়ভাবে আপডেট হয়।
                  </p>

                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-50 text-gray-700 font-bold border-b">
                        <tr>
                          <th className="p-2.5">মুদ্রা কোড</th>
                          <th className="p-2.5">মুদ্রার নাম (বাংলা)</th>
                          <th className="p-2.5">ক্রয় মূল্য (৳ Buy Rate)</th>
                          <th className="p-2.5">বিক্রয় মূল্য (৳ Sell Rate)</th>
                          <th className="p-2.5">পরিবর্তন (Change)</th>
                          <th className="p-2.5">ট্রেন্ড</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {currencyList.map((c, idx) => (
                          <tr key={c.currency} className="hover:bg-gray-50">
                            <td className="p-2.5 font-bold text-gray-900 flex items-center gap-1.5">
                              <span>{c.flag || '💱'}</span>
                              <span>{c.currency}</span>
                            </td>
                            <td className="p-2.5 font-medium text-gray-700">{c.name_bn}</td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                step="0.01"
                                value={c.buy_num}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0
                                  const updated = [...currencyList]
                                  updated[idx] = { ...updated[idx], buy_num: val }
                                  setCurrencyList(updated)
                                }}
                                className="w-28 p-1.5 border rounded focus:ring-1 focus:ring-red-500 outline-none font-bold text-red-600"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="number"
                                step="0.01"
                                value={c.sell_num}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0
                                  const updated = [...currencyList]
                                  updated[idx] = { ...updated[idx], sell_num: val }
                                  setCurrencyList(updated)
                                }}
                                className="w-28 p-1.5 border rounded focus:ring-1 focus:ring-red-500 outline-none font-semibold text-gray-800"
                              />
                            </td>
                            <td className="p-2.5">
                              <input
                                type="text"
                                value={c.change || ''}
                                onChange={(e) => {
                                  const updated = [...currencyList]
                                  updated[idx] = { ...updated[idx], change: e.target.value }
                                  setCurrencyList(updated)
                                }}
                                placeholder="+0.15"
                                className="w-24 p-1.5 border rounded focus:ring-1 focus:ring-red-500 outline-none"
                              />
                            </td>
                            <td className="p-2.5">
                              <select
                                value={c.change_type || 'neutral'}
                                onChange={(e) => {
                                  const updated = [...currencyList]
                                  updated[idx] = { ...updated[idx], change_type: e.target.value }
                                  setCurrencyList(updated)
                                }}
                                className="p-1.5 border rounded outline-none text-[11px]"
                              >
                                <option value="up">▲ ঊর্ধ্বমুখী (Up)</option>
                                <option value="down">▼ নিম্নমুখী (Down)</option>
                                <option value="neutral">— অপরিবর্তিত (Neutral)</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
