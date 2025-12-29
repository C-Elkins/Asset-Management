import React, { useState } from 'react';
import { Check, ChevronRight, Building2, Package, Wrench, Truck, Heart, GraduationCap, Sparkles, Plus, X } from 'lucide-react';
import { BusinessProfileInput, CategoryInput } from '../types/api';

interface SetupWizardProps {
  isOpen: boolean;
  onComplete: () => void;
}

interface BusinessTypeOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  categories: Omit<CategoryInput, 'active'>[];
}

const businessTypes: BusinessTypeOption[] = [
  {
    id: 'it-tech',
    name: 'IT / Technology',
    icon: <Package size={32} />,
    description: 'Software companies, IT departments, tech startups',
    categories: [
      { name: 'Computers', description: 'Desktop and laptop computers', icon: '💻', color_code: '#3B82F6' },
      { name: 'Monitors', description: 'Displays and screens', icon: '🖥️', color_code: '#10B981' },
      { name: 'Peripherals', description: 'Keyboards, mice, accessories', icon: '⌨️', color_code: '#8B5CF6' },
      { name: 'Network Equipment', description: 'Routers, switches, cables', icon: '🌐', color_code: '#F59E0B' },
      { name: 'Software Licenses', description: 'Software and subscriptions', icon: '🔑', color_code: '#EF4444' },
    ],
  },
  {
    id: 'auto-dealership',
    name: 'Auto Dealership',
    icon: <Truck size={32} />,
    description: 'Car dealerships, auto sales, vehicle management',
    categories: [
      { name: 'Vehicles', description: 'Cars, trucks, inventory', icon: '🚗', color_code: '#EF4444' },
      { name: 'Parts', description: 'Auto parts and components', icon: '⚙️', color_code: '#3B82F6' },
      { name: 'Service Tools', description: 'Diagnostic and repair tools', icon: '🔧', color_code: '#10B981' },
      { name: 'Office Equipment', description: 'Computers, printers, phones', icon: '🖨️', color_code: '#8B5CF6' },
    ],
  },
  {
    id: 'warehouse',
    name: 'Warehouse / Distribution',
    icon: <Building2 size={32} />,
    description: 'Warehouses, distribution centers, logistics',
    categories: [
      { name: 'Inventory Products', description: 'Stock and products', icon: '📦', color_code: '#F59E0B' },
      { name: 'Equipment', description: 'Forklifts, pallet jacks', icon: '🏗️', color_code: '#EF4444' },
      { name: 'Safety Gear', description: 'PPE and safety equipment', icon: '🦺', color_code: '#10B981' },
      { name: 'Shipping Supplies', description: 'Boxes, tape, packaging', icon: '📮', color_code: '#3B82F6' },
    ],
  },
  {
    id: 'construction',
    name: 'Construction',
    icon: <Wrench size={32} />,
    description: 'Construction companies, contractors, builders',
    categories: [
      { name: 'Power Tools', description: 'Drills, saws, equipment', icon: '🔨', color_code: '#F59E0B' },
      { name: 'Heavy Equipment', description: 'Excavators, loaders', icon: '🚜', color_code: '#EF4444' },
      { name: 'Safety Equipment', description: 'Helmets, vests, harnesses', icon: '🦺', color_code: '#10B981' },
      { name: 'Materials', description: 'Lumber, steel, supplies', icon: '🧱', color_code: '#8B5CF6' },
    ],
  },
  {
    id: 'healthcare',
    name: 'Healthcare / Medical',
    icon: <Heart size={32} />,
    description: 'Hospitals, clinics, medical facilities',
    categories: [
      { name: 'Medical Equipment', description: 'Diagnostic devices, monitors', icon: '🏥', color_code: '#EF4444' },
      { name: 'Surgical Instruments', description: 'Tools and instruments', icon: '💉', color_code: '#3B82F6' },
      { name: 'Office Equipment', description: 'Computers, printers', icon: '🖥️', color_code: '#10B981' },
      { name: 'Furniture', description: 'Beds, chairs, tables', icon: '🛏️', color_code: '#8B5CF6' },
    ],
  },
  {
    id: 'education',
    name: 'Education',
    icon: <GraduationCap size={32} />,
    description: 'Schools, universities, training centers',
    categories: [
      { name: 'Computers', description: 'Lab computers and devices', icon: '💻', color_code: '#3B82F6' },
      { name: 'Projectors', description: 'Displays and AV equipment', icon: '📽️', color_code: '#10B981' },
      { name: 'Furniture', description: 'Desks, chairs, lockers', icon: '🪑', color_code: '#F59E0B' },
      { name: 'Lab Equipment', description: 'Science and research tools', icon: '🔬', color_code: '#8B5CF6' },
    ],
  },
  {
    id: 'custom',
    name: 'Custom / Other',
    icon: <Sparkles size={32} />,
    description: 'Start with a blank slate',
    categories: [],
  },
];

export const SetupWizard: React.FC<SetupWizardProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessTypeOption | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(new Set());
  const [businessProfile, setBusinessProfile] = useState<BusinessProfileInput>({
    company_name: '',
    business_type: '',
    default_location: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom category creation
  const [customCategories, setCustomCategories] = useState<CategoryInput[]>([]);
  const [showCustomCategoryForm, setShowCustomCategoryForm] = useState(false);
  const [customCategoryForm, setCustomCategoryForm] = useState<CategoryInput>({
    name: '',
    description: '',
    icon: '📦',
    color_code: '#10b981',
  });

  if (!isOpen) return null;

  const handleBusinessTypeSelect = (type: BusinessTypeOption) => {
    setSelectedBusinessType(type);
    // Pre-select all categories for this business type
    setSelectedCategories(new Set(type.categories.map((_, index) => index)));
    setBusinessProfile({ ...businessProfile, business_type: type.id });
    setStep(2);
  };

  const toggleCategory = (index: number) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedCategories(newSelected);
  };

  const handleAddCustomCategory = () => {
    if (!customCategoryForm.name) return;

    setCustomCategories([...customCategories, { ...customCategoryForm }]);
    setCustomCategoryForm({ name: '', description: '', icon: '📦', color_code: '#10b981' });
    setShowCustomCategoryForm(false);
  };

  const handleRemoveCustomCategory = (index: number) => {
    setCustomCategories(customCategories.filter((_, i) => i !== index));
  };

  const handleComplete = async () => {
    if (!selectedBusinessType) return;

    setIsSubmitting(true);
    try {
      // Get ALL categories (including inactive) to properly handle re-runs
      const allExistingCategories = await window.api.getAllCategories();
      const existingNames = new Map(allExistingCategories.map(c => [c.name.toLowerCase(), c]));

      // Collect all selected category names
      const selectedPredefinedCategories = selectedBusinessType.categories.filter((_, index) =>
        selectedCategories.has(index)
      );
      const allSelectedCategories = [...selectedPredefinedCategories, ...customCategories];
      const selectedCategoryIds: number[] = [];

      // Process each selected category
      for (const category of allSelectedCategories) {
        const nameLower = category.name.toLowerCase();
        const existing = existingNames.get(nameLower);

        if (existing) {
          // Category exists - reactivate if inactive
          if (existing.active === 0) {
            try {
              await window.api.reactivateCategory(existing.id);
              console.log(`Reactivated category: ${category.name}`);
            } catch (error) {
              console.error(`Failed to reactivate category ${category.name}:`, error);
            }
          }
          selectedCategoryIds.push(existing.id);
        } else {
          // Category doesn't exist - create it
          try {
            const created = await window.api.createCategory(category);
            selectedCategoryIds.push(created.id);
            console.log(`Created new category: ${category.name}`);
          } catch (error) {
            console.error(`Failed to create category ${category.name}:`, error);
          }
        }
      }

      // Deactivate all categories that weren't selected
      const allCategoryIds = allExistingCategories.map(c => c.id);
      const unselectedIds = allCategoryIds.filter(id => !selectedCategoryIds.includes(id));

      for (const categoryId of unselectedIds) {
        try {
          await window.api.deleteCategory(categoryId);
          const cat = allExistingCategories.find(c => c.id === categoryId);
          console.log(`Deactivated category: ${cat?.name || categoryId}`);
        } catch (error) {
          console.error(`Failed to deactivate category ${categoryId}:`, error);
        }
      }

      // Update business profile
      await window.api.updateBusinessProfile({
        ...businessProfile,
        setup_completed: 1,
      });

      onComplete();
    } catch (error) {
      console.error('Setup failed:', error);
      alert('Setup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-6 text-white">
          <h1 className="text-3xl font-bold">Welcome to Krubles</h1>
          <p className="text-emerald-100 mt-2">Let's set up your asset management system</p>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mt-6">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? 'bg-white text-emerald-600'
                      : 'bg-emerald-500 text-white opacity-50'
                  }`}
                >
                  {step > s ? <Check size={20} /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      step > s ? 'bg-white' : 'bg-emerald-500 opacity-50'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-250px)]">
          {/* Step 1: Business Type */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Business Type</h2>
              <p className="text-gray-600 mb-6">
                We'll pre-configure categories and settings optimized for your industry
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businessTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleBusinessTypeSelect(type)}
                    className="p-6 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-emerald-600 group-hover:scale-110 transition-transform">
                        {type.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{type.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                        {type.categories.length > 0 && (
                          <p className="text-xs text-emerald-600 mt-2">
                            {type.categories.length} pre-configured categories
                          </p>
                        )}
                      </div>
                      <ChevronRight className="text-gray-400 group-hover:text-emerald-600" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Review Categories */}
          {step === 2 && selectedBusinessType && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Categories</h2>
                <p className="text-gray-600 mb-6">
                  Select which categories you want to include, or add your own custom categories.
                </p>
              </div>

              {/* Pre-defined categories */}
              {selectedBusinessType.categories.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">{selectedBusinessType.name} Categories</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedBusinessType.categories.map((category, index) => (
                      <div
                        key={index}
                        onClick={() => toggleCategory(index)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedCategories.has(index)
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedCategories.has(index)}
                            onChange={() => toggleCategory(index)}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                            style={{ backgroundColor: category.color_code }}
                          >
                            {category.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{category.name}</h4>
                            <p className="text-xs text-gray-600">{category.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom categories list */}
              {customCategories.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Custom Categories</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {customCategories.map((category, index) => (
                      <div
                        key={`custom-${index}`}
                        className="flex items-center gap-3 p-3 border-2 rounded-lg border-emerald-500 bg-emerald-50"
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                          style={{ backgroundColor: category.color_code }}
                        >
                          {category.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900">{category.name}</div>
                          {category.description && (
                            <div className="text-sm text-gray-500 truncate">{category.description}</div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomCategory(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Remove category"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add custom category button/form */}
              {!showCustomCategoryForm ? (
                <button
                  type="button"
                  onClick={() => setShowCustomCategoryForm(true)}
                  className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <Plus size={20} />
                  Add Custom Category
                </button>
              ) : (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Add Custom Category</h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customCategoryForm.name}
                        onChange={(e) => setCustomCategoryForm({ ...customCategoryForm, name: e.target.value })}
                        placeholder="e.g., Vehicles, Equipment, Furniture"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={customCategoryForm.description}
                        onChange={(e) => setCustomCategoryForm({ ...customCategoryForm, description: e.target.value })}
                        placeholder="Brief description"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Icon (Emoji)
                        </label>
                        <input
                          type="text"
                          value={customCategoryForm.icon}
                          onChange={(e) => setCustomCategoryForm({ ...customCategoryForm, icon: e.target.value })}
                          placeholder="📦"
                          maxLength={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Color
                        </label>
                        <input
                          type="color"
                          value={customCategoryForm.color_code}
                          onChange={(e) => setCustomCategoryForm({ ...customCategoryForm, color_code: e.target.value })}
                          className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAddCustomCategory}
                        disabled={!customCategoryForm.name}
                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Category
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomCategoryForm(false);
                          setCustomCategoryForm({ name: '', description: '', icon: '📦', color_code: '#10b981' });
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Business Profile */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Information</h2>
              <p className="text-gray-600 mb-6">
                Tell us about your organization (you can update this later)
              </p>

              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessProfile.company_name || ''}
                    onChange={(e) =>
                      setBusinessProfile({ ...businessProfile, company_name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Acme Corporation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Location
                  </label>
                  <input
                    type="text"
                    value={businessProfile.default_location || ''}
                    onChange={(e) =>
                      setBusinessProfile({ ...businessProfile, default_location: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Headquarters, Building A, etc."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Summary */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">You're All Set!</h2>
              <p className="text-gray-600 mb-6">Review your setup and click finish to get started</p>

              <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Business Type</h3>
                  <p className="text-gray-600">{selectedBusinessType?.name}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Company Name</h3>
                  <p className="text-gray-600">{businessProfile.company_name || 'Not set'}</p>
                </div>

                {selectedBusinessType && selectedBusinessType.categories.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Categories ({selectedCategories.size})</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedBusinessType.categories
                        .filter((_, index) => selectedCategories.has(index))
                        .map((category, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 rounded-full text-sm font-medium"
                            style={{
                              backgroundColor: category.color_code + '20',
                              color: category.color_code,
                            }}
                          >
                            {category.icon} {category.name}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
          {step > 1 && step < 4 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 3 && !businessProfile.company_name}
              className="ml-auto px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Continue
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={isSubmitting}
              className="ml-auto px-8 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-semibold"
            >
              {isSubmitting ? 'Setting up...' : 'Finish Setup'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
