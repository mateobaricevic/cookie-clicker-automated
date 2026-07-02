CCAutomated.getPantheon = function () {
  let temple = Game.Objects && Game.Objects["Temple"];
  if (!temple) return null;
  if (typeof Game.isMinigameReady === "function" && !Game.isMinigameReady(temple)) return null;
  return temple.minigame || null;
};

CCAutomated.getPantheonGodFromSlot = function (pantheon, slotIndex) {
  if (!pantheon || !pantheon.slot) return null;
  let slot = pantheon.slot[slotIndex];
  if (slot && slot.name) return slot;

  let godId = -1;
  if (typeof slot === "number") godId = slot;
  else if (slot && typeof slot.id === "number") godId = slot.id;

  if (godId >= 0 && pantheon.godsById) return pantheon.godsById[godId] || null;

  if (pantheon.godsById) {
    for (let i = 0; i < pantheon.godsById.length; i++) {
      let god = pantheon.godsById[i];
      if (god && god.slot === slotIndex) return god;
    }
  }

  return null;
};

CCAutomated.getPantheonGodSlotMatching = function (pantheon, pattern) {
  if (!pantheon || !pattern) return -1;

  for (let i = 0; i < 3; i++) {
    let god = CCAutomated.getPantheonGodFromSlot(pantheon, i);
    if (god && god.name && pattern.test(god.name)) return i;
  }

  return -1;
};

CCAutomated.getPantheonSlotLabel = function (slotIndex) {
  let labels = ["diamond", "ruby", "jade"];
  return labels[slotIndex] || "not slotted";
};

CCAutomated.isGodzamokSlotted = function () {
  return CCAutomated.getPantheonGodSlotMatching(CCAutomated.getPantheon(), CCAutomated.Pantheon.godzamokPattern) >= 0;
};

CCAutomated.getSkruuiaSlot = function () {
  return CCAutomated.getPantheonGodSlotMatching(CCAutomated.getPantheon(), CCAutomated.Pantheon.skruuiaPattern);
};

CCAutomated.isSkruuiaSlotted = function () {
  return CCAutomated.getSkruuiaSlot() >= 0;
};

CCAutomated.hasGodzamokBuff = function () {
  return CCAutomated.hasBuffMatching(CCAutomated.Pantheon.godzamokBuffPattern);
};

CCAutomated.getClickComboSecondsLeft = function () {
  let secondsLeft = 0;
  if (!Game.buffs) return secondsLeft;

  for (let buffName in Game.buffs) {
    if (!CCAutomated.Pantheon.clickBuffPattern.test(buffName)) continue;
    secondsLeft = Math.max(secondsLeft, CCAutomated.getBuffTimeLeftSeconds(Game.buffs[buffName]));
  }

  return secondsLeft;
};

CCAutomated.getGodzamokSellableBuildings = function () {
  let buildings = [];
  for (let i = 0; i < CCAutomated.Pantheon.lowValueBuildingNames.length; i++) {
    let name = CCAutomated.Pantheon.lowValueBuildingNames[i];
    let object = Game.Objects && Game.Objects[name];
    if (!object || typeof object.amount !== "number" || typeof object.sell !== "function") continue;

    let sellable = Math.min(
      CCAutomated.Pantheon.maxSellPerBuilding,
      Math.max(0, object.amount - CCAutomated.Pantheon.minKeep),
    );
    if (sellable > 0) {
      buildings.push({
        object: object,
        name: name,
        sellable: sellable,
      });
    }
  }

  return buildings;
};

CCAutomated.getTotalGodzamokSellableBuildings = function () {
  let total = 0;
  let buildings = CCAutomated.getGodzamokSellableBuildings();

  for (let i = 0; i < buildings.length; i++) {
    total += buildings[i].sellable;
  }

  return total;
};

CCAutomated.shouldTriggerGodzamokCombo = function () {
  if (CCAutomated.Config.Pantheon === 0) return false;
  if (!CCAutomated.isGodzamokSlotted()) return false;
  if (CCAutomated.hasGodzamokBuff()) return false;
  if (CCAutomated.getClickComboSecondsLeft() <= 2) return false;
  if (Date.now() - CCAutomated.Pantheon.lastActionAt < CCAutomated.Pantheon.cooldownMs) return false;
  return CCAutomated.getTotalGodzamokSellableBuildings() > 0;
};

CCAutomated.setPantheonAction = function (action) {
  CCAutomated.Pantheon.lastAction = action;
  CCAutomated.Pantheon.lastActionAt = Date.now();
};

CCAutomated.triggerGodzamokCombo = function () {
  let sold = 0;
  let buildings = CCAutomated.getGodzamokSellableBuildings();

  for (let i = 0; i < buildings.length; i++) {
    if (sold >= CCAutomated.Pantheon.maxSellTotal) break;
    let amount = Math.min(buildings[i].sellable, CCAutomated.Pantheon.maxSellTotal - sold);
    if (amount <= 0) continue;

    try {
      buildings[i].object.sell(amount);
      sold += amount;
    } catch (e) {
      console.warn("[CCAutomated] Failed to sell for Godzamok", buildings[i].name, e);
    }
  }

  if (sold > 0) {
    CCAutomated.setPantheonAction("Sold " + sold + " buildings for Godzamok");
    CCAutomated.setComboAction("Sold " + sold + " buildings for Godzamok");
  }
  return sold > 0;
};

CCAutomated.handlePantheon = function () {
  if (CCAutomated.shouldTriggerGodzamokCombo()) CCAutomated.triggerGodzamokCombo();
};
