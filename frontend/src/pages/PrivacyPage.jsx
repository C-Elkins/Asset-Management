import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Save, FileDown, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';
import { privacyService, getDefaultConsent } from '../services/privacyService';
import { useToast } from '../components/common/Toast.jsx';

export const PrivacyPage = () => {
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
      } catch {
        if (!mounted) return;
        setError('Failed to load privacy settings.');
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
    setSaving(true); setError('');
    try {
      const updated = await privacyService.updateConsent(consent);
      setConsent({
        marketingEmails: !!updated?.marketingEmails,
        analytics: !!updated?.analytics,
        dataProcessing: updated?.dataProcessing !== false,
        consentVersion: updated?.consentVersion || consent.consentVersion
      });
      addToast({ type: 'success', title: 'Preferences saved', message: 'Your consent settings have been updated.' });
    } catch {
      setError('Could not save consent preferences.');
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
      a.download = `my-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      addToast({ type: 'error', title: 'Download failed', message: 'Unable to export your data.' });
    }
  };

  const handleRequestDeletion = async () => {
    if (!confirm('Request deletion of your account and associated personal data?')) return;
    try {
      const res = await privacyService.requestDeletion('User-initiated');
      addToast({ type: 'info', title: 'Deletion requested', message: res?.message || 'We have received your request.' });
    } catch {
      addToast({ type: 'error', title: 'Request failed', message: 'Could not submit deletion request.' });
    }
  };

  const policyItems = useMemo(() => [
    { key: 'frameworks', label: 'Frameworks', value: policy?.frameworks?.join(', ') || 'GDPR/CCPA' },
    { key: 'policyVersion', label: 'Policy Version', value: policy?.policyVersion || '1.0' },
    { key: 'lastUpdated', label: 'Last Updated', value: policy?.lastUpdated || '—' },
    { key: 'tenantId', label: 'Tenant', value: String(policy?.tenantId ?? 'default') }
  ], [policy]);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-3">
        <Shield className="w-7 h-7 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Privacy & Data</h1>
          <p className="text-slate-600">Manage consent and access your personal data</p>
        </div>
      </div>

      {error && <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded">{error}</div>}

      {/* Policy Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Consent</h2>
          <div className="space-y-4">
            {[
              { key: 'marketingEmails', label: 'Marketing emails', desc: 'Receive product updates and promotions.' },
              { key: 'analytics', label: 'Analytics', desc: 'Allow usage analytics to improve the product.' },
              { key: 'dataProcessing', label: 'Data processing', desc: 'Allow processing of your data to deliver services.' }
            ].map((item, idx) => (
              <motion.div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
              >
                <div>
                  <p className="font-medium text-slate-900">{item.label}</p>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
                <button
                  onClick={() => handleToggle(item.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${consent[item.key] ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <motion.span
                    className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    animate={{ x: consent[item.key] ? 24 : 4 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save Preferences'}
            </button>
            <button
              onClick={handleRequestDeletion}
              className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Request Deletion
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Policy Status</h2>
          <ul className="space-y-3">
            {policyItems.map((it) => (
              <li key={it.key} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{it.label}</p>
                  <p className="text-xs text-slate-600">{it.value}</p>
                </div>
              </li>
            ))}
          </ul>
          {loading && <p className="text-xs text-slate-500 mt-2">Loading…</p>}
        </div>
      </div>

      {/* My Data */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">My Data</h2>
          <button onClick={handleDownloadData} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50">
            <FileDown className="w-4 h-4" />
            Download JSON
          </button>
        </div>
        {!myData && !loading && (
          <div className="p-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            No data available to display.
          </div>
        )}
        <pre className="mt-2 text-xs bg-slate-50 border border-slate-200 rounded p-3 overflow-auto max-h-80">
          {myData ? JSON.stringify(myData, null, 2) : (loading ? 'Loading…' : '{}')}
        </pre>
      </div>
    </div>
  );
};

export default PrivacyPage;
