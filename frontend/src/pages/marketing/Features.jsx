import React from 'react';
import MarketingLayout from '../../components/marketing/MarketingLayout.jsx';
import Seo from '../../components/marketing/Seo.jsx';

export const Features = () => {
  const features = [
    {
      icon: '📦',
      title: 'Unified Asset Inventory',
      description: 'Centralize all hardware and software assets in one intuitive dashboard. Track specifications, locations, and ownership.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '⚡',
      title: 'Bulk Import & Export',
      description: 'Migrate existing data instantly with CSV/JSON import. Export reports for audits and compliance with one click.',
      gradient: 'from-blue-600 to-emerald-500'
    },
    {
      icon: '🔧',
      title: 'Maintenance Schedules',
      description: 'Automated reminders for upcoming and overdue service. Never miss critical maintenance windows again.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: '🔒',
      title: 'Enterprise Security',
      description: 'SSO, MFA, and role-based access control built-in. Protect sensitive asset data with industry-standard encryption.',
      gradient: 'from-blue-500 to-green-500'
    },
    {
      icon: '📊',
      title: 'Advanced Reporting',
      description: 'Real-time dashboards and custom reports. Track utilization, costs, and asset lifecycle at a glance.',
      gradient: 'from-indigo-500 to-blue-500'
    },
    {
      icon: '🔗',
      title: 'API-First Platform',
      description: 'Integrate with your existing tools via REST API. Connect identity providers, CMDB, and help desk systems.',
      gradient: 'from-yellow-500 to-amber-500'
    },
    {
      icon: '🏢',
      title: 'Multi-Tenant Architecture',
      description: 'Isolate data by organization with tenant-aware design. Perfect for MSPs managing multiple clients.',
      gradient: 'from-teal-500 to-cyan-500'
    },
    {
      icon: '📝',
      title: 'Complete Audit Logs',
      description: 'Track every change with immutable audit trails. Meet compliance requirements with detailed activity logs.',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      icon: '🎨',
      title: 'Customizable Workflows',
      description: 'Configure asset categories, custom fields, and approval processes. Adapt the platform to your unique needs.',
      gradient: 'from-blue-600 to-emerald-600'
    }
  ];

  return (
    <MarketingLayout>
      <Seo title="Features — KA by Krubles" description="Explore powerful features: unified inventory, bulk imports, automated maintenance, advanced reporting, enterprise security, and API-first integrations." />
      
      <main className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #fafbfc 0%, #f0f4f8 100%)' }}>
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-emerald-400/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-green-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-full px-4 py-2 mb-8 shadow-sm">
            <span className="text-2xl">🚀</span>
            <span className="text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Built for modern IT teams
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            <span style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 25%, #10b981 75%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Powerful Features
            </span>
            <br />
            <span className="text-gray-800">Built Right</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Everything you need to track, secure, and optimize your assets. 
            <span className="font-semibold text-gray-800"> No bloat. Just what matters.</span>
          </p>
        </section>

        {/* Features Grid */}
        <section className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="group relative bg-white rounded-3xl p-8 border border-gray-200 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className="relative">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative max-w-5xl mx-auto px-6 py-20">
          <div className="bg-gradient-to-br from-blue-600 to-green-600 rounded-3xl p-12 md:p-16 text-white text-center shadow-2xl">
            <div className="max-w-3xl mx-auto">
              <div className="text-6xl mb-6">✨</div>
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Ready to modernize your IT?
              </h2>
              <p className="text-xl md:text-2xl mb-10 opacity-90">
                Join our early access program and get lifetime discounts. 
                Help us build the future of asset management.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a 
                  href="/signup" 
                  className="px-8 py-4 rounded-xl font-bold text-lg bg-white text-blue-600 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
                >
                  Start Free Trial
                </a>
                <a 
                  href="/contact" 
                  className="px-8 py-4 rounded-xl font-bold text-lg bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 transform hover:-translate-y-1 transition-all duration-200"
                >
                  Talk to Founders
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Final Spacer */}
        <div className="h-20" />
      </main>
    </MarketingLayout>
  );
};

export default Features;
