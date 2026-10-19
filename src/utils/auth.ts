import * as Crypto from 'expo-crypto';

/**
 * Password hashing for the local (on-device) account store.
 *
 * Format: `v2$<iterations>$<salt hex>$<hash hex>` (salted, iterated SHA-256).
 * This is stronger than the legacy 32-bit hash but is not a memory-hard KDF;
 * accounts only live in the device's SQLite database (no server).
 */
const ITERATIONS = 5000;

/** Legacy 32-bit hash. Kept only to verify and upgrade old accounts. */
function legacyHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function derive(password: string, salt: string, iterations: number): Promise<string> {
  let digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${password}`
  );
  for (let i = 1; i < iterations; i++) {
    digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${salt}:${digest}`
    );
  }
  return digest;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = toHex(await Crypto.getRandomBytesAsync(16));
  const hash = await derive(password, salt, ITERATIONS);
  return `v2$${ITERATIONS}$${salt}$${hash}`;
}

/** Marker for accounts that cannot sign in with a password (e.g. seeded sample data). */
export const DISABLED_PASSWORD_HASH = '!';

export function needsRehash(stored: string): boolean {
  return !stored.startsWith('v2$') && stored !== DISABLED_PASSWORD_HASH;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (stored === DISABLED_PASSWORD_HASH) return false;
  if (stored.startsWith('v2$')) {
    const [, iterations, salt, hash] = stored.split('$');
    const count = Number(iterations);
    if (!salt || !hash || !Number.isInteger(count) || count < 1) return false;
    return (await derive(password, salt, count)) === hash;
  }
  return legacyHash(password) === stored;
}
