// Fonts are bundled (no external CDN): schoolbook headings, text face and handwriting for marks.
import '@fontsource/caveat/400.css'
import '@fontsource/caveat/700.css'
import '@fontsource/old-standard-tt/400.css'
import '@fontsource/old-standard-tt/700.css'
import '@fontsource/pt-sans/400.css'
import '@fontsource/pt-sans/400-italic.css'
import '@fontsource/pt-sans/700.css'
import 'primeicons/primeicons.css'
import './styles/main.sass'

import { createApp } from 'vue'

import App from './App.vue'
import { installProviders } from './providers'

const app = createApp(App)

installProviders(app)

app.mount('#app')
