import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/students/[id]/profile
 * 获取学生心理画像数据
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 获取学生基本信息和心理画像
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        faculty: true,
        psychProfile: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: "学生不存在" },
        { status: 404 }
      );
    }

    // 格式化心理维度数据为雷达图格式
    const radarData = student.psychProfile
      ? [
          { dimension: "逆商", value: student.psychProfile.adversityQuotient },
          { dimension: "情绪稳定", value: student.psychProfile.emotionalStability },
          { dimension: "社交倾向", value: student.psychProfile.socialTendency },
          { dimension: "抗压能力", value: student.psychProfile.stressResistance },
          { dimension: "自我认知", value: student.psychProfile.selfAwareness },
          { dimension: "共情能力", value: student.psychProfile.empathy },
          { dimension: "意志力", value: student.psychProfile.willpower },
          { dimension: "适应性", value: student.psychProfile.adaptability },
        ]
      : [];

    return NextResponse.json({
      success: true,
      data: {
        student: {
          id: student.id,
          name: student.name,
          studentNo: student.studentNo,
          className: student.className,
          faculty: student.faculty?.name,
          gender: student.gender,
          birthDate: student.birthDate,
          mbti: student.mbti,
          riskLevel: student.riskLevel,
        },
        psychProfile: student.psychProfile
          ? {
              adversityQuotient: student.psychProfile.adversityQuotient,
              emotionalStability: student.psychProfile.emotionalStability,
              socialTendency: student.psychProfile.socialTendency,
              stressResistance: student.psychProfile.stressResistance,
              selfAwareness: student.psychProfile.selfAwareness,
              empathy: student.psychProfile.empathy,
              willpower: student.psychProfile.willpower,
              adaptability: student.psychProfile.adaptability,
              overallScore: student.psychProfile.overallScore,
              radarData,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("[API] Get student profile error:", error);
    return NextResponse.json(
      { success: false, message: "获取学生心理画像失败" },
      { status: 500 }
    );
  }
}
