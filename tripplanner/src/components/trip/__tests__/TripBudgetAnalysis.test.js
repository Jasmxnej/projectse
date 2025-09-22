import { mount } from '@vue/test-utils';
import TripBudgetAnalysis from '../TripBudgetAnalysis.vue';

// Mock axios to avoid real API calls
jest.mock('axios', () => ({
  post: jest.fn()
}));

const axios = require('axios');

// Mock console
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});


describe('TripBudgetAnalysis Component', () => {
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

  test('testGenerateBudgetAnalysisSuccess', async () => {
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

    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(axios.post).toHaveBeenCalled();
    expect(wrapper.vm.budgetAnalysis).toBe('Your budget looks good for Bangkok trip!');
  });

  test('testGenerateBudgetAnalysisApiError', async () => {
    axios.post.mockRejectedValue(new Error('API Error'));

    const wrapper = mount(TripBudgetAnalysis, {
      props: {
        totalBudget: 5000,
        plannedExpenses: { total: 6000, flight: 2000, hotel: 2000, plan: 2000 },
        destination: 'Bangkok'
      }
    });

    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.vm.budgetAnalysis).toContain('over budget');
  });

  test('testCalculateRemainingBudget', () => {
    const wrapper = mount(TripBudgetAnalysis, {
      props: {
        totalBudget: 10000,
        plannedExpenses: { total: 5000, flight: 2000, hotel: 2000, plan: 1000 },
        destination: 'Bangkok'
      }
    });

    expect(wrapper.vm.remainingBudget).toBe(5000);
  });
});