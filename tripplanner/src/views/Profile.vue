<template>
  <Navbar />
  <div class="min-h-screen bg-background flex items-center justify-center px-4">
    <div class="backdrop-blur-lg bg-white/80 border border-white/40 rounded-2xl shadow-2xl p-10 w-full max-w-lg space-y-6">
      <h1 class="text-4xl text-center font-cardo font-bold text-secondary2">My Profile</h1>

      <div v-if="user" class="space-y-1 text-[#333] font-didact text-[1.05rem] font-medium leading-relaxed">
        <p><span class="font-semibold text-secondary2">User Name:</span> {{ user.username }}</p>
        <p><span class="font-semibold text-secondary2">Email:</span> {{ user.email }}</p>
      </div>

      <button
        @click="showChangePassword = !showChangePassword"
        class="w-full py-2.5 bg-secondary2 hover:bg-seco transition-all text-white rounded-full shadow-md font-didact text-base font-medium"
      >
        {{ showChangePassword ? 'Cancel' : 'Change Password' }}
      </button>

      <div v-if="showChangePassword" class="mt-2 space-y-3">
        <form @submit.prevent="handleChangePassword" class="space-y-3">
          <input
            type="password"
            v-model="passwordData.currentPassword"
            placeholder="Current Password"
            class="input-style"
            required
          />
          <input
            type="password"
            v-model="passwordData.newPassword"
            placeholder="New Password"
            class="input-style"
            required
          />
          <input
            type="password"
            v-model="passwordData.confirmPassword"
            placeholder="Confirm New Password"
            class="input-style"
            required
          />

          <div v-if="passwordError" class="text-sm text-red-600">{{ passwordError }}</div>
          <div v-if="passwordSuccess" class="text-sm text-green-600">{{ passwordSuccess }}</div>

          <button
            type="submit"
            :disabled="!isPasswordFormValid"
            class="w-full py-2.5 rounded-full text-white bg-gradient-to-r from-orange-400 to-orange-500 hover:to-orange-600 shadow-md transition-all font-medium disabled:opacity-50"
          >
            Submit
          </button>
        </form>
      </div>

      <button
        @click="handleLogout"
        class="w-full py-2.5 bg-[#d40f30] hover:bg-[#b10e29] text-white rounded-full shadow-md font-didact text-base transition-all"
      >
        Logout
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Navbar from '../components/Nav.vue'

const authStore = useAuthStore()
const router = useRouter()

const user = computed(() => authStore.user)
const showChangePassword = ref(false)

interface Trip {
  destination: string
  start_date: string
  end_date: string
  budget: number
  group_size: number
  transport: string
  activities: string
}

const latestTrip = ref<Trip | null>(null)

const passwordData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordError = ref('')
const passwordSuccess = ref('')

const requirements = computed(() => ({
  length: passwordData.newPassword.length >= 8 && passwordData.newPassword.length <= 20,
  uppercase: /[A-Z]/.test(passwordData.newPassword),
  lowercase: /[a-z]/.test(passwordData.newPassword),
  numbers: /\d/.test(passwordData.newPassword),
  symbols: /[^A-Za-z0-9]/.test(passwordData.newPassword)
}))

const isPasswordFormValid = computed(() => {
  const reqCount = Object.values(requirements.value).filter(Boolean).length
  return (
    passwordData.currentPassword &&
    passwordData.newPassword &&
    passwordData.confirmPassword &&
    passwordData.newPassword === passwordData.confirmPassword &&
    requirements.value.length &&
    reqCount >= 4
  )
})

const handleChangePassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = ''

  if (passwordData.newPassword !== passwordData.confirmPassword) {
    passwordError.value = 'New passwords do not match.'
    return
  }

  const reqCount = Object.values(requirements.value).filter(Boolean).length
  if (!requirements.value.length || reqCount < 4) {
    passwordError.value =
      'Password must be 8-20 characters and include at least 4 of the following: uppercase, lowercase, numbers, or symbols.'
    return
  }

  try {
    await axios.post(
      'http://localhost:3002/api/auth/change-password',
      {
        username: user.value.username,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )
    passwordSuccess.value = 'Password changed successfully.'
    passwordData.currentPassword = ''
    passwordData.newPassword = ''
    passwordData.confirmPassword = ''
  } catch (error: any) {
    passwordError.value = error.response?.data?.message || 'An error occurred.'
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.input-style {
  @apply w-full px-4 py-2.5 text-sm text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17637B] transition-all;
}

button {
  transition: all 0.3s ease;
}
</style>
