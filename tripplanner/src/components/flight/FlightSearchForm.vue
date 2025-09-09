<template>
  
  <form @submit.prevent="searchFlights" class="space-y-6 max-w-5xl mx-auto p-6 animate-fade-slide">
    <!-- Trip Type Selector -->
    <div class="flex ">
      <div class="bg-gray-100 p-1 rounded-full flex gap-2 shadow-inner">
        <button
          v-for="option in [
            { label: 'One-way', value: 'one-way' },
            { label: 'Round-trip', value: 'round-trip' },
            { label: 'Multi-city', value: 'multi-city' }
          ]"
          :key="option.value"
          type="button"
          @click="tripType = option.value"
          :class="[
            'px-5 py-2 text-sm font-medium rounded-full transition-all duration-300',
            tripType === option.value
              ? 'bg-teal-600 text-white shadow-md scale-105'
              : 'text-gray-700 hover:bg-white'
          ]"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- Departure/Arrival for One-way & Round-trip -->
    <div v-if="tripType !== 'multi-city'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Departure City</label>
        <SearchableSelect
          v-model="departureCity"
          @update:iata="(iata) => { departureIata = iata }"
          placeholder="e.g. Bangkok"
          class="w-full"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Arrival City</label>
        <SearchableSelect
          v-model="arrivalCity"
          @update:iata="(iata) => { arrivalIata = iata }"
          placeholder="e.g. Tokyo"
          class="w-full"
        />
      </div>
    </div>

    <!-- Date Selection -->
    <div v-if="tripType !== 'multi-city'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
        <input
          type="date"
          v-model="localStartDate"
          :min="new Date().toISOString().split('T')[0]"
          class="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          required
        />
      </div>
      <div v-if="tripType === 'round-trip'">
        <label class="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
        <input
          type="date"
          v-model="returnDate"
          :min="localStartDate"
          class="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          required
        />
      </div>
    </div>

    <!-- Multi-city -->
    <div v-if="tripType === 'multi-city'" class="space-y-6">
      <div class="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <strong>Multi-city flights:</strong> Create a journey with multiple destinations. You can visit the same city multiple times. For example: Bangkok → Chiang Mai → Bangkok → Chiang Mai.
      </div>
      <div
        v-for="(segment, index) in flightSegments"
        :key="index"
        class="p-6 bg-gray-50 rounded-xl border shadow space-y-4 relative"
      >
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-700 mb-1 block">Departure City</label>
            <SearchableSelect
              v-model="segment.departureCity"
              @update:iata="(iata) => { segment.departureIata = iata }"
              placeholder="e.g. Paris"
              class="w-full"
            />
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 mb-1 block">Arrival City</label>
            <SearchableSelect
              v-model="segment.arrivalCity"
              @update:iata="(iata) => { segment.arrivalIata = iata }"
              placeholder="e.g. Rome"
              class="w-full"
            />
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 mb-1 block">Departure Date</label>
            <input
              type="date"
              v-model="segment.departureDate"
              :min="new Date().toISOString().split('T')[0]"
              class="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>
        </div>
        <button
  v-if="index > 1"
  @click="removeFlightSegment(index)"
  class="absolute top-0 right-2 text-red-500 hover:text-black transition duration-300 hover:text-red"
>
  <Trash class="w-4 h-4" />
</button>

      </div>
      <div class="text-right">
        <button type="button" @click="addFlightSegment" class="text-teal-600 hover:text-black">
          + Add another flight
        </button>
      </div>
    </div>

     <!-- Passengers and Seat Class -->
     <div class="mb-10">
  <label for="passengers" class="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
  <div class="grid grid-cols-2 gap-4 items-end">
    <div class="grid grid-cols-3 gap-4 items-end">
      <div>
        <label for="adults" class="text-xs">Adults</label>
        <input
          type="number"
          id="adults"
          v-model.number="passengers.adults"
          min="1"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
        />
      </div> 

      <div>
        <label for="children" class="text-xs">Children</label>
        <input
          type="number"
          id="children"
          v-model.number="passengers.children"
          min="0"
          class="mt-1 block w-full px-3 py-2  rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
        />
      </div>
      <div>
        <label for="infants" class="text-xs">Infants</label>
        <input
          type="number"
          id="infants"
          v-model.number="passengers.infants"
          min="0"
          class="mt-1 block w-full px-3 py-2 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
        />
      </div>
    </div>
    <div class="relative w-full">
      <label for="seatClass" class="text-xs">Seat Class</label>
      <select
        id="seatClass"
        v-model="seatClass"
        class="appearance-none mt-1 block w-full pl-3 pr-10 py-2 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
      >
        <option disabled value="">Seat class</option>
        <option>Economy</option>
        <option>Business</option>
        <option>First</option>
      </select>
    </div>
  </div>
</div>

    <!-- Buttons -->
    <div class="flex flex-col sm:flex-row gap-4 mt-12">
      <button
        type="button"
        @click="goBack"
        class="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
      >
        Back
      </button>
      <button
        type="submit"
        :disabled="isSearching"
        class="w-full px-4 py-2 bg-black/80 text-white rounded-lg hover:bg-black transition"
      >
        {{ isSearching ? 'Searching...' : 'Search Flights' }}
      </button>
      <button
        type="button"
        @click="skipStep"
        class="w-full px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
      >
        Skip
      </button>
    </div>
  </form>
</template>


<script setup lang="ts">
import { ref, watch, onMounted, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { useTripStore } from '@/stores/trip';
import { useGemini } from '@/composables/gemini';
import { Trash } from 'lucide-vue-next';
import SearchableSelect from '@/components/ui/SearchableSelect.vue';

interface FlightSegment {
  departureCity: string;
  arrivalCity: string;
  departureDate: string;
  departureIata: string;
  arrivalIata: string;
}

const props = defineProps({
  initialDestination: {
    type: String,
    default: ''
  },
  initialStartDate: {
    type: String,
    default: ''
  },
  initialGroupSize: {
    type: Number,
    default: 1
  },
  initialDepartureCity: {
    type: String,
    default: ''
  },
  initialDepartureIata: {
    type: String,
    default: ''
  },
  initialTripType: {
    type: String,
    default: 'one-way'
  },
  initialSeatClass: {
    type: String,
    default: 'Economy'
  }
});

const emit = defineEmits(['search', 'skip-step']);

const tripStore = useTripStore();
const router = useRouter();

const { generatedContent, generateContent, isLoading: isGeminiLoading, error: geminiError } = useGemini();
const tripType = ref(props.initialTripType || 'one-way');
const departureCity = ref(props.initialDepartureCity || '');
const arrivalCity = ref(props.initialDestination);
const localStartDate = ref(tripStore.startDate || '');
const returnDate = ref(tripStore.endDate || '');
const passengers = ref({ adults: props.initialGroupSize, children: 0, infants: 0 });
const seatClass = ref(props.initialSeatClass || 'Economy');
const departureIata = ref(props.initialDepartureIata || '');
const arrivalIata = ref('');
const flightSegments: Ref<FlightSegment[]> = ref([
  { departureCity: '', arrivalCity: '', departureDate: '', departureIata: '', arrivalIata: '' },
  { departureCity: '', arrivalCity: '', departureDate: '', departureIata: '', arrivalIata: '' }
]);
const isSearching = ref(false);

const addFlightSegment = () => {
  flightSegments.value.push({ departureCity: '', arrivalCity: '', departureDate: '', departureIata: '', arrivalIata: '' });
};

const removeFlightSegment = (index: number) => {
  flightSegments.value.splice(index, 1);
};

watch(() => props.initialStartDate, (newVal) => {
  localStartDate.value = newVal ? new Date(newVal).toISOString().split('T')[0] : '';
});
watch(() => props.initialGroupSize, (newVal) => {
  passengers.value.adults = newVal;
});

watch(() => props.initialDestination, (newVal) => {
  arrivalCity.value = newVal;
  // IATA handled by component
});

const searchFlights = async () => {
  isSearching.value = true;
  let params: any;

  if (tripType.value === 'multi-city') {
    // Validate multi-city segments for overlaps
    const segments = flightSegments.value.filter(s => s.departureIata && s.arrivalIata && s.departureDate);
    if (segments.length < 2) {
      alert('Please add at least 2 flight segments for multi-city search.');
      isSearching.value = false;
      return;
    }

    // Basic validation - ensure all segments have required data
    for (const segment of segments) {
      if (!segment.departureIata || !segment.arrivalIata || !segment.departureDate) {
        alert('Please fill in all departure cities, arrival cities, and dates for all flight segments.');
        isSearching.value = false;
        return;
      }
    }

    params = {
      originDestinations: segments.map(s => ({
        id: (segments.indexOf(s) + 1).toString(),
        originLocationCode: s.departureIata,
        destinationLocationCode: s.arrivalIata,
        departureDateTimeRange: {
          date: s.departureDate
        }
      })),
      travelers: [
        ...Array.from({ length: passengers.value.adults }, (_, i) => ({
          id: (i + 1).toString(),
          travelerType: 'ADULT',
        })),
        ...Array.from({ length: passengers.value.children }, (_, i) => ({
          id: (passengers.value.adults + i + 1).toString(),
          travelerType: 'CHILD',
        })),
        ...Array.from({ length: passengers.value.infants }, (_, i) => ({
          id: (passengers.value.adults + passengers.value.children + i + 1).toString(),
          travelerType: 'HELD_INFANT',
          associatedAdultId: (i + 1).toString(),
        })),
      ],
      sources: ['GDS']
    };
  } else {
    params = {
      originLocationCode: departureIata.value,
      destinationLocationCode: arrivalIata.value,
      departureDate: localStartDate.value,
      adults: passengers.value.adults,
      children: passengers.value.children,
      infants: passengers.value.infants,
      travelClass: seatClass.value.toUpperCase(),
      nonStop: true
    };
    if (tripType.value === 'round-trip') {
      params.returnDate = returnDate.value;
    }
  }
  emit('search', params, tripType.value);
  isSearching.value = false;
};

const skipStep = () => {
  emit('skip-step');
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  localStartDate.value = props.initialStartDate;
  passengers.value.adults = props.initialGroupSize;
  arrivalCity.value = props.initialDestination;
  departureCity.value = props.initialDepartureCity;
  departureIata.value = props.initialDepartureIata;
  tripType.value = props.initialTripType;
  seatClass.value = props.initialSeatClass;
  // IATA for initial values handled by component or props
});
</script>