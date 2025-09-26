import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Wrench, AlertTriangle, CheckCircle, Plus } from 'lucide-react';

export const MaintenanceSchedule = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  const tasks = [
    { id: 1, title: 'Server Hardware Update', asset: 'Dell R740', status: 'scheduled', priority: 'High', date: '2024-12-28' },
    { id: 2, title: 'Network Switch Maintenance', asset: 'Cisco 2960', status: 'in-progress', priority: 'Medium', date: '2024-12-27' },
    { id: 3, title: 'Printer Maintenance', asset: 'HP LaserJet', status: 'completed', priority: 'Low', date: '2024-12-26' },
    { id: 4, title: 'Laptop Screen Repair', asset: 'MacBook Pro', status: 'scheduled', priority: 'High', date: '2024-12-29' }
  ];

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

  const filteredTasks = selectedStatus === 'all' ? tasks : tasks.filter(t => t.status === selectedStatus);

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

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">No maintenance tasks found for the selected filter.</p>
        </div>
      )}
    </div>
  );
};
