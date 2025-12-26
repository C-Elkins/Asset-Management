import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Brain,
  Calendar,
  CheckCircle2,
  DollarSign,
  Loader2,
  MapPin,
  Package,
  Save,
  Sparkles,
  Tag,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import { aiService } from "../../services/aiService.js";
import { categoryService } from "../../services/categoryService.js";
import { useToast } from "../common/Toast.jsx";

export const SmartAssetForm = ({ onSubmit, onCancel, initialData = null }) => {
  const { addToast } = useToast();

  // Wrapper function for easier toast usage
  const showToast = (message, type = "info") => {
    addToast({ message, type });
  };

  const [formData, setFormData] = useState({
    name: "",
    assetTag: "",
    description: "",
    brand: "",
    model: "",
    serialNumber: "",
    purchasePrice: "",
    purchaseDate: "",
    vendor: "",
    location: "",
    status: "AVAILABLE",
    condition: "GOOD",
    warrantyExpiry: "",
    nextMaintenance: "",
    notes: "",
    categoryId: "",
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [errors, setErrors] = useState({});
  const [autoSaveStatus, setAutoSaveStatus] = useState(null); // 'saving', 'saved', 'error'

  // Auto-save draft to localStorage
  useEffect(() => {
    if (!initialData && (formData.name || formData.brand || formData.model)) {
      const timer = setTimeout(() => {
        try {
          localStorage.setItem("assetDraft", JSON.stringify(formData));
          setAutoSaveStatus("saved");
          setTimeout(() => setAutoSaveStatus(null), 2000);
        } catch (error) {
          console.error("Auto-save failed:", error);
          setAutoSaveStatus("error");
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [formData, initialData]);

  // Load draft on mount
  useEffect(() => {
    if (!initialData) {
      const draft = localStorage.getItem("assetDraft");
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft);
          // Ask user if they want to restore
          if (
            window.confirm("Found a saved draft. Would you like to restore it?")
          ) {
            setFormData(parsedDraft);
            showToast("Draft restored successfully", "success");
          } else {
            localStorage.removeItem("assetDraft");
          }
        } catch (error) {
          console.error("Failed to load draft:", error);
        }
      }
    }
  }, [initialData]);

  const statusOptions = [
    {
      value: "AVAILABLE",
      label: "✅ Available",
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      value: "ASSIGNED",
      label: "👤 Assigned",
      color: "bg-blue-100 text-blue-700",
    },
    {
      value: "IN_MAINTENANCE",
      label: "🔧 In Maintenance",
      color: "bg-amber-100 text-amber-700",
    },
    {
      value: "RETIRED",
      label: "📦 Retired",
      color: "bg-gray-100 text-gray-700",
    },
    { value: "LOST", label: "❌ Lost", color: "bg-red-100 text-red-700" },
    {
      value: "DAMAGED",
      label: "⚠️ Damaged",
      color: "bg-orange-100 text-orange-700",
    },
  ];

  const conditionOptions = [
    {
      value: "EXCELLENT",
      label: "⭐ Excellent",
      color: "bg-green-100 text-green-700",
    },
    { value: "GOOD", label: "✓ Good", color: "bg-blue-100 text-blue-700" },
    { value: "FAIR", label: "~ Fair", color: "bg-yellow-100 text-yellow-700" },
    { value: "POOR", label: "↓ Poor", color: "bg-orange-100 text-orange-700" },
    { value: "BROKEN", label: "✗ Broken", color: "bg-red-100 text-red-700" },
  ];

  useEffect(() => {
    loadCategories();
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        assetTag: initialData.assetTag || "",
        description: initialData.description || "",
        brand: initialData.brand || "",
        model: initialData.model || "",
        serialNumber: initialData.serialNumber || "",
        purchasePrice: initialData.purchasePrice || "",
        purchaseDate: initialData.purchaseDate || "",
        vendor: initialData.vendor || "",
        location: initialData.location || "",
        status: initialData.status || "AVAILABLE",
        condition: initialData.condition || "GOOD",
        warrantyExpiry: initialData.warrantyExpiry || "",
        nextMaintenance: initialData.nextMaintenance || "",
        notes: initialData.notes || "",
        categoryId: initialData.categoryId || "",
      });
    }
  }, [initialData]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.list();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  // AI Analysis - triggered when name, brand, or model changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        formData.name ||
        formData.brand ||
        formData.model ||
        formData.description
      ) {
        analyzeWithAI();
      }
    }, 600); // Reduced debounce for faster response

    return () => clearTimeout(timer);
  }, [formData.name, formData.brand, formData.model, formData.description]);

  const analyzeWithAI = async () => {
    setAnalyzing(true);
    try {
      const suggestions = await aiService.analyzeAsset({
        name: formData.name,
        brand: formData.brand,
        model: formData.model,
        description: formData.description,
      });

      setAiSuggestions(suggestions);

      // Auto-apply high-confidence suggestions (increased threshold)
      if (suggestions.confidence > 0.75) {
        const updates = {};

        // Suggest category
        if (suggestions.category && !formData.categoryId) {
          const matchingCategory = categories.find(
            (c) => c.name.toLowerCase() === suggestions.category.toLowerCase(),
          );
          if (matchingCategory) {
            updates.categoryId = matchingCategory.id;
          }
        }

        // Suggest brand if detected
        if (suggestions.brand && !formData.brand) {
          updates.brand = suggestions.brand;
        }

        // Suggest model if detected
        if (suggestions.model && !formData.model) {
          updates.model = suggestions.model;
        }

        // Suggest description
        if (suggestions.suggestions?.description && !formData.description) {
          updates.description = suggestions.suggestions.description;
        }

        // Suggest location based on category
        if (suggestions.suggestedLocation && !formData.location) {
          updates.location = suggestions.suggestedLocation;
        }

        // Suggest warranty period based on category
        if (
          suggestions.suggestedWarrantyMonths &&
          !formData.warrantyExpiry &&
          formData.purchaseDate
        ) {
          const purchaseDate = new Date(formData.purchaseDate);
          const warrantyDate = new Date(purchaseDate);
          warrantyDate.setMonth(
            warrantyDate.getMonth() + suggestions.suggestedWarrantyMonths,
          );
          updates.warrantyExpiry = warrantyDate.toISOString().split("T")[0];
        }

        if (Object.keys(updates).length > 0) {
          setFormData((prev) => ({ ...prev, ...updates }));
          showToast(
            `🤖 AI detected: ${suggestions.category || "asset details"}`,
            "success",
          );
        }
      }
    } catch (error) {
      console.error("AI analysis failed:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Asset name is required";
    if (!formData.categoryId) newErrors.categoryId = "Please select a category";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      // Clear draft on successful submission
      localStorage.removeItem("assetDraft");
      showToast("✅ Asset saved successfully!", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to save asset",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="smart-asset-form">
      {/* Auto-save status */}
      <AnimatePresence>
        {autoSaveStatus === "saved" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-800"
          >
            <CheckCircle2 className="w-4 h-4" />
            Draft auto-saved
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Status Banner */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-3"
          >
            <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
            <div>
              <p className="font-semibold text-purple-900">
                AI is analyzing your asset...
              </p>
              <p className="text-sm text-purple-700">
                Detecting brand, category, and generating suggestions
              </p>
            </div>
          </motion.div>
        )}

        {aiSuggestions && !analyzing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-5 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Brain className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-green-900">🎯 AI Insights</p>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                    {Math.round(aiSuggestions.confidence * 100)}% confident
                  </span>
                </div>
                <div className="space-y-2 text-sm text-green-800">
                  {aiSuggestions.category && (
                    <div className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
                      <Sparkles className="w-4 h-4 text-green-600" />
                      <span>
                        Detected Category:{" "}
                        <strong className="text-green-900">
                          {aiSuggestions.category}
                        </strong>
                      </span>
                    </div>
                  )}
                  {aiSuggestions.brand && (
                    <div className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span>
                        Brand:{" "}
                        <strong className="text-green-900">
                          {aiSuggestions.brand}
                        </strong>
                      </span>
                    </div>
                  )}
                  {aiSuggestions.model && (
                    <div className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
                      <Package className="w-4 h-4 text-green-600" />
                      <span>
                        Model:{" "}
                        <strong className="text-green-900">
                          {aiSuggestions.model}
                        </strong>
                      </span>
                    </div>
                  )}
                  {aiSuggestions.suggestedLocation && (
                    <div className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span>
                        Suggested Location:{" "}
                        <strong className="text-green-900">
                          {aiSuggestions.suggestedLocation}
                        </strong>
                      </span>
                    </div>
                  )}
                  {aiSuggestions.suggestions?.tags &&
                    aiSuggestions.suggestions.tags.length > 0 && (
                      <div className="flex items-start gap-2 p-2 bg-white/50 rounded-lg">
                        <Sparkles className="w-4 h-4 text-green-600 mt-0.5" />
                        <div className="flex flex-wrap gap-1">
                          {aiSuggestions.suggestions.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Asset Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Asset Name *
          </label>
          <div className="relative">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.name ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="e.g., MacBook Pro 16-inch, Toyota Camry, Hospital Bed"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Category *
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.categoryId ? "border-red-500" : "border-slate-300"
            }`}
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.categoryId}
            </p>
          )}
        </div>

        {/* Asset Tag */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Asset Tag
          </label>
          <input
            type="text"
            name="assetTag"
            value={formData.assetTag}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="e.g., ASSET-001"
          />
        </div>

        {/* Brand */}
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            Brand
            {aiSuggestions?.brand && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                AI Detected
              </span>
            )}
          </label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="e.g., Apple, Toyota, GE Healthcare"
          />
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Model
          </label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="e.g., 2024, Pro, XL"
          />
        </div>

        {/* Serial Number */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Serial Number
          </label>
          <input
            type="text"
            name="serialNumber"
            value={formData.serialNumber}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="e.g., SN123456789"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g., Building A - Floor 2"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Condition */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Condition
          </label>
          <select
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            {conditionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Purchase Price */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Purchase Price
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="number"
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>

        {/* Purchase Date */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Purchase Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Vendor */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Vendor/Supplier
          </label>
          <input
            type="text"
            name="vendor"
            value={formData.vendor}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="e.g., Amazon, Dealer Name"
          />
        </div>

        {/* Warranty Expiry */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Warranty Expiry
          </label>
          <input
            type="date"
            name="warrantyExpiry"
            value={formData.warrantyExpiry}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Next Maintenance */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Next Maintenance Date
          </label>
          <div className="relative">
            <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="date"
              name="nextMaintenance"
              value={formData.nextMaintenance}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            placeholder="Additional details about this asset..."
          />
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Internal Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            placeholder="Private notes for internal use..."
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-slate-200">
        <motion.button
          type="button"
          onClick={onCancel}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors font-medium"
        >
          Cancel
        </motion.button>
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Asset
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
};
