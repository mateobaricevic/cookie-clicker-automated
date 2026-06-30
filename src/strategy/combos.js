CCAutomated.getCpsMultiplier = function () {
  let multiplier = 1;
  if (!Game.buffs) return multiplier;

  for (let buffName in Game.buffs) {
    let buff = Game.buffs[buffName];
    if (typeof buff.multCpS === "number") multiplier *= buff.multCpS;
  }
  return multiplier;
};

CCAutomated.getBuffTimeLeftSeconds = function (buff) {
  if (!buff || typeof buff.time !== "number") return 0;
  if (typeof Game.fps !== "number" || Game.fps <= 0) return buff.time;
  return buff.time / Game.fps;
};

CCAutomated.hasBuffMatching = function (pattern) {
  if (!Game.buffs) return false;

  for (let buffName in Game.buffs) {
    if (pattern.test(buffName)) return true;
  }

  return false;
};

CCAutomated.getGoldenShimmerInfo = function () {
  let info = {
    total: 0,
    regular: 0,
    stormDrops: 0,
    forced: 0,
  };
  if (!Game.shimmers) return info;

  for (let i = 0; i < Game.shimmers.length; i++) {
    let shimmer = Game.shimmers[i];
    if (!shimmer || shimmer.type !== "golden" || shimmer.life <= 0) continue;

    info.total++;
    if (shimmer.force === "cookie storm drop") info.stormDrops++;
    else info.regular++;
    if (shimmer.force) info.forced++;
  }

  return info;
};

CCAutomated.hasActiveGoldenShimmer = function () {
  return CCAutomated.getGoldenShimmerInfo().total > 0;
};

CCAutomated.getActiveComboBuffInfo = function () {
  let info = {
    count: 0,
    names: [],
    multiplier: CCAutomated.getCpsMultiplier(),
    hasFrenzy: false,
    hasClickBuff: false,
    hasBuildingSpecial: false,
    hasDragonBuff: false,
    secondsLeft: 0,
  };
  if (!Game.buffs) return info;

  for (let buffName in Game.buffs) {
    let buff = Game.buffs[buffName];
    let lowerName = buffName.toLowerCase();
    info.count++;
    info.names.push(buffName);
    info.secondsLeft = Math.max(info.secondsLeft, CCAutomated.getBuffTimeLeftSeconds(buff));
    if (lowerName.indexOf("frenzy") !== -1) info.hasFrenzy = true;
    if (lowerName.indexOf("click") !== -1) info.hasClickBuff = true;
    if (lowerName.indexOf("dragon") !== -1) info.hasDragonBuff = true;
    if (lowerName.indexOf("building") !== -1 || lowerName.indexOf("special") !== -1) info.hasBuildingSpecial = true;
  }

  return info;
};

CCAutomated.isStrongComboActive = function () {
  let combo = CCAutomated.getActiveComboBuffInfo();
  return (
    combo.multiplier >= CCAutomated.Strategy.strongBuffMultiplier ||
    combo.hasFrenzy ||
    combo.hasBuildingSpecial ||
    combo.hasDragonBuff
  );
};

CCAutomated.isHugeComboActive = function () {
  let combo = CCAutomated.getActiveComboBuffInfo();
  return combo.multiplier >= CCAutomated.Strategy.hugeBuffMultiplier || combo.hasClickBuff;
};
