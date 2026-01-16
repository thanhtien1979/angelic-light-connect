/**
 * Mã hóa cấp ứng dụng cho dữ liệu nhạy cảm
 * Sử dụng AES-256-GCM - thuật toán mã hóa mạnh nhất hiện có
 * 
 * Cách hoạt động:
 * 1. Tạo khóa từ userId + per-user salt (PBKDF2)
 * 2. Tạo IV (Initialization Vector) ngẫu nhiên cho mỗi lần mã hóa
 * 3. Mã hóa dữ liệu bằng AES-GCM
 * 4. Lưu cả encrypted data và IV vào database
 * 
 * Bảo mật: Mỗi user có salt riêng được lưu trong database,
 * ngăn chặn việc suy đoán key từ user ID
 */

// Fallback salt cho trường hợp chưa có per-user salt
// Chỉ dùng cho backward compatibility với data cũ
const FALLBACK_SALT = new Uint8Array([
  0x4c, 0x69, 0x67, 0x68, 0x74, 0x43, 0x6f, 0x6e,
  0x6e, 0x65, 0x63, 0x74, 0x32, 0x30, 0x32, 0x36
]).buffer as ArrayBuffer;

// Convert string salt to ArrayBuffer
function saltStringToArrayBuffer(saltString: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(saltString).buffer;
}

// Derive encryption key from user's unique identifier and salt
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

/**
 * Mã hóa dữ liệu nhạy cảm với per-user salt
 * @param data - Object chứa dữ liệu cần mã hóa
 * @param userId - ID người dùng (dùng làm key material)
 * @param userSalt - Salt riêng của user (từ profiles.encryption_salt)
 * @returns Object chứa encrypted data và IV (đã encode Base64)
 */
export async function encryptSensitiveData(
  data: unknown,
  userId: string,
  userSalt?: string | null
): Promise<{ encryptedData: string; iv: string }> {
  try {
    const encoder = new TextEncoder();
    const dataString = JSON.stringify(data);
    const dataBuffer = encoder.encode(dataString);

    // Tạo IV ngẫu nhiên (12 bytes cho AES-GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Sử dụng per-user salt nếu có, fallback nếu chưa có
    const salt = userSalt ? saltStringToArrayBuffer(userSalt) : FALLBACK_SALT;

    // Derive key từ userId và salt
    const key = await deriveKey(userId, salt);

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
 * @param userSalt - Salt riêng của user (từ profiles.encryption_salt)
 * @returns Object gốc đã giải mã
 */
export async function decryptSensitiveData<T = Record<string, unknown>>(
  encryptedData: string,
  iv: string,
  userId: string,
  userSalt?: string | null
): Promise<T> {
  try {
    const decoder = new TextDecoder();

    // Convert từ Base64
    const encryptedBuffer = base64ToArrayBuffer(encryptedData);
    const ivBuffer = new Uint8Array(base64ToArrayBuffer(iv));

    // Sử dụng per-user salt nếu có, fallback nếu chưa có
    const salt = userSalt ? saltStringToArrayBuffer(userSalt) : FALLBACK_SALT;

    // Derive key
    const key = await deriveKey(userId, salt);

    // Giải mã
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBuffer },
      key,
      encryptedBuffer
    );

    const dataString = decoder.decode(decryptedBuffer);
    return JSON.parse(dataString) as T;
  } catch (error) {
    // Nếu giải mã với user salt thất bại, thử lại với fallback salt
    // Điều này hỗ trợ backward compatibility với data mã hóa trước khi có per-user salt
    if (userSalt) {
      try {
        return await decryptSensitiveData<T>(encryptedData, iv, userId, null);
      } catch {
        // Cả hai đều thất bại
      }
    }
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
