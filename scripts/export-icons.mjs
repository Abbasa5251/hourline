// One-off: renders the "Ink dial" mark (icon option A) into every icon/splash PNG app.json needs.
// Run: node scripts/export-icons.mjs
import sharp from 'sharp';

const INK = '#12191A';
const CREAM = '#FBF6EC';
const APRICOT = '#F7B955';

// 100×100 artboard. scale shrinks the glyph about the centre (Android safe zone needs ~0.8).
function mark({ bg, fg, accent, scale = 1 }) {
  const ticks = [-45, -22.5, 22.5, 45]
    .map((a) => `<line x1="50" y1="44" x2="50" y2="37" transform="rotate(${a} 50 82)"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  ${bg ? `<rect width="100" height="100" fill="${bg}"/>` : ''}
  <g transform="translate(50 50) scale(${scale}) translate(-50 -50)">
    <g stroke="${fg}" stroke-width="4.5" stroke-linecap="round">${ticks}</g>
    <line x1="50" y1="44" x2="50" y2="30" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>
    <path d="M18.2 70 A34 34 0 0 1 81.8 70 Z" fill="${fg}"/>
  </g>
</svg>`;
}

const out = [
  // iOS (light is also the generic icon). Dark/tinted variants must be transparent; iOS supplies the ground.
  ['assets/images/icon.png', 1024, { bg: INK, fg: CREAM, accent: APRICOT }],
  ['assets/images/ios-dark.png', 1024, { fg: CREAM, accent: APRICOT }],
  ['assets/images/ios-tinted.png', 1024, { fg: '#FFFFFF', accent: '#FFFFFF' }],
  // Android adaptive: background comes from backgroundColor in app.json.
  ['assets/images/android-icon-foreground.png', 1024, { fg: CREAM, accent: APRICOT, scale: 0.8 }],
  ['assets/images/android-icon-monochrome.png', 1024, { fg: '#FFFFFF', accent: '#FFFFFF', scale: 0.8 }],
  // Splash glyphs (transparent).
  ['assets/images/splash-icon.png', 1024, { fg: INK, accent: APRICOT }],
  ['assets/images/splash-icon-dark.png', 1024, { fg: CREAM, accent: APRICOT }],
  ['assets/images/favicon.png', 48, { bg: INK, fg: CREAM, accent: APRICOT }],
];

for (const [file, size, opts] of out) {
  await sharp(Buffer.from(mark(opts))).resize(size, size).png().toFile(file);
  console.log('wrote', file);
}
