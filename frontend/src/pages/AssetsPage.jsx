import React from 'react';
import { AssetList } from '../components/assets/AssetList.jsx';

export const AssetsPage = () => {
  return (
    <div className="assets-page">
      <div className="page-header">
        <h1>Asset Management</h1>
        <p>Manage your organization's IT assets, track assignments, and monitor maintenance.</p>
      </div>
      <AssetList />
    </div>
  );
};
