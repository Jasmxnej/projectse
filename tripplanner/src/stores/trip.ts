import { defineStore } from 'pinia';
import { useAuthStore } from './auth';
import api, { type TripData } from '@/api';
import { ensureIntUserId } from '@/composables/mockData';

export const useTripStore = defineStore('trip', {
  state: () => ({
    tripId: null as number | null,
    tripName: '',
    destination: '',
    destinationIataCode: '',
    startDate: '',
    endDate: '',
    groupSize: 1,
    budget: 0,
    initialBudget: 0,
    transport: '',
    activities: [] as string[],
    tripType: 'one-way',
    otherActivity: '',
    specialNeeds: '',
    flightCost: 0,
    flights: [] as any[],
    hotelCost: 0,
    hotel: null as any | null,
    tripDays: [] as any[],
    plannedExpenses: {
      plan: 0,
      flight: 0,
      hotel: 0,
      total: 0
    },
    recommendedItems: {
      categories: [] as any[],
      isMock: false
    },
    destinationCoords: null as { latitude: number; longitude: number } | null,
  }),
  actions: {
    setTripDetails(details: any) {
      this.tripName = details.name || details.tripName || ''
      this.destination = details.destination
      this.destinationIataCode = details.destinationIataCode
      this.startDate = details.startDate
      this.endDate = details.endDate
      this.groupSize = details.groupSize
      this.budget = details.budget
      this.initialBudget = details.budget
      this.transport = details.transport
      this.activities = details.activities
      this.tripType = details.tripType
      this.otherActivity = details.otherActivity
      this.specialNeeds = details.specialNeeds
    },
    setTripId(id: number) {
      this.tripId = id;
    },
    setFlightCost(cost: number) {
      this.flightCost = cost;
      this.plannedExpenses.flight = cost;
      this.updateTotalPlannedExpenses();
    },
    setFlights(flights: any[]) {
      this.flights = flights;
    },
    setHotelCost(cost: number) {
      this.hotelCost = cost;
      this.plannedExpenses.hotel = cost;
      this.updateTotalPlannedExpenses();
    },
    setHotel(hotel: any) {
      this.hotel = hotel;
    },
    setPlanCost(cost: number) {
      this.plannedExpenses.plan = cost;
      this.updateTotalPlannedExpenses();
    },
    updateTotalPlannedExpenses() {
      this.plannedExpenses.total = this.plannedExpenses.plan + this.plannedExpenses.flight + this.plannedExpenses.hotel;
      this.budget = this.initialBudget - this.plannedExpenses.total;
    },
    updateActivity(payload: { dayId: number; activityId: number; updatedData: any }) {
      const { dayId, activityId, updatedData } = payload;
      const day = this.tripDays.find((d: any) => d.id === dayId);
      if (day) {
        const activity = day.activities.find((a: any) => a.id === activityId);
        if (activity) {
          Object.assign(activity, updatedData);
        }
      }
    },
    setTripDays(days: any[]) {
      this.tripDays = days;
    },
    setRecommendedItems(items: any) {
      // Handle both old array format and new categorized format
      if (Array.isArray(items)) {
        // Convert old format to new categorized format
        this.recommendedItems = {
          categories: [
            {
              name: "Recommendations",
              items: items
            }
          ],
          isMock: false // Arrays don't have isMock property
        };
      } else if (items && typeof items === 'object') {
        // New format with categories
        this.recommendedItems = {
          categories: items.categories || [],
          isMock: items.isMock || false
        };
      } else {
        // Reset to empty state
        this.recommendedItems = {
          categories: [],
          isMock: false
        };
      }
    },
    populateFromSummary(summaryData: any) {
      const { trip, flight, hotel, schedule, budget, weather, recommendations, packingList } = summaryData;
      if (trip) {
        this.tripId = trip.id;
        this.tripName = trip.name || '';
        this.destination = trip.destination;
        this.destinationIataCode = trip.destination_iata_code || '';
        this.startDate = trip.start_date;
        this.endDate = trip.end_date;
        this.groupSize = trip.group_size;
        this.budget = trip.budget;
        this.initialBudget = trip.budget;
        this.transport = trip.transport;
        this.activities = trip.activities || [];
        this.otherActivity = trip.other_activity;
        this.specialNeeds = trip.special_needs;
      }
      
      // Enhanced flight data handling - preserve all database fields
      if (flight && flight.length > 0) {
        // flight is an array from the database
        const enhancedFlights = flight.map((flightData: any) => ({
          ...flightData,
          // Ensure all database fields are preserved
          airline: flightData.airline || 'Unknown Airline',
          flight_number: flightData.flight_number || '',
          from_city: flightData.from_city || '',
          to_city: flightData.to_city || '',
          from_iata: flightData.from_iata || '',
          to_iata: flightData.to_iata || '',
          departure_date: flightData.departure_date || '',
          departure_time: flightData.departure_time || '',
          arrival_date: flightData.arrival_date || '',
          arrival_time: flightData.arrival_time || '',
          duration: flightData.duration || '',
          price: flightData.price || 0,
          currency: flightData.currency || 'THB',
          stops: flightData.stops || 0,
          traveler_type: flightData.traveler_type || '',
          fare_class: flightData.fare_class || '',
          baggage_quantity: flightData.baggage_quantity || 0,
          bag_weight: flightData.bag_weight || '',
          bag_weight_unit: flightData.bag_weight_unit || '',
          aircraft_code: flightData.aircraft_code || '',
          fare_basis: flightData.fare_basis || ''
        }));

        // Calculate total flight cost for all legs with proper price parsing
        this.flightCost = enhancedFlights.reduce((total: number, flight: any) => {
          let price = 0;
          if (typeof flight.price === 'number') {
            price = flight.price;
          } else if (typeof flight.price === 'string') {
            price = parseFloat(flight.price) || 0;
          } else if (flight.price && typeof flight.price === 'object') {
            if (flight.price.total) {
              price = parseFloat(flight.price.total) || 0;
            } else if (flight.price.grandTotal) {
              price = parseFloat(flight.price.grandTotal) || 0;
            } else if (flight.price.base) {
              price = parseFloat(flight.price.base) || 0;
            }
          }
          return total + price;
        }, 0);
        this.flights = enhancedFlights;
      } else {
        this.flightCost = 0;
        this.flights = [];
      }
      
      // Enhanced hotel data handling - preserve all database fields
      if (hotel) {
        const enhancedHotel = {
          ...hotel,
          // Ensure all database fields are preserved
          name: hotel.name || '',
          price: hotel.price || 0,
          currency: hotel.currency || 'THB',
          description: hotel.description || '',
          image_url: hotel.image_url || '',
          location: hotel.location || '',
          rating: hotel.rating || 0,
          amenities: hotel.amenities || [],
          check_in_date: hotel.check_in_date || '',
          check_out_date: hotel.check_out_date || '',
          stops: hotel.stops || 0,
          city_code: hotel.city_code || '',
          number_of_adults: hotel.number_of_adults || 1,
          room: hotel.room || {},
          policies: hotel.policies || {},
          room_type: hotel.room_type || '',
          room_beds: hotel.room_beds || 0,
          room_bed_type: hotel.room_bed_type || '',
          room_description: hotel.room_description || '',
          cancellation_policy: hotel.cancellation_policy || '',
          payment_methods: hotel.payment_methods || [],
          contact_phone: hotel.contact_phone || '',
          contact_email: hotel.contact_email || ''
        };
        this.hotelCost = enhancedHotel.price;
        this.hotel = enhancedHotel;
      } else {
        this.hotelCost = 0;
        this.hotel = null;
      }
      
      // Enhanced schedule data handling
      this.tripDays = schedule?.map((day: any) => ({
        ...day,
        id: day.id || Date.now() + Math.random(),
        dayNumber: day.day || day.dayNumber,
        name: day.day_name || day.name || `Day ${day.day || day.dayNumber}`,
        activities: typeof day.activities === 'string' ? JSON.parse(day.activities) : (day.activities || [])
      })) || [];
      
      this.updateTotalPlannedExpenses();
    },
    async saveTrip() {
      const authStore = useAuthStore();
      if (!this.tripId && authStore.user) {
        const tripData: TripData = {
          user_id: ensureIntUserId(authStore.user.id),
          name: this.tripName,
          destination: this.destination,
          start_date: this.startDate,
          end_date: this.endDate,
          group_size: this.groupSize,
          budget: this.initialBudget,
          transport: this.transport,
          activities: this.activities,
          other_activity: this.otherActivity,
          special_needs: this.specialNeeds,
        };
        const savedTrip = await api.saveTrip(tripData);
        this.setTripId(savedTrip.id);
      }
    },
    async fetchDestinationCoords() {
      if (this.destination && !this.destinationCoords) {
        try {
          const response = await api.getCitySuggestions(this.destination, 1);
          if (response.length > 0 && response[0].geoCode) {
            this.destinationCoords = {
              latitude: response[0].geoCode.latitude,
              longitude: response[0].geoCode.longitude,
            };
          }
        } catch (error) {
          console.error('Error fetching destination coordinates:', error);
        }
      }
    },
    
    setTripName(name: string) {
      this.tripName = name;
    }
  }
})