import axios from 'axios';

// Using process.env for Vite environment variables
const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001/api';

export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  isPopular?: boolean;
  limits: {
    transcriptionMinutes: number;
    aiGenerations: number;
    storageMB: number;
  };
}

export interface Subscription {
  id: string;
  userId: string;
  tierId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  usage: {
    transcriptionMinutes: {
      used: number;
      total: number;
    };
    aiGenerations: {
      used: number;
      total: number;
    };
    storageMB: {
      used: number;
      total: number;
    };
  };
}

export const subscriptionApi = {
  // Get all available subscription tiers
  async getSubscriptionTiers(): Promise<SubscriptionTier[]> {
    try {
      const response = await axios.get<SubscriptionTier[]>(
        `${API_BASE_URL}/subscription/tiers`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch subscription tiers:', error);
      throw error;
    }
  },

  // Get current user's subscription
  async getCurrentSubscription(): Promise<Subscription | null> {
    try {
      const response = await axios.get<Subscription>(
        `${API_BASE_URL}/subscription`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null; // No active subscription
      }
      console.error('Failed to fetch current subscription:', error);
      throw error;
    }
  },

  // Create a checkout session for a subscription
  async createCheckoutSession(tierId: string): Promise<{ url: string }> {
    try {
      const response = await axios.post<{ url: string }>(
        `${API_BASE_URL}/subscription/checkout`,
        { tierId },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      throw error;
    }
  },

  // Update subscription (upgrade/downgrade)
  async updateSubscription(tierId: string): Promise<Subscription> {
    try {
      const response = await axios.put<Subscription>(
        `${API_BASE_URL}/subscription`,
        { tierId },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update subscription:', error);
      throw error;
    }
  },

  // Cancel subscription
  async cancelSubscription(): Promise<Subscription> {
    try {
      const response = await axios.post<Subscription>(
        `${API_BASE_URL}/subscription/cancel`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  },

  // Get subscription usage
  async getUsage(): Promise<Subscription['usage']> {
    try {
      const response = await axios.get<Subscription['usage']>(
        `${API_BASE_URL}/subscription/usage`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch subscription usage:', error);
      throw error;
    }
  },

  // Update payment method
  async updatePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/subscription/payment-method`,
        { paymentMethodId },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error('Failed to update payment method:', error);
      throw error;
    }
  },

  // Get billing history
  async getBillingHistory(): Promise<Array<{
    id: string;
    amount: number;
    currency: string;
    date: string;
    status: 'paid' | 'pending' | 'failed';
    receiptUrl?: string;
  }>> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/subscription/invoices`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch billing history:', error);
      throw error;
    }
  },
};

export default subscriptionApi;
