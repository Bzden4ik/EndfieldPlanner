import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, RefreshCw } from 'lucide-react';
import { getEquipmentBySlot, GEAR_SETS, calculateEquipmentStats } from '../data/gear';
import ItemStatsDisplay from './ItemStatsDisplay';

// Set colors for visual styling
const SET_COLORS = {
  'Æthertech': '#8b5cf6',
  'Bonekrusha': '#ef4444',
  'Eternal Xiranite': '#06b6d4',
  'Frontiers': '#f59e0b',
  'Hot Work': '#dc2626',
  'LYNX': '#10b981',
  'MI Security': '#6366f1',
  'Pulser Labs': '#ec4899',
  'Swordmancer': '#f97316',
  'Tide Surge': '#3b82f6',
  'Type 50 Yinglung': '#a855f7'
};

export const GearSlot = ({ type, item, onSelect, equipmentLoaded, upgrades = {}, setUpgrades }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [availableItems, setAvailableItems] = useState([]);
  const [hoveredSet, setHoveredSet] = useState(null);
  const [showUpgrades, setShowUpgrades] = useState(false);
  const buttonRef = React.useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, maxHeight: 384 });

  // Calculate dropdown position when opening
  const handleOpen = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 320; // w-80 = 320px
      
      // Always show below button
      let top = rect.bottom + 8;
      let left = rect.left;
      
      // Calculate max height available below button
      const spaceBelow = window.innerHeight - top - 16; // 16px padding
      const maxHeight = Math.min(384, spaceBelow); // max-h-96 = 384px
      
      // Check if dropdown goes off-screen to the right
      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 16; // 16px padding
      }
      
      setDropdownPosition({ top, left, maxHeight });
    }
    setIsOpen(true);
  };

  useEffect(() => {
    // Load available items for this slot when equipment is loaded
    if (equipmentLoaded) {
      const items = getEquipmentBySlot(type);
      setAvailableItems(items);
    }
  }, [type, equipmentLoaded]);
  
  // Handle stat upgrade level change
  const handleUpgradeChange = (statName, newLevel) => {
    if (!setUpgrades) return;
    
    setUpgrades(prev => ({
      ...prev,
      [statName]: newLevel
    }));
  };
  
  // Get upgradeable stats from item
  const getUpgradeableStats = () => {
    if (!item || !item._raw || !item._raw.statUpgrades) return [];
    
    return Object.keys(item._raw.statUpgrades).filter(statName => statName !== 'DEF');
  };

  const setColor = item ? (SET_COLORS[item.set] || '#f59e0b') : undefined;
  
  // Calculate final stats with upgrades applied
  const displayStats = React.useMemo(() => {
    if (!item) return null;
    if (!upgrades || Object.keys(upgrades).length === 0) return item.stats;
    return calculateEquipmentStats(item, upgrades);
  }, [item, upgrades]);
  
  return (
    <div className="relative">
      <div
        ref={buttonRef}
        onClick={handleOpen}
        className={`w-full p-3 rounded-xl border-2 cursor-pointer transition-all ${
          item 
            ? 'border-opacity-50 bg-gradient-to-br from-gray-800/90 to-gray-900/90' 
            : 'border-gray-700/50 bg-gray-900/30 border-dashed hover:border-gray-600'
        }`}
        style={{ borderColor: item ? setColor + '80' : undefined }}
      >
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider text-gray-500">{type}</span>
            {item && (
              <span 
                className="text-[10px] px-2 py-0.5 rounded-full" 
                style={{ backgroundColor: setColor + '20', color: setColor }}
              >
                Lv.70
              </span>
            )}
          </div>
          {item ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-12 h-12 rounded-lg bg-gray-800/80 p-1.5 flex-shrink-0 flex items-center justify-center">
                  <img 
                    src={`/data/gear/icons/${item.icon}`}
                    alt={item.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<span class="text-gray-600">📦</span>';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white mb-0.5">{item.name}</div>
                  <div 
                    className="text-[10px] font-medium px-2 py-0.5 rounded inline-block"
                    style={{ 
                      backgroundColor: `${setColor}20`,
                      color: setColor,
                      border: `1px solid ${setColor}40`
                    }}
                  >
                    {item.set}
                  </div>
                </div>
              </div>
              <ItemStatsDisplay stats={displayStats} compact />
            </>
          ) : (
            <div className="text-sm text-gray-600 py-3">Выбрать {type}</div>
          )}
        </div>
        
        {/* Upgrade button - outside main click area */}
        {item && getUpgradeableStats().length > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowUpgrades(!showUpgrades); }}
            className="mt-2 w-full py-1.5 text-[10px] rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 transition-all"
          >
            {showUpgrades ? '▲ Скрыть улучшения' : '▼ Улучшения статов'}
          </button>
        )}
      </div>
      
      {/* Upgrades panel */}
      {showUpgrades && item && (
        <div className="mt-2 p-3 bg-gray-800/50 border border-cyan-500/30 rounded-lg space-y-2">
          <div className="text-[10px] uppercase text-cyan-400 mb-2 font-semibold">Улучшение статов (0 → +3)</div>
          {getUpgradeableStats().map(statName => {
            const currentLevel = upgrades[statName] || 0;
            const baseValue = item._raw.baseStats[statName];
            const delta1 = item._raw.statUpgrades[statName]?.['+1'] || '0';
            const delta2 = item._raw.statUpgrades[statName]?.['+2'] || '0';
            const delta3 = item._raw.statUpgrades[statName]?.['+3'] || '0';
            
            return (
              <div key={statName} className="p-2 bg-gray-900/50 rounded">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-gray-300 font-medium">{statName}</span>
                  <span className="text-[10px] text-gray-500">
                    {baseValue} → {currentLevel === 1 && `+${delta1}`}
                    {currentLevel === 2 && `+${delta2}`}
                    {currentLevel === 3 && `+${delta3}`}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map(level => (
                    <button
                      key={level}
                      onClick={() => handleUpgradeChange(statName, level)}
                      className={`flex-1 py-1 px-2 text-[10px] font-bold rounded transition-all ${
                        currentLevel === level
                          ? 'bg-cyan-500 text-black shadow-lg'
                          : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                      }`}
                    >
                      {level === 0 ? 'Base' : `+${level}`}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {isOpen && createPortal(
        <>
          <div className="fixed inset-0 z-[9999]" onClick={() => setIsOpen(false)} />
          <div 
            className="fixed z-[10000] w-80 overflow-y-auto bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl"
            style={{ 
              top: `${dropdownPosition.top}px`, 
              left: `${dropdownPosition.left}px`,
              maxHeight: `${dropdownPosition.maxHeight}px`
            }}
          >
            <div className="sticky top-0 bg-gray-900/95 border-b border-gray-800 p-3 flex justify-between">
              <span className="text-sm font-medium text-gray-300">{type}</span>
              <button 
                onClick={() => { onSelect(null); setIsOpen(false); }} 
                className="text-gray-500 hover:text-white transition-colors"
              >
                <RefreshCw size={14} />
              </button>
            </div>
            
            {!equipmentLoaded ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Загрузка снаряжения...
              </div>
            ) : availableItems.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Нет доступных предметов
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {availableItems.map((availableItem, index) => {
                  const itemSetColor = SET_COLORS[availableItem.set] || '#f59e0b';
                  return (
                    <button 
                      key={`${availableItem.id}-${index}`}
                      onClick={() => { onSelect(availableItem); setIsOpen(false); }} 
                      className={`w-full p-3 rounded-lg text-left transition-all hover:bg-gray-800/50 border ${
                        item?.id === availableItem.id 
                          ? 'bg-amber-500/10 border-amber-500/30' 
                          : 'border-transparent hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-14 h-14 rounded-lg bg-gray-800/80 p-1.5 flex-shrink-0 flex items-center justify-center">
                          <img 
                            src={`/data/gear/icons/${availableItem.icon}`}
                            alt={availableItem.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<span class="text-gray-600">📦</span>';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-white mb-0.5">{availableItem.name}</div>
                          <div 
                            className="text-[11px] font-medium px-2 py-0.5 rounded inline-block cursor-help relative group"
                            style={{ 
                              backgroundColor: `${itemSetColor}20`,
                              color: itemSetColor,
                              border: `1px solid ${itemSetColor}40`
                            }}
                            onMouseEnter={() => setHoveredSet(availableItem.set)}
                            onMouseLeave={() => setHoveredSet(null)}
                          >
                            {availableItem.set}
                            
                            {/* Tooltip */}
                            {hoveredSet === availableItem.set && GEAR_SETS[availableItem.set] && (
                              <div className="absolute left-0 top-full mt-2 w-80 p-3 bg-gray-900 border border-amber-500/30 rounded-lg shadow-xl z-50 text-left">
                                <div className="text-xs font-bold text-amber-400 mb-2">3-piece set effect:</div>
                                <div className="text-[11px] text-green-400 mb-1">
                                  • Wearer's ATK +{GEAR_SETS[availableItem.set].baseBonus?.atkPercent || 0}%
                                </div>
                                {GEAR_SETS[availableItem.set].conditionalBonus?.description && (
                                  <div className="text-[11px] text-gray-300 leading-relaxed">
                                    • When {GEAR_SETS[availableItem.set].conditionalBonus.description}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <ItemStatsDisplay stats={availableItem.stats} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default GearSlot;
