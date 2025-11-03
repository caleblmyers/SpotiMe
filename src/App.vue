<template>
  <div class="h-screen flex flex-col bg-white overflow-hidden">
    <!-- Navbar -->
    <header class="bg-green-600 text-white p-4 shrink-0">
      <div class="container mx-auto flex justify-between items-center gap-4">
        <h1 class="text-2xl font-bold">SpotiMe</h1>
        <div class="flex items-center gap-2">
          <template v-if="user.email">
            <span class="text-sm">{{ user.displayName || user.email }}</span>
          </template>
          <template v-else>
            <input v-model="username" type="text" placeholder="Username"
              class="px-3 py-1 rounded text-gray-900 text-sm" />
            <input v-model="password" type="password" placeholder="Password"
              class="px-3 py-1 rounded text-gray-900 text-sm" />
            <button @click="handleLogin" class="px-4 py-1 rounded bg-green-700 hover:bg-green-800 transition text-sm">
              Login
            </button>
            <button @click="handleSignUp" class="px-4 py-1 rounded bg-green-700 hover:bg-green-800 transition text-sm">
              Sign Up
            </button>
          </template>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="container min-w-full flex-1 py-8 overflow-y-auto">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-200 text-gray-700 p-4 text-center shrink-0">
      &copy; 2025 SpotiMe • Built with Vue 3 & Spotify API
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { login, signUp } from './api/user';
import { useUserStore } from './store/user';

const user = useUserStore();
const username = ref('');
const password = ref('');
const hasInitialized = ref(false);

onMounted(async () => {
  if (!hasInitialized.value && !user.email) {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await user.fetchCurrentUser();
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    }
    hasInitialized.value = true;
  }
});

async function handleLogin() {
  console.log('Login:', username.value, password.value);
  const response = await login(username.value, password.value);
  user.setUserData(username.value, response);
  username.value = '';
  password.value = '';
  try {
    await user.fetchCurrentUser();
  } catch (err) {
    console.error("Failed to fetch current user after login:", err);
  }
}

async function handleSignUp() {
  console.log('Sign Up:', username.value, password.value);
  const response = await signUp(username.value, password.value);
  user.setUserData(username.value, response);
  username.value = '';
  password.value = '';
  try {
    await user.fetchCurrentUser();
  } catch (err) {
    console.error("Failed to fetch current user after signup:", err);
  }
}
</script>

<style>
/* Optional: smooth font and body styling */
</style>
