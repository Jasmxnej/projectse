<template>
  <div class="w-full flex justify-center py-6">
    <div class="flex items-center justify-between w-[720px] relative">
      <!-- Line background -->
      <div class="absolute top-3 left-0 right-0 h-0.5 bg-gray-300 z-0"></div>
      
      <!-- Active progress line -->
      <div 
        class="absolute top-3 left-0 h-0.5 bg-secondary2 z-0 transition-all duration-500 ease-in-out"
        :style="{ width: progressWidth + '%' }"
      ></div>

      <!-- Step indicators (circles) -->
      <div class="absolute top-0 left-0 w-full flex justify-between z-10">
        <!-- Circle for Step 1 -->
        <div :class="[circleClass, getCircleState(1)]"></div>
        <!-- Circle for Step 2 -->
        <div :class="[circleClass, getCircleState(2)]"></div>
        <!-- Circle for Step 3 -->
        <div :class="[circleClass, getCircleState(3)]"></div>
      </div>

      <!-- Step 1: Flights -->
      <RouterLink
        :to="{ name: 'flight', params: { tripId: tripStore.tripId } }"
        :class="[stepWrapperClass, isLinkActive('flight').value && activeWrapper]"
      >
        <span :class="[stepLabelBaseClass, getStepLabelClass(1)]">Flights</span>
      </RouterLink>

      <!-- Step 2: Hotels -->
      <RouterLink
        :to="{ name: 'hotel', params: { tripId: tripStore.tripId } }"
        :class="[stepWrapperClass, isLinkActive('hotel').value && activeWrapper]"
      >
        <span :class="[stepLabelBaseClass, getStepLabelClass(2)]">Hotels</span>
      </RouterLink>

      <!-- Step 3: Trip Plan -->
      <RouterLink
        :to="{ name: 'schedule', params: { tripId: tripStore.tripId } }"
        :class="[stepWrapperClass, isLinkActive('schedule').value && activeWrapper]"
      >
        <span :class="[stepLabelBaseClass, getStepLabelClass(3)]">Trip Plan</span>
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

// Determine current step based on route
const currentStep = computed(() => {
  const routeName = route.name as string;
  switch (routeName) {
    case 'flight':
      return 1;
    case 'hotel':
      return 2;
    case 'schedule':
      return 3;
    default:
      return 1;
  }
});

// Progress width calculation
const progressWidth = computed(() => {
  return ((currentStep.value - 1) / 2) * 100;
});

const isLinkActive = (name: string) => {
  return computed(() => route.name === name);
};

const stepWrapperClass = `
  relative z-20 flex flex-col items-center group
  transition-all duration-300 ease-in-out
  hover:scale-105 bg-transparent pt-8
`;

const activeWrapper = 'text-secondary2 font-semibold';

const stepLabelBaseClass = `
  text-sm font-medium transition-colors duration-300
`;

const circleClass = `
  w-6 h-6 rounded-full border-2 transition-all duration-300 ease-in-out
`;

// Get circle state classes
const getCircleState = (stepNumber: number): string => {
  if (currentStep.value === stepNumber) {
    return 'bg-secondary2 border-secondary2';
  } else if (currentStep.value > stepNumber) {
    return 'bg-secondary2 border-secondary2';
  } else {
    return 'bg-white border-gray-300';
  }
};

// Get step label classes based on current step
const getStepLabelClass = (stepNumber: number): string => {
  if (currentStep.value === stepNumber) {
    return 'text-secondary2 font-semibold';
  } else if (currentStep.value > stepNumber) {
    return 'text-gray-600';
  } else {
    return 'text-gray-400';
  }
};
</script>

<style scoped>
.group {
  background-color: transparent;
}

/* Clean hover */
.group:hover {
  background-color: transparent;
}
</style>