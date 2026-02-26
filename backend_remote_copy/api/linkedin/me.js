const express = require("express");
const router = express.Router();
const axios = require("axios");
const { getToken } = require("../../auth/oauthHandler");

router.get("/me", async (req, res) => {
  try {
    const userId = req.user?.id || "dev_user";
    const tokenData = getToken(userId, "linkedin");

    if (!tokenData) {
      return res.status(401).json({ error: "No LinkedIn token found" });
    }

    const response = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("LinkedIn fetch failed:", err.message);
    res.status(500).json({ error: "Failed to fetch LinkedIn profile" });
  }
});

module.exports = router;