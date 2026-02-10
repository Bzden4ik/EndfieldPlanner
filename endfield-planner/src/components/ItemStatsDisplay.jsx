import React from 'react';
import { STAT_NAMES, isPercentStat } from '../data/constants';

export const ItemStatsDisplay = ({ stats, compact = false }) => {
  if (!stats) return null;
  const entries = Object.entries(stats).filter(([k, v]) => v !== undefined && v !== 0);
  
  if (compact) {
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {entries.map(([key, value]) => (
          <span key={key} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-300">
            {STAT_NAMES[key] || key}: <span className="text-amber-400">+{value}{isPercentStat(key) ? '%' : ''}</span>
          </span>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-1.5 mt-2 p-2 bg-gray-800/30 rounded-lg">
      {entries.map(([key, value]) => (
        <div key={key} className="flex justify-between items-center text-xs">
          <span className="text-gray-400">{STAT_NAMES[key] || key}</span>
          <span className="text-white font-medium">+{value}{isPercentStat(key) ? '%' : ''}</span>
        </div>
      ))}
    </div>
  );
};

export default ItemStatsDisplay;
