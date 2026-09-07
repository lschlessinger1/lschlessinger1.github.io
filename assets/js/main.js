// Set the copyright year and keep the responsive navigation in sync.
// Project and research cards are pre-rendered into index.html at build time
// (see tools/build-content.js), so there is no client-side data fetching here.

document.addEventListener("DOMContentLoaded", () => {
    // Set copyright year without document.write()
    const yearEl = document.getElementById('copyright-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Let native fragment navigation manage focus, history, and reduced motion.
    // Bootstrap only needs help closing an expanded mobile menu after selection.
    const collapseEl = document.getElementById('navbarCollapse');
    const collapseToggle = document.querySelector('[data-bs-target="#navbarCollapse"]');
    const closeMenu = () => {
        window.bootstrap?.Collapse.getOrCreateInstance(collapseEl, { toggle: false }).hide();
    };
    collapseEl?.addEventListener('click', (event) => {
        if (!(event.target instanceof Element)) return;
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;

        if (collapseEl.classList.contains('show')) {
            closeMenu();
        } else if (collapseEl.classList.contains('collapsing') &&
                   collapseToggle?.getAttribute('aria-expanded') === 'true') {
            // Bootstrap ignores hide() during a transition. Close once opening
            // finishes; the same listener is deduplicated across repeated taps.
            collapseEl.addEventListener('shown.bs.collapse', closeMenu, { once: true });
        }
    });

    // Keep aria-current in sync with Bootstrap scrollspy active state
    document.addEventListener('activate.bs.scrollspy', () => {
        const navbar = document.getElementById('main-navbar');
        if (!navbar) return;
        for (const link of navbar.querySelectorAll('.nav-link')) {
            if (link.classList.contains('active')) {
                link.setAttribute('aria-current', 'location');
            } else {
                link.removeAttribute('aria-current');
            }
        }
    });
});
