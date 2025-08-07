<template>
  <Navbar />
  <div class=" min-h-screen pt-24 pb-20 px-6 ">
    <div class="max-w-7xl mx-auto px-6 pt-10 pb-24 space-y-14">
      <!-- Page Heading -->
      <div class="ml-2">
        <h1 class="text-5xl font-bold text-[#17637B] \">My Trips</h1>
        <p class="text-[#17637B]  text-lg mt-2">View and manage all your planned adventures</p>
      </div>

      <!-- Empty State -->
      <div
        v-if="trips.length === 0"
        class="flex flex-col items-center justify-center h-80 border rounded-3xl bg-white/70 shadow-inner backdrop-blur-md text-center"
      >
        <h2 class="text-2xl font-bold text-[#17637B] mb-2">No Trips Yet</h2>
        <p class="text-base text-gray-500 mb-4">Start planning your first adventure to see it here</p>
        <button
          @click="createTrip"
          class="bg-red hover:brighteness-110  text-white px-6 py-2 rounded-full font-semibold shadow hover:brightness-110 transition"
        >
          + Plan Your First Trip
        </button>
      </div>

      <!-- Trip Cards -->
      <div v-else class="bg-white/80 shadow-xl backdrop-blur-md rounded-3xl p-10 space-y-14">
        <div class="flex items-center justify-between">
          <h2 class="text-3xl font-semibold text-[#17637B] ">Planned Trips</h2>
          <button
            @click="createTrip"
            class="bg-red hover:brighteness-110 text-white px-6 py-2 rounded-full font-semibold shadow hover:brightness-110 transition"
          >
            + Plan New Trip
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="trip in trips"
            :key="trip.id"
            class="rounded-2xl bg-white border border-gray-200 p-6 shadow-md hover:shadow-lg transition duration-300"
          >
            <div class="mb-4">
              <h3
                v-if="!trip.isEditing"
                class="text-[#17637B] font-bold text-xl mb-2 capitalize"
              >
                {{ trip.name || trip.destination }}
              </h3>
              <input
                v-else
                type="text"
                v-model="trip.name"
                @blur="saveTripName(trip)"
                @keyup.enter="saveTripName(trip)"
                class="text-[#17637B] font-bold text-xl mb-2 capitalize border-b border-gray-300 focus:outline-none"
              />
              <p class="text-gray-500 text-sm">
                <i class="fa fa-calendar mr-2"></i>
                {{ new Date(trip.start_date).toLocaleDateString() }} – {{ new Date(trip.end_date).toLocaleDateString() }}
              </p>
              <p class="text-gray-500 text-sm">
                <i class="fa fa-user mr-2"></i> Group Size: {{ trip.group_size }}
              </p>
              <p class="text-gray-500 text-sm italic">
                Budget: {{ formatNumber(trip.budget) }}
              </p>
            </div>
            <div class="flex flex-wrap gap-2 mt-4">
              <button
                @click="viewTrip(trip.id)"
                class="border border-gray-400 text-gray-700 px-4 py-1 rounded hover:bg-gray-100 transition text-sm"
              >
                View
              </button>
              <button
                @click="confirmDeleteTrip(trip)"
                class="border border-red-400 text-red-600 px-4 py-1 rounded hover:bg-red-50 transition text-sm"
              >
                Delete
              </button>
              <button
                @click="toggleEdit(trip)"
                class="border border-gray-400 text-gray-700 px-4 py-1 rounded hover:bg-gray-100 transition text-sm"
              >
                {{ trip.isEditing ? 'Save' : 'Edit Name' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Stats Summary -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center mt-14">
          <div class="border rounded-2xl p-6 bg-white shadow hover:shadow-md transition">
            <p class="text-sm text-gray-500 mb-1">Total Trips</p>
            <p class="text-4xl font-bold text-blue-500">{{ trips.length }}</p>
          </div>
          <div class="border rounded-2xl p-6 bg-white shadow hover:shadow-md transition">
            <p class="text-sm text-gray-500 mb-1">Total Days</p>
            <p class="text-4xl font-bold text-blue-500">{{ totalDays }}</p>
          </div>
          <div class="border rounded-2xl p-6 bg-white shadow hover:shadow-md transition">
            <p class="text-sm text-gray-500 mb-1">Total Budget</p>
            <p class="text-4xl font-bold text-blue-500">{{ formatNumber(totalBudget) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import Navbar from '../components/Nav.vue';

interface Trip {
  id: number;
  destination: string;
  start_date: string;
  end_date: string;
  name?: string;
  group_size: number;
  budget: number;
  isEditing?: boolean;
}

const trips = ref<Trip[]>([]);
const authStore = useAuthStore();
const router = useRouter();

const fetchTrips = async () => {
  if (authStore.currentUser) {
    try {
      const response = await axios.get(`http://localhost:3002/api/trips/saved/${authStore.currentUser.id}`);
      // The server already returns only the newest trip_id for each unique trip name
      // But let's add additional client-side filtering to ensure we only show the latest
      const uniqueTrips = new Map();
      
      response.data.forEach((trip: Trip) => {
        const tripName = trip.name || trip.destination;
        if (!uniqueTrips.has(tripName) || uniqueTrips.get(tripName).id < trip.id) {
          uniqueTrips.set(tripName, trip);
        }
      });
      
      trips.value = Array.from(uniqueTrips.values()).sort((a, b) => b.id - a.id);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  }
};

const totalDays = computed(() => {
  return trips.value.reduce((total, trip) => {
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return total + diffDays;
  }, 0);
});

const totalBudget = computed(() => {
  return trips.value.reduce((total, trip) => total + trip.budget, 0);
});

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const viewTrip = (id: number) => {
  router.push({ name: 'summarypagemytrip', params: { tripId: id } });
};

const confirmDeleteTrip = (trip: Trip) => {
  if (confirm(`Are you sure you want to delete the trip "${trip.name || trip.destination}"? This action cannot be undone.`)) {
    deleteTrip(trip.id);
  }
};

const deleteTrip = async (id: number) => {
  try {
    // Show loading indicator or disable button here if needed
    
    // Delete the trip from the server
    await axios.delete(`http://localhost:3002/api/trips/${id}`);
    
    // Also clean up any local storage related to this trip
    try {
      localStorage.removeItem(`trip-${id}-name`);
      localStorage.removeItem(`trip-${id}-data`);
      localStorage.removeItem(`trip-${id}-budget`);
      localStorage.removeItem(`trip-${id}-flight`);
      localStorage.removeItem(`trip-${id}-hotel`);
      localStorage.removeItem(`trip-${id}-schedule`);
      localStorage.removeItem(`trip-${id}-packing`);
      localStorage.removeItem(`trip-${id}-packing-list`);
      localStorage.removeItem(`trip-${id}-recommendations`);
    } catch (localStorageError) {
      console.error('Error cleaning up local storage:', localStorageError);
      // Continue with the deletion process even if local storage cleanup fails
    }
    
    // Refresh the trips list
    fetchTrips();
    
    // Show success message
    alert('Trip deleted successfully');
  } catch (error) {
    console.error('Error deleting trip:', error);
    alert('Failed to delete trip. Please try again.');
  }
};

const createTrip = () => {
  router.push('/startplan');
};

const toggleEdit = (trip: Trip) => {
  trip.isEditing = !trip.isEditing;
};

const saveTripName = async (trip: Trip) => {
  try {
    await axios.put(`http://localhost:3002/api/trips/${trip.id}/name`, { name: trip.name });
    trip.isEditing = false;
  } catch (error) {
    console.error('Error updating trip name:', error);
  }
};

onMounted(() => {
  fetchTrips();
});
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
</style>
