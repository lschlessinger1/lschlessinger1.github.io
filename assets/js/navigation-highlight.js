// Track section starts, rather than intersection ratios: the collections are
// much taller than About, and native anchor scrolling stops below the navbar.
(() => {
    const navbar = document.getElementById('main-navbar');
    const entries = [...navbar.querySelectorAll('.nav-link[href^="#"]')]
        .map(link => ({ link, section: document.querySelector(link.getAttribute('href')) }))
        .filter(entry => entry.section);
    let scheduled = false;

    function update() {
        scheduled = false;
        let current;
        for (const entry of entries) {
            const margin = parseFloat(getComputedStyle(entry.section).scrollMarginTop) || 0;
            if (entry.section.getBoundingClientRect().top <= margin + 2) current = entry;
        }
        // Short final sections cannot always reach the top of the viewport.
        if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
            current = entries.at(-1);
        }
        for (const entry of entries) {
            const active = entry === current;
            entry.link.classList.toggle('active', active);
            if (active) entry.link.setAttribute('aria-current', 'location');
            else entry.link.removeAttribute('aria-current');
        }
    }

    function schedule() {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(update);
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', schedule);
    window.addEventListener('pageshow', schedule);
    new ResizeObserver(schedule).observe(document.body);
    update();
})();
