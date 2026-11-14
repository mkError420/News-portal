import { Link } from 'react-router-dom'
import { Smartphone, Mail, Phone, MapPin } from 'lucide-react'
import { FacebookIcon, TwitterIcon, YoutubeIcon, InstagramIcon, LinkedinIcon } from './SocialIcons.jsx'
import { NAV_ITEMS, UI_TEXT } from '../utils.js'

export default function Footer({ lang = 'bn' }) {
  const t = UI_TEXT[lang] || UI_TEXT.bn

  return (
    <footer className="bg-[#1a1a1a] text-gray-300 mt-12 border-t-4 border-[#e30613] font-bengali">
      {/* Top Banner: App Download & Newsletter */}
      <div className="bg-[#111] border-b border-gray-800 py-3.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Smartphone size={18} className="text-red-500" />
            <span>
              {lang === 'bn' ? 'প্রথম আলো মোবাইল অ্যাপ ডাউনলোড করুন' : 'Download Prothom Alo Mobile App'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="bg-black/60 hover:bg-black text-white text-xs px-3.5 py-1.5 rounded border border-gray-700 hover:border-gray-500 transition-colors flex items-center gap-2"
            >
              <span>▶</span>
              <div className="text-left">
                <span className="text-[9px] block text-gray-400 uppercase leading-none">GET IT ON</span>
                <span className="font-bold text-[11px] leading-tight">Google Play</span>
              </div>
            </a>
            <a
              href="#"
              className="bg-black/60 hover:bg-black text-white text-xs px-3.5 py-1.5 rounded border border-gray-700 hover:border-gray-500 transition-colors flex items-center gap-2"
            >
              <span></span>
              <div className="text-left">
                <span className="text-[9px] block text-gray-400 uppercase leading-none">Download on the</span>
                <span className="font-bold text-[11px] leading-tight">App Store</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links Columns */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-sm">
        {/* Col 1: Brand & Editorial details */}
        <div className="lg:col-span-2 space-y-4">
          <Link to="/" className="inline-block">
            <span
              className="font-extrabold tracking-tight text-white block"
              style={{ fontSize: '2.2rem', color: '#e30613' }}
            >
              {lang === 'bn' ? 'প্রথম আলো' : 'Prothom Alo'}
            </span>
          </Link>
          <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
            {lang === 'bn'
              ? 'প্রথম আলো বাংলাদেশের সর্বাধিক পঠিত ও জনপ্রিয় বাংলা দৈনিক ও অনলাইন সংবাদমাধ্যম। নিরপেক্ষ ও বস্তুনিষ্ঠ সাংবাদিকতাই আমাদের মূল শক্তি।'
              : 'Prothom Alo is the leading and most trusted news publication in Bangladesh, delivering impartial and accurate news 24/7.'}
          </p>
          <div className="text-xs text-gray-400 space-y-1.5 pt-2 border-t border-gray-800">
            <p className="font-semibold text-gray-200">
              {lang === 'bn' ? 'সম্পাদক ও প্রকাশক: মতিউর রহমান' : 'Editor & Publisher: Matiur Rahman'}
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin size={13} className="text-red-500 flex-shrink-0" />
              <span>{lang === 'bn' ? 'প্রগতি ইনস্যুরেন্স ভবন, ২০-২১ কারওয়ান বাজার, ঢাকা ১২১৫' : 'Pragati Insurance Bhaban, 20-21 Karwan Bazar, Dhaka 1215'}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Phone size={13} className="text-red-500 flex-shrink-0" />
              <span>+৮৮০ ২ ৮১৮০০৭৮-৮১</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Mail size={13} className="text-red-500 flex-shrink-0" />
              <span>info@prothomalo.com</span>
            </p>
          </div>
        </div>

        {/* Col 2: Categories Section */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-red-500 mb-3.5">
            {lang === 'bn' ? 'বিভাগসমূহ' : 'Categories'}
          </h4>
          <ul className="space-y-2 text-xs">
            {NAV_ITEMS.slice(1, 8).map((cat) => (
              <li key={cat.path}>
                <Link to={cat.path} className="hover:text-white transition-colors flex items-center gap-1 text-gray-400">
                  <span className="text-red-600">›</span>
                  <span>{lang === 'bn' ? cat.label_bn : cat.label_en}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: More Categories & Multimedia */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-red-500 mb-3.5">
            {lang === 'bn' ? 'অন্যান্য' : 'More Features'}
          </h4>
          <ul className="space-y-2 text-xs">
            {NAV_ITEMS.slice(8).map((cat) => (
              <li key={cat.path}>
                <Link to={cat.path} className="hover:text-white transition-colors flex items-center gap-1 text-gray-400">
                  <span className="text-red-600">›</span>
                  <span>{lang === 'bn' ? cat.label_bn : cat.label_en}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link to="/admin" className="text-red-400 hover:text-white transition-colors flex items-center gap-1 font-semibold">
                <span>⚡</span>
                <span>{lang === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ড' : 'Admin CMS Portal'}</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Corporate & Social */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-red-500 mb-3.5">
            {lang === 'bn' ? 'নীতিমালা ও যোগাযোগ' : 'Policies & Contact'}
          </h4>
          <ul className="space-y-2 text-xs mb-5">
            <li>
              <Link to="/about" className="hover:text-white transition-colors text-gray-400">
                {lang === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-white transition-colors text-gray-400">
                {lang === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-white transition-colors text-gray-400">
                {lang === 'bn' ? 'ব্যবহারের শর্তাবলী' : 'Terms of Use'}
              </Link>
            </li>
            <li>
              <Link to="/advertise" className="hover:text-white transition-colors text-gray-400">
                {lang === 'bn' ? 'বিজ্ঞাপন দিন' : 'Advertise with Us'}
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition-colors text-gray-400">
                {lang === 'bn' ? 'যোগাযোগ' : 'Contact Us'}
              </Link>
            </li>
          </ul>

          <h5 className="text-[11px] font-bold text-gray-300 uppercase mb-2">
            {lang === 'bn' ? 'সামাজিক যোগাযোগ' : 'Follow Us'}
          </h5>
          <div className="flex items-center gap-2">
            {[
              { icon: <FacebookIcon size={14} />, bg: '#1877f2', label: 'Facebook' },
              { icon: <TwitterIcon size={14} />, bg: '#1da1f2', label: 'Twitter' },
              { icon: <YoutubeIcon size={14} />, bg: '#ff0000', label: 'YouTube' },
              { icon: <InstagramIcon size={14} />, bg: '#e1306c', label: 'Instagram' },
              { icon: <LinkedinIcon size={14} />, bg: '#0a66c2', label: 'LinkedIn' },
            ].map(({ icon, bg, label }) => (
              <a
                key={label}
                href="#"
                title={label}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white hover:opacity-85 transition-opacity"
                style={{ backgroundColor: bg }}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-gray-800/80 bg-black py-4 px-4 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {lang === 'bn'
              ? 'স্বত্ব © ২০২৬ প্রথম আলো | সর্বস্বত্ব সংরক্ষিত।'
              : 'Copyright © 2026 Prothom Alo | All rights reserved.'}
          </span>
          <span className="text-[11px] text-gray-600">
            {lang === 'bn' ? 'ডিজিটাল রূপান্তর ও অনলাইন সংস্করণ' : 'Digital Platform & Online Edition'}
          </span>
        </div>
      </div>
    </footer>
  )
}
