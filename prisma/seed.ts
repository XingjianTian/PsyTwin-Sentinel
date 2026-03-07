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
        gender: '男',
        birthDate: new Date('2006-03-01T00:00:00.000Z'),
        mbti: s.mbti,
        riskLevel: s.riskLevel,
      },
    })
  }

  for (const s of students) {
    await prisma.psychProfile.upsert({
      where: { studentId: s.id },
      update: {
        adversityQuotient: 80,
        emotionalStability: 68,
        socialTendency: 75,
        stressResistance: 78,
        selfAwareness: 77,
        empathy: 73,
        willpower: 72,
        adaptability: 79,
        overallScore: 75,
      },
      create: {
        id: `pp-${s.id}`,
        studentId: s.id,
        adversityQuotient: 80,
        emotionalStability: 68,
        socialTendency: 75,
        stressResistance: 78,
        selfAwareness: 77,
        empathy: 73,
        willpower: 72,
        adaptability: 79,
        overallScore: 75,
      },
    })
  }

  const timelineTemplates = [
    { date: '2025-09', title: '入学普测完成', description: '联合筛查完成，指标正常', status: 'success' },
    { date: '2025-11', title: '触发预警', description: '情绪波动触发二级预警', status: 'warning' },
    { date: '2025-12', title: '心理咨询面谈', description: '进行 CBT 干预', status: 'success' },
  ]

  for (const s of students) {
    for (let i = 0; i < timelineTemplates.length; i += 1) {
      const t = timelineTemplates[i]
      await prisma.timelineEvent.upsert({
        where: { id: `te-${s.id}-${i + 1}` },
        update: t,
        create: {
          id: `te-${s.id}-${i + 1}`,
          studentId: s.id,
          ...t,
        },
      })
    }
  }

  const workOrders = [
    { id: 'wo-01', studentId: 'stu-chenyuqing', className: '软件2402', trigger: '语音情感异常连续触发', riskLevel: RiskLevel.HIGH, method: 'VR脱敏训练', counselor: '刘芳', status: WorkOrderStatus.PENDING, date: '2026-02-18', detail: '第3次VR训练后焦虑指数下降18%', summary: '连续3次语音检测触发阈值' },
    { id: 'wo-02', studentId: 'stu-zhangmingyuan', className: '网络2401', trigger: '心率持续偏高（>110bpm）', riskLevel: RiskLevel.HIGH, method: '线下谈话', counselor: '张伟', status: WorkOrderStatus.PENDING, date: '2026-02-17', detail: '已安排心理咨询师面谈2次', summary: '心率连续45分钟超过110bpm' },
    { id: 'wo-03', studentId: 'stu-liusiyuan', className: '数媒2401', trigger: '连续7天睡眠不足4小时', riskLevel: RiskLevel.MEDIUM, method: 'VR脱敏训练', counselor: '王丽', status: WorkOrderStatus.PENDING, date: '2026-02-15', detail: '复查正常', summary: '近7日睡眠不足' },
    { id: 'wo-04', studentId: 'stu-wuzhiyuan', className: '大数据2502', trigger: '14天未出宿舍门禁', riskLevel: RiskLevel.HIGH, method: '线下谈话', counselor: '刘芳', status: WorkOrderStatus.PENDING, date: '2026-02-14', detail: '安排团体辅导', summary: '社交隔离' },
    { id: 'wo-05', studentId: 'stu-zhouhangyu', className: '虚拟2503', trigger: '语音颤抖频率超标', riskLevel: RiskLevel.MEDIUM, method: 'VR脱敏训练', counselor: '张伟', status: WorkOrderStatus.PENDING, date: '2026-02-13', detail: '声学指标恢复正常', summary: '语音颤抖频发' },
    { id: 'wo-06', studentId: 'stu-zhaotianyu', className: '信安2401', trigger: '突发心率飙升（145bpm）', riskLevel: RiskLevel.HIGH, method: '线下谈话', counselor: '刘芳', status: WorkOrderStatus.PENDING, date: '2026-02-12', detail: '等待排班安排', summary: '心率激增' },
    { id: 'wo-07', studentId: 'stu-huangsimeng', className: '软件2402', trigger: '食堂消费记录连续7天为零', riskLevel: RiskLevel.MEDIUM, method: '线下谈话', counselor: '王丽', status: WorkOrderStatus.PENDING, date: '2026-02-10', detail: '确认为饮食习惯调整', summary: '进食异常' },
    { id: 'wo-08', studentId: 'stu-linzhihao', className: '大数据2502', trigger: '行动轨迹异常收缩', riskLevel: RiskLevel.LOW, method: 'VR脱敏训练', counselor: '张伟', status: WorkOrderStatus.PENDING, date: '2026-02-08', detail: '解除关注', summary: '步态异常' },
    { id: 'wo-09', studentId: 'stu-wangyuyan', className: '网络2401', trigger: '社交回避行为加剧', riskLevel: RiskLevel.MEDIUM, method: 'VR脱敏训练', counselor: '刘芳', status: WorkOrderStatus.PENDING, date: '2026-02-06', detail: '第二次训练进行中', summary: '社交回避' },
    { id: 'wo-10', studentId: 'stu-zhangyu', className: '大数据2502', trigger: '情绪波动指数持续高位', riskLevel: RiskLevel.MEDIUM, method: '线下谈话', counselor: '王丽', status: WorkOrderStatus.PENDING, date: '2026-02-05', detail: 'CBT 第一阶段', summary: '情绪波动' },
    { id: 'wo-11', studentId: 'stu-chenyuqing', className: '软件2402', trigger: 'VR体验后情绪反弹', riskLevel: RiskLevel.HIGH, method: '线下谈话', counselor: '张伟', status: WorkOrderStatus.IN_PROGRESS, date: '2026-02-20', detail: '需要持续跟踪', summary: '情绪异常' },
    { id: 'wo-12', studentId: 'stu-zhangmingyuan', className: '网络2401', trigger: '宿舍人际关系冲突', riskLevel: RiskLevel.MEDIUM, method: '团体辅导', counselor: '刘芳', status: WorkOrderStatus.IN_PROGRESS, date: '2026-02-19', detail: '已安排宿舍调解', summary: '人际冲突' },
    { id: 'wo-13', studentId: 'stu-liusiyuan', className: '数媒2401', trigger: '期末考压力导致失眠', riskLevel: RiskLevel.MEDIUM, method: '正念训练', counselor: '王丽', status: WorkOrderStatus.COMPLETED, date: '2026-02-16', detail: '已恢复睡眠', summary: '考试焦虑' },
    { id: 'wo-14', studentId: 'stu-wuzhiyuan', className: '大数据2502', trigger: '网络游戏成瘾评估', riskLevel: RiskLevel.LOW, method: '认知行为疗法', counselor: '张伟', status: WorkOrderStatus.COMPLETED, date: '2026-02-11', detail: '已建立健康作息', summary: '网络依赖' },
  ]

  for (const w of workOrders) {
    await prisma.workOrder.upsert({
      where: { id: w.id },
      update: {
        studentId: w.studentId,
        className: w.className,
        trigger: w.trigger,
        riskLevel: w.riskLevel,
        method: w.method,
        counselor: w.counselor,
        status: w.status,
        date: new Date(`${w.date}T00:00:00.000Z`),
        detail: w.detail,
        summary: w.summary,
      },
      create: {
        id: w.id,
        studentId: w.studentId,
        className: w.className,
        trigger: w.trigger,
        riskLevel: w.riskLevel,
        method: w.method,
        counselor: w.counselor,
        status: w.status,
        date: new Date(`${w.date}T00:00:00.000Z`),
        detail: w.detail,
        summary: w.summary,
      },
    })
  }

  const interventionRecords = [
    { id: 'ir-01', studentId: 'stu-zhangyu', date: '2026-02-15', type: InterventionType.REGULAR_INTERVIEW, counselor: '刘芳', duration: '50分钟', result: '状态良好', status: 'completed' },
    { id: 'ir-02', studentId: 'stu-zhangmingyuan', date: '2026-01-20', type: InterventionType.CBT_THERAPY, counselor: '张伟', duration: '60分钟', result: '认知重构进展顺利', status: 'completed' },
    { id: 'ir-03', studentId: 'stu-liusiyuan', date: '2025-12-28', type: InterventionType.GROUP_COUNSELING, counselor: '王丽', duration: '90分钟', result: '社交互动改善', status: 'completed' },
    { id: 'ir-04', studentId: 'stu-zhaotianyu', date: '2025-12-15', type: InterventionType.CRISIS_INTERVENTION, counselor: '刘芳', duration: '45分钟', result: '情绪稳定', status: 'completed' },
    { id: 'ir-05', studentId: 'stu-chenyuqing', date: '2025-11-22', type: InterventionType.INITIAL_ASSESSMENT, counselor: '刘芳', duration: '60分钟', result: '建立干预方案', status: 'completed' },
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

  const scenes = [
    { id: 'scene-social', name: '社交焦虑脱敏', description: '降低社交焦虑', usageCount: 2340 },
    { id: 'scene-exam', name: '考试压力释放', description: '缓解考前压力', usageCount: 1980 },
    { id: 'scene-mindfulness', name: '正念冥想空间', description: '冥想放松', usageCount: 2680 },
    { id: 'scene-release', name: '情绪宣泄训练', description: '情绪管理训练', usageCount: 1432 },
  ]

  for (const sc of scenes) {
    await prisma.vRScene.upsert({
      where: { id: sc.id },
      update: {
        name: sc.name,
        description: sc.description,
        usageCount: sc.usageCount,
      },
      create: sc,
    })
  }

  const vrSessions = [
    { id: 'vrs-01', studentId: 'stu-liusiyuan', sceneId: 'scene-social', duration: '28分钟', emotionBefore: '焦虑', emotionAfter: '平静', result: Sentiment.POSITIVE },
    { id: 'vrs-02', studentId: 'stu-chenyuqing', sceneId: 'scene-exam', duration: '22分钟', emotionBefore: '紧张', emotionAfter: '放松', result: Sentiment.POSITIVE },
    { id: 'vrs-03', studentId: 'stu-zhangmingyuan', sceneId: 'scene-mindfulness', duration: '30分钟', emotionBefore: '烦躁', emotionAfter: '安宁', result: Sentiment.POSITIVE },
    { id: 'vrs-04', studentId: 'stu-wuzhiyuan', sceneId: 'scene-release', duration: '18分钟', emotionBefore: '压抑', emotionAfter: '舒畅', result: Sentiment.POSITIVE },
    { id: 'vrs-05', studentId: 'stu-zhouhangyu', sceneId: 'scene-social', duration: '25分钟', emotionBefore: '回避', emotionAfter: '中性', result: Sentiment.NEUTRAL },
    { id: 'vrs-06', studentId: 'stu-zhaotianyu', sceneId: 'scene-exam', duration: '20分钟', emotionBefore: '焦虑', emotionAfter: '放松', result: Sentiment.POSITIVE },
    { id: 'vrs-07', studentId: 'stu-huangsimeng', sceneId: 'scene-mindfulness', duration: '35分钟', emotionBefore: '低落', emotionAfter: '平和', result: Sentiment.POSITIVE },
    { id: 'vrs-08', studentId: 'stu-linzhihao', sceneId: 'scene-release', duration: '15分钟', emotionBefore: '愤怒', emotionAfter: '中性', result: Sentiment.NEUTRAL },
    { id: 'vrs-09', studentId: 'stu-wangyuyan', sceneId: 'scene-social', duration: '26分钟', emotionBefore: '恐惧', emotionAfter: '平静', result: Sentiment.POSITIVE },
    { id: 'vrs-10', studentId: 'stu-zhangyu', sceneId: 'scene-exam', duration: '19分钟', emotionBefore: '紧张', emotionAfter: '轻松', result: Sentiment.POSITIVE },
  ]

  for (const v of vrSessions) {
    await prisma.vRSession.upsert({
      where: { id: v.id },
      update: {
        studentId: v.studentId,
        sceneId: v.sceneId,
        duration: v.duration,
        emotionBefore: v.emotionBefore,
        emotionAfter: v.emotionAfter,
        result: v.result,
      },
      create: {
        ...v,
        sessionAt: now,
      },
    })
  }

  const devices = [
    { id: 'dev-vr-1', name: 'Pico 4 Enterprise #1', serialNumber: 'P4E202401001', type: DeviceType.VR, model: 'Pico 4 Enterprise', status: DeviceStatus.ONLINE, battery: 85, room: '心理咨询室 A01', location: '心理中心A201', lastActive: '10分钟前', lastSync: '2分钟前' },
    { id: 'dev-vr-2', name: 'Pico 4 Enterprise #2', serialNumber: 'P4E202401002', type: DeviceType.VR, model: 'Pico 4 Enterprise', status: DeviceStatus.IN_USE, battery: 72, room: '心理咨询室 A02', location: '心理中心A202', lastActive: '使用中', lastSync: '实时' },
    { id: 'dev-br-1', name: '小米手环 9 #1', serialNumber: 'MW9202401001', type: DeviceType.BRACELET, model: '小米手环 9', status: DeviceStatus.ONLINE, battery: 92, room: '心理咨询室 A01', location: '学生活动中心 3 层', lastActive: '5分钟前', lastSync: '实时' },
    { id: 'dev-br-2', name: '小米手环 8', serialNumber: 'MW8202401001', type: DeviceType.BRACELET, model: '小米手环 8', status: DeviceStatus.OFFLINE, battery: 12, room: '减压舱 B01', location: '图书馆 2 层', lastActive: '1天前', lastSync: '6小时前' },
    { id: 'dev-eeg-1', name: 'BrainCo Flex #1', serialNumber: 'BCF202401001', type: DeviceType.EEG, model: 'BrainCo Flex', status: DeviceStatus.OFFLINE, battery: null, room: '心理咨询室 A01', location: '心理中心A201', lastActive: '3天前', lastSync: '1天前' },
    { id: 'dev-eeg-2', name: 'BrainCo Flex #2', serialNumber: 'BCF202401002', type: DeviceType.EEG, model: 'BrainCo Flex', status: DeviceStatus.IN_USE, battery: null, room: '心理咨询室 A02', location: '心理中心A202', lastActive: '使用中', lastSync: '实时' },
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

  const rooms = [
    { id: 'room-001', name: '心理咨询室 A01', location: '学生活动中心 3 层', status: RoomStatus.AVAILABLE, capacity: 1, currentStudentId: null },
    { id: 'room-002', name: '心理咨询室 A02', location: '学生活动中心 3 层', status: RoomStatus.IN_USE, capacity: 1, currentStudentId: 'stu-zhangmingyuan' },
    { id: 'room-003', name: '减压舱 B01', location: '图书馆 2 层', status: RoomStatus.AVAILABLE, capacity: 2, currentStudentId: null },
    { id: 'room-004', name: 'VR 体验区 C01', location: '心理健康教育中心', status: RoomStatus.MAINTENANCE, capacity: 1, currentStudentId: null },
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

  const roomDevices = [
    { id: 'rd-1', roomId: 'room-001', deviceId: 'dev-vr-1' },
    { id: 'rd-2', roomId: 'room-001', deviceId: 'dev-br-1' },
    { id: 'rd-3', roomId: 'room-001', deviceId: 'dev-eeg-1' },
    { id: 'rd-4', roomId: 'room-002', deviceId: 'dev-vr-2' },
    { id: 'rd-5', roomId: 'room-002', deviceId: 'dev-eeg-2' },
    { id: 'rd-6', roomId: 'room-003', deviceId: 'dev-br-2' },
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

  const alerts = [
    { id: 'al-01', studentId: 'stu-chenyuqing', type: AlertType.VOICE_TREMOR, level: 'warning', source: 'voice', description: '语音情感异常连续触发' },
    { id: 'al-02', studentId: 'stu-zhangmingyuan', type: AlertType.HEART_RATE_SURGE, level: 'critical', source: 'vitals', description: '心率持续偏高' },
    { id: 'al-03', studentId: 'stu-liusiyuan', type: AlertType.SLEEP_ANOMALY, level: 'warning', source: 'behavior', description: '连续睡眠不足' },
    { id: 'al-04', studentId: 'stu-wuzhiyuan', type: AlertType.SOCIAL_WITHDRAWAL, level: 'critical', source: 'trajectory', description: '社交隔离迹象明显' },
    { id: 'al-05', studentId: 'stu-zhouhangyu', type: AlertType.VOICE_TREMOR, level: 'warning', source: 'voice', description: '语音颤抖频发' },
    { id: 'al-06', studentId: 'stu-zhaotianyu', type: AlertType.HEART_RATE_SURGE, level: 'critical', source: 'vitals', description: '突发心率飙升' },
    { id: 'al-07', studentId: 'stu-huangsimeng', type: AlertType.EATING_ANOMALY, level: 'warning', source: 'behavior', description: '进食异常' },
    { id: 'al-08', studentId: 'stu-linzhihao', type: AlertType.GAIT_ANOMALY, level: 'warning', source: 'gait', description: '步态模式异常' },
    { id: 'al-09', studentId: 'stu-wangyuyan', type: AlertType.EMOTION_SWING, level: 'warning', source: 'expression', description: '情绪波动' },
    { id: 'al-10', studentId: 'stu-zhangyu', type: AlertType.EMOTION_SWING, level: 'warning', source: 'multimodal', description: '情绪指标变化异常' },
  ]

  for (const a of alerts) {
    await prisma.alert.upsert({
      where: { id: a.id },
      update: {
        studentId: a.studentId,
        type: a.type,
        level: a.level,
        source: a.source,
        description: a.description,
        alertTime: now,
      },
      create: {
        ...a,
        alertTime: now,
      },
    })
  }

  for (const [idx, s] of students.entries()) {
    for (let i = 0; i < 6; i += 1) {
      const at = new Date(now.getTime() - (idx * 6 + i) * 60 * 1000)
      await prisma.vitalSign.upsert({
        where: { id: `vs-${s.id}-${i}` },
        update: {
          studentId: s.id,
          timestamp: at,
          heartRate: 68 + (i % 5) * 4,
          hrv: 24 + (i % 4) * 6,
          gsr: 1.5 + i * 0.3,
          stressIndex: 22 + (i % 6) * 8,
          bloodOxygen: 96 + (i % 3),
        },
        create: {
          id: `vs-${s.id}-${i}`,
          studentId: s.id,
          timestamp: at,
          heartRate: 68 + (i % 5) * 4,
          hrv: 24 + (i % 4) * 6,
          gsr: 1.5 + i * 0.3,
          stressIndex: 22 + (i % 6) * 8,
          bloodOxygen: 96 + (i % 3),
        },
      })

      const sentiment = i % 3 === 0 ? Sentiment.POSITIVE : i % 3 === 1 ? Sentiment.NEGATIVE : Sentiment.NEUTRAL
      await prisma.voiceAnalysis.upsert({
        where: { id: `va-${s.id}-${i}` },
        update: {
          studentId: s.id,
          timestamp: at,
          sentiment,
          tremorIndex: 0.08 + i * 0.06,
          emotionLabel: sentiment === Sentiment.POSITIVE ? '轻松' : sentiment === Sentiment.NEGATIVE ? '焦虑' : '专注',
        },
        create: {
          id: `va-${s.id}-${i}`,
          studentId: s.id,
          timestamp: at,
          sentiment,
          tremorIndex: 0.08 + i * 0.06,
          emotionLabel: sentiment === Sentiment.POSITIVE ? '轻松' : sentiment === Sentiment.NEGATIVE ? '焦虑' : '专注',
        },
      })

      await prisma.expressionData.upsert({
        where: { id: `ed-${s.id}-${i}` },
        update: {
          studentId: s.id,
          timestamp: at,
          primaryExpression: i % 2 === 0 ? '微笑' : '皱眉',
          anxietyLevel: 0.1 + i * 0.06,
          sadnessLevel: 0.05 + i * 0.03,
          angerLevel: 0.02 + i * 0.01,
        },
        create: {
          id: `ed-${s.id}-${i}`,
          studentId: s.id,
          timestamp: at,
          primaryExpression: i % 2 === 0 ? '微笑' : '皱眉',
          anxietyLevel: 0.1 + i * 0.06,
          sadnessLevel: 0.05 + i * 0.03,
          angerLevel: 0.02 + i * 0.01,
        },
      })
    }
  }

  const aiDocuments = [
    { id: 'doc-1', name: '危机干预指南（第三版）', fileSize: '2.4 MB', uploadDate: '2025-11-08', status: DocStatus.VECTORIZED, vectorStatus: 'ready' },
    { id: 'doc-2', name: 'CBT疗法手册', fileSize: '1.8 MB', uploadDate: '2025-10-22', status: DocStatus.VECTORIZED, vectorStatus: 'ready' },
    { id: 'doc-3', name: '大学生心理健康评估标准', fileSize: '3.1 MB', uploadDate: '2025-12-01', status: DocStatus.VECTORIZED, vectorStatus: 'ready' },
    { id: 'doc-4', name: '校园危机事件应急预案', fileSize: '0.9 MB', uploadDate: '2026-01-15', status: DocStatus.VECTORIZED, vectorStatus: 'ready' },
    { id: 'doc-5', name: '心理咨询伦理规范', fileSize: '0.7 MB', uploadDate: '2026-02-10', status: DocStatus.PROCESSING, vectorStatus: 'processing' },
  ]

  for (const d of aiDocuments) {
    await prisma.aIDocument.upsert({
      where: { id: d.id },
      update: {
        name: d.name,
        fileSize: d.fileSize,
        uploadDate: new Date(`${d.uploadDate}T00:00:00.000Z`),
        status: d.status,
        vectorStatus: d.vectorStatus,
      },
      create: {
        id: d.id,
        name: d.name,
        fileSize: d.fileSize,
        uploadDate: new Date(`${d.uploadDate}T00:00:00.000Z`),
        status: d.status,
        vectorStatus: d.vectorStatus,
      },
    })
  }

  const presets = [
    { id: 'preset-1', label: '星际面试官', value: 'star-interviewer', promptText: '面向面试压力场景的支持型提示词', isActive: false },
    { id: 'preset-2', label: '日常树洞', value: 'daily-confide', promptText: '日常情绪倾诉支持型提示词', isActive: true },
    { id: 'preset-3', label: '危机干预专家', value: 'crisis-expert', promptText: '危机识别与转介提示词', isActive: false },
    { id: 'preset-4', label: '情感疏导师', value: 'emotional-guide', promptText: '情绪调节与共情提示词', isActive: false },
  ]

  for (const p of presets) {
    await prisma.aIPromptPreset.upsert({
      where: { id: p.id },
      update: {
        label: p.label,
        value: p.value,
        promptText: p.promptText,
        isActive: p.isActive,
      },
      create: p,
    })
  }

  // Seed PsychProfile for all students
  const psychProfiles = [
    { studentId: 'stu-zhangyu', adversityQuotient: 82, emotionalStability: 75, socialTendency: 68, stressResistance: 85, selfAwareness: 78, empathy: 72, willpower: 80, adaptability: 76 },
    { studentId: 'stu-liusiyuan', adversityQuotient: 68, emotionalStability: 62, socialTendency: 75, stressResistance: 70, selfAwareness: 72, empathy: 85, willpower: 65, adaptability: 78 },
    { studentId: 'stu-chenyuqing', adversityQuotient: 55, emotionalStability: 48, socialTendency: 58, stressResistance: 52, selfAwareness: 60, empathy: 65, willpower: 50, adaptability: 55 },
    { studentId: 'stu-zhangmingyuan', adversityQuotient: 72, emotionalStability: 68, socialTendency: 82, stressResistance: 75, selfAwareness: 70, empathy: 78, willpower: 73, adaptability: 80 },
    { studentId: 'stu-wuzhiyuan', adversityQuotient: 48, emotionalStability: 45, socialTendency: 52, stressResistance: 50, selfAwareness: 55, empathy: 58, willpower: 48, adaptability: 52 },
    { studentId: 'stu-zhouhangyu', adversityQuotient: 78, emotionalStability: 72, socialTendency: 85, stressResistance: 80, selfAwareness: 75, empathy: 80, willpower: 78, adaptability: 82 },
    { studentId: 'stu-zhaotianyu', adversityQuotient: 52, emotionalStability: 50, socialTendency: 55, stressResistance: 48, selfAwareness: 58, empathy: 62, willpower: 50, adaptability: 54 },
    { studentId: 'stu-huangsimeng', adversityQuotient: 70, emotionalStability: 75, socialTendency: 72, stressResistance: 68, selfAwareness: 74, empathy: 80, willpower: 72, adaptability: 76 },
    { studentId: 'stu-linzhihao', adversityQuotient: 85, emotionalStability: 82, socialTendency: 78, stressResistance: 88, selfAwareness: 85, empathy: 75, willpower: 86, adaptability: 84 },
    { studentId: 'stu-wangyuyan', adversityQuotient: 65, emotionalStability: 68, socialTendency: 62, stressResistance: 70, selfAwareness: 72, empathy: 78, willpower: 66, adaptability: 70 },
  ]

  for (let i = 0; i < psychProfiles.length; i++) {
    const pp = psychProfiles[i]
    const overallScore = Math.round(
      (pp.adversityQuotient + pp.emotionalStability + pp.socialTendency + 
       pp.stressResistance + pp.selfAwareness + pp.empathy + pp.willpower + pp.adaptability) / 8
    )
    
    await prisma.psychProfile.upsert({
      where: { studentId: pp.studentId },
      update: {
        adversityQuotient: pp.adversityQuotient,
        emotionalStability: pp.emotionalStability,
        socialTendency: pp.socialTendency,
        stressResistance: pp.stressResistance,
        selfAwareness: pp.selfAwareness,
        empathy: pp.empathy,
        willpower: pp.willpower,
        adaptability: pp.adaptability,
        overallScore,
      },
      create: {
        id: `pp-${pp.studentId}`,
        studentId: pp.studentId,
        adversityQuotient: pp.adversityQuotient,
        emotionalStability: pp.emotionalStability,
        socialTendency: pp.socialTendency,
        stressResistance: pp.stressResistance,
        selfAwareness: pp.selfAwareness,
        empathy: pp.empathy,
        willpower: pp.willpower,
        adaptability: pp.adaptability,
        overallScore,
      },
    })
  }

  // Seed TimelineEvents for all students
  const timelineEvents = [
    { studentId: 'stu-zhangyu', date: '2025年9月', title: '入学普测完成', desc: 'SCL-90/SDS/SAS三量表联合筛查，评分正常范围', status: 'success' },
    { studentId: 'stu-zhangyu', date: '2025年10月', title: 'VR脱敏训练（第一期）', desc: '完成社交焦虑VR脱敏训练6次，焦虑指数下降22%', status: 'success' },
    { studentId: 'stu-zhangyu', date: '2026年1月', title: '期末复查', desc: '各项指标恢复正常，情绪稳定性提升18%', status: 'success' },
    { studentId: 'stu-zhangyu', date: '2026年2月', title: '新学期跟踪中', desc: '持续监测中，当前状态良好', status: 'active' },
    { studentId: 'stu-liusiyuan', date: '2025年9月', title: '入学普测完成', desc: 'SCL-90测评显示轻度焦虑倾向', status: 'warning' },
    { studentId: 'stu-liusiyuan', date: '2025年10月', title: 'VR正念训练', desc: '开始VR正念冥想训练，睡眠质量改善', status: 'success' },
    { studentId: 'stu-liusiyuan', date: '2025年12月', title: '定期咨询面谈', desc: '与咨询师建立信任关系，情绪管理能力提升', status: 'success' },
    { studentId: 'stu-liusiyuan', date: '2026年2月', title: '复查评估', desc: '焦虑水平显著下降，继续保持', status: 'success' },
    { studentId: 'stu-chenyuqing', date: '2025年9月', title: '入学普测完成', desc: '测评显示抑郁高风险，触发预警', status: 'warning' },
    { studentId: 'stu-chenyuqing', date: '2025年10月', title: '预警响应', desc: '辅导员关注，转介至心理咨询中心', status: 'warning' },
    { studentId: 'stu-chenyuqing', date: '2025年11月', title: '初次评估', desc: '建立干预方案，开始CBT疗法', status: 'success' },
    { studentId: 'stu-chenyuqing', date: '2025年12月', title: '定期咨询', desc: '认知重构进展顺利，抑郁症状减轻', status: 'success' },
    { studentId: 'stu-chenyuqing', date: '2026年1月', title: '复查评估', desc: '抑郁风险评估降低至中风险', status: 'success' },
    { studentId: 'stu-chenyuqing', date: '2026年2月', title: '持续跟踪', desc: '继续保持CBT疗法，状态稳定', status: 'active' },
    { studentId: 'stu-zhangmingyuan', date: '2025年9月', title: '入学普测完成', desc: '各项指标正常，心理素质良好', status: 'success' },
    { studentId: 'stu-zhangmingyuan', date: '2025年11月', title: '团体辅导', desc: '参加人际沟通团体辅导，社交能力提升', status: 'success' },
    { studentId: 'stu-zhangmingyuan', date: '2026年2月', title: '定期跟踪', desc: '状态保持良好，无需特殊干预', status: 'active' },
    { studentId: 'stu-wuzhiyuan', date: '2025年9月', title: '入学普测完成', desc: '测评显示社交回避倾向', status: 'warning' },
    { studentId: 'stu-wuzhiyuan', date: '2025年10月', title: '宿舍关系问题', desc: '室友反馈沟通困难，辅导员介入', status: 'warning' },
    { studentId: 'stu-wuzhiyuan', date: '2025年11月', title: 'VR社交训练', desc: '开始VR社交焦虑脱敏训练', status: 'success' },
    { studentId: 'stu-wuzhiyuan', date: '2025年12月', title: '团体辅导', desc: '参加社交技能团体辅导', status: 'success' },
    { studentId: 'stu-wuzhiyuan', date: '2026年2月', title: '持续改善', desc: '社交互动有所改善，继续跟踪', status: 'active' },
    { studentId: 'stu-zhouhangyu', date: '2025年9月', title: '入学普测完成', desc: '各项指标优秀，心理素质突出', status: 'success' },
    { studentId: 'stu-zhouhangyu', date: '2025年10月', title: '心理委员培训', desc: '参加班级心理委员培训', status: 'success' },
    { studentId: 'stu-zhouhangyu', date: '2026年2月', title: '健康监测', desc: '状态保持良好', status: 'active' },
    { studentId: 'stu-zhaotianyu', date: '2025年9月', title: '入学普测完成', desc: '测评显示情绪不稳定', status: 'warning' },
    { studentId: 'stu-zhaotianyu', date: '2025年10月', title: '情绪波动预警', desc: '多次情绪爆发，触发预警', status: 'warning' },
    { studentId: 'stu-zhaotianyu', date: '2025年11月', title: '危机干预', desc: '情绪危机干预，建立安全计划', status: 'success' },
    { studentId: 'stu-zhaotianyu', date: '2025年12月', title: '定期咨询', desc: '情绪调节能力有所改善', status: 'success' },
    { studentId: 'stu-zhaotianyu', date: '2026年2月', title: '持续跟踪', desc: '情绪管理仍需关注', status: 'active' },
    { studentId: 'stu-huangsimeng', date: '2025年9月', title: '入学普测完成', desc: '各项指标正常', status: 'success' },
    { studentId: 'stu-huangsimeng', date: '2025年12月', title: '考试压力', desc: '期末考试压力大，参加减压活动', status: 'warning' },
    { studentId: 'stu-huangsimeng', date: '2026年2月', title: '状态恢复', desc: '假期调整，状态恢复良好', status: 'success' },
    { studentId: 'stu-linzhihao', date: '2025年9月', title: '入学普测完成', desc: '各项指标优秀', status: 'success' },
    { studentId: 'stu-linzhihao', date: '2025年11月', title: '运动减压', desc: '参加体育活动和正念训练', status: 'success' },
    { studentId: 'stu-linzhihao', date: '2026年2月', title: '保持健康', desc: '身心状态良好', status: 'active' },
    { studentId: 'stu-wangyuyan', date: '2025年9月', title: '入学普测完成', desc: '轻度社交焦虑', status: 'warning' },
    { studentId: 'stu-wangyuyan', date: '2025年10月', title: 'VR训练', desc: '开始VR社交焦虑脱敏训练', status: 'success' },
    { studentId: 'stu-wangyuyan', date: '2025年12月', title: '改善明显', desc: '社交焦虑显著减轻', status: 'success' },
    { studentId: 'stu-wangyuyan', date: '2026年2月', title: '巩固训练', desc: '继续VR训练，巩固效果', status: 'active' },
  ]

  for (let i = 0; i < timelineEvents.length; i++) {
    const te = timelineEvents[i]
    await prisma.timelineEvent.upsert({
      where: { 
        id: `te-${te.studentId}-${te.date.replace(/[^\w]/g, '')}`,
      },
      update: {
        date: te.date,
        title: te.title,
        description: te.desc,
        status: te.status,
      },
      create: {
        id: `te-${te.studentId}-${te.date.replace(/[^\w]/g, '')}`,
        studentId: te.studentId,
        date: te.date,
        title: te.title,
        description: te.desc,
        status: te.status,
      },
    })
  }

  // 创建管理员账号
  const adminPassword = await hashPassword('admin123')
  await prisma.user.upsert({
    where: { email: 'admin@psytwin.com' },
    update: {},
    create: {
      email: 'admin@psytwin.com',
      name: '系统管理员',
      passwordHash: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  // 创建示例教师账号
  const teacherPassword = await hashPassword('teacher123')
  await prisma.teacher.upsert({
    where: { phone: '13800000001' },
    update: {},
    create: {
      teacherId: 'T0001',
      name: '王老师',
      phone: '13800000001',
      passwordHash: teacherPassword,
      department: '心理咨询中心',
      title: '高级心理咨询师',
      role: 'COUNSELOR',
      status: 'ACTIVE',
      qualifications: ['国家二级心理咨询师', '沙盘游戏治疗师'],
    },
  })

  await prisma.teacher.upsert({
    where: { phone: '13800000002' },
    update: {},
    create: {
      teacherId: 'T0002',
      name: '李老师',
      phone: '13800000002',
      passwordHash: teacherPassword,
      department: '学生工作处',
      title: '心理咨询师',
      role: 'COUNSELOR',
      status: 'ACTIVE',
    },
  })

// 创建示例预约数据
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  
  await prisma.appointment.createMany({
    skipDuplicates: true,
    data: [
      {
        studentId: 'stu-zhangyu',
        teacherId: (await prisma.teacher.findFirst({ where: { teacherId: 'T0001' } }))?.id,
        type: 'COUNSELING',
        date: tomorrow,
        timeSlot: '09:00-09:50',
        status: 'CONFIRMED',
        reason: '焦虑情绪咨询',
      },
      {
        studentId: 'stu-liusiyuan',
        teacherId: (await prisma.teacher.findFirst({ where: { teacherId: 'T0002' } }))?.id,
        type: 'COUNSELING',
        date: tomorrow,
        timeSlot: '14:00-14:50',
        status: 'PENDING',
        reason: '学业压力咨询',
      },
    ].filter(a => a.teacherId),
  })
  
  // 创建咨询师排班
  const teacher1 = await prisma.teacher.findFirst({ where: { teacherId: 'T0001' } })
  const teacher2 = await prisma.teacher.findFirst({ where: { teacherId: 'T0002' } })
  
  if (teacher1) {
    await prisma.schedule.createMany({
      skipDuplicates: true,
      data: [
        { teacherId: teacher1.id, dayOfWeek: 1, startTime: '09:00', endTime: '12:00', isAvailable: true },
        { teacherId: teacher1.id, dayOfWeek: 1, startTime: '14:00', endTime: '17:00', isAvailable: true },
        { teacherId: teacher1.id, dayOfWeek: 2, startTime: '09:00', endTime: '12:00', isAvailable: true },
        { teacherId: teacher1.id, dayOfWeek: 3, startTime: '14:00', endTime: '17:00', isAvailable: true },
        { teacherId: teacher1.id, dayOfWeek: 4, startTime: '09:00', endTime: '12:00', isAvailable: true },
        { teacherId: teacher1.id, dayOfWeek: 5, startTime: '14:00', endTime: '17:00', isAvailable: true },
      ],
    })
  }
  
  if (teacher2) {
    await prisma.schedule.createMany({
      skipDuplicates: true,
      data: [
        { teacherId: teacher2.id, dayOfWeek: 1, startTime: '14:00', endTime: '17:00', isAvailable: true },
        { teacherId: teacher2.id, dayOfWeek: 2, startTime: '09:00', endTime: '12:00', isAvailable: true },
        { teacherId: teacher2.id, dayOfWeek: 3, startTime: '14:00', endTime: '17:00', isAvailable: true },
        { teacherId: teacher2.id, dayOfWeek: 4, startTime: '09:00', endTime: '12:00', isAvailable: true },
        { teacherId: teacher2.id, dayOfWeek: 5, startTime: '14:00', endTime: '17:00', isAvailable: true },
      ],
    })
  }

  console.log('Seed completed successfully.')
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
