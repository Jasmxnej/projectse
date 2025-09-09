<template>
  <form @submit.prevent="searchHotels" class="space-y-6 max-w-5xl mx-auto p-6 animate-fade-slide">
    <!-- Location Input -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
      <SearchableSelect
        v-model="location"
        @update:iata="(iata) => { cityIata = iata }"
        placeholder="e.g. Tokyo"
        class="w-full"
      />
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
    <div v-if="showFilters" class="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-800 flex items-center">
          <svg class="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
          </svg>
          Filter Results
        </h3>
        <div class="flex items-center text-sm text-gray-600">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          Real-time updates
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Price Range Filter -->
        <div class="bg-white p-4 rounded-lg border border-gray-200">
          <label class="block text-sm font-medium text-gray-700 mb-3 flex items-center">
            <svg class="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
            </svg>
            Price Range (THB)
          </label>
          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <div class="relative flex-1">
                <span class="absolute left-3 top-2.5 text-gray-500 text-sm">฿</span>
                <input
                  type="number"
                  v-model.number="minPrice"
                  placeholder="Min"
                  class="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  min="0"
                />
              </div>
              <span class="text-gray-500 font-medium">-</span>
              <div class="relative flex-1">
                <span class="absolute left-3 top-2.5 text-gray-500 text-sm">฿</span>
                <input
                  type="number"
                  v-model.number="maxPrice"
                  placeholder="Max"
                  class="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  min="0"
                />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button @click="setPriceRange(0, 2000)" class="px-3 py-2 text-xs bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-teal-50 hover:border-teal-300 transition-all duration-200">Under 2,000</button>
              <button @click="setPriceRange(2000, 5000)" class="px-3 py-2 text-xs bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-teal-50 hover:border-teal-300 transition-all duration-200">2,000 - 5,000</button>
              <button @click="setPriceRange(5000, 10000)" class="px-3 py-2 text-xs bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-teal-50 hover:border-teal-300 transition-all duration-200">5,000 - 10,000</button>
              <button @click="setPriceRange(10000, 999999)" class="px-3 py-2 text-xs bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-teal-50 hover:border-teal-300 transition-all duration-200">Over 10,000</button>
            </div>
          </div>
        </div>

        <!-- Rating Filter -->
        <div class="bg-white p-4 rounded-lg border border-gray-200">
          <label class="block text-sm font-medium text-gray-700 mb-3 flex items-center">
            <svg class="w-4 h-4 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
            </svg>
            Minimum Rating
          </label>
          <select
            v-model="minRating"
            class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors bg-white"
          >
            <option value="">Any Rating</option>
            <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
            <option value="4">⭐⭐⭐⭐☆ 4+ Stars</option>
            <option value="3">⭐⭐⭐☆☆ 3+ Stars</option>
            <option value="2">⭐⭐☆☆☆ 2+ Stars</option>
            <option value="1">⭐☆☆☆☆ 1+ Stars</option>
          </select>
          <div class="mt-2 text-xs text-gray-500">
            Only show hotels with at least this rating
          </div>
        </div>
      </div>

      <!-- Active Filters Summary -->
      <div v-if="minPrice || maxPrice || minRating" class="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center text-sm text-teal-800">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Active filters:
            <span v-if="minPrice || maxPrice" class="ml-1 font-medium">
              Price: {{ minPrice ? `฿${minPrice}` : '0' }} - {{ maxPrice ? `฿${maxPrice}` : '∞' }}
            </span>
            <span v-if="minRating && (minPrice || maxPrice)" class="ml-2">•</span>
            <span v-if="minRating" class="ml-1 font-medium">
              Rating: {{ minRating }}+
            </span>
          </div>
          <button @click="clearFilters" class="text-teal-600 hover:text-teal-800 text-sm font-medium">
            Clear all
          </button>
        </div>
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
import { ref, onMounted, watch } from 'vue';
import { useTripStore } from '@/stores/trip';
import SearchableSelect from '@/components/ui/SearchableSelect.vue';


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
const cityIata = ref(props.initialCityCode || tripStore.destinationIataCode || '');
const checkInDate = ref(props.initialStartDate || tripStore.startDate || '');
const checkOutDate = ref(props.initialEndDate || tripStore.endDate || '');
const guests = ref(props.initialGuests || tripStore.groupSize || 1);

// Filter variables
const showFilters = ref(false);
const minPrice = ref<number | null>(null);
const maxPrice = ref<number | null>(null);
const minRating = ref<string>('');

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

// Real-time filter watchers with debouncing
let filterDebounceTimer: any;

const applyFiltersRealtime = () => {
  clearTimeout(filterDebounceTimer);
  filterDebounceTimer = setTimeout(() => {
    if (cityIata.value && checkInDate.value && checkOutDate.value) {
      emit('search', {
        cityCode: cityIata.value,
        checkInDate: checkInDate.value,
        checkOutDate: checkOutDate.value,
        adults: guests.value,
        minPrice: minPrice.value,
        maxPrice: maxPrice.value,
        minRating: minRating.value
      });
    }
  }, 500); // 500ms debounce
};

// Watch filter changes
watch([minPrice, maxPrice, minRating], () => {
  if (showFilters.value) {
    applyFiltersRealtime();
  }
});

// Clear all filters
const clearFilters = () => {
  minPrice.value = null;
  maxPrice.value = null;
  minRating.value = '';
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
