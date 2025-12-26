import React from 'react';
import MarketingLayout from '../../components/marketing/MarketingLayout.jsx';
import Seo from '../../components/marketing/Seo.jsx';

export const Contact = () => {
  const contactMethods = [
    { 
      icon: '📧', 
      title: 'Email Us', 
      value: 'support@krubles.com', 
      description: 'For general inquiries',
      link: 'mailto:support@krubles.com',
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      icon: '👥', 
      title: 'Talk to Founders', 
      value: 'Direct access', 
      description: 'We personally respond to every message',
      link: 'mailto:support@krubles.com?subject=Founder%20Discussion',
      gradient: 'from-blue-600 to-emerald-500'
    },
    { 
      icon: '🚀', 
      title: 'Join Early Access', 
      value: 'Founding customers', 
      description: 'Be among our first users',
      link: '/customers',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <MarketingLayout>
      <Seo title="Contact — KA by Krubles" description="Get in touch with our team for demos, pricing, and support." />
      
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
            <span className="text-xl">💬</span>
            <span className="text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Talk directly to our founders — We respond personally
            </span>
          </div>
          
          <h1 className="text-6xl font-black mb-6" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions? Want to discuss your needs? We're here to help and excited to hear from you.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Email Contact Card */}
          <div id="contact-form" className="relative overflow-hidden rounded-[32px] p-10 border-2 border-gray-200 shadow-2xl" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)' }}>
            {/* Gradient blob */}
            <div 
              className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.5), transparent 70%)', filter: 'blur(60px)' }}
            />
            
            <div className="relative text-center">
              <div className="text-6xl mb-6">📧</div>
              <h2 className="text-3xl font-black mb-4" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Send us an email</h2>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Click the button below to open your email client and send us a message. We'll get back to you within 24 hours!
              </p>
              
              <a 
                href="mailto:support@krubles.com?subject=Contact%20from%20Krubles%20Website&body=Hi%20Krubles%20team,%0D%0A%0D%0A[Your%20message%20here]%0D%0A%0D%0ABest%20regards"
                className="inline-block px-8 py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                📧 Email support@krubles.com
              </a>
              
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-4">Or copy the email address:</p>
                <div className="bg-white rounded-xl px-6 py-4 border border-gray-300 inline-block">
                  <code className="text-blue-600 font-semibold text-lg">support@krubles.com</code>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Methods & Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-black mb-6" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Other ways to connect</h2>
              <div className="space-y-4">
                {contactMethods.map((method, idx) => (
                  <a 
                    key={idx}
                    href={method.link}
                    className="group relative block bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                  >
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${method.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                    
                    <div className="relative flex items-center gap-4">
                      <div className="text-5xl">{method.icon}</div>
                      <div className="flex-1">
                        <div className="font-bold text-lg text-gray-900">{method.title}</div>
                        <div className="text-blue-600 font-semibold">{method.value}</div>
                        <div className="text-sm text-gray-600 mt-1">{method.description}</div>
                      </div>
                      <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
                        →
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Why Contact Us */}
            <div className="relative overflow-hidden rounded-2xl p-8 border border-blue-100" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #d1fae5 100%)' }}>
              {/* Gradient blob */}
              <div 
                className="absolute bottom-0 right-0 w-48 h-48 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, rgba(147,51,234,0.5), transparent 70%)', filter: 'blur(60px)' }}
              />
              
              <div className="relative">
                <h3 className="text-xl font-black mb-4" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Why reach out?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-lg mt-0.5">✓</span>
                    <span className="text-gray-700">Learn about <strong>early access pricing</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-lg mt-0.5">✓</span>
                    <span className="text-gray-700">Discuss your <strong>specific use case</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-lg mt-0.5">✓</span>
                    <span className="text-gray-700">Get <strong>founding customer benefits</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold text-lg mt-0.5">✓</span>
                    <span className="text-gray-700">Help <strong>shape our roadmap</strong></span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
              <h3 className="text-xl font-bold mb-3 text-gray-900">⚡ Fast Response</h3>
              <p className="text-gray-600 leading-relaxed">
                We typically respond within <strong className="text-gray-900">24 hours</strong> during business days. As a startup, we move fast and value every conversation.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-4xl font-black text-center mb-12" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Before you reach out...</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-white rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">Check Features</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">See what Krubles can do for your team</p>
              <a href="/features" className="inline-block px-6 py-3 rounded-xl font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                View Features →
              </a>
            </div>
            <div className="group bg-white rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center">
              <div className="text-5xl mb-4">💳</div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">See Pricing</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">Compare plans and early access benefits</p>
              <a href="/pricing" className="inline-block px-6 py-3 rounded-xl font-semibold bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                View Pricing →
              </a>
            </div>
            <div className="group bg-white rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">Try It Free</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">Start with our free forever plan</p>
              <a href="/signup" className="inline-block px-6 py-3 rounded-xl font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                Sign Up →
              </a>
            </div>
          </div>
        </div>
      </main>
    </MarketingLayout>
  );
};

export default Contact;
