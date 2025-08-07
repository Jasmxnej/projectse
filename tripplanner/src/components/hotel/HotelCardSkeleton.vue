<template>
  <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 animate-pulse">
    <!-- Image skeleton -->
    <div class="h-48 bg-gray-200"></div>
    
    <!-- Content skeleton -->
    <div class="p-4">
      <!-- Title skeleton -->
      <div class="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
      
      <!-- Location skeleton -->
      <div class="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
      
      <!-- Rating skeleton -->
      <div class="flex space-x-1 mb-3">
        <div v-for="i in 5" :key="i" class="w-4 h-4 bg-gray-200 rounded-full"></div>
      </div>
      
      <!-- Description skeleton -->
      <div class="space-y-2 mb-4">
        <div class="h-3 bg-gray-200 rounded w-full"></div>
        <div class="h-3 bg-gray-200 rounded w-5/6"></div>
        <div class="h-3 bg-gray-200 rounded w-4/6"></div>
      </div>
      
      <!-- Price and button skeleton -->
      <div class="flex justify-between items-center">
        <div class="h-6 bg-gray-200 rounded w-1/4"></div>
        <div class="h-8 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// This is a skeleton loader component for hotel cards
// It's displayed while hotel data is being loaded
</script>