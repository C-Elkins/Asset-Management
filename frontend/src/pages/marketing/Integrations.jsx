import React from 'react';
import MarketingLayout from '../../components/marketing/MarketingLayout.jsx';
import Seo from '../../components/marketing/Seo.jsx';

export const Integrations = () => {
  const categories = [
    {
      icon: '🔐',
      title: 'Authentication & Security',
      description: 'Enterprise-grade authentication and access control',
      gradient: 'from-blue-500 to-indigo-600',
      integrations: [
        { name: 'Google OAuth 2.0', description: 'Single sign-on with Google Workspace', status: 'available' },
        { name: 'Microsoft OAuth / Azure AD', description: 'Enterprise SSO with Microsoft 365', status: 'available' },
        { name: 'JWT Authentication', description: 'Secure token-based auth', status: 'available' },
        { name: 'Multi-Factor Authentication (MFA)', description: 'Time-based one-time passwords', status: 'available' },
        { name: 'API Keys & Rate Limiting', description: 'Secure API access with usage controls', status: 'available' }
      ]
    },
    {
      icon: '📊',
      title: 'Data Import & Export',
      description: 'Flexible data migration and reporting',
      gradient: 'from-emerald-500 to-teal-600',
      integrations: [
        { name: 'CSV Import', description: 'Bulk asset import via CSV', status: 'available' },
        { name: 'CSV Export with Filters', description: 'Export with advanced filtering and column selection', status: 'available' },
        { name: 'Excel Import', description: 'Direct import from .xlsx files', status: 'available' },
        { name: 'Excel Export', description: 'Export assets to Excel format', status: 'available' }
      ]
    },
    {
      icon: '🔔',
      title: 'Notifications & Alerts',
      description: 'Stay informed about critical events',
      gradient: 'from-yellow-500 to-amber-600',
      integrations: [
        { name: 'Email Notifications', description: 'Asset alerts and reports via email', status: 'available' },
        { name: 'Slack Integration', description: 'Real-time notifications in Slack', status: 'available' },
        { name: 'Webhook Support', description: 'Push events to external systems', status: 'available' },
        { name: 'Microsoft Teams', description: 'Native Teams notifications with adaptive cards', status: 'available' }
      ]
    },
    {
      icon: '🤖',
      title: 'AI & Automation',
      description: 'Intelligent features and automated workflows',
      gradient: 'from-violet-500 to-purple-600',
      integrations: [
        { name: 'AI Assistant', description: 'Intelligent asset categorization and insights', status: 'available' },
        { name: 'Scheduled Reports', description: 'Automated weekly/monthly reports via email', status: 'available' },
        { name: 'Rate-Limited AI', description: 'Per-user rate limiting with token bucket algorithm', status: 'available' }
      ]
    },
    {
      icon: '🔌',
      title: 'REST API',
      description: 'Full programmatic access to all features',
      gradient: 'from-purple-500 to-pink-600',
      integrations: [
        { name: 'RESTful API', description: 'Complete API for all operations', status: 'available' },
        { name: 'OpenAPI Documentation', description: 'Interactive API docs with Swagger', status: 'available' }
      ]
    },
    {
      icon: '🏢',
      title: 'Identity Providers',
      description: 'Connect your enterprise identity systems',
      gradient: 'from-cyan-500 to-blue-600',
      integrations: [
        { name: 'SAML 2.0', description: 'Enterprise SSO via SAML', status: 'coming-soon' },
        { name: 'LDAP / Active Directory', description: 'Integrate with on-premise AD', status: 'coming-soon' },
        { name: 'Okta', description: 'Native Okta integration', status: 'coming-soon' }
      ]
    },
    {
      icon: '🔧',
      title: 'ITSM & Service Desk',
      description: 'Connect with your help desk and CMDB',
      gradient: 'from-red-500 to-orange-600',
      integrations: [
        { name: 'Jira Integration', description: 'Sync assets with Jira Service Management', status: 'planned' },
        { name: 'ServiceNow', description: 'Two-way sync with ServiceNow CMDB', status: 'planned' },
        { name: 'Freshservice', description: 'Asset sync with Freshservice', status: 'planned' }
      ]
    }
  ];

  const timeline = [
    {
      quarter: 'Q1 2025',
      status: 'current',
      features: [
        'Google OAuth 2.0 ✓',
        'Microsoft OAuth / Azure AD ✓',
        'Scheduled Reports ✓',
        'Microsoft Teams Notifications ✓',
        'AI Assistant ✓',
        'Webhooks ✓'
      ]
    },
    {
      quarter: 'Q2 2025',
      status: 'next',
      features: [
        'SAML 2.0 Integration',
        'Okta Native Support',
        'Jira Service Management',
        'Advanced GraphQL API'
      ]
    },
    {
      quarter: 'Q3 2025',
      status: 'future',
      features: [
        'ServiceNow CMDB Sync',
        'LDAP/Active Directory',
        'Freshservice Integration',
        'Custom Webhooks Builder'
      ]
    }
  ];

  const getStatusBadge = (status) => {
    const styles = {
      available: 'bg-green-100 text-green-800 border-green-200',
      'coming-soon': 'bg-blue-100 text-blue-800 border-blue-200',
      planned: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    const labels = {
      available: 'Available Now',
      'coming-soon': 'Coming Soon',
      planned: 'Planned'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <MarketingLayout>
      <Seo 
        title="Integrations — KA by Krubles" 
        description="16 live integrations including Google OAuth, Microsoft OAuth, JWT, MFA, AI Assistant, Scheduled Reports, Slack, Microsoft Teams, Webhooks, CSV/Excel import/export, and more. Connect with the tools you already use." 
      />
      
      <main className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #fafbfc 0%, #f0f4f8 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-emerald-400/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-emerald-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-full px-4 py-2 mb-8 shadow-sm">
            <span className="text-2xl">🔗</span>
            <span className="text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              16 Integrations Live Today
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            <span style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Integrations
            </span>
            <br />
            <span className="text-gray-800">That Just Work</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Connect with the tools your team already uses. 
            <span className="font-semibold text-gray-800"> Google, Microsoft, Slack, and more.</span>
          </p>
        </section>

        <section className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {categories.map((category, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1"
              >
                <div className={`bg-gradient-to-br ${category.gradient} p-6 text-white`}>
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{category.title}</h3>
                  <p className="text-white/90 text-sm">{category.description}</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {category.integrations.map((integration, iIdx) => (
                      <div key={iIdx} className="border-l-4 border-gray-200 pl-4 hover:border-blue-500 transition-colors">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-semibold text-gray-900">{integration.name}</h4>
                          {getStatusBadge(integration.status)}
                        </div>
                        <p className="text-sm text-gray-600">{integration.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative max-w-5xl mx-auto px-6 py-16">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-10 border border-green-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">✅</span>
              <h2 className="text-3xl font-black text-gray-900">Available Now</h2>
            </div>
            <p className="text-lg text-gray-700 mb-6">
              These integrations are production-ready and can be configured today:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm border border-green-100">
                <span className="text-2xl">🔐</span>
                <div>
                  <div className="font-semibold text-gray-900">Google OAuth 2.0</div>
                  <div className="text-sm text-gray-600">Google Workspace SSO</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm border border-green-100">
                <span className="text-2xl">🔐</span>
                <div>
                  <div className="font-semibold text-gray-900">Microsoft OAuth</div>
                  <div className="text-sm text-gray-600">Azure AD / Microsoft 365</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm border border-green-100">
                <span className="text-2xl">🔑</span>
                <div>
                  <div className="font-semibold text-gray-900">JWT Authentication</div>
                  <div className="text-sm text-gray-600">Token-based auth</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm border border-green-100">
                <span className="text-2xl">🔐</span>
                <div>
                  <div className="font-semibold text-gray-900">Multi-Factor Auth (MFA)</div>
                  <div className="text-sm text-gray-600">TOTP-based 2FA</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm border border-green-100">
                <span className="text-2xl">📊</span>
                <div>
                  <div className="font-semibold text-gray-900">CSV / Excel Import</div>
                  <div className="text-sm text-gray-600">Bulk asset operations</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm border border-green-100">
                <span className="text-2xl">📧</span>
                <div>
                  <div className="font-semibold text-gray-900">Email Notifications</div>
                  <div className="text-sm text-gray-600">Asset alerts via email</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm border border-green-100">
                <span className="text-2xl">💬</span>
                <div>
                  <div className="font-semibold text-gray-900">Slack Integration</div>
                  <div className="text-sm text-gray-600">Real-time Slack alerts</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm border border-green-100">
                <span className="text-2xl">🔌</span>
                <div>
                  <div className="font-semibold text-gray-900">Webhooks</div>
                  <div className="text-sm text-gray-600">Event-driven integrations</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm border border-green-100">
                <span className="text-2xl">🔑</span>
                <div>
                  <div className="font-semibold text-gray-900">API Keys</div>
                  <div className="text-sm text-gray-600">Secure programmatic access</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm border border-green-100">
                <span className="text-2xl">🔌</span>
                <div>
                  <div className="font-semibold text-gray-900">REST API</div>
                  <div className="text-sm text-gray-600">Full API access</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm border border-green-100">
                <span className="text-2xl">📤</span>
                <div>
                  <div className="font-semibold text-gray-900">Filtered Exports</div>
                  <div className="text-sm text-gray-600">Advanced export options</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm border border-green-100">
                <span className="text-2xl">💼</span>
                <div>
                  <div className="font-semibold text-gray-900">Microsoft Teams</div>
                  <div className="text-sm text-gray-600">Teams adaptive card notifications</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm border border-green-100">
                <span className="text-2xl">📅</span>
                <div>
                  <div className="font-semibold text-gray-900">Scheduled Reports</div>
                  <div className="text-sm text-gray-600">Automated weekly/monthly reports</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm border border-green-100">
                <span className="text-2xl">🤖</span>
                <div>
                  <div className="font-semibold text-gray-900">AI Assistant</div>
                  <div className="text-sm text-gray-600">Smart categorization & insights</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative max-w-5xl mx-auto px-6 py-16">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-10 border border-blue-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🚀</span>
              <h2 className="text-3xl font-black text-gray-900">Coming Soon</h2>
            </div>
            <p className="text-lg text-gray-700 mb-6">
              Currently in development and coming in the next few releases:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                <span className="text-2xl">🔐</span>
                <div>
                  <div className="font-semibold text-gray-900">SAML 2.0</div>
                  <div className="text-sm text-gray-600">Enterprise SSO standard</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                <span className="text-2xl">🏢</span>
                <div>
                  <div className="font-semibold text-gray-900">Okta Integration</div>
                  <div className="text-sm text-gray-600">Native Okta support</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                <span className="text-2xl">📁</span>
                <div>
                  <div className="font-semibold text-gray-900">LDAP / Active Directory</div>
                  <div className="text-sm text-gray-600">On-premise directory sync</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                <span className="text-2xl">🔧</span>
                <div>
                  <div className="font-semibold text-gray-900">Jira Service Management</div>
                  <div className="text-sm text-gray-600">Asset sync with Jira</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                <span className="text-2xl">🔧</span>
                <div>
                  <div className="font-semibold text-gray-900">ServiceNow CMDB</div>
                  <div className="text-sm text-gray-600">Two-way ServiceNow sync</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-4xl font-black text-gray-900 mb-4 text-center">Integration Roadmap</h2>
          <p className="text-lg text-gray-600 text-center mb-12">Our planned integration timeline for 2025</p>
          
          <div className="space-y-6">
            {timeline.map((quarter, idx) => {
              const statusColors = {
                current: 'border-blue-500 bg-blue-50',
                next: 'border-emerald-500 bg-emerald-50',
                future: 'border-gray-400 bg-gray-50'
              };
              return (
                <div key={idx} className={`border-l-4 ${statusColors[quarter.status]} rounded-lg p-6 shadow-sm`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">{quarter.quarter}</h3>
                    {quarter.status === 'current' && (
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Current
                      </span>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {quarter.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2 text-gray-700">
                        <span className="text-blue-500">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <section className="relative max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="bg-gradient-to-br from-blue-500 to-emerald-500 rounded-[32px] p-12 text-white shadow-2xl">
            <h2 className="text-4xl font-black mb-4">Need a Custom Integration?</h2>
            <p className="text-xl mb-8 text-white/90">
              Our REST API and webhooks system makes it easy to connect with any external service.
            </p>
            <button className="bg-white text-blue-600 font-bold px-8 py-4 rounded-full hover:scale-105 transition-transform shadow-lg">
              View API Documentation
            </button>
          </div>
        </section>
      </main>
    </MarketingLayout>
  );
};

export default Integrations;
