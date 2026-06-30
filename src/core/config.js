// Config
CCAutomated.ConfigPrefix = "ccAutomatedConfig";
CCAutomated.Config = {};
CCAutomated.ConfigData = {};
CCAutomated.ConfigDisplay = {};
if (!CCAutomated.ConfigBackup) CCAutomated.ConfigBackup = {};
CCAutomated.Intervals = {};
CCAutomated.IntervalMs = {
  autoClicker: 10,
  goldenCookieClicker: 400,
  wrinklerClicker: 400,
  grimoire: 400,
  garden: 5000,
  pantheon: 500,
  season: 500,
  autoBuyer: 1000,
};
CCAutomated.AutoBuyer = {
  target: null,
  candidates: [],
  lastRefresh: 0,
  lastCookiesPerSecond: 0,
  lastStoreSignature: "",
  refreshMs: 10000,
  cpsRefreshRatio: 0.05,
  luckyBankSeconds: 6000,
  luckyRewardCookiesPerSecond: 900,
  luckyRewardBankRatio: 0.15,
  comboPayoutTolerance: 0.995,
};
CCAutomated.Strategy = {
  strongBuffMultiplier: 10,
  hugeBuffMultiplier: 100,
  minStrategicUpgradeGainSeconds: 60,
  firstAscendPrestigeTarget: 365,
  repeatAscendPrestigeGainRatio: 0.1,
  minRepeatAscendPrestigeGain: 100,
  priorityPatterns: [
    { pattern: /kitten/i, multiplier: 0.35, label: "kitten" },
    {
      pattern:
        /lucky day|serendipity|get lucky|golden goose egg|green yeast digestives|arcane sugar|distilled essence of redoubled luck/i,
      multiplier: 0.45,
      label: "golden cookie",
    },
    { pattern: /synerg/i, multiplier: 0.55, label: "synergy" },
    {
      pattern: /egg|reindeer|santa|christmas|halloween|valentine|heart|bunny|easter|fool|business/i,
      multiplier: 0.65,
      label: "season",
    },
    { pattern: /cursor|mouse|click|finger/i, multiplier: 0.75, label: "clicking" },
    { pattern: /biscuit|butter biscuit|macaron|brand biscuit|cookie|fortune/i, multiplier: 0.85, label: "strategic" },
  ],
};
CCAutomated.AutoClicker = {
  clicksPerTick: 3,
};
CCAutomated.Wrinklers = {
  popIntervalMs: 2 * 60 * 60 * 1000,
  minSuckedToPop: 1,
  lastPop: Date.now(),
};
CCAutomated.Garden = {
  comboHarvestPlantNames: ["Bakeberry", "Queenbeet", "Duketater"],
  soilByGoal: {
    growing: "fertilizer",
    holding: "clay",
    mutation: "wood chips",
  },
  lastAction: "",
  lastActionAt: 0,
};
CCAutomated.Pantheon = {
  godzamokPattern: /godzamok/i,
  skruuiaPattern: /skruuia/i,
  godzamokBuffPattern: /devastation/i,
  clickBuffPattern: /click frenzy|dragonflight/i,
  maxSellPerBuilding: 100,
  maxSellTotal: 600,
  minKeep: 50,
  cooldownMs: 9000,
  lastAction: "",
  lastActionAt: 0,
  lowValueBuildingNames: ["Cursor", "Grandma", "Mine", "Factory", "Shipment", "Alchemy lab"],
};
CCAutomated.Season = {
  upgradePattern: /santa|festive|christmas|reindeer|egg|bunny|easter|halloween|valentine|heart|fool|business/i,
  santaPattern: /santa|festive/i,
  switchUpgrades: [
    { name: "Festive biscuit", season: "christmas" },
    { name: "Lovesick biscuit", season: "valentines" },
    { name: "Bunny biscuit", season: "easter" },
    { name: "Ghostly biscuit", season: "halloween" },
    { name: "Fool's biscuit", season: "fools" },
  ],
  dropDefinitions: [
    {
      season: "christmas",
      id: "santa",
      label: "Santa gifts",
      gameList: "santaDrops",
      fallbackNames: [
        "Increased merriness",
        "Improved jolliness",
        "A lump of coal",
        "An itchy sweater",
        "Reindeer baking grounds",
        "Weighted sleighs",
        "Ho ho ho-flavored frosting",
        "Season savings",
        "Toy workshop",
        "Naughty list",
        "Santa's bottomless bag",
        "Santa's helpers",
        "Santa's legacy",
        "Santa's milk and cookies",
      ],
    },
    {
      season: "christmas",
      id: "reindeer",
      label: "Reindeer drops",
      gameList: "reindeerDrops",
      fallbackNames: [
        "Christmas tree biscuits",
        "Snowflake biscuits",
        "Snowman biscuits",
        "Holly biscuits",
        "Candy cane biscuits",
        "Bell biscuits",
        "Present biscuits",
      ],
    },
    {
      season: "easter",
      id: "eggs",
      label: "Eggs",
      gameList: "easterEggs",
      pool: "easter",
      fallbackNames: [
        "Chicken egg",
        "Duck egg",
        "Turkey egg",
        "Quail egg",
        "Robin egg",
        "Ostrich egg",
        "Cassowary egg",
        "Salmon roe",
        "Frogspawn",
        "Shark egg",
        "Turtle egg",
        "Ant larva",
        "Century egg",
        "Golden goose egg",
        "Faberge egg",
        "Wrinklerspawn",
        "Cookie egg",
        "Omelette",
        "Chocolate egg",
        '"egg"',
      ],
    },
    {
      season: "halloween",
      id: "cookies",
      label: "Halloween cookies",
      gameList: "halloweenDrops",
      pool: "halloween",
      fallbackNames: [
        "Skull cookies",
        "Ghost cookies",
        "Bat cookies",
        "Slime cookies",
        "Pumpkin cookies",
        "Eyeball cookies",
        "Spider cookies",
      ],
    },
    {
      season: "valentines",
      id: "hearts",
      label: "Heart cookies",
      gameList: "heartDrops",
      pool: "valentines",
      fallbackNames: [
        "Pure heart biscuits",
        "Ardent heart biscuits",
        "Sour heart biscuits",
        "Weeping heart biscuits",
        "Golden heart biscuits",
        "Eternal heart biscuits",
        "Prism heart biscuits",
      ],
    },
  ],
  dropCounts: {},
  lastAction: "",
  lastActionAt: 0,
  lastUpgradeName: "",
};

CCAutomated.ConfigDefault = {
  AutoClicker: 0,
  GoldenCookies: 0,
  Wrinklers: 0,
  Grimoire: 0,
  Garden: 0,
  Pantheon: 0,
  Season: 0,
  AutoBuyer: 0,
  AutoBuyerReserve: 0,
};

CCAutomated.ConfigData.AutoClicker = {
  name: "Big Cookie",
  label: ["OFF", "ON"],
  description: "auto-click the main cookie",
};
CCAutomated.ConfigData.GoldenCookies = {
  name: "Golden Cookies",
  label: ["OFF", "ON"],
  description: "auto-click golden cookies and ticker fortune effects",
};
CCAutomated.ConfigData.Wrinklers = {
  name: "Wrinklers",
  label: ["OFF", "ON"],
  description: "pop wrinklers on a timed strategy",
};
CCAutomated.ConfigData.Grimoire = {
  name: "Grimoire",
  label: ["OFF", "ON"],
  description: "cast wizard tower spells during combo windows",
};
CCAutomated.ConfigData.Garden = {
  name: "Garden",
  label: ["OFF", "Harvest", "Manage"],
  description: "harvest combo plants, freeze safely, and manage soil",
};
CCAutomated.ConfigData.Pantheon = {
  name: "Pantheon",
  label: ["OFF", "Godzamok"],
  description: "sell low-value buildings during click combo windows",
};
CCAutomated.ConfigData.Season = {
  name: "Seasons",
  label: ["OFF", "Click", "Manage"],
  description: "click reindeer and buy affordable seasonal upgrades",
};
CCAutomated.ConfigData.AutoBuyer = {
  name: "Auto-buyer",
  label: ["OFF", "ROI", "Balanced", "Long"],
  strategy: [
    {
      maxWaitSeconds: 300,
      buildingThresholdScoreMultiplier: 1,
      majorBuildingThresholdScoreMultiplier: 0.9,
      luckyBankRatio: 0,
    },
    {
      maxWaitSeconds: 600,
      buildingThresholdScoreMultiplier: 0.8,
      majorBuildingThresholdScoreMultiplier: 0.65,
      luckyBankRatio: 0.5,
    },
    {
      maxWaitSeconds: 1800,
      buildingThresholdScoreMultiplier: 0.7,
      majorBuildingThresholdScoreMultiplier: 0.5,
      luckyBankRatio: 1,
    },
  ],
  description: "buy or save for the best building or upgrade",
};
CCAutomated.ConfigData.AutoBuyerReserve = {
  name: "Buyer Reserve",
  label: ["OFF", "5 min", "10 min", "30 min", "1 hour"],
  reserveSeconds: [0, 300, 600, 1800, 3600],
  description: "keep this much base CpS banked before spending",
};
