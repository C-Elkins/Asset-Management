import { api } from './api';

/**
 * Stripe API Service
 * Handles all subscription, payment, and billing operations
 */

export const stripeService = {
  // Subscription Operations
  
  /**
   * Get current subscription
   */
  getCurrentSubscription: async () => {
    const response = await api.get('/subscriptions/current');
    return response.data;
  },

  /**
   * Create a new subscription
   */
  createSubscription: async (priceId, paymentMethodId) => {
    const response = await api.post('/subscriptions', {
      priceId,
      paymentMethodId
    });
    return response.data;
  },

  /**
   * Update subscription (change plan)
   */
  updateSubscription: async (newPriceId) => {
    const response = await api.put('/subscriptions', {
      newPriceId
    });
    return response.data;
  },

  /**
   * Cancel subscription
   */
  cancelSubscription: async (immediately = false) => {
    const response = await api.delete(`/subscriptions?immediately=${immediately}`);
    return response.data;
  },

  /**
   * Resume canceled subscription
   */
  resumeSubscription: async () => {
    const response = await api.post('/subscriptions/resume');
    return response.data;
  },

  // Billing Portal
  
  /**
   * Get billing portal URL
   */
  getBillingPortalUrl: async (returnUrl) => {
    const response = await api.get('/subscriptions/billing-portal', {
      params: { returnUrl }
    });
    return response.data.url;
  },

  // Invoices
  
  /**
   * Get invoices
   */
  getInvoices: async (page = 0, size = 10) => {
    const response = await api.get('/subscriptions/invoices', {
      params: { page, size }
    });
    return response.data;
  },

  // Payment Methods
  
  /**
   * Get payment methods
   */
  getPaymentMethods: async () => {
    const response = await api.get('/subscriptions/payment-methods');
    return response.data;
  },

  /**
   * Add payment method
   */
  addPaymentMethod: async (paymentMethodId) => {
    const response = await api.post('/subscriptions/payment-methods', {
      paymentMethodId
    });
    return response.data;
  },

  // Usage Tracking
  
  /**
   * Get usage records
   */
  getUsageRecords: async (page = 0, size = 10) => {
    const response = await api.get('/subscriptions/usage', {
      params: { page, size }
    });
    return response.data;
  }
};

export default stripeService;
