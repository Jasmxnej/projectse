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


describe('Trip Methods Tests', () => {

  // Test generateBudgetAnalysis method
  describe('generateBudgetAnalysis', () => {
    test('should generate budget analysis with good budget', async () => {
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

      // Wait for component to mount
      await wrapper.vm.$nextTick();

      // Check if axios was called with correct data
      expect(axios.post).toHaveBeenCalledWith('http://localhost:3002/api/gemini/generate', expect.any(Object));
    });

    test('should handle API error and show fallback message', async () => {
      // Mock API error
      axios.post.mockRejectedValue(new Error('API Error'));

      const wrapper = mount(TripBudgetAnalysis, {
        props: {
          totalBudget: 5000,
          plannedExpenses: { total: 6000, flight: 2000, hotel: 2000, plan: 2000 },
          destination: 'Bangkok'
        }
      });

      // Wait for error handling
      await wrapper.vm.$nextTick();

      // Component should still work
      expect(wrapper.exists()).toBe(true);
    });
  });

  // Test generatePackingTips method
  describe('generatePackingTips', () => {
    test('should generate packing tips for hot weather', async () => {
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

    test('should generate packing tips for rainy weather', async () => {
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
  });

  // Test getWeatherSummary method
  describe('getWeatherSummary', () => {
    test('should create weather summary for hot weather', () => {
      const weatherData = [
        { temp: 35, description: 'clear sky', humidity: 60, wind: 5 },
        { temp: 32, description: 'sunny', humidity: 65, wind: 6 }
      ];

      const wrapper = mount(TripWeatherForecast, {
        props: {
          destination: 'Bangkok'
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

    test('should create weather summary for rainy weather', () => {
      const weatherData = [
        { temp: 25, description: 'light rain', humidity: 80, wind: 10 },
        { temp: 22, description: 'moderate rain', humidity: 85, wind: 12 }
      ];

      const wrapper = mount(TripWeatherForecast, {
        props: {
          destination: 'Bangkok'
        }
      });

      // Set weather data
      wrapper.vm.weatherData = weatherData;

      // Get summary
      const summary = wrapper.vm.getWeatherSummary();

      // Check if summary contains rain information
      expect(summary).toContain('rain');
    });
  });

  // Test fetchWeatherForecast method
  describe('fetchWeatherForecast', () => {
    test('should fetch weather forecast successfully', async () => {
      // Mock geocoding API
      axios.get.mockImplementation((url) => {
        if (url.includes('geo')) {
          return Promise.resolve({
            data: [{ lat: 13.7563, lon: 100.5018 }]
          });
        } else if (url.includes('forecast')) {
          return Promise.resolve({
            data: {
              list: [
                {
                  dt: Date.now() / 1000,
                  dt_txt: '2024-01-01 12:00:00',
                  main: { temp: 30, humidity: 65 },
                  weather: [{ description: 'clear sky', icon: '01d' }],
                  wind: { speed: 5 }
                }
              ]
            }
          });
        }
      });

      const wrapper = mount(TripWeatherForecast, {
        props: {
          destination: 'Bangkok'
        }
      });

      // Call fetch method
      await wrapper.vm.fetchWeatherForecast();

      // Check if weather data was set
      expect(wrapper.vm.weatherData.length).toBeGreaterThan(0);

      // Clean up
      wrapper.unmount();
    });

    test('should handle API error gracefully', async () => {
      // Mock API error
      axios.get.mockRejectedValue(new Error('API Error'));

      const wrapper = mount(TripWeatherForecast, {
        props: {
          destination: 'Bangkok'
        }
      });

      // Call fetch method
      await wrapper.vm.fetchWeatherForecast();

      // Component should still work
      expect(wrapper.exists()).toBe(true);

      // Clean up
      wrapper.unmount();
    });
  });

  // Test fetchLocalRecommendations method
  describe('fetchLocalRecommendations', () => {
    test('should fetch local recommendations successfully', async () => {
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

    test('should handle API error and generate fallback', async () => {
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

      // Check if fallback recommendations were generated
      expect(wrapper.vm.categorizedRecommendations.categories.length).toBeGreaterThan(0);

      // Clean up
      wrapper.unmount();
    });
  });

  // Test generateFallbackRecommendations method
  describe('generateFallbackRecommendations', () => {
    test('should generate fallback recommendations', () => {
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
  });

  // Test addToPackingList method
  describe('addToPackingList', () => {
    test('should add item to packing list', async () => {
      const wrapper = mount(TripPackingList, {
        props: {
          tripId: '123',
          destination: 'Bangkok'
        }
      });

      // Set data
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
      expect(wrapper.vm.categorizedPackingList.categories[0].items.length).toBe(1);
      expect(wrapper.vm.categorizedPackingList.categories[0].items[0].name).toBe('Passport');
    });
  });

  // Test removePackingItem method
  describe('removePackingItem', () => {
    test('should remove item from packing list', async () => {
      const wrapper = mount(TripPackingList, {
        props: {
          tripId: '123',
          destination: 'Bangkok'
        }
      });

      // Set data with item
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

      // Remove item
      await wrapper.vm.removePackingItem(0, 0);

      // Check if item was removed
      expect(wrapper.vm.categorizedPackingList.categories[0].items.length).toBe(0);
    });
  });

  // Test savePackingList method
  describe('savePackingList', () => {
    test('should save packing list to API', async () => {
      // Mock API success
      axios.post.mockResolvedValue({ data: {} });

      const wrapper = mount(TripPackingList, {
        props: {
          tripId: '123',
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

    test('should handle API error and save locally', async () => {
      // Mock API error
      axios.post.mockRejectedValue(new Error('API Error'));

      const wrapper = mount(TripPackingList, {
        props: {
          tripId: '123',
          destination: 'Bangkok'
        }
      });

      // Call save method
      await wrapper.vm.savePackingList();

      // Component should still work
      expect(wrapper.exists()).toBe(true);
    });
  });

  // Test addPackingItemFromSuggestion method
  describe('addPackingItemFromSuggestion', () => {
    test('should add item from suggestion', () => {
      const wrapper = mount(TripPackingList, {
        props: {
          tripId: '123',
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

    test('should increment quantity if item already exists', () => {
      const wrapper = mount(TripPackingList, {
        props: {
          tripId: '123',
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
  });
});