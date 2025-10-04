import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Wrench, AlertTriangle, CheckCircle, Plus } from 'lucide-react';
import { api } from '../../services/api.js';

export const MaintenanceSchedule = () => {
  const [selectedStatus, setSelectedStatus] = useState('all'); // all | scheduled | in-progress | completed
  const [timeFilter, setTimeFilter] = useState('all'); // all | today | overdue | upcoming
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [records, setRecords] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        // Load base data initially
        const all = await api.get('/maintenance', { params: { page: 0, size: 100 } }).catch(() => ({ data: { content: [] } }));
        const allData = Array.isArray(all.data) ? all.data : (all?.data?.content || []);
        const items = allData.map(m => ({
          id: m.id,
          title: m.title || m.description || 'Maintenance',
          asset: m.asset?.name || m.assetTag || '—',
          status: (m.status || 'scheduled').toLowerCase(),
          priority: (m.priority || 'Medium'),
          date: m.scheduledDate || m.dueDate || m.createdAt || ''
        }));
        if (mounted) setRecords(items);
      } catch {
        if (mounted) setError('Failed to load maintenance');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-orange-100 text-orange-800', 
    completed: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800'
  };

  const priorityColors = {
    Low: 'border-green-300',
    Medium: 'border-yellow-300',
    High: 'border-red-300'
  };

  const filteredTasks = useMemo(() => {
    let list = records;
    if (selectedStatus === 'all') return list;
    list = list.filter(t => t.status === selectedStatus);
    return list;
  }, [records, selectedStatus]);

  return (
    <div className="space-y-6">
      <motion.div 
        className="flex flex-wrap gap-4 justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex gap-2">
          {['all', 'scheduled', 'in-progress', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                selectedStatus === status 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {status === 'all' ? 'All Tasks' : status.replace('-', ' ')}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {['all', 'today', 'overdue', 'upcoming'].map(t => (
            <button
              key={t}
              onClick={async () => {
                setTimeFilter(t);
                setLoading(true);
                try {
                  if (t === 'all') {
                    const all = await api.get('/maintenance', { params: { page: 0, size: 100 } });
                    const allData = Array.isArray(all.data) ? all.data : (all?.data?.content || []);
                    setRecords(allData.map(m => ({ id: m.id, title: m.title || m.description || 'Maintenance', asset: m.asset?.name || m.assetTag || '—', status: (m.status || 'scheduled').toLowerCase(), priority: (m.priority || 'Medium'), date: m.scheduledDate || m.dueDate || m.createdAt || '' })));
                  } else if (t === 'today') {
                    const { data } = await api.get('/maintenance/today');
                    setRecords((Array.isArray(data) ? data : []).map(m => ({ id: m.id, title: m.title || m.description || 'Maintenance', asset: m.asset?.name || m.assetTag || '—', status: (m.status || 'scheduled').toLowerCase(), priority: (m.priority || 'Medium'), date: m.scheduledDate || m.dueDate || m.createdAt || '' })));
                  } else if (t === 'overdue') {
                    const { data } = await api.get('/maintenance/overdue');
                    setRecords((Array.isArray(data) ? data : []).map(m => ({ id: m.id, title: m.title || m.description || 'Maintenance', asset: m.asset?.name || m.assetTag || '—', status: (m.status || 'scheduled').toLowerCase(), priority: (m.priority || 'Medium'), date: m.scheduledDate || m.dueDate || m.createdAt || '' })));
                  } else if (t === 'upcoming') {
                    const { data } = await api.get('/maintenance/upcoming', { params: { days: 14 } });
                    setRecords((Array.isArray(data) ? data : []).map(m => ({ id: m.id, title: m.title || m.description || 'Maintenance', asset: m.asset?.name || m.assetTag || '—', status: (m.status || 'scheduled').toLowerCase(), priority: (m.priority || 'Medium'), date: m.scheduledDate || m.dueDate || m.createdAt || '' })));
                  }
                } catch {
                  // ignore load errors in quick filters
                } finally { setLoading(false); }
              }}
              className={`px-3 py-2 rounded-lg text-sm ${timeFilter===t ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 hover:bg-slate-50'}`}
            >
              {t[0].toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>
        
        <motion.button 
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => alert('Add new maintenance task...')}
        >
          <Plus className="w-4 h-4" />
          Schedule Task
        </motion.button>
      </motion.div>

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded">{error}</div>
      )}

      <div className="grid gap-4">
        {filteredTasks.map((task, index) => {
          const statusIcon = {
            scheduled: <Calendar className="w-5 h-5 text-blue-600" />,
            'in-progress': <Wrench className="w-5 h-5 text-orange-600" />,
            completed: <CheckCircle className="w-5 h-5 text-green-600" />,
            overdue: <AlertTriangle className="w-5 h-5 text-red-600" />
          };

          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`bg-white border-l-4 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${
                priorityColors[task.priority]
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {statusIcon[task.status]}
                  <div>
                    <h3 className="font-semibold text-slate-900">{task.title}</h3>
                    <p className="text-sm text-slate-600">{task.asset}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    statusColors[task.status]
                  }`}>
                    {task.status.replace('-', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    task.priority === 'High' ? 'bg-red-100 text-red-800' :
                    task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>📅 {task.date}</span>
                <motion.button 
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => alert(`View details for: ${task.title}`)}
                >
                  View Details
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {(!loading && filteredTasks.length === 0) && (
        <div className="text-center py-12">
          <Wrench className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">No maintenance tasks found for the selected filter.</p>
        </div>
      )}
    </div>
  );
};
