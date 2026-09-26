#!/usr/bin/env node
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

const ICONS = path.resolve(__dirname, '../assets/ico');

async function main() {
    // Trim the approved artwork's whitespace without redrawing its pencil strokes.
    const source = sharp(path.join(ICONS, 'ls-pencil-source.png'))
        .extract({ left: 262, top: 243, width: 760, height: 760 });
    const pngs = new Map();
    for (const size of [16, 32, 48, 180, 192, 512]) {
        pngs.set(size, await source.clone().resize(size, size).png().toBuffer());
    }
    for (const [name, size] of [
        ['favicon-16x16.png', 16], ['favicon-32x32.png', 32],
        ['apple-touch-icon.png', 180], ['android-chrome-192x192.png', 192],
        ['android-chrome-512x512.png', 512]
    ]) {
        await fs.writeFile(path.join(ICONS, name), pngs.get(size));
    }

    // ICO directory followed by PNG frames, supported by modern icon readers.
    const sizes = [16, 32, 48];
    const directory = Buffer.alloc(6 + sizes.length * 16);
    directory.writeUInt16LE(1, 2); // Icon, not cursor.
    directory.writeUInt16LE(sizes.length, 4);
    let offset = directory.length;
    for (const [index, size] of sizes.entries()) {
        const entry = 6 + index * 16;
        directory[entry] = directory[entry + 1] = size;
        directory.writeUInt16LE(1, entry + 4);
        directory.writeUInt16LE(24, entry + 6);
        directory.writeUInt32LE(pngs.get(size).length, entry + 8);
        directory.writeUInt32LE(offset, entry + 12);
        offset += pngs.get(size).length;
    }
    await fs.writeFile(path.join(ICONS, 'favicon.ico'), Buffer.concat([
        directory, ...sizes.map(size => pngs.get(size))
    ]));
    console.log('Generated LS pencil favicon, touch icon, and manifest icons.');
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
