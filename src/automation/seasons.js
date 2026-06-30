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

CCAutomated.normalizeSeasonName = function (seasonName) {
  if (!seasonName) return "none";
  return seasonName.toString().toLowerCase();
};

CCAutomated.getUpgradeByName = function (name) {
  if (!name || !Game.Upgrades) return null;
  return Game.Upgrades[name] || null;
};

CCAutomated.addUniqueUpgradeName = function (names, name) {
  if (!name || names.indexOf(name) !== -1) return;
  names.push(name);
};

CCAutomated.addSeasonDropNamesFromList = function (names, list) {
  if (!list || typeof list.length !== "number") return;

  for (let i = 0; i < list.length; i++) {
    let item = list[i];
    if (typeof item === "string") CCAutomated.addUniqueUpgradeName(names, item);
    else if (item && item.name) CCAutomated.addUniqueUpgradeName(names, item.name);
  }
};

CCAutomated.addSeasonDropNamesFromPool = function (names, pool) {
  if (!pool) return;

  let upgradesByPool = Game.UpgradesByPool && Game.UpgradesByPool[pool];
  CCAutomated.addSeasonDropNamesFromList(names, upgradesByPool);

  if (!Game.UpgradesById) return;
  for (let i = 0; i < Game.UpgradesById.length; i++) {
    let upgrade = Game.UpgradesById[i];
    if (upgrade && upgrade.pool === pool) CCAutomated.addUniqueUpgradeName(names, upgrade.name);
  }
};

CCAutomated.getSeasonDropDefinitions = function (seasonName) {
  let season = CCAutomated.normalizeSeasonName(seasonName);
  let definitions = [];

  for (let i = 0; i < CCAutomated.Season.dropDefinitions.length; i++) {
    if (CCAutomated.Season.dropDefinitions[i].season === season) definitions.push(CCAutomated.Season.dropDefinitions[i]);
  }

  return definitions;
};

CCAutomated.getSeasonDropNames = function (definition) {
  let names = [];
  if (!definition) return names;

  if (definition.gameList && Game[definition.gameList]) {
    CCAutomated.addSeasonDropNamesFromList(names, Game[definition.gameList]);
  }

  if (names.length === 0) {
    CCAutomated.addSeasonDropNamesFromPool(names, definition.pool);
  }

  if (names.length === 0) {
    CCAutomated.addSeasonDropNamesFromList(names, definition.fallbackNames);
  }

  return names.filter(function (name) {
    return !!CCAutomated.getUpgradeByName(name);
  });
};

CCAutomated.getSeasonDropSummary = function (seasonName) {
  let definitions = CCAutomated.getSeasonDropDefinitions(seasonName);
  let summary = {
    season: CCAutomated.normalizeSeasonName(seasonName),
    categories: [],
    total: 0,
    owned: 0,
    missing: 0,
  };

  for (let i = 0; i < definitions.length; i++) {
    let definition = definitions[i];
    let names = CCAutomated.getSeasonDropNames(definition);
    let category = {
      id: definition.id,
      label: definition.label,
      total: names.length,
      owned: 0,
      missing: 0,
      missingNames: [],
    };

    for (let j = 0; j < names.length; j++) {
      let upgrade = CCAutomated.getUpgradeByName(names[j]);
      if (upgrade && upgrade.bought) category.owned++;
      else category.missingNames.push(names[j]);
    }

    category.missing = Math.max(0, category.total - category.owned);
    summary.total += category.total;
    summary.owned += category.owned;
    summary.missing += category.missing;
    if (category.total > 0) summary.categories.push(category);
  }

  return summary;
};

CCAutomated.getSeasonDropStatusText = function (summary) {
  if (!summary || summary.total <= 0) return "No tracked drops";

  let parts = [];
  for (let i = 0; i < summary.categories.length; i++) {
    let category = summary.categories[i];
    let text = category.label + " " + category.owned + "/" + category.total;
    if (category.missingNames.length > 0) {
      text += ", missing " + category.missingNames.slice(0, 3).join(", ");
      if (category.missingNames.length > 3) text += ", +" + (category.missingNames.length - 3);
    }
    parts.push(text);
  }

  return parts.join("; ");
};

CCAutomated.getSeasonSwitchTarget = function (upgrade) {
  if (!upgrade || !upgrade.name) return "";

  for (let i = 0; i < CCAutomated.Season.switchUpgrades.length; i++) {
    let switchUpgrade = CCAutomated.Season.switchUpgrades[i];
    if (upgrade.name.toLowerCase() === switchUpgrade.name.toLowerCase()) return switchUpgrade.season;
  }

  return "";
};

CCAutomated.shouldHoldSeasonSwitchUpgrade = function (upgrade) {
  let targetSeason = CCAutomated.getSeasonSwitchTarget(upgrade);
  if (!targetSeason) return false;

  let currentSeason = CCAutomated.normalizeSeasonName(CCAutomated.getSeasonName());
  if (currentSeason === "none" || currentSeason === targetSeason) return false;

  let drops = CCAutomated.getSeasonDropSummary(currentSeason);
  return drops.total > 0 && drops.missing > 0;
};

CCAutomated.getHeldSeasonSwitchUpgradeCandidates = function () {
  let held = [];
  if (!Game.UpgradesInStore) return held;

  for (let i = 0; i < Game.UpgradesInStore.length; i++) {
    let upgrade = Game.UpgradesInStore[i];
    if (!CCAutomated.isUpgradeCandidate(upgrade)) continue;
    if (!CCAutomated.shouldHoldSeasonSwitchUpgrade(upgrade)) continue;

    held.push({
      upgrade: upgrade,
      name: upgrade.name,
      price: CCAutomated.getUpgradePrice(upgrade),
      targetSeason: CCAutomated.getSeasonSwitchTarget(upgrade),
    });
  }

  held.sort(function (a, b) {
    return a.price - b.price;
  });

  return held;
};

CCAutomated.updateSeasonDropTracking = function () {
  let seasonName = CCAutomated.getSeasonName();
  let summary = CCAutomated.getSeasonDropSummary(seasonName);

  for (let i = 0; i < summary.categories.length; i++) {
    let category = summary.categories[i];
    let key = summary.season + ":" + category.id;
    let previousOwned = CCAutomated.Season.dropCounts[key];

    if (typeof previousOwned === "number" && category.owned > previousOwned) {
      let gained = category.owned - previousOwned;
      CCAutomated.setSeasonAction(
        "Collected " + gained + " " + category.label.toLowerCase() + (gained === 1 ? "" : ""),
      );
    }

    CCAutomated.Season.dropCounts[key] = category.owned;
  }

  return summary;
};

CCAutomated.getSeasonUpgradeCandidates = function () {
  let candidates = [];
  if (!Game.UpgradesInStore) return candidates;

  for (let i = 0; i < Game.UpgradesInStore.length; i++) {
    let upgrade = Game.UpgradesInStore[i];
    if (!CCAutomated.isUpgradeCandidate(upgrade)) continue;
    if (!CCAutomated.isSeasonUpgrade(upgrade)) continue;
    if (CCAutomated.shouldHoldSeasonSwitchUpgrade(upgrade)) continue;

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

  CCAutomated.updateSeasonDropTracking();

  if (CCAutomated.clickReindeer() > 0) return;
  if (CCAutomated.Config.Season < 2) return;

  CCAutomated.buySeasonUpgrade(CCAutomated.getBestAffordableSeasonUpgrade());
};
