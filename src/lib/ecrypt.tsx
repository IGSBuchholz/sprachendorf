// ecrypt.tsx

/**
 * Utility to decrypt a URL-safe Base64-encoded AES-GCM token (as produced by the provided Python script)
 * back to the original email string, using Web Crypto API.
 *
 * Python encryption workflow (for reference):
 *   1. key = derive_key(uuid_salt)                // 16-byte AES key from UUID salt (hex, without dashes)
 *   2. nonce = os.urandom(12)                      // 12-byte nonce
 *   3. encryptor = Cipher(AES(key), GCM(nonce))    // AES-GCM
 *   4. ciphertext = encryptor.update(email_bytes) + encryptor.finalize()
 *   5. tag = encryptor.tag                         // 16-byte tag
 *   6. data = nonce || tag || ciphertext
 *   7. token = urlsafe_b64encode(data).decode("utf-8")
 *
 * To decrypt in JavaScript, we must:
 *   • Base64‐URL‐decode the token → ArrayBuffer
 *   • Split off nonce (first 12 bytes), tag (next 16 bytes), ciphertext (remaining bytes)
 *   • Re‐concatenate ciphertext || tag (because WebCrypto expects the tag at the end of the ciphertext)
 *   • Import the 16-byte key into CryptoKey (AES-GCM)
 *   • Call subtle.decrypt({ name: "AES-GCM", iv: nonce, tagLength: 128 }, key, ciphertextWithTag)
 *   • Decode the resulting ArrayBuffer into a UTF-8 string
 */

///////////////////////
// Helper functions //
///////////////////////

/**
 * Convert a hex string (without dashes) into a Uint8Array.
 * The Python derive_key function takes a UUID salt (with dashes), strips dashes,
 * then interprets it as hex. We mirror that here.
 */
function hexToBytes(hex: string): Uint8Array {
    if (hex.length % 2 !== 0) {
        throw new Error("Invalid hex string");
    }
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        const byte = parseInt(hex.substr(i, 2), 16);
        if (isNaN(byte)) {
            throw new Error("Invalid hex string");
        }
        bytes[i / 2] = byte;
    }
    return bytes;
}

/**
 * URL-safe Base64 decode:
 *   • Replace '-' with '+'
 *   • Replace '_' with '/'
 *   • Pad with '=' so length % 4 === 0
 */
function base64UrlDecode(input: string): Uint8Array {
    let b64 = input.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding:
    while (b64.length % 4 !== 0) {
        b64 += "=";
    }
    const binaryString = atob(b64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

/**
 * Derive a 16-byte AES key from the UUID salt (string with dashes).
 * This mirrors the Python derive_key:
 *   raw = uuid_salt.replace("-", "")
 *   return bytes.fromhex(raw)
 */
async function deriveKeyFromUuidSalt(uuidSalt: string): Promise<CryptoKey> {
    // Remove dashes, interpret as hex → 16 bytes
    const hex = uuidSalt.replace(/-/g, "");
    if (hex.length !== 32) {
        throw new Error(`Expected a UUID salt of 36 chars (32 hex + 4 dashes), got "${uuidSalt}"`);
    }
    const keyBytes = hexToBytes(hex); // 16 bytes

    // Import raw key material as CryptoKey for AES-GCM
    return await crypto.subtle.importKey(
        "raw",
        keyBytes,
        { name: "AES-GCM" },
        false,        // not extractable
        ["encrypt", "decrypt"] // usage
    );
}

/**
 * Concatenate two Uint8Array instances into one.
 */
function concatUint8Arrays(a: Uint8Array, b: Uint8Array): Uint8Array {
    const out = new Uint8Array(a.byteLength + b.byteLength);
    out.set(a, 0);
    out.set(b, a.byteLength);
    return out;
}

/////////////////////////
// Main decryption API //
/////////////////////////

/**
 * Decrypt a token (URL-safe Base64 string) back to the original email.
 *
 * @param token     The URL-safe Base64 output of Python's encrypt_email (nonce||tag||ciphertext).
 * @param uuidSalt  The same UUID salt string that was used on the Python side (e.g. "7f766be4-015c-4589-85dc-0d313061e571").
 * @returns         A Promise that resolves to the decrypted email (UTF-8 string).
 *
 * @example
 *   const token = "hG8XZ3..."; // as seen in the Python-generated URL
 *   const salt = "7f766be4-015c-4589-85dc-0d313061e571";
 *   decryptEmail(token, salt).then(email => console.log(email));
 */
export async function decryptEmail(token: string, uuidSalt: string): Promise<string> {
    // 1. Decode URL-safe Base64 → Uint8Array
    const data = base64UrlDecode(token);

    // 2. Split into nonce (12 bytes), tag (16 bytes), ciphertext (remaining)
    if (data.byteLength < 12 + 16) {
        throw new Error("Token too short: expected at least 28 bytes of decoded data.");
    }
    const nonce = data.subarray(0, 12);
    const tag   = data.subarray(12, 28);
    const ciphertext = data.subarray(28);

    // 3. Re-assemble ciphertextWithTag = ciphertext || tag
    const ciphertextWithTag = concatUint8Arrays(ciphertext, tag);

    // 4. Derive CryptoKey from uuidSalt
    const cryptoKey = await deriveKeyFromUuidSalt(uuidSalt);

    // 5. Decrypt using Web Crypto API
    let plaintextBuffer: ArrayBuffer;
    try {
        plaintextBuffer = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: nonce,
                tagLength: 128, // bits
            },
            cryptoKey,
            ciphertextWithTag
        );
    } catch (err) {
        throw new Error(`Decryption failed: ${err instanceof Error ? err.message : err}`);
    }

    // 6. Decode UTF-8 bytes → string
    const decoder = new TextDecoder();
    return decoder.decode(plaintextBuffer);
}

/**
 * Encrypt an email to a URL-safe Base64 AES-GCM token.
 *
 * @param email     The email string to encrypt.
 * @param uuidSalt  The UUID salt string, default from environment variable.
 * @returns         A Promise that resolves to the URL-safe Base64 token.
 *
 * @example
 *   const token = await encryptEmail("user@example.com");
 *   console.log("Encrypted token:", token);
 */
export async function encryptEmail(email: string, uuidSalt: string = process.env.UUID_SALT!): Promise<string> {
    // 1. Derive key from salt
    const cryptoKey = await deriveKeyFromUuidSalt(uuidSalt);

    // 2. Encode email to UTF-8
    const encoder = new TextEncoder();
    const data = encoder.encode(email);

    // 3. Generate random 12-byte nonce
    const nonce = crypto.getRandomValues(new Uint8Array(12));

    // 4. Encrypt to get ciphertext||tag
    const ciphertextWithTag = new Uint8Array(await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: nonce,
            tagLength: 128,
        },
        cryptoKey,
        data
    ));

    // 5. Split tag (last 16 bytes) and ciphertext (the rest)
    const tag = ciphertextWithTag.subarray(ciphertextWithTag.byteLength - 16);
    const ciphertext = ciphertextWithTag.subarray(0, ciphertextWithTag.byteLength - 16);

    // 6. Construct payload = nonce || tag || ciphertext
    const payload = new Uint8Array(nonce.byteLength + tag.byteLength + ciphertext.byteLength);
    payload.set(nonce, 0);
    payload.set(tag, nonce.byteLength);
    payload.set(ciphertext, nonce.byteLength + tag.byteLength);

    // 7. Base64-url-encode payload
    return bytesToBase64Url(payload);
}

/**
 * Convert a Uint8Array to URL-safe Base64 string.
 */
function bytesToBase64Url(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    let b64 = btoa(binary);
    // URL-safe replacements
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Example usage (uncomment to test):
 *
 * (async () => {
 *   const exampleToken = "INSERT_GENERATED_TOKEN_HERE";
 *   const salt = "7f766be4-015c-4589-85dc-0d313061e571";
 *   try {
 *     const email = await decryptEmail(exampleToken, salt);
 *     console.log("Decrypted email:", email);
 *   } catch (e) {
 *     console.error(e);
 *   }
 * })();
 */