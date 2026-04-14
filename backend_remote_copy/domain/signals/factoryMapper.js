function mapFactoryRowToSignals(row) {
  // ===== 1. STAGE 1 DEVIATION =====
  const stage1Actual = parseFloat(row["Stage1.Output.Measurement0.U.Actual"]);
  const stage1Setpoint = parseFloat(row["Stage1.Output.Measurement0.U.Setpoint"]);

  let stage1Deviation = null;

  if (!isNaN(stage1Actual) && !isNaN(stage1Setpoint) && stage1Setpoint !== 0) {
    stage1Deviation = Math.abs(stage1Actual - stage1Setpoint) / stage1Setpoint;
  }

  // ===== 2. STAGE 2 DEVIATION =====
  const stage2Actual = parseFloat(row["Stage2.Output.Measurement0.U.Actual"]);
  const stage2Setpoint = parseFloat(row["Stage2.Output.Measurement0.U.Setpoint"]);

  let stage2Deviation = null;

  if (!isNaN(stage2Actual) && !isNaN(stage2Setpoint) && stage2Setpoint !== 0) {
    stage2Deviation = Math.abs(stage2Actual - stage2Setpoint) / stage2Setpoint;
  }

  // ===== 3. MACHINE STRESS (EJEMPLO SIMPLE) =====
  const machine1Temp = parseFloat(row["Machine1.Zone1Temperature.C.Actual"]);
  const machine2Temp = parseFloat(row["Machine2.Zone1Temperature.C.Actual"]);

  let machineStress = 0;

  if (!isNaN(machine1Temp) && machine1Temp > 200) machineStress += 1;
  if (!isNaN(machine2Temp) && machine2Temp > 200) machineStress += 1;

  // ===== 4. BOTTLENECK DETECTION =====
  let bottleneck = null;

  if (stage1Deviation > stage2Deviation) {
    bottleneck = "Stage1";
  } else if (stage2Deviation > stage1Deviation) {
    bottleneck = "Stage2";
  }

  // ===== 5. RETURN SIGNALS =====
  return [
  {
    type: "stage1_deviation",
    value: stage1Deviation,
  },
  {
    type: "stage2_deviation",
    value: stage2Deviation,
  },
  {
    type: "machine_stress",
    value: machineStress,
  },
  {
    type: "bottleneck",
    value: bottleneck,
  },
];
}

module.exports = { mapFactoryRowToSignals };