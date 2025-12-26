import React from 'react';
import MarketingLayout from '../../components/marketing/MarketingLayout.jsx';
import Seo from '../../components/marketing/Seo.jsx';

export const Pricing = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$0',
      period: 'forever',
      description: 'Perfect for small teams getting started',
      gradient: 'from-green-500 to-emerald-500',
      features: [
        'Up to 20 assets',
        'Self-hosted deployment',
        'Community support',
        'CSV import/export',
        'Basic reporting',
        'Mobile-responsive UI'
      ],
      cta: 'Start Free',
      ctaLink: '/signup',
      popular: false
    },
    {
      name: 'Team',
      price: '$19',
      period: 'per user/month',
      description: 'Perfect for growing teams and startups',
      gradient: 'from-blue-500 to-cyan-500',
      features: [
        'Up to 100 assets',
        'Everything in Starter',
        'Multi-user collaboration',
        'Email notifications',
        'Mobile app access',
        'Priority email support',
        'Role-based access control'
      ],
      cta: 'Start Trial',
      ctaLink: '/signup',
      popular: true
    },
    {
      name: 'Pro',
      price: '$49',
      period: 'per user/month',
      description: 'For teams with advanced automation needs',
      gradient: 'from-purple-500 to-pink-500',
      features: [
        'Up to 500 assets',
        'Everything in Team',
        'SSO & MFA',
        'Advanced reporting',
        'Maintenance scheduling',
        'API access',
        'Audit logs',
        'Custom fields',
        'Slack/Teams integration'
      ],
      cta: 'Start Trial',
      ctaLink: '/signup',
      popular: false
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact sales',
      description: 'For large organizations with complex requirements',
      gradient: 'from-blue-600 to-emerald-500',
      features: [
        'Everything in Pro',
        'Unlimited assets',
        'SAML/OIDC SSO',
        'On-premise deployment',
        'Custom SLAs',
        'Dedicated support',
        'Training & onboarding',
        'Custom integrations',
        'Advanced security',
        'SOC 2 audit support'
      ],
      cta: 'Contact Sales',
      ctaLink: '/contact',
      popular: false
    }
  ];

  return (
    <MarketingLayout>
      <Seo title="Pricing — KA by Krubles" description="Simple, transparent pricing for teams of any size." />
      
      {/* Hero Section */}
      <div style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* Animated gradient blobs */}
        <div 
          className="absolute top-20 right-20 w-96 h-96 rounded-full opacity-30 animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.4), transparent 70%)', filter: 'blur(60px)' }}
        />
        <div 
          className="absolute bottom-20 left-20 w-96 h-96 rounded-full opacity-30 animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.4), transparent 70%)', filter: 'blur(60px)', animationDelay: '1s' }}
        />
        
        <div className="max-w-6xl mx-auto px-6 py-20 text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-blue-200 shadow-sm mb-6">
            <span className="text-xl">💰</span>
            <span className="text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Early access pricing — Lock in lifetime discounts
            </span>
          </div>
          
          <h1 className="text-6xl font-black mb-6" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Plans that scale with your team—from startups to enterprise. No hidden fees.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
          {plans.map((plan, idx) => (
            <div 
              key={idx}
              className={`group relative rounded-[32px] p-6 border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col ${
                plan.popular 
                  ? 'border-blue-400 shadow-2xl z-10' 
                  : 'border-gray-200 shadow-lg bg-white'
              }`}
              style={plan.popular ? { background: 'linear-gradient(180deg, #dbeafe, #fff)' } : {}}
            >
              {/* Gradient overlay on hover */}
              {!plan.popular && (
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              )}
              
              {plan.popular && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-xl">
                    ⭐ Most Popular
                  </span>
                </div>
              )}
              
              <div className="relative flex flex-col flex-grow">
                <div className="text-center mb-6">
                  <h3 
                    className="text-2xl font-black mb-3"
                    style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                  >
                    <span className={`bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                      {plan.name}
                    </span>
                  </h3>
                  <div className="mb-2">
                    <span className="text-5xl font-black text-gray-900">{plan.price}</span>
                  </div>
                  <p className="text-xs text-gray-600 font-semibold mb-3">{plan.period}</p>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-6 flex-grow">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <span className="text-green-600 font-bold text-base mt-0.5 flex-shrink-0">✓</span>
                      <span className="text-gray-800 text-sm leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a 
                  href={plan.ctaLink}
                  className={`block text-center py-3 px-6 rounded-xl font-bold text-base transition-all duration-300 mt-auto ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1'
                      : 'bg-white border-2 border-gray-300 text-gray-900 hover:border-gray-400 hover:shadow-lg hover:-translate-y-1'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ / Additional Info */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-12" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="group bg-white rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="font-bold text-xl mb-3 text-gray-900">Can I switch plans later?</h3>
              <p className="text-gray-600 leading-relaxed">
                Yes! You can upgrade or downgrade at any time. Changes take effect immediately, and we'll prorate your billing.
              </p>
            </div>
            <div className="group bg-white rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="font-bold text-xl mb-3 text-gray-900">Is there a free trial for Pro?</h3>
              <p className="text-gray-600 leading-relaxed">
                Absolutely. Try Pro free for 14 days with no credit card required. Cancel anytime.
              </p>
            </div>
            <div className="group bg-white rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <h3 className="font-bold text-xl mb-3 text-gray-900">What payment methods do you accept?</h3>
              <p className="text-gray-600 leading-relaxed">
                We accept all major credit cards, PayPal, and can invoice Enterprise customers annually.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 relative overflow-hidden rounded-[32px] p-16 text-center" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)' }}>
          {/* Gradient blob */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.5), transparent 70%)', filter: 'blur(60px)' }}
          />
          
          <div className="relative">
            <h2 className="text-4xl font-black text-white mb-4">
              🚀 Questions about pricing?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Talk directly to our founders. We're happy to discuss custom plans, volume discounts, and special early-access pricing.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="/contact" 
                className="inline-block px-8 py-4 rounded-2xl font-bold text-lg bg-white text-blue-600 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                Talk to Founders
              </a>
              <a 
                href="/signup" 
                className="inline-block px-8 py-4 rounded-2xl font-bold text-lg bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
              >
                Start Free
              </a>
            </div>
          </div>
        </div>
      </main>
    </MarketingLayout>
  );
};

export default Pricing;
