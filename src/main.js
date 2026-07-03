import { createApp } from 'vue'
import App from './App.vue'
import { spotlight } from './directives/spotlight.js'

const app = createApp(App)
app.directive('spotlight', spotlight)
app.mount('#app')
