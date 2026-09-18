import { maskNameSafe } from "./sanitization";

/** 承载真实人名的模型，只有这三个会被脱敏 */
const PERSON_MODELS = new Set(["Student", "Teacher", "User"]);

/**
 * 只有在人物对象内部才按人名处理的字段。
 * name 这个字段名被大量非人物模型复用（Faculty.name、Device.name…），
 * 若不限定作用域，会把「大数据学院」「小米手环 9」也一并打码。
 */
const PERSON_SCOPED_NAME_FIELDS = new Set(["name", "nickname", "realName"]);

/**
 * 无论宿主对象是不是人物记录，都按人名处理的字段。
 * WorkOrder / InterventionRecord 上的 counselor 直接存咨询师姓名，属于这一类。
 */
const ALWAYS_NAME_FIELDS = new Set(["counselor"]);

/** 判断某个字段是否应按人名处理 */
function isNameField(key: string, isPerson: boolean): boolean {
  return ALWAYS_NAME_FIELDS.has(key) || (isPerson && PERSON_SCOPED_NAME_FIELDS.has(key));
}

/**
 * 指向人物记录的关联字段名 —— 命中即按人物对象处理。
 * 这一步解决 `include: { student: { select: { name: true } } }` 这类
 * 关联里只取 name、没有其它特征字段时无法识别的问题。
 */
const PERSON_RELATION_KEYS = new Set([
  "student",
  "students",
  "teacher",
  "teachers",
  "user",
  "users",
  "author",
  "counselor",
  "reviewer",
  "guardian",
  "parent",
  "studentUser",
  "teacherUser",
  "operator",
  "creator",
  "assignee",
]);

/**
 * 人物记录的特征字段，作为关联字段名未命中时的兜底。
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

function isPersonObject(value: Record<string, unknown>, forcePerson: boolean): boolean {
  return forcePerson || looksLikePersonRecord(value);
}

/**
 * 第一遍：收集子树中所有人物记录的原始姓名。
 * 用于后续在文本字段里做精确替换 —— AI 风险报告正文常内嵌学生姓名。
 */
function collectPersonNames(
  value: unknown,
  out: Set<string>,
  forcePerson: boolean,
  depth = 0
): void {
  if (depth > 12 || value === null || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) collectPersonNames(item, out, forcePerson, depth + 1);
    return;
  }
  if (!isPlainObject(value)) return;

  const isPerson = isPersonObject(value, forcePerson);
  for (const key of Object.keys(value)) {
    const item = value[key];
    if (isNameField(key, isPerson) && typeof item === "string" && item) {
      out.add(item);
    } else {
      collectPersonNames(item, out, PERSON_RELATION_KEYS.has(key), depth + 1);
    }
  }
}

/** 构建一次性匹配所有人名的正则；长名优先，避免短名先匹配掉子串 */
function buildNamePattern(names: Set<string>): RegExp | null {
  const parts = [...names]
    .filter((name) => name.length >= 2)
    .sort((a, b) => b.length - a.length)
    .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  return parts.length > 0 ? new RegExp(parts.join("|"), "g") : null;
}

/** 把文本里出现的已知人名替换为脱敏形式；只替换完整姓名，误伤面极小 */
function maskNamesInText(text: string, pattern: RegExp | null): string {
  if (!pattern || !text) return text;
  return text.replace(pattern, (matched) => maskNameSafe(matched));
}

/** 第二遍：对人物记录的姓名字段打码，并对文本字段做人名替换 */
function maskValue(
  value: unknown,
  forcePerson: boolean,
  pattern: RegExp | null,
  depth = 0
): unknown {
  if (depth > 12 || value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    return value.map((item) => maskValue(item, forcePerson, pattern, depth + 1));
  }
  if (!isPlainObject(value)) return value;

  const isPerson = isPersonObject(value, forcePerson);
  const masked: Record<string, unknown> = {};
  for (const key of Object.keys(value)) {
    const item = value[key];
    if (isNameField(key, isPerson) && typeof item === "string" && item) {
      masked[key] = maskNameSafe(item);
    } else if (typeof item === "string" && item) {
      masked[key] = maskNamesInText(item, pattern);
    } else {
      masked[key] = maskValue(item, PERSON_RELATION_KEYS.has(key), pattern, depth + 1);
    }
  }
  return masked;
}

/** 深度脱敏：先收集人名，再打码 + 文本替换 */
export function maskRecord(value: unknown, forcePerson: boolean): unknown {
  const names = new Set<string>();
  collectPersonNames(value, names, forcePerson);
  return maskValue(value, forcePerson, buildNamePattern(names));
}

/** 顶层结果可能是单条记录，也可能是记录数组 */
export function maskQueryResult(result: unknown, model: string): unknown {
  const forcePerson = PERSON_MODELS.has(model);
  if (Array.isArray(result)) return result.map((item) => maskRecord(item, forcePerson));
  return maskRecord(result, forcePerson);
}
