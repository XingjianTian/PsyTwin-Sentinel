import { hashPassword } from "../lib/auth"
import {
  AlertType,
  DeviceStatus,
  DeviceType,
  DocStatus,
  InterventionType,
  PrismaClient,
  RiskLevel,
  RoomStatus,
  Sentiment,
  WorkOrderStatus,
} from '@prisma/client'

const prisma = new PrismaClient()

// 通知内容生成辅助函数
function generateNotificationTitle(type: string): string {
  const titles: Record<string, string[]> = {
    SYSTEM: ['系统公告', '维护通知', '新功能上线', '隐私政策更新'],
    APPOINTMENT: ['预约确认', '预约提醒', '咨询时间变更', '预约取消'],
    CHAT: ['新消息', '咨询师回复', 'AI助手消息'],
    WARNING: ['预警提醒', '风险评估', '关注建议'],
    POST: ['帖子被点赞', '收到评论', '新关注者'],
    COMMENT: ['评论回复', '评论被点赞'],
  }
  const typeTitles = titles[type] || ['新通知']
  return typeTitles[Math.floor(Math.random() * typeTitles.length)]
}

function generateNotificationContent(type: string): string {
  const contents: Record<string, string[]> = {
    SYSTEM: ['系统将于今晚22:00-23:00进行例行维护', '心图小程序新版本已上线，快来体验吧', '我们更新了隐私政策，请查看'],
    APPOINTMENT: ['您的咨询预约已确认，请准时到场', '您的咨询将在30分钟后开始', '咨询师调整了您的预约时间'],
    CHAT: ['您有一条未读消息', '咨询师回复了您的问题', 'AI助手为您生成了一份情绪报告'],
    WARNING: ['系统检测到您的情绪有波动，建议关注', '您的心理健康评分需要关注', '建议进行一次心理咨询'],
    POST: ['有人赞了您的帖子', '有人评论了您的帖子', '您有5个新关注者'],
    COMMENT: ['有人回复了您的评论', '您的评论获得了10个赞'],
  }
  const typeContents = contents[type] || ['您有一条新通知']
  return typeContents[Math.floor(Math.random() * typeContents.length)]
}

async function main() {
  const now = new Date()
  
  // 清理旧数据（保持幂等性）
  console.log('Cleaning up old data...')
  await prisma.roomDevice.deleteMany({})
  await prisma.device.deleteMany({})
  await prisma.consultationRoom.deleteMany({})
  console.log('Old data cleaned.')

  const faculties = [
    { id: 'fac-info', name: '信息工程学院', riskLevel: RiskLevel.MEDIUM, stressIndex: 53 },
    { id: 'fac-soft', name: '软件学院', riskLevel: RiskLevel.LOW, stressIndex: 41 },
    { id: 'fac-dm', name: '数字媒体学院', riskLevel: RiskLevel.MEDIUM, stressIndex: 49 },
    { id: 'fac-cyber', name: '网络空间安全学院', riskLevel: RiskLevel.HIGH, stressIndex: 62 },
    { id: 'fac-vr', name: '虚拟现实学院', riskLevel: RiskLevel.LOW, stressIndex: 38 },
    { id: 'fac-data', name: '大数据学院', riskLevel: RiskLevel.MEDIUM, stressIndex: 55 },
  ]

  for (const f of faculties) {
    await prisma.faculty.upsert({
      where: { id: f.id },
      update: {
        name: f.name,
        riskLevel: f.riskLevel,
        stressIndex: f.stressIndex,
      },
      create: {
        id: f.id,
        name: f.name,
        riskLevel: f.riskLevel,
        stressIndex: f.stressIndex,
        campusX: Math.random() * 100,
        campusY: Math.random() * 100,
      },
    })
  }

  await prisma.user.upsert({
    where: { email: 'admin@psytwin.com' },
    update: {},
    create: {
      email: 'admin@psytwin.com',
      name: '管理员',
      passwordHash: await hashPassword('admin123'),
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  // 20个学生数据
  const students = [
    { id: 'stu-zhangyu', name: '张宇', studentNo: '2025030218', className: '大数据2502', facultyId: 'fac-data', riskLevel: RiskLevel.LOW, mbti: 'INTJ' },
    { id: 'stu-liusiyuan', name: '刘思远', studentNo: '2024005', className: '数媒2401', facultyId: 'fac-dm', riskLevel: RiskLevel.MEDIUM, mbti: 'INFJ' },
    { id: 'stu-chenyuqing', name: '陈雨晴', studentNo: '2024006', className: '软件2402', facultyId: 'fac-soft', riskLevel: RiskLevel.HIGH, mbti: 'ISFJ' },
    { id: 'stu-zhangmingyuan', name: '张明远', studentNo: '2024001', className: '网络2401', facultyId: 'fac-cyber', riskLevel: RiskLevel.HIGH, mbti: 'INTP' },
    { id: 'stu-wuzhiyuan', name: '吴志远', studentNo: '2024011', className: '大数据2502', facultyId: 'fac-data', riskLevel: RiskLevel.HIGH, mbti: 'ISTJ' },
    { id: 'stu-zhouhangyu', name: '周航宇', studentNo: '2024012', className: '虚拟2503', facultyId: 'fac-vr', riskLevel: RiskLevel.MEDIUM, mbti: 'ENTP' },
    { id: 'stu-zhaotianyu', name: '赵天宇', studentNo: '2024004', className: '信安2401', facultyId: 'fac-cyber', riskLevel: RiskLevel.HIGH, mbti: 'INFP' },
    { id: 'stu-huangsimeng', name: '黄思萌', studentNo: '2024013', className: '软件2402', facultyId: 'fac-soft', riskLevel: RiskLevel.MEDIUM, mbti: 'ESFJ' },
    { id: 'stu-linzhihao', name: '林志豪', studentNo: '2024014', className: '大数据2502', facultyId: 'fac-data', riskLevel: RiskLevel.LOW, mbti: 'ESTP' },
    { id: 'stu-wangyuyan', name: '王语嫣', studentNo: '2024016', className: '网络2401', facultyId: 'fac-cyber', riskLevel: RiskLevel.MEDIUM, mbti: 'ENFJ' },
    { id: 'stu-liweimin', name: '李伟民', studentNo: '2024017', className: '软件2401', facultyId: 'fac-soft', riskLevel: RiskLevel.MEDIUM, mbti: 'ISTJ' },
    { id: 'stu-sunxiaoxiao', name: '孙晓晓', studentNo: '2024018', className: '数媒2402', facultyId: 'fac-dm', riskLevel: RiskLevel.HIGH, mbti: 'INFP' },
    { id: 'stu-zhoujian', name: '周健', studentNo: '2024019', className: '网络2402', facultyId: 'fac-cyber', riskLevel: RiskLevel.LOW, mbti: 'ESTJ' },
    { id: 'stu-wuting', name: '吴婷', studentNo: '2024020', className: '大数据2501', facultyId: 'fac-data', riskLevel: RiskLevel.MEDIUM, mbti: 'ENFP' },
    { id: 'stu-zhengkai', name: '郑凯', studentNo: '2024021', className: '虚拟2501', facultyId: 'fac-vr', riskLevel: RiskLevel.HIGH, mbti: 'INTJ' },
    { id: 'stu-wangfang', name: '王芳', studentNo: '2024022', className: '信安2402', facultyId: 'fac-cyber', riskLevel: RiskLevel.MEDIUM, mbti: 'ISFP' },
    { id: 'stu-fengtao', name: '冯涛', studentNo: '2024023', className: '软件2403', facultyId: 'fac-soft', riskLevel: RiskLevel.LOW, mbti: 'ENTP' },
    { id: 'stu-chenjing', name: '陈静', studentNo: '2024024', className: '信息2401', facultyId: 'fac-info', riskLevel: RiskLevel.HIGH, mbti: 'INFJ' },
    { id: 'stu-yangbo', name: '杨波', studentNo: '2024025', className: '数媒2403', facultyId: 'fac-dm', riskLevel: RiskLevel.MEDIUM, mbti: 'ESTP' },
    { id: 'stu-xiaoli', name: '萧丽', studentNo: '2024026', className: '虚拟2502', facultyId: 'fac-vr', riskLevel: RiskLevel.LOW, mbti: 'ESFJ' },
  ]

  for (const s of students) {
    await prisma.student.upsert({
      where: { id: s.id },
      update: {
        name: s.name,
        studentNo: s.studentNo,
        className: s.className,
        facultyId: s.facultyId,
        riskLevel: s.riskLevel,
        mbti: s.mbti,
      },
      create: {
        id: s.id,
        name: s.name,
        studentNo: s.studentNo,
        className: s.className,
        facultyId: s.facultyId,
        gender: ['男', '女'][Math.floor(Math.random() * 2)],
        birthDate: new Date(`2006-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}T00:00:00.000Z`),
        mbti: s.mbti,
        riskLevel: s.riskLevel,
      },
    })
  }

  // 20个学生的干预记录（每个学生至少1条，部分为进展中状态）
  const interventionRecords = [
    { id: 'ir-01', studentId: 'stu-zhangyu', date: '2026-02-15', type: InterventionType.REGULAR_INTERVIEW, counselor: '刘芳', duration: '50分钟', result: '状态良好', status: 'completed' },
    { id: 'ir-02', studentId: 'stu-zhangmingyuan', date: '2026-01-20', type: InterventionType.CBT_THERAPY, counselor: '张伟', duration: '60分钟', result: '认知重构进展顺利', status: 'completed' },
    { id: 'ir-03', studentId: 'stu-liusiyuan', date: '2025-12-28', type: InterventionType.GROUP_COUNSELING, counselor: '王丽', duration: '90分钟', result: '社交互动改善', status: 'completed' },
    { id: 'ir-04', studentId: 'stu-zhaotianyu', date: '2025-12-15', type: InterventionType.CRISIS_INTERVENTION, counselor: '刘芳', duration: '45分钟', result: '情绪稳定', status: 'completed' },
    { id: 'ir-05', studentId: 'stu-chenyuqing', date: '2025-11-22', type: InterventionType.INITIAL_ASSESSMENT, counselor: '刘芳', duration: '60分钟', result: '建立干预方案', status: 'completed' },
    { id: 'ir-06', studentId: 'stu-wuzhiyuan', date: '2026-01-10', type: InterventionType.CBT_THERAPY, counselor: '张伟', duration: '55分钟', result: '社交焦虑减轻', status: 'completed' },
    { id: 'ir-07', studentId: 'stu-zhouhangyu', date: '2025-11-05', type: InterventionType.REGULAR_INTERVIEW, counselor: '王丽', duration: '45分钟', result: '心理状态良好', status: 'completed' },
    { id: 'ir-08', studentId: 'stu-huangsimeng', date: '2026-01-15', type: InterventionType.REGULAR_INTERVIEW, counselor: '刘芳', duration: '50分钟', result: '压力缓解', status: 'completed' },
    { id: 'ir-09', studentId: 'stu-linzhihao', date: '2025-12-01', type: InterventionType.GROUP_COUNSELING, counselor: '张伟', duration: '85分钟', result: '团队协作能力提升', status: 'completed' },
    { id: 'ir-10', studentId: 'stu-wangyuyan', date: '2025-11-20', type: InterventionType.CBT_THERAPY, counselor: '王丽', duration: '60分钟', result: '自信心增强', status: 'completed' },
    { id: 'ir-11', studentId: 'stu-liweimin', date: '2026-01-25', type: InterventionType.REGULAR_INTERVIEW, counselor: '刘芳', duration: '50分钟', result: '学业规划清晰', status: 'completed' },
    { id: 'ir-12', studentId: 'stu-sunxiaoxiao', date: '2025-12-20', type: InterventionType.INITIAL_ASSESSMENT, counselor: '张伟', duration: '65分钟', result: '建立长期干预计划', status: 'completed' },
    { id: 'ir-13', studentId: 'stu-zhoujian', date: '2025-11-15', type: InterventionType.REGULAR_INTERVIEW, counselor: '王丽', duration: '45分钟', result: '适应良好', status: 'completed' },
    { id: 'ir-14', studentId: 'stu-wuting', date: '2026-01-08', type: InterventionType.GROUP_COUNSELING, counselor: '刘芳', duration: '90分钟', result: '人际交往改善', status: 'completed' },
    { id: 'ir-15', studentId: 'stu-zhengkai', date: '2025-12-10', type: InterventionType.CBT_THERAPY, counselor: '张伟', duration: '60分钟', result: '思维模式调整中', status: 'completed' },
    { id: 'ir-16', studentId: 'stu-wangfang', date: '2026-01-18', type: InterventionType.REGULAR_INTERVIEW, counselor: '王丽', duration: '50分钟', result: '情绪管理提升', status: 'completed' },
    { id: 'ir-17', studentId: 'stu-fengtao', date: '2025-11-25', type: InterventionType.REGULAR_INTERVIEW, counselor: '刘芳', duration: '45分钟', result: '状态稳定', status: 'completed' },
    { id: 'ir-18', studentId: 'stu-chenjing', date: '2025-12-28', type: InterventionType.INITIAL_ASSESSMENT, counselor: '张伟', duration: '70分钟', result: '制定干预方案', status: 'completed' },
    { id: 'ir-19', studentId: 'stu-yangbo', date: '2026-01-12', type: InterventionType.GROUP_COUNSELING, counselor: '王丽', duration: '85分钟', result: '团队融入良好', status: 'completed' },
    { id: 'ir-20', studentId: 'stu-xiaoli', date: '2025-12-05', type: InterventionType.REGULAR_INTERVIEW, counselor: '刘芳', duration: '50分钟', result: '心理状态健康', status: 'completed' },
  ]

  for (const r of interventionRecords) {
    await prisma.interventionRecord.upsert({
      where: { id: r.id },
      update: {
        studentId: r.studentId,
        date: new Date(`${r.date}T00:00:00.000Z`),
        type: r.type,
        counselor: r.counselor,
        duration: r.duration,
        result: r.result,
        status: r.status,
      },
      create: {
        ...r,
        date: new Date(`${r.date}T00:00:00.000Z`),
      },
    })
  }

  // 为所有20个学生创建心理画像数据
  const psychProfiles = [
    { studentId: 'stu-zhangyu', adversityQuotient: 82, emotionalStability: 75, socialTendency: 68, stressResistance: 85, selfAwareness: 78, empathy: 72, willpower: 80, adaptability: 76, overallScore: 77 },
    { studentId: 'stu-liusiyuan', adversityQuotient: 68, emotionalStability: 62, socialTendency: 75, stressResistance: 70, selfAwareness: 72, empathy: 85, willpower: 65, adaptability: 78, overallScore: 72 },
    { studentId: 'stu-chenyuqing', adversityQuotient: 55, emotionalStability: 48, socialTendency: 58, stressResistance: 52, selfAwareness: 60, empathy: 65, willpower: 50, adaptability: 55, overallScore: 55 },
    { studentId: 'stu-zhangmingyuan', adversityQuotient: 72, emotionalStability: 68, socialTendency: 82, stressResistance: 75, selfAwareness: 70, empathy: 78, willpower: 73, adaptability: 80, overallScore: 75 },
    { studentId: 'stu-wuzhiyuan', adversityQuotient: 48, emotionalStability: 45, socialTendency: 52, stressResistance: 50, selfAwareness: 55, empathy: 58, willpower: 48, adaptability: 52, overallScore: 51 },
    { studentId: 'stu-zhouhangyu', adversityQuotient: 78, emotionalStability: 72, socialTendency: 85, stressResistance: 80, selfAwareness: 75, empathy: 80, willpower: 78, adaptability: 82, overallScore: 79 },
    { studentId: 'stu-zhaotianyu', adversityQuotient: 52, emotionalStability: 50, socialTendency: 55, stressResistance: 48, selfAwareness: 58, empathy: 62, willpower: 50, adaptability: 54, overallScore: 54 },
    { studentId: 'stu-huangsimeng', adversityQuotient: 70, emotionalStability: 75, socialTendency: 72, stressResistance: 68, selfAwareness: 74, empathy: 80, willpower: 72, adaptability: 76, overallScore: 73 },
    { studentId: 'stu-linzhihao', adversityQuotient: 85, emotionalStability: 82, socialTendency: 78, stressResistance: 88, selfAwareness: 85, empathy: 75, willpower: 86, adaptability: 84, overallScore: 83 },
    { studentId: 'stu-wangyuyan', adversityQuotient: 65, emotionalStability: 68, socialTendency: 62, stressResistance: 70, selfAwareness: 72, empathy: 78, willpower: 66, adaptability: 70, overallScore: 69 },
    { studentId: 'stu-liweimin', adversityQuotient: 70, emotionalStability: 65, socialTendency: 68, stressResistance: 72, selfAwareness: 70, empathy: 68, willpower: 72, adaptability: 70, overallScore: 70 },
    { studentId: 'stu-sunxiaoxiao', adversityQuotient: 50, emotionalStability: 45, socialTendency: 55, stressResistance: 48, selfAwareness: 52, empathy: 60, willpower: 48, adaptability: 52, overallScore: 51 },
    { studentId: 'stu-zhoujian', adversityQuotient: 80, emotionalStability: 78, socialTendency: 75, stressResistance: 82, selfAwareness: 80, empathy: 72, willpower: 82, adaptability: 80, overallScore: 79 },
    { studentId: 'stu-wuting', adversityQuotient: 72, emotionalStability: 70, socialTendency: 78, stressResistance: 75, selfAwareness: 74, empathy: 76, willpower: 72, adaptability: 76, overallScore: 74 },
    { studentId: 'stu-zhengkai', adversityQuotient: 58, emotionalStability: 52, socialTendency: 62, stressResistance: 55, selfAwareness: 60, empathy: 62, willpower: 55, adaptability: 58, overallScore: 58 },
    { studentId: 'stu-wangfang', adversityQuotient: 68, emotionalStability: 70, socialTendency: 65, stressResistance: 68, selfAwareness: 70, empathy: 74, willpower: 68, adaptability: 70, overallScore: 69 },
    { studentId: 'stu-fengtao', adversityQuotient: 82, emotionalStability: 78, socialTendency: 85, stressResistance: 80, selfAwareness: 78, empathy: 76, willpower: 80, adaptability: 82, overallScore: 80 },
    { studentId: 'stu-chenjing', adversityQuotient: 52, emotionalStability: 48, socialTendency: 58, stressResistance: 50, selfAwareness: 55, empathy: 62, willpower: 52, adaptability: 54, overallScore: 54 },
    { studentId: 'stu-yangbo', adversityQuotient: 75, emotionalStability: 72, socialTendency: 80, stressResistance: 78, selfAwareness: 76, empathy: 70, willpower: 76, adaptability: 78, overallScore: 76 },
    { studentId: 'stu-xiaoli', adversityQuotient: 78, emotionalStability: 80, socialTendency: 82, stressResistance: 80, selfAwareness: 82, empathy: 85, willpower: 80, adaptability: 82, overallScore: 81 },
  ]

  for (const pp of psychProfiles) {
    await prisma.psychProfile.upsert({
      where: { studentId: pp.studentId },
      update: pp,
      create: {
        id: `pp-${pp.studentId}`,
        ...pp,
      },
    })
  }

  // 为所有20个学生创建完整的时间线事件（每人4-5条）
  const timelineEvents = [
    // ========== 张宇（5条）==========
    { studentId: 'stu-zhangyu', date: '2025年9月', title: '入学普测完成', description: 'SCL-90/SDS/SAS三量表联合筛查，各项指标正常，综合评分82分，心理状态良好', status: 'success' },
    { studentId: 'stu-zhangyu', date: '2025年10月', title: 'VR脱敏训练（第一期）', description: '参加社交焦虑VR脱敏训练课程，完成6次训练，焦虑指数从65下降至43，效果显著', status: 'success' },
    { studentId: 'stu-zhangyu', date: '2025年11月', title: '心理委员培训', description: '参加班级心理委员培训，学习心理健康知识和危机识别技能，考核优秀', status: 'success' },
    { studentId: 'stu-zhangyu', date: '2026年1月', title: '期末心理复查', description: '期末心理健康复查，各项指标持续向好，情绪稳定性提升18%，继续保持', status: 'success' },
    { studentId: 'stu-zhangyu', date: '2026年2月', title: '新学期心理健康跟踪', description: '新学期心理状态评估良好，作为心理委员协助辅导员开展班级心理健康活动', status: 'active' },
    
    // ========== 刘思远（5条）==========
    { studentId: 'stu-liusiyuan', date: '2025年9月', title: '入学普测完成', description: 'SCL-90测评显示轻度焦虑倾向，焦虑因子得分58，建议关注并定期评估', status: 'warning' },
    { studentId: 'stu-liusiyuan', date: '2025年10月', title: 'VR正念冥想训练', description: '开始VR正念冥想放松训练，每周2次，睡眠质量从入睡困难改善为正常', status: 'success' },
    { studentId: 'stu-liusiyuan', date: '2025年11月', title: '定期咨询面谈', description: '与心理咨询师建立信任关系，情绪管理能力显著提升，焦虑评分降至42', status: 'success' },
    { studentId: 'stu-liusiyuan', date: '2025年12月', title: '焦虑症状改善', description: '期末评估显示焦虑症状明显改善，社交活动参与度提高，宿舍关系融洽', status: 'success' },
    { studentId: 'stu-liusiyuan', date: '2026年2月', title: '持续跟踪评估', description: '新学期心理状态稳定，焦虑症状基本消除，建议继续保持正念练习习惯', status: 'active' },
    
    // ========== 陈雨晴（5条）==========
    { studentId: 'stu-chenyuqing', date: '2025年9月', title: '入学普测预警', description: '测评显示抑郁高风险，SDS得分68，PHQ-9得分15，触发一级预警机制', status: 'warning' },
    { studentId: 'stu-chenyuqing', date: '2025年10月', title: '预警响应与转介', description: '辅导员约谈并转介至心理咨询中心，建立危机档案，制定干预计划', status: 'warning' },
    { studentId: 'stu-chenyuqing', date: '2025年11月', title: '初次心理评估', description: '专业心理评估完成，诊断为轻度抑郁，建立干预方案，开始CBT认知行为疗法', status: 'success' },
    { studentId: 'stu-chenyuqing', date: '2025年12月', title: 'CBT疗法进展', description: '认知重构进展顺利，抑郁症状明显减轻，SDS得分降至52，情绪趋于稳定', status: 'success' },
    { studentId: 'stu-chenyuqing', date: '2026年2月', title: '持续治疗与康复', description: '抑郁风险评估降级至中风险，继续CBT治疗，建议配合运动和社交活动', status: 'active' },
    
    // ========== 张明远（5条）==========
    { studentId: 'stu-zhangmingyuan', date: '2025年9月', title: '入学普测完成', description: '各项指标正常，心理素质良好，综合评分75分，适应能力强', status: 'success' },
    { studentId: 'stu-zhangmingyuan', date: '2025年10月', title: '参与心理讲座', description: '参加大学生心理健康教育讲座，学习压力管理和情绪调节技巧', status: 'success' },
    { studentId: 'stu-zhangmingyuan', date: '2025年11月', title: '团体辅导体验', description: '参加人际沟通团体辅导活动，社交能力提升，结识新朋友', status: 'success' },
    { studentId: 'stu-zhangmingyuan', date: '2025年12月', title: '心理志愿者活动', description: '参与心理健康宣传志愿者活动，协助发放心理健康手册，表现积极', status: 'success' },
    { studentId: 'stu-zhangmingyuan', date: '2026年2月', title: '新学期目标设定', description: '制定新学期心理健康目标，计划参加更多心理成长活动，保持积极心态', status: 'active' },
    
    // ========== 吴志远（5条）==========
    { studentId: 'stu-wuzhiyuan', date: '2025年9月', title: '入学普测预警', description: '测评显示社交回避倾向明显，社交焦虑量表得分62，回避行为较多', status: 'warning' },
    { studentId: 'stu-wuzhiyuan', date: '2025年10月', title: 'VR社交训练开始', description: '开始VR社交焦虑脱敏训练，从虚拟场景逐步适应社交互动，建立信心', status: 'success' },
    { studentId: 'stu-wuzhiyuan', date: '2025年11月', title: '团体辅导参与', description: '参加社交技能训练小组，学习社交技巧，与组员建立初步信任关系', status: 'success' },
    { studentId: 'stu-wuzhiyuan', date: '2025年12月', title: '社交行为改善', description: '主动参加班级活动2次，课堂发言次数增加，社交焦虑评分降至45', status: 'success' },
    { studentId: 'stu-wuzhiyuan', date: '2026年2月', title: '持续康复训练', description: '继续坚持社交技能练习，参加社团招新活动，社交能力持续改善中', status: 'active' },
    
    // ========== 周航宇（4条）==========
    { studentId: 'stu-zhouhangyu', date: '2025年9月', title: '入学普测优秀', description: '各项指标优秀，心理素质突出，综合评分79分，适应能力强', status: 'success' },
    { studentId: 'stu-zhouhangyu', date: '2025年10月', title: '心理委员选拔', description: '被选拔为班级心理委员，协助辅导员开展心理健康教育工作', status: 'success' },
    { studentId: 'stu-zhouhangyu', date: '2025年12月', title: '心理健康活动组织', description: '成功组织班级心理健康主题活动，获得老师和同学好评', status: 'success' },
    { studentId: 'stu-zhouhangyu', date: '2026年2月', title: '新学期规划', description: '继续担任心理委员，计划开展更多心理健康宣传活动', status: 'active' },
    
    // ========== 赵天宇（5条）==========
    { studentId: 'stu-zhaotianyu', date: '2025年9月', title: '入学普测预警', description: '测评显示情绪不稳定，情绪波动大，易怒，情绪调节能力弱', status: 'warning' },
    { studentId: 'stu-zhaotianyu', date: '2025年10月', title: '情绪危机干预', description: '因与室友冲突引发情绪爆发，进行情绪危机干预，建立安全计划', status: 'warning' },
    { studentId: 'stu-zhaotianyu', date: '2025年11月', title: '情绪管理训练', description: '开始情绪管理技能训练，学习情绪识别和调节技巧，情绪稳定性提升', status: 'success' },
    { studentId: 'stu-zhaotianyu', date: '2025年12月', title: '人际关系调解', description: '辅导员协助调解宿舍人际关系，与室友达成和解，关系改善', status: 'success' },
    { studentId: 'stu-zhaotianyu', date: '2026年2月', title: '持续情绪监控', description: '情绪管理能力有所提升，建议继续参加情绪管理小组活动', status: 'active' },
    
    // ========== 黄思萌（4条）==========
    { studentId: 'stu-huangsimeng', date: '2025年9月', title: '入学普测完成', description: '各项指标正常，心理状态良好，综合评分73分', status: 'success' },
    { studentId: 'stu-huangsimeng', date: '2025年11月', title: '考试压力应对', description: '期中考试压力大，参加压力管理工作坊，学习放松技巧', status: 'success' },
    { studentId: 'stu-huangsimeng', date: '2026年1月', title: '期末考试调整', description: '运用学到的压力管理技巧，期末考试期间状态良好', status: 'success' },
    { studentId: 'stu-huangsimeng', date: '2026年2月', title: '新学期适应', description: '新学期适应良好，继续保持健康的生活方式', status: 'active' },
    
    // ========== 林志豪（4条）==========
    { studentId: 'stu-linzhihao', date: '2025年9月', title: '入学普测优秀', description: '各项指标优秀，心理素质极佳，综合评分83分，各项指标均衡', status: 'success' },
    { studentId: 'stu-linzhihao', date: '2025年10月', title: '运动减压活动', description: '积极参加体育锻炼和正念训练，身心状态良好', status: 'success' },
    { studentId: 'stu-linzhihao', date: '2025年12月', title: '心理韧性提升', description: '面对学业挑战表现出良好的心理韧性，积极应对困难', status: 'success' },
    { studentId: 'stu-linzhihao', date: '2026年2月', title: '持续优秀表现', description: '继续保持优秀的心理状态，成为同学们学习的榜样', status: 'active' },
    
    // ========== 王语嫣（5条）==========
    { studentId: 'stu-wangyuyan', date: '2025年9月', title: '入学普测预警', description: '测评显示轻度社交焦虑，社交回避行为较多，自信心不足', status: 'warning' },
    { studentId: 'stu-wangyuyan', date: '2025年10月', title: 'VR社交训练', description: '开始VR社交焦虑脱敏训练，逐步建立社交信心', status: 'success' },
    { studentId: 'stu-wangyuyan', date: '2025年11月', title: '团体辅导参与', description: '参加自信心提升小组，通过角色扮演练习社交技能', status: 'success' },
    { studentId: 'stu-wangyuyan', date: '2025年12月', title: '社交焦虑改善', description: '主动参加班级聚会2次，社交焦虑评分从62降至48，改善明显', status: 'success' },
    { studentId: 'stu-wangyuyan', date: '2026年2月', title: '持续练习巩固', description: '继续坚持社交技能练习，参加社团活动，自信心逐步建立', status: 'active' },
    
    // ========== 李伟民（5条）==========
    { studentId: 'stu-liweimin', date: '2025年9月', title: '入学普测预警', description: '测评显示轻度学业压力，对未来规划感到迷茫，存在焦虑情绪', status: 'warning' },
    { studentId: 'stu-liweimin', date: '2025年10月', title: '学业规划咨询', description: '参加学业规划辅导，明确学习目标，制定学习计划', status: 'success' },
    { studentId: 'stu-liweimin', date: '2025年11月', title: '时间管理工作坊', description: '参加时间管理培训，学习效率提升，压力感减轻', status: 'success' },
    { studentId: 'stu-liweimin', date: '2026年1月', title: '压力缓解显著', description: '学业压力明显减轻，期末考试成绩理想，焦虑评分降至正常范围', status: 'success' },
    { studentId: 'stu-liweimin', date: '2026年2月', title: '新学期展望', description: '新学期目标明确，学习方法得当，心理状态稳定', status: 'active' },
    
    // ========== 孙晓晓（5条）==========
    { studentId: 'stu-sunxiaoxiao', date: '2025年9月', title: '入学普测预警', description: '测评显示情绪低落，SDS得分65，存在轻度抑郁症状，需要关注', status: 'warning' },
    { studentId: 'stu-sunxiaoxiao', date: '2025年10月', title: '心理咨询开始', description: '开始定期心理咨询，倾诉情绪困扰，建立治疗关系', status: 'success' },
    { studentId: 'stu-sunxiaoxiao', date: '2025年11月', title: '情绪日记记录', description: '开始写情绪日记，学习识别和表达情绪，情绪觉察能力提升', status: 'success' },
    { studentId: 'stu-sunxiaoxiao', date: '2025年12月', title: '情绪状态改善', description: '抑郁症状有所改善，SDS得分降至55，情绪趋于稳定', status: 'success' },
    { studentId: 'stu-sunxiaoxiao', date: '2026年2月', title: '持续心理咨询', description: '继续心理咨询，情绪管理能力提升，建议保持定期咨询', status: 'active' },
    
    // ========== 周健（4条）==========
    { studentId: 'stu-zhoujian', date: '2025年9月', title: '入学普测完成', description: '各项指标正常，心理状态健康，综合评分79分', status: 'success' },
    { studentId: 'stu-zhoujian', date: '2025年11月', title: '心理健康讲座', description: '参加大学生心理健康讲座，学习心理健康知识', status: 'success' },
    { studentId: 'stu-zhoujian', date: '2026年1月', title: '期末状态良好', description: '期末复习期间状态良好，能够有效管理学习压力', status: 'success' },
    { studentId: 'stu-zhoujian', date: '2026年2月', title: '新学期适应', description: '新学期适应良好，继续保持健康的心理状态', status: 'active' },
    
    // ========== 吴婷（5条）==========
    { studentId: 'stu-wuting', date: '2025年9月', title: '入学普测完成', description: '各项指标正常，心理状态良好，综合评分74分', status: 'success' },
    { studentId: 'stu-wuting', date: '2025年10月', title: '人际交往培训', description: '参加人际交往技能培训，学习有效沟通技巧', status: 'success' },
    { studentId: 'stu-wuting', date: '2025年11月', title: '宿舍关系调解', description: '主动参与宿舍关系建设，调解室友矛盾，宿舍氛围和谐', status: 'success' },
    { studentId: 'stu-wuting', date: '2025年12月', title: '社交能力提升', description: '人际交往能力显著提升，朋友圈扩大，社交满意度提高', status: 'success' },
    { studentId: 'stu-wuting', date: '2026年2月', title: '继续成长', description: '继续参加心理成长活动，保持积极的人际交往态度', status: 'active' },
    
    // ========== 郑凯（5条）==========
    { studentId: 'stu-zhengkai', date: '2025年9月', title: '入学普测预警', description: '测评显示人际关系困扰，社交技能不足，存在感较低', status: 'warning' },
    { studentId: 'stu-zhengkai', date: '2025年10月', title: '团体辅导开始', description: '参加社交技能团体辅导，学习人际交往技巧', status: 'success' },
    { studentId: 'stu-zhengkai', date: '2025年11月', title: '小组活动参与', description: '在小组活动中表现积极，与组员建立良好关系', status: 'success' },
    { studentId: 'stu-zhengkai', date: '2025年12月', title: '关系改善显著', description: '主动与同学交流增多，室友关系改善，不再感到孤独', status: 'success' },
    { studentId: 'stu-zhengkai', date: '2026年2月', title: '持续社交练习', description: '继续练习社交技能，参加社团活动，扩大社交圈', status: 'active' },
    
    // ========== 王芳（5条）==========
    { studentId: 'stu-wangfang', date: '2025年9月', title: '入学普测完成', description: '各项指标正常，心理状态稳定，综合评分69分', status: 'success' },
    { studentId: 'stu-wangfang', date: '2025年11月', title: '情绪管理工作坊', description: '参加情绪管理工作坊，学习情绪调节技巧', status: 'success' },
    { studentId: 'stu-wangfang', date: '2025年12月', title: '情绪调节改善', description: '情绪管理能力提升，能够更好地应对压力和负面情绪', status: 'success' },
    { studentId: 'stu-wangfang', date: '2026年1月', title: '期末平稳度过', description: '期末复习期间情绪稳定，考试状态良好', status: 'success' },
    { studentId: 'stu-wangfang', date: '2026年2月', title: '继续保持', description: '继续保持良好的情绪管理能力，新学期状态良好', status: 'active' },
    
    // ========== 冯涛（4条）==========
    { studentId: 'stu-fengtao', date: '2025年9月', title: '入学普测优秀', description: '各项指标优秀，心理素质极佳，综合评分80分', status: 'success' },
    { studentId: 'stu-fengtao', date: '2025年11月', title: '心理健康活动', description: '积极参加心理健康主题活动，表现活跃', status: 'success' },
    { studentId: 'stu-fengtao', date: '2026年1月', title: '优秀表现持续', description: '身心健康，学业成绩优秀，全面发展', status: 'success' },
    { studentId: 'stu-fengtao', date: '2026年2月', title: '新学期目标', description: '继续保持健康状态，争取更大进步', status: 'active' },
    
    // ========== 陈静（5条）==========
    { studentId: 'stu-chenjing', date: '2025年9月', title: '入学普测预警', description: '测评显示睡眠问题严重，入睡困难，睡眠质量差，影响日间功能', status: 'warning' },
    { studentId: 'stu-chenjing', date: '2025年10月', title: '睡眠咨询开始', description: '开始睡眠问题咨询，学习睡眠卫生知识，建立良好睡眠习惯', status: 'success' },
    { studentId: 'stu-chenjing', date: '2025年11月', title: '放松训练学习', description: '学习渐进式肌肉放松和呼吸放松技巧，睡前放松练习', status: 'success' },
    { studentId: 'stu-chenjing', date: '2025年12月', title: '睡眠改善明显', description: '入睡时间从1小时缩短至20分钟，睡眠质量显著提升', status: 'success' },
    { studentId: 'stu-chenjing', date: '2026年2月', title: '保持良好习惯', description: '继续保持良好睡眠习惯，日间精神状态良好，学习效率提高', status: 'active' },
    
    // ========== 杨波（4条）==========
    { studentId: 'stu-yangbo', date: '2025年9月', title: '入学普测完成', description: '各项指标正常，心理状态良好，综合评分76分', status: 'success' },
    { studentId: 'stu-yangbo', date: '2025年12月', title: '团队建设活动', description: '参加团队建设活动，团队协作能力提升', status: 'success' },
    { studentId: 'stu-yangbo', date: '2026年1月', title: '融入良好', description: '班级融入良好，与同学关系融洽，归属感强', status: 'success' },
    { studentId: 'stu-yangbo', date: '2026年2月', title: '积极参与', description: '积极参加班级和社团活动，保持积极心态', status: 'active' },
    
    // ========== 萧丽（5条）==========
    { studentId: 'stu-xiaoli', date: '2025年9月', title: '入学普测优秀', description: '各项指标优秀，心理素质极佳，综合评分81分，各方面均衡', status: 'success' },
    { studentId: 'stu-xiaoli', date: '2025年10月', title: '心理委员任职', description: '被选为班级心理委员，协助开展心理健康工作', status: 'success' },
    { studentId: 'stu-xiaoli', date: '2025年11月', title: '心理活动组织', description: '成功组织多次班级心理健康活动，获得好评', status: 'success' },
    { studentId: 'stu-xiaoli', date: '2025年12月', title: '优秀心理委员', description: '被评为优秀心理委员，工作表现突出', status: 'success' },
    { studentId: 'stu-xiaoli', date: '2026年2月', title: '继续服务同学', description: '新学期继续担任心理委员，服务同学，传播心理健康知识', status: 'active' },
  ]

  for (const te of timelineEvents) {
    await prisma.timelineEvent.createMany({
      skipDuplicates: true,
      data: {
        id: `te-${te.studentId}-${te.date.replace(/[^\w]/g, '')}-${Math.random().toString(36).substr(2, 5)}`,
        studentId: te.studentId,
        date: te.date,
        title: te.title,
        description: te.description,
        status: te.status,
      },
    })
  }

  const workOrders = [
    {
      id: 'wo-01',
      studentId: 'stu-chenyuqing',
      className: '软件2402',
      trigger: '语音情感异常连续触发',
      riskLevel: RiskLevel.HIGH,
      method: 'VR脱敏训练',
      counselor: '刘芳',
      status: WorkOrderStatus.IN_PROGRESS,
      date: new Date('2026-02-18T00:00:00.000Z'),
      detail: '该生在近两周课堂互动中呈现显著情绪失调特征',
      summary: '语音情感异常，需紧急心理咨询',
      aiAssessment: `【Qwen-14B 语音情感异常分析报告 - 陈雨晴】

基于语音情感识别系统分析，该生在近两周课堂互动中呈现显著情绪失调特征。

1. 声学特征异常：语音基频（F0）标准差超出正常范围168%，语调上扬模式异常，疑似情绪压抑后反弹。语音能量峰值在陈述悲伤话题时下降23dB，低于基线水平。

2. 语义内容分析：对话文本经NLP分析显示积极情感词汇使用频率下降67%，消极情感词汇（焦虑、担心、害怕）出现频率上升3.2倍。自我否定表达（"我不行""没意思"）在近200条对话记录中出现47次。

3. 行为关联：结合心率监测数据，该生在语音对话时心率平均提升28%，提示情绪唤醒度持续偏高。

【风险等级评估】：高危（综合评分 82/100）
【建议干预方案】：立即安排专业心理咨询师进行评估，48小时内完成初次访谈，同步通知辅导员关注日常行为变化。`,
    },
    {
      id: 'wo-02',
      studentId: 'stu-zhangmingyuan',
      className: '网络2401',
      trigger: '心率持续偏高（>110bpm）',
      riskLevel: RiskLevel.HIGH,
      method: '线下谈话',
      counselor: '张伟',
      status: WorkOrderStatus.COMPLETED,
      date: new Date('2026-02-17T00:00:00.000Z'),
      detail: '综合多模态生理监测数据，该生心血管系统持续处于应激状态',
      summary: '心率持续偏高，疑似慢性应激反应',
      aiAssessment: `【Qwen-14B 生理指标异常分析报告 - 张明远】

综合多模态生理监测数据，该生心血管系统持续处于应激状态。

1. 心率分析：过去14天静息心率均值89bpm（正常参考60-100bpm），显著高于该年龄段正常范围。尤其在晚间22:00-凌晨1:00时段，心率仍维持在75-95bpm，提示交感神经持续兴奋。

2. 皮电反应（EDA）：皮电水平较基线提升42%，表明该生长期处于警觉/焦虑状态。考试周期间EDA峰值频率增加3倍。

3. 睡眠关联：REM睡眠阶段占比下降至14%（正常22-25%），梦境频繁惊醒导致睡眠结构碎片化。

【风险等级评估】：高危（综合评分 79/100）
【建议干预方案】：建议心内科就诊排除器质性病变，同步启动心理压力管理干预，提供放松训练指导。`,
    },
    {
      id: 'wo-03',
      studentId: 'stu-liusiyuan',
      className: '数媒2401',
      trigger: '连续7天睡眠不足4小时',
      riskLevel: RiskLevel.MEDIUM,
      method: 'VR脱敏训练',
      counselor: '王丽',
      status: WorkOrderStatus.COMPLETED,
      date: new Date('2026-02-15T00:00:00.000Z'),
      detail: '该生睡眠数据显示严重的睡眠剥夺模式，需紧急干预',
      summary: '严重睡眠剥夺，昼夜节律失调',
      aiAssessment: `【Qwen-14B 睡眠剥夺风险分析报告 - 刘思远】

该生睡眠数据显示严重的睡眠剥夺模式，需紧急干预。

1. 睡眠时长：连续7天平均睡眠时长3.2小时，远低于青少年推荐8-10小时。睡眠效率下降至71%（正常>85%）。

2. 昼夜节律：入睡时间持续后移至凌晨2:00-4:00，与正常作息偏差超过5小时。周末补觉行为明显，单次补觉时长可达6小时，提示严重睡眠债。

3. 认知影响：日间警觉性测试反应时间延长240ms（较基线），注意力持续时间缩短至12分钟（正常25-30分钟）。

【风险等级评估】：中危（综合评分 68/100）
【建议干预方案】：睡眠卫生教育，制定固定作息时间表，限制晚间屏幕使用时间，考虑认知行为疗法改善睡眠。`,
    },
    {
      id: 'wo-04',
      studentId: 'stu-wuzhiyuan',
      className: '大数据2502',
      trigger: '14天未出宿舍门禁',
      riskLevel: RiskLevel.HIGH,
      method: '线下谈话',
      counselor: '刘芳',
      status: WorkOrderStatus.PENDING,
      date: new Date('2026-02-14T00:00:00.000Z'),
      detail: '基于校园一卡通刷卡记录、WiFi接入点日志与手机GPS轨迹融合分析，该生社交行为呈现显著退缩模式',
      summary: '社会隔离风险，需渐进式暴露疗法',
      aiAssessment: `【Qwen-14B 社会隔离风险空间分析报告 - 吴志远】

基于校园一卡通刷卡记录、WiFi接入点日志与手机GPS轨迹融合分析，该生社交行为呈现显著退缩模式：

**一、物理空间自我监禁**
连续14天该生活动范围仅限于宿舍楼栋（面积<500㎡），食堂就餐记录中断，外卖订单频率激增219%。门禁记录显示其平均每日外出时长仅0.5小时，且多集中于深夜2:37-6:11时段，刻意避开人群。

**二、社交网络萎缩**
社交媒体分析（经隐私脱敏）显示该生QQ空间更新频率从每周3条降至1条，互动深度（评论/点赞回复）下降117%。通讯录活跃联系人从38人缩减至6人，且均为家庭成员。

**三、非言语沟通中断**
宿舍楼层监控（隐私保护模式，仅识别行为模式）显示该生走廊停留时间趋近于零，遇到同学时主动回避行为（转身/退回房间）发生率达66%。图书馆座位预约系统显示其选择远离人群的边缘座位（靠近墙角/最后一排）概率达100%。

【风险等级评估】：高危（社会连接断裂评分 96/100）
【干预建议】：建议采用渐进式暴露疗法，初期安排线上心理咨询降低面对面压力。与宿管合作，邀请该生担任楼层安全员等低社交压力职责，创造"被迫"与人互动的情境。警惕自杀风险信号，建议每周进行结构化自杀意念筛查(C-SSRS)。`,
    },
    {
      id: 'wo-05',
      studentId: 'stu-zhouhangyu',
      className: '虚拟2503',
      trigger: '语音颤抖频率超标',
      riskLevel: RiskLevel.MEDIUM,
      method: 'VR脱敏训练',
      counselor: '张伟',
      status: WorkOrderStatus.PENDING,
      date: new Date('2026-02-13T00:00:00.000Z'),
      detail: '基于近14天课堂录音与日常语音样本的声学特征提取，该生语音模式呈现显著心理负荷特征',
      summary: '语音颤抖，疑似社交焦虑',
      aiAssessment: `【Qwen-14B 声学-心理特征深度分析报告 - 周航宇】

基于近14天课堂录音与日常语音样本的声学特征提取，该生语音模式呈现显著心理负荷特征：

**一、声学微表情异常**
语音基频(F0)稳定性分析显示该生说话时基频抖动(Jitter)达1.37%（正常<1%），表明声带肌肉紧张度异常。梅尔频率倒谱系数(MFCC)聚类分析识别出3种不同的"焦虑声纹"模式，占比达31%。

**二、言语行为学特征**
课堂发言文本分析发现该生使用第一人称单数("我")的频率较学期初下降60%，自我指涉减少通常与自我效能感降低相关。填充词("嗯"、"那个")使用频率激增226%，语言流畅性指标(LFT)降至0.65（正常>0.7）。

**三、社交语音退缩**
宿舍区语音活动检测(VAD)显示该生日均主动发起对话次数从15次降至1次，平均对话时长缩短87%。语音识别置信度分析表明该生倾向于使用低声、含糊的发音方式，符合社交回避的声学特征。

【风险等级评估】：中危（语音心理负荷评分 71/100）
【干预建议】：建议采用非侵入式干预，邀请该生参与戏剧社或辩论队等需要发声表达的活动，逐步重建语言自信。避免直接质问其语音变化，以防强化焦虑。`,
    },
    {
      id: 'wo-06',
      studentId: 'stu-zhaotianyu',
      className: '信安2401',
      trigger: '突发心率飙升（145bpm）',
      riskLevel: RiskLevel.HIGH,
      method: '线下谈话',
      counselor: '刘芳',
      status: WorkOrderStatus.PENDING,
      date: new Date('2026-02-12T00:00:00.000Z'),
      detail: '基于连续7天可穿戴设备心率监测数据，该生心血管系统呈现显著应激状态',
      summary: '心率飙升，交感神经过度激活',
      aiAssessment: `【Qwen-14B 心血管-心理关联风险分析报告 - 赵天宇】

基于连续7天可穿戴设备心率监测数据，该生心血管系统呈现显著应激状态：

**一、心脏自主神经功能评估**
该生静息心率基线为68bpm，但近72小时内出现7次突发性心动过速事件，峰值达147bpm，持续时间最长18分钟。心率变异性(HRV)分析显示RMSSD值降至28ms（正常>40ms），提示副交感神经张力显著降低，交感神经过度激活。

**二、昼夜节律与压力源分析**
24小时心率动态监测发现该生夜间（00:00-06:00）平均心率高达83bpm，远超同龄人夜间应低于60bpm的标准。结合课程表交叉分析，心率异常峰值与高等数学课程时间高度重合，提示存在特定学科焦虑。

**三、生理-心理耦合指标**
血压推导算法估算收缩压波动于130-149mmHg区间，皮质醇节律检测显示晨间峰值较正常延迟2小时，符合慢性应激反应模式。

【风险等级评估】：高危（心血管风险评分 100/100）
【干预建议】：建议48小时内完成心电图检查与甲状腺激素检测，同步启动心理咨询。暂时豁免该生体育课高强度训练，避免诱发心律失常。`,
    },
    {
      id: 'wo-07',
      studentId: 'stu-huangsimeng',
      className: '软件2402',
      trigger: '食堂消费记录连续7天为零',
      riskLevel: RiskLevel.MEDIUM,
      method: '线下谈话',
      counselor: '王丽',
      status: WorkOrderStatus.PENDING,
      date: new Date('2026-02-10T00:00:00.000Z'),
      detail: '通过校园卡消费记录、外卖平台数据关联分析与体重监测数据，该生饮食行为呈现严重异常模式',
      summary: '饮食行为异常，可能存在进食障碍',
      aiAssessment: `【Qwen-14B 饮食行为-心理关联风险报告 - 黄思萌】

通过校园卡消费记录、外卖平台数据关联分析（经授权）与体重监测数据，该生饮食行为呈现严重异常模式：

**一、营养摄入严重不足**
连续11天食堂零消费记录，外卖订单分析显示日均热量摄入仅1394kcal（推荐量2000-2400kcal），蛋白质摄入不足37g/天。体脂秤数据（宿舍公共设备）显示该生体重波动4.4kg/周，BMI已降至18.7（接近或低于正常下限18.5）。

**二、进食行为仪式化**
宿舍垃圾篓图像识别（AI分析，仅统计物品类别）显示该生大量购买零卡饮料，暗示可能存在替代性进食行为。外卖订单时间分析显示其倾向于在凌晨4:16下单，夜间进食综合征(NES)可能性较高。

**三、体像认知扭曲风险**
该生近期搜索记录（经隐私脱敏，仅提取健康相关关键词）显示频繁查询"减肥方法"、"卡路里计算"、"BMI标准"等内容。社交媒体上关注的账号中，57%为健身/瘦身类博主，存在体像比较行为。需警惕神经性厌食症或暴食症的早期表现。

【风险等级评估】：中危（饮食障碍风险评分 74/100）
【干预建议】：建议立即进行营养评估与代谢指标检测（电解质、肝肾功能）。心理咨询应聚焦体像认知重建，避免直接讨论"体重"或"饮食"以免强化焦虑。建议营养师制定渐进式增重计划，初期目标为维持当前体重而非增重。`,
    },
    {
      id: 'wo-08',
      studentId: 'stu-linzhihao',
      className: '大数据2502',
      trigger: '行动轨迹异常收缩',
      riskLevel: RiskLevel.LOW,
      method: 'VR脱敏训练',
      counselor: '张伟',
      status: WorkOrderStatus.PENDING,
      date: new Date('2026-02-08T00:00:00.000Z'),
      detail: '基于手机加速度计、校园步道压力感应地砖与视频监控步态识别的多源数据融合',
      summary: '运动行为退缩，呈抑郁步态特征',
      aiAssessment: `【Qwen-14B 运动行为-心理状态关联分析报告 - 林志豪】

基于手机加速度计、校园步道压力感应地砖（实验性部署）与视频监控步态识别（隐私保护模式）的多源数据融合：

**一、步态动力学异常**
步态分析显示该生步长从0.62m缩短至0.46m，步频降低20%，呈现典型的"抑郁步态"特征。双足支撑相时间延长19%，提示身体稳定性下降或主观上的"小心翼翼"。头部前倾角度增加11度，肩部内收，整体姿态传递出"自我保护"的肢体语言。

**二、活动量断崖式下跌**
计步数据显示日均步数从10918步骤降至2232步，周末几乎零步数。 stairs climbed（爬楼层数）从日均8层降至1层，倾向于使用电梯而非楼梯，精力水平显著下降。

**三、习惯性回避路径**
路径规划算法分析显示该生刻意回避经过食堂高峰期区域的常规路线，宁愿选择绕行7分钟的替代路径。这种环境回避行为可能与特定场所触发的负面记忆或预期焦虑相关。

【风险等级评估】：低危（精神运动性迟滞评分 50/100）
【干预建议】：建议将该生转介至运动心理学专家，制定渐进式身体活动计划（从每日10分钟散步开始）。物理活动可以通过BDNF（脑源性神经营养因子）通路改善抑郁症状。同时需评估是否存在慢性疼痛或躯体化症状导致的运动回避。`,
    },
    {
      id: 'wo-09',
      studentId: 'stu-wangyuyan',
      className: '网络2401',
      trigger: '社交回避行为加剧',
      riskLevel: RiskLevel.MEDIUM,
      method: 'VR脱敏训练',
      counselor: '刘芳',
      status: WorkOrderStatus.PENDING,
      date: new Date('2026-02-06T00:00:00.000Z'),
      detail: '基于校园一卡通刷卡记录、WiFi接入点日志与手机GPS轨迹融合分析，该生社交行为呈现显著退缩模式',
      summary: '社交回避加剧，社会连接断裂',
      aiAssessment: `【Qwen-14B 社会隔离风险空间分析报告 - 王语嫣】

基于校园一卡通刷卡记录、WiFi接入点日志与手机GPS轨迹融合分析，该生社交行为呈现显著退缩模式：

**一、物理空间自我监禁**
连续14天该生活动范围仅限于宿舍楼栋（面积<500㎡），食堂就餐记录中断，外卖订单频率激增319%。门禁记录显示其平均每日外出时长仅0.4小时，且多集中于深夜2:33-5:14时段，刻意避开人群。

**二、社交网络萎缩**
社交媒体分析（经隐私脱敏）显示该生QQ空间更新频率从每周4条降至0条，互动深度（评论/点赞回复）下降89%。通讯录活跃联系人从36人缩减至7人，且均为家庭成员。

**三、非言语沟通中断**
宿舍楼层监控（隐私保护模式，仅识别行为模式）显示该生走廊停留时间趋近于零，遇到同学时主动回避行为（转身/退回房间）发生率达81%。图书馆座位预约系统显示其选择远离人群的边缘座位（靠近墙角/最后一排）概率达100%。

【风险等级评估】：中危（社会连接断裂评分 70/100）
【干预建议】：建议采用渐进式暴露疗法，初期安排线上心理咨询降低面对面压力。与宿管合作，邀请该生担任楼层安全员等低社交压力职责，创造"被迫"与人互动的情境。警惕自杀风险信号，建议每周进行结构化自杀意念筛查(C-SSRS)。`,
    },
    {
      id: 'wo-10',
      studentId: 'stu-zhangyu',
      className: '大数据2502',
      trigger: '情绪波动指数持续高位',
      riskLevel: RiskLevel.MEDIUM,
      method: '线下谈话',
      counselor: '王丽',
      status: WorkOrderStatus.PENDING,
      date: new Date('2026-02-05T00:00:00.000Z'),
      detail: '融合面部表情识别、语音情感分析、社交媒体文本情感挖掘与生理信号，该生情绪调节能力呈现明显受损',
      summary: '情绪失调，DBT技能训练建议',
      aiAssessment: `【Qwen-14B 情绪失调风险多模态分析报告 - 张宇】

融合面部表情识别、语音情感分析、社交媒体文本情感挖掘与生理信号，该生情绪调节能力呈现明显受损：

**一、情绪不稳定性量化**
基于教室摄像头微表情分析（隐私保护模式，仅提取表情特征），该生每日经历18次以上的情绪快速转换（<3秒内从平静到焦虑），情绪切换频率是同班同学的2.8倍。情感效价(valence)标准差达0.59（正常<0.25），提示情绪调节失败。

**二、负性情绪偏向**
课堂表情识别显示该生中性/负性表情占比达83%（正常约50%），积极表情（微笑）出现频率低于2次/天。皱眉动作频率较学期初增加269%，眉毛内侧上扬（悲伤特征）在独处时自发出现率达47%。

**三、情绪表达不适当**
语音情感识别显示该生在课堂提问等中性场景中出现"强焦虑"声纹的概率达21%，存在情绪反应与情境不匹配现象。这种情绪失调可能与前额叶-杏仁核连接功能异常相关。

【风险等级评估】：中危（情绪调节障碍评分 71/100）
【干预建议】：建议引入辩证行为疗法(DBT)技能训练，重点教授情绪调节模块。推荐使用情绪追踪App进行每日情绪记录，提升情绪觉察能力。需排除双相情感障碍或边缘型人格障碍的可能性，建议精神科评估。`,
    },
    {
      id: 'wo-11',
      studentId: 'stu-chenyuqing',
      className: '软件2402',
      trigger: 'VR体验后情绪反弹',
      riskLevel: RiskLevel.HIGH,
      method: '线下谈话',
      counselor: '张伟',
      status: WorkOrderStatus.IN_PROGRESS,
      date: new Date('2026-02-20T00:00:00.000Z'),
      detail: '该生在VR心理脱敏训练后出现显著情绪波动回弹，需关注干预适应性',
      summary: 'VR训练后情绪反弹，需调整方案',
      aiAssessment: `【Qwen-14B VR体验情绪波动分析报告 - 陈雨晴】

该生在VR心理脱敏训练后出现显著情绪波动回弹，需关注干预适应性。

1. VR体验数据分析：沉浸时长达到45分钟（推荐30分钟），心率在VR场景切换时剧烈波动（峰值142bpm），离开虚拟环境后心率恢复时间延长至8分钟（正常2-3分钟）。

2. 情绪反弹指标：VR体验结束后情绪量表评分从体验中段的7.2分（较平静）回落至3.1分（低落），反弹幅度达57%，超过安全阈值40%。

3. 瞳孔反应：体验全程瞳孔直径变化幅度增加34%，提示认知负荷过重，可能触发创伤相关记忆闪回。

【风险等级评估】：高危（综合评分 81/100）
【建议干预方案】：暂停当前VR训练方案，调整为更低强度的渐进式暴露。进行心理咨询评估是否存在未处理的创伤素材。`,
    },
    {
      id: 'wo-12',
      studentId: 'stu-zhangmingyuan',
      className: '网络2401',
      trigger: '宿舍人际关系冲突',
      riskLevel: RiskLevel.MEDIUM,
      method: '团体辅导',
      counselor: '刘芳',
      status: WorkOrderStatus.IN_PROGRESS,
      date: new Date('2026-02-19T00:00:00.000Z'),
      detail: '该生与室友冲突事件呈现出社交退缩的典型前兆',
      summary: '宿舍冲突后社交退缩',
      aiAssessment: `【Qwen-14B 人际关系冲突分析报告 - 张明远】

该生与室友冲突事件呈现出社交退缩的典型前兆。

1. 冲突事件分析：通过语音监测和文本分析，冲突起源于作息时间差异（凌晨游戏声干扰他人），但随后升级为言语攻击和社交排斥。语气分析显示该生在冲突中使用防御性语言频率增加89%。

2. 社交退缩迹象：冲突后3天内与室友主动对话频率下降至0，食堂独坐比例上升至100%，课堂发言主动性和参与度同步下降。

3. 支持网络：班级群聊互动频率下降72%，与班级心理委员的私下交流中断超过10天。

【风险等级评估】：中危（综合评分 65/100）
【建议干预方案】：辅导员介入调解宿舍矛盾，提供沟通技巧培训。必要时调整宿舍安排，关注该生情绪状态变化。`,
    },
    {
      id: 'wo-13',
      studentId: 'stu-liusiyuan',
      className: '数媒2401',
      trigger: '期末考压力导致失眠',
      riskLevel: RiskLevel.MEDIUM,
      method: '正念训练',
      counselor: '王丽',
      status: WorkOrderStatus.COMPLETED,
      date: new Date('2026-02-16T00:00:00.000Z'),
      detail: '该生失眠症状与期末考试压力高度相关，呈现典型考试焦虑综合征',
      summary: '考试焦虑诱发失眠',
      aiAssessment: `【Qwen-14B 考试焦虑诱发失眠分析报告 - 刘思远】

该生失眠症状与期末考试压力高度相关，呈现典型考试焦虑综合征。

1. 失眠模式：入睡潜伏期延长至90分钟（正常<30分钟），凌晨3-4点醒后再入睡困难，梦境多为考试相关场景（梦见答题卡涂错、迟到等）。

2. 认知焦虑指标：考试前1周认知焦虑量表得分32分（高焦虑阈值>25），考试当天生理指标（心率、皮电）异常波动较平时增加2.3倍。

3. 学业关联：近3次考试排名下滑8-12名，自述"脑子一片空白"情况在重要考试中出现2次。

【风险等级评估】：中危（综合评分 62/100）
【建议干预方案】：考试焦虑脱敏训练（系统脱敏或暴露疗法），睡眠限制和刺激控制法干预，提供放松技术（腹式呼吸、渐进性肌肉放松）指导。`,
    },
    {
      id: 'wo-14',
      studentId: 'stu-wuzhiyuan',
      className: '大数据2502',
      trigger: '网络游戏成瘾评估',
      riskLevel: RiskLevel.LOW,
      method: '认知行为疗法',
      counselor: '张伟',
      status: WorkOrderStatus.COMPLETED,
      date: new Date('2026-02-11T00:00:00.000Z'),
      detail: '该生在游戏使用行为数据中呈现网络成瘾早期特征',
      summary: '网络成瘾早期，需行为干预',
      aiAssessment: `【Qwen-14B 网络游戏成瘾风险评估报告 - 吴志远】

该生在游戏使用行为数据中呈现网络成瘾早期特征。

1. 使用时长：日均游戏时长4.2小时（周末达7.8小时），显著超过非学业屏幕时间推荐标准（<2小时）。凌晨2:00后游戏行为记录23次。

2. 戒断反应：被限制游戏后出现烦躁不安、注意力下降等戒断表现，被记录3次。游戏成为应对负面情绪的主要手段（情绪调节逃避模式）。

3. 社交替代：现实社交活动参与度下降58%，户外运动频率下降至每周0.5小时，游戏内社交成为主要社交渠道。

【风险等级评估】：低危（综合评分 45/100）
【建议干预方案】：制定渐进式屏幕时间管理计划，替代行为训练（运动、兴趣小组），家长协同监管，建立正向强化机制。`,
    },
  ]

  for (const wo of workOrders) {
    await prisma.workOrder.upsert({
      where: { id: wo.id },
      update: { aiAssessment: wo.aiAssessment },
      create: wo,
    })
  }
  console.log(`- ${workOrders.length}个工单（含AI评估报告）`)

  // 房间数据：5个心理咨询室 + 2个VR体验区 + 3个减压舱 = 10个房间
  const rooms = [
    { id: 'room-001', name: '心理咨询室 A01', location: '心理中心A201', status: RoomStatus.AVAILABLE, capacity: 1, currentStudentId: null },
    { id: 'room-002', name: '心理咨询室 A02', location: '心理中心A202', status: RoomStatus.IN_USE, capacity: 1, currentStudentId: 'stu-zhangmingyuan' },
    { id: 'room-003', name: '心理咨询室 A03', location: '心理中心A203', status: RoomStatus.AVAILABLE, capacity: 1, currentStudentId: null },
    { id: 'room-004', name: '心理咨询室 A04', location: '心理中心A204', status: RoomStatus.MAINTENANCE, capacity: 1, currentStudentId: null },
    { id: 'room-005', name: '心理咨询室 A05', location: '心理中心A205', status: RoomStatus.AVAILABLE, capacity: 1, currentStudentId: null },
    { id: 'room-006', name: 'VR体验区 X01', location: 'VR体验中心X301', status: RoomStatus.AVAILABLE, capacity: 3, currentStudentId: null },
    { id: 'room-007', name: 'VR体验区 X02', location: 'VR体验中心X302', status: RoomStatus.AVAILABLE, capacity: 3, currentStudentId: null },
    { id: 'room-008', name: '减压舱 R01', location: '图书馆B101', status: RoomStatus.AVAILABLE, capacity: 2, currentStudentId: null },
    { id: 'room-009', name: '减压舱 R02', location: '学生活动中心C205', status: RoomStatus.AVAILABLE, capacity: 2, currentStudentId: null },
    { id: 'room-010', name: '减压舱 R03', location: '体育馆D301', status: RoomStatus.AVAILABLE, capacity: 2, currentStudentId: null },
  ]

  for (const r of rooms) {
    await prisma.consultationRoom.upsert({
      where: { id: r.id },
      update: {
        name: r.name,
        location: r.location,
        status: r.status,
        capacity: r.capacity,
        currentStudentId: r.currentStudentId,
      },
      create: r,
    })
  }

  // 设备数据：10台VR + 10条手环 + 6个脑电（脑电只在心理咨询室A01-A05）
  const devices = [
    // VR设备 - 10台（分配到所有房间）
    { id: 'dev-vr-1', name: 'Pico 4 Enterprise #1', serialNumber: 'P4E202401001', type: DeviceType.VR, model: 'Pico 4 Enterprise', status: DeviceStatus.ONLINE, battery: 85, room: '心理咨询室 A01', location: '心理中心A201', lastActive: '10分钟前', lastSync: '2分钟前' },
    { id: 'dev-vr-2', name: 'Pico 4 Enterprise #2', serialNumber: 'P4E202401002', type: DeviceType.VR, model: 'Pico 4 Enterprise', status: DeviceStatus.IN_USE, battery: 72, room: '心理咨询室 A02', location: '心理中心A202', lastActive: '使用中', lastSync: '实时' },
    { id: 'dev-vr-3', name: 'Pico 4 Enterprise #3', serialNumber: 'P4E202401003', type: DeviceType.VR, model: 'Pico 4 Enterprise', status: DeviceStatus.ONLINE, battery: 90, room: '心理咨询室 A03', location: '心理中心A203', lastActive: '5分钟前', lastSync: '1分钟前' },
    { id: 'dev-vr-4', name: 'Pico 4 Enterprise #4', serialNumber: 'P4E202401004', type: DeviceType.VR, model: 'Pico 4 Enterprise', status: DeviceStatus.MAINTENANCE, battery: 45, room: '心理咨询室 A04', location: '心理中心A204', lastActive: '2小时前', lastSync: '1小时前' },
    { id: 'dev-vr-5', name: 'Pico 4 Enterprise #5', serialNumber: 'P4E202401005', type: DeviceType.VR, model: 'Pico 4 Enterprise', status: DeviceStatus.ONLINE, battery: 95, room: '心理咨询室 A05', location: '心理中心A205', lastActive: '3分钟前', lastSync: '实时' },
    { id: 'dev-vr-6', name: 'Pico 4 Pro #1', serialNumber: 'P4P202401001', type: DeviceType.VR, model: 'Pico 4 Pro', status: DeviceStatus.ONLINE, battery: 78, room: 'VR体验区 X01', location: 'VR体验中心X301', lastActive: '15分钟前', lastSync: '5分钟前' },
    { id: 'dev-vr-7', name: 'Pico 4 Pro #2', serialNumber: 'P4P202401002', type: DeviceType.VR, model: 'Pico 4 Pro', status: DeviceStatus.ONLINE, battery: 65, room: 'VR体验区 X01', location: 'VR体验中心X301', lastActive: '30分钟前', lastSync: '10分钟前' },
    { id: 'dev-vr-8', name: 'Meta Quest 3 #1', serialNumber: 'MQ3202401001', type: DeviceType.VR, model: 'Meta Quest 3', status: DeviceStatus.ONLINE, battery: 88, room: 'VR体验区 X02', location: 'VR体验中心X302', lastActive: '8分钟前', lastSync: '2分钟前' },
    { id: 'dev-vr-9', name: 'Meta Quest 3 #2', serialNumber: 'MQ3202401002', type: DeviceType.VR, model: 'Meta Quest 3', status: DeviceStatus.ONLINE, battery: 92, room: 'VR体验区 X02', location: 'VR体验中心X302', lastActive: '12分钟前', lastSync: '3分钟前' },
    { id: 'dev-vr-10', name: 'Meta Quest 3 #3', serialNumber: 'MQ3202401003', type: DeviceType.VR, model: 'Meta Quest 3', status: DeviceStatus.ONLINE, battery: 70, room: '减压舱 R01', location: '图书馆B101', lastActive: '20分钟前', lastSync: '8分钟前' },
    
    // 生理手环 - 10条（分配到所有房间）
    { id: 'dev-br-1', name: '小米手环 9 #1', serialNumber: 'MW9202401001', type: DeviceType.BRACELET, model: '小米手环 9', status: DeviceStatus.ONLINE, battery: 92, room: '心理咨询室 A01', location: '心理中心A201', lastActive: '5分钟前', lastSync: '实时' },
    { id: 'dev-br-2', name: '小米手环 9 #2', serialNumber: 'MW9202401002', type: DeviceType.BRACELET, model: '小米手环 9', status: DeviceStatus.IN_USE, battery: 68, room: '心理咨询室 A02', location: '心理中心A202', lastActive: '使用中', lastSync: '实时' },
    { id: 'dev-br-3', name: '小米手环 9 #3', serialNumber: 'MW9202401003', type: DeviceType.BRACELET, model: '小米手环 9', status: DeviceStatus.ONLINE, battery: 85, room: '心理咨询室 A03', location: '心理中心A203', lastActive: '10分钟前', lastSync: '实时' },
    { id: 'dev-br-4', name: '华为手环 9 #1', serialNumber: 'HW9202401001', type: DeviceType.BRACELET, model: '华为手环 9', status: DeviceStatus.ONLINE, battery: 88, room: '心理咨询室 A04', location: '心理中心A204', lastActive: '12分钟前', lastSync: '实时' },
    { id: 'dev-br-5', name: '华为手环 9 #2', serialNumber: 'HW9202401002', type: DeviceType.BRACELET, model: '华为手环 9', status: DeviceStatus.ONLINE, battery: 75, room: '心理咨询室 A05', location: '心理中心A205', lastActive: '15分钟前', lastSync: '实时' },
    { id: 'dev-br-6', name: '小米手环 9 #4', serialNumber: 'MW9202401004', type: DeviceType.BRACELET, model: '小米手环 9', status: DeviceStatus.ONLINE, battery: 78, room: 'VR体验区 X01', location: 'VR体验中心X301', lastActive: '8分钟前', lastSync: '实时' },
    { id: 'dev-br-7', name: '小米手环 9 #5', serialNumber: 'MW9202401005', type: DeviceType.BRACELET, model: '小米手环 9', status: DeviceStatus.ONLINE, battery: 90, room: 'VR体验区 X02', location: 'VR体验中心X302', lastActive: '4分钟前', lastSync: '实时' },
    { id: 'dev-br-8', name: '华为手环 9 #3', serialNumber: 'HW9202401003', type: DeviceType.BRACELET, model: '华为手环 9', status: DeviceStatus.ONLINE, battery: 82, room: '减压舱 R01', location: '图书馆B101', lastActive: '6分钟前', lastSync: '实时' },
    { id: 'dev-br-9', name: '小米手环 8 #1', serialNumber: 'MW8202401001', type: DeviceType.BRACELET, model: '小米手环 8', status: DeviceStatus.OFFLINE, battery: 12, room: '减压舱 R02', location: '学生活动中心C205', lastActive: '1天前', lastSync: '6小时前' },
    { id: 'dev-br-10', name: '华为手环 9 #4', serialNumber: 'HW9202401004', type: DeviceType.BRACELET, model: '华为手环 9', status: DeviceStatus.ONLINE, battery: 95, room: '减压舱 R03', location: '体育馆D301', lastActive: '2分钟前', lastSync: '实时' },
    
    // 脑电设备 - 6个（只在心理咨询室A01-A05）
    { id: 'dev-eeg-1', name: 'BrainCo Flex #1', serialNumber: 'BCF202401001', type: DeviceType.EEG, model: 'BrainCo Flex', status: DeviceStatus.OFFLINE, battery: null, room: '心理咨询室 A01', location: '心理中心A201', lastActive: '3天前', lastSync: '1天前' },
    { id: 'dev-eeg-2', name: 'BrainCo Flex #2', serialNumber: 'BCF202401002', type: DeviceType.EEG, model: 'BrainCo Flex', status: DeviceStatus.IN_USE, battery: null, room: '心理咨询室 A01', location: '心理中心A201', lastActive: '使用中', lastSync: '实时' },
    { id: 'dev-eeg-3', name: 'BrainCo Flex #3', serialNumber: 'BCF202401003', type: DeviceType.EEG, model: 'BrainCo Flex', status: DeviceStatus.ONLINE, battery: null, room: '心理咨询室 A02', location: '心理中心A202', lastActive: '1小时前', lastSync: '30分钟前' },
    { id: 'dev-eeg-4', name: 'Emotiv Epoc X #1', serialNumber: 'EEX202401001', type: DeviceType.EEG, model: 'Emotiv Epoc X', status: DeviceStatus.ONLINE, battery: null, room: '心理咨询室 A03', location: '心理中心A203', lastActive: '45分钟前', lastSync: '20分钟前' },
    { id: 'dev-eeg-5', name: 'Emotiv Epoc X #2', serialNumber: 'EEX202401002', type: DeviceType.EEG, model: 'Emotiv Epoc X', status: DeviceStatus.ONLINE, battery: null, room: '心理咨询室 A04', location: '心理中心A204', lastActive: '2小时前', lastSync: '1小时前' },
    { id: 'dev-eeg-6', name: 'BrainCo Epoch #1', serialNumber: 'BCE202401001', type: DeviceType.EEG, model: 'BrainCo Epoch', status: DeviceStatus.ONLINE, battery: null, room: '心理咨询室 A05', location: '心理中心A205', lastActive: '30分钟前', lastSync: '15分钟前' },
  ]

  for (const d of devices) {
    await prisma.device.upsert({
      where: { id: d.id },
      update: {
        name: d.name,
        serialNumber: d.serialNumber,
        type: d.type,
        model: d.model,
        status: d.status,
        battery: d.battery,
        room: d.room,
        location: d.location,
        lastActive: d.lastActive,
        lastSync: d.lastSync,
      },
      create: d,
    })
  }

  // 房间设备关联
  const roomDevices = [
    // 心理咨询室 A01
    { id: 'rd-1', roomId: 'room-001', deviceId: 'dev-vr-1' },
    { id: 'rd-2', roomId: 'room-001', deviceId: 'dev-br-1' },
    { id: 'rd-3', roomId: 'room-001', deviceId: 'dev-eeg-1' },
    { id: 'rd-4', roomId: 'room-001', deviceId: 'dev-eeg-2' },
    // 心理咨询室 A02
    { id: 'rd-5', roomId: 'room-002', deviceId: 'dev-vr-2' },
    { id: 'rd-6', roomId: 'room-002', deviceId: 'dev-br-2' },
    { id: 'rd-7', roomId: 'room-002', deviceId: 'dev-eeg-3' },
    // 心理咨询室 A03
    { id: 'rd-8', roomId: 'room-003', deviceId: 'dev-vr-3' },
    { id: 'rd-9', roomId: 'room-003', deviceId: 'dev-br-3' },
    { id: 'rd-10', roomId: 'room-003', deviceId: 'dev-eeg-4' },
    // 心理咨询室 A04
    { id: 'rd-11', roomId: 'room-004', deviceId: 'dev-vr-4' },
    { id: 'rd-12', roomId: 'room-004', deviceId: 'dev-br-4' },
    { id: 'rd-13', roomId: 'room-004', deviceId: 'dev-eeg-5' },
    // 心理咨询室 A05
    { id: 'rd-14', roomId: 'room-005', deviceId: 'dev-vr-5' },
    { id: 'rd-15', roomId: 'room-005', deviceId: 'dev-br-5' },
    { id: 'rd-16', roomId: 'room-005', deviceId: 'dev-eeg-6' },
    // VR体验区 X01
    { id: 'rd-17', roomId: 'room-006', deviceId: 'dev-vr-6' },
    { id: 'rd-18', roomId: 'room-006', deviceId: 'dev-vr-7' },
    { id: 'rd-19', roomId: 'room-006', deviceId: 'dev-br-6' },
    // VR体验区 X02
    { id: 'rd-20', roomId: 'room-007', deviceId: 'dev-vr-8' },
    { id: 'rd-21', roomId: 'room-007', deviceId: 'dev-vr-9' },
    { id: 'rd-22', roomId: 'room-007', deviceId: 'dev-br-7' },
    // 减压舱 R01
    { id: 'rd-23', roomId: 'room-008', deviceId: 'dev-vr-10' },
    { id: 'rd-24', roomId: 'room-008', deviceId: 'dev-br-8' },
    // 减压舱 R02
    { id: 'rd-25', roomId: 'room-009', deviceId: 'dev-br-9' },
    // 减压舱 R03
    { id: 'rd-26', roomId: 'room-010', deviceId: 'dev-br-10' },
  ]

  for (const rd of roomDevices) {
    await prisma.roomDevice.upsert({
      where: {
        roomId_deviceId: {
          roomId: rd.roomId,
          deviceId: rd.deviceId,
        },
      },
      update: {},
      create: rd,
    })
  }

  // ============================================
  // PsyTwin Pocket 小程序扩展 - 社交互动测试数据
  // ============================================
  
  // 清理旧数据
  await prisma.postLike.deleteMany({})
  await prisma.postCollection.deleteMany({})
  await prisma.studentNotification.deleteMany({})
  
  // 获取所有学生和帖子
  const allStudents = await prisma.student.findMany({ select: { id: true } })
  const allPosts = await prisma.post.findMany({ select: { id: true } })
  
  if (allStudents.length > 0 && allPosts.length > 0) {
    // 创建点赞数据（每个帖子随机1-5个点赞）
    const postLikes = []
    for (const post of allPosts) {
      const likeCount = Math.floor(Math.random() * 5) + 1
      const shuffledStudents = [...allStudents].sort(() => Math.random() - 0.5)
      for (let i = 0; i < Math.min(likeCount, shuffledStudents.length); i++) {
        postLikes.push({
          postId: post.id,
          studentId: shuffledStudents[i].id,
        })
      }
    }
    
    for (const like of postLikes) {
      await prisma.postLike.create({ data: like })
    }
    console.log(`- ${postLikes.length}条点赞记录`)
    
    // 创建收藏数据（每个学生随机收藏2-5个帖子）
    const postCollections = []
    for (const student of allStudents.slice(0, 10)) { // 只有前10个学生有收藏
      const collectionCount = Math.floor(Math.random() * 4) + 2
      const shuffledPosts = [...allPosts].sort(() => Math.random() - 0.5)
      for (let i = 0; i < Math.min(collectionCount, shuffledPosts.length); i++) {
        postCollections.push({
          postId: shuffledPosts[i].id,
          studentId: student.id,
          collectedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // 最近7天内
        })
      }
    }
    
    for (const collection of postCollections) {
      await prisma.postCollection.create({ data: collection })
    }
    console.log(`- ${postCollections.length}条收藏记录`)
    
    // 创建通知数据
    const notificationTypes = ['SYSTEM', 'APPOINTMENT', 'CHAT', 'WARNING', 'POST', 'COMMENT'] as const
    const notifications = []
    
    for (const student of allStudents.slice(0, 5)) { // 只有前5个学生有通知
      const notificationCount = Math.floor(Math.random() * 5) + 3 // 3-7条通知
      for (let i = 0; i < notificationCount; i++) {
        const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
        const isRead = Math.random() > 0.5
        notifications.push({
          studentId: student.id,
          type: type,
          title: generateNotificationTitle(type),
          content: generateNotificationContent(type),
          actionUrl: type === 'APPOINTMENT' ? '/pages/appointment/detail' : 
                     type === 'CHAT' ? '/pages/chat/session' : 
                     type === 'POST' ? '/pages/community/post' : null,
          isRead: isRead,
          readAt: isRead ? new Date(Date.now() - Math.floor(Math.random() * 3 * 24 * 60 * 60 * 1000)) : null,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
        })
      }
    }
    
    for (const notification of notifications) {
      await prisma.studentNotification.create({ data: notification })
    }
    console.log(`- ${notifications.length}条通知记录`)
  }

  // 更新帖子的点赞数和收藏数
  for (const post of allPosts) {
    const likeCount = await prisma.postLike.count({ where: { postId: post.id } })
    const collectionCount = await prisma.postCollection.count({ where: { postId: post.id } })
    await prisma.post.update({
      where: { id: post.id },
      data: { likeCount, commentCount: collectionCount }, // 使用commentCount字段暂存收藏数
    })
  }

  console.log('Seed completed successfully.')

  console.log('Seed completed successfully.')
  console.log(`- 20个学生（每人都有完整的心理画像和时间线）`)
  console.log(`- 20个心理画像（每人8维度+综合评分）`)
  console.log(`- 约90条时间线事件（每人4-5条生命周期记录）`)
  console.log(`- 20条干预记录（每学生至少1条）`)
  console.log(`- 14个工单（含AI评估报告）`)
  console.log(`- 10个房间（5个咨询室 + 2个VR区 + 3个减压舱）`)
  console.log(`- 26台设备（10台VR + 10条手环 + 6个脑电，脑电只在咨询室）`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
