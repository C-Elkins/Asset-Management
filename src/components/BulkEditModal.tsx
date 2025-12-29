import React, { useState } from 'react';
import { Category } from '../types/api';
import { X, Edit } from 'lucide-react';

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  selectedIds: number[];
  categories: Category[];
  onUpdate: (updates: any) => Promise<void>;
}

export const BulkEditModal: React.FC<BulkEditModalProps> = ({
  isOpen,
  onClose,
  selectedCount,
  selectedIds,
  categories,
  onUpdate,
}) => {
  const [updating, setUpdating] = useState(false);
  const [updates, setUpdates] = useState({
    category_id: '',
    status: '',
    location: '',
    condition: '',
    notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty fields
    const filteredUpdates: any = {};
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== '') {
        if (key === 'category_id') {
          filteredUpdates[key] = parseInt(value);
        } else {
          filteredUpdates[key] = value;
        }
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      alert('Please select at least one field to update');
      return;
    }

    try {
      setUpdating(true);
      await onUpdate(filteredUpdates);
      onClose();
      setUpdates({
        category_id: '',
        status: '',
        location: '',
        condition: '',
        notes: '',
      });
    } catch (error: any) {
      alert(`Failed to update assets: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <Edit size={20} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Bulk Edit Assets</h3>
              <p className="text-sm text-gray-600">Update {selectedCount} selected assets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Only fill in the fields you want to update. Empty fields will remain unchanged.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={updates.category_id}
              onChange={(e) => setUpdates({ ...updates, category_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Keep Current --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={updates.status}
              onChange={(e) => setUpdates({ ...updates, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Keep Current --</option>
              <optgroup label="Active">
                <option value="available">Available</option>
                <option value="in-use">In Use</option>
                <option value="assigned">Assigned</option>
                <option value="reserved">Reserved</option>
              </optgroup>
              <optgroup label="Storage">
                <option value="in-storage">In Storage</option>
                <option value="on-order">On Order</option>
                <option value="in-transit">In Transit</option>
              </optgroup>
              <optgroup label="Service">
                <option value="maintenance">Maintenance</option>
                <option value="under-repair">Under Repair</option>
              </optgroup>
              <optgroup label="Issues">
                <option value="lost">Lost</option>
                <option value="stolen">Stolen</option>
                <option value="damaged">Damaged</option>
              </optgroup>
              <optgroup label="End of Life">
                <option value="retired">Retired</option>
                <option value="disposed">Disposed</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={updates.location}
              onChange={(e) => setUpdates({ ...updates, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Leave empty to keep current"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condition
            </label>
            <select
              value={updates.condition}
              onChange={(e) => setUpdates({ ...updates, condition: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Keep Current --</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={updates.notes}
              onChange={(e) => setUpdates({ ...updates, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Leave empty to keep current notes"
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
              disabled={updating}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {updating ? 'Updating...' : `Update ${selectedCount} Assets`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
