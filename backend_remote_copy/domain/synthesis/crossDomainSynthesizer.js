function synthesizeInsights(insights = []) {
  if (!insights.length) {
    return {
      summary: "No insights available",
      topFindings: [],
      actions: []
    };
  }

  let allFindings = [];
  let allActions = [];

  insights.forEach((i) => {
    if (i.findings) {
      allFindings.push(...i.findings);
    }

    if (i.actions) {
      allActions.push(...i.actions);
    }
  });

  // ==============================
  // 🔥 1. FILTRAR SOLO DRIVERS
  // ==============================
  const drivers = allFindings.filter(f => f.type === "driver");

  // ==============================
  // 🔥 2. ORDENAR POR SEVERITY
  // ==============================
  const ranked = drivers.sort(
    (a, b) => (b.severity || 0) - (a.severity || 0)
  );

  const topFindings = ranked.slice(0, 5);

  // ==============================
  // 🔥 3. ACTIONS
  // ==============================
  const uniqueActions = [...new Set(allActions)];

  // ==============================
  // 🔥 4. SUMMARY REAL
  // ==============================
  const summary = topFindings.length
    ? `Top drivers: ${topFindings.map(f => f.variable).join(", ")}`
    : "No significant drivers detected";

  return {
    summary,
    topFindings,
    actions: uniqueActions
  };
}

module.exports = { synthesizeInsights };