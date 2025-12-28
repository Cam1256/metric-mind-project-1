/**
 * oauthHandler.js
 * --------------------------------------------------
 * Secure OAuth token storage for MetricMind
 * - AES-192-CBC with random IV
 * - Encrypted JSON payloads
 * - Multi-user / multi-platform ready
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const tokenPath = path.join(__dirname, "tokenStorage.json");

/* =======================
   CRYPTO CONFIG
======================= */
const ALGORITHM = "aes-192-cbc";
const KEY = crypto.scryptSync(
  process.env.SECRET_KEY || "metricmind_secret",
  "metricmind_salt",
  24
);

/* =======================
   HELPERS
======================= */
function encryptObject(obj) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  const encrypted =
    cipher.update(JSON.stringify(obj), "utf8", "hex") +
    cipher.final("hex");

  return {
    iv: iv.toString("hex"),
    data: encrypted,
  };
}

function decryptObject(payload) {
  const iv = Buffer.from(payload.iv, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);

  const decrypted =
    decipher.update(payload.data, "hex", "utf8") +
    decipher.final("utf8");

  return JSON.parse(decrypted);
}

/* =======================
   STORAGE UTILITIES
======================= */
function loadStore() {
  if (!fs.existsSync(tokenPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(tokenPath, "utf8"));
}

function saveStore(store) {
  fs.writeFileSync(tokenPath, JSON.stringify(store, null, 2));
}

/* =======================
   PUBLIC API
======================= */
function saveToken(userId, platform, tokenObject) {
  const store = loadStore();

  if (!store[userId]) store[userId] = {};

  store[userId][platform] = encryptObject(tokenObject);

  saveStore(store);
  console.log(`🔐 Token saved for ${userId} (${platform})`);
}

function getToken(userId, platform) {
  const store = loadStore();
  const encryptedPayload = store[userId]?.[platform];

  if (!encryptedPayload) return null;

  try {
    return decryptObject(encryptedPayload);
  } catch (err) {
    console.error("❌ Token decryption failed:", err.message);
    return null;
  }
}

function removeToken(userId, platform) {
  const store = loadStore();

  if (store[userId] && store[userId][platform]) {
    delete store[userId][platform];
    saveStore(store);
    console.log(`🗑️ Token removed for ${userId} (${platform})`);
  }
}

module.exports = {
  saveToken,
  getToken,
  removeToken,
};
