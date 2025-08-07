<template>
  <div class="w-full flex justify-center ">
    <div class="flex items-center justify-between w-[720px] relative">
      <!-- Line background -->
      <div class="absolute top-10 left-0 right-0 h-1 bg-gradient-to-r from-black via-teal-300 to-pink-100 rounded z-0"></div>

      <!-- Step 1 -->
      <RouterLink
        :to="{ name: 'flight', params: { tripId: tripStore.tripId } }"
        :class="[stepWrapperClass, isLinkActive('flight').value && activeWrapper]"
      >
      <div class="step-circle group-hover:bg-teal-500 group-hover:text-white">

          <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
          </svg>
        </div>
        <span class="step-label">Flights</span>
      </RouterLink>

      <!-- Step 2 -->
      <RouterLink
        :to="{ name: 'hotel', params: { tripId: tripStore.tripId } }"
        :class="[stepWrapperClass, isLinkActive('hotel').value && activeWrapper]"
      >
      <div class="step-circle group-hover:bg-teal-500 group-hover:text-white">

          <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a2 2 0 00-2 2v2H4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-4V4a2 2 0 00-2-2zM4 8h12v8H4V8zm6-2h-2V4h2v2z"/>
          </svg>
        </div>
        <span class="step-label">Hotels</span>
      </RouterLink>

      <!-- Step 3 -->
      <RouterLink
        :to="{ name: 'schedule', params: { tripId: tripStore.tripId } }"
        :class="[stepWrapperClass, isLinkActive('schedule').value && activeWrapper]"
      >
      <div class="step-circle group-hover:bg-teal-500 group-hover:text-white">

          <svg class="w-9 h-9" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
          </svg>
        </div>
        <span class="step-label">Trip Plan</span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';
import { useTripStore } from '@/stores/trip';
import { computed } from 'vue';

const tripStore = useTripStore();
const route = useRoute();

const isLinkActive = (name: string) => {
  return computed(() => route.name === name);
};

const stepWrapperClass = `
  relative z-10 flex flex-col items-center group
  transition-transform duration-300 ease-in-out
  hover:scale-105 bg-transparent
`;

const activeWrapper = 'scale-110 text-teal-700';

</script>

<style scoped>
.step-circle {
  @apply w-20 h-20 flex items-center justify-center rounded-full bg-white border-2 border-teal-400 text-teal-600 shadow-md transition-all duration-300 ease-in-out;
}

.step-label {
  @apply mt-2 text-base font-semibold text-gray-600;
}

.group {
  background-color: transparent;
}

/* Clean hover */
.group:hover {
  background-color: transparent ;
}

</style>
