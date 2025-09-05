<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-4">Local Recommendations</h2>
    <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
      <div v-if="isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500 mx-auto mb-4"></div>
        <p class="text-gray-500">Generating local recommendations...</p>
      </div>
      
      <!-- Numbered Recommendations List -->
      <div v-else-if="categorizedRecommendations.categories && categorizedRecommendations.categories.length > 0 && !categorizedRecommendations.categories[0].name.includes('Search Results')" class="space-y-8">
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Local Insights for {{ destination }}</h3>
          <p class="text-gray-600">Here's what you should know about {{ destination }} to enhance your trip experience:</p>
        </div>
        
        <div v-for="(category, categoryIndex) in categorizedRecommendations.categories" :key="categoryIndex" class="space-y-4">
          <h3 class="text-xl font-bold text-gray-800 border-b pb-2">{{ category.name }}</h3>
          
          <!-- Numbered list format -->
          <div class="space-y-4">
            <div v-for="(item, itemIndex) in category.items" :key="itemIndex" class="bg-white rounded-lg shadow-md p-4 border-l-4 border-teal-500">
              <div class="flex items-start space-x-4">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {{ itemIndex + 1 }}
                  </div>
                </div>
                <div class="flex-grow">
                  <h4 class="text-lg font-bold text-gray-800 mb-2">{{ item.name }}</h4>
                  <p class="text-gray-700 text-sm leading-relaxed">{{ item.description }}</p>
                </div>
                <div class="flex-shrink-0 w-20 h-20">
                  <img :key="item.id"
                       :src="getImageUrl(item, category.name)"
                       :alt="item.name"
                       class="w-full h-full object-cover rounded-lg"
                       @error="(e) => handleRecommendationImageError(e, item, category.name)"
                       @load="item.imageLoaded = true" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Legacy Flat Recommendations (Fallback) -->
      <div v-else-if="localRecommendations.length > 0" class="space-y-6">
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Must-Visit Places in {{ destination }}</h3>
          <p class="text-gray-600 mb-4">Here are some local recommendations to enhance your trip experience:</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="(rec, index) in localRecommendations" :key="index" class="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
            <div class="relative h-48">
              <!-- Image loading skeleton -->
              <div v-if="!rec.imageLoaded" class="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <!-- Actual image -->
              <img :key="rec.id"
                   :src="getImageUrl(rec, rec.category || '')"
                   :alt="rec.name"
                   class="w-full h-48 object-cover"
                   @error="(e) => handleRecommendationImageError(e, rec, rec.category || '')"
                   @load="rec.imageLoaded = true" />
              <span class="absolute top-2 right-2 px-2 py-1 bg-teal-600 text-white text-xs font-bold rounded">{{ rec.category }}</span>
            </div>
            <div class="p-4 flex-grow">
              <h3 class="text-xl font-bold text-gray-800 mb-2">{{ rec.name }}</h3>
              <div class="flex items-center mb-3">
                <span class="text-yellow-400 mr-1">★★★★</span>
                <span class="text-gray-400">★</span>
                <span class="text-gray-600 text-sm ml-1">Local favorite</span>
              </div>
              <p class="text-gray-700">{{ rec.description }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-8">
        <p class="text-gray-500">No recommendations found. Please try again.</p>
        <button @click="fetchLocalRecommendations" class="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg">
          Refresh Recommendations
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps({
  destination: {
    type: String,
    required: true
  },
  useSavedData: {
    type: Boolean,
    default: false
  },
  tripId: {
    type: [String, Number],
    default: null
  }
});

const emit = defineEmits(['data-updated']);

// Local recommendations
const localRecommendations = ref<any[]>([]);
const categorizedRecommendations = ref<any>({ categories: [] });
const isLoading = ref(false);

// Function to get the correct image URL
const getImageUrl = (item: any, categoryName: string) => {
  if (!item) return '';

  // Check if image exists and is a valid URL
  if (item.image) {
    // If it's a full URL (starts with http:// or https://)
    if (item.image.startsWith('http://') || item.image.startsWith('https://')) {
      return item.image;
    }

    // If it's a relative URL, make it absolute
    if (item.image.startsWith('/')) {
      return `${window.location.origin}${item.image}`;
    }

    // If it's just a filename, assume it's in the public folder
    return `${window.location.origin}/${item.image}`;
  }

  // If item already has a cachedImageUrl (from error handling), use that
  if (item.cachedImageUrl) {
    return item.cachedImageUrl;
  }

  // Initialize imageLoaded property
  if (item.imageLoaded === undefined) {
    item.imageLoaded = false;
  }

  // Prevent multiple API calls for the same item
  if (item.imageApiCalled) {
    // Return placeholder if API was already called
    const itemName = item.name || 'attraction';
    return `https://via.placeholder.com/640x360/e5e7eb/6b7280?text=${encodeURIComponent(itemName)}`;
  }

  // Start loading image from Unsplash API asynchronously
  if (!item.imageLoading) {
    item.imageLoading = true;
    item.imageApiCalled = true;
    loadImageFromUnsplash(item, categoryName);
  }

  // Return placeholder while loading
  const itemName = item.name || 'attraction';
  return `https://via.placeholder.com/640x360/e5e7eb/6b7280?text=${encodeURIComponent(itemName)}`;
};

// Async function to load image from Unsplash API
const loadImageFromUnsplash = async (item: any, categoryName: string) => {
  const destination = props.destination || 'travel';
  const itemName = item.name || 'attraction';
  
  // Create more specific search terms based on category
  let searchTerms = '';
  if (categoryName.includes('Food')) {
    searchTerms = `${itemName} ${destination} food cuisine`;
  } else if (categoryName.includes('Shopping')) {
    searchTerms = `${itemName} ${destination} souvenir market`;
  } else if (categoryName.includes('Tips')) {
    searchTerms = `${destination} culture tradition local`;
  } else if (categoryName.includes('Activities')) {
    searchTerms = `${itemName} ${destination} activity tourism`;
  } else {
    searchTerms = `${itemName} ${destination}`;
  }
  
  try {
    // Use the backend Unsplash API endpoint
    const response = await axios.get(`http://localhost:3002/api/unsplash/image?place=${encodeURIComponent(searchTerms)}&type=attraction`);
    const imageUrl = response.data.image;
    
    if (imageUrl) {
      // Store the URL in the item
      item.cachedImageUrl = imageUrl;
      item.image = imageUrl;
      item.imageLoaded = true; // Mark as loaded
    }
  } catch (error) {
    console.error('Error fetching image from Unsplash API:', error);
    // Keep the placeholder image on error
  } finally {
    item.imageLoading = false;
  }
};

// Function to get a clean category label
const getCategoryLabel = (categoryName: string) => {
  if (categoryName.includes('Food')) return 'FOOD';
  if (categoryName.includes('Shopping')) return 'SHOPPING';
  if (categoryName.includes('Tips')) return 'TIPS';
  if (categoryName.includes('Activities')) return 'ACTIVITY';
  return categoryName.split(' ')[0].toUpperCase();
};

// Fetch local recommendations
const fetchLocalRecommendations = async () => {
  if (!props.destination) return;
  
  isLoading.value = true;
  localRecommendations.value = [];
  categorizedRecommendations.value = { categories: [] };
  
  try {
    // Use Gemini to generate categorized recommendations
    const response = await axios.post('http://localhost:3002/api/gemini/generate', {
      prompt: {
        contents: [{
          parts: [{
            text: `Create a comprehensive local guide for tourists visiting ${props.destination}.
            Organize the information into EXACTLY these 4 categories (no more, no less):
            
            1. Food & Drinks (EXACTLY 5 items including local dishes, desserts, drinks, seasonal fruits/specialties)
            2. Shopping (EXACTLY 5 souvenirs and local products to buy as gifts, NOT shopping places)
            3. Local Tips (EXACTLY 5 useful phrases, cultural etiquette, things to know to prevent culture shock)
            4. Famous Activities (EXACTLY 5 specific activities like massage, cooking class, craft workshops, dance lessons - NOT places to visit)
            
            For each category, provide EXACTLY 5 specific items with:
            - For Famous Activities, focus on hands-on experiences and activities (NOT places or attractions)
            - Name
            - Brief description (1-2 sentences in simple language)
            - Leave the image field empty, it will be filled with Unsplash images
            
            Format your response as a JSON object with this structure:
            {
              "categories": [
                {
                  "name": "Category Name",
                  "items": [
                    {
                      "name": "Item Name",
                      "description": "Item description",
                      "image": ""
                    }
                  ]
                }
              ]
            }`
          }]
        }]
      },
      apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    });
    
    if (response.data && response.data.categories) {

      categorizedRecommendations.value = response.data;
      emit('data-updated', response.data);
    } else if (response.data && response.data.text) {
      // Try to parse the text response as JSON
      try {
        const parsedData = JSON.parse(response.data.text);
        if (parsedData && parsedData.categories) {
          categorizedRecommendations.value = parsedData;
        } else if (Array.isArray(parsedData)) {
          // Convert array format to categorized format
          localRecommendations.value = parsedData;
          categorizedRecommendations.value = {
            categories: [
              {
                name: "Places to Visit",
                items: parsedData
              }
            ]
          };
        }
      } catch (parseError) {
        console.error('Error parsing recommendations JSON:', parseError);
        // Generate fallback recommendations
        generateFallbackRecommendations();
      }
    } else if (response.data && Array.isArray(response.data.recommendations)) {
      // Handle legacy format
      localRecommendations.value = response.data.recommendations;
      // Convert to categorized format
      categorizedRecommendations.value = {
        categories: [
          {
            name: "Places to Visit",
            items: response.data.recommendations
          }
        ]
      };
    } else {
      // Generate fallback recommendations
      generateFallbackRecommendations();
    }
  } catch (error) {
    console.error('Error fetching local recommendations:', error);
    // Generate fallback recommendations
    generateFallbackRecommendations();
  } finally {
    isLoading.value = false;
  }
};

// Generate fallback recommendations if API fails
const generateFallbackRecommendations = () => {
  const destination = props.destination || 'Bangkok';
  
  // Create categorized recommendations with exactly the 4 required categories
  categorizedRecommendations.value = {
    categories: [
      {
        name: "Food & Drinks",
        items: [
          {
            name: "Street Food Tasting",
            description: `Try the delicious local street food at markets and food stalls throughout ${destination}. Look for busy stalls with locals to find the best options.`,
            image: ""
          },
          {
            name: "Traditional Main Dishes",
            description: `Don't miss the opportunity to taste authentic local dishes at traditional restaurants. These represent the heart of ${destination}'s culinary culture.`,
            image: ""
          },
          {
            name: "Local Desserts",
            description: `Sample the sweet treats and desserts that are popular in ${destination}. Many use local ingredients like coconut, tropical fruits, or rice.`,
            image: ""
          },
          {
            name: "Seasonal Fruits",
            description: `Try the fresh seasonal fruits available at local markets in ${destination}. They're often sweeter and more flavorful than imported varieties.`,
            image: ""
          },
          {
            name: "Traditional Beverages",
            description: `Discover local drinks, teas, or specialty beverages that are unique to ${destination}. These often have cultural significance and unique flavors.`,
            image: ""
          }
        ]
      },
      {
        name: "Shopping",
        items: [
          {
            name: "Traditional Handicrafts",
            description: `Look for handmade souvenirs created by local artisans. These unique items make meaningful gifts and support local craftspeople.`,
            image: ""
          },
          {
            name: "Local Textiles",
            description: `Discover beautiful fabrics, clothing, and textile products unique to ${destination}. Look for traditional patterns and high-quality materials.`,
            image: ""
          },
          {
            name: "Food Souvenirs",
            description: `Bring home local spices, snacks, or packaged foods that represent ${destination}'s flavors. These make great gifts for food-loving friends.`,
            image: ""
          },
          {
            name: "Artisanal Jewelry",
            description: `Look for jewelry made with local materials or traditional designs. These pieces can be beautiful reminders of your trip.`,
            image: ""
          },
          {
            name: "Local Art & Crafts",
            description: `Find unique paintings, sculptures, or decorative items created by local artists. These one-of-a-kind pieces capture the essence of ${destination}.`,
            image: ""
          }
        ]
      },
      {
        name: "Local Tips",
        items: [
          {
            name: "Essential Phrases",
            description: `Learn basic greetings like "hello," "thank you," and "please" in the local language. Even simple phrases are appreciated by locals.`,
            image: ""
          },
          {
            name: "Cultural Etiquette",
            description: `Respect local customs such as appropriate dress at temples, removing shoes when entering homes, and using proper hand gestures.`,
            image: ""
          },
          {
            name: "Transportation Tips",
            description: `The most convenient ways to get around ${destination} are public transportation and taxis. Learn how to negotiate fares before starting your journey.`,
            image: ""
          },
          {
            name: "Safety Advice",
            description: `Stay safe by keeping valuables secure, being aware of common scams, and having emergency contacts saved in your phone.`,
            image: ""
          },
          {
            name: "Money & Tipping",
            description: `Understand the local currency, typical tipping practices, and where to exchange money for the best rates in ${destination}.`,
            image: ""
          }
        ]
      },
      {
        name: "Famous Activities",
        items: [
          {
            name: "Traditional Massage",
            description: `Experience the healing and relaxation of traditional massage techniques that have been practiced for generations in ${destination}.`,
            image: ""
          },
          {
            name: "Handcraft Workshop",
            description: `Learn to create local handicrafts like pottery, weaving, or carving from skilled artisans who preserve traditional techniques.`,
            image: ""
          },
          {
            name: "Cooking Class",
            description: `Join a cooking class to learn how to prepare authentic local dishes using traditional ingredients and cooking methods.`,
            image: ""
          },
          {
            name: "Cultural Dance Lesson",
            description: `Take part in a traditional dance lesson to learn the movements and meanings behind the cultural dances of ${destination}.`,
            image: ""
          },
          {
            name: "Local Music Experience",
            description: `Learn to play traditional musical instruments or attend live performances to immerse yourself in the musical culture of ${destination}.`,
            image: ""
          }
        ]
      }
    ]
  };
  
  // Also set the flat list for backward compatibility
  localRecommendations.value = [
    {
      name: `${destination} Historical Museum`,
      category: 'Museum',
      description: `Learn about the rich history and culture of ${destination} through interactive exhibits and artifacts.`,
      image: `https://source.unsplash.com/640x360/?${destination.toLowerCase()},museum`
    },
    {
      name: `${destination} Night Market`,
      category: 'Shopping',
      description: `Experience local cuisine, crafts, and entertainment at the famous night market in ${destination}.`,
      image: `https://source.unsplash.com/640x360/?${destination.toLowerCase()},market`
    },
    {
      name: `${destination} Central Park`,
      category: 'Nature',
      description: `Relax in the beautiful green spaces and gardens in the heart of ${destination}.`,
      image: `https://source.unsplash.com/640x360/?${destination.toLowerCase()},park`
    },
    {
      name: `${destination} Cultural Center`,
      category: 'Arts',
      description: `Enjoy traditional performances and art exhibitions showcasing the local culture of ${destination}.`,
      image: `https://source.unsplash.com/640x360/?${destination.toLowerCase()},culture`
    }
  ];
};

const handleRecommendationImageError = async (e: Event, item: any, categoryName: string) => {
  const target = e.target as HTMLImageElement;
  if (target && !item.imageErrorHandled) {
    item.imageErrorHandled = true;
    const itemName = item.name || target.alt || 'attraction';
    const destination = props.destination || 'travel';

    // Prevent multiple API calls for the same item
    if (item.imageApiCalled) {
      // Use placeholder if API was already called
      const placeholderUrl = `https://via.placeholder.com/640x360/e5e7eb/6b7280?text=${encodeURIComponent(itemName)}`;
      item.cachedImageUrl = placeholderUrl;
      target.src = placeholderUrl;
      target.onerror = null; // Prevent infinite error loop
      item.imageLoaded = true;
      return;
    }

    // Mark that we're attempting to fetch an image
    item.imageApiCalled = true;

    // Try to get a new image from Unsplash API with generic search
    try {
      const searchTerms = `${destination} travel`;
      const response = await axios.get(`http://localhost:3002/api/unsplash/image?place=${encodeURIComponent(searchTerms)}&type=attraction`);
      const imageUrl = response.data.image;

      if (imageUrl && imageUrl !== target.src) {
        item.cachedImageUrl = imageUrl;
        target.src = imageUrl;
        item.imageLoaded = true;
        return;
      }
    } catch (error) {
      console.error('Error fetching fallback image from Unsplash API:', error);
    }

    // Final fallback to placeholder
    const placeholderUrl = `https://via.placeholder.com/640x360/e5e7eb/6b7280?text=${encodeURIComponent(itemName)}`;
    item.cachedImageUrl = placeholderUrl;
    target.src = placeholderUrl;
    target.onerror = null; // Prevent infinite error loop
    item.imageLoaded = true;
  }
};

// Generate recommendations when component is mounted
onMounted(() => {
  fetchLocalRecommendations();
});
</script>