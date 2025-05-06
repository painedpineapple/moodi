import CryptoJS from "crypto-js";

function deriveKey(passphrase: string, salt: CryptoJS.lib.WordArray) {
  // Define the configuration for PBKDF2
  const config = {
    keySize: 256 / 32, // for a 256-bit key
    iterations: 100000, // iterations (higher means more secure and slower)
    hasher: CryptoJS.algo.SHA256, // hash function to use
  };

  // Derive the key
  const key = CryptoJS.PBKDF2(passphrase, salt, config);

  return key.toString(); // Convert the WordArray to a string
}

// Encrypt Data
export function encryptData(data: string, passphrase: string) {
  // Ensure salt is unique for each encryption
  const salt = CryptoJS.lib.WordArray.random(128 / 8);
  const key = deriveKey(passphrase, salt);

  // Convert data object to string
  const dataString = JSON.stringify(data);

  // Encrypt
  const encrypted = CryptoJS.AES.encrypt(dataString, key, {
    mode: CryptoJS.mode.CTR,
  });

  // Return encrypted data and salt for decryption
  return {
    ciphertext: encrypted.toString(),
    salt: salt.toString(),
  };
}

// Decrypt Data
export function decryptData(
  ciphertext: string,
  salt: string,
  passphrase: string
) {
  const key = deriveKey(passphrase, CryptoJS.enc.Hex.parse(salt));

  // Decrypt
  const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
    mode: CryptoJS.mode.CTR,
  });
  const originalDataString = decrypted.toString(CryptoJS.enc.Utf8);

  // Convert string back to data object
  return JSON.parse(originalDataString);
}
