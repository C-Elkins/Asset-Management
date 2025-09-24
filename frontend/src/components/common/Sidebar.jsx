import React from 'react';
  import { NavLink } from 'react-router-dom';

  export const Sidebar = () => {
  const menuItems = [
      { to: '/app/dashboard', label: 'Dashboard', icon: '\ud83d\udcca' },
      { to: '/app/assets', label: 'Assets', icon: '\ud83d\udcbb' },
      { to: '/app/maintenance', label: 'Maintenance', icon: '\ud83d\uddd7' },
      { to: '/app/reports', label: 'Reports', icon: '\ud83d\udcc8' },
      { to: '/app/settings', label: 'Settings', icon: '\u2699\ufe0f' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>IT Assets</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map(item => (
            <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
