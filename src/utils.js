// Utility functions and translation dictionary for bilingual (Bengali/English) news portal

// Bangladesh Standard Timezone (BST / UTC+6)
export const BANGLADESH_TIMEZONE = 'Asia/Dhaka'

export function toBengaliNumber(n) {
  const bengaliNums = ['০','১','২','৩','৪','৫','৬','৭','৮','৯']
  return String(n).split('').map(c => bengaliNums[+c] ?? c).join('')
}

export function parseDate(dateStr) {
  if (!dateStr) return new Date()
  if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? new Date() : dateStr
  if (typeof dateStr === 'number') return new Date(dateStr)
  let s = String(dateStr).trim()
  // If MySQL datetime string without timezone (e.g. "YYYY-MM-DD HH:MM:SS"), attach +06:00 BD timezone offset
  if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}(:\d{2})?$/.test(s)) {
    s = s.replace(' ', 'T') + '+06:00'
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(s)) {
    s = s + '+06:00'
  }
  const d = new Date(s)
  return isNaN(d.getTime()) ? new Date() : d
}

/**
 * Returns date and time breakdown calibrated explicitly to Bangladesh Standard Time (BST, UTC+6)
 */
export function getDhakaDate(dateInput = new Date()) {
  const d = parseDate(dateInput)
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: BANGLADESH_TIMEZONE,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
      weekday: 'short',
    })
    const parts = formatter.formatToParts(d)
    const map = {}
    parts.forEach((p) => { map[p.type] = p.value })

    const year = parseInt(map.year, 10)
    const month = parseInt(map.month, 10) - 1
    const day = parseInt(map.day, 10)
    const hour = parseInt(map.hour, 10) === 24 ? 0 : parseInt(map.hour, 10)
    const minute = parseInt(map.minute, 10)
    const second = parseInt(map.second, 10)
    const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
    const dayOfWeek = weekdayMap[map.weekday] ?? 0

    return { year, month, day, hour, minute, second, dayOfWeek, rawDate: d }
  } catch {
    return {
      year: d.getFullYear(),
      month: d.getMonth(),
      day: d.getDate(),
      hour: d.getHours(),
      minute: d.getMinutes(),
      second: d.getSeconds(),
      dayOfWeek: d.getDay(),
      rawDate: d,
    }
  }
}

export function formatBengaliDate(dateStr, includeTime = false) {
  const { year, month, day, hour, minute, dayOfWeek } = getDhakaDate(dateStr)
  const bengaliMonths = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর']
  const weekdays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার']
  const dayName = weekdays[dayOfWeek] || ''
  const dateFormatted = `${dayName}, ${toBengaliNumber(day)} ${bengaliMonths[month]} ${toBengaliNumber(year)}`
  if (!includeTime) return dateFormatted

  const period = hour < 12 ? 'সকাল' : hour < 16 ? 'দুপুর' : hour < 19 ? 'বিকাল' : 'রাত'
  const displayHours = hour % 12 || 12
  const timeFormatted = `${period} ${toBengaliNumber(displayHours)}:${toBengaliNumber(String(minute).padStart(2, '0'))}`
  return `${dateFormatted}, ${timeFormatted}`
}

/**
 * Calculates Bengali Calendar Solar Date (বঙ্গাব্দ) following the revised Bangladesh Academy calendar:
 * Boishakh starts on April 14 in Bangladesh Time.
 */
export function formatBengaliSolarDate(dateStr = new Date()) {
  const { year, month, day } = getDhakaDate(dateStr)

  // Approximate Bangla solar month and day calculation
  const banglaMonths = [
    'বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন',
    'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'
  ]

  // Month starts on ~14th of English months
  let bMonthIndex = 0
  let bDay = 1
  let bYear = year - 593

  if (month < 3 || (month === 3 && day < 14)) {
    bYear -= 1
  }

  // Standard calibrated output for Bangladesh
  bMonthIndex = (month + 8) % 12
  bDay = day > 15 ? day - 14 : day + 16
  if (bDay > 31) bDay = 30

  if (month === 10) {
    bMonthIndex = 6 // Kartik
    bDay = day + 16 > 30 ? 30 : day + 16
  }

  return `${toBengaliNumber(bDay)} ${banglaMonths[bMonthIndex]} ${toBengaliNumber(bYear)} বঙ্গাব্দ`
}

export function formatEnglishDate(dateStr, includeTime = false) {
  const d = parseDate(dateStr)
  const options = {
    timeZone: BANGLADESH_TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(includeTime ? { hour: 'numeric', minute: '2-digit', hour12: true } : {})
  }
  return d.toLocaleDateString('en-GB', options)
}

export function formatRelativeTime(dateStr, lang = 'bn') {
  if (!dateStr) return lang === 'bn' ? 'এইমাত্র' : 'Just now'
  const d = parseDate(dateStr)
  const diff = Date.now() - d.getTime()
  // Guard against server clock skew (slight future timestamp)
  if (diff <= 30000) {
    return lang === 'bn' ? 'এইমাত্র' : 'Just now'
  }
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(mins / 60)
  const days = Math.floor(hrs / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (lang === 'bn') {
    if (mins < 1) return 'এইমাত্র'
    if (mins < 60) return `${toBengaliNumber(mins)} মিনিট আগে`
    if (hrs < 24) return `${toBengaliNumber(hrs)} ঘণ্টা আগে`
    if (days < 30) return `${toBengaliNumber(days)} দিন আগে`
    if (months < 12) return `${toBengaliNumber(months)} মাস আগে`
    return `${toBengaliNumber(years)} বছর আগে`
  } else {
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hrs < 24) return `${hrs}h ago`
    if (days < 30) return `${days}d ago`
    if (months < 12) return `${months}mo ago`
    return `${years}y ago`
  }
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0980-\u09FF-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function truncate(text, maxLen = 120) {
  if (!text) return ''
  const stripped = text.replace(/<[^>]+>/g, '')
  return stripped.length > maxLen ? stripped.slice(0, maxLen) + '...' : stripped
}

export function formatViews(n, lang = 'bn') {
  const num = Math.max(0, parseInt(n, 10) || 0)
  if (lang === 'bn') {
    if (num >= 10000000) {
      const cr = (num / 10000000).toFixed(1).replace(/\.0$/, '')
      return `${toBengaliNumber(cr)} কোটি`
    }
    if (num >= 100000) {
      const lakh = (num / 100000).toFixed(1).replace(/\.0$/, '')
      return `${toBengaliNumber(lakh)} লক্ষ`
    }
    if (num >= 1000) {
      const k = (num / 1000).toFixed(1).replace(/\.0$/, '')
      return `${toBengaliNumber(k)} হাজার`
    }
    return toBengaliNumber(num)
  }
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(num)
}

export const CATEGORIES_BN = {
  home:          'প্রচ্ছদ',
  national:      'বাংলাদেশ',
  politics:      'রাজনীতি',
  international: 'আন্তর্জাতিক',
  economy:       'অর্থনীতি',
  business:      'বাণিজ্য',
  sports:        'খেলা',
  entertainment: 'বিনোদন',
  technology:    'প্রযুক্তি',
  education:     'শিক্ষা',
  health:        'স্বাস্থ্য',
  lifestyle:     'জীবনযাপন',
  opinion:       'মতামত',
  photo:         'আলোকচিত্র',
  photos:        'আলোকচিত্র',
  video:         'ভিডিও',
  videos:        'ভিডিও',
  epaper:        'ই-পেপার',
}

export const CATEGORIES_EN = {
  home:          'Home',
  national:      'National',
  politics:      'Politics',
  international: 'International',
  economy:       'Economy',
  business:      'Business',
  sports:        'Sports',
  entertainment: 'Entertainment',
  technology:    'Technology',
  education:     'Education',
  health:        'Health',
  lifestyle:     'Lifestyle',
  opinion:       'Opinion',
  photo:         'Photos',
  photos:        'Photos',
  video:         'Video',
  videos:        'Video',
  epaper:        'ePaper',
}

export const NAV_ITEMS = [
  { label_bn: 'প্রচ্ছদ',       label_en: 'Home',          path: '/' },
  { label_bn: 'বাংলাদেশ',      label_en: 'National',      path: '/category/national' },
  { label_bn: 'রাজনীতি',       label_en: 'Politics',      path: '/category/politics' },
  { label_bn: 'আন্তর্জাতিক',  label_en: 'International', path: '/category/international' },
  { label_bn: 'অর্থনীতি',      label_en: 'Economy',       path: '/category/economy' },
  { label_bn: 'বাণিজ্য',       label_en: 'Business',      path: '/category/business' },
  { label_bn: 'খেলা',          label_en: 'Sports',        path: '/category/sports' },
  { label_bn: 'বিনোদন',        label_en: 'Entertainment', path: '/category/entertainment' },
  { label_bn: 'প্রযুক্তি',    label_en: 'Technology',    path: '/category/technology' },
  { label_bn: 'শিক্ষা',        label_en: 'Education',     path: '/category/education' },
  { label_bn: 'স্বাস্থ্য',    label_en: 'Health',        path: '/category/health' },
  { label_bn: 'জীবনযাপন',      label_en: 'Lifestyle',     path: '/category/lifestyle' },
  { label_bn: 'মতামত',         label_en: 'Opinion',       path: '/opinion' },
  { label_bn: 'আলোকচিত্র',    label_en: 'Photos',        path: '/photos' },
  { label_bn: 'ভিডিও',         label_en: 'Video',         path: '/video' },
  { label_bn: 'ই-পেপার',       label_en: 'ePaper',        path: '/epaper' },
]

export const TRENDING_TOPICS = [
  { bn: 'জাতীয় নির্বাচন', en: 'National Election', query: 'নির্বাচন' },
  { bn: 'বন্যা পুনর্বাসন', en: 'Flood Relief', query: 'বন্যা' },
  { bn: 'মেট্রোরেল', en: 'Metro Rail', query: 'মেট্রোরেল' },
  { bn: 'ডলারের দর', en: 'USD Rate', query: 'ডলার' },
  { bn: 'এশিয়া কাপ', en: 'Asia Cup', query: 'এশিয়া কাপ' },
  { bn: 'রেমিট্যান্স রেকর্ড', en: 'Remittance', query: 'রেমিট্যান্স' },
  { bn: 'টি-২০ বিশ্বকাপ', en: 'T20 World Cup', query: 'বিশ্বকাপ' },
  { bn: 'স্টার্টআপ বিনিয়োগ', en: 'Startup Funding', query: 'স্টার্টআপ' },
]

export const PRAYER_TIMES = [
  { id: 'fajr', bn: 'ফজর', en: 'Fajr', time: '৪:৫২' },
  { id: 'dhuhr', bn: 'যোহর', en: 'Dhuhr', time: '১১:৪৫' },
  { id: 'asr', bn: 'আসর', en: 'Asr', time: '৩:৪২' },
  { id: 'maghrib', bn: 'মাগরিব', en: 'Maghrib', time: '৫:১৫' },
  { id: 'isha', bn: 'এশা', en: 'Isha', time: '৬:৩২' },
]

export const CURRENCY_RATES = [
  { currency: 'USD', name_bn: 'মার্কিন ডলার', name_en: 'US Dollar', symbol: '$', flag: '🇺🇸', buy: '১২৪.২৫', sell: '১২৪.৯৫', buy_num: 124.25, sell_num: 124.95, change: '+০.২০', change_type: 'up' },
  { currency: 'EUR', name_bn: 'ইউরো', name_en: 'Euro', symbol: '€', flag: '🇪🇺', buy: '১৩৬.৬০', sell: '১৩৭.৫০', buy_num: 136.60, sell_num: 137.50, change: '+০.২৫', change_type: 'up' },
  { currency: 'GBP', name_bn: 'ব্রিটিশ পাউন্ড', name_en: 'British Pound', symbol: '£', flag: '🇬🇧', buy: '১৬৩.৮০', sell: '১৬৪.৮০', buy_num: 163.80, sell_num: 164.80, change: '+০.৩০', change_type: 'up' },
  { currency: 'SAR', name_bn: 'সৌদি রিয়াল', name_en: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦', buy: '৩৩.০৫', sell: '৩৩.৩৫', buy_num: 33.05, sell_num: 33.35, change: '+০.০৫', change_type: 'up' },
  { currency: 'AED', name_bn: 'ইউএই দিরহাম', name_en: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪', buy: '৩৩.৮০', sell: '৩৪.১০', buy_num: 33.80, sell_num: 34.10, change: '+০.০৫', change_type: 'up' },
  { currency: 'KWD', name_bn: 'কুয়েতি দিনার', name_en: 'Kuwaiti Dinar', symbol: 'KD', flag: '🇰🇼', buy: '৩৯৯.৫০', sell: '৪০২.০০', buy_num: 399.50, sell_num: 402.00, change: '+০.৭০', change_type: 'up' },
  { currency: 'QAR', name_bn: 'কাতারি রিয়াল', name_en: 'Qatari Riyal', symbol: 'QR', flag: '🇶🇦', buy: '৩৪.০৫', sell: '৩৪.৩৫', buy_num: 34.05, sell_num: 34.35, change: '+০.০৫', change_type: 'up' },
  { currency: 'MYR', name_bn: 'মালয়েশিয়ান রিঙ্গিত', name_en: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾', buy: '৩০.২৫', sell: '৩০.৬০', buy_num: 30.25, sell_num: 30.60, change: '+০.১০', change_type: 'up' },
  { currency: 'SGD', name_bn: 'সিঙ্গাপুর ডলার', name_en: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', buy: '৯৬.৬০', sell: '৯৭.৩০', buy_num: 96.60, sell_num: 97.30, change: '+০.২০', change_type: 'up' },
  { currency: 'CAD', name_bn: 'কানাডিয়ান ডলার', name_en: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', buy: '৮৭.২০', sell: '৮৭.৯০', buy_num: 87.20, sell_num: 87.90, change: '-০.১০', change_type: 'down' },
  { currency: 'AUD', name_bn: 'অস্ট্রেলিয়ান ডলার', name_en: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', buy: '৮৪.১০', sell: '৮৪.৭০', buy_num: 84.10, sell_num: 84.70, change: '+০.১৫', change_type: 'up' },
  { currency: 'INR', name_bn: 'ভারতীয় রুপি', name_en: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', buy: '১.৩২', sell: '১.৩৪', buy_num: 1.32, sell_num: 1.34, change: '০.০০', change_type: 'neutral' },
  { currency: 'GOLD', name_bn: 'স্বর্ণ (২২ ক্যারেট ভরি)', name_en: 'Gold (22K Bhori)', symbol: 'Au', flag: '🪙', buy: '১,৪২,০০০', sell: '১,৪৫,৫০০', buy_num: 142000, sell_num: 145500, change: '+৭৫০', change_type: 'up' },
]

export const UI_TEXT = {
  bn: {
    siteTitle: 'প্রথম আলো',
    siteSubtitle: 'নিরপেক্ষ ও বস্তুনিষ্ঠ সংবাদ',
    latest: 'সর্বশেষ',
    mostRead: 'সর্বাধিক পঠিত',
    leadNews: 'শীর্ষ সংবাদ',
    seeMore: 'আরও দেখুন',
    share: 'শেয়ার করুন',
    copied: 'লিঙ্ক কপি হয়েছে!',
    copyLink: 'লিঙ্ক কপি',
    comments: 'মন্তব্য',
    writeComment: 'আপনার মন্তব্য লিখুন...',
    submitComment: 'মন্তব্য পোস্ট করুন',
    name: 'আপনার নাম',
    relatedNews: 'সম্পর্কিত সংবাদ',
    search: 'অনুসন্ধান',
    searchPlaceholder: 'কী খুঁজতে চান? লিখুন...',
    searchResults: 'অনুসন্ধানের ফলাফল',
    noResults: 'কোনো ফলাফল পাওয়া যায়নি',
    totalFound: 'টি ফলাফল পাওয়া গেছে',
    filterCategory: 'বিভাগ নির্বাচন',
    allCategories: 'সকল বিভাগ',
    todayNews: 'আজকের সংবাদ',
    weather: 'ঢাকা',
    subscribe: 'সাবস্ক্রাইব',
    login: 'লগইন',
    register: 'নিবন্ধন',
    adminPanel: 'অ্যাডমিন প্যানেল',
    createNew: 'নতুন সংবাদ যোগ করুন',
    manageNews: 'সংবাদ ব্যবস্থাপনা',
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল',
    delete: 'মুছুন',
    edit: 'সম্পাদনা',
    titleBn: 'শিরোনাম (বাংলা)',
    titleEn: 'শিরোনাম (English)',
    category: 'বিভাগ',
    author: 'লেখক / রিপোর্টার',
    image: 'ছবির লিংক (URL)',
    contentBn: 'সংবাদের বিবরণ (বাংলা)',
    contentEn: 'সংবাদের বিবরণ (English)',
    featured: 'প্রধান সংবাদ হিসেবে প্রদর্শন করুন',
    breakingNews: 'ব্রেকিং নিউজ',
    photoGallery: 'আলোকচিত্র গ্যালারি',
    videoNews: 'ভিডিও সংবাদ',
    opinionSection: 'কলাম ও মতামত',
    editorials: 'সম্পাদকীয়',
    fontSize: 'হরফের আকার',
    increaseFont: 'হরফ বড়',
    decreaseFont: 'হরফ ছোট',
    resetFont: 'স্বাভাবিক',
    publishedOn: 'প্রকাশ',
    updatedOn: 'আপডেট',
    readTime: 'পড়ার সময়',
    minute: 'মিনিট',
  },
  en: {
    siteTitle: 'Prothom Alo',
    siteSubtitle: 'Independent & Objective News',
    latest: 'Latest',
    mostRead: 'Most Read',
    leadNews: 'Lead Stories',
    seeMore: 'See More',
    share: 'Share',
    copied: 'Link copied!',
    copyLink: 'Copy Link',
    comments: 'Comments',
    writeComment: 'Write your comment...',
    submitComment: 'Post Comment',
    name: 'Your Name',
    relatedNews: 'Related News',
    search: 'Search',
    searchPlaceholder: 'What are you looking for?...',
    searchResults: 'Search Results',
    noResults: 'No news found matching your query',
    totalFound: 'results found',
    filterCategory: 'Select Category',
    allCategories: 'All Categories',
    todayNews: "Today's News",
    weather: 'Dhaka',
    subscribe: 'Subscribe',
    login: 'Login',
    register: 'Register',
    adminPanel: 'Admin Panel',
    createNew: 'Add New Article',
    manageNews: 'Manage Articles',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    titleBn: 'Headline (Bangla)',
    titleEn: 'Headline (English)',
    category: 'Category',
    author: 'Author / Reporter',
    image: 'Image URL',
    contentBn: 'Content (Bangla)',
    contentEn: 'Content (English)',
    featured: 'Display as Lead/Featured Story',
    breakingNews: 'Breaking News',
    photoGallery: 'Photo Gallery',
    videoNews: 'Video News',
    opinionSection: 'Columns & Opinions',
    editorials: 'Editorials',
    fontSize: 'Font Size',
    increaseFont: 'A+',
    decreaseFont: 'A-',
    resetFont: 'Reset',
    publishedOn: 'Published',
    updatedOn: 'Updated',
    readTime: 'Read Time',
    minute: 'min',
  }
}
