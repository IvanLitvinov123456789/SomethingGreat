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
const userDataDir = path.join(root, "..", "..", "..", "chrome-smoke-v04");
const port = 9346;

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
          localStorage.clear();
          state = defaultState();
          activeTab = "home";
          render();

          const setupVisible = Boolean(document.querySelector("#store-name"));
          document.querySelector("#store-name").value = "TestFox";
          document.querySelector("#start-campaign").click();
          await new Promise(resolve => setTimeout(resolve, 80));
          const storeNameOk = state.city.onboardingDone && storeName() === "TestFox" && document.body.textContent.includes("TestFox");

          window.scrollTo(0, 0);
          document.body.dispatchEvent(new WheelEvent("wheel", { deltaY: 620, bubbles: true, cancelable: true }));
          await new Promise(resolve => setTimeout(resolve, 80));

          const product = PRODUCTS[0];
          const highPrice = currentMarket(product).price * 1.9;
          const zeroChance = priceDemandChance(product, highPrice);

          state = defaultState();
          state.city.storeName = "TestFox";
          state.city.onboardingDone = true;
          state.rngSeed = 42;
          state.inventory[product.id] = normalizeInventoryItem(product, { qty: 20, price: highPrice, adStrategy: "aggressive" });
          state.market[product.id].price = product.marketPrice;
          state.market[product.id].demand = 10;
          saveState();
          render();
          simulateDay();
          const soldAtHighPrice = state.lastReport.sold;

          state = defaultState();
          state.city.storeName = "TestFox";
          state.city.onboardingDone = true;
          state.balance = 999999;
          state.actionsUsed = 0;
          activeTab = "home";
          render();
          const pointsPerDistrictOk = Object.values(state.districts).every(district => district.pickupPoints.length >= 5 && district.pickupPoints.length <= 10);
          selectDistrict("south");
          await new Promise(resolve => setTimeout(resolve, 80));
          const districtMapOk = document.querySelectorAll(".district-point").length >= 5;
          const freePoint = freePickupPoints("south")[0];
          const beforePvz = playerPickupPoints("south").length;
          openPickupPoint(freePoint.id);
          const openedPointOk = playerPickupPoints("south").length === beforePvz + 1;
          const firstPoint = playerPickupPoints("south")[0];
          const oldLevel = firstPoint.level;
          upgradePickupPoint(firstPoint.id);
          const upgradeOk = firstPoint.level === oldLevel + 1;

          const beforeShare = state.districts.south.shares.player;
          launchLocalAd("south", "push");
          const shareAfterAdClick = state.districts.south.shares.player;
          state.inventory[product.id] = normalizeInventoryItem(product, { qty: 30, price: product.marketPrice });
          state.rngSeed = 7;
          simulateDay();
          const afterShare = state.districts.south.shares.player;
          const smoothShareOk = shareAfterAdClick === beforeShare && afterShare > beforeShare && afterShare < 70;

          state.districts.south.shares.player = 58;
          for (const point of playerPickupPoints("south")) {
            point.rating = 4.55;
            point.load = 0.42;
          }
          state.districts.south.controlledDays = 1;
          updateDistrictStatus("south");
          const controlOk = state.districts.south.controlled;
          const neighborOk = districtAccessState("university") === "available";
          const bonusActiveBeforeLoss = activeBonusDistrictIds().includes("south");
          state.districts.south.shares.player = 38;
          updateDistrictStatus("south");
          const lossOk = !state.districts.south.controlled && !activeBonusDistrictIds().includes("south") && bonusActiveBeforeLoss;

          state.districts.south.shares.player = 45;
          const lowCashBefore = state.cityCompetitors.lowprice.cash;
          state.rngSeed = 11;
          runCompetitorCityActions();
          const competitorSpendOk = state.cityCompetitors.lowprice.cash < lowCashBefore || state.cityCompetitors.premiumbox.cash < CITY.COMPETITORS.find(c => c.id === "premiumbox").cash || state.cityCompetitors.fastgo.cash < CITY.COMPETITORS.find(c => c.id === "fastgo").cash;

          const oldSave = { day: 3, balance: 12345, inventory: { [product.id]: { qty: 5, price: product.marketPrice } } };
          const migrated = migrateState(oldSave);
          const migrationOk = Boolean(migrated.saveVersion === SAVE_VERSION && migrated.city.storeName === "MarketFox" && migrated.city.onboardingDone && migrated.districts.south.pickupPoints.length >= 5);

          state = defaultState();
          state.city.storeName = "TestFox";
          state.city.onboardingDone = true;
          state.inventory[product.id] = normalizeInventoryItem(product, { qty: 0, price: product.marketPrice });
          const noStockForecast = salesForecast(product).max;

          window.confirm = () => true;
          resetGame();
          const resetOk = !state.city.onboardingDone && Boolean(document.querySelector("#store-name"));

          return {
            title: document.title,
            setupVisible,
            storeNameOk,
            wheelScrollY: Math.round(window.scrollY),
            zeroChance,
            soldAtHighPrice,
            pointsPerDistrictOk,
            districtMapOk,
            openedPointOk,
            upgradeOk,
            smoothShareOk,
            controlOk,
            neighborOk,
            lossOk,
            competitorSpendOk,
            migrationOk,
            noStockForecast,
            navItems: document.querySelectorAll(".nav-item").length,
            resetOk,
            docScrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth
          };
        }
      )()`
    });

    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text || "Browser evaluation failed");
    }
    const value = result.result.value;
    const checks = [
      ["title", value.title.includes("Marketplace Empire")],
      ["setup", value.setupVisible],
      ["store name", value.storeNameOk],
      ["wheel", value.wheelScrollY > 0],
      ["zero demand", value.zeroChance === 0 && value.soldAtHighPrice === 0],
      ["point count", value.pointsPerDistrictOk],
      ["district map", value.districtMapOk],
      ["open point", value.openedPointOk],
      ["upgrade point", value.upgradeOk],
      ["smooth share", value.smoothShareOk],
      ["control", value.controlOk],
      ["neighbor unlock", value.neighborOk],
      ["loss", value.lossOk],
      ["competitor spend", value.competitorSpendOk],
      ["migration", value.migrationOk],
      ["no stock", value.noStockForecast === 0],
      ["new nav", value.navItems >= 9],
      ["reset", value.resetOk],
      ["mobile width", value.docScrollWidth <= value.innerWidth + 2]
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
