const express = require("express");
const axios = require("axios");
const router = express.Router();

const { saveIntegration } = require("../config/dynamodb");

console.log("ENV CHECK FACEBOOK_REDIRECT_URI =", process.env.FACEBOOK_REDIRECT_URI);
console.log("ENV CHECK FRONTEND_URL =", process.env.FRONTEND_URL);


/**
 * STEP 1
 * Login con Facebook (SOLO identidad)
 */
router.get("/facebook/login", (req, res) => {
  const { state } = req.query;

  if (!state) {
    return res.status(400).json({ error: "Missing state (cognitoSub)" });
  }

  const facebookAuthUrl =
    "https://www.facebook.com/v19.0/dialog/oauth" +
    `?client_id=${process.env.FACEBOOK_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.FACEBOOK_REDIRECT_URI)}` +
    `&state=${state}` +
    "&scope=email,public_profile" +
    "&response_type=code";

  res.redirect(facebookAuthUrl);
});

/**
 * STEP 2
 * Callback de Facebook
 */
router.get("/facebook/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({ error: "Missing code or state" });
  }

  const cognitoSub = state;

  try {
    // 1️⃣ Intercambiar code por access_token
    const tokenResponse = await axios.get(
      "https://graph.facebook.com/v19.0/oauth/access_token",
      {
        params: {
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
          code,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // 2️⃣ Obtener datos básicos del usuario
    const profileResponse = await axios.get(
      "https://graph.facebook.com/v19.0/me",
      {
        params: {
          fields: "id,name,email",
          access_token: accessToken,
        },
      }
    );

    // 3️⃣ Guardar integración BÁSICA
    await saveIntegration({
      pk: `USER#${cognitoSub}`,
      sk: "INTEGRATION#FACEBOOK",
      data: {
        facebook: {
          connected: true,
          userId: profileResponse.data.id,
          name: profileResponse.data.name,
          email: profileResponse.data.email || null,
          accessToken, // token corto (login)
        },
      },
    });

    // 4️⃣ Redirigir al frontend
    res.redirect(
      `${process.env.FRONTEND_URL}/integrations?facebook=connected`
    );
  } catch (error) {
    console.error("Facebook OAuth error:", error.response?.data || error);

    res.redirect(
      `${process.env.FRONTEND_URL}/integrations?facebook=error`
    );
  }
});

module.exports = router;
