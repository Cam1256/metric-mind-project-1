// auth/facebook.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

const APP_ID = process.env.FACEBOOK_APP_ID;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const REDIRECT_URI = "https://www.metricmind.cloud/auth/facebook/callback";

// STEP 1 — Redirect user to Facebook Login
router.get("/facebook", (req, res) => {
  const loginURL =
    `https://www.facebook.com/v24.0/dialog/oauth?` +
    `client_id=${APP_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=public_profile,email,pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_insights` +
    `&response_type=code`;

  return res.redirect(loginURL);
});

// STEP 2 — Facebook redirects back with "code"
router.get("/facebook/callback", async (req, res) => {
  const { code } = req.query;

  try {
    // Exchange code for access token
    const tokenRes = await axios.get(
      "https://graph.facebook.com/v24.0/oauth/access_token",
      {
        params: {
          client_id: APP_ID,
          client_secret: APP_SECRET,
          redirect_uri: REDIRECT_URI,
          code,
        },
      }
    );

    const access_token = tokenRes.data.access_token;

    // Get user profile
    const userRes = await axios.get(
      "https://graph.facebook.com/me?fields=id,name,email",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    // If you want to use long-lived token
    const longTokenRes = await axios.get(
      "https://graph.facebook.com/v24.0/oauth/access_token",
      {
        params: {
          grant_type: "fb_exchange_token",
          client_id: APP_ID,
          client_secret: APP_SECRET,
          fb_exchange_token: access_token,
        },
      }
    );

    const long_token = longTokenRes.data.access_token;

    // RETURN TO FRONTEND WITH TOKEN
    return res.redirect(
      `https://www.metricmind.cloud/?facebook_success=1` +
      `&access_token=${long_token}` +
      `&name=${encodeURIComponent(userRes.data.name)}` +
      `&id=${userRes.data.id}`
    );

  } catch (err) {
    console.error("❌ Facebook OAuth Error", err.response?.data || err.message);
    return res.redirect("https://www.metricmind.cloud/?facebook_error=1");
  }
});

module.exports = router;
