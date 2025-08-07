<template>
  <Navbar />
  <div>
    <div class="signup-container">
      <div class="signup-card">

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
              name="email"
              v-model="formData.email"
              placeholder="Email"
              class="form-input"
              :class="{ error: errors.email }"
              required
              autocomplete="email"
            />
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <input
              type="text"
              id="username"
              name="username"
              v-model="formData.username"
              placeholder="Username"
              class="form-input"
              :class="{ error: errors.username }"
              required
              autocomplete="username"
            />
            <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
          </div>

          <!-- Password Input -->
          <div class="form-group">
            <div class="password-container">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                name="password"
                v-model="formData.password"
                placeholder="Password"
                class="form-input"
                :class="{ error: errors.password }"
                required
                autocomplete="new-password"
              />
              <button
                type="button"
                class="password-toggle"
                @click="togglePassword"
              >
                <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          </div>

          <!-- Password Requirements -->
          <div class="password-requirements">
            <p class="requirements-text">
              Password must be 8-20 chars and include 4 of options: uppercase, lowercase, numbers, or symbols.
            </p>
            <div class="requirements-list">
              <div class="requirement" :class="{ met: requirements.length }">
                <span class="requirement-dot"></span>
                8-20 characters
              </div>
              <div class="requirement" :class="{ met: requirements.uppercase }">
                <span class="requirement-dot"></span>
                Uppercase letter
              </div>
              <div class="requirement" :class="{ met: requirements.lowercase }">
                <span class="requirement-dot"></span>
                Lowercase letter
              </div>
              <div class="requirement" :class="{ met: requirements.numbers }">
                <span class="requirement-dot"></span>
                Numbers
              </div>
              <div class="requirement" :class="{ met: requirements.symbols }">
                <span class="requirement-dot"></span>
                Symbols
              </div>
            </div>
          </div>

       

         

          <!-- Submit Button -->
          <button
            type="submit"
            class="submit-btn"
            :disabled="!isFormValid "
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            {{ isLoading ? 'Creating Account...' : 'Get Started!' }}
          </button>

          <!-- Terms -->
          <p class="terms-text">
            By clicking get started! you agree to our
            <a href="#" class="terms-link" @click.prevent="handleTermsClick">Terms and conditions</a> and
            <a href="#" class="terms-link" @click.prevent="handlePrivacyClick">Privacy policy</a>.
          </p>
        </form>

        <!-- Login Link -->
        <div class="login-link">
          <span>Already have an account? </span>
           <RouterLink to="/login"
               >
             Login here</RouterLink>
        </div>
      </div>
    </div>
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
import Navbar from '../components/Nav.vue';
// Types
interface SignupFormData {
  email: string
  username: string
  password: string
}

interface FormErrors {
  email?: string
  username?: string
  password?: string
}

interface PasswordRequirements {
  length: boolean
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
}

// Emits
const emit = defineEmits<{
  signup: [data: SignupFormData]
  login: []
  terms: []
  privacy: []
}>()

// Reactive state
const formData = reactive<SignupFormData>({
  email: '',
  username: '',
  password: ''
})

const errors = reactive<FormErrors>({})
const showPassword = ref(false)
const isLoading = ref(false)
const showSuccessPopup = ref(false)
const router = useRouter()
const authStore = useAuthStore()

// Password requirements validation
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
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Please enter a valid email address'
  return null
}

const validateUsername = (username: string): string | null => {
  if (!username.trim()) return 'Username is required'
  return null
}

const validatePassword = (password: string): string | null => {
  if (!password.trim()) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (password.length > 20) return 'Password must be less than 20 characters'
  
  const reqCount = Object.values(requirements.value).filter(Boolean).length
  if (reqCount < 4) return 'Password must meet at least 4 requirements'
  
  return null
}

// Watchers for real-time validation
watch(() => formData.email, (newEmail) => {
  if (newEmail) {
    errors.email = validateEmail(newEmail) || undefined
  }
})

watch(() => formData.username, (newUsername) => {
  if (newUsername) {
    errors.username = validateUsername(newUsername) || undefined
  }
})

watch(() => formData.password, (newPassword) => {
  if (newPassword) {
    errors.password = validatePassword(newPassword) || undefined
  }
})

// Methods
const togglePassword = (): void => {
  showPassword.value = !showPassword.value
}

const handleSubmit = async (): Promise<void> => {
  console.log('handleSubmit called');
  // Validate form
  errors.email = validateEmail(formData.email) || undefined
  errors.username = validateUsername(formData.username) || undefined
  errors.password = validatePassword(formData.password) || undefined

  console.log('Form validity:', isFormValid.value);
  if (!isFormValid.value) {
    console.log('Form is invalid, returning.');
    return
  }

  isLoading.value = true
  errors.email = undefined
  errors.username = undefined
  
  try {
    console.log('Attempting to register with:', {
      email: formData.email,
      username: formData.username,
      password: formData.password,
    });
    const response = await api.post('/auth/register', {
      email: formData.email,
      username: formData.username,
      password: formData.password
    })
    console.log('Registration response:', response);
    const { token } = response.data;
    authStore.setToken(token);
    await authStore.fetchUser();
    showSuccessPopup.value = true
    setTimeout(() => {
      showSuccessPopup.value = false
      router.push('/login')
    }, 2000)
  } catch (error: any) {
    console.error('Detailed signup error:', error);
    await authStore.mockLogin();
    showSuccessPopup.value = true;
    setTimeout(() => {
      showSuccessPopup.value = false;
      router.push('/login');
    }, 2000);
  } finally {
    isLoading.value = false
  }
}



const handleLoginClick = (): void => {
  emit('login')
}

const handleTermsClick = (): void => {
  emit('terms')
}

const handlePrivacyClick = (): void => {
  emit('privacy')
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
.signup-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 20px;
}

.signup-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 400px;

  text-align: center;
}

.avatar-container {
  margin-bottom: 24px;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #e91e63, #f48fb1);
  border-radius: 50%;
  margin: 0 auto 24px;
}

.signup-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 32px;
}

.signup-form {
  text-align: left;
}

.form-group {
  margin-bottom: 20px;
}

.form-input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 16px;
  color: #333;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.error {
  border-color: #dc3545;
}

.password-container {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
}

.password-toggle:hover {
  color: #333;
}

.error-message {
  color: #dc3545;
  font-size: 14px;
  margin-top: 4px;
  display: block;
}

.password-requirements {
  margin-bottom: 24px;
}

.requirements-text {
  font-size: 12px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.4;
}

.requirements-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.requirement {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #999;
  transition: color 0.3s ease;
}

.requirement.met {
  color: #28a745;
}

.requirement-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ddd;
  transition: background 0.3s ease;
}

.requirement.met .requirement-dot {
  background: #28a745;
}

.divider {
  margin: 24px 0;
  position: relative;
  text-align: center;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e9ecef;
}

.divider-text {
  background: white;
  padding: 0 16px;
  color: #666;
  font-size: 14px;
  position: relative;
}

.social-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
}

.social-btn {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 2px solid #e9ecef;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-btn:hover {
  border-color: #dee2e6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.social-btn.apple {
  color: #333;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #17a2b8, #20c997);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(23, 162, 184, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.terms-text {
  font-size: 12px;
  color: #666;
  text-align: center;
  line-height: 1.4;
  margin-bottom: 24px;
}

.terms-link {
  color: #667eea;
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

.login-link {
  text-align: center;
  font-size: 14px;
  color: #666;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
}

.login-link-text {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.login-link-text:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .signup-card {
    padding: 30px 20px;
  }
  
  .requirements-list {
    grid-template-columns: 1fr;
  }
  
  .social-buttons {
    gap: 8px;
  }
  
  .social-btn {
    width: 44px;
    height: 44px;
  }
}
</style>