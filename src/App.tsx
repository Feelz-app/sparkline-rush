import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { hideMenuBanner, showMenuBanner, showPrivacyOptions, showRewardedAd, type RewardedPlacement } from "./services/admob";
import { CHEST_SKINS, EXCLUSIVE_SKINS, SECRET_SKINS } from "./data/secretSkins";
import { OBSTACLE_STYLES, TRAIL_STYLES, type ObstacleStyle, type TrailStyle } from "./data/rewardCosmetics";

type GameScreen = "ready" | "playing" | "paused" | "gameOver";
type GameMode = "classic" | "daily";
type AppPanel = "home" | "play" | "shop" | "records" | "customize" | "guide";
type RecordScope = "personal" | "local" | "daily" | "region";
type PickupKind = "spark" | "life" | "magnet" | "slow" | "ghost" | "double";
type SkinId = string;
type TrailStyleId = string;
type ObstacleStyleId = string;
type SkinCategory = "colors" | "street" | "outfits" | "elite" | "wild";
type SkinFilter = "all" | "owned" | SkinCategory;
type SkinPattern = "solid" | "stripe" | "ring" | "split" | "visor" | "crown" | "bolt" | "star" | "flame" | "checker" | "aura" | "orbital";
type SkinEffect = "flowers" | "petals" | "hearts" | "stars" | "sparks" | "orbit";
type MissionKind = "sparks" | "dodges" | "nearMisses" | "seconds";
type AchievementId = string;
type DailyRewardKind = "sparks" | "revive" | "life" | "armor" | "magnet" | "rush" | "chest";
type AbilityId = "phaseCloak" | "megaMagnet" | "heartBurst" | "timeBrake" | "sparkSurge";
type AbilityInventory = Record<AbilityId, number>;

type Obstacle = {
  id: number;
  lane: number;
  y: number;
  width: number;
  height: number;
  passed: boolean;
  phase: number;
  hit: boolean;
  nearMissAwarded: boolean;
};

type Pickup = {
  id: number;
  lane: number;
  y: number;
  kind: PickupKind;
  taken: boolean;
  phase: number;
};

type Particle = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
};

type Mission = {
  id: string;
  label: string;
  kind: MissionKind;
  goal: number;
  reward: number;
};

type MissionProgress = Mission & {
  value: number;
  complete: boolean;
  claimed: boolean;
};

type LeaderboardEntry = {
  name: string;
  score: number;
  date: string;
  streak: number;
  mode?: GameMode;
};

type ScoreHistoryEntry = {
  score: number;
  streak: number;
  sparks: number;
  mode: GameMode;
  skinId: SkinId;
  date: string;
};

type Profile = {
  sparks: number;
  reviveTokens: number;
  lifeBoosts: number;
  armorPlates: number;
  magnetPacks: number;
  rushBoosts: number;
  selectedSkin: SkinId;
  unlockedSkins: SkinId[];
  skinEffects: boolean;
  selectedTrail: TrailStyleId;
  unlockedTrails: TrailStyleId[];
  selectedObstacleStyle: ObstacleStyleId;
  unlockedObstacleStyles: ObstacleStyleId[];
  personalBest: number;
  bestStreak: number;
  scoreHistory: ScoreHistoryEntry[];
  muted: boolean;
  totalRuns: number;
  achievements: AchievementId[];
  dailyStreak: number;
  lastDailyRewardDate: string;
  chestProgress: number;
  chestsOpened: number;
  abilities: AbilityInventory;
  rewardedAdsWatchedToday: number;
  lastRewardedAdDate: string;
};

type ActivePowerups = Record<"magnet" | "slow" | "ghost" | "double", number>;

type DailyReward = {
  label: string;
  detail: string;
  kind: DailyRewardKind;
  amount: number;
};

type Achievement = {
  id: AchievementId;
  title: string;
  detail: string;
  reward: number;
  goal: number;
  metric: string;
  value: (game: GameState, profile: Profile) => number;
};

type ChestReward = Partial<Pick<Profile, "sparks" | "reviveTokens" | "lifeBoosts" | "armorPlates" | "magnetPacks" | "rushBoosts">> & {
  label: string;
};

type ChestPrizeTier = "common" | "ability" | "secret" | "exclusive" | "cosmetic" | "jackpot";

type ChestPrizeItem = {
  label: string;
  detail: string;
  tier: ChestPrizeTier;
  color: string;
};

type ChestRewardResult = {
  profile: Profile;
  reward: ChestReward & {
    items: ChestPrizeItem[];
    opened: number;
    premium: boolean;
  };
};

type ChestReveal = {
  title: string;
  kicker: string;
  source: string;
  opened: number;
  counterLabel?: string;
  premium: boolean;
  items: ChestPrizeItem[];
  choices?: Skin[];
  choiceTitle?: string;
  choiceCta?: string;
};

type AbilityDefinition = {
  id: AbilityId;
  label: string;
  shortLabel: string;
  detail: string;
  duration: number;
  color: string;
};

type GameState = {
  screen: GameScreen;
  mode: GameMode;
  lane: number;
  targetLane: number;
  playerX: number;
  obstacles: Obstacle[];
  pickups: Pickup[];
  particles: Particle[];
  score: number;
  best: number;
  combo: number;
  bestStreak: number;
  lives: number;
  maxLives: number;
  armor: number;
  speed: number;
  elapsed: number;
  spawnTimer: number;
  pickupTimer: number;
  idCounter: number;
  lastTime: number;
  finalHandled: boolean;
  pulse: number;
  hitFlash: number;
  armorGrace: number;
  shake: number;
  runSparks: number;
  bankedSparks: number;
  dodges: number;
  nearMisses: number;
  eventMessage: string;
  eventTtl: number;
  missionClaims: string[];
  activePowerups: ActivePowerups;
  skinId: SkinId;
  skinEffects: boolean;
  trailStyleId: TrailStyleId;
  obstacleStyleId: ObstacleStyleId;
  muted: boolean;
  revived: boolean;
  adDoubleClaimed: boolean;
  adChestClaimed: boolean;
  adReviveUsed: boolean;
  random: () => number;
};

type GameSnapshot = {
  screen: GameScreen;
  mode: GameMode;
  score: number;
  best: number;
  combo: number;
  bestStreak: number;
  lives: number;
  maxLives: number;
  armor: number;
  speed: number;
  elapsed: number;
  level: number;
  runSparks: number;
  bankedSparks: number;
  dodges: number;
  nearMisses: number;
  eventMessage: string;
  missionProgress: MissionProgress[];
  activePowerups: ActivePowerups;
  canRevive: boolean;
  canAdRevive: boolean;
  adDoubleClaimed: boolean;
  adChestClaimed: boolean;
};

type Skin = {
  id: SkinId;
  name: string;
  cost: number;
  category: SkinCategory;
  vibe: string;
  pattern: SkinPattern;
  core: string;
  accent: string;
  glow: string;
  trail: string;
  effect?: SkinEffect;
};

const BOARD_WIDTH = 390;
const BOARD_HEIGHT = 720;
const LANES = 5;
const PLAYER_Y = 618;
const PLAYER_RADIUS = 17;
const LANE_MARGIN = 44;
const MAX_LIVES = 3;
const MAX_STACKED_LIVES = 5;
const MAX_ARMOR = 2;
const BEST_KEY = "sparkline-rush-best";
const BOARD_KEY = "sparkline-rush-leaderboard";
const NAME_KEY = "sparkline-rush-name";
const NAME_READY_KEY = "sparkline-rush-name-ready";
const PROFILE_KEY = "sparkline-rush-profile-v2";
const DAILY_BOARD_PREFIX = "sparkline-rush-daily-";
const REVIVE_COST = 100;
const EXTRA_LIFE_COST = 75;
const ARMOR_COST = 60;
const MAGNET_PACK_COST = 85;
const RUSH_BOOST_COST = 120;
const CHEST_GOAL = 100;
const ABILITY_CHEST_INTERVAL = 5;
const SECRET_CHEST_INTERVAL = 5;
const EXCLUSIVE_CHEST_INTERVAL = 20;
const TRAIL_CHEST_INTERVAL = 3;
const OBSTACLE_CHEST_INTERVAL = 4;
const REWARDED_AD_DAILY_LIMIT = 8;
const MOTHERS_DAY_EVENT_START_MS = Date.UTC(2026, 4, 9, 7, 0, 0);
const MOTHERS_DAY_EVENT_END_MS = Date.UTC(2026, 4, 11, 6, 59, 59);
const MOTHERS_DAY_CHEST_KEY_PREFIX = "sparkline-rush-mothers-day-chest-";

const ABILITY_IDS: AbilityId[] = ["phaseCloak", "megaMagnet", "heartBurst", "timeBrake", "sparkSurge"];

const ABILITIES: Record<AbilityId, AbilityDefinition> = {
  phaseCloak: { id: "phaseCloak", label: "Phase Cloak", shortLabel: "Cloak", detail: "Invisible for 12s", duration: 12, color: "#b78cff" },
  megaMagnet: { id: "megaMagnet", label: "Mega Magnet", shortLabel: "Magnet", detail: "Magnet for 10s", duration: 10, color: "#7df2dd" },
  heartBurst: { id: "heartBurst", label: "Heart Burst", shortLabel: "Life", detail: "Adds one stacked heart", duration: 0, color: "#b6ff69" },
  timeBrake: { id: "timeBrake", label: "Time Brake", shortLabel: "Slow", detail: "Slow blocks for 12s", duration: 12, color: "#6ee7f9" },
  sparkSurge: { id: "sparkSurge", label: "Spark Surge", shortLabel: "2x", detail: "2x score for 10s", duration: 10, color: "#ff4f87" }
};

const DAILY_REWARDS: DailyReward[] = [
  { label: "Day 1", detail: "+60 sparks", kind: "sparks", amount: 60 },
  { label: "Day 2", detail: "+1 shield", kind: "armor", amount: 1 },
  { label: "Day 3", detail: "+1 revive", kind: "revive", amount: 1 },
  { label: "Day 4", detail: "+1 magnet", kind: "magnet", amount: 1 },
  { label: "Day 5", detail: "+1 2x rush", kind: "rush", amount: 1 },
  { label: "Day 6", detail: "+1 chest", kind: "chest", amount: 1 },
  { label: "Day 7", detail: "+250 sparks", kind: "sparks", amount: 250 }
];

const CHEST_REWARDS: ChestReward[] = [
  { label: "+90 sparks", sparks: 90 },
  { label: "+1 shield", armorPlates: 1 },
  { label: "+1 extra life", lifeBoosts: 1 },
  { label: "+1 revive", reviveTokens: 1 },
  { label: "+1 magnet", magnetPacks: 1 },
  { label: "+1 2x rush", rushBoosts: 1 },
  { label: "Jackpot +180 sparks", sparks: 180 }
];

const APP_PANELS: Array<{ id: AppPanel; label: string }> = [
  { id: "play", label: "Play" },
  { id: "shop", label: "Shop" },
  { id: "records", label: "Scores" },
  { id: "customize", label: "Ball Lab" },
  { id: "guide", label: "Guide" }
];

const RECORD_SCOPES: Array<{ id: RecordScope; label: string }> = [
  { id: "personal", label: "Personal" },
  { id: "local", label: "Local" },
  { id: "daily", label: "Daily" },
  { id: "region", label: "Region" }
];

const SKIN_FILTERS: Array<{ id: SkinFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "owned", label: "Owned" },
  { id: "colors", label: "Colors" },
  { id: "street", label: "Street" },
  { id: "outfits", label: "Outfits" },
  { id: "elite", label: "Elite" },
  { id: "wild", label: "Wild" }
];

const SKINS: Skin[] = [
  { id: "nova", name: "Default Glow", cost: 0, category: "colors", vibe: "Free starter skin", pattern: "solid", core: "#7df2dd", accent: "#ffffff", glow: "#7df2dd", trail: "rgba(125, 242, 221, 0.46)" },
  { id: "ember", name: "Ember", cost: 90, category: "colors", vibe: "Heat pop", pattern: "solid", core: "#ff6b35", accent: "#ffcf5a", glow: "#ffcf5a", trail: "rgba(255, 207, 90, 0.48)" },
  { id: "mint", name: "Mint", cost: 120, category: "colors", vibe: "Clean snap", pattern: "solid", core: "#b6ff69", accent: "#7df2dd", glow: "#b6ff69", trail: "rgba(182, 255, 105, 0.42)" },
  { id: "violet", name: "Violet", cost: 150, category: "colors", vibe: "Night pulse", pattern: "solid", core: "#b78cff", accent: "#ff4f87", glow: "#ff4f87", trail: "rgba(183, 140, 255, 0.46)" },
  { id: "gold", name: "Gold", cost: 190, category: "colors", vibe: "Rich shine", pattern: "solid", core: "#ffd166", accent: "#fff7ad", glow: "#ffd166", trail: "rgba(255, 209, 102, 0.48)" },
  { id: "cyan-pop", name: "Cyan Pop", cost: 220, category: "colors", vibe: "Electric candy", pattern: "split", core: "#22d3ee", accent: "#fb7185", glow: "#67e8f9", trail: "rgba(34, 211, 238, 0.48)" },
  { id: "hot-pink", name: "Hot Pink", cost: 240, category: "colors", vibe: "Loud flex", pattern: "ring", core: "#fb4bb6", accent: "#fef08a", glow: "#fb4bb6", trail: "rgba(251, 75, 182, 0.45)" },
  { id: "acid-lime", name: "Acid Lime", cost: 260, category: "colors", vibe: "Fast sour", pattern: "stripe", core: "#d9ff4a", accent: "#0f172a", glow: "#d9ff4a", trail: "rgba(217, 255, 74, 0.44)" },
  { id: "solar", name: "Solar", cost: 280, category: "colors", vibe: "Sun flare", pattern: "aura", core: "#f97316", accent: "#fef3c7", glow: "#fb923c", trail: "rgba(249, 115, 22, 0.45)" },
  { id: "midnight", name: "Midnight", cost: 300, category: "colors", vibe: "Dark chrome", pattern: "ring", core: "#111827", accent: "#60a5fa", glow: "#60a5fa", trail: "rgba(96, 165, 250, 0.34)" },
  { id: "graffiti-pop", name: "Graffiti Pop", cost: 330, category: "street", vibe: "Spray paint", pattern: "checker", core: "#f97316", accent: "#22c55e", glow: "#fb7185", trail: "rgba(249, 115, 22, 0.42)" },
  { id: "chrome-tag", name: "Chrome Tag", cost: 360, category: "street", vibe: "Steel shine", pattern: "stripe", core: "#cbd5e1", accent: "#38bdf8", glow: "#e2e8f0", trail: "rgba(203, 213, 225, 0.38)" },
  { id: "blackout", name: "Blackout", cost: 390, category: "street", vibe: "Lowkey mean", pattern: "visor", core: "#020617", accent: "#ef4444", glow: "#ef4444", trail: "rgba(239, 68, 68, 0.3)" },
  { id: "arcade-denim", name: "Arcade Denim", cost: 420, category: "street", vibe: "Retro fit", pattern: "stripe", core: "#2563eb", accent: "#facc15", glow: "#60a5fa", trail: "rgba(37, 99, 235, 0.4)" },
  { id: "bubblegum", name: "Bubblegum", cost: 450, category: "street", vibe: "Sweet loud", pattern: "split", core: "#f9a8d4", accent: "#67e8f9", glow: "#f472b6", trail: "rgba(249, 168, 212, 0.42)" },
  { id: "toxic-spray", name: "Toxic Spray", cost: 480, category: "street", vibe: "Hazard drip", pattern: "checker", core: "#84cc16", accent: "#111827", glow: "#bef264", trail: "rgba(132, 204, 22, 0.42)" },
  { id: "laser-grid", name: "Laser Grid", cost: 510, category: "street", vibe: "Wireframe", pattern: "ring", core: "#0f172a", accent: "#22d3ee", glow: "#22d3ee", trail: "rgba(34, 211, 238, 0.42)" },
  { id: "retro-wave", name: "Retro Wave", cost: 540, category: "street", vibe: "Synth runner", pattern: "split", core: "#7c3aed", accent: "#fb7185", glow: "#a78bfa", trail: "rgba(124, 58, 237, 0.44)" },
  { id: "alley-kick", name: "Alley Kick", cost: 570, category: "street", vibe: "Sneaker sole", pattern: "bolt", core: "#f8fafc", accent: "#0f172a", glow: "#facc15", trail: "rgba(250, 204, 21, 0.35)" },
  { id: "skate-deck", name: "Skate Deck", cost: 600, category: "street", vibe: "Sticker stack", pattern: "star", core: "#14b8a6", accent: "#f97316", glow: "#2dd4bf", trail: "rgba(20, 184, 166, 0.42)" },
  { id: "shadow-mask", name: "Shadow Mask", cost: 640, category: "outfits", vibe: "Stealth fit", pattern: "visor", core: "#18181b", accent: "#a78bfa", glow: "#a78bfa", trail: "rgba(167, 139, 250, 0.35)" },
  { id: "racer-red", name: "Racer Red", cost: 680, category: "outfits", vibe: "Track suit", pattern: "stripe", core: "#dc2626", accent: "#ffffff", glow: "#f87171", trail: "rgba(220, 38, 38, 0.42)" },
  { id: "astro-suit", name: "Astro Suit", cost: 720, category: "outfits", vibe: "Orbit ready", pattern: "orbital", core: "#1d4ed8", accent: "#f8fafc", glow: "#93c5fd", trail: "rgba(147, 197, 253, 0.38)" },
  { id: "cyber-hoodie", name: "Cyber Hoodie", cost: 760, category: "outfits", vibe: "Neon hood", pattern: "visor", core: "#312e81", accent: "#5eead4", glow: "#5eead4", trail: "rgba(94, 234, 212, 0.38)" },
  { id: "fire-jacket", name: "Fire Jacket", cost: 800, category: "outfits", vibe: "Burn bright", pattern: "flame", core: "#ea580c", accent: "#fde047", glow: "#fb923c", trail: "rgba(234, 88, 12, 0.45)" },
  { id: "star-captain", name: "Star Captain", cost: 840, category: "outfits", vibe: "Hero shine", pattern: "star", core: "#2563eb", accent: "#facc15", glow: "#60a5fa", trail: "rgba(96, 165, 250, 0.38)" },
  { id: "lightning-kid", name: "Lightning Kid", cost: 880, category: "outfits", vibe: "Quick strike", pattern: "bolt", core: "#facc15", accent: "#18181b", glow: "#fde047", trail: "rgba(250, 204, 21, 0.45)" },
  { id: "glitch-armor", name: "Glitch Shield", cost: 920, category: "outfits", vibe: "Broken pixels", pattern: "checker", core: "#06b6d4", accent: "#ec4899", glow: "#22d3ee", trail: "rgba(6, 182, 212, 0.42)" },
  { id: "disco-suit", name: "Disco Suit", cost: 960, category: "outfits", vibe: "Mirror flash", pattern: "ring", core: "#e879f9", accent: "#fef08a", glow: "#f0abfc", trail: "rgba(232, 121, 249, 0.4)" },
  { id: "space-drip", name: "Space Drip", cost: 1000, category: "outfits", vibe: "Deep orbit", pattern: "aura", core: "#0f172a", accent: "#c084fc", glow: "#c084fc", trail: "rgba(192, 132, 252, 0.34)" },
  { id: "prism-king", name: "Prism King", cost: 1080, category: "elite", vibe: "Royal beam", pattern: "crown", core: "#67e8f9", accent: "#f9a8d4", glow: "#a5f3fc", trail: "rgba(103, 232, 249, 0.44)" },
  { id: "aurora", name: "Aurora", cost: 1160, category: "elite", vibe: "Sky shine", pattern: "aura", core: "#34d399", accent: "#a78bfa", glow: "#6ee7b7", trail: "rgba(52, 211, 153, 0.42)" },
  { id: "diamond", name: "Diamond", cost: 1240, category: "elite", vibe: "Ice flex", pattern: "star", core: "#e0f2fe", accent: "#38bdf8", glow: "#bae6fd", trail: "rgba(224, 242, 254, 0.36)" },
  { id: "plasma", name: "Plasma", cost: 1320, category: "elite", vibe: "Hot core", pattern: "flame", core: "#db2777", accent: "#facc15", glow: "#f472b6", trail: "rgba(219, 39, 119, 0.42)" },
  { id: "royal-ice", name: "Royal Ice", cost: 1400, category: "elite", vibe: "Cold crown", pattern: "crown", core: "#93c5fd", accent: "#f8fafc", glow: "#bfdbfe", trail: "rgba(147, 197, 253, 0.38)" },
  { id: "luxe-black", name: "Luxe Black", cost: 1480, category: "elite", vibe: "Premium dark", pattern: "ring", core: "#09090b", accent: "#d4af37", glow: "#facc15", trail: "rgba(250, 204, 21, 0.28)" },
  { id: "neon-noir", name: "Neon Noir", cost: 1560, category: "elite", vibe: "Club lights", pattern: "visor", core: "#111827", accent: "#fb7185", glow: "#fb7185", trail: "rgba(251, 113, 133, 0.34)" },
  { id: "pearl", name: "Pearl", cost: 1640, category: "elite", vibe: "Clean glow", pattern: "split", core: "#fafaf9", accent: "#a7f3d0", glow: "#e7e5e4", trail: "rgba(250, 250, 249, 0.32)" },
  { id: "holo-flex", name: "Holo Flex", cost: 1720, category: "elite", vibe: "Hologram", pattern: "orbital", core: "#8b5cf6", accent: "#22d3ee", glow: "#c4b5fd", trail: "rgba(139, 92, 246, 0.42)" },
  { id: "apex", name: "Apex", cost: 1800, category: "elite", vibe: "Final boss", pattern: "bolt", core: "#f43f5e", accent: "#f8fafc", glow: "#fb7185", trail: "rgba(244, 63, 94, 0.44)" },
  { id: "lava", name: "Lava", cost: 1880, category: "wild", vibe: "Molten run", pattern: "flame", core: "#b91c1c", accent: "#f97316", glow: "#ef4444", trail: "rgba(185, 28, 28, 0.44)" },
  { id: "galaxy", name: "Galaxy", cost: 1960, category: "wild", vibe: "Starfield", pattern: "star", core: "#312e81", accent: "#fef3c7", glow: "#818cf8", trail: "rgba(129, 140, 248, 0.4)" },
  { id: "slime", name: "Slime", cost: 2040, category: "wild", vibe: "Gross gloss", pattern: "split", core: "#65a30d", accent: "#bef264", glow: "#a3e635", trail: "rgba(101, 163, 13, 0.42)" },
  { id: "storm", name: "Storm", cost: 2120, category: "wild", vibe: "Thunder roll", pattern: "bolt", core: "#475569", accent: "#67e8f9", glow: "#94a3b8", trail: "rgba(71, 85, 105, 0.4)" },
  { id: "candy-rush", name: "Candy Rush", cost: 2200, category: "wild", vibe: "Sugar high", pattern: "stripe", core: "#fb7185", accent: "#fef08a", glow: "#fda4af", trail: "rgba(251, 113, 133, 0.42)" },
  { id: "meteor", name: "Meteor", cost: 2280, category: "wild", vibe: "Impact mode", pattern: "flame", core: "#78350f", accent: "#fbbf24", glow: "#f59e0b", trail: "rgba(245, 158, 11, 0.42)" },
  { id: "pixel-punk", name: "Pixel Punk", cost: 2360, category: "wild", vibe: "8-bit chaos", pattern: "checker", core: "#22c55e", accent: "#ec4899", glow: "#4ade80", trail: "rgba(34, 197, 94, 0.42)" },
  { id: "ghost-mode", name: "Ghost Mode", cost: 2440, category: "wild", vibe: "Phase shift", pattern: "aura", core: "#c4b5fd", accent: "#ffffff", glow: "#ddd6fe", trail: "rgba(196, 181, 253, 0.36)" },
  { id: "vapor", name: "Vapor", cost: 2520, category: "wild", vibe: "Cloud neon", pattern: "orbital", core: "#f0abfc", accent: "#67e8f9", glow: "#f5d0fe", trail: "rgba(240, 171, 252, 0.38)" },
  { id: "void-core", name: "Void Core", cost: 2600, category: "wild", vibe: "Black hole", pattern: "ring", core: "#030712", accent: "#8b5cf6", glow: "#8b5cf6", trail: "rgba(139, 92, 246, 0.3)" }
];

const MOTHERS_DAY_SKINS: Skin[] = [
  { id: "md-rose-rocket", name: "Rose Rocket", cost: 0, category: "wild", vibe: "Fast floral fire", pattern: "flame", core: "#ff477e", accent: "#ffd166", glow: "#ff6b9c", trail: "rgba(255, 71, 126, 0.46)", effect: "flowers" },
  { id: "md-midnight-bouquet", name: "Midnight Bouquet", cost: 0, category: "elite", vibe: "Dark luxe bloom", pattern: "crown", core: "#111827", accent: "#f9a8d4", glow: "#f472b6", trail: "rgba(244, 114, 182, 0.36)", effect: "petals" },
  { id: "md-pearl-kiss", name: "Pearl Kiss", cost: 0, category: "elite", vibe: "Soft pearl glow", pattern: "split", core: "#fff7ed", accent: "#7df2dd", glow: "#fed7aa", trail: "rgba(254, 215, 170, 0.4)", effect: "hearts" },
  { id: "md-neon-carnation", name: "Neon Carnation", cost: 0, category: "colors", vibe: "Cute electric pop", pattern: "ring", core: "#f0abfc", accent: "#22d3ee", glow: "#e879f9", trail: "rgba(232, 121, 249, 0.44)", effect: "flowers" },
  { id: "md-velvet-crown", name: "Velvet Crown", cost: 0, category: "elite", vibe: "Queen energy", pattern: "crown", core: "#7f1d1d", accent: "#fbbf24", glow: "#fb7185", trail: "rgba(251, 113, 133, 0.36)", effect: "orbit" },
  { id: "md-garden-punk", name: "Garden Punk", cost: 0, category: "street", vibe: "Badass bloom", pattern: "checker", core: "#16a34a", accent: "#ec4899", glow: "#86efac", trail: "rgba(134, 239, 172, 0.38)", effect: "petals" },
  { id: "md-super-spark", name: "Super Spark", cost: 0, category: "outfits", vibe: "Cape-core shine", pattern: "star", core: "#2563eb", accent: "#fb7185", glow: "#60a5fa", trail: "rgba(96, 165, 250, 0.4)", effect: "stars" },
  { id: "md-brunch-glow", name: "Brunch Glow", cost: 0, category: "colors", vibe: "Sweet peach fizz", pattern: "aura", core: "#fb923c", accent: "#fde68a", glow: "#fdba74", trail: "rgba(251, 146, 60, 0.44)", effect: "sparks" },
  { id: "md-starlit-letter", name: "Starlit Letter", cost: 0, category: "outfits", vibe: "Love note shine", pattern: "stripe", core: "#f8fafc", accent: "#f472b6", glow: "#fbcfe8", trail: "rgba(251, 207, 232, 0.38)", effect: "hearts" },
  { id: "md-cosmic-mom", name: "Cosmic Mom", cost: 0, category: "wild", vibe: "Galaxy glam", pattern: "orbital", core: "#312e81", accent: "#facc15", glow: "#a78bfa", trail: "rgba(167, 139, 250, 0.42)", effect: "orbit" }
];

const ALL_SKINS: Skin[] = [...SKINS, ...CHEST_SKINS, ...MOTHERS_DAY_SKINS];
const SECRET_SKIN_IDS = new Set(SECRET_SKINS.map((skin) => skin.id));
const EXCLUSIVE_SKIN_IDS = new Set(EXCLUSIVE_SKINS.map((skin) => skin.id));
const CHEST_SKIN_IDS = new Set(CHEST_SKINS.map((skin) => skin.id));
const LIMITED_DROP_SKIN_IDS: SkinId[] = ["holo-flex", "apex", "galaxy", "meteor", "ghost-mode", "void-core"];

const MISSIONS: Mission[] = [
  { id: "spark-25", label: "Collect 25 sparks", kind: "sparks", goal: 25, reward: 30 },
  { id: "dodge-20", label: "Dodge 20 blocks", kind: "dodges", goal: 20, reward: 40 },
  { id: "near-5", label: "Score 5 near misses", kind: "nearMisses", goal: 5, reward: 35 },
  { id: "survive-45", label: "Survive 45 seconds", kind: "seconds", goal: 45, reward: 50 }
];

const PICKUP_GUIDE: Record<PickupKind, { label: string; shortLabel: string; effect: string; color: string }> = {
  spark: { label: "Spark", shortLabel: "Sparks", effect: "Currency and score", color: "#ffcf5a" },
  life: { label: "Heart", shortLabel: "Heal", effect: "Restores one heart", color: "#b6ff69" },
  magnet: { label: "Magnet", shortLabel: "Magnet", effect: "Pulls sparks to you", color: "#7df2dd" },
  slow: { label: "Slow Time", shortLabel: "Slow", effect: "Slows the blocks", color: "#6ee7f9" },
  ghost: { label: "Phase Shield", shortLabel: "Phase", effect: "Pass through blocks", color: "#b78cff" },
  double: { label: "2x Rush", shortLabel: "2x", effect: "Doubles score and sparks", color: "#ff4f87" }
};

const ACHIEVEMENTS: Achievement[] = [
  { id: "first-run", title: "First Launch", detail: "Finish one run", reward: 40, goal: 1, metric: "Runs", value: (_game, profile) => profile.totalRuns },
  { id: "score-1000", title: "Spark Rookie", detail: "Score 1,000 in one run", reward: 60, goal: 1000, metric: "Score", value: (game) => Math.floor(game.score) },
  { id: "score-5000", title: "Neon Threat", detail: "Score 5,000 in one run", reward: 120, goal: 5000, metric: "Score", value: (game) => Math.floor(game.score) },
  { id: "spark-20", title: "Coin Hungry", detail: "Collect 20 sparks in one run", reward: 70, goal: 20, metric: "Sparks", value: (game) => game.runSparks },
  { id: "dodge-50", title: "Lane Dancer", detail: "Dodge 50 blocks in one run", reward: 110, goal: 50, metric: "Dodges", value: (game) => game.dodges },
  { id: "near-10", title: "Close Call King", detail: "Score 10 near misses", reward: 130, goal: 10, metric: "Near misses", value: (game) => game.nearMisses },
  { id: "survive-60", title: "Minute Monster", detail: "Survive 60 seconds", reward: 160, goal: 60, metric: "Seconds", value: (game) => Math.floor(game.elapsed) },
  { id: "skin-10", title: "Style Collector", detail: "Own 10 ball skins", reward: 180, goal: 10, metric: "Skins", value: (_game, profile) => profile.unlockedSkins.filter(isSkinId).length }
];

export function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [profile, setProfile] = useState<Profile>(readProfile);
  const [mode, setMode] = useState<GameMode>("classic");
  const gameRef = useRef<GameState>(createGameState(readBestScore(), "classic", readProfile()));
  const pointerStartXRef = useRef<number | null>(null);
  const lastPublishedRef = useRef(0);
  const rewardedAdBusyRef = useRef(false);
  const mothersDayChestPromptedRef = useRef(false);
  const [snapshot, setSnapshot] = useState<GameSnapshot>(() => snapshotFromState(gameRef.current, profile));
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(readLeaderboard);
  const [dailyBoard, setDailyBoard] = useState<LeaderboardEntry[]>(() => readDailyBoard(dailyKey()));
  const [playerName, setPlayerName] = useState(readSavedName);
  const [hasPlayerName, setHasPlayerName] = useState(hasSavedPlayerName);
  const [submittedRun, setSubmittedRun] = useState(false);
  const [skinFilter, setSkinFilter] = useState<SkinFilter>("all");
  const [activePanel, setActivePanel] = useState<AppPanel>("home");
  const [recordScope, setRecordScope] = useState<RecordScope>("personal");
  const [previewSkinId, setPreviewSkinId] = useState<SkinId>(() => readProfile().selectedSkin);
  const [chestReveal, setChestReveal] = useState<ChestReveal | null>(null);

  const dailyLabel = useMemo(() => dailyKey(), []);
  const stageName = useMemo(() => stageForElapsed(snapshot.elapsed), [snapshot.elapsed]);
  const previewSkin = getSkin(previewSkinId);
  const unlockedSkins = profile.unlockedSkins ?? ["nova"];
  const ownedSkinCount = unlockedSkins.filter(isSkinId).length;
  const secretSkinCount = unlockedSkins.filter(isSecretSkinId).length;
  const exclusiveSkinCount = unlockedSkins.filter(isExclusiveSkinId).length;
  const vaultSkinCount = unlockedSkins.filter(isChestSkinId).length;
  const unlockedTrails = profile.unlockedTrails ?? ["trail-classic"];
  const unlockedObstacleStyles = profile.unlockedObstacleStyles ?? ["blocks-classic"];
  const selectedTrailStyle = getTrailStyle(profile.selectedTrail);
  const selectedObstacleStyle = getObstacleStyle(profile.selectedObstacleStyle);
  const selectedSkin = getSkin(profile.selectedSkin);
  const skinEffectsEnabled = profile.skinEffects ?? true;
  const visibleSkins = useMemo(
    () => [
      ...SKINS,
      ...CHEST_SKINS.filter((skin) => unlockedSkins.includes(skin.id)),
      ...MOTHERS_DAY_SKINS.filter((skin) => unlockedSkins.includes(skin.id))
    ],
    [unlockedSkins]
  );
  const scoreHistory = profile.scoreHistory ?? [];
  const filteredSkins = useMemo(
    () =>
      visibleSkins.filter((skin) => {
        if (skinFilter === "all") {
          return true;
        }
        if (skinFilter === "owned") {
          return unlockedSkins.includes(skin.id);
        }
        return skin.category === skinFilter;
      }),
    [skinFilter, unlockedSkins, visibleSkins]
  );
  const walletSparks = Math.max(profile.sparks ?? 0, snapshot.bankedSparks);
  const personalBest = Math.max(profile.personalBest ?? 0, snapshot.best);
  const reviveCount = profile.reviveTokens ?? 0;
  const lifeBoostCount = profile.lifeBoosts ?? 0;
  const armorCount = profile.armorPlates ?? 0;
  const magnetPackCount = profile.magnetPacks ?? 0;
  const rushBoostCount = profile.rushBoosts ?? 0;
  const totalRuns = profile.totalRuns ?? 0;
  const bestStreakRecord = Math.max(profile.bestStreak ?? 0, snapshot.bestStreak);
  const canSubmitScore = snapshot.screen === "gameOver" && snapshot.score > 0 && !submittedRun;
  const cleanPlayerName = sanitizeName(playerName);
  const canSavePlayerName = cleanPlayerName.length > 0;
  const previewUnlocked = unlockedSkins.includes(previewSkin.id);
  const previewEquipped = profile.selectedSkin === previewSkin.id;
  const previewCanBuy = walletSparks >= previewSkin.cost;
  const locationLabels = useMemo(() => resolveLocationLabels(), []);
  const recordEntries = useMemo(
    () => recordsForScope(recordScope, {
      leaderboard,
      dailyBoard,
      scoreHistory,
      playerName
    }),
    [dailyBoard, leaderboard, locationLabels.country, locationLabels.timeZone, playerName, recordScope, scoreHistory]
  );
  const recordTitle = recordTitleForScope(recordScope, dailyLabel, locationLabels.country, locationLabels.timeZone);
  const recordEmptyLabel = recordEmptyLabelForScope(recordScope);
  const modeDetail = mode === "daily" ? "Hard lane | faster blocks | richer sparks" : "Classic lane | balanced pace";
  const dailyRewardStatus = useMemo(() => getDailyRewardStatus(profile), [profile]);
  const dailyReward = DAILY_REWARDS[dailyRewardStatus.rewardIndex];
  const chestPercent = Math.min(100, Math.floor(((profile.chestProgress ?? 0) / CHEST_GOAL) * 100));
  const chestReady = (profile.chestProgress ?? 0) >= CHEST_GOAL;
  const nextAbilityChestIn = remainingMilestone(profile.chestsOpened ?? 0, ABILITY_CHEST_INTERVAL);
  const nextSecretChestIn = remainingMilestone(profile.chestsOpened ?? 0, SECRET_CHEST_INTERVAL);
  const nextExclusiveChestIn = remainingMilestone(profile.chestsOpened ?? 0, EXCLUSIVE_CHEST_INTERVAL);
  const abilityInventory = profile.abilities ?? emptyAbilityInventory();
  const abilityTokenCount = totalAbilityCount(abilityInventory);
  const unlockedAchievementIds = profile.achievements ?? [];
  const unlockedAchievementCount = unlockedAchievementIds.length;
  const limitedDropSkins = useMemo(() => limitedDropsForDate(dailyLabel), [dailyLabel]);
  const nextLimitedDrop = limitedDropSkins.find((skin) => !unlockedSkins.includes(skin.id)) ?? limitedDropSkins[0];
  const gameOverIsNewBest = snapshot.screen === "gameOver" && snapshot.score > 0 && snapshot.score >= personalBest;
  const runChestGain = estimateChestGain(snapshot);
  const rewardedAdsRemaining = remainingRewardedAds(profile);

  const publish = useCallback(() => {
    setSnapshot(snapshotFromState(gameRef.current, readProfile()));
  }, []);

  const savePlayerNameFromMenu = useCallback(() => {
    const cleanName = sanitizeName(playerName);
    if (!cleanName) {
      return;
    }
    savePlayerName(cleanName);
    setPlayerName(cleanName);
    setHasPlayerName(true);
    gameRef.current.eventMessage = `Ready, ${cleanName}`;
    gameRef.current.eventTtl = 1.4;
    publish();
  }, [playerName, publish]);

  const finalizeRun = useCallback((game: GameState) => {
    const score = Math.floor(game.score);
    if (score > game.best) {
      game.best = score;
      saveBestScore(score);
    }

    const current = readProfile();
    const shouldCountRun = !game.finalHandled && score > 0;
    const countedProfile = { ...current, totalRuns: current.totalRuns + (shouldCountRun ? 1 : 0) };
    const newAchievements = shouldCountRun ? unlockedAchievementsForRun(game, countedProfile) : [];
    const achievementReward = newAchievements.reduce((total, achievement) => total + achievement.reward, 0);
    const chestGain = shouldCountRun ? estimateChestGain(game) : 0;
    const nextSparks = Math.max(current.sparks, game.bankedSparks) + achievementReward;
    const nextBest = Math.max(current.personalBest, game.best, score);
    const nextStreak = Math.max(current.bestStreak, game.bestStreak);
    const nextHistory = shouldCountRun
      ? [
          {
            score,
            streak: game.bestStreak,
            sparks: game.runSparks,
            mode: game.mode,
            skinId: game.skinId,
            date: new Date().toISOString()
          },
          ...current.scoreHistory
        ].slice(0, 20)
      : current.scoreHistory;
    const nextAchievements = newAchievements.length > 0 ? [...current.achievements, ...newAchievements.map((achievement) => achievement.id)] : current.achievements;
    const nextChestProgress = shouldCountRun ? Math.min(CHEST_GOAL, current.chestProgress + chestGain) : current.chestProgress;

    if (shouldCountRun) {
      game.finalHandled = true;
    }

    if (
      nextSparks === current.sparks &&
      nextBest === current.personalBest &&
      nextStreak === current.bestStreak &&
      nextHistory === current.scoreHistory &&
      nextAchievements === current.achievements &&
      nextChestProgress === current.chestProgress &&
      !shouldCountRun
    ) {
      return;
    }

    const nextProfile: Profile = {
      ...current,
      sparks: nextSparks,
      personalBest: nextBest,
      bestStreak: nextStreak,
      scoreHistory: nextHistory,
      totalRuns: countedProfile.totalRuns,
      achievements: nextAchievements,
      chestProgress: nextChestProgress
    };
    saveProfile(nextProfile);
    setProfile(nextProfile);
    game.bankedSparks = Math.max(game.bankedSparks, nextProfile.sparks);

    if (newAchievements.length > 0) {
      game.eventMessage = `${newAchievements[0].title} +${achievementReward}`;
      game.eventTtl = 1.8;
    } else if (chestGain > 0) {
      game.eventMessage = `Chest +${chestGain}`;
      game.eventTtl = 1.4;
    }
  }, []);

  const startGame = useCallback(() => {
    if (!hasPlayerName) {
      setActivePanel("home");
      return;
    }

    const currentGame = gameRef.current;
    if (currentGame.screen === "gameOver") {
      finalizeRun(currentGame);
    }

    const currentProfile = readProfile();
    const autoArmor = Math.min(MAX_ARMOR, currentProfile.armorPlates);
    const autoLives = Math.min(MAX_STACKED_LIVES - MAX_LIVES, currentProfile.lifeBoosts);
    const launchProfile =
      autoArmor > 0 || autoLives > 0
        ? {
            ...currentProfile,
            armorPlates: currentProfile.armorPlates - autoArmor,
            lifeBoosts: currentProfile.lifeBoosts - autoLives
          }
        : currentProfile;
    if (autoArmor > 0 || autoLives > 0) {
      saveProfile(launchProfile);
      setProfile(launchProfile);
    }
    const nextGame = createGameState(readBestScore(), mode, launchProfile);
    nextGame.screen = "playing";
    nextGame.maxLives = MAX_LIVES + autoLives;
    nextGame.lives = nextGame.maxLives;
    nextGame.armor = autoArmor;
    nextGame.lastTime = performance.now();
    nextGame.eventMessage = autoArmor > 0 || autoLives > 0 ? `${autoArmor} shield | ${autoLives} bonus lives` : "Run live";
    nextGame.eventTtl = autoArmor > 0 || autoLives > 0 ? 1.6 : 1;
    gameRef.current = nextGame;
    setSubmittedRun(false);
    publish();
  }, [finalizeRun, hasPlayerName, mode, publish]);

  const setPaused = useCallback(
    (paused: boolean) => {
      const game = gameRef.current;
      if (paused && game.screen === "playing") {
        game.screen = "paused";
        game.eventMessage = "Paused";
        game.eventTtl = 1;
      } else if (!paused && game.screen === "paused") {
        game.screen = "playing";
        game.lastTime = performance.now();
        game.eventMessage = "Run live";
        game.eventTtl = 1;
      }
      publish();
    },
    [publish]
  );

  const nudgeLane = useCallback(
    (direction: -1 | 1) => {
      const game = gameRef.current;
      if (game.screen !== "playing") {
        return;
      }
      game.targetLane = clamp(game.targetLane + direction, 0, LANES - 1);
      game.pulse = 0.18;
      publish();
    },
    [publish]
  );

  const submitScore = useCallback(() => {
    if (!canSubmitScore) {
      return;
    }

    const game = gameRef.current;
    finalizeRun(game);

    const cleanName = normalizeName(playerName);
    const entry: LeaderboardEntry = {
      name: cleanName,
      score: snapshot.score,
      date: new Date().toISOString(),
      streak: snapshot.bestStreak,
      mode: snapshot.mode
    };

    const nextBoard = [...leaderboard, entry].sort((a, b) => b.score - a.score).slice(0, 10);
    saveLeaderboard(nextBoard);
    setLeaderboard(nextBoard);

    if (snapshot.mode === "daily") {
      const nextDaily = [...dailyBoard, entry].sort((a, b) => b.score - a.score).slice(0, 10);
      saveDailyBoard(dailyKey(), nextDaily);
      setDailyBoard(nextDaily);
    }

    savePlayerName(cleanName);
    setPlayerName(cleanName);
    setHasPlayerName(true);
    setSubmittedRun(true);
    game.eventMessage = "Score saved";
    game.eventTtl = 1.4;
    publish();
  }, [canSubmitScore, dailyBoard, finalizeRun, leaderboard, playerName, publish, snapshot.bestStreak, snapshot.mode, snapshot.score]);

  const clearLeaderboard = useCallback(() => {
    saveLeaderboard([]);
    saveDailyBoard(dailyKey(), []);
    setLeaderboard([]);
    setDailyBoard([]);
    setSubmittedRun(false);
    gameRef.current.eventMessage = "Boards cleared";
    gameRef.current.eventTtl = 1.4;
    publish();
  }, [publish]);

  const toggleSound = useCallback(() => {
    const current = readProfile();
    const next = { ...current, muted: !current.muted };
    saveProfile(next);
    setProfile(next);
    gameRef.current.muted = next.muted;
    gameRef.current.eventMessage = next.muted ? "Sound off" : "Sound on";
    gameRef.current.eventTtl = 1.2;
    publish();
  }, [publish]);

  const toggleSkinEffects = useCallback(() => {
    const current = readProfile();
    const next = { ...current, skinEffects: !current.skinEffects };
    saveProfile(next);
    setProfile(next);
    gameRef.current.skinEffects = next.skinEffects;
    gameRef.current.eventMessage = next.skinEffects ? "Skin effects on" : "Skin effects off";
    gameRef.current.eventTtl = 1.2;
    publish();
  }, [publish]);

  const selectMode = useCallback(
    (nextMode: GameMode) => {
      setMode(nextMode);
      if (gameRef.current.screen !== "playing") {
        gameRef.current.mode = nextMode;
        gameRef.current.eventMessage = nextMode === "daily" ? "Daily hard lane" : "Classic balanced";
        gameRef.current.eventTtl = 1.2;
        publish();
      }
    },
    [publish]
  );

  const buySkin = useCallback(
    (skin: Skin) => {
      const current = readProfile();
      const game = gameRef.current;
      const availableSparks = Math.max(current.sparks, game.bankedSparks);
      if (current.unlockedSkins.includes(skin.id)) {
        const next = { ...current, selectedSkin: skin.id };
        saveProfile(next);
        setProfile(next);
        game.skinId = skin.id;
        game.eventMessage = `${skin.name} equipped`;
        game.eventTtl = 1.4;
        publish();
        return;
      }

      if (availableSparks < skin.cost) {
        game.eventMessage = `Need ${skin.cost - availableSparks} more sparks`;
        game.eventTtl = 1.4;
        publish();
        return;
      }

      const next: Profile = {
        ...current,
        sparks: availableSparks - skin.cost,
        selectedSkin: skin.id,
        unlockedSkins: [...current.unlockedSkins, skin.id]
      };
      saveProfile(next);
      setProfile(next);
      game.bankedSparks = next.sparks;
      game.skinId = skin.id;
      game.eventMessage = `${skin.name} unlocked`;
      game.eventTtl = 1.4;
      publish();
    },
    [publish]
  );

  const equipTrailStyle = useCallback(
    (styleId: TrailStyleId) => {
      const current = readProfile();
      const style = getTrailStyle(styleId);
      const game = gameRef.current;
      if (!current.unlockedTrails.includes(style.id)) {
        game.eventMessage = "Trail locked";
        game.eventTtl = 1.2;
        publish();
        return;
      }
      const next = { ...current, selectedTrail: style.id };
      saveProfile(next);
      setProfile(next);
      game.trailStyleId = style.id;
      game.eventMessage = `${style.name} equipped`;
      game.eventTtl = 1.4;
      publish();
    },
    [publish]
  );

  const equipObstacleStyle = useCallback(
    (styleId: ObstacleStyleId) => {
      const current = readProfile();
      const style = getObstacleStyle(styleId);
      const game = gameRef.current;
      if (!current.unlockedObstacleStyles.includes(style.id)) {
        game.eventMessage = "Block style locked";
        game.eventTtl = 1.2;
        publish();
        return;
      }
      const next = { ...current, selectedObstacleStyle: style.id };
      saveProfile(next);
      setProfile(next);
      game.obstacleStyleId = style.id;
      game.eventMessage = `${style.name} equipped`;
      game.eventTtl = 1.4;
      publish();
    },
    [publish]
  );

  const buyReviveToken = useCallback(() => {
    const current = readProfile();
    const game = gameRef.current;
    const availableSparks = Math.max(current.sparks, game.bankedSparks);
    if (availableSparks < REVIVE_COST) {
      game.eventMessage = `Need ${REVIVE_COST} sparks`;
      game.eventTtl = 1.4;
      publish();
      return;
    }
    const next = { ...current, sparks: availableSparks - REVIVE_COST, reviveTokens: current.reviveTokens + 1 };
    saveProfile(next);
    setProfile(next);
    game.bankedSparks = next.sparks;
    game.eventMessage = "Revive token bought";
    game.eventTtl = 1.4;
    publish();
  }, [publish]);

  const buyExtraLife = useCallback(() => {
    const current = readProfile();
    const game = gameRef.current;
    const availableSparks = Math.max(current.sparks, game.bankedSparks);
    if (availableSparks < EXTRA_LIFE_COST) {
      game.eventMessage = `Need ${EXTRA_LIFE_COST} sparks`;
      game.eventTtl = 1.4;
      publish();
      return;
    }

    const canApplyNow = (game.screen === "playing" || game.screen === "paused") && game.lives < MAX_STACKED_LIVES;
    const next: Profile = {
      ...current,
      sparks: availableSparks - EXTRA_LIFE_COST,
      lifeBoosts: canApplyNow ? current.lifeBoosts : current.lifeBoosts + 1
    };
    saveProfile(next);
    setProfile(next);
    game.bankedSparks = next.sparks;

    if (canApplyNow) {
      game.maxLives = Math.min(MAX_STACKED_LIVES, Math.max(game.maxLives, game.lives + 1));
      game.lives = Math.min(game.maxLives, game.lives + 1);
      game.eventMessage = "+1 life bought";
      burst(game, game.playerX, PLAYER_Y - 45, "#b6ff69", 14);
      playSound("power", game.muted);
    } else {
      game.eventMessage = "Extra life stocked";
    }
    game.eventTtl = 1.4;
    publish();
  }, [publish]);

  const buyArmorPlate = useCallback(() => {
    const current = readProfile();
    const game = gameRef.current;
    const availableSparks = Math.max(current.sparks, game.bankedSparks);
    if (availableSparks < ARMOR_COST) {
      game.eventMessage = `Need ${ARMOR_COST} sparks`;
      game.eventTtl = 1.4;
      publish();
      return;
    }

    const canApplyNow = (game.screen === "playing" || game.screen === "paused") && game.armor < MAX_ARMOR;
    const next = {
      ...current,
      sparks: availableSparks - ARMOR_COST,
      armorPlates: canApplyNow ? current.armorPlates : current.armorPlates + 1
    };
    saveProfile(next);
    setProfile(next);
    game.bankedSparks = next.sparks;
    if (canApplyNow) {
      game.armor = Math.min(MAX_ARMOR, game.armor + 1);
      game.armorGrace = Math.max(game.armorGrace, 0.3);
      game.eventMessage = "Shield equipped";
      burst(game, game.playerX, PLAYER_Y - 58, "#67e8f9", 14);
      playSound("power", game.muted);
    } else {
      game.eventMessage = "Shield stocked for next run";
    }
    game.eventTtl = 1.4;
    publish();
  }, [publish]);

  const buyMagnetPack = useCallback(() => {
    const current = readProfile();
    const game = gameRef.current;
    const availableSparks = Math.max(current.sparks, game.bankedSparks);
    if (availableSparks < MAGNET_PACK_COST) {
      game.eventMessage = `Need ${MAGNET_PACK_COST} sparks`;
      game.eventTtl = 1.4;
      publish();
      return;
    }

    const next = { ...current, sparks: availableSparks - MAGNET_PACK_COST, magnetPacks: current.magnetPacks + 1 };
    saveProfile(next);
    setProfile(next);
    game.bankedSparks = next.sparks;
    game.eventMessage = "Magnet stocked";
    game.eventTtl = 1.4;
    publish();
  }, [publish]);

  const buyRushBoost = useCallback(() => {
    const current = readProfile();
    const game = gameRef.current;
    const availableSparks = Math.max(current.sparks, game.bankedSparks);
    if (availableSparks < RUSH_BOOST_COST) {
      game.eventMessage = `Need ${RUSH_BOOST_COST} sparks`;
      game.eventTtl = 1.4;
      publish();
      return;
    }

    const next = { ...current, sparks: availableSparks - RUSH_BOOST_COST, rushBoosts: current.rushBoosts + 1 };
    saveProfile(next);
    setProfile(next);
    game.bankedSparks = next.sparks;
    game.eventMessage = "2x boost stocked";
    game.eventTtl = 1.4;
    publish();
  }, [publish]);

  const useLifeBoost = useCallback(() => {
    const current = readProfile();
    const game = gameRef.current;
    if (current.lifeBoosts <= 0) {
      game.eventMessage = "No extra lives";
      game.eventTtl = 1.2;
      publish();
      return;
    }
    if (game.screen !== "playing" && game.screen !== "paused") {
      game.eventMessage = "Start a run first";
      game.eventTtl = 1.2;
      publish();
      return;
    }
    if (game.lives >= MAX_STACKED_LIVES) {
      game.eventMessage = "Life stack full";
      game.eventTtl = 1.2;
      publish();
      return;
    }

    const next = { ...current, lifeBoosts: current.lifeBoosts - 1 };
    saveProfile(next);
    setProfile(next);
    game.maxLives = Math.min(MAX_STACKED_LIVES, Math.max(game.maxLives, game.lives + 1));
    game.lives = Math.min(game.maxLives, game.lives + 1);
    game.eventMessage = "Extra life used";
    game.eventTtl = 1.4;
    burst(game, game.playerX, PLAYER_Y - 45, "#b6ff69", 14);
    playSound("power", game.muted);
    publish();
  }, [publish]);

  const useArmorPlate = useCallback(() => {
    const current = readProfile();
    const game = gameRef.current;
    if (current.armorPlates <= 0) {
      game.eventMessage = "No shield";
      game.eventTtl = 1.2;
      publish();
      return;
    }
    if (game.screen !== "playing" && game.screen !== "paused") {
      game.eventMessage = "Start a run first";
      game.eventTtl = 1.2;
      publish();
      return;
    }
    if (game.armor >= MAX_ARMOR) {
      game.eventMessage = "Shield full";
      game.eventTtl = 1.2;
      publish();
      return;
    }

    const next = { ...current, armorPlates: current.armorPlates - 1 };
    saveProfile(next);
    setProfile(next);
    game.armor = Math.min(MAX_ARMOR, game.armor + 1);
    game.armorGrace = Math.max(game.armorGrace, 0.3);
    game.eventMessage = "Shield equipped";
    game.eventTtl = 1.4;
    burst(game, game.playerX, PLAYER_Y - 58, "#67e8f9", 14);
    playSound("power", game.muted);
    publish();
  }, [publish]);

  const useMagnetPack = useCallback(() => {
    const current = readProfile();
    const game = gameRef.current;
    if (current.magnetPacks <= 0) {
      game.eventMessage = "No magnets";
      game.eventTtl = 1.2;
      publish();
      return;
    }
    if (game.screen !== "playing" && game.screen !== "paused") {
      game.eventMessage = "Start a run first";
      game.eventTtl = 1.2;
      publish();
      return;
    }

    const next = { ...current, magnetPacks: current.magnetPacks - 1 };
    saveProfile(next);
    setProfile(next);
    game.activePowerups.magnet = Math.max(game.activePowerups.magnet, 9);
    game.eventMessage = "Magnet pack live";
    game.eventTtl = 1.4;
    playSound("power", game.muted);
    publish();
  }, [publish]);

  const useRushBoost = useCallback(() => {
    const current = readProfile();
    const game = gameRef.current;
    if (current.rushBoosts <= 0) {
      game.eventMessage = "No boosts";
      game.eventTtl = 1.2;
      publish();
      return;
    }
    if (game.screen !== "playing" && game.screen !== "paused") {
      game.eventMessage = "Start a run first";
      game.eventTtl = 1.2;
      publish();
      return;
    }

    const next = { ...current, rushBoosts: current.rushBoosts - 1 };
    saveProfile(next);
    setProfile(next);
    game.activePowerups.double = Math.max(game.activePowerups.double, 8);
    game.eventMessage = "2x rush live";
    game.eventTtl = 1.4;
    playSound("power", game.muted);
    publish();
  }, [publish]);

  const useAbility = useCallback((abilityId: AbilityId) => {
    const current = readProfile();
    const game = gameRef.current;
    const ability = ABILITIES[abilityId];
    if ((current.abilities[abilityId] ?? 0) <= 0) {
      game.eventMessage = `No ${ability.shortLabel}`;
      game.eventTtl = 1.2;
      publish();
      return;
    }
    if (game.screen !== "playing" && game.screen !== "paused") {
      game.eventMessage = "Start a run first";
      game.eventTtl = 1.2;
      publish();
      return;
    }

    const nextAbilities = {
      ...current.abilities,
      [abilityId]: Math.max(0, current.abilities[abilityId] - 1)
    };
    const next = { ...current, abilities: nextAbilities };
    saveProfile(next);
    setProfile(next);

    if (abilityId === "phaseCloak") {
      game.activePowerups.ghost = Math.max(game.activePowerups.ghost, ability.duration);
    } else if (abilityId === "megaMagnet") {
      game.activePowerups.magnet = Math.max(game.activePowerups.magnet, ability.duration);
    } else if (abilityId === "heartBurst") {
      game.maxLives = Math.min(MAX_STACKED_LIVES, Math.max(game.maxLives, game.lives + 1));
      game.lives = Math.min(game.maxLives, game.lives + 1);
    } else if (abilityId === "timeBrake") {
      game.activePowerups.slow = Math.max(game.activePowerups.slow, ability.duration);
    } else if (abilityId === "sparkSurge") {
      game.activePowerups.double = Math.max(game.activePowerups.double, ability.duration);
    }

    game.eventMessage = `${ability.shortLabel} live`;
    game.eventTtl = 1.4;
    burst(game, game.playerX, PLAYER_Y - 58, ability.color, 18);
    playSound("power", game.muted);
    publish();
  }, [publish]);

  const useRevive = useCallback(() => {
    const game = gameRef.current;
    const current = readProfile();
    if (game.screen !== "gameOver" || game.revived || current.reviveTokens <= 0) {
      return;
    }

    const next = { ...current, reviveTokens: current.reviveTokens - 1 };
    saveProfile(next);
    setProfile(next);
    reviveGame(game, "Revived");
    playSound("power", game.muted);
    publish();
  }, [publish]);

  const claimDailyReward = useCallback(() => {
    const current = readProfile();
    const status = getDailyRewardStatus(current);
    if (!status.available) {
      gameRef.current.eventMessage = "Daily claimed";
      gameRef.current.eventTtl = 1.2;
      publish();
      return;
    }

    const reward = DAILY_REWARDS[status.rewardIndex];
    let next = applyDailyReward(current, reward);
    let rewardLabel = reward.detail;
    let chestRevealResult: ChestRewardResult | null = null;
    if (reward.kind === "chest") {
      const chest = grantChestReward(next, true);
      next = chest.profile;
      rewardLabel = chest.reward.label;
      chestRevealResult = chest;
    }

    next = {
      ...next,
      dailyStreak: status.nextStreak,
      lastDailyRewardDate: dailyKey()
    };
    saveProfile(next);
    setProfile(next);
    gameRef.current.bankedSparks = Math.max(gameRef.current.bankedSparks, next.sparks);
    gameRef.current.eventMessage = `Daily ${rewardLabel}`;
    gameRef.current.eventTtl = 1.8;
    if (chestRevealResult) {
      setChestReveal(chestRevealFromResult(chestRevealResult, "Daily Reward"));
    }
    publish();
  }, [publish]);

  const openRewardChest = useCallback(() => {
    const current = readProfile();
    if (current.chestProgress < CHEST_GOAL) {
      gameRef.current.eventMessage = `Chest ${current.chestProgress}/${CHEST_GOAL}`;
      gameRef.current.eventTtl = 1.2;
      publish();
      return;
    }

    const chest = grantChestReward(current, false);
    saveProfile(chest.profile);
    setProfile(chest.profile);
    gameRef.current.bankedSparks = Math.max(gameRef.current.bankedSparks, chest.profile.sparks);
    gameRef.current.eventMessage = `Chest: ${chest.reward.label}`;
    gameRef.current.eventTtl = 1.8;
    setChestReveal(chestRevealFromResult(chest, "Reward Chest"));
    playSound("power", gameRef.current.muted);
    publish();
  }, [publish]);

  const claimMothersDaySkin = useCallback((skinId: SkinId) => {
    const today = dailyKey();
    const selectedEventSkin = MOTHERS_DAY_SKINS.find((skin) => skin.id === skinId);
    const game = gameRef.current;
    if (!selectedEventSkin || !isMothersDayEventDate(today) || hasClaimedMothersDayChest(today)) {
      setChestReveal(null);
      return;
    }

    const current = readProfile();
    const nextUnlockedSkins = current.unlockedSkins.includes(selectedEventSkin.id)
      ? current.unlockedSkins
      : [...current.unlockedSkins, selectedEventSkin.id];
    const next: Profile = {
      ...current,
      selectedSkin: selectedEventSkin.id,
      skinEffects: true,
      unlockedSkins: nextUnlockedSkins
    };

    markMothersDayChestClaimed(today);
    saveProfile(next);
    setProfile(next);
    setPreviewSkinId(selectedEventSkin.id);
    game.skinId = selectedEventSkin.id;
    game.skinEffects = true;
    game.bankedSparks = Math.max(game.bankedSparks, next.sparks);
    game.eventMessage = `${selectedEventSkin.name} equipped`;
    game.eventTtl = 1.8;
    setChestReveal(null);
    playSound("power", game.muted);
    publish();
  }, [publish]);

  const watchRewardedAd = useCallback(
    async (type: RewardedPlacement) => {
      const game = gameRef.current;
      const current = readProfile();
      if (rewardedAdBusyRef.current) {
        game.eventMessage = "Ad loading";
        game.eventTtl = 1.2;
        publish();
        return;
      }
      if (remainingRewardedAds(current) <= 0) {
        game.eventMessage = "Ad rewards reset tomorrow";
        game.eventTtl = 1.4;
        publish();
        return;
      }

      if (type === "revive") {
        if (game.screen !== "gameOver" || game.revived || game.adReviveUsed) {
          return;
        }
        rewardedAdBusyRef.current = true;
        game.eventMessage = "Loading ad";
        game.eventTtl = 1.4;
        publish();
        const ad = await showRewardedAd(type);
        rewardedAdBusyRef.current = false;
        if (!ad.rewarded) {
          game.eventMessage = ad.message;
          game.eventTtl = 1.5;
          publish();
          return;
        }
        const next = noteRewardedAd(current);
        saveProfile(next);
        setProfile(next);
        game.adReviveUsed = true;
        reviveGame(game, ad.native ? "Ad revive" : "Preview revive");
        playSound("power", game.muted);
        publish();
        return;
      }

      if (type === "doubleSparks") {
        if (game.screen !== "gameOver" || game.adDoubleClaimed) {
          return;
        }
        rewardedAdBusyRef.current = true;
        game.eventMessage = "Loading ad";
        game.eventTtl = 1.4;
        publish();
        const ad = await showRewardedAd(type);
        rewardedAdBusyRef.current = false;
        if (!ad.rewarded) {
          game.eventMessage = ad.message;
          game.eventTtl = 1.5;
          publish();
          return;
        }
        const bonus = Math.max(20, game.runSparks, Math.floor(game.score / 450));
        const next = noteRewardedAd({ ...current, sparks: Math.max(current.sparks, game.bankedSparks) + bonus });
        saveProfile(next);
        setProfile(next);
        game.bankedSparks = next.sparks;
        game.adDoubleClaimed = true;
        game.eventMessage = `${ad.native ? "Ad" : "Preview"} bonus +${bonus}`;
        game.eventTtl = 1.8;
        playSound("power", game.muted);
        publish();
        return;
      }

      if (type === "freeChest") {
        if (game.adChestClaimed) {
          return;
        }
        rewardedAdBusyRef.current = true;
        game.eventMessage = "Loading ad";
        game.eventTtl = 1.4;
        publish();
        const ad = await showRewardedAd(type);
        rewardedAdBusyRef.current = false;
        if (!ad.rewarded) {
          game.eventMessage = ad.message;
          game.eventTtl = 1.5;
          publish();
          return;
        }
        const counted = noteRewardedAd(current);
        const chest = grantChestReward(counted, true);
        saveProfile(chest.profile);
        setProfile(chest.profile);
        game.bankedSparks = Math.max(game.bankedSparks, chest.profile.sparks);
        game.adChestClaimed = true;
        game.eventMessage = `${ad.native ? "Ad" : "Preview"} chest: ${chest.reward.label}`;
        game.eventTtl = 1.8;
        setChestReveal(chestRevealFromResult(chest, ad.native ? "Ad Chest" : "Preview Chest"));
        playSound("power", game.muted);
        publish();
      }
    },
    [publish]
  );

  const openPrivacyOptions = useCallback(async () => {
    const message = await showPrivacyOptions();
    gameRef.current.eventMessage = message;
    gameRef.current.eventTtl = 1.5;
    publish();
  }, [publish]);

  const handlePreviewSkinAction = useCallback(() => {
    buySkin(previewSkin);
  }, [buySkin, previewSkin]);

  useEffect(() => {
    if (!hasPlayerName || activePanel !== "home" || chestReveal || mothersDayChestPromptedRef.current) {
      return;
    }

    const today = dailyKey();
    if (!isMothersDayEventDate(today) || hasClaimedMothersDayChest(today)) {
      return;
    }

    mothersDayChestPromptedRef.current = true;
    setChestReveal({
      title: "Mother's Day Chest!",
      kicker: "Pick one limited skin",
      source: "Weekend Gift",
      opened: profile.chestsOpened ?? 0,
      counterLabel: "Weekend gift | 1 per day",
      premium: true,
      items: [
        { label: "1 Free Event Skin", detail: "Choose from 10 limited balls", tier: "exclusive", color: "#ff8fb3" },
        { label: "Free event claim", detail: "Does not advance vault chest count", tier: "cosmetic", color: "#7df2dd" }
      ],
      choices: MOTHERS_DAY_SKINS,
      choiceTitle: "Choose your weekend drop",
      choiceCta: "Claim Skin"
    });
  }, [activePanel, chestReveal, hasPlayerName, profile.chestsOpened]);

  useEffect(() => {
    if (activePanel === "play") {
      void hideMenuBanner();
      return;
    }

    void showMenuBanner();
  }, [activePanel]);

  useEffect(() => {
    if (activePanel !== "play") {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const canvasElement: HTMLCanvasElement = canvas;
    const context2d: CanvasRenderingContext2D = context;
    let frameId = 0;
    let mounted = true;

    function resizeCanvas() {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvasElement.width = Math.floor(BOARD_WIDTH * dpr);
      canvasElement.height = Math.floor(BOARD_HEIGHT * dpr);
      canvasElement.style.width = "100%";
      canvasElement.style.height = "100%";
      context2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function loop(now: number) {
      if (!mounted) {
        return;
      }

      const game = gameRef.current;
      const dt = Math.min(0.032, Math.max(0, (now - game.lastTime) / 1000 || 0));
      game.lastTime = now;

      if (game.screen === "playing") {
        updateGame(game);
        advanceGame(game, dt);
      } else {
        updateIdleGame(game, dt);
      }

      const storedProfile = readProfile();
      if (game.bankedSparks > storedProfile.sparks) {
        const nextProfile = { ...storedProfile, sparks: game.bankedSparks };
        saveProfile(nextProfile);
        setProfile(nextProfile);
      }

      if (game.screen === "gameOver") {
        finalizeRun(game);
      }

      drawGame(context2d, game, now);

      if (now - lastPublishedRef.current > 80 || game.screen === "gameOver") {
        lastPublishedRef.current = now;
        setSnapshot(snapshotFromState(game, readProfile()));
      }

      frameId = window.requestAnimationFrame(loop);
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    frameId = window.requestAnimationFrame(loop);

    return () => {
      mounted = false;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [activePanel, finalizeRun]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isTextEntryTarget(event.target)) {
        return;
      }
      if (activePanel !== "play") {
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
        event.preventDefault();
        nudgeLane(-1);
      }
      if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
        event.preventDefault();
        nudgeLane(1);
      }
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        const screen = gameRef.current.screen;
        if (screen === "ready" || screen === "gameOver") {
          startGame();
        } else {
          setPaused(screen === "playing");
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePanel, nudgeLane, setPaused, startGame]);

  function handleCanvasPointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    pointerStartXRef.current = event.clientX;
  }

  function handleCanvasPointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    const startX = pointerStartXRef.current;
    pointerStartXRef.current = null;

    if (gameRef.current.screen === "ready" || gameRef.current.screen === "gameOver") {
      startGame();
      return;
    }

    if (gameRef.current.screen !== "playing") {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const delta = startX === null ? 0 : event.clientX - startX;
    if (Math.abs(delta) > 24) {
      nudgeLane(delta > 0 ? 1 : -1);
      return;
    }
    nudgeLane(event.clientX - rect.left > rect.width / 2 ? 1 : -1);
  }

  function handleOverlayPointerUp() {
    if (snapshot.screen === "ready" || snapshot.screen === "gameOver") {
      startGame();
      return;
    }
    if (snapshot.screen === "paused") {
      setPaused(false);
    }
  }

  function exitToMainMenu() {
    if (gameRef.current.screen === "playing") {
      setPaused(true);
    }
    setActivePanel("home");
  }

  const appShellClass = activePanel === "play" ? "app-shell app-shell--playing" : activePanel === "home" ? "app-shell app-shell--home" : "app-shell";

  return (
    <main className={appShellClass}>
      <section className="app-stack">
        {activePanel !== "play" && activePanel !== "home" ? (
        <nav className="main-menu-card" aria-label="Main menu">
          <button type="button" className="main-menu-title" onClick={() => setActivePanel("home")}>
            <p className="eyebrow">Main Menu</p>
            <strong>Pick a lane</strong>
          </button>
          <div className="main-menu-tabs">
            {APP_PANELS.map((panel) => (
              <button
                type="button"
                className={activePanel === panel.id ? "main-menu-button main-menu-button--active" : "main-menu-button"}
                key={panel.id}
                disabled={panel.id === "play" && !hasPlayerName}
                onClick={() => {
                  if (panel.id === "play" && !hasPlayerName) {
                    setActivePanel("home");
                    return;
                  }
                  if (panel.id === "play") {
                    setActivePanel("play");
                    startGame();
                    return;
                  }
                  if (gameRef.current.screen === "playing") {
                    setPaused(true);
                  }
                  setActivePanel(panel.id);
                }}
              >
                {panel.label}
              </button>
            ))}
          </div>
          <div className="main-menu-wallet">
            <span>{walletSparks.toLocaleString()}</span>
            <small>Sparks</small>
          </div>
        </nav>
        ) : null}

      {activePanel === "play" ? (
      <section className="game-layout game-layout--play-only" aria-label="Sparkline Rush arcade game">
        <div className="play-column">
          <div className={`game-frame ${snapshot.screen === "playing" ? "game-frame--live" : ""}`}>
            <div className="game-hud" aria-label="Run score">
              <span>
                Score
                <strong>{snapshot.score.toLocaleString()}</strong>
              </span>
              <span>
                Sparks
                <strong>{snapshot.runSparks.toLocaleString()}</strong>
              </span>
            </div>
            <button type="button" className="game-menu-button" aria-label="Exit to main menu" onClick={exitToMainMenu}>
              Menu
            </button>
            <button
              type="button"
              className="game-pause-button"
              aria-label={snapshot.screen === "playing" ? "Pause run" : "Resume run"}
              onClick={() => {
                if (snapshot.screen === "ready" || snapshot.screen === "gameOver") {
                  startGame();
                  return;
                }
                setPaused(snapshot.screen === "playing");
              }}
            >
              {snapshot.screen === "playing" ? "II" : ">"}
            </button>
            <LifeTracker lives={snapshot.lives} maxLives={snapshot.maxLives} armor={snapshot.armor} maxArmor={MAX_ARMOR} />
            <PowerupBar powerups={snapshot.activePowerups} />
            <canvas
              ref={canvasRef}
              className="game-canvas"
              width={BOARD_WIDTH}
              height={BOARD_HEIGHT}
              onPointerDown={handleCanvasPointerDown}
              onPointerUp={handleCanvasPointerUp}
              aria-label="Sparkline Rush playfield"
            />

            {snapshot.screen !== "playing" ? (
              <div className="game-overlay" onPointerUp={handleOverlayPointerUp}>
                <p className="overlay-kicker">{stageName}</p>
                <h2>{overlayTitle(snapshot.screen)}</h2>
                {snapshot.screen === "gameOver" ? (
                  <div className="game-over-panel" onPointerUp={(event) => event.stopPropagation()}>
                    <p className="overlay-copy">{gameOverIsNewBest ? "Personal best run. Cash it in." : overlayCopy(snapshot.screen, snapshot.score, snapshot.bestStreak)}</p>
                    <div className="game-over-stats">
                      <Metric label="Score" value={snapshot.score.toLocaleString()} tone="aqua" />
                      <Metric label="Sparks" value={`+${snapshot.runSparks.toLocaleString()}`} tone="gold" />
                      <Metric label="Streak" value={`${snapshot.bestStreak}x`} tone="rose" />
                    </div>
                    <div className="progress-card progress-card--overlay">
                      <div>
                        <strong>Reward Chest</strong>
                        <span>+{runChestGain} progress from this run</span>
                      </div>
                      <div className="progress-track" aria-hidden="true">
                        <i style={{ width: `${chestPercent}%` }} />
                      </div>
                      <small>{profile.chestProgress}/{CHEST_GOAL}</small>
                    </div>
                    <div className="overlay-actions">
                      {snapshot.canRevive ? (
                        <button type="button" className="primary-button primary-button--hot" onClick={useRevive}>
                          Use Revive
                        </button>
                      ) : null}
                      {snapshot.canAdRevive ? (
                        <button type="button" className="secondary-button secondary-button--ad" onClick={() => watchRewardedAd("revive")}>
                          Watch Ad Revive
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="secondary-button secondary-button--ad"
                        disabled={snapshot.adDoubleClaimed || rewardedAdsRemaining <= 0}
                        onClick={() => watchRewardedAd("doubleSparks")}
                      >
                        Ad Double Sparks
                      </button>
                      <button
                        type="button"
                        className="secondary-button secondary-button--ad"
                        disabled={snapshot.adChestClaimed || rewardedAdsRemaining <= 0}
                        onClick={() => watchRewardedAd("freeChest")}
                      >
                        Ad Free Chest
                      </button>
                      <button type="button" className="primary-button" onClick={startGame}>
                        Run Again
                      </button>
                      {snapshot.score > 0 ? (
                        <button type="button" className="secondary-button" disabled={!canSubmitScore} onClick={submitScore}>
                          {submittedRun ? "Score Saved" : "Save Score"}
                        </button>
                      ) : null}
                    </div>
                    <small className="ad-note">{rewardedAdsRemaining} ad rewards left today</small>
                  </div>
                ) : (
                  <>
                    <p className="overlay-copy">{overlayCopy(snapshot.screen, snapshot.score, snapshot.bestStreak)}</p>
                    <div className="overlay-actions">
                      <button
                        type="button"
                        className="primary-button"
                        onPointerUp={(event) => event.stopPropagation()}
                        onClick={snapshot.screen === "paused" ? () => setPaused(false) : startGame}
                      >
                        {snapshot.screen === "paused" ? "Resume" : "Play"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>

          <AbilityDock abilities={abilityInventory} onUse={useAbility} />
          <RunBoostDock magnetPacks={magnetPackCount} rushBoosts={rushBoostCount} onMagnet={useMagnetPack} onRush={useRushBoost} />

          <div className="touch-controls" aria-label="Lane controls">
            <button type="button" className="control-button" aria-label="Move left" onClick={() => nudgeLane(-1)}>
              {"<"}
            </button>
            <button
              type="button"
              className="control-button control-button--pause"
              aria-label={snapshot.screen === "playing" ? "Pause run" : "Resume run"}
              onClick={() => {
                if (snapshot.screen === "ready" || snapshot.screen === "gameOver") {
                  startGame();
                  return;
                }
                setPaused(snapshot.screen === "playing");
              }}
            >
              {snapshot.screen === "playing" ? "II" : ">"}
            </button>
            <div className="status-pill">{snapshot.eventMessage || "Tap lanes. Chase sparks."}</div>
            <button type="button" className="control-button" aria-label="Move right" onClick={() => nudgeLane(1)}>
              {">"}
            </button>
          </div>

        </div>
      </section>
      ) : (
      <section className={activePanel === "home" ? "menu-screen menu-screen--home" : "menu-screen"} aria-label="Sparkline Rush menu screen">
        <div className="menu-panel">
          {activePanel === "home" ? (
            <section className="start-menu-card">
              <div className="start-logo">
                <div className="launch-orb" aria-hidden="true">
                  <BallPreview skin={selectedSkin} effects={skinEffectsEnabled} />
                  <i />
                </div>
                <p className="eyebrow">Sparkline Rush</p>
                <h1>Neon Reflex Runner</h1>
                <span>Dodge blocks. Grab sparks. Chase the next run.</span>
              </div>

              {!hasPlayerName ? (
                <div className="start-name-panel">
                  <strong>Enter your name</strong>
                  <label className="name-field">
                    <span>Score name</span>
                    <input
                      value={playerName}
                      maxLength={10}
                      onChange={(event) => setPlayerName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          savePlayerNameFromMenu();
                        }
                      }}
                      placeholder="TYPE NAME"
                      autoComplete="nickname"
                    />
                  </label>
                  <button type="button" className="primary-button" disabled={!canSavePlayerName} onClick={savePlayerNameFromMenu}>
                    Save Name
                  </button>
                </div>
              ) : (
                <div className="start-player-strip">
                  <strong>{cleanPlayerName}</strong>
                  <span>{personalBest.toLocaleString()} best</span>
                  <span>{walletSparks.toLocaleString()} sparks</span>
                  <button type="button" className="text-button" onClick={() => setHasPlayerName(false)}>
                    Edit
                  </button>
                </div>
              )}

              <div className="start-mode-row" aria-label="Game mode">
                <button type="button" className={mode === "classic" ? "mode-button mode-button--active" : "mode-button"} onClick={() => selectMode("classic")}>
                  Classic
                </button>
                <button type="button" className={mode === "daily" ? "mode-button mode-button--active" : "mode-button"} onClick={() => selectMode("daily")}>
                  Daily
                </button>
                <small>{mode === "daily" ? "Harder speed, tighter gaps, fewer safety drops, richer sparks." : "Balanced speed, safer pickups, cleaner practice runs."}</small>
              </div>

              <div className="start-menu-actions">
                <button
                  type="button"
                  className="primary-button primary-button--launch"
                  disabled={!hasPlayerName}
                  onClick={() => {
                    setActivePanel("play");
                    startGame();
                  }}
                >
                  Play
                </button>
                <button type="button" className="start-menu-button" onClick={() => setActivePanel("shop")}>
                  Shop
                </button>
                <button type="button" className="start-menu-button" onClick={() => setActivePanel("records")}>
                  Scores
                </button>
                <button type="button" className="start-menu-button" onClick={() => setActivePanel("customize")}>
                  Ball Lab
                </button>
                <button type="button" className="start-menu-button" onClick={() => setActivePanel("guide")}>
                  Guide
                </button>
              </div>
            </section>
          ) : null}

          {activePanel === "shop" ? (
            <>
              <section className="panel-card panel-card--compact">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Shop</p>
                    <h2>{walletSparks.toLocaleString()} Sparks</h2>
                  </div>
                </div>
                <div className="shop-item-grid">
                  <ShopItemCard title="Revive" count={reviveCount} cost={REVIVE_COST} detail="Appears after a crash" onBuy={buyReviveToken} />
                  <ShopItemCard title="Extra Life" count={lifeBoostCount} cost={EXTRA_LIFE_COST} detail="Auto-adds to your next run" onBuy={buyExtraLife} />
                  <ShopItemCard title="Shield" count={armorCount} cost={ARMOR_COST} detail="Auto-equips on your next run" onBuy={buyArmorPlate} />
                  <ShopItemCard title="Magnet" count={magnetPackCount} cost={MAGNET_PACK_COST} detail="Button appears during a run" onBuy={buyMagnetPack} />
                  <ShopItemCard title="2x Rush" count={rushBoostCount} cost={RUSH_BOOST_COST} detail="Button appears during a run" onBuy={buyRushBoost} />
                </div>
              </section>

              <section className="panel-card reward-ad-card">
                <div>
                  <p className="eyebrow">Rewarded Ads</p>
                  <h2>Bonus Rewards</h2>
                  <span>Mobile builds show AdMob rewards. Browser testing grants preview rewards.</span>
                </div>
                <div className="reward-ad-actions">
                  <button type="button" className="secondary-button secondary-button--ad" disabled={rewardedAdsRemaining <= 0} onClick={() => watchRewardedAd("freeChest")}>
                    Watch Ad Chest
                  </button>
                  <button type="button" className="secondary-button" disabled={!chestReady} onClick={openRewardChest}>
                    Open Earned Chest
                  </button>
                </div>
                <small>{rewardedAdsRemaining} rewarded ad claims left today</small>
              </section>

              <section className="panel-card limited-drop-panel">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Limited Drops</p>
                    <h2>Today Only</h2>
                  </div>
                  <small>{dailyLabel}</small>
                </div>
                <div className="limited-drop-grid">
                  {limitedDropSkins.map((skin) => {
                    const owned = unlockedSkins.includes(skin.id);
                    return (
                      <button
                        type="button"
                        className={previewSkinId === skin.id ? "limited-drop limited-drop--active" : "limited-drop"}
                        key={skin.id}
                        onClick={() => {
                          setPreviewSkinId(skin.id);
                          setSkinFilter("all");
                        }}
                      >
                        <BallPreview skin={skin} effects={skinEffectsEnabled} />
                        <span>
                          <strong>{skin.name}</strong>
                          <small>{owned ? "Owned" : `${skin.cost} sparks`} | {skin.vibe}</small>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <CosmeticPrizePanel
                title="Prize Cosmetics"
                trailStyles={TRAIL_STYLES}
                obstacleStyles={OBSTACLE_STYLES}
                selectedTrailId={selectedTrailStyle.id}
                selectedObstacleId={selectedObstacleStyle.id}
                unlockedTrailIds={unlockedTrails}
                unlockedObstacleIds={unlockedObstacleStyles}
                onTrailSelect={equipTrailStyle}
                onObstacleSelect={equipObstacleStyle}
              />
              <SkinStorePanel
                title="Skin Store"
                previewSkin={previewSkin}
                filteredSkins={filteredSkins}
                selectedSkinId={profile.selectedSkin}
                previewSkinId={previewSkin.id}
                unlockedSkins={unlockedSkins}
                skinFilter={skinFilter}
                walletSparks={walletSparks}
                previewUnlocked={previewUnlocked}
                previewEquipped={previewEquipped}
                previewCanBuy={previewCanBuy}
                skinEffectsEnabled={skinEffectsEnabled}
                onPreview={setPreviewSkinId}
                onFilter={setSkinFilter}
                onAction={handlePreviewSkinAction}
                onToggleSkinEffects={toggleSkinEffects}
              />
            </>
          ) : null}

          {activePanel === "records" ? (
            <section className="panel-card panel-card--records">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">High Scores</p>
                  <h2>{recordTitle}</h2>
                </div>
                <button type="button" className="text-button" onClick={clearLeaderboard}>
                  Clear Local
                </button>
              </div>
              <div className="record-tabs" aria-label="Score scope">
                {RECORD_SCOPES.map((scope) => (
                  <button
                    type="button"
                    className={recordScope === scope.id ? "record-tab record-tab--active" : "record-tab"}
                    key={scope.id}
                    onClick={() => setRecordScope(scope.id)}
                  >
                    {scope.label}
                  </button>
                ))}
              </div>
              <div className="records-grid">
                <Metric label="Best Score" value={personalBest.toLocaleString()} tone="gold" />
                <Metric label="Best Streak" value={`${bestStreakRecord}x`} tone="rose" />
                <Metric label="Total Runs" value={totalRuns.toString()} tone="aqua" />
                <Metric label="Ball Skins" value={`${ownedSkinCount}/${ALL_SKINS.length}`} tone="lime" />
              </div>
              {recordScope === "region" ? (
                <div className="sync-card">
                  <strong>{locationLabels.country} region board</strong>
                  <span>This launch version keeps regional scores on this device. We can connect online Play Games Services after store approval.</span>
                </div>
              ) : null}
              {recordScope === "personal" ? (
                <ScoreHistoryList entries={scoreHistory} />
              ) : (
                <LeaderboardList entries={recordEntries} emptyLabel={recordEmptyLabel} />
              )}
            </section>
          ) : null}

          {activePanel === "customize" ? (
            <>
              <SkinStorePanel
                title="Ball Skin"
                previewSkin={previewSkin}
                filteredSkins={filteredSkins}
                selectedSkinId={profile.selectedSkin}
                previewSkinId={previewSkin.id}
                unlockedSkins={unlockedSkins}
                skinFilter={skinFilter}
                walletSparks={walletSparks}
                previewUnlocked={previewUnlocked}
                previewEquipped={previewEquipped}
                previewCanBuy={previewCanBuy}
                skinEffectsEnabled={skinEffectsEnabled}
                onPreview={setPreviewSkinId}
                onFilter={setSkinFilter}
                onAction={handlePreviewSkinAction}
                onToggleSkinEffects={toggleSkinEffects}
              />
              <CosmeticPrizePanel
                title="Line & Block Graphics"
                trailStyles={TRAIL_STYLES}
                obstacleStyles={OBSTACLE_STYLES}
                selectedTrailId={selectedTrailStyle.id}
                selectedObstacleId={selectedObstacleStyle.id}
                unlockedTrailIds={unlockedTrails}
                unlockedObstacleIds={unlockedObstacleStyles}
                onTrailSelect={equipTrailStyle}
                onObstacleSelect={equipObstacleStyle}
              />
            </>
          ) : null}

          {activePanel === "guide" ? (
            <>
              <section className="panel-card">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Boost Guide</p>
                    <h2>Pickups</h2>
                  </div>
                </div>
                <BoostGuide />
              </section>

              <section className="panel-card reward-ad-card">
                <div>
                  <p className="eyebrow">Ads & Privacy</p>
                  <h2>Rewarded Ads</h2>
                  <span>Store releases use live AdMob IDs. Use the Privacy Options button for consent controls.</span>
                </div>
                <div className="reward-ad-actions">
                  <button type="button" className="secondary-button" onClick={openPrivacyOptions}>
                    Privacy Options
                  </button>
                </div>
              </section>

              <section className="panel-card">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Special Abilities</p>
                    <h2>Chest Powers</h2>
                  </div>
                </div>
                <div className="ability-guide">
                  {ABILITY_IDS.map((abilityId) => {
                    const ability = ABILITIES[abilityId];
                    return (
                      <div className="ability-guide-item" key={abilityId}>
                        <span style={{ borderColor: ability.color, color: ability.color }}>{ability.shortLabel}</span>
                        <div>
                          <strong>{ability.label}</strong>
                          <small>{ability.detail} | +1 token every {ABILITY_CHEST_INTERVAL} chests</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="panel-card">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Chest Schedule</p>
                    <h2>Vault Drops</h2>
                  </div>
                </div>
                <div className="ability-guide">
                  <div className="ability-guide-item">
                    <span>5th</span>
                    <div>
                      <strong>Secret Skin</strong>
                      <small>Every 5th chest unlocks one hidden ball skin and one ability token.</small>
                    </div>
                  </div>
                  <div className="ability-guide-item">
                    <span>20th</span>
                    <div>
                      <strong>Exclusive Skin</strong>
                      <small>Every 20th chest swaps the secret skin for a rare character-style vault prize.</small>
                    </div>
                  </div>
                  <div className="ability-guide-item">
                    <span>Line</span>
                    <div>
                      <strong>Trail Graphics</strong>
                      <small>Every {TRAIL_CHEST_INTERVAL} chests can unlock a new player line.</small>
                    </div>
                  </div>
                  <div className="ability-guide-item">
                    <span>Box</span>
                    <div>
                      <strong>Block Graphics</strong>
                      <small>Every {OBSTACLE_CHEST_INTERVAL} chests can unlock a new obstacle style.</small>
                    </div>
                  </div>
                </div>
              </section>

              <section className="panel-card">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Missions</p>
                    <h2>Run Goals</h2>
                  </div>
                </div>
                <div className="mission-list">
                  {snapshot.missionProgress.map((mission) => (
                    <div className={mission.complete ? "mission mission--done" : "mission"} key={mission.id}>
                      <div>
                        <strong>{mission.label}</strong>
                        <span>{Math.min(mission.value, mission.goal)} / {mission.goal}</span>
                      </div>
                      <small>+{mission.reward}</small>
                    </div>
                  ))}
                </div>
              </section>

              <section className="panel-card">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Achievements</p>
                    <h2>{unlockedAchievementCount}/{ACHIEVEMENTS.length} Unlocked</h2>
                  </div>
                </div>
                <div className="achievement-list">
                  {ACHIEVEMENTS.map((achievement) => {
                    const unlocked = unlockedAchievementIds.includes(achievement.id);
                    const value = Math.min(achievement.value(gameRef.current, profile), achievement.goal);
                    return (
                      <div className={unlocked ? "achievement achievement--done" : "achievement"} key={achievement.id}>
                        <div>
                          <strong>{achievement.title}</strong>
                          <span>{achievement.detail}</span>
                          <small>{achievement.metric}: {Math.floor(value)}/{achievement.goal}</small>
                        </div>
                        <em>{unlocked ? "Done" : `+${achievement.reward}`}</em>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          ) : null}
        </div>
      </section>
      )}
      </section>
      {chestReveal ? <ChestRevealModal reveal={chestReveal} onClose={() => setChestReveal(null)} onChoose={claimMothersDaySkin} /> : null}
    </main>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "aqua" | "rose" | "lime" | "amber" | "gold" }) {
  return (
    <div className={`metric metric--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ShopItemCard({
  title,
  count,
  cost,
  detail,
  onBuy,
  onUse
}: {
  title: string;
  count: number;
  cost: number;
  detail: string;
  onBuy: () => void;
  onUse?: () => void;
}) {
  return (
    <article className="shop-card">
      <div>
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
      <small>{count} owned</small>
      <div className="shop-card-actions">
        <button type="button" className="text-button" onClick={onBuy}>
          Buy {cost}
        </button>
        {onUse ? (
          <button type="button" className="text-button text-button--hot" onClick={onUse}>
            Use
          </button>
        ) : null}
      </div>
    </article>
  );
}

function ChestRevealModal({ reveal, onClose, onChoose }: { reveal: ChestReveal; onClose: () => void; onChoose?: (skinId: SkinId) => void }) {
  const topItem = reveal.items.find((item) => item.tier === "exclusive" || item.tier === "secret" || item.tier === "jackpot") ?? reveal.items[0];
  const [selectedChoiceId, setSelectedChoiceId] = useState<SkinId>(reveal.choices?.[0]?.id ?? "");
  const selectedChoice = reveal.choices?.find((skin) => skin.id === selectedChoiceId) ?? reveal.choices?.[0];
  const collectLabel = reveal.choices?.length ? reveal.choiceCta ?? "Claim Skin" : "Collect Loot";

  function collectReveal() {
    if (reveal.choices?.length && selectedChoice && onChoose) {
      onChoose(selectedChoice.id);
      return;
    }
    onClose();
  }

  return (
    <div className="chest-reveal-backdrop" role="dialog" aria-modal="true" aria-label={reveal.title}>
      <div className={reveal.premium ? "chest-reveal chest-reveal--premium" : "chest-reveal"}>
        <div className="firework-field" aria-hidden="true">
          {Array.from({ length: 10 }, (_, index) => (
            <i
              key={index}
              style={
                {
                  "--firework-index": index,
                  "--firework-x": `${16 + (index % 5) * 17}%`,
                  "--firework-y": `${12 + (index % 3) * 18}%`,
                  "--firework-delay": `${index * 130}ms`,
                  "--firework-color": reveal.items[index % reveal.items.length]?.color ?? "#ffd166"
                } as CSSProperties
              }
            />
          ))}
        </div>
        <div className="confetti-burst" aria-hidden="true">
          {Array.from({ length: 44 }, (_, index) => (
            <i
              key={index}
              style={
                {
                  "--confetti-index": index,
                  "--confetti-start-x": `${(index - 22) * 5}px`,
                  "--confetti-end-x": `${(index - 22) * 8}px`,
                  "--confetti-end-y": `${95 + (index % 4) * 16}px`,
                  "--confetti-delay": `${index * 32}ms`,
                  "--confetti-rotate": `${index * 17}deg`,
                  "--confetti-end-rotate": `${index * 43}deg`,
                  "--confetti-color": reveal.items[index % reveal.items.length]?.color ?? "#ffd166"
                } as CSSProperties
              }
            />
          ))}
        </div>
        <div className="sparkle-ring" aria-hidden="true" />
        <div className="chest-reveal-top">
          <span className="chest-orb" style={{ "--orb-color": topItem?.color ?? "#ffd166" } as CSSProperties}>
            <i />
          </span>
          <p className="eyebrow">{reveal.counterLabel ?? `${reveal.source} #${reveal.opened}`}</p>
          <h2>{reveal.title}</h2>
          <strong>{reveal.kicker}</strong>
        </div>
        <div className="chest-prize-list">
          {reveal.items.map((item, index) => (
            <article className={`chest-prize chest-prize--${item.tier}`} key={`${item.label}-${index}`} style={{ "--prize-color": item.color } as CSSProperties}>
              <span aria-hidden="true">
                <i />
              </span>
              <div>
                <strong>{item.label}</strong>
                <small>{item.detail}</small>
              </div>
            </article>
          ))}
        </div>
        {reveal.choices?.length ? (
          <div className="chest-choice-panel">
            <strong>{reveal.choiceTitle ?? "Choose your reward"}</strong>
            <div className="chest-choice-grid">
              {reveal.choices.map((skin) => (
                <button
                  type="button"
                  className={selectedChoice?.id === skin.id ? "chest-choice chest-choice--selected" : "chest-choice"}
                  key={skin.id}
                  onClick={() => setSelectedChoiceId(skin.id)}
                >
                  <BallPreview skin={skin} effects />
                  <span>
                    <strong>{skin.name}</strong>
                    <small>{skin.vibe}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <button type="button" className="primary-button primary-button--hot" onClick={collectReveal} disabled={Boolean(reveal.choices?.length) && !selectedChoice}>
          {collectLabel}
        </button>
      </div>
    </div>
  );
}

function BoostGuide() {
  const guideItems: PickupKind[] = ["spark", "life", "magnet", "slow", "ghost", "double"];
  return (
    <div className="boost-guide">
      {guideItems.map((kind) => {
        const info = pickupInfo(kind);
        return (
          <div className="boost-guide-item" key={kind}>
            <span className="boost-icon" style={{ borderColor: info.color, color: info.color, boxShadow: `0 0 14px ${info.color}44` }}>
              {info.shortLabel}
            </span>
            <div>
              <strong>{info.label}</strong>
              <small>{info.effect}</small>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CosmeticPrizePanel({
  title,
  trailStyles,
  obstacleStyles,
  selectedTrailId,
  selectedObstacleId,
  unlockedTrailIds,
  unlockedObstacleIds,
  onTrailSelect,
  onObstacleSelect
}: {
  title: string;
  trailStyles: TrailStyle[];
  obstacleStyles: ObstacleStyle[];
  selectedTrailId: TrailStyleId;
  selectedObstacleId: ObstacleStyleId;
  unlockedTrailIds: TrailStyleId[];
  unlockedObstacleIds: ObstacleStyleId[];
  onTrailSelect: (id: TrailStyleId) => void;
  onObstacleSelect: (id: ObstacleStyleId) => void;
}) {
  return (
    <section className="panel-card cosmetic-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{title}</p>
          <h2>Chest Prize Graphics</h2>
        </div>
        <small>{unlockedTrailIds.length}/{trailStyles.length} lines | {unlockedObstacleIds.length}/{obstacleStyles.length} boxes</small>
      </div>
      <div className="cosmetic-columns">
        <CosmeticStyleList
          title="Player Line"
          kind="trail"
          styles={trailStyles}
          selectedId={selectedTrailId}
          unlockedIds={unlockedTrailIds}
          onSelect={onTrailSelect}
        />
        <CosmeticStyleList
          title="Dodge Boxes"
          kind="obstacle"
          styles={obstacleStyles}
          selectedId={selectedObstacleId}
          unlockedIds={unlockedObstacleIds}
          onSelect={onObstacleSelect}
        />
      </div>
    </section>
  );
}

function CosmeticStyleList<TStyle extends { id: string; name: string; vibe: string; primary: string; secondary: string; glow: string; pattern: string }>({
  title,
  kind,
  styles,
  selectedId,
  unlockedIds,
  onSelect
}: {
  title: string;
  kind: "trail" | "obstacle";
  styles: TStyle[];
  selectedId: string;
  unlockedIds: string[];
  onSelect: (id: string) => void;
}) {
  const visibleStyles = styles.filter((style) => unlockedIds.includes(style.id));
  const lockedCount = Math.max(0, styles.length - visibleStyles.length);

  return (
    <div className="cosmetic-list">
      <div className="cosmetic-list-heading">
        <strong>{title}</strong>
        <span>{lockedCount} locked</span>
      </div>
      <div className="cosmetic-style-grid">
        {visibleStyles.map((style) => {
          const selected = selectedId === style.id;
          return (
            <button
              type="button"
              className={selected ? "cosmetic-style cosmetic-style--selected" : "cosmetic-style"}
              key={style.id}
              onClick={() => onSelect(style.id)}
            >
              <CosmeticPreview kind={kind} style={style} />
              <span>
                <strong>{style.name}</strong>
                <small>{selected ? "Equipped" : style.vibe}</small>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CosmeticPreview({ kind, style }: { kind: "trail" | "obstacle"; style: { primary: string; secondary: string; glow: string; pattern: string } }) {
  return (
    <span
      className={`cosmetic-preview cosmetic-preview--${kind} cosmetic-preview--${style.pattern}`}
      style={{
        "--cosmetic-primary": style.primary,
        "--cosmetic-secondary": style.secondary,
        "--cosmetic-glow": style.glow
      } as CSSProperties}
      aria-hidden="true"
    >
      <i />
      <b />
    </span>
  );
}

function SkinStorePanel({
  title,
  previewSkin,
  filteredSkins,
  selectedSkinId,
  previewSkinId,
  unlockedSkins,
  skinFilter,
  walletSparks,
  previewUnlocked,
  previewEquipped,
  previewCanBuy,
  skinEffectsEnabled,
  onPreview,
  onFilter,
  onAction,
  onToggleSkinEffects
}: {
  title: string;
  previewSkin: Skin;
  filteredSkins: Skin[];
  selectedSkinId: SkinId;
  previewSkinId: SkinId;
  unlockedSkins: SkinId[];
  skinFilter: SkinFilter;
  walletSparks: number;
  previewUnlocked: boolean;
  previewEquipped: boolean;
  previewCanBuy: boolean;
  skinEffectsEnabled: boolean;
  onPreview: (id: SkinId) => void;
  onFilter: (filter: SkinFilter) => void;
  onAction: () => void;
  onToggleSkinEffects: () => void;
}) {
  const actionText = previewEquipped
    ? "Equipped"
    : previewUnlocked
      ? "Equip"
      : previewCanBuy
        ? `Buy ${previewSkin.cost}`
        : `Need ${previewSkin.cost - walletSparks}`;

  return (
    <section className="panel-card panel-card--lab">
      <div className="skin-showcase">
        <BallPreview skin={previewSkin} effects={skinEffectsEnabled} />
        <div>
          <p className="eyebrow">{title}</p>
          <h2>{previewSkin.name}</h2>
          <span>{previewSkin.vibe}</span>
          <small>{previewSkin.effect ? `${skinEffectsEnabled ? "Effects on" : "Effects off"} | ${effectLabel(previewSkin.effect)}` : "Skin name, not player name"}</small>
        </div>
        <button
          type="button"
          className={previewCanBuy || previewUnlocked ? "primary-button" : "secondary-button"}
          disabled={previewEquipped || (!previewUnlocked && !previewCanBuy)}
          onClick={onAction}
        >
          {actionText}
        </button>
      </div>
      <button type="button" className={skinEffectsEnabled ? "effect-toggle effect-toggle--on" : "effect-toggle"} onClick={onToggleSkinEffects}>
        <span aria-hidden="true">
          <i />
        </span>
        <strong>Skin Effects</strong>
        <small>{skinEffectsEnabled ? "On" : "Off"}</small>
      </button>
      <div className="skin-filter-bar" aria-label="Ball skin filters">
        {SKIN_FILTERS.map((filter) => (
          <button
            type="button"
            className={skinFilter === filter.id ? "skin-filter skin-filter--active" : "skin-filter"}
            key={filter.id}
            onClick={() => onFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <div className="skin-grid skin-grid--lab">
        {filteredSkins.map((skin) => {
          const unlocked = unlockedSkins.includes(skin.id);
          const selected = selectedSkinId === skin.id;
          const previewing = previewSkinId === skin.id;
          return (
            <button
              type="button"
              className={[
                "skin-button",
                unlocked ? "skin-button--owned" : "",
                selected ? "skin-button--selected" : "",
                previewing ? "skin-button--preview" : ""
              ].filter(Boolean).join(" ")}
              key={skin.id}
              onClick={() => onPreview(skin.id)}
            >
              <span className="skin-swatch" style={{ background: `linear-gradient(135deg, ${skin.core}, ${skin.accent})` }} />
              <strong>{skin.name}</strong>
              <small>{selected ? "Equipped" : unlocked ? "Owned" : `${skin.cost} sparks`}</small>
              <em>{skin.vibe}</em>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ScoreHistoryList({ entries }: { entries: ScoreHistoryEntry[] }) {
  return (
    <ol className="score-history-list">
      {entries.length > 0 ? (
        entries.slice(0, 5).map((entry, index) => (
          <li key={`${entry.date}-${entry.score}-${index}`}>
            <span className="rank">{index + 1}</span>
            <span className="leader-name">{entry.score.toLocaleString()}</span>
            <strong>{getSkin(entry.skinId).name}</strong>
            <small>
              {formatEntryDate(entry.date)} | {entry.streak}x | +{entry.sparks}
            </small>
          </li>
        ))
      ) : (
        <li className="empty-row">
          <span className="rank">1</span>
          <span className="leader-name">First run waiting</span>
          <strong>0</strong>
          <small>Records save automatically</small>
        </li>
      )}
    </ol>
  );
}

function BallPreview({ skin, effects = false }: { skin: Skin; effects?: boolean }) {
  const effectNodes =
    effects && skin.effect
      ? Array.from({ length: 6 }, (_, index) => {
          const angle = (Math.PI * 2 * index) / 6;
          const radius = 29 + (index % 2) * 5;
          return (
            <b
              key={index}
              style={
                {
                  "--effect-x": `${Math.cos(angle) * radius}px`,
                  "--effect-y": `${Math.sin(angle) * radius}px`,
                  "--effect-delay": `${index * 140}ms`,
                  "--effect-color": index % 2 === 0 ? skin.accent : skin.glow
                } as CSSProperties
              }
            />
          );
        })
      : null;
  return (
    <div
      className={[
        "ball-preview",
        `ball-preview--${skin.pattern}`,
        effects && skin.effect ? "ball-preview--effects" : "",
        effects && skin.effect ? `ball-preview--effect-${skin.effect}` : ""
      ].filter(Boolean).join(" ")}
      aria-hidden="true"
      style={{
        background: `radial-gradient(circle at 35% 28%, #ffffff 0 10%, ${skin.core} 32%, ${skin.accent} 72%, #0f172a 100%)`,
        boxShadow: `0 0 24px ${skin.glow}`
      }}
    >
      <span style={{ background: skin.accent }} />
      <i style={{ borderColor: skin.accent }} />
      {effectNodes ? <em>{effectNodes}</em> : null}
    </div>
  );
}

function LifeTracker({ lives, maxLives, armor, maxArmor }: { lives: number; maxLives: number; armor: number; maxArmor: number }) {
  return (
    <div className="life-tracker" aria-label={`${lives} hit${lives === 1 ? "" : "s"} left and ${armor} shield`}>
      <div className="life-meter" aria-hidden="true">
        <span className="life-label">Hearts</span>
        <div className="heart-row">
          {Array.from({ length: maxLives }, (_, index) => (
            <span
              key={index}
              className={`heart ${index < lives ? "heart--full" : "heart--empty"}`}
            />
          ))}
        </div>
        <span className="life-count">{lives}/{maxLives}</span>
      </div>
      <div className="armor-meter" aria-hidden="true">
        <span className="armor-label">{armor > 0 ? `Shield ${armor}/${maxArmor}` : "Shield 0"}</span>
        <div className="armor-row">
          {Array.from({ length: maxArmor }, (_, index) => (
            <span key={index} className={index < armor ? "armor-dot armor-dot--full" : "armor-dot"} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PowerupBar({ powerups }: { powerups: ActivePowerups }) {
  const active = Object.entries(powerups).filter(([, seconds]) => seconds > 0);
  if (active.length === 0) {
    return null;
  }

  return (
    <div className="powerup-bar">
      {active.map(([name, seconds]) => {
        const info = pickupInfo(name as PickupKind);
        return (
          <span key={name}>
            <strong>{info.label}</strong>
            <small>{info.effect} | {Math.ceil(seconds)}s</small>
          </span>
        );
      })}
    </div>
  );
}

function AbilityDock({ abilities, onUse }: { abilities: AbilityInventory; onUse: (abilityId: AbilityId) => void }) {
  const total = totalAbilityCount(abilities);
  if (total <= 0) {
    return null;
  }

  return (
    <div className="ability-dock" aria-label="Special abilities">
      {ABILITY_IDS.map((abilityId) => {
        const ability = ABILITIES[abilityId];
        const count = abilities[abilityId] ?? 0;
        return (
          <button
            type="button"
            className={count > 0 ? "ability-button" : "ability-button ability-button--empty"}
            key={abilityId}
            disabled={count <= 0}
            onClick={() => onUse(abilityId)}
            style={{ borderColor: `${ability.color}66` }}
          >
            <strong>{ability.shortLabel}</strong>
            <span>{count}</span>
          </button>
        );
      })}
    </div>
  );
}

function RunBoostDock({
  magnetPacks,
  rushBoosts,
  onMagnet,
  onRush
}: {
  magnetPacks: number;
  rushBoosts: number;
  onMagnet: () => void;
  onRush: () => void;
}) {
  if (magnetPacks <= 0 && rushBoosts <= 0) {
    return null;
  }

  return (
    <div className="run-boost-dock" aria-label="Purchased run boosts">
      {magnetPacks > 0 ? (
        <button type="button" className="run-boost-button" onClick={onMagnet}>
          Magnet <span>{magnetPacks}</span>
        </button>
      ) : null}
      {rushBoosts > 0 ? (
        <button type="button" className="run-boost-button run-boost-button--rush" onClick={onRush}>
          2x <span>{rushBoosts}</span>
        </button>
      ) : null}
    </div>
  );
}

function LeaderboardList({ entries, emptyLabel = "First run waiting" }: { entries: LeaderboardEntry[]; emptyLabel?: string }) {
  return (
    <ol className="leaderboard-list">
      {entries.length > 0 ? (
        entries.map((entry, index) => (
          <li key={`${entry.name}-${entry.score}-${entry.date}`}>
            <span className="rank">{index + 1}</span>
            <span className="leader-name">{entry.name}</span>
            <strong>{entry.score.toLocaleString()}</strong>
            <small>{formatEntryDate(entry.date)} | {entry.streak}x</small>
          </li>
        ))
      ) : (
        <li className="empty-row">
          <span className="rank">1</span>
          <span className="leader-name">YOU</span>
          <strong>0</strong>
          <small>{emptyLabel}</small>
        </li>
      )}
    </ol>
  );
}

function createGameState(best: number, mode: GameMode, profile: Profile): GameState {
  const centerLane = Math.floor(LANES / 2);
  const seed = mode === "daily" ? seedFromString(dailyKey()) : Date.now();
  return {
    screen: "ready",
    mode,
    lane: centerLane,
    targetLane: centerLane,
    playerX: laneCenter(centerLane),
    obstacles: [],
    pickups: [],
    particles: createAmbientParticles(),
    score: 0,
    best,
    combo: 0,
    bestStreak: 0,
    lives: MAX_LIVES,
    maxLives: MAX_LIVES,
    armor: 0,
    speed: 170,
    elapsed: 0,
    spawnTimer: mode === "daily" ? 0.5 : 0.75,
    pickupTimer: mode === "daily" ? 1.55 : 1.2,
    idCounter: 1,
    lastTime: performance.now(),
    finalHandled: false,
    pulse: 0,
    hitFlash: 0,
    armorGrace: 0,
    shake: 0,
    runSparks: 0,
    bankedSparks: profile.sparks,
    dodges: 0,
    nearMisses: 0,
    eventMessage: mode === "daily" ? "Daily hard lane" : "Ready",
    eventTtl: 1.4,
    missionClaims: [],
    activePowerups: { magnet: 0, slow: 0, ghost: 0, double: 0 },
    skinId: profile.selectedSkin,
    skinEffects: profile.skinEffects,
    trailStyleId: profile.selectedTrail,
    obstacleStyleId: profile.selectedObstacleStyle,
    muted: profile.muted,
    revived: false,
    adDoubleClaimed: false,
    adChestClaimed: false,
    adReviveUsed: false,
    random: createRng(seed)
  };
}

function snapshotFromState(game: GameState, profile: Profile): GameSnapshot {
  return {
    screen: game.screen,
    mode: game.mode,
    score: Math.floor(game.score),
    best: Math.max(game.best, Math.floor(game.score)),
    combo: game.combo,
    bestStreak: game.bestStreak,
    lives: game.lives,
    maxLives: game.maxLives,
    armor: game.armor,
    speed: game.speed,
    elapsed: game.elapsed,
    level: Math.max(1, Math.floor(game.elapsed / 14) + 1),
    runSparks: game.runSparks,
    bankedSparks: game.bankedSparks,
    dodges: game.dodges,
    nearMisses: game.nearMisses,
    eventMessage: game.eventMessage,
    missionProgress: missionProgress(game),
    activePowerups: game.activePowerups,
    canRevive: game.screen === "gameOver" && !game.revived && profile.reviveTokens > 0,
    canAdRevive: game.screen === "gameOver" && !game.revived && !game.adReviveUsed && remainingRewardedAds(profile) > 0,
    adDoubleClaimed: game.adDoubleClaimed,
    adChestClaimed: game.adChestClaimed
  };
}

function updateGame(game: GameState) {
  if (game.eventTtl <= 0) {
    game.eventMessage = "";
  }
}

function advanceGame(game: GameState, dt: number) {
  game.elapsed += dt;
  game.pulse = Math.max(0, game.pulse - dt * 4);
  game.hitFlash = Math.max(0, game.hitFlash - dt * 2.8);
  game.armorGrace = Math.max(0, game.armorGrace - dt);
  game.shake = Math.max(0, game.shake - dt * 4.5);
  game.eventTtl = Math.max(0, game.eventTtl - dt);

  for (const key of Object.keys(game.activePowerups) as Array<keyof ActivePowerups>) {
    game.activePowerups[key] = Math.max(0, game.activePowerups[key] - dt);
  }

  const ramp = Math.max(0, game.elapsed - 7);
  const speedMultiplier = game.mode === "daily" ? 1.18 : 1;
  const speedCap = game.mode === "daily" ? 650 : 560;
  game.speed = Math.min(speedCap, (170 + ramp * 10.8 + game.score * 0.018) * speedMultiplier);
  const effectiveSpeed = game.speed * (game.activePowerups.slow > 0 ? 0.58 : 1);
  const scoreRate = 24 + game.speed * 0.09 + game.combo * 0.45;
  const modeScoreMultiplier = game.mode === "daily" ? 1.12 : 1;
  game.score += dt * scoreRate * modeScoreMultiplier * (game.activePowerups.double > 0 ? 2 : 1);

  const targetX = laneCenter(game.targetLane);
  game.playerX += (targetX - game.playerX) * Math.min(1, dt * 18);
  if (Math.abs(game.playerX - targetX) < 1) {
    game.lane = game.targetLane;
  }

  game.spawnTimer -= dt;
  if (game.spawnTimer <= 0) {
    spawnObstacle(game);
    game.spawnTimer = nextObstacleDelay(game.elapsed, game.random, game.mode);
  }

  game.pickupTimer -= dt;
  if (game.pickupTimer <= 0) {
    spawnPickup(game);
    game.pickupTimer = game.mode === "daily" ? 1.9 + game.random() * 1.25 : 1.55 + game.random() * 1.15;
  }

  for (const obstacle of game.obstacles) {
    obstacle.y += effectiveSpeed * dt;
    if (!obstacle.passed && obstacle.y > PLAYER_Y + 34) {
      obstacle.passed = true;
      game.combo += 1;
      game.dodges += 1;
      game.bestStreak = Math.max(game.bestStreak, game.combo);
      game.score += (18 + game.combo * 3) * (game.activePowerups.double > 0 ? 2 : 1);

      if (Math.abs(obstacle.lane - game.targetLane) === 1 && !obstacle.nearMissAwarded) {
        obstacle.nearMissAwarded = true;
        game.nearMisses += 1;
        game.score += 45;
        game.eventMessage = "Near miss +45";
        game.eventTtl = 0.9;
        burst(game, laneCenter(obstacle.lane), PLAYER_Y - 20, "#ffcf5a", 8);
        playSound("near", game.muted);
      } else {
        burst(game, laneCenter(obstacle.lane), PLAYER_Y - 18, "#7df2dd", 5);
      }
    }
  }

  for (const pickup of game.pickups) {
    pickup.y += effectiveSpeed * dt * 0.94;
    if (game.activePowerups.magnet > 0 && pickup.kind === "spark") {
      const dx = game.playerX - laneCenter(pickup.lane);
      pickup.y += Math.sign(PLAYER_Y - pickup.y) * 90 * dt;
      if (Math.abs(dx) < 120 && Math.abs(pickup.y - PLAYER_Y) < 120) {
        pickup.lane = game.targetLane;
      }
    }

    if (!pickup.taken && pickup.lane === game.targetLane && Math.abs(pickup.y - PLAYER_Y) < 34) {
      collectPickup(game, pickup);
    }
  }

  game.obstacles = game.obstacles.filter((obstacle) => obstacle.y < BOARD_HEIGHT + 90 && !obstacle.hit);
  game.pickups = game.pickups.filter((pickup) => pickup.y < BOARD_HEIGHT + 60 && !pickup.taken);
  updateParticles(game, dt);
  updateMissionRewards(game);

  const crash = game.obstacles.find(
    (obstacle) =>
      !obstacle.hit &&
      obstacle.lane === game.targetLane &&
      Math.abs(obstacle.y - PLAYER_Y) < obstacle.height * 0.78
  );

  if (!crash || game.activePowerups.ghost > 0) {
    return;
  }

  crash.hit = true;
  if (game.armorGrace > 0) {
    game.score += 20;
    burst(game, game.playerX, PLAYER_Y, "#67e8f9", 8);
    return;
  }

  if (game.armor > 0) {
    game.armor = Math.max(0, game.armor - 1);
    game.armorGrace = 0.75;
    for (const obstacle of game.obstacles) {
      if (obstacle.lane === game.targetLane && Math.abs(obstacle.y - PLAYER_Y) < obstacle.height * 1.15) {
        obstacle.hit = true;
      }
    }
    game.combo = 0;
    game.score += 55;
    game.hitFlash = 0.65;
    game.shake = 0.55;
    game.eventMessage = game.armor > 0 ? `Shield blocked - ${game.armor} left` : "Shield blocked - hearts safe";
    game.eventTtl = 1.2;
    burst(game, game.playerX, PLAYER_Y, "#67e8f9", 22);
    vibrate(20);
    playSound("hit", game.muted);
    return;
  }

  game.lives = Math.max(0, game.lives - 1);
  game.combo = 0;
  game.score += 35;
  game.hitFlash = 1;
  game.shake = 1;
  game.eventMessage = game.lives > 0 ? `${game.lives} hit${game.lives === 1 ? "" : "s"} left` : "Run crashed";
  game.eventTtl = 1.2;
  burst(game, game.playerX, PLAYER_Y, game.lives > 0 ? "#b6ff69" : "#ff4f87", 24);
  vibrate(game.lives > 0 ? 30 : 100);
  playSound(game.lives > 0 ? "hit" : "crash", game.muted);

  if (game.lives <= 0) {
    game.screen = "gameOver";
  }
}

function collectPickup(game: GameState, pickup: Pickup) {
  pickup.taken = true;

  if (pickup.kind === "spark") {
    const baseAmount = game.mode === "daily" ? 2 : 1;
    const amount = baseAmount * (game.activePowerups.double > 0 ? 2 : 1);
    game.runSparks += amount;
    game.bankedSparks += amount;
    game.score += 70 + game.combo * 4;
    game.eventMessage = `Spark +${amount}`;
    game.eventTtl = 0.7;
    burst(game, laneCenter(pickup.lane), pickup.y, "#ffcf5a", 10);
    playSound("spark", game.muted);
    return;
  }

  if (pickup.kind === "life") {
    game.lives = Math.min(game.maxLives, game.lives + 1);
    game.score += 90;
    game.eventMessage = "Life restored";
    game.eventTtl = 1;
    burst(game, laneCenter(pickup.lane), pickup.y, "#b6ff69", 12);
    playSound("power", game.muted);
    return;
  }

  const pickupDuration = pickup.kind === "slow" ? 5 : 6;
  game.activePowerups[pickup.kind] = game.mode === "daily" ? Math.max(3.5, pickupDuration * 0.75) : pickupDuration;
  game.score += 85;
  game.eventMessage = `${labelPowerup(pickup.kind)} active`;
  game.eventTtl = 1.2;
  burst(game, laneCenter(pickup.lane), pickup.y, colorForPickup(pickup.kind), 14);
  playSound("power", game.muted);
}

function updateIdleGame(game: GameState, dt: number) {
  game.elapsed += dt * 0.2;
  game.pulse = (game.pulse + dt * 0.75) % 1;
  game.eventTtl = Math.max(0, game.eventTtl - dt);
  if (game.eventTtl <= 0 && game.screen === "ready") {
    game.eventMessage = "Tap anywhere to start";
  }
  updateParticles(game, dt);
}

function spawnObstacle(game: GameState) {
  const recentLanes = game.obstacles
    .filter((obstacle) => obstacle.y < 150)
    .map((obstacle) => obstacle.lane);
  const lanePool = Array.from({ length: LANES }, (_, lane) => lane).filter((lane) => !recentLanes.includes(lane));
  const lane = lanePool.length > 0 ? lanePool[Math.floor(game.random() * lanePool.length)] : Math.floor(game.random() * LANES);
  const isDaily = game.mode === "daily";

  game.obstacles.push({
    id: game.idCounter++,
    lane,
    y: isDaily ? -46 : -38,
    width: (isDaily ? 56 : 48) + game.random() * (isDaily ? 22 : 18),
    height: (isDaily ? 42 : 34) + game.random() * (isDaily ? 20 : 16),
    passed: false,
    phase: game.random() * Math.PI * 2,
    hit: false,
    nearMissAwarded: false
  });
}

function spawnPickup(game: GameState) {
  const roll = game.random();
  let kind: PickupKind = "spark";
  const lifeThreshold = game.mode === "daily" ? 0.975 : 0.95;
  const powerThreshold = game.mode === "daily" ? 0.91 : 0.86;
  if (roll > lifeThreshold) {
    kind = "life";
  } else if (roll > powerThreshold) {
    const powerups: PickupKind[] = ["magnet", "slow", "ghost", "double"];
    kind = powerups[Math.floor(game.random() * powerups.length)];
  }

  game.pickups.push({
    id: game.idCounter++,
    lane: Math.floor(game.random() * LANES),
    y: -28,
    kind,
    taken: false,
    phase: game.random() * Math.PI * 2
  });
}

function nextObstacleDelay(elapsed: number, random: () => number, mode: GameMode) {
  const modeFactor = mode === "daily" ? 0.76 : 1;
  const minimumDelay = mode === "daily" ? 0.22 : 0.3;
  if (elapsed < 10) {
    return (0.92 + random() * 0.22) * modeFactor;
  }
  return Math.max(minimumDelay, (0.98 - elapsed * 0.014 + random() * 0.18) * modeFactor);
}

function updateMissionRewards(game: GameState) {
  for (const mission of MISSIONS) {
    if (game.missionClaims.includes(mission.id)) {
      continue;
    }
    const value = missionValue(game, mission.kind);
    if (value >= mission.goal) {
      game.missionClaims.push(mission.id);
      game.bankedSparks += mission.reward;
      game.eventMessage = `Mission +${mission.reward}`;
      game.eventTtl = 1.5;
      burst(game, game.playerX, PLAYER_Y - 70, "#ffd166", 18);
      playSound("power", game.muted);
    }
  }
}

function missionProgress(game: GameState): MissionProgress[] {
  return MISSIONS.map((mission) => {
    const value = missionValue(game, mission.kind);
    return {
      ...mission,
      value: Math.floor(value),
      complete: value >= mission.goal,
      claimed: game.missionClaims.includes(mission.id)
    };
  });
}

function missionValue(game: GameState, kind: MissionKind) {
  if (kind === "sparks") {
    return game.runSparks;
  }
  if (kind === "dodges") {
    return game.dodges;
  }
  if (kind === "nearMisses") {
    return game.nearMisses;
  }
  return game.elapsed;
}

function updateParticles(game: GameState, dt: number) {
  for (const particle of game.particles) {
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 12 * dt;
  }

  game.particles = game.particles.filter((particle) => particle.life > 0 && particle.y < BOARD_HEIGHT + 24);
  while (game.particles.length < 34) {
    game.particles.push(createParticle(Math.random() * BOARD_WIDTH, Math.random() * BOARD_HEIGHT, true));
  }
}

function createAmbientParticles() {
  return Array.from({ length: 38 }, () => createParticle(Math.random() * BOARD_WIDTH, Math.random() * BOARD_HEIGHT, true));
}

function createParticle(x: number, y: number, ambient = false): Particle {
  const maxLife = ambient ? 1.4 + Math.random() * 2.4 : 0.5 + Math.random() * 0.35;
  return {
    id: Math.floor(Math.random() * 1_000_000_000),
    x,
    y,
    vx: ambient ? -10 + Math.random() * 20 : -140 + Math.random() * 280,
    vy: ambient ? 28 + Math.random() * 60 : -220 + Math.random() * 180,
    life: maxLife,
    maxLife,
    size: ambient ? 1 + Math.random() * 2 : 2 + Math.random() * 4,
    color: ambient ? (Math.random() > 0.5 ? "#5eead4" : "#ffcf5a") : "#ffffff"
  };
}

function burst(game: GameState, x: number, y: number, color: string, amount: number) {
  for (let index = 0; index < amount; index += 1) {
    const particle = createParticle(x, y);
    particle.color = color;
    particle.size = 2 + Math.random() * 5;
    game.particles.push(particle);
  }
}

function drawGame(context: CanvasRenderingContext2D, game: GameState, now: number) {
  context.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
  context.save();
  if (game.shake > 0) {
    context.translate((Math.random() - 0.5) * game.shake * 10, (Math.random() - 0.5) * game.shake * 10);
  }
  drawBackground(context, game, now);
  drawLanes(context, game);
  drawPickups(context, game, now);
  drawObstacles(context, game, now);
  drawPlayer(context, game, now);
  drawParticles(context, game);
  drawVignette(context);
  context.restore();

  if (game.hitFlash > 0) {
    context.fillStyle = `rgba(255, 79, 135, ${game.hitFlash * 0.24})`;
    context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
  }
}

function drawBackground(context: CanvasRenderingContext2D, game: GameState, now: number) {
  const gradient = context.createLinearGradient(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
  gradient.addColorStop(0, "#0a1016");
  gradient.addColorStop(0.48, "#160f24");
  gradient.addColorStop(1, "#07140f");
  context.fillStyle = gradient;
  context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

  const sweepY = ((now * 0.045 + game.elapsed * 60) % (BOARD_HEIGHT + 200)) - 160;
  const sweep = context.createRadialGradient(BOARD_WIDTH * 0.52, sweepY, 20, BOARD_WIDTH * 0.52, sweepY, 250);
  sweep.addColorStop(0, "rgba(125, 242, 221, 0.20)");
  sweep.addColorStop(0.55, "rgba(255, 79, 135, 0.07)");
  sweep.addColorStop(1, "rgba(255, 207, 90, 0)");
  context.fillStyle = sweep;
  context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);

  context.save();
  context.globalAlpha = 0.28;
  context.strokeStyle = "#263545";
  context.lineWidth = 1;
  const offset = (game.elapsed * game.speed * 0.38) % 48;
  for (let y = -48 + offset; y < BOARD_HEIGHT + 60; y += 48) {
    context.beginPath();
    context.moveTo(12, y);
    context.lineTo(BOARD_WIDTH - 12, y + 18);
    context.stroke();
  }
  context.restore();
}

function drawLanes(context: CanvasRenderingContext2D, game: GameState) {
  const skin = getSkin(game.skinId);
  const trailStyle = getTrailStyle(game.trailStyleId);
  for (let lane = 0; lane < LANES; lane += 1) {
    const x = laneCenter(lane);
    const active = lane === game.targetLane;
    context.save();
    context.globalAlpha = active ? 0.95 : 0.28;
    context.strokeStyle = active ? trailStyle.glow : "#48606c";
    context.lineWidth = active ? 3 : 1;
    context.shadowColor = active ? skin.glow : "transparent";
    context.shadowBlur = active ? 18 : 0;
    context.beginPath();
    context.moveTo(x, 18);
    context.bezierCurveTo(x - 16, 190, x + 18, 470, x, BOARD_HEIGHT - 26);
    context.stroke();
    context.restore();
  }
}

function drawObstacles(context: CanvasRenderingContext2D, game: GameState, now: number) {
  const style = getObstacleStyle(game.obstacleStyleId);
  for (const obstacle of game.obstacles) {
    const x = laneCenter(obstacle.lane);
    const wobble = Math.sin(now * 0.006 + obstacle.phase) * 5;
    const left = x - obstacle.width / 2 + wobble;
    const top = obstacle.y - obstacle.height / 2;

    context.save();
    context.shadowColor = style.glow;
    context.shadowBlur = 20;
    const gradient = context.createLinearGradient(left, top, left + obstacle.width, top + obstacle.height);
    gradient.addColorStop(0, style.primary);
    gradient.addColorStop(0.55, style.secondary);
    gradient.addColorStop(1, style.glow);
    context.fillStyle = gradient;
    roundedRect(context, left, top, obstacle.width, obstacle.height, 9);
    context.fill();
    context.shadowBlur = 0;
    drawObstacleDetails(context, left, top, obstacle.width, obstacle.height, style, now + obstacle.phase);
    context.restore();
  }
}

function drawObstacleDetails(context: CanvasRenderingContext2D, left: number, top: number, width: number, height: number, style: ObstacleStyle, now: number) {
  context.save();
  context.globalAlpha = 0.68;
  context.strokeStyle = "#080b11";
  context.fillStyle = "#080b11";
  context.lineWidth = 3;

  if (style.pattern === "teeth") {
    for (let index = 0; index < 5; index += 1) {
      const x = left + 8 + index * ((width - 16) / 5);
      context.beginPath();
      context.moveTo(x, top + 8);
      context.lineTo(x + 7, top + height * 0.5);
      context.lineTo(x + 14, top + 8);
      context.closePath();
      context.fill();
    }
  } else if (style.pattern === "circuit") {
    context.beginPath();
    context.moveTo(left + 9, top + height * 0.42);
    context.lineTo(left + width * 0.42, top + height * 0.42);
    context.lineTo(left + width * 0.58, top + height * 0.62);
    context.lineTo(left + width - 9, top + height * 0.62);
    context.stroke();
    context.beginPath();
    context.arc(left + width * 0.42, top + height * 0.42, 3, 0, Math.PI * 2);
    context.arc(left + width * 0.58, top + height * 0.62, 3, 0, Math.PI * 2);
    context.fill();
  } else if (style.pattern === "gem") {
    context.beginPath();
    context.moveTo(left + width * 0.5, top + 7);
    context.lineTo(left + width - 11, top + height * 0.45);
    context.lineTo(left + width * 0.5, top + height - 7);
    context.lineTo(left + 11, top + height * 0.45);
    context.closePath();
    context.stroke();
  } else if (style.pattern === "hazard") {
    for (let index = -1; index < 5; index += 1) {
      context.save();
      context.translate(left + index * 18 + ((now * 0.02) % 18), top);
      context.rotate(-0.58);
      context.fillRect(0, -8, 8, height + 18);
      context.restore();
    }
  } else if (style.pattern === "speaker") {
    context.beginPath();
    context.arc(left + width * 0.35, top + height * 0.52, 8, 0, Math.PI * 2);
    context.arc(left + width * 0.67, top + height * 0.52, 8, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.arc(left + width * 0.35, top + height * 0.52, 3, 0, Math.PI * 2);
    context.arc(left + width * 0.67, top + height * 0.52, 3, 0, Math.PI * 2);
    context.fill();
  } else {
    roundedRect(context, left + 8, top + 9, width - 16, 5, 3);
    context.fill();
  }

  context.restore();
}

function drawPickups(context: CanvasRenderingContext2D, game: GameState, now: number) {
  for (const pickup of game.pickups) {
    const x = laneCenter(pickup.lane);
    const pulse = 1 + Math.sin(now * 0.008 + pickup.phase) * 0.12;
    const color = colorForPickup(pickup.kind);

    context.save();
    context.translate(x, pickup.y);
    context.scale(pulse, pulse);
    context.shadowColor = color;
    context.shadowBlur = 18;
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = pickup.kind === "spark" ? 3 : 4;
    context.beginPath();
    drawPickupShape(context, pickup.kind);
    context.stroke();
    if (pickup.kind !== "spark") {
      context.globalAlpha = 0.28;
      context.fill();
      context.globalAlpha = 1;
    }
    context.beginPath();
    context.arc(0, 0, 4, 0, Math.PI * 2);
    context.fill();
    if (pickup.kind !== "spark") {
      context.shadowBlur = 0;
      context.fillStyle = "#f8fafc";
      context.font = "900 8px Inter, Arial, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(pickupGlyph(pickup.kind), 0, 1);
    }
    context.restore();
  }
}

function drawPlayer(context: CanvasRenderingContext2D, game: GameState, now: number) {
  const skin = getSkin(game.skinId);
  const trailStyle = getTrailStyle(game.trailStyleId);
  const x = game.playerX;
  const y = PLAYER_Y;

  context.save();
  context.shadowColor = trailStyle.glow;
  context.shadowBlur = 22 + Math.sin(now * 0.01) * 4 + game.pulse * 10;
  const trail = context.createLinearGradient(x, y + 10, x, y + 88);
  trail.addColorStop(0, trailStyle.primary);
  trail.addColorStop(1, trailStyle.secondary);
  context.fillStyle = trail;
  context.beginPath();
  context.moveTo(x - 10, y + 6);
  context.lineTo(x + 10, y + 6);
  context.lineTo(x, y + 96);
  context.closePath();
  context.fill();
  drawTrailDetails(context, x, y, trailStyle, now);
  if (game.skinEffects) {
    drawSkinEffect(context, x, y, skin, now);
  }

  const gradient = context.createRadialGradient(x - 6, y - 8, 2, x, y, PLAYER_RADIUS + 12);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.32, skin.core);
  gradient.addColorStop(0.76, skin.accent);
  gradient.addColorStop(1, "#111827");
  context.fillStyle = gradient;
  context.beginPath();
  context.arc(x, y, PLAYER_RADIUS, 0, Math.PI * 2);
  context.fill();

  drawPlayerSkinDetails(context, x, y, skin, now);

  if (game.armor > 0 || game.armorGrace > 0) {
    context.save();
    context.lineWidth = game.armorGrace > 0 ? 5 : 3;
    context.strokeStyle = "#67e8f9";
    context.shadowColor = "#67e8f9";
    context.shadowBlur = game.armorGrace > 0 ? 34 : 20;
    context.globalAlpha = game.armorGrace > 0 ? 0.95 : 0.78 + Math.sin(now * 0.012) * 0.12;
    context.beginPath();
    context.arc(x, y, PLAYER_RADIUS + 14 + game.armorGrace * 18, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }

  context.lineWidth = game.activePowerups.ghost > 0 ? 4 : game.lives > 1 ? 3 : 1.5;
  context.strokeStyle = game.activePowerups.ghost > 0 ? "#b78cff" : game.lives > 1 ? skin.glow : "rgba(255, 255, 255, 0.55)";
  context.beginPath();
  context.arc(x, y, PLAYER_RADIUS + 8 + game.pulse * 4, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

function drawTrailDetails(context: CanvasRenderingContext2D, x: number, y: number, style: TrailStyle, now: number) {
  context.save();
  context.strokeStyle = style.glow;
  context.fillStyle = style.glow;
  context.shadowColor = style.glow;
  context.shadowBlur = 14;

  if (style.pattern === "sparks") {
    for (let index = 0; index < 5; index += 1) {
      const drift = Math.sin(now * 0.006 + index) * 8;
      context.globalAlpha = 0.34 + index * 0.08;
      context.beginPath();
      drawStar(context, x - 18 + index * 9 + drift, y + 24 + index * 13, 4, 4);
      context.fill();
    }
  } else if (style.pattern === "comet") {
    context.globalAlpha = 0.5;
    context.beginPath();
    context.ellipse(x, y + 52, 17, 48, 0, 0, Math.PI * 2);
    context.stroke();
  } else if (style.pattern === "pulse") {
    for (let index = 0; index < 3; index += 1) {
      context.globalAlpha = 0.42 - index * 0.1;
      context.beginPath();
      context.arc(x, y + 26 + index * 21, 7 + Math.sin(now * 0.01 + index) * 2, 0, Math.PI * 2);
      context.stroke();
    }
  } else if (style.pattern === "chain") {
    context.globalAlpha = 0.48;
    for (let index = 0; index < 4; index += 1) {
      context.beginPath();
      context.ellipse(x, y + 25 + index * 17, 8, 4, -0.4, 0, Math.PI * 2);
      context.stroke();
    }
  } else if (style.pattern === "flare") {
    context.globalAlpha = 0.42;
    context.beginPath();
    context.moveTo(x - 18, y + 18);
    context.lineTo(x - 31, y + 72);
    context.moveTo(x + 18, y + 18);
    context.lineTo(x + 31, y + 72);
    context.stroke();
  }

  context.restore();
}

function drawSkinEffect(context: CanvasRenderingContext2D, x: number, y: number, skin: Skin, now: number) {
  if (!skin.effect) {
    return;
  }

  context.save();
  context.shadowColor = skin.glow;
  context.shadowBlur = 14;
  context.lineWidth = 2;
  const count = skin.effect === "orbit" ? 7 : 6;
  for (let index = 0; index < count; index += 1) {
    const angle = now * 0.0018 + (Math.PI * 2 * index) / count;
    const radius = 31 + Math.sin(now * 0.004 + index) * 4;
    const dotX = x + Math.cos(angle) * radius;
    const dotY = y + Math.sin(angle) * (radius * 0.68) - 3;
    context.globalAlpha = 0.58 + Math.sin(now * 0.006 + index) * 0.22;
    context.fillStyle = index % 2 === 0 ? skin.accent : skin.glow;
    context.strokeStyle = context.fillStyle;

    if (skin.effect === "flowers" || skin.effect === "petals") {
      drawPetal(context, dotX, dotY, 4 + (index % 2), angle);
    } else if (skin.effect === "hearts") {
      context.beginPath();
      drawHeart(context, dotX, dotY, 5 + (index % 2));
      context.fill();
    } else if (skin.effect === "stars") {
      drawStar(context, dotX, dotY, 5 + (index % 2), 5);
      context.fill();
    } else if (skin.effect === "sparks") {
      context.beginPath();
      context.moveTo(dotX - 5, dotY);
      context.lineTo(dotX + 5, dotY);
      context.moveTo(dotX, dotY - 5);
      context.lineTo(dotX, dotY + 5);
      context.stroke();
    } else {
      context.beginPath();
      context.arc(dotX, dotY, 3.5, 0, Math.PI * 2);
      context.fill();
    }
  }

  if (skin.effect === "orbit") {
    context.globalAlpha = 0.32;
    context.strokeStyle = skin.accent;
    context.beginPath();
    context.ellipse(x, y, 48, 16, -0.26, 0, Math.PI * 2);
    context.stroke();
  }
  context.restore();
}

function drawPetal(context: CanvasRenderingContext2D, x: number, y: number, size: number, angle: number) {
  context.save();
  context.translate(x, y);
  context.rotate(angle);
  context.beginPath();
  context.ellipse(-size * 0.45, 0, size, size * 0.48, 0, 0, Math.PI * 2);
  context.ellipse(size * 0.45, 0, size, size * 0.48, 0, 0, Math.PI * 2);
  context.ellipse(0, -size * 0.45, size * 0.48, size, 0, 0, Math.PI * 2);
  context.ellipse(0, size * 0.45, size * 0.48, size, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawPlayerSkinDetails(context: CanvasRenderingContext2D, x: number, y: number, skin: Skin, now: number) {
  context.save();
  context.strokeStyle = skin.accent;
  context.fillStyle = skin.accent;
  context.lineWidth = 3;
  context.shadowColor = skin.glow;
  context.shadowBlur = 10;

  if (skin.pattern === "stripe") {
    context.beginPath();
    context.moveTo(x - 14, y - 5);
    context.lineTo(x + 14, y - 11);
    context.moveTo(x - 13, y + 7);
    context.lineTo(x + 13, y + 1);
    context.stroke();
  } else if (skin.pattern === "ring") {
    context.beginPath();
    context.arc(x, y, 10, 0, Math.PI * 2);
    context.stroke();
  } else if (skin.pattern === "split") {
    context.globalAlpha = 0.58;
    context.beginPath();
    context.arc(x, y, PLAYER_RADIUS - 1, -Math.PI / 2, Math.PI / 2);
    context.lineTo(x, y - PLAYER_RADIUS);
    context.closePath();
    context.fill();
  } else if (skin.pattern === "visor") {
    context.shadowBlur = 0;
    context.fillStyle = "rgba(2, 6, 23, 0.84)";
    roundedRect(context, x - 13, y - 7, 26, 9, 5);
    context.fill();
    context.fillStyle = skin.accent;
    roundedRect(context, x - 8, y - 5, 16, 3, 3);
    context.fill();
  } else if (skin.pattern === "crown") {
    context.beginPath();
    context.moveTo(x - 13, y - 10);
    context.lineTo(x - 8, y - 18);
    context.lineTo(x - 2, y - 11);
    context.lineTo(x + 4, y - 19);
    context.lineTo(x + 12, y - 10);
    context.closePath();
    context.fill();
  } else if (skin.pattern === "bolt") {
    context.beginPath();
    context.moveTo(x + 2, y - 16);
    context.lineTo(x - 7, y + 1);
    context.lineTo(x + 1, y + 1);
    context.lineTo(x - 3, y + 17);
    context.lineTo(x + 10, y - 3);
    context.lineTo(x + 2, y - 3);
    context.closePath();
    context.fill();
  } else if (skin.pattern === "star") {
    drawStar(context, x, y, 12, 5);
    context.fill();
  } else if (skin.pattern === "flame") {
    context.beginPath();
    context.moveTo(x, y - 16);
    context.bezierCurveTo(x - 12, y - 5, x - 10, y + 10, x, y + 16);
    context.bezierCurveTo(x + 11, y + 8, x + 13, y - 6, x + 3, y - 9);
    context.bezierCurveTo(x + 2, y - 3, x - 2, y - 1, x, y - 16);
    context.fill();
  } else if (skin.pattern === "checker") {
    context.beginPath();
    context.arc(x, y, PLAYER_RADIUS - 2, 0, Math.PI * 2);
    context.clip();
    context.globalAlpha = 0.56;
    for (let row = -2; row <= 2; row += 1) {
      for (let col = -2; col <= 2; col += 1) {
        if ((row + col) % 2 === 0) {
          context.fillRect(x + col * 8 - 4, y + row * 8 - 4, 8, 8);
        }
      }
    }
  } else if (skin.pattern === "aura" || skin.pattern === "orbital") {
    const wobble = Math.sin(now * 0.008) * 3;
    context.beginPath();
    context.ellipse(x, y + wobble, 23, 8, -0.25, 0, Math.PI * 2);
    context.stroke();
    if (skin.pattern === "orbital") {
      context.beginPath();
      context.arc(x + 20, y + wobble - 4, 3, 0, Math.PI * 2);
      context.fill();
    }
  } else {
    context.globalAlpha = 0.68;
    context.beginPath();
    context.arc(x - 6, y - 7, 4, 0, Math.PI * 2);
    context.fill();
  }

  context.restore();
}

function drawStar(context: CanvasRenderingContext2D, x: number, y: number, radius: number, points: number) {
  const inner = radius * 0.42;
  context.beginPath();
  for (let index = 0; index < points * 2; index += 1) {
    const currentRadius = index % 2 === 0 ? radius : inner;
    const angle = -Math.PI / 2 + (index * Math.PI) / points;
    const px = x + Math.cos(angle) * currentRadius;
    const py = y + Math.sin(angle) * currentRadius;
    if (index === 0) {
      context.moveTo(px, py);
    } else {
      context.lineTo(px, py);
    }
  }
  context.closePath();
}

function drawParticles(context: CanvasRenderingContext2D, game: GameState) {
  context.save();
  for (const particle of game.particles) {
    const alpha = clamp(particle.life / Math.max(0.001, particle.maxLife), 0, 1);
    context.globalAlpha = alpha * 0.8;
    context.fillStyle = particle.color;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

function drawVignette(context: CanvasRenderingContext2D) {
  const vignette = context.createRadialGradient(BOARD_WIDTH / 2, BOARD_HEIGHT / 2, 160, BOARD_WIDTH / 2, BOARD_HEIGHT / 2, 480);
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.58)");
  context.fillStyle = vignette;
  context.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
}

function drawPickupShape(context: CanvasRenderingContext2D, kind: PickupKind) {
  if (kind === "life") {
    drawHeart(context, 0, 1, 18);
    return;
  }
  if (kind === "magnet") {
    context.arc(0, 0, 16, Math.PI * 0.15, Math.PI * 1.85);
    return;
  }
  if (kind === "slow") {
    context.arc(0, 0, 16, 0, Math.PI * 2);
    context.moveTo(0, -10);
    context.lineTo(0, 1);
    context.lineTo(8, 8);
    return;
  }
  if (kind === "ghost") {
    roundedRect(context, -15, -16, 30, 31, 14);
    return;
  }
  if (kind === "double") {
    context.moveTo(-15, -12);
    context.lineTo(15, 0);
    context.lineTo(-15, 12);
    context.closePath();
    return;
  }
  context.arc(0, 0, 14, 0, Math.PI * 2);
}

function drawHeart(context: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const top = y - size * 0.35;
  context.moveTo(x, y + size * 0.58);
  context.bezierCurveTo(x - size * 1.05, top, x - size * 0.62, top - size * 0.82, x, top - size * 0.18);
  context.bezierCurveTo(x + size * 0.62, top - size * 0.82, x + size * 1.05, top, x, y + size * 0.58);
}

function overlayTitle(screen: GameScreen) {
  if (screen === "paused") {
    return "Pulse Held";
  }
  if (screen === "gameOver") {
    return "Run Crashed";
  }
  return "Catch The Rush";
}

function overlayCopy(screen: GameScreen, score: number, streak: number) {
  if (screen === "paused") {
    return "The lanes are waiting.";
  }
  if (screen === "gameOver") {
    return `${score.toLocaleString()} points with a ${streak}x streak.`;
  }
  return "Tap anywhere. Dodge, collect, unlock.";
}

function stageForElapsed(elapsed: number) {
  if (elapsed > 70) {
    return "Afterburn";
  }
  if (elapsed > 45) {
    return "Volt City";
  }
  if (elapsed > 24) {
    return "Heat Lane";
  }
  return "Glowway";
}

function labelPowerup(name: string) {
  return isPickupKind(name) ? pickupInfo(name).shortLabel : name;
}

function colorForPickup(kind: PickupKind) {
  return pickupInfo(kind).color;
}

function pickupInfo(kind: PickupKind) {
  return PICKUP_GUIDE[kind];
}

function effectLabel(effect: SkinEffect) {
  if (effect === "flowers") {
    return "flower orbit";
  }
  if (effect === "petals") {
    return "petal drift";
  }
  if (effect === "hearts") {
    return "heart aura";
  }
  if (effect === "stars") {
    return "star halo";
  }
  if (effect === "sparks") {
    return "spark fizz";
  }
  return "orbit glow";
}

function pickupGlyph(kind: PickupKind) {
  if (kind === "life") {
    return "HEAL";
  }
  if (kind === "magnet") {
    return "MAG";
  }
  if (kind === "slow") {
    return "SLOW";
  }
  if (kind === "ghost") {
    return "SAFE";
  }
  if (kind === "double") {
    return "2X";
  }
  return "SPK";
}

function isPickupKind(value: string): value is PickupKind {
  return value === "spark" || value === "life" || value === "magnet" || value === "slow" || value === "ghost" || value === "double";
}

function recordsForScope(
  scope: RecordScope,
  context: {
    leaderboard: LeaderboardEntry[];
    dailyBoard: LeaderboardEntry[];
    scoreHistory: ScoreHistoryEntry[];
    playerName: string;
  }
) {
  if (scope === "personal") {
    return context.scoreHistory
      .map((entry) => ({
        name: normalizeName(context.playerName),
        score: entry.score,
        date: entry.date,
        streak: entry.streak,
        mode: entry.mode
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }
  if (scope === "local") {
    return context.leaderboard;
  }
  if (scope === "daily") {
    return context.dailyBoard;
  }
  if (scope === "region") {
    return context.leaderboard;
  }
  return [];
}

function recordTitleForScope(scope: RecordScope, dailyLabel: string, nationalLabel: string, timeZoneLabel: string) {
  if (scope === "personal") {
    return "Personal Records";
  }
  if (scope === "local") {
    return "Local Top 10";
  }
  if (scope === "daily") {
    return dailyLabel;
  }
  if (scope === "region") {
    return `${nationalLabel} Region`;
  }
  return "Local Top 10";
}

function recordEmptyLabelForScope(scope: RecordScope) {
  if (scope === "region") {
    return "First regional score waiting";
  }
  return "First run waiting";
}

function resolveLocationLabels() {
  const fallback = { country: "United States", timeZone: "Local Time Zone" };
  try {
    const locale = navigator.language || "en-US";
    const region = locale.includes("-") ? locale.split("-").pop()?.toUpperCase() : "US";
    const countryNames: Record<string, string> = {
      US: "United States",
      CA: "Canada",
      GB: "United Kingdom",
      AU: "Australia",
      NZ: "New Zealand"
    };
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return {
      country: countryNames[region || "US"] ?? region ?? fallback.country,
      timeZone: timeZone ? timeZone.replace(/_/g, " ") : fallback.timeZone
    };
  } catch {
    return fallback;
  }
}

function getDailyRewardStatus(profile: Profile) {
  const today = dailyKey();
  const yesterday = dailyKey(new Date(Date.now() - 86_400_000));
  const claimedToday = profile.lastDailyRewardDate === today;
  const continuesStreak = profile.lastDailyRewardDate === yesterday || claimedToday;
  const nextStreak = claimedToday ? Math.max(1, profile.dailyStreak) : continuesStreak ? profile.dailyStreak + 1 : 1;
  return {
    available: !claimedToday,
    nextStreak,
    rewardIndex: Math.max(0, (nextStreak - 1) % DAILY_REWARDS.length)
  };
}

function applyDailyReward(profile: Profile, reward: DailyReward): Profile {
  if (reward.kind === "sparks") {
    return { ...profile, sparks: profile.sparks + reward.amount };
  }
  if (reward.kind === "revive") {
    return { ...profile, reviveTokens: profile.reviveTokens + reward.amount };
  }
  if (reward.kind === "life") {
    return { ...profile, lifeBoosts: profile.lifeBoosts + reward.amount };
  }
  if (reward.kind === "armor") {
    return { ...profile, armorPlates: profile.armorPlates + reward.amount };
  }
  if (reward.kind === "magnet") {
    return { ...profile, magnetPacks: profile.magnetPacks + reward.amount };
  }
  if (reward.kind === "rush") {
    return { ...profile, rushBoosts: profile.rushBoosts + reward.amount };
  }
  return profile;
}

function chestRewardBaseItem(reward: ChestReward): ChestPrizeItem {
  if (reward.sparks) {
    return { label: `+${reward.sparks} Sparks`, detail: "Currency payout", tier: reward.sparks >= 180 ? "jackpot" : "common", color: "#ffd166" };
  }
  if (reward.armorPlates) {
    return { label: "+1 Shield", detail: "Blocks one crash hit", tier: "common", color: "#67e8f9" };
  }
  if (reward.lifeBoosts) {
    return { label: "+1 Extra Life", detail: "Stack another heart", tier: "common", color: "#b6ff69" };
  }
  if (reward.reviveTokens) {
    return { label: "+1 Revive", detail: "Come back after a crash", tier: "common", color: "#ff4f87" };
  }
  if (reward.magnetPacks) {
    return { label: "+1 Magnet", detail: "Pulls sparks during a run", tier: "common", color: "#7df2dd" };
  }
  if (reward.rushBoosts) {
    return { label: "+1 2x Rush", detail: "Double score and sparks", tier: "common", color: "#f472b6" };
  }
  return { label: reward.label, detail: "Chest payout", tier: "common", color: "#cbd5e1" };
}

function chestRevealFromResult(result: ChestRewardResult, source: string): ChestReveal {
  const hasExclusive = result.reward.items.some((item) => item.tier === "exclusive");
  const hasSecret = result.reward.items.some((item) => item.tier === "secret");
  const hasJackpot = result.reward.items.some((item) => item.tier === "jackpot");
  return {
    title: hasExclusive ? "Exclusive Vault!" : hasSecret ? "Secret Drop!" : hasJackpot ? "Jackpot Chest!" : "Chest Opened!",
    kicker: hasExclusive ? "20-chest prize unlocked" : hasSecret ? "Hidden skin found" : hasJackpot ? "Big spark payout" : "New loot added",
    source,
    opened: result.reward.opened,
    premium: result.reward.premium || hasExclusive || hasJackpot,
    items: result.reward.items
  };
}

function grantChestReward(profile: Profile, freeChest: boolean): ChestRewardResult {
  const opened = profile.chestsOpened + 1;
  const reward = CHEST_REWARDS[(profile.chestsOpened + new Date().getDate()) % CHEST_REWARDS.length];
  const nextAbilities = { ...profile.abilities };
  const rewardLabels = [reward.label];
  const rewardItems = [chestRewardBaseItem(reward)];
  let nextUnlockedSkins = profile.unlockedSkins;
  let nextUnlockedTrails = profile.unlockedTrails;
  let nextUnlockedObstacleStyles = profile.unlockedObstacleStyles;
  let jackpotSparks = 0;
  let premium = false;

  if (opened % ABILITY_CHEST_INTERVAL === 0) {
    const abilityId = ABILITY_IDS[Math.floor(opened / ABILITY_CHEST_INTERVAL - 1) % ABILITY_IDS.length];
    nextAbilities[abilityId] += 1;
    rewardLabels.push(`${ABILITIES[abilityId].shortLabel} ability`);
    rewardItems.push({
      label: ABILITIES[abilityId].label,
      detail: "Button ability token",
      tier: "ability",
      color: ABILITIES[abilityId].color
    });
  }

  if (opened % SECRET_CHEST_INTERVAL === 0) {
    const exclusiveChest = opened % EXCLUSIVE_CHEST_INTERVAL === 0;
    premium = exclusiveChest;
    const skinPool = exclusiveChest ? EXCLUSIVE_SKINS : SECRET_SKINS;
    const lockedSkins = skinPool.filter((skin) => !nextUnlockedSkins.includes(skin.id));
    const unlockedSkin = lockedSkins[(opened + new Date().getDate()) % Math.max(1, lockedSkins.length)];
    if (unlockedSkin) {
      nextUnlockedSkins = [...nextUnlockedSkins, unlockedSkin.id];
      rewardLabels.push(`${unlockedSkin.name} ${exclusiveChest ? "exclusive" : "secret"} skin`);
      rewardItems.push({
        label: unlockedSkin.name,
        detail: exclusiveChest ? "Exclusive 20-chest skin" : "Secret ball skin",
        tier: exclusiveChest ? "exclusive" : "secret",
        color: unlockedSkin.glow
      });
    } else {
      jackpotSparks += exclusiveChest ? 900 : 450;
      rewardLabels.push(`+${exclusiveChest ? 900 : 450} vault jackpot`);
      rewardItems.push({
        label: `+${exclusiveChest ? 900 : 450} Sparks`,
        detail: "Vault jackpot",
        tier: "jackpot",
        color: "#ffd166"
      });
    }
  }

  if (opened % TRAIL_CHEST_INTERVAL === 0) {
    const lockedTrails = TRAIL_STYLES.filter((style) => !nextUnlockedTrails.includes(style.id));
    const trail = lockedTrails[(opened + new Date().getDay()) % Math.max(1, lockedTrails.length)];
    if (trail) {
      nextUnlockedTrails = [...nextUnlockedTrails, trail.id];
      rewardLabels.push(`${trail.name} line`);
      rewardItems.push({
        label: trail.name,
        detail: "Player line graphic",
        tier: "cosmetic",
        color: trail.glow
      });
    }
  }

  if (opened % OBSTACLE_CHEST_INTERVAL === 0) {
    const lockedObstacleStyles = OBSTACLE_STYLES.filter((style) => !nextUnlockedObstacleStyles.includes(style.id));
    const obstacleStyle = lockedObstacleStyles[(opened + new Date().getMonth()) % Math.max(1, lockedObstacleStyles.length)];
    if (obstacleStyle) {
      nextUnlockedObstacleStyles = [...nextUnlockedObstacleStyles, obstacleStyle.id];
      rewardLabels.push(`${obstacleStyle.name} boxes`);
      rewardItems.push({
        label: obstacleStyle.name,
        detail: "Dodge-box graphic",
        tier: "cosmetic",
        color: obstacleStyle.glow
      });
    }
  }

  return {
    reward: { ...reward, label: rewardLabels.join(" + "), items: rewardItems, opened, premium },
    profile: {
      ...profile,
      sparks: profile.sparks + (reward.sparks ?? 0) + jackpotSparks,
      reviveTokens: profile.reviveTokens + (reward.reviveTokens ?? 0),
      lifeBoosts: profile.lifeBoosts + (reward.lifeBoosts ?? 0),
      armorPlates: profile.armorPlates + (reward.armorPlates ?? 0),
      magnetPacks: profile.magnetPacks + (reward.magnetPacks ?? 0),
      rushBoosts: profile.rushBoosts + (reward.rushBoosts ?? 0),
      abilities: nextAbilities,
      unlockedSkins: nextUnlockedSkins,
      unlockedTrails: nextUnlockedTrails,
      unlockedObstacleStyles: nextUnlockedObstacleStyles,
      chestProgress: freeChest ? profile.chestProgress : Math.max(0, profile.chestProgress - CHEST_GOAL),
      chestsOpened: opened
    }
  };
}

function noteRewardedAd(profile: Profile): Profile {
  const today = dailyKey();
  const watchedToday = profile.lastRewardedAdDate === today ? profile.rewardedAdsWatchedToday : 0;
  return {
    ...profile,
    lastRewardedAdDate: today,
    rewardedAdsWatchedToday: watchedToday + 1
  };
}

function remainingRewardedAds(profile: Profile) {
  const watchedToday = profile.lastRewardedAdDate === dailyKey() ? profile.rewardedAdsWatchedToday : 0;
  return Math.max(0, REWARDED_AD_DAILY_LIMIT - watchedToday);
}

function emptyAbilityInventory(): AbilityInventory {
  return {
    phaseCloak: 0,
    megaMagnet: 0,
    heartBurst: 0,
    timeBrake: 0,
    sparkSurge: 0
  };
}

function normalizeAbilityInventory(value: unknown): AbilityInventory {
  const fallback = emptyAbilityInventory();
  if (!value || typeof value !== "object") {
    return fallback;
  }
  const stored = value as Partial<Record<AbilityId, unknown>>;
  return ABILITY_IDS.reduce((inventory, abilityId) => {
    inventory[abilityId] = Math.max(0, Number(stored[abilityId]) || 0);
    return inventory;
  }, fallback);
}

function totalAbilityCount(abilities: AbilityInventory) {
  return ABILITY_IDS.reduce((total, abilityId) => total + (abilities[abilityId] ?? 0), 0);
}

function remainingMilestone(opened: number, interval: number) {
  const remainder = opened % interval;
  return remainder === 0 ? interval : interval - remainder;
}

function unlockedAchievementsForRun(game: GameState, profileAfterRun: Profile) {
  return ACHIEVEMENTS.filter(
    (achievement) => !profileAfterRun.achievements.includes(achievement.id) && achievement.value(game, profileAfterRun) >= achievement.goal
  );
}

function estimateChestGain(run: GameState | GameSnapshot) {
  if (run.score <= 0) {
    return 0;
  }
  const scoreGain = Math.floor(run.score / 650);
  const sparkGain = run.runSparks * 2;
  const nearGain = run.nearMisses * 5;
  const timeGain = Math.floor(run.elapsed / 10);
  return clamp(scoreGain + sparkGain + nearGain + timeGain, 12, 45);
}

function limitedDropsForDate(dayLabel: string) {
  const ids = [...LIMITED_DROP_SKIN_IDS];
  const random = createRng(seedFromString(`limited-${dayLabel}`));
  for (let index = ids.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [ids[index], ids[swapIndex]] = [ids[swapIndex], ids[index]];
  }
  return ids.slice(0, 3).map(getSkin);
}

function reviveGame(game: GameState, message: string) {
  game.screen = "playing";
  game.lives = 1;
  game.revived = true;
  game.lastTime = performance.now();
  game.hitFlash = 0;
  game.shake = 0;
  game.obstacles = game.obstacles.filter((obstacle) => obstacle.y < PLAYER_Y - 90);
  game.eventMessage = message;
  game.eventTtl = 1.6;
}

function getSkin(id: SkinId) {
  return ALL_SKINS.find((skin) => skin.id === id) ?? SKINS[0];
}

function getTrailStyle(id: TrailStyleId) {
  return TRAIL_STYLES.find((style) => style.id === id) ?? TRAIL_STYLES[0];
}

function getObstacleStyle(id: ObstacleStyleId) {
  return OBSTACLE_STYLES.find((style) => style.id === id) ?? OBSTACLE_STYLES[0];
}

function readBestScore() {
  return readNumber(BEST_KEY);
}

function saveBestScore(score: number) {
  try {
    window.localStorage.setItem(BEST_KEY, String(score));
  } catch {
    return;
  }
}

function readLeaderboard(): LeaderboardEntry[] {
  return readBoard(BOARD_KEY);
}

function saveLeaderboard(entries: LeaderboardEntry[]) {
  saveBoard(BOARD_KEY, entries);
}

function readDailyBoard(key: string) {
  return readBoard(`${DAILY_BOARD_PREFIX}${key}`);
}

function saveDailyBoard(key: string, entries: LeaderboardEntry[]) {
  saveBoard(`${DAILY_BOARD_PREFIX}${key}`, entries);
}

function readBoard(key: string): LeaderboardEntry[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as LeaderboardEntry[];
    return Array.isArray(parsed) ? parsed.filter(isLeaderboardEntry).slice(0, 10) : [];
  } catch {
    return [];
  }
}

function saveBoard(key: string, entries: LeaderboardEntry[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(entries));
  } catch {
    return;
  }
}

function readProfile(): Profile {
  const storedBest = readBestScore();
  const fallback: Profile = {
    sparks: 0,
    reviveTokens: 0,
    lifeBoosts: 0,
    armorPlates: 0,
    magnetPacks: 0,
    rushBoosts: 0,
    selectedSkin: "nova",
    unlockedSkins: ["nova"],
    skinEffects: true,
    selectedTrail: "trail-classic",
    unlockedTrails: ["trail-classic"],
    selectedObstacleStyle: "blocks-classic",
    unlockedObstacleStyles: ["blocks-classic"],
    personalBest: storedBest,
    bestStreak: 0,
    scoreHistory: [],
    muted: false,
    totalRuns: 0,
    achievements: [],
    dailyStreak: 0,
    lastDailyRewardDate: "",
    chestProgress: 0,
    chestsOpened: 0,
    abilities: emptyAbilityInventory(),
    rewardedAdsWatchedToday: 0,
    lastRewardedAdDate: ""
  };

  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw) as Partial<Profile>;
    const unlocked: SkinId[] = Array.isArray(parsed.unlockedSkins) ? parsed.unlockedSkins.filter(isSkinId) : ["nova"];
    const unlockedTrails: TrailStyleId[] = Array.isArray(parsed.unlockedTrails) ? parsed.unlockedTrails.filter(isTrailStyleId) : ["trail-classic"];
    const unlockedObstacleStyles: ObstacleStyleId[] = Array.isArray(parsed.unlockedObstacleStyles) ? parsed.unlockedObstacleStyles.filter(isObstacleStyleId) : ["blocks-classic"];
    const scoreHistory = Array.isArray(parsed.scoreHistory) ? parsed.scoreHistory.filter(isScoreHistoryEntry).slice(0, 20) : [];
    const achievements = Array.isArray(parsed.achievements) ? parsed.achievements.filter(isAchievementId) : [];
    return {
      sparks: Math.max(0, Number(parsed.sparks) || 0),
      reviveTokens: Math.max(0, Number(parsed.reviveTokens) || 0),
      lifeBoosts: Math.max(0, Number(parsed.lifeBoosts) || 0),
      armorPlates: Math.max(0, Number(parsed.armorPlates) || 0),
      magnetPacks: Math.max(0, Number(parsed.magnetPacks) || 0),
      rushBoosts: Math.max(0, Number(parsed.rushBoosts) || 0),
      selectedSkin: isSkinId(parsed.selectedSkin) ? parsed.selectedSkin : "nova",
      unlockedSkins: unlocked.includes("nova") ? unlocked : ["nova", ...unlocked],
      skinEffects: typeof parsed.skinEffects === "boolean" ? parsed.skinEffects : true,
      selectedTrail: isTrailStyleId(parsed.selectedTrail) ? parsed.selectedTrail : "trail-classic",
      unlockedTrails: unlockedTrails.includes("trail-classic") ? unlockedTrails : ["trail-classic", ...unlockedTrails],
      selectedObstacleStyle: isObstacleStyleId(parsed.selectedObstacleStyle) ? parsed.selectedObstacleStyle : "blocks-classic",
      unlockedObstacleStyles: unlockedObstacleStyles.includes("blocks-classic") ? unlockedObstacleStyles : ["blocks-classic", ...unlockedObstacleStyles],
      personalBest: Math.max(storedBest, Number(parsed.personalBest) || 0),
      bestStreak: Math.max(0, Number(parsed.bestStreak) || 0),
      scoreHistory,
      muted: Boolean(parsed.muted),
      totalRuns: Math.max(0, Number(parsed.totalRuns) || 0),
      achievements,
      dailyStreak: Math.max(0, Number(parsed.dailyStreak) || 0),
      lastDailyRewardDate: typeof parsed.lastDailyRewardDate === "string" ? parsed.lastDailyRewardDate : "",
      chestProgress: clamp(Math.max(0, Number(parsed.chestProgress) || 0), 0, CHEST_GOAL),
      chestsOpened: Math.max(0, Number(parsed.chestsOpened) || 0),
      abilities: normalizeAbilityInventory(parsed.abilities),
      rewardedAdsWatchedToday: Math.max(0, Number(parsed.rewardedAdsWatchedToday) || 0),
      lastRewardedAdDate: typeof parsed.lastRewardedAdDate === "string" ? parsed.lastRewardedAdDate : ""
    };
  } catch {
    return fallback;
  }
}

function saveProfile(profile: Profile) {
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    return;
  }
}

function isSkinId(value: unknown): value is SkinId {
  return typeof value === "string" && ALL_SKINS.some((skin) => skin.id === value);
}

function isSecretSkinId(value: unknown): value is SkinId {
  return typeof value === "string" && SECRET_SKIN_IDS.has(value);
}

function isExclusiveSkinId(value: unknown): value is SkinId {
  return typeof value === "string" && EXCLUSIVE_SKIN_IDS.has(value);
}

function isChestSkinId(value: unknown): value is SkinId {
  return typeof value === "string" && CHEST_SKIN_IDS.has(value);
}

function isTrailStyleId(value: unknown): value is TrailStyleId {
  return typeof value === "string" && TRAIL_STYLES.some((style) => style.id === value);
}

function isObstacleStyleId(value: unknown): value is ObstacleStyleId {
  return typeof value === "string" && OBSTACLE_STYLES.some((style) => style.id === value);
}

function isAchievementId(value: unknown): value is AchievementId {
  return typeof value === "string" && ACHIEVEMENTS.some((achievement) => achievement.id === value);
}

function isScoreHistoryEntry(value: unknown): value is ScoreHistoryEntry {
  if (!value || typeof value !== "object") {
    return false;
  }
  const entry = value as ScoreHistoryEntry;
  return (
    typeof entry.score === "number" &&
    typeof entry.streak === "number" &&
    typeof entry.sparks === "number" &&
    typeof entry.date === "string" &&
    isSkinId(entry.skinId) &&
    (entry.mode === "classic" || entry.mode === "daily")
  );
}

function readSavedName() {
  try {
    return sanitizeName(window.localStorage.getItem(NAME_KEY) || "");
  } catch {
    return "";
  }
}

function savePlayerName(name: string) {
  try {
    window.localStorage.setItem(NAME_KEY, normalizeName(name));
    window.localStorage.setItem(NAME_READY_KEY, "true");
  } catch {
    return;
  }
}

function hasSavedPlayerName() {
  try {
    return window.localStorage.getItem(NAME_READY_KEY) === "true" && readSavedName().length > 0;
  } catch {
    return false;
  }
}

function isTextEntryTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tagName = target.tagName.toLowerCase();
  return tagName === "input" || tagName === "textarea" || target.isContentEditable;
}

function readNumber(key: string) {
  try {
    const value = Number(window.localStorage.getItem(key));
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

function normalizeName(name: string) {
  const clean = sanitizeName(name);
  return clean || "YOU";
}

function sanitizeName(name: string) {
  return name.replace(/[^a-z0-9 _-]/gi, "").trim().slice(0, 10).toUpperCase();
}

function isLeaderboardEntry(value: unknown): value is LeaderboardEntry {
  if (!value || typeof value !== "object") {
    return false;
  }
  const entry = value as LeaderboardEntry;
  return typeof entry.name === "string" && typeof entry.score === "number" && typeof entry.date === "string";
}

function formatEntryDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return "Today";
  }
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function dailyKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isMothersDayEventDate(_day = dailyKey()) {
  const now = Date.now();
  return now >= MOTHERS_DAY_EVENT_START_MS && now <= MOTHERS_DAY_EVENT_END_MS;
}

function mothersDayChestClaimKey(day = dailyKey()) {
  return `${MOTHERS_DAY_CHEST_KEY_PREFIX}${day}`;
}

function hasClaimedMothersDayChest(day = dailyKey()) {
  try {
    return window.localStorage.getItem(mothersDayChestClaimKey(day)) === "true";
  } catch {
    return false;
  }
}

function markMothersDayChestClaimed(day = dailyKey()) {
  try {
    window.localStorage.setItem(mothersDayChestClaimKey(day), "true");
  } catch {
    return;
  }
}

function seedFromString(input: string) {
  let seed = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    seed ^= input.charCodeAt(index);
    seed = Math.imul(seed, 16777619);
  }
  return seed >>> 0;
}

function createRng(seed: number) {
  let value = seed || 1;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let next = Math.imul(value ^ (value >>> 15), 1 | value);
    next ^= next + Math.imul(next ^ (next >>> 7), 61 | next);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function playSound(type: "spark" | "power" | "hit" | "crash" | "near", muted: boolean) {
  if (muted || typeof window === "undefined") {
    return;
  }

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return;
    }
    const audio = new AudioContextClass();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const now = audio.currentTime;
    const frequency = type === "spark" ? 720 : type === "power" ? 520 : type === "near" ? 880 : type === "hit" ? 180 : 90;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(50, frequency * 0.45), now + 0.12);
    oscillator.type = type === "crash" || type === "hit" ? "sawtooth" : "triangle";
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(type === "crash" ? 0.13 : 0.06, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.16);
    window.setTimeout(() => void audio.close(), 240);
  } catch {
    return;
  }
}

function vibrate(ms: number) {
  if ("vibrate" in navigator) {
    navigator.vibrate(ms);
  }
}

function laneCenter(lane: number) {
  return LANE_MARGIN + lane * ((BOARD_WIDTH - LANE_MARGIN * 2) / (LANES - 1));
}

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
