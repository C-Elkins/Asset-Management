import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, TrendingUp, Users, Server, AlertTriangle, UploadCloud, Sparkles } from 'lucide-react';

export const ReportsPage = () => {
  const [activeReport, setActiveReport] = useState('overview');
  const reports = [
    { id: 'overview', title: 'System Overview', icon: TrendingUp, description: 'Complete system analytics and insights' },
    { id: 'assets', title: 'Asset Reports', icon: Server, description: 'Detailed asset utilization and lifecycle reports' },
    { id: 'users', title: 'User Activity', icon: Users, description: 'User engagement and access patterns' },
    { id: 'maintenance', title: 'Maintenance Reports', icon: AlertTriangle, description: 'Service schedules and completion metrics' }
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
          <div className="flex items-center gap-3">
            <motion.button 
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('reportImportInput')?.click()}
            >
              <UploadCloud className="w-4 h-4" />
              Import Data
            </motion.button>
            <input id="reportImportInput" type="file" accept="application/json" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const json = JSON.parse(String(reader.result || '{}'));
                  console.log('Imported report data (placeholder)', json);
                  alert('Data imported. AI analysis will be available shortly.');
                } catch {
                  alert('Invalid JSON file.');
                }
              };
              reader.readAsText(file);
            }} />
            <motion.button 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => alert('AI insights coming soon: we will summarize your imported data and suggest actions.')}
            >
              <Sparkles className="w-4 h-4" />
              AI Insights
            </motion.button>
          </div>
        </div>
        {/* Empty state / placeholder until data is imported */}
        <div className="mt-6 p-6 bg-slate-50 rounded-lg text-center text-slate-600">
          <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="font-medium">No data loaded yet</p>
          <p className="text-sm">Import a JSON export or connect your data source to generate reports.</p>
        </div>
      </motion.div>
    </div>
  );
};
