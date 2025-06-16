// server/models.js
const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");

// Initialize Sequelize to use SQLite file database
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "database.sqlite"),
  logging: false, // disable SQL logging; set to console.log for debugging
});

// User model: stores username, hashed password, and an encrypted AES‐key
const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // we will store each user’s AES key (base64) encrypted with a secret
  encryptedAESKey: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

// JournalEntry: holds userId, encryptedText, encryptedVector, createdAt
const JournalEntry = sequelize.define("JournalEntry", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  encryptedText: {
    type: DataTypes.TEXT, // store base64 AES‐ciphertext
    allowNull: false,
  },
  encryptedVector: {
    type: DataTypes.TEXT, // store base64 AES‐ciphertext for sentiment vector
    allowNull: false,
  }
}, {
  timestamps: true, // adds createdAt & updatedAt
});

// One‐to‐Many: User → JournalEntries
User.hasMany(JournalEntry, { foreignKey: "userId" });
JournalEntry.belongsTo(User, { foreignKey: "userId" });

// Sync database (for MVP, use sync({ force: false }))
async function initializeDatabase() {
  await sequelize.sync({ alter: true });
}

module.exports = {
  sequelize,
  User,
  JournalEntry,
  initializeDatabase
};
