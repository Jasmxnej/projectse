<template>
  <div class="flex items-center gap-4 bg-gray-50 rounded-lg p-3 shadow-sm">
    <img :src="image" alt="" class="w-16 h-16 rounded-md object-cover flex-shrink-0" />
    <div class="flex-grow">
      <h4 class="font-semibold text-gray-800">{{ name }}</h4>
      <p class="text-sm text-gray-500">{{ description }}</p>
    </div>
    <button
      @click="$emit('add-to-plan')"
      class="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 flex-shrink-0"
      title="Add to Plan"
    >
      <i class="fas fa-plus"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

defineProps({
  image: String,
  name: String,
  description: String,
});


defineEmits(['add-to-plan']);
</script>