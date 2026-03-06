/**
 * Генерирует PNG-иконки из public/icon.svg для браузера и iOS.
 * Запуск: node scripts/generate-icons.js (или npm run generate-icons)
 */
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, '..', 'public');
const svgPath = path.join(publicDir, 'icon.svg');

if (!fs.existsSync(svgPath)) {
  console.warn('scripts/generate-icons.js: icon.svg не найден, пропуск.');
  process.exit(0);
}

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.warn('Установите sharp для генерации PNG: npm install --save-dev sharp');
  process.exit(0);
}

const sizes = [
  { name: 'logo192.png', size: 192 },
  { name: 'logo512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32.png', size: 32 },
];

async function generate() {
  const svgBuffer = fs.readFileSync(svgPath);
  for (const { name, size } of sizes) {
    const outPath = path.join(publicDir, name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outPath);
    console.log('Создан:', name);
  }
  console.log('Иконки сгенерированы. Для favicon.ico используйте favicon-32.png или онлайн-конвертер.');
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
