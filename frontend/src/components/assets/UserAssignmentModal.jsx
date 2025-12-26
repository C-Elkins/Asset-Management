import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService.js';
import { assetService } from '../../services/assetService.js';

export const UserAssignmentModal = ({ asset, onClose, onAssign }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await userService.getActive();
      setUsers(userData);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim()) {
      const searchUsers = async () => {
        try {
          setSearching(true);
          const searchResults = await userService.search(searchTerm);
          setUsers(searchResults);
        } catch (err) {
          console.error('User search failed:', err);
        } finally {
          setSearching(false);
        }
      };

      const debounceTimer = setTimeout(searchUsers, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      loadUsers();
    }
  }, [searchTerm]);

  const handleAssign = async () => {
    if (!selectedUser) return;

    try {
      setAssignLoading(true);
      setError(null);
      
      await assetService.assignToUser(asset.id, selectedUser.id);
      onAssign(selectedUser);
      onClose();
    } catch (err) {
      console.error('Failed to assign asset:', err);
      setError(err.response?.data?.message || 'Failed to assign asset. Please try again.');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleUnassign = async (userId) => {
    try {
      setAssignLoading(true);
      setError(null);
      
      await assetService.unassignFromUser(asset.id, userId);
      onAssign(null); // Notify parent of unassignment
      onClose();
    } catch (err) {
      console.error('Failed to unassign asset:', err);
      setError(err.response?.data?.message || 'Failed to unassign asset. Please try again.');
    } finally {
      setAssignLoading(false);
    }
  };

  const formatUserRole = (role) => {
    return role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const isUserAssigned = (user) => {
    return asset.assignedUsers?.some(assignedUser => assignedUser.id === user.id);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content user-assignment-modal">
        <div className="modal-header">
          <h2>Assign Asset: {asset.name}</h2>
          <button 
            className="close-button" 
            onClick={onClose}
            disabled={assignLoading}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Asset Info */}
          <div className="asset-info-summary">
            <div className="asset-summary">
              <h3>{asset.name}</h3>
              <p className="asset-tag">#{asset.assetTag}</p>
              <span className={`status-badge ${asset.status.toLowerCase()}`}>
                {asset.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Current Assignments */}
          {asset.assignedUsers && asset.assignedUsers.length > 0 && (
            <div className="current-assignments">
              <h4>Currently Assigned To:</h4>
              <div className="assigned-users-list">
                {asset.assignedUsers.map(user => (
                  <div key={user.id} className="assigned-user-item">
                    <div className="user-info">
                      <span className="user-name">{user.firstName} {user.lastName}</span>
                      <span className="user-details">{user.email} • {formatUserRole(user.role)}</span>
                      {user.department && <span className="user-department">{user.department}</span>}
                    </div>
                    <button
                      className="unassign-btn"
                      onClick={() => handleUnassign(user.id)}
                      disabled={assignLoading}
                    >
                      Unassign
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* User Search and Selection */}
          <div className="user-selection">
            <h4>Assign to User:</h4>
            
            <div className="search-box">
              <input
                type="text"
                placeholder="Search users by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            {loading || searching ? (
              <div className="loading-users">Loading users...</div>
            ) : (
              <div className="users-list">
                {users.length === 0 ? (
                  <div className="no-users">
                    {searchTerm ? 'No users found matching your search.' : 'No active users available.'}
                  </div>
                ) : (
                  users.map(user => (
                    <div 
                      key={user.id} 
                      className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''} ${isUserAssigned(user) ? 'assigned' : ''}`}
                      role="option"
                      aria-selected={selectedUser?.id === user.id}
                      aria-disabled={isUserAssigned(user)}
                      tabIndex={isUserAssigned(user) ? -1 : 0}
                      onClick={() => !isUserAssigned(user) && setSelectedUser(user)}
                      onKeyDown={(e) => {
                        if (isUserAssigned(user)) return;
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedUser(user);
                        }
                      }}
                    >
                      <div className="user-info">
                        <div className="user-name">{user.firstName} {user.lastName}</div>
                        <div className="user-details">
                          <span className="user-email">{user.email}</span>
                          <span className="user-role">{formatUserRole(user.role)}</span>
                          {user.department && <span className="user-department">{user.department}</span>}
                        </div>
                      </div>
                      
                      {isUserAssigned(user) && (
                        <span className="already-assigned">Already Assigned</span>
                      )}
                      
                      {selectedUser?.id === user.id && !isUserAssigned(user) && (
                        <span className="selected-indicator">✓ Selected</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn-secondary" 
            onClick={onClose}
            disabled={assignLoading}
          >
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={handleAssign}
            disabled={!selectedUser || assignLoading || isUserAssigned(selectedUser)}
          >
            {assignLoading ? 'Assigning...' : 'Assign Asset'}
          </button>
        </div>
      </div>
    </div>
  );
};
