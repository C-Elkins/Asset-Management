import React, { useEffect, useState } from 'react';
import { authService } from '../../services/authService.js';

export const MfaTotpSetup = () => {
  const [qr, setQr] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { secret: s, qrCodeDataUri } = await authService.enrollTotp();
        setSecret(s);
        setQr(qrCodeDataUri);
      } catch (e) {
        setStatus(e.message || 'Failed to start MFA enrollment');
      }
    })();
  }, []);

  const verify = async () => {
    try {
      await authService.verifyTotp({ code });
      setStatus('MFA enabled');
    } catch (e) {
      setStatus(e.message || 'Verification failed');
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Multi-factor Authentication (TOTP)</h3>
      {qr ? <img src={qr} alt="Scan with Authenticator" style={{ width: 180, height: 180 }} /> : <div>Generating QR…</div>}
      <div className="text-xs text-slate-500">Secret: {secret}</div>
      <div className="flex gap-2 items-center">
        <input value={code} onChange={e=>setCode(e.target.value)} placeholder="Enter 6-digit code" className="border rounded px-3 py-2" />
        <button className="btn-primary" onClick={verify}>Verify</button>
      </div>
      {!!status && <div className="text-sm text-slate-700">{status}</div>}
    </div>
  );
};

export default MfaTotpSetup;
