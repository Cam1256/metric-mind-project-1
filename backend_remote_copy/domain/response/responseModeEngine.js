function classifyResponseMode(question = "", intent = {}) {
  const q = question.toLowerCase();

  // 🔥 1. DIAGNOSIS (PRIORIDAD ALTA)
  if (
    q.includes("why") ||
    q.includes("causing") ||
    q.includes("cause") ||
    q.includes("root") ||
    q.includes("variability") ||
    q.includes("por qué") ||
    intent.scope === "drivers"
  ) {
    return "diagnosis";
  }

  // 🔹 2. ACTION
  if (
    q.includes("what should") ||
    q.includes("how to fix") ||
    q.includes("qué hacer") ||
    q.includes("cómo solucionar")
  ) {
    return "action";
  }

  // 🔹 3. EXPLAIN (más restringido)
  if (
    (q.includes("what is") && !q.includes("causing")) || // 🔥 filtro clave
    q.includes("define") ||
    q.includes("meaning") ||
    q.includes("qué es") ||
    q.includes("definir")
  ) {
    return "explain";
  }

  // 🔹 4. COMPARISON
  if (intent.scope === "comparison") {
    return "comparison";
  }

  // 🔹 DEFAULT
  return "analysis";
}

module.exports = { classifyResponseMode };