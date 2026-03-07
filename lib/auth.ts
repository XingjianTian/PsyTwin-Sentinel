// 仅在 Node.js 环境中导入 crypto
let crypto: typeof import("crypto");

if (typeof window === "undefined") {
  // 服务器端
  crypto = require("crypto");
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production-min-32-characters-long";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
  exp?: number;
  iat?: number;
}

/**
 * 简单的 JWT 实现（使用 crypto 模块，无需额外依赖）
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function base64UrlDecode(str: string): string {
  const padding = "=".repeat((4 - (str.length % 4)) % 4);
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/") + padding;
  return Buffer.from(base64, "base64").toString();
}

/**
 * 生成 JWT Token
 */
export function generateToken(payload: JWTPayload): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 7 * 24 * 60 * 60; // 7天过期

  const fullPayload = {
    ...payload,
    iat: now,
    exp,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  
  if (!crypto) {
    throw new Error("Crypto module not available");
  }
  
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * 验证 JWT Token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature) return null;

    if (!crypto) {
      throw new Error("Crypto module not available");
    }

    // 验证签名
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest("base64url");

    if (signature !== expectedSignature) return null;

    // 解析 payload
    const decodedPayload = JSON.parse(base64UrlDecode(payload)) as JWTPayload;

    // 检查过期时间
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decodedPayload;
  } catch {
    return null;
  }
}

/**
 * 密码哈希（使用 PBKDF2）
 */
export async function hashPassword(password: string): Promise<string> {
  if (!crypto) {
    throw new Error("Crypto module not available");
  }
  
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha256")
    .toString("hex");
  return `${salt}:${hash}`;
}

/**
 * 验证密码
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  if (!crypto) {
    throw new Error("Crypto module not available");
  }
  
  const [salt, hash] = hashedPassword.split(":");
  if (!salt || !hash) return false;

  const computedHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha256")
    .toString("hex");

  return hash === computedHash;
}

/**
 * 从请求头获取 Token
 */
export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}
