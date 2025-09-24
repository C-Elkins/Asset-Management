import React from 'react';
import { AssetForm } from '../components/assets/AssetForm.jsx';

export const AssetCreatePage = () => {
  return (
    <div className="assets-page">
      <div className="page-header">
        <h1 className="h1">Add New Asset</h1>
        <p className="subtle">Create a new asset and set its status, category, and details.</p>
      </div>
      <div className="asset-list-container" style={{ padding: '1rem' }}>
        <AssetForm onSubmit={() => history.back()} onCancel={() => history.back()} />
      </div>
    </div>
  );
};
