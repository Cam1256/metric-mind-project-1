const express = require("express");
const router = express.Router();
const fs = require("fs");
const csv = require("csv-parser");

const { mapFactoryRowToSignals } = require("../../domain/signals/factoryMapper");
const { generateAggregateInsight } = require("../../domain/signals/insightGenerator");

router.post("/analyze-factory", async (req, res) => {
  try {
    const allSignals = [];

    fs.createReadStream("./data/continuous_factory_process.csv")
      .pipe(csv())
      .on("data", (row) => {
        const signals = mapFactoryRowToSignals(row);
        allSignals.push(signals);
      })
      .on("end", () => {
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

        const insight = generateAggregateInsight(summary);

        return res.json({
          success: true,
          summary,
          insight,
        });
      })
      .on("error", (err) => {
        console.error("❌ CSV processing error:", err.message);
        return res.status(500).json({
          success: false,
          error: "Error processing dataset",
        });
      });

  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

module.exports = router;