// Условия для активации эффектов
export const CONDITIONS = {
  afterCrit: { id: 'afterCrit', name: 'После крита', icon: '💥' },
  afterBattleSkill: { id: 'afterBattleSkill', name: 'После боевого навыка', icon: '⚔️' },
  afterComboSkill: { id: 'afterComboSkill', name: 'После комбо навыка', icon: '🔗' },
  afterUltimate: { id: 'afterUltimate', name: 'После ульты', icon: '💫' },
  afterCombustion: { id: 'afterCombustion', name: 'После Combustion', icon: '🔥' },
  afterElectrification: { id: 'afterElectrification', name: 'После Electrification', icon: '⚡' },
  afterSolidification: { id: 'afterSolidification', name: 'После Solidification', icon: '❄️' },
  afterCorrosion: { id: 'afterCorrosion', name: 'После Corrosion', icon: '🌿' },
  afterVulnerability: { id: 'afterVulnerability', name: 'После Vulnerability', icon: '🎯' },
  afterPhysStatus: { id: 'afterPhysStatus', name: 'После физ. статуса', icon: '💢' },
  afterHealing: { id: 'afterHealing', name: 'После лечения', icon: '💚' },
  hpAbove80: { id: 'hpAbove80', name: 'HP > 80%', icon: '💖' },
  hpBelow50: { id: 'hpBelow50', name: 'HP < 50%', icon: '💔' },
  hpBelow70: { id: 'hpBelow70', name: 'HP < 70%', icon: '❤️' },
  afterStagger: { id: 'afterStagger', name: 'После стаггера', icon: '😵' },
  vsCryoInfliction: { id: 'vsCryoInfliction', name: 'vs Cryo Infliction', icon: '🧊' },
};

// Названия статов на русском
export const STAT_NAMES = {
  defense: 'Защита',
  strength: 'Сила',
  agility: 'Ловкость',
  intellect: 'Интеллект',
  will: 'Воля',
  critRate: 'Крит. шанс',
  critDmg: 'Крит. урон',
  physDmg: 'Physical DMG',
  heatDmg: 'Heat DMG',
  cryoDmg: 'Cryo DMG',
  electricDmg: 'Electric DMG',
  natureDmg: 'Nature DMG',
  artsDmg: 'Arts DMG',
  heatNatureDmg: 'Heat/Nature DMG',
  cryoElectricDmg: 'Cryo/Electric DMG',
  skillDmg: 'Skill DMG',
  battleSkillDmg: 'Battle Skill DMG',
  comboSkillDmg: 'Combo Skill DMG',
  ultimateDmg: 'Ultimate DMG',
  ultimateGain: 'Ultimate Gain',
  basicAtkDmg: 'Basic ATK DMG',
  treatment: 'Treatment',
  treatmentBonus: 'Treatment Bonus',
  treatmentEff: 'Treatment Eff.',
  artsIntensity: 'Arts Intensity',
  staggerDmg: 'Stagger DMG',
  staggerEff: 'Stagger Eff.',
  dmgReduction: 'DMG Reduction',
  atkPercent: 'ATK%',
  baseAtk: 'Base ATK',
};

// Проверка, является ли стат процентным
export const isPercentStat = (key) => {
  return key.includes('Dmg') || key.includes('Rate') || key.includes('Percent') || 
         key.includes('treatment') || key.includes('Gain') || key.includes('Eff');
};
