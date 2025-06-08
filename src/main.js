import "./assets/main.css";

import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";

import Vue3Toastify, { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

// Simple router setup
const routes = [{ path: "/", component: App }];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);

app.use(router);
app.use(Vue3Toastify, {
  autoClose: 1500,
  pauseOnFocusLoss: false,
  pauseOnHover: false,
});

// Make toast available globally
app.config.globalProperties.$toast = toast;

app.mount("#app");
