import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

interface BulkAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  selectedIds: number[];
  onAssign: (assignment: any) => Promise<void>;
}

export const BulkAssignModal: React.FC<BulkAssignModalProps> = ({
  isOpen,
  onClose,
  selectedCount,
  selectedIds,
  onAssign,
}) => {
  const [assigning, setAssigning] = useState(false);
  const [formData, setFormData] = useState({
    assigned_to: '',
    assigned_by: '',
    checkout_notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.assigned_to.trim()) {
      alert('Please enter who to assign these assets to');
      return;
    }

    try {
      setAssigning(true);
      await onAssign(formData);
      onClose();
      setFormData({
        assigned_to: '',
        assigned_by: '',
        checkout_notes: '',
      });
    } catch (error: any) {
      alert(`Failed to assign assets: ${error.message}`);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <UserPlus size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Bulk Assign Assets</h3>
              <p className="text-sm text-gray-600">Assign {selectedCount} assets to a person</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              All {selectedCount} selected assets will be assigned to the person you specify below.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign To <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter person's name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned By
            </label>
            <input
              type="text"
              value={formData.assigned_by}
              onChange={(e) => setFormData({ ...formData, assigned_by: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your name (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.checkout_notes}
              onChange={(e) => setFormData({ ...formData, checkout_notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any notes about this assignment (optional)"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assigning}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {assigning ? 'Assigning...' : `Assign ${selectedCount} Assets`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
