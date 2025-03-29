const BACKEND_URL = 'https://api.quantapus.com/problems';

window.initProblems = function() {

    let clickHandler = null;

    const handleDropdowns = () => {

        if (clickHandler) {
            document.removeEventListener('click', clickHandler);
        }

        clickHandler = function(e) {
            // Toggle dropdown menus
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
                
                // Set new text color
                if (value === 'Easy') dropdown.style.color = '#48B572';
                if (value === 'Medium') dropdown.style.color = '#B5A848';
                if (value === 'Hard') dropdown.style.color = '#B54848';
                
                dropdown.textContent = value;
                dropdown.nextElementSibling.classList.remove('show');

                // Update global filter state
                if (dropdown.id === "difficulty-dropdown") {
                    window.selectedDifficulty = value;
                } else if (dropdown.id === "type-dropdown") {
                    window.selectedCategory = value;
                }
                filterProblems();
            }
        };
    document.addEventListener('click', clickHandler);
    };
    window.selectedDifficulty = 'All';
    window.selectedCategory = 'Types Of';
    handleDropdowns();
    fetchProblems();

    // Cleanup function for SPA
    return () => {
        console.log('Cleaning up Dropdowns');
        document.removeEventListener('click', clickHandler);
        // Clear global state
        delete window.selectedDifficulty;
        delete window.selectedCategory;
    };
}

// Function to fetch problems from the backend
async function fetchProblems() {
    try {
        console.log('Fetching problems from:', BACKEND_URL);
        const response = await fetch(BACKEND_URL);
        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const problems = await response.json();
        console.log('Problems received:', problems);
        renderProblems(problems);

    } catch (error) {
        console.error('Error fetching problems:', error);
        renderError('Failed to load problems. Please try again later.');
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
        
        const show = difficultyMatch && categoryMatch
        if (show) anyFound = true;
        problemDiv.style.display = show ? 'flex' : 'none';
    });
    if (!anyFound){
        renderError("No Problems Found");
    }
}

// Function to render problems in the DOM
function renderProblems(problems) {
    const problemsContainer = document.getElementById('problems-container');
    problemsContainer.innerHTML = ''; // Clear existing content

    if (!problems || problems.length === 0) {
        problemsContainer.innerHTML = '<p>No problems found.</p>';
        return;
    }

    problems.forEach(problem => {
        const problemDiv = document.createElement('div');
        problemDiv.className = 'problem';
        problemDiv.setAttribute('data-category', problem.category || 'Unknown');

        // Create problem left container
        const problemLeft = document.createElement('div');
        problemLeft.className = 'problem-left';

        // Create problem ID
        const problemId = document.createElement('span');
        problemId.className = 'problem-id';
        problemId.textContent = `#${problem.id}`;

        // Create problem name
        const problemName = document.createElement('span');
        problemName.className = 'problem-name';
        problemName.textContent = problem.title || 'Untitled';

        // Append problem ID and name to the left container
        problemLeft.appendChild(problemId);
        problemLeft.appendChild(problemName);

        // Create problem difficulty
        const problemDifficulty = document.createElement('span');
        problemDifficulty.className = `problem-difficulty ${problem.difficulty ? problem.difficulty.toLowerCase() : 'unknown'}`;
        problemDifficulty.textContent = problem.difficulty || 'Unknown';

        // Append left section and difficulty
        problemDiv.appendChild(problemLeft);
        problemDiv.appendChild(problemDifficulty);

        // Append problem div to the container
        problemsContainer.appendChild(problemDiv);

        problemDiv.addEventListener('click', (e) => {
            e.preventDefault();
            const path = `/problem?id=${problem.id}`;
            window.handleNavigation(path);
        });
    });
}

// Function to render an error message
function renderError(message) {
    const problemsContainer = document.getElementById('problems-container');
    problemsContainer.innerHTML = `<p style="color: red;">${message}</p>`;
}