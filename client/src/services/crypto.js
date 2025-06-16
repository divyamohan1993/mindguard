// client/src/services/crypto.js
import CryptoJS from "crypto-js";

/**
 * 1. getAESKey() → returns the raw AES key (base64) from localStorage.
 * 2. encryptWithAES(plaintext) → returns ciphertext (Base64).
 * 3. decryptWithAES(ciphertextBase64) → returns plaintext.
 */

export function getAESKey() {
  const aesKeyBase64 = localStorage.getItem("aesKey");
  if (!aesKeyBase64) {
    throw new Error("No AES key found in localStorage. You must log in again.");
  }
  return aesKeyBase64;
}

/**
 * Encrypt a UTF‐8 string using AES with the raw key (base64).
 * Returns Base64 ciphertext.
 */
export function encryptWithAES(plaintextUTF8) {
  const aesKeyBase64 = getAESKey();
  // Convert base64 key → WordArray
  const keyWA = CryptoJS.enc.Base64.parse(aesKeyBase64);
  // Use AES encryption with ECB mode + PKCS7 (for simplicity)
  const encrypted = CryptoJS.AES.encrypt(plaintextUTF8, keyWA, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString(); // Base64 ciphertext
}

/**
 * Decrypt Base64 ciphertext with AES raw key.
 * Returns the original UTF-8 string.
 */
export function decryptWithAES(ciphertextBase64) {
  const aesKeyBase64 = getAESKey();
  const keyWA = CryptoJS.enc.Base64.parse(aesKeyBase64);
  const decrypted = CryptoJS.AES.decrypt(ciphertextBase64, keyWA, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}
