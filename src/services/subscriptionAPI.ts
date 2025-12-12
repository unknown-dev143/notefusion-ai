import { apiClient, ApiResponse } from './apiClient';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing_interval: 'monthly' | 'yearly' | 'lifetime';
  features: Array<{
    name: string;
    value: string | number;
    included: boolean;
  }>;
  limits: {
    notes_per_month: number;
    storage_gb: number;
    ai_requests_per_month: number;
    collaboration_sessions: number;
    video_processing_minutes: number;
    audio_processing_minutes: number;
  };
  is_popular: boolean;
  is_active: boolean;
  trial_days: number;
  created_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  trial_start?: string;
  trial_end?: string;
  canceled_at?: string;
  ended_at?: string;
  auto_renew: boolean;
  payment_method_id?: string;
  usage: {
    notes_used: number;
    storage_used: number;
    ai_requests_used: number;
    collaboration_sessions_used: number;
    video_minutes_used: number;
    audio_minutes_used: number;
  };
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal';
  brand?: string;
  last4: string;
  expiry_month?: number;
  expiry_year?: number;
  is_default: boolean;
  created_at: string;
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  due_date: string;
  paid_at?: string;
  created_at: string;
  pdf_url?: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }>;
}

export interface Usage {
  period: {
    start: string;
    end: string;
  };
  metrics: {
    notes_created: number;
    storage_used: number;
    ai_requests: number;
    collaboration_sessions: number;
    video_minutes_processed: number;
    audio_minutes_processed: number;
    api_calls: number;
  };
  limits: {
    notes_per_month: number;
    storage_gb: number;
    ai_requests_per_month: number;
    collaboration_sessions: number;
    video_processing_minutes: number;
    audio_processing_minutes: number;
  };
  percentages: {
    notes_used: number;
    storage_used: number;
    ai_requests_used: number;
    collaboration_sessions_used: number;
    video_minutes_used: number;
    audio_minutes_used: number;
  };
}

class SubscriptionAPI {
  // Plans
  async getPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    return apiClient.get('/subscription/plans');
  }

  async getPlan(planId: string): Promise<ApiResponse<SubscriptionPlan>> {
    return apiClient.get(`/subscription/plans/${planId}`);
  }

  // User Subscription
  async getUserSubscription(): Promise<ApiResponse<UserSubscription>> {
    return apiClient.get('/subscription/me');
  }

  async createSubscription(data: {
    plan_id: string;
    payment_method_id: string;
    trial?: boolean;
  }): Promise<ApiResponse<UserSubscription>> {
    return apiClient.post('/subscription/create', data);
  }

  async updateSubscription(data: {
    plan_id?: string;
    auto_renew?: boolean;
  }): Promise<ApiResponse<UserSubscription>> {
    return apiClient.put('/subscription/me', data);
  }

  async cancelSubscription(data: {
    reason?: string;
    feedback?: string;
    immediate?: boolean;
  }): Promise<ApiResponse<{ canceled_at: string; access_until: string }>> {
    return apiClient.post('/subscription/cancel', data);
  }

  async reactivateSubscription(): Promise<ApiResponse<UserSubscription>> {
    return apiClient.post('/subscription/reactivate');
  }

  // Payment Methods
  async getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    return apiClient.get('/subscription/payment-methods');
  }

  async addPaymentMethod(paymentMethod: {
    type: 'card' | 'bank_account' | 'paypal';
    token: string;
    is_default?: boolean;
  }): Promise<ApiResponse<PaymentMethod>> {
    return apiClient.post('/subscription/payment-methods', paymentMethod);
  }

  async updatePaymentMethod(methodId: string, data: {
    is_default?: boolean;
  }): Promise<ApiResponse<PaymentMethod>> {
    return apiClient.put(`/subscription/payment-methods/${methodId}`, data);
  }

  async deletePaymentMethod(methodId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/subscription/payment-methods/${methodId}`);
  }

  // Billing
  async getInvoices(params?: {
    status?: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<{ invoices: Invoice[]; total: number }>> {
    return apiClient.get('/subscription/invoices', params);
  }

  async getInvoice(invoiceId: string): Promise<ApiResponse<Invoice>> {
    return apiClient.get(`/subscription/invoices/${invoiceId}`);
  }

  async downloadInvoice(invoiceId: string): Promise<ApiResponse<{ pdf_url: string }>> {
    return apiClient.get(`/subscription/invoices/${invoiceId}/download`);
  }

  // Usage
  async getUsage(params?: {
    period?: 'current' | 'previous' | string;
  }): Promise<ApiResponse<Usage>> {
    return apiClient.get('/subscription/usage', params);
  }

  async getUsageHistory(params?: {
    period_start?: string;
    period_end?: string;
    granularity?: 'daily' | 'weekly' | 'monthly';
  }): Promise<ApiResponse<Array<{
    date: string;
    metrics: Usage['metrics'];
    percentages: Usage['percentages'];
  }>>> {
    return apiClient.get('/subscription/usage/history', params);
  }

  // Trials
  async startTrial(planId: string): Promise<ApiResponse<{
    subscription: UserSubscription;
    trial_end: string;
  }>> {
    return apiClient.post('/subscription/trial/start', { plan_id: planId });
  }

  async getTrialStatus(): Promise<ApiResponse<{
    is_eligible: boolean;
    trial_available: boolean;
    trial_days_remaining?: number;
  }>> {
    return apiClient.get('/subscription/trial/status');
  }

  // Coupons and Discounts
  async validateCoupon(code: string, planId?: string): Promise<ApiResponse<{
    valid: boolean;
    discount_type: 'percentage' | 'fixed_amount';
    discount_value: number;
    applies_to_plans: string[];
    expires_at?: string;
    usage_limit?: number;
    times_used: number;
  }>> {
    return apiClient.post('/subscription/coupons/validate', { code, plan_id: planId });
  }

  async applyCoupon(code: string): Promise<ApiResponse<{
    subscription: UserSubscription;
    discount_applied: boolean;
  }>> {
    return apiClient.post('/subscription/coupons/apply', { code });
  }

  // Upgrades/Downgrades
  async previewPlanChange(planId: string): Promise<ApiResponse<{
    proration_amount: number;
    next_billing_date: string;
    immediate_charge?: number;
    credit_amount?: number;
  }>> {
    return apiClient.post('/subscription/preview-change', { plan_id: planId });
  }

  async changePlan(planId: string, immediate?: boolean): Promise<ApiResponse<UserSubscription>> {
    return apiClient.post('/subscription/change-plan', { 
      plan_id: planId, 
      immediate 
    });
  }

  // Enterprise
  async getEnterpriseInfo(): Promise<ApiResponse<{
    is_enterprise: boolean;
    company_name?: string;
    team_size?: number;
    custom_features?: string[];
    dedicated_support?: boolean;
    sla?: string;
  }>> {
    return apiClient.get('/subscription/enterprise');
  }

  async requestEnterprise(data: {
    company_name: string;
    company_size: string;
    contact_name: string;
    contact_email: string;
    phone?: string;
    requirements?: string[];
  }): Promise<ApiResponse<{ request_id: string }>> {
    return apiClient.post('/subscription/enterprise/request', data);
  }

  // Analytics
  async getSubscriptionAnalytics(params?: {
    period_start?: string;
    period_end?: string;
    granularity?: 'daily' | 'weekly' | 'monthly';
  }): Promise<ApiResponse<{
    revenue: Array<{
      date: string;
      mrr: number;
      arr: number;
      new_subscriptions: number;
      cancellations: number;
      upgrades: number;
      downgrades: number;
    }>;
    plans: Array<{
      plan_id: string;
      plan_name: string;
      subscribers: number;
      revenue: number;
      churn_rate: number;
    }>;
    usage_trends: Array<{
      date: string;
      avg_usage_per_user: number;
      top_features: Array<{
        feature: string;
        usage: number;
      }>;
    }>;
  }>> {
    return apiClient.get('/subscription/analytics', params);
  }

  // Webhooks
  async getWebhookEndpoints(): Promise<ApiResponse<Array<{
    id: string;
    url: string;
    events: string[];
    secret: string;
    active: boolean;
    created_at: string;
  }>>> {
    return apiClient.get('/subscription/webhooks');
  }

  async createWebhook(data: {
    url: string;
    events: string[];
    secret?: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.post('/subscription/webhooks', data);
  }

  async updateWebhook(webhookId: string, data: {
    url?: string;
    events?: string[];
    active?: boolean;
  }): Promise<ApiResponse<any>> {
    return apiClient.put(`/subscription/webhooks/${webhookId}`, data);
  }

  async deleteWebhook(webhookId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/subscription/webhooks/${webhookId}`);
  }

  async testWebhook(webhookId: string): Promise<ApiResponse<{ success: boolean; response?: string }>> {
    return apiClient.post(`/subscription/webhooks/${webhookId}/test`);
  }
}

export const subscriptionAPI = new SubscriptionAPI();
