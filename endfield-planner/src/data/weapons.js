// Weapon system constants and utilities

// Level caps by tuning stage
export const WEAPON_LEVEL_CAPS = { 0: 20, 1: 40, 2: 60, 3: 80, 4: 90 };
export const getMaxLevel = (tuningStage) => WEAPON_LEVEL_CAPS[tuningStage] || 20;

// ATK scaling by rarity (base + perLevel * (level-1))
export const ATK_SCALING = {
  6: { base: 52, perLevel: 5.1 },
  5: { base: 42, perLevel: 4.15 },
  4: { base: 35, perLevel: 3.44 },
  3: { base: 29, perLevel: 2.86 }
};

export const getWeaponATK = (weapon, level) => {
  if (!weapon) return 0;
  const scaling = ATK_SCALING[weapon.rarity];
  return scaling ? Math.floor(scaling.base + (level - 1) * scaling.perLevel) : 0;
};

// All 62 weapons with type and rarity
export const WEAPONS = [
  // === SWORDS (17) ===
  { id: 'tarr-11', name: 'Tarr 11', type: 'Sword', rarity: 3 },
  { id: 'contingent-measure', name: 'Contingent Measure', type: 'Sword', rarity: 4 },
  { id: 'wave-tide', name: 'Wave Tide', type: 'Sword', rarity: 4 },
  { id: 'aspirant', name: 'Aspirant', type: 'Sword', rarity: 5 },
  { id: 'finchaser-30', name: 'Finchaser 3.0', type: 'Sword', rarity: 5 },
  { id: 'fortmaker', name: 'Fortmaker', type: 'Sword', rarity: 5 },
  { id: 'obj-edge-of-lightness', name: 'OBJ Edge of Lightness', type: 'Sword', rarity: 5 },
  { id: 'sundering-steel', name: 'Sundering Steel', type: 'Sword', rarity: 5 },
  { id: 'twelve-questions', name: 'Twelve Questions', type: 'Sword', rarity: 5 },
  { id: 'eminent-repute', name: 'Eminent Repute', type: 'Sword', rarity: 6, signature: 'Yvonne' },
  { id: 'forgeborn-scathe', name: 'Forgeborn Scathe', type: 'Sword', rarity: 6, signature: 'Laevatain' },
  { id: 'grand-vision', name: 'Grand Vision', type: 'Sword', rarity: 6, signature: 'Endministrator' },
  { id: 'never-rest', name: 'Never Rest', type: 'Sword', rarity: 6, signature: 'Lifeng' },
  { id: 'rapid-ascent', name: 'Rapid Ascent', type: 'Sword', rarity: 6, signature: 'Gilberta' },
  { id: 'thermite-cutter', name: 'Thermite Cutter', type: 'Sword', rarity: 6, signature: 'Snowshine' },
  { id: 'umbral-torch', name: 'Umbral Torch', type: 'Sword', rarity: 6, signature: 'Xaihi' },
  { id: 'white-night-nova', name: 'White Night Nova', type: 'Sword', rarity: 6, signature: 'Arclight' },

  // === GREATSWORDS (12) ===
  { id: 'darhoff-7', name: 'Darhoff 7', type: 'Greatsword', rarity: 3 },
  { id: 'industry-01', name: 'Industry 0.1', type: 'Greatsword', rarity: 4 },
  { id: 'quencher', name: 'Quencher', type: 'Greatsword', rarity: 4 },
  { id: 'ancient-canal', name: 'Ancient Canal', type: 'Greatsword', rarity: 5 },
  { id: 'finishing-call', name: 'Finishing Call', type: 'Greatsword', rarity: 5 },
  { id: 'obj-heavy-burden', name: 'OBJ Heavy Burden', type: 'Greatsword', rarity: 5 },
  { id: 'seeker-of-dark-lung', name: 'Seeker of Dark Lung', type: 'Greatsword', rarity: 5 },
  { id: 'exemplar', name: 'Exemplar', type: 'Greatsword', rarity: 6 },
  { id: 'former-finery', name: 'Former Finery', type: 'Greatsword', rarity: 6 },
  { id: 'khravengger', name: 'Khravengger', type: 'Greatsword', rarity: 6, signature: 'Pogranichnik' },
  { id: 'sundered-prince', name: 'Sundered Prince', type: 'Greatsword', rarity: 6, signature: 'Wulfgard' },
  { id: 'thunderberge', name: 'Thunderberge', type: 'Greatsword', rarity: 6, signature: 'Perlica' },

  // === POLEARMS (10) ===
  { id: 'opero-77', name: 'Opero 77', type: 'Polearm', rarity: 3 },
  { id: 'aggeloslayer', name: 'Aggeloslayer', type: 'Polearm', rarity: 4 },
  { id: 'pathfinders-beacon', name: "Pathfinder's Beacon", type: 'Polearm', rarity: 4 },
  { id: 'chimeric-justice', name: 'Chimeric Justice', type: 'Polearm', rarity: 5 },
  { id: 'cohesive-traction', name: 'Cohesive Traction', type: 'Polearm', rarity: 5 },
  { id: 'obj-razorhorn', name: 'OBJ Razorhorn', type: 'Polearm', rarity: 5 },
  { id: 'jet', name: 'JET', type: 'Polearm', rarity: 6, signature: 'Estella' },
  { id: 'mountain-bearer', name: 'Mountain Bearer', type: 'Polearm', rarity: 6, signature: 'Last Rite' },
  { id: 'valiant', name: 'Valiant', type: 'Polearm', rarity: 6, signature: 'Ardelia' },

  // === HANDCANNONS (10) ===
  { id: 'peco-5', name: 'Peco 5', type: 'Handcannon', rarity: 3 },
  { id: 'howling-guard', name: 'Howling Guard', type: 'Handcannon', rarity: 4 },
  { id: 'long-road', name: 'Long Road', type: 'Handcannon', rarity: 4 },
  { id: 'obj-velocitous', name: 'OBJ Velocitous', type: 'Handcannon', rarity: 5 },
  { id: 'opus-the-living', name: 'Opus The Living', type: 'Handcannon', rarity: 5 },
  { id: 'rational-farewell', name: 'Rational Farewell', type: 'Handcannon', rarity: 5 },
  { id: 'artzy-tyrannical', name: 'Artzy Tyrannical', type: 'Handcannon', rarity: 6, signature: 'Fluorite' },
  { id: 'clannibal', name: 'Clannibal', type: 'Handcannon', rarity: 6, signature: 'Antal' },
  { id: 'navigator', name: 'Navigator', type: 'Handcannon', rarity: 6, signature: 'Chen Qianyu' },
  { id: 'wedge', name: 'Wedge', type: 'Handcannon', rarity: 6, signature: 'Akekuri' },

  // === ARTS UNITS (14) ===
  { id: 'jiminy-12', name: 'Jiminy 12', type: 'Arts Unit', rarity: 3 },
  { id: 'florescent-roc', name: 'Florescent Roc', type: 'Arts Unit', rarity: 4 },
  { id: 'hypernova-auto', name: 'Hypernova Auto', type: 'Arts Unit', rarity: 4 },
  { id: 'freedom-to-proselytize', name: 'Freedom to Proselytize', type: 'Arts Unit', rarity: 5 },
  { id: 'monaihe', name: 'Monaihe', type: 'Arts Unit', rarity: 5 },
  { id: 'obj-arts-identifier', name: 'OBJ Arts Identifier', type: 'Arts Unit', rarity: 5 },
  { id: 'stanza-of-memorials', name: 'Stanza of Memorials', type: 'Arts Unit', rarity: 5 },
  { id: 'wild-wanderer', name: 'Wild Wanderer', type: 'Arts Unit', rarity: 5 },
  { id: 'chivalric-virtues', name: 'Chivalric Virtues', type: 'Arts Unit', rarity: 6, signature: 'Avywenna' },
  { id: 'delivery-guaranteed', name: 'Delivery Guaranteed', type: 'Arts Unit', rarity: 6, signature: 'Ember' },
  { id: 'detonation-unit', name: 'Detonation Unit', type: 'Arts Unit', rarity: 6, signature: 'Da Pan' },
  { id: 'dreams-of-the-starry-beach', name: 'Dreams of the Starry Beach', type: 'Arts Unit', rarity: 6 },
  { id: 'oblivion', name: 'Oblivion', type: 'Arts Unit', rarity: 6, signature: 'Alesh' },
  { id: 'opus-etch-figure', name: 'Opus Etch Figure', type: 'Arts Unit', rarity: 6, signature: 'Catcher' },
];

// Helper functions
export const getWeaponsByType = (type) => WEAPONS.filter(w => w.type === type);
export const getWeaponsByRarity = (rarity) => WEAPONS.filter(w => w.rarity === rarity);
export const getWeaponById = (id) => WEAPONS.find(w => w.id === id);

// Парсинг навыков оружия из JSON данных
export const parseWeaponSkills = (skillsData, rank) => {
  if (!skillsData || skillsData.length < 2) return null;
  
  const headers = skillsData[0];
  const rankData = skillsData[rank]; // rank 1-9
  
  if (!rankData) return null;
  
  // Skill 1: Attribute Boost
  const skill1Name = headers[1];
  const skill1Value = rankData[1];
  const skill1Match = skill1Value.match(/(\w+)\s\+(\d+)/);
  const skill1 = {
    name: skill1Name,
    attribute: skill1Match?.[1], // "Agility", "Intellect", etc.
    attributeValue: parseInt(skill1Match?.[2] || 0)
  };
  
  // Skill 2: Attack Boost
  const skill2Name = headers[2];
  const skill2Value = rankData[2];
  const skill2Match = skill2Value.match(/Attack\s\+(\d+)%/);
  const skill2 = {
    name: skill2Name,
    attackBoost: parseInt(skill2Match?.[1] || 0)
  };
  
  // Skill 3: Passive
  const skill3Name = headers[3];
  const skill3Value = rankData[3];
  const skill3 = {
    name: skill3Name,
    description: skill3Value,
    bonuses: extractPassiveBonuses(skill3Value)
  };
  
  return { skill1, skill2, skill3 };
};

// Извлечение бонусов из описания пассивки
const extractPassiveBonuses = (description) => {
  const bonuses = {};
  
  // Паттерны для извлечения бонусов
  const patterns = [
    { regex: /Physical DMG Dealt \+(\d+(?:\.\d+)?)%/, key: 'physDmg' },
    { regex: /Heat DMG Dealt \+(\d+(?:\.\d+)?)%/, key: 'heatDmg' },
    { regex: /Cryo DMG Dealt \+(\d+(?:\.\d+)?)%/, key: 'cryoDmg' },
    { regex: /Electric DMG Dealt \+(\d+(?:\.\d+)?)%/, key: 'electricDmg' },
    { regex: /Nature DMG Dealt \+(\d+(?:\.\d+)?)%/, key: 'natureDmg' },
    { regex: /Basic Attack DMG Dealt \+(\d+(?:\.\d+)?)%/, key: 'basicAtkDmg' },
    { regex: /Battle Skill DMG Dealt \+(\d+(?:\.\d+)?)%/, key: 'battleSkillDmg' },
    { regex: /Combo Skill DMG Dealt \+(\d+(?:\.\d+)?)%/, key: 'comboSkillDmg' },
    { regex: /Ultimate DMG Dealt \+(\d+(?:\.\d+)?)%/, key: 'ultimateDmg' },
    { regex: /Skill DMG Dealt \+(\d+(?:\.\d+)?)%/, key: 'skillDmg' },
    { regex: /Arts Intensity \+(\d+(?:\.\d+)?)/, key: 'artsIntensity' },
    { regex: /Critical Rate \+(\d+(?:\.\d+)?)%/, key: 'critRate' },
    { regex: /Critical DMG Dealt \+(\d+(?:\.\d+)?)%/, key: 'critDmg' },
    { regex: /Stagger DMG \+(\d+(?:\.\d+)?)%/, key: 'staggerDmg' },
    { regex: /Stagger Efficiency \+(\d+(?:\.\d+)?)%/, key: 'staggerEff' },
    { regex: /Treatment Efficiency \+(\d+(?:\.\d+)?)%/, key: 'treatmentEff' },
  ];
  
  patterns.forEach(({ regex, key }) => {
    const match = description.match(regex);
    if (match) {
      bonuses[key] = parseFloat(match[1]);
    }
  });
  
  return bonuses;
};

// Skill rank calculation
export const calculateSkillRanks = (weapon, tuningStage = 0, potential = 0, essence = null) => {
  let skill1 = 1, skill2 = 1, skill3 = 1;
  
  // Tuning adds to skill1 and skill2
  if (tuningStage >= 1) skill1 += 2;
  if (tuningStage >= 2) skill2 += 2;
  if (tuningStage >= 3) skill1 += 2;
  if (tuningStage >= 4) skill2 += 2;
  
  // Potential adds to skill3
  skill3 += potential;
  
  // Essence bonuses (simplified)
  if (essence?.stats) {
    essence.stats.forEach(stat => {
      const bonus = stat.bonusLevels || 0;
      if (['strength', 'agility', 'intellect', 'will'].includes(stat.type)) {
        skill1 = Math.min(9, skill1 + bonus);
      } else if (['atkPercent', 'critRate', 'artsIntensity', 'maxHp', 'ultimateGain', 'treatment'].includes(stat.type)) {
        skill2 = Math.min(9, skill2 + bonus);
      } else {
        skill3 = Math.min(9, skill3 + bonus);
      }
    });
  }
  
  return {
    skill1: Math.min(9, skill1),
    skill2: Math.min(9, skill2),
    skill3: Math.min(9, skill3)
  };
};

// Essence system
export const ESSENCE_RARITIES = {
  2: { name: 'Stable', color: '#4ade80', bonusLevels: [1, 2] },
  3: { name: 'Clean', color: '#60a5fa', bonusLevels: [1, 2, 3] },
  4: { name: 'Pure', color: '#c084fc', bonusLevels: [2, 3, 4] },
  5: { name: 'Pristine', color: '#fbbf24', bonusLevels: [3, 4, 5] },
};

export const ESSENCE_STAT_OPTIONS = {
  strength: 'Strength', agility: 'Agility', intellect: 'Intellect', will: 'Will',
  atkPercent: 'ATK%', critRate: 'Crit Rate', artsIntensity: 'Arts Intensity',
  maxHp: 'Max HP%', physDmg: 'Physical DMG', heatDmg: 'Heat DMG',
  cryoDmg: 'Cryo DMG', electricDmg: 'Electric DMG', natureDmg: 'Nature DMG',
  artsDmg: 'Arts DMG', ultimateGain: 'Ultimate Gain', treatment: 'Treatment'
};

// Skill values by rank (1-9)
export const SKILL_VALUES = {
  attrS: [50, 55, 60, 66, 72, 79, 86, 93, 100],
  attrM: [68, 75, 82, 90, 98, 107, 116, 124, 133],
  attrL: [85, 94, 103, 113, 123, 134, 145, 156, 167],
  mainAttrL: [72, 80, 88, 96, 105, 114, 123, 132, 142],
  mainAttrS: [43, 48, 53, 58, 64, 70, 76, 79, 85],
  atkPctS: [12.8, 14.1, 15.5, 17.0, 18.7, 20.5, 22.1, 23.4, 25.1],
  atkPctM: [17.1, 18.8, 20.7, 22.7, 24.9, 27.3, 29.5, 31.2, 33.5],
  atkPctL: [21.3, 23.5, 25.8, 28.3, 31.1, 34.1, 36.9, 39.0, 41.9],
  flatAtk: [19, 21, 23, 25, 27, 30, 32, 34, 37],
  critL: [10.7, 11.8, 13.0, 14.2, 15.6, 17.1, 18.5, 19.5, 21.0],
  dmgPctS: [14.2, 15.7, 17.2, 18.9, 20.8, 22.8, 24.6, 26.0, 27.9],
  dmgPctM: [19.0, 21.0, 23.0, 25.3, 27.7, 30.4, 32.8, 34.7, 37.2],
  dmgPctL: [23.7, 26.2, 28.7, 31.5, 34.6, 37.9, 41.0, 43.3, 46.5],
  artsIntM: [34, 37, 41, 45, 49, 54, 58, 62, 66],
  artsIntL: [43, 47, 52, 57, 62, 68, 73, 78, 84],
  ultGainM: [20.3, 22.4, 24.6, 27.0, 29.6, 32.5, 35.1, 37.1, 39.9],
  ultGainL: [25.4, 28.0, 30.7, 33.7, 37.0, 40.6, 43.9, 46.4, 49.8],
  hpPctS: [25.6, 28.2, 31.0, 34.0, 37.3, 40.9, 44.2, 46.8, 50.3],
  hpPctM: [34.1, 37.6, 41.3, 45.4, 49.8, 54.6, 59.0, 62.4, 67.0],
  hpPctL: [42.6, 47.0, 51.6, 56.7, 62.2, 68.2, 73.8, 78.0, 83.8],
  treatmentM: [20.3, 22.4, 24.6, 27.0, 29.6, 32.5, 35.1, 37.1, 39.9],
  treatmentL: [25.4, 28.0, 30.7, 33.7, 37.0, 40.6, 43.9, 46.4, 49.8],
};

export const getSkillValue = (key, rank) => {
  const values = SKILL_VALUES[key];
  return values ? values[Math.min(rank, values.length) - 1] || 0 : 0;
};

export default WEAPONS;
