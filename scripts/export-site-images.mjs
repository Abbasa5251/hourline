// One-off: copies the app fonts and real screenshots into site/ for hourline.adevtutorials.in.
// Run: node scripts/export-site-images.mjs
import { copyFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const shots = ['02-home', '03-compare', '04-convert', '05-dst-alert', '07-time-travel', '08-dark'];
const fonts = [
  'bricolage-grotesque/700Bold/BricolageGrotesque_700Bold.ttf',
  'dm-sans/400Regular/DMSans_400Regular.ttf',
  'dm-sans/600SemiBold/DMSans_600SemiBold.ttf',
  'dm-sans/700Bold/DMSans_700Bold.ttf',
];

await mkdir('site/img', { recursive: true });
await mkdir('site/fonts', { recursive: true });

for (const name of shots) {
  // 1080×2160 → 540×1080: sharp on 2× screens at the ~270px display width.
  await sharp(`marketing/raw/${name}.png`).resize(540).webp({ quality: 82 }).toFile(`site/img/${name}.webp`);
}
await sharp('marketing/play/feature-graphic.png').resize(1200, 630, { fit: 'contain', background: '#12191A' }).png().toFile('site/og.png');

for (const f of fonts) await copyFile(`node_modules/@expo-google-fonts/${f}`, `site/fonts/${f.split('/').pop()}`);
// Both families are SIL OFL 1.1, which asks for the licence to travel with the fonts.
for (const fam of ['dm-sans', 'bricolage-grotesque']) await copyFile(`node_modules/@expo-google-fonts/${fam}/LICENSE_FONT`, `site/fonts/OFL-${fam}.txt`);

console.log(`wrote ${shots.length} screenshots, og.png and ${fonts.length} fonts`);
