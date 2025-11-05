import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import AuthCallback from "../views/AuthCallback.vue";
import Graphs from "../views/Graphs.vue";

const routes = [
  { path: "/", component: Dashboard },
  { path: "/graphs", component: Graphs },
  { path: "/auth/callback", component: AuthCallback },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
