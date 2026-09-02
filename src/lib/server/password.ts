import "server-only";

const ITERATIONS = 210_000;

function bytesToBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(value: string) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" }, key, 256);
  return `pbkdf2_sha256$${ITERATIONS}$${bytesToBase64(salt)}$${bytesToBase64(new Uint8Array(bits))}`;
}

export async function verifyPassword(password: string, encoded: string) {
  const [algorithm, iterations, salt, expected] = encoded.split("$");
  if (algorithm !== "pbkdf2_sha256" || !iterations || !salt || !expected) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: base64ToBytes(salt), iterations: Number(iterations), hash: "SHA-256" }, key, 256);
  const actual = bytesToBase64(new Uint8Array(bits));
  return actual === expected;
}
