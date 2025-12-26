import React, { useState, useEffect } from 'react';
import { Asset, InventoryTransactionInput } from '../types/api';
import { X, Package, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface InventoryTransactionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  asset?: Asset | null;
  transactionType: 'receive' | 'adjustment' | 'writeoff';
  onComplete?: () => void;
}

export const InventoryTransactionManager: React.FC<InventoryTransactionManagerProps> = ({
  isOpen,
  onClose,
  asset,
  transactionType,
  onComplete,
}) => {
  const [formData, setFormData] = useState<Partial<InventoryTransactionInput>>({
    transaction_type: transactionType,
    asset_id: asset?.id || 0,
    quantity_change: 0,
    performed_by: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (asset) {
      setFormData(prev => ({ ...prev, asset_id: asset.id }));
    }
  }, [asset]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, transaction_type: transactionType }));
  }, [transactionType]);

  if (!isOpen || !asset) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await window.api.createInventoryTransaction(formData as InventoryTransactionInput);

      alert('Transaction recorded successfully!');
      onComplete?.();
      handleClose();
    } catch (error) {
      console.error('Failed to record transaction:', error);
      alert('Failed to record transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      transaction_type: transactionType,
      asset_id: asset?.id || 0,
      quantity_change: 0,
      performed_by: '',
      notes: '',
    });
    onClose();
  };

  const getTitle = () => {
    switch (transactionType) {
      case 'receive':
        return 'Receive Shipment';
      case 'adjustment':
        return 'Adjust Inventory';
      case 'writeoff':
        return 'Write-Off Inventory';
      default:
        return 'Inventory Transaction';
    }
  };

  const getIcon = () => {
    switch (transactionType) {
      case 'receive':
        return <Package className="text-green-600" size={24} />;
      case 'adjustment':
        return <TrendingUp className="text-blue-600" size={24} />;
      case 'writeoff':
        return <TrendingDown className="text-red-600" size={24} />;
      default:
        return <AlertCircle className="text-gray-600" size={24} />;
    }
  };

  const getColor = () => {
    switch (transactionType) {
      case 'receive':
        return 'emerald';
      case 'adjustment':
        return 'blue';
      case 'writeoff':
        return 'red';
      default:
        return 'gray';
    }
  };

  const color = getColor();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-4 bg-${color}-50 border-b border-${color}-200 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            {getIcon()}
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{getTitle()}</h2>
              <p className="text-sm text-gray-600 mt-0.5">
                {asset.name} ({asset.asset_tag})
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Current Inventory Status */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Available</p>
              <p className="text-2xl font-bold text-gray-900">{asset.available_quantity}</p>
            </div>
            {asset.is_tracked_inventory === 1 && (
              <div>
                <p className="text-sm text-gray-600">Total Quantity</p>
                <p className="text-2xl font-bold text-gray-900">{asset.total_quantity}</p>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
          <div className="space-y-4">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity {transactionType === 'receive' ? 'Received' : transactionType === 'writeoff' ? 'to Write-Off' : 'Adjustment'} *
              </label>
              <input
                type="number"
                required
                min={transactionType === 'writeoff' ? 1 : undefined}
                max={transactionType === 'writeoff' ? asset.available_quantity : undefined}
                value={formData.quantity_change || ''}
                onChange={(e) => {
                  let value = parseInt(e.target.value) || 0;
                  // For writeoff, make it negative
                  if (transactionType === 'writeoff' && value > 0) {
                    value = -value;
                  }
                  // For receive, ensure positive
                  if (transactionType === 'receive' && value < 0) {
                    value = Math.abs(value);
                  }
                  setFormData({ ...formData, quantity_change: value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter quantity"
              />
              {transactionType === 'adjustment' && (
                <p className="text-xs text-gray-500 mt-1">
                  Use positive numbers to add, negative to subtract
                </p>
              )}
            </div>

            {/* Receive-specific fields */}
            {transactionType === 'receive' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier/Vendor *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.supplier_vendor || ''}
                    onChange={(e) => setFormData({ ...formData, supplier_vendor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Vendor name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PO Number
                    </label>
                    <input
                      type="text"
                      value={formData.po_number || ''}
                      onChange={(e) => setFormData({ ...formData, po_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Purchase order #"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      value={formData.invoice_number || ''}
                      onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Invoice #"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Cost
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unit_cost || ''}
                    onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Cost per unit"
                  />
                </div>
              </>
            )}

            {/* Adjustment & Writeoff specific fields */}
            {(transactionType === 'adjustment' || transactionType === 'writeoff') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason *
                </label>
                <select
                  required
                  value={formData.reason || ''}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select reason...</option>
                  {transactionType === 'writeoff' ? (
                    <>
                      <option value="damaged">Damaged</option>
                      <option value="lost">Lost</option>
                      <option value="stolen">Stolen</option>
                      <option value="donated">Donated</option>
                      <option value="sold">Sold</option>
                      <option value="obsolete">Obsolete</option>
                      <option value="other">Other</option>
                    </>
                  ) : (
                    <>
                      <option value="count_correction">Count Correction</option>
                      <option value="found">Found/Recovered</option>
                      <option value="damaged">Damaged/Unusable</option>
                      <option value="transfer">Transfer</option>
                      <option value="other">Other</option>
                    </>
                  )}
                </select>
              </div>
            )}

            {/* Authorization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Authorized By
              </label>
              <input
                type="text"
                value={formData.authorized_by || ''}
                onChange={(e) => setFormData({ ...formData, authorized_by: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Manager/supervisor name"
              />
            </div>

            {/* Performed By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Performed By *
              </label>
              <input
                type="text"
                required
                value={formData.performed_by || ''}
                onChange={(e) => setFormData({ ...formData, performed_by: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Your name"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes {transactionType === 'writeoff' ? '*' : ''}
              </label>
              <textarea
                required={transactionType === 'writeoff'}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Additional details..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 bg-${color}-600 text-white rounded-md hover:bg-${color}-700 disabled:opacity-50`}
            >
              {isLoading ? 'Recording...' : transactionType === 'receive' ? 'Receive Items' : transactionType === 'writeoff' ? 'Write Off' : 'Adjust Inventory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
