import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 公开路由（不需要认证）
const publicRoutes = [
  "/login",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
];

// 检查是否是公开路由
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname.startsWith(route));
}

// 简单的 JWT 验证（不依赖 crypto 模块，适用于 Edge Runtime）
function verifyTokenSimple(token: string): { userId: string; role: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    
    // 检查过期时间
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return {
      userId: payload.userId,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 公开路由直接放行
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // API 路由认证检查
  if (pathname.startsWith("/api/")) {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "未登录，请先登录" },
        { status: 401 }
      );
    }

    const payload = verifyTokenSimple(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "登录已过期，请重新登录" },
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

  const payload = verifyTokenSimple(token);
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
