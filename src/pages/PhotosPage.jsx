import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Home, ChevronRight, Camera, X, Download, Share2 } from 'lucide-react'
import SEO from '../components/SEO.jsx'
import { formatBengaliDate, formatEnglishDate } from '../utils.js'

export default function PhotosPage({ photos = [], settings = null, lang = 'bn' }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  const siteName = (lang === 'bn' ? settings?.site_name_bn : settings?.site_name_en) ||
    (lang === 'bn' ? 'আলোর পথে' : 'Prothom kalo')

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 font-bengali">
      <SEO
        title={lang === 'bn' ? 'আলোকচিত্র গ্যালারি' : 'Photo Gallery'}
        description={lang === 'bn' ? `${siteName}-এর ফটোসাংবাদিকদের ক্যামেরায় ধারণ করা সেরা মুহূর্তগুলো` : 'Bangladesh and world news in pictures'}
        lang={lang}
        settings={settings}
      />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 pb-2 border-b border-gray-200">
        <Link to="/" className="hover:text-red-600 flex items-center gap-1">
          <Home size={13} />
          <span>{lang === 'bn' ? 'প্রচ্ছদ' : 'Home'}</span>
        </Link>
        <ChevronRight size={12} className="text-gray-400" />
        <span className="font-bold text-[#e30613]">{lang === 'bn' ? 'আলোকচিত্র গ্যালারি' : 'Photo Gallery'}</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-[#1a3a5c] text-white p-6 rounded-lg shadow mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2">
            <Camera size={26} className="text-red-400" />
            <span>{lang === 'bn' ? 'ছবিতে বাংলাদেশ ও বিশ্ব' : 'Bangladesh & The World in Pictures'}</span>
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            {lang === 'bn'
              ? `${siteName}-এর ফটোসাংবাদিকদের ক্যামেরায় ধারণ করা সেরা মুহূর্তগুলো`
              : `Memorable moments captured by ${siteName} photojournalists`}
          </p>
        </div>
      </div>

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center my-8 shadow-xs">
          <Camera size={36} className="mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-bold text-gray-800">
            {lang === 'bn' ? 'ডাটাবেজে বর্তমানে কোনো আলোকচিত্র পাওয়া যায়নি।' : 'No photos found in database.'}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {lang === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড থেকে নতুন ছবি আপলোড করুন।' : 'Upload photos from the admin dashboard.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((ph) => (
            <div
              key={ph.id}
              onClick={() => setSelectedPhoto(ph)}
              className="bg-white rounded overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                <img
                  src={ph.image}
                  alt={ph.title_bn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-2.5 right-2.5 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={14} />
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-gray-900 group-hover:text-red-600 transition-colors leading-snug mb-1.5">
                    {lang === 'bn' ? ph.title_bn : ph.title_en}
                  </h3>
                  {ph.caption_bn && (
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {lang === 'bn' ? ph.caption_bn : ph.caption_en}
                    </p>
                  )}
                </div>
                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                  <span>{lang === 'bn' ? ph.credit_bn : ph.credit_en}</span>
                  <span>{lang === 'bn' ? formatBengaliDate(ph.date) : formatEnglishDate(ph.date)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="max-w-5xl w-full bg-[#111] text-white rounded-xl overflow-hidden shadow-2xl border border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-black flex items-center justify-center max-h-[75vh]">
              <img
                src={selectedPhoto.image}
                alt={selectedPhoto.title_bn}
                className="max-h-[75vh] w-auto object-contain mx-auto"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 bg-[#181818] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">
                  {lang === 'bn' ? selectedPhoto.title_bn : selectedPhoto.title_en}
                </h2>
                {selectedPhoto.caption_bn && (
                  <p className="text-xs text-gray-400 mb-1 max-w-2xl leading-relaxed">
                    {lang === 'bn' ? selectedPhoto.caption_bn : selectedPhoto.caption_en}
                  </p>
                )}
                <span className="text-xs text-red-400 font-semibold">
                  {lang === 'bn' ? selectedPhoto.credit_bn : selectedPhoto.credit_en}
                </span>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs font-semibold"
              >
                {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

