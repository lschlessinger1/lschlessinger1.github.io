const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const SOURCE = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'main.js'), 'utf8');

function bootNavigation({ expanded = false, transition } = {}) {
    let hideCalls = 0;
    let collapseOptions;
    let link = {};
    let classes = new Set(transition ? ['collapsing'] : expanded ? ['show'] : []);
    let toggleExpanded = transition === 'opening' || expanded;

    class FakeElement extends EventTarget {
        closest(selector) {
            assert.equal(selector, 'a[href^="#"]');
            return link;
        }
    }

    const collapseEl = new FakeElement();
    collapseEl.classList = {
        contains: (className) => classes.has(className)
    };

    const document = {
        addEventListener(eventName, listener) {
            if (eventName === 'DOMContentLoaded') listener();
        },
        querySelector(selector) {
            assert.equal(selector, '[data-bs-target="#navbarCollapse"]');
            return {
                getAttribute(name) {
                    assert.equal(name, 'aria-expanded');
                    return String(toggleExpanded);
                }
            };
        },
        getElementById(id) {
            if (id === 'navbarCollapse') return collapseEl;
            if (id === 'main-navbar') return { querySelectorAll: () => [] };
            if (id === 'copyright-year') return { textContent: '' };
            return null;
        }
    };

    const window = {
        bootstrap: {
            Collapse: {
                getOrCreateInstance(element, options) {
                    assert.equal(element, collapseEl);
                    collapseOptions = options;
                    return { hide: () => { hideCalls += 1; } };
                }
            }
        }
    };

    vm.runInNewContext(SOURCE, { Date, document, Element: FakeElement, window });

    return {
        click({ internalLink = true } = {}) {
            link = internalLink ? {} : null;
            const event = new Event('click', { cancelable: true });
            collapseEl.dispatchEvent(event);
            return { collapseOptions, hideCalls, prevented: event.defaultPrevented };
        },
        finishOpening() {
            classes = new Set(['show']);
            toggleExpanded = true;
            collapseEl.dispatchEvent(new Event('shown.bs.collapse'));
            return { collapseOptions, hideCalls };
        }
    };
}

test('an expanded mobile menu closes without suppressing native fragment navigation', () => {
    const result = bootNavigation({ expanded: true }).click();

    assert.equal(result.collapseOptions.toggle, false);
    assert.equal(result.hideCalls, 1);
    assert.equal(result.prevented, false);
});

test('a collapsed navigation does not create a redundant Collapse instance', () => {
    const result = bootNavigation({ expanded: false }).click();

    assert.equal(result.collapseOptions, undefined);
    assert.equal(result.hideCalls, 0);
    assert.equal(result.prevented, false);
});

test('a section selected during opening closes after the transition without preventing navigation', () => {
    const navigation = bootNavigation({ transition: 'opening' });
    const result = navigation.click();

    assert.equal(result.hideCalls, 0);
    assert.equal(result.prevented, false);
    assert.equal(navigation.finishOpening().hideCalls, 1);
    assert.equal(navigation.finishOpening().hideCalls, 1, 'later openings stay open');
});

test('repeated section taps during opening queue only one close', () => {
    const navigation = bootNavigation({ transition: 'opening' });
    navigation.click();
    navigation.click();

    assert.equal(navigation.finishOpening().hideCalls, 1);
});

test('a section selected during closing does not close a later opening', () => {
    const navigation = bootNavigation({ transition: 'closing' });
    assert.equal(navigation.click().hideCalls, 0);
    assert.equal(navigation.finishOpening().hideCalls, 0);
});

test('clicks outside section links do not queue a close', () => {
    const navigation = bootNavigation({ transition: 'opening' });
    navigation.click({ internalLink: false });
    assert.equal(navigation.finishOpening().hideCalls, 0);
});
