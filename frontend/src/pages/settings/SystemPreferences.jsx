import React, { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../../services/settingsService';

export const SystemPreferences = () => {
  const [prefs, setPrefs] = useState({ theme: 'light', locale: 'en-US', tableDensity: 'comfortable' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await getSettings();
        const ui = s.ui || {};
        if (mounted) setPrefs({ theme: ui.theme || 'light', locale: ui.locale || 'en-US', tableDensity: ui.tableDensity || 'comfortable' });
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  const onSave = async () => {
    setSaving(true);
    try {
      await updateSettings({ ui: prefs });
      // Apply theme globally
      try {
        const root = document.documentElement;
        if (prefs.theme === 'dark') root.setAttribute('data-theme', 'dark');
        else root.removeAttribute('data-theme');
      } catch {}
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">System Preferences</h2>
      <div className="grid gap-3 max-w-md">
        <label className="text-sm text-slate-600">Theme
          <select className="mt-1 w-full border rounded-lg px-3 py-2" value={prefs.theme} onChange={e=>setPrefs(p=>({ ...p, theme: e.target.value }))}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label className="text-sm text-slate-600">Locale
          <input className="mt-1 w-full border rounded-lg px-3 py-2" value={prefs.locale} onChange={e=>setPrefs(p=>({ ...p, locale: e.target.value }))} />
        </label>
        <label className="text-sm text-slate-600">Table density
          <select className="mt-1 w-full border rounded-lg px-3 py-2" value={prefs.tableDensity} onChange={e=>setPrefs(p=>({ ...p, tableDensity: e.target.value }))}>
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </select>
        </label>
      </div>
      <button className="btn-primary" onClick={onSave} disabled={saving}>Save</button>
    </div>
  );
};

export default SystemPreferences;
