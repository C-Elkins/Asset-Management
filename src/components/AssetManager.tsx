import React, { useState, useEffect, useRef } from 'react';
import { Asset, AssetInput, Category, AssetFilters, CustomFieldDefinition } from '../types/api';
import { Search, Plus, Download, Trash2, Edit, X, Upload, QrCode, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { CSVImport } from './CSVImport';
import { InventoryTransactionManager } from './InventoryTransactionManager';
import QRCode from 'qrcode';

interface AssetManagerProps {
  categories: Category[];
  onAssetChange?: () => void;
}

export const AssetManager: React.FC<AssetManagerProps> = ({ categories, onAssetChange }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [qrAsset, setQrAsset] = useState<Asset | null>(null);
  const [templates, setTemplates] = useState<AssetInput[]>([]);
  const [showInventoryTransaction, setShowInventoryTransaction] = useState(false);
  const [transactionAsset, setTransactionAsset] = useState<Asset | null>(null);
  const [transactionType, setTransactionType] = useState<'receive' | 'adjustment' | 'writeoff'>('receive');

  // Filters
  const [searchInput, setSearchInput] = useState(''); // User's typed input
  const [searchQuery, setSearchQuery] = useState(''); // Debounced search value
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [locations, setLocations] = useState<string[]>([]);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });

  // Sort state
  const [sortConfig, setSortConfig] = useState({
    sortBy: 'created_at' as string,
    sortOrder: 'DESC' as 'ASC' | 'DESC',
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load assets when filters or pagination changes
  useEffect(() => {
    loadAssets();
  }, [categoryFilter, statusFilter, locationFilter, searchQuery, pagination.page, pagination.pageSize, sortConfig]);

  // Load locations on mount
  useEffect(() => {
    loadLocations();
  }, []);

  // Load templates from localStorage
  useEffect(() => {
    try {
      const savedTemplates = localStorage.getItem('assetTemplates');
      if (savedTemplates) {
        setTemplates(JSON.parse(savedTemplates));
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

      // Ctrl+N: New asset
      if (e.ctrlKey && e.key === 'n' && !isInput) {
        e.preventDefault();
        handleAddAsset();
      }

      // Ctrl+F: Focus search
      if (e.ctrlKey && e.key === 'f' && !isInput) {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="text"][placeholder*="Search"]')?.focus();
      }

      // Ctrl+A: Select all assets
      if (e.ctrlKey && e.key === 'a' && !isInput) {
        e.preventDefault();
        selectAll();
      }

      // Escape: Clear selection or close modal
      if (e.key === 'Escape') {
        if (showModal || showImport || showQRCode) {
          // Modals have their own escape handling
          return;
        }
        if (selectedIds.size > 0) {
          deselectAll();
        }
      }

      // Delete: Delete selected assets
      if (e.key === 'Delete' && !isInput && selectedIds.size > 0) {
        e.preventDefault();
        handleBulkDelete();
      }

      // Ctrl+E: Edit selected (when exactly one selected)
      if (e.ctrlKey && e.key === 'e' && !isInput && selectedIds.size === 1) {
        e.preventDefault();
        const asset = assets.find(a => selectedIds.has(a.id));
        if (asset) handleEditAsset(asset);
      }

      // Ctrl+D: Duplicate asset (when exactly one selected)
      if (e.ctrlKey && e.key === 'd' && !isInput && selectedIds.size === 1) {
        e.preventDefault();
        const asset = assets.find(a => selectedIds.has(a.id));
        if (asset) {
          // Create a copy without the ID and with a new asset tag
          const duplicate = { ...asset };
          delete (duplicate as any).id;
          duplicate.asset_tag = `${asset.asset_tag}-copy`;
          setEditingAsset(duplicate as Asset);
          setShowModal(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [assets, selectedIds, showModal, showImport, showQRCode]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const filters: AssetFilters = {};

      if (categoryFilter) filters.categoryId = categoryFilter as number;
      if (statusFilter) filters.status = statusFilter;
      if (locationFilter) filters.location = locationFilter;
      if (searchQuery) filters.searchQuery = searchQuery;

      const result = await window.api.getAssetsPaginated(
        filters,
        {
          page: pagination.page,
          pageSize: pagination.pageSize,
          sortBy: sortConfig.sortBy,
          sortOrder: sortConfig.sortOrder,
        }
      );

      setAssets(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLocations = async () => {
    try {
      const data = await window.api.getLocations();
      setLocations(data.map(l => l.location));
    } catch (error) {
      console.error('Failed to load locations:', error);
    }
  };

  const handleAddAsset = () => {
    setEditingAsset(null);
    setShowModal(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setShowModal(true);
  };

  const handleShowQRCode = (asset: Asset) => {
    setQrAsset(asset);
    setShowQRCode(true);
  };

  const handleInventoryTransaction = (asset: Asset, type: 'receive' | 'adjustment' | 'writeoff') => {
    setTransactionAsset(asset);
    setTransactionType(type);
    setShowInventoryTransaction(true);
  };

  const saveTemplate = (template: AssetInput & { templateName?: string }) => {
    const newTemplates = [...templates, template];
    setTemplates(newTemplates);
    localStorage.setItem('assetTemplates', JSON.stringify(newTemplates));
  };

  const deleteTemplate = (index: number) => {
    const newTemplates = templates.filter((_, i) => i !== index);
    setTemplates(newTemplates);
    localStorage.setItem('assetTemplates', JSON.stringify(newTemplates));
  };

  const handleCreateFromTemplate = (template: AssetInput) => {
    setEditingAsset(template as Asset);
    setShowModal(true);
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedIds.size === 0) return;

    try {
      await Promise.all(
        Array.from(selectedIds).map(async (id) => {
          const asset = assets.find(a => a.id === id);
          if (asset) {
            await window.api.updateAsset(id, { ...asset, status: newStatus as any });
          }
        })
      );
      setSelectedIds(new Set());
      await loadAssets();
      onAssetChange?.();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update asset status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      await window.api.deleteAsset(id);
      await loadAssets();
      onAssetChange?.();
    } catch (error) {
      console.error('Failed to delete asset:', error);
      alert('Failed to delete asset');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} assets?`)) return;

    try {
      await window.api.bulkDeleteAssets(Array.from(selectedIds));
      setSelectedIds(new Set());
      await loadAssets();
      onAssetChange?.();
    } catch (error) {
      console.error('Failed to bulk delete:', error);
      alert('Failed to delete assets');
    }
  };

  const handleExportCSV = () => {
    const exportAssets = selectedIds.size > 0
      ? assets.filter(a => selectedIds.has(a.id))
      : assets;

    const csv = [
      ['Asset Tag', 'Name', 'Category', 'Status', 'Location', 'Brand', 'Model', 'Serial Number', 'Purchase Price', 'Purchase Date'].join(','),
      ...exportAssets.map(a => [
        `"${a.asset_tag}"`,
        `"${a.name}"`,
        `"${a.category_name || ''}"`,
        `"${a.status}"`,
        `"${a.location || ''}"`,
        `"${a.brand || ''}"`,
        `"${a.model || ''}"`,
        `"${a.serial_number || ''}"`,
        a.purchase_price || '',
        `"${a.purchase_date || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assets-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSelection = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => setSelectedIds(new Set(assets.map(a => a.id)));
  const deselectAll = () => setSelectedIds(new Set());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSort = (column: string) => {
    setSortConfig(prev => ({
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC',
    }));
  };

  // Sortable Header Component
  const SortableHeader: React.FC<{ column: string; label: string }> = ({ column, label }) => {
    const isActive = sortConfig.sortBy === column;
    return (
      <th
        onClick={() => handleSort(column)}
        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
      >
        <div className="flex items-center gap-2">
          <span>{label}</span>
          {isActive && (
            <span className="text-emerald-600 font-bold">
              {sortConfig.sortOrder === 'ASC' ? '↑' : '↓'}
            </span>
          )}
        </div>
      </th>
    );
  };

  // Pagination Controls Component
  const PaginationControls: React.FC = () => (
    <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">
          Showing <span className="font-medium">{((pagination.page - 1) * pagination.pageSize) + 1}</span> to{' '}
          <span className="font-medium">{Math.min(pagination.page * pagination.pageSize, pagination.totalItems)}</span> of{' '}
          <span className="font-medium">{pagination.totalItems}</span> assets
        </span>

        <select
          value={pagination.pageSize}
          onChange={(e) => {
            setPagination({ ...pagination, page: 1, pageSize: parseInt(e.target.value) });
          }}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="25">25 per page</option>
          <option value="50">50 per page</option>
          <option value="100">100 per page</option>
          <option value="250">250 per page</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
          disabled={!pagination.hasPrevious}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">
            Page <span className="font-medium">{pagination.page}</span> of{' '}
            <span className="font-medium">{pagination.totalPages || 1}</span>
          </span>

          <input
            type="number"
            min="1"
            max={pagination.totalPages || 1}
            value={pagination.page}
            onChange={(e) => {
              const newPage = parseInt(e.target.value);
              if (newPage >= 1 && newPage <= pagination.totalPages) {
                setPagination({ ...pagination, page: newPage });
              }
            }}
            className="w-16 px-2 py-1.5 border border-gray-300 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Go to"
          />
        </div>

        <button
          onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
          disabled={!pagination.hasNext}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <Download size={18} />
            Export
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <Upload size={18} />
            Import
          </button>
          {templates.length > 0 && (
            <button
              onClick={() => setShowTemplates(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            >
              <Plus size={18} />
              From Template
            </button>
          )}
          <button
            onClick={handleAddAsset}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            <Plus size={18} />
            Add Asset
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value ? Number(e.target.value) : '')}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="assigned">Assigned</option>
          <option value="maintenance">Maintenance</option>
          <option value="retired">Retired</option>
        </select>

        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All Locations</option>
          {locations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        {(categoryFilter || statusFilter || locationFilter || searchQuery) && (
          <button
            onClick={() => {
              setCategoryFilter('');
              setStatusFilter('');
              setLocationFilter('');
              setSearchQuery('');
            }}
            className="px-3 py-2 text-gray-600 hover:text-gray-900"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium text-emerald-900">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={deselectAll}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
            >
              Deselect All
            </button>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkStatusUpdate(e.target.value);
                  e.target.value = '';
                }
              }}
              className="px-3 py-1 text-sm border border-emerald-300 rounded bg-white text-gray-700 hover:bg-gray-50"
            >
              <option value="">Set Status...</option>
              <option value="available">Available</option>
              <option value="assigned">Assigned</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </select>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              <Trash2 size={14} />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={assets.length > 0 && selectedIds.size === assets.length}
                    onChange={(e) => e.target.checked ? selectAll() : deselectAll()}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <SortableHeader column="asset_tag" label="Asset Tag" />
                <SortableHeader column="name" label="Name" />
                <SortableHeader column="category_id" label="Category" />
                <SortableHeader column="status" label="Status" />
                <SortableHeader column="location" label="Location" />
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Loading assets...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No assets found. Add your first asset to get started!
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr
                    key={asset.id}
                    className={`hover:bg-gray-50 ${selectedIds.has(asset.id) ? 'bg-emerald-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(asset.id)}
                        onChange={() => toggleSelection(asset.id)}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{asset.asset_tag}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{asset.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{asset.category_name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{asset.location || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleShowQRCode(asset)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Show QR Code"
                        >
                          <QrCode size={16} />
                        </button>
                        {asset.is_tracked_inventory === 1 && (
                          <>
                            <button
                              onClick={() => handleInventoryTransaction(asset, 'receive')}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Receive Shipment"
                            >
                              <Package size={16} />
                            </button>
                            <button
                              onClick={() => handleInventoryTransaction(asset, 'adjustment')}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Adjust Inventory"
                            >
                              <TrendingUp size={16} />
                            </button>
                            <button
                              onClick={() => handleInventoryTransaction(asset, 'writeoff')}
                              className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                              title="Write-Off"
                            >
                              <TrendingDown size={16} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleEditAsset(asset)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pagination.totalItems > 0 && <PaginationControls />}

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              {selectedIds.size > 0 && `${selectedIds.size} selected`}
            </div>
            <div className="text-xs text-gray-500 hidden md:block">
              <span className="font-medium">Shortcuts:</span> Ctrl+N: New • Ctrl+F: Search • Ctrl+A: Select All • Ctrl+E: Edit • Ctrl+D: Duplicate • Del: Delete
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <AssetModal
          asset={editingAsset}
          categories={categories}
          onClose={() => {
            setShowModal(false);
            setEditingAsset(null);
          }}
          onSave={async () => {
            setShowModal(false);
            setEditingAsset(null);
            await loadAssets();
            onAssetChange?.();
          }}
          onSaveTemplate={saveTemplate}
        />
      )}

      {/* CSV Import Modal */}
      {showImport && (
        <CSVImport
          categories={categories}
          onClose={() => setShowImport(false)}
          onImportComplete={async () => {
            await loadAssets();
            onAssetChange?.();
          }}
        />
      )}

      {/* QR Code Modal */}
      {showQRCode && qrAsset && (
        <QRCodeModal
          asset={qrAsset}
          onClose={() => {
            setShowQRCode(false);
            setQrAsset(null);
          }}
        />
      )}

      {/* Template Selection Modal */}
      {showTemplates && (
        <TemplateModal
          templates={templates}
          categories={categories}
          onSelect={handleCreateFromTemplate}
          onDelete={deleteTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}

      {/* Inventory Transaction Manager */}
      {showInventoryTransaction && transactionAsset && (
        <InventoryTransactionManager
          isOpen={showInventoryTransaction}
          onClose={() => {
            setShowInventoryTransaction(false);
            setTransactionAsset(null);
          }}
          asset={transactionAsset}
          transactionType={transactionType}
          onComplete={async () => {
            await loadAssets();
            onAssetChange?.();
          }}
        />
      )}
    </div>
  );
};

// Asset Add/Edit Modal Component
interface AssetModalProps {
  asset: Asset | null;
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
  onSaveTemplate?: (template: AssetInput & { templateName?: string }) => void;
}

const AssetModal: React.FC<AssetModalProps> = ({ asset, categories, onClose, onSave, onSaveTemplate }) => {
  const [formData, setFormData] = useState<AssetInput>({
    asset_tag: asset?.asset_tag || '',
    name: asset?.name || '',
    description: asset?.description || '',
    category_id: asset?.category_id || (categories[0]?.id || 0),
    brand: asset?.brand || '',
    model: asset?.model || '',
    serial_number: asset?.serial_number || '',
    purchase_price: asset?.purchase_price || undefined,
    purchase_date: asset?.purchase_date || '',
    vendor: asset?.vendor || '',
    location: asset?.location || '',
    status: asset?.status || 'available',
    condition: asset?.condition || 'good',
    notes: asset?.notes || '',
    is_tracked_inventory: asset?.is_tracked_inventory || 0,
    total_quantity: asset?.total_quantity || 1,
    available_quantity: asset?.available_quantity || 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [customFieldDefinitions, setCustomFieldDefinitions] = useState<CustomFieldDefinition[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});

  // Load custom field definitions when category changes
  useEffect(() => {
    const loadCustomFields = async () => {
      if (formData.category_id) {
        try {
          const fields = await window.api.getCustomFields(formData.category_id);
          setCustomFieldDefinitions(fields);

          // Clear custom field values when category changes (but not on initial load)
          if (!asset) {
            setCustomFieldValues({});
          }
        } catch (error) {
          console.error('Failed to load custom fields:', error);
          setCustomFieldDefinitions([]);
        }
      }
    };
    loadCustomFields();
  }, [formData.category_id]);

  // Initialize custom field values from asset when editing
  useEffect(() => {
    if (asset?.custom_fields) {
      try {
        const parsedFields = typeof asset.custom_fields === 'string'
          ? JSON.parse(asset.custom_fields)
          : asset.custom_fields;
        setCustomFieldValues(parsedFields || {});
      } catch (error) {
        console.error('Failed to parse custom fields:', error);
        setCustomFieldValues({});
      }
    }
  }, [asset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Include custom field values in the form data
      const dataToSave = {
        ...formData,
        custom_fields: Object.keys(customFieldValues).length > 0 ? customFieldValues : undefined
      };

      if (asset) {
        await window.api.updateAsset(asset.id, dataToSave);
      } else {
        await window.api.createAsset(dataToSave);
      }
      onSave();
    } catch (error) {
      console.error('Failed to save asset:', error);
      alert('Failed to save asset');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsTemplate = () => {
    const templateName = prompt('Enter template name:');
    if (!templateName) return;

    const category = categories.find(c => c.id === formData.category_id);
    onSaveTemplate?.({
      ...formData,
      templateName: `${templateName} (${category?.name || 'Unknown'})`,
    });
    alert('Template saved successfully!');
  };

  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const renderCustomField = (field: CustomFieldDefinition) => {
    const value = customFieldValues[field.field_name] ?? '';

    switch (field.field_type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
            required={field.required === 1}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
            required={field.required === 1}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
            required={field.required === 1}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
            required={field.required === 1}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        );

      case 'dropdown': {
        const options = field.options ? field.options.split(',') : [];
        return (
          <select
            value={value}
            onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
            required={field.required === 1}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Select...</option>
            {options.map(option => (
              <option key={option.trim()} value={option.trim()}>
                {option.trim()}
              </option>
            ))}
          </select>
        );
      }

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value === true || value === 'true' || value === 1}
              onChange={(e) => handleCustomFieldChange(field.field_name, e.target.checked)}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="ml-2 text-sm text-gray-600">
              {field.required === 1 ? 'Required' : 'Optional'}
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {asset ? 'Edit Asset' : 'Add New Asset'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asset Tag *</label>
              <input
                type="text"
                required
                value={formData.asset_tag}
                onChange={(e) => setFormData({ ...formData, asset_tag: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
            </div>

            {/* Quantity Tracking */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <input
                  type="checkbox"
                  id="track-inventory"
                  checked={formData.is_tracked_inventory === 1}
                  onChange={(e) => setFormData({
                    ...formData,
                    is_tracked_inventory: e.target.checked ? 1 : 0,
                    total_quantity: e.target.checked ? formData.total_quantity : 1,
                    available_quantity: e.target.checked ? formData.available_quantity : 1,
                  })}
                  disabled={!!asset}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="track-inventory" className="text-sm font-medium text-gray-900 cursor-pointer">
                  Track Individual Items (Quantity Tracking)
                </label>
              </div>
              {asset && asset.is_tracked_inventory === 1 && (
                <p className="text-xs text-gray-500 mb-2">
                  Note: Inventory tracking mode cannot be changed after creation. Manage individual items below.
                </p>
              )}
            </div>

            {formData.is_tracked_inventory === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Quantity {!asset && '*'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.total_quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setFormData({
                        ...formData,
                        total_quantity: value,
                        available_quantity: asset ? formData.available_quantity : value
                      });
                    }}
                    disabled={!!asset}
                    required={!asset}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                  />
                  {asset && (
                    <p className="text-xs text-gray-500 mt-1">
                      Cannot be changed after creation
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formData.total_quantity}
                    value={formData.available_quantity}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-updated based on checkouts/returns
                  </p>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
              <input
                type="text"
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.purchase_price || ''}
                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
              <input
                type="text"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Custom Fields Section */}
            {customFieldDefinitions.length > 0 && (
              <div className="md:col-span-2 pt-4 border-t border-gray-200">
                <h3 className="text-md font-semibold text-gray-900 mb-4">
                  Category-Specific Fields
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customFieldDefinitions.map((field) => (
                    <div key={field.id} className={field.field_type === 'textarea' ? 'md:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.field_label}
                        {field.required === 1 && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {renderCustomField(field)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-between items-center">
            {onSaveTemplate && !asset && (
              <button
                type="button"
                onClick={handleSaveAsTemplate}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
              >
                Save as Template
              </button>
            )}
            <div className={`flex gap-3 ${onSaveTemplate && !asset ? '' : 'ml-auto'}`}>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : asset ? 'Update Asset' : 'Create Asset'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// QR Code Modal Component
interface QRCodeModalProps {
  asset: Asset;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ asset, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQRCode();
  }, [asset]);

  const generateQRCode = async () => {
    try {
      // Create asset data string for QR code
      const assetData = JSON.stringify({
        id: asset.id,
        asset_tag: asset.asset_tag,
        name: asset.name,
        category: asset.category_name,
        serial_number: asset.serial_number,
      });

      // Generate QR code
      const dataUrl = await QRCode.toDataURL(assetData, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      setQrDataUrl(dataUrl);

      // Also draw to canvas for download
      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, assetData, {
          width: 400,
          margin: 2,
        });
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${asset.asset_tag}-qrcode.png`;
    link.click();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - ${asset.asset_tag}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 20px;
              font-family: Arial, sans-serif;
            }
            h2 { margin: 0 0 10px 0; }
            p { margin: 5px 0; color: #666; }
            img { margin: 20px 0; border: 2px solid #000; }
          </style>
        </head>
        <body>
          <h2>${asset.name}</h2>
          <p><strong>Asset Tag:</strong> ${asset.asset_tag}</p>
          <p><strong>Serial Number:</strong> ${asset.serial_number || 'N/A'}</p>
          <img src="${qrDataUrl}" alt="QR Code" />
          <p style="font-size: 12px; margin-top: 20px;">Scan this code to view asset details</p>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Asset QR Code</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Asset Info */}
          <div className="mb-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Tag:</span> {asset.asset_tag}
            </p>
            {asset.serial_number && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">SN:</span> {asset.serial_number}
              </p>
            )}
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-6">
            {qrDataUrl ? (
              <div className="border-4 border-gray-200 rounded-lg p-2 bg-white">
                <img src={qrDataUrl} alt="QR Code" className="w-64 h-64" />
              </div>
            ) : (
              <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-gray-500">Generating QR code...</p>
              </div>
            )}
          </div>

          {/* Hidden canvas for download */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Info */}
          <p className="text-xs text-gray-500 text-center mb-6">
            Scan this code to quickly access asset information
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Download
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Print
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Template Selection Modal
interface TemplateModalProps {
  templates: (AssetInput & { templateName?: string })[];
  categories: Category[];
  onSelect: (template: AssetInput) => void;
  onDelete: (index: number) => void;
  onClose: () => void;
}

const TemplateModal: React.FC<TemplateModalProps> = ({ templates, categories, onSelect, onDelete, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Asset Templates</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-130px)]">
          {templates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">No templates saved yet</p>
              <p className="text-sm">Create a new asset and click "Save as Template" to save it for quick reuse</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template, index) => {
                const category = categories.find(c => c.id === template.category_id);
                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {template.templateName || template.name}
                        </h3>
                        <p className="text-sm text-gray-500">{category?.name || 'Unknown Category'}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this template?')) {
                            onDelete(index);
                          }
                        }}
                        className="text-red-600 hover:bg-red-50 rounded p-1"
                        title="Delete template"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600 mb-4">
                      {template.brand && <p><span className="font-medium">Brand:</span> {template.brand}</p>}
                      {template.model && <p><span className="font-medium">Model:</span> {template.model}</p>}
                      {template.location && <p><span className="font-medium">Location:</span> {template.location}</p>}
                      {template.status && <p><span className="font-medium">Status:</span> {template.status}</p>}
                    </div>

                    <button
                      onClick={() => {
                        onSelect(template);
                        onClose();
                      }}
                      className="w-full px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm"
                    >
                      Use Template
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
