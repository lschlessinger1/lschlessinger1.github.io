async function fetchData(type, retries = 3) {
    const container = document.getElementById(`${type}-container`);
    try {
        const response = await fetch(`assets/data/${type}.json?t=${new Date().getTime()}`); // Cache busting
        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status}`);
            if (retries > 0) {
                console.warn(`Retrying... (${3 - retries + 1}/3)`);
                setTimeout(() => fetchData(type, retries - 1), 2000); // Retry with delay
                return;
            } else {
                container.innerHTML = `<p class='text-danger'>Failed to load ${type}. Please try again later.</p>`;
                return;
            }
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            console.error(`Invalid JSON format: Expected an array for ${type}`);
            container.innerHTML = `<p class='text-danger'>Invalid ${type} data format.</p>`;
            return;
        }
        renderItems(data, type);
    } catch (error) {
        console.error(`Error loading ${type}:`, error);
        if (retries > 0) {
            console.warn(`Retrying... (${3 - retries + 1}/3)`);
            setTimeout(() => fetchData(type, retries - 1), 2000); // Retry with delay
        } else {
            container.innerHTML = `<p class='text-danger'>Failed to load ${type}. Please try again later.</p>`;
        }
    }
}

function renderItems(items, type) {
    const container = document.getElementById(`${type}-container`);
    container.innerHTML = ""; // Clear existing content

    for (let i = 0; i < items.length; i += 2) {
        let rowHTML = '<div class="row">';

        for (let j = 0; j < 2 && i + j < items.length; j++) {
            const item = items[i + j];
            if (!item.title || !item.description || !item.imgSrc || !item.link || !item.linkText) {
                console.warn(`Skipping invalid ${type} entry:`, item);
                continue;
            }
            rowHTML += `
                <div class="col-md-5 ${j === 1 ? 'offset-md-2' : ''} bg-white mb-3">
                    <div class="img-container">
                        <picture>
                            <img alt="${item.imgAlt || 'Image'}" class="border border-white"
                                 src="${item.imgSrc}" title="${item.title}" loading="lazy"/>
                        </picture>
                    </div>
                    <p class="text-muted"><span class="fw-bold">${item.title}</span>&nbsp;&nbsp;
                        ${item.description}</p>
                    <div class="container text-center btn-container">
                        <a class="btn btn-primary" href="${item.link}" target="_blank" rel="noopener noreferrer">${item.linkText}</a>
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
});

$("#main-navbar ul li a[href^='#']").on('click', smoothScroll);
$("#main-navbar a.navbar-brand[href^='#']").on('click', smoothScroll);

function smoothScroll(e) {
    e.preventDefault();
    const hash = this.hash;
    $('html, body').animate({
        scrollTop: $(hash).offset().top
    }, 1000, function () {
        window.location.hash = hash;
    });
}
