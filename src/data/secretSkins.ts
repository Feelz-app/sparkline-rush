export type SecretSkin = {
  id: string;
  name: string;
  cost: number;
  category: "colors" | "street" | "outfits" | "elite" | "wild";
  vibe: string;
  pattern: "solid" | "stripe" | "ring" | "split" | "visor" | "crown" | "bolt" | "star" | "flame" | "checker" | "aura" | "orbital";
  core: string;
  accent: string;
  glow: string;
  trail: string;
  unlockLine: string;
};

type SkinSeed = {
  name: string;
  category: SecretSkin["category"];
  vibe: string;
  pattern?: SecretSkin["pattern"];
  unlockLine?: string;
};

const PATTERN_ROTATION: SecretSkin["pattern"][] = ["stripe", "ring", "split", "visor", "crown", "bolt", "star", "flame", "checker", "aura", "orbital", "solid"];

const COLOR_ROTATION = [
  ["#7df2dd", "#ff4f87", "#7df2dd"],
  ["#ffd166", "#f97316", "#ffcf5a"],
  ["#60a5fa", "#f8fafc", "#93c5fd"],
  ["#22c55e", "#facc15", "#86efac"],
  ["#c084fc", "#67e8f9", "#c4b5fd"],
  ["#fb7185", "#fef08a", "#fda4af"],
  ["#0f172a", "#22d3ee", "#67e8f9"],
  ["#f8fafc", "#a7f3d0", "#e2e8f0"],
  ["#991b1b", "#f97316", "#fb923c"],
  ["#166534", "#e9d5ff", "#86efac"],
  ["#312e81", "#f9a8d4", "#a78bfa"],
  ["#111827", "#facc15", "#fde047"],
  ["#14b8a6", "#fb7185", "#2dd4bf"],
  ["#92400e", "#fef3c7", "#fbbf24"],
  ["#581c87", "#f8fafc", "#c084fc"]
] as const;

const EXTRA_SECRET_SKIN_SEEDS: SkinSeed[] = [
  { name: "Aurora Fox", category: "wild", vibe: "North light sprint" },
  { name: "Velvet Comet", category: "elite", vibe: "Soft star impact" },
  { name: "Taxi Meteor", category: "street", vibe: "City cab from orbit" },
  { name: "Bubble Knight", category: "outfits", vibe: "Foam shield flex" },
  { name: "Lilac Lantern", category: "colors", vibe: "Quiet glow" },
  { name: "Cactus Crown", category: "wild", vibe: "Desert royalty" },
  { name: "Arcade Beetle", category: "wild", vibe: "Cabinet crawler" },
  { name: "Satin Rocket", category: "elite", vibe: "Glossy launch" },
  { name: "Graffiti Ghost", category: "street", vibe: "Wall tag phantom" },
  { name: "Tempo Tiger", category: "wild", vibe: "Beat-chasing stripes" },
  { name: "Cloud Courier", category: "outfits", vibe: "Air mail dash" },
  { name: "Neon Dentist", category: "outfits", vibe: "Smile flash" },
  { name: "Jelly Crown", category: "wild", vibe: "Wobble royal" },
  { name: "Prism Piper", category: "street", vibe: "Sidewalk song" },
  { name: "Copper Cyclone", category: "elite", vibe: "Spun metal" },
  { name: "Mint Goblet", category: "colors", vibe: "Fresh trophy shine" },
  { name: "Orbit Barber", category: "street", vibe: "Sharp fade lane" },
  { name: "Frost Botanist", category: "outfits", vibe: "Cold garden run" },
  { name: "Sunset Stunt", category: "street", vibe: "Ramp-ready glow" },
  { name: "Laser Lifeguard", category: "outfits", vibe: "Beach rescue beam" },
  { name: "Royal Pancake", category: "wild", vibe: "Breakfast champion" },
  { name: "Moon Mascot", category: "wild", vibe: "Stadium orbit" },
  { name: "Velcro Vampire", category: "outfits", vibe: "Stick-and-run night" },
  { name: "Crystal Camper", category: "wild", vibe: "Trail map sparkle" },
  { name: "Highway Halo", category: "street", vibe: "Fast lane saint" },
  { name: "Rocket Librarian", category: "outfits", vibe: "Silent launch" },
  { name: "Electric Florist", category: "street", vibe: "Bouquet voltage" },
  { name: "Marble DJ", category: "elite", vibe: "Stone bass" },
  { name: "Neon Nurse", category: "outfits", vibe: "Triage sparkle" },
  { name: "Solar Sax", category: "street", vibe: "Brass sun solo" },
  { name: "Aqua Archer", category: "outfits", vibe: "Clean aim" },
  { name: "Retro Rooftop", category: "street", vibe: "Skyline skip" },
  { name: "Berry Phantom", category: "wild", vibe: "Sweet haunt" },
  { name: "Velvet Volcano", category: "elite", vibe: "Soft eruption" },
  { name: "Pixel Paramedic", category: "outfits", vibe: "8-bit rescue" },
  { name: "Chrome Circus", category: "wild", vibe: "Big top shine" },
  { name: "Lunar Baker", category: "outfits", vibe: "Moon pie speed" },
  { name: "Garden Racer", category: "street", vibe: "Petal track" },
  { name: "Plasma Painter", category: "street", vibe: "Wet neon brush" },
  { name: "Fizzy Phantom", category: "wild", vibe: "Soda pop ghost" },
  { name: "Ocean Oracle", category: "elite", vibe: "Tide prediction" },
  { name: "Turbo Teacher", category: "outfits", vibe: "Pop quiz pace" },
  { name: "Snowcone Samurai", category: "outfits", vibe: "Sweet blade" },
  { name: "Radio Rebel", category: "street", vibe: "Signal hijack" },
  { name: "Candy Boxer", category: "outfits", vibe: "Sugar jab" },
  { name: "Lavender Pilot", category: "outfits", vibe: "Soft cockpit" },
  { name: "Golden Gargoyle", category: "wild", vibe: "Rooftop flex" },
  { name: "Neon Tailor", category: "street", vibe: "Fresh stitched glow" },
  { name: "Holo Hiker", category: "wild", vibe: "Trail prism" },
  { name: "Thunder Drummer", category: "street", vibe: "Storm beat" },
  { name: "Cobalt Chef", category: "outfits", vibe: "Kitchen sprint" },
  { name: "Bubble Astronaut", category: "outfits", vibe: "Helmet pop" },
  { name: "Peach Phantom", category: "wild", vibe: "Soft vanish" },
  { name: "Mirror Mechanic", category: "street", vibe: "Garage glare" },
  { name: "Ruby Ranger", category: "outfits", vibe: "Trail watch" },
  { name: "Velvet Thunder", category: "elite", vibe: "Quiet boom" },
  { name: "Electric Penguin", category: "wild", vibe: "Ice slide charge" },
  { name: "Sunset Spy", category: "outfits", vibe: "Golden cover" },
  { name: "Cereal Cyclone", category: "wild", vibe: "Morning spin" },
  { name: "Platinum Poet", category: "elite", vibe: "Luxury verse" },
  { name: "Neon Gardener", category: "street", vibe: "Greenhouse glow" },
  { name: "Crystal Cabbie", category: "street", vibe: "Gem meter" },
  { name: "Frost Firework", category: "wild", vibe: "Cold pop" },
  { name: "Midnight Medic", category: "outfits", vibe: "Night shift speed" },
  { name: "Saffron Skater", category: "street", vibe: "Rail spice" },
  { name: "Prism Pacer", category: "elite", vibe: "Rainbow tempo" },
  { name: "Moss Magician", category: "wild", vibe: "Forest trick" },
  { name: "Laser Lawyer", category: "outfits", vibe: "Objection glow" },
  { name: "Ballet Bandit", category: "outfits", vibe: "Graceful getaway" },
  { name: "Meteor Mime", category: "wild", vibe: "Silent crash" },
  { name: "Aqua Agent", category: "outfits", vibe: "Clean mission" },
  { name: "Candy Courier", category: "street", vibe: "Sugar delivery" },
  { name: "Velvet Viking", category: "outfits", vibe: "Soft raid" },
  { name: "Turbo Tourist", category: "wild", vibe: "Vacation speedrun" },
  { name: "Neon Nomad", category: "street", vibe: "Road glow" },
  { name: "Frost Fortune", category: "elite", vibe: "Cold jackpot" },
  { name: "Solar Surgeon", category: "outfits", vibe: "Bright precision" },
  { name: "Bubble Builder", category: "outfits", vibe: "Foam construction" },
  { name: "Prism Punk", category: "street", vibe: "Color riot" },
  { name: "Lantern Luchador", category: "outfits", vibe: "Ring light" },
  { name: "Chrome Cowboy", category: "outfits", vibe: "Metal rodeo" },
  { name: "Jungle Juggler", category: "wild", vibe: "Leafy balance" },
  { name: "Soda Sorcerer", category: "wild", vibe: "Fizz spell" },
  { name: "Diamond Detective", category: "elite", vibe: "Case closed shine" },
  { name: "Thunder Tailor", category: "street", vibe: "Storm stitch" },
  { name: "Mint Monarch", category: "elite", vibe: "Fresh throne" },
  { name: "Circuit Sailor", category: "outfits", vibe: "Digital tide" },
  { name: "Velvet Velocity", category: "elite", vibe: "Smooth speed" },
  { name: "Peacock Pilot", category: "wild", vibe: "Showy flight" },
  { name: "Rocket Rabbi", category: "outfits", vibe: "Wisdom launch" },
  { name: "Solar Swimmer", category: "outfits", vibe: "Pool flare" },
  { name: "Neon Scholar", category: "outfits", vibe: "Study streak" },
  { name: "Frost Fencer", category: "outfits", vibe: "Ice duel" },
  { name: "Coral Captain", category: "elite", vibe: "Reef command" },
  { name: "Velvet Voyage", category: "street", vibe: "Soft road trip" },
  { name: "Arcade Alchemist", category: "wild", vibe: "Token potion" },
  { name: "Moonlit Mechanic", category: "street", vibe: "Night garage" },
  { name: "Honey Herald", category: "wild", vibe: "Golden announcement" },
  { name: "Plasma Professor", category: "outfits", vibe: "Lecture beam" },
  { name: "Final Firework", category: "elite", vibe: "Vault finale" }
];

const EXCLUSIVE_SKIN_SEEDS: SkinSeed[] = [
  { name: "Nitro Roadster", category: "street", vibe: "Tiny car, giant ego", pattern: "stripe" },
  { name: "Turbo Chopper", category: "street", vibe: "Motorcycle heat trail", pattern: "flame" },
  { name: "Glass Princess", category: "elite", vibe: "Ballroom sparkle", pattern: "crown" },
  { name: "Coral Rocket Fish", category: "wild", vibe: "Reef speed legend", pattern: "stripe" },
  { name: "Velvet Deer", category: "wild", vibe: "Forest shine", pattern: "star" },
  { name: "Midnight Santa", category: "elite", vibe: "Holiday boss drop", pattern: "crown" },
  { name: "Snowboard Elf", category: "outfits", vibe: "Mountain trickster", pattern: "bolt" },
  { name: "Moon Mermaid", category: "elite", vibe: "Tide magic", pattern: "aura" },
  { name: "Astro Cowboy", category: "outfits", vibe: "Space rodeo", pattern: "orbital" },
  { name: "Neon Knight", category: "outfits", vibe: "Chrome shield", pattern: "crown" },
  { name: "Lava Dragon", category: "wild", vibe: "Molten wings", pattern: "flame" },
  { name: "Pumpkin Duchess", category: "elite", vibe: "Autumn royalty", pattern: "crown" },
  { name: "Candy Robot", category: "wild", vibe: "Sugar machine", pattern: "checker" },
  { name: "Royal Pegasus", category: "wild", vibe: "Winged trophy", pattern: "star" },
  { name: "Golden Shark", category: "wild", vibe: "Luxury bite", pattern: "split" },
  { name: "Street Samurai", category: "outfits", vibe: "Blade hoodie", pattern: "stripe" },
  { name: "Crystal Wizard", category: "elite", vibe: "Gem spell", pattern: "orbital" },
  { name: "Space Ballerina", category: "outfits", vibe: "Zero-g spin", pattern: "aura" },
  { name: "Jungle Ranger", category: "outfits", vibe: "Leaf patrol", pattern: "visor" },
  { name: "Thunder Miner", category: "outfits", vibe: "Storm helmet", pattern: "bolt" },
  { name: "Cloud Pilot", category: "outfits", vibe: "Sky racer", pattern: "orbital" },
  { name: "Opera Vampire", category: "elite", vibe: "Velvet night", pattern: "crown" },
  { name: "Desert Pharaoh", category: "elite", vibe: "Sun tomb gold", pattern: "ring" },
  { name: "Cyber Pirate", category: "wild", vibe: "Neon captain", pattern: "visor" },
  { name: "Rainbow Wrestler", category: "outfits", vibe: "Main event pop", pattern: "split" },
  { name: "Frost Archer", category: "outfits", vibe: "Ice aim", pattern: "star" },
  { name: "Hologram DJ", category: "street", vibe: "Club boss", pattern: "ring" },
  { name: "Monster Scooter", category: "street", vibe: "Tiny ride, big noise", pattern: "checker" },
  { name: "Prize Fighter", category: "outfits", vibe: "Gold glove speed", pattern: "bolt" },
  { name: "Firefighter Fox", category: "wild", vibe: "Alarm light dash", pattern: "flame" },
  { name: "Velvet Violinist", category: "elite", vibe: "Concert flash", pattern: "stripe" },
  { name: "Haunted Astronaut", category: "outfits", vibe: "Orbit ghost", pattern: "aura" },
  { name: "Pearl Diver", category: "outfits", vibe: "Deep sea glow", pattern: "ring" },
  { name: "Solar Racer", category: "street", vibe: "Sun track hero", pattern: "stripe" },
  { name: "Bubblegum Knight", category: "outfits", vibe: "Sweet armor", pattern: "crown" },
  { name: "Galactic Chef", category: "outfits", vibe: "Star kitchen", pattern: "flame" },
  { name: "Sled King", category: "elite", vibe: "Snow crown ride", pattern: "crown" },
  { name: "Star Fisher", category: "wild", vibe: "Cosmic catch", pattern: "star" },
  { name: "Velvet Magician", category: "elite", vibe: "Stage vault flex", pattern: "aura" },
  { name: "Highway Hero", category: "street", vibe: "Open-road save", pattern: "bolt" },
  { name: "Laser Unicorn", category: "wild", vibe: "Mythic beam", pattern: "star" },
  { name: "Neon Reindeer", category: "wild", vibe: "Holiday lane jump", pattern: "orbital" },
  { name: "Chrome Dolphin", category: "wild", vibe: "Ocean chrome", pattern: "split" },
  { name: "Mystic Nurse", category: "outfits", vibe: "Healing glow", pattern: "ring" },
  { name: "Lucky Lion", category: "wild", vibe: "Courage jackpot", pattern: "crown" },
  { name: "Candy Crown", category: "elite", vibe: "Sugar throne", pattern: "crown" },
  { name: "Snow Queen", category: "elite", vibe: "Frost royal", pattern: "aura" },
  { name: "Rocket Skateboard", category: "street", vibe: "Rail launch", pattern: "flame" },
  { name: "Parade Captain", category: "outfits", vibe: "Victory march", pattern: "stripe" },
  { name: "Final Parade", category: "elite", vibe: "The loudest chest", pattern: "orbital" }
];

function buildChestSkin(seed: SkinSeed, index: number, prefix: "secret" | "exclusive"): SecretSkin {
  const [core, accent, glow] = COLOR_ROTATION[index % COLOR_ROTATION.length];
  return {
    id: `${prefix}-${String(index + 1).padStart(3, "0")}-${slugify(seed.name)}`,
    name: seed.name,
    cost: 0,
    category: seed.category,
    vibe: seed.vibe,
    pattern: seed.pattern ?? PATTERN_ROTATION[index % PATTERN_ROTATION.length],
    core,
    accent,
    glow,
    trail: hexToRgba(glow, prefix === "exclusive" ? 0.5 : 0.38),
    unlockLine: seed.unlockLine ?? `${seed.name} dropped from the ${prefix === "exclusive" ? "exclusive" : "secret"} vault.`
  };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function hexToRgba(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

const EXTRA_SECRET_SKINS = EXTRA_SECRET_SKIN_SEEDS.map((seed, index) => buildChestSkin(seed, index + 50, "secret"));

// Original secret chest-only skins. Keep these distinct from copyrighted characters,
// brands, and celebrity likenesses. Edit or add to this list when you want new drops.
export const SECRET_SKINS: SecretSkin[] = [
  { id: "secret-midnight-glass", name: "Midnight Glass", cost: 0, category: "elite", vibe: "Lost ballroom legend", pattern: "crown", core: "#b7f7ff", accent: "#1d4ed8", glow: "#93c5fd", trail: "rgba(147, 197, 253, 0.42)", unlockLine: "The glass trail wakes up after midnight." },
  { id: "secret-coral-drifter", name: "Coral Drifter", cost: 0, category: "wild", vibe: "Tiny reef rocket", pattern: "stripe", core: "#fb7185", accent: "#f97316", glow: "#fb923c", trail: "rgba(251, 113, 133, 0.42)", unlockLine: "A reef racer with too much courage." },
  { id: "secret-clockwork-duchess", name: "Clockwork Duchess", cost: 0, category: "elite", vibe: "Gears and velvet", pattern: "ring", core: "#f8fafc", accent: "#d4af37", glow: "#facc15", trail: "rgba(250, 204, 21, 0.36)", unlockLine: "Polished brass, sharp timing." },
  { id: "secret-blue-hour-rogue", name: "Blue Hour Rogue", cost: 0, category: "outfits", vibe: "Moonlit getaway", pattern: "visor", core: "#2563eb", accent: "#bae6fd", glow: "#60a5fa", trail: "rgba(96, 165, 250, 0.4)", unlockLine: "A quiet runner from the last blue light." },
  { id: "secret-bread-crumb", name: "Bread Crumb", cost: 0, category: "wild", vibe: "Forest escape", pattern: "checker", core: "#f59e0b", accent: "#65a30d", glow: "#fbbf24", trail: "rgba(245, 158, 11, 0.38)", unlockLine: "Leaves a trail nobody can follow." },
  { id: "secret-glacier-rider", name: "Glacier Rider", cost: 0, category: "outfits", vibe: "Frozen engine", pattern: "bolt", core: "#e0f2fe", accent: "#38bdf8", glow: "#bae6fd", trail: "rgba(186, 230, 253, 0.38)", unlockLine: "A cold-start machine with hot hands." },
  { id: "secret-silver-orbit", name: "Silver Orbit", cost: 0, category: "elite", vibe: "Starlit champion", pattern: "orbital", core: "#facc15", accent: "#f8fafc", glow: "#fde68a", trail: "rgba(250, 204, 21, 0.38)", unlockLine: "Spins light into speed." },
  { id: "secret-crimson-kicks", name: "Crimson Kicks", cost: 0, category: "elite", vibe: "Click-click neon", pattern: "star", core: "#dc2626", accent: "#fef2f2", glow: "#f87171", trail: "rgba(248, 113, 113, 0.44)", unlockLine: "Every lane feels electric." },
  { id: "secret-mirror-mask", name: "Mirror Mask", cost: 0, category: "outfits", vibe: "Stage illusion", pattern: "visor", core: "#111827", accent: "#e879f9", glow: "#f0abfc", trail: "rgba(232, 121, 249, 0.36)", unlockLine: "The crowd sees what it wants." },
  { id: "secret-polar-guard", name: "Polar Guard", cost: 0, category: "outfits", vibe: "Shield chill", pattern: "star", core: "#1d4ed8", accent: "#f8fafc", glow: "#93c5fd", trail: "rgba(147, 197, 253, 0.38)", unlockLine: "A clean guard for messy lanes." },
  { id: "secret-golden-lamp", name: "Golden Lamp", cost: 0, category: "elite", vibe: "Wish engine", pattern: "flame", core: "#f59e0b", accent: "#7c3aed", glow: "#fbbf24", trail: "rgba(251, 191, 36, 0.42)", unlockLine: "Three sparks. One problem." },
  { id: "secret-velvet-fang", name: "Velvet Fang", cost: 0, category: "wild", vibe: "Night opera", pattern: "crown", core: "#7f1d1d", accent: "#fca5a5", glow: "#ef4444", trail: "rgba(239, 68, 68, 0.34)", unlockLine: "Soft suit, sharp bite." },
  { id: "secret-honey-riot", name: "Honey Riot", cost: 0, category: "wild", vibe: "Sweet armor", pattern: "ring", core: "#facc15", accent: "#111827", glow: "#fde047", trail: "rgba(250, 204, 21, 0.4)", unlockLine: "Sticky luck and gold armor." },
  { id: "secret-pixel-mechanic", name: "Pixel Mechanic", cost: 0, category: "street", vibe: "Arcade wrench", pattern: "checker", core: "#14b8a6", accent: "#f97316", glow: "#2dd4bf", trail: "rgba(20, 184, 166, 0.38)", unlockLine: "Fixes sparks, breaks scores." },
  { id: "secret-spore-dash", name: "Spore Dash", cost: 0, category: "wild", vibe: "Fungal sprint", pattern: "solid", core: "#f8fafc", accent: "#84cc16", glow: "#bef264", trail: "rgba(248, 250, 252, 0.32)", unlockLine: "Small cap. Big bounce." },
  { id: "secret-shadow-ninja", name: "Shadow Ninja", cost: 0, category: "outfits", vibe: "Silent lane cut", pattern: "visor", core: "#020617", accent: "#22d3ee", glow: "#67e8f9", trail: "rgba(34, 211, 238, 0.32)", unlockLine: "Only the trail admits it was there." },
  { id: "secret-galactic-knight", name: "Galactic Knight", cost: 0, category: "elite", vibe: "Laser oath", pattern: "bolt", core: "#4c1d95", accent: "#22c55e", glow: "#a78bfa", trail: "rgba(167, 139, 250, 0.4)", unlockLine: "An oath written in glow." },
  { id: "secret-jungle-crown", name: "Jungle Crown", cost: 0, category: "wild", vibe: "Leaf royalty", pattern: "crown", core: "#166534", accent: "#facc15", glow: "#86efac", trail: "rgba(134, 239, 172, 0.36)", unlockLine: "Runs like vines are cheering." },
  { id: "secret-ocean-queen", name: "Ocean Queen", cost: 0, category: "elite", vibe: "Tide command", pattern: "aura", core: "#0f766e", accent: "#99f6e4", glow: "#5eead4", trail: "rgba(94, 234, 212, 0.42)", unlockLine: "The lanes move like water." },
  { id: "secret-red-hoodline", name: "Red Hoodline", cost: 0, category: "street", vibe: "Forest streetwear", pattern: "visor", core: "#dc2626", accent: "#111827", glow: "#ef4444", trail: "rgba(220, 38, 38, 0.36)", unlockLine: "A red flash between tall shadows." },
  { id: "secret-iron-gear", name: "Iron Gear", cost: 0, category: "outfits", vibe: "Garage titan", pattern: "ring", core: "#64748b", accent: "#f97316", glow: "#fb923c", trail: "rgba(251, 146, 60, 0.34)", unlockLine: "Built from bolts and bad ideas." },
  { id: "secret-skyline-thread", name: "Skyline Thread", cost: 0, category: "street", vibe: "Rooftop swing", pattern: "stripe", core: "#0f172a", accent: "#22d3ee", glow: "#67e8f9", trail: "rgba(34, 211, 238, 0.32)", unlockLine: "A high-wire blur above traffic." },
  { id: "secret-night-beacon", name: "Night Beacon", cost: 0, category: "street", vibe: "Noir glide", pattern: "visor", core: "#020617", accent: "#a3e635", glow: "#bef264", trail: "rgba(163, 230, 53, 0.28)", unlockLine: "When the light hits, it moves." },
  { id: "secret-storm-anvil", name: "Storm Anvil", cost: 0, category: "elite", vibe: "Thunder forge", pattern: "bolt", core: "#475569", accent: "#38bdf8", glow: "#67e8f9", trail: "rgba(103, 232, 249, 0.4)", unlockLine: "Heavy sound, fast feet." },
  { id: "secret-moss-titan", name: "Moss Titan", cost: 0, category: "wild", vibe: "Big rhythm", pattern: "split", core: "#22c55e", accent: "#581c87", glow: "#86efac", trail: "rgba(34, 197, 94, 0.4)", unlockLine: "Too loud to be stopped." },
  { id: "secret-turbo-bike", name: "Turbo Bike", cost: 0, category: "street", vibe: "Two-wheel flare", pattern: "stripe", core: "#111827", accent: "#f97316", glow: "#fb923c", trail: "rgba(249, 115, 22, 0.42)", unlockLine: "A helmet visor and engine heat." },
  { id: "secret-chrome-roadster", name: "Chrome Roadster", cost: 0, category: "street", vibe: "Fast silver", pattern: "ring", core: "#cbd5e1", accent: "#22d3ee", glow: "#e2e8f0", trail: "rgba(203, 213, 225, 0.36)", unlockLine: "A silver streak with no license plate." },
  { id: "secret-neon-chopper", name: "Neon Chopper", cost: 0, category: "street", vibe: "Low ride glow", pattern: "flame", core: "#0f172a", accent: "#fb7185", glow: "#fb7185", trail: "rgba(251, 113, 133, 0.34)", unlockLine: "Low, loud, and somehow legal." },
  { id: "secret-rally-ghost", name: "Rally Ghost", cost: 0, category: "wild", vibe: "Dust phantom", pattern: "aura", core: "#f8fafc", accent: "#94a3b8", glow: "#e2e8f0", trail: "rgba(226, 232, 240, 0.28)", unlockLine: "Leaves dust but no tracks." },
  { id: "secret-monster-truck", name: "Monster Truck", cost: 0, category: "wild", vibe: "Big tire energy", pattern: "checker", core: "#65a30d", accent: "#111827", glow: "#a3e635", trail: "rgba(163, 230, 53, 0.38)", unlockLine: "It does not dodge lanes. It owns them." },
  { id: "secret-rocket-helmet", name: "Rocket Helmet", cost: 0, category: "outfits", vibe: "Launch face", pattern: "flame", core: "#f8fafc", accent: "#ef4444", glow: "#f97316", trail: "rgba(249, 115, 22, 0.42)", unlockLine: "One spark away from orbit." },
  { id: "secret-cyber-samurai", name: "Cyber Samurai", cost: 0, category: "outfits", vibe: "Blade code", pattern: "stripe", core: "#7c2d12", accent: "#22d3ee", glow: "#67e8f9", trail: "rgba(34, 211, 238, 0.38)", unlockLine: "Old discipline, new electricity." },
  { id: "secret-space-pony", name: "Space Pony", cost: 0, category: "wild", vibe: "Stardust mane", pattern: "star", core: "#c084fc", accent: "#f9a8d4", glow: "#f0abfc", trail: "rgba(192, 132, 252, 0.42)", unlockLine: "A little sparkle, a lot of velocity." },
  { id: "secret-candy-count", name: "Candy Count", cost: 0, category: "wild", vibe: "Sugar royalty", pattern: "crown", core: "#fb7185", accent: "#fef08a", glow: "#fda4af", trail: "rgba(251, 113, 133, 0.42)", unlockLine: "Sweet enough to be suspicious." },
  { id: "secret-lunar-witch", name: "Lunar Witch", cost: 0, category: "elite", vibe: "Moon spell", pattern: "aura", core: "#581c87", accent: "#e9d5ff", glow: "#c084fc", trail: "rgba(192, 132, 252, 0.4)", unlockLine: "A clean curse for dirty lanes." },
  { id: "secret-sun-prince", name: "Sun Prince", cost: 0, category: "elite", vibe: "Royal flare", pattern: "crown", core: "#f97316", accent: "#fef3c7", glow: "#fdba74", trail: "rgba(249, 115, 22, 0.44)", unlockLine: "Runs like sunrise owes rent." },
  { id: "secret-dream-pilot", name: "Dream Pilot", cost: 0, category: "outfits", vibe: "Cloud cockpit", pattern: "orbital", core: "#7dd3fc", accent: "#f0abfc", glow: "#bae6fd", trail: "rgba(186, 230, 253, 0.38)", unlockLine: "Steers through sleep at full speed." },
  { id: "secret-arcade-alien", name: "Arcade Alien", cost: 0, category: "wild", vibe: "Cabinet invader", pattern: "checker", core: "#22c55e", accent: "#a78bfa", glow: "#86efac", trail: "rgba(34, 197, 94, 0.4)", unlockLine: "Came for tokens, stayed for chaos." },
  { id: "secret-street-mage", name: "Street Mage", cost: 0, category: "street", vibe: "Spray spell", pattern: "bolt", core: "#14b8a6", accent: "#facc15", glow: "#2dd4bf", trail: "rgba(20, 184, 166, 0.38)", unlockLine: "Paints shortcuts into the air." },
  { id: "secret-voltage-cop", name: "Voltage Cop", cost: 0, category: "outfits", vibe: "Future badge", pattern: "visor", core: "#1e3a8a", accent: "#facc15", glow: "#60a5fa", trail: "rgba(96, 165, 250, 0.34)", unlockLine: "A siren made of blue light." },
  { id: "secret-desert-ronin", name: "Desert Ronin", cost: 0, category: "outfits", vibe: "Sand blade", pattern: "stripe", core: "#92400e", accent: "#fef3c7", glow: "#fbbf24", trail: "rgba(251, 191, 36, 0.34)", unlockLine: "Wind at the back, steel at the side." },
  { id: "secret-velvet-detective", name: "Velvet Detective", cost: 0, category: "street", vibe: "Mystery coat", pattern: "ring", core: "#3f3f46", accent: "#e879f9", glow: "#a78bfa", trail: "rgba(167, 139, 250, 0.32)", unlockLine: "Solved the case. Kept running." },
  { id: "secret-plasma-pirate", name: "Plasma Pirate", cost: 0, category: "wild", vibe: "Neon captain", pattern: "flame", core: "#0f172a", accent: "#22d3ee", glow: "#67e8f9", trail: "rgba(34, 211, 238, 0.4)", unlockLine: "Boards ships made of light." },
  { id: "secret-prism-angel", name: "Prism Angel", cost: 0, category: "elite", vibe: "Halo flash", pattern: "orbital", core: "#fafaf9", accent: "#f9a8d4", glow: "#f5d0fe", trail: "rgba(249, 168, 212, 0.34)", unlockLine: "A halo with speed lines." },
  { id: "secret-rainbow-rebel", name: "Rainbow Rebel", cost: 0, category: "street", vibe: "Loud streak", pattern: "split", core: "#22d3ee", accent: "#fb7185", glow: "#67e8f9", trail: "rgba(34, 211, 238, 0.44)", unlockLine: "Rules look better broken." },
  { id: "secret-magma-queen", name: "Magma Queen", cost: 0, category: "elite", vibe: "Molten crown", pattern: "crown", core: "#991b1b", accent: "#f97316", glow: "#fb923c", trail: "rgba(249, 115, 22, 0.44)", unlockLine: "A crown that never cools." },
  { id: "secret-sapphire-sprinter", name: "Sapphire Sprinter", cost: 0, category: "elite", vibe: "Gem speed", pattern: "star", core: "#1d4ed8", accent: "#bfdbfe", glow: "#60a5fa", trail: "rgba(96, 165, 250, 0.42)", unlockLine: "Cut clean from blue fire." },
  { id: "secret-paper-dragon", name: "Paper Dragon", cost: 0, category: "wild", vibe: "Folded fire", pattern: "flame", core: "#f8fafc", accent: "#ef4444", glow: "#fca5a5", trail: "rgba(248, 250, 252, 0.3)", unlockLine: "Looks fragile. Burns bright." },
  { id: "secret-emerald-dj", name: "Emerald DJ", cost: 0, category: "street", vibe: "Bass armor", pattern: "ring", core: "#166534", accent: "#22d3ee", glow: "#4ade80", trail: "rgba(74, 222, 128, 0.36)", unlockLine: "Drops beats and lane changes." },
  { id: "secret-final-boss", name: "Final Boss", cost: 0, category: "elite", vibe: "Secret endgame", pattern: "bolt", core: "#020617", accent: "#ff4f87", glow: "#ff4f87", trail: "rgba(255, 79, 135, 0.44)", unlockLine: "The vault saved this one for last." },
  ...EXTRA_SECRET_SKINS
];

export const EXCLUSIVE_SKINS: SecretSkin[] = EXCLUSIVE_SKIN_SEEDS.map((seed, index) => buildChestSkin(seed, index, "exclusive"));

export const CHEST_SKINS: SecretSkin[] = [...SECRET_SKINS, ...EXCLUSIVE_SKINS];
