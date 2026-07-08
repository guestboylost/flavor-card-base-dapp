import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(new URL("..", import.meta.url).pathname);
const outDir = join(root, "base-submission");
const W = 1284;
const H = 2778;

const c = {
  cream: "#fff9ed",
  paper: "#f7ead2",
  bg: "#f5efe3",
  ink: "#201711",
  tomato: "#dd5d3d",
  lemon: "#f4d35e",
  herb: "#75a96b",
  berry: "#b1447b",
};

function esc(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function wrap(text, maxChars) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function baseFrame(content) {
  return `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${c.bg}"/>
    <circle cx="1110" cy="170" r="170" fill="${c.lemon}"/>
    <circle cx="130" cy="2520" r="230" fill="${c.tomato}"/>
    <path d="M0 520H1284M0 1040H1284M0 1560H1284M0 2080H1284" stroke="rgba(32,23,17,0.07)" stroke-width="3"/>
    ${content}
  </svg>`;
}

function titleBlock(title, subtitle) {
  return `
    <text x="72" y="126" font-family="Courier New, monospace" font-size="32" font-weight="900" fill="#9a4c2e">FLAVOR CARD</text>
    <text x="72" y="238" font-family="Arial, sans-serif" font-size="82" font-weight="900" fill="${c.ink}">${esc(title)}</text>
    <text x="76" y="300" font-family="Arial, sans-serif" font-size="32" font-weight="800" fill="#74412c">${esc(subtitle)}</text>
  `;
}

function recipeCard(x, y, title, flavor, ingredients, steps, note, accent = c.tomato) {
  const ingredientLines = wrap(ingredients, 32).slice(0, 5);
  const stepLines = wrap(steps, 34).slice(0, 6);
  return `
    <rect x="${x}" y="${y}" width="1060" height="1080" rx="34" fill="${c.cream}" stroke="${c.ink}" stroke-width="6"/>
    <circle cx="${x + 930}" cy="${y + 100}" r="74" fill="${accent}"/>
    <text x="${x + 54}" y="${y + 88}" font-family="Courier New, monospace" font-size="26" font-weight="900" fill="#9a4c2e">ONCHAIN RECIPE</text>
    <text x="${x + 54}" y="${y + 205}" font-family="Arial, sans-serif" font-size="80" font-weight="900" fill="${c.ink}">${esc(title)}</text>
    <rect x="${x + 54}" y="${y + 254}" width="230" height="76" rx="38" fill="${accent}" stroke="${c.ink}" stroke-width="5"/>
    <text x="${x + 169}" y="${y + 304}" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="900" fill="${c.cream}">${esc(flavor)}</text>
    <rect x="${x + 54}" y="${y + 390}" width="444" height="332" rx="22" fill="${c.paper}" stroke="${c.ink}" stroke-width="5"/>
    <text x="${x + 86}" y="${y + 450}" font-family="Arial, sans-serif" font-size="34" font-weight="900" fill="${c.ink}">Ingredients</text>
    ${ingredientLines.map((line, i) => `<text x="${x + 86}" y="${y + 510 + i * 42}" font-family="Arial, sans-serif" font-size="29" font-weight="800" fill="${c.ink}">${esc(line)}</text>`).join("")}
    <rect x="${x + 536}" y="${y + 390}" width="470" height="332" rx="22" fill="#fdf1da" stroke="${c.ink}" stroke-width="5"/>
    <text x="${x + 568}" y="${y + 450}" font-family="Arial, sans-serif" font-size="34" font-weight="900" fill="${c.ink}">Three steps</text>
    ${stepLines.map((line, i) => `<text x="${x + 568}" y="${y + 510 + i * 39}" font-family="Arial, sans-serif" font-size="27" font-weight="800" fill="${c.ink}">${esc(line)}</text>`).join("")}
    <rect x="${x + 54}" y="${y + 780}" width="952" height="144" rx="22" fill="${c.ink}"/>
    <text x="${x + 86}" y="${y + 836}" font-family="Courier New, monospace" font-size="24" font-weight="900" fill="${c.lemon}">SERVING NOTE</text>
    <text x="${x + 86}" y="${y + 888}" font-family="Arial, sans-serif" font-size="34" font-weight="900" fill="${c.cream}">${esc(note)}</text>
    <rect x="${x + 54}" y="${y + 970}" width="952" height="66" rx="18" fill="${c.paper}" stroke="${c.ink}" stroke-width="4"/>
    <text x="${x + 86}" y="${y + 1014}" font-family="Courier New, monospace" font-size="24" font-weight="900" fill="#9a4c2e">WALLET + TIMESTAMP SAVED ON BASE</text>
  `;
}

function feature(x, y, title, body, accent) {
  return `
    <rect x="${x}" y="${y}" width="540" height="220" rx="24" fill="${c.cream}" stroke="${c.ink}" stroke-width="5"/>
    <rect x="${x}" y="${y}" width="540" height="14" rx="7" fill="${accent}"/>
    <text x="${x + 34}" y="${y + 80}" font-family="Arial, sans-serif" font-size="38" font-weight="900" fill="${c.ink}">${esc(title)}</text>
    ${wrap(body, 30).slice(0, 3).map((line, i) => `<text x="${x + 34}" y="${y + 132 + i * 34}" font-family="Arial, sans-serif" font-size="27" font-weight="800" fill="#74412c">${esc(line)}</text>`).join("")}
  `;
}

function screenshot1() {
  return baseFrame(`
    ${titleBlock("Mint a tiny recipe.", "Turn a snack idea into a clean onchain recipe card.")}
    ${recipeCard(112, 430, "Lemon Chili Toast", "Bright", "Sourdough, lemon zest, chili oil, soft cheese, flaky salt", "Toast bread hard. Spread cheese. Finish with lemon, chili oil, and salt.", "A fast snack with a clean kick.", c.tomato)}
    ${feature(72, 1630, "Pick a flavor", "Bright, smoky, fresh, or sweet.", c.lemon)}
    ${feature(672, 1630, "Save on Base", "Wallet, recipe, and timestamp stay readable.", c.herb)}
  `);
}

function screenshot2() {
  return baseFrame(`
    ${titleBlock("Write three steps.", "Keep the recipe short enough to read in one glance.")}
    ${feature(72, 390, "Ingredients", "Simple pantry list with no clutter.", c.tomato)}
    ${feature(672, 390, "Instructions", "Prep, cook, finish. Done.", c.herb)}
    ${recipeCard(112, 730, "Mint Rice Bowl", "Fresh", "Rice, cucumber, mint, sesame, lime, soy drizzle", "Pack rice. Add cucumber and mint. Finish with sesame, lime, and soy.", "Cold, quick, and picnic-ready.", c.herb)}
  `);
}

function screenshot3() {
  return baseFrame(`
    ${titleBlock("Load any card.", "Use Card ID to reopen the recipe and verify its Base record.")}
    ${feature(72, 390, "Card ID", "Reload public recipe cards by number.", c.lemon)}
    ${feature(672, 390, "BaseScan", "Open the transaction after saving.", c.tomato)}
    ${recipeCard(112, 730, "Cocoa Berry Spoon", "Sweet", "Greek yogurt, cocoa nibs, berries, honey, pinch of salt", "Spoon yogurt. Scatter berries and nibs. Add honey and salt.", "Dessert energy, breakfast speed.", c.berry)}
  `);
}

function iconSvg() {
  return `
  <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="${c.bg}"/>
    <rect x="144" y="132" width="736" height="760" rx="80" fill="${c.cream}" stroke="${c.ink}" stroke-width="30"/>
    <circle cx="730" cy="260" r="90" fill="${c.tomato}"/>
    <path d="M326 300c0-88 75-146 186-146s186 58 186 146c0 82-57 124-126 140v52H452v-52c-69-16-126-58-126-140Z" fill="${c.lemon}" stroke="${c.ink}" stroke-width="24"/>
    <rect x="310" y="586" width="404" height="76" rx="38" fill="${c.ink}"/>
    <text x="512" y="638" text-anchor="middle" font-family="Arial, sans-serif" font-size="46" font-weight="900" fill="${c.cream}">RECIPE</text>
    <path d="M340 740H684" stroke="${c.tomato}" stroke-width="28" stroke-linecap="round"/>
  </svg>`;
}

function thumbnailSvg() {
  return `
  <svg width="1910" height="1000" viewBox="0 0 1910 1000" xmlns="http://www.w3.org/2000/svg">
    <rect width="1910" height="1000" fill="${c.bg}"/>
    <circle cx="1720" cy="140" r="220" fill="${c.lemon}"/>
    <text x="96" y="170" font-family="Arial, sans-serif" font-size="126" font-weight="900" fill="${c.ink}">Flavor Card</text>
    <text x="104" y="250" font-family="Arial, sans-serif" font-size="44" font-weight="800" fill="#74412c">Mint tiny recipe cards on Base.</text>
    ${feature(106, 370, "Recipe", "Flavor, ingredients, steps.", c.tomato)}
    ${feature(106, 635, "Record", "Wallet and timestamp saved.", c.herb)}
    ${recipeCard(760, 74, "Lemon Chili Toast", "Bright", "Sourdough, lemon zest, chili oil, soft cheese, flaky salt", "Toast. Spread. Finish with lemon and chili oil.", "A fast snack with a clean kick.", c.tomato)}
  </svg>`;
}

async function writePng(name, svg, width = W, height = H) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg)).resize(width, height).png({ compressionLevel: 9 }).toFile(file);
  return file;
}

async function writeJpg(name, svg, width, height) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg)).resize(width, height).jpeg({ quality: 88, mozjpeg: true }).toFile(file);
  return file;
}

await mkdir(outDir, { recursive: true });

const files = [
  await writeJpg("app-icon.jpg", iconSvg(), 1024, 1024),
  await writeJpg("app-thumbnail.jpg", thumbnailSvg(), 1910, 1000),
  await writePng("screenshot-1.png", screenshot1()),
  await writePng("screenshot-2.png", screenshot2()),
  await writePng("screenshot-3.png", screenshot3()),
];

await writeFile(
  join(outDir, "asset-manifest.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), files }, null, 2),
  "utf8",
);

await writeFile(
  join(outDir, "submission-copy.md"),
  [
    "# Flavor Card",
    "",
    "App Name: Flavor Card",
    "Tagline: Mint a tiny recipe",
    "Description: Mint a tiny recipe card with flavor, ingredients, steps, wallet, and timestamp on Base.",
    "",
    "Domain: https://flavor-card.vercel.app",
    "",
    "Assets:",
    "- app-icon.jpg",
    "- app-thumbnail.jpg",
    "- screenshot-1.png",
    "- screenshot-2.png",
    "- screenshot-3.png",
  ].join("\n"),
  "utf8",
);

for (const file of files) console.log(file);
