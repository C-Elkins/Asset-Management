import React, { useState } from 'react';
import { authService } from '../../services/authService.js';
import { useToast } from '../../components/common/Toast.jsx';
import { useNavigate } from 'react-router-dom';
import GoogleLoginButton from '../../components/auth/GoogleLoginButton.jsx';
import MicrosoftLoginButton from '../../components/auth/MicrosoftLoginButton.jsx';

export const Signup = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [microsoftLoading, setMicrosoftLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authService.register(form);
      addToast({ type: 'success', title: 'Account created', message: 'You can now sign in.' });
      setTimeout(() => navigate('/signin'), 1500);
    } catch (e) {
      addToast({ type: 'error', title: 'Signup failed', message: e.message || 'Unable to create account' });
    } finally { setBusy(false); }
  };

  const benefits = [
    { icon: '🚀', title: 'Quick Setup', description: 'Start managing assets in minutes' },
    { icon: '📊', title: 'Powerful Analytics', description: 'Real-time insights and reports' },
    { icon: '🔒', title: 'Secure & Compliant', description: 'Enterprise-grade security' },
    { icon: '💰', title: 'Cost Tracking', description: 'Monitor spending and depreciation' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 100%)', position: 'relative', overflow: 'hidden' }}>
      {/* Animated gradient blobs */}
      <div 
        className="absolute top-20 right-20 w-96 h-96 rounded-full opacity-30 animate-pulse"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.4), transparent 70%)', filter: 'blur(80px)' }}
      />
      <div 
        className="absolute bottom-20 left-20 w-96 h-96 rounded-full opacity-30 animate-pulse"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.4), transparent 70%)', filter: 'blur(80px)', animationDelay: '1s' }}
      />

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>
        <div className="max-w-7xl mx-auto px-6" style={{ padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 16, textDecoration: 'none' }}>
              <img 
                src="/brand/krubles-ka-logo.svg" 
                alt="Krubles KA" 
                style={{ display: 'block', height: '52px', maxWidth: '240px', width: 'auto', objectFit: 'contain' }} 
              />
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span className="text-gray-600">Already have an account?</span>
              <button
                type="button"
                className="font-semibold px-6 py-2 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all duration-300"
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Benefits */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-blue-200 shadow-sm mb-6">
                <span className="text-xl">✨</span>
                <span className="text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Start your free trial
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-black mb-6" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Welcome to Krubles
              </h1>
              <p className="text-xl text-gray-600">
                Join forward-thinking teams managing their IT assets smarter, faster, and more securely.
              </p>
            </div>

            {/* Benefits grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((benefit, idx) => (
                <div 
                  key={idx}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="text-3xl mb-3">{benefit.icon}</div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-green-500 border-2 border-white" />
                  ))}
                </div>
                <div>
                  <div className="font-bold text-gray-900">Join early adopters</div>
                  <div className="text-sm text-gray-600">Building the future together</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 italic">
                "Finally, an asset management system that doesn't make me want to pull my hair out."
              </p>
            </div>
          </div>

          {/* Right side - Signup Form */}
          <div>
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-10 max-w-md mx-auto">
              <h2 className="text-2xl font-bold mb-2 text-gray-900">Create your account</h2>
              <p className="text-gray-600 mb-8">No credit card required. Start free.</p>

              <form onSubmit={submit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <input 
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300" 
                    placeholder="johndoe" 
                    value={form.username} 
                    onChange={e=>setForm(f=>({ ...f, username: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input 
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300" 
                    placeholder="john@company.com" 
                    type="email" 
                    value={form.email} 
                    onChange={e=>setForm(f=>({ ...f, email: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input 
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-300" 
                    placeholder="••••••••" 
                    type="password" 
                    value={form.password} 
                    onChange={e=>setForm(f=>({ ...f, password: e.target.value }))}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>

                <button 
                  className="w-full py-4 rounded-xl font-bold text-lg text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  style={{ background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)' }}
                  disabled={busy} 
                  type="submit"
                >
                  {busy ? 'Creating account...' : 'Start Free Trial'}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* OAuth buttons */}
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {formError}
                </div>
              )}

              <div className="space-y-3">
                <GoogleLoginButton
                  disabled={busy || googleLoading || microsoftLoading}
                  onError={(error) => setFormError(error)}
                  onLoading={setGoogleLoading}
                />

                <MicrosoftLoginButton
                  disabled={busy || googleLoading || microsoftLoading}
                  onError={(error) => setFormError(error)}
                  onLoading={setMicrosoftLoading}
                />
              </div>

              <p className="text-xs text-gray-500 text-center mt-6">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 mt-12 border-t border-gray-200 relative">
        <div className="text-center text-sm text-gray-600">
          <p>© 2025 Krubles. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Signup;
