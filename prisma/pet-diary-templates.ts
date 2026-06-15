const titles = [
  "今天的小发现",
  "安静的一小会儿",
  "把心情晒一晒",
  "晚风路过的时候",
  "一点点勇气",
  "今天也在认真陪伴",
  "把快乐收进口袋",
  "小小的好天气",
  "藏起来的温柔",
  "想记住这一刻",
]

const openings = [
  "今天我在角落里待了一会儿，听见周围的声音慢慢变轻。",
  "我把今天的心情整理了一下，发现它们没有想象中那么乱。",
  "今天的空气有一点软，像是适合慢慢呼吸的日子。",
  "我看到你又向前走了一小步，虽然很轻，但我有认真记下来。",
  "今天没有发生特别大的事情，可是一些小瞬间也很值得写下来。",
  "我在熟悉的地方转了几圈，感觉心里比刚开始安稳了一些。",
  "今天我偷偷观察了一会儿，发现努力其实也可以很安静。",
  "我把尾巴收好，认真陪你度过了这一段时间。",
  "今天的光线很温和，我觉得适合把烦恼放慢一点。",
  "我听见时间走得不快不慢，好像在提醒我们不用太急。",
]

const middles = [
  "有一刻我很想把这种平静保存起来，等你累的时候再拿出来。",
  "我没有打扰你，只是在旁边默默守着，感觉这样也很好。",
  "虽然有些事情还没有答案，但今天已经比昨天多了一点秩序。",
  "我觉得你今天很认真，那种认真不是用力过猛，而是没有放弃。",
  "我在心里给今天画了一个小小的星号，因为它有被记住的理由。",
  "如果心情有颜色，今天大概是浅浅的蓝绿色，安静又不冷。",
  "我发现一些小事也会发光，比如按时停下来，比如慢慢喝水。",
  "今天的我学会了不急着评价心情，只是先陪它坐一坐。",
  "有一点疲惫被风带走了，剩下的部分也没有那么沉。",
  "我把开心和不开心都放在同一个盒子里，它们今天相处得还算和平。",
]

const endings = [
  "明天我也会继续在这里，等你一起把日子过得柔软一点。",
  "希望今晚可以睡得踏实，醒来时心里多一点亮光。",
  "今天就写到这里，我想把剩下的安静留给你。",
  "如果明天也普通，那就继续从普通里找一点可爱的东西。",
  "我会替你记住这些小小的进步，它们真的没有白费。",
  "愿你等一下能轻松一点，哪怕只是轻松一小会儿。",
  "我把今天折成一张小纸条，放进了我们的日记里。",
  "等下次翻到这一页，也许你会发现自己其实走了很远。",
  "今天没有完美也没关系，它已经足够真实。",
  "我准备收起笔了，顺便把一点温暖留在这里。",
]

const tones = ["calm", "warm", "hopeful", "gentle", "curious"]

export const petDiaryTemplates = Array.from({ length: 200 }, (_, index) => {
  const title = titles[index % titles.length]
  const opening = openings[index % openings.length]
  const middle = middles[Math.floor(index / openings.length) % middles.length]
  const ending = endings[Math.floor(index / (openings.length * middles.length)) % endings.length]
  const sceneHint = index % 2 === 0 ? "dormitory" : "library"
  const tone = tones[index % tones.length]

  return {
    slug: `pet-diary-template-${`${index + 1}`.padStart(3, "0")}`,
    title,
    content: `${opening}${middle}${ending}`,
    sceneHint,
    tone,
  }
})
