function routeDomains(question, intent) {
  const q = question.toLowerCase();

  // 🔥 1. PRIORIDAD: intent (más inteligente)
  if (intent?.scope === "drivers") {
    return ["production"];
  }

  if (intent?.scope === "performance") {
    return ["production"];
  }

  if (intent?.scope === "overall") {
    return ["production", "sales", "procurement"];
  }

  // 🔧 2. fallback por keywords (legacy)
  if (q.includes("overall") || q.includes("efficiency")) {
    return ["production", "sales", "procurement"];
  }

  if (q.includes("factory") || q.includes("stage")) {
    return ["production"];
  }

  if (q.includes("revenue") || q.includes("sales")) {
    return ["sales"];
  }

  // 🧠 3. fallback final
  return ["production"];
}

module.exports = { routeDomains };