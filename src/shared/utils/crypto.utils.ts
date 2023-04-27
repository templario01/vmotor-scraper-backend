import crypto from 'crypto';

const CRYPTO_KEY = Buffer.from('abcdefghijklmnopqrstuvwxyz123456', 'utf8');

export function encrypt(text, key = CRYPTO_KEY) {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + '|' + encrypted;
  } catch (error) {
    console.log(error);
  }
}

export function decrypt(text, key = CRYPTO_KEY) {
  const parts = text.split('|');
  const iv = Buffer.from(parts[0], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  const encryptedText = parts[1];
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
