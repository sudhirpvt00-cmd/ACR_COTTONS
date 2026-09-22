import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashValue(value) {
  return bcrypt.hash(value.toString(), SALT_ROUNDS);
}

export async function compareHash(plainValue, hashedValue) {
  if (!plainValue || !hashedValue) return false;
  return bcrypt.compare(plainValue.toString(), hashedValue);
}
