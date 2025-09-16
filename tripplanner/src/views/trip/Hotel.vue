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
        <HotelResults :hotels="hotels" :is-loading="isLoading" @select-hotel="handleHotelSelected" @show-details="showHotelDetails" :selected-hotel="selectedHotel" class="mt-6"/>
        
        <div v-if="hotels.length > 0 && !isLoading" class="mt-6 flex justify-center">
          <div v-if="hasMore" class="space-y-2">
            <button
              v-if="!isLoadingMore"
              @click="nextPage"
              class="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Load More Hotels
            </button>
            <div v-else class="flex flex-col items-center space-y-2">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <p class="text-sm text-gray-500">Loading more hotels...</p>
            </div>
          </div>
          <p v-else-if="!hasMore" class="text-center text-gray-500 py-4">No more hotels available.</p>
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
  isLoadingMore,
  hasMore,
  currentPage,
  totalPages,
  nextPage,
  plannedExpenses,
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