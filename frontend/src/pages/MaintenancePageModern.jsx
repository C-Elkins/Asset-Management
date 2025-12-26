import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, Calendar, Clock, CheckCircle, AlertTriangle, 
  Plus, Filter, Search, RefreshCw, Grid, List, TrendingUp,
  Package, Settings, Activity, Eye
} from 'lucide-react';
import { api } from '../services/api.js';

export const MaintenancePageModern = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [records, setRecords] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch maintenance records
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        let response;
        if (timeFilter === 'today') {
          response = await api.get('/maintenance/today');
        } else if (timeFilter === 'overdue') {
          response = await api.get('/maintenance/overdue');
        } else if (timeFilter === 'upcoming') {
          response = await api.get('/maintenance/upcoming', { params: { days: 14 } });
        } else {
          response = await api.get('/maintenance', { params: { page: 0, size: 100 } });
        }
        
        const allData = Array.isArray(response.data) ? response.data : (response?.data?.content || []);
        const items = allData.map(m => ({
          id: m.id,
          title: m.title || m.description || 'Maintenance Task',
          asset: m.asset?.name || m.assetTag || 'Unassigned',
          status: (m.status || 'scheduled').toLowerCase(),
          priority: m.priority || 'Medium',
          date: m.scheduledDate || m.dueDate || m.createdAt || '',
          technician: m.assignedTo || 'Unassigned',
          cost: m.estimatedCost || 0,
          description: m.description || ''
        }));
        if (mounted) setRecords(items);
      } catch (err) {
        console.error('Failed to load maintenance:', err);
        
        // Check if it's a 403 Forbidden error (expired token)
        if (err.response?.status === 403) {
          if (mounted) setError('Your session has expired. Please log out and log back in to continue.');
        } else {
          if (mounted) setError('Failed to load maintenance records');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [timeFilter]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = records.length;
    const scheduled = records.filter(r => r.status === 'scheduled').length;
    const inProgress = records.filter(r => r.status === 'in-progress' || r.status === 'in_progress').length;
    const completed = records.filter(r => r.status === 'completed').length;
    const overdue = records.filter(r => r.status === 'overdue').length;
    const totalCost = records.reduce((sum, r) => sum + (parseFloat(r.cost) || 0), 0);
    
    return { total, scheduled, inProgress, completed, overdue, totalCost };
  }, [records]);

  // Filter records
  const filteredRecords = useMemo(() => {
    let filtered = records;
    
    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(r => r.status === selectedStatus);
    }
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.technician.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [records, selectedStatus, searchTerm]);

  const statusOptions = [
    { value: 'all', label: 'All Tasks', color: 'slate' },
    { value: 'scheduled', label: 'Scheduled', color: 'blue' },
    { value: 'in-progress', label: 'In Progress', color: 'amber' },
    { value: 'completed', label: 'Completed', color: 'emerald' },
    { value: 'overdue', label: 'Overdue', color: 'red' }
  ];

  const timeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'upcoming', label: 'Upcoming (14 days)' }
  ];

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
      'in-progress': 'bg-amber-100 text-amber-700 border-amber-200',
      'in_progress': 'bg-amber-100 text-amber-700 border-amber-200',
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      overdue: 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: 'border-l-emerald-500',
      Medium: 'border-l-amber-500',
      High: 'border-l-red-500'
    };
    return colors[priority] || 'border-l-slate-500';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="maintenance-page-modern">
      {/* Hero Section */}
      <motion.div 
        className="maintenance-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="maintenance-hero-content">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
              metrics.overdue > 0 
                ? 'bg-gradient-to-br from-red-500 to-red-600' 
                : metrics.inProgress > 0 
                ? 'bg-gradient-to-br from-amber-500 to-amber-600' 
                : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
            }`}>
              <Wrench className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Maintenance Management</h1>
              <p className="text-sm text-slate-600">Schedule, track, and manage all maintenance activities</p>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="maintenance-metrics-grid">
          <motion.div className="metric-card" whileHover={{ y: -4 }}>
            <div className="metric-icon bg-gradient-to-br from-blue-500 to-blue-600">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="metric-content">
              <p className="metric-label">Total Tasks</p>
              <p className="metric-value">{metrics.total}</p>
            </div>
          </motion.div>

          <motion.div className="metric-card" whileHover={{ y: -4 }}>
            <div className="metric-icon bg-gradient-to-br from-cyan-500 to-cyan-600">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div className="metric-content">
              <p className="metric-label">Scheduled</p>
              <p className="metric-value">{metrics.scheduled}</p>
            </div>
          </motion.div>

          <motion.div className="metric-card" whileHover={{ y: -4 }}>
            <div className={`metric-icon bg-gradient-to-br ${
              metrics.inProgress > 0 
                ? 'from-amber-500 to-amber-600' 
                : 'from-emerald-500 to-emerald-600'
            }`}>
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="metric-content">
              <p className="metric-label">In Progress</p>
              <p className="metric-value">{metrics.inProgress}</p>
            </div>
          </motion.div>

          <motion.div className="metric-card" whileHover={{ y: -4 }}>
            <div className="metric-icon bg-gradient-to-br from-emerald-500 to-emerald-600">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div className="metric-content">
              <p className="metric-label">Completed</p>
              <p className="metric-value">{metrics.completed}</p>
            </div>
          </motion.div>

          <motion.div className="metric-card" whileHover={{ y: -4 }}>
            <div className={`metric-icon bg-gradient-to-br ${
              metrics.overdue > 0 
                ? 'from-red-500 to-red-600' 
                : 'from-emerald-500 to-emerald-600'
            }`}>
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div className="metric-content">
              <p className="metric-label">Overdue</p>
              <p className="metric-value">{metrics.overdue}</p>
            </div>
          </motion.div>

          <motion.div className="metric-card metric-card-wide" whileHover={{ y: -4 }}>
            <div className="metric-icon bg-gradient-to-br from-purple-500 to-purple-600">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="metric-content">
              <p className="metric-label">Total Cost</p>
              <p className="metric-value">${metrics.totalCost.toLocaleString()}</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Filters and Actions Bar */}
      <motion.div 
        className="maintenance-toolbar"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Search */}
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by task, asset, or technician..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Actions */}
        <div className="toolbar-actions">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`toolbar-btn ${showFilters ? 'toolbar-btn-active' : ''}`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden md:inline">Filters</span>
          </button>

          <div className="toolbar-divider" />

          <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="toolbar-btn">
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </button>

          <button onClick={() => window.location.reload()} className="toolbar-btn">
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="toolbar-divider" />

          <button 
            onClick={() => alert('Schedule new maintenance task')} 
            className="toolbar-btn toolbar-btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Schedule Task</span>
          </button>
        </div>
      </motion.div>

      {/* Status and Time Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            className="maintenance-filters"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="filter-group">
              <p className="filter-group-label">Status</p>
              <div className="filter-buttons">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedStatus(option.value)}
                    className={`status-filter-btn status-filter-${option.color} ${selectedStatus === option.value ? 'active' : ''}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <p className="filter-group-label">Time Period</p>
              <div className="filter-buttons">
                {timeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTimeFilter(option.value)}
                    className={`time-filter-btn ${timeFilter === option.value ? 'active' : ''}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Maintenance Records */}
      {loading ? (
        <div className="maintenance-loading">
          <div className="spinner"></div>
          <p>Loading maintenance records...</p>
        </div>
      ) : error ? (
        <div className="maintenance-error">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-lg font-semibold text-slate-900 mb-2">{error}</p>
          {error.includes('session has expired') ? (
            <button 
              onClick={() => { 
                localStorage.removeItem('token'); 
                window.location.href = '/login'; 
              }} 
              className="retry-btn"
            >
              Log Out & Sign In Again
            </button>
          ) : (
            <button onClick={() => window.location.reload()} className="retry-btn">
              Try Again
            </button>
          )}
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="maintenance-empty">
          <Wrench className="w-16 h-16 text-slate-300 mb-4" />
          <p className="text-lg font-semibold text-slate-900 mb-2">No maintenance tasks found</p>
          <p className="text-sm text-slate-600 mb-4">
            {searchTerm || selectedStatus !== 'all' 
              ? 'Try adjusting your filters or search term' 
              : 'Get started by scheduling your first maintenance task'}
          </p>
          {!searchTerm && selectedStatus === 'all' && (
            <button onClick={() => alert('Schedule new task')} className="add-first-btn">
              <Plus className="w-5 h-5 mr-2" />
              Schedule First Task
            </button>
          )}
        </div>
      ) : (
        <motion.div 
          className={viewMode === 'grid' ? 'maintenance-grid' : 'maintenance-list'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {filteredRecords.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`maintenance-card ${getPriorityColor(task.priority)}`}
            >
              <div className="maintenance-card-header">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="maintenance-card-title">{task.title}</h3>
                    <p className="maintenance-card-subtitle">{task.asset}</p>
                  </div>
                  <span className={`maintenance-status ${getStatusColor(task.status)}`}>
                    {task.status.replace('-', ' ').replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="maintenance-card-body">
                <div className="maintenance-info-grid">
                  <div className="maintenance-info-item">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-600">{formatDate(task.date)}</span>
                  </div>
                  <div className="maintenance-info-item">
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-600">{task.technician}</span>
                  </div>
                  <div className="maintenance-info-item">
                    <Package className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-600">{task.priority} Priority</span>
                  </div>
                  {task.cost > 0 && (
                    <div className="maintenance-info-item">
                      <TrendingUp className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-600">${task.cost.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {task.description && (
                  <p className="maintenance-description">{task.description}</p>
                )}
              </div>

              <div className="maintenance-card-actions">
                <button className="maintenance-action-btn">
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button className="maintenance-action-btn maintenance-action-btn-primary">
                  <CheckCircle className="w-4 h-4" />
                  Update Status
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
