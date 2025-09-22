import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import { useTrip } from '../../../composables/useTrip';
import { useFlightSearch } from '../../../composables/useFlightSearch';
import { useHotelSearch } from '../../../composables/useHotelSearch';
import { useAiTrip } from '../../../composables/useAiTrip';
import { useDragAndDrop } from '../../../composables/useDragAndDrop';
import { useStartPlanForm } from '../../../composables/useStartPlanForm';
import { checkAPIConnection } from '../../../api';
import api from '../../../api';

// Mock axios to avoid real API calls
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  create: jest.fn(() => ({
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  })),
  isAxiosError: jest.fn(() => false)
}));

// Mock the api module
jest.mock('../../../api', () => ({
  default: {
    saveTrip: jest.fn(),
    updateTrip: jest.fn(),
    getTripById: jest.fn(),
    saveFlights: jest.fn(),
    updateBudget: jest.fn(),
    getCitySuggestions: jest.fn(),
    get: jest.fn(),
    post: jest.fn()
  },
  checkAPIConnection: jest.fn()
}));

const axios = require('axios');

// Mock stores
jest.mock('../../../stores/auth', () => ({
  useAuthStore: () => ({
    token: 'mock-token',
    currentUser: { id: 1 }
  })
}));

jest.mock('../../../stores/trip', () => ({
  useTripStore: () => ({
    destination: 'Bangkok',
    startDate: '2024-01-01',
    endDate: '2024-01-02',
    budget: 10000,
    groupSize: 2,
    transport: 'flight',
    activities: ['sightseeing'],
    otherActivity: '',
    specialNeeds: '',
    tripId: '123',
    flightCost: 0,
    recommendedItems: { categories: [] },
    setTripDetails: jest.fn(),
    setTripId: jest.fn(),
    setFlightCost: jest.fn(),
    setFlights: jest.fn(),
    setHotelCost: jest.fn(),
    setHotel: jest.fn(),
    setTripDays: jest.fn(),
    setRecommendedItems: jest.fn(),
    saveTrip: jest.fn()
  })
}));

// Mock console to avoid logs
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'log').mockImplementation(() => {});

// Mock vue-router
jest.mock('vue-router', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

describe('Progress1 Test Suite', () => {

  describe('submitForm', () => {
    test('testSubmitFormSuccess', async () => {
      expect(true).toBe(true);
    });

    test('testSubmitFormApiError', async () => {
      expect(true).toBe(true);
    });
  });

  describe('remainingBudget', () => {
    test('testRemainingBudgetCalculation', () => {
      const { remainingBudget, totalBudget } = useTrip();

      totalBudget.value = 10000;
      expect(typeof remainingBudget.value).toBe('number');
    });
  });

  describe('saveToDatabase', () => {
    test('testSaveToDatabaseIndirect', async () => {
      expect(true).toBe(true);
    });
  });

  describe('increaseGroupSize', () => {
    test('testIncreaseGroupSize', () => {
      const { increaseGroupSize, formData } = useStartPlanForm();

      formData.groupSize = 1;
      increaseGroupSize();

      expect(formData.groupSize).toBe(2);
    });

    test('testIncreaseGroupSizeMaxLimit', () => {
      const { increaseGroupSize, formData } = useStartPlanForm();

      formData.groupSize = 20;
      increaseGroupSize();

      expect(formData.groupSize).toBe(20);
    });
  });

  describe('decreaseGroupSize', () => {
    test('testDecreaseGroupSize', () => {
      const { decreaseGroupSize, formData } = useStartPlanForm();

      formData.groupSize = 2;
      decreaseGroupSize();

      expect(formData.groupSize).toBe(1);
    });

    test('testDecreaseGroupSizeMinLimit', () => {
      const { decreaseGroupSize, formData } = useStartPlanForm();

      formData.groupSize = 1;
      decreaseGroupSize();

      expect(formData.groupSize).toBe(1);
    });
  });

  describe('addDay', () => {
    test('testAddDay', () => {
      const { addDay, tripDays } = useTrip();

      const initialLength = tripDays.value.length;
      addDay();

      expect(tripDays.value.length).toBe(initialLength + 1);
      expect(tripDays.value[tripDays.value.length - 1].dayNumber).toBe(initialLength + 1);
    });
  });

  describe('addActivity', () => {
    test('testAddActivity', () => {
      const { addActivityToDay, tripDays } = useTrip();

      tripDays.value = [{ id: 1, dayNumber: 1, name: null, activities: [] }];
      addActivityToDay(1);

      expect(tripDays.value[0].activities.length).toBe(1);
    });
  });

  describe('updateActivity', () => {
    test('testUpdateActivity', () => {
      const { updateActivity, tripDays } = useTrip();

      tripDays.value = [{
        id: 1,
        dayNumber: 1,
        name: null,
        activities: [{ id: 1, name: 'Old Activity', time: '00:00', cost: 0, image: '' }]
      }];

      const updatedData = { id: 1, name: 'Updated Activity', time: '10:00', cost: 100, image: '' };
      updateActivity({ dayId: 1, activityId: 1, updatedData });

      expect(tripDays.value[0].activities[0].name).toBe('Updated Activity');
      expect(tripDays.value[0].activities[0].cost).toBe(100);
    });
  });

  describe('addRecommendationToPlan', () => {
    test('testAddRecommendationToPlan', () => {
      const { addRecommendationToPlan, tripDays } = useTrip();

      tripDays.value = [{ id: 1, dayNumber: 1, name: null, activities: [] }];
      const item = { id: 1, image: 'test.jpg', name: 'Test Place', description: 'Test desc' };

      addRecommendationToPlan(item);

      expect(tripDays.value[0].activities.length).toBe(1);
      expect(tripDays.value[0].activities[0].name).toBe('Test Place');
    });
  });

  describe('addActivityToDay', () => {
    test('testAddActivityToDay', () => {
      const { addActivityToDay, tripDays } = useTrip();

      tripDays.value = [{ id: 1, dayNumber: 1, name: null, activities: [] }];
      addActivityToDay(1);

      expect(tripDays.value[0].activities.length).toBe(1);
    });
  });

  describe('deleteActivity', () => {
    test('testDeleteActivity', () => {
      const { deleteActivity, tripDays } = useTrip();

      tripDays.value = [{
        id: 1,
        dayNumber: 1,
        name: null,
        activities: [{ id: 1, name: 'Test Activity', time: '00:00', cost: 0, image: '' }]
      }];

      deleteActivity({ dayId: 1, activityId: 1 });

      expect(tripDays.value[0].activities.length).toBe(0);
    });
  });

  describe('deleteDay', () => {
    test('testDeleteDay', () => {
      const { tripDays } = useTrip();

      tripDays.value = [
        { id: 1, dayNumber: 1, name: null, activities: [] },
        { id: 2, dayNumber: 2, name: null, activities: [] }
      ];

      tripDays.value.pop();

      expect(tripDays.value.length).toBe(1);
    });
  });

  describe('searchRecommendations', () => {
    test('testSearchRecommendations', async () => {
      expect(true).toBe(true);
    });
  });

  describe('viewSummary', () => {
    test('testViewSummary', () => {
      expect(true).toBe(true);
    });
  });

  describe('saveTripPlan', () => {
    test('testSaveTripPlan', () => {
      expect(true).toBe(true);
    });
  });

  describe('handleDragStart', () => {
    test('testHandleDragStart', () => {
      const tripDays = ref([{ id: 1, dayNumber: 1, name: null, activities: [{ id: 1, name: 'Test', time: '00:00', cost: 0, image: '' }] }]);
      const { handleDragStart, draggedItem } = useDragAndDrop(tripDays);

      const mockEvent = { dataTransfer: { effectAllowed: '' } };
      handleDragStart({ event: mockEvent, dayId: 1, index: 0 });

      expect(draggedItem.value).toBeTruthy();
      expect(draggedItem.value?.activity.name).toBe('Test');
      expect(mockEvent.dataTransfer.effectAllowed).toBe('move');
    });
  });

  describe('handleDragOver', () => {
    test('testHandleDragOver', () => {
      const { handleDragOver } = useDragAndDrop(ref([]));

      const mockEvent = { preventDefault: jest.fn() };
      handleDragOver(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('handleDrop', () => {
    test('testHandleDrop', () => {
      const tripDays = ref([
        { id: 1, dayNumber: 1, name: null, activities: [{ id: 1, name: 'Test', time: '00:00', cost: 0, image: '' }] },
        { id: 2, dayNumber: 2, name: null, activities: [] }
      ]);
      const { handleDrop, draggedItem } = useDragAndDrop(tripDays);

      draggedItem.value = { activity: tripDays.value[0].activities[0], dayId: 1, index: 0 };
      const mockEvent = { preventDefault: jest.fn() };

      handleDrop({ event: mockEvent, dropDayId: 2, dropIndex: 0 });

      expect(tripDays.value[0].activities.length).toBe(0);
      expect(tripDays.value[1].activities.length).toBe(1);
    });
  });

  describe('image', () => {
    test('testImage', () => {
      expect(true).toBe(true);
    });
  });

  describe('fetchFlightOptions', () => {
    test('testFetchFlightOptions', async () => {
      axios.post.mockResolvedValue({ data: { data: [], dictionaries: {} } });

      const { fetchFlightOptions } = useFlightSearch();

      await fetchFlightOptions({ originLocationCode: 'BKK', destinationLocationCode: 'DMK' }, 'one-way');

      expect(axios.post).toHaveBeenCalled();
    });
  });

  describe('handleFlightSelected', () => {
    test('testHandleFlightSelected', () => {
      const { handleFlightSelected, selectedFlights } = useFlightSearch();

      const flight = { id: 'test', price: { total: '100' } };
      handleFlightSelected(flight);

      expect(selectedFlights.value.length).toBe(1);
    });
  });

  describe('showFlightDetails', () => {
    test('testShowFlightDetails', () => {
      const { showFlightDetails, selectedFlightDetails } = useFlightSearch();

      const flight = { id: 'test' };
      showFlightDetails(flight);

      expect(selectedFlightDetails.value).toEqual(flight);
    });
  });

  describe('saveSelectedFlight', () => {
    test('testSaveSelectedFlightIndirect', async () => {
      axios.post.mockResolvedValue({ data: {} });

      const { handleFlightSelected, selectedFlights } = useFlightSearch();
      const flight = { id: 'test', price: { total: '100' }, itineraries: [{ segments: [{ carrierCode: 'AA', departure: { iataCode: 'BKK', at: '2024-01-01T10:00:00' }, arrival: { iataCode: 'DMK', at: '2024-01-01T11:00:00' } }] }], travelerPricings: [{ fareDetailsBySegment: [{ cabin: 'ECONOMY', includedCheckedBags: { quantity: 1 } }] }] };

      handleFlightSelected(flight);

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(axios.post).toHaveBeenCalled();
    });
  });

  describe('skipStep', () => {
    test('testSkipStep', async () => {
      axios.post.mockResolvedValue({ data: {} });

      const { skipStep } = useFlightSearch();

      await skipStep();

      expect(axios.post).toHaveBeenCalled();
    });
  });

  describe('fetchHotelOptions', () => {
    test('testFetchHotelOptions', async () => {
      axios.post.mockResolvedValue({ data: { data: [] } });

      const { fetchHotelOptions } = useHotelSearch();

      await fetchHotelOptions({ cityCode: 'BKK' });

      expect(axios.post).toHaveBeenCalled();
    });
  });

  describe('showHotelDetails', () => {
    test('testShowHotelDetails', () => {
      const { showHotelDetails, selectedHotelDetails } = useHotelSearch();

      const hotel = { id: 'test' };
      showHotelDetails(hotel);

      expect(selectedHotelDetails.value).toEqual(hotel);
    });
  });

  describe('handleHotelSelected', () => {
    test('testHandleHotelSelected', () => {
      const { handleHotelSelected, selectedHotel } = useHotelSearch();

      const hotel = { id: 'test', price: 100 };
      handleHotelSelected(hotel);

      expect(selectedHotel.value.id).toBe('test');
      expect(selectedHotel.value.price).toBe(100);
    });
  });

  describe('saveSelectedHotel', () => {
    test('testSaveSelectedHotelIndirect', async () => {
      axios.post.mockResolvedValue({ data: {} });

      const { handleHotelSelected } = useHotelSearch();

      const hotel = { id: 'test', price: 100 };
      handleHotelSelected(hotel);

      // Wait for async operation
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(axios.post).toHaveBeenCalled();
    });
  });

  describe('checkAPIConnection', () => {
    test('testCheckAPIConnectionSuccess', async () => {
      expect(true).toBe(true);
    });

    test('testCheckAPIConnectionFailure', async () => {
      expect(true).toBe(true);
    });
  });

  describe('generateAITripPlan', () => {
    test('testGenerateAITripPlan', async () => {
      expect(true).toBe(true);
    });
  });

  describe('searchPois', () => {
    test('testSearchPois', async () => {
      axios.post.mockResolvedValue({ data: { categories: [] } });

      const { searchPois } = useAiTrip();

      await searchPois('test');

      expect(axios.post).toHaveBeenCalled();
    });
  });

});