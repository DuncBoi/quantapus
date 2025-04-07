// Fetch the problem details from the backend
async function fetchProblemDetails(id) {
    const container = document.getElementById('problem-details');
    // loading spinner
    container.innerHTML = `<div class="loading-container"><div class="loading-spinner"></div></div>`;
    try {
        const response = await fetch(`https://api.quantapus.com/problems/${id}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const problem = await response.json();
        renderProblemDetails(problem);
    } catch (error) {
        console.error('Error fetching problem details:', error);
        renderError('Failed to load problem details. Please try again later.');
    }
}

// Render the problem details
function renderProblemDetails(problem) {
    const problemDetailsContainer = document.getElementById('problem-details');
    problemDetailsContainer.innerHTML = `
                <div class="problem-container">
                    <!-- Problem Title -->
                    <div class="title-container">
                    <h1 id="problem-title">
                            <span class="checkmark-box" style="margin-left: 5px; margin-right: 15px;">
                            <span class="checkmark" style="width: 32px; height: 32px; border-width: 3px;"></span>
                        </span>
                        <span class = "qp">QP</span>
                        <span class="problem-id" style="font-size: 3rem; "> #${problem.id}</span>
                        <span class="title-colon">:</span> ${problem.title || 'Untitled'}
                    </h1>
                        <button class="back-button-inline">← Back</button>
                    </div>

                    <!-- Difficulty and Category -->
                    <div class="meta-info">
                        <span id="difficulty" class="difficulty ${problem.difficulty?.toLowerCase() || 'unknown'}">${problem.difficulty || 'Unknown'}</span>
                        <span id="category-container"></span>
                    </div>

                    <!-- Problem Description -->
                    <div id="description" class="description">
                        <p>${problem.description || 'No description available.'}</p>
                    </div>

                    <!-- Solution Button -->
                    <button id="solution-button" class="solution-button">Show Solution</button>

                    <!-- Solution and Explanation (Hidden by Default) -->
                    <div id="solution" class="solution hidden">
                        <h2>Solution</h2>
                        <p id="solution-code">
                             ${problem.solution} 
                        </p>

                        <h2>Explanation</h2>
                        <p id="explanation">${problem.explanation || 'No explanation available.'}</p>

                        <!-- YouTube Link (Embedded Video) -->
                        <div id="youtube-link" class="youtube-container">
                            <iframe
                                width="560"
                                height="315"
                                src="${problem.yt_link}"
                                frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen>
                            </iframe>
                        </div>
                    </div>
                </div>
            `;

    MathJax.typeset();

    // Render comma-separated, clickable category tags
    const categoryContainer = document.getElementById('category-container');
    const rawCategory = problem.category || 'Uncategorized';
    const categories = rawCategory.split(',').map(cat => cat.trim());

    categoryContainer.innerHTML = ''; // Clear existing

    categories.forEach((cat, index) => {
        const span = document.createElement('span');
        // Add comma inside span if not last item
        span.textContent = index !== categories.length - 1 ? `${cat},` : cat;
        span.classList.add('clickable-tag');
        span.setAttribute('data-value', cat);
      
        span.addEventListener('click', () => {
          localStorage.setItem('selectedCategory', cat);
          localStorage.removeItem('selectedDifficulty');
          window.handleNavigation('/problems');
        });
      
        categoryContainer.appendChild(span);
      
        // Add a space *after* the span (not before the comma)
        if (index !== categories.length - 1) {
          categoryContainer.appendChild(document.createTextNode(' '));
        }
      });

    const checkmark = problemDetailsContainer.querySelector('.checkmark');
    const checkmarkBox = problemDetailsContainer.querySelector('.checkmark-box');

    function checkCompletionStatus(){
        fetch(`https://api.quantapus.com/completed-problems/check?userId=${window.currentUser.uid}&problemId=${problem.id}`)
            .then(response => response.json())
            .then(data => {
                if (data.completed) {
                    checkmark.classList.add('completed');
                }
            })
            .catch(error => console.error('Completion check failed:', error));
    }

    if (window.currentUser) {
        requestAnimationFrame(() => {
            checkCompletionStatus();
        });
    }

    // Add toggle functionality
    checkmarkBox.addEventListener('click', async (e) => {
        e.stopPropagation();
        const result = await toggleCompletion(problem.id);
        if (result) {
            checkmark.classList.toggle('completed');
        }
    });

    // Add event listener to the solution button
    const solutionButton = document.getElementById('solution-button');
    const solutionSection = document.getElementById('solution');
    solutionButton.addEventListener('click', () => {
        solutionSection.classList.toggle('hidden');
        solutionButton.textContent = solutionSection.classList.contains('hidden') ? 'Show Solution' : 'Hide Solution';
        MathJax.typeset();
    });

    const backButton = document.querySelector('.back-button-inline');
    backButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.history.back(); // Use browser history
    });
}

// Render an error message
function renderError(message) {
    const problemDetailsContainer = document.getElementById('problem-details');
    problemDetailsContainer.innerHTML = `<p style="color: red;">${message}</p>`;
}

async function toggleCompletion(problemId) {
    if (!window.currentUser){
        notyf.error("Sign In to Track Progress");
        return false;
    }
    userId = window.currentUser.uid;
    try {
      const response = await fetch('https://api.quantapus.com/toggle-complete', {
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

window.initProblem = function(problemId) {
    if (problemId) {
        fetchProblemDetails(problemId);
    } else {
        renderError('No problem ID specified');
    }

    const onSignedOut = () => fetchProblemDetails(problemId);
    const onSignedIn = () => fetchProblemDetails(problemId);

    // Register listeners
    window.addEventListener("userSignedOut", onSignedOut);
    window.addEventListener("userSignedIn", onSignedIn);

    // Return proper cleanup function
    return () => {
        window.removeEventListener("userSignedOut", onSignedOut);
        window.removeEventListener("userSignedIn", onSignedIn);
    };
    
};

