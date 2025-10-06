import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette,
  Type,
  Layout,
  Bell,
  Sun,
  Moon,
  Save,
  RotateCcw,
  Download,
  Upload,
  Eye,
  Sparkles,
  Settings,
  CheckCircle,
  ImageIcon,
  Layers,
  RefreshCw,
  X
} from 'lucide-react';
import { useToast } from '../components/common/Toast.jsx';
import { TooltipIcon } from '../components/common/Tooltip.jsx';
import { useSettingsStore } from '../store/settingsStore';

// Default customization settings
const getDefaultCustomization = () => ({
  branding: {
    companyName: 'Krubles Asset Management',
    primaryColor: '#10b981',
    secondaryColor: '#059669',
    accentColor: '#047857',
    logoUrl: '',
    logoFile: null // For uploaded logo files
  },
  terminology: {
    assets: 'Assets',
    maintenance: 'Maintenance',
    reports: 'Reports',
    reportSingular: 'Report',
    dashboard: 'Dashboard',
    assetSingular: 'Asset',
    maintenanceSingular: 'Maintenance Record'
  },
  layout: {
    showMetrics: true,
    showCharts: true,
    showRecentActivity: true,
    defaultAssetView: 'grid',
    compactMode: false
  },
  notifications: {
    lowStockThreshold: 10,
    maintenanceDueDays: 7,
    emailDigest: 'daily'
  },
  theme: {
    mode: 'light',
    fontSize: 'medium',
    spacing: 'comfortable'
  }
});

export function AdminCustomizationCenter() {
  const { addToast } = useToast();
  const { setDarkMode } = useSettingsStore();
  const [activeTab, setActiveTab] = useState('branding');
  const [customization, setCustomization] = useState(getDefaultCustomization());
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Load saved customization from localStorage
    try {
      const saved = localStorage.getItem('app_customization');
      if (saved) {
        setCustomization({ ...getDefaultCustomization(), ...JSON.parse(saved) });
      }
    } catch (err) {
      console.error('Failed to load customization:', err);
    }
  }, []);

  const tabs = [
    { id: 'branding', label: 'Branding & Colors', icon: Palette },
    { id: 'terminology', label: 'Terminology', icon: Type },
    { id: 'layout', label: 'Dashboard Layout', icon: Layout },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage (in production, this would be an API call)
      localStorage.setItem('app_customization', JSON.stringify(customization));
      
      // Apply dark mode immediately
      setDarkMode(customization.theme.mode === 'dark');
      
      addToast({ 
        type: 'success', 
        title: 'Customization Saved', 
        message: 'Your branding settings have been saved successfully.' 
      });

      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('customization-updated', { detail: customization }));
    } catch (err) {
      addToast({ 
        type: 'error', 
        title: 'Save Failed', 
        message: 'Failed to save customization settings.' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all customization to defaults? This cannot be undone.')) {
      setCustomization(getDefaultCustomization());
      localStorage.removeItem('app_customization');
      addToast({ 
        type: 'info', 
        title: 'Reset Complete', 
        message: 'All customization has been reset to defaults.' 
      });
    }
  };

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(customization, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `customization-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast({ 
        type: 'success', 
        title: 'Export Complete', 
        message: 'Customization settings exported successfully.' 
      });
    } catch (err) {
      addToast({ 
        type: 'error', 
        title: 'Export Failed', 
        message: 'Failed to export customization settings.' 
      });
    }
  };

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        setCustomization({ ...getDefaultCustomization(), ...imported });
        addToast({ 
          type: 'success', 
          title: 'Import Complete', 
          message: 'Customization settings imported successfully.' 
        });
      } catch (err) {
        addToast({ 
          type: 'error', 
          title: 'Import Failed', 
          message: 'Failed to parse customization file.' 
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const updateCustomization = (section, key, value) => {
    setCustomization(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    
    // If updating theme mode, apply it immediately for preview
    if (section === 'theme' && key === 'mode') {
      setDarkMode(value === 'dark');
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
      addToast({
        type: 'error',
        title: 'Invalid File',
        message: 'Please upload a PNG or JPEG image file.'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast({
        type: 'error',
        title: 'File Too Large',
        message: 'Logo file must be less than 5MB.'
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setLogoPreview(dataUrl);
      updateCustomization('branding', 'logoUrl', dataUrl);
      addToast({
        type: 'success',
        title: 'Logo Uploaded',
        message: 'Your logo has been uploaded successfully.'
      });
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    updateCustomization('branding', 'logoUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="showcase-page-modern">
      {/* Hero Section */}
      <div className="showcase-hero">
        <div className="showcase-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-8 h-8 text-emerald-600" />
              <h1 className="text-3xl font-bold text-slate-900">Customization Center</h1>
            </div>
            <p className="text-slate-600">Make this dashboard your own — customize colors, terminology, and layout</p>
          </motion.div>
        </div>
      </div>

      <div className="showcase-container">
        {/* Action Bar */}
        <div className="customization-actions">
          <motion.button
            onClick={() => setShowPreview(!showPreview)}
            className="customization-action-btn customization-action-btn-secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </motion.button>

          <motion.button
            onClick={handleExport}
            className="customization-action-btn customization-action-btn-secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>

          <label className="customization-action-btn customization-action-btn-secondary" style={{ cursor: 'pointer' }}>
            <Upload className="w-4 h-4" />
            Import
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>

          <motion.button
            onClick={handleReset}
            className="customization-action-btn customization-action-btn-secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </motion.button>

          <motion.button
            onClick={handleSave}
            disabled={saving}
            className="customization-action-btn customization-action-btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </div>

        {/* Tab Navigation */}
        <div className="showcase-tabs">
          {tabs.map((tab, idx) => {
            const TabIcon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                onClick={() => setActiveTab(tab.id)}
                className={`showcase-tab ${activeTab === tab.id ? 'showcase-tab-active' : ''}`}
              >
                <TabIcon className="w-5 h-5" />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="showcase-section">
          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="customization-section"
            >
              <div className="showcase-card">
                <div className="showcase-card-header">
                  <Palette className="w-6 h-6 text-emerald-600" />
                  <div>
                    <h2>Brand Identity</h2>
                    <p>Customize your company's visual identity</p>
                  </div>
                </div>

                <div className="showcase-card-content">
                  <div className="customization-form">
                  {/* Company Name */}
                  <div className="customization-form-group">
                    <label className="flex items-center gap-2">
                      Company Name
                      <TooltipIcon content="This name will appear in the header and branding throughout the application" />
                    </label>
                    <input
                      type="text"
                      value={customization.branding.companyName}
                      onChange={(e) => updateCustomization('branding', 'companyName', e.target.value)}
                      className="customization-input"
                      placeholder="Your Company Name"
                    />
                  </div>

                  {/* Logo Upload */}
                  <div className="customization-form-group">
                    <label className="flex items-center gap-2">
                      Company Logo
                      <TooltipIcon content="Upload your company logo (PNG or JPEG, max 5MB). This will appear in the navigation bar and login page." />
                    </label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={handleLogoUpload}
                          style={{ display: 'none' }}
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="customization-action-btn customization-action-btn-secondary"
                          style={{ 
                            cursor: 'pointer',
                            display: 'inline-flex',
                            margin: 0
                          }}
                        >
                          <Upload className="w-4 h-4" />
                          Choose Logo File
                        </label>
                      </div>
                      {(logoPreview || customization.branding.logoUrl) && (
                        <div style={{ 
                          position: 'relative',
                          width: '100px',
                          height: '100px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#f9fafb'
                        }}>
                          <img 
                            src={logoPreview || customization.branding.logoUrl} 
                            alt="Logo preview"
                            style={{ 
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain'
                            }}
                          />
                          <button
                            onClick={handleRemoveLogo}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'rgba(239, 68, 68, 0.9)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: 'white'
                            }}
                            title="Remove logo"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="customization-help-text">
                      Upload a PNG or JPEG image (max 5MB). Recommended size: 200x50px
                    </p>
                  </div>

                  {/* Color Pickers */}
                  <div className="customization-color-grid">
                    <div className="customization-color-picker">
                      <label className="flex items-center gap-2">
                        Primary Color
                        <TooltipIcon content="Main brand color used for buttons, links, and key UI elements" />
                      </label>
                      <div className="customization-color-input-wrapper">
                        <input
                          type="color"
                          value={customization.branding.primaryColor}
                          onChange={(e) => updateCustomization('branding', 'primaryColor', e.target.value)}
                          className="customization-color-input"
                        />
                        <input
                          type="text"
                          value={customization.branding.primaryColor}
                          onChange={(e) => updateCustomization('branding', 'primaryColor', e.target.value)}
                          className="customization-hex-input"
                          placeholder="#10b981"
                        />
                      </div>
                    </div>

                    <div className="customization-color-picker">
                      <label className="flex items-center gap-2">
                        Secondary Color
                        <TooltipIcon content="Supporting color for hover states, secondary buttons, and accents" />
                      </label>
                      <div className="customization-color-input-wrapper">
                        <input
                          type="color"
                          value={customization.branding.secondaryColor}
                          onChange={(e) => updateCustomization('branding', 'secondaryColor', e.target.value)}
                          className="customization-color-input"
                        />
                        <input
                          type="text"
                          value={customization.branding.secondaryColor}
                          onChange={(e) => updateCustomization('branding', 'secondaryColor', e.target.value)}
                          className="customization-hex-input"
                          placeholder="#059669"
                        />
                      </div>
                    </div>

                    <div className="customization-color-picker">
                      <label className="flex items-center gap-2">
                        Accent Color
                        <TooltipIcon content="Highlight color for badges, notifications, and emphasis elements" />
                      </label>
                      <div className="customization-color-input-wrapper">
                        <input
                          type="color"
                          value={customization.branding.accentColor}
                          onChange={(e) => updateCustomization('branding', 'accentColor', e.target.value)}
                          className="customization-color-input"
                        />
                        <input
                          type="text"
                          value={customization.branding.accentColor}
                          onChange={(e) => updateCustomization('branding', 'accentColor', e.target.value)}
                          className="customization-hex-input"
                          placeholder="#047857"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Color Preview */}
                  <div className="customization-color-preview">
                    <h3>Color Preview</h3>
                    <div className="customization-color-samples">
                      <div className="customization-sample-card" style={{ borderTopColor: customization.branding.primaryColor }}>
                        <div className="customization-sample-badge" style={{ backgroundColor: customization.branding.primaryColor }}>
                          Primary
                        </div>
                        <h4>Sample Card</h4>
                        <p>This is how your primary color will appear in the dashboard</p>
                      </div>
                      <div className="customization-sample-card" style={{ borderTopColor: customization.branding.secondaryColor }}>
                        <div className="customization-sample-badge" style={{ backgroundColor: customization.branding.secondaryColor }}>
                          Secondary
                        </div>
                        <h4>Sample Card</h4>
                        <p>This is how your secondary color will appear</p>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Terminology Tab */}
          {activeTab === 'terminology' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="customization-section"
            >
              <div className="showcase-card">
                <div className="showcase-card-header">
                  <Type className="w-6 h-6 text-emerald-600" />
                  <div>
                    <h2>Custom Terminology</h2>
                    <p>Rename features to match your organization's language</p>
                  </div>
                </div>

                <div className="showcase-card-content">
                  <div className="customization-form">
                  <div className="customization-terminology-grid">
                    <div className="customization-form-group">
                      <label>Dashboard</label>
                      <input
                        type="text"
                        value={customization.terminology.dashboard}
                        onChange={(e) => updateCustomization('terminology', 'dashboard', e.target.value)}
                        className="customization-input"
                        placeholder="Dashboard"
                      />
                      <p className="customization-help-text">Main overview page</p>
                    </div>

                    <div className="customization-form-group">
                      <label>Assets (Plural)</label>
                      <input
                        type="text"
                        value={customization.terminology.assets}
                        onChange={(e) => updateCustomization('terminology', 'assets', e.target.value)}
                        className="customization-input"
                        placeholder="Assets, Equipment, Inventory"
                      />
                      <p className="customization-help-text">e.g., Equipment, Inventory, Resources</p>
                    </div>

                    <div className="customization-form-group">
                      <label>Asset (Singular)</label>
                      <input
                        type="text"
                        value={customization.terminology.assetSingular}
                        onChange={(e) => updateCustomization('terminology', 'assetSingular', e.target.value)}
                        className="customization-input"
                        placeholder="Asset"
                      />
                      <p className="customization-help-text">Singular form</p>
                    </div>

                    <div className="customization-form-group">
                      <label>Maintenance (Plural)</label>
                      <input
                        type="text"
                        value={customization.terminology.maintenance}
                        onChange={(e) => updateCustomization('terminology', 'maintenance', e.target.value)}
                        className="customization-input"
                        placeholder="Maintenance, Service, Repairs"
                      />
                      <p className="customization-help-text">e.g., Service, Repairs, Work Orders</p>
                    </div>

                    <div className="customization-form-group">
                      <label>Maintenance Record (Singular)</label>
                      <input
                        type="text"
                        value={customization.terminology.maintenanceSingular}
                        onChange={(e) => updateCustomization('terminology', 'maintenanceSingular', e.target.value)}
                        className="customization-input"
                        placeholder="Maintenance Record"
                      />
                      <p className="customization-help-text">Singular form</p>
                    </div>

                    <div className="customization-form-group">
                      <label>Reports (Plural)</label>
                      <input
                        type="text"
                        value={customization.terminology.reports}
                        onChange={(e) => updateCustomization('terminology', 'reports', e.target.value)}
                        className="customization-input"
                        placeholder="Reports, Analytics, Insights"
                      />
                      <p className="customization-help-text">e.g., Analytics, Insights</p>
                    </div>

                    <div className="customization-form-group">
                      <label>Report (Singular)</label>
                      <input
                        type="text"
                        value={customization.terminology.reportSingular}
                        onChange={(e) => updateCustomization('terminology', 'reportSingular', e.target.value)}
                        className="customization-input"
                        placeholder="Report"
                      />
                      <p className="customization-help-text">Singular form</p>
                    </div>
                  </div>

                  {/* Preview Box */}
                  <div className="customization-preview-box">
                    <h3>Preview</h3>
                    <div className="customization-preview-menu">
                      <div className="customization-preview-item">
                        <Layout className="w-4 h-4" />
                        <span>{customization.terminology.dashboard}</span>
                      </div>
                      <div className="customization-preview-item">
                        <Layers className="w-4 h-4" />
                        <span>{customization.terminology.assets}</span>
                      </div>
                      <div className="customization-preview-item">
                        <Settings className="w-4 h-4" />
                        <span>{customization.terminology.maintenance}</span>
                      </div>
                      <div className="customization-preview-item">
                        <CheckCircle className="w-4 h-4" />
                        <span>{customization.terminology.reports}</span>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Layout Tab */}
          {activeTab === 'layout' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="customization-section"
            >
              <div className="showcase-card">
                <div className="showcase-card-header">
                  <Layout className="w-6 h-6 text-emerald-600" />
                  <div>
                    <h2>Dashboard Layout</h2>
                    <p>Configure which elements appear on your dashboard</p>
                  </div>
                </div>

                <div className="showcase-card-content">
                  <div className="customization-form">
                  <div className="customization-toggle-group">
                    <div className="customization-toggle-item">
                      <div>
                        <h4>Show Metrics Cards</h4>
                        <p>Display key performance metrics at the top</p>
                      </div>
                      <label className="customization-toggle-switch">
                        <input
                          type="checkbox"
                          checked={customization.layout.showMetrics}
                          onChange={(e) => updateCustomization('layout', 'showMetrics', e.target.checked)}
                        />
                        <span className="customization-toggle-slider"></span>
                      </label>
                    </div>

                    <div className="customization-toggle-item">
                      <div>
                        <h4>Show Charts</h4>
                        <p>Display visual charts and graphs</p>
                      </div>
                      <label className="customization-toggle-switch">
                        <input
                          type="checkbox"
                          checked={customization.layout.showCharts}
                          onChange={(e) => updateCustomization('layout', 'showCharts', e.target.checked)}
                        />
                        <span className="customization-toggle-slider"></span>
                      </label>
                    </div>

                    <div className="customization-toggle-item">
                      <div>
                        <h4>Show Recent Activity</h4>
                        <p>Display recent changes and updates</p>
                      </div>
                      <label className="customization-toggle-switch">
                        <input
                          type="checkbox"
                          checked={customization.layout.showRecentActivity}
                          onChange={(e) => updateCustomization('layout', 'showRecentActivity', e.target.checked)}
                        />
                        <span className="customization-toggle-slider"></span>
                      </label>
                    </div>

                    <div className="customization-toggle-item">
                      <div>
                        <h4>Compact Mode</h4>
                        <p>Reduce spacing for more content on screen</p>
                      </div>
                      <label className="customization-toggle-switch">
                        <input
                          type="checkbox"
                          checked={customization.layout.compactMode}
                          onChange={(e) => updateCustomization('layout', 'compactMode', e.target.checked)}
                        />
                        <span className="customization-toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="customization-form-group">
                    <label>Default Asset View</label>
                    <select
                      value={customization.layout.defaultAssetView}
                      onChange={(e) => updateCustomization('layout', 'defaultAssetView', e.target.value)}
                      className="customization-select"
                    >
                      <option value="grid">Grid View</option>
                      <option value="list">List View</option>
                    </select>
                    <p className="customization-help-text">Choose how assets are displayed by default</p>
                  </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="customization-section"
            >
              <div className="showcase-card">
                <div className="showcase-card-header">
                  <Bell className="w-6 h-6 text-emerald-600" />
                  <div>
                    <h2>Notification Preferences</h2>
                    <p>Set thresholds and alert preferences</p>
                  </div>
                </div>

                <div className="showcase-card-content">
                  <div className="customization-form">
                  <div className="customization-form-group">
                    <label>Low Stock Threshold</label>
                    <input
                      type="number"
                      value={customization.notifications.lowStockThreshold}
                      onChange={(e) => updateCustomization('notifications', 'lowStockThreshold', parseInt(e.target.value) || 0)}
                      className="customization-input"
                      min="0"
                      max="100"
                    />
                    <p className="customization-help-text">Alert when asset count falls below this number</p>
                  </div>

                  <div className="customization-form-group">
                    <label>Maintenance Due Days</label>
                    <input
                      type="number"
                      value={customization.notifications.maintenanceDueDays}
                      onChange={(e) => updateCustomization('notifications', 'maintenanceDueDays', parseInt(e.target.value) || 0)}
                      className="customization-input"
                      min="1"
                      max="90"
                    />
                    <p className="customization-help-text">Days in advance to alert about upcoming maintenance</p>
                  </div>

                  <div className="customization-form-group">
                    <label>Email Digest Frequency</label>
                    <select
                      value={customization.notifications.emailDigest}
                      onChange={(e) => updateCustomization('notifications', 'emailDigest', e.target.value)}
                      className="customization-select"
                    >
                      <option value="realtime">Real-time</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="never">Never</option>
                    </select>
                    <p className="customization-help-text">How often to send notification summaries</p>
                  </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminCustomizationCenter;
