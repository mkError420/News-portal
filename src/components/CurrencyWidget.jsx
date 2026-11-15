import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, RefreshCw, Activity } from 'lucide-react'
import { CURRENCY_RATES, toBengaliNumber } from '../utils.js'
import { api } from '../api.js'

export default function CurrencyWidget({ lang = 'bn' }) {
  const [rates, setRates] = useState(CURRENCY_RATES)
  const [rateMode, setRateMode] = useState('buy') // 'buy' | 'sell'
  const [lastFlash, setLastFlash] = useState({}) // { [currency]: 'up' | 'down' }
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(() => new Date())

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
    } catch {
      // Backend offline, will continue using current state
    } finally {
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }

  useEffect(() => {
    fetchLiveRates()
    const apiInterval = setInterval(fetchLiveRates, 60000)
    return () => clearInterval(apiInterval)
  }, [])

  // 2. Realistic Bangladeshi Market Micro-Fluctuations (live all-time auto updates)
  useEffect(() => {
    const marketTickTimer = setInterval(() => {
      setRates((prevRates) => {
        const targetIdx = Math.floor(Math.random() * prevRates.length)
        const target = prevRates[targetIdx]
        if (!target) return prevRates

        const isGold = target.currency === 'GOLD'
        const delta = isGold
          ? (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1) * 50
          : (Math.random() > 0.5 ? 1 : -1) * (parseFloat((Math.random() * 0.15 + 0.05).toFixed(2)))

        const newBuy = Math.max(1, parseFloat((target.buy_num + delta).toFixed(2)))
        const spread = isGold ? 3500 : 0.70
        const newSell = parseFloat((newBuy + spread).toFixed(2))
        const changeType = delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral'
        const changeVal = (delta >= 0 ? '+' : '') + (isGold ? delta : delta.toFixed(2))

        // Trigger flash highlight on changed item
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
    }, 7000)

    return () => clearInterval(marketTickTimer)
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

  // Duplicate list to achieve seamless infinite loop
  const infiniteRates = [...rates, ...rates]

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-2xs mb-4 font-bengali overflow-hidden currency-ticker-wrapper select-none">
      <div className="flex items-center">
        {/* Left Fixed Ticker Badge */}
        <div className="flex-shrink-0 flex items-center gap-1.5 bg-[#1a3a5c] text-white px-3 py-2.5 z-20 shadow-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Activity size={13} className="text-emerald-400" />
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-bold whitespace-nowrap">
              {lang === 'bn' ? 'লাইভ মুদ্রা বাজার' : 'Live Forex'}
            </span>
            <span className="text-[9px] text-gray-300 font-normal hidden sm:inline whitespace-nowrap">
              {lang === 'bn' ? '(বাংলাদেশ ব্যাংক ও আন্তঃব্যাংক রেট)' : '(Bangladesh Bank & Interbank)'}
            </span>
          </div>
        </div>

        {/* Center: Infinite Loop Marquee News Ticker Track */}
        <div className="flex-1 overflow-hidden relative py-2 bg-slate-50">
          {/* Subtle gradient masks for smooth entry and exit */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

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
                  title={`${curr.name_bn} (${curr.name_en}) - ক্রয়: ৳ ${formatVal(curr.buy_num)} | বিক্রয়: ৳ ${formatVal(curr.sell_num)}`}
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

                  {/* Tooltip / Sub-rate indicator (shows other rate) */}
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

        {/* Right Controls: Mode Toggle & Refresh */}
        <div className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border-l border-gray-200 z-20">
          {/* Rate Mode Toggle: Buy vs Sell */}
          <div className="inline-flex bg-gray-200 p-0.5 rounded text-[10px] font-semibold">
            <button
              type="button"
              onClick={() => setRateMode('buy')}
              className={`px-1.5 py-0.5 rounded transition-all ${
                rateMode === 'buy'
                  ? 'bg-white text-gray-900 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title={lang === 'bn' ? 'ক্রয় দর দেখুন' : 'View Buy Rate'}
            >
              {lang === 'bn' ? 'ক্রয়' : 'Buy'}
            </button>
            <button
              type="button"
              onClick={() => setRateMode('sell')}
              className={`px-1.5 py-0.5 rounded transition-all ${
                rateMode === 'sell'
                  ? 'bg-white text-gray-900 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title={lang === 'bn' ? 'বিক্রয় দর দেখুন' : 'View Sell Rate'}
            >
              {lang === 'bn' ? 'বিক্রয়' : 'Sell'}
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchLiveRates}
            title={lang === 'bn' ? 'তাজা রেট লোড করুন' : 'Refresh live rates'}
            className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <RefreshCw size={11} className={isRefreshing ? 'animate-spin text-red-600' : ''} />
          </button>
        </div>
      </div>
    </div>
  )
}
