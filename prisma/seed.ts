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
