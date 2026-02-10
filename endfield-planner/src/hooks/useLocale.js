import { useLanguage } from '../contexts/LanguageContext';
import { locales } from '../data/locales';

export const useLocale = () => {
  const { language } = useLanguage();
  const t = locales[language] || locales.ru;

  // Функция для получения перевода по ключу с точечной нотацией
  const translate = (key, fallback = key) => {
    const keys = key.split('.');
    let result = t;

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return fallback;
      }
    }

    return result || fallback;
  };

  // Функция для перевода названия оружия
  const translateWeaponName = (name) => {
    return t.weaponNames?.[name] || name;
  };

  // Функция для перевода типа оружия
  const translateWeaponType = (type) => {
    return t.weaponTypes?.[type] || type;
  };

  // Функция для перевода атрибута
  const translateAttribute = (attr) => {
    return t.attributes?.[attr] || attr;
  };

  // Функция для перевода стата
  const translateStat = (stat) => {
    return t.stats?.[stat] || stat;
  };

  // Функция для перевода буста эссенции
  const translateEssenceBoost = (boost) => {
    return t.essences?.boosts?.[boost] || boost;
  };

  // Функция для перевода префикса пассивки
  const translatePassivePrefix = (prefix) => {
    if (!prefix) return '';

    // Пытаемся найти в passivePrefixes
    const prefixKey = prefix.split(':')[0]?.trim();
    const passiveName = prefix.includes(':') ? prefix.split(':')[1]?.trim() : '';

    const translatedPrefix = t.passivePrefixes?.[prefixKey] || prefixKey;
    const translatedName = t.passivePrefixes?.[passiveName] || passiveName;

    if (passiveName) {
      return `${translatedPrefix}: ${translatedName}`;
    }
    return translatedPrefix;
  };

  // Функция для перевода физического состояния
  const translatePhysicalState = (state) => {
    return t.physicalStates?.[state] || { name: state, description: '' };
  };

  // Функция для перевода реакции искусств
  const translateArtsReaction = (reaction) => {
    return t.artsReactions?.[reaction] || { name: reaction, description: '' };
  };

  // Функция для перевода условия пассивки
  const translatePassiveCondition = (condition) => {
    return t.passiveConditions?.[condition] || { title: condition, description: '', howToActivate: '' };
  };

  // Функция для получения описания механики (физ. состояние или реакция искусств)
  const getMechanicInfo = (term) => {
    // Проверяем физические состояния
    if (t.physicalStates?.[term]) {
      return {
        ...t.physicalStates[term],
        type: 'physical'
      };
    }
    // Проверяем реакции искусств
    if (t.artsReactions?.[term]) {
      return {
        ...t.artsReactions[term],
        type: 'arts'
      };
    }
    return null;
  };

  return {
    language,
    t,
    translate,
    translateWeaponName,
    translateWeaponType,
    translateAttribute,
    translateStat,
    translateEssenceBoost,
    translatePassivePrefix,
    translatePhysicalState,
    translateArtsReaction,
    translatePassiveCondition,
    getMechanicInfo,
  };
};

export default useLocale;
