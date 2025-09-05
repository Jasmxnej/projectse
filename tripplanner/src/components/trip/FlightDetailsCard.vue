<template>
  <div class="editable-item">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold text-gray-800">Flight Details</h2>
      <button
        v-if="editable"
        @click="$emit('edit')"
        class="px-3 py-1 bg-teal-600 text-white rounded-lg transition-colors text-sm edit-button"
      >
        Edit Flight
      </button>
    </div>
    <div v-if="flights && flights.length > 0" class="space-y-4">
      <div v-for="(flight, index) in flights" :key="flight.id || index" class="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div class="flex flex-col md:flex-row justify-between mb-4">
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <p class="text-xl font-bold text-gray-800">{{ flight.airline || 'Airline not specified' }}</p>
              <span v-if="flights.length > 1" class="text-sm bg-teal-100 text-teal-800 px-2 py-1 rounded-full">
                Leg {{ flight.leg_number || (index + 1) }}
              </span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-lg font-medium">{{ flight.from_city || flight.fromCity || 'Departure City' }}</span>
              <span class="text-sm text-gray-500">({{ flight.from_iata || flight.fromIata || '---' }})</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              <span class="text-lg font-medium">{{ flight.to_city || flight.toCity || 'Arrival City' }}</span>
              <span class="text-sm text-gray-500">({{ flight.to_iata || flight.toIata || '---' }})</span>
            </div>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-teal-600">{{ formatPrice(flight.price || (flight.price && flight.price.total ? flight.price.total : 0)) }}</p>
            <p class="text-sm text-gray-500">{{ flight.travel_class || flight.travelClass || 'ECONOMY' }} Class</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p class="text-sm text-gray-500">Departure Date</p>
            <p class="text-lg font-medium">{{ formatDate(flight.departure_date || (flight.itineraries && flight.itineraries[0]?.segments[0]?.departure?.at)) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Departure Time</p>
            <p class="text-lg font-medium">{{ formatTime(flight.departure_time || (flight.itineraries && flight.itineraries[0]?.segments[0]?.departure?.at)) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Arrival Date</p>
            <p class="text-lg font-medium">{{ formatDate(flight.arrival_date || (flight.itineraries && flight.itineraries[0]?.segments[flight.itineraries[0]?.segments.length - 1]?.arrival?.at)) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Arrival Time</p>
            <p class="text-lg font-medium">{{ formatTime(flight.arrival_time || (flight.itineraries && flight.itineraries[0]?.segments[flight.itineraries[0]?.segments.length - 1]?.arrival?.at)) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Duration</p>
            <p class="text-lg font-medium">{{ formatDuration(flight.duration || (flight.itineraries && flight.itineraries[0]?.duration)) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Stops</p>
            <p class="text-lg font-medium">{{ flight.stops !== undefined ? `${flight.stops} ${flight.stops === 1 ? 'stop' : 'stops'}` : (flight.itineraries && flight.itineraries[0]?.segments ? `${flight.itineraries[0].segments.length - 1} ${flight.itineraries[0].segments.length - 1 === 1 ? 'stop' : 'stops'}` : 'N/A') }}</p>
          </div>

          <!-- Additional flight details from database -->
          <div v-if="flight.flight_number">
            <p class="text-sm text-gray-500">Flight Number</p>
            <p class="text-lg font-medium">{{ flight.flight_number }}</p>
          </div>
          <div v-if="flight.currency">
            <p class="text-sm text-gray-500">Currency</p>
            <p class="text-lg font-medium">{{ flight.currency }}</p>
          </div>
          <div v-if="flight.traveler_type">
            <p class="text-sm text-gray-500">Traveler Type</p>
            <p class="text-lg font-medium">{{ flight.traveler_type }}</p>
          </div>
          <div v-if="flight.fare_class">
            <p class="text-sm text-gray-500">Fare Class</p>
            <p class="text-lg font-medium">{{ flight.fare_class }}</p>
          </div>
          <div v-if="flight.baggage_quantity !== undefined && flight.baggage_quantity > 0">
            <p class="text-sm text-gray-500">Baggage</p>
            <p class="text-lg font-medium">{{ flight.baggage_quantity }} {{ flight.bag_weight ? `(${flight.bag_weight} ${flight.bag_weight_unit || 'kg'})` : 'piece(s)' }}</p>
          </div>
          <div v-if="flight.aircraft_code">
            <p class="text-sm text-gray-500">Aircraft</p>
            <p class="text-lg font-medium">{{ flight.aircraft_code }}</p>
          </div>
          <div v-if="flight.fare_basis">
            <p class="text-sm text-gray-500">Fare Basis</p>
            <p class="text-lg font-medium">{{ flight.fare_basis }}</p>
          </div>
        </div>
      </div>

      <!-- Total summary for multiple flights -->
      <div v-if="flights.length > 1" class="bg-teal-50 rounded-xl p-4 border border-teal-200">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-lg font-semibold text-teal-800">Total Flights: {{ flights.length }}</p>
            <p class="text-sm text-teal-600">Flight Type: {{ getFlightTypeLabel(flights[0]?.flight_type) }}</p>
          </div>
          <div class="text-right">
            <p class="text-xl font-bold text-teal-800">{{ formatPrice(getTotalFlightPrice()) }}</p>
            <p class="text-sm text-teal-600">Total Price</p>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
      <p>No flight selected for this trip.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  flights: {
    type: Array,
    default: () => []
  },
  editable: {
    type: Boolean,
    default: true
  }
});

defineEmits(['edit']);

// Helper function to get flight type label
const getFlightTypeLabel = (flightType: string): string => {
  switch (flightType) {
    case 'one-way':
      return 'One Way';
    case 'round-trip':
      return 'Round Trip';
    case 'multi-city':
    case 'multi-trip':
      return 'Multi City';
    default:
      return 'Flight';
  }
};

// Helper function to calculate total flight price
const getTotalFlightPrice = (): number => {
  if (!props.flights || props.flights.length === 0) return 0;
  return props.flights.reduce((total: number, flight: any) => {
    let price = 0;
    if (typeof flight.price === 'number') {
      price = flight.price;
    } else if (typeof flight.price === 'string') {
      price = parseFloat(flight.price) || 0;
    } else if (flight.price && typeof flight.price === 'object') {
      if (flight.price.total) {
        price = parseFloat(flight.price.total) || 0;
      } else if (flight.price.grandTotal) {
        price = parseFloat(flight.price.grandTotal) || 0;
      } else if (flight.price.base) {
        price = parseFloat(flight.price.base) || 0;
      }
    }
    return total + price;
  }, 0);
};

const formatPrice = (price: number) => {
  if (price === null || price === undefined) return 'N/A';
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 }).format(price);
};

const formatDate = (dateString: string | undefined | null) => {
  if (!dateString) return 'N/A';

  try {
    let date;

    // Handle different date formats
    if (typeof dateString === 'number') {
      // If it's a timestamp
      date = new Date(dateString);
    } else if (typeof dateString === 'string') {
      // Try different string formats
      if (dateString.includes('T')) {
        // ISO format with time
        date = new Date(dateString);
      } else if (dateString.includes(' ')) {
        // Format like "2025-09-15 14:30:00"
        date = new Date(dateString.split(' ')[0]); // Take only the date part
      } else if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Date only format
        date = new Date(dateString);
      } else {
        // Try parsing as-is
        date = new Date(dateString);
      }
    } else {
      return 'Invalid Date';
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Invalid Date';
  }
};

const formatTime = (dateString: string | undefined | null) => {
  if (!dateString) return 'N/A';

  try {
    let date;

    // Handle different date formats
    if (typeof dateString === 'number') {
      // If it's a timestamp
      date = new Date(dateString);
    } else if (typeof dateString === 'string') {
      // Try different string formats
      if (dateString.includes('T')) {
        // ISO format with time
        date = new Date(dateString);
      } else if (dateString.includes(' ')) {
        // Format like "2025-09-15 14:30:00"
        date = new Date(dateString.replace(' ', 'T'));
      } else if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Date only format, assume noon
        date = new Date(dateString + 'T12:00:00');
      } else if (dateString.match(/^\d{2}:\d{2}:\d{2}$/)) {
        // HH:MM:SS format from old saves
        const [h, m] = dateString.split(':');
        return `${h}:${m}`;
      } else {
        // Try parsing as-is
        date = new Date(dateString);
      }
    } else {
      return 'Invalid Time';
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Time';
    }

    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting time:', dateString, error);
    return 'Invalid Time';
  }
};

const formatDateTime = (dateString: string | undefined | null) => {
  if (!dateString) return 'N/A';

  try {
    let date;

    // Handle different date formats
    if (typeof dateString === 'number') {
      // If it's a timestamp
      date = new Date(dateString);
    } else if (typeof dateString === 'string') {
      // Try different string formats
      if (dateString.includes('T')) {
        // ISO format with time
        date = new Date(dateString);
      } else if (dateString.includes(' ')) {
        // Format like "2025-09-15 14:30:00"
        date = new Date(dateString.replace(' ', 'T'));
      } else if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Date only format, assume noon
        date = new Date(dateString + 'T12:00:00');
      } else {
        // Try parsing as-is
        date = new Date(dateString);
      }
    } else {
      return 'Invalid Date';
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
</script>