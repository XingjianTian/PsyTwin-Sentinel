import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifyMiddlewareJwt } from "./lib/edge-jwt";

// 公开路由（不需要认证）
const publicRoutes = [
  "/login",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/pocket",
  "/api/openclaw",
  "/api/multimodal/sensors/stream",
];

// 检查是否是公开路由
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 公开路由直接放行
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // API 路由认证检查
  if (pathname.startsWith("/api/")) {
    // 首先尝试从 Header 获取 token
    const authHeader = request.headers.get("authorization");
    let token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    // 如果没有 Header，尝试从 Cookie 获取
    if (!token) {
      token = request.cookies.get("token")?.value || null;
    }

    if (!token) {
      return NextResponse.json(
        { code: 401, message: "未登录，请先登录", data: null },
        { status: 401 }
      );
    }

    const payload = await verifyMiddlewareJwt(token);
    if (!payload) {
      return NextResponse.json(
        { code: 401, message: "登录已过期，请重新登录", data: null },
        { status: 401 }
      );
    }

    // 将用户信息添加到请求头
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-user-role", payload.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 页面路由认证检查
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await verifyMiddlewareJwt(token);
  if (!payload) {
    // Token 无效，清除 cookie 并重定向到登录页
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // 匹配所有路由，除了静态资源
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
