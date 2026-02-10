import React from 'react';

export const StatBar = ({ label, value, max, color, bonus = 0 }) => (
  <div className="mb-2">
    <div className="flex justify-between items-center mb-1">
      <span className="text-xs text-gray-400">{label}</span>
      <div className="flex items-center gap-1">
        <span className="text-sm font-bold text-white">
          {typeof value === 'number' ? value.toFixed(1) : value}
        </span>
        {bonus > 0 && (
          <span className="text-xs text-green-400">(+{bonus.toFixed(1)})</span>
        )}
      </div>
    </div>
    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full ${color} transition-all duration-500`} 
        style={{ width: `${Math.min((parseFloat(value) / max) * 100, 100)}%` }} 
      />
    </div>
  </div>
);

export default StatBar;
