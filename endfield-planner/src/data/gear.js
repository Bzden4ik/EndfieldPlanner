// Equipment system for Endfield Planner
// All Lv70 equipment sets with individual stat upgrade system

/**
 * Parse set effect description and extract bonuses
 */
const parseSetEffect = (setEffect) => {
  if (!setEffect) return { baseBonus: '', conditionalBonus: '' };
  
  // Remove "3-piece set effect: " prefix
  let cleanEffect = setEffect.replace(/^3-piece set effect:\s*/i, '');
  
  // Split by "When" or "After" to separate base and conditional
  const splitMatch = cleanEffect.match(/(.*?)\s*(?:When|After)\s*(.*)/);
  
  if (splitMatch) {
    return {
      baseBonus: splitMatch[1].trim(),
      conditionalBonus: splitMatch[2].trim()
    };
  }
  
  // If no When/After, entire effect is base bonus
  return {
    baseBonus: cleanEffect.trim(),
    conditionalBonus: ''
  };
};

let equipmentData = null;

export let GEAR_SETS = {};
export let GEAR_ITEMS = [];

/**
 * Load equipment data from JSON
 */
export const loadEquipmentData = async () => {
  try {
    const response = await fetch('/data/gear/all_equipment.json');
    if (!response.ok) {
      console.error('Failed to load equipment data');
      return false;
    }
    
    equipmentData = await response.json();
    GEAR_SETS = {};
    GEAR_ITEMS = [];
    
    Object.entries(equipmentData).forEach(([setName, setData]) => {
      const { baseBonus, conditionalBonus } = parseSetEffect(setData.setEffect);
      GEAR_SETS[setName] = {
        name: setName,
        setEffect: setData.setEffect,
        baseBonus,
        conditionalBonus
      };
      
      Object.entries(setData.equipment).forEach(([slotType, items]) => {
        const slotMap = { 'Body': 'armor', 'Hand': 'gloves', 'EDC': 'kit' };
        const slot = slotMap[slotType] || slotType.toLowerCase();
        
        items.forEach(item => {
          // Generate readable name from itemId
          // Example: "item_equip_t4_suit_attri01_body_01" -> "Body"
          let name = item.itemId
            .replace(/^item_equip_t4_suit_/, '') // Remove prefix
            .replace(/_\d+$/, ''); // Remove trailing number
          
          // Extract slot type (body, hand, edc)
          const nameParts = name.split('_');
          const slotPart = nameParts[nameParts.length - 1]; // Last part is slot type
          
          // Capitalize slot type for display
          const displayName = slotPart.charAt(0).toUpperCase() + slotPart.slice(1);
          
          GEAR_ITEMS.push({
            id: item.itemId,
            name: `${setName} ${displayName}`,
            set: setName,
            slot: slot,
            stats: { ...item.baseStats },
            icon: item.imageSrc,
            _raw: item
          });
        });
      });
    });
    
    console.log(`Loaded ${Object.keys(GEAR_SETS).length} sets, ${GEAR_ITEMS.length} items`);
    return true;
  } catch (error) {
    console.error('Error loading equipment:', error);
    return false;
  }
};

/**
 * Get equipment items by slot
 */
export const getEquipmentBySlot = (slot) => {
  return GEAR_ITEMS.filter(item => item.slot === slot);
};

/**
 * Get equipment items by set name
 */
export const getEquipmentBySet = (setName) => {
  return GEAR_ITEMS.filter(item => item.set === setName);
};

/**
 * Calculate final stats with upgrades
 */
export const calculateEquipmentStats = (item, upgradeLevels = {}) => {
  if (!item || !item._raw || !item._raw.baseStats) return item.stats;
  
  const raw = item._raw;
  const finalStats = { ...raw.baseStats };
  
  if (raw.statUpgrades && upgradeLevels) {
    Object.entries(upgradeLevels).forEach(([statName, level]) => {
      if (level > 0 && raw.statUpgrades[statName]) {
        const upgradeKey = `+${level}`;
        const delta = raw.statUpgrades[statName][upgradeKey];
        
        if (delta) {
          const baseStat = finalStats[statName];
          if (baseStat) {
            const isPercent = baseStat.includes('%');
            const baseValue = parseFloat(baseStat.replace('%', ''));
            const deltaValue = parseFloat(delta.replace('%', ''));
            const finalValue = baseValue + deltaValue;
            finalStats[statName] = isPercent ? `${finalValue.toFixed(1)}%` : `${Math.round(finalValue)}`;
          }
        }
      }
    });
  }
  
  return finalStats;
};

/**
 * Parse stat value
 */
export const parseStatValue = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace('%', '').trim();
    return parseFloat(cleaned) || 0;
  }
  return 0;
};

/**
 * Check if stat is percentage
 */
export const isPercentageStat = (statName) => {
  const percentStats = [
    'DMG to Broken', 'Arts Intensity',
    'Physical DMG', 'Heat DMG', 'Cryo DMG', 'Electric DMG', 'Nature DMG',
    'Critical Rate', 'Critical DMG', 'Treatment Efficiency',
    'SP Recovery', 'Ultimate Gain Efficiency', 'DMG Reduction',
    'Combo Skill DMG', 'Battle Skill DMG', 'Ultimate DMG', 'Ultimate SP Gain'
  ];
  return percentStats.includes(statName);
};

/**
 * Normalize stat names
 */
export const normalizeStatName = (statName) => {
  const statMap = {
    'Strength': 'strength', 'Agility': 'agility', 'Intellect': 'intellect', 'Will': 'will',
    'DEF': 'def', 'Physical DMG': 'physDmg', 'Heat DMG': 'heatDmg',
    'Cryo DMG': 'cryoDmg', 'Electric DMG': 'electricDmg', 'Nature DMG': 'natureDmg',
    'Arts Intensity': 'artsIntensity', 'Critical Rate': 'critRate', 'Critical DMG': 'critDmg',
    'Treatment Efficiency': 'treatmentEff', 'SP Recovery': 'spRecovery',
    'Ultimate Gain Efficiency': 'ultimateGain', 'Ultimate SP Gain': 'ultimateGain',
    'DMG Reduction': 'dmgReduction', 'DMG to Broken': 'dmgToBroken',
    'Combo Skill DMG': 'comboSkillDmg', 'Battle Skill DMG': 'battleSkillDmg',
    'Ultimate DMG': 'ultimateDmg'
  };
  return statMap[statName] || statName.toLowerCase().replace(/ /g, '');
};
