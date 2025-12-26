import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Lock, Eye, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
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
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-12 text-white">
            <div className="flex items-center gap-4 mb-4">
              <Shield className="w-12 h-12" />
              <div>
                <h1 className="text-4xl font-bold">Privacy Policy</h1>
                <p className="text-purple-100 mt-2">Effective Date: October 4, 2025</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">CCPA Compliant</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                <Database className="w-4 h-4" />
                <span className="text-sm font-medium">AES-256 Encrypted</span>
              </div>
            </div>
          </div>

          {/* Embedded Document */}
          <div className="p-8">
            <iframe
              src="/privacy-policy.html"
              title="Privacy Policy"
              className="w-full border-0"
              style={{ minHeight: '800px', height: '100vh' }}
              sandbox="allow-same-origin"
            />
          </div>

          {/* Quick Links */}
          <div className="bg-slate-50 px-8 py-6 border-t border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Privacy Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/terms-of-service"
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Terms of Service
              </Link>
              <a
                href="mailto:privacy@krubles.com"
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
              >
                Contact Privacy Team
              </a>
              <a
                href="mailto:dpo@krubles.com"
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
              >
                Data Protection Officer
              </a>
            </div>
          </div>
        </motion.div>

        {/* Privacy Rights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">GDPR Rights</h3>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              European users have enhanced privacy rights including access, rectification, erasure, and data portability.
            </p>
            <a
              href="mailto:dpo@krubles.com"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Contact DPO →
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-purple-50 border border-purple-200 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">CCPA Rights</h3>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              California residents can request access to and deletion of personal information. We do not sell your data.
            </p>
            <a
              href="mailto:privacy@krubles.com?subject=California Privacy Rights"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium text-sm"
            >
              Exercise Rights →
            </a>
          </motion.div>
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-2">Questions About Your Privacy?</h3>
          <p className="text-purple-100 mb-6">
            Our privacy team is here to help. Contact us for data access requests, deletion requests, or any privacy concerns.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="mailto:privacy@krubles.com"
              className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
            >
              Email Privacy Team
            </a>
            <a
              href="mailto:dpo@krubles.com"
              className="inline-flex items-center px-6 py-3 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors font-medium"
            >
              Contact DPO
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
