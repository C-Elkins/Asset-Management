import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { 
  LayoutDashboard,
  Package,
  Wrench,
  BarChart3,
  Settings,
  Users
} from 'lucide-react';
import { NavItem } from '../../../shared/types';

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/app/dashboard'
  },
  {
    id: 'assets',
    label: 'Assets',
    icon: 'Package', 
    path: '/app/assets'
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    icon: 'Wrench',
    path: '/app/maintenance'
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'BarChart3',
    path: '/app/reports'
  },
  {
    id: 'ai',
    label: 'AI Assistant',
    icon: 'LayoutDashboard',
    path: '/app/ai'
  },
  {
    id: 'users',
    label: 'Users',
    icon: 'Users',
    path: '/app/users'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    path: '/app/settings'
  }
];

const iconMap = {
  LayoutDashboard,
  Package,
  Wrench,
  BarChart3,
  Users,
  Settings
};

interface SidebarProps {
  isCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false }) => {
  const location = useLocation();

  const NavIcon = ({ iconName }: { iconName: string }) => {
    const Icon = iconMap[iconName as keyof typeof iconMap];
    return Icon ? <Icon size={20} /> : null;
  };

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary-600 rounded-xl flex items-center justify-center">
              <Package size={20} className="text-white" />
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-gray-900">Asset Manager</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navigationItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <div key={item.id}>
                <NavLink
                  to={item.path}
                  className={clsx(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive 
                      ? 'bg-primary-50 text-primary-700 shadow-soft' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  {/* Active indicator */}
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-600 rounded-r-full" />}
                  
                  <NavIcon iconName={item.icon} />
                  
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </NavLink>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export { Sidebar };
