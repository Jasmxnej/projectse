import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useTripStore } from '@/stores/trip';
import type { Flight, FlightDictionaries } from '@/types/flight';
import api, { checkAPIConnection } from '@/api';
import { useGemini } from './gemini';

export const tripType = ref('one-way');

export function useFlightSearch() {
  const router = useRouter();
  const tripStore = useTripStore();

  const flightResults = ref<Flight[]>([]);
  const { generatedContent, generateContent, isLoading: isGeminiLoading, error: geminiError } = useGemini();
  const flightDictionaries = ref<FlightDictionaries>({ locations: {}, carriers: {} });
  const isSearching = ref(false);
  const searchAttempted = ref(false);
  const selectedFlightDetails = ref<Flight | null>(null);
  const selectedFlights = ref<Flight[]>([]);
  const cachedFlightResults = ref<Record<number, Flight[]>>({});
  const cachedFlightDictionaries = ref<Record<number, FlightDictionaries>>({});
  const searchParams = ref<any>(null);
  const currentItinerary = ref(0);

  const flightResultsTitle = computed(() => {
    if (tripType.value === 'one-way') return 'One-Way Flight Results';
    if (tripType.value === 'round-trip') {
      if (currentItinerary.value === 0) return 'Departure Flights';
      return 'Return Flights';
    }
    if (tripType.value === 'multi-city') {
      const totalSegments = searchParams.value?.originDestinations?.length || 1;
      return `Flight ${currentItinerary.value + 1} of ${totalSegments}`;
    }
    return 'Flight Results';
  });

  const resetState = () => {
    flightResults.value = [];
    flightDictionaries.value = { locations: {}, carriers: {} };
    isSearching.value = false;
    searchAttempted.value = false;
    selectedFlightDetails.value = null;
    selectedFlights.value = [];
    searchParams.value = null;
    currentItinerary.value = 0;
    tripType.value = 'one-way';
    cachedFlightResults.value = {};
    cachedFlightDictionaries.value = {};
  };

  const showFlightDetails = (flight: Flight) => {
    selectedFlightDetails.value = flight;
  };

  const fetchFlightOptions = async (params: any, newTripType: string) => {
    searchAttempted.value = true;
    if (newTripType === 'one-way' || currentItinerary.value === 0) {
      selectedFlights.value = [];
    }

    searchParams.value = params;
    tripType.value = newTripType;
    currentItinerary.value = 0;
    isSearching.value = true;

    // For multi-city, load segments sequentially like round-trip
    if (newTripType === 'multi-city') {
      await loadItineraryFlights(); // load first segment
    } else {
      await loadItineraryFlights(); // load first leg
    }
  };

  const loadItineraryFlights = async () => {
    const itineraryIndex = currentItinerary.value;

    // If already cached, use it
    if (cachedFlightResults.value[itineraryIndex]) {
      flightResults.value = cachedFlightResults.value[itineraryIndex];
      flightDictionaries.value = cachedFlightDictionaries.value[itineraryIndex];
      isSearching.value = false;
      return;
    }

    let paramsForSearch;
    const p = searchParams.value;

    if (tripType.value === 'multi-city') {
      // For multi-city, send individual segments
      const segment = p.originDestinations[itineraryIndex];
      paramsForSearch = {
        originLocationCode: segment.originLocationCode,
        destinationLocationCode: segment.destinationLocationCode,
        departureDate: segment.departureDateTimeRange.date,
        adults: p.adults || 1,
        children: p.children || 0,
        infants: p.infants || 0,
        travelClass: p.travelClass || 'ECONOMY'
      };
    } else if (tripType.value === 'round-trip') {
      if (itineraryIndex === 0) {
        // Outbound
        paramsForSearch = {
          originLocationCode: p.originLocationCode,
          destinationLocationCode: p.destinationLocationCode,
          departureDate: p.departureDate,
          adults: p.adults,
          children: p.children,
          travelClass: p.travelClass,
        };
      } else {
        // Return (FIXED: city2 → city1)
        paramsForSearch = {
          originLocationCode: p.destinationLocationCode,
          destinationLocationCode: p.originLocationCode,
          departureDate: p.returnDate,
          adults: p.adults,
          children: p.children,
          travelClass: p.travelClass,
        };
      }
    } else {
      // One-way
      paramsForSearch = {
        originLocationCode: p.originLocationCode,
        destinationLocationCode: p.destinationLocationCode,
        departureDate: p.departureDate,
        adults: p.adults,
        children: p.children,
        travelClass: p.travelClass,
      };
    }

    try {
      const response = await axios.post<{ data: Flight[]; dictionaries: FlightDictionaries }>(
        'http://localhost:3002/api/amadeus/flights',
        paramsForSearch
      );
      flightResults.value = response.data.data || [];
      flightDictionaries.value = response.data.dictionaries || { locations: {}, carriers: {} };

      // cache
      cachedFlightResults.value[itineraryIndex] = flightResults.value;
      cachedFlightDictionaries.value[itineraryIndex] = flightDictionaries.value;

    } catch (error: any) {
      console.error('Error loading flights:', error);

      // Handle specific Amadeus API errors
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.code === 4926 || (errorData.error && errorData.error.includes && errorData.error.includes('overlap'))) {
          alert(errorData.message || 'Invalid multi-city flight request. Please ensure no overlapping segments.');
          isSearching.value = false;
          return;
        }
      }

      // fallback Gemini
      try {
        const prompt = `Generate flight options for ${tripType.value} trip. Params: ${JSON.stringify(
          paramsForSearch
        )}`;
        await generateContent(prompt, import.meta.env.VITE_GEMINI_API_KEY);
        const geminiData = generatedContent.value;

        if (geminiData?.data?.length) {
          flightResults.value = geminiData.data;
          flightDictionaries.value = geminiData.dictionaries || { locations: {}, carriers: {} };

          cachedFlightResults.value[itineraryIndex] = flightResults.value;
          cachedFlightDictionaries.value[itineraryIndex] = flightDictionaries.value;
        }
      } catch (geminiError) {
        console.error('Gemini fallback failed:', geminiError);
      }
    } finally {
      isSearching.value = false;
    }
  };

  const loadMultiCityFlights = async () => {
    // For multi-city, we load all segments at once
    const p = searchParams.value;
    const paramsForSearch = {
      originDestinations: p.originDestinations,
      travelers: p.travelers,
      sources: p.sources || ['GDS']
    };

    try {
      const response = await axios.post<{ data: Flight[]; dictionaries: FlightDictionaries }>(
        'http://localhost:3002/api/amadeus/flights',
        paramsForSearch
      );
      flightResults.value = response.data.data || [];
      flightDictionaries.value = response.data.dictionaries || { locations: {}, carriers: {} };

      // Cache the results
      cachedFlightResults.value[0] = flightResults.value;
      cachedFlightDictionaries.value[0] = flightDictionaries.value;

    } catch (error: any) {
      console.error('Error loading multi-city flights:', error);

      // Handle specific Amadeus API errors
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.code === 4926 || (errorData.error && errorData.error.includes && errorData.error.includes('overlap'))) {
          alert(errorData.message || 'Invalid multi-city flight request. Please ensure no overlapping segments.');
          isSearching.value = false;
          return;
        }
      }

      // fallback Gemini
      try {
        const prompt = `Generate flight options for multi-city trip. Params: ${JSON.stringify(
          paramsForSearch
        )}`;
        await generateContent(prompt, import.meta.env.VITE_GEMINI_API_KEY);
        const geminiData = generatedContent.value;

        if (geminiData?.data?.length) {
          flightResults.value = geminiData.data;
          flightDictionaries.value = geminiData.dictionaries || { locations: {}, carriers: {} };

          cachedFlightResults.value[0] = flightResults.value;
          cachedFlightDictionaries.value[0] = flightDictionaries.value;
        }
      } catch (geminiError) {
        console.error('Gemini fallback failed:', geminiError);
      }
    } finally {
      isSearching.value = false;
    }
  };

  const goBack = () => {
    if (currentItinerary.value > 0) {
      currentItinerary.value--;
      loadItineraryFlights(); // reuse cached result if available
    } else {
      router.back();
    }
  };

  const handleFlightSelected = (flight: Flight) => {
    if (tripType.value === 'multi-city') {
      // For multi-city, handle segment by segment like round-trip
      selectedFlights.value[currentItinerary.value] = flight;

      const totalSegments = searchParams.value?.originDestinations?.length || 1;

      if (currentItinerary.value < totalSegments - 1) {
        currentItinerary.value++;
        loadItineraryFlights(); // load next segment
      } else {
        saveSelectedFlight();
      }
    } else {
      // For one-way and round-trip, handle segment by segment
      selectedFlights.value[currentItinerary.value] = flight;

      const totalLegs = tripType.value === 'round-trip' ? 2 : 1;

      if (currentItinerary.value < totalLegs - 1) {
        currentItinerary.value++;
        loadItineraryFlights(); // load next leg
      } else {
        saveSelectedFlight();
      }
    }
  };

  const skipStep = async () => {
    const isApiAvailable = await checkAPIConnection();
    if (isApiAvailable) {
      try {
        await axios.post(`http://localhost:3002/api/trips/${tripStore.tripId}/flights/skip`);
        router.push({ name: 'hotel', params: { tripId: tripStore.tripId } });
      } catch (error) {
        console.error('Skip error:', error);
      }
    } else {
      router.push({ name: 'hotel', params: { tripId: tripStore.tripId } });
    }
  };

  const saveSelectedFlight = async () => {
    if (selectedFlights.value.length === 0) return;

    // Convert EUR to THB (1 EUR ≈ 40 THB) before saving
    const convertEURtoTHB = (eurPrice: string): number => {
      const exchangeRate = 40; // EUR to THB exchange rate
      return parseFloat(eurPrice) * exchangeRate;
    };
    
    // Convert prices and update flight objects
    const flightsWithThbPrice = selectedFlights.value.map(flight => {
      const thbPrice = convertEURtoTHB(flight.price.total);
      return {
        ...flight,
        price: {
          ...flight.price,
          total: thbPrice.toString(),
          currency: 'THB'
        }
      };
    });
    
    const cost = flightsWithThbPrice.reduce((sum, f) => sum + parseFloat(f.price.total), 0);
    tripStore.setFlightCost(cost);
    tripStore.setFlights(flightsWithThbPrice);

    const isApiAvailable = await checkAPIConnection();
    if (!isApiAvailable) {
      localStorage.setItem(`trip-${tripStore.tripId}-flights`, JSON.stringify({
        flights: selectedFlights.value,
        dictionaries: flightDictionaries.value,
        budget: tripStore.budget,
      }));
      alert('Saved offline');
      
      // Check if we should return to SummaryMyTrip page
      if (localStorage.getItem('returnToSummaryMyTrip') === 'true') {
        const tripId = localStorage.getItem('summaryTripId');
        if (tripId) {
          router.push({ name: 'summarypagemytrip', params: { tripId } });
          return;
        }
      }
      
      router.push({ name: 'hotel', params: { tripId: tripStore.tripId } });
      return;
    }

    try {
      const flightsForBackend = flightsWithThbPrice.map((flight, index) => {
        const seg0 = flight.itineraries[0].segments[0];
        const segN = flight.itineraries[0].segments.at(-1)!;

        // Extract detailed flight information
        const departureDateTime = new Date(seg0.departure.at);
        const arrivalDateTime = new Date(segN.arrival.at);
        const departureTime = seg0.departure.at; // Full ISO string
        const arrivalTime = segN.arrival.at; // Full ISO string
        const departureDate = departureDateTime.toISOString().split('T')[0]; // YYYY-MM-DD
        const arrivalDate = arrivalDateTime.toISOString().split('T')[0]; // YYYY-MM-DD

        // Get traveler information
        const traveler = flight.travelerPricings?.[0] || {};
        const fareClass = traveler.fareDetailsBySegment?.[0]?.cabin || 'ECONOMY';

        // Get baggage information
        const baggageQuantity = traveler.fareDetailsBySegment?.[0]?.includedCheckedBags?.quantity || 0;

        return {
          ...flight,
          leg_number: index + 1, // Ensure proper leg numbering for multi-city
          airline: seg0.carrierCode || 'Unknown',
          fromCity: flightDictionaries.value.locations[seg0.departure.iataCode]?.cityCode || seg0.departure.iataCode,
          toCity: flightDictionaries.value.locations[segN.arrival.iataCode]?.cityCode || segN.arrival.iataCode,
          from_iata: seg0.departure.iataCode,
          to_iata: segN.arrival.iataCode,
          departure_time: departureTime,
          arrival_time: arrivalTime,
          departure_date: departureDate,
          arrival_date: arrivalDate,
          duration: flight.itineraries[0].duration,
          stops: flight.itineraries[0].segments.length - 1,
          travel_class: fareClass,
          baggage: baggageQuantity,
          itinerary_details: JSON.stringify(flight.itineraries),
        };
      });

      await api.saveFlights(String(tripStore.tripId), flightsForBackend, flightDictionaries.value, tripType.value);
      await api.updateBudget(String(tripStore.tripId), tripStore.budget);
      
      // Check if we should return to SummaryMyTrip page
      if (localStorage.getItem('returnToSummaryMyTrip') === 'true') {
        const tripId = localStorage.getItem('summaryTripId');
        if (tripId) {
          router.push({ name: 'summarypagemytrip', params: { tripId } });
          return;
        }
      }
      
      router.push({ name: 'hotel', params: { tripId: tripStore.tripId } });
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save flight. Try again.');
    }
  };

  const syncOfflineFlights = async () => {
    const isApiAvailable = await checkAPIConnection();
    if (isApiAvailable) {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith('trip-') && key.endsWith('-flights')) {
          const tripId = key.split('-')[1];
          const tripData = JSON.parse(localStorage.getItem(key) as string);
          if (tripData) {
            try {
              await api.saveFlights(tripId, tripData.flights, tripData.flightDictionaries);
              await api.updateBudget(tripId, tripData.budget);
              localStorage.removeItem(key);
            } catch (error) {
              console.error(`Sync error for trip ${tripId}:`, error);
            }
          }
        }
      }
    }
  };

  return {
    flightResults,
    flightDictionaries,
    isSearching,
    searchAttempted,
    selectedFlightDetails,
    selectedFlights,
    currentItinerary,
    flightResultsTitle,
    searchParams,
    showFlightDetails,
    fetchFlightOptions,
    handleFlightSelected,
    skipStep,
    goBack,
    resetState,
    syncOfflineFlights,
    tripType,
  };
}
