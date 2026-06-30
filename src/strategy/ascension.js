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
  let upgrade = CCAutomated.getUpgradeByName ? CCAutomated.getUpgradeByName(name) : Game.Upgrades && Game.Upgrades[name];
  return !!(upgrade && upgrade.bought);
};

CCAutomated.getAscensionUpgradeCategory = function (targetPrestige) {
  if (targetPrestige < CCAutomated.Strategy.firstAscendPrestigeTarget) return "Starter heavenly chips";
  if (targetPrestige < 5000) return "Permanent slot, dragon, and season starters";
  if (targetPrestige < 50000) return "Lucky, kitten, and milk upgrades";
  if (targetPrestige < 1000000) return "Permanent slots and prestige scaling";
  return "Late heavenly upgrades and prestige scaling";
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
      name: upgrade.name,
      price: CCAutomated.getUpgradePrice ? CCAutomated.getUpgradePrice(upgrade) : upgrade.basePrice || upgrade.price || 0,
    });
  }

  candidates.sort(function (a, b) {
    return b.price - a.price;
  });

  return candidates.slice(0, 3);
};

CCAutomated.getAscensionPermanentSlotText = function () {
  let candidates = CCAutomated.getAscensionPermanentSlotCandidates();
  if (candidates.length <= 0) return "No owned kitten upgrade yet";

  let names = [];
  for (let i = 0; i < candidates.length; i++) {
    names.push(candidates[i].name);
  }

  return names.join(", ");
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
  let upgrade = CCAutomated.getUpgradeByName ? CCAutomated.getUpgradeByName("Chocolate egg") : Game.Upgrades["Chocolate egg"];
  if (!upgrade) return "Unknown";
  if (upgrade.bought) return "Already bought";
  if (upgrade.unlocked) return "Available; buy after selling buildings";
  return "Not visible yet";
};

CCAutomated.getAscensionWrinklerText = function () {
  let summary = CCAutomated.getWrinklerSummary ? CCAutomated.getWrinklerSummary() : null;
  if (!summary || summary.attached <= 0) return "Clear";

  let text = summary.attached + " attached";
  if (summary.shiny > 0) text += ", " + summary.shiny + " shiny";
  if (summary.sucked > 0) text += ", " + CCAutomated.formatNumber(summary.sucked) + " sucked";
  return text;
};

CCAutomated.getAscensionGardenText = function () {
  let summary = CCAutomated.getGardenSummary ? CCAutomated.getGardenSummary() : null;
  if (!summary || !summary.ready) return "Farm minigame not ready";
  if (summary.comboReady > 0) return summary.comboReady + " mature combo plants";
  if (summary.comboGrowing > 0) return summary.comboGrowing + " combo plants growing";
  return "Clear";
};

CCAutomated.getAscensionSeasonText = function () {
  if (!CCAutomated.getSeasonName || !CCAutomated.getSeasonDropSummary) return "Unknown";

  let seasonName = CCAutomated.getSeasonName();
  let summary = CCAutomated.getSeasonDropSummary(seasonName);
  if (!summary || summary.total <= 0) return "No tracked drops";
  if (summary.missing <= 0) return "Drops complete";
  return summary.missing + " missing in " + seasonName;
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
    CCAutomated.makeStatusLine("Heavenly", [CCAutomated.getAscensionUpgradeCategory(targetPrestige)]),
    CCAutomated.makeStatusLine("Permanent", [CCAutomated.getAscensionPermanentSlotText()]),
    CCAutomated.makeStatusLine("Chocolate", [CCAutomated.getAscensionChocolateEggText()]),
    CCAutomated.makeStatusLine("Wrinklers", [CCAutomated.getAscensionWrinklerText()]),
    CCAutomated.makeStatusLine("Garden", [CCAutomated.getAscensionGardenText()]),
    CCAutomated.makeStatusLine("Seasons", [CCAutomated.getAscensionSeasonText()]),
    CCAutomated.makeStatusLine("Digits", [
      digitHints.length > 0 ? digitHints.join("; ") : "Lucky prestige upgrades owned",
    ]),
    CCAutomated.makeStatusLine("Save", ["Export before ascending"]),
  ];

  return {
    title: "Ascension",
    lines: lines.filter(function (line) {
      return line;
    }),
  };
};
