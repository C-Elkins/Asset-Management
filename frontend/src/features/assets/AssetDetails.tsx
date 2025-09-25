import React from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { Card, Button, Badge } from '@/components/ui';
import { Package, ArrowLeft, Edit, Trash2 } from 'lucide-react';

const AssetDetails: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link
          to="/app/assets"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Assets
        </Link>
      </motion.div>

      {/* Asset Details */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card variant="elevated" className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Package size={24} className="text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Asset #{id}</h1>
                <p className="text-gray-600">Detailed view coming soon</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" icon={<Edit size={16} />}>
                Edit
              </Button>
              <Button variant="danger" icon={<Trash2 size={16} />}>
                Delete
              </Button>
            </div>
          </div>
          <Badge variant="info">In Development</Badge>
        </Card>
      </motion.div>
    </div>
  );
};

export default AssetDetails;
