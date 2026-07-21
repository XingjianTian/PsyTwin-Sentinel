export function mergeUniqueById<T extends { id: string | number }>(...groups: T[][]): T[] {
  const items = new Map<string | number, T>()
  for (const group of groups) {
    for (const item of group) items.set(item.id, item)
  }
  return [...items.values()]
}

export function newestFirstById<T extends { id: string | number }>(items: T[]): T[] {
  return [...items].sort((left, right) => Number(right.id) - Number(left.id))
}
