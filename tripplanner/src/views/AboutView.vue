<template>
  <div class="min-h-screen bg-background">
    <Navbar />
    
    <!-- Hero Section - Light Green Background -->
    <section class="bg-gray-900 py-20">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center font-playfair">
        <h1 class="text-4xl lg:text-4xl font-bold text-background mt-10 mb-4">
          About Us
        </h1>
      </div>
    </section>

    <!-- Mission Section - White Background -->
    <section class="bg-background py-16">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-4xl font-semibold text-accent2 mb-8">
          Our Mission
        </h2>
        <p class="text-lg text-accent2 leading-relaxed max-w-2xl mx-auto">
          To democratize travel planning by providing intelligent, personalized tools that help everyone create amazing journeys, regardless of their experience or budget.
        </p>
      </div>
    </section>

    <!-- Why We Started Section - Light Gray Background -->
    <section class="bg-gray-100 py-16">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 class="text-4xl font-semibold text-accent2 mb-8">
              Why We Started<br>
              Trip Planner Helper
            </h2>
          </div>
          <div class="space-y-6">
            <p class="text-accent2 text-lg leading-relaxed">
              Travel planning used to be overwhelming. Hours spent researching destinations, comparing prices, and organizing itineraries often left people frustrated before their trip even began.
            </p>
            <p class="text-accent2 text-lg leading-relaxed">
              We founded TripPlanner to change that. By combining artificial intelligence with years of travel expertise, we've created a platform that makes planning as exciting as the journey itself.
            </p>
            <p class="text-accent2 text-lg leading-relaxed">
              Today, we're proud to help thousands of travelers create unforgettable experiences with confidence and ease.
            </p>
          </div>
        </div>
      </div>
    </section>


  
 <!-- Our Values -->
  <section class="text-center backdrop-blur-xl bg-background mt-12 rounded-3xl px-10">
    <h2 class="text-3xl font-bold text-accent2 mb-4">Our Values</h2>
    <p class="text-accent2 mb-12 text-lg">The principles that guide everything we do</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mx-8 md:mx-32 lg:mx-64">
      <div class="bg-white border rounded-xl p-6 shadow text-center hover:shadow-lg hover:scale-105 transition duration-300">
        <div class="text-accent2 text-4xl mb-3">
          <i class="fas fa-heart"></i>
        </div>
        <h4 class="font-semibold mb-2 text-lg">Passion for Travel</h4>
        <p class="text-sm text-accent2">
          We believe travel enriches lives and creates lasting memories. Our passion drives us to help you discover amazing destinations.
        </p>
      </div>
      
      <div class="bg-white border rounded-xl p-6 shadow text-center hover:shadow-lg hover:scale-105 transition duration-300">
        <div class="text-accent2 text-4xl mb-3">
          <i class="fas fa-user"></i>
        </div>
        <h4 class="font-semibold mb-2 text-lg">Customer First</h4>
        <p class="text-sm text-accent2">
          Your perfect trip is our priority. We listen to your needs and tailor our recommendations to match your travel style.
        </p>
      </div>
      
      <div class="bg-white border rounded-xl p-6 shadow text-center hover:shadow-lg hover:scale-105 transition duration-300">
        <div class="text-accent2 text-4xl mb-3">
          <i class="fas fa-edit"></i>
        </div>
        <h4 class="font-semibold mb-2 text-lg">Simplicity</h4>
        <p class="text-sm text-accent2">
          Travel planning should be exciting, not overwhelming. We make it simple to create detailed itineraries with just a few clicks.
        </p>
      </div>
      
      <div class="bg-white border rounded-xl p-6 shadow text-center hover:shadow-lg hover:scale-105 transition duration-300">
        <div class="text-accent2 text-4xl mb-3">
          <i class="fas fa-star"></i>
        </div>
        <h4 class="font-semibold mb-2 text-lg">Excellence</h4>
        <p class="text-sm text-accent2">
          We strive for excellence in every feature, ensuring our platform provides the best possible trip planning experience.
        </p>
      </div>
    </div>
  </section>


    <!-- Our Team Section - Blue Background -->
    <section class="bg-background py-16">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-4xl font-semibold text-accent2 mb-12">
          Our Member
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <div 
            v-for="member in teamMembers" 
            :key="member.id"
            class="bg-gray-50 rounded-lg p-8 min-h-[250px] flex flex-col justify-center items-center"
          >
            <div 
              class="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4"
              :class="member.avatarColor"
            >
              {{ member.initials }}
            </div>
            <h3 class="text-xl font-semibold text-accent2 mb-2">
              {{ member.name }}
            </h3>
            <p class="text-blue-600 text-sm font-medium mb-4">
              {{ member.studentId }}
            </p>
            <p class="text-accent2 text-center leading-relaxed">
              {{ member.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

  </div>
<Footer/>
</template>

<script setup lang="ts">
import Navbar from '../components/Nav.vue'
import Footer from '@/components/Footer.vue'

interface Value {
  title: string
  icon: string
  description: string
}

interface TeamMember {
  id: string
  name: string
  studentId: string
  initials: string
  avatarColor: string
  description: string
}

const values: Value[] = [
  {
    title: 'Passion for Travel',
    icon: '❤️',
    description: 'We believe travel enriches lives and creates lasting memories.'
  },
  {
    title: 'Customer First',
    icon: '👤',
    description: 'Your perfect trip is our priority. We tailor recommendations to your style.'
  },
  {
    title: 'Simplicity',
    icon: '✏️',
    description: 'Travel planning should be exciting, not overwhelming.'
  },
  {
    title: 'Excellence',
    icon: '⭐',
    description: 'We strive for excellence in every feature we build.'
  }
]

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Matchima Khamyod',
    studentId: '652115041',
    initials: 'MK',
    avatarColor: 'bg-secondary1',
    description: 'Creative thinker with a passion for intuitive user experiences. Matchima focuses on building features that travelers love.'
  },
  {
    id: '2',
    name: 'Supharat Saelee',
    studentId: '652115048',
    initials: 'SS',
    avatarColor: 'bg-purple-200',
    description: 'Engineer with a love for travel and technology. Supharat turns ideas into real tools that help people explore the world.'
  }
]
</script>

<style scoped>
/* Clean, minimal styling */
</style>