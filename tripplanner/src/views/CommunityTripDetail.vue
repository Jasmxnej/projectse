t<template>
  <Nav />
  <div class="min-h-screen bg-gray-50 pt-20">
    <div v-if="currentTrip" class="container mx-auto px-4 py-8">
      <!-- Floating Navigation Bar like TripSummary -->
      <div class="fixed top-16 left-0 right-0 z-50">
        <div class="bg-white backdrop-blur-md rounded-none px-6 py-2 mx-4">
          <div class="flex items-center justify-center space-x-1 max-w-6xl mx-auto overflow-x-auto">
            <button
              v-for="option in viewOptions"
              :key="option.value"
              type="button"
              @click="selectedView = option.value"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 whitespace-nowrap flex-shrink-0',
                selectedView === option.value
                  ? 'bg-teal-600 text-white shadow-md scale-105'
                  : 'text-gray-700 hover:bg-gray-100 hover:scale-105'
              ]"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <main class="pt-24 space-y-8">
        <!-- Overview Tab -->
        <div v-if="selectedView === 'overview'">
          <!-- Header -->
          <div class="mb-8">
            <RouterLink to="/community" class="inline-flex items-center text-teal-600 hover:text-teal-800 mb-4">
              ← Back to Community
            </RouterLink>
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                :src="currentTrip.image"
                :alt="currentTrip.title"
                class="w-full h-64 object-cover"
                @error="(e) => handleImageError(e, currentTrip?.destination || 'travel')"
              />
              <div class="p-6">
                <div class="flex items-center justify-between mb-2">
                  <h1 class="text-3xl font-bold text-gray-800">{{ currentTrip.title }}</h1>
                  <span class="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm">
                    {{ formatDateRange(currentTrip.start_date, currentTrip.end_date) }}
                  </span>
                </div>
                <p class="text-xl text-gray-600 mb-4">{{ currentTrip.destination }}</p>
                <div class="flex items-center space-x-4 text-sm text-gray-500">
                  <div class="flex items-center space-x-1">
                    <img :src="getAvatar(currentTrip.creator.username)" alt="Creator" class="w-6 h-6 rounded-full" @error="handleAvatarError" />
                    <span>by {{ currentTrip.creator.username }}</span>
                  </div>
                  <span>{{ currentTrip.details.comments.length }} comments</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Trip Overview Section -->
          <section class="mb-8">
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-2xl font-semibold mb-4 text-gray-800">Trip Overview</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Trip Details -->
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 class="text-lg font-semibold text-gray-800 mb-2">Trip Details</h3>
                  <div class="space-y-2 text-sm">
                    <p><span class="font-medium">Destination:</span> {{ currentTrip.destination }}</p>
                    <p><span class="font-medium">Dates:</span> {{ formatDateRange(currentTrip.start_date, currentTrip.end_date) }}</p>
                    <p><span class="font-medium">Group Size:</span> {{ currentTrip.group_size || 1 }} people</p>
                    <p><span class="font-medium">Transport:</span> {{ currentTrip.transport }}</p>
                  </div>
                </div>
                
                <!-- Flight Summary -->
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 class="text-lg font-semibold text-gray-800 mb-2">Flights</h3>
                  <div v-if="currentTrip.details.flights && currentTrip.details.flights.length > 0" class="space-y-3 text-sm">
                    <div v-for="(flight, index) in currentTrip.details.flights" :key="flight.id || index" class="border-l-4 border-teal-500 pl-3">
                      <p><span class="font-medium">Route:</span> {{ flight.departureCity }} ({{ flight.departureTime }}) → {{ flight.arrivalCity }} ({{ flight.arrivalTime }})</p>
                      <p><span class="font-medium">Airline:</span> {{ flight.airline }}</p>
                      <p><span class="font-medium">Duration:</span> {{ flight.duration }}</p>
                      <p><span class="font-medium">Price:</span> {{ flight.price }} {{ flight.currency }}</p>
                    </div>
                  </div>
                </div>
                
                <!-- Hotel Summary -->
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 class="text-lg font-semibold text-gray-800 mb-2">Hotel</h3>
                  <div v-if="currentTrip.details.hotels && currentTrip.details.hotels.length > 0" class="space-y-2 text-sm">
                    <div v-for="hotel in currentTrip.details.hotels" :key="hotel.id">
                      <p><span class="font-medium">Name:</span> {{ hotel.name }}</p>
                      <p><span class="font-medium">Location:</span> {{ hotel.location }}</p>
                      <p><span class="font-medium">Rating:</span> {{ hotel.rating }}/5</p>
                      <p><span class="font-medium">Price:</span> {{ hotel.price }} {{ hotel.currency }}/night</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-6 pt-4 border-t border-gray-200">
                <p class="text-gray-700 leading-relaxed">{{ currentTrip.description }}</p>
              </div>
            </div>
          </section>
        </div>

        <!-- Flights Tab -->
        <div v-else-if="selectedView === 'flight'">
          <FlightDetailsCard :flights="currentTrip.details.flights" :editable="false" />
        </div>

        <!-- Hotels Tab -->
        <div v-else-if="selectedView === 'hotel'">
          <HotelDetailsCard 
            v-if="currentTrip.details.hotels && currentTrip.details.hotels.length > 0"
            :hotel="currentTrip.details.hotels[0]" 
            :destination="currentTrip.destination" 
            :editable="false" 
          />
          <div v-else class="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
            <p>No hotel selected for this trip.</p>
          </div>
        </div>

        <!-- Daily Itinerary Tab -->
        <div v-else-if="selectedView === 'daily'">
          <DailyScheduleCard
            :schedule="scheduleWithIds"
            :destination="currentTrip.destination"
            :editable="false"
          />
        </div>

        <!-- Budget Details Tab -->
        <div v-else-if="selectedView === 'budget'">
          <TripBudgetAnalysis v-bind="budgetProps" />
        </div>

        <!-- Weather Forecast Tab -->
        <div v-else-if="selectedView === 'weather'">
          <TripWeatherForecast
            :destination="currentTrip.destination"
            :start-date="currentTrip.start_date"
            :end-date="currentTrip.end_date"
          />
        </div>

        <!-- Packing List Tab -->
        <div v-else-if="selectedView === 'packing'">
          <TripPackingList
            :trip-id="currentTrip.id"
            :destination="currentTrip.destination"
          />
        </div>

        <!-- Local Recommendations Tab -->
        <div v-else-if="selectedView === 'recommendations'">
          <TripLocalRecommendations
            :destination="currentTrip.destination"
            :trip-id="currentTrip.id"
          />
        </div>
      </main>

      <!-- Comments Section (always visible at bottom) -->
      <section class="mb-8 mt-8">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-semibold mb-4 text-gray-800">Comments ({{ currentTrip.details.comments.length }})</h2>
          <div v-for="comment in currentTrip.details.comments" :key="comment.id" class="mb-4 pb-4 border-b last:border-b-0">
            <div class="flex items-start space-x-3">
              <img
                :src="getAvatar(comment.user)"
                :alt="comment.user"
                class="w-10 h-10 rounded-full object-cover"
                @error="handleAvatarError"
              />
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-1">
                  <span class="font-medium text-gray-800">{{ comment.user }}</span>
                  <span class="text-sm text-gray-500">{{ formatDate(comment.date) }}</span>
                </div>
                <p class="text-gray-700">{{ comment.text }}</p>
              </div>
            </div>
          </div>

          <!-- Add Comment Form -->
          <div class="mt-6 pt-4 border-t">
            <h3 class="font-medium mb-3">Add a Comment</h3>
            <form class="space-y-3">
              <textarea
                v-model="newComment"
                placeholder="Share your thoughts on this trip..."
                class="w-full p-3 border rounded-lg resize-none h-20 focus:outline-none focus:ring-2 focus:ring-teal-500"
              ></textarea>
              <label class="flex items-center space-x-2">
                <input type="checkbox" v-model="showName" class="rounded border-gray-300" />
                <span class="text-sm text-gray-600">Post anonymously</span>
              </label>
              <button
                type="button"
                @click="addComment"
                :disabled="!newComment.trim()"
                class="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post Comment
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>

    <div v-else class="text-center py-12">
      <h2 class="text-2xl font-semibold text-gray-600 mb-4">Trip Not Found</h2>
      <RouterLink to="/community" class="text-teal-600 hover:underline">Back to Community</RouterLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import Nav from '@/components/Nav.vue'
import { useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getMockCommunityTrip } from '@/composables/mockData'
import TripWeatherForecast from '@/components/trip/TripWeatherForecast.vue'
import TripPackingList from '@/components/trip/TripPackingList.vue'
import TripBudgetAnalysis from '@/components/trip/TripBudgetAnalysis.vue'
import TripLocalRecommendations from '@/components/trip/TripLocalRecommendations.vue'
import FlightDetailsCard from '@/components/trip/FlightDetailsCard.vue'
import HotelDetailsCard from '@/components/trip/HotelDetailsCard.vue'
import DailyScheduleCard from '@/components/trip/DailyScheduleCard.vue'

const route = useRoute()
const tripId = parseInt(route.params.id as string)
const currentTrip = ref(getMockCommunityTrip(tripId))
const newComment = ref('')
const selectedView = ref('overview')
const showName = ref(true)
const authStore = useAuthStore()

const viewOptions = [
  { label: 'Overview', value: 'overview' },
  { label: 'Flights', value: 'flight' },
  { label: 'Hotels', value: 'hotel' },
  { label: 'Daily Itinerary', value: 'daily' },
  { label: 'Budget Details', value: 'budget' },
  { label: 'Weather Forecast', value: 'weather' },
  { label: 'Packing List', value: 'packing' },
  { label: 'Local Recommendations', value: 'recommendations' },
]

// Computed for BudgetAnalysis props
const budgetProps = computed(() => {
  const budget = currentTrip.value?.details.budget;
  if (!budget) {
    return {
      destination: '',
      totalBudget: 0,
      plannedExpenses: { total: 0, flight: 0, hotel: 0, plan: 0 }
    };
  }

  const breakdown = budget.breakdown as Record<string, number>;
  const flight = breakdown.flights || 0;
  const hotel = breakdown.hotels || 0;
  const activities = breakdown.activities || 0;
  const food = breakdown.food || 0;
  const totalPlanned = Object.values(breakdown).reduce((sum: number, val: number) => sum + val, 0);

  return {
    destination: currentTrip.value?.destination || '',
    totalBudget: budget.total || 0,
    plannedExpenses: {
      total: totalPlanned,
      flight,
      hotel,
      plan: activities + food
    }
  };
})

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formatDateRange = (start: string, end: string): string => {
  return `${formatDate(start)} - ${formatDate(end)}`
}

const formatDateTime = (dateString: string): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting datetime:', dateString, error);
    return 'N/A';
  }
}

const getAvatar = (username: string): string => {
  // Use a set of static Unsplash portrait images, cycle based on hash for "real" photos
  const staticPortraits = [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=40&h=40&fit=crop&crop=face'
  ];

  // Simple hash to select portrait
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % staticPortraits.length;
  return staticPortraits[index];
}

const scheduleWithIds = computed(() => {
  return (currentTrip.value?.details.schedule || []).map((day, index) => ({
    ...day,
    id: `day-${index + 1}`
  }))
})

const addComment = () => {
  if (newComment.value.trim()) {
    const currentUserName = showName.value ? 'Anonymous' : (authStore.user?.name || 'Anonymous')
    // Mock add - in real app, post to API
    currentTrip.value?.details.comments.push({
      id: Date.now(),
      user: currentUserName,
      date: new Date().toISOString(),
      text: newComment.value.trim()
    })
    newComment.value = ''
  }
}

onMounted(() => {
  authStore.fetchUser()
  if (!currentTrip.value) {
    // Handle not found
  }
})

const handleImageError = (event: Event, destination?: string) => {
  const target = event.target as HTMLImageElement;
  const query = destination ? `${destination},travel` : 'travel,destination';
  target.src = `https://source.unsplash.com/800x400/?${query}&auto=format&fit=crop&q=80`;
}

const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  const staticPortraits = [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=40&h=40&fit=crop&crop=face'
  ];
  const randomIndex = Math.floor(Math.random() * staticPortraits.length);
  target.src = staticPortraits[randomIndex];
  target.onerror = null; // Prevent infinite loop
}
</script>

<style scoped>
/* Smooth scrolling enhancement */
html {
  scroll-behavior: smooth;
}

/* Enhanced button hover effects */
button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

button:hover {
  transform: translateY(-1px);
}

/* Floating navigation enhancement */
.backdrop-blur-md {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
</style>