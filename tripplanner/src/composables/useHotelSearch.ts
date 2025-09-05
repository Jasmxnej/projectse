import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { checkAPIConnection } from '@/api';
import { useTripStore } from '@/stores/trip';
import type { Hotel } from '@/types/hotel';
import { useGemini } from './gemini';
import { getMockData } from './mockData';

export function useHotelSearch() {
  const router = useRouter();
  const tripStore = useTripStore();
  const hotels = ref<Hotel[]>([]);
  const searchParams = ref<any>(null);
  const selectedHotel = ref<Hotel | null>(null);
  const selectedHotelDetails = ref<Hotel | null>(null);
  const isLoading = ref(false);
  const currentPage = ref(1);
  const hotelsPerPage = 6; // Increased to show at least 6 hotels per page
  const totalPages = ref(1);
  const { generatedContent, generateContent } = useGemini();

  const fetchImagesFromUnsplash = async (placeName: string) => {
    try {
      const response = await axios.get(`http://localhost:3002/api/unsplash/image?place=${encodeURIComponent(placeName)}`);
      const baseImage = response.data?.image;
      if (baseImage) {
        return baseImage;
      } else {
        const keyword = placeName?.split(' ')[0] || 'hotel';
        return `https://source.unsplash.com/640x360/?${keyword},resort`;
      }
    } catch (error) {
      console.error(`Failed to fetch images for ${placeName}:`, error);
      const keyword = placeName?.split(' ')[0] || 'hotel';
      return `https://source.unsplash.com/640x360/?${keyword},resort`;
    }
  };

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
      fetchHotelOptions(searchParams.value!, false);
    }
  };

  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
      fetchHotelOptions(searchParams.value!, false);
    }
  };

  const plannedExpenses = computed(() => {
    const hotelCost = selectedHotel.value?.price || 0;
    const flightCost = tripStore.flightCost || 0;
    return {
      plan: 0,
      flight: flightCost,
      hotel: hotelCost,
      total: flightCost + hotelCost,
    };
  });

  const isSelected = (hotel: Hotel) => {
    return selectedHotel.value?.id === hotel.id;
  };

  const fetchHotelOptions = async (params: any, newSearch = true) => {
    isLoading.value = true;
    if (newSearch) {
      currentPage.value = 1;
      hotels.value = Array(hotelsPerPage).fill({});
    }

    let payload = {
      cityCode: params.cityCode,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      adults: params.adults,
      page: currentPage.value,
      limit: hotelsPerPage,
    };

    try {
      searchParams.value = params;
      const response = await axios.post('http://localhost:3002/api/amadeus/hotels', payload);
      const hotelData = response.data?.data || [];
      const totalItems = response.data?.total || hotelData.length;
      totalPages.value = Math.max(1, Math.ceil(totalItems / hotelsPerPage));

      hotels.value = await Promise.all(hotelData.map(async (entry: any) => {
        const hotel = entry.hotel;
        const offer = entry.offers?.[0];
        
        // Improve image matching by using more specific hotel name keywords
        let imageKeyword = hotel.name || '';
        // Extract the hotel brand/chain name if possible
        const hotelNameParts = imageKeyword.split(' ');
        if (hotelNameParts.length > 1) {
          // Use first two words of hotel name for better matching
          imageKeyword = hotelNameParts.slice(0, 2).join(' ');
        }
        
        const image = await fetchImagesFromUnsplash(imageKeyword || hotel.cityCode || 'hotel');

        return {
          id: hotel.hotelId,
          name: hotel.name,
          price: parseFloat(offer?.price?.total || 0),
          currency: offer?.price?.currency || 'THB',
          description: offer?.room?.description?.text || 'No description available.',
          image,
          location: hotel.cityCode || 'N/A',
          rating: hotel.rating || null,
          amenities: [],
          contact: hotel.contact || {},
          checkInDate: offer?.checkInDate || params.checkInDate,
          checkOutDate: offer?.checkOutDate || params.checkOutDate,
          adults: offer?.guests?.adults || params.adults,
          cityCode: hotel.cityCode,
          room: {
            type: offer?.room?.type,
            beds: offer?.room?.typeEstimated?.beds,
            bedType: offer?.room?.typeEstimated?.bedType,
            description: offer?.room?.description?.text,
          },
          policies: {
            cancellation: offer?.policies?.cancellations?.[0],
            payment: offer?.policies?.guarantee,
          },
        };
      }));

    } catch (error) {
      console.error('Error fetching hotels:', error);
      
      // Show alert about using mock data
      alert('There was an error connecting to the Amadeus API. Using mock data instead.');
      
      try {
        // First try Gemini
        const prompt = `Generate hotel options for a trip. Search parameters: ${JSON.stringify(payload)}. Format response like Amadeus with "data" and "totalPages".`;
        await generateContent(prompt, import.meta.env.VITE_GEMINI_API_KEY);
        const geminiData = generatedContent.value;
        if (geminiData && Array.isArray(geminiData.data)) {
          totalPages.value = geminiData.totalPages || 1;
          hotels.value = geminiData.data;
        } else {
          // If Gemini fails, use our static mock data
          console.error("Invalid Gemini response, using static mock data:", geminiData);
          const mockResponse = getMockData('hotels', { cityCode: params.cityCode }) as {
            data: Hotel[],
            totalPages: number,
            isMock: boolean
          };
          hotels.value = mockResponse.data;
          totalPages.value = mockResponse.totalPages || 1;
        }
      } catch (geminiE) {
        console.error('Error with Gemini fallback, using static mock data:', geminiE);
        const mockResponse = getMockData('hotels', { cityCode: params.cityCode }) as {
          data: Hotel[],
          totalPages: number,
          isMock: boolean
        };
        hotels.value = mockResponse.data;
        totalPages.value = mockResponse.totalPages || 1;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const showHotelDetails = (hotel: Hotel) => {
    selectedHotelDetails.value = hotel;
  };

  const handleHotelSelected = (hotel: Hotel) => {
    const transformed = {
      ...hotel,
      description: hotel.description || 'No description available',
      price: hotel.price || 0,
      currency: hotel.currency || 'USD',
      image_url: hotel.image || '',
      rating: hotel.rating || 0,
      amenities: hotel.amenities || [],
      room: hotel.room || {},
      policies: hotel.policies || {},
    };
    selectedHotel.value = transformed;
    tripStore.setHotelCost(transformed.price);
    tripStore.setHotel(transformed);
    saveSelectedHotel(transformed);
  };

  const saveSelectedHotel = async (hotel: Hotel) => {
    const isApiAvailable = await checkAPIConnection();
    if (isApiAvailable) {
      try {
        await axios.post(`http://localhost:3002/api/trips/${tripStore.tripId}/hotel`, {
          hotel: { ...hotel },
          trip_id: tripStore.tripId
        });
        await axios.put(`http://localhost:3002/api/trips/${tripStore.tripId}/budget`, {
          total_budget: tripStore.initialBudget,
          planned_expenses: plannedExpenses.value.total,
        });
        
        // Check if we should return to SummaryMyTrip page
        if (localStorage.getItem('returnToSummaryMyTrip') === 'true') {
          const tripId = localStorage.getItem('summaryTripId');
          if (tripId) {
            router.push({ name: 'summarypagemytrip', params: { tripId } });
            return;
          }
        }
        
        router.push({ name: 'schedule', params: { tripId: tripStore.tripId } });
      } catch (error) {
        console.error('Error saving hotel:', error);
        alert('Failed to save hotel. Please try again.');
      }
    } else {
      const tripData = { hotel, budget: tripStore.budget };
      localStorage.setItem(`trip-${tripStore.tripId}-hotel`, JSON.stringify(tripData));
      alert('Server is down. Your hotel selection has been saved locally.');
      
      // Check if we should return to SummaryMyTrip page
      if (localStorage.getItem('returnToSummaryMyTrip') === 'true') {
        const tripId = localStorage.getItem('summaryTripId');
        if (tripId) {
          router.push({ name: 'summarypagemytrip', params: { tripId } });
          return;
        }
      }
      
      router.push({ name: 'schedule', params: { tripId: tripStore.tripId } });
    }
  };

  const skip = async () => {
    const isApiAvailable = await checkAPIConnection();
    if (isApiAvailable) {
      try {
        await axios.post(`http://localhost:3002/api/trips/${tripStore.tripId}/hotel/skip`);
        router.push({ name: 'schedule', params: { tripId: tripStore.tripId } });
      } catch (error) {
        console.error('Error skipping hotel:', error);
        alert('Failed to skip hotel. Please try again.');
      }
    } else {
      console.log('API is down, skipping hotel step locally.');
      router.push({ name: 'schedule', params: { tripId: tripStore.tripId } });
    }
  };

  const goBack = () => {
    router.back();
  };

  const syncOfflineHotels = async () => {
    const isApiAvailable = await checkAPIConnection();
    if (isApiAvailable) {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith('trip-') && key.endsWith('-hotel')) {
          const tripId = key.split('-')[1];
          const tripData = JSON.parse(localStorage.getItem(key)!);
          if (tripData) {
            try {
              await axios.post(`http://localhost:3002/api/trips/${tripId}/hotel`, {
                hotel: tripData.hotel,
                trip_id: tripId
              });
              await axios.put(`http://localhost:3002/api/trips/${tripId}/budget`, {
                total_budget: tripStore.initialBudget,
                planned_expenses: tripData.budget,
              });
              localStorage.removeItem(key);
              console.log(`Synced hotel data for trip ${tripId}`);
            } catch (error) {
              console.error(`Error syncing trip ${tripId}:`, error);
            }
          }
        }
      }
    }
  };

  return {
    hotels,
    selectedHotel,
    selectedHotelDetails,
    isLoading,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    plannedExpenses,
    isSelected,
    fetchHotelOptions,
    showHotelDetails,
    handleHotelSelected,
    skip,
    goBack,
    syncOfflineHotels,
  };
}
