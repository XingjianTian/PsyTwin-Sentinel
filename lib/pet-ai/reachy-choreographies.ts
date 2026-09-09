export const REACHY_CHOREOGRAPHY_KINDS = ["emotion", "dance", "music"] as const

export type ReachyChoreographyKind = (typeof REACHY_CHOREOGRAPHY_KINDS)[number]

export type ReachyChoreographyItem = {
  name: string
  label: string
  emoji: string
  kind: ReachyChoreographyKind
}

const emotionNames = [
  "fear1", "exhausted1", "loving1", "dance3", "boredom2", "relief1", "anxiety1",
  "disgusted1", "welcoming1", "impatient1", "sad1", "helpful2", "resigned1", "amazed1",
  "thoughtful2", "lost1", "surprised1", "serenity1", "displeased1", "incomprehensible2",
  "irritated2", "yes_sad1", "dance2", "understanding1", "contempt1", "inquiring1", "rage1",
  "attentive2", "no1", "oops1", "proud3", "reprimand3", "reprimand2", "scared1",
  "no_excited1", "come1", "proud2", "success1", "enthusiastic2", "laughing1", "dying1",
  "success2", "enthusiastic1", "curious1", "laughing2", "tired1", "reprimand1", "proud1",
  "grateful1", "frustrated1", "calming1", "attentive1", "furious1", "oops2", "irritated1",
  "yes1", "confused1", "understanding2", "dance1", "shy1", "inquiring2", "uncertain1",
  "thoughtful1", "surprised2", "displeased2", "impatient2", "welcoming2", "indifferent1",
  "sad2", "helpful1", "lonely1", "cheerful1", "inquiring3", "downcast1", "sleep1",
  "boredom1", "uncomfortable1", "go_away1", "electric1", "relief2", "no_sad1",
] as const

const danceNames = [
  "stumble_and_recover", "chin_lead", "head_tilt_roll", "jackson_square", "pendulum_swing",
  "side_glance_flick", "grid_snap", "simple_nod", "side_to_side_sway", "polyrhythm_combo",
  "interwoven_spirals", "uh_huh_tilt", "chicken_peck", "yeah_nod", "headbanger_combo",
  "side_peekaboo", "dizzy_spin", "neck_recoil", "groovy_sway_and_roll", "sharp_side_tilt",
] as const

const musicNames = [
  "beyonce-single-ladies", "demon-hunters-1", "eagles-hotel-california", "eminem-lose-yourself",
  "feel-the-magic-in-the-air", "katy-perry-fireworks", "las-ketchup", "michael-jackson-thriller",
  "paint-it-black", "pharrell-williams-happy", "queen-we-will-rock-you", "spice-girls",
  "the-fratellis-whistle-for-the-choir", "the-white-stripes-seven-nation-army",
] as const

const emotionPresentation: Record<string, [string, string]> = {
  fear: ["害怕", "😨"], exhausted: ["疲惫", "😩"], loving: ["喜爱", "🥰"], dance: ["舞动", "💃"],
  boredom: ["无聊", "🥱"], relief: ["释然", "😌"], anxiety: ["焦虑", "😟"], disgusted: ["厌恶", "🤢"],
  welcoming: ["欢迎", "👋"], impatient: ["不耐烦", "⏳"], sad: ["难过", "😢"], helpful: ["乐于帮助", "🙋"],
  resigned: ["无奈", "😞"], amazed: ["惊叹", "🤩"], thoughtful: ["思考", "🤔"], lost: ["迷茫", "😵‍💫"],
  surprised: ["惊讶", "😲"], serenity: ["平静", "🧘"], displeased: ["不悦", "😒"],
  incomprehensible: ["不理解", "🤷"], irritated: ["恼火", "😠"], yes_sad: ["含泪答应", "🥹"],
  understanding: ["理解", "💡"], contempt: ["不屑", "🙄"], inquiring: ["询问", "❓"], rage: ["愤怒", "😡"],
  attentive: ["专注", "👂"], no: ["拒绝", "👎"], oops: ["糟糕", "😅"], proud: ["自豪", "😎"],
  reprimand: ["劝诫", "🚫"], scared: ["惊恐", "😱"], no_excited: ["坚决拒绝", "🙅"], come: ["招手", "🫴"],
  success: ["成功", "✨"], enthusiastic: ["热情", "🥳"], laughing: ["大笑", "😂"], dying: ["晕倒", "😵"],
  curious: ["好奇", "🧐"], tired: ["困倦", "😴"], grateful: ["感谢", "🙏"], frustrated: ["沮丧", "😫"],
  calming: ["安抚", "☮️"], furious: ["暴怒", "🤬"], yes: ["赞同", "👍"], confused: ["困惑", "😕"],
  shy: ["害羞", "😳"], uncertain: ["犹豫", "🤨"], indifferent: ["冷淡", "😐"], lonely: ["孤独", "🥺"],
  cheerful: ["开心", "😊"], downcast: ["低落", "😔"], sleep: ["睡觉", "💤"], uncomfortable: ["不适", "😬"],
  go_away: ["请离开", "👉"], electric: ["活力", "⚡"], no_sad: ["伤心拒绝", "😥"],
}

const dancePresentation: Record<string, [string, string]> = {
  stumble_and_recover: ["踉跄恢复", "🫨"], chin_lead: ["下巴领舞", "🎭"], head_tilt_roll: ["摇头滚动", "🔃"],
  jackson_square: ["杰克逊方步", "🕴️"], pendulum_swing: ["钟摆摇摆", "🎐"], side_glance_flick: ["侧目轻甩", "👁️"],
  grid_snap: ["机械定格", "🤖"], simple_nod: ["轻轻点头", "😌"], side_to_side_sway: ["左右摇摆", "🌊"],
  polyrhythm_combo: ["复合节奏", "🥁"], interwoven_spirals: ["交织螺旋", "🌀"], uh_huh_tilt: ["会意侧倾", "😏"],
  chicken_peck: ["小鸡啄米", "🐓"], yeah_nod: ["庆祝点头", "🙌"], headbanger_combo: ["摇滚甩头", "🤘"],
  side_peekaboo: ["侧身躲猫猫", "🙈"], dizzy_spin: ["眩晕旋转", "💫"], neck_recoil: ["颈部弹动", "⚡"],
  groovy_sway_and_roll: ["律动摇滚", "🪩"], sharp_side_tilt: ["快速侧倾", "📐"],
}

const musicPresentation: Record<string, [string, string]> = {
  "beyonce-single-ladies": ["Single Ladies", "💍"], "demon-hunters-1": ["Demon Hunters", "👹"],
  "eagles-hotel-california": ["Hotel California", "🌴"], "eminem-lose-yourself": ["Lose Yourself", "🎤"],
  "feel-the-magic-in-the-air": ["Magic in the Air", "✨"], "katy-perry-fireworks": ["Firework", "🎆"],
  "las-ketchup": ["Las Ketchup", "🍅"], "michael-jackson-thriller": ["Thriller", "🧟"],
  "paint-it-black": ["Paint It Black", "🖤"], "pharrell-williams-happy": ["Happy", "😀"],
  "queen-we-will-rock-you": ["We Will Rock You", "👑"], "spice-girls": ["Spice Girls", "🎀"],
  "the-fratellis-whistle-for-the-choir": ["Whistle for the Choir", "🎻"],
  "the-white-stripes-seven-nation-army": ["Seven Nation Army", "⚔️"],
}

function emotionItem(name: string): ReachyChoreographyItem {
  const match = name.match(/^(.*?)(\d+)$/)
  const base = match?.[1] || name
  const variant = Number(match?.[2] || 1)
  const [label, emoji] = emotionPresentation[base] || [base.replaceAll("_", " "), "🙂"]
  return { name, kind: "emotion", emoji, label: variant > 1 ? `${label} ${variant}` : label }
}

function choreographyItem(name: string, kind: "dance" | "music"): ReachyChoreographyItem {
  const [label, emoji] = (kind === "dance" ? dancePresentation : musicPresentation)[name]
  return { name, kind, label, emoji }
}

export const REACHY_EMOTIONS = emotionNames.map(emotionItem)
export const REACHY_DANCES = [
  ...danceNames.map((name) => choreographyItem(name, "dance")),
  ...musicNames.map((name) => choreographyItem(name, "music")),
]

export const REACHY_CHOREOGRAPHY_NAMES = {
  emotion: emotionNames,
  dance: danceNames,
  music: musicNames,
} as const
