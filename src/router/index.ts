import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import AuthCallback from "../views/AuthCallback.vue";
import Graphs from "../views/Graphs.vue";
import LoginError from "../views/LoginError.vue";

const routes = [
  { path: "/", component: Dashboard },
  { path: "/graphs", component: Graphs },
  { path: "/auth/callback", component: AuthCallback },
  { 
    path: "/login", 
    component: LoginError,
    props: (route) => ({ error: route.query.error })
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
