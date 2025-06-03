const { ReactFlow, ReactFlowProvider, useReactFlow, Handle } = window.ReactFlow;
const notyf = new Notyf();

// 1. Custom Node Component
const CustomNode = ({ data }) => {
    return React.createElement('div', { 
        className: 'custom-node',
        style: { '--progress': `${data.progress || 0}%` }
    },
        React.createElement(Handle, { type: "target", position: "top", className: "react-flow__handle-top" }),
        React.createElement('div', { className: 'node-content' }, data.displayLabel ? data.displayLabel : data.label),
        React.createElement(Handle, { type: "source", position: "bottom", className: "react-flow__handle-bottom" })
    );
};

function updateSubcategoryBorders() {
    document.querySelectorAll('.subcategory-group').forEach(groupEl => {
      const problems = Array.from(
        groupEl.querySelectorAll('.problem')
      ).map(div => {
        return Number(div.querySelector('.problem-id').textContent.replace('#',''));
      });
        const allDone = problems.every(id => window.completedSet.has(id));
  
      groupEl.classList.toggle('completed', allDone);
    });
  }
  

// 2. Flow Component with Modal
function Flow() {
    const [selectedNode, setSelectedNode] = React.useState(null);
    const [problems, setProblems] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [nodes, setNodes] = React.useState(initialNodes); 
    const [completedCount, setCompletedCount] = React.useState(0);
    const [animate, setAnimate] = React.useState(false);

    const STORAGE_KEY = 'roadmapSubcatOpen';
    const initialOpen = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const [openMap, setOpenMap] = React.useState(initialOpen);

    const hasPushed = React.useRef(false);

    const closeModal = (justClose) => {
        setSelectedNode(null);
        const url = new URL(window.location);
        url.searchParams.delete('open');
        window.history.replaceState(null, '', url);        
      };

    React.useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(openMap));
      }, [openMap]);

      const handleToggle = subcat => event => {
        // event.target.open is the new boolean state
        setOpenMap(m => ({ ...m, [subcat]: event.target.open }));
      };

      React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const openName = params.get('open');
        if (openName) {
            const node = initialNodes.find(n => n.data.label === openName);
            if (node) loadNode(node);
            hasPushed.current = true;
        }
      
        // listen for back/forward navigation
        const onPopState = () => {
          const name = new URLSearchParams(window.location.search).get('open');
          if (name) {
            const node = initialNodes.find(n => n.data.label === name);
            if (node) loadNode(node);
          } else {
            closeModal();
          }
        };
      
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
      }, []);
      


    async function fetchProgress() {
        await window.loadProblems(); 
        if (!window.currentUser || !window.completedSet || !window.cachedProblems) {
            setNodes(prev =>
                prev.map(n => ({
                    ...n,
                    data: { ...n.data, progress: 0 }
                }))
            );
            return;
        }
    
        const updated = initialNodes.map(node => {
            const topic = node.data.label.toLowerCase();
    
            const problemsForNode = window.cachedProblems.filter(p => {
                return (p.roadmap || '').toLowerCase() === topic;
            });

            const total = problemsForNode.length;
            let completed = 0;
    
            for (const problem of problemsForNode) {
                if (window.completedSet.has(problem.id)) {
                    completed++;
                }
            }
    
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
            return {
                ...node,
                data: {
                    ...node.data,
                    progress
                }
            };
        });
    
        setNodes(updated);
    }    

    React.useEffect(() => {
        fetchProgress();
        const refresh = () => fetchProgress();
        window.addEventListener("refreshProgressInReactFlow", refresh);
        return () => window.removeEventListener("refreshProgressInReactFlow", refresh);
    }, []);

    React.useEffect(() => {
        if (!selectedNode) return;
        setAnimate(false);
        requestAnimationFrame(() => setAnimate(true));
      }, [selectedNode]);
      
      // B) initialize checkmarks & borders whenever the problem list changes
      React.useEffect(() => {
        if (!selectedNode) return;
      
        document.querySelectorAll('.problems-list .problem').forEach(problemDiv => {
          const id = Number(
            problemDiv.querySelector('.problem-id').textContent.replace('#','')
          );
          const checkmark = problemDiv.querySelector('.checkmark');
          checkmark.classList.toggle('completed', window.completedSet.has(id));
        });
      
        updateSubcategoryBorders();
      }, [selectedNode, problems]);

      async function loadNode(node) {
        setSelectedNode(node);
        setLoading(true);
        setError(null);
    
        try {    
            await window.loadProblems();

            const topic = node.data.label.toLowerCase();
    
            const problems = window.cachedProblems
                .filter(p => (p.roadmap || '').toLowerCase() === topic)
                .sort((a, b) => {
                // 1) sort by subcategory_order
                if (a.subcategory_order !== b.subcategory_order) {
                    return a.subcategory_order - b.subcategory_order;
                }
                // 2) if same subcategory, sort by your subcategory_rank
                return a.subcategory_rank - b.subcategory_rank;
            });

            setProblems(problems);
    
            // Calculate completed count directly from cached data
            const count = problems.reduce((acc, p) => (
                acc + (window.completedSet.has(p.id) ? 1 : 0)
            ), 0);
    
            setCompletedCount(count);
    
        } catch (err) {
            setError("Failed to Load Problems");
        } finally {
            setLoading(false);
        }
    }

    function openModal(node) {
        loadNode(node);
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('open', node.data.label);
        window.history.replaceState({ modalOpen: true }, '', newUrl);
      }
      
    const groupedProblems = React.useMemo(() => {
        return problems.reduce((acc, p) => {
        const sub = p.subcategory || 'Uncategorized';
        if (!acc[sub]) acc[sub] = [];
        acc[sub].push(p);
        return acc;
        }, {});
    }, [problems]);

    return React.createElement(React.Fragment, null,
        React.createElement(
            'div',
            {
              style: {
                position: 'absolute',
                top:    '75px',
                bottom: '-10px',      
                left:   0,
                right:  0              
            }
            },
        React.createElement(ReactFlow, {
            nodes: nodes,
            edges: initialEdges,
            nodeTypes: { customNode: CustomNode },
            fitView: true,
            minZoom: 0.4,
            maxZoom: 5, 
            onNodeClick: (e, node) => openModal(node)
        })),
        
        selectedNode && React.createElement('div', { 
            className: 'modal-overlay',
            onClick: () => closeModal(true)
        },
            React.createElement('div', { 
                className: `modal-content ${animate ? "animate-in" : ""}`,
                onClick: (e) => e.stopPropagation()
            },
                React.createElement('button', {
                    className: 'modal-close',
                    onClick: () => closeModal(true)
                }, 'X'),
                
                React.createElement(React.Fragment, null,
                    React.createElement('h1', { className: 'modal-title' }, selectedNode.data.label),
                
                    React.createElement('div', { className: 'modal-progress-container' },
                        React.createElement('div', { className: 'progress-label' }, `( ${completedCount} / ${problems.length} )`),
                        React.createElement('div', { className: 'progress-bar' },
                            React.createElement('div', { 
                                className: 'progress-bar-fill', 
                                style: { width: `${problems.length > 0 ? (completedCount / problems.length) * 100 : 0}%` } 
                            })
                        )
                    )
                ),                
                                
                React.createElement('div', { className: 'problems-list' },
                    (loading || problems === null) && React.createElement('div', { className: 'loading-container' },
                        React.createElement('div', { className: 'loading-spinner' })
                    ),
                    error && React.createElement('div', { className: 'error-message' }, error),
                    !loading && !error && problems.length === 0 && 
                        React.createElement('p', { className: 'empty-state' }, 'No problems found'),
                    
                    !loading && !error && Object.entries(groupedProblems).map(([subcat, group]) =>
                      React.createElement(
                        'details',
                        { key: subcat, className: 'subcategory-group', open: openMap[subcat] ?? true, onToggle: handleToggle(subcat)  },
                        React.createElement(
                          'summary',
                          { className: 'subcategory-header' },
                          subcat, 
                          React.createElement('span', { className: 'subcategory-check' }),
                        ),
                        group.map(problem =>
                            React.createElement('div', {
                                key: problem.id,
                                className: 'problem',
                                onClick: () => {
                                    const ctx = {
                                        ids:    problems.map(p => p.id),
                                        idx:    problems.findIndex(p => p.id === problem.id),
                                        topic:  selectedNode.data.label
                                    };

                                    sessionStorage.setItem('roadmapCtx', JSON.stringify(ctx));
                                    window.handleNavigation(`/problem?id=${problem.id}`)
                                }
                            },
                            React.createElement('div', { className: 'problem-left' },
                                React.createElement('div', { 
                                    className: 'checkmark-box',
                                    onClick: (e) => {
                                        e.stopPropagation();
                                        const checkmark = e.currentTarget.querySelector('.checkmark');
                                    
                                        const nowCompleted = window.toggleCompletion(problem.id);
                                        if (window.currentUser){
                                            checkmark.classList.toggle('completed', nowCompleted);
                                            setCompletedCount(prev => prev + (nowCompleted ? 1 : -1));

                                            updateSubcategoryBorders();
                                    
                                            // Immediately update node progress visually
                                            setNodes(prevNodes =>
                                                prevNodes.map(n => {
                                                    if (n.data.label.toLowerCase() === selectedNode.data.label.toLowerCase()) {
                                                        const total = problems.length;
                                                        const newCompleted = completedCount + (nowCompleted ? 1 : -1);
                                                        const progress = total > 0 ? Math.round((newCompleted / total) * 100) : 0;
                                    
                                                        return {
                                                            ...n,
                                                            data: { ...n.data, progress }
                                                        };
                                                    }
                                                    return n;
                                                })
                                            );
                                        }
                                    }                                                                       
                                },
                                    React.createElement('span', { 
                                        className: 'checkmark' + 
                                            (problem.completed ? ' completed' : '') 
                                    })
                                ),
                                React.createElement('span', { className: 'problem-id' }, `#${problem.id}`),
                                React.createElement('span', { className: 'problem-name' }, problem.title || 'Untitled')
                            ),
                            React.createElement('span', { 
                                className: `problem-difficulty ${problem.difficulty ? problem.difficulty.toLowerCase() : 'unknown'}`
                            }, problem.difficulty || 'Unknown')
                        )
                    )
                )
            ))
            )
        )
    )
}

// 3. Nodes Setup
const initialNodes = [
    { 
        id: '1', 
        type: 'customNode', 
        position: { x: 0, y: 100 }, 
        data: { label: 'Brainteasers' } 
    },
    { 
        id: '2', 
        type: 'customNode', 
        position: { x: -25, y: 400 }, 
        data: { label: 'Proofs' } 
    },
    { 
        id: '3', 
        type: 'customNode', 
        position: { x: 137.5, y: 250}, 
        data: { label: 'Sets' } 
    },
    { 
        id: '4', 
        type: 'customNode', 
        position: { x: 300, y: 400 }, 
        data: { label: 'Combinatorics' } 
    }, 
    { 
        id: '5', 
        type: 'customNode', 
        position: { x: -200, y: 550 }, 
        data: { label: 'Number Theory' } 
    },
    { 
        id: '6', 
        type: 'customNode', 
        position: { x: 50, y: 700 }, 
        data: { label: 'Discrete Distributions', displayLabel: 'Discrete Dists' } 
    },
    { 
        id: '7', 
        type: 'customNode', 
        position: { x: 400, y: 550 }, 
        data: { label: 'Combinatorics 2' } 
    },
    { 
        id: '8', 
        type: 'customNode', 
        position: { x: 200, y: 550 }, 
        data: { label: 'Conditional Probability', displayLabel: 'Conditional' } 
    },
    { 
        id: '9', 
        type: 'customNode', 
        position: { x: 350, y: 700 }, 
        data: { label: 'Moments' } 
    },
];

const initialEdges = [
    {
        id: 'e3-2',
        source: '3',
        target: '2',
        animated: true,
        style: { stroke: 'white', strokeWidth: 2.5 },
        markerEnd: { type: 'arrowclosed', color: 'white' }
    },
    {
        id: 'e1-3',
        source: '1',
        target: '3',
        animated: true,
        style: { stroke: 'white', strokeWidth: 2.5 },
        markerEnd: { type: 'arrowclosed', color: 'white' }
    },
    {
        id: 'e3-4',
        source: '3',
        target: '4',
        animated: true,
        style: { stroke: 'white', strokeWidth: 2.5 },
        markerEnd: { type: 'arrowclosed', color: 'white' }
    },
    {
        id: 'e2-5',
        source: '2',
        target: '5',
        animated: true,
        style: { stroke: 'white', strokeWidth: 2.5 },
        markerEnd: { type: 'arrowclosed', color: 'white' }
    },
    {
        id: 'e8-6',
        source: '8',
        target: '6',
        animated: true,
        style: { stroke: 'white', strokeWidth: 2.5 },
        markerEnd: { type: 'arrowclosed', color: 'white' }
    },
    {
        id: 'e4-8',
        source: '4',
        target: '8',
        animated: true,
        style: { stroke: 'white', strokeWidth: 2.5 },
        markerEnd: { type: 'arrowclosed', color: 'white' }
    },
    {
        id: 'e4-7',
        source: '4',
        target: '7',
        animated: true,
        style: { stroke: 'white', strokeWidth: 2.5 },
        markerEnd: { type: 'arrowclosed', color: 'white' }
    },
    {
        id: 'e2-8',
        source: '2',
        target: '8',
        animated: true,
        style: { stroke: 'white', strokeWidth: 2.5 },
        markerEnd: { type: 'arrowclosed', color: 'white' }
    },
    {
        id: 'e8-9',
        source: '8',
        target: '9',
        animated: true,
        style: { stroke: 'white', strokeWidth: 2.5 },
        markerEnd: { type: 'arrowclosed', color: 'white' }
    }
];

function App() {
    return React.createElement(ReactFlowProvider, null,
        React.createElement(Flow)
    );
}

let reactRoot = null;

// Initialize function
window.initRoadmap = function() {
    const container = document.getElementById('root');
    if (!container) return () => {};

    container.innerHTML = '';
    const reactRoot = ReactDOM.createRoot(container);
    reactRoot.render(React.createElement(App));

    const handleAuthChange = (event) => {
        const refreshEvent = new CustomEvent("refreshProgressInReactFlow");
        window.dispatchEvent(refreshEvent);
    };

    window.addEventListener("userSignedIn", handleAuthChange);

    return function cleanupRoadmap() {
        console.log('Cleaning up React Flow resources');

        reactRoot.unmount();

        window.removeEventListener("userSignedIn", handleAuthChange);

        if (window.reactFlowInstance) {
            window.reactFlowInstance.destroy();
            delete window.reactFlowInstance;
        }
    };
};

