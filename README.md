# Cookie Clicker Automated

Cookie Clicker Automated is an addon for the [Cookie Clicker](https://orteil.dashnet.org/cookieclicker/) game.
It can automate clicking the Big Cookie, popping Golden Cookies, popping Wrinklers, and using selected Grimoire spells.

## Bookmarklet

Copy this code and save it as a bookmark. Paste it in the URL section. To activate the addon, click the bookmark while Cookie Clicker is open.

```javascript
javascript: (function () {
	Game.LoadMod('https://mateobaricevic.github.io/cookie-clicker-automated/main.js');
}());
```

## Features

- Big Cookie auto-clicker.
- Golden Cookie auto-clicker.
- Wrinkler popping automation.
- Wizard tower Grimoire automation for selected spell timing.
- Preferences menu entries inside Cookie Clicker's settings menu.

## Development

Run the local syntax check before publishing changes:

```sh
npm run check
```

The addon is intentionally dependency-free. `npm install` is not required for the current check script.

## Notes

This addon can automatically spend resources, cast spells, sell Wizard towers, and pop Wrinklers. Review the settings before enabling automation on a save you care about.
