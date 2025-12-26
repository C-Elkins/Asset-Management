import React from 'react';
import MarketingLayout from '../../components/marketing/MarketingLayout.jsx';
import Seo from '../../components/marketing/Seo.jsx';

export const Solutions = () => {
  const solutions = [
    {
      icon: '🏢',
      title: 'IT Operations',
      description: 'Streamline asset lifecycle management from procurement to retirement.',
      benefits: [
        'Centralized inventory tracking',
        'Automated compliance reporting',
        'Asset lifecycle insights',
        'Integration with help desk'
      ],
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '🌐',
      title: 'Managed Service Providers',
      description: 'Manage assets across multiple clients with powerful multi-tenant architecture.',
      benefits: [
        'Client-isolated data',
        'Bulk operations at scale',
        'White-label ready',
        'Per-tenant reporting'
      ],
      gradient: 'from-blue-600 to-emerald-500'
    },
    {
      icon: '💼',
      title: 'Finance & Accounting',
      description: 'Track asset depreciation, calculate TCO, and optimize capital expenditure.',
      benefits: [
        'Depreciation tracking',
        'Cost allocation',
        'Budget forecasting',
        'Purchase order integration'
      ],
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: '🏥',
      title: 'Healthcare',
      description: 'HIPAA-ready architecture for managing medical devices and IT equipment with audit trails and security.',
      benefits: [
        'Audit-ready logs',
        'Device certification tracking',
        'Maintenance schedules',
        'Compliance reporting'
      ],
      gradient: 'from-blue-500 to-green-500'
    },
    {
      icon: '🏦',
      title: 'Financial Services',
      description: 'Meet regulatory requirements with enterprise-grade security and audit capabilities.',
      benefits: [
        'SOC 2 audit in progress',
        'Immutable audit trails',
        'Data encryption',
        'Access controls'
      ],
      gradient: 'from-indigo-500 to-blue-500'
    },
    {
      icon: '🎓',
      title: 'Education',
      description: 'Track classroom technology, student devices, and campus infrastructure.',
      benefits: [
        'Student device tracking',
        'Lab equipment management',
        'Maintenance scheduling',
        'Budget optimization'
      ],
      gradient: 'from-yellow-500 to-amber-500'
    }
  ];

  return (
    <MarketingLayout>
      <Seo title="Solutions — KA by Krubles for Every Industry" description="Tailored asset management for IT Operations, MSPs, Finance, Healthcare, Financial Services, and Education." />
      
      <main className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #fafbfc 0%, #f0f4f8 100%)' }}>
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-green-400/30 to-emerald-400/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-full px-4 py-2 mb-8 shadow-sm">
            <span className="text-2xl">🎯</span>
            <span className="text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #10b981 0%, #2563eb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Flexible for any industry
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            <span style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 25%, #10b981 75%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Solutions for
            </span>
            <br />
            <span className="text-gray-800">Every Industry</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Whether you're in IT, healthcare, finance, or education—
            <span className="font-semibold text-gray-800"> we've got you covered.</span>
          </p>
        </section>

        {/* Solutions Grid */}
        <section className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((solution, idx) => (
              <div 
                key={idx}
                className="group relative bg-white rounded-3xl p-8 border border-gray-200 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${solution.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className="relative">
                  <div className="text-5xl mb-4">{solution.icon}</div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">{solution.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {solution.description}
                  </p>
                  <ul className="space-y-3">
                    {solution.benefits.map((benefit, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-3">
                        <span className="text-green-600 font-bold text-lg mt-0.5">✓</span>
                        <span className="text-gray-700 text-sm font-medium">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative max-w-5xl mx-auto px-6 py-20">
          <div className="bg-gradient-to-br from-green-600 to-blue-600 rounded-3xl p-12 md:p-16 text-white text-center shadow-2xl">
            <div className="max-w-3xl mx-auto">
              <div className="text-6xl mb-6">🚀</div>
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Find your perfect fit
              </h2>
              <p className="text-xl md:text-2xl mb-10 opacity-90">
                Let's explore how Krubles can solve your industry's unique challenges. 
                Talk to our founders directly.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="px-8 py-4 rounded-xl font-bold text-lg bg-white text-green-600 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
                >
                  Talk to Founders
                </a>
                <a 
                  href="/features" 
                  className="px-8 py-4 rounded-xl font-bold text-lg bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 transform hover:-translate-y-1 transition-all duration-200"
                >
                  Explore Features
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

export default Solutions;
