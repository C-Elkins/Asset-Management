import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './SkipLink.css';

/**
 * SkipLink Component
 * Provides a "Skip to main content" link for keyboard users
 * WCAG 2.2 AA Compliant - Bypass Blocks (2.4.1)
 * 
 * Allows users to skip repetitive navigation and go directly to main content
 */
export function SkipLink() {
  const location = useLocation();

  useEffect(() => {
    // Announce page changes to screen readers
    const pageTitle = document.title || 'Page';
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Navigated to ${pageTitle}`;
    document.body.appendChild(announcement);

    // Remove announcement after 1 second
    const timeout = setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);

    return () => {
      clearTimeout(timeout);
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    };
  }, [location]);

  const handleSkipLink = (e) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a
      href="#main-content"
      className="skip-link"
      onClick={handleSkipLink}
    >
      Skip to main content
    </a>
  );
}

export default SkipLink;
