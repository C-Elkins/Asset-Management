import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
        >
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 text-white">
            <div className="flex items-center gap-4 mb-4">
              <FileText className="w-12 h-12" />
              <div>
                <h1 className="text-4xl font-bold">Terms of Service</h1>
                <p className="text-blue-100 mt-2">Effective Date: October 4, 2025</p>
              </div>
            </div>
          </div>

          {/* Embedded Document */}
          <div className="p-8">
            <iframe
              src="/terms-of-service.html"
              title="Terms of Service"
              className="w-full border-0"
              style={{ minHeight: '800px', height: '100vh' }}
              sandbox="allow-same-origin"
            />
          </div>

          {/* Quick Links */}
          <div className="bg-slate-50 px-8 py-6 border-t border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/privacy-policy"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Privacy Policy
              </Link>
              <a
                href="mailto:legal@krubles.com"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                Contact Legal Team
              </a>
              <a
                href="mailto:support@krubles.com"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Have Questions?</h3>
          <p className="text-slate-600 mb-4">
            If you have any questions about our Terms of Service, please don't hesitate to reach out to our legal team.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="mailto:legal@krubles.com"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Email Legal Team
            </a>
            <a
              href="mailto:support@krubles.com"
              className="inline-flex items-center px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
