CCAutomated.canUseLumps = function (grimoire) {
  if (typeof Game.canLumps !== "function" || !Game.canLumps()) return false;
  if (Game.lumps <= 100 || !grimoire.lumpRefill) return false;
  if (!grimoire.lumpRefill.classList) return true;
  return !grimoire.lumpRefill.classList.contains("disabled");
};

CCAutomated.canCastSpell = function (grimoire, spell) {
  return grimoire && spell && grimoire.magic >= CCAutomated.getSpellCost(grimoire, spell);
};

CCAutomated.shouldCastForceHandOfFate = function (grimoire, spell) {
  if (!CCAutomated.canCastSpell(grimoire, spell)) return false;
  if (CCAutomated.hasActiveGoldenShimmer()) return false;

  let combo = CCAutomated.getActiveComboBuffInfo();
  if (combo.hasFrenzy || combo.hasBuildingSpecial || combo.hasDragonBuff) return true;
  if (combo.multiplier >= CCAutomated.Strategy.strongBuffMultiplier) return true;

  return false;
};

CCAutomated.shouldCastConjureBakedGoods = function (grimoire, spell) {
  if (!CCAutomated.canCastSpell(grimoire, spell)) return false;
  return CCAutomated.getCpsMultiplier() >= CCAutomated.Strategy.hugeBuffMultiplier;
};

CCAutomated.shouldUseLumpForGrimoire = function (grimoire) {
  return CCAutomated.isHugeComboActive() && CCAutomated.canUseLumps(grimoire);
};

CCAutomated.shouldSellWizardTowersForCombo = function (grimoire) {
  if (!CCAutomated.isHugeComboActive()) return false;
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
    if (CCAutomated.shouldCastForceHandOfFate(grimoire, spell)) {
      grimoire.castSpell(spell);
    }
    if (CCAutomated.shouldSellWizardTowersForCombo(grimoire)) {
      let tower = Game.Objects["Wizard tower"];
      tower.sell(tower.amount - 30);
    }
    spell = grimoire.spells["conjure baked goods"];
    if (CCAutomated.getCpsMultiplier() >= CCAutomated.Strategy.hugeBuffMultiplier) {
      if (CCAutomated.shouldCastConjureBakedGoods(grimoire, spell)) {
        grimoire.castSpell(spell);
        return;
      }
      if (CCAutomated.shouldUseLumpForGrimoire(grimoire)) {
        grimoire.lumpRefill.click();
      }
    }
  }
};
