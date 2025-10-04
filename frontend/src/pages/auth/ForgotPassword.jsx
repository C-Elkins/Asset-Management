import React, { useState } from 'react';
import { authService } from '../../services/authService.js';
import { useToast } from '../../components/common/Toast.jsx';

export const ForgotPassword = () => {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authService.forgotPassword(email);
      addToast({ type: 'success', title: 'Check your email', message: 'If an account exists, a reset link was sent.' });
    } catch (e) {
      addToast({ type: 'error', title: 'Request failed', message: e.message || 'Unable to process request' });
    } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-3 max-w-sm">
      <h2 className="text-xl font-semibold">Forgot Password</h2>
      <input className="w-full border rounded px-3 py-2" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <button className="btn-primary" disabled={busy} type="submit">Send reset link</button>
    </form>
  );
};

export default ForgotPassword;
