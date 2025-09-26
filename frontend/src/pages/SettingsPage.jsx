import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Server, Bell, Palette, Globe, Save, RefreshCw } from 'lucide-react';

export const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [settings, setSettings] = useState({
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
      maxUsers: 50
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      maintenanceAlerts: true,
      weeklyReports: true
    }
  });

  const sections = [
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: User,
      description: 'Personal information and account details'
    },
    {
      id: 'security', 
      title: 'Security',
      icon: Shield,
      description: 'Authentication and security preferences'
    },
    {
      id: 'system',
      title: 'System Configuration',
      icon: Server,
      description: 'System-wide settings and maintenance'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      description: 'Alerts and communication preferences'
    }
  ];

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    if (confirm('Reset all settings to default values?')) {
      alert('Settings reset to defaults!');
    }
  };

  const toggleSetting = (section, key) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key]
      }
    }));
  };

  const activeData = settings[activeSection];
  const activeInfo = sections.find(s => s.id === activeSection);

  return (
    <div className="p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-slate-900 mb-2">System Settings</h1>
        <p className="text-slate-600">Manage your account, security, and system preferences</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Navigation */}
        <motion.div 
          className="lg:w-1/4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="space-y-2">
            {sections.map((section) => {
              const IconComponent = section.icon;
              return (
                <motion.button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                    activeSection === section.id
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900'
                  }`}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-5 h-5" strokeWidth={2} />
                    <div>
                      <p className="font-semibold text-sm">{section.title}</p>
                      <p className="text-xs opacity-75">{section.description}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Settings Content */}
        <motion.div 
          className="lg:w-3/4"
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <activeInfo.icon className="w-6 h-6 text-blue-600" strokeWidth={2} />
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{activeInfo.title}</h2>
                  <p className="text-slate-600 text-sm">{activeInfo.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <motion.button 
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </motion.button>
                <motion.button 
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </motion.button>
              </div>
            </div>

            {/* Settings Form */}
            <div className="space-y-6">
              {Object.entries(activeData).map(([key, value], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                >
                  <div>
                    <label className="font-medium text-slate-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </label>
                    <p className="text-sm text-slate-600 mt-1">
                      {typeof value === 'boolean' 
                        ? (value ? 'Enabled' : 'Disabled')
                        : `Current: ${value}`
                      }
                    </p>
                  </div>
                  
                  {typeof value === 'boolean' ? (
                    <motion.button
                      onClick={() => toggleSetting(activeSection, key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.span
                        className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                        animate={{ x: value ? 24 : 4 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </motion.button>
                  ) : (
                    <motion.button 
                      onClick={() => alert(`Edit ${key}: ${value}`)}
                      className="px-3 py-1 text-sm bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Edit
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
