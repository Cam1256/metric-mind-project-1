const express = require("express");
const router = express.Router();
const fs = require("fs");
const csv = require("csv-parser");
const { callLLM } = require("../../services/llm/llmClient");

const { mapFactoryRowToSignals } = require("../../domain/signals/factoryMapper");
let cachedRows = null;

// ==============================
// 🧠 1. Interpret question
// ==============================
function interpretQuestion(question = "") {
  const q = question.toLowerCase();

  if (q.includes("bottleneck")) {
    return { type: "bottleneck" };
  }

  if (q.includes("stage 1")) {
    return { type: "performance", target: "Stage1" };
  }

  if (q.includes("stage 2")) {
    return { type: "performance", target: "Stage2" };
  }

  if (q.includes("summary") || q.includes("overall")) {
    return { type: "summary" };
  }

  return { type: "summary" };
}

// ==============================
// 📊 2. Load dataset
// ==============================
function loadDataset() {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream("./data/continuous_factory_process.csv")
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

// ==============================
// 🔍 3. Query layer (IMPORTANT)
// ==============================
function queryData(rows, intent) {
  switch (intent.type) {
    case "performance":
      return rows.map((row) => ({
        stage1: parseFloat(row["Stage1.Output.Measurement0.U.Actual"]),
        stage2: parseFloat(row["Stage2.Output.Measurement0.U.Actual"]),
      }));

    case "bottleneck":
      return rows;

    case "summary":
    default:
      return rows;
  }
}

// ==============================
// 🧠 4. Reasoning layer
// ==============================
function analyzePerformance(data, target) {
  let total = 0;
  let count = 0;

  data.forEach((d) => {
    const value =
      target === "Stage1" ? d.stage1 : d.stage2;

    if (!isNaN(value)) {
      total += value;
      count++;
    }
  });

  const avg = total / count;

  return { avg };
}

function detectBottleneck(rows) {
  let stage1Issues = 0;
  let stage2Issues = 0;

  rows.forEach((row) => {
    const s1 = parseFloat(row["Stage1.Output.Measurement0.U.Actual"]);
    const s2 = parseFloat(row["Stage2.Output.Measurement0.U.Actual"]);

    if (s1 < 0.5) stage1Issues++;
    if (s2 < 0.5) stage2Issues++;
  });

  return stage2Issues > stage1Issues ? "Stage2" : "Stage1";
}

function generateSummary(rows) {
  return {
    totalRows: rows.length,
  };
}

// ==============================
// 💬 5. Response layer
// ==============================
function buildResponse(intent, result) {
  switch (intent.type) {
    case "performance":
      return `Average performance for ${intent.target} is ${result.avg.toFixed(
        2
      )}.`;

    case "bottleneck":
      return `${result} is currently acting as the main bottleneck in the system.`;

    case "summary":
    default:
      return `The system processed ${result.totalRows} operational records.`;
  }
}

// ==============================
// 🚀 6. Main endpoint
// ==============================
router.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Missing question" });
    }

    // 1. Interpret
    const intent = interpretQuestion(question);

    // 2. Load data
    if (!cachedRows) {
      cachedRows = await loadDataset();
    }
    const rows = cachedRows;

    // 3. Query relevant data
    const data = queryData(rows, intent);

    let result;

    // 4. Apply reasoning
    switch (intent.type) {
      case "performance":
        result = analyzePerformance(data, intent.target);
        break;

      case "bottleneck":
        result = detectBottleneck(rows);
        break;

      case "summary":
      default:
        result = generateSummary(rows);
    }

    // 5. Build response
    const rawAnswer = buildResponse(intent, result);


    let answer;

    try {
      const finalAnswer = await callLLM([
        {
          role: "system",
          content: `
    You are an experienced operations advisor analyzing a manufacturing process.
    Stage 1 and Stage 2 represent sequential production stages.
    Explain insights clearly, practically, and with operational implications.
          `,
        },
        {
          role: "user",
          content: `Insight: ${rawAnswer}`,
        },
      ]);

      answer = finalAnswer;
    } catch (err) {
      console.error("LLM error:", err.message);
      answer = rawAnswer; // fallback
    }

    return res.json({
      success: true,
      question,
      intent,
      answer,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  }
});

module.exports = router;