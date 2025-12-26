import React from 'react';
import { HelpCircle } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import './Tooltip.css';

/**
 * Simple CSS-Only Tooltip Component
 * WCAG 2.2 AA Compliant - Uses pure CSS for positioning
 * 
 * @param {string} content - The tooltip text content
 * @param {string} position - Position: 'top', 'bottom', 'left', 'right' (default: 'top')
 * @param {boolean} showIcon - Whether to show the help icon (default: true)
 * @param {string} iconPosition - Icon position: 'before', 'after' (default: 'after')
 * @param {React.ReactNode} children - The element to attach tooltip to
 */
export function Tooltip({ 
  content, 
  position = 'top', 
  showIcon = true,
  iconPosition = 'after',
  children
}) {
  // Check if tooltips are enabled in settings
  const tooltipsEnabled = useSettingsStore(s => s.settings?.system?.showTooltips ?? true);

  // Don't render if tooltips are disabled or no content
  if (!tooltipsEnabled || !content) {
    return children || null;
  }

  return (
    <span className={`tooltip-wrapper tooltip-${position}`}>
      {iconPosition === 'before' && showIcon && (
        <HelpCircle className="tooltip-icon" size={16} aria-hidden="true" />
      )}
      {children}
      {iconPosition === 'after' && showIcon && (
        <HelpCircle className="tooltip-icon" size={16} aria-hidden="true" />
      )}
      <span className="tooltip-text" role="tooltip" aria-label={content}>
        {content}
      </span>
    </span>
  );
}

/**
 * Simple inline tooltip that wraps text/icon only
 */
export function InlineTooltip({ content, children, position = 'top' }) {
  return (
    <Tooltip content={content} position={position} showIcon={false}>
      {children}
    </Tooltip>
  );
}

/**
 * Icon-only tooltip (just the help circle icon)
 */
export function TooltipIcon({ content, position = 'top', size = 16 }) {
  const tooltipsEnabled = useSettingsStore(s => s.settings?.system?.showTooltips ?? true);
  
  if (!tooltipsEnabled || !content) return null;

  return (
    <Tooltip content={content} position={position} showIcon={false}>
      <HelpCircle 
        size={size} 
        className="tooltip-icon-standalone"
        aria-label={content}
        style={{ 
          cursor: 'help',
          color: '#6b7280',
          flexShrink: 0
        }} 
      />
    </Tooltip>
  );
}

export default Tooltip;
