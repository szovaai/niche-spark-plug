/**
 * Client-side encryption for BYOK API keys using Web Crypto API.
 * Derives an AES-GCM key from the user's ID + a fixed salt via PBKDF2.
 */

const SALT = new TextEncoder().encode("digilaunchkit-byok-v1");
const ITERATIONS = 100000;

async function deriveKey(userId: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(userId),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: SALT, iterations: ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export async function encryptApiKey(plaintext: string, userId: string): Promise<string> {
  if (!plaintext) return "";
  const key = await deriveKey(userId);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  // Store as iv:ciphertext in base64
  return `enc:${arrayBufferToBase64(iv.buffer)}:${arrayBufferToBase64(encrypted)}`;
}

export async function decryptApiKey(stored: string, userId: string): Promise<string> {
  if (!stored) return "";
  // Handle legacy plaintext keys (not prefixed with "enc:")
  if (!stored.startsWith("enc:")) return stored;
  
  const parts = stored.split(":");
  if (parts.length !== 3) return "";
  
  try {
    const key = await deriveKey(userId);
    const iv = new Uint8Array(base64ToArrayBuffer(parts[1]));
    const ciphertext = base64ToArrayBuffer(parts[2]);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    console.error("Failed to decrypt API key");
    return "";
  }
}
