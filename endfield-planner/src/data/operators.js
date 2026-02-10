// Загрузка навыков персонажа из JSON
export const loadOperatorSkills = async (operatorName) => {
  try {
    const response = await fetch(`/data/operators/${operatorName}/${operatorName}_CombatSkills.json`);
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to load skills for ${operatorName}:`, error);
    return null;
  }
};

// Маппинг типа оружия -> иконка базовой атаки
const WEAPON_ATTACK_ICONS = {
  'Sword': '64px-Attack-Sword.webp',
  'Great Sword': '65px-Attack-Greatsword.webp',
  'Polearm': '59px-Attack-Polearm.webp',
  'Arts Unit': '63px-Attack-Orbiter.webp',
  'Handcannon': '65px-Attack-Guns.webp'
};

// Персонажи с отличающимися именами иконок
const ICON_NAME_MAP = {
  'Chen Qianyu': 'Chen',
  'Da Pan': 'Dapan',
  'Endministrator': 'Endmin',
  'Last Rite': 'Lastrite'
};

// Персонажи с нестандартным размером иконок (prefix)
const ICON_SIZE_MAP = {
  'Gilberta': { skill: '64px', combo: '64px', ult: '65px' },
  'Xaihi': { skill: '65px', combo: '65px', ult: '64px' }
};

// Получить иконки навыков для персонажа
export const getSkillIcons = (operatorName, weaponType) => {
  const attackIcon = WEAPON_ATTACK_ICONS[weaponType] || '64px-Attack-Sword.webp';
  const iconName = ICON_NAME_MAP[operatorName] || operatorName;
  const sizes = ICON_SIZE_MAP[operatorName] || { skill: '65px', combo: '65px', ult: '65px' };
  return {
    'Basic Attack': `/data/operators/${operatorName}/${attackIcon}`,
    'Battle Skill': `/data/operators/${operatorName}/${sizes.skill}-Skill-${iconName}.webp`,
    'Combo Skill': `/data/operators/${operatorName}/${sizes.combo}-Combo-${iconName}.webp`,
    'Ultimate': `/data/operators/${operatorName}/${sizes.ult}-Ult-${iconName}.webp`
  };
};

// Загрузка потенциала персонажа из JSON
export const loadOperatorPotential = async (operatorName) => {
  try {
    const response = await fetch(`/data/operators/${operatorName}/${operatorName}_Potential.json`);
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to load potential for ${operatorName}:`, error);
    return null;
  }
};

// Получить путь к иконке токена
export const getTokenIcon = (operatorName) => {
  const fileName = operatorName.replace(/ /g, '_');
  return `/data/operators/${operatorName}/55px-${fileName}'s_Token.webp`;
};

// Загрузка данных атрибутов персонажа из JSON
export const loadOperatorAttributes = async (operatorId) => {
  try {
    const formattedId = operatorId.charAt(0).toUpperCase() + operatorId.slice(1).replace(/([A-Z])/g, ' $1').trim();
    const response = await fetch(`/data/operators/${formattedId}/${formattedId}_Attributes.json`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.stats;
  } catch (error) {
    console.error(`Failed to load attributes for ${operatorId}:`, error);
    return null;
  }
};

// Загрузка талантов персонажа из JSON
export const loadOperatorTalents = async (operatorName) => {
  try {
    const response = await fetch(`/data/operators/${operatorName}/${operatorName}_Talents.json`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.upgrades;
  } catch (error) {
    console.error(`Failed to load talents for ${operatorName}:`, error);
    return null;
  }
};

// Парсинг бонусов из описания таланта
export const parseTalentBonus = (description) => {
  if (!description) return null;

  const result = {
    bonuses: {},
    condition: null,
    isConditional: false,
    isStackable: false, // Только атрибуты складываются между элитами!
    maxStacks: null, // Если есть лимит стаков в бою
    description,
    isAttributeScaling: false, // Бонус зависит от атрибутов
    attributeScalingFormula: null // Формула расчета
  };

  // Бонусы атрибутов (ТОЛЬКО ЭТИ СКЛАДЫВАЮТСЯ между элитами!)
  const attrMatch = description.match(/Operator\s+(Agility|Strength|Intellect|Will)\s*\+(\d+)/i);
  if (attrMatch) {
    const attr = attrMatch[1].toLowerCase();
    result.bonuses[attr] = parseInt(attrMatch[2]);
    result.isStackable = true; // Атрибуты складываются!
    return result;
  }

  // Специальные бонусы от атрибутов (Lifeng, Arclight, Catcher и т.д.)
  // Lifeng: Every point of Intellect and Will further grants ATK +0.15%
  const lifengMatch = description.match(/Every point of (Intellect|Will|Agility|Strength)(?: and (Intellect|Will|Agility|Strength))? (?:further )?grants ATK \+(\d+(?:\.\d+)?)%/i);
  if (lifengMatch) {
    result.isAttributeScaling = true;
    result.attributeScalingFormula = {
      type: 'atkPercent',
      attributes: [lifengMatch[1].toLowerCase(), lifengMatch[2]?.toLowerCase()].filter(Boolean),
      perPoint: parseFloat(lifengMatch[3])
    };
    result.isConditional = false; // Это не условный бонус, а постоянный
    return result;
  }

  // Arclight: For every 1 Intellect, Electric DMG Dealt +0.1%
  const arclightMatch = description.match(/For every (\d+) (Intellect|Will|Agility|Strength), (Electric|Heat|Cryo|Physical|Nature) DMG(?: Dealt)? \+(\d+(?:\.\d+)?)%/i);
  if (arclightMatch) {
    const element = arclightMatch[3].toLowerCase();
    result.isAttributeScaling = true;
    result.attributeScalingFormula = {
      type: element + 'Dmg',
      attribute: arclightMatch[2].toLowerCase(),
      perPoints: parseInt(arclightMatch[1]),
      bonus: parseFloat(arclightMatch[4])
    };
    result.isConditional = false;
    return result;
  }

  // Catcher: For every 10 Will, DEF +1.2
  const catcherMatch = description.match(/For every (\d+) (Intellect|Will|Agility|Strength), DEF \+(\d+(?:\.\d+)?)/i);
  if (catcherMatch) {
    result.isAttributeScaling = true;
    result.attributeScalingFormula = {
      type: 'def',
      attribute: catcherMatch[2].toLowerCase(),
      perPoints: parseInt(catcherMatch[1]),
      bonus: parseFloat(catcherMatch[3])
    };
    result.isConditional = false;
    return result;
  }

  // ATK% (НЕ складывается - улучшается)
  const atkMatch = description.match(/(?:gains?\s+)?ATK\s*\+(\d+)%/i);
  if (atkMatch) {
    result.bonuses.atkPercent = parseInt(atkMatch[1]);
    result.isConditional = true; // ATK% всегда условный
  }

  // Arts Intensity (НЕ складывается - улучшается)
  const artsIntMatch = description.match(/Arts Intensity\s*\+(\d+)/i);
  if (artsIntMatch) {
    result.bonuses.artsIntensity = parseInt(artsIntMatch[1]);
    result.isConditional = true;
  }

  // DMG bonuses (НЕ складываются - улучшаются)
  const dmgPatterns = [
    { regex: /Physical DMG(?:\s+Dealt)?\s*\+(\d+(?:\.\d+)?)%/i, key: 'physDmg' },
    { regex: /Heat DMG(?:\s+Dealt)?\s*\+(\d+(?:\.\d+)?)%/i, key: 'heatDmg' },
    { regex: /Cryo DMG(?:\s+Dealt)?\s*\+(\d+(?:\.\d+)?)%/i, key: 'cryoDmg' },
    { regex: /Electric DMG(?:\s+Dealt)?\s*\+(\d+(?:\.\d+)?)%/i, key: 'electricDmg' },
    { regex: /Nature DMG(?:\s+Dealt)?\s*\+(\d+(?:\.\d+)?)%/i, key: 'natureDmg' },
    { regex: /Arts DMG(?:\s+Dealt)?\s*\+(\d+(?:\.\d+)?)%/i, key: 'artsDmg' },
    { regex: /Skill DMG(?:\s+Dealt)?\s*\+(\d+(?:\.\d+)?)%/i, key: 'skillDmg' },
    { regex: /Battle Skill DMG(?:\s+Dealt)?\s*\+(\d+(?:\.\d+)?)%/i, key: 'battleSkillDmg' },
    { regex: /Combo Skill DMG(?:\s+Dealt)?\s*\+(\d+(?:\.\d+)?)%/i, key: 'comboSkillDmg' },
    { regex: /Ultimate DMG(?:\s+Dealt)?\s*\+(\d+(?:\.\d+)?)%/i, key: 'ultimateDmg' },
    { regex: /Critical Rate\s*\+(\d+(?:\.\d+)?)%/i, key: 'critRate' },
    { regex: /Critical DMG(?:\s+Dealt)?\s*\+(\d+(?:\.\d+)?)%/i, key: 'critDmg' },
    { regex: /Treatment Efficiency\s*\+(\d+(?:\.\d+)?)%/i, key: 'treatmentEff' },
    { regex: /DMG Reduction\s*\+(\d+(?:\.\d+)?)%/i, key: 'dmgReduction' },
    { regex: /Physical DMG Taken\s*\+(\d+(?:\.\d+)?)%/i, key: 'enemyPhysDmgTaken' },
  ];

  dmgPatterns.forEach(({ regex, key }) => {
    const match = description.match(regex);
    if (match) {
      result.bonuses[key] = parseFloat(match[1]);
      result.isConditional = true; // Все DMG% бонусы условные
    }
  });

  // Проверяем на лимит стаков в бою
  const stackMatch = description.match(/can reach (\d+) stacks?/i);
  if (stackMatch) {
    result.maxStacks = parseInt(stackMatch[1]);
  }

  // Определение условия активации
  if (description.includes('Originium Crystals')) {
    result.condition = 'originiumCrystals';
    result.isConditional = true;
  } else if (description.includes('Combustion') || description.includes('burning')) {
    result.condition = 'combustion';
    result.isConditional = true;
  } else if (description.includes('Electrification')) {
    result.condition = 'electrification';
    result.isConditional = true;
  } else if (description.includes('Solidification') || description.includes('frozen') || description.includes('Slowed')) {
    result.condition = 'solidification';
    result.isConditional = true;
  } else if (description.includes('Corrosion')) {
    result.condition = 'corrosion';
    result.isConditional = true;
  } else if (description.includes('Vulnerability')) {
    result.condition = 'vulnerability';
    result.isConditional = true;
  } else if (description.includes('improved')) {
    result.condition = 'skillImproved';
    result.isConditional = true;
  } else if (description.includes('recovering') && description.includes('SP')) {
    result.condition = 'spRecovery';
    result.isConditional = true;
  }

  // Если описание содержит условия - это условный бонус
  if (description.match(/\b(When|After|gains|consumed|During|against|Grants)\b/i)) {
    result.isConditional = true;
  }

  return result;
};

// Получить активные таланты для текущей элиты
export const getActiveTalents = (talents, elite) => {
  if (!talents) return [];

  const result = [];
  const eliteNames = ['Elite 1', 'Elite 2', 'Elite 3', 'Elite 4'];

  Object.entries(talents).forEach(([talentName, eliteData]) => {
    if (talentName === 'Elite 1' && Object.keys(eliteData).length === 0) return;

    const totalBonuses = {};
    const breakdown = [];
    let lastDescription = null;
    let isConditional = false;
    let condition = null;
    let maxElite = 0;
    let isStationSkill = false;
    let maxStacks = null;
    let isAttributeScaling = false;
    let attributeScalingFormula = null;

    eliteNames.forEach((eliteName, index) => {
      if (index < elite && eliteData[eliteName]) {
        const description = eliteData[eliteName];

        // Пропускаем навыки станции
        if (description.includes('Assign to') || description.includes('Manufacturing') || description.includes('Reception Room')) {
          isStationSkill = true;
          return;
        }

        const parsed = parseTalentBonus(description);
        lastDescription = description;
        maxElite = index + 1;

        if (parsed) {
          if (parsed.maxStacks) {
            maxStacks = parsed.maxStacks;
          }

          // Сохраняем информацию о скейлинге от атрибутов
          if (parsed.isAttributeScaling) {
            isAttributeScaling = true;
            attributeScalingFormula = parsed.attributeScalingFormula;
          }

          // isStackable = true ТОЛЬКО для атрибутов (Agility, Strength, etc.)
          // Всё остальное УЛУЧШАЕТСЯ (перезаписывается)
          if (parsed.isStackable) {
            // Атрибуты СКЛАДЫВАЮТСЯ между элитами
            Object.entries(parsed.bonuses).forEach(([key, value]) => {
              if (totalBonuses[key]) {
                totalBonuses[key] += value;
              } else {
                totalBonuses[key] = value;
              }
            });
            // Добавляем в разбивку для отображения
            if (Object.keys(parsed.bonuses).length > 0) {
              breakdown.push({ elite: index + 1, bonuses: { ...parsed.bonuses }, description });
            }
          } else if (!parsed.isAttributeScaling) {
            // Все остальные бонусы УЛУЧШАЮТСЯ (берём последнее значение)
            // НО НЕ для attribute scaling - те нужно хранить отдельно
            isConditional = parsed.isConditional;
            condition = parsed.condition;
            Object.entries(parsed.bonuses).forEach(([key, value]) => {
              totalBonuses[key] = value; // Перезаписываем!
            });
            // Для улучшаемых - показываем только текущую элиту
            breakdown.length = 0;
            breakdown.push({ elite: index + 1, bonuses: { ...parsed.bonuses }, description });
          }
        }
      }
    });

    if (isStationSkill) return;

    // Добавляем талант даже если нет распознанных бонусов (для отображения описания)
    if (lastDescription) {
      result.push({
        name: talentName,
        elite: maxElite,
        description: lastDescription,
        bonuses: totalBonuses,
        breakdown,
        isConditional,
        condition,
        maxStacks, // Если талант может стакаться в бою
        hasNumericBonus: Object.keys(totalBonuses).length > 0,
        isAttributeScaling, // Бонус зависит от атрибутов
        attributeScalingFormula // Формула расчета
      });
    }
  });

  return result;
};

export const OPERATORS = [
  { id: 'endministrator', name: 'Endministrator', rarity: 6, class: 'Guard', element: 'Physical', weapon: 'Sword', mainAttr: 'Agility', subAttr: 'Strength', baseAtk: 25, baseHp: 500, icon: '🔷', attributesPath: 'Endministrator' },
  { id: 'laevatain', name: 'Laevatain', rarity: 6, class: 'Striker', element: 'Heat', weapon: 'Sword', mainAttr: 'Intellect', subAttr: 'Strength', baseAtk: 28, baseHp: 500, icon: '🔥', attributesPath: 'Laevatain' },
  { id: 'ardelia', name: 'Ardelia', rarity: 6, class: 'Supporter', element: 'Nature', weapon: 'Arts Unit', mainAttr: 'Intellect', subAttr: 'Will', baseAtk: 26, baseHp: 500, icon: '⚡', attributesPath: 'Ardelia' },
  { id: 'gilberta', name: 'Gilberta', rarity: 6, class: 'Supporter', element: 'Nature', weapon: 'Arts Unit', mainAttr: 'Will', subAttr: 'Intellect', baseAtk: 24, baseHp: 550, icon: '❄️', attributesPath: 'Gilberta' },
  { id: 'lastrite', name: 'Last Rite', rarity: 6, class: 'Striker', element: 'Cryo', weapon: 'Great Sword', mainAttr: 'Strength', subAttr: 'Will', baseAtk: 27, baseHp: 500, icon: '🌀', attributesPath: 'Last Rite' },
  { id: 'lifeng', name: 'Lifeng', rarity: 6, class: 'Guard', element: 'Physical', weapon: 'Polearm', mainAttr: 'Agility', subAttr: 'Strength', baseAtk: 26, baseHp: 500, icon: '🌿', attributesPath: 'Lifeng' },
  { id: 'pogranichnik', name: 'Pogranichnik', rarity: 6, class: 'Vanguard', element: 'Physical', weapon: 'Sword', mainAttr: 'Will', subAttr: 'Agility', baseAtk: 27, baseHp: 520, icon: '⚔️', attributesPath: 'Pogranichnik' },
  { id: 'ember', name: 'Ember', rarity: 6, class: 'Defender', element: 'Heat', weapon: 'Great Sword', mainAttr: 'Strength', subAttr: 'Will', baseAtk: 23, baseHp: 580, icon: '🔶', attributesPath: 'Ember' },
  { id: 'yvonne', name: 'Yvonne', rarity: 6, class: 'Striker', element: 'Cryo', weapon: 'Handcannon', mainAttr: 'Intellect', subAttr: 'Agility', baseAtk: 25, baseHp: 480, icon: '💜', attributesPath: 'Yvonne' },
  { id: 'chenqianyu', name: 'Chen Qianyu', rarity: 6, class: 'Guard', element: 'Physical', weapon: 'Sword', mainAttr: 'Agility', subAttr: 'Strength', baseAtk: 22, baseHp: 520, icon: '🌸', attributesPath: 'Chen Qianyu' },
  { id: 'arclight', name: 'Arclight', rarity: 5, class: 'Vanguard', element: 'Electric', weapon: 'Sword', mainAttr: 'Agility', subAttr: 'Intellect', baseAtk: 24, baseHp: 500, icon: '⚡', attributesPath: 'Arclight' },
  { id: 'perlica', name: 'Perlica', rarity: 5, class: 'Caster', element: 'Electric', weapon: 'Arts Unit', mainAttr: 'Intellect', subAttr: 'Will', baseAtk: 25, baseHp: 480, icon: '💎', attributesPath: 'Perlica' },
  { id: 'avywenna', name: 'Avywenna', rarity: 5, class: 'Striker', element: 'Electric', weapon: 'Polearm', mainAttr: 'Will', subAttr: 'Agility', baseAtk: 24, baseHp: 480, icon: '🔮', attributesPath: 'Avywenna' },
  { id: 'snowshine', name: 'Snowshine', rarity: 5, class: 'Defender', element: 'Cryo', weapon: 'Great Sword', mainAttr: 'Strength', subAttr: 'Will', baseAtk: 21, baseHp: 520, icon: '❄️', attributesPath: 'Snowshine' },
  { id: 'dapan', name: 'Da Pan', rarity: 5, class: 'Striker', element: 'Physical', weapon: 'Great Sword', mainAttr: 'Strength', subAttr: 'Will', baseAtk: 22, baseHp: 550, icon: '🛡️', attributesPath: 'Da Pan' },
  { id: 'wulfgard', name: 'Wulfgard', rarity: 5, class: 'Caster', element: 'Heat', weapon: 'Handcannon', mainAttr: 'Strength', subAttr: 'Agility', baseAtk: 25, baseHp: 510, icon: '🐺', attributesPath: 'Wulfgard' },
  { id: 'alesh', name: 'Alesh', rarity: 5, class: 'Vanguard', element: 'Cryo', weapon: 'Sword', mainAttr: 'Strength', subAttr: 'Intellect', baseAtk: 24, baseHp: 500, icon: '❄️', attributesPath: 'Alesh' },
  { id: 'xaihi', name: 'Xaihi', rarity: 5, class: 'Supporter', element: 'Cryo', weapon: 'Arts Unit', mainAttr: 'Will', subAttr: 'Intellect', baseAtk: 21, baseHp: 520, icon: '💙', attributesPath: 'Xaihi' },
  { id: 'akekuri', name: 'Akekuri', rarity: 4, class: 'Vanguard', element: 'Heat', weapon: 'Sword', mainAttr: 'Agility', subAttr: 'Intellect', baseAtk: 23, baseHp: 500, icon: '🗡️', attributesPath: 'Akekuri' },
  { id: 'antal', name: 'Antal', rarity: 4, class: 'Supporter', element: 'Electric', weapon: 'Arts Unit', mainAttr: 'Intellect', subAttr: 'Strength', baseAtk: 22, baseHp: 480, icon: '⚡', attributesPath: 'Antal' },
  { id: 'catcher', name: 'Catcher', rarity: 4, class: 'Defender', element: 'Physical', weapon: 'Great Sword', mainAttr: 'Strength', subAttr: 'Will', baseAtk: 21, baseHp: 540, icon: '🛡️', attributesPath: 'Catcher' },
  { id: 'estella', name: 'Estella', rarity: 4, class: 'Guard', element: 'Cryo', weapon: 'Polearm', mainAttr: 'Will', subAttr: 'Strength', baseAtk: 22, baseHp: 500, icon: '❄️', attributesPath: 'Estella' },
  { id: 'fluorite', name: 'Fluorite', rarity: 4, class: 'Caster', element: 'Nature', weapon: 'Handcannon', mainAttr: 'Agility', subAttr: 'Intellect', baseAtk: 19, baseHp: 510, icon: '💠', attributesPath: 'Fluorite' },
];

export const CLASS_COLORS = { 
  Guard: '#f97316', 
  Defender: '#3b82f6', 
  Caster: '#a855f7', 
  Striker: '#ef4444', 
  Supporter: '#22c55e', 
  Vanguard: '#eab308' 
};

export const ELEMENT_COLORS = { 
  Physical: '#f97316', 
  Heat: '#ef4444', 
  Electric: '#a855f7', 
  Cryo: '#06b6d4', 
  Nature: '#22c55e' 
};
