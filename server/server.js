// server/server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js"); // for AES key encryption on the server
const { User, JournalEntry, initializeDatabase } = require("./models");
const { JWT_SECRET, AES_KEY_SECRET, JWT_EXPIRES_IN } = require("./config");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// --------------------
// Helper: Generate random AES key (256-bit) as a Base64 string
function generateRandomAESKey() {
  // 32 bytes = 256 bits
  const randomWords = CryptoJS.lib.WordArray.random(32); 
  return CryptoJS.enc.Base64.stringify(randomWords);
}

// Helper: Encrypt a plaintext (e.g. userAESKey) with AES_KEY_SECRET
function encryptAESKeyForStorage(aesKeyBase64) {
  return CryptoJS.AES.encrypt(aesKeyBase64, AES_KEY_SECRET).toString();
}

// Helper: Decrypt stored encryptedAESKey with AES_KEY_SECRET
function decryptStoredAESKey(encryptedAESKey) {
  const bytes = CryptoJS.AES.decrypt(encryptedAESKey, AES_KEY_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8); // yields the base64 AES key
}

// --------------------
// Signup Route
app.post("/api/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username & password required." });
    }

    // Check for existing user
    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(409).json({ error: "Username already exists." });
    }

    // 1. Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 2. Generate random AES key for this user
    const userAESKey = generateRandomAESKey(); // base64 string

    // 3. Encrypt that AES key using AES_KEY_SECRET (server‐side secret)
    const encryptedAESKey = encryptAESKeyForStorage(userAESKey);

    // 4. Save to DB
    const user = await User.create({
      username,
      passwordHash,
      encryptedAESKey
    });

    return res.status(201).json({ message: "User created successfully." });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// --------------------
// Login Route
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username & password required." });
    }

    // 1. Look up user
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // 2. Verify password
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // 3. Decrypt the stored AES key for the user
    const decryptedAESKey = decryptStoredAESKey(user.encryptedAESKey);
    // (decryptedAESKey is a base64 string representing a 256‐bit key)

    // 4. Issue JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 5. Return token + encryptedAESKey as JSON
    //    We send back the decryptedAESKey _but still re‐encrypt it with a passphrase derived from the user's password in the client._
    //    In this MVP, we simply return the base64 AES key; the frontend will store it in localStorage.
    //    In a production/FHE system, you would send back an HE‐wrapped public key instead.
    return res.json({
      token,
      aesKey: decryptedAESKey // base64 string; client must keep this secret!
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// --------------------
// Middleware: Authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    if (err) return res.sendStatus(403);
    req.user = {
      id: userPayload.userId,
      username: userPayload.username
    };
    next();
  });
}

// --------------------
// Get Profile (just username)
app.get("/api/profile", authenticateToken, (req, res) => {
  return res.json({ username: req.user.username });
});

// --------------------
// POST /api/journal — store an encrypted journal entry
app.post("/api/journal", authenticateToken, async (req, res) => {
  try {
    const { encryptedText, encryptedVector } = req.body;
    if (!encryptedText || !encryptedVector) {
      return res
        .status(400)
        .json({ error: "encryptedText & encryptedVector are required." });
    }

    // Save the entry
    await JournalEntry.create({
      userId: req.user.id,
      encryptedText,
      encryptedVector,
    });

    return res.status(201).json({ message: "Journal entry saved." });
  } catch (err) {
    console.error("Journal save error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// --------------------
// GET /api/history — return all encrypted entries for this user
app.get("/api/history", authenticateToken, async (req, res) => {
  try {
    const entries = await JournalEntry.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    // Return only necessary fields
    const payload = entries.map((e) => ({
      id: e.id,
      encryptedText: e.encryptedText,
      encryptedVector: e.encryptedVector,
      createdAt: e.createdAt,
    }));

    return res.json({ entries: payload });
  } catch (err) {
    console.error("History fetch error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// --------------------
// Initialize DB & start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🤖  Node.js server listening on port ${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to initialize DB:", err);
});
