import React, { useState, useEffect } from 'react';
import { stripeService } from '../services/stripeService';
import { useStripe } from '../contexts/StripeContext';

const UsageDisplay = () => {
  const { subscription } = useStripe();
  const [usageRecords, setUsageRecords] = useState([]);
  const [currentUsage, setCurrentUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      const data = await stripeService.getUsageRecords(0, 30);
      setUsageRecords(data.content || []);
      if (data.content && data.content.length > 0) {
        setCurrentUsage(data.content[0]);
      }
    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateUsagePercentage = () => {
    if (!currentUsage || !subscription || subscription.assetLimit === -1) {
      return 0;
    }
    return Math.min((currentUsage.assetCount / subscription.assetLimit) * 100, 100);
  };

  const getUsageColor = () => {
    const percentage = calculateUsagePercentage();
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Usage Statistics</h2>

      {/* Current Usage Overview */}
      {currentUsage && subscription && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Asset Usage</span>
            <span className="text-sm font-semibold text-gray-900">
              {currentUsage.assetCount} / {subscription.assetLimit === -1 ? '∞' : subscription.assetLimit}
            </span>
          </div>

          {subscription.assetLimit !== -1 && (
            <>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getUsageColor()}`}
                  style={{ width: `${calculateUsagePercentage()}%` }}
                />
              </div>

              <div className="mt-2 text-sm text-gray-600">
                {calculateUsagePercentage() >= 90 ? (
                  <span className="text-red-600 font-semibold">
                    ⚠️ You're approaching your asset limit. Consider upgrading your plan.
                  </span>
                ) : calculateUsagePercentage() >= 75 ? (
                  <span className="text-yellow-600">
                    You've used {Math.round(calculateUsagePercentage())}% of your asset limit.
                  </span>
                ) : (
                  <span className="text-green-600">
                    You have {subscription.assetLimit - currentUsage.assetCount} assets remaining.
                  </span>
                )}
              </div>
            </>
          )}

          {currentUsage.overageCount > 0 && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-yellow-800">
                    Overage: {currentUsage.overageCount} assets
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    You'll be charged for {currentUsage.overageCount} additional assets on your next billing cycle.
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-3">
            Last updated: {formatDate(currentUsage.recordedAt)}
          </p>
        </div>
      )}

      {/* Usage History */}
      {usageRecords.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage History</h3>
          
          <div className="space-y-2">
            {usageRecords.slice(0, 10).map((record) => (
              <div
                key={record.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {record.assetCount} assets
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(record.recordedAt)}
                  </p>
                </div>
                <div className="text-right">
                  {record.overageCount > 0 ? (
                    <span className="text-sm font-semibold text-yellow-600">
                      +{record.overageCount} overage
                    </span>
                  ) : (
                    <span className="text-sm text-green-600">Within limit</span>
                  )}
                  {record.reportedToStripe && (
                    <p className="text-xs text-gray-400 mt-1">
                      ✓ Reported to billing
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upgrade CTA */}
      {subscription && subscription.planName !== 'ENTERPRISE' && calculateUsagePercentage() >= 75 && (
        <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-6 text-center">
          <h4 className="text-lg font-semibold text-indigo-900 mb-2">
            Need More Assets?
          </h4>
          <p className="text-sm text-indigo-700 mb-4">
            Upgrade your plan to get more assets and unlock advanced features.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard/subscription'}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            View Plans
          </button>
        </div>
      )}
    </div>
  );
};

export default UsageDisplay;
