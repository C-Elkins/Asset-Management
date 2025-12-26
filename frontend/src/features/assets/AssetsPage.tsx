import React from 'react';
import { useCustomization } from '../../hooks/useCustomization';
import { motion } from 'framer-motion';
import { Card, Button, Badge } from '@/components/ui';
import { Package, Plus } from 'lucide-react';

const AssetsPage: React.FC = () => {
  const { terminology } = useCustomization();
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{terminology.assets || 'Assets'}</h1>
          <p className="text-gray-600 mt-1">Manage your IT equipment and resources</p>
        </div>
        <Button
          variant="primary"
          size="lg"
          icon={<Plus size={20} />}
        >
          Add Asset
        </Button>
      </motion.div>

      {/* Coming Soon Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card variant="elevated" className="p-12 text-center">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-6"
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Package size={32} className="text-primary-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Assets Management</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Full asset management functionality with search, filtering, and detailed views coming soon.
          </p>
          <Badge variant="info" size="lg">In Development</Badge>
        </Card>
      </motion.div>
    </div>
  );
};

export default AssetsPage;
