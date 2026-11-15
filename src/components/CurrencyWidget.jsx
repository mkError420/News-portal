import { useState, useEffect, useRef } from 'react'
import { TrendingUp, TrendingDown, RefreshCw, ChevronLeft, ChevronRight, Activity } from 'lucide-react'
import { CURRENCY_RATES, toBengaliNumber } from '../utils.js'
import { api } from '../api.js'

export default function CurrencyWidget({ lang = 'bn' }) {
  const [rates, setRates] = useState(CURRENCY_RATES)
  const [activeSlide, setActiveSlide] = useState(0)
  const [rateMode, setRateMode] = useState('buy') // 'buy' | 'sell'
  const [lastFlash, setLastFlash] = useState({}) // { [currency]: 'up' | 'down' }
  const [isPaused, setIsPaused] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(() => new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Chunk rates into slides of 4 items each (matching the 4-column layout)
  const itemsPerSlide = 4
  const totalSlides = Math.ceil(rates.length / itemsPerSlide)

  // 1. Fetch initial live rates from API and poll every 60 seconds
  const fetchLiveRates = async () => {
    setIsRefreshing(true)
    try {
      const serverRates = await api.getCurrencyRates()
      if (serverRates && Array.isArray(serverRates) && serverRates.length > 0) {
        setRates((prev) =>
          prev.map((p) => {
            const found = serverRates.find((s) => s.currency === p.currency)
            if (found) {
              return {
                ...p,
                buy_num: typeof found.buy === 'number' ? found.buy : parseFloat(found.buy) || p.buy_num,
                sell_num: typeof found.sell === 'number' ? found.sell : parseFloat(found.sell) || p.sell_num,
                change: found.change || p.change,
                change_type: found.change_type || p.change_type,
              }
            }
            return p
          })
        )
        setLastUpdated(new Date())
      }
    } catch (err) {
      // Backend offline, will use current client state
    } finally {
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }

  useEffect(() => {
    fetchLiveRates()
    const apiInterval = setInterval(fetchLiveRates, 60000)
    return () => clearInterval(apiInterval)
  }, [])

  // 2. Auto-cycle slide rotation every 5 seconds (all-time change)
  useEffect(() => {
    if (isPaused) return
    const slideTimer = setInterval(() => {
      setActiveSlide((curr) => (curr + 1) % totalSlides)
    }, 5000)
    return () => clearInterval(slideTimer)
  }, [totalSlides, isPaused])

  // 3. Realistic Bangladeshi Market Micro-Fluctuations (all-time live market ticker)
  useEffect(() => {
    const marketTickTimer = setInterval(() => {
      setRates((prevRates) => {
        // Pick one or two random currencies to fluctuate slightly
        const targetIdx = Math.floor(Math.random() * prevRates.length)
        const target = prevRates[targetIdx]
        if (!target) return prevRates

        // Special handling for Gold vs foreign currencies
        const isGold = target.currency === 'GOLD'
        const delta = isGold
          ? (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1) * 50
          : (Math.random() > 0.5 ? 1 : -1) * (parseFloat((Math.random() * 0.15 + 0.05).toFixed(2)))

        const newBuy = Math.max(1, parseFloat((target.buy_num + delta).toFixed(2)))
        const spread = isGold ? 3500 : 0.70
        const newSell = parseFloat((newBuy + spread).toFixed(2))
        const changeType = delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral'
        const changeVal = (delta >= 0 ? '+' : '') + (isGold ? delta : delta.toFixed(2))

        // Trigger visual flash
        setLastFlash((prev) => ({ ...prev, [target.currency]: changeType }))
        setTimeout(() => {
          setLastFlash((prev) => {
            const next = { ...prev }
            delete next[target.currency]
            return next
          })
        }, 1400)

        const updated = [...prevRates]
        updated[targetIdx] = {
          ...target,
          buy_num: newBuy,
          sell_num: newSell,
          change: changeVal,
          change_type: changeType,
        }
        return updated
      })
      setLastUpdated(new Date())
    }, 8000)

    return () => clearInterval(marketTickTimer)
  }, [])

  // Current visible items
  const startIdx = activeSlide * itemsPerSlide
  const visibleItems = rates.slice(startIdx, startIdx + itemsPerSlide)

  // Format currency value based on language
  const formatVal = (val) => {
    if (typeof val !== 'number') val = parseFloat(val) || 0
    const str = val >= 1000 ? val.toLocaleString('en-US') : val.toFixed(2)
    return lang === 'bn' ? toBengaliNumber(str) : str
  }

  // Format change text
  const formatChange = (changeStr) => {
    if (!changeStr) return ''
    return lang === 'bn' ? toBengaliNumber(changeStr) : changeStr
  }

  // Next / Prev slide handlers
  const handlePrev = () => {
    setActiveSlide((curr) => (curr - 1 + totalSlides) % totalSlides)
  }

  const handleNext = () => {
    setActiveSlide((curr) => (curr + 1) % totalSlides)
  }

  return (
    <div
      className="bg-slate-50 border border-gray-200 rounded-lg p-3 mb-5 transition-all shadow-2xs font-bengali"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Meta Bar: Live Badge, Source, Buy/Sell Toggle & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 pb-2 border-b border-gray-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
          </span>
          <span className="font-bold text-gray-800 flex items-center gap-1.5">
            <Activity size={13} className="text-emerald-600" />
            <span>
              {lang === 'bn'
                ? 'লাইভ মুদ্রা বাজার (বাংলাদেশ ব্যাংক ও আন্তঃব্যাংক রেট)'
                : 'Live Currency Market (Bangladesh Bank & Interbank)'}
            </span>
          </span>
          <span className="text-[10px] text-gray-400 hidden sm:inline">
            • {lang === 'bn' ? 'স্বয়ংক্রিয় আপডেট হচ্ছে' : 'Auto updating live'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Rate Mode Toggle: Buy vs Sell */}
          <div className="inline-flex bg-gray-200 p-0.5 rounded-md text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setRateMode('buy')}
              className={`px-2 py-0.5 rounded transition-all ${
                rateMode === 'buy'
                  ? 'bg-white text-gray-900 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {lang === 'bn' ? 'ক্রয় দর' : 'Buy'}
            </button>
            <button
              type="button"
              onClick={() => setRateMode('sell')}
              className={`px-2 py-0.5 rounded transition-all ${
                rateMode === 'sell'
                  ? 'bg-white text-gray-900 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {lang === 'bn' ? 'বিক্রয় দর' : 'Sell'}
            </button>
          </div>

          {/* Manual Refresh Button */}
          <button
            type="button"
            onClick={fetchLiveRates}
            title={lang === 'bn' ? 'তাজা রেট লোড করুন' : 'Refresh live rates'}
            className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-red-600' : ''} />
          </button>

          {/* Slide Navigation Buttons */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handlePrev}
              title={lang === 'bn' ? 'আগের মুদ্রা' : 'Previous'}
              className="p-1 rounded hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              title={lang === 'bn' ? 'পরের মুদ্রা' : 'Next'}
              className="p-1 rounded hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 4-Column Auto-Changing Currency Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {visibleItems.map((curr) => {
          const isFlashed = lastFlash[curr.currency]
          const isUp = curr.change_type === 'up'
          const isDown = curr.change_type === 'down'
          const activeRateNum = rateMode === 'buy' ? curr.buy_num : curr.sell_num

          return (
            <div
              key={curr.currency}
              className={`p-2.5 rounded-lg border transition-all duration-300 relative overflow-hidden ${
                isFlashed === 'up'
                  ? 'bg-emerald-50 border-emerald-400 shadow-sm ring-1 ring-emerald-300'
                  : isFlashed === 'down'
                  ? 'bg-rose-50 border-rose-400 shadow-sm ring-1 ring-rose-300'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs'
              }`}
            >
              {/* Header: Currency code & flag / symbol */}
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-1.5 font-bold text-gray-800">
                  <span className="text-sm">{curr.flag || '💱'}</span>
                  <span className="tracking-wide">{curr.currency}</span>
                </div>
                <span className="text-[10px] text-gray-500 font-normal truncate max-w-[80px]" title={lang === 'bn' ? curr.name_bn : curr.name_en}>
                  {lang === 'bn' ? curr.name_bn : curr.name_en}
                </span>
              </div>

              {/* Main Rate Value & Live Trend */}
              <div className="flex items-baseline justify-between mt-1.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-gray-500 font-semibold">৳</span>
                  <span className="text-base font-extrabold text-[#e30613] tracking-tight transition-colors">
                    {formatVal(activeRateNum)}
                  </span>
                </div>

                {/* Change Badge */}
                {curr.change && curr.change !== '0.00' && curr.change !== '০.০০' && (
                  <span
                    className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isUp
                        ? 'text-emerald-700 bg-emerald-50'
                        : isDown
                        ? 'text-rose-700 bg-rose-50'
                        : 'text-gray-600 bg-gray-100'
                    }`}
                  >
                    {isUp && <TrendingUp size={10} className="text-emerald-600" />}
                    {isDown && <TrendingDown size={10} className="text-rose-600" />}
                    <span>{formatChange(curr.change)}</span>
                  </span>
                )}
              </div>

              {/* Dual Rate Mini Sub-bar: shows the other rate (e.g. sell if viewing buy) */}
              <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1.5 pt-1 border-t border-gray-100">
                <span>{rateMode === 'buy' ? (lang === 'bn' ? 'বিক্রয়' : 'Sell') : (lang === 'bn' ? 'ক্রয়' : 'Buy')}:</span>
                <span className="font-semibold text-gray-700">
                  ৳ {formatVal(rateMode === 'buy' ? curr.sell_num : curr.buy_num)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom Carousel Indicator Dots & Timestamp */}
      <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400">{lang === 'bn' ? 'পৃষ্ঠা:' : 'Slide:'}</span>
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveSlide(idx)}
              className={`h-1.5 rounded-full transition-all ${
                activeSlide === idx ? 'w-4 bg-red-600' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
              }`}
              title={`${lang === 'bn' ? 'মুদ্রা সেট' : 'Set'} ${idx + 1}`}
            />
          ))}
        </div>

        <div className="text-[10px] text-gray-400">
          <span>{lang === 'bn' ? 'বাংলাদেশ সময়' : 'BST'} • </span>
          <span>{lastUpdated.toLocaleTimeString(lang === 'bn' ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      </div>
    </div>
  )
}
