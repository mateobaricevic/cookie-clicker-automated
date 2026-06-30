CCAutomated.getStockMarket = function () {
  let bank = Game.Objects && Game.Objects["Bank"];
  if (!bank) return null;
  if (typeof Game.isMinigameReady === "function" && !Game.isMinigameReady(bank)) return null;
  return bank.minigame || null;
};

CCAutomated.getStockMarketBankLevel = function () {
  let bank = Game.Objects && Game.Objects["Bank"];
  if (!bank || typeof bank.level !== "number") return 0;
  return bank.level;
};

CCAutomated.getStockMarketGoods = function (market) {
  if (!market) return [];
  if (market.goodsById && typeof market.goodsById.length === "number") return market.goodsById;
  if (!market.goods) return [];

  let goods = [];
  for (let key in market.goods) {
    goods.push(market.goods[key]);
  }
  return goods;
};

CCAutomated.getStockMarketGoodId = function (good, index) {
  if (good && typeof good.id === "number") return good.id;
  return index;
};

CCAutomated.getStockMarketGoodName = function (good) {
  if (!good) return "Unknown";
  return good.symbol || good.name || good.dname || "Unknown";
};

CCAutomated.getStockMarketGoodPrice = function (good) {
  if (!good) return 0;
  if (typeof good.val === "number") return good.val;
  if (typeof good.value === "number") return good.value;
  if (typeof good.price === "number") return good.price;
  return 0;
};

CCAutomated.getStockMarketGoodDelta = function (good) {
  if (!good) return 0;
  if (typeof good.d === "number") return good.d;
  if (typeof good.delta === "number") return good.delta;
  if (typeof good.change === "number") return good.change;
  return 0;
};

CCAutomated.getStockMarketGoodStock = function (good) {
  if (!good) return 0;
  if (typeof good.stock === "number") return good.stock;
  if (typeof good.amount === "number") return good.amount;
  return 0;
};

CCAutomated.getStockMarketGoodCapacity = function (market, good) {
  if (!market || !good) return 0;

  if (typeof market.getGoodMaxStock === "function") {
    try {
      return market.getGoodMaxStock(good);
    } catch (e) {
      console.warn("[CCAutomated] Failed to read stock capacity", good.name, e);
    }
  }

  if (typeof good.stockMax === "number") return good.stockMax;
  if (typeof good.maxStock === "number") return good.maxStock;
  if (typeof good.capacity === "number") return good.capacity;
  return 0;
};

CCAutomated.getStockMarketRestingValue = function (good, index) {
  let id = CCAutomated.getStockMarketGoodId(good, index);
  return 10 * (id + 1) + CCAutomated.getStockMarketBankLevel() - 1;
};

CCAutomated.getStockMarketBrokerCount = function (market) {
  if (!market || typeof market.brokers !== "number") return 0;
  return market.brokers;
};

CCAutomated.getStockMarketBrokerOverhead = function (market) {
  let brokers = CCAutomated.getStockMarketBrokerCount(market);
  return 20 / (brokers + 1);
};

CCAutomated.getStockMarketTargetBrokerCount = function (targetOverhead) {
  targetOverhead = targetOverhead || 5;
  return Math.max(0, Math.ceil(20 / targetOverhead - 1));
};

CCAutomated.getStockMarketProfit = function (market) {
  if (!market || typeof market.profit !== "number") return 0;
  return market.profit;
};

CCAutomated.formatStockMarketDollars = function (value) {
  return "$" + CCAutomated.formatNumber(value);
};

CCAutomated.getStockMarketGoodAdvice = function (market, good, index) {
  let price = CCAutomated.getStockMarketGoodPrice(good);
  let resting = CCAutomated.getStockMarketRestingValue(good, index);
  let stock = CCAutomated.getStockMarketGoodStock(good);
  let capacity = CCAutomated.getStockMarketGoodCapacity(market, good);
  let buyBelow = Math.max(1, resting * 0.7);
  let sellAbove = resting * 1.1;
  let action = "hold";
  let score = 0;

  if (price <= 1.05) {
    action = "floor buy";
    score = 1000 + resting - price;
  } else if (price <= buyBelow && stock < capacity) {
    action = "buy watch";
    score = resting - price;
  } else if (stock > 0 && price >= sellAbove) {
    action = "sell watch";
    score = price - resting;
  }

  return {
    good: good,
    name: CCAutomated.getStockMarketGoodName(good),
    price: price,
    delta: CCAutomated.getStockMarketGoodDelta(good),
    resting: resting,
    stock: stock,
    capacity: capacity,
    action: action,
    score: score,
  };
};

CCAutomated.getStockMarketSummary = function () {
  let market = CCAutomated.getStockMarket();
  let summary = {
    ready: !!market,
    goods: [],
    opportunities: [],
    buyCount: 0,
    sellCount: 0,
    stockHeld: 0,
    stockCapacity: 0,
    brokers: 0,
    overhead: 0,
    targetBrokers: CCAutomated.getStockMarketTargetBrokerCount(5),
    officeLevel: 0,
    profit: 0,
  };
  if (!market) return summary;

  let goods = CCAutomated.getStockMarketGoods(market);
  summary.brokers = CCAutomated.getStockMarketBrokerCount(market);
  summary.overhead = CCAutomated.getStockMarketBrokerOverhead(market);
  summary.officeLevel =
    typeof market.officeLevel === "number" ? market.officeLevel : CCAutomated.getStockMarketBankLevel();
  summary.profit = CCAutomated.getStockMarketProfit(market);

  for (let i = 0; i < goods.length; i++) {
    let good = goods[i];
    if (!good) continue;

    let advice = CCAutomated.getStockMarketGoodAdvice(market, good, i);
    summary.goods.push(advice);
    summary.stockHeld += advice.stock;
    summary.stockCapacity += advice.capacity;

    if (advice.action === "floor buy" || advice.action === "buy watch") summary.buyCount++;
    else if (advice.action === "sell watch") summary.sellCount++;

    if (advice.action !== "hold") summary.opportunities.push(advice);
  }

  summary.opportunities.sort(function (a, b) {
    return b.score - a.score;
  });

  return summary;
};

CCAutomated.formatStockMarketGoodAdvice = function (advice) {
  if (!advice) return "";

  let deltaText = advice.delta ? (advice.delta > 0 ? "+" : "") + CCAutomated.formatNumber(advice.delta) : "flat";
  return CCAutomated.joinStatusParts([
    advice.name,
    advice.action,
    CCAutomated.formatStockMarketDollars(advice.price),
    "rest " + CCAutomated.formatStockMarketDollars(advice.resting),
    deltaText,
    advice.capacity > 0 ? advice.stock + "/" + advice.capacity : "",
  ]);
};

CCAutomated.getStockMarketLoanStatusText = function () {
  let activeLoans = 0;
  let activeInterest = 0;

  if (Game.buffs) {
    for (let name in Game.buffs) {
      if (/^loan \d$/.test(name)) activeLoans++;
      else if (/^loan \d interest$/.test(name)) activeInterest++;
    }
  }

  if (activeLoans > 0) return activeLoans + " active";
  if (activeInterest > 0) return activeInterest + " interest penalty active";
  if (CCAutomated.isHugeComboActive()) return "Huge combo active; consider manual loan timing";

  let garden = CCAutomated.getGardenSummary ? CCAutomated.getGardenSummary() : null;
  if (garden && garden.comboReady > 0) return "Combo plants ready; keep loans manual";

  return "Manual only; save for huge combos";
};
