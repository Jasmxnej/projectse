<template>
  <Navbar />
  <div class="min-h-screen w-full bg-background overflow-x-hidden">

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
          
          </div>
        </transition>
          <div class="mt-2">
              <button
                @click="navigateToStartPlan"
                class="bg-red text-white px-6 py-2 rounded-3xl shadow-2xl shadow-gray-500 font-didact hover:text-white"
              >
                Start Planning
              </button>
            </div>
      </div>
    </div>




    <!-- Planning Section -->
    <section ref="planningSection" class="py-24 px-8 bg-background">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl md:text-4xl text-center mb-4 text-gray-800 font-playfair font-semibold max-w-3xl mx-auto tracking-widest leading-tight">
          PLAN YOUR JOURNEY<br> FROM <span class="italic">START</span>  TO <span class="italic"> FINISH</span></br>
        </h2>
         <h3 class="text-xl md:text-xl font-light text-center mb-12 text-gray-800 max-w-1xl mx-auto leading-tight">
          Our website helps you create a complete travel plan that keeps everything organized in one place.
        </h3>
        
        <!-- Steps -->
        <div class="grid md:grid-cols-3 gap-8">
          <div 
            v-for="step in steps" 
            :key="step.id"
            class="text-center group"
          >
            <div class="bg-gray-300 h-60 w-100 mb-6 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:bg-gray-400">
              <span class="text-5xl font-light text-gray-600">{{ step.id }}</span>
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ step.title }}</h3>
            <p class="text-gray-600 leading-relaxed text-sm">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

  <!-- AI Planning Section -->
  <section 
    class="py-16 px-8 bg-secondary1" 
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="max-w-6xl mx-auto">
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div class="space-y-4">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
            AI-Powered Trip Planning
          </h2>
          <p class="text-lg text-gray-700 leading-relaxed">
            Just enter your trip details — and let our smart planner create the perfect journey for you.
          </p>
        </div>
        
        <!-- Interactive Demo Container -->
        <div class="relative bg-white h-72 rounded-2xl shadow-lg overflow-hidden">
          <!-- Background Pattern -->
          <div class="absolute inset-0 opacity-5">
            <div class="grid grid-cols-8 gap-2 h-full p-4">
              <div v-for="i in 32" :key="i" class="bg-blue-500 rounded"></div>
            </div>
          </div>
          
          <!-- Main Content -->
          <div class="relative h-full flex flex-col items-center justify-center p-8 space-y-6">
            <!-- Form Elements Mockup -->
            <div class="w-full space-y-3">
              <div class="h-3 bg-gray-200 rounded-full w-3/4 mx-auto animate-pulse"></div>
              <div class="h-3 bg-gray-200 rounded-full w-1/2 mx-auto animate-pulse" style="animation-delay: 0.2s"></div>
              <div class="h-3 bg-gray-200 rounded-full w-5/6 mx-auto animate-pulse" style="animation-delay: 0.4s"></div>
            </div>
            
            <!-- AI Generate Button -->
            <button
              ref="generateButton"
              :class="[
                'relative px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600',
                'text-white font-semibold rounded-lg shadow-lg transform transition-all duration-200',
                'hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300',
                isClicked ? 'scale-95' : 'scale-100'
              ]"
              @click="handleButtonClick"
            >
              <span class="flex items-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>AI Generate</span>
              </span>
              
              <!-- Click Ripple Effect -->
              <div v-if="showRipple" class="absolute inset-0 rounded-lg">
                <div class="absolute inset-0 bg-white opacity-20 rounded-lg animate-ping"></div>
              </div>
            </button>
            
            <!-- Animated Mouse Cursor -->
           <div 
  :class="[
    'absolute pointer-events-none transition-transform duration-1000 ease-in-out z-10',
    mouseVisible ? 'opacity-100' : 'opacity-0'
  ]"
  :style="{ 
    transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
  }"
>
              <!-- Mouse Cursor SVG -->
              <svg width="24" height="24" viewBox="0 0 24 24" class="drop-shadow-lg">
                <path d="M5 3v18l4-4h4l-8-14z" fill="white" stroke="#374151" stroke-width="1"/>
                <path d="M5 3v18l4-4h4l-8-14z" fill="url(#cursorGradient)"/>
                <defs>
                  <linearGradient id="cursorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
                  </linearGradient>
                </defs>
              </svg>
              
              <!-- Click Animation -->
              <div v-if="showClickAnimation" class="absolute inset-0 flex items-center justify-center">
                <div class="w-6 h-6 border-2 border-blue-500 rounded-full animate-ping"></div>
              </div>
            </div>
            
            <!-- Loading Dots -->
            <div v-if="isGenerating" class="flex space-x-2">
              <div v-for="i in 3" :key="i" 
                   class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                   :style="{ animationDelay: `${i * 0.1}s` }">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  
<!-- Ready Section -->
<section class="py-16 px-8 bg-background">
  <div class="max-w-6xl mx-auto">
    <div class="grid md:grid-cols-2 gap-12 items-center mb-12">
      <!-- Picture 3 with hover effect -->
      <div class="relative bg-gray-300 h-64 rounded-lg overflow-hidden group cursor-pointer">
        <img :src="pic1" alt="Ready Image 3" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <!-- Hover overlay -->
        <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div class="text-white text-center">
            <h3 class="text-xl md:text-2xl font-bold mb-1">Doi Inthanon</h3>
            <p class="text-sm md:text-base opacity-90">Chiangmai</p>
          </div>
        </div>
      </div>
      
      <div class="space-y-4">
        <h2 class="text-3xl md:text-4xl font-semibold text-gray-800 leading-tight">
          See the World, We’ll Handle the Plan.
        </h2>
        <p class="text-lg text-gray-700 leading-relaxed">
          Explore stunning places while we take care of every detail.
        </p>
      </div>
    </div>
    
    <!-- Bottom Images -->
    <div class="grid md:grid-cols-2 gap-12">
      <!-- Picture 1 with hover effect -->
      <div class="relative bg-gray-300 h-64 rounded-2xl overflow-hidden group cursor-pointer">
        <img :src="pic3" alt="Ready Image 1" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <!-- Hover overlay -->
        <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div class="text-white text-center">
            <h3 class="text-xl md:text-2xl font-bold mb-1">Chiang Dao</h3>
            <p class="text-sm md:text-base opacity-90">Chiangmai</p>
          </div>
        </div>
      </div>
      
      <!-- Picture 2 with hover effect -->
      <div class="relative bg-gray-300 h-64 rounded-2xl overflow-hidden group cursor-pointer">
        <img :src="pic2" alt="Ready Image 2" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <!-- Hover overlay -->
        <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div class="text-white text-center">
            <h3 class="text-xl md:text-2xl font-bold">Krabi</h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

    <div class="mt-52"></div>

    <!-- Half Circle Outside (True semicircle shape) -->
<section class="relative py-2 px-8 bg-secondary1 mb-2">
  <!-- Half Circle as background -->
  <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[1600px] h-[640px] bg-secondary1 rounded-t-full z-0">
  <!-- Heading inside the semicircle -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full text-center z-10 pt-24">
    <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
      What Travelers Are Saying
    </h2>
    <p class="text-lg text-gray-600">
      Real stories from people who planned with us.
    </p>
  </div>
</div>


 

  <!-- Testimonials -->
  <div class="relative z-10 max-w-5xl mx-auto mt-32 mb-10">
    <div class="grid md:grid-cols-3 gap-6">
      <div
        v-for="testimonial in testimonials"
        :key="testimonial.id"
        class="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      >
        <div class="flex items-center mb-4">
          <div
            class="w-10 h-10 rounded-full mr-3 flex items-center justify-center text-white font-semibold text-sm shadow-md"
            :style="{ backgroundColor: testimonial.color }"
          >
            {{ testimonial.name.charAt(0) }}
          </div>
          <div>
            <h4 class="font-semibold text-gray-800 text-sm">{{ testimonial.name }}</h4>
            <p class="text-gray-600 text-xs">{{ testimonial.location }}</p>
          </div>
        </div>
        <p class="text-gray-700 leading-relaxed text-sm">"{{ testimonial.quote }}"</p>
      </div>
    </div>
  </div>
</section>

  <div class="mt-32"></div>
    <!-- Call to Action -->
    <section class="py-16 px-8 bg-gradient-to-brrounded-t-[80px]">
      <div class="max-w-3xl mx-auto text-center text-black space-y-6">
        <h2 class="text-3xl md:text-5xl font-light leading-tight">
          Your adventure starts here<br>
          let's plan it together.
        </h2>
        <p class="text-lg opacity-90 max-w-xl mx-auto leading-relaxed">
          Discover the perfect way to organize your alpine travels. Whether you're planning your first mountain adventure or your hundredth summit, we're here to help.
        </p>
        <button
          @click="navigateToStartPlan"
          class="bg-accent1 text-gray-900 px-8 py-3 rounded-full text-base font-medium hover:bg-accent2 hover:text-white transition-all duration-300 transform hover:scale-105 shadow-xl mt-6"
        >
          start planning
        </button>
      </div>
    </section>
  </div>
  <Footer/>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, type Ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import mountainImage from '@/assets/mountains.webp'
import seaImage from '@/assets/sea.jpg'
import templeImage from '@/assets/temple.jpg'
import Navbar from '../components/Nav.vue';
import Footer from '@/components/Footer.vue'
import pic1 from '@/assets/pic1.jpg'
import pic2 from '@/assets/pic2.jpg'
import pic3 from '@/assets/pic3.jpeg'

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
  color: BackgroundColor | undefined
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
    color: "#FFB6C1",
    location: "Colorado, USA",
    quote: "The planning tools made our Himalayan trek absolutely incredible. Every detail was perfect!"
  },
  {
    id: 2,
    name: "Marcus Chen",
    color: "#87CEEB", 
    location: "Vancouver, Canada",
    quote: "I've never felt more prepared for a mountain adventure. The AI recommendations were spot-on."
  },
  {
    id: 3,
    name: "Elena Rodriguez",
     color: "#FFD700", 
    location: "Barcelona, Spain",
    quote: "From gear suggestions to route planning, this platform transformed how I approach mountain travel."
  },
 
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

// Reactive state
const generateButton = ref<HTMLElement>()
const mousePosition = ref({ x: 0, y: 0 })
const mouseVisible = ref(false)
const isClicked = ref(false)
const showRipple = ref(false)
const showClickAnimation = ref(false)
const isGenerating = ref(false)

// Animation timing
let animationTimer: number | null = null
let animationInterval: number | null = null

// Mouse animation sequence
const animateMouseClick = async () => {
  if (!generateButton.value) return
  
  // Get the container element (the white demo box)
  const container = generateButton.value.closest('.relative') as HTMLElement
  if (!container) return
  
  // Get button position relative to the container
  const containerRect = container.getBoundingClientRect()
  const buttonRect = generateButton.value.getBoundingClientRect()
  
  // Calculate button center relative to container's top-left corner
  const buttonCenterX = buttonRect.left - containerRect.left + buttonRect.width / 2
  const buttonCenterY = buttonRect.top - containerRect.top + buttonRect.height / 2
  
  // Start position (top-right of container, but inside it)
  const startX = container.offsetWidth - 60
  const startY = 40
  
  // Show mouse cursor at start position
  mousePosition.value = { x: startX, y: startY }
  mouseVisible.value = true
  
  // Wait a bit, then smoothly move to button
  await new Promise(resolve => setTimeout(resolve, 600))
  
  // Move to button center
  mousePosition.value = { x: buttonCenterX -12 , y: buttonCenterY -12 + 20 }
  
  // Wait for mouse to reach button
  await new Promise(resolve => setTimeout(resolve, 1200))
  
  // Trigger the actual button click programmatically
  showClickAnimation.value = true
  isClicked.value = true
  showRipple.value = true
  isGenerating.value = true
  
  // Also trigger the button's click handler
  generateButton.value.click()
  
  // Hide click animation
  setTimeout(() => {
    showClickAnimation.value = false
    isClicked.value = false
    showRipple.value = false
  }, 300)
  
  // Hide mouse cursor after animation completes
  setTimeout(() => {
    mouseVisible.value = false
  }, 2500)
}

// Button click handler
const handleButtonClick = () => {
  isClicked.value = true
  showRipple.value = true
  isGenerating.value = true
  
  setTimeout(() => {
    isClicked.value = false
    showRipple.value = false
  }, 200)
  
  setTimeout(() => {
    isGenerating.value = false
  }, 1500)
}

// Handle mouse enter event
const handleMouseEnter = () => {
  // Clear any existing timer
  if (animationTimer) {
    clearTimeout(animationTimer)
    animationTimer = null
  }
  
  // Start animation after a short delay
  animationTimer = setTimeout(() => {
    animateMouseClick()
  }, 500)
}

// Handle mouse leave event
const handleMouseLeave = () => {
  // Clear timer when mouse leaves
  if (animationTimer) {
    clearTimeout(animationTimer)
    animationTimer = null
  }
  
  // Hide animated mouse cursor if visible
  mouseVisible.value = false
  showClickAnimation.value = false
  isClicked.value = false
  showRipple.value = false
}

// Lifecycle hooks
onMounted(() => {
  // No automatic animation on mount
})

onUnmounted(() => {
  if (animationTimer) {
    clearTimeout(animationTimer)
  }
  if (animationInterval) {
    clearInterval(animationInterval)
  }
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

/* ::-webkit-scrollbar-thumb {
  background: #f97316;
  border-radius: 4px;
} */

/* ::-webkit-scrollbar-thumb:hover {
  background: #ea580c;
} */

.bg-secondary1 {
  background-color: #f8fafc; /* Adjust this color to match your design */
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}


</style>
