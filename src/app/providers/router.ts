import { createRouter, createWebHistory } from 'vue-router'

import { findGrade } from '@/entities/subject'
import { CONTROL_STEP, ROUTE_NAMES, TEST_STEP } from '@/shared/config'

import type { RouteLocationNormalized, RouteLocationRaw, RouteRecordRaw } from 'vue-router'

function notFound(to: RouteLocationNormalized): RouteLocationRaw {
  return { name: ROUTE_NAMES.notFound, params: { pathMatch: to.path.slice(1).split('/') }, replace: true }
}

/** Unknown grade or step -> not found; missing step -> first topic. */
function guardGrade(to: RouteLocationNormalized): boolean | RouteLocationRaw {
  const found = findGrade(String(to.params.gradeId))
  if (!found) return notFound(to)

  const step = to.params.step
  if (!step) return { name: ROUTE_NAMES.grade, params: { gradeId: found.grade.id, step: '1' }, replace: true }
  if (step === TEST_STEP || step === CONTROL_STEP) return true

  const index = Number(step)
  return Number.isInteger(index) && index >= 1 && index <= found.grade.topicTitles.length ? true : notFound(to)
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: ROUTE_NAMES.home,
    component: () => import('@/pages/home').then((m) => m.HomePage),
  },
  {
    path: '/grade/:gradeId/:step?',
    name: ROUTE_NAMES.grade,
    component: () => import('@/pages/grade').then((m) => m.GradePage),
    props: true,
    beforeEnter: guardGrade,
  },
  {
    path: '/family',
    name: ROUTE_NAMES.family,
    component: () => import('@/pages/family').then((m) => m.FamilyPage),
  },
  {
    path: '/admin',
    name: ROUTE_NAMES.admin,
    component: () => import('@/pages/admin').then((m) => m.AdminPage),
  },
  {
    path: '/:pathMatch(.*)*',
    name: ROUTE_NAMES.notFound,
    component: () => import('@/pages/not-found').then((m) => m.NotFoundPage),
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})
