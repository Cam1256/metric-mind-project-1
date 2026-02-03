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
    const userId = req.user?.id || "dev_user";
    const { organizationUrn } = req.query;

    if (!organizationUrn) {
      return res.status(400).json({ error: "organizationUrn is required" });
    }

    const tokenData = getToken(userId, "linkedin");
    if (!tokenData) {
      return res.status(401).json({ error: "LinkedIn not connected" });
    }

    const { access_token, organizations } = tokenData;

    if (!organizations.includes(organizationUrn)) {
      return res.status(403).json({ error: "Organization not authorized" });
    }

    const followersRes = await axios.get(
      "https://api.linkedin.com/v2/organizationalEntityFollowerStatistics",
      {
        params: {
          q: "organizationalEntity",
          organizationalEntity: organizationUrn,
        },
        headers: {
          Authorization: `Bearer ${access_token}` },
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

