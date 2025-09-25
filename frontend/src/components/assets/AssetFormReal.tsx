// Real Asset Form Component with Validation and Store Integration
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useAssetStore from '../../stores/assetStore';
import { useAI } from '../../services/aiService';
import { ExecutiveButton } from '../common/ExecutiveButton';
import { Asset } from '../../services/localDatabase';

interface AssetFormProps {
  asset?: Asset | null;
  onSubmit?: (asset: Asset) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

export const AssetForm: React.FC<AssetFormProps> = ({
  asset,
  onSubmit,
  onCancel,
  mode = 'create'
}) => {
  const { 
    createAsset, 
    updateAsset, 
    categories, 
    loading, 
    error, 
    clearError 
  } = useAssetStore();
  
  const { categorizeAsset } = useAI();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    assetTag: '',
    category: '',
    status: 'AVAILABLE' as Asset['status'],
    condition: 'GOOD' as Asset['condition'],
    assignedTo: '',
    location: '',
    purchaseDate: '',
    purchasePrice: '',
    warrantyExpiry: '',
    description: '',
    brand: '',
    model: '',
    serialNumber: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (asset && mode === 'edit') {
      setFormData({
        name: asset.name || '',
        assetTag: asset.assetTag || '',
        category: asset.category || '',
        status: asset.status || 'AVAILABLE',
        condition: asset.condition || 'GOOD',
        assignedTo: asset.assignedTo || '',
        location: asset.location || '',
        purchaseDate: asset.purchaseDate || '',
        purchasePrice: asset.purchasePrice?.toString() || '',
        warrantyExpiry: asset.warrantyExpiry || '',
        description: asset.description || '',
        brand: asset.brand || '',
        model: asset.model || '',
        serialNumber: asset.serialNumber || '',
        notes: asset.notes || ''
      });
    }
  }, [asset, mode]);

  // Auto-generate asset tag
  const generateAssetTag = () => {
    const prefix = formData.category ? formData.category.substring(0, 3).toUpperCase() : 'AST';
    const timestamp = Date.now().toString().slice(-6);
    const tag = `${prefix}-${timestamp}`;
    setFormData(prev => ({ ...prev, assetTag: tag }));
  };

  // AI-powered categorization
  const handleAICategorizaton = async () => {
    if (!formData.name && !formData.description && !formData.brand && !formData.model) {
      return;
    }

    try {
      const result = await categorizeAsset(formData);
      setAiSuggestions(result);
      
      // Auto-apply if confidence is high
      if (result.confidence > 0.8) {
        setFormData(prev => ({
          ...prev,
          category: result.category,
          ...result.suggestedFields
        }));
      }
    } catch (error) {
      console.warn('AI categorization failed:', error);
    }
  };

  // Run AI categorization when relevant fields change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleAICategorizaton();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData.name, formData.description, formData.brand, formData.model]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Asset name is required';
    }

    if (!formData.assetTag.trim()) {
      newErrors.assetTag = 'Asset tag is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (formData.purchasePrice && isNaN(Number(formData.purchasePrice))) {
      newErrors.purchasePrice = 'Purchase price must be a valid number';
    }

    if (formData.purchaseDate && new Date(formData.purchaseDate) > new Date()) {
      newErrors.purchaseDate = 'Purchase date cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    clearError();

    try {
      const assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'> = {
        ...formData,
        purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : undefined
      };

      let result: Asset;
      
      if (mode === 'edit' && asset?.id) {
        result = await updateAsset(asset.id, assetData);
      } else {
        result = await createAsset(assetData);
      }

      onSubmit?.(result);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const statusOptions = [
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_MAINTENANCE', label: 'In Maintenance' },
    { value: 'RETIRED', label: 'Retired' }
  ];

  const conditionOptions = [
    { value: 'EXCELLENT', label: 'Excellent' },
    { value: 'GOOD', label: 'Good' },
    { value: 'FAIR', label: 'Fair' },
    { value: 'POOR', label: 'Poor' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">
          {mode === 'edit' ? 'Edit Asset' : 'Create New Asset'}
        </h2>
        <p className="text-slate-600 mt-2">
          {mode === 'edit' ? 'Update asset information' : 'Add a new asset to your inventory'}
        </p>
      </div>

      {/* AI Suggestions */}
      {aiSuggestions && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <h3 className="font-semibold text-blue-900 mb-2">🤖 AI Suggestions</h3>
          <p className="text-blue-800">
            Suggested category: <strong>{aiSuggestions.category}</strong> 
            <span className="text-sm ml-2">({Math.round(aiSuggestions.confidence * 100)}% confidence)</span>
          </p>
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Asset Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="MacBook Pro 16-inch"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Asset Tag *
            </label>
            <div className="flex">
              <input
                type="text"
                name="assetTag"
                value={formData.assetTag}
                onChange={handleChange}
                className={`flex-1 px-4 py-3 border rounded-l-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.assetTag ? 'border-red-300' : 'border-slate-300'
                }`}
                placeholder="AST-001234"
              />
              <ExecutiveButton
                type="button"
                variant="secondary"
                size="medium"
                onClick={generateAssetTag}
                className="rounded-l-none border-l-0"
              >
                Generate
              </ExecutiveButton>
            </div>
            {errors.assetTag && <p className="text-red-500 text-sm mt-1">{errors.assetTag}</p>}
          </div>
        </div>

        {/* Category and Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.category ? 'border-red-300' : 'border-slate-300'
              }`}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Condition
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {conditionOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Asset Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Brand
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Apple"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Model
            </label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="MacBook Pro 16-inch 2024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Serial Number
            </label>
            <input
              type="text"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="C02XY1234567"
            />
          </div>
        </div>

        {/* Assignment and Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Assigned To
            </label>
            <input
              type="text"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Office 2A, Building 1"
            />
          </div>
        </div>

        {/* Financial Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Purchase Price
            </label>
            <input
              type="number"
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.purchasePrice ? 'border-red-300' : 'border-slate-300'
              }`}
              placeholder="2999.99"
            />
            {errors.purchasePrice && <p className="text-red-500 text-sm mt-1">{errors.purchasePrice}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Purchase Date
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.purchaseDate ? 'border-red-300' : 'border-slate-300'
              }`}
            />
            {errors.purchaseDate && <p className="text-red-500 text-sm mt-1">{errors.purchaseDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Warranty Expiry
            </label>
            <input
              type="date"
              name="warrantyExpiry"
              value={formData.warrantyExpiry}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Additional details about this asset..."
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Internal notes, maintenance history, etc."
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6">
          <ExecutiveButton
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </ExecutiveButton>
          
          <ExecutiveButton
            type="submit"
            variant="primary"
            loading={submitting || loading}
            disabled={submitting || loading}
          >
            {mode === 'edit' ? 'Update Asset' : 'Create Asset'}
          </ExecutiveButton>
        </div>
      </form>
    </motion.div>
  );
};

export default AssetForm;
