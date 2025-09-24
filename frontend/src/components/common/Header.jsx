import React from 'react';

export const Header = ({ user, onLogout }) => (
  <header style={{ padding: '1rem', background: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <h1 style={{ margin: 0, fontSize: '1.25rem' }}>IT Asset Management</h1>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      {user && (
        <span style={{ opacity: 0.85 }}>
          {user.username ? `Signed in as ${user.username}` : 'Signed in'}
          {user.roles && user.roles.length > 0 ? ` · ${user.roles.join(', ')}` : ''}
        </span>
      )}
      {onLogout && (
        <button onClick={onLogout} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer' }}>
          Logout
        </button>
      )}
    </div>
  </header>
);
