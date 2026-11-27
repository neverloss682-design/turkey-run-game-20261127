// levels.js — the three stages of the escape: farmyard, barn, kitchen.
// One job: describe each stage's layout (walls, hiding spots, ovens, knives,
// corn, gate, spawns) so main.js never hard-codes a level.
// Play area: 1280 x 720, HUD occupies the top 64 px (y < 76 is out of bounds).
export const ARENA = { x: 16, y: 76, w: 1248, h: 628 };

export const STAGES = [
  {
    name: 'STAGE 1 · THE FARMYARD',
    subtitle: 'Dawn on the farm — grab corn, dodge the farmer, reach the gate',
    ground: 'farmyard',
    farmerSpeed: 178,
    vision: 250,
    knifeRate: 0,
    knivesMax: 0,
    cornNeeded: 4,
    cornSpots: [
      [300, 220], [560, 150], [820, 260], [1050, 170],
      [420, 520], [760, 560], [1080, 470], [180, 600],
    ],
    powerups: [{ kind: 'wing', x: 640, y: 380 }],
    fences: [
      { x: 380, y: 300, w: 200, h: 26 },
      { x: 760, y: 430, w: 200, h: 26 },
      { x: 180, y: 380, w: 26, h: 150 },
      { x: 1080, y: 300, w: 26, h: 150 },
    ],
    bushes: [
      { x: 120, y: 130, r: 52 }, { x: 980, y: 600, r: 56 }, { x: 620, y: 180, r: 46 },
    ],
    haystacks: [
      { x: 250, y: 560, r: 48 }, { x: 900, y: 140, r: 48 },
    ],
    ovens: [],
    turkeySpawn: { x: 90, y: 640 },
    farmerSpawn: { x: 640, y: 130 },
    patrol: [[640, 130], [1120, 200], [1120, 620], [200, 620], [200, 200]],
    gate: { x: 1216, y: 330, w: 48, h: 110 },
    parSeconds: 75,
  },
  {
    name: 'STAGE 2 · THE BARN',
    subtitle: 'Hay bales to hide in — but the carving knives are out now',
    ground: 'barn',
    farmerSpeed: 196,
    vision: 275,
    knifeRate: 1.1,
    knivesMax: 2,
    cornNeeded: 5,
    cornSpots: [
      [260, 160], [520, 260], [840, 150], [1100, 260],
      [340, 580], [700, 620], [1060, 560], [180, 380], [640, 420],
    ],
    powerups: [
      { kind: 'shield', x: 640, y: 200 },
      { kind: 'wing', x: 240, y: 620 },
    ],
    fences: [
      { x: 320, y: 240, w: 26, h: 220 },
      { x: 930, y: 240, w: 26, h: 220 },
      { x: 520, y: 480, w: 240, h: 26 },
      { x: 520, y: 180, w: 240, h: 26 },
    ],
    bushes: [
      { x: 120, y: 150, r: 50 }, { x: 1150, y: 620, r: 52 },
    ],
    haystacks: [
      { x: 640, y: 330, r: 58 }, { x: 180, y: 560, r: 48 }, { x: 1100, y: 160, r: 48 },
    ],
    ovens: [],
    turkeySpawn: { x: 90, y: 640 },
    farmerSpawn: { x: 640, y: 130 },
    patrol: [[640, 130], [1150, 350], [640, 620], [130, 350]],
    gate: { x: 1216, y: 330, w: 48, h: 110 },
    parSeconds: 80,
  },
  {
    name: 'STAGE 3 · THE KITCHEN',
    subtitle: 'The oven is HOT and the knives fall fast — escape Thanksgiving!',
    ground: 'kitchen',
    farmerSpeed: 212,
    vision: 300,
    knifeRate: 1.7,
    knivesMax: 3,
    cornNeeded: 5,
    cornSpots: [
      [260, 160], [520, 260], [840, 150], [1100, 260],
      [340, 580], [700, 620], [1060, 560], [180, 380], [640, 420],
    ],
    powerups: [
      { kind: 'shield', x: 640, y: 620 },
      { kind: 'wing', x: 1100, y: 620 },
    ],
    fences: [
      { x: 420, y: 220, w: 26, h: 260 },
      { x: 830, y: 220, w: 26, h: 260 },
    ],
    bushes: [{ x: 120, y: 620, r: 50 }],
    haystacks: [{ x: 1150, y: 140, r: 48 }],
    ovens: [
      { x: 500, y: 110, w: 130, h: 80 },
      { x: 760, y: 560, w: 130, h: 80 },
    ],
    turkeySpawn: { x: 90, y: 640 },
    farmerSpawn: { x: 640, y: 130 },
    patrol: [[640, 130], [1150, 200], [1150, 620], [130, 200]],
    gate: { x: 1216, y: 330, w: 48, h: 110 },
    parSeconds: 90,
  },
];

export function stageCount() { return STAGES.length; }
export function getStage(index) { return STAGES[Math.min(index, STAGES.length - 1)]; }
