const pool = require("../db");

const syncUser = async (req, res, next) => {
  try {
    const { sub, email } = req.user;

    if (!sub || !email) {
      return res.status(400).json({ error: "Invalid token payload" });
    }

    // 1️⃣ Buscar usuario
    let result = await pool.query(
      "SELECT * FROM users WHERE cognito_sub = $1",
      [sub]
    );

    let dbUser;

    // 2️⃣ Si no existe, crearlo
    if (result.rows.length === 0) {
      const insert = await pool.query(
        "INSERT INTO users (email, cognito_sub) VALUES ($1, $2) RETURNING *",
        [email, sub]
      );

      dbUser = insert.rows[0];
      console.log("🆕 New user created:", dbUser.email);
    } else {
      dbUser = result.rows[0];
    }

    // 3️⃣ Adjuntar usuario DB al request
    req.dbUser = dbUser;

    next();
  } catch (err) {
    console.error("❌ syncUser error:", err);
    res.status(500).json({ error: "User sync failed" });
  }
};

module.exports = syncUser;
