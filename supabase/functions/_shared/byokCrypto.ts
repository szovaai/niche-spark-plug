// Server-side BYOK encryption. Derives an AES-GCM key from a SERVER-ONLY
// secret combined with the user id, so a leaked profiles row alone is not
// sufficient to decrypt stored keys.

const ITERATIONS = 200_000;

function requireServerSecret(): string {
  const s = Deno.env.get("BYOK_ENCRYPTION_KEY");
  if (!s) throw new Error("BYOK_ENCRYPTION_KEY not configured");
  return s;
}

async function deriveServerKey(userId: string): Promise<CryptoKey> {
  const serverSecret = requireServerSecret();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(serverSecret + ":" + userId),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  // Salt is per-user (stable) — real entropy comes from the server secret.
  const salt = new TextEncoder().encode("digilaunchkit-byok-v2:" + userId);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

function b64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function unb64(s: string): ArrayBuffer {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

export async function encryptForUser(plaintext: string, userId: string): Promise<string> {
  if (!plaintext) return "";
  const key = await deriveServerKey(userId);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext),
  );
  return `encv2:${b64(iv.buffer)}:${b64(ct)}`;
}

export async function decryptForUser(stored: string, userId: string): Promise<string> {
  if (!stored) return "";
  // Legacy formats — stored under the old client-side key, cannot be
  // re-decrypted server-side. Return "" so callers fall back to env keys.
  if (!stored.startsWith("encv2:")) return "";
  const [, ivB64, ctB64] = stored.split(":");
  if (!ivB64 || !ctB64) return "";
  try {
    const key = await deriveServerKey(userId);
    const iv = new Uint8Array(unb64(ivB64));
    const pt = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      unb64(ctB64),
    );
    return new TextDecoder().decode(pt);
  } catch {
    return "";
  }
}
