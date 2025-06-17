window.categoriesLoading = false;

function generateCategoryDropdown(categories) {
  const categoryMenu = document.getElementById('type-menu');
  categoryMenu.innerHTML = '';

  // “Types Of” default
  const defaultItem = document.createElement('div');
  defaultItem.className = 'dropdown-item';
  defaultItem.dataset.value = 'Types Of';
  defaultItem.textContent = 'Types Of';
  defaultItem.addEventListener('click', () => {
    window.selectedCategory = 'Types Of';
    const btn = document.getElementById('type-dropdown');
    btn.textContent = 'Types Of';
    btn.style.color = '';
    window.dispatchEvent(new Event('filterChanged'));
  });
  categoryMenu.appendChild(defaultItem);

  // real categories
  Array.from(categories).sort().forEach(cat => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.dataset.value = cat;
    item.textContent = cat;
    item.addEventListener('click', () => {
      window.selectedCategory = cat;
      const btn = document.getElementById('type-dropdown');
      btn.textContent = cat;
      btn.style.color = '#61a9f1';
      window.dispatchEvent(new Event('filterChanged'));
    });
    categoryMenu.appendChild(item);
  });
}

function generateDifficultyDropdown() {
  const diffMenu = document.getElementById('difficulty-menu');
  diffMenu.innerHTML = '';
  ['All','Easy','Medium','Hard'].forEach(level => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.dataset.value = level;
    item.textContent = level;
    item.addEventListener('click', () => {
      window.selectedDifficulty = level;
      const btn = document.getElementById('difficulty-dropdown');
      btn.textContent = level;
      btn.style.color = ({Easy:'#48B572',Medium:'#B5A848',Hard:'#B54848'})[level]||'';
      window.dispatchEvent(new Event('filterChanged'));
    });
    diffMenu.appendChild(item);
  });
}


window.initProblems = async function() {
  const params = new URLSearchParams(location.search);
  window.selectedDifficulty = params.get('difficulty') || 'All';
  window.selectedCategory   = params.get('category')   || 'Types Of';

  // sync dropdown buttons
  const diffBtn = document.getElementById('difficulty-dropdown');
  diffBtn.textContent = window.selectedDifficulty;
  diffBtn.style.color  = ({Easy:'#48B572',Medium:'#B5A848',Hard:'#B54848'})[window.selectedDifficulty]||'';

  const typeBtn = document.getElementById('type-dropdown');
  typeBtn.textContent = window.selectedCategory;
  typeBtn.style.color = window.selectedCategory !== 'Types Of' ? '#61a9f1' : '';

  await fetchProblems();

  document.querySelector('.reset-button')
    .addEventListener('click', resetFilters);

  window.addEventListener("userSignedIn", () => fetchProblems());
  window.addEventListener('filterChanged', () => filterProblems());

  return () => {
    window.removeEventListener("userSignedIn", fetchProblems);
    window.removeEventListener("filterChanged", filterProblems);
  };
};

// Fetch problems from the backend
async function fetchProblems() {
  window.categoriesLoading = true;           
  const problemsContainer = document.getElementById('problems-container');
  problemsContainer.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div></div>';

  try {
    await window.loadProblems();
    const problems = window.cachedProblems;

    const categories = new Set();
    problems.forEach(problem => {
      if (problem.category) {
        problem.category.split(',').forEach(cat => categories.add(cat.trim()));
      }
    });

    generateCategoryDropdown(categories);
    generateDifficultyDropdown()
    window.categoriesLoading = false;

    renderProblems(problems);

    if (window.currentUser) {
      updateCompletedProblems();  
    }

  } catch (error) {
    console.error('Error fetching problems:', error);
    renderError('Failed to load problems. Please try again later.');
  }
}

function updateCompletedProblems() {
  const checkmarkSelector = '.problem .checkmark';

  if (!window.currentUser || !window.completedSet) {
    // Clear checkmarks if not signed in or no cache
    document.querySelectorAll(checkmarkSelector).forEach(checkmark => {
      checkmark.classList.remove('completed');
    });
    return;
  }

  document.querySelectorAll('.problem').forEach(problemDiv => {
    const problemId = Number(problemDiv.querySelector('.problem-id').textContent.replace("#", ""));
    const checkmark = problemDiv.querySelector('.checkmark');

    checkmark.classList.toggle('completed', window.completedSet.has(problemId));
  });
}

function filterProblems() {
  const sd = window.selectedDifficulty;
  const sc = window.selectedCategory;
  let any = false;

  document.querySelectorAll('.problem').forEach(div => {
    const diff = div.querySelector('.problem-difficulty').textContent;
    const cats = (div.dataset.category || '')
      .split(',')
      .map(c => c.trim());

    const okDiff = sd === 'All' || diff === sd;
    const okCat  = sc === 'Types Of' || cats.includes(sc);
    const show   = okDiff && okCat;

    div.style.display = show ? 'flex' : 'none';
    if (show) any = true;
  });

  const err = document.getElementById('no-problems-error');
  if (err) err.style.display = any ? 'none' : 'block';

  if (sd === 'All' && sc === 'Types Of') {
    history.replaceState(null, '', location.pathname);
  } else {
    const params = new URLSearchParams();
    if (sc !== 'Types Of')   params.set('category',   sc);
    if (sd !== 'All')         params.set('difficulty', sd);
    history.replaceState(null, '', `${location.pathname}?${params.toString()}`);
  }
}


// Render problems in the DOM
function renderProblems(problems) {
  const problemsContainer = document.getElementById('problems-container');
  problemsContainer.innerHTML = '';

  if (!problems || problems.length === 0) {
    problemsContainer.innerHTML = '<p>No problems found.</p>';
    return;
  }

  problems.forEach(problem => {
    const problemDiv = document.createElement('div');
    const problemLeft = document.createElement('div');
    const checkmarkBox = document.createElement('div');
    const checkmark = document.createElement('span');
    const problemId = document.createElement('span');
    const problemName = document.createElement('span');
    const problemDifficulty = document.createElement('span');

    // Set classes/attributes
    problemDiv.className = 'problem';
    problemDiv.setAttribute('data-category', problem.category || 'Unknown');

    problemLeft.className = 'problem-left';

    checkmarkBox.className = 'checkmark-box';
    checkmark.className = 'checkmark';

    problemId.className = 'problem-id';
    problemId.textContent = `#${problem.id}`;

    problemName.className = 'problem-name';
    problemName.textContent = problem.title || 'Untitled';

    problemDifficulty.className = `problem-difficulty ${problem.difficulty?.toLowerCase() || 'unknown'}`;
    problemDifficulty.textContent = problem.difficulty || 'Unknown';

    // Build hierarchy
    checkmarkBox.appendChild(checkmark);
    problemLeft.append(checkmarkBox, problemId, problemName);
    problemDiv.append(problemLeft, problemDifficulty);

    if (problem.completed) {
      checkmark.classList.add('completed');
    }

    // Add interactions
    checkmarkBox.addEventListener('click', (e) => {
      e.stopPropagation();
      const nowCompleted = window.toggleCompletion(problem.id);
      checkmark.classList.toggle('completed', nowCompleted);
    });
    
    

    problemDiv.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.removeItem('roadmapCtx');
    
      // grab any existing filters
      const orig = new URLSearchParams(location.search);
      const difficulty = orig.get('difficulty');
      const category   = orig.get('category');
    
      // build a new params object in the exact order you want
      const params = new URLSearchParams();
      params.set('id',   problem.id);
      params.set('list', 'all');
      if (difficulty) params.set('difficulty', difficulty);
      if (category)   params.set('category',   category);
    
      window.handleNavigation(`/problem?${params.toString()}`);
  });

    problemsContainer.appendChild(problemDiv);
  });

  // After rendering, apply the current filters
  filterProblems();

}

// Render an error message
function renderError(message) {
  const errorElem = document.getElementById('no-problems-error');
  if (errorElem) {
    errorElem.textContent = message;
    errorElem.style.display = 'block';
  }
}

function resetFilters() {
  window.selectedDifficulty = 'All';
  window.selectedCategory   = 'Types Of';

  const diffBtn = document.getElementById('difficulty-dropdown');
  diffBtn.textContent = 'All';
  diffBtn.style.color = '';

  const typeBtn = document.getElementById('type-dropdown');
  typeBtn.textContent = 'Types Of';
  typeBtn.style.color = '';

  history.replaceState(null, '', location.pathname);

  filterProblems();
}



