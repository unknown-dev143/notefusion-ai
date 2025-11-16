import api from './api';

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  isActive: boolean;
  billingCycle: 'monthly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

export const getPricingTiers = async (): Promise<PricingTier[]> => {
  const response = await api.get('/admin/pricing/tiers');
  return response.data;
};

export const updatePricingTier = async (
  tierId: string, 
  updates: Partial<Omit<PricingTier, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<PricingTier> => {
  const response = await api.put(`/admin/pricing/tiers/${tierId}`, updates);
  return response.data;
};

export const createPricingTier = async (
  tier: Omit<PricingTier, 'id' | 'createdAt' | 'updatedAt'>
): Promise<PricingTier> => {
  const response = await api.post('/admin/pricing/tiers', tier);
  return response.data;
};

export const deletePricingTier = async (tierId: string): Promise<void> => {
  await api.delete(`/admin/pricing/tiers/${tierId}`);
};
