import { mount } from '@vue/test-utils';
import TripBudgetAnalysis from '../TripBudgetAnalysis.vue';
import TripWeatherForecast from '../TripWeatherForecast.vue';
import TripLocalRecommendations from '../TripLocalRecommendations.vue';
import TripPackingList from '../TripPackingList.vue';
import WeatherPackingTips from '../../WeatherPackingTips.vue';

// Mock axios to avoid real API calls
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn()
}));

const axios = require('axios');

// Mock console methods to suppress error logging in tests
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});


describe('Trip Methods Tests', () => {

  // Test generateBudgetAnalysis method
  describe('generateBudgetAnalysis', () => {
    test('testGenerateBudgetAnalysisGoodBudget', async () => {
      // Mock successful API response
      axios.post.mockResolvedValue({
        data: { text: 'Your budget looks good!' }
      });

      const wrapper = mount(TripBudgetAnalysis, {
        props: {
          totalBudget: 10000,
          plannedExpenses: { total: 5000, flight: 2000, hotel: 2000, plan: 1000 },
          destination: 'Bangkok'
        }
      });

      // Wait for component to mount and method to complete
      await wrapper.vm.$nextTick();
      // Wait for the async generateBudgetAnalysis to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if axios was called with correct data
      expect(axios.post).toHaveBeenCalledWith('http://localhost:3002/api/gemini/generate', expect.any(Object));
      // Check if budget analysis was set
      expect(wrapper.vm.budgetAnalysis).toBe('Your budget looks good!');
    });

    test('testGenerateBudgetAnalysisApiError', async () => {
      // Mock API error
      axios.post.mockRejectedValue(new Error('API Error'));

      const wrapper = mount(TripBudgetAnalysis, {
        props: {
          totalBudget: 10000,
          plannedExpenses: { total: 5000, flight: 2000, hotel: 2000, plan: 1000 },
          destination: 'Bangkok'
        }
      });

      // Wait for error handling
      await wrapper.vm.$nextTick();
      // Wait for the async generateBudgetAnalysis to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check that console.error was called with the exact message from the code
      expect(console.error).toHaveBeenCalledWith('Error generating budget analysis:', expect.any(Error));

      // Component should still work
      expect(wrapper.exists()).toBe(true);
      // Check if fallback message was set
      expect(wrapper.vm.budgetAnalysis).toContain('Your budget looks good!');
    });
  });

  // Test generatePackingTips method
  describe('generatePackingTips', () => {
    test('testGeneratePackingTipsHotWeather', async () => {
      const weatherData = [
        { temp: 35, description: 'clear sky', humidity: 60 },
        { temp: 32, description: 'sunny', humidity: 65 }
      ];

      const wrapper = mount(WeatherPackingTips, {
        props: {
          weatherData: weatherData,
          destination: 'Bangkok'
        }
      });

      // Wait for tips to generate
      await wrapper.vm.$nextTick();

      // Check if tips were generated
      expect(wrapper.vm.packingTips.length).toBeGreaterThan(0);
    });

    test('testGeneratePackingTipsRainyWeather', async () => {
      const weatherData = [
        { temp: 25, description: 'light rain', humidity: 80 },
        { temp: 22, description: 'moderate rain', humidity: 85 }
      ];

      const wrapper = mount(WeatherPackingTips, {
        props: {
          weatherData: weatherData,
          destination: 'Bangkok'
        }
      });

      // Wait for tips to generate
      await wrapper.vm.$nextTick();

      // Check if rain-related tips were generated
      const tipsText = wrapper.vm.packingTips.join(' ').toLowerCase();
      expect(tipsText).toContain('rain');
    });

    test('testGeneratePackingTipsApiError', async () => {
      // Mock API error
      axios.post.mockRejectedValue(new Error('API Error'));

      const weatherData = [
        { temp: 35, description: 'clear sky', humidity: 60 },
        { temp: 32, description: 'sunny', humidity: 65 }
      ];

      const wrapper = mount(WeatherPackingTips, {
        props: {
          weatherData: weatherData,
          destination: 'Bangkok'
        }
      });

      // Wait for tips to generate and error handling to complete
      await wrapper.vm.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check that console.error was called with the exact message from the code
      expect(console.error).toHaveBeenCalledWith('Error getting destination-specific packing tips:', expect.any(Error));

      // The function should still process weather data and not crash
      expect(wrapper.vm.packingTips).toBeDefined();
      expect(wrapper.vm.quickAddItems).toBeDefined();
      expect(wrapper.exists()).toBe(true);
    });
  });

  // Test getWeatherSummary method
  describe('getWeatherSummary', () => {
    test('testGetWeatherSummaryHotWeather', () => {
      const weatherData = [
        { temp: 35, description: 'clear sky', humidity: 60, wind: 5 },
        { temp: 32, description: 'sunny', humidity: 65, wind: 6 }
      ];

      const wrapper = mount(TripWeatherForecast, {
        props: {
          destination: 'Bangkok',
          tripId: '123'
        }
      });

      // Set weather data
      wrapper.vm.weatherData = weatherData;

      // Get summary
      const summary = wrapper.vm.getWeatherSummary();

      // Check if summary contains expected text
      expect(summary).toContain('hot');
      expect(summary).toContain('sun');
    });

    test('testGetWeatherSummaryRainyWeather', () => {
      const weatherData = [
        { temp: 25, description: 'light rain', humidity: 80, wind: 10 },
        { temp: 22, description: 'moderate rain', humidity: 85, wind: 12 }
      ];

      const wrapper = mount(TripWeatherForecast, {
        props: {
          destination: 'Bangkok',
          tripId: '123'
        }
      });

      // Set weather data
      wrapper.vm.weatherData = weatherData;

      // Get summary
      const summary = wrapper.vm.getWeatherSummary();

      // Check if summary contains rain information
      expect(summary).toContain('rain');
    });

    test('testGetWeatherSummaryInvalidDate', () => {
      const weatherData = [
        { temp: 25, description: 'clear sky', humidity: 60, date: 'invalid-date' },
        { temp: 22, description: 'sunny', humidity: 65, date: null }
      ];

      const wrapper = mount(TripWeatherForecast, {
        props: {
          destination: 'Bangkok',
          tripId: '123'
        }
      });

      // Set weather data with invalid dates
      wrapper.vm.weatherData = weatherData;

      // Get summary
      const summary = wrapper.vm.getWeatherSummary();

      // Check if summary was generated or not
      expect(summary).toContain('The average temperature');
      expect(typeof summary).toBe('string');
    });

    test('testForcastWeatherDateInvalid', () => {
      const wrapper = mount(TripWeatherForecast, {
        props: {
          destination: 'Bangkok',
          tripId: '123'
        }
      });

      // Test with invalid date string
      const result1 = wrapper.vm.formatWeatherDate('invalid-date');
      expect(result1).toBe('Invalid Date');

      // Test with empty string
      const result2 = wrapper.vm.formatWeatherDate('');
      expect(result2).toBe('Invalid Date');
    });
  });

  // Test fetchWeatherForecast method
  describe('fetchWeatherForecast', () => {
    test('testFetchWeatherForecastSuccess', async () => {
      // Mock trip API
      axios.get.mockImplementation((url) => {
        if (url.includes('/api/trips/by-id/123')) {
          return Promise.resolve({
            data: {
              start_date: '2024-01-01',
              end_date: '2024-01-05'
            }
          });
        } else if (url.includes('geo')) {
          return Promise.resolve({
            data: [{ lat: 13.7563, lon: 100.5018 }]
          });
        } else if (url.includes('forecast')) {
          return Promise.resolve({
            data: {
              list: [
                {
                  dt: new Date('2024-01-01T12:00:00').getTime() / 1000,
                  dt_txt: '2024-01-01 12:00:00',
                  main: { temp: 30, humidity: 65 },
                  weather: [{ description: 'clear sky', icon: '01d' }],
                  wind: { speed: 5 }
                },
                {
                  dt: new Date('2024-01-02T12:00:00').getTime() / 1000,
                  dt_txt: '2024-01-02 12:00:00',
                  main: { temp: 28, humidity: 70 },
                  weather: [{ description: 'sunny', icon: '02d' }],
                  wind: { speed: 6 }
                },
                {
                  dt: new Date('2024-01-03T12:00:00').getTime() / 1000,
                  dt_txt: '2024-01-03 12:00:00',
                  main: { temp: 25, humidity: 75 },
                  weather: [{ description: 'cloudy', icon: '03d' }],
                  wind: { speed: 4 }
                }
              ]
            }
          });
        }
      });

      const wrapper = mount(TripWeatherForecast, {
        props: {
          destination: 'Bangkok',
          tripId: '123'
        }
      });

      // Call fetch methods in order
      await wrapper.vm.fetchTripDetails();
      await wrapper.vm.fetchWeatherForecast();

      // Check if weather data was set
      expect(wrapper.vm.weatherData.length).toBeGreaterThan(0);

      // Clean up
      wrapper.unmount();
    });

    test('testFetchWeatherForecastApiError', async () => {
      // Mock trip API success but weather API error
      axios.get.mockImplementation((url) => {
        if (url.includes('/api/trips/by-id/123')) {
          return Promise.resolve({
            data: {
              start_date: '2024-01-01',
              end_date: '2024-01-05'
            }
          });
        } else {
          return Promise.reject(new Error('API Error'));
        }
      });

      const wrapper = mount(TripWeatherForecast, {
        props: {
          destination: 'Bangkok',
          tripId: '1'
        }
      });

      // Call fetch methods
      await wrapper.vm.fetchTripDetails();
      await wrapper.vm.fetchWeatherForecast();

      // Check that console.error was called with the exact message from the code
      expect(console.error).toHaveBeenCalledWith('Error fetching weather:', expect.any(Error));

      // Component should still work
      expect(wrapper.exists()).toBe(true);

      // Clean up
      wrapper.unmount();
    });
  });

  // Test fetchLocalRecommendations method
  describe('fetchLocalRecommendations', () => {
    test('testFetchLocalRecommendationsSuccess', async () => {
      // Mock all axios calls
      axios.post.mockResolvedValue({
        data: {
          categories: [
            {
              name: 'Food & Drinks',
              items: [
                { name: 'Street Food', description: 'Try local street food', image: '' }
              ]
            }
          ]
        }
      });
      axios.get.mockResolvedValue({ data: { image: 'test-image.jpg' } });

      const wrapper = mount(TripLocalRecommendations, {
        props: {
          destination: 'Bangkok'
        }
      });

      // Call fetch method
      await wrapper.vm.fetchLocalRecommendations();

      // Wait for any async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if recommendations were set
      expect(wrapper.vm.categorizedRecommendations.categories.length).toBeGreaterThan(0);

      // Clean up
      wrapper.unmount();
    });

    test('testFetchLocalRecommendationsApiError', async () => {
      // Mock API error
      axios.post.mockRejectedValue(new Error('API Error'));
      axios.get.mockResolvedValue({ data: { image: 'test-image.jpg' } });

      const wrapper = mount(TripLocalRecommendations, {
        props: {
          destination: 'Bangkok'
        }
      });

      // Call fetch method
      await wrapper.vm.fetchLocalRecommendations();

      // Wait for any async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check that console.error was called with the exact message from the code
      expect(console.error).toHaveBeenCalledWith('Error fetching local recommendations:', expect.any(Error));

      // Check if fallback recommendations were generated
      expect(wrapper.vm.categorizedRecommendations.categories.length).toBeGreaterThan(0);

      wrapper.unmount();
    });
  });

  // Test generateFallbackRecommendations method
  describe('generateFallbackRecommendations', () => {
    test('testGenerateFallbackRecommendations', () => {
      // Mock axios for image loading
      axios.get.mockResolvedValue({ data: { image: 'test-image.jpg' } });

      const wrapper = mount(TripLocalRecommendations, {
        props: {
          destination: 'Bangkok'
        }
      });

      // Call fallback method
      wrapper.vm.generateFallbackRecommendations();

      // Check if recommendations were generated
      expect(wrapper.vm.categorizedRecommendations.categories.length).toBe(4); // Should have 4 categories
      expect(wrapper.vm.categorizedRecommendations.categories[0].name).toBe('Food & Drinks');

      // Clean up
      wrapper.unmount();
    });

    test('testGenerateFallbackRecommendationsEmptyDestination', () => {
      const wrapper = mount(TripLocalRecommendations, {
        props: {
          destination: ''
        }
      });

      // Call fallback method
      wrapper.vm.generateFallbackRecommendations();

      // Check if recommendations were generated with default destination
      expect(wrapper.vm.categorizedRecommendations.categories.length).toBe(4);
      expect(wrapper.vm.categorizedRecommendations.categories[0].name).toBe('Food & Drinks');

      // Clean up
      wrapper.unmount();
    });
  });

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
          tripId: '1',
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
});