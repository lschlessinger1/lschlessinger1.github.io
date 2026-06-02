// Set the copyright year and wire up in-page navigation behavior.
// Project and research cards are pre-rendered into index.html at build time
// (see tools/build-content.js), so there is no client-side data fetching here.

document.addEventListener("DOMContentLoaded", () => {
    // Set copyright year without document.write()
    const yearEl = document.getElementById('copyright-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Native smooth scrolling is handled via CSS (scroll-behavior: smooth).
    // Delegate clicks on in-page anchors so we can respect reduced-motion.
    document.getElementById('main-navbar')?.addEventListener('click', (ev) => {
        const target = ev.target;
        if (target && target.closest) {
            const link = target.closest('a[href^="#"]');
            if (link) {
                const id = link.getAttribute('href');
                if (id && id.startsWith('#')) {
                    const el = document.querySelector(id);
                    if (el) {
                        ev.preventDefault();
                        // If user prefers reduced motion, jump instantly
                        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                        if (prefersReduced) {
                            el.scrollIntoView();
                        } else {
                            el.scrollIntoView({ behavior: 'smooth' });
                        }
                        history.replaceState(null, '', id);
                    }
                }
            }
        }
    });

    // Keep aria-current in sync with Bootstrap scrollspy active state
    document.addEventListener('activate.bs.scrollspy', () => {
        const navbar = document.getElementById('main-navbar');
        if (!navbar) return;
        for (const link of navbar.querySelectorAll('.nav-link')) {
            if (link.classList.contains('active')) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        }
    });
});
