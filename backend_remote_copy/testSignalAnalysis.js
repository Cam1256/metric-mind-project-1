// testSignalAnalysis.js

const { analyzeSignals } = require("./domain/signals/signalAnalysis");

const signals = [
  { type: "presence", value: true },
  { type: "activity", value: 0 }
];

console.log("🧪 Signal analysis result:");
console.log(JSON.stringify(analyzeSignals(signals), null, 2));
