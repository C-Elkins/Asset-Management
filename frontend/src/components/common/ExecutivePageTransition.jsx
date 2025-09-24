import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ExecutivePageTransition = ({ children, location }) => {
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.98
    },
    in: {
      opacity: 1,
      y: 0,
      scale: 1
    },
    out: {
      opacity: 0,
      y: -20,
      scale: 1.02
    }
  };

  const pageTransition = {
    type: "tween",
    ease: [0.23, 1, 0.32, 1],
    duration: 0.6
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    in: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    },
    out: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const staggerChild = {
    initial: { opacity: 0, y: 30 },
    in: {
      opacity: 1,
      y: 0,
      transition: {
        type: "tween",
        ease: [0.23, 1, 0.32, 1],
        duration: 0.6
      }
    },
    out: {
      opacity: 0,
      y: -30,
      transition: {
        type: "tween",
        ease: [0.23, 1, 0.32, 1],
        duration: 0.3
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="relative min-h-full"
      >
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="in"
          exit="out"
        >
          {React.cloneElement(children, {
            staggerChild: staggerChild
          })}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const ExecutiveStaggerChild = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{
        type: "tween",
        ease: [0.23, 1, 0.32, 1],
        duration: 0.6,
        delay: delay
      }}
    >
      {children}
    </motion.div>
  );
};
