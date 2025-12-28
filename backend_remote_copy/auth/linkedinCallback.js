// auth/linkedinCallback.js
const axios = require("axios");

module.exports = async function linkedinCallback(req, res) {
  try {
    const { code, state, error, error_description } = req.query;

    console.log("🔁 CALLBACK QUERY:", req.query);
    console.log("🍪 COOKIES:", req.cookies);

    /* ===============================
       1️⃣ Manejo de error OAuth
    =============================== */
    if (error) {
      console.error("❌ LinkedIn OAuth error:", { error, error_description });
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=linkedin_oauth_failed`
      );
    }

    /* ===============================
       2️⃣ Validar state (CSRF)
    =============================== */
    if (!state || state !== req.cookies.linkedin_oauth_state) {
      console.error("❌ Invalid OAuth state");
      return res.status(403).send("Invalid OAuth state");
    }

    /* ===============================
       3️⃣ Intercambiar code por access_token
    =============================== */
    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const { access_token } = tokenResponse.data;

    /* ===============================
       4️⃣ Obtener datos del usuario (OPENID)
       👉 ENDPOINT CORRECTO
    =============================== */
    const userInfoResponse = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const {
      sub: linkedinId,
      name,
      given_name,
      family_name,
      email,
      picture,
    } = userInfoResponse.data;

    console.log("✅ LinkedIn user:", userInfoResponse.data);

    /* ===============================
       5️⃣ AQUÍ TU LÓGICA DE NEGOCIO
       - Crear usuario si no existe
       - Login si ya existe
    =============================== */

    // EJEMPLO:
    // const user = await User.findOrCreateFromLinkedIn({ ... });

    /* ===============================
       6️⃣ Limpiar cookies OAuth
    =============================== */
    res.clearCookie("linkedin_oauth_state");
    res.clearCookie("linkedin_oauth_user");

    /* ===============================
       7️⃣ Redirigir al frontend
    =============================== */
    return res.redirect(
	  "https://metricmind.cloud/auth/success?provider=linkedin"
	);


  } catch (err) {
    console.error("❌ LinkedIn callback fatal error:", err.response?.data || err);
    return res.redirect(
      `${process.env.FRONTEND_URL}/login?error=linkedin_callback_failed`
    );
  }
};
