import { mount } from '@vue/test-utils';
import TripBudgetAnalysis from '../TripBudgetAnalysis.vue';
import TripWeatherForecast from '../TripWeatherForecast.vue';
import TripLocalRecommendations from '../TripLocalRecommendations.vue';
import TripPackingList from '../TripPackingList.vue';
import WeatherPackingTips from '../../WeatherPackingTips.vue';
import TravelPlugInfo from '../TravelPlugInfo.vue';

// Mock axios to avoid real API calls
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
  create: jest.fn(() => ({
    post: jest.fn(),
    get: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }))
}));

const axios = require('axios');

// Mock console
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});


 // Test addToPackingList method
 describe('addToPackingList', () => {
    test('testAddToPackingList', async () => {
      // Mock axios to return empty data (no existing packing list)
      axios.get.mockRejectedValue(new Error('API Error'));
      axios.post.mockResolvedValue({ data: {} });

      // Mock localStorage to return null (no saved data)
      const localStorageMock = {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });

      const wrapper = mount(TripPackingList, {
        props: {
          tripId: '123',
          destination: 'Bangkok'
        }
      });

     
      await new Promise(resolve => setTimeout(resolve, 10));
      wrapper.vm.loadPackingList = jest.fn().mockResolvedValue();
      wrapper.vm.categorizedPackingList = {
        categories: [
          { name: 'Essentials', items: [] }
        ]
      };

      // Add item
      wrapper.vm.newPackingItem = 'Passport';
      wrapper.vm.newPackingItemQuantity = 1;
      wrapper.vm.newPackingItemCategory = 'Essentials';

      await wrapper.vm.addPackingItem();

      // Check if item was added
      expect(wrapper.vm.categorizedPackingList.categories.length).toBe(1);
      expect(wrapper.vm.categorizedPackingList.categories[0].name).toBe('Essentials');
      expect(wrapper.vm.categorizedPackingList.categories[0].items.length).toBe(1);
      expect(wrapper.vm.categorizedPackingList.categories[0].items[0].name).toBe('Passport');

      // Clean up
      wrapper.unmount();
    });
  });

  // Test removePackingItem method
  describe('removePackingItem', () => {
    test('testRemovePackingItem', async () => {
      // Mock axios to return empty data (no existing packing list)
      axios.get.mockRejectedValue(new Error('API Error'));
      axios.post.mockResolvedValue({ data: {} });

      // Mock localStorage to return null (no saved data)
      const localStorageMock = {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });

      const wrapper = mount(TripPackingList, {
        props: {
          tripId: '1',
          destination: 'Bangkok'
        }
      });

      // Wait for component to initialize
      await new Promise(resolve => setTimeout(resolve, 10));

      // Manually set up test data
      wrapper.vm.categorizedPackingList = {
        categories: [
          {
            name: 'Essentials',
            items: [
              { name: 'Test Item', quantity: 1, packed: false }
            ]
          }
        ]
      };

      // Get count before removal
      const countBeforeRemove = wrapper.vm.categorizedPackingList.categories[0].items.length;

      // Remove the item (should be at index 0)
      await wrapper.vm.removePackingItem(0, 0);

      // Check if item was removed
      const countAfterRemove = wrapper.vm.categorizedPackingList.categories[0].items.length;
      expect(countAfterRemove).toBe(countBeforeRemove - 1);

      // Clean up
      wrapper.unmount();
    });
  });

  // Test savePackingList method
  describe('savePackingList', () => {
    test('testSavePackingListApi', async () => {
      // Mock API success
      axios.post.mockResolvedValue({ data: {} });

      const wrapper = mount(TripPackingList, {
        props: {
          tripId: '1',
          destination: 'Bangkok'
        }
      });

      // Set data to save
      wrapper.vm.categorizedPackingList = {
        categories: [
          {
            name: 'Essentials',
            items: [
              { name: 'Passport', quantity: 1, packed: false }
            ]
          }
        ]
      };

      // Call save method
      await wrapper.vm.savePackingList();

      // Check if API was called
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3002/api/trips/123/packing-list',
        expect.any(Object)
      );
    });

    test('testSavePackingListApiError', async () => {
      // Mock API error
      axios.post.mockRejectedValue(new Error('API Error'));

      const wrapper = mount(TripPackingList, {
        props: {
          tripId: '1',
          destination: 'Bangkok'
        }
      });

      // Call save method
      await wrapper.vm.savePackingList();

      // Check that console.error was called with the exact message from the code
      expect(console.error).toHaveBeenCalledWith('Error saving packing list to API:', expect.any(Error));

      // Component should still work
      expect(wrapper.exists()).toBe(true);
    });
  });

  // Test addPackingItemFromSuggestion method
  describe('addPackingItemFromSuggestion', () => {
    test('testAddPackingItemFromSuggestion', () => {
      const wrapper = mount(TripPackingList, {
        props: {
          tripId: '1',
          destination: 'Bangkok'
        }
      });

      // Set initial data
      wrapper.vm.categorizedPackingList = {
        categories: [
          { name: 'Electronics', items: [] }
        ]
      };

      // Add item from suggestion
      wrapper.vm.addPackingItemFromSuggestion('Phone Charger');

      // Check if item was added
      expect(wrapper.vm.categorizedPackingList.categories[0].items.length).toBe(1);
      expect(wrapper.vm.categorizedPackingList.categories[0].items[0].name).toBe('Phone Charger');
    });

    test('testAddPackingItemFromSuggestionIncrement', () => {
      const wrapper = mount(TripPackingList, {
        props: {
          tripId: '1',
          destination: 'Bangkok'
        }
      });

      // Set initial data with existing item
      wrapper.vm.categorizedPackingList = {
        categories: [
          {
            name: 'Electronics',
            items: [
              { name: 'Phone Charger', quantity: 1, packed: false }
            ]
          }
        ]
      };

      // Add same item again
      wrapper.vm.addPackingItemFromSuggestion('Phone Charger');

      // Check if quantity was incremented
      expect(wrapper.vm.categorizedPackingList.categories[0].items[0].quantity).toBe(2);
    });

    test('testAddPackingItemFromSuggestionApiError', () => {
      // Mock API error for savePackingList
      axios.post.mockRejectedValue(new Error('API Error'));

      // Mock localStorage to return null (no saved data)
      const localStorageMock = {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });

      const wrapper = mount(TripPackingList, {
        props: {
          tripId: '1',
          destination: 'Bangkok'
        }
      });

      // Set initial data
      wrapper.vm.categorizedPackingList = {
        categories: [
          { name: 'Electronics', items: [] }
        ]
      };

      // Add item from suggestion
      wrapper.vm.addPackingItemFromSuggestion('Phone Charger');

      // Check if item was still added (should work despite API error due to localStorage fallback)
      expect(wrapper.vm.categorizedPackingList.categories[0].items.length).toBe(1);
      expect(wrapper.vm.categorizedPackingList.categories[0].items[0].name).toBe('Phone Charger');
    });
  });

  // Test getPlugInfo method from TravelPlugInfo component
  describe('getPlugInfo', () => {
    test('testGetPlugInfoReturnsStringForKnownDestination', async () => {
      const wrapper = mount(TravelPlugInfo, {
        props: {
          destination: 'Bangkok'
        }
      });

      // Call the exposed getPlugInfo method
      const result = await wrapper.vm.getPlugInfo('Bangkok');

      // Check that it returns a string
      expect(typeof result).toBe('string');

      // Check that the string contains expected information for Thailand
      expect(result).toContain('Plug Types: A, B, C, O');
      expect(result).toContain('Voltage: 220V');
      expect(result).toContain('Frequency: 50Hz');
      expect(result).toContain('Thailand primarily uses Type O');

      // Clean up
      wrapper.unmount();
    });

    test('testGetPlugInfoReturnsStringForUnknownDestination', async () => {
      // Mock axios to simulate API error for unknown destination
      axios.post.mockRejectedValue(new Error('API Error'));

      const wrapper = mount(TravelPlugInfo, {
        props: {
          destination: 'Unknown City'
        }
      });

      // Call the exposed getPlugInfo method
      const result = await wrapper.vm.getPlugInfo('Unknown City');

      // Check that it returns a string even for unknown destinations
      expect(typeof result).toBe('string');

      // Check that it contains default information
      expect(result).toContain('Plug Types: Various');
      expect(result).toContain('Voltage: 110-240V');
      expect(result).toContain('Frequency: 50/60Hz');

      // Clean up
      wrapper.unmount();
    });

});