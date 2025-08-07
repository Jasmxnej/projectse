<template>
  <div class="mb-6">
    <div class="flex justify-between items-center mb-4">
      <h4 class="text-lg font-semibold text-gray-800 cursor-pointer" @click="$emit('start-editing', day.id)">
        <span v-if="!editingDayId || editingDayId !== day.id">
          {{ day.name || `DAY ${day.dayNumber}` }}
        </span>
        <input
          v-else
          type="text"
          :value="day.name"
          @input="$emit('update:day-name', ($event.target as HTMLInputElement).value)"
          @blur="$emit('stop-editing')"
          @keyup.enter="$emit('stop-editing')"
          class="text-lg font-semibold text-gray-800 bg-transparent border-b border-gray-400 focus:outline-none w-full"
        />
      </h4>
      <button @click="$emit('delete-day', day.id)" class="text-red-500 hover:text-red-700">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>

    <div class="space-y-4">
      <div
        v-for="(activity, index) in day.activities"
        :key="activity.id"
        class="transition-all"
        :class="{
          'opacity-50': dragging && draggedActivity && draggedActivity.dayId === day.id && draggedActivity.index === index,
          'ring-2 ring-teal-400 bg-teal-50': dragging && draggedActivity && draggedActivity.index !== index
        }"
        draggable="true"
        @dragstart="$emit('drag-start', { event: $event, dayId: day.id, index: index })"
        @dragover="$emit('drag-over', $event)"
        @drop="$emit('drop', { event: $event, dropDayId: day.id, dropIndex: index })"
        @dragenter.prevent="handleDragEnter($event)"
        @dragleave.prevent="handleDragLeave($event)"
      >
        <TripActivityItem
          :id="activity.id"
          :image="activity.image"
          :name="activity.name"
          :time="activity.time"
          :cost="activity.cost"
          :description="activity.description"
          :destination="destination"
          @update-activity="updateActivity(activity.id, $event)"
          @delete-activity="$emit('delete-activity', { dayId: day.id, activityId: activity.id })"
          @view-details="$emit('view-activity-details', activity)"
        />
      </div>
    </div>

    <button
      @click="$emit('add-activity', day.id)"
      class="w-full mt-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-teal-500 hover:text-teal-500 transition-colors"
    >
      + Add New Activity
    </button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, type PropType } from 'vue';
import TripActivityItem from '@/components/TripActivityItem.vue';

interface TripActivity {
  id: number;
  image: string;
  name: string;
  time: string;
  cost: number;
  description?: string;
}

interface TripDay {
  id: number;
  dayNumber: number;
  name: string | null;
  activities: TripActivity[];
}

const props = defineProps({
  day: {
    type: Object as () => TripDay,
    required: true,
  },
  editingDayId: {
    type: Number as PropType<number | null>,
    default: null,
  },
  editingActivityId: {
    type: Number as PropType<number | null>,
    default: null,
  },
  dragging: {
    type: Boolean,
    default: false,
  },
  draggedActivity: {
    type: Object as PropType<{ dayId: number; index: number } | null>,
    default: null,
  },
  destination: {
    type: String,
    default: ''
  }
});

const emit = defineEmits([
  'start-editing',
  'update:day-name',
  'stop-editing',
  'delete-day',
  'drag-start',
  'drag-over',
  'drop',
  'view-activity-details',
  'update-activity',
  'start-editing-activity',
  'stop-editing-activity',
  'delete-activity',
  'add-activity',
]);

const formatCurrency = (value: number) => {
  if (typeof value !== 'number') {
    return value;
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const handleDragEnter = (e: DragEvent) => {
  const el = e.currentTarget as HTMLElement | null;
  el?.classList.add('ring-4', 'ring-teal-300', 'bg-teal-50');
};

const handleDragLeave = (e: DragEvent) => {
  const el = e.currentTarget as HTMLElement | null;
  el?.classList.remove('ring-4', 'ring-teal-300', 'bg-teal-50');
};

const updateActivity = (activityId: number, updatedData: any) => {
  emit('update-activity', { 
    dayId: props.day.id, 
    activityId: activityId, 
    updatedData: updatedData 
  });
};
</script>
