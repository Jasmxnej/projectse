<template>
  <div class="bg-lightblue rounded-xl shadow-lg p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">What to wear</h3>
    <p class="text-gray-600 text-sm">{{ whatToWearDescription }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  whatToWearDescription: {
    type: String,
    required: true,
  },
});
</script>