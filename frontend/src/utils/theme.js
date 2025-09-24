// Theme utilities: system + persisted preference with [data-theme] on <html>

const STORAGE_KEY = 'iam.theme';
export const THEMES = { LIGHT: 'light', DARK: 'dark', SYSTEM: 'system' };

export function getSavedTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) || THEMES.SYSTEM;
  } catch {
    return THEMES.SYSTEM;
  }
}

export function getSystemTheme() {
  if (typeof window === 'undefined') return THEMES.LIGHT;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? THEMES.DARK
    : THEMES.LIGHT;
}

export function getEffectiveTheme(pref = getSavedTheme()) {
  return pref === THEMES.SYSTEM ? getSystemTheme() : pref;
}

export function applyTheme(pref = getSavedTheme()) {
  const effective = getEffectiveTheme(pref);
  document.documentElement.setAttribute('data-theme', effective);
}

export function setSavedTheme(pref) {
  try { localStorage.setItem(STORAGE_KEY, pref); } catch {}
}

export function toggleTheme() {
  const currentPref = getSavedTheme();
  const current = getEffectiveTheme(currentPref);
  const next = current === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
  setSavedTheme(next);
  applyTheme(next);
  return next;
}

// Attach system theme listener to update when pref is SYSTEM
export function listenToSystemTheme(onChange) {
  if (!window.matchMedia) return () => {};
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => {
    if (getSavedTheme() === THEMES.SYSTEM) {
      applyTheme(THEMES.SYSTEM);
      onChange && onChange(getEffectiveTheme(THEMES.SYSTEM));
    }
  };
  mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler);
  return () => {
    mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler);
  };
}
