import React, { useState, useEffect } from 'react';
import { assetService } from '../../services/assetService.js';
import { categoryService } from '../../services/categoryService.js';

export const AssetForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    assetTag: '',
    description: '',
    brand: '',
    model: '',
    serialNumber: '',
    purchasePrice: '',
    purchaseDate: '',
    vendor: '',
    location: '',
    status: 'AVAILABLE',
    condition: 'GOOD',
    warrantyExpiry: '',
    nextMaintenance: '',
    notes: '',
    categoryId: ''
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const statusOptions = [
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_MAINTENANCE', label: 'In Maintenance' },
    { value: 'RETIRED', label: 'Retired' },
    { value: 'LOST', label: 'Lost' },
    { value: 'DAMAGED', label: 'Damaged' }
  ];

  const conditionOptions = [
    { value: 'EXCELLENT', label: 'Excellent' },
    { value: 'GOOD', label: 'Good' },
    { value: 'FAIR', label: 'Fair' },
    { value: 'POOR', label: 'Poor' },
    { value: 'BROKEN', label: 'Broken' }
  ];

  useEffect(() => {
    // Load categories
    const loadCategories = async () => {
      try {
        const categoriesData = await categoryService.getActive();
        setCategories(categoriesData);
        
        // Set default category if available
        // Set default category if not yet chosen
        setFormData(prev => {
          if (categoriesData.length > 0 && !prev.categoryId) {
            return { ...prev, categoryId: categoriesData[0].id };
          }
          return prev;
        });
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    loadCategories();

    // Set initial data if editing
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        assetTag: initialData.assetTag || '',
        description: initialData.description || '',
        brand: initialData.brand || '',
        model: initialData.model || '',
        serialNumber: initialData.serialNumber || '',
        purchasePrice: initialData.purchasePrice || '',
        purchaseDate: initialData.purchaseDate || '',
        vendor: initialData.vendor || '',
        location: initialData.location || '',
        status: initialData.status || 'AVAILABLE',
        condition: initialData.condition || 'GOOD',
        warrantyExpiry: initialData.warrantyExpiry || '',
        nextMaintenance: initialData.nextMaintenance || '',
        notes: initialData.notes || '',
        categoryId: initialData.category?.id || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const generateAssetTag = () => {
    const prefix = formData.name ? formData.name.substring(0, 3).toUpperCase() : 'AST';
    const timestamp = Date.now().toString().slice(-6);
    const assetTag = `${prefix}-${timestamp}`;
    setFormData(prev => ({ ...prev, assetTag }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Asset name is required';
    }

    if (!formData.assetTag.trim()) {
      newErrors.assetTag = 'Asset tag is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (formData.purchasePrice && isNaN(formData.purchasePrice)) {
      newErrors.purchasePrice = 'Purchase price must be a valid number';
    }

    if (formData.purchasePrice && parseFloat(formData.purchasePrice) < 0) {
      newErrors.purchasePrice = 'Purchase price cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Format data for API
      const assetData = {
        ...formData,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
        purchaseDate: formData.purchaseDate || null,
        warrantyExpiry: formData.warrantyExpiry || null,
        nextMaintenance: formData.nextMaintenance || null
      };

      let result;
      if (initialData) {
        // Update existing asset
        result = await assetService.update(initialData.id, assetData);
      } else {
        // Create new asset
        result = await assetService.create(assetData);
      }

      onSubmit?.(result);
    } catch (error) {
      console.error('Failed to save asset:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Failed to save asset. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="asset-form-container">
      <form onSubmit={handleSubmit} className="asset-form">
        <div className="form-header">
          <h2>{initialData ? 'Edit Asset' : 'Add New Asset'}</h2>
          <button 
            type="button" 
            onClick={onCancel}
            className="close-button"
          >
            ×
          </button>
        </div>

        {errors.submit && (
          <div className="error-message">
            {errors.submit}
          </div>
        )}

        <div className="form-grid">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-field">
              <label htmlFor="name">Asset Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="e.g., MacBook Pro 13-inch"
                required
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="assetTag">Asset Tag *</label>
              <div className="input-group">
                <input
                  type="text"
                  id="assetTag"
                  name="assetTag"
                  value={formData.assetTag}
                  onChange={handleChange}
                  className={errors.assetTag ? 'error' : ''}
                  placeholder="e.g., MAC-001234"
                  required
                />
                <button 
                  type="button" 
                  onClick={generateAssetTag}
                  className="generate-btn"
                  title="Generate asset tag"
                >
                  Generate
                </button>
              </div>
              {errors.assetTag && <span className="field-error">{errors.assetTag}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="categoryId">Category *</label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={errors.categoryId ? 'error' : ''}
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <span className="field-error">{errors.categoryId}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the asset..."
                rows={3}
              />
            </div>
          </div>

          {/* Technical Details */}
          <div className="form-section">
            <h3>Technical Details</h3>
            
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="brand">Brand</label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g., Apple, Dell, HP"
                />
              </div>

              <div className="form-field">
                <label htmlFor="model">Model</label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g., MacBook Pro M2"
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="serialNumber">Serial Number</label>
              <input
                type="text"
                id="serialNumber"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                placeholder="Device serial number"
              />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="condition">Condition</label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                >
                  {conditionOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Purchase Information */}
          <div className="form-section">
            <h3>Purchase Information</h3>
            
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="purchasePrice">Purchase Price</label>
                <input
                  type="number"
                  id="purchasePrice"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  className={errors.purchasePrice ? 'error' : ''}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                {errors.purchasePrice && <span className="field-error">{errors.purchasePrice}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="purchaseDate">Purchase Date</label>
                <input
                  type="date"
                  id="purchaseDate"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="vendor">Vendor</label>
                <input
                  type="text"
                  id="vendor"
                  name="vendor"
                  value={formData.vendor}
                  onChange={handleChange}
                  placeholder="Purchase vendor/supplier"
                />
              </div>

              <div className="form-field">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Office Floor 2, Warehouse A"
                />
              </div>
            </div>
          </div>

          {/* Maintenance & Warranty */}
          <div className="form-section">
            <h3>Maintenance & Warranty</h3>
            
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="warrantyExpiry">Warranty Expiry</label>
                <input
                  type="date"
                  id="warrantyExpiry"
                  name="warrantyExpiry"
                  value={formData.warrantyExpiry}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label htmlFor="nextMaintenance">Next Maintenance</label>
                <input
                  type="date"
                  id="nextMaintenance"
                  name="nextMaintenance"
                  value={formData.nextMaintenance}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes, special instructions, etc."
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancel}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (initialData ? 'Update Asset' : 'Create Asset')}
          </button>
        </div>
      </form>
    </div>
  );
};
