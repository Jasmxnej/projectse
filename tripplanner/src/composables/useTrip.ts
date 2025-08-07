import { ref, reactive, computed, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useTripStore } from '@/stores/trip';

interface Recommendation {
  id: number;
  image: string;
  name: string;
  description: string;
}

interface TripActivity {
  id: number;
  image: string;
  name: string;
  time: string;
  cost: number;
}

interface TripDay {
  id: number;
  dayNumber: number;
  name: string | null;
  activities: TripActivity[];
}

import type { Flight } from '@/types/flight';
import type { Hotel } from '@/types/hotel';

export function useTrip() {
  const tripStore = useTripStore();
  const destination = computed(() => tripStore.destination);
  const formData = reactive({
    destination: tripStore.destination,
    startDate: tripStore.startDate,
    endDate: tripStore.endDate,
    budget: tripStore.budget,
    groupSize: tripStore.groupSize,
    transport: tripStore.transport,
    activities: tripStore.activities,
    otherActivity: tripStore.otherActivity,
    specialNeeds: tripStore.specialNeeds
  });

  const recommendedItems = ref<Recommendation[]>([
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1552960562-daf630e9278b?w=150&h=150&fit=crop',
      name: 'Mon Cham (Mon Jam)',
      description: 'Beautiful mountain viewpoint'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=150&h=150&fit=crop',
      name: 'Wat Phra That Doi Suthep',
      description: 'Historic temple on mountain'
    },
  ]);

  const tripDays = ref<TripDay[]>([
    {
      id: 1,
      dayNumber: 1,
      name: null,
      activities: [
        {
          id: 1,
          image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100&h=75&fit=crop',
          name: 'Khao Soi at Khun Yai',
          time: '12:00',
          cost: 150
        },
        {
          id: 2,
          image: 'https://images.unsplash.com/photo-157189634982d?w=100&h=75&fit:crop',
          name: 'House by Ginger',
          time: '16:00',
          cost: 850
        },
      ],
    },
  ]);

  const selectedFlight = ref<Flight | null>(null);
  const selectedHotel = ref<Hotel | null>(null);
  const totalBudget = ref(tripStore.budget);

  const computedPlannedExpenses = computed(() => {
    let totalPlanCost = 0;
    let totalFlightCost = selectedFlight.value ? parseFloat(selectedFlight.value.price.total) : 0;
    let totalHotelCost = selectedHotel.value ? selectedHotel.value.price: 0;

    for (const day of tripDays.value) {
      for (const activity of day.activities) {
        totalPlanCost += activity.cost;
      }
    }
    return {
      plan: totalPlanCost,
      flight: totalFlightCost,
      hotel: totalHotelCost,
      total: totalPlanCost + totalFlightCost + totalHotelCost,
    };
  });

  const remainingBudget = computed(() => {
    return totalBudget.value - computedPlannedExpenses.value.total;
  });

  const addDay = () => {
    const nextDayNumber = tripDays.value.length > 0 ? Math.max(...tripDays.value.map(d => d.dayNumber)) + 1 : 1;
    const newDay: TripDay = {
      id: Date.now(),
      dayNumber: nextDayNumber,
      name: null,
      activities: [],
    };
    tripDays.value.push(newDay);
  };

  const addRecommendationToPlan = (item: Recommendation) => {
    if (tripDays.value.length > 0) {
      const day = tripDays.value[0];
      const newActivity: TripActivity = {
        id: Date.now(),
        image: item.image,
        name: item.name,
        time: '00:00',
        cost: 0,
      };
      day.activities.push(newActivity);
    }
  };

  const addActivityToDay = (dayId: number) => {
    const day = tripDays.value.find(d => d.id === dayId);
    if (day) {
      const newActivity: TripActivity = {
        id: Date.now(),
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100&h=75&fit:crop',
        name: 'New Activity',
        time: '00:00',
        cost: 0,
      };
      day.activities.push(newActivity);
    }
  };

  const updateActivity = (payload: { dayId: number, activityId: number, updatedData: TripActivity }) => {
    const day = tripDays.value.find(d => d.id === payload.dayId);
    if (day) {
      const activityIndex = day.activities.findIndex(a => a.id === payload.activityId);
      if (activityIndex !== -1) {
        payload.updatedData.cost = Number(payload.updatedData.cost);
        Object.assign(day.activities[activityIndex], payload.updatedData);
      }
    }
  };

  const deleteActivity = (payload: { dayId: number, activityId: number }) => {
    const day = tripDays.value.find(d => d.id === payload.dayId);
    if (day) {
      day.activities = day.activities.filter(a => a.id !== payload.activityId);
    }
  };

  return {
    formData,
    recommendedItems,
    tripDays,
    selectedFlight,
    selectedHotel,
    totalBudget,
    computedPlannedExpenses,
    remainingBudget,
    addDay,
    addRecommendationToPlan,
    addActivityToDay,
    updateActivity,
    deleteActivity,
    destination,
  };
}