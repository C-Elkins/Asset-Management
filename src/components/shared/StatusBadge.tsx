import React from 'react';

interface StatusBadgeProps {
  status: string;
  colorMap?: Record<string, string>;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const defaultColorMap: Record<string, string> = {
  // Common statuses
  'active': 'bg-green-100 text-green-800 border-green-300',
  'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'approved': 'bg-green-100 text-green-800 border-green-300',
  'rejected': 'bg-red-100 text-red-800 border-red-300',
  'cancelled': 'bg-gray-100 text-gray-800 border-gray-300',
  'completed': 'bg-blue-100 text-blue-800 border-blue-300',
  'expired': 'bg-red-100 text-red-800 border-red-300',
  'available': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'assigned': 'bg-indigo-100 text-indigo-800 border-indigo-300',
  'maintenance': 'bg-orange-100 text-orange-800 border-orange-300',
  'confirmed': 'bg-blue-100 text-blue-800 border-blue-300',
  'overdue': 'bg-red-100 text-red-800 border-red-300',
  'returned': 'bg-gray-100 text-gray-800 border-gray-300',
  'renewed': 'bg-blue-100 text-blue-800 border-blue-300',
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  colorMap,
  icon,
  size = 'md'
}) => {
  const colors = colorMap || defaultColorMap;
  const colorClass = colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded border ${sizeClasses[size]} ${colorClass}`}
    >
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
    </span>
  );
};
