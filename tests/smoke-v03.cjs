const { spawn } = require("child_process");
const { pathToFileURL } = require("url");
const path = require("path");

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
].filter(Boolean);

const chromePath = chromeCandidates[0];
const root = path.resolve(__dirname, "..");
const pageUrl = pathToFileURL(path.join(root, "index.html")).href;
const userDataDir = path.join(root, "..", "..", "..", "chrome-smoke-v02");
const port = 9345;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function main() {
  const chrome = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--disable-extensions",
    "--allow-file-access-from-files",
    `--remote-debugging-port=${port}`,
    "--window-size=390,844",
    `--user-data-dir=${userDataDir}`,
    pageUrl
  ], { stdio: "ignore" });

  try {
    let tabs;
    for (let i = 0; i < 40; i += 1) {
      try {
        tabs = await getJson(`http://127.0.0.1:${port}/json/list`);
        if (tabs.length) break;
      } catch (_) {
        await sleep(200);
      }
    }

    const tab = tabs?.find(item => item.url === pageUrl) || tabs?.[0];
    if (!tab?.webSocketDebuggerUrl) throw new Error("Chrome tab was not available");
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    const pending = new Map();
    let nextId = 1;

    ws.addEventListener("message", event => {
      const payload = JSON.parse(event.data);
      if (payload.id && pending.has(payload.id)) {
        const { resolve, reject } = pending.get(payload.id);
        pending.delete(payload.id);
        if (payload.error) reject(new Error(payload.error.message));
        else resolve(payload.result);
      }
    });

    await new Promise((resolve, reject) => {
      ws.addEventListener("open", resolve, { once: true });
      ws.addEventListener("error", reject, { once: true });
    });

    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

    await send("Runtime.enable");
    await sleep(800);
    const result = await send("Runtime.evaluate", {
      awaitPromise: true,
      returnByValue: true,
      expression: `(
        async () => {
          window.scrollTo(0, 0);
          document.body.dispatchEvent(new WheelEvent("wheel", { deltaY: 620, bubbles: true, cancelable: true }));
          await new Promise(resolve => setTimeout(resolve, 80));
          const product = PRODUCTS[0];
          const highPrice = currentMarket(product).price * 1.9;
          const zeroChance = priceDemandChance(product, highPrice);

          state = defaultState();
          state.rngSeed = 42;
          state.inventory[product.id] = normalizeInventoryItem(product, { qty: 20, price: highPrice, adStrategy: "aggressive" });
          state.market[product.id].price = product.marketPrice;
          state.market[product.id].demand = 10;
          saveState();
          render();
          simulateDay();

          const soldAtHighPrice = state.lastReport.sold;
          const balanceAfterSales = state.balance;

          state = defaultState();
          state.rngSeed = 42;
          const oldSave = { day: 3, balance: 12345, inventory: { [product.id]: { qty: 5, price: product.marketPrice } } };
          const migrated = migrateState(oldSave);
          const migrationOk = Boolean(migrated.saveVersion === SAVE_VERSION && migrated.market[product.id] && migrated.inventory[product.id].card);

          state = defaultState();
          state.inventory[product.id] = normalizeInventoryItem(product, { qty: 0, price: product.marketPrice });
          const noStockForecast = salesForecast(product).max;
          state.balance = 999999;
          hireStaff("analyst");
          toggleAutomation("autoPrice");
          const staffWorks = Boolean(state.staff.analyst && state.automations.autoPrice && actionLimit() > ECONOMY.baseActionLimit);
          activeTab = "home";
          render();

          return {
            title: document.title,
            wheelScrollY: Math.round(window.scrollY),
            zeroChance,
            soldAtHighPrice,
            balanceAfterSales,
            migrationOk,
            noStockForecast,
            hasFocusCards: document.querySelectorAll(".focus-card").length,
            navItems: document.querySelectorAll(".nav-item").length,
            staffWorks,
            hasSupplierState: Boolean(state.suppliers[product.id].cheap),
            docScrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth
          };
        }
      )()`
    });

    const value = result.result.value;
    const checks = [
      ["title", value.title.includes("Marketplace Empire")],
      ["wheel", value.wheelScrollY > 0],
      ["zero demand", value.zeroChance === 0 && value.soldAtHighPrice === 0],
      ["migration", value.migrationOk],
      ["no stock", value.noStockForecast === 0],
      ["focus UI", value.hasFocusCards >= 4],
      ["new nav", value.navItems >= 8],
      ["staff automation", value.staffWorks],
      ["supplier state", value.hasSupplierState]
    ];
    const failed = checks.filter(([, ok]) => !ok);
    console.log(JSON.stringify({ value, failed: failed.map(([name]) => name) }, null, 2));
    if (failed.length) process.exitCode = 1;
    ws.close();
  } finally {
    chrome.kill();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
