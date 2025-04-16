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
  let clickHandler = null;

  // --- RESTORE FILTERS FROM LOCAL STORAGE OR USE DEFAULTS ---
  window.selectedDifficulty = localStorage.getItem('selectedDifficulty') || 'All';
  window.selectedCategory = localStorage.getItem('selectedCategory') || 'Types Of';

  const difficultyDropdown = document.getElementById('difficulty-dropdown');
  const categoryDropdown = document.getElementById('type-dropdown');

  const resetButton = document.querySelector('.reset-button');
  const resetHandler = () => resetFilters();
  if (resetButton) {
    resetButton.addEventListener('click', resetHandler);
  }

  // Difficulty dropdown text/color
  if (window.selectedDifficulty !== 'All') {
    difficultyDropdown.textContent = window.selectedDifficulty;
    if (window.selectedDifficulty === 'Easy') difficultyDropdown.style.color = '#48B572';
    if (window.selectedDifficulty === 'Medium') difficultyDropdown.style.color = '#B5A848';
    if (window.selectedDifficulty === 'Hard') difficultyDropdown.style.color = '#B54848';
  } else {
    difficultyDropdown.textContent = 'All';
    difficultyDropdown.style.color = '';
  }
  
  if (window.selectedCategory !== 'Types Of') {
    categoryDropdown.textContent = window.selectedCategory;
    categoryDropdown.style.color = '#61a9f1';
  } else {
    categoryDropdown.textContent = 'Types Of';
  }

  const handleDropdowns = () => {
    if (clickHandler) {
      document.removeEventListener('click', clickHandler);
    }

    clickHandler = function(e) {
      if (e.target.classList.contains('dropdown2')) {
        e.preventDefault();
        const menu = e.target.nextElementSibling;
        menu.classList.toggle('show');
      }

      // Close dropdowns when clicking outside
      if (!e.target.closest('.dropdown-container')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
          menu.classList.remove('show');
        });
      }

      // Handle filter selection
      if (e.target.classList.contains('dropdown-item')) {
        const dropdown = e.target.closest('.dropdown-container').querySelector('.dropdown2');

        const value = e.target.dataset.value;

        // Reset to default text color
        dropdown.style.color = '';

        // Set new text color (if difficulty)
        if (value === 'Easy') dropdown.style.color = '#48B572';
        if (value === 'Medium') dropdown.style.color = '#B5A848';
        if (value === 'Hard') dropdown.style.color = '#B54848';

        if (dropdown.id === 'type-dropdown' && value != 'Types Of') {
          dropdown.style.color = '#61a9f1'
        }

        // Update the button text
        dropdown.textContent = value;
        dropdown.nextElementSibling.classList.remove('show');

        // Update global filter state & persist to localStorage
        if (dropdown.id === "difficulty-dropdown") {
          window.selectedDifficulty = value;
          localStorage.setItem('selectedDifficulty', value); // SAVE TO LOCALSTORAGE
        } else if (dropdown.id === "type-dropdown") {
          window.selectedCategory = value;
          localStorage.setItem('selectedCategory', value);   // SAVE TO LOCALSTORAGE
        }

        filterProblems();
      }
    };

    document.addEventListener('click', clickHandler);
  };

  await fetchProblems();
  handleDropdowns();

  const onSignedIn = () => fetchProblems();

  window.addEventListener("userSignedIn", onSignedIn);

  // Cleanup function
  return () => {
    console.log('Cleaning up Dropdowns and Events');
    document.removeEventListener('click', clickHandler);
    window.removeEventListener("userSignedIn", onSignedIn);
    if(resetButton){
      resetButton.removeEventListener('click', resetHandler);
    }
    delete window.selectedDifficulty;
    delete window.selectedCategory;
  };
};

// Fetch problems from the backend
async function fetchProblems() {
  const problemsContainer = document.getElementById('problems-container');
  problemsContainer.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div></div>';

  try {
    await window.loadProblems();
    const problems = window.cachedProblems;

    renderProblems(problems);

    if (window.currentUser) {
      updateCompletedProblems();  
    }

    // Extract categories
    const categories = new Set();
    problems.forEach(problem => {
      if (problem.category) {
        problem.category.split(',').forEach(cat => categories.add(cat.trim()));
      }
    });

    generateCategoryDropdown(categories);

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

