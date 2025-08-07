<template>
  <div class="max-w-7xl mx-auto px-4 space-y-8">

    <!-- Error Alert -->
    <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline"> {{ errorMessage }}</span>
      <span v-if="isMockData" class="block mt-2 font-semibold">Using mock data instead.</span>
    </div>

    <!-- Budget Overview -->
    <div class="">
      <BudgetCard
        :initial-budget="tripStore.initialBudget"
        :planned-expenses="plannedExpenses"
        class="rounded-xl shadow-md p-4 bg-white"
      />
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
        <TripPlanner
          :tripDays="tripDays"
          :recommendedItems="recommendedItems.categories"
          :search-query="searchQuery"
          @update:search-query="searchQuery = $event"
          @add-recommendation-to-plan="addRecommendationToPlan"
          @handle-drag-start="handleDragStart"
          @handle-drag-over="handleDragOver"
          @handle-drop="handleDrop"
          @handle-drag-end="handleDragEnd"
          @update-activity="updateActivity"
          @delete-activity="deleteActivity"
          @add-activity-to-day="addActivityToDay"
          @add-day="addDay"
          @delete-day="deleteDay"
          @add-activity="addActivity"
          @generate-ai="generateAITripPlan"
          :is-generating="isGenerating"
          @view-activity-details="showActivityDetails"
          @search="searchRecommendations"
          @select-recommendation="showRecommendationDetails"
        />

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
          <button
            @click="goBack"
            type="button"
            class="w-full sm:w-auto px-6 py-2 rounded-full text-sm font-medium text-gray-700 bg-gray-100 hover:bg-white transition-all duration-300 shadow-inner"
          >
            Back
          </button>

          <button
            @click="saveTripPlan"
            type="button"
            class="w-full sm:w-auto px-6 py-2 rounded-full text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 shadow-md transition-all duration-300"
          >
            Save Trip Plan
          </button>

          <button
            @click="viewSummary"
            type="button"
            class="w-full sm:w-auto px-6 py-2 rounded-full text-sm font-medium text-white bg-black/80 hover:bg-black transition-all duration-300"
          >
            View Summary
          </button>
        </div>
      </div>
    </div>

    <!-- Recommendation Modal -->
    <Transition name="fade-scale">
      <div v-if="selectedRecommendation" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" @click.self="selectedRecommendation = null">
        <div class="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full m-4 animate-fade-in">
          <img :src="selectedRecommendation.image" alt="Recommendation Image" class="w-full h-64 object-cover rounded-lg mb-4" />
          <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ selectedRecommendation.name }}</h2>
          <p class="text-gray-700 mt-2 whitespace-pre-wrap">{{ selectedRecommendation.description }}</p>
          <div class="flex justify-end mt-6">
            <button @click="selectedRecommendation = null" class="px-5 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Close</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Activity Modal -->
    <Transition name="fade-scale">
      <div v-if="selectedActivity" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" @click.self="selectedActivity = null">
        <div class="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full m-4 animate-fade-in">
          <img v-if="selectedActivity.image" :src="selectedActivity.image" alt="Activity Image" class="w-full h-64 object-cover rounded-lg mb-4" />
          <h2 class="text-3xl font-bold text-gray-900 mb-2">{{ selectedActivity.name }}</h2>
          <p class="text-gray-600 mb-4"><span class="font-semibold">Location:</span> {{ selectedActivity.location }}</p>
          <textarea v-model="selectedActivity.description" class="w-full p-2 border rounded mt-4 h-32"></textarea>
          <div class="flex justify-end mt-6">
            <button @click="selectedActivity = null" class="px-5 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Close</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>

<script setup lang="ts">
import TripPlanner from '@/components/TripPlanner.vue';
import BudgetCard from '@/components/BudgetCard.vue';
import { defineProps, defineEmits, computed, ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTripStore } from '@/stores/trip';
import axios from 'axios';
import { useAiTrip } from '@/composables/useAiTrip';
import { useDragAndDrop } from '@/composables/useDragAndDrop';
import { getMockData, mockScheduleData } from '@/composables/mockData';

interface RecommendationItem {
  id: number;
  image: string;
  name: string;
  description: string;
}
interface TripActivity {
  id: number;
  image: string;
  name: string;
  time: string;
  cost: number;
  location?: string;
  description?: string;
}
interface TripDay {
  id: number;
  dayNumber: number;
  name: string | null;
  activities: TripActivity[];
}

const selectedRecommendation = ref<RecommendationItem | null>(null);
const selectedActivity = ref<TripActivity | null>(null);
const searchQuery = ref('');
const errorMessage = ref('');
const isMockData = ref(false);

const router = useRouter();
const tripStore = useTripStore();
const { isGenerating, generateAITripPlan, searchPois, isMockData: isAiMockData, errorMessage: aiErrorMessage } = useAiTrip();
const { handleDragStart, handleDragOver, handleDrop, handleDragEnd } = useDragAndDrop(computed(() => tripStore.tripDays));

const props = defineProps({
  tripDays: {
    type: Array as () => TripDay[],
    required: true,
    default: () => [],
  },
});

const tripDays = computed({
  get: () => tripStore.tripDays,
  set: (days) => tripStore.setTripDays(days),
});

const recommendedItems = computed(() => tripStore.recommendedItems);

const plannedExpenses = computed(() => tripStore.plannedExpenses);

// Watch for mock data changes
watch(() => isAiMockData.value, (newVal) => {
  isMockData.value = newVal;
});

watch(() => aiErrorMessage.value, (newVal) => {
  if (newVal) {
    errorMessage.value = newVal;
  }
});

const updateActivity = (payload: { dayId: number; activityId: number; updatedData: any }) => {
  const day = tripDays.value.find((d: TripDay) => d.id === payload.dayId);
  if (day) {
    const activity = day.activities.find((a: TripActivity) => a.id === payload.activityId);
    if (activity) {
      Object.assign(activity, payload.updatedData);
      tripStore.setTripDays(tripDays.value);
    }
  }
};

const addActivity = (activity: TripActivity) => {
  if (tripDays.value.length > 0) {
    tripDays.value[0].activities.push(activity);
    tripStore.setTripDays(tripDays.value);
  }
};

const addRecommendationToPlan = (recommendation: RecommendationItem) => {
  if (tripDays.value.length > 0) {
    const newActivity: TripActivity = {
      id: Date.now(),
      name: recommendation.name,
      time: '12:00',
      cost: 0,
      image: recommendation.image,
      location: 'TBD',
      description: recommendation.description
    };
    
    tripDays.value[0].activities.push(newActivity);
    tripStore.setTripDays(tripDays.value);
  }
};

const addActivityToDay = (dayId: number) => {
  const day = tripDays.value.find((d: TripDay) => d.id === dayId);
  if (day) {
    day.activities.push({
      id: Date.now(),
      name: 'New Activity',
      time: '12:00',
      cost: 0,
      image: '',
      location: 'TBD',
      description: 'No description yet.'
    });
    tripStore.setTripDays(tripDays.value);
  }
};

const deleteActivity = (payload: { dayId: number; activityId: number }) => {
  const day = tripDays.value.find((d: TripDay) => d.id === payload.dayId);
  if (day) {
    day.activities = day.activities.filter((a: TripActivity) => a.id !== payload.activityId);
    tripStore.setTripDays(tripDays.value);
  }
};

const addDay = () => {
  const newDay: TripDay = {
    id: Date.now(),
    dayNumber: tripDays.value.length + 1,
    name: `Day ${tripDays.value.length + 1}`,
    activities: [],
  };
  tripDays.value.push(newDay);
  tripStore.setTripDays(tripDays.value);
};

const deleteDay = (dayId: number) => {
  tripDays.value = tripDays.value.filter((day: TripDay) => day.id !== dayId);
  tripStore.setTripDays(tripDays.value);
};

watch(tripDays, (newTripDays) => {
  const planCost = (newTripDays || []).reduce((total, day) => {
    return total + (day.activities || []).reduce((dayTotal: number, activity: TripActivity) => dayTotal + (activity.cost || 0), 0);
  }, 0);
  tripStore.setPlanCost(planCost);
}, { deep: true });

const showRecommendationDetails = (recommendation: RecommendationItem) => {
  selectedRecommendation.value = recommendation;
};

const searchRecommendations = (query: string) => {
  // Call searchPois even with shorter queries to provide more responsive suggestions
  if (query.length > 0) {
    searchPois(query);
  }
};

const showActivityDetails = (activity: TripActivity) => {
  selectedActivity.value = activity;
};

const saveTripPlan = async () => {
  errorMessage.value = '';
  isMockData.value = false;
  
  try {
    await axios.post(`http://localhost:3002/api/trips/${tripStore.tripId}/schedule`, {
      schedule: tripStore.tripDays,
    });
    alert('Schedule saved successfully!');
  } catch (error: any) {
    console.error('Error saving schedule:', error);
    
    // Set error message
    errorMessage.value = error.response?.data?.message || 'Failed to save schedule. Please try again.';
    
    // Save to localStorage as fallback
    localStorage.setItem(`trip-${tripStore.tripId}-schedule`, JSON.stringify(tripStore.tripDays));
    alert('Failed to save schedule to server. Your schedule has been saved locally.');
  }
};

const viewSummary = () => {
  const tripId = router.currentRoute.value.params.tripId;
  router.push({ name: 'summary', params: { tripId: tripId } });
};

const goBack = () => {
  router.back();
};

const loadMockScheduleIfNeeded = async () => {
  if (tripDays.value.length === 0) {
    try {
      // Try to load from server first
      const response = await axios.get(`http://localhost:3002/api/trips/${tripStore.tripId}/schedule`);
      if (response.data && response.data.length > 0) {
        tripStore.setTripDays(response.data.map((day: any) => ({
          ...day,
          id: day.id || Date.now() + Math.floor(Math.random() * 1000),
          dayNumber: day.day,
          name: day.day_name || `Day ${day.day}`,
          activities: Array.isArray(day.activities) ? day.activities : []
        })));
      } else {
        // If no data, generate with AI
        await generateAITripPlan(true);
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
      errorMessage.value = 'Failed to load schedule from server. Using mock data instead.';
      isMockData.value = true;
      
      try {
        // Try to load from localStorage first
        const localSchedule = localStorage.getItem(`trip-${tripStore.tripId}-schedule`);
        if (localSchedule) {
          tripStore.setTripDays(JSON.parse(localSchedule));
        } else {
          // Use mock data as last resort
          const mockResponse = await axios.get(`http://localhost:3002/api/trips/${tripStore.tripId}/schedule/mock`);
          if (mockResponse.data && mockResponse.data.mockSchedule) {
            tripStore.setTripDays(mockResponse.data.mockSchedule.map((day: any) => ({
              ...day,
              id: day.id || Date.now() + Math.floor(Math.random() * 1000),
              dayNumber: day.day,
              name: day.day_name || `Day ${day.day}`,
              activities: Array.isArray(day.activities) ? day.activities : []
            })));
          } else {
            // If server mock fails, use local mock data
            const scheduleData = mockScheduleData;
            if (scheduleData && scheduleData.schedule) {
              const updatedTripDays = scheduleData.schedule.map((day: any) => ({
                id: Date.now() + Math.floor(Math.random() * 1000),
                dayNumber: day.day,
                name: `Day ${day.day}`,
                activities: day.activities.map((activity: any) => ({
                  id: Date.now() + Math.floor(Math.random() * 1000),
                  ...activity
                }))
              }));
              tripStore.setTripDays(updatedTripDays);
            }
          }
        }
      } catch (mockError) {
        console.error('Error loading mock schedule:', mockError);
        // Generate empty schedule as last resort
        const emptySchedule = [
          {
            id: Date.now(),
            dayNumber: 1,
            name: 'Day 1',
            activities: []
          }
        ];
        tripStore.setTripDays(emptySchedule);
      }
    }
  }
};

onMounted(async () => {
  // Clear any previous return flags to ensure normal navigation flow
  localStorage.removeItem('returnToSummaryMyTrip');
  localStorage.removeItem('summaryTripId');
  
  // Load schedule data
  await loadMockScheduleIfNeeded();
  
  // Load recommendations if needed
  if (!recommendedItems.value.categories || recommendedItems.value.categories.length === 0) {
    generateAITripPlan(false);
  }
});
</script>
