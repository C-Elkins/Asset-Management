import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * FocusTrap Component
 * Traps keyboard focus within a container (used for modals, dialogs)
 * Ensures users can't tab out of critical UI elements
 * WCAG 2.2 AA Compliant
 * 
 * @param {React.ReactNode} children - The content to trap focus within
 * @param {boolean} active - Whether the trap is active
 * @param {Function} onEscape - Callback when Escape key is pressed
 */
export function FocusTrap({ children, active = true, onEscape }) {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    // Store the element that had focus before the trap
    previousFocusRef.current = document.activeElement;

    // Get all focusable elements
    const getFocusableElements = () => {
      return container.querySelectorAll(
        'a[href], button:not(:disabled), textarea:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])'
      );
    };

    const focusableElements = getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the first element
    if (firstElement) {
      firstElement.focus();
    }

    // Handle Tab key
    const handleTab = (e) => {
      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      } else if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
      }
    };

    container.addEventListener('keydown', handleTab);

    // Cleanup
    return () => {
      container.removeEventListener('keydown', handleTab);
      
      // Restore focus to the element that had it before the trap
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [active, onEscape]);

  if (!active) {
    return <>{children}</>;
  }

  return <div ref={containerRef}>{children}</div>;
}

FocusTrap.propTypes = {
  children: PropTypes.node.isRequired,
  active: PropTypes.bool,
  onEscape: PropTypes.func
};

export default FocusTrap;
