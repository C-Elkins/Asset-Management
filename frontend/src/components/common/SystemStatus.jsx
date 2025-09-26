import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { testConnection, systemAPI } from '../../utils/api';

export const SystemStatus = () => {
  const [status, setStatus] = useState({
    backend: { connected: false, status: 'checking', message: 'Checking...' },
    database: { connected: false, status: 'checking', message: 'Checking...' },
    api: { connected: false, status: 'checking', message: 'Checking...' }
  });
  const [lastCheck, setLastCheck] = useState(new Date());
  const [checking, setChecking] = useState(false);

  const checkSystemStatus = async () => {
    setChecking(true);
    const newStatus = { ...status };

    // Check backend connection
    try {
      const backendResult = await testConnection();
      newStatus.backend = {
        connected: backendResult.connected,
        status: backendResult.connected ? 'success' : 'error',
        message: backendResult.message
      };
    } catch (error) {
      newStatus.backend = {
        connected: false,
        status: 'error',
        message: 'Backend connection failed'
      };
    }

    // Check database connection (through backend)
    if (newStatus.backend.connected) {
      try {
        const response = await fetch('http://localhost:8080/api/v1/assets');
        newStatus.database = {
          connected: response.ok,
          status: response.ok ? 'success' : 'error',
          message: response.ok ? 'Database accessible' : 'Database connection failed'
        };
      } catch (error) {
        newStatus.database = {
          connected: false,
          status: 'error',
          message: 'Cannot reach database'
        };
      }
    } else {
      newStatus.database = {
        connected: false,
        status: 'warning',
        message: 'Backend required for database check'
      };
    }

    // Check API endpoints
    if (newStatus.backend.connected) {
      try {
        const endpoints = [
          '/api/v1/assets',
          '/api/v1/users/profile',
          '/api/v1/system/status'
        ];
        
        const results = await Promise.allSettled(
          endpoints.map(endpoint => 
            fetch(`http://localhost:8080${endpoint}`)
          )
        );
        
        const successCount = results.filter(r => 
          r.status === 'fulfilled' && r.value.ok
        ).length;
        
        newStatus.api = {
          connected: successCount > 0,
          status: successCount === endpoints.length ? 'success' : 
                  successCount > 0 ? 'warning' : 'error',
          message: `${successCount}/${endpoints.length} endpoints responding`
        };
      } catch (error) {
        newStatus.api = {
          connected: false,
          status: 'error',
          message: 'API endpoints check failed'
        };
      }
    } else {
      newStatus.api = {
        connected: false,
        status: 'warning',
        message: 'Backend required for API check'
      };
    }

    setStatus(newStatus);
    setLastCheck(new Date());
    setChecking(false);
  };

  useEffect(() => {
    checkSystemStatus();
    // Check every 30 seconds
    const interval = setInterval(checkSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
        <motion.button
          onClick={checkSystemStatus}
          disabled={checking}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
          Refresh
        </motion.button>
      </div>

      <div className="space-y-3">
        {Object.entries(status).map(([key, value]) => (
          <motion.div
            key={key}
            className={`flex items-center justify-between p-3 border rounded-md ${getStatusColor(value.status)}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(value.status)}
              <div>
                <p className="font-medium text-gray-900 capitalize">{key}</p>
                <p className="text-sm text-gray-600">{value.message}</p>
              </div>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              value.status === 'success' ? 'bg-green-100 text-green-800' :
              value.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              value.status === 'error' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {value.status === 'success' ? 'Online' :
               value.status === 'warning' ? 'Warning' :
               value.status === 'error' ? 'Offline' : 'Checking'}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Last checked: {lastCheck.toLocaleTimeString()}
        </p>
      </div>
    </motion.div>
  );
};
