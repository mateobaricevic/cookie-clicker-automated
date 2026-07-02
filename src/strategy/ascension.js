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

CCAutomated.isAscensionUpgradeBought = function (name) {
  let upgrade = CCAutomated.getUpgradeByName
    ? CCAutomated.getUpgradeByName(name)
    : Game.Upgrades && Game.Upgrades[name];
  return !!(upgrade && upgrade.bought);
};

CCAutomated.getAscensionUpgradeCategory = function (targetPrestige) {
  if (targetPrestige < CCAutomated.Strategy.firstAscendPrestigeTarget) {
    return "Build toward starter heavenly chips";
  }
  if (targetPrestige < 5000) {
    return "Look for permanent upgrade slots, Krumblor, and season switchers";
  }
  if (targetPrestige < 50000) {
    return "Look for Lucky upgrades, heavenly kittens, and milk upgrades";
  }
  if (targetPrestige < 1000000) {
    return "Look for more permanent slots and prestige scaling";
  }
  return "Look for late heavenly upgrades and prestige scaling";
};

CCAutomated.getAscensionAvailableHeavenlyChips = function (pendingPrestige) {
  let heavenlyChips = typeof Game.heavenlyChips === "number" ? Game.heavenlyChips : 0;
  if (typeof pendingPrestige !== "number") pendingPrestige = CCAutomated.getPendingPrestigeGain();
  return Math.max(0, heavenlyChips + pendingPrestige);
};

CCAutomated.getAscensionHeavenlyUpgrades = function () {
  let upgrades = [];
  let source = Game.PrestigeUpgrades || Game.UpgradesById || [];

  for (let i = 0; i < source.length; i++) {
    let upgrade = source[i];
    if (!upgrade || upgrade.pool !== "prestige" || upgrade.bought) continue;
    upgrades.push(upgrade);
  }

  return upgrades;
};

CCAutomated.isAscensionUpgradeParentBought = function (parent, plannedBought) {
  if (!parent || parent === -1) return true;
  if (typeof parent === "string") {
    if (plannedBought && plannedBought[parent]) return true;
    parent = Game.Upgrades && Game.Upgrades[parent];
  }
  if (!parent) return false;
  if (parent.bought) return true;
  return !!(plannedBought && parent.name && plannedBought[parent.name]);
};

CCAutomated.canAscensionUpgradeAppear = function (upgrade, targetPrestige) {
  if (!upgrade || typeof upgrade.showIf !== "function") return true;

  let originalPrestige = Game.prestige;
  try {
    if (typeof targetPrestige === "number") Game.prestige = targetPrestige;
    return !!upgrade.showIf();
  } catch (e) {
    console.warn("[CCAutomated] Failed to evaluate heavenly upgrade visibility", upgrade.name, e);
    return false;
  } finally {
    Game.prestige = originalPrestige;
  }
};

CCAutomated.canAscensionUpgradeBePlanned = function (upgrade, plannedBought, targetPrestige) {
  if (!upgrade || upgrade.bought) return false;
  if (!CCAutomated.canAscensionUpgradeAppear(upgrade, targetPrestige)) return false;

  let parents = upgrade.parents || [];
  for (let i = 0; i < parents.length; i++) {
    if (!CCAutomated.isAscensionUpgradeParentBought(parents[i], plannedBought)) return false;
  }

  return true;
};

CCAutomated.getAscensionHeavenlyUpgradePlan = function (availableChips, targetPrestige) {
  let remaining = Math.max(0, Math.floor(availableChips || 0));
  let plannedBought = {};
  let planned = [];
  let upgrades = CCAutomated.getAscensionHeavenlyUpgrades();
  let madeProgress = true;

  while (madeProgress) {
    madeProgress = false;
    let candidates = [];

    for (let i = 0; i < upgrades.length; i++) {
      let upgrade = upgrades[i];
      if (!upgrade || plannedBought[upgrade.name]) continue;
      if (!CCAutomated.canAscensionUpgradeBePlanned(upgrade, plannedBought, targetPrestige)) continue;

      let price = CCAutomated.getUpgradePrice
        ? CCAutomated.getUpgradePrice(upgrade)
        : upgrade.basePrice || upgrade.price || 0;
      if (!isFinite(price) || price < 0 || price > remaining) continue;

      candidates.push({
        upgrade: upgrade,
        price: price,
      });
    }

    if (candidates.length <= 0) continue;
    candidates.sort(function (a, b) {
      return a.price - b.price || a.upgrade.id - b.upgrade.id;
    });

    let next = candidates[0];
    planned.push(next);
    plannedBought[next.upgrade.name] = true;
    remaining -= next.price;
    madeProgress = true;
  }

  return {
    planned: planned,
    remaining: remaining,
  };
};

CCAutomated.getAscensionNextHeavenlyUpgrade = function (targetPrestige) {
  let upgrades = CCAutomated.getAscensionHeavenlyUpgrades();
  let candidates = [];

  for (let i = 0; i < upgrades.length; i++) {
    let upgrade = upgrades[i];
    if (!CCAutomated.canAscensionUpgradeBePlanned(upgrade, null, targetPrestige)) continue;
    let price = CCAutomated.getUpgradePrice ? CCAutomated.getUpgradePrice(upgrade) : upgrade.basePrice || upgrade.price || 0;
    if (!isFinite(price) || price < 0) continue;
    candidates.push({
      name: upgrade.name,
      price: price,
      id: upgrade.id,
    });
  }

  candidates.sort(function (a, b) {
    return a.price - b.price || a.id - b.id;
  });

  return candidates[0] || null;
};

CCAutomated.getAscensionHeavenlyUpgradeText = function (pendingPrestige, targetPrestige) {
  let availableChips = CCAutomated.getAscensionAvailableHeavenlyChips(pendingPrestige);
  let plan = CCAutomated.getAscensionHeavenlyUpgradePlan(availableChips, targetPrestige);

  if (plan.planned.length > 0) {
    let names = [];
    let maxNames = 4;
    for (let i = 0; i < plan.planned.length && i < maxNames; i++) {
      names.push(plan.planned[i].upgrade.name);
    }

    let text = "Buy: " + names.join(", ");
    if (plan.planned.length > maxNames) text += ", +" + (plan.planned.length - maxNames) + " more";
    if (plan.remaining > 0) text += "; keep " + CCAutomated.formatNumber(plan.remaining) + " HC";
    return text;
  }

  let next = CCAutomated.getAscensionNextHeavenlyUpgrade(targetPrestige);
  if (next) {
    let shortfall = Math.max(0, next.price - availableChips);
    return "Save for " + next.name + " (need " + CCAutomated.formatNumber(shortfall) + " HC)";
  }

  return CCAutomated.getAscensionUpgradeCategory(targetPrestige);
};

CCAutomated.getAscensionPermanentSlotCandidates = function () {
  let candidates = [];
  if (!Game.UpgradesById) return candidates;

  for (let i = 0; i < Game.UpgradesById.length; i++) {
    let upgrade = Game.UpgradesById[i];
    if (!upgrade || !upgrade.bought || !upgrade.name) continue;
    if (!/kitten/i.test(upgrade.name)) continue;
    if (upgrade.pool === "prestige" || upgrade.pool === "toggle" || upgrade.pool === "debug") continue;

    candidates.push({
      id: upgrade.id,
      name: upgrade.name,
      price: CCAutomated.getUpgradePrice
        ? CCAutomated.getUpgradePrice(upgrade)
        : upgrade.basePrice || upgrade.price || 0,
    });
  }

  candidates.sort(function (a, b) {
    return b.price - a.price;
  });

  return candidates;
};

CCAutomated.getAscensionPermanentSlotCount = function () {
  let slotNames = [
    "Permanent upgrade slot I",
    "Permanent upgrade slot II",
    "Permanent upgrade slot III",
    "Permanent upgrade slot IV",
    "Permanent upgrade slot V",
  ];
  let count = 0;

  for (let i = 0; i < slotNames.length; i++) {
    let upgrade = CCAutomated.getUpgradeByName
      ? CCAutomated.getUpgradeByName(slotNames[i])
      : Game.Upgrades && Game.Upgrades[slotNames[i]];
    if (upgrade && upgrade.bought) count++;
  }

  return count;
};

CCAutomated.getAscensionPermanentSlotUpgrade = function (slot) {
  if (!Game.permanentUpgrades || typeof Game.permanentUpgrades[slot] === "undefined") return null;
  let upgradeId = Game.permanentUpgrades[slot];
  if (upgradeId < 0 || !Game.UpgradesById) return null;
  return Game.UpgradesById[upgradeId] || null;
};

CCAutomated.getAscensionPermanentSlotLabel = function (slot) {
  let labels = ["I", "II", "III", "IV", "V"];
  return labels[slot] || String(slot + 1);
};

CCAutomated.getAscensionPermanentSlotText = function () {
  let slotCount = CCAutomated.getAscensionPermanentSlotCount();
  let candidates = CCAutomated.getAscensionPermanentSlotCandidates();
  if (slotCount <= 0) return "No permanent slots unlocked yet; put kitten upgrades in them when available";
  if (candidates.length <= 0) return "No owned kitten upgrade yet; choose manually for " + slotCount + " slot(s)";

  let recommended = candidates.slice(0, slotCount);
  let current = [];
  let optimal = true;

  for (let i = 0; i < slotCount; i++) {
    let currentUpgrade = CCAutomated.getAscensionPermanentSlotUpgrade(i);
    let recommendedUpgrade = recommended[i] || null;
    let currentName = currentUpgrade && currentUpgrade.name ? currentUpgrade.name : "empty";
    current.push(CCAutomated.getAscensionPermanentSlotLabel(i) + " " + currentName);

    if (recommendedUpgrade && (!currentUpgrade || currentUpgrade.id !== recommendedUpgrade.id)) optimal = false;
  }

  let recommendedNames = [];
  for (let j = 0; j < recommended.length; j++) {
    recommendedNames.push(recommended[j].name);
  }

  let text = "Current: " + current.join(", ") + "; ";
  if (optimal) return text + "optimal";

  text += "set to: " + recommendedNames.join(", ");
  if (candidates.length < slotCount) text += "; fill remaining manually";
  return text;
};

CCAutomated.getNextPrestigeEnding = function (prestige, ending) {
  let modulus = 1;
  while (modulus <= ending) modulus *= 10;

  let currentEnding = prestige % modulus;
  if (currentEnding <= ending) return prestige + ending - currentEnding;
  return prestige + modulus - currentEnding + ending;
};

CCAutomated.getAscensionLuckyDigitHints = function (currentPrestige, pendingPrestige) {
  let totalPrestige = currentPrestige + pendingPrestige;
  let definitions = [
    { name: "Lucky digit", ending: 7 },
    { name: "Lucky number", ending: 777 },
    { name: "Lucky payout", ending: 777777 },
  ];
  let hints = [];

  for (let i = 0; i < definitions.length; i++) {
    let definition = definitions[i];
    if (CCAutomated.isAscensionUpgradeBought(definition.name)) continue;

    let targetPrestige = CCAutomated.getNextPrestigeEnding(totalPrestige, definition.ending);
    let needed = Math.max(0, targetPrestige - currentPrestige);
    let extra = Math.max(0, needed - pendingPrestige);
    let hint = definition.name + " at total " + CCAutomated.formatNumber(targetPrestige);

    if (extra > 0) hint += ", need +" + CCAutomated.formatNumber(extra);
    else hint += ", ready";

    hints.push(hint);
  }

  return hints;
};

CCAutomated.getAscensionChocolateEggText = function () {
  let upgrade = CCAutomated.getUpgradeByName
    ? CCAutomated.getUpgradeByName("Chocolate egg")
    : Game.Upgrades["Chocolate egg"];
  if (!upgrade) return "Unknown";
  if (upgrade.bought) return "";
  if (upgrade.unlocked) return "Buy after selling buildings, before ascending";
  return "Chocolate Egg not unlocked this run";
};

CCAutomated.getAscensionWrinklerText = function () {
  let summary = CCAutomated.getWrinklerSummary ? CCAutomated.getWrinklerSummary() : null;
  if (!summary || summary.attached <= 0) return "";

  let text = "Pop before ascending: " + summary.attached + " attached";
  if (summary.shiny > 0) text += ", " + summary.shiny + " shiny";
  if (summary.sucked > 0) text += ", " + CCAutomated.formatNumber(summary.sucked) + " sucked";
  if (CCAutomated.Config.Wrinklers > 0) text += ", automation may clear them";
  return text;
};

CCAutomated.getAscensionGardenText = function () {
  let summary = CCAutomated.getGardenSummary ? CCAutomated.getGardenSummary() : null;
  if (!summary || !summary.ready) return "";
  if (summary.comboReady > 0) return "Harvest before ascending: " + summary.comboReady + " mature combo plants";
  if (summary.comboGrowing > 0) return "Optional wait: " + summary.comboGrowing + " combo plants still growing";
  return "";
};

CCAutomated.getAscensionSeasonText = function () {
  if (!CCAutomated.getSeasonName || !CCAutomated.getSeasonDropSummary) return "Unknown";

  let seasonName = CCAutomated.getSeasonName();
  let summary = CCAutomated.getSeasonDropSummary(seasonName);
  if (!summary || summary.total <= 0 || summary.missing <= 0) return "";
  return "Optional wait: " + summary.missing + " tracked drops missing in " + seasonName;
};

CCAutomated.getAscensionStatus = function () {
  let currentPrestige = CCAutomated.getCurrentPrestige();
  let pendingPrestige = CCAutomated.getPendingPrestigeGain();
  let targetGain = CCAutomated.getAscensionRecommendedPrestigeGain(currentPrestige);
  let isRecommended = pendingPrestige >= targetGain;
  let plannedPrestigeGain = Math.max(pendingPrestige, targetGain);
  let targetPrestige = currentPrestige + targetGain;
  let plannedPrestige = currentPrestige + plannedPrestigeGain;
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
  let statusText = isRecommended ? "Ascend now" : "Wait for +" + CCAutomated.formatNumber(targetGain) + " prestige";
  let rewardText =
    "+" +
    CCAutomated.formatNumber(pendingPrestige) +
    (currentPrestige > 0 ? " prestige (" + Math.floor(gainRatio * 100) + "%)" : " prestige");
  let digitHints = CCAutomated.getAscensionLuckyDigitHints(currentPrestige, pendingPrestige);

  let lines = [
    CCAutomated.makeStatusLine("Status", [statusText]),
    CCAutomated.makeStatusLine("Reward", [rewardText]),
    CCAutomated.makeStatusLine("Target", [ruleText, "total " + CCAutomated.formatNumber(targetPrestige)]),
    CCAutomated.makeStatusLine("ETA", [isFinite(waitSeconds) ? CCAutomated.formatDuration(waitSeconds) : "Unknown"]),
    CCAutomated.makeStatusLine("Heavenly", [
      CCAutomated.getAscensionHeavenlyUpgradeText(plannedPrestigeGain, plannedPrestige),
    ]),
    CCAutomated.makeStatusLine("Permanent", [CCAutomated.getAscensionPermanentSlotText()]),
    CCAutomated.makeStatusLine("Chocolate", [CCAutomated.getAscensionChocolateEggText()]),
    CCAutomated.makeStatusLine("Wrinklers", [CCAutomated.getAscensionWrinklerText()]),
    CCAutomated.makeStatusLine("Garden", [CCAutomated.getAscensionGardenText()]),
    CCAutomated.makeStatusLine("Seasons", [CCAutomated.getAscensionSeasonText()]),
    CCAutomated.makeStatusLine("Digits", [
      digitHints.length > 0 ? digitHints.join("; ") : "Lucky prestige upgrades owned",
    ]),
    CCAutomated.makeStatusLine("Save", ["Manual safety step: export before ascending"]),
  ];

  return {
    title: "Ascension",
    lines: lines.filter(function (line) {
      return line;
    }),
  };
};
