<template>
  <Navbar />
  <div class="relative">
  <!-- Background Video -->
<div class="fixed top-0 left-0 w-full h-full z-0 overflow-hidden">
  <video 
    src="/travelclip.mp4"
    autoplay 
    muted 
    loop 
    playsinline
    class="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto 
           transform -translate-x-1/2 -translate-y-1/2 object-cover"
  ></video>

  <!-- Video Overlay (dark transparent layer) -->
  <div class="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10"></div>
</div>


   

    <div class="relative min-h-screen flex items-center justify-center p-5 z-20">
      <div class="bg-white  backdrop-blur-lg rounded-xl p-10 w-full max-w-md text-center shadow-2xl">
        <!-- Avatar/Profile Circle -->
        <div class="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-300 rounded-full mx-auto mb-6"></div>
        
        <!-- Login Title -->
        <h1 class="text-2xl font-semibold text-gray-800 mb-8">Log in</h1>
        
        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
          <!-- Email Input -->
          <div class="relative">
            <input
              v-model="username"
              type="text"
              placeholder="Username or Email"
              class="w-full p-4 border-2 border-gray-200 rounded-lg text-base transition-colors duration-200 focus:outline-none focus:border-blue-500 placeholder-gray-400"
              required
            />
          </div>
          
          <!-- Password Input -->
          <div class="relative">
            <input
              v-model="password"
              type="password"
              placeholder="Password"
              class="w-full p-4 border-2 border-gray-200 rounded-lg text-base transition-colors duration-200 focus:outline-none focus:border-blue-500 placeholder-gray-400"
              required
            />
          </div>
          
          <!-- Forgot Password Link -->
          <div class="text-right mt-2 mb-6">
            <a href="#" @click.prevent="handleForgotPassword" class="text-gray-500 text-sm hover:text-gray-700 hover:underline">Forget password?</a>
          </div>
          
          <!-- Login Button -->
          <button 
            type="submit" 
            class="w-full p-4 bg-cyan-500 text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-colors duration-200 mb-6 hover:bg-cyan-600 disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Logging in...' : 'Log in' }}
          </button>
        </form>
        
        <!-- Sign Up Link -->
        <div class="text-gray-500 text-sm">
          Don't have an account?
          <a href="#" @click.prevent="handleSignUp" class="text-blue-500 font-semibold hover:underline ml-1">Sign up here</a>
        </div>
      </div>
    </div>

    <!-- Success Popup -->
    <div v-if="showSuccessPopup" class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
      <div class="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50"></div>
      <div class="bg-green-500 text-white p-5 rounded-lg z-50 text-center">
        <p>Login successful! Redirecting...</p>
      </div>
    </div>

    <!-- Error Popup -->
    <div v-if="showErrorPopup" class="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
      <div class="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50" @click="showErrorPopup = false"></div>
      <div class="bg-red-500 text-white p-5 rounded-lg z-50 text-center">
        <p>{{ errorMessage }}</p>
        <button @click="showErrorPopup = false" class="mt-2 px-2 py-1 border-none bg-white text-red-500 rounded cursor-pointer">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import api from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import Navbar from '../components/Nav.vue';


// Reactive variables
const username = ref<string>('')
const password = ref<string>('')
const isLoading = ref<boolean>(false)
const showSuccessPopup = ref<boolean>(false)
const showErrorPopup = ref<boolean>(false)
const errorMessage = ref<string>('')
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// Form handlers
const handleLogin = async (): Promise<void> => {
  console.log('handleLogin called');
  console.log('Username:', username.value);
  console.log('Password:', password.value);
  if (!username.value || !password.value) {
    alert('Please fill in all fields')
    return
  }
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const isEmail = username.value.includes('@');
    const payload: { password: string; email?: string; username?: string } = {
      password: password.value,
    };
    if (isEmail) {
      payload.email = username.value;
    } else {
      payload.username = username.value;
    }
    const response = await api.post('/auth/login', payload)
    const { token } = response.data;
    authStore.setToken(token);
    await authStore.fetchUser();
    showSuccessPopup.value = true
    setTimeout(() => {
      showSuccessPopup.value = false
      const redirectPath = route.query.redirect as string
      if (redirectPath) {
        router.push(redirectPath)
      } else {
        router.push('/home')
      }
    }, 2000)
  } catch (error: any) {
    console.error('Detailed login error:', error);
    showErrorPopup.value = true;
    errorMessage.value = error.response?.data?.message || 'Login failed. Please check your credentials and try again.';
  } finally {
    isLoading.value = false
  }
}

const handleForgotPassword = (): void => {
  console.log('Forgot password clicked')
  alert('Forgot password functionality would be implemented here')
}

const handleSignUp = (): void => {
  router.push('/signup');
}
</script>

<style scoped>
/* Responsive adjustments for mobile */
@media (max-width: 480px) {
  .backdrop-blur-lg {
    backdrop-filter: blur(8px);
  }
  
  .p-10 {
    padding: 1.5rem;
  }
  
  .w-20 {
    width: 3.75rem;
  }
  
  .h-20 {
    height: 3.75rem;
  }
  
  .text-2xl {
    font-size: 1.25rem;
  }
}
</style>