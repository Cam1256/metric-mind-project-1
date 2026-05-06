// ==============================
// 🧠 MODE ROUTING (cómo responder)
// ==============================
function decideMode(question) {
  const q = question.toLowerCase();

  // 🔹 explicación simple
  if (
    q.includes("what is") ||
    q.includes("qué es") ||
    q.includes("define")
  ) {
    return "explain";
  }

  // 🔹 diagnóstico (causa raíz)
  if (
    q.includes("why") ||
    q.includes("causing") ||
    q.includes("cause") ||
    q.includes("variability") ||
    q.includes("problem")
  ) {
    return "diagnosis";
  }

  // 🔹 acción
  if (
    q.includes("what should") ||
    q.includes("qué deberíamos") ||
    q.includes("qué hacer") ||
    q.includes("next step") ||
    q.includes("fix")
  ) {
    return "action";
  }

  // 🔹 fallback
  return "analysis";
}


// ==============================
// 🌐 DOMAIN ROUTING (qué analizar)
// ==============================
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


// ==============================
// 🚀 EXPORTS
// ==============================
module.exports = { routeDomains, decideMode };