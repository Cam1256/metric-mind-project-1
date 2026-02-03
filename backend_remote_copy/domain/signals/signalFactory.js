// domain/signals/signalFactory.js

function createSignal(arg1, arg2, arg3 = {}) {
  // 🧠 Soporte dual:
  // createSignal({ accountId, entityId, type, value, source })
  // createSignal(type, value, meta)

  let signal = {};

  if (typeof arg1 === "object") {
    // Forma explícita
    signal = arg1;
  } else {
    // Forma simple (mapper / scraper)
    signal = {
      type: arg1,
      value: arg2,
      source: arg3.platform
        ? `scraper:${arg3.platform}`
        : "scraper:web",
      accountId: arg3.accountId,
      entityId: arg3.entityId
    };
  }

  return {
    accountId: signal.accountId,
    entityId: signal.entityId,
    type: signal.type,
    value: signal.value,
    source: signal.source,
    createdAt: new Date().toISOString()
  };
}

module.exports = { createSignal };
