const routes = {
    '/': '/content/intro.html',
    '/roadmap': '/content/roadmap.html',
    '/problem': '/content/problem.html',
    '/problems': '/content/allproblems.html'
};

function handleNavigation(path) {
    //cleanup previous window 
    console.log('--- Cleaning up previous route ---');
    try {
        window.currentCleanup();
    } catch (e) {
        console.error('Nothing to cleanup', e);
    }

    // Extract base path without query params
    const [basePath] = path.split('?');
    
    // Remove previous content
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
            let pageTitle = 'Quantapus';
            if (basePath === '/roadmap') {
                pageTitle = 'Roadmap'
                window.currentCleanup = initRoadmap();
            } else if (basePath === '/problem') {
                pageTitle = 'Problem'
                const urlParams = new URLSearchParams(window.location.search);
                const problemId = urlParams.get('id');
                window.currentCleanup = initProblem(problemId); 
            } else if (basePath === '/problems'){
                pageTitle = 'Problems'
                window.currentCleanup = initProblems();
            } else{
                window.currentCleanup = initBackground();
            }

            if (typeof gtag === 'function') {
                gtag('event', 'page_view', {
                    page_path: path,
                    page_title: pageTitle
                });
            }

            if (typeof clarity === 'function') {
                clarity('set', 'page', path);
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