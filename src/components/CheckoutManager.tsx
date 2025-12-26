import React, { useState, useEffect } from 'react';
import { Asset, Assignment, AssignmentInput } from '../types/api';
import { Calendar, User, MapPin, CheckCircle, Clock, X } from 'lucide-react';

interface CheckoutManagerProps {
  isOpen: boolean;
  onClose: () => void;
  asset?: Asset | null;
  onCheckoutComplete?: () => void;
}

export const CheckoutManager: React.FC<CheckoutManagerProps> = ({
  isOpen,
  onClose,
  asset,
  onCheckoutComplete,
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [formData, setFormData] = useState<AssignmentInput>({
    asset_id: asset?.id || 0,
    assigned_to: '',
    assigned_by: '',
    location: '',
    quantity: 1,
    expected_return_at: '',
    checkout_notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadAssignments();
      if (asset) {
        setFormData(prev => ({ ...prev, asset_id: asset.id }));
      }
    }
  }, [isOpen, asset]);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const filters = asset ? { assetId: asset.id } : { status: 'active' };
      const data = await window.api.getAssignments(filters);
      setAssignments(data);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await window.api.createAssignment(formData);
      setFormData({
        asset_id: asset?.id || 0,
        assigned_to: '',
        assigned_by: '',
        location: '',
        quantity: 1,
        expected_return_at: '',
        checkout_notes: '',
      });
      setShowCheckoutForm(false);
      await loadAssignments();
      onCheckoutComplete?.();
      alert('Asset checked out successfully!');
    } catch (error) {
      console.error('Failed to checkout asset:', error);
      alert('Failed to checkout asset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async (assignmentId: number) => {
    const notes = prompt('Enter check-in notes (optional):');
    if (notes === null) return; // User cancelled

    setLoading(true);
    try {
      await window.api.checkInAsset(assignmentId, notes || undefined);
      await loadAssignments();
      onCheckoutComplete?.();
      alert('Asset checked in successfully!');
    } catch (error) {
      console.error('Failed to check in asset:', error);
      alert('Failed to check in asset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (assignment: Assignment) => {
    if (assignment.status === 'returned') return 'text-green-600 bg-green-50';
    if (assignment.status === 'overdue') return 'text-red-600 bg-red-50';
    return 'text-blue-600 bg-blue-50';
  };

  const getStatusLabel = (assignment: Assignment) => {
    if (assignment.status === 'returned') return 'Returned';
    if (assignment.status === 'overdue') return 'Overdue';
    return 'Active';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {asset ? `Checkout/Check-in: ${asset.name}` : 'All Assignments'}
            </h2>
            {asset && (
              <p className="text-sm text-gray-600 mt-1">
                Asset Tag: {asset.asset_tag} • Status: {asset.status}
                {asset.is_tracked_inventory === 1 && (
                  <span> • Available: {asset.available_quantity}/{asset.total_quantity}</span>
                )}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Checkout Button */}
          {asset && !showCheckoutForm && (
            <div className="mb-6">
              <button
                onClick={() => setShowCheckoutForm(true)}
                disabled={asset.is_tracked_inventory === 1 && asset.available_quantity === 0}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {asset.is_tracked_inventory === 1 && asset.available_quantity === 0
                  ? 'All Items Checked Out'
                  : 'New Checkout'}
              </button>
            </div>
          )}

          {/* Checkout Form */}
          {showCheckoutForm && asset && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Checkout Asset</h3>
              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned To *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.assigned_to}
                      onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Person or department name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned By
                    </label>
                    <input
                      type="text"
                      value={formData.assigned_by}
                      onChange={(e) => setFormData({ ...formData, assigned_by: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Where is it going?"
                    />
                  </div>

                  {asset.is_tracked_inventory === 1 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={asset.available_quantity}
                        required
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Available: {asset.available_quantity}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Return Date
                    </label>
                    <input
                      type="date"
                      value={formData.expected_return_at}
                      onChange={(e) => setFormData({ ...formData, expected_return_at: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Checkout Notes
                  </label>
                  <textarea
                    value={formData.checkout_notes}
                    onChange={(e) => setFormData({ ...formData, checkout_notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Any notes about this checkout..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {loading ? 'Checking out...' : 'Checkout Asset'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCheckoutForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Assignments List */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {asset ? 'Assignment History' : 'All Active Assignments'}
            </h3>

            {loading && !showCheckoutForm ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No assignments found
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User size={16} className="text-gray-500" />
                          <span className="font-medium text-gray-900">
                            {assignment.assigned_to}
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(assignment)}`}>
                            {getStatusLabel(assignment)}
                          </span>
                        </div>
                        {!asset && (
                          <div className="text-sm text-gray-600 mb-1">
                            Asset: {(assignment as any).asset_name} ({(assignment as any).asset_tag})
                          </div>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          {assignment.location && (
                            <div className="flex items-center gap-1">
                              <MapPin size={14} />
                              <span>{assignment.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>Out: {formatDate(assignment.checked_out_at)}</span>
                          </div>
                          {assignment.expected_return_at && (
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>Due: {formatDate(assignment.expected_return_at)}</span>
                            </div>
                          )}
                          {assignment.checked_in_at && (
                            <div className="flex items-center gap-1">
                              <CheckCircle size={14} />
                              <span>Returned: {formatDate(assignment.checked_in_at)}</span>
                            </div>
                          )}
                        </div>
                        {assignment.quantity && assignment.quantity > 1 && (
                          <div className="text-sm text-gray-600 mt-1">
                            Quantity: {assignment.quantity}
                          </div>
                        )}
                        {assignment.checkout_notes && (
                          <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-100 rounded">
                            {assignment.checkout_notes}
                          </div>
                        )}
                        {assignment.checkin_notes && (
                          <div className="text-sm text-green-600 mt-2 p-2 bg-green-50 rounded">
                            Check-in notes: {assignment.checkin_notes}
                          </div>
                        )}
                      </div>
                      {assignment.status === 'active' && (
                        <button
                          onClick={() => handleCheckin(assignment.id)}
                          className="ml-4 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Check In
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {assignments.length} {assignments.length === 1 ? 'assignment' : 'assignments'}
            {assignments.filter(a => a.status === 'active').length > 0 && (
              <span> • {assignments.filter(a => a.status === 'active').length} active</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
