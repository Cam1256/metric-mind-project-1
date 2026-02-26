const webScraper = require("../scraper/webScraper");
const { buildSnapshot } = require("../domain/snapshots/buildSnapshot");
const pool = require("../db");

async function analyzeWebsite(req, res) {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {

    const userId = req.dbUser.id;

    console.log("Analyze request from user:", userId);
    const scrapingResult = await webScraper(url);

    const snapshot = buildSnapshot({
      url,
      scrapingResult
    });

    await pool.query(
      `
      UPDATE users
      SET last_analysis = $1
      WHERE id = $2
      `,
      [snapshot, userId]
    );

    global.metricmindContext = global.metricmindContext || {};

    global.metricmindContext[userId] = {
      analysis: snapshot,
      timestamp: Date.now(),
    };

    console.log("🧠 Analysis context saved for user:", userId);

    return res.json(snapshot);

  } catch (error) {
    console.error("Analyze website failed:", error);

    return res.status(500).json({
      error: "Failed to analyze website",
      message: error.message
    });
  }
}

module.exports = analyzeWebsite;
