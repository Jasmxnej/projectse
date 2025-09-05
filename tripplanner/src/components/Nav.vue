<template>
<nav
  class="fixed top-0 left-0 w-full z-50 px-8 py-3 flex justify-between items-center transition-all duration-300 bg-white text-secondary2 shadow-sm"
>

    <!-- Left Brand -->
    <div class="flex items-center">
      <RouterLink to="/home" class="flex items-center space-x-3 nav-link group">
        <div class="w-12 h-12 flex items-center justify-center">
          <img 
            :src="logo" 
            alt="Trip Planner Helper Logo" 
            class="w-full h-full object-contain"
          />
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-semibold tracking-wider uppercase leading-tight">
            TRIP PLANNER
          </span>
          <span class="text-sm font-semibold tracking-wider uppercase leading-tight">
            HELPER
          </span>
        </div>
      </RouterLink>
    </div>

    <!-- Center Navigation -->
    <div class="flex items-center space-x-12">
      <RouterLink
        to="/about"
        class="nav-link text-sm font-medium tracking-wide uppercase transition-colors duration-200"
        :class="{ 
          'text-secondary2 border-b-2 border-secondary2 pb-1': isActive('/about'),
          'hover:text-secondary2': !isActive('/about')
        }"
      >
        ABOUT US
      </RouterLink>
      <RouterLink
        to="/contact"
        class="nav-link text-sm font-medium tracking-wide uppercase transition-colors duration-200"
        :class="{ 
          'text-secondary2 border-b-2 border-secondary2 pb-1': isActive('/contact'),
          'hover:text-secondary2': !isActive('/contact')
        }"
      >
        CONTACT US
      </RouterLink>
      <RouterLink
        to="/mytrips"
        class="nav-link text-sm font-medium tracking-wide uppercase transition-colors duration-200"
        :class="{ 
          'text-secondary2 border-b-2 border-secondary2 pb-1': isActive('/mytrips'),
          'hover:text-secondary2': !isActive('/mytrips')
        }"
      >
        MY TRIP
      </RouterLink>
    </div>

    <!-- Right User Section -->
    <div class="flex items-center space-x-8 relative">
      <template v-if="!authStore.currentUser">
        <RouterLink 
          to="/login" 
          class="nav-link text-sm font-medium tracking-wide uppercase transition-colors duration-200 hover:text-secondary2"
        >
          LOG IN
        </RouterLink>
        <RouterLink 
          to="/signup" 
          class="nav-link text-sm font-medium tracking-wide uppercase transition-colors duration-200 hover:text-secondary2"
        >
          SIGN UP
        </RouterLink>
      </template>
      <template v-else>
        <div 
          @click="toggleDropdown" 
          class="nav-link cursor-pointer select-none flex items-center space-x-3 hover:text-secondary2 transition-colors duration-200"
        >
          <span class="text-sm font-medium tracking-wide uppercase">
            {{ user?.username }}
          </span>
          <div class="w-8 h-8 flex items-center justify-center bg-secondary2 text-white rounded-full text-xs font-semibold uppercase">
            {{ user?.username?.charAt(0) }}
          </div>
        </div>
        
        <!-- Dropdown Menu -->
        <div
          v-if="showDropdown"
          class="absolute right-0 top-16 bg-white rounded-lg shadow-xl w-48 z-50 overflow-hidden border border-gray-100"
        >
          <RouterLink
            to="/profile"
            class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-secondary2 border-b border-gray-100 transition-colors duration-200"
            @click="showDropdown = false"
          >
            <User class="w-4 h-4" />
            <span class="text-sm font-medium">Profile</span>
          </RouterLink>

          <button
            @click="handleLogout"
            class="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
          >
            <LogOut class="w-4 h-4" />
            <span class="text-sm font-medium">Logout</span>
          </button>
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
import logo from '@/assets/tphlogo.png'


const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const user = computed(() => authStore.currentUser)
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