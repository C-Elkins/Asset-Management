import React from 'react';
import { X } from 'lucide-react';

interface ManagerHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  gradientFrom?: string;
  gradientTo?: string;
  onClose?: () => void;
  actions?: React.ReactNode;
}

const gradientClasses: Record<string, string> = {
  'blue-600-cyan-600': 'bg-gradient-to-r from-blue-600 to-cyan-600',
  'purple-600-indigo-600': 'bg-gradient-to-r from-purple-600 to-indigo-600',
  'red-600-orange-600': 'bg-gradient-to-r from-red-600 to-orange-600',
  'green-600-emerald-600': 'bg-gradient-to-r from-green-600 to-emerald-600',
  'indigo-600-purple-600': 'bg-gradient-to-r from-indigo-600 to-purple-600',
};

const subtitleClasses: Record<string, string> = {
  'blue-600': 'text-blue-100',
  'purple-600': 'text-purple-100',
  'red-600': 'text-red-100',
  'green-600': 'text-green-100',
  'indigo-600': 'text-indigo-100',
};

export const ManagerHeader: React.FC<ManagerHeaderProps> = ({
  title,
  subtitle,
  icon,
  gradientFrom = 'blue-600',
  gradientTo = 'cyan-600',
  onClose,
  actions,
}) => {
  const gradientKey = `${gradientFrom}-${gradientTo}`;
  const gradientClass = gradientClasses[gradientKey] || gradientClasses['blue-600-cyan-600'];
  const subtitleClass = subtitleClasses[gradientFrom] || 'text-blue-100';

  return (
    <div className={`${gradientClass} text-white px-6 py-4 flex justify-between items-center`}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {subtitle && (
            <p className={`${subtitleClass} text-sm mt-0.5`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {onClose && (
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            title="Close"
          >
            <X size={24} />
          </button>
        )}
      </div>
    </div>
  );
};
