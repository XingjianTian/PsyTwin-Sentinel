import { maskNameSafe } from "./sanitization";

/** 承载真实人名的模型，只有这三个会被脱敏 */
const PERSON_MODELS = new Set(["Student", "Teacher", "User"]);

/** 这些字段名存放的是人名 */
const PERSON_NAME_FIELDS = new Set(["name", "nickname", "realName"]);

/**
 * 人物记录的特征字段，用于识别嵌套在其它查询结果里的人名对象。
 * 注意：不要把 riskLevel / stressIndex 加进来 —— Faculty 同样拥有这两个字段，
 * 加入后会把「医学院」这类学院名误当成人名处理。
 */
const PERSON_MARKERS = ["studentNo", "teacherId", "className", "mbti", "openid"];

/** 只递归普通对象；Date / Decimal / Buffer 等实例原样保留，避免破坏字段类型 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function looksLikePersonRecord(value: Record<string, unknown>): boolean {
  return PERSON_MARKERS.some((marker) => marker in value);
}

/**
 * 深度遍历查询结果，对人物记录的姓名字段做脱敏
 * forcePerson = true 表示顶层查询的就是人物模型，无条件脱敏
 */
export function maskRecord(value: unknown, forcePerson: boolean, depth = 0): unknown {
  if (depth > 12 || value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((item) => maskRecord(item, false, depth + 1));
  if (!isPlainObject(value)) return value;

  const isPerson = forcePerson || looksLikePersonRecord(value);
  const masked: Record<string, unknown> = {};
  for (const key of Object.keys(value)) {
    const item = value[key];
    if (isPerson && PERSON_NAME_FIELDS.has(key) && typeof item === "string" && item) {
      masked[key] = maskNameSafe(item);
    } else {
      masked[key] = maskRecord(item, false, depth + 1);
    }
  }
  return masked;
}

/** 顶层结果可能是单条记录，也可能是记录数组 */
export function maskQueryResult(result: unknown, model: string): unknown {
  const forcePerson = PERSON_MODELS.has(model);
  if (Array.isArray(result)) return result.map((item) => maskRecord(item, forcePerson));
  return maskRecord(result, forcePerson);
}
