import { PrismaClient, PostStatus } from '@prisma/client'

const prisma = new PrismaClient()

// 用户提供的 authorId 到实际数据库 ID 的映射
const authorIdMap: Record<string, string> = {
  'u9': 'stu-zhangyu',
  'u10': 'stu-liusiyuan',
  'u11': 'stu-zhouhangyu',
  'u13': 'stu-zhaotianyu',
  'u14': 'stu-wangyuyan',
  'u15': 'stu-zhouhangyu',
  'u16': 'stu-zhangyu',
  'u18': 'stu-linzhihao',
  'u19': 'stu-wuzhiyuan',
  'u20': 'stu-zhangyu',
  'u21': 'stu-zhoujian',
  'u22': 'stu-chenyuqing',
  'u23': 'stu-huangsimeng',
  'u25': 'stu-zhouhangyu',
  'u26': 'stu-liusiyuan',
  'u27': 'stu-zhangyu',
  'u28': 'stu-wangyuyan',
  'teacher_zhang': 't001',
  'teacher_liu': 't002',
  'teacher_wang': 't003',
}

// 用户提供的帖子数据
const postsData = [
  {
    id: 'post_009',
    content: '高数课上的那个定理，老师讲了三遍我还是没懂。后来去问了助教，发现换个角度理解其实很简单。有时候卡住的时候，换个思路就好了。',
    images: ['https://picsum.photos/400/320?random=91'],
    location: '数学楼',
    isAnonymous: false,
    likeCount: 73,
    commentCount: 12,
    shareCount: 3,
    riskScore: 0.1,
    authorId: 'u9',
    createdAt: '2026-03-23T10:00:00Z'
  },
  {
    id: 'post_010',
    content: '和室友吵架了，其实只是一件小事，但积累的委屈突然爆发了。现在冷静下来觉得好后悔，但又不知道该怎么开口道歉。',
    images: [],
    location: null,
    isAnonymous: true,
    likeCount: 112,
    commentCount: 45,
    shareCount: 2,
    riskScore: 0.35,
    authorId: 'u10',
    createdAt: '2026-03-23T12:00:00Z'
  },
  {
    id: 'post_011',
    content: '坚持晨跑第100天！从一开始的气喘吁吁到现在的轻松五公里，运动真的改变了我。推荐给每一个想要改变的同学，从早起开始！🏃‍♂️',
    images: ['https://picsum.photos/400/400?random=111', 'https://picsum.photos/400/350?random=112'],
    location: '操场',
    isAnonymous: false,
    likeCount: 289,
    commentCount: 67,
    shareCount: 34,
    riskScore: 0.05,
    authorId: 'u11',
    createdAt: '2026-03-23T08:00:00Z'
  },
  {
    id: 'post_012',
    content: '【心理小知识】"自我关怀"不是自私，而是像对待好朋友一样对待自己。当你遇到困难时，试着对自己说："这确实很难，我会陪着你一起度过。"',
    images: [],
    location: null,
    isAnonymous: false,
    likeCount: 178,
    commentCount: 29,
    shareCount: 52,
    riskScore: 0.08,
    authorId: 'teacher_zhang',
    createdAt: '2026-03-23T06:00:00Z'
  },
  {
    id: 'post_013',
    content: '图书馆三楼的咖啡店新品不错，今天试了燕麦拿铁。虽然为了考试周熬夜很苦，但一杯好咖啡能让心情好很多。加油，再坚持一周！☕',
    images: ['https://picsum.photos/400/400?random=131'],
    location: '图书馆咖啡厅',
    isAnonymous: false,
    likeCount: 56,
    commentCount: 8,
    shareCount: 1,
    riskScore: 0.15,
    authorId: 'u13',
    createdAt: '2026-03-23T09:00:00Z'
  },
  {
    id: 'post_014',
    content: '发现自己越来越不想社交了，室友约我出去我都找借口推掉。不是不喜欢她们，只是觉得很累，想一个人待着。这是正常的吗？',
    images: [],
    location: null,
    isAnonymous: true,
    likeCount: 198,
    commentCount: 89,
    shareCount: 12,
    riskScore: 0.45,
    authorId: 'u14',
    createdAt: '2026-03-23T11:00:00Z'
  },
  {
    id: 'post_015',
    content: '在琴房待了一下午，终于把这首曲子弹顺了。音乐真的是最好的疗愈，每当心情烦躁的时候，弹弹琴就能平静下来。有没有喜欢音乐的朋友一起交流？🎸',
    images: ['https://picsum.photos/400/450?random=151'],
    location: '音乐楼琴房',
    isAnonymous: false,
    likeCount: 134,
    commentCount: 31,
    shareCount: 8,
    riskScore: 0.12,
    authorId: 'u15',
    createdAt: '2026-03-23T07:00:00Z'
  },
  {
    id: 'post_016',
    content: '实验失败了三次，导师说没关系，科研就是不断试错的过程。虽然有点沮丧，但想想也是，爱因斯坦也失败过很多次对吧？明天继续！🧪',
    images: ['https://picsum.photos/400/380?random=161'],
    location: '实验楼',
    isAnonymous: false,
    likeCount: 87,
    commentCount: 19,
    shareCount: 5,
    riskScore: 0.2,
    authorId: 'u16',
    createdAt: '2026-03-23T05:00:00Z'
  },
  {
    id: 'post_017',
    content: '【考试季心理调适】最近很多同学反映考试焦虑，这是很正常的反应。建议：1) 制定合理复习计划 2) 保证充足睡眠 3) 适当运动 4) 和信任的人聊聊。',
    images: [],
    location: '心理健康中心',
    isAnonymous: false,
    likeCount: 245,
    commentCount: 56,
    shareCount: 78,
    riskScore: 0.1,
    authorId: 'teacher_liu',
    createdAt: '2026-03-22T14:00:00Z'
  },
  {
    id: 'post_018',
    content: '食堂新开的麻辣烫窗口真的绝了！辣得过瘾，汤也好喝。复习了一上午，来一顿好的犒劳自己。食物果然有治愈的力量🍲',
    images: ['https://picsum.photos/400/360?random=181'],
    location: '第三食堂',
    isAnonymous: false,
    likeCount: 201,
    commentCount: 43,
    shareCount: 21,
    riskScore: 0.05,
    authorId: 'u18',
    createdAt: '2026-03-22T12:00:00Z'
  },
  {
    id: 'post_019',
    content: '今天收到了家里的消息，突然很想家。一个人在陌生的城市上学，有时候真的觉得好孤单。还好有这里可以倾诉，谢谢你们听我说话。',
    images: [],
    location: null,
    isAnonymous: true,
    likeCount: 167,
    commentCount: 72,
    shareCount: 6,
    riskScore: 0.4,
    authorId: 'u19',
    createdAt: '2026-03-23T10:30:00Z'
  },
  {
    id: 'post_020',
    content: '傍晚的校园真的太美了，随手一拍都是大片。有时候放慢脚步，才发现身边有这么多美好。分享几张今天拍的夕阳给大家📸',
    images: [
      'https://picsum.photos/400/400?random=201',
      'https://picsum.photos/400/380?random=202',
      'https://picsum.photos/400/420?random=203'
    ],
    location: '钟楼广场',
    isAnonymous: false,
    likeCount: 312,
    commentCount: 48,
    shareCount: 45,
    riskScore: 0.05,
    authorId: 'u20',
    createdAt: '2026-03-23T04:00:00Z'
  },
  {
    id: 'post_021',
    content: 'debugging 了一整天，终于找到 bug 了！原来是一个分号的问题... 虽然很累，但解决问题的成就感真的很棒。继续加油💪',
    images: [],
    location: '机房',
    isAnonymous: false,
    likeCount: 95,
    commentCount: 23,
    shareCount: 7,
    riskScore: 0.15,
    authorId: 'u21',
    createdAt: '2026-03-22T16:00:00Z'
  },
  {
    id: 'post_022',
    content: '觉得自己的努力总是得不到认可，成绩不上不下，也没什么特长。看着身边的人都那么优秀，有时候会怀疑自己的价值...',
    images: [],
    location: null,
    isAnonymous: true,
    likeCount: 223,
    commentCount: 98,
    shareCount: 15,
    riskScore: 0.5,
    authorId: 'u22',
    createdAt: '2026-03-22T18:00:00Z'
  },
  {
    id: 'post_023',
    content: '考完试后终于有时间做瑜伽了，拉伸一下紧绷的身体，感觉整个人都舒展了。推荐大家试试瑜伽，对缓解压力真的很有效🧘‍♀️',
    images: ['https://picsum.photos/400/480?random=231'],
    location: '体育馆瑜伽室',
    isAnonymous: false,
    likeCount: 145,
    commentCount: 27,
    shareCount: 19,
    riskScore: 0.08,
    authorId: 'u23',
    createdAt: '2026-03-23T03:00:00Z'
  },
  {
    id: 'post_024',
    content: '【正念练习】感到焦虑时，试试这个简单的正念练习：闭上眼睛，感受脚掌与地面的接触，注意呼吸的进出，只是观察，不做评判。',
    images: [],
    location: null,
    isAnonymous: false,
    likeCount: 189,
    commentCount: 34,
    shareCount: 61,
    riskScore: 0.1,
    authorId: 'teacher_wang',
    createdAt: '2026-03-23T02:00:00Z'
  },
  {
    id: 'post_025',
    content: '周末和朋友们组了个剧本杀局，烧脑又开心！大家平时学业压力大，偶尔这样聚一聚、玩一玩，真的很放松。还有没有同学想加入我们的局？',
    images: ['https://picsum.photos/400/340?random=251'],
    location: '学生活动中心',
    isAnonymous: false,
    likeCount: 78,
    commentCount: 41,
    shareCount: 9,
    riskScore: 0.05,
    authorId: 'u25',
    createdAt: '2026-03-22T20:00:00Z'
  },
  {
    id: 'post_026',
    content: '恋爱三年分手了，现在看到什么都会想起他。明知道要向前看，但回忆总是不自觉地涌上来。时间真的能治愈一切吗？',
    images: [],
    location: null,
    isAnonymous: true,
    likeCount: 267,
    commentCount: 156,
    shareCount: 23,
    riskScore: 0.55,
    authorId: 'u26',
    createdAt: '2026-03-22T19:00:00Z'
  },
  {
    id: 'post_027',
    content: '距离考研还有不到100天了，每天图书馆-食堂-宿舍三点一线。虽然很辛苦，但想到目标就觉得值得。有没有也在备考的同学，一起加油！📚',
    images: ['https://picsum.photos/400/370?random=271'],
    location: '图书馆自习室',
    isAnonymous: false,
    likeCount: 198,
    commentCount: 67,
    shareCount: 28,
    riskScore: 0.25,
    authorId: 'u27',
    createdAt: '2026-03-22T15:00:00Z'
  },
  {
    id: 'post_028',
    content: '宿舍养的绿萝又发新芽了！每天看着它一点点长大，心情也会变好。养植物真的是一个很治愈的过程，推荐大家试试🌱',
    images: ['https://picsum.photos/400/400?random=281', 'https://picsum.photos/400/380?random=282'],
    location: '宿舍',
    isAnonymous: false,
    likeCount: 123,
    commentCount: 18,
    shareCount: 11,
    riskScore: 0.05,
    authorId: 'u28',
    createdAt: '2026-03-21T10:00:00Z'
  }
]

async function main() {
  console.log('🌱 开始插入瀑布流帖子数据...\n')

  let successCount = 0
  let errorCount = 0

  for (const post of postsData) {
    const authorId = authorIdMap[post.authorId]
    if (!authorId) {
      console.log(`⚠️ 跳过 ${post.id}: 未找到 authorId ${post.authorId} 的映射`)
      errorCount++
      continue
    }

    try {
      await prisma.post.upsert({
        where: { id: post.id },
        update: {
          content: post.content,
          images: post.images,
          location: post.location,
          isAnonymous: post.isAnonymous,
          likeCount: post.likeCount,
          commentCount: post.commentCount,
          riskScore: post.riskScore,
          viewCount: post.shareCount * 10, // 估算浏览量
        },
        create: {
          id: post.id,
          authorId: authorId,
          content: post.content,
          images: post.images,
          location: post.location,
          isAnonymous: post.isAnonymous,
          likeCount: post.likeCount,
          commentCount: post.commentCount,
          riskScore: post.riskScore,
          viewCount: post.shareCount * 10,
          status: PostStatus.ACTIVE,
          createdAt: new Date(post.createdAt),
        },
      })
      console.log(`✅ ${post.id}: ${post.content.substring(0, 30)}...`)
      successCount++
    } catch (e) {
      console.log(`❌ ${post.id}: ${e instanceof Error ? e.message : 'Unknown error'}`)
      errorCount++
    }
  }

  console.log(`\n📊 完成！成功: ${successCount}, 失败: ${errorCount}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
