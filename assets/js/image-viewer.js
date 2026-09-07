const viewer = document.getElementById('image-viewer');
const viewerImage = document.getElementById('viewer-image');
let imageOpener;
let previousOverflow;
let openRequest = 0;

document.addEventListener('click', async (event) => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest('a[data-image]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    const request = ++openRequest;
    imageOpener = link;
    document.getElementById('image-viewer-title').textContent = link.dataset.title;
    viewerImage.alt = link.dataset.alt;
    viewerImage.style.visibility = 'hidden';
    viewerImage.src = link.href;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    viewer.showModal();
    try {
        await viewerImage.decode();
        if (!viewer.open || request !== openRequest) return;
        viewerImage.style.visibility = 'visible';
    } catch {
        if (viewer.open && request === openRequest) {
            viewerImage.style.visibility = 'visible';
        }
    }
});

document.getElementById('close-image').addEventListener('click', () => viewer.close());
viewer.addEventListener('close', () => {
    openRequest++;
    document.body.style.overflow = previousOverflow;
    imageOpener?.focus({ preventScroll: true });
});
viewer.addEventListener('click', (event) => {
    if (event.target !== viewer) return;
    const rect = viewer.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) viewer.close();
});

