<template>
  <div>
    <Navbar class="text-[#17637B]" />

    <div class="min-h-screen flex items-start justify-center px-6 pt-36 pb-20">
      <div class="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-10">

        <!-- Contact Form -->
        <div class="bg-white/80 backdrop-blur-lg border border-white/40 rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-xl hover:scale-[1.01] transition-all duration-300 ease-in-out">
          <h2 class="text-4xl font-bold text-[#17637B] mb-2">Let's Connect</h2>
          <p class="text-sm  text-[#17637B] mb-6">Send us a message and we'll get back to you within 24 hours.</p>
          <form @submit.prevent="sendMessage" class="space-y-5 ">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input v-model="form.name" type="text" placeholder="Your name" class="input-glass" required />
              <input v-model="form.email" type="email" placeholder="Email address" class="input-glass" required />
            </div>
            <select v-model="form.category" class="input-glass" required>
              <option disabled value="">Select category</option>
              <option>General Inquiry</option>
              <option>Technical Support</option>
              <option>Partnership</option>
            </select>
            <input v-model="form.subject" type="text" placeholder="Subject" class="input-glass" required />
            <textarea v-model="form.message" rows="4" placeholder="Type your message..." class="input-glass" required></textarea>
            <button
              type="submit"
              class="w-full py-3 rounded-full bg-gradient-to-r from-[#17637B] to-[#1d8ca7] text-white font-semibold tracking-wide shadow-md hover:shadow-lg hover:brightness-110 transition-all"
            >
              <i class="fas fa-paper-plane mr-2"></i>Send Message
            </button>
          </form>
        </div>

        <!-- Info + FAQ -->
        <div class="space-y-8">

          <!-- Contact Info -->
          <div class="bg-white/80 backdrop-blur-lg border border-white/40 rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.1)] space-y-6">
            <h2 class="text-4xl  font-bold text-[#17637B]">Contact Info</h2>
            <div class="grid grid-cols-2 gap-4 text-sm font-didact">
              <div class="info-box">
                <i class="fas fa-envelope text-xl text-[#17637B] mb-1"></i>
                <p><strong>Email</strong><br />suparuthong@gmail.com</p>
              </div>
              <div class="info-box">
                <i class="fas fa-comment text-xl text-[#17637B] mb-1"></i>
                <p><strong>Call</strong><br />+66 931711110<br />Mon–Fri</p>
              </div>
              <div class="info-box">
                <i class="fas fa-map text-xl text-[#17637B] mb-1"></i>
                <p><strong>Location</strong><br />Chiang Mai University</p>
              </div>
              <div class="info-box">
                <i class="fas fa-clock text-xl text-[#17637B] mb-1"></i>
                <p><strong>Hours</strong><br />08:00–18:00</p>
              </div>
            </div>
          </div>

          <!-- FAQs -->
          <div class="bg-white/80 backdrop-blur-lg border border-white/40 rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.1)] space-y-5">
            <h2 class="text-4xl  font-bold text-[#17637B]">FAQs</h2>
            <div v-for="(faq, i) in faqs" :key="i" class="faq-box">
              <strong>{{ faq.q }}</strong>
              <p class="text-gray-700 mt-1">{{ faq.a }}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import Navbar from '../components/Nav.vue'

const form = ref({
  name: '',
  email: '',
  category: '',
  subject: '',
  message: ''
})

const faqs = ref([
  {
    q: "How does TripPlanner work?",
    a: "Our AI helps you build a complete travel plan based on your inputs like destination, budget, and trip type."
  },
  {
    q: "Is TripPlanner free?",
    a: "Yes! You can plan your trips for free. Charges apply only when booking flights, hotels, or activities."
  },
  {
    q: "Can I change my itinerary?",
    a: "Absolutely. Everything is editable. You can remove, reorder, or regenerate activities anytime."
  },
  {
    q: "How can I reach support?",
    a: "Use this form, email us, or call during support hours. We typically respond within 24 hours."
  }
])

const sendMessage = async () => {
  try {
    await axios.post('http://localhost:3002/api/contact', form.value)
    alert('Message sent!')
    form.value = {
      name: '',
      email: '',
      category: '',
      subject: '',
      message: ''
    }
  } catch (err) {
    console.error(err)
    alert('Failed to send message. Please try again.')
  }
}
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.input-glass {
  @apply w-full rounded-xl border border-gray-300 bg-white/60 backdrop-blur-md px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#17637B] transition-all;
}

.info-box {
  @apply p-4 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col gap-1 text-[#333] hover:shadow-md hover:scale-[1.02] transition-all;
}

.faq-box {
  @apply bg-white p-4 border border-gray-200 rounded-xl text-sm shadow hover:shadow-md hover:scale-[1.01] transition-all;
}
</style>
