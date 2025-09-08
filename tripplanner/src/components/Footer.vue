<template>
    <!-- Footer CTA -->
    <div class="bg-gray-900 text-white">
      <div class="max-w-7xl mx-auto px-4 py-16">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <!-- Left Column -->
          <div>
            <h2 class="text-4xl font-bold mb-4">
              Plan With Us Today.<br>
              Getting More Done<br>
              Together.
            </h2>
          </div>

          <!-- Right Column -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
            
               <RouterLink
        to="/about"
        class="nav-link"
      
      >ABOUT US</RouterLink>
         <RouterLink
        to="/contact"
        class="nav-link"
      
      >CONTACT US</RouterLink>
        <RouterLink
        to="/mytrips"
        class="nav-link"
        
      >MY TRIP</RouterLink>
            </div>

           
          </div>
            <!-- Copyright -->
    <div class="text-center pt-8 mt-10 border-t border-white/10 px-5">
      <p class="text-sm text-white/70">
        © 2025 TRIP PLANNER HELPER All rights reserved
      </p>
    </div>
        </div>
        
      </div>
 

  

</template>

<script setup lang="ts">
import { ref } from 'vue'
import logo from '@/assets/tphlogo.png'


const email = ref<string>('')



const handleNewsletterSubmit = (): void => {
  if (email.value) {
    console.log(`Newsletter signup: ${email.value}`)
    // Add your newsletter signup logic here
    email.value = '' // Clear the input after submission
  }
}
</script>

<style scoped>
/* Additional custom styles if needed */
.footer-gradient {
  background: linear-gradient(135deg, #4338ca 0%, #3730a3 50%, #1e293b 100%);
}
</style>
