import React, { useState, useEffect } from 'react';
import { User, CategoryWithPreference, BusinessProfile } from '../types/api';
import { UserManagement } from './UserManagement';
import { Building2, FolderTree, Users, Database, FileSpreadsheet, Keyboard, Info, Shield, Moon, Sun, Bell, Globe, Workflow, Lock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SettingsPageProps {
  currentUser: User | null;
  categories: CategoryWithPreference[];
  businessProfile: BusinessProfile | null;
  stats: { total: number };
  dbStats: { databaseSizeMB: string; totalAssets: number; ftsRecords: number; totalIndexes: number } | null;
  onOpenCategoryManager: () => void;
  onOpenSetupWizard: () => void;
  onRefreshDbStats: () => void;
}

type SettingsTab = 'general' | 'notifications' | 'regional' | 'workflow' | 'security' | 'categories' | 'users' | 'database' | 'data' | 'shortcuts' | 'about';

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentUser,
  categories,
  businessProfile,
  stats,
  dbStats,
  onOpenCategoryManager,
  onOpenSetupWizard,
  onRefreshDbStats,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const { theme, actualTheme, setTheme } = useTheme();

  const isAdmin = currentUser?.role === 'admin';

  const tabs: Array<{ id: SettingsTab; label: string; icon: React.ReactNode; adminOnly?: boolean }> = [
    { id: 'general', label: 'General', icon: <Building2 size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'regional', label: 'Regional', icon: <Globe size={18} /> },
    { id: 'workflow', label: 'Workflow', icon: <Workflow size={18} /> },
    { id: 'security', label: 'Security', icon: <Lock size={18} /> },
    { id: 'categories', label: 'Categories', icon: <FolderTree size={18} /> },
    { id: 'users', label: 'Users', icon: <Users size={18} />, adminOnly: true },
    { id: 'database', label: 'Database', icon: <Database size={18} /> },
    { id: 'data', label: 'Import/Export', icon: <FileSpreadsheet size={18} /> },
    { id: 'shortcuts', label: 'Shortcuts', icon: <Keyboard size={18} /> },
    { id: 'about', label: 'About', icon: <Info size={18} /> },
  ];

  const visibleTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your application preferences and configuration</p>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.adminOnly && (
                  <Shield size={14} className="text-purple-500" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Appearance Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Appearance</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Customize how the application looks</p>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme Mode</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Choose your preferred color theme
                      </p>
                    </div>
                    <div className="flex items-center gap-1 p-1 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => setTheme('light')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                          theme === 'light'
                            ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                        title="Light Mode"
                      >
                        <Sun size={16} />
                        <span className="text-sm font-medium">Light</span>
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                          theme === 'dark'
                            ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                        title="Dark Mode"
                      >
                        <Moon size={16} />
                        <span className="text-sm font-medium">Dark</span>
                      </button>
                      <button
                        onClick={() => setTheme('system')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                          theme === 'system'
                            ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                        title="System Default"
                      >
                        <Globe size={16} />
                        <span className="text-sm font-medium">System</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 px-3 py-2 rounded border border-gray-200 dark:border-gray-600">
                    {actualTheme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                    <span>
                      Currently using <span className="font-medium">{actualTheme}</span> theme
                      {theme === 'system' && ' (system preference)'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Business Profile</h3>
                {businessProfile && (
                  <div className="space-y-4 mb-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Company Name</p>
                        <p className="text-gray-900 dark:text-gray-100 font-medium">{businessProfile.company_name || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Type</p>
                        <p className="text-gray-900 dark:text-gray-100 font-medium capitalize">
                          {businessProfile.business_type?.replace('-', ' / ') || 'Not set'}
                        </p>
                      </div>
                    </div>
                    {businessProfile.default_location && (
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Default Location</p>
                          <p className="text-gray-900 dark:text-gray-100 font-medium">{businessProfile.default_location}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={() => {
                    const confirmReset = window.confirm(
                      'Re-running the Setup Wizard will reset your category selections.\n\n' +
                        'Old unselected categories will be deactivated. This may affect:\n' +
                        '• Assets assigned to deactivated categories\n' +
                        '• Inventory tracking for those assets\n' +
                        '• Reports and analytics\n\n' +
                        'Are you sure you want to continue?'
                    )
                    if (confirmReset) {
                      onOpenSetupWizard()
                    }
                  }}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  🔄 Re-run Setup Wizard
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Notification Preferences</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Configure how you receive alerts and updates</p>

                {/* Email Notifications */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Receive notifications via email
                      </p>
                    </div>
                    <button
                      onClick={() => alert('Email notification settings will be saved to database')}
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 dark:bg-gray-600 transition-colors"
                    >
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                    </button>
                  </div>
                </div>

                {/* Desktop Notifications */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Desktop Notifications</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Show desktop notifications for important events
                      </p>
                    </div>
                    <button
                      onClick={() => alert('Desktop notification settings will be saved to database')}
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500 transition-colors"
                    >
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                </div>

                {/* Activity Type Filters */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Notify me about:</p>
                  <div className="space-y-2">
                    {[
                      { label: 'Asset Updates', description: 'When assets are created, updated, or deleted' },
                      { label: 'Reservations', description: 'When assets are reserved or returned' },
                      { label: 'Maintenance', description: 'When maintenance is due or completed' },
                      { label: 'Low Stock', description: 'When inventory levels are low' },
                      { label: 'User Actions', description: 'When users check out or return assets' },
                    ].map((item) => (
                      <label key={item.label} className="flex items-start gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Regional Formats Tab */}
          {activeTab === 'regional' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Regional Formats</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Configure date, time, and number formats</p>

                {/* Date Format */}
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Format
                  </label>
                  <select className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500">
                    <option>MM/DD/YYYY (12/28/2025)</option>
                    <option>DD/MM/YYYY (28/12/2025)</option>
                    <option>YYYY-MM-DD (2025-12-28)</option>
                    <option>DD MMM YYYY (28 Dec 2025)</option>
                  </select>
                </div>

                {/* Time Format */}
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Format
                  </label>
                  <select className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500">
                    <option>12-hour (3:45 PM)</option>
                    <option>24-hour (15:45)</option>
                  </select>
                </div>

                {/* Currency */}
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Currency
                  </label>
                  <select className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500">
                    <option>USD - US Dollar ($)</option>
                    <option>EUR - Euro (€)</option>
                    <option>GBP - British Pound (£)</option>
                    <option>CAD - Canadian Dollar (C$)</option>
                    <option>AUD - Australian Dollar (A$)</option>
                  </select>
                </div>

                {/* Number Format */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number Format
                  </label>
                  <select className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500">
                    <option>1,234.56 (US/UK)</option>
                    <option>1.234,56 (Europe)</option>
                    <option>1 234,56 (France)</option>
                  </select>
                </div>

                <button className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                  Save Regional Settings
                </button>
              </div>
            </div>
          )}

          {/* Workflow Defaults Tab */}
          {activeTab === 'workflow' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Workflow Defaults</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Set default values for common operations</p>

                {/* Default Reservation Duration */}
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Reservation Duration
                  </label>
                  <select className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500">
                    <option>1 Day</option>
                    <option>3 Days</option>
                    <option>1 Week</option>
                    <option>2 Weeks</option>
                    <option>1 Month</option>
                  </select>
                </div>

                {/* Default Asset Status */}
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Asset Status for New Assets
                  </label>
                  <select className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500">
                    <option>Available</option>
                    <option>In Use</option>
                    <option>Under Maintenance</option>
                    <option>Retired</option>
                  </select>
                </div>

                {/* Auto-Approval Settings */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-Approve Reservations</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Automatically approve reservation requests without manual review
                      </p>
                    </div>
                    <button
                      onClick={() => alert('Auto-approval settings will be saved to database')}
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 dark:bg-gray-600 transition-colors"
                    >
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                    </button>
                  </div>
                </div>

                <button className="w-full mt-4 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                  Save Workflow Defaults
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">App Access Control</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Manage authentication and session settings</p>

                {/* Require Login */}
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Require Login for App Access</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Users must authenticate to use the application
                      </p>
                    </div>
                    <button
                      onClick={() => alert('Login requirement will be saved to database')}
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500 transition-colors"
                    >
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                    </button>
                  </div>
                </div>

                {/* Session Timeout */}
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Session Timeout
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Automatically log out users after period of inactivity
                  </p>
                  <select className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500">
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>2 hours</option>
                    <option>4 hours</option>
                    <option>Never</option>
                  </select>
                </div>

                {/* Idle Timeout Warning */}
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <Bell size={18} className="text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-300">Security Tip</p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                        Enable session timeout to protect sensitive data when users leave their workstations unattended.
                      </p>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-4 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                  Save Security Settings
                </button>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Category Management</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Configure and organize your asset categories</p>
                {categories.length > 0 && (
                  <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Categories</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{categories.length}</p>
                      </div>
                      <div className="text-4xl">📋</div>
                    </div>
                  </div>
                )}
                <button
                  onClick={onOpenCategoryManager}
                  disabled={!currentUser}
                  className={`w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium ${!currentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={!currentUser ? "Login Required" : "Manage Categories"}
                >
                  ⚙️ Manage Categories
                </button>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <UserManagement currentUser={currentUser} />
            </div>
          )}

          {/* Database Tab */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Database Optimization</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Maintain performance and manage storage</p>
                <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Optimize your database to improve performance and reclaim unused space.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    This process runs VACUUM and ANALYZE to compact the database and update query planner statistics.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const result = await window.api.optimizeDatabase()
                      if (result.success) {
                        alert(
                          `Database optimized successfully!\n\n` +
                            `${result.message}\n` +
                            (result.sizeMB ? `Database size: ${result.sizeMB.toFixed(2)} MB` : '')
                        )
                      }
                    } catch (error) {
                      console.error('Database optimization failed:', error)
                      alert('Failed to optimize database. Please try again.')
                    }
                  }}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium mb-6"
                >
                  🚀 Optimize Database
                </button>
              </div>

              {/* Database Stats */}
              {dbStats && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Database Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                      <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Database Size</span>
                      <span className="text-xl font-bold text-purple-700 dark:text-purple-400">{dbStats.databaseSizeMB} MB</span>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Total Assets</span>
                      <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.total.toLocaleString()}</span>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">FTS Records</span>
                      <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{dbStats.ftsRecords.toLocaleString()}</span>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Total Indexes</span>
                      <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{dbStats.totalIndexes}</span>
                    </div>
                  </div>
                  <button
                    onClick={onRefreshDbStats}
                    className="mt-4 w-full px-3 py-2 text-sm bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors font-medium border border-purple-100 dark:border-purple-800"
                  >
                    🔄 Refresh Stats
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Data Import/Export Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Data Management</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Import, export, and backup your data</p>
              </div>

              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1 font-medium">Export Your Data</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Download all your assets and categories in CSV format for backup or external analysis.
                </p>
                <button
                  onClick={() => {
                    alert('CSV Export feature coming soon!\n\nYou will be able to export:\n• All assets\n• Categories\n• Assignments\n• Activity logs')
                  }}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border-2 border-orange-600 dark:border-orange-700 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors font-medium text-sm"
                >
                  📊 Export to CSV
                </button>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1 font-medium">Import Data</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Bulk import assets from CSV files with field mapping and validation.
                </p>
                <button
                  onClick={() => {
                    alert('CSV Import feature coming soon!\n\nYou will be able to:\n• Import multiple assets at once\n• Map CSV columns to fields\n• Validate data before import\n• Download import templates')
                  }}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border-2 border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
                >
                  📁 Import from CSV
                </button>
              </div>
            </div>
          )}

          {/* Keyboard Shortcuts Tab */}
          {activeTab === 'shortcuts' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Keyboard Shortcuts</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Power user productivity features</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">New Asset</span>
                  <kbd className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded font-mono text-sm text-gray-900 dark:text-gray-100">Ctrl+N</kbd>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Focus Search</span>
                  <kbd className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded font-mono text-sm text-gray-900 dark:text-gray-100">Ctrl+F</kbd>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Edit Selected</span>
                  <kbd className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded font-mono text-sm text-gray-900 dark:text-gray-100">Ctrl+E</kbd>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Delete Selected</span>
                  <kbd className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded font-mono text-sm text-gray-900 dark:text-gray-100">Delete</kbd>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600 dark:text-gray-400">Close Modal</span>
                  <kbd className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded font-mono text-sm text-gray-900 dark:text-gray-100">Esc</kbd>
                </div>
              </div>
              <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  💡 <span className="font-medium">Tip:</span> Most shortcuts are available when viewing the Assets page.
                </p>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">About</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Application</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Krubles Asset Manager</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Version</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">1.0.0</p>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Built with modern web technologies for efficient asset tracking and management.
                    Features include inventory tracking, QR code generation, barcode support, maintenance scheduling, and comprehensive reporting.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
