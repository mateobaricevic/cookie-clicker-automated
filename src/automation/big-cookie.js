// Handle auto clicking Big Cookie
CCAutomated.getBigCookieCenter = function () {
  let cookie = l("bigCookie");
  if (!cookie || typeof cookie.getBoundingClientRect !== "function") return null;

  let rect = cookie.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    element: cookie,
  };
};

CCAutomated.clickBigCookie = function () {
  if (typeof Game.ClickCookie === "function") {
    Game.ClickCookie();
    return;
  }

  let cookieCenter = CCAutomated.getBigCookieCenter();
  if (cookieCenter && typeof cookieCenter.element.dispatchEvent === "function") {
    cookieCenter.element.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        clientX: cookieCenter.x,
        clientY: cookieCenter.y,
      }),
    );
  }
};

CCAutomated.handleAutoClicker = function () {
  if (CCAutomated.Config.AutoClicker === 0) return;

  for (let i = 0; i < CCAutomated.AutoClicker.clicksPerTick; i++) {
    CCAutomated.clickBigCookie();
  }
};
