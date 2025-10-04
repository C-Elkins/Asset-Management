import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useStripe as useStripeContext } from '../contexts/StripeContext';

// Load Stripe - replace with your publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here');

// Subscription Plans Configuration
const PLANS = {
  free: {
    name: 'Free',
    price: '$0',
    period: 'forever',
    priceId: null,
    features: [
      'Up to 50 assets',
      'Up to 3 users',
      'Basic reporting',
      'Email support',
      '30-day data retention'
    ],
    assetLimit: 50,
    userLimit: 3
  },
  professional: {
    name: 'Professional',
    price: '$49',
    annualPrice: '$490',
    period: 'per month',
    annualPeriod: 'per year',
    priceIdMonthly: process.env.REACT_APP_STRIPE_PRO_MONTHLY_PRICE_ID,
    priceIdAnnual: process.env.REACT_APP_STRIPE_PRO_ANNUAL_PRICE_ID,
    features: [
      'Up to 500 assets',
      'Up to 25 users',
      'Advanced reporting',
      'Priority email support',
      'Custom fields',
      'API access',
      '1-year data retention'
    ],
    assetLimit: 500,
    userLimit: 25,
    popular: true
  },
  enterprise: {
    name: 'Enterprise',
    price: '$199',
    annualPrice: '$1,990',
    period: 'per month',
    annualPeriod: 'per year',
    priceIdMonthly: process.env.REACT_APP_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
    priceIdAnnual: process.env.REACT_APP_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID,
    features: [
      'Unlimited assets',
      'Unlimited users',
      'Advanced analytics',
      '24/7 phone & email support',
      'Custom integrations',
      'SOC 2 audit support',
      'Dedicated account manager',
      'Unlimited data retention'
    ],
    assetLimit: -1,
    userLimit: -1
  }
};

const SubscriptionPlans = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const handleSelectPlan = (planKey, plan) => {
    if (planKey === 'free') {
      // Free plan doesn't require payment
      alert('Switching to free plan...');
      return;
    }

    setSelectedPlan({
      key: planKey,
      ...plan,
      priceId: billingCycle === 'monthly' ? plan.priceIdMonthly : plan.priceIdAnnual
    });
    setShowPaymentForm(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Select the perfect plan for your organization
        </p>

        {/* Billing Cycle Toggle */}
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              billingCycle === 'annual'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Annual
            <span className="ml-2 text-sm text-green-600 font-semibold">Save 17%</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      {!showPaymentForm ? (
        <div className="grid md:grid-cols-3 gap-8">
          {Object.entries(PLANS).map(([key, plan]) => (
            <div
              key={key}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-transform hover:scale-105 ${
                plan.popular ? 'ring-2 ring-indigo-600' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                  Most Popular
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {billingCycle === 'annual' && plan.annualPrice ? plan.annualPrice : plan.price}
                  </span>
                  <span className="text-gray-600 ml-2">
                    {billingCycle === 'annual' && plan.annualPeriod ? plan.annualPeriod : plan.period}
                  </span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="h-6 w-6 text-green-500 mr-3 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(key, plan)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {key === 'free' ? 'Get Started' : 'Subscribe Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Elements stripe={stripePromise}>
          <PaymentForm
            plan={selectedPlan}
            onCancel={() => setShowPaymentForm(false)}
          />
        </Elements>
      )}
    </div>
  );
};

// Payment Form Component
const PaymentForm = ({ plan, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { createSubscription } = useStripeContext();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      // Create subscription
      await createSubscription(plan.priceId, paymentMethod.id);
      
      setSucceeded(true);
      setProcessing(false);
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch (err) {
      setError(err.message || 'An error occurred while processing your payment');
      setProcessing(false);
    }
  };

  if (succeeded) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <svg
          className="h-16 w-16 text-green-500 mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Subscription Successful!</h3>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Subscription</h3>
      
      <div className="bg-indigo-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-gray-900">{plan.name} Plan</span>
          <span className="text-2xl font-bold text-indigo-600">{plan.price}</span>
        </div>
        <p className="text-sm text-gray-600">14-day free trial included</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <div className="border border-gray-300 rounded-lg p-3">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={processing}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || processing}
            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Processing...' : 'Subscribe'}
          </button>
        </div>
      </form>

      <p className="text-xs text-gray-500 text-center mt-6">
        Your card won't be charged during the 14-day trial period
      </p>
    </div>
  );
};

export default SubscriptionPlans;
