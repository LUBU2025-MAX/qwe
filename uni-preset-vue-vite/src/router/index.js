import { createRouter, createWebHistory } from 'vue-router';
import AiAssistant from '@/pages/ai-assistant/index.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: AiAssistant
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
