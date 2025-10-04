import React, { useState, useEffect, useCallback } from 'react';
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
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);
  const [catImporting, setCatImporting] = useState(false);
  const [catImportSummary, setCatImportSummary] = useState(null);

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

  const fetchAssets = useCallback(async () => {
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
  }, [currentPage, statusFilter, searchTerm]);



  // Fetch assets when dependencies change
  useEffect(() => {
    fetchAssets();
  }, [currentPage, statusFilter, fetchAssets]);

  // Handle search with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(0); // Reset to first page on search
      fetchAssets();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, fetchAssets]);

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

  const handleCreateAsset = (_newAsset) => {
    // Close the form and refresh the list
    setShowCreateForm(false);
    fetchAssets();
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
  };

  // Export handlers
  const handleExportCSV = useCallback(() => {
    const assetsToExport = searchTerm || statusFilter !== 'ALL' ? assets : allAssets;
    exportService.exportToCSV(assetsToExport, 'assets-export');
  }, [searchTerm, statusFilter, assets, allAssets]);

  const handleExportPDF = useCallback(() => {
    const assetsToExport = searchTerm || statusFilter !== 'ALL' ? assets : allAssets;
    exportService.exportToPDF(assetsToExport, 'assets-report');
  }, [searchTerm, statusFilter, assets, allAssets]);

  // Import handlers
  const handleImportClick = () => {
    const input = document.getElementById('assetImportInput');
    if (input) input.click();
  };

  const handleCategoryImportClick = () => {
    const input = document.getElementById('categoryImportInput');
    if (input) input.click();
  };

  const handleImportFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const records = Array.isArray(json) ? json : (Array.isArray(json.assets) ? json.assets : []);
      if (!Array.isArray(records) || records.length === 0) {
        alert('No assets found in file. Expecting a JSON array of asset objects or { "assets": [...] }');
        return;
      }
      if (!window.confirm(`Import ${records.length} assets?`)) return;
      setImporting(true);
      // Prefer bulk endpoint when available
      try {
        const resp = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}/imports/assets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt_token') || ''}`
          },
          body: JSON.stringify({ assets: records })
        });
        if (!resp.ok) throw new Error(`Bulk import failed with status ${resp.status}`);
        const summary = await resp.json();
        setImportSummary({ total: summary.received, success: summary.created + summary.updated, failed: summary.failed, errors: (summary.errors || []).slice(0, 5) });
      } catch (bulkErr) {
        console.warn('Bulk import unavailable, falling back to per-record import', bulkErr);
        let success = 0, failed = 0;
        const errors = [];
        for (let i = 0; i < records.length; i++) {
          const rec = records[i];
          try {
            await assetService.create(rec);
            success++;
          } catch (err) {
            failed++;
            errors.push({ index: i, message: err?.response?.data?.message || err?.message || 'Failed' });
          }
        }
        setImportSummary({ total: records.length, success, failed, errors: errors.slice(0, 5) });
      }
      await fetchAssets();
    } catch (err) {
      console.error('Import failed:', err);
      alert('Import failed: invalid JSON or read error.');
    } finally {
      setImporting(false);
    }
  };

  const handleCategoryImportFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const records = Array.isArray(json?.categories) ? json.categories : (Array.isArray(json) ? json : []);
      if (!Array.isArray(records) || records.length === 0) {
        alert('No categories found in file. Expecting { "categories": [...] } or a JSON array of categories.');
        return;
      }
      if (!window.confirm(`Import ${records.length} categories?`)) return;
      setCatImporting(true);
      const resp = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}/imports/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token') || ''}`
        },
        body: JSON.stringify({ categories: records })
      });
      if (!resp.ok) throw new Error(`Bulk import failed with status ${resp.status}`);
      const summary = await resp.json();
      setCatImportSummary({ total: summary.received, success: summary.created + summary.updated, failed: summary.failed, errors: (summary.errors || []).slice(0, 5) });
    } catch (err) {
      console.error('Category import failed:', err);
      alert('Category import failed. Check JSON format and permissions.');
    } finally {
      setCatImporting(false);
    }
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

  const handleSelectAll = useCallback((selected) => {
    if (selected) {
      setSelectedAssets(new Set(assets.map(a => a.id)));
    } else {
      setSelectedAssets(new Set());
    }
  }, [assets]);

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
  ]), [selectedAssets, showCreateForm, showShortcutsHelp, handleExportCSV, handleExportPDF, handleSelectAll, fetchAssets]);

  if (loading) {
    return (
      <div className="asset-list-container" style={{ padding: '1rem' }}>
        <div className="asset-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="asset-card">
              <div className="asset-card-header">
                <div style={{ width: '60%' }} className="skeleton" aria-hidden="true">&nbsp;</div>
                <div style={{ width: 24, height: 24, borderRadius: 4 }} className="skeleton" aria-hidden="true" />
              </div>
              <div className="asset-info">
                {Array.from({ length: 4 }).map((_, r) => (
                  <div key={r} className="asset-field">
                    <div style={{ width: 110 }} className="skeleton" aria-hidden="true">&nbsp;</div>
                    <div className="skeleton" style={{ height: 14, width: '100%' }} aria-hidden="true">&nbsp;</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
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
            <input id="assetImportInput" type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
            <input id="categoryImportInput" type="file" accept="application/json" className="hidden" onChange={handleCategoryImportFile} />
            <button 
              className="btn-outline"
              onClick={handleImportClick}
              disabled={importing}
              title="Import Assets from JSON"
            >
              📥 Import JSON{importing ? '…' : ''}
            </button>
            <a
              className="btn-outline"
              href="/examples/assets-template.json"
              download
              title="Download JSON template"
              style={{ textDecoration: 'none' }}
            >
              ⬇️ Template
            </a>
            <button 
              className="btn-outline"
              onClick={handleCategoryImportClick}
              disabled={catImporting}
              title="Import Categories from JSON"
            >
              📦 Import Categories{catImporting ? '…' : ''}
            </button>
            <a
              className="btn-outline"
              href="/examples/categories-template.json"
              download
              title="Download Categories template"
              style={{ textDecoration: 'none' }}
            >
              ⬇️ Categories Template
            </a>
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
            <button 
              className="btn-outline"
              onClick={async () => {
                try {
                  console.log('Testing backend API...');
                  const response = await fetch('http://localhost:8080/api/v1/assets');
                  if (response.ok) {
                    const data = await response.json();
                    alert(`✅ Backend Connected! Found ${data.length || 0} assets in database.`);
                  } else {
                    alert('⚠️ Backend responding but returned error: ' + response.status);
                  }
                } catch {
                  alert('❌ Backend connection failed. Make sure Spring Boot is running on port 8080.');
                }
              }}
              title="Test Backend Connection"
            >
              🔌 Test API
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

      {importSummary && (
        <div className="import-summary" style={{ margin: '10px 0', padding: '10px', border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <div><strong>Import Summary:</strong> {importSummary.success}/{importSummary.total} succeeded, {importSummary.failed} failed</div>
          {importSummary.errors && importSummary.errors.length > 0 && (
            <ul className="text-sm" style={{ marginTop: 6, color: '#6b7280' }}>
              {importSummary.errors.map((e, idx) => (
                <li key={idx}>Row {e.index + 1}: {e.message}</li>
              ))}
              {importSummary.failed > importSummary.errors.length && (
                <li>…and {importSummary.failed - importSummary.errors.length} more</li>
              )}
            </ul>
          )}
        </div>
      )}

      {catImportSummary && (
        <div className="import-summary" style={{ margin: '10px 0', padding: '10px', border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <div><strong>Categories Import Summary:</strong> {catImportSummary.success}/{catImportSummary.total} succeeded, {catImportSummary.failed} failed</div>
          {catImportSummary.errors && catImportSummary.errors.length > 0 && (
            <ul className="text-sm" style={{ marginTop: 6, color: '#6b7280' }}>
              {catImportSummary.errors.map((e, idx) => (
                <li key={idx}>Row {e.index + 1}: {e.message}</li>
              ))}
              {catImportSummary.failed > catImportSummary.errors.length && (
                <li>…and {catImportSummary.failed - catImportSummary.errors.length} more</li>
              )}
            </ul>
          )}
        </div>
      )}

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
