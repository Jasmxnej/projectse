<template>
  <div class="editable-item">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold text-gray-800">Daily Schedule</h2>
      <button
        v-if="editable"
        @click="$emit('edit')"
        class="px-3 py-1 bg-teal-600 text-white rounded-lg transition-colors text-sm edit-button"
      >
        Edit Schedule
      </button>
    </div>
    <div v-if="schedule && schedule.length > 0" class="space-y-6">
      <div v-for="day in schedule" :key="day.id" class="bg-gray-50 rounded-xl shadow p-4">
        <h3 class="text-xl font-bold text-teal-700 mb-4">Day {{ day.day }}</h3>
        
        <div v-if="day.activities && day.activities.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="activity in parseActivities(day.activities)"
            :key="activity.id"
            class="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <img
              :src="getImageUrl(activity)"
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
              <p v-if="activity.description" class="text-gray-700 text-sm mt-2 mb-3">
                {{ truncateDescription(activity.description) }}
              </p>
              <div class="flex justify-between items-center">
                <p v-if="activity.cost" class="font-semibold text-teal-600">{{ formatPrice(activity.cost) }}</p>
                <div class="flex gap-2">
                  <button
                    @click.stop="showActivityDetails(activity)"
                    class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    title="View more details"
                  >
                    More Details
                  </button>
                  <button
                    v-if="editable"
                    @click.stop="$emit('edit')"
                    class="px-3 py-1 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
                    title="Edit activity"
                  >
                    Edit
                  </button>
                </div>
              </div>
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
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface ScheduleDay {
  id: number | string;
  day: number;
  activities: any[] | string;
  [key: string]: any;
}

interface Activity {
  id: number | string;
  name: string;
  time: string;
  location?: string;
  description?: string;
  cost?: number;
  image?: string;
  [key: string]: any;
}

const props = defineProps({
  schedule: {
    type: Array as () => ScheduleDay[],
    default: () => []
  },
  editable: {
    type: Boolean,
    default: true
  },
  destination: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['edit', 'view-activity-details']);

// Function to show activity details
const showActivityDetails = (activity: Activity) => {
  emit('view-activity-details', activity);
};

// Function to truncate description text
const truncateDescription = (text: string | undefined): string => {
  if (!text) return '';
  return text.length > 100 ? text.substring(0, 100) : text;
};

const formatPrice = (price: number) => {
  if (price === null || price === undefined) return 'N/A';
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 }).format(price);
};

const parseActivities = (activities: any[] | string): Activity[] => {
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

// Function to get the correct image URL with better fallback
const getImageUrl = (activity: any) => {
  if (!activity) return getDefaultImage();
  
  // Check if image exists and is a valid URL
  if (activity.image) {
    // If it's a full URL (starts with http:// or https://)
    if (activity.image.startsWith('http://') || activity.image.startsWith('https://')) {
      return activity.image;
    }
    
    // If it's a relative URL, make it absolute
    if (activity.image.startsWith('/')) {
      return `${window.location.origin}${activity.image}`;
    }
    
    // If it's just a filename, assume it's in the public folder
    return `${window.location.origin}/${activity.image}`;
  }
  
  // If no image, try to fetch one from Unsplash API
  if (activity.name && props.destination) {
    fetchImageForActivity(activity);
  }
  
  // Return default image while loading
  return getDefaultImage();
};

// Function to get a default image based on activity type or destination
const getDefaultImage = () => {
  const defaultImages = [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=640&h=360&q=80', // Travel
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=640&h=360&q=80', // Nature
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=640&h=360&q=80', // Mountain
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=640&h=360&q=80', // Beach
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=640&h=360&q=80'  // City
  ];
  
  // Select a random default image
  return defaultImages[Math.floor(Math.random() * defaultImages.length)];
};

// Function to fetch image for activity from Unsplash API
const fetchImageForActivity = async (activity: any) => {
  if (activity.imageLoading) return; // Prevent multiple requests
  
  activity.imageLoading = true;
  
  try {
    const searchQuery = `${activity.name} ${props.destination}`;
    const response = await fetch(`http://localhost:3002/api/unsplash/image?place=${encodeURIComponent(searchQuery)}`);
    const data = await response.json();
    
    if (data.image) {
      activity.image = data.image;
      // Force re-render by updating the activity object
      activity.imageLoaded = true;
    }
  } catch (error) {
    console.error('Error fetching image for activity:', activity.name, error);
  } finally {
    activity.imageLoading = false;
  }
};

const handleActivityImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  if (target) {
    // Extract the activity name from the alt attribute or use a default
    const activityName = target.alt || 'activity';
    const destination = props.destination || 'travel';
    
    // Try to extract more context from parent elements
    const activityCard = target.closest('.border.border-gray-200');
    const activityTitle = activityCard?.querySelector('h4')?.textContent || activityName;
    const activityLocation = activityCard?.querySelector('p:nth-child(2)')?.textContent?.replace('📍', '') || '';
    
    // Build a more specific search query
    let searchQuery = destination.toLowerCase();
    if (activityTitle && activityTitle !== 'activity') {
      searchQuery += `,${activityTitle.toLowerCase().split(' ')[0]}`;
    }
    if (activityLocation) {
      searchQuery += `,${activityLocation.toLowerCase().split(' ')[0]}`;
    }
    
    // Use featured images for better quality
    target.src = `https://source.unsplash.com/featured/640x360/?${searchQuery}`;
    
    // Add error handler to fallback to a generic image if the specific one fails
    target.onerror = () => {
      // Try a more generic search with the destination
      target.src = `https://source.unsplash.com/featured/640x360/?${destination.toLowerCase()},tourism`;
      
      // Final fallback if that fails too
      target.onerror = () => {
        target.src = 'https://source.unsplash.com/featured/640x360/?travel,activity';
        // Remove the error handler to prevent infinite loop
        target.onerror = null;
      };
    };
  }
};
</script>