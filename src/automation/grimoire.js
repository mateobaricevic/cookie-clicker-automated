CCAutomated.canUseLumps = function (grimoire) {
  if (typeof Game.canLumps !== "function" || !Game.canLumps()) return false;
  if (Game.lumps <= 100 || !grimoire.lumpRefill) return false;
  if (!grimoire.lumpRefill.classList) return true;
  return !grimoire.lumpRefill.classList.contains("disabled");
};

CCAutomated.canCastSpell = function (grimoire, spell) {
  return grimoire && spell && grimoire.magic >= CCAutomated.getSpellCost(grimoire, spell);
};

CCAutomated.getForceHandOfFateBackfireChance = function (grimoire, spell) {
  if (!spell) return null;
  if (typeof spell.failChance === "number") return spell.failChance;
  if (typeof spell.fail === "number") return spell.fail;
  return CCAutomated.Strategy.fthofBaseBackfireChance;
};

CCAutomated.getForceHandOfFatePrediction = function (grimoire, spell) {
  let prediction = {
    label: "FtHoF outcome unknown",
    isKnown: false,
    isBackfire: false,
  };
  if (!grimoire || !spell) return prediction;

  let failChance = CCAutomated.getForceHandOfFateBackfireChance(grimoire, spell);
  if (typeof failChance === "number" && isFinite(failChance)) {
    prediction.label = "FtHoF backfire risk " + Math.round(failChance * 100) + "%";
  }

  if (
    typeof Math.seedrandom !== "function" ||
    !Game.seed ||
    typeof grimoire.spellsCastTotal !== "number" ||
    typeof failChance !== "number"
  )
    return prediction;

  try {
    Math.seedrandom(Game.seed + "/" + grimoire.spellsCastTotal);
    prediction.isBackfire = Math.random() < failChance;
    prediction.isKnown = true;
    prediction.label = prediction.isBackfire ? "Next FtHoF likely backfires" : "Next FtHoF likely succeeds";
  } catch (e) {
    console.warn("[CCAutomated] Failed to predict Force the Hand of Fate", e);
  } finally {
    Math.seedrandom();
  }

  return prediction;
};

CCAutomated.getForceHandOfFateDecision = function (grimoire, spell) {
  let combo = CCAutomated.getActiveComboBuffInfo();
  let shimmers = CCAutomated.getGoldenShimmerInfo();
  let prediction = CCAutomated.getForceHandOfFatePrediction(grimoire, spell);
  let decision = {
    shouldCast: false,
    reason: "Waiting for combo",
    prediction: prediction,
  };

  if (!spell) {
    decision.reason = "Force the Hand of Fate unavailable";
    return decision;
  }
  if (!CCAutomated.canCastSpell(grimoire, spell)) {
    decision.reason = "Need magic";
    return decision;
  }
  if (shimmers.regular > 0) {
    decision.reason = "Blocked by natural golden cookie";
    return decision;
  }
  if (shimmers.forced > 0 && !CCAutomated.isComboExecutionWindow(combo)) {
    decision.reason = "Holding forced golden cookie";
    return decision;
  }
  if (!CCAutomated.isComboWorthStacking(combo)) {
    decision.reason = "Waiting for stackable combo";
    return decision;
  }
  if (prediction.isKnown && prediction.isBackfire && !CCAutomated.isComboExecutionWindow(combo)) {
    decision.reason = "Skipping predicted backfire";
    return decision;
  }

  decision.shouldCast = true;
  decision.reason = "Ready to cast";
  return decision;
};

CCAutomated.shouldCastForceHandOfFate = function (grimoire, spell) {
  return CCAutomated.getForceHandOfFateDecision(grimoire, spell).shouldCast;
};

CCAutomated.shouldCastConjureBakedGoods = function (grimoire, spell) {
  if (!CCAutomated.canCastSpell(grimoire, spell)) return false;
  return CCAutomated.getCpsMultiplier() >= CCAutomated.Strategy.hugeBuffMultiplier;
};

CCAutomated.shouldUseLumpForGrimoire = function (grimoire) {
  return CCAutomated.isComboExecutionWindow() && CCAutomated.canUseLumps(grimoire);
};

CCAutomated.shouldSellWizardTowersForCombo = function (grimoire) {
  if (!CCAutomated.isComboExecutionWindow()) return false;
  if (!Game.shimmerTypes || !Game.shimmerTypes["golden"] || Game.shimmerTypes["golden"].n < 2) return false;
  if (!Game.Objects["Wizard tower"] || Game.Objects["Wizard tower"].amount <= 30) return false;
  return grimoire && grimoire.magic > 30;
};


CCAutomated.getGrimoire = function () {
  let tower = Game.Objects && Game.Objects["Wizard tower"];
  if (!tower) return null;
  if (typeof Game.isMinigameReady === "function" && !Game.isMinigameReady(tower)) return null;
  return tower.minigame || null;
};

// Handle Wizard towers: Grimoire minigame
CCAutomated.handleGrimoire = function () {
  if (CCAutomated.Config.Grimoire === 0) return;
  let grimoire = CCAutomated.getGrimoire();
  if (grimoire) {
    let spell = grimoire.spells["hand of fate"];
    let fthofDecision = CCAutomated.getForceHandOfFateDecision(grimoire, spell);
    if (fthofDecision.shouldCast) {
      grimoire.castSpell(spell);
      CCAutomated.setComboAction("Cast Force the Hand of Fate");
    }
    if (CCAutomated.shouldSellWizardTowersForCombo(grimoire)) {
      let tower = Game.Objects["Wizard tower"];
      tower.sell(tower.amount - 30);
      CCAutomated.setComboAction("Sold wizard towers for another spell");
    }
    spell = grimoire.spells["conjure baked goods"];
    if (CCAutomated.isComboExecutionWindow()) {
      if (CCAutomated.shouldCastConjureBakedGoods(grimoire, spell)) {
        grimoire.castSpell(spell);
        CCAutomated.setComboAction("Cast Conjure Baked Goods");
        return;
      }
      if (CCAutomated.shouldUseLumpForGrimoire(grimoire)) {
        grimoire.lumpRefill.click();
        CCAutomated.setComboAction("Refilled magic with a sugar lump");
      }
    }
  }
};
