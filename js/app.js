const notyf = new Notyf();

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
        });
}

//preload global data once
async function apiCalls() {
    if (window.apiCallsLock) return;
    window.apiCallsLock = true;      

    try {
        if (!window.cachedProblems) {
            const res = await fetch('https://api.quantapus.com/problems');
            const data = await res.json();
            window.cachedProblems = data;

            // Map for quick access
            window.problemMap = {};
            data.forEach(p => window.problemMap[p.id] = p);
        }

        if (window.currentUser && !window.completedSet) {
            const token = await window.currentUser.getIdToken();
            const res = await fetch('https://api.quantapus.com/completed-problems', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const completedIds = await res.json();
            window.completedSet = new Set(completedIds);
        }
    } catch (e) {
        console.error('apiCalls error:', e);
    } finally {
        window.apiCallsLock = false;
    }
}

window.toggleCompletion = function(problemId) {
    if (!window.currentUser) {
      notyf.error("Sign In to Track Progress");
      return false;
    }
  
    const id = Number(problemId);
    const isCompleted = window.completedSet.has(id);
  
    // Update local UI state
    if (isCompleted) {
      window.completedSet.delete(id);
      window.pendingToggles[id] = false;
    } else {
      window.completedSet.add(id);
      window.pendingToggles[id] = true;
    }
  
    // Debounce the network call
    if (window.toggleDebounceTimer) {
      clearTimeout(window.toggleDebounceTimer);
    }
  
    window.toggleDebounceTimer = setTimeout(() => {
      flushToggleBatch();
    }, 1000);
  
    return !isCompleted;
  };
  

  async function flushToggleBatch() {
    const changes = { ...window.pendingToggles };
    window.pendingToggles = {};
  
    if (!window.currentUser || Object.keys(changes).length === 0) return;
  
    const token = await window.currentUser.getIdToken();
    console.log('[Toggle API] Flushing batch:', changes);
  
    fetch('https://api.quantapus.com/batch-toggle-complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ changes })
    }).catch(err => {
      console.warn('[Toggle API] Batch request failed', err);
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
window.apiCallsLock = false;
apiCalls();
handleNavigation(window.location.pathname);
window.pendingToggles = {};
window.toggleDebounceTimer = null;
window.handleNavigation = handleNavigation;
window.toggleCompletion = toggleCompletion;
window.pendingCompletions = new Set();
window.apiCalls = apiCalls;  
  
