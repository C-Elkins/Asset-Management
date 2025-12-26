import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Package,
  Building2,
  Car,
  Stethoscope,
  GraduationCap,
  Factory,
  ShoppingBag,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { categoryService } from "../../services/categoryService.js";
import { useToast } from "../../components/common/Toast.jsx";

export const CategoryManagement = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    colorCode: "#6366f1",
    icon: "📦",
    active: true,
    sortOrder: 0,
  });

  // Industry Templates
  const industryTemplates = {
    it: {
      name: "Information Technology",
      icon: Building2,
      categories: [
        {
          name: "Laptops",
          description: "Portable computers and notebooks",
          icon: "💻",
          colorCode: "#3b82f6",
        },
        {
          name: "Desktops",
          description: "Desktop computers and workstations",
          icon: "🖥️",
          colorCode: "#6366f1",
        },
        {
          name: "Monitors",
          description: "Display screens and monitors",
          icon: "🖥️",
          colorCode: "#8b5cf6",
        },
        {
          name: "Servers",
          description: "Server hardware and equipment",
          icon: "🖲️",
          colorCode: "#a855f7",
        },
        {
          name: "Network Equipment",
          description: "Routers, switches, and network devices",
          icon: "🌐",
          colorCode: "#ec4899",
        },
        {
          name: "Mobile Devices",
          description: "Smartphones and tablets",
          icon: "📱",
          colorCode: "#f43f5e",
        },
        {
          name: "Printers",
          description: "Printers and scanners",
          icon: "🖨️",
          colorCode: "#ef4444",
        },
        {
          name: "Peripherals",
          description: "Keyboards, mice, and accessories",
          icon: "⌨️",
          colorCode: "#f97316",
        },
      ],
    },
    automotive: {
      name: "Automotive / Dealership",
      icon: Car,
      categories: [
        {
          name: "Vehicles",
          description: "Cars, trucks, and automobiles",
          icon: "🚗",
          colorCode: "#3b82f6",
        },
        {
          name: "Service Equipment",
          description: "Diagnostic tools and service equipment",
          icon: "🔧",
          colorCode: "#8b5cf6",
        },
        {
          name: "Parts Inventory",
          description: "Replacement parts and components",
          icon: "⚙️",
          colorCode: "#ec4899",
        },
        {
          name: "Office Equipment",
          description: "Computers and office supplies",
          icon: "💼",
          colorCode: "#f59e0b",
        },
        {
          name: "Safety Equipment",
          description: "Safety gear and protective equipment",
          icon: "🦺",
          colorCode: "#ef4444",
        },
        {
          name: "Showroom Displays",
          description: "Display vehicles and signage",
          icon: "🏢",
          colorCode: "#10b981",
        },
      ],
    },
    healthcare: {
      name: "Healthcare / Hospital",
      icon: Stethoscope,
      categories: [
        {
          name: "Medical Devices",
          description: "Diagnostic and treatment equipment",
          icon: "🩺",
          colorCode: "#06b6d4",
        },
        {
          name: "Patient Monitors",
          description: "Vital signs monitoring equipment",
          icon: "📊",
          colorCode: "#3b82f6",
        },
        {
          name: "Imaging Equipment",
          description: "X-ray, MRI, and CT scanners",
          icon: "🔬",
          colorCode: "#8b5cf6",
        },
        {
          name: "Surgical Instruments",
          description: "Operating room equipment",
          icon: "🔪",
          colorCode: "#ec4899",
        },
        {
          name: "Laboratory Equipment",
          description: "Lab testing and analysis tools",
          icon: "🧪",
          colorCode: "#f59e0b",
        },
        {
          name: "Hospital Beds",
          description: "Patient beds and furniture",
          icon: "🛏️",
          colorCode: "#10b981",
        },
        {
          name: "IT Equipment",
          description: "Computers and healthcare software",
          icon: "💻",
          colorCode: "#6366f1",
        },
        {
          name: "Wheelchairs & Mobility",
          description: "Patient mobility equipment",
          icon: "♿",
          colorCode: "#14b8a6",
        },
      ],
    },
    education: {
      name: "Education / School",
      icon: GraduationCap,
      categories: [
        {
          name: "Computers",
          description: "Student and staff computers",
          icon: "💻",
          colorCode: "#3b82f6",
        },
        {
          name: "Projectors",
          description: "Classroom projectors and displays",
          icon: "📽️",
          colorCode: "#8b5cf6",
        },
        {
          name: "Lab Equipment",
          description: "Science and computer lab equipment",
          icon: "🔬",
          colorCode: "#ec4899",
        },
        {
          name: "Furniture",
          description: "Desks, chairs, and classroom furniture",
          icon: "🪑",
          colorCode: "#f59e0b",
        },
        {
          name: "Sports Equipment",
          description: "Athletic and PE equipment",
          icon: "⚽",
          colorCode: "#10b981",
        },
        {
          name: "Musical Instruments",
          description: "Band and music class instruments",
          icon: "🎸",
          colorCode: "#f43f5e",
        },
        {
          name: "Library Resources",
          description: "Books and media equipment",
          icon: "📚",
          colorCode: "#6366f1",
        },
      ],
    },
    manufacturing: {
      name: "Manufacturing / Factory",
      icon: Factory,
      categories: [
        {
          name: "Production Machinery",
          description: "Manufacturing and assembly equipment",
          icon: "🏭",
          colorCode: "#3b82f6",
        },
        {
          name: "Tools",
          description: "Hand and power tools",
          icon: "🔧",
          colorCode: "#8b5cf6",
        },
        {
          name: "Forklifts",
          description: "Material handling equipment",
          icon: "🚜",
          colorCode: "#ec4899",
        },
        {
          name: "Safety Equipment",
          description: "PPE and safety gear",
          icon: "🦺",
          colorCode: "#ef4444",
        },
        {
          name: "Quality Control",
          description: "Testing and measurement equipment",
          icon: "📏",
          colorCode: "#f59e0b",
        },
        {
          name: "Conveyors",
          description: "Material transport systems",
          icon: "📦",
          colorCode: "#10b981",
        },
        {
          name: "IT Systems",
          description: "Production control computers",
          icon: "💻",
          colorCode: "#6366f1",
        },
      ],
    },
    retail: {
      name: "Retail / Store",
      icon: ShoppingBag,
      categories: [
        {
          name: "POS Systems",
          description: "Point of sale equipment",
          icon: "🛒",
          colorCode: "#3b82f6",
        },
        {
          name: "Display Fixtures",
          description: "Shelving and display units",
          icon: "🏪",
          colorCode: "#8b5cf6",
        },
        {
          name: "Security Systems",
          description: "Cameras and security equipment",
          icon: "📹",
          colorCode: "#ec4899",
        },
        {
          name: "Refrigeration",
          description: "Coolers and freezers",
          icon: "❄️",
          colorCode: "#06b6d4",
        },
        {
          name: "Office Equipment",
          description: "Back office computers and supplies",
          icon: "💼",
          colorCode: "#f59e0b",
        },
        {
          name: "Signage",
          description: "Store signs and displays",
          icon: "🪧",
          colorCode: "#10b981",
        },
      ],
    },
    maintenance: {
      name: "Maintenance / Facility",
      icon: Wrench,
      categories: [
        {
          name: "HVAC Equipment",
          description: "Heating and cooling systems",
          icon: "🌡️",
          colorCode: "#3b82f6",
        },
        {
          name: "Electrical Systems",
          description: "Electrical panels and generators",
          icon: "⚡",
          colorCode: "#f59e0b",
        },
        {
          name: "Plumbing Equipment",
          description: "Plumbing tools and systems",
          icon: "🚰",
          colorCode: "#06b6d4",
        },
        {
          name: "Tools",
          description: "Maintenance tools and equipment",
          icon: "🔧",
          colorCode: "#8b5cf6",
        },
        {
          name: "Vehicles",
          description: "Maintenance vehicles and carts",
          icon: "🚛",
          colorCode: "#ec4899",
        },
        {
          name: "Safety Equipment",
          description: "Safety gear and PPE",
          icon: "🦺",
          colorCode: "#ef4444",
        },
      ],
    },
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.list();
      setCategories(data);
    } catch (error) {
      showToast("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await categoryService.create(formData);
      showToast("Category created successfully", "success");
      resetForm();
      loadCategories();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to create category",
        "error",
      );
    }
  };

  const handleUpdate = async (id) => {
    try {
      await categoryService.update(id, formData);
      showToast("Category updated successfully", "success");
      setEditingId(null);
      resetForm();
      loadCategories();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to update category",
        "error",
      );
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this category? Assets using this category will be affected.",
      )
    ) {
      return;
    }
    try {
      await categoryService.delete(id);
      showToast("Category deleted successfully", "success");
      loadCategories();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to delete category",
        "error",
      );
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || "",
      colorCode: category.colorCode || "#6366f1",
      icon: category.icon || "📦",
      active: category.active,
      sortOrder: category.sortOrder || 0,
    });
  };

  const applyTemplate = async (template) => {
    try {
      setLoading(true);
      const createdCategories = [];

      for (const cat of template.categories) {
        const created = await categoryService.create({
          ...cat,
          active: true,
          sortOrder: createdCategories.length,
        });
        createdCategories.push(created);
      }

      showToast(
        `Applied ${template.name} template with ${createdCategories.length} categories`,
        "success",
      );
      setShowTemplates(false);
      loadCategories();
    } catch (error) {
      showToast("Failed to apply template", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      colorCode: "#6366f1",
      icon: "📦",
      active: true,
      sortOrder: 0,
    });
    setShowCreateForm(false);
  };

  return (
    <div className="category-management">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Category Management
          </h2>
          <p className="text-slate-600 mt-1">
            Customize asset categories for your organization
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowTemplates(true)}
            className="px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Industry Templates
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Category
          </motion.button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {categories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
            >
              {editingId === category.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="Category name"
                  />
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="Description"
                    rows="2"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) =>
                        setFormData({ ...formData, icon: e.target.value })
                      }
                      className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-center"
                      placeholder="📦"
                    />
                    <input
                      type="color"
                      value={formData.colorCode}
                      onChange={(e) =>
                        setFormData({ ...formData, colorCode: e.target.value })
                      }
                      className="w-20 h-10 border border-slate-300 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(category.id)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        resetForm();
                      }}
                      className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${category.colorCode}20` }}
                      >
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {category.name}
                        </h3>
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {category.description || "No description"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        category.active
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {category.active ? "Active" : "Inactive"}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(category)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Create Form Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Create New Category
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Laptops"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe this category..."
                    rows="3"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Icon
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) =>
                        setFormData({ ...formData, icon: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg text-center text-2xl"
                      placeholder="📦"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Color
                    </label>
                    <input
                      type="color"
                      value={formData.colorCode}
                      onChange={(e) =>
                        setFormData({ ...formData, colorCode: e.target.value })
                      }
                      className="w-full h-[42px] border border-slate-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreate}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Category
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Industry Templates Modal */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTemplates(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Industry Templates
              </h3>
              <p className="text-slate-600 mb-6">
                Quickly set up categories for your industry with pre-built
                templates
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(industryTemplates).map(([key, template]) => {
                  const Icon = template.icon;
                  return (
                    <motion.div
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-slate-200 hover:border-blue-400 cursor-pointer transition-all"
                      onClick={() => applyTemplate(template)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <h4 className="font-bold text-slate-900">
                          {template.name}
                        </h4>
                      </div>
                      <div className="text-sm text-slate-600 mb-3">
                        {template.categories.length} categories included:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {template.categories.slice(0, 6).map((cat, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-white rounded-lg text-slate-700 border border-slate-200"
                          >
                            {cat.icon} {cat.name}
                          </span>
                        ))}
                        {template.categories.length > 6 && (
                          <span className="text-xs px-2 py-1 text-slate-500">
                            +{template.categories.length - 6} more
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <button
                onClick={() => setShowTemplates(false)}
                className="mt-6 w-full px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && categories.length === 0 && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 mt-4">Loading categories...</p>
        </div>
      )}

      {!loading && categories.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-300">
          <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No Categories Yet
          </h3>
          <p className="text-slate-600 mb-6">
            Get started by creating categories or applying an industry template
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowTemplates(true)}
              className="px-6 py-3 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Browse Templates
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Category
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
