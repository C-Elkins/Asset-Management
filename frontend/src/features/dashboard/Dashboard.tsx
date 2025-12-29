// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Badge, LoadingSpinner } from '../../shared/components/ui';
import {
  Package,
  Users,
  Wrench,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Plus,
  Eye,
  EyeOff,
  RefreshCw,
  GripVertical,
  Trash2,
  X,
  Activity,
  Calendar,
  DollarSign
} from 'lucide-react';
import { DashboardStats } from '../../shared/types';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-grid-layout/css/resizable.css';

type LayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

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
  { id: 'maintenance-assets', type: 'metric', title: 'In Maintenance', visible: true, x: 9, y: 0, w: 3, h: 2 },
  { id: 'active-users', type: 'metric', title: 'Active Users', visible: true, x: 0, y: 2, w: 3, h: 2 },
  { id: 'total-categories', type: 'metric', title: 'Categories', visible: true, x: 3, y: 2, w: 3, h: 2 },
  { id: 'upcoming-maintenance', type: 'alert', title: 'Upcoming Maintenance', visible: true, x: 6, y: 2, w: 3, h: 2 },
  { id: 'overdue-assets', type: 'alert', title: 'Overdue Assets', visible: true, x: 9, y: 2, w: 3, h: 2 },
  { id: 'recent-activity', type: 'activity', title: 'Recent Activity', visible: true, x: 0, y: 4, w: 6, h: 4 },
  { id: 'maintenance-alerts', type: 'list', title: 'Maintenance Alerts', visible: true, x: 6, y: 4, w: 6, h: 4 },
];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [widgets, setWidgets] = useState<Widget[]>(defaultWidgets);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    loadDashboardStats();
    loadWidgetPreferences();
  }, []);

  // Auto-refresh every 30 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadDashboardStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadDashboardStats = async () => {
    setLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockStats: DashboardStats = {
      totalAssets: 1247,
      availableAssets: 892,
      assignedAssets: 298,
      maintenanceAssets: 57,
      totalUsers: 84,
      totalCategories: 12,
      upcomingMaintenance: 23,
      overdueAssets: 8
    };

    setStats(mockStats);
    setLoading(false);
  };

  const loadWidgetPreferences = () => {
    const savedWidgets = localStorage.getItem('dashboard_widgets');
    if (savedWidgets) {
      try {
        setWidgets(JSON.parse(savedWidgets));
      } catch (error) {
        console.error('Failed to load widget preferences:', error);
      }
    }
  };

  const saveWidgetPreferences = (updatedWidgets: Widget[]) => {
    localStorage.setItem('dashboard_widgets', JSON.stringify(updatedWidgets));
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
    const existingCount = widgets.filter(w => w.id.startsWith(widgetType.id)).length;
    const newId = existingCount > 0 ? `${widgetType.id}-${existingCount + 1}` : widgetType.id;
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
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner size="md" />
        </div>
      );
    }

    switch (widget.id) {
      case 'total-assets':
        return (
          <MetricWidget
            value={stats?.totalAssets || 0}
            icon={<Package size={24} />}
            change={8.2}
            color="primary"
          />
        );
      case 'available-assets':
        return (
          <MetricWidget
            value={stats?.availableAssets || 0}
            icon={<CheckCircle size={24} />}
            change={-2.4}
            color="success"
          />
        );
      case 'assigned-assets':
        return (
          <MetricWidget
            value={stats?.assignedAssets || 0}
            icon={<Users size={24} />}
            change={5.3}
            color="primary"
          />
        );
      case 'maintenance-assets':
        return (
          <MetricWidget
            value={stats?.maintenanceAssets || 0}
            icon={<Wrench size={24} />}
            change={15.3}
            color="warning"
          />
        );
      case 'active-users':
        return (
          <MetricWidget
            value={stats?.totalUsers || 0}
            icon={<Users size={24} />}
            change={5.7}
            color="primary"
          />
        );
      case 'total-categories':
        return (
          <MetricWidget
            value={stats?.totalCategories || 0}
            icon={<Package size={24} />}
            color="primary"
          />
        );
      case 'upcoming-maintenance':
        return (
          <MetricWidget
            value={stats?.upcomingMaintenance || 0}
            icon={<Clock size={24} />}
            color="warning"
          />
        );
      case 'overdue-assets':
        return (
          <MetricWidget
            value={stats?.overdueAssets || 0}
            icon={<AlertTriangle size={24} />}
            change={-12.1}
            color="error"
          />
        );
      case 'recent-activity':
        return <RecentActivityWidget />;
      case 'maintenance-alerts':
        return <MaintenanceAlertsWidget />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p className="text-sm">Widget content for {widget.title}</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        className="flex justify-between items-start"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your assets.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
              autoRefresh
                ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={autoRefresh ? 'Auto-refresh: ON (every 30s)' : 'Auto-refresh: OFF'}
          >
            <RefreshCw size={18} className={autoRefresh ? 'animate-spin' : ''} />
            {autoRefresh && <span className="text-sm">Auto</span>}
          </button>
          <button
            onClick={loadDashboardStats}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-2"
            title="Refresh Now"
          >
            <RefreshCw size={18} />
          </button>
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
      </motion.div>

      {/* Customization Panel */}
      {showCustomize && (
        <motion.div
          className="mb-6 p-6 bg-white rounded-lg shadow-md border border-gray-200"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Customize Dashboard</h3>
            <button
              onClick={resetToDefault}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Reset to Default
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">Show or hide widgets, then drag them to rearrange:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {widgets.map(widget => (
              <button
                key={widget.id}
                onClick={() => toggleWidgetVisibility(widget.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  widget.visible
                    ? 'bg-emerald-100 text-emerald-900 border-2 border-emerald-300'
                    : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                }`}
              >
                {widget.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                {widget.title}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Add Widget Modal */}
      {showAddWidget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Add Widget to Dashboard</h3>
              <button
                onClick={() => setShowAddWidget(false)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded"
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
          </motion.div>
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
          <div key={widget.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="drag-handle cursor-move px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2 justify-between">
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
    </div>
  );
};

// Metric Widget Component
interface MetricWidgetProps {
  value: number | string;
  icon: React.ReactNode;
  change?: number;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

const MetricWidget: React.FC<MetricWidgetProps> = ({ value, icon, change, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600 border-primary-200',
    success: 'bg-success-50 text-success-600 border-success-200',
    warning: 'bg-warning-50 text-warning-600 border-warning-200',
    error: 'bg-error-50 text-error-600 border-error-200'
  };

  return (
    <div className="flex items-center justify-between h-full">
      <motion.p
        className="text-3xl font-bold text-gray-900"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {value}
      </motion.p>
      <motion.div
        className={`p-3 rounded-xl border ${colorClasses[color]}`}
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {icon}
      </motion.div>
      {change !== undefined && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1">
          <TrendingUp size={14} className={change >= 0 ? 'text-success-600' : 'text-error-600'} />
          <span className={`text-xs font-medium ${change >= 0 ? 'text-success-600' : 'text-error-600'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        </div>
      )}
    </div>
  );
};

// Recent Activity Widget
const RecentActivityWidget: React.FC = () => {
  const activities = [
    { title: 'MacBook Pro 16"', subtitle: 'Added 2 hours ago', icon: <Package size={16} className="text-primary-600" />, badge: 'Available' },
    { title: 'Dell Monitor', subtitle: 'Assigned 4 hours ago', icon: <Users size={16} className="text-blue-600" />, badge: 'Assigned' },
    { title: 'iPhone 13', subtitle: 'Added 6 hours ago', icon: <Package size={16} className="text-primary-600" />, badge: 'Available' },
    { title: 'Surface Laptop', subtitle: 'In maintenance 1 day ago', icon: <Wrench size={16} className="text-warning-600" />, badge: 'Maintenance' },
  ];

  return (
    <div className="space-y-3 h-full overflow-auto">
      {activities.map((activity, index) => (
        <motion.div
          key={index}
          className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
          whileHover={{ x: 4 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              {activity.icon}
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
              <p className="text-xs text-gray-500">{activity.subtitle}</p>
            </div>
          </div>
          <Badge variant="success" size="sm">{activity.badge}</Badge>
        </motion.div>
      ))}
    </div>
  );
};

// Maintenance Alerts Widget
const MaintenanceAlertsWidget: React.FC = () => {
  const alerts = [
    { title: 'Server Maintenance', subtitle: 'Due in 3 days', icon: <Wrench size={16} className="text-warning-600" /> },
    { title: 'Network Equipment Check', subtitle: 'Due in 5 days', icon: <Wrench size={16} className="text-warning-600" /> },
    { title: 'HVAC System Service', subtitle: 'Due in 1 week', icon: <Clock size={16} className="text-orange-600" /> },
  ];

  return (
    <div className="space-y-3 h-full overflow-auto">
      {alerts.map((alert, index) => (
        <motion.div
          key={index}
          className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
          whileHover={{ x: 4 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
              {alert.icon}
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{alert.title}</p>
              <p className="text-xs text-gray-500">{alert.subtitle}</p>
            </div>
          </div>
          <Badge variant="warning" size="sm">Scheduled</Badge>
        </motion.div>
      ))}
    </div>
  );
};

export { Dashboard };
