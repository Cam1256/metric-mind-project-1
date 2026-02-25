const express = require("express");
const router = express.Router();

const { getToken } = require("../../auth/oauthHandler");
const verifyJwt = require("../../middleware/verifyJwt");

router.get("/me", verifyJwt, async (req, res) => {
  try {
    const token = await getToken(req.user.id);

    const response = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error("LinkedIn /me error:", error);
    res.status(500).json({ error: "LinkedIn fetch failed" });
  }
});

module.exports = router;