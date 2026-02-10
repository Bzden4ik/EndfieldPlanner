import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TYPE_COLORS = {
  'Basic Attack': { bg: 'bg-gray-500/20', border: 'border-gray-500/40', text: 'text-gray-300' },
  'Battle Skill': { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-400' },
  'Combo Skill': { bg: 'bg-cyan-500/20', border: 'border-cyan-500/40', text: 'text-cyan-400' },
  'Ultimate': { bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-400' }
};

// Parse skill name and description from the description field
const parseDescription = (desc) => {
  if (!desc) return { sections: [] };
  const sections = [];
  // Split by known headers like "BASIC ATTACK:", "DIVE ATTACK:", "FINISHER:", "SKILL DESCRIPTION:", "COMBO TRIGGER:"
  const headerRegex = /([A-Z][A-Z\s]+):\s*\n?/g;
  let lastIndex = 0;
  let match;
  const matches = [];
  while ((match = headerRegex.exec(desc)) !== null) {
    matches.push({ header: match[1].trim(), index: match.index, end: match.index + match[0].length });
  }
  for (let i = 0; i < matches.length; i++) {
    const textEnd = i + 1 < matches.length ? matches[i + 1].index : desc.length;
    const text = desc.substring(matches[i].end, textEnd).trim();
    sections.push({ header: matches[i].header, text });
  }
  if (matches.length === 0 && desc.trim()) {
    sections.push({ header: null, text: desc.trim() });
  }
  return { sections };
};

export default function SkillsPanel({ skills, skillIcons, skillLevels, setSkillLevels }) {
  const [expandedSkill, setExpandedSkill] = useState(null);

  if (!skills) {
    return (
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-800/50">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
          ⚔️ Combat Skills
        </h3>
        <div className="text-sm text-gray-600 italic">No skill data available for this operator</div>
      </div>
    );
  }

  const skillEntries = Object.entries(skills);

  const handleLevelChange = (skillName, newLevel) => {
    setSkillLevels(prev => ({ ...prev, [skillName]: newLevel }));
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-800/50">
      <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
        ⚔️ Combat Skills
      </h3>
      <div className="space-y-3">
        {skillEntries.map(([skillName, skillData], index) => {
          const type = skillData.type;
          const colors = TYPE_COLORS[type] || TYPE_COLORS['Basic Attack'];
          const iconSrc = skillIcons?.[type];
          const currentLevel = skillLevels[skillName] || 1;
          const isExpanded = expandedSkill === skillName;
          const { sections } = parseDescription(skillData.description);
          const stats = skillData.stats;

          return (
            <div key={skillName} className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden transition-all`}>
              {/* Skill Header */}
              <button
                onClick={() => setExpandedSkill(isExpanded ? null : skillName)}
                className="w-full p-3 flex items-center gap-3 text-left hover:bg-white/5 transition-colors"
              >
                {/* Icon */}
                <div className="w-11 h-11 rounded-lg bg-gray-800/80 border border-gray-700/50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {iconSrc ? (
                    <img
                      src={iconSrc}
                      alt={skillName}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<span class="text-lg">⚔️</span>';
                      }}
                    />
                  ) : (
                    <span className="text-lg">⚔️</span>
                  )}
                </div>

                {/* Name + Type */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{skillName}</div>
                  <div className={`text-[10px] uppercase tracking-wider ${colors.text}`}>{type}</div>
                </div>

                {/* Level Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Lv.</span>
                  <span className={`text-sm font-bold ${colors.text}`}>{currentLevel}</span>
                  {isExpanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-3 pb-3 space-y-3">
                  {/* Level Selector */}
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase mb-1.5">Skill Level</div>
                    <div className="grid grid-cols-12 gap-1">
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(lvl => (
                        <button
                          key={lvl}
                          onClick={() => handleLevelChange(skillName, lvl)}
                          className={`py-1 text-xs rounded transition-all ${
                            lvl === currentLevel
                              ? `${colors.bg} ring-1 ring-current ${colors.text} font-bold`
                              : 'bg-gray-800/60 text-gray-500 hover:text-gray-300 hover:bg-gray-700/60'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="text-xs text-gray-400 leading-relaxed space-y-1.5">
                    {sections.map((sec, i) => (
                      <div key={i}>
                        {sec.header && (
                          <span className="text-gray-300 font-semibold">{sec.header}: </span>
                        )}
                        <span>{sec.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Stats Table */}
                  {stats && Object.keys(stats).length > 0 && (
                    <div className="rounded-lg bg-gray-950/50 border border-gray-800/50 overflow-hidden">
                      <table className="w-full text-xs">
                        <tbody>
                          {Object.entries(stats).map(([statName, values]) => (
                            <tr key={statName} className="border-b border-gray-800/30 last:border-b-0">
                              <td className="py-1.5 px-2 text-gray-400 whitespace-nowrap">{statName}</td>
                              <td className={`py-1.5 px-2 text-right font-mono font-semibold ${colors.text}`}>
                                {values[currentLevel - 1]}
                              </td>
                              {currentLevel < 12 && (
                                <td className="py-1.5 px-1 text-right text-[10px] text-gray-600 whitespace-nowrap">
                                  → {values[11]}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
