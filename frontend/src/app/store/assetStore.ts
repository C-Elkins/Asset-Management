import { create } from 'zustand';
import { Asset, FilterState, SortState } from '@/types';

interface AssetState {
  assets: Asset[];
  selectedAsset: Asset | null;
  filters: FilterState;
  sort: SortState;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
}

interface AssetActions {
  fetchAssets: () => Promise<void>;
  fetchAssetById: (id: string) => Promise<void>;
  createAsset: (asset: Partial<Asset>) => Promise<void>;
  updateAsset: (id: string, asset: Partial<Asset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  setFilters: (filters: Partial<FilterState>) => void;
  setSort: (sort: SortState) => void;
  setPagination: (pagination: Partial<AssetState['pagination']>) => void;
  setSelectedAsset: (asset: Asset | null) => void;
  clearError: () => void;
}

type AssetStore = AssetState & AssetActions;

const useAssetStore = create<AssetStore>((set, get) => ({
  // State
  assets: [],
  selectedAsset: null,
  filters: {},
  sort: { field: 'createdAt', direction: 'desc' },
  pagination: {
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,

  // Actions
  fetchAssets: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { filters, sort, pagination } = get();
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        size: pagination.size.toString(),
        sort: `${sort.field},${sort.direction}`,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        ),
      });

      const response = await fetch(`/api/v1/assets?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }

      const data = await response.json();

      set({
        assets: data.data,
        pagination: {
          page: data.page,
          size: data.size,
          totalElements: data.totalElements,
          totalPages: data.totalPages,
        },
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch assets',
      });
    }
  },

  fetchAssetById: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`/api/v1/assets/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch asset');
      }

      const data = await response.json();

      set({
        selectedAsset: data.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch asset',
      });
    }
  },

  createAsset: async (assetData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/v1/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assetData),
      });

      if (!response.ok) {
        throw new Error('Failed to create asset');
      }

      // Refresh assets list
      await get().fetchAssets();
      
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create asset',
      });
      throw error;
    }
  },

  updateAsset: async (id, assetData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`/api/v1/assets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assetData),
      });

      if (!response.ok) {
        throw new Error('Failed to update asset');
      }

      // Refresh assets list
      await get().fetchAssets();
      
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update asset',
      });
      throw error;
    }
  },

  deleteAsset: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch(`/api/v1/assets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete asset');
      }

      // Remove from local state
      set((state) => ({
        assets: state.assets.filter((asset) => asset.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete asset',
      });
      throw error;
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 0 }, // Reset to first page
    }));
    
    // Auto-fetch with new filters
    get().fetchAssets();
  },

  setSort: (newSort) => {
    set({ sort: newSort });
    
    // Auto-fetch with new sort
    get().fetchAssets();
  },

  setPagination: (newPagination) => {
    set((state) => ({
      pagination: { ...state.pagination, ...newPagination },
    }));
    
    // Auto-fetch with new pagination
    get().fetchAssets();
  },

  setSelectedAsset: (asset) => {
    set({ selectedAsset: asset });
  },

  clearError: () => {
    set({ error: null });
  },
}));

export { useAssetStore };
