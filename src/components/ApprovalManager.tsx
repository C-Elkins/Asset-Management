import React, { useState, useEffect } from 'react';
import { CheckoutRequest, Asset, User } from '../types/api';
import { Clock, CheckCircle, XCircle, AlertTriangle, FileText, User as UserIcon } from 'lucide-react';
import { ManagerHeader, StatusBadge, EmptyState, ActionButton } from './shared';

interface ApprovalManagerProps {
  onClose: () => void;
  currentUser?: User | null;
  asset?: Asset | null; // If provided, show requests for this asset
}

// Status colors are now handled by the shared StatusBadge component

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock size={16} className="text-yellow-600" />;
    case 'approved':
      return <CheckCircle size={16} className="text-green-600" />;
    case 'rejected':
      return <XCircle size={16} className="text-red-600" />;
    case 'cancelled':
      return <AlertTriangle size={16} className="text-gray-600" />;
    default:
      return <FileText size={16} className="text-gray-600" />;
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const ApprovalManager: React.FC<ApprovalManagerProps> = ({ onClose, currentUser, asset }) => {
  const [requests, setRequests] = useState<CheckoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'my-approvals' | 'my-requests' | 'all'>('my-approvals');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CheckoutRequest | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalNotes, setApprovalNotes] = useState('');

  useEffect(() => {
    loadRequests();
  }, [viewMode, asset]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      let data: CheckoutRequest[];

      if (viewMode === 'my-approvals') {
        // Get pending requests where current user is the next approver
        data = await window.api.getPendingApprovalsFor(currentUser?.full_name || '');
      } else if (viewMode === 'my-requests') {
        // Get requests created by current user
        data = await window.api.getCheckoutRequests({ requestedBy: currentUser?.full_name });
      } else {
        // Get all requests
        const filters = asset ? { assetId: asset.id } : {};
        data = await window.api.getCheckoutRequests(filters as any);
      }

      setRequests(data);
    } catch (error) {
      console.error('Failed to load checkout requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async () => {
    if (!selectedRequest || !currentUser) return;

    try {
      const decision = {
        approve: approvalAction === 'approve',
        notes: approvalNotes
      };

      if (approvalAction === 'approve') {
        const result = await window.api.approveCheckoutRequest(
          selectedRequest.id,
          decision,
          currentUser.full_name
        );
        alert(result.message);
      } else {
        const result = await window.api.rejectCheckoutRequest(
          selectedRequest.id,
          decision,
          currentUser.full_name
        );
        alert(result.message);
      }

      setShowApprovalModal(false);
      setSelectedRequest(null);
      setApprovalNotes('');
      await loadRequests();
    } catch (error: any) {
      alert(error.message || 'Failed to process approval');
    }
  };

  const handleCancelRequest = async (request: CheckoutRequest) => {
    if (!confirm('Are you sure you want to cancel this checkout request?')) return;

    try {
      await window.api.cancelCheckoutRequest(request.id);
      await loadRequests();
    } catch (error: any) {
      alert(error.message || 'Failed to cancel request');
    }
  };

  const openApprovalModal = (request: CheckoutRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const myApprovalsCount = requests.filter(r =>
    r.status === 'pending' && r.pending_approver === currentUser?.full_name
  ).length;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <ManagerHeader
          title="Checkout Approvals"
          subtitle={myApprovalsCount > 0 ? `${myApprovalsCount} pending approval${myApprovalsCount !== 1 ? 's' : ''}` : 'Manage checkout requests and approvals'}
          icon={<FileText size={24} />}
          gradientFrom="purple-600"
          gradientTo="indigo-600"
          onClose={onClose}
        />

        {/* View Mode Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex px-6">
            <button
              onClick={() => setViewMode('my-approvals')}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                viewMode === 'my-approvals'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <UserIcon size={16} className="inline mr-2" />
              My Approvals {myApprovalsCount > 0 && `(${myApprovalsCount})`}
            </button>
            <button
              onClick={() => setViewMode('my-requests')}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                viewMode === 'my-requests'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <FileText size={16} className="inline mr-2" />
              My Requests
            </button>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setViewMode('all')}
                className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  viewMode === 'all'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                All Requests
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p>Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <EmptyState
              icon={<FileText size={48} />}
              title="No Requests Found"
              description={
                viewMode === 'my-approvals' ? 'No checkout requests are pending your approval.' :
                viewMode === 'my-requests' ? 'You have not created any checkout requests.' :
                'No checkout requests in the system.'
              }
            />
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(request.status)}
                      <div>
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                          {request.asset_name || 'Unknown Asset'}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Asset Tag: {request.asset_tag} • Request ID: #{request.id}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={request.status} icon={getStatusIcon(request.status)} />
                  </div>

                  {/* Request Details */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Requested By:</span>
                      <p className="text-gray-900 dark:text-gray-100">{request.requested_by}</p>
                    </div>
                    {request.requested_for && (
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">For:</span>
                        <p className="text-gray-900 dark:text-gray-100">{request.requested_for}</p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Requested:</span>
                      <p className="text-gray-900 dark:text-gray-100">{formatDate(request.created_at)}</p>
                    </div>
                    {request.expected_return_date && (
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Expected Return:</span>
                        <p className="text-gray-900 dark:text-gray-100">{new Date(request.expected_return_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    {request.checkout_purpose && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Purpose:</span>
                        <p className="text-gray-900 dark:text-gray-100">{request.checkout_purpose}</p>
                      </div>
                    )}
                  </div>

                  {/* Approval Chain */}
                  {request.approval_steps && request.approval_steps.length > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Approval Chain:</p>
                      <div className="flex items-center gap-2 overflow-x-auto">
                        {request.approval_steps.map((step, index) => (
                          <React.Fragment key={step.id}>
                            {index > 0 && <span className="text-gray-400">→</span>}
                            <div
                              className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap ${
                                step.status === 'approved'
                                  ? 'bg-green-100 text-green-800 border border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                                  : step.status === 'rejected'
                                  ? 'bg-red-100 text-red-800 border border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                                  : step.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
                                  : 'bg-gray-100 text-gray-600 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
                              }`}
                            >
                              {step.approver_name}
                              {step.status === 'approved' && ' ✓'}
                              {step.status === 'rejected' && ' ✗'}
                              {step.status === 'pending' && ' ⏳'}
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {request.notes && (
                    <div className="mb-4 text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Notes:</span>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{request.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    {request.status === 'pending' && request.pending_approver === currentUser?.full_name && (
                      <>
                        <ActionButton
                          icon={<CheckCircle size={16} />}
                          label="Approve"
                          onClick={() => openApprovalModal(request, 'approve')}
                          variant="success"
                          size="sm"
                        />
                        <ActionButton
                          icon={<XCircle size={16} />}
                          label="Reject"
                          onClick={() => openApprovalModal(request, 'reject')}
                          variant="danger"
                          size="sm"
                        />
                      </>
                    )}

                    {request.status === 'pending' && request.requested_by === currentUser?.full_name && (
                      <ActionButton
                        icon={<XCircle size={16} />}
                        label="Cancel Request"
                        onClick={() => handleCancelRequest(request)}
                        variant="secondary"
                        size="sm"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approval/Rejection Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full">
            <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${
              approvalAction === 'approve' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
            }`}>
              <h3 className={`text-lg font-semibold ${
                approvalAction === 'approve' ? 'text-green-900 dark:text-green-400' : 'text-red-900 dark:text-red-400'
              }`}>
                {approvalAction === 'approve' ? 'Approve' : 'Reject'} Checkout Request
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedRequest.asset_name} ({selectedRequest.asset_tag})
              </p>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {approvalAction === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason'}
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-100"
                  placeholder={approvalAction === 'approve'
                    ? 'Add any notes about this approval...'
                    : 'Please provide a reason for rejection...'}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setApprovalNotes('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproveReject}
                  className={`flex-1 px-4 py-2 rounded-md text-white ${
                    approvalAction === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {approvalAction === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
