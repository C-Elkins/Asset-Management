import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      settings: {
        system: {
          showTooltips: true,
          darkMode: false
        }
      },
      
      // Update specific setting
      updateSetting: (category, key, value) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [category]: {
              ...state.settings[category],
              [key]: value
            }
          }
        }));
      },

      // Toggle tooltips globally
      toggleTooltips: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            system: {
              ...state.settings.system,
              showTooltips: !state.settings.system.showTooltips
            }
          }
        }));
      },

      // Toggle dark mode for app shell only
      toggleDarkMode: () => {
        // Feature flag: default OFF unless explicitly set to 'on'
        const DARK_MODE_ENABLED = (typeof localStorage !== 'undefined' && localStorage.getItem('feature_dark_mode') === 'on');
        if (!DARK_MODE_ENABLED) {
          console.warn('[settingsStore] Dark mode is disabled by feature flag.');
          return;
        }
        set((state) => {
          const newDarkMode = !state.settings.system.darkMode;
          const appRoot = document.getElementById('app-root');
          if (appRoot) {
            if (newDarkMode) {
              appRoot.classList.add('dark-mode');
            } else {
              appRoot.classList.remove('dark-mode');
            }
          }
          
          return {
            settings: {
              ...state.settings,
              system: {
                ...state.settings.system,
                darkMode: newDarkMode
              }
            }
          };
        });
      },

      // Set dark mode explicitly for app shell only
      setDarkMode: (enabled) => {
        const DARK_MODE_ENABLED = (typeof localStorage !== 'undefined' && localStorage.getItem('feature_dark_mode') === 'on');
        if (!DARK_MODE_ENABLED) {
          console.warn('[settingsStore] Dark mode is disabled by feature flag.');
          enabled = false;
        }
        set((state) => {
          const appRoot = document.getElementById('app-root');
          if (appRoot) {
            if (enabled) {
              appRoot.classList.add('dark-mode');
            } else {
              appRoot.classList.remove('dark-mode');
            }
          }
          
          return {
            settings: {
              ...state.settings,
              system: {
                ...state.settings.system,
                darkMode: enabled
              }
            }
          };
        });
      },

      // Batch update settings
      updateSettings: (newSettings) => {
        set({ settings: { ...get().settings, ...newSettings } });
      },

      // Reset settings to defaults
      resetSettings: () => {
        const appRoot = document.getElementById('app-root');
        if (appRoot) appRoot.classList.remove('dark-mode');
        set({
          settings: {
            system: {
              showTooltips: true,
              darkMode: false
            }
          }
        });
      }
    }),
    {
      name: 'app-settings-storage',
      // Initialize dark mode on load
      onRehydrateStorage: () => (state) => {
        try {
          const DARK_MODE_ENABLED = (typeof localStorage !== 'undefined' && localStorage.getItem('feature_dark_mode') === 'on');
          const appRoot = document.getElementById('app-root');
          if (!appRoot) return;
          if (DARK_MODE_ENABLED && state?.settings?.system?.darkMode) {
            appRoot.classList.add('dark-mode');
          } else {
            appRoot.classList.remove('dark-mode');
          }
        } catch {
          // noop
        }
      }
    }
  )
);
