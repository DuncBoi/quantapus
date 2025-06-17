import renderMathInElement from 'https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/contrib/auto-render.mjs';

  const delimiters = [
    { left: '$$', right: '$$', display: true },
    { left: '$',  right: '$',  display: false },
    { left: '\\[', right: '\\]', display: true },
    { left: '\\(', right: '\\)', display: false }
  ];

  function addInfoTooltips(container) {
    container.innerHTML = container.innerHTML.replace(
      /\[!info:([^\]]+)\]\(([^)]+)\)/g,
      (_, key, tip) => `
        <span class="info-term">
          ${key}
          <span class="tooltip-text">${tip}</span>
        </span>
      `
    );
  }

  function goTo(offset) {
    const rd = window.__rd;
    rd.idx = Math.max(0, Math.min(rd.ids.length - 1, rd.idx + offset));
    rd.currentId = rd.ids[rd.idx];

    const params = new URLSearchParams(location.search);
    params.set('id', rd.currentId);
    params.set('list', rd.listName);

    history.pushState(null, '', `/problem?${params.toString()}`);
    fetchProblemDetails(rd.currentId).then(() => wireHeaderButtons());
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
async function fetchProblemDetails(rawId) {
  const id = Number(rawId);

  const container = document.getElementById('problem-details');
  if (!container) return;
  container.innerHTML = `<div class="loading-container"><div class="loading-spinner"></div></div>`;

  try {
    await window.loadProblems();
  } catch (error) {
    console.error('Error fetching problem details:', error);
    return renderError('Failed to load problem details.');
  }

  const problem = window.problemMap?.[id];
  if (!problem) {
    console.error(`No problem found with id=${id}`);
    return renderError('Problem not found.');
  }

  const params = new URLSearchParams(location.search);
  let rawList = params.get('list');
  let listName = (rawList === 'roadmap' || rawList === 'all') ? rawList : 'roadmap';
  const selectedDifficulty   = params.get('difficulty') || 'All';
  const selectedCategory     = params.get('category')   || 'Types Of';
  const all                  = window.cachedProblems || [];

  if (
    listName === 'roadmap' &&
    (
      !problem.roadmap ||
      !all.some(p => p.roadmap === problem.roadmap)
    )
  ) {
    listName = 'all';
    params.set('list', 'all');
    history.replaceState(
      null,
      '',
      `${location.pathname}?${params.toString()}`
    );
  }

  let listProblems, topic;
  if (listName === 'roadmap') {
    listProblems = all.filter(p => p.roadmap === problem.roadmap);
    listProblems.sort((a, b) => {
      if (a.subcategory_order !== b.subcategory_order) {
        return a.subcategory_order - b.subcategory_order;
      }
      return a.subcategory_rank - b.subcategory_rank;
    });
    const raw = problem.roadmap || '';
    topic = raw.charAt(0).toUpperCase() + raw.slice(1);
  } else {
    listProblems = all.filter(p => {
      const diffMatch = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;
      const cats = (p.category || '').split(',').map(c => c.trim());
      const catMatch = selectedCategory === 'Types Of' || cats.includes(selectedCategory);
      return diffMatch && catMatch;
    });
    listProblems.sort((a, b) => a.id - b.id);
    topic = `${selectedDifficulty} ${selectedCategory} Problems `;
  }

  const ids = listProblems.map(p => p.id);
  const idx = ids.indexOf(id);
  window.__rd = { ids, idx, topic, listName };

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
                              <div id="yt-spinner"><div class="loading-spinner"></div> </div>
                                <iframe
                                    id="youtube-iframe"
                                    width="560"
                                    height="315"
                                    src="${problem.yt_link}?enablejsapi=1&origin=${location.origin}"
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

    addInfoTooltips(problemDetailsContainer);

    renderMathInElement(problemDetailsContainer, { delimiters });

    wireHeaderButtons();

    const iframe  = document.getElementById('youtube-iframe');
    const spinner = document.getElementById('yt-spinner');

  if (iframe && spinner) {  
    iframe.addEventListener('load', () => {
      spinner.style.display = 'none';
    });
  }

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
          const params = new URLSearchParams();
          params.set('category', cat);
          window.handleNavigation(`/problems?${params.toString()}`);
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
        const hiding = solutionSection.classList.toggle('hidden');
        solutionButton.textContent = hiding ? 'Show Solution' : 'Hide Solution';

        if (hiding) {
          const player = document.getElementById('youtube-iframe');
          if (player) {
            player.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'stopVideo', args: [] }),
              '*'
            );
          }
        }
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
  if (problemId) {
    fetchProblemDetails(problemId);
  } else {
    renderError('No problem ID specified');
  }

  const onSignedIn = () => updateProblemCompletion(problemId);
  window.addEventListener("userSignedIn", onSignedIn);

  return () => {
    document.getElementById('problem-header-container').style.display = 'none';
    document.body.classList.remove('with-header');
    window.removeEventListener("userSignedIn", onSignedIn);
  };
};