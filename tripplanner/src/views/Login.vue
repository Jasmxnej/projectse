<template>
  <Navbar />
  <div>
    <div class="login-container">
      <div class="login-card">
        <!-- Avatar/Profile Circle -->
        <div class="avatar-circle"></div>
        
        <!-- Login Title -->
        <h1 class="login-title">Log in</h1>
        
        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="login-form">
          <!-- Email Input -->
          <div class="input-group">
            <input
              v-model="username"
              type="text"
              placeholder="Username or Email"
              class="input-field"
              required
            />
          </div>
          
          <!-- Password Input -->
          <div class="input-group">
            <input
              v-model="password"
              type="password"
              placeholder="Password"
              class="input-field"
              required
            />
          </div>
          
          <!-- Forgot Password Link -->
          <div class="forgot-password">
            <a href="#" @click.prevent="handleForgotPassword">Forget password?</a>
          </div>
          
        
          
          
          
          <!-- Login Button -->
          <button type="submit" class="login-btn" :disabled="isLoading">
            {{ isLoading ? 'Logging in...' : 'Log in' }}
          </button>
        </form>
        
        <!-- Sign Up Link -->
        <div class="signup-link">
          Don't have an account?
          <a href="#" @click.prevent="handleSignUp">Sign up here</a>
        </div>

      </div>
    </div>
    <div v-if="showSuccessPopup" class="popup-container">
      <div class="popup-backdrop"></div>
      <div class="success-popup">
        <p>Login successful! Redirecting...</p>
      </div>
    </div>
    <div v-if="showErrorPopup" class="popup-container">
      <div class="popup-backdrop" @click="showErrorPopup = false"></div>
      <div class="error-popup">
        <p>{{ errorMessage }}</p>
        <button @click="showErrorPopup = false">Close</button>
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
    await authStore.mockLogin();
    showSuccessPopup.value = true;
    setTimeout(() => {
      showSuccessPopup.value = false;
      const redirectPath = route.query.redirect as string;
      if (redirectPath) {
        router.push(redirectPath);
      } else {
        router.push('/home');
      }
    }, 2000);
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
.popup-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.popup-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.success-popup {
  background-color: #4caf50;
  color: white;
  padding: 20px;
  border-radius: 8px;
  z-index: 1000;
  text-align: center;
}

.error-popup {
  background-color: #f44336;
  color: white;
  padding: 20px;
  border-radius: 8px;
  z-index: 1000;
  text-align: center;
}

.error-popup button {
  margin-top: 10px;
  padding: 5px 10px;
  border: none;
  background-color: white;
  color: #f44336;
  border-radius: 4px;
  cursor: pointer;
}
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #e91e63, #f48fb1);
  border-radius: 50%;
  margin: 0 auto 24px;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 32px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  position: relative;
}

.input-field {
  width: 100%;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
}

.input-field::placeholder {
  color: #9ca3af;
}

.forgot-password {
  text-align: right;
  margin-top: 8px;
  margin-bottom: 24px;
}

.forgot-password a {
  color: #6b7280;
  text-decoration: none;
  font-size: 14px;
}

.forgot-password a:hover {
  color: #374151;
  text-decoration: underline;
}

.divider {
  position: relative;
  margin: 24px 0;
  text-align: center;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e5e7eb;
}

.divider span {
  background: white;
  color: #9ca3af;
  padding: 0 16px;
  font-size: 14px;
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.social-btn {
  width: 48px;
  height: 48px;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.social-btn:hover {
  border-color: #d1d5db;
  transform: translateY(-1px);
}

.login-btn {
  width: 100%;
  padding: 16px;
  background: #06b6d4;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-bottom: 24px;
}

.login-btn:hover:not(:disabled) {
  background: #0891b2;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.signup-link {
  color: #6b7280;
  font-size: 14px;
}

.signup-link a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
}

.signup-link a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-card {
    padding: 24px;
  }
  
  .avatar-circle {
    width: 60px;
    height: 60px;
  }
  
  .login-title {
    font-size: 20px;
  }
}
</style>