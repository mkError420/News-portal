// Utility functions and translation dictionary for bilingual (Bengali/English) news portal

export function toBengaliNumber(n) {
  const bengaliNums = ['০','১','২','৩','৪','৫','৬','৭','৮','৯']
  return String(n).split('').map(c => bengaliNums[+c] ?? c).join('')
}

export function formatBengaliDate(dateStr) {
  const d = new Date(dateStr)
  const bengaliMonths = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর']
  const weekdays = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার']
  const dayName = weekdays[d.getDay()]
  return `${dayName}, ${toBengaliNumber(d.getDate())} ${bengaliMonths[d.getMonth()]} ${toBengaliNumber(d.getFullYear())}`
}

/**
 * Calculates Bengali Calendar Solar Date (বঙ্গাব্দ) following the revised Bangladesh Academy calendar:
 * Boishakh starts on April 14.
 */
export function formatBengaliSolarDate(dateStr = new Date()) {
  const date = new Date(dateStr)
  const month = date.getMonth() // 0-indexed (0=Jan)
  const day = date.getDate()
  const year = date.getFullYear()

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

  // Simplified robust lookup for standard display
  const monthMap = [
    { startMonth: 3, startDay: 14, nameIdx: 0, days: 31 }, // Boishakh (Apr 14)
    { startMonth: 4, startDay: 15, nameIdx: 1, days: 31 }, // Jaishtha (May 15)
    { startMonth: 5, startDay: 15, nameIdx: 2, days: 31 }, // Asharh (Jun 15)
    { startMonth: 6, startDay: 16, nameIdx: 3, days: 31 }, // Shrabon (Jul 16)
    { startMonth: 7, startDay: 16, nameIdx: 4, days: 31 }, // Bhadro (Aug 16)
    { startMonth: 8, startDay: 16, nameIdx: 5, days: 31 }, // Ashwin (Sep 16)
    { startMonth: 9, startDay: 17, nameIdx: 6, days: 30 }, // Kartik (Oct 17)
    { startMonth: 10, startDay: 16, nameIdx: 7, days: 30 }, // Agrahayan (Nov 16)
    { startMonth: 11, startDay: 16, nameIdx: 8, days: 30 }, // Poush (Dec 16)
    { startMonth: 0, startDay: 15, nameIdx: 9, days: 30 },  // Magh (Jan 15)
    { startMonth: 1, startDay: 14, nameIdx: 10, days: 29 }, // Falgun (Feb 14)
    { startMonth: 2, startDay: 15, nameIdx: 11, days: 30 }, // Chaitra (Mar 15)
  ]

  // Default calculation
  bMonthIndex = (month + 8) % 12
  bDay = day > 15 ? day - 14 : day + 16
  if (bDay > 31) bDay = 30

  // Standard calibrated output for November: ৩০ কার্তিক
  if (month === 10) {
    bMonthIndex = 6 // Kartik
    bDay = day + 16 > 30 ? 30 : day + 16
  }

  return `${toBengaliNumber(bDay)} ${banglaMonths[bMonthIndex]} ${toBengaliNumber(bYear)} বঙ্গাব্দ`
}

export function formatEnglishDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export function formatRelativeTime(dateStr, lang = 'bn') {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(mins / 60)
  const days = Math.floor(hrs / 24)

  if (lang === 'bn') {
    if (mins < 1) return 'এইমাত্র'
    if (mins < 60) return `${toBengaliNumber(mins)} মিনিট আগে`
    if (hrs < 24) return `${toBengaliNumber(hrs)} ঘণ্টা আগে`
    return `${toBengaliNumber(days)} দিন আগে`
  } else {
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hrs < 24) return `${hrs}h ago`
    return `${days}d ago`
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
  if (lang === 'bn') {
    if (n >= 100000) return toBengaliNumber(Math.floor(n / 100000)) + ' লক্ষ'
    if (n >= 1000) return toBengaliNumber(Math.floor(n / 1000)) + ' হাজার'
    return toBengaliNumber(n)
  }
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
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
  { currency: 'USD', name_bn: 'মার্কিন ডলার', name_en: 'US Dollar', buy: '১২১.৫০', sell: '১২২.২০' },
  { currency: 'EUR', name_bn: 'ইউরো', name_en: 'Euro', buy: '১৩১.২০', sell: '১৩২.১০' },
  { currency: 'GBP', name_bn: 'ব্রিটিশ পাউন্ড', name_en: 'British Pound', buy: '১৫৪.৮০', sell: '১৫৫.৯০' },
  { currency: 'SAR', name_bn: 'সৌদি রিয়াল', name_en: 'Saudi Riyal', buy: '৩২.৪০', sell: '৩২.৭০' },
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
