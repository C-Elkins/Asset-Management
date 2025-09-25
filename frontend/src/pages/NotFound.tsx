import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, Button } from '@/components/ui';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card variant="elevated" className="p-8">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-error-100 rounded-2xl mb-6"
            whileHover={{ scale: 1.1, rotate: 10 }}
          >
            <AlertTriangle size={32} className="text-error-600" />
          </motion.div>
          
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <Link to="/app/dashboard">
            <Button
              variant="primary"
              size="lg"
              icon={<Home size={20} />}
            >
              Back to Dashboard
            </Button>
          </Link>
        </Card>
      </motion.div>
    </div>
  );
};

export default NotFound;
