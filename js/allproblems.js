window.categoriesLoading = false;

function generateCategoryDropdown(categories) {
  const categoryMenu = document.getElementById('type-menu');
  categoryMenu.innerHTML = ''; // Clear static/default items

  const defaultItem = document.createElement('div');
  defaultItem.className = 'dropdown-item';
  defaultItem.dataset.value = 'Types Of';
  defaultItem.textContent = 'Types Of';
  categoryMenu.appendChild(defaultItem);

  //sorted list of unique categories
  Array.from(categories).sort().forEach(category => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.dataset.value = category;
    item.textContent = category;
    categoryMenu.appendChild(item);
  });
}

window.initProblems = async function() {
  window.selectedDifficulty = localStorage.getItem('selectedDifficulty') || 'All';
  window.selectedCategory   = localStorage.getItem('selectedCategory')   || 'Types Of';

  // 2) Update the two dropdown buttons to match:
  const diffBtn = document.getElementById('difficulty-dropdown');
  diffBtn.textContent = window.selectedDifficulty;
  diffBtn.style.color  = ({
    Easy:   '#48B572',
    Medium: '#B5A848',
    Hard:   '#B54848',
  })[window.selectedDifficulty] || '';

  const typeBtn = document.getElementById('type-dropdown');
  typeBtn.textContent = window.selectedCategory;
  typeBtn.style.color = window.selectedCategory !== 'Types Of'
    ? '#61a9f1'
    : '';

  await fetchProblems();

  const resetBtn = document.querySelector('.reset-button');
  const resetHandler = (e) => {
    e.stopPropagation(); 
    resetFilters();
  };
  if (resetBtn) resetBtn.addEventListener('click', resetHandler);

  const onSignedIn = () => fetchProblems();
  window.addEventListener("userSignedIn", onSignedIn);

  const onFilter = () => filterProblems();
  window.addEventListener('filterChanged', onFilter);

  // Cleanup function
  return () => {
    resetBtn.removeEventListener('click', resetHandler);
    window.removeEventListener("userSignedIn", onSignedIn);
    window.removeEventListener("filterChanged", onFilter);
    delete window.selectedDifficulty;
    delete window.selectedCategory;
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
  const selectedDifficulty = window.selectedDifficulty;
  const selectedCategory = window.selectedCategory;
  let anyFound = false;

  document.querySelectorAll('.problem').forEach(problemDiv => {
    const difficulty = problemDiv.querySelector('.problem-difficulty').textContent;
    const category = problemDiv.getAttribute('data-category') || 'Unknown';

    const difficultyMatch = selectedDifficulty === 'All' || difficulty === selectedDifficulty;

    const categoryList = category.split(',').map(cat => cat.trim().toLowerCase());
    const normalizedSelectedCategory = selectedCategory.toLowerCase().trim();

    const categoryMatch = selectedCategory === 'Types Of' || categoryList.includes(normalizedSelectedCategory);

    const show = difficultyMatch && categoryMatch;
    problemDiv.style.display = show ? 'flex' : 'none';
    if (show) anyFound = true;
  });

  const errorElem = document.getElementById('no-problems-error');
  if (errorElem) {
    errorElem.style.display = anyFound ? 'none' : 'block';
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
      window.handleNavigation(`/problem?id=${problem.id}`);
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
  window.selectedCategory = 'Types Of';

  const difficultyDropdown = document.getElementById('difficulty-dropdown');
  const categoryDropdown = document.getElementById('type-dropdown');

  difficultyDropdown.textContent = 'All';
  difficultyDropdown.style.color = '';

  categoryDropdown.textContent = 'Types Of';
  categoryDropdown.style.color = '';

  localStorage.removeItem('selectedDifficulty');
  localStorage.removeItem('selectedCategory');

  filterProblems();
}

