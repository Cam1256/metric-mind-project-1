const express = require("express");
const router = express.Router();
const fs = require("fs");
const csv = require("csv-parser");
const { formatDriversTable, formatMermaid } = require("../../domain/output/outputFormatter");

const { callLLM } = require("../../services/llm/llmClient");

const { analyzeProduction } = require("../../domain/analysis/productionAnalyzer");
const { routeDomains } = require("../../domain/routing/domainRouter");
const { synthesizeInsights } = require("../../domain/synthesis/crossDomainSynthesizer");


let cachedRows = null;

// ==============================
// 📊 Load dataset
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
// 🧠 Intent fallback
// ==============================
function interpretQuestion(question = "") {
  const q = question.toLowerCase();

  if (q.includes("bottleneck")) return { type: "bottleneck" };
  if (q.includes("stage 1")) return { type: "performance", target: "Stage1" };
  if (q.includes("stage 2")) return { type: "performance", target: "Stage2" };

  return { type: "summary" };
}

// ==============================
// 🚀 MAIN ENDPOINT
// ==============================
function cleanJSON(raw) {
      if (!raw) return raw;

      return raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
    }
router.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Missing question" });
    }

    // ==========================
    // 🧠 1. Intent (LLM)
    // ==========================
    let intent;

    try {
      const planRaw = await callLLM([
        {
          role: "system",
          content: `
          You are an operations query interpreter.

          Your job is to understand what the user is asking in a flexible way.

          Return ONLY JSON:
          {
            "goal": "short description of what the user wants to know",
            "scope": "broad area (e.g. performance, variability, drivers, overall)",
            "focus": "optional specific target (e.g. Stage2, temperature, etc.)"
          }

          Do NOT restrict to predefined categories.
          Do NOT reject valid analytical questions.
          Do NOT invent scores, ratings, or metrics.
          Only use values explicitly provided.
          `
        },
        { role: "user", content: question }
      ]);
    
      const cleaned = cleanJSON(planRaw);
      intent = JSON.parse(cleaned);
      intent.raw = question;
    } catch (err) {
      console.error("Intent fallback:", err.message);
      intent = interpretQuestion(question);
    }

    // ==========================
    // 🚧 2. Guardrail
    // ==========================
    const q = question.toLowerCase();

    const unrelated =
      q.includes("weather") ||
      q.includes("joke") ||
      q.includes("time");

    if (unrelated) {
      return res.json({
        success: true,
        question,
        intent,
        answer:
          "I can only help analyze manufacturing operations data."
      });
    }

    // ==========================
    // 📊 3. Load data
    // ==========================
    if (!cachedRows) {
      cachedRows = await loadDataset();
    }

    const rows = cachedRows;

    const productionInsight = analyzeProduction(rows, intent);

    // ==========================
    // 🔥 4. SIGNALS
    // ==========================
    
    

    // ==========================
    // 🔥 5. DOMAIN ROUTER
    // ==========================
    const domains = routeDomains(question, intent);

    // ==========================
    // 🔥 6. ANALYSIS (multi-domain ready)
    // ==========================
    let insights = [];

    if (domains.includes("production")) {
      insights.push(productionInsight); // 🔥 usa el ya calculado
    }

    // 🔜 futuro:
    // if (domains.includes("sales")) { ... }
    // if (domains.includes("procurement")) { ... }

    if (!insights.length) {
      return res.json({
        success: false,
        error: "No analyzers available for selected domain(s)"
      });
    }

    // ==========================
    // 🔥 7. SYNTHESIS (GLOBAL BRAIN)
    // ==========================
    const synthesis = synthesizeInsights(insights);

    // ==========================
    // 🤖 8. LLM EXPLANATION
    // ==========================
    let answer;

    try {
      answer = await callLLM([
        {
          role: "system",
          content: `
          You are a senior operations advisor.

          Rules:
          - Use ONLY provided data
          - Be concise, analytical, actionable
          - Do NOT hallucinate
          - Do NOT invent metrics, scores, or values
          - If a value is not provided, do not mention it
          - Do not explain severity generically
          - Instead, reference relative importance (e.g. "highest among detected variables")
          - Avoid repeating the same structure for each driver
          - Vary explanation style while staying concise
          - Indicate relative strength between drivers (e.g. strongest, moderate, secondary)
          - Do not use exact numbers unless provided
          `
        },
        {
          role: "user",
          content: `
          User question:
          ${question}

          Domains analyzed:
          ${domains.join(", ")}

          Key Findings (ranked by importance):
          ${JSON.stringify(synthesis.topFindings || synthesis.topIssues, null, 2)}

          Actions:
          ${(synthesis.actions || []).join(", ")}

          Summary:
          ${synthesis.summary}

          You MUST:
          - Identify the top 2–3 drivers
          - Rank them by importance
          - Explain their combined impact
          - Mention multiple variables when relevant (not just one)
          Provide:
          - A ranked list of drivers
          - Short explanation for each
          `
        }
      ]);
    } catch (err) {
      console.error("LLM error:", err.message);
      answer = "Analysis completed but explanation failed.";
    }
    const structured = {
      drivers: synthesis.topFindings,
      actions: synthesis.actions,
      summary: synthesis.summary,
      table: formatDriversTable(synthesis.topFindings),
      mermaid: formatMermaid(synthesis.topFindings)
    };
    // ==========================
    // ✅ 9. FINAL RESPONSE
    // ==========================
    return res.json({
      success: true,
      question,
      intent,
      domains,
      synthesis,
      answer,
      structured
    });
    } catch (err) {
      console.error("Internal error:", err);
      return res.status(500).json({ error: "Internal error" });
    }
    });

module.exports = router;