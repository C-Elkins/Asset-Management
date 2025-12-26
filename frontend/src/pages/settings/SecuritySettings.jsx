import React, { useState } from 'react';
import { authService } from '../../services/authService.js';
import { getSettings, updateSettings } from '../../services/settingsService';
import { useToast } from '../../components/common/Toast.jsx';
import { MfaTotpSetup } from '../../components/auth/MfaTotpSetup.jsx';

export const SecuritySettings = () => {
  const { addToast } = useToast();
  const [mfa, setMfa] = useState(false);
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const changePassword = async () => {
    if (!form.next || form.next !== form.confirm) {
      addToast({ type: 'error', title: 'Validation', message: 'Passwords do not match.' });
      return;
    }
    setSaving(true);
    try {
      const raw = localStorage.getItem('auth-store');
      const me = raw ? JSON.parse(raw)?.state?.user : null;
      await authService.changePassword({ username: me?.username || 'me', newPassword: form.next });
      addToast({ type: 'success', title: 'Password changed', message: 'Your password has been updated.' });
      setForm({ current: '', next: '', confirm: '' });
    } catch (e) {
      addToast({ type: 'error', title: 'Update failed', message: e.message || 'Could not change password' });
    } finally { setSaving(false); }
  };

  const toggleMfa = async (e) => {
    const enabled = e.target.checked;
    setMfa(enabled);
    try {
      const s = await getSettings();
      await updateSettings({ security: { ...(s.security||{}), twoFactorAuth: enabled } });
    } catch {}
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Security Settings</h2>
      <div className="max-w-md space-y-4">
        <div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={mfa} onChange={toggleMfa} /> Enable multi-factor authentication
          </label>
        </div>
        {mfa && (
          <div className="border rounded-lg p-3">
            <MfaTotpSetup />
          </div>
        )}
        <div className="border rounded-lg p-3 space-y-3">
          <div className="grid gap-2">
            <label className="text-sm text-slate-600">Current password
              <input type="password" className="mt-1 w-full border rounded-lg px-3 py-2" value={form.current} onChange={e=>setForm(f=>({ ...f, current: e.target.value }))} />
            </label>
            <label className="text-sm text-slate-600">New password
              <input type="password" className="mt-1 w-full border rounded-lg px-3 py-2" value={form.next} onChange={e=>setForm(f=>({ ...f, next: e.target.value }))} />
            </label>
            <label className="text-sm text-slate-600">Confirm new password
              <input type="password" className="mt-1 w-full border rounded-lg px-3 py-2" value={form.confirm} onChange={e=>setForm(f=>({ ...f, confirm: e.target.value }))} />
            </label>
          </div>
          <button className="btn-primary" onClick={changePassword} disabled={saving}>Change Password</button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
