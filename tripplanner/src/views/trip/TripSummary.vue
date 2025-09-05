<template>
  <div class="bg-gray-50 min-h-screen font-sans text-gray-800">
    <main class="p-4 lg:p-8" ref="summaryContent">
      <div class="max-w-7xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-4xl font-bold text-gray-900">Trip Summary</h1>
          <div class="flex items-center space-x-2">
            <button @click="goBack" class="px-4 py-2 bg-white border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-100 transition-colors font-medium">
              Back
            </button>
            <button @click="saveTrip" class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold shadow-md">
              Save Trip
            </button>
            <TripPdfGenerator
              :trip="trip"
              :summaryContent="summaryContent || {}"
              :flights="flights"
              :hotel="hotel"
              :schedule="schedule"
              :weatherData="weatherForecastComponent?.weatherData || []"
              :packingData="packingListComponent?.packingItems || null"
              :recommendationsData="localRecommendationsComponent?.categorizedRecommendations || null"
              :budgetData="{ plannedExpenses, analysis: `Your budget looks well-planned for a trip to ${trip?.destination}. Make sure to set aside some money for unexpected expenses and souvenirs.` }"
            />
          </div>
        </div>

        <div v-if="loading" class="text-center py-16">
          <p class="text-lg text-gray-600">Loading your summary trip...</p>
        </div>

        <div v-if="!loading && trip" class="space-y-8">
          <!-- Trip Details & Budget -->
          <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div class="xl:col-span-2 bg-white rounded-xl shadow-lg p-6">
              <h2 class="text-2xl font-bold text-gray-800 mb-4">Trip Details</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <p><strong>Destination:</strong> {{ trip.destination }}</p>
                <p><strong>Dates:</strong> {{ formatDate(trip.start_date) }} to {{ formatDate(trip.end_date) }}</p>
                <p><strong>Budget:</strong> {{ formatPrice(trip.budget) }}</p>
                <p><strong>Group Size:</strong> {{ trip.group_size }} people</p>
                <p><strong>Transport:</strong> {{ trip.transport }}</p>
                <p v-if="trip.activities"><strong>Interests:</strong> {{ trip.activities.join(', ') }}</p>
                <p v-if="trip.other_activity" class="md:col-span-2"><strong>Other Activities:</strong> {{ trip.other_activity }}</p>
                <p v-if="trip.special_needs" class="md:col-span-2"><strong>Special Needs:</strong> {{ trip.special_needs }}</p>
              </div>
            </div>
            <div class="bg-white rounded-xl shadow-lg p-6">
              <h2 class="text-2xl font-bold text-gray-800 mb-4">Budget Overview</h2>
              <BudgetCard :initial-budget="trip.budget" :planned-expenses="plannedExpenses" />
            </div>
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
                    'px-5 py-2 text-sm font-medium rounded-full transition-all duration-300',
                    selectedView === option.value
                      ? 'bg-teal-600 text-white shadow-md scale-105'
                      : 'text-gray-700 hover:bg-white'
                  ]"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
            
            <!-- Flight Details Tab -->
            <div v-if="selectedView === 'flight'">
              <FlightDetailsCard :flights="flights" :editable="false" />
            </div>
            
            <!-- Hotel Details Tab -->
            <div v-else-if="selectedView === 'hotel'">
              <HotelDetailsCard :hotel="hotel" :destination="trip?.destination" :editable="false" />
            </div>
            
            <!-- Daily Schedule Tab -->
            <div v-else-if="selectedView === 'daily'">
              <h2 class="text-2xl font-bold text-gray-800 mb-4">Daily Schedule</h2>
              <div v-if="schedule && schedule.length > 0" class="space-y-6">
                <div v-for="day in schedule" :key="day.id" class="bg-gray-50 rounded-xl shadow p-4">
                  <h3 class="text-xl font-bold text-teal-700 mb-4">Day {{ day.day }}</h3>
                  
                  <div v-if="day.activities && day.activities.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div
                      v-for="activity in parseActivities(day.activities)"
                      :key="activity.id"
                      class="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm transition-shadow"
                    >
                      <img
                        :src="activity.image || `https://source.unsplash.com/640x360/?${activity.name},travel`"
                        :alt="activity.name"
                        class="w-full h-40 object-cover"
                        @error="handleActivityImageError"
                      />
                      <div class="p-4">
                        <div class="flex justify-between items-start">
                          <h4 class="font-bold text-lg text-gray-800">{{ activity.name }}</h4>
                          <span class="text-sm font-medium bg-teal-100 text-teal-800 px-2 py-1 rounded">{{ activity.time }}</span>
                        </div>
                        <p v-if="activity.location" class="text-sm text-gray-600 mt-1">
                          <span class="inline-block mr-1">📍</span>{{ activity.location }}
                        </p>
                        <p v-if="activity.description" class="text-gray-700 text-sm mt-2 mb-3">{{ activity.description }}</p>
                        <p v-if="activity.cost" class="font-semibold text-teal-600">{{ formatPrice(activity.cost) }}</p>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-center py-4 text-gray-500">
                    <p>No activities planned for this day.</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                <p>No daily schedule has been created yet.</p>
              </div>
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
                :destination="trip.destination"
                :start-date="trip.start_date"
                :end-date="trip.end_date"
                @add-to-packing="addPackingItemFromSuggestion"
                ref="weatherForecastComponent"
              />
            </div>
            
            <!-- Packing List Tab -->
            <div v-else-if="selectedView === 'packing'">
              <TripPackingList
                :trip-id="trip.id"
                :destination="trip.destination"
                ref="packingListComponent"
              />
            </div>
            
            <!-- Local Recommendations Tab -->
            <div v-else-if="selectedView === 'recommendations'">
              <TripLocalRecommendations
                :destination="trip.destination"
                ref="localRecommendationsComponent"
              />
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
import TripPdfGenerator from '@/components/trip/TripPdfGenerator.vue';
import TripWeatherForecast from '@/components/trip/TripWeatherForecast.vue';
import TripPackingList from '@/components/trip/TripPackingList.vue';
import TripLocalRecommendations from '@/components/trip/TripLocalRecommendations.vue';
import TripBudgetAnalysis from '@/components/trip/TripBudgetAnalysis.vue';
import FlightDetailsCard from '@/components/trip/FlightDetailsCard.vue';
import HotelDetailsCard from '@/components/trip/HotelDetailsCard.vue';

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

const selectedView = ref('flight');

// Preload components data on mount
const weatherForecastComponent = ref<any>(null);
const localRecommendationsComponent = ref<any>(null);

// Watch for changes to selectedView to auto-generate content when needed
watch(selectedView, (newView) => {
  // No need to trigger loading on tab change since we preload data
});

const viewOptions = [
  { label: 'Flight', value: 'flight' },
  { label: 'Hotel', value: 'hotel' },
  { label: 'Daily', value: 'daily' },
  { label: 'Budget', value: 'budget' },
  { label: 'Weather', value: 'weather' },
  { label: 'Packing', value: 'packing' },
  { label: 'Recommendations', value: 'recommendations' },
];

const fetchTripSummary = async () => {
  loading.value = true;
  try {
    const tripId = route.params.tripId || tripStore.tripId;
    if (tripId) {
      try {
        const response = await axios.get(`http://localhost:3002/api/trips/summary/${tripId}`);
        if (response.data) {
          tripStore.populateFromSummary(response.data);
        }
      } catch (apiError: any) {
        console.error('Error fetching trip summary from API:', apiError);
        // Check if it's a network error or server error
        if (apiError.code === 'ECONNREFUSED' || apiError.code === 'ERR_NETWORK') {
          console.warn('Server connection failed, using local data');
        } else if (apiError.response?.status === 404) {
          console.warn('Trip not found on server, using local data');
        } else {
          console.warn('API error occurred, using local data:', apiError.message);
        }
        // Continue with local data if API fails - don't show alert to user
      }
    }
    
    // Use store data regardless of API success/failure
    trip.value = {
      id: tripStore.tripId,
      destination: tripStore.destination,
      start_date: tripStore.startDate,
      end_date: tripStore.endDate,
      budget: tripStore.initialBudget,
      group_size: tripStore.groupSize,
      transport: tripStore.transport,
      activities: tripStore.activities,
      other_activity: tripStore.otherActivity,
      special_needs: tripStore.specialNeeds,
    };



    
    // Ensure flight data is properly formatted with ALL database fields
    if (tripStore.flights.length > 0) {
      flights.value = tripStore.flights.map((flightData, index) => {
        // Extract airline name with better logic
        let airlineName = 'Unknown Airline';
        if (flightData.airline && flightData.airline !== 'Unknown Airline') {
          airlineName = flightData.airline;
        } else if (flightData.dictionaries && flightData.itineraries) {
          const firstSegment = flightData.itineraries[0]?.segments[0];
          if (firstSegment && firstSegment.carrierCode && flightData.dictionaries.carriers) {
            const carrierName = flightData.dictionaries.carriers[firstSegment.carrierCode];
            airlineName = carrierName || `${firstSegment.carrierCode} Airlines`;
          }
        } else if (flightData.itineraries && flightData.itineraries[0]?.segments[0]?.carrierCode) {
          const carrierCode = flightData.itineraries[0].segments[0].carrierCode;
          airlineName = `${carrierCode} Airlines`;
        } else if (flightData.validatingAirlineCodes && flightData.validatingAirlineCodes.length > 0) {
          airlineName = `${flightData.validatingAirlineCodes[0]} Airlines`;
        }

        return {
          ...flightData,
          // Ensure ALL database fields exist for the flight details component
          airline: airlineName,
          flight_number: flightData.flight_number || '',
          from_city: flightData.from_city || flightData.fromCity || 'Unknown',
          to_city: flightData.to_city || flightData.toCity || 'Unknown',
          from_iata: flightData.from_iata || flightData.fromIata || 'Unknown',
          to_iata: flightData.to_iata || flightData.toIata || 'Unknown',
          departure_date: flightData.departure_date || (flightData.itineraries && flightData.itineraries[0]?.segments[0]?.departure?.at),
          departure_time: flightData.departure_time || (flightData.itineraries && flightData.itineraries[0]?.segments[0]?.departure?.at),
          arrival_date: flightData.arrival_date || (flightData.itineraries && flightData.itineraries[0]?.segments[flightData.itineraries[0]?.segments.length - 1]?.arrival?.at),
          arrival_time: flightData.arrival_time || (flightData.itineraries && flightData.itineraries[0]?.segments[flightData.itineraries[0]?.segments.length - 1]?.arrival?.at),
          duration: flightData.duration || (flightData.itineraries && flightData.itineraries[0]?.duration) || 'PT1H10M',
          price: flightData.price || 0,
          currency: flightData.currency || 'THB',
          stops: flightData.stops !== undefined ? flightData.stops : 0,
          travel_class: flightData.travel_class || flightData.travelClass || 'ECONOMY',
          traveler_type: flightData.traveler_type || 'ADULT',
          fare_class: flightData.fare_class || 'ECONOMY',
          baggage_quantity: flightData.baggage_quantity || 0,
          bag_weight: flightData.bag_weight || '',
          bag_weight_unit: flightData.bag_weight_unit || '',
          aircraft_code: flightData.aircraft_code || '',
          fare_basis: flightData.fare_basis || '',
          leg_number: flightData.leg_number || (index + 1)
        };
      });

      console.log('Flight data with all database fields:', flights.value);
    } else {
      flights.value = [];
    }
    
    // Ensure hotel data is properly formatted with ALL database fields
    if (tripStore.hotel) {
      hotel.value = {
        ...tripStore.hotel,
        // Ensure ALL database fields exist for the hotel details component
        name: tripStore.hotel.name || 'Unknown Hotel',
        price: tripStore.hotel.price || 0,
        currency: tripStore.hotel.currency || 'THB',
        description: tripStore.hotel.description || 'Comfortable hotel room with all amenities.',
        image_url: tripStore.hotel.image_url || tripStore.hotel.image || `https://source.unsplash.com/640x360/?hotel,${tripStore.hotel.name || 'resort'}`,
        location: tripStore.hotel.location || tripStore.hotel.cityCode || tripStore.hotel.city_code || 'Unknown',
        rating: tripStore.hotel.rating || 4,
        amenities: tripStore.hotel.amenities || [],
        check_in_date: tripStore.hotel.check_in_date || tripStore.hotel.checkInDate || trip.value.start_date,
        check_out_date: tripStore.hotel.check_out_date || tripStore.hotel.checkOutDate || trip.value.end_date,
        stops: tripStore.hotel.stops || 0,
        city_code: tripStore.hotel.city_code || tripStore.hotel.cityCode || '',
        number_of_adults: tripStore.hotel.number_of_adults || trip.value.group_size || 1,
        room: tripStore.hotel.room || {},
        policies: tripStore.hotel.policies || {},
        room_type: tripStore.hotel.room_type || 'STANDARD',
        room_beds: tripStore.hotel.room_beds || 1,
        room_bed_type: tripStore.hotel.room_bed_type || 'KING',
        room_description: tripStore.hotel.room_description || '',
        cancellation_policy: tripStore.hotel.cancellation_policy || '',
        payment_methods: tripStore.hotel.payment_methods || [],
        contact_phone: tripStore.hotel.contact_phone || '',
        contact_email: tripStore.hotel.contact_email || ''
      };
    } else {
      hotel.value = null;
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

const formatPrice = (price: number | string | undefined | null) => {
  if (price === null || price === undefined) return 'N/A';
  
  try {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'N/A';
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 }).format(numPrice);
  } catch (error) {
    console.error('Error formatting price:', price, error);
    return 'N/A';
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
    return date.toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
  const tripName = prompt("Please enter a name for your trip:");
  if (!tripName) {
    alert("Trip name is required.");
    return;
  }

  // Show loading state with better UX
  const saveButton = document.querySelector('button[class*="bg-teal-600"]') as HTMLButtonElement;
  const originalText = saveButton?.textContent;
  if (saveButton) {
    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';
    saveButton.classList.add('opacity-75');
  }

  try {
    // Get user ID from auth store or use default
    const userId = authStore.user?.id || 1;
    
    // Check if this is a new trip or existing trip
    const isNewTrip = !trip.value?.id || trip.value.id.toString().includes('mock') || trip.value.id === 'new';
    let tripId = trip.value?.id || route.params.tripId || 'new-trip-' + Date.now();
    
    console.log('Saving trip with ID:', tripId, 'isNewTrip:', isNewTrip);
    
    try {
      // For new trips, create it first
      if (isNewTrip) {
        console.log('Creating new trip...');
        const createResponse = await axios.post(`http://localhost:3002/api/trips`, {
          user_id: userId,
          name: tripName,
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
      }
      
      console.log('Saving only trip name to saved_trips table...');
      
      // Only save to saved_trips table with trip name
      try {
        await axios.post(`http://localhost:3002/api/trips/${tripId}/save`, { name: tripName }, { timeout: 5000 });
        console.log('Trip name saved to saved_trips successfully');
        
        // Update the trip ID in the store and current trip object if it was a new trip
        if (isNewTrip && tripId !== trip.value.id) {
          tripStore.tripId = tripId;
          trip.value.id = tripId;
        }
        
        alert(`✅ Trip "${tripName}" saved successfully!`);
      } catch (saveError) {
        console.error('Error adding trip to saved_trips:', saveError);
        throw saveError;
      }
      
    } catch (apiError) {
      console.error('Error saving trip to API:', apiError);
      // Enhanced local storage fallback
      try {
        const localData = {
          name: tripName,
          trip: trip.value,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem(`trip-${tripId}-name`, JSON.stringify(localData));
        alert(`💾 Server connection failed. Trip "${tripName}" saved locally and will sync when connection is restored.`);
      } catch (localError) {
        console.error('Local storage also failed:', localError);
        alert('❌ Failed to save trip. Please check your connection and try again.');
      }
    }
  } catch (error) {
    console.error('Error in save trip process:', error);
    alert('❌ Failed to save trip. Please try again.');
  } finally {
    // Restore button state with animation
    if (saveButton) {
      saveButton.disabled = false;
      saveButton.textContent = originalText || 'Save Trip';
      saveButton.classList.remove('opacity-75');
    }
  }
};

const goBack = () => {
  router.back();
};

const parseActivities = (activities: any): any[] => {
  if (typeof activities === 'string') {
    try {
      return JSON.parse(activities);
    } catch (e) {
      console.error('Error parsing activities JSON:', e);
      return [];
    }
  }
  return activities || [];
};

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  if (target) {
    // Extract the hotel name from the alt attribute or use a default
    const hotelName = target.alt || 'hotel';
    const destination = trip.value?.destination || 'resort';
    
    // Add random parameter to prevent caching issues
    const randomParam = Math.floor(Math.random() * 10000);
    const timestamp = Date.now();
    
    // Use a more specific query to get better images
    target.src = `https://source.unsplash.com/640x360/?${destination.toLowerCase()},hotel&random=${randomParam}&t=${timestamp}`;
    
    // Add error handler to fallback to a generic image if the specific one fails
    target.onerror = () => {
      target.src = `https://source.unsplash.com/640x360/?hotel,resort&random=${Math.floor(Math.random() * 10000)}`;
      // Remove the error handler to prevent infinite loop
      target.onerror = null;
    };
  }
};

const handleActivityImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  if (target) {
    // Extract the activity name from the alt attribute or use a default
    const activityName = target.alt || 'activity';
    const destination = trip.value?.destination || 'travel';
    
    // Add random parameter to prevent caching issues
    const randomParam = Math.floor(Math.random() * 10000);
    const timestamp = Date.now();
    
    // Use a more specific query to get better images
    target.src = `https://source.unsplash.com/640x360/?${destination.toLowerCase()},${activityName.toLowerCase().split(' ')[0]}&random=${randomParam}&t=${timestamp}`;
    
    // Add error handler to fallback to a generic image if the specific one fails
    target.onerror = () => {
      target.src = `https://source.unsplash.com/640x360/?travel,activity&random=${Math.floor(Math.random() * 10000)}`;
      // Remove the error handler to prevent infinite loop
      target.onerror = null;
    };
  }
};

// Edit functionality
const editTripDetails = () => {
  if (trip.value?.id) {
    router.push({ name: 'modifystartplan', params: { tripId: trip.value.id } });
  }
};

const editFlight = () => {
  if (trip.value?.id) {
    router.push({ name: 'modifyflight', params: { tripId: trip.value.id } });
  }
};

const editHotel = () => {
  if (trip.value?.id) {
    router.push({ name: 'modifyhotel', params: { tripId: trip.value.id } });
  }
};

// Add packing item from suggestion
const addPackingItemFromSuggestion = (itemName: string) => {
  if (packingListComponent.value) {
    packingListComponent.value.addPackingItemFromSuggestion(itemName);
  }
};

onMounted(async () => {
  await fetchTripSummary();

  // Wait a short time for components to be mounted
  setTimeout(() => {
    // Preload weather and recommendations data
    if (trip.value && trip.value.destination) {
      // This will trigger data loading in the components even if they're not visible
      if (weatherForecastComponent.value) {
        console.log('Preloading weather data...');
        weatherForecastComponent.value.fetchWeatherForecast?.();
      }

      if (localRecommendationsComponent.value) {
        console.log('Preloading recommendations data...');
        localRecommendationsComponent.value.fetchLocalRecommendations?.();
      }
    }
  }, 500);
});
</script>
