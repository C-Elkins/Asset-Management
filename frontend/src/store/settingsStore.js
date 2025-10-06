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
        if (state?.settings?.system?.darkMode) {
          const appRoot = document.getElementById('app-root');
          if (appRoot) appRoot.classList.add('dark-mode');
        }
      }
    }
  )
);
