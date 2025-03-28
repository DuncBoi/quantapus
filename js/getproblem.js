// Fetch the problem details from the backend
async function fetchProblemDetails(id) {
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
                        <span class="qp-label">QP</span>
                        <span class="problem-id" style="font-size: 3rem; ">#${problem.id}</span>
                        <span class="title-colon">:</span> ${problem.title || 'Untitled'}
                    </h1>
                        <button class="back-button-inline">← Back</button>
                    </div>

                    <!-- Difficulty and Category -->
                    <div class="meta-info">
                        <span id="difficulty" class="difficulty ${problem.difficulty?.toLowerCase() || 'unknown'}">${problem.difficulty || 'Unknown'}</span>
                        <span id="category">${problem.category || 'Uncategorized'}</span>
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

window.initProblem = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const problemId = urlParams.get('id');
    
    if (problemId) {
        fetchProblemDetails(problemId);
    } else {
        renderError('No problem ID specified');
    }
};

