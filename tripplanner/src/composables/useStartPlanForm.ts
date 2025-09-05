import { ref, reactive, watch, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useTripStore } from '@/stores/trip';
import api from '@/api';
import { useGemini } from './gemini';
import { ensureIntUserId } from './mockData';

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
  const citySuggestions = ref<City[]>([]);
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

  const saveToDatabase = async (plan: Omit<TravelPlan, 'id'>): Promise<string> => {
    if (!authStore.token) {
      throw new Error('Authentication token not found.');
    }
    const tripData = {
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
      name: `${plan.destination} Trip`,
      trip_type: plan.tripType,
    };
    const response = await api.saveTrip(tripData);
    return response.id;
  };

  const submitForm = async () => {
    try {
      isSubmitting.value = true;
      const newTripId = await saveToDatabase({ ...formData });
      tripStore.setTripDetails({ ...formData, id: newTripId });
      tripStore.setTripId(parseInt(newTripId, 10));
      router.push({ name: 'flight', params: { tripId: newTripId } });
    } catch (e) {
      console.error('Error saving trip, attempting to use Gemini:', e);
      try {
        const prompt = `Generate a travel plan for a trip to ${formData.destination} from ${formData.startDate} to ${formData.endDate} for ${formData.groupSize} people. The budget is ${formData.budget}. The preferred transport is ${formData.transport}. Activities of interest are ${formData.activities.join(', ')}. Other activities: ${formData.otherActivity}. Special needs: ${formData.specialNeeds}. Trip type: ${formData.tripType}. Please provide a destination IATA code.`;
        await generateContent(prompt, import.meta.env.VITE_GEMINI_API_KEY);
        const tripData = {
          ...formData,
          destinationIataCode: 'FROM_GEMINI', // Placeholder, ideally parsed from response
        };
        const newTripId = await saveToDatabase(tripData);
        tripStore.setTripDetails({ ...tripData, id: newTripId });
        tripStore.setTripId(parseInt(newTripId, 10));
        router.push({ name: 'flight', params: { tripId: newTripId } });
      } catch (geminiE) {
        console.error('Error with Gemini fallback:', geminiE);
        alert('Failed to save trip with both primary service and fallback. Please try again later.');
      }
    } finally {
      isSubmitting.value = false;
    }
  };

  const selectCity = (city: City) => {
    formData.destination = city.name;
    formData.destinationIataCode = city.iataCode;
    citySuggestions.value = [];
  };

  const handleCityInput = async () => {
    if (formData.destination.length < 1) {
      citySuggestions.value = [];
      return;
    }
    try {
      const response = await axios.get('http://localhost:3002/api/amadeus/cities', {
        params: { keyword: formData.destination }
      });
      citySuggestions.value = response.data;
    } catch (error) {
      console.error('Error fetching city suggestions, attempting to use Gemini:', error);
      try {
        const prompt = `Provide a list of city names and their IATA codes starting with "${formData.destination}". Return the data in a JSON array format with "name" and "iataCode" properties. For example: [{"name": "Bangkok", "iataCode": "BKK"}]`;
        await generateContent(prompt, import.meta.env.VITE_GEMINI_API_KEY);
        if (Array.isArray(generatedContent.value)) {
          citySuggestions.value = generatedContent.value;
        } else if (generatedContent.value && Array.isArray(generatedContent.value.data)) {
          citySuggestions.value = generatedContent.value.data;
        }
      } catch (geminiE) {
        console.error('Error with Gemini fallback for cities:', geminiE);
      }
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

  return {
    formData,
    showFilter,
    filterSectionRef,
    isSubmitting,
    increaseGroupSize,
    decreaseGroupSize,
    submitForm,
    selectCity,
    savedPlans,
    isFormValid,
    citySuggestions,
    handleCityInput,
  };
}