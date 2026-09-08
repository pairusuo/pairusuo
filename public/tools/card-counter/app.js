const STORAGE_COUNTS = 'poker_counter_counts'; // up-count mode (legacy key kept)
const STORAGE_COUNTS_DOWN = 'poker_counter_counts_down'; // reverse-count mode
const STORAGE_DECKS_UP = 'poker_counter_decks_up';
const STORAGE_DECKS_DOWN = 'poker_counter_decks_down';
const CARDS = [
  { id: '3', baseCap: 4 },
  { id: '4', baseCap: 4 },
  { id: '5', baseCap: 4 },
  { id: '6', baseCap: 4 },
  { id: '7', baseCap: 4 },
  { id: '8', baseCap: 4 },
  { id: '9', baseCap: 4 },
  { id: '10', baseCap: 4 },
  { id: 'J', baseCap: 4 },
  { id: 'Q', baseCap: 4 },
  { id: 'K', baseCap: 4 },
  { id: 'A', baseCap: 4 },
  { id: '2', baseCap: 4 },
  { id: 'joker_small', baseCap: 1 },
  { id: 'joker_big', baseCap: 1 },
];

const grid = document.getElementById('grid'); // up-count grid
const gridDown = document.getElementById('gridDown'); // reverse-count grid
const resetUpBtn = document.getElementById('resetUp');
const resetDownBtn = document.getElementById('resetDown');
// Up stepper
const deckDecUpBtn = document.getElementById('deckDecUp');
const deckIncUpBtn = document.getElementById('deckIncUp');
const deckValUpEl = document.getElementById('deckValUp');
// Down stepper
const deckDecDownBtn = document.getElementById('deckDecDown');
const deckIncDownBtn = document.getElementById('deckIncDown');
const deckValDownEl = document.getElementById('deckValDown');
const MIN_DECKS = 1;
const MAX_DECKS = 8;
// Using explicit decrement button instead of double-tap

let deckCountUp = loadDecks(STORAGE_DECKS_UP);
let deckCountDown = loadDecks(STORAGE_DECKS_DOWN);
updateDeckDisplayUp();
updateDeckDisplayDown();
let counts = loadCounts(); // up-counts
let countsDown = loadCountsDown(); // remaining counts (reverse)

// simple click sound using Web Audio API
let _audioCtx;
function audioCtx(){
  if (!_audioCtx) {
    // @ts-ignore
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _audioCtx;
}
function beep(freq=660, dur=0.06, vol=0.15){
  try{
    const ctx = audioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  }catch{}
}
function clickSoundUp(){ beep(760, 0.05, 0.16); }
function clickSoundDown(){ beep(520, 0.05, 0.16); }

function capForUp(cardId){
  const card = CARDS.find(c => c.id === cardId);
  const base = card ? card.baseCap : 0;
  return base * deckCountUp;
}
function capForDown(cardId){
  const card = CARDS.find(c => c.id === cardId);
  const base = card ? card.baseCap : 0;
  return base * deckCountDown;
}

function loadCounts(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_COUNTS) || '{}') || {}; }catch{ return {}; }
}
function saveCounts(){
  try{ localStorage.setItem(STORAGE_COUNTS, JSON.stringify(counts)); }catch{}
}
function loadCountsDown(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_COUNTS_DOWN) || '{}') || {}; }catch{ return {}; }
}
function saveCountsDown(){
  try{ localStorage.setItem(STORAGE_COUNTS_DOWN, JSON.stringify(countsDown)); }catch{}
}
function loadDecks(key){
  const n = Number(localStorage.getItem(key) || '1');
  let v = Number.isFinite(n) && n > 0 ? Math.floor(n) : MIN_DECKS;
  if (v < MIN_DECKS) v = MIN_DECKS; if (v > MAX_DECKS) v = MAX_DECKS; // clamp to [1,8]
  return v;
}
function saveDecks(key, value){
  try{ localStorage.setItem(key, String(value)); }catch{}
}

function updateDeckDisplayUp(){
  if (deckValUpEl) deckValUpEl.textContent = String(deckCountUp);
  updateStepperUp();
}

function updateDeckDisplayDown(){
  if (deckValDownEl) deckValDownEl.textContent = String(deckCountDown);
  updateStepperDown();
}

function updateStepperUp(){
  if (deckDecUpBtn) deckDecUpBtn.disabled = deckCountUp <= MIN_DECKS;
  if (deckIncUpBtn) deckIncUpBtn.disabled = deckCountUp >= MAX_DECKS;
}
function updateStepperDown(){
  if (deckDecDownBtn) deckDecDownBtn.disabled = deckCountDown <= MIN_DECKS;
  if (deckIncDownBtn) deckIncDownBtn.disabled = deckCountDown >= MAX_DECKS;
}

function setDeckCountUp(n){
  const clamped = Math.max(MIN_DECKS, Math.min(MAX_DECKS, Math.floor(Number(n)||MIN_DECKS)));
  if (clamped === deckCountUp) { updateDeckDisplayUp(); return; }
  deckCountUp = clamped;
  saveDecks(STORAGE_DECKS_UP, deckCountUp);
  clampCountsToCaps();
  saveCounts();
  updateDeckDisplayUp();
  // Ensure UI一致，直接全量刷新
  render();
}

function setDeckCountDown(n){
  const clamped = Math.max(MIN_DECKS, Math.min(MAX_DECKS, Math.floor(Number(n)||MIN_DECKS)));
  if (clamped === deckCountDown) { updateDeckDisplayDown(); return; }
  const oldDecks = deckCountDown;
  const newDecks = clamped;
  // 根据“已经点击次数”进行换算：newRemaining = newCap - clicks
  // clicks = oldCap - oldRemaining
  CARDS.forEach(c => {
    const base = c.baseCap || 0;
    const oldCap = base * oldDecks;
    const newCap = base * newDecks;
    const oldRemaining = numberOr(oldCap, countsDown[c.id]);
    const clicks = Math.max(0, oldCap - oldRemaining);
    const newRemaining = Math.max(0, Math.min(newCap, newCap - clicks));
    countsDown[c.id] = newRemaining;
  });
  deckCountDown = newDecks;
  saveDecks(STORAGE_DECKS_DOWN, deckCountDown);
  saveCountsDown();
  updateDeckDisplayDown();
  render();
}

function clampCountsToCaps(){
  for(const c of CARDS){
    const cap = capForUp(c.id);
    const v = Number(counts[c.id] || 0);
    if (v > cap) counts[c.id] = cap;
  }
}

function clampCountsDownToCaps(){
  for(const c of CARDS){
    const cap = capForDown(c.id);
    let v = countsDown[c.id];
    if (v == null) { countsDown[c.id] = cap; continue; }
    v = Number(v || 0);
    if (v > cap) countsDown[c.id] = cap;
    if (v < 0) countsDown[c.id] = 0;
  }
}

function render(){
  // Up-count section
  grid.innerHTML = '';
  CARDS.forEach(c => {
    const cap = capForUp(c.id);
    const v = Number(counts[c.id] || 0);
    const el = document.createElement('button');
    el.className = 'card';
    el.setAttribute('data-id', c.id);
    el.setAttribute('aria-label', t('card.ariaCount', { label: getLabel(c.id), v, cap }));
    const rankClass = c.id === 'joker_small' ? 'rank joker-small' : (c.id === 'joker_big' ? 'rank joker-big' : 'rank');
    el.innerHTML = `
      <div class="${rankClass}">${getLabel(c.id)}</div>
      <div class="badge" data-badge>${v}</div>
      <button class="dec-btn" type="button" title="${t('card.dec')}" aria-label="${t('card.dec')}" data-dec>−</button>
      <div class="cap" data-cap>${v}/${cap}</div>
    `;
    if (v >= cap) el.classList.add('at-cap');
    el.addEventListener('click', () => onCardClick(c.id, el));
    const dec = el.querySelector('[data-dec]');
    if (dec){
      dec.addEventListener('click', (e) => { e.stopPropagation(); onCardDecrement(c.id, el); });
    }
    grid.appendChild(el);
  });

  // Reverse-count section
  if (gridDown){
    gridDown.innerHTML = '';
    CARDS.forEach(c => {
      const cap = capForDown(c.id);
      const v = numberOr(cap, countsDown[c.id]);
      const el = document.createElement('button');
      el.className = 'card card-down';
      el.setAttribute('data-id', c.id);
      el.setAttribute('aria-label', t('card.ariaCount', { label: getLabel(c.id), v, cap }));
      const rankClass = c.id === 'joker_small' ? 'rank joker-small' : (c.id === 'joker_big' ? 'rank joker-big' : 'rank');
      el.innerHTML = `
        <div class="${rankClass}">${getLabel(c.id)}</div>
        <div class="badge" data-badge>${v}</div>
        <button class="inc-btn" type="button" title="${t('card.inc')||'加一'}" aria-label="${t('card.inc')||'加一'}" data-inc>＋</button>
        <div class="cap" data-cap>${v}/${cap}</div>
      `;
      if (v <= 0) el.classList.add('at-cap');
      el.addEventListener('click', () => onCardDownDecrement(c.id, el));
      const inc = el.querySelector('[data-inc]');
      if (inc){
        inc.addEventListener('click', (e) => { e.stopPropagation(); onCardDownIncrement(c.id, el); });
      }
      gridDown.appendChild(el);
    });
  }
}

function updateCardUI(id, el){
  const v = Number(counts[id] || 0);
  const cap = capForUp(id);
  const badge = el.querySelector('[data-badge]');
  const capEl = el.querySelector('[data-cap]');
  if (badge) badge.textContent = String(v);
  if (capEl) capEl.textContent = `${v}/${cap}`;
  el.setAttribute('aria-label', t('card.ariaCount', { label: getLabel(id), v, cap }));
  if (v >= cap) el.classList.add('at-cap'); else el.classList.remove('at-cap');
}

function getLabel(id){
  return (typeof t === 'function') ? t('card.label.' + id) : id;
}

function onCardClick(id, el){
  const v = Number(counts[id] || 0);
  const cap = capForUp(id);
  if (v >= cap){
    el.classList.remove('hit-cap');
    requestAnimationFrame(() => { el.classList.add('hit-cap'); });
    return;
  }
  counts[id] = v + 1;
  saveCounts();
  updateCardUI(id, el);
  clickSoundUp();
}

function onCardDecrement(id, el){
  const v = Number(counts[id] || 0);
  if (v <= 0){
    el.classList.remove('hit-cap');
    requestAnimationFrame(() => { el.classList.add('hit-cap'); });
    return;
  }
  counts[id] = v - 1;
  saveCounts();
  updateCardUI(id, el);
  clickSoundDown();
}

function numberOr(defaultVal, v){
  const n = Number(v);
  return Number.isFinite(n) ? n : defaultVal;
}

// Reverse mode UI updates and handlers
function updateCardDownUI(id, el){
  const cap = capForDown(id);
  const v = numberOr(cap, countsDown[id]);
  const badge = el.querySelector('[data-badge]');
  const capEl = el.querySelector('[data-cap]');
  if (badge) badge.textContent = String(v);
  if (capEl) capEl.textContent = `${v}/${cap}`;
  el.setAttribute('aria-label', t('card.ariaCount', { label: getLabel(id), v, cap }));
  if (v <= 0) el.classList.add('at-cap'); else el.classList.remove('at-cap');
}
function onCardDownDecrement(id, el){
  const cap = capForDown(id);
  const v = numberOr(cap, countsDown[id]);
  if (v <= 0){
    el.classList.remove('hit-cap');
    requestAnimationFrame(() => { el.classList.add('hit-cap'); });
    return;
  }
  countsDown[id] = v - 1;
  saveCountsDown();
  updateCardDownUI(id, el);
  clickSoundDown();
}
function onCardDownIncrement(id, el){
  const cap = capForDown(id);
  const v = numberOr(cap, countsDown[id]);
  if (v >= cap){
    el.classList.remove('hit-cap');
    requestAnimationFrame(() => { el.classList.add('hit-cap'); });
    return;
  }
  countsDown[id] = v + 1;
  saveCountsDown();
  updateCardDownUI(id, el);
  clickSoundUp();
}

// Independent reset buttons
if (resetUpBtn) resetUpBtn.addEventListener('click', () => {
  // 重置上方：计数清零，副牌数回到 1
  counts = {};
  saveCounts();
  setDeckCountUp(1);
  render();
});

if (resetDownBtn) resetDownBtn.addEventListener('click', () => {
  // 重置下方：计数恢复为满（cap），副牌数回到 1
  setDeckCountDown(1);
  countsDown = {};
  clampCountsDownToCaps();
  saveCountsDown();
  render();
});

if (deckDecUpBtn) deckDecUpBtn.addEventListener('click', () => setDeckCountUp(deckCountUp - 1));
if (deckIncUpBtn) deckIncUpBtn.addEventListener('click', () => setDeckCountUp(deckCountUp + 1));
if (deckDecDownBtn) deckDecDownBtn.addEventListener('click', () => setDeckCountDown(deckCountDown - 1));
if (deckIncDownBtn) deckIncDownBtn.addEventListener('click', () => setDeckCountDown(deckCountDown + 1));

// init
clampCountsToCaps();
clampCountsDownToCaps();
render();
