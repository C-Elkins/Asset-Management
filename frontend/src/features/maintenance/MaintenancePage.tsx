import React from 'react';
import { useCustomization } from '../../hooks/useCustomization';
import { motion } from 'framer-motion';
import { Card, Badge } from '@/components/ui';
import { Wrench } from 'lucide-react';

const MaintenancePage: React.FC = () => {
  const { terminology } = useCustomization();
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
  <h1 className="text-3xl font-bold text-gray-900">{terminology.maintenance || 'Maintenance'}</h1>
        <p className="text-gray-600 mt-1">Track and schedule maintenance activities</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card variant="elevated" className="p-12 text-center">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-warning-100 rounded-2xl mb-6"
            whileHover={{ scale: 1.1, rotate: 10 }}
          >
            <Wrench size={32} className="text-warning-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Maintenance Management</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Schedule maintenance, track repairs, and manage service records.
          </p>
          <Badge variant="warning" size="lg">Coming Soon</Badge>
        </Card>
      </motion.div>
    </div>
  );
};

export default MaintenancePage;
