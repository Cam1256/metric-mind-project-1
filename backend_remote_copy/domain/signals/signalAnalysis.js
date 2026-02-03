/**
 * signalAnalysis.js
 * ------------------
 * Basic deterministic signal reasoning for MetricMind
 * (Not AI, not ML — business logic rules)
 */

const SIGNAL_TYPES = require("./signalTypes");

/**
 * Analyze a set of signals and infer basic business states
 * @param {Array} signals
 * @returns {Object} analysis result
 */
function analyzeSignals(signals = []) {
  const analysis = {
    warnings: [],
    insights: []
  };

  // ---- Shared calculations ----
  const hasPresence = signals.some(
    s => s.type === SIGNAL_TYPES.PRESENCE && s.value === true
  );

  const activitySignals = signals.filter(
    s => s.type === SIGNAL_TYPES.ACTIVITY && typeof s.value === "number"
  );

  const totalActivity = activitySignals.reduce(
    (sum, s) => sum + s.value,
    0
  );

  const platformsDetected = new Set(
    signals
      .filter(s => s.type === SIGNAL_TYPES.SOCIAL_PLATFORM)
      .map(s => s.source)
  ).size;

  // ---- Rule 1: Presence but no activity at all ----
  if (hasPresence && totalActivity === 0) {
    analysis.warnings.push({
      code: "PRESENCE_WITHOUT_ACTIVITY",
      message: "Brand has digital presence but no detectable social activity.",
      severity: "medium"
    });
  }

  // ---- Rule 2: Presence with very low activity ----
  if (
    hasPresence &&
    platformsDetected > 0 &&
    totalActivity / platformsDetected < 3
  ) {
    analysis.warnings.push({
      code: "LOW_SOCIAL_ACTIVITY",
      message: "Brand has very low social activity across detected platforms.",
      severity: "low"
    });
  }

  return analysis;
}

module.exports = { analyzeSignals };

