<template>
  <div class="min-h-screen flex flex-col bg-white w-full max-w-full">
    <!-- Navbar -->
    <header class="bg-green-600 text-white p-4 shrink-0 w-full max-w-full">
      <div class="container mx-auto flex justify-between items-center gap-4 max-w-full px-4">
        <div class="flex items-center gap-4 sm:gap-6 min-w-0 shrink-0">
          <router-link to="/" class="text-xl sm:text-2xl font-bold hover:opacity-80 transition whitespace-nowrap">
            SpotiMe
          </router-link>
          <router-link v-if="user.email" to="/dashboard"
            class="px-3 py-1 rounded hover:bg-green-500 transition text-sm whitespace-nowrap">
            Dashboard
          </router-link>
        </div>
        <div class="flex items-center gap-2 shrink-0 min-w-0">
          <template v-if="user.email">
            <span class="text-sm truncate min-w-0">{{ user.displayName || user.email }}</span>
            <button @click="handleLogout" class="px-4 py-1 rounded bg-green-700 hover:bg-green-800 transition text-sm whitespace-nowrap shrink-0">
              Logout
            </button>
          </template>
          <template v-else>
            <input v-model="username" type="text" placeholder="Username"
              class="px-3 py-1 rounded text-gray-900 text-sm min-w-0 flex-1" />
            <input v-model="password" type="password" placeholder="Password"
              class="px-3 py-1 rounded text-gray-900 text-sm min-w-0 flex-1" />
            <button @click="handleLogin" class="px-4 py-1 rounded bg-green-700 hover:bg-green-800 transition text-sm whitespace-nowrap shrink-0">
              Login
            </button>
            <button @click="handleSignUp" class="px-4 py-1 rounded bg-green-700 hover:bg-green-800 transition text-sm whitespace-nowrap shrink-0">
              Sign Up
            </button>
          </template>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1 w-full max-w-full min-w-0">
      <div class="container mx-auto px-4 py-8 max-w-full">
        <router-view />
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-200 text-gray-700 p-4 text-center shrink-0 mt-auto w-full max-w-full">
      &copy; 2025 SpotiMe • Built with Vue 3 & Spotify API
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { login, signUp } from './api/user';
import { useUserStore } from './store/user';

const router = useRouter();

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

async function handleLogin(): Promise<void> {
  try {
    const response = await login(username.value, password.value);
    user.setUserData(username.value, response);
    username.value = '';
    password.value = '';
    await user.fetchCurrentUser();
  } catch (err) {
    console.error("Failed to login:", err);
  }
}

async function handleSignUp(): Promise<void> {
  try {
    const response = await signUp(username.value, password.value);
    user.setUserData(username.value, response);
    username.value = '';
    password.value = '';
    await user.fetchCurrentUser();
  } catch (err) {
    console.error("Failed to sign up:", err);
  }
}

function handleLogout() {
  localStorage.removeItem('token');
  user.clearUser();
  router.push('/');
}
</script>

