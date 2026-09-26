const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('index.html');
const site = 'https://louschlessinger.com/';
const works = ['research', 'projects'].flatMap(type => JSON.parse(read(`assets/data/${type}.json`)));
const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(([, json]) => JSON.parse(json));
const decode = value => value.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');

function meta(name) {
    const tag = [...html.matchAll(/<meta\s[^>]+>/g)].map(([tag]) => tag)
        .find(tag => tag.includes(`name="${name}"`) || tag.includes(`property="${name}"`));
    assert.ok(tag, `Missing ${name}`);
    return decode(tag.match(/content="([^"]*)"/)[1]);
}

test('production page is indexable with one H1 and consistent search/share metadata', () => {
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
    assert.match(html, /<link rel="canonical" href="https:\/\/louschlessinger\.com\/">/);
    assert.doesNotMatch(meta('robots'), /noindex|nofollow/);
    const title = decode(html.match(/<title>([^<]+)<\/title>/)[1]);
    assert.equal(meta('og:title'), title);
    assert.equal(meta('twitter:title'), title);
    assert.equal(meta('og:description'), meta('description'));
    assert.equal(meta('twitter:description'), meta('description'));
    assert.ok(meta('description').length > 0);
    assert.equal(meta('og:url'), site);
    assert.match(read('robots.txt'), /Sitemap: https:\/\/louschlessinger\.com\/sitemap.xml/);
    assert.doesNotMatch(read('robots.txt'), /^Disallow:\s*\/\s*$/m);
});

test('work metadata points to unique rendered cards and the real profile author', () => {
    const profile = schemas.find(schema => schema['@type'] === 'ProfilePage');
    const graph = schemas.find(schema => schema['@graph'])['@graph'];
    assert.equal(profile.name, decode(html.match(/<title>([^<]+)<\/title>/)[1]));
    assert.equal(profile.mainEntity['@id'], `${site}#person`);
    assert.equal(graph.length, works.length);
    assert.equal(new Set(graph.map(work => work['@id'])).size, works.length);
    for (const work of graph) {
        const id = new URL(work['@id']).hash.slice(1);
        assert.equal(html.split(`id="${id}"`).length - 1, 1, `Unique anchor for ${work.name}`);
        assert.equal(work.author['@id'], profile.mainEntity['@id']);
        assert.ok(fs.existsSync(path.join(root, work.image.slice(site.length))));
    }
});

test('sitemap includes all same-domain demos and excludes external links and fragments', () => {
    const sitemap = read('sitemap.xml');
    const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => decode(url));
    const expected = [site, ...works.map(work => work.link).filter(link => new URL(link).origin === new URL(site).origin)];
    assert.deepEqual(new Set(urls), new Set(expected));
    assert.equal(new Set(urls).size, urls.length);
    for (const url of urls) assert.equal(new URL(url).hash, '');
});

test('large detail images remain click targets, not eager SVG or full-resolution thumbnails', () => {
    assert.doesNotMatch(html, /<image\s/);
    assert.doesNotMatch(html, /<link[^>]+patch_agg\.webp/);
    for (const item of works.filter(item => item.thumbnailSrc)) {
        assert.ok(fs.existsSync(path.join(root, item.thumbnailSrc)));
        assert.ok(fs.statSync(path.join(root, item.thumbnailSrc)).size < 150 * 1024);
        assert.ok(html.includes(`href="${item.imgSrc}" data-image`));
        assert.ok(html.includes(`src="${item.thumbnailSrc}"`));
        assert.ok(!html.includes(`src="${item.imgSrc}"`));
    }
});
