import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Search, Bell, Menu, User, LogOut, Settings } from 'lucide-react';
import { Button } from '../ui';
import { User as UserType } from '../../../shared/types';

interface HeaderProps {
  user?: UserType;
  onToggleSidebar: () => void;
  onLogout: () => void;
  sidebarCollapsed?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  user,
  onToggleSidebar,
  onLogout,
  sidebarCollapsed = false
}) => {
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [notifications] = React.useState(3); // Mock notification count

  return (
    <motion.header
      className={clsx(
        'fixed top-0 right-0 h-16 bg-white border-b border-gray-200 z-30 transition-all duration-300',
        sidebarCollapsed ? 'left-16' : 'left-64'
      )}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="h-full flex items-center justify-between px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            icon={<Menu />}
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            Menu
          </Button>
          
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <motion.input
              type="text"
              placeholder="Search assets, users, or maintenance..."
              className="w-64 lg:w-80 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
              whileFocus={{ scale: 1.02 }}
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Mobile search */}
          <Button
            variant="ghost"
            size="sm"
            icon={<Search />}
            className="md:hidden"
          >
            Search
          </Button>

          {/* Notifications */}
          <motion.div className="relative">
            <Button
              variant="ghost"
              size="sm"
              icon={<Bell />}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Notifications
            </Button>
            {notifications > 0 && (
              <motion.span
                className="absolute -top-1 -right-1 h-5 w-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {notifications}
              </motion.span>
            )}
          </motion.div>

          {/* User menu */}
          <div className="relative">
            <motion.button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-primary-600" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </motion.button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <motion.div
                className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-medium py-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                  <User size={16} />
                  Profile
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                  <Settings size={16} />
                  Settings
                </button>
                <hr className="my-2 border-gray-200" />
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors duration-200"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export { Header };
