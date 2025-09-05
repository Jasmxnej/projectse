<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">Weather Forecast</h2>
    <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <div v-if="weatherData.length > 0">
        <!-- Weather summary section -->
        <div class="mb-6 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-4 shadow-sm border border-blue-100">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Weather Summary for {{ destination }}</h3>
          <p class="text-gray-700">
            {{ getWeatherSummary() }}
          </p>
        </div>
        
        <!-- Daily forecast cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div
            v-for="(day, index) in weatherData"
            :key="index"
            class="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow"
          >
            <p class="font-semibold text-blue-800">{{ formatWeatherDate(day.date) }}</p>
            <div class="my-3 flex justify-center">
              <img
                :src="`https://openweathermap.org/img/wn/${day.icon}@2x.png`"
                :alt="day.description"
                class="w-16 h-16"
              />
            </div>
            <p class="text-2xl font-bold text-gray-800">{{ Math.round(day.temp) }}°C</p>
            <p class="text-gray-700 capitalize font-medium">{{ day.description }}</p>
            <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div class="bg-blue-50 p-2 rounded">
                <p class="text-blue-800">Humidity</p>
                <p class="font-medium">{{ day.humidity }}%</p>
              </div>
              <div class="bg-teal-50 p-2 rounded">
                <p class="text-teal-800">Wind</p>
                <p class="font-medium">{{ day.wind }} km/h</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-8">
        <p class="text-gray-500">Loading weather forecast...</p>
        <div class="mt-4 flex justify-center space-x-2 animate-pulse">
          <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
        </div>
        <button @click="fetchWeatherForecast" class="mt-6 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-md">
          Refresh Weather
        </button>
      </div>
      
      <!-- Weather-based packing suggestions -->
      <WeatherPackingTips
        :weather-data="weatherData"
        :destination="destination"
        @add-to-packing="$emit('add-to-packing', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import WeatherPackingTips from '@/components/WeatherPackingTips.vue';

const props = defineProps({
  destination: {
    type: String,
    required: true
  },
  tripId: {
    type: String,
    required: true
  }
});

defineEmits(['add-to-packing']);

const weatherData = ref<any[]>([]);
const weatherApiKey = '491dbb279c20fd8140c2f9442a8d3e29'; // OpenWeather API key
const tripData = ref<any>(null);

// Format date for weather display
const formatWeatherDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

// Generate a weather summary based on the forecast data
const getWeatherSummary = () => {
  if (!weatherData.value || weatherData.value.length === 0) return '';
  
  // Calculate average temperature
  const avgTemp = weatherData.value.reduce((sum, day) => sum + day.temp, 0) / weatherData.value.length;
  
  // Check for rain
  const rainDays = weatherData.value.filter(day =>
    day.description.toLowerCase().includes('rain') ||
    day.description.toLowerCase().includes('shower')
  ).length;
  
  // Check for high humidity
  const highHumidityDays = weatherData.value.filter(day => day.humidity > 70).length;
  
  // Generate summary
  let summary = `The average temperature will be around ${Math.round(avgTemp)}°C. `;
  
  if (rainDays > 0) {
    const rainPercentage = (rainDays / weatherData.value.length) * 100;
    summary += `There's a ${Math.round(rainPercentage)}% chance of rain during your trip. `;
  } else {
    summary += `No rain is expected during your stay. `;
  }
  
  if (highHumidityDays > weatherData.value.length / 2) {
    summary += `Humidity levels will be high, so dress accordingly. `;
  }
  
  // Add temperature-based advice
  if (avgTemp > 30) {
    summary += `It will be quite hot, so stay hydrated and protect yourself from the sun.`;
  } else if (avgTemp > 20) {
    summary += `The weather will be warm and pleasant for outdoor activities.`;
  } else if (avgTemp > 10) {
    summary += `Temperatures will be mild, consider bringing a light jacket for evenings.`;
  } else {
    summary += `It will be cool, so pack warm clothing layers.`;
  }
  
  return summary;
};

// Fetch trip details
const fetchTripDetails = async () => {
  if (!props.tripId) return;

  try {
    const response = await axios.get(`http://localhost:3002/api/trips/by-id/${props.tripId}`);
    tripData.value = response.data;
  } catch (error) {
    console.error('Error fetching trip details:', error);
  }
};

// Fetch weather forecast
const fetchWeatherForecast = async () => {
  if (!props.destination || !tripData.value) return;

  try {
    // Get coordinates for the destination
    const geoResponse = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(props.destination)}&limit=1&appid=${weatherApiKey}`);

    if (geoResponse.data.length > 0) {
      const { lat, lon } = geoResponse.data[0];

      // Use trip dates instead of current date
      const startDate = new Date(tripData.value.start_date);
      const endDate = new Date(tripData.value.end_date);

      // Get forecast for the trip period
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${weatherApiKey}`
      );

      // Process forecast data for trip dates only
      const processedData: any[] = [];
      const uniqueDays = new Set();

      forecastResponse.data.list.forEach((item: any) => {
        const itemDate = new Date(item.dt * 1000);
        const dateString = itemDate.toDateString();

        // Only include dates within the trip period
        if (itemDate >= startDate && itemDate <= endDate && !uniqueDays.has(dateString)) {
          uniqueDays.add(dateString);
          processedData.push({
            date: item.dt_txt,
            temp: item.main.temp,
            humidity: item.main.humidity,
            wind: item.wind.speed,
            description: item.weather[0].description,
            icon: item.weather[0].icon
          });
        }
      });

      weatherData.value = processedData;
    }
  } catch (error) {
    console.error('Error fetching weather:', error);
  }
};

onMounted(async () => {
  await fetchTripDetails();
  fetchWeatherForecast();
});
</script>