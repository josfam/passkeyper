import CryptoJS from "crypto-js";

export const decryptData = (
  encryptedData: string,
  ekSalt: string | null,
  masterPassword: string | null
): string => {
  if (!ekSalt || !masterPassword || !encryptedData) return encryptedData;

  try {
    const combined = CryptoJS.enc.Base64.parse(encryptedData);
    const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4));
    const ciphertext = CryptoJS.lib.WordArray.create(
      combined.words.slice(4),
      combined.sigBytes - 16
    );
    const salt = CryptoJS.enc.Hex.parse(ekSalt);
    const key = CryptoJS.PBKDF2(masterPassword, salt, {
      keySize: 256 / 32,
      iterations: 1000,
    });
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext },
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption error:", error);
    console.error("Encrypted data:", encryptedData);
    console.error("Salt:", ekSalt);
    return encryptedData;
  }
};

export const encryptData = (
  data: string,
  ekSalt: string,
  masterPassword: string
): string => {
  const salt = CryptoJS.enc.Hex.parse(ekSalt);
  const iv = CryptoJS.lib.WordArray.random(16);
  const key = CryptoJS.PBKDF2(masterPassword, salt, {
    keySize: 256 / 32,
    iterations: 1000,
  });

  const encrypted = CryptoJS.AES.encrypt(data, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const combined = CryptoJS.lib.WordArray.create();
  combined.concat(iv);
  combined.concat(encrypted.ciphertext);

  return CryptoJS.enc.Base64.stringify(combined);
};