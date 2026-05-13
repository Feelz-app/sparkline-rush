export type TrailPattern = "ribbon" | "sparks" | "comet" | "pulse" | "chain" | "flare";
export type ObstaclePattern = "bar" | "teeth" | "circuit" | "gem" | "hazard" | "speaker";

export type TrailStyle = {
  id: string;
  name: string;
  vibe: string;
  primary: string;
  secondary: string;
  glow: string;
  pattern: TrailPattern;
};

export type ObstacleStyle = {
  id: string;
  name: string;
  vibe: string;
  primary: string;
  secondary: string;
  glow: string;
  pattern: ObstaclePattern;
};

export const TRAIL_STYLES: TrailStyle[] = [
  { id: "trail-classic", name: "Classic Line", vibe: "Starter trail", primary: "rgba(125, 242, 221, 0.46)", secondary: "rgba(125, 242, 221, 0)", glow: "#7df2dd", pattern: "ribbon" },
  { id: "trail-gold-rush", name: "Gold Rush", vibe: "Coin shower", primary: "rgba(255, 209, 102, 0.62)", secondary: "rgba(255, 79, 135, 0)", glow: "#ffd166", pattern: "sparks" },
  { id: "trail-candy-comet", name: "Candy Comet", vibe: "Pink rocket tail", primary: "rgba(251, 113, 133, 0.58)", secondary: "rgba(103, 232, 249, 0)", glow: "#fb7185", pattern: "comet" },
  { id: "trail-emerald-chain", name: "Emerald Chain", vibe: "Linked green pulses", primary: "rgba(74, 222, 128, 0.56)", secondary: "rgba(20, 184, 166, 0)", glow: "#4ade80", pattern: "chain" },
  { id: "trail-royal-pulse", name: "Royal Pulse", vibe: "Purple heartbeat", primary: "rgba(167, 139, 250, 0.58)", secondary: "rgba(249, 168, 212, 0)", glow: "#a78bfa", pattern: "pulse" },
  { id: "trail-ice-flare", name: "Ice Flare", vibe: "Cold exhaust", primary: "rgba(186, 230, 253, 0.62)", secondary: "rgba(96, 165, 250, 0)", glow: "#bae6fd", pattern: "flare" },
  { id: "trail-lava-ribbon", name: "Lava Ribbon", vibe: "Molten drag", primary: "rgba(249, 115, 22, 0.6)", secondary: "rgba(153, 27, 27, 0)", glow: "#f97316", pattern: "ribbon" },
  { id: "trail-prism-sparks", name: "Prism Sparks", vibe: "Rainbow crumbs", primary: "rgba(34, 211, 238, 0.56)", secondary: "rgba(249, 168, 212, 0)", glow: "#22d3ee", pattern: "sparks" },
  { id: "trail-midnight-comet", name: "Midnight Comet", vibe: "Dark blue speed", primary: "rgba(96, 165, 250, 0.54)", secondary: "rgba(15, 23, 42, 0)", glow: "#60a5fa", pattern: "comet" },
  { id: "trail-honey-flare", name: "Honey Flare", vibe: "Warm victory", primary: "rgba(253, 224, 71, 0.58)", secondary: "rgba(251, 146, 60, 0)", glow: "#fde047", pattern: "flare" },
  { id: "trail-plasma-chain", name: "Plasma Chain", vibe: "Electric links", primary: "rgba(236, 72, 153, 0.58)", secondary: "rgba(34, 211, 238, 0)", glow: "#ec4899", pattern: "chain" },
  { id: "trail-ghost-pulse", name: "Ghost Pulse", vibe: "Soft phase echo", primary: "rgba(196, 181, 253, 0.5)", secondary: "rgba(255, 255, 255, 0)", glow: "#c4b5fd", pattern: "pulse" }
];

export const OBSTACLE_STYLES: ObstacleStyle[] = [
  { id: "blocks-classic", name: "Classic Blocks", vibe: "Starter danger", primary: "#ff4f87", secondary: "#ffcf5a", glow: "#ff4f87", pattern: "bar" },
  { id: "blocks-arcade-teeth", name: "Arcade Teeth", vibe: "Bitey neon", primary: "#f97316", secondary: "#facc15", glow: "#fb923c", pattern: "teeth" },
  { id: "blocks-circuit", name: "Circuit Walls", vibe: "Wire trap", primary: "#22d3ee", secondary: "#0f172a", glow: "#67e8f9", pattern: "circuit" },
  { id: "blocks-ruby-gem", name: "Ruby Gems", vibe: "Luxury hazard", primary: "#dc2626", secondary: "#f8fafc", glow: "#f87171", pattern: "gem" },
  { id: "blocks-honey-hazard", name: "Honey Hazard", vibe: "Sweet warning", primary: "#facc15", secondary: "#111827", glow: "#fde047", pattern: "hazard" },
  { id: "blocks-bass-speaker", name: "Bass Speakers", vibe: "Club walls", primary: "#a78bfa", secondary: "#22d3ee", glow: "#a78bfa", pattern: "speaker" },
  { id: "blocks-frost-bars", name: "Frost Bars", vibe: "Cold blocks", primary: "#bae6fd", secondary: "#60a5fa", glow: "#bae6fd", pattern: "bar" },
  { id: "blocks-toxic-teeth", name: "Toxic Teeth", vibe: "Sour snap", primary: "#84cc16", secondary: "#0f172a", glow: "#bef264", pattern: "teeth" },
  { id: "blocks-prism-circuit", name: "Prism Circuit", vibe: "Color grid", primary: "#fb7185", secondary: "#22d3ee", glow: "#f9a8d4", pattern: "circuit" },
  { id: "blocks-onyx-gem", name: "Onyx Gems", vibe: "Premium dark", primary: "#111827", secondary: "#ffd166", glow: "#ffd166", pattern: "gem" },
  { id: "blocks-siren-hazard", name: "Siren Hazard", vibe: "Emergency lane", primary: "#2563eb", secondary: "#ef4444", glow: "#60a5fa", pattern: "hazard" },
  { id: "blocks-party-speaker", name: "Party Speakers", vibe: "Beat wall", primary: "#ec4899", secondary: "#fef08a", glow: "#f472b6", pattern: "speaker" }
];
