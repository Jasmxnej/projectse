<template>
  <div class="space-y-3 ">
    <div v-if="isLoading" class="flex justify-center items-center p-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
    </div>
    <div v-else-if="items.length === 0" class="text-center text-gray-500 py-3 text-sm">
      <p v-if="searchActive">No matching places found</p>
      <p v-else>Type to search for places</p>
    </div>
    <div v-else>
      <div
        v-for="item in items"
        :key="item.id"
        class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
        :class="{ 'bg-teal-50 border-teal-200': item.added }"
      >
        <img
          :src="item.image || item.cachedImageUrl || `https://via.placeholder.com/300x200/e5e7eb/6b7280?text=${encodeURIComponent(item.name)}`"
          :alt="item.name"
          class="w-16 h-16 rounded-lg object-cover"
          @error="handleImageError($event, item, item.category)"
          @load="item.imageLoaded = true"
        />
        <div class="flex-1">
          <h4 class="font-medium text-gray-800 mb-1">
            {{ item.name }}
            <p class="text-sm text-gray-600 mt-1">{{ item.description }}.</p>
            <span v-if="item.suggestedTime && item.estimatedCost" class="text-sm font-normal mt-1 block">
              {{ item.suggestedTime }} {{ item.estimatedCost }} THB
            </span>
          </h4>
          <div class="flex items-center mt-1">
            <span v-if="item.category" class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {{ item.category }}
            </span>
            <span v-if="item.location" class="text-xs text-gray-500 ml-2">
              📍 {{ item.location }}
            </span>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <button
            v-if="!item.added"
            @click="$emit('add', item)"
            class="text-teal-600 hover:text-teal-700 p-2 rounded-full hover:bg-teal-50 transition-colors"
            title="Add to plan"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button
            v-else
            class="text-green-600 p-2 rounded-full bg-green-50"
            disabled
            title="Added to plan"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            @click="$emit('select', item)"
            class="text-blue-600 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition-colors"
            title="View details"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';
import axios from 'axios';

interface Recommendation {
  id: number;
  image: string;
  name: string;
  description: string;
  suggestedTime?: string;
  estimatedCost?: number;
  category?: string;
  location?: string;
  added?: boolean;
  cachedImageUrl?: string;
  imageLoaded?: boolean;
  imageErrorHandled?: boolean;
  imageApiCalled?: boolean;
}

const props = defineProps({
  items: {
    type: Array as () => Recommendation[],
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  searchQuery: {
    type: String,
    default: '',
  }
});

defineEmits(['add', 'select']);

const searchActive = computed(() => {
  return props.searchQuery && props.searchQuery.length > 0;
});

const handleImageError = (event: Event, name: string) => {
  const imgElement = event.target as HTMLImageElement;
  const keyword = name?.split(' ')[0] || 'place';
  
  // Add random parameter to prevent caching issues
  const randomParam = Math.floor(Math.random() * 10000);
  const timestamp = Date.now();
  
  imgElement.src = `https://source.unsplash.com/featured/300x200/?${keyword},place&random=${randomParam}&t=${timestamp}`;
  
  // Add fallback in case the first attempt fails
  imgElement.onerror = () => {
    imgElement.src = `https://source.unsplash.com/featured/300x200/?travel,destination&random=${Math.floor(Math.random() * 10000)}`;
    imgElement.onerror = null; // Prevent infinite loop
  };
};
</script>
