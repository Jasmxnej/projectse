<template>
  <div class="bg-lightblue  rounded-xl shadow-lg p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">Weather</h3>
    <p class="text-gray-600">{{ weatherDescription }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  weatherDescription: {
    type: String,
    required: true,
  },
});
</script>