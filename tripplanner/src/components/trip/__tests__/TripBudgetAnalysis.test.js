import { mount } from '@vue/test-utils';
import TripBudgetAnalysis from '../TripBudgetAnalysis.vue';

// Mock axios to avoid real API calls
jest.mock('axios', () => ({
  post: jest.fn()
}));

const axios = require('axios');

// Mock console methods to suppress error logging in tests
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});


describe('TripBudgetAnalysis Component', () => {
  // Test case 1: Check if component can be created
  test('testTripBudgetAnalysisMount', () => {
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
  test('testGenerateBudgetAnalysisSuccess', async () => {
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
    // Wait for the async generateBudgetAnalysis to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if axios was called
    expect(axios.post).toHaveBeenCalled();
    // Check if budget analysis was set
    expect(wrapper.vm.budgetAnalysis).toBe('Your budget looks good for Bangkok trip!');
  });

  // Test case 3: Check error handling when API fails
  test('testGenerateBudgetAnalysisApiError', async () => {
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
    // Wait for the async generateBudgetAnalysis to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Component should still work even with API error
    expect(wrapper.exists()).toBe(true);
    // Check if fallback message was set for over budget
    expect(wrapper.vm.budgetAnalysis).toContain('over budget');
  });

  // Test case 4: Check remaining budget calculation
  test('testCalculateRemainingBudget', () => {
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