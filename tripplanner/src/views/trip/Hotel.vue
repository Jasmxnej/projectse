<template>
  <div class="flex justify-center mb-10">
      <Sidebar />
    </div>
  <div class="max-w-7xl mx-auto">
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div class="xl:col-span-2">
        <div class="bg-white rounded-xl shadow-lg p-6">
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">Hotel Information</h1>
            <p class="text-gray-600">Find and book your accommodation.</p>
          </div>
          <HotelSearchForm
            :initial-start-date="tripStore.startDate"
            :initial-end-date="tripStore.endDate"
            @search="fetchHotelOptions"
            @skip="skip"
            @go-back="goBack"
          />
         
        </div>
        <HotelResults :hotels="hotels" :is-loading="isLoading" @select-hotel="handleHotelSelected" @show-details="showHotelDetails" :is-selected="isSelected" :selected-hotel="selectedHotel " class="mt-6"/>
          <div v-if="totalPages > 1 && !isLoading" class="flex justify-center items-center mt-6 space-x-2">
            <button @click="prevPage" :disabled="currentPage === 1" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span class="text-sm text-gray-600">Page {{ currentPage }} of {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div v-if="selectedHotelDetails">
            <HotelDetailCard :hotel="selectedHotelDetails" @close="selectedHotelDetails = null" />
          </div>
      </div>
      <div class="xl:col-span-1">
        <div class="sticky top-24">
          <BudgetCard :initial-budget="tripStore.initialBudget" :planned-expenses="plannedExpenses" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useTripStore } from '@/stores/trip';
import HotelSearchForm from '@/components/hotel/HotelSearchForm.vue';
import HotelResults from '@/components/hotel/HotelResults.vue';
import BudgetCard from '@/components/BudgetCard.vue';
import HotelDetailCard from '@/components/hotel/HotelDetailCard.vue';
import { useHotelSearch } from '@/composables/useHotelSearch';
import Sidebar from '@/components/Sidebar.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const tripStore = useTripStore();
const {
  hotels,
  selectedHotel,
  selectedHotelDetails,
  isLoading,
  currentPage,
  totalPages,
  nextPage,
  prevPage,
  plannedExpenses,
  isSelected,
  fetchHotelOptions,
  showHotelDetails,
  handleHotelSelected,
  skip,
  goBack,
  syncOfflineHotels,
} = useHotelSearch();

onMounted(() => {
  syncOfflineHotels();

  localStorage.removeItem('returnToSummaryMyTrip');
  localStorage.removeItem('summaryTripId');
});
</script>