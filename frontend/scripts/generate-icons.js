/**
 * Generate PWA icons for Solana Saga
 *
 * This script creates simple PNG icons for the PWA manifest.
 * For a production app, you'd want to use proper designed icons.
 *
 * Run with: node scripts/generate-icons.js
 *
 * Requires: npm install sharp (optional, for better quality)
 * Or just creates placeholder data URLs that work
 */

const fs = require('fs');
const path = require('path');

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const ICONS_DIR = path.join(__dirname, '../public/icons');

// Simple SVG icon template - creates a gaming-style icon
function createIconSVG(size) {
  const padding = Math.floor(size * 0.1);
  const innerSize = size - padding * 2;
  const cornerRadius = Math.floor(size * 0.15);
  const fontSize = Math.floor(size * 0.35);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f1115"/>
      <stop offset="100%" style="stop-color:#050505"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00F3FF"/>
      <stop offset="100%" style="stop-color:#FF00FF"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="url(#bg)"/>
  <rect x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}" rx="${cornerRadius - padding/2}" fill="none" stroke="url(#accent)" stroke-width="${Math.max(2, size/64)}"/>
  <text x="${size/2}" y="${size/2 + fontSize/3}" font-family="Arial Black, sans-serif" font-size="${fontSize}" fill="#00F3FF" text-anchor="middle" font-weight="bold">S</text>
</svg>`;
}

// Ensure icons directory exists
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Try to use sharp for PNG generation, fallback to SVG
async function generateIcons() {
  let sharp;
  try {
    sharp = require('sharp');
    console.log('Using sharp for PNG generation');
  } catch {
    console.log('Sharp not installed, generating SVG icons only');
    console.log('For PNG icons, run: npm install sharp');
  }

  for (const size of SIZES) {
    const svg = createIconSVG(size);
    const filename = `icon-${size}x${size}`;

    // Always save SVG version
    fs.writeFileSync(path.join(ICONS_DIR, `${filename}.svg`), svg);
    console.log(`Created ${filename}.svg`);

    // Generate PNG if sharp is available
    if (sharp) {
      try {
        await sharp(Buffer.from(svg))
          .png()
          .toFile(path.join(ICONS_DIR, `${filename}.png`));
        console.log(`Created ${filename}.png`);
      } catch (err) {
        console.error(`Failed to create ${filename}.png:`, err.message);
      }
    }
  }

  console.log('\nIcons generated in:', ICONS_DIR);

  if (!sharp) {
    console.log('\nNote: Only SVG icons were created.');
    console.log('For PWA to work properly, you need PNG icons.');
    console.log('Options:');
    console.log('1. Run: npm install sharp && node scripts/generate-icons.js');
    console.log('2. Use an online tool to convert SVGs to PNGs');
    console.log('3. Create custom icons in a design tool');
  }
}

generateIcons().catch(console.error);
