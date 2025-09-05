<template>
  <div class="bg-white rounded-lg shadow-md p-4 mt-4">
    <h3 class="text-xl font-semibold text-gray-800 mb-3">Power Plug Information</h3>
    <div v-if="isLoading" class="text-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-2"></div>
      <p class="text-gray-500">Loading plug information...</p>
    </div>
    <div v-else-if="plugInfo" class="space-y-4">
      <div class="flex items-center">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100 w-full">
          <h4 class="font-medium text-blue-800 mb-3">Travel Adapter for {{ destination }}</h4>
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="flex flex-wrap gap-2">
                <span v-for="(type, index) in plugInfo.types" :key="index"
                      class="inline-flex items-center px-2 py-1 bg-white rounded-md border border-gray-200 text-sm font-semibold text-teal-700">
                  Type {{ type }}
                </span>
              </div>
              <div class="text-sm text-gray-600 font-medium">
                <span class="inline-block">⚡ {{ plugInfo.voltage }}, {{ plugInfo.frequency }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex justify-between items-center">
      
      </div>
    </div>
    <div v-else class="text-center py-4 text-gray-500">
      <p>No plug information available for this destination.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

const props = defineProps({
  destination: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['add-to-packing']);

const isLoading = ref(false);
const plugInfo = ref<any>(null);

// Map of countries to their plug types
const plugTypeMap: Record<string, any> = {
  'Thailand': {
    types: ['A', 'B', 'C', 'O'],
    voltage: '220V',
    frequency: '50Hz',
    description: 'Thailand primarily uses Type O (three round pins in a triangular pattern), but Type A, B, and C are also commonly found in hotels and tourist areas. Most modern electronics can handle the 220V system, but check your devices before traveling.'
  },
  'Japan': {
    types: ['A', 'B'],
    voltage: '100V',
    frequency: '50/60Hz',
    description: 'Japan uses Type A (two flat pins) and Type B (two flat pins with a grounding pin) plugs. The voltage is lower than many other countries at 100V, which may affect some appliances.'
  },
  'United States': {
    types: ['A', 'B'],
    voltage: '120V',
    frequency: '60Hz',
    description: 'The US uses Type A (two flat pins) and Type B (two flat pins with a grounding pin) plugs with 120V power supply.'
  },
  'United Kingdom': {
    types: ['G'],
    voltage: '230V',
    frequency: '50Hz',
    description: 'The UK uses Type G plugs (three rectangular pins in a triangular pattern) with a 230V power supply.'
  },
  'European Union': {
    types: ['C', 'E', 'F'],
    voltage: '230V',
    frequency: '50Hz',
    description: 'Most EU countries use Type C (two round pins) and Type F (two round pins with grounding clips) plugs with a 230V power supply.'
  },
  'Australia': {
    types: ['I'],
    voltage: '230V',
    frequency: '50Hz',
    description: 'Australia uses Type I plugs (two flat pins in a V shape, with a grounding pin) with a 230V power supply.'
  },
  'China': {
    types: ['A', 'C', 'I'],
    voltage: '220V',
    frequency: '50Hz',
    description: 'China uses a mix of Type A, Type C, and Type I plugs with a 220V power supply.'
  },
  'Singapore': {
    types: ['G', 'M'],
    voltage: '230V',
    frequency: '50Hz',
    description: 'Singapore primarily uses Type G (British 3-pin) plugs with a 230V power supply.'
  },
  'Malaysia': {
    types: ['G', 'M'],
    voltage: '240V',
    frequency: '50Hz',
    description: 'Malaysia uses Type G (British 3-pin) plugs with a 240V power supply.'
  },
  'Vietnam': {
    types: ['A', 'C', 'D', 'G'],
    voltage: '220V',
    frequency: '50Hz',
    description: 'Vietnam uses a mix of Type A, C, D and G plugs with a 220V power supply. Hotels often have multiple socket types available.'
  },
  'Indonesia': {
    types: ['C', 'F'],
    voltage: '230V',
    frequency: '50Hz',
    description: 'Indonesia primarily uses Type C and F plugs (European style) with a 230V power supply.'
  },
  'Philippines': {
    types: ['A', 'B', 'C'],
    voltage: '220V',
    frequency: '60Hz',
    description: 'The Philippines uses Type A, B, and C plugs with a 220V power supply at 60Hz frequency.'
  },
  'South Korea': {
    types: ['C', 'F'],
    voltage: '220V',
    frequency: '60Hz',
    description: 'South Korea primarily uses Type C and F plugs (European style) with a 220V power supply at 60Hz frequency.'
  },
  'India': {
    types: ['C', 'D', 'M'],
    voltage: '230V',
    frequency: '50Hz',
    description: 'India uses Type C, D, and M plugs with a 230V power supply.'
  }
};

// Default plug info for unknown destinations
const defaultPlugInfo = {
  types: ['Various'],
  voltage: '110-240V',
  frequency: '50/60Hz',
  description: 'We couldn\'t find specific plug information for this destination. We recommend bringing a universal travel adapter that can handle different plug types and voltage ranges.'
};

// Function to get plug information for a destination
const getPlugInfo = async (destination: string) => {
  isLoading.value = true;
  
  try {
    // Try to match the destination with known countries
    const country = findMatchingCountry(destination);
    
    if (country && plugTypeMap[country]) {
      plugInfo.value = plugTypeMap[country];
    } else {
      // If no direct match, try to get information from an AI service
      try {
        const response = await axios.post('http://localhost:3002/api/gemini/generate', {
          prompt: {
            contents: [{
              parts: [{
                text: `What power plug types, voltage, and frequency are used in ${destination}? 
                Provide the information in this JSON format:
                {
                  "types": ["A", "B"], // Array of plug type letters
                  "voltage": "220V",
                  "frequency": "50Hz",
                  "description": "Brief description of the power plug situation in this location"
                }`
              }]
            }]
          },
          apiKey: import.meta.env.VITE_GEMINI_API_KEY,
        });
        
        if (response.data) {
          try {
            // Try to parse the response as JSON
            if (typeof response.data === 'object' && response.data.types) {
              plugInfo.value = response.data;
            } else if (response.data.text) {
              // Extract JSON from text response
              const jsonMatch = response.data.text.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsedData = JSON.parse(jsonMatch[0]);
                plugInfo.value = parsedData;
              } else {
                plugInfo.value = defaultPlugInfo;
              }
            } else {
              plugInfo.value = defaultPlugInfo;
            }
          } catch (parseError) {
            console.error('Error parsing plug info:', parseError);
            plugInfo.value = defaultPlugInfo;
          }
        } else {
          plugInfo.value = defaultPlugInfo;
        }
      } catch (aiError) {
        console.error('Error getting plug info from AI:', aiError);
        plugInfo.value = defaultPlugInfo;
      }
    }
  } catch (error) {
    console.error('Error getting plug information:', error);
    plugInfo.value = defaultPlugInfo;
  } finally {
    isLoading.value = false;
  }
};

// Function to find a matching country from our map
const findMatchingCountry = (destination: string): string | null => {
  // Normalize the destination string
  const normalizedDestination = destination.toLowerCase().trim();
  
  // Direct country name match
  for (const country of Object.keys(plugTypeMap)) {
    if (normalizedDestination.includes(country.toLowerCase())) {
      return country;
    }
  }
  
  // City to country mapping for common destinations
  const cityToCountry: Record<string, string> = {
    'bangkok': 'Thailand',
    'chiang mai': 'Thailand',
    'phuket': 'Thailand',
    'pattaya': 'Thailand',
    'tokyo': 'Japan',
    'osaka': 'Japan',
    'kyoto': 'Japan',
    'new york': 'United States',
    'los angeles': 'United States',
    'san francisco': 'United States',
    'london': 'United Kingdom',
    'manchester': 'United Kingdom',
    'paris': 'European Union',
    'berlin': 'European Union',
    'rome': 'European Union',
    'madrid': 'European Union',
    'amsterdam': 'European Union',
    'sydney': 'Australia',
    'melbourne': 'Australia',
    'beijing': 'China',
    'shanghai': 'China',
    'singapore': 'Singapore',
    'kuala lumpur': 'Malaysia',
    'hanoi': 'Vietnam',
    'ho chi minh': 'Vietnam',
    'bali': 'Indonesia',
    'jakarta': 'Indonesia',
    'manila': 'Philippines',
    'seoul': 'South Korea',
    'busan': 'South Korea',
    'mumbai': 'India',
    'delhi': 'India',
    'bkk': 'Thailand',
    'cnx': 'Thailand',
    'hkt': 'Thailand'
  };
  
  for (const [city, country] of Object.entries(cityToCountry)) {
    if (normalizedDestination.includes(city.toLowerCase())) {
      return country;
    }
  }
  
  // Airport code to country mapping
  const airportToCountry: Record<string, string> = {
    'bkk': 'Thailand', // Bangkok
    'dmk': 'Thailand', // Bangkok Don Mueang
    'cnx': 'Thailand', // Chiang Mai
    'hkt': 'Thailand', // Phuket
    'nrt': 'Japan',    // Tokyo Narita
    'hnd': 'Japan',    // Tokyo Haneda
    'jfk': 'United States', // New York
    'lax': 'United States', // Los Angeles
    'lhr': 'United Kingdom', // London Heathrow
    'cdg': 'European Union', // Paris
    'fra': 'European Union', // Frankfurt
    'syd': 'Australia', // Sydney
    'pek': 'China',     // Beijing
    'sin': 'Singapore', // Singapore
    'kul': 'Malaysia',  // Kuala Lumpur
    'han': 'Vietnam',   // Hanoi
    'sgn': 'Vietnam',   // Ho Chi Minh
    'dps': 'Indonesia', // Bali
    'mnl': 'Philippines', // Manila
    'icn': 'South Korea', // Seoul
    'bom': 'India',     // Mumbai
    'del': 'India'      // Delhi
  };
  
  for (const [code, country] of Object.entries(airportToCountry)) {
    if (normalizedDestination.includes(code.toLowerCase())) {
      return country;
    }
  }
  
  return null;
};

// Function to add adapter to packing list
const addToPackingList = (item: string) => {
  emit('add-to-packing', item);
};

// Watch for changes to destination
watch(() => props.destination, (newDestination) => {
  if (newDestination) {
    getPlugInfo(newDestination);
  }
}, { immediate: true });

// Get plug information when component is mounted
onMounted(() => {
  if (props.destination) {
    getPlugInfo(props.destination);
  }
});

// Expose the getPlugInfo method for external use
defineExpose({
  getPlugInfo
});
</script>