// Handle auto clicking Wrinklers
CCAutomated.isWrinklerAttached = function (wrinkler) {
  return wrinkler && wrinkler.close === 1 && wrinkler.hp > 0;
};

CCAutomated.popWrinkler = function (wrinkler) {
  if (wrinkler) wrinkler.hp = 0;
};

CCAutomated.getBestWrinklerToPop = function () {
  let bestWrinkler = null;
  let maxSucked = CCAutomated.Wrinklers.minSuckedToPop;

  for (let i = 0; i < Game.wrinklers.length; i++) {
    let wrinkler = Game.wrinklers[i];
    if (!CCAutomated.isWrinklerAttached(wrinkler)) continue;
    if (wrinkler.sucked >= maxSucked) {
      maxSucked = wrinkler.sucked;
      bestWrinkler = wrinkler;
    }
  }

  return bestWrinkler;
};

CCAutomated.getWrinklerSummary = function () {
  let summary = {
    total: 0,
    attached: 0,
    shiny: 0,
    sucked: 0,
  };
  if (!Game.wrinklers) return summary;

  summary.total = Game.wrinklers.length;
  for (let i = 0; i < Game.wrinklers.length; i++) {
    let wrinkler = Game.wrinklers[i];
    if (!CCAutomated.isWrinklerAttached(wrinkler)) continue;

    summary.attached++;
    if (wrinkler.type === 1) summary.shiny++;
    if (typeof wrinkler.sucked === "number") summary.sucked += wrinkler.sucked;
  }

  return summary;
};

CCAutomated.shouldHoldWrinklerPopForSkruuia = function () {
  if (CCAutomated.Config.Pantheon === 0) return false;
  if (CCAutomated.isSkruuiaSlotted()) return false;
  if (!CCAutomated.getPantheon()) return false;
  return CCAutomated.getWrinklerSummary().attached > 0;
};

CCAutomated.handleWrinklers = function () {
  if (CCAutomated.Config.Wrinklers === 0) return;
  if (!Game.Upgrades["One mind"].bought) return;
  if (Game.Upgrades["Unholy bait"].bought && !Game.Achievements["Moistburster"].won) {
    Game.wrinklers.forEach(function (wrinkler) {
      if (CCAutomated.isWrinklerAttached(wrinkler)) CCAutomated.popWrinkler(wrinkler);
    });
    return;
  }

  let now = Date.now();
  if (now - CCAutomated.Wrinklers.lastPop < CCAutomated.Wrinklers.popIntervalMs) return;
  if (CCAutomated.shouldHoldWrinklerPopForSkruuia()) return;

  let wrinkler = CCAutomated.getBestWrinklerToPop();
  if (wrinkler) {
    CCAutomated.popWrinkler(wrinkler);
    CCAutomated.Wrinklers.lastPop = now;
  }
};
