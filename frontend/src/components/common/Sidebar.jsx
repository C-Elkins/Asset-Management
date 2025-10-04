import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../app/store';
import { 
  BarChart3, 
  Laptop, 
  Wrench, 
  FileText, 
  Settings,
  Layers3,
  ChevronRight,
  Shield
} from 'lucide-react';

export const Sidebar = () => {
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'IT_ADMIN';

  const menuItems = [
    { to: '/app/dashboard', label: 'Dashboard', icon: BarChart3, description: 'Analytics & Overview' },
    { to: '/app/assets', label: 'Assets', icon: Laptop, description: 'IT Equipment Management' },
    { to: '/app/maintenance', label: 'Maintenance', icon: Wrench, description: 'Service & Repairs' },
    { to: '/app/reports', label: 'Reports', icon: FileText, description: 'Business Intelligence' },
    { to: '/app/privacy', label: 'Privacy', icon: Shield, description: 'Consent & My Data' },
    // Only show Billing for admins
    ...(isAdmin ? [{ to: '/app/billing', label: 'Billing', icon: Shield, description: 'Subscription & Invoices' }] : []),
    { to: '/app/settings', label: 'Settings', icon: Settings, description: 'System Configuration' },
    { to: '/app/showcase', label: 'Components', icon: Layers3, description: 'Design System' }
  ];

  // Admin-only menu items
  const adminItems = [
    { to: '/app/admin', label: 'Administration', icon: Shield, description: 'User & System Management' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.23, 1, 0.32, 1]
      }
    }
  };

  return (
    <motion.aside 
      className="sidebar relative"
      style={{
        background: 'linear-gradient(145deg, rgba(248, 250, 252, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        borderRight: '1px solid rgba(0, 0, 0, 0.03)',
        boxShadow: 'inset -1px 0 0 0 rgba(255, 255, 255, 0.5), 8px 0 32px rgba(0, 0, 0, 0.04), 0 0 80px rgba(0, 0, 0, 0.02)'
      }}
      initial={{ opacity: 0, x: -320 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
    >
      <motion.div 
        className="px-8 py-10 border-b border-black border-opacity-[0.03]"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(248, 250, 252, 0.2) 100%)'
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-sm animate-pulse" />
          <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase">Enterprise Portal</span>
        </div>
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Asset Management</h2>
        <p className="text-xs text-slate-500 mt-1 font-medium">Professional Dashboard</p>
        {/* Tiny System Status bar under the header */}
        <div className="mt-3" aria-label="System status: All systems operational">
          <div className="h-1.5 rounded-full bg-emerald-500/15">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-emerald-700">All Systems Operational</span>
          </div>
        </div>
      </motion.div>

      <nav className="px-6 py-6">
        <motion.ul
          className="space-y-1"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {menuItems.map((item, _index) => {
              const IconComponent = item.icon;
              return (
                <motion.li key={item.to} variants={itemVariants}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => {
                      const baseClasses = 'group relative flex items-center gap-4 px-5 py-4 mb-1 text-[13px] font-semibold rounded-[14px] transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] hover:shadow-lg hover:shadow-black/5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-[0.97] overflow-hidden';
                      const activeClasses = isActive 
                        ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl shadow-slate-900/25 scale-[1.02]' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-gradient-to-r hover:from-white/60 hover:to-slate-50/80';
                      return baseClasses + ' ' + activeClasses;
                    }}
                  >
                    {({ isActive }) => (
                      <>
                        <motion.div
                          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-r-full"
                          initial={false}
                          animate={{
                            opacity: isActive ? 1 : 0,
                            scaleY: isActive ? 1 : 0.3
                          }}
                          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        />
                        
                        <motion.div
                          className={'relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 ' + (isActive ? 'bg-white/15' : 'bg-slate-100/80 group-hover:bg-white/90')}
                          whileHover={{ scale: 1.05, rotate: 1 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <IconComponent 
                            className={'w-5 h-5 flex-shrink-0 transition-all duration-300 ' + (isActive ? 'text-white drop-shadow-sm' : 'text-slate-700 group-hover:text-slate-900')} 
                            strokeWidth={isActive ? 2.5 : 2.2}
                          />
                        </motion.div>
                        
                        <div className="flex-1 min-w-0">
                          <motion.div
                            className="flex items-center justify-between"
                            whileHover={{ x: 2 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div>
                              <p className={'font-semibold tracking-[-0.01em] ' + (isActive ? 'text-white' : 'text-slate-700')}>
                                {item.label}
                              </p>
                              <p className={'text-[11px] font-medium mt-0.5 ' + (isActive ? 'text-white/70' : 'text-slate-500')}>
                                {item.description}
                              </p>
                            </div>
                            
                            <motion.div
                              initial={false}
                              animate={{
                                x: isActive ? 4 : 0,
                                opacity: isActive ? 1 : 0.4
                              }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight 
                                className={'w-4 h-4 transition-colors duration-300 ' + (isActive ? 'text-white/80' : 'text-slate-400 group-hover:text-slate-600')}
                                strokeWidth={2}
                              />
                            </motion.div>
                          </motion.div>
                        </div>

                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-cyan-500/5 to-transparent opacity-0 rounded-[14px]"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: isActive ? 0 : 1 }}
                          transition={{ duration: 0.3 }}
                        />

                        {isActive && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-slate-900/10 to-transparent rounded-[14px]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0.5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>

        {/* Admin Section */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 pt-6 border-t border-slate-200/50"
          >
            <div className="px-5 mb-4">
              <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase flex items-center gap-2">
                <Shield className="w-3 h-3" />
                Administration
              </p>
            </div>
            <motion.ul className="space-y-1" variants={containerVariants}>
              {adminItems.map((item, _index) => {
                const IconComponent = item.icon;
                return (
                  <motion.li key={item.to} variants={itemVariants}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) => {
                        const baseClasses = 'group relative flex items-center gap-4 px-5 py-4 mb-1 text-[13px] font-semibold rounded-[14px] transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] hover:shadow-lg hover:shadow-black/5 focus:outline-none focus:ring-2 focus:ring-red-500/20 active:scale-[0.97] overflow-hidden';
                        const activeClasses = isActive 
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-xl shadow-red-600/25 scale-[1.02]' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-gradient-to-r hover:from-red-50/60 hover:to-red-100/40';
                        return baseClasses + ' ' + activeClasses;
                      }}
                    >
                      {({ isActive }) => (
                        <>
                          <motion.div
                            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-orange-500 rounded-r-full"
                            initial={false}
                            animate={{
                              opacity: isActive ? 1 : 0,
                              scaleY: isActive ? 1 : 0.3
                            }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                          />
                          
                          <motion.div
                            className={'relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 ' + (isActive ? 'bg-white/15' : 'bg-red-50/80 group-hover:bg-red-100/90')}
                            whileHover={{ scale: 1.05, rotate: 1 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            <IconComponent 
                              className={'w-5 h-5 flex-shrink-0 transition-all duration-300 ' + (isActive ? 'text-white drop-shadow-sm' : 'text-red-700 group-hover:text-red-800')} 
                              strokeWidth={isActive ? 2.5 : 2.2}
                            />
                          </motion.div>
                          
                          <div className="flex-1 min-w-0">
                            <motion.div
                              className="flex items-center justify-between"
                              whileHover={{ x: 2 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div>
                                <p className={'font-semibold tracking-[-0.01em] ' + (isActive ? 'text-white' : 'text-slate-700')}>
                                  {item.label}
                                </p>
                                <p className={'text-[11px] font-medium mt-0.5 ' + (isActive ? 'text-white/70' : 'text-slate-500')}>
                                  {item.description}
                                </p>
                              </div>
                              
                              <motion.div
                                initial={false}
                                animate={{
                                  x: isActive ? 4 : 0,
                                  opacity: isActive ? 1 : 0.4
                                }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronRight 
                                  className={'w-4 h-4 transition-colors duration-300 ' + (isActive ? 'text-white/80' : 'text-slate-400 group-hover:text-slate-600')}
                                  strokeWidth={2}
                                />
                              </motion.div>
                            </motion.div>
                          </div>

                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-orange-500/5 to-transparent opacity-0 rounded-[14px]"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: isActive ? 0 : 1 }}
                            transition={{ duration: 0.3 }}
                          />

                          {isActive && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent rounded-[14px]"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 0.5, 0] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            />
                          )}
                        </>
                      )}
                    </NavLink>
                  </motion.li>
                );
              })}
            </motion.ul>
          </motion.div>
        )}
      </nav>

      {/* Removed floating/bottom System Status card to avoid overlap; replaced with tiny bar under header */}
    </motion.aside>
  );
};
