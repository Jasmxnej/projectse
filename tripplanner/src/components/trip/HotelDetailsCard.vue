<template>
  <div class="editable-item">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold text-gray-800">Hotel Details</h2>
      <button
        v-if="editable"
        @click="$emit('edit')"
        class="px-3 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm edit-button"
      >
        Edit Hotel
      </button>
    </div>
    <div v-if="hotel" class="space-y-4">
      <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div class="flex flex-col md:flex-row">
          <div class="md:w-1/3 mb-4 md:mb-0 md:mr-6">
            <img
              :src="getImageUrl(hotel)"
              :alt="hotel.name || 'Hotel'"
              class="w-full h-48 object-cover rounded-lg shadow-md"
              @error="handleImageError"
            />
          </div>
          <div class="md:w-2/3">
            <h3 class="text-xl font-bold text-gray-800 mb-2">{{ hotel.name || 'Hotel Name Not Available' }}</h3>
            <p class="text-gray-600 mb-2">{{ hotel.location || hotel.cityCode || hotel.city_code || 'Location Not Available' }}</p>
            <div class="flex items-center mb-2">
              <div class="flex text-yellow-400">
                <span v-for="i in Math.floor(hotel.rating || 0)" :key="i">★</span>
                <span v-for="i in (5 - Math.floor(hotel.rating || 0))" :key="i + 5" class="text-gray-300">★</span>
              </div>
              <span class="ml-2 text-gray-600">{{ hotel.rating }} / 5</span>
            </div>
            <p class="text-gray-700 mb-4">{{ hotel.description || 'No description available' }}</p>
            <div class="flex justify-between items-center">
              <div>
                <p class="text-sm text-gray-500">Check-in</p>
                <p class="font-medium">{{ formatDate(hotel.check_in_date || hotel.checkInDate) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Check-out</p>
                <p class="font-medium">{{ formatDate(hotel.check_out_date || hotel.checkOutDate) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Price</p>
                <p class="text-xl font-bold text-teal-600">{{ formatPrice(hotel.price) }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Additional Hotel Details -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Room Details -->
          <div v-if="hotel.room_type || hotel.room_description || hotel.room_beds || hotel.number_of_adults || (hotel.room && Object.keys(hotel.room).length > 0)" class="bg-gray-100 p-4 rounded-lg">
            <h4 class="font-semibold text-gray-800 mb-2">Room Details</h4>
            <div class="space-y-2">
              <p v-if="hotel.room_type"><strong>Type:</strong> {{ hotel.room_type }}</p>
              <p v-if="hotel.room_beds"><strong>Beds:</strong> {{ hotel.room_beds }} {{ hotel.room_bed_type || '' }}</p>
              <p v-if="hotel.room_description" class="text-sm text-gray-700">{{ hotel.room_description }}</p>
              <p v-if="hotel.number_of_adults"><strong>Guests:</strong> {{ hotel.number_of_adults }} adults</p>
              
              <!-- Room details from room object if available -->
              <template v-if="hotel.room && typeof hotel.room === 'object'">
                <p v-if="hotel.room.type && !hotel.room_type"><strong>Type:</strong> {{ hotel.room.type }}</p>
                <p v-if="hotel.room.beds && !hotel.room_beds"><strong>Beds:</strong> {{ hotel.room.beds }} {{ hotel.room.bedType || '' }}</p>
                <p v-if="hotel.room.description && !hotel.room_description" class="text-sm text-gray-700">{{ hotel.room.description }}</p>
              </template>
            </div>
          </div>
          
          <!-- Policies & Contact -->
          <div v-if="hotel.cancellation_policy || hotel.contact_phone || hotel.contact_email || hotel.payment_methods || (hotel.policies && Object.keys(hotel.policies).length > 0)" class="bg-gray-100 p-4 rounded-lg">
            <h4 class="font-semibold text-gray-800 mb-2">Policies & Contact</h4>
            <div class="space-y-2">
              <p v-if="hotel.cancellation_policy" class="text-sm"><strong>Cancellation:</strong> {{ hotel.cancellation_policy }}</p>
              <p v-if="hotel.contact_phone"><strong>Phone:</strong> {{ hotel.contact_phone }}</p>
              <p v-if="hotel.contact_email"><strong>Email:</strong> {{ hotel.contact_email }}</p>
              <p v-if="hotel.payment_methods" class="text-sm"><strong>Payment:</strong> {{ Array.isArray(hotel.payment_methods) ? hotel.payment_methods.join(', ') : hotel.payment_methods }}</p>
              
              <!-- Policy details from policies object if available -->
              <template v-if="hotel.policies && typeof hotel.policies === 'object'">
                <p v-if="hotel.policies.cancellation && hotel.policies.cancellation.description && !hotel.cancellation_policy" class="text-sm">
                  <strong>Cancellation:</strong> {{ hotel.policies.cancellation.description.text || hotel.policies.cancellation.description }}
                </p>
              </template>
            </div>
          </div>
          
          <!-- Additional Database Fields -->
          <div v-if="hotel.currency || hotel.city_code || hotel.stops !== undefined" class="bg-gray-100 p-4 rounded-lg">
            <h4 class="font-semibold text-gray-800 mb-2">Additional Details</h4>
            <div class="space-y-2">
              <p v-if="hotel.currency"><strong>Currency:</strong> {{ hotel.currency }}</p>
              <p v-if="hotel.city_code"><strong>City Code:</strong> {{ hotel.city_code }}</p>
              <p v-if="hotel.stops !== undefined"><strong>Stops:</strong> {{ hotel.stops }}</p>
            </div>
          </div>
        </div>
        
        <!-- Amenities -->
        <div v-if="hotel.amenities && hotel.amenities.length" class="mt-6">
          <h4 class="font-semibold text-gray-800 mb-2">Amenities</h4>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="amenity in hotel.amenities"
              :key="amenity"
              class="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
            >
              {{ amenity }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
      <p>No hotel selected for this trip.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  hotel: {
    type: Object,
    default: null
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

defineEmits(['edit']);

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatPrice = (price: number) => {
  if (price === null || price === undefined) return 'N/A';
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 }).format(price);
};

// Function to get the correct image URL using Unsplash API
const getImageUrl = (hotel: any) => {
  if (!hotel) return '';
  
  // Check if image_url exists and is a valid URL
  if (hotel.image_url) {
    // If it's a full URL (starts with http:// or https://)
    if (hotel.image_url.startsWith('http://') || hotel.image_url.startsWith('https://')) {
      return hotel.image_url;
    }
    
    // If it's a relative URL, make it absolute
    if (hotel.image_url.startsWith('/')) {
      return `${window.location.origin}${hotel.image_url}`;
    }
    
    // If it's just a filename, assume it's in the public folder
    return `${window.location.origin}/${hotel.image_url}`;
  }
  
  // If image exists (legacy field)
  if (hotel.image) {
    // If it's a full URL
    if (hotel.image.startsWith('http://') || hotel.image.startsWith('https://')) {
      return hotel.image;
    }
    
    // If it's a relative URL, make it absolute
    if (hotel.image.startsWith('/')) {
      return `${window.location.origin}${hotel.image}`;
    }
    
    // If it's just a filename, assume it's in the public folder
    return `${window.location.origin}/${hotel.image}`;
  }
  
  // Try to fetch from Unsplash API or use fallback
  const searchTerm = hotel.name || hotel.location || hotel.cityCode || hotel.city_code || props.destination || 'hotel';
  const destination = props.destination || 'destination';
  
  // Use a more reliable image URL - try to fetch from Unsplash API if possible
  // For now, use a more reliable Unsplash URL format
  return `https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=640&h=360&q=80`;
};

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  if (target) {
    // Extract the hotel name from the alt attribute or use a default
    const hotelName = target.alt || 'hotel';
    const destination = props.destination || 'resort';
    
    // Use a more specific query to get better images
    target.src = `https://source.unsplash.com/640x360/?${destination.toLowerCase()},hotel`;
    
    // Add error handler to fallback to a generic image if the specific one fails
    target.onerror = () => {
      target.src = 'https://source.unsplash.com/640x360/?hotel,resort';
      // Remove the error handler to prevent infinite loop
      target.onerror = null;
    };
  }
};
</script>