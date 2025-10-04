import React, { useState } from 'react';

// Route preloading map for faster navigation
const routePreloadMap = {
  '/': () => import('../../pages/marketing/Home.jsx'),
  '/features': () => import('../../pages/marketing/Features.jsx'),
  '/solutions': () => import('../../pages/marketing/Solutions.jsx'),
  '/security': () => import('../../pages/marketing/Security.jsx'),
  '/integrations': () => import('../../pages/marketing/Integrations.jsx'),
  '/customers': () => import('../../pages/marketing/Customers.jsx'),
  '/pricing': () => import('../../pages/marketing/Pricing.jsx'),
  '/about': () => import('../../pages/marketing/About.jsx'),
  '/contact': () => import('../../pages/marketing/Contact.jsx'),
};

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/security', label: 'Security' },
  { href: '/integrations', label: 'Integrations' },
  { href: '/customers', label: 'Customers' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export const MarketingLayout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Preload route on hover for instant navigation
  const handleLinkHover = (href) => {
    if (routePreloadMap[href]) {
      routePreloadMap[href]();
    }
  };

  return (
    <div style={{
      background: 'var(--background, #f6f8fa)',
      color: 'var(--text, #222)',
      fontFamily: 'Inter, system-ui, sans-serif',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 50, 
        backdropFilter: 'saturate(180%) blur(8px)',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          maxWidth: '1280px', 
          margin: '0 auto', 
          padding: '16px 16px'
        }}>
          {/* Logo */}
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 16, textDecoration: 'none', flexShrink: 0 }}>
            <img 
              src="/brand/krubles-ka-logo.svg" 
              alt="Krubles KA" 
              style={{ 
                display: 'block', 
                height: '52px',
                maxWidth: '240px',
                width: 'auto',
                objectFit: 'contain'
              }} 
            />
          </a>

          {/* Desktop Navigation */}
          <nav style={{ 
            display: 'none',
            gap: '12px', 
            alignItems: 'center'
          }} className="desktop-nav">
            {navItems.map(n => (
              <a 
                key={n.href} 
                href={n.href}
                onMouseEnter={() => handleLinkHover(n.href)}
                style={{ 
                  color: 'var(--text, #222)', 
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  padding: '6px 10px',
                  borderRadius: '6px',
                  transition: 'background-color 0.2s'
                }} 
                className="hover:bg-gray-100"
              >
                {n.label}
              </a>
            ))}
            <a href="/login" style={{
              marginLeft: 8,
              padding: '8px 14px',
              borderRadius: 8,
              border: '1.5px solid var(--primary, #2563eb)',
              color: 'var(--primary, #2563eb)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'all 0.2s'
            }} className="hover:bg-blue-50">Sign in</a>
            <a href="/signup" style={{
              padding: '8px 14px',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.2s'
            }} className="hover:shadow-lg">Start free</a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              padding: '8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '24px'
            }}
            className="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            padding: '16px',
            animation: 'slideDown 0.2s ease-out'
          }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {navItems.map(n => (
                <a 
                  key={n.href} 
                  href={n.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ 
                    color: 'var(--text, #222)', 
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: 500,
                    padding: '12px 16px',
                    borderRadius: '8px',
                    transition: 'background-color 0.2s'
                  }} 
                  className="hover:bg-gray-100"
                >
                  {n.label}
                </a>
              ))}
              <div style={{ height: '1px', background: '#e5e7eb', margin: '8px 0' }} />
              <a href="/login" style={{
                padding: '12px 16px',
                borderRadius: 8,
                border: '1.5px solid var(--primary, #2563eb)',
                color: 'var(--primary, #2563eb)',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 600,
                textAlign: 'center'
              }}>Sign in</a>
              <a href="/signup" style={{
                padding: '12px 16px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)',
                color: '#fff',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 600,
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
              }}>Start free</a>
            </nav>
          </div>
        )}

        <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.06), transparent)' }} />
      </header>

      <div style={{ flex: 1 }}>
        <div style={{
          animation: 'pageTransition 0.5s ease-out',
          opacity: 1
        }}>
          {children}
        </div>
      </div>

      <footer style={{ 
        borderTop: '1px solid rgba(0,0,0,0.06)', 
        padding: '32px 16px', 
        marginTop: 48,
        background: '#fafbfc'
      }}>
        <div style={{ 
          maxWidth: 1280, 
          margin: '0 auto', 
          textAlign: 'center', 
          color: 'var(--text-muted, #666)' 
        }}>
          <div style={{ 
            marginBottom: 16,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px 24px',
            justifyContent: 'center',
            fontSize: '14px'
          }}>
            <a href="/about" className="hover:underline hover:text-gray-900">About</a>
            <a href="/security" className="hover:underline hover:text-gray-900">Security</a>
            <a href="/pricing" className="hover:underline hover:text-gray-900">Pricing</a>
            <a href="/contact" className="hover:underline hover:text-gray-900">Contact</a>
          </div>
          <small style={{ fontSize: '13px' }}>© {new Date().getFullYear()} Krubles. All rights reserved.</small>
        </div>
      </footer>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pageTransition {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .mobile-menu-btn {
            display: block !important;
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        a {
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default MarketingLayout;
