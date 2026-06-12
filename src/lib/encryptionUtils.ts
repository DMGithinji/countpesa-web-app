import * as CryptoJS from "crypto-js";

// Parsed lazily so a missing .env doesn't crash the whole app at module load —
// only encrypted backups need the keys; plain JSON backups work without them.
let keys: { secretKey: CryptoJS.lib.WordArray; iv: CryptoJS.lib.WordArray } | null = null;

function getKeys() {
  if (!keys) {
    const keyHex = import.meta.env.VITE_SECRET_KEY;
    const ivHex = import.meta.env.VITE_IV_STRING;
    if (!keyHex || !ivHex) {
      throw new Error(
        "Encrypted backups are not supported in this build: VITE_SECRET_KEY / VITE_IV_STRING are not configured."
      );
    }
    keys = {
      secretKey: CryptoJS.enc.Hex.parse(keyHex),
      iv: CryptoJS.enc.Hex.parse(ivHex),
    };
  }
  return keys;
}

export function getEncrypted(data: string) {
  const { secretKey, iv } = getKeys();
  const encrypted = CryptoJS.AES.encrypt(data, secretKey, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString(); // Returns ciphertext as a string
}

function decryptString(encryptedData: string) {
  const { secretKey, iv } = getKeys();
  const decrypted = CryptoJS.AES.decrypt(encryptedData, secretKey, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8); // Converts to UTF-8 string
}

export function getDecrypted(encryptedData: string) {
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(encryptedData);
  } catch {
    parsed = null; // Not JSON — a single encrypted string
  }

  // Chunked format: the phone app encrypts backups >5MB as a JSON array of
  // independently encrypted chunks. Decrypt each and concatenate.
  if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((c) => typeof c === "string")) {
    return parsed.map((chunk) => decryptString(chunk)).join("");
  }

  // Plain JSON object — already decrypted
  if (parsed !== null && typeof parsed === "object") {
    return encryptedData;
  }

  return decryptString(encryptedData);
}
