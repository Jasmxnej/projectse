<template>
  <div class="min-h-screen bg-gray-50">
    <Nav />
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="text-center mb-12 mt-20">
        <h1 class="text-4xl font-bold text-gray-800 mb-4">
          Community Trip Plans
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover and share amazing trip plans from fellow travelers. Get inspired for your next adventure!
        </p>
      </div>

      <!-- Trips Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <RouterLink
          v-for="trip in communityTrips"
          :key="trip.id"
          :to="`/community/${trip.id}`"
          class="group block bg-white rounded-lg shadow-md overflow-hidden  hover:scale-105 transition-all duration-300"
        >
          <!-- Trip Image -->
          <div class="relative h-48 bg-gray-200 overflow-hidden">
            <img
              :src="trip.image"
              :alt="trip.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              @error="(e) => handleImageError(e, trip.destination)"
            />
            <div class="absolute top-2 right-2 bg-teal-500 text-white px-2 py-1 rounded text-sm">
              {{ formatDate(trip.start_date) }} - {{ formatDate(trip.end_date) }}
            </div>
          </div>

          <!-- Trip Content -->
          <div class="p-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-2 transition-colors">
              {{ trip.title }}
            </h3>
            <p class="text-gray-600 mb-3 font-medium">
              {{ trip.destination }}
            </p>
            <p class="text-gray-500 text-sm mb-4 line-clamp-3">
              {{ trip.description }}
            </p>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <img
                  :src="trip.creator.avatar"
                  alt="Creator"
                  class="w-8 h-8 rounded-full"
                  @error="handleAvatarError"
                />
                <span class="text-sm font-medium text-gray-700">
                  by {{ trip.creator.username }}
                </span>
              </div>
              <div class="text-sm text-teal-600 font-semibold">
                View Details →
              </div>
            </div>
          </div>
        </RouterLink>
      </div>

      <!-- If no trips (fallback) -->
      <div v-if="communityTrips.length === 0" class="text-center py-12">
        <p class="text-gray-500 text-lg">No trips available yet. Check back soon!</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import Nav from '@/components/Nav.vue'
import { mockCommunityTrips } from '@/composables/mockData'

const communityTrips = ref(mockCommunityTrips)

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

// Simulate loading (optional)
onMounted(() => {
  // Could fetch real data here if needed
})

const handleImageError = (event: Event, destination?: string) => {
  const target = event.target as HTMLImageElement;
  const query = destination ? `${destination},travel` : 'travel,destination';
  target.src = `https://source.unsplash.com/800x400/?${query}&auto=format&fit=crop&q=80`;
}

const handleAvatarError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  const staticPortraits = [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=40&h=40&fit=crop&crop=face'
  ];
  const randomIndex = Math.floor(Math.random() * staticPortraits.length);
  target.src = staticPortraits[randomIndex];
  target.onerror = null; // Prevent infinite loop
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>