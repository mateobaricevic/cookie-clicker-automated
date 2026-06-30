CCAutomated.joinStatusParts = function (parts) {
  let filtered = [];

  for (let i = 0; i < parts.length; i++) {
    if (parts[i]) filtered.push(parts[i]);
  }

  return filtered.join(" | ");
};

CCAutomated.makeStatusLine = function (label, parts) {
  let value = CCAutomated.joinStatusParts(parts);
  if (!value) return null;

  return {
    label: label,
    value: value,
  };
};

CCAutomated.formatComboMultiplier = function (multiplier) {
  if (!isFinite(multiplier)) return "?";
  if (multiplier >= 100) return CCAutomated.formatNumber(multiplier) + "x";
  if (multiplier >= 10) return Math.round(multiplier * 10) / 10 + "x";
  return Math.round(multiplier * 100) / 100 + "x";
};

CCAutomated.getComboStatusText = function (combo) {
  if (!combo) combo = CCAutomated.getActiveComboBuffInfo();
  if (combo.count <= 0) return "No active buffs";

  let multiplierText = CCAutomated.formatComboMultiplier(combo.multiplier) + " CpS";
  if (combo.count === 1) return combo.names[0] + " active, " + multiplierText;

  if (CCAutomated.isHugeComboActive()) return combo.count + " buffs active, huge combo at " + multiplierText;
  if (CCAutomated.isStrongComboActive()) return combo.count + " buffs active, strong combo at " + multiplierText;
  return combo.count + " buffs active, " + multiplierText;
};

CCAutomated.getLuckyBankStatusText = function () {
  let cookies = typeof Game.cookies === "number" ? Game.cookies : 0;
  let cookiesPerSecond = CCAutomated.isStrongComboActive()
    ? CCAutomated.getCookiesPerSecond()
    : CCAutomated.getBaseCookiesPerSecond();
  let target = CCAutomated.getLuckyBankTarget(cookiesPerSecond);
  let shortfall = Math.max(0, target - cookies);

  return {
    target: target,
    shortfall: shortfall,
    text:
      shortfall > 0 ? "Need " + CCAutomated.formatNumber(shortfall) + " more cookies" : "Full; extra cookies are safe",
  };
};

CCAutomated.getComboStatus = function () {
  let combo = CCAutomated.getActiveComboBuffInfo();
  let shimmers = CCAutomated.getGoldenShimmerInfo();
  let lucky = CCAutomated.getLuckyBankStatusText();
  let goldenAutoClicking = CCAutomated.Config.GoldenCookies > 0;
  let shimmerText = "";
  if (shimmers.stormDrops > 0) shimmerText += ", " + shimmers.stormDrops + " storm drops";
  if (shimmers.forced > 0) shimmerText += ", " + shimmers.forced + " forced";
  if (shimmerText) shimmerText = shimmers.total + " visible" + shimmerText;
  else shimmerText = shimmers.total > 0 ? shimmers.total + " visible" : "None visible";
  let luckyBankText =
    lucky.shortfall > 0 ? lucky.text + " for max Lucky payout" : "Full Lucky bank; extra cookies are safe";

  let lines = [
    CCAutomated.makeStatusLine("Status", [CCAutomated.getComboStatusText(combo)]),
    CCAutomated.makeStatusLine("Time", [
      combo.secondsLeft > 0 ? CCAutomated.formatDuration(combo.secondsLeft) + " remaining" : "",
    ]),
    CCAutomated.makeStatusLine("Golden", [goldenAutoClicking ? "" : shimmerText]),
    CCAutomated.makeStatusLine("Lucky bank", [luckyBankText, "target " + CCAutomated.formatNumber(lucky.target)]),
  ];

  return {
    title: "Combo",
    lines: lines.filter(function (line) {
      return line;
    }),
  };
};

CCAutomated.getSpellCost = function (grimoire, spell) {
  if (!grimoire || !spell || typeof grimoire.getSpellCost !== "function") return Infinity;
  try {
    return grimoire.getSpellCost(spell);
  } catch (e) {
    return Infinity;
  }
};

CCAutomated.getGrimoireStatus = function () {
  if (CCAutomated.Config.Grimoire === 0) {
    return {
      title: "Grimoire",
      lines: [{ label: "Status", value: "Inactive" }],
    };
  }

  let grimoire = CCAutomated.getGrimoire();
  if (!grimoire) {
    return {
      title: "Grimoire",
      lines: [{ label: "Status", value: "Wizard tower minigame not ready" }],
    };
  }

  let spell = grimoire.spells && grimoire.spells["hand of fate"];
  let cost = CCAutomated.getSpellCost(grimoire, spell);
  let magic = typeof grimoire.magic === "number" ? grimoire.magic : 0;
  let maxMagic = typeof grimoire.magicM === "number" ? grimoire.magicM : null;
  let combo = CCAutomated.getActiveComboBuffInfo();
  let shimmers = CCAutomated.getGoldenShimmerInfo();
  let canAfford = magic >= cost;
  let statusText = "Waiting for combo";

  if (!spell) statusText = "Force the Hand of Fate unavailable";
  else if (!canAfford) statusText = "Need magic";
  else if (shimmers.total > 0) statusText = "Blocked by visible golden cookie";
  else if (CCAutomated.isStrongComboActive()) statusText = "Ready to cast";

  let lines = [
    CCAutomated.makeStatusLine("Status", [statusText]),
    CCAutomated.makeStatusLine("Magic", [
      CCAutomated.formatNumber(magic) + (maxMagic !== null ? " / " + CCAutomated.formatNumber(maxMagic) : ""),
      isFinite(cost) ? "FtHoF costs " + CCAutomated.formatNumber(cost) : "",
    ]),
    CCAutomated.makeStatusLine("Combo", [
      CCAutomated.getComboStatusText(combo),
      CCAutomated.formatComboMultiplier(combo.multiplier),
    ]),
    CCAutomated.makeStatusLine("Golden", [shimmers.total > 0 ? shimmers.total + " visible" : "None visible"]),
  ];

  return {
    title: "Grimoire",
    lines: lines.filter(function (line) {
      return line;
    }),
  };
};

CCAutomated.getAutoBuyerBankStatus = function () {
  let manualReserve = CCAutomated.getAutoBuyerReserveCookies();
  let strategicReserve = CCAutomated.getStrategicBankReserveCookies();
  let totalReserve = manualReserve + strategicReserve;
  let reasons = [];

  if (manualReserve > 0) reasons.push("manual reserve");
  if (strategicReserve > 0) reasons.push("lucky payouts");

  if (totalReserve <= 0) return "Not keeping extra cookies";
  return "Keeping " + CCAutomated.formatNumber(totalReserve) + " for " + reasons.join(" and ");
};

CCAutomated.getAutoBuyerCandidateTypeText = function (candidate) {
  if (!candidate) return "";
  if (candidate.chainUpgradeName) return "chain";
  if (candidate.type !== "building") return candidate.type;

  let amount = Math.max(1, Math.floor(candidate.amount || 1));
  if (amount === 1) return "building";
  return "building x" + amount;
};

CCAutomated.getAutoBuyerCandidatePriorityText = function (candidate) {
  if (!candidate) return "";
  if (candidate.threshold) return "milestone " + candidate.threshold;
  return candidate.priority || "";
};

CCAutomated.formatAutoBuyerCandidatePlan = function (candidate) {
  if (!candidate || !CCAutomated.isAutoBuyerTargetValid(candidate)) return "";

  candidate = CCAutomated.updateAutoBuyerTargetPrice(candidate);
  if (!candidate) return "";

  return CCAutomated.joinStatusParts([
    candidate.planLabel || candidate.name,
    "wait " + CCAutomated.formatDuration(candidate.waitSeconds),
    candidate.payoffSeconds > 0 ? "payoff " + CCAutomated.formatDuration(candidate.payoffSeconds) : "",
    CCAutomated.getAutoBuyerCandidateTypeText(candidate),
    CCAutomated.getAutoBuyerCandidatePriorityText(candidate),
  ]);
};

CCAutomated.getGardenActionText = function () {
  if (!CCAutomated.Garden.lastAction) return "";
  let ageSeconds = (Date.now() - CCAutomated.Garden.lastActionAt) / 1000;
  if (ageSeconds > 300) return "";
  return CCAutomated.Garden.lastAction;
};

CCAutomated.getGardenStatus = function () {
  if (CCAutomated.Config.Garden === 0) {
    return {
      title: "Garden",
      lines: [{ label: "Status", value: "Inactive" }],
    };
  }

  let summary = CCAutomated.getGardenSummary();
  if (!summary.ready) {
    return {
      title: "Garden",
      lines: [{ label: "Status", value: "Farm minigame not ready" }],
    };
  }

  let modeText = CCAutomated.ConfigData.Garden.label[CCAutomated.Config.Garden];
  let stateText = summary.frozen ? "Frozen" : "Growing";
  let plantText = summary.planted + " planted";
  if (summary.mature > 0) plantText += ", " + summary.mature + " mature";
  let comboText =
    summary.comboReady > 0
      ? summary.comboReady + " combo harvest ready"
      : summary.comboGrowing > 0
        ? summary.comboGrowing + " combo plants growing"
        : "No combo harvest plants";
  let targetSoil = CCAutomated.getGardenTargetSoil(summary);

  let lines = [
    CCAutomated.makeStatusLine("Status", [modeText, stateText]),
    CCAutomated.makeStatusLine("Plants", [plantText]),
    CCAutomated.makeStatusLine("Combo", [comboText]),
    CCAutomated.makeStatusLine("Soil", [
      summary.soil || "Unknown",
      CCAutomated.Config.Garden >= 2 && targetSoil ? "target " + targetSoil : "",
    ]),
    CCAutomated.makeStatusLine("Action", [CCAutomated.getGardenActionText()]),
  ];

  return {
    title: "Garden",
    lines: lines.filter(function (line) {
      return line;
    }),
  };
};

CCAutomated.getPantheonActionText = function () {
  if (!CCAutomated.Pantheon.lastAction) return "";
  let ageSeconds = (Date.now() - CCAutomated.Pantheon.lastActionAt) / 1000;
  if (ageSeconds > 300) return "";
  return CCAutomated.Pantheon.lastAction;
};

CCAutomated.getPantheonStatus = function () {
  if (CCAutomated.Config.Pantheon === 0) {
    return {
      title: "Pantheon",
      lines: [{ label: "Status", value: "Inactive" }],
    };
  }

  let pantheon = CCAutomated.getPantheon();
  if (!pantheon) {
    return {
      title: "Pantheon",
      lines: [{ label: "Status", value: "Temple minigame not ready" }],
    };
  }

  let godzamokSlot = CCAutomated.getPantheonGodSlotMatching(pantheon, CCAutomated.Pantheon.godzamokPattern);
  let skruuiaSlot = CCAutomated.getSkruuiaSlot();
  let clickSecondsLeft = CCAutomated.getClickComboSecondsLeft();
  let sellable = CCAutomated.getTotalGodzamokSellableBuildings();
  let wrinklers = CCAutomated.getWrinklerSummary();
  let statusText = "Waiting for click combo";
  let wrinklerText = wrinklers.attached + " attached";

  if (godzamokSlot < 0) statusText = "Godzamok not slotted";
  else if (CCAutomated.hasGodzamokBuff()) statusText = "Godzamok buff active";
  else if (clickSecondsLeft > 2 && sellable > 0) statusText = "Ready to sell";
  else if (clickSecondsLeft > 0 && sellable <= 0) statusText = "No low-value buildings to sell";

  if (wrinklers.shiny > 0) wrinklerText += ", " + wrinklers.shiny + " shiny";
  if (CCAutomated.Config.Wrinklers === 0) wrinklerText += ", automation off";
  else if (skruuiaSlot >= 0) wrinklerText += ", Skruuia bonus active";
  else if (wrinklers.attached > 0) wrinklerText += ", holding for Skruuia";

  let lines = [
    CCAutomated.makeStatusLine("Status", [statusText]),
    CCAutomated.makeStatusLine("God", [
      godzamokSlot >= 0 ? CCAutomated.getPantheonSlotLabel(godzamokSlot) + " slot" : "Not slotted",
    ]),
    CCAutomated.makeStatusLine("Skruuia", [
      skruuiaSlot >= 0 ? CCAutomated.getPantheonSlotLabel(skruuiaSlot) + " slot" : "Not slotted",
    ]),
    CCAutomated.makeStatusLine("Wrinklers", [wrinklerText]),
    CCAutomated.makeStatusLine("Combo", [
      clickSecondsLeft > 0 ? "Click buff for " + CCAutomated.formatDuration(clickSecondsLeft) : "No click buff",
    ]),
    CCAutomated.makeStatusLine("Sellable", [sellable + " buildings"]),
    CCAutomated.makeStatusLine("Action", [CCAutomated.getPantheonActionText()]),
  ];

  return {
    title: "Pantheon",
    lines: lines.filter(function (line) {
      return line;
    }),
  };
};

CCAutomated.getSeasonActionText = function () {
  if (!CCAutomated.Season.lastAction) return "";
  let ageSeconds = (Date.now() - CCAutomated.Season.lastActionAt) / 1000;
  if (ageSeconds > 300) return "";
  return CCAutomated.Season.lastAction;
};

CCAutomated.getSeasonName = function () {
  if (Game.season) return Game.season;
  return "none";
};

CCAutomated.getSeasonStatus = function () {
  if (CCAutomated.Config.Season === 0) {
    return {
      title: "Seasons",
      lines: [{ label: "Status", value: "Inactive" }],
    };
  }

  let seasonName = CCAutomated.getSeasonName();
  if (seasonName === "none") {
    return {
      title: "Seasons",
      lines: [{ label: "Status", value: "No season active" }],
    };
  }

  let reindeer = CCAutomated.getReindeerShimmerInfo();
  let drops = CCAutomated.getSeasonDropSummary(seasonName);
  let candidates = CCAutomated.getSeasonUpgradeCandidates();
  let affordable = CCAutomated.getBestAffordableSeasonUpgrade();
  let nextUpgrade = affordable || candidates[0] || null;
  let heldSwitches = CCAutomated.getHeldSeasonSwitchUpgradeCandidates();
  let heldSwitch = heldSwitches[0] || null;
  let statusText = seasonName + ": watching for reindeer";

  if (reindeer.total > 0) statusText = seasonName + ": clicking reindeer";
  else if (CCAutomated.Config.Season >= 2 && affordable) statusText = seasonName + ": buying " + affordable.name;
  else if (CCAutomated.Config.Season >= 2 && nextUpgrade) statusText = seasonName + ": saving for " + nextUpgrade.name;
  else if (CCAutomated.Config.Season >= 2 && heldSwitch)
    statusText = seasonName + ": holding " + heldSwitch.name + " until drops are complete";
  else if (CCAutomated.Config.Season >= 2) statusText = seasonName + ": watching for seasonal drops";

  let upgradeText = nextUpgrade
    ? nextUpgrade.name + " (" + CCAutomated.formatNumber(nextUpgrade.price) + ")"
    : "None visible";
  let switchText = heldSwitch
    ? "Holding " + heldSwitch.name + " for " + CCAutomated.formatNumber(drops.missing) + " missing drops"
    : "";

  let lines = [
    CCAutomated.makeStatusLine("Status", [statusText]),
    CCAutomated.makeStatusLine("Reindeer", [reindeer.total + " visible"]),
    CCAutomated.makeStatusLine("Drops", [CCAutomated.getSeasonDropStatusText(drops)]),
    CCAutomated.makeStatusLine("Upgrade", [upgradeText]),
    CCAutomated.makeStatusLine("Switch", [switchText]),
    CCAutomated.makeStatusLine("Action", [CCAutomated.getSeasonActionText()]),
  ];

  return {
    title: "Seasons",
    lines: lines.filter(function (line) {
      return line;
    }),
  };
};

CCAutomated.getAutoBuyerStatus = function () {
  if (CCAutomated.Config.AutoBuyer === 0) {
    return {
      title: "Auto-buyer",
      lines: [{ label: "Status", value: "Inactive" }],
    };
  }

  let candidate = CCAutomated.updateAutoBuyerTargetPrice(CCAutomated.AutoBuyer.target);
  if (!candidate) {
    return {
      title: "Auto-buyer",
      lines: [
        {
          label: "Status",
          value: "Scanning for target",
        },
      ].filter(function (line) {
        return line;
      }),
    };
  }

  let cookies = typeof Game.cookies === "number" ? Game.cookies : 0;
  let spendableCookies = CCAutomated.getAutoBuyerSpendableCookies(cookies);
  let cookiesPerSecond = CCAutomated.getAutoBuyerPlanningCookiesPerSecond();
  let waitSeconds = CCAutomated.getAutoBuyerWaitSeconds(candidate.price, spendableCookies, cookiesPerSecond);
  let displayGain =
    typeof candidate.chainGain === "number"
      ? candidate.chainGain
      : typeof candidate.realGain === "number"
        ? candidate.realGain
        : candidate.gain;
  let canBuyNow = candidate.affordable && CCAutomated.canBuyDuringCombo(candidate);
  let isHoldingForCombo =
    candidate.affordable && CCAutomated.isStrongComboActive() && !CCAutomated.canBuyDuringCombo(candidate);
  let statusText = canBuyNow ? "Ready to buy" : "Waiting for " + CCAutomated.formatDuration(waitSeconds);
  let gainText = displayGain > 0 ? "+" + CCAutomated.formatNumber(displayGain) + " CpS" : "";
  let targetTypeText = CCAutomated.getAutoBuyerCandidateTypeText(candidate);
  let priorityText = CCAutomated.getAutoBuyerCandidatePriorityText(candidate);
  if (displayGain === 0 && candidate.priority) gainText = "Strategic upgrade";
  if (isHoldingForCombo) statusText = "Waiting because buying now would reduce combo payout";

  let lines = [
    CCAutomated.makeStatusLine("Status", [statusText]),
    CCAutomated.makeStatusLine("Target", [(candidate.planLabel || candidate.name) + " (" + targetTypeText + ")"]),
    CCAutomated.makeStatusLine("Value", [
      gainText,
      candidate.payoffSeconds > 0 ? "payoff " + CCAutomated.formatDuration(candidate.payoffSeconds) : "",
      priorityText,
    ]),
    CCAutomated.makeStatusLine("Bank", [CCAutomated.getAutoBuyerBankStatus()]),
  ];

  let topCandidates = CCAutomated.AutoBuyer.candidates || [];
  for (let i = 0; i < topCandidates.length; i++) {
    lines.splice(
      lines.length - 1,
      0,
      CCAutomated.makeStatusLine("Plan " + (i + 1), [CCAutomated.formatAutoBuyerCandidatePlan(topCandidates[i])]),
    );
  }

  return {
    title: "Auto-buyer",
    lines: lines.filter(function (line) {
      return line;
    }),
  };
};
