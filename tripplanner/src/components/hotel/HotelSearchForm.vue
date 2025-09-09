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

    <!-- Filters Section (shown after search) -->
    <div v-if="showFilters" class="bg-gray-50 p-6 rounded-xl border border-gray-200">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Filter Results</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Price Range Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Price Range (THB)</label>
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <input
                type="number"
                v-model.number="minPrice"
                placeholder="Min"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                min="0"
              />
              <span class="text-gray-500">-</span>
              <input
                type="number"
                v-model.number="maxPrice"
                placeholder="Max"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                min="0"
              />
            </div>
            <div class="flex space-x-2">
              <button @click="setPriceRange(0, 2000)" class="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition">Under 2,000</button>
              <button @click="setPriceRange(2000, 5000)" class="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition">2,000 - 5,000</button>
              <button @click="setPriceRange(5000, 10000)" class="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition">5,000 - 10,000</button>
              <button @click="setPriceRange(10000, 999999)" class="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition">Over 10,000</button>
            </div>
          </div>
        </div>

        <!-- Rating Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
          <select
            v-model="minRating"
            class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">Any Rating</option>
            <option value="5">5 Stars</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
            <option value="1">1+ Stars</option>
          </select>
        </div>
      </div>

      <!-- Apply Filters Button -->
      <div class="mt-6 flex justify-end">
        <button
          @click="applyFilters"
          class="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Apply Filters
        </button>
      </div>
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

// Filter variables
const showFilters = ref(false);
const minPrice = ref<number | null>(null);
const maxPrice = ref<number | null>(null);
const minRating = ref<string>('');

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
  showFilters.value = true; // Show filters after search
  emit('search', {
    cityCode: cityIata.value,
    checkInDate: checkInDate.value,
    checkOutDate: checkOutDate.value,
    adults: guests.value,
    minPrice: minPrice.value,
    maxPrice: maxPrice.value,
    minRating: minRating.value
  });
};

const setPriceRange = (min: number, max: number) => {
  minPrice.value = min;
  maxPrice.value = max;
};

const applyFilters = () => {
  emit('search', {
    cityCode: cityIata.value,
    checkInDate: checkInDate.value,
    checkOutDate: checkOutDate.value,
    adults: guests.value,
    minPrice: minPrice.value,
    maxPrice: maxPrice.value,
    minRating: minRating.value
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
