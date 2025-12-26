import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette,
  CheckCircle,
  AlertTriangle,
  Info,
  Bell,
  Plus,
  Download,
  Settings,
  Package,
  Database,
  CreditCard,
  Shield
} from 'lucide-react';

export function ComponentShowcaseModern() {
  const [activeTab, setActiveTab] = useState('colors');

  const tabs = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'buttons', label: 'Buttons', icon: Package },
    { id: 'cards', label: 'Cards', icon: Database },
    { id: 'badges', label: 'Badges', icon: Bell },
  ];

  return (
    <div className="showcase-page-modern">
      {/* Hero Section */}
      <div className="showcase-hero">
        <div className="showcase-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Palette className="w-8 h-8 text-emerald-700" />
              <h1 className="text-3xl font-bold text-gray-900">Design System</h1>
            </div>
            <p className="text-gray-600">Krubles emerald-themed components and design tokens</p>
          </motion.div>
        </div>
      </div>

      <div className="showcase-container">
        {/* Tab Navigation */}
        <div className="showcase-tabs">
          {tabs.map((tab, idx) => {
            const TabIcon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                onClick={() => setActiveTab(tab.id)}
                className={`showcase-tab ${activeTab === tab.id ? 'showcase-tab-active' : ''}`}
              >
                <TabIcon className="w-5 h-5" />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Colors Section */}
        {activeTab === 'colors' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="showcase-section"
          >
            <div className="showcase-card">
              <div className="showcase-card-header">
                <h2>Brand Colors</h2>
                <p>Krubles emerald color palette</p>
              </div>
              <div className="showcase-card-content">
                <div className="showcase-color-grid">
                  <div className="showcase-color-item">
                    <div className="showcase-color-swatch" style={{ background: '#10b981' }}></div>
                    <div>
                      <div className="font-semibold">Emerald 500</div>
                      <div className="text-sm text-gray-600">#10b981</div>
                    </div>
                  </div>
                  <div className="showcase-color-item">
                    <div className="showcase-color-swatch" style={{ background: '#059669' }}></div>
                    <div>
                      <div className="font-semibold">Emerald 600</div>
                      <div className="text-sm text-gray-600">#059669</div>
                    </div>
                  </div>
                  <div className="showcase-color-item">
                    <div className="showcase-color-swatch" style={{ background: '#047857' }}></div>
                    <div>
                      <div className="font-semibold">Emerald 700</div>
                      <div className="text-sm text-gray-600">#047857</div>
                    </div>
                  </div>
                  <div className="showcase-color-item">
                    <div className="showcase-color-swatch" style={{ background: '#d1fae5' }}></div>
                    <div>
                      <div className="font-semibold">Emerald 100</div>
                      <div className="text-sm text-gray-600">#d1fae5</div>
                    </div>
                  </div>
                  <div className="showcase-color-item">
                    <div className="showcase-color-swatch" style={{ background: '#a7f3d0' }}></div>
                    <div>
                      <div className="font-semibold">Emerald 200</div>
                      <div className="text-sm text-gray-600">#a7f3d0</div>
                    </div>
                  </div>
                  <div className="showcase-color-item">
                    <div className="showcase-color-swatch" style={{ background: '#f0fdf4' }}></div>
                    <div>
                      <div className="font-semibold">Emerald 50</div>
                      <div className="text-sm text-gray-600">#f0fdf4</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="showcase-card">
              <div className="showcase-card-header">
                <h2>Accent Colors</h2>
                <p>Supporting colors for different contexts</p>
              </div>
              <div className="showcase-card-content">
                <div className="showcase-color-grid">
                  <div className="showcase-color-item">
                    <div className="showcase-color-swatch" style={{ background: '#3b82f6' }}></div>
                    <div>
                      <div className="font-semibold">Blue</div>
                      <div className="text-sm text-gray-600">Info / Links</div>
                    </div>
                  </div>
                  <div className="showcase-color-item">
                    <div className="showcase-color-swatch" style={{ background: '#f59e0b' }}></div>
                    <div>
                      <div className="font-semibold">Amber</div>
                      <div className="text-sm text-gray-600">Warning</div>
                    </div>
                  </div>
                  <div className="showcase-color-item">
                    <div className="showcase-color-swatch" style={{ background: '#ef4444' }}></div>
                    <div>
                      <div className="font-semibold">Red</div>
                      <div className="text-sm text-gray-600">Danger / Error</div>
                    </div>
                  </div>
                  <div className="showcase-color-item">
                    <div className="showcase-color-swatch" style={{ background: '#8b5cf6' }}></div>
                    <div>
                      <div className="font-semibold">Purple</div>
                      <div className="text-sm text-gray-600">Special</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Buttons Section */}
        {activeTab === 'buttons' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="showcase-section"
          >
            <div className="showcase-card">
              <div className="showcase-card-header">
                <h2>Button Styles</h2>
                <p>Primary and secondary button variants</p>
              </div>
              <div className="showcase-card-content">
                <div className="showcase-button-grid">
                  <button className="showcase-btn showcase-btn-primary">
                    <Plus className="w-4 h-4" />
                    Primary Button
                  </button>
                  <button className="showcase-btn showcase-btn-secondary">
                    <Download className="w-4 h-4" />
                    Secondary Button
                  </button>
                  <button className="showcase-btn showcase-btn-outline">
                    <Settings className="w-4 h-4" />
                    Outline Button
                  </button>
                  <button className="showcase-btn showcase-btn-danger">
                    <AlertTriangle className="w-4 h-4" />
                    Danger Button
                  </button>
                  <button className="showcase-btn showcase-btn-primary" disabled>
                    Disabled Button
                  </button>
                  <button className="showcase-btn showcase-btn-ghost">
                    Ghost Button
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Cards Section */}
        {activeTab === 'cards' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="showcase-section"
          >
            <div className="showcase-card">
              <div className="showcase-card-header">
                <h2>Card Components</h2>
                <p>Various card layouts and styles</p>
              </div>
              <div className="showcase-card-content">
                <div className="showcase-cards-demo">
                  <div className="showcase-demo-card">
                    <div className="showcase-demo-card-icon">
                      <Package className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3>Metric Card</h3>
                    <div className="showcase-demo-card-value">1,234</div>
                    <p className="text-sm text-gray-600">Total Assets</p>
                  </div>

                  <div className="showcase-demo-card">
                    <div className="showcase-demo-card-icon">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3>Status Card</h3>
                    <div className="showcase-demo-card-value">Active</div>
                    <p className="text-sm text-gray-600">Subscription Status</p>
                  </div>

                  <div className="showcase-demo-card">
                    <div className="showcase-demo-card-icon">
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3>Security Card</h3>
                    <div className="showcase-demo-card-value">Enabled</div>
                    <p className="text-sm text-gray-600">2FA Protection</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Badges Section */}
        {activeTab === 'badges' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="showcase-section"
          >
            <div className="showcase-card">
              <div className="showcase-card-header">
                <h2>Status Badges</h2>
                <p>Badges for different states and notifications</p>
              </div>
              <div className="showcase-card-content">
                <div className="showcase-badge-grid">
                  <div className="showcase-badge-item">
                    <span className="showcase-badge showcase-badge-success">
                      <CheckCircle className="w-4 h-4" />
                      Success
                    </span>
                    <span className="text-sm text-gray-600">Positive state</span>
                  </div>

                  <div className="showcase-badge-item">
                    <span className="showcase-badge showcase-badge-warning">
                      <AlertTriangle className="w-4 h-4" />
                      Warning
                    </span>
                    <span className="text-sm text-gray-600">Caution state</span>
                  </div>

                  <div className="showcase-badge-item">
                    <span className="showcase-badge showcase-badge-error">
                      <AlertTriangle className="w-4 h-4" />
                      Error
                    </span>
                    <span className="text-sm text-gray-600">Negative state</span>
                  </div>

                  <div className="showcase-badge-item">
                    <span className="showcase-badge showcase-badge-info">
                      <Info className="w-4 h-4" />
                      Info
                    </span>
                    <span className="text-sm text-gray-600">Informational</span>
                  </div>

                  <div className="showcase-badge-item">
                    <span className="showcase-badge showcase-badge-neutral">
                      Default
                    </span>
                    <span className="text-sm text-gray-600">Neutral state</span>
                  </div>

                  <div className="showcase-badge-item">
                    <span className="showcase-badge showcase-badge-emerald">
                      <Bell className="w-4 h-4" />
                      Active
                    </span>
                    <span className="text-sm text-gray-600">Emerald brand</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default ComponentShowcaseModern;
