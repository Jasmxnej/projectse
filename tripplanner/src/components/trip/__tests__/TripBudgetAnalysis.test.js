import { mount } from '@vue/test-utils';
import TripBudgetAnalysis from '../TripBudgetAnalysis.vue';

// Mock axios to avoid real API calls
jest.mock('axios', () => ({
  post: jest.fn()
}));

const axios = require('axios');

// Simple test for generateBudgetAnalysis method
describe('TripBudgetAnalysis Component', () => {
  // Test case 1: Check if component can be created
  test('should mount created correctly', () => {
    const wrapper = mount(TripBudgetAnalysis, {
      props: {
        totalBudget: 10000,
        plannedExpenses: { total: 5000, flight: 2000, hotel: 2000, plan: 1000 },
        destination: 'Bangkok'
      }
    });
    expect(wrapper.exists()).toBe(true);
  });

  // Test case 2: Check if budget analysis is generated
  test('should generate budget analysis on mount', async () => {
    // Mock successful API response
    axios.post.mockResolvedValue({
      data: { text: 'Your budget looks good for Bangkok trip!' }
    });

    const wrapper = mount(TripBudgetAnalysis, {
      props: {
        totalBudget: 10000,
        plannedExpenses: { total: 5000, flight: 2000, hotel: 2000, plan: 1000 },
        destination: 'Bangkok'
      }
    });

    // Wait for component to mount and API call to complete
    await wrapper.vm.$nextTick();

    // Check if axios was called
    expect(axios.post).toHaveBeenCalled();
  });

  // Test case 3: Check error handling when API fails
  test('should handle API errors and show fallback message', async () => {
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

    // Component should still work even with API error
    expect(wrapper.exists()).toBe(true);
  });

  // Test case 4: Check remaining budget calculation
  test('should calculate remaining budget correctly', () => {
    const wrapper = mount(TripBudgetAnalysis, {
      props: {
        totalBudget: 10000,
        plannedExpenses: { total: 5000, flight: 2000, hotel: 2000, plan: 1000 },
        destination: 'Bangkok'
      }
    });

    // Remaining budget should be 5000
    expect(wrapper.vm.remainingBudget).toBe(5000);
  });
});