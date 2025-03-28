const routes = {
    '/': '/content/allproblems.html',
    '/roadmap': '/content/roadmap.html',
    '/problem': '/content/problem.html'
};

function handleNavigation(path) {
    // Extract base path without query params
    const [basePath] = path.split('?');
    
    // Clean up previous content
    const container = document.getElementById('content-container');
    container.innerHTML = '';

    if (window.location.pathname + window.location.search !== path) {
        history.pushState({}, '', path);
    }

    // Load new content
    fetch(routes[basePath] || routes['/'])
        .then(r => r.text())
        .then(html => {
            container.innerHTML = html;
            updateActiveNav(basePath);
            
            // Initialize based on route
            if (basePath === '/roadmap') {
                initRoadmap();
            } else if (basePath === '/problem') {
                // Get problem ID from URL
                const urlParams = new URLSearchParams(window.location.search);
                const problemId = urlParams.get('id');
                initProblem(problemId); // Make sure this exists in getproblem.js
            } else {
                initProblems();
            }
        });
}

// Event listener for All Problems & Roadmap
document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const path = new URL(e.target.href).pathname;
        handleNavigation(path);
    });
});

// Event listener for logo
document.querySelector('.logo-container').addEventListener('click', (e) => {
    e.preventDefault();
    const path = new URL(e.currentTarget.href).pathname;
    handleNavigation(path);
});

// History Updates
window.addEventListener('popstate', () => {
    const path = window.location.pathname + window.location.search;
    handleNavigation(path);
});

//update navbar
function updateActiveNav(currentPath) {
    document.querySelectorAll('.nav-item').forEach(link => {
        const linkPath = new URL(link.href).pathname;
        link.classList.toggle('active', linkPath === currentPath);
    });
}

// Initial load
handleNavigation(window.location.pathname);
window.handleNavigation = handleNavigation;