const notyf = new Notyf();

const routes = {
    '/': '/content/intro.html',
    '/index.html': '/content/intro.html',
    '/roadmap': '/content/roadmap.html',
    '/problem': '/content/problem.html',
    '/problems': '/content/allproblems.html',
    '/account': '/content/account.html',
    '/privacy': '/content/privacy.html',
    '/terms': '/content/terms.html',
    '/contact': '/content/contact.html',
    '/admin': '/content/admin.html'
};

function handleNavigation(path) {
    //cleanup previous window 
    console.log('--- Cleaning up previous route ---');
    try {
        window.currentCleanup();
    } catch (e) {
        console.log('Nothing to cleanup', e);
    }

    // Extract base path without query params
    const [basePath] = path.split('?');
    
    // Remove previous content
    const container = document.getElementById('content-container');
    container.innerHTML = '';

    if (window.location.pathname + window.location.search !== path) {
        history.pushState({}, '', path);
    }

    const isKnown = basePath in routes;
    const fragment = isKnown
      ? routes[basePath]
      : '/content/404.html';

    // Load new content
    fetch(fragment)
      .then(r => r.text())
      .then(async html => {
        container.innerHTML = html;
        ;updateActiveNav(isKnown ? basePath : null);
            
            // Initialize based on route
            let pageTitle = isKnown
              ? 'Quantapus'
              : '404';
              if (isKnown) {
                // your existing inits
                if (basePath === '/roadmap') {
                  pageTitle = 'Roadmap';
                  window.currentCleanup = initRoadmap();
                } else if (basePath === '/problem') {
                  const id = new URLSearchParams(window.location.search).get('id');
                  pageTitle = `Problem #${id}`;
                  window.currentCleanup = initProblem(id);
                } else if (basePath === '/problems') {
                  pageTitle = 'Problems';
                  window.currentCleanup = await initProblems();
                } else if (basePath === '/account') {
                  pageTitle = 'Account';
                  window.currentCleanup = initAccount();
                } else if (basePath === '/privacy') {
                  pageTitle = 'Privacy Policy';
                } else if (basePath === '/terms') {
                  pageTitle = 'Terms Of Service';
                } else if (basePath === '/contact') {
                  pageTitle = 'Contact';
                } else if (basePath === '/admin') {
                  pageTitle = 'Admin';
                  window.currentCleanup = await initAdmin();
                }
                else {
                  window.currentCleanup = initBackground();
                }
              } else {
                window.currentCleanup = () => {};
              }
              
              if (basePath !== '/problem'){
                document.title = `${pageTitle}`;
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
// 1. Loads immediately on page load
async function loadProblems() {
    if (window.cachedProblems || window.loadProblemsLock) return;

    window.loadProblemsLock = true;

    try {
        const res = await fetch('https://api.quantapus.com/problems');
        const data = await res.json();
        if (res.status === 429){
            notyf.error('API Rate Limit Hit.');
            return;
        }
        window.cachedProblems = data;

        window.problemMap = {};
        data.forEach(p => window.problemMap[p.id] = p);
    } catch (e) {
        console.error('Failed to load public problem data:', e);
    } finally {
        window.loadProblemsLock = false;
    }
}


// 2. Loads after sign-in
async function loadCompletion() {
    if (!window.currentUser || window.completedSetPopulated) return;

    try {
        const token = await window.currentUser.getIdToken();
        const res = await fetch('https://api.quantapus.com/completed-problems', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const completedIds = await res.json();
        if (res.status === 429){
            notyf.error('API Rate Limit Hit.');
            return;
        }
        window.completedSet = new Set(completedIds);
        window.completedSetPopulated = true;
    } catch (e) {
        console.error('Failed to load user completion data:', e);
        notyf.error('Something went wrong.');
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
  
    try {
      const res = await fetch('https://api.quantapus.com/batch-toggle-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ changes })
      });
  
      if (res.status === 429) {
        notyf.error('API Rate Limit Hit.');
    } else if (!res.ok) {
        throw new Error('Network error');
      }
    } catch (err) {
      console.warn('[Toggle API] Batch request failed', err);
      notyf.error('Something went wrong.');
    }
  }
  

// Event listener for Headers + Footers
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
handleNavigation(window.location.pathname + window.location.search);
window.loadProblemsLock = false;
window.pendingToggles = {};
window.toggleDebounceTimer = null;
window.handleNavigation = handleNavigation;
window.toggleCompletion = toggleCompletion;
window.completedSet = new Set();
window.completedSetPopulated = false;
window.loadProblems = loadProblems;  
window.loadCompletion= loadCompletion;  

//handle dropdowns - globally initialized to reduce cleanup costs
document.addEventListener('click', e => {
    const btn = e.target.closest('.dropdown2');
    if (btn) {
        const menu = btn.nextElementSibling;

        if (btn.id === 'type-dropdown' && window.categoriesLoading) {
          menu.innerHTML = '<div class="loading-spinner"></div>';
        }
    
        menu.classList.toggle('show');
        return;
    }
  
    const item = e.target.closest('.dropdown-item');
    if (item) {
      const container = item.closest('.dropdown-container');
      const dropdown  = container.querySelector('.dropdown2');
      const value     = item.dataset.value;
  
      dropdown.textContent = value;
      dropdown.style.color = '';  
      if (dropdown.id === 'difficulty-dropdown') {
        if (value === 'Easy')   dropdown.style.color = '#48B572';
        if (value === 'Medium') dropdown.style.color = '#B5A848';
        if (value === 'Hard')   dropdown.style.color = '#B54848';
        window.selectedDifficulty = value;
        localStorage.setItem('selectedDifficulty', value);
      } else {
        if (value !== 'Types Of') dropdown.style.color = '#61a9f1';
        window.selectedCategory = value;
        localStorage.setItem('selectedCategory', value);
      }
  
      item.parentElement.classList.remove('show');
      window.dispatchEvent(new Event('filterChanged'));
      return;
    }
  
    if (!e.target.closest('.dropdown-container')) {
      document.querySelectorAll('.dropdown-menu.show')
              .forEach(m => m.classList.remove('show'));
    }
  });

  async function flushNow() {
    if (!window.currentUser || !Object.keys(window.pendingToggles).length) return;
    clearTimeout(window.toggleDebounceTimer);
    await flushToggleBatch();
  }
  
  window.addEventListener('beforeunload', flushNow);
  
  

  
