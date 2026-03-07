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

  // 20个学生的干预记录（每个学生至少1条）
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

  console.log('Seed completed successfully.')
  console.log(`- 20个学生（每人都有完整的心理画像和时间线）`)
  console.log(`- 20个心理画像（每人8维度+综合评分）`)
  console.log(`- 约90条时间线事件（每人4-5条生命周期记录）`)
  console.log(`- 20条干预记录（每学生至少1条）`)
  console.log(`- 10个房间（5个咨询室 + 2个VR区 + 3个减压舱）`)
  console.log(`- 26台设备（10台VR + 10条手环 + 6个脑电）`)
  console.log(`- 20个学生`)
  console.log(`- 20条干预记录（每学生至少1条）`)
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
