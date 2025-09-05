<template>
  <div class="w-full max-w-5xl mx-auto px-4 mt-20">
    <!-- Loading -->
    <div v-if="isSearching" class="text-center p-12 animate-pulse">
      <div class="flex flex-col items-center space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        <p class="text-lg font-medium text-gray-500">{{ getLoadingMessage() }}</p>
        <p class="text-sm text-gray-400">Please wait while we find the best options for you</p>
      </div>
    </div>

    <!-- Results -->
    <div
      v-else-if="flightResults.length > 0"
      class="space-y-6 animate-fade-in"
    >
    <h2 class="text-2xl font-bold text-center text-teal-800 mb-10">
  {{ flightResultsTitle }}
</h2>


      <div class="space-y-4">
        <FlightCard
          v-for="flight in flightResults"
          :key="flight.id"
          :flight="flight"
          :dictionaries="flightDictionaries"
          :selected="isSelected(flight)"
          @show-details="showFlightDetails"
          @select-flight="selectFlight"
        />
      </div>
    </div>

    <!-- Selected Flights -->
    <div v-if="selectedFlights.length > 0" class="bg-gray-50 p-4 mt-10 mb-6 rounded-xl">
      <h3 class="font-bold text-gray-700 mb-2">Selected Flights</h3>
      <ul class="text-sm text-gray-600 space-y-1">
        <li v-for="(flight, index) in selectedFlights" :key="index">
          Segment {{ index + 1 }}:
          {{ flight.itineraries[0].segments[0].departure.iataCode }}
          →
          {{ flight.itineraries?.[0]?.segments?.at(-1)?.arrival?.iataCode || 'N/A' }}
        </li>
      </ul>
    </div>

  <!-- No Results -->
<div
  v-else-if="searchAttempted && !isSearching && flightResults.length === 0"
  class="text-center p-10 bg-gray-50 rounded-xl shadow-inner animate-fade-slide"
>
  <p class="text-lg font-semibold text-gray-600 mb-1">
    No flights found for this route.
  </p>
  <p class="text-sm text-gray-500">
    Try adjusting your search criteria and try again.
  </p>
</div>

  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'
import type { Flight, FlightDictionaries } from '@/types/flight'
import FlightCard from './FlightCard.vue'
import { tripType } from '@/composables/useFlightSearch'

const props = defineProps<{
  flightResults: Flight[]
  flightDictionaries: FlightDictionaries
  isSearching: boolean
  searchAttempted: boolean
  selectedFlights: Flight[]
  title: string
  currentItinerary: number
  searchParams?: any
}>()

const emit = defineEmits(['show-details', 'select-flight'])

const flightResultsTitle = computed(() => {
  if (tripType.value === 'one-way') {
    return 'One-Way Flight Results'
  }
  if (tripType.value === 'round-trip') {
    return props.currentItinerary === 0 ? 'Departure Flight' : 'Return Flight'
  }
  if (tripType.value === 'multi-city') {
    return `Flight ${props.currentItinerary + 1} of ${
      props.searchParams?.originDestinations?.length || '?'
    }`
  }
  return 'Flight Results'
})

const isSelected = (flight: Flight) => {
  const currentFlight = props.selectedFlights[props.currentItinerary]
  return currentFlight && currentFlight.id === flight.id
}

const showFlightDetails = (flight: Flight) => {
  emit('show-details', flight)
}

const selectFlight = (flight: Flight) => {
  emit('select-flight', flight)
}

const getLoadingMessage = () => {
  if (props.currentItinerary === 0) {
    return 'Searching for departure flights...'
  } else {
    return `Searching for flight segment ${props.currentItinerary + 1}...`
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeSlide {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

.animate-fade-slide {
  animation: fadeSlide 0.4s ease-out;
}
</style>
