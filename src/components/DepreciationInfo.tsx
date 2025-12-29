import React from 'react';
import { Asset } from '../types/api';
import { calculateDepreciation, formatCurrency, getDepreciationMethodName, DepreciationConfig } from '../utils/depreciation';
import { TrendingDown, DollarSign, Calendar, Percent } from 'lucide-react';

interface DepreciationInfoProps {
  asset: Asset;
  className?: string;
}

export const DepreciationInfo: React.FC<DepreciationInfoProps> = ({ asset, className = '' }) => {
  // Don't show if no depreciation method or no purchase price
  if (!asset.depreciation_method || asset.depreciation_method === 'none' || !asset.purchase_price) {
    return null;
  }

  // Calculate depreciation
  const config: DepreciationConfig = {
    purchasePrice: asset.purchase_price,
    salvageValue: asset.salvage_value || 0,
    usefulLifeYears: asset.useful_life_years || 5,
    depreciationStartDate: asset.depreciation_start_date || asset.purchase_date || new Date().toISOString(),
    method: asset.depreciation_method,
  };

  const depreciation = calculateDepreciation(config);

  if (!depreciation) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
          <TrendingDown size={18} className="text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Asset Valuation</h3>
          <p className="text-xs text-gray-600">{getDepreciationMethodName(asset.depreciation_method)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Current Book Value */}
        <div className="bg-white rounded-lg p-3 border border-purple-100">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={14} className="text-purple-600" />
            <span className="text-xs font-medium text-gray-600">Current Value</span>
          </div>
          <p className="text-lg font-bold text-purple-900">
            {formatCurrency(depreciation.currentBookValue)}
          </p>
        </div>

        {/* Accumulated Depreciation */}
        <div className="bg-white rounded-lg p-3 border border-purple-100">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={14} className="text-red-600" />
            <span className="text-xs font-medium text-gray-600">Depreciated</span>
          </div>
          <p className="text-lg font-bold text-red-900">
            {formatCurrency(depreciation.accumulatedDepreciation)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Age & Remaining Life */}
        <div className="bg-white rounded-lg p-2 border border-purple-100">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Calendar size={12} className="text-purple-600" />
            <span className="text-[10px] font-medium text-gray-600 uppercase">Age / Remaining</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {depreciation.ageInYears.toFixed(1)}y / {depreciation.remainingLifeYears.toFixed(1)}y
          </p>
        </div>

        {/* Depreciation Percentage */}
        <div className="bg-white rounded-lg p-2 border border-purple-100">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Percent size={12} className="text-purple-600" />
            <span className="text-[10px] font-medium text-gray-600 uppercase">Depreciated</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {depreciation.depreciationPercentage.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Annual & Monthly Depreciation */}
      <div className="mt-3 pt-3 border-t border-purple-200">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-600">Annual:</span>{' '}
            <span className="font-semibold text-gray-900">{formatCurrency(depreciation.annualDepreciation)}</span>
          </div>
          <div>
            <span className="text-gray-600">Monthly:</span>{' '}
            <span className="font-semibold text-gray-900">{formatCurrency(depreciation.monthlyDepreciation)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
