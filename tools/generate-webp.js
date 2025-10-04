#!/usr/bin/env node
/* eslint-env node */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const supported = new Set(['.png', '.jpg', '.jpeg']);
const inputs = process.argv.slice(2);

if (inputs.length === 0) {
    console.error('Usage: node tools/generate-webp.js <image paths...>');
    process.exit(1);
}

(async () => {
    for (const input of inputs) {
        const absoluteInput = path.resolve(input);
        if (!fs.existsSync(absoluteInput)) {
            console.warn(`Skipping missing source: ${input}`);
            continue;
        }

        const ext = path.extname(absoluteInput).toLowerCase();
        if (!supported.has(ext)) {
            console.warn(`Skipping unsupported format (${ext}): ${input}`);
            continue;
        }

        const outputPath = path.join(path.dirname(absoluteInput), `${path.basename(absoluteInput, ext)}.webp`);
        try {
            if (fs.existsSync(outputPath)) {
                console.warn(`Overwriting existing file: ${path.relative(process.cwd(), outputPath)}`);
            }
            await sharp(absoluteInput).webp({ quality: 85 }).toFile(outputPath);
            console.log(`Generated ${path.relative(process.cwd(), outputPath)}`);
        } catch (error) {
            console.error(`Failed to convert ${input}:`, error.message);
            process.exitCode = 1;
        }
    }
})();
