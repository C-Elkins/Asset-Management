import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Save, FileDown, CheckCircle2, AlertTriangle, 
  Trash2, Lock, Eye, Download, RefreshCw, Info, Database
} from 'lucide-react';
import { privacyService, getDefaultConsent } from '../services/privacyService';
import { useToast } from '../components/common/Toast.jsx';

export const PrivacyPageModern = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [policy, setPolicy] = useState(null);
  const [consent, setConsent] = useState(getDefaultConsent());
  const [myData, setMyData] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [p, c, d] = await Promise.all([
          privacyService.getPolicyStatus(),
          privacyService.getConsent(),
          privacyService.getMyData()
        ]);
        if (!mounted) return;
        setPolicy(p);
        setConsent({
          marketingEmails: !!c?.marketingEmails,
          analytics: !!c?.analytics,
          dataProcessing: c?.dataProcessing !== false,
          consentVersion: c?.consentVersion || '1.0'
        });
        setMyData(d);
      } catch (err) {
        console.error('Failed to load privacy settings:', err);
        if (!mounted) return;
        if (err.response?.status === 403) {
          setError('Your session has expired. Please log out and log back in to continue.');
        } else {
          setError('Failed to load privacy settings.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleToggle = (key) => {
    setConsent(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const updated = await privacyService.updateConsent(consent);
      setConsent({
        marketingEmails: !!updated?.marketingEmails,
        analytics: !!updated?.analytics,
        dataProcessing: updated?.dataProcessing !== false,
        consentVersion: updated?.consentVersion || consent.consentVersion
      });
      addToast({ 
        type: 'success', 
        title: 'Preferences saved', 
        message: 'Your consent settings have been updated successfully.' 
      });
    } catch (err) {
      console.error('Failed to save consent:', err);
      if (err.response?.status === 403) {
        setError('Your session has expired. Please log out and log back in to continue.');
      } else {
        setError('Could not save consent preferences. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadData = () => {
    try {
      const blob = new Blob([JSON.stringify(myData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `krubles-my-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      addToast({ 
        type: 'success', 
        title: 'Data exported', 
        message: 'Your data has been downloaded successfully.' 
      });
    } catch {
      addToast({ 
        type: 'error', 
        title: 'Download failed', 
        message: 'Unable to export your data. Please try again.' 
      });
    }
  };

  const handleRequestDeletion = async () => {
    if (!confirm('Are you sure you want to request deletion of your account and all associated personal data? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await privacyService.requestDeletion('User-initiated deletion request');
      addToast({ 
        type: 'info', 
        title: 'Deletion requested', 
        message: res?.message || 'We have received your deletion request and will process it shortly.' 
      });
    } catch (err) {
      console.error('Failed to request deletion:', err);
      addToast({ 
        type: 'error', 
        title: 'Request failed', 
        message: 'Could not submit deletion request. Please contact support.' 
      });
    }
  };

  const policyItems = useMemo(() => [
    { 
      key: 'frameworks', 
      label: 'Compliance', 
      value: policy?.frameworks?.join(', ') || 'GDPR, CCPA',
      icon: Shield
    },
    { 
      key: 'policyVersion', 
      label: 'Policy Version', 
      value: policy?.policyVersion || '1.0',
      icon: Info
    },
    { 
      key: 'lastUpdated', 
      label: 'Last Updated', 
      value: policy?.lastUpdated || new Date().toLocaleDateString(),
      icon: RefreshCw
    },
    { 
      key: 'tenantId', 
      label: 'Organization', 
      value: String(policy?.tenantId ?? 'Default'),
      icon: Database
    }
  ], [policy]);

  const consentOptions = [
    { 
      key: 'marketingEmails', 
      label: 'Marketing Communications', 
      desc: 'Receive product updates, promotions, and newsletters via email.',
      icon: '📧'
    },
    { 
      key: 'analytics', 
      label: 'Usage Analytics', 
      desc: 'Allow us to collect anonymous usage data to improve our products and services.',
      icon: '📊'
    },
    { 
      key: 'dataProcessing', 
      label: 'Data Processing', 
      desc: 'Essential processing of your data to deliver core services and features.',
      icon: '⚙️',
      required: true
    }
  ];

  if (loading) {
    return (
      <div className="privacy-page-modern">
        <div className="privacy-hero">
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error && error.includes('session expired')) {
    return (
      <div className="privacy-page-modern">
        <div className="privacy-hero">
          <div className="max-w-2xl mx-auto text-center py-12">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Session Expired</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="privacy-page-modern">
      {/* Hero Section */}
      <motion.div 
        className="privacy-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="privacy-hero-content">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Privacy & Data Protection</h1>
                <p className="text-sm text-slate-600">Manage your consent preferences and access your personal data</p>
              </div>
            </div>
          </div>

          {/* Status Metrics */}
          <div className="privacy-metrics-grid">
            {policyItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div 
                  key={item.key}
                  className="metric-card" 
                  whileHover={{ y: -4 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                >
                  <div className="metric-icon bg-gradient-to-br from-emerald-500 to-emerald-600">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="metric-content">
                    <p className="metric-label">{item.label}</p>
                    <p className="metric-value text-lg">{item.value}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="max-w-5xl mx-auto px-6 mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="privacy-content">
        <div className="privacy-grid">
          {/* Consent Management */}
          <motion.div 
            className="privacy-card privacy-card-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="privacy-card-header">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                <h2 className="privacy-card-title">Consent Preferences</h2>
              </div>
              <p className="text-sm text-slate-600">Control how we use your data</p>
            </div>

            <div className="consent-options">
              {consentOptions.map((option, idx) => (
                <motion.div
                  key={option.key}
                  className="consent-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + idx * 0.1 }}
                >
                  <div className="consent-info">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{option.icon}</span>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {option.label}
                          {option.required && (
                            <span className="ml-2 text-xs font-normal text-emerald-600">(Required)</span>
                          )}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 ml-11">{option.desc}</p>
                  </div>
                  
                  <button
                    onClick={() => !option.required && handleToggle(option.key)}
                    disabled={option.required}
                    className={`consent-toggle ${consent[option.key] ? 'active' : ''} ${option.required ? 'required' : ''}`}
                  >
                    <motion.span
                      className="consent-toggle-knob"
                      animate={{ x: consent[option.key] ? 26 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="privacy-card-actions">
              <motion.button
                onClick={handleSave}
                disabled={saving}
                className="privacy-action-btn privacy-action-btn-primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Preferences'}
              </motion.button>
            </div>
          </motion.div>

          {/* My Data Export */}
          <motion.div 
            className="privacy-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="privacy-card-header">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <h2 className="privacy-card-title">My Data</h2>
              </div>
              <p className="text-sm text-slate-600">View and export your data</p>
            </div>

            {!myData && !loading && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800">No data available to display.</p>
              </div>
            )}

            {myData && (
              <div className="data-preview">
                <pre className="data-preview-content">
                  {JSON.stringify(myData, null, 2)}
                </pre>
              </div>
            )}

            <div className="privacy-card-actions">
              <motion.button
                onClick={handleDownloadData}
                className="privacy-action-btn privacy-action-btn-secondary w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!myData}
              >
                <Download className="w-4 h-4" />
                Download JSON
              </motion.button>
            </div>
          </motion.div>

          {/* Account Deletion */}
          <motion.div 
            className="privacy-card privacy-card-danger"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="privacy-card-header">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                <h2 className="privacy-card-title">Delete Account</h2>
              </div>
              <p className="text-sm text-slate-600">Permanently remove your data</p>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-sm text-red-800 font-medium mb-2">⚠️ Warning: This action is irreversible</p>
              <p className="text-xs text-red-700">
                Requesting deletion will permanently remove your account and all associated personal data. 
                This process cannot be undone and may take up to 30 days to complete.
              </p>
            </div>

            <div className="privacy-card-actions">
              <motion.button
                onClick={handleRequestDeletion}
                className="privacy-action-btn privacy-action-btn-danger w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Trash2 className="w-4 h-4" />
                Request Account Deletion
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
