"use strict";

window.ME_CITY = (() => {
  const CONFIG = {
    shareInertia: 0.18,
    loyaltyInertia: 0.08,
    contestedShare: 25,
    leaderShare: 50,
    controlShare: 50,
    controlHoldDays: 2,
    dominanceShare: 70,
    dominanceHoldDays: 4,
    lossWarningShare: 45,
    lossShare: 40,
    minControlRating: 4.0,
    maxControlLoad: 0.92,
    expansionBaseCost: 9000,
    pickupOpenBaseCost: 7200,
    pickupUpgradeBaseCost: 5600,
    cityWarehouseCost: 42000,
    cityWarehouseCapacity: 170,
    cityWarehouseDailyCost: 850,
    smallWarehouseDailyCost: 360,
    districtAdStrategies: [
      { id: "small", title: "Листовки у ПВЗ", costFactor: 0.72, boost: 14, days: 1 },
      { id: "normal", title: "Локальная кампания", costFactor: 1, boost: 24, days: 1 },
      { id: "push", title: "Атака на район", costFactor: 1.55, boost: 34, days: 1 }
    ],
    brandColors: ["#6c5ce7", "#009b72", "#d66b2b", "#1b7bd8"]
  };

  const OWNERS = {
    player: { id: "player", name: "Ваш магазин", shortName: "Вы", color: "#6c5ce7" },
    lowprice: { id: "lowprice", name: "LowPrice", shortName: "LowPrice", color: "#f05b5b" },
    premiumbox: { id: "premiumbox", name: "PremiumBox", shortName: "PremiumBox", color: "#b06cff" },
    fastgo: { id: "fastgo", name: "FastGo", shortName: "FastGo", color: "#11a4d8" },
    other: { id: "other", name: "Остальные", shortName: "Остальные", color: "#9aa1ad" }
  };

  const COMPETITORS = [
    {
      id: "lowprice",
      title: "LowPrice",
      strategy: "Демпинг",
      cash: 92000,
      aggressiveness: 0.78,
      pricePressure: 1.18,
      service: 0.82,
      logistics: 0.86
    },
    {
      id: "premiumbox",
      title: "PremiumBox",
      strategy: "Премиум",
      cash: 116000,
      aggressiveness: 0.42,
      pricePressure: 0.82,
      service: 1.18,
      logistics: 0.96
    },
    {
      id: "fastgo",
      title: "FastGo",
      strategy: "Скорость",
      cash: 104000,
      aggressiveness: 0.58,
      pricePressure: 0.96,
      service: 1.04,
      logistics: 1.22
    }
  ];

  const DISTRICTS = [
    {
      id: "south",
      name: "Южный",
      shortName: "Южный",
      role: "Стартовый район",
      population: 42000,
      growth: 0.012,
      income: 0.92,
      averageCheck: 0.94,
      rentFactor: 0.9,
      transport: 0.86,
      priceSensitivity: 1.05,
      serviceSensitivity: 0.95,
      popularCategories: ["Дом", "Спорт", "Детям"],
      leaderLoyalty: 0.55,
      adCost: 950,
      competition: 0.72,
      bonusTitle: "База сети",
      bonusText: "Снижает базовую логистику и помогает удерживать первых постоянных клиентов.",
      neighbors: ["university", "industrial", "central"],
      map: { left: 14, top: 54, width: 30, height: 28 }
    },
    {
      id: "university",
      name: "Университетский",
      shortName: "Универ.",
      role: "Молодая аудитория",
      population: 36000,
      growth: 0.021,
      income: 0.82,
      averageCheck: 0.88,
      rentFactor: 0.82,
      transport: 0.94,
      priceSensitivity: 1.34,
      serviceSensitivity: 0.86,
      popularCategories: ["Электроника", "Одежда", "Тренд"],
      leaderLoyalty: 0.38,
      adCost: 760,
      competition: 0.66,
      bonusTitle: "Трендовая аудитория",
      bonusText: "Дешевле локальная реклама и выше спрос на электронику, одежду и тренды.",
      neighbors: ["south", "central"],
      map: { left: 13, top: 20, width: 32, height: 28 }
    },
    {
      id: "central",
      name: "Центральный",
      shortName: "Центр",
      role: "Большой трафик",
      population: 58000,
      growth: 0.009,
      income: 1.22,
      averageCheck: 1.28,
      rentFactor: 1.46,
      transport: 1.12,
      priceSensitivity: 0.92,
      serviceSensitivity: 1.08,
      popularCategories: ["Электроника", "Дом", "Аксессуары"],
      leaderLoyalty: 0.62,
      adCost: 1450,
      competition: 0.96,
      bonusTitle: "Городская известность",
      bonusText: "Даёт общий прирост узнаваемости и чуть ускоряет захват соседних районов.",
      neighbors: ["south", "university", "industrial", "residential", "elite"],
      map: { left: 40, top: 34, width: 28, height: 30 }
    },
    {
      id: "industrial",
      name: "Промышленный",
      shortName: "Промзона",
      role: "Склады и логистика",
      population: 26000,
      growth: 0.006,
      income: 0.88,
      averageCheck: 0.9,
      rentFactor: 0.72,
      transport: 1.28,
      priceSensitivity: 1.04,
      serviceSensitivity: 0.9,
      popularCategories: ["Дом", "Канцелярия", "Спорт"],
      leaderLoyalty: 0.44,
      adCost: 880,
      competition: 0.58,
      bonusTitle: "Дешёвая логистика",
      bonusText: "Снижает стоимость доставки, хранения и будущего городского склада.",
      neighbors: ["south", "central", "residential"],
      map: { left: 45, top: 66, width: 33, height: 24 }
    },
    {
      id: "residential",
      name: "Спальный",
      shortName: "Спальный",
      role: "Стабильный поток",
      population: 73000,
      growth: 0.016,
      income: 0.98,
      averageCheck: 0.96,
      rentFactor: 1.02,
      transport: 0.9,
      priceSensitivity: 1.08,
      serviceSensitivity: 1.14,
      popularCategories: ["Дом", "Детям", "Аксессуары"],
      leaderLoyalty: 0.68,
      adCost: 1120,
      competition: 0.82,
      bonusTitle: "Постоянные клиенты",
      bonusText: "Даёт стабильный спрос и медленнее теряет долю при небольших ошибках.",
      neighbors: ["central", "industrial", "elite"],
      map: { left: 66, top: 42, width: 27, height: 27 }
    },
    {
      id: "elite",
      name: "Элитный",
      shortName: "Элитный",
      role: "Премиальный спрос",
      population: 24000,
      growth: 0.011,
      income: 1.62,
      averageCheck: 1.58,
      rentFactor: 1.72,
      transport: 1.02,
      priceSensitivity: 0.68,
      serviceSensitivity: 1.42,
      popularCategories: ["Электроника", "Одежда", "Дом"],
      leaderLoyalty: 0.74,
      adCost: 1720,
      competition: 0.88,
      bonusTitle: "Премиальная витрина",
      bonusText: "Повышает спрос на дорогие товары, но требует высокого рейтинга ПВЗ.",
      neighbors: ["central", "residential"],
      map: { left: 67, top: 12, width: 24, height: 25 }
    }
  ];

  const DISTRICT_BY_ID = Object.fromEntries(DISTRICTS.map(district => [district.id, district]));

  const pointLayouts = [
    { x: 18, y: 28, zone: "Жилая зона", traffic: 0.78, area: 34 },
    { x: 38, y: 42, zone: "Улица с трафиком", traffic: 1.05, area: 42 },
    { x: 62, y: 24, zone: "Торговая зона", traffic: 1.22, area: 48 },
    { x: 74, y: 58, zone: "Транспортный узел", traffic: 1.18, area: 45 },
    { x: 45, y: 72, zone: "Жилой массив", traffic: 0.92, area: 39 },
    { x: 24, y: 66, zone: "Свободное помещение", traffic: 0.86, area: 37 },
    { x: 84, y: 36, zone: "Малый ТЦ", traffic: 1.28, area: 52 }
  ];

  const startOwners = {
    south: ["player", "lowprice", null, "fastgo", "premiumbox", null, null],
    university: ["lowprice", null, "fastgo", null, "premiumbox", null, null],
    central: ["premiumbox", "lowprice", "fastgo", null, "premiumbox", null, null],
    industrial: ["fastgo", null, "lowprice", null, null, "fastgo", null],
    residential: ["lowprice", "fastgo", null, "premiumbox", null, null, null],
    elite: ["premiumbox", null, "fastgo", "premiumbox", null, null, null]
  };

  const startShares = {
    south: { player: 18, lowprice: 33, premiumbox: 18, fastgo: 23, other: 8 },
    university: { player: 0, lowprice: 36, premiumbox: 20, fastgo: 28, other: 16 },
    central: { player: 0, lowprice: 28, premiumbox: 33, fastgo: 25, other: 14 },
    industrial: { player: 0, lowprice: 23, premiumbox: 15, fastgo: 42, other: 20 },
    residential: { player: 0, lowprice: 31, premiumbox: 20, fastgo: 30, other: 19 },
    elite: { player: 0, lowprice: 14, premiumbox: 46, fastgo: 25, other: 15 }
  };

  function createPickupPoints(districtId) {
    const district = DISTRICT_BY_ID[districtId];
    const owners = startOwners[districtId] || [];
    return pointLayouts.map((layout, index) => {
      const owner = owners[index] ?? null;
      const level = owner ? (owner === "premiumbox" ? 2 : 1) : 0;
      const ratingBase = owner === "premiumbox" ? 4.72 : owner === "fastgo" ? 4.42 : owner === "lowprice" ? 4.02 : owner === "player" ? 4.35 : 0;
      const traffic = Math.round((layout.traffic * district.transport) * 100) / 100;
      return {
        id: `${districtId}-pvz-${index + 1}`,
        districtId,
        name: owner ? `${owner === "player" ? "Первый ПВЗ" : OWNERS[owner].shortName} ${index + 1}` : `Помещение ${index + 1}`,
        owner,
        level,
        x: layout.x,
        y: layout.y,
        zone: layout.zone,
        traffic,
        area: layout.area,
        rent: Math.round((720 + layout.area * 22 + traffic * 210) * district.rentFactor / 10) * 10,
        capacity: owner ? 42 + level * 24 : 0,
        load: owner ? (owner === "player" ? 0.36 : 0.48 + index * 0.035) : 0,
        staff: owner ? Math.max(1, level) : 0,
        serviceSpeed: owner ? Math.round((0.78 + level * 0.12 + (owner === "fastgo" ? 0.14 : 0)) * 100) / 100 : 0,
        rating: ratingBase,
        condition: owner ? 0.82 + level * 0.04 : 0.68 + index * 0.025,
        awareness: owner === "player" ? 0.22 : owner ? 0.42 : 0,
        coverage: Math.round((10 + layout.traffic * 5 + level * 3) * 10) / 10,
        queue: owner ? Math.round((level === 1 ? 10 : 6) * traffic) : 0,
        income: 0,
        expenses: 0,
        problems: []
      };
    });
  }

  function initialDistrictState() {
    return Object.fromEntries(DISTRICTS.map(district => {
      const unlocked = district.id === "south";
      const shares = { ...startShares[district.id] };
      return [district.id, {
        id: district.id,
        unlocked,
        controlled: false,
        dominated: false,
        leaderDays: 0,
        controlledDays: 0,
        dominanceDays: 0,
        status: unlocked ? "presence" : "locked",
        shares,
        targetShares: { ...shares },
        loyalty: {
          player: district.id === "south" ? 12 : 0,
          lowprice: shares.lowprice * district.leaderLoyalty,
          premiumbox: shares.premiumbox * district.leaderLoyalty,
          fastgo: shares.fastgo * district.leaderLoyalty,
          other: shares.other
        },
        localAd: null,
        competitorCampaigns: {},
        pickupPoints: createPickupPoints(district.id),
        warehouses: district.id === "south" ? [{
          id: "warehouse-south-1",
          districtId: "south",
          type: "small",
          owner: "player",
          name: "Малый склад Южный",
          level: 1,
          capacity: 120,
          load: 0,
          staff: 1,
          dailyCost: CONFIG.smallWarehouseDailyCost,
          transport: district.transport,
          condition: 0.86
        }] : [],
        history: [{ day: 1, playerShare: shares.player, status: unlocked ? "presence" : "locked" }]
      }];
    }));
  }

  function initialCityState() {
    return {
      storeName: "",
      brandColor: CONFIG.brandColors[0],
      onboardingDone: false,
      mapMode: "city",
      selectedDistrictId: "south",
      builtCityWarehouse: false,
      pendingDistrictAdSpend: 0,
      tipsSeen: {},
      unlockedMechanics: {
        districtMap: true,
        competition: false,
        expansion: false,
        cityWarehouse: false,
        management: false
      }
    };
  }

  function initialCompetitorCompanies() {
    return Object.fromEntries(COMPETITORS.map(competitor => [competitor.id, {
      id: competitor.id,
      cash: competitor.cash,
      totalSpent: 0,
      pvzOpened: 0,
      strategy: competitor.strategy,
      aggressiveness: competitor.aggressiveness
    }]));
  }

  return {
    CONFIG,
    OWNERS,
    COMPETITORS,
    DISTRICTS,
    DISTRICT_BY_ID,
    initialCityState,
    initialDistrictState,
    initialCompetitorCompanies,
    createPickupPoints
  };
})();
