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
  let statusText = isRecommended ? "Ascend now" : "Wait for +" + CCAutomated.formatNumber(targetGain) + " prestige";
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
