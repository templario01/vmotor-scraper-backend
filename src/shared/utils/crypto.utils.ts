import { AES, format } from 'crypto-js';

const CRYPTO_KEY = process.env.CRIPTO_KEY;

export function encrypt(text: string) {
  const ciphertext = AES.encrypt(text, CRYPTO_KEY, {
    format: format.Hex,
  }).toString();

  return ciphertext;
}

export function decrypt(ciphertext: string) {
  const bytes = AES.decrypt(ciphertext, CRYPTO_KEY);

  return bytes.toString(CryptoJS.enc.Utf8);
}
