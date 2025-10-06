import React, { useEffect, useState, useCallback } from 'react';
import { Elements, useElements, useStripe, CardElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  FileText, 
  Package, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Download,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '../app/store/authStore';
import { getStripeConfig, createSetupIntent, getPriceIds } from '../services/stripeClient';
import { stripeService } from '../services/stripeService';
import { useToast } from '../components/common/Toast.jsx';

function PaymentMethodForm({ onPaymentMethodSaved, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    createSetupIntent()
      .then(({ clientSecret }) => setClientSecret(clientSecret))
      .catch((e) => addToast({ type: 'error', title: 'Error', message: 'Failed to create setup intent' }));
  }, [addToast]);

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
        addToast({ type: 'error', title: 'Error', message: result.error.message || 'Failed to save payment method' });
      } else {
        addToast({ type: 'success', title: 'Success', message: 'Payment method saved successfully' });
        onPaymentMethodSaved(result.setupIntent.payment_method);
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err?.message || 'Payment method save failed' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="billing-payment-form">
      <div className="billing-card-element">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      <div className="billing-form-actions">
        <button 
          type="submit"
          disabled={!stripe || busy || !clientSecret} 
          className="billing-action-btn billing-action-btn-primary"
        >
          {busy ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              Save Payment Method
            </>
          )}
        </button>
        {onCancel && (
          <button 
            type="button"
            onClick={onCancel}
            className="billing-action-btn billing-action-btn-secondary"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export function BillingPageModern() {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'IT_ADMIN';
  const [stripePromise, setStripePromise] = useState(null);
  const [priceIds, setPriceIds] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const { addToast } = useToast();

  const loadBillingData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      // Load Stripe config
      const config = await getStripeConfig();
      setStripePromise(loadStripe(config.publishableKey));
      
      // Load price IDs (optional - may not be configured)
      try {
        const prices = await getPriceIds();
        setPriceIds(prices);
      } catch (err) {
        // Price IDs endpoint may not be configured - this is okay
        console.log('Price IDs not available, using defaults');
      }
      
      // Load current subscription (403 likely means no subscription exists)
      try {
        const currentSub = await stripeService.getCurrentSubscription();
        setSubscription(currentSub);
      } catch (err) {
        // 403 might mean no subscription configured, not necessarily session expired
        console.log('No subscription found or not accessible');
      }
      
      // Load invoices (403 likely means no invoices exist)
      try {
        const invoiceData = await stripeService.getInvoices(0, 10);
        setInvoices(invoiceData.content || []);
      } catch (err) {
        // 403 might mean no invoices configured, not necessarily session expired
        console.log('No invoices found or not accessible');
      }
    } catch (err) {
      // Only set session expired if the main Stripe config call fails with 403
      // That's the only truly critical endpoint
      if (err?.response?.status === 403) {
        setSessionExpired(true);
      } else {
        addToast({ type: 'error', title: 'Error', message: 'Failed to load billing data' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBillingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const onPaymentMethodSaved = async (paymentMethodId) => {
    if (!priceIds) {
      addToast({ type: 'info', title: 'Info', message: 'Using default test price ID' });
    }
    const priceId = priceIds?.['professional-monthly'] || 'price_pro_monthly';
    try {
      await stripeService.createSubscription(priceId, paymentMethodId);
      addToast({ type: 'success', title: 'Success', message: 'Subscription started successfully' });
      setShowPaymentForm(false);
      await loadBillingData(); // Reload data
    } catch (e) {
      if (e?.response?.status === 403) {
        setSessionExpired(true);
      } else {
        addToast({ type: 'error', title: 'Error', message: e?.response?.data?.error || 'Failed to start subscription' });
      }
    }
  };

  const handleOpenBillingPortal = async () => {
    try {
      const returnUrl = window.location.origin + '/app/billing';
      const url = await stripeService.getBillingPortalUrl(returnUrl);
      window.location.href = url;
    } catch (e) {
      if (e?.response?.status === 403) {
        setSessionExpired(true);
      } else {
        addToast({ type: 'error', title: 'Error', message: e?.response?.data?.error || 'Failed to open billing portal' });
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amountCents) => {
    return `$${(amountCents / 100).toFixed(2)}`;
  };

  if (!isAdmin) {
    return (
      <div className="billing-page-modern">
        <div className="billing-container">
          <div className="billing-error-card">
            <AlertTriangle className="w-12 h-12 text-yellow-600" />
            <h2>Access Denied</h2>
            <p>You do not have permission to view or manage billing. Please contact your administrator if you need access.</p>
          </div>
        </div>
      </div>
    );
  }

  if (sessionExpired) {
    return (
      <div className="billing-page-modern">
        <div className="billing-container">
          <div className="billing-error-card">
            <AlertTriangle className="w-12 h-12 text-red-600" />
            <h2>Session Expired</h2>
            <p>Your session has expired. Please log in again to continue.</p>
            <button 
              onClick={logout}
              className="billing-action-btn billing-action-btn-primary"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="billing-page-modern">
        <div className="billing-container">
          <div className="billing-loading">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
            <p>Loading billing information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="billing-page-modern">
      {/* Hero Section */}
      <div className="billing-hero">
        <div className="billing-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-8 h-8 text-emerald-700" />
              <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
            </div>
            <p className="text-gray-600">Manage your subscription, payment methods, and invoices</p>
          </motion.div>
        </div>
      </div>

      <div className="billing-container">
        {/* Metrics Grid */}
        <div className="billing-metrics-grid">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="billing-metric-card"
          >
            <div className="billing-metric-icon">
              <Package className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="billing-metric-content">
              <div className="billing-metric-label">Current Plan</div>
              <div className="billing-metric-value">
                {subscription ? 'Professional' : 'Free'}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="billing-metric-card"
          >
            <div className="billing-metric-icon">
              {subscription?.status === 'active' ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div className="billing-metric-content">
              <div className="billing-metric-label">Status</div>
              <div className="billing-metric-value">
                {subscription?.status === 'active' ? 'Active' : 'Inactive'}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="billing-metric-card"
          >
            <div className="billing-metric-icon">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="billing-metric-content">
              <div className="billing-metric-label">Next Billing</div>
              <div className="billing-metric-value">
                {subscription?.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : 'N/A'}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="billing-metric-card"
          >
            <div className="billing-metric-icon">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="billing-metric-content">
              <div className="billing-metric-label">Total Invoices</div>
              <div className="billing-metric-value">{invoices.length}</div>
            </div>
          </motion.div>
        </div>

        {/* Subscription Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="billing-card"
        >
          <div className="billing-card-header">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              <h2>Subscription Details</h2>
            </div>
          </div>
          <div className="billing-card-content">
            {subscription ? (
              <div className="space-y-4">
                <div className="billing-info-row">
                  <span className="billing-info-label">Plan:</span>
                  <span className="billing-info-value">Professional Monthly</span>
                </div>
                <div className="billing-info-row">
                  <span className="billing-info-label">Status:</span>
                  <span className={`billing-status-badge ${subscription.status === 'active' ? 'billing-status-active' : 'billing-status-inactive'}`}>
                    {subscription.status === 'active' ? 'Active' : subscription.status}
                  </span>
                </div>
                <div className="billing-info-row">
                  <span className="billing-info-label">Current Period:</span>
                  <span className="billing-info-value">
                    {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                  </span>
                </div>
                {subscription.cancelAtPeriodEnd && (
                  <div className="billing-warning-banner">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Your subscription will cancel at the end of the current period</span>
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={handleOpenBillingPortal}
                    className="billing-action-btn billing-action-btn-primary"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Manage Subscription
                  </button>
                </div>
              </div>
            ) : (
              <div className="billing-empty-state">
                <Package className="w-16 h-16 text-gray-300 mb-4" />
                <h3>No Active Subscription</h3>
                <p>Start a subscription to access premium features</p>
                {!showPaymentForm ? (
                  <button 
                    onClick={() => setShowPaymentForm(true)}
                    className="billing-action-btn billing-action-btn-primary"
                  >
                    <CreditCard className="w-4 h-4" />
                    Add Payment Method
                  </button>
                ) : (
                  <div className="billing-payment-form-container">
                    <div className="billing-test-info">
                      <AlertTriangle className="w-5 h-5 text-blue-600" />
                      <p>Test mode: use 4242 4242 4242 4242 with any future expiry and any CVC</p>
                    </div>
                    {stripePromise && (
                      <Elements stripe={stripePromise} options={{ appearance: { theme: 'stripe' } }}>
                        <PaymentMethodForm 
                          onPaymentMethodSaved={onPaymentMethodSaved}
                          onCancel={() => setShowPaymentForm(false)}
                        />
                      </Elements>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Invoices Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="billing-card"
        >
          <div className="billing-card-header">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <h2>Invoices</h2>
            </div>
          </div>
          <div className="billing-card-content">
            {invoices.length > 0 ? (
              <div className="billing-table-container">
                <table className="billing-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice, idx) => (
                      <motion.tr
                        key={invoice.id || idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                      >
                        <td>{formatDate(invoice.created)}</td>
                        <td className="font-semibold">{formatCurrency(invoice.amountPaid || invoice.total)}</td>
                        <td>
                          <span className={`billing-status-badge ${invoice.status === 'paid' ? 'billing-status-active' : 'billing-status-inactive'}`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td>
                          {invoice.invoicePdf && (
                            <a 
                              href={invoice.invoicePdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="billing-icon-btn"
                              title="Download Invoice"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="billing-empty-state">
                <FileText className="w-16 h-16 text-gray-300 mb-4" />
                <h3>No Invoices</h3>
                <p>Your invoices will appear here once you have an active subscription</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default BillingPageModern;
