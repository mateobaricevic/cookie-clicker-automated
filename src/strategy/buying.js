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
      if (CCAutomated.shouldHoldSeasonSwitchUpgrade(upgrade)) continue;

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
