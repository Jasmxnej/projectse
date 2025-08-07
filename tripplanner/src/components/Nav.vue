<template>
  <nav
    :class="[
      'fixed top-0 left-0 w-full z-50 text-base px-20 py-4 flex justify-between items-center nav-glass transition-all duration-300',
      isHome ? 'text-white bg-transparent' : 'text-black nav-glass bg-white/30 shadow-xl'
    ]"
  >
    <!-- Left Brand -->
    <div class="flex items-center space-x-6">
      <RouterLink to="/home" class="nav-link">TRIP PLANNER HELPER</RouterLink>
    </div>

    <!-- Center Navigation -->
    <div class="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-6">
      <RouterLink
        to="/home"
        class="nav-link"
        :class="{ 'border-b border-white pb-0.5': isActive('/home') }"
      >HOME</RouterLink>
      <RouterLink
        to="/about"
        class="nav-link"
        :class="{ 'border-b border-white pb-0.5': isActive('/about') }"
      >ABOUT US</RouterLink>
      <RouterLink
        to="/contact"
        class="nav-link"
        :class="{ 'border-b border-black pb-0.5': isActive('/contact') }"
      >CONTACT US</RouterLink>
      <RouterLink
        to="/mytrips"
        class="nav-link"
        :class="{ 'border-b border-black pb-0.5': isActive('/mytrips') }"
      >MY TRIPS</RouterLink>
    </div>

    <!-- Right User Section -->
    <div class="flex items-center space-x-6 relative">
      <template v-if="!authStore.currentUser">
        <RouterLink to="/login" class="nav-link">LOG IN</RouterLink>
        <RouterLink to="/signup" class="nav-link">SIGN UP</RouterLink>
      </template>
      <template v-else>
        <div v-if="user && user.username" @click="toggleDropdown" class="nav-link cursor-pointer select-none flex items-center space-x-2">
         <span class="font-bold">{{ user.username }}</span>
        <div
         class="w-7 h-7 flex items-center justify-center bg-black text-white rounded-full text-xs font-semibold uppercase"
          >
         {{ user.username.charAt(0) }}
        </div>
        </div>
        <div
          v-if="showDropdown"
          class="bg-white/75 absolute right-0 top-12 bg-white rounded-xl shadow-xl w-44 z-50 overflow-hidden transition-all duration-300 "
        >
          <RouterLink
          to="/profile"
          class="flex items-center gap-2 px-4 py-2 text-black hover:bg-black hover:text-white border-b border-black/20 pb-1.5"
          >
         <User class="w-4 h-4" />
         Profile
         </RouterLink>

        <a
        href="#"
       @click="handleLogout"
        class="flex items-center gap-2 px-4 py-2 text-black hover:bg-black hover:text-white"
        >
      <LogOut class="w-4 h-4" />
       Logout
      </a>

      </div>
      </template>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { User, LogOut } from 'lucide-vue-next'


const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const user = computed(() => authStore.currentUser)
const isHome = computed(() => route.path === '/home'|| route.path === '/about')
const showDropdown = ref(false)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
  showDropdown.value = false
}

const isActive = (path: string) => route.path === path

const onClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.nav-link') && !target.closest('.dropdown-menu')) {
    showDropdown.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.nav-link {
  background-color: transparent;
  transition: transform 0.2s ease;
  text-decoration: none;
  font-weight: bold;
  font-family: 'Arial';
}
.nav-link:hover {
  transform: scale(1.1);
  background-color: transparent;
}

/* Navbar background blur */
.nav-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  pointer-events: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
