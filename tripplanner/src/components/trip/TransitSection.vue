<template>
  <div class="space-y-6">
    <div v-if="loading && !pdfMode" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-secondary2"></div>
      <p class="mt-2 text-gray-600">Fetching transit directions...</p>
    </div>
    
    <div v-else-if="error && !pdfMode" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
      <p>{{ error }}</p>
      <p class="mt-2 text-sm">Using mock data or check API key.</p>
    </div>
    
    <div v-else class="space-y-6">
      <div 
        v-for="(dayRoutes, dayIndex) in pdfMode ? staticRoutes : transitRoutes" 
        :key="dayIndex" 
        class="bg-white rounded-xl shadow-sm p-4 border border-gray-200"
      >
        <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <span class="mr-2 h-4 w-4">
            <component :is="CalendarIcon" />
          </span>
          {{ pdfMode ? 'Suggested Travel' : 'Transit Routes' }} - Day {{ dayIndex + 1 }}
        </h3>
        
        <div v-if="dayRoutes.length > 0" class="space-y-4">
          <div 
            v-for="(route, routeIndex) in dayRoutes" 
            :key="routeIndex" 
            class="bg-gray-50 rounded p-3 border border-gray-200"
          >
            <div class="bg-white rounded-t p-3 border-b border-gray-200 mb-3">
              <h4 class="text-sm font-medium text-gray-800 flex items-center">
                <span class="mr-2 h-4 w-4">
                  <LocationMarkerIcon />
                </span>
                {{ route.from }} → {{ route.to }}
              </h4>
            </div>
            
            <table class="w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
              <thead class="bg-gray-50">
                <tr>
                  <th class="p-3 text-left font-medium text-sm text-gray-700">Mode</th>
                  <th class="p-3 text-center font-medium text-sm text-gray-700">Time</th>
                  <th class="p-3 text-center font-medium text-sm text-gray-700">Distance</th>
                  <th class="p-3 text-right font-medium text-sm text-gray-700">Price</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(option, optIndex) in route.options" :key="optIndex" class="border-t">
                  <td class="p-3">
                    <div class="flex items-center">
                      <span class="h-5 w-5 mr-2 flex-shrink-0">
                        <component :is="getModeIcon(option.mode)" />
                      </span>
                      <span class="font-medium text-sm">{{ getModeName(option.mode) }}</span>
                    </div>
                  </td>
                  <td class="p-3 text-center font-medium text-sm">{{ option.duration }}</td>
                  <td class="p-3 text-center font-medium text-sm">{{ option.distance }}</td>
                  <td class="p-3 text-right font-semibold text-green-600 text-sm">{{ option.estimatedPrice }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div v-else class="p-4 bg-gray-50 rounded border text-center">
          <p class="text-sm text-gray-600">
            Add multiple activities with names or locations for transit suggestions.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, h } from 'vue';

interface Activity {
  location?: string;
  name: string;
}

interface ScheduleDay {
  activities: Activity[];
}

interface ActivityInfo {
  name: string;
  address: string;
}

interface RouteOption {
  mode: 'walking' | 'driving' | 'transit' | 'motorbike';
  duration: string;
  distance: string;
  estimatedPrice: string;
}

interface TransitRoute {
  from: string;
  to: string;
  options: RouteOption[];
}

const props = defineProps<{
  schedule: ScheduleDay[];
  destination: string;
  editable?: boolean;
  pdfMode?: boolean;
}>();

const emit = defineEmits<{ edit: [] }>();

const loading = ref(true);
const error = ref<string | null>(null);
const transitRoutes = ref<TransitRoute[][]>([]);
const staticRoutes = ref<TransitRoute[][]>([]);

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
console.log('Google Maps API Key loaded:', apiKey ? 'Yes (hidden for security)' : 'No - using fallback data');

const dayActivities = computed(() => {
  return props.schedule.map(day => {
    const infos: ActivityInfo[] = [];
    if (day.activities) {
      day.activities.forEach(activity => {
        const name = activity.name.trim();
        const location = activity.location ? activity.location.trim() : '';
        if (name) {
          const addr = location ? `${location}, ${props.destination}` : `${name}, ${props.destination}`;
          infos.push({ name, address: addr });
        }
      });
    }
    return infos.filter(info => info.name);
  });
});

const UserIcon = () => h('svg', {
  class: 'h-5 w-5 text-gray-400',
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
}, [
  h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' })
]);

const CarIcon = () => h('svg', {
  class: 'h-5 w-5 text-gray-400',
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
}, [
  h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M12 10a8 8 0 018 8v4m-8-8a8 8 0 00-8 8v4m16-4H4m4 0h12m-4-4V4' })
]);

const BusIcon = () => h('svg', {
  class: 'h-5 w-5 text-gray-400',
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
}, [
  h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' })
]);

const ClockIcon = () => h('svg', {
  class: 'w-4 h-4 text-gray-400',
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
}, [
  h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' })
]);

const ArrowLongRightIcon = () => h('svg', {
  class: 'w-4 h-4 text-gray-400',
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
}, [
  h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M17 8l4 4m0 0l-4 4m4-4H3' })
]);

const CurrencyDollarIcon = () => h('svg', {
  class: 'w-4 h-4 text-gray-400',
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
}, [
  h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08 .402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
]);

const CalendarIcon = () => h('svg', {
  class: 'h-4 w-4 text-gray-400',
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
}, [
  h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' })
]);

const LocationMarkerIcon = () => h('svg', {
  class: 'h-4 w-4 text-gray-400',
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
}, [
  h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' }),
  h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M15 11a3 3 0 11-6 0 3 3 0 016 0z' })
]);

const getModeIcon = (mode: RouteOption['mode']) => {
  switch (mode) {
    case 'walking':
      return UserIcon;
    case 'driving':
      return CarIcon;
    case 'transit':
      return BusIcon;
    case 'motorbike':
      return CarIcon;
    default:
      return UserIcon;
  }
};

const getModeName = (mode: RouteOption['mode']): string => {
  switch (mode) {
    case 'walking':
      return 'Walk';
    case 'driving':
      return 'Grab/Taxi';
    case 'transit':
      return 'Public Transit (Bus/Train)';
    case 'motorbike':
      return 'Grab Bike';
    default:
      return 'Travel';
  }
};

const estimatePrice = (distText: string, rate: number): string => {
  const kmMatch = distText.match(/(\d+(?:\.\d+)?)/);
  const km = kmMatch ? parseFloat(kmMatch[1]) : 3; // Default 3km
  const thb = Math.max(20, Math.round(km * rate)); // Min 20 THB
  return `${thb} THB`;
};

const fetchDirections = async (origin: string, destination: string, mode: RouteOption['mode']): Promise<RouteOption> => {
  // Always provide fallback
  const fallbackDist = `${(2 + Math.random() * 6).toFixed(1)} km`; // Vary 2-8 km
  let fallbackDur: string, fallbackPrice: string;
  
  const minTime = mode === 'walking' ? 30 : mode === 'driving' ? 8 : mode === 'motorbike' ? 6 : 20;
  const maxTime = minTime + 20;
  fallbackDur = `${Math.round(minTime + Math.random() * (maxTime - minTime))} min`;
  
  switch (mode) {
    case 'walking':
      fallbackPrice = 'Free';
      break;
    case 'driving':
      fallbackPrice = estimatePrice(fallbackDist, 40);
      break;
    case 'transit':
      fallbackPrice = estimatePrice(fallbackDist, 15);
      break;
    case 'motorbike':
      fallbackPrice = estimatePrice(fallbackDist, 25);
      break;
    default:
      fallbackPrice = 'Estimate needed';
  }
  
  if (!apiKey) {
    console.log(`No API key - using fallback for ${mode} from ${origin} to ${destination}`);
    return { mode, duration: fallbackDur, distance: fallbackDist, estimatedPrice: fallbackPrice };
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode === 'motorbike' ? 'driving' : mode}&key=${apiKey}&region=th`;
    console.log(`Fetching ${mode} directions from ${origin} to ${destination} at URL:`, url.replace(apiKey, '[API_KEY]'));
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(`API Response for ${mode} from ${origin} to ${destination}:`, data);

    if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
      console.warn(`No ${mode} route found for ${origin} to ${destination}`);
      return { mode, duration: fallbackDur, distance: fallbackDist, estimatedPrice: fallbackPrice };
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    let price: string;
    if (mode === 'walking') {
      price = 'Free';
    } else if (mode === 'driving') {
      price = estimatePrice(leg.distance.text, 40);
    } else if (mode === 'motorbike') {
      price = estimatePrice(leg.distance.text, 25);
    } else { // transit
      price = route.fare ? route.fare.text.replace(/USD/g, 'THB').replace(/(\d+(?:\.\d+)?)/g, (match: string) => `${Math.round(parseFloat(match) * 35)}`) : estimatePrice(leg.distance.text, 15);
    }

    return {
      mode,
      duration: leg.duration.text,
      distance: leg.distance.text,
      estimatedPrice: price,
    };
  } catch (err) {
    console.error(`Detailed error fetching ${mode} directions from ${origin} to ${destination}:`, err);
    console.log(`Using fallback data for ${mode}:`, { duration: fallbackDur, distance: fallbackDist, estimatedPrice: fallbackPrice });
    return { mode, duration: fallbackDur, distance: fallbackDist, estimatedPrice: fallbackPrice };
  }
};

const loadTransitData = async () => {
  loading.value = true;
  error.value = null;

  try {
    transitRoutes.value = await Promise.all(
      dayActivities.value.map(async (infos) => {
        const dayRoutes: TransitRoute[] = [];
        if (infos.length >= 2) {
          for (let i = 0; i < infos.length - 1; i++) {
            const [walkOpt, driveOpt, transitOpt, bikeOpt] = await Promise.all([
              fetchDirections(infos[i].address, infos[i + 1].address, 'walking'),
              fetchDirections(infos[i].address, infos[i + 1].address, 'driving'),
              fetchDirections(infos[i].address, infos[i + 1].address, 'transit'),
              fetchDirections(infos[i].address, infos[i + 1].address, 'motorbike'),
            ]);
            const options: RouteOption[] = [walkOpt, driveOpt, transitOpt, bikeOpt];
            dayRoutes.push({ from: infos[i].name, to: infos[i + 1].name, options });
          }
        }
        return dayRoutes;
      })
    );

    console.log('Processed Transit Routes:', transitRoutes.value);

    if (props.pdfMode) {
      staticRoutes.value = transitRoutes.value;
    }
    
  } catch (err) {
    error.value = 'Failed to load transit. Check API key and locations.';
    console.error('Transit load error:', err);
    transitRoutes.value = [];
    staticRoutes.value = [];
  } finally {
    loading.value = false;
  }
};

watch(() => props.schedule, loadTransitData, { deep: true });
onMounted(loadTransitData);
</script>

<style scoped>

</style>