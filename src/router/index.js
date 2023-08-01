import { createRouter, createWebHashHistory } from 'vue-router';
import Home from './routes/home';
import About from './routes/about';
import Error from './routes/error';

const router = createRouter({
  history: createWebHashHistory(), // Must use Hash mode for Electron
  routes: [
    ...Home,
    ...About,
    ...Error,
  ],
});

export default router;