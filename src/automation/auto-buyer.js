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
