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
