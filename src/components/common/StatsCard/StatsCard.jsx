// En src/components/common/StatsCard/StatsCard.jsx
import React from 'react';

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue',
  subtitle = '',
  subtitleColor = 'gray',
  subtitleIcon: SubtitleIcon,
  className = "",
  ...props 
}) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    red: 'bg-red-500 text-white',
    purple: 'bg-purple-500 text-white',
    yellow: 'bg-yellow-500 text-white',
    indigo: 'bg-indigo-500 text-white',
    pink: 'bg-pink-500 text-white',
  };

  const subtitleColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    yellow: 'text-yellow-600',
    gray: 'text-gray-500',
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`} {...props}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className={`text-sm mt-1 flex items-center ${subtitleColorClasses[subtitleColor]}`}>
              {SubtitleIcon && <SubtitleIcon className="h-3 w-3 mr-1" />}
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
};

export default React.memo(StatsCard);