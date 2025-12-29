import React, { useState, useEffect } from 'react';
import { StockAlert } from '../types/api';
import { AlertTriangle, AlertCircle, XCircle, CheckCircle, Check } from 'lucide-react';
import { ManagerHeader, StatusBadge, EmptyState, ActionButton } from './shared';

interface StockAlertManagerProps {
  onClose: () => void;
  currentUser?: string;
}

const getAlertIcon = (alertType: string) => {
  switch (alertType) {
    case 'critical_stock':
      return <XCircle size={20} className="text-red-600" />;
    case 'low_stock':
      return <AlertTriangle size={20} className="text-orange-600" />;
    case 'out_of_stock':
      return <AlertCircle size={20} className="text-red-600" />;
    default:
      return <AlertTriangle size={20} className="text-gray-600" />;
  }
};

const getAlertColor = (alertType: string): string => {
  const colors: Record<string, string> = {
    'critical_stock': 'border-l-4 border-l-red-600 bg-red-50',
    'low_stock': 'border-l-4 border-l-orange-600 bg-orange-50',
    'out_of_stock': 'border-l-4 border-l-red-600 bg-red-50',
  };
  return colors[alertType] || 'border-l-4 border-l-gray-400 bg-gray-50';
};

// Status colors are now handled by the shared StatusBadge component

const getAlertTypeLabel = (alertType: string): string => {
  const labels: Record<string, string> = {
    'low_stock': 'Low Stock',
    'critical_stock': 'Critical Stock',
    'out_of_stock': 'Out of Stock',
  };
  return labels[alertType] || alertType;
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const StockAlertManager: React.FC<StockAlertManagerProps> = ({ onClose, currentUser = 'User' }) => {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [filterAlertType, setFilterAlertType] = useState<string>('all');

  useEffect(() => {
    loadAlerts();
  }, [filterStatus, filterAlertType]);

  const loadAlerts = async () => {
    try {
      const filters: any = {};
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }
      if (filterAlertType !== 'all') {
        filters.alertType = filterAlertType;
      }

      const data = await window.api.getStockAlerts(filters);
      setAlerts(data);
    } catch (error) {
      console.error('Failed to load stock alerts:', error);
    }
  };

  const handleAcknowledge = async (stockAlert: StockAlert) => {
    try {
      await window.api.acknowledgeAlert(stockAlert.id, currentUser);
      await loadAlerts();
    } catch (error: any) {
      window.alert(error.message || 'Failed to acknowledge alert');
    }
  };

  const handleResolve = async (stockAlert: StockAlert) => {
    if (!confirm('Mark this alert as resolved? This indicates the stock level has been addressed.')) return;

    try {
      await window.api.resolveAlert(stockAlert.id);
      await loadAlerts();
    } catch (error: any) {
      window.alert(error.message || 'Failed to resolve alert');
    }
  };

  const activeAlertsCount = alerts.filter(a => a.status === 'active').length;
  const criticalAlertsCount = alerts.filter(a => a.alert_type === 'critical_stock' && a.status === 'active').length;

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      {/* Header */}
      <ManagerHeader
        title="Stock Alerts"
        subtitle={`${activeAlertsCount} active alert${activeAlertsCount !== 1 ? 's' : ''}${criticalAlertsCount > 0 ? ` (${criticalAlertsCount} critical)` : ''}`}
        icon={<AlertTriangle size={24} />}
        gradientFrom="red-600"
        gradientTo="orange-600"
        onClose={onClose}
      />

      {/* Filters */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Alert Type</label>
            <select
              value={filterAlertType}
              onChange={(e) => setFilterAlertType(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Types</option>
              <option value="critical_stock">Critical Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {alerts.length === 0 ? (
          <EmptyState
            icon={<CheckCircle size={48} className="text-green-500" />}
            title="No Alerts Found"
            description="All stock levels are within acceptable thresholds."
          />
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`${getAlertColor(alert.alert_type)} rounded-lg p-4 hover:shadow-md transition-shadow`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    {getAlertIcon(alert.alert_type)}
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900">
                        {alert.asset_name || 'Unknown Asset'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Tag: {alert.asset_tag} • {getAlertTypeLabel(alert.alert_type)}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={alert.status} />
                </div>

                {/* Stock Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Current Quantity:</span>
                    <p className="text-gray-900 font-bold text-lg">
                      {alert.current_quantity !== null ? alert.current_quantity : 'N/A'}
                    </p>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Threshold:</span>
                    <p className="text-gray-900 font-bold text-lg">
                      {alert.threshold_value !== null ? alert.threshold_value : 'N/A'}
                    </p>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <p className="text-gray-900">{formatDate(alert.created_at)}</p>
                  </div>

                  {alert.acknowledged_at && (
                    <div>
                      <span className="font-medium text-gray-700">Acknowledged:</span>
                      <p className="text-gray-900 text-xs">{formatDate(alert.acknowledged_at)}</p>
                      <p className="text-gray-600 text-xs">by {alert.acknowledged_by}</p>
                    </div>
                  )}

                  {alert.resolved_at && (
                    <div>
                      <span className="font-medium text-gray-700">Resolved:</span>
                      <p className="text-gray-900 text-xs">{formatDate(alert.resolved_at)}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {alert.status !== 'resolved' && (
                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    {alert.status === 'active' && (
                      <ActionButton
                        icon={<Check size={16} />}
                        label="Acknowledge"
                        onClick={() => handleAcknowledge(alert)}
                        variant="warning"
                        size="sm"
                      />
                    )}
                    <ActionButton
                      icon={<CheckCircle size={16} />}
                      label="Resolve"
                      onClick={() => handleResolve(alert)}
                      variant="success"
                      size="sm"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
