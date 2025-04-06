const BACKEND_URL = 'https://api.quantapus.com/problems';
const notyf = new Notyf();

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

window.initProblems = function() {
  let clickHandler = null;

  // --- RESTORE FILTERS FROM LOCAL STORAGE OR USE DEFAULTS ---
  window.selectedDifficulty = localStorage.getItem('selectedDifficulty') || 'All';
  window.selectedCategory = localStorage.getItem('selectedCategory') || 'Types Of';

  const difficultyDropdown = document.getElementById('difficulty-dropdown');
  const categoryDropdown = document.getElementById('type-dropdown');

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

  categoryDropdown.classList.remove('gradient-text');
  categoryDropdown.style.color = '';
  
  if (window.selectedCategory !== 'Types Of') {
    categoryDropdown.textContent = window.selectedCategory;
    categoryDropdown.classList.add('gradient-text');
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

        if (dropdown.id === 'type-dropdown') {
          dropdown.classList.remove('gradient-text');
          dropdown.style.color = '';
        
          if (value !== 'Types Of') {
            dropdown.classList.add('gradient-text');
          }
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

        // Apply filters immediately
        filterProblems();
      }
    };

    document.addEventListener('click', clickHandler);
  };

  handleDropdowns();
  fetchProblems();

  const onSignedOut = () => fetchProblems();
  const onSignedIn = () => fetchProblems();

  window.addEventListener("userSignedOut", onSignedOut);
  window.addEventListener("userSignedIn", onSignedIn);

  // Cleanup function
  return () => {
    console.log('Cleaning up Dropdowns and Events');
    document.removeEventListener('click', clickHandler);
    window.removeEventListener("userSignedOut", onSignedOut);
    window.removeEventListener("userSignedIn", onSignedIn);
    delete window.selectedDifficulty;
    delete window.selectedCategory;
  };
};

// Fetch problems from the backend
async function fetchProblems() {
  // loading spinner
  const problemsContainer = document.getElementById('problems-container');
  problemsContainer.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div></div>';
  try {
    console.log('Fetching problems from:', BACKEND_URL);
    const response = await fetch(BACKEND_URL);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const problems = await response.json();
    console.log('Problems received:', problems);

    renderProblems(problems);

    const categories = new Set();
    problems.forEach(problem => {
      if (problem.category) {
        problem.category.split(',').forEach(cat => categories.add(cat.trim()));
      }
    });

    generateCategoryDropdown(categories);

    if (window.currentUser) {
      updateCompletedProblems(window.currentUser.uid);
    }
  } catch (error) {
    console.error('Error fetching problems:', error);
    renderError('Failed to load problems. Please try again later.');
  }
}

async function fetchCompletedProblems(userId) {
  try {
    const response = await fetch(`https://api.quantapus.com/completed-problems?userId=${userId}`);
    return await response.json();
  } catch (error) {
    return [];
  }
}

async function updateCompletedProblems(userId) {
  try {
    const completedIds = await fetchCompletedProblems(userId);
    const completedSet = new Set(completedIds);

    // Update checkmarks without re-rendering
    document.querySelectorAll('.problem').forEach(problemDiv => {
      const problemId = Number(problemDiv.querySelector('.problem-id').textContent.replace("#", ""));
      const checkmark = problemDiv.querySelector('.checkmark');

      if (completedSet.has(problemId)) {
        checkmark.classList.add('completed');
      } else {
        checkmark.classList.remove('completed');
      }
    });
  } catch (error) {
    console.error('Error updating completed problems:', error);
  }
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
    if (show) anyFound = true;
    problemDiv.style.display = show ? 'flex' : 'none';
  });

  if (!anyFound) {
    renderError("No Problems Found");
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
    checkmarkBox.addEventListener('click', async (e) => {
      e.stopPropagation();
      const result = await toggleCompletion(problem.id);
      if (result) {
        checkmark.classList.toggle('completed');
      }
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
  const problemsContainer = document.getElementById('problems-container');
  problemsContainer.innerHTML = `<p style="color: red;">${message}</p>`;
}

async function toggleCompletion(problemId) {
  if (!window.currentUser) {
    notyf.error("Sign In to Track Progress");
    return;
  }
  const userId = window.currentUser.uid;
  try {
    const response = await fetch('https://api.quantapus.com/api/toggle-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, problemId })
    });
    if (!response.ok) throw new Error('Toggle failed');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}