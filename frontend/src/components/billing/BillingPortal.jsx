import React, { useState, useEffect } from 'react';
import { useStripe } from '../contexts/StripeContext';
import { stripeService } from '../services/stripeService';

const BillingPortal = () => {
  const { subscription, loading, openBillingPortal } = useStripe();
  const [invoices, setInvoices] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [usageData, setUsageData] = useState(null);
  const [loadingInvoices, setLoadingInvoices] = useState(true);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const [invoicesData, paymentMethodsData, usageData] = await Promise.all([
        stripeService.getInvoices(0, 10),
        stripeService.getPaymentMethods(),
        stripeService.getUsageRecords(0, 1)
      ]);

      setInvoices(invoicesData.content || []);
      setPaymentMethods(paymentMethodsData || []);
      setUsageData(usageData.content && usageData.content[0] ? usageData.content[0] : null);
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      TRIALING: 'bg-blue-100 text-blue-800',
      PAST_DUE: 'bg-yellow-100 text-yellow-800',
      CANCELED: 'bg-red-100 text-red-800',
      INCOMPLETE: 'bg-gray-100 text-gray-800',
      PAID: 'bg-green-100 text-green-800',
      OPEN: 'bg-yellow-100 text-yellow-800',
      DRAFT: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading || loadingInvoices) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Subscription</h1>
        <p className="text-gray-600">Manage your subscription, invoices, and payment methods</p>
      </div>

      {/* Current Subscription */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Current Plan</h2>
            {subscription ? (
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl font-bold text-indigo-600">
                    {subscription.planName}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(subscription.status)}`}>
                    {subscription.status}
                  </span>
                </div>
                <p className="text-gray-600">
                  {subscription.billingCycle === 'ANNUAL' ? 'Billed annually' : 'Billed monthly'}
                </p>
                {subscription.amount && (
                  <p className="text-lg font-semibold text-gray-900 mt-2">
                    {formatCurrency(subscription.amount)} / {subscription.billingCycle.toLowerCase()}
                  </p>
                )}
                {subscription.isTrial && subscription.trialEnd && (
                  <p className="text-sm text-blue-600 mt-2">
                    Trial ends on {formatDate(subscription.trialEnd)}
                  </p>
                )}
                {subscription.cancelAtPeriodEnd && (
                  <p className="text-sm text-yellow-600 mt-2">
                    ⚠️ Subscription will cancel on {formatDate(subscription.currentPeriodEnd)}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-600">No active subscription</p>
            )}
          </div>

          <button
            onClick={openBillingPortal}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Manage Subscription
          </button>
        </div>

        {/* Plan Limits */}
        {subscription && (
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600 mb-1">Asset Limit</p>
              <p className="text-lg font-semibold text-gray-900">
                {subscription.assetLimit === -1 ? 'Unlimited' : subscription.assetLimit}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">User Limit</p>
              <p className="text-lg font-semibold text-gray-900">
                {subscription.userLimit === -1 ? 'Unlimited' : subscription.userLimit}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Current Usage */}
      {usageData && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Usage</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Assets</p>
              <p className="text-3xl font-bold text-gray-900">{usageData.assetCount}</p>
              <p className="text-sm text-gray-500 mt-1">
                Last recorded: {formatDate(usageData.recordedAt)}
              </p>
            </div>
            {usageData.overageCount > 0 && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-yellow-800 font-semibold mb-1">Overage</p>
                <p className="text-2xl font-bold text-yellow-900">{usageData.overageCount}</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Additional assets beyond your plan limit
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Methods */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
          <button
            onClick={openBillingPortal}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
          >
            Add New
          </button>
        </div>

        {paymentMethods.length > 0 ? (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-600 uppercase">
                      {method.cardBrand}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      •••• •••• •••• {method.cardLast4}
                    </p>
                    <p className="text-sm text-gray-600">
                      Expires {method.cardExpMonth}/{method.cardExpYear}
                    </p>
                  </div>
                </div>
                {method.isDefault && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
                    Default
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No payment methods added</p>
        )}
      </div>

      {/* Invoices */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Invoices</h2>
        
        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{invoice.stripeInvoiceId.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(invoice.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {formatCurrency(invoice.amountDue, invoice.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {invoice.invoicePdfUrl && (
                        <a
                          href={invoice.invoicePdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Download PDF
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No invoices yet</p>
        )}
      </div>
    </div>
  );
};

export default BillingPortal;
