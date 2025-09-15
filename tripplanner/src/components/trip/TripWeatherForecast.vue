<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">Weather Forecast</h2>
    <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <div v-if="weatherData.length > 0">
        <!-- Weather summary section -->
        <div class="mb-6 bg-gradient-to-r from-blue-50 to-secondary1 rounded-lg p-4 shadow-sm border border-blue-100">
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
            class="bg-white rounded-lg shadow-md p-4 text-center transition-shadow"
          >
            <p class="font-semibold text-secondary2">{{ formatWeatherDate(day.date) }}</p>
            <div class="my-3 flex justify-center">
              <img
                :src="`https://openweathermap.org/img/wn/${day.icon}@2x.png`"
                :alt="day.description"
                class="w-16 h-16"
              />
            </div>
            <p class="text-2xl font-bold text-gray-800">{{ Math.round(day.temp) }}°C</p>
            <p class="text-gray-700 capitalize font-medium" :class="{'text-orange-600': day.isPlaceholder}">{{ day.description }}</p>
            <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div class="bg-blue-50 p-2 rounded">
                <p class="text-secondary2">Humidity</p>
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
        <button @click="fetchWeatherForecast" class="mt-6 px-4 py-2 bg-secondary2 text-white rounded-lg transition-colors shadow-md">
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
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['add-to-packing', 'data-updated']);

const weatherData = ref<any[]>([]);
const weatherApiKey = '491dbb279c20fd8140c2f9442a8d3e29'; // OpenWeather API key

// Format date for weather display
const formatWeatherDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  return `${day} ${month}`;
};

// Generate a weather summary based on the forecast data
const getWeatherSummary = () => {
  if (!weatherData.value || weatherData.value.length === 0) return '';

  // Check if this is placeholder data
  const hasPlaceholderData = weatherData.value.some(day => day.isPlaceholder);
  const realDataDays = weatherData.value.filter(day => !day.isPlaceholder);

  if (hasPlaceholderData && realDataDays.length === 0) {
    return `Weather forecast for your trip dates is not yet available. The forecast will be updated closer to your travel dates.`;
  }

  // Use only real data for calculations
  const dataToUse = realDataDays.length > 0 ? realDataDays : weatherData.value;

  // Calculate average temperature
  const avgTemp = dataToUse.reduce((sum, day) => sum + day.temp, 0) / dataToUse.length;

  // Check for rain
  const rainDays = dataToUse.filter(day =>
    day.description.toLowerCase().includes('rain') ||
    day.description.toLowerCase().includes('shower')
  ).length;

  // Check for high humidity
  const highHumidityDays = dataToUse.filter(day => day.humidity > 70).length;

  // Generate summary
  let summary = `The average temperature will be around ${Math.round(avgTemp)}°C. `;

  if (rainDays > 0) {
    const rainPercentage = (rainDays / dataToUse.length) * 100;
    summary += `There's a ${Math.round(rainPercentage)}% chance of rain during your trip. `;
  } else {
    summary += `No rain is expected during your stay. `;
  }

  if (highHumidityDays > dataToUse.length / 2) {
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

  if (hasPlaceholderData) {
    summary += ` Some forecasts are not yet available and will be updated closer to your travel dates.`;
  }

  return summary;
};


// Fetch weather forecast
const fetchWeatherForecast = async () => {
  if (!props.destination || !props.startDate || !props.endDate) return;

  try {
    // Get coordinates for the destination
    const geoResponse = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(props.destination)}&limit=1&appid=${weatherApiKey}`);

    if (geoResponse.data.length > 0) {
      const { lat, lon } = geoResponse.data[0];

      // Use trip dates from props - handle ISO format with timezone
      let startDate, endDate;

      try {
        if (props.startDate.includes('T')) {
          // Already in ISO format with time
          startDate = new Date(props.startDate);
        } else {
          // Date only format
          startDate = new Date(props.startDate + 'T00:00:00');
        }

        if (props.endDate.includes('T')) {
          // Already in ISO format with time
          endDate = new Date(props.endDate);
        } else {
          // Date only format
          endDate = new Date(props.endDate + 'T23:59:59');
        }
      } catch (error) {
        console.error('Error parsing trip dates:', error);
        // Fallback to current date if parsing fails
        startDate = new Date();
        endDate = new Date();
      }

      console.log('Trip dates:', {
        start: props.startDate,
        end: props.endDate,
        parsedStart: startDate,
        parsedEnd: endDate
      });

      // Get forecast data
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${weatherApiKey}`
      );

      // Always create trip date range first
      const tripDays: any[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const localDateStr = currentDate.getFullYear() + '-' +
          (currentDate.getMonth() + 1).toString().padStart(2, '0') + '-' +
          currentDate.getDate().toString().padStart(2, '0') + ' 12:00:00';
        tripDays.push({
          date: localDateStr,
          temp: 25, // Default temperature
          humidity: 60, // Default humidity
          wind: 5, // Default wind speed
          description: 'Forecast not available yet',
          icon: '01d', // Default sunny icon
          isPlaceholder: true
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Try to match API data to trip dates
      forecastResponse.data.list.forEach((item: any) => {
        const itemDate = new Date(item.dt * 1000);
        const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());

        // Find matching trip day by comparing dates
        const matchingTripDay = tripDays.find(day => {
          const tripDate = new Date(day.date.split(' ')[0]); // Extract date part
          const tripDateOnly = new Date(tripDate.getFullYear(), tripDate.getMonth(), tripDate.getDate());
          return itemDateOnly.getTime() === tripDateOnly.getTime();
        });

        if (matchingTripDay) {
          // Update with real API data
          matchingTripDay.temp = item.main.temp;
          matchingTripDay.humidity = item.main.humidity;
          matchingTripDay.wind = item.wind.speed;
          matchingTripDay.description = item.weather[0].description;
          matchingTripDay.icon = item.weather[0].icon;
          matchingTripDay.isPlaceholder = false;
        }
      });

      console.log('Trip weather data created:', tripDays.length, 'days');
      weatherData.value = tripDays;

      // Emit data-updated event for PDF generation
      emit('data-updated', tripDays);
    }
  } catch (error) {
    console.error('Error fetching weather:', error);
  }
};

onMounted(async () => {
  fetchWeatherForecast();
});
</script>