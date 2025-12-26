import React from 'react';
import MarketingLayout from '../../components/marketing/MarketingLayout.jsx';
import Seo from '../../components/marketing/Seo.jsx';

export const About = () => {
  const values = [
    {
      icon: '🔒',
      title: 'Security First',
      description: 'We design every feature with security at the core, not as an afterthought.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '🤝',
      title: 'Customer Empathy',
      description: 'We listen to IT teams and operators to build tools that solve real problems.',
      gradient: 'from-blue-600 to-emerald-500'
    },
    {
      icon: '🔓',
      title: 'Open & Extensible',
      description: 'API-first architecture means you can integrate, customize, and extend freely.',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: '⚡',
      title: 'Fast Innovation',
      description: 'We ship features weekly and respond quickly to customer feedback.',
      gradient: 'from-blue-500 to-green-500'
    }
  ];

  const timeline = [
    { 
      year: '2024', 
      event: 'Krubles was born from frustration with outdated asset management tools',
      icon: '💡',
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      year: '2025', 
      event: 'Building in the open and preparing to launch our early access program',
      icon: '🚀',
      gradient: 'from-blue-600 to-emerald-500'
    },
    { 
      year: 'Next', 
      event: 'You help us shape the future of asset management as a founding customer',
      icon: '🌟',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <MarketingLayout>
      <Seo title="About — KA by Krubles" description="Our mission is to deliver a secure, modern asset management experience." />
      
      <main className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #fafbfc 0%, #f0f4f8 100%)' }}>
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-emerald-400/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-green-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-full px-4 py-2 mb-8 shadow-sm">
            <span className="text-2xl">🚀</span>
            <span className="text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              A startup on a mission — Built by IT operators
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            <span style={{ background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 25%, #10b981 75%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              About Krubles
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            We're on a mission to make asset management simple, secure, and delightful for IT teams everywhere.
          </p>
        </section>

        {/* Content Sections */}
        <div className="relative max-w-6xl mx-auto px-6 py-12">
          {/* Mission */}
          <div className="relative overflow-hidden rounded-[32px] p-12 border border-blue-100 mb-16 bg-gradient-to-br from-blue-50 to-emerald-50">
            {/* Gradient blob */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-3xl" />
            
            <div className="relative">
              <h2 className="text-4xl font-black text-center mb-6" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Our Mission</h2>
              <p className="text-xl text-gray-700 text-center max-w-3xl mx-auto leading-relaxed">
                To deliver a modern, secure, and delightful asset management experience that empowers IT teams to focus on what matters most—supporting their organizations.
              </p>
            </div>
          </div>

          {/* Values */}
          <h2 className="text-4xl font-black text-center mb-12" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {values.map((value, idx) => (
              <div 
                key={idx} 
                className="group relative bg-white rounded-3xl p-10 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="relative">
                  <div className="text-6xl mb-6">{value.icon}</div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="relative overflow-hidden rounded-[32px] p-12 border border-blue-100 mb-16 bg-gradient-to-br from-blue-50 to-green-100">
            {/* Gradient blob */}
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-3xl" />
            
            <div className="relative">
              <h2 className="text-4xl font-black text-center mb-12" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Our Journey</h2>
              <div className="max-w-3xl mx-auto space-y-6">
                {timeline.map((item, idx) => (
                  <div key={idx} className="flex gap-6 items-start">
                    <div 
                      className={`bg-gradient-to-r ${item.gradient} text-white rounded-2xl w-20 h-20 flex flex-col items-center justify-center font-bold flex-shrink-0 shadow-xl`}
                    >
                      <span className="text-3xl mb-1">{item.icon}</span>
                      <span className="text-xs">{item.year}</span>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 flex-1 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <p className="text-gray-800 text-lg leading-relaxed">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-6" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Built by Operators, for Operators</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Our team brings decades of experience in IT operations, security, and enterprise software. We've felt the pain of managing assets at scale, and we're committed to building something better.
            </p>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto font-semibold">
              We're a small, focused team obsessed with solving this problem the right way.
            </p>
          </div>

          {/* CTA */}
          <div className="relative overflow-hidden rounded-[32px] p-16 text-center bg-gradient-to-br from-blue-600 to-emerald-600">
            {/* Gradient blob */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-3xl" />
            
            <div className="relative">
              <h2 className="text-4xl font-black text-white mb-4">
                🤝 Join Us on This Journey
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Whether you're a customer, partner, or just curious about what we're building—we'd love to hear from you.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a 
                  href="/contact" 
                  className="inline-block px-8 py-4 rounded-2xl font-bold text-lg bg-white text-blue-600 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  Get in Touch
                </a>
                <a 
                  href="/signup" 
                  className="inline-block px-8 py-4 rounded-2xl font-bold text-lg bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
                >
                  Try Krubles Free
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </MarketingLayout>
  );
};

export default About;
