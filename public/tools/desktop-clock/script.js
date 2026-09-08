// Flip clock + Date/Lunar + Weather + Solar terms + Sunrise/Sunset

const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s))

const state = {
  use24h: true,
  showSeconds: true,
  lat: null,
  lon: null,
  tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
  offsetMs: 0, // 与网络时间的偏移（可选），默认使用本机时间
  themeMode: 'dark', // 默认暗色；仅手动切换 light/dark
  ui: { // 可配置显示/隐藏
    toolbar: true,
    week: true,
    greg: true,
    lunar: true,
    weather: true,
    solar: true,
    sun: true,
  },
}

// Weather Worker 端点（部署后替换为实际域名）
// 本地开发时使用 http://localhost:8787/weather
const WEATHER_API_URL = 'https://weather-proxy.dirkchou.workers.dev/weather'

// ---------------- Time + Flip ----------------
function buildFlip(el, value) {
  el.innerHTML = ''
  const tile = document.createElement('div')
  tile.className = 'tile'
  // static halves
  const halfTop = document.createElement('div')
  halfTop.className = 'half top'
  const halfBottom = document.createElement('div')
  halfBottom.className = 'half bottom'

  const numTop = document.createElement('div')
  numTop.className = 'num'
  numTop.textContent = value
  halfTop.appendChild(numTop)

  const numBottom = document.createElement('div')
  numBottom.className = 'num'
  numBottom.textContent = value
  halfBottom.appendChild(numBottom)

  // animated layers
  const upper = document.createElement('div')
  upper.className = 'flip-upper'
  const upperNum = document.createElement('div')
  upperNum.className = 'num'
  upperNum.textContent = value
  upper.appendChild(upperNum)

  const lower = document.createElement('div')
  lower.className = 'flip-lower'
  const lowerNum = document.createElement('div')
  lowerNum.className = 'num'
  lowerNum.textContent = value
  lower.appendChild(lowerNum)

  tile.appendChild(halfTop)
  tile.appendChild(halfBottom)
  tile.appendChild(upper)
  tile.appendChild(lower)
  el.appendChild(tile)

  // 动画结束后复位，防止多层数字叠加
  const onAnimEnd = () => {
    const v = el.dataset.value || value
    el.classList.remove('go')
    el.querySelector('.flip-upper .num').textContent = v
    el.querySelector('.half.top .num').textContent = v
    el.querySelector('.half.bottom .num').textContent = v
  }
  upper.addEventListener('animationend', onAnimEnd)
  lower.addEventListener('animationend', onAnimEnd)
}

function setFlipValue(el, newVal) {
  const current = el.dataset.value
  if (current === newVal) return
  el.dataset.value = newVal
  const upper = el.querySelector('.flip-upper .num')
  const lower = el.querySelector('.flip-lower .num')
  const halfTop = el.querySelector('.half.top .num')
  const halfBottom = el.querySelector('.half.bottom .num')
  // Pre-fill
  upper.textContent = current ?? newVal
  lower.textContent = newVal
  halfTop.textContent = current ?? newVal
  halfBottom.textContent = newVal
  // Trigger animation
  el.classList.remove('go')
  // reflow
  void el.offsetWidth
  el.classList.add('go')
}

function initClock() {
  $$('.flip').forEach((el) => buildFlip(el, '0'))
  preciseTick()
  // 尝试同步一次网络时间（不影响可用性）
  tryNetworkTimeSync()
}

function pad2(n) { return n < 10 ? '0' + n : '' + n }

function nowWithOffset() { return new Date(Date.now() + state.offsetMs) }

function tick() {
  const now = nowWithOffset()
  let h = now.getHours()
  let m = now.getMinutes()
  let s = now.getSeconds()

  if (!state.showSeconds) s = Math.floor(now.getTime() / 1000) // stable but unused
  if (!state.use24h) {
    h = h % 12
    if (h === 0) h = 12
  }
  const hh = pad2(h)
  const mm = pad2(m)
  const ss = pad2(s)

  setFlipValue($('[data-slot="h1"]'), hh[0])
  setFlipValue($('[data-slot="h2"]'), hh[1])
  setFlipValue($('[data-slot="m1"]'), mm[0])
  setFlipValue($('[data-slot="m2"]'), mm[1])
  setFlipValue($('[data-slot="s1"]'), ss[0])
  setFlipValue($('[data-slot="s2"]'), ss[1])

  renderDate(now)
  renderBigTime(hh, mm, ss)
}

function preciseTick() {
  tick()
  const now = nowWithOffset()
  const delay = 1000 - now.getMilliseconds() + 5 // 在下一个整秒后轻微延后一丢丢，避免提前抖动
  setTimeout(preciseTick, delay)
}

// ---------------- Date + Lunar ----------------
function zhWeekday(d) { return ['日', '一', '二', '三', '四', '五', '六'][d.getDay()] }

function renderDate(now) {
  const gd = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`
  $('#greg-date').textContent = `周${zhWeekday(now)} · ${gd}`
  // Lunar via Intl if supported
  try {
    const monthStr = lunarMonthName(now)
    const lunarFmtDayEn = new Intl.DateTimeFormat('en-u-ca-chinese', { day: 'numeric' })
    // 日：先取阿拉伯数字再转为农历日表达（初/十/廿/三十）
    const dayNum = parseInt(lunarFmtDayEn.format(now), 10)
    const dayStr = lunarDayName(dayNum) + '日'
    // 行内：需要包含“农历”二字，且无点与空格
    $('#lunar-date').textContent = `农历${monthStr}${dayStr}`
    const bigW = $('#big-week')
    if (bigW) bigW.textContent = `周${zhWeekday(now)}`
    const bigG = $('#big-gdate')
    if (bigG) bigG.textContent = gd
    const bigL = $('#big-ldate')
    if (bigL) bigL.textContent = `农历${monthStr}${dayStr}`
  } catch (e) {
    $('#lunar-date').textContent = '农历（浏览器不支持）'
    const bigW = $('#big-week')
    if (bigW) bigW.textContent = `周${zhWeekday(now)}`
    const bigG = $('#big-gdate')
    if (bigG) bigG.textContent = gd
    const bigL = $('#big-ldate')
    if (bigL) bigL.textContent = '农历 · 不支持'
  }
}

// 农历日（1-30）转中文写法：初一…初十、十一…十九、二十、廿一…廿九、三十
function lunarDayName(n) {
  const nums = ['一', '二', '三', '四', '五', '六', '七', '八', '九']
  if (n <= 0 || n > 30 || isNaN(n)) return '' + n
  if (n <= 10) return n === 10 ? '初十' : '初' + nums[n - 1]
  if (n < 20) return '十' + nums[n - 11]
  if (n === 20) return '二十'
  if (n < 30) return '廿' + nums[n - 21]
  return '三十'
}

// 农历月份名：正月、二月…九月、十月、冬月、腊月；闰月保留“闰”前缀
function lunarMonthName(date) {
  const zhLong = new Intl.DateTimeFormat('zh-u-ca-chinese', { month: 'long' }).format(date).replace(/\s+/g, '')
  const isLeap = zhLong.includes('闰')
  // 优先从英文数字拿到 1-12
  let num = parseInt(new Intl.DateTimeFormat('en-u-ca-chinese', { month: 'numeric' }).format(date), 10)
  if (isNaN(num)) {
    // 兜底：从中文长月名推断
    if (zhLong.includes('正')) num = 1
    else if (zhLong.includes('冬')) num = 11
    else if (zhLong.includes('腊')) num = 12
    else if (zhLong.includes('十') && zhLong.includes('一')) num = 11
    else if (zhLong.includes('十') && zhLong.includes('二')) num = 12
    else if (zhLong.includes('十')) num = 10
    else {
      const map = { '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9 }
      for (const k in map) { if (zhLong.includes(k)) { num = map[k]; break } }
    }
  }
  let base = ''
  if (num === 1) base = '正月'
  else if (num >= 2 && num <= 9) base = '二三四五六七八九'.charAt(num - 2) + '月'
  else if (num === 10) base = '十月'
  else if (num === 11) base = '冬月'
  else if (num === 12) base = '腊月'
  else base = zhLong.replace('闰', '') // 最后兜底
  return isLeap ? ('闰' + base) : base
}

// ---------------- Big Time (simple style) ----------------
function renderBigTime(hh, mm, ss) {
  const sec = state.showSeconds ? `:${ss}` : ''
  const txt = `${hh}:${mm}${sec}`
  const el = $('#big-time')
  if (!el) return
  if (el.textContent !== txt) el.textContent = txt
  el.dataset.ampm = ''
}

// ---------------- Theme helpers ----------------
function setTheme(mode) {
  state.themeMode = mode
  document.documentElement.classList.remove('theme-light', 'theme-dark')
  if (mode === 'light') document.documentElement.classList.add('theme-light')
  if (mode === 'dark') document.documentElement.classList.add('theme-dark')
  updateThemeButtonLabel()
}

// 自动切换功能已移除（仅保留手动 Light/Dark）。

function updateThemeButtonLabel() {
  const btn = document.getElementById('toggle-theme')
  if (!btn) return
  // 显示“下一步将切换到”的目标：当前 dark -> 显示 亮；当前 light -> 显示 暗
  btn.textContent = `主题 · ${state.themeMode === 'dark' ? '亮' : '暗'}`
}

// ---------------- Solar Terms (24 节气) ----------------
// Approximation for 1901-2100 using standard formula D = floor(Y*0.2422 + C) - floor((Y-1)/4)
// Constants from published astronomical approximations (C20 for 20th, C21 for 21st century)
const solarTermNames = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
]
const C20 = [
  6.11, 20.84, 4.6295, 19.4599, 6.3826, 21.4155, 5.59, 20.888, 6.318, 21.86, 6.5, 22.2,
  7.928, 23.65, 8.35, 23.95, 8.44, 23.822, 9.098, 24.218, 8.218, 23.08, 7.9, 22.60
]
const C21 = [
  5.4055, 20.12, 3.87, 18.73, 5.63, 20.646, 4.81, 20.1, 5.52, 21.04, 5.678, 21.37,
  7.108, 22.83, 7.5, 23.13, 7.646, 23.042, 8.318, 23.438, 7.438, 22.36, 7.18, 21.94
]

// Special year corrections (year: [index -> delta day]) minimal subset commonly used
const corrections = {
  // examples: 2016小寒-1, 2082大寒+1 etc. Keeping a compact but useful set
  2016: { 0: -1 }, // 小寒
  2082: { 1: +1 }, // 大寒
  2026: { 2: +1 },
  2084: { 3: +1 },
  1911: { 23: +1 },
}

function termDay(year, idx) {
  const century = year <= 2000 ? C20 : C21
  const Y = year % 100
  let D = Math.floor(Y * 0.2422 + century[idx]) - Math.floor((Y - 1) / 4)
  const corr = corrections[year] && corrections[year][idx]
  if (corr) D += corr
  return D
}

function solarTermDate(year, idx) {
  const month = Math.floor(idx / 2) + 1 // 1-12
  const day = termDay(year, idx)
  return new Date(year, month - 1, day)
}

function currentAndNextSolarTerm(now) {
  const year = now.getFullYear()
  // Build all term dates for previous year (last few terms), current year, and next year (first few terms)
  const prevYearTerms = solarTermNames.slice(-4).map((name, i) => ({
    i: solarTermNames.length - 4 + i,
    name,
    date: solarTermDate(year - 1, solarTermNames.length - 4 + i)
  }))
  const terms = solarTermNames.map((name, i) => ({ i, name, date: solarTermDate(year, i) }))
  const nextYearTerms = solarTermNames.slice(0, 4).map((name, i) => ({ i, name, date: solarTermDate(year + 1, i) }))
  const all = [...prevYearTerms, ...terms, ...nextYearTerms]
  all.sort((a, b) => a.date - b.date)
  // Find current (closest not after now) and upcoming
  let curr = null, next = null
  for (let i = 0; i < all.length; i++) {
    const t = all[i]
    if (t.date <= now) curr = t
    if (t.date > now) { next = t; break }
  }
  return { curr, next }
}

function renderSolarTerms(now) {
  const { curr, next } = currentAndNextSolarTerm(now)
  const fmt = (d) => `${d.getMonth() + 1}/${d.getDate()}`
  const prevEl = $('#solar-prev')
  const nextEl = $('#solar-next')
  if (!curr || !next) {
    if (prevEl) prevEl.textContent = '计算中…'
    if (nextEl) nextEl.textContent = '计算中…'
    return
  }
  if (prevEl) prevEl.textContent = `${curr.name}（${fmt(curr.date)}）`
  if (nextEl) nextEl.textContent = `${next.name}（${fmt(next.date)}）`
}

// ---------------- Sunrise / Sunset (NOAA) ----------------
function toRad(deg) { return deg * Math.PI / 180 }
function toDeg(rad) { return rad * 180 / Math.PI }
function normalizeAngle(a) { while (a < 0) a += 360; while (a >= 360) a -= 360; return a }

function julianDay(date) {
  const Y = date.getUTCFullYear(), M = date.getUTCMonth() + 1, D = date.getUTCDate()
  const A = Math.floor((14 - M) / 12)
  const y = Y + 4800 - A
  const m = M + 12 * A - 3
  return D + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
}

function solarNoonOffset(lon) { return lon / 360 }

function solarPosition(d) { // returns declination and eqtime (minutes)
  const rad = Math.PI / 180
  const JC = (d - 2451545) / 36525
  const L0 = normalizeAngle(280.46646 + JC * (36000.76983 + JC * 0.0003032))
  const M = 357.52911 + JC * (35999.05029 - 0.0001537 * JC)
  const e = 0.016708634 - JC * (0.000042037 + 0.0000001267 * JC)
  const C = (1.914602 - JC * (0.004817 + 0.000014 * JC)) * Math.sin(rad * M) + (0.019993 - 0.000101 * JC) * Math.sin(rad * 2 * M) + 0.000289 * Math.sin(rad * 3 * M)
  const trueLong = L0 + C
  const omega = 125.04 - 1934.136 * JC
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(rad * omega)
  const epsilon0 = 23 + (26 + ((21.448 - JC * (46.815 + JC * (0.00059 - JC * 0.001813)))) / 60) / 60
  const epsilon = epsilon0 + 0.00256 * Math.cos(rad * omega)
  const y = Math.tan(rad * (epsilon / 2)) ** 2
  const eqtime = 4 * toDeg(y * Math.sin(2 * rad * L0) - 2 * e * Math.sin(rad * M) + 4 * e * y * Math.sin(rad * M) * Math.cos(2 * rad * L0) - 0.5 * y * y * Math.sin(4 * rad * L0) - 1.25 * e * e * Math.sin(2 * rad * M))
  const decl = toDeg(Math.asin(Math.sin(rad * epsilon) * Math.sin(rad * lambda)))
  return { decl, eqtime }
}

function sunriseSunset(dateLocal, lat, lon) {
  const d = julianDay(new Date(Date.UTC(dateLocal.getFullYear(), dateLocal.getMonth(), dateLocal.getDate())))
  const { decl, eqtime } = solarPosition(d)
  const ha = toDeg(Math.acos(Math.cos(toRad(90.833)) / (Math.cos(toRad(lat)) * Math.cos(toRad(decl))) - Math.tan(toRad(lat)) * Math.tan(toRad(decl))))
  const sunriseMinutes = 720 - 4 * (lon + ha) - eqtime
  const sunsetMinutes = 720 - 4 * (lon - ha) - eqtime
  function toLocalTime(mins) {
    const dt = new Date(dateLocal)
    dt.setHours(0, 0, 0, 0)
    return new Date(dt.getTime() + mins * 60 * 1000)
  }
  return { sunrise: toLocalTime(sunriseMinutes), sunset: toLocalTime(sunsetMinutes) }
}

function fmtTime(d, withSeconds = false) {
  const h = d.getHours()
  const mm = pad2(d.getMinutes())
  const ss = pad2(d.getSeconds())
  if (state.use24h) return withSeconds ? `${pad2(h)}:${mm}:${ss}` : `${pad2(h)}:${mm}`
  const h12 = h % 12 === 0 ? 12 : h % 12
  const suffix = h < 12 ? 'AM' : 'PM'
  return withSeconds ? `${pad2(h12)}:${mm}:${ss} ${suffix}` : `${pad2(h12)}:${mm} ${suffix}`
}

function roundToMinute(date) { return new Date(Math.round(date.getTime() / 60000) * 60000) }

// ---------------- Geolocation + Weather ----------------

// 浏览器定位
async function getBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('不支持地理定位'))
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, source: 'browser' }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 }
    )
  })
}

// IP 定位（通过 Worker 的 Cloudflare cf 对象）
async function getLocationByIP() {
  const workerBase = WEATHER_API_URL.replace('/weather', '')
  const res = await fetch(`${workerBase}/geoip`)
  if (!res.ok) throw new Error('IP 定位失败')
  const data = await res.json()
  if (!data.lat || !data.lon) throw new Error('IP 定位无坐标')
  return {
    lat: data.lat,
    lon: data.lon,
    city: data.city,
    source: 'ip'
  }
}

// 获取位置：优先浏览器定位，失败则尝试 IP 定位
async function getLocation() {
  try {
    return await getBrowserLocation()
  } catch (browserErr) {
    console.warn('Browser geolocation failed, trying IP-based:', browserErr.message)
    try {
      return await getLocationByIP()
    } catch (ipErr) {
      console.warn('IP geolocation also failed:', ipErr.message)
      throw browserErr // 抛出原始错误
    }
  }
}

function codeToDesc(code) {
  // OpenWeatherMap condition codes (200-899)
  // https://openweathermap.org/weather-conditions
  if (code >= 200 && code < 300) return '雷阵雨'
  if (code >= 300 && code < 400) return '毛毛雨'
  if (code >= 500 && code < 600) {
    if (code < 502) return '小雨'
    if (code < 504) return '中雨'
    return '大雨'
  }
  if (code >= 600 && code < 700) {
    if (code < 602) return '小雪'
    if (code < 620) return '雪'
    return '阵雪'
  }
  if (code >= 700 && code < 800) {
    if (code === 741) return '雾'
    if (code === 721) return '霾'
    return '雾霾'
  }
  if (code === 800) return '晴'
  if (code === 801) return '少云'
  if (code >= 802 && code <= 803) return '多云'
  if (code === 804) return '阴'
  return '天气'
}

function updateWeatherLine() {
  const loc = ($('#location')?.textContent || '').trim()
  const desc = ($('#weather-desc')?.textContent || '').trim()
  const temp = ($('#temp')?.textContent || '').trim()
  const parts = []
  if (loc) parts.push(loc)
  if (desc) parts.push(desc.replace(/\s+/g, ' '))
  if (temp) parts.push(temp)
  const line = parts.join(' · ')
  const el = $('#weather-line')
  if (el) el.textContent = line || '—'
}

async function resolveLocationName(lat, lon) {
  // 优先 BigDataCloud（免 key，CORS 友好）
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`
    const r = await fetch(url)
    if (r.ok) {
      const j = await r.json()
      const city = j.city || j.locality || ''
      const admin = j.principalSubdivision || ''
      const country = j.countryName || ''
      const name = zhCity(admin, city, country)
      if (name) return name
    }
  } catch (e) {/* ignore */ }
  // 备选 Open‑Meteo 反向地理
  try {
    const gUrl = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=zh`
    const gRes = await fetch(gUrl)
    if (gRes.ok) {
      const g = await gRes.json()
      if (g && g.results && g.results.length) {
        const r = g.results[0]
        const city = r.name || ''
        const admin = r.admin1 || r.admin2 || ''
        const country = r.country || ''
        let show = zhCity(admin, city, country)
        if (show) return show
      }
    }
  } catch (e) {/* ignore */ }
  return ''
}

function stripCnSuffix(s) {
  if (!s) return ''
  return s.replace(/(省|市|特别行政区|自治区|壮族自治区|维吾尔自治区|回族自治区)$/, '')
}
function zhCity(admin, city, country) {
  const c = stripCnSuffix(city || '')
  const a = stripCnSuffix(admin || '')
  if (c) return c
  if (a) return a
  return country || ''
}

async function fetchWeather(lat, lon) {
  try {
    // 调用 Weather Worker 代理
    const url = `${WEATHER_API_URL}?lat=${lat}&lon=${lon}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('天气请求失败')
    const data = await res.json()

    // 解析 Worker 返回的统一格式
    // 和风天气直接返回中文描述，OpenWeatherMap 返回天气 ID
    if (data.weather?.text) {
      // 和风天气格式
      $('#weather-desc').textContent = data.weather.text
    } else if (data.weather?.id) {
      // OpenWeatherMap 格式
      $('#weather-desc').textContent = codeToDesc(data.weather.id)
    } else {
      $('#weather-desc').textContent = '天气'
    }

    // 温度：最低/最高
    const tmin = data.temp?.min ?? 0
    const tmax = data.temp?.max ?? 0
    $('#temp').textContent = `${tmin}°/${tmax}°C`
    updateWeatherLine()

    // 日出日落处理（兼容两种格式）
    if (data.sunrise && data.sunset) {
      let sunriseTime, sunsetTime

      if (typeof data.sunrise === 'string' && data.sunrise.includes(':')) {
        // 和风天气格式：HH:MM 字符串
        $('#sunrise').textContent = data.sunrise
        $('#sunset').textContent = data.sunset
        // 解析为今天的 Date 对象
        const today = new Date()
        const [rH, rM] = data.sunrise.split(':').map(Number)
        const [sH, sM] = data.sunset.split(':').map(Number)
        sunriseTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), rH, rM)
        sunsetTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), sH, sM)
      } else {
        // OpenWeatherMap 格式：Unix 时间戳
        sunriseTime = roundToMinute(new Date(data.sunrise * 1000))
        sunsetTime = roundToMinute(new Date(data.sunset * 1000))
        $('#sunrise').textContent = fmtTime(sunriseTime)
        $('#sunset').textContent = fmtTime(sunsetTime)
      }

      state.sunriseAt = sunriseTime
      state.sunsetAt = sunsetTime
    }

    // 位置名称：优先使用反向地理，备用 Worker 返回的城市名
    const name = await resolveLocationName(lat, lon)
    $('#location').textContent = name || data.city || '当前位置'
    updateWeatherLine()

    // 输出数据源信息
    if (data.source) {
      console.log(`Weather data from: ${data.source}`)
    }
  } catch (e) {
    // 失败时回退到 Open-Meteo 作为备用
    console.warn('Weather Worker failed, trying fallback:', e)
    await fetchWeatherFallback(lat, lon)
  }
}

// 备用天气源：Open-Meteo（无需 API Key）
async function fetchWeatherFallback(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`
    const res = await fetch(url)
    if (!res.ok) throw new Error('备用天气请求失败')
    const data = await res.json()
    const cw = data.current_weather

    // Open-Meteo WMO codes 简化映射
    const wmoMap = {
      0: '晴', 1: '多云', 2: '多云', 3: '阴', 45: '雾', 48: '雾凇',
      51: '小雨', 53: '小到中雨', 55: '中雨', 56: '冻雨', 57: '冻雨',
      61: '小雨', 63: '中雨', 65: '大雨', 71: '小雪', 73: '中雪', 75: '大雪',
      80: '阵雨', 81: '阵雨', 82: '强阵雨', 95: '雷阵雨', 96: '雷雨冰雹', 99: '雷雨冰雹'
    }
    $('#weather-desc').textContent = wmoMap[cw.weathercode] || '天气'

    if (data.daily?.temperature_2m_max && data.daily?.temperature_2m_min) {
      const tmax = Math.round(data.daily.temperature_2m_max[0])
      const tmin = Math.round(data.daily.temperature_2m_min[0])
      $('#temp').textContent = `${tmin}°/${tmax}°C`
    }
    updateWeatherLine()

    if (data.daily?.sunrise && data.daily?.sunset) {
      const sunrise = roundToMinute(new Date(data.daily.sunrise[0]))
      const sunset = roundToMinute(new Date(data.daily.sunset[0]))
      $('#sunrise').textContent = fmtTime(sunrise)
      $('#sunset').textContent = fmtTime(sunset)
      state.sunriseAt = sunrise
      state.sunsetAt = sunset
    }

    const name = await resolveLocationName(lat, lon)
    $('#location').textContent = name || '当前位置'
    updateWeatherLine()
  } catch (e) {
    $('#weather-desc').textContent = '天气不可用'
    $('#location').textContent = '当前位置'
    updateWeatherLine()
    console.warn('Fallback weather also failed:', e)
  }
}

async function initGeoWeather() {
  try {
    const locResult = await getLocation()
    const { lat, lon, city, source } = locResult
    state.lat = lat; state.lon = lon

    // 如果是 IP 定位，显示提示
    if (source === 'ip') {
      console.log('Using IP-based geolocation:', city || `${lat.toFixed(2)}, ${lon.toFixed(2)}`)
    }

    await fetchWeather(lat, lon)

    // 如果是 IP 定位且有城市名，优先使用
    if (source === 'ip' && city) {
      const locEl = $('#location')
      if (locEl && locEl.textContent === '当前位置') {
        locEl.textContent = city
        updateWeatherLine()
      }
    }

    // Fallback for sunrise/sunset if API not returned
    if ($('#sunrise').textContent.includes('—')) {
      const today = new Date()
      const { sunrise, sunset } = sunriseSunset(today, lat, lon)
      const s1 = roundToMinute(sunrise), s2 = roundToMinute(sunset)
      $('#sunrise').textContent = fmtTime(s1)
      $('#sunset').textContent = fmtTime(s2)
      state.sunriseAt = s1; state.sunsetAt = s2
    }
  } catch (e) {
    console.warn('Geolocation failed, using Beijing as fallback:', e)
    // 定位失败时使用北京作为默认城市
    const bj = { lat: 39.9042, lon: 116.4074 }
    state.lat = bj.lat
    state.lon = bj.lon

    // 尝试获取北京的天气
    try {
      await fetchWeather(bj.lat, bj.lon)
      // 如果 fetchWeather 成功会设置位置名称，这里覆盖为北京（表示是默认值）
      const locEl = $('#location')
      if (locEl && !locEl.textContent.includes('北京')) {
        locEl.textContent = '北京'
        updateWeatherLine()
      }
    } catch (weatherErr) {
      console.warn('Weather fetch also failed:', weatherErr)
      $('#weather-desc').textContent = '定位不可用'
      $('#location').textContent = '北京'
      updateWeatherLine()
      // 使用本地算法计算日出日落作为最终兜底
      const { sunrise, sunset } = sunriseSunset(new Date(), bj.lat, bj.lon)
      const s1 = roundToMinute(sunrise), s2 = roundToMinute(sunset)
      $('#sunrise').textContent = fmtTime(s1)
      $('#sunset').textContent = fmtTime(s2)
      state.sunriseAt = s1
      state.sunsetAt = s2
    }
  }
}

// 允许点击天气区域手动重试定位
async function retryGeoWeather() {
  const locEl = document.getElementById('location')
  const descEl = document.getElementById('weather-desc')
  const tempEl = document.getElementById('temp')
  const lineEl = document.getElementById('weather-line')
  try {
    if (locEl) locEl.textContent = '定位中…'
    if (descEl) descEl.textContent = '获取天气…'
    if (tempEl) tempEl.textContent = ''
    if (lineEl) lineEl.textContent = '定位中…'
    const { lat, lon } = await getLocation()
    state.lat = lat; state.lon = lon
    await fetchWeather(lat, lon)
  } catch (e) {
    if (descEl) descEl.textContent = '定位失败，点击重试'
    if (locEl) locEl.textContent = '当前位置'
    updateWeatherLine()
    console.warn('retryGeoWeather failed', e)
  }
}

// ---------------- Controls ----------------
// Cross-device tap binding to ensure mobile responsiveness
function bindTap(el, handler) {
  if (!el) return

  // For Android Chrome, use a simple approach
  const isAndroid = /Android/i.test(navigator.userAgent)

  if (isAndroid) {
    // Simple Android-specific handling
    el.addEventListener('touchend', (e) => {
      e.preventDefault()
      e.stopPropagation()
      handler(e)
    }, { passive: false })

    // Backup click handler
    el.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      handler(e)
    })
    return
  }

  // For other devices, use pointer events if available
  const supportsPointer = typeof window !== 'undefined' && 'PointerEvent' in window
  if (supportsPointer) {
    el.addEventListener('pointerup', (e) => {
      // Only react to primary pointer
      if (e.button != null && e.button !== 0) return
      handler(e)
    }, { passive: true })
  } else {
    // iOS fallback
    let touched = false
    let touchStartTime = 0
    el.addEventListener('touchstart', (e) => {
      touchStartTime = Date.now()
      touched = true
    }, { passive: true })
    el.addEventListener('touchend', (e) => {
      // Ensure it's a quick tap (not a long press or scroll)
      if (Date.now() - touchStartTime < 500) {
        e.preventDefault()
        handler(e)
      }
      setTimeout(() => { touched = false }, 100)
    }, { passive: false })
    el.addEventListener('click', (e) => {
      if (!touched) {
        handler(e)
      }
    })
  }
}

function initControls() {
  const updateSeg = () => {
    const a = state.use24h
    const b12 = document.getElementById('btn-12h')
    const b24 = document.getElementById('btn-24h')
    const bSec = document.getElementById('btn-sec')
    if (b12 && b24) {
      b12.classList.toggle('active', !a)
      b24.classList.toggle('active', a)
    }
    if (bSec) { bSec.classList.toggle('active', state.showSeconds) }
  }
  const refreshNow = () => {
    const now = new Date(); renderBigTime(pad2(state.use24h ? now.getHours() : (now.getHours() % 12 || 12)), pad2(now.getMinutes()), pad2(now.getSeconds()))
  }
  const btn12 = document.getElementById('btn-12h')
  const btn24 = document.getElementById('btn-24h')
  const btnSec = document.getElementById('btn-sec')
  const btnFS = document.getElementById('btn-fs')
  bindTap(btn12, () => { state.use24h = false; updateSeg(); refreshNow() })
  bindTap(btn24, () => { state.use24h = true; updateSeg(); refreshNow() })
  bindTap(btnSec, () => {
    state.showSeconds = !state.showSeconds
    updateSeg();
    // 控制翻页时钟秒位可见性（即使默认隐藏）
    document.querySelectorAll('[data-slot^="s"]').forEach(el => {
      el.style.display = state.showSeconds ? '' : 'none'
    })
    const colons = document.querySelectorAll('.colon')
    if (colons[1]) colons[1].style.display = state.showSeconds ? '' : 'none'
    refreshNow()
  })
  bindTap(btnFS, async () => {
    try {
      const docEl = document.documentElement
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches

      if (isIOS) {
        if (isStandalone) {
          // Already in PWA mode, simulate fullscreen by hiding/showing interface elements
          document.body.classList.toggle('ios-fullscreen')
          btnFS.textContent = document.body.classList.contains('ios-fullscreen') ? '退出' : '全屏'
        } else {
          // Not in PWA mode, guide user to add to home screen
          if (btnFS.textContent === '全屏') {
            btnFS.textContent = '提示'
            setTimeout(() => {
              alert('在iOS Safari中，请点击分享按钮 → "添加到主屏幕"，然后从主屏幕打开应用以获得全屏体验。')
              btnFS.textContent = '全屏'
            }, 100)
          }
        }
        return
      }

      // Standard fullscreen API for other browsers
      const enter = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.msRequestFullscreen
      const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen

      // Check fullscreen state
      const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement)

      if (!isFullscreen) {
        if (enter) {
          if (docEl.webkitRequestFullscreen) {
            await docEl.webkitRequestFullscreen()
          } else {
            await enter.call(docEl)
          }
        }
        // 尝试横屏（可能被系统拒绝，不影响使用）
        if (screen.orientation && screen.orientation.lock) {
          try { await screen.orientation.lock('landscape') } catch (e) { }
        }
      } else if (exit) {
        if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen()
        } else {
          await exit.call(document)
        }
      }
    } catch (e) {
      console.warn('fullscreen failed', e)
      // If fullscreen fails, provide user guidance
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        alert('iOS设备请将网页添加到主屏幕以获得更好的全屏体验。')
      }
    }
  })
  // Listen for fullscreen changes with webkit compatibility
  const fullscreenEvents = ['fullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange']
  fullscreenEvents.forEach(event => {
    document.addEventListener(event, () => {
      const fs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement)
      if (btnFS) btnFS.textContent = fs ? '退出' : '全屏'
    })
  })


  // 兼容：底部开关可能不存在
  const legacy24 = document.getElementById('toggle-24h')
  if (legacy24) bindTap(legacy24, () => { state.use24h = !state.use24h; updateSeg(); refreshNow() })
  const legacySec = document.getElementById('toggle-seconds')
  if (legacySec) bindTap(legacySec, () => { state.showSeconds = !state.showSeconds; updateSeg(); refreshNow() })
  // 初始化一次分段按钮状态
  updateSeg()
  bindTap($('#toggle-theme'), () => {
    const next = state.themeMode === 'dark' ? 'light' : 'dark'
    setTheme(next)
  })
}

// ---------------- Optional: 网络时间同步（尽量不依赖） ----------------
async function tryNetworkTimeSync() {
  try {
    if (location.protocol === 'file:') return // 本地 file 协议跳过网络对时，避免控制台报错
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 2500)
    const res = await fetch('https://worldtimeapi.org/api/ip', { signal: controller.signal })
    clearTimeout(t)
    if (res.ok) {
      const data = await res.json()
      const serverNow = Date.parse(data.datetime || data.utc_datetime)
      if (!isNaN(serverNow)) {
        state.offsetMs = serverNow - Date.now()
      }
    }
  } catch (e) { /* 忽略失败，继续用本机时间 */ }
}

// ---------------- Init ----------------
document.addEventListener('DOMContentLoaded', () => {
  // 应用 URL / 本地存储中的可见性配置
  loadVisibilityPrefs()
  applyVisibility()
  // 将 URL 覆盖结果持久化
  saveVisibilityPrefs()
  // default theme
  setTheme(state.themeMode)
  updateThemeButtonLabel()
  initClock()
  initControls()
  initSettingsPanel()
  initGeoWeather()
  // Click to retry geolocation/weather on the weather area
  const w = document.querySelector('.weather-wrap')
  if (w) {
    w.setAttribute('title', '点击重新获取定位与天气')
    w.setAttribute('role', 'button')
    w.style.cursor = 'pointer'
    w.tabIndex = 0
    bindTap(w, retryGeoWeather)
    w.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); retryGeoWeather() } })
  }
  renderSolarTerms(new Date())
  // Update solar terms at midnight
  const schedule = () => {
    const now = new Date(); const next = new Date(now); next.setHours(24, 0, 0, 100)
    setTimeout(() => {
      renderSolarTerms(new Date());
      if (state.lat != null && state.lon != null) { fetchWeather(state.lat, state.lon) }
      schedule()
    }, next - now)
  }
  schedule()
})

// ---------------- Visibility config (URL + localStorage) ----------------
function parseBool(v) {
  if (v == null) return null
  const s = String(v).toLowerCase()
  if (['1', 'true', 'yes', 'on', 'show'].includes(s)) return true
  if (['0', 'false', 'no', 'off', 'hide'].includes(s)) return false
  return null
}
function loadVisibilityPrefs() {
  // 本地存储
  try {
    const saved = localStorage.getItem('desktopClock.uiVisibility')
    if (saved) {
      const obj = JSON.parse(saved)
      Object.assign(state.ui, obj)
      // 迁移旧字段：dateChips -> week/greg/lunar
      if (Object.prototype.hasOwnProperty.call(obj, 'dateChips')) {
        state.ui.week = !!obj.dateChips
        state.ui.greg = !!obj.dateChips
        state.ui.lunar = !!obj.dateChips
      }
    }
  } catch (e) { }
  // URL 覆盖（优先级更高）
  const sp = new URLSearchParams(location.search)
  const keys = [
    ['toolbar', 'toolbar'],
    ['week', 'week'],
    ['greg', 'greg'],
    ['lunar', 'lunar'],
    ['weather', 'weather'],
    ['solar', 'solar'],
    ['sun', 'sun'],
  ]
  for (const [k, alias] of keys) {
    const bv = parseBool(sp.get(k) ?? sp.get(alias))
    if (bv != null) state.ui[k] = bv
  }
  // 兼容旧的 meta 参数：同时控制 solar + sun
  const legacyMeta = parseBool(sp.get('meta'))
  if (legacyMeta != null) { state.ui.solar = legacyMeta; state.ui.sun = legacyMeta }
  // 兼容旧 chips 参数：同时控制三枚日期胶囊
  const legacyChips = parseBool(sp.get('chips') ?? sp.get('dateChips'))
  if (legacyChips != null) { state.ui.week = legacyChips; state.ui.greg = legacyChips; state.ui.lunar = legacyChips }
}
function saveVisibilityPrefs() {
  try { localStorage.setItem('desktopClock.uiVisibility', JSON.stringify(state.ui)) } catch (e) { }
}
function applyVisibility() {
  const toolbar = document.querySelector('.toolbar')
  const chips = document.querySelector('.dual-date')
  const weather = document.querySelector('.weather-wrap')
  if (toolbar) toolbar.classList.toggle('hidden', !state.ui.toolbar)
  // 单独控制三枚日期胶囊
  const cw = document.getElementById('big-week')
  const cg = document.getElementById('big-gdate')
  const cl = document.getElementById('big-ldate')
  if (cw) cw.classList.toggle('hidden', !state.ui.week)
  if (cg) cg.classList.toggle('hidden', !state.ui.greg)
  if (cl) cl.classList.toggle('hidden', !state.ui.lunar)
  if (chips) {
    const any = (!!cw && !cw.classList.contains('hidden')) || (!!cg && !cg.classList.contains('hidden')) || (!!cl && !cl.classList.contains('hidden'))
    chips.classList.toggle('hidden', !any)
  }
  if (weather) weather.classList.toggle('hidden', !state.ui.weather)
  document.querySelectorAll('.meta .meta-item.solar').forEach(el => {
    el.classList.toggle('hidden', !state.ui.solar)
  })
  document.querySelectorAll('.meta .meta-item.sun').forEach(el => {
    el.classList.toggle('hidden', !state.ui.sun)
  })
  const metaWrap = document.querySelector('.meta')
  if (metaWrap) {
    const anyMeta = Array.from(metaWrap.querySelectorAll('.meta-item')).some(el => !el.classList.contains('hidden'))
    metaWrap.classList.toggle('hidden', !anyMeta)
  }
  // 若某一组全部隐藏，仍能居中：由 CSS auto-fit + justify-content:center 负责。
}

// ---------------- Settings panel ----------------
function initSettingsPanel() {
  const dlg = document.getElementById('settings')
  const btn = document.getElementById('btn-settings')
  const btnClose = document.getElementById('settings-close')
  const map = {
    toolbar: document.getElementById('opt-toolbar'),
    week: document.getElementById('opt-week'),
    greg: document.getElementById('opt-greg'),
    lunar: document.getElementById('opt-lunar'),
    weather: document.getElementById('opt-weather'),
    solar: document.getElementById('opt-solar'),
    sun: document.getElementById('opt-sun'),
  }
  const syncUI = () => {
    for (const k in map) { if (map[k]) map[k].checked = !!state.ui[k] }
  }
  function isSmallScreen() { return window.innerWidth <= 480 || (window.matchMedia && window.matchMedia('(max-width: 480px)').matches) }
  function positionCard() {
    const card = dlg.querySelector('.settings-card')
    if (isSmallScreen()) {
      dlg.classList.add('bottom')
      card.style.left = '0px'; card.style.right = '0px'; card.style.bottom = '0px'; card.style.top = 'auto';
      card.style.visibility = ''; card.style.display = ''
      return
    }
    dlg.classList.remove('bottom')
    const rect = btn.getBoundingClientRect()
    const vw = window.innerWidth, vh = window.innerHeight
    // 先显示以便测量尺寸
    card.style.visibility = 'hidden'; card.style.display = 'block'
    const cw = card.offsetWidth, ch = card.offsetHeight
    const margin = 8
    let left = Math.min(Math.max(rect.right - cw, margin), vw - cw - margin)
    let top = Math.min(rect.bottom + 4, vh - ch - margin)  // 减少gap到4px
    // 若按钮接近左边则跟随左侧
    if (rect.left + cw + margin < vw) left = Math.max(rect.left, margin)
    card.style.left = left + 'px'
    card.style.top = top + 'px'
    card.style.visibility = ''
  }
  const open = () => { syncUI(); dlg.classList.remove('hidden'); requestAnimationFrame(positionCard) }
  const close = () => { dlg.classList.add('hidden') }
  if (btn) {
    console.log('Settings button found, binding tap event')
    bindTap(btn, () => {
      console.log('Settings button tapped, opening panel')
      open()
    })

    // Additional Android fallback - direct event binding
    if (/Android/i.test(navigator.userAgent)) {
      btn.onclick = (e) => {
        console.log('Settings button clicked (fallback), opening panel')
        e.preventDefault()
        e.stopPropagation()
        open()
      }
    }
  } else {
    console.log('Settings button NOT found')
  }
  if (btnClose) bindTap(btnClose, close)
  // 点击遮罩关闭
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close() })
  window.addEventListener('resize', () => { if (!dlg.classList.contains('hidden')) positionCard() })
  window.addEventListener('orientationchange', () => { if (!dlg.classList.contains('hidden')) setTimeout(positionCard, 300) })
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close() })
  // 兜底：在大时间区域双击打开设置（避免工具栏隐藏后无入口）
  const big = document.getElementById('big-time')
  if (big) {
    let lastTap = 0
    // Use bindTap for better compatibility instead of direct pointerup
    const handleDoubleTap = () => {
      const now = Date.now()
      if (now - lastTap < 400) {
        open();
        lastTap = 0
      } else {
        lastTap = now
      }
    }
    // Try touch events first for mobile compatibility
    if ('ontouchstart' in window) {
      big.addEventListener('touchend', handleDoubleTap, { passive: true })
    } else {
      big.addEventListener('pointerup', handleDoubleTap, { passive: true })
    }
  }
  // 切换
  for (const k in map) {
    const el = map[k]
    if (!el) continue
    el.addEventListener('change', () => {
      state.ui[k] = !!el.checked
      saveVisibilityPrefs(); applyVisibility()
    })
  }
}
