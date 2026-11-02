import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

import { DARK_MODE_CLASS } from '@/features/toggle-theme'

import type { PrimeVueConfiguration } from 'primevue/config'

const AppPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}',
    },
  },
})

export const primeVueOptions: PrimeVueConfiguration = {
  ripple: true,
  theme: {
    preset: AppPreset,
    options: {
      darkModeSelector: `.${DARK_MODE_CLASS}`,
      cssLayer: {
        name: 'primevue',
        order: 'reset, primevue, app',
      },
    },
  },
}
