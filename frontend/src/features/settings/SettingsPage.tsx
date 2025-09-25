import React from 'react';
import { motion } from 'framer-motion';
import { Card, Badge } from '@/components/ui';
import { Settings } from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure your application preferences</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card variant="elevated" className="p-12 text-center">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-6"
            whileHover={{ scale: 1.1, rotate: 10 }}
          >
            <Settings size={32} className="text-gray-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Settings</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Customize themes, notifications, and system preferences.
          </p>
          <Badge variant="default" size="lg">Coming Soon</Badge>
        </Card>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
