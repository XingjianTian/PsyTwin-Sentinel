/**
 * PsyTwin Pocket 扩展数据种子
 * 为小程序提供 Mock 数据
 */

import { PrismaClient, RiskLevel, AppointmentType, AppointmentStatus, WarningStatus, PostStatus, SessionType, MessageType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const now = new Date()
  console.log('Start seeding Pocket extensions...')

  // ==========================================
  // 1. 创建教师账号
  // ==========================================
  const teachers = [
    {
      id: 'teacher-wang',
      teacherId: 'T2021001',
      name: '王老师',
      phone: '13800138001',
      avatar: 'https://picsum.photos/80/80?random=99',
      department: '心理健康中心',
      title: '国家二级心理咨询师',
      qualifications: ['国家二级心理咨询师', '注册心理师', '沙盘游戏治疗师'],
      workStats: {
        totalCounseling: 186,
        totalHours: 248,
        thisMonthCounseling: 23,
        satisfactionRate: 4.8,
      },
      badges: [
        { name: '优秀咨询师', earned: true },
        { name: '金牌导师', earned: true },
        { name: '心理达人', earned: true },
        { name: '十佳教师', earned: false },
      ],
    },
    {
      id: 'teacher-li',
      teacherId: 'T2021002',
      name: '李老师',
      phone: '13800138002',
      avatar: 'https://picsum.photos/80/80?random=98',
      department: '心理健康中心',
      title: '高级心理咨询师',
      qualifications: ['国家二级心理咨询师', '认知行为治疗师'],
      workStats: {
        totalCounseling: 142,
        totalHours: 189,
        thisMonthCounseling: 18,
        satisfactionRate: 4.9,
      },
      badges: [
        { name: '优秀咨询师', earned: true },
        { name: '金牌导师', earned: false },
      ],
    },
    {
      id: 'teacher-zhang',
      teacherId: 'T2021003',
      name: '张老师',
      phone: '13800138003',
      avatar: 'https://picsum.photos/80/80?random=97',
      department: '学生工作处',
      title: '心理教师',
      qualifications: ['国家三级心理咨询师'],
      workStats: {
        totalCounseling: 89,
        totalHours: 118,
        thisMonthCounseling: 12,
        satisfactionRate: 4.7,
      },
      badges: [
        { name: '心理达人', earned: true },
      ],
    },
  ]

  for (const t of teachers) {
    await prisma.teacher.upsert({
      where: { id: t.id },
      update: {
        name: t.name,
        avatar: t.avatar,
        department: t.department,
        title: t.title,
        qualifications: t.qualifications,
        workStats: t.workStats,
        badges: t.badges,
      },
      create: {
        ...t,
        createdAt: now,
      },
    })
  }
  console.log('✓ Teachers seeded')

  // ==========================================
  // 2. 更新学生数据（添加 phone/avatar/nickname）
  // ==========================================
  const studentProfiles = [
    {
      id: 'stu-zhangyu',
      phone: '13900001001',
      avatar: 'https://picsum.photos/80/80?random=1',
      nickname: '小雨',
      badges: [
        { id: 1, name: '初次咨询', icon: 'chat', earned: true },
        { id: 2, name: 'VR探索者', icon: 'desktop', earned: true },
        { id: 3, name: '坚持打卡', icon: 'calendar', earned: true },
        { id: 4, name: '心理达人', icon: 'star', earned: false },
      ],
      stats: {
        counselingCount: 3,
        vrSessionCount: 5,
        totalMinutes: 280,
        assessmentCount: 2,
      },
    },
    {
      id: 'stu-liusiyuan',
      phone: '13900001002',
      avatar: 'https://picsum.photos/80/80?random=2',
      nickname: '思源',
      badges: [
        { id: 1, name: '初次咨询', icon: 'chat', earned: true },
        { id: 2, name: 'VR探索者', icon: 'desktop', earned: true },
        { id: 3, name: '坚持打卡', icon: 'calendar', earned: false },
        { id: 4, name: '心理达人', icon: 'star', earned: false },
      ],
      stats: {
        counselingCount: 2,
        vrSessionCount: 3,
        totalMinutes: 180,
        assessmentCount: 1,
      },
    },
    {
      id: 'stu-chenyuqing',
      phone: '13900001003',
      avatar: 'https://picsum.photos/80/80?random=3',
      nickname: '晴儿',
      badges: [
        { id: 1, name: '初次咨询', icon: 'chat', earned: true },
        { id: 2, name: 'VR探索者', icon: 'desktop', earned: false },
        { id: 3, name: '坚持打卡', icon: 'calendar', earned: false },
        { id: 4, name: '心理达人', icon: 'star', earned: false },
      ],
      stats: {
        counselingCount: 1,
        vrSessionCount: 1,
        totalMinutes: 120,
        assessmentCount: 3,
      },
    },
  ]

  for (const sp of studentProfiles) {
    await prisma.student.update({
      where: { id: sp.id },
      data: {
        phone: sp.phone,
        avatar: sp.avatar,
        nickname: sp.nickname,
        badges: sp.badges,
        stats: sp.stats,
      },
    })
  }
  console.log('✓ Student profiles updated')

  // ==========================================
  // 3. 创建预约数据
  // ==========================================
  const appointments = [
    {
      id: 'apt-001',
      studentId: 'stu-zhangyu',
      teacherId: 'teacher-wang',
      type: AppointmentType.COUNSELING,
      date: new Date('2026-03-07'),
      timeSlot: '09:00-09:50',
      status: AppointmentStatus.CONFIRMED,
      reason: '学业压力咨询',
    },
    {
      id: 'apt-002',
      studentId: 'stu-liusiyuan',
      teacherId: 'teacher-wang',
      type: AppointmentType.COUNSELING,
      date: new Date('2026-03-07'),
      timeSlot: '10:30-11:20',
      status: AppointmentStatus.CONFIRMED,
      reason: '人际关系困扰',
    },
    {
      id: 'apt-003',
      studentId: 'stu-chenyuqing',
      teacherId: 'teacher-li',
      type: AppointmentType.COUNSELING,
      date: new Date('2026-03-06'),
      timeSlot: '14:00-14:50',
      status: AppointmentStatus.COMPLETED,
      reason: '情绪管理',
    },
    {
      id: 'apt-004',
      studentId: 'stu-zhangyu',
      teacherId: null,
      type: AppointmentType.VR,
      date: new Date('2026-03-06'),
      timeSlot: '15:00-15:30',
      status: AppointmentStatus.COMPLETED,
      reason: '放松训练',
    },
    {
      id: 'apt-005',
      studentId: 'stu-liusiyuan',
      teacherId: 'teacher-wang',
      type: AppointmentType.COUNSELING,
      date: new Date('2026-03-08'),
      timeSlot: '16:00-16:50',
      status: AppointmentStatus.PENDING,
      reason: '职业规划咨询',
    },
  ]

  for (const apt of appointments) {
    await prisma.appointment.upsert({
      where: { id: apt.id },
      update: apt,
      create: {
        ...apt,
        createdAt: now,
      },
    })
  }
  console.log('✓ Appointments seeded')

  // ==========================================
  // 4. 创建心墙动态
  // ==========================================
  const posts = [
    {
      id: 'post-001',
      authorId: 'stu-zhangyu',
      content: '期末复习第三天，看书看得眼睛都花了。出来操场转了一圈，改变环境后发现脑子好像清醒了一些！小伙伴们期末加油！',
      images: ['https://picsum.photos/400/300?random=11'],
      location: '校园操场',
      isAnonymous: false,
      tags: ['study', 'mood'],
      likeCount: 38,
      commentCount: 7,
      riskScore: 0.2,
    },
    {
      id: 'post-002',
      authorId: 'stu-liusiyuan',
      content: '【小贴士】当你感到压力山大的时候，试试 4-7-8 呼吸法：吸气 4 秒 → 憋气 7 秒 → 呼气 8 秒。反复 4 次，就能快速平息焦虑感。希望这个小方法能帮到大家✨',
      images: [],
      location: '',
      isAnonymous: false,
      tags: ['emotion', 'tips'],
      likeCount: 126,
      commentCount: 23,
      riskScore: 0.1,
    },
    {
      id: 'post-003',
      authorId: 'stu-chenyuqing',
      content: '不知道为什么就是心里沉甸甸的，什么都不想做，但又不知道能跟谁说。发出来只是想让自己轻松一点。',
      images: [],
      location: '',
      isAnonymous: true,
      tags: ['emotion'],
      likeCount: 12,
      commentCount: 15,
      riskScore: 0.7,
    },
    {
      id: 'post-004',
      authorId: 'stu-zhangyu',
      content: '今天去做了VR放松训练，感觉真的很神奇！戴上头盔就进入了海边场景，听着海浪声，焦虑感慢慢消失了。推荐大家也试试～',
      images: ['https://picsum.photos/400/300?random=12', 'https://picsum.photos/400/300?random=13'],
      location: 'VR体验中心',
      isAnonymous: false,
      tags: ['life', 'vr'],
      likeCount: 45,
      commentCount: 8,
      riskScore: 0.15,
    },
  ]

  for (const post of posts) {
    await prisma.post.upsert({
      where: { id: post.id },
      update: post,
      create: {
        ...post,
        createdAt: new Date(now.getTime() - Math.random() * 86400000 * 7),
      },
    })
  }
  console.log('✓ Posts seeded')

  // ==========================================
  // 5. 创建聊天会话和消息
  // ==========================================
  const chatSessions = [
    {
      id: 'session-001',
      studentId: 'stu-zhangyu',
      type: SessionType.AI,
      title: 'PsyTwin 树洞助手',
      lastMessage: '谢谢你分享这些，我会一直在这里支持你',
      unreadCount: 0,
    },
    {
      id: 'session-002',
      studentId: 'stu-zhangyu',
      type: SessionType.COUNSELOR,
      title: '咨询师王老师',
      lastMessage: '下周同一时间我们继续',
      unreadCount: 1,
    },
  ]

  for (const session of chatSessions) {
    await prisma.chatSession.upsert({
      where: { id: session.id },
      update: session,
      create: {
        ...session,
        createdAt: now,
        lastMessageAt: now,
      },
    })
  }

  const chatMessages = [
    {
      id: 'msg-001',
      sessionId: 'session-001',
      senderId: 'user',
      type: MessageType.TEXT,
      content: '最近总是睡不着，脑子里想很多事情',
      emotionTag: '😰焦虑',
    },
    {
      id: 'msg-002',
      sessionId: 'session-001',
      senderId: 'ai',
      type: MessageType.TEXT,
      content: '听起来你最近压力很大呢。失眠确实会让人更焦虑。你愿意分享一下具体在担心什么吗？',
    },
    {
      id: 'msg-003',
      sessionId: 'session-001',
      senderId: 'ai',
      type: MessageType.CBT_CARD,
      content: '试试这个呼吸练习，可以帮助放松',
      cbtCard: {
        type: 'relaxation',
        title: '4-7-8 呼吸法',
        content: '吸气4秒 → 憋气7秒 → 呼气8秒',
        action: '开始练习',
      },
    },
    {
      id: 'msg-004',
      sessionId: 'session-002',
      senderId: 'user',
      type: MessageType.TEXT,
      content: '王老师，我想预约下次咨询',
    },
    {
      id: 'msg-005',
      sessionId: 'session-002',
      senderId: 'teacher-wang',
      type: MessageType.TEXT,
      content: '好的，下周三下午2点可以吗？',
    },
  ]

  for (const msg of chatMessages) {
    await prisma.chatMessage.upsert({
      where: { id: msg.id },
      update: msg,
      create: {
        ...msg,
        createdAt: new Date(now.getTime() - Math.random() * 3600000),
      },
    })
  }
  console.log('✓ Chat data seeded')

  // ==========================================
  // 6. 创建心理风险预警
  // ==========================================
  const warnings = [
    {
      id: 'warn-001',
      studentId: 'stu-chenyuqing',
      riskLevel: RiskLevel.HIGH,
      riskReason: '聊天中出现自伤倾向关键词',
      triggerSource: 'CHAT',
      triggerContent: '最近总是想着如果消失了会不会更好',
      status: WarningStatus.PENDING,
      assignedTo: 'teacher-wang',
      lastAction: null,
    },
    {
      id: 'warn-002',
      studentId: 'stu-zhangmingyuan',
      riskLevel: RiskLevel.HIGH,
      riskReason: '连续3天情绪评分低于-0.8',
      triggerSource: 'ASSESSMENT',
      triggerContent: null,
      status: WarningStatus.PROCESSING,
      assignedTo: 'teacher-wang',
      lastAction: {
        type: 'message',
        content: '已发送关怀消息',
        time: '2026-03-06T14:30:00',
      },
    },
    {
      id: 'warn-003',
      studentId: 'stu-liusiyuan',
      riskLevel: RiskLevel.MEDIUM,
      riskReason: '周活跃度下降60%，发布负面动态',
      triggerSource: 'POST',
      triggerContent: '不知道为什么就是心里沉甸甸的',
      status: WarningStatus.PENDING,
      assignedTo: null,
      lastAction: null,
    },
    {
      id: 'warn-004',
      studentId: 'stu-zhangyu',
      riskLevel: RiskLevel.LOW,
      riskReason: '情绪波动较大',
      triggerSource: 'BEHAVIOR',
      triggerContent: null,
      status: WarningStatus.RESOLVED,
      assignedTo: 'teacher-li',
      lastAction: {
        type: 'appointment',
        content: '已预约3月7日咨询',
        time: '2026-03-05T19:00:00',
      },
    },
  ]

  for (const w of warnings) {
    await prisma.warning.upsert({
      where: { id: w.id },
      update: w,
      create: {
        ...w,
        createdAt: new Date(now.getTime() - Math.random() * 86400000 * 2),
      },
    })
  }
  console.log('✓ Warnings seeded')

  // ==========================================
  // 7. 创建教师排班
  // ==========================================
  const schedules = [
    // 王老师排班
    { teacherId: 'teacher-wang', dayOfWeek: 1, startTime: '09:00', endTime: '12:00', isAvailable: true },
    { teacherId: 'teacher-wang', dayOfWeek: 1, startTime: '14:00', endTime: '17:00', isAvailable: true },
    { teacherId: 'teacher-wang', dayOfWeek: 2, startTime: '09:00', endTime: '12:00', isAvailable: true },
    { teacherId: 'teacher-wang', dayOfWeek: 2, startTime: '14:00', endTime: '17:00', isAvailable: true },
    { teacherId: 'teacher-wang', dayOfWeek: 3, startTime: '09:00', endTime: '12:00', isAvailable: true },
    { teacherId: 'teacher-wang', dayOfWeek: 4, startTime: '14:00', endTime: '17:00', isAvailable: true },
    { teacherId: 'teacher-wang', dayOfWeek: 5, startTime: '09:00', endTime: '12:00', isAvailable: true },
    { teacherId: 'teacher-wang', dayOfWeek: 5, startTime: '14:00', endTime: '17:00', isAvailable: true },
    // 李老师排班
    { teacherId: 'teacher-li', dayOfWeek: 1, startTime: '14:00', endTime: '17:00', isAvailable: true },
    { teacherId: 'teacher-li', dayOfWeek: 2, startTime: '09:00', endTime: '12:00', isAvailable: true },
    { teacherId: 'teacher-li', dayOfWeek: 3, startTime: '14:00', endTime: '17:00', isAvailable: true },
    { teacherId: 'teacher-li', dayOfWeek: 4, startTime: '09:00', endTime: '12:00', isAvailable: true },
    { teacherId: 'teacher-li', dayOfWeek: 5, startTime: '14:00', endTime: '17:00', isAvailable: true },
  ]

  for (let i = 0; i < schedules.length; i++) {
    const s = schedules[i]
    await prisma.schedule.upsert({
      where: { id: `sch-${s.teacherId}-${s.dayOfWeek}-${i}` },
      update: s,
      create: {
        id: `sch-${s.teacherId}-${s.dayOfWeek}-${i}`,
        ...s,
        createdAt: now,
      },
    })
  }
  console.log('✓ Schedules seeded')

  console.log('\\n🎉 Pocket extensions seed completed!')
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
