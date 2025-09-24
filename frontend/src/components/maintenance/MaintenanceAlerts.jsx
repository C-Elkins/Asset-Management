import React, { useState, useEffect } from 'react';
import { assetService } from '../../services/assetService.js';
import { exportService } from '../../services/exportService.js';

export const MaintenanceAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMaintenanceAlerts();
  }, []);

  const loadMaintenanceAlerts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all assets and calculate maintenance alerts
      const assetsData = await assetService.list();
      const assets = Array.isArray(assetsData) ? assetsData : (assetsData.content || []);
      
      const maintenanceAlerts = calculateMaintenanceAlerts(assets);
      setAlerts(maintenanceAlerts);
    } catch (err) {
      console.error('Failed to load maintenance alerts:', err);
      setError('Failed to load maintenance alerts');
    } finally {
      setLoading(false);
    }
  };

  const calculateMaintenanceAlerts = (assets) => {
    const alerts = [];
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    assets.forEach(asset => {
      // Warranty expiring alerts
      if (asset.warrantyExpiry) {
        const warrantyDate = new Date(asset.warrantyExpiry);
        if (warrantyDate > now && warrantyDate <= thirtyDaysFromNow) {
          alerts.push({
            id: `warranty-${asset.id}`,
            type: 'warranty',
            severity: 'warning',
            asset: asset,
            title: 'Warranty Expiring Soon',
            message: `Warranty for ${asset.name} expires on ${warrantyDate.toLocaleDateString()}`,
            date: warrantyDate,
            action: 'Review warranty renewal options'
          });
        } else if (warrantyDate <= now) {
          alerts.push({
            id: `warranty-expired-${asset.id}`,
            type: 'warranty',
            severity: 'error',
            asset: asset,
            title: 'Warranty Expired',
            message: `Warranty for ${asset.name} expired on ${warrantyDate.toLocaleDateString()}`,
            date: warrantyDate,
            action: 'Consider extended warranty or replacement'
          });
        }
      }

      // Next maintenance alerts
      if (asset.nextMaintenance) {
        const maintenanceDate = new Date(asset.nextMaintenance);
        if (maintenanceDate > now && maintenanceDate <= thirtyDaysFromNow) {
          alerts.push({
            id: `maintenance-${asset.id}`,
            type: 'maintenance',
            severity: 'info',
            asset: asset,
            title: 'Maintenance Due Soon',
            message: `Scheduled maintenance for ${asset.name} due on ${maintenanceDate.toLocaleDateString()}`,
            date: maintenanceDate,
            action: 'Schedule maintenance appointment'
          });
        } else if (maintenanceDate <= now) {
          alerts.push({
            id: `maintenance-overdue-${asset.id}`,
            type: 'maintenance',
            severity: 'warning',
            asset: asset,
            title: 'Maintenance Overdue',
            message: `Maintenance for ${asset.name} was due on ${maintenanceDate.toLocaleDateString()}`,
            date: maintenanceDate,
            action: 'Schedule immediate maintenance'
          });
        }
      }

      // Asset condition alerts
      if (asset.condition === 'POOR' || asset.condition === 'BROKEN') {
        alerts.push({
          id: `condition-${asset.id}`,
          type: 'condition',
          severity: asset.condition === 'BROKEN' ? 'error' : 'warning',
          asset: asset,
          title: `Asset Condition: ${asset.condition}`,
          message: `${asset.name} is in ${asset.condition.toLowerCase()} condition`,
          date: new Date(), // Current date for condition alerts
          action: asset.condition === 'BROKEN' ? 'Retire or repair immediately' : 'Schedule inspection'
        });
      }

      // Assets assigned to maintenance status
      if (asset.status === 'IN_MAINTENANCE') {
        alerts.push({
          id: `status-maintenance-${asset.id}`,
          type: 'status',
          severity: 'info',
          asset: asset,
          title: 'Asset In Maintenance',
          message: `${asset.name} is currently undergoing maintenance`,
          date: new Date(),
          action: 'Monitor maintenance progress'
        });
      }
    });

    // Sort alerts by severity and date
    return alerts.sort((a, b) => {
      const severityOrder = { error: 0, warning: 1, info: 2 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return new Date(a.date) - new Date(b.date);
    });
  };

  const handleDismissAlert = (alertId) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const handleAssetAction = (asset) => {
    // Navigate to asset or open action modal
    alert(`Action for ${asset.name}: This would open the asset management interface`);
  };

  const handleExportAlerts = () => {
    exportService.exportAlertsToCSV(alerts, 'maintenance-alerts');
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📋';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error': return '#fee';
      case 'warning': return '#fffbeb';
      case 'info': return '#eff6ff';
      default: return '#f7fafc';
    }
  };

  const getSeverityBorder = (severity) => {
    switch (severity) {
      case 'error': return '#fed7d7';
      case 'warning': return '#fbd38d';
      case 'info': return '#bee3f8';
      default: return '#e2e8f0';
    }
  };

  if (loading) {
    return (
      <div className="maintenance-alerts-container">
        <div className="loading">Loading maintenance alerts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="maintenance-alerts-container">
        <div className="error">
          {error}
          <button onClick={loadMaintenanceAlerts} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="maintenance-alerts-container">
      <div className="alerts-header">
        <div>
          <h2>Maintenance & Alerts</h2>
          <p>Monitor asset maintenance, warranties, and urgent actions</p>
        </div>
        <div className="alerts-actions">
          {alerts.length > 0 && (
            <button 
              className="btn-outline"
              onClick={handleExportAlerts}
              title="Export alerts to CSV"
            >
              📊 Export Alerts
            </button>
          )}
          <button onClick={loadMaintenanceAlerts} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="no-alerts">
          <div className="no-alerts-icon">✅</div>
          <h3>All Clear!</h3>
          <p>No maintenance alerts or urgent actions required at this time.</p>
        </div>
      ) : (
        <div className="alerts-list">
          {alerts.map(alert => (
            <div 
              key={alert.id} 
              className="alert-card"
              style={{ 
                backgroundColor: getSeverityColor(alert.severity),
                borderColor: getSeverityBorder(alert.severity)
              }}
            >
              <div className="alert-header">
                <div className="alert-icon">{getSeverityIcon(alert.severity)}</div>
                <div className="alert-info">
                  <h4 className="alert-title">{alert.title}</h4>
                  <p className="alert-message">{alert.message}</p>
                </div>
                <button 
                  className="dismiss-btn"
                  onClick={() => handleDismissAlert(alert.id)}
                  title="Dismiss alert"
                >
                  ×
                </button>
              </div>
              
              <div className="alert-details">
                <div className="asset-info">
                  <span className="asset-tag">#{alert.asset.assetTag}</span>
                  {alert.asset.location && (
                    <span className="asset-location">📍 {alert.asset.location}</span>
                  )}
                </div>
                <div className="alert-date">
                  {alert.date.toLocaleDateString()}
                </div>
              </div>

              <div className="alert-actions">
                <span className="recommended-action">
                  💡 {alert.action}
                </span>
                <div className="action-buttons">
                  <button 
                    className="action-btn primary"
                    onClick={() => handleAssetAction(alert.asset)}
                  >
                    View Asset
                  </button>
                  {alert.type === 'maintenance' && (
                    <button className="action-btn secondary">
                      Schedule Maintenance
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="alert-summary">
        <div className="summary-item error">
          <span className="summary-count">
            {alerts.filter(a => a.severity === 'error').length}
          </span>
          <span className="summary-label">Critical</span>
        </div>
        <div className="summary-item warning">
          <span className="summary-count">
            {alerts.filter(a => a.severity === 'warning').length}
          </span>
          <span className="summary-label">Warning</span>
        </div>
        <div className="summary-item info">
          <span className="summary-count">
            {alerts.filter(a => a.severity === 'info').length}
          </span>
          <span className="summary-label">Info</span>
        </div>
      </div>
    </div>
  );
};
