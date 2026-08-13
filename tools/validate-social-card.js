#!/usr/bin/env node

const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const SOCIAL_CARD = path.join(ROOT, 'assets', 'img', 'social-card.png');
const EXPECTED = { format: 'png', width: 1200, height: 630 };

async function main() {
    const metadata = await sharp(SOCIAL_CARD).metadata();
    const invalid = Object.entries(EXPECTED)
        .filter(([key, value]) => metadata[key] !== value)
        .map(([key, value]) => `${key}=${metadata[key]} (expected ${value})`);

    if (invalid.length > 0) {
        throw new Error(`Invalid social preview: ${invalid.join(', ')}`);
    }

    console.log(`Validated ${path.relative(ROOT, SOCIAL_CARD)} (${metadata.width}x${metadata.height} ${metadata.format})`);
}

main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});
