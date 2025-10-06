import React, { useState, useEffect, useCallback } from 'react';
import { assetService } from '../../services/assetService.js';
import { useNavigate } from 'react-router-dom';
import { useCustomization } from '../../hooks/useCustomization';

// Krubles Logo Component
const KrublesLogo = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="stemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor:'#6ee7b7', stopOpacity:1}} />
        <stop offset="50%" style={{stopColor:'#34d399', stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:'#10b981', stopOpacity:1}} />
      </linearGradient>
      <linearGradient id="topArmGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{stopColor:'#10b981', stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:'#059669', stopOpacity:1}} />
      </linearGradient>
      <linearGradient id="bottomArmGradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" style={{stopColor:'#047857', stopOpacity:1}} />
        <stop offset="100%" style={{stopColor:'#10b981', stopOpacity:1}} />
      </linearGradient>
    </defs>
    <circle cx="80" cy="100" r="40" fill="#a7f3d0" opacity="0.3"/>
    <circle cx="320" cy="300" r="50" fill="#6ee7b7" opacity="0.25"/>
    <circle cx="300" cy="120" r="35" fill="#34d399" opacity="0.2"/>
    <rect x="85" y="80" width="55" height="240" rx="27.5" fill="url(#stemGradient)"/>
    <path d="M 150 145 L 285 85 Q 305 78 315 95 L 325 115 Q 330 130 315 138 L 165 195 Q 148 202 145 185 Z" fill="url(#topArmGradient)"/>
    <path d="M 145 215 L 165 205 L 315 262 Q 330 270 325 285 L 315 305 Q 305 322 285 315 L 150 255 Q 140 250 145 235 Z" fill="url(#bottomArmGradient)"/>
    <circle cx="325" cy="105" r="20" fill="#10b981"/>
    <circle cx="330" cy="295" r="24" fill="#059669"/>
    <circle cx="70" cy="160" r="14" fill="#6ee7b7" opacity="0.8"/>
    <circle cx="65" cy="240" r="16" fill="#34d399" opacity="0.75"/>
    <circle cx="190" cy="120" r="6" fill="#d1fae5"/>
    <circle cx="200" cy="280" r="7" fill="#a7f3d0"/>
    <circle cx="250" cy="200" r="5" fill="#ecfdf5"/>
    <circle cx="340" cy="200" r="10" fill="#6ee7b7" opacity="0.6"/>
    <circle cx="60" cy="320" r="12" fill="#34d399" opacity="0.5"/>
  </svg>
);

export const Dashboard = () => {
  const navigate = useNavigate();
  const { terminology } = useCustomization();
  const [stats, setStats] = useState({
    totalAssets: 0,
    availableAssets: 0,
    assignedAssets: 0,
    maintenanceAssets: 0,
    totalValue: 0,
    categoryBreakdown: [],
    statusBreakdown: [],
    conditionBreakdown: [],
    warrantyExpiring: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentAssets, setRecentAssets] = useState([]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const assetsData = await assetService.list({ size: 1000 });
      const assets = Array.isArray(assetsData) ? assetsData : (assetsData.content || []);
      
      const calculatedStats = calculateStatistics(assets);
      const recent = [...assets]
        .map(a => ({
          ...a,
          _ts: a.updatedAt ? new Date(a.updatedAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0)
        }))
        .sort((a, b) => b._ts - a._ts)
        .slice(0, 5);
      setRecentAssets(recent);
      
      let backendStats = {};
      try {
        backendStats = await assetService.getStatistics();
      } catch {
        // Backend statistics endpoint may not exist
      }
      
      const mergedStats = { ...calculatedStats, ...backendStats };
      const finalStats = {
        ...mergedStats,
        totalAssets: typeof mergedStats.totalAssets === 'number' ? mergedStats.totalAssets : calculatedStats.totalAssets,
        availableAssets: typeof mergedStats.availableAssets === 'number' ? mergedStats.availableAssets : calculatedStats.availableAssets,
        assignedAssets: typeof mergedStats.assignedAssets === 'number' ? mergedStats.assignedAssets : calculatedStats.assignedAssets,
        maintenanceAssets: typeof mergedStats.maintenanceAssets === 'number' ? mergedStats.maintenanceAssets : calculatedStats.maintenanceAssets,
        totalValue: typeof mergedStats.totalValue === 'number' ? mergedStats.totalValue : calculatedStats.totalValue,
        statusBreakdown: Array.isArray(mergedStats.statusBreakdown) ? mergedStats.statusBreakdown : calculatedStats.statusBreakdown,
        conditionBreakdown: Array.isArray(mergedStats.conditionBreakdown) ? mergedStats.conditionBreakdown : calculatedStats.conditionBreakdown,
        categoryBreakdown: Array.isArray(mergedStats.categoryBreakdown) ? mergedStats.categoryBreakdown : calculatedStats.categoryBreakdown,
        warrantyExpiring: Array.isArray(mergedStats.warrantyExpiring) ? mergedStats.warrantyExpiring : calculatedStats.warrantyExpiring
      };

      setStats(finalStats);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      let errorMessage = 'Failed to load dashboard data.';
      if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to backend server. Please make sure your backend is running on http://localhost:8080';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please check your backend logs.';
      } else {
        errorMessage = `Error: ${err.message}`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const calculateStatistics = (assets) => {
    const totalAssets = assets.length;
    const availableAssets = assets.filter(a => a.status === 'AVAILABLE').length;
    const assignedAssets = assets.filter(a => a.status === 'ASSIGNED').length;
    const maintenanceAssets = assets.filter(a => a.status === 'IN_MAINTENANCE').length;
    const totalValue = assets.reduce((sum, asset) => sum + (asset.purchasePrice || 0), 0);

    const statusCounts = {};
    assets.forEach(asset => {
      statusCounts[asset.status] = (statusCounts[asset.status] || 0) + 1;
    });
    const statusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace('_', ' '),
      value: count,
      percentage: ((count / totalAssets) * 100).toFixed(1)
    }));

    const conditionCounts = {};
    assets.forEach(asset => {
      if (asset.condition) {
        conditionCounts[asset.condition] = (conditionCounts[asset.condition] || 0) + 1;
      }
    });
    const conditionBreakdown = Object.entries(conditionCounts).map(([condition, count]) => ({
      name: condition,
      value: count,
      percentage: ((count / totalAssets) * 100).toFixed(1)
    }));

    const categoryCounts = {};
    assets.forEach(asset => {
      if (asset.category) {
        categoryCounts[asset.category.name] = (categoryCounts[asset.category.name] || 0) + 1;
      }
    });
    const categoryBreakdown = Object.entries(categoryCounts).map(([category, count]) => ({
      name: category,
      value: count,
      percentage: ((count / totalAssets) * 100).toFixed(1)
    }));

    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    const warrantyExpiring = assets.filter(asset => {
      if (!asset.warrantyExpiry) return false;
      const warrantyDate = new Date(asset.warrantyExpiry);
      const now = new Date();
      return warrantyDate > now && warrantyDate <= ninetyDaysFromNow;
    });

    return {
      totalAssets,
      availableAssets,
      assignedAssets,
      maintenanceAssets,
      totalValue,
      statusBreakdown,
      conditionBreakdown,
      categoryBreakdown,
      warrantyExpiring
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const colors = {
      'AVAILABLE': '#10b981',
      'ASSIGNED': '#3b82f6',
      'IN_MAINTENANCE': '#f59e0b',
      'RETIRED': '#6b7280',
      'LOST': '#ef4444',
      'DAMAGED': '#dc2626'
    };
    return colors[status] || '#6b7280';
  };

  const getConditionColor = (condition) => {
    const colors = {
      'EXCELLENT': '#10b981',
      'GOOD': '#22c55e',
      'FAIR': '#f59e0b',
      'POOR': '#f97316',
      'BROKEN': '#ef4444'
    };
    return colors[condition] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="krubles-dashboard">
        <div className="loading-modern">
          <div className="loading-spinner-modern"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="krubles-dashboard">
        <div className="error-modern">
          <div className="error-icon">⚠️</div>
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          {error.includes('403') && (
            <p className="text-sm text-amber-600 mt-2">
              <strong>Tip:</strong> If you're seeing 403 errors, try signing out and signing back in to refresh your session.
            </p>
          )}
          <button onClick={loadDashboardData} className="retry-button-modern">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="krubles-dashboard">
      {/* Hero Header with Logo */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-bg"></div>
        <div className="dashboard-hero-content">
          <KrublesLogo className="krubles-logo-dashboard" />
          <div className="dashboard-hero-text">
            <h1 className="dashboard-title-modern">{terminology.dashboard || 'Dashboard'}</h1>
            <p className="dashboard-subtitle-modern">Real-time insights powered by Krubles</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="metrics-grid-modern">
        <div className="metric-card-modern metric-primary" onClick={() => navigate('/app/assets')} title="View all assets">
          <div className="metric-card-glow"></div>
          <div className="metric-header-modern">
            <div className="metric-icon-wrapper-modern">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/>
              </svg>
            </div>
            <div className="metric-badge-modern">Total</div>
          </div>
          <div className="metric-body-modern">
            <div className="metric-value-modern">{stats.totalAssets}</div>
            <div className="metric-label-modern">{terminology.assets || 'Assets'}</div>
          </div>
        </div>

        <div className="metric-card-modern metric-success" onClick={() => navigate('/app/assets?status=AVAILABLE')} title="View available assets">
          <div className="metric-card-glow"></div>
          <div className="metric-header-modern">
            <div className="metric-icon-wrapper-modern">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
              </svg>
            </div>
            <div className="metric-badge-modern">Available</div>
          </div>
          <div className="metric-body-modern">
            <div className="metric-value-modern">{stats.availableAssets}</div>
            <div className="metric-label-modern">Ready to Deploy</div>
          </div>
        </div>

        <div className="metric-card-modern metric-info" onClick={() => navigate('/app/assets?status=ASSIGNED')} title="View assigned assets">
          <div className="metric-card-glow"></div>
          <div className="metric-header-modern">
            <div className="metric-icon-wrapper-modern">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"/>
              </svg>
            </div>
            <div className="metric-badge-modern">Assigned</div>
          </div>
          <div className="metric-body-modern">
            <div className="metric-value-modern">{stats.assignedAssets}</div>
            <div className="metric-label-modern">In Use</div>
          </div>
        </div>

        <div 
          className={`metric-card-modern ${stats.maintenanceAssets > 0 ? 'metric-warning' : 'metric-success'}`} 
          onClick={() => navigate('/app/maintenance')} 
          title="View maintenance schedule"
        >
          <div className="metric-card-glow"></div>
          <div className="metric-header-modern">
            <div className="metric-icon-wrapper-modern">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M22.7 19l-9.1-15.8c-.5-.8-1.7-.8-2.2 0L2.3 19c-.5.8.1 1.9 1.1 1.9h18.3c1 0 1.6-1.1 1-1.9zM12 17c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm1-4h-2v-4h2v4z" fill="currentColor"/>
              </svg>
            </div>
            <div className="metric-badge-modern">{terminology.maintenance || 'Maintenance'}</div>
          </div>
          <div className="metric-body-modern">
            <div className="metric-value-modern">{stats.maintenanceAssets}</div>
            <div className="metric-label-modern">Under Service</div>
          </div>
        </div>

        <div className="metric-card-modern metric-value" onClick={() => navigate('/app/reports')} title="View financial reports">
          <div className="metric-card-glow"></div>
          <div className="metric-header-modern">
            <div className="metric-icon-wrapper-modern">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" fill="currentColor"/>
              </svg>
            </div>
            <div className="metric-badge-modern">Value</div>
          </div>
          <div className="metric-body-modern">
            <div className="metric-value-modern">{formatCurrency(stats.totalValue)}</div>
            <div className="metric-label-modern">Total Worth</div>
          </div>
        </div>
      </div>

      {/* Charts and Widgets Grid */}
      <div className="dashboard-grid-modern">
        {/* Asset Status Chart */}
        <div className="dashboard-card-modern">
          <div className="card-header-modern">
            <h3>Asset Status</h3>
            <span className="card-badge-modern">{stats.totalAssets} total</span>
          </div>
          <div className="card-content-modern">
            {stats.statusBreakdown.map((item, index) => (
              <div key={index} className="progress-bar-item-modern">
                <div className="progress-bar-header-modern">
                  <span className="progress-bar-label-modern">{item.name}</span>
                  <span className="progress-bar-value-modern">{item.value} ({item.percentage}%)</span>
                </div>
                <div className="progress-bar-track-modern">
                  <div 
                    className="progress-bar-fill-modern"
                    style={{ 
                      width: `${item.percentage}%`,
                      background: `linear-gradient(90deg, ${getStatusColor(item.name.toUpperCase())}, ${getStatusColor(item.name.toUpperCase())}dd)`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Asset Condition */}
        <div className="dashboard-card-modern">
          <div className="card-header-modern">
            <h3>Asset Condition</h3>
            <span className="card-badge-modern">{stats.conditionBreakdown.length} conditions</span>
          </div>
          <div className="card-content-modern">
            {stats.conditionBreakdown.map((item, index) => (
              <div key={index} className="progress-bar-item-modern">
                <div className="progress-bar-header-modern">
                  <span className="progress-bar-label-modern">{item.name}</span>
                  <span className="progress-bar-value-modern">{item.value} ({item.percentage}%)</span>
                </div>
                <div className="progress-bar-track-modern">
                  <div 
                    className="progress-bar-fill-modern"
                    style={{ 
                      width: `${item.percentage}%`,
                      background: `linear-gradient(90deg, ${getConditionColor(item.name)}, ${getConditionColor(item.name)}dd)`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card-modern">
          <div className="card-header-modern">
            <h3>Recent Activity</h3>
            <button className="card-action-modern" onClick={() => navigate('/app/assets')}>View All</button>
          </div>
          <div className="card-content-modern">
            {recentAssets.length === 0 ? (
              <div className="no-data-modern">
                <span className="no-data-icon-modern">📋</span>
                <p>No recent activity</p>
              </div>
            ) : (
              <ul className="activity-list-modern">
                {recentAssets.map(a => (
                  <li 
                    key={a.id} 
                    className="activity-item-modern"
                    onClick={() => navigate(`/app/assets/${a.id}`)}
                    title="Click to view details"
                  >
                    <div className="activity-icon-modern" style={{ background: `${getStatusColor((a.status || '').toUpperCase())}20`, color: getStatusColor((a.status || '').toUpperCase()) }}>
                      {(a.status || '').toUpperCase() === 'AVAILABLE' ? '✓' : 
                       (a.status || '').toUpperCase() === 'ASSIGNED' ? '👤' : 
                       (a.status || '').toUpperCase() === 'IN_MAINTENANCE' ? '🔧' : '📦'}
                    </div>
                    <div className="activity-content-modern">
                      <div className="activity-title-modern">{a.name || a.model || a.assetTag || `Asset #${a.id}`}</div>
                      <div className="activity-meta-modern">
                        <span className="activity-status-modern" style={{ color: getStatusColor((a.status || '').toUpperCase()) }}>
                          {(a.status || '').replace(/_/g,' ') || 'UNKNOWN'}
                        </span>
                        <span className="activity-date-modern">
                          {a.updatedAt ? new Date(a.updatedAt).toLocaleDateString() : (a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '')}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Warranty Alerts */}
        <div className="dashboard-card-modern">
          <div className="card-header-modern">
            <h3>Warranty Alerts</h3>
            <span className="card-badge-modern card-badge-warning">{Array.isArray(stats.warrantyExpiring) ? stats.warrantyExpiring.length : 0} expiring</span>
          </div>
          <div className="card-content-modern">
            {(!Array.isArray(stats.warrantyExpiring) || stats.warrantyExpiring.length === 0) ? (
              <div className="no-data-modern">
                <span className="no-data-icon-modern">🎉</span>
                <p>All warranties are current!</p>
                <small>No expiration in the next 90 days</small>
              </div>
            ) : (
              <ul className="warranty-list-modern">
                {stats.warrantyExpiring.slice(0, 5).map((asset, index) => (
                  <li key={index} className="warranty-item-modern">
                    <div className="warranty-icon-modern">⚠️</div>
                    <div className="warranty-info-modern">
                      <span className="warranty-asset-modern">{asset.name}</span>
                      <span className="warranty-tag-modern">#{asset.assetTag}</span>
                    </div>
                    <div className="warranty-date-modern">
                      {new Date(asset.warrantyExpiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-modern">
        <button className="action-btn-modern action-btn-primary" onClick={() => navigate('/app/assets/new')}>
          <span className="action-btn-icon-modern">+</span>
          <span className="action-btn-text-modern">
            <span className="action-btn-title-modern">Add Asset</span>
            <span className="action-btn-subtitle-modern">Register new equipment</span>
          </span>
        </button>
        <button className="action-btn-modern action-btn-secondary" onClick={() => navigate('/app/maintenance')}>
          <span className="action-btn-icon-modern">🔧</span>
          <span className="action-btn-text-modern">
            <span className="action-btn-title-modern">Schedule Maintenance</span>
            <span className="action-btn-subtitle-modern">Plan service activities</span>
          </span>
        </button>
        <button className="action-btn-modern action-btn-tertiary" onClick={() => navigate('/app/reports')}>
          <span className="action-btn-icon-modern">📊</span>
          <span className="action-btn-text-modern">
            <span className="action-btn-title-modern">Generate {(terminology?.reportSingular || 'Report')}</span>
            <span className="action-btn-subtitle-modern">Export analytics data</span>
          </span>
        </button>
      </div>
    </div>
  );
};
