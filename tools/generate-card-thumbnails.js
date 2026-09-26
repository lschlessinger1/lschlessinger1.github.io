#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');

async function main() {
    const projects = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/projects.json'), 'utf8'));
    for (const item of projects.filter(item => item.thumbnailCrop)) {
        const [left, top, width, height] = item.thumbnailCrop;
        await sharp(path.join(root, item.imgSrc))
            .extract({ left, top, width, height })
            .webp({ quality: 90 })
            .toFile(path.join(root, item.thumbnailSrc));
        console.log(`Generated ${item.thumbnailSrc}`);
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
