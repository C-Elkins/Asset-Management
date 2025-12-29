import React, { useState, useEffect } from 'react';
import { ActivityLog } from '../types/api';
import { Activity, Package, Edit, Trash2, LogOut, LogIn, X } from 'lucide-react';

interface RecentActivityProps {
  limit?: number;
  className?: string;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ limit = 10, className = '' }) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivity();
    // Refresh every 30 seconds
    const interval = setInterval(loadActivity, 30000);
    return () => clearInterval(interval);
  }, [limit]);

  const loadActivity = async () => {
    try {
      const data = await window.api.getRecentActivity(limit);
      setActivities(data);
    } catch (error) {
      console.error('Failed to load recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all activity history? This action cannot be undone.')) {
      return;
    }

    try {
      await (window.api as any).clearActivityLog();
      await loadActivity();
    } catch (error) {
      console.error('Failed to clear activity log:', error);
      alert('Failed to clear activity log. Please try again.');
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create':
        return <Package size={16} className="text-green-600" />;
      case 'update':
        return <Edit size={16} className="text-blue-600" />;
      case 'delete':
        return <Trash2 size={16} className="text-red-600" />;
      case 'checkout':
        return <LogOut size={16} className="text-orange-600" />;
      case 'checkin':
        return <LogIn size={16} className="text-green-600" />;
      default:
        return <Activity size={16} className="text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'create':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'update':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'delete':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'checkout':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'checkin':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEntityTypeLabel = (entityType: string) => {
    switch (entityType) {
      case 'asset':
        return 'Asset';
      case 'category':
        return 'Category';
      case 'assignment':
        return 'Assignment';
      case 'inventory_item':
        return 'Inventory Item';
      default:
        return entityType;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Activity size={20} className="text-emerald-600" />
          Recent Activity
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading activity...</div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Activity size={20} className="text-emerald-600" />
          Recent Activity
        </h3>
        {activities.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            title="Clear all activity"
          >
            <X size={16} />
            Clear All
          </button>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No recent activity
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`p-3 border rounded-lg ${getActivityColor(activity.activity_type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getActivityIcon(activity.activity_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{getEntityTypeLabel(activity.entity_type)}</span>
                    {activity.entity_name && (
                      <>
                        <span>•</span>
                        <span className="truncate">{activity.entity_name}</span>
                      </>
                    )}
                    {activity.user_name && (
                      <>
                        <span>•</span>
                        <span>by {activity.user_name}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {formatTime(activity.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
