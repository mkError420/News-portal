// Clean Dynamic Data Architecture - All content is served directly from the database
export const breakingNews = []

export const opinions = []

export const photos = []

export const videos = []

export const articles = []

export const initialCategories = [
  { id: 1, name_bn: 'জাতীয়', name_en: 'National', slug: 'national', icon: 'Flag', order: 1 },
  { id: 2, name_bn: 'রাজনীতি', name_en: 'Politics', slug: 'politics', icon: 'Vote', order: 2 },
  { id: 3, name_bn: 'অর্থনীতি', name_en: 'Economy', slug: 'economy', icon: 'TrendingUp', order: 3 },
  { id: 4, name_bn: 'আন্তর্জাতিক', name_en: 'World', slug: 'international', icon: 'Globe', order: 4 },
  { id: 5, name_bn: 'খেলাধুলা', name_en: 'Sports', slug: 'sports', icon: 'Trophy', order: 5 },
  { id: 6, name_bn: 'বিনোদন', name_en: 'Entertainment', slug: 'entertainment', icon: 'Film', order: 6 },
  { id: 7, name_bn: 'প্রযুক্তি', name_en: 'Technology', slug: 'tech', icon: 'Cpu', order: 7 },
  { id: 8, name_bn: 'জীবনযাপন', name_en: 'Lifestyle', slug: 'lifestyle', icon: 'Heart', order: 8 },
  { id: 9, name_bn: 'শিক্ষা ও চাকরি', name_en: 'Education & Jobs', slug: 'education', icon: 'GraduationCap', order: 9 },
  { id: 10, name_bn: 'মতামত', name_en: 'Opinion', slug: 'opinion', icon: 'MessageSquare', order: 10 },
  { id: 11, name_bn: 'স্বাস্থ্য ও চিকিৎসা', name_en: 'Health', slug: 'health', icon: 'Activity', order: 11 },
  { id: 12, name_bn: 'বাণিজ্য', name_en: 'Business', slug: 'business', icon: 'Briefcase', order: 12 },
  { id: 13, name_bn: 'আলোকচিত্র', name_en: 'Photos', slug: 'photos', icon: 'Camera', order: 13 },
  { id: 14, name_bn: 'ভিডিও', name_en: 'Videos', slug: 'videos', icon: 'Video', order: 14 },
  { id: 15, name_bn: 'ই-পেপার', name_en: 'E-Paper', slug: 'epaper', icon: 'FileText', order: 15 },
]

export const defaultSiteSettings = {
  site_name_bn: 'আলোর পথে',
  site_name_en: 'Prothom kalo',
  tagline_bn: 'অনলাইন সংস্করণ • সত্যের সন্ধানে নির্ভীক',
  tagline_en: 'Online Edition • Fearless in Pursuit of Truth',
  logo_url: '',
  favicon_url: '',
  editor_bn: 'সম্পাদক ও প্রকাশক: মতিউর রহমান',
  editor_en: 'Editor & Publisher: Matiur Rahman',
  about_bn: 'আলোর পথে বাংলাদেশের সর্বাধিক পঠিত ও জনপ্রিয় বাংলা দৈনিক ও অনলাইন সংবাদমাধ্যম। নিরপেক্ষ ও বস্তুনিষ্ঠ সাংবাদিকতাই আমাদের মূল শক্তি।',
  about_en: 'Prothom kalo is the leading and most trusted news publication in Bangladesh, delivering impartial and accurate news 24/7.',
  address_bn: 'প্রগতি ইনস্যুরেন্স ভবন, ২০-২১ কারওয়ান বাজার, ঢাকা ১২১৫, বাংলাদেশ',
  address_en: 'Pragati Insurance Bhaban, 20-21 Karwan Bazar, Dhaka 1215, Bangladesh',
  phone: '+৮৮০ ২ ৮১৮০০৭৮-৮১',
  email: 'info@prothomkalo.com',
  ad_email: 'ads@prothomkalo.com',
  facebook_url: 'https://facebook.com/DailyProthomKalo',
  twitter_url: 'https://twitter.com/ProthomKalo',
  youtube_url: 'https://youtube.com/c/ProthomKalo',
  instagram_url: 'https://instagram.com/prothomkalo',
  linkedin_url: 'https://linkedin.com/company/prothom-kalo',
  copyright_bn: 'স্বত্ব © ২০২৬ আলোর পথে | সর্বস্বত্ব সংরক্ষিত।',
  copyright_en: 'Copyright © 2026 Prothom kalo | All rights reserved.',
  edition_bn: 'বাংলাদেশ',
  edition_en: 'Bangladesh',
  adsense_enabled: '0',
  adsense_client_id: '',
  adsense_auto_ads: '1',
  adsense_header_slot: '',
  adsense_article_slot: '',
  adsense_sidebar_slot: '',
  adsense_footer_slot: '',
  ads_txt_content: 'google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0',
  google_site_verification: '',
  bing_site_verification: '',
  canonical_base_url: '',
  meta_keywords_default: 'সংবাদ, বাংলাদেশ, আলোর পথে, খবর, ব্রেকিং নিউজ, News, Bangladesh, Prothom kalo',
  og_image_default: '',
}

export const defaultPoll = null

export const defaultData = {
  breakingNews: [],
  articles: [],
  opinions: [],
  photos: [],
  videos: [],
  categories: initialCategories,
  roles: [],
  staff: [],
  settings: defaultSiteSettings,
  poll: null,
  polls: [],
}
