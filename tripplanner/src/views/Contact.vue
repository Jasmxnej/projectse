<template>
  <Nav/>
  <div class="min-h-screen bg-background ">
    <!-- Header -->
   <section class="relative py-20 overflow-hidden bg-white">
    <!-- Banner with circle -->
    <div class="relative flex items-center justify-center">
      <svg 
        viewBox="0 0 1400 300" 
        class="w-full max-w-6xl h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- Rectangle banner -->
        <rect x="0" y="100" width="1400" height="100" fill="#000000" />
        
        <!-- Circle in the middle -->
        <circle cx="700" cy="150" r="100" fill="#000000" />
      </svg>
      
      <!-- Text overlay -->
      <div class="absolute inset-0 flex items-center justify-center">
        <h1 class="text-3xl lg:text-4xl font-bold text-white lowercase">
          contact us
        </h1>
      </div>
    </div>
  </section>


    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 py-12">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        <!-- Left Column - Contact Form -->
        <div class="bg-white rounded-xl shadow-lg p-8">
          <div class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-2">Send a Message</h2>
            <p class="text-gray-600">
              Send us a message and we'll get back to you within 24 hours.
            </p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="interest" class="block text-sm font-medium text-gray-700 mb-2">Catagory</label>
                <select
                  id="interest"
                  v-model="form.interest"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select category</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label for="message" class="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                id="message"
                v-model="form.message"
                rows="5"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
                placeholder="Type your message ..."
              ></textarea>
            </div>

            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full bg-gray-900 text-white py-3 px-6 rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <span v-if="isSubmitting">Sending...</span>
              <span v-else>Submit</span>
            </button>
          </form>
        </div>

        <!-- Right Column - Contact Info -->
        <div class="space-y-8">
          
          <!-- Contact Methods -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
            
            <!-- Call Us -->
            <div class="bg-white rounded-xl shadow-lg p-6">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-secondary1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
              </div>
              <h3 class="font-semibold text-gray-900 mb-2">Call Us</h3>
             
              <p class="text-secondary2 font-medium">+66 931711110</p>
            </div>

            <!-- Visit Us -->
            <div class="bg-white rounded-xl shadow-lg p-6">
              <div class="flex items-center mb-4">
                <div class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-secondary1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
              </div>
              <h3 class="font-semibold text-secondary2 mb-2">Visit Us</h3>
              <p class="text-secondary2 font-medium">Chiang Mai University</p>
               <p><strong>Hours: </strong> 08:00–18:00</p>
            </div>

          </div>

          <!-- Live Chat -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-secondary1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
            </div>
            <h3 class="font-semibold text-secondary2 mb-2">Contact Info</h3>
             <p>suparuthong@gmail.com</p>
          
          </div>

          <!-- Map -->
          <div class="bg-white rounded-xl shadow-lg overflow-hidden">
            <div class="h-64 bg-gray-200 flex items-center justify-center">
              <div class="text-center">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                </svg>
                <p class="text-gray-500">Interactive Map</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- FAQ Section -->
    <div class="bg-white border-t">
      <div class="max-w-7xl mx-auto px-4 py-16">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          <!-- FAQ Header -->
          <div>
            <p class="text-sm font-medium text-secondary2 mb-2">FAQ</p>
            <h2 class="text-3xl font-bold text-accent2 mb-6">
              Frequently<br>
              asked<br>
              questions.
            </h2>
          </div>

          <!-- FAQ Items -->
          <div class="space-y-6">
            <div
              v-for="(faq, index) in faqs"
              :key="index"
              class="border-b border-gray-200 pb-6 last:border-b-0"
            >
              <button
                @click="toggleFaq(index)"
                class="w-full text-left flex justify-between items-center group"
              >
                <h3 class="font-semibold text-accent2 group-hover:text-secondary2 transition-colors">
                  {{ faq.question }}
                </h3>
                <div
                  class="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 transition-transform"
                  :class="{ 'rotate-45': faq.isOpen }"
                >
                  <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </div>
              </button>
              <div
                v-show="faq.isOpen"
                class="mt-4 text-gray-600 leading-relaxed"
              >
                {{ faq.answer }}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

  
<Footer/>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import Nav from '@/components/Nav.vue'
import Footer from '@/components/Footer.vue'
interface ContactForm {
  name: string
  email: string
  interest: string
  phone: string
  message: string
}

interface FAQ {
  question: string
  answer: string
  isOpen: boolean
}

const form = reactive<ContactForm>({
  name: '',
  email: '',
  interest: '',
  phone: '',
  message: ''
})

const isSubmitting = ref(false)

const faqs = ref<FAQ[]>([
  {
    question: 'How does TripPlanner work?',
    answer: 'Our AI helps you build a complete travel plan based on your inputs like destination, budget, and trip type.',
    isOpen: false
  },
  {
    question: 'Is TripPlanner free?',
    answer: 'Yes! You can plan your trips for free. Charges apply only when booking flights, hotels, or activities.',
    isOpen: false
  },
  {
    question: 'Can I change my itinerary?',
    answer: 'Absolutely. Everything is editable. You can remove, reorder, or regenerate activities anytime.',
    isOpen: false
  },
  {
    question: 'How can I reach support?',
    answer: 'Use this form, email us, or call during support hours. We typically respond within 24 hours.',
    isOpen: false
  },
  
])

const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    alert('Message sent successfully!')
    
    // Reset form
    form.name = ''
    form.email = ''
    form.interest = ''
    form.phone = ''
    form.message = ''
    
  } catch (error) {
    alert('Failed to send message. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const toggleFaq = (index: number) => {
  faqs.value[index].isOpen = !faqs.value[index].isOpen
}


</script>

<style scoped>
/* Custom scrollbar for textarea */
textarea::-webkit-scrollbar {
  width: 6px;
}

textarea::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

textarea::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>