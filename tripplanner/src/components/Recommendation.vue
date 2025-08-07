<template>
  <div class="p-4 bg-white rounded-lg shadow-md">
    <h3 class="text-lg font-semibold text-gray-800 mb-2">Recommendations</h3>
    <div class="mb-4">
      <input
        type="text"
        v-model="searchQuery"
        @keyup.enter="search"
        placeholder="Search for recommendations"
        class="w-full px-4 py-2 border rounded-lg"
      />
    </div>
    <div class="space-y-2">
      <div
        v-for="item in recommendedItems"
        :key="item.id"
        class="flex items-center p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
        draggable="true"
        @dragstart="handleDragStart(item)"
        @click="showDetails(item)"
      >
        <img :src="item.image" alt="" class="w-10 h-10 rounded-md mr-3">
        <div>
          <p class="font-semibold text-gray-700">{{ item.name }}</p>
          <p class="text-sm text-gray-500 truncate">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref } from 'vue';

interface Recommendation {
  id: number;
  image: string;
  name: string;
  description: string;
}

const props = defineProps<{
  recommendedItems: Recommendation[];
}>();

const emit = defineEmits(['add-recommendation-to-plan', 'handle-drag-start', 'search', 'show-details']);
const searchQuery = ref('');

const handleDragStart = (item: Recommendation) => {
  emit('handle-drag-start', item);
};

const search = () => {
  emit('search', searchQuery.value);
};

const showDetails = (item: Recommendation) => {
  emit('show-details', item);
};
</script>