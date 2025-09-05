<template>
  <Navbar />
  <div class="min-h-screen w-full bg-[#d2f1f9] overflow-x-hidden">

    <!-- Hero Section -->
    <div
      class="relative w-screen min-h-screen pt-20 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
      :style="{ backgroundImage: `url(${currentSlideData.image})` }"
    >
      <div
        class="absolute inset-0 flex flex-col items-center justify-center text-white font-cardo text-center px-4"
      >
        <h2 class="text-6xl sm:text-6xl py-2 mb-2">Explore</h2>
        <transition name="fade" mode="out-in">
          <div v-if="showText" :key="currentSlide">
            <h1 class="text-4xl sm:text-4xl font-bold mb-2">
              {{ currentSlideData.title }}
            </h1>
            <p class="text-base font-didact sm:text-lg mb-6">
              {{ currentSlideData.subtitle }}
            </p>
            <div class="mt-8">
              <button
                @click="navigateToStartPlan"
                class="bg-red text-white px-6 py-2 rounded-3xl shadow-2xl shadow-gray-500 font-didact hover:text-white"
              >
                Start Planning
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>





    <!-- Planning Section -->
    <section ref="planningSection" class="py-20 px-8">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-4xl md:text-5xl font-light text-center mb-16 text-gray-800">
          Plan your journey from start to finish.
        </h2>
        
        <!-- Steps -->
        <div class="grid md:grid-cols-3 gap-8 mb-20">
          <div 
            v-for="step in steps" 
            :key="step.id"
            class="text-center group cursor-pointer transform transition-all duration-300 hover:scale-105"
          >
            <div class="bg-gray-200 h-64 mb-6 rounded-lg flex items-center justify-center group-hover:bg-gray-300 transition-colors duration-300">
              <span class="text-6xl font-light text-gray-600">{{ step.id }}</span>
            </div>
            <h3 class="text-xl font-medium text-gray-800 mb-2">{{ step.title }}</h3>
            <p class="text-gray-600">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- AI Planning Section -->
    <section class="py-20 px-8 bg-gray-50">
      <div class="max-w-6xl mx-auto">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-4xl font-light mb-6 text-gray-800 italic">AI-Powered Trip Planning</h2>
            <p class="text-xl text-gray-600 leading-relaxed">
              Just enter your trip details — and let our smart planner create the perfect journey for you.
            </p>
          </div>
          <div class="bg-gray-300 h-80 rounded-lg"></div>
        </div>
      </div>
    </section>

    <!-- Ready Section -->
    <section class="py-20 px-8">
      <div class="max-w-6xl mx-auto">
        <div class="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div class="bg-gray-300 h-64 rounded-lg"></div>
          <div>
            <h2 class="text-4xl font-light mb-6 text-gray-800 italic">Stay Ready for Every Step</h2>
            <p class="text-xl text-gray-600 leading-relaxed">
              From what to pack to where to go — we've got you covered.
            </p>
          </div>
        </div>
        
        <!-- Bottom Images -->
        <div class="grid md:grid-cols-2 gap-8">
          <div class="bg-gray-300 h-48 rounded-lg"></div>
          <div class="bg-gray-300 h-48 rounded-lg"></div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="py-20 px-8 bg-gray-50">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl font-light mb-4 text-gray-800 italic">What Travelers Are Saying</h2>
        <p class="text-xl text-gray-600 mb-16">Real stories from people who planned with us.</p>
        
        <div class="grid md:grid-cols-2 gap-8">
          <div 
            v-for="testimonial in testimonials" 
            :key="testimonial.id"
            class="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div class="flex items-center mb-4">
              <div class="bg-gray-300 w-12 h-12 rounded-full mr-4"></div>
              <div>
                <h4 class="font-semibold text-gray-800">{{ testimonial.name }}</h4>
                <p class="text-gray-600 text-sm">{{ testimonial.location }}</p>
              </div>
            </div>
            <p class="text-gray-700 italic">"{{ testimonial.quote }}"</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="py-20 px-8 bg-gradient-to-r from-orange-500 to-orange-600">
      <div class="max-w-4xl mx-auto text-center text-white">
        <h2 class="text-4xl md:text-5xl font-light mb-8">Ready to Start Your Adventure?</h2>
        
          <button
          @click="navigateToStartPlan"
          class="bg-white text-orange-600 px-12 py-4 rounded-full text-lg font-medium hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105"
        >
          Start Planning
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import mountainImage from '@/assets/mountains.webp'
import seaImage from '@/assets/sea.jpg'
import templeImage from '@/assets/temple.jpg'
import Navbar from '../components/Nav.vue';
interface Slide {
  image: string
  title: string
  subtitle: string
}

interface Step {
  id: number
  title: string
  description: string
}

interface Testimonial {
  id: number
  name: string
  location: string
  quote: string
}

const planningSection = ref<HTMLElement | null>(null)
const router = useRouter()
const authStore = useAuthStore()

const slides: Ref<Slide[]> = ref([
  {
    image: mountainImage,
    title: 'THE MOUNTAINS',
    subtitle: 'where silence meets the sky',
  },
  {
    image: seaImage,
    title: 'THE SEA',
    subtitle: 'where waves write memories',
  },
  {
    image: templeImage,
    title: 'THE TEMPLE',
    subtitle: 'where peace lives in every stone',
  },
])

const currentSlide: Ref<number> = ref(0)
const showText: Ref<boolean> = ref(true)

const currentSlideData = computed<Slide>(() => slides.value[currentSlide.value])

const steps: Step[] = [
  {
    id: 1,
    title: "Choose Your Destination",
    description: "Select from our curated list of breathtaking mountain destinations around the world."
  },
  {
    id: 2,
    title: "Plan Your Route",
    description: "Our AI-powered planner creates the perfect itinerary based on your preferences and experience level."
  },
  {
    id: 3,
    title: "Pack & Go",
    description: "Get personalized packing lists and local tips to ensure you're prepared for your adventure."
  }
]

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "Colorado, USA",
    quote: "The planning tools made our Himalayan trek absolutely incredible. Every detail was perfect!"
  },
  {
    id: 2,
    name: "Marcus Chen",
    location: "Vancouver, Canada",
    quote: "I've never felt more prepared for a mountain adventure. The AI recommendations were spot-on."
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    location: "Barcelona, Spain",
    quote: "From gear suggestions to route planning, this platform transformed how I approach mountain travel."
  },
  {
    id: 4,
    name: "David Thompson",
    location: "Sydney, Australia",
    quote: "The personalized itinerary helped us discover hidden gems we never would have found on our own."
  }
]

const scrollToPlanning = (): void => {
  if (planningSection.value) {
    planningSection.value.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}

const navigateToStartPlan = () => {
  if (authStore.isAuthenticated) {
    router.push('/startplan')
  } else {
    router.push('/login')
  }
}

onMounted(() => {
  // Add smooth scrolling behavior for better UX
  document.documentElement.style.scrollBehavior = 'smooth'
  
  // Slideshow functionality
  setInterval(() => {
    showText.value = false
    setTimeout(() => {
      currentSlide.value = (currentSlide.value + 1) % slides.value.length
      showText.value = true
    }, 1000) // Duration of the fade transition
  }, 10000) // Total time per slide (10 seconds)
})
</script>

<style scoped>
/* Fade transition for text */
.fade-enter-active, .fade-leave-active {
  transition: opacity 1s ease-in-out;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Custom animations and transitions */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.8s ease-out;
}

/* Ensure proper font rendering */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #f97316;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #ea580c;
}



</style>
