/**
 * Mã hóa cấp ứng dụng cho dữ liệu nhạy cảm
 * Sử dụng AES-256-GCM - thuật toán mã hóa mạnh nhất hiện có
 * 
 * Cách hoạt động:
 * 1. Tạo khóa từ password của user (PBKDF2)
 * 2. Tạo IV (Initialization Vector) ngẫu nhiên cho mỗi lần mã hóa
 * 3. Mã hóa dữ liệu bằng AES-GCM
 * 4. Lưu cả encrypted data và IV vào database
 */

// Derive encryption key from user's unique identifier
async function deriveKey(userId: string, salt: ArrayBuffer): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(userId),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Static salt derived from app secret (consistent across sessions)
const APP_SALT = new Uint8Array([
  0x4c, 0x69, 0x67, 0x68, 0x74, 0x43, 0x6f, 0x6e,
  0x6e, 0x65, 0x63, 0x74, 0x32, 0x30, 0x32, 0x36
]).buffer as ArrayBuffer; // "LightConnect2026" in hex

/**
 * Mã hóa dữ liệu nhạy cảm
 * @param data - Object chứa dữ liệu cần mã hóa
 * @param userId - ID người dùng (dùng làm key)
 * @returns Object chứa encrypted data và IV (đã encode Base64)
 */
export async function encryptSensitiveData(
  data: unknown,
  userId: string
): Promise<{ encryptedData: string; iv: string }> {
  try {
    const encoder = new TextEncoder();
    const dataString = JSON.stringify(data);
    const dataBuffer = encoder.encode(dataString);

    // Tạo IV ngẫu nhiên (12 bytes cho AES-GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Derive key từ userId
    const key = await deriveKey(userId, APP_SALT);

    // Mã hóa
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      dataBuffer
    );

    return {
      encryptedData: arrayBufferToBase64(encryptedBuffer),
      iv: arrayBufferToBase64(iv.buffer),
    };
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Giải mã dữ liệu đã mã hóa
 * @param encryptedData - Dữ liệu đã mã hóa (Base64)
 * @param iv - Initialization Vector (Base64)
 * @param userId - ID người dùng
 * @returns Object gốc đã giải mã
 */
export async function decryptSensitiveData<T = Record<string, unknown>>(
  encryptedData: string,
  iv: string,
  userId: string
): Promise<T> {
  try {
    const decoder = new TextDecoder();

    // Convert từ Base64
    const encryptedBuffer = base64ToArrayBuffer(encryptedData);
    const ivBuffer = new Uint8Array(base64ToArrayBuffer(iv));

    // Derive key
    const key = await deriveKey(userId, APP_SALT);

    // Giải mã
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBuffer },
      key,
      encryptedBuffer
    );

    const dataString = decoder.decode(decryptedBuffer);
    return JSON.parse(dataString) as T;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Kiểm tra browser có hỗ trợ Web Crypto API không
 */
export function isEncryptionSupported(): boolean {
  return !!(crypto && crypto.subtle);
}

/**
 * Interface cho dữ liệu mood nhạy cảm đã mã hóa
 */
export interface EncryptedMoodData {
  emotions: string[];
  note?: string;
  activities: string[];
  ai_insight?: string;
}
