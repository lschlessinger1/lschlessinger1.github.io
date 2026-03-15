const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchData(type, retries = 3) {
    const container = document.getElementById(`${type}-container`);
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(`assets/data/${type}.json?t=${new Date().getTime()}`);
            if (!response.ok) {
                console.error(`HTTP error! Status: ${response.status}`);
                if (attempt < retries) {
                    console.warn(`Retrying... (${attempt}/${retries})`);
                    await delay(2000);
                    continue;
                }
                showRetryError(container, type);
                return;
            }
            const data = await response.json();
            if (!Array.isArray(data)) {
                console.error(`Invalid JSON format: Expected an array for ${type}`);
                container.innerHTML = `<p class='text-danger'>Invalid ${type} data format.</p>`;
                return;
            }
            renderItems(data, type);
            return;
        } catch (error) {
            console.error(`Error loading ${type}:`, error);
            if (attempt < retries) {
                console.warn(`Retrying... (${attempt}/${retries})`);
                await delay(2000);
            } else {
                showRetryError(container, type);
            }
        }
    }
}

function showRetryError(container, type) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'text-center';
    const msg = document.createElement('p');
    msg.className = 'text-danger';
    msg.textContent = `Failed to load ${type}. Please try again later.`;
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline-primary btn-sm mt-2';
    btn.textContent = 'Retry';
    btn.addEventListener('click', () => fetchData(type));
    wrapper.appendChild(msg);
    wrapper.appendChild(btn);
    container.appendChild(wrapper);
}

// Cache for webp availability checks to avoid repeated network calls
const webpAvailabilityCache = new Map();

async function isWebpAvailable(originalSrc) {
    if (!/\.(png|jpg|jpeg)$/i.test(originalSrc)) return false; // Already webp or unsupported
    const candidate = originalSrc.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    if (webpAvailabilityCache.has(candidate)) {
        return webpAvailabilityCache.get(candidate);
    }
    try {
        const resp = await fetch(candidate, { method: 'HEAD' });
        const ok = resp.ok;
        webpAvailabilityCache.set(candidate, ok);
        return ok;
    } catch {
        // Optional WebP support: treat network failures as a miss but surface details in dev when enabled.
        if (window?.DEBUG) {
            console.debug('WebP availability check failed for', candidate);
        }
        webpAvailabilityCache.set(candidate, false);
        return false;
    }
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

async function renderItems(items, type) {
    const container = document.getElementById(`${type}-container`);
    container.innerHTML = ""; // Clear existing content

    // Precompute webp availability in parallel for all items
    const availability = await Promise.all(items.map(it => isWebpAvailable(it.imgSrc)));

    for (let i = 0; i < items.length; i += 2) {
        let rowHTML = '<div class="row">';

        for (let j = 0; j < 2 && i + j < items.length; j++) {
            const item = items[i + j];
            if (!item.title || !item.description || !item.imgSrc || !item.link || !item.linkText) {
                console.warn(`Skipping invalid ${type} entry:`, item);
                continue;
            }
            // Derive a potential WebP variant path (assumes same basename with .webp present in repo)
            // If the original already ends with .webp, we won't insert an extra source.
            let webpSource = '';
            if (availability[i + j]) {
                const candidateWebp = item.imgSrc.replace(/\.(png|jpg|jpeg)$/i, '.webp');
                webpSource = `<source srcset="${encodeURI(candidateWebp)}" type="image/webp">`;
            }
            // Performance hints: first row gets higher priority; others remain lazy & low priority
            const isAboveFoldLikely = i === 0; // heuristic: first rendered row
            const loadingAttr = isAboveFoldLikely ? 'loading="eager"' : 'loading="lazy"';
            const fetchPriority = isAboveFoldLikely ? 'high' : 'low';
            const sizesAttr = '(max-width: 768px) 100vw, 600px';
            const safeTitle = escapeHTML(item.title);
            const safeDesc = escapeHTML(item.description);
            const safeAlt = escapeHTML(item.imgAlt || 'Image');
            const safeSrc = encodeURI(item.imgSrc);
            const safeLink = encodeURI(item.link);
            const safeLinkText = escapeHTML(item.linkText);
            rowHTML += `
                <div class="col-md-5 ${j === 1 ? 'offset-md-2' : ''} mb-3">
                    <div class="project-card">
                        <div class="img-container">
                            <picture>
                                ${webpSource}
                           <img alt="${safeAlt}"
                               src="${safeSrc}" title="${safeTitle}" ${loadingAttr} width="600" height="300" decoding="async" fetchpriority="${fetchPriority}" sizes="${sizesAttr}"/>
                            </picture>
                        </div>
                        <div class="card-body-inner">
                            <p class="text-muted"><span class="fw-bold">${safeTitle}</span>&nbsp;&nbsp;
                                ${safeDesc}</p>
                            <div class="container text-center btn-container">
                                <a class="btn btn-primary" href="${safeLink}" target="_blank" rel="noopener noreferrer">${safeLinkText}</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        rowHTML += '</div>';
        container.insertAdjacentHTML("beforeend", rowHTML);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchData("projects").catch(error => console.error('Failed to fetch projects:', error));
    fetchData("research").catch(error => console.error('Failed to fetch research:', error));

    // Set copyright year without document.write()
    const yearEl = document.getElementById('copyright-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Native smooth scrolling handled via CSS (scroll-behavior: smooth)
    // Add click delegation for in-page anchors to respect reduced motion preference
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
