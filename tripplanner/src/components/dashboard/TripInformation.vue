<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <WelcomeItem :username="username" :destination="destination.toUpperCase()" />
      <button
        @click="saveAsPdf"
        class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
      >
        Save as PDF
      </button>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <BudgetCard
        :totalBudget="totalBudget"
        :computedPlannedExpenses="computedPlannedExpenses"
      />
      <FlightCard v-if="selectedFlight" :flight="selectedFlight" :dictionaries="flightDictionaries" />
      <HotelCard :selectedHotel="selectedHotel" />
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <WeatherCard :weatherDescription="weatherDescription" />
      <WhatToWearCard :whatToWearDescription="whatToWearDescription" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import WelcomeItem from '@/components/WelcomeItem.vue';
import BudgetCard from '@/components/BudgetCard.vue';
import FlightCard from '@/components/FlightCard.vue';
import HotelCard from '@/components/hotel/HotelCard.vue';
import WeatherCard from '@/components/WeatherCard.vue';
import WhatToWearCard from '@/components/WhatToWearCard.vue';
import type { Flight, FlightDictionaries } from '@/types/flight';
import type { Hotel } from '@/types/hotel';

defineProps({
  username: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  totalBudget: {
    type: Number,
    required: true,
  },
  computedPlannedExpenses: {
    type: Object as () => { plan: number; flight: number; hotel: number; total: number },
    required: true,
  },
  selectedFlight: {
    type: Object as () => Flight | null,
    required: false,
    default: null,
  },
  flightDictionaries: {
    type: Object as () => FlightDictionaries,
    required: true,
  },
  selectedHotel: {
    type: Object as () => Hotel | null,
    required: false,
    default: null,
  },
  weatherDescription: {
    type: String,
    required: true,
  },
  whatToWearDescription: {
    type: String,
    required: true,
  },
  saveAsPdf: {
    type: Function as unknown as () => (event: MouseEvent) => void,
    required: true,
  },
});
</script>