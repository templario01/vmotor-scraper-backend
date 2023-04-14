import { genSalt, hash } from 'bcrypt';

export async function encryptPassword(pass: string): Promise<string> {
  const salt = await genSalt(10);
  return hash(pass, salt);
}
