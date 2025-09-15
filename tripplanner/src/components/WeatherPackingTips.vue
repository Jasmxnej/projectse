<template>
  <div class="bg-white rounded-lg shadow-md p-4 mt-4">
    <h3 class="text-xl font-semibold text-gray-800 mb-3">Weather-Based Packing Suggestions</h3>
    <div v-if="packingTips.length > 0" class="space-y-6">
      <!-- Tips section with improved readability -->
      <div class="bg-secondary1 rounded-lg p-5 border border-blue-100">
        <h4 class="font-medium text-secondary2 mb-3 text-lg">Weather Tips</h4>
        <ul class="space-y-3">
          <li v-for="(tip, index) in packingTips" :key="index" class="flex items-start">
            <span class="text-secondary2 mr-3 mt-1 text-lg">•</span>
            <p class="text-gray-700 leading-relaxed">{{ tip }}</p>
          </li>
        </ul>
      </div>
      
      <!-- Essential items section -->
      <div class="bg-secondary1 rounded-lg p-5 border border-secondary1">
        <h4 class="font-medium text-secondary2 mb-3 text-lg">Essential Items</h4>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(item, index) in quickAddItems"
            :key="index"
            @click="addToPackingList(item)"
            class="px-4 py-2 bg-white border border-secondary1 text-secondary2 rounded-lg hover:bg-secondary1 transition-colors flex items-center shadow-sm"
          >
            <span class="mr-2 text-secondary2 font-bold">+</span> {{ item }}
          </button>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-8 text-gray-500">
      <p>Loading packing suggestions...</p>
      <div class="mt-4 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-3"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import axios from 'axios';

interface WeatherDay {
  temp: number;
  description: string;
  humidity: number;
  icon?: string;
  date?: string;
  wind?: number;
}

const props = defineProps({
  weatherData: {
    type: Array as () => WeatherDay[],
    required: true
  },
  destination: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['add-to-packing']);

const packingTips = ref<string[]>([]);
const quickAddItems = ref<string[]>([]);

// Generate packing tips based on weather data
const generatePackingTips = async () => {
  if (!props.weatherData || props.weatherData.length === 0) return;
  
  try {
    // Extract weather conditions
    const conditions = props.weatherData.map(day => ({
      temp: day.temp,
      description: day.description,
      humidity: day.humidity
    }));
    
    // Calculate average temperature
    const avgTemp = conditions.reduce((sum, day) => sum + day.temp, 0) / conditions.length;
    
    // Check for rain
    const hasRain = conditions.some(day => 
      day.description.toLowerCase().includes('rain') || 
      day.description.toLowerCase().includes('shower')
    );
    
    // Check for high humidity
    const highHumidity = conditions.some(day => day.humidity > 70);
    
    // Check for hot weather
    const isHot = avgTemp > 30;
    
    // Check for cold weather
    const isCold = avgTemp < 15;
    
    // Generate tips based on conditions
    const tips: string[] = [];
    const items: string[] = [];
    
    if (hasRain) {
      tips.push("Pack an umbrella or raincoat as rain is expected during your trip.");
      items.push("Umbrella", "Raincoat", "Waterproof shoes");
    }
    
    if (isHot) {
      tips.push("It will be hot! Pack light, breathable clothing and don't forget sunscreen and a hat.");
      items.push("Sunscreen", "Hat", "Sunglasses", "Light clothing");
    }
    
    if (isCold) {
      tips.push("Temperatures will be cool. Bring warm layers, a jacket, and possibly gloves.");
      items.push("Warm jacket", "Gloves", "Scarf", "Thermal underwear");
    }
    
    if (highHumidity) {
      tips.push("Humidity will be high. Pack moisture-wicking clothes and consider bringing anti-frizz hair products.");
      items.push("Moisture-wicking clothes", "Anti-frizz hair product");
    }
    
    // Add destination-specific weather-related tip if available
    if (props.destination) {
      try {
        const response = await axios.post('http://localhost:3002/api/gemini/generate', {
          prompt: {
            contents: [{
              parts: [{
                text: `What are 1-2 essential weather-related items travelers should pack specifically for the current weather in ${props.destination}? Focus ONLY on items related to weather conditions (temperature, rain, humidity, sun exposure, etc). Keep it brief and practical.`
              }]
            }]
          },
          apiKey: import.meta.env.VITE_GEMINI_API_KEY,
        });
        
        if (response.data && response.data.text) {
          tips.push(response.data.text);
          
          // Extract potential weather-related items from the response
          const text = response.data.text.toLowerCase();
          const weatherItems = [
            "umbrella", "raincoat", "waterproof", "sunscreen", "hat", "sunglasses",
            "light clothing", "warm jacket", "gloves", "scarf", "thermal",
            "moisture-wicking", "cooling", "breathable", "insect repellent"
          ];
          
          for (const item of weatherItems) {
            if (text.includes(item)) {
              const capitalizedItem = item.charAt(0).toUpperCase() + item.slice(1);
              if (!items.includes(capitalizedItem)) {
                items.push(capitalizedItem);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error getting destination-specific packing tips:', error);
      }
    }
    
    packingTips.value = tips;
    quickAddItems.value = [...new Set(items)]; // Remove duplicates
    
  } catch (error) {
    console.error('Error generating packing tips:', error);
    packingTips.value = [
      "Pack appropriate clothing for the weather conditions.",
      "Consider weather protection items based on the forecast."
    ];
    quickAddItems.value = ["Umbrella", "Sunscreen", "Light clothing", "Weather-appropriate shoes"];
  }
};

const addToPackingList = (item: string) => {
  emit('add-to-packing', item);
};

watch(() => props.weatherData, (newVal) => {
  if (newVal && newVal.length > 0) {
    generatePackingTips();
  }
}, { deep: true });

onMounted(() => {
  if (props.weatherData && props.weatherData.length > 0) {
    generatePackingTips();
  }
});
</script>