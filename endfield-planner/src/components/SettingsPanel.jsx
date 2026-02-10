import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Check, Sword, Info, Zap, Target, Shield, Flame, Snowflake, Droplets } from 'lucide-react';
import { CONDITIONS } from '../data/constants';
import { GEAR_SETS } from '../data/gear';
import { MechanicTooltip } from './MechanicTooltip';
import useLocale from '../hooks/useLocale';

// Компонент для рендеринга описания с тултипами механик
const DescriptionWithMechanics = ({ text }) => {
  if (!text) return null;

  // Паттерны для поиска терминов (английские названия)
  const mechanicTerms = [
    'Vulnerability', 'Shatter', 'Launch', 'Knockdown', 'Breach',
    'Combustion', 'Electrification', 'Solidification', 'Corrosion',
    'Originium Crystals', 'Arts Explosion'
  ];

  // Создаём регулярку для поиска всех терминов
  const pattern = new RegExp(`\\b(${mechanicTerms.join('|')})\\b`, 'gi');

  // Разбиваем текст на части
  const parts = [];
  let lastIndex = 0;
  let match;

  // Создаём новую регулярку для каждого использования
  const regex = new RegExp(pattern.source, 'gi');

  while ((match = regex.exec(text)) !== null) {
    // Добавляем текст до совпадения
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    // Добавляем термин с тултипом
    parts.push({ type: 'mechanic', term: match[1] });
    lastIndex = match.index + match[0].length;
  }

  // Добавляем оставшийся текст
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return (
    <>
      {parts.map((part, i) => {
        if (part.type === 'mechanic') {
          return <MechanicTooltip key={i} term={part.term} />;
        }
        return <span key={i}>{part.content}</span>;
      })}
    </>
  );
};

// Иконки для условий пассивок
const PASSIVE_CONDITION_ICONS = {
  afterCombustionOrElectrification: <Flame className="text-orange-400" size={14} />,
  afterSolidificationOrCrystals: <Snowflake className="text-cyan-400" size={14} />,
  afterVulnerability: <Target className="text-red-400" size={14} />,
  afterCorrosion: <Droplets className="text-green-400" size={14} />,
  afterCrit: <Target className="text-yellow-400" size={14} />,
  afterBattleSkill: <Sword className="text-orange-400" size={14} />,
  afterComboSkill: <Zap className="text-pink-400" size={14} />,
  afterUltimate: <Shield className="text-purple-400" size={14} />,
  afterHpTreatment: <Droplets className="text-emerald-400" size={14} />,
  afterShield: <Shield className="text-blue-400" size={14} />,
};

// Форматирование бонусов для отображения
const formatBonusValue = (key, value, t) => {
  // Проверка на валидное значение
  if (value === undefined || value === null || isNaN(value)) {
    return null;
  }

  const percentStats = ['atkPercent', 'maxHp', 'critRate', 'critDmg', 'skillDmg', 'physDmg', 'artsDmg',
    'heatDmg', 'cryoDmg', 'electricDmg', 'natureDmg', 'battleSkillDmg', 'comboSkillDmg', 'ultimateDmg',
    'basicAtkDmg', 'staggerDmg', 'staggerEff', 'treatmentEff', 'ultimateGain', 'shieldBonus', 'dmgReduction'];

  const name = t.stats?.[key] || key;
  const suffix = percentStats.includes(key) ? '%' : '';
  const formattedValue = Number.isInteger(value) ? value : value.toFixed(1);
  return `${name} +${formattedValue}${suffix}`;
};

export const SettingsPanel = ({
  isOpen,
  onClose,
  conditions,
  setConditions,
  stacks,
  setStacks,
  activeSet,
  weapon,
  weaponBonuses,
  operatorTalents = [],
  operatorName = ''
}) => {
  const { t, translateWeaponName, translatePassivePrefix, translatePassiveCondition } = useLocale();

  if (!isOpen) return null;

  const setData = activeSet ? GEAR_SETS[activeSet] : null;
  const hasSetStacks = setData?.conditionalBonus?.maxStacks;
  const hasWeaponStacks = weapon?.passive?.maxStacks;
  
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
      >
        <div 
          className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
          onClick={onClose} 
        />
        <motion.div 
          className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings size={20} className="text-amber-400" />
              {t.headers.battleSettings}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-white">
              <X size={24} />
            </button>
          </div>
          
          {/* Стаки сета */}
          {hasSetStacks && (
            <div className="mb-6 p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
              <h3 className="text-sm font-medium text-amber-400 mb-1">
                {t.battleConditions.setStacks}: {activeSet}
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                {setData.conditionalBonus.description}
              </p>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="0" 
                  max={setData.conditionalBonus.maxStacks}
                  value={stacks.set || 0} 
                  onChange={(e) => setStacks({ ...stacks, set: parseInt(e.target.value) })}
                  className="flex-1 accent-amber-500" 
                />
                <span className="text-2xl font-bold text-white w-16 text-center">
                  {stacks.set || 0}/{setData.conditionalBonus.maxStacks}
                </span>
              </div>
            </div>
          )}
          
          {/* Стаки оружия */}
          {hasWeaponStacks && (
            <div className="mb-6 p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
              <h3 className="text-sm font-medium text-cyan-400 mb-1">
                {t.battleConditions.weaponStacks}: {translateWeaponName(weapon.name)}
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                {weapon.passive.description}
              </p>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="0" 
                  max={weapon.passive.maxStacks}
                  value={stacks.weapon || 0} 
                  onChange={(e) => setStacks({ ...stacks, weapon: parseInt(e.target.value) })}
                  className="flex-1 accent-cyan-500" 
                />
                <span className="text-2xl font-bold text-white w-16 text-center">
                  {stacks.weapon || 0}/{weapon.passive.maxStacks}
                </span>
              </div>
            </div>
          )}
          
          {/* Пассивки оружия */}
          {weapon && weaponBonuses?.skill3 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <Sword size={16} className="text-cyan-400" />
                {t.weapons.weaponPassive}
              </h3>

              {/* Название пассивки */}
              <div className="bg-gradient-to-r from-cyan-900/30 to-gray-900/30 rounded-xl p-4 border border-cyan-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-cyan-400">
                      {translatePassivePrefix(weaponBonuses.skill3.name)}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                      {t.common.rank} {weaponBonuses.skill3.rank}/9
                    </span>
                  </div>
                </div>

                {/* Базовые бонусы (всегда активны) */}
                {Object.keys(weaponBonuses.skill3.baseBonuses || {}).length > 0 && (
                  <div className="mb-3">
                    <div className="text-[10px] uppercase text-gray-500 mb-1">{t.weapons.permanentBonuses}:</div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(weaponBonuses.skill3.baseBonuses).map(([key, value]) => {
                        const formatted = formatBonusValue(key, value, t);
                        if (!formatted) return null;
                        return (
                          <span key={key} className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                            {formatted}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Условные бонусы с чекбоксом */}
                {weaponBonuses.skill3.condition && Object.keys(weaponBonuses.skill3.conditionalBonuses || {}).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    {/* Чекбокс для активации */}
                    <button
                      onClick={() => {
                        const key = `weapon_passive_${weapon.id}`;
                        setConditions({ ...conditions, [key]: !conditions[key] });
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all mb-3 ${conditions[`weapon_passive_${weapon.id}`]
                          ? 'bg-amber-500/20 border-amber-500/50'
                          : 'bg-gray-800/30 border-gray-700/50 hover:border-gray-600'
                        }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${conditions[`weapon_passive_${weapon.id}`]
                          ? 'bg-amber-500 border-amber-500'
                          : 'border-gray-600'
                        }`}>
                        {conditions[`weapon_passive_${weapon.id}`] && <Check size={14} className="text-black" />}
                      </div>
                      <div className="flex-1 text-left">
                        <div className={`text-sm font-medium ${conditions[`weapon_passive_${weapon.id}`] ? 'text-amber-400' : 'text-gray-400'}`}>
                          {t.weapons.considerConditional}
                        </div>
                      </div>
                    </button>

                    {/* Условные бонусы */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {Object.entries(weaponBonuses.skill3.conditionalBonuses).map(([key, value]) => {
                        const formatted = formatBonusValue(key, value, t);
                        if (!formatted) return null;
                        return (
                          <span
                            key={key}
                            className={`text-xs px-2 py-1 rounded border ${conditions[`weapon_passive_${weapon.id}`]
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : 'bg-gray-700/30 text-gray-500 border-gray-600/30'
                              }`}
                          >
                            {formatted}
                          </span>
                        );
                      })}
                    </div>

                    {/* Описание механики */}
                    <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
                      {(() => {
                        const condInfo = translatePassiveCondition(weaponBonuses.skill3.condition);
                        const icon = PASSIVE_CONDITION_ICONS[weaponBonuses.skill3.condition];
                        if (condInfo && condInfo.title !== weaponBonuses.skill3.condition) {
                          return (
                            <>
                              <div className="flex items-center gap-2 mb-2">
                                {icon}
                                <span className="text-xs font-medium text-white">
                                  {condInfo.title}
                                </span>
                              </div>
                              <div className="text-[11px] text-gray-400 leading-relaxed mb-2">
                                {condInfo.description}
                              </div>
                              <div className="flex items-start gap-2 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                                <Info size={12} className="text-blue-400 mt-0.5 flex-shrink-0" />
                                <span className="text-[10px] text-blue-300">
                                  <strong>{t.weapons.howToActivate}:</strong> {condInfo.howToActivate}
                                </span>
                              </div>
                            </>
                          );
                        }
                        return (
                          <div className="text-[11px] text-gray-400 leading-relaxed">
                            <DescriptionWithMechanics text={weaponBonuses.skill3.description} />
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Если нет условных бонусов - просто показываем описание */}
                {(!weaponBonuses.skill3.condition || Object.keys(weaponBonuses.skill3.conditionalBonuses || {}).length === 0) && (
                  <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/30">
                    <div className="text-[11px] text-gray-400 leading-relaxed">
                      <DescriptionWithMechanics text={weaponBonuses.skill3.description} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Таланты персонажа */}
          {operatorTalents && operatorTalents.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <Target size={16} className="text-purple-400" />
                {t.operators?.talents || 'Таланты'} - {operatorName}
              </h3>

              <div className="space-y-3">
                {operatorTalents.map((talent, index) => {
                  const hasNumericBonus = Object.keys(talent.bonuses || {}).length > 0;
                  const talentKey = `talent_${operatorName}_${talent.name}`;
                  const stacksKey = `talent_stacks_${operatorName}_${talent.name}`;
                  const isActive = conditions[talentKey];
                  const currentStacks = stacks[stacksKey] || 0;

                  // Рассчитываем бонусы с учётом стаков
                  const displayBonuses = {};
                  if (hasNumericBonus && talent.maxStacks && isActive) {
                    Object.entries(talent.bonuses).forEach(([key, value]) => {
                      displayBonuses[key] = value * currentStacks;
                    });
                  } else if (hasNumericBonus) {
                    Object.assign(displayBonuses, talent.bonuses);
                  }

                  return (
                    <div
                      key={index}
                      className={`rounded-xl p-4 border transition-all ${
                        !talent.isConditional && hasNumericBonus
                          ? 'bg-gradient-to-r from-green-900/20 to-gray-900/30 border-green-500/30'
                          : isActive
                            ? 'bg-gradient-to-r from-purple-900/30 to-gray-900/30 border-purple-500/40'
                            : 'bg-gray-800/30 border-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${!talent.isConditional && hasNumericBonus ? 'text-green-400' : 'text-purple-400'}`}>
                            {talent.name}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-gray-700/50 text-gray-400">
                            E{talent.elite}
                          </span>
                          {talent.maxStacks && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                              макс. {talent.maxStacks} стака
                            </span>
                          )}
                        </div>
                        {!talent.isConditional && hasNumericBonus && !talent.maxStacks && (
                          <span className="text-[10px] text-green-400">✓ Активно</span>
                        )}
                      </div>

                      {/* Бонусы таланта */}
                      {hasNumericBonus && (
                        <div className="mb-2">
                          {/* Итоговые бонусы */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {Object.entries(displayBonuses).map(([key, value]) => {
                              if (value === 0 && talent.maxStacks) return null;
                              const formatted = formatBonusValue(key, value, t);
                              if (!formatted) return null;
                              return (
                                <span
                                  key={key}
                                  className={`text-xs px-2 py-1 rounded border ${
                                    (!talent.isConditional && !talent.maxStacks) || isActive
                                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                      : 'bg-gray-700/30 text-gray-500 border-gray-600/30'
                                  }`}
                                >
                                  {formatted}
                                  {talent.maxStacks && isActive && currentStacks > 0 && ` (×${currentStacks})`}
                                </span>
                              );
                            })}
                          </div>

                          {/* Разбивка по элитам (только для пассивных талантов с несколькими элитами) */}
                          {!talent.isConditional && !talent.maxStacks && talent.breakdown && talent.breakdown.length > 1 && (
                            <div className="text-[10px] text-gray-500 bg-gray-800/50 rounded px-2 py-1">
                              {talent.breakdown.map((item, idx) => (
                                <span key={idx}>
                                  E{item.elite}: {Object.entries(item.bonuses).map(([k, v]) => `+${v}`).join(', ')}
                                  {idx < talent.breakdown.length - 1 && ' + '}
                                </span>
                              ))}
                              {' = '}
                              {Object.entries(talent.bonuses).map(([k, v]) => {
                                const statName = t.stats?.[k] || t.attributes?.[k.charAt(0).toUpperCase() + k.slice(1)] || k;
                                return `${statName} +${v}`;
                              }).join(', ')}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Описание */}
                      <div className="text-[11px] text-gray-400 leading-relaxed mb-2">
                        <DescriptionWithMechanics text={talent.description} />
                      </div>

                      {/* Чекбокс и слайдер стаков для условных бонусов */}
                      {talent.isConditional && hasNumericBonus && (
                        <div className="mt-2 space-y-2">
                          <button
                            onClick={() => setConditions({ ...conditions, [talentKey]: !isActive })}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg border transition-all ${
                              isActive
                                ? 'bg-purple-500/20 border-purple-500/50'
                                : 'bg-gray-800/30 border-gray-700/50 hover:border-gray-600'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                              isActive ? 'bg-purple-500 border-purple-500' : 'border-gray-600'
                            }`}>
                              {isActive && <Check size={12} className="text-black" />}
                            </div>
                            <span className={`text-xs ${isActive ? 'text-purple-400' : 'text-gray-500'}`}>
                              {t.weapons?.considerConditional || 'Учитывать условный бонус'}
                            </span>
                          </button>

                          {/* Слайдер для стаков */}
                          {talent.maxStacks && isActive && (
                            <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] text-amber-400">Количество стаков:</span>
                                <span className="text-sm font-bold text-white">{currentStacks}/{talent.maxStacks}</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max={talent.maxStacks}
                                value={currentStacks}
                                onChange={(e) => setStacks({ ...stacks, [stacksKey]: parseInt(e.target.value) })}
                                className="w-full accent-amber-500"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Условия */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-400 mb-3">{t.battleConditions.activeConditions}</h3>
            {Object.values(CONDITIONS).map(cond => (
              <button 
                key={cond.id}
                onClick={() => setConditions({ ...conditions, [cond.id]: !conditions[cond.id] })}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  conditions[cond.id] 
                    ? 'bg-amber-500/20 border-amber-500/50 text-white' 
                    : 'bg-gray-800/30 border-gray-700/50 text-gray-400 hover:border-gray-600'
                }`}
              >
                <span className="text-xl">{cond.icon}</span>
                <span className="flex-1 text-left text-sm">{cond.name}</span>
                {conditions[cond.id] && <Check size={18} className="text-amber-400" />}
              </button>
            ))}
          </div>
          
          {/* Справка по физическим состояниям */}
          <div className="mt-6 pt-4 border-t border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <Info size={16} className="text-red-400" />
              {t.physicalStates.title}
            </h3>

            {/* Физические состояния - карточки */}
            <div className="space-y-2 mb-6">
              {[
                { key: 'Vulnerability', color: 'red', emoji: '🎯' },
                { key: 'Shatter', color: 'orange', emoji: '💥' },
                { key: 'Launch', color: 'pink', emoji: '⬆️' },
                { key: 'Knockdown', color: 'rose', emoji: '⬇️' },
                { key: 'Breach', color: 'blue', emoji: '🔓' },
              ].map(({ key, color, emoji }) => {
                const state = t.physicalStates[key];
                return (
                  <div key={key} className={`p-3 rounded-lg bg-${color}-500/10 border border-${color}-500/30`}>
                    <div className={`text-sm font-bold text-${color}-400 mb-1 flex items-center gap-2`}>
                      <span>{emoji}</span>
                      {state?.name || key}
                    </div>
                    <div className="text-[11px] text-gray-400 leading-relaxed">
                      {state?.description}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Реакции искусств */}
            <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <Zap size={16} className="text-purple-400" />
              {t.artsReactions.title}
            </h3>

            {/* Введение */}
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 mb-4">
              <div className="text-sm font-bold text-purple-400 mb-1">
                {t.artsReactions.introTitle}
              </div>
              <div className="text-[11px] text-gray-400 leading-relaxed">
                {t.artsReactions.introDescription}
              </div>
            </div>

            {/* Тепло */}
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 mb-2">
              <div className="text-sm font-bold text-red-400 mb-1">
                {t.artsReactions.Heat?.name || '🔥 Поражение теплом'}
              </div>
              <div className="text-[11px] text-gray-400 leading-relaxed mb-2">
                {t.artsReactions.Heat?.affliction}
              </div>
              <div className="text-[10px] text-orange-400 mb-1">
                ⚡ {t.artsReactions.Heat?.explosion}
              </div>
              <div className="p-2 bg-red-500/20 rounded border border-red-500/40">
                <div className="text-xs font-bold text-red-300">
                  {t.artsReactions.Combustion?.name || 'Возгорание'}
                </div>
                <div className="text-[10px] text-gray-300">{t.artsReactions.Combustion?.description}</div>
                <div className="text-[9px] text-red-400 mt-1">{t.artsReactions.Combustion?.formula}</div>
              </div>
            </div>

            {/* Электро */}
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 mb-2">
              <div className="text-sm font-bold text-purple-400 mb-1">
                {t.artsReactions.Electric?.name || '⚡ Поражение электричеством'}
              </div>
              <div className="text-[11px] text-gray-400 leading-relaxed mb-2">
                {t.artsReactions.Electric?.affliction}
              </div>
              <div className="text-[10px] text-purple-400 mb-1">
                ⚡ {t.artsReactions.Electric?.explosion}
              </div>
              <div className="p-2 bg-purple-500/20 rounded border border-purple-500/40">
                <div className="text-xs font-bold text-purple-300">
                  {t.artsReactions.Electrification?.name || 'Электризация'}
                </div>
                <div className="text-[10px] text-gray-300">{t.artsReactions.Electrification?.description}</div>
                <div className="text-[9px] text-purple-400 mt-1">{t.artsReactions.Electrification?.formula}</div>
              </div>
            </div>

            {/* Крио */}
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 mb-2">
              <div className="text-sm font-bold text-cyan-400 mb-1">
                {t.artsReactions.Cryo?.name || '❄ Криогенное поражение'}
              </div>
              <div className="text-[11px] text-gray-400 leading-relaxed mb-2">
                {t.artsReactions.Cryo?.affliction}
              </div>
              <div className="text-[10px] text-cyan-400 mb-1">
                ⚡ {t.artsReactions.Cryo?.explosion}
              </div>
              <div className="p-2 bg-cyan-500/20 rounded border border-cyan-500/40">
                <div className="text-xs font-bold text-cyan-300">
                  {t.artsReactions.Solidification?.name || 'Застывание'}
                </div>
                <div className="text-[10px] text-gray-300">{t.artsReactions.Solidification?.description}</div>
                <div className="text-[9px] text-cyan-400 mt-1">{t.artsReactions.Solidification?.formula}</div>
              </div>
            </div>

            {/* Природа */}
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 mb-2">
              <div className="text-sm font-bold text-green-400 mb-1">
                {t.artsReactions.Nature?.name || '🌿 Поражение природой'}
              </div>
              <div className="text-[11px] text-gray-400 leading-relaxed mb-2">
                {t.artsReactions.Nature?.affliction}
              </div>
              <div className="text-[10px] text-green-400 mb-1">
                ⚡ {t.artsReactions.Nature?.explosion}
              </div>
              <div className="p-2 bg-green-500/20 rounded border border-green-500/40">
                <div className="text-xs font-bold text-green-300">
                  {t.artsReactions.Corrosion?.name || 'Коррозия'}
                </div>
                <div className="text-[10px] text-gray-300">{t.artsReactions.Corrosion?.description}</div>
                <div className="text-[9px] text-green-400 mt-1">{t.artsReactions.Corrosion?.formula}</div>
              </div>
            </div>

            {/* Взрыв искусств */}
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 mb-4">
              <div className="text-sm font-bold text-yellow-400 mb-1">
                💥 {t.artsReactions['Arts Explosion']?.name || 'Взрыв искусств'}
              </div>
              <div className="text-[11px] text-gray-400 leading-relaxed">
                {t.artsReactions['Arts Explosion']?.description}
              </div>
            </div>

            <p className="text-xs text-gray-500">
              {t.battleConditions.conditionsHelp}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsPanel;
