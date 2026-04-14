const fs = require("fs");
const csv = require("csv-parser");
const { mapFactoryRowToSignals } = require("./domain/signals/factoryMapper");
const { generateAggregateInsight } = require("./domain/signals/insightGenerator");

const allSignals = [];

fs.createReadStream("./data/continuous_factory_process.csv")
  .pipe(csv())
  .on("data", (row) => {
    const signals = mapFactoryRowToSignals(row);
    allSignals.push(signals);
  })
  .on("end", () => {
    console.log("\n📊 Processing dataset...\n");

    let stage1Issues = 0;
    let stage2Issues = 0;
    let bottleneckCount = {};

    allSignals.forEach((signals) => {
      signals.forEach((s) => {
        if (s.type === "stage1_deviation" && s.value > 0.05) {
          stage1Issues++;
        }

        if (s.type === "stage2_deviation" && s.value > 0.05) {
          stage2Issues++;
        }

        if (s.type === "bottleneck" && s.value) {
          bottleneckCount[s.value] =
            (bottleneckCount[s.value] || 0) + 1;
        }
      });
    });

    const totalRows = allSignals.length || 1;

    const stage2Rate = (bottleneckCount.Stage2 || 0) / totalRows;
    const stage1Rate = (bottleneckCount.Stage1 || 0) / totalRows;

    const summary = {
      totalRows,
      stage1Issues,
      stage2Issues,
      bottleneckCount,
      rates: {
        stage2: stage2Rate,
        stage1: stage1Rate,
      },
    };

    console.log("\n📊 Summary:");
    console.log(summary);

    console.log("\n💡 Aggregate Insight:");
    console.log(generateAggregateInsight(summary));
  });