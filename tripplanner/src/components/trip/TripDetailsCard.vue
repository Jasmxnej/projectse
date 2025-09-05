<template>
  <div class="bg-white rounded-xl shadow-lg p-6 editable-item">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold text-gray-800">Trip Details</h2>
      <button
        v-if="editable"
        @click="$emit('edit')"
        class="px-3 py-1 bg-teal-600 text-white rounded-lg  transition-colors text-sm edit-button"
      >
        Edit Details
      </button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
      <p><strong>Destination:</strong> {{ trip.destination }}</p>
      <p><strong>Dates:</strong> {{ formatDate(trip.start_date) }} to {{ formatDate(trip.end_date) }}</p>
      <p><strong>Budget:</strong> {{ formatPrice(trip.budget) }}</p>
      <p><strong>Group Size:</strong> {{ trip.group_size }} people</p>
      <p><strong>Transport:</strong> {{ trip.transport }}</p>
      <p v-if="trip.activities"><strong>Interests:</strong> {{ trip.activities.join(', ') }}</p>
      <p v-if="trip.other_activity" class="md:col-span-2"><strong>Other Activities:</strong> {{ trip.other_activity }}</p>
      <p v-if="trip.special_needs" class="md:col-span-2"><strong>Special Needs:</strong> {{ trip.special_needs }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  trip: {
    type: Object,
    required: true
  },
  editable: {
    type: Boolean,
    default: true
  }
});

defineEmits(['edit']);

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatPrice = (price: number) => {
  if (price === null || price === undefined) return 'N/A';
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 }).format(price);
};
</script>