

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Metrics
const linkedinMetrics = require("./metrics/linkedinMetrics");

// 👇 AÑADE ESTO
const linkedinOrganizations = require("./api/linkedinOrganizations");

const analyzeWebsite = require("./api/analyzeWebsite");





// Auth routes
const linkedinOAuth = require("./auth/linkedinOAuth");
const facebookAuth = require("./auth/facebook");


// Other services
const scrapWebsite = require("./scraper/webScraper");

// Metrics



const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);  

/* =========================
   GLOBAL MIDDLEWARES
========================= */



// CORS (NECESARIO antes de session)
app.use(cors({
  origin: [
    "https://metricmind.cloud",
    "https://www.metricmind.cloud"
  ],
  credentials: true,
}));

// SESSION (OBLIGATORIO para LinkedIn OAuth)
app.use(cookieParser());

app.use(express.json());


/* =========================
   METRICS ROUTES
========================= */

app.use("/api", linkedinMetrics);
// 👇 ORGANIZACIONES LINKEDIN
app.use("/api", linkedinOrganizations);
app.post("/api/analyze-website", analyzeWebsite);




/* =========================
   HEALTH CHECK
========================= */



app.get("/", (req, res) => {
  res.send("✅ Backend MetricMind running successfully");
});

/* =========================
   AUTH ROUTES
========================= */


app.use("/auth", linkedinOAuth);
app.use("/auth", facebookAuth);

/* =========================
   METRICS ROUTES
========================= */


/* =========================
   SCRAPER ROUTES
========================= */

app.get("/scrap", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing 'url' parameter" });
  }

  try {
    console.log(`🕸️ Scraping request for: ${url}`);
    const result = await scrapWebsite(url);
    res.json(result);
  } catch (err) {
    console.error("❌ Scraping failed:", err.message);
    res.status(500).json({ error: "Internal scraping error" });
  }
});

/* =========================
   SERVER START
========================= */

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 MetricMind backend running on port ${PORT}`);
});



module.exports = app;
