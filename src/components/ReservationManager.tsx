import React, { useState, useEffect } from 'react';
import { Reservation, ReservationInput, Asset, User } from '../types/api';
import { Calendar as CalendarIcon, List, Plus, Edit, Ban, Trash2, AlertCircle, CheckCircle, Clock, PlayCircle, XCircle } from 'lucide-react';
import { ManagerHeader, StatusBadge, EmptyState, ActionButton } from './shared';
import { ReservationCalendar } from './ReservationCalendar';

interface ReservationManagerProps {
  asset?: Asset;
  onClose?: () => void;
  currentUser?: User | null;
}

type ViewMode = 'list' | 'calendar';

export const ReservationManager: React.FC<ReservationManagerProps> = ({ asset, onClose, currentUser }) => {
  const canPerformActions = currentUser !== null;
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [formData, setFormData] = useState<ReservationInput>({
    asset_id: asset?.id || 0,
    reserved_by: currentUser?.full_name || '',
    reservation_start: '',
    reservation_end: '',
    status: 'pending',
  });
  const [conflictCheck, setConflictCheck] = useState<{ hasConflict: boolean; conflicts: Reservation[] }>({
    hasConflict: false,
    conflicts: []
  });

  // Load reservations
  const loadReservations = async () => {
    try {
      setLoading(true);
      const filters = asset ? { assetId: asset.id } : {};
      const data = await window.api.getReservations(filters);
      setReservations(data);
    } catch (error) {
      console.error('Failed to load reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [asset?.id]);

  // Check for conflicts when dates change
  useEffect(() => {
    const checkConflicts = async () => {
      if (formData.asset_id && formData.reservation_start && formData.reservation_end) {
        try {
          const result = await window.api.checkReservationConflicts(
            formData.asset_id,
            formData.reservation_start,
            formData.reservation_end,
            editingReservation?.id
          );
          setConflictCheck(result);
        } catch (error) {
          console.error('Failed to check conflicts:', error);
        }
      }
    };

    checkConflicts();
  }, [formData.asset_id, formData.reservation_start, formData.reservation_end, editingReservation?.id]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (conflictCheck.hasConflict) {
      if (!confirm('⚠️ This reservation conflicts with existing reservations. Continue anyway?')) {
        return;
      }
    }

    try {
      if (editingReservation) {
        await window.api.updateReservation(editingReservation.id, formData);
      } else {
        await window.api.createReservation(formData);
      }
      setShowModal(false);
      setEditingReservation(null);
      resetForm();
      await loadReservations();
    } catch (error) {
      console.error('Failed to save reservation:', error);
      alert('Failed to save reservation');
    }
  };

  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setFormData({
      asset_id: reservation.asset_id,
      reserved_by: reservation.reserved_by,
      reserved_for: reservation.reserved_for || '',
      reservation_start: reservation.reservation_start.split('T')[0],
      reservation_end: reservation.reservation_end.split('T')[0],
      status: reservation.status,
      purpose: reservation.purpose || '',
      notes: reservation.notes || '',
    });
    setShowModal(true);
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Cancel this reservation?')) return;

    try {
      await window.api.cancelReservation(id);
      await loadReservations();
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
      alert('Failed to cancel reservation');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this reservation permanently?')) return;

    try {
      await window.api.deleteReservation(id);
      await loadReservations();
    } catch (error) {
      console.error('Failed to delete reservation:', error);
      alert('Failed to delete reservation');
    }
  };

  // Status workflow transition handlers
  const handleConfirm = async (reservation: Reservation) => {
    try {
      await window.api.updateReservation(reservation.id, { status: 'confirmed' });
      await loadReservations();
    } catch (error) {
      console.error('Failed to confirm reservation:', error);
      alert('Failed to confirm reservation');
    }
  };

  const handleStart = async (reservation: Reservation) => {
    try {
      await window.api.updateReservation(reservation.id, { status: 'active' });
      await loadReservations();
    } catch (error) {
      console.error('Failed to start reservation:', error);
      alert('Failed to start reservation');
    }
  };

  const handleComplete = async (reservation: Reservation) => {
    try {
      await window.api.updateReservation(reservation.id, { status: 'completed' });
      await loadReservations();
    } catch (error) {
      console.error('Failed to complete reservation:', error);
      alert('Failed to complete reservation');
    }
  };

  const resetForm = () => {
    setFormData({
      asset_id: asset?.id || 0,
      reserved_by: currentUser?.full_name || '',
      reservation_start: '',
      reservation_end: '',
      status: 'pending',
    });
    setConflictCheck({ hasConflict: false, conflicts: [] });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = (reservation: Reservation) => {
    if (reservation.status === 'active' || reservation.status === 'confirmed') {
      return new Date(reservation.reservation_end) < new Date();
    }
    return false;
  };

  const handleCalendarSlotSelect = (start: Date, end: Date) => {
    if (!canPerformActions) return;
    setEditingReservation(null);
    setFormData({
      asset_id: asset?.id || 0,
      reserved_by: currentUser?.full_name || '',
      reservation_start: start.toISOString().split('T')[0],
      reservation_end: end.toISOString().split('T')[0],
      status: 'pending',
    });
    setShowModal(true);
  };

  const handleCalendarEventSelect = (reservation: Reservation) => {
    handleEdit(reservation);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      {/* Header */}
      <ManagerHeader
        title="Reservations"
        subtitle={asset ? `${asset.name} (${asset.asset_tag})` : `${reservations.length} total reservation${reservations.length !== 1 ? 's' : ''}`}
        icon={<CalendarIcon size={24} />}
        gradientFrom="indigo-600"
        gradientTo="purple-600"
        onClose={onClose}
        actions={
          <>
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-white bg-opacity-20 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-indigo-600'
                    : 'text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <List size={16} className="inline mr-1.5" />
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-white text-indigo-600'
                    : 'text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <CalendarIcon size={16} className="inline mr-1.5" />
                Calendar
              </button>
            </div>

            {/* New Reservation Button */}
            {canPerformActions && (
              <ActionButton
                icon={<Plus size={18} />}
                label="New Reservation"
                onClick={() => {
                  setEditingReservation(null);
                  resetForm();
                  setShowModal(true);
                }}
                variant="primary"
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-none"
              />
            )}
          </>
        }
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-500">Loading reservations...</p>
          </div>
        ) : (
          <>
            {/* Calendar View */}
            {viewMode === 'calendar' && (
              <ReservationCalendar
                reservations={reservations}
                onSelectSlot={handleCalendarSlotSelect}
                onSelectEvent={handleCalendarEventSelect}
              />
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <>
                {reservations.length === 0 ? (
                  <EmptyState
                    icon={<CalendarIcon size={48} />}
                    title="No reservations found"
                    description={asset ? `No reservations exist for ${asset.name}` : 'No reservations in the system'}
                    action={canPerformActions ? {
                      label: 'Create First Reservation',
                      onClick: () => {
                        resetForm();
                        setShowModal(true);
                      }
                    } : undefined}
                  />
                ) : (
                  <div className="space-y-3">
                    {reservations.map((reservation) => (
                      <div
                        key={reservation.id}
                        className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                          isOverdue(reservation) ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                        } ${conflictCheck.conflicts.some(c => c.id === reservation.id) ? 'ring-2 ring-yellow-400' : ''}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <StatusBadge status={reservation.status} />
                              {isOverdue(reservation) && (
                                <StatusBadge
                                  status="overdue"
                                  colorMap={{ overdue: 'bg-red-100 text-red-800 border-red-300' }}
                                  icon={<AlertCircle size={14} />}
                                />
                              )}
                            </div>
                            {!asset && reservation.asset_name && (
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {reservation.asset_name} ({reservation.asset_tag})
                              </h3>
                            )}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-2">
                              <div>
                                <span className="text-gray-600 flex items-center gap-1">
                                  <Clock size={14} />
                                  Start:
                                </span>
                                <span className="font-medium text-gray-900">{formatDate(reservation.reservation_start)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600 flex items-center gap-1">
                                  <Clock size={14} />
                                  End:
                                </span>
                                <span className="font-medium text-gray-900">{formatDate(reservation.reservation_end)}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Reserved By:</span>
                                <span className="font-medium text-gray-900 block">{reservation.reserved_by}</span>
                              </div>
                              {reservation.reserved_for && (
                                <div>
                                  <span className="text-gray-600">For:</span>
                                  <span className="font-medium text-gray-900 block">{reservation.reserved_for}</span>
                                </div>
                              )}
                            </div>
                            {reservation.purpose && (
                              <p className="text-sm text-gray-700 mb-1">
                                <span className="font-medium">Purpose:</span> {reservation.purpose}
                              </p>
                            )}
                            {reservation.notes && (
                              <p className="text-sm text-gray-600 italic">{reservation.notes}</p>
                            )}
                          </div>

                          {/* Actions Column */}
                          {canPerformActions && (
                            <div className="flex flex-col gap-2 ml-4">
                              {/* Status Workflow Buttons */}
                              {reservation.status === 'pending' && (
                                <ActionButton
                                  icon={<CheckCircle size={16} />}
                                  label="Confirm"
                                  onClick={() => handleConfirm(reservation)}
                                  variant="success"
                                  size="sm"
                                />
                              )}
                              {reservation.status === 'confirmed' && (
                                <ActionButton
                                  icon={<PlayCircle size={16} />}
                                  label="Start"
                                  onClick={() => handleStart(reservation)}
                                  variant="info"
                                  size="sm"
                                />
                              )}
                              {reservation.status === 'active' && (
                                <ActionButton
                                  icon={<CheckCircle size={16} />}
                                  label="Complete"
                                  onClick={() => handleComplete(reservation)}
                                  variant="success"
                                  size="sm"
                                />
                              )}

                              {/* Standard Actions */}
                              <div className="flex items-center gap-1">
                                <ActionButton
                                  icon={<Edit size={16} />}
                                  onClick={() => handleEdit(reservation)}
                                  variant="primary"
                                  size="sm"
                                  title="Edit"
                                />
                                {reservation.status !== 'cancelled' && reservation.status !== 'completed' && (
                                  <ActionButton
                                    icon={<Ban size={16} />}
                                    onClick={() => handleCancel(reservation.id)}
                                    variant="warning"
                                    size="sm"
                                    title="Cancel"
                                  />
                                )}
                                <ActionButton
                                  icon={<Trash2 size={16} />}
                                  onClick={() => handleDelete(reservation.id)}
                                  variant="danger"
                                  size="sm"
                                  title="Delete"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 bg-indigo-50">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingReservation ? 'Edit Reservation' : 'New Reservation'}
              </h3>
            </div>

            <form onSubmit={handleCreateOrUpdate} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reserved By <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.reserved_by}
                    onChange={(e) => setFormData({ ...formData, reserved_by: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reserved For</label>
                  <input
                    type="text"
                    value={formData.reserved_for || ''}
                    onChange={(e) => setFormData({ ...formData, reserved_for: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Person/Department (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.reservation_start}
                    onChange={(e) => setFormData({ ...formData, reservation_start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.reservation_end}
                    onChange={(e) => setFormData({ ...formData, reservation_end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                  <input
                    type="text"
                    value={formData.purpose || ''}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="What will this be used for?"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Additional details..."
                  />
                </div>
              </div>

              {/* Conflict Warning */}
              {conflictCheck.hasConflict && (
                <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={24} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-yellow-900 mb-1">⚠️ Reservation Conflict Detected</p>
                      <p className="text-sm text-yellow-800 mb-2">
                        This asset has {conflictCheck.conflicts.length} conflicting reservation(s) during this period:
                      </p>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        {conflictCheck.conflicts.map((conflict) => (
                          <li key={conflict.id} className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                            {formatDate(conflict.reservation_start)} - {formatDate(conflict.reservation_end)}
                            ({conflict.reserved_by})
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingReservation(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  {editingReservation ? 'Update' : 'Create'} Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
