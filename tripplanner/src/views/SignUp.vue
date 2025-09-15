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
      <!-- Dark Overlay -->
      <div class="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10"></div>
    </div>

    <!-- Signup Card -->
    <div class="relative min-h-screen flex items-center justify-center p-5 z-20">
      <div class="signup-card">
        <!-- Avatar/Profile Circle -->
        <div class="avatar-circle"></div>

        <!-- Title -->
        <h1 class="signup-title">Sign Up</h1>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="signup-form">
          <!-- Email Input -->
          <div class="form-group">
            <input
              type="text"
              id="email"
              v-model="formData.email"
              placeholder="Email"
              class="form-input"
              :class="{ error: errors.email }"
              required
              autocomplete="email"
            />
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>

          <!-- Username -->
          <div class="form-group">
            <input
              type="text"
              id="username"
              v-model="formData.username"
              placeholder="Username"
              class="form-input"
              :class="{ error: errors.username }"
              required
              autocomplete="username"
            />
            <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
          </div>

          <!-- Password -->
          <div class="form-group">
            <div class="password-container">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="formData.password"
                placeholder="Password"
                class="form-input"
                :class="{ error: errors.password }"
                required
                autocomplete="new-password"
              />
              <button type="button" class="password-toggle" @click="togglePassword">
                <!-- Icons -->
                <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <path d="M14.12 13.12a3 3 0 0 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          </div>

          <!-- Password Requirements -->
          <div class="password-requirements">
            <p class="requirements-text">
              Password must be 8–20 characters and include 4 of: uppercase, lowercase, numbers, or symbols.
            </p>
            <div class="requirements-list">
              <div class="requirement" :class="{ met: requirements.length }">
                <span class="requirement-dot"></span> 8–20 characters
              </div>
              <div class="requirement" :class="{ met: requirements.uppercase }">
                <span class="requirement-dot"></span> Uppercase letter
              </div>
              <div class="requirement" :class="{ met: requirements.lowercase }">
                <span class="requirement-dot"></span> Lowercase letter
              </div>
              <div class="requirement" :class="{ met: requirements.numbers }">
                <span class="requirement-dot"></span> Numbers
              </div>
              <div class="requirement" :class="{ met: requirements.symbols }">
                <span class="requirement-dot"></span> Symbols
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="submit-btn" :disabled="!isFormValid">
            <span v-if="isLoading" class="loading-spinner"></span>
            {{ isLoading ? 'Creating Account...' : 'Get Started!' }}
          </button>

          <!-- Terms -->
          <p class="terms-text">
            By clicking "Get Started!" you agree to our
            <a href="#" class="terms-link" @click.prevent="handleTermsClick">Terms and Conditions</a> and
            <a href="#" class="terms-link" @click.prevent="handlePrivacyClick">Privacy Policy</a>.
          </p>
        </form>

        <!-- Login Link -->
        <div class="login-link">
          Already have an account?
          <RouterLink to="/login" class="login-link-text">Login here</RouterLink>
        </div>
      </div>
    </div>

    <!-- Success Popup -->
    <div v-if="showSuccessPopup" class="popup-container">
      <div class="popup-backdrop"></div>
      <div class="success-popup">
        <p>Registration successful! Redirecting to login...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import { useAuthStore } from '@/stores/auth'
import Navbar from '../components/Nav.vue'

// Types
interface SignupFormData {
  email: string
  username: string
  password: string
}
interface FormErrors { email?: string; username?: string; password?: string }
interface PasswordRequirements {
  length: boolean; uppercase: boolean; lowercase: boolean; numbers: boolean; symbols: boolean
}

// State
const formData = reactive<SignupFormData>({ email: '', username: '', password: '' })
const errors = reactive<FormErrors>({})
const showPassword = ref(false)
const isLoading = ref(false)
const showSuccessPopup = ref(false)
const router = useRouter()
const authStore = useAuthStore()

// Password validation
const requirements = computed<PasswordRequirements>(() => ({
  length: formData.password.length >= 8 && formData.password.length <= 20,
  uppercase: /[A-Z]/.test(formData.password),
  lowercase: /[a-z]/.test(formData.password),
  numbers: /\d/.test(formData.password),
  symbols: /[^A-Za-z0-9]/.test(formData.password)
}))

// Form validation
const isFormValid = computed(() => {
  const reqCount = Object.values(requirements.value).filter(Boolean).length
  return (
    formData.email.trim() &&
    formData.username.trim() &&
    formData.password.trim() &&
    reqCount >= 4 &&
    !errors.email &&
    !errors.username &&
    !errors.password
  )
})

// Validation functions
const validateEmail = (email: string): string | null => {
  if (!email.trim()) return 'Email is required'
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email) ? null : 'Please enter a valid email'
}
const validateUsername = (u: string) => (!u.trim() ? 'Username is required' : null)
const validatePassword = (p: string) => {
  if (!p.trim()) return 'Password is required'
  if (p.length < 8) return 'Password must be at least 8 characters'
  if (p.length > 20) return 'Password must be less than 20 characters'
  return Object.values(requirements.value).filter(Boolean).length < 4
    ? 'Password must meet at least 4 requirements' : null
}

// Watchers
watch(() => formData.email, e => { if (e) errors.email = validateEmail(e) || undefined })
watch(() => formData.username, u => { if (u) errors.username = validateUsername(u) || undefined })
watch(() => formData.password, p => { if (p) errors.password = validatePassword(p) || undefined })

// Methods
const togglePassword = () => { showPassword.value = !showPassword.value }
const handleSubmit = async () => {
  errors.email = validateEmail(formData.email) || undefined
  errors.username = validateUsername(formData.username) || undefined
  errors.password = validatePassword(formData.password) || undefined
  if (!isFormValid.value) return

  isLoading.value = true
  try {
    const response = await api.post('/auth/register', formData)
    const { token } = response.data
    authStore.setToken(token)
    await authStore.fetchUser()
    showSuccessPopup.value = true
    setTimeout(() => {
      showSuccessPopup.value = false
      router.push('/login')
    }, 2000)
  } catch (error: any) {
    alert(error.response?.data?.message || 'Registration failed. Please try again.')
  } finally {
    isLoading.value = false
  }
}
const handleTermsClick = () => {}
const handlePrivacyClick = () => {}
</script>

<style scoped>
/* Card */
.signup-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);
}

/* Avatar */
.avatar-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #e91e63, #f48fb1);
  border-radius: 50%;
  margin: 0 auto 24px;
}

/* Title */
.signup-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 32px;
}

/* Inputs */
.form-group { margin-bottom: 20px; }
.form-input {
  width: 100%; padding: 16px 20px; border: 2px solid #e9ecef;
  border-radius: 12px; font-size: 16px; color: #333;
  outline: none; transition: all 0.3s ease;
}
.form-input:focus { border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,0.1); }
.form-input.error { border-color: #dc3545; }

/* Password toggle */
.password-container { position: relative; }
.password-toggle {
  position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: #666; cursor: pointer; padding: 4px;
}
.password-toggle:hover { color: #333; }
.error-message { color: #dc3545; font-size: 14px; margin-top: 4px; }

/* Requirements */
.password-requirements { margin-bottom: 24px; }
.requirements-text { font-size: 12px; color: #666; margin-bottom: 12px; }
.requirements-list { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.requirement { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #999; }
.requirement.met { color: #28a745; }
.requirement-dot { width: 6px; height: 6px; border-radius: 50%; background: #ddd; }
.requirement.met .requirement-dot { background: #28a745; }

/* Button */
.submit-btn {
  width: 100%; padding: 16px;
  background: linear-gradient(135deg, #17a2b8, #20c997);
  color: white; border: none; border-radius: 12px;
  font-size: 16px; font-weight: 600;
  cursor: pointer; transition: all 0.3s ease;
  margin-bottom: 16px; display: flex; align-items: center; justify-content: center; gap: 8px;
}
.submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(23,162,184,0.3); }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* Spinner */
.loading-spinner {
  width: 16px; height: 16px;
  border: 2px solid transparent; border-top: 2px solid white;
  border-radius: 50%; animation: spin 1s linear infinite;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* Terms & Login */
.terms-text { font-size: 12px; color: #666; text-align: center; margin-bottom: 24px; }
.terms-link { color: #667eea; }
.terms-link:hover { text-decoration: underline; }
.login-link { text-align: center; font-size: 14px; color: #666; padding-top: 24px; border-top: 1px solid #e9ecef; }
.login-link-text { color: #667eea; font-weight: 600; }
.login-link-text:hover { text-decoration: underline; }

/* Success Popup */
.popup-container {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center; z-index: 999;
}
.popup-backdrop { position: absolute; width: 100%; height: 100%; background: rgba(0,0,0,0.5); }
.success-popup {
  background: #4caf50; color: white; padding: 20px;
  border-radius: 8px; z-index: 1000; text-align: center;
}

/* Responsive */
@media (max-width: 480px) {
  .signup-card { padding: 30px 20px; }
  .requirements-list { grid-template-columns: 1fr; }
}
</style>
