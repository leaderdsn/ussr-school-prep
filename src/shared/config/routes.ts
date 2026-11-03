export const ROUTE_NAMES = {
  home: 'home',
  grade: 'grade',
  family: 'family',
  admin: 'admin',
  notFound: 'not-found',
} as const

export type RouteName = (typeof ROUTE_NAMES)[keyof typeof ROUTE_NAMES]

/** Route steps after the topics: `/grade/math-1/test`, `/grade/math-1/control`. */
export const TEST_STEP = 'test'
export const CONTROL_STEP = 'control'

export type GradeStep = number | typeof TEST_STEP | typeof CONTROL_STEP
