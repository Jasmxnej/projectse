<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="bg-white rounded-xl shadow-lg p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-800">Recommendations</h3>
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-500">{{ tripStore.destination }}</span>
          <span class="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded">{{ recommendedItems.length }} places</span>
        </div>
      </div>
      
      <!-- Search bar with improved UI -->
      <div class="relative mb-6">
        <div class="flex">
          <div class="relative flex-grow">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search for places to add to your plan"
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              @input="handleSearchInput"
            />
            <svg class="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            @click="clearSearch"
            class="px-4 py-3 bg-gray-100 text-gray-700 rounded-r-lg hover:bg-gray-200 transition-colors"
            :class="{ 'opacity-50 cursor-not-allowed': !searchQuery }"
            :disabled="!searchQuery"
          >
            Clear
          </button>
        </div>
        
        <!-- Search tips -->
        <div v-if="!searchQuery && !isSearchingPois" class="mt-2 text-xs text-gray-500">
          <p>Try searching for: attractions, restaurants, museums, parks, temples, markets</p>
        </div>
      </div>
      
      <!-- Search results -->
      <div v-if="searchQuery" class="mb-6">
        <h4 class="text-md font-semibold text-gray-700 mb-3 flex items-center">
          <span>Search Results</span>
          <span v-if="isSearchingPois" class="ml-2 inline-block h-4 w-4 rounded-full border-2 border-t-teal-600 animate-spin"></span>
        </h4>
        <RecommendationList
          :items="poiSuggestions"
          @add="addPoiToPlan"
          :is-loading="isSearchingPois"
          :search-query="searchQuery"
        />
      </div>
      
      <!-- Recommended places -->
      <div>
        <h4 class="text-md font-semibold text-gray-700 mb-3 flex items-center">
          <span>Recommended for you</span>
          <span v-if="isGenerating" class="ml-2 inline-block h-4 w-4 rounded-full border-2 border-t-teal-600 animate-spin"></span>
        </h4>
        <div v-if="recommendedItems.length === 0 && !isGenerating" class="text-center py-6 bg-gray-50 rounded-lg">
          <p class="text-gray-500">No recommendations available yet.</p>
          <p class="text-sm text-gray-400 mt-1">Try generating with AI or searching for places.</p>
        </div>
        <RecommendationList
          :items="recommendedItems"
          @add="addRecommendationToPlan"
          :is-loading="isGenerating"
          @select="$emit('select-recommendation', $event)"
        />
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-lg p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-800">Plan</h3>
        <button @click="$emit('generate-ai')" :disabled="isGenerating" class="bg-coral-500 text-white px-4 py-2 rounded-lg hover:bg-coral-600 disabled:opacity-50" style="background-color: #ff6b6b;">
          {{ isGenerating ? 'Generating...' : 'Generate AI' }}
        </button>
      </div>
      
      <div v-if="isGenerating" class="flex justify-center items-center p-10">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
      <div v-else-if="tripDays.length === 0" class="text-center text-gray-500 py-10">
        <p class="mb-4">Click "Generate AI" to create a plan.</p>
      </div>
      <div v-else>
        <DayPlanner
          v-for="day in tripDays"
          :key="day.id"
          :day="day"
          :editing-day-id="editingDayId"
          :editing-activity-id="editingActivityId"
          :dragging="dragging"
          :dragged-activity="draggedActivity"
          :destination="tripStore.destination"
          @start-editing="startEditing"
          @update:day-name="day.name = $event"
          @stop-editing="stopEditing"
          @delete-day="deleteDay"
          @drag-start="handleDragStart"
          @drag-over="handleDragOver"
          @drop="handleDrop"
          @view-activity-details="$emit('view-activity-details', $event)"
          @update-activity="$emit('update-activity', $event)"
          @start-editing-activity="startEditingActivity"
          @stop-editing-activity="stopEditingActivity"
          @delete-activity="$emit('delete-activity', $event)"
          @add-activity="addActivityToDay"
        />
      </div>

      <button
        @click="addDay"
        class="w-full mt-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center justify-center"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Day
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useTripStore } from '@/stores/trip';
import axios from 'axios';
import RecommendationList from './RecommendationList.vue';
import DayPlanner from './DayPlanner.vue';

interface Recommendation {
  id: number;
  image: string;
  name: string;
  description: string;
  location?: string;
  added?: boolean;
}

interface TripActivity {
  id: number;
  image: string;
  name: string;
  time: string;
  cost: number;
}

// Updated interface
interface TripDay {
  id: number;
  dayNumber: number;
  name: string | null;
  activities: TripActivity[];
}

const props = defineProps({
  tripDays: { type: Array as () => TripDay[], required: true },
  recommendedItems: { type: Array as () => Recommendation[], required: true },
  isGenerating: { type: Boolean, default: false },
});

const emit = defineEmits([
  'update:searchQuery',
  'add-recommendation-to-plan',
  'handle-drag-start',
  'handle-drag-over',
  'handle-drop',
  'handle-drag-end',
  'update-activity',
  'delete-activity',
  'add-activity-to-day',
  'add-day',
  'add-activity',
  'delete-day',
  'generate-ai',
  'view-activity-details',
  'search',
  'select-recommendation'
  ]);

const tripStore = useTripStore();
const searchQuery = ref('');
const editingDayId = ref<number | null>(null);
const editingActivityId = ref<number | null>(null);
const poiSuggestions = ref<any[]>([]);
const destinationCoords = ref<{ latitude: number, longitude: number } | null>(null);
const dragging = ref(false);
const draggedActivity = ref<{ dayId: number, index: number } | null>(null);
let debounceTimer: any;
const isSearchingPois = ref(false);

// Clear search function
const clearSearch = () => {
  searchQuery.value = '';
  poiSuggestions.value = [];
  emit('update:searchQuery', '');
};

const filteredRecommendations = computed(() => {
  if (!searchQuery.value) return props.recommendedItems;
  return props.recommendedItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const getDestinationCoords = async () => {
  if (tripStore.destination) {
    try {
      const response = await axios.get('http://localhost:3002/api/amadeus/cities', {
        params: { keyword: tripStore.destination, limit: 1 }
      });
      if (response.data.length > 0 && response.data[0].geoCode) {
        const location = response.data[0].geoCode;
        destinationCoords.value = {
          latitude: location.latitude,
          longitude: location.longitude
        };
      }
    } catch (error) {
      console.error('Error fetching destination coordinates:', error);
    }
  }
};

const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  searchQuery.value = target.value;
  emit('update:searchQuery', searchQuery.value);
  clearTimeout(debounceTimer);
  
  // Clear suggestions if search query is empty
  if (!searchQuery.value.trim()) {
    poiSuggestions.value = [];
    return;
  }
  
  // Show loading indicator immediately
  if (searchQuery.value.length > 0) {
    isSearchingPois.value = true;
  }
  
  debounceTimer = setTimeout(async () => {
    if (searchQuery.value.length > 0) {
      await searchPois(searchQuery.value);
      isSearchingPois.value = false;
    } else {
      poiSuggestions.value = [];
    }
  }, 200); // Further reduced debounce time for better responsiveness
};

const searchPois = async (query: string) => {
  try {
    // Use Gemini AI to generate search recommendations
    const promptText = `Generate 5 specific recommendations for places in ${tripStore.destination} that match the search term "${query}". For each place, provide a name, a detailed description (2-3 sentences), and leave the image field empty. Respond ONLY with valid JSON in the following format: {"recommendations": [{"name": "Place Name", "description": "Detailed description", "image": "", "category": "SIGHTS|SHOPPING|RESTAURANT|NIGHTLIFE"}]}. Do not add explanations or comments.`;
    
    const prompt = {
      contents: [{ parts: [{ text: promptText }] }]
    };
    
    const payload = {
      prompt,
      apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    };
    
    const response = await axios.post('http://localhost:3002/api/gemini/generate', payload);
    const generatedData = response.data;
    
    if (generatedData.recommendations && Array.isArray(generatedData.recommendations)) {
      // Process AI results and fetch images from Unsplash
      const recommendationsWithImages = await Promise.all(generatedData.recommendations.map(async (poi: any) => {
        try {
          // Fetch image from Unsplash API
          const imageResponse = await axios.get(`http://localhost:3002/api/unsplash/image?place=${encodeURIComponent(poi.name + ' ' + tripStore.destination)}`);
          return {
            id: Date.now() + Math.random(),
            name: poi.name,
            description: poi.description || 'Point of Interest',
            image: imageResponse.data.image || getCategoryIcon(poi.category),
            location: tripStore.destination,
            category: poi.category || 'ATTRACTION'
          };
        } catch (imageError) {
          console.error('Error fetching image for', poi.name, imageError);
          return {
            id: Date.now() + Math.random(),
            name: poi.name,
            description: poi.description || 'Point of Interest',
            image: getCategoryIcon(poi.category),
            location: tripStore.destination,
            category: poi.category || 'ATTRACTION'
          };
        }
      }));
      
      poiSuggestions.value = recommendationsWithImages;
    } else {
      // If no results from AI, show empty state
      poiSuggestions.value = [];
    }
    
  } catch (error) {
    console.error('Error generating AI search recommendations:', error);
    
    // Fallback to local results on error
    const filteredLocal = props.recommendedItems.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 5);
    
    if (filteredLocal.length > 0) {
      poiSuggestions.value = filteredLocal;
    } else {
      poiSuggestions.value = [];
    }
  }
};

const addPoiToPlan = (poi: any) => {
  const newActivity = {
    id: Date.now(),
    name: poi.name,
    image: poi.image || getCategoryIcon(poi.category),
    time: '10:00',
    cost: 0,
    description: poi.description || `A ${poi.category?.toLowerCase() || 'interesting'} place in ${tripStore.destination}`,
    location: poi.location || tripStore.destination
  };
  emit('add-activity', newActivity);
  
  // Keep the search results visible so user can add multiple items
  // Just show a success message or visual feedback instead
  const successIndex = poiSuggestions.value.findIndex(item => item.id === poi.id);
  if (successIndex !== -1) {
    poiSuggestions.value[successIndex].added = true;
  }
};

const addRecommendationToPlan = (item: Recommendation) => {
  const newActivity = {
    id: Date.now(),
    name: item.name,
    image: item.image,
    time: '10:00',
    cost: 0,
    description: item.description,
    location: item.location || tripStore.destination
  };
  emit('add-activity', newActivity);
  
  // Show visual feedback that item was added
  const successIndex = props.recommendedItems.findIndex(rec => rec.id === item.id);
  if (successIndex !== -1) {
    // Create a copy to avoid mutating props directly
    const updatedItems = [...props.recommendedItems];
    if (updatedItems[successIndex]) {
      updatedItems[successIndex] = { ...updatedItems[successIndex], added: true };
    }
  }
};

const handleDragStart = (payload: { event: DragEvent; dayId: number; index: number }) => {
  dragging.value = true;
  draggedActivity.value = { dayId: payload.dayId, index: payload.index };
  if (payload.event.dataTransfer) {
    payload.event.dataTransfer.effectAllowed = 'move';
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
};

const handleDrop = (payload: { event: DragEvent; dropDayId: number; dropIndex: number }) => {
  if (draggedActivity.value) {
    const { dayId: fromDayId, index: fromIndex } = draggedActivity.value;
    const toDayId = payload.dropDayId;
    const toIndex = payload.dropIndex;

    const fromDay = props.tripDays.find((d: TripDay) => d.id === fromDayId);
    const toDay = props.tripDays.find((d: TripDay) => d.id === toDayId);

    if (fromDay && toDay) {
      const [activity] = fromDay.activities.splice(fromIndex, 1);
      toDay.activities.splice(toIndex, 0, activity);
    }
  }
  dragging.value = false;
  draggedActivity.value = null;
};

const getCategoryIcon = (category: string) => {
  // Default to Unsplash images for better visuals
  if (!category) {
    return `https://source.unsplash.com/featured/300x200/?${tripStore.destination},attraction`;
  }
  
  const categoryMap: { [key: string]: string } = {
    'SIGHTS': `https://source.unsplash.com/featured/300x200/?${tripStore.destination},sightseeing`,
    'NIGHTLIFE': `https://source.unsplash.com/featured/300x200/?${tripStore.destination},nightlife`,
    'RESTAURANT': `https://source.unsplash.com/featured/300x200/?${tripStore.destination},restaurant`,
    'SHOPPING': `https://source.unsplash.com/featured/300x200/?${tripStore.destination},shopping`,
    'MUSEUM': `https://source.unsplash.com/featured/300x200/?${tripStore.destination},museum`,
    'PARK': `https://source.unsplash.com/featured/300x200/?${tripStore.destination},park`,
    'TEMPLE': `https://source.unsplash.com/featured/300x200/?${tripStore.destination},temple`,
    'BEACH': `https://source.unsplash.com/featured/300x200/?${tripStore.destination},beach`,
    'MARKET': `https://source.unsplash.com/featured/300x200/?${tripStore.destination},market`,
  };
  
  // Try to match category to known categories
  const normalizedCategory = category.toUpperCase();
  for (const key in categoryMap) {
    if (normalizedCategory.includes(key)) {
      return categoryMap[key];
    }
  }
  
  // If no match, use the category as a search term
  return `https://source.unsplash.com/featured/300x200/?${tripStore.destination},${category.toLowerCase()}`;
};

// Fetch trip data from database
const fetchTripData = async () => {
  try {
    const response = await axios.get(`http://localhost:3002/api/trips/by-id/${tripStore.tripId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching trip data:', error);
    return null;
  }
};

onMounted(() => {
  getDestinationCoords();
  // Only get initial recommendations for places, not activities
  // We don't auto-generate activities anymore, user must click the "Generate AI" button
  getInitialRecommendations();
});

// Get initial recommendations using Gemini AI with trip data from database
const getInitialRecommendations = async () => {
  try {
    // First fetch trip data from database
    const tripData = await fetchTripData();

    let activitiesText = 'general activities';
    let specialNeedsText = '';
    let otherActivityText = '';

    if (tripData) {
      // Parse activities if it's stored as JSON string
      let activities = tripData.activities || [];
      if (typeof activities === 'string') {
        try {
          activities = JSON.parse(activities);
        } catch (e) {
          activities = activities.split(',').map((item: string) => item.trim());
        }
      }

      if (Array.isArray(activities) && activities.length > 0) {
        activitiesText = activities.join(', ');
      }

      if (tripData.special_needs) {
        specialNeedsText = ` Special needs/requirements: ${tripData.special_needs}.`;
      }

      if (tripData.other_activity) {
        otherActivityText = ` Additional activity preferences: ${tripData.other_activity}.`;
      }
    }

    // Use Gemini AI to generate place recommendations with trip data
    const promptText = `Generate exactly 5 specific place recommendations for ${tripStore.destination} based on this trip profile:
    - Trip activities/interests: ${activitiesText}
    - Group size: ${tripData?.group_size || 'Not specified'}
    - Budget level: ${tripData?.budget ? `Approximately ${tripData.budget} THB total` : 'Not specified'}${specialNeedsText}${otherActivityText}

    IMPORTANT: You must provide exactly 5 recommendations with UNIQUE categories from these options: SIGHTS, SHOPPING, RESTAURANT, NIGHTLIFE, CULTURE. Each category can only be used once.

    For each place, provide:
    - name: The exact name of the place
    - description: A detailed 2-3 sentence description explaining what makes this place special and worth visiting, considering the trip preferences
    - category: One of SIGHTS, SHOPPING, RESTAURANT, NIGHTLIFE, or CULTURE (each category used exactly once)

    Respond ONLY with valid JSON in this exact format:
    {
      "recommendations": [
        {
          "name": "Place Name",
          "description": "Detailed description of the place and why visitors should go there based on trip preferences",
          "category": "SIGHTS"
        },
        {
          "name": "Place Name 2",
          "description": "Detailed description of the place and why visitors should go there based on trip preferences",
          "category": "SHOPPING"
        },
        {
          "name": "Place Name 3",
          "description": "Detailed description of the place and why visitors should go there based on trip preferences",
          "category": "RESTAURANT"
        },
        {
          "name": "Place Name 4",
          "description": "Detailed description of the place and why visitors should go there based on trip preferences",
          "category": "NIGHTLIFE"
        },
        {
          "name": "Place Name 5",
          "description": "Detailed description of the place and why visitors should go there based on trip preferences",
          "category": "CULTURE"
        }
      ]
    }

    Do not include any explanations, comments, or markdown formatting.`;

    const prompt = {
      contents: [{ parts: [{ text: promptText }] }]
    };

    const payload = {
      prompt,
      apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    };

    const response = await axios.post('http://localhost:3002/api/gemini/generate', payload);
    const generatedData = response.data;

    let recommendations = [];

    // Handle different response formats from Gemini
    if (generatedData.recommendations && Array.isArray(generatedData.recommendations)) {
      recommendations = generatedData.recommendations;
    } else if (generatedData.categories && Array.isArray(generatedData.categories) && generatedData.categories[0]?.items) {
      recommendations = generatedData.categories[0].items;
    } else if (generatedData.text) {
      // Try to parse JSON from text response
      try {
        const jsonMatch = generatedData.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.recommendations) {
            recommendations = parsed.recommendations;
          }
        }
      } catch (parseError) {
        console.error('Failed to parse Gemini text response:', parseError);
        throw new Error('Invalid Gemini response format');
      }
    } else {
      throw new Error('Invalid response format from Gemini AI');
    }

    if (recommendations.length === 0) {
      throw new Error('No recommendations received from Gemini');
    }

    // Process AI results and fetch images from Unsplash
    const itemsWithImages = await Promise.all(recommendations.slice(0, 5).map(async (item: any, index: number) => {
      try {
        // Add delay between image requests to avoid rate limiting
        if (index > 0) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Fetch image from Unsplash API
        const imageResponse = await axios.get(`http://localhost:3002/api/unsplash/image?place=${encodeURIComponent(item.name + ' ' + tripStore.destination)}`);
        return {
          id: Date.now() + Math.random() + index,
          name: item.name,
          description: item.description,
          image: imageResponse.data.image || getCategoryIcon(item.category),
          category: item.category || 'SIGHTS'
        };
      } catch (imageError) {
        console.error('Error fetching image for', item.name, imageError);
        return {
          id: Date.now() + Math.random() + index,
          name: item.name,
          description: item.description,
          image: getCategoryIcon(item.category),
          category: item.category || 'SIGHTS'
        };
      }
    }));

    // Set recommendations in store
    tripStore.setRecommendedItems({
      categories: [{
        name: "Recommended for you",
        items: itemsWithImages
      }],
      isMock: false
    });

  } catch (error) {
    console.error('Error fetching Gemini recommendations:', error);

    // Enhanced fallback recommendations based on destination
    const getDestinationSpecificPlaces = (destination: string) => {
      const dest = destination.toLowerCase();
      if (dest.includes('bangkok')) {
        return [
          { name: "MBK Center", description: "One of Bangkok's most popular shopping malls with 8 floors of shops, restaurants, and entertainment. Perfect for finding everything from electronics to fashion at great prices.", category: "SHOPPING" },
          { name: "Grand Palace", description: "Historic royal palace complex with stunning Thai architecture and the sacred Emerald Buddha temple. A must-visit cultural landmark showcasing Thailand's rich heritage.", category: "SIGHTS" },
          { name: "Chatuchak Weekend Market", description: "One of the world's largest weekend markets with over 15,000 stalls selling everything from vintage clothes to exotic pets. A shopper's paradise and cultural experience.", category: "SHOPPING" },
          { name: "Wat Arun (Temple of Dawn)", description: "Beautiful Buddhist temple on the Chao Phraya River with intricate porcelain decorations. Climb the steep steps for panoramic views of Bangkok.", category: "CULTURE" },
          { name: "Khao San Road", description: "Famous backpacker street with vibrant nightlife, street food, bars, and budget accommodations. The heart of Bangkok's backpacker scene and nightlife.", category: "NIGHTLIFE" }
        ];
      } else {
        return [
          { name: `${destination} Central Market`, description: `The main market in ${destination} where locals shop for fresh produce, handicrafts, and traditional goods. Experience authentic local culture and flavors.`, category: "SHOPPING" },
          { name: `${destination} Historic District`, description: `The old town area of ${destination} featuring traditional architecture, museums, and cultural sites. Perfect for learning about local history and heritage.`, category: "CULTURE" },
          { name: `${destination} Night Market`, description: `Evening market in ${destination} with street food, local crafts, and entertainment. Great place to experience local nightlife and cuisine.`, category: "NIGHTLIFE" },
          { name: `${destination} Temple Complex`, description: `Beautiful religious site in ${destination} showcasing local spiritual traditions and architecture. A peaceful place for reflection and cultural appreciation.`, category: "CULTURE" },
          { name: `${destination} Shopping Center`, description: `Modern shopping mall in ${destination} with international brands, restaurants, and entertainment facilities. Perfect for comfortable shopping and dining.`, category: "SHOPPING" }
        ];
      }
    };

    const mockPlaces = getDestinationSpecificPlaces(tripStore.destination);

    const mockRecommendations = await Promise.all(mockPlaces.map(async (place, index) => {
      try {
        // Add delay between requests
        if (index > 0) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }

        const imageResponse = await axios.get(`http://localhost:3002/api/unsplash/image?place=${encodeURIComponent(place.name + ' ' + tripStore.destination)}`);
        return {
          id: Date.now() + Math.random() + index,
          name: place.name,
          description: place.description,
          image: imageResponse.data.image || getCategoryIcon(place.category),
          category: place.category
        };
      } catch (imageError) {
        return {
          id: Date.now() + Math.random() + index,
          name: place.name,
          description: place.description,
          image: getCategoryIcon(place.category),
          category: place.category
        };
      }
    }));

    const result = {
      categories: [{
        name: "Recommended for you",
        items: mockRecommendations
      }],
      isMock: true
    };

    tripStore.setRecommendedItems(result);
  }
};

let recommendationDebounceTimer: any;
const getRecommendations = async () => {
  clearTimeout(recommendationDebounceTimer);
  recommendationDebounceTimer = setTimeout(async () => {
    const prompt = {
      contents: [{
        parts: [{
          text: `Based on the following user preferences for a trip to ${tripStore.destination}, suggest 3 activities. Preferences: ${tripStore.activities.join(', ')}. For each activity, provide a name, a short description, and a relevant image URL.`
        }]
      }]
    };
    try {
      const payload = {
        prompt,
        apiKey: import.meta.env.VITE_GEMINI_API_KEY,
      };
      console.log('Sending to backend:', payload);
      const response = await axios.post('http://localhost:3002/api/gemini/generate', payload);
      if (response.data && Array.isArray(response.data.recommendations)) {
        const recommendations: Recommendation[] = response.data.recommendations.map((r: any) => ({
          id: Date.now() + Math.random(),
          name: r.name,
          description: r.description,
          image: r.image,
        }));
        emit('add-recommendation-to-plan', recommendations);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        alert('You have exceeded the request limit. Please try again later.');
      } else {
        console.error('Error generating recommendations:', error);
      }
    }
  }, 500);
};

const startEditing = (dayId: number) => {
  editingDayId.value = dayId;
};

const stopEditing = () => {
  editingDayId.value = null;
};

const formatCurrency = (value: number) => {
  if (typeof value !== 'number') {
    return value;
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const startEditingActivity = (activityId: number) => {
  editingActivityId.value = activityId;
};

const stopEditingActivity = (dayId: number, activityId: number, updatedData: any) => {
  editingActivityId.value = null;
  emit('update-activity', { dayId, activityId, updatedData });
};
const addDay = () => {
  emit('add-day');
};

const deleteDay = (dayId: number) => {
  emit('delete-day', dayId);
};

const addActivityToDay = (dayId: number) => {
  emit('add-activity-to-day', dayId);
};

const deleteActivity = (dayId: number, activityId: number) => {
  emit('delete-activity', { dayId, activityId });
};
</script>
