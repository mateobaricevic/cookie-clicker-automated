
let CCAutomated;
if (!CCAutomated) CCAutomated = {};

// Config
CCAutomated.ConfigPrefix = 'ccAutomatedConfig';
CCAutomated.Config = {};
CCAutomated.ConfigData = {};
CCAutomated.ConfigDisplay = {};
if (!CCAutomated.ConfigBackup) CCAutomated.ConfigBackup = {};

CCAutomated.ConfigDefault = {
    AutoClicker: 0,
    GoldenCookies: 0,
    Grimoire: 0
};

CCAutomated.ConfigData.AutoClicker = {
    label: ['OFF', 'ON'],
    description: 'Auto-clicker for the Big Cookie'
};
CCAutomated.ConfigData.GoldenCookies = {
    label: ['OFF', 'ON'],
    description: 'Auto-clicker for Golden Cookies'
};
CCAutomated.ConfigData.Grimoire = {
    label: ['OFF', 'ON'],
    description: 'Automated use of spells from Wizard Towers: Grimoire'
};

CCAutomated.restoreDefaultConfig = function() {
    CCAutomated.Config = {};
    CCAutomated.saveConfig(CCAutomated.ConfigDefault);
    CCAutomated.loadConfig();
    Game.UpdateMenu();
}

CCAutomated.saveConfig = function(config) {
    try {
        window.localStorage.setItem(CCAutomated.ConfigPrefix, JSON.stringify(config));
    } catch (e) {}
}

CCAutomated.loadConfig = function() {
    try {
        if (window.localStorage.getItem(CCAutomated.ConfigPrefix) != null) {
            CCAutomated.Config = JSON.parse(window.localStorage.getItem(CCAutomated.ConfigPrefix));
            // Check values
            let modified = false;
            for (let i in CCAutomated.ConfigDefault) {
                if (typeof CCAutomated.Config[i] === 'undefined' || CCAutomated.Config[i] < 0 || CCAutomated.Config[i] >= CCAutomated.ConfigData[i].label.length) {
                    modified = true;
                    CCAutomated.Config[i] = CCAutomated.ConfigDefault[i];
                }
            }
            if (modified) CCAutomated.saveConfig(CCAutomated.Config);
        } else {
            CCAutomated.restoreDefaultConfig();
        }
    } catch (e) {}
}

CCAutomated.toggleConfigEntry = function(config) {
    if (CCAutomated.Config[config] === 0) {
        CCAutomated.Config[config] = 1;
    } else {
        CCAutomated.Config[config] = 0;
    }
    l(CCAutomated.ConfigPrefix + config).innerHTML = CCAutomated.ConfigData[config].label[CCAutomated.Config[config]];
    l(CCAutomated.ConfigPrefix + config).className = CCAutomated.Config[config] ? 'option' : 'option off';
    CCAutomated.saveConfig(CCAutomated.Config);
}

CCAutomated.ConfigDisplay.displayMenu = function() {
    let header = function (text) {
        let div = document.createElement('div');
        div.className = 'listing';
        div.style.padding = '5px 16px';
        div.style.opacity = '0.7';
        div.style.fontSize = '17px';
        div.style.fontFamily = '\"Kavoon\", Georgia, serif';
        div.textContent = text;
        return div;
    };
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
    }
    frag.appendChild(listing('AutoClicker'));
    frag.appendChild(listing('GoldenCookies'));
    frag.appendChild(listing('Grimoire'));
    l('menu').childNodes[2].insertBefore(frag, l('menu').childNodes[2].childNodes[l('menu').childNodes[2].childNodes.length - 1]);
}

if (!CCAutomated.ConfigBackup.UpdateMenu) CCAutomated.ConfigBackup.UpdateMenu = Game.UpdateMenu;

Game.UpdateMenu = function() {
    CCAutomated.ConfigBackup.UpdateMenu();
    if (Game.onMenu === 'prefs') CCAutomated.ConfigDisplay.displayMenu();
}

// Handle auto clicking Big Cookie
CCAutomated.handleAutoClicker= function() {
    if (CCAutomated.Config.AutoClicker === 0) return;
    Game.ClickCookie();
}

// Handle auto clicking Golden Cookies
CCAutomated.handleGoldenCookie = function() {
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
}

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
        if (CCAutomated.cpsMult > 100) {
            if (grimoire.magic >= grimoire.getSpellCost(spell)) { grimoire.castSpell(spell); return; }
            if (CCAutomated.canUseLumps && Game.lumps > 100) { grimoire.lumpRefill.click(); }
        }
    }
}

// Start Cookie Clicker Automated
CCAutomated.loadConfig();
CCAutomated.startAutoClicker = setInterval(CCAutomated.handleAutoClicker, 10);
CCAutomated.startGoldenCookieClicker = setInterval(CCAutomated.handleGoldenCookie, 400);
CCAutomated.startGrimoire = setInterval(CCAutomated.handleGrimoire, 400);
