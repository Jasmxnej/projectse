<template>
  <div class="grid grid-cols-1 gap-6">
    <!-- Loading placeholder -->
    <template v-if="isLoading">
      <div class="text-center text-gray-500 py-10">Loading hotels...</div>
    </template>

    <!-- Hotel cards -->
    <template v-else-if="hotels.length > 0">
      <div
        v-for="hotel in hotels"
        :key="hotel.id"
        class="bg-white border rounded-2xl shadow-sm p-4 flex flex-col md:flex-row items-start gap-6 hover:shadow-lg transition"
        :class="{ 'selected-hotel': selectedHotel && selectedHotel.id === hotel.id }"
      >
        <!-- Image with Unsplash fallback -->
        <div class="relative w-full md:w-48 h-36 flex-shrink-0">
          <img
            :src="hotel.image || getFallbackImage(hotel.name)"
            alt="Hotel Image"
            class="w-full h-full object-cover rounded-xl border"
            @error="handleImageError($event, hotel.name)"
          />
        </div>

        <!-- Hotel info center -->
        <div class="flex-1 space-y-1">
          <h4 class="text-lg font-bold text-gray-900">{{ hotel.name }}</h4>
          <p class="text-sm text-gray-500 flex items-center gap-1">
           {{ hotel.location || 'Location not available' }}
          </p>
          <p class="text-sm text-gray-600">{{ hotel.description || 'No description available.' }}</p>

          <div class="flex items-center gap-1 text-sm mt-1">
            <span v-if="hotel.rating" class="text-yellow-500">★</span>
            <span v-if="hotel.rating">{{ hotel.rating }}</span>
            <span v-else class="text-gray-400">No rating</span>
          </div>
        </div>

        <!-- Price + buttons right -->
        <div class="flex flex-col items-end justify-between w-full md:w-40 text-right mt-4 md:mt-0">
          <div>
            <div class="text-teal-600 text-xl font-bold">
              {{ hotel.price ? formatPrice(hotel.price) : 'No rate yet' }}
            </div>
            <p class="text-xs text-gray-500">per night</p>
            <p class="text-sm text-black font-medium mt-1">
              Total: {{ formatPrice(getTotalPrice(hotel)) }}
            </p>
            <p class="text-xs text-gray-400 mt-1">
              {{ formatDate(hotel.checkInDate) }} → {{ formatDate(hotel.checkOutDate) }}
            </p>
          </div>
          <div class="flex flex-col gap-2 mt-3 w-full">
            <button
              @click="selectHotel(hotel)"
              class="border border-teal-500 text-teal-600 px-4 py-1.5 text-sm rounded-lg hover:bg-teal-50 transition"
            >
              Select Hotel
            </button>
            <button
              @click="showDetails(hotel)"
              class="bg-gray-100 text-gray-800 px-4 py-1.5 text-sm rounded-lg hover:bg-gray-200 transition"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </template>

  
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import type { Hotel } from '../../types/hotel';

const props = defineProps({
  hotels: {
    type: Array as () => Hotel[],
    required: true,
  },
  selectedHotel: {
    type: Object as () => Hotel | null,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['select-hotel', 'show-details']);

const selectHotel = (hotel: Hotel) => {
  emit('select-hotel', hotel);
};

const showDetails = (hotel: Hotel) => {
  emit('show-details', hotel);
};

const formatPrice = (price: number) => {
  if (!price) return 'N/A';
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
  }).format(price);
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const getTotalPrice = (hotel: Hotel) => {
  const checkIn = new Date(hotel.checkInDate);
  const checkOut = new Date(hotel.checkOutDate);
  const diff = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24);
  const nights = diff > 0 ? diff : 1;
  return hotel.price * nights;
};

const getFallbackImage = (name: string) => {
  const keyword = name?.split(' ')[0] || 'hotel';
  return `https://source.unsplash.com/640x360/?${keyword},resort`;
};

const handleImageError = (event: Event, hotelName: string) => {
  const imgElement = event.target as HTMLImageElement;
  imgElement.src = getFallbackImage(hotelName);
};
</script>

<style scoped>
.selected-hotel {
  box-shadow: 0 0 15px rgba(56, 189, 248, 0.5);
}
</style>
