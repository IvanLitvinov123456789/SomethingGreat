"use strict";

const STORAGE_KEY = "market_boss_mvp_v1";
const COMMISSION_RATE = 0.15;
const DELIVERY_COST = 90;
const RETURN_LOGISTICS_COST = 70;
const DAILY_AD_COST = 500;

const PRODUCTS = [
  { id: "case", emoji: "📱", name: "Чехол для телефона", category: "Аксессуары", cost: 170, marketPrice: 590, demand: 9, competition: 8, returnRate: 0.04 },
  { id: "lamp", emoji: "💡", name: "Настольная лампа", category: "Дом", cost: 780, marketPrice: 1690, demand: 6, competition: 5, returnRate: 0.07 },
  { id: "bottle", emoji: "🥤", name: "Спортивная бутылка", category: "Спорт", cost: 310, marketPrice: 890, demand: 7, competition: 6, returnRate: 0.05 },
  { id: "headphones", emoji: "🎧", name: "Bluetooth-наушники", category: "Электроника", cost: 950, marketPrice: 2290, demand: 8, competition: 9, returnRate: 0.11 },
  { id: "organizer", emoji: "🧺", name: "Органайзер для дома", category: "Дом", cost: 420, marketPrice: 1190, demand: 6, competition: 4, returnRate: 0.03 },
  { id: "toy", emoji: "🧸", name: "Мягкая игрушка", category: "Детям", cost: 520, marketPrice: 1390, demand: 7, competition: 6, returnRate: 0.06 },
  { id: "mouse", emoji: "🖱️", name: "Беспроводная мышь", category: "Электроника", cost: 620, marketPrice: 1590, demand: 7, competition: 8, returnRate: 0.08 },
  { id: "notebook", emoji: "📓", name: "Планер на год", category: "Канцелярия", cost: 240, marketPrice: 790, demand: 5, competition: 5, returnRate: 0.02 }
];

const MAX_UPGRADE_LEVEL = 5;

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
  day: 1,
  balance: 50000,
  rating: 4.5,
  totalRevenue: 0,
  totalProfit: 0,
  totalOrders: 0,
  inventory: {},
  upgrades: {},
  claimedGoals: [],
  marketEventId: "steady",
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
    return {
      ...defaultState(),
      ...parsed,
      inventory: parsed.inventory || {},
      upgrades: parsed.upgrades || {},
      claimedGoals: parsed.claimedGoals || [],
      marketEventId: parsed.marketEventId || "steady"
    };
  } catch (error) {
    console.warn("Не удалось загрузить сохранение", error);
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function money(value) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(value)) + " ₽";
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
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

function productById(id) {
  return PRODUCTS.find(product => product.id === id);
}

function inventoryValue() {
  return Object.entries(state.inventory).reduce((sum, [id, item]) => {
    const product = productById(id);
    return sum + (product ? product.cost * item.qty : 0);
  }, 0);
}

function grossMargin(product, price) {
  return price - product.cost - price * COMMISSION_RATE - effectiveDeliveryCost();
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
  return Math.round(Math.max(45, DELIVERY_COST - discount) * (event.logisticsMultiplier || 1));
}

function effectiveReturnLogisticsCost() {
  const event = currentMarketEvent();
  const discount = upgradeLevel("logistics") * 5;
  return Math.round(Math.max(35, RETURN_LOGISTICS_COST - discount) * (event.logisticsMultiplier || 1));
}

function effectiveReturnRate(product) {
  const event = currentMarketEvent();
  const serviceReduction = 1 - upgradeLevel("logistics") * 0.035 - upgradeLevel("brand") * 0.015;
  return clamp(product.returnRate * (event.returnMultiplier || 1) * serviceReduction, 0.005, 0.24);
}

function productDemandMultiplier(product) {
  const event = currentMarketEvent();
  const categoryBoost = event.categoryBoosts?.[product.category] || 1;
  const brandBoost = 1 + upgradeLevel("brand") * 0.025;
  const analyticsBoost = 1 + upgradeLevel("analytics") * 0.035;
  return (event.demandMultiplier || 1) * categoryBoost * brandBoost * analyticsBoost;
}

function competitionFactor(product) {
  const analyticsRelief = upgradeLevel("analytics") * 0.35;
  return clamp(1.22 - (product.competition - analyticsRelief) * 0.055, 0.55, 1.12);
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
  headerDay.textContent = state.day;
  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.tab === activeTab);
  });

  const titles = { home: "Главная", market: "Рынок", stock: "Мои товары", profile: "Статистика" };
  pageTitle.textContent = titles[activeTab];

  if (activeTab === "home") renderHome();
  if (activeTab === "market") renderMarket();
  if (activeTab === "stock") renderStock();
  if (activeTab === "profile") renderProfile();
}

function renderHome() {
  const report = state.lastReport;
  const stockUnits = Object.values(state.inventory).reduce((sum, item) => sum + item.qty, 0);
  const activeAds = Object.values(state.inventory).filter(item => item.adActive).length;
  const marketEvent = currentMarketEvent();

  view.innerHTML = `
    <section class="hero">
      <div class="hero-label">Баланс магазина</div>
      <div class="hero-balance">${money(state.balance)}</div>
      <div class="hero-row">
        <span class="hero-pill">⭐ ${state.rating.toFixed(2)}</span>
        <span class="hero-pill">📦 ${stockUnits} шт.</span>
        <span class="hero-pill">📣 ${activeAds} реклам.</span>
      </div>
      <button id="next-day" class="primary-btn" type="button" ${stockUnits === 0 ? "disabled" : ""}>Завершить день</button>
    </section>

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

    ${renderGoalsSection()}

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
          <div class="report-row"><span>Выручка</span><strong>${money(report.revenue)}</strong></div>
          <div class="report-row"><span>Возвраты</span><strong>−${money(report.refunds)}</strong></div>
          <div class="report-row"><span>Комиссия</span><strong>−${money(report.commission)}</strong></div>
          <div class="report-row"><span>Логистика</span><strong>−${money(report.logistics)}</strong></div>
          <div class="report-row"><span>Реклама</span><strong>−${money(report.ads)}</strong></div>
          <div class="report-row total"><span>Прибыль дня</span><strong class="${report.profit >= 0 ? "positive" : "negative"}">${money(report.profit)}</strong></div>
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
      <p style="color:var(--muted);margin-bottom:0">Закупайте товары, выставляйте цену и проверяйте прибыльность. Деньги списываются сразу.</p>
    </section>
    <div class="catalog-grid">
      ${PRODUCTS.map(product => {
        const current = state.inventory[product.id];
        const margin = grossMargin(product, product.marketPrice);
        return `
          <article class="card">
            <div class="card-top">
              <div class="product-main">
                <div class="product-emoji">${product.emoji}</div>
                <div style="min-width:0"><h3 class="product-title">${escapeHtml(product.name)}</h3><div class="product-category">${escapeHtml(product.category)}</div></div>
              </div>
              <div class="price">${money(product.cost)}</div>
            </div>
            <div class="tags">
              <span class="tag">Рынок: ${money(product.marketPrice)}</span>
              <span class="tag ${margin > 250 ? "good" : ""}">Маржа ≈ ${money(margin)}</span>
              <span class="tag">Спрос ${product.demand}/10</span>
              <span class="tag ${product.returnRate >= .09 ? "bad" : ""}">Возвраты ${Math.round(product.returnRate * 100)}%</span>
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
      const margin = grossMargin(product, item.price);
      const stockPercent = clamp(item.qty / 50 * 100, 0, 100);
      return `
        <article class="card">
          <div class="card-top">
            <div class="product-main">
              <div class="product-emoji">${product.emoji}</div>
              <div style="min-width:0"><h3 class="product-title">${escapeHtml(product.name)}</h3><div class="product-category">Продано за всё время: ${item.lifetimeSold || 0}</div></div>
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
              <span class="tag">Средняя цена: ${money(product.marketPrice)}</span>
              <span class="tag ${margin >= 0 ? "good" : "bad"}">Маржа: ${money(margin)}</span>
            </div>
            <div class="toggle-row">
              <div><strong>Продвижение</strong><div class="product-category">+показы зависят от маркетинга, ${money(effectiveAdCost())}/день</div></div>
              <label class="switch">
                <input class="ad-toggle" data-id="${product.id}" type="checkbox" ${item.adActive ? "checked" : ""} />
                <span class="slider"></span>
              </label>
            </div>
            <button class="secondary-btn restock-btn" data-id="${product.id}" type="button">Докупить товар</button>
          </div>
        </article>
      `;
    }).join("")}
  `;

  document.querySelectorAll(".save-price").forEach(button => button.addEventListener("click", () => updatePrice(button.dataset.id)));
  document.querySelectorAll(".ad-toggle").forEach(toggle => toggle.addEventListener("change", () => toggleAd(toggle.dataset.id, toggle.checked)));
  document.querySelectorAll(".restock-btn").forEach(button => button.addEventListener("click", () => openPurchase(button.dataset.id)));
}

function renderProfile() {
  const user = tg?.initDataUnsafe?.user;
  const name = user?.first_name || "Продавец";
  const firstLetter = name.trim().charAt(0).toUpperCase() || "И";
  const assets = state.balance + inventoryValue();
  const roi = state.totalRevenue > 0 ? (state.totalProfit / state.totalRevenue) * 100 : 0;
  const level = sellerLevel();
  const levelProgress = (state.totalOrders % 50) / 50 * 100;

  view.innerHTML = `
    <article class="card">
      <div class="profile-name">
        <div class="avatar">${escapeHtml(firstLetter)}</div>
        <div><h2 style="margin-bottom:3px">${escapeHtml(name)}</h2><div class="product-category">Владелец магазина · уровень ${level}</div></div>
      </div>
      <div style="margin-top:16px" class="progress"><div style="width:${levelProgress}%"></div></div>
      <div class="section-note" style="margin-top:7px">До следующего уровня: ${50 - state.totalOrders % 50} продаж</div>
    </article>

    <section class="section">
      <div class="metrics-grid">
        <article class="metric-card"><div class="metric-label">Активы</div><div class="metric-value">${money(assets)}</div></article>
        <article class="metric-card"><div class="metric-label">ROI</div><div class="metric-value ${roi >= 0 ? "positive" : "negative"}">${roi.toFixed(1)}%</div></article>
        <article class="metric-card"><div class="metric-label">Рейтинг</div><div class="metric-value">${state.rating.toFixed(2)}</div></article>
        <article class="metric-card"><div class="metric-label">Игровых дней</div><div class="metric-value">${state.day - 1}</div></article>
      </div>
    </section>

    ${renderUpgradesSection()}

    <section class="section">
      <article class="card report-list">
        <div class="report-row"><span>Денег на балансе</span><strong>${money(state.balance)}</strong></div>
        <div class="report-row"><span>Стоимость остатков</span><strong>${money(inventoryValue())}</strong></div>
        <div class="report-row"><span>Продано товаров</span><strong>${state.totalOrders}</strong></div>
        <div class="report-row"><span>Чистая прибыль</span><strong class="${state.totalProfit >= 0 ? "positive" : "negative"}">${money(state.totalProfit)}</strong></div>
      </article>
    </section>

    <section class="section">
      <button id="reset-game" class="danger-btn" type="button">Начать игру заново</button>
    </section>
  `;

  document.getElementById("reset-game").addEventListener("click", resetGame);
  document.querySelectorAll(".buy-upgrade").forEach(button => button.addEventListener("click", () => buyUpgrade(button.dataset.id)));
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

function switchTab(tab) {
  activeTab = tab;
  vibrate("light");
  window.scrollTo({ top: 0, behavior: "smooth" });
  render();
}

function openPurchase(productId) {
  purchaseProductId = productId;
  const product = productById(productId);
  if (!product) return;

  modalContent.innerHTML = `
    <div class="modal-product">
      <div class="product-emoji">${product.emoji}</div>
      <div><h2 id="modal-title" style="margin-bottom:3px">${escapeHtml(product.name)}</h2><div class="product-category">Закупка у поставщика</div></div>
    </div>
    <div class="field"><label for="purchase-qty">Количество</label></div>
    <div class="qty-picker">
      <button id="qty-minus" type="button">−</button>
      <input id="purchase-qty" type="number" min="1" max="999" value="10" inputmode="numeric" />
      <button id="qty-plus" type="button">+</button>
    </div>
    <div class="cost-box">
      <div class="report-row"><span>Цена за штуку</span><strong>${money(product.cost)}</strong></div>
      <div class="report-row total"><span>Сумма закупки</span><strong id="purchase-total">${money(product.cost * 10)}</strong></div>
    </div>
    <button id="confirm-purchase" class="primary-btn" type="button">Купить партию</button>
  `;

  modalBackdrop.classList.remove("hidden");
  modalBackdrop.setAttribute("aria-hidden", "false");

  const qtyInput = document.getElementById("purchase-qty");
  const total = document.getElementById("purchase-total");
  const confirm = document.getElementById("confirm-purchase");

  const refreshTotal = () => {
    const qty = clamp(Number.parseInt(qtyInput.value, 10) || 1, 1, 999);
    qtyInput.value = qty;
    const cost = qty * product.cost;
    total.textContent = money(cost);
    confirm.disabled = cost > state.balance;
    confirm.textContent = cost > state.balance ? "Недостаточно денег" : "Купить партию";
  };

  qtyInput.addEventListener("input", refreshTotal);
  document.getElementById("qty-minus").addEventListener("click", () => { qtyInput.value = Math.max(1, Number(qtyInput.value || 1) - 1); refreshTotal(); });
  document.getElementById("qty-plus").addEventListener("click", () => { qtyInput.value = Math.min(999, Number(qtyInput.value || 1) + 1); refreshTotal(); });
  confirm.addEventListener("click", () => buyProduct(productId, Number.parseInt(qtyInput.value, 10)));
  refreshTotal();
}

function closeModal() {
  modalBackdrop.classList.add("hidden");
  modalBackdrop.setAttribute("aria-hidden", "true");
  purchaseProductId = null;
}

function buyProduct(productId, quantity) {
  const product = productById(productId);
  const qty = clamp(Number.parseInt(quantity, 10) || 1, 1, 999);
  const cost = product.cost * qty;
  if (cost > state.balance) {
    notify("Недостаточно денег для этой закупки");
    return;
  }

  state.balance -= cost;
  if (!state.inventory[productId]) {
    state.inventory[productId] = { qty: 0, price: product.marketPrice, adActive: false, lifetimeSold: 0 };
  }
  state.inventory[productId].qty += qty;
  state.events.unshift(`Закуплено ${qty} шт. товара «${product.name}» за ${money(cost)}.`);
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
  state.inventory[productId].price = price;
  saveState();
  vibrate("light");
  notify("Цена сохранена");
  renderStock();
}

function toggleAd(productId, enabled) {
  state.inventory[productId].adActive = enabled;
  saveState();
  vibrate("light");
  notify(enabled ? "Реклама включена" : "Реклама выключена");
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
  renderProfile();
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
  const products = ownedProducts();
  if (products.length === 0) {
    notify("Сначала закупите товар");
    return;
  }

  const marketEvent = currentMarketEvent();
  const deliveryCost = effectiveDeliveryCost();
  const returnLogisticsCost = effectiveReturnLogisticsCost();
  const adCost = effectiveAdCost();
  const marketingBoost = 1 + upgradeLevel("marketing") * 0.1;
  const priceSensitivity = marketEvent.priceSensitivity || 1;
  let revenue = 0;
  let refunds = 0;
  let commission = 0;
  let logistics = 0;
  let ads = 0;
  let soldTotal = 0;
  let returnsTotal = 0;
  const productEvents = [];

  for (const product of products) {
    const item = state.inventory[product.id];
    if (!item || item.qty <= 0) continue;

    const priceFactor = clamp(Math.pow(product.marketPrice / item.price, priceSensitivity), 0.28, 1.8);
    const ratingFactor = clamp(state.rating / 4.5, 0.65, 1.15);
    const adFactor = item.adActive ? 1.7 * marketingBoost : 1;
    const noise = randomBetween(0.72, 1.28);
    const demandBase = product.demand * 1.45;
    let sold = Math.round(
      demandBase *
      productDemandMultiplier(product) *
      priceFactor *
      ratingFactor *
      competitionFactor(product) *
      adFactor *
      noise
    );
    sold = clamp(sold, 0, item.qty);

    const returns = estimateReturns(sold, effectiveReturnRate(product));
    const netSold = sold - returns;
    const itemRevenue = sold * item.price;
    const itemRefunds = returns * item.price;
    const itemCommission = netSold * item.price * COMMISSION_RATE;
    const itemLogistics = sold * deliveryCost + returns * returnLogisticsCost;
    const itemAds = item.adActive ? adCost : 0;

    item.qty -= sold;
    item.qty += returns;
    item.lifetimeSold = (item.lifetimeSold || 0) + netSold;

    revenue += itemRevenue;
    refunds += itemRefunds;
    commission += itemCommission;
    logistics += itemLogistics;
    ads += itemAds;
    soldTotal += netSold;
    returnsTotal += returns;

    if (netSold > 0) productEvents.push(`${product.emoji} ${product.name}: ${netSold} продаж${returns ? `, возвратов ${returns}` : ""}.`);
    if (item.qty === 0) productEvents.push(`⚠️ «${product.name}» закончился на складе.`);
  }

  const profit = revenue - refunds - commission - logistics - ads;
  state.balance += profit;
  state.totalRevenue += revenue - refunds;
  state.totalProfit += profit;
  state.totalOrders += soldTotal;

  if (soldTotal > 0) {
    const returnShare = returnsTotal / Math.max(soldTotal + returnsTotal, 1);
    const serviceBonus = upgradeLevel("brand") * 0.003 + upgradeLevel("logistics") * 0.003;
    const ratingDelta = (returnShare > 0.12 ? -0.05 : returnShare > 0.07 ? -0.02 : 0.01) + serviceBonus;
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
    commission,
    logistics,
    ads,
    profit,
    event: marketEvent.title
  };

  state.day += 1;
  const nextEvent = pickNextMarketEvent(marketEvent.id);
  state.marketEventId = nextEvent.id;
  const summary = profit >= 0
    ? `День завершён: прибыль ${money(profit)}, продано ${soldTotal} шт.`
    : `День завершён с убытком ${money(Math.abs(profit))}. Проверьте цену и рекламу.`;
  const tomorrowEvent = `Завтра: ${nextEvent.title}. ${nextEvent.text}`;
  state.events = [summary, tomorrowEvent, ...productEvents, ...state.events].slice(0, 20);

  saveState();
  vibrate(profit >= 0 ? "medium" : "heavy");
  notify(summary);
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

render();
