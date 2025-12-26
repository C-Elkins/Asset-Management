import MarketingLayout from '../../components/marketing/MarketingLayout.jsx';
import Seo from '../../components/marketing/Seo.jsx';
import HeroArt from '../../components/marketing/HeroArt.jsx';
import useScrollAnimation from '../../hooks/useScrollAnimation.ts';

export const MarketingHome = () => {
  const whySection = useScrollAnimation({ threshold: 0.2 });
  const valueSection = useScrollAnimation({ threshold: 0.2 });
  const featuresSection = useScrollAnimation({ threshold: 0.2 });
  const ctaSection = useScrollAnimation({ threshold: 0.2 });
  const valueProps = [
    { number: '100%', label: 'Modern Stack', icon: '⚡' },
    { number: 'Free', label: 'To Start', icon: '🎁' },
    { number: '< 5min', label: 'Setup Time', icon: '⏱️' },
    { number: 'Open', label: 'Source Core', icon: '🌟' }
  ];

  const features = [
    { icon: '🚀', title: 'Lightning Fast', desc: 'Built on modern tech. Track thousands of assets with real-time updates.', gradient: 'from-blue-500 to-cyan-500' },
    { icon: '🔒', title: 'Enterprise Security', desc: 'Bank-level encryption, SSO, MFA, and complete audit trails built-in.', gradient: 'from-blue-600 to-emerald-500' },
    { icon: '🎯', title: 'Smart Automation', desc: 'Automated maintenance reminders, alerts, and workflows that save hours.', gradient: 'from-green-500 to-emerald-500' },
    { icon: '📱', title: 'Works Everywhere', desc: 'Beautiful on desktop, tablet, and mobile. Manage assets on the go.', gradient: 'from-blue-500 to-green-500' },
    { icon: '🔗', title: 'Powerful API', desc: 'Integrate with your stack. REST API, webhooks, and extensible architecture.', gradient: 'from-indigo-500 to-blue-500' },
    { icon: '📈', title: 'Actionable Insights', desc: 'Beautiful dashboards and reports that help you make better decisions.', gradient: 'from-emerald-500 to-teal-500' }
  ];

  const whyChooseUs = [
    '🌱 Built by operators who felt the pain of clunky asset tools',
    '💡 Fresh approach with no legacy baggage or technical debt',
    '🤝 Direct access to founders — your feedback shapes the product',
    '🎯 Focused on solving real problems, not feature bloat'
  ];

  return (
    <MarketingLayout>
      <Seo title="Krubles — KA by Krubles: Modern Asset Management" description="A fresh approach to asset management. Built by operators who understand your pain. Track hardware and software with powerful automation and enterprise security." />
      <main className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #fafbfc 0%, #f0f4f8 100%)' }}>
        {/* Hero Section with Enhanced Banner Background */}
        <section className="relative overflow-hidden">
          {/* Background Banner Image - Desktop only */}
          <div className="absolute inset-0 hidden md:block pointer-events-none" aria-hidden="true">
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/85"></div>
            <img 
              src="/brand/krubles-banner-hero.svg" 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover"
              style={{ 
                opacity: 0.28,
                filter: 'blur(3px)',
                transform: 'scale(1.05)'
              }}
            />
          </div>

          {/* Animated gradient blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-emerald-400/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-green-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

          {/* Hero Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-12 sm:pb-16 text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-full px-3 sm:px-4 py-2 mb-6 sm:mb-8 shadow-sm backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs sm:text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Launching soon — Join our early access program</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black mb-4 sm:mb-6 leading-tight">
              <span style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 25%, #10b981 75%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Asset Management</span><br />
              <span className="text-gray-800">That Just Works</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed">
              Finally, a modern platform built for teams who are tired of clunky, outdated asset tracking. 
              <span className="font-semibold text-gray-800"> Simple, powerful, and ready for you.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
              <a href="/signup" className="group px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200">
                Start Free Trial
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </a>
              <a href="/contact" className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg bg-white text-gray-800 border-2 border-gray-300 shadow-lg hover:shadow-xl hover:border-gray-400 transform hover:-translate-y-1 transition-all duration-200">
                Talk to Founders
              </a>
            </div>

            {/* Mobile Hero Art */}
            <div className="block md:hidden mt-12 px-4">
              <HeroArt />
            </div>
          </div>
        </section>
        <section ref={whySection.ref} className={`relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 transition-all duration-700 ${whySection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black mb-4 text-gray-900">Why Choose <span style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Asset Management by Krubles</span>?</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">We're a startup on a mission to fix what's broken in asset management</p>
          </div>
          <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-12 border border-gray-200 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {whyChooseUs.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex-1 text-base sm:text-lg text-gray-700 leading-relaxed">{reason}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section ref={valueSection.ref} className={`relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 transition-all duration-700 ${valueSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {valueProps.map((stat, idx) => (
              <div 
                key={idx} 
                className="relative group bg-white rounded-2xl p-6 sm:p-8 text-center border border-gray-200 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
                style={{
                  opacity: valueSection.isVisible ? 1 : 0,
                  transform: valueSection.isVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: `all 0.5s ease ${idx * 0.1}s`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{stat.icon}</div>
                  <div className="text-3xl sm:text-4xl font-black mb-1 sm:mb-2" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{stat.number}</div>
                  <div className="text-xs sm:text-sm font-semibold text-gray-600">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section ref={featuresSection.ref} className={`relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 transition-all duration-700 ${featuresSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-4 text-gray-900">Everything you need.<br /><span style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Nothing you don't.</span></h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">Powerful features that make asset management effortless</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="group relative bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
                style={{
                  opacity: featuresSection.isVisible ? 1 : 0,
                  transform: featuresSection.isVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: `all 0.6s ease ${idx * 0.1}s`
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className="relative">
                  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{feature.icon}</div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-base text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a href="/features" className="inline-flex items-center gap-2 text-base sm:text-lg font-bold text-blue-600 hover:text-blue-700 transition-colors">Explore all features<span className="inline-block transform group-hover:translate-x-1 transition-transform">→</span></a>
          </div>
        </section>
        <section ref={ctaSection.ref} className={`relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 transition-all duration-700 ${ctaSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-gradient-to-br from-blue-600 to-green-600 rounded-3xl p-8 sm:p-12 md:p-16 text-white text-center shadow-2xl">
            <div className="max-w-3xl mx-auto">
              <div className="text-5xl sm:text-6xl mb-6">🚀</div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6">Be among our first customers</h2>
              <p className="text-lg sm:text-xl md:text-2xl mb-10 opacity-90">We're looking for early adopters who want to help shape the future of asset management. Get lifetime discounts and direct input on our roadmap.</p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
                <a href="/signup" className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg bg-white text-blue-600 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200">Start Free Trial</a>
                <a href="/contact" className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 transform hover:-translate-y-1 transition-all duration-200">Talk to Us</a>
              </div>
            </div>
          </div>
        </section>
        <div className="h-16 sm:h-20" />
      </main>
    </MarketingLayout>
  );
};

export default MarketingHome;
