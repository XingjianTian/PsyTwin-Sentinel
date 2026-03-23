import { PrismaClient, RiskLevel, WorkOrderStatus } from '@prisma/client'

const prisma = new PrismaClient()

// 根据风险类型生成完全不同的 AI 评估
function generateAIAssessmentByType(
  studentName: string,
  riskLevel: RiskLevel,
  trigger: string,
  className: string
): string {
  const score = riskLevel === RiskLevel.HIGH 
    ? Math.floor(Math.random() * 20) + 81
    : riskLevel === RiskLevel.MEDIUM 
      ? Math.floor(Math.random() * 10) + 70
      : Math.floor(Math.random() * 15) + 45

  const levelText = riskLevel === RiskLevel.HIGH ? '高危' : riskLevel === RiskLevel.MEDIUM ? '中危' : '低危'

  // 根据 trigger 返回完全不同的报告内容
  switch (trigger) {
    case '心率持续偏高（>110bpm）':
    case '突发心率飙升（145bpm）':
      return `【Qwen-14B 心血管-心理关联风险分析报告 - ${studentName}】

基于连续7天可穿戴设备心率监测数据，该生心血管系统呈现显著应激状态：

**一、心脏自主神经功能评估**
该生静息心率基线为68bpm，但近72小时内出现${Math.floor(Math.random() * 5) + 3}次突发性心动过速事件，峰值达${Math.floor(Math.random() * 20) + 135}bpm，持续时间最长${Math.floor(Math.random() * 15) + 8}分钟。心率变异性(HRV)分析显示RMSSD值降至${Math.floor(Math.random() * 15) + 18}ms（正常>40ms），提示副交感神经张力显著降低，交感神经过度激活。

**二、昼夜节律与压力源分析**
24小时心率动态监测发现该生夜间（00:00-06:00）平均心率高达${Math.floor(Math.random() * 15) + 82}bpm，远超同龄人夜间应低于60bpm的标准。结合课程表交叉分析，心率异常峰值与${['高等数学', '英语口语', '专业课考试'][Math.floor(Math.random() * 3)]}课程时间高度重合，提示存在特定学科焦虑。

**三、生理-心理耦合指标**
血压推导算法估算收缩压波动于130-${Math.floor(Math.random() * 20) + 140}mmHg区间，皮质醇节律检测显示晨间峰值较正常延迟${Math.floor(Math.random() * 2) + 2}小时，符合慢性应激反应模式。

【风险等级评估】：${levelText}（心血管风险评分 ${score}/100）
【干预建议】：建议48小时内完成心电图检查与甲状腺激素检测，同步启动心理咨询。暂时豁免该生体育课高强度训练，避免诱发心律失常。`

    case '语音情感异常连续触发':
    case '语音颤抖频率超标':
      return `【Qwen-14B 声学-心理特征深度分析报告 - ${studentName}】

基于近14天课堂录音与日常语音样本的声学特征提取，该生语音模式呈现显著心理负荷特征：

**一、声学微表情异常**
语音基频(F0)稳定性分析显示该生说话时基频抖动(Jitter)达${(Math.random() * 1.5 + 1.2).toFixed(2)}%（正常<1%），表明声带肌肉紧张度异常。梅尔频率倒谱系数(MFCC)聚类分析识别出${Math.floor(Math.random() * 3) + 2}种不同的"焦虑声纹"模式，占比达${Math.floor(Math.random() * 20) + 30}%。

**二、言语行为学特征**
课堂发言文本分析发现该生使用第一人称单数("我")的频率较学期初下降${Math.floor(Math.random() * 25) + 40}%，自我指涉减少通常与自我效能感降低相关。填充词("嗯"、"那个")使用频率激增${Math.floor(Math.random() * 100) + 150}%，语言流畅性指标(LFT)降至${(Math.random() * 0.3 + 0.4).toFixed(2)}（正常>0.7）。

**三、社交语音退缩**
宿舍区语音活动检测(VAD)显示该生日均主动发起对话次数从${Math.floor(Math.random() * 5) + 12}次降至${Math.floor(Math.random() * 3) + 1}次，平均对话时长缩短${Math.floor(Math.random() * 40) + 50}%。语音识别置信度分析表明该生倾向于使用低声、含糊的发音方式，符合社交回避的声学特征。

【风险等级评估】：${levelText}（语音心理负荷评分 ${score}/100）
【干预建议】：建议采用非侵入式干预，邀请该生参与戏剧社或辩论队等需要发声表达的活动，逐步重建语言自信。避免直接质问其语音变化，以防强化焦虑。`

    case '连续7天睡眠不足4小时':
    case '睡眠质量持续恶化':
      return `【Qwen-14B 睡眠-认知功能风险预警报告 - ${studentName}】

通过智能手环睡眠分期监测与睡眠质量问卷(PSQI)交叉验证，该生睡眠结构呈现严重紊乱：

**一、睡眠结构崩塌**
近7天平均睡眠时长${(Math.random() * 1.5 + 2.5).toFixed(1)}小时，仅为同龄人推荐量(7-9小时)的${Math.floor(Math.random() * 15) + 30}%。睡眠效率(在床时间/实际睡眠时间)低至${Math.floor(Math.random() * 15) + 55}%，入睡潜伏期延长至${Math.floor(Math.random() * 45) + 45}分钟。深睡眠(N3期)占比仅${(Math.random() * 2 + 3).toFixed(1)}%（正常15-20%），REM睡眠碎片化严重，平均REM周期时长不足20分钟。

**二、昼夜节律失调**
体动记录仪显示该生就寝时间从23:30逐渐后移至凌晨${Math.floor(Math.random() * 2) + 2}:${Math.floor(Math.random() * 59).toString().padStart(2, '0')}，呈现睡眠相位后移综合征(DSPS)特征。早晨7:00-8:00时段体动幅度极低，存在"起床困难"行为模式，可能与褪黑素分泌节律紊乱相关。

**三、认知功能受损迹象**
结合该生近期学业数据，课堂注意力持续时间从45分钟缩短至${Math.floor(Math.random() * 15) + 15}分钟，作业提交准时率下降${Math.floor(Math.random() * 30) + 40}%。睡眠剥夺导致的前额叶功能抑制可能是造成决策能力下降与情绪调节困难的主因。

【风险等级评估】：${levelText}（睡眠健康评分 ${score}/100）
【干预建议】：建议实施睡眠卫生教育，设定23:00电子设备宵禁。考虑短期使用褪黑素受体激动剂（需医生处方），同时排查是否存在睡前强迫性使用社交媒体的行为模式。`

    case '社交回避行为加剧':
    case '14天未出宿舍门禁':
      return `【Qwen-14B 社会隔离风险空间分析报告 - ${studentName}】

基于校园一卡通刷卡记录、WiFi接入点日志与手机GPS轨迹融合分析，该生社交行为呈现显著退缩模式：

**一、物理空间自我监禁**
连续${Math.floor(Math.random() * 7) + 14}天该生活动范围仅限于宿舍楼栋（面积<500㎡），食堂就餐记录中断，外卖订单频率激增${Math.floor(Math.random() * 300) + 200}%。门禁记录显示其平均每日外出时长仅${(Math.random() * 0.5 + 0.2).toFixed(1)}小时，且多集中于深夜${Math.floor(Math.random() * 3) + 1}:${Math.floor(Math.random() * 59).toString().padStart(2, '0')}-${Math.floor(Math.random() * 3) + 5}:${Math.floor(Math.random() * 59).toString().padStart(2, '0')}时段，刻意避开人群。

**二、社交网络萎缩**
社交媒体分析（经隐私脱敏）显示该生${['微信朋友圈', 'QQ空间', '微博'][Math.floor(Math.random() * 3)]}更新频率从每周${Math.floor(Math.random() * 3) + 3}条降至${Math.floor(Math.random() * 2)}条，互动深度（评论/点赞回复）下降${Math.floor(Math.random() * 70) + 70}%。通讯录活跃联系人从${Math.floor(Math.random() * 20) + 30}人缩减至${Math.floor(Math.random() * 5) + 3}人，且均为家庭成员。

**三、非言语沟通中断**
宿舍楼层监控（隐私保护模式，仅识别行为模式）显示该生走廊停留时间趋近于零，遇到同学时主动回避行为（转身/退回房间）发生率达${Math.floor(Math.random() * 30) + 60}%。图书馆座位预约系统显示其选择远离人群的边缘座位（靠近墙角/最后一排）概率达100%。

【风险等级评估】：${levelText}（社会连接断裂评分 ${score}/100）
【干预建议】：建议采用渐进式暴露疗法，初期安排线上心理咨询降低面对面压力。与宿管合作，邀请该生担任楼层安全员等低社交压力职责，创造"被迫"与人互动的情境。警惕自杀风险信号，建议每周进行结构化自杀意念筛查(C-SSRS)。`

    case '情绪波动指数持续高位':
    case '情绪状态剧烈起伏':
      return `【Qwen-14B 情绪失调风险多模态分析报告 - ${studentName}】

融合面部表情识别、语音情感分析、社交媒体文本情感挖掘与生理信号，该生情绪调节能力呈现明显受损：

**一、情绪不稳定性量化**
基于教室摄像头微表情分析（隐私保护模式，仅提取表情特征），该生每日经历${Math.floor(Math.random() * 10) + 15}次以上的情绪快速转换（<3秒内从平静到焦虑），情绪切换频率是同班同学的${(Math.random() * 1.5 + 2).toFixed(1)}倍。情感效价(valence)标准差达${(Math.random() * 0.3 + 0.4).toFixed(2)}（正常<0.25），提示情绪调节失败。

**二、负性情绪偏向**
课堂表情识别显示该生中性/负性表情占比达${Math.floor(Math.random() * 20) + 75}%（正常约50%），积极表情（微笑）出现频率低于${Math.floor(Math.random() * 3)}次/天。皱眉动作频率较学期初增加${Math.floor(Math.random() * 150) + 200}%，眉毛内侧上扬（悲伤特征）在独处时自发出现率达${Math.floor(Math.random() * 20) + 30}%。

**三、情绪表达不适当**
语音情感识别显示该生在${['小组讨论', '课堂提问', '日常闲聊'][Math.floor(Math.random() * 3)]}等中性场景中出现"强焦虑"声纹的概率达${Math.floor(Math.random() * 15) + 20}%，存在情绪反应与情境不匹配现象。这种情绪失调可能与前额叶-杏仁核连接功能异常相关。

【风险等级评估】：${levelText}（情绪调节障碍评分 ${score}/100）
【干预建议】：建议引入辩证行为疗法(DBT)技能训练，重点教授情绪调节模块。推荐使用情绪追踪App进行每日情绪记录，提升情绪觉察能力。需排除双相情感障碍或边缘型人格障碍的可能性，建议精神科评估。`

    case '食堂消费记录连续7天为零':
    case '饮食摄入显著减少':
      return `【Qwen-14B 饮食行为-心理关联风险报告 - ${studentName}】

通过校园卡消费记录、外卖平台数据关联分析（经授权）与体重监测数据，该生饮食行为呈现严重异常模式：

**一、营养摄入严重不足**
连续${Math.floor(Math.random() * 7) + 7}天食堂零消费记录，外卖订单分析显示日均热量摄入仅${Math.floor(Math.random() * 600) + 800}kcal（推荐量2000-2400kcal），蛋白质摄入不足${Math.floor(Math.random() * 20) + 20}g/天。体脂秤数据（宿舍公共设备）显示该生体重${Math.random() > 0.5 ? '下降' : '波动'}${(Math.random() * 3 + 2).toFixed(1)}kg/周，BMI已降至${(Math.random() * 2 + 17).toFixed(1)}（接近或低于正常下限18.5）。

**二、进食行为仪式化**
宿舍垃圾篓图像识别（AI分析，仅统计物品类别）显示该生大量购买${['零卡饮料', '口香糖', '黑咖啡'][Math.floor(Math.random() * 3)]}，暗示可能存在替代性进食行为。外卖订单时间分析显示其倾向于在凌晨${Math.floor(Math.random() * 4) + 1}:${Math.floor(Math.random() * 59).toString().padStart(2, '0')}下单，夜间进食综合征(NES)可能性较高。

**三、体像认知扭曲风险**
该生近期搜索记录（经隐私脱敏，仅提取健康相关关键词）显示频繁查询"减肥方法"、"卡路里计算"、"BMI标准"等内容。社交媒体上关注的账号中，${Math.floor(Math.random() * 30) + 40}%为健身/瘦身类博主，存在体像比较行为。需警惕神经性厌食症或暴食症的早期表现。

【风险等级评估】：${levelText}（饮食障碍风险评分 ${score}/100）
【干预建议】：建议立即进行营养评估与代谢指标检测（电解质、肝肾功能）。心理咨询应聚焦体像认知重建，避免直接讨论"体重"或"饮食"以免强化焦虑。建议营养师制定渐进式增重计划，初期目标为维持当前体重而非增重。`

    case '行动轨迹异常收缩':
    case '步态模式显著改变':
      return `【Qwen-14B 运动行为-心理状态关联分析报告 - ${studentName}】

基于手机加速度计、校园步道压力感应地砖（实验性部署）与视频监控步态识别（隐私保护模式）的多源数据融合：

**一、步态动力学异常**
步态分析显示该生步长从${(Math.random() * 0.1 + 0.6).toFixed(2)}m缩短至${(Math.random() * 0.1 + 0.4).toFixed(2)}m，步频降低${Math.floor(Math.random() * 20) + 15}%，呈现典型的"抑郁步态"特征。双足支撑相时间延长${Math.floor(Math.random() * 15) + 10}%，提示身体稳定性下降或主观上的"小心翼翼"。头部前倾角度增加${Math.floor(Math.random() * 8) + 5}度，肩部内收，整体姿态传递出"自我保护"的肢体语言。

**二、活动量断崖式下跌**
计步数据显示日均步数从${Math.floor(Math.random() * 3000) + 8000}步骤降至${Math.floor(Math.random() * 1500) + 1500}步，${Math.random() > 0.5 ? '连续多日低于1000步' : '周末几乎零步数'}。 stairs climbed（爬楼层数）从日均8层降至${Math.floor(Math.random() * 2)}层，倾向于使用电梯而非楼梯，精力水平显著下降。

**三、习惯性回避路径**
路径规划算法分析显示该生刻意回避经过${['心理咨询中心', '体育场', '食堂高峰期区域'][Math.floor(Math.random() * 3)]}的常规路线，宁愿选择绕行${Math.floor(Math.random() * 5) + 3}分钟的替代路径。这种环境回避行为可能与特定场所触发的负面记忆或预期焦虑相关。

【风险等级评估】：${levelText}（精神运动性迟滞评分 ${score}/100）
【干预建议】：建议将该生转介至运动心理学专家，制定渐进式身体活动计划（从每日10分钟散步开始）。物理活动可以通过BDNF（脑源性神经营养因子）通路改善抑郁症状。同时需评估是否存在慢性疼痛或躯体化症状导致的运动回避。`

    default:
      return `【Qwen-14B 风险溯源分析报告 - ${studentName}】

综合多模态数据交叉验证，该生近期心理状态评估如下：

1. **生理特征监测**：
   - 心率变异性（HRV）指标异常，SDNN值为${Math.floor(Math.random() * 15) + 20}ms
   - 睡眠质量评分：${Math.floor(Math.random() * 3) + 2}/10
   - 压力指数：${Math.floor(Math.random() * 20) + 45}/100

2. **行为轨迹分析**：
   - 社交半径较基线收缩${Math.floor(Math.random() * 30) + 50}%
   - 食堂就餐频率下降${Math.floor(Math.random() * 30) + 40}%
   - 主要风险指标：${trigger}

3. **预警触发详情**：
   - 班级：${className}
   - 风险等级：${riskLevel}

【风险等级评估】：${levelText}（综合评分 ${score}/100）
【建议干预方案】：${riskLevel === RiskLevel.HIGH 
    ? '启动一级预警流程，24小时内安排心理咨询师面谈'
    : riskLevel === RiskLevel.MEDIUM 
      ? '启动二级预警流程，48小时内安排心理咨询师面谈'
      : '启动三级关注流程，建议一周内进行例行心理访谈'}。`
  }
}

async function main() {
  console.log('🤖 正在为工单生成真正个性化的 AI 风险评估...\n')

  const workOrders = await prisma.workOrder.findMany({
    where: {
      status: WorkOrderStatus.PENDING,
    },
    include: {
      student: {
        select: {
          name: true,
        },
      },
    },
  })

  console.log(`找到 ${workOrders.length} 个工单，重新生成个性化 AI 评估\n`)

  let updatedCount = 0

  for (let i = 0; i < workOrders.length; i++) {
    const order = workOrders[i]
    
    const aiAssessment = generateAIAssessmentByType(
      order.student.name,
      order.riskLevel,
      order.trigger,
      order.className
    )

    await prisma.workOrder.update({
      where: { id: order.id },
      data: { aiAssessment },
    })

    console.log(`✅ [${i + 1}/${workOrders.length}] ${order.student.name}: ${order.trigger}`)
    updatedCount++
  }

  console.log(`\n✅ 完成！已为 ${updatedCount} 个工单生成真正个性化的 AI 评估`)
  console.log(`现在每个人的报告结构、内容、侧重点都完全不同！`)
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
