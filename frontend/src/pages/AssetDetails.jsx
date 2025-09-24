import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { assetService } from '../services/assetService.js';

export const AssetDetails = () => {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await assetService.getById(id);
        setAsset(data);
      } catch (e) {
        setError('Failed to load asset');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="loading">Loading asset...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!asset) return <div className="error">Asset not found.</div>;

  return (
    <div className="asset-details">
      <h1>{asset.name} <span style={{ opacity: 0.6 }}>#{asset.assetTag}</span></h1>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <div><strong>Status:</strong> {asset.status}</div>
        <div><strong>Condition:</strong> {asset.condition}</div>
        {asset.brand && <div><strong>Brand:</strong> {asset.brand}</div>}
        {asset.model && <div><strong>Model:</strong> {asset.model}</div>}
        {asset.serialNumber && <div><strong>Serial:</strong> {asset.serialNumber}</div>}
        {asset.location && <div><strong>Location:</strong> {asset.location}</div>}
        {asset.category && <div><strong>Category:</strong> {asset.category.name}</div>}
        {asset.purchasePrice && <div><strong>Purchase Price:</strong> {asset.purchasePrice}</div>}
        {asset.purchaseDate && <div><strong>Purchased:</strong> {new Date(asset.purchaseDate).toLocaleDateString()}</div>}
        {asset.warrantyExpiry && <div><strong>Warranty:</strong> {new Date(asset.warrantyExpiry).toLocaleDateString()}</div>}
      </div>
    </div>
  );
};
