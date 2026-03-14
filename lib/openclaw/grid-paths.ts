/**
 * 田字格 3x3 网格路径系统
 * 9个交叉点作为 agent 移动路径点
 * 移植自 openclaw-office/lib/grid-paths.js
 */

export type GridPoint = {
  x: number
  y: number
  id: number
}

// 田字格9个交叉点坐标（百分比）
// 布局：
// 6 — 7 — 8
// |   |   |
// 3 — 4 — 5
// |   |   |
// 0 — 1 — 2
export const GRID_POINTS: GridPoint[] = [
  { x: 25, y: 75, id: 0 }, // 左下
  { x: 50, y: 75, id: 1 }, // 中下
  { x: 75, y: 75, id: 2 }, // 右下
  { x: 25, y: 50, id: 3 }, // 左中
  { x: 50, y: 50, id: 4 }, // 中心
  { x: 75, y: 50, id: 5 }, // 右中
  { x: 25, y: 25, id: 6 }, // 左上
  { x: 50, y: 25, id: 7 }, // 中上
  { x: 75, y: 25, id: 8 }, // 右上
]

// 网格连接关系（哪些点之间可以直接移动）
export const GRID_CONNECTIONS: Record<number, number[]> = {
  0: [1, 3],
  1: [0, 2, 4],
  2: [1, 5],
  3: [0, 4, 6],
  4: [1, 3, 5, 7],
  5: [2, 4, 8],
  6: [3, 7],
  7: [4, 6, 8],
  8: [5, 7],
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
      { x1: 25, y1: 25, x2: 75, y2: 25 },
      { x1: 25, y1: 50, x2: 75, y2: 50 },
      { x1: 25, y1: 75, x2: 75, y2: 75 },
    ],
    vertical: [
      { x1: 25, y1: 25, x2: 25, y2: 75 },
      { x1: 50, y1: 25, x2: 50, y2: 75 },
      { x1: 75, y1: 25, x2: 75, y2: 75 },
    ],
  }
}
