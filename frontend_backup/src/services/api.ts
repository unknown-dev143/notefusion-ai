// API service for subscription-related requests
import axios from 'axios';
import { API_URL } from '../config';

const API_BASE_URL = API_URL;

export const subscriptionApi = {
  // Get current subscription details
  getCurrentSubscription: async () => {
    const response = await axios.get(`${API_BASE_URL}/subscription`);
    return response.data;
  },
  
  // Update subscription plan
  updateSubscription: async (planId: string) => {
    const response = await axios.post(`${API_BASE_URL}/subscription`, { planId });
    return response.data;
  },
  
  // Get subscription usage
  getUsage: async () => {
    const response = await axios.get(`${API_BASE_URL}/subscription/usage`);
    return response.data;
  }
};

export default {
  subscription: subscriptionApi
};
