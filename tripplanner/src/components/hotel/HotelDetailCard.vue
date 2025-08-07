<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-5xl overflow-y-auto max-h-[90vh] relative">
      <div v-if="hotel">
        <!-- Hotel Images -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <img
            v-for="(src, index) in imageGallery"
            :key="index"
            :src="src"
            alt="Hotel Image"
            class="w-full h-52 object-cover rounded-xl border border-gray-300 shadow-md hover:scale-105 transition-transform duration-300"
          />
        </div>

        <h2 class="text-4xl font-bold text-gray-900 mb-2">{{ hotel.name || '-' }}</h2>
        <div class="text-gray-600 text-base flex items-center gap-2 mb-4">
          <i class="fas fa-map-marker-alt text-teal-500"></i>
          {{ hotel.location || 'Location not available' }}
        </div>

        <div v-if="hotel.rating" class="flex items-center gap-1 mb-6">
          <span v-for="n in 5" :key="n">
            <i :class="n <= hotel.rating ? 'fas fa-star text-yellow-400' : 'far fa-star text-gray-300'"></i>
          </span>
          <span class="ml-3 text-base text-gray-500 font-medium">({{ hotel.rating }}/5)</span>
        </div>

        <p class="text-gray-700 whitespace-pre-wrap leading-relaxed mb-8 text-lg">
          {{ hotel.description || 'No description available.' }}
        </p>

        <!-- Room Details -->
        <div v-if="hotel.room" class="mb-8">
          <h3 class="text-2xl font-semibold text-gray-800 mb-3">Room Details</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700 text-base">
            <p><strong>Type:</strong> {{ hotel.room.type || '-' }}</p>
            <p><strong>Beds:</strong> {{ hotel.room.beds || '-' }}</p>
            <p><strong>Bed Type:</strong> {{ hotel.room.bedType || '-' }}</p>
            <p v-if="hotel.room.description" class="col-span-2">
              <strong>Description:</strong> {{ hotel.room.description }}
            </p>
          </div>
        </div>

        <!-- Policies -->
        <div v-if="hotel.policies" class="mb-8">
          <h3 class="text-2xl font-semibold text-gray-800 mb-3">Policies</h3>
          <div class="text-gray-700 text-base space-y-1">
            <p><strong>Cancellation:</strong> {{ hotel.policies.cancellation?.description?.text || '-' }}</p>
            <p v-if="hotel.policies.payment">
              <strong>Payment:</strong> {{ hotel.policies.payment.acceptedPayments?.creditCards?.join(', ') || '-' }}
            </p>
          </div>
        </div>

        <!-- Amenities -->
        <div v-if="hotel.amenities?.length" class="mb-8">
          <h3 class="text-2xl font-semibold text-gray-800 mb-3">Amenities</h3>
          <ul class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-gray-700">
            <li v-for="amenity in hotel.amenities" :key="amenity">
              <i class="fas fa-check text-teal-500 mr-1"></i>{{ formatAmenity(amenity) }}
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div v-if="hotel.contact" class="mb-8">
          <h3 class="text-2xl font-semibold text-gray-800 mb-3">Contact</h3>
          <p v-if="hotel.contact.phone"><i class="fas fa-phone mr-2"></i>{{ hotel.contact.phone }}</p>
          <p v-if="hotel.contact.email"><i class="fas fa-envelope mr-2"></i>{{ hotel.contact.email }}</p>
        </div>

        <!-- Price and Close -->
        <div class="flex justify-between items-center pt-6 border-t">
          <div class="text-3xl font-extrabold text-teal-600">{{ formatPrice(hotel.price) }}</div>
          <button @click="$emit('close')" class="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800 font-semibold">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted, onUnmounted } from 'vue';
import type { Hotel } from '../../types/hotel';
import axios from 'axios';

const props = defineProps<{ hotel: Hotel | null }>();
defineEmits(['close']);

const fallbackImage = 'https://source.unsplash.com/featured/?hotel,resort';
const imageGallery = ref<string[]>([]);

const formatPrice = (price: number) => {
  if (!price) return 'N/A';
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB'
  }).format(price);
};

const formatAmenity = (text: string) => {
  return text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Fetch Unsplash images
onMounted(async () => {
  document.body.style.overflow = 'hidden'; // prevent scroll
  const name = props.hotel?.name || 'hotel';
  try {
    // Fetch three different images for the hotel
    const keywords = [
      `${name} hotel exterior`,
      `${name} hotel room`,
      `${name} hotel amenities`
    ];
    
    // Add a random parameter to ensure different images
    const imagePromises = keywords.map((keyword, index) =>
      axios.get(`http://localhost:3002/api/unsplash/image?place=${encodeURIComponent(keyword)}&random=${Date.now() + index}`)
    );
    
    const results = await Promise.allSettled(imagePromises);
    const images: string[] = [];
    
    // Process each result and ensure we have unique images
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'fulfilled' && result.value.data?.image) {
        const image = result.value.data.image;
        // Only add if not already in the array
        if (!images.includes(image)) {
          images.push(image);
        } else {
          // If duplicate, use a different fallback
          const fallbackKeyword = `${keywords[i].split(' ')[0]}-${i}` || `hotel-${i}`;
          images.push(`https://source.unsplash.com/640x360/?${fallbackKeyword},resort&random=${Date.now() + i}`);
        }
      } else {
        // Fallback to direct Unsplash with different queries and random parameter
        const fallbackKeyword = `${keywords[i].split(' ')[0]}-${i}` || `hotel-${i}`;
        images.push(`https://source.unsplash.com/640x360/?${fallbackKeyword},resort&random=${Date.now() + i}`);
      }
    }
    
    imageGallery.value = images;
  } catch (err) {
    console.error('Images fetch failed:', err);
    // Use direct Unsplash source API as fallback with different queries
    const keywords = ['hotel-exterior', 'hotel-room', 'hotel-amenities'];
    imageGallery.value = keywords.map(keyword =>
      `https://source.unsplash.com/640x360/?${keyword}`
    );
  }
});

onUnmounted(() => {
  document.body.style.overflow = ''; // restore scroll
});
</script>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 6px;
}
</style>
