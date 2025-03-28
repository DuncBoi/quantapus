const BACKEND_URL = 'https://api.quantapus.com/problems';

window.initProblems = function() {
    console.log('Initializing problems...');
    fetchProblems(); // Your existing code
};

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