export default function AdBanner({ size = 'rectangle', lang = 'bn', className = '' }) {
  const label = lang === 'bn' ? 'বিজ্ঞাপন' : 'Advertisement'

  const DIMENSIONS = {
    leaderboard: { width: 728, height: 90, label: '728 × 90' },
    rectangle:   { width: 300, height: 250, label: '300 × 250' },
    halfpage:    { width: 300, height: 600, label: '300 × 600' },
    infeed:      { width: '100%', height: 90, label: 'In-feed Banner' },
  }

  const config = DIMENSIONS[size] || DIMENSIONS.rectangle

  return (
    <div
      className={`ad-placeholder mx-auto flex flex-col items-center justify-center bg-[#f8f9fa] border border-dashed border-gray-300 rounded text-center p-2 select-none ${className}`}
      style={{
        maxWidth: config.width === '100%' ? '100%' : `${config.width}px`,
        height: `${config.height}px`,
        width: '100%',
      }}
      aria-label={label}
      role="complementary"
    >
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-bengali">
        {label}
      </span>
      <span className="text-xs text-gray-400 font-medium mt-0.5">
        {config.label}
      </span>
      <span className="text-[11px] text-gray-400/80 mt-1">
        {lang === 'bn' ? 'বিজ্ঞাপন দিতে যোগাযোগ করুন' : 'Advertise here'}
      </span>
    </div>
  )
}
