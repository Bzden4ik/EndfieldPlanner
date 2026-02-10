import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Heart, Sword, Shield, Zap, Flame, Snowflake, Wind, Leaf, Target } from 'lucide-react';

// Таблица для интерполяции усиления эффекта от силы искусств
const EFFECT_ENHANCEMENT_TABLE = [
  { intensity: 0, enhancement: 0 },
  { intensity: 30, enhancement: 18 },
  { intensity: 50, enhancement: 28 },
  { intensity: 85, enhancement: 44 },
  { intensity: 100, enhancement: 48 },
  { intensity: 117, enhancement: 56 },
  { intensity: 126, enhancement: 59 },
  { intensity: 138, enhancement: 63 },
  { intensity: 153, enhancement: 67 },
  { intensity: 168, enhancement: 71 },
  { intensity: 200, enhancement: 79 },
  { intensity: 204, enhancement: 80 },
  { intensity: 250, enhancement: 88 },
  { intensity: 300, enhancement: 95 },
];

// Функция интерполяции усиления эффекта
const calculateEffectEnhancement = (artsIntensity) => {
  if (artsIntensity <= 0) return 0;
  let lower = EFFECT_ENHANCEMENT_TABLE[0];
  let upper = EFFECT_ENHANCEMENT_TABLE[EFFECT_ENHANCEMENT_TABLE.length - 1];
  for (let i = 0; i < EFFECT_ENHANCEMENT_TABLE.length - 1; i++) {
    if (artsIntensity >= EFFECT_ENHANCEMENT_TABLE[i].intensity &&
        artsIntensity <= EFFECT_ENHANCEMENT_TABLE[i + 1].intensity) {
      lower = EFFECT_ENHANCEMENT_TABLE[i];
      upper = EFFECT_ENHANCEMENT_TABLE[i + 1];
      break;
    }
  }
  if (artsIntensity > upper.intensity) return upper.enhancement;
  const range = upper.intensity - lower.intensity;
  const enhancementRange = upper.enhancement - lower.enhancement;
  const progress = (artsIntensity - lower.intensity) / range;
  return Math.floor(lower.enhancement + enhancementRange * progress);
};

// Компонент раскрывающейся секции стата
const ExpandableStat = ({ icon: Icon, iconColor, label, value, children, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-gray-800/50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-800/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} className={iconColor} />}
          <span className="text-sm text-white">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white">{value}</span>
          {children && (
            isExpanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />
          )}
        </div>
      </button>
      {isExpanded && children && (
        <div className="px-4 pb-3 bg-gray-900/50">
          {children}
        </div>
      )}
    </div>
  );
};

// Компонент строки детализации
const DetailRow = ({ label, value, indent = false, highlight = false, color = 'text-gray-400' }) => (
  <div className={`flex justify-between py-1 ${indent ? 'pl-4' : ''}`}>
    <span className={`text-xs ${highlight ? 'text-white' : 'text-gray-500'}`}>{label}</span>
    <span className={`text-xs font-medium ${color}`}>{value}</span>
  </div>
);

// Компонент простой строки стата
const StatRow = ({ label, value, color = 'text-white' }) => (
  <div className="flex items-center justify-between p-3 border-b border-gray-800/50">
    <span className="text-xs text-gray-400">{label}</span>
    <span className={`text-sm font-medium ${color}`}>{value}</span>
  </div>
);

export const StatsPanel = ({ stats, selectedOp, t, translateAttribute }) => {
  // Расчёт бонуса лечения от Воли (каждая единица воли даёт 0.1%)
  const healingBonusFromWill = stats.will * 0.1;

  // Базовые HP (без бонусов)
  const hpFromStr = stats.str * 5;
  const baseOperatorHp = stats.finalHp / (1 + stats.maxHp / 100) - hpFromStr;

  // Базовая ATK оператора (без оружия)
  const operatorBaseAtk = stats.baseAtk - stats.weaponAtk;

  // Процентный бонус от атрибутов
  const strAtkBonus = stats.str * 0.5;
  const agiAtkBonus = stats.agi * 0.5;
  const mainAttrBonus = selectedOp.mainAttr === 'Strength' ? strAtkBonus :
                        selectedOp.mainAttr === 'Agility' ? agiAtkBonus :
                        selectedOp.mainAttr === 'Intellect' ? stats.int * 0.5 :
                        stats.will * 0.5;
  const subAttrBonus = selectedOp.subAttr === 'Strength' ? stats.str * 0.2 :
                       selectedOp.subAttr === 'Agility' ? stats.agi * 0.2 :
                       selectedOp.subAttr === 'Intellect' ? stats.int * 0.2 :
                       stats.will * 0.2;

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-800/50 overflow-hidden">
      {/* ОЗ (HP) */}
      <ExpandableStat
        icon={Heart}
        iconColor="text-green-400"
        label="ОЗ"
        value={stats.finalHp.toLocaleString()}
      >
        <DetailRow label="Базовые ОЗ" value={stats.finalHp.toLocaleString()} highlight />
        <DetailRow label="ОЗ оперативника" value={Math.round(baseOperatorHp).toLocaleString()} indent />
        <DetailRow label="ОЗ от СИЛ" value={hpFromStr.toLocaleString()} indent />
        {stats.maxHp > 0 && (
          <DetailRow label="Бонус ОЗ%" value={`+${stats.maxHp.toFixed(1)}%`} indent color="text-green-400" />
        )}
      </ExpandableStat>

      {/* Атака */}
      <ExpandableStat
        icon={Sword}
        iconColor="text-red-400"
        label="Атака"
        value={stats.finalAtk.toLocaleString()}
      >
        <DetailRow label="Всего баз." value={stats.baseAtk.toLocaleString()} highlight />
        <DetailRow label="Базовая АТК" value={stats.baseAtk.toLocaleString()} indent />
        <DetailRow label="АТК оружия" value={stats.weaponAtk.toLocaleString()} indent />
        <DetailRow label="АТК оперативника" value={operatorBaseAtk.toLocaleString()} indent />

        {stats.weaponBonuses?.weaponAtkPercent > 0 && (
          <>
            <DetailRow label="Бонус к АТК" value={stats.weaponBonuses.weaponAtkBonus?.toLocaleString() || '0'} highlight />
            <DetailRow label="Процент бонуса" value={`${stats.weaponBonuses.weaponAtkPercent}%`} indent />
          </>
        )}

        <DetailRow
          label="Бонусы показателей"
          value={`+${stats.totalAtkBonus.toFixed(1)}%`}
          highlight
          color="text-green-400"
        />
        <DetailRow
          label={`Бонус к АТК от: ${translateAttribute(selectedOp.mainAttr)}`}
          value={`+${stats.mainAtkBonus.toFixed(1)}%`}
          indent
          color="text-amber-400"
        />
        <DetailRow
          label={`Бонус к АТК от: ${translateAttribute(selectedOp.subAttr)}`}
          value={`+${stats.subAtkBonus.toFixed(1)}%`}
          indent
          color="text-gray-300"
        />
        {stats.atkPercent > 0 && (
          <DetailRow
            label="Бонус АТК%"
            value={`+${stats.atkPercent.toFixed(1)}%`}
            indent
            color="text-cyan-400"
          />
        )}
      </ExpandableStat>

      {/* Защита */}
      <ExpandableStat
        icon={Shield}
        iconColor="text-blue-400"
        label="Защита"
        value={stats.defense.toLocaleString()}
      >
        <DetailRow
          label={`Текущая ЗЩТ дает снижение итогового УРН в размере`}
          value={`${stats.dmgReduction.toFixed(1)}%`}
          color="text-blue-400"
        />
      </ExpandableStat>

      {/* Крит. показатели */}
      <StatRow
        label="Шанс крит. удара"
        value={`${stats.critRate.toFixed(1)}%`}
        color="text-yellow-400"
      />
      <StatRow
        label="Крит. УРН"
        value={`${(50 + stats.critDmg).toFixed(1)}%`}
        color="text-orange-400"
      />

      {/* Сила искусств - раскрывающаяся секция */}
      <ExpandableStat
        icon={Zap}
        iconColor="text-purple-400"
        label="Сила искусств"
        value={stats.artsIntensity.toFixed(0)}
      >
        <div className="text-[11px] text-gray-400 mb-3 leading-relaxed">
          Сила искусств влияет на бонусы к физическим состояниям, реакциям искусств и взрывам искусств.
        </div>

        {/* Группа 1: Только урон */}
        <div className="mb-2 p-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <div className="flex items-center gap-2 mb-1">
            <Target size={12} className="text-orange-400" />
            <span className="text-[10px] uppercase text-gray-500">Урон</span>
          </div>
          <div className="text-[10px] text-gray-300 mb-1">
            <span className="text-orange-400">Разгром</span>, <span className="text-red-400">возгорание</span>, <span className="text-cyan-400">застывание</span>, <span className="text-purple-400">раскол</span>, <span className="text-yellow-400">взрыв искусств</span>
          </div>
          <div className="text-sm font-bold text-green-400">
            УРН +{Math.floor(stats.artsIntensity)}%
          </div>
        </div>

        {/* Группа 2: Урон + Усиление */}
        <div className="mb-2 p-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <div className="flex items-center gap-2 mb-1">
            <Flame size={12} className="text-amber-400" />
            <span className="text-[10px] uppercase text-gray-500">Урон + Усиление эффекта</span>
          </div>
          <div className="text-[10px] text-gray-300 mb-1">
            <span className="text-blue-400">Прорыв</span>, <span className="text-purple-400">электризация</span>, <span className="text-green-400">коррозия</span>
          </div>
          <div className="flex gap-3">
            <div className="text-sm font-bold text-green-400">
              УРН +{Math.floor(stats.artsIntensity)}%
            </div>
            <div className="text-sm font-bold text-amber-400">
              Эффект +{calculateEffectEnhancement(stats.artsIntensity)}%
            </div>
          </div>
        </div>

        {/* Группа 3: Урон + Ошеломление */}
        <div className="p-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <div className="flex items-center gap-2 mb-1">
            <Wind size={12} className="text-pink-400" />
            <span className="text-[10px] uppercase text-gray-500">Урон + Ошеломление</span>
          </div>
          <div className="text-[10px] text-gray-300 mb-1">
            <span className="text-pink-400">Подбрасывание</span>, <span className="text-rose-400">опрокидывание</span>
          </div>
          <div className="flex gap-3">
            <div className="text-sm font-bold text-green-400">
              УРН +{Math.floor(stats.artsIntensity)}%
            </div>
            <div className="text-sm font-bold text-pink-400">
              Ошеломление +{Math.floor(stats.artsIntensity * 0.5)}%
            </div>
          </div>
        </div>

        {/* Формулы */}
        <div className="mt-2 pt-2 border-t border-gray-700/50">
          <div className="text-[9px] text-gray-500 space-y-0.5">
            <div>• УРН = Сила искусств (1:1)</div>
            <div>• Ошеломление = Сила искусств × 0.5</div>
            <div>• Усиление эффекта = нелинейная шкала</div>
          </div>
        </div>
      </ExpandableStat>

      {/* Лечение */}
      <StatRow
        label="Бонус лечения"
        value={`${(stats.treatmentBonus + stats.treatment + stats.treatmentEff).toFixed(1)}%`}
        color="text-emerald-400"
      />
      <StatRow
        label="Бонус получаемого лечения"
        value={`${healingBonusFromWill.toFixed(1)}%`}
        color="text-emerald-300"
      />

      {/* Комбонавыки */}
      <StatRow
        label="Сокращение перезарядки комбонавыков"
        value="0.0%"
        color="text-gray-400"
      />

      {/* Суперэнергия */}
      <StatRow
        label="Скорость накопления суперэнергии"
        value={`${(100 + stats.ultimateGain).toFixed(1)}%`}
        color="text-pink-400"
      />

      {/* Ошеломление */}
      <StatRow
        label="Бонус эффективности ошеломления"
        value={`${stats.staggerEff.toFixed(1)}%`}
        color="text-gray-400"
      />

      {/* Элементальные бонусы */}
      <StatRow
        label="Бонус физического УРН"
        value={`${stats.physDmg.toFixed(1)}%`}
        color={stats.physDmg > 0 ? 'text-orange-400' : 'text-gray-500'}
      />
      <StatRow
        label="Бонус теплового УРН"
        value={`${stats.heatDmg.toFixed(1)}%`}
        color={stats.heatDmg > 0 ? 'text-red-400' : 'text-gray-500'}
      />
      <StatRow
        label="Бонус электрического УРН"
        value={`${stats.electricDmg.toFixed(1)}%`}
        color={stats.electricDmg > 0 ? 'text-purple-400' : 'text-gray-500'}
      />
      <StatRow
        label="Бонус криогенного УРН"
        value={`${stats.cryoDmg.toFixed(1)}%`}
        color={stats.cryoDmg > 0 ? 'text-cyan-400' : 'text-gray-500'}
      />
      <StatRow
        label="Бонус природного УРН"
        value={`${stats.natureDmg.toFixed(1)}%`}
        color={stats.natureDmg > 0 ? 'text-green-400' : 'text-gray-500'}
      />

      {/* Навыки */}
      <StatRow
        label="Бонус УРН боевого навыка"
        value={`${stats.battleSkillDmg.toFixed(1)}%`}
        color={stats.battleSkillDmg > 0 ? 'text-orange-400' : 'text-gray-500'}
      />
      <StatRow
        label="Бонус УРН от комбонавыков"
        value={`${stats.comboSkillDmg.toFixed(1)}%`}
        color={stats.comboSkillDmg > 0 ? 'text-pink-400' : 'text-gray-500'}
      />
      {stats.ultimateDmg > 0 && (
        <StatRow
          label="Бонус УРН ультимейта"
          value={`${stats.ultimateDmg.toFixed(1)}%`}
          color="text-violet-400"
        />
      )}
      {stats.dmgDealt > 0 && (
        <StatRow
          label="Бонус общего урона"
          value={`${stats.dmgDealt.toFixed(1)}%`}
          color="text-red-400"
        />
      )}
    </div>
  );
};

export default StatsPanel;
