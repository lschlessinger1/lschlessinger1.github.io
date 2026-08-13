const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const SOURCE = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'main.js'), 'utf8');

function bootNavigation({ expanded }) {
    let clickHandler;
    let hideCalls = 0;
    let collapseOptions;
    const link = {};

    class FakeElement {
        closest(selector) {
            assert.equal(selector, 'a[href^="#"]');
            return link;
        }
    }

    const collapseEl = {
        classList: {
            contains(className) {
                assert.equal(className, 'show');
                return expanded;
            }
        },
        addEventListener(eventName, listener) {
            assert.equal(eventName, 'click');
            clickHandler = listener;
        }
    };

    const document = {
        addEventListener(eventName, listener) {
            if (eventName === 'DOMContentLoaded') listener();
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
        click() {
            let prevented = false;
            clickHandler({
                target: new FakeElement(),
                preventDefault() { prevented = true; }
            });
            return { collapseOptions, hideCalls, prevented };
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
