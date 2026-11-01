export function shuffle<T>(items: readonly T[]): T[] {
  const a = items.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Picks `n` items spreading them as evenly as possible across groups, then shuffles. */
export function balancedPick<T, K>(items: readonly T[], key: (t: T) => K, n: number): T[] {
  const groups = new Map<K, T[]>()
  for (const it of shuffle(items)) {
    const k = key(it)
    const g = groups.get(k)
    if (g) g.push(it)
    else groups.set(k, [it])
  }
  const queues = shuffle([...groups.values()])
  const out: T[] = []
  while (out.length < n && queues.some((q) => q.length)) {
    for (const q of queues) {
      const next = q.pop()
      if (next !== undefined && out.length < n) out.push(next)
    }
  }
  return shuffle(out)
}
