import React, { useState } from 'react';
import useLocale from '../hooks/useLocale';

// Цвета для разных механик
const MECHANIC_COLORS = {
  // Физические состояния
  Vulnerability: { color: 'text-red-400', bgColor: 'bg-red-500/20' },
  Shatter: { color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  Launch: { color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
  Knockdown: { color: 'text-rose-400', bgColor: 'bg-rose-500/20' },
  Breach: { color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  // Реакции искусств
  Combustion: { color: 'text-red-500', bgColor: 'bg-red-500/20' },
  Electrification: { color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  Solidification: { color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
  Corrosion: { color: 'text-green-400', bgColor: 'bg-green-500/20' },
  'Originium Crystals': { color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  'Arts Explosion': { color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
};

// Компонент для отображения слова с тултипом механики
export const MechanicTooltip = ({ term, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLocale();

  // Ищем механику в физических состояниях или реакциях искусств
  const mechanic = t.physicalStates?.[term] || t.artsReactions?.[term];
  const colors = MECHANIC_COLORS[term] || { color: 'text-gray-400', bgColor: 'bg-gray-500/20' };

  if (!mechanic) {
    return <span>{children || term}</span>;
  }

  return (
    <span className="relative inline-block">
      <span
        className={`cursor-help border-b border-dashed ${colors.color} hover:opacity-80`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children || mechanic.name}
      </span>

      {isOpen && (
        <div className="absolute z-[9999] bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
          <div className={`text-sm font-bold mb-1 ${colors.color}`}>
            {mechanic.name}
          </div>
          <div className="text-[11px] text-gray-300 leading-relaxed">
            {mechanic.description}
          </div>
          {/* Стрелка */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-700" />
        </div>
      )}
    </span>
  );
};

// Функция для автоматической замены терминов в тексте на тултипы
export const parseTextWithMechanics = (text) => {
  if (!text) return text;

  // Все термины для поиска (английские)
  const terms = [
    'Vulnerability', 'Shatter', 'Launch', 'Knockdown', 'Breach',
    'Combustion', 'Electrification', 'Solidification', 'Corrosion',
    'Originium Crystals', 'Arts Explosion'
  ];

  let result = text;

  // Заменяем термины на специальные маркеры
  terms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    result = result.replace(regex, `[[MECHANIC:${term}]]`);
  });

  return result;
};

// Компонент для рендеринга текста с тултипами
export const TextWithMechanics = ({ text }) => {
  if (!text) return null;

  const parts = text.split(/(\[\[MECHANIC:[^\]]+\]\])/g);

  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/\[\[MECHANIC:([^\]]+)\]\]/);
        if (match) {
          const term = match[1];
          return <MechanicTooltip key={i} term={term} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

export default MechanicTooltip;
