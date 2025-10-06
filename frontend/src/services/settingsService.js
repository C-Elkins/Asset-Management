import { api } from './api';

const STORAGE_KEY = 'APP_SETTINGS';

const DEFAULT_SETTINGS = Object.freeze({
  profile: {
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'IT Administrator',
    department: 'Information Technology'
  },
  security: {
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordStrength: 'Strong',
    lastPasswordChange: '2024-01-15'
  },
  system: {
    backupEnabled: true,
    maintenanceWindow: '02:00 - 04:00',
    logLevel: 'INFO',
    maxUsers: 50,
    showTooltips: true
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    maintenanceAlerts: true,
    weeklyReports: true
  },
  privacy: {
    marketingEmails: false,
    analytics: true,
    dataProcessing: true,
    shareWithThirdParties: false
  },
  billing: {
    autoRenew: true,
    invoiceEmails: true,
    paymentReminders: true,
    usageAlerts: false
  }
});

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStorage(val) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
  } catch {}
}

export async function getSettings() {
  try {
    const { data } = await api.get('/settings');
    // persist a copy locally as a cache
    const sanitized = { ...data };
    // Remove any legacy darkMode field if present
    if (sanitized?.system?.darkMode !== undefined) {
      sanitized.system = { ...sanitized.system };
      delete sanitized.system.darkMode;
    }
    writeStorage(sanitized);
    return sanitized;
  } catch {
    const cached = readStorage();
    if (cached) {
      // Remove any legacy darkMode field if present
      if (cached?.system?.darkMode !== undefined) {
        cached.system = { ...cached.system };
        delete cached.system.darkMode;
        writeStorage(cached);
      }
      return cached;
    }
    // seed defaults locally so user changes persist even without backend
    writeStorage(DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS };
  }
}

export async function updateSettings(patch) {
  // Merge current + patch for local fallback
  const current = await getSettings();
  const merged = { ...current, ...patch };
  // Strip legacy darkMode
  if (merged?.system?.darkMode !== undefined) {
    merged.system = { ...merged.system };
    delete merged.system.darkMode;
  }
  try {
    const { data } = await api.put('/settings', patch);
    const sanitized = { ...data };
    if (sanitized?.system?.darkMode !== undefined) {
      sanitized.system = { ...sanitized.system };
      delete sanitized.system.darkMode;
    }
    writeStorage(sanitized);
    return sanitized;
  } catch {
    writeStorage(merged);
    return merged;
  }
}

export function getDefaultSettings() {
  return { ...DEFAULT_SETTINGS };
}
