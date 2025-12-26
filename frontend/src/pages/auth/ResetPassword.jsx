import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService.js';
import { useToast } from '../../components/common/Toast.jsx';

export const ResetPassword = () => {
  const { addToast } = useToast();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!token) { addToast({ type: 'error', title: 'Invalid link', message: 'Missing reset token.' }); return; }
    setBusy(true);
    try {
      await authService.resetPassword({ token, newPassword: password });
      addToast({ type: 'success', title: 'Password updated', message: 'You can now sign in.' });
    } catch (e) {
      addToast({ type: 'error', title: 'Reset failed', message: e.message || 'Unable to reset password' });
    } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-3 max-w-sm">
      <h2 className="text-xl font-semibold">Reset Password</h2>
      <input className="w-full border rounded px-3 py-2" placeholder="New password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button className="btn-primary" disabled={busy} type="submit">Reset Password</button>
    </form>
  );
};

export default ResetPassword;
