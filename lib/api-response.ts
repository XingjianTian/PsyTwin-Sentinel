/**
 * PsyTwin Pocket API 响应格式化工具
 * 
 * 统一响应格式: { code: 0, message: "...", data: ... }
 * code: 0 表示成功，非 0 表示失败
 */

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

/**
 * 成功响应
 */
export function successResponse<T>(data: T, message = "操作成功"): ApiResponse<T> {
  return {
    code: 0,
    message,
    data,
  }
}

/**
 * 错误响应
 */
export function errorResponse(message: string, code = 1, data: any = null): ApiResponse {
  return {
    code,
    message,
    data,
  }
}

/**
 * 常见错误码
 */
export const ErrorCodes = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const

/**
 * 验证错误响应
 */
export function validationError(message: string, data?: any): ApiResponse {
  return errorResponse(message, ErrorCodes.VALIDATION_ERROR, data)
}

/**
 * 未授权响应
 */
export function unauthorizedError(message = "未授权访问"): ApiResponse {
  return errorResponse(message, ErrorCodes.UNAUTHORIZED)
}

/**
 * 未找到响应
 */
export function notFoundError(message = "资源不存在"): ApiResponse {
  return errorResponse(message, ErrorCodes.NOT_FOUND)
}

/**
 * 服务器错误响应
 */
export function internalError(message = "服务器内部错误"): ApiResponse {
  return errorResponse(message, ErrorCodes.INTERNAL_ERROR)
}
