import React, { useState, useEffect, useRef } from 'react';
import { Asset, AssetInput, Category, AssetFilters, CustomFieldDefinition, User, Reservation, Lease, InsurancePolicy } from '../types/api';
import { Search, Plus, Download, Trash2, Edit, X, Upload, QrCode, Package, TrendingUp, TrendingDown, Camera, Eye, Calendar, Shield, FileText, MapPin, AlertTriangle, Grid, List, LayoutGrid, CalendarPlus, DollarSign } from 'lucide-react';
import { AssetIndicators } from './AssetIndicators';
import { CSVImport } from './CSVImport';
import { InventoryTransactionManager } from './InventoryTransactionManager';
import { AttachmentManager } from './AttachmentManager';
import { BarcodeManager } from './BarcodeManager';
import { BulkEditModal } from './BulkEditModal';
import { BulkAssignModal } from './BulkAssignModal';
import { showError, ErrorContext } from '../utils/errorHandler';
import { DepreciationInfo } from './DepreciationInfo';
import { DisposalInfo } from './DisposalInfo';
import { ReservationManager } from './ReservationManager';
import { LeaseManager } from './LeaseManager';
import { InsuranceManager } from './InsuranceManager';
import { LocationManager } from './LocationManager';
import { StockAlertManager } from './StockAlertManager';
import { ExportModal } from './ExportModal';
import QRCode from 'qrcode';

interface AssetManagerProps {
  categories: Category[];
  onAssetChange?: () => void;
  categoryFilter?: number | null;
  currentUser?: User | null;
}

export const AssetManager: React.FC<AssetManagerProps> = ({ categories, onAssetChange, categoryFilter, currentUser }) => {
  // Permission checks
  const canPerformActions = currentUser !== null;
  const canDelete = currentUser?.role === 'admin';
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
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewAsset, setQuickViewAsset] = useState<Asset | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [showReservations, setShowReservations] = useState(false);
  const [reservationAsset, setReservationAsset] = useState<Asset | null>(null);
  const [showLeases, setShowLeases] = useState(false);
  const [leaseAsset, setLeaseAsset] = useState<Asset | null>(null);
  const [showInsurance, setShowInsurance] = useState(false);
  const [insuranceAsset, setInsuranceAsset] = useState<Asset | null>(null);
  const [showLocations, setShowLocations] = useState(false);
  const [showStockAlerts, setShowStockAlerts] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // View mode
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // Quick View tab
  const [quickViewTab, setQuickViewTab] = useState<'overview' | 'details' | 'depreciation' | 'disposal' | 'reservations' | 'leases' | 'insurance' | 'attachments' | 'history'>('overview');

  // Quick View data
  const [quickViewReservations, setQuickViewReservations] = useState<Reservation[]>([]);
  const [quickViewLeases, setQuickViewLeases] = useState<Lease[]>([]);
  const [quickViewInsurance, setQuickViewInsurance] = useState<InsurancePolicy[]>([]);
  const [quickViewDataLoading, setQuickViewDataLoading] = useState(false);

  // Keyboard shortcuts help modal
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // Filters
  const [searchInput, setSearchInput] = useState(''); // User's typed input
  const [searchQuery, setSearchQuery] = useState(''); // Debounced search value
  const [localCategoryFilter, setLocalCategoryFilter] = useState<number | ''>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');

  // Advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [conditionFilter, setConditionFilter] = useState<string>('');
  const [brandFilter, setBrandFilter] = useState<string>('');
  const [modelFilter, setModelFilter] = useState<string>('');
  const [purchaseDateFrom, setPurchaseDateFrom] = useState<string>('');
  const [purchaseDateTo, setPurchaseDateTo] = useState<string>('');
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [warrantyExpiring, setWarrantyExpiring] = useState<boolean>(false);

  // Filter presets
  const [filterPresets, setFilterPresets] = useState<any[]>([]);
  const [showPresetSaveModal, setShowPresetSaveModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');

  // Use categoryFilter from prop if provided, otherwise use local state
  const effectiveCategoryFilter = categoryFilter || localCategoryFilter;
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
  }, [effectiveCategoryFilter, statusFilter, locationFilter, searchQuery, conditionFilter, brandFilter, modelFilter, purchaseDateFrom, purchaseDateTo, priceMin, priceMax, warrantyExpiring, pagination.page, pagination.pageSize, sortConfig]);

  // Load locations on mount
  useEffect(() => {
    loadLocations();
  }, []);

  // Load filter presets on mount
  useEffect(() => {
    loadPresets();
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

  // Load quick view data when tab changes
  useEffect(() => {
    const loadQuickViewData = async () => {
      if (!quickViewAsset) return;

      setQuickViewDataLoading(true);
      try {
        if (quickViewTab === 'reservations') {
          const reservations = await window.api.getReservations();
          setQuickViewReservations(reservations.filter(r => r.asset_id === quickViewAsset.id));
        } else if (quickViewTab === 'leases') {
          const leases = await window.api.getLeases();
          setQuickViewLeases(leases.filter(l => l.asset_id === quickViewAsset.id));
        } else if (quickViewTab === 'insurance') {
          const insurance = await window.api.getInsurancePolicies();
          setQuickViewInsurance(insurance.filter(i => i.asset_id === quickViewAsset.id));
        }
      } catch (error) {
        console.error('Failed to load quick view data:', error);
      } finally {
        setQuickViewDataLoading(false);
      }
    };

    loadQuickViewData();
  }, [quickViewTab, quickViewAsset]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

      // F1 or Ctrl+?: Show keyboard shortcuts help
      if (e.key === 'F1' || (e.ctrlKey && e.key === '?')) {
        e.preventDefault();
        setShowShortcutsHelp(true);
      }

      // /: Quick focus search (like GitHub)
      if (e.key === '/' && !isInput) {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="text"][placeholder*="Search"]')?.focus();
      }

      // Ctrl+N: New asset
      if (e.ctrlKey && e.key === 'n' && !isInput && canPerformActions) {
        e.preventDefault();
        handleAddAsset();
      }

      // Ctrl+F: Focus search
      if (e.ctrlKey && e.key === 'f' && !isInput) {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="text"][placeholder*="Search"]')?.focus();
      }

      // Ctrl+I: Import CSV
      if (e.ctrlKey && e.key === 'i' && !isInput && canPerformActions) {
        e.preventDefault();
        setShowImport(true);
      }

      // Ctrl+X: Export CSV
      if (e.ctrlKey && e.key === 'x' && !isInput) {
        e.preventDefault();
        setShowExportModal(true);
      }

      // Ctrl+A: Select all assets
      if (e.ctrlKey && e.key === 'a' && !isInput) {
        e.preventDefault();
        selectAll();
      }

      // Ctrl+B: Bulk Edit (when assets are selected)
      if (e.ctrlKey && e.key === 'b' && !isInput && selectedIds.size > 0 && canPerformActions) {
        e.preventDefault();
        setShowBulkEdit(true);
      }

      // Escape: Clear selection or close modal or close help
      if (e.key === 'Escape') {
        if (showShortcutsHelp) {
          setShowShortcutsHelp(false);
          return;
        }
        if (showModal || showImport || showQRCode) {
          // Modals have their own escape handling
          return;
        }
        if (selectedIds.size > 0) {
          deselectAll();
        }
      }

      // Delete: Delete selected assets (admin only)
      if (e.key === 'Delete' && !isInput && selectedIds.size > 0 && canDelete) {
        e.preventDefault();
        handleBulkDelete();
      }

      // Ctrl+E: Edit selected (when exactly one selected)
      if (e.ctrlKey && e.key === 'e' && !isInput && selectedIds.size === 1 && canPerformActions) {
        e.preventDefault();
        const asset = assets.find(a => selectedIds.has(a.id));
        if (asset) handleEditAsset(asset);
      }

      // Ctrl+D: Duplicate asset (when exactly one selected)
      if (e.ctrlKey && e.key === 'd' && !isInput && selectedIds.size === 1 && canPerformActions) {
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

      // Ctrl+Q: Quick View (when exactly one selected)
      if (e.ctrlKey && e.key === 'q' && !isInput && selectedIds.size === 1) {
        e.preventDefault();
        const asset = assets.find(a => selectedIds.has(a.id));
        if (asset) {
          setQuickViewAsset(asset);
          setShowQuickView(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [assets, selectedIds, showModal, showImport, showQRCode, showShortcutsHelp, canPerformActions, canDelete]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const filters: AssetFilters = {};

      if (effectiveCategoryFilter) filters.categoryId = effectiveCategoryFilter as number;
      if (statusFilter) filters.status = statusFilter;
      if (locationFilter) filters.location = locationFilter;
      if (searchQuery) filters.searchQuery = searchQuery;

      // Advanced filters
      if (conditionFilter) filters.condition = conditionFilter;
      if (brandFilter) filters.brand = brandFilter;
      if (modelFilter) filters.model = modelFilter;
      if (purchaseDateFrom) filters.purchaseDateFrom = purchaseDateFrom;
      if (purchaseDateTo) filters.purchaseDateTo = purchaseDateTo;
      if (priceMin) filters.priceMin = parseFloat(priceMin);
      if (priceMax) filters.priceMax = parseFloat(priceMax);
      if (warrantyExpiring) filters.warrantyExpiring = true;

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
      setLocations(data.map(l => l.name));
    } catch (error) {
      console.error('Failed to load locations:', error);
    }
  };

  const loadPresets = async () => {
    try {
      const data = await window.api.getFilterPresets();
      setFilterPresets(data);
    } catch (error) {
      console.error('Failed to load filter presets:', error);
    }
  };

  const hasActiveFilters = () => {
    return !!(effectiveCategoryFilter || statusFilter || locationFilter || searchQuery ||
      conditionFilter || brandFilter || modelFilter || purchaseDateFrom ||
      purchaseDateTo || priceMin || priceMax || warrantyExpiring);
  };

  const saveCurrentFiltersAsPreset = async () => {
    if (!presetName.trim()) {
      alert('Please enter a name for this preset');
      return;
    }

    if (!hasActiveFilters()) {
      alert('No active filters to save');
      return;
    }

    try {
      const filters = {
        categoryId: effectiveCategoryFilter || undefined,
        status: statusFilter || undefined,
        location: locationFilter || undefined,
        searchQuery: searchQuery || undefined,
        condition: conditionFilter || undefined,
        brand: brandFilter || undefined,
        model: modelFilter || undefined,
        purchaseDateFrom: purchaseDateFrom || undefined,
        purchaseDateTo: purchaseDateTo || undefined,
        priceMin: priceMin || undefined,
        priceMax: priceMax || undefined,
        warrantyExpiring: warrantyExpiring || undefined,
      };

      await window.api.saveFilterPreset({
        name: presetName,
        description: presetDescription || undefined,
        filters,
      });

      setPresetName('');
      setPresetDescription('');
      setShowPresetSaveModal(false);
      await loadPresets();
    } catch (error) {
      console.error('Failed to save filter preset:', error);
      alert('Failed to save filter preset');
    }
  };

  const loadPreset = async (presetId: number) => {
    try {
      const preset = await window.api.getFilterPreset(presetId);
      if (!preset) return;

      const filters = typeof preset.filters === 'string'
        ? JSON.parse(preset.filters)
        : preset.filters;

      // Apply all filters from the preset
      setLocalCategoryFilter(filters.categoryId || '');
      setStatusFilter(filters.status || '');
      setLocationFilter(filters.location || '');
      setSearchInput(filters.searchQuery || '');
      setSearchQuery(filters.searchQuery || '');
      setConditionFilter(filters.condition || '');
      setBrandFilter(filters.brand || '');
      setModelFilter(filters.model || '');
      setPurchaseDateFrom(filters.purchaseDateFrom || '');
      setPurchaseDateTo(filters.purchaseDateTo || '');
      setPriceMin(filters.priceMin || '');
      setPriceMax(filters.priceMax || '');
      setWarrantyExpiring(filters.warrantyExpiring || false);

      // Record usage
      await window.api.recordPresetUsage(presetId);
      await loadPresets();
    } catch (error) {
      console.error('Failed to load filter preset:', error);
      alert('Failed to load filter preset');
    }
  };

  const deletePreset = async (presetId: number) => {
    if (!confirm('Delete this filter preset?')) return;

    try {
      await window.api.deleteFilterPreset(presetId);
      await loadPresets();
    } catch (error) {
      console.error('Failed to delete filter preset:', error);
      alert('Failed to delete filter preset');
    }
  };

  const togglePresetFavorite = async (presetId: number) => {
    try {
      await window.api.togglePresetFavorite(presetId);
      await loadPresets();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
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
      showError(error, ErrorContext.DELETE_ASSET);
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
      showError(error, ErrorContext.DELETE_ASSET);
    }
  };

  const handleBulkUpdate = async (updates: any) => {
    if (selectedIds.size === 0) return;

    try {
      await (window.api as any).bulkUpdateAssets(Array.from(selectedIds), updates);
      setSelectedIds(new Set());
      await loadAssets();
      onAssetChange?.();
    } catch (error: any) {
      console.error('Failed to bulk update:', error);
      throw error;
    }
  };

  const handleBulkAssign = async (assignment: any) => {
    if (selectedIds.size === 0) return;

    try {
      // Create assignment for each selected asset
      for (const assetId of Array.from(selectedIds)) {
        await window.api.createAssignment({
          asset_id: assetId,
          assigned_to: assignment.assigned_to,
          assigned_by: assignment.assigned_by,
          checkout_notes: assignment.checkout_notes,
        });
      }
      setSelectedIds(new Set());
      await loadAssets();
      onAssetChange?.();
    } catch (error: any) {
      console.error('Failed to bulk assign:', error);
      throw error;
    }
  };

  const handleExportCSV = () => {
    setShowExportModal(true);
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
      case 'in-use': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-indigo-100 text-indigo-800';
      case 'in-storage': return 'bg-gray-100 text-gray-700';
      case 'under-repair': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'on-order': return 'bg-purple-100 text-purple-800';
      case 'in-transit': return 'bg-yellow-100 text-yellow-800';
      case 'reserved': return 'bg-cyan-100 text-cyan-800';
      case 'lost': return 'bg-pink-100 text-pink-800';
      case 'stolen': return 'bg-red-200 text-red-900';
      case 'damaged': return 'bg-orange-200 text-orange-900';
      case 'disposed': return 'bg-gray-200 text-gray-900';
      case 'retired': return 'bg-gray-300 text-gray-800';
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
        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none"
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
    <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Showing <span className="font-medium">{((pagination.page - 1) * pagination.pageSize) + 1}</span> to{' '}
          <span className="font-medium">{Math.min(pagination.page * pagination.pageSize, pagination.totalItems)}</span> of{' '}
          <span className="font-medium">{pagination.totalItems}</span> assets
        </span>

        <select
          value={pagination.pageSize}
          onChange={(e) => {
            setPagination({ ...pagination, page: 1, pageSize: parseInt(e.target.value) });
          }}
          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
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
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">
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
            className="w-16 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-center bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Go to"
          />
        </div>

        <button
          onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
          disabled={!pagination.hasNext}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* View Toggle */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-md p-1">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded ${viewMode === 'table' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}
            title="Table View"
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 rounded ${viewMode === 'card' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'}`}
            title="Card View"
          >
            <LayoutGrid size={18} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowQRScanner(true)}
            disabled={!canPerformActions}
            className={`flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50 ${!canPerformActions ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={!canPerformActions ? "Login Required" : "Scan QR Code"}
          >
            <Camera size={18} />
            Scan QR
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Download size={18} />
            Export
          </button>
          <button
            onClick={() => setShowImport(true)}
            disabled={!canPerformActions}
            className={`flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 ${!canPerformActions ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={!canPerformActions ? "Login Required" : "Import CSV"}
          >
            <Upload size={18} />
            Import
          </button>
          <button
            onClick={() => setShowStockAlerts(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-md hover:bg-orange-200 dark:hover:bg-orange-900/50"
            title="Manage Stock Alerts"
          >
            <AlertTriangle size={18} />
            Alerts
          </button>
          <button
            onClick={() => setShowLocations(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-md hover:bg-cyan-200 dark:hover:bg-cyan-900/50"
            title="Manage Locations"
          >
            <MapPin size={18} />
            Locations
          </button>
          {templates.length > 0 && (
            <button
              onClick={() => setShowTemplates(true)}
              disabled={!canPerformActions}
              className={`flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 ${!canPerformActions ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={!canPerformActions ? "Login Required" : "Create from Template"}
            >
              <Plus size={18} />
              From Template
            </button>
          )}
          <button
            onClick={handleAddAsset}
            disabled={!canPerformActions}
            className={`flex items-center gap-2 px-4 py-2 bg-emerald-600 dark:bg-emerald-700 text-white rounded-md hover:bg-emerald-700 dark:hover:bg-emerald-800 ${!canPerformActions ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={!canPerformActions ? "Login Required" : "Add Asset"}
          >
            <Plus size={18} />
            Add Asset
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Basic Filters */}
          <select
            value={localCategoryFilter}
            onChange={(e) => setLocalCategoryFilter(e.target.value ? Number(e.target.value) : '')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 dark:text-gray-100"
            disabled={!!categoryFilter}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="">All Statuses</option>
            <optgroup label="Active">
              <option value="available">Available</option>
              <option value="in-use">In Use</option>
              <option value="assigned">Assigned</option>
              <option value="reserved">Reserved</option>
            </optgroup>
            <optgroup label="Inactive/Storage">
              <option value="in-storage">In Storage</option>
              <option value="on-order">On Order</option>
              <option value="in-transit">In Transit</option>
            </optgroup>
            <optgroup label="Service">
              <option value="maintenance">Maintenance</option>
              <option value="under-repair">Under Repair</option>
            </optgroup>
            <optgroup label="Unavailable">
              <option value="lost">Lost</option>
              <option value="stolen">Stolen</option>
              <option value="damaged">Damaged</option>
            </optgroup>
            <optgroup label="Retired">
              <option value="retired">Retired</option>
              <option value="disposed">Disposed</option>
            </optgroup>
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="">All Locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          {/* Separator */}
          {filterPresets.length > 0 && (
            <div className="h-8 w-px bg-gray-300"></div>
          )}

          {/* Filter Presets Dropdown */}
          {filterPresets.length > 0 && (
            <select
              onChange={(e) => {
                if (e.target.value) {
                  loadPreset(Number(e.target.value));
                }
              }}
              className="px-3 py-2 border border-emerald-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-emerald-50 text-emerald-700 font-medium"
              value=""
            >
              <option value="">📋 Load Preset...</option>
              {filterPresets.map(preset => (
                <option key={preset.id} value={preset.id}>
                  {preset.is_favorite ? '⭐ ' : ''}{preset.name}
                  {preset.use_count > 0 ? ` (${preset.use_count})` : ''}
                </option>
              ))}
            </select>
          )}

          {/* Save Current Filters Button */}
          {hasActiveFilters() && (
            <button
              onClick={() => setShowPresetSaveModal(true)}
              className="px-3 py-2 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors font-medium shadow-sm"
            >
              💾 Save Filters
            </button>
          )}

          {/* Separator before action buttons */}
          {hasActiveFilters() && (
            <div className="h-8 w-px bg-gray-300"></div>
          )}

          {/* Clear All Filters Button */}
          {hasActiveFilters() && (
            <button
              onClick={() => {
                setLocalCategoryFilter('');
                setStatusFilter('');
                setLocationFilter('');
                setSearchInput('');
                setSearchQuery('');
                setConditionFilter('');
                setBrandFilter('');
                setModelFilter('');
                setPurchaseDateFrom('');
                setPurchaseDateTo('');
                setPriceMin('');
                setPriceMax('');
                setWarrantyExpiring(false);
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              ✕ Clear All
            </button>
          )}

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-md font-medium transition-colors ml-auto"
          >
            {showAdvancedFilters ? '▼ Hide Advanced' : '▶ Advanced Filters'}
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-emerald-600 rounded-full"></div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Advanced Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Condition Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Condition</label>
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">Any Condition</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
              <input
                type="text"
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                placeholder="Filter by brand..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            {/* Model Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Model</label>
              <input
                type="text"
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                placeholder="Filter by model..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            {/* Purchase Date From */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Purchase Date From</label>
              <input
                type="date"
                value={purchaseDateFrom}
                onChange={(e) => setPurchaseDateFrom(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            {/* Purchase Date To */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Purchase Date To</label>
              <input
                type="date"
                value={purchaseDateTo}
                onChange={(e) => setPurchaseDateTo(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            {/* Price Min */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Min Price</label>
              <input
                type="number"
                step="0.01"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            {/* Price Max */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Max Price</label>
              <input
                type="number"
                step="0.01"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="999999.99"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            {/* Warranty Expiring */}
            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                id="warranty-expiring"
                checked={warrantyExpiring}
                onChange={(e) => setWarrantyExpiring(e.target.checked)}
                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="warranty-expiring" className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                Warranty expiring soon (30 days)
              </label>
            </div>
          </div>

          {/* Manage Saved Presets */}
          {filterPresets.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-emerald-600 rounded-full"></div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Saved Filter Presets</h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">({filterPresets.length})</span>
              </div>
              <div className="space-y-2">
                {filterPresets.map(preset => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => togglePresetFavorite(preset.id)}
                          className="text-lg hover:scale-110 transition-transform"
                          title={preset.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          {preset.is_favorite ? '⭐' : '☆'}
                        </button>
                        <button
                          onClick={() => loadPreset(preset.id)}
                          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 text-left"
                        >
                          {preset.name}
                        </button>
                      </div>
                      {preset.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 ml-8 mt-1">{preset.description}</p>
                      )}
                      {preset.use_count > 0 && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 ml-8 mt-1">Used {preset.use_count} times</p>
                      )}
                    </div>
                    <button
                      onClick={() => deletePreset(preset.id)}
                      className="ml-3 p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete preset"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Filter Chips */}
      {hasActiveFilters() && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Active Filters:</span>

            {localCategoryFilter && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-emerald-300 dark:border-emerald-700 rounded-full text-sm shadow-sm">
                <span className="text-gray-700 dark:text-gray-300">Category:</span>
                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                  {categories.find(c => c.id === localCategoryFilter)?.name}
                </span>
                <button
                  onClick={() => setLocalCategoryFilter('')}
                  className="ml-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {statusFilter && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-emerald-300 dark:border-emerald-700 rounded-full text-sm shadow-sm">
                <span className="text-gray-700 dark:text-gray-300">Status:</span>
                <span className="font-medium text-emerald-700 dark:text-emerald-400">{statusFilter}</span>
                <button
                  onClick={() => setStatusFilter('')}
                  className="ml-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {locationFilter && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-emerald-300 dark:border-emerald-700 rounded-full text-sm shadow-sm">
                <span className="text-gray-700 dark:text-gray-300">Location:</span>
                <span className="font-medium text-emerald-700 dark:text-emerald-400">{locationFilter}</span>
                <button
                  onClick={() => setLocationFilter('')}
                  className="ml-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {searchQuery && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-emerald-300 dark:border-emerald-700 rounded-full text-sm shadow-sm">
                <span className="text-gray-700 dark:text-gray-300">Search:</span>
                <span className="font-medium text-emerald-700 dark:text-emerald-400">"{searchQuery}"</span>
                <button
                  onClick={() => {
                    setSearchInput('');
                    setSearchQuery('');
                  }}
                  className="ml-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {conditionFilter && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-emerald-300 dark:border-emerald-700 rounded-full text-sm shadow-sm">
                <span className="text-gray-700 dark:text-gray-300">Condition:</span>
                <span className="font-medium text-emerald-700 dark:text-emerald-400">{conditionFilter}</span>
                <button
                  onClick={() => setConditionFilter('')}
                  className="ml-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {brandFilter && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-emerald-300 dark:border-emerald-700 rounded-full text-sm shadow-sm">
                <span className="text-gray-700 dark:text-gray-300">Brand:</span>
                <span className="font-medium text-emerald-700 dark:text-emerald-400">{brandFilter}</span>
                <button
                  onClick={() => setBrandFilter('')}
                  className="ml-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {modelFilter && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-emerald-300 dark:border-emerald-700 rounded-full text-sm shadow-sm">
                <span className="text-gray-700 dark:text-gray-300">Model:</span>
                <span className="font-medium text-emerald-700 dark:text-emerald-400">{modelFilter}</span>
                <button
                  onClick={() => setModelFilter('')}
                  className="ml-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {(purchaseDateFrom || purchaseDateTo) && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-emerald-300 dark:border-emerald-700 rounded-full text-sm shadow-sm">
                <span className="text-gray-700 dark:text-gray-300">Date Range:</span>
                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                  {purchaseDateFrom || '...'} to {purchaseDateTo || '...'}
                </span>
                <button
                  onClick={() => {
                    setPurchaseDateFrom('');
                    setPurchaseDateTo('');
                  }}
                  className="ml-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {(priceMin || priceMax) && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-emerald-300 dark:border-emerald-700 rounded-full text-sm shadow-sm">
                <span className="text-gray-700 dark:text-gray-300">Price Range:</span>
                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                  ${priceMin || '0'} - ${priceMax || '∞'}
                </span>
                <button
                  onClick={() => {
                    setPriceMin('');
                    setPriceMax('');
                  }}
                  className="ml-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {warrantyExpiring && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-300 rounded-full text-sm shadow-sm">
                <span className="font-medium text-emerald-700 dark:text-emerald-400">Warranty Expiring</span>
                <button
                  onClick={() => setWarrantyExpiring(false)}
                  className="ml-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setLocalCategoryFilter('');
                setStatusFilter('');
                setLocationFilter('');
                setSearchInput('');
                setSearchQuery('');
                setConditionFilter('');
                setBrandFilter('');
                setModelFilter('');
                setPurchaseDateFrom('');
                setPurchaseDateTo('');
                setPriceMin('');
                setPriceMax('');
                setWarrantyExpiring(false);
              }}
              className="ml-auto px-4 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions Toolbar - Sticky Bottom Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-emerald-600 to-teal-600 shadow-2xl border-t-4 border-emerald-400">
          <div className="max-w-full mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Selection Info */}
              <div className="flex items-center gap-4">
                <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    <span className="text-white font-bold text-lg">
                      {selectedIds.size} {selectedIds.size === 1 ? 'Asset' : 'Assets'} Selected
                    </span>
                  </div>
                  {selectedIds.size > 0 && (
                    <div className="text-emerald-100 text-xs mt-1">
                      {(() => {
                        const selectedAssets = assets.filter(a => selectedIds.has(a.id));
                        const totalValue = selectedAssets.reduce((sum, a) => sum + (a.purchase_price || 0), 0);
                        return totalValue > 0 ? `Total Value: $${totalValue.toFixed(2)}` : '';
                      })()}
                    </div>
                  )}
                </div>

                {/* Quick Selection Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="px-3 py-2 text-sm bg-white bg-opacity-20 text-white rounded-md hover:bg-opacity-30 transition-all"
                    title="Select all assets on current page"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAll}
                    className="px-3 py-2 text-sm bg-white bg-opacity-20 text-white rounded-md hover:bg-opacity-30 transition-all"
                  >
                    Clear Selection
                  </button>
                  <button
                    onClick={() => {
                      const currentlySelected = new Set(selectedIds);
                      const newSelection = new Set<number>();
                      assets.forEach(asset => {
                        if (!currentlySelected.has(asset.id)) {
                          newSelection.add(asset.id);
                        }
                      });
                      setSelectedIds(newSelection);
                    }}
                    className="px-3 py-2 text-sm bg-white bg-opacity-20 text-white rounded-md hover:bg-opacity-30 transition-all"
                    title="Invert current selection"
                  >
                    Invert
                  </button>
                </div>
              </div>

              {/* Bulk Actions */}
              <div className="flex gap-2 flex-wrap">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkStatusUpdate(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="px-4 py-2 text-sm border-2 border-white border-opacity-30 rounded-md bg-white bg-opacity-10 text-white font-medium hover:bg-opacity-20 transition-all"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="" className="text-gray-900">Set Status...</option>
                  <optgroup label="Active" className="text-gray-900">
                    <option value="available">Available</option>
                    <option value="in-use">In Use</option>
                    <option value="assigned">Assigned</option>
                    <option value="reserved">Reserved</option>
                  </optgroup>
                  <optgroup label="Storage" className="text-gray-900">
                    <option value="in-storage">In Storage</option>
                    <option value="on-order">On Order</option>
                    <option value="in-transit">In Transit</option>
                  </optgroup>
                  <optgroup label="Service" className="text-gray-900">
                    <option value="maintenance">Maintenance</option>
                    <option value="under-repair">Under Repair</option>
                  </optgroup>
                  <optgroup label="Issues" className="text-gray-900">
                    <option value="lost">Lost</option>
                    <option value="stolen">Stolen</option>
                    <option value="damaged">Damaged</option>
                  </optgroup>
                  <optgroup label="End of Life" className="text-gray-900">
                    <option value="retired">Retired</option>
                    <option value="disposed">Disposed</option>
                  </optgroup>
                </select>

                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-white text-emerald-700 rounded-md hover:bg-emerald-50 font-medium shadow-sm transition-all"
                  title="Export selected assets to CSV"
                >
                  <Download size={16} />
                  Export
                </button>

                <button
                  onClick={() => setShowBulkEdit(true)}
                  disabled={!canPerformActions}
                  className={`flex items-center gap-2 px-4 py-2 text-sm bg-white text-emerald-700 rounded-md hover:bg-emerald-50 font-medium shadow-sm transition-all ${!canPerformActions ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={!canPerformActions ? "Login Required" : "Bulk Edit Selected Assets"}
                >
                  <Edit size={16} />
                  Edit
                </button>

                <button
                  onClick={() => setShowBulkAssign(true)}
                  disabled={!canPerformActions}
                  className={`flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-sm transition-all ${!canPerformActions ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={!canPerformActions ? "Login Required" : "Bulk Assign Selected Assets"}
                >
                  <Package size={16} />
                  Assign
                </button>

                <button
                  onClick={handleBulkDelete}
                  disabled={!canDelete}
                  className={`flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 font-medium shadow-sm transition-all ${!canDelete ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={!canDelete ? (currentUser ? "Admin Only" : "Login Required") : "Delete Selected Assets"}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Asset Display - Table or Card View */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Activity</th>
                <SortableHeader column="location" label="Location" />
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Loading assets...</p>
                    </div>
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-gray-300 mb-4">
                        <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {hasActiveFilters() ? 'No assets match your filters' : 'No assets yet'}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
                        {hasActiveFilters()
                          ? 'Try adjusting your filters or clearing them to see more results.'
                          : 'Get started by adding your first asset to track your inventory and equipment.'
                        }
                      </p>
                      {!hasActiveFilters() && (
                        <button
                          onClick={handleAddAsset}
                          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          <Plus size={20} />
                          Add Your First Asset
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr
                    key={asset.id}
                    onClick={(e) => {
                      // Don't trigger if clicking on checkbox or buttons
                      if ((e.target as HTMLElement).tagName !== 'INPUT' &&
                          (e.target as HTMLElement).tagName !== 'BUTTON' &&
                          !(e.target as HTMLElement).closest('button')) {
                        setQuickViewAsset(asset);
                        setShowQuickView(true);
                      }
                    }}
                    className={`hover:bg-gray-50 cursor-pointer ${selectedIds.has(asset.id) ? 'bg-emerald-50' : ''}`}
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm text-gray-900">{asset.name}</span>
                        {asset.is_tracked_inventory === 1 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {asset.available_quantity || 0}/{asset.total_quantity || 0}
                          </span>
                        )}
                        {asset.depreciation_method && asset.depreciation_method !== 'none' && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700" title="Has Depreciation Tracking">
                            <DollarSign size={12} />
                          </span>
                        )}
                        {asset.disposal_date && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700" title="Disposed">
                            <Trash2 size={12} />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{asset.category_name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <AssetIndicators
                        assetId={asset.id}
                        indicators={{
                          activeReservations: asset.reservation_count,
                          activeLeases: asset.lease_count,
                          hasInsurance: (asset.insurance_count && asset.insurance_count > 0) || false,
                        }}
                      />
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
                              disabled={!canPerformActions}
                              className={`p-1 text-green-600 hover:bg-green-50 rounded ${!canPerformActions ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={!canPerformActions ? "Login Required" : "Receive Shipment"}
                            >
                              <Package size={16} />
                            </button>
                            <button
                              onClick={() => handleInventoryTransaction(asset, 'adjustment')}
                              disabled={!canPerformActions}
                              className={`p-1 text-blue-600 hover:bg-blue-50 rounded ${!canPerformActions ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={!canPerformActions ? "Login Required" : "Adjust Inventory"}
                            >
                              <TrendingUp size={16} />
                            </button>
                            <button
                              onClick={() => handleInventoryTransaction(asset, 'writeoff')}
                              disabled={!canPerformActions}
                              className={`p-1 text-orange-600 hover:bg-orange-50 rounded ${!canPerformActions ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={!canPerformActions ? "Login Required" : "Write-Off"}
                            >
                              <TrendingDown size={16} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setReservationAsset(asset);
                            setShowReservations(true);
                          }}
                          disabled={!canPerformActions}
                          className={`p-1 text-purple-600 hover:bg-purple-50 rounded ${!canPerformActions ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={!canPerformActions ? "Login Required" : "Reserve"}
                        >
                          <CalendarPlus size={16} />
                        </button>
                        <button
                          onClick={() => handleEditAsset(asset)}
                          disabled={!canPerformActions}
                          className={`p-1 text-emerald-600 hover:bg-emerald-50 rounded ${!canPerformActions ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={!canPerformActions ? "Login Required" : "Edit"}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(asset.id)}
                          disabled={!canDelete}
                          className={`p-1 text-red-600 hover:bg-red-50 rounded ${!canDelete ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={!canDelete ? (currentUser ? "Admin Only" : "Login Required") : "Delete"}
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
        ) : (
          /* Card View */
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <p className="mt-2 text-gray-600">Loading assets...</p>
              </div>
            ) : assets.length === 0 ? (
              <div className="text-center py-12">
                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Assets Found</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {hasActiveFilters()
                    ? 'Try adjusting your filters or clearing them to see more results.'
                    : 'Get started by adding your first asset to track your inventory and equipment.'
                  }
                </p>
                {!hasActiveFilters() && (
                  <button
                    onClick={handleAddAsset}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm mx-auto"
                  >
                    <Plus size={20} />
                    Add Your First Asset
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className={`group relative bg-white border-2 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer ${
                      selectedIds.has(asset.id) ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'
                    }`}
                    onClick={() => {
                      setQuickViewAsset(asset);
                      setShowQuickView(true);
                    }}
                  >
                    {/* Selection Checkbox */}
                    <div className="absolute top-3 left-3 z-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(asset.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelection(asset.id);
                        }}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-5 h-5"
                      />
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(asset.status)}`}>
                        {asset.status}
                      </span>
                    </div>

                    {/* Asset Info */}
                    <div className="mt-8 mb-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">{asset.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{asset.asset_tag}</p>

                      {/* Feature Badges */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {asset.is_tracked_inventory === 1 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            <Package size={12} />
                            {asset.available_quantity || 0}/{asset.total_quantity || 0}
                          </span>
                        )}
                        {asset.depreciation_method && asset.depreciation_method !== 'none' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                            <DollarSign size={12} />
                            Depreciation
                          </span>
                        )}
                        {asset.disposal_date && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            <Trash2 size={12} />
                            Disposed
                          </span>
                        )}
                      </div>

                      {/* Activity Indicators */}
                      <div className="mb-3">
                        <AssetIndicators
                          assetId={asset.id}
                          indicators={{
                            activeReservations: asset.reservation_count,
                            activeLeases: asset.lease_count,
                            hasInsurance: (asset.insurance_count && asset.insurance_count > 0) || false,
                          }}
                        />
                      </div>

                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Category:</span>
                          <span className="text-gray-900 font-medium">{asset.category_name}</span>
                        </div>
                        {asset.location && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">Location:</span>
                            <span className="text-gray-900">{asset.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowQRCode(asset);
                        }}
                        className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded text-xs font-medium"
                        title="QR Code"
                      >
                        <QrCode size={16} className="mx-auto" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAsset(asset);
                        }}
                        disabled={!canPerformActions}
                        className={`flex-1 p-2 text-emerald-600 hover:bg-emerald-50 rounded text-xs font-medium ${!canPerformActions ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Edit"
                      >
                        <Edit size={16} className="mx-auto" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickViewAsset(asset);
                          setShowQuickView(true);
                        }}
                        className="flex-1 p-2 text-indigo-600 hover:bg-indigo-50 rounded text-xs font-medium"
                        title="View Details"
                      >
                        <Eye size={16} className="mx-auto" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalItems > 0 && <PaginationControls />}

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <div>
              {selectedIds.size > 0 && `${selectedIds.size} selected`}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">
              <span className="font-medium">Shortcuts:</span> F1: Help • Ctrl+N: New • Ctrl+F: Search • Ctrl+A: Select All • Ctrl+E: Edit • Ctrl+D: Duplicate • Del: Delete
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

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          assets={selectedIds.size > 0 ? assets.filter(a => selectedIds.has(a.id)) : assets}
          onClose={() => setShowExportModal(false)}
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

      {/* Save Filter Preset Modal */}
      {showPresetSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Save Filter Preset</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preset Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="e.g., Available Laptops in Warehouse"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={presetDescription}
                    onChange={(e) => setPresetDescription(e.target.value)}
                    placeholder="Add notes about this filter preset..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600 mb-2 font-medium">Active Filters:</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    {effectiveCategoryFilter && <li>• Category filter applied</li>}
                    {statusFilter && <li>• Status: {statusFilter}</li>}
                    {locationFilter && <li>• Location: {locationFilter}</li>}
                    {searchQuery && <li>• Search: "{searchQuery}"</li>}
                    {conditionFilter && <li>• Condition: {conditionFilter}</li>}
                    {brandFilter && <li>• Brand: {brandFilter}</li>}
                    {modelFilter && <li>• Model: {modelFilter}</li>}
                    {purchaseDateFrom && <li>• Purchase date from: {purchaseDateFrom}</li>}
                    {purchaseDateTo && <li>• Purchase date to: {purchaseDateTo}</li>}
                    {priceMin && <li>• Min price: ${priceMin}</li>}
                    {priceMax && <li>• Max price: ${priceMax}</li>}
                    {warrantyExpiring && <li>• Warranty expiring soon</li>}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPresetSaveModal(false);
                    setPresetName('');
                    setPresetDescription('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCurrentFiltersAsPreset}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                >
                  Save Preset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {showQuickView && quickViewAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{quickViewAsset.name}</h2>
                <p className="text-sm text-gray-500">{quickViewAsset.asset_tag}</p>
              </div>
              <button
                onClick={() => {
                  setShowQuickView(false);
                  setQuickViewTab('overview'); // Reset to overview when closing
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex overflow-x-auto px-6">
                <button
                  onClick={() => setQuickViewTab('overview')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    quickViewTab === 'overview'
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setQuickViewTab('details')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    quickViewTab === 'details'
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setQuickViewTab('reservations')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    quickViewTab === 'reservations'
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Calendar size={16} />
                  Reservations
                  {(quickViewAsset.reservation_count || 0) > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                      {quickViewAsset.reservation_count}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setQuickViewTab('leases')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    quickViewTab === 'leases'
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FileText size={16} />
                  Leases
                  {(quickViewAsset.lease_count || 0) > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                      {quickViewAsset.lease_count}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setQuickViewTab('insurance')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    quickViewTab === 'insurance'
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Shield size={16} />
                  Insurance
                  {(quickViewAsset.insurance_count || 0) > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
                      {quickViewAsset.insurance_count}
                    </span>
                  )}
                </button>
                {quickViewAsset.depreciation_method && quickViewAsset.depreciation_method !== 'none' && (
                  <button
                    onClick={() => setQuickViewTab('depreciation')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                      quickViewTab === 'depreciation'
                        ? 'border-emerald-600 text-emerald-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    💰 Depreciation
                  </button>
                )}
                {quickViewAsset.disposal_date && (
                  <button
                    onClick={() => setQuickViewTab('disposal')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                      quickViewTab === 'disposal'
                        ? 'border-emerald-600 text-emerald-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    🗑️ Disposal
                  </button>
                )}
                <button
                  onClick={() => setQuickViewTab('attachments')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    quickViewTab === 'attachments'
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📎 Attachments
                </button>
                <button
                  onClick={() => setQuickViewTab('history')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    quickViewTab === 'history'
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📋 History
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Overview Tab */}
              {quickViewTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
                      <p className="text-lg text-gray-900">{quickViewAsset.category_name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                      <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(quickViewAsset.status)}`}>
                        {quickViewAsset.status}
                      </span>
                    </div>
                    {quickViewAsset.location && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                        <p className="text-gray-900">{quickViewAsset.location}</p>
                      </div>
                    )}
                    {quickViewAsset.condition && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Condition</h3>
                        <p className="text-gray-900">{quickViewAsset.condition}</p>
                      </div>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Stats</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {quickViewAsset.is_tracked_inventory === 1 && (
                        <>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Total Quantity</p>
                            <p className="text-2xl font-bold text-emerald-700">{quickViewAsset.total_quantity || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Available</p>
                            <p className="text-2xl font-bold text-emerald-700">{quickViewAsset.available_quantity || 0}</p>
                          </div>
                        </>
                      )}
                      {quickViewAsset.purchase_price && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Purchase Price</p>
                          <p className="text-2xl font-bold text-emerald-700">${quickViewAsset.purchase_price.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Feature Badges */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {quickViewAsset.is_tracked_inventory === 1 && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          📦 Tracked Inventory
                        </span>
                      )}
                      {quickViewAsset.depreciation_method && quickViewAsset.depreciation_method !== 'none' && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                          💰 Depreciation Enabled
                        </span>
                      )}
                      {quickViewAsset.disposal_date && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                          🗑️ Disposed
                        </span>
                      )}
                      {quickViewAsset.warranty_expiry && new Date(quickViewAsset.warranty_expiry) > new Date() && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-700">
                          ✓ Under Warranty
                        </span>
                      )}
                    </div>
                  </div>

                  {quickViewAsset.description && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{quickViewAsset.description}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Details Tab */}
              {quickViewTab === 'details' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {quickViewAsset.brand && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Brand</h3>
                        <p className="text-gray-900">{quickViewAsset.brand}</p>
                      </div>
                    )}
                    {quickViewAsset.model && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Model</h3>
                        <p className="text-gray-900">{quickViewAsset.model}</p>
                      </div>
                    )}
                    {quickViewAsset.serial_number && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Serial Number</h3>
                        <p className="text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">{quickViewAsset.serial_number}</p>
                      </div>
                    )}
                  </div>

                  {/* Purchase Information */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Purchase Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {quickViewAsset.purchase_date && (
                        <div>
                          <h4 className="text-xs text-gray-600 mb-1">Purchase Date</h4>
                          <p className="text-gray-900">{new Date(quickViewAsset.purchase_date).toLocaleDateString()}</p>
                        </div>
                      )}
                      {quickViewAsset.purchase_price && (
                        <div>
                          <h4 className="text-xs text-gray-600 mb-1">Purchase Price</h4>
                          <p className="text-gray-900">${quickViewAsset.purchase_price.toFixed(2)}</p>
                        </div>
                      )}
                      {quickViewAsset.vendor && (
                        <div>
                          <h4 className="text-xs text-gray-600 mb-1">Vendor</h4>
                          <p className="text-gray-900">{quickViewAsset.vendor}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Warranty Information */}
                  {quickViewAsset.warranty_expiry && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Warranty Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs text-gray-600 mb-1">Expiry Date</h4>
                          <p className="text-gray-900">{new Date(quickViewAsset.warranty_expiry).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <h4 className="text-xs text-gray-600 mb-1">Status</h4>
                          {new Date(quickViewAsset.warranty_expiry) > new Date() ? (
                            <span className="text-green-700 font-medium">✓ Active</span>
                          ) : (
                            <span className="text-red-700 font-medium">✗ Expired</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {quickViewAsset.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{quickViewAsset.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Depreciation Tab */}
              {quickViewTab === 'depreciation' && (
                <div>
                  <DepreciationInfo asset={quickViewAsset} />
                </div>
              )}

              {/* Disposal Tab */}
              {quickViewTab === 'disposal' && (
                <div>
                  <DisposalInfo asset={quickViewAsset} />
                </div>
              )}

              {/* Reservations Tab */}
              {quickViewTab === 'reservations' && (
                <div>
                  {quickViewDataLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    </div>
                  ) : quickViewReservations.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <Calendar size={32} className="text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Reservations</h3>
                      <p className="text-gray-500 mb-4">This asset has no reservations</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Reservations</h3>
                      {quickViewReservations.map((reservation) => (
                        <div key={reservation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Calendar size={16} className="text-blue-600" />
                                <span className="font-semibold text-gray-900">{reservation.reserved_by}</span>
                              </div>
                              {reservation.reserved_for && (
                                <p className="text-sm text-gray-600">For: {reservation.reserved_for}</p>
                              )}
                            </div>
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                              reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              reservation.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              reservation.status === 'active' ? 'bg-green-100 text-green-800' :
                              reservation.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {reservation.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500">Start:</span>
                              <span className="ml-2 text-gray-900">{new Date(reservation.reservation_start).toLocaleDateString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">End:</span>
                              <span className="ml-2 text-gray-900">{new Date(reservation.reservation_end).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {reservation.purpose && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-sm text-gray-600"><span className="font-medium">Purpose:</span> {reservation.purpose}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Leases Tab */}
              {quickViewTab === 'leases' && (
                <div>
                  {quickViewDataLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    </div>
                  ) : quickViewLeases.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <FileText size={32} className="text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Leases</h3>
                      <p className="text-gray-500 mb-4">This asset has no lease agreements</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Lease Agreements</h3>
                      {quickViewLeases.map((lease) => (
                        <div key={lease.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <FileText size={16} className="text-purple-600" />
                                <span className="font-semibold text-gray-900">{lease.lessor}</span>
                              </div>
                              <p className="text-sm text-gray-600">Lessee: {lease.lessee}</p>
                              {lease.contract_number && (
                                <p className="text-xs text-gray-500 font-mono">#{lease.contract_number}</p>
                              )}
                            </div>
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                              lease.status === 'active' ? 'bg-green-100 text-green-800' :
                              lease.status === 'expired' ? 'bg-red-100 text-red-800' :
                              lease.status === 'renewed' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {lease.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                            <div>
                              <span className="text-gray-500">Start:</span>
                              <span className="ml-2 text-gray-900">{new Date(lease.start_date).toLocaleDateString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">End:</span>
                              <span className="ml-2 text-gray-900">{new Date(lease.end_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {lease.monthly_payment && (
                            <div className="text-sm">
                              <span className="text-gray-500">Payment:</span>
                              <span className="ml-2 text-gray-900 font-medium">${lease.monthly_payment.toFixed(2)}</span>
                              {lease.payment_frequency && <span className="text-gray-500"> / {lease.payment_frequency}</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Insurance Tab */}
              {quickViewTab === 'insurance' && (
                <div>
                  {quickViewDataLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    </div>
                  ) : quickViewInsurance.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <Shield size={32} className="text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Insurance</h3>
                      <p className="text-gray-500 mb-4">This asset has no insurance policies</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance Policies</h3>
                      {quickViewInsurance.map((policy) => (
                        <div key={policy.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Shield size={16} className="text-green-600" />
                                <span className="font-semibold text-gray-900">{policy.provider}</span>
                              </div>
                              <p className="text-sm text-gray-600">{policy.policy_type || 'Standard'} Policy</p>
                              <p className="text-xs text-gray-500 font-mono">#{policy.policy_number}</p>
                            </div>
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                              policy.status === 'active' ? 'bg-green-100 text-green-800' :
                              policy.status === 'expired' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {policy.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                            <div>
                              <span className="text-gray-500">Start:</span>
                              <span className="ml-2 text-gray-900">{new Date(policy.start_date).toLocaleDateString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">End:</span>
                              <span className="ml-2 text-gray-900">{new Date(policy.end_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {policy.coverage_amount && (
                            <div className="text-sm">
                              <span className="text-gray-500">Coverage:</span>
                              <span className="ml-2 text-gray-900 font-medium">${policy.coverage_amount.toFixed(2)}</span>
                            </div>
                          )}
                          {policy.premium_amount && (
                            <div className="text-sm">
                              <span className="text-gray-500">Premium:</span>
                              <span className="ml-2 text-gray-900">${policy.premium_amount.toFixed(2)}</span>
                              {policy.premium_frequency && <span className="text-gray-500"> / {policy.premium_frequency}</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Attachments Tab */}
              {quickViewTab === 'attachments' && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <FileText size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Attachments</h3>
                  <p className="text-gray-500 mb-4">View and manage files attached to this asset</p>
                  <p className="text-sm text-gray-400">This feature will be available soon</p>
                </div>
              )}

              {/* History Tab */}
              {quickViewTab === 'history' && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Calendar size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Activity History</h3>
                  <p className="text-gray-500 mb-4">Track all changes and activities for this asset</p>
                  <p className="text-sm text-gray-400">This feature will be available soon</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex flex-wrap gap-2 justify-between">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setShowQuickView(false);
                      handleShowQRCode(quickViewAsset);
                    }}
                    className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2 text-sm"
                  >
                    <QrCode size={16} />
                    QR Code
                  </button>
                  <button
                    onClick={() => {
                      setReservationAsset(quickViewAsset);
                      setShowReservations(true);
                    }}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2 text-sm"
                  >
                    <Calendar size={16} />
                    Reservations
                  </button>
                  <button
                    onClick={() => {
                      setLeaseAsset(quickViewAsset);
                      setShowLeases(true);
                    }}
                    className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2 text-sm"
                  >
                    <FileText size={16} />
                    Leases
                  </button>
                  <button
                    onClick={() => {
                      setInsuranceAsset(quickViewAsset);
                      setShowInsurance(true);
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm"
                  >
                    <Shield size={16} />
                    Insurance
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowQuickView(false);
                    handleEditAsset(quickViewAsset);
                  }}
                  disabled={!canPerformActions}
                  className={`px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center gap-2 text-sm ${!canPerformActions ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={!canPerformActions ? "Login Required" : "Edit Asset"}
                >
                  <Edit size={18} />
                  Edit Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Scanner Modal */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Scan QR Code</h2>
              <button
                onClick={() => {
                  setShowQRScanner(false);
                  setScannedData('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Quick Find:</strong> Scan a QR code or enter an asset tag to quickly locate an asset.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Asset Tag or QR Data
                </label>
                <input
                  type="text"
                  value={scannedData}
                  onChange={(e) => setScannedData(e.target.value)}
                  placeholder="Scan or type asset tag..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && scannedData) {
                      // Search for asset by tag
                      const found = assets.find(a => a.asset_tag.toLowerCase() === scannedData.toLowerCase());
                      if (found) {
                        setShowQRScanner(false);
                        setScannedData('');
                        setQuickViewAsset(found);
                        setShowQuickView(true);
                      } else {
                        alert('Asset not found');
                      }
                    }
                  }}
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 text-center mb-2">
                  Camera scanning will be available in a future update
                </p>
                <div className="flex items-center justify-center py-8 text-gray-300">
                  <Camera size={64} />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowQRScanner(false);
                  setScannedData('');
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (scannedData) {
                    const found = assets.find(a => a.asset_tag.toLowerCase() === scannedData.toLowerCase());
                    if (found) {
                      setShowQRScanner(false);
                      setScannedData('');
                      setQuickViewAsset(found);
                      setShowQuickView(true);
                    } else {
                      alert('Asset not found');
                    }
                  }
                }}
                disabled={!scannedData}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Find Asset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Edit Modal */}
      {showBulkEdit && (
        <BulkEditModal
          isOpen={showBulkEdit}
          onClose={() => setShowBulkEdit(false)}
          selectedCount={selectedIds.size}
          selectedIds={Array.from(selectedIds)}
          categories={categories}
          onUpdate={handleBulkUpdate}
        />
      )}

      {/* Bulk Assign Modal */}
      {showBulkAssign && (
        <BulkAssignModal
          isOpen={showBulkAssign}
          onClose={() => setShowBulkAssign(false)}
          selectedCount={selectedIds.size}
          selectedIds={Array.from(selectedIds)}
          onAssign={handleBulkAssign}
        />
      )}

      {/* Reservation Manager Modal */}
      {showReservations && reservationAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <ReservationManager
              asset={reservationAsset}
              onClose={() => {
                setShowReservations(false);
                setReservationAsset(null);
              }}
              currentUser={currentUser}
            />
          </div>
        </div>
      )}

      {/* Lease Manager Modal */}
      {showLeases && leaseAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <LeaseManager
              asset={leaseAsset}
              onClose={() => {
                setShowLeases(false);
                setLeaseAsset(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Insurance Manager Modal */}
      {showInsurance && insuranceAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <InsuranceManager
              asset={insuranceAsset}
              onClose={() => {
                setShowInsurance(false);
                setInsuranceAsset(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Location Manager Modal */}
      {showLocations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <LocationManager
              onClose={() => setShowLocations(false)}
            />
          </div>
        </div>
      )}

      {/* Stock Alert Manager Modal */}
      {showStockAlerts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <StockAlertManager
              onClose={() => setShowStockAlerts(false)}
              currentUser={currentUser?.username || 'User'}
            />
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help Modal */}
      {showShortcutsHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
                <p className="text-emerald-100 text-sm">Power user features for faster workflow</p>
              </div>
              <button
                onClick={() => setShowShortcutsHelp(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* General Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Package size={18} className="text-emerald-600" />
                    General
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-700">Show this help</span>
                      <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">F1</kbd>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-700">Focus search</span>
                      <div className="flex gap-1">
                        <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">/</kbd>
                        <span className="text-gray-400">or</span>
                        <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">Ctrl+F</kbd>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-700">Clear selection</span>
                      <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">Esc</kbd>
                    </div>
                  </div>
                </div>

                {/* Asset Actions Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Plus size={18} className="text-blue-600" />
                    Asset Actions
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-700">New asset</span>
                      <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">Ctrl+N</kbd>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-700">Edit selected</span>
                      <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">Ctrl+E</kbd>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-700">Duplicate selected</span>
                      <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">Ctrl+D</kbd>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-700">Quick view</span>
                      <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">Ctrl+Q</kbd>
                    </div>
                  </div>
                </div>

                {/* Selection Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <List size={18} className="text-purple-600" />
                    Selection
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-700">Select all</span>
                      <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">Ctrl+A</kbd>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-700">Delete selected</span>
                      <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">Delete</kbd>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-700">Bulk edit</span>
                      <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">Ctrl+B</kbd>
                    </div>
                  </div>
                </div>

                {/* Import/Export Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Download size={18} className="text-indigo-600" />
                    Import/Export
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-700">Import CSV</span>
                      <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">Ctrl+I</kbd>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-700">Export CSV</span>
                      <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">Ctrl+X</kbd>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-emerald-900">
                  <strong>Pro Tip:</strong> Most shortcuts work with one or more assets selected. Select assets by clicking checkboxes in the table or card view.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowShortcutsHelp(false)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
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
    depreciation_method: asset?.depreciation_method || 'none',
    useful_life_years: asset?.useful_life_years || undefined,
    salvage_value: asset?.salvage_value || undefined,
    depreciation_start_date: asset?.depreciation_start_date || '',
    disposal_date: asset?.disposal_date || '',
    disposal_reason: asset?.disposal_reason || '',
    disposal_method: asset?.disposal_method || undefined,
    disposal_value: asset?.disposal_value || undefined,
    disposed_by: asset?.disposed_by || '',
    disposal_notes: asset?.disposal_notes || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [customFieldDefinitions, setCustomFieldDefinitions] = useState<CustomFieldDefinition[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);

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
      showError(error, ErrorContext.SAVE_ASSET);
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
            required={field.required === 1}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
            required={field.required === 1}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
            required={field.required === 1}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
          />
        );

      case 'dropdown': {
        const options = field.options ? field.options.split(',') : [];
        return (
          <select
            value={value}
            onChange={(e) => handleCustomFieldChange(field.field_name, e.target.value)}
            required={field.required === 1}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
              >
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

            {/* Show/Hide Advanced Fields Toggle */}
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                className="w-full px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-lg text-emerald-700 font-medium hover:from-emerald-100 hover:to-teal-100 transition-all flex items-center justify-center gap-2"
              >
                {showAdvancedFields ? (
                  <>
                    <X size={18} />
                    Hide Advanced Options
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Show Advanced Options
                  </>
                )}
              </button>
              {!showAdvancedFields && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Product details, purchase info, depreciation, disposal tracking, and more
                </p>
              )}
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

            {/* Advanced Fields - Conditionally Shown */}
            {showAdvancedFields && (
              <>
                {/* Product Details Section */}
                <div className="md:col-span-2 pt-4 border-t-2 border-emerald-200">
                  <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Package size={18} className="text-emerald-600" />
                    Product Details
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                {/* Purchase Information Section */}
                <div className="md:col-span-2 pt-4 border-t border-gray-200">
                  <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp size={18} className="text-blue-600" />
                    Purchase Information
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.purchase_price || ''}
                    onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                {/* Depreciation Section */}
                <div className="md:col-span-2 pt-4 border-t border-gray-200">
                  <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingDown size={18} className="text-purple-600" />
                    Depreciation & Valuation
                  </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Depreciation Method</label>
                  <select
                    value={formData.depreciation_method}
                    onChange={(e) => setFormData({ ...formData, depreciation_method: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="none">No Depreciation</option>
                    <option value="straight-line">Straight-Line</option>
                    <option value="declining-balance">Declining Balance (200%)</option>
                    <option value="sum-of-years">Sum of Years Digits</option>
                  </select>
                </div>

                {formData.depreciation_method !== 'none' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Useful Life (Years)</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.useful_life_years || ''}
                        onChange={(e) => setFormData({ ...formData, useful_life_years: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="e.g., 5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Salvage Value</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.salvage_value || ''}
                        onChange={(e) => setFormData({ ...formData, salvage_value: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Depreciation Start Date</label>
                      <input
                        type="date"
                        value={formData.depreciation_start_date}
                        onChange={(e) => setFormData({ ...formData, depreciation_start_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave empty to use purchase date</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Disposal Tracking Section */}
            <div className="md:col-span-2 pt-4 border-t border-gray-200">
              <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Trash2 size={18} className="text-red-600" />
                Asset Disposal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disposal Date</label>
                  <input
                    type="date"
                    value={formData.disposal_date}
                    onChange={(e) => setFormData({ ...formData, disposal_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty if asset is still in use</p>
                </div>

                {formData.disposal_date && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Disposal Method</label>
                      <select
                        value={formData.disposal_method || ''}
                        onChange={(e) => setFormData({ ...formData, disposal_method: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                      >
                        <option value="">Select method...</option>
                        <option value="sold">Sold</option>
                        <option value="donated">Donated</option>
                        <option value="recycled">Recycled</option>
                        <option value="discarded">Discarded</option>
                        <option value="transferred">Transferred</option>
                        <option value="returned">Returned</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Disposal Value</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.disposal_value || ''}
                        onChange={(e) => setFormData({ ...formData, disposal_value: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Disposed By</label>
                      <input
                        type="text"
                        value={formData.disposed_by}
                        onChange={(e) => setFormData({ ...formData, disposed_by: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="Person/Department"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Disposal Reason</label>
                      <input
                        type="text"
                        value={formData.disposal_reason}
                        onChange={(e) => setFormData({ ...formData, disposal_reason: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                        placeholder="Brief reason for disposal"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Disposal Notes</label>
                      <textarea
                        value={formData.disposal_notes}
                        onChange={(e) => setFormData({ ...formData, disposal_notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-gray-100"
                        rows={3}
                        placeholder="Additional disposal details..."
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
              </>
            )}

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

          {/* Attachments Section - Only show for existing assets */}
          {asset && asset.id && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <AttachmentManager assetId={asset.id} canEdit={true} />
            </div>
          )}

          {/* Barcodes Section - Only show for existing assets */}
          {asset && asset.id && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <BarcodeManager assetId={asset.id} assetTag={asset.asset_tag} canEdit={true} />
            </div>
          )}

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
