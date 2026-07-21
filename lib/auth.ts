import { JWT_ALGORITHM, readJwtConfig, requireJwtConfig } from "./jwt-config";
import { validateJwtClaims } from "./jwt-claims";

// 仅在 Node.js 环境中导入 crypto
let crypto: typeof import("crypto");

if (typeof window === "undefined") {
  // 服务器端
  crypto = require("crypto");
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
  iss?: string;
  aud?: string;
  nbf?: number;
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

function isBase64UrlSegment(value: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(value) && value.length % 4 !== 1;
}

/**
 * 生成 JWT Token
 */
export function generateToken(payload: JWTPayload): string {
  const jwtConfig = requireJwtConfig();
  const header = { alg: JWT_ALGORITHM, typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 7 * 24 * 60 * 60; // 7天过期

  const fullPayload = {
    ...payload,
    iss: jwtConfig.issuer,
    aud: jwtConfig.audience,
    iat: now,
    exp,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  
  if (!crypto) {
    throw new Error("Crypto module not available");
  }
  
  const signature = crypto
    .createHmac("sha256", jwtConfig.secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * 验证 JWT Token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const jwtConfig = readJwtConfig();
    if (!jwtConfig) return null;

    const parts = token.split(".");
    if (parts.length !== 3 || parts.some((part) => !isBase64UrlSegment(part))) return null;
    const [header, payload, signature] = parts;

    if (!crypto) {
      throw new Error("Crypto module not available");
    }

    const decodedHeader = JSON.parse(base64UrlDecode(header)) as { alg?: unknown; typ?: unknown };
    if (decodedHeader.alg !== JWT_ALGORITHM || decodedHeader.typ !== "JWT") return null;

    // 验证签名
    const expectedSignature = crypto
      .createHmac("sha256", jwtConfig.secret)
      .update(`${header}.${payload}`)
      .digest();
    const providedSignature = Buffer.from(signature, "base64url");

    if (
      providedSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(providedSignature, expectedSignature)
    ) {
      return null;
    }

    // 解析 payload
    const decodedPayload = validateJwtClaims(JSON.parse(base64UrlDecode(payload)), jwtConfig);
    if (!decodedPayload) return null;

    return decodedPayload as unknown as JWTPayload;
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
 * 验证密码（支持 PBKDF2 和 bcrypt 两种格式）
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  // 如果是 bcrypt 格式（以 $2b$、$2a$ 开头）
  if (hashedPassword.startsWith('$2')) {
    // 使用 bcryptjs 验证
    const bcrypt = await import('bcryptjs');
    return bcrypt.compare(password, hashedPassword);
  }
  
  // 否则使用 PBKDF2 验证（旧的自定义格式 salt:hash）
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
