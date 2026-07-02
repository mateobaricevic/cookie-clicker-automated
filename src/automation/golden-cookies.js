// Handle auto clicking Golden Cookies
CCAutomated.isGoldenShimmerReady = function (shimmer) {
  if (!shimmer || shimmer.type !== "golden") return false;
  if (shimmer.life <= 0) return false;

  let secondsLeft = CCAutomated.getGoldenShimmerSecondsLeft(shimmer);
  if (!Game.Achievements["Early bird"].won) return true;
  if (!Game.Achievements["Fading luck"].won) return secondsLeft <= 1;
  return true;
};

CCAutomated.getGoldenShimmerSecondsLeft = function (shimmer) {
  if (!shimmer || typeof shimmer.life !== "number") return 0;
  if (typeof Game.fps !== "number" || Game.fps <= 0) return shimmer.life;
  return shimmer.life / Game.fps;
};

CCAutomated.isForcedGoldenShimmer = function (shimmer) {
  return !!(shimmer && shimmer.type === "golden" && shimmer.force && shimmer.force !== "cookie storm drop");
};

CCAutomated.shouldPopForcedGoldenShimmer = function (shimmer) {
  if (!CCAutomated.isForcedGoldenShimmer(shimmer)) return false;
  if (CCAutomated.isStrongComboActive()) return true;
  return CCAutomated.getGoldenShimmerSecondsLeft(shimmer) <= CCAutomated.Strategy.forcedGoldenMinSecondsLeft;
};

CCAutomated.handleGoldenCookies = function () {
  if (CCAutomated.Config.GoldenCookies === 0) return;
  if (Game.TickerEffect) Game.tickerL.click();

  for (let i = Game.shimmers.length - 1; i >= 0; i--) {
    let shimmer = Game.shimmers[i];
    if (!shimmer) continue;
    if (shimmer.force === "cookie storm drop" || CCAutomated.shouldPopForcedGoldenShimmer(shimmer)) {
      shimmer.pop();
    } else if (!CCAutomated.isForcedGoldenShimmer(shimmer) && CCAutomated.isGoldenShimmerReady(shimmer)) {
      shimmer.pop();
    }
  }
};
