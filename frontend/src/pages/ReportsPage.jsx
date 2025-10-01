import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, TrendingUp, Users, Server, AlertTriangle } from 'lucide-react';

export const ReportsPage = () => {
  const [activeReport, setActiveReport] = useState('overview');
  
  const reports = [
    {
      id: 'overview',
      title: 'System Overview',
      icon: TrendingUp,
      description: 'Complete system analytics and insights',
      data: {
        totalAssets: 127,
        activeUsers: 24,
        pendingMaintenance: 8,
        systemHealth: 98.5
      }
    },
    {
      id: 'assets',
      title: 'Asset Reports', 
      icon: Server,
      description: 'Detailed asset utilization and lifecycle reports',
      data: {
        totalValue: '$284,500',
        avgAge: '2.3 years',
        utilizationRate: '87%',
        replacementNeeded: 12
      }
    },
    {
      id: 'users',
      title: 'User Activity',
      icon: Users, 
      description: 'User engagement and access patterns',
      data: {
        dailyActiveUsers: 18,
        weeklyLogins: 142,
        topUser: 'John Doe',
        avgSessionTime: '45 min'
      }
    },
    {
      id: 'maintenance',
      title: 'Maintenance Reports',
      icon: AlertTriangle,
      description: 'Service schedules and completion metrics', 
      data: {
        completedTasks: 34,
        upcomingTasks: 12,
        avgResponseTime: '4.2 hours',
        satisfactionRate: '96%'
      }
    }
  ];
  
  const activeReportData = reports.find(r => r.id === activeReport);
  
  return (
    <div className="p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Business Intelligence</h1>
        <p className="text-slate-600">Comprehensive reports and analytics for informed decision making</p>
      </motion.div>
      
      {/* Report Navigation */}
      <motion.div 
        className="flex gap-4 overflow-x-auto pb-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {reports.map((report) => {
          const IconComponent = report.icon;
          return (
            <motion.button
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl border transition-all duration-300 min-w-fit ${
                activeReport === report.id
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900'
              }`}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <IconComponent className="w-5 h-5" strokeWidth={2} />
              <div className="text-left">
                <p className="font-semibold text-sm">{report.title}</p>
                <p className="text-xs opacity-75">{report.description}</p>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
      
      {/* Active Report Display */}
      <motion.div
        key={activeReport}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl border border-slate-200 p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <activeReportData.icon className="w-6 h-6 text-blue-600" strokeWidth={2} />
            <div>
              <h2 className="text-xl font-bold text-slate-900">{activeReportData.title}</h2>
              <p className="text-slate-600 text-sm">{activeReportData.description}</p>
            </div>
          </div>
          <motion.button 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => alert(`Downloading ${activeReportData.title} report...`)}
          >
            <Download className="w-4 h-4" />
            Download
          </motion.button>
        </div>
        
        {/* Report Data Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Object.entries(activeReportData.data).map(([key, value], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-slate-50 rounded-lg p-4 text-center"
            >
              <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
              <p className="text-sm text-slate-600 capitalize">
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </p>
            </motion.div>
          ))}
        </div>
        
        {/* Mock Chart Area */}
        <div className="mt-8 p-6 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Trend Analysis</h3>
          </div>
          <div className="h-48 bg-white rounded border-2 border-dashed border-slate-300 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-medium">Interactive Chart</p>
              <p className="text-sm">Data visualization would appear here</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
