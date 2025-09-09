import { ref, reactive, watch, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useTripStore } from '@/stores/trip';
import api from '@/api';
import { useGemini } from './gemini';
import { ensureIntUserId } from './mockData';
import { type TripData } from '@/api';

// Types
interface TravelPlan {
  id: string;
  destination: string;
  destinationIataCode: string;
  startDate: string;
  endDate: string;
  budget: number;
  groupSize: number;
  transport: string;
  activities: string[];
  tripType: string;
  otherActivity: string;
  specialNeeds: string;
}

interface City {
  name: string;
  iataCode: string;
}

export function useStartPlanForm() {
  const formData = reactive({
    destination: '',
    destinationIataCode: '',
    startDate: '',
    endDate: '',
    budget: 0,
    groupSize: 1,
    transport: '',
    activities: [] as string[],
    otherActivity: '',
    specialNeeds: '',
    tripType: 'one-way'
  });

  const showFilter = ref(true);
  const filterSectionRef = ref<HTMLElement | null>(null);
  const isSubmitting = ref(false);
  const savedPlans = ref<TravelPlan[]>([]);
  const authStore = useAuthStore();
  const tripStore = useTripStore();
  const router = useRouter();
  const { generatedContent, generateContent, isLoading: isGeminiLoading, error: geminiError } = useGemini();

  const isFormValid = computed(() => {
    return formData.destination && formData.startDate && formData.endDate && new Date(formData.startDate) < new Date(formData.endDate);
  });

  const increaseGroupSize = () => {
    if (formData.groupSize < 20) formData.groupSize++;
  };

  const decreaseGroupSize = () => {
    if (formData.groupSize > 1) formData.groupSize--;
  };

  const saveToDatabase = async (plan: Omit<TravelPlan, 'id'>, existingTripId?: string): Promise<string> => {
    if (!authStore.token) {
      throw new Error('Authentication token not found.');
    }
    const baseTripData = {
      user_id: ensureIntUserId(authStore.currentUser.id),
      destination: plan.destination,
      destination_iata_code: plan.destinationIataCode,
      start_date: plan.startDate,
      end_date: plan.endDate,
      budget: plan.budget,
      group_size: plan.groupSize,
      transport: plan.transport,
      activities: plan.activities,
      other_activity: plan.otherActivity,
      special_needs: plan.specialNeeds,
      trip_type: plan.tripType,
    } as Partial<TripData>;
    if (!existingTripId) {
      // Only for new trips, include generated name
      const newTripData = { ...baseTripData, name: `${plan.destination} Trip` } as TripData;
      // Create new trip
      const response = await api.saveTrip(newTripData);
      return response.id;
    } else {
      // For updates, exclude name to preserve existing
      // Update existing trip
      await api.updateTrip(existingTripId, baseTripData);
      return existingTripId;
    }
  };

  const submitForm = async (param?: any) => {
    let existingTripId: string | undefined;
    if (param && typeof param === 'string' && !isNaN(parseInt(param)) && parseInt(param) > 0) {
      existingTripId = param;
    } // else treat as create (ignore event or invalid param)
    try {
      isSubmitting.value = true;
      const tripId = await saveToDatabase({ ...formData }, existingTripId);
      tripStore.setTripDetails({ ...formData, id: tripId });
      tripStore.setTripId(parseInt(tripId, 10));
      // Sync saved trips only after update (edit)
      if (existingTripId && authStore.currentUser?.id) {
        await axios.post(`http://localhost:3002/api/trips/sync-saved/${authStore.currentUser.id}`);
      }
      // For create (new trip), navigate to flight page
      if (!existingTripId) {
        router.push({ name: 'flight', params: { tripId } });
      }
      return tripId; // Return the trip ID for use in navigation (for edit)
    } catch (e) {
      console.error('Error saving trip, attempting to use Gemini:', e);
      try {
        const prompt = `Generate a travel plan for a trip to ${formData.destination} from ${formData.startDate} to ${formData.endDate} for ${formData.groupSize} people. The budget is ${formData.budget}. The preferred transport is ${formData.transport}. Activities of interest are ${formData.activities.join(', ')}. Other activities: ${formData.otherActivity}. Special needs: ${formData.specialNeeds}. Trip type: ${formData.tripType}. Please provide a destination IATA code.`;
        await generateContent(prompt, import.meta.env.VITE_GEMINI_API_KEY);
        const tripData = {
          ...formData,
          destinationIataCode: 'FROM_GEMINI', // Placeholder, ideally parsed from response
        };
        const tripId = await saveToDatabase(tripData, existingTripId);
        tripStore.setTripDetails({ ...tripData, id: tripId });
        tripStore.setTripId(parseInt(tripId, 10));
        // Sync saved trips only after update (edit)
        if (existingTripId && authStore.currentUser?.id) {
          await axios.post(`http://localhost:3002/api/trips/sync-saved/${authStore.currentUser.id}`);
        }
        // For create (new trip), navigate to flight page
        if (!existingTripId) {
          router.push({ name: 'flight', params: { tripId } });
        }
        return tripId;
      } catch (geminiE) {
        console.error('Error with Gemini fallback:', geminiE);
        alert('Failed to save trip with both primary service and fallback. Please try again later.');
        throw geminiE;
      }
    } finally {
      isSubmitting.value = false;
    }
  };


  const fetchSavedPlans = async () => {
    if (!authStore.currentUser?.id) return;
    try {
      const response = await axios.get(`http://localhost:3002/api/trips/${authStore.currentUser.id}`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      });
      savedPlans.value = response.data.map((plan: any) => ({
        ...plan,
        startDate: new Date(plan.start_date).toLocaleDateString(),
        endDate: new Date(plan.end_date).toLocaleDateString(),
      }));
    } catch (error) {
      console.error('Error fetching saved plans:', error);
    }
  };

  onMounted(fetchSavedPlans);

  // City search functionality
  const citySuggestions = ref<City[]>([]);
  const isSearching = ref(false);

  const handleCityInput = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const query = target.value.trim();
    
    if (query.length < 3) {
      citySuggestions.value = [];
      return;
    }

    try {
      isSearching.value = true;
      const response = await axios.get(`http://localhost:3002/api/amadeus/cities?keyword=${encodeURIComponent(query)}`);
      citySuggestions.value = response.data;
    } catch (error) {
      console.error('Error searching cities:', error);
      citySuggestions.value = [];
    } finally {
      isSearching.value = false;
    }
  };

  const selectCity = (city: City) => {
    formData.destination = city.name;
    formData.destinationIataCode = city.iataCode;
    citySuggestions.value = [];
  };

  return {
    formData,
    showFilter,
    filterSectionRef,
    isSubmitting,
    increaseGroupSize,
    decreaseGroupSize,
    submitForm,
    savedPlans,
    isFormValid,
    citySuggestions,
    handleCityInput,
    selectCity,
  };
}