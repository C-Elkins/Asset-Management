import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle } from 'lucide-react';
import { Asset, ApprovalWorkflow, User } from '../types/api';

interface CheckoutRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  currentUser?: User | null;
  onRequestCreated?: () => void;
}

export const CheckoutRequestModal: React.FC<CheckoutRequestModalProps> = ({
  isOpen,
  onClose,
  asset,
  currentUser,
  onRequestCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [workflow, setWorkflow] = useState<ApprovalWorkflow | null>(null);
  const [formData, setFormData] = useState({
    requested_for: '',
    checkout_purpose: '',
    expected_return_date: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen && asset) {
      loadWorkflow();
      // Reset form when modal opens
      setFormData({
        requested_for: '',
        checkout_purpose: '',
        expected_return_date: '',
        notes: '',
      });
    }
  }, [isOpen, asset]);

  const loadWorkflow = async () => {
    if (!asset) return;

    try {
      const wf = await window.api.getActiveWorkflow(asset.id);
      setWorkflow(wf);
    } catch (error) {
      console.error('Failed to load workflow:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!asset || !currentUser) return;

    try {
      setLoading(true);

      await window.api.createCheckoutRequest({
        asset_id: asset.id,
        requested_by: currentUser.full_name,
        requested_for: formData.requested_for || undefined,
        checkout_purpose: formData.checkout_purpose || undefined,
        expected_return_date: formData.expected_return_date || undefined,
        notes: formData.notes || undefined,
      });

      alert('Checkout request submitted successfully!');
      onRequestCreated?.();
      onClose();
    } catch (error: any) {
      alert(error.message || 'Failed to create checkout request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const approvers = workflow ? JSON.parse(workflow.approval_chain) : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Request Asset Checkout</h3>
            <p className="text-purple-100 text-sm">Submit a checkout request for approval</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Asset Info */}
          {asset && (
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm font-medium text-purple-900">Asset Details</p>
              <p className="text-lg font-semibold text-purple-900 mt-1">
                {asset.name} ({asset.asset_tag})
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-purple-700">
                <div>
                  <span className="font-medium">Category:</span> {asset.category_name}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {asset.status}
                </div>
                {asset.location && (
                  <div className="col-span-2">
                    <span className="font-medium">Location:</span> {asset.location}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Approval Workflow Info */}
          {workflow && approvers.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">Approval Required</p>
              <p className="text-sm text-blue-700 mb-3">
                This request will need approval from the following:
              </p>
              <div className="flex items-center gap-2">
                {approvers.map((approver: any, index: number) => (
                  <React.Fragment key={index}>
                    {index > 0 && <span className="text-blue-400">→</span>}
                    <div className="px-3 py-1.5 bg-white border border-blue-300 rounded text-xs font-medium text-blue-900">
                      {approver.name}
                      {approver.role && ` (${approver.role})`}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requested By
              </label>
              <input
                type="text"
                value={currentUser?.full_name || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign To (if different from you)
              </label>
              <input
                type="text"
                value={formData.requested_for}
                onChange={(e) => setFormData({ ...formData, requested_for: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                placeholder="Leave blank if requesting for yourself"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.checkout_purpose}
                onChange={(e) => setFormData({ ...formData, checkout_purpose: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Field work, Project X, etc."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Return Date
              </label>
              <input
                type="date"
                value={formData.expected_return_date}
                onChange={(e) => setFormData({ ...formData, expected_return_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                placeholder="Add any additional information about this request..."
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
