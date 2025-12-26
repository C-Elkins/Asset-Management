import React, { useRef, useState } from 'react';
import { exportService } from '../../services/exportService.js';

export const BackupRestore = () => {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState(null);

  const triggerImport = () => fileRef.current?.click();

  const importJson = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      // Support assets and categories in one file
      const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('jwt_token') || ''}` };
      let created = 0, updated = 0, failed = 0; const errors = [];
      if (Array.isArray(json.categories) && json.categories.length) {
        const r = await fetch(`${base}/imports/categories`, { method: 'POST', headers, body: JSON.stringify({ categories: json.categories }) });
        if (r.ok) { const s = await r.json(); created += s.created; updated += s.updated; failed += s.failed; if (s.errors) errors.push(...s.errors); }
      }
      if (Array.isArray(json.assets) && json.assets.length) {
        const r = await fetch(`${base}/imports/assets`, { method: 'POST', headers, body: JSON.stringify({ assets: json.assets }) });
        if (r.ok) { const s = await r.json(); created += s.created; updated += s.updated; failed += s.failed; if (s.errors) errors.push(...s.errors); }
      }
      setSummary({ created, updated, failed, errors: errors.slice(0,5) });
    } catch (err) {
      alert('Import failed: ' + (err?.message || 'Invalid file'));
    } finally { setBusy(false); }
  };

  const exportTemplate = () => {
    const data = { categories: [{ name: 'Laptops', description: 'Portable computers' }], assets: [{ assetTag: 'ASSET-001', name: 'MacBook Pro', status: 'AVAILABLE' }] };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'backup-template.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Backup & Restore</h2>
      <div className="space-x-2">
        <button className="btn-outline" onClick={() => exportService.exportToCSV([], 'assets-backup')}>Export Assets CSV</button>
        <button className="btn-outline" onClick={exportTemplate}>Download Combined Template</button>
        <input ref={fileRef} type="file" className="hidden" accept="application/json" onChange={importJson} />
        <button className="btn-primary" onClick={triggerImport} disabled={busy}>Import JSON</button>
      </div>
      {summary && (
        <div className="border rounded-lg p-3 text-sm">
          <div><strong>Imported:</strong> {summary.created} created, {summary.updated} updated, {summary.failed} failed</div>
          {summary.errors?.length > 0 && (
            <ul className="mt-2 text-slate-600 list-disc ml-5">
              {summary.errors.map((e, i) => <li key={i}>Row {e.index+1}: {e.message}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default BackupRestore;
