#!/usr/bin/env node
const path = require('node:path');
const sharp = require('sharp');

// Preserve the 48% horizontal focal point used by the cards. Crop before
// resizing so small card images retain readable ink detail on 2x displays.
async function main() {
    const root = path.resolve(__dirname, '..');
    const input = path.join(root, 'assets/img/scroll.png');
    const { width, height } = await sharp(input).metadata();
    const cropWidth = Math.min(width, Math.round(height * 1280 / 540));
    await sharp(input)
        .extract({ left: Math.round((width - cropWidth) * 0.48), top: 0, width: cropWidth, height })
        .resize({ width: 1280, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(path.join(root, 'assets/img/scroll-thumbnail.webp'));
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
