const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputDir = path.join(__dirname, '..', 'jil');
const outputDir = path.join(__dirname, '..', 'public', 'sequence-jil');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function processJilSequence() {
  console.log('Starting JIL sequence image conversion...');
  const totalFrames = 120;
  const sourceTotal = 240;

  for (let i = 0; i < totalFrames; i++) {
    const sourceIdx = Math.min(240, Math.floor(i * ((sourceTotal - 1) / (totalFrames - 1))) + 1);
    const sourceFileName = `ezgif-frame-${String(sourceIdx).padStart(3, '0')}.jpg`;
    const sourcePath = path.join(inputDir, sourceFileName);
    const targetPath = path.join(outputDir, `frame_${i}.webp`);

    if (!fs.existsSync(sourcePath)) {
      console.error(`Source file missing: ${sourcePath}`);
      continue;
    }

    try {
      await sharp(sourcePath)
        .resize(1920, 1080, { fit: 'contain', background: { r: 10, g: 10, b: 10, alpha: 1 } })
        .webp({ quality: 85 })
        .toFile(targetPath);

      if ((i + 1) % 30 === 0 || i === totalFrames - 1) {
        console.log(`Processed ${i + 1}/${totalFrames} JIL frames...`);
      }
    } catch (err) {
      console.error(`Failed processing JIL frame ${i}:`, err);
    }
  }

  console.log('✅ JIL sequence processing complete! 120 webp frames created in public/sequence-jil/');
}

processJilSequence();
