import React from 'react';

const POTENTIAL_COLORS = [
  { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', ring: 'ring-amber-500' },
  { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', ring: 'ring-amber-500' },
  { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400', ring: 'ring-orange-500' },
  { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400', ring: 'ring-red-500' },
  { bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-400', ring: 'ring-purple-500' }
];

export default function PotentialPanel({ potentialData, tokenIcon, potentialLevel, setPotentialLevel }) {
  if (!potentialData) {
    return (
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-800/50">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
          ✦ Potential
        </h3>
        <div className="text-sm text-gray-600 italic">No potential data available</div>
      </div>
    );
  }

  const upgrades = potentialData.upgrades;
  const entries = Object.entries(upgrades);

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-800/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 flex items-center gap-2">
          ✦ Potential
        </h3>
        {/* Token icon + cost */}
        <div className="flex items-center gap-1.5">
          {tokenIcon && (
            <img
              src={tokenIcon}
              alt="Token"
              className="w-6 h-6 object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          <span className="text-[10px] text-gray-500">×5</span>
        </div>
      </div>

      {/* Potential level selector */}
      <div className="flex gap-1.5 mb-4">
        {/* Level 0 = no potential */}
        <button
          onClick={() => setPotentialLevel(0)}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
            potentialLevel === 0
              ? 'bg-gray-700/60 ring-1 ring-gray-500 text-gray-300'
              : 'bg-gray-800/40 text-gray-600 hover:text-gray-400 hover:bg-gray-800/60'
          }`}
        >
          0
        </button>
        {entries.map((_, i) => {
          const lvl = i + 1;
          const colors = POTENTIAL_COLORS[i];
          const isActive = potentialLevel >= lvl;
          const isSelected = potentialLevel === lvl;
          return (
            <button
              key={lvl}
              onClick={() => setPotentialLevel(lvl)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isSelected
                  ? `${colors.bg} ring-1 ${colors.ring} ${colors.text}`
                  : isActive
                    ? `${colors.bg} ${colors.text} opacity-70`
                    : 'bg-gray-800/40 text-gray-600 hover:text-gray-400 hover:bg-gray-800/60'
              }`}
            >
              {lvl}
            </button>
          );
        })}
      </div>

      {/* Potential upgrades list */}
      <div className="space-y-2">
        {entries.map(([key, data], i) => {
          const lvl = i + 1;
          const isUnlocked = potentialLevel >= lvl;
          const colors = POTENTIAL_COLORS[i];

          return (
            <div
              key={key}
              className={`rounded-lg p-2.5 border transition-all ${
                isUnlocked
                  ? `${colors.bg} ${colors.border}`
                  : 'bg-gray-800/20 border-gray-800/30 opacity-40'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isUnlocked ? colors.text : 'text-gray-600'}`}>
                  P{lvl}
                </span>
                <span className={`text-xs font-semibold ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                  {data.title}
                </span>
              </div>
              <div className={`text-[11px] leading-relaxed ${isUnlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                {data.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
