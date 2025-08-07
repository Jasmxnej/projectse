import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomePage.vue'
import Login from '@/views/Login.vue'
import SignUp from '@/views/SignUp.vue'
import StartPlan from '@/views/StartPlan.vue'
import TripSummary from '@/views/trip/TripSummary.vue'
import DailySchedule from '@/views/trip/DailySchedule.vue'
import flight from '@/views/trip/Flight.vue'
import hotel from '@/views/trip/Hotel.vue'
import SummaryPageMyTrip from '@/views/trip/SummaryPageMyTrip.vue'
import TripLayout from '@/views/trip/TripLayout.vue';
import { useAuthStore } from '@/stores/auth';
import { useTripStore } from '@/stores/trip';
import api from '@/api';
import ModifyStartPlan from '@/views/trip/ModifyStartPlan.vue'
import ModifyFlight from '@/views/trip/ModifyFlight.vue'
import ModifyHotel from '@/views/trip/ModifyHotel.vue'
import ModifyDailySchedule from '@/views/trip/ModifyDailySchedule.vue'
import Profile from '@/views/Profile.vue'
import MyTrips from '@/views/MyTrips.vue'
import Contact from '@/views/Contact.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
     {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUp,
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: { requiresAuth: true }
    },
    {
      path: '/mytrips',
      name: 'mytrips',
      component: MyTrips,
      meta: { requiresAuth: true }
    },
     {
      path: '/startplan',
      name: 'startplan',
      component: StartPlan,
      meta: { requiresAuth: true }
    },
    {
      path: '/trip/:tripId',
      component: TripLayout,
      meta: { requiresAuth: true },
      children: [
        { path: 'flight', name: 'flight', component: flight },
        { path: 'hotel', name: 'hotel', component: hotel },
        { path: 'schedule', name: 'schedule', component: DailySchedule },
        { path: 'summary', name: 'summary', component: TripSummary },
        { path: 'summarypagemytrip', name: 'summarypagemytrip', component: SummaryPageMyTrip },
        { path: 'modifystartplan', name: 'modifystartplan', component: ModifyStartPlan },
        { path: 'modifyflight', name: 'modifyflight', component: ModifyFlight },
        { path: 'modifyhotel', name: 'modifyhotel', component: ModifyHotel },
        { path: 'modifyschedule', name: 'modifyschedule', component: ModifyDailySchedule },
      ]
    },
    {
      path: '/contact',
      name: 'contact',
      component: Contact,
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const tripStore = useTripStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isAuthenticated) {
    return next({ path: '/login', query: { redirect: to.fullPath } });
  }

  if (to.params.tripId && (!tripStore.tripId || tripStore.tripId.toString() !== to.params.tripId)) {
    try {
      const tripId = Array.isArray(to.params.tripId) ? to.params.tripId[0] : to.params.tripId;
      if (tripId) {
        const tripData = await api.getTripById(tripId);
        tripStore.setTripDetails(tripData);
        tripStore.setTripId(tripData.id);
      }
    } catch (error) {
      console.error('Failed to fetch trip details:', error);
      return next({ name: 'home' });
    }
  }
  
  next();
});

export default router