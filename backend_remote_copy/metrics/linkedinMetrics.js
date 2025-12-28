/**
 * linkedinMetrics.js
 * ----------------------------------------------------
 * Real LinkedIn metrics endpoints for MetricMind
 */

const express = require("express");
const axios = require("axios");
const { getToken } = require("../auth/oauthHandler");

const router = express.Router();

/* =======================
   GET ORGANIZATION METRICS
======================= */
router.get("/linkedin/metrics/organization", async (req, res) => {
  try {
    // ⚠️ Luego vendrá de JWT / sesión
    const userId = "metricmind";

    const tokenData = getToken(userId, "linkedin");
    if (!tokenData) {
      return res.status(401).json({ error: "LinkedIn not connected" });
    }

    const { access_token, organizations } = tokenData;

    if (!organizations || organizations.length === 0) {
      return res.status(400).json({ error: "No LinkedIn organizations found" });
    }

    // 👉 Por ahora usamos la primera org
    const organizationUrn = organizations[0];

    /* -----------------------
       Followers count
    ------------------------ */
    const followersRes = await axios.get(
      "https://api.linkedin.com/v2/organizationalEntityFollowerStatistics",
      {
        params: {
          q: "organizationalEntity",
          organizationalEntity: organizationUrn,
        },
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const followers =
      followersRes.data.elements?.[0]?.followerCounts
        ?.organicFollowerCount || 0;

    return res.json({
      organization: organizationUrn,
      followers,
    });

  } catch (err) {
    console.error(
      "❌ LinkedIn metrics error:",
      err.response?.data || err.message
    );
    return res.status(500).json({ error: "Failed to fetch LinkedIn metrics" });
  }
});

module.exports = router;
