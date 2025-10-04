import React, { useEffect, useMemo, useState } from 'react';
import { Elements, useElements, useStripe, CardElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import { getStripeConfig, createSetupIntent, getPriceIds } from '../services/stripeClient';
import { stripeService } from '../services/stripeService';

function PaymentMethodForm({ onPaymentMethodSaved }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    createSetupIntent()
      .then(({ clientSecret }) => setClientSecret(clientSecret))
      .catch((e) => toast.error(e?.response?.data?.error || 'Failed to create setup intent'));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;
    setBusy(true);
    try {
      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });
      if (result.error) {
        toast.error(result.error.message || 'Failed to save payment method');
      } else {
        toast.success('Payment method saved');
        onPaymentMethodSaved(result.setupIntent.payment_method);
      }
    } catch (err) {
      toast.error(err?.message || 'Payment method save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="p-3 border rounded-md">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      <button disabled={!stripe || busy || !clientSecret} className="btn btn-primary">
        {busy ? 'Saving…' : 'Save payment method'}
      </button>
    </form>
  );
}

import { useAuthStore } from '../app/store/authStore';

export default function BillingPage() {
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'IT_ADMIN';
  const [stripePromise, setStripePromise] = useState(null);
  const [priceIds, setPriceIds] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    getStripeConfig()
      .then(({ publishableKey }) => setStripePromise(loadStripe(publishableKey)))
      .catch(() => toast.error('Failed to load Stripe config'));
    getPriceIds()
      .then(setPriceIds)
      .catch(() => {/* non-fatal in prod */});
  }, [isAdmin]);

  const onPaymentMethodSaved = async (paymentMethodId) => {
    if (!priceIds) {
      toast('Using default test price id placeholder');
    }
    const priceId = priceIds?.['professional-monthly'] || 'price_pro_monthly';
    try {
      await stripeService.createSubscription(priceId, paymentMethodId);
      toast.success('Subscription started');
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to start subscription');
    }
  };

  const options = useMemo(() => ({ appearance: { theme: 'stripe' } }), []);

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold">Billing</h1>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
          You do not have permission to view or manage billing. Please contact your administrator if you need access.
        </div>
      </div>
    );
  }

  if (!stripePromise) return <div>Loading Billing…</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Billing</h1>
      <p className="text-sm text-gray-600">Test mode: use 4242 4242 4242 4242 with any future expiry and any CVC.</p>
      <Elements stripe={stripePromise} options={options}>
        <PaymentMethodForm onPaymentMethodSaved={onPaymentMethodSaved} />
      </Elements>
      <div className="border-t pt-4">
        <button
          className="btn"
          onClick={async () => {
            try {
              const returnUrl = window.location.origin + '/app/billing';
              const url = await stripeService.getBillingPortalUrl(returnUrl);
              window.location.href = url;
            } catch (e) {
              toast.error(e?.response?.data?.error || 'Failed to open billing portal');
            }
          }}
        >
          Open Billing Portal
        </button>
      </div>
    </div>
  );
}
