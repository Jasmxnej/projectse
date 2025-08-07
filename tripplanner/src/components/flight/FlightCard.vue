<template>
  <div
    v-if="flight?.itineraries?.[0]?.segments?.length"
    :class="[
      'bg-white p-6 rounded-2xl shadow-lg border transition-all duration-500 transform hover:scale-[1.01] hover:shadow-2xl',
      selected ? 'border-teal-500 ring-2 ring-teal-500' : 'border-transparent'
    ]"
  >
    <div class="flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-4">
      <!-- Flight Info -->
      <div class="flex-1 space-y-5">
        <div class="flex items-center">
          <img
            :src="getAirlineLogo(firstSegment.carrierCode)"
            alt="Airline logo"
            class="w-12 h-12 mr-4 rounded-full shadow-md border border-gray-200"
          />
          <div>
            <p class="text-lg font-semibold text-gray-900">
              {{ getAirlineName(firstSegment.carrierCode) }}
            </p>
            <p class="text-xs text-gray-500">
              {{ flight.itineraries[0].segments.map((s) => s.carrierCode + ' ' + s.number).join(' • ') }}
            </p>
          </div>
        </div>

        <!-- Times -->
        <div class="flex items-center justify-between text-sm text-gray-700">
          <div class="text-center">
            <p class="text-xl font-bold">{{ formatTime(firstSegment.departure.at) }}</p>
            <p class="text-xs text-gray-500">{{ firstSegment.departure.iataCode }}</p>
          </div>

          <div class="flex flex-col items-center mx-4">
            <span class="text-xs mb-1 text-gray-400 italic">{{ formatDuration(flight.itineraries[0].duration) }}</span>
            <div class="w-20 h-px bg-gray-300 mb-1"></div>
            <span class="text-xs text-teal-600 font-medium">
              {{ flight.itineraries[0].segments.length - 1 }} stop(s)
            </span>
          </div>

          <div class="text-center">
            <p class="text-xl font-bold">{{ lastSegment ? formatTime(lastSegment.arrival.at) : 'N/A' }}</p>
            <p class="text-xs text-gray-500">{{ lastSegment ? lastSegment.arrival.iataCode : 'N/A' }}</p>
          </div>
        </div>
      </div>

      <!-- Price and Actions -->
      <div class="text-right space-y-3 min-w-[150px]">
        <div>
          <p class="text-2xl font-bold text-teal-600">{{ formatPrice(flight.price.total) }}</p>
          <p class="text-xs text-gray-500">Total for all travelers</p>
        </div>

        <div class="flex gap-2 justify-end">
          <button
            @click.stop="$emit('show-details', flight)"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Details
          </button>
          <button
            @click.stop="$emit('select-flight', flight)"
            :class="[
              'px-4 py-2 text-sm font-medium text-white rounded-lg transition focus:outline-none focus:ring-2',
              selected
                ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300'
                : 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-400'
            ]"
          >
            {{ selected ? 'Deselect' : 'Select Flight' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'
import type { Flight, FlightDictionaries } from '@/types/flight'

const props = defineProps<{
  flight: Flight
  dictionaries: FlightDictionaries
  selected: boolean
}>()

defineEmits(['show-details', 'select-flight'])

const firstSegment = computed(() => props.flight.itineraries[0].segments[0])
const lastSegment = computed(() => props.flight.itineraries[0].segments.at(-1))

const getAirlineName = (carrierCode: string) =>
  props.dictionaries?.carriers?.[carrierCode] || carrierCode

const getAirlineLogo = (carrierCode: string) =>
  `https://s1.apideeplink.com/images/airlines/${carrierCode}.png`

const formatDuration = (duration: string) =>
  duration?.replace('PT', '').replace('H', 'h ').replace('M', 'm') || ''

const formatPrice = (price: string) => {
  // Convert EUR to THB (1 EUR ≈ 40 THB) if currency is not already THB
  const exchangeRate = 40; // EUR to THB exchange rate
  const priceValue = parseFloat(price || '0');
  const thbPrice = props.flight.price.currency === 'THB' ? priceValue : priceValue * exchangeRate;
  
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(thbPrice);
}

const formatTime = (dateTime: string) => {
  const date = new Date(dateTime)
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
@keyframes fadeInCard {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-card {
  animation: fadeInCard 0.4s ease-out;
}
</style>
