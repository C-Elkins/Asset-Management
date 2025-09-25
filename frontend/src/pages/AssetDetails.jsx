import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assetService } from '../services/assetService.js';

export const AssetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await assetService.getById(id);
        setAsset(data);
      } catch {
        setError('Failed to load asset');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : 'N/A';

  if (loading) return <div className="loading">Loading asset...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!asset) return <div className="error">Asset not found.</div>;

  const statusClass = (asset.status || '').toLowerCase();
  const conditionClass = (asset.condition || '').toLowerCase();

  return (
    <div className="assets-page">
      <div className="page-header">
        <h1 className="h1">{asset.name} <span className="subtle">#{asset.assetTag}</span></h1>
        <div className="header-actions">
          <span className={`status-badge ${statusClass}`}>{asset.status?.replace('_',' ')}</span>
          <span className={`condition-badge ${conditionClass}`}>{asset.condition}</span>
          <button className="btn-outline" onClick={() => navigate(`/app/assets/${asset.id}/assign`)}>Manage Assignment</button>
          <button className="btn-primary" onClick={() => navigate('/app/assets')}>Back to Assets</button>
        </div>
      </div>

      <div className="detail-grid">
        <section className="detail-card">
          <h3 className="card-title">Overview</h3>
          <div className="kv">
            {asset.brand && <div className="kv-row"><span className="kv-label">Brand</span><span className="kv-value">{asset.brand}</span></div>}
            {asset.model && <div className="kv-row"><span className="kv-label">Model</span><span className="kv-value">{asset.model}</span></div>}
            {asset.serialNumber && <div className="kv-row"><span className="kv-label">Serial</span><span className="kv-value">{asset.serialNumber}</span></div>}
            {asset.category && <div className="kv-row"><span className="kv-label">Category</span><span className="kv-value">{asset.category.name}</span></div>}
          </div>
        </section>

        <section className="detail-card">
          <h3 className="card-title">Location</h3>
          <div className="kv">
            <div className="kv-row"><span className="kv-label">Location</span><span className="kv-value">{asset.location || '—'}</span></div>
            {asset.status === 'ASSIGNED' && asset.assignedUsers?.length > 0 && (
              <div className="kv-row"><span className="kv-label">Assigned To</span>
                <span className="kv-value">
                  {asset.assignedUsers.map(u => `${u.firstName} ${u.lastName}`).join(', ')}
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="detail-card">
          <h3 className="card-title">Purchase & Warranty</h3>
          <div className="kv">
            <div className="kv-row"><span className="kv-label">Purchase Price</span><span className="kv-value">{asset.purchasePrice ? formatCurrency(asset.purchasePrice) : '—'}</span></div>
            <div className="kv-row"><span className="kv-label">Purchased</span><span className="kv-value">{fmtDate(asset.purchaseDate)}</span></div>
            <div className="kv-row"><span className="kv-label">Warranty</span><span className="kv-value">{fmtDate(asset.warrantyExpiry)}</span></div>
          </div>
        </section>
      </div>
    </div>
  );
};
