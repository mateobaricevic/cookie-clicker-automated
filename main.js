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

CCAutomated.ConfigDefault = {
  AutoClicker: 0,
  GoldenCookies: 0,
  Wrinklers: 0,
  Grimoire: 0,
  AutoBuyer: 0,
  AutoBuyerStrategy: 1,
  AutoBuyerReserve: 0,
};

CCAutomated.ConfigData.AutoClicker = {
  label: ["OFF", "ON"],
  description: "Auto-clicker for the Big Cookie",
};
CCAutomated.ConfigData.GoldenCookies = {
  label: ["OFF", "ON"],
  description: "Auto-clicker for Golden Cookies",
};
CCAutomated.ConfigData.Wrinklers = {
  label: ["OFF", "ON"],
  description: "Auto-clicker for Wrinklers",
};
CCAutomated.ConfigData.Grimoire = {
  label: ["OFF", "ON"],
  description: "Automated use of spells from Wizard Towers: Grimoire",
};
CCAutomated.ConfigData.AutoBuyer = {
  label: ["OFF", "ON"],
  description: "Auto-buy or save for the best building or upgrade by estimated payoff time",
};
CCAutomated.ConfigData.AutoBuyerStrategy = {
  label: ["ROI", "Balanced", "Long", "Now"],
  strategy: [
    {
      maxWaitSeconds: 300,
      buildingThresholdScoreMultiplier: 1,
      majorBuildingThresholdScoreMultiplier: 0.9,
      allowSaving: true,
      luckyBankRatio: 0.25,
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
  description: "Auto-buyer strategy",
};
CCAutomated.ConfigData.AutoBuyerReserve = {
  label: ["OFF", "5 min", "10 min", "30 min", "1 hour"],
  reserveSeconds: [0, 300, 600, 1800, 3600],
  description: "Cookie bank reserved from auto-buyer spending",
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
    CCAutomated.Config = storedConfig ? JSON.parse(storedConfig) : {};

    let modified = !storedConfig;
    for (let i in CCAutomated.ConfigDefault) {
      if (
        typeof CCAutomated.Config[i] === "undefined" ||
        CCAutomated.Config[i] < 0 ||
        CCAutomated.Config[i] >= CCAutomated.ConfigData[i].label.length
      ) {
        modified = true;
        CCAutomated.Config[i] = CCAutomated.ConfigDefault[i];
      }
    }
    if (modified) CCAutomated.saveConfig(CCAutomated.Config);
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
  if (config === "AutoBuyer" || config === "AutoBuyerStrategy" || config === "AutoBuyerReserve")
    CCAutomated.AutoBuyer.target = null;
  CCAutomated.saveConfig(CCAutomated.Config);
};

CCAutomated.isConfigEntryOff = function (config) {
  return CCAutomated.Config[config] === 0 && CCAutomated.ConfigData[config].label[0] === "OFF";
};

CCAutomated.ConfigDisplay.displayMenu = function () {
  let frag = document.createDocumentFragment();
  let subsection = document.createElement("div");
  subsection.className = "subsection";
  subsection.style.padding = "0px";
  frag.appendChild(subsection);

  let div = document.createElement("div");
  div.className = "title";
  div.textContent = "Cookie Clicker Automated Settings";
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
    label.textContent = CCAutomated.ConfigData[config].description;
    div.appendChild(label);
    return div;
  };
  for (let config in CCAutomated.ConfigDefault) {
    subsection.appendChild(listing(config));
  }
  subsection.appendChild(CCAutomated.ConfigDisplay.autoBuyerStatus());

  let menu = l("menu");
  let menuContent = menu && menu.childNodes[2];
  if (!menuContent) return;
  menuContent.insertBefore(frag, menuContent.childNodes[menuContent.childNodes.length - 1]);
};

CCAutomated.ConfigDisplay.autoBuyerStatus = function () {
  let div = document.createElement("div");
  div.className = "listing";
  div.style.opacity = "0.75";
  div.style.lineHeight = "140%";

  let status = CCAutomated.getAutoBuyerStatus();
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

if (!CCAutomated.ConfigBackup.UpdateMenu) CCAutomated.ConfigBackup.UpdateMenu = Game.UpdateMenu;

Game.UpdateMenu = function () {
  CCAutomated.ConfigBackup.UpdateMenu();
  if (Game.onMenu === "prefs") CCAutomated.ConfigDisplay.displayMenu();
};

// Handle auto clicking Big Cookie
CCAutomated.clickBigCookie = function () {
  if (typeof Game.ClickCookie === "function") {
    Game.ClickCookie();
    return;
  }

  let cookie = l("bigCookie");
  if (cookie && typeof cookie.click === "function") cookie.click();
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

CCAutomated.getActiveComboBuffInfo = function () {
  let info = {
    count: 0,
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
  return grimoire && spell && grimoire.magic >= grimoire.getSpellCost(spell);
};

CCAutomated.shouldCastForceHandOfFate = function (grimoire, spell) {
  if (!CCAutomated.canCastSpell(grimoire, spell)) return false;

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

// Handle Wizard towers: Grimoire minigame
CCAutomated.handleGrimoire = function () {
  if (CCAutomated.Config.Grimoire === 0) return;
  if (Game.isMinigameReady(Game.Objects["Wizard tower"])) {
    let grimoire = Game.Objects["Wizard tower"].minigame;
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
  let strategyConfig = CCAutomated.Config.AutoBuyerStrategy || 0;
  return (
    CCAutomated.ConfigData.AutoBuyerStrategy.strategy[strategyConfig] ||
    CCAutomated.ConfigData.AutoBuyerStrategy.strategy[0]
  );
};

CCAutomated.getAutoBuyerReserveSeconds = function () {
  let reserveConfig = CCAutomated.Config.AutoBuyerReserve || 0;
  return CCAutomated.ConfigData.AutoBuyerReserve.reserveSeconds[reserveConfig] || 0;
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

CCAutomated.formatAutoBuyerTime = function (seconds) {
  if (!isFinite(seconds) || seconds <= 0) return "now";
  if (seconds < 60) return Math.ceil(seconds) + "s";
  if (seconds < 3600) return Math.ceil(seconds / 60) + "m";
  return Math.ceil(seconds / 3600) + "h";
};

CCAutomated.formatAutoBuyerDuration = function (seconds) {
  if (!isFinite(seconds) || seconds <= 0) return "now";

  seconds = Math.ceil(seconds);
  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds % 3600) / 60);
  let remainingSeconds = seconds % 60;
  let parts = [];

  if (hours) parts.push(hours + "h");
  if (minutes || hours) parts.push(minutes + "m");
  parts.push(remainingSeconds + "s");

  return parts.join(" ");
};

CCAutomated.formatAutoBuyerNumber = function (value) {
  if (!isFinite(value)) return "?";
  if (typeof Beautify === "function") return Beautify(value);
  if (Math.abs(value) >= 1000000) return value.toExponential(2);
  if (Math.abs(value) >= 1000) return Math.round(value).toLocaleString();
  if (Math.abs(value) >= 10) return Math.round(value).toString();
  return value.toFixed(2);
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

CCAutomated.joinAutoBuyerStatusParts = function (parts) {
  let filtered = [];

  for (let i = 0; i < parts.length; i++) {
    if (parts[i]) filtered.push(parts[i]);
  }

  return filtered.join(" | ");
};

CCAutomated.makeAutoBuyerStatusLine = function (label, parts) {
  let value = CCAutomated.joinAutoBuyerStatusParts(parts);
  if (!value) return null;

  return {
    label: label,
    value: value,
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
  return "Keeping " + CCAutomated.formatAutoBuyerNumber(totalReserve) + " for " + reasons.join(" and ");
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
      ],
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
  let statusText = canBuyNow ? "Ready to buy" : "Waiting for " + CCAutomated.formatAutoBuyerDuration(waitSeconds);
  let gainText = displayGain > 0 ? "+" + CCAutomated.formatAutoBuyerNumber(displayGain) + " CpS" : "";
  if (displayGain === 0 && candidate.priority) gainText = "Strategic upgrade";
  if (isHoldingForCombo) statusText = "Waiting because buying now would reduce combo payout";

  let lines = [
    CCAutomated.makeAutoBuyerStatusLine("Target", [candidate.name + " (" + candidate.type + ")"]),
    CCAutomated.makeAutoBuyerStatusLine("Value", [gainText]),
    CCAutomated.makeAutoBuyerStatusLine("Status", [statusText]),
    CCAutomated.makeAutoBuyerStatusLine("Bank", [CCAutomated.getAutoBuyerBankStatus()]),
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
  CCAutomated.Intervals.autoBuyer = setInterval(CCAutomated.handleAutoBuyer, CCAutomated.IntervalMs.autoBuyer);
};

// Start Cookie Clicker Automated
CCAutomated.start();
