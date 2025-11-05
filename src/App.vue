<template>
  <div class="min-h-screen flex flex-col bg-white w-full max-w-full">
    <!-- Navbar -->
    <header class="bg-green-600 text-white p-4 shrink-0 w-full max-w-full">
      <div class="container mx-auto flex justify-between items-center gap-4 max-w-full px-4">
        <div class="flex items-center gap-4 sm:gap-6 min-w-0 shrink-0">
          <router-link to="/" class="text-xl sm:text-2xl font-bold hover:opacity-80 transition whitespace-nowrap">
            SpotiMe
          </router-link>
          <nav v-if="isAuthenticated" class="flex items-center gap-3 sm:gap-4 ml-2 sm:ml-4">
            <router-link
              to="/"
              class="text-sm px-2 py-1 rounded hover:bg-green-700 transition whitespace-nowrap"
              active-class="bg-green-700 font-semibold"
            >
              Dashboard
            </router-link>
            <router-link
              to="/graphs"
              class="text-sm px-2 py-1 rounded hover:bg-green-700 transition whitespace-nowrap"
              active-class="bg-green-700 font-semibold"
            >
              Graphs
            </router-link>
          </nav>
        </div>
        <div class="flex items-center gap-2 shrink-0 min-w-0">
          <template v-if="isAuthenticated">
            <button @click="handleLogout"
              class="px-4 py-1 rounded bg-green-700 hover:bg-green-800 transition text-sm whitespace-nowrap shrink-0">
              Logout
            </button>
          </template>
          <template v-else>
            <button @click="connectWithSpotify"
              class="px-4 py-2 rounded bg-green-500 hover:bg-green-600 transition text-sm whitespace-nowrap shrink-0">
              Connect with Spotify
            </button>
          </template>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-1 w-full max-w-full min-w-0">
      <div class="container mx-auto px-4 py-2 max-w-full">
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
import { storeToRefs } from 'pinia';
import { useUserStore } from './store/user';
import { useAuthRestore } from './composables/useAuthRestore';
import { loginSpotify } from './api/spotify';

const user = useUserStore();
const { isAuthenticated } = storeToRefs(user);

useAuthRestore();

async function connectWithSpotify(): Promise<void> {
  await loginSpotify();
}

function handleLogout(): void {
  user.clearUser();
}
</script>
