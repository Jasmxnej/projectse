<template>
  <Navbar />
  <div class="w-screen overflow-x-hidden">

    <!-- Mission Background Section -->
    <div
      class="relative w-screen pt-20 pb-20 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
      :style="{ backgroundImage: `url(${mountainImage})` }"
    >
      <div class="absolute inset-0 bg-black bg-opacity-30"></div>
      <div
        class="relative z-10 flex flex-col items-center justify-center text-center text-white px-6 py-20"
      >
        <h2 class="text-5xl font-extrabold  drop-shadow-md">Our Mission</h2>
        <p class="mt-6  text-xl max-w-3xl drop-shadow-md">
          To democratize travel planning by providing intelligent, personalized tools that help everyone create amazing journeys, regardless of their experience or budget.
        </p>
      </div>
    </div>

    <div class="flex items-center justify-center px-6 pb-20">
      <div class="max-w-7xl w-full space-y-16 mt-10">

        <!-- Why We Started -->
        <section class=" mt-10 mb-20 items-center justify-center text-center lex flex-col items-center">
          <div>
            <h3 class="text-3xl font-bold text-[#17637B] mb-6 ">Why We Started TripPlanner</h3>
            <p class="text-[#17637B] mb-4  text-base font-medium">
              Travel planning used to be overwhelming. Hours spent researching destinations, comparing prices, and organizing itineraries often left people frustrated before their trip even began.
            </p>
            <p class="text-[#17637B] mb-4  text-base font-medium">
              We founded TripPlanner to change that. By combining artificial intelligence with years of travel expertise, we've created a platform that makes planning as exciting as the journey itself.
            </p>
            <p class="text-[#17637B]  text-base font-medium">
              Today, we're proud to help thousands of travelers create unforgettable experiences with confidence and ease.
            </p>
          </div>
          
        </section>

      <!-- Our Values -->
      <section class="text-center backdrop-blur-xl bg-white/80 border border-white/40 rounded-3xl p-10 shadow-2xl">
        <h2 class="text-3xl font-bold text-[#17637B] mb-4 ">Our Values</h2>
        <p class="text-[#17637B] mb-12  text-lg">The principles that guide everything we do</p>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white border rounded-xl p-6 shadow text-center hover:shadow-lg hover:scale-105 transition duration-300">
            <div class="text-[#17637B] text-4xl mb-3"><i class="fas fa-heart"></i></div>
            <h4 class="font-semibold mb-2  text-lg">Passion for Travel</h4>
            <p class="text-sm text-[#17637B] ">We believe travel enriches lives and creates lasting memories. Our passion drives us to help you discover amazing destinations.</p>
          </div>
          <div class="bg-white border rounded-xl p-6 shadow text-center hover:shadow-lg hover:scale-105 transition duration-300">
            <div class="text-[#17637B] text-4xl mb-3"><i class="fas fa-user"></i></div>
            <h4 class="font-semibold mb-2  text-lg">Customer First</h4>
            <p class="text-sm text-[#17637B] ">Your perfect trip is our priority. We listen to your needs and tailor our recommendations to match your travel style.</p>
          </div>
          <div class="bg-white border rounded-xl p-6 shadow text-center hover:shadow-lg hover:scale-105 transition duration-300">
            <div class="text-[#17637B] text-4xl mb-3"><i class="fas fa-edit"></i></div>
            <h4 class="font-semibold mb-2  text-lg">Simplicity</h4>
            <p class="text-sm text-[#17637B] t">Travel planning should be exciting, not overwhelming. We make it simple to create detailed itineraries with just a few clicks.</p>
          </div>
          <div class="bg-white border rounded-xl p-6 shadow text-center hover:shadow-lg hover:scale-105 transition duration-300">
            <div class="text-[#17637B] text-4xl mb-3"><i class="fas fa-star"></i></div>
            <h4 class="font-semibold mb-2  text-lg">Excellence</h4>
            <p class="text-sm text-[#17637B] ">We strive for excellence in every feature, ensuring our platform provides the best possible trip planning experience.</p>
          </div>
        </div>
      </section>

      <!-- Meet the Team -->
      <section class="text-center backdrop-blur-xl bg-white/80 border border-white/40 rounded-3xl p-10 shadow-2xl">
        <h2 class="text-3xl font-bold text-[#17637B] mb-4 ">Meet Our Team</h2>
        <p class="text-[#17637B] mb-10  text-lg">The passionate people behind TripPlanner</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div class="bg-white border rounded-2xl p-6 shadow text-center hover:shadow-xl hover:scale-105 transition duration-300">
            <div class="bg-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow">MK</div>
            <h4 class="font-semibold text-lg ">Matchima Khamyod</h4>
            <p class="text-sm text-blue-600 mb-2 ">652115041</p>
            <p class="text-sm text-[#17637B] ">Creative thinker with a passion for intuitive user experiences. Matchima focuses on building features that travelers love.</p>
          </div>
          <div class="bg-white border rounded-2xl p-6 shadow text-center hover:shadow-xl hover:scale-105 transition duration-300">
            <div class="bg-orange-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow">SS</div>
            <h4 class="font-semibold text-lg ">Supharat Saelee</h4>
            <p class="text-sm text-blue-600 mb-2">652115048</p>
            <p class="text-sm text-[#17637B] ">Engineer with a love for travel and technology. Supharat turns ideas into real tools that help people explore the world.</p>
          </div>
        </div>
      </section>

    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import Navbar from '../components/Nav.vue'
import mountainImage from '@/assets/mountains.webp'
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
</style>
