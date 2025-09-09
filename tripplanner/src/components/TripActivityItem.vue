<template>
  <div class="flex items-start gap-4 bg-white rounded-xl p-4 shadow-md group w-full" @click.stop>
    <div class="flex-shrink-0 text-gray-400 cursor-grab pt-1">
      <i class="fas fa-grip-lines"></i>
    </div>
    <img :src="image" alt="" class="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
    <div class="flex-grow">
      <div class="flex justify-between items-start">
        <input
          v-if="isEditing"
          v-model="editedName"
          @blur="saveChanges"
          @keyup.enter="saveChanges"
          class="font-semibold text-lg text-gray-800 w-full p-1 border rounded"
        />
        <h4 v-else class="font-semibold text-lg text-gray-800">
          {{ name }}
        </h4>
        
       
      </div>

      <textarea
        v-if="isEditing"
        v-model="editedDescription"
        @blur="saveChanges"
        class="text-sm text-gray-600 w-full p-1 border rounded mt-1"
        rows="3"
      ></textarea>
      <p v-else class="text-sm text-gray-600 mt-1">
        {{ description || 'No description available.' }}
      </p>

      <div class="text-sm text-gray-500 flex items-center gap-2 mt-2">
        <input
          v-if="isEditing"
          v-model="editedTime"
          @blur="saveChanges"
          @keyup.enter="saveChanges"
          type="text"
          class="w-20 p-1 border rounded"
        />
        <span v-else @click.stop="isEditing = true" class="cursor-pointer hover:underline">{{ time }}</span>
        
        <span>|</span>
        
        <input
          v-if="isEditing"
          v-model="editedCost"
          @blur="saveChanges"
          @keyup.enter="saveChanges"
          type="number"
          class="w-24 p-1 border rounded"
        />
        <span v-else @click.stop="isEditing = true" class="cursor-pointer hover:underline">
          ฿{{ cost?.toLocaleString() }}
        </span>
      </div>
      
      <!-- Action buttons -->
      <div class="mt-3 flex justify-between items-center">
        <div class="flex gap-2">
           <!-- More Details Button  -->
        <button
          @click.stop="$emit('view-details')"
          class="text-sm text-teal-600 hover:text-teal-800 transition-colors px-3 py-1 bg-teal-50 hover:bg-teal-100 rounded-md flex items-center ml-2 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
          </svg>
          More Details
        </button>
        </div>
        
        <div class="flex gap-2">
          <!-- Edit button -->
          <button
            @click.stop="isEditing = true"
            class="text-sm text-blue-600 hover:text-blue-800 transition-colors px-2 py-1 bg-blue-50 rounded-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit
          </button>
          
          <!-- Delete button (always visible) -->
          <button
            @click.stop="$emit('delete-activity')"
            class="text-sm text-red-600 hover:text-red-800 transition-colors px-2 py-1 bg-red-50 rounded-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue';

const props = defineProps({
  id: Number,
  image: String,
  name: String,
  time: String,
  cost: Number,
  description: String,
});

const emit = defineEmits(['update-activity', 'delete-activity', 'view-details']);

const isEditing = ref(false);
const editedName = ref(props.name);
const editedTime = ref(props.time);
const editedCost = ref(props.cost);
const editedDescription = ref(props.description);
const showFullDescription = ref(false);

// Watch for prop changes to keep local state in sync
watch(() => props.name, (newName) => {
  editedName.value = newName;
});
watch(() => props.time, (newTime) => {
  editedTime.value = newTime;
});
watch(() => props.cost, (newCost) => {
  editedCost.value = newCost;
});
watch(() => props.description, (newDescription) => {
  editedDescription.value = newDescription;
});

const saveChanges = () => {
  isEditing.value = false;
  emit('update-activity', {
    id: props.id,
    name: editedName.value,
    time: editedTime.value,
    cost: editedCost.value,
    description: editedDescription.value,
  });
};

const toggleDescription = () => {
  showFullDescription.value = !showFullDescription.value;
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>