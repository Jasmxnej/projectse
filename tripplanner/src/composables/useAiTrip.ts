import { ref } from 'vue';
import axios from 'axios';
import { useTripStore } from '@/stores/trip';
import { getApiUrl } from '@/api';
import { mockAiResponse, mockTripRecommendations, getMockData, mockScheduleData } from './mockData';

interface Activity {
  name: string;
  time: string;
  cost: number;
  image: string;
  location: string;
  description: string;
}

interface ScheduleDay {
  day: number;
  activities: Activity[];
}

interface Recommendation {
  name: string;
  description: string;
  image: string;
  category?: string;
}

interface CategoryItem {
  name: string;
  items: Recommendation[];
}

interface AiResponse {
  schedule?: ScheduleDay[];
  recommendations?: Recommendation[];
  categories?: CategoryItem[];
}

interface MockResponse {
  isMock?: boolean;
  categories?: CategoryItem[];
  schedule?: ScheduleDay[];
  text?: string;
}

let idCounter = 0;
const generateUniqueId = () => Date.now() + idCounter++;

// Image cache to prevent duplicate requests
const imageCache = new Map<string, string>();

const fetchImage = async (placeName: string, delay = 0) => {
  // Check cache first
  const cacheKey = placeName.toLowerCase().trim();
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  try {
    // Add delay to prevent rate limiting
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    const response = await axios.get(`${getApiUrl('unsplash/image')}?place=${encodeURIComponent(placeName)}`, {
      timeout: 10000 // 10 second timeout
    });
    
    const imageUrl = response.data.image || `https://source.unsplash.com/featured/300x200/?${encodeURIComponent(placeName)},travel`;
    
    // Cache the result
    imageCache.set(cacheKey, imageUrl);
    return imageUrl;
  } catch (error) {
    console.error(`Failed to fetch image for ${placeName}:`, error);
    const fallbackUrl = `https://source.unsplash.com/featured/300x200/?${encodeURIComponent(placeName)},travel`;
    
    // Cache the fallback too
    imageCache.set(cacheKey, fallbackUrl);
    return fallbackUrl;
  }
};

export function useAiTrip() {
  const isGenerating = ref(false);
  const tripStore = useTripStore();
  const isMockData = ref(false);
  const errorMessage = ref('');

  const generateAITripPlan = async (generateSchedule = true, isAlternative = false, searchQuery = '', updateRecommendations = true) => {
    if (isGenerating.value) return;
    isGenerating.value = true;
    isMockData.value = false;
    errorMessage.value = '';

    let promptText;
    if (searchQuery) {
      promptText = `Generate recommendations for ${searchQuery} in ${tripStore.destination}. Respond ONLY with valid JSON in the following format: {"categories": [{"name": "Food", "items": [{"name": "Place Name", "description": "A brief description", "image": ""}]}, {"name": "Shopping", "items": [{"name": "Place Name", "description": "A brief description", "image": ""}]}, {"name": "Culture", "items": [{"name": "Place Name", "description": "A brief description", "image": ""}]}, {"name": "Entertainment", "items": [{"name": "Place Name", "description": "A brief description", "image": ""}]}]}. Do not add explanations or comments.`;
    } else if (!generateSchedule) {
      // Only generate recommendations/categories
      promptText = `Generate travel recommendations for ${tripStore.destination}. Respond ONLY with valid JSON in the following format: {"categories": [{"name": "Food & Drinks", "items": [{"name": "Item Name", "description": "Brief description (1-2 sentences)", "image": ""}]}, {"name": "Shopping", "items": [{"name": "Item Name", "description": "Brief description (1-2 sentences)", "image": ""}]}, {"name": "Local Tips", "items": [{"name": "Tip Name", "description": "Brief description (1-2 sentences)", "image": ""}]}, {"name": "Famous Activities", "items": [{"name": "Activity Name", "description": "Brief description (1-2 sentences)", "image": ""}]}, {"name": "Recommended Places", "items": [{"name": "Famous Place Name", "description": "Brief description of this real famous place in ${tripStore.destination} (1-2 sentences)", "suggestedTime": "09:00", "estimatedCost": 50, "image": ""}]}]}. Include exactly 5 real famous places in the Recommended Places category, such as major landmarks, attractions, or must-visit spots in ${tripStore.destination}. For each place, include a suggested visit time (HH:MM format) and estimated cost in THB. Do not include schedule. Do not add explanations or comments.`;
    } else {
      // Full prompt for schedule and recommendations
      promptText = `Generate a travel schedule for a trip to ${tripStore.destination} from ${tripStore.startDate} to ${tripStore.endDate} for ${tripStore.groupSize} people with a budget of ${tripStore.budget} and interests in ${tripStore.activities.join(', ')}. Respond ONLY with valid JSON in the following format: {"schedule": [{"day": 1, "activities": [{"name": "Place Name", "time": "09:00", "cost": 100, "image": "", "location": "City Center", "description": "A brief description."}]}],"categories": [{"name": "Food & Drinks", "items": [{"name": "Item Name", "description": "Brief description (1-2 sentences)", "image": ""}]}, {"name": "Shopping", "items": [{"name": "Item Name", "description": "Brief description (1-2 sentences)", "image": ""}]}, {"name": "Local Tips", "items": [{"name": "Tip Name", "description": "Brief description (1-2 sentences)", "image": ""}]}, {"name": "Famous Activities", "items": [{"name": "Activity Name", "description": "Brief description (1-2 sentences)", "image": ""}]}, {"name": "Recommended Places", "items": [{"name": "Famous Place Name", "description": "Brief description of this real famous place in ${tripStore.destination} (1-2 sentences)", "suggestedTime": "09:00", "estimatedCost": 50, "image": ""}]}]}. Include exactly 5 real famous places in the Recommended Places category, such as major landmarks, attractions, or must-visit spots in ${tripStore.destination}. For each place, include a suggested visit time (HH:MM format) and estimated cost in THB. Do not add explanations or comments.`;

      // Exclude existing recommended places from schedule
      const recommendedCategory = tripStore.recommendedItems.categories?.find(cat => cat.name === "Recommended Places");
      if (recommendedCategory && recommendedCategory.items.length > 0) {
        const excludedPlaces = recommendedCategory.items.map(item => item.name).join(', ');
        promptText += `\n\nDo not include any of these recommended places in the schedule activities: ${excludedPlaces}. Choose completely different activities and places that complement but do not overlap with the recommendations. Generate a diverse schedule with more unique places across multiple days.`;
      }
    }

    if (isAlternative && !searchQuery && generateSchedule) {
      const currentActivities = tripStore.tripDays.flatMap(day => day.activities.map((activity: any) => activity.name)).join(', ');
      promptText = promptText.replace('Generate a travel schedule', 'Generate 5 alternative recommendations different from the current plan which includes these activities: ' + currentActivities + '. Focus only on the "Recommended Places" category with 5 new, different places.');
      // Set generateSchedule to false for alternatives
      generateSchedule = false;
    }

    const prompt = {
      contents: [{ parts: [{ text: promptText }] }]
    };

    try {
      const payload = {
        prompt,
        apiKey: import.meta.env.VITE_GEMINI_API_KEY,
      };
      const response = await axios.post(getApiUrl('gemini/generate'), payload);
      
      const generatedData: AiResponse = response.data;

      if (!generatedData) {
        console.error('No data in AI response:', response.data);
        throw new Error('The AI response was empty');
      }

      if (generateSchedule && generatedData.schedule) {
        await tripStore.saveTrip();

        const allActivities = generatedData.schedule.flatMap(day => day.activities);
        const images = await Promise.all(
          allActivities.map((activity, index) => fetchImage(activity.name, index * 500))
        );

        let imageIndex = 0;
        const updatedTripDays = generatedData.schedule.map(day => ({
          id: generateUniqueId(),
          dayNumber: day.day,
          name: `Day ${day.day}`,
          activities: day.activities.map(activity => ({
            id: generateUniqueId(),
            name: activity.name,
            time: activity.time,
            cost: activity.cost,
            image: images[imageIndex++],
            location: activity.location,
            description: activity.description,
          })),
        }));

        tripStore.setTripDays(updatedTripDays);
      }

      // Handle both old and new recommendation formats only if updateRecommendations is true
      if (updateRecommendations && (generatedData.recommendations || generatedData.categories)) {
        if (generatedData.categories) {
          // New format with categories
          const allRecommendations = generatedData.categories.flatMap(category => category.items);
          const recommendationImages = await Promise.all(
            allRecommendations.map((rec, index) => fetchImage(rec.name, index * 300))
          );
          
          let imageIndex = 0;
          const updatedCategories = generatedData.categories.map(category => ({
            name: category.name,
            items: category.items.map(item => ({
              id: generateUniqueId(),
              ...item,
              image: recommendationImages[imageIndex++],
            }))
          }));
          
          const result = { categories: updatedCategories, isMock: false };
          tripStore.setRecommendedItems(result);
        } else if (generatedData.recommendations) {
          // Old format without categories
          const recommendationImages = await Promise.all(
            generatedData.recommendations.map((rec, index) => fetchImage(rec.name, index * 300))
          );
  
          // Convert to categorized format
          const categorizedRecommendations = {
            categories: [
              {
                name: "Recommendations",
                items: generatedData.recommendations.map((rec, index) => ({
                  id: generateUniqueId(),
                  ...rec,
                  image: recommendationImages[index],
                }))
              }
            ],
            isMock: false
          };
          
          tripStore.setRecommendedItems(categorizedRecommendations);
        }
      }

    } catch (error) {
      console.error('Error generating AI plan:', error);
      isMockData.value = true;
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 500) {
          errorMessage.value = 'The AI service is currently unavailable. Using mock data for demonstration.';
        } else if (error.response?.status === 429) {
          errorMessage.value = 'You have exceeded the request limit. Using mock data instead.';
        } else {
          errorMessage.value = `API error: ${error.response?.status || 'Unknown'}. Using mock data instead.`;
        }
      } else {
        errorMessage.value = 'Failed to generate AI plan. Using mock data instead.';
      }
      
      // Show alert about using mock data
      alert(errorMessage.value);
      
      // Use mock data
      let mockData: MockResponse = searchQuery ? mockTripRecommendations : mockAiResponse;
      
      if (generateSchedule && mockScheduleData.schedule) {
        await tripStore.saveTrip();
  
        const allActivities = mockScheduleData.schedule.flatMap(day => day.activities);
        const images = await Promise.all(
          allActivities.map((activity, index) => fetchImage(activity.name, index * 500))
        );
  
        let imageIndex = 0;
        const updatedTripDays = mockScheduleData.schedule.map(day => ({
          id: generateUniqueId(),
          dayNumber: day.day,
          name: `Day ${day.day}`,
          activities: day.activities.map(activity => ({
            id: generateUniqueId(),
            name: activity.name,
            time: activity.time,
            cost: activity.cost,
            image: images[imageIndex++],
            location: activity.location,
            description: activity.description,
          })),
        }));
  
        tripStore.setTripDays(updatedTripDays);
      }
  
      // Use mock recommendations with categories only if updateRecommendations
      if (updateRecommendations) {
        const mockRecommendations = getMockData('recommendations') as MockResponse;
        const result = {
          categories: mockRecommendations.categories || [],
          isMock: true
        };
        tripStore.setRecommendedItems(result);
      }
    } finally {
      isGenerating.value = false;
    }
  };

  const searchPois = async (query: string) => {
    if (!tripStore.destination) return;
    
    try {
      // Use Gemini AI to generate search recommendations instead of Amadeus
      const promptText = `Generate 5 specific real places in ${tripStore.destination} that match the search term "${query}". For each place, provide a name, a brief description (1-2 sentences), and leave the image field empty. Respond ONLY with valid JSON in the following format: {"categories": [{"name": "Search Results", "items": [{"name": "Famous Place Name", "description": "Brief description of this real place in ${tripStore.destination} (1-2 sentences)", "image": ""}]}]}. Do not add explanations or comments.`;
      
      const prompt = {
        contents: [{ parts: [{ text: promptText }] }]
      };
      
      const payload = {
        prompt,
        apiKey: import.meta.env.VITE_GEMINI_API_KEY,
      };
      
      const response = await axios.post(getApiUrl('gemini/generate'), payload);
      const generatedData: AiResponse = response.data;
      
      if (generatedData.categories) {
        const allRecommendations = generatedData.categories.flatMap(category => category.items);
        const recommendationImages = await Promise.all(
          allRecommendations.map((rec, index) => fetchImage(rec.name, index * 300))
        );
        
        let imageIndex = 0;
        const updatedCategories = generatedData.categories.map(category => ({
          name: category.name,
          items: category.items.map(item => ({
            id: generateUniqueId(),
            ...item,
            image: recommendationImages[imageIndex++],
          }))
        }));
        
        const result = { categories: updatedCategories, isMock: false };
        tripStore.setRecommendedItems(result);
      } else {
        // If no results found, show a message
        const noResultsPoi = {
          categories: [
            {
              name: "Search Results",
              items: [{
                id: generateUniqueId(),
                name: "No matching places found",
                description: `No places matching "${query}" found in ${tripStore.destination}. Try a different search term.`,
                image: `https://source.unsplash.com/featured/300x200/?${tripStore.destination},travel`
              }]
            }
          ]
        };
        tripStore.setRecommendedItems(noResultsPoi);
      }
    } catch (error) {
      console.error('Error generating AI search recommendations:', error);
      isMockData.value = true;
      
      // Don't show alert, just use fallback data silently
      errorMessage.value = 'Error generating search recommendations. Using mock data instead.';
      
      // Fallback to mock data if Gemini fails
      if (query.length > 1) {
        // Use destination-specific mock data based on the query
        const mockItems = [];
        
        // Create mock items based on the destination and query
        if (tripStore.destination.toLowerCase().includes('bangkok')) {
          mockItems.push(
            { name: "MBK Center", description: "Popular shopping mall with hundreds of stores selling electronics, clothing, and souvenirs.", image: `https://source.unsplash.com/featured/300x200/?bangkok,shopping` },
            { name: "Chatuchak Weekend Market", description: "One of the world's largest weekend markets with over 8,000 stalls selling everything from clothing to antiques.", image: `https://source.unsplash.com/featured/300x200/?bangkok,market` },
            { name: "Siam Paragon", description: "Luxury shopping mall with high-end brands, restaurants, and an aquarium.", image: `https://source.unsplash.com/featured/300x200/?bangkok,mall` }
          );
        } else if (tripStore.destination.toLowerCase().includes('chiang mai')) {
          mockItems.push(
            { name: "Night Bazaar", description: "Famous night market with local crafts, clothing, and food stalls.", image: `https://source.unsplash.com/featured/300x200/?chiangmai,market` },
            { name: "Doi Suthep", description: "Sacred temple on a mountain with panoramic views of the city.", image: `https://source.unsplash.com/featured/300x200/?chiangmai,temple` },
            { name: "Old City", description: "Historic center surrounded by ancient walls and moats, filled with temples and cafes.", image: `https://source.unsplash.com/featured/300x200/?chiangmai,oldcity` }
          );
        } else if (tripStore.destination.toLowerCase().includes('phuket')) {
          mockItems.push(
            { name: "Patong Beach", description: "Popular beach with water sports, restaurants, and nightlife.", image: `https://source.unsplash.com/featured/300x200/?phuket,beach` },
            { name: "Big Buddha", description: "45-meter tall marble statue with panoramic views of the island.", image: `https://source.unsplash.com/featured/300x200/?phuket,buddha` },
            { name: "Old Phuket Town", description: "Historic district with colorful Sino-Portuguese buildings, shops, and restaurants.", image: `https://source.unsplash.com/featured/300x200/?phuket,oldtown` }
          );
        } else {
          // Generic Thailand items
          mockItems.push(
            { name: "Local Market", description: "Vibrant market with fresh produce, street food, and local crafts.", image: `https://source.unsplash.com/featured/300x200/?thailand,market` },
            { name: "Buddhist Temple", description: "Beautiful temple with ornate decorations and peaceful atmosphere.", image: `https://source.unsplash.com/featured/300x200/?thailand,temple` },
            { name: "Beach Resort", description: "Relaxing beachfront resort with stunning ocean views.", image: `https://source.unsplash.com/featured/300x200/?thailand,beach` }
          );
        }
        
        // Filter mock items by query
        const filteredItems = mockItems.filter(item =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
        );
        
        // If no matches, show all items
        const finalItems = filteredItems.length > 0 ? filteredItems : mockItems;
        
        // Add unique IDs to items
        const itemsWithIds = finalItems.map(item => ({
          id: generateUniqueId(),
          ...item
        }));
        
        const result = {
          categories: [{
            name: "Search Results",
            items: itemsWithIds
          }],
          isMock: true
        };
        
        tripStore.setRecommendedItems(result);
      } else {
        // For very short queries, show a message to type more
        const shortQueryMessage = {
          categories: [
            {
              name: "Search Results",
              items: [{
                id: generateUniqueId(),
                name: "Continue typing to search",
                description: "Please enter at least 2 characters to search for places.",
                image: `https://source.unsplash.com/featured/300x200/?${tripStore.destination},travel`
              }]
            }
          ]
        };
        tripStore.setRecommendedItems(shortQueryMessage);
      }
    }
  };

  return {
    isGenerating,
    isMockData,
    errorMessage,
    generateAITripPlan,
    searchPois,
  };
}