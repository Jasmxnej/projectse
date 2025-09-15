<template>
  <div class="bg-white border border-gray-200 bg-[#fcfbe6] rounded-2xl shadow-xl p-6 transition-all duration-300 ease-in-out">
    <h3 class="text-xl font-semibold text-gray-800 mb-5">Budget Overview</h3>
    <div
      class="text-4xl font-extrabold mb-4"
      :class="remainingBudget < 0 ? 'text-red-500' : 'text-secondary2'"
    >
      {{ formatCurrency(remainingBudget) }}
    </div>

    <div class="space-y-3 text-sm text-gray-600">
      <div class="flex justify-between">
        <span>Initial Budget</span>
        <span class="font-semibold text-gray-800">{{ formatCurrency(props.initialBudget) }}</span>
      </div>
      <div class="flex justify-between">
        <span>Flight</span>
        <span class="font-semibold text-gray-800">{{ formatCurrency(props.plannedExpenses?.flight || 0) }}</span>
      </div>
      <div class="flex justify-between">
        <span>Hotel</span>
        <span class="font-semibold text-gray-800">{{ formatCurrency(props.plannedExpenses?.hotel || 0) }}</span>
      </div>
      <div class="flex justify-between">
        <span>Activities</span>
        <span class="font-semibold text-gray-800">{{ formatCurrency(props.plannedExpenses?.plan || 0) }}</span>
      </div>
      <div class="flex justify-between pt-1 border-t border-secondary2">
        <span>Total Spent</span>
        <span class="font-semibold text-gray-800">{{ formatCurrency(props.plannedExpenses?.total || 0) }}</span>
      </div>
    </div>

    <div
      v-if="remainingBudget < 0"
      class="mt-6 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-md"
    >
      Over budget by {{ formatCurrency(Math.abs(remainingBudget)) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  initialBudget: { type: Number, required: true },
  plannedExpenses: {
    type: Object as () => { flight: number; hotel: number; plan: number; total: number },
    required: true,
  },
});

const remainingBudget = computed(() => {
  return props.initialBudget - (props.plannedExpenses?.total || 0);
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
  }).format(value);
};
</script>
