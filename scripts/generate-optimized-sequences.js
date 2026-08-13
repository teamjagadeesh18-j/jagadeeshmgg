const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const heroSourceDir = path.join(__dirname, '..', 'webtest');
const jilSourceDir = path.join(__dirname, '..', 'jil');

const heroDesktopDir = path.join(__dirname, '..', 'public', 'sequence');
const heroMobileDir = path.join(__dirname, '..', 'public', 'sequence-mobile');

const jilDesktopDir = path.join(__dirname, '..', 'public', 'sequence-jil');
const jilMobileDir = path.join(__dirname, '..', 'public', 'sequence-jil-mobile');

// Ensure output directories exist
[heroDesktopDir, heroMobileDir, jilDesktopDir, jilMobileDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function processHeroSequence() {
  console.log('🚀 Processing Hero Sequence (240 desktop frames, 120 mobile frames)...');
  const sourceTotal = 240;

  // 1. Desktop: 240 frames @ 1920x1080 (Quality 85)
  for (let i = 0; i < sourceTotal; i++) {
    const sourceFileName = `ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`;
    const sourcePath = path.join(heroSourceDir, sourceFileName);
    const targetPath = path.join(heroDesktopDir, `frame_${i}.webp`);

    if (fs.existsSync(sourcePath)) {
      await sharp(sourcePath)
        .resize(1920, 1080, { fit: 'contain', background: { r: 10, g: 10, b: 10, alpha: 1 } })
        .webp({ quality: 85 })
        .toFile(targetPath);
    }
  }

  // 2. Mobile: 120 frames (every 2nd frame) @ 960x540 (Quality 85)
  for (let i = 0; i < 120; i++) {
    const sourceIdx = i * 2 + 1; // 1, 3, 5 ... 239
    const sourceFileName = `ezgif-frame-${String(sourceIdx).padStart(3, '0')}.jpg`;
    const sourcePath = path.join(heroSourceDir, sourceFileName);
    const targetPath = path.join(heroMobileDir, `frame_${i}.webp`);

    if (fs.existsSync(sourcePath)) {
      await sharp(sourcePath)
        .resize(960, 540, { fit: 'contain', background: { r: 10, g: 10, b: 10, alpha: 1 } })
        .webp({ quality: 85 })
        .toFile(targetPath);
    }
  }
  console.log('✅ Hero Sequence processing complete!');
}

async function processJilSequence() {
  console.log('🚀 Processing JIL Sequence (240 desktop frames, 120 mobile frames)...');
  const sourceTotal = 240;

  // 1. Desktop: 240 frames @ 1920x1080 (Quality 85)
  for (let i = 0; i < sourceTotal; i++) {
    const sourceFileName = `ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`;
    const sourcePath = path.join(jilSourceDir, sourceFileName);
    const targetPath = path.join(jilDesktopDir, `frame_${i}.webp`);

    if (fs.existsSync(sourcePath)) {
      await sharp(sourcePath)
        .resize(1920, 1080, { fit: 'contain', background: { r: 10, g: 10, b: 10, alpha: 1 } })
        .webp({ quality: 85 })
        .toFile(targetPath);
    }
  }

  // 2. Mobile: 120 frames (every 2nd frame) @ 960x540 (Quality 85)
  for (let i = 0; i < 120; i++) {
    const sourceIdx = i * 2 + 1; // 1, 3, 5 ... 239
    const sourceFileName = `ezgif-frame-${String(sourceIdx).padStart(3, '0')}.jpg`;
    const sourcePath = path.join(jilSourceDir, sourceFileName);
    const targetPath = path.join(jilMobileDir, `frame_${i}.webp`);

    if (fs.existsSync(sourcePath)) {
      await sharp(sourcePath)
        .resize(960, 540, { fit: 'contain', background: { r: 10, g: 10, b: 10, alpha: 1 } })
        .webp({ quality: 85 })
        .toFile(targetPath);
    }
  }
  console.log('✅ JIL Sequence processing complete!');
}

async function main() {
  await processHeroSequence();
  await processJilSequence();
  console.log('🎉 All sequences generated successfully!');
}

main().catch((err) => {
  console.error('❌ Error processing sequences:', err);
  process.exit(1);
});
