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

  return CCAutomated.getLuckyBankTarget(CCAutomated.getBaseCookiesPerSecond()) * ratio;
};
