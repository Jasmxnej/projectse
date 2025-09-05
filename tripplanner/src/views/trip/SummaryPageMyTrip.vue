<template>
  <div class="bg-gray-50 min-h-screen font-sans text-gray-800">
    <main class="p-4 lg:p-8" ref="summaryContent">
      <div class="max-w-7xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <div class="flex items-center">
            <div v-if="isEditingName" class="flex items-center">
              <input
                v-model="tripName"
                type="text"
                class="text-4xl font-bold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-teal-600 mr-2"
                @keyup.enter="saveTripName"
              />
              <button @click="saveTripName" class="p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              <button @click="cancelEditName" class="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors ml-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div v-else class="flex items-center">
              <h1 class="text-4xl font-bold text-gray-900">{{ trip?.name || 'Trip Summary' }}</h1>
              <button @click="startEditName" class="ml-2 p-1 text-gray-500 hover:text-teal-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button @click="goBack" class="px-4 py-2 bg-white border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-100 transition-colors font-medium">
              Back
            </button>
            <button @click="saveTrip" class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold shadow-md">
              Save Trip
            </button>
            <TripPdfGenerator
              :trip="trip"
              :flights="flights"
              :hotel="hotel"
              :schedule="schedule"
              :weatherData="weatherData"
              :packingData="packingData"
              :recommendationsData="recommendationsData"
              :budgetData="budgetData"
            />
          </div>
        </div>

        <div v-if="loading" class="text-center py-16">
          <p class="text-lg text-gray-600">Loading your summary trip...</p>
        </div>

        <div v-if="!loading && trip" class="space-y-8">
          <!-- Trip Overview Section -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Trip Overview</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Trip Details -->
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-lg font-semibold text-gray-800">Trip Details</h3>
                  <button @click="editTripDetails" class="text-teal-600 hover:text-teal-800">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </div>
                <div class="space-y-2 text-sm">
                  <p><span class="font-medium">Destination:</span> {{ trip.destination }}</p>
                  <p><span class="font-medium">Dates:</span> {{ formatDate(trip.start_date) }} to {{ formatDate(trip.end_date) }}</p>
                  <p><span class="font-medium">Group Size:</span> {{ trip.group_size || 1 }} people</p>
                  <p><span class="font-medium">Transport:</span> {{ trip.transport || 'Not specified' }}</p>
                </div>
              </div>
              
              <!-- Flight Summary -->
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200" :class="{'opacity-50': !flights || flights.length === 0}">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-lg font-semibold text-gray-800">Flight{{ flights && flights.length > 1 ? 's' : '' }}</h3>
                  <button v-if="flights && flights.length > 0" @click="editFlight" class="text-teal-600 hover:text-teal-800">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button v-else @click="editFlight" class="text-teal-600 hover:text-teal-800 px-2 py-1 text-xs rounded-full bg-teal-50">
                    Add Flight
                  </button>
                </div>
                <div v-if="flights && flights.length > 0" class="space-y-3 text-sm">
                  <div v-for="(flight, index) in flights" :key="flight.id || index" class="border-l-4 border-teal-500 pl-3">
                    <div v-if="flights.length > 1" class="text-xs text-teal-600 font-medium mb-1">
                      Leg {{ flight.leg_number || (index + 1) }} - {{ getFlightTypeLabel(flight.flight_type) }}
                    </div>
                    <p><span class="font-medium">Route:</span> {{ flight.from_city || flight.fromCity || '?' }} ({{ flight.from_iata || flight.fromIata || '?' }}) → {{ flight.to_city || flight.toCity || '?' }} ({{ flight.to_iata || flight.toIata || '?' }})</p>
                    <p><span class="font-medium">Airline:</span> {{ flight.airline || 'Unknown Airline' }}</p>
                    <p><span class="font-medium">Departure:</span> {{ formatDateTime(flight.departure_time || flight.departureTime) }}</p>
                    <p><span class="font-medium">Arrival:</span> {{ formatDateTime(flight.arrival_time || flight.arrivalTime) }}</p>
                    <p><span class="font-medium">Price:</span> {{ formatPrice(flight.price) }}</p>
                  </div>
                  <div v-if="flights.length > 1" class="mt-3 pt-3 border-t border-gray-300">
                    <p class="text-xs text-gray-600">
                      <span class="font-medium">Total Flights:</span> {{ flights.length }}
                      <span class="ml-4 font-medium">Total Price:</span> {{ formatPrice(getTotalFlightPrice()) }}
                    </p>
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500 italic">
                  <p>Not selected yet.</p>
                </div>
              </div>
              
              <!-- Hotel Summary -->
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200" :class="{'opacity-50': !hotel}">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-lg font-semibold text-gray-800">Hotel</h3>
                  <button v-if="hotel" @click="editHotel" class="text-teal-600 hover:text-teal-800">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button v-else @click="editHotel" class="text-teal-600 hover:text-teal-800 px-2 py-1 text-xs rounded-full bg-teal-50">
                    Add Hotel
                  </button>
                </div>
                <div v-if="hotel" class="space-y-2 text-sm">
                  <p><span class="font-medium">Name:</span> {{ hotel.name || 'Hotel in ' + (trip?.destination || 'destination') }}</p>
                  <p><span class="font-medium">Location:</span> {{ hotel.location || hotel.cityCode || hotel.city_code || trip?.destination || 'Unknown' }}</p>
                  <p><span class="font-medium">Rating:</span>
                    <span class="inline-flex items-center">
                      <span v-for="i in Math.floor(hotel.rating || 0)" :key="i" class="text-yellow-400">★</span>
                      <span v-for="i in (5 - Math.floor(hotel.rating || 0))" :key="i + 5" class="text-gray-300">★</span>
                      <span class="ml-1">{{ hotel.rating || 3 }}/5</span>
                    </span>
                  </p>
                  <p><span class="font-medium">Check-in:</span> {{ formatDate(hotel.check_in_date || hotel.checkInDate) }}</p>
                  <p><span class="font-medium">Check-out:</span> {{ formatDate(hotel.check_out_date || hotel.checkOutDate) }}</p>
                  <p><span class="font-medium">Room:</span> {{ hotel.room_type || 'Standard' }} ({{ hotel.room_beds || 1 }} {{ hotel.room_bed_type || 'bed' }})</p>
                  <p><span class="font-medium">Guests:</span> {{ hotel.number_of_adults || trip?.group_size || 1 }} adults</p>
                  <p><span class="font-medium">Price:</span> {{ formatPrice(hotel.price) }}</p>
                </div>
                <div v-else class="text-sm text-gray-500 italic">
                  <p>Not selected yet.</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Budget Overview -->
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Budget Overview</h2>
            <BudgetCard :initial-budget="trip.budget" :planned-expenses="plannedExpenses" />
          </div>

          <!-- All Trip Data in Tabs -->
          <div class="bg-white rounded-xl shadow-lg p-6 mt-6">
            <div class="w-full mt-4 mb-6">
              <div class="bg-gray-100 p-1 rounded-full flex gap-2 shadow-inner justify-center">
                <button
                  v-for="option in viewOptions"
                  :key="option.value"
                  type="button"
                  @click="selectedView = option.value"
                  :class="[
                    'px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 flex items-center',
                    selectedView === option.value
                      ? 'bg-teal-600 text-white shadow-md scale-105'
                      : 'text-gray-700 hover:bg-white'
                  ]"
                >
                  <span class="relative">
                    {{ option.label }}
                    <span
                      v-if="hasData(option.value)"
                      class="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"
                      title="Has data"
                    ></span>
                  </span>
                </button>
              </div>
            </div>
            
            <!-- Flight Details Tab -->
            <div v-if="selectedView === 'flight'">
              <FlightDetailsCard :flights="flights" @edit="editFlight" />
            </div>
            
            <!-- Hotel Details Tab -->
            <div v-else-if="selectedView === 'hotel'">
              <HotelDetailsCard :hotel="hotel" :destination="trip?.destination" @edit="editHotel" />
            </div>
            
            <!-- Daily Schedule Tab -->
            <div v-else-if="selectedView === 'daily'">
              <DailyScheduleCard :schedule="schedule" :destination="trip?.destination" @edit="editSchedule" />
            </div>
            
            <!-- Budget Tab -->
            <div v-else-if="selectedView === 'budget'">
              <TripBudgetAnalysis 
                :total-budget="trip.budget" 
                :planned-expenses="plannedExpenses" 
                :destination="trip.destination" 
              />
            </div>
            
            <!-- Weather Forecast Tab -->
            <div v-else-if="selectedView === 'weather'">
              <TripWeatherForecast
                ref="weatherComponent"
                :destination="trip.destination"
                :start-date="trip.start_date"
                :end-date="trip.end_date"
                @add-to-packing="addPackingItemFromSuggestion"
                :use-saved-data="true"
                @data-updated="updateWeatherData"
              />
            </div>

            <!-- Packing List Tab -->
            <div v-else-if="selectedView === 'packing'">
              <TripPackingList
                ref="packingComponent"
                :trip-id="trip.id"
                @data-updated="updatePackingData"
              />
            </div>

            <!-- Local Recommendations Tab -->
            <div v-else-if="selectedView === 'recommendations'">
              <TripLocalRecommendations
                ref="recommendationsComponent"
                :destination="trip.destination"
                :use-saved-data="true"
                @data-updated="updateRecommendationsData"
              />
            </div>
            
            <!-- Travel Adapter Information -->
            <div v-else-if="selectedView === 'adapter'">
              <TravelPlugInfo :destination="trip.destination" />
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useTripStore } from '@/stores/trip';
import { useAuthStore } from '@/stores/auth';
import BudgetCard from '@/components/BudgetCard.vue';
import TripDetailsCard from '@/components/trip/TripDetailsCard.vue';
import FlightDetailsCard from '@/components/trip/FlightDetailsCard.vue';
import HotelDetailsCard from '@/components/trip/HotelDetailsCard.vue';
import DailyScheduleCard from '@/components/trip/DailyScheduleCard.vue';
import TripPdfGenerator from '@/components/trip/TripPdfGenerator.vue';
import TripWeatherForecast from '@/components/trip/TripWeatherForecast.vue';
import TripPackingList from '@/components/trip/TripPackingList.vue';
import TripLocalRecommendations from '@/components/trip/TripLocalRecommendations.vue';
import TripBudgetAnalysis from '@/components/trip/TripBudgetAnalysis.vue';
import TravelPlugInfo from '@/components/trip/TravelPlugInfo.vue';

const route = useRoute();
const router = useRouter();
const tripStore = useTripStore();
const authStore = useAuthStore();
const trip = ref<any>(null);
const flights = ref<any[]>([]);
const hotel = ref<any>(null);
const schedule = ref<any[]>([]);
const loading = ref(true);
const summaryContent = ref<HTMLElement | null>(null);
const plannedExpenses = computed(() => tripStore.plannedExpenses);
const packingListComponent = ref<any>(null);

// Component refs for data collection
const weatherComponent = ref<any>(null);
const packingComponent = ref<any>(null);
const recommendationsComponent = ref<any>(null);

// Data for PDF generation
const weatherData = ref<any[]>([]);
const packingData = ref<any>(null);
const recommendationsData = ref<any>(null);
const budgetData = ref<any>(null);

// Trip name editing
const isEditingName = ref(false);
const tripName = ref('');

const selectedView = ref('flight');

// Function to check if a section has data
const hasData = (section: string): boolean => {
  switch (section) {
    case 'flight':
      return !!(flights.value && flights.value.length > 0);
    case 'hotel':
      return !!hotel.value;
    case 'daily':
      return !!schedule.value && schedule.value.length > 0;
    case 'budget':
      return true; // Budget is always available
    case 'weather':
      return !!trip.value?.destination; // Weather is available if destination is set
    case 'packing':
      return true; // Packing list is always available
    case 'recommendations':
      return !!trip.value?.destination; // Recommendations are available if destination is set
    case 'adapter':
      return !!trip.value?.destination; // Travel adapter info is available if destination is set
    default:
      return false;
  }
};

// Helper function to get flight type label
const getFlightTypeLabel = (flightType: string): string => {
  switch (flightType) {
    case 'one-way':
      return 'One Way';
    case 'round-trip':
      return 'Round Trip';
    case 'multi-city':
    case 'multi-trip':
      return 'Multi City';
    default:
      return 'Flight';
  }
};

// Helper function to calculate total flight price
const getTotalFlightPrice = (): number => {
  if (!flights.value || flights.value.length === 0) return 0;
  return flights.value.reduce((total, flight) => {
    let price = 0;
    if (typeof flight.price === 'number') {
      price = flight.price;
    } else if (typeof flight.price === 'string') {
      price = parseFloat(flight.price) || 0;
    } else if (flight.price && typeof flight.price === 'object') {
      if (flight.price.total) {
        price = parseFloat(flight.price.total) || 0;
      } else if (flight.price.grandTotal) {
        price = parseFloat(flight.price.grandTotal) || 0;
      } else if (flight.price.base) {
        price = parseFloat(flight.price.base) || 0;
      }
    }
    return total + price;
  }, 0);
};

// Format price for display
const formatPrice = (price: number | string | undefined): string => {
  if (price === undefined || price === null) return 'N/A';
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 }).format(numPrice);
};

// Watch for changes to selectedView to auto-generate content when needed
watch(selectedView, (newView) => {
  if (newView === 'recommendations' && !trip.value?.recommendations) {
    // Recommendations will be loaded by the component
  }
});

const viewOptions = [
  { label: 'Flight', value: 'flight' },
  { label: 'Hotel', value: 'hotel' },
  { label: 'Daily', value: 'daily' },
  { label: 'Budget', value: 'budget' },
  { label: 'Weather', value: 'weather' },
  { label: 'Packing', value: 'packing' },
  { label: 'Recommendations', value: 'recommendations' },
  { label: 'Travel Adapter', value: 'adapter' },
];

const fetchTripSummary = async () => {
  loading.value = true;
  try {
    const tripId = route.params.tripId || tripStore.tripId;
    if (tripId) {
      try {
        const response = await axios.get(`http://localhost:3002/api/trips/summary/${tripId}`);
        console.log('Trip summary data from API:', response.data);
        tripStore.populateFromSummary(response.data);
      } catch (apiError) {
        console.error('Error fetching trip summary from API:', apiError);
        // Continue with local data if API fails
        alert('Could not connect to the server. Using locally stored trip data.');
      }
    }
    
    // Use store data regardless of API success/failure
    trip.value = {
      id: tripStore.tripId,
      name: tripStore.tripName || '',
      destination: tripStore.destination,
      destination_iata_code: tripStore.destinationIataCode,
      start_date: tripStore.startDate,
      end_date: tripStore.endDate,
      budget: tripStore.initialBudget,
      group_size: tripStore.groupSize,
      transport: tripStore.transport,
      activities: tripStore.activities,
      other_activity: tripStore.otherActivity,
      special_needs: tripStore.specialNeeds,
    };
    
    // Ensure flight data is properly extracted with ALL database fields
    if (tripStore.flights.length > 0) {
      flights.value = tripStore.flights.map(flightData => {
        // Create a normalized flight object with ALL database fields
        const normalizedFlight = {
          id: flightData.id || Date.now(),
          leg_number: flightData.leg_number || 1,
          flight_type: flightData.flight_type || 'one-way',
          airline: 'Unknown Airline', // Will be determined below
          flight_number: flightData.flight_number || '',
          from_city: flightData.from_city || flightData.fromCity || 'Unknown Origin',
          to_city: flightData.to_city || flightData.toCity || 'Unknown Destination',
          from_iata: flightData.from_iata || flightData.fromIata || 'N/A',
          to_iata: flightData.to_iata || flightData.toIata || 'N/A',
          departure_date: flightData.departure_date || flightData.departureDate || new Date().toISOString(),
          departure_time: flightData.departure_time || flightData.departureTime || flightData.departure || null,
          arrival_date: flightData.arrival_date || flightData.arrivalDate || new Date().toISOString(),
          arrival_time: flightData.arrival_time || flightData.arrivalTime || flightData.arrival || null,
          travel_class: flightData.travel_class || flightData.travelClass || 'ECONOMY',
          price: flightData.price || 0,
          currency: flightData.currency || 'THB',
          duration: flightData.duration || 'PT0H',
          stops: flightData.stops || 0,
          traveler_type: flightData.traveler_type || 'ADULT',
          fare_class: flightData.fare_class || 'ECONOMY',
          baggage_quantity: flightData.baggage_quantity || 0,
          bag_weight: flightData.bag_weight || '',
          bag_weight_unit: flightData.bag_weight_unit || '',
          aircraft_code: flightData.aircraft_code || '',
          fare_basis: flightData.fare_basis || ''
        };

        // Extract airline information with better logic
        if (flightData.airline && flightData.airline !== 'Unknown Airline') {
          normalizedFlight.airline = flightData.airline;
        } else if (flightData.dictionaries && flightData.itineraries) {
          const firstSegment = flightData.itineraries[0]?.segments[0];
          if (firstSegment && firstSegment.carrierCode && flightData.dictionaries.carriers) {
            const airlineName = flightData.dictionaries.carriers[firstSegment.carrierCode];
            normalizedFlight.airline = airlineName || `${firstSegment.carrierCode} Airlines`;
          }
        } else if (flightData.itineraries && flightData.itineraries[0]?.segments[0]?.carrierCode) {
          // If no dictionaries but we have carrier code, use it
          const carrierCode = flightData.itineraries[0].segments[0].carrierCode;
          normalizedFlight.airline = `${carrierCode} Airlines`;
        } else if (flightData.validatingAirlineCodes && flightData.validatingAirlineCodes.length > 0) {
          // Use validating airline code as fallback
          normalizedFlight.airline = `${flightData.validatingAirlineCodes[0]} Airlines`;
        }

        // Extract departure and arrival information with better error handling
        if (flightData.itineraries && flightData.itineraries[0]?.segments) {
          const firstSegment = flightData.itineraries[0].segments[0];
          const lastSegment = flightData.itineraries[0].segments[flightData.itineraries[0].segments.length - 1];

          if (firstSegment && firstSegment.departure && firstSegment.departure.at) {
            normalizedFlight.departure_date = firstSegment.departure.at;
            normalizedFlight.departure_time = firstSegment.departure.at;

            // Extract origin city and IATA if not already set
            if (normalizedFlight.from_city === 'Unknown Origin' && firstSegment.departure.iataCode) {
              normalizedFlight.from_iata = firstSegment.departure.iataCode;
            }
          }

          if (lastSegment && lastSegment.arrival && lastSegment.arrival.at) {
            normalizedFlight.arrival_date = lastSegment.arrival.at;
            normalizedFlight.arrival_time = lastSegment.arrival.at;

            // Extract destination city and IATA if not already set
            if (normalizedFlight.to_city === 'Unknown Destination' && lastSegment.arrival.iataCode) {
              normalizedFlight.to_iata = lastSegment.arrival.iataCode;
            }
          }

          // Calculate number of stops
          normalizedFlight.stops = flightData.itineraries[0].segments.length - 1;
        }

        // Extract price information with better handling
        if (typeof flightData.price === 'number') {
          normalizedFlight.price = flightData.price;
        } else if (flightData.price && typeof flightData.price === 'object') {
          if (flightData.price.total) {
            normalizedFlight.price = parseFloat(flightData.price.total);
          } else if (flightData.price.grandTotal) {
            normalizedFlight.price = parseFloat(flightData.price.grandTotal);
          } else if (flightData.price.base) {
            normalizedFlight.price = parseFloat(flightData.price.base);
          }
        }

        // Extract duration with better handling
        if (flightData.duration) {
          normalizedFlight.duration = flightData.duration;
        } else if (flightData.itineraries && flightData.itineraries[0]?.duration) {
          normalizedFlight.duration = flightData.itineraries[0].duration;
        }

        return { ...flightData, ...normalizedFlight };
      });

      console.log('Normalized flights data:', flights.value);
    } else {
      flights.value = [];
    }
    
    // Ensure hotel data is properly extracted with ALL database fields
    hotel.value = tripStore.hotel;
    if (hotel.value) {
      // Create a normalized hotel object with ALL database fields
      const normalizedHotel = {
        id: hotel.value.id || Date.now(),
        name: hotel.value.name || 'Hotel in ' + (trip.value?.destination || 'destination'),
        price: hotel.value.price || 0,
        currency: hotel.value.currency || 'THB',
        description: hotel.value.description || `Comfortable ${hotel.value.name || 'hotel'} room with all amenities.`,
        image_url: hotel.value.image_url || hotel.value.image || 'https://source.unsplash.com/featured/300x200/?hotel',
        location: hotel.value.location || hotel.value.cityCode || hotel.value.city_code || trip.value?.destination || 'Unknown Location',
        rating: hotel.value.rating || 3,
        amenities: hotel.value.amenities || [],
        check_in_date: hotel.value.check_in_date || hotel.value.checkInDate || trip.value?.start_date || new Date().toISOString().split('T')[0],
        check_out_date: hotel.value.check_out_date || hotel.value.checkOutDate || trip.value?.end_date || new Date(Date.now() + 86400000).toISOString().split('T')[0],
        stops: hotel.value.stops || 0,
        city_code: hotel.value.city_code || hotel.value.cityCode || '',
        number_of_adults: hotel.value.number_of_adults || trip.value?.group_size || 1,
        room: hotel.value.room || {},
        policies: hotel.value.policies || {},
        room_type: hotel.value.room_type || 'STANDARD',
        room_beds: hotel.value.room_beds || 1,
        room_bed_type: hotel.value.room_bed_type || 'KING',
        room_description: hotel.value.room_description || 'Standard room with all amenities',
        cancellation_policy: hotel.value.cancellation_policy || '',
        payment_methods: hotel.value.payment_methods || [],
        contact_phone: hotel.value.contact_phone || '',
        contact_email: hotel.value.contact_email || ''
      };
      
      // Extract check-in and check-out dates
      if (hotel.value.check_in_date) {
        normalizedHotel.check_in_date = hotel.value.check_in_date;
      } else if (hotel.value.checkInDate) {
        normalizedHotel.check_in_date = hotel.value.checkInDate;
      }
      
      if (hotel.value.check_out_date) {
        normalizedHotel.check_out_date = hotel.value.check_out_date;
      } else if (hotel.value.checkOutDate) {
        normalizedHotel.check_out_date = hotel.value.checkOutDate;
      }
      
      // Extract room details
      if (hotel.value.offers && hotel.value.offers.length > 0) {
        const offer = hotel.value.offers[0];
        
        if (offer.room) {
          if (offer.room.type) {
            normalizedHotel.room_type = offer.room.type;
          }
          
          if (offer.room.description?.text) {
            normalizedHotel.room_description = offer.room.description.text;
            if (!normalizedHotel.description) {
              normalizedHotel.description = offer.room.description.text;
            }
          }
          
          if (offer.room.typeEstimated?.beds) {
            normalizedHotel.room_beds = offer.room.typeEstimated.beds;
          }
          
          if (offer.room.typeEstimated?.bedType) {
            normalizedHotel.room_bed_type = offer.room.typeEstimated.bedType;
          }
        }
        
        // Extract price
        if (offer.price) {
          if (typeof offer.price.total === 'string') {
            normalizedHotel.price = parseFloat(offer.price.total);
          } else if (typeof offer.price.total === 'number') {
            normalizedHotel.price = offer.price.total;
          }
          
          if (offer.price.currency) {
            normalizedHotel.currency = offer.price.currency;
          }
        }
        
        // Extract guest information
        if (offer.guests?.adults) {
          normalizedHotel.number_of_adults = offer.guests.adults;
        }
      } else if (typeof hotel.value.price === 'number') {
        normalizedHotel.price = hotel.value.price;
      }
      
      // Update hotel value with normalized data
      hotel.value = { ...hotel.value, ...normalizedHotel };
    }
    
    schedule.value = tripStore.tripDays;
  } catch (error) {
    console.error('Error setting up trip summary:', error);
    // Provide fallback data
    trip.value = {
      id: route.params.tripId || 'mock-trip-123',
      destination: 'Bangkok',
      start_date: '2025-08-05',
      end_date: '2025-08-07',
      budget: 10000,
      group_size: 2,
      transport: 'Flight',
      activities: ['Sightseeing', 'Food'],
      other_activity: '',
      special_needs: '',
    };
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Invalid Date';
  }
};

const formatDateTime = (dateString: string | undefined | null) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting datetime:', dateString, error);
    return 'Invalid Date';
  }
};

const formatDuration = (duration: string | undefined | null) => {
  if (!duration) return 'N/A';
  
  try {
    // Parse ISO 8601 duration format (PT1H30M)
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (match) {
      const hours = match[1] ? parseInt(match[1]) : 0;
      const minutes = match[2] ? parseInt(match[2]) : 0;
      
      if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m`;
      } else if (hours > 0) {
        return `${hours}h`;
      } else if (minutes > 0) {
        return `${minutes}m`;
      }
    }
    
    return duration;
  } catch (error) {
    console.error('Error formatting duration:', duration, error);
    return 'N/A';
  }
};

const saveTrip = async () => {
  if (!trip.value?.name) {
    startEditName();
    return;
  }
  
  try {
    // Get user ID from auth store or use default
    const userId = authStore.user?.id || 1;
    
    // Check if this is a new trip or existing trip
    const isNewTrip = !trip.value?.id || trip.value.id.toString().includes('mock') || trip.value.id === 'new';
    let tripId = trip.value?.id || route.params.tripId || 'new-trip-' + Date.now();
    
    console.log('Saving trip with ID:', tripId, 'isNewTrip:', isNewTrip);
    
    // Save all trip data to database
    try {
      // For new trips, create it first
      if (isNewTrip) {
        try {
          console.log('Creating new trip...');
          const createResponse = await axios.post(`http://localhost:3002/api/trips`, {
            user_id: userId,
            name: trip.value.name,
            destination: trip.value?.destination || 'Unknown',
            destination_iata_code: trip.value?.destination_iata_code || '',
            start_date: trip.value?.start_date || new Date().toISOString().split('T')[0],
            end_date: trip.value?.end_date || new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
            budget: trip.value?.budget || 0,
            group_size: trip.value?.group_size || 1,
            transport: trip.value?.transport || 'Flight',
            activities: trip.value?.activities || [],
            other_activity: trip.value?.other_activity || '',
            special_needs: trip.value?.special_needs || ''
          });
          
          // Update tripId with the newly created ID
          if (createResponse.data && createResponse.data.id) {
            console.log('Created new trip with ID:', createResponse.data.id);
            tripId = createResponse.data.id;
            trip.value = { ...trip.value, id: tripId };
            tripStore.tripId = tripId;
          }
        } catch (createError) {
          console.error('Error creating new trip:', createError);
          // Continue with the temporary ID
        }
      }
      
      // Save trip details and other data
      await saveTripDetails(tripId);
      
    } catch (apiError) {
      console.error('Error saving trip to API:', apiError);
      // Save locally if API fails
      if (trip.value && trip.value.name) {
        localStorage.setItem(`trip-${tripId}-name`, trip.value.name);
        localStorage.setItem(`trip-${tripId}-data`, JSON.stringify(trip.value));
        localStorage.setItem(`trip-${tripId}-budget`, JSON.stringify(plannedExpenses.value));
        localStorage.setItem(`trip-${tripId}-flights`, JSON.stringify(flights.value));
        localStorage.setItem(`trip-${tripId}-hotel`, JSON.stringify(hotel.value));
        localStorage.setItem(`trip-${tripId}-schedule`, JSON.stringify(schedule.value));
        
        alert(`Server connection failed. Trip "${trip.value.name}" saved locally.`);
      }
    }
  } catch (error) {
    console.error('Error in save trip process:', error);
    alert('Failed to save trip. Please try again.');
  }
};

// Save trip details to the database - only save trip name to saved_trips table
const saveTripDetails = async (tripId: string | number) => {
  try {
    console.log('Saving trip name to saved_trips table for trip:', tripId);
    
    // Only save the trip to saved_trips table with the name
    await axios.post(`http://localhost:3002/api/trips/${tripId}/save`, { name: trip.value.name }, { timeout: 5000 });
    
    console.log('Trip name saved to saved_trips successfully');
    alert(`✅ Trip "${trip.value.name}" saved successfully!`);
    
  } catch (error) {
    console.error('Error saving trip name to saved_trips:', error);
    throw error;
  }
};

const goBack = () => {
  router.back();
};

// Edit functionality
const editTripDetails = () => {
  if (trip.value?.id) {
    // Store the return route in localStorage
    localStorage.setItem('returnToSummaryMyTrip', 'true');
    localStorage.setItem('summaryTripId', trip.value.id.toString());
    router.push({ name: 'modifystartplan', params: { tripId: trip.value.id } });
  }
};

const editFlight = () => {
  if (trip.value?.id) {
    // Store the return route in localStorage
    localStorage.setItem('returnToSummaryMyTrip', 'true');
    localStorage.setItem('summaryTripId', trip.value.id.toString());
    router.push({ name: 'modifyflight', params: { tripId: trip.value.id } });
  }
};

const editHotel = () => {
  if (trip.value?.id) {
    // Store the return route in localStorage
    localStorage.setItem('returnToSummaryMyTrip', 'true');
    localStorage.setItem('summaryTripId', trip.value.id.toString());
    router.push({ name: 'modifyhotel', params: { tripId: trip.value.id } });
  }
};

const editSchedule = () => {
  if (trip.value?.id) {
    // Store the return route in localStorage
    localStorage.setItem('returnToSummaryMyTrip', 'true');
    localStorage.setItem('summaryTripId', trip.value.id.toString());
    router.push({ name: 'modifyschedule', params: { tripId: trip.value.id } });
  }
};

// Trip name editing functions
const startEditName = () => {
  tripName.value = trip.value?.name || '';
  isEditingName.value = true;
};

const cancelEditName = () => {
  isEditingName.value = false;
};

const saveTripName = async () => {
  if (!tripName.value.trim()) {
    alert("Trip name cannot be empty");
    return;
  }
  
  try {
    const tripId = trip.value?.id || route.params.tripId;
    if (tripId) {
      await axios.post(`http://localhost:3002/api/trips/${tripId}/name`, { name: tripName.value });
      if (trip.value) {
        trip.value.name = tripName.value;
      }
      isEditingName.value = false;
      
      // Update trip name in store
      if (tripStore.tripId === Number(tripId)) {
        tripStore.setTripName(tripName.value);
      }
      
      // Auto-save all changes to database
      await autoSaveChanges();
    }
  } catch (error) {
    console.error('Error updating trip name:', error);
    alert('Failed to update trip name. Please try again.');
  }
};

// Auto-save function to save changes to database when modifications are made
const autoSaveChanges = async () => {
  if (!trip.value?.id || !trip.value?.name) return;
  
  try {
    console.log('Auto-saving trip name to saved_trips...');
    await saveTripDetails(trip.value.id);
    console.log('Auto-save completed successfully');
  } catch (error) {
    console.error('Auto-save failed:', error);
    // Don't show alert for auto-save failures to avoid interrupting user experience
  }
};

// Add packing item from suggestion
const addPackingItemFromSuggestion = (itemName: string) => {
  if (packingListComponent.value) {
    packingListComponent.value.addPackingItemFromSuggestion(itemName);
  }
};

// Data update methods for PDF generation
const updateWeatherData = (data: any[]) => {
  weatherData.value = data;
};

const updatePackingData = (data: any) => {
  packingData.value = data;
};

const updateRecommendationsData = (data: any) => {
  recommendationsData.value = data;
};

onMounted(async () => {
  await fetchTripSummary();
});
</script>
