import React, { useState } from 'react';
import { Shield, ChevronDown, Target, RefreshCw, Sliders } from 'lucide-react';

// Data
import { OPERATORS, CLASS_COLORS, ELEMENT_COLORS, loadOperatorAttributes, loadOperatorTalents, getActiveTalents, loadOperatorSkills, getSkillIcons, loadOperatorPotential, getTokenIcon } from './data/operators';
import { GEAR_SETS, GEAR_ITEMS, loadEquipmentData } from './data/gear';

// Components
import GearSlot from './components/GearSlot';
import WeaponSlot from './components/WeaponSlot';
import StatBar from './components/StatBar';
import SettingsPanel from './components/SettingsPanel';
import ArtsIntensityTooltip from './components/ArtsIntensityTooltip';
import LanguageSwitcher from './components/LanguageSwitcher';
import StatsPanel from './components/StatsPanel';
import SkillsPanel from './components/SkillsPanel';
import PotentialPanel from './components/PotentialPanel';

// Hooks
import useStats from './hooks/useStats';
import useLocale from './hooks/useLocale';

export default function App() {
  // Локализация
  const { t, translateAttribute, translateStat } = useLocale();

  // State
  const [selectedOp, setSelectedOp] = useState(OPERATORS[0]);
  const [level, setLevel] = useState(80);
  const [elite, setElite] = useState(4);
  const [equipmentLoaded, setEquipmentLoaded] = useState(false);
  const [operatorSkills, setOperatorSkills] = useState(null);
  const [skillLevels, setSkillLevels] = useState({});
  const [operatorPotential, setOperatorPotential] = useState(null);
  const [potentialLevel, setPotentialLevel] = useState(0);
  
  // Загрузка данных снаряжения при запуске
  React.useEffect(() => {
    const loadEquipment = async () => {
      const success = await loadEquipmentData();
      setEquipmentLoaded(success);
    };
    loadEquipment();
  }, []);
  
  // Диапазоны уровней для элит
  const eliteLevelRanges = {
    0: { min: 1, max: 20 },
    1: { min: 20, max: 40 },
    2: { min: 40, max: 60 },
    3: { min: 60, max: 80 },
    4: { min: 80, max: 90 }
  };
  
  // Ограничение уровня при смене элиты
  React.useEffect(() => {
    const range = eliteLevelRanges[elite];
    if (level < range.min) setLevel(range.min);
    if (level > range.max) setLevel(range.max);
  }, [elite]);
  
  // Загрузка экипировки при старте
  React.useEffect(() => {
    loadEquipmentData().then(success => {
      if (success) {
        setEquipmentLoaded(true);
        console.log('Equipment data loaded successfully');
      }
    });
  }, []);
  
  // Загрузка атрибутов и талантов персонажа при выборе
  React.useEffect(() => {
    const loadData = async () => {
      // Загружаем атрибуты
      if (!selectedOp.attributes) {
        const attributes = await loadOperatorAttributes(selectedOp.attributesPath);
        if (attributes) {
          setSelectedOp(prev => ({ ...prev, attributes }));
        }
      }
      // Загружаем таланты
      if (!selectedOp.talents) {
        const talents = await loadOperatorTalents(selectedOp.attributesPath);
        if (talents) {
          setSelectedOp(prev => ({ ...prev, talents }));
        }
      }
    };
    loadData();
  }, [selectedOp.id]);

  // Загрузка навыков персонажа
  React.useEffect(() => {
    const loadSkills = async () => {
      const skills = await loadOperatorSkills(selectedOp.attributesPath);
      setOperatorSkills(skills);
      setSkillLevels({});
    };
    loadSkills();
  }, [selectedOp.id]);

  // Загрузка потенциала персонажа
  React.useEffect(() => {
    const loadPotential = async () => {
      const data = await loadOperatorPotential(selectedOp.attributesPath);
      setOperatorPotential(data);
      setPotentialLevel(0);
    };
    loadPotential();
  }, [selectedOp.id]);

  // Иконки навыков
  const skillIcons = React.useMemo(() => {
    return getSkillIcons(selectedOp.attributesPath, selectedOp.weapon);
  }, [selectedOp.attributesPath, selectedOp.weapon]);

  // Иконка токена
  const tokenIcon = React.useMemo(() => {
    return getTokenIcon(selectedOp.attributesPath);
  }, [selectedOp.attributesPath]);

  // Получаем активные таланты для текущей элиты
  const activeTalents = React.useMemo(() => {
    return getActiveTalents(selectedOp.talents, elite);
  }, [selectedOp.talents, elite]);
  const [armor, setArmor] = useState(null);
  const [gloves, setGloves] = useState(null);
  const [kit1, setKit1] = useState(null);
  const [kit2, setKit2] = useState(null);
  
  // Equipment upgrade levels for each stat (0-3)
  const [armorUpgrades, setArmorUpgrades] = useState({});
  const [glovesUpgrades, setGlovesUpgrades] = useState({});
  const [kit1Upgrades, setKit1Upgrades] = useState({});
  const [kit2Upgrades, setKit2Upgrades] = useState({});
  
  const [weapon, setWeapon] = useState(null);
  const [weaponLevel, setWeaponLevel] = useState(90);
  const [tuningStage, setTuningStage] = useState(4);
  const [potential, setPotential] = useState(0);
  const [essence, setEssence] = useState(null);
  const [showOpList, setShowOpList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [conditions, setConditions] = useState({});
  const [stacks, setStacks] = useState({});

  // Calculated stats
  const gearWithUpgrades = {
    armor: armor ? { ...armor, upgrades: armorUpgrades } : null,
    gloves: gloves ? { ...gloves, upgrades: glovesUpgrades } : null,
    kit1: kit1 ? { ...kit1, upgrades: kit1Upgrades } : null,
    kit2: kit2 ? { ...kit2, upgrades: kit2Upgrades } : null
  };
  const stats = useStats(selectedOp, level, gearWithUpgrades, weapon, conditions, stacks, weaponLevel, tuningStage, potential, essence, elite, activeTalents);
  
  // Reset build
  const resetBuild = () => { 
    setArmor(null); 
    setGloves(null); 
    setKit1(null); 
    setKit2(null); 
    setWeapon(null);
    setWeaponLevel(90);
    setTuningStage(4);
    setPotential(0);
    setEssence(null);
    setConditions({}); 
    setStacks({}); 
  };
  
  // Count active conditions
  const activeConditionsCount = Object.values(conditions).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-4 md:p-6" 
         style={{fontFamily: "'Segoe UI', sans-serif"}}>
      {/* Background gradient overlay */}
      <div className="fixed inset-0 opacity-30 pointer-events-none" 
           style={{backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(245,158,11,0.1) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(6,182,212,0.08) 0%, transparent 40%)'}} />
      
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-6 relative">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              <span className="text-amber-400" style={{textShadow: '0 0 20px rgba(245,158,11,0.4)'}}>ENDFIELD</span>
              <span className="text-gray-400 ml-2">PLANNER</span>
            </h1>
            <p className="text-gray-500 text-xs mt-1">Build Calculator v2.1 • 62 weapons</p>
          </div>
          <div className="flex gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 transition-colors relative"
            >
              <Sliders size={16} />
              <span className="text-sm">{t.headers.settings}</span>
              {activeConditionsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
                  {activeConditionsCount}
                </span>
              )}
            </button>
            <button
              onClick={resetBuild}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw size={16} />
              <span className="text-sm">{t.common.reset}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 relative">
        
        {/* Left Column - Operator & Attributes */}
        <div className="lg:col-span-3 space-y-4">
          {/* Operator Selector */}
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-800/50">
            <button onClick={() => setShowOpList(!showOpList)} className="w-full text-left">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center ${
                  selectedOp.rarity === 6 ? 'ring-2 ring-amber-500/50' : 
                  selectedOp.rarity === 5 ? 'ring-2 ring-purple-500/50' : 
                  'ring-2 ring-blue-500/50'}`}>
                  <img 
                    src={`/data/operators/${selectedOp.attributesPath}/${selectedOp.attributesPath}_Banner.png`} 
                    alt={selectedOp.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<span class="text-xl">${selectedOp.icon}</span>`;
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold">{selectedOp.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1.5">
                    <span style={{color: CLASS_COLORS[selectedOp.class]}}>{selectedOp.class}</span>
                    <span>•</span>
                    <img 
                      src={`/Icons/elements/${selectedOp.element}.png`} 
                      alt={selectedOp.element}
                      className="w-4 h-4 inline-block"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                    <span style={{color: ELEMENT_COLORS[selectedOp.element]}}>{selectedOp.element}</span>
                  </div>
                  <div className="text-[10px] text-amber-400/70 mt-0.5">{'★'.repeat(selectedOp.rarity)}</div>
                </div>
                <ChevronDown size={18} className={`text-gray-500 transition-transform ${showOpList ? 'rotate-180' : ''}`} />
              </div>
            </button>
            
            {showOpList && (
              <div className="mt-4 pt-4 border-t border-gray-800 max-h-64 overflow-y-auto space-y-2">
                {OPERATORS.map(op => (
                  <button 
                    key={op.id} 
                    onClick={() => { 
                      setSelectedOp(op); 
                      setShowOpList(false); 
                      setWeapon(null);
                      setWeaponLevel(90);
                      setTuningStage(4);
                      setPotential(0);
                      setEssence(null);
                    }} 
                    className={`w-full p-2 rounded-lg text-left transition-all ${
                      op.id === selectedOp.id ? 'bg-amber-500/20 border border-amber-500/40' : 'hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
                        <img 
                          src={`/data/operators/${op.attributesPath}/${op.attributesPath}_Banner.png`} 
                          alt={op.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<span class="text-lg">${op.icon}</span>`;
                          }}
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{op.name}</div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-1">
                          {op.class} • 
                          <img 
                            src={`/Icons/elements/${op.element}.png`} 
                            alt={op.element}
                            className="w-3 h-3 inline-block mx-0.5"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                          {op.weapon}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Elite Selection */}
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50">
            <div className="text-sm text-gray-400 mb-3">{t.operators.elite}</div>
            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map(e => (
                <button
                  key={e}
                  onClick={() => setElite(e)}
                  className={`py-2 px-1 rounded-lg transition-all flex items-center justify-center ${
                    elite === e 
                      ? 'bg-amber-500/20 ring-2 ring-amber-500 shadow-lg shadow-amber-500/30' 
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <img 
                    src={`/Icons/elite/Elite ${e}.svg`} 
                    alt={`Elite ${e}`}
                    className="h-8 w-auto"
                    style={{ filter: elite === e ? 'brightness(1.2) saturate(1.3)' : 'brightness(0.7) saturate(0.8)' }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Level Slider */}
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-400">{t.common.level}</span>
              <span className="text-2xl font-bold text-amber-400">{level}</span>
            </div>
            <input 
              type="range" 
              min={eliteLevelRanges[elite].min} 
              max={eliteLevelRanges[elite].max} 
              value={level} 
              onChange={(e) => setLevel(parseInt(e.target.value))} 
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500" 
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>{eliteLevelRanges[elite].min}</span>
              <span>{eliteLevelRanges[elite].max}</span>
            </div>
          </div>

          {/* Attributes */}
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3">{translateAttribute('Attributes') || 'Атрибуты'}</h3>
            <div className="space-y-2">
              {[
                {n:'STR', v:stats.str, a:'Strength', wKey:'strength'},
                {n:'AGI', v:stats.agi, a:'Agility', wKey:'agility'},
                {n:'INT', v:stats.int, a:'Intellect', wKey:'intellect'},
                {n:'WILL', v:stats.will, a:'Will', wKey:'will'}
              ].map(s => {
                // Определяем бонус от оружия
                const weaponBonus = stats.weaponBonuses?.skill1;
                let bonusFromWeapon = 0;
                if (weaponBonus) {
                  if (weaponBonus.type === s.wKey) {
                    bonusFromWeapon = weaponBonus.value;
                  } else if (weaponBonus.type === 'mainAttr' && selectedOp.mainAttr === s.a) {
                    bonusFromWeapon = weaponBonus.value;
                  }
                }

                return (
                  <div
                    key={s.n}
                    className={`flex justify-between items-center p-2 rounded-lg ${
                      selectedOp.mainAttr === s.a ? 'bg-amber-500/10 border border-amber-500/30' :
                      selectedOp.subAttr === s.a ? 'bg-gray-800/30 border border-gray-700/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">{s.n}</span>
                      {selectedOp.mainAttr === s.a && (
                        <span className="text-[8px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-400">MAIN</span>
                      )}
                      {selectedOp.subAttr === s.a && (
                        <span className="text-[8px] px-1 py-0.5 rounded bg-gray-500/20 text-gray-400">SUB</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {bonusFromWeapon > 0 && (
                        <span className="text-[10px] text-cyan-400">+{bonusFromWeapon}</span>
                      )}
                      <span className="font-bold text-white">{s.v}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Показываем бонусы от оружия Skill 2 */}
            {stats.weaponBonuses?.skill2 && (
              <div className="mt-3 pt-3 border-t border-gray-700/30">
                <div className="text-[10px] text-gray-500 uppercase mb-2">{t.weapons.weaponPassive || 'Бонусы от оружия'}</div>
                <div className="flex flex-wrap gap-1">
                  {stats.weaponBonuses.skill2.atkPercent && (
                    <span className="text-[10px] px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                      ATK +{stats.weaponBonuses.skill2.atkPercent}%
                    </span>
                  )}
                  {stats.weaponBonuses.skill2.maxHp && (
                    <span className="text-[10px] px-2 py-1 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                      HP +{stats.weaponBonuses.skill2.maxHp}%
                    </span>
                  )}
                  {stats.weaponBonuses.skill2.artsIntensity && (
                    <span className="text-[10px] px-2 py-1 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      Arts +{stats.weaponBonuses.skill2.artsIntensity}
                    </span>
                  )}
                  {stats.weaponBonuses.skill2.critRate && (
                    <span className="text-[10px] px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      Crit +{stats.weaponBonuses.skill2.critRate}%
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Middle Column - Equipment */}
        <div className="lg:col-span-5 space-y-4">
          <WeaponSlot 
            weapon={weapon} 
            onSelect={setWeapon} 
            weaponType={selectedOp.weapon}
            weaponLevel={weaponLevel}
            setWeaponLevel={setWeaponLevel}
            tuningStage={tuningStage}
            setTuningStage={setTuningStage}
            potential={potential}
            setPotential={setPotential}
            essence={essence}
            setEssence={setEssence}
          />
          
          <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-800/50">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
              <Shield size={14} /> {t.headers.equipment}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <GearSlot 
                type="armor" 
                item={armor} 
                onSelect={setArmor} 
                equipmentLoaded={equipmentLoaded}
                upgrades={armorUpgrades}
                setUpgrades={setArmorUpgrades}
              />
              <GearSlot 
                type="gloves" 
                item={gloves} 
                onSelect={setGloves} 
                equipmentLoaded={equipmentLoaded}
                upgrades={glovesUpgrades}
                setUpgrades={setGlovesUpgrades}
              />
              <GearSlot 
                type="kit" 
                item={kit1} 
                onSelect={setKit1} 
                equipmentLoaded={equipmentLoaded}
                upgrades={kit1Upgrades}
                setUpgrades={setKit1Upgrades}
              />
              <GearSlot 
                type="kit" 
                item={kit2} 
                onSelect={setKit2} 
                equipmentLoaded={equipmentLoaded}
                upgrades={kit2Upgrades}
                setUpgrades={setKit2Upgrades}
              />
            </div>
          </div>
          
          {/* Set Bonus */}
          <div className={`rounded-xl p-4 border-2 transition-all ${
            stats.activeSet 
              ? 'bg-gradient-to-r from-amber-900/20 to-gray-900/50 border-amber-500/30' 
              : 'bg-gray-900/80 border-gray-800/50'
          }`}>
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2">
              <Target size={14} className="inline mr-1" /> {t.gear.setBonus}
            </h3>
            {stats.activeSet ? (
              <>
                <div className="text-lg font-bold mb-2" style={{color: GEAR_SETS[stats.activeSet].color}}>
                  {stats.activeSet}
                </div>
                <div className="text-sm text-gray-300 leading-relaxed">
                  <div className="mb-2">
                    <span className="text-amber-400 font-semibold">3-piece set effect:</span>
                  </div>
                  {GEAR_SETS[stats.activeSet]?.baseBonus && (
                    <div className="text-sm text-green-400 mb-1">
                      • {GEAR_SETS[stats.activeSet].baseBonus}
                    </div>
                  )}
                  {GEAR_SETS[stats.activeSet]?.conditionalBonus && (
                    <div className="text-sm text-gray-300">
                      • When {GEAR_SETS[stats.activeSet].conditionalBonus}
                    </div>
                  )}
                </div>
                {stats.conditionalBonuses.length > 0 && (
                  <div className="mt-3 p-2 bg-green-500/10 rounded-lg border border-green-500/30">
                    <div className="text-[10px] text-green-400 uppercase mb-1">Активные бонусы:</div>
                    {stats.conditionalBonuses.map((b, i) => (
                      <div key={i} className="text-xs text-green-300">+ {b}</div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-gray-600 italic">{t.common.noData || 'Наденьте 3 предмета из одного сета'}</div>
            )}
          </div>
          {/* Skills Panel */}
          <SkillsPanel
            skills={operatorSkills}
            skillIcons={skillIcons}
            skillLevels={skillLevels}
            setSkillLevels={setSkillLevels}
          />
          {/* Potential Panel */}
          <PotentialPanel
            potentialData={operatorPotential}
            tokenIcon={tokenIcon}
            potentialLevel={potentialLevel}
            setPotentialLevel={setPotentialLevel}
          />
        </div>

        {/* Right Column - Stats */}
        <div className="lg:col-span-4">
          <div className="sticky top-4">
            <StatsPanel
              stats={stats}
              selectedOp={selectedOp}
              t={t}
              translateAttribute={translateAttribute}
            />
          </div>
        </div>
      </div>
      
      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        conditions={conditions}
        setConditions={setConditions}
        stacks={stacks}
        setStacks={setStacks}
        activeSet={stats.activeSet}
        weapon={weapon}
        weaponBonuses={stats.weaponBonuses}
        operatorTalents={activeTalents}
        operatorName={selectedOp.name}
      />
    </div>
  );
}
