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

/** 获取随机起点 */
export function getRandomSpawnPoint(): GridPoint {
  const randomIndex = Math.floor(Math.random() * GRID_POINTS.length)
  return GRID_POINTS[randomIndex]
}

/** 从当前点的连接点中随机选择下一个目标 */
export function getNextTargetPoint(currentId: number): GridPoint {
  const connections = GRID_CONNECTIONS[currentId]
  const randomIndex = Math.floor(Math.random() * connections.length)
  return GRID_POINTS[connections[randomIndex]]
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
