<template>
  <div class="lg:col-span-2">
    <div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ title }}</h1>
        <p class="text-gray-600">{{ subtitle }}</p>
      </div>
      <slot name="search-form"></slot>
      <slot name="results"></slot>
      <div class="text-center mt-6">
        <button
          @click="$emit('save')"
          :disabled="saveDisabled"
          class="px-6 py-2 bg-[#C25941] text-[#F1EADF] text-base font-semibold rounded-lg hover:bg-[#A54832] transition-colors disabled:opacity-50"
        >
          Save Changes
        </button>
      </div>
      <div class="text-center mt-4">
        <button
          type="button"
          @click="$router.back()"
          class="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  saveDisabled: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['save']);
</script>