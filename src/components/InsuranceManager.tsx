import React, { useState, useEffect } from 'react';
import { Asset, InsurancePolicy, InsurancePolicyInput } from '../types/api';
import { Plus, Edit2, Trash2, Shield, Calendar, DollarSign, FileText, Building2 } from 'lucide-react';
import { ManagerHeader, StatusBadge, EmptyState, ActionButton } from './shared';

interface InsuranceManagerProps {
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

const getPolicyTypeLabel = (type: string | null): string => {
  const labels: Record<string, string> = {
    'property': 'Property Insurance',
    'liability': 'Liability Insurance',
    'comprehensive': 'Comprehensive Coverage',
    'other': 'Other',
  };
  return type ? labels[type] || type : 'Other';
};

export const InsuranceManager: React.FC<InsuranceManagerProps> = ({ asset, onClose }) => {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<InsurancePolicy | null>(null);
  const [formData, setFormData] = useState<InsurancePolicyInput>({
    asset_id: asset.id,
    policy_number: '',
    provider: '',
    policy_type: 'property',
    coverage_amount: undefined,
    premium_amount: undefined,
    premium_frequency: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    renewal_date: '',
    auto_renewal: 0,
    deductible: undefined,
    status: 'active',
    notes: '',
  });

  useEffect(() => {
    loadPolicies();
  }, [asset.id]);

  const loadPolicies = async () => {
    try {
      const data = await window.api.getInsurancePolicies({ assetId: asset.id });
      setPolicies(data);
    } catch (error) {
      console.error('Failed to load insurance policies:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPolicy) {
        await window.api.updateInsurancePolicy(editingPolicy.id, formData);
      } else {
        await window.api.createInsurancePolicy(formData);
      }

      await loadPolicies();
      resetForm();
    } catch (error: any) {
      console.error('Failed to save insurance policy:', error);
      alert(error.message || 'Failed to save insurance policy');
    }
  };

  const resetForm = () => {
    setFormData({
      asset_id: asset.id,
      policy_number: '',
      provider: '',
      policy_type: 'property',
      coverage_amount: undefined,
      premium_amount: undefined,
      premium_frequency: 'monthly',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      renewal_date: '',
      auto_renewal: 0,
      deductible: undefined,
      status: 'active',
      notes: '',
    });
    setEditingPolicy(null);
    setShowForm(false);
  };

  const handleEdit = (policy: InsurancePolicy) => {
    setEditingPolicy(policy);
    setFormData({
      asset_id: policy.asset_id,
      policy_number: policy.policy_number,
      provider: policy.provider,
      policy_type: policy.policy_type || 'property',
      coverage_amount: policy.coverage_amount || undefined,
      premium_amount: policy.premium_amount || undefined,
      premium_frequency: policy.premium_frequency || 'monthly',
      start_date: policy.start_date,
      end_date: policy.end_date,
      renewal_date: policy.renewal_date || '',
      auto_renewal: policy.auto_renewal,
      deductible: policy.deductible || undefined,
      status: policy.status,
      notes: policy.notes || '',
    });
    setShowForm(true);
  };

  const handleCancel = async (policy: InsurancePolicy) => {
    if (!confirm('Are you sure you want to cancel this insurance policy?')) return;

    try {
      await window.api.deleteInsurancePolicy(policy.id);
      await loadPolicies();
    } catch (error: any) {
      alert(error.message || 'Failed to cancel insurance policy');
    }
  };

  const handleDelete = async (policy: InsurancePolicy) => {
    if (!confirm('Are you sure you want to delete this insurance policy? This action cannot be undone.')) return;

    try {
      await window.api.deleteInsurancePolicy(policy.id);
      await loadPolicies();
    } catch (error: any) {
      alert(error.message || 'Failed to delete insurance policy');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      {/* Header */}
      <ManagerHeader
        title="Insurance Management"
        subtitle={`${asset.name} (${asset.asset_tag})`}
        icon={<Shield size={24} />}
        gradientFrom="blue-600"
        gradientTo="indigo-600"
        onClose={onClose}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Add Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={18} />
            Add Insurance Policy
          </button>
        )}

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingPolicy ? 'Edit Insurance Policy' : 'New Insurance Policy'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Policy Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Policy Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.policy_number}
                  onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Provider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Provider <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Policy Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Policy Type
                </label>
                <select
                  value={formData.policy_type || 'property'}
                  onChange={(e) => setFormData({ ...formData, policy_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="property">Property Insurance</option>
                  <option value="liability">Liability Insurance</option>
                  <option value="comprehensive">Comprehensive Coverage</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Coverage Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coverage Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.coverage_amount || ''}
                  onChange={(e) => setFormData({ ...formData, coverage_amount: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              {/* Premium Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Premium Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.premium_amount || ''}
                  onChange={(e) => setFormData({ ...formData, premium_amount: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              {/* Premium Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Premium Frequency
                </label>
                <select
                  value={formData.premium_frequency || 'monthly'}
                  onChange={(e) => setFormData({ ...formData, premium_frequency: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Deductible */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deductible
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.deductible || ''}
                  onChange={(e) => setFormData({ ...formData, deductible: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              {/* Renewal Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Renewal Date
                </label>
                <input
                  type="date"
                  value={formData.renewal_date}
                  onChange={(e) => setFormData({ ...formData, renewal_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Auto Renewal */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.auto_renewal === 1}
                    onChange={(e) => setFormData({ ...formData, auto_renewal: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Auto-renewal enabled</span>
                </label>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Additional policy details..."
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingPolicy ? 'Update Policy' : 'Create Policy'}
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

        {/* Policies List */}
        <div className="space-y-4">
          {policies.length === 0 && !showForm && (
            <EmptyState
              icon={<Shield size={48} />}
              title="No insurance policies found"
              description="Click 'Add Insurance Policy' to create coverage for this asset."
            />
          )}

          {policies.map((policy) => (
            <div key={policy.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-semibold text-lg text-gray-900">
                      {getPolicyTypeLabel(policy.policy_type)}
                    </h4>
                    <StatusBadge status={policy.status} />
                  </div>
                  <p className="text-sm text-gray-600">Policy: {policy.policy_number}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {policy.status === 'active' && (
                    <>
                      <ActionButton
                        icon={<Edit2 size={16} />}
                        onClick={() => handleEdit(policy)}
                        variant="primary"
                        size="sm"
                        title="Edit"
                      />
                      <ActionButton
                        icon={<FileText size={16} />}
                        onClick={() => handleCancel(policy)}
                        variant="warning"
                        size="sm"
                        title="Cancel Policy"
                      />
                    </>
                  )}
                  <ActionButton
                    icon={<Trash2 size={16} />}
                    onClick={() => handleDelete(policy)}
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
                    <span className="font-medium">Provider</span>
                  </div>
                  <p className="text-gray-900">{policy.provider}</p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-gray-600 mb-1">
                    <Calendar size={14} />
                    <span className="font-medium">Period</span>
                  </div>
                  <p className="text-gray-900">
                    {formatDate(policy.start_date)} - {formatDate(policy.end_date)}
                  </p>
                </div>

                {policy.coverage_amount && (
                  <div>
                    <div className="flex items-center gap-1.5 text-gray-600 mb-1">
                      <Shield size={14} />
                      <span className="font-medium">Coverage</span>
                    </div>
                    <p className="text-gray-900">{formatCurrency(policy.coverage_amount)}</p>
                  </div>
                )}

                {policy.premium_amount && (
                  <div>
                    <div className="flex items-center gap-1.5 text-gray-600 mb-1">
                      <DollarSign size={14} />
                      <span className="font-medium">Premium</span>
                    </div>
                    <p className="text-gray-900">
                      {formatCurrency(policy.premium_amount)} / {policy.premium_frequency}
                    </p>
                  </div>
                )}
              </div>

              {/* Additional Details */}
              {(policy.deductible || policy.notes) && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
                  {policy.deductible && (
                    <div>
                      <span className="font-medium text-gray-700">Deductible:</span>{' '}
                      <span className="text-gray-900">{formatCurrency(policy.deductible)}</span>
                    </div>
                  )}
                  {policy.notes && (
                    <div>
                      <span className="font-medium text-gray-700">Notes:</span>{' '}
                      <span className="text-gray-900">{policy.notes}</span>
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
