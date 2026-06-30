var CCAutomated = window.CCAutomated || {};
window.CCAutomated = CCAutomated;

if (typeof CCAutomated.stop === "function") CCAutomated.stop();

// Config
CCAutomated.ConfigPrefix = "ccAutomatedConfig";
CCAutomated.Config = {};
CCAutomated.ConfigData = {};
CCAutomated.ConfigDisplay = {};
if (!CCAutomated.ConfigBackup) CCAutomated.ConfigBackup = {};
CCAutomated.Intervals = {};
CCAutomated.IntervalMs = {
  autoClicker: 10,
  goldenCookieClicker: 400,
  wrinklerClicker: 400,
  grimoire: 400,
  garden: 5000,
  pantheon: 500,
  season: 500,
  autoBuyer: 1000,
};
CCAutomated.AutoBuyer = {
  target: null,
  lastRefresh: 0,
  lastCookiesPerSecond: 0,
  lastStoreSignature: "",
  refreshMs: 10000,
  cpsRefreshRatio: 0.05,
  luckyBankSeconds: 6000,
  luckyRewardCookiesPerSecond: 900,
  luckyRewardBankRatio: 0.15,
  comboPayoutTolerance: 0.995,
};
CCAutomated.Strategy = {
  strongBuffMultiplier: 10,
  hugeBuffMultiplier: 100,
  minStrategicUpgradeGainSeconds: 60,
  firstAscendPrestigeTarget: 365,
  repeatAscendPrestigeGainRatio: 0.1,
  minRepeatAscendPrestigeGain: 100,
  priorityPatterns: [
    { pattern: /kitten/i, multiplier: 0.35, label: "kitten" },
    {
      pattern:
        /lucky day|serendipity|get lucky|golden goose egg|green yeast digestives|arcane sugar|distilled essence of redoubled luck/i,
      multiplier: 0.45,
      label: "golden cookie",
    },
    { pattern: /synerg/i, multiplier: 0.55, label: "synergy" },
    {
      pattern: /egg|reindeer|santa|christmas|halloween|valentine|heart|bunny|easter|fool|business/i,
      multiplier: 0.65,
      label: "season",
    },
    { pattern: /cursor|mouse|click|finger/i, multiplier: 0.75, label: "clicking" },
    { pattern: /biscuit|butter biscuit|macaron|brand biscuit|cookie|fortune/i, multiplier: 0.85, label: "strategic" },
  ],
};
CCAutomated.AutoClicker = {
  clicksPerTick: 3,
};
CCAutomated.Wrinklers = {
  popIntervalMs: 2 * 60 * 60 * 1000,
  minSuckedToPop: 1,
  lastPop: Date.now(),
};
CCAutomated.Garden = {
  comboHarvestPlantNames: ["Bakeberry", "Queenbeet", "Duketater"],
  soilByGoal: {
    growing: "fertilizer",
    holding: "clay",
    mutation: "wood chips",
  },
  lastAction: "",
  lastActionAt: 0,
};
CCAutomated.Pantheon = {
  godzamokPattern: /godzamok/i,
  skruuiaPattern: /skruuia/i,
  godzamokBuffPattern: /devastation/i,
  clickBuffPattern: /click frenzy|dragonflight/i,
  maxSellPerBuilding: 100,
  maxSellTotal: 600,
  minKeep: 50,
  cooldownMs: 9000,
  lastAction: "",
  lastActionAt: 0,
  lowValueBuildingNames: ["Cursor", "Grandma", "Mine", "Factory", "Shipment", "Alchemy lab"],
};
CCAutomated.Season = {
  upgradePattern: /santa|festive|christmas|reindeer|egg|bunny|easter|halloween|valentine|heart|fool|business/i,
  santaPattern: /santa|festive/i,
  lastAction: "",
  lastActionAt: 0,
  lastUpgradeName: "",
};

CCAutomated.ConfigDefault = {
  AutoClicker: 0,
  GoldenCookies: 0,
  Wrinklers: 0,
  Grimoire: 0,
  Garden: 0,
  Pantheon: 0,
  Season: 0,
  AutoBuyer: 0,
  AutoBuyerReserve: 0,
};

CCAutomated.ConfigData.AutoClicker = {
  name: "Big Cookie",
  label: ["OFF", "ON"],
  description: "auto-click the main cookie",
};
CCAutomated.ConfigData.GoldenCookies = {
  name: "Golden Cookies",
  label: ["OFF", "ON"],
  description: "auto-click golden cookies and ticker fortune effects",
};
CCAutomated.ConfigData.Wrinklers = {
  name: "Wrinklers",
  label: ["OFF", "ON"],
  description: "pop wrinklers on a timed strategy",
};
CCAutomated.ConfigData.Grimoire = {
  name: "Grimoire",
  label: ["OFF", "ON"],
  description: "cast wizard tower spells during combo windows",
};
CCAutomated.ConfigData.Garden = {
  name: "Garden",
  label: ["OFF", "Harvest", "Manage"],
  description: "harvest combo plants, freeze safely, and manage soil",
};
CCAutomated.ConfigData.Pantheon = {
  name: "Pantheon",
  label: ["OFF", "Godzamok"],
  description: "sell low-value buildings during click combo windows",
};
CCAutomated.ConfigData.Season = {
  name: "Seasons",
  label: ["OFF", "Click", "Manage"],
  description: "click reindeer and buy affordable seasonal upgrades",
};
CCAutomated.ConfigData.AutoBuyer = {
  name: "Auto-buyer",
  label: ["OFF", "ROI", "Balanced", "Long", "Now"],
  strategy: [
    {
      maxWaitSeconds: 300,
      buildingThresholdScoreMultiplier: 1,
      majorBuildingThresholdScoreMultiplier: 0.9,
      allowSaving: true,
      luckyBankRatio: 0,
    },
    {
      maxWaitSeconds: 600,
      buildingThresholdScoreMultiplier: 0.8,
      majorBuildingThresholdScoreMultiplier: 0.65,
      allowSaving: true,
      luckyBankRatio: 0.5,
    },
    {
      maxWaitSeconds: 1800,
      buildingThresholdScoreMultiplier: 0.7,
      majorBuildingThresholdScoreMultiplier: 0.5,
      allowSaving: true,
      luckyBankRatio: 1,
    },
    {
      maxWaitSeconds: 0,
      buildingThresholdScoreMultiplier: 0.9,
      majorBuildingThresholdScoreMultiplier: 0.8,
      allowSaving: false,
      luckyBankRatio: 0,
    },
  ],
  description: "buy or save for the best building or upgrade",
};
CCAutomated.ConfigData.AutoBuyerReserve = {
  name: "Buyer Reserve",
  label: ["OFF", "5 min", "10 min", "30 min", "1 hour"],
  reserveSeconds: [0, 300, 600, 1800, 3600],
  description: "keep this much base CpS banked before spending",
};

CCAutomated.restoreDefaultConfig = function () {
  CCAutomated.Config = Object.assign({}, CCAutomated.ConfigDefault);
  CCAutomated.saveConfig(CCAutomated.Config);
  Game.UpdateMenu();
};

CCAutomated.saveConfig = function (config) {
  try {
    window.localStorage.setItem(CCAutomated.ConfigPrefix, JSON.stringify(config));
  } catch (e) {
    console.warn("[CCAutomated] Failed to save config", e);
  }
};

CCAutomated.loadConfig = function () {
  try {
    let storedConfig = window.localStorage.getItem(CCAutomated.ConfigPrefix);
    if (!storedConfig) {
      CCAutomated.Config = Object.assign({}, CCAutomated.ConfigDefault);
      CCAutomated.saveConfig(CCAutomated.Config);
      return;
    }

    CCAutomated.Config = JSON.parse(storedConfig);
    for (let i in CCAutomated.ConfigDefault) {
      if (
        typeof CCAutomated.Config[i] !== "number" ||
        !Number.isInteger(CCAutomated.Config[i]) ||
        CCAutomated.Config[i] < 0 ||
        CCAutomated.Config[i] >= CCAutomated.ConfigData[i].label.length
      ) {
        throw new Error("Invalid config entry: " + i);
      }
    }
    for (let key in CCAutomated.Config) {
      if (typeof CCAutomated.ConfigDefault[key] === "undefined") throw new Error("Unknown config entry: " + key);
    }
  } catch (e) {
    console.warn("[CCAutomated] Failed to load config; restoring defaults", e);
    CCAutomated.Config = Object.assign({}, CCAutomated.ConfigDefault);
    CCAutomated.saveConfig(CCAutomated.Config);
  }
};

CCAutomated.toggleConfigEntry = function (config) {
  CCAutomated.Config[config] = (CCAutomated.Config[config] + 1) % CCAutomated.ConfigData[config].label.length;

  let option = l(CCAutomated.ConfigPrefix + config);
  if (option) {
    option.textContent = CCAutomated.ConfigData[config].label[CCAutomated.Config[config]];
    option.className = CCAutomated.isConfigEntryOff(config) ? "option off" : "option";
  }
  if (config === "AutoBuyer" || config === "AutoBuyerReserve") CCAutomated.AutoBuyer.target = null;
  CCAutomated.saveConfig(CCAutomated.Config);
};

CCAutomated.isConfigEntryOff = function (config) {
  return CCAutomated.Config[config] === 0 && CCAutomated.ConfigData[config].label[0] === "OFF";
};

CCAutomated.getConfigDisplayLabel = function (config) {
  let data = CCAutomated.ConfigData[config];
  if (!data) return config;
  if (data.name && data.description) return data.name + " - " + data.description;
  return data.name || data.description || config;
};

CCAutomated.ConfigDisplay.displayMenu = function () {
  let frag = document.createDocumentFragment();
  let subsection = document.createElement("div");
  subsection.className = "subsection";
  subsection.style.padding = "0px";
  frag.appendChild(subsection);

  let div = document.createElement("div");
  div.className = "title";
  div.textContent = "Cookie Clicker Automated";
  subsection.appendChild(div);
  let listing = function (config) {
    let div = document.createElement("div");
    div.className = "listing";
    let a = document.createElement("a");
    a.className = "option";
    if (CCAutomated.isConfigEntryOff(config)) a.className = "option off";
    a.id = CCAutomated.ConfigPrefix + config;
    a.onclick = function () {
      CCAutomated.toggleConfigEntry(config);
    };
    a.textContent = CCAutomated.ConfigData[config].label[CCAutomated.Config[config]];
    div.appendChild(a);
    let label = document.createElement("label");
    label.textContent = CCAutomated.getConfigDisplayLabel(config);
    div.appendChild(label);
    return div;
  };
  for (let config in CCAutomated.ConfigDefault) {
    subsection.appendChild(listing(config));
  }
  subsection.appendChild(CCAutomated.ConfigDisplay.autoBuyerStatus());
  subsection.appendChild(CCAutomated.ConfigDisplay.gardenStatus());
  subsection.appendChild(CCAutomated.ConfigDisplay.grimoireStatus());
  subsection.appendChild(CCAutomated.ConfigDisplay.pantheonStatus());
  subsection.appendChild(CCAutomated.ConfigDisplay.seasonStatus());
  subsection.appendChild(CCAutomated.ConfigDisplay.comboStatus());
  subsection.appendChild(CCAutomated.ConfigDisplay.ascensionStatus());

  let menu = l("menu");
  let menuContent = menu && menu.childNodes[2];
  if (!menuContent) return;
  menuContent.insertBefore(frag, menuContent.childNodes[menuContent.childNodes.length - 1]);
};

CCAutomated.ConfigDisplay.statusPanel = function (status) {
  let div = document.createElement("div");
  div.className = "listing";
  div.style.opacity = "0.75";
  div.style.lineHeight = "140%";

  let title = document.createElement("div");
  title.style.fontWeight = "bold";
  title.style.marginBottom = "2px";
  title.textContent = status.title;
  div.appendChild(title);

  for (let i = 0; i < status.lines.length; i++) {
    let line = document.createElement("div");
    line.style.display = "grid";
    line.style.gridTemplateColumns = "74px 1fr";
    line.style.columnGap = "8px";

    let label = document.createElement("span");
    label.style.opacity = "0.7";
    label.textContent = status.lines[i].label;
    line.appendChild(label);

    let value = document.createElement("span");
    value.textContent = status.lines[i].value;
    line.appendChild(value);

    div.appendChild(line);
  }

  return div;
};

CCAutomated.ConfigDisplay.comboStatus = function () {
  return CCAutomated.ConfigDisplay.statusPanel(CCAutomated.getComboStatus());
};

CCAutomated.ConfigDisplay.grimoireStatus = function () {
  return CCAutomated.ConfigDisplay.statusPanel(CCAutomated.getGrimoireStatus());
};

CCAutomated.ConfigDisplay.gardenStatus = function () {
  return CCAutomated.ConfigDisplay.statusPanel(CCAutomated.getGardenStatus());
};

CCAutomated.ConfigDisplay.pantheonStatus = function () {
  return CCAutomated.ConfigDisplay.statusPanel(CCAutomated.getPantheonStatus());
};

CCAutomated.ConfigDisplay.seasonStatus = function () {
  return CCAutomated.ConfigDisplay.statusPanel(CCAutomated.getSeasonStatus());
};

CCAutomated.ConfigDisplay.ascensionStatus = function () {
  return CCAutomated.ConfigDisplay.statusPanel(CCAutomated.getAscensionStatus());
};

CCAutomated.ConfigDisplay.autoBuyerStatus = function () {
  return CCAutomated.ConfigDisplay.statusPanel(CCAutomated.getAutoBuyerStatus());
};

if (!CCAutomated.ConfigBackup.UpdateMenu) CCAutomated.ConfigBackup.UpdateMenu = Game.UpdateMenu;

Game.UpdateMenu = function () {
  CCAutomated.ConfigBackup.UpdateMenu();
  if (Game.onMenu === "prefs") CCAutomated.ConfigDisplay.displayMenu();
};

// Handle auto clicking Big Cookie
CCAutomated.getBigCookieCenter = function () {
  let cookie = l("bigCookie");
  if (!cookie || typeof cookie.getBoundingClientRect !== "function") return null;

  let rect = cookie.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    element: cookie,
  };
};

CCAutomated.clickBigCookie = function () {
  let cookieCenter = CCAutomated.getBigCookieCenter();
  if (cookieCenter) {
    Game.mouseX = cookieCenter.x;
    Game.mouseY = cookieCenter.y;
  }

  if (typeof Game.ClickCookie === "function") {
    Game.ClickCookie();
    return;
  }

  if (cookieCenter && typeof cookieCenter.element.dispatchEvent === "function") {
    cookieCenter.element.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        clientX: cookieCenter.x,
        clientY: cookieCenter.y,
      }),
    );
  }
};

CCAutomated.handleAutoClicker = function () {
  if (CCAutomated.Config.AutoClicker === 0) return;

  for (let i = 0; i < CCAutomated.AutoClicker.clicksPerTick; i++) {
    CCAutomated.clickBigCookie();
  }
};

// Handle auto clicking Golden Cookies
CCAutomated.isGoldenShimmerReady = function (shimmer) {
  if (!shimmer || shimmer.type !== "golden") return false;
  if (shimmer.life <= 0) return false;

  let secondsLeft = shimmer.life / Game.fps;
  if (!Game.Achievements["Early bird"].won) return true;
  if (!Game.Achievements["Fading luck"].won) return secondsLeft <= 1;
  return true;
};

CCAutomated.handleGoldenCookies = function () {
  if (CCAutomated.Config.GoldenCookies === 0) return;
  if (Game.TickerEffect) Game.tickerL.click();

  for (let i = Game.shimmers.length - 1; i >= 0; i--) {
    let shimmer = Game.shimmers[i];
    if (!shimmer) continue;
    if (shimmer.force === "cookie storm drop" || CCAutomated.isGoldenShimmerReady(shimmer)) {
      shimmer.pop();
    }
  }
};

CCAutomated.isReindeerShimmerReady = function (shimmer) {
  return shimmer && shimmer.type === "reindeer" && shimmer.life > 0;
};

CCAutomated.getReindeerShimmerInfo = function () {
  let info = {
    total: 0,
  };
  if (!Game.shimmers) return info;

  for (let i = 0; i < Game.shimmers.length; i++) {
    if (CCAutomated.isReindeerShimmerReady(Game.shimmers[i])) info.total++;
  }

  return info;
};

CCAutomated.setSeasonAction = function (action) {
  CCAutomated.Season.lastAction = action;
  CCAutomated.Season.lastActionAt = Date.now();
};

CCAutomated.clickReindeer = function () {
  let clicked = 0;
  if (!Game.shimmers) return clicked;

  for (let i = Game.shimmers.length - 1; i >= 0; i--) {
    let shimmer = Game.shimmers[i];
    if (!CCAutomated.isReindeerShimmerReady(shimmer)) continue;
    shimmer.pop();
    clicked++;
  }

  if (clicked > 0) CCAutomated.setSeasonAction("Clicked " + clicked + " reindeer");
  return clicked;
};

CCAutomated.isSeasonUpgrade = function (upgrade) {
  return upgrade && upgrade.name && CCAutomated.Season.upgradePattern.test(upgrade.name);
};

CCAutomated.getSeasonUpgradePriority = function (upgrade) {
  if (!upgrade || !upgrade.name) return 10;
  if (CCAutomated.Season.santaPattern.test(upgrade.name)) return 0;
  if (/reindeer/i.test(upgrade.name)) return 1;
  if (/egg|bunny|easter/i.test(upgrade.name)) return 2;
  if (/halloween/i.test(upgrade.name)) return 3;
  if (/valentine|heart/i.test(upgrade.name)) return 4;
  return 5;
};

CCAutomated.getSeasonUpgradeCandidates = function () {
  let candidates = [];
  if (!Game.UpgradesInStore) return candidates;

  for (let i = 0; i < Game.UpgradesInStore.length; i++) {
    let upgrade = Game.UpgradesInStore[i];
    if (!CCAutomated.isUpgradeCandidate(upgrade)) continue;
    if (!CCAutomated.isSeasonUpgrade(upgrade)) continue;

    let price = CCAutomated.getUpgradePrice(upgrade);
    if (!isFinite(price) || price <= 0) continue;

    candidates.push({
      upgrade: upgrade,
      price: price,
      priority: CCAutomated.getSeasonUpgradePriority(upgrade),
      name: upgrade.name,
    });
  }

  candidates.sort(function (a, b) {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.price - b.price;
  });

  return candidates;
};

CCAutomated.getBestAffordableSeasonUpgrade = function () {
  let cookies = typeof Game.cookies === "number" ? Game.cookies : 0;
  let spendableCookies = CCAutomated.getAutoBuyerSpendableCookies(cookies);
  let candidates = CCAutomated.getSeasonUpgradeCandidates();

  for (let i = 0; i < candidates.length; i++) {
    if (candidates[i].price <= spendableCookies) return candidates[i];
  }

  return null;
};

CCAutomated.buySeasonUpgrade = function (candidate) {
  if (!candidate || !candidate.upgrade || typeof candidate.upgrade.buy !== "function") return false;
  if (candidate.price > CCAutomated.getAutoBuyerSpendableCookies(Game.cookies)) return false;
  if (typeof candidate.upgrade.canBuy === "function" && !candidate.upgrade.canBuy()) return false;

  try {
    candidate.upgrade.buy();
    CCAutomated.AutoBuyer.target = null;
    CCAutomated.Season.lastUpgradeName = candidate.name;
    CCAutomated.setSeasonAction("Bought " + candidate.name);
    return true;
  } catch (e) {
    console.warn("[CCAutomated] Failed to buy seasonal upgrade", candidate.name, e);
  }

  return false;
};

CCAutomated.handleSeason = function () {
  if (CCAutomated.Config.Season === 0) return;

  if (CCAutomated.clickReindeer() > 0) return;
  if (CCAutomated.Config.Season < 2) return;

  CCAutomated.buySeasonUpgrade(CCAutomated.getBestAffordableSeasonUpgrade());
};

// Handle auto clicking Wrinklers
CCAutomated.isWrinklerAttached = function (wrinkler) {
  return wrinkler && wrinkler.close === 1 && wrinkler.hp > 0;
};

CCAutomated.popWrinkler = function (wrinkler) {
  if (wrinkler) wrinkler.hp = 0;
};

CCAutomated.getBestWrinklerToPop = function () {
  let bestWrinkler = null;
  let maxSucked = CCAutomated.Wrinklers.minSuckedToPop;

  for (let i = 0; i < Game.wrinklers.length; i++) {
    let wrinkler = Game.wrinklers[i];
    if (!CCAutomated.isWrinklerAttached(wrinkler)) continue;
    if (wrinkler.sucked >= maxSucked) {
      maxSucked = wrinkler.sucked;
      bestWrinkler = wrinkler;
    }
  }

  return bestWrinkler;
};

CCAutomated.getWrinklerSummary = function () {
  let summary = {
    total: 0,
    attached: 0,
    shiny: 0,
    sucked: 0,
  };
  if (!Game.wrinklers) return summary;

  summary.total = Game.wrinklers.length;
  for (let i = 0; i < Game.wrinklers.length; i++) {
    let wrinkler = Game.wrinklers[i];
    if (!CCAutomated.isWrinklerAttached(wrinkler)) continue;

    summary.attached++;
    if (wrinkler.type === 1) summary.shiny++;
    if (typeof wrinkler.sucked === "number") summary.sucked += wrinkler.sucked;
  }

  return summary;
};

CCAutomated.shouldHoldWrinklerPopForSkruuia = function () {
  if (CCAutomated.Config.Pantheon === 0) return false;
  if (CCAutomated.isSkruuiaSlotted()) return false;
  if (!CCAutomated.getPantheon()) return false;
  return CCAutomated.getWrinklerSummary().attached > 0;
};

CCAutomated.handleWrinklers = function () {
  if (CCAutomated.Config.Wrinklers === 0) return;
  if (!Game.Upgrades["One mind"].bought) return;
  if (Game.Upgrades["Unholy bait"].bought && !Game.Achievements["Moistburster"].won) {
    Game.wrinklers.forEach(function (wrinkler) {
      if (CCAutomated.isWrinklerAttached(wrinkler)) CCAutomated.popWrinkler(wrinkler);
    });
    return;
  }

  let now = Date.now();
  if (now - CCAutomated.Wrinklers.lastPop < CCAutomated.Wrinklers.popIntervalMs) return;
  if (CCAutomated.shouldHoldWrinklerPopForSkruuia()) return;

  let wrinkler = CCAutomated.getBestWrinklerToPop();
  if (wrinkler) {
    CCAutomated.popWrinkler(wrinkler);
    CCAutomated.Wrinklers.lastPop = now;
  }
};

CCAutomated.getCpsMultiplier = function () {
  let multiplier = 1;
  if (!Game.buffs) return multiplier;

  for (let buffName in Game.buffs) {
    let buff = Game.buffs[buffName];
    if (typeof buff.multCpS === "number") multiplier *= buff.multCpS;
  }
  return multiplier;
};

CCAutomated.getBuffTimeLeftSeconds = function (buff) {
  if (!buff || typeof buff.time !== "number") return 0;
  if (typeof Game.fps !== "number" || Game.fps <= 0) return buff.time;
  return buff.time / Game.fps;
};

CCAutomated.hasBuffMatching = function (pattern) {
  if (!Game.buffs) return false;

  for (let buffName in Game.buffs) {
    if (pattern.test(buffName)) return true;
  }

  return false;
};

CCAutomated.getGoldenShimmerInfo = function () {
  let info = {
    total: 0,
    regular: 0,
    stormDrops: 0,
    forced: 0,
  };
  if (!Game.shimmers) return info;

  for (let i = 0; i < Game.shimmers.length; i++) {
    let shimmer = Game.shimmers[i];
    if (!shimmer || shimmer.type !== "golden" || shimmer.life <= 0) continue;

    info.total++;
    if (shimmer.force === "cookie storm drop") info.stormDrops++;
    else info.regular++;
    if (shimmer.force) info.forced++;
  }

  return info;
};

CCAutomated.hasActiveGoldenShimmer = function () {
  return CCAutomated.getGoldenShimmerInfo().total > 0;
};

CCAutomated.getActiveComboBuffInfo = function () {
  let info = {
    count: 0,
    names: [],
    multiplier: CCAutomated.getCpsMultiplier(),
    hasFrenzy: false,
    hasClickBuff: false,
    hasBuildingSpecial: false,
    hasDragonBuff: false,
    secondsLeft: 0,
  };
  if (!Game.buffs) return info;

  for (let buffName in Game.buffs) {
    let buff = Game.buffs[buffName];
    let lowerName = buffName.toLowerCase();
    info.count++;
    info.names.push(buffName);
    info.secondsLeft = Math.max(info.secondsLeft, CCAutomated.getBuffTimeLeftSeconds(buff));
    if (lowerName.indexOf("frenzy") !== -1) info.hasFrenzy = true;
    if (lowerName.indexOf("click") !== -1) info.hasClickBuff = true;
    if (lowerName.indexOf("dragon") !== -1) info.hasDragonBuff = true;
    if (lowerName.indexOf("building") !== -1 || lowerName.indexOf("special") !== -1) info.hasBuildingSpecial = true;
  }

  return info;
};

CCAutomated.isStrongComboActive = function () {
  let combo = CCAutomated.getActiveComboBuffInfo();
  return (
    combo.multiplier >= CCAutomated.Strategy.strongBuffMultiplier ||
    combo.hasFrenzy ||
    combo.hasBuildingSpecial ||
    combo.hasDragonBuff
  );
};

CCAutomated.isHugeComboActive = function () {
  let combo = CCAutomated.getActiveComboBuffInfo();
  return combo.multiplier >= CCAutomated.Strategy.hugeBuffMultiplier || combo.hasClickBuff;
};

CCAutomated.getLuckyReward = function (cookies, cookiesPerSecond) {
  if (typeof cookies !== "number") cookies = 0;
  if (typeof cookiesPerSecond !== "number") cookiesPerSecond = 0;
  return (
    Math.min(
      cookies * CCAutomated.AutoBuyer.luckyRewardBankRatio,
      cookiesPerSecond * CCAutomated.AutoBuyer.luckyRewardCookiesPerSecond,
    ) + 13
  );
};

CCAutomated.getLuckyBankTarget = function (cookiesPerSecond) {
  if (typeof cookiesPerSecond !== "number" || cookiesPerSecond <= 0) return 0;
  return cookiesPerSecond * CCAutomated.AutoBuyer.luckyBankSeconds;
};

CCAutomated.getStrategicBankReserveCookies = function () {
  if (CCAutomated.Config.AutoBuyer === 0) return 0;
  let strategy = CCAutomated.getAutoBuyerStrategy();
  let ratio = strategy.luckyBankRatio || 0;
  if (ratio <= 0) return 0;

  let cps = CCAutomated.isStrongComboActive()
    ? CCAutomated.getCookiesPerSecond()
    : CCAutomated.getBaseCookiesPerSecond();
  return CCAutomated.getLuckyBankTarget(cps) * ratio;
};

CCAutomated.canUseLumps = function (grimoire) {
  if (typeof Game.canLumps !== "function" || !Game.canLumps()) return false;
  if (Game.lumps <= 100 || !grimoire.lumpRefill) return false;
  if (!grimoire.lumpRefill.classList) return true;
  return !grimoire.lumpRefill.classList.contains("disabled");
};

CCAutomated.canCastSpell = function (grimoire, spell) {
  return grimoire && spell && grimoire.magic >= CCAutomated.getSpellCost(grimoire, spell);
};

CCAutomated.shouldCastForceHandOfFate = function (grimoire, spell) {
  if (!CCAutomated.canCastSpell(grimoire, spell)) return false;
  if (CCAutomated.hasActiveGoldenShimmer()) return false;

  let combo = CCAutomated.getActiveComboBuffInfo();
  if (combo.hasFrenzy || combo.hasBuildingSpecial || combo.hasDragonBuff) return true;
  if (combo.multiplier >= CCAutomated.Strategy.strongBuffMultiplier) return true;

  return false;
};

CCAutomated.shouldCastConjureBakedGoods = function (grimoire, spell) {
  if (!CCAutomated.canCastSpell(grimoire, spell)) return false;
  return CCAutomated.getCpsMultiplier() >= CCAutomated.Strategy.hugeBuffMultiplier;
};

CCAutomated.shouldUseLumpForGrimoire = function (grimoire) {
  return CCAutomated.isHugeComboActive() && CCAutomated.canUseLumps(grimoire);
};

CCAutomated.shouldSellWizardTowersForCombo = function (grimoire) {
  if (!CCAutomated.isHugeComboActive()) return false;
  if (!Game.shimmerTypes || !Game.shimmerTypes["golden"] || Game.shimmerTypes["golden"].n < 2) return false;
  if (!Game.Objects["Wizard tower"] || Game.Objects["Wizard tower"].amount <= 30) return false;
  return grimoire && grimoire.magic > 30;
};

CCAutomated.getGarden = function () {
  let farm = Game.Objects && Game.Objects["Farm"];
  if (!farm) return null;
  if (typeof Game.isMinigameReady === "function" && !Game.isMinigameReady(farm)) return null;
  return farm.minigame || null;
};

CCAutomated.getGardenPlotWidth = function (garden) {
  if (!garden || !garden.plot || !garden.plot.length) return 0;
  return garden.plot[0] ? garden.plot[0].length : 0;
};

CCAutomated.getGardenPlotHeight = function (garden) {
  if (!garden || !garden.plot) return 0;
  return garden.plot.length;
};

CCAutomated.getGardenTile = function (garden, x, y) {
  if (!garden || !garden.plot || !garden.plot[y]) return null;
  return garden.plot[y][x] || null;
};

CCAutomated.getGardenTilePlant = function (garden, tile) {
  if (!garden || !tile || !tile[0] || !garden.plantsById) return null;
  return garden.plantsById[tile[0] - 1] || null;
};

CCAutomated.isGardenComboHarvestPlant = function (plant) {
  if (!plant || !plant.name) return false;

  for (let i = 0; i < CCAutomated.Garden.comboHarvestPlantNames.length; i++) {
    if (plant.name === CCAutomated.Garden.comboHarvestPlantNames[i]) return true;
  }

  return false;
};

CCAutomated.isGardenTileMature = function (plant, tile) {
  if (!plant || !tile || typeof tile[1] !== "number") return false;
  if (typeof plant.mature !== "number") return false;
  return tile[1] >= plant.mature;
};

CCAutomated.getGardenSummary = function () {
  let garden = CCAutomated.getGarden();
  let summary = {
    ready: !!garden,
    frozen: false,
    soil: "",
    width: 0,
    height: 0,
    planted: 0,
    mature: 0,
    growing: 0,
    comboReady: 0,
    comboGrowing: 0,
    comboPlantNames: [],
  };
  if (!garden) return summary;

  summary.frozen = !!garden.freeze;
  summary.soil = CCAutomated.getGardenSoilName(garden);
  summary.width = CCAutomated.getGardenPlotWidth(garden);
  summary.height = CCAutomated.getGardenPlotHeight(garden);

  for (let y = 0; y < summary.height; y++) {
    for (let x = 0; x < summary.width; x++) {
      let tile = CCAutomated.getGardenTile(garden, x, y);
      let plant = CCAutomated.getGardenTilePlant(garden, tile);
      if (!plant) continue;

      summary.planted++;
      if (CCAutomated.isGardenTileMature(plant, tile)) summary.mature++;
      else summary.growing++;

      if (CCAutomated.isGardenComboHarvestPlant(plant)) {
        if (CCAutomated.isGardenTileMature(plant, tile)) summary.comboReady++;
        else summary.comboGrowing++;
        if (summary.comboPlantNames.indexOf(plant.name) === -1) summary.comboPlantNames.push(plant.name);
      }
    }
  }

  return summary;
};

CCAutomated.setGardenAction = function (action) {
  CCAutomated.Garden.lastAction = action;
  CCAutomated.Garden.lastActionAt = Date.now();
};

CCAutomated.harvestGardenTile = function (garden, x, y) {
  if (!garden || typeof garden.harvest !== "function") return false;

  try {
    garden.harvest(x, y);
    return true;
  } catch (e) {
    console.warn("[CCAutomated] Failed to harvest garden tile", x, y, e);
  }

  return false;
};

CCAutomated.setGardenFrozen = function (garden, frozen) {
  if (!garden || !!garden.freeze === frozen) return false;

  try {
    if (typeof garden.toggleFreeze === "function") {
      garden.toggleFreeze();
      return true;
    }
  } catch (e) {
    console.warn("[CCAutomated] Failed to change garden freeze state", e);
  }

  return false;
};

CCAutomated.getGardenSoilName = function (garden) {
  if (!garden || typeof garden.soil !== "number" || !garden.soilsById) return "";
  let soil = garden.soilsById[garden.soil];
  return soil && soil.name ? soil.name : "";
};

CCAutomated.getGardenSoilIdByName = function (garden, soilName) {
  if (!garden || !garden.soilsById || !soilName) return -1;

  for (let i = 0; i < garden.soilsById.length; i++) {
    let soil = garden.soilsById[i];
    if (soil && soil.name && soil.name.toLowerCase() === soilName.toLowerCase()) return i;
  }

  return -1;
};

CCAutomated.setGardenSoil = function (garden, soilName) {
  if (!garden || !soilName) return false;
  let soilId = CCAutomated.getGardenSoilIdByName(garden, soilName);
  if (soilId < 0 || garden.soil === soilId) return false;

  try {
    if (typeof garden.changeSoil === "function") {
      garden.changeSoil(soilId);
      return garden.soil === soilId;
    }
  } catch (e) {
    console.warn("[CCAutomated] Failed to change garden soil", soilName, e);
  }

  return false;
};

CCAutomated.getGardenTargetSoil = function (summary) {
  if (!summary || !summary.ready) return "";
  if (summary.comboReady > 0) return CCAutomated.Garden.soilByGoal.holding;
  if (summary.growing > 0) return CCAutomated.Garden.soilByGoal.growing;
  if (summary.planted === 0) return CCAutomated.Garden.soilByGoal.mutation;
  return "";
};

CCAutomated.handleGarden = function () {
  if (CCAutomated.Config.Garden === 0) return;

  let garden = CCAutomated.getGarden();
  if (!garden) return;

  let summary = CCAutomated.getGardenSummary();
  let harvested = 0;

  if (summary.comboReady > 0 && CCAutomated.isStrongComboActive()) {
    if (CCAutomated.setGardenFrozen(garden, false)) CCAutomated.setGardenAction("Unfroze for combo harvest");

    for (let y = 0; y < summary.height; y++) {
      for (let x = 0; x < summary.width; x++) {
        let tile = CCAutomated.getGardenTile(garden, x, y);
        let plant = CCAutomated.getGardenTilePlant(garden, tile);
        if (!CCAutomated.isGardenComboHarvestPlant(plant)) continue;
        if (!CCAutomated.isGardenTileMature(plant, tile)) continue;
        if (CCAutomated.harvestGardenTile(garden, x, y)) harvested++;
      }
    }
  }

  if (harvested > 0) {
    CCAutomated.setGardenAction("Harvested " + harvested + " combo plant" + (harvested === 1 ? "" : "s"));
    return;
  }

  if (CCAutomated.Config.Garden < 2) return;

  if (summary.comboReady > 0 && !CCAutomated.isStrongComboActive()) {
    if (CCAutomated.setGardenFrozen(garden, true)) CCAutomated.setGardenAction("Froze mature combo plants");
  } else if (summary.growing > 0) {
    if (CCAutomated.setGardenFrozen(garden, false)) CCAutomated.setGardenAction("Unfroze garden growth");
  }

  let targetSoil = CCAutomated.getGardenTargetSoil(summary);
  if (targetSoil && CCAutomated.setGardenSoil(garden, targetSoil)) {
    CCAutomated.setGardenAction("Changed soil to " + targetSoil);
  }
};

CCAutomated.getPantheon = function () {
  let temple = Game.Objects && Game.Objects["Temple"];
  if (!temple) return null;
  if (typeof Game.isMinigameReady === "function" && !Game.isMinigameReady(temple)) return null;
  return temple.minigame || null;
};

CCAutomated.getPantheonGodFromSlot = function (pantheon, slotIndex) {
  if (!pantheon || !pantheon.slot) return null;
  let slot = pantheon.slot[slotIndex];
  if (slot && slot.name) return slot;

  let godId = -1;
  if (typeof slot === "number") godId = slot;
  else if (slot && typeof slot.id === "number") godId = slot.id;

  if (godId >= 0 && pantheon.godsById) return pantheon.godsById[godId] || null;

  if (pantheon.godsById) {
    for (let i = 0; i < pantheon.godsById.length; i++) {
      let god = pantheon.godsById[i];
      if (god && god.slot === slotIndex) return god;
    }
  }

  return null;
};

CCAutomated.getPantheonGodSlotMatching = function (pantheon, pattern) {
  if (!pantheon || !pattern) return -1;

  for (let i = 0; i < 3; i++) {
    let god = CCAutomated.getPantheonGodFromSlot(pantheon, i);
    if (god && god.name && pattern.test(god.name)) return i;
  }

  return -1;
};

CCAutomated.getPantheonSlotLabel = function (slotIndex) {
  let labels = ["diamond", "ruby", "jade"];
  return labels[slotIndex] || "not slotted";
};

CCAutomated.isGodzamokSlotted = function () {
  return CCAutomated.getPantheonGodSlotMatching(CCAutomated.getPantheon(), CCAutomated.Pantheon.godzamokPattern) >= 0;
};

CCAutomated.getSkruuiaSlot = function () {
  return CCAutomated.getPantheonGodSlotMatching(CCAutomated.getPantheon(), CCAutomated.Pantheon.skruuiaPattern);
};

CCAutomated.isSkruuiaSlotted = function () {
  return CCAutomated.getSkruuiaSlot() >= 0;
};

CCAutomated.hasGodzamokBuff = function () {
  return CCAutomated.hasBuffMatching(CCAutomated.Pantheon.godzamokBuffPattern);
};

CCAutomated.getClickComboSecondsLeft = function () {
  let secondsLeft = 0;
  if (!Game.buffs) return secondsLeft;

  for (let buffName in Game.buffs) {
    if (!CCAutomated.Pantheon.clickBuffPattern.test(buffName)) continue;
    secondsLeft = Math.max(secondsLeft, CCAutomated.getBuffTimeLeftSeconds(Game.buffs[buffName]));
  }

  return secondsLeft;
};

CCAutomated.getGodzamokSellableBuildings = function () {
  let buildings = [];
  for (let i = 0; i < CCAutomated.Pantheon.lowValueBuildingNames.length; i++) {
    let name = CCAutomated.Pantheon.lowValueBuildingNames[i];
    let object = Game.Objects && Game.Objects[name];
    if (!object || typeof object.amount !== "number" || typeof object.sell !== "function") continue;

    let sellable = Math.min(
      CCAutomated.Pantheon.maxSellPerBuilding,
      Math.max(0, object.amount - CCAutomated.Pantheon.minKeep),
    );
    if (sellable > 0) {
      buildings.push({
        object: object,
        name: name,
        sellable: sellable,
      });
    }
  }

  return buildings;
};

CCAutomated.getTotalGodzamokSellableBuildings = function () {
  let total = 0;
  let buildings = CCAutomated.getGodzamokSellableBuildings();

  for (let i = 0; i < buildings.length; i++) {
    total += buildings[i].sellable;
  }

  return total;
};

CCAutomated.shouldTriggerGodzamokCombo = function () {
  if (CCAutomated.Config.Pantheon === 0) return false;
  if (!CCAutomated.isGodzamokSlotted()) return false;
  if (CCAutomated.hasGodzamokBuff()) return false;
  if (CCAutomated.getClickComboSecondsLeft() <= 2) return false;
  if (Date.now() - CCAutomated.Pantheon.lastActionAt < CCAutomated.Pantheon.cooldownMs) return false;
  return CCAutomated.getTotalGodzamokSellableBuildings() > 0;
};

CCAutomated.setPantheonAction = function (action) {
  CCAutomated.Pantheon.lastAction = action;
  CCAutomated.Pantheon.lastActionAt = Date.now();
};

CCAutomated.triggerGodzamokCombo = function () {
  let sold = 0;
  let buildings = CCAutomated.getGodzamokSellableBuildings();

  for (let i = 0; i < buildings.length; i++) {
    if (sold >= CCAutomated.Pantheon.maxSellTotal) break;
    let amount = Math.min(buildings[i].sellable, CCAutomated.Pantheon.maxSellTotal - sold);
    if (amount <= 0) continue;

    try {
      buildings[i].object.sell(amount);
      sold += amount;
    } catch (e) {
      console.warn("[CCAutomated] Failed to sell for Godzamok", buildings[i].name, e);
    }
  }

  if (sold > 0) CCAutomated.setPantheonAction("Sold " + sold + " buildings for Godzamok");
  return sold > 0;
};

CCAutomated.handlePantheon = function () {
  if (CCAutomated.shouldTriggerGodzamokCombo()) CCAutomated.triggerGodzamokCombo();
};

CCAutomated.getGrimoire = function () {
  let tower = Game.Objects && Game.Objects["Wizard tower"];
  if (!tower) return null;
  if (typeof Game.isMinigameReady === "function" && !Game.isMinigameReady(tower)) return null;
  return tower.minigame || null;
};

// Handle Wizard towers: Grimoire minigame
CCAutomated.handleGrimoire = function () {
  if (CCAutomated.Config.Grimoire === 0) return;
  let grimoire = CCAutomated.getGrimoire();
  if (grimoire) {
    let spell = grimoire.spells["hand of fate"];
    if (CCAutomated.shouldCastForceHandOfFate(grimoire, spell)) {
      grimoire.castSpell(spell);
    }
    if (CCAutomated.shouldSellWizardTowersForCombo(grimoire)) {
      let tower = Game.Objects["Wizard tower"];
      tower.sell(tower.amount - 30);
    }
    spell = grimoire.spells["conjure baked goods"];
    if (CCAutomated.getCpsMultiplier() >= CCAutomated.Strategy.hugeBuffMultiplier) {
      if (CCAutomated.shouldCastConjureBakedGoods(grimoire, spell)) {
        grimoire.castSpell(spell);
        return;
      }
      if (CCAutomated.shouldUseLumpForGrimoire(grimoire)) {
        grimoire.lumpRefill.click();
      }
    }
  }
};

CCAutomated.getCookiesPerSecond = function () {
  if (typeof Game.cookiesPs === "number") return Game.cookiesPs;
  if (typeof Game.cookiesPsRaw === "number") return Game.cookiesPsRaw;
  return 0;
};

CCAutomated.getBaseCookiesPerSecond = function () {
  if (typeof Game.cookiesPsRaw === "number") return Game.cookiesPsRaw;
  return CCAutomated.getCookiesPerSecond();
};

CCAutomated.getAutoBuyerPlanningCookiesPerSecond = function () {
  return CCAutomated.getBaseCookiesPerSecond();
};

CCAutomated.getAutoBuyerStrategy = function () {
  return CCAutomated.ConfigData.AutoBuyer.strategy[CCAutomated.Config.AutoBuyer - 1];
};

CCAutomated.getAutoBuyerReserveSeconds = function () {
  return CCAutomated.ConfigData.AutoBuyerReserve.reserveSeconds[CCAutomated.Config.AutoBuyerReserve];
};

CCAutomated.getAutoBuyerReserveCookies = function () {
  return CCAutomated.getBaseCookiesPerSecond() * CCAutomated.getAutoBuyerReserveSeconds();
};

CCAutomated.getAutoBuyerSpendableCookies = function (cookies) {
  if (typeof cookies !== "number") cookies = 0;
  return Math.max(0, cookies - CCAutomated.getAutoBuyerReserveCookies() - CCAutomated.getStrategicBankReserveCookies());
};

CCAutomated.recalculateGains = function () {
  if (typeof Game.CalculateGains === "function") Game.CalculateGains();
};

CCAutomated.getObjectPrice = function (object) {
  if (!object) return Infinity;
  if (typeof object.getPrice === "function") return object.getPrice();
  if (typeof object.price === "number") return object.price;
  return Infinity;
};

CCAutomated.getUpgradePrice = function (upgrade) {
  if (!upgrade) return Infinity;
  if (typeof upgrade.getPrice === "function") return upgrade.getPrice();
  if (typeof upgrade.basePrice === "number") return upgrade.basePrice;
  if (typeof upgrade.price === "number") return upgrade.price;
  return Infinity;
};

CCAutomated.isUpgradeCandidate = function (upgrade) {
  if (!upgrade || upgrade.bought) return false;
  if (upgrade.pool === "toggle" || upgrade.pool === "debug" || upgrade.pool === "prestige") return false;
  if (upgrade.unlocked === 0 || upgrade.unlocked === false) return false;
  return true;
};

CCAutomated.getUpgradePriority = function (upgrade) {
  let priority = {
    multiplier: 1,
    label: "",
  };
  if (!upgrade || !upgrade.name) return priority;

  for (let i = 0; i < CCAutomated.Strategy.priorityPatterns.length; i++) {
    let entry = CCAutomated.Strategy.priorityPatterns[i];
    if (entry.pattern.test(upgrade.name)) {
      priority.multiplier = entry.multiplier;
      priority.label = entry.label;
      return priority;
    }
  }

  return priority;
};

CCAutomated.getStrategicUpgradeMinimumGain = function (upgrade) {
  let priority = CCAutomated.getUpgradePriority(upgrade);
  if (!priority.label) return 0;

  let cps = CCAutomated.getAutoBuyerPlanningCookiesPerSecond();
  if (cps <= 0) return 1;
  return cps / CCAutomated.Strategy.minStrategicUpgradeGainSeconds;
};

CCAutomated.getAutoBuyerScore = function (price, gain, cookies, cookiesPerSecond) {
  if (gain <= 0 || price <= 0) return Infinity;

  let waitSeconds = 0;
  if (price > cookies) {
    if (cookiesPerSecond <= 0) return Infinity;
    waitSeconds = (price - cookies) / cookiesPerSecond;
  }

  return waitSeconds + price / gain;
};

CCAutomated.getAutoBuyerBuildingThreshold = function (object) {
  if (!object || typeof object.amount !== "number") return null;

  let nextAmount = object.amount + 1;
  if (nextAmount < 10) return null;
  if (nextAmount === 10 || nextAmount === 25 || nextAmount % 50 === 0) return nextAmount;
  return null;
};

CCAutomated.getAutoBuyerBuildingThresholdScoreMultiplier = function (threshold) {
  if (!threshold) return 1;
  let strategy = CCAutomated.getAutoBuyerStrategy();
  if (threshold % 100 === 0) return strategy.majorBuildingThresholdScoreMultiplier;
  return strategy.buildingThresholdScoreMultiplier;
};

CCAutomated.getAutoBuyerWaitSeconds = function (price, cookies, cookiesPerSecond) {
  if (price <= cookies) return 0;
  if (cookiesPerSecond <= 0) return Infinity;
  return (price - cookies) / cookiesPerSecond;
};

CCAutomated.getAutoBuyerCandidateId = function (type, item) {
  if (!item) return type + ":unknown";
  if (typeof item.id !== "undefined") return type + ":" + item.id;
  return type + ":" + item.name;
};

CCAutomated.getAutoBuyerStoreSignature = function () {
  let storeSignature = "";

  if (Game.ObjectsById) {
    for (let i = 0; i < Game.ObjectsById.length; i++) {
      let object = Game.ObjectsById[i];
      storeSignature +=
        CCAutomated.getAutoBuyerCandidateId("building", object) +
        ":" +
        object.amount +
        ":" +
        CCAutomated.getObjectPrice(object) +
        "|";
    }
  }

  if (Game.UpgradesInStore) {
    for (let j = 0; j < Game.UpgradesInStore.length; j++) {
      let upgrade = Game.UpgradesInStore[j];
      storeSignature += CCAutomated.getAutoBuyerCandidateId("upgrade", upgrade) + "|";
    }
  }

  return storeSignature;
};

CCAutomated.formatDuration = function (seconds) {
  if (!isFinite(seconds) || seconds <= 0) return "now";

  seconds = Math.ceil(seconds);
  let units = [
    { label: "y", seconds: 365 * 24 * 60 * 60 },
    { label: "m", seconds: 30 * 24 * 60 * 60 },
    { label: "d", seconds: 24 * 60 * 60 },
    { label: "h", seconds: 60 * 60 },
    { label: "m", seconds: 60 },
    { label: "s", seconds: 1 },
  ];
  let parts = [];
  let firstUnitIndex = units.length - 1;

  for (let i = 0; i < units.length; i++) {
    if (seconds >= units[i].seconds) {
      firstUnitIndex = i;
      break;
    }
  }

  let lastUnitIndex = Math.min(firstUnitIndex + 2, units.length - 1);

  for (let i = firstUnitIndex; i <= lastUnitIndex; i++) {
    let amount = Math.floor(seconds / units[i].seconds);
    parts.push(amount + units[i].label);
    seconds -= amount * units[i].seconds;
  }

  return parts.join(" ");
};

CCAutomated.formatNumber = function (value) {
  if (!isFinite(value)) return "?";
  if (typeof Beautify === "function") return Beautify(value);
  if (Math.abs(value) >= 1000000) return value.toExponential(2);
  if (Math.abs(value) >= 1000) return Math.round(value).toLocaleString();
  if (Math.abs(value) >= 10) return Math.round(value).toString();
  return value.toFixed(2);
};

CCAutomated.getTotalCookiesBakedForPrestige = function () {
  let cookiesReset = typeof Game.cookiesReset === "number" ? Game.cookiesReset : 0;
  let cookiesEarned = typeof Game.cookiesEarned === "number" ? Game.cookiesEarned : 0;
  return Math.max(0, cookiesReset + cookiesEarned);
};

CCAutomated.getPrestigeForCookies = function (cookies) {
  if (typeof Game.HowMuchPrestige === "function") return Game.HowMuchPrestige(cookies);
  if (typeof cookies !== "number" || cookies <= 0) return 0;
  return Math.floor(Math.pow(cookies / 1000000000000, 1 / 3));
};

CCAutomated.getCookiesForPrestige = function (prestige) {
  if (typeof Game.HowManyCookiesReset === "function") return Game.HowManyCookiesReset(prestige);
  if (typeof prestige !== "number" || prestige <= 0) return 0;
  return Math.pow(prestige, 3) * 1000000000000;
};

CCAutomated.getCurrentPrestige = function () {
  if (typeof Game.prestige === "number") return Math.max(0, Math.floor(Game.prestige));
  return CCAutomated.getPrestigeForCookies(typeof Game.cookiesReset === "number" ? Game.cookiesReset : 0);
};

CCAutomated.getPendingPrestigeGain = function () {
  let potentialPrestige = CCAutomated.getPrestigeForCookies(CCAutomated.getTotalCookiesBakedForPrestige());
  return Math.max(0, potentialPrestige - CCAutomated.getCurrentPrestige());
};

CCAutomated.getAscensionRecommendedPrestigeGain = function (currentPrestige) {
  if (currentPrestige <= 0) return CCAutomated.Strategy.firstAscendPrestigeTarget;
  return Math.max(
    CCAutomated.Strategy.minRepeatAscendPrestigeGain,
    Math.ceil(currentPrestige * CCAutomated.Strategy.repeatAscendPrestigeGainRatio),
  );
};

CCAutomated.getAscensionStatus = function () {
  let currentPrestige = CCAutomated.getCurrentPrestige();
  let pendingPrestige = CCAutomated.getPendingPrestigeGain();
  let targetGain = CCAutomated.getAscensionRecommendedPrestigeGain(currentPrestige);
  let isRecommended = pendingPrestige >= targetGain;
  let targetPrestige = currentPrestige + targetGain;
  let targetCookies = CCAutomated.getCookiesForPrestige(targetPrestige);
  let currentCookies = CCAutomated.getTotalCookiesBakedForPrestige();
  let remainingCookies = Math.max(0, targetCookies - currentCookies);
  let cookiesPerSecond = CCAutomated.getBaseCookiesPerSecond();
  let waitSeconds = cookiesPerSecond > 0 ? remainingCookies / cookiesPerSecond : Infinity;
  let gainRatio = currentPrestige > 0 ? pendingPrestige / currentPrestige : 0;
  let ruleText =
    currentPrestige <= 0
      ? "First ascension at +" + CCAutomated.formatNumber(targetGain)
      : "Next at +" + CCAutomated.formatNumber(targetGain) + " prestige";
  let statusText = isRecommended
    ? "Ascend now"
    : "Wait for +" + CCAutomated.formatNumber(targetGain) + " prestige";
  let rewardText =
    "+" +
    CCAutomated.formatNumber(pendingPrestige) +
    (currentPrestige > 0 ? " prestige (" + Math.floor(gainRatio * 100) + "%)" : " prestige");

  let lines = [
    CCAutomated.makeStatusLine("Status", [statusText]),
    CCAutomated.makeStatusLine("Reward", [rewardText]),
    CCAutomated.makeStatusLine("Target", [ruleText]),
  ];

  if (!isRecommended) {
    lines.push(
      CCAutomated.makeStatusLine("ETA", [isFinite(waitSeconds) ? CCAutomated.formatDuration(waitSeconds) : "Unknown"]),
    );
  }

  return {
    title: "Ascension",
    lines: lines.filter(function (line) {
      return line;
    }),
  };
};

CCAutomated.estimateBuildingCpsGain = function (object) {
  if (!object || typeof object.amount !== "number") return 0;

  let originalAmount = object.amount;
  let originalBought = object.bought;
  let originalCps = CCAutomated.getAutoBuyerPlanningCookiesPerSecond();
  let gain = 0;

  try {
    object.amount += 1;
    if (typeof object.bought === "number") object.bought += 1;
    CCAutomated.recalculateGains();
    gain = CCAutomated.getAutoBuyerPlanningCookiesPerSecond() - originalCps;
  } catch (e) {
    console.warn("[CCAutomated] Failed to estimate building purchase", object.name, e);
  } finally {
    object.amount = originalAmount;
    if (typeof originalBought !== "undefined") object.bought = originalBought;
    CCAutomated.recalculateGains();
  }

  return Math.max(0, gain);
};

CCAutomated.estimateUpgradeCpsGain = function (upgrade) {
  if (!upgrade) return 0;

  let originalBought = upgrade.bought;
  let originalCps = CCAutomated.getAutoBuyerPlanningCookiesPerSecond();
  let gain = 0;

  try {
    upgrade.bought = 1;
    CCAutomated.recalculateGains();
    gain = CCAutomated.getAutoBuyerPlanningCookiesPerSecond() - originalCps;
  } catch (e) {
    console.warn("[CCAutomated] Failed to estimate upgrade purchase", upgrade.name, e);
  } finally {
    upgrade.bought = originalBought;
    CCAutomated.recalculateGains();
  }

  return Math.max(0, gain);
};

CCAutomated.getAutoBuyerCandidates = function () {
  let candidates = [];
  let cookies = typeof Game.cookies === "number" ? Game.cookies : 0;
  let spendableCookies = CCAutomated.getAutoBuyerSpendableCookies(cookies);
  let cookiesPerSecond = CCAutomated.getAutoBuyerPlanningCookiesPerSecond();

  if (Game.ObjectsById) {
    for (let i = 0; i < Game.ObjectsById.length; i++) {
      let object = Game.ObjectsById[i];
      let price = CCAutomated.getObjectPrice(object);
      if (!isFinite(price) || price <= 0) continue;

      let gain = CCAutomated.estimateBuildingCpsGain(object);
      if (gain <= 0) continue;

      let score = CCAutomated.getAutoBuyerScore(price, gain, spendableCookies, cookiesPerSecond);
      if (!isFinite(score)) continue;
      let threshold = CCAutomated.getAutoBuyerBuildingThreshold(object);
      score *= CCAutomated.getAutoBuyerBuildingThresholdScoreMultiplier(threshold);
      let waitSeconds = CCAutomated.getAutoBuyerWaitSeconds(price, spendableCookies, cookiesPerSecond);

      candidates.push({
        type: "building",
        id: CCAutomated.getAutoBuyerCandidateId("building", object),
        item: object,
        name: object.name,
        price: price,
        gain: gain,
        realGain: gain,
        affordable: price <= spendableCookies,
        threshold: threshold,
        priority: threshold ? "milestone" : "",
        waitSeconds: waitSeconds,
        score: score,
      });
    }
  }

  if (Game.UpgradesInStore) {
    for (let j = 0; j < Game.UpgradesInStore.length; j++) {
      let upgrade = Game.UpgradesInStore[j];
      if (!CCAutomated.isUpgradeCandidate(upgrade)) continue;

      let upgradePrice = CCAutomated.getUpgradePrice(upgrade);
      if (!isFinite(upgradePrice) || upgradePrice <= 0) continue;

      let realUpgradeGain = CCAutomated.estimateUpgradeCpsGain(upgrade);
      let upgradeGain = realUpgradeGain;
      let priority = CCAutomated.getUpgradePriority(upgrade);
      if (upgradeGain <= 0) upgradeGain = CCAutomated.getStrategicUpgradeMinimumGain(upgrade);
      if (upgradeGain <= 0) continue;

      let upgradeScore = CCAutomated.getAutoBuyerScore(upgradePrice, upgradeGain, spendableCookies, cookiesPerSecond);
      if (!isFinite(upgradeScore)) continue;
      upgradeScore *= priority.multiplier;
      let upgradeWaitSeconds = CCAutomated.getAutoBuyerWaitSeconds(upgradePrice, spendableCookies, cookiesPerSecond);

      candidates.push({
        type: "upgrade",
        id: CCAutomated.getAutoBuyerCandidateId("upgrade", upgrade),
        item: upgrade,
        name: upgrade.name,
        price: upgradePrice,
        gain: upgradeGain,
        realGain: realUpgradeGain,
        affordable: upgradePrice <= spendableCookies,
        priority: priority.label,
        waitSeconds: upgradeWaitSeconds,
        score: upgradeScore,
      });
    }
  }

  return candidates;
};

CCAutomated.getBestAutoBuyerCandidate = function () {
  let candidates = CCAutomated.getAutoBuyerCandidates();
  let strategy = CCAutomated.getAutoBuyerStrategy();
  let best = null;
  let bestAffordable = null;
  let bestWithinWait = null;

  for (let i = 0; i < candidates.length; i++) {
    let purchaseReady = candidates[i].affordable && CCAutomated.canBuyDuringCombo(candidates[i]);
    if (!best || candidates[i].score < best.score) best = candidates[i];
    if (purchaseReady && (!bestAffordable || candidates[i].score < bestAffordable.score))
      bestAffordable = candidates[i];
    if (
      candidates[i].waitSeconds <= strategy.maxWaitSeconds &&
      (!bestWithinWait || candidates[i].score < bestWithinWait.score)
    )
      bestWithinWait = candidates[i];
  }

  if (!strategy.allowSaving) return bestAffordable;
  return bestWithinWait || bestAffordable || best;
};

CCAutomated.isAutoBuyerTargetValid = function (candidate) {
  if (!candidate || !candidate.item) return false;

  if (candidate.type === "building") {
    return isFinite(CCAutomated.getObjectPrice(candidate.item));
  }
  if (candidate.type === "upgrade") {
    return CCAutomated.isUpgradeCandidate(candidate.item);
  }

  return false;
};

CCAutomated.updateAutoBuyerTargetPrice = function (candidate) {
  if (!candidate) return null;

  let cookies = typeof Game.cookies === "number" ? Game.cookies : 0;
  let spendableCookies = CCAutomated.getAutoBuyerSpendableCookies(cookies);
  if (candidate.type === "building") {
    candidate.price = CCAutomated.getObjectPrice(candidate.item);
  } else if (candidate.type === "upgrade") {
    candidate.price = CCAutomated.getUpgradePrice(candidate.item);
  }

  candidate.affordable = candidate.price <= spendableCookies;
  candidate.waitSeconds = CCAutomated.getAutoBuyerWaitSeconds(
    candidate.price,
    spendableCookies,
    CCAutomated.getAutoBuyerPlanningCookiesPerSecond(),
  );
  return candidate;
};

CCAutomated.getAutoBuyerCandidatePayoutAfterPurchase = function (candidate) {
  if (!candidate) return null;

  let cookies = typeof Game.cookies === "number" ? Game.cookies : 0;
  let currentCookiesPerSecond = CCAutomated.getCookiesPerSecond();
  let realGain = typeof candidate.realGain === "number" ? candidate.realGain : candidate.gain;
  let buffMultiplier = CCAutomated.getCpsMultiplier();
  let afterCookies = Math.max(0, cookies - candidate.price);
  let afterCookiesPerSecond = currentCookiesPerSecond + realGain * buffMultiplier;

  return {
    before: CCAutomated.getLuckyReward(cookies, currentCookiesPerSecond),
    after: CCAutomated.getLuckyReward(afterCookies, afterCookiesPerSecond),
  };
};

CCAutomated.canBuyDuringCombo = function (candidate) {
  if (!CCAutomated.isStrongComboActive()) return true;
  if (!candidate || !candidate.affordable) return false;

  let payout = CCAutomated.getAutoBuyerCandidatePayoutAfterPurchase(candidate);
  if (!payout) return false;

  if (CCAutomated.isHugeComboActive() && candidate.priority !== "clicking") {
    return payout.after >= payout.before;
  }

  return payout.after >= payout.before * CCAutomated.AutoBuyer.comboPayoutTolerance;
};

CCAutomated.joinStatusParts = function (parts) {
  let filtered = [];

  for (let i = 0; i < parts.length; i++) {
    if (parts[i]) filtered.push(parts[i]);
  }

  return filtered.join(" | ");
};

CCAutomated.makeStatusLine = function (label, parts) {
  let value = CCAutomated.joinStatusParts(parts);
  if (!value) return null;

  return {
    label: label,
    value: value,
  };
};

CCAutomated.formatComboMultiplier = function (multiplier) {
  if (!isFinite(multiplier)) return "?";
  if (multiplier >= 100) return CCAutomated.formatNumber(multiplier) + "x";
  if (multiplier >= 10) return Math.round(multiplier * 10) / 10 + "x";
  return Math.round(multiplier * 100) / 100 + "x";
};

CCAutomated.getComboStatusText = function (combo) {
  if (!combo) combo = CCAutomated.getActiveComboBuffInfo();
  if (combo.count <= 0) return "No active buffs";

  let multiplierText = CCAutomated.formatComboMultiplier(combo.multiplier) + " CpS";
  if (combo.count === 1) return combo.names[0] + " active, " + multiplierText;

  if (CCAutomated.isHugeComboActive()) return combo.count + " buffs active, huge combo at " + multiplierText;
  if (CCAutomated.isStrongComboActive()) return combo.count + " buffs active, strong combo at " + multiplierText;
  return combo.count + " buffs active, " + multiplierText;
};

CCAutomated.getLuckyBankStatusText = function () {
  let cookies = typeof Game.cookies === "number" ? Game.cookies : 0;
  let cookiesPerSecond = CCAutomated.isStrongComboActive()
    ? CCAutomated.getCookiesPerSecond()
    : CCAutomated.getBaseCookiesPerSecond();
  let target = CCAutomated.getLuckyBankTarget(cookiesPerSecond);
  let shortfall = Math.max(0, target - cookies);

  return {
    target: target,
    shortfall: shortfall,
    text: shortfall > 0 ? "Need " + CCAutomated.formatNumber(shortfall) + " more cookies" : "Full; extra cookies are safe",
  };
};

CCAutomated.getComboStatus = function () {
  let combo = CCAutomated.getActiveComboBuffInfo();
  let shimmers = CCAutomated.getGoldenShimmerInfo();
  let lucky = CCAutomated.getLuckyBankStatusText();
  let goldenAutoClicking = CCAutomated.Config.GoldenCookies > 0;
  let shimmerText = "";
  if (shimmers.stormDrops > 0) shimmerText += ", " + shimmers.stormDrops + " storm drops";
  if (shimmers.forced > 0) shimmerText += ", " + shimmers.forced + " forced";
  if (shimmerText) shimmerText = shimmers.total + " visible" + shimmerText;
  else shimmerText = shimmers.total > 0 ? shimmers.total + " visible" : "None visible";
  let luckyBankText =
    lucky.shortfall > 0 ? lucky.text + " for max Lucky payout" : "Full Lucky bank; extra cookies are safe";

  let lines = [
    CCAutomated.makeStatusLine("Status", [CCAutomated.getComboStatusText(combo)]),
    CCAutomated.makeStatusLine("Time", [
      combo.secondsLeft > 0 ? CCAutomated.formatDuration(combo.secondsLeft) + " remaining" : "",
    ]),
    CCAutomated.makeStatusLine("Golden", [goldenAutoClicking ? "" : shimmerText]),
    CCAutomated.makeStatusLine("Lucky bank", [
      luckyBankText,
      "target " + CCAutomated.formatNumber(lucky.target),
    ]),
  ];

  return {
    title: "Combo",
    lines: lines.filter(function (line) {
      return line;
    }),
  };
};

CCAutomated.getSpellCost = function (grimoire, spell) {
  if (!grimoire || !spell || typeof grimoire.getSpellCost !== "function") return Infinity;
  try {
    return grimoire.getSpellCost(spell);
  } catch (e) {
    return Infinity;
  }
};

CCAutomated.getGrimoireStatus = function () {
  if (CCAutomated.Config.Grimoire === 0) {
    return {
      title: "Grimoire",
      lines: [{ label: "Status", value: "Inactive" }],
    };
  }

  let grimoire = CCAutomated.getGrimoire();
  if (!grimoire) {
    return {
      title: "Grimoire",
      lines: [{ label: "Status", value: "Wizard tower minigame not ready" }],
    };
  }

  let spell = grimoire.spells && grimoire.spells["hand of fate"];
  let cost = CCAutomated.getSpellCost(grimoire, spell);
  let magic = typeof grimoire.magic === "number" ? grimoire.magic : 0;
  let maxMagic = typeof grimoire.magicM === "number" ? grimoire.magicM : null;
  let combo = CCAutomated.getActiveComboBuffInfo();
  let shimmers = CCAutomated.getGoldenShimmerInfo();
  let canAfford = magic >= cost;
  let statusText = "Waiting for combo";

  if (!spell) statusText = "Force the Hand of Fate unavailable";
  else if (!canAfford) statusText = "Need magic";
  else if (shimmers.total > 0) statusText = "Blocked by visible golden cookie";
  else if (CCAutomated.isStrongComboActive()) statusText = "Ready to cast";

  let lines = [
    CCAutomated.makeStatusLine("Status", [statusText]),
    CCAutomated.makeStatusLine("Magic", [
      CCAutomated.formatNumber(magic) +
        (maxMagic !== null ? " / " + CCAutomated.formatNumber(maxMagic) : ""),
      isFinite(cost) ? "FtHoF costs " + CCAutomated.formatNumber(cost) : "",
    ]),
    CCAutomated.makeStatusLine("Combo", [
      CCAutomated.getComboStatusText(combo),
      CCAutomated.formatComboMultiplier(combo.multiplier),
    ]),
    CCAutomated.makeStatusLine("Golden", [shimmers.total > 0 ? shimmers.total + " visible" : "None visible"]),
  ];

  return {
    title: "Grimoire",
    lines: lines.filter(function (line) {
      return line;
    }),
  };
};

CCAutomated.getAutoBuyerBankStatus = function () {
  let manualReserve = CCAutomated.getAutoBuyerReserveCookies();
  let strategicReserve = CCAutomated.getStrategicBankReserveCookies();
  let totalReserve = manualReserve + strategicReserve;
  let reasons = [];

  if (manualReserve > 0) reasons.push("manual reserve");
  if (strategicReserve > 0) reasons.push("lucky payouts");

  if (totalReserve <= 0) return "Not keeping extra cookies";
  return "Keeping " + CCAutomated.formatNumber(totalReserve) + " for " + reasons.join(" and ");
};

CCAutomated.getGardenActionText = function () {
  if (!CCAutomated.Garden.lastAction) return "";
  let ageSeconds = (Date.now() - CCAutomated.Garden.lastActionAt) / 1000;
  if (ageSeconds > 300) return "";
  return CCAutomated.Garden.lastAction;
};

CCAutomated.getGardenStatus = function () {
  if (CCAutomated.Config.Garden === 0) {
    return {
      title: "Garden",
      lines: [{ label: "Status", value: "Inactive" }],
    };
  }

  let summary = CCAutomated.getGardenSummary();
  if (!summary.ready) {
    return {
      title: "Garden",
      lines: [{ label: "Status", value: "Farm minigame not ready" }],
    };
  }

  let modeText = CCAutomated.ConfigData.Garden.label[CCAutomated.Config.Garden];
  let stateText = summary.frozen ? "Frozen" : "Growing";
  let plantText = summary.planted + " planted";
  if (summary.mature > 0) plantText += ", " + summary.mature + " mature";
  let comboText =
    summary.comboReady > 0
      ? summary.comboReady + " combo harvest ready"
      : summary.comboGrowing > 0
        ? summary.comboGrowing + " combo plants growing"
        : "No combo harvest plants";
  let targetSoil = CCAutomated.getGardenTargetSoil(summary);

  let lines = [
    CCAutomated.makeStatusLine("Status", [modeText, stateText]),
    CCAutomated.makeStatusLine("Plants", [plantText]),
    CCAutomated.makeStatusLine("Combo", [comboText]),
    CCAutomated.makeStatusLine("Soil", [
      summary.soil || "Unknown",
      CCAutomated.Config.Garden >= 2 && targetSoil ? "target " + targetSoil : "",
    ]),
    CCAutomated.makeStatusLine("Action", [CCAutomated.getGardenActionText()]),
  ];

  return {
    title: "Garden",
    lines: lines.filter(function (line) {
      return line;
    }),
  };
};

CCAutomated.getPantheonActionText = function () {
  if (!CCAutomated.Pantheon.lastAction) return "";
  let ageSeconds = (Date.now() - CCAutomated.Pantheon.lastActionAt) / 1000;
  if (ageSeconds > 300) return "";
  return CCAutomated.Pantheon.lastAction;
};

CCAutomated.getPantheonStatus = function () {
  if (CCAutomated.Config.Pantheon === 0) {
    return {
      title: "Pantheon",
      lines: [{ label: "Status", value: "Inactive" }],
    };
  }

  let pantheon = CCAutomated.getPantheon();
  if (!pantheon) {
    return {
      title: "Pantheon",
      lines: [{ label: "Status", value: "Temple minigame not ready" }],
    };
  }

  let godzamokSlot = CCAutomated.getPantheonGodSlotMatching(pantheon, CCAutomated.Pantheon.godzamokPattern);
  let skruuiaSlot = CCAutomated.getSkruuiaSlot();
  let clickSecondsLeft = CCAutomated.getClickComboSecondsLeft();
  let sellable = CCAutomated.getTotalGodzamokSellableBuildings();
  let wrinklers = CCAutomated.getWrinklerSummary();
  let statusText = "Waiting for click combo";
  let wrinklerText = wrinklers.attached + " attached";

  if (godzamokSlot < 0) statusText = "Godzamok not slotted";
  else if (CCAutomated.hasGodzamokBuff()) statusText = "Godzamok buff active";
  else if (clickSecondsLeft > 2 && sellable > 0) statusText = "Ready to sell";
  else if (clickSecondsLeft > 0 && sellable <= 0) statusText = "No low-value buildings to sell";

  if (wrinklers.shiny > 0) wrinklerText += ", " + wrinklers.shiny + " shiny";
  if (CCAutomated.Config.Wrinklers === 0) wrinklerText += ", automation off";
  else if (skruuiaSlot >= 0) wrinklerText += ", Skruuia bonus active";
  else if (wrinklers.attached > 0) wrinklerText += ", holding for Skruuia";

  let lines = [
    CCAutomated.makeStatusLine("Status", [statusText]),
    CCAutomated.makeStatusLine("God", [
      godzamokSlot >= 0 ? CCAutomated.getPantheonSlotLabel(godzamokSlot) + " slot" : "Not slotted",
    ]),
    CCAutomated.makeStatusLine("Skruuia", [
      skruuiaSlot >= 0 ? CCAutomated.getPantheonSlotLabel(skruuiaSlot) + " slot" : "Not slotted",
    ]),
    CCAutomated.makeStatusLine("Wrinklers", [wrinklerText]),
    CCAutomated.makeStatusLine("Combo", [
      clickSecondsLeft > 0 ? "Click buff for " + CCAutomated.formatDuration(clickSecondsLeft) : "No click buff",
    ]),
    CCAutomated.makeStatusLine("Sellable", [sellable + " buildings"]),
    CCAutomated.makeStatusLine("Action", [CCAutomated.getPantheonActionText()]),
  ];

  return {
    title: "Pantheon",
    lines: lines.filter(function (line) {
      return line;
    }),
  };
};

CCAutomated.getSeasonActionText = function () {
  if (!CCAutomated.Season.lastAction) return "";
  let ageSeconds = (Date.now() - CCAutomated.Season.lastActionAt) / 1000;
  if (ageSeconds > 300) return "";
  return CCAutomated.Season.lastAction;
};

CCAutomated.getSeasonName = function () {
  if (Game.season) return Game.season;
  return "none";
};

CCAutomated.getSeasonStatus = function () {
  if (CCAutomated.Config.Season === 0) {
    return {
      title: "Seasons",
      lines: [{ label: "Status", value: "Inactive" }],
    };
  }

  let seasonName = CCAutomated.getSeasonName();
  if (seasonName === "none") {
    return {
      title: "Seasons",
      lines: [{ label: "Status", value: "No season active" }],
    };
  }

  let reindeer = CCAutomated.getReindeerShimmerInfo();
  let candidates = CCAutomated.getSeasonUpgradeCandidates();
  let affordable = CCAutomated.getBestAffordableSeasonUpgrade();
  let nextUpgrade = affordable || candidates[0] || null;
  let statusText = seasonName + ": watching for reindeer";

  if (reindeer.total > 0) statusText = seasonName + ": clicking reindeer";
  else if (CCAutomated.Config.Season >= 2 && affordable) statusText = seasonName + ": buying " + affordable.name;
  else if (CCAutomated.Config.Season >= 2 && nextUpgrade) statusText = seasonName + ": saving for " + nextUpgrade.name;
  else if (CCAutomated.Config.Season >= 2) statusText = seasonName + ": watching for seasonal drops";

  let upgradeText = nextUpgrade
    ? nextUpgrade.name + " (" + CCAutomated.formatNumber(nextUpgrade.price) + ")"
    : "None visible";

  let lines = [
    CCAutomated.makeStatusLine("Status", [statusText]),
    CCAutomated.makeStatusLine("Reindeer", [reindeer.total + " visible"]),
    CCAutomated.makeStatusLine("Upgrade", [upgradeText]),
    CCAutomated.makeStatusLine("Action", [CCAutomated.getSeasonActionText()]),
  ];

  return {
    title: "Seasons",
    lines: lines.filter(function (line) {
      return line;
    }),
  };
};

CCAutomated.getAutoBuyerStatus = function () {
  if (CCAutomated.Config.AutoBuyer === 0) {
    return {
      title: "Auto-buyer",
      lines: [{ label: "Status", value: "Inactive" }],
    };
  }

  let candidate = CCAutomated.updateAutoBuyerTargetPrice(CCAutomated.AutoBuyer.target);
  if (!candidate) {
    return {
      title: "Auto-buyer",
      lines: [
        {
          label: "Status",
          value: CCAutomated.getAutoBuyerStrategy().allowSaving ? "Scanning for target" : "No affordable target",
        },
      ].filter(function (line) {
        return line;
      }),
    };
  }

  let cookies = typeof Game.cookies === "number" ? Game.cookies : 0;
  let spendableCookies = CCAutomated.getAutoBuyerSpendableCookies(cookies);
  let cookiesPerSecond = CCAutomated.getAutoBuyerPlanningCookiesPerSecond();
  let waitSeconds = CCAutomated.getAutoBuyerWaitSeconds(candidate.price, spendableCookies, cookiesPerSecond);
  let displayGain = typeof candidate.realGain === "number" ? candidate.realGain : candidate.gain;
  let canBuyNow = candidate.affordable && CCAutomated.canBuyDuringCombo(candidate);
  let isHoldingForCombo =
    candidate.affordable && CCAutomated.isStrongComboActive() && !CCAutomated.canBuyDuringCombo(candidate);
  let statusText = canBuyNow ? "Ready to buy" : "Waiting for " + CCAutomated.formatDuration(waitSeconds);
  let gainText = displayGain > 0 ? "+" + CCAutomated.formatNumber(displayGain) + " CpS" : "";
  if (displayGain === 0 && candidate.priority) gainText = "Strategic upgrade";
  if (isHoldingForCombo) statusText = "Waiting because buying now would reduce combo payout";

  let lines = [
    CCAutomated.makeStatusLine("Status", [statusText]),
    CCAutomated.makeStatusLine("Target", [candidate.name + " (" + candidate.type + ")"]),
    CCAutomated.makeStatusLine("Value", [gainText]),
    CCAutomated.makeStatusLine("Bank", [CCAutomated.getAutoBuyerBankStatus()]),
  ];

  return {
    title: "Auto-buyer",
    lines: lines.filter(function (line) {
      return line;
    }),
  };
};

CCAutomated.shouldRefreshAutoBuyerTarget = function () {
  let now = Date.now();
  let cookiesPerSecond = CCAutomated.getAutoBuyerPlanningCookiesPerSecond();
  let storeSignature = CCAutomated.getAutoBuyerStoreSignature();
  let previousCookiesPerSecond = CCAutomated.AutoBuyer.lastCookiesPerSecond;

  if (!CCAutomated.isAutoBuyerTargetValid(CCAutomated.AutoBuyer.target)) return true;
  if (now - CCAutomated.AutoBuyer.lastRefresh >= CCAutomated.AutoBuyer.refreshMs) return true;
  if (storeSignature !== CCAutomated.AutoBuyer.lastStoreSignature) return true;
  if (previousCookiesPerSecond <= 0 && cookiesPerSecond > 0) return true;
  if (
    previousCookiesPerSecond > 0 &&
    Math.abs(cookiesPerSecond - previousCookiesPerSecond) / previousCookiesPerSecond >=
      CCAutomated.AutoBuyer.cpsRefreshRatio
  )
    return true;

  return false;
};

CCAutomated.refreshAutoBuyerTarget = function () {
  CCAutomated.AutoBuyer.target = CCAutomated.getBestAutoBuyerCandidate();
  CCAutomated.AutoBuyer.lastRefresh = Date.now();
  CCAutomated.AutoBuyer.lastCookiesPerSecond = CCAutomated.getAutoBuyerPlanningCookiesPerSecond();
  CCAutomated.AutoBuyer.lastStoreSignature = CCAutomated.getAutoBuyerStoreSignature();
};

CCAutomated.buyAutoBuyerCandidate = function (candidate) {
  if (!candidate || !candidate.affordable) return false;
  if (!CCAutomated.canBuyDuringCombo(candidate)) return false;

  try {
    if (candidate.type === "building" && candidate.item && typeof candidate.item.buy === "function") {
      if (CCAutomated.getObjectPrice(candidate.item) > CCAutomated.getAutoBuyerSpendableCookies(Game.cookies))
        return false;
      if (!CCAutomated.canBuyDuringCombo(candidate)) return false;
      candidate.item.buy(1);
      return true;
    }
    if (candidate.type === "upgrade" && candidate.item && typeof candidate.item.buy === "function") {
      if (CCAutomated.getUpgradePrice(candidate.item) > CCAutomated.getAutoBuyerSpendableCookies(Game.cookies))
        return false;
      if (typeof candidate.item.canBuy === "function" && !candidate.item.canBuy()) return false;
      if (!CCAutomated.canBuyDuringCombo(candidate)) return false;
      candidate.item.buy();
      return true;
    }
  } catch (e) {
    console.warn("[CCAutomated] Failed to auto-buy", candidate.name, e);
  }

  return false;
};

// Handle buying or saving for the best building or upgrade
CCAutomated.handleAutoBuyer = function () {
  if (CCAutomated.Config.AutoBuyer === 0) return;

  if (CCAutomated.shouldRefreshAutoBuyerTarget()) {
    CCAutomated.refreshAutoBuyerTarget();
  }

  let candidate = CCAutomated.updateAutoBuyerTargetPrice(CCAutomated.AutoBuyer.target);
  if (CCAutomated.buyAutoBuyerCandidate(candidate)) {
    CCAutomated.AutoBuyer.target = null;
  }
};

CCAutomated.stop = function () {
  for (let key in CCAutomated.Intervals) {
    clearInterval(CCAutomated.Intervals[key]);
  }
  CCAutomated.Intervals = {};

  if (CCAutomated.ConfigBackup && CCAutomated.ConfigBackup.UpdateMenu) {
    Game.UpdateMenu = CCAutomated.ConfigBackup.UpdateMenu;
  }
};

CCAutomated.start = function () {
  CCAutomated.loadConfig();
  CCAutomated.Intervals.autoClicker = setInterval(CCAutomated.handleAutoClicker, CCAutomated.IntervalMs.autoClicker);
  CCAutomated.Intervals.goldenCookieClicker = setInterval(
    CCAutomated.handleGoldenCookies,
    CCAutomated.IntervalMs.goldenCookieClicker,
  );
  CCAutomated.Intervals.wrinklerClicker = setInterval(
    CCAutomated.handleWrinklers,
    CCAutomated.IntervalMs.wrinklerClicker,
  );
  CCAutomated.Intervals.grimoire = setInterval(CCAutomated.handleGrimoire, CCAutomated.IntervalMs.grimoire);
  CCAutomated.Intervals.garden = setInterval(CCAutomated.handleGarden, CCAutomated.IntervalMs.garden);
  CCAutomated.Intervals.pantheon = setInterval(CCAutomated.handlePantheon, CCAutomated.IntervalMs.pantheon);
  CCAutomated.Intervals.season = setInterval(CCAutomated.handleSeason, CCAutomated.IntervalMs.season);
  CCAutomated.Intervals.autoBuyer = setInterval(CCAutomated.handleAutoBuyer, CCAutomated.IntervalMs.autoBuyer);
};

// Start Cookie Clicker Automated
CCAutomated.start();
