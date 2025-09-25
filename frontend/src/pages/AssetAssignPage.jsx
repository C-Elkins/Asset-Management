import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assetService } from '../services/assetService.js';
import { UserAssignmentModal } from '../components/assets/UserAssignmentModal.jsx';

export const AssetAssignPage = () => {
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

  if (loading) return <div className="loading">Loading asset...</div>;
  if (error || !asset) return <div className="error">{error || 'Asset not found.'}</div>;

  return (
    <div className="page-content">
      <UserAssignmentModal 
        asset={asset}
        onClose={() => navigate(-1)}
        onAssign={() => navigate(-1)}
      />
    </div>
  );
};
