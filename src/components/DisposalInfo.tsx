import React from 'react';
import { Asset } from '../types/api';
import { Trash2, Calendar, DollarSign, FileText, User } from 'lucide-react';

interface DisposalInfoProps {
  asset: Asset;
  className?: string;
}

const getDisposalMethodName = (method: string | null): string => {
  if (!method) return 'Unknown';

  const names: Record<string, string> = {
    'sold': 'Sold',
    'donated': 'Donated',
    'recycled': 'Recycled',
    'discarded': 'Discarded',
    'transferred': 'Transferred',
    'returned': 'Returned',
  };

  return names[method] || method;
};

const getDisposalMethodColor = (method: string | null): string => {
  if (!method) return 'gray';

  const colors: Record<string, string> = {
    'sold': 'green',
    'donated': 'blue',
    'recycled': 'teal',
    'discarded': 'red',
    'transferred': 'purple',
    'returned': 'orange',
  };

  return colors[method] || 'gray';
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const DisposalInfo: React.FC<DisposalInfoProps> = ({ asset, className = '' }) => {
  // Only show if asset has been disposed
  if (!asset.disposal_date) {
    return null;
  }

  const methodColor = getDisposalMethodColor(asset.disposal_method);

  const colorClasses = {
    green: {
      bg: 'from-green-50 to-emerald-50',
      border: 'border-green-200',
      iconBg: 'bg-green-600',
      badge: 'bg-green-100 text-green-800',
      text: 'text-green-900',
    },
    blue: {
      bg: 'from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-600',
      badge: 'bg-blue-100 text-blue-800',
      text: 'text-blue-900',
    },
    teal: {
      bg: 'from-teal-50 to-cyan-50',
      border: 'border-teal-200',
      iconBg: 'bg-teal-600',
      badge: 'bg-teal-100 text-teal-800',
      text: 'text-teal-900',
    },
    red: {
      bg: 'from-red-50 to-rose-50',
      border: 'border-red-200',
      iconBg: 'bg-red-600',
      badge: 'bg-red-100 text-red-800',
      text: 'text-red-900',
    },
    purple: {
      bg: 'from-purple-50 to-violet-50',
      border: 'border-purple-200',
      iconBg: 'bg-purple-600',
      badge: 'bg-purple-100 text-purple-800',
      text: 'text-purple-900',
    },
    orange: {
      bg: 'from-orange-50 to-amber-50',
      border: 'border-orange-200',
      iconBg: 'bg-orange-600',
      badge: 'bg-orange-100 text-orange-800',
      text: 'text-orange-900',
    },
    gray: {
      bg: 'from-gray-50 to-slate-50',
      border: 'border-gray-200',
      iconBg: 'bg-gray-600',
      badge: 'bg-gray-100 text-gray-800',
      text: 'text-gray-900',
    },
  };

  const colors = colorClasses[methodColor as keyof typeof colorClasses];

  return (
    <div className={`bg-gradient-to-br ${colors.bg} rounded-lg border ${colors.border} p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 ${colors.iconBg} rounded-lg flex items-center justify-center`}>
          <Trash2 size={18} className="text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Asset Disposed</h3>
          <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${colors.badge}`}>
            {getDisposalMethodName(asset.disposal_method)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Disposal Date */}
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-gray-600" />
            <span className="text-xs font-medium text-gray-600">Disposal Date</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">{formatDate(asset.disposal_date)}</p>
        </div>

        {/* Disposal Value */}
        {asset.disposal_value !== null && asset.disposal_value !== undefined && (
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={14} className="text-gray-600" />
              <span className="text-xs font-medium text-gray-600">Disposal Value</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">{formatCurrency(asset.disposal_value)}</p>
          </div>
        )}

        {/* Disposed By */}
        {asset.disposed_by && (
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <User size={14} className="text-gray-600" />
              <span className="text-xs font-medium text-gray-600">Disposed By</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">{asset.disposed_by}</p>
          </div>
        )}

        {/* Disposal Reason */}
        {asset.disposal_reason && (
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={14} className="text-gray-600" />
              <span className="text-xs font-medium text-gray-600">Reason</span>
            </div>
            <p className="text-sm text-gray-900">{asset.disposal_reason}</p>
          </div>
        )}

        {/* Disposal Notes */}
        {asset.disposal_notes && (
          <div className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={14} className="text-gray-600" />
              <span className="text-xs font-medium text-gray-600">Notes</span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{asset.disposal_notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};
