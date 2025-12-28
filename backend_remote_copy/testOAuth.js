const { saveToken, getToken, removeToken } = require("./auth/oauthHandler");

// Simular guardar token
saveToken("user123", "linkedin", "abc123xyz_fake_token");

// Leer token
const token = getToken("user123", "linkedin");
console.log("Decrypted token:", token);

// Eliminar token
removeToken("user123", "linkedin");
