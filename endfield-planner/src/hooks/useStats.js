import { useMemo } from 'react';
import { GEAR_SETS, calculateEquipmentStats } from '../data/gear';
import { STAT_NAMES } from '../data/constants';
import { getWeaponATK } from '../data/weapons';

// Расчёт ATK оружия по уровню из реальных данных Attributes.json
const calculateWeaponATK = (attributesData, level) => {
  if (!attributesData || attributesData.length < 2) return 0;

  const atkRow = attributesData[1]; // ["Base ATK", "51", "146", "247", "348", "449", "500"]

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

// Категории эссенций для расчёта (теперь бонусы хранятся индивидуально в каждом стате)
const ESSENCE_STAT_CATEGORIES = {
  attribute: ['strength', 'agility', 'intellect', 'will'],
  secondary: ['atkPercent', 'critRate', 'artsIntensity', 'maxHp', 'treatment'],
  named: ['physDmg', 'heatDmg', 'cryoDmg', 'electricDmg', 'natureDmg', 'skillDmg']
};

// Парсинг Skill 1 (атрибуты) из текста
const parseSkill1 = (text) => {
  if (!text) return null;

  // "Agility +20", "Strength +36", "Main attribute +17"
  const match = text.match(/^([\w\s]+)\s*\+(\d+)$/i);
  if (match) {
    const attrName = match[1].trim().toLowerCase();
    const value = parseInt(match[2]);

    if (attrName.includes('strength')) return { type: 'strength', value };
    if (attrName.includes('agility')) return { type: 'agility', value };
    if (attrName.includes('intellect')) return { type: 'intellect', value };
    if (attrName.includes('will')) return { type: 'will', value };
    if (attrName.includes('main attribute')) return { type: 'mainAttr', value };
  }
  return null;
};

// Парсинг Skill 2 (ATK%, HP%, Arts Intensity) из текста
const parseSkill2 = (text) => {
  if (!text) return null;

  const result = {};

  // "Attack +5%", "Attack +25%"
  const atkMatch = text.match(/Attack\s*\+(\d+)%/i);
  if (atkMatch) result.atkPercent = parseInt(atkMatch[1]);

  // "Max HP +10%"
  const hpMatch = text.match(/Max HP\s*\+(\d+)%/i);
  if (hpMatch) result.maxHp = parseInt(hpMatch[1]);

  // "Arts Intensity +10"
  const artsMatch = text.match(/Arts Intensity\s*\+(\d+)/i);
  if (artsMatch) result.artsIntensity = parseInt(artsMatch[1]);

  // "Critical Rate +X%"
  const critMatch = text.match(/Critical Rate\s*\+(\d+(?:\.\d+)?)%/i);
  if (critMatch) result.critRate = parseFloat(critMatch[1]);

  // "Ultimate Gain +X%"
  const ultMatch = text.match(/Ultimate Gain\s*\+(\d+(?:\.\d+)?)%/i);
  if (ultMatch) result.ultimateGain = parseFloat(ultMatch[1]);

  // "Treatment Efficiency +X%"
  const treatMatch = text.match(/Treatment Efficiency\s*\+(\d+(?:\.\d+)?)%/i);
  if (treatMatch) result.treatmentEff = parseFloat(treatMatch[1]);

  return Object.keys(result).length > 0 ? result : null;
};

// Парсинг пассивки (Skill 3) - базовые бонусы и условные
const parseSkill3 = (text) => {
  if (!text) return null;

  const result = {
    baseBonuses: {},
    conditionalBonuses: {},
    condition: null,
    description: text
  };

  // Определяем условие активации
  if (text.includes('After') || text.includes('When')) {
    // Условные бонусы
    if (text.includes('Combustion') || text.includes('Electrification')) {
      result.condition = 'afterCombustionOrElectrification';
    } else if (text.includes('Solidification') || text.includes('Originium Crystals')) {
      result.condition = 'afterSolidificationOrCrystals';
    } else if (text.includes('Vulnerability')) {
      result.condition = 'afterVulnerability';
    } else if (text.includes('Corrosion')) {
      result.condition = 'afterCorrosion';
    } else if (text.includes('crit') || text.includes('Critical')) {
      result.condition = 'afterCrit';
    } else if (text.includes('battle skill')) {
      result.condition = 'afterBattleSkill';
    } else if (text.includes('combo skill')) {
      result.condition = 'afterComboSkill';
    } else if (text.includes('ultimate')) {
      result.condition = 'afterUltimate';
    } else if (text.includes('HP') && (text.includes('restores') || text.includes('treatment') || text.includes('heal'))) {
      result.condition = 'afterHpTreatment';
    } else if (text.includes('shield') || text.includes('Shield')) {
      result.condition = 'afterShield';
    }
  }

  // Паттерны для парсинга (без флага g чтобы match работал корректно)
  const patterns = [
    { regex: /Arts DMG Dealt \+(\d+(?:\.\d+)?)%/i, key: 'artsDmg' },
    { regex: /Physical DMG Dealt \+(\d+(?:\.\d+)?)%/i, key: 'physDmg' },
    { regex: /Heat DMG Dealt \+(\d+(?:\.\d+)?)%/i, key: 'heatDmg' },
    { regex: /Cryo DMG Dealt \+(\d+(?:\.\d+)?)%/i, key: 'cryoDmg' },
    { regex: /Electric DMG Dealt \+(\d+(?:\.\d+)?)%/i, key: 'electricDmg' },
    { regex: /Nature DMG Dealt \+(\d+(?:\.\d+)?)%/i, key: 'natureDmg' },
    { regex: /Skill DMG Dealt \+(\d+(?:\.\d+)?)%/i, key: 'skillDmg' },
    { regex: /Battle Skill DMG Dealt \+(\d+(?:\.\d+)?)%/i, key: 'battleSkillDmg' },
    { regex: /Combo Skill DMG Dealt \+(\d+(?:\.\d+)?)%/i, key: 'comboSkillDmg' },
    { regex: /Ultimate DMG Dealt \+(\d+(?:\.\d+)?)%/i, key: 'ultimateDmg' },
    { regex: /Basic Attack DMG Dealt \+(\d+(?:\.\d+)?)%/i, key: 'basicAtkDmg' },
    { regex: /Arts Intensity \+(\d+)/i, key: 'artsIntensity' },
    { regex: /Critical Rate \+(\d+(?:\.\d+)?)%/i, key: 'critRate' },
    { regex: /Critical DMG Dealt \+(\d+(?:\.\d+)?)%/i, key: 'critDmg' },
    { regex: /Stagger DMG \+(\d+(?:\.\d+)?)%/i, key: 'staggerDmg' },
    { regex: /Stagger Efficiency \+(\d+(?:\.\d+)?)%/i, key: 'staggerEff' },
    { regex: /Treatment Efficiency \+(\d+(?:\.\d+)?)%/i, key: 'treatmentEff' },
    { regex: /Shield applied \+(\d+(?:\.\d+)?)%/i, key: 'shieldBonus' },
    { regex: /ATK \+(\d+(?:\.\d+)?)%/i, key: 'atkPercent' },
    { regex: /Ultimate Gain \+(\d+(?:\.\d+)?)%/i, key: 'ultimateGain' },
    { regex: /DMG Reduction \+(\d+(?:\.\d+)?)%/i, key: 'dmgReduction' },
    { regex: /Max HP \+(\d+(?:\.\d+)?)%/i, key: 'maxHp' },
    // Альтернативные паттерны (без "Dealt")
    { regex: /Physical DMG \+(\d+(?:\.\d+)?)%/i, key: 'physDmg' },
    { regex: /Arts DMG \+(\d+(?:\.\d+)?)%/i, key: 'artsDmg' },
    { regex: /Heat DMG \+(\d+(?:\.\d+)?)%/i, key: 'heatDmg' },
    { regex: /Cryo DMG \+(\d+(?:\.\d+)?)%/i, key: 'cryoDmg' },
    { regex: /Electric DMG \+(\d+(?:\.\d+)?)%/i, key: 'electricDmg' },
    { regex: /Nature DMG \+(\d+(?:\.\d+)?)%/i, key: 'natureDmg' },
    { regex: /Skill DMG \+(\d+(?:\.\d+)?)%/i, key: 'skillDmg' },
    { regex: /Battle Skill DMG \+(\d+(?:\.\d+)?)%/i, key: 'battleSkillDmg' },
    { regex: /Combo Skill DMG \+(\d+(?:\.\d+)?)%/i, key: 'comboSkillDmg' },
    { regex: /Ultimate DMG \+(\d+(?:\.\d+)?)%/i, key: 'ultimateDmg' },
    { regex: /Basic Attack DMG \+(\d+(?:\.\d+)?)%/i, key: 'basicAtkDmg' },
  ];

  // Разбиваем текст на части до и после условия
  const conditionIndex = text.search(/After|When/i);
  const beforeCondition = conditionIndex > 0 ? text.substring(0, conditionIndex) : text;
  const afterCondition = conditionIndex > 0 ? text.substring(conditionIndex) : '';

  // Парсим бонусы
  patterns.forEach(({ regex, key }) => {
    // Проверяем базовую часть (до условия)
    const baseMatch = beforeCondition.match(regex);
    if (baseMatch && baseMatch[1]) {
      const value = parseFloat(baseMatch[1]);
      if (!isNaN(value)) {
        result.baseBonuses[key] = value;
      }
    }

    // Проверяем условную часть (после условия)
    if (result.condition && afterCondition) {
      const condMatch = afterCondition.match(regex);
      if (condMatch && condMatch[1]) {
        const value = parseFloat(condMatch[1]);
        if (!isNaN(value)) {
          result.conditionalBonuses[key] = value;
        }
      }
    }
  });

  return result;
};

// Функция расчёта стата на основе контрольных точек из Attributes.json
const calculateStatAtLevel = (statData, level, elite) => {
  // Контрольные точки из Attributes.json
  // Base = уровень 1, Elite 1 = уровень 20, Elite 2 = уровень 40, и т.д.
  const controlPoints = {
    1: parseFloat(statData.Base),           // уровень 1
    20: parseFloat(statData['Elite 1']),    // уровень 20
    40: parseFloat(statData['Elite 2']),    // уровень 40
    60: parseFloat(statData['Elite 3']),    // уровень 60
    80: parseFloat(statData['Elite 4']),    // уровень 80
    90: parseFloat(statData['Elite 4 Max']) // уровень 90
  };

  // Диапазоны уровней для каждой элиты
  const eliteRanges = {
    0: { start: 1, end: 20 },
    1: { start: 20, end: 40 },
    2: { start: 40, end: 60 },
    3: { start: 60, end: 80 },
    4: { start: 80, end: 90 }
  };

  const range = eliteRanges[elite];
  
  // Ограничиваем уровень в пределах текущей элиты
  const clampedLevel = Math.max(range.start, Math.min(level, range.end));
  
  // Получаем значения на границах диапазона
  const startValue = controlPoints[range.start];
  const endValue = controlPoints[range.end];
  
  // Линейная интерполяция
  const levelRange = range.end - range.start;
  const valueRange = endValue - startValue;
  const progress = (clampedLevel - range.start) / levelRange;
  const interpolatedValue = startValue + (valueRange * progress);
  
  return Math.floor(interpolatedValue);
};

export const useStats = (
  selectedOp,
  level,
  gear,
  weapon,
  conditions,
  stacks,
  weaponLevel = 90,
  tuningStage = 4,
  potential = 0,
  essence = null,
  elite = 4, // Параметр элиты (0-4)
  talents = [] // Таланты персонажа
) => {
  return useMemo(() => {
    const { armor, gloves, kit1, kit2 } = gear;
    
    // Базовые статы оператора из Attributes.json
    let baseAtk = selectedOp.attributes ? calculateStatAtLevel(selectedOp.attributes.ATK, level, elite) : Math.floor(selectedOp.baseAtk * (1 + (level - 1) * 0.03));
    let baseHp = selectedOp.attributes ? calculateStatAtLevel(selectedOp.attributes.HP, level, elite) : Math.floor(selectedOp.baseHp + (level - 1) * 55);
    let str = selectedOp.attributes ? calculateStatAtLevel(selectedOp.attributes.STR, level, elite) : Math.floor(20 + level * 0.5);
    let agi = selectedOp.attributes ? calculateStatAtLevel(selectedOp.attributes.AGL, level, elite) : Math.floor(20 + level * 0.5);
    let int = selectedOp.attributes ? calculateStatAtLevel(selectedOp.attributes.INT, level, elite) : Math.floor(20 + level * 0.5);
    let will = selectedOp.attributes ? calculateStatAtLevel(selectedOp.attributes.WIL, level, elite) : Math.floor(20 + level * 0.5);
    let defense = 0;
    
    // Инициализация бонусов
    let bonuses = {
      critRate: 5, critDmg: 0, skillDmg: 0, physDmg: 0, artsDmg: 0,
      heatDmg: 0, cryoDmg: 0, electricDmg: 0, natureDmg: 0,
      ultimateGain: 0, treatmentBonus: 0, treatment: 0,
      battleSkillDmg: 0, comboSkillDmg: 0, ultimateDmg: 0,
      atkPercent: 0, dmgReduction: 0, artsIntensity: 0,
      basicAtkDmg: 0, staggerDmg: 0, staggerEff: 0, treatmentEff: 0,
      maxHp: 0, dmgDealt: 0 // Общий урон (DMG Dealt)
    };
    
    // Собираем статы с экипировки
    const gearPieces = [armor, gloves, kit1, kit2].filter(Boolean);
    gearPieces.forEach(g => {
      // Calculate final stats with upgrades if available
      let finalStats = g.stats;
      if (g.upgrades && Object.keys(g.upgrades).length > 0) {
        finalStats = calculateEquipmentStats(g, g.upgrades);
      }
      
      if (finalStats) {
        // Парсим статы из stats (могут быть строками с %)
        Object.entries(finalStats).forEach(([statName, value]) => {
          const statValue = typeof value === 'string' ? parseFloat(value.replace('%', '')) : value;
          
          if (statName === 'DEF') defense += statValue;
          else if (statName === 'Strength') str += statValue;
          else if (statName === 'Agility') agi += statValue;
          else if (statName === 'Intellect') int += statValue;
          else if (statName === 'Will') will += statValue;
          else if (statName === 'Physical DMG') bonuses.physDmg += statValue;
          else if (statName === 'Heat DMG') bonuses.heatDmg += statValue;
          else if (statName === 'Cryo DMG') bonuses.cryoDmg += statValue;
          else if (statName === 'Electric DMG') bonuses.electricDmg += statValue;
          else if (statName === 'Nature DMG') bonuses.natureDmg += statValue;
          else if (statName === 'Arts Intensity') bonuses.artsIntensity += statValue;
          else if (statName === 'Critical Rate') bonuses.critRate += statValue;
          else if (statName === 'Critical DMG') bonuses.critDmg += statValue;
          else if (statName === 'Treatment Efficiency') bonuses.treatmentEff += statValue;
          else if (statName === 'DMG to Broken') bonuses.dmgDealt += statValue;
          else if (statName === 'Combo Skill DMG') bonuses.comboSkillDmg += statValue;
          else if (statName === 'Battle Skill DMG') bonuses.battleSkillDmg += statValue;
          else if (statName === 'Ultimate DMG') bonuses.ultimateDmg += statValue;
          else if (statName === 'Ultimate SP Gain') bonuses.ultimateGain += statValue;
          else if (statName === 'SP Recovery') bonuses.spRecovery += statValue;
        });
      }
    });

    // ===== ТАЛАНТЫ ПЕРСОНАЖА =====
    if (talents && talents.length > 0) {
      talents.forEach(talent => {
        // Пропускаем attribute scaling таланты - их обработаем позже
        if (talent.isAttributeScaling) return;
        
        if (!talent.bonuses || Object.keys(talent.bonuses).length === 0) return;

        const talentKey = `talent_${selectedOp.name}_${talent.name}`;
        const stacksKey = `talent_stacks_${selectedOp.name}_${talent.name}`;
        const isActive = !talent.isConditional || conditions[talentKey];

        if (isActive) {
          // Определяем множитель стаков
          let stackMultiplier = 1;
          if (talent.maxStacks && conditions[talentKey]) {
            stackMultiplier = stacks[stacksKey] || 0;
            if (stackMultiplier === 0) return; // Если 0 стаков - не применяем бонус
          }

          // Бонусы атрибутов (НЕ умножаются на стаки - они пассивные)
          if (!talent.maxStacks) {
            if (talent.bonuses.agility) agi += talent.bonuses.agility;
            if (talent.bonuses.strength) str += talent.bonuses.strength;
            if (talent.bonuses.intellect) int += talent.bonuses.intellect;
            if (talent.bonuses.will) will += talent.bonuses.will;
          }

          // Остальные бонусы (умножаются на стаки если есть)
          Object.entries(talent.bonuses).forEach(([key, value]) => {
            if (['agility', 'strength', 'intellect', 'will'].includes(key) && !talent.maxStacks) return;
            if (bonuses[key] !== undefined) {
              bonuses[key] += value * stackMultiplier;
            }
            // Атрибуты со стаками
            if (talent.maxStacks) {
              if (key === 'agility') agi += value * stackMultiplier;
              if (key === 'strength') str += value * stackMultiplier;
              if (key === 'intellect') int += value * stackMultiplier;
              if (key === 'will') will += value * stackMultiplier;
            }
          });
        }
      });
    }

    // ===== СИСТЕМА ОРУЖИЯ =====
    let weaponAtk = 0;
    let weaponBonuses = { skill1: null, skill2: null, skill3: null };

    if (weapon) {
      // ATK оружия по уровню - используем реальные данные из JSON если доступны
      if (weapon.attributesData) {
        weaponAtk = calculateWeaponATK(weapon.attributesData, weaponLevel);
      } else {
        // Fallback на формулу
        weaponAtk = getWeaponATK(weapon, weaponLevel);
      }
      baseAtk += weaponAtk;

      // Если есть загруженные данные навыков (skillsData из JSON)
      if (weapon.skillsData && weapon.skillsData.length > 1) {
        const headers = weapon.skillsData[0];
        const ranks = weapon.skillsData.slice(1);

        // Расчёт рангов навыков
        let skill1Rank = 1;
        let skill2Rank = 1;
        let skill3Rank = 1;

        // Калибровка: T1→S1+1, T2→S2+1, T3→S1+1, T4→S2+1
        if (tuningStage >= 1) skill1Rank += 1;
        if (tuningStage >= 2) skill2Rank += 1;
        if (tuningStage >= 3) skill1Rank += 1;
        if (tuningStage >= 4) skill2Rank += 1;

        // Потенциал добавляет к Skill 3
        skill3Rank += Math.min(potential, 5);

        // Эссенции могут добавлять к рангам (с индивидуальными бонусами)
        if (essence?.stats) {
          const skill1Base = headers[1]?.replace(/\s*\[[LMS]\]$/i, '').trim();
          const skill2Base = headers[2]?.replace(/\s*\[[LMS]\]$/i, '').trim();
          const skill3Prefix = headers[3]?.split(':')[0]?.trim();

          essence.stats.forEach(stat => {
            const bonus = stat.bonus || 1; // Используем индивидуальный бонус стата

            // Primary → Skill 1
            if (['Agility Boost', 'Intellect Boost', 'Main Attribute Boost', 'Strength Boost', 'Will Boost'].includes(stat.type)) {
              if (skill1Base === stat.type) {
                skill1Rank += bonus;
              }
            }
            // Secondary → Skill 2
            else if (['ATK Boost', 'Attack Boost', 'Arts Intensity Boost', 'HP Boost', 'Critical Rate Boost', 'Treatment Efficiency Boost', 'Ultimate Gain Efficiency Boost'].includes(stat.type)) {
              if (skill2Base === stat.type || skill2Base?.includes(stat.type)) {
                skill2Rank += bonus;
              }
            }
            // Passive Prefixes → Skill 3
            else if (['Brutality', 'Combative', 'Crusher', 'Detonate', 'Efficacy', 'Flow', 'Fracture', 'Infliction', 'Inspiring', 'Medicant', 'Pursuit', 'Suppression', 'Twilight'].includes(stat.type)) {
              if (skill3Prefix === stat.type) {
                skill3Rank += bonus;
              }
            }
          });
        }

        // Ограничиваем ранги до 9
        skill1Rank = Math.min(skill1Rank, 9);
        skill2Rank = Math.min(skill2Rank, 9);
        skill3Rank = Math.min(skill3Rank, 9);

        // Получаем данные рангов
        const skill1Data = ranks[skill1Rank - 1];
        const skill2Data = ranks[skill2Rank - 1];
        const skill3Data = ranks[skill3Rank - 1];

        // ===== SKILL 1: Attribute Boost =====
        if (skill1Data && skill1Data[1]) {
          const skill1Parsed = parseSkill1(skill1Data[1]);
          weaponBonuses.skill1 = skill1Parsed;

          if (skill1Parsed) {
            if (skill1Parsed.type === 'mainAttr') {
              // Main Attribute Boost добавляется к главному атрибуту персонажа
              if (selectedOp.mainAttr === 'Strength') str += skill1Parsed.value;
              else if (selectedOp.mainAttr === 'Agility') agi += skill1Parsed.value;
              else if (selectedOp.mainAttr === 'Intellect') int += skill1Parsed.value;
              else if (selectedOp.mainAttr === 'Will') will += skill1Parsed.value;
            } else {
              if (skill1Parsed.type === 'strength') str += skill1Parsed.value;
              else if (skill1Parsed.type === 'agility') agi += skill1Parsed.value;
              else if (skill1Parsed.type === 'intellect') int += skill1Parsed.value;
              else if (skill1Parsed.type === 'will') will += skill1Parsed.value;
            }
          }
        }

        // ===== SKILL 2: ATK%/HP%/Arts Intensity =====
        if (skill2Data && skill2Data[2]) {
          const skill2Parsed = parseSkill2(skill2Data[2]);
          weaponBonuses.skill2 = skill2Parsed;

          if (skill2Parsed) {
            // ATK% от оружия добавляется к базовой ATK (не к общему бонусу!)
            // Это процент от базы (персонаж + оружие), который идёт в базу
            if (skill2Parsed.atkPercent) {
              weaponBonuses.weaponAtkPercent = skill2Parsed.atkPercent;
              // Добавляем как бонус к базе: baseAtk = baseAtk * (1 + atkPercent/100)
              const atkBonusFromWeapon = Math.floor(baseAtk * skill2Parsed.atkPercent / 100);
              baseAtk += atkBonusFromWeapon;
              weaponBonuses.weaponAtkBonus = atkBonusFromWeapon;
            }
            if (skill2Parsed.maxHp) bonuses.maxHp += skill2Parsed.maxHp;
            if (skill2Parsed.artsIntensity) bonuses.artsIntensity += skill2Parsed.artsIntensity;
            if (skill2Parsed.critRate) bonuses.critRate += skill2Parsed.critRate;
            if (skill2Parsed.ultimateGain) bonuses.ultimateGain += skill2Parsed.ultimateGain;
            if (skill2Parsed.treatmentEff) bonuses.treatmentEff += skill2Parsed.treatmentEff;
          }
        }

        // ===== SKILL 3: Passive =====
        if (skill3Data && skill3Data[3]) {
          const skill3Parsed = parseSkill3(skill3Data[3]);
          weaponBonuses.skill3 = {
            ...skill3Parsed,
            name: headers[3],
            rank: skill3Rank
          };

          if (skill3Parsed) {
            // Базовые бонусы пассивки применяются всегда
            Object.entries(skill3Parsed.baseBonuses).forEach(([key, value]) => {
              if (bonuses[key] !== undefined) bonuses[key] += value;
            });

            // Условные бонусы применяются если активирован чекбокс
            const passiveConditionKey = `weapon_passive_${weapon.id}`;
            if (conditions[passiveConditionKey] && skill3Parsed.conditionalBonuses) {
              Object.entries(skill3Parsed.conditionalBonuses).forEach(([key, value]) => {
                if (bonuses[key] !== undefined) bonuses[key] += value;
              });
            }
          }
        }
      }
    }
    
    // Определяем активный сет
    const setCounts = {};
    gearPieces.forEach(g => { 
      setCounts[g.set] = (setCounts[g.set] || 0) + 1; 
    });
    const activeSet = Object.entries(setCounts).find(([_, count]) => count >= 3)?.[0];
    let setData = activeSet ? GEAR_SETS[activeSet] : null;
    let conditionalBonuses = [];
    
    // Базовый бонус сета
    if (setData?.baseBonus) {
      Object.entries(setData.baseBonus).forEach(([key, value]) => {
        if (key === 'hpFlat') baseHp += value;
        else if (bonuses[key] !== undefined) bonuses[key] += value;
      });
    }
    
    // Условные бонусы сета
    if (setData?.conditionalBonus) {
      const cb = setData.conditionalBonus;
      
      if (cb.maxStacks && stacks.set) {
        const stackCount = Math.min(stacks.set, cb.maxStacks);
        if (cb.perStack) {
          Object.entries(cb.perStack).forEach(([key, value]) => {
            if (bonuses[key] !== undefined) {
              const bonus = value * stackCount;
              bonuses[key] += bonus;
              conditionalBonuses.push(`${STAT_NAMES[key] || key} +${bonus}% (${stackCount})`);
            }
          });
        }
        if (stackCount >= cb.maxStacks && cb.atMaxStacks) {
          Object.entries(cb.atMaxStacks).forEach(([key, value]) => {
            bonuses[key] += value;
            conditionalBonuses.push(`${STAT_NAMES[key] || key} +${value}% (макс)`);
          });
        }
      }
      
      if (cb.condition && conditions[cb.condition] && cb.bonus) {
        Object.entries(cb.bonus).forEach(([key, value]) => {
          if (bonuses[key] !== undefined) { 
            bonuses[key] += value; 
            conditionalBonuses.push(`${STAT_NAMES[key] || key} +${value}%`); 
          }
        });
      }
    }
    
    // ===== ATTRIBUTE SCALING ТАЛАНТЫ (Lifeng, Arclight, Catcher и т.д.) =====
    // Обрабатываем ПОСЛЕ всех атрибутов, чтобы учесть финальные значения
    if (talents && talents.length > 0) {
      talents.forEach(talent => {
        if (!talent.isAttributeScaling || !talent.attributeScalingFormula) return;

        const talentKey = `talent_${selectedOp.name}_${talent.name}`;
        const isActive = !talent.isConditional || conditions[talentKey];

        if (isActive) {
          const formula = talent.attributeScalingFormula;
          const attrMap = { strength: str, agility: agi, intellect: int, will: will };

          if (formula.type === 'atkPercent') {
            // Lifeng: Every point of Intellect and Will grants ATK +0.15%
            let totalBonus = 0;
            formula.attributes.forEach(attr => {
              totalBonus += (attrMap[attr] || 0) * formula.perPoint;
            });
            bonuses.atkPercent += totalBonus;
          } else if (formula.type.endsWith('Dmg')) {
            // Arclight: For every 1 Intellect, Electric DMG +0.1%
            const attrValue = attrMap[formula.attribute] || 0;
            const bonus = (attrValue / formula.perPoints) * formula.bonus;
            bonuses[formula.type] = (bonuses[formula.type] || 0) + bonus;
          } else if (formula.type === 'def') {
            // Catcher: For every 10 Will, DEF +1.2
            const attrValue = attrMap[formula.attribute] || 0;
            const bonus = (attrValue / formula.perPoints) * formula.bonus;
            defense += bonus;
          }
        }
      });
    }
    
    // Расчёт итогового ATK
    const attrMap = { Strength: str, Agility: agi, Intellect: int, Will: will };
    const mainAttrVal = attrMap[selectedOp.mainAttr] || 0;
    const subAttrVal = attrMap[selectedOp.subAttr] || 0;
    const mainAtkBonus = mainAttrVal * 0.5;
    const subAtkBonus = subAttrVal * 0.2;
    const totalAtkBonus = mainAtkBonus + subAtkBonus + bonuses.atkPercent;
    
    const finalAtk = Math.floor(baseAtk * (1 + totalAtkBonus / 100));
    const finalHp = Math.floor((baseHp + str * 5) * (1 + bonuses.maxHp / 100));
    const dmgReduction = defense > 0 ? (defense / (defense + 200)) * 100 : 0;
    
    return {
      finalAtk,
      finalHp,
      weaponAtk,
      baseAtk, // Базовая ATK после бонуса оружия
      defense,
      dmgReduction: dmgReduction + bonuses.dmgReduction,
      str, agi, int, will,
      mainAttrVal, subAttrVal,
      mainAtkBonus, subAtkBonus, totalAtkBonus,
      ...bonuses,
      activeSet,
      setData,
      conditionalBonuses,
      weaponBonuses
    };
  }, [selectedOp, level, gear, weapon, conditions, stacks, weaponLevel, tuningStage, potential, essence, elite, talents]);
};

export default useStats;
