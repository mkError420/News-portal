import { useState, useEffect, useMemo } from 'react'
import { CloudSun, Clock, MapPin, Moon, Sun, Sunrise, Sunset, Sparkles } from 'lucide-react'
import { toBengaliNumber } from '../utils.js'

export const BANGLADESH_DIVISIONS = {
  dhaka: {
    id: 'dhaka',
    name_bn: 'ঢাকা',
    name_en: 'Dhaka',
    lat: 23.8103,
    lon: 90.4125,
    offsetMinutes: 0,
    fajrOffset: 0,
    dhuhrOffset: 0,
    asrOffset: 0,
    maghribOffset: 0,
    ishaOffset: 0,
    temp: 28,
    weather_bn: 'আংশিক মেঘলা',
    weather_en: 'Partly Cloudy',
  },
  chattogram: {
    id: 'chattogram',
    name_bn: 'চট্টগ্রাম',
    name_en: 'Chattogram',
    lat: 22.3569,
    lon: 91.7832,
    offsetMinutes: -5,
    fajrOffset: -5,
    dhuhrOffset: -4,
    asrOffset: -4,
    maghribOffset: -5,
    ishaOffset: -5,
    temp: 27,
    weather_bn: 'পরিষ্কার ও রৌদ্রোজ্জ্বল',
    weather_en: 'Clear & Sunny',
  },
  sylhet: {
    id: 'sylhet',
    name_bn: 'সিলেট',
    name_en: 'Sylhet',
    lat: 24.8949,
    lon: 91.8687,
    offsetMinutes: -6,
    fajrOffset: -6,
    dhuhrOffset: -5,
    asrOffset: -5,
    maghribOffset: -6,
    ishaOffset: -6,
    temp: 25,
    weather_bn: 'কুয়াশা ও মৃদু শীতল',
    weather_en: 'Misty & Cool',
  },
  rajshahi: {
    id: 'rajshahi',
    name_bn: 'রাজশাহী',
    name_en: 'Rajshahi',
    lat: 24.3636,
    lon: 88.6241,
    offsetMinutes: 6,
    fajrOffset: 7,
    dhuhrOffset: 6,
    asrOffset: 6,
    maghribOffset: 6,
    ishaOffset: 6,
    temp: 29,
    weather_bn: 'শুষ্ক ও পরিষ্কার',
    weather_en: 'Dry & Clear',
  },
  khulna: {
    id: 'khulna',
    name_bn: 'খুলনা',
    name_en: 'Khulna',
    lat: 22.8456,
    lon: 89.5403,
    offsetMinutes: 4,
    fajrOffset: 3,
    dhuhrOffset: 4,
    asrOffset: 4,
    maghribOffset: 4,
    ishaOffset: 4,
    temp: 28,
    weather_bn: 'আংশিক মেঘলা',
    weather_en: 'Partly Cloudy',
  },
  barishal: {
    id: 'barishal',
    name_bn: 'বরিশাল',
    name_en: 'Barishal',
    lat: 22.7010,
    lon: 90.3535,
    offsetMinutes: 1,
    fajrOffset: 1,
    dhuhrOffset: 1,
    asrOffset: 1,
    maghribOffset: 1,
    ishaOffset: 1,
    temp: 27,
    weather_bn: 'নদী তীরবর্তী শীতল হাওয়া',
    weather_en: 'Pleasant River Breeze',
  },
  rangpur: {
    id: 'rangpur',
    name_bn: 'রংপুর',
    name_en: 'Rangpur',
    lat: 25.7439,
    lon: 89.2752,
    offsetMinutes: 4,
    fajrOffset: 5,
    dhuhrOffset: 4,
    asrOffset: 4,
    maghribOffset: 4,
    ishaOffset: 4,
    temp: 25,
    weather_bn: 'পরিষ্কার ও আরামদায়ক',
    weather_en: 'Pleasant & Clear',
  },
  mymensingh: {
    id: 'mymensingh',
    name_bn: 'ময়মনসিংহ',
    name_en: 'Mymensingh',
    lat: 24.7471,
    lon: 90.4203,
    offsetMinutes: 0,
    fajrOffset: 1,
    dhuhrOffset: 0,
    asrOffset: 0,
    maghribOffset: -1,
    ishaOffset: -1,
    temp: 26,
    weather_bn: 'আংশিক মেঘলা',
    weather_en: 'Partly Cloudy',
  },
}

// Astronomical calculation for Dhaka reference base times
function getDhakaBaseTimes(date = new Date()) {
  const d = date
  const startOfYear = new Date(d.getFullYear(), 0, 0)
  const diff = d - startOfYear
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  const b = (2 * Math.PI * (dayOfYear - 81)) / 365
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b)
  const declination = 23.45 * Math.sin((2 * Math.PI * (dayOfYear - 81)) / 365) * (Math.PI / 180)
  const latRad = 23.8103 * (Math.PI / 180)
  const lon = 90.4125
  const solarNoon = 12 + (90 - lon) / 15 - eot / 60

  function hourAngle(altitudeRad) {
    const cosHA =
      (Math.sin(altitudeRad) - Math.sin(latRad) * Math.sin(declination)) /
      (Math.cos(latRad) * Math.cos(declination))
    if (cosHA > 1 || cosHA < -1) return 0
    return ((Math.acos(cosHA) * (180 / Math.PI)) / 15)
  }

  const fajrHA = hourAngle(-18 * (Math.PI / 180))
  const sunriseHA = hourAngle(-0.833 * (Math.PI / 180))
  const sunsetHA = hourAngle(-0.833 * (Math.PI / 180))
  const ishaHA = hourAngle(-18 * (Math.PI / 180))

  const noonAltitude = Math.PI / 2 - Math.abs(latRad - declination)
  const asrAltitude = Math.atan(1 / (2 + Math.tan(Math.PI / 2 - noonAltitude)))
  const asrHA = hourAngle(asrAltitude)

  return {
    fajr: (solarNoon - fajrHA) * 60,
    sunrise: (solarNoon - sunriseHA) * 60,
    dhuhr: (solarNoon + 4 / 60) * 60,
    asr: (solarNoon + asrHA) * 60,
    maghrib: (solarNoon + sunsetHA + 2 / 60) * 60,
    isha: (solarNoon + ishaHA) * 60,
  }
}

// Format minute to 12-hour string (e.g. 296 -> "4:56")
function minutesToTime(totalMin, lang = 'bn') {
  let total = Math.round(totalMin)
  let h = Math.floor(total / 60) % 24
  let m = total % 60
  if (m < 0) {
    m += 60
    h = (h - 1 + 24) % 24
  }
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h
  const minStr = m < 10 ? `0${m}` : `${m}`
  const formatted = `${displayH}:${minStr}`
  return lang === 'bn' ? toBengaliNumber(formatted) : formatted
}

export default function PrayerTimesWidget({ lang = 'bn' }) {
  // Saved division from localStorage or default to 'dhaka'
  const [selectedDivision, setSelectedDivision] = useState(() => {
    try {
      return localStorage.getItem('news_portal_division') || 'dhaka'
    } catch {
      return 'dhaka'
    }
  })

  // Live timer state for auto updating every minute
  const [now, setNow] = useState(() => new Date())
  const [liveWeather, setLiveWeather] = useState(null)

  // Auto-update timer: triggers every 30 seconds so prayer countdown stays exact
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 30000)
    return () => clearInterval(timer)
  }, [])

  // Persist division selection
  const handleDivisionChange = (divId) => {
    setSelectedDivision(divId)
    try {
      localStorage.setItem('news_portal_division', divId)
    } catch {}
  }

  const currentDiv = BANGLADESH_DIVISIONS[selectedDivision] || BANGLADESH_DIVISIONS.dhaka

  // Fetch optional live weather for selected division
  useEffect(() => {
    let isMounted = true
    const fetchWeather = async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${currentDiv.lat}&longitude=${currentDiv.lon}&current=temperature_2m,weather_code&timezone=auto`
        const res = await fetch(url, { signal: AbortSignal.timeout(3000) })
        if (res.ok) {
          const data = await res.json()
          if (data?.current?.temperature_2m !== undefined && isMounted) {
            setLiveWeather({
              temp: Math.round(data.current.temperature_2m),
            })
          }
        }
      } catch {
        // Fallback to division static baseline
      }
    }
    fetchWeather()
    return () => {
      isMounted = false
    }
  }, [currentDiv.lat, currentDiv.lon])

  // Calculate current date's prayer times for the selected division
  const prayerData = useMemo(() => {
    const base = getDhakaBaseTimes(now)
    const fajrMin = base.fajr + currentDiv.fajrOffset
    const sunriseMin = base.sunrise + currentDiv.offsetMinutes
    const dhuhrMin = base.dhuhr + currentDiv.dhuhrOffset
    const asrMin = base.asr + currentDiv.asrOffset
    const maghribMin = base.maghrib + currentDiv.maghribOffset
    const ishaMin = base.isha + currentDiv.ishaOffset
    const sehriMin = fajrMin - 6

    const prayers = [
      {
        id: 'fajr',
        bn: 'ফজর',
        en: 'Fajr',
        rawMin: fajrMin,
        time: minutesToTime(fajrMin, lang),
      },
      {
        id: 'dhuhr',
        bn: 'যোহর',
        en: 'Dhuhr',
        rawMin: dhuhrMin,
        time: minutesToTime(dhuhrMin, lang),
      },
      {
        id: 'asr',
        bn: 'আসর',
        en: 'Asr',
        rawMin: asrMin,
        time: minutesToTime(asrMin, lang),
      },
      {
        id: 'maghrib',
        bn: 'মাগরিব',
        en: 'Maghrib',
        rawMin: maghribMin,
        time: minutesToTime(maghribMin, lang),
      },
      {
        id: 'isha',
        bn: 'এশা',
        en: 'Isha',
        rawMin: ishaMin,
        time: minutesToTime(ishaMin, lang),
      },
    ]

    // Determine current active prayer & next prayer
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    let activeId = 'isha'
    let nextPrayer = prayers[0] // default next is Fajr
    let diffMinutes = 0

    if (currentMinutes < fajrMin) {
      activeId = 'isha'
      nextPrayer = prayers[0] // Fajr
      diffMinutes = fajrMin - currentMinutes
    } else if (currentMinutes < sunriseMin) {
      activeId = 'fajr'
      nextPrayer = prayers[1] // Dhuhr
      diffMinutes = dhuhrMin - currentMinutes
    } else if (currentMinutes < dhuhrMin) {
      activeId = 'chasht'
      nextPrayer = prayers[1] // Dhuhr
      diffMinutes = dhuhrMin - currentMinutes
    } else if (currentMinutes < asrMin) {
      activeId = 'dhuhr'
      nextPrayer = prayers[2] // Asr
      diffMinutes = asrMin - currentMinutes
    } else if (currentMinutes < maghribMin) {
      activeId = 'asr'
      nextPrayer = prayers[3] // Maghrib
      diffMinutes = maghribMin - currentMinutes
    } else if (currentMinutes < ishaMin) {
      activeId = 'maghrib'
      nextPrayer = prayers[4] // Isha
      diffMinutes = ishaMin - currentMinutes
    } else {
      activeId = 'isha'
      nextPrayer = prayers[0] // Tomorrow's Fajr
      diffMinutes = 24 * 60 - currentMinutes + fajrMin
    }

    const hoursLeft = Math.floor(diffMinutes / 60)
    const minsLeft = diffMinutes % 60
    let countdownStr = ''
    if (lang === 'bn') {
      countdownStr =
        hoursLeft > 0
          ? `${toBengaliNumber(hoursLeft)} ঘণ্টা ${toBengaliNumber(minsLeft)} মি.`
          : `${toBengaliNumber(minsLeft)} মিনিট`
    } else {
      countdownStr = hoursLeft > 0 ? `${hoursLeft}h ${minsLeft}m` : `${minsLeft}m`
    }

    return {
      prayers,
      activeId,
      nextPrayer,
      countdownStr,
      sehriTime: minutesToTime(sehriMin, lang),
      iftarTime: minutesToTime(maghribMin, lang),
      sunriseTime: minutesToTime(sunriseMin, lang),
    }
  }, [now, currentDiv, lang])

  const tempVal = liveWeather?.temp ?? currentDiv.temp
  const tempStr = lang === 'bn' ? toBengaliNumber(tempVal) : tempVal
  const weatherDesc = lang === 'bn' ? currentDiv.weather_bn : currentDiv.weather_en

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-xs font-bengali transition-all">
      {/* Header: Title & Division Dropdown Select */}
      <div className="border-b pb-2.5 mb-3 flex items-center justify-between gap-2">
        <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
          <CloudSun size={17} className="text-orange-500 flex-shrink-0" />
          <span>{lang === 'bn' ? 'নামাজের সময়সূচি' : 'Prayer Times'}</span>
        </h4>

        {/* Division Selection Dropdown */}
        <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 shadow-2xs hover:border-gray-300">
          <MapPin size={11} className="text-red-500 flex-shrink-0" />
          <select
            value={selectedDivision}
            onChange={(e) => handleDivisionChange(e.target.value)}
            className="bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer pr-1"
            title={lang === 'bn' ? 'বিভাগ নির্বাচন করুন' : 'Select Division'}
          >
            {Object.values(BANGLADESH_DIVISIONS).map((div) => (
              <option key={div.id} value={div.id} className="text-gray-900 bg-white font-medium">
                {lang === 'bn' ? div.name_bn : div.name_en}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Prayer & Next Prayer Countdown Banner */}
      <div className="mb-2.5 px-2.5 py-1.5 bg-emerald-50/80 border border-emerald-200/80 rounded-lg flex items-center justify-between text-[11px] text-emerald-900">
        <div className="flex items-center gap-1.5 font-semibold truncate">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <span className="truncate">
            {lang === 'bn' ? 'পরবর্তী ওয়াক্ত:' : 'Next Prayer:'}{' '}
            <strong className="text-emerald-950">
              {lang === 'bn' ? prayerData.nextPrayer.bn : prayerData.nextPrayer.en}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-1 font-bold text-emerald-800 flex-shrink-0">
          <Clock size={11} />
          <span>{prayerData.countdownStr}</span>
        </div>
      </div>

      {/* 5-Column Prayer Times Grid */}
      <div className="grid grid-cols-5 gap-1.5 text-center bg-gray-50/90 p-1.5 rounded-lg border border-gray-100">
        {prayerData.prayers.map((p) => {
          const isActive = prayerData.activeId === p.id
          return (
            <div
              key={p.id}
              className={`py-2 px-1 rounded-md transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs font-bold scale-[1.02]'
                  : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              <span
                className={`block text-[10px] font-semibold tracking-wide ${
                  isActive ? 'text-emerald-100' : 'text-gray-500'
                }`}
              >
                {lang === 'bn' ? p.bn : p.en}
              </span>
              <span className="font-extrabold text-xs mt-0.5 block tracking-tight">
                {p.time}
              </span>
            </div>
          )
        })}
      </div>

      {/* Sehri & Iftar Quick Bar */}
      <div className="mt-2.5 pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-gray-100 text-gray-600">
          <Moon size={12} className="text-indigo-500 flex-shrink-0" />
          <span className="text-[10px]">{lang === 'bn' ? 'সাহরির শেষ:' : 'Sehri Ends:'}</span>
          <strong className="text-gray-900 font-bold ml-auto">{prayerData.sehriTime}</strong>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-gray-100 text-gray-600">
          <Sun size={12} className="text-amber-500 flex-shrink-0" />
          <span className="text-[10px]">{lang === 'bn' ? 'ইফতার:' : 'Iftar:'}</span>
          <strong className="text-gray-900 font-bold ml-auto">{prayerData.iftarTime}</strong>
        </div>
      </div>

      {/* Weather Row for Selected Division */}
      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-gray-600 text-xs">
        <div className="flex items-center gap-1">
          <CloudSun size={13} className="text-orange-500" />
          <span>{lang === 'bn' ? 'আজকের তাপমাত্রা:' : 'Temperature:'}</span>
        </div>
        <div className="font-bold text-gray-900 flex items-center gap-1">
          <span>{tempStr}° সে.</span>
          <span className="text-gray-500 font-normal text-[11px]">({weatherDesc})</span>
        </div>
      </div>
    </div>
  )
}
