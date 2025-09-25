import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetService } from '../../services/assetService.js';
import { AssetForm } from './AssetForm.jsx';

export const AssetCard = ({ asset, onUpdate, selectable = false, selected = false, onSelect }) => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Map API enums to CSS-friendly class suffixes
  const statusClass = (status) =>
    (status || '').toLowerCase(); // e.g., AVAILABLE -> available, IN_MAINTENANCE -> in_maintenance

  const conditionClass = (condition) =>
    (condition || '').toLowerCase(); // e.g., EXCELLENT -> excellent

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setIsUpdating(true);
      await assetService.changeStatus(asset.id, newStatus);
      onUpdate(); // Refresh the list
    } catch (error) {
      console.error('Failed to update asset status:', error);
      alert('Failed to update asset status. Please try again.');
    } finally {
      setIsUpdating(false);
      setShowActions(false);
    }
  };

  const handleAssignUser = () => {
    if (asset?.id) {
      navigate(`/app/assets/${asset.id}/assign`);
    }
    setShowActions(false);
  };


  const handleViewDetails = () => {
    if (asset?.id) {
      navigate(`/app/assets/${asset.id}`);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
    setShowActions(false);
  };

  const handleEditComplete = (_updatedAsset) => {
    setShowEditModal(false);
    onUpdate(); // Refresh the list
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${asset.name}"? This action cannot be undone.`)) {
      try {
        setIsUpdating(true);
        await assetService.delete(asset.id);
        onUpdate(); // Refresh the list
      } catch (error) {
        console.error('Failed to delete asset:', error);
        alert('Failed to delete asset. Please try again.');
        setIsUpdating(false);
      }
    }
    setShowActions(false);
  };

  return (
    <>
      <div className={`asset-card ${selected ? 'selected' : ''}`}>
        {/* Selection Checkbox */}
        {selectable && (
          <div className="asset-selection">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect?.(e.target.checked)}
              className="asset-checkbox"
            />
          </div>
        )}

        {/* Asset Header */}
        <div className="asset-card-header">
          <div>
            <h3 className="asset-name">{asset.name}</h3>
            <p className="asset-tag">#{asset.assetTag}</p>
          </div>
          <div className="asset-actions">
            <button 
              className="action-menu-btn"
              onClick={() => setShowActions(!showActions)}
              disabled={isUpdating}
            >
              ⋮
            </button>
            {showActions && (
              <div className="action-menu">
                <button onClick={handleViewDetails}>View Details</button>
                <button onClick={handleEdit}>Edit Asset</button>
                <button onClick={handleAssignUser}>Manage Assignment</button>
                <hr />
                <button onClick={() => handleStatusChange('AVAILABLE')}>Mark Available</button>
                <button onClick={() => handleStatusChange('IN_MAINTENANCE')}>Send to Maintenance</button>
                <button onClick={() => handleStatusChange('RETIRED')}>Retire</button>
                <hr />
                <button onClick={handleDelete} className="delete-action">Delete Asset</button>
              </div>
            )}
          </div>
        </div>

        {/* Asset Info */}
        <div className="asset-info">
          <div className="asset-field">
            <span className="field-label">Status:</span>
            <span 
              className={`status-badge ${statusClass(asset.status)}`}
            >
              {asset.status?.replace('_', ' ')}
            </span>
          </div>

          <div className="asset-field">
            <span className="field-label">Condition:</span>
            <span 
              className={`condition-badge ${conditionClass(asset.condition)}`}
            >
              {asset.condition}
            </span>
          </div>

          {asset.brand && (
            <div className="asset-field">
              <span className="field-label">Brand:</span>
              <span>{asset.brand}</span>
            </div>
          )}

          {asset.model && (
            <div className="asset-field">
              <span className="field-label">Model:</span>
              <span>{asset.model}</span>
            </div>
          )}

          {asset.serialNumber && (
            <div className="asset-field">
              <span className="field-label">Serial:</span>
              <span className="serial-number">{asset.serialNumber}</span>
            </div>
          )}

          {asset.location && (
            <div className="asset-field">
              <span className="field-label">Location:</span>
              <span>{asset.location}</span>
            </div>
          )}

          {asset.category && (
            <div className="asset-field">
              <span className="field-label">Category:</span>
              <span>{asset.category.name}</span>
            </div>
          )}

          {asset.purchasePrice && (
            <div className="asset-field">
              <span className="field-label">Value:</span>
              <span className="purchase-price">{formatCurrency(asset.purchasePrice)}</span>
            </div>
          )}

          {asset.purchaseDate && (
            <div className="asset-field">
              <span className="field-label">Purchased:</span>
              <span>{formatDate(asset.purchaseDate)}</span>
            </div>
          )}

          {asset.warrantyExpiry && (
            <div className="asset-field">
              <span className="field-label">Warranty:</span>
              <span className={new Date(asset.warrantyExpiry) < new Date() ? 'expired' : ''}>
                {formatDate(asset.warrantyExpiry)}
              </span>
            </div>
          )}

          {asset.assignedUsers && asset.assignedUsers.length > 0 && (
            <div className="asset-field">
              <span className="field-label">Assigned to:</span>
              <div className="assigned-users">
                {asset.assignedUsers.map(user => (
                  <span key={user.id} className="user-badge">
                    {user.firstName} {user.lastName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {isUpdating && (
          <div className="loading-overlay">
            <div className="spinner">Updating...</div>
          </div>
        )}
      </div>

      {/* User Assignment Modal */}
      {/* assignment modal handled by route now */}

      {/* Edit Asset Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AssetForm 
              initialData={asset}
              onSubmit={handleEditComplete}
              onCancel={() => setShowEditModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};
