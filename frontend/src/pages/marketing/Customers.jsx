import React from 'react';
import MarketingLayout from '../../components/marketing/MarketingLayout.jsx';
import Seo from '../../components/marketing/Seo.jsx';

export const Customers = () => {
  const foundingBenefits = [
    { 
      icon: '🎯', 
      title: 'Shape the Product',
      description: 'Direct influence on our roadmap',
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      icon: '💰', 
      title: 'Lifetime Discounts',
      description: 'Lock in early pricing forever',
      gradient: 'from-cyan-500 to-teal-500'
    },
    { 
      icon: '🚀', 
      title: 'Priority Support',
      description: 'Direct access to founders',
      gradient: 'from-green-500 to-emerald-500'
    },
    { 
      icon: '🎁', 
      title: 'Early Features',
      description: 'First access to new capabilities',
      gradient: 'from-sky-500 to-blue-500'
    }
  ];

  const idealCustomers = [
    {
      type: 'IT Operations Teams',
      icon: '🖥️',
      gradient: 'from-blue-500 to-cyan-500',
      challenge: 'Tired of spreadsheets and manual asset tracking',
      perfectFor: 'Teams managing 50-5000+ assets who need real-time visibility',
      benefits: ['Automated inventory', 'Maintenance tracking', 'Compliance reports']
    },
    {
      type: 'Managed Service Providers',
      icon: '🏢',
      gradient: 'from-indigo-500 to-blue-500',
      challenge: 'Managing assets for multiple clients securely',
      perfectFor: 'MSPs who need client-isolated data and custom reporting',
      benefits: ['Multi-tenant ready', 'Client dashboards', 'White-label options']
    },
    {
      type: 'Growing Startups',
      icon: '🚀',
      gradient: 'from-green-500 to-emerald-500',
      challenge: 'Scaling fast and need asset tracking yesterday',
      perfectFor: 'Companies who want enterprise features without enterprise complexity',
      benefits: ['Quick setup (<5min)', 'Modern UI', 'Free to start']
    }
  ];

  const foundingOpportunities = [
    {
      title: 'Founding Customer Program',
      icon: '🌟',
      gradient: 'from-blue-500 to-cyan-500',
      description: 'Be one of our first 50 customers',
      perks: [
        'Lifetime 50% discount on all plans',
        'Quarterly check-ins with founders',
        'Feature requests get priority',
        'Your use case shapes our roadmap',
        'Public testimonial opportunities (if you want)'
      ]
    },
    {
      title: 'Design Partner Track',
      icon: '🎨',
      gradient: 'from-teal-500 to-emerald-500',
      description: 'Help us build the perfect solution',
      perks: [
        'Free access during design partnership',
        'Weekly co-design sessions',
        'Custom feature development',
        'Early access to all new features',
        'Become a case study (with your approval)'
      ]
    }
  ];

  return (
    <MarketingLayout>
      <Seo title="Customers — KA by Krubles" description="Teams using our platform to manage assets at scale." />
      
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
            <span className="text-xl">🌟</span>
            <span className="text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Become a founding customer — Limited spots available
            </span>
          </div>
          
          <h1 className="text-6xl font-black mb-6" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 25%, #10b981 75%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Join Us From Day One
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            We're launching soon and looking for our first customers. Get special perks, lifetime discounts, and direct access to the founders.
          </p>
          <a href="/contact" className="inline-block px-8 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            Talk to Founders
          </a>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Founding Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {foundingBenefits.map((benefit, idx) => (
            <div 
              key={idx} 
              className="group relative bg-white rounded-3xl p-8 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative text-center">
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Ideal Customers */}
        <h2 className="text-4xl font-black text-center mb-10" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Who We're Built For
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {idealCustomers.map((customer, idx) => (
            <div 
              key={idx} 
              className="group relative bg-white rounded-3xl p-8 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${customer.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative">
                <div className="text-5xl mb-4">{customer.icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{customer.type}</h3>
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-500 mb-1">THE CHALLENGE:</p>
                  <p className="text-gray-700">{customer.challenge}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-500 mb-1">PERFECT FOR:</p>
                  <p className="text-gray-700">{customer.perfectFor}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">KEY BENEFITS:</p>
                  <ul className="space-y-2">
                    {customer.benefits.map((benefit, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2">
                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Founding Opportunities */}
        <h2 className="text-4xl font-black text-center mb-10" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Founding Customer Tracks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {foundingOpportunities.map((opportunity, idx) => (
            <div 
              key={idx} 
              className="relative overflow-hidden rounded-[32px] p-10 border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 100%)' }}
            >
              {/* Gradient blob */}
              <div 
                className={`absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 bg-gradient-to-br ${opportunity.gradient}`}
                style={{ filter: 'blur(60px)' }}
              />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-5xl">{opportunity.icon}</span>
                  <h3 className="text-3xl font-black text-gray-900">{opportunity.title}</h3>
                </div>
                <p className="text-lg text-gray-700 mb-6">{opportunity.description}</p>
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6">
                  <h4 className="font-bold text-lg mb-4 text-gray-900">What You Get:</h4>
                  <ul className="space-y-3">
                    {opportunity.perks.map((perk, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-3">
                        <span className="text-blue-600 font-bold text-lg mt-0.5">✓</span>
                        <span className="text-gray-800">{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="relative overflow-hidden rounded-[32px] p-16 text-center" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)' }}>
          {/* Gradient blob */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.5), transparent 70%)', filter: 'blur(60px)' }}
          />
          
          <div className="relative">
            <h2 className="text-4xl font-black text-white mb-4">
              🌟 Ready to become a founding customer?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Limited spots available. Lock in lifetime benefits and help shape the future of Krubles.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="/contact" 
                className="inline-block px-8 py-4 rounded-2xl font-bold text-lg bg-white text-blue-600 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                Talk to Founders
              </a>
              <a 
                href="/features" 
                className="inline-block px-8 py-4 rounded-2xl font-bold text-lg bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
              >
                See What We're Building
              </a>
            </div>
          </div>
        </div>
      </main>
    </MarketingLayout>
  );
};

export default Customers;
