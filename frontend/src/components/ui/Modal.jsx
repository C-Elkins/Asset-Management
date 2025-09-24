import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { X } from 'lucide-react';
import Button from './Button';

/**
 * Premium Modal Component - $1M Apple-Grade Quality
 * 
 * Features:
 * - Perfect backdrop blur and glass morphism
 * - Sophisticated enter/exit animations
 * - Focus trap and keyboard navigation
 * - Multiple sizes and variants
 * - Accessible by default (ARIA, ESC key, click outside)
 * - Smooth spring animations with perfect timing
 */

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className,
  overlayClassName,
  ...props
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      modalRef.current?.focus();
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [isOpen]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;

      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault();
        onClose?.();
      }

      // Focus trap
      if (event.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && closeOnBackdrop) {
      onClose?.();
    }
  };

  const sizes = {
    xs: 'max-w-xs w-full mx-4 sm:mx-auto',
    sm: 'max-w-sm w-full mx-4 sm:mx-auto',
    md: 'max-w-md w-full mx-4 sm:mx-auto',
    lg: 'max-w-lg w-full mx-4 sm:mx-auto',
    xl: 'max-w-xl w-full mx-4 sm:mx-auto',
    '2xl': 'max-w-2xl w-full mx-4 sm:mx-auto',
    '3xl': 'max-w-3xl w-full mx-4 sm:mx-auto',
    '4xl': 'max-w-4xl w-full mx-4 sm:mx-auto',
    full: 'max-w-full w-full mx-4'
  };

  const variants = {
    default: `
      bg-apple-glass-heavy border border-border-light
      shadow-apple-4 backdrop-filter-heavy
    `,
    glass: `
      bg-apple-glass-ultra-light border border-apple-white/20
      shadow-apple-6 backdrop-filter-heavy
    `,
    solid: `
      bg-apple-white border border-border-light
      shadow-apple-5
    `
  };

  const overlayVariants = {
    hidden: { 
      opacity: 0,
      backdropFilter: 'blur(0px)'
    },
    visible: { 
      opacity: 1,
      backdropFilter: 'blur(20px)',
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    exit: { 
      opacity: 0,
      backdropFilter: 'blur(0px)',
      transition: {
        duration: 0.2,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const modalVariants = {
    hidden: { 
      scale: 0.8,
      opacity: 0,
      y: 50
    },
    visible: { 
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300,
        duration: 0.4
      }
    },
    exit: { 
      scale: 0.8,
      opacity: 0,
      y: 50,
      transition: {
        duration: 0.2,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const modalClasses = clsx(
    'relative rounded-radius-xl overflow-hidden safe-area-bottom',
    'max-h-[90vh] sm:max-h-[80vh]',
    sizes[size],
    variants[variant],
    className
  );

  const overlayClasses = clsx(
    'fixed inset-0 z-50 flex items-center justify-center',
    'p-4 sm:p-6 safe-area-top safe-area-bottom',
    'bg-apple-black/40',
    overlayClassName
  );

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className={overlayClasses}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          {...props}
        >
          <motion.div
            ref={modalRef}
            className={modalClasses}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border-light">
                {title && (
                  <h2 id="modal-title" className="text-heading-3 font-semibold text-apple-text-primary pr-4">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <motion.button
                    onClick={onClose}
                    className={clsx(
                      'p-2 rounded-radius-md text-apple-text-secondary min-w-[44px] min-h-[44px]',
                      'hover:text-apple-text-primary hover:bg-apple-gray-100',
                      'focus:outline-none focus:ring-2 focus:ring-apple-blue-light',
                      'transition-colors duration-150 flex items-center justify-center',
                      { 'ml-auto': !title }
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Confirmation Modal Variant
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  ...props
}) => {
  const handleConfirm = () => {
    onConfirm?.();
    onClose?.();
  };

  const confirmVariants = {
    danger: 'danger',
    primary: 'primary',
    secondary: 'secondary'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      {...props}
    >
      <div className="space-y-6">
        {message && (
          <p className="text-body-md text-apple-text-secondary leading-relaxed">
            {message}
          </p>
        )}
        
        <div className="flex gap-3 justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariants[variant]}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default Modal;
