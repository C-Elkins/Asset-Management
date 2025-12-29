import React from 'react';
import { Asset } from '../types/api';
import { Package, MapPin, Tag, Calendar, DollarSign, Info } from 'lucide-react';

interface AssetMobileViewProps {
  asset: Asset;
}

/**
 * Mobile-Optimized Asset View Component
 *
 * This component displays asset information in a clean, mobile-friendly format
 * optimized for viewing on phones after scanning a QR code.
 */
export const AssetMobileView: React.FC<AssetMobileViewProps> = ({ asset }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'assigned': return 'bg-indigo-100 text-indigo-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'retired': return 'bg-gray-300 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <Package size={28} />
          </div>
          <div>
            <p className="text-emerald-100 text-sm font-medium">Asset Information</p>
            <h1 className="text-2xl font-bold">{asset.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Tag size={18} />
          <span className="text-lg font-mono">{asset.asset_tag}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Status</h2>
            <span className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(asset.status)}`}>
              {asset.status}
            </span>
          </div>
        </div>

        {/* Quantity Card - Only show for tracked inventory */}
        {asset.is_tracked_inventory === 1 && (
          <div className="bg-white rounded-xl shadow-md p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Inventory</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium mb-1">Total Quantity</p>
                <p className="text-3xl font-bold text-blue-900">{asset.total_quantity || 0}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium mb-1">Available</p>
                <p className="text-3xl font-bold text-green-900">{asset.available_quantity || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Details Card */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
          <div className="space-y-4">
            {asset.category_name && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package size={20} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="text-base font-medium text-gray-900">{asset.category_name}</p>
                </div>
              </div>
            )}

            {asset.location && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-base font-medium text-gray-900">{asset.location}</p>
                </div>
              </div>
            )}

            {asset.brand && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Tag size={20} className="text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Brand</p>
                  <p className="text-base font-medium text-gray-900">{asset.brand}</p>
                </div>
              </div>
            )}

            {asset.model && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Info size={20} className="text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Model</p>
                  <p className="text-base font-medium text-gray-900">{asset.model}</p>
                </div>
              </div>
            )}

            {asset.serial_number && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Tag size={20} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Serial Number</p>
                  <p className="text-base font-medium text-gray-900 font-mono">{asset.serial_number}</p>
                </div>
              </div>
            )}

            {asset.purchase_price && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign size={20} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Purchase Price</p>
                  <p className="text-base font-medium text-gray-900">${asset.purchase_price.toFixed(2)}</p>
                </div>
              </div>
            )}

            {asset.purchase_date && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar size={20} className="text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Purchase Date</p>
                  <p className="text-base font-medium text-gray-900">
                    {new Date(asset.purchase_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description Card */}
        {asset.description && (
          <div className="bg-white rounded-xl shadow-md p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 leading-relaxed">{asset.description}</p>
          </div>
        )}

        {/* Notes Card */}
        {asset.notes && (
          <div className="bg-amber-50 rounded-xl shadow-md p-5 border border-amber-200">
            <h2 className="text-lg font-semibold text-amber-900 mb-3">Notes</h2>
            <p className="text-amber-800 leading-relaxed">{asset.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-6 text-sm text-gray-500">
          <p>Powered by Krubles Asset Manager</p>
          <p className="text-xs mt-1">Last updated: {new Date(asset.updated_at).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Generate a standalone HTML page for mobile viewing
 * This can be saved and accessed via a URL encoded in the QR code
 */
export const generateMobileAssetHTML = (asset: Asset): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${asset.name} - ${asset.asset_tag}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
  <div class="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 shadow-lg">
    <div class="flex items-center gap-3 mb-2">
      <div class="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <div>
        <p class="text-emerald-100 text-sm font-medium">Asset Information</p>
        <h1 class="text-2xl font-bold">${asset.name}</h1>
      </div>
    </div>
    <div class="flex items-center gap-2 mt-4">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
      <span class="text-lg font-mono">${asset.asset_tag}</span>
    </div>
  </div>

  <div class="p-4 space-y-4">
    <div class="bg-white rounded-xl shadow-md p-5">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900">Status</h2>
        <span class="px-4 py-2 text-sm font-medium rounded-full bg-green-100 text-green-800">${asset.status}</span>
      </div>
    </div>

    ${asset.is_tracked_inventory === 1 ? `
    <div class="bg-white rounded-xl shadow-md p-5">
      <h2 class="text-lg font-semibold text-gray-900 mb-3">Inventory</h2>
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-blue-50 rounded-lg p-4">
          <p class="text-sm text-blue-600 font-medium mb-1">Total</p>
          <p class="text-3xl font-bold text-blue-900">${asset.total_quantity || 0}</p>
        </div>
        <div class="bg-green-50 rounded-lg p-4">
          <p class="text-sm text-green-600 font-medium mb-1">Available</p>
          <p class="text-3xl font-bold text-green-900">${asset.available_quantity || 0}</p>
        </div>
      </div>
    </div>
    ` : ''}

    <div class="bg-white rounded-xl shadow-md p-5">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Details</h2>
      <div class="space-y-4">
        ${asset.category_name ? `
        <div>
          <p class="text-sm text-gray-500">Category</p>
          <p class="text-base font-medium text-gray-900">${asset.category_name}</p>
        </div>
        ` : ''}
        ${asset.location ? `
        <div>
          <p class="text-sm text-gray-500">Location</p>
          <p class="text-base font-medium text-gray-900">${asset.location}</p>
        </div>
        ` : ''}
        ${asset.brand ? `
        <div>
          <p class="text-sm text-gray-500">Brand</p>
          <p class="text-base font-medium text-gray-900">${asset.brand}</p>
        </div>
        ` : ''}
        ${asset.model ? `
        <div>
          <p class="text-sm text-gray-500">Model</p>
          <p class="text-base font-medium text-gray-900">${asset.model}</p>
        </div>
        ` : ''}
        ${asset.serial_number ? `
        <div>
          <p class="text-sm text-gray-500">Serial Number</p>
          <p class="text-base font-medium text-gray-900 font-mono">${asset.serial_number}</p>
        </div>
        ` : ''}
      </div>
    </div>

    ${asset.description ? `
    <div class="bg-white rounded-xl shadow-md p-5">
      <h2 class="text-lg font-semibold text-gray-900 mb-3">Description</h2>
      <p class="text-gray-700 leading-relaxed">${asset.description}</p>
    </div>
    ` : ''}

    <div class="text-center py-6 text-sm text-gray-500">
      <p>Powered by Krubles Asset Manager</p>
      <p class="text-xs mt-1">Last updated: ${new Date(asset.updated_at).toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
};
