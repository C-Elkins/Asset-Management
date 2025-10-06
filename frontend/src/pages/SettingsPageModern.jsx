import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Shield, 
  Server, 
  Bell, 
  Save, 
  RefreshCw,
  Settings as SettingsIcon,
  Lock,
  Mail,
  Globe,
  Moon,
  Sun,
  CreditCard,
  Database,
  AlertTriangle,
  LogOut,
  ExternalLink,
  HelpCircle,
  Eye
} from 'lucide-react';
import { useAuthStore } from '../app/store/authStore';
import { getSettings, updateSettings, getDefaultSettings } from '../services/settingsService';
import { useToast } from '../components/common/Toast.jsx';
import { useSettingsStore } from '../store/settingsStore';

export function SettingsPageModern() {
  const navigate = useNavigate();
  const logout = useAuthStore(s => s.logout);
  const { addToast } = useToast();
  const { toggleTooltips, toggleDarkMode, settings: globalSettings } = useSettingsStore();
  const [activeSection, setActiveSection] = useState('profile');
  const [settings, setSettings] = useState(getDefaultSettings());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);

  // Feature flag: dark mode can be disabled globally
  const darkModeAllowed = (typeof window !== 'undefined' && localStorage.getItem('feature_dark_mode') !== 'off');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getSettings();
        // Merge with defaults to ensure all sections exist
        const mergedSettings = {
          ...getDefaultSettings(),
          ...data
        };
        if (mounted) setSettings(mergedSettings);
      } catch (err) {
        if (err?.response?.status === 403) {
          if (mounted) setSessionExpired(true);
        } else {
          if (mounted) setError('Failed to load settings. Using last known values.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const sections = [
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: User,
      description: 'Personal information and account details',
      color: 'emerald'
    },
    {
      id: 'security', 
      title: 'Security',
      icon: Shield,
      description: 'Authentication and security preferences',
      color: 'red'
    },
    {
      id: 'system',
      title: 'System Configuration',
      icon: Server,
      description: 'System-wide settings and maintenance',
      color: 'blue'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      description: 'Alerts and communication preferences',
      color: 'amber'
    },
    {
      id: 'privacy',
      title: 'Privacy & Data',
      icon: Database,
      description: 'Data consent and privacy preferences',
      color: 'purple'
    },
    {
      id: 'billing',
      title: 'Billing & Payment',
      icon: CreditCard,
      description: 'Payment method and subscription',
      color: 'indigo'
    }
  ];

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const updated = await updateSettings(settings);
      setSettings(updated);
      addToast({ type: 'success', title: 'Success', message: 'Settings saved successfully' });
    } catch (err) {
      if (err?.response?.status === 403) {
        setSessionExpired(true);
      } else {
        setError('Failed to save settings. Please try again.');
        addToast({ type: 'error', title: 'Error', message: 'Failed to save settings' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all settings to default values?')) {
      const defaults = getDefaultSettings();
      setSettings(defaults);
      addToast({ type: 'info', title: 'Info', message: 'Settings reset to defaults (not yet saved)' });
    }
  };

  const toggleSetting = (section, key) => {
    // Handle special global settings
    if (section === 'system' && key === 'showTooltips') {
      toggleTooltips();
      addToast({ 
        type: 'info', 
        title: 'Tooltips ' + (globalSettings?.system?.showTooltips ? 'Disabled' : 'Enabled'),
        message: 'Tooltip preference updated globally'
      });
      return;
    }
    
    if (section === 'system' && key === 'darkMode') {
      toggleDarkMode();
      addToast({ 
        type: 'info', 
        title: (globalSettings?.system?.darkMode ? 'Light' : 'Dark') + ' Mode Enabled',
        message: 'Theme updated across all pages'
      });
      return;
    }
    
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [key]: !prev[section]?.[key]
      }
    }));
  };

  const activeData = settings[activeSection] || {};
  const activeInfo = sections.find(s => s.id === activeSection);

  if (sessionExpired) {
    return (
      <div className="settings-page-modern">
        <div className="settings-container">
          <div className="settings-error-card">
            <AlertTriangle className="w-12 h-12 text-red-600" />
            <h2>Session Expired</h2>
            <p>Your session has expired. Please log in again to continue.</p>
            <button 
              onClick={logout}
              className="settings-action-btn settings-action-btn-primary"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page-modern">
      {/* Hero Section */}
      <div className="settings-hero">
        <div className="settings-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <SettingsIcon className="w-8 h-8 text-emerald-700" />
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            </div>
            <p className="text-gray-600">Manage your account, security, and system preferences</p>
          </motion.div>
        </div>
      </div>

      <div className="settings-container">
        {loading && (
          <div className="settings-loading">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
            <p>Loading settings...</p>
          </div>
        )}

        {!loading && (
          <div className="settings-layout">
            {/* Settings Navigation */}
            <motion.div 
              className="settings-sidebar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="settings-nav">
                {sections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`settings-nav-item ${activeSection === section.id ? 'settings-nav-item-active' : ''}`}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5" strokeWidth={2} />
                        <div>
                          <p className="settings-nav-title">{section.title}</p>
                          <p className="settings-nav-desc">{section.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Settings Content */}
            <motion.div 
              className="settings-content"
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="settings-card">
                {error && (
                  <div className="settings-error-banner">
                    <AlertTriangle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="settings-card-header">
                  <div className="flex items-center gap-3">
                    <activeInfo.icon className="w-6 h-6 text-emerald-600" strokeWidth={2} />
                    <div>
                      <h2 className="settings-card-title">{activeInfo.title}</h2>
                      <p className="settings-card-desc">{activeInfo.description}</p>
                    </div>
                  </div>
                  <div className="settings-card-actions">
                    {(activeSection === 'privacy' || activeSection === 'billing') && (
                      <motion.button 
                        onClick={() => navigate(`/app/${activeSection}`)}
                        className="settings-action-btn settings-action-btn-secondary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Full Page
                      </motion.button>
                    )}
                    <motion.button 
                      onClick={handleReset}
                      className="settings-action-btn settings-action-btn-secondary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reset
                    </motion.button>
                    <motion.button 
                      onClick={handleSave}
                      className="settings-action-btn settings-action-btn-primary"
                      disabled={saving}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                  </div>
                </div>

                {/* Settings Form */}
                <div className="settings-form">
                  {Object.entries(activeData).map(([key, value], index) => {
                    // Use global state for tooltips and dark mode
                    const displayValue = (activeSection === 'system' && key === 'showTooltips')
                      ? globalSettings?.system?.showTooltips ?? value
                      : (activeSection === 'system' && key === 'darkMode')
                      ? globalSettings?.system?.darkMode ?? value
                      : value;
                    
                    // Add helpful descriptions
                    const descriptions = {
                      showTooltips: 'Show helpful hints and explanations throughout the app',
                      // Clarify scope: app-only, not marketing pages
                      darkMode: darkModeAllowed
                        ? 'Enable dark theme across the app (marketing pages are unaffected)'
                        : 'Dark theme is disabled by admin'
                    };

                    // If dark mode is feature-flagged off, hide the toggle entirely
                    if (!darkModeAllowed && key === 'darkMode') {
                      return null;
                    }
                    
                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="settings-form-item"
                      >
                        <div className="settings-form-item-info">
                          <label className="settings-form-label">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            {key === 'showTooltips' && <HelpCircle className="w-4 h-4 inline ml-2 text-gray-400" />}
                            {key === 'darkMode' && (displayValue ? <Moon className="w-4 h-4 inline ml-2 text-gray-400" /> : <Sun className="w-4 h-4 inline ml-2 text-gray-400" />)}
                          </label>
                          <p className="settings-form-value">
                            {descriptions[key] || (typeof displayValue === 'boolean' 
                              ? (displayValue ? 'Enabled' : 'Disabled')
                              : `Current: ${displayValue}`)}
                          </p>
                        </div>
                        
                        {typeof displayValue === 'boolean' ? (
                          <motion.button
                            onClick={() => toggleSetting(activeSection, key)}
                            className={`settings-toggle ${displayValue ? 'settings-toggle-active' : ''}`}
                            whileTap={{ scale: 0.95 }}
                          >
                            <motion.span
                              className="settings-toggle-knob"
                              animate={{ x: displayValue ? 24 : 2 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          </motion.button>
                        ) : (
                          <motion.button 
                            onClick={() => alert(`Edit ${key}: ${displayValue}`)}
                            className="settings-edit-btn"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Edit
                          </motion.button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsPageModern;
