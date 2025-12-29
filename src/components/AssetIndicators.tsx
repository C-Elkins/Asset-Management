import React from 'react';
import { Calendar, Shield, FileText, AlertTriangle, Clock } from 'lucide-react';

interface AssetIndicatorsProps {
  assetId: number;
  indicators: {
    activeReservations?: number;
    activeLeases?: number;
    hasInsurance?: boolean;
    stockAlerts?: number;
    pendingApprovals?: number;
  };
}

export const AssetIndicators: React.FC<AssetIndicatorsProps> = ({ assetId, indicators }) => {
  const hasAnyIndicators =
    (indicators.activeReservations && indicators.activeReservations > 0) ||
    (indicators.activeLeases && indicators.activeLeases > 0) ||
    indicators.hasInsurance ||
    (indicators.stockAlerts && indicators.stockAlerts > 0) ||
    (indicators.pendingApprovals && indicators.pendingApprovals > 0);

  if (!hasAnyIndicators) {
    return <span className="text-xs text-gray-400">—</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      {/* Active Reservations */}
      {indicators.activeReservations && indicators.activeReservations > 0 && (
        <div
          className="flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200"
          title={`${indicators.activeReservations} active reservation${indicators.activeReservations !== 1 ? 's' : ''}`}
        >
          <Calendar size={12} />
          <span className="text-xs font-medium">{indicators.activeReservations}</span>
        </div>
      )}

      {/* Active Leases */}
      {indicators.activeLeases && indicators.activeLeases > 0 && (
        <div
          className="flex items-center gap-0.5 px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-200"
          title={`${indicators.activeLeases} active lease${indicators.activeLeases !== 1 ? 's' : ''}`}
        >
          <FileText size={12} />
          <span className="text-xs font-medium">{indicators.activeLeases}</span>
        </div>
      )}

      {/* Insurance Coverage */}
      {indicators.hasInsurance && (
        <div
          className="flex items-center px-1.5 py-0.5 bg-green-50 text-green-700 rounded border border-green-200"
          title="Has active insurance coverage"
        >
          <Shield size={12} />
        </div>
      )}

      {/* Stock Alerts */}
      {indicators.stockAlerts && indicators.stockAlerts > 0 && (
        <div
          className="flex items-center gap-0.5 px-1.5 py-0.5 bg-red-50 text-red-700 rounded border border-red-200"
          title={`${indicators.stockAlerts} stock alert${indicators.stockAlerts !== 1 ? 's' : ''}`}
        >
          <AlertTriangle size={12} />
          <span className="text-xs font-medium">{indicators.stockAlerts}</span>
        </div>
      )}

      {/* Pending Approvals */}
      {indicators.pendingApprovals && indicators.pendingApprovals > 0 && (
        <div
          className="flex items-center gap-0.5 px-1.5 py-0.5 bg-yellow-50 text-yellow-700 rounded border border-yellow-200"
          title={`${indicators.pendingApprovals} pending approval${indicators.pendingApprovals !== 1 ? 's' : ''}`}
        >
          <Clock size={12} />
          <span className="text-xs font-medium">{indicators.pendingApprovals}</span>
        </div>
      )}
    </div>
  );
};
