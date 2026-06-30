CCAutomated.stop = function () {
  for (let key in CCAutomated.Intervals) {
    clearInterval(CCAutomated.Intervals[key]);
  }
  CCAutomated.Intervals = {};

  if (CCAutomated.ConfigBackup && CCAutomated.ConfigBackup.UpdateMenu) {
    Game.UpdateMenu = CCAutomated.ConfigBackup.UpdateMenu;
  }
};

CCAutomated.start = function () {
  CCAutomated.loadConfig();
  CCAutomated.Intervals.autoClicker = setInterval(CCAutomated.handleAutoClicker, CCAutomated.IntervalMs.autoClicker);
  CCAutomated.Intervals.goldenCookieClicker = setInterval(
    CCAutomated.handleGoldenCookies,
    CCAutomated.IntervalMs.goldenCookieClicker,
  );
  CCAutomated.Intervals.wrinklerClicker = setInterval(
    CCAutomated.handleWrinklers,
    CCAutomated.IntervalMs.wrinklerClicker,
  );
  CCAutomated.Intervals.grimoire = setInterval(CCAutomated.handleGrimoire, CCAutomated.IntervalMs.grimoire);
  CCAutomated.Intervals.garden = setInterval(CCAutomated.handleGarden, CCAutomated.IntervalMs.garden);
  CCAutomated.Intervals.pantheon = setInterval(CCAutomated.handlePantheon, CCAutomated.IntervalMs.pantheon);
  CCAutomated.Intervals.season = setInterval(CCAutomated.handleSeason, CCAutomated.IntervalMs.season);
  CCAutomated.Intervals.autoBuyer = setInterval(CCAutomated.handleAutoBuyer, CCAutomated.IntervalMs.autoBuyer);
};

// Start Cookie Clicker Automated
CCAutomated.start();
