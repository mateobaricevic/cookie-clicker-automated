CCAutomated.formatDuration = function (seconds) {
  if (!isFinite(seconds) || seconds <= 0) return "now";

  seconds = Math.ceil(seconds);
  let units = [
    { label: "y", seconds: 365 * 24 * 60 * 60 },
    { label: "m", seconds: 30 * 24 * 60 * 60 },
    { label: "d", seconds: 24 * 60 * 60 },
    { label: "h", seconds: 60 * 60 },
    { label: "m", seconds: 60 },
    { label: "s", seconds: 1 },
  ];
  let parts = [];
  let firstUnitIndex = units.length - 1;

  for (let i = 0; i < units.length; i++) {
    if (seconds >= units[i].seconds) {
      firstUnitIndex = i;
      break;
    }
  }

  let lastUnitIndex = Math.min(firstUnitIndex + 2, units.length - 1);

  for (let i = firstUnitIndex; i <= lastUnitIndex; i++) {
    let amount = Math.floor(seconds / units[i].seconds);
    parts.push(amount + units[i].label);
    seconds -= amount * units[i].seconds;
  }

  return parts.join(" ");
};

CCAutomated.formatNumber = function (value) {
  if (!isFinite(value)) return "?";
  if (typeof Beautify === "function") return Beautify(value);
  if (Math.abs(value) >= 1000000) return value.toExponential(2);
  if (Math.abs(value) >= 1000) return Math.round(value).toLocaleString();
  if (Math.abs(value) >= 10) return Math.round(value).toString();
  return value.toFixed(2);
};
