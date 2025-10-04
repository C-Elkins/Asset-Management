import React, { createContext, useContext, useState, useEffect } from 'react';
import { stripeService } from '../services/stripeService';

const StripeContext = createContext(null);

export const useStripe = () => {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
};

export const StripeProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const data = await stripeService.getCurrentSubscription();
      setSubscription(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err.message);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const createSubscription = async (priceId, paymentMethodId) => {
    try {
      setLoading(true);
      const newSubscription = await stripeService.createSubscription(priceId, paymentMethodId);
      setSubscription(newSubscription);
      return newSubscription;
    } catch (err) {
      console.error('Error creating subscription:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (newPriceId) => {
    try {
      setLoading(true);
      const updatedSubscription = await stripeService.updateSubscription(newPriceId);
      setSubscription(updatedSubscription);
      return updatedSubscription;
    } catch (err) {
      console.error('Error updating subscription:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (immediately = false) => {
    try {
      setLoading(true);
      const canceledSubscription = await stripeService.cancelSubscription(immediately);
      setSubscription(canceledSubscription);
      return canceledSubscription;
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resumeSubscription = async () => {
    try {
      setLoading(true);
      const resumedSubscription = await stripeService.resumeSubscription();
      setSubscription(resumedSubscription);
      return resumedSubscription;
    } catch (err) {
      console.error('Error resuming subscription:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const openBillingPortal = async () => {
    try {
      const returnUrl = window.location.origin + '/dashboard/billing';
      const portalUrl = await stripeService.getBillingPortalUrl(returnUrl);
      window.location.href = portalUrl;
    } catch (err) {
      console.error('Error opening billing portal:', err);
      setError(err.message);
      throw err;
    }
  };

  const value = {
    subscription,
    loading,
    error,
    fetchSubscription,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    resumeSubscription,
    openBillingPortal
  };

  return <StripeContext.Provider value={value}>{children}</StripeContext.Provider>;
};

export default StripeContext;
