import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // JWT 是无状态的，登出只需要客户端删除 token
    // 这里可以记录登出日志或加入黑名单（如果需要）
    
    return NextResponse.json({
      success: true,
      message: "登出成功",
    });
  } catch (error) {
    console.error("登出错误:", error);
    return NextResponse.json(
      { success: false, message: "登出失败" },
      { status: 500 }
    );
  }
}
