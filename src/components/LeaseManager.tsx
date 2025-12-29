import React, { useState, useEffect } from 'react';
import { Asset, Lease, LeaseInput } from '../types/api';
import { Plus, Edit2, Ban, RefreshCw, Trash2, FileText, Calendar, DollarSign, Building2, User } from 'lucide-react';
import { ManagerHeader, StatusBadge, EmptyState, ActionButton } from './shared';

interface LeaseManagerProps {
  asset: Asset;
  onClose: () => void;
}

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

// Status colors are now handled by the shared StatusBadge component

const getLeaseTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'operating': 'Operating Lease',
    'finance': 'Finance Lease',
    'rent': 'Rental Agreement',
  };
  return labels[type] || type;
};

export const LeaseManager: React.FC<LeaseManagerProps> = ({ asset, onClose }) => {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLease, setEditingLease] = useState<Lease | null>(null);
  const [formData, setFormData] = useState<LeaseInput>({
    asset_id: asset.id,
    contract_number: '',
    lease_type: 'operating',
    lessor: '',
    lessee: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    renewal_date: '',
    auto_renewal: 0,
    monthly_payment: undefined,
    payment_frequency: 'monthly',
    next_payment_date: '',
    total_value: undefined,
    deposit_amount: undefined,
    status: 'active',
    terms: '',
    notes: '',
  });

  useEffect(() => {
    loadLeases();
  }, [asset.id]);

  const loadLeases = async () => {
    try {
      const data = await window.api.getLeases({ assetId: asset.id });
      setLeases(data);
    } catch (error) {
      console.error('Failed to load leases:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingLease) {
        await window.api.updateLease(editingLease.id, formData);
      } else {
        await window.api.createLease(formData);
      }

      await loadLeases();
      resetForm();
    } catch (error: any) {
      console.error('Failed to save lease:', error);
      alert(error.message || 'Failed to save lease');
    }
  };

  const resetForm = () => {
    setFormData({
      asset_id: asset.id,
      contract_number: '',
      lease_type: 'operating',
      lessor: '',
      lessee: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      renewal_date: '',
      auto_renewal: 0,
      monthly_payment: undefined,
      payment_frequency: 'monthly',
      next_payment_date: '',
      total_value: undefined,
      deposit_amount: undefined,
      status: 'active',
      terms: '',
      notes: '',
    });
    setEditingLease(null);
    setShowForm(false);
  };

  const handleEdit = (lease: Lease) => {
    setEditingLease(lease);
    setFormData({
      asset_id: lease.asset_id,
      contract_number: lease.contract_number || '',
      lease_type: lease.lease_type,
      lessor: lease.lessor,
      lessee: lease.lessee,
      start_date: lease.start_date,
      end_date: lease.end_date,
      renewal_date: lease.renewal_date || '',
      auto_renewal: lease.auto_renewal,
      monthly_payment: lease.monthly_payment || undefined,
      payment_frequency: lease.payment_frequency || 'monthly',
      next_payment_date: lease.next_payment_date || '',
      total_value: lease.total_value || undefined,
      deposit_amount: lease.deposit_amount || undefined,
      status: lease.status,
      terms: lease.terms || '',
      notes: lease.notes || '',
    });
    setShowForm(true);
  };

  const handleCancel = async (lease: Lease) => {
    if (!confirm('Are you sure you want to cancel this lease?')) return;

    try {
      await window.api.cancelLease(lease.id);
      await loadLeases();
    } catch (error: any) {
      alert(error.message || 'Failed to cancel lease');
    }
  };

  const handleRenew = async (lease: Lease) => {
    const newEndDate = prompt('Enter new end date (YYYY-MM-DD):', lease.end_date);
    if (!newEndDate) return;

    try {
      await window.api.renewLease(lease.id, newEndDate);
      await loadLeases();
    } catch (error: any) {
      alert(error.message || 'Failed to renew lease');
    }
  };

  const handleDelete = async (lease: Lease) => {
    if (!confirm('Are you sure you want to delete this lease? This action cannot be undone.')) return;

    try {
      await window.api.deleteLease(lease.id);
      await loadLeases();
    } catch (error: any) {
      alert(error.message || 'Failed to delete lease');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      {/* Header */}
      <ManagerHeader
        title="Lease Management"
        subtitle={`${asset.name} (${asset.asset_tag})`}
        icon={<FileText size={24} />}
        gradientFrom="purple-600"
        gradientTo="indigo-600"
        onClose={onClose}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Add Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2"
          >
            <Plus size={18} />
            Add Lease Agreement
          </button>
        )}

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingLease ? 'Edit Lease Agreement' : 'New Lease Agreement'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contract Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contract Number
                </label>
                <input
                  type="text"
                  value={formData.contract_number}
                  onChange={(e) => setFormData({ ...formData, contract_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  placeholder="Optional"
                />
              </div>

              {/* Lease Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lease Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.lease_type}
                  onChange={(e) => setFormData({ ...formData, lease_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="operating">Operating Lease</option>
                  <option value="finance">Finance Lease</option>
                  <option value="rent">Rental Agreement</option>
                </select>
              </div>

              {/* Lessor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lessor (Owner) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lessor}
                  onChange={(e) => setFormData({ ...formData, lessor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Lessee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lessee (Renter) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lessee}
                  onChange={(e) => setFormData({ ...formData, lessee: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Monthly Payment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Payment
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monthly_payment || ''}
                  onChange={(e) => setFormData({ ...formData, monthly_payment: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                />
              </div>

              {/* Payment Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Frequency
                </label>
                <select
                  value={formData.payment_frequency || 'monthly'}
                  onChange={(e) => setFormData({ ...formData, payment_frequency: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>

              {/* Total Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Lease Value
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.total_value || ''}
                  onChange={(e) => setFormData({ ...formData, total_value: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                />
              </div>

              {/* Deposit Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deposit Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.deposit_amount || ''}
                  onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  placeholder="0.00"
                />
              </div>

              {/* Auto Renewal */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.auto_renewal === 1}
                    onChange={(e) => setFormData({ ...formData, auto_renewal: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Auto-renewal enabled</span>
                </label>
              </div>

              {/* Terms */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lease Terms
                </label>
                <textarea
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Special terms and conditions..."
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                {editingLease ? 'Update Lease' : 'Create Lease'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Leases List */}
        <div className="space-y-4">
          {leases.length === 0 && !showForm && (
            <EmptyState
              icon={<FileText size={48} />}
              title="No lease agreements found"
              description="Click 'Add Lease Agreement' to create one for this asset."
            />
          )}

          {leases.map((lease) => (
            <div key={lease.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-semibold text-lg text-gray-900">
                      {getLeaseTypeLabel(lease.lease_type)}
                    </h4>
                    <StatusBadge status={lease.status} />
                  </div>
                  {lease.contract_number && (
                    <p className="text-sm text-gray-600">Contract: {lease.contract_number}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {lease.status === 'active' && (
                    <>
                      <ActionButton
                        icon={<Edit2 size={16} />}
                        onClick={() => handleEdit(lease)}
                        variant="primary"
                        size="sm"
                        title="Edit"
                      />
                      <ActionButton
                        icon={<RefreshCw size={16} />}
                        onClick={() => handleRenew(lease)}
                        variant="success"
                        size="sm"
                        title="Renew"
                      />
                      <ActionButton
                        icon={<Ban size={16} />}
                        onClick={() => handleCancel(lease)}
                        variant="warning"
                        size="sm"
                        title="Cancel"
                      />
                    </>
                  )}
                  <ActionButton
                    icon={<Trash2 size={16} />}
                    onClick={() => handleDelete(lease)}
                    variant="danger"
                    size="sm"
                    title="Delete"
                  />
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-1.5 text-gray-600 mb-1">
                    <Building2 size={14} />
                    <span className="font-medium">Lessor</span>
                  </div>
                  <p className="text-gray-900">{lease.lessor}</p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-gray-600 mb-1">
                    <User size={14} />
                    <span className="font-medium">Lessee</span>
                  </div>
                  <p className="text-gray-900">{lease.lessee}</p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-gray-600 mb-1">
                    <Calendar size={14} />
                    <span className="font-medium">Period</span>
                  </div>
                  <p className="text-gray-900">
                    {formatDate(lease.start_date)} - {formatDate(lease.end_date)}
                  </p>
                </div>

                {lease.monthly_payment && (
                  <div>
                    <div className="flex items-center gap-1.5 text-gray-600 mb-1">
                      <DollarSign size={14} />
                      <span className="font-medium">Payment</span>
                    </div>
                    <p className="text-gray-900">
                      {formatCurrency(lease.monthly_payment)} / {lease.payment_frequency}
                    </p>
                  </div>
                )}
              </div>

              {/* Additional Details */}
              {(lease.terms || lease.notes || lease.total_value) && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
                  {lease.total_value && (
                    <div>
                      <span className="font-medium text-gray-700">Total Value:</span>{' '}
                      <span className="text-gray-900">{formatCurrency(lease.total_value)}</span>
                    </div>
                  )}
                  {lease.terms && (
                    <div>
                      <span className="font-medium text-gray-700">Terms:</span>{' '}
                      <span className="text-gray-900">{lease.terms}</span>
                    </div>
                  )}
                  {lease.notes && (
                    <div>
                      <span className="font-medium text-gray-700">Notes:</span>{' '}
                      <span className="text-gray-900">{lease.notes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
