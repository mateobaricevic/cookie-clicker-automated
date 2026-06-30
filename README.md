# Cookie Clicker Automated

Cookie Clicker Automated is an addon for the [Cookie Clicker](https://orteil.dashnet.org/cookieclicker/) game.
It can automate clicking the Big Cookie, popping Golden Cookies, popping Wrinklers, and using selected Grimoire spells.
It can also auto-buy or save for the best building or upgrade based on estimated payoff time.
It can manage selected Garden tasks, including combo harvests and safe holding behavior.
It can trigger Godzamok during click combo windows by selling low-value buildings.
It can click reindeer and buy affordable seasonal upgrades.
It shows an ascension recommendation in the settings menu so you can see when a reset is worth considering.

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
- Combo dashboard for active buffs, golden cookie shimmers, Lucky bank, and payout status.
- Wrinkler popping automation.
- Wizard tower Grimoire automation for selected spell timing.
- Garden automation for mature Bakeberry, Queenbeet, and Duketater combo harvests.
- Pantheon Godzamok combo support and Skruuia-aware wrinkler guidance.
- Season automation for reindeer and visible seasonal upgrades.
- Auto-buyer that can save for higher-value buildings or upgrades.
- Ascension recommendation status.
- Preferences menu entries inside Cookie Clicker's settings menu.

## Auto-Buyer

The auto-buyer checks visible buildings and store upgrades, estimates how much each one would improve base cookies per second, and scores each option by total payoff time: time needed to afford it plus time needed to earn back its cost from the CpS gain.

If the best-scoring option is not affordable yet, the addon waits instead of buying a weaker cheaper option.

To avoid saving forever, the buyer prefers targets that are affordable or within about 10 minutes at base CpS. Temporary CpS buffs do not make the buyer chase a long-term target it could not normally afford soon.

The auto-buyer setting controls both whether buying is active and how patient the buyer should be. `ROI` favors short waits and pure payoff time, `Balanced` is the default, `Long` is more willing to save for better targets, and `Now` only buys the best currently affordable target.

The buyer keeps part of a Lucky-compatible cookie bank. `ROI` keeps only a small bank, `Balanced` keeps a larger one, `Long` tries to preserve the full Lucky cap, and `Now` ignores strategic banking.

Recommended mode:

- `Balanced` is the best all-purpose default. It preserves a meaningful Lucky bank, waits for better-value purchases, and avoids spending too eagerly.
- `ROI` is best for fast, aggressive early-game growth when banking matters less.
- `Long` is best in mid or late game when you want the buyer to wait for higher-value targets while protecting the full Lucky bank.
- `Now` is best only when you want immediate spending on the best currently affordable option.

For a safer default, use `Balanced` with `Buyer Reserve` set to `10 min`.

During strong golden-cookie or dragon buff windows, the buyer compares expected Lucky payout before and after a purchase. It only spends if the buy does not meaningfully reduce combo payout.

Building purchases that reach common milestones, such as 10, 25, and every 50 buildings after that, receive a score bonus so the buyer is more likely to unlock related achievements and upgrades.

Strategic upgrades receive priority bonuses beyond raw immediate CpS, including kitten upgrades, golden-cookie upgrades, synergy upgrades, seasonal upgrades, clicking upgrades, and broad cookie upgrades. Strategic upgrades with little immediate CpS can still be bought when their long-term category matters.

The auto-buyer reserve setting keeps an additional configurable cookie bank unspent. Reserve levels are based on base CpS, so a `10 min` reserve means the buyer behaves as though 10 minutes of base production is unavailable for purchases.

The current target is cached so the addon can check affordability every second without fully rescoring every purchase candidate on every tick. It refreshes the target periodically, when store upgrades or building prices change, or when base CpS changes noticeably.

The settings menu shows the current auto-buyer mode and target, whether the addon is ready to buy or waiting, estimated CpS gain or strategic status, payoff time, milestone or priority tags, reserve, strategic bank, and whether it is holding for a combo.

It skips debug, prestige, and toggle upgrades.

## Ascension

The settings menu shows whether you should ascend now, how many prestige levels you would gain, and an ETA for reaching the recommendation.

The addon recommends the first ascension at `+365` prestige levels. After that, it recommends ascending when the pending prestige gain is at least `10%` of your current prestige level, with a minimum of `+100` prestige levels.

## Combo

The settings menu shows a combo dashboard under the Golden Cookies setting. It displays active buff count, current CpS multiplier, remaining combo time, visible golden cookie shimmers, Lucky bank progress, and current versus max Lucky payout.

## Grimoire

The Grimoire automation is combo-first. It waits for strong natural buffs such as Frenzy, building specials, dragon buffs, or similarly large CpS multipliers before casting Force the Hand of Fate.

Force the Hand of Fate is held while a golden cookie shimmer is already visible. Conjure Baked Goods and sugar-lump refills are reserved for huge combo windows. Wizard tower selling is also limited to huge combo situations and never sells below 30 towers.

The settings menu shows Grimoire status under the Grimoire setting, including magic, Force the Hand of Fate cost, combo state, and whether a visible golden cookie is blocking a cast.

## Garden

The Garden automation has two active modes. `Harvest` only harvests mature Bakeberries, Queenbeets, and Duketaters during strong combo windows.

`Manage` also freezes mature combo-harvest plants while waiting for a combo, unfreezes growing plants, and switches soil toward a conservative goal: Clay while holding mature combo plants, Fertilizer while growing plants, and Wood Chips when the garden is empty.

The settings menu shows current Garden status, planted and mature counts, combo-harvest readiness, soil, and recent actions.

## Pantheon

The Pantheon automation supports a conservative Godzamok combo mode. When Godzamok is slotted and a Click Frenzy or Dragonflight window is active, it sells low-value non-minigame buildings while keeping a reserve of each building type.

It avoids repeating the sale while the Godzamok buff is active and shows Godzamok slot status, Skruuia slot status, wrinkler status, click combo timing, sellable building count, and the latest action in the settings menu.

When both Wrinklers and Pantheon automation are enabled, timed wrinkler pops wait until Skruuia is slotted so the pop benefits from Skruuia. The Moistburster achievement behavior still pops attached wrinklers immediately when needed.

## Seasons

The Seasons automation has two active modes. `Click` pops visible reindeer independently of the Golden Cookies setting.

`Manage` also buys affordable seasonal upgrades from the store, prioritizing Santa and festive upgrades first, then reindeer, Easter, Halloween, and Valentine's upgrades. It respects the same spendable-cookie reserve used by the auto-buyer.

The settings menu shows the current season, visible reindeer, next seasonal upgrade, and recent actions.

## Development

Run the local syntax check before publishing changes:

```sh
npm run check
```

The addon is intentionally dependency-free. `npm install` is not required for the current check script.

## Notes

This addon can automatically spend cookies, spend resources, cast spells, sell buildings, pop Wrinklers, harvest Garden plants, freeze or unfreeze the Garden, click reindeer, and change Garden soil. Review the settings before enabling automation on a save you care about.
