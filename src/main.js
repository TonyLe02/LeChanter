import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import Vue3Toastify from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const app = createApp(App)

app.use(router)
app.use(Vue3Toastify, {
    autoClose: 1500,
    pauseOnFocusLoss: false,
    pauseOnHover: false,
});

app.mount('#app')
