/**
 * PsyTwin Pocket 微信小程序 Mock 数据注入脚本
 *
 * 本脚本包含从微信小程序前端提取的所有写死 mock 数据
 * 用于 Sentinel 后端数据库初始化和测试
 *
 * 生成时间: 2026-03-08
 * 数据来源: PsyTwin-Pocket/mock/ 目录下所有 mock 文件
 * 目标数据库: PostgreSQL (via Prisma)
 */

import { 
  PrismaClient,
  RiskLevel,
  StudentStatus,
  TeacherStatus,
  UserRole,
  PostStatus,
  CommentStatus,
  RoomStatus,
  AppointmentStatus,
  SessionStatus,
  MessageStatus,
  WarningStatus,
  AppointmentType,
  SessionType,
  MessageType,
} from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// 1. 院系数据 (Faculty)
// ============================================
const facultiesData = [
  { id: 'faculty_001', name: '计算机学院', campusX: 100, campusY: 200, stressIndex: 0.65, riskLevel: RiskLevel.LOW },
  { id: 'faculty_002', name: '机械学院', campusX: 150, campusY: 250, stressIndex: 0.7, riskLevel: RiskLevel.MEDIUM },
  { id: 'faculty_003', name: '文学院', campusX: 200, campusY: 150, stressIndex: 0.55, riskLevel: RiskLevel.LOW },
  { id: 'faculty_004', name: '艺术学院', campusX: 120, campusY: 180, stressIndex: 0.6, riskLevel: RiskLevel.LOW },
  { id: 'faculty_005', name: '心理健康中心', campusX: 300, campusY: 300, stressIndex: 0.4, riskLevel: RiskLevel.LOW },
];

// ============================================
// 2. 学生数据 (Student)
// ============================================
const studentsData = [
  {
    id: 'stu001',
    name: '小明同学',
    studentNo: '2023001001',
    className: '软件工程 2301 班',
    facultyId: 'faculty_001',
    gender: 'male',
    birthDate: new Date('2004-09-15'),
    mbti: 'INTJ',
    riskLevel: RiskLevel.LOW,
    phone: '13800138001',
    passwordHash: '$2b$10$hashedpassword', // 实际需要 bcrypt 加密
    avatar: 'https://picsum.photos/200/200?random=200',
    nickname: '小明',
    role: 'student',
    status: StudentStatus.ACTIVE,
    badges: [
      {
        id: 1,
        name: '初次咨询',
        icon: 'chat',
        earned: true,
        desc: '完成首次心理咨询',
        earnedAt: '2026-01-10T10:00:00Z',
      },
      {
        id: 2,
        name: 'VR 探索者',
        icon: 'desktop',
        earned: true,
        desc: '体验 VR 心理训练 5 次',
        earnedAt: '2026-02-15T14:30:00Z',
      },
      {
        id: 3,
        name: '坚持打卡',
        icon: 'calendar',
        earned: true,
        desc: '连续记录心情 7 天',
        earnedAt: '2026-02-20T08:00:00Z',
      },
      { id: 4, name: '心理达人', icon: 'star', earned: false, desc: '完成 5 次心理咨询' },
    ],
    stats: {
      counselingCount: 2,
      vrSessionCount: 5,
      assessmentCount: 3,
      totalMinutes: 185,
      lastActiveDate: '2026-03-01',
    },
    settings: {
      theme: 'light',
      notification: true,
      privacy: { anonymousDefault: false },
    },
    joinDate: new Date('2023-09-01'),
  },
  {
    id: 'u1',
    name: '小晶',
    studentNo: '2023001002',
    className: '计算机学院 2302 班',
    facultyId: 'faculty_001',
    gender: 'female',
    birthDate: new Date('2005-03-20'),
    riskLevel: RiskLevel.LOW,
    phone: '13800138002',
    passwordHash: '$2b$10$hashedpassword',
    avatar: 'https://picsum.photos/80/80?random=1',
    nickname: '小晶',
    role: 'student',
    status: StudentStatus.ACTIVE,
    badges: [],
    stats: { counselingCount: 0, vrSessionCount: 2, assessmentCount: 1, totalMinutes: 45 },
    joinDate: new Date('2023-09-01'),
  },
  {
    id: 'u3',
    name: '匿名用户A',
    studentNo: '2023001003',
    className: '文学院 2301 班',
    facultyId: 'faculty_003',
    gender: 'female',
    birthDate: new Date('2004-11-10'),
    riskLevel: RiskLevel.MEDIUM,
    phone: '13800138003',
    passwordHash: '$2b$10$hashedpassword',
    avatar: '',
    nickname: '匿名的你',
    role: 'student',
    status: StudentStatus.ACTIVE,
    badges: [],
    stats: { counselingCount: 1, vrSessionCount: 0, assessmentCount: 2, totalMinutes: 50 },
    joinDate: new Date('2023-09-01'),
  },
  {
    id: 'u4',
    name: '李强',
    studentNo: '2023002001',
    className: '机械学院 2301 班',
    facultyId: 'faculty_002',
    gender: 'male',
    birthDate: new Date('2004-06-15'),
    riskLevel: RiskLevel.LOW,
    phone: '13800138004',
    passwordHash: '$2b$10$hashedpassword',
    avatar: 'https://picsum.photos/80/80?random=4',
    nickname: '阿强',
    role: 'student',
    status: StudentStatus.ACTIVE,
    badges: [],
    stats: { counselingCount: 0, vrSessionCount: 3, assessmentCount: 1, totalMinutes: 60 },
    joinDate: new Date('2023-09-01'),
  },
  {
    id: 'u5',
    name: '张茶',
    studentNo: '2023003001',
    className: '文学院 2302 班',
    facultyId: 'faculty_003',
    gender: 'female',
    birthDate: new Date('2005-01-08'),
    riskLevel: RiskLevel.LOW,
    phone: '13800138005',
    passwordHash: '$2b$10$hashedpassword',
    avatar: 'https://picsum.photos/80/80?random=5',
    nickname: '江南茶',
    role: 'student',
    status: StudentStatus.ACTIVE,
    badges: [],
    stats: { counselingCount: 1, vrSessionCount: 1, assessmentCount: 3, totalMinutes: 90 },
    joinDate: new Date('2023-09-01'),
  },
  {
    id: 'u7',
    name: '王阳光',
    studentNo: '2023004001',
    className: '艺术学院 2301 班',
    facultyId: 'faculty_004',
    gender: 'female',
    birthDate: new Date('2004-08-22'),
    riskLevel: RiskLevel.LOW,
    phone: '13800138006',
    passwordHash: '$2b$10$hashedpassword',
    avatar: 'https://picsum.photos/80/80?random=7',
    nickname: '阳光少女',
    role: 'student',
    status: StudentStatus.ACTIVE,
    badges: [],
    stats: { counselingCount: 0, vrSessionCount: 4, assessmentCount: 2, totalMinutes: 120 },
    joinDate: new Date('2023-09-01'),
  },
  {
    id: 'u8',
    name: '匿名用户B',
    studentNo: '2023001004',
    className: '计算机学院 2303 班',
    facultyId: 'faculty_001',
    gender: 'male',
    birthDate: new Date('2004-12-01'),
    riskLevel: RiskLevel.MEDIUM,
    phone: '13800138007',
    passwordHash: '$2b$10$hashedpassword',
    avatar: '',
    nickname: '匿名的你',
    role: 'student',
    status: StudentStatus.ACTIVE,
    badges: [],
    stats: { counselingCount: 2, vrSessionCount: 1, assessmentCount: 4, totalMinutes: 150 },
    joinDate: new Date('2023-09-01'),
  },
  // 教师端学生管理中的学生
  {
    id: 's2021001',
    name: '张三',
    studentNo: '2021001001',
    className: '计算机 2101 班',
    facultyId: 'faculty_001',
    gender: 'male',
    riskLevel: RiskLevel.HIGH,
    phone: '13800138101',
    passwordHash: '$2b$10$hashed',
    avatar: 'https://picsum.photos/80/80?random=11',
    nickname: '张三',
    role: 'student',
    status: StudentStatus.ACTIVE,
    badges: [],
    stats: {},
    joinDate: new Date('2021-09-01'),
  },
  {
    id: 's2021002',
    name: '李四',
    studentNo: '2021001002',
    className: '计算机 2102 班',
    facultyId: 'faculty_001',
    gender: 'female',
    riskLevel: RiskLevel.HIGH,
    phone: '13800138102',
    passwordHash: '$2b$10$hashed',
    avatar: 'https://picsum.photos/80/80?random=12',
    nickname: '李四',
    role: 'student',
    status: StudentStatus.ACTIVE,
    badges: [],
    stats: {},
    joinDate: new Date('2021-09-01'),
  },
  {
    id: 's2021003',
    name: '王五',
    studentNo: '2021001003',
    className: '机械 2101 班',
    facultyId: 'faculty_002',
    gender: 'male',
    riskLevel: RiskLevel.MEDIUM,
    phone: '13800138103',
    passwordHash: '$2b$10$hashed',
    avatar: 'https://picsum.photos/80/80?random=13',
    nickname: '王五',
    role: 'student',
    status: StudentStatus.ACTIVE,
    badges: [],
    stats: {},
    joinDate: new Date('2021-09-01'),
  },
  {
    id: 's2021004',
    name: '赵六',
    studentNo: '2021001004',
    className: '机械 2102 班',
    facultyId: 'faculty_002',
    gender: 'male',
    riskLevel: RiskLevel.MEDIUM,
    phone: '13800138104',
    passwordHash: '$2b$10$hashed',
    avatar: 'https://picsum.photos/80/80?random=14',
    nickname: '赵六',
    role: 'student',
    status: StudentStatus.ACTIVE,
    badges: [],
    stats: {},
    joinDate: new Date('2021-09-01'),
  },
  {
    id: 's2021005',
    name: '钱七',
    studentNo: '2021001005',
    className: '文学 2101 班',
    facultyId: 'faculty_003',
    gender: 'female',
    riskLevel: RiskLevel.LOW,
    phone: '13800138105',
    passwordHash: '$2b$10$hashed',
    avatar: 'https://picsum.photos/80/80?random=15',
    nickname: '钱七',
    role: 'student',
    status: StudentStatus.ACTIVE,
    badges: [],
    stats: {},
    joinDate: new Date('2021-09-01'),
  },
  {
    id: 's2021006',
    name: '孙八',
    studentNo: '2021001006',
    className: '文学 2102 班',
    facultyId: 'faculty_003',
    gender: 'female',
    riskLevel: RiskLevel.LOW,
    phone: '13800138106',
    passwordHash: '$2b$10$hashed',
    avatar: 'https://picsum.photos/80/80?random=16',
    nickname: '孙八',
    role: 'student',
    status: StudentStatus.ACTIVE,
    badges: [],
    stats: {},
    joinDate: new Date('2021-09-01'),
  },
];

// ============================================
// 3. 心理档案数据 (PsychProfile)
// ============================================
const psychProfilesData = [
  {
    id: 'pp001',
    studentId: 'stu001',
    adversityQuotient: 75,
    emotionalStability: 82,
    socialTendency: 88,
    stressResistance: 68,
    selfAwareness: 78,
    empathy: 85,
    willpower: 70,
    adaptability: 80,
    overallScore: 78,
  },
  {
    id: 'pp002',
    studentId: 'u3',
    adversityQuotient: 55,
    emotionalStability: 48,
    socialTendency: 60,
    stressResistance: 45,
    selfAwareness: 65,
    empathy: 70,
    willpower: 55,
    adaptability: 58,
    overallScore: 57,
  },
];

// ============================================
// 4. 教师数据 (Teacher)
// ============================================
const teachersData = [
  {
    id: 't001',
    teacherId: 'T2021001',
    name: '王老师',
    nickname: '心理老师王',
    phone: '13800138000',
    passwordHash: '$2b$10$hashedpassword',
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
      { name: '优秀咨询师', earned: true, icon: 'lock-on' },
      { name: '金牌导师', earned: true, icon: 'user' },
      { name: '心理达人', earned: true, icon: 'heart' },
      { name: '十佳教师', earned: false, icon: 'lock-on' },
    ],
    role: UserRole.COUNSELOR,
    status: StudentStatus.ACTIVE,
  },
  {
    id: 'u2',
    teacherId: 'T2021002',
    name: '李心理',
    nickname: '心理老师李',
    phone: '13800138008',
    passwordHash: '$2b$10$hashedpassword',
    avatar: 'https://picsum.photos/80/80?random=6',
    department: '心理健康中心',
    title: '注册心理师',
    qualifications: ['注册心理师', '国家三级心理咨询师'],
    workStats: {
      totalCounseling: 156,
      totalHours: 210,
      thisMonthCounseling: 18,
      satisfactionRate: 4.7,
    },
    badges: [],
    role: UserRole.COUNSELOR,
    status: StudentStatus.ACTIVE,
  },
];

// ============================================
// 5. 心墙帖子数据 (Post)
// ============================================
const postsData = [
  {
    id: 'post_001',
    authorId: 'u1',
    content:
      '期末复习第三天，看书看得眼睛都花了。出来操场转了一圈，改变环境后发现脑子好像清醒了一些！小友伴们期末努力！',
    images: ['https://picsum.photos/400/300?random=11'],
    location: '校园操场',
    isAnonymous: false,
    tags: ['期末', '学习', '正能量'],
    likeCount: 38,
    commentCount: 7,
    riskScore: 0.15,
    viewCount: 156,
    status: StudentStatus.ACTIVE,
  },
  {
    id: 'post_002',
    authorId: 'u1',
    content:
      '【小贴士】当你感到压力山大的时候，试试 4-7-8 呼吸法：吸气 4 秒 → 屏气 7 秒 → 呼气 8 秒。反复 4 次，就能快速缓解焦虑。希望这个小方法能帮到大家✨',
    images: [],
    location: '',
    isAnonymous: false,
    tags: ['心理健康', '减压', '小贴士'],
    likeCount: 126,
    commentCount: 23,
    riskScore: 0.05,
    viewCount: 892,
    status: StudentStatus.ACTIVE,
  },
  {
    id: 'post_003',
    authorId: 'u3',
    content: '不知道为什么就是心里沉甸甸的，什么都不想做，但又不知道能跟谁说。发出来只是想让自己轻松一点。',
    images: [],
    location: '',
    isAnonymous: true,
    tags: ['情绪', '树洞'],
    likeCount: 89,
    commentCount: 31,
    riskScore: 0.55,
    viewCount: 234,
    status: StudentStatus.ACTIVE,
  },
  {
    id: 'post_004',
    authorId: 'u4',
    content: '兄弟们刚打完一场球！汗流浃背但超开心，还是运动能让人忘却烦恼。建议压力大的同学都去打球，真的很解压！',
    images: ['https://picsum.photos/400/500?random=44'],
    location: '体育馆',
    isAnonymous: false,
    tags: ['运动', '解压', '正能量'],
    likeCount: 52,
    commentCount: 9,
    riskScore: 0.1,
    viewCount: 178,
    status: StudentStatus.ACTIVE,
  },
  {
    id: 'post_005',
    authorId: 'u5',
    content:
      '读了一本关于放下的书，主人公说"我不需要别人的认可，只需要我自己的认可"。这句话不知道为什么看得我非常感动。',
    images: ['https://picsum.photos/400/280?random=55'],
    location: '图书馆',
    isAnonymous: false,
    tags: ['阅读', '感悟', '成长'],
    likeCount: 67,
    commentCount: 14,
    riskScore: 0.2,
    viewCount: 245,
    status: StudentStatus.ACTIVE,
  },
  {
    id: 'post_006',
    authorId: 'u1',
    content:
      '【这周公开课】"与情绪和谐相处" 将于本周四下午 3 点在学活中心 101 开课，免费开放。我们一起探讨如何识别负面情绪并与之共处，而不是进行压抑。欢迎预约✨',
    images: [],
    location: '学活中心 101',
    isAnonymous: false,
    tags: ['公开课', '情绪管理', '活动'],
    likeCount: 203,
    commentCount: 41,
    riskScore: 0.05,
    viewCount: 1024,
    status: StudentStatus.ACTIVE,
  },
  {
    id: 'post_007',
    authorId: 'u7',
    content: '今天展出了自己画了半年的作品，老师说暴露自己是一种勇气。我想是的。创作一直是我排解不安的方式。',
    images: ['https://picsum.photos/400/460?random=77'],
    location: '艺术展览馆',
    isAnonymous: false,
    tags: ['艺术', '创作', '成长'],
    likeCount: 44,
    commentCount: 6,
    riskScore: 0.18,
    viewCount: 132,
    status: StudentStatus.ACTIVE,
  },
  {
    id: 'post_008',
    authorId: 'u8',
    content:
      '考前第一次失眠，脑子躺在床上数羊数到一千万都还没睡着。甚至开始分析出考试是设计来考验人的心理承受能力的结论。你们这次期末有没有这样的时刻？',
    images: [],
    location: '',
    isAnonymous: true,
    tags: ['考前焦虑', '失眠', '求助'],
    likeCount: 156,
    commentCount: 58,
    riskScore: 0.45,
    viewCount: 567,
    status: StudentStatus.ACTIVE,
  },
];

// ============================================
// 6. 评论数据 (Comment)
// ============================================
const commentsData = [
  {
    id: 'c1',
    postId: 'post_001',
    authorId: 'u4',
    parentId: null,
    replyToId: null,
    content: '加油！期末必过！',
    likeCount: 5,
    status: StudentStatus.ACTIVE,
  },
  {
    id: 'c2',
    postId: 'post_001',
    authorId: 'u5',
    parentId: null,
    replyToId: null,
    content: '我也在操场，怎么没看到你？',
    likeCount: 2,
    status: StudentStatus.ACTIVE,
  },
  {
    id: 'r1',
    postId: 'post_001',
    authorId: 'u1',
    parentId: 'c1',
    replyToId: 'u4',
    content: '谢谢强哥！',
    likeCount: 0,
    status: StudentStatus.ACTIVE,
  },
];

// ============================================
// 7. 帖子点赞数据 (PostLike)
// ============================================
const postLikesData = [
  { postId: 'post_001', studentId: 'stu001', createdAt: new Date() },
  { postId: 'post_001', studentId: 'u4', createdAt: new Date() },
  { postId: 'post_001', studentId: 'u5', createdAt: new Date() },
  { postId: 'post_002', studentId: 'stu001', createdAt: new Date() },
  { postId: 'post_002', studentId: 'u1', createdAt: new Date() },
  { postId: 'post_002', studentId: 'u3', createdAt: new Date() },
  { postId: 'post_002', studentId: 'u4', createdAt: new Date() },
  { postId: 'post_003', studentId: 'u1', createdAt: new Date() },
  { postId: 'post_003', studentId: 'u4', createdAt: new Date() },
  { postId: 'post_003', studentId: 'u5', createdAt: new Date() },
  { postId: 'post_003', studentId: 'u7', createdAt: new Date() },
];

// ============================================
// 8. 帖子收藏数据 (PostCollection)
// ============================================
const postCollectionsData = [
  { postId: 'post_002', studentId: 'stu001', collectedAt: new Date() },
  { postId: 'post_002', studentId: 'u1', collectedAt: new Date() },
  { postId: 'post_005', studentId: 'stu001', collectedAt: new Date() },
  { postId: 'post_006', studentId: 'u4', collectedAt: new Date() },
  { postId: 'post_007', studentId: 'u5', collectedAt: new Date() },
];

// ============================================
// 9. 咨询室/预约服务数据 (ConsultationRoom)
// ============================================
const consultationRoomsData = [
  {
    id: 'room_001',
    name: '心理咨询室 A01',
    location: '学生活动中心 3 层',
    status: RoomStatus.AVAILABLE,
    capacity: 2,
  },
  {
    id: 'room_002',
    name: '心理咨询室 A02',
    location: '学生活动中心 3 层',
    status: RoomStatus.IN_USE,
    capacity: 2,
  },
  {
    id: 'room_003',
    name: 'VR 减压舱 B01',
    location: '图书馆 2 层',
    status: RoomStatus.AVAILABLE,
    capacity: 1,
  },
  {
    id: 'room_004',
    name: 'VR 体验区 C01',
    location: '心理健康教育中心',
    status: RoomStatus.MAINTENANCE,
    capacity: 1,
  },
  {
    id: 'room_005',
    name: '团体活动室 D01',
    location: '学生活动中心 305',
    status: RoomStatus.AVAILABLE,
    capacity: 10,
  },
];

// ============================================
// 10. 预约数据 (Appointment)
// ============================================
const appointmentsData = [
  {
    id: 'apt_001',
    studentId: 'stu001',
    teacherId: 't001',
    roomId: 'room_001',
    type: AppointmentType.COUNSELING,
    date: new Date('2026-03-08'),
    timeSlot: '14:00',
    status: AppointmentStatus.PENDING,
    reason: '最近睡眠质量较差，想了解改善方法',
    cancelReason: null,
    meetingLink: null,
    feedbackScore: null,
    feedbackContent: null,
  },
  {
    id: 'apt_002',
    studentId: 'stu001',
    teacherId: null,
    roomId: 'room_003',
    type: AppointmentType.VR,
    date: new Date('2026-03-06'),
    timeSlot: '15:00',
    status: AppointmentStatus.CONFIRMED,
    reason: 'VR放松训练',
    cancelReason: null,
    meetingLink: null,
    feedbackScore: null,
    feedbackContent: null,
  },
  {
    id: 'apt_003',
    studentId: 'stu001',
    teacherId: 'u2',
    roomId: 'room_002',
    type: AppointmentType.COUNSELING,
    date: new Date('2026-02-20'),
    timeSlot: '10:00',
    status: AppointmentStatus.COMPLETED,
    reason: '考前焦虑，情绪管理',
    cancelReason: null,
    meetingLink: null,
    feedbackScore: 5,
    feedbackContent: '李老师很专业，给了我很多实用的建议',
  },
  {
    id: 'apt_004',
    studentId: 'stu001',
    teacherId: null,
    roomId: 'room_004',
    type: AppointmentType.VR,
    date: new Date('2026-02-10'),
    timeSlot: '14:30',
    status: AppointmentStatus.CANCELLED,
    reason: '设备维护',
    cancelReason: '设备维护中，无法使用',
    meetingLink: null,
    feedbackScore: null,
    feedbackContent: null,
  },
];

// ============================================
// 11. 聊天会话数据 (ChatSession)
// ============================================
const chatSessionsData = [
  {
    id: 'session_001',
    studentId: 'stu001',
    type: SessionType.AI,
    title: 'PsyTwin 树洞助手',
    targetId: 'ai-assistant',
    targetName: 'PsyTwin 树洞助手',
    targetAvatar: 'https://picsum.photos/100/100?random=100',
    lastMessage: '你好！有什么我可以帮你的吗？',
    unreadCount: 1,
    status: StudentStatus.ACTIVE,
  },
  {
    id: 'session_002',
    studentId: 'stu001',
    type: SessionType.COUNSELOR,
    title: '咨询师小明',
    targetId: 't001',
    targetName: '王老师',
    targetAvatar: 'https://picsum.photos/100/100?random=101',
    lastMessage: '好的，我们下次咨询时间定为周三上午可以吗？',
    unreadCount: 0,
    status: StudentStatus.ACTIVE,
  },
];

// ============================================
// 12. 聊天消息数据 (ChatMessage)
// ============================================
const chatMessagesData = [
  {
    id: 'msg_001',
    sessionId: 'session_001',
    senderId: 'ai-assistant',
    type: MessageType.TEXT,
    content: '你好！我是 PsyTwin 树洞助手，有什么可以帮助你的吗？',
    seq: 1,
    emotionTag: null,
    status: MessageStatus.READ,
    isRead: true,
    createdAt: new Date('2026-03-01T10:00:00Z'),
  },
  {
    id: 'msg_002',
    sessionId: 'session_001',
    senderId: 'stu001',
    type: MessageType.TEXT,
    content: '最近感觉有点焦虑...',
    seq: 2,
    emotionTag: 'anxious',
    status: MessageStatus.READ,
    isRead: true,
    createdAt: new Date('2026-03-01T10:00:00Z'),
  },
  {
    id: 'msg_003',
    sessionId: 'session_001',
    senderId: 'ai-assistant',
    type: MessageType.TEXT,
    content: '焦虑是一种正常的情绪反应。能具体说说是什么让你感到焦虑吗？',
    seq: 3,
    emotionTag: null,
    status: MessageStatus.READ,
    isRead: false,
    createdAt: new Date('2026-03-01T10:00:00Z'),
  },
];

// ============================================
// 13. 预警数据 (Warning)
// ============================================
const warningsData = [
  {
    id: 'w1',
    studentId: 's2021001',
    riskLevel: RiskLevel.HIGH,
    riskReason: '聊天中出现自伤倾向关键词',
    triggerSource: 'chat',
    triggerContent: '我觉得活着好累，不知道还有什么意义',
    status: AppointmentStatus.PENDING,
    assignedTo: 't001',
    lastAction: null,
    notes: '',
  },
  {
    id: 'w2',
    studentId: 's2021002',
    riskLevel: RiskLevel.HIGH,
    riskReason: '连续3天情绪评分低于-0.8',
    triggerSource: 'assessment',
    triggerContent: null,
    status: WarningStatus.PROCESSING,
    assignedTo: 't001',
    lastAction: JSON.stringify({ type: 'message', content: '已发送关怀消息', time: '2026-03-06T14:30:00Z' }),
    notes: '已联系学生，情况暂时稳定',
  },
  {
    id: 'w3',
    studentId: 's2021003',
    riskLevel: RiskLevel.MEDIUM,
    riskReason: '周活跃度下降60%，发布负面动态',
    triggerSource: 'post',
    triggerContent: '最近什么都不想做，感觉生活没有意义',
    status: AppointmentStatus.PENDING,
    assignedTo: 't001',
    lastAction: null,
    notes: '',
  },
  {
    id: 'w4',
    studentId: 's2021004',
    riskLevel: RiskLevel.MEDIUM,
    riskReason: '连续一周情绪标签为"焦虑"',
    triggerSource: 'chat',
    triggerContent: null,
    status: WarningStatus.RESOLVED,
    assignedTo: 't001',
    lastAction: JSON.stringify({ type: 'appointment', content: '已预约3月7日咨询', time: '2026-03-05T19:00:00Z' }),
    notes: '学生已接受咨询预约',
  },
  {
    id: 'w5',
    studentId: 's2021005',
    riskLevel: RiskLevel.LOW,
    riskReason: '情绪波动较大',
    triggerSource: 'behavior',
    triggerContent: null,
    status: AppointmentStatus.PENDING,
    assignedTo: 't001',
    lastAction: null,
    notes: '',
  },
  {
    id: 'w6',
    studentId: 's2021006',
    riskLevel: RiskLevel.LOW,
    riskReason: '睡眠质量下降',
    triggerSource: 'assessment',
    triggerContent: null,
    status: AppointmentStatus.PENDING,
    assignedTo: 't001',
    lastAction: null,
    notes: '',
  },
];

// ============================================
// 14. 学生通知数据 (StudentNotification)
// ============================================
const notificationsData = [
  {
    id: 'notif_001',
    studentId: 'stu001',
    type: 'APPOINTMENT',
    title: '预约成功',
    content: '您预约的 3月8日 心理咨询室 A01 已确认',
    actionUrl: '/pages/appointment/index',
    isRead: false,
    readAt: null,
    createdAt: new Date(),
  },
  {
    id: 'notif_002',
    studentId: 'stu001',
    type: 'SYSTEM',
    title: '欢迎使用 PsyTwin',
    content: '感谢注册 PsyTwin，开始您的心理健康之旅吧！',
    actionUrl: null,
    isRead: true,
    readAt: new Date('2026-03-01T10:00:00Z'),
    createdAt: new Date(),
  },
  {
    id: 'notif_003',
    studentId: 'stu001',
    type: 'POST',
    title: '你的动态收到新评论',
    content: '小晶评论了你的动态：加油！',
    actionUrl: '/pages/post-detail/index?id=post_001',
    isRead: false,
    readAt: null,
    createdAt: new Date(),
  },
];

// ============================================
// 15. 排班数据 (Schedule)
// ============================================
const schedulesData = [
  {
    id: 'sch_001',
    teacherId: 't001',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '12:00',
    isAvailable: true,
    maxAppointments: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sch_002',
    teacherId: 't001',
    dayOfWeek: 1,
    startTime: '14:00',
    endTime: '17:00',
    isAvailable: true,
    maxAppointments: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sch_003',
    teacherId: 't001',
    dayOfWeek: 2,
    startTime: '09:00',
    endTime: '12:00',
    isAvailable: true,
    maxAppointments: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sch_004',
    teacherId: 't001',
    dayOfWeek: 2,
    startTime: '14:00',
    endTime: '17:00',
    isAvailable: true,
    maxAppointments: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sch_005',
    teacherId: 't001',
    dayOfWeek: 3,
    startTime: '09:00',
    endTime: '12:00',
    isAvailable: true,
    maxAppointments: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sch_006',
    teacherId: 't001',
    dayOfWeek: 4,
    startTime: '14:00',
    endTime: '17:00',
    isAvailable: true,
    maxAppointments: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sch_007',
    teacherId: 't001',
    dayOfWeek: 5,
    startTime: '09:00',
    endTime: '12:00',
    isAvailable: true,
    maxAppointments: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'sch_008',
    teacherId: 't001',
    dayOfWeek: 5,
    startTime: '14:00',
    endTime: '17:00',
    isAvailable: true,
    maxAppointments: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ============================================
// 主函数：执行数据注入
// ============================================
async function main() {
  console.log('🌱 开始注入 PsyTwin Pocket Mock 数据...\n');

  try {
    // 1. 插入院系数据（使用 upsert 避免冲突）
    console.log('📚 插入院系数据...');
    for (const data of facultiesData) {
      await prisma.faculty.upsert({
        where: { id: data.id },
        update: {},
        create: data,
      });
    }
    console.log(`✅ 插入/更新 ${facultiesData.length} 条院系数据`);

    // 2. 插入学生数据
    console.log('👨‍🎓 插入学生数据...');
    for (const data of studentsData) {
      await prisma.student.upsert({
        where: { id: data.id },
        update: {},
        create: data,
      });
    }
    console.log(`✅ 插入/更新 ${studentsData.length} 条学生数据`);

    // 3. 插入心理档案数据
    console.log('🧠 插入心理档案数据...');
    for (const data of psychProfilesData) {
      await prisma.psychProfile.upsert({
        where: { id: data.id },
        update: {},
        create: data,
      });
    }
    console.log(`✅ 插入/更新 ${psychProfilesData.length} 条心理档案数据`);

    // 4. 插入教师数据
    console.log('👩‍🏫 插入教师数据...');
    for (const data of teachersData) {
      await prisma.teacher.upsert({
        where: { id: data.id },
        update: {},
        create: data,
      });
    }
    console.log(`✅ 插入/更新 ${teachersData.length} 条教师数据`);

    // 5. 插入帖子数据
    console.log('📝 插入心墙帖子数据...');
    for (const data of postsData) {
      await prisma.post.upsert({
        where: { id: data.id },
        update: {},
        create: data,
      });
    }
    console.log(`✅ 插入/更新 ${postsData.length} 条帖子数据`);

    // 6. 插入评论数据
    console.log('💬 插入评论数据...');
    for (const data of commentsData) {
      await prisma.comment.upsert({
        where: { id: data.id },
        update: {},
        create: data,
      });
    }
    console.log(`✅ 插入/更新 ${commentsData.length} 条评论数据`);

    // 7. 插入点赞数据（使用 createMany 跳过重复）
    console.log('❤️ 插入点赞数据...');
    let postLikesInserted = 0;
    for (const data of postLikesData) {
      try {
        await prisma.postLike.create({ data });
        postLikesInserted++;
      } catch (e) {
        // 忽略重复错误
      }
    }
    console.log(`✅ 插入 ${postLikesInserted} 条新点赞数据`);

    // 8. 插入收藏数据
    console.log('⭐ 插入收藏数据...');
    let postCollectionsInserted = 0;
    for (const data of postCollectionsData) {
      try {
        await prisma.postCollection.create({ data });
        postCollectionsInserted++;
      } catch (e) {
        // 忽略重复错误
      }
    }
    console.log(`✅ 插入 ${postCollectionsInserted} 条新收藏数据`);

    // 9. 插入咨询室数据
    console.log('🏥 插入咨询室数据...');
    for (const data of consultationRoomsData) {
      await prisma.consultationRoom.upsert({
        where: { id: data.id },
        update: {},
        create: data,
      });
    }
    console.log(`✅ 插入/更新 ${consultationRoomsData.length} 条咨询室数据`);

    // 10. 插入预约数据
    console.log('📅 插入预约数据...');
    for (const data of appointmentsData) {
      await prisma.appointment.upsert({
        where: { id: data.id },
        update: {},
        create: data,
      });
    }
    console.log(`✅ 插入/更新 ${appointmentsData.length} 条预约数据`);

    // 11. 插入聊天会话数据
    console.log('💭 插入聊天会话数据...');
    for (const data of chatSessionsData) {
      await prisma.chatSession.upsert({
        where: { id: data.id },
        update: {},
        create: data,
      });
    }
    console.log(`✅ 插入/更新 ${chatSessionsData.length} 条聊天会话数据`);

    // 12. 插入聊天消息数据
    console.log('📨 插入聊天消息数据...');
    for (const data of chatMessagesData) {
      await prisma.chatMessage.upsert({
        where: { id: data.id },
        update: {},
        create: data,
      });
    }
    console.log(`✅ 插入/更新 ${chatMessagesData.length} 条聊天消息数据`);

    // 13. 插入预警数据
    console.log('⚠️ 插入预警数据...');
    for (const data of warningsData) {
      await prisma.warning.upsert({
        where: { id: data.id },
        update: {},
        create: data,
      });
    }
    console.log(`✅ 插入/更新 ${warningsData.length} 条预警数据`);

    // 14. 插入通知数据
    console.log('🔔 插入通知数据...');
    for (const data of notificationsData) {
      await prisma.studentNotification.upsert({
        where: { id: data.id },
        update: {},
        create: data,
      });
    }
    console.log(`✅ 插入/更新 ${notificationsData.length} 条通知数据`);

    // 15. 插入排班数据
    console.log('📆 插入排班数据...');
    for (const data of schedulesData) {
      await prisma.schedule.upsert({
        where: { id: data.id },
        update: {},
        create: data,
      });
    }
    console.log(`✅ 插入/更新 ${schedulesData.length} 条排班数据`);

    console.log('\n🎉 所有 Mock 数据注入完成！');
    console.log('\n📊 数据汇总：');
    console.log(`   - 院系: ${facultiesData.length}`);
    console.log(`   - 学生: ${studentsData.length}`);
    console.log(`   - 教师: ${teachersData.length}`);
    console.log(`   - 帖子: ${postsData.length}`);
    console.log(`   - 评论: ${commentsData.length}`);
    console.log(`   - 点赞: ${postLikesData.length} (新插入: ${postLikesInserted})`);
    console.log(`   - 收藏: ${postCollectionsData.length} (新插入: ${postCollectionsInserted})`);
    console.log(`   - 咨询室: ${consultationRoomsData.length}`);
    console.log(`   - 预约: ${appointmentsData.length}`);
    console.log(`   - 聊天会话: ${chatSessionsData.length}`);
    console.log(`   - 聊天消息: ${chatMessagesData.length}`);
    console.log(`   - 预警: ${warningsData.length}`);
    console.log(`   - 通知: ${notificationsData.length}`);
    console.log(`   - 排班: ${schedulesData.length}`);
  } catch (error) {
    console.error('❌ 数据注入失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行主函数
main();
