import axios from 'axios';
import { useAuthStore } from './stores/auth';
import { mockTrip } from './composables/mockData';

const API_BASE_URL = 'http://localhost:3002/api';

export const getApiUrl = (endpoint: string) => `${API_BASE_URL}/${endpoint}`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isApiDown = false;

export const checkAPIConnection = async () => {
  try {
    await apiClient.get('/status');
    console.log('API connection successful.');
    isApiDown = false;
    return true;
  } catch (error) {
    console.error('API connection failed, using mock data:', error);
    isApiDown = true;
    return false;
  }
};

export interface TripData {
  user_id: number;
  destination: string;
  destination_iata_code?: string;
  start_date: string;
  end_date: string;
  group_size: number;
  budget: number;
  transport: string;
  activities: string[];
  other_activity?: string;
  special_needs?: string;
  name: string;
  trip_type?: string;
}

const api = {
  async saveTrip(tripData: TripData) {
    if (isApiDown) {
      console.log('API is down, returning mock trip data.');
      return { ...mockTrip, ...tripData };
    }
    try {
      // Ensure user_id is an integer
      const sanitizedTripData = {
        ...tripData,
        user_id: typeof tripData.user_id === 'number' ? tripData.user_id : parseInt(String(tripData.user_id), 10) || 1
      };
      const response = await apiClient.post('/trips', sanitizedTripData);
      return response.data;
    } catch (error) {
      console.error('Error saving trip, returning mock data:', error);
      return { ...mockTrip, ...tripData };
    }
  },

  async getTripById(tripId: string) {
    if (isApiDown) {
      console.log(`API is down, returning mock trip data for tripId: ${tripId}`);
      return mockTrip;
    }
    try {
      const response = await apiClient.get(`/trips/by-id/${tripId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching trip ${tripId}, returning mock data:`, error);
      return mockTrip;
    }
  },

  async saveFlights(tripId: string, flights: any, dictionaries: any, tripType?: string) {
    if (isApiDown) {
      console.log('API is down, simulating flight save.');
      return Promise.resolve({ success: true });
    }
    try {
      const response = await apiClient.post(`/trips/${tripId}/flights`, {
        flights,
        dictionaries,
        trip_id: tripId,
        tripType,
      });
      return response.data;
    } catch (error) {
      console.error('Error saving flights, simulating success:', error);
      return Promise.resolve({ success: true });
    }
  },

  async updateBudget(tripId: string, budget: number) {
    if (isApiDown) {
      console.log('API is down, simulating budget update.');
      return Promise.resolve({ success: true });
    }
    try {
      const response = await apiClient.put(`/trips/${tripId}/budget`, { budget });
      return response.data;
    } catch (error) {
      console.error('Error updating budget, simulating success:', error);
      return Promise.resolve({ success: true });
    }
  },

  async getCitySuggestions(keyword: string, limit = 5) {
    if (isApiDown) {
      console.log('API is down, returning empty array for city suggestions.');
      return [];
    }
    try {
      const response = await apiClient.get('/amadeus/cities', {
        params: { keyword, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching city suggestions:', error);
      return [];
    }
  },

  // Auth
  get(url: string) {
    return apiClient.get(url);
  },
  
  post(url: string, data: any) {
    if (isApiDown) {
      console.log('API is down, simulating post request:', url);
      return Promise.reject(new Error('API is down'));
    }
    return apiClient.post(url, data);
  }
};

export default api;