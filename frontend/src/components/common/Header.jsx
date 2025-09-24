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
  const [activeIndex, setActiveIndex] = useState(0);
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

  const options = [
    { label: '☀️ Light', value: THEMES.LIGHT },
    { label: '🌙 Dark', value: THEMES.DARK },
    { label: '🖥️ System', value: THEMES.SYSTEM },
  ];

  const onMenuKeyDown = (e) => {
    if (!menuOpen) return;
    if (e.key === 'Escape') { setMenuOpen(false); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => (i + 1) % options.length); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => (i - 1 + options.length) % options.length); return; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const opt = options[activeIndex]; if (opt) setThemePref(opt.value); return; }
  };

  return (
    <header className="app-header">
      <h1 className="app-title">IT Asset Management</h1>
      <div className="header-actions">
        <div className="dropdown" onKeyDown={onMenuKeyDown}>
          <button
            type="button"
            className="btn btn-primary"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`Theme: ${themeLabel}. Open to change.`}
            title={`Theme: ${themeLabel}`}
            onClick={() => { setMenuOpen(v => !v); setActiveIndex(0); }}
          >
            <span style={{ marginRight: '0.4rem' }}>{themeIcon}</span>
            Theme
          </button>
          {menuOpen && (
            <div className="dropdown-menu" role="menu">
              {options.map((opt, idx) => (
                <button
                  key={opt.value}
                  className="dropdown-item"
                  role="menuitemradio"
                  aria-checked={getSavedTheme() === opt.value}
                  aria-current={getSavedTheme() === opt.value}
                  tabIndex={idx === activeIndex ? 0 : -1}
                  onClick={() => setThemePref(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
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
