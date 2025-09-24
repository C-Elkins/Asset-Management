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

  const [menuOpen, setMenuOpen] = useState(false);
  const themeLabel = theme === THEMES.DARK ? 'Dark' : 'Light';
  const themeIcon = theme === THEMES.DARK ? '🌙' : '☀️';

  useEffect(() => {
    const onDocClick = (e) => {
      // Close menu when clicking outside
      if (!e.target.closest('.dropdown')) setMenuOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const setThemePref = (pref) => {
    setSavedTheme(pref);
    applyTheme(pref);
    setTheme(getEffectiveTheme(pref));
    setMenuOpen(false);
  };

  return (
    <header className="app-header">
      <h1 className="app-title">IT Asset Management</h1>
      <div className="header-actions">
        <div className="dropdown">
          <button
            type="button"
            className="btn btn-primary"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`Theme: ${themeLabel}. Open to change.`}
            title={`Theme: ${themeLabel}`}
            onClick={() => setMenuOpen(v => !v)}
          >
            <span style={{ marginRight: '0.4rem' }}>{themeIcon}</span>
            Theme
          </button>
          {menuOpen && (
            <div className="dropdown-menu" role="menu">
              <button className="dropdown-item" role="menuitem" onClick={() => setThemePref(THEMES.LIGHT)} aria-current={getSavedTheme() === THEMES.LIGHT}>
                ☀️ Light
              </button>
              <button className="dropdown-item" role="menuitem" onClick={() => setThemePref(THEMES.DARK)} aria-current={getSavedTheme() === THEMES.DARK}>
                🌙 Dark
              </button>
              <button className="dropdown-item" role="menuitem" onClick={() => setThemePref(THEMES.SYSTEM)} aria-current={getSavedTheme() === THEMES.SYSTEM}>
                🖥️ System
              </button>
            </div>
          )}
        </div>
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
