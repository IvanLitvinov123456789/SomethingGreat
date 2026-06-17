"use strict";

/* Market Empire v0.3.3 — mobile map build. No backend required. */

const STORAGE_KEY = "market_empire_v03";
const OLD_STORAGE_KEY = "market_boss_mvp_v1";
const SAVE_VERSION = 3;

const CONFIG = {
  startBalance: 180000,
  commissionRate: 0.15,
  productLogistics: 92,
  returnLogistics: 75,
  pvzParcelFee: 48,
  shareInertia: 0.16,
  captureShare: 50,
  captureDays: 3,
  captureMinPvz: 2,
  captureMinRating: 4.25,
  dominanceShare: 70,
  loseControlShare: 40,
  contestedShare: 25,
  maxPriceRatio: 1.8,
  dailyMarketVolatility: 0.025,
  cityParcelScale: 0.00062,
  localAdCost: 18000,
  localAdDays: 5,
  localAdInfluence: 42,
  cardUpgradeCost: 14000,
  colors: ["#14b8a6", "#3b82f6", "#22c55e", "#8b5cf6", "#f97316", "#ec4899"]
};

const COMPETITORS = {
  lowprice: { id: "lowprice", name: "LowPrice", color: "#ef4444", strategy: "Демпинг", priceBias: 0.9, service: 0.82 },
  premium: { id: "premium", name: "PremiumBox", color: "#a855f7", strategy: "Премиум", priceBias: 1.16, service: 1.17 },
  fastgo: { id: "fastgo", name: "FastGo", color: "#3b82f6", strategy: "Логистика", priceBias: 1.02, service: 1.12 },
  local: { id: "local", name: "Локальные сети", color: "#64748b", strategy: "Лояльность", priceBias: 1, service: 0.96 }
};

const PRODUCTS = [
  { id: "case", emoji: "📱", name: "Чехол для телефона", category: "Аксессуары", type: "stable", cost: 175, marketPrice: 590, baseDemand: 11, competition: 8, returnRate: 0.04, priceSensitivity: 1.18 },
  { id: "lamp", emoji: "💡", name: "Настольная лампа", category: "Дом", type: "stable", cost: 760, marketPrice: 1690, baseDemand: 7, competition: 5, returnRate: 0.06, priceSensitivity: 0.92 },
  { id: "bottle", emoji: "🥤", name: "Спортивная бутылка", category: "Спорт", type: "competitive", cost: 310, marketPrice: 890, baseDemand: 8, competition: 6, returnRate: 0.05, priceSensitivity: 1.03 },
  { id: "headphones", emoji: "🎧", name: "Bluetooth-наушники", category: "Электроника", type: "competitive", cost: 940, marketPrice: 2290, baseDemand: 10, competition: 9, returnRate: 0.11, priceSensitivity: 1.12 },
  { id: "organizer", emoji: "🧺", name: "Органайзер для дома", category: "Дом", type: "stable", cost: 410, marketPrice: 1190, baseDemand: 7, competition: 4, returnRate: 0.03, priceSensitivity: 0.88 },
  { id: "miniPrinter", emoji: "🖨️", name: "Карманный мини-принтер", category: "Гаджеты", type: "trend", cost: 1190, marketPrice: 2990, baseDemand: 5, competition: 7, returnRate: 0.09, priceSensitivity: 0.98 }
];

const DISTRICTS = [
  {
    id: "south", name: "Южный", subtitle: "Стартовый район", population: 74000, income: 0.92, rent: 0.84, priceSensitivity: 1.05, serviceSensitivity: 0.92,
    bonusTitle: "Надёжная база", bonusText: "+8% к стабильному потоку заказов в районе", bonusType: "demand", bonusValue: 0.08,
    neighbors: ["industrial", "central", "university"], polygon: "45,500 75,545 170,590 270,575 385,590 500,600 540,670 520,740 420,785 300,790 210,770 120,735 70,690 48,610", label: [275,680],
    initialShares: { player: 24, lowprice: 35, premium: 9, fastgo: 19, local: 13 },
    sites: [
      { id:"s1", x:180, y:570, kind:"pvz", owner:"player", label:"Южный-1", traffic:1.05, rent:1250 },
      { id:"s2", x:330, y:548, kind:"pvz", owner:"lowprice", label:"LowPrice", traffic:1.2, rent:1500 },
      { id:"s3", x:405, y:640, kind:"pvz", owner:"fastgo", label:"FastGo", traffic:1.08, rent:1370 },
      { id:"s4", x:260, y:705, kind:"pvz", owner:null, label:"У парка", traffic:.88, rent:980 },
      { id:"s5", x:120, y:655, kind:"pvz", owner:null, label:"Жилой квартал", traffic:.78, rent:820 },
      { id:"s6", x:350, y:735, kind:"pvz", owner:"local", label:"Посылка рядом", traffic:.82, rent:900 },
      { id:"sw1", x:470, y:720, kind:"warehouse", owner:"player", label:"Малый склад", traffic:.7, rent:1650 }
    ]
  },
  {
    id: "university", name: "Университетский", subtitle: "Молодая аудитория", population: 69000, income: 0.84, rent: 0.98, priceSensitivity: 1.22, serviceSensitivity: 0.83,
    bonusTitle: "Молодой рынок", bonusText: "Трендовые товары и локальная реклама эффективнее", bonusType: "trend", bonusValue: 0.14,
    neighbors: ["south", "central", "north"], polygon: "55,300 120,270 210,230 340,205 325,300 300,410 290,500 270,575 170,590 75,545 45,500 40,400", label: [165,420],
    initialShares: { player: 2, lowprice: 40, premium: 8, fastgo: 20, local: 30 },
    sites: [
      { id:"u1", x:135, y:315, kind:"pvz", owner:"lowprice", label:"У кампуса", traffic:1.25, rent:1550 },
      { id:"u2", x:270, y:285, kind:"pvz", owner:"local", label:"СтудПост", traffic:1.05, rent:1220 },
      { id:"u3", x:315, y:405, kind:"pvz", owner:"fastgo", label:"FastGo", traffic:1.1, rent:1320 },
      { id:"u4", x:180, y:435, kind:"pvz", owner:null, label:"Общежития", traffic:.96, rent:1080 },
      { id:"u5", x:80, y:410, kind:"pvz", owner:null, label:"Старый корпус", traffic:.72, rent:760 },
      { id:"u6", x:240, y:360, kind:"pvz", owner:"lowprice", label:"LowPrice Mini", traffic:.93, rent:1010 }
    ]
  },
  {
    id: "central", name: "Центральный", subtitle: "Сердце города", population: 58000, income: 1.28, rent: 1.52, priceSensitivity: 0.9, serviceSensitivity: 1.2,
    bonusTitle: "Городская известность", bonusText: "+7% к влиянию магазина во всех открытых районах", bonusType: "brand", bonusValue: 0.07,
    neighbors: ["south", "university", "industrial", "elite", "north"], polygon: "340,205 430,220 520,210 590,220 675,235 700,325 730,430 745,510 760,575 640,585 500,600 385,590 270,575 290,500 300,410 325,300", label: [515,430],
    initialShares: { player: 0, lowprice: 17, premium: 38, fastgo: 31, local: 14 },
    sites: [
      { id:"c1", x:435, y:300, kind:"pvz", owner:"premium", label:"Premium Центр", traffic:1.35, rent:2450 },
      { id:"c2", x:580, y:285, kind:"pvz", owner:"fastgo", label:"FastGo Plaza", traffic:1.3, rent:2280 },
      { id:"c3", x:650, y:395, kind:"pvz", owner:"premium", label:"Premium Gallery", traffic:1.18, rent:2120 },
      { id:"c4", x:540, y:485, kind:"pvz", owner:null, label:"Деловая улица", traffic:1.24, rent:2200 },
      { id:"c5", x:420, y:455, kind:"pvz", owner:"local", label:"Центр-почта", traffic:.92, rent:1670 },
      { id:"c6", x:625, y:585, kind:"pvz", owner:null, label:"Набережная", traffic:1.08, rent:1900 },
      { id:"c7", x:495, y:610, kind:"pvz", owner:"lowprice", label:"LowPrice City", traffic:1.02, rent:1810 }
    ]
  },
  {
    id: "industrial", name: "Промышленный", subtitle: "Склады и транспорт", population: 43000, income: 0.9, rent: 0.68, priceSensitivity: 1.05, serviceSensitivity: 0.78,
    bonusTitle: "Логистический узел", bonusText: "−12% к расходам на городскую логистику", bonusType: "logistics", bonusValue: 0.12,
    neighbors: ["south", "central", "elite"], polygon: "500,600 640,585 760,575 920,525 1045,505 1080,600 1115,710 1030,760 900,790 780,805 670,800 520,740 540,670", label: [835,680],
    initialShares: { player: 0, lowprice: 29, premium: 5, fastgo: 48, local: 18 },
    sites: [
      { id:"i1", x:650, y:570, kind:"pvz", owner:"fastgo", label:"FastGo Cargo", traffic:1.05, rent:920 },
      { id:"i2", x:800, y:555, kind:"pvz", owner:"lowprice", label:"LowPrice", traffic:.9, rent:760 },
      { id:"i3", x:970, y:615, kind:"pvz", owner:"fastgo", label:"FastGo Восток", traffic:.88, rent:730 },
      { id:"i4", x:870, y:705, kind:"pvz", owner:null, label:"Заводская", traffic:.78, rent:580 },
      { id:"i5", x:710, y:735, kind:"pvz", owner:null, label:"Рабочий квартал", traffic:.75, rent:550 },
      { id:"iw1", x:1015, y:730, kind:"warehouse", owner:"fastgo", label:"Хаб FastGo", traffic:.8, rent:1500 },
      { id:"iw2", x:750, y:640, kind:"warehouse", owner:null, label:"Промышленный склад", traffic:.8, rent:1100 }
    ]
  },
  {
    id: "north", name: "Спальный", subtitle: "Большой жилой массив", population: 112000, income: 0.98, rent: 0.92, priceSensitivity: 1.08, serviceSensitivity: 1.02,
    bonusTitle: "Плотная сеть", bonusText: "+10% к потоку выдач в ПВЗ", bonusType: "pvz", bonusValue: 0.1,
    neighbors: ["university", "central", "elite"], polygon: "70,55 230,35 420,45 560,60 700,90 750,190 675,235 590,220 520,210 430,220 340,205 210,230 120,270 55,300 48,190", label: [350,125],
    initialShares: { player: 0, lowprice: 34, premium: 12, fastgo: 23, local: 31 },
    sites: [
      { id:"n1", x:165, y:95, kind:"pvz", owner:"local", label:"Соседский ПВЗ", traffic:1.05, rent:1040 },
      { id:"n2", x:315, y:80, kind:"pvz", owner:"lowprice", label:"LowPrice Север", traffic:1.12, rent:1180 },
      { id:"n3", x:455, y:92, kind:"pvz", owner:"fastgo", label:"FastGo", traffic:1.02, rent:1110 },
      { id:"n4", x:245, y:175, kind:"pvz", owner:"local", label:"У дома", traffic:.88, rent:870 },
      { id:"n5", x:410, y:180, kind:"pvz", owner:null, label:"Новый квартал", traffic:1.2, rent:1300 },
      { id:"n6", x:95, y:190, kind:"pvz", owner:null, label:"Северный парк", traffic:.8, rent:780 },
      { id:"n7", x:535, y:180, kind:"pvz", owner:"premium", label:"Premium North", traffic:.94, rent:1380 }
    ]
  },
  {
    id: "elite", name: "Элитный", subtitle: "Высокий средний чек", population: 31000, income: 1.65, rent: 1.68, priceSensitivity: 0.7, serviceSensitivity: 1.38,
    bonusTitle: "Премиальный спрос", bonusText: "+15% к спросу на дорогие товары", bonusType: "premium", bonusValue: 0.15,
    neighbors: ["central", "industrial", "north"], polygon: "700,90 875,125 1015,170 1080,235 1110,300 1085,390 1045,505 920,525 760,575 745,510 730,430 700,325 675,235 750,190", label: [900,320],
    initialShares: { player: 0, lowprice: 8, premium: 55, fastgo: 25, local: 12 },
    sites: [
      { id:"e1", x:735, y:280, kind:"pvz", owner:"premium", label:"Premium Hills", traffic:1.15, rent:2550 },
      { id:"e2", x:900, y:220, kind:"pvz", owner:"premium", label:"Premium Residence", traffic:1.2, rent:2700 },
      { id:"e3", x:1050, y:300, kind:"pvz", owner:"fastgo", label:"FastGo Elite", traffic:1.04, rent:2310 },
      { id:"e4", x:965, y:420, kind:"pvz", owner:null, label:"Набережные сады", traffic:1.08, rent:2480 },
      { id:"e5", x:790, y:435, kind:"pvz", owner:"local", label:"Дом сервиса", traffic:.9, rent:2050 },
      { id:"e6", x:1095, y:420, kind:"pvz", owner:null, label:"Клубный квартал", traffic:1.0, rent:2260 }
    ]
  }
];

const DISTRICT_BY_ID = Object.fromEntries(DISTRICTS.map(d => [d.id, d]));
const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));

const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  try { tg.enableClosingConfirmation(); } catch (_) {}
}

const ui = {
  activeTab: "map",
  mapMode: "city",
  selectedDistrictId: "south",
  toastTimer: null,
  selectedColor: CONFIG.colors[0]
};

const els = {
  view: document.getElementById("view"),
  day: document.getElementById("header-day"),
  balance: document.getElementById("header-balance"),
  brandName: document.getElementById("brand-name"),
  brandMark: document.getElementById("brand-mark"),
  brandSubtitle: document.getElementById("brand-subtitle"),
  brandButton: document.getElementById("brand-button"),
  modalBackdrop: document.getElementById("modal-backdrop"),
  modalContent: document.getElementById("modal-content"),
  modalClose: document.getElementById("modal-close"),
  onboarding: document.getElementById("onboarding"),
  shopName: document.getElementById("shop-name"),
  colorPicker: document.getElementById("color-picker"),
  startGame: document.getElementById("start-game"),
  continueOld: document.getElementById("continue-old"),
  toast: document.getElementById("toast")
};

let state = loadState();

function storageGet(key) {
  try { return localStorage.getItem(key); } catch (_) { return null; }
}
function storageSet(key, value) {
  try { localStorage.setItem(key, value); return true; } catch (_) { return false; }
}
function storageRemove(key) {
  try { localStorage.removeItem(key); } catch (_) {}
}

function defaultState(name = "MarketFox", color = CONFIG.colors[0]) {
  const districts = {};
  for (const district of DISTRICTS) {
    districts[district.id] = {
      shares: { ...district.initialShares },
      loyalty: district.id === "south" ? 18 : 0,
      status: district.id === "south" ? "presence" : "locked",
      heldDays: 0,
      unlocked: district.id === "south",
      adDays: 0,
      adSpend: 0,
      trend: 1,
      lastPlayerInfluence: 0,
      events: []
    };
  }

  const facilities = [];
  for (const district of DISTRICTS) {
    for (const site of district.sites) {
      if (!site.owner) continue;
      facilities.push(createFacilityFromSite(district.id, site, site.owner));
    }
  }

  return {
    version: SAVE_VERSION,
    company: { name, color, tier: 1, reputation: 0, totalValue: CONFIG.startBalance },
    day: 1,
    balance: CONFIG.startBalance,
    districts,
    facilities,
    inventory: {
      case: { qty: 25, price: 590, cardLevel: 1, adBudget: 0, marketPrice: 590 },
      bottle: { qty: 15, price: 890, cardLevel: 1, adBudget: 0, marketPrice: 890 }
    },
    shipments: [],
    competitors: {
      lowprice: { cash: 900000, aggression: 1.2 },
      premium: { cash: 1250000, aggression: 0.9 },
      fastgo: { cash: 1450000, aggression: 1.0 },
      local: { cash: 420000, aggression: 0.65 }
    },
    totalRevenue: 0,
    totalProfit: 0,
    totalOrders: 0,
    lastReport: null,
    reports: [],
    events: ["Магазин открыт. Развивайте Южный район и доведите долю рынка до 50%."],
    unlocks: { districtMap: true, localAds: false, cityExpansion: false, cityWarehouse: false, managers: false },
    onboardingDone: true,
    createdAt: Date.now(),
    rngSeed: Math.floor(Math.random() * 2147483646) + 1
  };
}

function createFacilityFromSite(districtId, site, owner) {
  const isWarehouse = site.kind === "warehouse";
  return {
    id: `${districtId}-${site.id}-${owner}`,
    districtId,
    siteId: site.id,
    type: site.kind,
    owner,
    name: site.label,
    level: 1,
    rating: owner === "player" ? 4.55 : round(4.05 + seededStatic(`${districtId}-${site.id}`) * 0.7, 2),
    staff: isWarehouse ? 2 : 1,
    condition: 100,
    capacity: isWarehouse ? 260 : 55,
    load: 0,
    queue: 0,
    dailyAd: 0,
    openedDay: 1
  };
}

function loadState() {
  try {
    const raw = storageGet(STORAGE_KEY);
    if (raw) return migrateState(JSON.parse(raw));
  } catch (error) {
    console.warn("Не удалось загрузить сохранение v0.3", error);
  }
  return null;
}

function migrateState(saved) {
  const fresh = defaultState(saved?.company?.name || "MarketFox", saved?.company?.color || CONFIG.colors[0]);
  if (!saved || typeof saved !== "object") return fresh;
  const merged = {
    ...fresh,
    ...saved,
    version: SAVE_VERSION,
    company: { ...fresh.company, ...(saved.company || {}) },
    districts: { ...fresh.districts, ...(saved.districts || {}) },
    competitors: { ...fresh.competitors, ...(saved.competitors || {}) },
    inventory: saved.inventory || fresh.inventory,
    facilities: Array.isArray(saved.facilities) ? saved.facilities : fresh.facilities,
    shipments: Array.isArray(saved.shipments) ? saved.shipments : [],
    reports: Array.isArray(saved.reports) ? saved.reports : [],
    events: Array.isArray(saved.events) ? saved.events : fresh.events,
    unlocks: { ...fresh.unlocks, ...(saved.unlocks || {}) }
  };
  for (const d of DISTRICTS) merged.districts[d.id] = { ...fresh.districts[d.id], ...(merged.districts[d.id] || {}) };
  return merged;
}

function migrateOldMvp(name, color) {
  let old = null;
  try { old = JSON.parse(storageGet(OLD_STORAGE_KEY) || "null"); } catch (_) {}
  const migrated = defaultState(name || "Market Empire", color || CONFIG.colors[0]);
  if (!old) return migrated;
  migrated.day = Math.max(1, Number(old.day) || 1);
  migrated.balance = Math.max(50000, Number(old.balance) || CONFIG.startBalance);
  migrated.totalRevenue = Number(old.totalRevenue) || 0;
  migrated.totalProfit = Number(old.totalProfit) || 0;
  migrated.totalOrders = Number(old.totalOrders) || 0;
  if (old.inventory && typeof old.inventory === "object") {
    for (const [id, item] of Object.entries(old.inventory)) {
      if (!PRODUCT_BY_ID[id]) continue;
      migrated.inventory[id] = {
        qty: Math.max(0, Number(item.qty) || 0),
        price: Math.max(1, Number(item.price) || PRODUCT_BY_ID[id].marketPrice),
        cardLevel: 1,
        adBudget: item.adActive ? 500 : 0,
        marketPrice: PRODUCT_BY_ID[id].marketPrice
      };
    }
  }
  migrated.events.unshift("Старое сохранение перенесено в новую версию с картой города.");
  return migrated;
}

function saveState() {
  if (!state) return;
  storageSet(STORAGE_KEY, JSON.stringify(state));
}

function rng() {
  state.rngSeed = (state.rngSeed * 48271) % 2147483647;
  return state.rngSeed / 2147483647;
}

function randomBetween(min, max) { return min + (max - min) * rng(); }
function seededStatic(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function round(value, digits = 0) { const p = 10 ** digits; return Math.round(value * p) / p; }
function money(value) { return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(value || 0)) + " ₽"; }
function pct(value) { return `${round(value, 1).toLocaleString("ru-RU")}%`; }
function escapeHtml(value) { return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c])); }
function productById(id) { return PRODUCT_BY_ID[id]; }
function districtById(id) { return DISTRICT_BY_ID[id]; }
function playerFacilities(type = null) { return state.facilities.filter(f => f.owner === "player" && (!type || f.type === type)); }
function districtFacilities(id, type = null) { return state.facilities.filter(f => f.districtId === id && (!type || f.type === type)); }
function siteById(districtId, siteId) { return districtById(districtId)?.sites.find(s => s.id === siteId); }
function dominantOwner(shares) { return Object.entries(shares).sort((a,b) => b[1] - a[1])[0]?.[0] || "local"; }
function vibrate(type = "light") { try { tg?.HapticFeedback?.impactOccurred(type); } catch (_) {} }

function setAccent(color) {
  const rgb = hexToRgb(color);
  document.documentElement.style.setProperty("--accent", color);
  document.documentElement.style.setProperty("--accent-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
}
function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const n = parseInt(clean.length === 3 ? clean.split("").map(c => c + c).join("") : clean, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function notify(message) {
  clearTimeout(ui.toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("show");
  ui.toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2500);
}

function showModal(html, onReady) {
  els.modalContent.innerHTML = html;
  els.modalBackdrop.classList.remove("hidden");
  els.modalBackdrop.setAttribute("aria-hidden", "false");
  if (onReady) requestAnimationFrame(onReady);
}
function closeModal() {
  els.modalBackdrop.classList.add("hidden");
  els.modalBackdrop.setAttribute("aria-hidden", "true");
}

function setupOnboarding() {
  els.colorPicker.innerHTML = CONFIG.colors.map((color, i) => `<button class="color-option ${i === 0 ? "selected" : ""}" style="background:${color}" data-color="${color}" type="button" aria-label="Выбрать цвет ${color}"></button>`).join("");
  els.colorPicker.addEventListener("click", event => {
    const button = event.target.closest(".color-option");
    if (!button) return;
    ui.selectedColor = button.dataset.color;
    setAccent(ui.selectedColor);
    els.colorPicker.querySelectorAll(".color-option").forEach(el => el.classList.toggle("selected", el === button));
  });
  const oldExists = !!storageGet(OLD_STORAGE_KEY);
  els.continueOld.classList.toggle("hidden", !oldExists);
  els.startGame.addEventListener("click", () => {
    const name = els.shopName.value.trim() || "MarketFox";
    state = defaultState(name, ui.selectedColor);
    saveState();
    finishOnboarding();
  });
  els.continueOld.addEventListener("click", () => {
    const name = els.shopName.value.trim() || "Market Empire";
    state = migrateOldMvp(name, ui.selectedColor);
    saveState();
    finishOnboarding();
  });
}

function finishOnboarding() {
  els.onboarding.classList.add("hidden");
  els.onboarding.setAttribute("aria-hidden", "true");
  setAccent(state.company.color);
  render();
}

function bootstrap() {
  setupOnboarding();
  if (!state) {
    els.onboarding.classList.remove("hidden");
    els.onboarding.setAttribute("aria-hidden", "false");
    setAccent(ui.selectedColor);
  } else {
    setAccent(state.company.color);
    render();
  }

  document.querySelectorAll(".nav-item[data-tab]").forEach(button => button.addEventListener("click", () => {
    ui.activeTab = button.dataset.tab;
    if (ui.activeTab !== "map") ui.mapMode = "city";
    render();
  }));
  document.getElementById("next-day-nav").addEventListener("click", openNextDayModal);
  els.modalClose.addEventListener("click", closeModal);
  els.modalBackdrop.addEventListener("click", event => { if (event.target === els.modalBackdrop) closeModal(); });
  els.brandButton.addEventListener("click", openCompanyModal);
}

function render() {
  if (!state) return;
  updateHeader();
  document.querySelectorAll(".nav-item[data-tab]").forEach(button => button.classList.toggle("active", button.dataset.tab === ui.activeTab));
  if (ui.activeTab === "map") renderMapView();
  if (ui.activeTab === "products") renderProductsView();
  if (ui.activeTab === "objects") renderObjectsView();
  if (ui.activeTab === "finance") renderFinanceView();
}

function updateHeader() {
  els.day.textContent = state.day;
  els.balance.textContent = money(state.balance);
  els.brandName.textContent = state.company.name;
  els.brandMark.textContent = state.company.name.slice(0, 1).toUpperCase();
  const controlled = DISTRICTS.filter(d => ["controlled", "dominant"].includes(state.districts[d.id].status)).length;
  els.brandSubtitle.textContent = controlled ? `${controlled} район${controlled === 1 ? "" : "а"} под контролем` : "Локальный магазин";
}

function renderMapView() {
  if (ui.mapMode === "district") renderDistrictMap(ui.selectedDistrictId);
  else renderCityMap();
}

function renderCityMap() {
  const selected = districtById(ui.selectedDistrictId) || DISTRICTS[0];
  const ds = state.districts[selected.id];
  els.view.innerHTML = `
    <div class="page-grid two-column">
      <section class="page-grid">
        <div class="page-title-row">
          <div><p class="eyebrow">КАРТА ГОРОДА</p><h1>Экспансия сети</h1><p>Выберите район, чтобы изучить рынок и объекты.</p></div>
          <button id="open-daily-report" class="ghost-btn" type="button">Сводка дня</button>
        </div>
        <section class="card map-card">
          <div class="map-toolbar">
            <div class="map-chip">⌖ ${escapeHtml(state.company.name)} · ${playerFacilities("pvz").length} ПВЗ</div>
            <div class="map-chip map-legend"><span class="legend-dot" style="background:${state.company.color}"></span> Ваши районы <span class="legend-dot" style="background:#f59e0b"></span> Спорные</div>
          </div>
          <div class="map-viewport" data-map-viewport>
            ${buildCitySvg()}
          </div>
        </section>
      </section>

      <aside class="page-grid">
        ${districtSummaryHtml(selected, ds)}
        ${cityMetricsHtml()}
        ${eventsHtml(4)}
      </aside>
    </div>
  `;

  els.view.querySelectorAll("[data-district]").forEach(element => element.addEventListener("click", () => {
    ui.selectedDistrictId = element.dataset.district;
    renderCityMap();
  }));
  document.getElementById("open-district")?.addEventListener("click", () => {
    ui.mapMode = "district";
    render();
  });
  document.getElementById("open-daily-report")?.addEventListener("click", () => state.lastReport ? openReportModal(state.lastReport) : notify("Первый отчёт появится после завершения дня"));
  setupMapViewport(selected.label[0], selected.label[1]);
}

function buildCitySvg() {
  const districtShapes = DISTRICTS.map(d => {
    const runtime = state.districts[d.id];
    const leader = dominantOwner(runtime.shares);
    const leaderColor = leader === "player" ? state.company.color : COMPETITORS[leader]?.color || "#64748b";
    const locked = !runtime.unlocked && runtime.status === "locked";
    const opacity = locked ? .43 : .78;
    const selected = ui.selectedDistrictId === d.id ? "selected" : "";
    const outline = runtime.status === "contested" || runtime.status === "leader" ? "#f59e0b" : runtime.status === "controlled" || runtime.status === "dominant" ? state.company.color : "rgba(255,255,255,.16)";
    const playerShare = runtime.shares.player || 0;
    return `
      <g data-district="${d.id}" tabindex="0" role="button" aria-label="${escapeHtml(d.name)}">
        <polygon class="district-shape ${selected}" points="${d.polygon}" fill="${leaderColor}" fill-opacity="${opacity}" />
        <polygon class="district-outline" points="${d.polygon}" stroke="${outline}" stroke-width="${selected ? 6 : 3}" />
        <text class="district-label" x="${d.label[0]}" y="${d.label[1]}">${escapeHtml(d.name)}</text>
        <text class="district-share" x="${d.label[0]}" y="${d.label[1] + 24}">${locked ? "закрыт" : `${escapeHtml(state.company.name)} ${round(playerShare)}%`}</text>
      </g>`;
  }).join("");

  const playerMarkers = playerFacilities().map(f => {
    const site = siteById(f.districtId, f.siteId);
    if (!site) return "";
    return mapMarker(site.x, site.y, f.type === "warehouse" ? "W" : "P", state.company.color, f.id, f.type === "warehouse" ? 13 : 11);
  }).join("");

  return `
    <svg class="city-map" viewBox="0 0 1200 820" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Интерактивная карта города">
      <rect class="map-bg" width="1200" height="820" />
      <path class="water" d="M1075 -20 C990 150 1090 250 1020 390 C955 520 1125 610 1035 850 L1210 850 L1210 -20 Z" />
      <path class="water-line" d="M1075 -20 C990 150 1090 250 1020 390 C955 520 1125 610 1035 850" />
      <path class="park" d="M520 70 Q645 40 730 105 L695 190 Q600 170 535 205 Z" />
      <path class="park" d="M175 555 Q260 520 335 585 L300 675 Q205 680 150 620 Z" />
      <path class="major-road" d="M0 480 C260 420 440 430 610 390 C790 345 900 300 1200 320" />
      <path class="road-core" d="M0 480 C260 420 440 430 610 390 C790 345 900 300 1200 320" />
      <path class="major-road" d="M505 0 C500 200 560 340 540 510 C525 645 585 720 650 820" />
      <path class="road-core" d="M505 0 C500 200 560 340 540 510 C525 645 585 720 650 820" />
      <path class="minor-road" d="M90 140 C300 175 520 135 760 160 C900 175 1010 240 1120 270" />
      <path class="minor-road" d="M140 710 C330 665 525 690 730 635 C900 590 1020 620 1120 680" />
      <path class="minor-road" d="M250 0 C230 210 275 370 260 510 C245 640 220 720 210 820" />
      ${districtShapes}
      ${playerMarkers}
    </svg>`;
}

function mapMarker(x, y, text, color, id, radius = 15, owner = "player") {
  return `<g class="marker" data-facility="${id || ""}" transform="translate(${x} ${y})">
    <circle class="marker-pulse" r="${radius + 10}" fill="${color}" />
    <circle class="marker-ring" r="${radius}" stroke="${color}" />
    <text class="marker-label" y="1">${text}</text>
  </g>`;
}

function setupMapViewport(focusX = 600, focusY = 410) {
  const viewport = els.view.querySelector("[data-map-viewport]");
  if (!viewport) return;
  viewport.setAttribute("tabindex", "0");
  viewport.setAttribute("aria-label", "Карту можно двигать пальцем в разные стороны");
  requestAnimationFrame(() => {
    if (window.matchMedia("(min-width: 680px)").matches) {
      viewport.scrollLeft = 0;
      viewport.scrollTop = 0;
      return;
    }
    const xScale = viewport.scrollWidth / 1200;
    const yScale = viewport.scrollHeight / 820;
    viewport.scrollLeft = Math.max(0, focusX * xScale - viewport.clientWidth / 2);
    viewport.scrollTop = Math.max(0, focusY * yScale - viewport.clientHeight / 2);
  });
}

function districtSummaryHtml(district, runtime) {
  const status = districtStatusLabel(runtime.status);
  const playerShare = runtime.shares.player || 0;
  const ownedPvz = districtFacilities(district.id, "pvz").filter(f => f.owner === "player").length;
  const canOpen = runtime.unlocked || runtime.status !== "locked";
  const controlled = ["controlled", "dominant"].includes(runtime.status);
  return `
    <section class="card panel glass-card district-summary">
      <div class="district-header">
        <div><p class="eyebrow">${escapeHtml(district.subtitle)}</p><h2>${escapeHtml(district.name)}</h2></div>
        <span class="status-badge ${status.className}">${status.label}</span>
      </div>
      <div class="metric-grid">
        <div class="metric-card"><span>Ваша доля</span><strong style="color:${state.company.color}">${pct(playerShare)}</strong><small>${ownedPvz} ПВЗ</small></div>
        <div class="metric-card"><span>Население</span><strong>${Math.round(district.population / 1000)} тыс.</strong><small>рынок района</small></div>
        <div class="metric-card"><span>Аренда</span><strong>${district.rent < .9 ? "Низкая" : district.rent > 1.3 ? "Высокая" : "Средняя"}</strong><small>коэффициент ${district.rent}</small></div>
        <div class="metric-card"><span>Удержание</span><strong>${runtime.heldDays}/${CONFIG.captureDays}</strong><small>дней лидерства</small></div>
      </div>
      <div class="share-stack">${shareRowsHtml(runtime.shares)}</div>
      <div class="bonus-card">
        <strong>${controlled ? "Активный бонус: " : "Бонус за захват: "}${escapeHtml(district.bonusTitle)}</strong>
        <span>${escapeHtml(district.bonusText)}</span>
      </div>
      ${!canOpen ? `<div class="price-warning">Район пока закрыт. Сначала закрепите контроль в соседней территории.</div>` : ""}
      <button id="open-district" class="primary-btn full" type="button">${canOpen ? "Открыть карту района" : "Посмотреть закрытый район"}</button>
    </section>`;
}

function districtStatusLabel(status) {
  if (status === "dominant") return { label: "Доминирование", className: "status-owned" };
  if (status === "controlled") return { label: "Контролируется", className: "status-owned" };
  if (status === "leader") return { label: "Лидер", className: "status-contested" };
  if (status === "contested") return { label: "Спорный", className: "status-contested" };
  if (status === "presence") return { label: "Присутствие", className: "status-contested" };
  if (status === "available") return { label: "Доступен", className: "status-contested" };
  return { label: "Закрыт", className: "status-locked" };
}

function shareRowsHtml(shares) {
  return Object.entries(shares).sort((a,b) => b[1] - a[1]).map(([owner, share]) => {
    const name = owner === "player" ? state.company.name : COMPETITORS[owner]?.name || owner;
    const color = owner === "player" ? state.company.color : COMPETITORS[owner]?.color || "#64748b";
    return `<div class="share-row"><span>${escapeHtml(name)}</span><div class="share-bar"><div class="share-fill" style="width:${clamp(share,0,100)}%;background:${color}"></div></div><strong>${pct(share)}</strong></div>`;
  }).join("");
}

function cityMetricsHtml() {
  const controlled = DISTRICTS.filter(d => ["controlled", "dominant"].includes(state.districts[d.id].status)).length;
  const inventoryUnits = Object.values(state.inventory).reduce((s, item) => s + item.qty, 0);
  const pvzCount = playerFacilities("pvz").length;
  return `<section class="card panel">
    <div class="section-heading"><div><h2>Состояние сети</h2><p>Основные показатели развития</p></div></div>
    <div class="metric-grid">
      <div class="metric-card"><span>Баланс</span><strong>${money(state.balance)}</strong></div>
      <div class="metric-card"><span>ПВЗ</span><strong>${pvzCount}</strong></div>
      <div class="metric-card"><span>Товары</span><strong>${inventoryUnits}</strong><small>единиц</small></div>
      <div class="metric-card"><span>Районы</span><strong>${controlled}/${DISTRICTS.length}</strong></div>
    </div>
  </section>`;
}

function eventsHtml(limit = 5) {
  const events = state.events.slice(0, limit);
  return `<section class="card panel"><div class="section-heading"><div><h2>Новости сети</h2><p>Последние важные изменения</p></div></div><div class="list">${events.map((event, i) => `<div class="event-card">${i === 0 ? "● " : ""}${escapeHtml(event)}</div>`).join("") || `<div class="event-card">Событий пока нет.</div>`}</div></section>`;
}

function renderDistrictMap(districtId) {
  const district = districtById(districtId);
  const runtime = state.districts[districtId];
  const isAccessible = runtime.unlocked || runtime.status !== "locked";
  els.view.innerHTML = `
    <div class="page-grid two-column">
      <section class="page-grid">
        <div class="page-title-row">
          <div><p class="eyebrow">КАРТА РАЙОНА</p><h1>${escapeHtml(district.name)}</h1><p>${escapeHtml(district.subtitle)} · ${Math.round(district.population/1000)} тыс. жителей</p></div>
          <button id="back-city" class="ghost-btn" type="button">← Город</button>
        </div>
        <section class="card map-card">
          <div class="map-toolbar"><div class="map-chip">${isAccessible ? "Нажмите на объект или свободную площадку" : "Район пока закрыт для экспансии"}</div></div>
          <div class="map-viewport" data-map-viewport>
            ${buildDistrictSvg(district)}
          </div>
        </section>
      </section>
      <aside class="page-grid">
        ${districtSummaryHtml(district, runtime)}
        ${districtActionsHtml(district, runtime)}
        ${districtFacilitiesListHtml(districtId)}
      </aside>
    </div>`;

  document.getElementById("back-city")?.addEventListener("click", () => { ui.mapMode = "city"; render(); });
  document.getElementById("open-district")?.remove();
  document.getElementById("district-ad")?.addEventListener("click", () => launchDistrictAd(districtId));
  els.view.querySelectorAll("[data-site]").forEach(node => node.addEventListener("click", () => openSiteModal(districtId, node.dataset.site)));
  els.view.querySelectorAll("[data-facility]").forEach(node => node.addEventListener("click", () => openFacilityModal(node.dataset.facility)));
  const focusSite = district.sites.find(site => state.facilities.some(f => f.districtId === districtId && f.siteId === site.id && f.owner === "player")) || district.sites[0];
  setupMapViewport(focusSite?.x || 600, focusSite?.y || 410);
}

function buildDistrictSvg(district) {
  const seed = seededStatic(district.id);
  const blocks = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 7; col++) {
      const x = 55 + col * 155 + ((row % 2) * 20);
      const y = 70 + row * 135;
      const w = 105 + ((col + row) % 3) * 12;
      const h = 72 + ((col * 2 + row) % 3) * 10;
      if ((row === 1 && col === 4) || (row === 3 && col === 1)) continue;
      blocks.push(`<rect class="block ${((row+col)%4===0)?"block-light":""}" x="${x}" y="${y}" width="${w}" height="${h}" rx="10" />`);
    }
  }
  const parkX = 690 + Math.round(seed * 100);
  const facilitiesBySite = Object.fromEntries(districtFacilities(district.id).map(f => [f.siteId, f]));
  const siteMarkers = district.sites.map(site => {
    const facility = facilitiesBySite[site.id];
    const owner = facility?.owner || null;
    const color = owner === "player" ? state.company.color : owner ? COMPETITORS[owner]?.color : "#94a3b8";
    const symbol = site.kind === "warehouse" ? "W" : owner ? "P" : "+";
    const data = facility ? `data-facility="${facility.id}"` : `data-site="${site.id}"`;
    return `<g class="marker" ${data} transform="translate(${site.x} ${site.y})">
      ${!owner ? `<circle class="marker-pulse" r="25" fill="#38bdf8" />` : ""}
      <circle class="marker-ring" r="15" stroke="${color}" />
      <text class="marker-label" y="1">${symbol}</text>
      <text class="site-name" x="0" y="34" text-anchor="middle" fill="#dbe7f3" font-size="14" font-weight="850" paint-order="stroke" stroke="#07101d" stroke-width="5">${escapeHtml(site.label)}</text>
    </g>`;
  }).join("");

  return `<svg class="district-map" viewBox="0 0 1200 820" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Карта района ${escapeHtml(district.name)}">
    <rect class="map-bg" width="1200" height="820" />
    ${blocks.join("")}
    <path class="park" d="M${parkX} 105 q115 -45 175 35 l-20 130 q-110 30 -185 -35z" />
    <path class="water" d="M1110 -10 C1020 150 1150 310 1055 480 C1000 580 1110 690 1040 830 L1210 830 L1210 -10Z" />
    <path class="major-road" d="M0 360 C260 320 430 390 650 350 C850 315 990 250 1200 290" />
    <path class="road-core" d="M0 360 C260 320 430 390 650 350 C850 315 990 250 1200 290" />
    <path class="major-road" d="M410 0 C380 220 460 390 420 560 C390 680 450 760 500 820" />
    <path class="road-core" d="M410 0 C380 220 460 390 420 560 C390 680 450 760 500 820" />
    <path class="minor-road" d="M0 120 C290 170 570 80 900 130 C1010 150 1100 190 1200 210" />
    <path class="minor-road" d="M0 640 C250 590 510 690 730 620 C930 555 1030 600 1200 650" />
    <path class="minor-road" d="M180 0 C210 180 170 350 210 510 C235 620 190 710 170 820" />
    <path class="minor-road" d="M760 0 C710 190 800 340 770 520 C745 645 815 735 850 820" />
    ${siteMarkers}
  </svg>`;
}

function districtActionsHtml(district, runtime) {
  const accessible = runtime.unlocked || runtime.status !== "locked";
  const adActive = runtime.adDays > 0;
  return `<section class="card panel">
    <div class="section-heading"><div><h2>Развитие района</h2><p>Инструменты влияния</p></div></div>
    <div class="list">
      <div class="list-card"><div class="list-main"><div class="icon-box">◎</div><div class="list-copy"><strong>Локальная реклама</strong><span>+${CONFIG.localAdInfluence} влияния на ${CONFIG.localAdDays} дней</span></div></div><div class="list-value"><strong>${adActive ? `${runtime.adDays} дн.` : money(CONFIG.localAdCost)}</strong></div></div>
      <button id="district-ad" class="secondary-btn full" type="button" ${!accessible || adActive || state.balance < CONFIG.localAdCost ? "disabled" : ""}>${adActive ? "Кампания активна" : "Запустить кампанию"}</button>
    </div>
  </section>`;
}

function districtFacilitiesListHtml(districtId) {
  const facilities = districtFacilities(districtId);
  return `<section class="card panel"><div class="section-heading"><div><h2>Объекты района</h2><p>${facilities.length} действующих объектов</p></div></div><div class="list">${facilities.map(f => facilityListCard(f)).join("")}</div></section>`;
}

function facilityListCard(facility) {
  const ownerName = facility.owner === "player" ? state.company.name : COMPETITORS[facility.owner]?.name || "Компания";
  const color = facility.owner === "player" ? state.company.color : COMPETITORS[facility.owner]?.color || "#64748b";
  return `<button class="list-card" data-facility="${facility.id}" type="button" style="width:100%;color:inherit;text-align:left">
    <div class="list-main"><div class="icon-box" style="color:${color};background:${color}18">${facility.type === "warehouse" ? "W" : "P"}</div><div class="list-copy"><strong>${escapeHtml(facility.name)}</strong><span>${escapeHtml(ownerName)} · уровень ${facility.level}</span></div></div>
    <div class="list-value"><strong>★ ${facility.rating.toFixed(2)}</strong><span>${facility.type === "warehouse" ? `${facility.capacity} мест` : `${facility.queue} мин.`}</span></div>
  </button>`;
}

function openSiteModal(districtId, siteId) {
  const district = districtById(districtId);
  const runtime = state.districts[districtId];
  const site = siteById(districtId, siteId);
  if (!site) return;
  const existing = state.facilities.find(f => f.districtId === districtId && f.siteId === siteId);
  if (existing) return openFacilityModal(existing.id);
  const accessible = runtime.unlocked || runtime.status !== "locked";
  const base = site.kind === "warehouse" ? 420000 : 78000;
  const cost = Math.round(base * district.rent * (0.75 + site.traffic * 0.35));
  const dailyRent = Math.round(site.rent * district.rent);
  showModal(`
    <p class="eyebrow">СВОБОДНЫЙ ОБЪЕКТ</p>
    <h2>${escapeHtml(site.label)}</h2>
    <p class="modal-lead">${site.kind === "warehouse" ? "Площадка под склад" : "Помещение под новый пункт выдачи"} в районе «${escapeHtml(district.name)}».</p>
    <div class="metric-grid">
      <div class="metric-card"><span>Открытие</span><strong>${money(cost)}</strong></div>
      <div class="metric-card"><span>Расход/день</span><strong>${money(dailyRent)}</strong></div>
      <div class="metric-card"><span>Трафик</span><strong>${site.traffic >= 1.15 ? "Высокий" : site.traffic < .85 ? "Низкий" : "Средний"}</strong></div>
      <div class="metric-card"><span>Влияние</span><strong>+${Math.round(28 * site.traffic)}</strong></div>
    </div>
    ${!accessible ? `<div class="price-warning" style="margin-top:12px">Сначала захватите соседний район, чтобы открыть эту территорию.</div>` : ""}
    <button id="open-site-confirm" class="primary-btn full" style="margin-top:14px" type="button" ${!accessible || state.balance < cost ? "disabled" : ""}>${state.balance < cost ? "Недостаточно денег" : site.kind === "warehouse" ? "Построить склад" : "Открыть ПВЗ"}</button>
  `, () => document.getElementById("open-site-confirm")?.addEventListener("click", () => openPlayerFacility(districtId, siteId, cost)));
}

function openPlayerFacility(districtId, siteId, cost) {
  const site = siteById(districtId, siteId);
  if (!site || state.balance < cost) return;
  state.balance -= cost;
  const facility = createFacilityFromSite(districtId, site, "player");
  facility.openedDay = state.day;
  state.facilities.push(facility);
  state.districts[districtId].unlocked = true;
  state.districts[districtId].status = state.districts[districtId].status === "locked" ? "presence" : state.districts[districtId].status;
  state.events.unshift(`${state.company.name} открыл ${facility.type === "warehouse" ? "склад" : "ПВЗ"} «${facility.name}» в районе «${districtById(districtId).name}».`);
  saveState();
  closeModal();
  vibrate("medium");
  render();
}

function openFacilityModal(facilityId) {
  const f = state.facilities.find(item => item.id === facilityId);
  if (!f) return;
  const district = districtById(f.districtId);
  const site = siteById(f.districtId, f.siteId);
  const ownerName = f.owner === "player" ? state.company.name : COMPETITORS[f.owner]?.name || "Компания";
  const own = f.owner === "player";
  const upgradeCost = Math.round((f.type === "warehouse" ? 150000 : 62000) * f.level * district.rent);
  const nextCapacity = f.type === "warehouse" ? f.capacity + 220 * f.level : f.capacity + 40 * f.level;
  showModal(`
    <p class="eyebrow">${f.type === "warehouse" ? "СКЛАД" : "ПУНКТ ВЫДАЧИ"}</p>
    <h2>${escapeHtml(f.name)}</h2>
    <p class="modal-lead">${escapeHtml(ownerName)} · ${escapeHtml(district.name)} · ${escapeHtml(site?.label || "")}</p>
    <div class="metric-grid">
      <div class="metric-card"><span>Уровень</span><strong>${f.level}</strong></div>
      <div class="metric-card"><span>Рейтинг</span><strong>★ ${f.rating.toFixed(2)}</strong></div>
      <div class="metric-card"><span>Вместимость</span><strong>${f.capacity}</strong></div>
      <div class="metric-card"><span>${f.type === "warehouse" ? "Загрузка" : "Очередь"}</span><strong>${f.type === "warehouse" ? f.load : `${f.queue} мин.`}</strong></div>
    </div>
    ${own ? `
      <div class="bonus-card" style="margin-top:12px"><strong>Улучшение до уровня ${f.level + 1}</strong><span>Вместимость: ${f.capacity} → ${nextCapacity}. Выше скорость обслуживания и влияние.</span></div>
      <button id="upgrade-facility" class="primary-btn full" style="margin-top:12px" type="button" ${f.level >= 4 || state.balance < upgradeCost ? "disabled" : ""}>${f.level >= 4 ? "Максимальный уровень" : `Улучшить за ${money(upgradeCost)}`}</button>
    ` : `<div class="price-warning" style="margin-top:12px">Объект конкурента. Он влияет на долю рынка в этом районе.</div>`}
  `, () => document.getElementById("upgrade-facility")?.addEventListener("click", () => upgradeFacility(f.id, upgradeCost)));
}

function upgradeFacility(id, cost) {
  const f = state.facilities.find(item => item.id === id);
  if (!f || f.owner !== "player" || f.level >= 4 || state.balance < cost) return;
  state.balance -= cost;
  f.level += 1;
  f.staff += 1;
  f.capacity += f.type === "warehouse" ? 220 * (f.level - 1) : 40 * (f.level - 1);
  f.rating = clamp(f.rating + 0.08, 1, 5);
  state.events.unshift(`Объект «${f.name}» улучшен до уровня ${f.level}.`);
  saveState();
  closeModal();
  vibrate("medium");
  render();
}

function launchDistrictAd(districtId) {
  const runtime = state.districts[districtId];
  if (runtime.adDays > 0 || state.balance < CONFIG.localAdCost) return;
  state.balance -= CONFIG.localAdCost;
  runtime.adDays = CONFIG.localAdDays;
  runtime.adSpend += CONFIG.localAdCost;
  state.unlocks.localAds = true;
  state.events.unshift(`${state.company.name} запустил локальную рекламу в районе «${districtById(districtId).name}».`);
  saveState();
  vibrate("light");
  render();
}

function renderProductsView() {
  els.view.innerHTML = `
    <div class="page-grid">
      <div class="page-title-row"><div><p class="eyebrow">АССОРТИМЕНТ</p><h1>Товары магазина</h1><p>Управляйте закупками, ценами и карточками.</p></div></div>
      <div class="metric-grid">
        <div class="metric-card"><span>Баланс</span><strong>${money(state.balance)}</strong></div>
        <div class="metric-card"><span>На складе</span><strong>${Object.values(state.inventory).reduce((s,i)=>s+i.qty,0)}</strong></div>
        <div class="metric-card"><span>Карточек</span><strong>${Object.keys(state.inventory).length}</strong></div>
        <div class="metric-card"><span>Продано</span><strong>${state.totalOrders}</strong></div>
      </div>
      <div class="catalog">${PRODUCTS.map(product => productCardHtml(product)).join("")}</div>
    </div>`;
  els.view.querySelectorAll("[data-product]").forEach(button => button.addEventListener("click", () => openProductModal(button.dataset.product)));
}

function productCardHtml(product) {
  const item = state.inventory[product.id];
  const marketPrice = item?.marketPrice || product.marketPrice;
  const ratio = item ? item.price / marketPrice : 1;
  const forecast = item ? forecastProductSales(product, item) : { min: 0, max: 0 };
  return `<article class="card product-card">
    <div class="product-top">
      <div class="product-main"><div class="product-emoji">${product.emoji}</div><div><h3 class="product-title">${escapeHtml(product.name)}</h3><div class="product-sub">${escapeHtml(product.category)} · ${productTypeLabel(product.type)}</div></div></div>
      <div class="product-price"><strong>${money(item?.price || product.marketPrice)}</strong><span>рынок ${money(marketPrice)}</span></div>
    </div>
    <div class="tags">
      <span class="tag ${item?.qty > 10 ? "good" : item ? "warn" : ""}">Остаток ${item?.qty || 0}</span>
      <span class="tag">Спрос ${product.baseDemand}/10</span>
      <span class="tag ${ratio >= CONFIG.maxPriceRatio ? "bad" : ratio > 1.2 ? "warn" : "good"}">${Math.round(ratio*100)}% рынка</span>
      ${item ? `<span class="tag">Прогноз ${forecast.min}–${forecast.max}</span>` : ""}
    </div>
    <button class="${item ? "secondary-btn" : "primary-btn"} full" style="margin-top:12px" data-product="${product.id}" type="button">${item ? "Управлять товаром" : "Начать продажу"}</button>
  </article>`;
}

function productTypeLabel(type) {
  return ({ stable:"Стабильный", competitive:"Конкурентный", trend:"Трендовый", seasonal:"Сезонный", premium:"Премиальный" })[type] || type;
}

function openProductModal(productId) {
  const product = productById(productId);
  let item = state.inventory[productId];
  const isNew = !item;
  const temp = item ? { ...item } : { qty: 0, price: product.marketPrice, cardLevel: 1, adBudget: 0, marketPrice: product.marketPrice };
  const renderContent = () => {
    const ratio = temp.price / temp.marketPrice;
    const demandFactor = priceDemandFactor(ratio, product.priceSensitivity);
    const unitProfit = temp.price * (1 - CONFIG.commissionRate) - product.cost - CONFIG.productLogistics;
    const forecast = forecastProductSales(product, temp);
    const qty = Number(document.getElementById("buy-qty")?.value || 20);
    els.modalContent.innerHTML = `
      <p class="eyebrow">ТОВАР</p><h2>${product.emoji} ${escapeHtml(product.name)}</h2>
      <p class="modal-lead">${escapeHtml(product.category)} · закупка ${money(product.cost)} · рынок ${money(temp.marketPrice)}</p>
      <div class="metric-grid">
        <div class="metric-card"><span>Остаток</span><strong>${temp.qty}</strong></div>
        <div class="metric-card"><span>Карточка</span><strong>ур. ${temp.cardLevel}</strong></div>
        <div class="metric-card"><span>Прогноз</span><strong>${forecast.min}–${forecast.max}</strong></div>
        <div class="metric-card"><span>Прибыль/шт.</span><strong class="${unitProfit >= 0 ? "positive" : "negative"}">${money(unitProfit)}</strong></div>
      </div>
      <label class="field-label">Цена продажи</label>
      <div class="range-wrap"><input id="price-range" type="range" min="${Math.max(product.cost, Math.round(temp.marketPrice*.55))}" max="${Math.round(temp.marketPrice*2.2)}" step="10" value="${temp.price}"><input id="price-number" class="number-input" type="number" min="1" value="${temp.price}"></div>
      <div class="help-text">${Math.round(ratio*100)}% от рыночной цены · множитель спроса ${round(demandFactor,2)}</div>
      ${ratio >= CONFIG.maxPriceRatio ? `<div class="price-warning" style="margin-top:10px">Цена слишком высокая. Вероятность продажи строго 0%.</div>` : unitProfit < 0 ? `<div class="price-warning" style="margin-top:10px">Продажа по этой цене убыточна с учётом комиссии и логистики.</div>` : ""}
      <label class="field-label">Закупить партию</label>
      <div class="range-wrap"><input id="buy-range" type="range" min="1" max="200" step="1" value="${qty}"><input id="buy-qty" class="number-input" type="number" min="1" max="999" value="${qty}"></div>
      <div class="help-text">Стоимость партии: ${money(product.cost * qty)}. Поставка прибудет через 1–3 игровых дня.</div>
      <label class="field-label">Реклама товара в день</label>
      <select id="product-ad" class="select-input">
        <option value="0" ${temp.adBudget===0?"selected":""}>Без рекламы</option>
        <option value="500" ${temp.adBudget===500?"selected":""}>Экономная — 500 ₽</option>
        <option value="1500" ${temp.adBudget===1500?"selected":""}>Стандартная — 1 500 ₽</option>
        <option value="4000" ${temp.adBudget===4000?"selected":""}>Агрессивная — 4 000 ₽</option>
      </select>
      <div class="button-row" style="margin-top:14px">
        <button id="save-product" class="secondary-btn" type="button">Сохранить цену</button>
        <button id="buy-product" class="primary-btn" type="button" ${state.balance < product.cost * qty ? "disabled" : ""}>Заказать партию</button>
      </div>
      ${!isNew && temp.cardLevel < 4 ? `<button id="upgrade-card" class="ghost-btn full" style="margin-top:8px" type="button" ${state.balance < CONFIG.cardUpgradeCost*temp.cardLevel ? "disabled" : ""}>Улучшить карточку за ${money(CONFIG.cardUpgradeCost*temp.cardLevel)}</button>` : ""}
    `;
    bindProductModal(product, temp, renderContent);
  };
  showModal("", renderContent);
}

function bindProductModal(product, temp, rerender) {
  const priceRange = document.getElementById("price-range");
  const priceNumber = document.getElementById("price-number");
  const buyRange = document.getElementById("buy-range");
  const buyQty = document.getElementById("buy-qty");
  const syncPrice = value => { temp.price = Math.max(1, Number(value) || 1); rerender(); };
  priceRange?.addEventListener("change", e => syncPrice(e.target.value));
  priceNumber?.addEventListener("change", e => syncPrice(e.target.value));
  buyRange?.addEventListener("input", e => { if (buyQty) buyQty.value = e.target.value; });
  buyRange?.addEventListener("change", rerender);
  buyQty?.addEventListener("change", rerender);
  document.getElementById("product-ad")?.addEventListener("change", e => { temp.adBudget = Number(e.target.value); });
  document.getElementById("save-product")?.addEventListener("click", () => {
    const item = state.inventory[product.id] || { qty: 0, cardLevel: 1, marketPrice: product.marketPrice };
    item.price = temp.price;
    item.adBudget = Number(document.getElementById("product-ad")?.value || 0);
    state.inventory[product.id] = item;
    saveState(); notify("Цена и реклама сохранены"); closeModal(); render();
  });
  document.getElementById("buy-product")?.addEventListener("click", () => {
    const qty = clamp(Number(document.getElementById("buy-qty")?.value || 1), 1, 999);
    orderProduct(product.id, qty, temp.price, Number(document.getElementById("product-ad")?.value || 0));
  });
  document.getElementById("upgrade-card")?.addEventListener("click", () => upgradeProductCard(product.id));
}

function orderProduct(productId, qty, price, adBudget) {
  const product = productById(productId);
  const cost = product.cost * qty;
  if (state.balance < cost) return notify("Недостаточно денег");
  state.balance -= cost;
  const existing = state.inventory[productId] || { qty: 0, price, cardLevel: 1, adBudget, marketPrice: product.marketPrice };
  existing.price = price;
  existing.adBudget = adBudget;
  state.inventory[productId] = existing;
  const days = 1 + Math.floor(rng() * 3);
  state.shipments.push({ id:`ship-${Date.now()}-${productId}`, productId, qty, arrivalDay: state.day + days, cost });
  state.events.unshift(`Заказана партия «${product.name}»: ${qty} шт. Поставка через ${days} дн.`);
  saveState(); closeModal(); vibrate("medium"); render();
}

function upgradeProductCard(productId) {
  const item = state.inventory[productId];
  if (!item || item.cardLevel >= 4) return;
  const cost = CONFIG.cardUpgradeCost * item.cardLevel;
  if (state.balance < cost) return notify("Недостаточно денег");
  state.balance -= cost;
  item.cardLevel += 1;
  state.events.unshift(`Карточка товара «${productById(productId).name}» улучшена до уровня ${item.cardLevel}.`);
  saveState(); closeModal(); render();
}

function forecastProductSales(product, item) {
  const reach = Math.max(0.4, playerFacilities("pvz").length * 0.35 + 0.5);
  const priceFactor = priceDemandFactor(item.price / item.marketPrice, product.priceSensitivity);
  const cardFactor = 0.82 + item.cardLevel * 0.13;
  const adFactor = 1 + Math.sqrt(item.adBudget / 1000) * 0.14;
  const avg = product.baseDemand * reach * priceFactor * cardFactor * adFactor;
  return { min: Math.max(0, Math.floor(avg * .62)), max: Math.max(0, Math.ceil(avg * 1.38)) };
}

function priceDemandFactor(ratio, sensitivity = 1) {
  if (!Number.isFinite(ratio) || ratio >= CONFIG.maxPriceRatio) return 0;
  let base;
  if (ratio <= 0.8) base = 1.3;
  else if (ratio <= 1) base = 1.3 - (ratio - .8) * 1.5;
  else if (ratio <= 1.2) base = 1 - (ratio - 1) * 1.75;
  else if (ratio <= 1.5) base = .65 - (ratio - 1.2) * 1.6667;
  else base = .15 - (ratio - 1.5) * .5;
  return clamp(Math.pow(Math.max(0, base), sensitivity), 0, 1.5);
}

function renderObjectsView() {
  const facilities = playerFacilities();
  els.view.innerHTML = `
    <div class="page-grid">
      <div class="page-title-row"><div><p class="eyebrow">ИНФРАСТРУКТУРА</p><h1>Объекты сети</h1><p>ПВЗ, склады и их загрузка.</p></div></div>
      <div class="metric-grid">
        <div class="metric-card"><span>ПВЗ</span><strong>${playerFacilities("pvz").length}</strong></div>
        <div class="metric-card"><span>Склады</span><strong>${playerFacilities("warehouse").length}</strong></div>
        <div class="metric-card"><span>Сотрудники</span><strong>${facilities.reduce((s,f)=>s+f.staff,0)}</strong></div>
        <div class="metric-card"><span>Средний рейтинг</span><strong>★ ${averageFacilityRating().toFixed(2)}</strong></div>
      </div>
      <section class="card panel"><div class="section-heading"><div><h2>Ваши объекты</h2><p>Нажмите, чтобы улучшить</p></div></div><div class="list">${facilities.map(f => facilityListCard(f)).join("")}</div></section>
      <section class="card panel"><div class="section-heading"><div><h2>Поставки в пути</h2><p>Закупленные товары</p></div></div><div class="list">${state.shipments.length ? state.shipments.map(shipmentCardHtml).join("") : `<div class="event-card">Активных поставок нет.</div>`}</div></section>
    </div>`;
  els.view.querySelectorAll("[data-facility]").forEach(node => node.addEventListener("click", () => openFacilityModal(node.dataset.facility)));
}

function shipmentCardHtml(shipment) {
  const p = productById(shipment.productId);
  return `<div class="list-card"><div class="list-main"><div class="icon-box">${p?.emoji || "📦"}</div><div class="list-copy"><strong>${escapeHtml(p?.name || "Товар")}</strong><span>${shipment.qty} шт. · прибытие в день ${shipment.arrivalDay}</span></div></div><div class="list-value"><strong>${Math.max(0, shipment.arrivalDay-state.day)} дн.</strong><span>в пути</span></div></div>`;
}

function averageFacilityRating() {
  const list = playerFacilities("pvz");
  return list.length ? list.reduce((s,f)=>s+f.rating,0)/list.length : 0;
}

function renderFinanceView() {
  const report = state.lastReport;
  els.view.innerHTML = `
    <div class="page-grid">
      <div class="page-title-row"><div><p class="eyebrow">ФИНАНСЫ</p><h1>Экономика магазина</h1><p>Прибыль, расходы и стоимость сети.</p></div></div>
      <section class="card report-hero">
        <span style="color:var(--muted);font-size:11px">Баланс</span>
        <div class="report-profit">${money(state.balance)}</div>
        <div class="tags"><span class="tag good">Выручка ${money(state.totalRevenue)}</span><span class="tag ${state.totalProfit>=0?"good":"bad"}">Прибыль ${money(state.totalProfit)}</span><span class="tag">Стоимость ${money(companyValue())}</span></div>
      </section>
      ${report ? reportFullHtml(report) : `<section class="card empty-state"><div class="empty-icon">↗</div><h2>Нет отчётов</h2><p>Завершите первый игровой день.</p></section>`}
      <section class="card panel"><div class="section-heading"><div><h2>История</h2><p>Последние игровые дни</p></div></div><div class="list">${state.reports.slice(-10).reverse().map(r => `<button class="list-card" data-report-day="${r.day}" type="button" style="width:100%;color:inherit;text-align:left"><div class="list-main"><div class="icon-box">${r.profit>=0?"↗":"↘"}</div><div class="list-copy"><strong>День ${r.day}</strong><span>${r.orders} заказов · ${money(r.revenue)} выручки</span></div></div><div class="list-value"><strong class="${r.profit>=0?"positive":"negative"}">${money(r.profit)}</strong></div></button>`).join("") || `<div class="event-card">История появится после первого дня.</div>`}</div></section>
    </div>`;
  els.view.querySelectorAll("[data-report-day]").forEach(button => button.addEventListener("click", () => openReportModal(state.reports.find(r => r.day === Number(button.dataset.reportDay)))));
}

function reportFullHtml(report) {
  return `<section class="card panel">
    <div class="section-heading"><div><h2>Отчёт за день ${report.day}</h2><p>${report.orders} заказов · ${report.parcels} выдач</p></div><strong class="${report.profit>=0?"positive":"negative"}">${money(report.profit)}</strong></div>
    <div class="report-lines">
      <div class="report-line"><span>Выручка товаров</span><strong>${money(report.productRevenue)}</strong></div>
      <div class="report-line"><span>Доход ПВЗ</span><strong>${money(report.pvzRevenue)}</strong></div>
      <div class="report-line"><span>Себестоимость проданного</span><strong>−${money(report.cogs)}</strong></div>
      <div class="report-line"><span>Комиссия и логистика</span><strong>−${money(report.marketplaceCosts)}</strong></div>
      <div class="report-line"><span>Реклама</span><strong>−${money(report.adCosts)}</strong></div>
      <div class="report-line"><span>Содержание объектов</span><strong>−${money(report.facilityCosts)}</strong></div>
      <div class="report-line"><span>Возвраты</span><strong>−${money(report.returnCosts)}</strong></div>
    </div>
    <div class="list" style="margin-top:14px">${report.reasons.map(reason => `<div class="event-card">${escapeHtml(reason)}</div>`).join("")}</div>
  </section>`;
}

function companyValue() {
  const inventory = Object.entries(state.inventory).reduce((s,[id,item])=>s+(productById(id)?.cost||0)*item.qty,0);
  const facilities = playerFacilities().reduce((s,f)=>s+(f.type==="warehouse"?320000:90000)*f.level,0);
  return state.balance + inventory + facilities;
}

function openCompanyModal() {
  const controlled = DISTRICTS.filter(d => ["controlled","dominant"].includes(state.districts[d.id].status)).length;
  showModal(`
    <p class="eyebrow">ПРОФИЛЬ МАГАЗИНА</p><h2>${escapeHtml(state.company.name)}</h2>
    <p class="modal-lead">День ${state.day} · стоимость компании ${money(companyValue())}</p>
    <div class="metric-grid">
      <div class="metric-card"><span>ПВЗ</span><strong>${playerFacilities("pvz").length}</strong></div>
      <div class="metric-card"><span>Склады</span><strong>${playerFacilities("warehouse").length}</strong></div>
      <div class="metric-card"><span>Районы</span><strong>${controlled}</strong></div>
      <div class="metric-card"><span>Заказы</span><strong>${state.totalOrders}</strong></div>
    </div>
    <label class="field-label">Название магазина</label><input id="rename-shop" class="text-input" maxlength="22" value="${escapeHtml(state.company.name)}">
    <button id="save-company" class="secondary-btn full" style="margin-top:10px" type="button">Сохранить название</button>
    <button id="reset-game" class="danger-btn full" style="margin-top:14px" type="button">Сбросить прогресс</button>
  `, () => {
    document.getElementById("save-company")?.addEventListener("click", () => {
      const name = document.getElementById("rename-shop")?.value.trim();
      if (name) state.company.name = name;
      saveState(); closeModal(); render();
    });
    document.getElementById("reset-game")?.addEventListener("click", () => {
      if (!confirm("Полностью удалить прогресс?")) return;
      storageRemove(STORAGE_KEY); location.reload();
    });
  });
}

function openNextDayModal() {
  if (!state) return;
  const shipmentsTomorrow = state.shipments.filter(s => s.arrivalDay <= state.day + 1).length;
  const activeAds = Object.values(state.inventory).reduce((s,i)=>s+i.adBudget,0) + DISTRICTS.reduce((s,d)=>s+(state.districts[d.id].adDays>0?CONFIG.localAdCost/CONFIG.localAdDays:0),0);
  showModal(`
    <p class="eyebrow">ЗАВЕРШЕНИЕ ДНЯ</p><h2>Запустить день ${state.day}</h2>
    <p class="modal-lead">Будут рассчитаны продажи, работа ПВЗ, расходы, действия конкурентов и изменение долей рынка.</p>
    <div class="metric-grid">
      <div class="metric-card"><span>Товаров</span><strong>${Object.values(state.inventory).reduce((s,i)=>s+i.qty,0)}</strong></div>
      <div class="metric-card"><span>ПВЗ</span><strong>${playerFacilities("pvz").length}</strong></div>
      <div class="metric-card"><span>Реклама/день</span><strong>${money(activeAds)}</strong></div>
      <div class="metric-card"><span>Поставки завтра</span><strong>${shipmentsTomorrow}</strong></div>
    </div>
    <button id="confirm-next-day" class="primary-btn full" style="margin-top:15px" type="button">Запустить симуляцию</button>
  `, () => document.getElementById("confirm-next-day")?.addEventListener("click", simulateDay));
}

function simulateDay() {
  closeModal();
  const report = {
    day: state.day,
    orders: 0, parcels: 0,
    productRevenue: 0, pvzRevenue: 0, revenue: 0,
    cogs: 0, marketplaceCosts: 0, adCosts: 0, facilityCosts: 0, returnCosts: 0,
    profit: 0, cashFlow: 0, reasons: [], districtChanges: []
  };

  processArrivingShipments(report);
  updateMarkets();
  processCompetitors(report);
  updateDistrictShares(report);
  processProductSales(report);
  processPvzOperations(report);
  applyDailyCosts(report);
  updateDistrictStatuses(report);
  updateUnlocks();

  report.revenue = report.productRevenue + report.pvzRevenue;
  report.profit = report.revenue - report.cogs - report.marketplaceCosts - report.adCosts - report.facilityCosts - report.returnCosts;
  report.cashFlow = report.revenue - report.marketplaceCosts - report.adCosts - report.facilityCosts - report.returnCosts;
  state.balance += report.cashFlow;
  state.totalRevenue += report.revenue;
  state.totalProfit += report.profit;
  state.totalOrders += report.orders;

  if (!report.reasons.length) report.reasons.push("День прошёл стабильно: заметных изменений не произошло.");
  state.lastReport = report;
  state.reports.push(report);
  if (state.reports.length > 60) state.reports.shift();
  state.day += 1;
  state.company.totalValue = companyValue();
  state.events.unshift(`День ${report.day}: ${report.orders} продаж, ${report.parcels} выдач, результат ${money(report.profit)}.`);
  state.events = state.events.slice(0, 30);
  saveState();
  vibrate(report.profit >= 0 ? "medium" : "heavy");
  render();
  openReportModal(report);
}

function processArrivingShipments(report) {
  const arrived = state.shipments.filter(s => s.arrivalDay <= state.day);
  state.shipments = state.shipments.filter(s => s.arrivalDay > state.day);
  for (const shipment of arrived) {
    const item = state.inventory[shipment.productId];
    if (item) item.qty += shipment.qty;
    report.reasons.push(`Прибыла партия «${productById(shipment.productId).name}»: ${shipment.qty} шт.`);
  }
}

function updateMarkets() {
  for (const product of PRODUCTS) {
    const item = state.inventory[product.id];
    if (!item) continue;
    const drift = 1 + randomBetween(-CONFIG.dailyMarketVolatility, CONFIG.dailyMarketVolatility);
    const trendBoost = product.type === "trend" ? randomBetween(.97, 1.06) : 1;
    item.marketPrice = Math.max(product.cost * 1.15, Math.round(item.marketPrice * drift * trendBoost / 10) * 10);
  }
  for (const district of DISTRICTS) {
    const runtime = state.districts[district.id];
    runtime.trend = clamp(runtime.trend * randomBetween(.97,1.03), .78, 1.25);
    if (runtime.adDays > 0) runtime.adDays -= 1;
  }
}

function processCompetitors(report) {
  if (state.day < 3) return;
  for (const [id, compState] of Object.entries(state.competitors)) {
    if (rng() > 0.22 * compState.aggression) continue;
    const target = DISTRICTS[Math.floor(rng()*DISTRICTS.length)];
    const ownFacilities = districtFacilities(target.id,"pvz").filter(f=>f.owner===id);
    const emptySites = target.sites.filter(s=>s.kind==="pvz" && !state.facilities.some(f=>f.districtId===target.id&&f.siteId===s.id));
    if (emptySites.length && compState.cash > 90000 && rng() < .35) {
      const site = emptySites[Math.floor(rng()*emptySites.length)];
      const cost = Math.round(70000*target.rent);
      compState.cash -= cost;
      state.facilities.push(createFacilityFromSite(target.id,site,id));
      state.events.unshift(`${COMPETITORS[id].name} открыл новый ПВЗ в районе «${target.name}».`);
      report.reasons.push(`${COMPETITORS[id].name} расширил сеть в районе «${target.name}».`);
    } else if (ownFacilities.length && compState.cash > 50000 && rng() < .5) {
      const f = ownFacilities[Math.floor(rng()*ownFacilities.length)];
      if (f.level < 4) {
        f.level += 1; f.capacity += 35; f.staff += 1; f.rating = clamp(f.rating+.04,1,5);
        compState.cash -= 50000;
        state.events.unshift(`${COMPETITORS[id].name} улучшил ПВЗ в районе «${target.name}».`);
      }
    } else {
      state.districts[target.id].events = [{ type:"rivalAd", owner:id, days:3 }, ...(state.districts[target.id].events||[])].slice(0,3);
      compState.cash -= 12000;
      report.reasons.push(`${COMPETITORS[id].name} усилил рекламу в районе «${target.name}».`);
    }
  }
  for (const district of DISTRICTS) {
    district && (state.districts[district.id].events = (state.districts[district.id].events||[]).map(e=>({...e,days:e.days-1})).filter(e=>e.days>0));
  }
}

function calculateInfluence(districtId, owner) {
  const district = districtById(districtId);
  const runtime = state.districts[districtId];
  const facilities = districtFacilities(districtId,"pvz").filter(f=>f.owner===owner);
  let influence = owner === "player" ? 5 : 12;
  for (const f of facilities) {
    const site = siteById(districtId,f.siteId);
    const base = 23 + f.level*15;
    const ratingFactor = .72 + f.rating/6;
    const queueFactor = clamp(1 - f.queue/35, .48, 1);
    influence += base * (site?.traffic||1) * ratingFactor * queueFactor;
  }
  if (owner === "player") {
    const assortment = Object.values(state.inventory).filter(i=>i.qty>0).length;
    influence += assortment*4;
    influence += runtime.loyalty*.35;
    if (runtime.adDays > 0) influence += CONFIG.localAdInfluence;
    if (["controlled","dominant"].includes(runtime.status)) influence += 18;
    if (isCentralControlled()) influence *= 1.07;
  } else {
    const comp = COMPETITORS[owner];
    influence *= comp?.service || 1;
    const ad = (runtime.events||[]).some(e=>e.type==="rivalAd"&&e.owner===owner);
    if (ad) influence += 35;
  }
  return Math.max(1,influence);
}

function updateDistrictShares(report) {
  for (const district of DISTRICTS) {
    const runtime = state.districts[district.id];
    const owners = ["player","lowprice","premium","fastgo","local"];
    const influence = Object.fromEntries(owners.map(owner=>[owner,calculateInfluence(district.id,owner)]));
    const total = Object.values(influence).reduce((s,v)=>s+v,0);
    const oldPlayer = runtime.shares.player;
    for (const owner of owners) {
      const target = influence[owner]/total*100;
      runtime.shares[owner] = runtime.shares[owner] + CONFIG.shareInertia*(target-runtime.shares[owner]);
    }
    normalizeShares(runtime.shares);
    runtime.lastPlayerInfluence = influence.player;
    const change = runtime.shares.player-oldPlayer;
    if (Math.abs(change)>=.35) report.districtChanges.push({districtId:district.id,change});
  }
}

function normalizeShares(shares) {
  const total = Object.values(shares).reduce((s,v)=>s+v,0) || 1;
  for (const key of Object.keys(shares)) shares[key] = clamp(shares[key]/total*100,0,100);
}

function processProductSales(report) {
  const openDistrictReach = DISTRICTS.reduce((sum,d)=>{
    const r=state.districts[d.id];
    return sum + (r.unlocked ? d.population/70000 * Math.max(.08,r.shares.player/100) : 0);
  },0);
  for (const [id,item] of Object.entries(state.inventory)) {
    const product = productById(id);
    if (!product || item.qty<=0) continue;
    const ratio = item.price/item.marketPrice;
    const priceFactor = priceDemandFactor(ratio,product.priceSensitivity);
    if (priceFactor<=0) { report.reasons.push(`«${product.name}» не продавался: цена достигла ${Math.round(ratio*100)}% от рынка.`); continue; }
    const cardFactor = .82+item.cardLevel*.13;
    const adFactor = 1+Math.sqrt(item.adBudget/1000)*.16;
    const avg = product.baseDemand*Math.max(.45,openDistrictReach)*priceFactor*cardFactor*adFactor;
    const sold = Math.min(item.qty,Math.max(0,Math.round(avg*randomBetween(.72,1.28))));
    const returns = Math.min(sold,Math.round(sold*product.returnRate*randomBetween(.65,1.35)));
    item.qty -= sold;
    const revenue=sold*item.price;
    const cogs=sold*product.cost;
    const commission=revenue*CONFIG.commissionRate;
    const logistics=sold*CONFIG.productLogistics;
    const returnCosts=returns*CONFIG.returnLogistics;
    report.orders+=sold; report.productRevenue+=revenue; report.cogs+=cogs; report.marketplaceCosts+=commission+logistics; report.returnCosts+=returnCosts; report.adCosts+=item.adBudget;
    if(sold===item.qty+sold&&sold>0) report.reasons.push(`«${product.name}» закончился на складе — часть спроса потеряна.`);
    if(item.adBudget>0 && sold>0 && item.adBudget/sold > Math.max(100,item.price-product.cost)) report.reasons.push(`Реклама «${product.name}» обходится слишком дорого относительно маржи.`);
  }
}

function processPvzOperations(report) {
  for (const district of DISTRICTS) {
    const runtime=state.districts[district.id];
    const pvzs=districtFacilities(district.id,"pvz").filter(f=>f.owner==="player");
    if(!pvzs.length) continue;
    let parcelDemand=district.population*CONFIG.cityParcelScale*runtime.trend*(runtime.shares.player/100);
    if(["controlled","dominant"].includes(runtime.status)&&district.bonusType==="pvz") parcelDemand*=1+district.bonusValue;
    const totalCapacity=pvzs.reduce((s,f)=>s+f.capacity,0);
    const handled=Math.min(totalCapacity,Math.round(parcelDemand*randomBetween(.9,1.1)));
    report.parcels+=handled; report.pvzRevenue+=handled*CONFIG.pvzParcelFee;
    let remaining=handled;
    for(const f of pvzs){
      const share=Math.min(f.capacity,Math.round(handled*(f.capacity/totalCapacity)));
      remaining-=share;
      const overload=parcelDemand/Math.max(1,totalCapacity);
      f.queue=Math.max(1,Math.round(4+Math.max(0,overload-0.72)*18-randomBetween(0,2)));
      if(overload>1){f.rating=clamp(f.rating-.025*overload,1,5);}else{f.rating=clamp(f.rating+.006,1,5);}
    }
    if(parcelDemand>totalCapacity) report.reasons.push(`ПВЗ района «${district.name}» перегружены: потеряно около ${Math.round(parcelDemand-totalCapacity)} выдач.`);
  }
}

function applyDailyCosts(report) {
  let logistics=0;
  for(const f of playerFacilities()){
    const district=districtById(f.districtId); const site=siteById(f.districtId,f.siteId);
    const rent=Math.round((site?.rent||1000)*district.rent);
    const salary=f.staff*(f.type==="warehouse"?1250:1100);
    const maintenance=Math.round((f.type==="warehouse"?650:280)*f.level);
    report.facilityCosts+=rent+salary+maintenance;
    if(f.type==="pvz") logistics+=Math.round(120*f.level*(1+f.queue/25));
  }
  if(isIndustrialControlled()) logistics*=.88;
  report.facilityCosts+=Math.round(logistics);
  for(const district of DISTRICTS){if(state.districts[district.id].adDays>0) report.adCosts+=CONFIG.localAdCost/CONFIG.localAdDays;}
}

function updateDistrictStatuses(report) {
  for(const district of DISTRICTS){
    const r=state.districts[district.id];
    const old=r.status;
    const share=r.shares.player;
    const pvzs=districtFacilities(district.id,"pvz").filter(f=>f.owner==="player");
    const avgRating=pvzs.length?pvzs.reduce((s,f)=>s+f.rating,0)/pvzs.length:0;
    if(pvzs.length===0&&share<5){r.status=r.unlocked?"available":"locked";r.heldDays=0;}
    else if(share>=CONFIG.dominanceShare&&pvzs.length>=3&&avgRating>=4.4){r.status="dominant";r.heldDays+=1;}
    else if(share>=CONFIG.captureShare&&pvzs.length>=CONFIG.captureMinPvz&&avgRating>=CONFIG.captureMinRating){r.heldDays+=1;r.status=r.heldDays>=CONFIG.captureDays?"controlled":"leader";}
    else if(["controlled","dominant"].includes(old)&&share<CONFIG.loseControlShare){r.status="contested";r.heldDays=0;report.reasons.push(`Район «${district.name}» потерян: доля упала до ${pct(share)}.`);state.events.unshift(`${state.company.name} потерял контроль над районом «${district.name}».`);}
    else if(share>=CONFIG.contestedShare){r.status="contested";r.heldDays=0;}
    else if(pvzs.length){r.status="presence";r.heldDays=0;}
    if(old!==r.status){
      if(r.status==="controlled"){state.events.unshift(`${state.company.name} закрепил контроль над районом «${district.name}»!`);report.reasons.push(`Захвачен район «${district.name}». Открыты новые возможности.`);}
      if(r.status==="dominant"&&old!=="dominant"){state.events.unshift(`В районе «${district.name}» достигнуто доминирование.`);}
    }
    r.loyalty=clamp(r.loyalty+(share>45?.7:share<25?-.4:.1),0,100);
  }
}

function updateUnlocks() {
  for(const district of DISTRICTS){
    const r=state.districts[district.id];
    if(["controlled","dominant"].includes(r.status)){
      for(const neighbor of district.neighbors){state.districts[neighbor].unlocked=true;if(state.districts[neighbor].status==="locked")state.districts[neighbor].status="available";}
    }
  }
  const controlled=DISTRICTS.filter(d=>["controlled","dominant"].includes(state.districts[d.id].status)).length;
  state.unlocks.cityExpansion=controlled>=1;
  state.unlocks.cityWarehouse=controlled>=2;
  state.unlocks.managers=controlled>=3;
}

function isCentralControlled(){return ["controlled","dominant"].includes(state.districts.central.status);}
function isIndustrialControlled(){return ["controlled","dominant"].includes(state.districts.industrial.status);}

function openReportModal(report) {
  if(!report)return;
  showModal(`<p class="eyebrow">ИТОГИ ДНЯ</p><h2>День ${report.day}</h2><p class="modal-lead">Продано ${report.orders} товаров, выдано ${report.parcels} заказов.</p>${reportFullHtml(report)}<button id="close-report" class="primary-btn full" style="margin-top:12px" type="button">Продолжить</button>`,()=>document.getElementById("close-report")?.addEventListener("click",closeModal));
}

bootstrap();

// Expose deterministic helpers for smoke tests.
window.MarketEmpireTest = { priceDemandFactor, normalizeShares, defaultState, CONFIG };
