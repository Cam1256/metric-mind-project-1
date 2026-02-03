/**
 * linkedinOAuth.js
 * ----------------------------------------------------
 * LinkedIn OAuth 2.0 integration for MetricMind
 * - Secure OAuth flow
 * - Correct analytics & organization scopes
 * - Multi-user ready
 * - Stores token + member + organizations
 */

const express = require("express");
const axios = require("axios");
const querystring = require("querystring");
const crypto = require("crypto");
const { saveToken, getToken, removeToken } = require("./oauthHandler");

const router = express.Router();

/* =======================
   ENV CONFIG
======================= */
const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;

/* =======================
   SCOPES (LinkedIn real)
======================= */

const LINKEDIN_SCOPES = [
  "openid",
  "profile",
  "email"
 /**
  // ORGANIZATIONS
  "r_organization_social",
  "r_organization_followers",
  "rw_organization_admin" */
].join(" ");



console.log("🔧 LinkedIn OAuth loaded:", {
  CLIENT_ID,
  REDIRECT_URI,
});

const oauthCookieConfig = {
  maxAge: 15 * 60 * 1000,
  httpOnly: true,
  secure: true,
  sameSite: "none",
  domain: ".metricmind.cloud", // 🔥 CLAVE
};




/* =======================
   STEP 1 — Start OAuth
======================= */
// STEP 1 — Start OAuth
router.get("/linkedin/login", (req, res) => {
  const userId = req.user?.id || "dev_user";
  const state = crypto.randomUUID();

  // Guardar state + userId en cookies seguras (15 min)
  res.cookie("linkedin_oauth_state", state, oauthCookieConfig);
  res.cookie("linkedin_oauth_user", userId, oauthCookieConfig);


  const authUrl =
    "https://www.linkedin.com/oauth/v2/authorization?" +
    querystring.stringify({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: LINKEDIN_SCOPES,
      state,
    });

  console.log("🔗 Redirecting to LinkedIn OAuth");
  return res.redirect(authUrl);
});


/* =======================
   STEP 2 — OAuth Callback
======================= */
router.get("/linkedin/callback", async (req, res) => {
  console.log("🔁 CALLBACK QUERY:", req.query);
  console.log("🍪 COOKIES:", req.cookies);
  const { code, state } = req.query;

  const savedState = req.cookies.linkedin_oauth_state;
  const userId = req.cookies.linkedin_oauth_user || "dev_user";

  if (!code) return res.redirect("https://metricmind.cloud/linkedin/error");

  // Validar state
  if (state !== savedState) {
    console.error("❌ Invalid OAuth state");
    return res.status(403).send("Invalid OAuth state");
  }

  // Aquí continua el flujo normal: intercambiar código por token y guardar
  try {
    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      querystring.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, expires_in } = tokenResponse.data;
    console.log("🔑 LINKEDIN ACCESS TOKEN:", access_token);
    console.log("⏱️ EXPIRES IN:", expires_in);

    const meResponse = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const member = meResponse.data;

    await saveToken(userId, "linkedin", {
      access_token,
      expires_at: Date.now() + expires_in * 1000,
      member_id: member.sub,
      email: member.email,
      name: member.name,
      scopes: LINKEDIN_SCOPES.split(" "),
    });

    console.log("✅ LinkedIn connected for user:", userId);

    res.clearCookie("linkedin_oauth_state", { domain: ".metricmind.cloud" });
    res.clearCookie("linkedin_oauth_user", { domain: ".metricmind.cloud" });

    return res.redirect("https://metricmind.cloud/linkedin/success");
  } catch (err) {
    console.error("❌ LinkedIn OAuth error:", err.response?.data || err.message);
    return res.redirect("https://metricmind.cloud/linkedin/error");
  }
});


/* =======================
   UTILITIES
======================= */

// Check connection status
router.get("/linkedin/status", (req, res) => {
  const userId = req.user?.id || "dev_user";
  const token = getToken(userId, "linkedin");
  res.json({ connected: !!token });
});

/* =======================
   LINKEDIN ORGANIZATIONS
======================= */
router.get("/linkedin/organizations", async (req, res) => {
  try {
    const userId = req.user?.id || "dev_user";
    const tokenData = getToken(userId, "linkedin");

    if (!tokenData) {
      return res.status(401).json({ connected: false });
    }

    const { access_token } = tokenData;


    const orgRes = await axios.get(
      "https://api.linkedin.com/v2/organizationAcls",
      {
        params: { q: "roleAssignee" },
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const organizations = orgRes.data.elements || [];

    return res.json({
      connected: true,
      hasOrganizations: organizations.length > 0,
      organizations,
    });
  } catch (err) {
    console.error(
      "❌ LinkedIn organizations error:",
      err.response?.data || err.message
    );
    return res.status(500).json({ error: "Failed to fetch organizations" });
  }
});



// Disconnect LinkedIn
router.delete("/linkedin/disconnect", (req, res) => {
  const userId = req.user?.id || "dev_user";
  removeToken(userId, "linkedin");
  res.json({ message: "LinkedIn disconnected" });
});

module.exports = router;
