# Cookie Clicker Strategy Notes

These notes collect strategy and quality-of-life ideas for future implementation in Cookie Clicker Automated.

## Best Next Features

1. Garden automation
   - Done: auto-freeze and unfreeze around growth and harvest windows.
   - Done: harvest mature Bakeberries, Queenbeets, and Duketaters only during strong buff windows.
   - Done: switch soils by goal when the Garden exposes a soil-change method: Fertilizer for growth, Clay for mature passive bonuses, Wood Chips for mutations.
   - Done: show garden status in the settings panel.
   - Later: add planting and mutation planning.

2. Combo dashboard and Golden Cookie banking
   - Done: show current Lucky bank target, current bank status, and whether spending above the Lucky bank is safe.
   - Done: display active buff multiplier and combo time remaining.
   - Done: show visible golden cookie shimmers, including storm drops and forced shimmers.
   - Later: add special handling for cookie chains and stacked golden cookie edge cases.

3. Stronger Grimoire logic
   - Done: detect existing golden cookies before casting Force the Hand of Fate.
   - Done: show magic readiness and expected combo state in the settings panel.
   - Later: add safer dual-cast support using wizard tower selling thresholds.
   - Consider tracking spell count and season state for predictable Force the Hand of Fate outcomes.

4. Pantheon strategy helper
   - Support Godzamok combo mode by selling low-value buildings during Click Frenzy or Dragonflight windows.
   - Add Skruuia-aware wrinkler popping guidance or automation.
   - Consider Mokalsium-oriented passive CpS guidance.

5. Season automation
   - Auto-buy Santa stages.
   - Track seasonal cookie, egg, and reindeer drops.
   - Avoid leaving a season before key drops are collected.
   - Auto-click reindeer during Christmas.

6. Stock Market helper
   - Show each stock's resting value and buy/sell signal.
   - Add conservative buy-under and sell-over thresholds.
   - Recommend loans only during major combo or garden harvest windows.

7. Better auto-buyer planning
   - Evaluate buy-10 and buy-100 building batches.
   - Account for purchases that unlock high-value follow-up upgrades.
   - Show several top candidates, not only the current target.

8. Ascension checklist
   - Recommend permanent upgrade slot choices, especially kitten upgrades.
   - Show before-ascend checklist: pop wrinklers, buy Chocolate Egg if available, harvest garden if buffed, export save.
   - Track next heavenly upgrade targets.

## Suggested Implementation Order

1. Garden automation.
2. Combo dashboard and Grimoire improvements.
3. Pantheon/Godzamok combo mode.
4. Season automation.
5. Stock Market helper.
6. Advanced auto-buyer planning.
7. Ascension checklist improvements.

## References

- Cookie Clicker Wiki: Golden Cookie - https://cookieclicker.fandom.com/wiki/Golden_Cookie
- Cookie Clicker Wiki: Grimoire - https://cookieclicker.fandom.com/wiki/Grimoire
- Cookie Clicker Wiki: Garden - https://cookieclicker.fandom.com/wiki/Garden
- Cookie Clicker Wiki: Pantheon - https://cookieclicker.fandom.com/wiki/Pantheon
- Cookie Clicker Wiki: Stock Market - https://cookieclicker.fandom.com/wiki/Stock_Market
- Cookie Clicker Wiki: Ascension - https://cookieclicker.fandom.com/wiki/Ascension
- Cookie Monster mod - https://github.com/CookieMonsterTeam/CookieMonster
- Frozen Cookies mod - https://github.com/Icehawk78/FrozenCookies
