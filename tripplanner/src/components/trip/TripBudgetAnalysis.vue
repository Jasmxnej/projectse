<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">Budget Details</h2>
    <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-3">Budget Overview</h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <p class="font-medium">Total Budget:</p>
              <p class="text-xl font-bold text-gray-800">{{ formatPrice(totalBudget) }}</p>
            </div>
            <div class="flex justify-between items-center">
              <p class="font-medium">Planned Expenses:</p>
              <p class="text-xl font-bold text-secondary2">{{ formatPrice(plannedExpenses.total) }}</p>
            </div>
            <div class="flex justify-between items-center pt-2 border-t">
              <p class="font-medium">Remaining Budget:</p>
              <p class="text-xl font-bold" :class="remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatPrice(remainingBudget) }}
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-3">Expense Breakdown</h3>
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <p>Flight:</p>
              <p class="font-medium">{{ formatPrice(plannedExpenses.flight) }}</p>
            </div>
            <div class="flex justify-between items-center">
              <p>Hotel:</p>
              <p class="font-medium">{{ formatPrice(plannedExpenses.hotel) }}</p>
            </div>
            <div class="flex justify-between items-center">
              <p>Activities:</p>
              <p class="font-medium">{{ formatPrice(plannedExpenses.plan) }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Budget Analysis from Gemini -->
      <div class="mt-6 p-4 bg-white rounded-lg border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Budget Analysis</h3>
        <p class="text-gray-700 min-h-[4.5rem]">{{ budgetAnalysis || 'Loading budget analysis...' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps({
  totalBudget: {
    type: Number,
    required: true
  },
  plannedExpenses: {
    type: Object,
    required: true,
    default: () => ({
      total: 0,
      flight: 0,
      hotel: 0,
      plan: 0
    })
  },
  destination: {
    type: String,
    required: true
  }
});

const budgetAnalysis = ref<string>('');

const remainingBudget = computed(() => {
  return props.totalBudget - props.plannedExpenses.total;
});

const formatPrice = (price: number) => {
  if (price === null || price === undefined) return 'N/A';
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 }).format(price);
};

// Generate budget analysis
const generateBudgetAnalysis = async () => {
  try {
    const response = await axios.post('http://localhost:3002/api/gemini/generate', {
      prompt: {
        contents: [{
          parts: [{
            text: `Analyze this travel budget for a trip to ${props.destination}:
            Total Budget: ${formatPrice(props.totalBudget)}
            Flight Cost: ${formatPrice(props.plannedExpenses.flight)}
            Hotel Cost: ${formatPrice(props.plannedExpenses.hotel)}
            Activities Cost: ${formatPrice(props.plannedExpenses.plan)}
            Remaining: ${formatPrice(remainingBudget.value)}
            
            Provide a simple, easy-to-understand analysis (2-3 sentences) using everyday language. Explain if the budget is good or needs attention, and give 1-2 practical money-saving tips. Avoid technical terms and use friendly, conversational language that anyone can understand.`
          }]
        }]
      },
      apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    });
    
    if (response.data && response.data.text) {
      budgetAnalysis.value = response.data.text;
    } else {
      // Fallback analysis if API fails
      const remaining = remainingBudget.value;
      if (remaining >= 0) {
        budgetAnalysis.value = `Your budget looks good! You still have ${formatPrice(remaining)} left to spend on your trip. Consider setting some aside for unexpected expenses or souvenirs.`;
      } else {
        budgetAnalysis.value = `You're currently over budget by ${formatPrice(Math.abs(remaining))}. Consider looking for cheaper accommodation options or reducing some planned activities to bring costs down.`;
      }
    }
  } catch (error) {
    console.error('Error generating budget analysis:', error);
    // Fallback analysis if API fails
    const remaining = remainingBudget.value;
    if (remaining >= 0) {
      budgetAnalysis.value = `Your budget looks good! You still have ${formatPrice(remaining)} left to spend on your trip. Consider setting some aside for unexpected expenses or souvenirs.`;
    } else {
      budgetAnalysis.value = `You're currently over budget by ${formatPrice(Math.abs(remaining))}. Consider looking for cheaper accommodation options or reducing some planned activities to bring costs down.`;
    }
  }
};

onMounted(() => {
  generateBudgetAnalysis();
});
</script>