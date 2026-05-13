import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const dataPath = path.join(root, "src", "data", "secretSkins.ts");
const outputDir = path.join(root, "docs", "secret-skin-previews");
const galleryPath = path.join(root, "docs", "secret-skin-gallery.html");

const source = await readFile(dataPath, "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020
  }
});
const module = { exports: {} };

Function("exports", "module", transpiled.outputText)(module.exports, module);

const secretSkins = module.exports.SECRET_SKINS ?? [];
const exclusiveSkins = module.exports.EXCLUSIVE_SKINS ?? [];
const skins = [
  ...secretSkins.map((skin) => ({ ...skin, dropTier: "Secret" })),
  ...exclusiveSkins.map((skin) => ({ ...skin, dropTier: "Exclusive" }))
];

await mkdir(outputDir, { recursive: true });

for (const skin of skins) {
  await writeFile(path.join(outputDir, `${skin.id}.svg`), renderSkinSvg(skin), "utf8");
}

await writeFile(path.join(outputDir, "manifest.json"), JSON.stringify(skins, null, 2), "utf8");
await writeFile(galleryPath, renderGallery(skins), "utf8");

console.log(`Generated ${skins.length} secret and exclusive skin previews`);
console.log(galleryPath);

function renderGallery(skins) {
  const cards = skins
    .map(
      (skin, index) => `
        <article class="card">
          <img src="secret-skin-previews/${skin.id}.svg" alt="${escapeHtml(skin.name)} ball preview" />
          <div>
            <span class="number">#${String(index + 1).padStart(2, "0")}</span>
            <h2>${escapeHtml(skin.name)}</h2>
            <p>${escapeHtml(skin.vibe)}</p>
            <small>${escapeHtml(skin.dropTier)} | ${escapeHtml(skin.pattern)} | ${escapeHtml(skin.category)} | ${escapeHtml(skin.id)}</small>
            <em>${escapeHtml(skin.unlockLine)}</em>
          </div>
        </article>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sparkline Secret Skin Gallery</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #080a0f;
      --panel: #0f141d;
      --line: rgba(241, 245, 249, 0.13);
      --text: #f8fafc;
      --muted: #9aa7b5;
      --aqua: #7df2dd;
      --gold: #ffd166;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, "Segoe UI", Arial, sans-serif;
      background:
        linear-gradient(135deg, rgba(125, 242, 221, 0.08), transparent 34%),
        linear-gradient(225deg, rgba(255, 79, 135, 0.08), transparent 34%),
        var(--bg);
      color: var(--text);
    }
    main {
      width: min(1180px, calc(100% - 28px));
      margin: 0 auto;
      padding: 28px 0;
    }
    header {
      display: grid;
      gap: 8px;
      margin-bottom: 18px;
    }
    h1 {
      margin: 0;
      font-size: clamp(2rem, 6vw, 4rem);
      line-height: 0.95;
    }
    header p {
      max-width: 780px;
      margin: 0;
      color: var(--muted);
      font-weight: 750;
      line-height: 1.35;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
      gap: 12px;
    }
    .card {
      min-width: 0;
      min-height: 340px;
      padding: 14px;
      border: 1px solid var(--line);
      border-radius: 8px;
      display: grid;
      gap: 12px;
      background:
        linear-gradient(135deg, rgba(125, 242, 221, 0.07), rgba(255, 79, 135, 0.055)),
        var(--panel);
      box-shadow: 0 22px 70px rgba(0, 0, 0, 0.22);
    }
    img {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 8px;
      background: #090d13;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .number {
      color: var(--gold);
      font-size: 0.76rem;
      font-weight: 950;
      text-transform: uppercase;
    }
    h2 {
      margin: 4px 0;
      font-size: 1.05rem;
      line-height: 1.05;
    }
    p, small, em {
      display: block;
      margin: 0;
      color: var(--muted);
      font-weight: 800;
      line-height: 1.25;
    }
    p { color: #c4ceda; font-size: 0.85rem; }
    small { margin-top: 6px; font-size: 0.72rem; }
    em { margin-top: 7px; color: var(--aqua); font-size: 0.78rem; font-style: normal; }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Secret Skin Gallery</h1>
      <p>Creator preview for chest-only Sparkline Rush skins. Edit, add, or remove skins in <strong>src/data/secretSkins.ts</strong>, then run <strong>npm run skin:previews</strong> to refresh these images.</p>
    </header>
    <section class="grid">
      ${cards}
    </section>
  </main>
</body>
</html>`;
}

function renderSkinSvg(skin) {
  const details = renderPattern(skin);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(skin.name)}</title>
  <desc id="desc">${escapeXml(skin.vibe)}</desc>
  <defs>
    <radialGradient id="ball" cx="34%" cy="27%" r="72%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="16%" stop-color="#ffffff"/>
      <stop offset="42%" stop-color="${skin.core}"/>
      <stop offset="78%" stop-color="${skin.accent}"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="48%" r="52%">
      <stop offset="0%" stop-color="${skin.glow}" stop-opacity="0.48"/>
      <stop offset="68%" stop-color="${skin.glow}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${skin.glow}" stop-opacity="0"/>
    </radialGradient>
    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="7" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="256" height="256" rx="18" fill="#090d13"/>
  <circle cx="128" cy="128" r="94" fill="url(#glow)"/>
  <path d="M104 176 L128 232 L152 176 Z" fill="${skin.glow}" opacity="0.22"/>
  <circle cx="128" cy="128" r="58" fill="url(#ball)" filter="url(#softGlow)" stroke="rgba(255,255,255,0.26)" stroke-width="3"/>
  ${details}
  <circle cx="105" cy="103" r="15" fill="#ffffff" opacity="0.38"/>
  <circle cx="128" cy="128" r="70" fill="none" stroke="${skin.glow}" stroke-opacity="0.42" stroke-width="3"/>
</svg>`;
}

function renderPattern(skin) {
  const color = skin.accent;
  if (skin.pattern === "stripe") {
    return `<path d="M84 118 L168 94 M88 143 L172 119" stroke="${color}" stroke-width="10" stroke-linecap="round" filter="url(#softGlow)"/>`;
  }
  if (skin.pattern === "ring") {
    return `<circle cx="128" cy="128" r="30" fill="none" stroke="${color}" stroke-width="9" filter="url(#softGlow)"/>`;
  }
  if (skin.pattern === "split") {
    return `<path d="M128 70 A58 58 0 0 1 128 186 Z" fill="${color}" opacity="0.54"/>`;
  }
  if (skin.pattern === "visor") {
    return `<rect x="86" y="112" width="84" height="28" rx="14" fill="#05070c" opacity="0.86"/>
    <rect x="103" y="119" width="50" height="8" rx="4" fill="${color}" filter="url(#softGlow)"/>`;
  }
  if (skin.pattern === "crown") {
    return `<path d="M86 117 L101 83 L120 111 L137 78 L162 117 Z" fill="${color}" filter="url(#softGlow)"/>`;
  }
  if (skin.pattern === "bolt") {
    return `<path d="M137 73 L100 134 L124 134 L113 185 L160 116 L135 116 Z" fill="${color}" filter="url(#softGlow)"/>`;
  }
  if (skin.pattern === "star") {
    return `<path d="${starPath(128, 128, 38, 16, 5)}" fill="${color}" filter="url(#softGlow)"/>`;
  }
  if (skin.pattern === "flame") {
    return `<path d="M128 72 C94 107 99 153 128 184 C160 158 164 109 139 94 C141 117 119 121 128 72 Z" fill="${color}" filter="url(#softGlow)"/>`;
  }
  if (skin.pattern === "checker") {
    const tiles = [];
    for (let row = 0; row < 5; row += 1) {
      for (let col = 0; col < 5; col += 1) {
        if ((row + col) % 2 === 0) {
          tiles.push(`<rect x="${88 + col * 16}" y="${88 + row * 16}" width="16" height="16" fill="${color}" opacity="0.5"/>`);
        }
      }
    }
    return `<clipPath id="clipBall"><circle cx="128" cy="128" r="52"/></clipPath><g clip-path="url(#clipBall)">${tiles.join("")}</g>`;
  }
  if (skin.pattern === "aura") {
    return `<ellipse cx="128" cy="130" rx="76" ry="24" fill="none" stroke="${color}" stroke-width="7" opacity="0.82" transform="rotate(-14 128 130)" filter="url(#softGlow)"/>`;
  }
  if (skin.pattern === "orbital") {
    return `<ellipse cx="128" cy="130" rx="82" ry="24" fill="none" stroke="${color}" stroke-width="7" opacity="0.82" transform="rotate(-14 128 130)" filter="url(#softGlow)"/>
    <circle cx="196" cy="108" r="9" fill="${color}" filter="url(#softGlow)"/>`;
  }
  return `<circle cx="107" cy="105" r="12" fill="${color}" opacity="0.68" filter="url(#softGlow)"/>`;
}

function starPath(cx, cy, outer, inner, points) {
  const parts = [];
  for (let index = 0; index < points * 2; index += 1) {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (index * Math.PI) / points;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    parts.push(`${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return `${parts.join(" ")} Z`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeXml(value) {
  return escapeHtml(value).replaceAll("'", "&apos;");
}
