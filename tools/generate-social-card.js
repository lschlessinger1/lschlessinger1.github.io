#!/usr/bin/env node

const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const SCROLL = path.join(ROOT, 'assets', 'img', 'scroll.webp');
const OUTPUT = path.join(ROOT, 'assets', 'img', 'social-card.png');

async function main() {
    const previewMask = Buffer.from('<svg width="410" height="138"><rect width="410" height="138" rx="10" fill="#fff"/></svg>');
    const scrollPreview = await sharp(SCROLL)
        .resize(410, 138, { fit: 'cover', position: 'centre' })
        .composite([{ input: previewMask, blend: 'dest-in' }])
        .png()
        .toBuffer();
    const svg = `
        <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="#071525"/>
                    <stop offset="1" stop-color="#194b7c"/>
                </linearGradient>
                <radialGradient id="glow" cx="0.82" cy="0.12" r="0.65">
                    <stop offset="0" stop-color="#8ed1fc" stop-opacity="0.28"/>
                    <stop offset="1" stop-color="#8ed1fc" stop-opacity="0"/>
                </radialGradient>
                <pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse">
                    <path d="M44 0H0V44" fill="none" stroke="#ffffff" stroke-opacity="0.055"/>
                </pattern>
            </defs>
            <rect width="1200" height="630" fill="url(#background)"/>
            <rect width="1200" height="630" fill="url(#glow)"/>
            <rect width="1200" height="630" fill="url(#grid)"/>

            <text x="78" y="102" fill="#8ed1fc" font-family="Segoe UI, sans-serif" font-size="19" font-weight="700" letter-spacing="3">MACHINE LEARNING ENGINEER &amp; RESEARCHER</text>
            <text x="74" y="242" fill="#f8fbff" font-family="Georgia, serif" font-size="92" font-weight="700">Lou</text>
            <text x="74" y="338" fill="#f8fbff" font-family="Georgia, serif" font-size="76" font-weight="700">Schlessinger</text>
            <text x="80" y="412" fill="#c9dbea" font-family="Segoe UI, sans-serif" font-size="25">Reasoning · Spatial cognition · Computer vision</text>
            <line x1="80" y1="468" x2="555" y2="468" stroke="#8ed1fc" stroke-width="3"/>
            <text x="80" y="516" fill="#f8fbff" font-family="Segoe UI, sans-serif" font-size="22" font-weight="700">2023 Vesuvius Challenge Grand Prize</text>
            <text x="80" y="550" fill="#c9dbea" font-family="Segoe UI, sans-serif" font-size="21">Runner-up team</text>

            <rect x="650" y="152" width="490" height="330" rx="24" fill="#050d17" fill-opacity="0.82" stroke="#ffffff" stroke-opacity="0.18"/>
            <text x="690" y="206" fill="#b9cfe1" font-family="Segoe UI, sans-serif" font-size="16" font-weight="700" letter-spacing="2">INK DETECTION · HERCULANEUM PAPYRI</text>
            <text x="690" y="430" fill="#f8fbff" font-family="Segoe UI, sans-serif" font-size="20" font-weight="700">Reading what survived.</text>
            <text x="690" y="458" fill="#9fb8cc" font-family="Segoe UI, sans-serif" font-size="16">louschlessinger.com</text>
        </svg>`;

    await sharp(Buffer.from(svg))
        .composite([{ input: scrollPreview, left: 690, top: 248 }])
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toFile(OUTPUT);

    console.log(`Generated ${path.relative(ROOT, OUTPUT)} (1200×630)`);
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
