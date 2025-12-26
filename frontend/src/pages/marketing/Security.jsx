import React from 'react';
import MarketingLayout from '../../components/marketing/MarketingLayout.jsx';
import Seo from '../../components/marketing/Seo.jsx';

export const Security = () => {
  const securityFeatures = [
    {
      icon: '🔐',
      title: 'Enterprise SSO',
      description: 'Seamlessly integrate with Azure AD, Okta, Google Workspace, and other identity providers via OIDC or SAML.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '🛡️',
      title: 'Multi-Factor Authentication',
      description: 'Protect accounts with TOTP-based MFA, SMS verification, and hardware security keys for enhanced security.',
      gradient: 'from-blue-600 to-emerald-500'
    },
    {
      icon: '👥',
      title: 'Role-Based Access Control',
      description: 'Fine-grained permissions let you control who can view, edit, or delete assets. Create custom roles for your organization.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: '🔒',
      title: 'Data Encryption',
      description: 'All data encrypted in transit with TLS 1.3 and at rest with AES-256. Keys managed with industry-standard HSMs.',
      gradient: 'from-blue-500 to-green-500'
    },
    {
      icon: '📋',
      title: 'Complete Audit Logs',
      description: 'Immutable audit trail of every action. Export logs for compliance, SIEM integration, or forensic analysis.',
      gradient: 'from-indigo-500 to-blue-500'
    },
    {
      icon: '🔍',
      title: 'Security Monitoring',
      description: 'Real-time alerts for suspicious activity, failed login attempts, and unauthorized access attempts.',
      gradient: 'from-yellow-500 to-amber-500'
    }
  ];

  const compliance = [
    { badge: 'AES-256 Encryption', status: 'Active', color: '#2563eb' },
    { badge: 'SOC 2 Type II', status: 'In Progress', color: '#10b981' },
    { badge: 'HIPAA Ready', status: 'For Healthcare', color: '#14b8a6' },
    { badge: 'Enterprise SSO', status: 'Available', color: '#4f46e5' }
  ];

  return (
    <MarketingLayout>
      <Seo title="Security — Enterprise-Grade Protection by Krubles" description="Enterprise security with SSO, MFA, RBAC, complete audit logging, AES-256 encryption, and HIPAA-ready architecture for healthcare clients." />
      
      <main className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #fafbfc 0%, #f0f4f8 100%)' }}>
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-emerald-400/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-full px-4 py-2 mb-8 shadow-sm">
            <span className="text-2xl">🛡️</span>
            <span className="text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Built with security in mind from day one
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            <span style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 25%, #10b981 75%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Enterprise-Grade
            </span>
            <br />
            <span className="text-gray-800">Security</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            Enterprise security built to protect your sensitive asset data with encryption, SSO, audit logging, and HIPAA-ready architecture.
            <span className="font-semibold text-gray-800"> Security you can trust.</span>
          </p>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap gap-6 justify-center">
            {compliance.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl px-8 py-4 border-2 border-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="font-black text-xl" style={{ color: item.color }}>
                  {item.badge}
                </div>
                <div className="text-sm font-semibold text-gray-600">{item.status}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Security Features */}
        <section className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {securityFeatures.map((feature, idx) => (
              <div 
                key={idx}
                className="group relative bg-white rounded-3xl p-8 border border-gray-200 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className="relative">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Security Practices */}
          <div className="bg-white rounded-3xl p-12 border-2 border-gray-200 shadow-xl">
            <h2 className="text-4xl font-black text-center mb-10">
              <span style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Our Security Practices
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100 hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-lg mb-2 text-gray-900">HIPAA-Ready Architecture</h3>
                <p className="text-gray-600">Built with healthcare in mind. Encryption at rest and in transit, comprehensive audit logging, and BAA support for healthcare clients.</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-2xl p-6 border border-blue-100 hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-lg mb-2 text-gray-900">SOC 2 Certification Path</h3>
                <p className="text-gray-600">Currently undergoing SOC 2 Type II audit with formal security policies, continuous monitoring, and third-party validation.</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100 hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-lg mb-2 text-gray-900">Infrastructure Security</h3>
                <p className="text-gray-600">Hosted on AWS/Azure with DDoS protection, network isolation, automated patching, and 99.9% uptime SLA.</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100 hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-lg mb-2 text-gray-900">Security Monitoring & Response</h3>
                <p className="text-gray-600">24/7 security monitoring with documented incident response procedures, real-time alerts, and rapid remediation.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative max-w-5xl mx-auto px-6 py-20">
          <div className="bg-gradient-to-br from-blue-600 to-emerald-600 rounded-3xl p-12 md:p-16 text-white text-center shadow-2xl">
            <div className="max-w-3xl mx-auto">
              <div className="text-6xl mb-6">🔐</div>
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Questions about security?
              </h2>
              <p className="text-xl md:text-2xl mb-10 opacity-90">
                We're here to help. Request our security whitepaper, discuss HIPAA requirements, or schedule a security review.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="px-8 py-4 rounded-xl font-bold text-lg bg-white text-blue-600 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
                >
                  Talk to Founders
                </a>
                <a 
                  href="/signup" 
                  className="px-8 py-4 rounded-xl font-bold text-lg bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 transform hover:-translate-y-1 transition-all duration-200"
                >
                  Start Free Trial
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

export default Security;
