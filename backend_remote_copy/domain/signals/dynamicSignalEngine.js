function safeParse(v) {
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

// ==============================
// 🔥 1. Detectar variables numéricas
// ==============================
function detectNumericColumns(sampleRow) {
  return Object.keys(sampleRow).filter((key) => {
    return key !== "time_stamp";
  });
}

// ==============================
// 🔥 2. Construir series por variable
// ==============================
function buildTimeSeries(rows, columns) {
  const series = {};

  columns.forEach((col) => {
    series[col] = [];
  });

  rows.forEach((row) => {
    columns.forEach((col) => {
      const val = safeParse(row[col]);
      if (val !== null) {
        series[col].push(val);
      }
    });
  });

  return series;
}

// ==============================
// 🔥 3. Seleccionar targets (outputs)
// ==============================
function detectTargets(columns) {
  return columns.filter((c) =>
    c.includes("Stage2.Output.Measurement")
  );
}

// ==============================
// 🔥 4. Promediar target (Stage2)
// ==============================
function buildTargetSeries(series, targets) {
  const length = Math.min(...targets.map(t => series[t].length));

  const target = [];

  for (let i = 0; i < length; i++) {
    let sum = 0;
    let count = 0;

    targets.forEach((t) => {
      const v = series[t][i];
      if (v !== null && v !== undefined) {
        sum += v;
        count++;
      }
    });

    target.push(count ? sum / count : null);
  }

  return target;
}

// ==============================
// 🔥 5. Correlación
// ==============================
function correlation(x, y) {
  const n = Math.min(x.length, y.length);

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

  for (let i = 0; i < n; i++) {
    const xi = x[i];
    const yi = y[i];

    if (xi == null || yi == null) continue;

    sumX += xi;
    sumY += yi;
    sumXY += xi * yi;
    sumX2 += xi * xi;
    sumY2 += yi * yi;
  }

  const numerator = n * sumXY - sumX * sumY;
  const denom = Math.sqrt(
    (n * sumX2 - sumX * sumX) *
    (n * sumY2 - sumY * sumY)
  );

  if (!denom) return 0;

  return numerator / denom;
}

// ==============================
// 🔥 6. Detectar drivers
// ==============================
function detectDrivers(series, targetSeries) {
  const drivers = [];

  Object.keys(series).forEach((key) => {
    if (key.includes("Stage2.Output")) return; // skip target

    const corr = correlation(series[key], targetSeries);

    if (Math.abs(corr) > 0.4) {
      drivers.push({
        variable: key,
        correlation: corr,
        strength: Math.abs(corr),
      });
    }
  });

  return drivers.sort((a, b) => b.strength - a.strength);
}

// ==============================
// 🔥 MAIN ENGINE
// ==============================
function runDynamicSignalEngine(rows) {
  if (!rows.length) return {};

  const columns = detectNumericColumns(rows[0]);

  const series = buildTimeSeries(rows, columns);

  const targets = detectTargets(columns);

  const targetSeries = buildTargetSeries(series, targets);

  const drivers = detectDrivers(series, targetSeries);

   const sorted = drivers.sort((a, b) => b.strength - a.strength);

  const topDrivers = sorted.slice(0, 3);
  const secondaryDrivers = sorted.slice(3, 10);
  const weakDrivers = sorted.slice(10, 20);

  return {
    target: "Stage2_avg",
    topDrivers,
    secondaryDrivers,
    weakDrivers,
    allDrivers: sorted
  };
}

module.exports = { runDynamicSignalEngine };