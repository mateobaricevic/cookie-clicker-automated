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

CCAutomated.getBuildingBatchPrice = function (object, amount) {
  amount = Math.max(1, Math.floor(amount || 1));
  if (!object) return Infinity;
  if (amount === 1) return CCAutomated.getObjectPrice(object);

  if (typeof object.getSumPrice === "function") {
    try {
      let price = object.getSumPrice(amount);
      if (isFinite(price) && price > 0) return price;
    } catch (e) {
      console.warn("[CCAutomated] Failed to use building batch price helper", object.name, e);
    }
  }

  if (typeof object.amount !== "number") {
    let price = CCAutomated.getObjectPrice(object);
    return isFinite(price) ? price * amount : Infinity;
  }

  let originalAmount = object.amount;
  let originalBought = object.bought;
  let originalPrice = object.price;
  let total = 0;

  try {
    for (let i = 0; i < amount; i++) {
      let price = CCAutomated.getObjectPrice(object);
      if (!isFinite(price) || price <= 0) return Infinity;
      total += price;
      object.amount += 1;
      if (typeof object.bought === "number") object.bought += 1;
    }
  } catch (e) {
    console.warn("[CCAutomated] Failed to estimate building batch price", object.name, e);
    total = Infinity;
  } finally {
    object.amount = originalAmount;
    if (typeof originalBought !== "undefined") object.bought = originalBought;
    if (typeof originalPrice !== "undefined") object.price = originalPrice;
  }

  return Math.ceil(total);
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

CCAutomated.getAutoBuyerBuildingThreshold = function (object, amount) {
  if (!object || typeof object.amount !== "number") return null;

  amount = Math.max(1, Math.floor(amount || 1));
  let endAmount = object.amount + amount;
  let threshold = null;
  let majorThreshold = null;

  for (let nextAmount = object.amount + 1; nextAmount <= endAmount; nextAmount++) {
    if (nextAmount < 10) continue;
    if (nextAmount === 10 || nextAmount === 25 || nextAmount % 50 === 0) {
      if (nextAmount % 100 === 0) majorThreshold = nextAmount;
      else threshold = nextAmount;
    }
  }

  return majorThreshold || threshold;
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

CCAutomated.getAutoBuyerBuildingPlanLabel = function (object, amount) {
  amount = Math.max(1, Math.floor(amount || 1));
  if (!object || !object.name) return "Unknown building";
  if (amount === 1) return object.name;
  return object.name + " x" + amount;
};

CCAutomated.getAutoBuyerBuildingChainPlanLabel = function (object, amount, upgrade, targetAmount) {
  let label = CCAutomated.getAutoBuyerBuildingPlanLabel(object, amount);
  if (!upgrade || !upgrade.name) return label;
  return label + " toward " + upgrade.name + (targetAmount ? " at " + targetAmount : "");
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


CCAutomated.estimateBuildingCpsGain = function (object, amount) {
  if (!object || typeof object.amount !== "number") return 0;

  amount = Math.max(1, Math.floor(amount || 1));
  let originalAmount = object.amount;
  let originalBought = object.bought;
  let originalCps = CCAutomated.getAutoBuyerPlanningCookiesPerSecond();
  let gain = 0;

  try {
    object.amount += amount;
    if (typeof object.bought === "number") object.bought += amount;
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

CCAutomated.estimateAutoBuyerChainCpsGain = function (requirements, upgrade) {
  if (!upgrade || !requirements || requirements.length <= 0) return 0;

  let originalBought = upgrade.bought;
  let originalStates = [];
  let originalCps = CCAutomated.getAutoBuyerPlanningCookiesPerSecond();
  let gain = 0;

  try {
    for (let i = 0; i < requirements.length; i++) {
      let requirement = requirements[i];
      if (!requirement.object || typeof requirement.object.amount !== "number") continue;

      originalStates.push({
        object: requirement.object,
        amount: requirement.object.amount,
        bought: requirement.object.bought,
      });
      requirement.object.amount = Math.max(requirement.object.amount, requirement.targetAmount);
      if (typeof requirement.object.bought === "number")
        requirement.object.bought = Math.max(requirement.object.bought, requirement.targetAmount);
    }

    upgrade.bought = 1;
    CCAutomated.recalculateGains();
    gain = CCAutomated.getAutoBuyerPlanningCookiesPerSecond() - originalCps;
  } catch (e) {
    console.warn("[CCAutomated] Failed to estimate chain purchase", upgrade.name, e);
  } finally {
    for (let i = 0; i < originalStates.length; i++) {
      originalStates[i].object.amount = originalStates[i].amount;
      if (typeof originalStates[i].bought !== "undefined") originalStates[i].object.bought = originalStates[i].bought;
    }
    upgrade.bought = originalBought;
    CCAutomated.recalculateGains();
  }

  return Math.max(0, gain);
};

CCAutomated.getAutoBuyerBuildingCandidate = function (object, amount, spendableCookies, cookiesPerSecond) {
  amount = Math.max(1, Math.floor(amount || 1));
  let price = CCAutomated.getBuildingBatchPrice(object, amount);
  if (!isFinite(price) || price <= 0) return null;

  let waitSeconds = CCAutomated.getAutoBuyerWaitSeconds(price, spendableCookies, cookiesPerSecond);
  if (amount > 1 && price > spendableCookies && waitSeconds > CCAutomated.getAutoBuyerStrategy().maxWaitSeconds)
    return null;

  let gain = CCAutomated.estimateBuildingCpsGain(object, amount);
  if (gain <= 0) return null;

  let score = CCAutomated.getAutoBuyerScore(price, gain, spendableCookies, cookiesPerSecond);
  if (!isFinite(score)) return null;
  let threshold = CCAutomated.getAutoBuyerBuildingThreshold(object, amount);
  score *= CCAutomated.getAutoBuyerBuildingThresholdScoreMultiplier(threshold);

  return {
    type: "building",
    id: CCAutomated.getAutoBuyerCandidateId("building", object) + ":x" + amount,
    item: object,
    name: object.name,
    planLabel: CCAutomated.getAutoBuyerBuildingPlanLabel(object, amount),
    amount: amount,
    price: price,
    gain: gain,
    realGain: gain,
    affordable: price <= spendableCookies,
    threshold: threshold,
    priority: threshold ? "milestone" : "",
    waitSeconds: waitSeconds,
    payoffSeconds: price / gain,
    score: score,
  };
};

CCAutomated.isLockedAutoBuyerChainUpgrade = function (upgrade) {
  if (!upgrade || upgrade.bought || upgrade.unlocked) return false;
  if (upgrade.pool === "toggle" || upgrade.pool === "debug" || upgrade.pool === "prestige" || upgrade.pool === "tech")
    return false;
  if (upgrade.priceLumps > 0) return false;
  return true;
};

CCAutomated.getAutoBuyerChainUpgradeRequirements = function (upgrade) {
  if (!CCAutomated.isLockedAutoBuyerChainUpgrade(upgrade)) return [];
  if (!Game.Tiers || !upgrade.tier || !Game.Tiers[upgrade.tier]) return [];

  let tier = Game.Tiers[upgrade.tier];
  let requirements = [];

  if (upgrade.buildingTie && !tier.special && tier.unlock > 0) {
    requirements.push({
      object: upgrade.buildingTie,
      targetAmount: tier.unlock,
    });
  } else if (upgrade.buildingTie1 && upgrade.buildingTie2 && tier.special && tier.unlock > 0) {
    if (tier.req && typeof Game.Has === "function" && !Game.Has(tier.req)) return [];
    requirements.push({
      object: upgrade.buildingTie1,
      targetAmount: tier.unlock,
    });
    requirements.push({
      object: upgrade.buildingTie2,
      targetAmount: tier.unlock,
    });
  }

  return requirements.filter(function (requirement) {
    return requirement.object && typeof requirement.object.amount === "number" && requirement.object.amount < requirement.targetAmount;
  });
};

CCAutomated.getAutoBuyerChainBuildingPrice = function (requirements) {
  let price = 0;

  for (let i = 0; i < requirements.length; i++) {
    let requirement = requirements[i];
    let amount = requirement.targetAmount - requirement.object.amount;
    let requirementPrice = CCAutomated.getBuildingBatchPrice(requirement.object, amount);
    if (!isFinite(requirementPrice) || requirementPrice <= 0) return Infinity;
    price += requirementPrice;
  }

  return price;
};

CCAutomated.getAutoBuyerChainCandidatesForUpgrade = function (upgrade, spendableCookies, cookiesPerSecond) {
  let candidates = [];
  let requirements = CCAutomated.getAutoBuyerChainUpgradeRequirements(upgrade);
  if (requirements.length <= 0) return candidates;

  let upgradePrice = CCAutomated.getUpgradePrice(upgrade);
  if (!isFinite(upgradePrice) || upgradePrice <= 0) return candidates;

  let chainBuildingPrice = CCAutomated.getAutoBuyerChainBuildingPrice(requirements);
  if (!isFinite(chainBuildingPrice) || chainBuildingPrice <= 0) return candidates;

  let chainPrice = chainBuildingPrice + upgradePrice;
  let chainWaitSeconds = CCAutomated.getAutoBuyerWaitSeconds(chainPrice, spendableCookies, cookiesPerSecond);
  if (chainPrice > spendableCookies && chainWaitSeconds > CCAutomated.getAutoBuyerStrategy().maxWaitSeconds) return candidates;

  let chainGain = CCAutomated.estimateAutoBuyerChainCpsGain(requirements, upgrade);
  let priority = CCAutomated.getUpgradePriority(upgrade);
  if (chainGain <= 0) chainGain = CCAutomated.getStrategicUpgradeMinimumGain(upgrade);
  if (chainGain <= 0) return candidates;

  let score = CCAutomated.getAutoBuyerScore(chainPrice, chainGain, spendableCookies, cookiesPerSecond);
  if (!isFinite(score)) return candidates;
  score *= priority.multiplier;

  for (let i = 0; i < requirements.length; i++) {
    let requirement = requirements[i];
    let missingAmount = requirement.targetAmount - requirement.object.amount;
    let stepAmount = Math.min(100, missingAmount);
    let stepPrice = CCAutomated.getBuildingBatchPrice(requirement.object, stepAmount);
    if (!isFinite(stepPrice) || stepPrice <= 0) continue;

    let stepWaitSeconds = CCAutomated.getAutoBuyerWaitSeconds(stepPrice, spendableCookies, cookiesPerSecond);
    if (stepPrice > spendableCookies && stepWaitSeconds > CCAutomated.getAutoBuyerStrategy().maxWaitSeconds) continue;

    let stepGain = CCAutomated.estimateBuildingCpsGain(requirement.object, stepAmount);

    candidates.push({
      type: "building",
      id: CCAutomated.getAutoBuyerCandidateId("chain", upgrade) + ":" + requirement.object.id + ":x" + stepAmount,
      item: requirement.object,
      name: requirement.object.name,
      planLabel: CCAutomated.getAutoBuyerBuildingChainPlanLabel(
        requirement.object,
        stepAmount,
        upgrade,
        requirement.targetAmount,
      ),
      amount: stepAmount,
      price: stepPrice,
      gain: chainGain,
      realGain: stepGain,
      chainPrice: chainPrice,
      chainGain: chainGain,
      chainUpgradeName: upgrade.name,
      chainTargetAmount: requirement.targetAmount,
      affordable: stepPrice <= spendableCookies,
      priority: priority.label || "chain",
      waitSeconds: stepWaitSeconds,
      payoffSeconds: chainPrice / chainGain,
      score: score,
    });
  }

  return candidates;
};

CCAutomated.getAutoBuyerChainCandidates = function (spendableCookies, cookiesPerSecond) {
  let candidates = [];
  if (!Game.UpgradesById) return candidates;

  for (let i = 0; i < Game.UpgradesById.length; i++) {
    let upgrade = Game.UpgradesById[i];
    let upgradeCandidates = CCAutomated.getAutoBuyerChainCandidatesForUpgrade(
      upgrade,
      spendableCookies,
      cookiesPerSecond,
    );

    for (let j = 0; j < upgradeCandidates.length; j++) {
      candidates.push(upgradeCandidates[j]);
    }
  }

  return candidates;
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
      let amounts = [1, 10, 100];

      for (let amountIndex = 0; amountIndex < amounts.length; amountIndex++) {
        let candidate = CCAutomated.getAutoBuyerBuildingCandidate(
          object,
          amounts[amountIndex],
          spendableCookies,
          cookiesPerSecond,
        );
        if (candidate) candidates.push(candidate);
      }
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
        planLabel: upgrade.name,
        amount: 1,
        price: upgradePrice,
        gain: upgradeGain,
        realGain: realUpgradeGain,
        affordable: upgradePrice <= spendableCookies,
        priority: priority.label,
        waitSeconds: upgradeWaitSeconds,
        payoffSeconds: upgradePrice / upgradeGain,
        score: upgradeScore,
      });
    }
  }

  let chainCandidates = CCAutomated.getAutoBuyerChainCandidates(spendableCookies, cookiesPerSecond);
  for (let k = 0; k < chainCandidates.length; k++) {
    candidates.push(chainCandidates[k]);
  }

  return candidates;
};

CCAutomated.getRankedAutoBuyerCandidates = function (candidates) {
  return candidates.slice().sort(function (a, b) {
    return a.score - b.score;
  });
};

CCAutomated.getAutoBuyerBulkCatchUpCandidate = function (candidates) {
  let best = null;

  for (let i = 0; i < candidates.length; i++) {
    let candidate = candidates[i];
    if (!candidate || candidate.type !== "building") continue;
    if (!candidate.affordable || candidate.amount <= 1) continue;
    if (candidate.chainUpgradeName) continue;
    if (candidate.realGain <= 0) continue;
    if (candidate.payoffSeconds > CCAutomated.AutoBuyer.bulkCatchUpPayoffSeconds) continue;
    if (!CCAutomated.canBuyDuringCombo(candidate)) continue;

    if (!best || candidate.amount > best.amount || (candidate.amount === best.amount && candidate.score < best.score)) {
      best = candidate;
    }
  }

  return best;
};

CCAutomated.selectAutoBuyerCandidate = function (candidates) {
  let strategy = CCAutomated.getAutoBuyerStrategy();
  let best = null;
  let bestAffordable = null;
  let bestWithinWait = null;
  let bulkCatchUp = CCAutomated.getAutoBuyerBulkCatchUpCandidate(candidates);

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

  if (bulkCatchUp) return bulkCatchUp;
  return bestWithinWait || bestAffordable || best;
};

CCAutomated.getAutoBuyerCandidateSelection = function () {
  let candidates = CCAutomated.getAutoBuyerCandidates();

  return {
    target: CCAutomated.selectAutoBuyerCandidate(candidates),
    candidates: CCAutomated.getRankedAutoBuyerCandidates(candidates),
  };
};

CCAutomated.getBestAutoBuyerCandidate = function () {
  return CCAutomated.getAutoBuyerCandidateSelection().target;
};

CCAutomated.isAutoBuyerTargetValid = function (candidate) {
  if (!candidate || !candidate.item) return false;

  if (candidate.chainUpgradeName) {
    let chainUpgrade = Game.Upgrades && Game.Upgrades[candidate.chainUpgradeName];
    if (!chainUpgrade || chainUpgrade.bought || chainUpgrade.unlocked) return false;
  }

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
    candidate.price = CCAutomated.getBuildingBatchPrice(candidate.item, candidate.amount);
  } else if (candidate.type === "upgrade") {
    candidate.price = CCAutomated.getUpgradePrice(candidate.item);
  }

  candidate.affordable = candidate.price <= spendableCookies;
  candidate.waitSeconds = CCAutomated.getAutoBuyerWaitSeconds(
    candidate.price,
    spendableCookies,
    CCAutomated.getAutoBuyerPlanningCookiesPerSecond(),
  );
  if (candidate.gain > 0) candidate.payoffSeconds = (candidate.chainPrice || candidate.price) / candidate.gain;
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
  if (candidate.realGain > 0) return true;

  let payout = CCAutomated.getAutoBuyerCandidatePayoutAfterPurchase(candidate);
  if (!payout) return false;

  if (CCAutomated.isHugeComboActive() && candidate.priority !== "clicking") {
    return payout.after >= payout.before;
  }

  return payout.after >= payout.before * CCAutomated.AutoBuyer.comboPayoutTolerance;
};
