CCAutomated.getGarden = function () {
  let farm = Game.Objects && Game.Objects["Farm"];
  if (!farm) return null;
  if (typeof Game.isMinigameReady === "function" && !Game.isMinigameReady(farm)) return null;
  return farm.minigame || null;
};

CCAutomated.getGardenPlotWidth = function (garden) {
  if (!garden || !garden.plot || !garden.plot.length) return 0;
  return garden.plot[0] ? garden.plot[0].length : 0;
};

CCAutomated.getGardenPlotHeight = function (garden) {
  if (!garden || !garden.plot) return 0;
  return garden.plot.length;
};

CCAutomated.getGardenTile = function (garden, x, y) {
  if (!garden || !garden.plot || !garden.plot[y]) return null;
  return garden.plot[y][x] || null;
};

CCAutomated.getGardenTilePlant = function (garden, tile) {
  if (!garden || !tile || !tile[0] || !garden.plantsById) return null;
  return garden.plantsById[tile[0] - 1] || null;
};

CCAutomated.isGardenComboHarvestPlant = function (plant) {
  if (!plant || !plant.name) return false;

  for (let i = 0; i < CCAutomated.Garden.comboHarvestPlantNames.length; i++) {
    if (plant.name === CCAutomated.Garden.comboHarvestPlantNames[i]) return true;
  }

  return false;
};

CCAutomated.isGardenTileMature = function (plant, tile) {
  if (!plant || !tile || typeof tile[1] !== "number") return false;
  if (typeof plant.mature !== "number") return false;
  return tile[1] >= plant.mature;
};

CCAutomated.getGardenSummary = function () {
  let garden = CCAutomated.getGarden();
  let summary = {
    ready: !!garden,
    frozen: false,
    soil: "",
    width: 0,
    height: 0,
    planted: 0,
    mature: 0,
    growing: 0,
    comboReady: 0,
    comboGrowing: 0,
    comboPlantNames: [],
  };
  if (!garden) return summary;

  summary.frozen = !!garden.freeze;
  summary.soil = CCAutomated.getGardenSoilName(garden);
  summary.width = CCAutomated.getGardenPlotWidth(garden);
  summary.height = CCAutomated.getGardenPlotHeight(garden);

  for (let y = 0; y < summary.height; y++) {
    for (let x = 0; x < summary.width; x++) {
      let tile = CCAutomated.getGardenTile(garden, x, y);
      let plant = CCAutomated.getGardenTilePlant(garden, tile);
      if (!plant) continue;

      summary.planted++;
      if (CCAutomated.isGardenTileMature(plant, tile)) summary.mature++;
      else summary.growing++;

      if (CCAutomated.isGardenComboHarvestPlant(plant)) {
        if (CCAutomated.isGardenTileMature(plant, tile)) summary.comboReady++;
        else summary.comboGrowing++;
        if (summary.comboPlantNames.indexOf(plant.name) === -1) summary.comboPlantNames.push(plant.name);
      }
    }
  }

  return summary;
};

CCAutomated.setGardenAction = function (action) {
  CCAutomated.Garden.lastAction = action;
  CCAutomated.Garden.lastActionAt = Date.now();
};

CCAutomated.harvestGardenTile = function (garden, x, y) {
  if (!garden || typeof garden.harvest !== "function") return false;

  try {
    garden.harvest(x, y);
    return true;
  } catch (e) {
    console.warn("[CCAutomated] Failed to harvest garden tile", x, y, e);
  }

  return false;
};

CCAutomated.setGardenFrozen = function (garden, frozen) {
  if (!garden || !!garden.freeze === frozen) return false;

  try {
    if (typeof garden.toggleFreeze === "function") {
      garden.toggleFreeze();
      return true;
    }
  } catch (e) {
    console.warn("[CCAutomated] Failed to change garden freeze state", e);
  }

  return false;
};

CCAutomated.getGardenSoilName = function (garden) {
  if (!garden || typeof garden.soil !== "number" || !garden.soilsById) return "";
  let soil = garden.soilsById[garden.soil];
  return soil && soil.name ? soil.name : "";
};

CCAutomated.getGardenSoilIdByName = function (garden, soilName) {
  if (!garden || !garden.soilsById || !soilName) return -1;

  for (let i = 0; i < garden.soilsById.length; i++) {
    let soil = garden.soilsById[i];
    if (soil && soil.name && soil.name.toLowerCase() === soilName.toLowerCase()) return i;
  }

  return -1;
};

CCAutomated.setGardenSoil = function (garden, soilName) {
  if (!garden || !soilName) return false;
  let soilId = CCAutomated.getGardenSoilIdByName(garden, soilName);
  if (soilId < 0 || garden.soil === soilId) return false;

  try {
    if (typeof garden.changeSoil === "function") {
      garden.changeSoil(soilId);
      return garden.soil === soilId;
    }
  } catch (e) {
    console.warn("[CCAutomated] Failed to change garden soil", soilName, e);
  }

  return false;
};

CCAutomated.getGardenTargetSoil = function (summary) {
  if (!summary || !summary.ready) return "";
  if (summary.comboReady > 0) return CCAutomated.Garden.soilByGoal.holding;
  if (summary.growing > 0) return CCAutomated.Garden.soilByGoal.growing;
  if (summary.planted === 0) return CCAutomated.Garden.soilByGoal.mutation;
  return "";
};

CCAutomated.handleGarden = function () {
  if (CCAutomated.Config.Garden === 0) return;

  let garden = CCAutomated.getGarden();
  if (!garden) return;

  let summary = CCAutomated.getGardenSummary();
  let harvested = 0;

  if (summary.comboReady > 0 && CCAutomated.isStrongComboActive()) {
    if (CCAutomated.setGardenFrozen(garden, false)) CCAutomated.setGardenAction("Unfroze for combo harvest");

    for (let y = 0; y < summary.height; y++) {
      for (let x = 0; x < summary.width; x++) {
        let tile = CCAutomated.getGardenTile(garden, x, y);
        let plant = CCAutomated.getGardenTilePlant(garden, tile);
        if (!CCAutomated.isGardenComboHarvestPlant(plant)) continue;
        if (!CCAutomated.isGardenTileMature(plant, tile)) continue;
        if (CCAutomated.harvestGardenTile(garden, x, y)) harvested++;
      }
    }
  }

  if (harvested > 0) {
    CCAutomated.setGardenAction("Harvested " + harvested + " combo plant" + (harvested === 1 ? "" : "s"));
    return;
  }

  if (CCAutomated.Config.Garden < 2) return;

  if (summary.comboReady > 0 && !CCAutomated.isStrongComboActive()) {
    if (CCAutomated.setGardenFrozen(garden, true)) CCAutomated.setGardenAction("Froze mature combo plants");
  } else if (summary.growing > 0) {
    if (CCAutomated.setGardenFrozen(garden, false)) CCAutomated.setGardenAction("Unfroze garden growth");
  }

  let targetSoil = CCAutomated.getGardenTargetSoil(summary);
  if (targetSoil && CCAutomated.setGardenSoil(garden, targetSoil)) {
    CCAutomated.setGardenAction("Changed soil to " + targetSoil);
  }
};
