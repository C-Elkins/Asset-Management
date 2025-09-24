import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetService } from '../../services/assetService.js';
import { exportService } from '../../services/exportService.js';
import { KeyboardShortcuts, ShortcutsHelp } from '../../hooks/useKeyboardShortcuts.jsx';
import { AssetCard } from './AssetCard.jsx';
import { AssetForm } from './AssetForm.jsx';

export const AssetList = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [allAssets, setAllAssets] = useState([]); // For export purposes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // Asset status options
  const statusOptions = [
    { value: 'ALL', label: 'All Assets' },
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_MAINTENANCE', label: 'In Maintenance' },
    { value: 'RETIRED', label: 'Retired' },
    { value: 'LOST', label: 'Lost' },
    { value: 'DAMAGED', label: 'Damaged' }
  ];

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      const params = {
        page: currentPage,
        size: 10 // Items per page
      };

      if (searchTerm) {
        // Use search endpoint if there's a search term
        response = await assetService.search(searchTerm, params);
      } else if (statusFilter && statusFilter !== 'ALL') {
        // Filter by status if selected
        response = await assetService.getByStatus(statusFilter, params);
      } else {
        // Get all assets with pagination
        response = await assetService.list(params);
      }

      // Handle both paginated and non-paginated responses
      if (response.content) {
        // Paginated response
        setAssets(response.content);
        setTotalPages(response.totalPages);
      } else if (Array.isArray(response)) {
        // Non-paginated response
        setAssets(response);
        setTotalPages(1);
      } else {
        setAssets([]);
        setTotalPages(0);
      }

      // Also fetch all assets for export (without pagination)
      if (currentPage === 0) {
        try {
          const allAssetsResponse = await assetService.list({ size: 1000 }); // Get up to 1000 assets
          const allAssetsData = Array.isArray(allAssetsResponse) ? allAssetsResponse : (allAssetsResponse.content || []);
          setAllAssets(allAssetsData);
        } catch (err) {
          console.warn('Could not fetch all assets for export:', err);
        }
      }
    } catch (err) {
      console.error('Failed to fetch assets:', err);
      setError('Failed to load assets. Please try again.');
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcuts configuration (defined after handlers to avoid TDZ issues)
  const shortcuts = React.useMemo(() => ([
    {
      key: 'n',
      ctrl: true,
      description: 'Create new asset',
      action: () => setShowCreateForm(true)
    },
    {
      key: 'e',
      ctrl: true,
      description: 'Export to CSV',
      action: () => handleExportCSV()
    },
    {
      key: 'p',
      ctrl: true,
      description: 'Export to PDF',
      action: () => handleExportPDF()
    },
    {
      key: 'a',
      ctrl: true,
      description: 'Select all assets',
      action: () => handleSelectAll(selectedAssets.size === 0)
    },
    {
      key: 'f',
      ctrl: true,
      description: 'Focus search',
      action: () => {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) searchInput.focus();
      }
    },
    {
      key: 'r',
      ctrl: true,
      description: 'Refresh assets',
      action: () => fetchAssets()
    },
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      action: () => setShowShortcutsHelp(!showShortcutsHelp)
    },
    {
      key: 'Escape',
      description: 'Close modals/Clear selection',
      action: () => {
        if (showCreateForm) setShowCreateForm(false);
        else if (showShortcutsHelp) setShowShortcutsHelp(false);
        else if (selectedAssets.size > 0) setSelectedAssets(new Set());
      }
    }
  ]), [selectedAssets, showCreateForm, showShortcutsHelp]);

  // Fetch assets when dependencies change
  useEffect(() => {
    fetchAssets();
  }, [currentPage, statusFilter]);

  // Handle search with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(0); // Reset to first page on search
      fetchAssets();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleStatusChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(0);
    setSearchTerm(''); // Clear search when filtering by status
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setStatusFilter('ALL'); // Clear status filter when searching
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleAssetUpdate = () => {
    // Refresh the list when an asset is updated
    fetchAssets();
  };

  const handleCreateAsset = (newAsset) => {
    // Close the form and refresh the list
    setShowCreateForm(false);
    fetchAssets();
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
  };

  // Export handlers
  const handleExportCSV = () => {
    const assetsToExport = searchTerm || statusFilter !== 'ALL' ? assets : allAssets;
    exportService.exportToCSV(assetsToExport, 'assets-export');
  };

  const handleExportPDF = () => {
    const assetsToExport = searchTerm || statusFilter !== 'ALL' ? assets : allAssets;
    exportService.exportToPDF(assetsToExport, 'assets-report');
  };

  // Bulk action handlers
  const handleSelectAsset = (assetId, selected) => {
    const newSelected = new Set(selectedAssets);
    if (selected) {
      newSelected.add(assetId);
    } else {
      newSelected.delete(assetId);
    }
    setSelectedAssets(newSelected);
  };

  const handleSelectAll = (selected) => {
    if (selected) {
      setSelectedAssets(new Set(assets.map(a => a.id)));
    } else {
      setSelectedAssets(new Set());
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedAssets.size === 0) return;

    setBulkLoading(true);
    try {
      const promises = Array.from(selectedAssets).map(assetId => 
        assetService.changeStatus(assetId, newStatus)
      );
      await Promise.all(promises);
      
      setSelectedAssets(new Set());
      setShowBulkActions(false);
      fetchAssets(); // Refresh the list
    } catch (error) {
      console.error('Bulk status change failed:', error);
      alert('Some status changes failed. Please try again.');
    } finally {
      setBulkLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="asset-list-container">
        <div className="loading">Loading assets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="asset-list-container">
        <div className="error">
          {error}
          <button onClick={fetchAssets} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="asset-list-container">
      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts shortcuts={shortcuts} />
      <ShortcutsHelp 
        show={showShortcutsHelp} 
        onClose={() => setShowShortcutsHelp(false)}
        shortcuts={shortcuts}
      />
      {/* Header */}
      <div className="asset-list-header">
        <div className="header-left">
          <h2>Assets ({assets.length})</h2>
          {selectedAssets.size > 0 && (
            <div className="bulk-selection-info">
              {selectedAssets.size} selected
              <button 
                className="clear-selection-btn"
                onClick={() => setSelectedAssets(new Set())}
              >
                Clear
              </button>
            </div>
          )}
        </div>
        
  <div className="header-actions">
          {/* Export Buttons */}
          <div className="export-actions">
            <button 
              className="btn-outline"
              onClick={handleExportCSV}
              title="Export to CSV"
            >
              📊 Export CSV
            </button>
            <button 
              className="btn-outline"
              onClick={handleExportPDF}
              title="Export to PDF"
            >
              📄 Export PDF
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedAssets.size > 0 && (
            <div className="bulk-actions">
              <button 
                className="btn-bulk"
                onClick={() => setShowBulkActions(!showBulkActions)}
                disabled={bulkLoading}
              >
                ⚡ Bulk Actions ({selectedAssets.size})
              </button>
              {showBulkActions && (
                <div className="bulk-menu">
                  <button onClick={() => handleBulkStatusChange('AVAILABLE')}>Mark Available</button>
                  <button onClick={() => handleBulkStatusChange('IN_MAINTENANCE')}>Send to Maintenance</button>
                  <button onClick={() => handleBulkStatusChange('RETIRED')}>Retire Assets</button>
                </div>
              )}
            </div>
          )}

          <button 
            className="btn-primary" 
            onClick={() => navigate('/app/assets/new')}
          >
            ➕ Add New Asset
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="asset-tabs">
        {statusOptions.map(opt => (
          <button
            key={opt.value}
            className={`asset-tab ${statusFilter === opt.value ? 'active' : ''}`}
            onClick={() => handleStatusChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="asset-filters">
        <div className="filter-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search assets by name, tag, brand, or model..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          
          <div className="status-filter">
            <label htmlFor="status-select">Filter by Status:</label>
            <select
              id="status-select"
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="status-select"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {assets.length > 0 && (
          <div className="selection-controls">
            <label className="select-all-checkbox">
              <input
                type="checkbox"
                checked={selectedAssets.size === assets.length && assets.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              <span>Select All ({assets.length})</span>
            </label>
          </div>
        )}
      </div>

      {/* Asset Grid */}
      {assets.length === 0 ? (
        <div className="no-assets">
          <p>No assets found.</p>
          {searchTerm && (
            <p>
              Try adjusting your search terms or{' '}
              <button 
                onClick={() => setSearchTerm('')} 
                className="link-button"
              >
                clear search
              </button>
            </p>
          )}
        </div>
      ) : (
        <div className="asset-grid">
          {assets.map(asset => (
            <AssetCard 
              key={asset.id} 
              asset={asset} 
              onUpdate={handleAssetUpdate}
              selectable={true}
              selected={selectedAssets.has(asset.id)}
              onSelect={(selected) => handleSelectAsset(asset.id, selected)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="page-button"
          >
            Previous
          </button>
          
          <span className="page-info">
            Page {currentPage + 1} of {totalPages}
          </span>
          
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="page-button"
          >
            Next
          </button>
        </div>
      )}

      {/* Create Asset Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AssetForm 
              onSubmit={handleCreateAsset}
              onCancel={handleCancelCreate}
            />
          </div>
        </div>
      )}
    </div>
  );
};
