const express = require("express");
const cors = require("cors");
const scrapWebsite = require("./scraper/webScraper");

const app = express();

// ✅ CORS — allow only production domains
app.use(cors({
  origin: ["https://metricmind.cloud", "https://www.metricmind.cloud"]
}));

app.use(express.json());

const PORT = process.env.PORT || 5000;

// Health check
app.get("/", (req, res) => {
  res.send("✅ Backend MetricMind running successfully");
});

// ✅ Web scraping endpoint
app.get("/scrap", async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "Missing 'url' parameter" });
  }

  try {
    console.log(`🕸️ Received scraping request for: ${url}`);
    const result = await scrapWebsite(url);
    res.json(result);
  } catch (err) {
    console.error("❌ Scraping failed:", err.message);
    res.status(500).json({ error: "Internal scraping error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
