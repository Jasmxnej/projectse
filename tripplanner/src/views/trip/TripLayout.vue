<template>
  <div class="flex font-sans text-gray-800 ">
    
    <Navbar />
   
     
  
    <main class="flex-1 p-4 lg:p-8 mt-20">
      <RouterView v-slot="{ Component }">
        <component :is="Component" :tripDays="tripDays" />
      </RouterView>
    </main>
  </div>
</template>

<script setup lang="ts">
import Navbar from '@/components/Nav.vue';
import Sidebar from '@/components/Sidebar.vue';
import { RouterView } from 'vue-router';
import { useTrip } from '@/composables/useTrip';
import { computed } from 'vue';

const { tripDays } = useTrip();
</script>