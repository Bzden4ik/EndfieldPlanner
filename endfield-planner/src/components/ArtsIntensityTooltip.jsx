import React, { useState } from 'react';
import { Info, X, Zap, Flame, Snowflake, Target, Wind } from 'lucide-react';

// Таблица для интерполяции усиления эффекта
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

  // Находим два ближайших значения
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

  // Если значение больше максимального в таблице
  if (artsIntensity > upper.intensity) {
    return upper.enhancement;
  }

  // Линейная интерполяция
  const range = upper.intensity - lower.intensity;
  const enhancementRange = upper.enhancement - lower.enhancement;
  const progress = (artsIntensity - lower.intensity) / range;

  return Math.floor(lower.enhancement + enhancementRange * progress);
};

// Расчёт урона (1:1)
const calculateDamage = (artsIntensity) => Math.floor(artsIntensity);

// Расчёт ошеломления (×0.5)
const calculateStun = (artsIntensity) => Math.floor(artsIntensity * 0.5);

export const ArtsIntensityTooltip = ({ value }) => {
  const [isOpen, setIsOpen] = useState(false);

  const damage = calculateDamage(value);
  const stun = calculateStun(value);
  const effectEnhancement = calculateEffectEnhancement(value);

  return (
    <div className="relative">
      {/* Кликабельный элемент */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 hover:border-indigo-400/50 transition-all w-full"
      >
        <div className="flex items-center gap-2 flex-1">
          <Zap size={16} className="text-indigo-400" />
          <span className="text-sm text-gray-300">Сила искусств</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-indigo-400">{value}</span>
          <Info size={14} className="text-gray-500" />
        </div>
      </button>

      {/* Всплывающая подсказка */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 mb-2 z-50 w-80 bg-gray-900 border border-indigo-500/50 rounded-xl shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                <Zap size={16} /> Сила искусств: {value}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
              Сила искусств влияет на бонусы к физическим состояниям, реакциям искусств и взрывам искусств.
            </p>

            {/* Группа 1: Только урон */}
            <div className="mb-3 p-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Target size={12} className="text-orange-400" />
                <span className="text-[10px] uppercase text-gray-500">Урон</span>
              </div>
              <div className="text-[11px] text-gray-300 mb-1">
                <span className="text-orange-400">Разгром</span>, <span className="text-red-400">возгорание</span>, <span className="text-cyan-400">застывание</span>, <span className="text-purple-400">раскол</span>, <span className="text-yellow-400">взрыв искусств</span>
              </div>
              <div className="text-sm font-bold text-green-400">
                УРН +{damage}%
              </div>
            </div>

            {/* Группа 2: Урон + Усиление */}
            <div className="mb-3 p-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Flame size={12} className="text-amber-400" />
                <span className="text-[10px] uppercase text-gray-500">Урон + Усиление эффекта</span>
              </div>
              <div className="text-[11px] text-gray-300 mb-1">
                <span className="text-blue-400">Прорыв</span>, <span className="text-purple-400">электризация</span>, <span className="text-green-400">коррозия</span>
              </div>
              <div className="flex gap-3">
                <div className="text-sm font-bold text-green-400">
                  УРН +{damage}%
                </div>
                <div className="text-sm font-bold text-amber-400">
                  Эффект +{effectEnhancement}%
                </div>
              </div>
            </div>

            {/* Группа 3: Урон + Ошеломление */}
            <div className="p-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Wind size={12} className="text-pink-400" />
                <span className="text-[10px] uppercase text-gray-500">Урон + Ошеломление</span>
              </div>
              <div className="text-[11px] text-gray-300 mb-1">
                <span className="text-pink-400">Подбрасывание</span>, <span className="text-rose-400">опрокидывание</span>
              </div>
              <div className="flex gap-3">
                <div className="text-sm font-bold text-green-400">
                  УРН +{damage}%
                </div>
                <div className="text-sm font-bold text-pink-400">
                  Ошеломление +{stun}%
                </div>
              </div>
            </div>

            {/* Формулы */}
            <div className="mt-3 pt-3 border-t border-gray-700/50">
              <div className="text-[9px] text-gray-500 space-y-0.5">
                <div>• УРН = Сила искусств (1:1)</div>
                <div>• Ошеломление = Сила искусств × 0.5</div>
                <div>• Усиление эффекта = нелинейная шкала</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ArtsIntensityTooltip;
