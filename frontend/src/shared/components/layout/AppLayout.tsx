import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { User } from '../../../shared/types';

interface AppLayoutProps {
  user?: User;
  onLogout: () => void;
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  user,
  onLogout,
  children
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isCollapsed={sidebarCollapsed} />
      
      {/* Header */}
      <Header 
        user={user}
        onToggleSidebar={toggleSidebar}
        onLogout={onLogout}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      {/* Main content */}
      <motion.main
        className={clsx(
          'pt-16 transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="p-6">
          {children}
        </div>
      </motion.main>

      {/* Mobile overlay */}
      {!sidebarCollapsed && (
        <motion.div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export { AppLayout };
