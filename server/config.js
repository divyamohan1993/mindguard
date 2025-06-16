// server/config.js
require("dotenv").config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || "fallback_jwt_secret",
  AES_KEY_SECRET: process.env.AES_KEY_SECRET || "fallback_aes_secret",
  // JWT expiration (e.g. 7 days)
  JWT_EXPIRES_IN: "7d"
};
