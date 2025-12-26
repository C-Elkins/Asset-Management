import React, { useState, useEffect } from 'react';
import { Category, CategoryInput, CustomFieldDefinition, CustomFieldInput } from '../types/api';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryChange: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ isOpen, onClose, onCategoryChange }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<CategoryInput>({
    name: '',
    description: '',
    icon: '',
    color_code: '#667eea',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [showCustomFields, setShowCustomFields] = useState(false);
  const [customFieldForm, setCustomFieldForm] = useState<CustomFieldInput>({
    category_id: 0,
    field_name: '',
    field_label: '',
    field_type: 'text',
    required: 0,
    options: '',
    sort_order: 0,
  });
  const [editingFieldId, setEditingFieldId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      const data = await window.api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingId) {
        await window.api.updateCategory(editingId, formData);
      } else {
        await window.api.createCategory(formData);
      }

      setFormData({ name: '', description: '', icon: '', color_code: '#667eea' });
      setEditingId(null);
      await loadCategories();
      onCategoryChange();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Failed to save category. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      color_code: category.color_code || '#667eea',
    });
    setShowCustomFields(true);
    await loadCustomFields(category.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await window.api.deleteCategory(id);
      await loadCategories();
      onCategoryChange();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category. Please try again.');
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '', icon: '', color_code: '#667eea' });
    setEditingId(null);
    setShowCustomFields(false);
    setCustomFields([]);
    setCustomFieldForm({
      category_id: 0,
      field_name: '',
      field_label: '',
      field_type: 'text',
      required: 0,
      options: '',
      sort_order: 0,
    });
    setEditingFieldId(null);
  };

  const loadCustomFields = async (categoryId: number) => {
    try {
      const fields = await window.api.getCustomFields(categoryId);
      setCustomFields(fields);
    } catch (error) {
      console.error('Failed to load custom fields:', error);
    }
  };

  const handleCustomFieldSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      const fieldData = {
        ...customFieldForm,
        category_id: editingId,
        sort_order: customFields.length,
      };

      if (editingFieldId) {
        await window.api.updateCustomField(editingFieldId, fieldData);
      } else {
        await window.api.createCustomField(fieldData);
      }

      setCustomFieldForm({
        category_id: editingId,
        field_name: '',
        field_label: '',
        field_type: 'text',
        required: 0,
        options: '',
        sort_order: 0,
      });
      setEditingFieldId(null);
      await loadCustomFields(editingId);
    } catch (error) {
      console.error('Failed to save custom field:', error);
      alert('Failed to save custom field. Please try again.');
    }
  };

  const handleEditCustomField = (field: CustomFieldDefinition) => {
    setEditingFieldId(field.id);
    setCustomFieldForm({
      category_id: field.category_id,
      field_name: field.field_name,
      field_label: field.field_label,
      field_type: field.field_type,
      required: field.required,
      options: field.options || '',
      sort_order: field.sort_order,
    });
  };

  const handleDeleteCustomField = async (id: number) => {
    if (!confirm('Are you sure you want to delete this custom field?')) {
      return;
    }

    try {
      await window.api.deleteCustomField(id);
      if (editingId) {
        await loadCustomFields(editingId);
      }
    } catch (error) {
      console.error('Failed to delete custom field:', error);
      alert('Failed to delete custom field. Please try again.');
    }
  };

  const handleCancelCustomField = () => {
    setEditingFieldId(null);
    setCustomFieldForm({
      category_id: editingId || 0,
      field_name: '',
      field_label: '',
      field_type: 'text',
      required: 0,
      options: '',
      sort_order: 0,
    });
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

  const selectAll = () => {
    setSelectedIds(new Set(categories.map(c => c.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedIds.size} categories?`)) {
      return;
    }

    try {
      await Promise.all(
        Array.from(selectedIds).map(id => window.api.deleteCategory(id))
      );
      setSelectedIds(new Set());
      await loadCategories();
      onCategoryChange();
    } catch (error) {
      console.error('Failed to delete categories:', error);
      alert('Failed to delete some categories. Please try again.');
    }
  };

  const handleExportCSV = () => {
    const selectedCategories = selectedIds.size > 0
      ? categories.filter(c => selectedIds.has(c.id))
      : categories;

    const csv = [
      ['Name', 'Description', 'Icon', 'Color', 'Type'].join(','),
      ...selectedCategories.map(c => [
        `"${c.name}"`,
        `"${c.description || ''}"`,
        `"${c.icon || ''}"`,
        `"${c.color_code || ''}"`,
        `"${c.category_type || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `categories-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Manage Categories</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingId ? 'Edit Category' : 'Add New Category'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-1">
                    Icon (emoji or text)
                  </label>
                  <input
                    type="text"
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="💻 or 🔧"
                  />
                </div>

                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="color"
                      value={formData.color_code}
                      onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                      className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color_code}
                      onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              {/* Custom Fields Section */}
              {editingId && showCustomFields && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Fields</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Define custom fields that will appear when creating or editing assets in this category.
                  </p>

                  {/* Custom Field Form */}
                  <form onSubmit={handleCustomFieldSubmit} className="space-y-3 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Field Name (internal) *
                        </label>
                        <input
                          type="text"
                          value={customFieldForm.field_name}
                          onChange={(e) => setCustomFieldForm({ ...customFieldForm, field_name: e.target.value })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="e.g., vin_number"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Field Label (display) *
                        </label>
                        <input
                          type="text"
                          value={customFieldForm.field_label}
                          onChange={(e) => setCustomFieldForm({ ...customFieldForm, field_label: e.target.value })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="e.g., VIN Number"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Field Type *
                        </label>
                        <select
                          value={customFieldForm.field_type}
                          onChange={(e) => setCustomFieldForm({ ...customFieldForm, field_type: e.target.value as any })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="dropdown">Dropdown</option>
                          <option value="checkbox">Checkbox</option>
                          <option value="textarea">Text Area</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Required
                        </label>
                        <select
                          value={customFieldForm.required}
                          onChange={(e) => setCustomFieldForm({ ...customFieldForm, required: parseInt(e.target.value) })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="0">No</option>
                          <option value="1">Yes</option>
                        </select>
                      </div>
                    </div>

                    {customFieldForm.field_type === 'dropdown' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Options (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={customFieldForm.options}
                          onChange={(e) => setCustomFieldForm({ ...customFieldForm, options: e.target.value })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="e.g., Option 1, Option 2, Option 3"
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
                      >
                        {editingFieldId ? 'Update Field' : 'Add Field'}
                      </button>
                      {editingFieldId && (
                        <button
                          type="button"
                          onClick={handleCancelCustomField}
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Custom Fields List */}
                  <div className="space-y-2">
                    {customFields.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">No custom fields yet. Add one above!</p>
                    ) : (
                      customFields.map((field) => (
                        <div
                          key={field.id}
                          className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded text-sm"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {field.field_label}
                              {field.required === 1 && <span className="text-red-500 ml-1">*</span>}
                            </div>
                            <div className="text-xs text-gray-500">
                              {field.field_name} • {field.field_type}
                              {field.options && ` • ${field.options}`}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditCustomField(field)}
                              className="px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50 rounded"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCustomField(field.id)}
                              className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Category List */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Existing Categories</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Bulk Actions Toolbar */}
              {selectedIds.size > 0 && (
                <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
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
                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete Selected
                    </button>
                  </div>
                </div>
              )}

              {/* Select All Checkbox */}
              {categories.length > 0 && (
                <div className="mb-2 pb-2 border-b border-gray-200">
                  <label className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={categories.length > 0 && selectedIds.size === categories.length}
                      onChange={(e) => e.target.checked ? selectAll() : deselectAll()}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Select All</span>
                  </label>
                </div>
              )}

              <div className="space-y-2">
                {categories.length === 0 ? (
                  <p className="text-gray-500 text-sm">No categories yet. Create one to get started!</p>
                ) : (
                  categories.map((category) => (
                    <div
                      key={category.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 ${
                        selectedIds.has(category.id) ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(category.id)}
                        onChange={() => toggleSelection(category.id)}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl"
                        style={{ backgroundColor: category.color_code || '#667eea' }}
                      >
                        {category.icon || '📁'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{category.name}</h4>
                        {category.description && (
                          <p className="text-sm text-gray-500 truncate">{category.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(category)}
                          className="px-3 py-1 text-sm text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'} total
            {selectedIds.size > 0 && ` • ${selectedIds.size} selected`}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
