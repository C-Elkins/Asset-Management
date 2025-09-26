import React from 'react';
import { motion } from 'framer-motion';
import { MaintenanceSchedule } from '../components/maintenance/MaintenanceSchedule.jsx';

export const MaintenancePage = () => (
  <div className="p-8 space-y-8">
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Maintenance Management</h1>
      <p className="text-slate-600">Schedule, track, and manage all asset maintenance activities</p>
    </motion.div>
    
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <MaintenanceSchedule />
    </motion.div>
  </div>
);
