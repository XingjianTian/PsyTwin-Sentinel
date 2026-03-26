/**
 * 活动地图 2x3 网格路径系统 (2行3列)
 * 6个交叉点作为 agent 移动路径点
 * 布局：3列 x 2行
 */

export type GridPoint = {
  x: number
  y: number
  id: number
}

// 2x3 六宫格坐标（百分比）- 2行3列
// 布局：
// 0 — 1 — 2  (第一行/上)
// |   |   |
// 3 — 4 — 5  (第二行/下)
export const GRID_POINTS: GridPoint[] = [
  { x: 15, y: 35, id: 0 }, // 左上
  { x: 50, y: 35, id: 1 }, // 中上
  { x: 85, y: 35, id: 2 }, // 右上
  { x: 15, y: 75, id: 3 }, // 左下
  { x: 50, y: 75, id: 4 }, // 中下
  { x: 85, y: 75, id: 5 }, // 右下
]

// 网格连接关系（哪些点之间可以直接移动）
export const GRID_CONNECTIONS: Record<number, number[]> = {
  0: [1, 3],
  1: [0, 2, 4],
  2: [1, 5],
  3: [0, 4],
  4: [1, 3, 5],
  5: [2, 4],
}

// 各智能体活动区域（可用的点位列表）
export const AGENT_ZONES: Record<string, number[]> = {
  main: [1, 2, 4, 5],
  Therapist: [2],
  Analyst: [5],
  Collector: [0],
  DBA: [4, 5],
  Relayer: [0, 3],
}

// 各智能体固定出生点
const AGENT_SPAWN_POINTS: Record<string, number> = {
  main: 1,
  Therapist: 2,
  Analyst: 5,
  Collector: 0,
  DBA: 4,
  Relayer: 3,
}

/** 获取固定出生点 */
export function getRandomSpawnPoint(agentId?: string): GridPoint {
  const spawnId = agentId ? (AGENT_SPAWN_POINTS[agentId] ?? undefined) : undefined
  if (spawnId !== undefined) {
    return GRID_POINTS[spawnId]
  }
  const randomIndex = Math.floor(Math.random() * GRID_POINTS.length)
  return GRID_POINTS[randomIndex]
}

/** 从当前点的连接点中随机选择下一个目标 */
export function getNextTargetPoint(currentId: number, agentId?: string): GridPoint {
  const zone = agentId ? AGENT_ZONES[agentId] : null
  let pool = GRID_CONNECTIONS[currentId]

  if (zone) {
    pool = pool.filter(id => zone.includes(id))
    if (pool.length === 0) {
      return GRID_POINTS[currentId]
    }
  }

  const randomIndex = Math.floor(Math.random() * pool.length)
  return GRID_POINTS[pool[randomIndex]]
}

/** 根据两点距离计算移动时长（秒） */
export function calculateMoveDuration(from: GridPoint, to: GridPoint, speed = 15): number {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return Math.max(0.8, distance / speed)
}

/** 获取网格线可视化数据 */
export function getGridVisualization() {
  return {
    horizontal: [
      { x1: 15, y1: 35, x2: 85, y2: 35 }, // 上横线
      { x1: 15, y1: 75, x2: 85, y2: 75 }, // 下横线
    ],
    vertical: [
      { x1: 15, y1: 35, x2: 15, y2: 75 }, // 左竖线
      { x1: 50, y1: 35, x2: 50, y2: 75 }, // 中竖线
      { x1: 85, y1: 35, x2: 85, y2: 75 }, // 右竖线
    ],
  }
}
