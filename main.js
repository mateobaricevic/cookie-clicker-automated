var CCAutomated = window.CCAutomated || {};
window.CCAutomated = CCAutomated;

if (typeof CCAutomated.stop === 'function') CCAutomated.stop();

// Config
CCAutomated.ConfigPrefix = 'ccAutomatedConfig';
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
    autoBuyer: 5000
};

CCAutomated.ConfigDefault = {
    AutoClicker: 0,
    GoldenCookies: 0,
    Wrinklers: 0,
    Grimoire: 0,
    AutoBuyer: 0
};

CCAutomated.ConfigData.AutoClicker = {
    label: ['OFF', 'ON'],
    description: 'Auto-clicker for the Big Cookie'
};
CCAutomated.ConfigData.GoldenCookies = {
    label: ['OFF', 'ON'],
    description: 'Auto-clicker for Golden Cookies'
};
CCAutomated.ConfigData.Wrinklers = {
    label: ['OFF', 'ON'],
    description: 'Auto-clicker for Wrinklers'
};
CCAutomated.ConfigData.Grimoire = {
    label: ['OFF', 'ON'],
    description: 'Automated use of spells from Wizard Towers: Grimoire'
};
CCAutomated.ConfigData.AutoBuyer = {
    label: ['OFF', 'ON'],
    description: 'Auto-buy best affordable building or upgrade by estimated CpS gain'
};

CCAutomated.restoreDefaultConfig = function() {
    CCAutomated.Config = Object.assign({}, CCAutomated.ConfigDefault);
    CCAutomated.saveConfig(CCAutomated.Config);
    Game.UpdateMenu();
};

CCAutomated.saveConfig = function(config) {
    try {
        window.localStorage.setItem(CCAutomated.ConfigPrefix, JSON.stringify(config));
    } catch (e) {
        console.warn('[CCAutomated] Failed to save config', e);
    }
};

CCAutomated.loadConfig = function() {
    try {
        let storedConfig = window.localStorage.getItem(CCAutomated.ConfigPrefix);
        CCAutomated.Config = storedConfig ? JSON.parse(storedConfig) : {};

        let modified = !storedConfig;
        for (let i in CCAutomated.ConfigDefault) {
            if (typeof CCAutomated.Config[i] === 'undefined' || CCAutomated.Config[i] < 0 || CCAutomated.Config[i] >= CCAutomated.ConfigData[i].label.length) {
                modified = true;
                CCAutomated.Config[i] = CCAutomated.ConfigDefault[i];
            }
        }
        if (modified) CCAutomated.saveConfig(CCAutomated.Config);
    } catch (e) {
        console.warn('[CCAutomated] Failed to load config; restoring defaults', e);
        CCAutomated.Config = Object.assign({}, CCAutomated.ConfigDefault);
        CCAutomated.saveConfig(CCAutomated.Config);
    }
};

CCAutomated.toggleConfigEntry = function(config) {
    if (CCAutomated.Config[config] === 0) {
        CCAutomated.Config[config] = 1;
    } else {
        CCAutomated.Config[config] = 0;
    }

    let option = l(CCAutomated.ConfigPrefix + config);
    if (option) {
        option.textContent = CCAutomated.ConfigData[config].label[CCAutomated.Config[config]];
        option.className = CCAutomated.Config[config] ? 'option' : 'option off';
    }
    CCAutomated.saveConfig(CCAutomated.Config);
};

CCAutomated.ConfigDisplay.displayMenu = function() {
    let frag = document.createDocumentFragment();
    let div = document.createElement('div');
    div.className = 'title';
    div.textContent = 'Cookie Clicker Automated Settings';
    frag.appendChild(div);
    let listing = function(config) {
        let div = document.createElement('div');
        div.className = 'listing';
        let a = document.createElement('a');
        a.className = 'option';
        if (CCAutomated.Config[config] === 0) a.className = 'option off';
        a.id = CCAutomated.ConfigPrefix + config;
        a.onclick = function() { CCAutomated.toggleConfigEntry(config); };
        a.textContent = CCAutomated.ConfigData[config].label[CCAutomated.Config[config]];
        div.appendChild(a);
        let label = document.createElement('label');
        label.textContent = CCAutomated.ConfigData[config].description;
        div.appendChild(label);
        return div;
    };
    for (let config in CCAutomated.ConfigDefault) {
        frag.appendChild(listing(config));
    }

    let menu = l('menu');
    let menuContent = menu && menu.childNodes[2];
    if (!menuContent) return;
    menuContent.insertBefore(frag, menuContent.childNodes[menuContent.childNodes.length - 1]);
};

if (!CCAutomated.ConfigBackup.UpdateMenu) CCAutomated.ConfigBackup.UpdateMenu = Game.UpdateMenu;

Game.UpdateMenu = function() {
    CCAutomated.ConfigBackup.UpdateMenu();
    if (Game.onMenu === 'prefs') CCAutomated.ConfigDisplay.displayMenu();
};

// Handle auto clicking Big Cookie
CCAutomated.handleAutoClicker= function() {
    if (CCAutomated.Config.AutoClicker === 0) return;
    Game.ClickCookie();
};

// Handle auto clicking Golden Cookies
CCAutomated.handleGoldenCookies = function() {
    if (CCAutomated.Config.GoldenCookies === 0) return;
    if (Game.TickerEffect) Game.tickerL.click();
    for (let sx in Game.shimmers) {
        let s = Game.shimmers[sx];
        if (s.force === "cookie storm drop") s.pop();
        if (s.type !== "golden" || s.life < Game.fps || !Game.Achievements["Early bird"].won) {
            s.pop();
            return;
        }
        if ((s.life / Game.fps) < (s.dur - 2) && (Game.Achievements["Fading luck"].won)) {
            s.pop();
            return;
        }
    }
};

// Handle auto clicking Wrinklers
CCAutomated.wrinklerTime = Date.now();
CCAutomated.handleWrinklers = function() {
    if (CCAutomated.Config.Wrinklers === 0) return;
    if (!Game.Upgrades["One mind"].bought) return;
    if (Game.Upgrades["Unholy bait"].bought && !Game.Achievements["Moistburster"].won) {
        Game.wrinklers.forEach(function(w) { if (w.close === 1) w.hp = 0; } );
    } else {
        // Find a wrinkler which sucked the most cookies
        CCAutomated.nextWrinkler = -1;
        let maxSucked = 0;
        for (let wrinkler of Game.wrinklers) {
            if (wrinkler.sucked > maxSucked && wrinkler.close !== 0){
                maxSucked = wrinkler.sucked;
                CCAutomated.nextWrinkler = wrinkler.id;
            }
        }
        // Pop a wrinkler every 2 hours
        if (CCAutomated.nextWrinkler !== -1) {
            if (Date.now() - CCAutomated.wrinklerTime >= 2*60*60*1000) {
                Game.wrinklers[CCAutomated.nextWrinkler].hp = 0;
                CCAutomated.wrinklerTime = Date.now();
            }
        }
    }
};

CCAutomated.getCpsMultiplier = function() {
    let multiplier = 1;
    if (!Game.buffs) return multiplier;

    for (let buffName in Game.buffs) {
        let buff = Game.buffs[buffName];
        if (typeof buff.multCpS === 'number') multiplier *= buff.multCpS;
    }
    return multiplier;
};

CCAutomated.canUseLumps = function(grimoire) {
    if (typeof Game.canLumps !== 'function' || !Game.canLumps()) return false;
    if (Game.lumps <= 100 || !grimoire.lumpRefill) return false;
    if (!grimoire.lumpRefill.classList) return true;
    return !grimoire.lumpRefill.classList.contains('disabled');
};

// Handle Wizard towers: Grimoire minigame
CCAutomated.handleGrimoire = function() {
    if (CCAutomated.Config.Grimoire === 0) return;
    if (Game.isMinigameReady(Game.Objects["Wizard tower"])) {
        let grimoire = Game.Objects["Wizard tower"].minigame;
        let spell = grimoire.spells["hand of fate"];
        if (Game.shimmerTypes['golden'].n && grimoire.magic >= grimoire.getSpellCost(spell) && grimoire.magic / grimoire.magicM >= 0.95) {
            grimoire.castSpell(spell);
        }
        if (Game.shimmerTypes['golden'].n >= 3 && grimoire.magic > 30) {
            let tower = Game.Objects["Wizard tower"];
            tower.sell(tower.amount - 30);
        }
        spell = grimoire.spells["conjure baked goods"];
        if (CCAutomated.getCpsMultiplier() > 100) {
            if (grimoire.magic >= grimoire.getSpellCost(spell)) { grimoire.castSpell(spell); return; }
            if (CCAutomated.canUseLumps(grimoire)) { grimoire.lumpRefill.click(); }
        }
    }
};

CCAutomated.getCookiesPerSecond = function() {
    if (typeof Game.cookiesPs === 'number') return Game.cookiesPs;
    if (typeof Game.cookiesPsRaw === 'number') return Game.cookiesPsRaw;
    return 0;
};

CCAutomated.recalculateGains = function() {
    if (typeof Game.CalculateGains === 'function') Game.CalculateGains();
};

CCAutomated.getObjectPrice = function(object) {
    if (!object) return Infinity;
    if (typeof object.getPrice === 'function') return object.getPrice();
    if (typeof object.price === 'number') return object.price;
    return Infinity;
};

CCAutomated.getUpgradePrice = function(upgrade) {
    if (!upgrade) return Infinity;
    if (typeof upgrade.getPrice === 'function') return upgrade.getPrice();
    if (typeof upgrade.basePrice === 'number') return upgrade.basePrice;
    if (typeof upgrade.price === 'number') return upgrade.price;
    return Infinity;
};

CCAutomated.canBuyUpgrade = function(upgrade) {
    if (!upgrade || upgrade.bought) return false;
    if (upgrade.pool === 'toggle' || upgrade.pool === 'debug' || upgrade.pool === 'prestige') return false;
    if (upgrade.unlocked === 0 || upgrade.unlocked === false) return false;
    if (typeof upgrade.canBuy === 'function' && !upgrade.canBuy()) return false;
    return true;
};

CCAutomated.estimateBuildingCpsGain = function(object) {
    if (!object || typeof object.amount !== 'number') return 0;

    let originalAmount = object.amount;
    let originalBought = object.bought;
    let originalCps = CCAutomated.getCookiesPerSecond();
    let gain = 0;

    try {
        object.amount += 1;
        if (typeof object.bought === 'number') object.bought += 1;
        CCAutomated.recalculateGains();
        gain = CCAutomated.getCookiesPerSecond() - originalCps;
    } catch (e) {
        console.warn('[CCAutomated] Failed to estimate building purchase', object.name, e);
    } finally {
        object.amount = originalAmount;
        if (typeof originalBought !== 'undefined') object.bought = originalBought;
        CCAutomated.recalculateGains();
    }

    return Math.max(0, gain);
};

CCAutomated.estimateUpgradeCpsGain = function(upgrade) {
    if (!upgrade) return 0;

    let originalBought = upgrade.bought;
    let originalCps = CCAutomated.getCookiesPerSecond();
    let gain = 0;

    try {
        upgrade.bought = 1;
        CCAutomated.recalculateGains();
        gain = CCAutomated.getCookiesPerSecond() - originalCps;
    } catch (e) {
        console.warn('[CCAutomated] Failed to estimate upgrade purchase', upgrade.name, e);
    } finally {
        upgrade.bought = originalBought;
        CCAutomated.recalculateGains();
    }

    return Math.max(0, gain);
};

CCAutomated.getAutoBuyerCandidates = function() {
    let candidates = [];
    let cookies = typeof Game.cookies === 'number' ? Game.cookies : 0;

    if (Game.ObjectsById) {
        for (let i = 0; i < Game.ObjectsById.length; i++) {
            let object = Game.ObjectsById[i];
            let price = CCAutomated.getObjectPrice(object);
            if (!isFinite(price) || price <= 0 || price > cookies) continue;

            let gain = CCAutomated.estimateBuildingCpsGain(object);
            if (gain <= 0) continue;

            candidates.push({
                type: 'building',
                item: object,
                name: object.name,
                price: price,
                gain: gain,
                score: gain / price
            });
        }
    }

    if (Game.UpgradesInStore) {
        for (let j = 0; j < Game.UpgradesInStore.length; j++) {
            let upgrade = Game.UpgradesInStore[j];
            if (!CCAutomated.canBuyUpgrade(upgrade)) continue;

            let upgradePrice = CCAutomated.getUpgradePrice(upgrade);
            if (!isFinite(upgradePrice) || upgradePrice <= 0 || upgradePrice > cookies) continue;

            let upgradeGain = CCAutomated.estimateUpgradeCpsGain(upgrade);
            if (upgradeGain <= 0) continue;

            candidates.push({
                type: 'upgrade',
                item: upgrade,
                name: upgrade.name,
                price: upgradePrice,
                gain: upgradeGain,
                score: upgradeGain / upgradePrice
            });
        }
    }

    return candidates;
};

CCAutomated.getBestAutoBuyerCandidate = function() {
    let candidates = CCAutomated.getAutoBuyerCandidates();
    let best = null;

    for (let i = 0; i < candidates.length; i++) {
        if (!best || candidates[i].score > best.score) best = candidates[i];
    }

    return best;
};

CCAutomated.buyAutoBuyerCandidate = function(candidate) {
    if (!candidate) return false;

    try {
        if (candidate.type === 'building' && candidate.item && typeof candidate.item.buy === 'function') {
            candidate.item.buy(1);
            return true;
        }
        if (candidate.type === 'upgrade' && candidate.item && typeof candidate.item.buy === 'function') {
            candidate.item.buy();
            return true;
        }
    } catch (e) {
        console.warn('[CCAutomated] Failed to auto-buy', candidate.name, e);
    }

    return false;
};

// Handle buying the best affordable building or upgrade
CCAutomated.handleAutoBuyer = function() {
    if (CCAutomated.Config.AutoBuyer === 0) return;

    let candidate = CCAutomated.getBestAutoBuyerCandidate();
    CCAutomated.buyAutoBuyerCandidate(candidate);
};

CCAutomated.stop = function() {
    for (let key in CCAutomated.Intervals) {
        clearInterval(CCAutomated.Intervals[key]);
    }
    CCAutomated.Intervals = {};

    if (CCAutomated.ConfigBackup && CCAutomated.ConfigBackup.UpdateMenu) {
        Game.UpdateMenu = CCAutomated.ConfigBackup.UpdateMenu;
    }
};

CCAutomated.start = function() {
    CCAutomated.loadConfig();
    CCAutomated.Intervals.autoClicker = setInterval(CCAutomated.handleAutoClicker, CCAutomated.IntervalMs.autoClicker);
    CCAutomated.Intervals.goldenCookieClicker = setInterval(CCAutomated.handleGoldenCookies, CCAutomated.IntervalMs.goldenCookieClicker);
    CCAutomated.Intervals.wrinklerClicker = setInterval(CCAutomated.handleWrinklers, CCAutomated.IntervalMs.wrinklerClicker);
    CCAutomated.Intervals.grimoire = setInterval(CCAutomated.handleGrimoire, CCAutomated.IntervalMs.grimoire);
    CCAutomated.Intervals.autoBuyer = setInterval(CCAutomated.handleAutoBuyer, CCAutomated.IntervalMs.autoBuyer);
};

// Start Cookie Clicker Automated
CCAutomated.start();
