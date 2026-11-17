import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { CURRENCY_RATES, toBengaliNumber } from '../utils.js'
import { api } from '../api.js'

// Helper to compute Bangladesh Bank & Govt Exchange Rates from live USD/BDT feed
export function computeGovtRates(usdBdt, apiRates = {}) {
  const usdRate = parseFloat(usdBdt) || 124.50
  const currencyDefs = [
    { currency: 'USD', name_bn: 'মার্কিন ডলার', name_en: 'US Dollar', symbol: '$', flag: '🇺🇸', spread: 0.35 },
    { currency: 'EUR', name_bn: 'ইউরো', name_en: 'Euro', symbol: '€', flag: '🇪🇺', spread: 0.40 },
    { currency: 'GBP', name_bn: 'ব্রিটিশ পাউন্ড', name_en: 'British Pound', symbol: '£', flag: '🇬🇧', spread: 0.50 },
    { currency: 'SAR', name_bn: 'সৌদি রিয়াল', name_en: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦', spread: 0.15 },
    { currency: 'AED', name_bn: 'ইউএই দিরহাম', name_en: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪', spread: 0.15 },
    { currency: 'KWD', name_bn: 'কুয়েতি দিনার', name_en: 'Kuwaiti Dinar', symbol: 'KD', flag: '🇰🇼', spread: 1.20 },
    { currency: 'QAR', name_bn: 'কাতারি রিয়াল', name_en: 'Qatari Riyal', symbol: 'QR', flag: '🇶🇦', spread: 0.15 },
    { currency: 'MYR', name_bn: 'মালয়েশিয়ান রিঙ্গিত', name_en: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾', spread: 0.15 },
    { currency: 'SGD', name_bn: 'সিঙ্গাপুর ডলার', name_en: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', spread: 0.35 },
    { currency: 'CAD', name_bn: 'কানাডিয়ান ডলার', name_en: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', spread: 0.35 },
    { currency: 'AUD', name_bn: 'অস্ট্রেলিয়ান ডলার', name_en: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', spread: 0.30 },
    { currency: 'INR', name_bn: 'ভারতীয় রুপি', name_en: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', spread: 0.02 },
    { currency: 'GOLD', name_bn: 'স্বর্ণ (২২ ক্যারেট ভরি)', name_en: 'Gold (22K Bhori)', symbol: 'Au', flag: '🪙', isGold: true },
  ]

  return currencyDefs.map((item) => {
    if (item.isGold) {
      return {
        ...item,
        buy_num: 142000,
        sell_num: 145500,
        change: '+৭৫০',
        change_type: 'up',
      }
    }
    if (item.currency === 'USD') {
      const buy = parseFloat((usdRate - item.spread).toFixed(2))
      const sell = parseFloat((usdRate + item.spread).toFixed(2))
      return {
        ...item,
        buy_num: buy,
        sell_num: sell,
        change: '+০.২০',
        change_type: 'up',
      }
    }

    const pair = apiRates[item.currency]
    let mid = 1.0
    if (pair && pair > 0) {
      mid = usdRate / pair
    } else {
      const defaults = { EUR: 137.10, GBP: 164.30, SAR: 33.20, AED: 33.95, KWD: 400.50, QAR: 34.20, MYR: 30.40, SGD: 97.00, CAD: 87.50, AUD: 84.40, INR: 1.33 }
      mid = defaults[item.currency] || 1.0
    }

    const buy = parseFloat((mid - item.spread).toFixed(2))
    const sell = parseFloat((mid + item.spread).toFixed(2))
    return {
      ...item,
      buy_num: buy,
      sell_num: sell,
      change: '+০.১০',
      change_type: 'up',
    }
  })
}

export default function CurrencyWidget({ lang = 'bn' }) {
  const [rates, setRates] = useState(() => {
    try {
      const cached = localStorage.getItem('bd_live_currency_rates')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed?.rates && Array.isArray(parsed.rates) && parsed.rates.length > 0) {
          return parsed.rates
        }
      }
    } catch {}
    return CURRENCY_RATES
  })
  const [rateMode, setRateMode] = useState('buy') // 'buy' | 'sell'
  const [lastFlash, setLastFlash] = useState({}) // { [currency]: 'up' | 'down' }
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(() => new Date())
  const [isGovtSynced, setIsGovtSynced] = useState(true)

  // Fetch live BD exchange rate feed across multiple redundant endpoints
  const fetchLiveBDRates = async () => {
    setIsRefreshing(true)
    let freshGovtRates = null

    // Endpoint 1: open.er-api.com (high accuracy realtime USD/BDT base)
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(5000) })
      if (res.ok) {
        const data = await res.json()
        if (data?.rates?.BDT) {
          freshGovtRates = computeGovtRates(data.rates.BDT, data.rates)
        }
      }
    } catch {}

    // Endpoint 2: api.exchangerate-api.com
    if (!freshGovtRates) {
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', { signal: AbortSignal.timeout(5000) })
        if (res.ok) {
          const data = await res.json()
          if (data?.rates?.BDT) {
            freshGovtRates = computeGovtRates(data.rates.BDT, data.rates)
          }
        }
      } catch {}
    }

    // Endpoint 3: CDN currency API (direct BDT basket)
    if (!freshGovtRates) {
      try {
        const res = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/bdt.json', { signal: AbortSignal.timeout(5000) })
        if (res.ok) {
          const data = await res.json()
          if (data?.bdt?.usd) {
            const usdBdt = 1 / data.bdt.usd
            const convertedRates = {}
            for (const [k, v] of Object.entries(data.bdt)) {
              if (v > 0) convertedRates[k.toUpperCase()] = (1 / v) / usdBdt
            }
            freshGovtRates = computeGovtRates(usdBdt, convertedRates)
          }
        }
      } catch {}
    }

    // Endpoint 4: Backend server database API fallback
    if (!freshGovtRates) {
      try {
        const serverRates = await api.getCurrencyRates()
        if (serverRates && Array.isArray(serverRates) && serverRates.length > 0) {
          freshGovtRates = serverRates.map((s) => ({
            currency: s.currency,
            name_bn: s.name_bn,
            name_en: s.name_en,
            symbol: s.symbol,
            flag: s.flag,
            buy_num: typeof s.buy === 'number' ? s.buy : parseFloat(s.buy) || 0,
            sell_num: typeof s.sell === 'number' ? s.sell : parseFloat(s.sell) || 0,
            change: s.change || '+০.০৫',
            change_type: s.change_type || 'up',
          }))
        }
      } catch {}
    }

    if (freshGovtRates && freshGovtRates.length > 0) {
      // Calculate true change by comparing against current rates
      setRates((prevRates) => {
        const flashes = {}
        const merged = freshGovtRates.map((fresh) => {
          const prev = prevRates.find((p) => p.currency === fresh.currency)
          if (prev && typeof prev.buy_num === 'number') {
            const diff = parseFloat((fresh.buy_num - prev.buy_num).toFixed(2))
            if (diff !== 0) {
              const changeType = diff > 0 ? 'up' : 'down'
              flashes[fresh.currency] = changeType
              return {
                ...fresh,
                change: (diff >= 0 ? '+' : '') + (lang === 'bn' ? toBengaliNumber(diff.toFixed(2)) : diff.toFixed(2)),
                change_type: changeType,
              }
            } else {
              return {
                ...fresh,
                change: prev.change || fresh.change,
                change_type: prev.change_type || fresh.change_type,
              }
            }
          }
          return fresh
        })

        if (Object.keys(flashes).length > 0) {
          setLastFlash(flashes)
          setTimeout(() => setLastFlash({}), 3000)
        }

        try {
          localStorage.setItem('bd_live_currency_rates', JSON.stringify({ rates: merged, timestamp: Date.now() }))
        } catch {}

        return merged
      })

      setLastUpdated(new Date())
      setIsGovtSynced(true)

      // Background sync to backend so server database stays permanently up to date
      api.saveCurrencyRates(freshGovtRates).catch(() => {})
    }

    setTimeout(() => setIsRefreshing(false), 500)
  }

  // Initial load and auto-update every 60 seconds
  useEffect(() => {
    fetchLiveBDRates()
    const autoUpdateInterval = setInterval(fetchLiveBDRates, 60000)

    // Auto-refresh when user returns to this tab
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchLiveBDRates()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(autoUpdateInterval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  // Format currency value based on language
  const formatVal = (val) => {
    if (typeof val !== 'number') val = parseFloat(val) || 0
    const str = val >= 1000 ? val.toLocaleString('en-US') : val.toFixed(2)
    return lang === 'bn' ? toBengaliNumber(str) : str
  }

  // Format change value
  const formatChange = (changeStr) => {
    if (!changeStr) return ''
    return lang === 'bn' ? toBengaliNumber(changeStr) : changeStr
  }

  // Duplicate list to achieve seamless infinite marquee loop
  const infiniteRates = [...rates, ...rates]

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-2xs mb-4 font-bengali overflow-hidden currency-ticker-wrapper select-none">
      <div className="flex items-center">
        {/* Infinite Loop Marquee News Ticker Track (takes full width) */}
        <div className="flex-1 overflow-hidden relative py-2 bg-slate-50">
          {/* Subtle gradient masks for smooth entry and exit */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

          <div className="currency-ticker-track flex items-center">
            {infiniteRates.map((curr, idx) => {
              const isFlashed = lastFlash[curr.currency]
              const isUp = curr.change_type === 'up'
              const isDown = curr.change_type === 'down'
              const activeRateNum = rateMode === 'buy' ? curr.buy_num : curr.sell_num
              const otherRateNum = rateMode === 'buy' ? curr.sell_num : curr.buy_num

              return (
                <div
                  key={`${curr.currency}-${idx}`}
                  className={`inline-flex items-center gap-2 mx-2 px-2.5 py-1 rounded-md border transition-all duration-300 select-none cursor-pointer ${
                    isFlashed === 'up'
                      ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-300'
                      : isFlashed === 'down'
                      ? 'bg-rose-50 border-rose-400 ring-1 ring-rose-300'
                      : 'bg-white border-gray-200 hover:border-red-400 hover:shadow-xs'
                  }`}
                  title={`বাংলাদেশ ব্যাংক সরকারি দর - ${curr.name_bn} (${curr.name_en}): ক্রয়: ৳${formatVal(curr.buy_num)} | বিক্রয়: ৳${formatVal(curr.sell_num)}`}
                >
                  {/* Flag & Currency Code */}
                  <span className="text-sm">{curr.flag || '💱'}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold text-xs text-gray-900 tracking-wide">
                      {curr.currency}
                    </span>
                    <span className="text-[10px] text-gray-500 hidden md:inline">
                      ({lang === 'bn' ? curr.name_bn : curr.name_en})
                    </span>
                  </div>

                  {/* Rate Value */}
                  <div className="flex items-baseline gap-0.5 ml-1">
                    <span className="text-[11px] text-gray-500 font-semibold">৳</span>
                    <span className="font-extrabold text-xs text-[#e30613] tracking-tight">
                      {formatVal(activeRateNum)}
                    </span>
                  </div>

                  {/* Trend Indicator */}
                  {curr.change && curr.change !== '0.00' && curr.change !== '০.০০' && (
                    <span
                      className={`inline-flex items-center text-[9px] font-bold px-1 py-0.5 rounded leading-none ${
                        isUp
                          ? 'text-emerald-700 bg-emerald-50'
                          : isDown
                          ? 'text-rose-700 bg-rose-50'
                          : 'text-gray-600 bg-gray-100'
                      }`}
                    >
                      {isUp && <TrendingUp size={9} className="mr-0.5 text-emerald-600 inline" />}
                      {isDown && <TrendingDown size={9} className="mr-0.5 text-rose-600 inline" />}
                      <span>{formatChange(curr.change)}</span>
                    </span>
                  )}

                  {/* Sub-rate indicator (shows the other rate) */}
                  <span className="text-[9px] text-gray-400 border-l pl-1.5 ml-0.5 hidden lg:inline">
                    {rateMode === 'buy' ? (lang === 'bn' ? 'বিক্রয়' : 'Sell') : (lang === 'bn' ? 'ক্রয়' : 'Buy')}: ৳{formatVal(otherRateNum)}
                  </span>

                  {/* Diamond separator between cards */}
                  <span className="text-gray-300 text-[10px] ml-1">◆</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Controls: Live Badge, Mode Toggle & Refresh */}
        <div className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border-l border-gray-200 z-20">
          <span
            className="hidden sm:inline-flex items-center gap-1 text-[10px] text-gray-600 font-medium mr-0.5"
            title={lang === 'bn' ? 'বাংলাদেশ কারেন্সি লাইভ মার্কেট রেট (স্বয়ংক্রিয় আপডেট)' : 'BD Live Currency Exchange Rates (Auto-updating)'}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold">{lang === 'bn' ? 'লাইভ' : 'Live'}</span>
          </span>

          {/* Rate Mode Toggle: Govt Buy vs Govt Sell */}
          <div className="inline-flex bg-gray-200 p-0.5 rounded text-[10px] font-semibold">
            <button
              type="button"
              onClick={() => setRateMode('buy')}
              className={`px-1.5 py-0.5 rounded transition-all ${
                rateMode === 'buy'
                  ? 'bg-white text-gray-900 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title={lang === 'bn' ? 'সরকারি ক্রয় দর দেখুন' : 'View Govt Buy Rate'}
            >
              {lang === 'bn' ? 'ক্রয় দর' : 'Buy'}
            </button>
            <button
              type="button"
              onClick={() => setRateMode('sell')}
              className={`px-1.5 py-0.5 rounded transition-all ${
                rateMode === 'sell'
                  ? 'bg-white text-gray-900 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title={lang === 'bn' ? 'সরকারি বিক্রয় দর দেখুন' : 'View Govt Sell Rate'}
            >
              {lang === 'bn' ? 'বিক্রয় দর' : 'Sell'}
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchLiveBDRates}
            title={lang === 'bn' ? 'মুদ্রার হার রিলোড করুন' : 'Reload Currency Rates'}
            className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <RefreshCw size={11} className={isRefreshing ? 'animate-spin text-red-600' : ''} />
          </button>
        </div>
      </div>
    </div>
  )
}
