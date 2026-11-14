import { Link, useLocation } from 'react-router-dom'
import { Home, ChevronRight, ShieldCheck, FileText, Mail, Phone, MapPin, Send, HelpCircle } from 'lucide-react'

export default function StaticPage({ lang = 'bn', settings = null }) {
  const location = useLocation()
  const path = location.pathname.replace('/', '')

  const siteName = (lang === 'bn' ? settings?.site_name_bn : settings?.site_name_en) ||
    (lang === 'bn' ? 'প্রথম আলো' : 'Prothom Alo')
  const address = (lang === 'bn' ? settings?.address_bn : settings?.address_en) ||
    (lang === 'bn' ? 'প্রগতি ইনস্যুরেন্স ভবন, ২০-২১ কারওয়ান বাজার, ঢাকা ১২১৫, বাংলাদেশ।' : 'Pragati Insurance Bhaban, 20-21 Karwan Bazar, Dhaka 1215, Bangladesh.')
  const phone = settings?.phone || '+৮৮০ ২ ৮১৮০০৭৮-৮১'
  const email = settings?.email || 'info@prothomalo.com'

  const titles = {
    about: { bn: 'আমাদের সম্পর্কে', en: 'About Us' },
    privacy: { bn: 'গোপনীয়তা নীতি', en: 'Privacy Policy' },
    terms: { bn: 'ব্যবহারের শর্তাবলী', en: 'Terms of Use' },
    contact: { bn: 'যোগাযোগ', en: 'Contact Us' },
    advertise: { bn: 'বিজ্ঞাপন দিন', en: 'Advertise with Us' },
  }

  const currentTitle = titles[path] || { bn: 'তথ্য', en: 'Information' }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-bengali">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 pb-2 border-b border-gray-200">
        <Link to="/" className="hover:text-red-600 flex items-center gap-1">
          <Home size={13} />
          <span>{lang === 'bn' ? 'প্রচ্ছদ' : 'Home'}</span>
        </Link>
        <ChevronRight size={12} className="text-gray-400" />
        <span className="font-bold text-[#e30613]">
          {lang === 'bn' ? currentTitle.bn : currentTitle.en}
        </span>
      </nav>

      <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-10 shadow-sm">
        <h1 className="text-3xl font-extrabold text-[#1a1a1a] pb-4 border-b-2 border-red-600 mb-6">
          {lang === 'bn' ? currentTitle.bn : currentTitle.en}
        </h1>

        {/* Content for Contact */}
        {path === 'contact' && (
          <div className="space-y-6 text-sm text-gray-700">
            <p className="leading-relaxed">
              {lang === 'bn'
                ? `${siteName}-এর যে কোনো সংবাদ, বিজ্ঞাপন বা প্রযুক্তিগত সমস্যার জন্য নিচের ঠিকানায় যোগাযোগ করতে পারেন।`
                : `For any news queries, advertisement, or technical assistance regarding ${siteName}, reach out via the contacts below.`}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <MapPin size={16} className="text-red-600" />
                  <span>{lang === 'bn' ? 'প্রধান কার্যালয়' : 'Head Office'}</span>
                </h3>
                <p className="text-xs text-gray-600">
                  {address}
                </p>
                <p className="text-xs text-gray-600 flex items-center gap-1.5">
                  <Phone size={13} className="text-red-600" /> {phone}
                </p>
                <p className="text-xs text-gray-600 flex items-center gap-1.5">
                  <Mail size={13} className="text-red-600" /> {email}
                </p>
              </div>

              {/* Message box */}
              <form onSubmit={(e) => { e.preventDefault(); alert(lang === 'bn' ? 'আপনার বার্তা সফলভাবে পাঠানো হয়েছে!' : 'Your message has been sent successfully!') }} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder={lang === 'bn' ? 'আপনার নাম' : 'Your Name'}
                  className="w-full text-xs p-2.5 border rounded focus:ring-1 focus:ring-red-500 outline-none"
                />
                <input
                  type="email"
                  required
                  placeholder={lang === 'bn' ? 'আপনার ইমেইল' : 'Your Email'}
                  className="w-full text-xs p-2.5 border rounded focus:ring-1 focus:ring-red-500 outline-none"
                />
                <textarea
                  rows="3"
                  required
                  placeholder={lang === 'bn' ? 'আপনার বার্তা লিখুন...' : 'Your Message...'}
                  className="w-full text-xs p-2.5 border rounded focus:ring-1 focus:ring-red-500 outline-none"
                />
                <button
                  type="submit"
                  className="w-full bg-[#e30613] hover:bg-red-700 text-white font-bold py-2 rounded text-xs transition-colors"
                >
                  {lang === 'bn' ? 'বার্তা পাঠান' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Content for Advertise */}
        {path === 'advertise' && (
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              {lang === 'bn'
                ? `${siteName} বাংলাদেশের সর্বাধিক জনপ্রিয় অনলাইন ও প্রিন্ট মিডিয়া। আপনার পণ্য ও সেবার প্রচারে আমাদের বিজ্ঞাপন সেবা গ্রহণ করুন।`
                : `${siteName} is the largest and most influential media platform in Bangladesh. Promote your products and services with our trusted advertising network.`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              <div className="p-4 border rounded-lg bg-gray-50 text-center">
                <h4 className="font-bold text-gray-900 mb-1">লিডারবোর্ড ব্যানার</h4>
                <p className="text-xs text-gray-500">৭২৮ × ৯০ পিক্সেল</p>
                <span className="inline-block mt-2 font-bold text-red-600 text-xs">শীর্ষস্থান প্রদর্শন</span>
              </div>
              <div className="p-4 border rounded-lg bg-gray-50 text-center">
                <h4 className="font-bold text-gray-900 mb-1">মিডিয়াম রেক্টেঙ্গেল</h4>
                <p className="text-xs text-gray-500">৩০০ × ২৫০ পিক্সেল</p>
                <span className="inline-block mt-2 font-bold text-red-600 text-xs">সাইডবার ডিসপ্লে</span>
              </div>
              <div className="p-4 border rounded-lg bg-gray-50 text-center">
                <h4 className="font-bold text-gray-900 mb-1">হাফ পেজ ব্যানার</h4>
                <p className="text-xs text-gray-500">৩০০ × ৬০০ পিক্সেল</p>
                <span className="inline-block mt-2 font-bold text-red-600 text-xs">প্রিমিয়াম ভিউ</span>
              </div>
            </div>
            <p className="text-xs text-gray-600">
              {lang === 'bn'
                ? `বিজ্ঞাপনের বিস্তারিত জানতে ইমেইল করুন: ${settings?.ad_email || 'ads@prothomalo.com'} অথবা কল করুন: ${phone}`
                : `For ad rates and packages, email ${settings?.ad_email || 'ads@prothomalo.com'} or call ${phone}`}
            </p>
          </div>
        )}

        {/* Content for About / Privacy / Terms */}
        {path !== 'contact' && path !== 'advertise' && (
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              {lang === 'bn'
                ? (settings?.about_bn || `${siteName} নিরপেক্ষ, বস্তুনিষ্ঠ ও সাহসী সাংবাদিকতার মাধ্যমে দেশের মানুষের ভালোবাসা ও আস্থা অর্জন করেছে।`)
                : (settings?.about_en || `Through impartial, courageous, and credible journalism, ${siteName} has earned the deepest trust of readers.`)}
            </p>
            <h3 className="text-base font-bold text-gray-900 pt-3">
              {lang === 'bn' ? 'আমাদের লক্ষ্য ও উদ্দেশ্য' : 'Our Mission & Values'}
            </h3>
            <p>
              {lang === 'bn'
                ? 'সত্য প্রকাশে নির্ভীক থাকা, নাগরিকের অধিকার সুরক্ষা করা এবং দেশের সার্বিক অগ্রগতিতে ইতিবাচক ভূমিকা পালন করা।'
                : 'To fearlessly report the truth, defend civic rights, and champion national progress through independent journalism.'}
            </p>
            <h3 className="text-base font-bold text-gray-900 pt-3">
              {lang === 'bn' ? 'গোপনীয়তা ও নিরাপত্তা' : 'Data Privacy & Security'}
            </h3>
            <p>
              {lang === 'bn'
                ? 'আমরা আমাদের পাঠকদের তথ্যের গোপনীয়তা রক্ষা করতে সর্বাধুনিক নিরাপত্তা ব্যবস্থা অনুসরণ করি।'
                : 'We follow stringent security standards to safeguard reader information and browsing privacy.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

