/**
 * DEPRECATED: BYOK encryption now happens server-side via the
 * `manage-byok-key` edge function, which uses a server-only secret
 * (BYOK_ENCRYPTION_KEY). These stubs remain for backward-compatibility
 * with any lingering imports and MUST NOT be used for new code.
 */

export async function encryptApiKey(_plaintext: string, _userId: string): Promise<string> {
  throw new Error("Client-side BYOK encryption removed. Use the manage-byok-key edge function.");
}

export async function decryptApiKey(_stored: string, _userId: string): Promise<string> {
  throw new Error("Client-side BYOK decryption removed. Use the manage-byok-key edge function.");
}
