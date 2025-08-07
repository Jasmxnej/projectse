<template>
  <form @submit.prevent="searchHotels" class="space-y-6 max-w-5xl mx-auto p-6 animate-fade-slide">
    <!-- Location Input -->
    <div class="relative">
      <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
      <input
        type="text"
        v-model="location"
        @input="handleCityInput"
        placeholder="e.g. Tokyo"
        class="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
        required
      />
      <ul
        v-if="citySuggestions.length"
        class="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow max-h-48 overflow-auto mt-1"
      >
        <li
          v-for="(city, index) in citySuggestions"
          :key="city.iataCode + index"
          @click="selectCity(city)"
          class="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
        >
          {{ city.name }} ({{ city.iataCode }})
        </li>
      </ul>
    </div>

    <!-- Date Selection -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
        <input
          type="date"
          v-model="checkInDate"
          :min="new Date().toISOString().split('T')[0]"
          class="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          required
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
        <input
          type="date"
          v-model="checkOutDate"
          :min="checkInDate"
          class="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          required
        />
      </div>
    </div>

    <!-- Guests -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Guests</label>
      <input
        type="number"
        v-model.number="guests"
        min="1"
        class="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
        required
      />
    </div>

    <!-- Buttons -->
    <div class="flex flex-col sm:flex-row gap-4 mt-12">
      <button
        type="button"
        @click="$emit('go-back')"
        class="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
      >
        Back
      </button>
      <button
        type="submit"
        class="w-full px-4 py-2 bg-black/80 text-white rounded-lg hover:bg-black transition"
      >
        Search Hotels
      </button>
      <button
        type="button"
        @click="$emit('skip')"
        class="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
      >
        Skip
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useTripStore } from '@/stores/trip';

interface City {
  name: string;
  iataCode: string;
}

const props = defineProps({
  initialStartDate: String,
  initialEndDate: String,
  initialLocation: {
    type: String,
    default: ''
  },
  initialCityCode: {
    type: String,
    default: ''
  },
  initialGuests: {
    type: Number,
    default: 1
  }
});

const emit = defineEmits(['search', 'skip', 'go-back']);

const tripStore = useTripStore();

const location = ref(props.initialLocation || tripStore.destination || '');
const citySuggestions = ref<City[]>([]);
const cityIata = ref(props.initialCityCode || tripStore.destinationIataCode || '');
const checkInDate = ref(props.initialStartDate || tripStore.startDate || '');
const checkOutDate = ref(props.initialEndDate || tripStore.endDate || '');
const guests = ref(props.initialGuests || tripStore.groupSize || 1);

const handleCityInput = async () => {
  if (location.value.length < 1) {
    citySuggestions.value = [];
    return;
  }
  try {
    const response = await axios.get('http://localhost:3002/api/amadeus/cities', {
      params: { keyword: location.value }
    });
    citySuggestions.value = response.data;
  } catch (error) {
    console.error('Error fetching city suggestions:', error);
  }
};

const selectCity = (city: City) => {
  location.value = city.name;
  cityIata.value = city.iataCode;
  citySuggestions.value = [];
};

const searchHotels = () => {
  if (!cityIata.value) {
    alert('Please select a city from the suggestions.');
    return;
  }
  emit('search', {
    cityCode: cityIata.value,
    checkInDate: checkInDate.value,
    checkOutDate: checkOutDate.value,
    adults: guests.value
  });
};

onMounted(() => {
  // Initialize with props first, then fall back to tripStore
  location.value = props.initialLocation || tripStore.destination || '';
  cityIata.value = props.initialCityCode || tripStore.destinationIataCode || '';
  guests.value = props.initialGuests || tripStore.groupSize || 1;
  checkInDate.value = props.initialStartDate || tripStore.startDate || '';
  checkOutDate.value = props.initialEndDate || tripStore.endDate || '';
});
</script>
