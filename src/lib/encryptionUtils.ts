import * as CryptoJS from "crypto-js";

const secretKey = CryptoJS.enc.Hex.parse(import.meta.env.VITE_SECRET_KEY);
const ivString = CryptoJS.enc.Hex.parse(import.meta.env.VITE_IV_STRING);

export function getEncrypted(data: string) {
  const encrypted = CryptoJS.AES.encrypt(data, secretKey, {
    iv: ivString,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString(); // Returns ciphertext as a string
}

function isEncrypted(value: string) {
  try {
    JSON.parse(value);
    return false;
  } catch {
    return true;
  }
}

export function getDecrypted(encryptedData: string) {
  if (!isEncrypted(encryptedData)) {
    return encryptedData;
  }
  const decrypted = CryptoJS.AES.decrypt(encryptedData, secretKey, {
    iv: ivString,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8); // Converts to UTF-8 string
}
