import { useEffect, useMemo, useState } from 'react';

// Keep defaults in one place to match AdminCustomizationCenter
const getDefaultCustomization = () => ({
  branding: {
    companyName: 'Krubles Asset Management',
    primaryColor: '#10b981',
    secondaryColor: '#059669',
    accentColor: '#047857',
    logoUrl: '',
    logoFile: null,
  },
  terminology: {
    assets: 'Assets',
    maintenance: 'Maintenance',
    reports: 'Reports',
    reportSingular: 'Report',
    dashboard: 'Dashboard',
    assetSingular: 'Asset',
    maintenanceSingular: 'Maintenance Record',
  },
  layout: {
    showMetrics: true,
    showCharts: true,
    showRecentActivity: true,
    defaultAssetView: 'grid',
    compactMode: false,
  },
  notifications: {
    lowStockThreshold: 10,
    maintenanceDueDays: 7,
    emailDigest: 'daily',
  },
  theme: {
    mode: 'light',
    fontSize: 'medium',
    spacing: 'comfortable',
  },
});

/**
 * useCustomization
 * - Reads customization from localStorage (key: app_customization)
 * - Listens to 'customization-updated' window events to keep state in sync
 * - Provides merged defaults + saved config
 */
export function useCustomization() {
  const [customization, setCustomization] = useState(() => {
    try {
      const saved = localStorage.getItem('app_customization');
      return saved ? { ...getDefaultCustomization(), ...JSON.parse(saved) } : getDefaultCustomization();
    } catch {
      return getDefaultCustomization();
    }
  });

  useEffect(() => {
    const onUpdate = (e) => {
      const next = e?.detail;
      if (next) {
        setCustomization({ ...getDefaultCustomization(), ...next });
      }
    };
    window.addEventListener('customization-updated', onUpdate);
    return () => window.removeEventListener('customization-updated', onUpdate);
  }, []);

  // Expose convenient memoized pieces
  const terminology = useMemo(() => customization.terminology, [customization]);
  const branding = useMemo(() => customization.branding, [customization]);

  return { customization, terminology, branding };
}

export default useCustomization;
