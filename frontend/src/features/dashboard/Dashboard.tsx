import React from 'react';
import { motion } from 'framer-motion';
import { Card, Badge, LoadingSpinner } from '../../shared/components/ui';
import { 
  Package, 
  Users, 
  Wrench, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { DashboardStats } from '../../shared/types';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change?: number;
  changeLabel?: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
  loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  change,
  changeLabel,
  color = 'primary',
  loading = false
}) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600 border-primary-200',
    success: 'bg-success-50 text-success-600 border-success-200',
    warning: 'bg-warning-50 text-warning-600 border-warning-200',
    error: 'bg-error-50 text-error-600 border-error-200'
  };

  return (
    <Card variant="elevated" className="p-6 hover:shadow-medium transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {loading ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <span className="text-gray-400">Loading...</span>
            </div>
          ) : (
            <motion.p
              className="text-2xl font-bold text-gray-900"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {value}
            </motion.p>
          )}
          {change !== undefined && changeLabel && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp size={14} className={change >= 0 ? 'text-success-600' : 'text-error-600'} />
              <span className={`text-xs font-medium ${change >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-gray-500">{changeLabel}</span>
            </div>
          )}
        </div>
        <motion.div
          className={`p-3 rounded-xl border ${colorClasses[color]}`}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {icon}
        </motion.div>
      </div>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Mock data loading - replace with actual API call
    const loadDashboardStats = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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

    loadDashboardStats();
  }, []);

  // Simplified motion variants typed with const assertions to avoid expansive Variant requirements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 }
  } as const;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your assets.</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Total Assets"
            value={loading ? 'Loading...' : stats?.totalAssets || 0}
            icon={<Package size={24} />}
            change={8.2}
            changeLabel="vs last month"
            color="primary"
            loading={loading}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatsCard
            title="Available"
            value={loading ? 'Loading...' : stats?.availableAssets || 0}
            icon={<CheckCircle size={24} />}
            change={-2.4}
            changeLabel="vs last month"
            color="success"
            loading={loading}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatsCard
            title="In Maintenance"
            value={loading ? 'Loading...' : stats?.maintenanceAssets || 0}
            icon={<Wrench size={24} />}
            change={15.3}
            changeLabel="vs last month"
            color="warning"
            loading={loading}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatsCard
            title="Overdue"
            value={loading ? 'Loading...' : stats?.overdueAssets || 0}
            icon={<AlertTriangle size={24} />}
            change={-12.1}
            changeLabel="vs last month"
            color="error"
            loading={loading}
          />
        </motion.div>
      </motion.div>

      {/* Secondary Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Active Users"
            value={loading ? 'Loading...' : stats?.totalUsers || 0}
            icon={<Users size={24} />}
            change={5.7}
            changeLabel="vs last month"
            color="primary"
            loading={loading}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatsCard
            title="Categories"
            value={loading ? 'Loading...' : stats?.totalCategories || 0}
            icon={<Package size={24} />}
            color="primary"
            loading={loading}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatsCard
            title="Upcoming Maintenance"
            value={loading ? 'Loading...' : stats?.upcomingMaintenance || 0}
            icon={<Clock size={24} />}
            color="warning"
            loading={loading}
          />
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card variant="elevated" className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Assets</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <motion.div
                  key={item}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Package size={16} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">MacBook Pro 16"</p>
                      <p className="text-sm text-gray-500">Added 2 hours ago</p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">Available</Badge>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card variant="elevated" className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Alerts</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <motion.div
                  key={item}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                      <Wrench size={16} className="text-warning-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Server Maintenance</p>
                      <p className="text-sm text-gray-500">Due in 3 days</p>
                    </div>
                  </div>
                  <Badge variant="warning" size="sm">Scheduled</Badge>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export { Dashboard };
