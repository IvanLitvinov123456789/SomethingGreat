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

const defaultState = () => ({
  day: 1,
  balance: 50000,
  rating: 4.5,
  totalRevenue: 0,
  totalProfit: 0,
  totalOrders: 0,
  inventory: {},
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
    return { ...defaultState(), ...parsed, inventory: parsed.inventory || {} };
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
  return price - product.cost - price * COMMISSION_RATE - DELIVERY_COST;
}

function ownedProducts() {
  return PRODUCTS.filter(product => state.inventory[product.id]);
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

  view.innerHTML = `
    <section class="hero">
      <div class="hero-label">Баланс магазина</div>
      <div class="hero-balance">${money(state.balance)}</div>
      <div class="hero-row">
        <span class="hero-pill">⭐ ${state.rating.toFixed(2)}</span>
        <span class="hero-pill">📦 ${stockUnits} шт.</span>
        <span class="hero-pill">📣 ${activeAds} реклам.</span>
      </div>
      <button id="next-day" class="primary-btn" type="button" ${stockUnits === 0 ? "disabled" : ""}>Завершить день и получить продажи</button>
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
        <div class="section-heading"><h2>Отчёт за день ${report.day}</h2><span class="section-note">Продано ${report.sold} шт.</span></div>
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
      <p style="color:var(--muted);margin-bottom:0">Слишком высокая цена уменьшает продажи. Реклама стоит ${money(DAILY_AD_COST)} за каждый игровой день.</p>
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
              <div><strong>Продвижение</strong><div class="product-category">+примерно 70% показов, ${money(DAILY_AD_COST)}/день</div></div>
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
  const level = Math.max(1, Math.floor(state.totalOrders / 50) + 1);
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

    const priceFactor = clamp(product.marketPrice / item.price, 0.28, 1.65);
    const ratingFactor = clamp(state.rating / 4.5, 0.65, 1.15);
    const competitionFactor = clamp(1.22 - product.competition * 0.055, 0.55, 1.05);
    const adFactor = item.adActive ? 1.7 : 1;
    const noise = randomBetween(0.72, 1.28);
    const demandBase = product.demand * 1.45;
    let sold = Math.round(demandBase * priceFactor * ratingFactor * competitionFactor * adFactor * noise);
    sold = clamp(sold, 0, item.qty);

    const returns = estimateReturns(sold, product.returnRate);
    const netSold = sold - returns;
    const itemRevenue = sold * item.price;
    const itemRefunds = returns * item.price;
    const itemCommission = netSold * item.price * COMMISSION_RATE;
    const itemLogistics = sold * DELIVERY_COST + returns * RETURN_LOGISTICS_COST;
    const itemAds = item.adActive ? DAILY_AD_COST : 0;

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
    const ratingDelta = returnShare > 0.12 ? -0.05 : returnShare > 0.07 ? -0.02 : 0.01;
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
    profit
  };

  state.day += 1;
  const summary = profit >= 0
    ? `День завершён: прибыль ${money(profit)}, продано ${soldTotal} шт.`
    : `День завершён с убытком ${money(Math.abs(profit))}. Проверьте цену и рекламу.`;
  state.events = [summary, ...productEvents, ...state.events].slice(0, 20);

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
