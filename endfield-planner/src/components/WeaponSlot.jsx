import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Sword, X, RefreshCw, ChevronDown, Gem } from 'lucide-react';
import { WEAPONS, getWeaponsByType, getMaxLevel, parseWeaponSkills, ATK_SCALING } from '../data/weapons';
import useLocale from '../hooks/useLocale';

// Компонент полосок ранга (как в игре)
const RankBar = ({ current, max }) => (
  <div className="flex items-center gap-1">
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 w-3 rounded-sm transition-all ${
            i < current ? 'bg-amber-400' : 'bg-gray-700'
          }`}
        />
      ))}
    </div>
    <span className="text-[10px] text-gray-500 ml-1">{current}/{max}</span>
  </div>
);

// Компонент отображения навыка
const SkillDisplay = ({ name, rank, maxRank, value, isNamed }) => (
  <div className={`p-3 rounded-lg border ${isNamed ? 'bg-cyan-900/20 border-cyan-500/30' : 'bg-gray-800/30 border-gray-700/50'}`}>
    <div className="flex justify-between items-start mb-1">
      <span className={`text-[10px] ${isNamed ? 'text-cyan-400' : 'text-gray-500'}`}>
        ○ {name}
      </span>
      <RankBar current={rank} max={maxRank} />
    </div>
    <div className={`text-sm ${isNamed ? 'text-gray-300 leading-relaxed text-[11px]' : 'text-green-400 font-medium'}`}>
      {value}
    </div>
  </div>
);

// Эссенции - редкости с настраиваемыми бонусами
const ESSENCE_TYPES = {
  2: { name: 'Stable', color: '#4ade80', maxStats: 1,
       primaryRange: [1, 1], secondaryRange: [1, 1], passiveRange: [1, 1] },
  3: { name: 'Clean', color: '#60a5fa', maxStats: 2,
       primaryRange: [1, 2], secondaryRange: [1, 2], passiveRange: [1, 2] },
  4: { name: 'Pure', color: '#c084fc', maxStats: 3,
       primaryRange: [1, 3], secondaryRange: [1, 3], passiveRange: [1, 3] },
  5: { name: 'Flawless', color: '#fbbf24', maxStats: 3,
       primaryRange: [1, 6], secondaryRange: [1, 6], passiveRange: [1, 3] },
};

// Названия редкостей эссенций (используются как fallback)
const ESSENCE_NAMES = {
  'Stable': 'Стабильная',
  'Clean': 'Чистая',
  'Pure': 'Идеальная',
  'Flawless': 'Безупречная'
};

// РЕАЛЬНЫЕ СТАТЫ ИЗ ИГРЫ
const PRIMARY_STATS = [
  'Agility Boost',
  'Intellect Boost', 
  'Main Attribute Boost',
  'Strength Boost',
  'Will Boost'
];

const SECONDARY_STATS = [
  'ATK Boost',
  'Arts Boost',
  'Arts Intensity Boost',
  'Assault: Armament Prep',
  'Attack Boost',
  'Critical Rate Boost',
  'Cryo DMG Boost',
  'Electric DMG Boost',
  'HP Boost',
  'Heat DMG Boost',
  'Nature DMG Boost',
  'Physical DMG Boost',
  'Treatment Efficiency Boost',
  'Ultimate Gain Efficiency Boost'
];

const PASSIVE_PREFIXES = [
  'Brutality',
  'Combative',
  'Crusher',
  'Detonate',
  'Efficacy',
  'Flow',
  'Fracture',
  'Infliction',
  'Inspiring',
  'Medicant',
  'Pursuit',
  'Suppression',
  'Twilight'
];

// Извлечение базового названия стата (убираем [L], [M], [S])
const getBaseStatName = (statName) => {
  if (!statName) return null;
  return statName.replace(/\s*\[[LMS]\]$/i, '').trim();
};

// Извлечение префикса пассивки
const getPassivePrefix = (skill3Name) => {
  if (!skill3Name) return null;
  const colonIndex = skill3Name.indexOf(':');
  if (colonIndex === -1) return null;
  return skill3Name.substring(0, colonIndex).trim();
};

// Расчёт ATK по уровню с интерполяцией
const calculateATK = (attributesData, level) => {
  if (!attributesData || attributesData.length < 2) return 0;
  
  const headers = attributesData[0]; // ["", "Level 1", "Level 20", ...]
  const atkRow = attributesData[1];  // ["Base ATK", "42", "120", ...]
  
  // Контрольные точки
  const breakpoints = [
    { level: 1, index: 1 },
    { level: 20, index: 2 },
    { level: 40, index: 3 },
    { level: 60, index: 4 },
    { level: 80, index: 5 },
    { level: 90, index: 6 }
  ];
  
  // Находим диапазон
  let lowerBP = breakpoints[0];
  let upperBP = breakpoints[breakpoints.length - 1];
  
  for (let i = 0; i < breakpoints.length - 1; i++) {
    if (level >= breakpoints[i].level && level <= breakpoints[i + 1].level) {
      lowerBP = breakpoints[i];
      upperBP = breakpoints[i + 1];
      break;
    }
  }
  
  const lowerATK = parseInt(atkRow[lowerBP.index]) || 0;
  const upperATK = parseInt(atkRow[upperBP.index]) || 0;
  
  // Линейная интерполяция
  if (level === lowerBP.level) return lowerATK;
  if (level === upperBP.level) return upperATK;
  
  const levelRange = upperBP.level - lowerBP.level;
  const atkRange = upperATK - lowerATK;
  const progress = (level - lowerBP.level) / levelRange;
  
  return Math.round(lowerATK + atkRange * progress);
};

export const WeaponSlot = ({
  weapon,
  onSelect,
  weaponType,
  weaponLevel = 90,
  setWeaponLevel,
  tuningStage = 4,
  setTuningStage,
  potential = 0,
  setPotential,
  essence = null,
  setEssence,
}) => {
  const { t, translateWeaponName, translateWeaponType, translateEssenceBoost, translatePassivePrefix } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [showEssenceCreator, setShowEssenceCreator] = useState(false);
  const [newEssence, setNewEssence] = useState({ rarity: 3, stats: [] });
  const [weaponSkillsData, setWeaponSkillsData] = useState(null);
  const [weaponAttributesData, setWeaponAttributesData] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef(null);

  const availableWeapons = getWeaponsByType(weaponType);

  // Обновляем позицию дропдауна при открытии
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width
      });
    }
  }, [isOpen]);
  
  // Загрузка данных оружия (Skills + Attributes)
  useEffect(() => {
    if (!weapon) {
      setWeaponSkillsData(null);
      setWeaponAttributesData(null);
      return;
    }
    
    const loadWeaponData = async () => {
      const folderName = encodeURIComponent(weapon.name);
      const baseName = weapon.name.replace(/ /g, '-');
      
      // Загрузка обоих файлов параллельно
      let skillsData = null;
      let attrData = null;

      // Загрузка Skills
      try {
        const skillsResponse = await fetch(`/data/weapons/${folderName}/${encodeURIComponent(baseName + '_Skills.json')}`);
        if (skillsResponse.ok) {
          skillsData = await skillsResponse.json();
          setWeaponSkillsData(skillsData);
        } else {
          setWeaponSkillsData(null);
        }
      } catch (error) {
        setWeaponSkillsData(null);
      }
      
      // Загрузка Attributes
      try {
        const attrResponse = await fetch(`/data/weapons/${folderName}/${encodeURIComponent(baseName + '_Attributes.json')}`);
        if (attrResponse.ok) {
          attrData = await attrResponse.json();
          setWeaponAttributesData(attrData);
        } else {
          setWeaponAttributesData(null);
        }
      } catch (error) {
        setWeaponAttributesData(null);
      }

      // Обновляем weapon object со всеми загруженными данными
      if (skillsData || attrData) {
        onSelect({ ...weapon, skillsData, attributesData: attrData });
      }
    };

    loadWeaponData();
  }, [weapon?.id]);
  
  const getRarityStyle = (rarity) => ({
    6: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    5: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    4: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    3: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }[rarity] || 'bg-gray-500/20 text-gray-400 border-gray-500/30');
  
  const maxLevel = getMaxLevel(tuningStage);
  
  // ATK из реальных данных или fallback
  const currentATK = weaponAttributesData 
    ? calculateATK(weaponAttributesData, weaponLevel)
    : (weapon ? Math.round(weapon.baseAtk + (weaponLevel - 1) * (weapon.rarity === 6 ? 7 : weapon.rarity === 5 ? 6 : 5)) : 0);
  
  // Получаем данные навыков
  const getSkillInfo = () => {
    if (weaponSkillsData && weaponSkillsData.length > 1) {
      const headers = weaponSkillsData[0];
      const ranks = weaponSkillsData.slice(1);
      
      return {
        hasData: true,
        skill1Name: headers[1], // "Agility Boost [L]"
        skill2Name: headers[2], // "Attack Boost [L]"
        skill3Name: headers[3], // "Infliction: Long Time Wish"
        skill1Base: getBaseStatName(headers[1]), // "Agility Boost"
        skill2Base: getBaseStatName(headers[2]), // "Attack Boost"
        skill3Prefix: getPassivePrefix(headers[3]), // "Infliction"
        getSkill1Value: (rank) => ranks[rank - 1]?.[1] || '—',
        getSkill2Value: (rank) => ranks[rank - 1]?.[2] || '—',
        getSkill3Value: (rank) => ranks[rank - 1]?.[3] || '—',
      };
    }
    return { hasData: false };
  };
  
  const skillInfo = getSkillInfo();
  
  // ===== РАСЧЁТ РАНГОВ НАВЫКОВ =====
  const getSkillRanks = () => {
    let skill1Rank = 1;
    let skill2Rank = 1;
    let skill3Rank = 1;
    
    // Калибровка: T1→S1+1, T2→S2+1, T3→S1+1, T4→S2+1
    if (tuningStage >= 1) skill1Rank += 1;
    if (tuningStage >= 2) skill2Rank += 1;
    if (tuningStage >= 3) skill1Rank += 1;
    if (tuningStage >= 4) skill2Rank += 1;
    
    // Потенциал: каждый уровень 1-5 даёт +1 к Skill3
    skill3Rank += Math.min(potential, 5);
    
    // Эссенции - ТОЛЬКО ПО СОВПАДЕНИЮ НАЗВАНИЙ (с индивидуальными бонусами)
    if (essence?.stats && skillInfo.hasData) {
      essence.stats.forEach(stat => {
        const bonus = stat.bonus || 1; // Используем индивидуальный бонус стата

        // Primary Stats → Skill 1 (только если совпадает)
        if (PRIMARY_STATS.includes(stat.type)) {
          if (skillInfo.skill1Base === stat.type) {
            skill1Rank += bonus;
          }
        }
        // Secondary Stats → Skill 2 (только если совпадает)
        else if (SECONDARY_STATS.includes(stat.type)) {
          if (skillInfo.skill2Base === stat.type) {
            skill2Rank += bonus;
          }
        }
        // Passive Prefixes → Skill 3 (только если совпадает)
        else if (PASSIVE_PREFIXES.includes(stat.type)) {
          if (skillInfo.skill3Prefix === stat.type) {
            skill3Rank += bonus;
          }
        }
      });
    }
    
    // Максимум 9 для ВСЕХ навыков
    return {
      skill1: Math.min(skill1Rank, 9),
      skill2: Math.min(skill2Rank, 9),
      skill3: Math.min(skill3Rank, 9)
    };
  };
  
  const skillRanks = getSkillRanks();
  
  // Форматирование Named Skill
  const formatNamedSkill = (text) => {
    if (!text || text === '—') return text;
    return text.replace(/(\+?\d+(?:\.\d+)?%?)/g, '<span class="text-green-400">$1</span>');
  };
  
  // При открытии модалки загружаем текущую эссенцию если есть
  React.useEffect(() => {
    if (showEssenceCreator && essence) {
      setNewEssence({
        rarity: essence.rarity || 3,
        stats: essence.stats || []
      });
    } else if (showEssenceCreator && !essence) {
      setNewEssence({ rarity: 3, stats: [] });
    }
  }, [showEssenceCreator]);

  // Получить диапазон бонуса для типа стата
  const getBonusRange = (statType) => {
    const essenceType = ESSENCE_TYPES[newEssence.rarity];
    if (PRIMARY_STATS.includes(statType)) return essenceType.primaryRange;
    if (SECONDARY_STATS.includes(statType)) return essenceType.secondaryRange;
    if (PASSIVE_PREFIXES.includes(statType)) return essenceType.passiveRange;
    return [1, 1];
  };

  // Эссенции - функции
  const addEssenceStat = (statId) => {
    const maxStats = ESSENCE_TYPES[newEssence.rarity].maxStats;
    if (newEssence.stats.length >= maxStats) return;
    if (newEssence.stats.find(s => s.type === statId)) return;

    const range = getBonusRange(statId);
    const defaultBonus = range[1]; // По умолчанию максимальный бонус

    setNewEssence({
      ...newEssence,
      stats: [...newEssence.stats, { type: statId, bonus: defaultBonus }]
    });
  };

  // Изменить бонус стата
  const updateEssenceStatBonus = (index, newBonus) => {
    const updatedStats = [...newEssence.stats];
    updatedStats[index] = { ...updatedStats[index], bonus: newBonus };
    setNewEssence({ ...newEssence, stats: updatedStats });
  };
  
  const removeEssenceStat = (index) => {
    setNewEssence({
      ...newEssence,
      stats: newEssence.stats.filter((_, i) => i !== index)
    });
  };
  
  const applyEssence = () => {
    setEssence({
      ...newEssence,
      name: ESSENCE_TYPES[newEssence.rarity].name,
      color: ESSENCE_TYPES[newEssence.rarity].color
    });
    setShowEssenceCreator(false);
  };
  
  // Определяем какой бонус даст стат эссенции
  const getEssenceStatInfo = (statType, statBonus = null) => {
    if (PRIMARY_STATS.includes(statType)) {
      const matches = skillInfo.hasData && skillInfo.skill1Base === statType;
      return {
        target: 'Skill 1',
        bonus: matches ? (statBonus || 0) : 0,
        matches,
        weaponStat: skillInfo.skill1Base
      };
    }
    if (SECONDARY_STATS.includes(statType)) {
      const matches = skillInfo.hasData && skillInfo.skill2Base === statType;
      return {
        target: 'Skill 2',
        bonus: matches ? (statBonus || 0) : 0,
        matches,
        weaponStat: skillInfo.skill2Base
      };
    }
    if (PASSIVE_PREFIXES.includes(statType)) {
      const matches = skillInfo.hasData && skillInfo.skill3Prefix === statType;
      return {
        target: 'Skill 3',
        bonus: matches ? (statBonus || 0) : 0,
        matches,
        weaponStat: skillInfo.skill3Prefix
      };
    }
    return { target: '?', bonus: 0, matches: false };
  };
  
  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-800/50">
      <div className="flex items-center gap-2 mb-3">
        <Sword size={14} className="text-cyan-400" />
        <span className="text-xs uppercase tracking-wider text-gray-500">{t.weapons.weapon}</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
          {translateWeaponType(weaponType)}
        </span>
      </div>
      
      {/* Weapon Selector */}
      <div className="mb-4">
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
            weapon
              ? 'border-amber-500/40 bg-gradient-to-br from-gray-800/50 to-gray-900/90'
              : 'border-gray-700/50 bg-gray-900/30 border-dashed hover:border-gray-600'
          }`}
        >
          {weapon ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-gray-800/50">
                  <img 
                    src={`/data/weapons/${encodeURIComponent(weapon.name)}/${weapon.name.replace(/ /g, '_')}_icon.png`} 
                    alt={weapon.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<span class="text-cyan-400">⚔️</span>';
                    }}
                  />
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getRarityStyle(weapon.rarity)}`}>
                  {'★'.repeat(weapon.rarity)}
                </span>
              </div>
              <div className="flex-1">
                <span className="text-sm font-bold text-white">{translateWeaponName(weapon.name)}</span>
              </div>
              <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          ) : (
            <div className="text-sm text-gray-600 py-2 text-center">{t.weapons.selectWeapon}</div>
          )}
        </button>

        {/* Dropdown через Portal */}
        {isOpen && ReactDOM.createPortal(
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
            <div
              className="fixed z-[9999] max-h-72 overflow-y-auto bg-gray-900 border border-gray-700 rounded-xl shadow-2xl"
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width
              }}
            >
              <button
                onClick={() => { onSelect(null); setIsOpen(false); }}
                className="w-full p-2 text-left text-sm text-gray-400 hover:bg-gray-800/50 flex items-center gap-2 border-b border-gray-800"
              >
                <RefreshCw size={14} /> {t.common.reset}
              </button>

              {[6, 5, 4, 3].map(rarity => {
                const rarityWeapons = availableWeapons.filter(w => w.rarity === rarity);
                if (rarityWeapons.length === 0) return null;
                return (
                  <div key={rarity}>
                    <div className={`px-3 py-1 text-[10px] uppercase tracking-wider ${getRarityStyle(rarity).split(' ')[1]} bg-gray-800/50`}>
                      {rarity}★ ({rarityWeapons.length})
                    </div>
                    {rarityWeapons.map(w => (
                      <button
                        key={w.id}
                        onClick={() => { onSelect(w); setIsOpen(false); }}
                        className={`w-full p-3 text-left hover:bg-gray-800/50 border-b border-gray-800/30 ${
                          weapon?.id === w.id ? 'bg-cyan-500/10' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-gray-800/50 flex-shrink-0">
                            <img 
                              src={`/data/weapons/${encodeURIComponent(w.name)}/${w.name.replace(/ /g, '_')}_icon.png`} 
                              alt={w.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<span class="text-cyan-400 text-lg">⚔️</span>';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white truncate">{translateWeaponName(w.name)}</div>
                            <div className="text-[10px] text-gray-500">АТК {ATK_SCALING[w.rarity]?.base || 0}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </>,
          document.body
        )}
      </div>
      
      {weapon && (
        <>
          {/* ATK & Level */}
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg p-3 mb-3 border border-gray-700/50">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">{weaponLevel}</span>
                <span className="text-sm text-gray-500">/{maxLevel}</span>
                <span className="text-[10px] text-gray-600 ml-1">Ур.</span>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-500">Base ATK</div>
                <div className="text-lg font-bold text-red-400">{currentATK}</div>
              </div>
            </div>
            <input 
              type="range" 
              min="1" 
              max={maxLevel}
              value={weaponLevel}
              onChange={(e) => setWeaponLevel(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>
          
          {/* Tuning */}
          <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
            <div className="text-[10px] text-gray-500 mb-2">{t.weapons.tuning}</div>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(t => (
                <button
                  key={t}
                  onClick={() => {
                    setTuningStage(t);
                    const newMax = getMaxLevel(t);
                    if (weaponLevel > newMax) setWeaponLevel(newMax);
                  }}
                  className={`flex-1 h-8 flex items-center justify-center rounded transition-all ${
                    tuningStage >= t 
                      ? 'bg-gray-600 text-white' 
                      : 'bg-gray-800 text-gray-600'
                  }`}
                >
                  {t === 0 ? '—' : '▸'}
                </button>
              ))}
              <div className="w-8 h-8 flex items-center justify-center text-gray-600">+</div>
            </div>
          </div>
          
          {/* Potential & Essence Row */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {/* Potential */}
            <div className="bg-gray-800/50 rounded-lg p-2">
              <div className="text-[10px] text-gray-500 mb-2">{t.operators.potential}</div>
              <div className="flex gap-0.5">
                {[0, 1, 2, 3, 4, 5].map(p => (
                  <button
                    key={p}
                    onClick={() => setPotential(p)}
                    className={`flex-1 h-6 rounded text-[10px] transition-all ${
                      potential >= p 
                        ? 'bg-amber-500/40 text-amber-300' 
                        : 'bg-gray-700/50 text-gray-600'
                    }`}
                  >
                    {p || '—'}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Essence */}
            <div className="bg-gray-800/50 rounded-lg p-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  <Gem size={10} /> {t.essences.essence}
                </span>
                {essence && (
                  <button onClick={() => setEssence(null)} className="text-[9px] text-red-400 hover:text-red-300">✕</button>
                )}
              </div>
              {/* Кликабельные квадраты */}
              <button
                onClick={() => setShowEssenceCreator(true)}
                className="w-full flex gap-1 hover:opacity-80 transition-opacity"
              >
                {[0, 1, 2].map(i => {
                  const stat = essence?.stats?.[i];
                  const hasstat = !!stat;

                  return (
                    <div
                      key={i}
                      className={`flex-1 h-8 rounded border flex items-center justify-center transition-all ${
                        hasstat
                          ? 'border-solid'
                          : 'border-dashed border-gray-600 bg-gray-700/50'
                      }`}
                      style={hasstat ? {
                        backgroundColor: `${essence.color}20`,
                        borderColor: `${essence.color}50`,
                      } : {}}
                    >
                      {hasstat ? (
                        <span
                          className="text-[8px] font-medium truncate px-1"
                          style={{ color: essence.color }}
                        >
                          {translateEssenceBoost(stat.type).replace('Буст ', '')}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-600">+</span>
                      )}
                    </div>
                  );
                })}
              </button>
            </div>
          </div>
          
          {/* Skills Display - ВСЕ МАКСИМУМЫ = 9 */}
          {skillInfo.hasData ? (
            <div className="space-y-2">
              <SkillDisplay
                name={skillInfo.skill1Name}
                rank={skillRanks.skill1}
                maxRank={9}
                value={skillInfo.getSkill1Value(skillRanks.skill1)}
                isNamed={false}
              />
              
              <SkillDisplay
                name={skillInfo.skill2Name}
                rank={skillRanks.skill2}
                maxRank={9}
                value={skillInfo.getSkill2Value(skillRanks.skill2)}
                isNamed={false}
              />
              
              <div className="p-3 rounded-lg border bg-cyan-900/20 border-cyan-500/30">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] text-cyan-400">
                    ○ {skillInfo.skill3Name}
                  </span>
                  <RankBar current={skillRanks.skill3} max={9} />
                </div>
                <div 
                  className="text-[11px] text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatNamedSkill(skillInfo.getSkill3Value(skillRanks.skill3)) }}
                />
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg border border-gray-700/50 bg-gray-800/30 text-center">
              <div className="text-xs text-gray-500">Данные навыков загружаются...</div>
            </div>
          )}
        </>
      )}
      
      {/* Essence Creator Modal */}
      {showEssenceCreator && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50" onClick={() => setShowEssenceCreator(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[420px] bg-gray-900 border border-gray-700 rounded-2xl p-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Gem className="text-purple-400" size={16} /> {t.essences?.selectEssence || 'Создать эссенцию'}
              </h3>
              <button onClick={() => setShowEssenceCreator(false)} className="text-gray-500 hover:text-white">
                <X size={18} />
              </button>
            </div>
            
            {/* Текущее оружие и его статы */}
            {skillInfo.hasData && (
              <div className="mb-4 p-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <div className="text-[9px] text-gray-400 mb-1">{t.essences?.weaponStats || 'Статы оружия'}:</div>
                <div className="grid grid-cols-3 gap-1 text-[10px]">
                  <div className="bg-amber-900/30 rounded px-2 py-1 text-amber-300">{translateEssenceBoost(skillInfo.skill1Base)}</div>
                  <div className="bg-blue-900/30 rounded px-2 py-1 text-blue-300">{translateEssenceBoost(skillInfo.skill2Base)}</div>
                  <div className="bg-cyan-900/30 rounded px-2 py-1 text-cyan-300">{translatePassivePrefix(skillInfo.skill3Prefix)}</div>
                </div>
              </div>
            )}
            
            {/* Rarity */}
            <div className="mb-4">
              <div className="text-[10px] text-gray-400 mb-2">{t.essences?.rarity || 'Редкость'}</div>
              <div className="grid grid-cols-4 gap-1">
                {[2, 3, 4, 5].map(r => (
                  <button
                    key={r}
                    onClick={() => setNewEssence({ rarity: r, stats: [] })}
                    className={`py-2 rounded text-[10px] font-medium border transition-all ${
                      newEssence.rarity === r ? 'ring-1 ring-white/30' : 'opacity-50'
                    }`}
                    style={{
                      backgroundColor: `${ESSENCE_TYPES[r].color}20`,
                      color: ESSENCE_TYPES[r].color,
                      borderColor: `${ESSENCE_TYPES[r].color}40`,
                    }}
                  >
                    {t.essences?.[ESSENCE_TYPES[r].name.toLowerCase()] || ESSENCE_NAMES[ESSENCE_TYPES[r].name] || ESSENCE_TYPES[r].name}
                  </button>
                ))}
              </div>
              <div className="text-[9px] text-gray-500 mt-1">
                {t.essences?.statsCount || 'Статов'}: {ESSENCE_TYPES[newEssence.rarity].maxStats} |
                {' '}{t.essences?.attributes || 'Атрибуты'}: +{ESSENCE_TYPES[newEssence.rarity].primaryRange[0]}-{ESSENCE_TYPES[newEssence.rarity].primaryRange[1]} |
                {' '}{t.essences?.passives || 'Пассивки'}: +{ESSENCE_TYPES[newEssence.rarity].passiveRange[0]}-{ESSENCE_TYPES[newEssence.rarity].passiveRange[1]}
              </div>
            </div>
            
            {/* Selected Stats - Visual Slots */}
            <div className="mb-4">
              <div className="text-[10px] text-gray-400 mb-2">
                {t.essences?.slots || 'Слоты эссенции'} ({newEssence.stats.length}/{ESSENCE_TYPES[newEssence.rarity].maxStats})
              </div>
              {/* Визуальные слоты */}
              <div className="flex gap-2 mb-3">
                {Array.from({ length: ESSENCE_TYPES[newEssence.rarity].maxStats }).map((_, i) => {
                  const stat = newEssence.stats[i];
                  const info = stat ? getEssenceStatInfo(stat.type, stat.bonus) : null;
                  const range = stat ? getBonusRange(stat.type) : [1, 1];

                  return (
                    <div
                      key={i}
                      className={`flex-1 min-h-[80px] rounded-lg border-2 flex flex-col items-center justify-center p-2 transition-all ${
                        stat
                          ? info?.matches
                            ? 'border-green-500/50 bg-green-900/20'
                            : 'border-red-500/50 bg-red-900/20'
                          : 'border-dashed border-gray-600 bg-gray-800/30'
                      }`}
                    >
                      {stat ? (
                        <>
                          <span className="text-[9px] text-center text-white font-medium leading-tight">
                            {translateEssenceBoost(stat.type).replace('Буст ', '')}
                          </span>

                          {/* Выбор бонуса */}
                          {range[0] !== range[1] ? (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-[8px] text-gray-400">+</span>
                              <select
                                value={stat.bonus || range[1]}
                                onChange={(e) => updateEssenceStatBonus(i, parseInt(e.target.value))}
                                className="bg-gray-800 border border-gray-600 rounded text-[10px] text-white px-1 py-0.5 w-10 text-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {Array.from({ length: range[1] - range[0] + 1 }, (_, j) => range[0] + j).map(val => (
                                  <option key={val} value={val}>{val}</option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <span className="text-[9px] text-gray-400 mt-1">+{range[0]}</span>
                          )}

                          {info?.matches ? (
                            <span className="text-[8px] text-green-400 mt-1">→ S{info.target.replace('Skill ', '')}</span>
                          ) : (
                            <span className="text-[8px] text-red-400 mt-1">✕ нет совпадения</span>
                          )}
                          <button
                            onClick={() => removeEssenceStat(i)}
                            className="text-[8px] text-gray-500 hover:text-red-400 mt-1"
                          >
                            {t.essences?.remove || 'удалить'}
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-gray-600">{t.essences?.empty || 'Пусто'}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Available Stats */}
            <div className="space-y-3 mb-4">
              {/* Primary Stats → Skill 1 */}
              <div>
                <div className="text-[9px] text-amber-400 mb-1">
                  {t.essences?.attributes || 'Атрибуты'} → {t.essences?.skill || 'Навык'} 1 (+{ESSENCE_TYPES[newEssence.rarity].primaryBonus})
                  {skillInfo.hasData && <span className="text-gray-500 ml-1">({t.essences?.match || 'совпадение'}: {translateEssenceBoost(skillInfo.skill1Base)})</span>}
                </div>
                <div className="flex flex-wrap gap-1">
                  {PRIMARY_STATS.map(stat => {
                    const isMatching = skillInfo.hasData && skillInfo.skill1Base === stat;
                    return (
                      <button
                        key={stat}
                        onClick={() => addEssenceStat(stat)}
                        disabled={newEssence.stats.length >= ESSENCE_TYPES[newEssence.rarity].maxStats || newEssence.stats.find(s => s.type === stat)}
                        className={`px-2 py-1 text-[9px] rounded border disabled:opacity-30 transition-all ${
                          isMatching
                            ? 'bg-amber-600/40 hover:bg-amber-500/50 text-amber-200 border-amber-400/50 ring-1 ring-amber-400/30'
                            : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 border-gray-600/30'
                        }`}
                      >
                        {translateEssenceBoost(stat)}{isMatching && ' ✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Secondary Stats → Skill 2 */}
              <div>
                <div className="text-[9px] text-blue-400 mb-1">
                  {t.essences?.secondary || 'Вторичные'} → {t.essences?.skill || 'Навык'} 2 (+{ESSENCE_TYPES[newEssence.rarity].secondaryBonus})
                  {skillInfo.hasData && <span className="text-gray-500 ml-1">({t.essences?.match || 'совпадение'}: {translateEssenceBoost(skillInfo.skill2Base)})</span>}
                </div>
                <div className="flex flex-wrap gap-1">
                  {SECONDARY_STATS.map(stat => {
                    const isMatching = skillInfo.hasData && skillInfo.skill2Base === stat;
                    return (
                      <button
                        key={stat}
                        onClick={() => addEssenceStat(stat)}
                        disabled={newEssence.stats.length >= ESSENCE_TYPES[newEssence.rarity].maxStats || newEssence.stats.find(s => s.type === stat)}
                        className={`px-2 py-1 text-[9px] rounded border disabled:opacity-30 transition-all ${
                          isMatching
                            ? 'bg-blue-600/40 hover:bg-blue-500/50 text-blue-200 border-blue-400/50 ring-1 ring-blue-400/30'
                            : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 border-gray-600/30'
                        }`}
                      >
                        {translateEssenceBoost(stat)}{isMatching && ' ✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Passive Prefixes → Skill 3 */}
              <div>
                <div className="text-[9px] text-cyan-400 mb-1">
                  {t.essences?.passives || 'Пассивки'} → {t.essences?.skill || 'Навык'} 3 (+{ESSENCE_TYPES[newEssence.rarity].passiveBonus})
                  {skillInfo.hasData && <span className="text-gray-500 ml-1">({t.essences?.match || 'совпадение'}: {translatePassivePrefix(skillInfo.skill3Prefix)})</span>}
                </div>
                <div className="flex flex-wrap gap-1">
                  {PASSIVE_PREFIXES.map(prefix => {
                    const isMatching = skillInfo.hasData && skillInfo.skill3Prefix === prefix;
                    return (
                      <button
                        key={prefix}
                        onClick={() => addEssenceStat(prefix)}
                        disabled={newEssence.stats.length >= ESSENCE_TYPES[newEssence.rarity].maxStats || newEssence.stats.find(s => s.type === prefix)}
                        className={`px-2 py-1 text-[9px] rounded border disabled:opacity-30 transition-all ${
                          isMatching
                            ? 'bg-cyan-600/40 hover:bg-cyan-500/50 text-cyan-200 border-cyan-400/50 ring-1 ring-cyan-400/30' 
                            : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 border-gray-600/30'
                        }`}
                      >
                        {translatePassivePrefix(prefix)}{isMatching && ' ✓'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <button
              onClick={applyEssence}
              disabled={newEssence.stats.length === 0}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-all"
            >
              {t.essences?.apply || 'Применить'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default WeaponSlot;
