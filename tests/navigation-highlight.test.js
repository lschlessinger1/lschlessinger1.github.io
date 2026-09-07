const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

test('tracks anchor offsets, manual scrolling, and a short final section', () => {
    const handlers = {};
    const window = { scrollY: 0, innerHeight: 900, addEventListener: (name, fn) => { handlers[name] = fn; } };
    const sections = [300, 550, 1300, 4000, 8000].map(top => ({
        getBoundingClientRect: () => ({ top: top - window.scrollY })
    }));
    const links = sections.map((_, i) => ({
        active: false,
        getAttribute: () => String(i),
        classList: { toggle: (name, value) => { links[i].active = value; } },
        setAttribute: (name, value) => { links[i].current = value; },
        removeAttribute: () => { delete links[i].current; }
    }));
    const document = {
        body: {}, documentElement: { scrollHeight: 8500 },
        getElementById: () => ({ querySelectorAll: () => links }),
        querySelector: id => sections[Number(id)]
    };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/js/navigation-highlight.js'), 'utf8'), {
        window, document,
        getComputedStyle: () => ({ scrollMarginTop: '76px' }),
        requestAnimationFrame: fn => fn(),
        ResizeObserver: class { observe() {} }
    });
    const active = () => links.flatMap((link, i) => link.active ? [i] : []);
    assert.deepEqual(active(), []);
    for (const [scrollY, expected] of [[1224, 2], [474, 1], [224, 0], [4500, 3], [7600, 4]]) {
        window.scrollY = scrollY;
        handlers.scroll();
        assert.deepEqual(active(), [expected]);
        assert.equal(links[expected].current, 'location');
        assert.equal(links.filter(link => link.current).length, 1);
    }
    window.scrollY = 0;
    handlers.pageshow();
    assert.deepEqual(active(), []);
});
