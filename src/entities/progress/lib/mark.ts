import type { SchoolMark } from '../model/types'

/** Five-point mark by percent of points: 90% → 5, 70% → 4, 50% → 3. */
export function schoolMark(percent: number): SchoolMark {
  if (percent >= 90) return 5
  if (percent >= 70) return 4
  if (percent >= 50) return 3
  return 2
}
