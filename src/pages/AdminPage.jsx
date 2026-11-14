import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PlusCircle,
  Trash2,
  Edit3,
  Flame,
  CheckCircle,
  RotateCcw,
  Home,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react'
import { CATEGORIES_BN, CATEGORIES_EN, toBengaliNumber } from '../utils.js'

export default function AdminPage({
  articles = [],
  breakingNews = [],
  onAddArticle,
  onUpdateArticle,
  onDeleteArticle,
  onAddBreaking,
  onDeleteBreaking,
  onResetData,
  lang = 'bn',
}) {
  const [activeTab, setActiveTab] = useState('add') // 'add' | 'list' | 'breaking'
  const [editingId, setEditingId] = useState(null)
  const [toast, setToast] = useState('')

  // Article Form State
  const initialForm = {
    title_bn: '',
    title_en: '',
    subheadline_bn: '',
    subheadline_en: '',
    summary_bn: '',
    summary_en: '',
    category: 'national',
    author_bn: '',
    author_en: '',
    author_role_bn: 'প্রতিবেদক',
    author_role_en: 'Staff Reporter',
    image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
    content_bn: '',
    content_en: '',
    featured: false,
    tags_bn: 'বাংলাদেশ, সংবাদ',
    tags_en: 'Bangladesh, News',
  }

  const [formData, setFormData] = useState(initialForm)

  // Breaking News Input State
  const [breakingBn, setBreakingBn] = useState('')
  const [breakingEn, setBreakingEn] = useState('')

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  // Handle Form Submission (Add or Edit)
  const handleSubmitArticle = (e) => {
    e.preventDefault()
    if (!formData.title_bn.trim() && !formData.title_en.trim()) {
      alert('Please enter at least one headline.')
      return
    }

    const tagsArrayBn = formData.tags_bn.split(',').map((t) => t.trim()).filter(Boolean)
    const tagsArrayEn = formData.tags_en.split(',').map((t) => t.trim()).filter(Boolean)

    if (editingId) {
      // Update
      const updated = {
        ...formData,
        id: editingId,
        tags_bn: tagsArrayBn,
        tags_en: tagsArrayEn,
        slug: formData.slug || `article-${editingId}`,
      }
      onUpdateArticle(updated)
      setEditingId(null)
      showToast(lang === 'bn' ? 'সংবাদটি সফলভাবে আপডেট করা হয়েছে!' : 'Article updated successfully!')
    } else {
      // Add New
      const newArticle = {
        ...formData,
        id: Date.now(),
        slug: `news-${Date.now()}`,
        date: new Date().toISOString(),
        views: Math.floor(Math.random() * 5000) + 1000,
        tags_bn: tagsArrayBn,
        tags_en: tagsArrayEn,
      }
      onAddArticle(newArticle)
      showToast(lang === 'bn' ? 'নতুন সংবাদ সফলভাবে যুক্ত করা হয়েছে!' : 'New article added successfully!')
    }

    setFormData(initialForm)
    setActiveTab('list')
  }

  // Edit Click
  const handleEditClick = (art) => {
    setFormData({
      ...art,
      tags_bn: (art.tags_bn || []).join(', '),
      tags_en: (art.tags_en || []).join(', '),
    })
    setEditingId(art.id)
    setActiveTab('add')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Add Breaking News
  const handleAddBreaking = (e) => {
    e.preventDefault()
    if (breakingBn.trim() || breakingEn.trim()) {
      const item = {
        id: Date.now(),
        title_bn: breakingBn.trim() || breakingEn.trim(),
        title_en: breakingEn.trim() || breakingBn.trim(),
        slug: `breaking-${Date.now()}`,
      }
      onAddBreaking(item)
      setBreakingBn('')
      setBreakingEn('')
      showToast(lang === 'bn' ? 'ব্রেকিং নিউজ যোগ করা হয়েছে!' : 'Breaking news added!')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-bengali">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 pb-2 border-b border-gray-200">
        <Link to="/" className="hover:text-red-600 flex items-center gap-1">
          <Home size={13} />
          <span>{lang === 'bn' ? 'প্রচ্ছদ' : 'Home'}</span>
        </Link>
        <ChevronRight size={12} className="text-gray-400" />
        <span className="font-bold text-[#e30613]">{lang === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Admin CMS Portal'}</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-[#1a3a5c] text-white p-6 rounded-lg shadow mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2">
            <Sparkles size={24} className="text-red-400" />
            <span>{lang === 'bn' ? 'প্রথম আলো সংবাদ ব্যবস্থাপনা পোর্টাল' : 'Prothom Alo CMS Admin'}</span>
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            {lang === 'bn'
              ? 'নতুন সংবাদ তৈরি, সম্পাদনা, মুছে ফেলা ও ব্রেকিং নিউজ সরাসরি পরিচালনা করুন।'
              : 'Create, update, manage articles, and stream breaking news instantly.'}
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm(lang === 'bn' ? 'আপনি কি ডিফল্ট তথ্য পুনরুদ্ধার করতে চান?' : 'Reset to default dataset?')) {
              onResetData()
              showToast(lang === 'bn' ? 'ডিফল্ট ডেটা সফলভাবে পুনরুদ্ধার হয়েছে।' : 'Default dataset restored.')
            }
          }}
          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded shadow transition-colors"
        >
          <RotateCcw size={14} />
          <span>{lang === 'bn' ? 'ডিফল্ট ডেটা রিসেট' : 'Reset to Defaults'}</span>
        </button>
      </div>

      {/* Toast alert */}
      {toast && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle size={18} className="text-green-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg px-4 pt-2">
        <button
          onClick={() => { setActiveTab('add'); setEditingId(null); setFormData(initialForm) }}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'add'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-600 hover:text-red-600'
          }`}
        >
          <PlusCircle size={16} />
          <span>{editingId ? (lang === 'bn' ? 'সংবাদ সম্পাদনা' : 'Edit Article') : (lang === 'bn' ? 'নতুন সংবাদ যোগ' : 'Add New Article')}</span>
        </button>

        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'list'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-600 hover:text-red-600'
          }`}
        >
          <Layers size={16} />
          <span>{lang === 'bn' ? `সংবাদ তালিকা (${toBengaliNumber(articles.length)})` : `All Articles (${articles.length})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('breaking')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'breaking'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-600 hover:text-red-600'
          }`}
        >
          <Flame size={16} />
          <span>{lang === 'bn' ? `ব্রেকিং নিউজ (${toBengaliNumber(breakingNews.length)})` : `Breaking News (${breakingNews.length})`}</span>
        </button>
      </div>

      {/* TAB 1: ADD OR EDIT ARTICLE */}
      {activeTab === 'add' && (
        <form onSubmit={handleSubmitArticle} className="bg-white p-6 sm:p-8 rounded-lg border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-gray-900 pb-3 border-b">
            {editingId ? (lang === 'bn' ? 'সংবাদ সম্পাদনা করুন' : 'Edit Article') : (lang === 'bn' ? 'নতুন সংবাদ তৈরি করুন' : 'Create New Article')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title BN */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {lang === 'bn' ? 'শিরোনাম (বাংলা) *' : 'Headline (Bangla) *'}
              </label>
              <input
                type="text"
                required
                value={formData.title_bn}
                onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
                placeholder="যেমন: ঢাকায় আজ থেকে মেট্রোরেলের পূর্ণাঙ্গ সেবা চালু"
                className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            {/* Title EN */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {lang === 'bn' ? 'শিরোনাম (English)' : 'Headline (English)'}
              </label>
              <input
                type="text"
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                placeholder="e.g.: Metro rail full service begins in Dhaka today"
                className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            {/* Subheadline BN */}
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

            {/* Subheadline EN */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {lang === 'bn' ? 'উপ-শিরোনাম (English)' : 'Sub-headline (English)'}
              </label>
              <input
                type="text"
                value={formData.subheadline_en}
                onChange={(e) => setFormData({ ...formData, subheadline_en: e.target.value })}
                placeholder="Sub-headline in English..."
                className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            {/* Category */}
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

            {/* Image URL */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {lang === 'bn' ? 'ছবির লিঙ্ক (Image URL) *' : 'Image URL *'}
              </label>
              <input
                type="url"
                required
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
                className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            {/* Author BN */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {lang === 'bn' ? 'লেখক / প্রতিবেদকের নাম (বাংলা)' : 'Author Name (Bangla)'}
              </label>
              <input
                type="text"
                value={formData.author_bn}
                onChange={(e) => setFormData({ ...formData, author_bn: e.target.value })}
                placeholder="শাহরিয়ার হোসেন"
                className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            {/* Author EN */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {lang === 'bn' ? 'লেখক / প্রতিবেদকের নাম (English)' : 'Author Name (English)'}
              </label>
              <input
                type="text"
                value={formData.author_en}
                onChange={(e) => setFormData({ ...formData, author_en: e.target.value })}
                placeholder="Shahriar Hossain"
                className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
          </div>

          {/* Content BN */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {lang === 'bn' ? 'সংবাদের পূর্ণ বিবরণ (বাংলা) *' : 'Full Article Body (Bangla) *'}
            </label>
            <textarea
              rows="6"
              required
              value={formData.content_bn}
              onChange={(e) => setFormData({ ...formData, content_bn: e.target.value })}
              placeholder="এখানে অনুচ্ছেদ বা HTML ট্যাগ (<p>, <h2> ইত্যাদি) সহ বিস্তারিত বিবরণ লিখুন..."
              className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-bengali"
            />
          </div>

          {/* Content EN */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {lang === 'bn' ? 'সংবাদের পূর্ণ বিবরণ (English)' : 'Full Article Body (English)'}
            </label>
            <textarea
              rows="5"
              value={formData.content_en}
              onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
              placeholder="Detailed news body in English..."
              className="w-full text-sm p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          {/* Featured checkbox */}
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-100">
            <input
              type="checkbox"
              id="featuredCheck"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
            />
            <label htmlFor="featuredCheck" className="text-xs font-bold text-gray-800 cursor-pointer">
              {lang === 'bn' ? 'প্রধান সংবাদ হিসেবে প্রদর্শন করুন (Show as Lead/Hero Story)' : 'Show as Lead/Hero Story'}
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              className="bg-[#e30613] hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-lg text-sm shadow transition-colors"
            >
              {editingId ? (lang === 'bn' ? 'আপডেট করুন' : 'Update Article') : (lang === 'bn' ? 'সংবাদ প্রকাশ করুন' : 'Publish Article')}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setFormData(initialForm) }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2.5 rounded-lg text-sm"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            )}
          </div>
        </form>
      )}

      {/* TAB 2: ARTICLE LIST TABLE */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-sm text-gray-800">
              {lang === 'bn' ? 'প্রকাশিত সকল সংবাদ' : 'All Published News'}
            </h3>
            <button
              onClick={() => { setActiveTab('add'); setEditingId(null); setFormData(initialForm) }}
              className="flex items-center gap-1 text-xs font-bold bg-[#e30613] hover:bg-red-700 text-white px-3 py-1.5 rounded transition-colors"
            >
              <PlusCircle size={14} />
              <span>{lang === 'bn' ? 'নতুন যোগ করুন' : 'Add New'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 font-bengali">
              <thead className="bg-gray-100 text-gray-700 uppercase font-bold border-b">
                <tr>
                  <th className="p-3 w-16">ছবি</th>
                  <th className="p-3">শিরোনাম</th>
                  <th className="p-3 w-28">বিভাগ</th>
                  <th className="p-3 w-28">তারিখ</th>
                  <th className="p-3 w-20 text-center">ভিউ</th>
                  <th className="p-3 w-24 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {articles.map((art) => (
                  <tr key={art.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <img src={art.image} alt="" className="w-12 h-9 object-cover rounded bg-gray-200" />
                    </td>
                    <td className="p-3 font-semibold text-gray-900">
                      <Link to={`/article/${art.slug}`} className="hover:text-red-600 line-clamp-1">
                        {lang === 'bn' ? art.title_bn : art.title_en}
                      </Link>
                    </td>
                    <td className="p-3">
                      <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded font-bold">
                        {lang === 'bn' ? (CATEGORIES_BN[art.category] || art.category) : art.category}
                      </span>
                    </td>
                    <td className="p-3 text-gray-400">
                      {art.date ? new Date(art.date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-3 text-center font-bold text-gray-700">
                      {toBengaliNumber(art.views || 0)}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEditClick(art)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(lang === 'bn' ? 'আপনি কি নিশ্চিতভাবে এই সংবাদটি মুছতে চান?' : 'Delete this article?')) {
                              onDeleteArticle(art.id)
                              showToast(lang === 'bn' ? 'সংবাদটি মুছে ফেলা হয়েছে।' : 'Article deleted.')
                            }
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 size={15} />
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

      {/* TAB 3: BREAKING NEWS TICKER MANAGER */}
      {activeTab === 'breaking' && (
        <div className="space-y-6">
          {/* Add Breaking Form */}
          <form onSubmit={handleAddBreaking} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 border-b pb-2 mb-4 flex items-center gap-2">
              <Flame size={18} className="text-red-600" />
              <span>{lang === 'bn' ? 'নতুন ব্রেকিং নিউজ যোগ করুন' : 'Add New Breaking News'}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {lang === 'bn' ? 'শিরোনাম (বাংলা) *' : 'Headline (Bangla) *'}
                </label>
                <input
                  type="text"
                  required
                  value={breakingBn}
                  onChange={(e) => setBreakingBn(e.target.value)}
                  placeholder="ব্রেকিং নিউজ লিখুন..."
                  className="w-full text-xs p-2.5 border rounded focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {lang === 'bn' ? 'শিরোনাম (English)' : 'Headline (English)'}
                </label>
                <input
                  type="text"
                  value={breakingEn}
                  onChange={(e) => setBreakingEn(e.target.value)}
                  placeholder="Breaking headline in English..."
                  className="w-full text-xs p-2.5 border rounded focus:ring-1 focus:ring-red-500 outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-[#e30613] hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded transition-colors shadow-sm"
            >
              {lang === 'bn' ? 'ব্রেকিং নিউজ প্রকাশ করুন' : 'Publish Breaking'}
            </button>
          </form>

          {/* Breaking list */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h4 className="font-bold text-sm text-gray-800 mb-3">
              {lang === 'bn' ? 'চলমান ব্রেকিং নিউজ তালিকা' : 'Active Breaking Ticker Items'}
            </h4>
            <div className="divide-y divide-gray-100">
              {breakingNews.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                    <span className="font-semibold text-gray-900">{lang === 'bn' ? item.title_bn : item.title_en}</span>
                  </div>
                  <button
                    onClick={() => {
                      onDeleteBreaking(item.id)
                      showToast(lang === 'bn' ? 'ব্রেকিং নিউজ সরানো হয়েছে।' : 'Breaking item removed.')
                    }}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

