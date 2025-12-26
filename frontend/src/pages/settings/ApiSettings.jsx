import React, { useMemo } from 'react';

function decode(token) {
  try { const p = token.split('.')[1]; return JSON.parse(atob(p.replace(/-/g,'+').replace(/_/g,'/'))); } catch { return null; }
}

export const ApiSettings = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
  const token = (() => { try { return localStorage.getItem('jwt_token') || ''; } catch { return ''; } })();
  const claims = useMemo(() => decode(token), [token]);
  const [tenant, setTenant] = React.useState(() => { try { return localStorage.getItem('tenant_id') || ''; } catch { return ''; } });
  const saveTenant = () => { try { if (tenant) localStorage.setItem('tenant_id', tenant); else localStorage.removeItem('tenant_id'); } catch {} };

  const copy = (text) => { navigator.clipboard?.writeText(text); };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">API Settings</h2>
      <div className="grid gap-3 max-w-2xl">
        <div className="border rounded-lg p-3">
          <div className="text-sm text-slate-600">Base URL</div>
          <div className="flex items-center justify-between">
            <code className="text-sm">{baseUrl}</code>
            <button className="btn-outline" onClick={() => copy(baseUrl)}>Copy</button>
          </div>
        </div>
        <div className="border rounded-lg p-3">
          <div className="text-sm text-slate-600">Tenant ID</div>
          <div className="flex items-center gap-2">
            <input className="border rounded px-2 py-1" placeholder="acme" value={tenant} onChange={e=>setTenant(e.target.value)} />
            <button className="btn-outline" onClick={saveTenant}>Apply</button>
          </div>
          <div className="text-xs text-slate-500 mt-1">Sent as X-Tenant-Id header.</div>
        </div>
        <div className="border rounded-lg p-3">
          <div className="text-sm text-slate-600 mb-2">JWT</div>
          <div className="flex items-center justify-between">
            <code className="text-xs break-all">{token ? token.slice(0,30)+'…' : 'No token'}</code>
            {token && <button className="btn-outline" onClick={() => copy(token)}>Copy</button>}
          </div>
          {claims && (
            <pre className="mt-3 text-xs bg-slate-50 p-2 rounded">{JSON.stringify(claims, null, 2)}</pre>
          )}
          <div className="mt-2 text-xs text-slate-500">Swagger/OpenAPI (if enabled): {baseUrl.endsWith('/api/v1') ? baseUrl.slice(0, -7) : baseUrl}/swagger-ui.html</div>
        </div>
      </div>
    </div>
  );
};

export default ApiSettings;
