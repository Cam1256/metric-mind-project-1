const { runDynamicSignalEngine } = require("../signals/dynamicSignalEngine");

function safeParse(value) {
  const v = parseFloat(value);
  return isNaN(v) ? null : v;
}

// ==============================
// 🔥 1. Promedio por stage (USA TODO)
// ==============================
function getStageAverage(row, stagePrefix) {
  let sum = 0;
  let count = 0;

  for (let i = 0; i <= 14; i++) {
    const val = safeParse(
      row[`${stagePrefix}.Output.Measurement${i}.U.Actual`]
    );

    if (val !== null) {
      sum += val;
      count++;
    }
  }

  return count ? sum / count : null;
}

// ==============================
// 🔥 2. Extraer series
// ==============================
function extractSeries(rows) {
  const stage1 = [];
  const stage2 = [];
  const tempMachine2 = [];

  rows.forEach((row) => {
    const s1 = getStageAverage(row, "Stage1");
    const s2 = getStageAverage(row, "Stage2");
    const temp = safeParse(row["Machine2.Zone1Temperature.C.Actual"]);

    if (s1 !== null) stage1.push(s1);
    if (s2 !== null) stage2.push(s2);
    if (temp !== null) tempMachine2.push(temp);
  });

  return { stage1, stage2, tempMachine2 };
}

// ==============================
// 🔥 3. Estadísticas
// ==============================
function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function std(arr) {
  const mean = avg(arr);
  const variance =
    arr.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / arr.length;

  return Math.sqrt(variance);
}

// ==============================
// 🔥 4. Correlación simple
// ==============================
function correlation(x, y) {
  const n = Math.min(x.length, y.length);

  const xSlice = x.slice(0, n);
  const ySlice = y.slice(0, n);

  const meanX = avg(xSlice);
  const meanY = avg(ySlice);

  let num = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const dx = xSlice[i] - meanX;
    const dy = ySlice[i] - meanY;

    num += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }
  if (denomX === 0 || denomY === 0) return 0;

  return num / Math.sqrt(denomX * denomY);
}

// ==============================
// 🔥 5. Trend (últimos vs anteriores)
// ==============================
function computeTrend(arr) {
  if (arr.length < 20) return 0;

  const last = arr.slice(-10);
  const prev = arr.slice(-20, -10);

  return avg(last) - avg(prev);
}

// ==============================
// 🔥 6. Analyzer principal
// ==============================
function analyzeProduction(rows, intent = {}) {
  const dynamic = runDynamicSignalEngine(rows);

  const topDrivers = dynamic.topDrivers || [];
  const secondaryDrivers = dynamic.secondaryDrivers || [];
  const weakDrivers = dynamic.weakDrivers || [];

  // ==============================
  // 🔥 1. Selección por intención
  // ==============================
  let selectedDrivers = topDrivers;

  const q = (intent?.raw || "").toLowerCase();
  const scope = intent?.scope || "";

  if (scope === "secondary" || q.includes("secondary") || q.includes("less obvious")) {
    selectedDrivers = secondaryDrivers;
  } else if (
    scope === "risk" ||
    scope === "weak" ||
    q.includes("low impact") ||
    q.includes("risky")
  ) {
    selectedDrivers = weakDrivers;
  }

  // fallback inteligente
  if (!selectedDrivers.length) {
    selectedDrivers = topDrivers;
  }

  // ==============================
  // 🔥 2. Construir findings reales
  // ==============================
  const findings = selectedDrivers.map((d) => ({
    type: "driver",
    variable: d.variable,
    severity: d.strength,
    message: `${d.variable} shows measurable influence on output variability and performance`
  }));

  // ==============================
  // 🔥 3. Issues y acciones
  // ==============================
  const issues = [];
  const actions = [];

  if (!selectedDrivers.length) {
    issues.push("No significant drivers detected");
    actions.push("Continue monitoring system behavior");
  } else {
    issues.push("Performance influenced by key process variables");

    actions.push(
      "Monitor and stabilize high-impact variables",
      "Reduce variability in critical machine parameters"
    );
  }

  return {
    domain: "production",
    findings,   // 🔥 IMPORTANTE: esto alimenta el synthesizer
    issues,
    actions,
    impactScore: selectedDrivers.reduce((acc, d) => acc + d.strength, 0)
  };
}


module.exports = { analyzeProduction };