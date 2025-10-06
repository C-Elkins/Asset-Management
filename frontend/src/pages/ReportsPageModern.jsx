import React, { useEffect, useState, useMemo } from 'react';
import { useCustomization } from '../hooks/useCustomization';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Calendar, Download, Filter, 
  DollarSign, Package, Wrench, AlertCircle, Clock,
  ChevronDown, FileText, PieChart, Activity, RefreshCw
} from 'lucide-react';
import { api } from '../services/api.js';
import { assetService } from '../services/assetService.js';

export const ReportsPageModern = () => {
  const { terminology } = useCustomization();
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assets, setAssets] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Fetch data
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch assets
        const assetsResponse = await assetService.list({ size: 1000 });
        const assetsData = Array.isArray(assetsResponse) ? assetsResponse : (assetsResponse?.content || []);
        
        // Fetch maintenance records
        let maintenanceData = [];
        try {
          const maintenanceResponse = await api.get('/maintenance', { params: { page: 0, size: 1000 } });
          maintenanceData = Array.isArray(maintenanceResponse.data) ? maintenanceResponse.data : (maintenanceResponse.data?.content || []);
        } catch (err) {
          console.warn('Could not fetch maintenance data:', err);
        }

        if (mounted) {
          setAssets(assetsData);
          setMaintenanceRecords(maintenanceData);
        }
      } catch (err) {
        console.error('Failed to load report data:', err);
        if (err.response?.status === 403) {
          if (mounted) setError('Your session has expired. Please log out and log back in to continue.');
        } else {
          if (mounted) setError('Failed to load report data');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalValue = assets.reduce((sum, a) => sum + (parseFloat(a.purchasePrice || a.value || 0)), 0);
    const totalAssets = assets.length;
    const availableAssets = assets.filter(a => a.status === 'available').length;
    const inMaintenance = assets.filter(a => a.status === 'maintenance').length;
    const totalMaintenance = maintenanceRecords.length;
    const completedMaintenance = maintenanceRecords.filter(m => m.status === 'completed').length;
    const maintenanceCost = maintenanceRecords.reduce((sum, m) => sum + (parseFloat(m.estimatedCost || 0)), 0);

    return {
      totalValue,
      totalAssets,
      availableAssets,
      inMaintenance,
      totalMaintenance,
      completedMaintenance,
      maintenanceCost,
      utilizationRate: totalAssets > 0 ? ((totalAssets - availableAssets) / totalAssets * 100).toFixed(1) : 0
    };
  }, [assets, maintenanceRecords]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const categories = {};
    assets.forEach(asset => {
      const cat = asset.category || 'Uncategorized';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    return Object.entries(categories)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [assets]);

  // Status breakdown
  const statusData = useMemo(() => {
    const statuses = {};
    assets.forEach(asset => {
      const status = asset.status || 'unknown';
      statuses[status] = (statuses[status] || 0) + 1;
    });
    return Object.entries(statuses).map(([name, count]) => ({ name, count }));
  }, [assets]);

  // Maintenance trends (last 6 months)
  const maintenanceTrends = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      
      const monthRecords = maintenanceRecords.filter(m => {
        const recordDate = new Date(m.scheduledDate || m.createdAt);
        return recordDate.getMonth() === date.getMonth() && recordDate.getFullYear() === year;
      });

      months.push({
        month: monthName,
        count: monthRecords.length,
        completed: monthRecords.filter(m => m.status === 'completed').length,
        cost: monthRecords.reduce((sum, m) => sum + (parseFloat(m.estimatedCost || 0)), 0)
      });
    }
    return months;
  }, [maintenanceRecords]);

  // Value by category
  const valueByCategory = useMemo(() => {
    const categories = {};
    assets.forEach(asset => {
      const cat = asset.category || 'Uncategorized';
      const value = parseFloat(asset.purchasePrice || asset.value || 0);
      categories[cat] = (categories[cat] || 0) + value;
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [assets]);

  const reportTypes = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'assets', label: terminology.assets || 'Assets', icon: Package },
    { id: 'maintenance', label: terminology.maintenance || 'Maintenance', icon: Wrench },
    { id: 'financial', label: 'Financial', icon: DollarSign }
  ];

  const dateRangeOptions = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: '365', label: 'Last Year' }
  ];

  const handleExport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      dateRange: `Last ${dateRange} days`,
      metrics,
      categoryData,
      statusData,
      maintenanceTrends,
      valueByCategory
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `krubles-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="reports-page-modern">
        <div className="reports-hero">
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-page-modern">
        <div className="reports-hero">
          <div className="max-w-2xl mx-auto text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Reports</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            {error.includes('session expired') && (
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Log Out
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page-modern">
      {/* Hero Section */}
      <motion.div 
        className="reports-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="reports-hero-content">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{terminology.reports || 'Reports'}</h1>
                <p className="text-sm text-slate-600">Comprehensive analytics and insights for informed decisions</p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              <motion.button
                className="reports-action-btn reports-action-btn-secondary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </motion.button>
              <motion.button
                className="reports-action-btn reports-action-btn-primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
              >
                <Download className="w-4 h-4" />
                Export {terminology?.reportSingular || 'Report'}
              </motion.button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="reports-metrics-grid">
            <motion.div className="metric-card" whileHover={{ y: -4 }}>
              <div className="metric-icon bg-gradient-to-br from-emerald-500 to-emerald-600">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className="metric-content">
                <p className="metric-label">Total {terminology.assets || 'Assets'}</p>
                <p className="metric-value">{metrics.totalAssets}</p>
              </div>
            </motion.div>

            <motion.div className="metric-card" whileHover={{ y: -4 }}>
              <div className="metric-icon bg-gradient-to-br from-emerald-500 to-emerald-600">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="metric-content">
                <p className="metric-label">Total Value</p>
                <p className="metric-value">${metrics.totalValue.toLocaleString()}</p>
              </div>
            </motion.div>

            <motion.div className="metric-card" whileHover={{ y: -4 }}>
              <div className="metric-icon bg-gradient-to-br from-blue-500 to-blue-600">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="metric-content">
                <p className="metric-label">Utilization Rate</p>
                <p className="metric-value">{metrics.utilizationRate}%</p>
              </div>
            </motion.div>

            <motion.div className="metric-card" whileHover={{ y: -4 }}>
              <div className="metric-icon bg-gradient-to-br from-amber-500 to-amber-600">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div className="metric-content">
                <p className="metric-label">{terminology.maintenance || 'Maintenance'} Tasks</p>
                <p className="metric-value">{metrics.totalMaintenance}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Report Type Selector and Filters */}
      <motion.div 
        className="reports-toolbar"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="reports-type-selector">
          {reportTypes.map(type => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={`report-type-btn ${selectedReport === type.id ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4" />
                {type.label}
              </button>
            );
          })}
        </div>

        <div className="reports-filters">
          <div className="relative">
            <button
              className="filter-btn"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              <Calendar className="w-4 h-4" />
              {dateRangeOptions.find(o => o.value === dateRange)?.label}
              <ChevronDown className="w-4 h-4" />
            </button>
            
            <AnimatePresence>
              {showDatePicker && (
                <motion.div
                  className="filter-dropdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {dateRangeOptions.map(option => (
                    <button
                      key={option.value}
                      className="filter-option"
                      onClick={() => {
                        setDateRange(option.value);
                        setShowDatePicker(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Report Content */}
      <motion.div
        className="reports-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {/* Overview Report */}
        {selectedReport === 'overview' && (
          <div className="reports-grid">
            {/* Category Distribution */}
            <div className="report-card">
              <div className="report-card-header">
                <PieChart className="w-5 h-5 text-emerald-600" />
                <h3 className="report-card-title">{(terminology.assetSingular || 'Asset')} Distribution by Category</h3>
              </div>
              <div className="chart-container">
                {categoryData.map((cat, idx) => {
                  const maxCount = Math.max(...categoryData.map(c => c.count));
                  const percentage = (cat.count / maxCount * 100).toFixed(0);
                  return (
                    <div key={cat.name} className="chart-bar-item">
                      <div className="chart-bar-label">
                        <span className="font-medium text-slate-700">{cat.name}</span>
                        <span className="text-slate-500 text-sm">{cat.count} assets</span>
                      </div>
                      <div className="chart-bar-wrapper">
                        <motion.div
                          className="chart-bar"
                          style={{ backgroundColor: `hsl(${idx * 60}, 70%, 60%)` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Breakdown */}
                        {/* Status Breakdown */}
            <div className="report-card">
              <div className="report-card-header">
                <Activity className="w-5 h-5 text-emerald-600" />
                <h3 className="report-card-title">{(terminology.assetSingular || 'Asset')} Status</h3>
              </div>
              <div className="status-grid">
                {statusData.map(status => (
                  <div key={status.name} className="status-item">
                    <div className={`status-badge status-${status.name.toLowerCase()}`}>
                      {status.name}
                    </div>
                    <div className="status-count">{status.count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Maintenance Trends */}
            <div className="report-card report-card-wide">
              <div className="report-card-header">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="report-card-title">{(terminology.maintenance || 'Maintenance')} Trends (Last 6 Months)</h3>
              </div>
              <div className="chart-container">
                <div className="chart-line-wrapper">
                  {maintenanceTrends.map((month, idx) => {
                    const maxCount = Math.max(...maintenanceTrends.map(m => m.count), 1);
                    const height = (month.count / maxCount * 100).toFixed(0);
                    return (
                      <div key={month.month} className="chart-column">
                        <div className="chart-column-bars">
                          <motion.div
                            className="chart-column-bar chart-column-bar-total"
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                          >
                            <span className="chart-column-value">{month.count}</span>
                          </motion.div>
                        </div>
                        <div className="chart-column-label">{month.month}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Value by Category */}
            <div className="report-card report-card-wide">
              <div className="report-card-header">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <h3 className="report-card-title">{(terminology.assetSingular || 'Asset')} Value by Category</h3>
              </div>
              <div className="chart-container">
                {valueByCategory.map((cat, idx) => {
                  const maxValue = Math.max(...valueByCategory.map(c => c.value));
                  const percentage = (cat.value / maxValue * 100).toFixed(0);
                  return (
                    <div key={cat.name} className="chart-bar-item">
                      <div className="chart-bar-label">
                        <span className="font-medium text-slate-700">{cat.name}</span>
                        <span className="text-emerald-600 text-sm font-semibold">${cat.value.toLocaleString()}</span>
                      </div>
                      <div className="chart-bar-wrapper">
                        <motion.div
                          className="chart-bar chart-bar-value"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Assets Report */}
        {selectedReport === 'assets' && (
          <div className="reports-grid">
            <div className="report-card report-card-full">
              <div className="report-card-header">
                <Package className="w-5 h-5 text-emerald-600" />
                <h3 className="report-card-title">{(terminology.assetSingular || 'Asset')} Analytics</h3>
              </div>
              <div className="report-stats-grid">
                <div className="report-stat">
                  <p className="report-stat-label">Total {terminology.assets || 'Assets'}</p>
                  <p className="report-stat-value">{metrics.totalAssets}</p>
                </div>
                <div className="report-stat">
                  <p className="report-stat-label">Available</p>
                  <p className="report-stat-value text-emerald-600">{metrics.availableAssets}</p>
                </div>
                <div className="report-stat">
                  <p className="report-stat-label">In {terminology.maintenance || 'Maintenance'}</p>
                  <p className="report-stat-value text-amber-600">{metrics.inMaintenance}</p>
                </div>
                <div className="report-stat">
                  <p className="report-stat-label">Utilization</p>
                  <p className="report-stat-value text-blue-600">{metrics.utilizationRate}%</p>
                </div>
              </div>
            </div>

            {/* Category Distribution */}
            <div className="report-card">
              <div className="report-card-header">
                <PieChart className="w-5 h-5 text-emerald-600" />
                <h3 className="report-card-title">By Category</h3>
              </div>
              <div className="chart-container">
                {categoryData.map((cat, idx) => {
                  const maxCount = Math.max(...categoryData.map(c => c.count));
                  const percentage = (cat.count / maxCount * 100).toFixed(0);
                  return (
                    <div key={cat.name} className="chart-bar-item">
                      <div className="chart-bar-label">
                        <span className="font-medium text-slate-700">{cat.name}</span>
                        <span className="text-slate-500 text-sm">{cat.count}</span>
                      </div>
                      <div className="chart-bar-wrapper">
                        <motion.div
                          className="chart-bar"
                          style={{ backgroundColor: `hsl(${idx * 60}, 70%, 60%)` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Distribution */}
            <div className="report-card">
              <div className="report-card-header">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="report-card-title">By Status</h3>
              </div>
              <div className="status-grid">
                {statusData.map(status => (
                  <div key={status.name} className="status-item">
                    <div className={`status-badge status-${status.name.toLowerCase()}`}>
                      {status.name}
                    </div>
                    <div className="status-count">{status.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Report */}
        {selectedReport === 'maintenance' && (
          <div className="reports-grid">
            <div className="report-card report-card-full">
              <div className="report-card-header">
                <Wrench className="w-5 h-5 text-amber-600" />
                <h3 className="report-card-title">{(terminology.maintenance || 'Maintenance')} Overview</h3>
              </div>
              <div className="report-stats-grid">
                <div className="report-stat">
                  <p className="report-stat-label">Total Tasks</p>
                  <p className="report-stat-value">{metrics.totalMaintenance}</p>
                </div>
                <div className="report-stat">
                  <p className="report-stat-label">Completed</p>
                  <p className="report-stat-value text-emerald-600">{metrics.completedMaintenance}</p>
                </div>
                <div className="report-stat">
                  <p className="report-stat-label">In Progress</p>
                  <p className="report-stat-value text-blue-600">
                    {metrics.totalMaintenance - metrics.completedMaintenance}
                  </p>
                </div>
                <div className="report-stat">
                  <p className="report-stat-label">Total Cost</p>
                  <p className="report-stat-value text-purple-600">${metrics.maintenanceCost.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Monthly Trends */}
            <div className="report-card report-card-full">
              <div className="report-card-header">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3 className="report-card-title">Monthly Trends</h3>
              </div>
              <div className="chart-container">
                <div className="chart-line-wrapper">
                  {maintenanceTrends.map((month, idx) => {
                    const maxCount = Math.max(...maintenanceTrends.map(m => m.count), 1);
                    const totalHeight = (month.count / maxCount * 100).toFixed(0);
                    const completedHeight = month.count > 0 ? (month.completed / month.count * totalHeight).toFixed(0) : 0;
                    return (
                      <div key={month.month} className="chart-column">
                        <div className="chart-column-bars">
                          <motion.div
                            className="chart-column-bar chart-column-bar-total"
                            initial={{ height: 0 }}
                            animate={{ height: `${totalHeight}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                          >
                            <motion.div
                              className="chart-column-bar chart-column-bar-completed"
                              initial={{ height: 0 }}
                              animate={{ height: `${completedHeight}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.1 + 0.2 }}
                            />
                            <span className="chart-column-value">{month.count}</span>
                          </motion.div>
                        </div>
                        <div className="chart-column-label">{month.month}</div>
                        <div className="chart-column-sublabel">${(month.cost / 1000).toFixed(1)}K</div>
                      </div>
                    );
                  })}
                </div>
                <div className="chart-legend">
                  <div className="chart-legend-item">
                    <div className="chart-legend-color bg-blue-500"></div>
                    <span>Total Tasks</span>
                  </div>
                  <div className="chart-legend-item">
                    <div className="chart-legend-color bg-emerald-500"></div>
                    <span>Completed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financial Report */}
        {selectedReport === 'financial' && (
          <div className="reports-grid">
            <div className="report-card report-card-full">
              <div className="report-card-header">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <h3 className="report-card-title">Financial Summary</h3>
              </div>
              <div className="report-stats-grid">
                <div className="report-stat">
                  <p className="report-stat-label">Total {(terminology.assetSingular || 'Asset')} Value</p>
                  <p className="report-stat-value text-blue-600">${metrics.totalValue.toLocaleString()}</p>
                </div>
                <div className="report-stat">
                  <p className="report-stat-label">{(terminology.maintenance || 'Maintenance')} Cost</p>
                  <p className="report-stat-value text-amber-600">${metrics.maintenanceCost.toLocaleString()}</p>
                </div>
                <div className="report-stat">
                  <p className="report-stat-label">Avg {(terminology.assetSingular || 'Asset')} Value</p>
                  <p className="report-stat-value text-emerald-600">
                    ${metrics.totalAssets > 0 ? (metrics.totalValue / metrics.totalAssets).toLocaleString(undefined, {maximumFractionDigits: 0}) : 0}
                  </p>
                </div>
                <div className="report-stat">
                  <p className="report-stat-label">Cost Per Task</p>
                  <p className="report-stat-value text-purple-600">
                    ${metrics.totalMaintenance > 0 ? (metrics.maintenanceCost / metrics.totalMaintenance).toLocaleString(undefined, {maximumFractionDigits: 0}) : 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Value by Category */}
            <div className="report-card report-card-full">
              <div className="report-card-header">
                <Package className="w-5 h-5 text-emerald-600" />
                <h3 className="report-card-title">{(terminology.assetSingular || 'Asset')} Value by Category</h3>
              </div>
              <div className="chart-container">
                {valueByCategory.map((cat, idx) => {
                  const maxValue = Math.max(...valueByCategory.map(c => c.value));
                  const percentage = (cat.value / maxValue * 100).toFixed(0);
                  const share = (cat.value / metrics.totalValue * 100).toFixed(1);
                  return (
                    <div key={cat.name} className="chart-bar-item">
                      <div className="chart-bar-label">
                        <span className="font-medium text-slate-700">{cat.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-600 text-sm font-semibold">${cat.value.toLocaleString()}</span>
                          <span className="text-slate-400 text-xs">({share}%)</span>
                        </div>
                      </div>
                      <div className="chart-bar-wrapper">
                        <motion.div
                          className="chart-bar chart-bar-value"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
