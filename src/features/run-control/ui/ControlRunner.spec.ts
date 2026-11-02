import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useProgressStore } from '@/entities/progress'

import ControlRunner from './ControlRunner.vue'

import type { Grade } from '@/entities/subject'

const grade: Grade = {
  id: 'math-1',
  subjectId: 'math',
  grade: 1,
  textbook: 'Учебник',
  topics: [],
  quiz: [],
  control: [
    { topic: 0, text: '2 + 3', points: 2, answers: ['5'], solution: '<p>2 + 3 = 5</p>' },
    { topic: 1, text: '9 − 5', points: 3, answers: ['4', 'на 4'], solution: '<p>9 − 5 = 4</p>' },
  ],
}

describe('ControlRunner', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('проверяет ответы, ставит оценку, показывает решения и сохраняет результат', async () => {
    const wrapper = mount(ControlRunner, { props: { grade } })
    const inputs = wrapper.findAll('input')
    await inputs[0]!.setValue('5')
    await inputs[1]!.setValue('на 4')

    await wrapper.find('button').trigger('click')

    expect(wrapper.find('.control-result__mark').text()).toBe('5')
    expect(wrapper.findAll('.task__solution')).toHaveLength(2)
    expect(useProgressStore().getGrade('math-1').control.bestScore).toBe(100)
  })

  it('предупреждает о пустых ответах и сдаёт работу со второго нажатия', async () => {
    const wrapper = mount(ControlRunner, { props: { grade } })
    await wrapper.findAll('input')[0]!.setValue('5')

    await wrapper.find('button').trigger('click')
    expect(wrapper.find('[role="alert"]').text()).toContain('1')
    expect(wrapper.find('.control-result').exists()).toBe(false)

    await wrapper.find('button').trigger('click')
    expect(wrapper.find('.control-result__mark').text()).toBe('2')
    expect(wrapper.emitted('review-topic')).toBeUndefined()
  })
})
