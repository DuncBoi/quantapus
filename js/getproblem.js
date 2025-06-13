import renderMathInElement from 'https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/contrib/auto-render.mjs';

  const delimiters = [
    { left: '$$', right: '$$', display: true },
    { left: '$',  right: '$',  display: false },
    { left: '\\[', right: '\\]', display: true },
    { left: '\\(', right: '\\)', display: false }
  ];

  function goTo(offset) {
    const rd = window.__rd;
    rd.idx = Math.max(0, Math.min(rd.ids.length-1, rd.idx + offset));
    rd.currentId = rd.ids[rd.idx];
    sessionStorage.setItem('roadmapCtx', JSON.stringify(rd));
  
    history.pushState(null, '', `/problem?id=${rd.currentId}`);
  
    fetchProblemDetails(rd.currentId)
      .then(() => {
        wireHeaderButtons();
      });
  }

  function wireHeaderButtons() {
    const rd = window.__rd;
    if (rd.currentId === undefined) {
      rd.currentId = rd.ids[rd.idx];
    }
    rd.idx = rd.ids.findIndex(id => id === rd.currentId);
    if (rd.ids.length === 0) return;
    const total   = rd.ids.length;
    const current = rd.idx;
  
    const back  = document.getElementById('back-btn');
    const next  = document.getElementById('next-btn');
    const title = document.querySelector('.topic-name');
    const header = document.querySelector('.header-title')
    const prog  = document.querySelector('.progress-counter');
  
    // Show header now that we have context
    document.getElementById('problem-header-container').style.display = '';
    document.body.classList.add('with-header');
  
    // inject topic & (current/total)
    title.textContent = rd.topic;
    prog.textContent  = `(${current+1}/${total})`;
  
    // enable/disable
    back.disabled = current <= 0;
    next.disabled = current >= total - 1;
  
    // re-bind
    back.onclick  = () => goTo(-1);
    next.onclick  = () => goTo(+1);
    header.onclick = () => {
        const key = encodeURIComponent(window.__rd.topic);
        history.pushState(null, '', `/roadmap?open=${key}`);
        window.handleNavigation(`/roadmap?open=${key}`);
    }
  }
  

// Fetch the problem details from the backend
async function fetchProblemDetails(id) {
  const container = document.getElementById('problem-details');

  // Show loading spinner
  container.innerHTML = `<div class="loading-container"><div class="loading-spinner"></div></div>`;

  try {
      await window.loadProblems();
  } catch (error) {
      console.error('Error fetching problem details:', error);
      renderError('Failed to load problem details.');
  }
  const problem = window.problemMap?.[id];
    if (!problem) {
        console.error(`No problem found with id=${id}`);
        return renderError('Problem not found.');
    }

    document.title = problem.title || 'Quantapus';
    try {
        renderProblemDetails(problem);
    } catch (err) {
        console.error('Error rendering problem details:', err);
        return renderError('Failed to render problem details.');
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
                            <span class="checkmark large"></span>
                        </span>
                        <span class = "qp">QP</span>
                        <span class="problem-id" style="font-size: 3rem; "> #${problem.id}</span>
                        <span class="title-colon">:</span> ${problem.title || 'Untitled'}
                    </h1>
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
                        <p id="solution-code">
                             ${problem.solution} 
                        </p>

                        <!-- YouTube Link (Embedded Video) -->
                        ${problem.yt_link ? `
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
                        ` : ''}
                        <p id="explanation">${problem.explanation || 'No explanation available.'}</p>
                    </div>
                </div>
            `;

    renderMathInElement(problemDetailsContainer, { delimiters });

    wireHeaderButtons();

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
      
        if (index !== categories.length - 1) {
          categoryContainer.appendChild(document.createTextNode(' '));
        }
      });

    const checkmark = problemDetailsContainer.querySelector('.checkmark');
    const checkmarkBox = problemDetailsContainer.querySelector('.checkmark-box');

    updateProblemCompletion(problem.id);

    //toggle checkmark functionality
    checkmarkBox.addEventListener('click', (e) => {
      e.stopPropagation();
      const nowCompleted = window.toggleCompletion(problem.id);
      checkmark.classList.toggle('completed', nowCompleted);
    });

    //event listener on solution button
    const solutionButton = document.getElementById('solution-button');
    const solutionSection = document.getElementById('solution');
    solutionButton.addEventListener('click', () => {
        solutionSection.classList.toggle('hidden');
        solutionButton.textContent = solutionSection.classList.contains('hidden') ? 'Show Solution' : 'Hide Solution';
    });
}

function updateProblemCompletion(problemId) {
  const checkmark = document.querySelector('#problem-details .checkmark');
  if (!window.currentUser || !window.completedSet) {
    checkmark.classList.remove('completed');
    return;
  }
  checkmark.classList.toggle('completed', window.completedSet.has(Number(problemId)));
}

// Render an error message
function renderError(message) {
    const problemDetailsContainer = document.getElementById('problem-details');
    problemDetailsContainer.innerHTML = `<p style="color: red;">${message}</p>`;
}

window.initProblem = function(problemId) {
    const raw = sessionStorage.getItem('roadmapCtx');
    window.__rd = raw
        ? JSON.parse(raw)
        : { ids: [], idx: -1, topic: '' };

    if (problemId) {
        fetchProblemDetails(problemId);
    } else {
        renderError('No problem ID specified');
    }

    window.addEventListener('popstate', () => {
      const rd = window.__rd;
      const params = new URLSearchParams(window.location.search);
      const id     = parseInt(params.get('id'), 10);
      if (isNaN(id)) return;
    
      rd.currentId = id;
      rd.idx       = rd.ids.findIndex(x => x === id);
      sessionStorage.setItem('roadmapCtx', JSON.stringify(rd));
    
      fetchProblemDetails(rd.currentId)
        .then(wireHeaderButtons);
  });
  

    const onSignedIn = () => updateProblemCompletion(problemId);
    window.addEventListener("userSignedIn", onSignedIn);
    return () => {
        document.getElementById('problem-header-container').style.display = 'none';
        document.body.classList.remove('with-header');
        window.removeEventListener("userSignedIn", onSignedIn);
    };
};


