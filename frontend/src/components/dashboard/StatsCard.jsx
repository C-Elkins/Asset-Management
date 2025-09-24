import React from 'react';

export const StatsCard = ({ label, value }) => (
  <div style={{ border: '1px solid #e5e7eb', padding: '1rem', borderRadius: 8 }}>
    <div style={{ color: '#6b7280', fontSize: 12 }}>{label}</div>
    <div style={{ fontSize: 24, fontWeight: 600 }}>{value}</div>
  </div>
);
