import { useEffect, useRef } from 'react'

/**
 * Universal AdBanner component
 * Supports:
 * 1. Google AdSense Responsive Ad Units (with client & slot ID)
 * 2. Custom Sponsored Banner (with image & click URL)
 * 3. Fallback / Test Placement Placeholder
 */
export default function AdBanner({
  size = 'rectangle', // 'leaderboard' | 'rectangle' | 'halfpage' | 'infeed' | 'inarticle'
  lang = 'bn',
  className = '',
  settings = null,
  slotId = null,
  customBanner = null, // { imageUrl, linkUrl, altText }
}) {
  const adRef = useRef(null)
  const label = lang === 'bn' ? 'বিজ্ঞাপন' : 'Advertisement'

  const DIMENSIONS = {
    leaderboard: { width: 728, height: 90, label: '728 × 90 (Header / Top)' },
    rectangle:   { width: 300, height: 250, label: '300 × 250 (Medium Rectangle)' },
    halfpage:    { width: 300, height: 600, label: '300 × 600 (Half Page / Sidebar)' },
    infeed:      { width: '100%', height: 100, label: 'In-feed Banner' },
    inarticle:   { width: '100%', height: 120, label: 'In-Article Ad' },
  }

  const config = DIMENSIONS[size] || DIMENSIONS.rectangle

  const adsenseEnabled = settings?.adsense_enabled === '1' || settings?.adsense_enabled === true || settings?.adsense_enabled === 'true'
  const adClient = settings?.adsense_client_id?.trim()

  // Resolve specific slot ID from props or settings
  const resolvedSlot = slotId || (
    size === 'leaderboard' ? settings?.adsense_header_slot :
    size === 'inarticle' || size === 'infeed' ? settings?.adsense_article_slot :
    settings?.adsense_sidebar_slot
  )

  useEffect(() => {
    if (adsenseEnabled && adClient && resolvedSlot && typeof window !== 'undefined') {
      try {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch (e) {
        // Suppress AdSense already loaded errors in SPA navigation
      }
    }
  }, [adsenseEnabled, adClient, resolvedSlot])

  // 1. Direct Sponsored Banner
  if (customBanner?.imageUrl) {
    return (
      <div className={`my-4 flex flex-col items-center justify-center ${className}`}>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-bengali mb-1">
          {label}
        </span>
        <a
          href={customBanner.linkUrl || '#'}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block overflow-hidden rounded shadow-xs hover:opacity-95 transition-opacity"
        >
          <img
            src={customBanner.imageUrl}
            alt={customBanner.altText || label}
            className="w-full h-auto object-cover max-h-[250px]"
          />
        </a>
      </div>
    )
  }

  // 2. Google AdSense Responsive Unit
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

  // 3. Fallback Placeholder (shows ad space & advertising notice)
  return (
    <div
      className={`ad-placeholder mx-auto flex flex-col items-center justify-center bg-gray-50/80 border border-dashed border-gray-300 rounded text-center p-3 select-none transition-colors hover:bg-gray-100/70 ${className}`}
      style={{
        maxWidth: config.width === '100%' ? '100%' : `${config.width}px`,
        minHeight: `${config.height}px`,
        width: '100%',
      }}
      aria-label={label}
      role="complementary"
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-bengali">
          {label}
        </span>
      </div>
      <span className="text-xs text-gray-400 font-medium">
        {config.label}
      </span>
      <span className="text-[11px] text-gray-500 mt-1 font-bengali">
        {lang === 'bn' ? 'বিজ্ঞাপন দিতে বা Google AdSense যুক্ত করতে যোগাযোগ করুন' : 'Advertise here or configure Google AdSense'}
      </span>
    </div>
  )
}
