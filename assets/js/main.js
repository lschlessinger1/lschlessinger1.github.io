async function fetchProjects(retries = 3) {
    const projectsContainer = document.getElementById("projects-container");
    try {
        const response = await fetch(`assets/data/projects.json?t=${new Date().getTime()}`); // Cache busting
        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status}`);
            if (retries > 0) {
                console.warn(`Retrying... (${3 - retries + 1}/3)`);
                setTimeout(() => fetchProjects(retries - 1), 2000); // Retry with delay
                return;
            } else {
                projectsContainer.innerHTML = "<p class='text-danger'>Failed to load projects. Please try again later.</p>";
                return;
            }
        }
        const projects = await response.json();
        if (!Array.isArray(projects)) {
            console.error("Invalid JSON format: Expected an array of projects");
            projectsContainer.innerHTML = "<p class='text-danger'>Invalid project data format.</p>";
            return;
        }
        renderProjects(projects);
    } catch (error) {
        console.error('Error loading projects:', error);
        if (retries > 0) {
            console.warn(`Retrying... (${3 - retries + 1}/3)`);
            setTimeout(() => fetchProjects(retries - 1), 2000); // Retry with delay
        } else {
            projectsContainer.innerHTML = "<p class='text-danger'>Failed to load projects. Please try again later.</p>";
        }
    }
}

function renderProjects(projects) {
    const projectsContainer = document.getElementById("projects-container");
    projectsContainer.innerHTML = ""; // Clear existing content

    for (let i = 0; i < projects.length; i += 2) {
        let rowHTML = '<div class="row">';

        for (let j = 0; j < 2 && i + j < projects.length; j++) {
            const project = projects[i + j];
            if (!project.title || !project.description || !project.imgSrc || !project.link || !project.linkText) {
                console.warn("Skipping invalid project entry:", project);
                continue;
            }
            rowHTML += `
                <div class="col-md-5 ${j === 1 ? 'offset-md-2' : ''} bg-white mb-3">
                    <div class="img-container">
                        <picture>
                            <img alt="${project.imgAlt || 'Project image'}" class="border border-white"
                                 src="${project.imgSrc}" title="${project.title}" loading="lazy"/>
                        </picture>
                    </div>
                    <p class="text-muted"><span class="font-weight-bold">${project.title}</span>&nbsp;&nbsp;
                        ${project.description}</p>
                    <div class="container text-center btn-container">
                        <a class="btn btn-primary" href="${project.link}" target="_blank">${project.linkText}</a>
                    </div>
                </div>
            `;
        }

        rowHTML += '</div>';
        projectsContainer.insertAdjacentHTML("beforeend", rowHTML);
    }
}

document.addEventListener("DOMContentLoaded", () => fetchProjects().catch(
    error => console.error('Failed to fetch projects:', error)
));

$("#main-navbar ul li a[href^='#']").on('click', smoothScroll);
$("#main-navbar a.navbar-brand[href^='#']").on('click', smoothScroll);

function smoothScroll(e) {
    // prevent default anchor click behavior
    e.preventDefault();

    // store hash
    const hash = this.hash;

    // animate
    $('html, body').animate({
        scrollTop: $(hash).offset().top
    }, 1000, function () {

        // when done, add hash to url
        // (default click behaviour)
        window.location.hash = hash;
    });
}

