import React from 'react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Bell, Search, Settings, ChevronDown } from 'lucide-react';

export const Header = ({ user, onLogout }) => {

  // Map backend role codes to friendly labels
  const roleLabel = (code) => {
    if (!code) return '';
    const map = {
      'ROLE_SUPER_ADMIN': 'Super Admin',
      'ROLE_ADMIN': 'Admin', 
      'ROLE_MANAGER': 'Manager',
      'ROLE_USER': 'User'
    };
    return map[code] || code.replace(/^ROLE_/, '').toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const compactUser = (() => {
    if (!user) return '';
    const name = user.username || 'Signed in';
    const roles = Array.isArray(user.roles) && user.roles.length > 0
      ? user.roles.map(roleLabel).join(', ')
      : '';
    return roles ? `${name} · ${roles}` : name;
  })();

  const location = useLocation();
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Trigger luxurious slow pulse on route changes
    setAnimating(true);
    const timer = setTimeout(() => setAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {/* Executive Progress Indicator */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: animating ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500"
          initial={{ width: '0%' }}
          animate={{ width: animating ? '100%' : '0%' }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        />
      </motion.div>
      
      <motion.header 
        className="relative"
        style={{
          background: 'linear-gradient(145deg, rgba(248, 250, 252, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.03)',
          boxShadow: 'inset 0 -1px 0 0 rgba(255, 255, 255, 0.5), 0 8px 32px rgba(0, 0, 0, 0.04), 0 0 80px rgba(0, 0, 0, 0.02)'
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            
            {/* Executive Search Section */}
            <motion.div 
              className="flex-1 max-w-xl"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-slate-400" strokeWidth={2} />
                </div>
                <motion.input
                  type="text"
                  placeholder="Search assets, reports, maintenance..."
                  className="w-full pl-12 pr-4 py-4 text-[13px] font-medium text-slate-700 placeholder-slate-400 bg-white/80 border border-slate-200/50 rounded-xl shadow-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300/50 transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)'
                  }}
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </motion.div>

            {/* Executive Actions */}
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              
              {/* Premium Notifications */}
              <motion.button
                className="relative p-3 text-slate-600 hover:text-slate-900 bg-white/60 hover:bg-white/90 border border-slate-200/50 rounded-lg shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Bell className="w-5 h-5" strokeWidth={2} />
                <motion.div 
                  className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full border-2 border-white shadow-sm"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.button>

              {/* Executive Settings */}
              <motion.button
                className="p-3 text-slate-600 hover:text-slate-900 bg-white/60 hover:bg-white/90 border border-slate-200/50 rounded-lg shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Settings className="w-5 h-5" strokeWidth={2} />
              </motion.button>

              <AnimatePresence>
                {user && (
                  <motion.div
                    className="flex items-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  >
                    {/* Executive User Profile */}
                    <motion.div 
                      className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-white/80 to-slate-50/80 border border-slate-200/50 rounded-xl shadow-sm backdrop-blur-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="relative">
                        <div className="w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center shadow-sm">
                          <User className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-slate-800 tracking-[-0.01em] truncate">
                          {user.username || 'Executive User'}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 truncate">
                          {user.roles && user.roles.length > 0 
                            ? user.roles.map(roleLabel).join(', ')
                            : 'System Administrator'
                          }
                        </p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors duration-200" strokeWidth={2} />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence>
                {onLogout && (
                  <motion.button
                    onClick={onLogout}
                    className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl font-semibold text-[13px] shadow-xl shadow-slate-900/25 hover:shadow-2xl hover:shadow-slate-900/30 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-slate-500/20 transition-all duration-300 active:scale-[0.97]"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <LogOut className="w-4 h-4" strokeWidth={2.5} />
                    Sign Out
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </motion.header>
    </>
  );
};
