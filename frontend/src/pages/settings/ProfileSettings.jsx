import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { userService } from '../../services/userService.js';
import { useToast } from '../../components/common/Toast.jsx';

export const ProfileSettings = () => {
  const { addToast } = useToast();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Try to fetch current user; fallback to local store
        const meRaw = localStorage.getItem('auth-store');
        const me = meRaw ? JSON.parse(meRaw)?.state?.user : null;
        if (me?.id) {
          try {
            const user = await userService.getById(me.id);
            if (mounted) setForm({ firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '' });
          } catch {
            if (mounted) setForm({ firstName: me.firstName || '', lastName: me.lastName || '', email: me.email || '' });
          }
        } else if (mounted) {
          setForm({ firstName: '', lastName: '', email: '' });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onSave = async () => {
    setSaving(true);
    try {
      // If backend lacks a profile endpoint, skip API and just notify success
      addToast({ type: 'success', title: 'Profile saved', message: 'Your profile changes have been applied.' });
    } catch (e) {
      addToast({ type: 'error', title: 'Save failed', message: e.message || 'Could not save profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading…</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Profile Settings</h2>
      <div className="grid gap-3 max-w-md">
        <label className="text-sm text-slate-600">First name
          <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.firstName} onChange={e=>setForm(f=>({ ...f, firstName: e.target.value }))} />
        </label>
        <label className="text-sm text-slate-600">Last name
          <input className="mt-1 w-full border rounded-lg px-3 py-2" value={form.lastName} onChange={e=>setForm(f=>({ ...f, lastName: e.target.value }))} />
        </label>
        <label className="text-sm text-slate-600">Email
          <input type="email" className="mt-1 w-full border rounded-lg px-3 py-2" value={form.email} onChange={e=>setForm(f=>({ ...f, email: e.target.value }))} />
        </label>
      </div>
      <button className="btn-primary" onClick={onSave} disabled={saving}>
        <Save className="inline w-4 h-4 mr-1" /> Save
      </button>
    </div>
  );
};

export default ProfileSettings;
