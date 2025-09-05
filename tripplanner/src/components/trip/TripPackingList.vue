<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">Packing List</h2>
    
    <!-- Travel Plug Information -->
    <TravelPlugInfo
      :destination="destination"
      @add-to-packing="addPackingItemFromSuggestion"
      ref="travelPlugInfoComponent"
    />
    
    <div class="bg-gray-50 rounded-xl p-6 border border-gray-200 mt-4">
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center">
          <input
            type="text"
            v-model="newPackingItem"
            placeholder="Add new item..."
            class="border border-gray-300 rounded-lg px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            @keyup.enter="addPackingItem"
          />
          <input
            type="number"
            v-model="newPackingItemQuantity"
            placeholder="Qty"
            class="border border-gray-300 rounded-lg px-3 py-2 w-20 mr-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <select
            v-model="newPackingItemCategory"
            class="border border-gray-300 rounded-lg px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select Category</option>
            <option v-for="(category, idx) in categorizedPackingList.categories" :key="idx" :value="category.name">
              {{ category.name }}
            </option>
          </select>
          <button @click="addPackingItem" class="bg-teal-600 text-white px-4 py-2 rounded-lg">
            Add
          </button>
        </div>
        <button @click="savePackingList" class="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
          Refresh List
        </button>
      </div>
      
      <!-- Categorized Packing List -->
      <div v-if="categorizedPackingList.categories && categorizedPackingList.categories.length > 0" class="space-y-6">
        <div v-for="(category, categoryIndex) in categorizedPackingList.categories" :key="categoryIndex" class="bg-white rounded-lg shadow-sm p-4">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-lg font-semibold text-gray-800">{{ category.name }}</h3>
            <span class="text-sm text-gray-500">{{ getCategoryStats(category) }}</span>
          </div>
          
          <div v-if="category.items && category.items.length > 0" class="space-y-2">
            <div v-for="(item, itemIndex) in category.items" :key="itemIndex" class="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
              <div class="flex items-center">
                <input
                  type="checkbox"
                  v-model="item.packed"
                  @change="savePackingList"
                  class="mr-3 h-5 w-5 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <span :class="{'line-through text-gray-400': item.packed}" class="font-medium">{{ item.name }}</span>
                  <span class="ml-2 text-gray-500">({{ item.quantity }})</span>
                  <p v-if="item.note" class="text-xs text-teal-600 mt-1">{{ item.note }}</p>
                </div>
              </div>
              <button @click="removePackingItem(categoryIndex, itemIndex)" class="text-red-500 hover:text-red-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          <div v-else class="text-center py-2 text-gray-500 text-sm">
            <p>No items in this category.</p>
          </div>
        </div>
      </div>
      
      <!-- Legacy Flat Packing List (Fallback) -->
      <div v-else-if="packingList.length > 0" class="space-y-2">
        <div v-for="(item, index) in packingList" :key="index" class="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
          <div class="flex items-center">
            <input
              type="checkbox"
              v-model="item.packed"
              @change="savePackingList"
              class="mr-3 h-5 w-5 text-teal-600 focus:ring-teal-500"
            />
            <span :class="{'line-through text-gray-400': item.packed}">{{ item.name }}</span>
            <span class="ml-2 text-gray-500">({{ item.quantity }})</span>
          </div>
          <button @click="removePackingItem(null, index)" class="text-red-500 hover:text-red-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <div v-else class="text-center py-8 text-gray-500">
        <p>No items in your packing list yet.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import TravelPlugInfo from './TravelPlugInfo.vue';

const props = defineProps({
  tripId: {
    type: [String, Number],
    required: true
  },
  destination: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['add-to-packing', 'data-updated']);

// Packing list
const packingList = ref<{name: string, quantity: number, packed: boolean}[]>([]);
const categorizedPackingList = ref<any>({ categories: [] });
const newPackingItem = ref('');
const newPackingItemQuantity = ref(1);
const newPackingItemCategory = ref('');

// Get category statistics (packed/total)
const getCategoryStats = (category: any) => {
  if (!category.items || category.items.length === 0) return '0/0 packed';
  
  const totalItems = category.items.length;
  const packedItems = category.items.filter((item: any) => item.packed).length;
  
  return `${packedItems}/${totalItems} packed`;
};

// Add item to packing list
const addPackingItem = () => {
  if (!newPackingItem.value.trim()) return;
  
  const newItem = {
    name: newPackingItem.value.trim(),
    quantity: newPackingItemQuantity.value || 1,
    packed: false
  };
  
  // If using categorized packing list
  if (categorizedPackingList.value.categories && categorizedPackingList.value.categories.length > 0) {
    // Find selected category or use "Miscellaneous" as default
    const categoryName = newPackingItemCategory.value || 'Miscellaneous';
    let category = categorizedPackingList.value.categories.find((c: any) => c.name === categoryName);
    
    // If category doesn't exist, create it
    if (!category) {
      category = { name: categoryName, items: [] };
      categorizedPackingList.value.categories.push(category);
    }
    
    // Add item to category
    if (!category.items) category.items = [];
    category.items.push(newItem);
  } else {
    // Fallback to flat list
    packingList.value.push(newItem);
  }
  
  // Reset form
  newPackingItem.value = '';
  newPackingItemQuantity.value = 1;
  newPackingItemCategory.value = '';
  
  savePackingList();
};

// Remove item from packing list
const removePackingItem = (categoryIndex: number | null, itemIndex: number) => {
  if (categoryIndex !== null && categorizedPackingList.value.categories) {
    // Remove from categorized list
    const category = categorizedPackingList.value.categories[categoryIndex];
    if (category && category.items) {
      category.items.splice(itemIndex, 1);
    }
  } else {
    // Remove from flat list
    packingList.value.splice(itemIndex, 1);
  }
  
  savePackingList();
};

// Save packing list to database
const savePackingList = async () => {
  try {
    const tripId = props.tripId;
    
    // Determine which packing list to save
    const dataToSave = categorizedPackingList.value.categories &&
                       categorizedPackingList.value.categories.length > 0
                       ? categorizedPackingList.value
                       : { categories: [{ name: "Items", items: packingList.value }] };
    
    try {
      await axios.post(`http://localhost:3002/api/trips/${tripId}/packing-list`, {
        packingList: dataToSave
      });
    } catch (apiError) {
      console.error('Error saving packing list to API:', apiError);
      // Save locally if API fails
      localStorage.setItem(`trip-${tripId}-packing-list`, JSON.stringify(dataToSave));
    }
  } catch (error) {
    console.error('Error in save packing list process:', error);
  }
};

// Load packing list from database
const loadPackingList = async () => {
  try {
    const tripId = props.tripId;
    
    try {
      const response = await axios.get(`http://localhost:3002/api/trips/${tripId}/packing-list`);
      
      // Check if response has categorized structure
      if (response.data && response.data.categories) {
        categorizedPackingList.value = response.data;
        emit('data-updated', response.data);
        return;
      }
      // Check if response is an array (old format)
      else if (response.data && Array.isArray(response.data)) {
        // Convert old format to categorized format
        packingList.value = response.data;
        categorizedPackingList.value = {
          categories: [
            {
              name: "Items",
              items: response.data
            }
          ]
        };
        return;
      }
    } catch (apiError) {
      console.error('Error loading packing list from API:', apiError);
      
      // Try to load from localStorage if API fails
      const localPackingList = localStorage.getItem(`trip-${tripId}-packing-list`);
      if (localPackingList) {
        try {
          const parsedData = JSON.parse(localPackingList);
          
          // Check if local storage has categorized structure
          if (parsedData && parsedData.categories) {
            categorizedPackingList.value = parsedData;
            return;
          }
          // Check if local storage is an array (old format)
          else if (Array.isArray(parsedData)) {
            packingList.value = parsedData;
            categorizedPackingList.value = {
              categories: [
                {
                  name: "Items",
                  items: parsedData
                }
              ]
            };
            return;
          }
        } catch (parseError) {
          console.error('Error parsing local packing list:', parseError);
        }
      }
    }
    
    // If no data found, initialize with default categories
    categorizedPackingList.value = {
      categories: [
        {
          name: "Documents",
          items: [
            { name: "Passport", quantity: 1, packed: false },
            { name: "Travel Insurance", quantity: 1, packed: false },
            { name: "Flight Tickets", quantity: 1, packed: false }
          ]
        },
        {
          name: "Clothing",
          items: [
            { name: "T-shirts", quantity: 5, packed: false },
            { name: "Underwear", quantity: 5, packed: false },
            { name: "Socks", quantity: 5, packed: false }
          ]
        },
        {
          name: "Electronics",
          items: [
            { name: "Phone Charger", quantity: 1, packed: false },
            { name: "Power Bank", quantity: 1, packed: false }
          ]
        }
      ]
    };
    
    // Also set the flat list for backward compatibility
    packingList.value = [
      { name: 'Passport', quantity: 1, packed: false },
      { name: 'Clothes', quantity: 5, packed: false },
      { name: 'Phone Charger', quantity: 1, packed: false },
    ];
    
  } catch (error) {
    console.error('Error in load packing list process:', error);
    // Fallback to default items
    categorizedPackingList.value = {
      categories: [
        {
          name: "Essentials",
          items: [
            { name: 'Passport', quantity: 1, packed: false },
            { name: 'Clothes', quantity: 5, packed: false },
            { name: 'Phone Charger', quantity: 1, packed: false },
          ]
        }
      ]
    };
    
    packingList.value = [
      { name: 'Passport', quantity: 1, packed: false },
      { name: 'Clothes', quantity: 5, packed: false },
      { name: 'Phone Charger', quantity: 1, packed: false },
    ];
  }
};

// Add item to packing list from suggestion
const addPackingItemFromSuggestion = (itemName: string) => {
  // For categorized list
  if (categorizedPackingList.value.categories && categorizedPackingList.value.categories.length > 0) {
    // Try to find the item in any category
    let found = false;
    
    for (const category of categorizedPackingList.value.categories) {
      if (!category.items) continue;
      
      const existingItem = category.items.find((item: any) =>
        item.name.toLowerCase() === itemName.toLowerCase()
      );
      
      if (existingItem) {
        // Increment quantity if item already exists
        existingItem.quantity += 1;
        found = true;
        break;
      }
    }
    
    if (!found) {
      // Add to appropriate category based on item name
      let targetCategory;
      
      if (itemName.toLowerCase().includes('charger') ||
          itemName.toLowerCase().includes('adapter') ||
          itemName.toLowerCase().includes('electronic')) {
        targetCategory = categorizedPackingList.value.categories.find((c: any) => c.name === 'Electronics');
      } else if (itemName.toLowerCase().includes('passport') ||
                itemName.toLowerCase().includes('license') ||
                itemName.toLowerCase().includes('ticket')) {
        targetCategory = categorizedPackingList.value.categories.find((c: any) => c.name === 'Documents');
      } else if (itemName.toLowerCase().includes('shirt') ||
                itemName.toLowerCase().includes('pant') ||
                itemName.toLowerCase().includes('sock')) {
        targetCategory = categorizedPackingList.value.categories.find((c: any) => c.name === 'Clothing');
      } else {
        targetCategory = categorizedPackingList.value.categories.find((c: any) => c.name === 'Miscellaneous');
      }
      
      // If target category doesn't exist, use the first category or create Miscellaneous
      if (!targetCategory) {
        if (categorizedPackingList.value.categories.length > 0) {
          targetCategory = categorizedPackingList.value.categories[0];
        } else {
          targetCategory = { name: 'Miscellaneous', items: [] };
          categorizedPackingList.value.categories.push(targetCategory);
        }
      }
      
      // Add new item to category
      if (!targetCategory.items) targetCategory.items = [];
      targetCategory.items.push({
        name: itemName,
        quantity: 1,
        packed: false
      });
    }
  } else {
    // Fallback to flat list
    const existingItem = packingList.value.find(item =>
      item.name.toLowerCase() === itemName.toLowerCase()
    );
    
    if (existingItem) {
      // Increment quantity if item already exists
      existingItem.quantity += 1;
    } else {
      // Add new item
      packingList.value.push({
        name: itemName,
        quantity: 1,
        packed: false
      });
    }
  }
  
  savePackingList();
};

defineExpose({
  addPackingItemFromSuggestion
});

onMounted(() => {
  loadPackingList();
});
</script>