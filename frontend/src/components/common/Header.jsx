import React from 'react';

export const Header = ({ user, onLogout }) => {

  return (
    <header className="app-header">
      <h1 className="app-title">IT Asset Management</h1>
      <div className="header-actions">
        {user && (
          <span className="muted">
            {user.username ? `Signed in as ${user.username}` : 'Signed in'}
            {user.roles && user.roles.length > 0 ? ` · ${user.roles.join(', ')}` : ''}
          </span>
        )}
        {onLogout && (
          <button onClick={onLogout} className="btn btn-danger">
            Logout
          </button>
        )}
      </div>
    </header>
  );
};
