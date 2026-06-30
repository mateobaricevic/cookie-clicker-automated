# Cookie Clicker Automated

Cookie Clicker Automated is an addon for the [Cookie Clicker](https://orteil.dashnet.org/cookieclicker/) game.
It can automate clicking the Big Cookie, popping Golden Cookies, popping Wrinklers, and using selected Grimoire spells.
It can also auto-buy or save for the best building or upgrade based on estimated payoff time.

## Bookmarklet

Copy this code and save it as a bookmark. Paste it in the URL section. To activate the addon, click the bookmark while Cookie Clicker is open.

```javascript
javascript: (function () {
 Game.LoadMod('https://mateobaricevic.github.io/cookie-clicker-automated/main.js?v=' + Date.now());
}());
```

## Features

- Big Cookie auto-clicker.
- Golden Cookie auto-clicker.
- Wrinkler popping automation.
- Wizard tower Grimoire automation for selected spell timing.
- Auto-buyer that can save for higher-value buildings or upgrades.
- Preferences menu entries inside Cookie Clicker's settings menu.

## Auto-Buyer

The auto-buyer checks visible buildings and store upgrades, estimates how much each one would improve base cookies per second, and scores each option by total payoff time: time needed to afford it plus time needed to earn back its cost from the CpS gain.

If the best-scoring option is not affordable yet, the addon waits instead of buying a weaker cheaper option.

To avoid saving forever, the buyer prefers targets that are affordable or within about 10 minutes at base CpS. Temporary CpS buffs do not make the buyer chase a long-term target it could not normally afford soon.

The strategy setting controls how patient the buyer should be. `ROI` favors short waits and pure payoff time, `Balanced` is the default, `Long` is more willing to save for better targets, and `Now` only buys the best currently affordable target.

Building purchases that reach common milestones, such as 10, 25, and every 50 buildings after that, receive a modest score bonus so the buyer is more likely to unlock related achievements and upgrades.

The auto-buyer reserve setting keeps a configurable cookie bank unspent. Reserve levels are based on base CpS, so a `10 min` reserve means the buyer behaves as though 10 minutes of base production is unavailable for purchases.

The current target is cached so the addon can check affordability every second without fully rescoring every purchase candidate on every tick. It refreshes the target periodically, when store upgrades or building prices change, or when base CpS changes noticeably.

The settings menu shows the current auto-buyer target, whether the addon is ready to buy or waiting, estimated CpS gain, payoff time, active strategy, milestone threshold, and reserve.

It skips upgrades that do not directly improve CpS, including debug, prestige, and toggle upgrades.

## Development

Run the local syntax check before publishing changes:

```sh
npm run check
```

The addon is intentionally dependency-free. `npm install` is not required for the current check script.

## Notes

This addon can automatically spend cookies, spend resources, cast spells, sell Wizard towers, and pop Wrinklers. Review the settings before enabling automation on a save you care about.
