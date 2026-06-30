# Cookie Clicker Strategy Notes

These notes track strategy and quality-of-life ideas for Cookie Clicker Automated. They are meant to guide implementation work, not duplicate the README.

## Current Addon Shape

Implemented areas:

- Big Cookie, Golden Cookie, ticker fortune, Wrinkler, reindeer, and seasonal-upgrade automation.
- Auto-buyer with single-purchase payoff scoring, strategic upgrade priorities, Lucky-bank protection, manual reserve, milestone bonuses, and combo-payout safeguards.
- Combo dashboard showing active buffs, visible golden cookies, Lucky-bank status, and payout safety.
- Grimoire automation that casts Force the Hand of Fate during strong combo windows, avoids visible golden-cookie conflicts, reserves Conjure Baked Goods and lump refills for huge combos, and has conservative wizard tower selling.
- Garden automation for freezing, unfreezing, soil switching, and harvesting mature Bakeberry, Queenbeet, and Duketater during strong combo windows.
- Pantheon helper for Godzamok click-combo selling and Skruuia-aware Wrinkler popping.
- Ascension status using a first-ascension target and repeat-ascension gain threshold.
- Auto-buyer Planning v2 for buy-1, buy-10, and buy-100 building plans, batch milestone scoring, and top-plan status display.

The project is now past the baseline automation phase. The highest-value work should improve decision quality, surface richer planning data, and add safety checks around irreversible or high-cost actions.

## Research Notes

- Golden Cookie and Grimoire combos remain the biggest active-play multiplier. Frenzy plus Click Frenzy is a common high-value overlap, and Force the Hand of Fate is useful once a natural Frenzy, building special, or dragon buff is active.
- Lucky payouts are bank-sensitive, so spending decisions should protect the current or expected Lucky cap during combo windows.
- Cookie Monster and Frozen Cookies both lean heavily on payoff-time style scoring. Cookie Monster explicitly compares buy-1 and buy-10 options, and Frozen Cookies includes chained upgrade/building targets and Golden Cookie bank modeling.
- Garden harvest plants are already handled well for a first pass. The next Garden improvement is not more harvesting logic; it is seed/mutation planning and plant-layout guidance.
- Stock Market profit is slow and noisy compared with Garden or Grimoire. A dashboard/advisor is safer than immediate auto-trading. Useful first signals are resting value, buy/sell bands, broker overhead, stock capacity, profit progress, and loan timing for major combo windows.
- Ascension help should become an operational checklist, not just a prestige threshold. Useful checks include Wrinklers, Chocolate Egg, mature Garden harvests, permanent upgrade slots, lucky-prestige digit targets, and save export reminders.

## Best Next Improvement

Implement **Auto-buyer chain planning** next.

Why this should come before Stock Market automation:

- It improves every run, even before Bank level 1 or active Stock Market play.
- The current buyer already has the needed foundation: payoff scoring, reserves, combo safety, strategic priorities, and status display.
- The remaining known weakness is prerequisite chains that unlock strong follow-up upgrades.
- It aligns with proven addon ideas from Cookie Monster and Frozen Cookies without needing to copy their code or UI.

Scope for the chain implementation:

- Detect upgrade chains where buying buildings to a threshold unlocks a high-priority upgrade.
- Score the chain as one plan while buying the next prerequisite step.
- Add optional effective Golden Cookie value to scoring, especially for golden-cookie upgrades and banks.
- Track "why not bought" reasons in status: reserve, combo payout risk, too long to wait, cannot buy, or candidate invalid.

## Suggested Implementation Order

1. Done: Auto-buyer Planning v2: buy-10/buy-100 candidates, top candidate list, clearer payoff/status reporting.
2. Auto-buyer chain planning: building thresholds, upgrade unlock prerequisites, and strategic chain target display.
3. Ascension checklist: pre-ascend safety panel for Wrinklers, Garden harvests, Chocolate Egg, permanent upgrade slot suggestions, lucky-prestige digits, and save export.
4. Stock Market advisor: read-only dashboard with resting values, buy/sell bands, broker overhead, capacity, profit progress, and loan readiness.
5. Grimoire planner: deterministic Force the Hand of Fate preview, season-aware outcome variants, spell count display, and safer dual-cast thresholds.
6. Garden mutation planner: layout recommendations, plant aging windows, seed unlock progress, and mutation-focused soil timing.
7. Conservative Stock Market automation: optional buy/sell actions after the advisor is reliable, with strict reserves and no default loan use.

## Feature Backlog

### Auto-buyer Planning v2

Goal: make the buyer choose better long-term purchases without becoming risky or opaque.

Implementation notes:

- Keep the existing payoff score shape: wait time plus price divided by CpS gain.
- Add `amount` to building candidates, defaulting to 1.
- Add `planLabel` for status text, such as `Cursor x10` or `Grandma x100`.
- Compare buy-1, buy-10, and buy-100 plans against upgrades.
- Treat batch milestone crossings as a stronger bonus only when the batch actually reaches the milestone.
- Cache and invalidate batch candidates through the existing store signature and CpS-change checks.

Acceptance checks:

- Existing buy-1 behavior still works when batch buying is not better.
- Buyer never spends below manual reserve or strategic Lucky reserve.
- Buyer still refuses combo-window purchases that reduce expected Lucky payout.
- Status panel shows enough detail to explain the target.

### Ascension Checklist

Goal: prevent accidental value loss before a reset and make the next ascension target clearer.

Implementation notes:

- Extend ascension status with checklist lines rather than adding a new automation mode first.
- Show pending prestige, target prestige, ETA, and next likely heavenly upgrade category.
- Recommend permanent upgrade slot candidates, especially the highest owned kitten upgrades.
- Warn when Chocolate Egg is available and worth delaying until after building sales.
- Warn when Wrinklers are attached, combo Garden plants are mature, or seasonal drops are incomplete.
- Show prestige digit hints for Lucky Digit, Lucky Number, and Lucky Payout when those upgrades are not owned.

Potential later automation:

- Add an explicit "Reset Prep" mode that pops Wrinklers, harvests mature combo plants during a buff if possible, sells buildings for Chocolate Egg value, buys Chocolate Egg, and then stops short of pressing ascend.

### Stock Market Advisor

Goal: make Stock Market decisions visible before any trading automation exists.

Implementation notes:

- Read Bank minigame goods, prices, deltas, stock amounts, capacity, profit, brokers, and office level.
- Compute resting value as `10 * (id + 1) + bankLevel - 1`.
- Use conservative bands at first: buy when price is far below rest value, sell near or above rest value, and highlight `$1` floor opportunities.
- Show broker overhead and a target broker count because high overhead makes trading unreliable.
- Show loans only as combo tools. Recommend them only during huge combo or Garden harvest windows.

Potential later automation:

- Add an opt-in mode that buys at very conservative low-price thresholds and sells only when profitable after overhead.
- Keep loans manual unless the user explicitly asks for full combo automation.

### Grimoire Planner

Goal: move from reactive casting to planned combo casting.

Implementation notes:

- Surface total spells cast and current season because Force the Hand of Fate outcomes are deterministic for a given seed, spell count, and season condition.
- Preview the next Force the Hand of Fate outcome when this can be done safely from game data.
- Add dual-cast thresholds by current Wizard tower amount and level.
- Avoid selling towers below a configurable floor, and show the planned sell amount before acting.
- Continue avoiding casts while a golden cookie is visible.

### Garden Mutation Planner

Goal: help unlock seeds and sugar lumps without hand-maintaining a separate guide.

Implementation notes:

- Start with read-only seed progress and suggested next mutation goal.
- Prefer layout hints and status text before automatic planting.
- Use Fertilizer for growth windows, Wood Chips for mutation windows, and Clay for mature passive-boost windows.
- Prioritize Golden Clover, Bakeberry, Queenbeet, Juicy Queenbeet, Everdaisy, and Ichorpuff paths because they unlock strong combo or sugar-lump value.

### Quality-of-Life Ideas

- Export-save reminder in the ascension checklist.
- Vault/blacklist support so the auto-buyer avoids Chocolate Egg, Golden Switch, Shimmering Veil, season switchers, or user-selected upgrades until conditions are right.
- Dragon aura and Pantheon setup suggestions for current mode: idle CpS, combo, Stock Market broker buying, Garden mutation, or Wrinkler farming.
- Sugar lump recommendations: unlock minigames first, then prioritize Garden size, Wizard tower thresholds, Temple slots, and long-term building levels.
- Status panel compaction so inactive helpers do not crowd the settings menu.
- Optional notification/audio hooks for high-value combo readiness.

## Reference Links

- Cookie Clicker Wiki: Golden Cookie - https://cookieclicker.fandom.com/wiki/Golden_Cookie
- Cookie Clicker Wiki: Grimoire - https://cookieclicker.fandom.com/wiki/Grimoire
- Cookie Clicker Wiki: Garden - https://cookieclicker.fandom.com/wiki/Garden
- Cookie Clicker Wiki: Pantheon - https://cookieclicker.fandom.com/wiki/Pantheon
- Cookie Clicker Wiki: Stock Market - https://cookieclicker.fandom.com/wiki/Stock_Market
- Cookie Clicker Wiki: Ascension - https://cookieclicker.fandom.com/wiki/Ascension
- Cookie Monster mod - https://github.com/CookieMonsterTeam/CookieMonster
- Frozen Cookies mod - https://github.com/Icehawk78/FrozenCookies
