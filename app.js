"use strict";

const GAME_TITLE = "Marketplace Empire";
const STORAGE_KEY = "market_boss_mvp_v1";
const SAVE_VERSION = 3;
const CITY = window.ME_CITY;
const CITY_CONFIG = CITY.CONFIG;
const DISTRICTS = CITY.DISTRICTS;
const DISTRICT_BY_ID = CITY.DISTRICT_BY_ID;
const CITY_OWNERS = CITY.OWNERS;
const CITY_COMPETITORS = CITY.COMPETITORS;
const PLAYER_OWNER = "player";
const ECONOMY = {
  startingBalance: 50000,
  commissionRate: 0.15,
  deliveryCost: 90,
  returnLogisticsCost: 70,
  baseAdCost: 500,
  featuredProductCost: 650,
  zeroDemandPriceRatio: 1.8,
  baseActionLimit: 3,
  baseWarehouseCapacity: 120,
  storageCostPerUnit: 3,
  salePriceStep: 10,
  ratingMin: 1,
  ratingMax: 5,
  rngModulus: 2147483647,
  rngMultiplier: 48271
};

const COMMISSION_RATE = ECONOMY.commissionRate;
const DELIVERY_COST = ECONOMY.deliveryCost;
const RETURN_LOGISTICS_COST = ECONOMY.returnLogisticsCost;
const DAILY_AD_COST = ECONOMY.baseAdCost;
const FEATURED_PRODUCT_COST = ECONOMY.featuredProductCost;
const ZERO_DEMAND_PRICE_RATIO = ECONOMY.zeroDemandPriceRatio;

const PRODUCTS = [
  { id: "case", emoji: "📱", name: "Чехол для телефона", category: "Аксессуары", cost: 170, marketPrice: 590, demand: 9, competition: 8, returnRate: 0.04, priceSensitivity: 1.28, volume: 1, trendChance: 0.08, shelfLife: 36 },
  { id: "lamp", emoji: "💡", name: "Настольная лампа", category: "Дом", cost: 780, marketPrice: 1690, demand: 6, competition: 5, returnRate: 0.07, priceSensitivity: 1.02, volume: 3, trendChance: 0.04, shelfLife: 42 },
  { id: "bottle", emoji: "🥤", name: "Спортивная бутылка", category: "Спорт", cost: 310, marketPrice: 890, demand: 7, competition: 6, returnRate: 0.05, priceSensitivity: 1.14, volume: 2, trendChance: 0.06, shelfLife: 34 },
  { id: "headphones", emoji: "🎧", name: "Bluetooth-наушники", category: "Электроника", cost: 950, marketPrice: 2290, demand: 8, competition: 9, returnRate: 0.11, priceSensitivity: 1.08, volume: 1, trendChance: 0.07, shelfLife: 26 },
  { id: "organizer", emoji: "🧺", name: "Органайзер для дома", category: "Дом", cost: 420, marketPrice: 1190, demand: 6, competition: 4, returnRate: 0.03, priceSensitivity: 0.92, volume: 3, trendChance: 0.03, shelfLife: 52 },
  { id: "toy", emoji: "🧸", name: "Мягкая игрушка", category: "Детям", cost: 520, marketPrice: 1390, demand: 7, competition: 6, returnRate: 0.06, priceSensitivity: 1.03, volume: 3, trendChance: 0.05, shelfLife: 40 },
  { id: "mouse", emoji: "🖱️", name: "Беспроводная мышь", category: "Электроника", cost: 620, marketPrice: 1590, demand: 7, competition: 8, returnRate: 0.08, priceSensitivity: 1.18, volume: 1, trendChance: 0.06, shelfLife: 32 },
  { id: "notebook", emoji: "📓", name: "Планер на год", category: "Канцелярия", cost: 240, marketPrice: 790, demand: 5, competition: 5, returnRate: 0.02, priceSensitivity: 1.22, volume: 1, trendChance: 0.03, shelfLife: 30 },
  { id: "hoodie", emoji: "🧥", name: "Худи oversize", category: "Одежда", cost: 880, marketPrice: 2190, demand: 8, competition: 7, returnRate: 0.16, priceSensitivity: 1.16, volume: 2, trendChance: 0.08, shelfLife: 24 },
  { id: "mini_fan", emoji: "🌬️", name: "Мини-вентилятор", category: "Тренд", cost: 360, marketPrice: 1290, demand: 6, competition: 5, returnRate: 0.06, priceSensitivity: 0.86, volume: 2, trendChance: 0.18, shelfLife: 16 }
];

const SUPPLIERS = [
  { id: "cheap", title: "Дешёвый риск", emoji: "🏷️", priceFactor: 0.86, quality: 0.82, minQty: 15, delay: 2, reliability: 0.78, defectRate: 0.085, volumeLimit: 70, relationStep: 0.012 },
  { id: "standard", title: "Стандарт", emoji: "📦", priceFactor: 1, quality: 0.94, minQty: 8, delay: 1, reliability: 0.9, defectRate: 0.04, volumeLimit: 50, relationStep: 0.009 },
  { id: "premium", title: "Премиум", emoji: "✅", priceFactor: 1.18, quality: 0.99, minQty: 4, delay: 0, reliability: 0.98, defectRate: 0.012, volumeLimit: 35, relationStep: 0.006 }
];

const AD_STRATEGIES = [
  { id: "none", title: "Без рекламы", emoji: "—", costFactor: 0, demandFactor: 1, risk: 0 },
  { id: "economy", title: "Экономная", emoji: "🌱", costFactor: 0.55, demandFactor: 1.18, risk: 0.04 },
  { id: "standard", title: "Стандарт", emoji: "📣", costFactor: 1, demandFactor: 1.45, risk: 0.08 },
  { id: "aggressive", title: "Агрессивная", emoji: "🔥", costFactor: 1.85, demandFactor: 1.9, risk: 0.16 }
];

const CARD_UPGRADES = [
  { id: "photos", title: "Фотографии", cost: 1400, demandBoost: 0.08, returnReduction: 0.03 },
  { id: "seo", title: "SEO-описание", cost: 1800, demandBoost: 0.1, returnReduction: 0.02 },
  { id: "infographics", title: "Инфографика", cost: 2400, demandBoost: 0.13, returnReduction: 0.04 },
  { id: "video", title: "Видео", cost: 3600, demandBoost: 0.16, returnReduction: 0.03 }
];

const MAX_UPGRADE_LEVEL = 5;

const DAILY_ACTIONS = [
  {
    id: "pricing",
    emoji: "🧠",
    title: "Аналитика цен",
    text: "Спрос меньше проседает от умеренно высокой цены.",
    cost: 250,
    priceSensitivityMultiplier: 0.78,
    demandMultiplier: 1,
    returnMultiplier: 1,
    ratingBonus: 0
  },
  {
    id: "content",
    emoji: "🖼️",
    title: "Карточки товара",
    text: "Больше переходов, но нужен бюджет на фото и описание.",
    cost: 520,
    priceSensitivityMultiplier: 1,
    demandMultiplier: 1.18,
    returnMultiplier: 1,
    ratingBonus: 0
  },
  {
    id: "support",
    emoji: "🛡️",
    title: "Сервис и возвраты",
    text: "Меньше возвратов и чуть лучше рейтинг.",
    cost: 420,
    priceSensitivityMultiplier: 1,
    demandMultiplier: 0.98,
    returnMultiplier: 0.66,
    ratingBonus: 0.012
  },
  {
    id: "supplier",
    emoji: "🤝",
    title: "Поставщики",
    text: "Закупка дешевле до конца дня. Выгодно перед крупной партией.",
    cost: 350,
    priceSensitivityMultiplier: 1,
    demandMultiplier: 1,
    returnMultiplier: 1,
    ratingBonus: 0,
    purchaseDiscount: 0.08
  }
];

const MARKET_EVENTS = [
  {
    id: "steady",
    emoji: "📈",
    title: "Ровный спрос",
    text: "Покупатели ведут себя предсказуемо. Хороший день, чтобы тестировать цены.",
    demandMultiplier: 1,
    adCostMultiplier: 1,
    returnMultiplier: 1,
    categoryBoosts: {}
  },
  {
    id: "electronics",
    emoji: "⚡",
    title: "Всплеск электроники",
    text: "Покупатели ищут гаджеты и аксессуары. Электроника получает больше показов.",
    demandMultiplier: 1.04,
    adCostMultiplier: 1,
    returnMultiplier: 1.02,
    categoryBoosts: { "Электроника": 1.32, "Аксессуары": 1.14 }
  },
  {
    id: "home",
    emoji: "🏠",
    title: "Неделя уюта",
    text: "Лучше продаются товары для дома. Возвратов чуть меньше обычного.",
    demandMultiplier: 1.03,
    adCostMultiplier: 0.96,
    returnMultiplier: 0.92,
    categoryBoosts: { "Дом": 1.3 }
  },
  {
    id: "sale_hunters",
    emoji: "🏷️",
    title: "Охота за скидками",
    text: "Спрос растет, но покупатели сильнее реагируют на завышенные цены.",
    demandMultiplier: 1.16,
    adCostMultiplier: 1.08,
    returnMultiplier: 1,
    priceSensitivity: 1.18,
    categoryBoosts: {}
  },
  {
    id: "logistics_pressure",
    emoji: "🚚",
    title: "Перегрузка доставки",
    text: "Логистика дорожает, а возвраты становятся болезненнее.",
    demandMultiplier: 0.96,
    adCostMultiplier: 1,
    returnMultiplier: 1.18,
    logisticsMultiplier: 1.18,
    categoryBoosts: {}
  },
  {
    id: "kids_sport",
    emoji: "🎯",
    title: "Активные выходные",
    text: "Спорт и детские товары получают дополнительный спрос.",
    demandMultiplier: 1.06,
    adCostMultiplier: 0.98,
    returnMultiplier: 0.98,
    categoryBoosts: { "Спорт": 1.28, "Детям": 1.24 }
  }
];

const UPGRADE_DEFS = [
  {
    id: "brand",
    emoji: "🏆",
    title: "Бренд магазина",
    text: "Покупатели охотнее заказывают и чуть лучше реагируют на сервис.",
    baseCost: 7000,
    costStep: 1.55,
    effect: "+2.5% к спросу за уровень"
  },
  {
    id: "logistics",
    emoji: "🚚",
    title: "Логистика",
    text: "Доставка становится дешевле, а возвратов меньше.",
    baseCost: 6200,
    costStep: 1.5,
    effect: "−9 ₽ к доставке за уровень"
  },
  {
    id: "marketing",
    emoji: "📣",
    title: "Маркетинг",
    text: "Реклама дает больше продаж и обходится дешевле.",
    baseCost: 5600,
    costStep: 1.48,
    effect: "+10% к рекламе и −45 ₽/день"
  },
  {
    id: "analytics",
    emoji: "📊",
    title: "Аналитика",
    text: "Точнее выбираете цены и меньше теряете спрос в конкуренции.",
    baseCost: 8400,
    costStep: 1.6,
    effect: "+3.5% к спросу за уровень"
  },
  {
    id: "warehouse",
    emoji: "🏬",
    title: "Склад",
    text: "Больше вместимость и меньше ежедневные расходы на хранение.",
    baseCost: 6800,
    costStep: 1.52,
    effect: "+25 ед. вместимости и −6% хранения"
  }
];

const STAFF_DEFS = [
  {
    id: "analyst",
    emoji: "🧠",
    title: "Аналитик",
    hireCost: 11000,
    salary: 520,
    text: "Даёт дополнительное очко управления и точнее прогнозирует спрос.",
    effect: "+1 очко управления"
  },
  {
    id: "buyer",
    emoji: "🤝",
    title: "Закупщик",
    hireCost: 9000,
    salary: 430,
    text: "Улучшает отношения с поставщиками и снижает цену закупки.",
    effect: "−3% к закупке"
  },
  {
    id: "ads",
    emoji: "📣",
    title: "Рекламщик",
    hireCost: 9500,
    salary: 480,
    text: "Повышает эффективность рекламных стратегий.",
    effect: "+12% к рекламе"
  },
  {
    id: "support",
    emoji: "🛡️",
    title: "Поддержка",
    hireCost: 8200,
    salary: 410,
    text: "Снижает ущерб от отзывов и возвратов.",
    effect: "−10% возвратов"
  },
  {
    id: "warehouse",
    emoji: "🏬",
    title: "Складской управляющий",
    hireCost: 10500,
    salary: 460,
    text: "Уменьшает хранение и помогает с переполнением склада.",
    effect: "−15% хранения"
  },
  {
    id: "content",
    emoji: "🖼️",
    title: "Менеджер карточек",
    hireCost: 7800,
    salary: 390,
    text: "Дешевле улучшает карточки и повышает доверие покупателей.",
    effect: "−12% к улучшениям"
  }
];

const AUTOMATION_DEFS = [
  {
    id: "autoPrice",
    emoji: "🏷️",
    title: "Цена −5% к рынку",
    text: "Перед днём держит цены активных товаров примерно на 5% ниже рынка.",
    requires: "analyst"
  },
  {
    id: "autoRestock",
    emoji: "📦",
    title: "Автозаказ остатков",
    text: "Если товара меньше 5 шт., закупщик заказывает минимальную стандартную партию.",
    requires: "buyer"
  },
  {
    id: "autoStopAds",
    emoji: "🧯",
    title: "Стоп дорогой рекламы",
    text: "Отключает рекламу у товаров с нулевым прогнозом спроса.",
    requires: "ads"
  }
];

const GOALS = [
  {
    id: "first_orders",
    title: "Первые 10 продаж",
    text: "Проверьте товарную гипотезу и получите первые отзывы.",
    target: 10,
    reward: 2500,
    value: () => state.totalOrders
  },
  {
    id: "stable_revenue",
    title: "Выручка 100 000 ₽",
    text: "Разгоните оборот магазина до заметного уровня.",
    target: 100000,
    reward: 7000,
    value: () => state.totalRevenue
  },
  {
    id: "quality_rating",
    title: "Рейтинг 4.70",
    text: "Держите сервис и возвраты под контролем.",
    target: 470,
    reward: 5000,
    value: () => Math.round(state.rating * 100),
    progressLabel: value => (value / 100).toFixed(2)
  },
  {
    id: "profit_machine",
    title: "Прибыль 40 000 ₽",
    text: "Настройте цены, рекламу и логистику так, чтобы магазин зарабатывал.",
    target: 40000,
    reward: 9000,
    value: () => state.totalProfit
  },
  {
    id: "seller_level",
    title: "Уровень продавца 3",
    text: "Продайте 100 товаров и откройте статус сильного продавца.",
    target: 3,
    reward: 12000,
    value: () => sellerLevel()
  }
];

const defaultState = () => ({
  saveVersion: SAVE_VERSION,
  day: 1,
  balance: ECONOMY.startingBalance,
  rating: 4.5,
  totalRevenue: 0,
  totalProfit: 0,
  totalOrders: 0,
  city: CITY.initialCityState(),
  districts: CITY.initialDistrictState(),
  cityCompetitors: CITY.initialCompetitorCompanies(),
  inventory: {},
  shipments: [],
  suppliers: initialSupplierState(),
  market: initialMarketState(),
  competitors: initialCompetitorState(),
  upgrades: {},
  staff: {},
  automations: {},
  claimedGoals: [],
  dailyAction: "pricing",
  featuredProductId: null,
  marketEventId: "steady",
  actionsUsed: 0,
  dailyTask: null,
  financeHistory: [],
  marketHistory: [],
  districtShareHistory: [],
  pendingEvent: null,
  tutorial: { done: false, skipped: false, step: 0 },
  rngSeed: Math.max(1, Date.now() % ECONOMY.rngModulus),
  lastReport: null,
  events: ["Магазин открыт. Закупите первый товар на вкладке «Рынок»."],
  createdAt: Date.now()
});

let state = loadState();
let activeTab = "home";
let purchaseProductId = null;
let toastTimer = null;

const view = document.getElementById("view");
const pageTitle = document.getElementById("page-title");
const headerDay = document.getElementById("header-day");
const modalBackdrop = document.getElementById("modal-backdrop");
const modalContent = document.getElementById("modal-content");
const modalClose = document.getElementById("modal-close");
const toast = document.getElementById("toast");

const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  try { tg.enableClosingConfirmation(); } catch (_) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return migrateState(parsed);
  } catch (error) {
    console.warn("Не удалось загрузить сохранение", error);
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function migrateState(saved) {
  const base = defaultState();
  const migratedInventory = {};
  for (const [id, item] of Object.entries(saved.inventory || {})) {
    const product = productById(id);
    if (!product) continue;
    migratedInventory[id] = normalizeInventoryItem(product, item);
  }

  const migrated = {
    ...base,
    ...saved,
    saveVersion: SAVE_VERSION,
    city: migrateCityState(saved.city || {}, saved, base.city),
    districts: migrateDistrictState(saved.districts || {}, base.districts),
    cityCompetitors: mergeDeep(base.cityCompetitors, saved.cityCompetitors || {}),
    inventory: migratedInventory,
    shipments: Array.isArray(saved.shipments) ? saved.shipments.filter(item => productById(item.productId)) : [],
    suppliers: mergeDeep(base.suppliers, saved.suppliers || {}),
    market: mergeDeep(base.market, saved.market || {}),
    competitors: mergeDeep(base.competitors, saved.competitors || {}),
    upgrades: saved.upgrades || {},
    staff: saved.staff || {},
    automations: saved.automations || {},
    claimedGoals: Array.isArray(saved.claimedGoals) ? saved.claimedGoals : [],
    dailyAction: DAILY_ACTIONS.some(action => action.id === saved.dailyAction) ? saved.dailyAction : "pricing",
    featuredProductId: productById(saved.featuredProductId) ? saved.featuredProductId : null,
    marketEventId: MARKET_EVENTS.some(event => event.id === saved.marketEventId) ? saved.marketEventId : "steady",
    actionsUsed: clamp(Number(saved.actionsUsed || 0), 0, actionLimit(saved.upgrades || {}, saved.staff || {})),
    dailyTask: saved.dailyTask || createDailyTask(base.day),
    financeHistory: Array.isArray(saved.financeHistory) ? saved.financeHistory.slice(-14) : [],
    marketHistory: Array.isArray(saved.marketHistory) ? saved.marketHistory.slice(-14) : [],
    districtShareHistory: Array.isArray(saved.districtShareHistory) ? saved.districtShareHistory.slice(-20) : [],
    pendingEvent: saved.pendingEvent || null,
    tutorial: { ...base.tutorial, ...(saved.tutorial || {}) },
    rngSeed: Number.isFinite(saved.rngSeed) && saved.rngSeed > 0 ? saved.rngSeed : base.rngSeed
  };

  if (!migrated.dailyTask) migrated.dailyTask = createDailyTask(migrated.day);
  return migrated;
}

function normalizeInventoryItem(product, item = {}) {
  const card = item.card || {};
  return {
    qty: Math.max(0, Math.floor(Number(item.qty || 0))),
    price: Math.max(1, Number(item.price || product.marketPrice)),
    adActive: Boolean(item.adActive),
    adStrategy: item.adStrategy || (item.adActive ? "standard" : "none"),
    supplierId: item.supplierId || "standard",
    lifetimeSold: Math.max(0, Math.floor(Number(item.lifetimeSold || 0))),
    card: {
      level: clamp(Number(card.level || 0), 0, CARD_UPGRADES.length),
      upgrades: Array.isArray(card.upgrades) ? card.upgrades.filter(id => CARD_UPGRADES.some(upgrade => upgrade.id === id)) : [],
      rating: clamp(Number(card.rating || 4.3), 1, 5),
      reviews: Math.max(0, Math.floor(Number(card.reviews || 0))),
      trust: clamp(Number(card.trust || 0.62), 0, 1)
    },
    stopped: Boolean(item.stopped),
    age: Math.max(0, Math.floor(Number(item.age || 0))),
    damaged: Math.max(0, Math.floor(Number(item.damaged || 0)))
  };
}

function migrateCityState(savedCity = {}, saved = {}, baseCity = CITY.initialCityState()) {
  const hasOldSave = Boolean(saved.saveVersion || saved.day > 1 || saved.inventory);
  const storeName = sanitizeStoreName(savedCity.storeName || saved.storeName || (hasOldSave ? "MarketFox" : ""));
  const brandColor = CITY_CONFIG.brandColors.includes(savedCity.brandColor) ? savedCity.brandColor : baseCity.brandColor;
  const selectedDistrictId = DISTRICT_BY_ID[savedCity.selectedDistrictId] ? savedCity.selectedDistrictId : "south";
  const mechanics = { ...baseCity.unlockedMechanics, ...(savedCity.unlockedMechanics || {}) };

  return {
    ...baseCity,
    ...savedCity,
    storeName,
    brandColor,
    onboardingDone: Boolean(savedCity.onboardingDone || (hasOldSave && storeName)),
    mapMode: savedCity.mapMode === "district" ? "district" : "city",
    selectedDistrictId,
    builtCityWarehouse: Boolean(savedCity.builtCityWarehouse),
    pendingDistrictAdSpend: Math.max(0, Number(savedCity.pendingDistrictAdSpend || 0)),
    tipsSeen: savedCity.tipsSeen && typeof savedCity.tipsSeen === "object" ? savedCity.tipsSeen : {},
    unlockedMechanics: mechanics
  };
}

function migrateDistrictState(savedDistricts = {}, baseDistricts = CITY.initialDistrictState()) {
  return Object.fromEntries(DISTRICTS.map(districtDef => {
    const base = baseDistricts[districtDef.id];
    const saved = savedDistricts[districtDef.id] || {};
    const pickupPoints = mergePickupPoints(base.pickupPoints, saved.pickupPoints);
    const shares = normalizeShareObject({ ...base.shares, ...(saved.shares || {}) });
    const targetShares = normalizeShareObject({ ...shares, ...(saved.targetShares || {}) });
    return [districtDef.id, {
      ...base,
      ...saved,
      id: districtDef.id,
      unlocked: Boolean(saved.unlocked ?? base.unlocked),
      controlled: Boolean(saved.controlled),
      dominated: Boolean(saved.dominated),
      leaderDays: Math.max(0, Number(saved.leaderDays || 0)),
      controlledDays: Math.max(0, Number(saved.controlledDays || 0)),
      dominanceDays: Math.max(0, Number(saved.dominanceDays || 0)),
      status: typeof saved.status === "string" ? saved.status : base.status,
      shares,
      targetShares,
      loyalty: { ...base.loyalty, ...(saved.loyalty || {}) },
      localAd: saved.localAd && Number(saved.localAd.days) > 0 ? saved.localAd : null,
      competitorCampaigns: saved.competitorCampaigns && typeof saved.competitorCampaigns === "object" ? saved.competitorCampaigns : {},
      pickupPoints,
      warehouses: Array.isArray(saved.warehouses) ? saved.warehouses : base.warehouses,
      history: Array.isArray(saved.history) ? saved.history.slice(-14) : base.history
    }];
  }));
}

function mergePickupPoints(basePoints = [], savedPoints = []) {
  const savedById = new Map((Array.isArray(savedPoints) ? savedPoints : []).map(point => [point.id, point]));
  return basePoints.map(basePoint => {
    const saved = savedById.get(basePoint.id) || {};
    const owner = ["player", "lowprice", "premiumbox", "fastgo", null].includes(saved.owner) ? saved.owner : basePoint.owner;
    const level = owner ? clamp(Number(saved.level ?? basePoint.level), 1, 4) : 0;
    return {
      ...basePoint,
      ...saved,
      owner,
      level,
      name: sanitizeFacilityName(saved.name || basePoint.name),
      capacity: owner ? Math.max(20, Number(saved.capacity || basePoint.capacity || 42)) : 0,
      load: owner ? clamp(Number(saved.load ?? basePoint.load), 0, 1.25) : 0,
      staff: owner ? Math.max(1, Math.floor(Number(saved.staff || basePoint.staff || 1))) : 0,
      serviceSpeed: owner ? clamp(Number(saved.serviceSpeed || basePoint.serviceSpeed || 0.9), 0.4, 2.2) : 0,
      rating: owner ? clamp(Number(saved.rating || basePoint.rating || 4.1), 1, 5) : 0,
      condition: clamp(Number(saved.condition || basePoint.condition || 0.75), 0.25, 1.05),
      awareness: clamp(Number(saved.awareness || basePoint.awareness || 0), 0, 1),
      coverage: Math.max(0, Number(saved.coverage || basePoint.coverage || 8)),
      queue: Math.max(0, Number(saved.queue || basePoint.queue || 0)),
      income: Math.max(0, Number(saved.income || 0)),
      expenses: Math.max(0, Number(saved.expenses || 0)),
      problems: Array.isArray(saved.problems) ? saved.problems : []
    };
  });
}

function sanitizeStoreName(value) {
  const text = String(value || "").trim().replace(/\s+/g, " ");
  return text.slice(0, 24);
}

function sanitizeFacilityName(value) {
  const text = String(value || "").trim().replace(/\s+/g, " ");
  return text.slice(0, 42);
}

function normalizeShareObject(input = {}) {
  const owners = ["player", "lowprice", "premiumbox", "fastgo", "other"];
  const raw = Object.fromEntries(owners.map(owner => [owner, Math.max(0, Number(input[owner] || 0))]));
  const total = Object.values(raw).reduce((sum, value) => sum + value, 0) || 1;
  const normalized = Object.fromEntries(owners.map(owner => [owner, Math.round(raw[owner] / total * 1000) / 10]));
  const drift = Math.round((100 - Object.values(normalized).reduce((sum, value) => sum + value, 0)) * 10) / 10;
  normalized.other = Math.max(0, Math.round((normalized.other + drift) * 10) / 10);
  return normalized;
}

function mergeDeep(base, saved) {
  const result = { ...base };
  for (const [key, value] of Object.entries(saved || {})) {
    if (value && typeof value === "object" && !Array.isArray(value) && base[key]) {
      result[key] = mergeDeep(base[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function initialSupplierState() {
  return Object.fromEntries(PRODUCTS.map(product => [
    product.id,
    Object.fromEntries(SUPPLIERS.map(supplier => [supplier.id, { relation: 0, unlocked: true }]))
  ]));
}

function initialMarketState() {
  return Object.fromEntries(PRODUCTS.map(product => {
    const demand = product.demand;
    return [product.id, {
      price: product.marketPrice,
      demand,
      trend: "stable",
      trendPower: 0,
      competitors: product.competition,
      saturation: clamp(product.competition / 10, 0.2, 0.95),
      life: product.shelfLife,
      history: [{
        day: 1,
        price: product.marketPrice,
        demand,
        trend: "stable",
        competitors: product.competition
      }]
    }];
  }));
}

function initialCompetitorState() {
  const strategies = ["Демпинг", "Премиум", "Агрессивная реклама"];
  return Object.fromEntries(PRODUCTS.map(product => [
    product.id,
    strategies.map((strategy, index) => ({
      strategy,
      price: Math.round(product.marketPrice * [0.88, 1.18, 1.02][index] / 10) * 10,
      rating: [4.1, 4.8, 4.4][index],
      ads: [0.4, 0.25, 0.85][index],
      sales: Math.max(1, Math.round(product.demand * [1.25, 0.65, 1.05][index]))
    }))
  ]));
}

function money(value) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(value)) + " ₽";
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function actionLimit(upgrades = state?.upgrades || {}, staff = state?.staff || {}) {
  return ECONOMY.baseActionLimit + Math.floor(Number(upgrades.analytics || 0) / 2) + (staff.analyst ? 1 : 0);
}

function actionsLeft() {
  return Math.max(0, actionLimit() - state.actionsUsed);
}

function spendActionPoint(label) {
  if (actionsLeft() <= 0) {
    notify(`Не хватает очков управления для действия «${label}»`);
    return false;
  }
  state.actionsUsed += 1;
  return true;
}

function warehouseCapacity() {
  return ECONOMY.baseWarehouseCapacity + upgradeLevel("warehouse") * 25 + warehouseFacilityCapacity();
}

function storageUsed(extraShipments = false) {
  const stock = Object.entries(state.inventory).reduce((sum, [id, item]) => {
    const product = productById(id);
    return sum + (product ? item.qty * product.volume : 0);
  }, 0);
  if (!extraShipments) return stock;
  return stock + state.shipments.reduce((sum, shipment) => {
    const product = productById(shipment.productId);
    return sum + (product ? shipment.qty * product.volume : 0);
  }, 0);
}

function currentMarket(productOrId) {
  const product = typeof productOrId === "string" ? productById(productOrId) : productOrId;
  if (!product) return { price: 1, demand: 1, trend: "stable", competitors: 1, history: [] };
  return state?.market?.[product.id] || initialMarketState()[product.id];
}

function staffHired(id) {
  return Boolean(state?.staff?.[id]);
}

function staffSalaryTotal() {
  return STAFF_DEFS.reduce((sum, staff) => sum + (staffHired(staff.id) ? staff.salary : 0), 0);
}

function automationEnabled(id) {
  return Boolean(state?.automations?.[id]);
}

function supplierById(id) {
  return SUPPLIERS.find(supplier => supplier.id === id) || SUPPLIERS[1];
}

function adStrategyById(id) {
  return AD_STRATEGIES.find(strategy => strategy.id === id) || AD_STRATEGIES[0];
}

function random() {
  if (!state?.rngSeed) return Math.random();
  state.rngSeed = (state.rngSeed * ECONOMY.rngMultiplier) % ECONOMY.rngModulus;
  return state.rngSeed / ECONOMY.rngModulus;
}

function randomBetween(min, max) {
  return min + random() * (max - min);
}

function avg(values) {
  const list = values.filter(value => Number.isFinite(value));
  if (!list.length) return 0;
  return list.reduce((sum, value) => sum + value, 0) / list.length;
}

function vibrate(type = "light") {
  try { tg?.HapticFeedback?.impactOccurred(type); } catch (_) {}
}

function notify(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function installWheelScrollFallback() {
  document.addEventListener("wheel", event => {
    if (event.ctrlKey || event.defaultPrevented || Math.abs(event.deltaY) < 1) return;
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest("input, textarea, select")) return;
    if (!modalBackdrop.classList.contains("hidden") && target?.closest(".modal")) return;

    const page = document.scrollingElement || document.documentElement;
    const maxScroll = page.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;

    event.preventDefault();
    window.scrollBy({ top: event.deltaY, left: 0, behavior: "auto" });
  }, { passive: false });
}

function productById(id) {
  return PRODUCTS.find(product => product.id === id);
}

function currentDailyAction() {
  return DAILY_ACTIONS.find(action => action.id === state.dailyAction) || DAILY_ACTIONS[0];
}

function featuredProduct() {
  if (!state.featuredProductId || !state.inventory[state.featuredProductId]?.qty) return null;
  return productById(state.featuredProductId);
}

function purchaseCost(product, supplierId = null) {
  const action = currentDailyAction();
  const supplier = supplierById(supplierId || state.inventory[product.id]?.supplierId || "standard");
  const relation = state.suppliers?.[product.id]?.[supplier.id]?.relation || 0;
  const actionDiscount = action.purchaseDiscount || 0;
  const relationDiscount = clamp(relation * 0.08, 0, 0.12);
  const staffDiscount = staffHired("buyer") ? 0.03 : 0;
  return Math.max(1, Math.round(product.cost * supplier.priceFactor * (1 - actionDiscount - relationDiscount - staffDiscount)));
}

function inventoryValue() {
  return Object.entries(state.inventory).reduce((sum, [id, item]) => {
    const product = productById(id);
    return sum + (product ? product.cost * item.qty : 0);
  }, 0);
}

function grossMargin(product, price) {
  return price - purchaseCost(product) - price * COMMISSION_RATE - effectiveDeliveryCost();
}

function ownedProducts() {
  return PRODUCTS.filter(product => state.inventory[product.id]);
}

function sellerLevel() {
  return Math.max(1, Math.floor(state.totalOrders / 50) + 1);
}

function currentMarketEvent() {
  return MARKET_EVENTS.find(event => event.id === state.marketEventId) || MARKET_EVENTS[0];
}

function pickNextMarketEvent(previousId = state.marketEventId) {
  const pool = MARKET_EVENTS.filter(event => event.id !== previousId);
  return pool[Math.floor(Math.random() * pool.length)] || MARKET_EVENTS[0];
}

function upgradeLevel(id) {
  return clamp(Number(state.upgrades?.[id] || 0), 0, MAX_UPGRADE_LEVEL);
}

function upgradeCost(upgrade) {
  return Math.round((upgrade.baseCost * Math.pow(upgrade.costStep, upgradeLevel(upgrade.id))) / 100) * 100;
}

function effectiveAdCost() {
  const event = currentMarketEvent();
  const discount = upgradeLevel("marketing") * 45;
  return Math.round(Math.max(250, DAILY_AD_COST - discount) * (event.adCostMultiplier || 1));
}

function effectiveDeliveryCost() {
  const event = currentMarketEvent();
  const discount = upgradeLevel("logistics") * 9;
  return Math.round(Math.max(45, DELIVERY_COST - discount) * (event.logisticsMultiplier || 1) * (1 - cityLogisticsDiscount()));
}

function effectiveReturnLogisticsCost() {
  const event = currentMarketEvent();
  const discount = upgradeLevel("logistics") * 5;
  return Math.round(Math.max(35, RETURN_LOGISTICS_COST - discount) * (event.logisticsMultiplier || 1) * (1 - cityLogisticsDiscount()));
}

function effectiveReturnRate(product) {
  const event = currentMarketEvent();
  const item = state.inventory[product.id];
  const supplier = supplierById(item?.supplierId || "standard");
  const cardReduction = (item?.card?.upgrades?.length || 0) * 0.018;
  const serviceReduction = 1 - upgradeLevel("logistics") * 0.035 - upgradeLevel("brand") * 0.015 - (staffHired("support") ? 0.1 : 0);
  const supplierRisk = 1 + (1 - supplier.quality) * 1.25 + supplier.defectRate * 1.5;
  return clamp(product.returnRate * (event.returnMultiplier || 1) * serviceReduction * supplierRisk * (1 - cardReduction), 0.005, 0.32);
}

function productDemandMultiplier(product) {
  const event = currentMarketEvent();
  const item = state.inventory[product.id];
  const categoryBoost = event.categoryBoosts?.[product.category] || 1;
  const brandBoost = 1 + upgradeLevel("brand") * 0.025;
  const analyticsBoost = 1 + upgradeLevel("analytics") * 0.035;
  const cardBoost = 1 + (item?.card?.upgrades?.length || 0) * 0.08 + (item?.card?.trust || 0) * 0.12 + (staffHired("content") ? 0.04 : 0);
  const actionBoost = currentDailyAction().demandMultiplier || 1;
  const featuredBoost = state.featuredProductId === product.id ? 1.34 : 1;
  return (event.demandMultiplier || 1) * categoryBoost * brandBoost * analyticsBoost * cardBoost * actionBoost * featuredBoost * citySalesMultiplier(product);
}

function competitionFactor(product) {
  const analyticsRelief = upgradeLevel("analytics") * 0.35;
  return clamp(1.22 - (product.competition - analyticsRelief) * 0.055, 0.55, 1.12);
}

function priceDemandFactor(product, price, sensitivity = 1) {
  if (!Number.isFinite(price) || price <= 0) return 0;
  const marketPrice = currentMarket(product).price || product.marketPrice;
  if (price >= marketPrice * ZERO_DEMAND_PRICE_RATIO) return 0;
  const ratio = price / marketPrice;
  if (ratio <= 0.8) return 1.75;
  if (ratio <= 1) return clamp(1.28 - (ratio - 0.8) * 1.15, 1.05, 1.75);
  if (ratio <= 1.2) return clamp(1.05 - (ratio - 1) * 1.35 * sensitivity, 0.74, 1.05);
  if (ratio <= 1.5) return clamp(0.74 - (ratio - 1.2) * 1.45 * sensitivity, 0.26, 0.74);
  return clamp(0.26 - (ratio - 1.5) * 0.82 * sensitivity, 0, 0.26);
}

function priceDemandChance(product, price) {
  const event = currentMarketEvent();
  const action = currentDailyAction();
  const market = currentMarket(product);
  const trendRelief = ["viral", "growing"].includes(market.trend) ? 0.82 : 1;
  const sensitivity = (event.priceSensitivity || 1) * (action.priceSensitivityMultiplier || 1) * (product.priceSensitivity || 1) * trendRelief;
  const factor = priceDemandFactor(product, price, sensitivity);
  return Math.round(clamp(factor / 1.45 * 100, 0, 100));
}

function productRiskLabel(product, price) {
  const chance = priceDemandChance(product, price);
  if (chance === 0) return { label: "Спрос 0%", className: "bad" };
  const marketPrice = currentMarket(product).price || product.marketPrice;
  if (price > marketPrice * 1.45) return { label: `Риск: ${chance}%`, className: "bad" };
  if (price > marketPrice * 1.12) return { label: `Спрос: ${chance}%`, className: "" };
  return { label: `Спрос: ${chance}%`, className: "good" };
}

function salesForecast(product, item = state.inventory[product.id]) {
  if (!item || item.stopped || item.qty <= 0) return { min: 0, max: 0, expected: 0 };
  const market = currentMarket(product);
  const action = currentDailyAction();
  const strategy = adStrategyById(item.adStrategy || "none");
  const sensitivity = (market.trend === "viral" ? 0.82 : 1) * (product.priceSensitivity || 1) * (action.priceSensitivityMultiplier || 1);
  const priceFactor = priceDemandFactor(product, item.price, sensitivity);
  const ratingFactor = clamp(state.rating / 4.5, 0.62, 1.18);
  const competitorPressure = clamp(1.24 - market.competitors * 0.045, 0.45, 1.12);
  const expected = market.demand * 1.3 * priceFactor * productDemandMultiplier(product) * ratingFactor * competitorPressure * strategy.demandFactor;
  return {
    min: Math.max(0, Math.floor(expected * 0.65)),
    max: Math.max(0, Math.ceil(expected * 1.35)),
    expected: Math.max(0, expected)
  };
}

function updateMarketForNewDay() {
  const snapshots = [];
  for (const product of PRODUCTS) {
    const market = currentMarket(product);
    let trend = market.trend || "stable";
    let trendPower = Number(market.trendPower || 0);

    if (random() < product.trendChance * 0.18) {
      const roll = random();
      trend = roll > 0.82 ? "viral" : roll > 0.55 ? "growing" : roll > 0.28 ? "falling" : "saturated";
      trendPower = randomBetween(0.08, trend === "viral" ? 0.32 : 0.18);
    } else {
      trendPower *= randomBetween(0.72, 0.94);
      if (Math.abs(trendPower) < 0.025) trend = "stable";
    }

    const trendSign = trend === "growing" || trend === "viral" ? 1 : trend === "falling" || trend === "saturated" ? -1 : 0;
    const competitorDrift = randomBetween(-0.45, 0.55) + (trend === "viral" ? 0.55 : trend === "saturated" ? 0.75 : 0);
    const competitors = clamp(Math.round((market.competitors || product.competition) + competitorDrift), 1, 15);
    const demandShift = trendSign * trendPower * 6 + randomBetween(-0.36, 0.36) - (competitors - product.competition) * 0.035;
    const demand = clamp((market.demand || product.demand) + demandShift, 1, 12);
    const priceShift = trendSign * trendPower + randomBetween(-0.035, 0.04) - (competitors - product.competition) * 0.006;
    const price = Math.max(product.cost * 1.18, Math.round((market.price || product.marketPrice) * (1 + priceShift) / 10) * 10);
    const saturation = clamp((market.saturation || product.competition / 10) + competitors * 0.003 - demand * 0.004, 0.1, 1);
    const life = Math.max(0, (market.life ?? product.shelfLife) - (trend === "viral" ? 2 : 1));
    const history = [...(market.history || []), { day: state.day, price, demand, trend, competitors }].slice(-10);

    state.market[product.id] = { price, demand, trend, trendPower, competitors, saturation, life, history };
    snapshots.push({ id: product.id, price, demand, trend, competitors });
  }
  state.marketHistory = [{ day: state.day, items: snapshots }, ...state.marketHistory].slice(0, 10);
}

function updateCompetitorsForNewDay() {
  for (const product of PRODUCTS) {
    const market = currentMarket(product);
    const competitors = state.competitors[product.id] || [];
    state.competitors[product.id] = competitors.map(competitor => {
      const strategyBias = competitor.strategy === "Демпинг" ? -0.035 : competitor.strategy === "Премиум" ? 0.035 : 0;
      const price = Math.max(product.cost, Math.round(competitor.price * (1 + strategyBias + randomBetween(-0.035, 0.035)) / 10) * 10);
      const ads = clamp(competitor.ads + randomBetween(-0.08, 0.08), 0, 1);
      const rating = clamp(competitor.rating + randomBetween(-0.035, 0.025), 3.2, 5);
      const sales = Math.max(0, Math.round(market.demand * ads * (market.price / price) * randomBetween(0.6, 1.35)));
      return { ...competitor, price, ads, rating, sales };
    });
  }
}

function trendLabel(trend) {
  return {
    stable: "стабилен",
    growing: "растёт",
    falling: "падает",
    viral: "вирусный рост",
    saturated: "перенасыщение"
  }[trend] || "стабилен";
}

function createDailyTask(day = state.day) {
  const templates = [
    { id: "profit", title: "Закончить день с прибылью", target: 1, reward: 900 },
    { id: "orders", title: "Продать 8 товаров", target: 8, reward: 1200 },
    { id: "rating", title: "Сохранить рейтинг 4.50+", target: 450, reward: 1000 },
    { id: "no_loss", title: "Не уйти в минус по балансу", target: 1, reward: 700 }
  ];
  return { ...templates[day % templates.length], done: false, claimed: false };
}

function evaluateDailyTask(report) {
  const task = state.dailyTask || createDailyTask();
  const success =
    (task.id === "profit" && report.profit > 0) ||
    (task.id === "orders" && report.sold >= task.target) ||
    (task.id === "rating" && state.rating * 100 >= task.target) ||
    (task.id === "no_loss" && state.balance >= 0);
  if (success && !task.claimed) {
    state.balance += task.reward;
    state.events.unshift(`Ежедневная задача выполнена: «${task.title}». Награда ${money(task.reward)}.`);
    state.dailyTask = { ...task, done: true, claimed: true };
  } else {
    state.dailyTask = { ...task, done: success };
  }
}

function receiveDueShipments() {
  const arrived = [];
  const waiting = [];
  for (const shipment of state.shipments) {
    if (shipment.arrivalDay <= state.day) arrived.push(shipment);
    else waiting.push(shipment);
  }
  state.shipments = waiting;

  for (const shipment of arrived) {
    const product = productById(shipment.productId);
    if (!product) continue;
    if (!state.inventory[product.id]) {
      state.inventory[product.id] = normalizeInventoryItem(product, { qty: 0, price: currentMarket(product).price, supplierId: shipment.supplierId });
    }
    const supplier = supplierById(shipment.supplierId);
    const failed = random() > supplier.reliability;
    const defectRate = failed ? supplier.defectRate * 2.4 : supplier.defectRate;
    const defective = Math.min(shipment.qty, Math.round(shipment.qty * defectRate * randomBetween(0.45, 1.4)));
    const accepted = shipment.qty - defective;
    state.inventory[product.id].qty += accepted;
    state.inventory[product.id].damaged += defective;
    state.inventory[product.id].supplierId = supplier.id;
    state.suppliers[product.id][supplier.id].relation = clamp((state.suppliers[product.id][supplier.id].relation || 0) + supplier.relationStep, 0, 1);

    const text = failed
      ? `Поставка «${product.name}» пришла с проблемами: принято ${accepted} шт., брак ${defective} шт.`
      : `Поставка «${product.name}» прибыла: ${accepted} шт.${defective ? `, брак ${defective} шт.` : ""}`;
    state.events.unshift(text);
  }
  return arrived;
}

function holdingCost() {
  const discount = 1 - upgradeLevel("warehouse") * 0.06;
  const staffDiscount = staffHired("warehouse") ? 0.15 : 0;
  return Math.round(storageUsed(false) * ECONOMY.storageCostPerUnit * Math.max(0.45, discount - staffDiscount - cityStorageDiscount()));
}

function activeStockProducts() {
  return ownedProducts().filter(product => !state.inventory[product.id]?.stopped && state.inventory[product.id]?.qty > 0);
}

function storeName() {
  return sanitizeStoreName(state?.city?.storeName) || "MarketFox";
}

function applyTheme() {
  const color = state?.city?.brandColor || CITY_CONFIG.brandColors[0];
  document.documentElement.style.setProperty("--accent", color);
}

function districtState(districtId) {
  return state.districts?.[districtId] || CITY.initialDistrictState()[districtId];
}

function districtDef(districtId) {
  return DISTRICT_BY_ID[districtId] || DISTRICTS[0];
}

function ownerName(ownerId) {
  if (ownerId === PLAYER_OWNER) return storeName();
  return CITY_OWNERS[ownerId]?.name || "Свободно";
}

function ownerShortName(ownerId) {
  if (ownerId === PLAYER_OWNER) return storeName();
  return CITY_OWNERS[ownerId]?.shortName || "Свободно";
}

function ownerColor(ownerId) {
  if (ownerId === PLAYER_OWNER) return state?.city?.brandColor || CITY_CONFIG.brandColors[0];
  return CITY_OWNERS[ownerId]?.color || "#9aa1ad";
}

function allPickupPoints(ownerId = null) {
  const points = [];
  for (const district of Object.values(state.districts || {})) {
    for (const point of district.pickupPoints || []) {
      if (!ownerId || point.owner === ownerId) points.push(point);
    }
  }
  return points;
}

function playerPickupPoints(districtId = null) {
  if (districtId) return (districtState(districtId).pickupPoints || []).filter(point => point.owner === PLAYER_OWNER);
  return allPickupPoints(PLAYER_OWNER);
}

function freePickupPoints(districtId) {
  return (districtState(districtId).pickupPoints || []).filter(point => !point.owner);
}

function totalStockUnits() {
  return Object.values(state.inventory || {}).reduce((sum, item) => sum + (item.qty || 0), 0);
}

function averagePriceRatio() {
  const products = ownedProducts();
  if (!products.length) return 1;
  return avg(products.map(product => {
    const item = state.inventory[product.id];
    const market = currentMarket(product).price || product.marketPrice;
    return item?.price ? item.price / market : 1;
  }));
}

function controlledDistricts() {
  return DISTRICTS.filter(district => districtState(district.id).controlled);
}

function unlockedDistricts() {
  return DISTRICTS.filter(district => districtState(district.id).unlocked);
}

function activeBonusDistrictIds() {
  return controlledDistricts().map(district => district.id);
}

function districtAccessState(districtId) {
  const district = districtState(districtId);
  if (district.unlocked) return "unlocked";
  const controlled = new Set(activeBonusDistrictIds());
  const neighbors = districtDef(districtId).neighbors || [];
  return neighbors.some(id => controlled.has(id)) ? "available" : "locked";
}

function districtAverageRating(districtId) {
  const points = playerPickupPoints(districtId);
  if (!points.length) return 0;
  return avg(points.map(point => point.rating || 0));
}

function districtAverageLoad(districtId) {
  const points = playerPickupPoints(districtId);
  if (!points.length) return 0;
  return avg(points.map(point => point.load || 0));
}

function playerShare(districtId) {
  return districtState(districtId).shares?.player || 0;
}

function districtLeaderOwner(districtId) {
  const shares = districtState(districtId).shares || {};
  return Object.entries(shares).sort((a, b) => b[1] - a[1])[0]?.[0] || "other";
}

function districtStatusInfo(districtId) {
  const district = districtState(districtId);
  const share = playerShare(districtId);
  if (!district.unlocked) {
    return districtAccessState(districtId) === "available"
      ? { id: "available", title: "Доступен для экспансии", className: "available" }
      : { id: "locked", title: "Закрыт", className: "locked" };
  }
  if (district.dominated) return { id: "dominance", title: "Доминирование", className: "dominance" };
  if (district.controlled) return { id: "controlled", title: "Контроль", className: "controlled" };
  if (share >= CITY_CONFIG.leaderShare) return { id: "leader", title: "Лидер", className: "leader" };
  if (share >= CITY_CONFIG.contestedShare) return { id: "contested", title: "Спорный", className: "contested" };
  if (playerPickupPoints(districtId).length) return { id: "presence", title: "Присутствие", className: "presence" };
  return { id: "none", title: "Нет присутствия", className: "none" };
}

function cityWorth() {
  const pvzValue = playerPickupPoints().reduce((sum, point) => sum + 4500 + point.level * 3200 + point.rating * 420, 0);
  const warehouseValue = state.city?.builtCityWarehouse ? CITY_CONFIG.cityWarehouseCost * 0.72 : 0;
  return Math.round(state.balance + inventoryValue() + pvzValue + warehouseValue);
}

function cityLogisticsDiscount() {
  const controlled = new Set(activeBonusDistrictIds());
  let discount = 0;
  if (controlled.has("south")) discount += 0.02;
  if (controlled.has("industrial")) discount += 0.08;
  if (state.city?.builtCityWarehouse) discount += 0.06;
  return clamp(discount, 0, 0.24);
}

function cityStorageDiscount() {
  const controlled = new Set(activeBonusDistrictIds());
  let discount = 0;
  if (controlled.has("industrial")) discount += 0.1;
  if (state.city?.builtCityWarehouse) discount += 0.06;
  return clamp(discount, 0, 0.22);
}

function citySalesMultiplier(product) {
  const controlled = new Set(activeBonusDistrictIds());
  const averageShare = avg(unlockedDistricts().map(district => playerShare(district.id)));
  let multiplier = 1 + averageShare / 100 * 0.12;

  if (controlled.has("central")) multiplier += 0.05;
  if (controlled.has("residential")) multiplier += 0.04;
  if (controlled.has("south")) multiplier += 0.02;
  if (controlled.has("university") && ["Электроника", "Одежда", "Тренд"].includes(product.category)) multiplier += 0.08;
  if (controlled.has("elite") && ["Электроника", "Одежда"].includes(product.category)) multiplier += 0.07;
  return clamp(multiplier, 0.75, 1.38);
}

function warehouseFacilityCapacity() {
  return state.city?.builtCityWarehouse ? CITY_CONFIG.cityWarehouseCapacity : 0;
}

function warehouseFacilityDailyCost() {
  const smallWarehouses = Object.values(state.districts || {}).flatMap(district => district.warehouses || []);
  const smallCost = smallWarehouses
    .filter(warehouse => warehouse.owner === PLAYER_OWNER)
    .reduce((sum, warehouse) => sum + (warehouse.dailyCost || CITY_CONFIG.smallWarehouseDailyCost), 0);
  return smallCost + (state.city?.builtCityWarehouse ? CITY_CONFIG.cityWarehouseDailyCost : 0);
}

function pickupOpenCost(districtId, point) {
  const district = districtDef(districtId);
  const neighborDiscount = districtAccessState(districtId) === "available" ? 0.92 : 1;
  return Math.round(CITY_CONFIG.pickupOpenBaseCost * district.rentFactor * point.traffic * neighborDiscount / 100) * 100;
}

function pickupUpgradeCost(point) {
  const district = districtDef(point.districtId);
  return Math.round(CITY_CONFIG.pickupUpgradeBaseCost * district.rentFactor * (point.level + 0.35) / 100) * 100;
}

function expansionCost(districtId) {
  const district = districtDef(districtId);
  const centralBonus = districtState("central").controlled ? 0.92 : 1;
  return Math.round(CITY_CONFIG.expansionBaseCost * district.rentFactor * centralBonus / 100) * 100;
}

function districtAdCost(districtId, strategyId) {
  const district = districtDef(districtId);
  const strategy = CITY_CONFIG.districtAdStrategies.find(item => item.id === strategyId) || CITY_CONFIG.districtAdStrategies[1];
  const universityDiscount = districtState("university").controlled && ["Электроника", "Одежда", "Тренд"].some(category => district.popularCategories.includes(category)) ? 0.88 : 1;
  return Math.round(district.adCost * strategy.costFactor * universityDiscount / 10) * 10;
}

function pickupPointById(pointId) {
  for (const district of Object.values(state.districts || {})) {
    const point = (district.pickupPoints || []).find(item => item.id === pointId);
    if (point) return point;
  }
  return null;
}

function pickupPointInfluence(point, district, ownerId) {
  if (!point.owner) return 0;
  const ownerService = ownerId === "premiumbox" ? 1.16 : ownerId === "fastgo" ? 1.08 : ownerId === "lowprice" ? 0.92 : 1;
  const levelFactor = 0.7 + point.level * 0.34;
  const ratingFactor = clamp((point.rating || 4) / 4.5, 0.55, 1.22);
  const loadPenalty = point.load > 0.95 ? 0.68 : point.load > 0.82 ? 0.84 : 1;
  const queuePenalty = clamp(1 - (point.queue || 0) / 80, 0.62, 1);
  const conditionFactor = clamp(point.condition || 0.8, 0.45, 1.1);
  const staffFactor = clamp((point.staff || 1) / Math.max(1, point.level), 0.75, 1.22);
  return point.traffic * 24 * levelFactor * ratingFactor * loadPenalty * queuePenalty * conditionFactor * staffFactor * ownerService * district.transport;
}

function playerDistrictInfluence(districtId) {
  const district = districtDef(districtId);
  const stateDistrict = districtState(districtId);
  const points = playerPickupPoints(districtId);
  if (!points.length) return 0.1;

  const pointInfluence = points.reduce((sum, point) => sum + pickupPointInfluence(point, district, PLAYER_OWNER), 0);
  const stockFactor = clamp(totalStockUnits() / 45, 0.45, 1.22);
  const priceRatio = averagePriceRatio();
  const priceFactor = priceRatio >= ZERO_DEMAND_PRICE_RATIO
    ? 0.16
    : clamp(1.18 - Math.max(0, priceRatio - 1) * district.priceSensitivity * 0.58 + Math.max(0, 1 - priceRatio) * 0.18, 0.32, 1.26);
  const serviceFactor = clamp(state.rating / 4.5, 0.66, 1.16) * clamp(districtAverageRating(districtId) / 4.35 || 1, 0.72, 1.16);
  const adBoost = stateDistrict.localAd?.days > 0 ? stateDistrict.localAd.boost : 0;
  const loyaltyBoost = 1 + clamp((stateDistrict.loyalty?.player || 0) / 100, 0, 0.28);
  const controlledBoost = stateDistrict.controlled ? 1.07 : 1;
  return Math.max(0.1, pointInfluence * stockFactor * priceFactor * serviceFactor * loyaltyBoost * controlledBoost + adBoost);
}

function competitorDistrictInfluence(districtId, competitorId) {
  const district = districtDef(districtId);
  const stateDistrict = districtState(districtId);
  const competitorDef = CITY_COMPETITORS.find(item => item.id === competitorId);
  const company = state.cityCompetitors?.[competitorId];
  const points = (stateDistrict.pickupPoints || []).filter(point => point.owner === competitorId);
  const pointInfluence = points.reduce((sum, point) => sum + pickupPointInfluence(point, district, competitorId), 0);
  const cashFactor = company?.cash <= 0 ? 0.62 : company?.cash < 8000 ? 0.82 : 1;
  const campaign = stateDistrict.competitorCampaigns?.[competitorId];
  const campaignBoost = campaign?.days > 0 ? campaign.boost : 0;
  const loyaltyBoost = 1 + clamp((stateDistrict.loyalty?.[competitorId] || 0) / 100, 0, 0.3);
  const strategyFactor = (competitorDef?.pricePressure || 1) * 0.34 + (competitorDef?.service || 1) * 0.33 + (competitorDef?.logistics || 1) * 0.33;
  return Math.max(1, (pointInfluence + district.competition * 18) * strategyFactor * loyaltyBoost * cashFactor + campaignBoost);
}

function calculateDistrictInfluences(districtId) {
  const district = districtDef(districtId);
  return {
    player: playerDistrictInfluence(districtId),
    lowprice: competitorDistrictInfluence(districtId, "lowprice"),
    premiumbox: competitorDistrictInfluence(districtId, "premiumbox"),
    fastgo: competitorDistrictInfluence(districtId, "fastgo"),
    other: 18 + district.population / 6500
  };
}

function influencesToShares(influences) {
  return normalizeShareObject(influences);
}

function moveShares(currentShares, targetShares, inertia) {
  const owners = ["player", "lowprice", "premiumbox", "fastgo", "other"];
  const moved = Object.fromEntries(owners.map(owner => {
    const current = Number(currentShares?.[owner] || 0);
    const target = Number(targetShares?.[owner] || 0);
    return [owner, current + (target - current) * inertia];
  }));
  return normalizeShareObject(moved);
}

function updateDistrictStatus(districtId) {
  const district = districtState(districtId);
  const share = playerShare(districtId);
  const pvzCount = playerPickupPoints(districtId).length;
  const rating = districtAverageRating(districtId);
  const load = districtAverageLoad(districtId);
  const canControl = share >= CITY_CONFIG.controlShare && pvzCount >= 2 && rating >= CITY_CONFIG.minControlRating && load <= CITY_CONFIG.maxControlLoad;

  if (!district.unlocked) {
    district.status = "locked";
    return null;
  }

  if (share >= CITY_CONFIG.leaderShare) district.leaderDays += 1;
  else district.leaderDays = 0;

  if (canControl) district.controlledDays += 1;
  else district.controlledDays = 0;

  if (district.controlled && (share < CITY_CONFIG.lossShare || rating < CITY_CONFIG.minControlRating - 0.25 || load > 1.05)) {
    district.controlled = false;
    district.dominated = false;
    district.status = share >= CITY_CONFIG.contestedShare ? "contested" : "presence";
    return { type: "lost", districtName: districtDef(districtId).name };
  }

  if (!district.controlled && district.controlledDays >= CITY_CONFIG.controlHoldDays) {
    district.controlled = true;
    district.status = "controlled";
    return { type: "controlled", districtName: districtDef(districtId).name };
  }

  if (district.controlled && share >= CITY_CONFIG.dominanceShare && pvzCount >= 3 && rating >= 4.45) district.dominanceDays += 1;
  else district.dominanceDays = 0;

  district.dominated = district.dominanceDays >= CITY_CONFIG.dominanceHoldDays;
  district.status = districtStatusInfo(districtId).id;
  return null;
}

function updateCityProgression() {
  const controlledCount = controlledDistricts().length;
  const firstPvzLevel = playerPickupPoints("south")[0]?.level || 1;
  state.city.unlockedMechanics = {
    ...state.city.unlockedMechanics,
    districtMap: true,
    competition: firstPvzLevel >= 2 || state.day >= 3,
    expansion: controlledCount >= 1,
    cityWarehouse: controlledCount >= 2,
    management: controlledCount >= 2 || staffHired("analyst")
  };
}

function updateDistrictsForNewDay(report) {
  updateCityProgression();
  runCompetitorCityActions();
  const snapshots = [];
  const events = [];

  for (const districtDefItem of DISTRICTS) {
    const district = districtState(districtDefItem.id);
    if (!district.unlocked) continue;

    const influences = calculateDistrictInfluences(districtDefItem.id);
    const targetShares = influencesToShares(influences);
    district.targetShares = targetShares;
    district.shares = moveShares(district.shares, targetShares, CITY_CONFIG.shareInertia);

    for (const owner of Object.keys(district.loyalty || {})) {
      const current = Number(district.loyalty[owner] || 0);
      const target = Number(district.shares[owner] || 0);
      district.loyalty[owner] = Math.round((current + (target - current) * CITY_CONFIG.loyaltyInertia) * 10) / 10;
    }

    for (const point of district.pickupPoints || []) {
      if (!point.owner) continue;
      const ownerShare = district.shares[point.owner] || 0;
      const loadTarget = clamp(ownerShare / Math.max(12, point.capacity / 4) * point.traffic, 0.12, 1.2);
      point.load = Math.round((point.load * 0.7 + loadTarget * 0.3) * 100) / 100;
      point.queue = Math.max(0, Math.round((point.load - 0.72) * 52 / Math.max(0.72, point.serviceSpeed || 1)));
      if (point.owner === PLAYER_OWNER) {
        const queuePenalty = point.queue > 16 ? -0.045 : point.queue > 8 ? -0.018 : 0.012;
        point.rating = clamp(point.rating + queuePenalty + (state.rating - 4.4) * 0.004, 1, 5);
        point.awareness = clamp(point.awareness + 0.025 + (district.localAd?.days > 0 ? 0.06 : 0), 0, 1);
        point.income = Math.round((report?.sold || 0) * 16 * point.traffic * (district.shares.player || 0) / 100);
        point.expenses = pickupDailyExpense(point);
      }
    }

    const statusEvent = updateDistrictStatus(districtDefItem.id);
    if (statusEvent?.type === "controlled") {
      events.push(`Район «${statusEvent.districtName}» теперь контролирует ${storeName()}. Открыты новые бонусы и направления экспансии.`);
    }
    if (statusEvent?.type === "lost") {
      events.push(`Контроль района «${statusEvent.districtName}» потерян: доля и сервис просели ниже безопасного уровня.`);
    }

    if (district.localAd?.days > 0) district.localAd.days -= 1;
    if (district.localAd?.days <= 0) district.localAd = null;
    for (const [competitorId, campaign] of Object.entries(district.competitorCampaigns || {})) {
      campaign.days = Math.max(0, Number(campaign.days || 0) - 1);
      if (campaign.days <= 0) delete district.competitorCampaigns[competitorId];
    }

    const snapshot = {
      id: districtDefItem.id,
      playerShare: district.shares.player,
      targetShare: targetShares.player,
      status: district.status,
      controlled: district.controlled
    };
    district.history = [{ day: state.day, ...snapshot }, ...(district.history || [])].slice(0, 14);
    snapshots.push(snapshot);
  }

  state.districtShareHistory = [{ day: state.day, districts: snapshots }, ...(state.districtShareHistory || [])].slice(0, 20);
  updateCityProgression();
  return { snapshots, events };
}

function pickupDailyExpense(point) {
  const district = districtDef(point.districtId);
  const salary = point.staff * 260;
  const maintenance = 130 + point.level * 90 + (point.condition < 0.65 ? 160 : 0);
  return Math.round((point.rent || 0) + salary + maintenance + district.rentFactor * 60);
}

function pickupNetworkDailyExpense() {
  return playerPickupPoints().reduce((sum, point) => sum + pickupDailyExpense(point), 0);
}

function pickupNetworkDailyIncome(soldTotal) {
  const points = playerPickupPoints();
  if (!points.length || soldTotal <= 0) return 0;
  const serviceRating = clamp(avg(points.map(point => point.rating || 4)) / 4.3, 0.72, 1.18);
  const shareBoost = clamp(avg(unlockedDistricts().map(district => playerShare(district.id))) / 40, 0.25, 1.45);
  return Math.round(soldTotal * 28 * serviceRating * shareBoost);
}

function runCompetitorCityActions() {
  const unlocked = unlockedDistricts();
  if (!unlocked.length) return;

  for (const competitor of CITY_COMPETITORS) {
    const company = state.cityCompetitors?.[competitor.id];
    if (!company || company.cash < 1000) continue;
    const threatened = unlocked
      .map(district => ({ district, share: playerShare(district.id), competitorShare: districtState(district.id).shares[competitor.id] || 0 }))
      .filter(item => item.share >= 24 || item.competitorShare >= 22)
      .sort((a, b) => (b.share - a.share) || (b.competitorShare - a.competitorShare));
    const fallbackDistrict = unlocked[Math.floor(random() * unlocked.length)];
    const target = threatened[0] || (fallbackDistrict ? {
      district: fallbackDistrict,
      share: playerShare(fallbackDistrict.id),
      competitorShare: districtState(fallbackDistrict.id).shares[competitor.id] || 0
    } : null);
    if (!target) continue;

    const district = districtState(target.district.id);
    const adCost = Math.round((target.district.adCost * (0.75 + competitor.aggressiveness)) / 10) * 10;
    if (company.cash >= adCost && (target.share >= 24 || random() < competitor.aggressiveness * 0.22)) {
      company.cash -= adCost;
      company.totalSpent += adCost;
      district.competitorCampaigns[competitor.id] = {
        boost: Math.round(12 + competitor.aggressiveness * 24),
        days: 1,
        spend: adCost
      };
    }

    const freePoint = (district.pickupPoints || []).find(point => !point.owner);
    const openingCost = Math.round(CITY_CONFIG.pickupOpenBaseCost * target.district.rentFactor * 0.84 / 100) * 100;
    if (freePoint && company.cash >= openingCost && target.share >= 34 && random() < competitor.aggressiveness * 0.35) {
      company.cash -= openingCost;
      company.totalSpent += openingCost;
      company.pvzOpened += 1;
      freePoint.owner = competitor.id;
      freePoint.name = `${competitor.title} ${company.pvzOpened + 1}`;
      freePoint.level = 1;
      freePoint.capacity = 58;
      freePoint.staff = 1;
      freePoint.serviceSpeed = competitor.id === "fastgo" ? 1.04 : 0.9;
      freePoint.rating = competitor.id === "premiumbox" ? 4.65 : competitor.id === "lowprice" ? 3.95 : 4.35;
      freePoint.load = 0.38;
      freePoint.awareness = 0.32;
    }
  }
}

function cardUpgradeBoost(item) {
  return (item?.card?.upgrades?.length || 0) * 0.08;
}

function nextCardUpgrade(item) {
  const owned = new Set(item?.card?.upgrades || []);
  return CARD_UPGRADES.find(upgrade => !owned.has(upgrade.id)) || null;
}

function cardUpgradeCost(upgrade) {
  return Math.round(upgrade.cost * (staffHired("content") ? 0.88 : 1));
}

function applyAutomations() {
  const notes = [];

  if (automationEnabled("autoPrice") && staffHired("analyst")) {
    for (const product of activeStockProducts()) {
      const item = state.inventory[product.id];
      const target = Math.round(currentMarket(product).price * 0.95 / ECONOMY.salePriceStep) * ECONOMY.salePriceStep;
      if (Math.abs(item.price - target) >= ECONOMY.salePriceStep) {
        item.price = Math.max(1, target);
        notes.push(`Автоцена: «${product.name}» выставлен на ${money(item.price)}.`);
      }
    }
  }

  if (automationEnabled("autoStopAds") && staffHired("ads")) {
    for (const product of activeStockProducts()) {
      const item = state.inventory[product.id];
      if ((item.adStrategy || "none") !== "none" && salesForecast(product, item).max === 0) {
        item.adStrategy = "none";
        item.adActive = false;
        notes.push(`Автостоп рекламы: «${product.name}» имеет нулевой спрос.`);
      }
    }
  }

  if (automationEnabled("autoRestock") && staffHired("buyer")) {
    for (const product of ownedProducts()) {
      const item = state.inventory[product.id];
      const incoming = state.shipments.filter(shipment => shipment.productId === product.id).reduce((sum, shipment) => sum + shipment.qty, 0);
      if ((item.qty + incoming) >= 5) continue;
      const supplier = supplierById("standard");
      const qty = supplier.minQty;
      const cost = purchaseCost(product, supplier.id) * qty;
      const reservedVolume = storageUsed(true) + qty * product.volume;
      if (state.balance < cost || reservedVolume > warehouseCapacity()) continue;
      state.balance -= cost;
      state.shipments.push({ id: `${Date.now()}-${random().toString(36).slice(2)}`, productId: product.id, qty, supplierId: supplier.id, cost, orderDay: state.day, arrivalDay: state.day + supplier.delay });
      notes.push(`Автозаказ: «${product.name}» ${qty} шт., прибытие день ${state.day + supplier.delay}.`);
    }
  }

  if (notes.length) state.events = [...notes, ...state.events].slice(0, 20);
}

function goalValue(goal) {
  return Math.max(0, goal.value());
}

function goalProgress(goal) {
  return clamp(goalValue(goal), 0, goal.target);
}

function goalDone(goal) {
  return goalValue(goal) >= goal.target;
}

function goalClaimed(goal) {
  return state.claimedGoals.includes(goal.id);
}

function render() {
  applyTheme();
  headerDay.textContent = state.day;
  document.body.classList.toggle("setup-mode", !state.city?.onboardingDone);
  document.querySelector(".eyebrow").textContent = state.city?.onboardingDone ? `${GAME_TITLE} · ${storeName()}` : GAME_TITLE;
  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.tab === activeTab);
    button.disabled = !state.city?.onboardingDone && button.dataset.tab !== "home";
  });

  if (!state.city?.onboardingDone) {
    pageTitle.textContent = "Новая игра";
    renderOnboarding();
    return;
  }

  const titles = {
    home: state.city?.mapMode === "district" ? districtDef(state.city.selectedDistrictId).name : "Карта города",
    market: "Рынок",
    stock: "Мои товары",
    warehouse: "Склад",
    objects: "ПВЗ и объекты",
    analytics: "Аналитика",
    development: "Развитие",
    tasks: "Задания",
    profile: "Статистика"
  };
  pageTitle.textContent = titles[activeTab];

  if (activeTab === "home") renderHome();
  if (activeTab === "market") renderMarket();
  if (activeTab === "stock") renderStock();
  if (activeTab === "warehouse") renderWarehouse();
  if (activeTab === "objects") renderObjects();
  if (activeTab === "analytics") renderAnalytics();
  if (activeTab === "development") renderDevelopment();
  if (activeTab === "tasks") renderTasks();
  if (activeTab === "profile") renderProfile();
}

function renderOnboarding() {
  view.innerHTML = `
    <section class="setup-screen">
      <div class="setup-map" aria-hidden="true">
        ${DISTRICTS.map(district => `<span style="left:${district.map.left}%;top:${district.map.top}%;width:${district.map.width}%;height:${district.map.height}%">${escapeHtml(district.name)}</span>`).join("")}
      </div>
      <article class="card setup-card">
        <div class="section-note">Новая кампания</div>
        <h2>Создайте магазин для первого города</h2>
        <p>Начните с малого склада и первого ПВЗ в Южном районе. Цель кампании — захватить весь город, вытесняя LowPrice, PremiumBox и FastGo.</p>
        <div class="field">
          <label for="store-name">Название магазина</label>
          <input id="store-name" type="text" maxlength="24" value="MarketFox" autocomplete="off" />
        </div>
        <div class="color-swatches" aria-label="Цвет магазина">
          ${CITY_CONFIG.brandColors.map((color, index) => `
            <button class="color-swatch ${index === 0 ? "active" : ""}" data-color="${color}" type="button" style="background:${color}" aria-label="Цвет ${index + 1}"></button>
          `).join("")}
        </div>
        <button id="start-campaign" class="primary-btn" type="button">Начать кампанию</button>
      </article>
    </section>
  `;

  let selectedColor = state.city.brandColor || CITY_CONFIG.brandColors[0];
  document.querySelectorAll(".color-swatch").forEach(button => {
    button.addEventListener("click", () => {
      selectedColor = button.dataset.color;
      document.querySelectorAll(".color-swatch").forEach(item => item.classList.toggle("active", item.dataset.color === selectedColor));
      document.documentElement.style.setProperty("--accent", selectedColor);
    });
  });
  document.getElementById("start-campaign").addEventListener("click", () => {
    const input = document.getElementById("store-name");
    const name = sanitizeStoreName(input.value) || "MarketFox";
    state.city.storeName = name;
    state.city.brandColor = selectedColor;
    state.city.onboardingDone = true;
    state.events.unshift(`${name} открывает первый ПВЗ в Южном районе.`);
    saveState();
    vibrate("medium");
    render();
  });
}

function renderCityCommandCenter(stockUnits, activeAds, warehouse, report) {
  const controlledCount = controlledDistricts().length;
  const latestProfit = report?.profit ?? state.financeHistory[0]?.profit ?? 0;
  return `
    <section class="city-command">
      <div class="city-command-top">
        <div>
          <div class="hero-label">Баланс ${escapeHtml(storeName())}</div>
          <div class="hero-balance">${money(state.balance)}</div>
        </div>
        <button id="next-day" class="primary-btn city-next-btn" type="button" ${stockUnits === 0 ? "disabled" : ""}>Завершить день</button>
      </div>
      <div class="hero-row">
        <span class="hero-pill">⭐ ${state.rating.toFixed(2)}</span>
        <span class="hero-pill">📦 ${stockUnits} шт.</span>
        <span class="hero-pill">🗺️ ${controlledCount}/${DISTRICTS.length} районов</span>
        <span class="hero-pill">📍 ${playerPickupPoints().length} ПВЗ</span>
        <span class="hero-pill">🏬 ${warehouse}</span>
        <span class="hero-pill ${latestProfit >= 0 ? "good-pill" : "bad-pill"}">Вчера ${money(latestProfit)}</span>
        <span class="hero-pill">⚙️ ${actionsLeft()}/${actionLimit()}</span>
        <span class="hero-pill">📣 ${activeAds} товарных реклам</span>
      </div>
    </section>
  `;
}

function renderCityMapSection() {
  return `
    <section class="section">
      <div class="section-heading">
        <h2>Карта города</h2>
        <span class="section-note">Выберите район, чтобы открыть карту ПВЗ и локальные действия</span>
      </div>
      <div class="city-map" role="list" aria-label="Карта города">
        ${DISTRICTS.map(district => {
          const districtData = districtState(district.id);
          const access = districtAccessState(district.id);
          const status = districtStatusInfo(district.id);
          const leader = districtLeaderOwner(district.id);
          const share = Math.round(playerShare(district.id));
          return `
            <button class="district-node ${status.className} ${access}" data-district="${district.id}" type="button"
              style="--left:${district.map.left}%;--top:${district.map.top}%;--width:${district.map.width}%;--height:${district.map.height}%;--owner:${ownerColor(leader)}">
              <span>${escapeHtml(district.shortName || district.name)}</span>
              <strong>${districtData.unlocked ? `${share}%` : access === "available" ? "маршрут" : "закрыт"}</strong>
            </button>
          `;
        }).join("")}
      </div>
      <div class="district-legend">
        <span><i style="background:${ownerColor(PLAYER_OWNER)}"></i>${escapeHtml(storeName())}</span>
        <span><i style="background:${ownerColor("lowprice")}"></i>LowPrice</span>
        <span><i style="background:${ownerColor("premiumbox")}"></i>PremiumBox</span>
        <span><i style="background:${ownerColor("fastgo")}"></i>FastGo</span>
        <span><i class="mixed"></i>спорный</span>
      </div>
    </section>

    <section class="section">
      <div class="district-card-grid">
        ${DISTRICTS.map(district => renderDistrictSummaryCard(district.id)).join("")}
      </div>
    </section>
  `;
}

function renderDistrictSummaryCard(districtId) {
  const district = districtDef(districtId);
  const districtData = districtState(districtId);
  const status = districtStatusInfo(districtId);
  const leader = districtLeaderOwner(districtId);
  const access = districtAccessState(districtId);
  return `
    <article class="district-summary ${status.className}">
      <div class="card-top">
        <div>
          <h3>${escapeHtml(district.name)}</h3>
          <div class="product-category">${escapeHtml(district.role)} · лидер: ${escapeHtml(ownerShortName(leader))}</div>
        </div>
        <span class="tag ${status.className}">${escapeHtml(status.title)}</span>
      </div>
      <div class="share-stack" aria-label="Доли рынка">
        ${["player", "lowprice", "premiumbox", "fastgo", "other"].map(owner => `
          <span style="width:${districtData.shares[owner] || 0}%;background:${ownerColor(owner)}"></span>
        `).join("")}
      </div>
      <div class="tags">
        <span class="tag">${Math.round(playerShare(districtId))}% ${escapeHtml(storeName())}</span>
        <span class="tag">ПВЗ ${playerPickupPoints(districtId).length}/${districtData.pickupPoints.length}</span>
        <span class="tag">Реклама ${money(district.adCost)}</span>
        ${access === "available" ? `<span class="tag good">Можно расширяться</span>` : ""}
      </div>
    </article>
  `;
}

function renderDistrictMapSection(districtId) {
  const district = districtDef(districtId);
  const districtData = districtState(districtId);
  const access = districtAccessState(districtId);
  const status = districtStatusInfo(districtId);
  const pvzCount = playerPickupPoints(districtId).length;
  const avgRating = districtAverageRating(districtId);
  const avgLoad = districtAverageLoad(districtId);

  if (!districtData.unlocked) {
    return `
      <section class="section">
        <button id="back-city-map" class="secondary-btn back-map-btn" type="button">← К карте города</button>
        <article class="card district-locked-card">
          <div class="section-note">${escapeHtml(district.role)}</div>
          <h2>${escapeHtml(district.name)}</h2>
          <p>${access === "available"
            ? "Район соседствует с вашей контролируемой территорией. Откройте маршрут, затем выберите помещение под первый ПВЗ."
            : "Район пока закрыт. Сначала закрепите контроль в соседнем районе."}</p>
          <div class="tags">
            <span class="tag">Население ${district.population.toLocaleString("ru-RU")}</span>
            <span class="tag">Аренда x${district.rentFactor.toFixed(2)}</span>
            <span class="tag">Конкуренция ${Math.round(district.competition * 100)}%</span>
          </div>
          <button id="expand-district" class="primary-btn" data-district="${districtId}" type="button" ${access === "available" && state.balance >= expansionCost(districtId) ? "" : "disabled"}>
            ${access === "available" ? `Открыть маршрут за ${money(expansionCost(districtId))}` : "Маршрут недоступен"}
          </button>
        </article>
      </section>
    `;
  }

  return `
    <section class="section">
      <button id="back-city-map" class="secondary-btn back-map-btn" type="button">← К карте города</button>
      <article class="card district-map-card">
        <div class="district-header">
          <div>
            <div class="section-note">${escapeHtml(district.role)}</div>
            <h2>${escapeHtml(district.name)}</h2>
          </div>
          <span class="tag ${status.className}">${escapeHtml(status.title)}</span>
        </div>
        <div class="district-local-map" aria-label="Карта района">
          <span class="road road-a"></span>
          <span class="road road-b"></span>
          <span class="zone zone-home">Жильё</span>
          <span class="zone zone-shop">Трафик</span>
          ${(districtData.pickupPoints || []).map(point => `
            <button class="district-point ${point.owner ? `owned owner-${point.owner}` : "free"}" data-point="${point.id}" type="button"
              style="--x:${point.x}%;--y:${point.y}%;--owner:${ownerColor(point.owner)}" aria-label="${escapeHtml(point.name)}">
              ${point.owner ? point.level : "+"}
            </button>
          `).join("")}
        </div>
        <div class="metrics-grid compact-metrics">
          <article class="metric-card"><div class="metric-label">Доля ${escapeHtml(storeName())}</div><div class="metric-value">${Math.round(playerShare(districtId))}%</div></article>
          <article class="metric-card"><div class="metric-label">ПВЗ</div><div class="metric-value">${pvzCount}/${districtData.pickupPoints.length}</div></article>
          <article class="metric-card"><div class="metric-label">Рейтинг сети</div><div class="metric-value">${avgRating ? avgRating.toFixed(2) : "—"}</div></article>
          <article class="metric-card"><div class="metric-label">Загрузка</div><div class="metric-value">${Math.round(avgLoad * 100)}%</div></article>
        </div>
        <div class="tags">
          <span class="tag">Популярно: ${district.popularCategories.map(escapeHtml).join(", ")}</span>
          <span class="tag">Бонус: ${escapeHtml(district.bonusTitle)}</span>
          <span class="tag">Лояльность ${Math.round(districtData.loyalty.player || 0)}%</span>
          ${districtData.localAd ? `<span class="tag good">Локальная реклама активна</span>` : ""}
        </div>
      </article>
    </section>

    <section class="section">
      <div class="section-heading">
        <h2>Локальные решения</h2>
        <span class="section-note">Реклама резко повышает влияние, но доля рынка меняется плавно</span>
      </div>
      <div class="ad-grid district-ad-grid">
        ${CITY_CONFIG.districtAdStrategies.map(strategy => `
          <button class="ad-option launch-local-ad" data-district="${districtId}" data-ad="${strategy.id}" type="button" ${pvzCount && state.balance >= districtAdCost(districtId, strategy.id) ? "" : "disabled"}>
            <span>📣</span>
            <strong>${escapeHtml(strategy.title)}</strong>
            <small>${money(districtAdCost(districtId, strategy.id))} · +${strategy.boost} влияния</small>
          </button>
        `).join("")}
      </div>
    </section>

    <section class="section">
      <div class="section-heading">
        <h2>Точки района</h2>
        <span class="section-note">Нажмите точку на карте или выберите помещение ниже</span>
      </div>
      ${(districtData.pickupPoints || []).map(point => renderPointListItem(point)).join("")}
    </section>
  `;
}

function renderPointListItem(point) {
  const own = point.owner === PLAYER_OWNER;
  const free = !point.owner;
  const cost = free ? pickupOpenCost(point.districtId, point) : own ? pickupUpgradeCost(point) : 0;
  return `
    <article class="card compact-card point-list-item">
      <div class="card-top">
        <div class="product-main">
          <div class="product-emoji point-dot" style="--owner:${ownerColor(point.owner)}">${free ? "+" : point.level}</div>
          <div>
            <h3 class="product-title">${escapeHtml(point.name)}</h3>
            <div class="product-category">${free ? "Свободное помещение" : `Владелец: ${escapeHtml(ownerName(point.owner))}`} · ${escapeHtml(point.zone)}</div>
          </div>
        </div>
        <div class="price">${free ? money(cost) : `${point.rating ? point.rating.toFixed(1) : "—"}★`}</div>
      </div>
      <div class="tags">
        <span class="tag">Трафик x${point.traffic.toFixed(2)}</span>
        <span class="tag">Аренда ${money(point.rent)}</span>
        <span class="tag">Площадь ${point.area} м²</span>
        ${own ? `<span class="tag ${point.load > 0.9 ? "bad" : "good"}">Загрузка ${Math.round(point.load * 100)}%</span>` : ""}
      </div>
      <div class="product-actions">
        <button class="secondary-btn inspect-point" data-point="${point.id}" type="button">Детали</button>
        ${free ? `<button class="primary-btn open-point" data-point="${point.id}" type="button" ${state.balance >= cost ? "" : "disabled"}>Открыть</button>` : ""}
        ${own ? `<button class="primary-btn upgrade-point" data-point="${point.id}" type="button" ${point.level < 4 && state.balance >= cost ? "" : "disabled"}>${point.level < 4 ? "Улучшить" : "Максимум"}</button>` : ""}
      </div>
    </article>
  `;
}

function renderHome() {
  const report = state.lastReport;
  const stockUnits = Object.values(state.inventory).reduce((sum, item) => sum + item.qty, 0);
  const activeAds = Object.values(state.inventory).filter(item => (item.adStrategy || (item.adActive ? "standard" : "none")) !== "none").length;
  const marketEvent = currentMarketEvent();
  const action = currentDailyAction();
  const featured = featuredProduct();
  const task = state.dailyTask || createDailyTask();
  const warehouse = `${storageUsed(true)}/${warehouseCapacity()}`;

  view.innerHTML = `
    ${renderCityCommandCenter(stockUnits, activeAds, warehouse, report)}

    ${state.city.mapMode === "district" ? renderDistrictMapSection(state.city.selectedDistrictId || "south") : renderCityMapSection()}

    ${!state.tutorial.done && !state.tutorial.skipped ? `
      <section class="section">
        <article class="card tutorial-card">
          <div>
            <div class="section-note">Быстрый старт</div>
            <h2>${GAME_TITLE}</h2>
            <p>Назовите магазин, развивайте ПВЗ на карте района, закупайте товары и удерживайте цену около рынка. Цена от 180% рынка даёт 0 продаж.</p>
          </div>
          <button class="secondary-btn" id="skip-tutorial" type="button">Понятно</button>
        </article>
      </section>
    ` : ""}

    <section class="section">
      <article class="card market-event-card">
        <div class="market-event-icon">${marketEvent.emoji}</div>
        <div>
          <div class="section-note">Рынок сегодня</div>
          <h2>${escapeHtml(marketEvent.title)}</h2>
          <p>${escapeHtml(marketEvent.text)}</p>
        </div>
      </article>
    </section>

    ${state.pendingEvent ? `
      <section class="section">
        <article class="card decision-card">
          <div>
            <div class="section-note">Требуется решение</div>
            <h2>${escapeHtml(state.pendingEvent.title)}</h2>
            <p>${escapeHtml(state.pendingEvent.text)}</p>
          </div>
          <button class="primary-btn" id="resolve-event" type="button">Решить</button>
        </article>
      </section>
    ` : ""}

    <section class="section">
      <div class="section-heading">
        <h2>Фокус дня</h2>
        <span class="section-note">Влияет на следующий расчёт продаж</span>
      </div>
      <div class="focus-grid">
        ${DAILY_ACTIONS.map(item => `
          <button class="focus-card ${state.dailyAction === item.id ? "active" : ""}" data-action="${item.id}" type="button">
            <span class="focus-icon">${item.emoji}</span>
            <span class="focus-title">${escapeHtml(item.title)}</span>
            <span class="focus-text">${escapeHtml(item.text)}</span>
            <span class="focus-cost">${money(item.cost)} / день</span>
          </button>
        `).join("")}
      </div>
    </section>

    <section class="section">
      <div class="metrics-grid">
        <article class="metric-card"><div class="metric-label">Очки управления</div><div class="metric-value">${actionsLeft()}/${actionLimit()}</div></article>
        <article class="metric-card"><div class="metric-label">Склад</div><div class="metric-value">${warehouse}</div></article>
        <article class="metric-card"><div class="metric-label">Поставки в пути</div><div class="metric-value">${state.shipments.length}</div></article>
        <article class="metric-card"><div class="metric-label">Хранение/день</div><div class="metric-value">${money(holdingCost())}</div></article>
      </div>
    </section>

    <section class="section">
      <article class="card decision-card">
        <div>
          <div class="section-note">Задача дня</div>
          <h2>${escapeHtml(task.title)}</h2>
          <p>Награда: ${money(task.reward)}. Выполнится автоматически в отчёте дня.</p>
        </div>
        <span class="tag ${task.claimed ? "good" : ""}">${task.claimed ? "Выполнено" : "Активно"}</span>
      </article>
    </section>

    <section class="section">
      <article class="card decision-card">
        <div>
          <div class="section-note">Товар дня</div>
          <h2>${featured ? `${featured.emoji} ${escapeHtml(featured.name)}` : "Не выбран"}</h2>
          <p>${featured ? `+34% к спросу за ${money(FEATURED_PRODUCT_COST)} в день. Витрина сильнее всего работает, когда совпадают рынок, остатки и маржа.` : "Витрина свободна. Один товар можно усилить на вкладке «Товары»."}</p>
        </div>
        <button class="secondary-btn" id="open-stock-from-decision" type="button">Выбрать</button>
      </article>
    </section>

    <section class="section">
      <div class="metrics-grid">
        <article class="metric-card"><div class="metric-label">Общие продажи</div><div class="metric-value">${state.totalOrders}</div></article>
        <article class="metric-card"><div class="metric-label">Общая выручка</div><div class="metric-value">${money(state.totalRevenue)}</div></article>
        <article class="metric-card"><div class="metric-label">Общая прибыль</div><div class="metric-value ${state.totalProfit >= 0 ? "positive" : "negative"}">${money(state.totalProfit)}</div></article>
        <article class="metric-card"><div class="metric-label">Товаров на складе</div><div class="metric-value">${stockUnits}</div></article>
      </div>
    </section>

    ${report ? `
      <section class="section">
        <div class="section-heading"><h2>Отчёт за день ${report.day}</h2><span class="section-note">${escapeHtml(report.event || "Рынок")} · продано ${report.sold} шт.</span></div>
        <article class="card report-list">
          <div class="report-row"><span>Фокус</span><strong>${escapeHtml(report.focus || "Обычный день")}</strong></div>
          ${report.featured ? `<div class="report-row"><span>Товар дня</span><strong>${escapeHtml(report.featured)}</strong></div>` : ""}
          <div class="report-row"><span>Выручка</span><strong>${money(report.revenue)}</strong></div>
          <div class="report-row"><span>Себестоимость</span><strong>−${money(report.costOfGoods || 0)}</strong></div>
          <div class="report-row"><span>Возвраты</span><strong>−${money(report.refunds)}</strong></div>
          <div class="report-row"><span>Комиссия</span><strong>−${money(report.commission)}</strong></div>
          <div class="report-row"><span>Логистика</span><strong>−${money(report.logistics)}</strong></div>
          <div class="report-row"><span>Реклама</span><strong>−${money(report.ads)}</strong></div>
          <div class="report-row"><span>Хранение</span><strong>−${money(report.storageCost || 0)}</strong></div>
          ${report.salaries ? `<div class="report-row"><span>Сотрудники</span><strong>−${money(report.salaries)}</strong></div>` : ""}
          ${report.pickupIncome ? `<div class="report-row"><span>Доход ПВЗ</span><strong>+${money(report.pickupIncome)}</strong></div>` : ""}
          ${report.pickupExpenses ? `<div class="report-row"><span>Расходы ПВЗ</span><strong>−${money(report.pickupExpenses)}</strong></div>` : ""}
          ${report.warehouseFacilityCost ? `<div class="report-row"><span>Инфраструктура складов</span><strong>−${money(report.warehouseFacilityCost)}</strong></div>` : ""}
          ${report.districtAdSpend ? `<div class="report-row"><span>Районная реклама оплачена</span><strong>−${money(report.districtAdSpend)}</strong></div>` : ""}
          <div class="report-row"><span>Упущенные продажи</span><strong>${report.missedSales || 0}</strong></div>
          ${report.operations ? `<div class="report-row"><span>Фокус и витрина</span><strong>−${money(report.operations)}</strong></div>` : ""}
          <div class="report-row total"><span>Прибыль дня</span><strong class="${report.profit >= 0 ? "positive" : "negative"}">${money(report.profit)}</strong></div>
          ${(report.districts || []).slice(0, 3).map(item => `<div class="event-item"><span class="event-icon">🗺️</span><span>${escapeHtml(districtDef(item.id).name)}: ${Math.round(item.playerShare)}% (${escapeHtml(districtStatusInfo(item.id).title)})</span></div>`).join("")}
          ${(report.districtEvents || []).slice(0, 2).map(event => `<div class="event-item"><span class="event-icon">🏁</span><span>${escapeHtml(event)}</span></div>`).join("")}
          ${(report.reasons || []).slice(0, 3).map(reason => `<div class="event-item"><span class="event-icon">i</span><span>${escapeHtml(reason)}</span></div>`).join("")}
        </article>
      </section>
    ` : ""}

    <section class="section">
      <div class="section-heading"><h2>События</h2></div>
      <div class="event-list">
        ${state.events.slice(0, 5).map((event, index) => `<div class="event-item"><span class="event-icon">${index === 0 ? "🔔" : "•"}</span><span>${escapeHtml(event)}</span></div>`).join("")}
      </div>
    </section>
  `;

  document.getElementById("next-day")?.addEventListener("click", simulateDay);
  document.querySelectorAll(".district-node").forEach(button => button.addEventListener("click", () => selectDistrict(button.dataset.district)));
  document.getElementById("back-city-map")?.addEventListener("click", () => {
    state.city.mapMode = "city";
    saveState();
    renderHome();
  });
  document.getElementById("expand-district")?.addEventListener("click", event => unlockDistrict(event.currentTarget.dataset.district));
  document.querySelectorAll(".district-point, .inspect-point").forEach(button => button.addEventListener("click", () => openFacilityModal(button.dataset.point)));
  document.querySelectorAll(".open-point").forEach(button => button.addEventListener("click", () => openPickupPoint(button.dataset.point)));
  document.querySelectorAll(".upgrade-point").forEach(button => button.addEventListener("click", () => upgradePickupPoint(button.dataset.point)));
  document.querySelectorAll(".launch-local-ad").forEach(button => button.addEventListener("click", () => launchLocalAd(button.dataset.district, button.dataset.ad)));
  document.getElementById("resolve-event")?.addEventListener("click", renderDecisionEventModal);
  document.getElementById("skip-tutorial")?.addEventListener("click", () => {
    state.tutorial.skipped = true;
    saveState();
    renderHome();
  });
  document.querySelectorAll(".focus-card").forEach(button => button.addEventListener("click", () => setDailyAction(button.dataset.action)));
  document.getElementById("open-stock-from-decision")?.addEventListener("click", () => switchTab("stock"));
  document.querySelectorAll(".claim-goal").forEach(button => button.addEventListener("click", () => claimGoal(button.dataset.id)));
}

function renderGoalsSection() {
  const readyToClaim = GOALS.filter(goal => goalDone(goal) && !goalClaimed(goal)).length;

  return `
    <section class="section">
      <div class="section-heading">
        <h2>Цели сезона</h2>
        <span class="section-note">${readyToClaim ? `Наград: ${readyToClaim}` : "Прогресс магазина"}</span>
      </div>
      <div class="goal-list">
        ${GOALS.map(goal => {
          const done = goalDone(goal);
          const claimed = goalClaimed(goal);
          const progress = goalProgress(goal);
          const progressPercent = clamp(progress / goal.target * 100, 0, 100);
          const currentLabel = goal.progressLabel
            ? goal.progressLabel(progress)
            : goal.target >= 10000 ? money(progress) : Math.floor(progress);
          const targetLabel = goal.progressLabel
            ? goal.progressLabel(goal.target)
            : goal.target >= 10000 ? money(goal.target) : goal.target;

          return `
            <article class="goal-card ${done ? "done" : ""}">
              <div class="goal-main">
                <h3>${escapeHtml(goal.title)}</h3>
                <p>${escapeHtml(goal.text)}</p>
                <div class="progress"><div style="width:${progressPercent}%"></div></div>
                <div class="goal-progress">${currentLabel} / ${targetLabel}</div>
              </div>
              <button class="small-btn claim-goal" data-id="${goal.id}" type="button" ${done && !claimed ? "" : "disabled"}>
                ${claimed ? "Получено" : done ? `+${money(goal.reward)}` : `+${money(goal.reward)}`}
              </button>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderMarket() {
  view.innerHTML = `
    <section class="card">
      <h2>Каталог поставщиков</h2>
      <p style="color:var(--muted);margin-bottom:0">Сравнивайте тренд, конкурентов, цену рынка и поставщиков. Заказ может прийти не сразу.</p>
    </section>
    <div class="catalog-grid">
      ${PRODUCTS.map(product => {
        const current = state.inventory[product.id];
        const market = currentMarket(product);
        const margin = grossMargin(product, market.price);
        const currentCost = purchaseCost(product);
        const supplierDiscount = currentCost < product.cost;
        const history = (market.history || []).slice(-5);
        return `
          <article class="card">
            <div class="card-top">
              <div class="product-main">
                <div class="product-emoji">${product.emoji}</div>
                <div style="min-width:0"><h3 class="product-title">${escapeHtml(product.name)}</h3><div class="product-category">${escapeHtml(product.category)}</div></div>
              </div>
              <div class="price">${money(currentCost)}</div>
            </div>
            <div class="tags">
              ${supplierDiscount ? `<span class="tag good">Скидка поставщика ${Math.round((1 - currentCost / product.cost) * 100)}%</span>` : ""}
              <span class="tag">Рынок: ${money(market.price)}</span>
              <span class="tag">Тренд: ${trendLabel(market.trend)}</span>
              <span class="tag">Конкуренты: ${market.competitors}</span>
              <span class="tag ${margin > 250 ? "good" : ""}">Маржа ≈ ${money(margin)}</span>
              <span class="tag">Спрос ${market.demand.toFixed(1)}/12</span>
              <span class="tag ${product.returnRate >= .09 ? "bad" : ""}">Возвраты ${Math.round(product.returnRate * 100)}%</span>
            </div>
            <div class="sparkline" aria-label="История цены">
              ${history.map(point => `<span style="height:${clamp(point.price / product.marketPrice * 32, 8, 42)}px" title="${money(point.price)}"></span>`).join("")}
            </div>
            <div class="product-actions">
              <button class="primary-btn buy-btn" data-id="${product.id}" type="button">Закупить</button>
              <button class="secondary-btn go-stock-btn" data-id="${product.id}" type="button" ${current ? "" : "disabled"}>На складе: ${current?.qty || 0}</button>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;

  document.querySelectorAll(".buy-btn").forEach(button => button.addEventListener("click", () => openPurchase(button.dataset.id)));
  document.querySelectorAll(".go-stock-btn").forEach(button => button.addEventListener("click", () => switchTab("stock")));
}

function renderStock() {
  const products = ownedProducts();
  if (products.length === 0) {
    view.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h2>Склад пуст</h2>
        <p>Сначала закупите товар у поставщика.</p>
        <button id="open-market" class="primary-btn" type="button">Перейти на рынок</button>
      </div>
    `;
    document.getElementById("open-market").addEventListener("click", () => switchTab("market"));
    return;
  }

  view.innerHTML = `
    <section class="card">
      <h2>Управление товарами</h2>
      <p style="color:var(--muted);margin-bottom:0">Слишком высокая цена уменьшает продажи. Реклама стоит ${money(effectiveAdCost())} за каждый игровой день.</p>
    </section>
    ${products.map(product => {
      const item = state.inventory[product.id];
      item.adStrategy = item.adStrategy || (item.adActive ? "standard" : "none");
      item.card = normalizeInventoryItem(product, item).card;
      const market = currentMarket(product);
      const margin = grossMargin(product, item.price);
      const stockPercent = clamp(item.qty / 50 * 100, 0, 100);
      const risk = productRiskLabel(product, item.price);
      const zeroPrice = Math.round(market.price * ZERO_DEMAND_PRICE_RATIO / 10) * 10;
      const pricePercent = Math.round(item.price / market.price * 100);
      const forecast = salesForecast(product, item);
      const competitors = (state.competitors[product.id] || []).slice(0, 2);
      const nextUpgrade = nextCardUpgrade(item);
      const isFeatured = state.featuredProductId === product.id;
      return `
        <article class="card ${isFeatured ? "featured-card" : ""}">
          <div class="card-top">
            <div class="product-main">
              <div class="product-emoji">${product.emoji}</div>
              <div style="min-width:0"><h3 class="product-title">${escapeHtml(product.name)}</h3><div class="product-category">${isFeatured ? "Товар дня" : `Продано за всё время: ${item.lifetimeSold || 0}`}</div></div>
            </div>
            <div class="price">${item.qty} шт.</div>
          </div>
          <div style="margin-top:12px" class="progress"><div style="width:${stockPercent}%"></div></div>
          <div class="stock-controls">
            <div class="control-row">
              <div class="field">
                <label for="price-${product.id}">Цена продажи</label>
                <input id="price-${product.id}" class="price-input" data-id="${product.id}" type="number" min="1" step="10" value="${Math.round(item.price)}" inputmode="numeric" />
              </div>
              <button class="small-btn save-price" data-id="${product.id}" type="button">Сохранить</button>
            </div>
            <div class="tags">
              <span class="tag">Рынок: ${money(market.price)}</span>
              <span class="tag">Цена: ${pricePercent}% рынка</span>
              <span class="tag">Прогноз: ${forecast.min}-${forecast.max} шт.</span>
              <span class="tag bad">0% спроса от ${money(zeroPrice)}</span>
              <span class="tag ${risk.className}">${risk.label}</span>
              <span class="tag ${margin >= 0 ? "good" : "bad"}">Маржа: ${money(margin)}</span>
            </div>
            <div class="mini-panel">
              <strong>Конкуренты</strong>
              ${competitors.map(competitor => `<span>${escapeHtml(competitor.strategy)}: ${money(competitor.price)}, рейтинг ${competitor.rating.toFixed(1)}</span>`).join("")}
            </div>
            <div class="ad-grid">
              ${AD_STRATEGIES.map(strategy => `
                <button class="ad-option ${item.adStrategy === strategy.id ? "active" : ""}" data-id="${product.id}" data-ad="${strategy.id}" type="button">
                  <span>${strategy.emoji}</span>
                  <strong>${escapeHtml(strategy.title)}</strong>
                  <small>${strategy.costFactor ? money(Math.round(effectiveAdCost() * strategy.costFactor)) : "0 ₽"}</small>
                </button>
              `).join("")}
            </div>
            <div class="mini-panel">
              <strong>Карточка: рейтинг ${item.card.rating.toFixed(2)}, отзывов ${item.card.reviews}</strong>
              <span>Улучшения: ${item.card.upgrades.length ? item.card.upgrades.map(id => CARD_UPGRADES.find(upgrade => upgrade.id === id)?.title).filter(Boolean).join(", ") : "нет"}</span>
            </div>
            <button class="secondary-btn improve-card-btn" data-id="${product.id}" type="button" ${nextUpgrade ? "" : "disabled"}>
              ${nextUpgrade ? `Улучшить: ${nextUpgrade.title} (${money(cardUpgradeCost(nextUpgrade))})` : "Карточка улучшена полностью"}
            </button>
            <button class="secondary-btn feature-btn" data-id="${product.id}" type="button">
              ${isFeatured ? "Убрать с витрины дня" : `Сделать товаром дня (${money(FEATURED_PRODUCT_COST)}/день)`}
            </button>
            <button class="secondary-btn stop-sale-btn" data-id="${product.id}" type="button">
              ${item.stopped ? "Вернуть в продажу" : "Остановить продажи"}
            </button>
            <button class="secondary-btn restock-btn" data-id="${product.id}" type="button">Докупить товар</button>
          </div>
        </article>
      `;
    }).join("")}
  `;

  document.querySelectorAll(".save-price").forEach(button => button.addEventListener("click", () => updatePrice(button.dataset.id)));
  document.querySelectorAll(".ad-option").forEach(button => button.addEventListener("click", () => setAdStrategy(button.dataset.id, button.dataset.ad)));
  document.querySelectorAll(".improve-card-btn").forEach(button => button.addEventListener("click", () => improveCard(button.dataset.id)));
  document.querySelectorAll(".feature-btn").forEach(button => button.addEventListener("click", () => toggleFeaturedProduct(button.dataset.id)));
  document.querySelectorAll(".stop-sale-btn").forEach(button => button.addEventListener("click", () => toggleSaleStopped(button.dataset.id)));
  document.querySelectorAll(".restock-btn").forEach(button => button.addEventListener("click", () => openPurchase(button.dataset.id)));
}

function renderWarehouse() {
  const used = storageUsed(true);
  const capacity = warehouseCapacity();
  const fillPercent = clamp(used / capacity * 100, 0, 120);
  const damagedTotal = Object.values(state.inventory).reduce((sum, item) => sum + (item.damaged || 0), 0);
  const cityWarehouseCost = Math.round(CITY_CONFIG.cityWarehouseCost * (districtState("industrial").controlled ? 0.82 : 1) / 100) * 100;

  view.innerHTML = `
    <section class="card">
      <div class="section-heading">
        <h2>Склад и поставки</h2>
        <span class="section-note">${used}/${capacity} складских ед.</span>
      </div>
      <div class="progress"><div style="width:${Math.min(fillPercent, 100)}%"></div></div>
      <div class="tags">
        <span class="tag ${fillPercent > 90 ? "bad" : "good"}">Заполненность ${Math.round(fillPercent)}%</span>
        <span class="tag">Хранение ${money(holdingCost())}/день</span>
        <span class="tag ${damagedTotal ? "bad" : ""}">Брак ${damagedTotal} шт.</span>
        <span class="tag">Инфраструктура ${money(warehouseFacilityDailyCost())}/день</span>
      </div>
    </section>

    <section class="section">
      <article class="card">
        <div class="section-heading">
          <h2>Городская логистика</h2>
          <span class="section-note">${state.city.builtCityWarehouse ? "Городской склад работает" : state.city.unlockedMechanics.cityWarehouse ? "Доступно строительство" : "Откроется после контроля нескольких районов"}</span>
        </div>
        <div class="tags">
          <span class="tag">Скидка доставки ${Math.round(cityLogisticsDiscount() * 100)}%</span>
          <span class="tag">Скидка хранения ${Math.round(cityStorageDiscount() * 100)}%</span>
          <span class="tag">Доп. вместимость ${warehouseFacilityCapacity()} ед.</span>
        </div>
        <button id="build-city-warehouse" class="secondary-btn" type="button" ${!state.city.builtCityWarehouse && state.city.unlockedMechanics.cityWarehouse && state.balance >= cityWarehouseCost ? "" : "disabled"}>
          ${state.city.builtCityWarehouse ? "Городской склад построен" : `Построить городской склад (${money(cityWarehouseCost)})`}
        </button>
      </article>
    </section>

    <section class="section">
      <div class="section-heading"><h2>Поставки в пути</h2><span class="section-note">${state.shipments.length} активных</span></div>
      ${state.shipments.length ? state.shipments.map(shipment => {
        const product = productById(shipment.productId);
        const supplier = supplierById(shipment.supplierId);
        return `
          <article class="card compact-card">
            <div class="card-top">
              <div class="product-main">
                <div class="product-emoji">${product?.emoji || "📦"}</div>
                <div><h3 class="product-title">${escapeHtml(product?.name || "Товар")}</h3><div class="product-category">${escapeHtml(supplier.title)} · прибытие день ${shipment.arrivalDay}</div></div>
              </div>
              <div class="price">${shipment.qty} шт.</div>
            </div>
          </article>
        `;
      }).join("") : `<div class="empty-state"><div class="empty-icon">🚚</div><h2>Поставок нет</h2><p>Закажите товар на вкладке «Рынок» или включите автозаказ.</p></div>`}
    </section>

    <section class="section">
      <div class="section-heading"><h2>Остатки</h2><span class="section-note">Включая брак и остановленные товары</span></div>
      ${ownedProducts().length ? ownedProducts().map(product => {
        const item = state.inventory[product.id];
        return `
          <article class="card compact-card">
            <div class="card-top">
              <div class="product-main">
                <div class="product-emoji">${product.emoji}</div>
                <div><h3 class="product-title">${escapeHtml(product.name)}</h3><div class="product-category">${item.stopped ? "Продажи остановлены" : "В продаже"} · объём ${product.volume} ед./шт.</div></div>
              </div>
              <div class="price">${item.qty} шт.</div>
            </div>
            <div class="tags">
              <span class="tag">Занято ${item.qty * product.volume} ед.</span>
              <span class="tag ${item.damaged ? "bad" : ""}">Брак ${item.damaged || 0}</span>
              <span class="tag">Возраст ${item.age || 0} дн.</span>
            </div>
            ${(item.damaged || 0) > 0 ? `
              <div class="product-actions">
                <button class="secondary-btn damaged-action" data-id="${product.id}" data-action="discount" type="button">Продать с уценкой</button>
                <button class="secondary-btn damaged-action" data-id="${product.id}" data-action="writeoff" type="button">Списать</button>
              </div>
            ` : ""}
          </article>
        `;
      }).join("") : `<div class="empty-state"><div class="empty-icon">📭</div><h2>Склад пуст</h2><p>Сначала закупите товар.</p></div>`}
    </section>
  `;

  document.getElementById("build-city-warehouse")?.addEventListener("click", buildCityWarehouse);
  document.querySelectorAll(".damaged-action").forEach(button => button.addEventListener("click", () => handleDamagedGoods(button.dataset.id, button.dataset.action)));
}

function renderObjects() {
  const points = playerPickupPoints();
  const freeInUnlocked = unlockedDistricts().flatMap(district => freePickupPoints(district.id).slice(0, 2));

  view.innerHTML = `
    <section class="card">
      <div class="section-heading">
        <h2>Сеть ПВЗ</h2>
        <span class="section-note">Постоянные расходы: ${money(pickupNetworkDailyExpense())}/день</span>
      </div>
      <div class="metrics-grid">
        <article class="metric-card"><div class="metric-label">Точек</div><div class="metric-value">${points.length}</div></article>
        <article class="metric-card"><div class="metric-label">Средний рейтинг</div><div class="metric-value">${points.length ? avg(points.map(point => point.rating)).toFixed(2) : "—"}</div></article>
        <article class="metric-card"><div class="metric-label">Средняя загрузка</div><div class="metric-value">${points.length ? `${Math.round(avg(points.map(point => point.load)) * 100)}%` : "—"}</div></article>
        <article class="metric-card"><div class="metric-label">Контроль районов</div><div class="metric-value">${controlledDistricts().length}/${DISTRICTS.length}</div></article>
      </div>
    </section>

    <section class="section">
      <div class="section-heading"><h2>Ваши ПВЗ</h2><span class="section-note">Улучшения повышают влияние и помогают закрепить контроль</span></div>
      ${points.length ? points.map(point => renderPointListItem(point)).join("") : `<div class="empty-state"><div class="empty-icon">📍</div><h2>ПВЗ нет</h2><p>Откройте первую точку на карте района.</p></div>`}
    </section>

    <section class="section">
      <div class="section-heading"><h2>Свободные помещения</h2><span class="section-note">Первые варианты в открытых районах</span></div>
      ${freeInUnlocked.length ? freeInUnlocked.map(point => renderPointListItem(point)).join("") : `<div class="empty-state"><div class="empty-icon">🏢</div><h2>Свободных помещений нет</h2><p>Откройте соседний район или дождитесь реакции рынка.</p></div>`}
    </section>
  `;

  document.querySelectorAll(".inspect-point").forEach(button => button.addEventListener("click", () => openFacilityModal(button.dataset.point)));
  document.querySelectorAll(".open-point").forEach(button => button.addEventListener("click", () => openPickupPoint(button.dataset.point)));
  document.querySelectorAll(".upgrade-point").forEach(button => button.addEventListener("click", () => upgradePickupPoint(button.dataset.point)));
}

function renderAnalytics() {
  const history = state.financeHistory.slice(0, 7).reverse();
  const topMarkets = PRODUCTS
    .map(product => ({ product, market: currentMarket(product), forecast: salesForecast(product) }))
    .sort((a, b) => b.market.demand - a.market.demand)
    .slice(0, 5);
  const latestProfit = state.financeHistory[0]?.profit || 0;

  view.innerHTML = `
    <section class="card">
      <div class="section-heading">
        <h2>Аналитика</h2>
        <span class="section-note">Последние ${history.length || 0} дней</span>
      </div>
      <div class="metrics-grid">
        <article class="metric-card"><div class="metric-label">Последняя прибыль</div><div class="metric-value ${latestProfit >= 0 ? "positive" : "negative"}">${money(latestProfit)}</div></article>
        <article class="metric-card"><div class="metric-label">Средняя прибыль</div><div class="metric-value">${money(avg(history.map(item => item.profit)))}</div></article>
        <article class="metric-card"><div class="metric-label">Средние продажи</div><div class="metric-value">${avg(history.map(item => item.sold)).toFixed(1)}</div></article>
        <article class="metric-card"><div class="metric-label">Рейтинг</div><div class="metric-value">${state.rating.toFixed(2)}</div></article>
      </div>
      <div class="bar-chart">
        ${history.map(item => `<span class="${item.profit >= 0 ? "positive" : "negative"}" style="height:${clamp(Math.abs(item.profit) / 900, 8, 58)}px" title="День ${item.day}: ${money(item.profit)}"></span>`).join("")}
      </div>
    </section>

    <section class="section">
      <div class="section-heading"><h2>Рынки</h2><span class="section-note">Спрос, тренд и прогноз</span></div>
      ${topMarkets.map(({ product, market, forecast }) => `
        <article class="card compact-card">
          <div class="card-top">
            <div class="product-main">
              <div class="product-emoji">${product.emoji}</div>
              <div><h3 class="product-title">${escapeHtml(product.name)}</h3><div class="product-category">${trendLabel(market.trend)} · конкуренты ${market.competitors}</div></div>
            </div>
            <div class="price">${money(market.price)}</div>
          </div>
          <div class="tags">
            <span class="tag">Спрос ${market.demand.toFixed(1)}/12</span>
            <span class="tag">Прогноз ${forecast.min}-${forecast.max} шт.</span>
            <span class="tag">Насыщение ${Math.round(market.saturation * 100)}%</span>
          </div>
        </article>
      `).join("")}
    </section>

    <section class="section">
      <div class="section-heading"><h2>Районы</h2><span class="section-note">Доля рынка меняется с инерцией ${Math.round(CITY_CONFIG.shareInertia * 100)}%</span></div>
      ${DISTRICTS.map(district => {
        const districtData = districtState(district.id);
        const status = districtStatusInfo(district.id);
        return `
          <article class="card compact-card">
            <div class="card-top">
              <div>
                <h3>${escapeHtml(district.name)}</h3>
                <div class="product-category">${escapeHtml(status.title)} · цель ${Math.round(districtData.targetShares.player || 0)}%</div>
              </div>
              <div class="price">${Math.round(districtData.shares.player || 0)}%</div>
            </div>
            <div class="share-stack">
              ${["player", "lowprice", "premiumbox", "fastgo", "other"].map(owner => `<span style="width:${districtData.shares[owner] || 0}%;background:${ownerColor(owner)}"></span>`).join("")}
            </div>
            <div class="tags">
              <span class="tag">ПВЗ ${playerPickupPoints(district.id).length}</span>
              <span class="tag">Лояльность ${Math.round(districtData.loyalty.player || 0)}%</span>
              <span class="tag">Лидер ${escapeHtml(ownerShortName(districtLeaderOwner(district.id)))}</span>
            </div>
          </article>
        `;
      }).join("")}
    </section>
  `;
}

function renderDevelopment() {
  view.innerHTML = `
    ${renderUpgradesSection()}
    ${renderStaffSection()}
    ${renderAutomationSection()}
  `;

  document.querySelectorAll(".buy-upgrade").forEach(button => button.addEventListener("click", () => buyUpgrade(button.dataset.id)));
  document.querySelectorAll(".hire-staff").forEach(button => button.addEventListener("click", () => hireStaff(button.dataset.id)));
  document.querySelectorAll(".automation-toggle").forEach(button => button.addEventListener("click", () => toggleAutomation(button.dataset.id)));
}

function renderTasks() {
  const task = state.dailyTask || createDailyTask();
  view.innerHTML = `
    <section class="card">
      <div class="section-heading">
        <h2>Задача дня</h2>
        <span class="section-note">${task.claimed ? "Выполнена" : "Активна"}</span>
      </div>
      <h3>${escapeHtml(task.title)}</h3>
      <p style="color:var(--muted);margin-bottom:12px">Награда ${money(task.reward)}. Задача проверяется после завершения дня.</p>
      <span class="tag ${task.claimed ? "good" : ""}">${task.claimed ? "Награда получена" : "В работе"}</span>
    </section>
    ${renderGoalsSection()}
  `;

  document.querySelectorAll(".claim-goal").forEach(button => button.addEventListener("click", () => claimGoal(button.dataset.id)));
}

function renderProfile() {
  const user = tg?.initDataUnsafe?.user;
  const name = storeName();
  const firstLetter = name.trim().charAt(0).toUpperCase() || "И";
  const assets = state.balance + inventoryValue();
  const roi = state.totalRevenue > 0 ? (state.totalProfit / state.totalRevenue) * 100 : 0;
  const level = sellerLevel();
  const levelProgress = (state.totalOrders % 50) / 50 * 100;

  view.innerHTML = `
    <article class="card">
      <div class="profile-name">
        <div class="avatar">${escapeHtml(firstLetter)}</div>
        <div><h2 style="margin-bottom:3px">${escapeHtml(name)}</h2><div class="product-category">${user?.first_name ? `Владелец: ${escapeHtml(user.first_name)} · ` : ""}уровень сети ${level}</div></div>
      </div>
      <div style="margin-top:16px" class="progress"><div style="width:${levelProgress}%"></div></div>
      <div class="section-note" style="margin-top:7px">До следующего уровня: ${50 - state.totalOrders % 50} продаж</div>
    </article>

    <section class="section">
      <div class="metrics-grid">
        <article class="metric-card"><div class="metric-label">Активы</div><div class="metric-value">${money(assets)}</div></article>
        <article class="metric-card"><div class="metric-label">ROI</div><div class="metric-value ${roi >= 0 ? "positive" : "negative"}">${roi.toFixed(1)}%</div></article>
        <article class="metric-card"><div class="metric-label">Рейтинг</div><div class="metric-value">${state.rating.toFixed(2)}</div></article>
        <article class="metric-card"><div class="metric-label">Контроль районов</div><div class="metric-value">${controlledDistricts().length}/${DISTRICTS.length}</div></article>
      </div>
    </section>

    <section class="section">
      <article class="card report-list">
        <div class="report-row"><span>Денег на балансе</span><strong>${money(state.balance)}</strong></div>
        <div class="report-row"><span>Стоимость остатков</span><strong>${money(inventoryValue())}</strong></div>
        <div class="report-row"><span>Продано товаров</span><strong>${state.totalOrders}</strong></div>
        <div class="report-row"><span>Чистая прибыль</span><strong class="${state.totalProfit >= 0 ? "positive" : "negative"}">${money(state.totalProfit)}</strong></div>
        <div class="report-row"><span>ПВЗ сети</span><strong>${playerPickupPoints().length}</strong></div>
        <div class="report-row"><span>Игровых дней</span><strong>${state.day - 1}</strong></div>
        <div class="report-row"><span>Версия сохранения</span><strong>v${state.saveVersion}</strong></div>
      </article>
    </section>

    <section class="section">
      <button id="reset-game" class="danger-btn" type="button">Начать игру заново</button>
    </section>
  `;

  document.getElementById("reset-game").addEventListener("click", resetGame);
}

function renderUpgradesSection() {
  return `
    <section class="section">
      <div class="section-heading">
        <h2>Развитие магазина</h2>
        <span class="section-note">До ${MAX_UPGRADE_LEVEL} уровня</span>
      </div>
      <div class="upgrade-grid">
        ${UPGRADE_DEFS.map(upgrade => {
          const level = upgradeLevel(upgrade.id);
          const maxed = level >= MAX_UPGRADE_LEVEL;
          const cost = upgradeCost(upgrade);
          const canBuy = state.balance >= cost && !maxed;

          return `
            <article class="upgrade-card">
              <div class="upgrade-top">
                <div class="upgrade-icon">${upgrade.emoji}</div>
                <div>
                  <h3>${escapeHtml(upgrade.title)}</h3>
                  <div class="upgrade-level">Уровень ${level}/${MAX_UPGRADE_LEVEL}</div>
                </div>
              </div>
              <p>${escapeHtml(upgrade.text)}</p>
              <div class="upgrade-effect">${escapeHtml(upgrade.effect)}</div>
              <div class="progress"><div style="width:${level / MAX_UPGRADE_LEVEL * 100}%"></div></div>
              <button class="secondary-btn buy-upgrade" data-id="${upgrade.id}" type="button" ${canBuy ? "" : "disabled"}>
                ${maxed ? "Максимум" : `Улучшить за ${money(cost)}`}
              </button>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderStaffSection() {
  return `
    <section class="section">
      <div class="section-heading">
        <h2>Сотрудники</h2>
        <span class="section-note">Зарплаты: ${money(staffSalaryTotal())}/день</span>
      </div>
      <div class="upgrade-grid">
        ${STAFF_DEFS.map(staff => {
          const hired = staffHired(staff.id);
          const canHire = state.balance >= staff.hireCost && !hired;
          return `
            <article class="upgrade-card">
              <div class="upgrade-top">
                <div class="upgrade-icon">${staff.emoji}</div>
                <div>
                  <h3>${escapeHtml(staff.title)}</h3>
                  <div class="upgrade-level">${hired ? "В команде" : `Найм ${money(staff.hireCost)}`}</div>
                </div>
              </div>
              <p>${escapeHtml(staff.text)}</p>
              <div class="upgrade-effect">${escapeHtml(staff.effect)} · зарплата ${money(staff.salary)}/день</div>
              <button class="secondary-btn hire-staff" data-id="${staff.id}" type="button" ${canHire ? "" : "disabled"}>
                ${hired ? "Нанят" : "Нанять"}
              </button>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderAutomationSection() {
  return `
    <section class="section">
      <div class="section-heading">
        <h2>Автоматизация</h2>
        <span class="section-note">Работает перед расчётом дня</span>
      </div>
      <div class="upgrade-grid">
        ${AUTOMATION_DEFS.map(rule => {
          const unlocked = staffHired(rule.requires);
          const enabled = automationEnabled(rule.id);
          const staff = STAFF_DEFS.find(item => item.id === rule.requires);
          return `
            <article class="upgrade-card">
              <div class="upgrade-top">
                <div class="upgrade-icon">${rule.emoji}</div>
                <div>
                  <h3>${escapeHtml(rule.title)}</h3>
                  <div class="upgrade-level">${unlocked ? "Доступно" : `Нужен: ${staff?.title || "сотрудник"}`}</div>
                </div>
              </div>
              <p>${escapeHtml(rule.text)}</p>
              <button class="secondary-btn automation-toggle" data-id="${rule.id}" type="button" ${unlocked ? "" : "disabled"}>
                ${enabled ? "Выключить" : "Включить"}
              </button>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function switchTab(tab) {
  activeTab = tab;
  vibrate("light");
  window.scrollTo({ top: 0, behavior: "smooth" });
  render();
}

function selectDistrict(districtId) {
  if (!DISTRICT_BY_ID[districtId]) return;
  state.city.selectedDistrictId = districtId;
  state.city.mapMode = "district";
  activeTab = "home";
  saveState();
  vibrate("light");
  render();
}

function openFacilityModal(pointId) {
  const point = pickupPointById(pointId);
  if (!point) return;
  const district = districtDef(point.districtId);
  const own = point.owner === PLAYER_OWNER;
  const free = !point.owner;
  const openCost = pickupOpenCost(point.districtId, point);
  const upgradeCostValue = own ? pickupUpgradeCost(point) : 0;

  modalContent.innerHTML = `
    <div class="modal-product">
      <div class="product-emoji point-dot" style="--owner:${ownerColor(point.owner)}">${free ? "+" : point.level}</div>
      <div>
        <h2 id="modal-title" style="margin-bottom:3px">${escapeHtml(point.name)}</h2>
        <div class="product-category">${escapeHtml(district.name)} · ${escapeHtml(point.zone)}</div>
      </div>
    </div>
    <article class="cost-box">
      <div class="report-row"><span>Владелец</span><strong>${escapeHtml(free ? "Свободно" : ownerName(point.owner))}</strong></div>
      <div class="report-row"><span>Трафик</span><strong>x${point.traffic.toFixed(2)}</strong></div>
      <div class="report-row"><span>Аренда</span><strong>${money(point.rent)}/день</strong></div>
      <div class="report-row"><span>Площадь</span><strong>${point.area} м²</strong></div>
      ${free ? `<div class="report-row total"><span>Открытие</span><strong>${money(openCost)}</strong></div>` : ""}
      ${own ? `
        <div class="report-row"><span>Рейтинг</span><strong>${point.rating.toFixed(2)}</strong></div>
        <div class="report-row"><span>Загрузка</span><strong>${Math.round(point.load * 100)}%</strong></div>
        <div class="report-row"><span>Очередь</span><strong>${point.queue} мин.</strong></div>
        <div class="report-row"><span>Расходы</span><strong>${money(pickupDailyExpense(point))}/день</strong></div>
        <div class="report-row total"><span>Улучшение</span><strong>${point.level < 4 ? money(upgradeCostValue) : "максимум"}</strong></div>
      ` : ""}
    </article>
    <div class="tags">
      <span class="tag">Охват ${point.coverage.toFixed(1)} кварталов</span>
      <span class="tag">Состояние ${Math.round(point.condition * 100)}%</span>
      <span class="tag">Потенциал ${Math.round(point.traffic * district.averageCheck * 100)}%</span>
    </div>
    ${free ? `<button id="modal-open-point" class="primary-btn" data-point="${point.id}" type="button" ${state.balance >= openCost ? "" : "disabled"}>Открыть ПВЗ</button>` : ""}
    ${own ? `<button id="modal-upgrade-point" class="primary-btn" data-point="${point.id}" type="button" ${point.level < 4 && state.balance >= upgradeCostValue ? "" : "disabled"}>${point.level < 4 ? "Улучшить ПВЗ" : "Максимальный уровень"}</button>` : ""}
  `;
  modalBackdrop.classList.remove("hidden");
  modalBackdrop.setAttribute("aria-hidden", "false");
  document.getElementById("modal-open-point")?.addEventListener("click", event => openPickupPoint(event.currentTarget.dataset.point));
  document.getElementById("modal-upgrade-point")?.addEventListener("click", event => upgradePickupPoint(event.currentTarget.dataset.point));
}

function openPickupPoint(pointId) {
  const point = pickupPointById(pointId);
  if (!point || point.owner) return;
  const district = districtState(point.districtId);
  if (!district.unlocked) {
    notify("Сначала откройте район для экспансии");
    return;
  }
  const cost = pickupOpenCost(point.districtId, point);
  if (state.balance < cost) {
    notify("Не хватает денег на открытие ПВЗ");
    return;
  }
  if (!spendActionPoint("открыть ПВЗ")) return;

  state.balance -= cost;
  const nextNumber = playerPickupPoints(point.districtId).length + 1;
  point.owner = PLAYER_OWNER;
  point.name = `${storeName()} ${nextNumber}`;
  point.level = 1;
  point.capacity = 48;
  point.load = 0.24;
  point.staff = 1;
  point.serviceSpeed = 0.9;
  point.rating = 4.25;
  point.awareness = 0.16;
  point.coverage = Math.round((point.coverage + 2.5) * 10) / 10;
  state.events.unshift(`${storeName()} открыл ПВЗ в районе «${districtDef(point.districtId).name}»: ${point.zone}.`);
  updateCityProgression();
  saveState();
  closeModal();
  vibrate("medium");
  notify("ПВЗ открыт");
  render();
}

function upgradePickupPoint(pointId) {
  const point = pickupPointById(pointId);
  if (!point || point.owner !== PLAYER_OWNER) return;
  if (point.level >= 4) {
    notify("ПВЗ уже на максимальном уровне");
    return;
  }
  const cost = pickupUpgradeCost(point);
  if (state.balance < cost) {
    notify("Не хватает денег на улучшение ПВЗ");
    return;
  }
  if (!spendActionPoint("улучшить ПВЗ")) return;

  state.balance -= cost;
  point.level += 1;
  point.capacity += 34;
  point.staff += point.level >= 3 ? 2 : 1;
  point.serviceSpeed = Math.round((point.serviceSpeed + 0.14) * 100) / 100;
  point.rating = clamp(point.rating + 0.08, 1, 5);
  point.condition = clamp(point.condition + 0.08, 0, 1.05);
  point.coverage = Math.round((point.coverage + 3.2) * 10) / 10;
  state.events.unshift(`ПВЗ «${point.name}» улучшен до уровня ${point.level}.`);
  updateCityProgression();
  saveState();
  closeModal();
  vibrate("medium");
  notify(`ПВЗ улучшен до уровня ${point.level}`);
  render();
}

function launchLocalAd(districtId, strategyId) {
  const district = districtState(districtId);
  const strategy = CITY_CONFIG.districtAdStrategies.find(item => item.id === strategyId);
  if (!district.unlocked || !strategy || !playerPickupPoints(districtId).length) return;
  const cost = districtAdCost(districtId, strategyId);
  if (state.balance < cost) {
    notify("Не хватает денег на локальную рекламу");
    return;
  }

  state.balance -= cost;
  state.city.pendingDistrictAdSpend = (state.city.pendingDistrictAdSpend || 0) + cost;
  district.localAd = {
    strategyId: strategy.id,
    title: strategy.title,
    boost: strategy.boost,
    days: strategy.days,
    spend: cost
  };
  state.events.unshift(`${storeName()} запустил локальную рекламу в районе «${districtDef(districtId).name}»: ${strategy.title}.`);
  saveState();
  vibrate("light");
  notify("Локальная реклама запущена");
  render();
}

function unlockDistrict(districtId) {
  const district = districtState(districtId);
  if (!district || district.unlocked) return;
  if (districtAccessState(districtId) !== "available") {
    notify("Сначала захватите соседний район");
    return;
  }
  const cost = expansionCost(districtId);
  if (state.balance < cost) {
    notify("Не хватает денег на маршрут экспансии");
    return;
  }

  state.balance -= cost;
  district.unlocked = true;
  district.status = "none";
  district.history.unshift({ day: state.day, playerShare: district.shares.player, status: "unlocked" });
  state.city.selectedDistrictId = districtId;
  state.city.mapMode = "district";
  state.events.unshift(`Открыт маршрут экспансии в район «${districtDef(districtId).name}». Теперь можно выбрать помещение под ПВЗ.`);
  saveState();
  vibrate("medium");
  notify("Район открыт для экспансии");
  render();
}

function buildCityWarehouse() {
  if (state.city.builtCityWarehouse) return;
  if (!state.city.unlockedMechanics.cityWarehouse) {
    notify("Городской склад откроется после контроля нескольких районов");
    return;
  }
  const industrialDiscount = districtState("industrial").controlled ? 0.82 : 1;
  const cost = Math.round(CITY_CONFIG.cityWarehouseCost * industrialDiscount / 100) * 100;
  if (state.balance < cost) {
    notify("Не хватает денег на городской склад");
    return;
  }
  state.balance -= cost;
  state.city.builtCityWarehouse = true;
  state.events.unshift(`Построен городской склад. Вместимость увеличена на ${CITY_CONFIG.cityWarehouseCapacity} ед.`);
  saveState();
  vibrate("medium");
  notify("Городской склад построен");
  render();
}

function setDailyAction(actionId) {
  if (!DAILY_ACTIONS.some(action => action.id === actionId)) return;
  state.dailyAction = actionId;
  saveState();
  vibrate("light");
  notify(`Фокус дня: ${currentDailyAction().title}`);
  renderHome();
}

function toggleFeaturedProduct(productId) {
  const product = productById(productId);
  if (!product || !state.inventory[productId]) return;

  state.featuredProductId = state.featuredProductId === productId ? null : productId;
  saveState();
  vibrate("light");
  notify(state.featuredProductId ? `Товар дня: ${product.name}` : "Товар дня снят с витрины");
  renderStock();
}

function openPurchase(productId) {
  purchaseProductId = productId;
  const product = productById(productId);
  if (!product) return;
  let selectedSupplierId = state.inventory[productId]?.supplierId || "standard";
  let unitCost = purchaseCost(product, selectedSupplierId);

  modalContent.innerHTML = `
    <div class="modal-product">
      <div class="product-emoji">${product.emoji}</div>
      <div><h2 id="modal-title" style="margin-bottom:3px">${escapeHtml(product.name)}</h2><div class="product-category">Закупка у поставщика</div></div>
    </div>
    <div class="supplier-grid">
      ${SUPPLIERS.map(supplier => `
        <button class="supplier-option ${supplier.id === selectedSupplierId ? "active" : ""}" data-supplier="${supplier.id}" type="button">
          <span>${supplier.emoji}</span>
          <strong>${escapeHtml(supplier.title)}</strong>
          <small>${money(purchaseCost(product, supplier.id))} · мин. ${supplier.minQty} · ${supplier.delay ? `${supplier.delay} дн.` : "сразу"}</small>
        </button>
      `).join("")}
    </div>
    <div class="field"><label for="purchase-qty">Количество</label></div>
    <div class="qty-picker">
      <button id="qty-minus" type="button">−</button>
      <input id="purchase-qty" type="number" min="1" max="999" value="${supplierById(selectedSupplierId).minQty}" inputmode="numeric" />
      <button id="qty-plus" type="button">+</button>
    </div>
    <div class="cost-box">
      <div class="report-row"><span>Цена за штуку</span><strong>${money(unitCost)}</strong></div>
      <div class="report-row"><span>Поставка</span><strong id="supplier-delay">${supplierById(selectedSupplierId).delay ? `${supplierById(selectedSupplierId).delay} дн.` : "сразу"}</strong></div>
      <div class="report-row total"><span>Сумма закупки</span><strong id="purchase-total">${money(unitCost * supplierById(selectedSupplierId).minQty)}</strong></div>
    </div>
    <button id="confirm-purchase" class="primary-btn" type="button">Купить партию</button>
  `;

  modalBackdrop.classList.remove("hidden");
  modalBackdrop.setAttribute("aria-hidden", "false");

  const qtyInput = document.getElementById("purchase-qty");
  const total = document.getElementById("purchase-total");
  const delay = document.getElementById("supplier-delay");
  const confirm = document.getElementById("confirm-purchase");

  const refreshTotal = () => {
    const supplier = supplierById(selectedSupplierId);
    unitCost = purchaseCost(product, selectedSupplierId);
    const qty = clamp(Number.parseInt(qtyInput.value, 10) || supplier.minQty, supplier.minQty, supplier.volumeLimit);
    qtyInput.value = qty;
    const cost = qty * unitCost;
    const reservedVolume = storageUsed(true) + qty * product.volume;
    total.textContent = money(cost);
    delay.textContent = supplier.delay ? `${supplier.delay} дн.` : "сразу";
    confirm.disabled = cost > state.balance || reservedVolume > warehouseCapacity();
    confirm.textContent = cost > state.balance
      ? "Недостаточно денег"
      : reservedVolume > warehouseCapacity()
        ? "Не хватает склада"
        : supplier.delay ? "Заказать поставку" : "Купить партию";
  };

  document.querySelectorAll(".supplier-option").forEach(button => button.addEventListener("click", () => {
    selectedSupplierId = button.dataset.supplier;
    document.querySelectorAll(".supplier-option").forEach(option => option.classList.toggle("active", option.dataset.supplier === selectedSupplierId));
    qtyInput.value = Math.max(Number(qtyInput.value || 0), supplierById(selectedSupplierId).minQty);
    refreshTotal();
  }));
  qtyInput.addEventListener("input", refreshTotal);
  document.getElementById("qty-minus").addEventListener("click", () => { qtyInput.value = Math.max(1, Number(qtyInput.value || 1) - 1); refreshTotal(); });
  document.getElementById("qty-plus").addEventListener("click", () => { qtyInput.value = Math.min(999, Number(qtyInput.value || 1) + 1); refreshTotal(); });
  confirm.addEventListener("click", () => buyProduct(productId, Number.parseInt(qtyInput.value, 10), selectedSupplierId));
  refreshTotal();
}

function closeModal() {
  modalBackdrop.classList.add("hidden");
  modalBackdrop.setAttribute("aria-hidden", "true");
  purchaseProductId = null;
}

function buyProduct(productId, quantity, supplierId = "standard") {
  const product = productById(productId);
  const supplier = supplierById(supplierId);
  const qty = clamp(Number.parseInt(quantity, 10) || 1, 1, 999);
  const cost = purchaseCost(product, supplier.id) * qty;
  const reservedVolume = storageUsed(true) + qty * product.volume;
  if (cost > state.balance) {
    notify("Недостаточно денег для этой закупки");
    return;
  }
  if (qty < supplier.minQty) {
    notify(`Минимальная партия: ${supplier.minQty} шт.`);
    return;
  }
  if (reservedVolume > warehouseCapacity()) {
    notify("Склад переполнится. Улучшите склад или закажите меньше.");
    return;
  }

  state.balance -= cost;
  if (!state.inventory[productId]) {
    state.inventory[productId] = normalizeInventoryItem(product, { qty: 0, price: currentMarket(product).price, supplierId: supplier.id });
  }
  state.inventory[productId].supplierId = supplier.id;
  if (supplier.delay > 0) {
    state.shipments.push({ id: `${Date.now()}-${random().toString(36).slice(2)}`, productId, qty, supplierId: supplier.id, cost, orderDay: state.day, arrivalDay: state.day + supplier.delay });
    state.events.unshift(`Заказана поставка «${product.name}»: ${qty} шт., прибытие день ${state.day + supplier.delay}.`);
  } else {
    state.inventory[productId].qty += qty;
    state.events.unshift(`Закуплено ${qty} шт. товара «${product.name}» за ${money(cost)}.`);
  }
  saveState();
  closeModal();
  vibrate("medium");
  notify(`Партия закуплена: ${qty} шт.`);
  render();
}

function updatePrice(productId) {
  const input = document.getElementById(`price-${productId}`);
  const price = Number.parseInt(input.value, 10);
  if (!Number.isFinite(price) || price <= 0) {
    notify("Введите корректную цену");
    return;
  }
  if (Math.round(state.inventory[productId].price) !== price && !spendActionPoint("изменить цену")) return;
  state.inventory[productId].price = price;
  saveState();
  vibrate("light");
  notify(priceDemandChance(productById(productId), price) === 0 ? "Цена сохранена: спрос 0%" : "Цена сохранена");
  renderStock();
}

function setAdStrategy(productId, strategyId) {
  const item = state.inventory[productId];
  if (!item || !AD_STRATEGIES.some(strategy => strategy.id === strategyId)) return;
  item.adStrategy = strategyId;
  item.adActive = strategyId !== "none";
  saveState();
  vibrate("light");
  notify(`Реклама: ${adStrategyById(strategyId).title}`);
  renderStock();
}

function improveCard(productId) {
  const product = productById(productId);
  const item = state.inventory[productId];
  if (!product || !item) return;
  const upgrade = nextCardUpgrade(item);
  if (!upgrade) {
    notify("Карточка уже полностью улучшена");
    return;
  }
  const cost = cardUpgradeCost(upgrade);
  if (state.balance < cost) {
    notify("Не хватает денег на улучшение карточки");
    return;
  }
  if (!spendActionPoint("улучшить карточку")) return;
  state.balance -= cost;
  item.card.upgrades.push(upgrade.id);
  item.card.level = item.card.upgrades.length;
  item.card.trust = clamp(item.card.trust + 0.07, 0, 1);
  state.events.unshift(`Карточка «${product.name}» улучшена: ${upgrade.title}.`);
  saveState();
  vibrate("medium");
  notify(`Карточка улучшена: ${upgrade.title}`);
  renderStock();
}

function toggleSaleStopped(productId) {
  const product = productById(productId);
  const item = state.inventory[productId];
  if (!product || !item) return;
  if (!spendActionPoint(item.stopped ? "вернуть товар" : "остановить товар")) return;
  item.stopped = !item.stopped;
  if (item.stopped && state.featuredProductId === productId) state.featuredProductId = null;
  state.events.unshift(item.stopped ? `Продажи «${product.name}» остановлены.` : `«${product.name}» снова в продаже.`);
  saveState();
  vibrate("light");
  renderStock();
}

function claimGoal(goalId) {
  const goal = GOALS.find(item => item.id === goalId);
  if (!goal || !goalDone(goal) || goalClaimed(goal)) return;

  state.claimedGoals.push(goal.id);
  state.balance += goal.reward;
  state.events.unshift(`Получена награда за цель «${goal.title}»: ${money(goal.reward)}.`);
  saveState();
  vibrate("medium");
  notify(`Награда получена: ${money(goal.reward)}`);
  render();
}

function buyUpgrade(upgradeId) {
  const upgrade = UPGRADE_DEFS.find(item => item.id === upgradeId);
  if (!upgrade) return;

  const level = upgradeLevel(upgrade.id);
  if (level >= MAX_UPGRADE_LEVEL) {
    notify("Это улучшение уже на максимальном уровне");
    return;
  }

  const cost = upgradeCost(upgrade);
  if (state.balance < cost) {
    notify("Не хватает денег на улучшение");
    return;
  }

  state.balance -= cost;
  state.upgrades[upgrade.id] = level + 1;
  state.events.unshift(`Улучшение «${upgrade.title}» повышено до уровня ${level + 1}.`);
  saveState();
  vibrate("medium");
  notify(`${upgrade.title}: уровень ${level + 1}`);
  render();
}

function hireStaff(staffId) {
  const staff = STAFF_DEFS.find(item => item.id === staffId);
  if (!staff || staffHired(staff.id)) return;
  if (state.balance < staff.hireCost) {
    notify("Не хватает денег на найм");
    return;
  }
  state.balance -= staff.hireCost;
  state.staff[staff.id] = { hiredDay: state.day };
  state.events.unshift(`Нанят сотрудник: ${staff.title}.`);
  saveState();
  vibrate("medium");
  notify(`Нанят: ${staff.title}`);
  renderDevelopment();
}

function toggleAutomation(ruleId) {
  const rule = AUTOMATION_DEFS.find(item => item.id === ruleId);
  if (!rule || !staffHired(rule.requires)) return;
  state.automations[rule.id] = !state.automations[rule.id];
  state.events.unshift(`${state.automations[rule.id] ? "Включена" : "Выключена"} автоматизация: ${rule.title}.`);
  saveState();
  vibrate("light");
  renderDevelopment();
}

function handleDamagedGoods(productId, action) {
  const product = productById(productId);
  const item = state.inventory[productId];
  if (!product || !item || !item.damaged) return;
  const qty = item.damaged;
  if (action === "discount") {
    const revenue = Math.round(qty * currentMarket(product).price * 0.42);
    state.balance += revenue;
    item.damaged = 0;
    state.events.unshift(`Брак «${product.name}» продан с уценкой за ${money(revenue)}.`);
  }
  if (action === "writeoff") {
    const cost = Math.round(qty * 25);
    if (state.balance < cost) {
      notify("Не хватает денег на списание");
      return;
    }
    state.balance -= cost;
    item.damaged = 0;
    state.events.unshift(`Брак «${product.name}» списан. Расход ${money(cost)}.`);
  }
  saveState();
  renderWarehouse();
}

function estimateReturns(sold, returnRate) {
  if (sold <= 0) return 0;
  let returns = 0;
  for (let i = 0; i < sold; i += 1) {
    if (Math.random() < returnRate) returns += 1;
  }
  return returns;
}

function simulateDay() {
  applyAutomations();
  receiveDueShipments();
  const products = activeStockProducts();
  if (products.length === 0) {
    notify("Сначала закупите товар");
    return;
  }

  const marketEvent = currentMarketEvent();
  const deliveryCost = effectiveDeliveryCost();
  const returnLogisticsCost = effectiveReturnLogisticsCost();
  const adCost = effectiveAdCost();
  const action = currentDailyAction();
  const activeFeatured = state.featuredProductId && state.inventory[state.featuredProductId]?.qty > 0
    ? productById(state.featuredProductId)
    : null;
  const marketingBoost = 1 + upgradeLevel("marketing") * 0.1 + (staffHired("ads") ? 0.12 : 0);
  const priceSensitivity = (marketEvent.priceSensitivity || 1) * (action.priceSensitivityMultiplier || 1);
  const operations = action.cost + (activeFeatured ? FEATURED_PRODUCT_COST : 0);
  const storageCost = holdingCost();
  const salaries = staffSalaryTotal();
  const pickupExpenses = pickupNetworkDailyExpense();
  const warehouseFacilityCost = warehouseFacilityDailyCost();
  const districtAdSpend = state.city.pendingDistrictAdSpend || 0;
  let revenue = 0;
  let refunds = 0;
  let costOfGoods = 0;
  let commission = 0;
  let logistics = 0;
  let ads = 0;
  let soldTotal = 0;
  let returnsTotal = 0;
  let missedSales = 0;
  const productEvents = [];
  const saleReasons = [];

  for (const product of products) {
    const item = state.inventory[product.id];
    if (!item || item.qty <= 0) continue;
    item.adStrategy = item.adStrategy || (item.adActive ? "standard" : "none");
    item.card = normalizeInventoryItem(product, item).card;
    const market = currentMarket(product);
    const strategy = adStrategyById(item.adStrategy);
    const supplier = supplierById(item.supplierId);

    const priceFactor = priceDemandFactor(product, item.price, priceSensitivity);
    const ratingFactor = clamp(state.rating / 4.5, 0.65, 1.15);
    const adFactor = strategy.demandFactor * marketingBoost;
    const noise = randomBetween(0.72, 1.28);
    const demandBase = market.demand * 1.45;
    const interested = Math.round(
      demandBase *
      productDemandMultiplier(product) *
      priceFactor *
      ratingFactor *
      competitionFactor(product) *
      adFactor *
      noise
    );
    let sold = clamp(interested, 0, item.qty);
    missedSales += Math.max(0, interested - item.qty);

    const returns = estimateReturns(sold, effectiveReturnRate(product) * (action.returnMultiplier || 1));
    const netSold = sold - returns;
    const itemRevenue = sold * item.price;
    const itemRefunds = returns * item.price;
    const itemCost = netSold * purchaseCost(product, item.supplierId);
    const itemCommission = netSold * item.price * COMMISSION_RATE;
    const itemLogistics = sold * deliveryCost + returns * returnLogisticsCost;
    const itemAds = Math.round(adCost * strategy.costFactor);

    item.qty -= sold;
    item.qty += returns;
    item.lifetimeSold = (item.lifetimeSold || 0) + netSold;
    item.age += 1;
    item.card.reviews += Math.max(0, Math.round(netSold * randomBetween(0.08, 0.22)));
    const reviewDelta = netSold > 0
      ? (supplier.quality - 0.9) * 0.05 + (returns > sold * 0.12 ? -0.06 : 0.015)
      : -0.005;
    item.card.rating = clamp(item.card.rating + reviewDelta, 1, 5);
    item.card.trust = clamp(item.card.trust + reviewDelta * 0.6, 0, 1);

    revenue += itemRevenue;
    refunds += itemRefunds;
    costOfGoods += itemCost;
    commission += itemCommission;
    logistics += itemLogistics;
    ads += itemAds;
    soldTotal += netSold;
    returnsTotal += returns;

    if (priceFactor === 0) productEvents.push(`🚫 «${product.name}»: цена слишком высокая, прогноз и продажи 0.`);
    if (item.qty === 0 && interested > sold) productEvents.push(`📉 «${product.name}»: упущено ${interested - sold} продаж из-за пустого склада.`);
    if (netSold > 0) productEvents.push(`${product.emoji} ${product.name}: ${netSold} продаж${returns ? `, возвратов ${returns}` : ""}.`);
    if (item.qty === 0) productEvents.push(`⚠️ «${product.name}» закончился на складе.`);
    if (priceFactor < 0.35 && priceFactor > 0) saleReasons.push(`${product.name}: высокая цена снизила конверсию.`);
    if (strategy.id !== "none" && itemAds > itemRevenue * 0.35) saleReasons.push(`${product.name}: реклама дала трафик, но была дорогой.`);
  }

  const pickupIncome = pickupNetworkDailyIncome(soldTotal);
  const profit = revenue - refunds - costOfGoods - commission - logistics - ads - operations - storageCost - salaries - pickupExpenses - warehouseFacilityCost + pickupIncome;
  state.balance += profit;
  state.totalRevenue += revenue - refunds;
  state.totalProfit += profit;
  state.totalOrders += soldTotal;

  if (soldTotal > 0) {
    const returnShare = returnsTotal / Math.max(soldTotal + returnsTotal, 1);
    const serviceBonus = upgradeLevel("brand") * 0.003 + upgradeLevel("logistics") * 0.003;
    const ratingDelta = (returnShare > 0.12 ? -0.05 : returnShare > 0.07 ? -0.02 : 0.01) + serviceBonus + (action.ratingBonus || 0);
    state.rating = clamp(state.rating + ratingDelta, 1, 5);
  } else {
    state.rating = clamp(state.rating - 0.01, 1, 5);
  }

  state.lastReport = {
    day: state.day,
    sold: soldTotal,
    returns: returnsTotal,
    revenue,
    refunds,
    costOfGoods,
    commission,
    logistics,
    ads,
    storageCost,
    salaries,
    pickupIncome,
    pickupExpenses,
    warehouseFacilityCost,
    districtAdSpend,
    operations,
    missedSales,
    reasons: saleReasons,
    profit,
    event: marketEvent.title,
    focus: action.title,
    featured: activeFeatured?.name || null
  };

  evaluateDailyTask(state.lastReport);
  state.financeHistory = [{
    day: state.day,
    revenue: revenue - refunds,
    profit,
    sold: soldTotal,
    ads,
    storageCost,
    rating: state.rating
  }, ...state.financeHistory].slice(0, 14);
  const districtUpdate = updateDistrictsForNewDay(state.lastReport);
  state.lastReport.districts = districtUpdate.snapshots;
  state.lastReport.districtEvents = districtUpdate.events;
  state.city.pendingDistrictAdSpend = 0;
  state.day += 1;
  const nextEvent = pickNextMarketEvent(marketEvent.id);
  state.marketEventId = nextEvent.id;
  updateMarketForNewDay();
  updateCompetitorsForNewDay();
  state.actionsUsed = 0;
  state.dailyTask = createDailyTask(state.day);
  const summary = profit >= 0
    ? `День завершён: прибыль ${money(profit)}, продано ${soldTotal} шт.`
    : `День завершён с убытком ${money(Math.abs(profit))}. Проверьте цену и рекламу.`;
  const tomorrowEvent = `Завтра: ${nextEvent.title}. ${nextEvent.text}`;
  const decisionEvent = `Фокус: ${action.title}${activeFeatured ? `, товар дня: ${activeFeatured.name}` : ""}.`;
  state.events = [summary, tomorrowEvent, decisionEvent, ...districtUpdate.events, ...productEvents, ...state.events].slice(0, 24);
  maybeCreateDecisionEvent(state.lastReport);

  saveState();
  vibrate(profit >= 0 ? "medium" : "heavy");
  notify(summary);
  render();
  if (state.pendingEvent) renderDecisionEventModal();
}

function maybeCreateDecisionEvent(report) {
  if (state.pendingEvent || random() > 0.62) return;
  const candidates = activeStockProducts();
  const product = candidates[Math.floor(random() * candidates.length)] || PRODUCTS[0];
  const item = state.inventory[product.id];
  const market = currentMarket(product);
  const eventTemplates = [
    {
      id: "competitor_cut",
      title: "Конкурент снизил цену",
      text: `На рынке «${product.name}» конкурент резко снизил цену. Можно ответить или сохранить маржу.`,
      options: [
        { id: "ignore", title: "Игнорировать", cost: 0, risk: "риск упустить часть спроса", effect: () => { market.competitors += 1; } },
        { id: "match", title: "Снизить цену на 8%", cost: 0, risk: "меньше маржа", effect: () => { item.price = Math.max(1, Math.round(item.price * 0.92 / 10) * 10); } },
        { id: "card", title: "Усилить карточку", cost: 1200, risk: "расход сейчас", effect: () => { item.card.trust = clamp(item.card.trust + 0.12, 0, 1); } }
      ]
    },
    {
      id: "negative_review",
      title: "Резонансный отзыв",
      text: `Покупатель пожаловался на «${product.name}». Репутация карточки может просесть.`,
      options: [
        { id: "refund", title: "Компенсировать", cost: 900, risk: "деньги сейчас", effect: () => { item.card.rating = clamp(item.card.rating + 0.08, 1, 5); state.rating = clamp(state.rating + 0.015, 1, 5); } },
        { id: "reply", title: "Ответить без компенсации", cost: 0, risk: "не всегда помогает", effect: () => { item.card.trust = clamp(item.card.trust + randomBetween(-0.04, 0.06), 0, 1); } },
        { id: "ignore", title: "Игнорировать", cost: 0, risk: "рейтинг падает", effect: () => { item.card.rating = clamp(item.card.rating - 0.12, 1, 5); state.rating = clamp(state.rating - 0.025, 1, 5); } }
      ]
    },
    {
      id: "supplier_deal",
      title: "Поставщик предлагает скидку",
      text: `Поставщик готов дать скидку на следующую закупку «${product.name}», но просит предоплату.`,
      options: [
        { id: "pay", title: "Внести предоплату", cost: 1400, risk: "заморозка денег", effect: () => { state.suppliers[product.id].cheap.relation = clamp(state.suppliers[product.id].cheap.relation + 0.22, 0, 1); } },
        { id: "standard", title: "Остаться на стандартных условиях", cost: 0, risk: "без бонусов", effect: () => {} }
      ]
    },
    {
      id: "blogger",
      title: "Блогер заметил товар",
      text: `Небольшой блогер готов упомянуть «${product.name}». Эффект может окупиться, а может нет.`,
      options: [
        { id: "buy", title: "Оплатить интеграцию", cost: 2200, risk: "не гарантирует прибыль", effect: () => { market.demand = clamp(market.demand + randomBetween(0.8, 2.4), 1, 12); market.trend = "growing"; } },
        { id: "skip", title: "Пропустить", cost: 0, risk: "без эффекта", effect: () => {} }
      ]
    }
  ];
  const event = eventTemplates[Math.floor(random() * eventTemplates.length)];
  state.pendingEvent = {
    id: event.id,
    productId: product.id,
    title: event.title,
    text: event.text,
    options: event.options.map(({ id, title, cost, risk }) => ({ id, title, cost, risk }))
  };
}

function renderDecisionEventModal() {
  const event = state.pendingEvent;
  if (!event) return;
  modalContent.innerHTML = `
    <div class="modal-product">
      <div class="product-emoji">⚡</div>
      <div><h2 id="modal-title" style="margin-bottom:3px">${escapeHtml(event.title)}</h2><div class="product-category">Событие дня</div></div>
    </div>
    <p style="color:var(--muted);line-height:1.45">${escapeHtml(event.text)}</p>
    <div class="event-choice-list">
      ${event.options.map(option => `
        <button class="event-choice" data-choice="${option.id}" type="button" ${option.cost > state.balance ? "disabled" : ""}>
          <strong>${escapeHtml(option.title)}</strong>
          <span>Стоимость: ${money(option.cost)} · ${escapeHtml(option.risk)}</span>
        </button>
      `).join("")}
    </div>
  `;
  modalBackdrop.classList.remove("hidden");
  modalBackdrop.setAttribute("aria-hidden", "false");
  document.querySelectorAll(".event-choice").forEach(button => button.addEventListener("click", () => applyDecisionEvent(button.dataset.choice)));
}

function applyDecisionEvent(choiceId) {
  const event = state.pendingEvent;
  if (!event) return;
  const product = productById(event.productId);
  const item = state.inventory[event.productId];
  const market = currentMarket(product);
  const choice = event.options.find(option => option.id === choiceId);
  if (!choice || choice.cost > state.balance) return;
  state.balance -= choice.cost;

  if (event.id === "competitor_cut") {
    if (choiceId === "ignore") market.competitors += 1;
    if (choiceId === "match") item.price = Math.max(1, Math.round(item.price * 0.92 / 10) * 10);
    if (choiceId === "card") item.card.trust = clamp(item.card.trust + 0.12, 0, 1);
  }
  if (event.id === "negative_review") {
    if (choiceId === "refund") {
      item.card.rating = clamp(item.card.rating + 0.08, 1, 5);
      state.rating = clamp(state.rating + 0.015, 1, 5);
    }
    if (choiceId === "reply") item.card.trust = clamp(item.card.trust + randomBetween(-0.04, 0.06), 0, 1);
    if (choiceId === "ignore") {
      item.card.rating = clamp(item.card.rating - 0.12, 1, 5);
      state.rating = clamp(state.rating - 0.025, 1, 5);
    }
  }
  if (event.id === "supplier_deal" && choiceId === "pay") {
    state.suppliers[product.id].cheap.relation = clamp(state.suppliers[product.id].cheap.relation + 0.22, 0, 1);
  }
  if (event.id === "blogger" && choiceId === "buy") {
    market.demand = clamp(market.demand + randomBetween(0.8, 2.4), 1, 12);
    market.trend = "growing";
  }

  state.events.unshift(`Событие «${event.title}»: выбран вариант «${choice.title}».`);
  state.pendingEvent = null;
  saveState();
  closeModal();
  notify("Решение применено");
  render();
}

function resetGame() {
  const confirmed = window.confirm("Удалить весь прогресс и начать заново?");
  if (!confirmed) return;
  state = defaultState();
  saveState();
  activeTab = "home";
  vibrate("heavy");
  notify("Новая игра началась");
  render();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
});

modalClose.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", event => {
  if (event.target === modalBackdrop) closeModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

installWheelScrollFallback();
render();
