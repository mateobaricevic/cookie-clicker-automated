CCAutomated.restoreDefaultConfig = function () {
  CCAutomated.Config = Object.assign({}, CCAutomated.ConfigDefault);
  CCAutomated.saveConfig(CCAutomated.Config);
  Game.UpdateMenu();
};

CCAutomated.saveConfig = function (config) {
  try {
    window.localStorage.setItem(CCAutomated.ConfigPrefix, JSON.stringify(config));
  } catch (e) {
    console.warn("[CCAutomated] Failed to save config", e);
  }
};

CCAutomated.loadConfig = function () {
  try {
    let storedConfig = window.localStorage.getItem(CCAutomated.ConfigPrefix);
    if (!storedConfig) {
      CCAutomated.Config = Object.assign({}, CCAutomated.ConfigDefault);
      CCAutomated.saveConfig(CCAutomated.Config);
      return;
    }

    CCAutomated.Config = JSON.parse(storedConfig);
    for (let i in CCAutomated.ConfigDefault) {
      if (
        typeof CCAutomated.Config[i] !== "number" ||
        !Number.isInteger(CCAutomated.Config[i]) ||
        CCAutomated.Config[i] < 0 ||
        CCAutomated.Config[i] >= CCAutomated.ConfigData[i].label.length
      ) {
        throw new Error("Invalid config entry: " + i);
      }
    }
    for (let key in CCAutomated.Config) {
      if (typeof CCAutomated.ConfigDefault[key] === "undefined") throw new Error("Unknown config entry: " + key);
    }
  } catch (e) {
    console.warn("[CCAutomated] Failed to load config; restoring defaults", e);
    CCAutomated.Config = Object.assign({}, CCAutomated.ConfigDefault);
    CCAutomated.saveConfig(CCAutomated.Config);
  }
};

CCAutomated.toggleConfigEntry = function (config) {
  CCAutomated.Config[config] = (CCAutomated.Config[config] + 1) % CCAutomated.ConfigData[config].label.length;

  let option = l(CCAutomated.ConfigPrefix + config);
  if (option) {
    option.textContent = CCAutomated.ConfigData[config].label[CCAutomated.Config[config]];
    option.className = CCAutomated.isConfigEntryOff(config) ? "option off" : "option";
  }
  if (config === "AutoBuyer" || config === "AutoBuyerReserve") CCAutomated.AutoBuyer.target = null;
  CCAutomated.saveConfig(CCAutomated.Config);
};

CCAutomated.isConfigEntryOff = function (config) {
  return CCAutomated.Config[config] === 0 && CCAutomated.ConfigData[config].label[0] === "OFF";
};

CCAutomated.getConfigDisplayLabel = function (config) {
  let data = CCAutomated.ConfigData[config];
  if (!data) return config;
  if (data.name && data.description) return data.name + " - " + data.description;
  return data.name || data.description || config;
};

CCAutomated.ConfigDisplay.displayMenu = function () {
  let frag = document.createDocumentFragment();
  let subsection = document.createElement("div");
  subsection.className = "subsection";
  subsection.style.padding = "0px";
  frag.appendChild(subsection);

  let div = document.createElement("div");
  div.className = "title";
  div.textContent = "Cookie Clicker Automated";
  subsection.appendChild(div);
  let listing = function (config) {
    let div = document.createElement("div");
    div.className = "listing";
    let a = document.createElement("a");
    a.className = "option";
    if (CCAutomated.isConfigEntryOff(config)) a.className = "option off";
    a.id = CCAutomated.ConfigPrefix + config;
    a.onclick = function () {
      CCAutomated.toggleConfigEntry(config);
    };
    a.textContent = CCAutomated.ConfigData[config].label[CCAutomated.Config[config]];
    div.appendChild(a);
    let label = document.createElement("label");
    label.textContent = CCAutomated.getConfigDisplayLabel(config);
    div.appendChild(label);
    return div;
  };
  for (let config in CCAutomated.ConfigDefault) {
    subsection.appendChild(listing(config));
  }
  subsection.appendChild(CCAutomated.ConfigDisplay.autoBuyerStatus());
  subsection.appendChild(CCAutomated.ConfigDisplay.grimoireStatus());
  subsection.appendChild(CCAutomated.ConfigDisplay.pantheonStatus());
  subsection.appendChild(CCAutomated.ConfigDisplay.gardenStatus());
  subsection.appendChild(CCAutomated.ConfigDisplay.seasonStatus());
  subsection.appendChild(CCAutomated.ConfigDisplay.comboStatus());
  subsection.appendChild(CCAutomated.ConfigDisplay.ascensionStatus());

  let menu = l("menu");
  let menuContent = menu && menu.childNodes[2];
  if (!menuContent) return;
  menuContent.insertBefore(frag, menuContent.childNodes[menuContent.childNodes.length - 1]);
};

CCAutomated.ConfigDisplay.statusPanel = function (status) {
  let div = document.createElement("div");
  div.className = "listing";
  div.style.opacity = "0.75";
  div.style.lineHeight = "140%";

  let title = document.createElement("div");
  title.style.fontWeight = "bold";
  title.style.marginBottom = "2px";
  title.textContent = status.title;
  div.appendChild(title);

  for (let i = 0; i < status.lines.length; i++) {
    let line = document.createElement("div");
    line.style.display = "grid";
    line.style.gridTemplateColumns = "74px 1fr";
    line.style.columnGap = "8px";

    let label = document.createElement("span");
    label.style.opacity = "0.7";
    label.textContent = status.lines[i].label;
    line.appendChild(label);

    let value = document.createElement("span");
    value.textContent = status.lines[i].value;
    line.appendChild(value);

    div.appendChild(line);
  }

  return div;
};

CCAutomated.ConfigDisplay.comboStatus = function () {
  return CCAutomated.ConfigDisplay.statusPanel(CCAutomated.getComboStatus());
};

CCAutomated.ConfigDisplay.grimoireStatus = function () {
  return CCAutomated.ConfigDisplay.statusPanel(CCAutomated.getGrimoireStatus());
};

CCAutomated.ConfigDisplay.gardenStatus = function () {
  return CCAutomated.ConfigDisplay.statusPanel(CCAutomated.getGardenStatus());
};

CCAutomated.ConfigDisplay.pantheonStatus = function () {
  return CCAutomated.ConfigDisplay.statusPanel(CCAutomated.getPantheonStatus());
};

CCAutomated.ConfigDisplay.seasonStatus = function () {
  return CCAutomated.ConfigDisplay.statusPanel(CCAutomated.getSeasonStatus());
};

CCAutomated.ConfigDisplay.ascensionStatus = function () {
  return CCAutomated.ConfigDisplay.statusPanel(CCAutomated.getAscensionStatus());
};

CCAutomated.ConfigDisplay.autoBuyerStatus = function () {
  return CCAutomated.ConfigDisplay.statusPanel(CCAutomated.getAutoBuyerStatus());
};

if (!CCAutomated.ConfigBackup.UpdateMenu) CCAutomated.ConfigBackup.UpdateMenu = Game.UpdateMenu;

Game.UpdateMenu = function () {
  CCAutomated.ConfigBackup.UpdateMenu();
  if (Game.onMenu === "prefs") CCAutomated.ConfigDisplay.displayMenu();
};
