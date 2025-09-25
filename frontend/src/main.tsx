import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';

// Your Personal Branded SaaS Platform
const ChaseElkinsBrandedPlatform: React.FC = () => {
  const [selectedIndustry] = React.useState<string>('IT');
  const [showCustomization, setShowCustomization] = React.useState(false);
  
  // Your personal brand colors
  const brandGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  const accentGradient = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
  
  // Industry-specific data (same as before but with your branding)
  const getIndustryData = (industry: string) => {
    const data = {
      IT: {
        title: 'IT Asset Intelligence',
        assets: [
          { name: 'Laptops', count: 245, icon: '💻', trend: '+5%' },
          { name: 'Servers', count: 18, icon: '🖥️', trend: '+2%' },
          { name: 'Network Equipment', count: 67, icon: '🌐', trend: '0%' },
          { name: 'Mobile Devices', count: 189, icon: '📱', trend: '+12%' },
        ],
        aiInsights: [
          '🔍 AI detected 12 laptops approaching end-of-life',
          '💡 Suggest bulk purchase of SSDs for 23 aging systems', 
          '⚠️ Network switch in Server Room B showing performance degradation',
          '📊 License optimization could save $2,400/month'
        ]
      },
      // ... other industries remain the same
    };
    
    return data[industry as keyof typeof data] || data.IT;
  };

  const currentData = getIndustryData(selectedIndustry);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e6f0ff 50%, #f0f4ff 100%)' }}>
      {/* Branded Header with Your Logo */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Your CE Logo */}
              <div 
                className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                style={{ background: brandGradient }}
              >
                CE
              </div>
              <div>
                <h1 
                  className="text-2xl font-bold bg-clip-text text-transparent"
                  style={{ backgroundImage: brandGradient }}
                >
                  AssetIQ Pro
                </h1>
                <p className="text-sm text-gray-600">by Chase Elkins • Universal Asset Intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCustomization(!showCustomization)}
                className="px-4 py-2 text-sm font-medium text-white rounded-xl shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                style={{ background: brandGradient }}
              >
                ⚙️ White-Label Demo
              </button>
              <div 
                className="h-10 w-10 rounded-full flex items-center justify-center text-white shadow-md"
                style={{ background: accentGradient }}
              >
                <span className="text-sm">👤</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section with Your Brand */}
        <div className="mb-12 text-center">
          <div className="mb-6">
            <div 
              className="inline-block h-20 w-20 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-xl mb-6"
              style={{ background: brandGradient }}
            >
              🚀
            </div>
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-4">
            The Future of Asset Management
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Built by <strong>Chase Elkins</strong> - Transform your business with AI-powered asset intelligence. 
            White-label ready for enterprise partners.
          </p>
          
          {/* Brand Showcase Banner */}
          <div 
            className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl text-white shadow-xl mb-8"
            style={{ background: brandGradient }}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              <span className="font-semibold">Your Brand Here</span>
            </div>
            <div className="w-px h-8 bg-white/30"></div>
            <div className="text-sm opacity-90">
              Complete white-label customization available
            </div>
          </div>
        </div>

        {/* Stats Grid with Your Branding */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {currentData.assets.map((asset, index) => (
            <div
              key={asset.name}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/50 hover:shadow-xl transition-all duration-300 animate-slide-up group cursor-pointer"
              style={{ 
                animationDelay: `${index * 100}ms`,
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.1)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl group-hover:scale-110 transition-transform">
                  {asset.icon}
                </div>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  asset.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 
                  asset.trend.startsWith('-') ? 'bg-red-100 text-red-700' : 
                  'bg-gray-100 text-gray-700'
                }`}>
                  {asset.trend}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{asset.name}</h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">{asset.count.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Active Assets</p>
            </div>
          ))}
        </div>

        {/* AI Assistant & Business Model Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* AI Insights */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="h-12 w-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg"
                style={{ background: accentGradient }}
              >
                🤖
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">AI-Powered Insights</h3>
                <p className="text-gray-600">Machine learning recommendations</p>
              </div>
            </div>
            <div className="space-y-4">
              {currentData.aiInsights.map((insight, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-xl hover:from-blue-100/80 hover:to-purple-100/80 transition-all cursor-pointer border border-blue-100/50"
                >
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 font-medium">{insight}</p>
                  </div>
                  <button 
                    className="text-xs font-semibold px-3 py-1 rounded-lg text-white shadow-sm hover:shadow-md transition-all"
                    style={{ background: brandGradient }}
                  >
                    Act →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SaaS Business Model */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-xl">
            <div className="text-center mb-6">
              <div 
                className="inline-block h-16 w-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-4"
                style={{ background: brandGradient }}
              >
                💰
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">SaaS Revenue Model</h3>
              <p className="text-gray-600">Scalable subscription-based pricing</p>
            </div>
            
            <div className="space-y-3">
              {[
                { tier: 'Starter', price: '$29/mo', desc: 'Up to 500 assets' },
                { tier: 'Professional', price: '$99/mo', desc: 'Up to 5K assets + AI' },
                { tier: 'Enterprise', price: '$299/mo', desc: 'Unlimited + White-label' },
                { tier: 'Custom Partnership', price: 'Revenue Share', desc: 'Full platform licensing' }
              ].map((plan, index) => (
                <div
                  key={plan.tier}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    index === 2 
                      ? 'border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-900">{plan.tier}</h4>
                      <p className="text-sm text-gray-600">{plan.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{plan.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* White-Label Partnership CTA */}
        <div 
          className="rounded-3xl p-8 text-white shadow-2xl mb-12"
          style={{ background: brandGradient }}
        >
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
                🤝
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4">Partner With Chase Elkins</h2>
            <p className="text-xl opacity-90 mb-8">
              Looking for a proven SaaS developer to build your next enterprise platform? 
              Let's create the next unicorn together.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <span className="px-4 py-2 bg-white/20 rounded-lg font-medium">Full-Stack Development</span>
              <span className="px-4 py-2 bg-white/20 rounded-lg font-medium">AI Integration</span>
              <span className="px-4 py-2 bg-white/20 rounded-lg font-medium">White-Label Solutions</span>
              <span className="px-4 py-2 bg-white/20 rounded-lg font-medium">Enterprise Architecture</span>
            </div>
            <div className="flex justify-center gap-4">
              <button className="px-8 py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg">
                📧 Contact Chase
              </button>
              <button className="px-8 py-3 border-2 border-white text-white rounded-xl font-bold hover:bg-white hover:text-purple-600 transition-colors">
                📊 View Portfolio
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Floating AI Assistant with Your Branding */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          className="w-16 h-16 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group"
          style={{ background: accentGradient }}
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">🤖</span>
        </button>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<ChaseElkinsBrandedPlatform />);
