/**
 * 系统状态 API
 * 
 * GET /api/settings/status
 * 返回真实系统状态：数据库、Redis、资源使用
 */

import { NextResponse } from "next/server";
import { getSystemStatus } from "@/app/actions/settings";

export async function GET() {
  try {
    const result = await getSystemStatus();
    
    if (result.success) {
      return NextResponse.json(result.data);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[API] /api/settings/status 错误:", error);
    return NextResponse.json(
      { error: "获取系统状态失败" },
      { status: 500 }
    );
  }
}
