const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

// 🔎 Validar que existan variables de entorno
const REGION = process.env.COGNITO_REGION;
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const CLIENT_ID = process.env.COGNITO_CLIENT_ID;

if (!REGION || !USER_POOL_ID || !CLIENT_ID) {
  console.error("❌ Missing Cognito environment variables");
  process.exit(1); // Mejor fallar al iniciar que romper en runtime
}

const client = jwksClient({
  jwksUri: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      console.error("JWKS signing key error:", err);
      return callback(err);
    }

    if (!key) {
      return callback(new Error("Signing key not found"));
    }

    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

const verifyJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    getKey,
    {
      issuer: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`,
      audience: CLIENT_ID,
    },
    (err, decoded) => {
      if (err) {
        console.error("JWT validation error:", err);
        return res.status(401).json({ error: "Invalid token" });
      }

      req.user = decoded;
      next();
    }
  );
};

module.exports = verifyJwt;
