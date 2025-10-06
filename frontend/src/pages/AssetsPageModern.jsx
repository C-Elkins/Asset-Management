import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Laptop, Search, Filter, Download, Upload, Plus, 
  RefreshCw, Grid, List, ChevronLeft, ChevronRight,
  Package, CheckCircle, AlertCircle, Settings, Trash2,
  Edit, Eye, MoreVertical
} from 'lucide-react';
import { assetService } from '../services/assetService.js';
import { exportService } from '../services/exportService.js';
import { AssetCard } from '../components/assets/AssetCard.jsx';
import { AssetForm } from '../components/assets/AssetForm.jsx';

export const AssetsPageModern = () => {
  const navigate = useNavigate();
  
  // State management
  const [assets, setAssets] = useState([]);
  const [allAssets, setAllAssets] = useState([]);
    const { terminology } = useCustomization();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Status options
  const statusOptions = [
    { value: 'ALL', label: 'All Assets', color: 'slate', count: 0 },
    { value: 'AVAILABLE', label: 'Available', color: 'emerald', count: 0 },
    { value: 'ASSIGNED', label: 'Assigned', color: 'blue', count: 0 },
    { value: 'IN_MAINTENANCE', label: 'In Maintenance', color: 'amber', count: 0 },
    { value: 'RETIRED', label: 'Retired', color: 'gray', count: 0 },
    { value: 'LOST', label: 'Lost', color: 'red', count: 0 },
    { value: 'DAMAGED', label: 'Damaged', color: 'orange', count: 0 }
  ];

  // Calculate metrics from assets
  const metrics = {
    total: allAssets.length,
    available: allAssets.filter(a => a.status === 'AVAILABLE').length,
    assigned: allAssets.filter(a => a.status === 'ASSIGNED').length,
    maintenance: allAssets.filter(a => a.status === 'IN_MAINTENANCE').length,
    value: allAssets.reduce((sum, a) => sum + (parseFloat(a.purchasePrice) || 0), 0)
  };

  // Fetch assets
  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      const params = { page: currentPage, size: 12 };

      if (searchTerm) {
        response = await assetService.search(searchTerm, params);
      } else if (statusFilter && statusFilter !== 'ALL') {
        response = await assetService.getByStatus(statusFilter, params);
      } else {
        response = await assetService.list(params);
      }

      if (response.content) {
        setAssets(response.content);
        setTotalPages(response.totalPages);
      } else if (Array.isArray(response)) {
        setAssets(response);
        setTotalPages(1);
      } else {
        setAssets([]);
        setTotalPages(0);
      }

      // Fetch all assets for metrics
      if (currentPage === 0) {
        try {
          const allResponse = await assetService.list({ size: 1000 });
          const allData = Array.isArray(allResponse) ? allResponse : (allResponse.content || []);
          setAllAssets(allData);
        } catch (err) {
          console.warn('Could not fetch all assets:', err);
        }
      }
    } catch (err) {
      console.error('Failed to fetch assets:', err);
      
      // Check if it's a 403 Forbidden error (expired token)
      if (err.response?.status === 403) {
        setError('Your session has expired. Please log out and log back in to continue.');
      } else {
        setError('Failed to load assets. Please try again.');
      }
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm]);

  useEffect(() => {
    fetchAssets();
  }, [currentPage, statusFilter, fetchAssets]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(0);
      fetchAssets();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleStatusChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(0);
    setSearchTerm('');
  };

  const handleExportCSV = () => {
    const assetsToExport = searchTerm || statusFilter !== 'ALL' ? assets : allAssets;
    exportService.exportToCSV(assetsToExport, 'assets-export');
  };

  const handleExportPDF = () => {
    const assetsToExport = searchTerm || statusFilter !== 'ALL' ? assets : allAssets;
    exportService.exportToPDF(assetsToExport, 'assets-report');
  };

  return (
    <div className="assets-page-modern">
      {/* Hero Section */}
      <motion.div 
        className="assets-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="assets-hero-content">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Asset Management</h1>
              <p className="text-sm text-slate-600">Track, manage, and optimize your organization's assets</p>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="assets-metrics-grid">
          <motion.div className="metric-card" whileHover={{ y: -4 }}>
            <div className="metric-icon bg-gradient-to-br from-blue-500 to-blue-600">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="metric-content">
              <p className="metric-label">Total Assets</p>
              <p className="metric-value">{metrics.total}</p>
            </div>
          </motion.div>

          <motion.div className="metric-card" whileHover={{ y: -4 }}>
            <div className="metric-icon bg-gradient-to-br from-emerald-500 to-emerald-600">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div className="metric-content">
              <p className="metric-label">Available</p>
              <p className="metric-value">{metrics.available}</p>
            </div>
          </motion.div>

          <motion.div className="metric-card" whileHover={{ y: -4 }}>
            <div className="metric-icon bg-gradient-to-br from-purple-500 to-purple-600">
              <Laptop className="w-5 h-5 text-white" />
            </div>
            <div className="metric-content">
              <p className="metric-label">Assigned</p>
              <p className="metric-value">{metrics.assigned}</p>
            </div>
          </motion.div>

          <motion.div className="metric-card" whileHover={{ y: -4 }}>
            <div className="metric-icon bg-gradient-to-br from-amber-500 to-amber-600">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div className="metric-content">
              <p className="metric-label">In Maintenance</p>
              <p className="metric-value">{metrics.maintenance}</p>
            </div>
          </motion.div>

          <motion.div className="metric-card metric-card-wide" whileHover={{ y: -4 }}>
            <div className="metric-icon bg-gradient-to-br from-cyan-500 to-cyan-600">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="metric-content">
              <p className="metric-label">Total Value</p>
              <p className="metric-value">${metrics.value.toLocaleString()}</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Filters and Actions Bar */}
      <motion.div 
        className="assets-toolbar"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Search */}
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder={`Search ${(terminology.assets || 'assets').toLowerCase()} by name, serial number, or tag...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Actions */}
        <div className="toolbar-actions">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`toolbar-btn ${showFilters ? 'toolbar-btn-active' : ''}`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden md:inline">Filters</span>
          </button>

          <div className="toolbar-divider" />

          <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="toolbar-btn">
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </button>

          <button onClick={fetchAssets} className="toolbar-btn">
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="toolbar-divider" />

          <button onClick={handleExportCSV} className="toolbar-btn">
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Export</span>
          </button>

          <button 
            onClick={() => setShowCreateForm(true)} 
            className="toolbar-btn toolbar-btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Add Asset</span>
          </button>
        </div>
      </motion.div>

      {/* Status Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            className="status-filters"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`status-filter-btn status-filter-${option.color} ${statusFilter === option.value ? 'active' : ''}`}
              >
                {option.label}
                {statusFilter === option.value && <CheckCircle className="w-4 h-4 ml-2" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Asset Grid/List */}
      {loading ? (
        <div className="assets-loading">
          <div className="spinner"></div>
          <p>Loading assets...</p>
        </div>
      ) : error ? (
        <div className="assets-error">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-lg font-semibold text-slate-900 mb-2">{error}</p>
          {error.includes('session has expired') ? (
            <button 
              onClick={() => { 
                localStorage.removeItem('token'); 
                window.location.href = '/login'; 
              }} 
              className="retry-btn"
            >
              Log Out & Sign In Again
            </button>
          ) : (
            <button onClick={fetchAssets} className="retry-btn">
              Try Again
            </button>
          )}
        </div>
      ) : assets.length === 0 ? (
        <div className="assets-empty">
          <Package className="w-16 h-16 text-slate-300 mb-4" />
          <p className="text-lg font-semibold text-slate-900 mb-2">No {terminology.assets || 'assets'} found</p>
          <p className="text-sm text-slate-600 mb-4">
            {searchTerm || statusFilter !== 'ALL' 
              ? 'Try adjusting your filters or search term' 
              : 'Get started by adding your first asset'}
          </p>
          {!searchTerm && statusFilter === 'ALL' && (
            <button onClick={() => setShowCreateForm(true)} className="add-first-asset-btn">
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Asset
            </button>
          )}
        </div>
      ) : (
        <>
          <motion.div 
            className={viewMode === 'grid' ? 'assets-grid' : 'assets-list'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {assets.map((asset, index) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AssetCard 
                  asset={asset} 
                  viewMode={viewMode}
                  onUpdate={fetchAssets}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="assets-pagination">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="pagination-btn"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="pagination-info">
                Page {currentPage + 1} of {totalPages}
              </span>
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1}
                className="pagination-btn"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Asset Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <AssetForm 
                onSave={() => { setShowCreateForm(false); fetchAssets(); }}
                onCancel={() => setShowCreateForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
