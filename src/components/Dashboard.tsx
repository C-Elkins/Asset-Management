// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Package, TrendingUp, AlertTriangle, Calendar, DollarSign,
  Clock, CheckCircle, Settings, Plus, Grid, Eye, EyeOff, Activity, GripVertical, RefreshCw, X, Trash2
} from 'lucide-react';
import { User } from '../types/api';
import GridLayout from 'react-grid-layout';
import { RecentActivity } from './RecentActivity';

type LayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

interface DashboardProps {
  currentUser?: User | null;
}

interface DashboardStats {
  totalAssets: number;
  availableAssets: number;
  assignedAssets: number;
  maintenanceAssets: number;
  totalValue: number;
  lowStockAlerts: number;
  pendingApprovals: number;
  upcomingMaintenance: number;
  expiringWarranties: number;
  activeLeases: number;
}

interface Widget {
  id: string;
  type: string;
  title: string;
  visible: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
}

const defaultWidgets: Widget[] = [
  { id: 'total-assets', type: 'metric', title: 'Total Assets', visible: true, x: 0, y: 0, w: 3, h: 2 },
  { id: 'available-assets', type: 'metric', title: 'Available Assets', visible: true, x: 3, y: 0, w: 3, h: 2 },
  { id: 'assigned-assets', type: 'metric', title: 'Assigned Assets', visible: true, x: 6, y: 0, w: 3, h: 2 },
  { id: 'total-value', type: 'metric', title: 'Total Value', visible: true, x: 9, y: 0, w: 3, h: 2 },
  { id: 'low-stock-alerts', type: 'alert', title: 'Low Stock Alerts', visible: true, x: 0, y: 2, w: 3, h: 2 },
  { id: 'pending-approvals', type: 'alert', title: 'Pending Approvals', visible: true, x: 3, y: 2, w: 3, h: 2 },
  { id: 'upcoming-maintenance', type: 'calendar', title: 'Upcoming Maintenance', visible: true, x: 6, y: 2, w: 3, h: 2 },
  { id: 'expiring-warranties', type: 'calendar', title: 'Expiring Warranties', visible: true, x: 9, y: 2, w: 3, h: 2 },
  { id: 'activity-feed', type: 'activity', title: 'Recent Activity', visible: true, x: 0, y: 4, w: 6, h: 4 },
  { id: 'quick-stats', type: 'chart', title: 'Asset Distribution', visible: true, x: 6, y: 4, w: 6, h: 4 },
];

export const Dashboard: React.FC<DashboardProps> = ({ currentUser }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0,
    availableAssets: 0,
    assignedAssets: 0,
    maintenanceAssets: 0,
    totalValue: 0,
    lowStockAlerts: 0,
    pendingApprovals: 0,
    upcomingMaintenance: 0,
    expiringWarranties: 0,
    activeLeases: 0,
  });
  const [widgets, setWidgets] = useState<Widget[]>(defaultWidgets);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    loadWidgetPreferences();
  }, [currentUser]);

  // Auto-refresh every 30 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load asset stats
      const assetStats = await window.api.getAssetStats();

      // Load stock alerts
      const alerts = await window.api.getStockAlerts({ status: 'active' });

      // Load pending approvals for current user
      const pendingApprovals = currentUser
        ? await window.api.getPendingApprovalsFor(currentUser.full_name)
        : [];

      setStats({
        totalAssets: assetStats.total || 0,
        availableAssets: assetStats.available || 0,
        assignedAssets: assetStats.assigned || 0,
        maintenanceAssets: assetStats.maintenance || 0,
        totalValue: assetStats.totalValue || 0,
        lowStockAlerts: alerts.length,
        pendingApprovals: pendingApprovals.length,
        upcomingMaintenance: 0, // TODO: Implement
        expiringWarranties: 0, // TODO: Implement
        activeLeases: 0, // TODO: Implement
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWidgetPreferences = async () => {
    try {
      const prefs = await window.api.getSetting('dashboard_widgets');
      if (prefs) {
        setWidgets(JSON.parse(prefs));
      }
    } catch (error) {
      console.error('Failed to load widget preferences:', error);
    }
  };

  const saveWidgetPreferences = async (updatedWidgets: Widget[]) => {
    try {
      await window.api.setSetting('dashboard_widgets', JSON.stringify(updatedWidgets));
    } catch (error) {
      console.error('Failed to save widget preferences:', error);
    }
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    const updated = widgets.map(w =>
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    );
    setWidgets(updated);
    saveWidgetPreferences(updated);
  };

  const resetToDefault = () => {
    setWidgets(defaultWidgets);
    saveWidgetPreferences(defaultWidgets);
  };

  const onLayoutChange = (layout: LayoutItem[]) => {
    const updatedWidgets = widgets.map(widget => {
      const layoutItem = layout.find(l => l.i === widget.id);
      if (layoutItem) {
        return {
          ...widget,
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h,
        };
      }
      return widget;
    });
    setWidgets(updatedWidgets);
    saveWidgetPreferences(updatedWidgets);
  };

  // Available widget types that can be added
  const availableWidgetTypes = [
    { id: 'asset-trends', type: 'chart', title: 'Asset Trends', description: 'View asset acquisition trends over time', w: 6, h: 4 },
    { id: 'category-breakdown', type: 'chart', title: 'Category Breakdown', description: 'Asset distribution by category', w: 4, h: 4 },
    { id: 'cost-analysis', type: 'chart', title: 'Cost Analysis', description: 'Track spending and value metrics', w: 6, h: 4 },
    { id: 'maintenance-schedule', type: 'calendar', title: 'Maintenance Schedule', description: 'Upcoming maintenance tasks', w: 4, h: 3 },
    { id: 'recent-changes', type: 'activity', title: 'Recent Changes', description: 'Latest asset modifications', w: 4, h: 4 },
    { id: 'top-assets', type: 'list', title: 'Top Value Assets', description: 'Highest value assets', w: 3, h: 3 },
    { id: 'utilization', type: 'metric', title: 'Utilization Rate', description: 'Asset utilization percentage', w: 3, h: 2 },
    { id: 'depreciation', type: 'chart', title: 'Depreciation', description: 'Asset value depreciation', w: 6, h: 4 },
  ];

  const addWidget = (widgetType: typeof availableWidgetTypes[0]) => {
    // Find the next available ID by counting existing instances
    const existingCount = widgets.filter(w => w.id.startsWith(widgetType.id)).length;
    const newId = existingCount > 0 ? `${widgetType.id}-${existingCount + 1}` : widgetType.id;

    // Find a good position for the new widget (at the bottom)
    const maxY = widgets.reduce((max, w) => Math.max(max, w.y + w.h), 0);

    const newWidget: Widget = {
      id: newId,
      type: widgetType.type,
      title: widgetType.title,
      visible: true,
      x: 0,
      y: maxY,
      w: widgetType.w,
      h: widgetType.h,
    };

    const updated = [...widgets, newWidget];
    setWidgets(updated);
    saveWidgetPreferences(updated);
    setShowAddWidget(false);
  };

  const removeWidget = (widgetId: string) => {
    const updated = widgets.filter(w => w.id !== widgetId);
    setWidgets(updated);
    saveWidgetPreferences(updated);
  };

  const visibleWidgets = widgets.filter(w => w.visible);

  const renderWidgetContent = (widget: Widget) => {
    switch (widget.id) {
      case 'total-assets':
        return <MetricWidgetContent title="Total Assets" value={stats.totalAssets} icon={<Package size={24} />} color="bg-blue-600" trend="+12% from last month" />;
      case 'available-assets':
        return <MetricWidgetContent title="Available" value={stats.availableAssets} icon={<CheckCircle size={24} />} color="bg-green-600" />;
      case 'assigned-assets':
        return <MetricWidgetContent title="Assigned" value={stats.assignedAssets} icon={<TrendingUp size={24} />} color="bg-indigo-600" />;
      case 'total-value':
        return <MetricWidgetContent title="Total Value" value={`$${stats.totalValue.toLocaleString()}`} icon={<DollarSign size={24} />} color="bg-emerald-600" />;
      case 'low-stock-alerts':
        return <AlertWidgetContent title="Low Stock Alerts" count={stats.lowStockAlerts} icon={<AlertTriangle size={24} />} color="text-orange-600" />;
      case 'pending-approvals':
        return <AlertWidgetContent title="Pending Approvals" count={stats.pendingApprovals} icon={<Clock size={24} />} color="text-purple-600" />;
      case 'upcoming-maintenance':
        return <AlertWidgetContent title="Upcoming Maintenance" count={stats.upcomingMaintenance} icon={<Calendar size={24} />} color="text-yellow-600" />;
      case 'expiring-warranties':
        return <AlertWidgetContent title="Expiring Warranties" count={stats.expiringWarranties} icon={<AlertTriangle size={24} />} color="text-red-600" />;
      case 'activity-feed':
        return <RecentActivity limit={8} className="h-full" />;
      case 'quick-stats':
        return <QuickStatsWidget stats={stats} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back{currentUser ? `, ${currentUser.full_name}` : ''}! Here's an overview of your asset system.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
            <button
              onClick={loadDashboardData}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              title="Refresh Now"
            >
              <RefreshCw size={18} className={autoRefresh ? 'animate-spin' : ''} />
            </button>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600"></div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                autoRefresh
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title={autoRefresh ? 'Auto-refresh: ON (every 30s)' : 'Enable auto-refresh'}
            >
              {autoRefresh ? 'Auto ON' : 'Auto'}
            </button>
          </div>
          <button
            onClick={() => setShowAddWidget(!showAddWidget)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={18} />
            Add Widget
          </button>
          <button
            onClick={() => setShowCustomize(!showCustomize)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center gap-2"
          >
            <Settings size={18} />
            Customize
          </button>
        </div>
      </div>

      {/* Customization Panel */}
      {showCustomize && (
        <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Customize Dashboard</h3>
            <button
              onClick={resetToDefault}
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
            >
              Reset to Default
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Show or hide widgets, then drag them to rearrange:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {widgets.map(widget => (
              <button
                key={widget.id}
                onClick={() => toggleWidgetVisibility(widget.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  widget.visible
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600'
                }`}
              >
                {widget.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                {widget.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Widget Modal */}
      {showAddWidget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Add Widget to Dashboard</h3>
              <button
                onClick={() => setShowAddWidget(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-6">Choose a widget to add to your dashboard:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableWidgetTypes.map(widgetType => (
                  <button
                    key={widgetType.id}
                    onClick={() => addWidget(widgetType)}
                    className="flex flex-col items-start p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {widgetType.type === 'chart' && <Activity size={20} className="text-blue-600" />}
                      {widgetType.type === 'metric' && <TrendingUp size={20} className="text-emerald-600" />}
                      {widgetType.type === 'calendar' && <Calendar size={20} className="text-orange-600" />}
                      {widgetType.type === 'activity' && <Clock size={20} className="text-purple-600" />}
                      {widgetType.type === 'list' && <Package size={20} className="text-indigo-600" />}
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-700">{widgetType.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{widgetType.description}</p>
                    <span className="text-xs text-gray-500">
                      Size: {widgetType.w} x {widgetType.h} cells
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Widgets Grid - Draggable */}
      <GridLayout
        className="layout"
        layout={visibleWidgets.map(w => ({ i: w.id, x: w.x, y: w.y, w: w.w, h: w.h }))}
        cols={12}
        rowHeight={60}
        width={1200}
        onLayoutChange={onLayoutChange}
        draggableHandle=".drag-handle"
        compactType="vertical"
        isDraggable={true}
        isResizable={true}
      >
        {visibleWidgets.map(widget => (
          <div key={widget.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="drag-handle cursor-move px-3 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <GripVertical size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700">{widget.title}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeWidget(widget.id);
                }}
                className="text-gray-400 hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded"
                title="Remove widget"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="p-4 h-full overflow-auto">
              {renderWidgetContent(widget)}
            </div>
          </div>
        ))}
      </GridLayout>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton icon={<Plus size={20} />} label="Add Asset" color="emerald" />
          <QuickActionButton icon={<Package size={20} />} label="View Inventory" color="blue" />
          <QuickActionButton icon={<Calendar size={20} />} label="Schedule Maintenance" color="orange" />
          <QuickActionButton icon={<Grid size={20} />} label="View Reports" color="indigo" />
        </div>
      </div>
    </div>
  );
};

// Metric Widget Content Component
interface MetricWidgetContentProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

const MetricWidgetContent: React.FC<MetricWidgetContentProps> = ({ title, value, icon, color, trend }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className={`${color} text-white p-2 rounded-lg`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 dark:text-gray-400 text-xs font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{value}</p>
      {trend && <p className="text-xs text-green-600 font-medium">{trend}</p>}
    </div>
  );
};

// Alert Widget Content Component
interface AlertWidgetContentProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
}

const AlertWidgetContent: React.FC<AlertWidgetContentProps> = ({ title, count, icon, color }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className={`${color} p-2`}>
          {icon}
        </div>
        <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{count}</span>
      </div>
      <h3 className="text-gray-600 dark:text-gray-400 text-xs font-medium">{title}</h3>
    </div>
  );
};

// Quick Stats Widget
interface QuickStatsWidgetProps {
  stats: DashboardStats;
}

const QuickStatsWidget: React.FC<QuickStatsWidgetProps> = ({ stats }) => {
  const total = stats.totalAssets || 1; // Avoid division by zero
  const availablePercent = Math.round((stats.availableAssets / total) * 100);
  const assignedPercent = Math.round((stats.assignedAssets / total) * 100);
  const maintenancePercent = Math.round((stats.maintenanceAssets / total) * 100);

  return (
    <div className="space-y-4 h-full">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">Available</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{availablePercent}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-green-600 h-2 rounded-full" style={{ width: `${availablePercent}%` }}></div>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">Assigned</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{assignedPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${assignedPercent}%` }}></div>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">In Maintenance</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{maintenancePercent}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${maintenancePercent}%` }}></div>
        </div>
      </div>
    </div>
  );
};

// Quick Action Button Component
interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  color: string;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon, label, color }) => {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
  };

  return (
    <button
      className={`${colors[color]} text-white rounded-lg p-4 flex items-center gap-3 shadow-md hover:shadow-lg transition-all`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
};
