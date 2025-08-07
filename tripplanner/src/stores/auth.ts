import { defineStore } from 'pinia';
import api from '@/api';
import { mockUser } from '@/composables/mockData';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user,
  },
  actions: {
    setToken(token: string) {
      this.token = token;
      localStorage.setItem('token', token);
    },
    setUser(user: any) {
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    async fetchUser() {
      if (this.token) {
        try {
          const { data } = await api.get('/auth/me');
          this.setUser(data);
        } catch (error) {
          console.error('Failed to fetch user, using mock user', error);
          this.setUser(mockUser);
        }
      }
    },
    async mockLogin() {
      console.log('Using mock login');
      this.setToken('mock-token');
      this.setUser(mockUser);
    },
  },
});