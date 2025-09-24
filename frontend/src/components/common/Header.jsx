import React, { useEffect, useState } from 'react';
import { toggleTheme, getEffectiveTheme, listenToSystemTheme, THEMES, getSavedTheme, applyTheme, setSavedTheme } from '../../utils/theme.js';

export const Header = ({ user, onLogout }) => {
  const [theme, setTheme] = useState(() => getEffectiveTheme(getSavedTheme()));

  useEffect(() => {
    // ensure theme applied on mount and listen to system changes when pref is system
    try { applyTheme(getSavedTheme()); } catch {}
    const unlisten = listenToSystemTheme(next => setTheme(next));
    return () => unlisten();
  }, []);

  const handleToggleTheme = () => {
    const next = toggleTheme();
    setTheme(next);
  };

  const themeLabel = theme === THEMES.DARK ? 'Dark' : 'Light';
  const themeIcon = theme === THEMES.DARK ? '🌙' : '☀️';

  return (
    <header className="app-header">
      <h1 className="app-title">IT Asset Management</h1>
      <div className="header-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleToggleTheme}
          aria-label={`Toggle theme (current: ${themeLabel})`}
          title={`Theme: ${themeLabel} — click to toggle`}
        >
          <span style={{ marginRight: '0.4rem' }}>{themeIcon}</span>
          Theme
        </button>
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
