import { useEffect, useRef } from 'react'
import { api } from '../api.js'

/**
 * Universal Dynamic AdBanner component
 * Supports:
 * 1. Dynamic advertisements from database / admin dashboard (Image / Code / AdSense)
 * 2. Click & View analytics tracking
 * 3. Google AdSense Responsive Units
 * 4. Custom sponsored banners
 * 5. Clean fallback placeholders
 */
export default function AdBanner({
  slotKey = null,     // Specific ad position identifier (e.g. 'home_header_top', 'home_sidebar_1')
  ads = [],           // Advertisements array from database
  size = 'rectangle', // 'leaderboard' | 'rectangle' | 'halfpage' | 'infeed' | 'inarticle'
  lang = 'bn',
  className = '',
  settings = null,
  slotId = null,
  customBanner = null, // { imageUrl, linkUrl, altText }
  compact = false,     // Compact mode for Navbar Header Leaderboard
}) {
  const adRef = useRef(null)
  const viewTrackedRef = useRef(false)
  const label = lang === 'bn' ? 'বিজ্ঞাপন' : 'Advertisement'

  const DIMENSIONS = {
    leaderboard: { width: 728, height: 90, label: '' },
    rectangle:   { width: 300, height: 250, label: '' },
    halfpage:    { width: 300, height: 600, label: '' },
    infeed:      { width: '100%', height: 100, label: '' },
    inarticle:   { width: '100%', height: 120, label: '' },
  }

  const config = DIMENSIONS[size] || DIMENSIONS.rectangle

  // 1. Resolve dynamic ad from database
  const dynamicAd = Array.isArray(ads) && ads.length > 0
    ? (slotKey ? ads.find((a) => a.slot_key === slotKey) : ads.find((a) => a.size === size && a.status === 'active'))
    : null

  const isDynamicActive = dynamicAd && dynamicAd.status === 'active'

  // View tracking for dynamic ad
  useEffect(() => {
    if (isDynamicActive && dynamicAd && !viewTrackedRef.current) {
      viewTrackedRef.current = true
      api.recordAdView(dynamicAd.slot_key || dynamicAd.id)
    }
  }, [isDynamicActive, dynamicAd])

  const adsenseEnabled = settings?.adsense_enabled === '1' || settings?.adsense_enabled === true || settings?.adsense_enabled === 'true'
  const adClient = settings?.adsense_client_id?.trim()

  // Resolve specific slot ID from props, dynamic ad, or settings
  const resolvedSlot = slotId || dynamicAd?.adsense_slot || (
    size === 'leaderboard' ? settings?.adsense_header_slot :
    size === 'inarticle' || size === 'infeed' ? settings?.adsense_article_slot :
    settings?.adsense_sidebar_slot
  )

  useEffect(() => {
    const isAdSense = (isDynamicActive && dynamicAd?.ad_type === 'adsense') || (adsenseEnabled && adClient && resolvedSlot)
    if (isAdSense && adClient && resolvedSlot && typeof window !== 'undefined') {
      try {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch (e) {
        // Suppress AdSense already loaded errors in SPA navigation
      }
    }
  }, [isDynamicActive, dynamicAd, adsenseEnabled, adClient, resolvedSlot])

  // Handle ad click
  const handleAdClick = () => {
    if (dynamicAd) {
      api.recordAdClick(dynamicAd.slot_key || dynamicAd.id)
    }
  }

  // A. Dynamic Active Database Ad: Image banner
  if (isDynamicActive && dynamicAd.ad_type === 'image' && dynamicAd.image_url) {
    const titleText = (lang === 'bn' ? dynamicAd.title : dynamicAd.title_en) || dynamicAd.title || label

    if (compact) {
      return (
        <div className={`flex items-center justify-center w-full max-w-[728px] ${className}`}>
          <a
            href={dynamicAd.target_url || '#'}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleAdClick}
            className="group ad-gleam-effect ad-animated-card relative block w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-2xs hover:shadow-md transition-all text-center flex items-center justify-center max-h-[75px]"
            title={titleText}
          >
            <img
              src={dynamicAd.image_url}
              alt={titleText}
              className="w-full h-[75px] object-contain transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
            <span className="absolute bottom-1 right-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-black/70 text-white font-bengali flex items-center gap-1 backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {label}
            </span>
          </a>
        </div>
      )
    }

    return (
      <div className={`my-4 flex flex-col items-center justify-center ${className}`}>
        <div className="w-full flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 px-1">
          <span className="font-bengali flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{label}</span>
          </span>
        </div>
        <a
          href={dynamicAd.target_url || '#'}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleAdClick}
          className="group ad-gleam-effect ad-animated-card block w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xs hover:shadow-xl transition-all text-center"
          style={{ maxWidth: config.width === '100%' ? '100%' : `${config.width}px` }}
          title={titleText}
        >
          <img
            src={dynamicAd.image_url}
            alt={titleText}
            className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
            style={{
              maxHeight: size === 'leaderboard' ? '120px' : size === 'halfpage' ? '650px' : size === 'rectangle' ? '300px' : '200px'
            }}
          />
        </a>
      </div>
    )
  }

  // B. Dynamic Active Database Ad: Custom HTML / JS snippet
  if (isDynamicActive && dynamicAd.ad_type === 'code' && dynamicAd.code_snippet) {
    return (
      <div className={`${compact ? 'my-0' : 'my-4'} flex flex-col items-center justify-center ${className}`}>
        {!compact && (
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-bengali mb-1">
            {label}
          </span>
        )}
        <div
          className="w-full overflow-hidden text-center flex justify-center"
          style={{ maxWidth: config.width === '100%' ? '100%' : `${config.width}px` }}
          dangerouslySetInnerHTML={{ __html: dynamicAd.code_snippet }}
        />
      </div>
    )
  }

  // C. Dynamic Active Database Ad: AdSense slot
  if (isDynamicActive && dynamicAd.ad_type === 'adsense' && (dynamicAd.adsense_slot || resolvedSlot)) {
    return (
      <div className={`adsense-wrapper ${compact ? 'my-0' : 'my-4'} flex flex-col items-center justify-center overflow-hidden ${className}`}>
        {!compact && (
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block font-bengali mb-0.5">
            {label}
          </span>
        )}
        <div ref={adRef} className="w-full flex justify-center text-center">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', minWidth: '250px', width: '100%', height: compact ? '75px' : 'auto' }}
            data-ad-client={adClient}
            data-ad-slot={dynamicAd.adsense_slot || resolvedSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    )
  }

  // D. Direct Sponsored Banner prop (fallback)
  if (customBanner?.imageUrl) {
    return (
      <div className={`my-4 flex flex-col items-center justify-center ${className}`}>
        <div className="w-full flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 px-1">
          <span className="font-bengali flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{label}</span>
          </span>
        </div>
        <a
          href={customBanner.linkUrl || '#'}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="group ad-gleam-effect ad-animated-card block overflow-hidden rounded-lg shadow-xs hover:shadow-xl transition-all"
        >
          <img
            src={customBanner.imageUrl}
            alt={customBanner.altText || label}
            className="w-full h-auto object-cover max-h-[250px] transition-transform duration-700 ease-out group-hover:scale-[1.025]"
          />
        </a>
      </div>
    )
  }

  // E. Global Google AdSense Responsive Unit from Settings
  if (adsenseEnabled && adClient && resolvedSlot) {
    return (
      <div className={`adsense-wrapper my-4 flex flex-col items-center justify-center overflow-hidden ${className}`}>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block font-bengali mb-0.5">
          {label}
        </span>
        <div ref={adRef} className="w-full flex justify-center text-center">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', minWidth: '250px', width: '100%' }}
            data-ad-client={adClient}
            data-ad-slot={resolvedSlot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    )
  }

  // F. Fallback Placeholder (shows ad space & advertising notice)
  if (compact) {
    return (
      <div
        className={`ad-placeholder-animated flex items-center justify-center flex-1 max-w-[728px] h-[75px] border border-dashed rounded-lg text-center px-4 transition-all duration-300 hover:border-red-400 ${className}`}
        aria-label={label}
        role="complementary"
      >
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <div className="text-left">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-bengali">
              {label}
            </span>
            <span className="text-xs text-gray-600 font-medium font-bengali hover:text-[#e30613] transition-colors">
              {lang === 'bn'
                ? `বিজ্ঞাপনের জন্য যোগাযোগ করুন: ${settings?.ad_email || 'ads@prothomalo.com'}`
                : `For advertisement queries: ${settings?.ad_email || 'ads@prothomalo.com'}`}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`ad-placeholder ad-placeholder-animated ad-animated-card mx-auto flex flex-col items-center justify-center border border-dashed rounded-xl text-center p-4 select-none transition-all hover:border-red-400 ${className}`}
      style={{
        maxWidth: config.width === '100%' ? '100%' : `${config.width}px`,
        minHeight: `${config.height}px`,
        width: '100%',
      }}
      aria-label={label}
      role="complementary"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
        </span>
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block font-bengali">
          {label}
        </span>
      </div>
      <span className="text-[11px] text-gray-600 mt-1.5 font-bengali font-semibold hover:text-[#e30613] transition-colors">
        {lang === 'bn' ? 'বিজ্ঞাপন দিতে বা ড্যাশবোর্ড থেকে বিজ্ঞাপন সেট করতে যোগাযোগ করুন' : 'Advertise here or configure from admin dashboard'}
      </span>
    </div>
  )
}

