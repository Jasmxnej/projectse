<template>
  <div
    class="bg-white border rounded-2xl shadow-sm p-4 flex flex-col md:flex-row items-start gap-6 hover:shadow-lg transition"
  >
    <!-- Image with fallback -->
    <div class="relative w-full md:w-48 h-36 flex-shrink-0">
      <img
        :src="hotelImage"
        alt="Hotel"
        class="w-full h-full object-cover rounded-xl border"
        @error="handleImageError"
      />
      <div
        v-if="stayDuration > 0"
        class="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded"
      >
        {{ stayDuration }} night{{ stayDuration > 1 ? 's' : '' }}
      </div>
    </div>

    <!-- Center Content -->
    <div class="flex-1 space-y-1">
      <h2 class="text-lg font-bold text-gray-900">{{ selectedHotel?.name }}</h2>
      <p class="text-sm text-gray-500 flex items-center gap-1">
        📍 {{ selectedHotel?.location || 'Location not available' }}
      </p>
      <p class="text-sm text-gray-600">
        {{ selectedHotel?.description || 'No description available' }}
      </p>
    </div>

    <!-- Right Column -->
    <div class="flex flex-col items-end justify-between w-full md:w-40 mt-4 md:mt-0 text-right">
      <div>
        <div class="text-teal-600 text-xl font-bold">
          {{ formatPrice(getPerNightPrice(selectedHotel)) }}
        </div>
        <p class="text-sm text-gray-500">per night</p>
        <p class="text-sm text-black font-medium mt-1">Total: {{ formatPrice(selectedHotel?.price) }}</p>
      </div>
      <div class="flex flex-col items-end gap-2 mt-3">
        <button
          class="border border-teal-500 text-teal-600 px-4 py-1.5 text-sm rounded-lg hover:bg-teal-50 transition"
          @click="$emit('select', selectedHotel)"
        >
          Select
        </button>
        <button
          class="bg-gray-100 text-gray-800 px-4 py-1.5 text-sm rounded-lg hover:bg-gray-200 transition"
          @click="$emit('details', selectedHotel)"
        >
          View Details
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Hotel } from '@/types/hotel';

const props = defineProps<{
  selectedHotel: Hotel;
}>();

// 💡 Unsplash fallback
const hotelImage = computed(() => {
  const keywords = props.selectedHotel?.name?.split(' ')[0] || 'hotel';
  return props.selectedHotel?.image
    ? props.selectedHotel.image
    : `https://source.unsplash.com/640x360/?${keywords},resort`;
});

const handleImageError = (event: Event) => {
  const imgElement = event.target as HTMLImageElement;
  const keywords = props.selectedHotel?.name?.split(' ')[0] || 'hotel';
  imgElement.src = `https://source.unsplash.com/640x360/?${keywords},resort`;
};

const formatPrice = (price: number | undefined) => {
  if (price === undefined) return 'N/A';
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(price);
};

const getPerNightPrice = (hotel?: Hotel) => {
  if (!hotel?.checkInDate || !hotel?.checkOutDate || !hotel.price) return hotel?.price || 0;
  const checkIn = new Date(hotel.checkInDate);
  const checkOut = new Date(hotel.checkOutDate);
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (nights <= 0) return hotel.price;
  return hotel.price / nights;
};

const stayDuration = computed(() => {
  if (!props.selectedHotel?.checkInDate || !props.selectedHotel?.checkOutDate) return 1;
  const checkIn = new Date(props.selectedHotel.checkInDate);
  const checkOut = new Date(props.selectedHotel.checkOutDate);
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
});
</script>
