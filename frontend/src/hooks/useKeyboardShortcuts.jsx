import { useEffect } from 'react';

export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Don't trigger shortcuts when typing in inputs
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      const key = event.key.toLowerCase();
      const ctrlKey = event.ctrlKey || event.metaKey;
      const altKey = event.altKey;
      const shiftKey = event.shiftKey;

      shortcuts.forEach(shortcut => {
        const matches = 
          shortcut.key.toLowerCase() === key &&
          !!shortcut.ctrl === ctrlKey &&
          !!shortcut.alt === altKey &&
          !!shortcut.shift === shiftKey;

        if (matches) {
          event.preventDefault();
          shortcut.action();
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Keyboard shortcut helper component
export const KeyboardShortcuts = ({ shortcuts }) => {
  useKeyboardShortcuts(shortcuts);
  return null;
};

// Shortcut display component
export const ShortcutsHelp = ({ show, onClose, shortcuts }) => {
  if (!show) return null;

  const formatShortcut = (shortcut) => {
    const keys = [];
    if (shortcut.ctrl) keys.push('Ctrl');
    if (shortcut.alt) keys.push('Alt');
    if (shortcut.shift) keys.push('Shift');
    keys.push(shortcut.key.toUpperCase());
    return keys.join(' + ');
  };

  return (
    <div className="shortcuts-overlay">
      <div className="shortcuts-modal">
        <div className="shortcuts-header">
          <h3>Keyboard Shortcuts</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="shortcuts-list">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="shortcut-item">
              <span className="shortcut-keys">{formatShortcut(shortcut)}</span>
              <span className="shortcut-description">{shortcut.description}</span>
            </div>
          ))}
        </div>
        <div className="shortcuts-footer">
          <p>Press ? to toggle this help</p>
        </div>
      </div>
    </div>
  );
};
