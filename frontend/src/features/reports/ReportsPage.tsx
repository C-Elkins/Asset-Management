import React from 'react';
import { useCustomization } from '../../hooks/useCustomization';
import { motion } from 'framer-motion';
import { Card, Badge } from '@/components/ui';
import { BarChart3 } from 'lucide-react';

const ReportsPage: React.FC = () => {
  const { terminology } = useCustomization();
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
  <h1 className="text-3xl font-bold text-gray-900">{terminology.reports || 'Reports'}</h1>
        <p className="text-gray-600 mt-1">Analytics and reporting dashboard</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card variant="elevated" className="p-12 text-center">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-6"
            whileHover={{ scale: 1.1, rotate: 10 }}
          >
            <BarChart3 size={32} className="text-primary-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Reports & Analytics</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Generate detailed reports and analyze asset performance metrics.
          </p>
          <Badge variant="info" size="lg">Coming Soon</Badge>
        </Card>
      </motion.div>
    </div>
  );
};

export default ReportsPage;
