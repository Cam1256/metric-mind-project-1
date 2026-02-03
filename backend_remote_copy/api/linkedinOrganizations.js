/**
 * linkedinOrganizations.js
 * ---------------------------------------
 * Fetch LinkedIn organizations & roles
 * Used for company onboarding
 */

const express = require("express");
const axios = require("axios");
const { getToken } = require("../auth/oauthHandler");

const router = express.Router();

router.get("/linkedin/organizations", async (req, res) => {
  const userId = req.user?.id || "dev_user";

  const token = getToken(userId, "linkedin");

  if (!token) {
    return res.status(401).json({
      connected: false,
      reason: "linkedin_not_connected",
    });
  }

  try {
    const response = await axios.get(
      "https://api.linkedin.com/v2/organizationAcls?q=roleAssignee",
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      }
    );

    const orgs = response.data.elements.map(el => ({
      organization: el.organization,
      role: el.role,
      state: el.state,
    }));

    return res.json({
      connected: true,
      hasOrganizations: orgs.length > 0,
      organizations: orgs,
    });
  } catch (err) {
    console.error("❌ LinkedIn org fetch error:", err.response?.data || err.message);

    return res.status(500).json({
      connected: true,
      error: "linkedin_org_fetch_failed",
      details: err.response?.data || err.message,
    });
  }
});

module.exports = router;
