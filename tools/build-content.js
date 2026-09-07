#!/usr/bin/env node
/*
 * Pre-render the project and research cards from their JSON sources into
 * static HTML inside index.html, and emit JSON-LD structured data for each
 * work. Generated content lives between marker comments
 * (<!-- build:<type>:start --> ... <!-- build:<type>:end -->) so the script
 * is idempotent: re-running replaces the content between the markers.
 *
 * Run `npm run build` after editing assets/data/*.json. CI fails if the
 * committed index.html is out of sync with the JSON (see ci.yml).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');
const SIZES = '(max-width: 768px) 100vw, 600px';
const SITE = 'https://louschlessinger.com/';
const PERSON_ID = 'https://louschlessinger.com/#person';

const SOURCES = [
    { type: 'research', json: path.join(ROOT, 'assets', 'data', 'research.json') },
    { type: 'projects', json: path.join(ROOT, 'assets', 'data', 'projects.json') }
];

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// URL-encode (mirrors the client's encodeURI) then make it attribute-safe.
function attrUrl(value) {
    return escapeHtml(encodeURI(String(value)));
}

// PNG/JPG sources have a same-basename .webp sibling (see generate-webp.js).
function webpVariant(src) {
    return /\.(png|jpe?g)$/i.test(src) ? src.replace(/\.(png|jpe?g)$/i, '.webp') : null;
}

function indent(block, spaces) {
    const pad = ' '.repeat(spaces);
    return block.split('\n').map(line => (line.length ? pad + line : line)).join('\n');
}

function isValid(item) {
    return Boolean(item && item.title && item.description && item.imgSrc && item.link && item.linkText);
}

function renderMedia(item, featured) {
    const title = escapeHtml(item.title);
    const alt = escapeHtml(item.imgAlt || item.title);
    const src = attrUrl(item.imgSrc);
    let visual;
    if (item.imageViewBox) {
        visual = `<svg viewBox="${escapeHtml(item.imageViewBox)}" role="img" aria-label="${alt}"><image href="${src}" width="${Number(item.imageWidth)}" height="${Number(item.imageHeight)}"/></svg>`;
    } else {
        // Thumbnail and enlargement may use different assets; keep the original
        // out of image sources so it is fetched only when the visitor opens it.
        const thumbnail = item.thumbnailSrc || item.imgSrc;
        const webp = webpVariant(thumbnail);
        const source = webp && fs.existsSync(path.join(ROOT, webp))
            ? `<source srcset="${attrUrl(webp)}" type="image/webp">` : '';
        visual = `<picture>${source}<img src="${attrUrl(thumbnail)}" alt="${alt}" width="600" height="340" loading="lazy" decoding="async" sizes="${SIZES}"></picture>`;
    }
    return `<a class="${featured ? 'featured' : 'collection'}-media result-image ${escapeHtml(item.imageClass || '')}" href="${src}" data-image data-title="${title}" data-alt="${alt}" aria-label="Enlarge image: ${title}">${visual}<span class="enlarge-image" aria-hidden="true">Enlarge</span></a>`;
}

function renderCard(item, featured = false) {
    const prefix = featured ? 'featured' : 'collection';
    const content = featured ? item.featured : item;
    const id = !featured && item.id ? ` id="${escapeHtml(item.id)}"` : '';
    return `<article class="${prefix}-card"${id}>
    ${renderMedia(item, featured)}
    <div class="${prefix}-body">
        <h3>${escapeHtml(item.title)}</h3>
        <p class="${prefix}-description">${escapeHtml(content.description)}</p>
        <a class="${prefix}-action" href="${attrUrl(item.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(content.linkText)}<span class="visually-hidden">: ${escapeHtml(item.title)} (opens in a new tab)</span></a>
    </div>
</article>`;
}

// Map a work's link to a schema.org type: papers (.pdf) -> ScholarlyArticle,
// code hosts -> SoftwareSourceCode, everything else -> CreativeWork.
function workType(link) {
    if (/\.pdf(?:$|[?#])/i.test(link)) return 'ScholarlyArticle';
    if (/^https?:\/\/(www\.)?github\.com\//i.test(link) || /^https?:\/\/huggingface\.co\//i.test(link)) {
        return 'SoftwareSourceCode';
    }
    return 'CreativeWork';
}

// JSON-LD @graph of every work, each authored by the Person entity (#person).
function renderWorksJsonLd(items) {
    const graph = items.filter(isValid).map(item => ({
        '@type': workType(item.link),
        name: item.title,
        description: item.description,
        url: item.link,
        image: SITE + item.imgSrc,
        author: { '@id': PERSON_ID }
    }));
    // Escape "<" so nothing in the data can break out of the <script> element.
    const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 4)
        .replace(/</g, '\\u003c');
    return `<script type="application/ld+json">\n${json}\n</script>`;
}

function inject(html, type, rendered, eol, indentSpaces = 16) {
    const start = `<!-- build:${type}:start -->`;
    const end = `<!-- build:${type}:end -->`;
    const re = new RegExp(`(${start})[\\s\\S]*?(${end})`);
    if (!re.test(html)) {
        throw new Error(`Missing "${start} ... ${end}" markers in index.html`);
    }
    const pad = ' '.repeat(indentSpaces);
    const body = indent(rendered, indentSpaces).split('\n').join(eol);
    // Function replacement avoids `$` in content being treated as a token.
    return html.replace(re, (match, openMarker) => `${openMarker}${eol}${body}${eol}${pad}${end}`);
}

function main() {
    let html = fs.readFileSync(INDEX, 'utf8');
    const eol = html.includes('\r\n') ? '\r\n' : '\n';
    const allWorks = [];

    for (const { type, json } of SOURCES) {
        const data = JSON.parse(fs.readFileSync(json, 'utf8'));
        if (!Array.isArray(data)) {
            throw new Error(`Expected an array in ${path.relative(ROOT, json)}`);
        }
        const skipped = data.length - data.filter(isValid).length;
        if (skipped > 0) {
            console.warn(`Skipped ${skipped} invalid ${type} entr${skipped === 1 ? 'y' : 'ies'} (missing required fields)`);
        }
        const rendered = data.filter(isValid).map(item => renderCard(item)).join('\n');
        html = inject(html, type, rendered, eol);
        allWorks.push(...data);
    }

    html = inject(html, 'selected', allWorks.filter(item => item.featured).map(item => renderCard(item, true)).join('\n'), eol);
    html = inject(html, 'works-jsonld', renderWorksJsonLd(allWorks), eol, 8);

    fs.writeFileSync(INDEX, html);
    console.log('Rendered cards + structured data into index.html');
}

main();
