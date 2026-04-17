const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchData(type, retries = 3) {
    const container = document.getElementById(`${type}-container`);
    container.setAttribute('aria-busy', 'true');
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(`assets/data/${type}.json`);
            if (!response.ok) {
                console.error(`HTTP error! Status: ${response.status}`);
                if (attempt < retries) {
                    console.warn(`Retrying... (${attempt}/${retries})`);
                    await delay(2000);
                    continue;
                }
                showRetryError(container, type);
                container.setAttribute('aria-busy', 'false');
                return;
            }
            const data = await response.json();
            if (!Array.isArray(data)) {
                console.error(`Invalid JSON format: Expected an array for ${type}`);
                container.innerHTML = `<p class='text-danger'>Invalid ${type} data format.</p>`;
                container.setAttribute('aria-busy', 'false');
                return;
            }
            renderItems(data, type);
            container.setAttribute('aria-busy', 'false');
            return;
        } catch (error) {
            console.error(`Error loading ${type}:`, error);
            if (attempt < retries) {
                console.warn(`Retrying... (${attempt}/${retries})`);
                await delay(2000);
            } else {
                showRetryError(container, type);
                container.setAttribute('aria-busy', 'false');
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

// Build a WebP variant path for PNG/JPG sources. Every raster image in
// assets/img/ has a same-basename .webp sibling (see tools/generate-webp.js),
// so we emit the <source> unconditionally and rely on <picture> fallback.
function webpVariant(src) {
    return /\.(png|jpg|jpeg)$/i.test(src)
        ? src.replace(/\.(png|jpg|jpeg)$/i, '.webp')
        : null;
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function renderItems(items, type) {
    const container = document.getElementById(`${type}-container`);
    container.innerHTML = ""; // Clear existing content

    for (let i = 0; i < items.length; i += 2) {
        let rowHTML = '<div class="row card-row">';

        for (let j = 0; j < 2 && i + j < items.length; j++) {
            const item = items[i + j];
            if (!item.title || !item.description || !item.imgSrc || !item.link || !item.linkText) {
                console.warn(`Skipping invalid ${type} entry:`, item);
                continue;
            }
            const webp = webpVariant(item.imgSrc);
            const webpSource = webp
                ? `<source srcset="${encodeURI(webp)}" type="image/webp">`
                : '';
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
