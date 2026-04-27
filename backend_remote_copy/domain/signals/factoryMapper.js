function mapFactoryRowToSignals(row) {
  const signals = [];

  // ==============================
  // 🔥 1. Stage averages (TODOS los measurements)
  // ==============================
  function stageAvg(stage) {
    let sum = 0;
    let count = 0;

    for (let i = 0; i <= 14; i++) {
      const val = parseFloat(
        row[`${stage}.Output.Measurement${i}.U.Actual`]
      );

      if (!isNaN(val)) {
        sum += val;
        count++;
      }
    }

    return count ? sum / count : null;
  }

  const s1Avg = stageAvg("Stage1");
  const s2Avg = stageAvg("Stage2");

  signals.push({ type: "stage1_avg", value: s1Avg });
  signals.push({ type: "stage2_avg", value: s2Avg });

  // ==============================
  // 🔥 2. Deviation (mejorado)
  // ==============================
  function stageDeviation(stage) {
    let sum = 0;
    let count = 0;

    for (let i = 0; i <= 14; i++) {
      const actual = parseFloat(
        row[`${stage}.Output.Measurement${i}.U.Actual`]
      );
      const setpoint = parseFloat(
        row[`${stage}.Output.Measurement${i}.U.Setpoint`]
      );

      if (!isNaN(actual) && !isNaN(setpoint) && setpoint !== 0) {
        sum += Math.abs(actual - setpoint) / setpoint;
        count++;
      }
    }

    return count ? sum / count : null;
  }

  signals.push({
    type: "stage1_deviation",
    value: stageDeviation("Stage1"),
  });

  signals.push({
    type: "stage2_deviation",
    value: stageDeviation("Stage2"),
  });

  // ==============================
  // 🔥 3. Machine conditions (más señales)
  // ==============================
  const temp = parseFloat(row["Machine2.Zone1Temperature.C.Actual"]);
  const rpm = parseFloat(row["Machine2.MotorRPM.C.Actual"]);
  const pressure = parseFloat(row["Machine2.MaterialPressure.U.Actual"]);

  signals.push({ type: "machine2_temp", value: temp });
  signals.push({ type: "machine2_rpm", value: rpm });
  signals.push({ type: "machine2_pressure", value: pressure });

  // ==============================
  // 🔥 4. Simple bottleneck
  // ==============================
  if (s1Avg !== null && s2Avg !== null) {
    signals.push({
      type: "bottleneck",
      value: s2Avg < s1Avg ? "Stage2" : "Stage1",
    });
  }

  return signals;
}

module.exports = { mapFactoryRowToSignals };