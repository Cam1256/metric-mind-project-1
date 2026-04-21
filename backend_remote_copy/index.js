require("dotenv").config();




const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const analyzeFactoryRoute = require("./api/agent/analyzeFactory");
const askAgentRoute = require("./api/agent/askAgent");

//const verifyJwt = require("./middleware/verifyJwt");
//const syncUser = require("./middleware/syncUser");

//const linkedinRoutes = require("./api/linkedin/me");

//const linkedinMetrics = require("./metrics/linkedinMetrics");
//const linkedinOrganizations = require("./api/linkedinOrganizations");
//const analyzeWebsite = require("./api/analyzeWebsite");
//const linkedinOAuth = require("./auth/linkedinOAuth");
//const facebookAuth = require("./auth/facebook");
//const scrapWebsite = require("./scraper/webScraper");
//const analyzeFactoryRoute = require("./api/agent/analyzeFactory");
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
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));



// SESSION (OBLIGATORIO para LinkedIn OAuth)
app.use(cookieParser());

app.use(express.json());


//app.use("/auth", linkedinOAuth);
//app.use("/auth", facebookAuth);

app.use("/api/agent", analyzeFactoryRoute);
app.use("/api/agent", askAgentRoute);
/* =========================
   METRICS ROUTES
========================= */


//app.use("/api/linkedin", verifyJwt, syncUser, linkedinRoutes);
//app.use("/api", verifyJwt, syncUser, linkedinMetrics);
//app.use("/api", verifyJwt, syncUser, linkedinOrganizations);

//app.post("/api/analyze-website", analyzeWebsite);



/* =========================
   HEALTH CHECK
========================= */



app.get("/", (req, res) => {
  res.send("✅ Backend MetricMind running successfully");
});

/* =========================
   AUTH ROUTES
========================= */




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
