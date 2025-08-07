<template>
  <div
    v-if="flight"
    class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]"
    @click.self="$emit('close')"
  >
    <div class="bg-white p-6 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative z-[10000]">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-2xl font-bold text-gray-800">Flight Details</h3>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-800 transition-colors cursor-pointer z-10"
          aria-label="Close flight details"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="space-y-6">
        <div
          v-for="(itinerary, index) in flight.itineraries"
          :key="index"
          class="border border-gray-200 rounded-lg p-4"
        >
          <div class="flex justify-between items-center mb-3">
            <h4 class="text-xl font-semibold text-gray-700">
              {{ itinerary.segments.length > 1 ? 'Connecting Flight' : (index === 0 ? 'Departure' : 'Return') }}
            </h4>
            <p class="text-md font-medium text-gray-600">
              <span class="font-semibold">Total Duration:</span> {{ formatDuration(itinerary.duration) }}
            </p>
          </div>

          <div v-for="(segment, sIndex) in itinerary.segments" :key="sIndex" class="relative pl-10 py-4">
            <div class="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div class="absolute left-5 top-1/2 -translate-y-1/2 w-3 h-3 bg-teal-500 rounded-full border-2 border-white"></div>

            <div class="flex items-center mb-2">
              <img :src="getAirlineLogo(segment.carrierCode)" alt="Airline logo" class="w-8 h-8 mr-3 rounded-full border border-gray-200">
              <div>
                <p class="font-semibold text-gray-800">
                  {{ getAirlineName(segment.carrierCode) }}
                  <span class="text-gray-500 font-normal">
                    {{ segment.carrierCode }} {{ segment.number }}
                  </span>
                </p>
                <p class="text-xs text-gray-500">Aircraft: {{ segment.aircraft.code }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-x-4 text-sm ml-11">
              <div>
                <p class="font-semibold text-gray-600">From:</p>
                <p>{{ getLocationName(segment.departure.iataCode) }} ({{ segment.departure.iataCode }})</p>
                <p class="text-gray-500">{{ formatDateTime(segment.departure.at) }}</p>
              </div>
              <div>
                <p class="font-semibold text-gray-600">To:</p>
                <p>{{ getLocationName(segment.arrival.iataCode) }} ({{ segment.arrival.iataCode }})</p>
                <p class="text-gray-500">{{ formatDateTime(segment.arrival.at) }}</p>
              </div>
            </div>

            <div v-if="sIndex < itinerary.segments.length - 1" class="ml-11 mt-3 text-xs text-gray-500">
              Layover: {{ formatLayover(itinerary.segments[sIndex+1].departure.at, segment.arrival.at) }}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="border border-gray-200 rounded-lg p-4">
            <h4 class="text-lg font-semibold mb-2 text-gray-700">Baggage Allowance</h4>
            <div
              v-for="traveler in flight.travelerPricings"
              :key="traveler.travelerId"
              class="text-sm"
            >
              <p class="font-semibold">Traveler {{ traveler.travelerId }} ({{ traveler.travelerType }})</p>
              <ul class="list-disc list-inside pl-2 text-gray-600">
                <li>Cabin: {{ traveler.fareDetailsBySegment[0].cabin }}</li>
                <li>Checked Bags: {{ traveler.fareDetailsBySegment[0].includedCheckedBags?.quantity || 0 }}</li>
              </ul>
            </div>
          </div>

          <div class="border border-gray-200 rounded-lg p-4 flex flex-col justify-center items-center bg-gray-50">
            <h4 class="text-lg font-semibold text-gray-700">Total Price</h4>
            <p class="text-3xl font-bold text-teal-600">{{ formatPrice(flight.price.total) }}</p>
            <p class="text-sm text-gray-500">for {{ flight.travelerPricings.length }} traveler(s)</p>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end">
        <button
          @click="$emit('close')"
          class="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer z-10"
          aria-label="Close flight details"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, onMounted, onUnmounted } from 'vue';
import type { Flight, FlightDictionaries } from '@/types/flight';

const props = defineProps<{
  flight: Flight | null;
  dictionaries: FlightDictionaries;
}>();

const emit = defineEmits(['close']);

const getLocationName = (iataCode: string) => {
  return props.dictionaries.locations[iataCode]?.cityCode || iataCode;
};

const getAirlineName = (carrierCode: string) => {
  return props.dictionaries?.carriers?.[carrierCode] || carrierCode;
};

const getAirlineLogo = (carrierCode: string) => {
  return `https://s1.apideeplink.com/images/airlines/${carrierCode}.png`;
};

const formatDuration = (duration: string) => {
  return duration.replace('PT', '').replace('H', 'h ').replace('M', 'm');
};

const formatDateTime = (dateTime: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  };
  return new Date(dateTime).toLocaleString('en-US', options);
};

const formatPrice = (price: string) => {
  const exchangeRate = 40; // EUR to THB
  const priceValue = parseFloat(price || '0');
  const thbPrice = props.flight?.price?.currency === 'THB' ? priceValue : priceValue * exchangeRate;

  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(thbPrice);
};

const formatLayover = (departureTime: string, arrivalTime: string) => {
  const diff = new Date(departureTime).getTime() - new Date(arrivalTime).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

// Optional: Allow closing modal with ESC key
onMounted(() => {
  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') emit('close');
  };
  window.addEventListener('keydown', handleKey);
  onUnmounted(() => window.removeEventListener('keydown', handleKey));
});
</script>
