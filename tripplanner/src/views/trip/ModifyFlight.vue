<template>
  <div class="flex justify-center mb-10">
     <Sidebar />
   </div>
 <div class="max-w-7xl mx-auto">
   <div class="grid grid-cols-1 xl:grid-cols-3 gap-8 min-h-[2000px]">
     <!-- Left content -->
     <div class="xl:col-span-2">
       <div class="bg-white rounded-xl shadow-lg p-6">
         <div class="mb-6">
           <h1 class="text-3xl font-bold text-gray-800 mb-2">Flight Information</h1>
           <p class="text-gray-600">Find and manage your flight bookings and details</p>
         </div>

         <FlightSearchForm
           :initial-destination="tripStore.destination"
           :initial-start-date="tripStore.startDate"
           :initial-end-date="tripStore.endDate"
           :initial-group-size="tripStore.groupSize"
           :initial-departure-city="getDepartureCity()"
           :initial-departure-iata="getDepartureIata()"
           :initial-trip-type="tripType"
           :initial-seat-class="getSeatClass()"
           @search="fetchFlightOptions"
           @skip-step="skipStep"
         />

       </div>

       <div v-if="currentItinerary > 0" class="my-4">
           <button @click="goBack" class="text-sm font-medium text-teal-600 hover:underline flex items-center">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
             </svg>
             Back to previous flight
           </button>
       </div>

       <FlightResults
         :flight-results="flightResults"
         :flight-dictionaries="flightDictionaries"
         :is-searching="isSearching"
         :search-attempted="searchAttempted"
         :selected-flights="selectedFlights"
         :title="flightResultsTitle"
         :current-itinerary="currentItinerary"
         @show-details="showFlightDetails"
         @select-flight="handleFlightSelected"
       />

       <FlightDetails
         :flight="selectedFlightDetails"
         :dictionaries="flightDictionaries"
         @close="selectedFlightDetails = null"
       />
     </div>
        
   <!-- BudgetCard -->
   <div class="hidden xl:block  z-50">
     <BudgetCard
   :initial-budget="tripStore.initialBudget"
   :planned-expenses="plannedExpenses"
   />
 </div>


   </div>
 </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import FlightSearchForm from '@/components/flight/FlightSearchForm.vue';
import FlightResults from '@/components/flight/FlightResults.vue';
import FlightDetails from '@/components/flight/FlightDetails.vue';
import BudgetCard from '@/components/BudgetCard.vue';
import { useTripStore } from '@/stores/trip';
import { useFlightSearch } from '@/composables/useFlightSearch';
import Sidebar from '@/components/Sidebar.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const tripStore = useTripStore();
const {
 flightResults,
 flightDictionaries,
 isSearching,
 searchAttempted,
 selectedFlightDetails,
 selectedFlights,
 currentItinerary,
 flightResultsTitle,
 showFlightDetails,
 fetchFlightOptions,
 skipStep,
 handleFlightSelected,
 goBack,
 syncOfflineFlights,
 tripType,
} = useFlightSearch();

// Helper functions to extract flight details
const getDepartureCity = () => {
  if (tripStore.flights && tripStore.flights.length > 0) {
    return tripStore.flights[0].fromCity || tripStore.flights[0].from_city || '';
  }
  return '';
};

const getDepartureIata = () => {
  if (tripStore.flights && tripStore.flights.length > 0) {
    return tripStore.flights[0].from_iata || '';
  }
  return '';
};

const getSeatClass = () => {
  if (tripStore.flights && tripStore.flights.length > 0) {
    return tripStore.flights[0].travel_class || 'Economy';
  }
  return 'Economy';
};

onMounted(() => {
  syncOfflineFlights();
  
  // Set flag to return to SummaryMyTrip page after selection
  localStorage.setItem('returnToSummaryMyTrip', 'true');
  localStorage.setItem('summaryTripId', String(tripStore.tripId));
});

const plannedExpenses = computed(() => {
 const flightCost = selectedFlights.value.reduce((total, flight) => total + parseFloat(flight.price.total), 0);
 return {
   plan: 0,
   flight: flightCost,
   hotel: 0,
   total: flightCost,
 };
});
</script>
