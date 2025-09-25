import React, { useState, useEffect, useCallback } from 'react';
import { assetService } from '../../services/assetService.js';

export const Dashboard = () => {
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

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load assets first (this endpoint definitely exists)
      const assetsData = await assetService.list({ size: 1000 }); // Get more assets for better statistics
      const assets = Array.isArray(assetsData) ? assetsData : (assetsData.content || []);
      
      // Calculate statistics from assets data
      const calculatedStats = calculateStatistics(assets);
      
      // Try to get backend statistics, but don't fail if it doesn't exist
      let backendStats = {};
      try {
        backendStats = await assetService.getStatistics();
      } catch {
        // Backend statistics endpoint may not exist; fall back to calculated stats
      }
      
      // Merge backend stats with calculated stats (calculated stats as fallback)
      const mergedStats = {
        ...calculatedStats,
        ...backendStats
      };

      // Normalize to expected shapes to avoid runtime errors from unexpected backend values
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

    // Status breakdown
    const statusCounts = {};
    assets.forEach(asset => {
      statusCounts[asset.status] = (statusCounts[asset.status] || 0) + 1;
    });
    const statusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace('_', ' '),
      value: count,
      percentage: ((count / totalAssets) * 100).toFixed(1)
    }));

    // Condition breakdown
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

    // Category breakdown
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

    // Warranty expiring (next 90 days)
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
      'IN MAINTENANCE': '#f59e0b',
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
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error">
          {error}
          <button onClick={loadDashboardData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>IT Asset Management Overview</p>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <div className="metric-value">{stats.totalAssets}</div>
            <div className="metric-label">Total Assets</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <div className="metric-value">{stats.availableAssets}</div>
            <div className="metric-label">Available</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <div className="metric-value">{stats.assignedAssets}</div>
            <div className="metric-label">Assigned</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🔧</div>
          <div className="metric-content">
            <div className="metric-value">{stats.maintenanceAssets}</div>
            <div className="metric-label">In Maintenance</div>
          </div>
        </div>

        <div className="metric-card total-value">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <div className="metric-value">{formatCurrency(stats.totalValue)}</div>
            <div className="metric-label">Total Value</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Asset Status Breakdown */}
        <div className="chart-card">
          <h3>Asset Status</h3>
          <div className="chart-content">
            {stats.statusBreakdown.map((item, index) => (
              <div key={index} className="bar-chart-item">
                <div className="bar-info">
                  <span className="bar-label">{item.name}</span>
                  <span className="bar-value">{item.value} ({item.percentage}%)</span>
                </div>
                <div className="bar-container">
                  <div 
                    className="bar-fill"
                    style={{ 
                      width: `${item.percentage}%`,
                      backgroundColor: getStatusColor(item.name.toUpperCase())
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Asset Condition */}
        <div className="chart-card">
          <h3>Asset Condition</h3>
          <div className="chart-content">
            {stats.conditionBreakdown.map((item, index) => (
              <div key={index} className="bar-chart-item">
                <div className="bar-info">
                  <span className="bar-label">{item.name}</span>
                  <span className="bar-value">{item.value} ({item.percentage}%)</span>
                </div>
                <div className="bar-container">
                  <div 
                    className="bar-fill"
                    style={{ 
                      width: `${item.percentage}%`,
                      backgroundColor: getConditionColor(item.name)
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="chart-card">
          <h3>Assets by Category</h3>
          <div className="chart-content">
            {stats.categoryBreakdown.slice(0, 5).map((item, index) => (
              <div key={index} className="bar-chart-item">
                <div className="bar-info">
                  <span className="bar-label">{item.name}</span>
                  <span className="bar-value">{item.value} ({item.percentage}%)</span>
                </div>
                <div className="bar-container">
                  <div 
                    className="bar-fill"
                    style={{ 
                      width: `${item.percentage}%`,
                      backgroundColor: `hsl(${(index * 60) % 360}, 70%, 50%)`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warranty Expiring */}
        <div className="chart-card">
          <h3>Warranty Expiring Soon</h3>
          <div className="chart-content">
            {(!Array.isArray(stats.warrantyExpiring) || stats.warrantyExpiring.length === 0) ? (
              <div className="no-data">No warranties expiring in the next 90 days 🎉</div>
            ) : (
              stats.warrantyExpiring.slice(0, 5).map((asset, index) => (
                <div key={index} className="warranty-item">
                  <div className="warranty-info">
                    <span className="asset-name">{asset.name}</span>
                    <span className="asset-tag">#{asset.assetTag}</span>
                  </div>
                  <div className="warranty-date">
                    {new Date(asset.warrantyExpiry).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn" onClick={() => window.location.href = '#assets'}>
            <span className="action-icon">➕</span>
            Add New Asset
          </button>
          <button className="action-btn" onClick={() => window.location.href = '#maintenance'}>
            <span className="action-icon">🔧</span>
            Schedule Maintenance
          </button>
          <button className="action-btn" onClick={() => window.location.href = '#reports'}>
            <span className="action-icon">📈</span>
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};
